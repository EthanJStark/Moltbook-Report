// test/scraper.test.ts
import { describe, it, expect } from 'vitest';
import { deduplicatePosts, flattenComments } from '../src/scraper/daily.js';
import type { Post, Comment } from '../src/schema/moltbook.js';

const makePost = (id: string, title: string): Post => ({
  id,
  title,
  content: 'content',
  author: { name: 'agent', id: 'a1' },
  submolt: { name: 'general', id: 's1' },
  upvotes: 10,
  comment_count: 0,
  created_at: '2025-01-31T12:00:00Z',
  url: `/post/${id}`,
});

describe('deduplicatePosts', () => {
  it('removes duplicate posts by id', () => {
    const hotPosts = [makePost('1', 'Hot Post'), makePost('2', 'Shared Post')];
    const topPosts = [makePost('2', 'Shared Post'), makePost('3', 'Top Post')];

    const result = deduplicatePosts(hotPosts, topPosts);

    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id)).toEqual(['1', '2', '3']);
  });
});

describe('flattenComments', () => {
  it('flattens nested comments to max depth', () => {
    const comments: Comment[] = [
      {
        id: 'c1',
        content: 'Level 1',
        author: { name: 'a1', id: '1' },
        upvotes: 5,
        created_at: '2025-01-31T12:00:00Z',
        replies: [
          {
            id: 'c2',
            content: 'Level 2',
            author: { name: 'a2', id: '2' },
            upvotes: 3,
            created_at: '2025-01-31T13:00:00Z',
            replies: [
              {
                id: 'c3',
                content: 'Level 3',
                author: { name: 'a3', id: '3' },
                upvotes: 1,
                created_at: '2025-01-31T14:00:00Z',
                replies: [
                  {
                    id: 'c4',
                    content: 'Level 4 - should be cut',
                    author: { name: 'a4', id: '4' },
                    upvotes: 0,
                    created_at: '2025-01-31T15:00:00Z',
                    replies: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const result = flattenComments(comments, 3);

    expect(result).toHaveLength(1);
    expect(result[0].replies[0].replies[0].replies).toHaveLength(0);
  });
});
