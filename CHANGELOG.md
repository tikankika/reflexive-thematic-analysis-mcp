# Changelog

All notable changes to Phase 1 Coding MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Multi-segment API for `code_write_segment` (#001)
  - Write multiple small segments in one operation
  - Granular coding support for specific line ranges
  - Auto-sorting and overlap validation
  - Backwards compatible with v0.1.0 single-segment API
- `code_skip_chunk` tool for skipping chunks without codeable content
  - Useful for facilitator-only chunks or meta-organizational content
  - Maintains STATUS tracking and progress
  - Writes empty segment markers to maintain file structure consistency
- **Code Management Tools**: Error recovery features (v0.2.1)
  - `code_reset_status()` - Reset STATUS without modifying file content
  - `code_verify(fix=true)` - Check file integrity and optionally auto-fix STATUS
  - `code_clear_all(confirm=true)` - Reset file to uncoded state (preserves indices, creates backup)
  - `code_delete_segment(start_index, end_index)` - Remove specific segments

### Changed
- **BREAKING:** Renamed `add_line_numbers` → `add_line_index` for terminology clarity
  - Line indices (0001, 0002, ...) are PERMANENT IDENTIFIERS
  - They don't change when /segment markers are added
  - This distinguishes them from file line numbers which do change
- Enhanced `code_write_segment` input schema (supports both old and new modes)
- Updated all tool descriptions to clarify "line index" vs "line number"

### Fixed
- **CRITICAL:** Line index lookup now searches for index prefix instead of converting to number
  - Previous: `parseLineNumber("0030")` → 28 → array[27] (WRONG position)
  - Fixed: `findLineByIndex("0030", lines)` → searches for "0030 " prefix → correct position
  - Segments now placed at correct line indices in file
- **CRITICAL:** STATUS `Last-coded-line` now tracks index numbers instead of file line numbers
  - Previous: Counted file lines (which grow as segments are added) → STATUS showed 111% progress
  - Fixed: Extracts index number from line text ("0464 text..." → 464) → accurate progress tracking
  - Affects both multi-segment and legacy modes
  - File still grows as expected, but STATUS correctly tracks coding progress
- **CRITICAL:** Line index validation bug in v0.2.0 multi-segment API (2025-12-08)
  - **Problem**: Validation threw errors when encountering metadata lines (codes, markers)
  - **Error**: "Line at position 99 does not have line index prefix. Got: #kod__lins2"
  - **Root Cause #1**: Read from `modifiedLines[seg.endLine]` after insertion (wrong positions)
  - **Root Cause #2**: Validation didn't skip metadata lines (codes start with `#`, markers are `/segment`)
  - **Fixed**:
    - Use original `lines` array instead of `modifiedLines` for validation
    - Added `isMetadataLine()` helper to identify metadata (codes, markers, STATUS, empty lines)
    - Updated validation to skip metadata and search backwards for transcript lines
  - **Impact**: v0.2.0 segments API now works correctly on all files
  - **Testing**: ✅ Tested with rec_3.md - segments_written: 2, codes_written: 5, no errors

### Troubleshooting (2025-12-08)

**Issue #1: MCP SDK Compatibility Break After Claude Desktop Update**
- **Symptom**: `code_read_next` fails with "File unavailable; requested reupload to continue"
- **Root Cause**: Claude Desktop overnight update broke compatibility with MCP SDK v0.5.0
- **Solution**:
  ```bash
  npm install @modelcontextprotocol/sdk@latest  # 0.5.0 → 1.24.3
  npm run build
  # Restart Claude Desktop
  ```
- **Impact**: All MCP tools stopped working until SDK was updated
- **Prevention**: Monitor Claude Desktop updates and test MCP server compatibility

**Issue #2: code_write_segment v0.2.0 Validation Bug on Already-Coded Files**
- **Symptom**: Error "Line at position 267 does not have line index prefix. Got: /segment"
- **Root Cause**: Bug in `segment_writer.ts:376-389` - validation logic expects all lines to have 4-digit index prefix, but `/segment` and `/slut_segment` markers don't have indices
- **Workaround**: Use Legacy API (v0.1.0) with `codes` parameter instead of `segments` parameter:
  ```typescript
  // Instead of: code_write_segment({ file_path, segments: [...] })
  // Use: code_write_segment({ file_path, codes: [...] })
  ```
- **Impact**: Cannot write multiple segments at once on already-coded files; must write one segment at a time
- **Long-term Fix**: Update validation logic to skip marker lines when searching for index prefix

**Issue #3: CRITICAL - Double Line Index from Running add_line_index on Coded Files**
- **Symptom**:
  - Code lines got indices: `0150 #kod__lins2` (WRONG - codes shouldn't have indices)
  - Content lines got double indices: `0153 0091 00:05:37.871 --> ...` (TWO indices!)
  - Segment markers got indices: `0XXX /segment` (WRONG)
- **Root Cause**: `add_line_index` is designed for FRESH FILES ONLY. Running it on already-coded files adds indices to ALL lines including codes, markers, and already-indexed content
- **Solution**: Created fix script `fix_double_index.py`:
  ```python
  # Removes first 5 characters (DDDD + space) from all lines starting with 4 digits
  # Successfully fixed 950 lines in test case
  ```
- **Impact**: Corrupts entire file structure; requires manual fix script
- **Prevention**:
  - ⚠️ **NEVER run add_line_index on already-coded files**
  - ⚠️ **ONLY run add_line_index ONCE on fresh transcript files**
  - Add validation check to tool to prevent re-indexing

**Issue #4: STATUS Corruption After Double Index Fix**
- **Symptom**: After running `fix_double_index.py`, STATUS shows `Last-coded-line: 0`, `Progress: 0/13` (should be ~330 and ~34 segments)
- **Root Cause**: Fix script removed indices from STATUS header lines, causing STATUS parser to reset
- **Solution**: Run `code_verify(fix=true)` to auto-detect segments and rebuild STATUS
- **Impact**: Lost progress tracking but NOT actual coding work
- **Prevention**: Enhanced fix script to preserve STATUS or run code_verify immediately after fix

### Planned (v0.2.1)
- ~~**Fix:** v0.2.0 multi-segment API validation for re-coded files~~ ✅ **FIXED** (2025-12-08)
  - ~~Current: `segments` parameter only works on fresh files~~
  - ~~Limitation: Validation fails when encountering `/segment` or `/slut_segment` markers~~
  - ~~Workaround: Use v0.1.0 API with `codes` parameter~~
  - ✅ **Resolved**: Added `isMetadataLine()` helper and fixed validation logic (see Fixed section)

### Planned (v0.2.2)
- **STATUS Management Improvements** (RFC 002)
  - Validation check before `code_read_next` (prevent false "complete" signals)
  - Enhanced warnings for `code_reset_status` (dangerous tool)
  - Pre-validation for batch segment writes (detect overlaps before submission)
  - Best practices documentation (workflow patterns from real usage)
  - See [RFC 002: Workflow & State Management](docs/rfcs/002-workflow-state-management.md)
- **Coding Log**: Audit trail for crash recovery and multi-session support
- **code_undo()**: Undo last coding operation (requires Coding Log)
- **add_line_index validation**: Prevent re-indexing already-coded files

### Planned (v0.3.0) - Phase 2 Reflexive Analysis
- **Reflexive Analysis Tools** (RFC 001)
  - 6 new MCP tools for segment-by-segment reflexive analysis
  - `reflective_start` - Initialize reflexive session, load first segment
  - `reflective_read_segment` - Read specific segment with existing codes
  - `reflective_write_note` - Save reflexive analytical notes per segment
  - `reflective_revise_codes` - Revise codes during analysis (add/remove/replace)
  - `reflective_next` - Get next unanalyzed segment
  - `reflective_status` - Check progress and revision statistics
  - Reflexive notes stored in JSON format with metadata
  - Revision history tracking for methodological transparency
  - Addresses Claude Desktop data volume constraints (segment-by-segment presentation)
  - Follows RTA iterative methodology (Braun & Clarke, 2006, 2019)
  - Code revision updates both transcript file and notes JSON
  - Session persistence across Claude Desktop restarts

---

## [0.1.0] - 2025-12-05

### Added
- Initial MVP release
- Core tools: `code_start`, `code_read_next`, `code_write_segment`, `code_status`, `add_line_numbers`
- STATUS tracking via YAML frontmatter
- Segment markers (`/segment`, `/slut_segment`)
- Complete API documentation (API.md, USER_GUIDE.md, README.md)
- TypeScript implementation with MCP SDK
- Segment-based reading and writing for memory-efficient coding

### Technical Details
- Server handles file operations only (methodology-agnostic)
- Fixed 80-line segment size
- Read-entire/write-entire file pattern
- 4-digit line numbering (0001-9999)

---

## Design Documents & RFCs

### Design Documents
- [#001: Multi-Segment API](docs/design/001-multi-segment-api.md) - Granular segment coding feature

### RFCs (Request for Comments)
- [RFC 001: Reflexive Note Feature](docs/rfcs/001-reflexive-notes.md) - Phase 2 reflexive analysis tools
- [RFC 002: Workflow & State Management](docs/rfcs/002-workflow-state-management.md) - STATUS bugs, tool patterns, error recovery (based on ULF 2025-12-07 real-world usage)
