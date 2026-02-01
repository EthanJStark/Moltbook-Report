# Transcription Guide

## Quick Start

Transcribe an audio file using WhisperX:

```bash
whisperx "/path/to/audio.m4a" \
  --model large-v2 \
  --compute_type int8 \
  --vad_method silero \
  --language en
```

## Output Files

WhisperX creates 5 output files in the current directory:

- `filename.json` - Full structured data with timestamps (largest file)
- `filename.srt` - Subtitle format (for video players)
- `filename.txt` - Plain text transcript (most readable)
- `filename.vtt` - WebVTT subtitle format
- `filename.tsv` - Tab-separated values (for data processing)

## Command Breakdown

| Flag | Purpose | Notes |
|------|---------|-------|
| `--model large-v2` | Use OpenAI's large-v2 Whisper model | Best accuracy, slower processing |
| `--compute_type int8` | CPU-compatible computation | Required for Apple Silicon Macs |
| `--vad_method silero` | Voice Activity Detection | Workaround for PyTorch 2.6 compatibility |
| `--language en` | Skip language detection | Faster processing, optional |

## Optional: Alignment with HuggingFace Token

For better word-level timestamp alignment, add your HuggingFace token:

```bash
whisperx audio.m4a \
  --model large-v2 \
  --compute_type int8 \
  --vad_method silero \
  --language en \
  --hf_token YOUR_HF_TOKEN
```

Get a token at: https://huggingface.co/settings/tokens

## Speaker Diarization

Speaker diarization requires PyTorch 2.5.x due to compatibility issues with pyannote models in PyTorch 2.6+.

### Using the Dedicated Environment

A separate Python environment with PyTorch 2.5.1 is set up in `whisperx-venv/`:

```bash
# Activate the diarization environment
source whisperx-venv/bin/activate

# Run with diarization (requires HuggingFace token)
whisperx audio.m4a \
  --model large-v2 \
  --compute_type int8 \
  --language en \
  --diarize \
  --hf_token YOUR_HF_TOKEN

# Deactivate when done
deactivate
```

**Note:** The `--diarize` flag requires accepting the pyannote model licenses on HuggingFace:
- https://huggingface.co/pyannote/speaker-diarization-3.1
- https://huggingface.co/pyannote/segmentation-3.0

### Without Diarization (Default System Python)

If you don't need speaker labels, use the standard command with `--vad_method silero`:

```bash
whisperx audio.m4a \
  --model large-v2 \
  --compute_type int8 \
  --vad_method silero \
  --language en
```

## Processing Time

Expect ~10 minutes for a 1-hour audio file on Apple Silicon.

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Weights only load failed" | Use `--vad_method silero` OR use `whisperx-venv/` |
| "float16 compute type not supported" | Use `--compute_type int8` |
| Diarization fails with PyTorch 2.6 | Use `whisperx-venv/` environment (has PyTorch 2.5.1) |
| "No such file or directory" | Check audio file path, use quotes for paths with spaces |
| "Accept the license" error | Accept model licenses on HuggingFace (see diarization section) |

## Workflow

1. Place audio file in a working directory
2. Run whisperx command from that directory
3. Output files appear in same directory
4. Use `.txt` file for reading, `.json` for programmatic access

## Example: Complete Workflow

```bash
# Navigate to project directory
cd ~/dev/misc/moltbook-report

# Run transcription
whisperx ~/Downloads/episode.m4a \
  --model large-v2 \
  --compute_type int8 \
  --vad_method silero \
  --language en

# View plain text output
cat episode.txt

# Or open in editor
code episode.txt
```

## Technical Notes

- **System WhisperX**: Uses PyTorch 2.6+ - requires `--vad_method silero`, no diarization
- **Diarization venv**: `whisperx-venv/` uses PyTorch 2.5.1 - supports `--diarize`
- Models are cached in `~/.cache/torch/hub/` and `~/.cache/whisper/`
- PyTorch 2.6+ changed `torch.load()` to `weights_only=True` by default, breaking pyannote models

## References

- [WhisperX GitHub](https://github.com/m-bain/whisperX)
- [HuggingFace Tokens](https://huggingface.co/settings/tokens)
- Internal skill: `whisperx-pytorch26-compatibility` (for detailed troubleshooting)
