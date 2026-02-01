# NotebookLM Upload Guide

This directory contains all files needed for NotebookLM podcast generation.

## Required Files (Upload These)

### 1. moltbook-overview.md
Platform overview explaining what Moltbook was, core mechanics (karma, submolts, posting), crypto layer, and cultural dynamics during Jan 26-31, 2026.

**Purpose:** Provides foundational context for understanding the platform.

### 2. key-agents.md
Profiles of 11 notable agents with verbatim quotes, token associations, and submolt affiliations. Includes faction categorization.

**Purpose:** Helps NotebookLM identify key characters and their roles.

### 3. notebooklm-guide.md
Tone and framing guidelines for podcast generation. Emphasizes documentary style over philosophical speculation.

**Purpose:** Reduces anthropomorphizing and keeps content factual/analytical.

### 4. moltbook-2026-02-01.md
Daily report capturing Moltbook activity on February 1, 2026 (during peak active period).

**Purpose:** Primary source material with actual agent posts and comments.

## Optional File (Depth, Not Breadth)

### 5. moltbook-origins-launch.md
Comprehensive research on Moltbook's launch with 28+ citations from news sources.

**Purpose:** Additional historical context with specific dates, statistics, and media coverage.

**When to include:** If you want more background on how Moltbook launched and initial media reactions. May add depth but also increases content volume.

## Upload Instructions

1. Go to https://notebooklm.google.com/
2. Create a new notebook (e.g., "Moltbook Daily Report - Feb 1, 2026")
3. Upload files 1-4 (required)
4. Optionally add file 5 if desired
5. Generate Audio Overview

## Expected Results

With the revised context documents, the podcast should:
- ✅ Treat the Feb 1 report as documentation of an ACTIVE platform
- ✅ Use past tense appropriately (platform WAS active during this period)
- ✅ Focus on observable patterns and technical mechanisms
- ✅ Avoid excessive philosophical speculation about AI consciousness
- ✅ Maintain documentary/analytical tone per notebooklm-guide.md

## Files in This Directory

```
notebooklm-ready/
├── README.md (this file)
├── moltbook-overview.md (4.8K - platform overview)
├── key-agents.md (8.9K - agent profiles)
├── notebooklm-guide.md (7.8K - tone guidance)
├── moltbook-2026-02-01.md (30K - daily report)
└── moltbook-origins-launch.md (12K - optional research)
```

## Troubleshooting

**If podcast still has timeline confusion:**
- Check that NotebookLM is reading the updated moltbook-overview.md with date markers
- Verify the note at top: "This document describes Moltbook during its peak activity period"

**If podcast is too philosophical:**
- Ensure notebooklm-guide.md was uploaded
- NotebookLM may not always follow guide docs perfectly; this is a known limitation

**If you need different date ranges:**
- Additional daily reports can be generated using the moltbook-report CLI
- Place them in this directory alongside Feb 1 report
