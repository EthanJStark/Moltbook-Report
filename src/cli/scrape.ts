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

  // Fetch posts
  const posts = await client.getPosts('both', limit, 0);

  if (verbose) {
    console.log(`Fetched ${posts.length} posts`);
  }

  // Create output directory if needed
  const outputDir = dirname(output);
  await mkdir(outputDir, { recursive: true });

  // Write to JSON file
  const jsonContent = JSON.stringify({ posts }, null, 2);
  await writeFile(output, jsonContent, 'utf-8');

  if (verbose) {
    console.log(`Saved to ${output}`);
  }
}
