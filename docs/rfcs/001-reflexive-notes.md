# RFC 001: Reflexive Note Feature for Phase 2 Analysis

## Status
**Draft** | Under Review | Approved | Implemented

**Date:** 2025-12-10
**Author:** Niklas Karlsson
**Branch:** `reflexive_note`

---

## Context

After Phase 1 coding (segment identification + systematic coding), researchers need to conduct reflexive analysis:
- Review each coded segment individually
- Write analytical memos per segment
- Build analytical foundation for Phase 2 theme generation

### Current Problem
**Challenge:** Claude Desktop cannot handle entire coded transcript (too large data volume).

**Tested approach:** Ad-hoc loading of full transcript in Claude Desktop
- **Result:** Failed due to data size constraints
- **Transcript size:** ~1000-1500 lines with `/segment` markers
- **Needed:** Structured segment-by-segment workflow

### Research Context
- **Project:** ULF 2025-12-07 focus group analysis
- **Data:** 5 coded transcripts in `/path/to/data/transcripts`
- **Methodology:** Reflexive Thematic Analysis (Braun & Clarke, 2006)
- **Current phase:** Transition from Phase 1 (coding) to Phase 2 (theme generation)

---

## Proposed Solution

### Core Concept
Create MCP tools to present **one segment at a time** to Claude Desktop, enabling:
1. Systematic reflexive note-taking without data volume constraints
2. **Iterative code revision** during reflexive analysis (following RTA methodology)

### Architecture Decision

**Options considered:**
- [ ] Option A: Extend MPC_RTA (same server)
- [ ] Option B: New MPC_RTA_Phase2 server
- [x] Option C: Hybrid with phase mode

**Selected:** Option C - Hybrid with phase mode

**Reasoning:**
1. **Logical progression:** Phase 1 → Phase 2 in same tool
2. **Code reuse:** Leverages existing segment parsing from Phase 1
3. **Simpler setup:** One MCP server, not two
4. **Clear separation:** Phase mode parameter keeps concerns distinct
5. **User experience:** Natural workflow continuation in Claude Desktop

---

## Implementation Plan

### New MCP Tools

#### 1. `reflective_start`
```typescript
reflective_start(file_path: string): {
  transcript_name: string,
  total_segments: number,
  first_segment: {
    index: number,
    line_range: string,
    text: string[],
    codes: string[]
  }
}
```
**Purpose:** Initialize reflexive analysis session, return first segment

#### 2. `reflective_read_segment`
```typescript
reflective_read_segment(file_path: string, index: number): {
  index: number,
  line_range: string,
  text: string[],
  codes: string[],
  existing_note?: string
}
```
**Purpose:** Read specific segment by index

#### 3. `reflective_write_note`
```typescript
reflective_write_note(
  file_path: string,
  index: number,
  note: string
): {
  success: boolean,
  saved_at: string
}
```
**Purpose:** Save reflexive note for segment

#### 4. `reflective_next`
```typescript
reflective_next(file_path: string): {
  index: number,
  line_range: string,
  text: string[],
  codes: string[],
  has_note: boolean
}
```
**Purpose:** Return next unanalyzed segment

#### 5. `reflective_revise_codes`
```typescript
reflective_revise_codes(
  file_path: string,
  segment_index: number,
  action: "add" | "remove" | "replace",
  codes: string[]
): {
  success: boolean,
  updated_codes: string[],
  segment_marked_revised: boolean
}
```
**Purpose:** Revise codes during reflexive analysis (add/remove/replace)

**Actions:**
- `"add"` - Add new codes to existing codes
- `"remove"` - Remove specific codes from segment
- `"replace"` - Replace all codes with new set

**Example:**
```typescript
// Add missed code during reflexive review
reflective_revise_codes(file, 5, "add", ["#implicit_bias__lins2"])

// Remove incorrect code
reflective_revise_codes(file, 5, "remove", ["#wrong_code__lins1"])

// Complete recoding
reflective_revise_codes(file, 5, "replace", ["#new1__lins1", "#new2__lins2"])
```

#### 6. `reflective_status`
```typescript
reflective_status(file_path: string): {
  total_segments: number,
  analyzed: number,
  remaining: number,
  progress_percent: number,
  segments_with_revisions: number
}
```
**Purpose:** Check analysis progress and code revision statistics

---

### Storage Format

**Location:** Same directory as transcript
**Filename:** `[transcript_name]_reflexive_notes.json`

