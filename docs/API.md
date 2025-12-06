# API Reference

**Phase 1 Coding MCP Server - Tool Specifications**

This document describes the 4 MCP tools provided by the Phase 1 Coding server.

---

## Overview

The server provides **file handling tools** for segment-based coding:

| Tool | Purpose |
|------|---------|
| `code_start` | Initialize coding session |
| `code_read_next` | Read next segment to code |
| `code_write_segment` | Write codes to file |
| `code_status` | Show progress |

All tools operate on transcript files in `.md` format with timestamps.

---

## Tool 1: `code_start`

**Purpose:** Initialize a new coding session

**What it does:**
1. Counts total lines in transcript
2. Creates STATUS frontmatter in file
3. Returns first segment (raw text)

### Input Schema

```typescript
{
  file_path: string,      // REQUIRED: Path to transcript file
  config?: {
    segment_size?: number  // OPTIONAL: Lines per segment (default: 80)
  }
}
```

### Output Schema

```typescript
{
  status: "ready",
  total_lines: number,           // Total lines in transcript
  estimated_segments: number,    // Approximate number of segments
  segment: {
    number: number,              // Segment number (1-indexed)
    lines: string,               // Display format (e.g., "1-80")
    text: string                 // Raw transcript text
  }
}
```

### Example Usage

**Input:**
```json
{
  "file_path": "/path/to/Fokusgrupp_AI_School_1.md",
  "config": {
    "segment_size": 80
  }
}
```

**Output:**
```json
{
  "status": "ready",
  "total_lines": 1500,
  "estimated_segments": 19,
  "segment": {
    "number": 1,
    "lines": "1-80",
    "text": "00:00:00.130 --> 00:00:21.380; [SPEAKER_05]: Ja, ja.\n..."
  }
}
```

### Error Conditions

- **File not found**: `File not found: {path}`
- **STATUS already exists**: `File already has STATUS. Use code_read_next to continue, or remove STATUS to restart.`

### Side Effects

- Creates YAML frontmatter in transcript file:
  ```yaml
  ---
  CODING-STATUS:
    File: transcript.md
    Total-lines: 1500
    Last-coded-line: 0
    Next-segment: 1-80
    Progress: 0/19
    Date: 2025-12-06
  ---
  ```

---

## Tool 2: `code_read_next`

**Purpose:** Read the next uncoded segment

**What it does:**
1. Reads STATUS from file
2. Determines next segment to code
3. Returns raw text of that segment

### Input Schema

```typescript
{
  file_path: string  // REQUIRED: Path to transcript file
}
```

### Output Schema

```typescript
{
  segment: {
    number: number,    // Segment number
    lines: string,     // Display format (e.g., "81-160")
    text: string       // Raw transcript text
  },
  progress: string     // Progress info (e.g., "1/19 (5%)")
}
```

**OR (if complete):**

```typescript
{
  status: "complete",
  message: "All segments have been coded",
  progress: string
}
```

### Example Usage

**Input:**
```json
{
  "file_path": "/path/to/Fokusgrupp_AI_School_1.md"
}
```

**Output:**
```json
{
  "segment": {
    "number": 2,
    "lines": "81-160",
    "text": "00:05:30.250 --> 00:05:45.100; [SPEAKER_02]: ..."
  },
  "progress": "1/19 (5%)"
}
```

### Error Conditions

- **File not found**: `File not found: {path}`
- **No STATUS found**: `No STATUS frontmatter found in file`

### Prerequisites

- File must have STATUS (created by `code_start`)
- Previous segment must be coded (via `code_write_segment`)

---

## Tool 3: `code_write_segment`

**Purpose:** Write codes for segment(s)

**Version Support:**
- **v0.1.0 (Legacy Mode):** Single 80-line segment using STATUS boundaries
- **v0.2.0 (New Mode):** Multiple small segments with explicit line ranges

**What it does:**
1. **Legacy Mode:** Reads STATUS to find next 80-line segment, writes codes
2. **New Mode:** Writes multiple user-specified segments with precise line ranges
3. Wraps segment text in `/segment` markers
4. Adds codes between text and closing marker
5. Updates STATUS with new progress

---

### Mode 1: Legacy Single-Segment (v0.1.0)

**Use case:** Standard sequential coding (80-line segments)

#### Input Schema

```typescript
{
  file_path: string,  // REQUIRED: Path to transcript file
  codes: string[]     // REQUIRED: Array of code strings
}
```

