import { describe, it, expect } from 'vitest';
import {
  CoveredPostsSchema,
  EpisodeMetadataSchema,
  parseMetadata,
  parseCoveredPosts,
} from './schema.js';

describe('Episode Schemas', () => {
  describe('CoveredPostsSchema', () => {
    it('validates a valid covered-posts.json structure', () => {
      const data = {
        'post-abc123': 1,
        'post-def456': 2,
      };
      const result = CoveredPostsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects non-integer episode numbers', () => {
      const data = { 'post-abc': 1.5 };
      const result = CoveredPostsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('EpisodeMetadataSchema', () => {
    it('validates complete metadata', () => {
      const data = {
        episode: 1,
        title: 'Test Episode',
        date: '2026-02-01',
        postIds: ['post-abc', 'post-def'],
      };
      const result = EpisodeMetadataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('allows optional speakerCount', () => {
      const data = {
        episode: 1,
        title: 'Test',
        date: '2026-02-01',
        postIds: [],
        speakerCount: 2,
      };
      const result = EpisodeMetadataSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.speakerCount).toBe(2);
      }
    });
  });

  describe('parseMetadata', () => {
    it('throws on invalid JSON', () => {
      expect(() => parseMetadata('not json')).toThrow();
    });
  });

  describe('parseCoveredPosts', () => {
    it('returns empty object for empty string', () => {
      expect(parseCoveredPosts('')).toEqual({});
    });
  });
});
