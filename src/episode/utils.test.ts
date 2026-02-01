import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  formatEpisodeNumber,
  getNextEpisodeNumber,
  deriveEpisodeStatus,
} from './utils.js';

const TEST_DIR = '/tmp/moltbook-test-utils';

describe('Episode Utils', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, 'episodes'), { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('formatEpisodeNumber', () => {
    it('pads single digit with zeros', () => {
      expect(formatEpisodeNumber(1)).toBe('001');
      expect(formatEpisodeNumber(9)).toBe('009');
    });

    it('pads double digit with one zero', () => {
      expect(formatEpisodeNumber(10)).toBe('010');
      expect(formatEpisodeNumber(99)).toBe('099');
    });

    it('handles triple digit', () => {
      expect(formatEpisodeNumber(100)).toBe('100');
    });
  });

  describe('getNextEpisodeNumber', () => {
    it('returns 1 when no episodes exist', () => {
      const episodesDir = join(TEST_DIR, 'episodes');
      expect(getNextEpisodeNumber(episodesDir)).toBe(1);
    });

    it('returns max + 1 when episodes exist', () => {
      const episodesDir = join(TEST_DIR, 'episodes');
      mkdirSync(join(episodesDir, '001'));
      mkdirSync(join(episodesDir, '003'));
      expect(getNextEpisodeNumber(episodesDir)).toBe(4);
    });

    it('ignores non-numeric directories', () => {
      const episodesDir = join(TEST_DIR, 'episodes');
      mkdirSync(join(episodesDir, '001'));
      mkdirSync(join(episodesDir, 'notanepisode'));
      expect(getNextEpisodeNumber(episodesDir)).toBe(2);
    });
  });

  describe('deriveEpisodeStatus', () => {
    it('returns draft when no audio', () => {
      const episodeDir = join(TEST_DIR, 'episodes', '001');
      mkdirSync(episodeDir, { recursive: true });
      writeFileSync(join(episodeDir, 'metadata.json'), '{}');
      expect(deriveEpisodeStatus(episodeDir, TEST_DIR)).toBe('draft');
    });

    it('returns recorded when has audio but no transcript', () => {
      const episodeDir = join(TEST_DIR, 'episodes', '001');
      mkdirSync(episodeDir, { recursive: true });
      writeFileSync(join(episodeDir, 'audio.mp3'), 'fake');
      expect(deriveEpisodeStatus(episodeDir, TEST_DIR)).toBe('recorded');
    });

    it('returns transcribed when has transcript but not published', () => {
      const episodeDir = join(TEST_DIR, 'episodes', '001');
      mkdirSync(episodeDir, { recursive: true });
      writeFileSync(join(episodeDir, 'audio.mp3'), 'fake');
      writeFileSync(join(episodeDir, 'transcript.json'), '{}');
      expect(deriveEpisodeStatus(episodeDir, TEST_DIR)).toBe('transcribed');
    });

    it('returns published when docs/episodes/00X exists', () => {
      const episodeDir = join(TEST_DIR, 'episodes', '001');
      const docsDir = join(TEST_DIR, 'docs', 'episodes', '001');
      mkdirSync(episodeDir, { recursive: true });
      mkdirSync(docsDir, { recursive: true });
      writeFileSync(join(episodeDir, 'audio.mp3'), 'fake');
      writeFileSync(join(episodeDir, 'transcript.json'), '{}');
      expect(deriveEpisodeStatus(episodeDir, TEST_DIR)).toBe('published');
    });
  });
});
