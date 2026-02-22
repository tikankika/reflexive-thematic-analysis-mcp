# API Reference

Complete tool specifications for the Reflexive Thematic Analysis MCP Server.

---

## Tool Overview

### Core Tools

| Tool | Purpose |
|------|---------|
| `init` | Returns critical instructions (call first every session) |
| `project_setup` | Create new RTA project structure |
| `add_line_index` | Add permanent 4-digit line indices to transcript |
| `methodology_load` | Load methodology documents for any phase |
| `list_files` | List files in a directory |
| `read_file` | Read contents of a file |

### Phase 2a — Initial Coding

| Tool | Purpose |
|------|---------|
| `phase2a_code_start` | Initialise coding session, return first chunk |
| `phase2a_code_read_next` | Read next uncoded chunk |
| `phase2a_code_write_segment` | Write codes for segment(s) — legacy or multi-segment mode |
| `phase2a_code_skip_chunk` | Skip chunk without coding |
| `phase2a_code_status` | Show coding progress |
| `phase2a_code_verify` | Verify STATUS matches actual file content |
| `phase2a_code_reset_status` | Reset STATUS to uncoded state |
| `phase2a_code_clear_all` | Remove all coding (creates backup) |
| `phase2a_code_delete_segment` | Delete specific segment by line range |

### Phase 2b — Critical Review

| Tool | Purpose |
|------|---------|
| `phase2b_review_start` | Start review session, load methodology |
| `phase2b_review_next` | Get next unreviewed segment |
| `phase2b_review_read_segment` | Read specific segment by index |
| `phase2b_review_write_note` | Write reflexive note for segment |
| `phase2b_review_revise_codes` | Revise codes (add/remove/replace) |
| `phase2b_review_status` | Show review progress |
| `phase2b_review_split_segment` | Split segment into two |
| `phase2b_review_merge_segments` | Merge two adjacent segments |

---

## Core Tools

### `init`

Returns critical instructions for using the RTA tools. **Must be called first every session.**

**Input:** None required.

**Output:** Instructions object with tool categories, critical rules, and RTA phase listing.

---

### `project_setup`

Creates a new RTA project structure with configuration and methodology files.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_name` | string | Yes | Project name (e.g., "AI_Teachers_Focus_Groups") |
| `output_path` | string | Yes | Path where project folder should be created |
| `researcher` | string | Yes | Researcher name |
| `transcripts` | string[] | Yes | Array of paths to transcript files |

---

### `add_line_index`

Adds permanent 4-digit line indices (0001, 0002, ...) to a transcript file. These indices remain fixed even when `/segment` markers are added during coding. Run before `phase2a_code_start`.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file (.md) |
| `config.digits` | number | No | Number of digits (default: 4) |

---

### `methodology_load`

Loads methodology documents for a specific RTA phase. Supports progressive loading — call with `document_index=0`, then `document_index=1`, etc.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phase` | string | Yes | Phase to load (e.g., "phase2a", "phase2b", "phase3") |
| `config_path` | string | No | Path to rta_config.yaml |
| `document_index` | number | No | 0-based index for progressive loading (default: 0) |

---

### `list_files`

Lists files in a directory. Supports `~` for home directory and optional pattern filter.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Directory path |
| `pattern` | string | No | File pattern filter (e.g., "*.md") |

---

### `read_file`

Reads contents of a file. Supports `~` for home directory.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path |
| `max_lines` | number | No | Limit output to N lines |

---

## Phase 2a — Initial Coding Tools

### `phase2a_code_start`

Initialises a coding session. Creates STATUS frontmatter and returns the first chunk of raw text.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file (.md) |
| `config.chunk_size` | number | No | Lines per reading chunk (default: 80) |

**Output:** STATUS info, total lines, estimated chunks, and first chunk text.

**Side effect:** Creates YAML frontmatter in the transcript file.

---

### `phase2a_code_read_next`

Returns the next uncoded chunk (60–100 lines) based on STATUS.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |

**Output:** Next chunk text and progress, or `"complete"` if all chunks are coded.

---

### `phase2a_code_write_segment`

Writes codes for semantic segments. Supports two modes:

**Legacy mode** (v0.1.0): Provide a `codes` array — writes codes for the current STATUS chunk.

