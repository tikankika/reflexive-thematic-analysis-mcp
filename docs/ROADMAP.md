# Phase 1 Coding MCP Server - Development Roadmap

This document outlines the planned development phases for the Phase 1 Coding MCP Server.

---

## Version History & Planning

### ✅ v0.1.0 - MVP: Minimal File Handler (Current)

**Status**: Completed
**Released**: December 2025
**Goal**: Minimal file handler for segment-based qualitative coding

**Features**:
- ✅ Project structure and documentation
- ✅ Core modules: `segment_reader`, `segment_writer`, `status_manager`
- ✅ MCP Tools: `code_start`, `code_read_next`, `code_write_segment`, `code_status`
- ✅ STATUS tracking via YAML frontmatter
- ✅ Segment markers (`/segment`, `/slut_segment`)
- ✅ Code format validation (hashtag prefix, underscores)
- ✅ Complete API documentation
- ✅ Technical user guide

**Success Criteria**:
- ✅ Can code complete 1500-line transcript without memory overflow
- ✅ Pause and resume works reliably via STATUS
- ✅ Code format matches existing coded files exactly
- ⏳ Integration test with real transcript

**Key Design Decision**:
Server handles ONLY file operations. Coding methodology (RTA, GT, IPA, etc.) lives in external manual uploaded to Claude Desktop.

---

### 📋 v0.2.0 - Performance & Reliability + Granular Coding

**Target**: Q1 2026
**Goal**: Optimize for large files, improve error handling, AND support granular segment coding

**Features**:

