import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getEpisodeStatus, getAllEpisodesStatus } from './status.js';

const TEST_DIR = '/tmp/moltbook-test-status';

describe('Episode Status', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, 'episodes'), { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('getEpisodeStatus', () => {
    it('returns correct info for draft episode', () => {
      const episodeDir = join(TEST_DIR, 'episodes', '001');
      mkdirSync(episodeDir);
      writeFileSync(
        join(episodeDir, 'metadata.json'),
        JSON.stringify({
          episode: 1,
          title: 'Test',
          date: '2026-02-01',
          postIds: ['p1', 'p2'],
        })
      );

      const status = getEpisodeStatus(TEST_DIR, 1);

      expect(status.episode).toBe(1);
      expect(status.title).toBe('Test');
      expect(status.status).toBe('draft');
      expect(status.postCount).toBe(2);
      expect(status.covered).toBe(false);
    });

    it('shows covered=true when posts are in covered-posts.json', () => {
      const episodeDir = join(TEST_DIR, 'episodes', '001');
      mkdirSync(episodeDir);
      writeFileSync(
        join(episodeDir, 'metadata.json'),
        JSON.stringify({ episode: 1, title: 'Test', date: '2026-02-01', postIds: ['p1'] })
      );
      writeFileSync(join(episodeDir, 'audio.mp3'), 'fake');
      writeFileSync(join(TEST_DIR, 'episodes', 'covered-posts.json'), JSON.stringify({ p1: 1 }));

      const status = getEpisodeStatus(TEST_DIR, 1);

      expect(status.covered).toBe(true);
    });

    it('includes speakerCount when transcribed', () => {
      const episodeDir = join(TEST_DIR, 'episodes', '001');
      mkdirSync(episodeDir);
      writeFileSync(
        join(episodeDir, 'metadata.json'),
        JSON.stringify({
          episode: 1,
          title: 'Test',
          date: '2026-02-01',
          postIds: ['p1'],
          speakerCount: 2,
        })
      );
      writeFileSync(join(episodeDir, 'audio.mp3'), 'fake');
      writeFileSync(join(episodeDir, 'transcript.json'), '{}');

      const status = getEpisodeStatus(TEST_DIR, 1);

      expect(status.status).toBe('transcribed');
      expect(status.speakerCount).toBe(2);
    });
  });

  describe('getAllEpisodesStatus', () => {
    it('returns empty array when no episodes', () => {
      const statuses = getAllEpisodesStatus(TEST_DIR);
      expect(statuses).toHaveLength(0);
    });

    it('returns all episodes sorted by number', () => {
      mkdirSync(join(TEST_DIR, 'episodes', '002'));
      mkdirSync(join(TEST_DIR, 'episodes', '001'));
      writeFileSync(
        join(TEST_DIR, 'episodes', '001', 'metadata.json'),
        JSON.stringify({ episode: 1, title: 'Ep 1', date: '2026-01-01', postIds: [] })
      );
      writeFileSync(
        join(TEST_DIR, 'episodes', '002', 'metadata.json'),
        JSON.stringify({ episode: 2, title: 'Ep 2', date: '2026-01-02', postIds: [] })
      );

      const statuses = getAllEpisodesStatus(TEST_DIR);

      expect(statuses).toHaveLength(2);
      expect(statuses[0].episode).toBe(1);
      expect(statuses[1].episode).toBe(2);
    });
  });
});
