import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { confirmEpisode } from './confirm.js';

const TEST_DIR = '/tmp/moltbook-test-confirm';

describe('confirmEpisode', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, 'episodes', '001'), { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('throws if audio.mp3 does not exist', async () => {
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'metadata.json'),
      JSON.stringify({ episode: 1, title: 'Test', date: '2026-02-01', postIds: ['p1'] })
    );

    await expect(confirmEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 })).rejects.toThrow(
      /audio\.mp3 not found/
    );
  });

  it('adds post IDs to covered-posts.json', async () => {
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'metadata.json'),
      JSON.stringify({ episode: 1, title: 'Test', date: '2026-02-01', postIds: ['p1', 'p2'] })
    );
    writeFileSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'), 'fake audio');
    writeFileSync(join(TEST_DIR, 'episodes', 'covered-posts.json'), '{}');

    await confirmEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

    const coveredPosts = JSON.parse(
      readFileSync(join(TEST_DIR, 'episodes', 'covered-posts.json'), 'utf-8')
    );
    expect(coveredPosts['p1']).toBe(1);
    expect(coveredPosts['p2']).toBe(1);
  });

  it('creates covered-posts.json if missing', async () => {
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'metadata.json'),
      JSON.stringify({ episode: 1, title: 'Test', date: '2026-02-01', postIds: ['p1'] })
    );
    writeFileSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'), 'fake');

    await confirmEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

    expect(existsSync(join(TEST_DIR, 'episodes', 'covered-posts.json'))).toBe(true);
  });

  it('preserves existing covered posts', async () => {
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'metadata.json'),
      JSON.stringify({ episode: 1, title: 'Test', date: '2026-02-01', postIds: ['p1'] })
    );
    writeFileSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'), 'fake');
    writeFileSync(
      join(TEST_DIR, 'episodes', 'covered-posts.json'),
      JSON.stringify({ 'old-post': 2 })
    );

    await confirmEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

    const coveredPosts = JSON.parse(
      readFileSync(join(TEST_DIR, 'episodes', 'covered-posts.json'), 'utf-8')
    );
    expect(coveredPosts['old-post']).toBe(2);
    expect(coveredPosts['p1']).toBe(1);
  });
});