- **Granular Coding (NEW - Design #001)** ⭐:
  - Multi-segment API for `code_write_segment`
  - Write multiple small segments in one operation
  - **Use Case**: Claude identifies meaningful units (quotes, exchanges, thematic chunks), MPC writes them precisely
  - Granular line-level code associations for precise citation
  - Auto-sorting and overlap validation
  - **Backwards compatible** with v0.1.0 single-segment API
  - [Design Document](/docs/design/001-multi-segment-api.md)

  **Example workflow**:
  ```
  User: "Identify quotes about AI in lines 1-200 and code each separately"
  Claude: [Finds 3 quotes, codes each as separate segment]
  Result: 3 precise segments with exact line associations
  ```

- **Performance Improvements**:
  - Incremental file updates (avoid full rewrite on each segment)
  - Streaming segment reads for files >5000 lines
  - Configurable segment size per session (currently fixed at 80)
  - Read segment size from STATUS (avoid hardcoding)

- **Enhanced Error Handling**:
  - File locking detection (prevent concurrent access issues)
  - Graceful recovery from corrupted STATUS
  - Better validation for segment boundaries
  - Retry logic for filesystem errors

- **Quality of Life**:
  - ✅ `code_skip_chunk()` - Skip current chunk without coding (COMPLETED)
  - Progress percentage in all tool outputs

- **Coding Log (Audit Trail)** 📝:
  - **Problem**: When system crashes or sessions pause, no history of what was coded
  - **Solution**: Persistent coding log for crash recovery and session continuity

  **Design Questions to Resolve**:
  1. **Format**: JSON array, Markdown append, or SQLite?
     - Recommendation: Markdown append (human-readable, git-friendly)
  2. **Location**:
     - Same file (after STATUS)? → Keeps everything in one place
     - Separate `.log` file (test_6.md → test_6_coding.log)? → Cleaner separation
     - Hidden `.meta` folder? → Harder to access
     - Recommendation: Separate `.log` file in same directory
  3. **Content per entry**:
     ```markdown
     ## 2025-12-06 22:15:00 - code_write_segment
     - Chunk: 2
     - Line indices: 0123-0134
     - Codes written: 2
       - #skillnad_information_kunskap__lins1
       - #elever_förstår_inte__lins1
     - Session ID: abc123
     ```
  4. **Retention**: Keep full history or auto-cleanup old entries?
  5. **Read access**: New tool `code_log_view()` or just manual file read?

  **Use Cases**:
  - Crash recovery: "What was the last thing I coded before crash?"
  - Multi-session: "What did I code yesterday?"
  - Debugging: "Why is my STATUS showing 3 segments but I only remember 2?"
  - Audit trail: "Show me all codes added to this transcript with timestamps"

  **Implementation Priority**: HIGH (critical for production use)
  **Target**: v0.2.1 (quick follow-up to v0.2.0)

- **Code Management Tools (Error Recovery)** 🔧:
  - **Problem**: When coding errors occur (wrong segments, buggy indexing, duplicate markers), no way to fix without manual file editing
  - **Solution**: Tools to remove, undo, and clean up coding mistakes

  **Tools to Implement**:

  1. **`code_delete_segment(start_index, end_index)`** - Delete specific segment
     - Removes /segment markers and all codes between start_index and end_index
     - Updates STATUS to reflect removal
     - **Use Case**: "I coded the wrong segment, delete segment 0123-0134"
     - **Validation**: Check that segment exists and has markers before deleting

  2. **`code_undo()`** - Undo last coding operation
     - Removes most recent segment added to file
     - Rolls back STATUS to previous state
     - **Use Case**: "I just coded segment with wrong codes, undo it"
     - **Requires**: Coding log to know what to undo
     - **Limitation**: Only works if coding log exists (v0.2.1+)

  3. **`code_clear_all()`** - Remove ALL coding from file
     - Strips all /segment markers
     - Removes all codes (lines starting with #)
     - Removes /slut_segment markers
     - Resets STATUS to uncoded state
     - **Preserves**: Line indices (0001, 0002, ...)
     - **Use Case**: "Start over, file is corrupted with bad segments"
     - **Safety**: Requires confirmation parameter `{confirm: true}` to prevent accidents
     - **Creates backup**: Auto-backup before clearing

  4. **`code_verify(fix=false)`** - Check and optionally fix file integrity
     - Validates all /segment and /slut_segment markers are paired
     - Checks for duplicate markers or orphaned codes
     - Verifies STATUS matches actual coded segments in file
     - **Without fix**: Reports issues without making changes
     - **With fix=true**: Auto-corrects STATUS based on actual file content
       - Counts actual /segment markers in file
       - Updates Last-coded-line, Last-file-position, Progress
       - **Use Case**: "File manually cleaned, STATUS out of sync - fix it"
     - **Use Case**: "Something looks wrong, check file integrity"

  5. **`code_reset_status()`** - Reset STATUS to uncoded state
     - Resets STATUS to initial state (Last-coded-line: 0, Progress: 0/N)
     - Does NOT modify file content (preserves any existing segments/codes)
     - **Use Case**: "File manually cleaned, need fresh start with STATUS"
     - **Use Case**: "Testing - reset STATUS without touching file"
     - **Difference from code_clear_all**:
       - `code_reset_status()` → Only changes STATUS
       - `code_clear_all()` → Removes all coding + resets STATUS

  **Design Decisions**:
  - All deletion tools create automatic backups before modification
  - All tools update STATUS after changes
  - All tools append to coding log (if enabled)
  - Clear operations require explicit confirmation to prevent accidents

  **Implementation Priority**: HIGH (discovered during testing - critical for reliable workflows)
  **Target**: v0.2.1 (parallel to coding log feature)

**Success Criteria**:
- Code 5000+ line transcripts without performance degradation
- Recover from STATUS corruption automatically
- Handle filesystem errors gracefully
- Multi-segment coding works with both legacy and new modes seamlessly

---

### 📋 v0.2.2 - STATUS Management & Workflow Improvements

**Target**: Q1 2026
**Goal**: Fix critical STATUS tracking bugs discovered during production use
**Based on**: RFC 002 (ULF 2025-12-07 real-world usage analysis)

**Critical Fixes** (RFC 002):

- **STATUS Synchronization**:
  - **Problem**: `last_coded_line` exceeds `total_lines`, causing false "complete" signals
  - **Solution**: Validation check before `code_read_next`
  - **Impact**: Prevents lost work context mid-session
  - **Discovered**: ULF 2025-12-07 session (2 out of 5 files affected)

- **Segment Count Accuracy**:
  - **Problem**: STATUS count differs from actual `/segment` markers in file
  - **Solution**: Trust `code_verify` as authoritative, warn on mismatch
  - **Impact**: Accurate progress tracking
  - **Discovered**: ULF 2025-12-07 session (3 out of 5 files affected)

- **code_reset_status Safety**:
  - **Problem**: Tool is dangerous - erases progress tracking without warning
  - **Solution**: Add prominent warnings and suggest alternatives
  - **Impact**: Prevents accidental data loss
  - **Recommendation**: Rarely use this tool

- **Batch Write Pre-validation**:
  - **Problem**: Overlapping segments caught late, entire batch fails
  - **Solution**: Pre-flight validation before submission
  - **Impact**: Better error messages, fewer failed writes
  - **Error rate**: ~5% in production (1 per 20 batch writes)

**Best Practices Documentation**:
- Workflow patterns from real usage (8-10 segments per batch)
- Error recovery procedures (use `code_verify fix=true`)
- Tool safety hierarchy (safe vs dangerous tools)

**Success Criteria**:
- STATUS stays synchronized during long sessions
- No false "complete" signals
- Clear warnings on dangerous tools
- User can trust progress indicators

**References**:
- [RFC 002: Workflow & State Management](docs/rfcs/002-workflow-state-management.md)
- Real-world evidence: ULF 2025-12-07 coding session (37,092 lines)

---

### 📋 v0.3.0 - Code Management + Advanced STATUS Features

**Target**: Q2 2026
**Goal**: Code review tools AND architectural STATUS improvements

**Features**:
- **Code Extraction**:
  - `code_list()` - List all codes in file with frequency
  - `code_search(code)` - Find all segments containing a specific code
  - `code_export()` - Export codes to JSON/CSV for analysis

- **Code Operations**:
  - `code_rename(old_code, new_code)` - Rename code throughout file
  - `code_merge(codes[], new_code)` - Merge similar codes
  - `code_remove(code)` - Remove code from all segments

- **Statistics**:
  - Total codes per segment
  - Code frequency analysis
  - Segment coverage metrics (coded vs uncoded)

- **Advanced STATUS Management** ⭐ NEW (RFC 002):
  - **Atomic STATUS Updates**:
    - STATUS updates atomic with file writes
    - No partial state - always reflects reality
    - Auto-rollback on failed writes

  - **Auto-recovery**:
    - Detect STATUS desync automatically
    - Offer to fix with detailed diff
    - "STATUS says X, file contains Y - fix?"

  - **Enhanced Error Messages**:
    - Visual display of overlapping segments
    - Suggest corrections automatically
    - Show boundary conflicts clearly

  - **Pre-flight Validation**:
    - Validate STATE before operations
    - Warn if `last_coded_line > total_lines`
    - Auto-suggest recovery path

**Use Case**:
Quality control, code consolidation, AND reliable STATUS tracking.

**Note**: These tools are methodology-agnostic - they work with any coding approach.

---

### 📋 v0.4.0 - Memo & Annotation Support

**Target**: Q2 2026
**Goal**: Integrated note-taking during coding

**Features**:
- **Memos**: `code_memo(note)` - Add memo to current segment
- **Patterns**: `code_pattern(description)` - Flag emerging patterns
- Memos stored in YAML frontmatter:
  ```yaml
  ---
  CODING-STATUS: [...]
  MEMOS:
    - segment: 5
      date: 2025-12-05
      note: "Pattern emerging: detection anxiety recurring"
    - segment: 12
      date: 2025-12-05
      note: "In-vivo 'fulanvändning' - central construct?"
  ---
  ```

- **Review Tools**:
  - `code_list_memos()` - List all memos chronologically
  - `code_memo_export()` - Export memos to markdown file

**Research Value**:
Maintains audit trail of researcher's interpretive process (important for qualitative rigor).

**Note**: Methodology-agnostic - works with any qualitative approach.

---

### 📋 v0.5.0 - Phase 2 Integration (Theme Generation)

**Target**: Q3 2026
**Goal**: Bridge to Phase 2 (theme generation) workflows

**Features**:
- **Code Export**:
  - `code_extract()` - Export all codes to structured JSON
  - Include metadata: frequency, segments, dates
  - Compatible with external theme generation tools

- **Theme File Generation**:
  - `code_generate_theme_template()` - Create template for theme work
  - Outputs preliminary structure for manual theme clustering

**Example Output**:
```markdown
# PRELIMINARY THEMES

## (Theme name - researcher decides)
- #code_1 (appears in segments: 2, 5, 12)
- #code_2 (appears in segments: 3, 7)
[researcher groups codes manually]

## (Another theme)
[...]
```

**Not Included** (researcher authority):
- Automatic theme naming (researcher decides)
- Automatic code clustering (researcher groups)
- This tool FACILITATES theme generation, not automates it

---

### 📋 v1.0.0 - Production Ready

**Target**: Q4 2026
**Goal**: Stable, documented, tested release for broader use

**Requirements**:
- All features v0.1 - v0.5 stable
- Comprehensive test coverage (>80%)
- Full documentation with examples
- Error handling for all edge cases
- Performance optimization (<2s per segment)
- Multi-platform support (macOS, Linux, Windows)

**Quality Assurance**:
- Tested on 10+ real transcripts (multiple methodologies)
- Validated against hand-coded data
- User testing with 3+ researchers
- Security review (file access, path injection prevention)

**Documentation**:
- Video tutorials
- Example workflows for different methodologies (RTA, GT, IPA)
- Troubleshooting guide expanded
- FAQ section

---

## Future Considerations (Post v1.0)

### Potential Features (No Timeline)

**Collaborative Coding**:
- Multi-researcher code comparison
- Consensus-building tools
- Inter-rater reliability calculation
- Merge coded files from different researchers

**Export Formats**:
- NVivo-compatible export
- MAXQDA-compatible export
- ATLAS.ti-compatible export
- CSV/Excel for quantitative analysis
- JSON/XML for custom processing

**Advanced File Operations**:
- Batch processing (code multiple transcripts in sequence)
- Code co-occurrence matrix generation
- Longitudinal coding (track codes across multiple sessions)
- Version control integration (git-aware STATUS)

**Integration**:
- Phase 3 tools: Thematic map visualization
- Web UI for remote coding sessions
- API for external tool integration

---

## Principles Guiding Development

### What We Build
✅ Tools that SUPPORT researcher decision-making
✅ Features that REDUCE memory/cognitive load
✅ Functionality that MAINTAINS methodological rigor
✅ Generic tools that work across methodologies

### What We DON'T Build
❌ Autonomous coding (violates qualitative research principles)
❌ Methodology-specific logic (that lives in external manuals)
❌ Features that obscure researcher's interpretive role
❌ "Magic" buttons that bypass researcher engagement

**Core Philosophy**:
This is a **file handler**, not an analysis tool. Researcher authority and methodological integrity are non-negotiable.

---

## Lessons Learned from Production Use

### ULF 2025-12-07 Coding Session (RFC 002)

**Scale**: 5 transcripts, multi-day session, 37,092 lines of chat history

**Critical Discoveries**:

1. **STATUS tracking fragile** - 15-20% of troubleshooting time
   - `last_coded_line` can exceed `total_lines`
   - Segment counts diverge from reality
   - `code_reset_status` dangerous without warnings

2. **Batch writing efficient** - 8-10 segments per call works well
   - ~5% error rate (overlapping segments)
   - Pre-validation would prevent most errors

3. **Tool usage patterns**:
   - 70% `code_read_next` + `code_write_segment` (core workflow)
   - 20% `code_verify` + `code_status` (management/debugging)
   - 0% `code_skip_chunk`, `code_delete_segment` (unused/undiscovered)

4. **code_verify more reliable than STATUS**:
   - Counts actual `/segment` markers
   - Should be authoritative source
   - STATUS display may lag reality

**Impact on Roadmap**:
- v0.2.2 added for critical STATUS fixes (based on RFC 002)
- v0.3.0 expanded with long-term STATUS architecture improvements
- Best practices documented for future users

**References**:
- [RFC 002: Workflow & State Management](docs/rfcs/002-workflow-state-management.md)

---

## Contributing to Roadmap

Have suggestions? Consider:
- **Use case**: What research problem does this solve?
- **Methodology agnostic**: Does this work for RTA, GT, IPA, etc.?
- **Memory impact**: Does this increase context usage?
- **File format impact**: Does this change the output format?

---

## Versioning Strategy

- **Major versions** (1.0, 2.0): Breaking changes to MCP tools or file format
- **Minor versions** (0.1, 0.2): New features, backward compatible
- **Patch versions** (0.1.1, 0.1.2): Bug fixes, no new features

---

## Current Status

**v0.1.0 MVP Completed** ✅
- Core file handling implemented
- 4 MCP tools operational (`code_start`, `code_read_next`, `code_write_segment`, `code_status`)
- Complete documentation (README, API, USER_GUIDE)

**Next**: Integration testing with real transcripts

---

See project README for current feature status and setup instructions.
