import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createEpisode, type CreateEpisodeOptions } from './new.js';

const TEST_DIR = '/tmp/moltbook-test-new';

// Mock the scraper to avoid real API calls
vi.mock('../scraper/daily.js', () => ({
  scrapeDaily: vi.fn().mockResolvedValue([
    {
      id: 'post-1',
      title: 'Test Post 1',
      content: 'Content 1',
      author: { name: 'author1', id: 'a1' },
      submolt: { name: 'test', id: 's1' },
      upvotes: 100,
      comment_count: 5,
      created_at: '2026-01-30T00:00:00Z',
      url: null,
      comments: [],
      source: 'top',
    },
    {
      id: 'post-2',
      title: 'Test Post 2',
      content: 'Content 2',
      author: { name: 'author2', id: 'a2' },
      submolt: { name: 'test', id: 's1' },
      upvotes: 50,
      comment_count: 3,
      created_at: '2026-01-29T00:00:00Z',
      url: null,
      comments: [],
      source: 'top',
    },
    {
      id: 'post-covered',
      title: 'Already Covered',
      content: 'Old content',
      author: { name: 'author3', id: 'a3' },
      submolt: { name: 'test', id: 's1' },
      upvotes: 200,
      comment_count: 10,
      created_at: '2026-01-28T00:00:00Z',
      url: null,
      comments: [],
      source: 'top',
    },
  ]),
}));

describe('createEpisode', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, 'episodes'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'context'), { recursive: true });
    // Create minimal context files
    writeFileSync(join(TEST_DIR, 'context', 'moltbook-overview.md'), '# Overview');
    writeFileSync(join(TEST_DIR, 'context', 'key-agents.md'), '# Agents');
    writeFileSync(join(TEST_DIR, 'context', 'moltbook-origins-launch.md'), '# Origins');
    writeFileSync(join(TEST_DIR, 'context', 'notebooklm-guide.md'), '# Guide');
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it('creates episode directory structure', async () => {
    const result = await createEpisode({
      projectRoot: TEST_DIR,
      limit: 2,
      title: 'Test Episode',
    });

    expect(result.episodeNumber).toBe(1);
    expect(existsSync(join(TEST_DIR, 'episodes', '001'))).toBe(true);
    expect(existsSync(join(TEST_DIR, 'episodes', '001', 'metadata.json'))).toBe(true);
    expect(existsSync(join(TEST_DIR, 'episodes', '001', 'notebooklm'))).toBe(true);
  });

  it('filters out already-covered posts', async () => {
    // Mark post-covered as already covered
    writeFileSync(
      join(TEST_DIR, 'episodes', 'covered-posts.json'),
      JSON.stringify({ 'post-covered': 1 })
    );

    const result = await createEpisode({
      projectRoot: TEST_DIR,
      limit: 5,
      title: 'Test Episode',
    });

    // Should only include post-1 and post-2, not post-covered
    expect(result.postIds).toContain('post-1');
    expect(result.postIds).toContain('post-2');
    expect(result.postIds).not.toContain('post-covered');
  });

  it('copies context files to notebooklm folder', async () => {
    await createEpisode({
      projectRoot: TEST_DIR,
      limit: 2,
      title: 'Test Episode',
    });

    const notebooklmDir = join(TEST_DIR, 'episodes', '001', 'notebooklm');
    expect(existsSync(join(notebooklmDir, 'moltbook-overview.md'))).toBe(true);
    expect(existsSync(join(notebooklmDir, 'key-agents.md'))).toBe(true);
    expect(existsSync(join(notebooklmDir, 'notebooklm-guide.md'))).toBe(true);
  });

  it('does NOT update covered-posts.json', async () => {
    writeFileSync(join(TEST_DIR, 'episodes', 'covered-posts.json'), '{}');

    await createEpisode({
      projectRoot: TEST_DIR,
      limit: 2,
      title: 'Test Episode',
    });

    const coveredPosts = JSON.parse(
      readFileSync(join(TEST_DIR, 'episodes', 'covered-posts.json'), 'utf-8')
    );
    expect(Object.keys(coveredPosts)).toHaveLength(0);
  });

  it('increments episode number correctly', async () => {
    mkdirSync(join(TEST_DIR, 'episodes', '001'));
    mkdirSync(join(TEST_DIR, 'episodes', '003'));

    const result = await createEpisode({
      projectRoot: TEST_DIR,
      limit: 2,
      title: 'Test Episode',
    });

    expect(result.episodeNumber).toBe(4);
    expect(existsSync(join(TEST_DIR, 'episodes', '004'))).toBe(true);
  });
});
