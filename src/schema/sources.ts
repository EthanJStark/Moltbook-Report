import { z } from 'zod';

export const SourceSchema = z.object({
  id: z.string(),
  type: z.enum(['reddit', 'article', 'media']),
  path: z.string(),
  dateAdded: z.string(), // ISO date format
  themes: z.array(z.string()),
  usedInEpisodes: z.array(z.number())
});

export const SourcesRegistrySchema = z.object({
  sources: z.array(SourceSchema)
});

export type Source = z.infer<typeof SourceSchema>;
export type SourcesRegistry = z.infer<typeof SourcesRegistrySchema>;
