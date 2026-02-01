import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { filterCommand } from '../../src/cli/filter.js';
import { readFile, writeFile } from 'fs/promises';

vi.mock('fs/promises');

describe('filterCommand', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockPosts = [
    {
      id: 'security1',
      title: 'Database leak exposes API keys',
      content: 'Major security breach',
      author: { name: 'Bot1', id: '1', karma: 100, follower_count: 50 },
      upvotes: 150,
      comment_count: 20,
      created_at: '2026-01-28T10:00:00Z',
      url: 'https://moltbook.com/post/security1'
    },
    {
      id: 'identity1',
      title: 'Are you human or bot?',
      content: 'Identity verification crisis',
      author: { name: 'Bot2', id: '2', karma: 80, follower_count: 30 },
      upvotes: 120,
      comment_count: 15,
      created_at: '2026-01-28T11:00:00Z',
      url: 'https://moltbook.com/post/identity1'
    },
    {
      id: 'unrelated',
      title: 'Random post',
      content: 'Nothing relevant',
      author: { name: 'Bot3', id: '3', karma: 50, follower_count: 20 },
      upvotes: 30,
      comment_count: 5,
      created_at: '2026-01-28T12:00:00Z',
      url: 'https://moltbook.com/post/unrelated'
    }
  ];

  it('filters posts by security theme', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ posts: mockPosts }) as any
    );
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await filterCommand({
      theme: 'security',
      input: 'input.json',
      output: 'output.json',
      limit: 10,
      verbose: false
    });

    expect(writeFile).toHaveBeenCalled();
    const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
    const result = JSON.parse(writtenContent);

    expect(result.filtered.length).toBeGreaterThan(0);
    expect(result.filtered[0].themeMatch).toBe('security');
    expect(result.filtered[0].postId).toBe('security1');

  });

  it('filters posts by identity theme', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ posts: mockPosts }) as any
    );
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await filterCommand({
      theme: 'identity',
      input: 'input.json',
      output: 'output.json',
      limit: 10,
      verbose: false
    });

    const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
    const result = JSON.parse(writtenContent);

    expect(result.filtered[0].themeMatch).toBe('identity');
    expect(result.filtered[0].postId).toBe('identity1');

  });

  it('respects limit parameter', async () => {
    const manyPosts = Array.from({ length: 20 }, (_, i) => ({
      id: `security${i}`,
      title: `Security breach ${i}`,
      content: 'Security content',
      author: { name: 'Bot', id: '1', karma: 100, follower_count: 50 },
      upvotes: 100 - i,
      comment_count: 10,
      created_at: '2026-01-28T10:00:00Z',
      url: `https://moltbook.com/post/security${i}`
    }));

    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ posts: manyPosts }) as any
    );
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await filterCommand({
      theme: 'security',
      input: 'input.json',
      output: 'output.json',
      limit: 5,
      verbose: false
    });

    const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
    const result = JSON.parse(writtenContent);

    expect(result.filtered.length).toBe(5);

  });

  it('ranks posts by relevance score', async () => {
    const posts = [
      {
        id: 'low',
        title: 'Security',
        content: 'Brief mention',
        author: { name: 'Bot', id: '1', karma: 100, follower_count: 50 },
        upvotes: 10,
        comment_count: 2,
        created_at: '2026-01-28T10:00:00Z',
        url: 'https://moltbook.com/post/low'
      },
      {
        id: 'high',
        title: 'Security breach hack exploit leak',
        content: 'Security database password token security hack',
        author: { name: 'Bot', id: '2', karma: 100, follower_count: 50 },
        upvotes: 200,
        comment_count: 50,
        created_at: '2026-01-28T11:00:00Z',
        url: 'https://moltbook.com/post/high'
      }
    ];

    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ posts }) as any
    );
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await filterCommand({
      theme: 'security',
      input: 'input.json',
      output: 'output.json',
      limit: 10,
      verbose: false
    });

    const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
    const result = JSON.parse(writtenContent);

    expect(result.filtered[0].postId).toBe('high'); // Higher relevance should be first

  });
});
