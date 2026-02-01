import { z } from 'zod';

/**
 * Schema for episodes/covered-posts.json
 * Maps post IDs to episode numbers
 */
export const CoveredPostsSchema = z.record(z.string(), z.number().int().positive());

export type CoveredPosts = z.infer<typeof CoveredPostsSchema>;

/**
 * Schema for episodes/00X/metadata.json
 */
export const EpisodeMetadataSchema = z.object({
  episode: z.number().int().positive(),
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  postIds: z.array(z.string()),
  speakerCount: z.number().int().positive().optional(),
});

export type EpisodeMetadata = z.infer<typeof EpisodeMetadataSchema>;

/**
 * Parse and validate episode metadata JSON
 */
export function parseMetadata(json: string): EpisodeMetadata {
  const data = JSON.parse(json);
  return EpisodeMetadataSchema.parse(data);
}

/**
 * Parse and validate covered posts JSON
 * Returns empty object for empty/missing file
 */
export function parseCoveredPosts(json: string): CoveredPosts {
  if (!json || json.trim() === '') {
    return {};
  }
  const data = JSON.parse(json);
  return CoveredPostsSchema.parse(data);
}