**Structure:**
```json
{
  "metadata": {
    "transcript": "Ai_fokusgrupp_ne_traff_1_rec_1.md",
    "created_at": "2025-12-10T14:30:00Z",
    "last_modified": "2025-12-10T15:45:00Z",
    "researcher": "Researcher"
  },
  "segments": [
    {
      "index": 1,
      "line_range": "0030-0034",
      "codes": [
        "#kan_inte_säkert_veta_om_AI-genererat__lins1",
        "#kontrollbehov__lins2"
      ],
      "reflexive_note": "Central theme emerging: teachers' uncertainty about detecting AI use. Links to broader control/trust issues.",
      "analyzed_at": "2025-12-10T14:35:00Z",
      "codes_revised": false
    },
    {
      "index": 2,
      "line_range": "0035-0042",
      "codes": [
        "#de_som_förmår_använda_det_kommer_längre__lins1",
        "#equity_concern__lins3"
      ],
      "reflexive_note": "Meritocratic framing - those who master AI have advantage. Potential equity concern. Added equity code during reflexive review.",
      "analyzed_at": "2025-12-10T14:42:00Z",
      "codes_revised": true,
      "revision_history": [
        {
          "action": "add",
          "codes": ["#equity_concern__lins3"],
          "timestamp": "2025-12-10T14:43:00Z",
          "note": "Missed during Phase 1 - clear equity theme"
        }
      ]
    }
  ]
}
```

---

### Files to Create/Modify

**New files:**
- `src/tools/reflective_start.ts`
- `src/tools/reflective_read_segment.ts`
- `src/tools/reflective_write_note.ts`
- `src/tools/reflective_revise_codes.ts` ← NEW - Code revision capability
- `src/tools/reflective_next.ts`
- `src/tools/reflective_status.ts`
- `src/core/segment_reader.ts` - Parse coded transcripts, extract segments
- `src/core/segment_reviser.ts` ← NEW - Update codes in transcript file
- `src/core/note_manager.ts` - Read/write reflexive notes JSON
- `src/types/reflexive.ts` - Type definitions for reflexive analysis

**Modified files:**
- `src/server.ts` - Register new tools
- `docs/API.md` - Document new tools
- `docs/USER_GUIDE.md` - Add Phase 2 workflow section
- `README.md` - Update feature list

---

### Workflow Example

**Researcher in Claude Desktop:**

```
Researcher: "Start reflexive analysis on Ai_fokusgrupp_ne_traff_1_rec_1.md"

Claude calls: reflective_start("Ai_fokusgrupp_ne_traff_1_rec_1.md")

Claude: "✅ Loaded transcript with 47 segments. Starting reflexive analysis.

Segment 1 of 47 (lines 0030-0034):
─────────────────────────────────────
0030 [SPEAKER_01]: Vi kan ju inte säkert veta om det är AI-genererat
0031 [SPEAKER_01]: Det är ju problemet
0032 [SPEAKER_02]: Nej precis, man kan ju aldrig vara säker

Codes:
#kan_inte_säkert_veta_om_AI-genererat__lins1
#kontrollbehov__lins2
─────────────────────────────────────

What reflexive notes do you have about this segment?"

Researcher: "This reveals deep uncertainty about detection. Core tension: need for control vs. impossibility of verification. May link to trust themes."

Claude calls: reflective_write_note(file, 1, "...")

Claude: "✅ Note saved. Progress: 1/47 (2%)

Next segment?"

Researcher: "yes"

Claude calls: reflective_next(file)

Claude: "Segment 2 of 47 (lines 0035-0042):
─────────────────────────────────────
0035 [SPEAKER]: De som förmår använda det kommer längre...

Current codes:
#de_som_förmår_använda_det_kommer_längre__lins1
─────────────────────────────────────"

Researcher: "Wait - this is about equity. Add #equity_concern__lins3"

Claude calls: reflective_revise_codes(file, 2, "add", ["#equity_concern__lins3"])

Claude: "✅ Code added. Updated codes:
- #de_som_förmår_använda_det_kommer_längre__lins1
- #equity_concern__lins3 (ADDED)

Segment marked as revised. Your reflexive note?"

Researcher: "Meritocratic framing creates equity concern..."

Claude calls: reflective_write_note(file, 2, "...")

Claude: "✅ Note saved. Progress: 2/47 (4%) - 1 segment revised

Next?"

[Process repeats for all 47 segments]
```

---

## Alternatives Considered

### Alternative 1: Extend existing `code_read_next`
**Pros:** No new tools needed
**Cons:**
- Mixes Phase 1/2 concepts
- Confusing API (same tool, different purposes)
- No clear separation of concerns
**Decision:** ❌ Rejected

### Alternative 2: Manual workflow (no MCP)
**Pros:** No coding needed
**Cons:**
- Error-prone
- Not systematic
- Hard to track progress
- Loses Claude Desktop integration
**Decision:** ❌ Rejected

### Alternative 3: Python script (not MCP)
**Pros:** Simpler implementation
**Cons:**
- No Claude Desktop integration
- Breaks workflow continuity
- Manual copy-paste required
**Decision:** ❌ Rejected

### Alternative 4: New MPC server (MPC_RTA_Phase2)
**Pros:** Clean separation, independent evolution
**Cons:**
- More complex setup (two servers)
- Code duplication (parsing logic)
- More documentation burden
**Decision:** ❌ Rejected - hybrid approach better for small project

