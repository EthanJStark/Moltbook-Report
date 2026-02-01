import { describe, it, expect } from 'vitest';
import {
  generateEpisodePage,
  generateTranscriptPage,
  generateIndexPage,
  generateRssFeed,
} from './index.js';

describe('HTML Templates', () => {
  describe('generateEpisodePage', () => {
    it('includes audio player with correct src', () => {
      const html = generateEpisodePage({
        episode: 1,
        title: 'Test Episode',
        date: '2026-02-01',
        baseUrl: 'https://example.com/',
      });

      expect(html).toContain('<audio');
      expect(html).toContain('audio.mp3');
      expect(html).toContain('Test Episode');
    });

    it('includes link to transcript', () => {
      const html = generateEpisodePage({
        episode: 1,
        title: 'Test',
        date: '2026-02-01',
        baseUrl: 'https://example.com/',
      });

      expect(html).toContain('transcript.html');
    });
  });

  describe('generateTranscriptPage', () => {
    it('renders speaker labels with colors', () => {
      const segments = [
        { speaker: 'SPEAKER_00', text: 'Hello world', start: 0, end: 1 },
        { speaker: 'SPEAKER_01', text: 'Hi there', start: 1, end: 2 },
      ];

      const html = generateTranscriptPage({
        episode: 1,
        title: 'Test Episode',
        segments,
      });

      expect(html).toContain('speaker-0');
      expect(html).toContain('speaker-1');
      expect(html).toContain('Hello world');
      expect(html).toContain('Hi there');
    });

    it('consolidates consecutive same-speaker segments', () => {
      const segments = [
        { speaker: 'SPEAKER_00', text: 'Part one.', start: 0, end: 1 },
        { speaker: 'SPEAKER_00', text: 'Part two.', start: 1, end: 2 },
      ];

      const html = generateTranscriptPage({
        episode: 1,
        title: 'Test',
        segments,
      });

      // Should only have one speaker label, not two
      const speakerMatches = html.match(/class="speaker/g);
      expect(speakerMatches?.length).toBe(1);
    });
  });

  describe('generateIndexPage', () => {
    it('lists all episodes', () => {
      const episodes = [
        { episode: 1, title: 'First', date: '2026-01-01' },
        { episode: 2, title: 'Second', date: '2026-01-02' },
      ];

      const html = generateIndexPage({ episodes, baseUrl: 'https://example.com/' });

      expect(html).toContain('First');
      expect(html).toContain('Second');
      expect(html).toContain('episodes/001/');
      expect(html).toContain('episodes/002/');
    });
  });

  describe('generateRssFeed', () => {
    it('produces valid RSS 2.0 structure', () => {
      const episodes = [{ episode: 1, title: 'Test', date: '2026-02-01', description: 'Desc' }];

      const rss = generateRssFeed({
        episodes,
        baseUrl: 'https://example.com/',
        title: 'Test Podcast',
        description: 'A test podcast',
      });

      expect(rss).toContain('<?xml version="1.0"');
      expect(rss).toContain('<rss version="2.0"');
      expect(rss).toContain('xmlns:itunes');
      expect(rss).toContain('<enclosure');
      expect(rss).toContain('audio/mpeg');
    });
  });
});
