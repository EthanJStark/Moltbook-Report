// scripts/generate-episode-1-transcript.ts
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { generateTranscriptPage, type TranscriptSegment } from '../src/templates/index.js';

const TRANSCRIPT_JSON = 'AI_Agents_Speedrun_Civilization_on_Moltbook.json';
const OUTPUT_FILE = 'transcript-episode-1.html';

interface WhisperXSegment {
  text: string;
  start: number;
  end: number;
  words: Array<{ word: string; start: number; end: number; score: number }>;
  // Note: No speaker field - WhisperX output without diarization
}

interface WhisperXOutput {
  segments: WhisperXSegment[];
}

function main() {
  console.log('Reading transcript JSON...');
  const transcriptData: WhisperXOutput = JSON.parse(
    readFileSync(TRANSCRIPT_JSON, 'utf-8')
  );

  console.log(`Found ${transcriptData.segments.length} segments`);

  // Convert to TranscriptSegment format
  // Assign all segments to SPEAKER_00 since no diarization available
  const segments: TranscriptSegment[] = transcriptData.segments.map((seg) => ({
    speaker: 'SPEAKER_00', // Use single speaker (no diarization in source)
    text: seg.text.trim(),
    start: seg.start,
    end: seg.end,
  }));

  console.log('Generating HTML...');
  const html = generateTranscriptPage({
    episode: 1,
    title: 'AI Agents Speedrun Civilization on Moltbook',
    segments,
  });

  console.log(`Writing to ${OUTPUT_FILE}...`);
  writeFileSync(OUTPUT_FILE, html);

  console.log('✓ Transcript HTML generated successfully');
  console.log(`Open ${OUTPUT_FILE} in a browser to preview`);
}

main();
