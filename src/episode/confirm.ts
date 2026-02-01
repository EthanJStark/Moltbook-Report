import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parseMetadata, parseCoveredPosts } from './schema.js';
import { getEpisodeDir, getCoveredPostsPath } from './utils.js';

export interface ConfirmEpisodeOptions {
  projectRoot: string;
  episodeNumber: number;
  verbose?: boolean;
}

/**
 * Confirm an episode by marking its posts as covered
 * Requires audio.mp3 to exist
 */
export async function confirmEpisode(options: ConfirmEpisodeOptions): Promise<void> {
  const { projectRoot, episodeNumber, verbose } = options;

  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const audioPath = join(episodeDir, 'audio.mp3');
  const metadataPath = join(episodeDir, 'metadata.json');

  // Verify audio exists
  if (!existsSync(audioPath)) {
    throw new Error(`audio.mp3 not found for episode ${episodeNumber}. Add audio before confirming.`);
  }

  // Load metadata
  if (!existsSync(metadataPath)) {
    throw new Error(`metadata.json not found for episode ${episodeNumber}`);
  }

  const metadata = parseMetadata(readFileSync(metadataPath, 'utf-8'));

  // Load existing covered posts
  const coveredPostsPath = getCoveredPostsPath(projectRoot);
  let coveredPosts: Record<string, number> = {};
  if (existsSync(coveredPostsPath)) {
    coveredPosts = parseCoveredPosts(readFileSync(coveredPostsPath, 'utf-8'));
  }

  // Add this episode's posts
  for (const postId of metadata.postIds) {
    coveredPosts[postId] = episodeNumber;
  }

  // Save
  writeFileSync(coveredPostsPath, JSON.stringify(coveredPosts, null, 2));

  if (verbose) {
    console.log(`Marked ${metadata.postIds.length} posts as covered for episode ${episodeNumber}`);
  }
}
