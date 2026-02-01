// src/index.ts
export { MoltbookClient } from './api/client.js';
export { scrapeDaily } from './scraper/daily.js';
export { generateReport } from './report/markdown.js';
export * from './schema/moltbook.js';

// Episode 2: Thematic filtering exports
export { scrapeCommand } from './cli/scrape.js';
export { filterCommand } from './cli/filter.js';
export { getKeywordsForTheme, THEME_KEYWORDS } from './filter/keywords.js';
export { countKeywordMatches, calculateRelevanceScore } from './filter/matcher.js';
export { checkOverlap } from './filter/overlap.js';

export type { FilterOptions } from './cli/filter.js';
export type { ScrapeOptions } from './cli/scrape.js';
export type { FilteredPost } from './schema/filtered-post.js';
export type { Source, SourcesRegistry } from './schema/sources.js';
export type { ThemeName } from './filter/keywords.js';
export type { OverlapResult } from './filter/overlap.js';

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
