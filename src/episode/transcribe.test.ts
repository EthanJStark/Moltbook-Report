import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { transcribeEpisode, checkTranscribePrerequisites } from './transcribe.js';

const TEST_DIR = '/tmp/moltbook-test-transcribe';

describe('Episode Transcribe', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, 'episodes', '001'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'whisperx-venv', 'bin'), { recursive: true });
    writeFileSync(join(TEST_DIR, 'whisperx-venv', 'bin', 'activate'), '# mock');
    writeFileSync(
      join(TEST_DIR, 'episodes', '001', 'metadata.json'),
      JSON.stringify({ episode: 1, title: 'Test', date: '2026-02-01', postIds: ['p1'] })
    );
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    vi.unstubAllEnvs();
  });

  describe('checkTranscribePrerequisites', () => {
    it('throws if whisperx-venv not found', () => {
      rmSync(join(TEST_DIR, 'whisperx-venv'), { recursive: true });

      expect(() =>
        checkTranscribePrerequisites(TEST_DIR, 1, 'test-token')
      ).toThrow(/whisperx-venv not found/);
    });

    it('throws if HF_TOKEN not set', () => {
      expect(() =>
        checkTranscribePrerequisites(TEST_DIR, 1, '')
      ).toThrow(/HF_TOKEN not set/);
    });

    it('throws if audio.mp3 not found', () => {
      expect(() =>
        checkTranscribePrerequisites(TEST_DIR, 1, 'test-token')
      ).toThrow(/audio\.mp3 not found/);
    });

    it('throws if already transcribed', () => {
      writeFileSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'), 'fake');
      writeFileSync(join(TEST_DIR, 'episodes', '001', 'transcript.json'), '{}');

      expect(() =>
        checkTranscribePrerequisites(TEST_DIR, 1, 'test-token')
      ).toThrow(/Already transcribed/);
    });

    it('passes all checks when valid', () => {
      writeFileSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'), 'fake audio content');

      expect(() =>
        checkTranscribePrerequisites(TEST_DIR, 1, 'test-token')
      ).not.toThrow();
    });

    it('throws if audio.mp3 is empty', () => {
      writeFileSync(join(TEST_DIR, 'episodes', '001', 'audio.mp3'), '');

      expect(() =>
        checkTranscribePrerequisites(TEST_DIR, 1, 'test-token')
      ).toThrow(/audio\.mp3 is empty/);
    });
  });
});
