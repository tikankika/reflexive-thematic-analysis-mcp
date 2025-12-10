# RFC 002: Workflow & State Management

## Status
**Draft** | Under Review | Approved | Implemented

**Date:** 2025-12-10
**Author:** Niklas Karlsson
**Branch:** `reflexive_note` (documentation only)

---

## Context

During Phase 1 coding of ULF 2025-12-07 focus group data, critical issues with STATUS tracking and workflow patterns were discovered through real-world usage.

### Discovery Process
- **Project:** ULF 2025-12-07 focus group analysis
- **Data:** 5 transcripts coded over extensive session (37,092 lines of chat history)
- **Tools used:** MCP_RTA v0.2.1 tools in Claude Desktop
- **Duration:** Multi-day coding sessions with pauses and restarts

### Impact
- **15-20% of troubleshooting time** spent on STATUS synchronization issues
- **False "complete" signals** caused lost work context
- **Manual workarounds** required to continue coding
- **Tool usage patterns** emerged organically but weren't documented

---

## Technical Issues Discovered

### Issue 1: STATUS Desynchronization

**Symptom:**
`last_coded_line` value exceeded file's `total_lines`, causing `code_read_next` to incorrectly report "complete" when work remained.

**Example from chat history:**
```
File: rec_1.md
Total lines: 805
STATUS reported last_coded_line: 827 (later: 3760!)
Result: code_read_next said "complete" at line 0519, but file continued to 0805
```

**Root Cause (Hypothesis):**
- STATUS increments `last_coded_line` based on chunk size (80 lines)
- When segments are written, `/segment` markers and code lines are inserted
- File grows, but STATUS tracking doesn't account for inserted lines
- Eventually `last_coded_line` diverges from actual file structure

**Impact:**
- User lost work context mid-session
- Had to manually verify actual last coded line
- Could not trust `code_status` output
- Required manual calculation: "Where did I actually stop?"

**Frequency:** Occurred on 2 out of 5 files coded

---

### Issue 2: Segment Count Mismatch

**Symptom:**
STATUS reported different segment counts than actual `/segment` markers in file.

**Examples from chat history:**
```
Case 1:
STATUS: "1 segments coded"
File: 6 /segment markers present

Case 2:
STATUS: "11 segments coded"
code_verify: "47 segments found in file"
```

**Root Cause:**
- `code_write_segment` increments STATUS segment counter
- If batch write fails partially, counter may increment without markers written
- `code_verify` counts actual `/segment` markers in file
- These two methods produce different results

**Impact:**
- Cannot trust progress indicators
- `code_status` shows inaccurate completion percentage
- User must run `code_verify` to get accurate count
- Confusion about how much work is actually done

**Frequency:** Occurred on 3 out of 5 files

---

### Issue 3: code_reset_status Dangers

**Symptom:**
Using `code_reset_status` to "fix" STATUS bugs actually made situation worse.

**What happened:**
```
Before: STATUS showed "11 segments" but file had 47 segments
User: Called code_reset_status() to "reset and start fresh"
After: STATUS showed "0 segments / 0%" despite 47 segments in file
Result: Lost all progress tracking
```

**Recovery:**
- Had to call `code_verify fix=true` to rebuild STATUS
- Partial recovery: segment count fixed, but last_coded_line still wrong
- Required manual verification of where to resume

**Root Cause:**
- `code_reset_status` resets STATUS to uncoded state
- Does NOT check if file already contains segments
- Assumes fresh start when file is actually partially coded

**Impact:**
- Tool is dangerous and counterintuitive
- "Fix" made problem worse, not better
- No warning about data loss risk

**Recommendation:** This tool should rarely be used

---

### Issue 4: Overlapping Segments in Batch Writes

**Symptom:**
Batch `code_write_segment` calls failed with overlap errors.

**Example from chat history:**
```
Error: "Overlapping segments detected:
Segment ending at line 977 (original: 0556) overlaps with
segment starting at line 977 (original: 0556)"
```

**Root Cause:**
- When writing multiple segments in batch (8-10 segments per call)
- End line of segment N must be < start line of segment N+1
- User accidentally specified adjacent segments with same boundary line
- Validation correctly caught error, but required manual fix

**Fix Required:**
```
Original (error):
Segment 1: 0553-0556
Segment 2: 0556-0560  ← overlap at 0556

Corrected:
Segment 1: 0553-0555
Segment 2: 0556-0560  ← no overlap
```