**Multi-segment mode** (v0.2.0): Provide a `segments` array — writes multiple segments with explicit line ranges.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |
| `codes` | string[] | One of | Legacy mode: codes for current chunk |
| `segments` | object[] | One of | Multi-segment mode (see below) |

**Segment object:**

| Field | Type | Description |
|-------|------|-------------|
| `start_line` | string | Starting line index, 4-digit format (e.g., "0030") |
| `end_line` | string | Ending line index, inclusive (e.g., "0034") |
| `codes` | string[] | Codes for this segment |

**Validation:** Line numbers must be 4-digit format. Segments must not overlap. Auto-sorted by start_line.

---

### `phase2a_code_skip_chunk`

Skips current chunk without coding. Use when chunk contains no codeable content.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |

---

### `phase2a_code_status`

Shows current coding progress — segments coded, lines remaining, progress percentage.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |

---

### `phase2a_code_verify`

Verifies STATUS matches actual file content. Counts `/segment` markers and compares to STATUS.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |
| `fix` | boolean | No | Auto-fix STATUS if inconsistencies found (default: false) |

---

### `phase2a_code_reset_status`

Resets STATUS to uncoded state without modifying file content.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |

---

### `phase2a_code_clear_all`

Removes all coding from file. Creates automatic backup before clearing. Preserves line indices and transcript text.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |
| `confirm` | boolean | Yes | Must be `true` (safety check) |

---

### `phase2a_code_delete_segment`

Deletes a specific segment by its line index range.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to transcript file |
| `start_index` | string | Yes | Starting line index (e.g., "0123") |
| `end_index` | string | Yes | Ending line index (e.g., "0134") |

---

## Phase 2b — Critical Review Tools

### `phase2b_review_start`

Starts a critical review session. Parses the coded transcript, creates or resumes review notes, loads Phase 2b methodology, and returns the first segment for review.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file (.md) |
| `researcher` | string | No | Researcher name (default: "researcher") |

**Output:** Methodology document, first segment with text and codes, review progress.

---

### `phase2b_review_next`

Returns the next unreviewed segment.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file |

---

### `phase2b_review_read_segment`

Reads a specific segment by its 1-based index. Returns segment text, codes, and any existing review note.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file |
| `index` | number | Yes | 1-based segment index |

---

### `phase2b_review_write_note`

Writes a reflexive note for a segment. Marks the segment as reviewed.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file |
| `index` | number | Yes | 1-based segment index |
| `note` | string | Yes | Reflexive note text (markdown) |

---

### `phase2b_review_revise_codes`

Revises codes for a segment in the transcript file. Logs the revision with full audit trail.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file |
| `segment_index` | number | Yes | 1-based segment index |
| `action` | string | Yes | `"add"`, `"remove"`, or `"replace"` |
| `codes` | string[] | Yes | Codes to add/remove/replace with |

---

### `phase2b_review_status`

Shows review progress — total segments, reviewed count, remaining, percentage, and revision statistics.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file |

---

### `phase2b_review_split_segment`

Splits a segment into two during review. All codes are copied to both new segments. Use `review_revise_codes` afterwards to adjust codes on each half.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file |
| `segment_index` | number | Yes | 1-based index of the segment to split |
| `split_at_line` | string | Yes | 4-digit line index — first line of the second half (e.g., "0045") |

---

### `phase2b_review_merge_segments`

Merges two adjacent segments into one. Combines text and deduplicates codes.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Path to coded transcript file |
| `first_segment_index` | number | Yes | 1-based index of the first segment |
| `second_segment_index` | number | Yes | Must be `first_segment_index + 1` |

---

## File Format

### STATUS Frontmatter

```yaml
---
CODING-STATUS:
  File: transcript.md
  Total-lines: 1500
  Last-coded-line: 240
  Next-segment: 241-320
  Progress: 3/18
  Date: 2026-01-15
---
```

### Coded Segment

```markdown
/segment
0030 00:00:30.146 --> 00:00:55.105; [SPEAKER_02]: Original text preserved...
0031 00:00:55.125 --> 00:00:55.265; [SPEAKER_02]: More text...

#code_description__rq1_semantic
#"in_vivo_quote"__rq1_latent
/slut_segment
```

---

**Version**: 0.4.2
