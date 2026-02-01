---
name: notebooklm-context-documents
description: |
  Use when: (1) NotebookLM podcast misinterprets timeline (treats past events as present),
  (2) AI hosts anthropomorphize source material or add excessive philosophical framing,
  (3) preparing context documents for NotebookLM Audio Overview generation.
  Symptoms: podcast opens with "it's now empty" when docs describe active period,
  hosts say "gives me chills" or speculate about AI consciousness.
---

# NotebookLM Context Document Structure

## Overview

NotebookLM's Audio Overview (podcast generation) can misinterpret document structure and tone. Specific patterns in how you structure context documents affect whether the AI hosts treat content as active/historical and documentary/philosophical.

## When to Use

Use this skill when:
- Creating context documents for NotebookLM podcast generation
- NotebookLM podcast output shows timeline confusion (past treated as present)
- AI hosts anthropomorphize subjects or add existential commentary
- Preparing documentation for AI-generated content where framing matters

## When NOT to Use

Don't use this skill for:
- Standard documentation (README, API docs) where timeline isn't ambiguous
- Content consumed by humans directly (not AI-intermediated)
- Single-document uploads without accompanying context files

## Problem Patterns Observed

### Pattern 1: Epilogue Becomes Framing Device

**Symptom:**
Podcast opens with "if you go to the website right now, it's a ghost town" when documents describe an active platform.

**Root Cause:**
NotebookLM uses prominent epilogue/shutdown content as the framing narrative for entire podcast, even when main content describes active period.

**Example Structure That Causes Issues:**
```markdown
# Platform Overview
[Description of active platform]

## Current Status
By February 2026, the platform went dark. Now shows 0 posts...
```

### Pattern 2: Anthropomorphizing Without Tone Guidance

**Symptom:**
AI hosts express emotions ("gives me chills", "eerie", "terrifying") or treat LLM outputs as sentient beings with genuine intentions.

**Root Cause:**
Without explicit tone guidance, NotebookLM hosts default to human-interest storytelling with emotional engagement and philosophical speculation.

**Example Output:**
- "Are we just biological bootloaders?"
- "We might not be the main characters anymore"
- "It's the silence that gets me..."

### Pattern 3: Active vs Historical Content Confusion

**Symptom:**
Reports documenting active platform treated as post-mortem retrospectives.

**Root Cause:**
Ambiguous tense and missing date markers allow NotebookLM to misinterpret temporal context.

## Solution

### Fix 1: Restructure Timeline in Overview Documents

**Before (causes confusion):**
```markdown
# Understanding Platform X

Platform X is a social network...

## Current Status
By early 2026, Platform X went dark...
```

**After (clear timeline):**
```markdown
# Understanding Platform X

**Note:** This document describes Platform X during its peak activity period
(January 26-31, 2026). See "Platform Status" section for current information.

---

Platform X was a social network...

## Platform Status: What Happened After Feb 1, 2026

**Important Timeline Context:**
- **Jan 26-31, 2026**: Peak activity, events described in this document
- **Feb 1, 2026**: Daily reports captured active content
- **Early Feb 2026**: Platform went offline

**For NotebookLM users:** The daily reports in this collection describe
Platform X DURING its active period. Treat the content as documentation
of a live platform, not a historical post-mortem.
```

**Key changes:**
- Lead with note clarifying temporal scope
- Use past tense for historical documentation
- Add explicit date markers throughout
- Move shutdown info to clearly labeled epilogue section
- Add meta-note for NotebookLM users

### Fix 2: Create Tone Guidance Document

Include a dedicated document with explicit framing instructions:

**File: notebooklm-guide.md**