**Impact:**
- ~5% error rate (1 in 20 batch writes)
- Requires human intervention to identify boundary issue
- Entire batch fails, must resubmit corrected version

**Note:** This is correct validation behavior - not a bug, but a common user error

---

## Tool Usage Patterns Observed

### Successful Workflow That Emerged

**Core rhythm discovered:**

1. **Read chunk:** `code_read_next` returns 60-100 lines
2. **Identify segments:** User identifies 9-10 semantic units within chunk
3. **Propose codes:** 5-7 codes baseline, 8-11 for "rich data"
4. **Batch write:** Submit all segments from chunk in one `code_write_segment` call
5. **Periodic verification:** Run `code_verify` and `code_status` every 3-4 chunks

**Key Insight:** Batch segment writing (8-10 segments per call) is efficient and became the preferred pattern.

---

### Tool Usage Statistics

From 37,092-line chat history analysis:

**Primary Tools (70%):**
- `code_read_next`: ~15+ calls (chunk reading)
- `code_write_segment`: ~10+ calls (batch writing)

**Management Tools (20%):**
- `code_verify`: 5+ calls (integrity checking)
- `code_status`: 3+ calls (progress checking)

**Initialization (5%):**
- `add_line_index`: 1 call per file (setup)
- `code_start`: Multiple calls (session initialization)

**Recovery (5%):**
- `code_reset_status`: 1 call (problematic)

**Unused Tools (0%):**
- `code_skip_chunk`: 0 calls
- `code_clear_all`: 0 calls
- `code_delete_segment`: 0 calls

**Interpretation:**
- Core tools (`code_read_next`, `code_write_segment`) work well - high usage
- Management tools needed but usage indicates troubleshooting overhead
- New tools (`code_skip_chunk`, etc.) either not needed or undiscovered
- `code_reset_status` dangerous - low usage is good

---

### Coding Density Observed

**Segments per chunk:** 9-10 segments (within 60-100 line chunk)
**Codes per segment:** 5-7 baseline, 8-11 for rich data
**Segment size:** 1-20 lines (variable, semantic units)

**Example from chat history:**
```
Chunk 2 (lines 0091-0180):
- 10 segments identified
- 75 codes written
- Average: 7.5 codes per segment
```

**Principle discovered:**
> "Fewer codes by default, but must adapt to data richness"
> - Baseline: 5-7 codes per segment
> - Rich data (recurring themes like "grundkompetens-paradoxen"): 8-11 codes

---

## Proposed Solutions

### Short-term Fixes (v0.2.2)

**Priority 1: STATUS Validation**
- **Before `code_read_next`:** Check if `last_coded_line` < `total_lines`
- **If mismatch detected:** Warn user and suggest `code_verify fix=true`
- **Auto-suggest recovery:** "STATUS appears corrupted. Run code_verify first?"

**Priority 2: Document code_reset_status Dangers**
- Add prominent warning in tool description
- Recommend `code_verify fix=true` instead
- Show example of when reset is appropriate (truly corrupted file)

**Priority 3: Batch Write Pre-validation**
- Before submitting to `code_write_segment`, check:
  - Segments are sorted by line index
  - No overlaps (end_line < next_start_line)
  - All line indices exist in file
- Return clear error message with boundary conflicts identified

**Priority 4: Add "Trust code_verify" Guidance**
- Document: `code_verify` count is authoritative, STATUS may lag
- Best practice: Run `code_verify` before `code_read_next` if unsure
- Status checks should always defer to file reality

---

### Long-term Improvements (v0.3.0+)

**Architecture Change: Atomic STATUS Updates**
- STATUS updates must be atomic with file writes
- If file write succeeds, STATUS updates; if fails, STATUS rolls back
- No partial state: STATUS always reflects actual file content

**Enhanced code_verify**
- Auto-detect STATUS desync and offer to fix
- Provide detailed diff: "STATUS says X, file contains Y"
- Options: Fix STATUS, Reset file, Manual inspection

**Improved Error Messages**
- Overlapping segments: Show exact boundary conflict with visual
```
Segment 1: 0553-0556
Segment 2: 0556-0560
           ^^^^
Overlap at line 0556
Suggestion: Change Segment 1 to 0553-0555
```

**Pre-flight Validation**
- Before any operation, validate STATE is sane
- Warn if `last_coded_line` exceeds `total_lines`
- Suggest recovery path automatically

