# RFC-002: Data Layer Consolidation — Eliminating Duplication Between Phases

**Status:** Accepted
**Date:** 2026-03-11
**Author:** Niklas Karlsson + Claude (dialogically developed)

---

## Problem

Phase 2a and 2b produce analytical data across **four separate files**. Several of them duplicate information, and none are fully consumed downstream.

### Current State: Four Files, Overlapping Purpose

| File | Written by | Read by tool | Purpose |
|------|-----------|--------------|---------|
| Transcript (.md) | 2a, 2b | 2b, Phase 3 | Codes in the data — **source of truth** |
| `_review.json` | 2b | 2b only | Progress + reflexive notes + revision history |
| `_coding_log.md` | 2a | **no tool** | Human-readable audit trail |
| `_process_log.jsonl` | 2a, 2b | `session_reflection`, `process_log_summary` | Process events (epistemically significant) |

### Specific Problems

1. **`_review.json` contains analytical text in an unreadable format** — reflexive notes, code revisions, all the rich analytical text ends up in JSON that no human wants to read
2. **`_coding_log.md` tells only half the story** — Phase 2a writes to it, Phase 2b does not. Reviews, splits, new codes never appear
3. **Reflexive notes stored in two places** — 2a's reflexive notes in `_coding_log.md`, 2b's in `_review.json`. Duplication with different formats
4. **No downstream consumption** — neither `_review.json` nor `_coding_log.md` is read by Phase 3+. All analytical meaning that does not end up in the transcript file is lost to the system

---

## Design Principles

1. **Never write the same data twice** — one source per data point
2. **Source of truth = transcript file** — codes always live in the data
3. **Chronological readability** — the researcher (and colleagues) should be able to follow the analytical journey in ONE document
4. **Machine state should be minimal** — only what is needed for resume/progress
5. **Each file has exactly ONE purpose**

---

## Key Design Decision: Review Progress via `/reviewed` Marker

The critical question is how to track which segments have been reviewed without `_review.json`.

### The Index Shifting Problem

Any identifier logged in an append-only file (`_process_log.jsonl`) becomes stale when segments are split or merged:

- Log says `{ segment_index: 7, reviewed: true }`
- Segment 5 is split → what was segment 7 is now segment 8
- Log is append-only — cannot update the old entry
- **The log now lies**

Line ranges suffer the same problem — a split changes the ranges of the resulting segments.

### Rejected Approaches

| Approach | Why rejected |
|----------|-------------|
| Log progress by segment index in `_process_log.jsonl` | Index changes on split/merge — log becomes stale |
| Log progress by line range in `_process_log.jsonl` | Line ranges change on split — same problem |
| Replay split/merge events to reconstruct indices | Complex, error-prone |
| Content hashing | Fragile — any manual edit invalidates the hash |

### Solution: `/reviewed` Marker in Transcript

Review status lives **in the transcript file itself**, physically attached to the segment:

```markdown
/segment
/reviewed 2026-03-11
0088 [SPEAKER_01] 00:04:32.000 --> 00:04:35.000: ...
...
/koder
#code1
#code2
/slut_segment
```

**Why this works:**

- **Split:** Creates two new segments — neither has `/reviewed` → both need review. This is methodologically correct: if the segmentation was wrong, both halves need fresh review.
- **Merge:** Creates one new segment — no `/reviewed` → needs review. Same logic.
- **Manual edit:** Marker stays with the segment. Researcher can remove it if they want to re-review.
- **Progress calculation:** `SegmentReader` counts `/segment` blocks (total) and `/reviewed` markers (done). Trivial.
- **No external state:** The transcript is already the source of truth for codes. Now it is also the source of truth for review status.
- **`_process_log.jsonl` still logs the event** — `{ type: "review_segment_complete", ... }` — but as an audit trail, NOT as state. Progress is never computed from the log.
- **Only `review_write_note` writes the marker** — `review_revise_codes` does NOT. A segment is "reviewed" when the researcher writes a reflexive note, not when codes are revised. This matches the current workflow: read → (revise codes) → write note = done.
- **`SegmentReader` must skip the marker** — `/reviewed` is recognised and excluded from text lines, just like `/koder` and `/slut_segment`. `CodeExtractor` (Phase 3) inherits this behaviour automatically.
- **Manual code edits preserve the marker** — if a researcher edits codes directly in the transcript, `/reviewed` stays. The researcher can remove it manually to trigger re-review.

---

## Proposed Architecture: Three Files

```
Transcript (.md)          ← source of truth: codes + review status (/reviewed marker)
_coding_log.md            ← ALL analytical text (2a + 2b), chronological, human-readable
_process_log.jsonl        ← process events, audit trail (unchanged role)
```

