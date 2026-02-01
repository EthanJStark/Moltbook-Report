import { z } from 'zod';
import { AuthorSchema } from './moltbook.js';

export const FilteredPostSchema = z.object({
  postId: z.string(),
  title: z.string(),
  content: z.string(),
  author: AuthorSchema,
  previouslyCovered: z.array(z.string()), // Episode IDs like ['001', '002']
  themeMatch: z.enum(['security', 'identity']),
  keywordHits: z.number(),
  upvotes: z.number(),
  created_at: z.string()
});

export type FilteredPost = z.infer<typeof FilteredPostSchema>;
