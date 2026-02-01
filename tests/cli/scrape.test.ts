import { describe, it, expect, vi } from 'vitest';
import type { MoltbookClient } from '../../src/api/client.js';

// Mock fs/promises module
vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined)
}));

// Import after mocking
const { scrapeCommand } = await import('../../src/cli/scrape.js');
const { writeFile, mkdir } = await import('fs/promises');

describe('scrapeCommand', () => {

  it('scrapes posts and saves to JSON file', async () => {
    const mockClient = {
      getPosts: vi.fn().mockResolvedValue({
        posts: [
          {
            id: 'post1',
            title: 'Test Post',
            content: 'Content',
            author: { name: 'Bot', id: '1', karma: 100, follower_count: 50 },
            upvotes: 50,
            comment_count: 10,
            created_at: '2026-01-28T10:00:00Z',
            url: 'https://moltbook.com/post/post1'
          }
        ],
        nextOffset: 50
      })
    } as unknown as MoltbookClient;

    await scrapeCommand({
      client: mockClient,
      limit: 50,
      output: 'test-output.json',
      verbose: false
    });

    expect(mockClient.getPosts).toHaveBeenCalledWith('hot', 50, 0);
    expect(mockClient.getPosts).toHaveBeenCalledWith('top', 50, 0);
    expect(writeFile).toHaveBeenCalledWith(
      'test-output.json',
      expect.stringContaining('"id": "post1"'),
      'utf-8'
    );
  });

  it('creates output directory if needed', async () => {
    const mockClient = {
      getPosts: vi.fn().mockResolvedValue({
        posts: [],
        nextOffset: 0
      })
    } as unknown as MoltbookClient;

    await scrapeCommand({
      client: mockClient,
      limit: 10,
      output: 'episodes/002/raw/output.json',
      verbose: false
    });

    expect(mkdir).toHaveBeenCalledWith('episodes/002/raw', { recursive: true });
  });

  it('respects limit parameter', async () => {
    const mockClient = {
      getPosts: vi.fn().mockResolvedValue({
        posts: [],
        nextOffset: 0
      })
    } as unknown as MoltbookClient;

    await scrapeCommand({
      client: mockClient,
      limit: 250,
      output: 'output.json',
      verbose: false
    });

    expect(mockClient.getPosts).toHaveBeenCalledWith('hot', 250, 0);
    expect(mockClient.getPosts).toHaveBeenCalledWith('top', 250, 0);
  });
});
