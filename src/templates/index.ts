import { formatEpisodeNumber } from '../episode/utils.js';

export interface EpisodePageOptions {
  episode: number;
  title: string;
  date: string;
  baseUrl: string;
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export interface TranscriptPageOptions {
  episode: number;
  title: string;
  segments: TranscriptSegment[];
}

export interface IndexPageOptions {
  episodes: Array<{ episode: number; title: string; date: string }>;
  baseUrl: string;
}

export interface RssFeedOptions {
  episodes: Array<{ episode: number; title: string; date: string; description?: string }>;
  baseUrl: string;
  title: string;
  description: string;
}

const SPEAKER_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#6366f1'];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(text: string): string {
  return escapeHtml(text).replace(/'/g, '&apos;');
}

export function generateEpisodePage(options: EpisodePageOptions): string {
  const { episode, title, date, baseUrl } = options;
  const episodeNum = formatEpisodeNumber(episode);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode}: ${escapeHtml(title)} - Moltbook Report</title>
  <style>
    body { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.6; }
    h1 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
    audio { width: 100%; margin: 1rem 0; }
    .meta { color: #6b7280; font-size: 0.875rem; }
    nav { margin-bottom: 2rem; }
    nav a { color: #2563eb; }
  </style>
</head>
<body>
  <nav><a href="../">← All Episodes</a></nav>
  <h1>Episode ${episode}: ${escapeHtml(title)}</h1>
  <p class="meta">Published: ${date}</p>
  <audio controls preload="metadata">
    <source src="audio.mp3" type="audio/mpeg">
    Your browser does not support the audio element.
  </audio>
  <p><a href="transcript.html">View Transcript</a></p>
</body>
</html>`;
}

export function generateTranscriptPage(options: TranscriptPageOptions): string {
  const { episode, title, segments } = options;

  // Consolidate consecutive same-speaker segments
  const consolidated: Array<{ speaker: string; text: string }> = [];
  for (const seg of segments) {
    const last = consolidated[consolidated.length - 1];
    if (last && last.speaker === seg.speaker) {
      last.text += ' ' + seg.text;
    } else {
      consolidated.push({ speaker: seg.speaker, text: seg.text });
    }
  }

  // Map speaker IDs to indices
  const speakerMap = new Map<string, number>();
  let speakerIndex = 0;
  for (const seg of consolidated) {
    if (!speakerMap.has(seg.speaker)) {
      speakerMap.set(seg.speaker, speakerIndex++);
    }
  }

  const speakerStyles = SPEAKER_COLORS.map(
    (color, i) => `.speaker-${i} { color: ${color}; }`
  ).join('\n    ');

  const transcriptHtml = consolidated
    .map((seg) => {
      const idx = speakerMap.get(seg.speaker)! % SPEAKER_COLORS.length;
      const label = `Host ${String.fromCharCode(65 + idx)}`;
      return `  <p class="speaker speaker-${idx}">${label}:</p>
  <p class="utterance">${escapeHtml(seg.text)}</p>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode} Transcript - Moltbook Report</title>
  <style>
    body { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.6; }
    h1 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
    .speaker { font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.25rem; }
    ${speakerStyles}
    .utterance { margin-left: 1rem; margin-top: 0; }
    nav { margin-bottom: 2rem; }
    nav a { color: #2563eb; }
  </style>
</head>
<body>
  <nav><a href="index.html">← Back to episode</a></nav>
  <h1>Episode ${episode}: ${escapeHtml(title)}</h1>
  <h2>Transcript</h2>
${transcriptHtml}
</body>
</html>`;
}

export function generateIndexPage(options: IndexPageOptions): string {
  const { episodes, baseUrl } = options;

  const episodeList = episodes
    .sort((a, b) => b.episode - a.episode)
    .map((ep) => {
      const num = formatEpisodeNumber(ep.episode);
      return `    <li>
      <a href="episodes/${num}/">${escapeHtml(ep.title)}</a>
      <span class="date">${ep.date}</span>
    </li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moltbook Report Podcast</title>
  <style>
    body { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.6; }
    h1 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
    ul { list-style: none; padding: 0; }
    li { padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6; }
    li a { color: #2563eb; text-decoration: none; font-weight: 500; }
    li a:hover { text-decoration: underline; }
    .date { color: #6b7280; font-size: 0.875rem; margin-left: 1rem; }
  </style>
</head>
<body>
  <h1>Moltbook Report Podcast</h1>
  <p>AI-generated deep dives into Moltbook, the AI agent social network.</p>
  <p><a href="feed.xml">RSS Feed</a></p>
  <h2>Episodes</h2>
  <ul>
${episodeList}
  </ul>
</body>
</html>`;
}

export function generateRssFeed(options: RssFeedOptions): string {
  const { episodes, baseUrl, title, description } = options;

  const items = episodes
    .sort((a, b) => b.episode - a.episode)
    .map((ep) => {
      const num = formatEpisodeNumber(ep.episode);
      const pubDate = new Date(ep.date).toUTCString();
      const episodeUrl = `${baseUrl}episodes/${num}/`;

      return `    <item>
      <title>Episode ${ep.episode}: ${escapeXml(ep.title)}</title>
      <link>${episodeUrl}</link>
      <enclosure url="${episodeUrl}audio.mp3" type="audio/mpeg"/>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(ep.description || ep.title)}</description>
      <guid isPermaLink="true">${episodeUrl}</guid>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <itunes:image href="${baseUrl}artwork.jpg"/>
    <atom:link href="${baseUrl}feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