---

## Open Questions

1. **Note format:** Plain text or markdown support?
   - **Decision:** Support markdown for rich formatting (bold, lists, links)

2. **Edit capability:** Can notes be edited after creation?
   - **Decision:** Yes - `reflective_write_note` overwrites existing note

3. **Code revision scope:** Full freedom or limited to add-only?
   - **Decision:** Full freedom (add/remove/replace) - researcher controls iteration

4. **Revision history:** Track all code changes?
   - **Decision:** Yes - store revision_history array with action, codes, timestamp, note

5. **Multi-researcher:** Track researcher ID in notes?
   - **Decision:** Not in v1 - add metadata.researcher field for future

6. **Re-coding impact:** What if transcript re-coded after notes exist?
   - **Decision:** Warning message, don't auto-delete notes (researcher decision)

7. **Large revisions:** Warn if >50% of codes removed?
   - **Decision:** Yes - warning message but allow action

8. **Export format:** Need notes in other formats (CSV, Word)?
   - **Decision:** Not in v1 - JSON sufficient for Phase 2 theme work

---

## Success Criteria

- [ ] Can load coded transcript with `/segment` markers
- [ ] Can extract all segments into list
- [ ] Can read one segment at a time (< 20 lines of text)
- [ ] Can write reflexive note per segment
- [ ] **Can revise codes during reflexive analysis (add/remove/replace)**
- [ ] **Transcript file updated when codes revised**
- [ ] **Revision history tracked in notes JSON**
- [ ] Can track progress (X of Y segments analyzed + revision count)
- [ ] Can resume session across Claude Desktop restarts
- [ ] Notes saved in structured JSON format
- [ ] Notes include segment metadata (line range, codes)
- [ ] No data volume issues in Claude Desktop

---

## Timeline

- **RFC review:** 0.5 days (self-review + documentation) ✅ DONE
- **Implementation:** 4-6 days (updated for code revision feature)
  - Day 1: Segment reader + basic types
  - Day 2: Note manager + storage + revision tracking
  - Day 3: MCP tools implementation (read/write/next/status)
  - Day 4: Code revision tool + segment updater
  - Day 5: Testing with real data
  - Day 6: Documentation + polish
- **Testing:** 1 day (with ULF 2025-12-07 data)
- **Documentation:** 0.5 days (API docs + user guide)

**Total:** ~6-8 days (extended from 5-7 days for code revision capability)

---

## Testing Plan

### Unit Tests
- Segment extraction from coded transcript
- JSON storage read/write (including revision history)
- Progress tracking calculation
- **Code revision logic (add/remove/replace)**
- **Transcript file updating with new codes**

### Integration Tests
- Full workflow: start → read → write → next → status
- **Code revision workflow: read → revise → write note → next**
- Resume session from existing notes file
- Handle missing/malformed data gracefully
- **Verify revision history tracking**

### Manual Testing
- Test with real transcript: `Ai_fokusgrupp_ne_traff_1_rec_1.md`
- Test with large transcript (1500+ lines)
- Test session persistence (restart Claude Desktop)
- Test note editing (overwrite existing)
- **Test code revision: add, remove, replace actions**
- **Verify transcript file updated correctly**
- **Test large revision warning (>50% codes removed)**

---

## References

- **Phase 1 MCP Implementation:** Current codebase (`src/tools/code_*.ts`)
- **Segment Format:** Design doc `docs/design/001-multi-segment-api.md`
- **RTA Methodology:** Braun & Clarke (2006, 2019) - Reflexive Thematic Analysis
- **Data Location:** `/path/to/data/transcripts`

---

## Future Work (Not in Scope)

- Phase 2 theme generation tools
- Theme hierarchy visualization
- Multi-researcher collaboration features
- Note versioning/history
- Export to external formats (Word, CSV)
- Statistical analysis of code frequencies

---

## Rationale for Code Revision Feature

### Methodological Justification
Reflexive Thematic Analysis (Braun & Clarke, 2006, 2019) is explicitly iterative:
- Researchers revisit data multiple times
- Codes evolve as understanding deepens
- "Living with the data" requires flexibility to revise

### Practical Benefits
1. **Efficiency:** Fix errors when discovered, not in separate pass
2. **Natural workflow:** Researchers will want to revise when they see issues
3. **Quality:** Better codes → better themes in Phase 3
4. **Transparency:** Revision history provides audit trail

### Implementation Approach
- Code revision updates BOTH transcript file AND notes JSON
- Revision history tracked for methodological transparency
- Warning for large revisions (>50% removal) but researcher decides
- Full freedom: add, remove, or replace codes

---

## Approval

- [x] Self-review completed
- [x] RFC committed to git (initial version)
- [x] RFC updated with code revision feature
- [ ] RFC revision committed
- [ ] Implementation can begin

**Next step:** Commit updated RFC, then start implementation with `src/core/segment_reader.ts`
