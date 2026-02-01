#!/usr/bin/env node
import { program } from 'commander';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';
import { scrapeDaily } from './scraper/daily.js';
import { generateReport } from './report/markdown.js';

program
  .name('moltbook-report')
  .description('Generate NotebookLM-friendly reports from Moltbook')
  .version('1.0.0')
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

program.parse();