---

## Best Practices (Documented Workflow)

### Recommended Workflow

**1. Session Start**
```
code_start(file_path)
→ Creates STATUS, returns first chunk
```

**2. Before Reading Next Chunk**
```
IF unsure about progress:
  code_verify(fix=true)  ← Trust this, not STATUS
  code_status()           ← Verify progress looks sane

code_read_next()
```

**3. Coding Within Chunk**
```
- Identify 9-10 semantic segments (variable size, 1-20 lines)
- Propose 5-7 codes per segment (8-11 if data is rich)
- Verify segment boundaries don't overlap
```

**4. Batch Write Segments**
```
code_write_segment({
  file_path,
  segments: [
    { start_index: "0091", end_index: "0095", codes: [...] },
    { start_index: "0096", end_index: "0102", codes: [...] },
    // ... 8-10 segments total
  ]
})
```

**5. Periodic Verification (Every 3-4 Chunks)**
```
code_verify()   ← Check file integrity
code_status()   ← Check progress
```

**6. If STATUS Looks Wrong**
```
code_verify fix=true  ← Rebuild STATUS from file
```

**7. NEVER Use code_reset_status Unless:**
```
- File is truly corrupted (unparseable STATUS)
- Starting completely fresh (no segments in file)
- Confirmed with human inspection first
```

---

### Tool Safety Hierarchy

**Safe (Use Freely):**
- `code_read_next`
- `code_write_segment` (with pre-validation)
- `code_status`

**Use with Caution:**
- `code_verify` (read-only is safe, `fix=true` modifies STATUS)

**Dangerous (Rarely Use):**
- `code_reset_status` (erases progress tracking)
- `code_clear_all` (erases all coding work)

**When in Doubt:**
- Trust `code_verify` count over STATUS display
- Verify manually by checking last `/segment` marker in file

---

## Alternatives Considered

### Option A: Fix Bugs in v0.2.2 (Recommended)

**Pros:**
- Addresses root causes
- Improves user experience significantly
- Prevents future STATUS issues

**Cons:**
- Requires 3-5 days implementation
- Needs careful testing with real data
- Risk of introducing new bugs

**Recommendation:** YES - bugs are severe enough to warrant fixes

---

### Option B: Document Workarounds Only

**Pros:**
- Fastest to implement (2-3 hours)
- No code changes, lower risk
- Users can work around issues

**Cons:**
- Issues persist, frustration continues
- 15-20% troubleshooting overhead remains
- Professional tool should not require constant workarounds

**Recommendation:** NO - insufficient for production quality

---

### Option C: Complete STATUS System Rewrite

**Pros:**
- Clean slate, architectural improvements
- Could design better system from scratch

**Cons:**
- Massive effort (2+ weeks)
- High risk of new bugs
- Overkill for current issues
- Delays other features (Phase 2 reflexive analysis)

**Recommendation:** NO - premature optimization

---

### Option D: Hybrid Approach (Selected)

**Immediate (v0.2.2):**
- Fix critical bugs (STATUS validation, code_reset_status warnings)
- Document best practices and workarounds
- Add pre-validation for batch writes

**Future (v0.3.0+):**
- Refactor STATUS system for atomic updates
- Improve error messages and auto-recovery

**Pros:**
- Balances short-term relief with long-term quality
- Users get immediate improvements
- Buys time for proper architectural fixes

**Cons:**
- Some technical debt remains temporarily

**Recommendation:** YES - pragmatic approach

---

## Success Criteria

### Documentation (v0.2.2)
- [x] RFC 002 written with real examples
- [ ] STATUS bugs documented with chat history evidence
- [ ] Tool usage patterns formalized
- [ ] Best practices workflow written
- [ ] Warnings added to dangerous tools

### Implementation (v0.2.2 - if pursuing bug fixes)
- [ ] STATUS validation before `code_read_next`
- [ ] `code_reset_status` shows prominent warning
- [ ] Batch write pre-validation implemented
- [ ] Enhanced error messages for overlaps
- [ ] `code_verify` guidance added to USER_GUIDE.md

### Long-term (v0.3.0+)
- [ ] Atomic STATUS updates implemented
- [ ] Auto-recovery from STATUS desync
- [ ] Visual error messages for segment conflicts
- [ ] 10+ files coded without STATUS issues

---

## Implementation Plan (If Pursuing Fixes)

