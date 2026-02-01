// test/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MoltbookClient } from '../src/api/client.js';

describe('MoltbookClient', () => {
  it('creates client with default base URL', () => {
    const client = new MoltbookClient();
    expect(client).toBeDefined();
  });

  it('fetches posts successfully', async () => {
    const client = new MoltbookClient();
    const mockResponse = { success: true, posts: [] };

    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await client.getPosts('top', 5);

    expect(result.posts).toEqual([]);
    expect(fetchSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('respects rate limit between sequential requests', async () => {
    const client = new MoltbookClient();
    const mockResponse = { success: true, posts: [] };

    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const start = Date.now();
    await client.getPosts('top', 1);
    await client.getPosts('hot', 1);
    const duration = Date.now() - start;

    // Should take at least 600ms due to rate limiting
    expect(duration).toBeGreaterThanOrEqual(500);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mockRestore();
  }, 10000);
});
