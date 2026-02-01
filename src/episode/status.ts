import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { parseMetadata, parseCoveredPosts } from './schema.js';
import {
  getEpisodesDir,
  getEpisodeDir,
  getCoveredPostsPath,
  deriveEpisodeStatus,
  type EpisodeStatus,
} from './utils.js';

export interface EpisodeStatusInfo {
  episode: number;
  title: string;
  date: string;
  status: EpisodeStatus;
  postCount: number;
  covered: boolean;
  speakerCount?: number;
}

/**
 * Get status info for a single episode
 */
export function getEpisodeStatus(projectRoot: string, episodeNumber: number): EpisodeStatusInfo {
  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const metadataPath = join(episodeDir, 'metadata.json');

  if (!existsSync(metadataPath)) {
    throw new Error(`Episode ${episodeNumber} not found`);
  }

  const metadata = parseMetadata(readFileSync(metadataPath, 'utf-8'));
  const status = deriveEpisodeStatus(episodeDir, projectRoot);

  // Check if posts are covered
  const coveredPostsPath = getCoveredPostsPath(projectRoot);
  let covered = false;
  if (existsSync(coveredPostsPath) && metadata.postIds.length > 0) {
    const coveredPosts = parseCoveredPosts(readFileSync(coveredPostsPath, 'utf-8'));
    // Episode is covered if all its posts are in covered-posts.json
    covered = metadata.postIds.every((id) => id in coveredPosts);
  }

  return {
    episode: metadata.episode,
    title: metadata.title,
    date: metadata.date,
    status,
    postCount: metadata.postIds.length,
    covered,
    speakerCount: metadata.speakerCount,
  };
}

/**
 * Get status info for all episodes
 */
export function getAllEpisodesStatus(projectRoot: string): EpisodeStatusInfo[] {
  const episodesDir = getEpisodesDir(projectRoot);

  if (!existsSync(episodesDir)) {
    return [];
  }

  const entries = readdirSync(episodesDir);
  const episodeNums = entries
    .filter((entry) => {
      const path = join(episodesDir, entry);
      return statSync(path).isDirectory() && /^\d{3}$/.test(entry);
    })
    .map((entry) => parseInt(entry, 10))
    .sort((a, b) => a - b);

  return episodeNums.map((num) => getEpisodeStatus(projectRoot, num));
}

/**
 * Format status output for CLI
 */
export function formatStatusOutput(statuses: EpisodeStatusInfo[]): string {
  if (statuses.length === 0) {
    return 'No episodes found.';
  }

  const lines: string[] = [];
  for (const s of statuses) {
    const coveredMark = s.covered ? '✓' : '○';
    const speakerInfo = s.speakerCount ? ` | ${s.speakerCount} speakers` : '';
    lines.push(
      `${s.episode.toString().padStart(3, '0')} [${s.status.padEnd(11)}] ${coveredMark} ${s.title} (${s.postCount} posts${speakerInfo})`
    );
  }
  return lines.join('\n');
}
