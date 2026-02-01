import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { deleteEpisode } from './delete.js';

const TEST_DIR = '/tmp/moltbook-test-delete';

describe('deleteEpisode', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, 'episodes', '001'), { recursive: true });
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'metadata.json'),
      JSON.stringify({ episode: 1, title: 'Test', date: '2026-02-01', postIds: ['p1', 'p2'] })
    );
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('deletes episode directory', async () => {
    await deleteEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

    expect(existsSync(join(TEST_DIR, 'episodes', '001'))).toBe(false);
  });

  it('throws without --force if posts are covered', async () => {
    writeFileSync(
      join(TEST_DIR, 'episodes', 'covered-posts.json'),
      JSON.stringify({ p1: 1, p2: 1 })
    );

    await expect(
      deleteEpisode({ projectRoot: TEST_DIR, episodeNumber: 1, force: false })
    ).rejects.toThrow(/already marked covered/);
  });

  it('removes posts from covered-posts.json with --force', async () => {
    writeFileSync(
      join(TEST_DIR, 'episodes', 'covered-posts.json'),
      JSON.stringify({ p1: 1, p2: 1, other: 2 })
    );

    await deleteEpisode({ projectRoot: TEST_DIR, episodeNumber: 1, force: true });

    const coveredPosts = JSON.parse(
      readFileSync(join(TEST_DIR, 'episodes', 'covered-posts.json'), 'utf-8')
    );
    expect(coveredPosts['p1']).toBeUndefined();
    expect(coveredPosts['p2']).toBeUndefined();
    expect(coveredPosts['other']).toBe(2);
  });

  it('deletes docs/episodes/00X if published', async () => {
    const docsDir = join(TEST_DIR, 'docs', 'episodes', '001');
    mkdirSync(docsDir, { recursive: true });
    writeFileSync(join(docsDir, 'index.html'), '<html>');

    await deleteEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

    expect(existsSync(docsDir)).toBe(false);
  });
});
