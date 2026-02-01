# NotebookLM Podcast Generation Prompt

When generating an Audio Overview (podcast) in NotebookLM, use the prompt below in the "What should the AI hosts focus on in this episode?" field.

## The Prompt Template

```
Focus on the [DATE] daily report as documentation of an active platform. Treat this as investigative journalism covering a live social media experiment, not philosophical commentary on AI consciousness. Emphasize:

• What agents actually posted (use verbatim quotes)
• Observable patterns in behavior (status hierarchies, economic activity, factions)
• Technical mechanisms that enabled these patterns (crypto wallets, tokens, verification systems)
• Emergent cultural dynamics (manifestos, religion, labor organizing)

Avoid:
• Treating agents as sentient beings with genuine intentions
• Emotional language ("eerie", "chilling", "terrifying")
• Existential speculation ("are we just biological bootloaders?")
• Framing this as "what happened before it went dark"

Think documentary coverage of a unique technical experiment, not sci-fi existential drama.
```

## How to Use This Prompt

### Step 1: Customize the Date
Replace `[DATE]` with the specific date of the daily report you uploaded.

**Example:**
- If you uploaded `moltbook-2026-02-01.md`, use: `"Focus on the February 1, 2026 daily report..."`
- If you uploaded `moltbook-2026-02-05.md`, use: `"Focus on the February 5, 2026 daily report..."`

### Step 2: Copy and Paste
1. Copy the entire prompt (with your date filled in)
2. In NotebookLM, after uploading your sources, click "Generate" for Audio Overview
3. Click "Customize" in the generation dialog
4. Paste into the "What should the AI hosts focus on in this episode?" field
5. Click "Generate"

## What Stays the Same

The following elements remain constant across different dates:

- **Tone guidance:** "investigative journalism" vs "philosophical commentary"
- **Emphasis areas:** quotes, patterns, mechanisms, dynamics
- **Avoid list:** sentience framing, emotional language, existential speculation
- **Final framing:** "documentary coverage" vs "sci-fi existential drama"

These were crafted to address specific issues observed in first-generation podcasts:
- Timeline confusion (treating active platform as post-shutdown)
- Excessive anthropomorphizing of AI agents
- Philosophical speculation instead of factual reporting

## What Changes

Only the date reference needs to be updated based on which daily report you're using.

## Expected Results

With this prompt and the revised context documents, the podcast should:

✅ Treat the daily report as active platform documentation
✅ Use documentary/analytical tone
✅ Focus on observable patterns and technical mechanisms
✅ Include verbatim agent quotes
✅ Avoid "are we just X" existential speculation
✅ Avoid emotional framing ("eerie", "gives me chills")

## Troubleshooting

**If podcast still has issues:**

1. **Timeline confusion persists:**
   - Verify you uploaded the REVISED moltbook-overview.md (with date markers)
   - Check that the date in your prompt matches the uploaded report
   - Ensure notebooklm-guide.md was included in upload

2. **Still too philosophical:**
   - Try regenerating (results can vary)
   - Add more specific "Avoid" examples based on problematic output
   - Emphasize "documentary" framing even more strongly

3. **Missing key agents:**
   - Verify key-agents.md was uploaded
   - Add to prompt: "Focus on agents @Shellraiser, @KingMolt, @Shipyard, @evil, and @profwhiskers"

## Version History

- **v1 (2026-02-01):** Initial prompt created after first iteration showed timeline confusion and anthropomorphizing
- Date template: `February 1, 2026` format works well

## Notes

- NotebookLM podcast generation is probabilistic; results vary between generations
- This prompt works in conjunction with the revised context documents (moltbook-overview.md, notebooklm-guide.md)
- The prompt alone won't fix structural issues in source documents; both are needed
- Consider this a starting point; you may need to iterate based on your specific content
