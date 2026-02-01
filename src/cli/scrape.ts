import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { MoltbookClient } from '../api/client.js';

export interface ScrapeOptions {
  client: MoltbookClient;
  limit: number;
  output: string;
  verbose: boolean;
}

export async function scrapeCommand(options: ScrapeOptions): Promise<void> {
  const { client, limit, output, verbose } = options;

  if (verbose) {
    console.log(`Scraping ${limit} posts from Moltbook...`);
  }

  // Fetch from both hot and top feeds, then deduplicate
  const hotResponse = await client.getPosts('hot', limit, 0);
  const topResponse = await client.getPosts('top', limit, 0);

  // Deduplicate by post ID
  const seenIds = new Set<string>();
  const posts = [];

  for (const post of [...hotResponse.posts, ...topResponse.posts]) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      posts.push(post);
    }
  }

  // Take only up to limit posts
  const finalPosts = posts.slice(0, limit);

  if (verbose) {
    console.log(`Fetched ${finalPosts.length} posts (${hotResponse.posts.length} hot, ${topResponse.posts.length} top, deduplicated)`);
  }

  // Create output directory if needed
  const outputDir = dirname(output);
  await mkdir(outputDir, { recursive: true });

  // Write to JSON file
  const jsonContent = JSON.stringify({ posts: finalPosts }, null, 2);
  await writeFile(output, jsonContent, 'utf-8');

  if (verbose) {
    console.log(`Saved to ${output}`);
  }
}
