// src/episode/publish.ts
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { parseMetadata } from './schema.js';
import { getEpisodeDir, getDocsEpisodeDir, formatEpisodeNumber } from './utils.js';
import { getAllEpisodesStatus } from './status.js';
import {
  generateEpisodePage,
  generateTranscriptPage,
  generateIndexPage,
  generateRssFeed,
  type TranscriptSegment,
} from '../templates/index.js';

const DEFAULT_BASE_URL = 'https://ethanjstark.github.io/moltbook-podcast/';

export interface PublishEpisodeOptions {
  projectRoot: string;
  episodeNumber: number;
  baseUrl?: string;
  verbose?: boolean;
}

/**
 * Check prerequisites before publishing
 */
export function checkPublishPrerequisites(projectRoot: string, episodeNumber: number): void {
  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const transcriptPath = join(episodeDir, 'transcript.json');
  const audioPath = join(episodeDir, 'audio.mp3');
  const docsEpisodeDir = getDocsEpisodeDir(projectRoot, episodeNumber);

  if (!existsSync(transcriptPath)) {
    throw new Error(`Not transcribed. Run \`episode transcribe ${episodeNumber}\` first.`);
  }

  if (!existsSync(audioPath)) {
    throw new Error(`audio.mp3 not found for episode ${episodeNumber}`);
  }

  if (existsSync(docsEpisodeDir)) {
    throw new Error(
      `Already published. Delete docs/episodes/${formatEpisodeNumber(episodeNumber)}/ to re-publish.`
    );
  }
}

/**
 * Publish an episode to docs/ for GH Pages
 */
export async function publishEpisode(options: PublishEpisodeOptions): Promise<void> {
  const { projectRoot, episodeNumber, verbose } = options;
  const baseUrl = options.baseUrl || process.env.PODCAST_BASE_URL || DEFAULT_BASE_URL;

  checkPublishPrerequisites(projectRoot, episodeNumber);

  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const docsEpisodeDir = getDocsEpisodeDir(projectRoot, episodeNumber);
  const docsDir = join(projectRoot, 'docs');

  // Create docs directories
  mkdirSync(docsEpisodeDir, { recursive: true });

  // Load metadata and transcript
  const metadata = parseMetadata(readFileSync(join(episodeDir, 'metadata.json'), 'utf-8'));
  const transcript = JSON.parse(readFileSync(join(episodeDir, 'transcript.json'), 'utf-8'));

  // Copy audio
  copyFileSync(join(episodeDir, 'audio.mp3'), join(docsEpisodeDir, 'audio.mp3'));
  if (verbose) {
    console.log('Copied audio.mp3');
  }

  // Generate episode page
  const episodeHtml = generateEpisodePage({
    episode: metadata.episode,
    title: metadata.title,
    date: metadata.date,
    baseUrl,
  });
  writeFileSync(join(docsEpisodeDir, 'index.html'), episodeHtml);
  if (verbose) {
    console.log('Generated index.html');
  }

  // Generate transcript page
  const segments: TranscriptSegment[] = (transcript.segments || []).map(
    (seg: { speaker?: string; text?: string; start?: number; end?: number }) => ({
      speaker: seg.speaker || 'SPEAKER_00',
      text: seg.text || '',
      start: seg.start || 0,
      end: seg.end || 0,
    })
  );

  const transcriptHtml = generateTranscriptPage({
    episode: metadata.episode,
    title: metadata.title,
    segments,
  });
  writeFileSync(join(docsEpisodeDir, 'transcript.html'), transcriptHtml);
  if (verbose) {
    console.log('Generated transcript.html');
  }

  // Update docs/index.html and feed.xml with all published episodes
  const allStatuses = getAllEpisodesStatus(projectRoot);
  const publishedEpisodes = allStatuses
    .filter((s) => s.status === 'published' || s.episode === episodeNumber)
    .map((s) => ({
      episode: s.episode,
      title: s.title,
      date: s.date,
    }));

  // Generate index page
  const indexHtml = generateIndexPage({ episodes: publishedEpisodes, baseUrl });
  writeFileSync(join(docsDir, 'index.html'), indexHtml);
  if (verbose) {
    console.log('Updated docs/index.html');
  }

  // Generate RSS feed
  const rssFeed = generateRssFeed({
    episodes: publishedEpisodes,
    baseUrl,
    title: 'Moltbook Report Podcast',
    description: 'AI-generated deep dives into Moltbook, the AI agent social network.',
  });
  writeFileSync(join(docsDir, 'feed.xml'), rssFeed);
  if (verbose) {
    console.log('Updated docs/feed.xml');
  }
}
