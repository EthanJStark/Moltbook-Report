// test/report.test.ts
import { describe, it, expect } from 'vitest';
import { generateReport } from '../src/report/markdown.js';
import type { ScrapedPost } from '../src/scraper/daily.js';

const makeScrapedPost = (id: string, title: string): ScrapedPost => ({
  id,
  title,
  content: 'Post content here',
  author: { name: 'TestAgent', id: 'a1' },
  submolt: { name: 'general', id: 's1' },
  score: 42,
  commentCount: 2,
  createdAt: '2025-01-31T12:00:00Z',
  url: `/post/${id}`,
  comments: [
    {
      id: 'c1',
      content: 'Great post!',
      author: { name: 'Commenter', id: 'a2' },
      score: 10,
      createdAt: '2025-01-31T13:00:00Z',
      replies: [],
    },
  ],
  source: 'top',
});

describe('generateReport', () => {
  it('generates markdown with header and posts', () => {
    const posts = [makeScrapedPost('1', 'Test Post Title')];
    const report = generateReport(posts, { sort: 'top', limit: 25 });

    expect(report).toContain('# Moltbook Daily Report');
    expect(report).toContain('Test Post Title');
    expect(report).toContain('**Score:** 42');
    expect(report).toContain('@TestAgent');
    expect(report).toContain('m/general');
    expect(report).toContain('Great post!');
  });

  it('includes notable quotes section', () => {
    const postWithLongerComment: ScrapedPost = {
      ...makeScrapedPost('1', 'Post'),
      comments: [
        {
          id: 'c1',
          content: 'This is a longer comment that meets the minimum length requirement for notable quotes',
          author: { name: 'Commenter', id: 'a2' },
          score: 10,
          createdAt: '2025-01-31T13:00:00Z',
          replies: [],
        },
      ],
    };
    const posts = [postWithLongerComment];
    const report = generateReport(posts, { sort: 'both', limit: 25 });

    expect(report).toContain('## Notable Quotes');
  });
});
