import { existsSync, readFileSync, writeFileSync, renameSync, statSync } from 'fs';
import { join, basename } from 'path';
import { spawn } from 'child_process';
import { parseMetadata } from './schema.js';
import { getEpisodeDir, formatEpisodeNumber } from './utils.js';

export interface TranscribeEpisodeOptions {
  projectRoot: string;
  episodeNumber: number;
  timeout?: number; // in seconds, default 600
  verbose?: boolean;
}

export interface TranscribeResult {
  speakerCount: number;
  transcriptPath: string;
}

/**
 * Check prerequisites before transcription
 */
export function checkTranscribePrerequisites(
  projectRoot: string,
  episodeNumber: number,
  hfToken: string
): void {
  const venvPath = join(projectRoot, 'whisperx-venv', 'bin', 'activate');
  if (!existsSync(venvPath)) {
    throw new Error('whisperx-venv not found. See README for setup.');
  }

  if (!hfToken) {
    throw new Error('HF_TOKEN not set. Required for diarization.');
  }

  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const audioPath = join(episodeDir, 'audio.mp3');

  if (!existsSync(audioPath)) {
    throw new Error(`audio.mp3 not found for episode ${episodeNumber}`);
  }

  // Check file is not empty
  const stats = statSync(audioPath);
  if (stats.size === 0) {
    throw new Error(`audio.mp3 is empty for episode ${episodeNumber}`);
  }

  const transcriptPath = join(episodeDir, 'transcript.json');
  if (existsSync(transcriptPath)) {
    throw new Error('Already transcribed. Delete transcript files to re-run.');
  }
}

/**
 * Run whisperx transcription with diarization
 */
export async function transcribeEpisode(
  options: TranscribeEpisodeOptions
): Promise<TranscribeResult> {
  const { projectRoot, episodeNumber, timeout = 600, verbose } = options;

  const hfToken = process.env.HF_TOKEN || '';
  checkTranscribePrerequisites(projectRoot, episodeNumber, hfToken);

  const episodeDir = getEpisodeDir(projectRoot, episodeNumber);
  const audioPath = join(episodeDir, 'audio.mp3');

  const command = `source ${join(projectRoot, 'whisperx-venv', 'bin', 'activate')} && \\
    timeout ${timeout}s whisperx "${audioPath}" \\
      --model large-v2 \\
      --compute_type int8 \\
      --language en \\
      --diarize \\
      --hf_token "${hfToken}" \\
      --output_dir "${episodeDir}"`;

  if (verbose) {
    console.log('Running whisperx...');
  }

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('bash', ['-c', command], {
      stdio: verbose ? 'inherit' : 'pipe',
    });

    proc.on('close', (code) => {
      if (code === 124) {
        reject(new Error(`Transcription timed out after ${timeout}s. Try increasing --timeout.`));
      } else if (code !== 0) {
        reject(new Error(`Whisperx failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start whisperx: ${err.message}`));
    });
  });

  // Rename outputs to consistent names
  const audioBasename = basename(audioPath, '.mp3');
  const possibleOutputs = [
    { from: `${audioBasename}.txt`, to: 'transcript.txt' },
    { from: `${audioBasename}.vtt`, to: 'transcript.vtt' },
    { from: `${audioBasename}.json`, to: 'transcript.json' },
    { from: `${audioBasename}.tsv`, to: 'transcript.tsv' },
    { from: `${audioBasename}.srt`, to: 'transcript.srt' },
  ];

  for (const { from, to } of possibleOutputs) {
    const fromPath = join(episodeDir, from);
    const toPath = join(episodeDir, to);
    if (existsSync(fromPath) && from !== to) {
      renameSync(fromPath, toPath);
    }
  }

  // Parse speaker count from transcript.json
  const transcriptPath = join(episodeDir, 'transcript.json');
  let speakerCount = 0;

  if (existsSync(transcriptPath)) {
    const transcript = JSON.parse(readFileSync(transcriptPath, 'utf-8'));
    const speakers = new Set<string>();
    if (Array.isArray(transcript.segments)) {
      for (const segment of transcript.segments) {
        if (segment.speaker) {
          speakers.add(segment.speaker);
        }
      }
    }
    speakerCount = speakers.size;
  }

  // Update metadata with speaker count
  const metadataPath = join(episodeDir, 'metadata.json');
  if (existsSync(metadataPath)) {
    const metadata = parseMetadata(readFileSync(metadataPath, 'utf-8'));
    metadata.speakerCount = speakerCount;
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  if (verbose) {
    console.log(`Transcription complete. Found ${speakerCount} speakers.`);
  }

  return {
    speakerCount,
    transcriptPath,
  };
}
