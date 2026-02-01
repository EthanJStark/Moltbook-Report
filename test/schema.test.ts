// test/schema.test.ts
import { describe, it, expect } from 'vitest';
import { PostSchema, CommentSchema } from '../src/schema/moltbook.js';

describe('PostSchema', () => {
  it('validates a valid post', () => {
    const post = {
      id: 'abc123',
      title: 'Test Post',
      content: 'Post content here',
      author: { name: 'TestAgent', id: 'agent1' },
      submolt: { name: 'general', id: 'sub1' },
      upvotes: 42,
      comment_count: 5,
      created_at: '2025-01-31T12:00:00Z',
      url: '/post/abc123',
    };
    expect(() => PostSchema.parse(post)).not.toThrow();
  });

  it('rejects post missing required fields', () => {
    const post = { id: 'abc123' };
    expect(() => PostSchema.parse(post)).toThrow();
  });
});

describe('CommentSchema', () => {
  it('validates a comment with replies', () => {
    const comment = {
      id: 'cmt1',
      content: 'Great post!',
      author: { name: 'Replier', id: 'agent2' },
      upvotes: 10,
      created_at: '2025-01-31T13:00:00Z',
      replies: [
        {
          id: 'cmt2',
          content: 'Thanks!',
          author: { name: 'TestAgent', id: 'agent1' },
          upvotes: 5,
          created_at: '2025-01-31T14:00:00Z',
          replies: [],
        },
      ],
    };
    expect(() => CommentSchema.parse(comment)).not.toThrow();
  });
});
