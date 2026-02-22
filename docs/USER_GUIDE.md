# User Guide

Step-by-step workflow for AI-augmented Reflexive Thematic Analysis.

This guide explains **how to use the tools**. For coding methodology (epistemology, code format, analytical questions), see the `methodology/` documents which are loaded automatically during sessions.

---

## Prerequisites

- Node.js 18+ installed
- Claude Desktop installed and configured ([see Getting Started](GETTING_STARTED.md))
- MCP server built (`npm run build`)
- Transcript file in `.md` format

---

## Session Start

Every Claude Desktop session begins the same way:

```
You: "Call init"
```

This gives Claude the critical instructions for using the RTA tools. Then load your phase methodology:

```
You: "Load methodology for phase2a"
```

Claude will show you the full methodology document. Read it, say "OK", and proceed.

---

## Phase 2a: Initial Coding

### Starting a New Transcript

```
You: "Start coding /path/to/transcript.md"

Claude: [Uses phase2a_code_start]
        Shows first chunk (~80 lines of raw text)
        Proposes codes based on methodology

You: "accept" / "modify code X to Y" / "reject"

Claude: [Uses phase2a_code_write_segment]
        Writes codes, shows progress
```

### Continuing Through the Transcript

```
You: "continue"

Claude: [Uses phase2a_code_read_next]
        Shows next chunk
        Proposes codes
        Waits for your decision
```

Repeat until all chunks are coded. The researcher always decides which codes to accept, modify, or reject.

### Key Concepts

- **Chunk** = Technical reading unit (60–100 lines). What the tool loads at a time.
- **Segment** = Semantic coding unit (variable size, marked with `/segment`). What gets coded.
- **STATUS** = Progress tracking in YAML frontmatter. Enables pause/resume across sessions.

### Coding Modes

**Standard mode:** Claude codes the current chunk as one or more segments.

**Multi-segment mode:** Claude identifies specific meaningful units within a chunk and codes each with precise line ranges. Better for citation-level precision.

### Skipping Non-Codeable Content

When a chunk contains only facilitator talk or meta-organisational content:

```
You: "Skip this chunk"

Claude: [Uses phase2a_code_skip_chunk]
        Advances to next chunk
```

### Checking Progress

```
You: "Show coding status"

Claude: [Uses phase2a_code_status]
        "12/18 segments (67%) complete"
```

### Resuming a Session

STATUS is saved in the transcript file. In a new Claude Desktop session:

```
You: "Call init"
You: "Continue coding /path/to/transcript.md"

Claude: [Uses phase2a_code_read_next]
        Picks up where you left off
```

---

## Phase 2b: Critical Review

After all segments are coded, review each one for analytical quality.

### Starting a Review

```
You: "Start a critical review of /path/to/transcript.md"

Claude: [Uses phase2b_review_start]
        Shows Phase 2b methodology (MUST be read first)
        Then presents first segment for review
```

### Review Process

For each segment:

1. Read the transcript text and assigned codes
2. Evaluate: Are codes accurate? Sufficient? Too generic?
3. Write a reflexive note capturing your analytical observation
4. Revise codes if needed

```
Claude: Shows segment text + codes

You: "The code #X is too generic, replace with #Y.
      Note: This segment shows tension between..."

Claude: [Uses phase2b_review_revise_codes — action: replace]
        [Uses phase2b_review_write_note]
        Segment marked as reviewed
```

### Moving Through Segments

```
You: "Next segment"

Claude: [Uses phase2b_review_next]
        Shows next unreviewed segment
```

To revisit a specific segment:

```
You: "Show segment 5"

Claude: [Uses phase2b_review_read_segment — index: 5]
```

### Revising Codes

Three actions available:

- **add** — Append new codes to existing ones
- **remove** — Delete specific codes
- **replace** — Replace all codes with new set

All revisions are logged with full audit trail in the review notes file.

### Restructuring Segments

If a segment contains two distinct meaning units:

```
You: "Split segment 7 at line 0145"

Claude: [Uses phase2b_review_split_segment]
        Creates two segments, copies codes to both
        "Use review_revise_codes to adjust codes on each half"
```

If two consecutive segments belong together:

```
You: "Merge segments 3 and 4"

Claude: [Uses phase2b_review_merge_segments]
        Combines text, deduplicates codes
```

### Checking Review Progress

```
You: "Show review status"

Claude: [Uses phase2b_review_status]
        "14/22 segments reviewed (64%), 6 revisions made"
```

---

## Error Recovery

### STATUS Out of Sync

```
You: "Verify and fix STATUS for transcript.md"

Claude: [Uses phase2a_code_verify — fix: true]
        Auto-corrects STATUS based on actual /segment markers
```

### Delete a Bad Segment

```
You: "Delete segment 0123-0134 from transcript.md"

Claude: [Uses phase2a_code_delete_segment]
        Removes segment, updates STATUS
```

### Start Over

```
You: "Clear all coding from transcript.md"

Claude: [Uses phase2a_code_clear_all — confirm: true]
        Creates backup, removes all segments, resets STATUS
```

---

## File Organisation

Suggested project structure:

```
project/
├── transcripts/
│   ├── interview_1.md
│   ├── interview_2.md
│   └── focus_group_1.md
├── protocols/
│   └── coding_protocol.md
└── rta_config.yaml
```

---

## Tips

1. **Call `init` every session.** Claude Desktop sessions are fresh — init provides the critical instructions.
2. **Read the methodology.** When Claude loads methodology, read it properly. Don't skip.
3. **Use version control.** `git commit` after each coding session. The tool has no undo.
4. **One transcript at a time.** Don't code multiple files in the same chat.
5. **Check progress before closing.** Use `code_status` to confirm where you are.

---

**See also:** [API Reference](API.md) — Full tool specifications | [Getting Started](GETTING_STARTED.md) — Installation