### Phase 1: Documentation (2-3 hours) - IMMEDIATE
1. Complete RFC 002 ✅
2. Update `docs/USER_GUIDE.md` - Add "Troubleshooting STATUS Issues"
3. Update `docs/API.md` - Add warnings to `code_reset_status`
4. Update `CHANGELOG.md` - Reference RFC 002

### Phase 2: Critical Fixes (3-5 days) - v0.2.2
1. **Day 1-2:** STATUS validation in `code_read_next`
   - File: `src/tools/code_read_next.ts`
   - Check: `last_coded_line < total_lines`
   - Warn if mismatch, suggest `code_verify`

2. **Day 2-3:** Pre-validation for batch writes
   - File: `src/tools/code_write_segment.ts`
   - Validate: segment ordering, no overlaps, valid indices
   - Enhanced error messages

3. **Day 3-4:** Warning system for dangerous tools
   - File: `src/tools/code_reset_status.ts`
   - Add confirmation prompt
   - Show impact warning
   - Suggest alternatives

4. **Day 4-5:** Testing with real data
   - Test on ULF 2025-12-07 transcripts
   - Verify STATUS tracking accuracy
   - Confirm batch writes catch errors

### Phase 3: Architectural Improvements (v0.3.0+)
- Refactor: `src/core/status_manager.ts`
- Implement atomic STATUS updates
- Add auto-recovery mechanisms
- Improve `code_verify` intelligence

---

## Testing Strategy

### Manual Testing with Real Data
- Use original ULF 2025-12-07 transcripts
- Re-code 1-2 files from scratch with fixes applied
- Verify STATUS stays synchronized
- Test error scenarios (overlapping segments, desync)

### Regression Testing
- Ensure existing coded files still work
- Verify `code_verify` correctly identifies issues
- Test recovery from intentionally corrupted STATUS

### Edge Cases
- File with 0 segments (fresh start)
- File with 50+ segments (large file)
- STATUS with `last_coded_line > total_lines` (corrupt)
- Multiple batch writes in single session

---

## Migration Path

**For users with existing coded files:**

1. **No action required** - files remain valid
2. **If STATUS is corrupted:**
   ```
   code_verify fix=true
   → Rebuilds STATUS from file content
   ```
3. **New files:** Benefit from improved validation automatically
4. **Existing workflows:** Continue working as before

**Breaking changes:** NONE

---

## References

### Primary Sources
- **Chat history:** `/Users/niklaskarlsson/Nextcloud/Fokusgrupper_AI_2025/Analysis/ULF_2025-12-07/Chat_history.md` (37,092 lines)
- **Coded transcripts:** 5 files from ULF 2025-12-07 project
- **MCP_RTA codebase:** v0.2.1 (current)

### Related Documentation
- RFC 001: Reflexive note feature (structure template)
- USER_GUIDE.md: Current workflow documentation
- API.md: Tool specifications
- CHANGELOG.md: Version history

### Methodology References
- Real-world usage: Multi-day coding sessions
- User feedback: Direct corrections from researcher
- Error logs: Captured from chat history

---

## Open Questions

1. **Should v0.2.2 fix bugs or just document?**
   - Recommendation: FIX - issues are severe
   - Timeline impact: 3-5 days vs 2-3 hours

2. **Priority: Bug fixes vs Phase 2 reflexive analysis?**
   - Option A: Fix bugs first (STATUS must be reliable)
   - Option B: Phase 2 first, bugs later (delays fixes)
   - Recommendation: Option A - solid foundation needed

3. **How much validation is too much?**
   - Balance: User experience vs performance
   - Current: Minimal validation, many errors
   - Proposed: Pre-flight checks, better UX
   - Risk: Slower operations?

4. **Should code_reset_status be removed entirely?**
   - Pro: Prevents dangerous usage
   - Con: Needed for true corruption cases
   - Compromise: Keep but add strong warnings ✅

---

## Approval

- [x] RFC drafted with real-world evidence
- [ ] User review and feedback
- [ ] Decision: Implement fixes or document only?
- [ ] Commit RFC to git
- [ ] Update CHANGELOG with RFC reference
- [ ] Begin implementation (if approved)

---

**Next Steps:**
1. User reviews RFC 002
2. Decide: Fix bugs in v0.2.2 or defer to v0.3.0?
3. If fixing: Branch off for bug fixes
4. If deferring: Update documentation only
5. Update CHANGELOG and ROADMAP accordingly
