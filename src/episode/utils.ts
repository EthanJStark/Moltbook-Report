import { existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

export type EpisodeStatus = 'draft' | 'recorded' | 'transcribed' | 'published';

/**
 * Get the episodes source directory path
 */
export function getEpisodesDir(projectRoot: string): string {
  return join(projectRoot, 'episodes');
}

/**
 * Get a specific episode directory path
 */
export function getEpisodeDir(projectRoot: string, episodeNum: number): string {
  return join(getEpisodesDir(projectRoot), formatEpisodeNumber(episodeNum));
}

/**
 * Get the docs episode directory path (for publishing)
 */
export function getDocsEpisodeDir(projectRoot: string, episodeNum: number): string {
  return join(projectRoot, 'docs', 'episodes', formatEpisodeNumber(episodeNum));
}

/**
 * Format episode number as zero-padded 3-digit string
 */
export function formatEpisodeNumber(num: number): string {
  return num.toString().padStart(3, '0');
}

/**
 * Get next episode number (max existing + 1, or 1 if none)
 */
export function getNextEpisodeNumber(episodesDir: string): number {
  if (!existsSync(episodesDir)) {
    return 1;
  }

  const entries = readdirSync(episodesDir);
  const episodeNums = entries
    .filter((entry) => {
      const path = join(episodesDir, entry);
      return statSync(path).isDirectory() && /^\d{3}$/.test(entry);
    })
    .map((entry) => parseInt(entry, 10));

  if (episodeNums.length === 0) {
    return 1;
  }

  return Math.max(...episodeNums) + 1;
}

/**
 * Derive episode status from file existence
 */
export function deriveEpisodeStatus(episodeDir: string, projectRoot: string): EpisodeStatus {
  const episodeNum = parseInt(basename(episodeDir), 10);
  const docsEpisodeDir = getDocsEpisodeDir(projectRoot, episodeNum);

  const hasAudio = existsSync(join(episodeDir, 'audio.mp3'));
  const hasTranscript = existsSync(join(episodeDir, 'transcript.json'));
  const isPublished = existsSync(docsEpisodeDir);

  if (isPublished && hasTranscript) {
    return 'published';
  }
  if (hasTranscript) {
    return 'transcribed';
  }
  if (hasAudio) {
    return 'recorded';
  }
  return 'draft';
}

/**
 * Path to covered-posts.json
 */
export function getCoveredPostsPath(projectRoot: string): string {
  return join(getEpisodesDir(projectRoot), 'covered-posts.json');
}

/**
 * Path to context directory
 */
export function getContextDir(projectRoot: string): string {
  return join(projectRoot, 'context');
}