**Code format:**
- Must start with `#`
- Format: `#description_suffix` or `#"in_vivo"_suffix`
- Examples:
  - `#student_uses_AI_lins1`
  - `#"fulanvändning"_lins1`
  - `#ambivalence_AI_use_lins2`

#### Output Schema

```typescript
{
  segment_written: number,      // Segment number that was coded
  codes_written: number,        // Number of codes added
  next_segment_ready: boolean,  // Whether there's a next segment
  progress: string              // Updated progress (e.g., "2/19 (10%)")
}
```

#### Example Usage

**Input:**
```json
{
  "file_path": "/path/to/Fokusgrupp_AI_School_1.md",
  "codes": [
    "#student_uses_AI_detected_lins1",
    "#\"fulanvändning\"_lins1",
    "#ambivalence_AI_use_lins2"
  ]
}
```

**Output:**
```json
{
  "segment_written": 1,
  "codes_written": 3,
  "next_segment_ready": true,
  "progress": "1/19 (5%)"
}
```

---

### Mode 2: Multi-Segment (v0.2.0) ⭐

**Use case:** Granular coding - Claude identifies specific meaningful units (quotes, exchanges, thematic chunks) and codes them precisely

**Benefits:**
- Precise line-level code associations for citation
- Multiple segments written in one operation
- Each segment gets its own `/segment` block

#### Input Schema

```typescript
{
  file_path: string,                // REQUIRED: Path to transcript file
  segments: Array<{                 // REQUIRED: Array of segments to write
    start_line: string,             // Starting line (4-digit format, e.g., "0030")
    end_line: string,               // Ending line (4-digit, inclusive, e.g., "0034")
    codes: string[]                 // Codes for this segment (can be empty)
  }>
}
```

**Validation:**
- Line numbers must be 4-digit format ("0001"-"9999")
- `start_line <= end_line`
- Segments must not overlap
- All lines must be within file bounds
- Segments are auto-sorted by `start_line`

#### Output Schema

```typescript
{
  segments_written: number,         // Number of segments written
  codes_written: number,            // Total codes across all segments
  next_segment_ready: boolean,      // Whether more content exists
  progress: string                  // Updated progress (e.g., "3/19 (15%)")
}
```

#### Example Usage

**Scenario:** Claude identified 2 quotes about AI to code separately

**Input:**
```json
{
  "file_path": "/path/to/Fokusgrupp_AI_School_1.md",
  "segments": [
    {
      "start_line": "0030",
      "end_line": "0034",
      "codes": [
        "#student_uses_AI_homework_lins1",
        "#ambivalence_lins2"
      ]
    },
    {
      "start_line": "0078",
      "end_line": "0082",
      "codes": [
        "#teacher_concern_AI_lins1",
        "#ethical_worries_lins2"
      ]
    }
  ]
}
```

**Output:**
```json
{
  "segments_written": 2,
  "codes_written": 4,
  "next_segment_ready": true,
  "progress": "2/19 (10%)"
}
```

**File Result:**
```markdown
[... previous content ...]

/segment
0030 [SPEAKER_01]: Students use ChatGPT for homework...
0031 [SPEAKER_01]: Some use it to understand concepts...
0032 [SPEAKER_01]: Others just copy answers...
0033 [SPEAKER_01]: It's really convenient but...
0034 [SPEAKER_01]: I worry about learning impact.

#student_uses_AI_homework_lins1
#ambivalence_lins2
/slut_segment

[... lines 0035-0077 uncoded ...]

/segment
0078 [SPEAKER_02]: As a teacher I'm concerned...
0079 [SPEAKER_02]: How do we ensure students actually learn?
0080 [SPEAKER_02]: This raises ethical questions...
0081 [SPEAKER_02]: About assessment integrity...
0082 [SPEAKER_02]: And student development.

#teacher_concern_AI_lins1
#ethical_worries_lins2
/slut_segment
```

---

### Error Conditions

**Legacy Mode:**
- **No codes provided**: `No codes provided`
- **Invalid line range**: `Invalid line range: {start}-{end} (file has {total} lines)`

**New Mode:**
- **Empty segments array**: `segments array cannot be empty`
- **Missing fields**: `Segment X missing required fields (start_line, end_line, codes)`
- **Invalid format**: `Invalid line number format: "30". Expected 4-digit format (e.g., "0030")`
- **Invalid range**: `Segment X: start_line (0050) > end_line (0030)`
- **Out of bounds**: `Segment X: lines 0990-1005 out of bounds (file has 500 lines)`
- **Overlapping**: `Overlapping segments detected: Segment ending at line 36 overlaps with segment starting at line 34`
- **Both parameters**: `Cannot provide both "codes" and "segments". Use one mode only.`
- **Neither parameter**: `Must provide either "codes" (legacy mode) or "segments" (new mode)`

