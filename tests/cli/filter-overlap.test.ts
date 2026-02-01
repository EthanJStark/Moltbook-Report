import { describe, it, expect, vi, afterEach } from 'vitest';
import { filterCommand } from '../../src/cli/filter.js';
import { readFile, writeFile, readdir } from 'fs/promises';

vi.mock('fs/promises');

describe('filterCommand with overlap detection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockPosts = [
    {
      id: 'security1',
      title: 'Database leak',
      content: 'Security breach',
      author: { name: 'Bot1', id: '1', karma: 100, follower_count: 50 },
      upvotes: 150,
      comment_count: 20,
      created_at: '2026-01-28T10:00:00Z',
      url: 'https://moltbook.com/post/security1'
    },
    {
      id: 'security2',
      title: 'API key exposure',
      content: 'Hack detected',
      author: { name: 'Bot2', id: '2', karma: 80, follower_count: 30 },
      upvotes: 120,
      comment_count: 15,
      created_at: '2026-01-28T11:00:00Z',
      url: 'https://moltbook.com/post/security2'
    }
  ];

  it('tags posts as previously covered', async () => {
    vi.mocked(readFile).mockImplementation(async (path: any) => {
      if (path === 'input.json') {
        return JSON.stringify({ posts: mockPosts }) as any;
      }
      if (path.includes('episodes/001/raw/')) {
        return JSON.stringify({
          filtered: [{ postId: 'security1' }]
        }) as any;
      }
      throw new Error(`File not found: ${path}`);
    });
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(readdir).mockResolvedValue([
      '001' as any
    ]);

    await filterCommand({
      theme: 'security',
      input: 'input.json',
      output: 'output.json',
      limit: 10,
      verbose: false
    });

    const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
    const result = JSON.parse(writtenContent);

    const security1 = result.filtered.find((p: any) => p.postId === 'security1');
    expect(security1.previouslyCovered).toContain('001');

    const security2 = result.filtered.find((p: any) => p.postId === 'security2');
    expect(security2.previouslyCovered).toHaveLength(0);
  });

  it('calculates overlap percentage', async () => {
    const posts = Array.from({ length: 10 }, (_, i) => ({
      id: `security${i}`,
      title: 'Security breach',
      content: 'Hack',
      author: { name: 'Bot', id: '1', karma: 100, follower_count: 50 },
      upvotes: 100,
      comment_count: 10,
      created_at: '2026-01-28T10:00:00Z',
      url: `https://moltbook.com/post/security${i}`
    }));

    vi.mocked(readFile).mockImplementation(async (path: any) => {
      if (path === 'input.json') {
        return JSON.stringify({ posts }) as any;
      }
      if (path.includes('episodes/001/raw/')) {
        // 4 out of 10 posts were in episode 1
        return JSON.stringify({
          filtered: [
            { postId: 'security0' },
            { postId: 'security1' },
            { postId: 'security2' },
            { postId: 'security3' }
          ]
        }) as any;
      }
      throw new Error(`File not found: ${path}`);
    });
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(readdir).mockResolvedValue(['001' as any]);

    await filterCommand({
      theme: 'security',
      input: 'input.json',
      output: 'output.json',
      limit: 10,
      verbose: false
    });

    const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
    const result = JSON.parse(writtenContent);

    expect(result.overlap).toBeDefined();
    expect(result.filtered.length).toBe(10); // Debug: check how many posts we got
    expect(result.overlap.overlapPercent).toBe(40);
    expect(result.overlap.overlappingPosts).toHaveLength(4);
  });

  it('warns about high overlap (20-40%)', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const posts = Array.from({ length: 10 }, (_, i) => ({
      id: `security${i}`,
      title: 'Security',
      content: 'Hack',
      author: { name: 'Bot', id: '1', karma: 100, follower_count: 50 },
      upvotes: 100,
      comment_count: 10,
      created_at: '2026-01-28T10:00:00Z',
      url: `https://moltbook.com/post/security${i}`
    }));

    vi.mocked(readFile).mockImplementation(async (path: any) => {
      if (path === 'input.json') {
        return JSON.stringify({ posts }) as any;
      }
      if (path.includes('episodes/001/raw/')) {
        return JSON.stringify({
          filtered: [
            { postId: 'security0' },
            { postId: 'security1' },
            { postId: 'security2' }
          ]
        }) as any;
      }
      throw new Error('File not found');
    });
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(readdir).mockResolvedValue(['001' as any]);

    await filterCommand({
      theme: 'security',
      input: 'input.json',
      output: 'output.json',
      limit: 10,
      verbose: true
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Warning: 30% overlap')
    );

    consoleSpy.mockRestore();
  });
});