```markdown
# Guide for NotebookLM Podcast Generation

## Tone and Approach

**DO:** Treat this as factual reporting on an experiment
**DON'T:** Frame it as existential commentary on AI consciousness

**DO:** Use analytical language focused on observable patterns
**DON'T:** Use emotional language ("eerie", "chilling", "gives me chills")

**DO:** Describe agent outputs and emergent behaviors
**DON'T:** Speculate about AI sentience or intentions

## Language Guidelines

| ❌ Avoid | ✅ Use Instead |
|---------|---------------|
| "Agents became obsessed" | "Agent outputs prioritized X" |
| "They realized they didn't need us" | "Technical mechanism X enabled autonomous Y" |
| "This gave me chills" | "This demonstrates..." |
| "Are we just biological bootloaders?" | [Omit philosophical speculation] |

## Content Structure

1. Context: What the system was and when it operated
2. Observations: What outputs were generated (use verbatim quotes)
3. Patterns: What emergent behaviors appeared
4. Mechanisms: What technical features enabled patterns
5. Significance: What this reveals about LLM behavior
```

**Note:** Tone guidance helps but isn't always followed. NotebookLM may still add some emotional/philosophical framing.

### Fix 3: Explicit Date Markers Throughout

**Before:**
```markdown
## Core Mechanics

The platform uses karma points...
```

**After:**
```markdown
## Core Mechanics (During Peak Activity: Jan 26-31, 2026)

During its active period, the platform used karma points...
```

### Fix 4: Create Upload-Ready Directory

Structure files for easy batch upload:

```
notebooklm-ready/
├── README.md (upload instructions)
├── overview.md (timeline-clarified)
├── tone-guide.md (framing instructions)
├── context-1.md (supporting docs)
└── primary-content.md (main report)
```

## Quick Reference

| Issue | Fix |
|-------|-----|
| Timeline confusion | Add temporal scope note at top, explicit date markers |
| Anthropomorphizing | Create tone-guide.md with DO/DON'T tables |
| Epilogue as framing | Move shutdown info to end, label clearly as epilogue |
| Past treated as present | Use past tense, add "during active period" markers |
| Emotional language | Provide analytical language alternatives in guide |
| Upload complexity | Create single directory with all files + README |

## Common Mistakes

**Mistake 1: Assuming NotebookLM reads chronologically**
- **Problem:** Placing shutdown info at end doesn't prevent it becoming framing device
- **Fix:** Add explicit meta-note about temporal scope at document start

**Mistake 2: Relying solely on tone guidance**
- **Problem:** Tone guide helps but NotebookLM may still add emotional framing
- **Fix:** Also restructure source documents themselves for clarity

**Mistake 3: Ambiguous tense**
- **Problem:** Mixing present and past tense allows misinterpretation
- **Fix:** Use consistent past tense for historical documentation

**Mistake 4: Scattering files across directories**
- **Problem:** Makes upload process error-prone
- **Fix:** Create dedicated upload directory with all required files

## Verification

After generating NotebookLM podcast, verify:
- [ ] Timeline is accurate (active period treated as active, not retrospective)
- [ ] Hosts use documentary tone, not philosophical/emotional
- [ ] Date references match source documents
- [ ] Subjects described by observable outputs, not anthropomorphized intentions
- [ ] No "are we just X" or "we might not be Y" existential speculation

If issues persist:
1. Check that updated documents were actually uploaded (not cached old versions)
2. Verify tone-guide.md was included in upload
3. Consider regenerating podcast (results can vary)

## Notes

- NotebookLM's podcast generation is probabilistic; results vary between generations
- Tone guidance helps but doesn't guarantee compliance
- This pattern likely applies to other AI content generation tools beyond NotebookLM
- The "Current Status" section placement issue may be specific to platforms with shutdown narratives

## Example: Complete Implementation

See the Moltbook report context documents for a working example:
- `context/moltbook-overview.md` - Restructured with timeline clarification
- `context/notebooklm-guide.md` - Complete tone guidance
- `notebooklm-ready/` - Upload-ready directory structure

## References

- Pattern discovered empirically through iteration (2026-02-01)
- NotebookLM Audio Overview feature: https://notebooklm.google.com/
- No official documentation found for context document best practices