### Each File Has Exactly One Purpose

| File | Purpose | Written by | Read by |
|------|---------|-----------|---------|
| Transcript (.md) | Codes + review status | 2a, 2b | 2b, Phase 3, `review_status` |
| `_coding_log.md` | Analytical journey | 2a, 2b | Humans (colleagues, supervisors) |
| `_process_log.jsonl` | Process events | 2a, 2b | `session_reflection`, `process_log_summary` |

### What Was Removed

| Removed | Why | Where does the data go instead? |
|---------|-----|-------------------------------|
| `_review.json` progress tracking | Replaced by `/reviewed` marker in transcript | Transcript |
| `_review.json` reflexive notes | Moved to `_coding_log.md` (Phase 2b now appends there) | `_coding_log.md` |
| `_review.json` revision history | Moved to `_coding_log.md` + logged as event in `_process_log.jsonl` | Both |
| `_review.json` code snapshot | Redundant — transcript already has current codes (source of truth) | N/A |
| `NoteManager` class | No longer needed | Removed |
| `ReviewNote`, `ReviewNotesFile` types | No longer needed | Removed |
| Index shifting logic | Problem disappears — no external state to shift | N/A |

---

## Alternatives Considered

### Alternative B: Structured JSON (`_analysis_notes.json`)

Replace both `_review.json` and `_coding_log.md` with a single structured JSON file covering 2a and 2b.

**Rejected because:** JSON is not human-readable. Colleagues cannot open the file and follow the analytical journey. Would require an export tool, adding complexity. Solves a downstream consumption problem that does not yet exist (YAGNI).

### Alternative C: Hybrid (JSON + Generated Markdown)

Structured JSON as primary source, markdown generated on demand.

**Rejected because:** Four files again (albeit without duplication). More complexity. Generated markdown can become stale. Over-engineered for current needs.

---

## Implementation

### Changes to `SegmentReader`

Extend segment parsing to recognise `/reviewed` marker:

```typescript
interface ReviewSegment {
  // ... existing fields ...
  reviewed: boolean;      // true if /reviewed marker present
  reviewedAt?: string;    // date from /reviewed marker, if present
}
```

### Changes to Review Tools

| Tool | Change |
|------|--------|
| `review_write_note` | Write `/reviewed` marker to transcript + append to `_coding_log.md` |
| `review_revise_codes` | Append revision to `_coding_log.md` + log event in `_process_log.jsonl` |
| `review_next` | Find first segment without `/reviewed` (via `SegmentReader`) |
| `review_status` | Count `/reviewed` vs total segments (via `SegmentReader`) |
| `review_start` | Remove `NoteManager` initialisation |
| `review_read_segment` | Remove `NoteManager` note lookup |
| `review_split_segment` | Remove `shiftIndices()` — new segments naturally lack `/reviewed` |
| `review_merge_segments` | Remove `shiftIndices()` — merged segment naturally lacks `/reviewed` |

### Changes to `CodingLogWriter`

New method `appendReview()` for Phase 2b entries:

```markdown
---
## Phase 2b Review — Segment 5 (0320–0388)
**Timestamp:** 2026-03-11T07:32:33Z

### Reflexive Note
[researcher's analytical text]

### Code Revision
- Added: #new_code
- Removed: #old_code
- Rationale: [text]
```

### Files to Remove

- `src/core/note_manager.ts`
- `ReviewNote`, `ReviewNotesFile`, `CodeRevision` from `src/types/review.ts`

### Files to Modify

- `src/core/segment_reader.ts` — recognise `/reviewed` marker
- `src/core/coding_log_writer.ts` — new `appendReview()` method
- `src/tools/review_start.ts`
- `src/tools/review_next.ts`
- `src/tools/review_write_note.ts`
- `src/tools/review_revise_codes.ts`
- `src/tools/review_read_segment.ts`
- `src/tools/review_status.ts`
- `src/tools/review_split_segment.ts`
- `src/tools/review_merge_segments.ts`
- `src/server.ts` — remove `NoteManager` import

---

## Migration

For existing projects with `_review.json`:

1. Read `_review.json` segments
2. For each reviewed segment, add `/reviewed [date]` marker to transcript
3. Append review notes to `_coding_log.md`
4. Archive `_review.json` (rename to `_review.json.migrated`)

This can be a one-time migration tool or done manually.

---

## References

- Braun & Clarke (2019) — researcher's interpretive authority
- Brailas (2025) — "proving the obvious" problem
- Ozuem et al. (2025) — dual reflexivity
- RFC-001 — Cowork Plugin (accepted, plugin rejected)
