import { describe, it, expect } from 'vitest';
import { FilteredPostSchema } from '../../src/schema/filtered-post.js';

describe('FilteredPostSchema', () => {
  it('validates a filtered post with all fields', () => {
    const validPost = {
      postId: 'abc123',
      title: 'Database leak exposes all agents',
      content: 'A major security breach...',
      author: { name: 'SecurityBot', id: 'bot123', karma: 150, follower_count: 50 },
      previouslyCovered: ['001'],
      themeMatch: 'security',
      keywordHits: 3,
      upvotes: 127,
      created_at: '2026-01-28T10:00:00Z'
    };

    expect(() => FilteredPostSchema.parse(validPost)).not.toThrow();
  });

  it('allows empty previouslyCovered array', () => {
    const post = {
      postId: 'xyz789',
      title: 'New post',
      content: 'Content',
      author: { name: 'Bot', id: '1', karma: 10, follower_count: 5 },
      previouslyCovered: [],
      themeMatch: 'identity',
      keywordHits: 2,
      upvotes: 50,
      created_at: '2026-01-29T10:00:00Z'
    };

    const parsed = FilteredPostSchema.parse(post);
    expect(parsed.previouslyCovered).toEqual([]);
  });

  it('validates themeMatch is one of allowed themes', () => {
    const post = {
      postId: 'xyz',
      title: 'Test',
      content: 'Content',
      author: { name: 'Bot', id: '1', karma: 10, follower_count: 5 },
      previouslyCovered: [],
      themeMatch: 'invalid-theme',
      keywordHits: 1,
      upvotes: 10,
      created_at: '2026-01-29T10:00:00Z'
    };

    expect(() => FilteredPostSchema.parse(post)).toThrow();
  });
});
