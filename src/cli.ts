#!/usr/bin/env node
import { program } from 'commander';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';
import { scrapeDaily } from './scraper/daily.js';
import { generateReport } from './report/markdown.js';
import { scrapeCommand } from './cli/scrape.js';
import { filterCommand } from './cli/filter.js';
import { MoltbookClient } from './api/client.js';
import {
  createEpisode,
  confirmEpisode,
  deleteEpisode,
  transcribeEpisode,
  publishEpisode,
  getEpisodeStatus,
  getAllEpisodesStatus,
  formatStatusOutput,
  formatEpisodeNumber,
} from './episode/index.js';

// Helper to get project root (where package.json is)
function getProjectRoot(): string {
  return process.cwd();
}

program
  .name('moltbook-report')
  .description('Generate NotebookLM-friendly reports from Moltbook')
  .version('1.0.0');

// Default command (backward compatible)
program
  .option('-l, --limit <number>', 'Number of posts per feed', '25')
  .option('-s, --sort <type>', 'Feed to scrape: hot, top, or both', 'both')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('--max-comments <number>', 'Max comments per post', '10')
  .option('--max-depth <number>', 'Max comment reply depth', '3')
  .option('-v, --verbose', 'Show progress output')
  .action(async (options) => {
    try {
      const limit = parseInt(options.limit, 10);
      const maxComments = parseInt(options.maxComments, 10);
      const maxDepth = parseInt(options.maxDepth, 10);
      const sort = options.sort as 'hot' | 'top' | 'both';

      if (!['hot', 'top', 'both'].includes(sort)) {
        console.error('Error: --sort must be hot, top, or both');
        process.exit(1);
      }

      console.log(`Fetching ${sort} posts (limit: ${limit})...`);

      const posts = await scrapeDaily({
        limit,
        sort,
        maxComments,
        maxDepth,
        verbose: options.verbose,
      });

      console.log(`Scraped ${posts.length} posts with comments`);

      const report = generateReport(posts, { sort, limit });

      // Ensure output directory exists
      if (!existsSync(options.output)) {
        mkdirSync(options.output, { recursive: true });
      }

      const filename = `moltbook-${format(new Date(), 'yyyy-MM-dd')}.md`;
      const filepath = join(options.output, filename);

      writeFileSync(filepath, report);
      console.log(`Report saved to: ${filepath}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Scrape command
program
  .command('scrape')
  .description('Scrape posts from Moltbook and save to JSON file')
  .option('--limit <number>', 'Number of posts to fetch', '250')
  .option('--output <path>', 'Output file path', 'output/scraped-posts.json')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    const client = new MoltbookClient();
    const limit = parseInt(options.limit, 10);

    await scrapeCommand({
      client,
      limit,
      output: options.output,
      verbose: options.verbose
    });

    console.log(`✓ Scraped ${limit} posts to ${options.output}`);
  });

// Filter command
program
  .command('filter')
  .description('Filter scraped posts by theme keywords')
  .requiredOption('--theme <name>', 'Theme name (security, identity)')
  .requiredOption('--input <path>', 'Input JSON file from scrape command')
  .option('--output <path>', 'Output file path (default: filtered-{theme}.json)')
  .option('--limit <number>', 'Maximum number of posts to return', '10')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    const theme = options.theme as 'security' | 'identity';
    const output = options.output || `filtered-${theme}.json`;
    const limit = parseInt(options.limit, 10);

    if (!['security', 'identity'].includes(theme)) {
      console.error('Error: theme must be "security" or "identity"');
      process.exit(1);
    }

    await filterCommand({
      theme,
      input: options.input,
      output,
      limit,
      verbose: options.verbose
    });

    console.log(`✓ Filtered ${limit} posts to ${output}`);
  });

// Episode subcommand group
const episode = program.command('episode').description('Manage podcast episodes');

// episode new
episode
  .command('new')
  .description('Create a new episode from uncovered posts')
  .option('-l, --limit <number>', 'Number of posts to include', '10')
  .option('-t, --title <title>', 'Episode title')
  .option('-v, --verbose', 'Show progress output')
  .action(async (options) => {
    try {
      const result = await createEpisode({
        projectRoot: getProjectRoot(),
        limit: parseInt(options.limit, 10),
        title: options.title,
        verbose: options.verbose,
      });

      const episodeNum = formatEpisodeNumber(result.episodeNumber);
      console.log(`Episode ${episodeNum} created: ${result.title}`);
      console.log(`Posts included: ${result.postIds.length}`);
      console.log(`\nUpload contents of episodes/${episodeNum}/notebooklm/ to NotebookLM.`);
      console.log(`Run \`episode confirm ${result.episodeNumber}\` after adding audio.mp3 to mark posts as covered.`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// episode confirm
episode
  .command('confirm <episode-number>')
  .description('Mark episode posts as covered (requires audio.mp3)')
  .option('-v, --verbose', 'Show progress output')
  .action(async (episodeNumber, options) => {
    try {
      await confirmEpisode({
        projectRoot: getProjectRoot(),
        episodeNumber: parseInt(episodeNumber, 10),
        verbose: options.verbose,
      });

      console.log(`Episode ${episodeNumber} confirmed. Posts marked as covered.`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// episode delete
episode
  .command('delete <episode-number>')
  .description('Delete an episode')
  .option('-f, --force', 'Remove posts from covered-posts.json')
  .option('-v, --verbose', 'Show progress output')
  .action(async (episodeNumber, options) => {
    try {
      await deleteEpisode({
        projectRoot: getProjectRoot(),
        episodeNumber: parseInt(episodeNumber, 10),
        force: options.force,
        verbose: options.verbose,
      });

      console.log(`Episode ${episodeNumber} deleted.`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// episode transcribe
episode
  .command('transcribe <episode-number>')
  .description('Transcribe episode audio with speaker diarization')
  .option('--timeout <seconds>', 'Transcription timeout in seconds', '600')
  .option('-v, --verbose', 'Show progress output')
  .action(async (episodeNumber, options) => {
    try {
      const result = await transcribeEpisode({
        projectRoot: getProjectRoot(),
        episodeNumber: parseInt(episodeNumber, 10),
        timeout: parseInt(options.timeout, 10),
        verbose: options.verbose,
      });

      console.log(`Transcription complete for episode ${episodeNumber}. Found ${result.speakerCount} speakers.`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// episode publish
episode
  .command('publish <episode-number>')
  .description('Publish episode to docs/ for GH Pages')
  .option('-v, --verbose', 'Show progress output')
  .action(async (episodeNumber, options) => {
    try {
      await publishEpisode({
        projectRoot: getProjectRoot(),
        episodeNumber: parseInt(episodeNumber, 10),
        verbose: options.verbose,
      });

      const episodeNum = formatEpisodeNumber(parseInt(episodeNumber, 10));
      console.log(`Episode ${episodeNumber} published to docs/episodes/${episodeNum}/`);
      console.log(`Run \`git add docs/ episodes/ && git commit && git push\` to deploy.`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// episode status
episode
  .command('status [episode-number]')
  .description('Show episode status')
  .action(async (episodeNumber) => {
    try {
      const projectRoot = getProjectRoot();

      if (episodeNumber) {
        const status = getEpisodeStatus(projectRoot, parseInt(episodeNumber, 10));
        console.log(formatStatusOutput([status]));
      } else {
        const statuses = getAllEpisodesStatus(projectRoot);
        console.log(formatStatusOutput(statuses));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
