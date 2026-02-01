// src/episode/publish.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { publishEpisode, checkPublishPrerequisites } from './publish.js';

const TEST_DIR = '/tmp/moltbook-test-publish';

describe('Episode Publish', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, 'episodes', '001'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'docs'), { recursive: true });

    // Create minimal required files
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'metadata.json'),
      JSON.stringify({ episode: 1, title: 'Test Episode', date: '2026-02-01', postIds: ['p1'] })
    );
    writeFileSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'), 'fake audio');
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'transcript.json'),
      JSON.stringify({
        segments: [
          { speaker: 'SPEAKER_00', text: 'Hello', start: 0, end: 1 },
          { speaker: 'SPEAKER_01', text: 'Hi', start: 1, end: 2 },
        ],
      })
    );
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('checkPublishPrerequisites', () => {
    it('throws if not transcribed', () => {
      rmSync(join(TEST_DIR, 'episodes', '001', 'transcript.json'));

      expect(() => checkPublishPrerequisites(TEST_DIR, 1)).toThrow(/Not transcribed/);
    });

    it('throws if audio missing', () => {
      rmSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'));

      expect(() => checkPublishPrerequisites(TEST_DIR, 1)).toThrow(/audio\.mp3 not found/);
    });

    it('throws if already published', () => {
      mkdirSync(join(TEST_DIR, 'docs', 'episodes', '001'), { recursive: true });

      expect(() => checkPublishPrerequisites(TEST_DIR, 1)).toThrow(/Already published/);
    });
  });

  describe('publishEpisode', () => {
    it('creates docs/episodes/00X directory', async () => {
      await publishEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

      expect(existsSync(join(TEST_DIR, 'docs', 'episodes', '001'))).toBe(true);
    });

    it('copies audio.mp3', async () => {
      await publishEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

      expect(existsSync(join(TEST_DIR, 'docs', 'episodes', '001', 'audio.mp3'))).toBe(true);
    });

    it('creates index.html with audio player', async () => {
      await publishEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

      const html = readFileSync(join(TEST_DIR, 'docs', 'episodes', '001', 'index.html'), 'utf-8');
      expect(html).toContain('<audio');
      expect(html).toContain('Test Episode');
    });

    it('creates transcript.html with speaker labels', async () => {
      await publishEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

      const html = readFileSync(
        join(TEST_DIR, 'docs', 'episodes', '001', 'transcript.html'),
        'utf-8'
      );
      expect(html).toContain('Hello');
      expect(html).toContain('speaker-');
    });

    it('creates/updates docs/index.html', async () => {
      await publishEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

      const html = readFileSync(join(TEST_DIR, 'docs', 'index.html'), 'utf-8');
      expect(html).toContain('Test Episode');
      expect(html).toContain('episodes/001/');
    });

    it('creates/updates docs/feed.xml', async () => {
      await publishEpisode({ projectRoot: TEST_DIR, episodeNumber: 1 });

      const rss = readFileSync(join(TEST_DIR, 'docs', 'feed.xml'), 'utf-8');
      expect(rss).toContain('<rss');
      expect(rss).toContain('audio.mp3');
    });
  });
});