---

### Side Effects

**Both Modes:**
- Modifies transcript file with `/segment` markers and codes
- Updates STATUS frontmatter with progress

**Legacy Mode:**
- Codes next sequential 80-line segment

**New Mode:**
- Writes multiple non-contiguous segments as specified
- STATUS tracks max coded line (not necessarily sequential)

---

## Tool 4: `code_status`

**Purpose:** Show current coding progress

**What it does:**
1. Reads STATUS from file
2. Calculates progress metrics
3. Returns formatted status info

### Input Schema

```typescript
{
  file_path: string  // REQUIRED: Path to transcript file
}
```

### Output Schema

```typescript
{
  file: string,                  // Filename
  total_lines: number,           // Total lines in transcript
  coded_segments: number,        // Segments completed
  total_segments: number,        // Total segments to code
  progress: string,              // Percentage (e.g., "16%")
  last_coded_line: number,       // Last line that was coded
  next_segment_start: number,    // Where next segment begins
  date: string,                  // Last update date (YYYY-MM-DD)
  status: "in_progress" | "complete"
}
```

### Example Usage

**Input:**
```json
{
  "file_path": "/path/to/Fokusgrupp_AI_School_1.md"
}
```

**Output:**
```json
{
  "file": "Fokusgrupp_AI_School_1.md",
  "total_lines": 1500,
  "coded_segments": 3,
  "total_segments": 19,
  "progress": "16%",
  "last_coded_line": 240,
  "next_segment_start": 241,
  "date": "2025-12-06",
  "status": "in_progress"
}
```

### Error Conditions

- **File not found**: `File not found: {path}`
- **No STATUS found**: `No STATUS frontmatter found in file`

### Use Cases

- Check progress before resuming coding
- Verify how many segments remain
- Confirm last coded position

---

## Common Workflows

### Starting a New Transcript

```
1. code_start(file_path)
   → Creates STATUS, returns segment 1

2. [Analyze segment, propose codes]

3. code_write_segment(file_path, codes)
   → Writes codes, updates STATUS

4. code_read_next(file_path)
   → Returns segment 2

5. Repeat steps 2-4 until complete
```

### Resuming a Session

```
1. code_status(file_path)
   → Check where you left off

2. code_read_next(file_path)
   → Get next uncoded segment

3. [Analyze, propose codes]

4. code_write_segment(file_path, codes)

5. Repeat 2-4
```

### Checking Progress

```
code_status(file_path)
→ Shows: "3/19 segments (16%) complete"
```

---

## Error Handling

All tools return errors in this format:

```typescript
{
  error: string,    // Error message
  tool: string      // Tool name that failed
}
```

**Common errors:**
- File not found
- No STATUS (when required)
- STATUS already exists (when starting)
- Invalid codes (empty array)
- File permission errors

---

## File Format Requirements

### Input Transcript

Must be `.md` file with:
- Plain text content
- Optional timestamps (format: `HH:MM:SS.mmm --> HH:MM:SS.mmm; [SPEAKER]: text`)
- No existing `/segment` markers
- No existing STATUS frontmatter (for `code_start`)

### Output Format

After coding, file will have:

**1. STATUS frontmatter:**
```yaml
---
CODING-STATUS:
  File: transcript.md
  Total-lines: 1500
  Last-coded-line: 240
  Next-segment: 241-320
  Progress: 3/19
  Date: 2025-12-06
---
```

**2. Coded segments:**
```markdown
/segment
[original text preserved exactly]

#code1_suffix
#code2_suffix
/slut_segment
```

**3. Uncoded sections:**
```markdown
[raw transcript text without markers]
```

---

## Performance

- **Segment reading**: O(n) where n = total lines
- **Code writing**: O(n) - rewrites entire file
- **STATUS updates**: O(n) - rewrites entire file

For large files (>5000 lines), operations may take 1-2 seconds.

---

## Limitations

1. **No undo**: Code writing is permanent (use version control)
2. **Single file**: Tools operate on one file at a time
3. **Segment size**: Fixed after `code_start` (default 80 lines)
4. **No code validation**: Server doesn't check code format or meaning
5. **No concurrent access**: Don't run tools on same file simultaneously

---

## Next Steps

- See [USER_GUIDE.md](./USER_GUIDE.md) for workflow examples
- See [README.md](./README.md) for installation and setup

---

**Version**: 0.1.0
**Last Updated**: 2025-12-06
