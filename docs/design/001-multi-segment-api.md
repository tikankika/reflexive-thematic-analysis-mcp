# Design Document #001: Multi-Segment API for Granular Coding

**Status:** Approved
**Version:** v0.2.0
**Date:** 2025-12-06
**Author:** Niklas Karlsson (with Claude Sonnet 4.5)
**Target Release:** Q1 2026

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Motivation](#motivation)
3. [Proposed Solution](#proposed-solution)
4. [Detailed Design](#detailed-design)
5. [Implementation Plan](#implementation-plan)
6. [Examples](#examples)
7. [Risks and Mitigations](#risks-and-mitigations)
8. [Testing Strategy](#testing-strategy)
9. [References](#references)

---

## Problem Statement

### Current Behavior

The existing `code_write_segment` tool writes **one large segment** per coding operation (default: 80 lines), with all codes grouped together:

```markdown
/segment
0001 [SPEAKER_05]: AI används för genväg...
0030 [SPEAKER_05]: Snabba svar, copy-paste...
0038 [SPEAKER_05]: skillnader på olika program...
0047 [SPEAKER_05]: AI som miniräknare...
[... 80 lines total ...]

#AI_för_genvägar__lins1
#snabba_svar_utan_reflektion__lins1
#"copy-paste"__lins1
#skillnader_mellan_program__lins1
#AI_som_miniräknare__lins1
#grundkunskaper_avgörande_för_AI-framgång__lins1
/slut_segment
```

**Issue:** All codes for the entire 80-line batch are written together, making it impossible to know which code applies to which specific line range.

### Desired Behavior

**Multiple small segments** - each meaningful unit gets its own segment with precisely associated codes:

```markdown
/segment
0030 [SPEAKER_05]: AI används för genväg. Inte så mycket för lärande
0033 [SPEAKER_05]: Snabba svar, copy-paste, man orkar inte ens googla längre
0034 [SPEAKER_05]: Man tar och man använder utan större reflektion

#AI_för_genvägar__lins1
#snabba_svar_utan_reflektion__lins1
#"copy-paste"__lins1
#"man_orkar_inte_ens_googla_längre"__lins1
/slut_segment

/segment
0038 [SPEAKER_05]: skillnader på olika program
0039 [SPEAKER_05]: praktiska program... annan typ av användning

#skillnader_mellan_program__lins1
/slut_segment
```

**Benefit:** Each code is tied to specific line ranges, enabling precise citation in publications and granular analysis.

---

## Motivation

### Use Case: Reflexive Thematic Analysis with Citation Requirements

**Researcher Need:**
- Conduct qualitative coding using Reflexive Thematic Analysis (RTA)
- Need BOTH thematic overview AND ability to cite specific quotes with line numbers
- Want Claude Desktop to identify meaningful units (quotes, exchanges, thematic chunks)
- Need MPC to write these as separate segments with precise code associations

**Current Limitation:**
- v0.1.0 only supports fixed 80-line segments
- Cannot associate codes with specific line ranges
- Difficult to extract precise quotes for publication

**Workflow Vision:**

```
User: "Read lines 1-200 and identify all direct quotes about AI.
       Code each quote as a separate segment."

Claude: [Analyzes text, identifies 3 quotes at lines 30-34, 78-82, 150-155]

        I found 3 direct quotes about AI:

        1. Lines 30-34: Student discusses AI homework help
           Proposed codes: #AI_homework_help__lins1, #student_perspective__lins2

        2. Lines 78-82: Teacher expresses concern
           Proposed codes: #teacher_concern__lins1, #ethical_worries__lins2

        3. Lines 150-155: Parent perspective
           Proposed codes: #parent_view__lins1, #ambivalence__lins2

        Accept? (I'll write all 3 segments in one operation)

User: "Accept"

Claude: [Uses code_write_segment with segments array]
        ✅ 3 segments coded (6 codes written)
```

---

## Proposed Solution

### Core Principle

**MPC remains a file handler.** It does NOT identify meaningful units (that's Claude's job). MPC simply provides the CAPABILITY to write multiple small segments in one operation when instructed.

### New API Design

**Backwards Compatible Enhancement:**

```typescript
// OLD API (still supported - v0.1.0 compatibility)
{
  file_path: string;
  codes: string[];  // All codes for next 80-line segment
}

// NEW API (v0.2.0 feature)
{
  file_path: string;
  segments: Array<{
    start_line: string;  // "0030" (4-digit format)
    end_line: string;    // "0034"
    codes: string[];     // ["#kod1__lins1", "#kod2__lins1"]
  }>
}
```

**API Detection:**
- If `segments` parameter provided → use new multi-segment mode
- If `codes` parameter provided → use legacy single-segment mode (v0.1.0 behavior)
- Error if both provided simultaneously

---

## Detailed Design

### Design Decisions

#### 1. Backwards Compatibility

**Decision:** Support BOTH old and new APIs simultaneously

**Rationale:**
- Existing workflows must not break
- Users may have custom scripts or automation
- Gradual migration is safer than breaking changes
- Both APIs can coexist via parameter detection

#### 2. Overlapping Segments

**Decision:** REJECT with clear error message

**Rationale:**
- Overlaps indicate logic error in Claude's segmentation
- Duplicate text in file wastes space and creates confusion
- Better to fail fast than produce incorrect output
- User can fix segmentation and retry

**Error Format:**
```
Error: Overlapping segments detected: Segment ending at line 36 overlaps
with segment starting at line 34. Segments must not overlap.
```

#### 3. Segment Ordering

**Decision:** MPC will AUTO-SORT segments by start_line

**Rationale:**
- Claude might provide segments in non-sequential order
- File consistency requires sequential writing
- Sorting is cheap (O(n log n) for small n)
- Sorting before validation helps detect overlaps

#### 4. STATUS Calculation

**Decision:**
- `lastCodedLine` = MAX of all segment end_line values (content progress)
- `lastFilePosition` = file position after LAST segment written (file position)

**Rationale:**
- Supports non-contiguous segments (e.g., code lines 30-34, then 50-55)
- `lastCodedLine` tracks content progress
- `lastFilePosition` tracks where to append next segment
- Consistent with existing STATUS semantics

#### 5. Empty Segments

**Decision:** ALLOW segments with zero codes

**Rationale:**
- Use case: Mark text as "reviewed but not coded"
- Claude might segment first, code later
- Segment markers alone provide structure

**Output:**
```markdown
/segment
[text]

/slut_segment
```

---

### Algorithm

**High-Level Flow:**

```typescript
writeMultipleSegments(filePath, segments):
  1. Read entire file into memory
  2. Validate and parse segments (convert "0030" → 29)
  3. Sort segments by start_line (ascending)
  4. Check for overlaps → error if found
  5. Build all coded segments (with /segment markers)
  6. Insert in REVERSE order (preserves line numbers)
  7. Write file back to disk
  8. Calculate STATUS (max coded line, file position)
  9. Return result (segments_written, codes_written, progress)
```

**Why Reverse Order Insertion?**

When inserting segment at line 30, all subsequent line numbers shift. If we insert forward, we must recalculate indices after each insert.

**Reverse order:** Later inserts don't affect earlier positions!

**Example:**
```
Original: [0-10 lines]
Segments to insert: [2-3], [5-6]

Reverse order:
1. Insert segment [5-6] first → positions 0-4 unchanged
2. Insert segment [2-3] second → works with original indices

Forward order:
1. Insert segment [2-3] first → shifts all indices after
2. Insert segment [5-6] → must recalculate (now at different position!)
```

---

### New TypeScript Interfaces

**File:** `/src/types/segment.ts`

```typescript
/**
 * Small segment to be coded (for multi-segment writing)
 */
export interface CodeSegmentInput {
  /** Starting line number (4-digit format, e.g., "0030") */
  start_line: string;

  /** Ending line number (4-digit format, e.g., "0034") */
  end_line: string;

  /** Array of codes for this segment (can be empty) */
  codes: string[];
}

/**
 * Parsed segment after validation (internal use)
 */
export interface ParsedCodeSegment {
  /** Starting line (0-indexed) */
  startLine: number;

  /** Ending line (0-indexed, inclusive) */
  endLine: number;

  /** Codes for this segment */
  codes: string[];

  /** Original input for error messages */
  original: CodeSegmentInput;
}

/**
 * Result of writing multiple segments
 */
export interface MultiSegmentWriteResult {
  /** Number of segments written */
  segments_written: number;

  /** Total codes written across all segments */
  total_codes_written: number;

  /** Max content line number coded (for STATUS) */
  max_coded_line: number;

  /** File position after last segment (for STATUS) */
  lastFilePosition: number;

  /** Whether next segment is ready */
  next_segment_ready: boolean;

  /** Progress string */
  progress: string;
}
```

---

### Edge Cases Handled

| Case | Behavior |
|------|----------|
| Overlapping segments | ❌ Error: "Overlapping segments detected: ..." |
| Out-of-order segments | ✅ Auto-sort by start_line |
| Duplicate segments (exact same range) | ❌ Error: "Duplicate segments detected" |
| Empty codes array | ✅ Allow (segment markers only) |
| Invalid line format ("30" not "0030") | ❌ Error: "Invalid line number format" |
| Out of bounds | ❌ Error: "Lines X-Y out of bounds (file has N lines)" |
| start_line > end_line | ❌ Error: "start_line > end_line" |
| Single-line segment (start == end) | ✅ Allow (valid 1-line segment) |
| Both codes AND segments provided | ❌ Error: "Cannot provide both" |
| Neither codes NOR segments | ❌ Error: "Must provide either" |

---

## Implementation Plan

### Phase 1: Type Definitions (Estimated: 1 hour)

**File:** `/src/types/segment.ts`

**Changes:**
- Add `CodeSegmentInput` interface (+10 lines)
- Add `ParsedCodeSegment` interface (+10 lines)
- Add `MultiSegmentWriteResult` interface (+10 lines)

**Total:** ~30 lines added

---

### Phase 2: Core Logic (Estimated: 3 hours)

**File:** `/src/core/segment_writer.ts`

**New Methods:**

1. **`parseLineNumber(lineStr: string): number`**
   - Convert "0030" → 29 (0-indexed)
   - Validate 4-digit format
   - Validate >= 1

2. **`validateNoOverlaps(segments: ParsedCodeSegment[]): void`**
   - Check consecutive segments don't overlap
   - Throw descriptive error if overlap found

3. **`validateMultiSegmentInput(segments: CodeSegmentInput[], totalFileLines: number): ParsedCodeSegment[]`**
   - Validate all segments have required fields
   - Parse line numbers
   - Validate ranges (start <= end)
   - Validate bounds (within file length)
   - Sort by startLine
   - Check overlaps
   - Return parsed segments

4. **`calculateFileEndPosition(parsedSegments, insertedSegments): number`**
   - Calculate file position after all segments inserted
   - Account for segment growth (markers + codes)
   - Track cumulative shifts

5. **`writeMultipleSegments(filePath: string, segments: CodeSegmentInput[]): Promise<MultiSegmentWriteResult>`**
   - Main method implementing algorithm above
   - Read file → validate → build → insert (reverse) → write → calculate STATUS

**Total:** ~150 lines added

---

### Phase 3: Tool Layer (Estimated: 2 hours)

**File:** `/src/tools/code_write_segment.ts`

**Changes:**

1. **API Detection Logic:**
   ```typescript
   if (segments !== undefined && codes !== undefined) {
     throw Error("Cannot provide both codes and segments");
   }

   if (segments !== undefined) {
     return writeMultiSegmentMode(...);
   } else {
     return writeLegacyMode(...);
   }
   ```

2. **New Function: `writeMultiSegmentMode()`**
   - Call `writer.writeMultipleSegments()`
   - Update STATUS with result
   - Return formatted response

3. **Refactor: Extract `writeLegacyMode()`**
   - Extract existing logic to separate function
   - No behavior change

**Total:** ~60 lines added, ~40 lines refactored

---

### Phase 4: MCP Integration (Estimated: 1 hour)

**File:** `/src/server.ts`

**Changes:**
- Update `code_write_segment` tool description
- Update input schema to include `segments` parameter
- Document both modes (legacy vs. new)

**Example Schema:**
```typescript
{
  name: 'code_write_segment',
  description: 'Write codes for segment(s). Supports two modes: ...',
  inputSchema: {
    properties: {
      file_path: { type: 'string' },
      codes: {
        type: 'array',
        description: '[LEGACY] Single segment mode'
      },
      segments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            start_line: { type: 'string', description: '4-digit (e.g., "0030")' },
            end_line: { type: 'string' },
            codes: { type: 'array' }
          }
        },
        description: '[NEW] Multi-segment mode'
      }
    },
    required: ['file_path']
  }
}
```

**Total:** ~20 lines modified

---

### Phase 5: Integration Testing (Estimated: 2 hours)

**Test Cases:**

1. **End-to-end workflow:**
   - `code_start` → multi-segment write → `code_read_next`
   - Verify file content, STATUS, next segment

2. **Mixed workflow:**
   - Write segment 1 (legacy mode)
   - Write segments 2-4 (new mode, multi-segment)
   - Write segment 5 (legacy mode)
   - Verify STATUS consistency

3. **Non-contiguous segments:**
   - Input: [10-15, 50-55, 90-95] (gaps)
   - Verify: lastCodedLine = 94, segments written correctly

4. **Error cases:**
   - Overlapping segments → error
   - Invalid format → error
   - Out of bounds → error

**Test Files:**
- `tests/segment_writer.test.ts` (unit tests)
- `tests/code_write_segment.test.ts` (tool tests)
- `tests/integration/multi_segment.test.ts` (integration tests)

---

### Phase 6: Documentation (Estimated: 2 hours)

**Files to Update:**

1. **`/docs/API.md`**
   - Add "Multi-Segment Mode" section
   - Examples with `segments` array
   - Validation rules
   - Error conditions

2. **`/docs/USER_GUIDE.md`**
   - Add "Granular Coding Workflow" section
   - Real-world examples
   - Best practices

3. **`/docs/ROADMAP.md`**
   - Update v0.2.0 section with feature description
   - Link to this design document

---

### Total Estimated Time: 12 hours

- Code implementation: ~8 hours
- Testing: ~2 hours
- Documentation: ~2 hours

---

## Examples

### Example 1: Basic Multi-Segment

**Input:**
```json
{
  "file_path": "/path/to/transcript.md",
  "segments": [
    {
      "start_line": "0030",
      "end_line": "0034",
      "codes": ["#AI_homework_help__lins1", "#student_perspective__lins2"]
    },
    {
      "start_line": "0078",
      "end_line": "0082",
      "codes": ["#teacher_concern__lins1", "#ethical_worries__lins2"]
    }
  ]
}
```

**Output (in file):**
```markdown
/segment
0030 [SPEAKER_01]: Students use ChatGPT for homework...
0031 [SPEAKER_01]: Some use it to understand concepts...
0032 [SPEAKER_01]: Others just copy answers...
0033 [SPEAKER_01]: It's really convenient but...
0034 [SPEAKER_01]: I worry about learning impact.

#AI_homework_help__lins1
#student_perspective__lins2
/slut_segment

[... other text ...]

/segment
0078 [SPEAKER_02]: As a teacher I'm concerned...
0079 [SPEAKER_02]: How do we ensure students actually learn?
0080 [SPEAKER_02]: This raises ethical questions...
0081 [SPEAKER_02]: About assessment integrity...
0082 [SPEAKER_02]: And student development.

#teacher_concern__lins1
#ethical_worries__lins2
/slut_segment
```

**Response:**
```json
{
  "segments_written": 2,
  "codes_written": 4,
  "next_segment_ready": true,
  "progress": "2/19 (10%)"
}
```

---

### Example 2: Error - Overlapping Segments

**Input:**
```json
{
  "segments": [
    { "start_line": "0030", "end_line": "0035", "codes": ["#kod1"] },
    { "start_line": "0033", "end_line": "0040", "codes": ["#kod2"] }
  ]
}
```

**Output:**
```json
{
  "error": "Overlapping segments detected: Segment ending at line 36 overlaps with segment starting at line 34. Segments must not overlap.",
  "tool": "code_write_segment"
}
```

---

### Example 3: Backwards Compatibility (Legacy Mode)

**Input (v0.1.0 style):**
```json
{
  "file_path": "/path/to/transcript.md",
  "codes": ["#kod1__lins1", "#kod2__lins2"]
}
```

**Behavior:** Uses STATUS to determine next 80-line segment, writes exactly as v0.1.0 did.

**Result:** Full backwards compatibility maintained.

---

## Risks and Mitigations

### Risk 1: STATUS Calculation Errors for Non-Contiguous Segments

**Risk:** After writing segments [10-15, 50-55], STATUS might have incorrect lastCodedLine.

**Mitigation:**
- Use `max()` for lastCodedLine calculation (always correct for non-contiguous)
- Comprehensive unit tests for STATUS updates
- Integration tests with gaps

**Impact if not mitigated:** HIGH - Subsequent `code_read_next` would start from wrong position

---

### Risk 2: File Position Shifts Miscalculated

**Risk:** After inserting multiple segments, lastFilePosition calculation is wrong.

**Mitigation:**
- Careful implementation of `calculateFileEndPosition()`
- Track cumulative shifts from all segments
- Unit tests comparing expected vs. actual file positions

**Impact if not mitigated:** MEDIUM - May cause `code_read_next` to skip lines

---

### Risk 3: Overlapping Segment Validation Bugs

**Risk:** Validation misses edge cases (e.g., segments [10-15, 15-20] - should this overlap?).

**Mitigation:**
- Clear definition: segment [10-15] is inclusive, so [15-20] overlaps at line 15
- Comprehensive validation tests for all edge cases
- Strict inequality check: `current.endLine >= next.startLine` → error

**Impact if not mitigated:** HIGH - Could corrupt files with duplicate text

---

### Risk 4: User Confusion Between Modes

**Risk:** Users don't know when to use `codes` vs. `segments`.

**Mitigation:**
- Clear error messages if both provided
- Tool description explains use cases
- Documentation with examples
- Claude Desktop naturally guides users (via conversation)

**Impact if not mitigated:** LOW - User experience issue, not data corruption

---

### Risk 5: Performance Degradation with Many Segments

**Risk:** Writing 100 small segments might be slow.

**Mitigation:**
- Single file read/write (not per-segment)
- Reverse-order insertion is O(n) where n = segments
- Benchmark: 20 segments to 5000-line file should be <500ms

**Impact if not mitigated:** LOW - Unlikely to hit performance issues in practice

---

## Testing Strategy

### Unit Tests

**File:** `tests/segment_writer.test.ts`

1. `parseLineNumber()` - all format variations ("0030", "30", "abc", "0000")
2. `validateNoOverlaps()` - overlapping, adjacent, duplicate segments
3. `validateMultiSegmentInput()` - all validation rules
4. `calculateFileEndPosition()` - various segment configurations
5. `writeMultipleSegments()` - end-to-end with mock file

---

### Integration Tests

**File:** `tests/integration/multi_segment.test.ts`

1. End-to-end: `code_start` → multi-segment write → `code_read_next` → verify
2. Mixed workflow: legacy mode + new mode interleaved
3. Non-contiguous segments with gaps
4. Edge cases: empty codes, single-line segments, 100 segments

---

### Manual Testing

1. Real transcript file (500+ lines)
2. Code with multi-segment API
3. Verify output file format
4. Check STATUS updates
5. Continue coding with `code_read_next`

---

## References

### Related Documents

- [API Documentation](/docs/API.md)
- [User Guide](/docs/USER_GUIDE.md)
- [Roadmap v0.2.0](/docs/ROADMAP.md#v020---performance--reliability)
- [CHANGELOG](/CHANGELOG.md)

### External References

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Reflexive Thematic Analysis](https://www.psych.auckland.ac.nz/en/about/thematic-analysis.html) (Braun & Clarke)

---

## Approval

**Plan Created:** 2025-12-06
**Reviewed by:** Niklas Karlsson
**Approved:** 2025-12-06
**Status:** ✅ Ready for implementation

---

**Next Step:** Begin Phase 1 implementation (Type Definitions)
