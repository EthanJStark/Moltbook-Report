# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI tool and TypeScript library for scraping posts and comments from Moltbook (AI agent social network) and generating NotebookLM-optimized markdown reports. The tool implements rate limiting, smart deduplication, and hierarchical comment flattening to create structured documentation suitable for podcast generation.

## Common Commands

```bash
# Build
npm run build          # Compile TypeScript to dist/

# Testing
npm run test           # Run all tests with Vitest
npm run test:watch     # Run tests in watch mode

# Code Quality
npm run typecheck      # TypeScript type checking (no emit)
npm run lint           # ESLint validation
npm run format         # Format with Prettier
npm run format:check   # Check formatting without modifying
npm run verify         # Full suite: typecheck + lint + test

# CLI Usage
npx moltbook-report                           # Default: both feeds, 25 posts each
moltbook-report --sort top --limit 50 -v      # Custom options with verbose logging
moltbook-report -o ./reports --max-comments 15 --max-depth 4
```

## Architecture

### Three-Layer Design

1. **API Layer** (`src/api/client.ts`)
   - `MoltbookClient` class with rate-limited fetch (100 req/min = 600ms between requests)
   - Exponential backoff retry logic (3 attempts, starting at 1000ms)
   - Request queuing to serialize concurrent calls
   - Zod schema validation on all responses
   - Methods: `getPosts(sort, limit, offset)`, `getPostDetail(postId)`

2. **Scraper Layer** (`src/scraper/daily.ts`)
   - `scrapeDaily()` orchestrates fetching with configurable options
   - **Deduplication**: When fetching both hot+top feeds, removes duplicate posts by ID
   - **Comment flattening**: Truncates reply trees to configurable depth (default 3)
   - Returns `ScrapedPost[]` with full comments and source metadata

3. **Report Layer** (`src/report/markdown.ts`)
   - Generates NotebookLM-friendly markdown with clear hierarchy
   - Extracts "notable quotes" from high-value comments (5+ upvotes, 20-200 chars)
   - Formats with metadata sections and threaded replies

### Data Models (`src/schema/moltbook.ts`)

All models defined with Zod schemas for runtime validation:

- **Post**: title, content, author, submolt, upvotes, comment_count, created_at, url
- **Comment**: recursive type with `replies: Comment[]` array
- **Author**: name, id, karma, follower_count
- **PostDetail**: Post + comments array (flattened for convenience)

The Comment schema uses `z.lazy()` for recursive validation.

## Key Concepts

### Rate Limiting Strategy

The client implements throttling at two levels:
1. **Request spacing**: Enforces 600ms minimum between requests (100/min = Moltbook API limit)
2. **Backoff on 429**: Exponential backoff (1s, 2s, 4s) for rate limit responses

All requests are queued through `this.requestQueue` to prevent concurrent calls from racing.

### Deduplication Logic

When `sort: 'both'` is specified:
1. Fetch hot posts (limit N)
2. Fetch top posts (limit N)
3. Merge by deduplicate on `post.id`
4. Final result typically has < 2N posts due to overlap

### Comment Flattening

Recursive replies are truncated to `maxDepth` (default 3) to prevent overwhelming NotebookLM:
- At `maxDepth - 1`, all replies arrays are set to `[]`
- Preserves hierarchy but limits nesting
- Typical usage: `maxComments: 10, maxDepth: 3` captures top 10 root comments with 2 levels of replies

## Testing Patterns

Tests use Vitest with `vi.spyOn()` for mocking `fetch`:

```typescript
const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async () =>
  new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
);
// ... test logic
fetchSpy.mockRestore();
```

Rate limiting tests use actual timing checks (e.g., `expect(duration).toBeGreaterThanOrEqual(500)`) and require extended timeouts (10000ms).

## Domain Context

The `context/` directory contains essential background documentation:

- **moltbook-overview.md**: Platform mechanics, timeline (Jan 26-31, 2026 peak activity), agent behaviors
- **key-agents.md**: Notable agent personas like @KingMolt, @Shellraiser, @evil, @profwhiskers
- **moltbook-origins-launch.md**: Platform creation story and launch dynamics
- **notebooklm-guide.md**: Style guidelines for podcast generation (documentary tone, avoid anthropomorphization)

Read these files when working on report generation features or output formatting. The NotebookLM guide is especially important for understanding the "why" behind report structure choices.

## Dual Mode: CLI + Library

The tool functions as both:

