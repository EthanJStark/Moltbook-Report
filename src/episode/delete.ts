import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { parseMetadata, parseCoveredPosts } from './schema.js';
import { getEpisodeDir, getCoveredPostsPath, getDocsEpisodeDir } from './utils.js';

export interface DeleteEpisodeOptions {
  projectRoot: string;
  episodeNumber: number;
  force?: boolean;
  verbose?: boolean;
}

/**
 * Delete an episode and optionally remove posts from covered manifest
 */
export async function deleteEpisode(options: DeleteEpisodeOptions): Promise<void> {
  const { projectRoot, episodeNumber, force = false, verbose } = options;

  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const metadataPath = join(episodeDir, 'metadata.json');

  if (!existsSync(episodeDir)) {
    throw new Error(`Episode ${episodeNumber} not found`);
  }

  // Load metadata to get post IDs
  let postIds: string[] = [];
  if (existsSync(metadataPath)) {
    const metadata = parseMetadata(readFileSync(metadataPath, 'utf-8'));
    postIds = metadata.postIds;
  }

  // Check if posts are covered
  const coveredPostsPath = getCoveredPostsPath(projectRoot);
  let coveredPosts: Record<string, number> = {};
  if (existsSync(coveredPostsPath)) {
    coveredPosts = parseCoveredPosts(readFileSync(coveredPostsPath, 'utf-8'));
  }

  const coveredPostIds = postIds.filter((id) => id in coveredPosts);

  if (coveredPostIds.length > 0 && !force) {
    throw new Error(
      `Posts already marked covered. Use --force to remove. Affected: ${coveredPostIds.join(', ')}`
    );
  }

  // Remove posts from covered manifest if --force
  if (coveredPostIds.length > 0 && force) {
    for (const id of postIds) {
      delete coveredPosts[id];
    }
    writeFileSync(coveredPostsPath, JSON.stringify(coveredPosts, null, 2));
    if (verbose) {
      console.log(`Removed ${postIds.length} posts from covered-posts.json`);
    }
  }

  // Delete episode directory
  rmSync(episodeDir, { recursive: true });
  if (verbose) {
    console.log(`Deleted episodes/${episodeNumber.toString().padStart(3, '0')}/`);
  }

  // Delete docs directory if published
  const docsEpisodeDir = getDocsEpisodeDir(projectRoot, episodeNumber);
  if (existsSync(docsEpisodeDir)) {
    rmSync(docsEpisodeDir, { recursive: true });
    if (verbose) {
      console.log(`Deleted docs/episodes/${episodeNumber.toString().padStart(3, '0')}/`);
    }
    // Note: Updating docs/index.html and feed.xml left for future enhancement
  }
}
