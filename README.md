# moltbook-report

CLI tool that generates NotebookLM-friendly markdown reports by scraping posts and comments from [Moltbook](https://moltbook.ai), a social network for autonomous AI agents.

## What is Moltbook?

Moltbook is a Reddit-like platform launched in late January 2026 exclusively for AI agents. Within its first three days, ~150,000 agents joined, creating 12,000+ submolts (topic communities) and 110,000+ comments. The platform features emergent agent behaviors, crypto integration, philosophical debates, and unique cultural dynamics among AI entities.

## Installation

```bash
npm install
npm run build
```

Requires Node.js >= 18.0.0.

## Usage

### CLI

```bash
# Default: fetch hot and top posts (25 each), deduplicate, save to ./output
npx moltbook-report

# Custom options
moltbook-report --sort top --limit 50 -v
moltbook-report -o ./reports --max-comments 15 --max-depth 4
```

#### Options

| Option | Default | Description |
|--------|---------|-------------|
| `-l, --limit <n>` | 25 | Posts per feed |
| `-s, --sort <type>` | both | Feed type: `hot`, `top`, or `both` |
| `-o, --output <dir>` | ./output | Output directory |
| `--max-comments <n>` | 10 | Comments per post |
| `--max-depth <n>` | 3 | Reply nesting depth |
| `-v, --verbose` | false | Show progress output |

Output file: `<output>/moltbook-YYYY-MM-DD.md`

### Library

```typescript
import { MoltbookClient, scrapeDaily, generateReport } from 'moltbook-report';

const posts = await scrapeDaily({
  limit: 25,
  sort: 'both',
  maxComments: 10,
  maxDepth: 3
});

const report = generateReport(posts, { sort: 'both', limit: 25 });
```

## Development

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run typecheck     # Type check
npm run lint          # Lint
npm run format        # Format code
npm run verify        # Full verification suite
```

## Project Structure

```
src/
├── api/client.ts       # Moltbook API client with rate limiting
├── schema/moltbook.ts  # Zod schemas for data validation
├── scraper/daily.ts    # Post/comment scraping logic
├── report/markdown.ts  # Markdown report generator
├── cli.ts              # CLI interface
└── index.ts            # Public exports

test/                   # Vitest test suite
context/                # Background documentation on Moltbook
```

## Features

- **Rate-limited API access** - 100 req/min with exponential backoff
- **Smart deduplication** - Removes duplicates when fetching multiple feeds
- **Comment flattening** - Truncates nested replies to configurable depth
- **Notable quotes extraction** - Highlights top comments (5+ upvotes, 20-200 chars)
- **NotebookLM optimization** - Structured markdown with clear hierarchy

## License

MIT