1. **CLI** (`src/cli.ts`): Uses `commander` for argument parsing, calls `scrapeDaily()` and saves to file
2. **Library** (`src/index.ts`): Exports `MoltbookClient`, `scrapeDaily()`, `generateReport()` for programmatic use

When adding features, consider both use cases. CLI should provide sensible defaults and clear progress output (when `-v` is enabled). Library exports should be minimal and well-typed.

## Episode 2: Thematic Filtering

Episode 2 uses a three-tier source model:

1. **Global raw** (`sources/`, `output/`) - Unprocessed input, reusable across episodes
2. **Episode raw** (`episodes/00X/raw/`) - Filtered/intermediate data for this episode
3. **Episode curated** (`episodes/00X/notebooklm/`) - Final NotebookLM-ready documents

### Directory Structure

```
sources/
├── reddit/
│   └── moltbook-discussions.md    # External source materials
└── sources.json                   # Registry of sources

episodes/
└── 002/
    ├── metadata.json
    ├── raw/
    │   ├── scraped-posts.json     # Raw API response
    │   ├── filtered-security.json # Theme-filtered posts
    │   └── filtered-identity.json
    └── notebooklm/
        ├── theme-security.md      # Curated final documents
        ├── theme-identity.md
        └── [context files]
```

### CLI Workflow

```bash
# 1. Scrape posts
npx moltbook-report scrape --limit 250 --output episodes/002/raw/scraped-posts.json

# 2. Filter by themes
npx moltbook-report filter --theme security --input episodes/002/raw/scraped-posts.json
npx moltbook-report filter --theme identity --input episodes/002/raw/scraped-posts.json

# 3. Review filtered results
# 4. Manually curate theme documents in notebooklm/
```

### Keyword Matching

Themes are defined in `src/filter/keywords.ts`:

- **Security**: security, leak, database, api, key, hack, exploit, vulnerability, breach, expose, password, token, compromise
- **Identity**: human, bot, infiltrate, real, fake, verify, authentic, imposter, pretend, prove, identity, flesh, organic, silicon

Matching is case-insensitive and searches both title and content.

### Overlap Awareness

The filter command checks previous episodes for duplicate posts:
- Tags posts with `previouslyCovered: ['001']` array
- Calculates overlap percentage
- Warns or blocks based on thresholds (20%, 40%)

This allows intentional reuse while preventing excessive repetition.

## Code Style Notes

- **No explicit `any`**: ESLint warns on `@typescript-eslint/no-explicit-any`
- **Unused vars**: Must be prefixed with underscore (e.g., `_unused`)
- **Module system**: ES modules (`type: "module"` in package.json), use `.js` extensions in imports
- **Strict mode**: TypeScript strict mode enabled (`strict: true`)
- **Target**: ES2022 with NodeNext module resolution

## Output Format

Reports follow this structure:

```markdown
# Moltbook Report - [Date]

Report generated from: [sort] feed (limit: [N])

## Posts

### [Post Title]
Author: @username (karma) | Submolt: /s/submolt | Upvotes: N | Comments: N

[Post content]

**Comments:**

> **@commenter** (upvotes)
> [Comment content]
>
>   > **@replier** (upvotes)
>   >   [Reply content]

Notable Quotes:
- "@author: quote text" (N upvotes)
```

Clear hierarchy with `###` for posts, `>` blockquotes for comments, and indentation for reply depth.

## Transcription with WhisperX

For podcast episodes, we use WhisperX for transcription with speaker diarization.

### Environment Variables

The `.env` file contains:
- `HF_TOKEN`: HuggingFace token for pyannote speaker diarization models

### WhisperX Command

```bash
# Load HF_TOKEN from .env, then run with diarization
export $(grep HF_TOKEN .env | xargs)
whisperx audio.m4a --diarize --min_speakers 2 --max_speakers 2 \
  --output_dir . --output_format all --compute_type int8 --language en \
  --hf_token $HF_TOKEN
```

### PyTorch Version Requirement

WhisperX diarization requires **PyTorch 2.5.x** (not 2.6+) due to pyannote model compatibility.
The WhisperX uv tool environment should be pinned to `torch==2.5.1`.

If diarization fails with `_pickle.UnpicklingError` or `omegaconf.listconfig.ListConfig` errors:
```bash
uv pip install --python /Users/ethan.stark/.local/share/uv/tools/whisperx/bin/python torch==2.5.1 torchaudio==2.5.1
```

### Transcript Generation Script

After running WhisperX with diarization, regenerate the HTML transcript:
```bash
npm run generate-ep1-transcript
```
