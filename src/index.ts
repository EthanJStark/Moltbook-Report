// src/index.ts
export { MoltbookClient } from './api/client.js';
export { scrapeDaily } from './scraper/daily.js';
export { generateReport } from './report/markdown.js';
export * from './schema/moltbook.js';

// Episode workflow exports
export {
  createEpisode,
  confirmEpisode,
  deleteEpisode,
  transcribeEpisode,
  publishEpisode,
  getEpisodeStatus,
  getAllEpisodesStatus,
} from './episode/index.js';

export type {
  CreateEpisodeOptions,
  CreateEpisodeResult,
  ConfirmEpisodeOptions,
  DeleteEpisodeOptions,
  TranscribeEpisodeOptions,
  TranscribeResult,
  PublishEpisodeOptions,
  EpisodeStatusInfo,
  EpisodeMetadata,
  CoveredPosts,
  EpisodeStatus,
} from './episode/index.js';
