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
- **Data:** 5 coded transcripts in `/Users/niklaskarlsson/Nextcloud/Fokusgrupper_AI_2025/Analysis/ULF_2025-12-07/Phase 2 - Teams`
- **Methodology:** Reflexive Thematic Analysis (Braun & Clarke, 2006)
- **Current phase:** Transition from Phase 1 (coding) to Phase 2 (theme generation)

---

## Proposed Solution

### Core Concept
Create MCP tools to present **one segment at a time** to Claude Desktop, enabling systematic reflexive note-taking without data volume constraints.

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

#### 5. `reflective_status`
```typescript
reflective_status(file_path: string): {
  total_segments: number,
  analyzed: number,
  remaining: number,
  progress_percent: number
}
```
**Purpose:** Check analysis progress

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
    "researcher": "Niklas Karlsson"
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
      "analyzed_at": "2025-12-10T14:35:00Z"
    },
    {
      "index": 2,
      "line_range": "0035-0042",
      "codes": [
        "#de_som_förmår_använda_det_kommer_längre__lins1"
      ],
      "reflexive_note": "Meritocratic framing - those who master AI have advantage. Potential equity concern.",
      "analyzed_at": "2025-12-10T14:42:00Z"
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
- `src/tools/reflective_next.ts`
- `src/tools/reflective_status.ts`
- `src/core/segment_reader.ts` - Parse coded transcripts, extract segments
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
   - **Proposal:** Support markdown for rich formatting (bold, lists, links)

2. **Edit capability:** Can notes be edited after creation?
   - **Proposal:** Yes - `reflective_write_note` overwrites existing note

3. **Multi-researcher:** Track researcher ID in notes?
   - **Proposal:** Not in v1 - add metadata.researcher field for future

4. **Re-coding impact:** What if transcript re-coded after notes exist?
   - **Proposal:** Warning message, don't auto-delete notes (researcher decision)

5. **Export format:** Need notes in other formats (CSV, Word)?
   - **Proposal:** Not in v1 - JSON sufficient for Phase 2 theme work

---

## Success Criteria

- [x] Can load coded transcript with `/segment` markers
- [x] Can extract all segments into list
- [x] Can read one segment at a time (< 20 lines of text)
- [x] Can write reflexive note per segment
- [x] Can track progress (X of Y segments analyzed)
- [x] Can resume session across Claude Desktop restarts
- [x] Notes saved in structured JSON format
- [x] Notes include segment metadata (line range, codes)
- [x] No data volume issues in Claude Desktop

---

## Timeline

- **RFC review:** 0.5 days (self-review + documentation)
- **Implementation:** 3-5 days
  - Day 1: Segment reader + basic types
  - Day 2: Note manager + storage
  - Day 3: MCP tools implementation
  - Day 4: Testing with real data
  - Day 5: Documentation + polish
- **Testing:** 1 day (with ULF 2025-12-07 data)
- **Documentation:** 0.5 days (API docs + user guide)

**Total:** ~5-7 days

---

## Testing Plan

### Unit Tests
- Segment extraction from coded transcript
- JSON storage read/write
- Progress tracking calculation

### Integration Tests
- Full workflow: start → read → write → next → status
- Resume session from existing notes file
- Handle missing/malformed data gracefully

### Manual Testing
- Test with real transcript: `Ai_fokusgrupp_ne_traff_1_rec_1.md`
- Test with large transcript (1500+ lines)
- Test session persistence (restart Claude Desktop)
- Test note editing (overwrite existing)

---

## References

- **Phase 1 MCP Implementation:** Current codebase (`src/tools/code_*.ts`)
- **Segment Format:** Design doc `docs/design/001-multi-segment-api.md`
- **RTA Methodology:** Braun & Clarke (2006, 2019) - Reflexive Thematic Analysis
- **Data Location:** `/Users/niklaskarlsson/Nextcloud/Fokusgrupper_AI_2025/Analysis/ULF_2025-12-07/Phase 2 - Teams`

---

## Future Work (Not in Scope)

- Phase 2 theme generation tools
- Theme hierarchy visualization
- Multi-researcher collaboration features
- Note versioning/history
- Export to external formats (Word, CSV)
- Statistical analysis of code frequencies

---

## Approval

- [ ] Self-review completed
- [ ] RFC committed to git
- [ ] Implementation can begin

**Next step:** Commit this RFC, then start implementation with `src/core/segment_reader.ts`
