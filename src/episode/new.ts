import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';
import { scrapeDaily, type ScrapedPost } from '../scraper/daily.js';
import { generateReport } from '../report/markdown.js';
import { parseCoveredPosts, type EpisodeMetadata } from './schema.js';
import {
  getEpisodesDir,
  getEpisodeDir,
  getCoveredPostsPath,
  getContextDir,
  getNextEpisodeNumber,
  formatEpisodeNumber,
} from './utils.js';

export interface CreateEpisodeOptions {
  projectRoot: string;
  limit: number;
  title?: string;
  verbose?: boolean;
}

export interface CreateEpisodeResult {
  episodeNumber: number;
  episodeDir: string;
  postIds: string[];
  title: string;
}

const CONTEXT_FILES = [
  'moltbook-overview.md',
  'moltbook-origins-launch.md',
  'key-agents.md',
  'notebooklm-guide.md',
];

/**
 * Create a new episode with scraped posts
 */
export async function createEpisode(options: CreateEpisodeOptions): Promise<CreateEpisodeResult> {
  const { projectRoot, limit, verbose } = options;

  // Ensure episodes directory exists
  const episodesDir = getEpisodesDir(projectRoot);
  if (!existsSync(episodesDir)) {
    mkdirSync(episodesDir, { recursive: true });
  }

  // Load covered posts
  const coveredPostsPath = getCoveredPostsPath(projectRoot);
  let coveredPosts: Record<string, number> = {};
  if (existsSync(coveredPostsPath)) {
    const content = readFileSync(coveredPostsPath, 'utf-8');
    coveredPosts = parseCoveredPosts(content);
  }

  if (verbose) {
    console.log(`Loaded ${Object.keys(coveredPosts).length} covered posts`);
  }

  // Fetch posts (fetch extra to account for filtering)
  const fetchLimit = Math.min(limit * 2, 100);
  const allPosts = await scrapeDaily({
    limit: fetchLimit,
    sort: 'top',
    maxComments: 10,
    maxDepth: 3,
    verbose,
  });

  // Filter out covered posts
  const uncoveredPosts = allPosts.filter((post) => !coveredPosts[post.id]);

  if (verbose) {
    console.log(`Found ${uncoveredPosts.length} uncovered posts (needed: ${limit})`);
  }

  // Take only the requested limit
  const selectedPosts = uncoveredPosts.slice(0, limit);

  if (selectedPosts.length < limit) {
    console.warn(
      `Warning: Only ${selectedPosts.length} uncovered posts available (requested ${limit})`
    );
  }

  // Determine episode number and create directory
  const episodeNumber = getNextEpisodeNumber(episodesDir);
  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const notebooklmDir = join(episodeDir, 'notebooklm');

  mkdirSync(notebooklmDir, { recursive: true });

  // Generate title
  const title = options.title || `Episode ${episodeNumber}`;
  const date = format(new Date(), 'yyyy-MM-dd');

  // Create metadata
  const metadata: EpisodeMetadata = {
    episode: episodeNumber,
    title,
    date,
    postIds: selectedPosts.map((p) => p.id),
  };

  writeFileSync(join(episodeDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

  // Copy context files to notebooklm folder
  const contextDir = getContextDir(projectRoot);
  for (const file of CONTEXT_FILES) {
    const src = join(contextDir, file);
    const dest = join(notebooklmDir, file);
    if (existsSync(src)) {
      copyFileSync(src, dest);
    } else if (verbose) {
      console.warn(`Context file not found: ${file}`);
    }
  }

  // Generate episode posts markdown
  const episodePostsFilename = `episode-${formatEpisodeNumber(episodeNumber)}-posts.md`;
  const report = generateReport(selectedPosts, { sort: 'top', limit });
  writeFileSync(join(notebooklmDir, episodePostsFilename), report);

  return {
    episodeNumber,
    episodeDir,
    postIds: metadata.postIds,
    title,
  };
}
