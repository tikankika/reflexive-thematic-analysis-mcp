# Changelog

All notable changes to Qualitative Analysis RTA (Braun & Clarke) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.2] - 2026-01-13

### Fixed
- **CRITICAL:** Duplicate segment markers bug (double `/segment` and `/slut_segment`)
  - **Root cause**: `code_write_segment` didn't detect if content was already coded
  - **Symptom**: When same content was coded twice, resulted in nested segment markers
  - **Fix**: Added `isLineInsideCodedSegment()` validation in both legacy and multi-segment modes
  - Now throws clear error: "Line X is already inside a coded segment. Use code_delete_segment first."
- Updated code_start.ts instructions with correct code format
  - Was showing old format: `#kod__lins1`
  - Now shows correct: `#kod_beskrivning__rq1_semantisk`

---

## [0.3.1] - 2026-01-12

### Fixed
- **CRITICAL:** Tool names now comply with MCP specification
  - Pattern required: `^[a-zA-Z0-9_-]{1,64}$`
  - Changed: `phase2a-coding:code_start` → `phase2a_code_start`
  - All Phase 2a tools now use `phase2a_` prefix instead of `phase2a-coding:`
- Removed redundant `coding_manual.md` and `lenses_operationalized.md`
  - Now uses integrated `KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md`
- Updated init-instructions.md with correct code format
  - Old (wrong): `#code__lens1`, `#LATENT_code__lens1`
  - New (correct): `#kod__rq1_semantisk`, `#kod__rq1_latent`
  - Three research questions (RQ1, RQ2, RQ3) with two levels (semantisk, latent)

### Added
- **New Core Tools** for standalone operation (no Filesystem MCP needed):
  - `list_files` - List files in a directory, with optional pattern filter (e.g., `*.md`)
  - `read_file` - Read contents of any file, with optional line limit
  - Both support `~` for home directory expansion

### Changed
- **project_setup now COPIES and INDEXES transcripts** automatically
  - Original files are NEVER modified
  - Creates `transcripts/` folder in project
  - **Automatically runs `add_line_index`** on all copied transcripts
  - Config tracks `path` (copied), `original_path`, and `indexed` status
  - Coding happens on copies, originals preserved
  - Ready to code immediately after setup!
- TODO in ROADMAP v0.3.x for generalization:
  - Make init-instructions.md generic (project-specific info only in methodology/)
  - project_setup should copy methodology/ to project folder
  - init() should read code format dynamically from KODNINGSMANUAL

---

## [0.3.0] - 2026-01-11

### MAJOR: Methodology Separation Architecture (RFC-003, RFC-005, RFC-006)

This release implements a complete architectural overhaul to separate methodology from MCP code,
enabling Claude Desktop to receive methodology directly from the MCP server without requiring
manual upload to Project Knowledge.

### Added

#### New Core Tools (no prefix)
- **`init`** - CALL FIRST! Returns critical instructions for using RTA tools
  - Marks session as initialized (required before other tools)
  - Returns available tools, critical rules, RTA phases status
  - Checks methodology file availability
- **`project_setup`** - Create new RTA project structure
  - Creates project folder with `rta_config.yaml`, `methodology/`, `project_state.json`
  - Copies methodology from repo to project location
  - Configures transcripts for analysis
- **`methodology_load`** - Load methodology documents for any phase
  - Progressive loading (one document at a time)
  - Reads from `rta_config.yaml` or uses repo defaults
  - Requires init() first

#### New Core Components
- **`src/core/methodology_loader.ts`** - Loads RTA methodology documents
  - Phase-specific loading (loadPhase1, loadPhase2a, loadPhase2b, etc.)
  - Epistemology loading
  - Fallback support when files missing
  - Availability checking
- **`src/core/session_state.ts`** - Singleton for init enforcement
  - Tracks if init() was called
  - `requireInit()` throws error if init not called
  - Stores config path and current phase
- **`src/core/project_config.ts`** - Reads/manages `rta_config.yaml`
  - Phase document configuration
  - Transcript tracking
  - State management

#### New Directory Structure
- **`methodology/`** (root level) - All methodology documents
  - `rta_overview.md` - NEW: RTA introduction and overview
  - `coding_manual.md` - Coding guidelines (DISRUPTIV_INTEGRATED version)
  - `lenses_operationalized.md` - Three analytical lenses
  - `phase1_familiarization.md` through `phase6_producing_report.md`
  - `phase2b_critical_review.md` - NEW: Critical review methodology
  - `fallback-summary.md` - NEW: Condensed fallback
  - `epistemology/` - Epistemological guides (4 files)
- **`templates/`** - Project templates
  - `rta_config.yaml` - Project configuration template
- **`docs/mcp-usage/`** - MCP usage documentation
  - `init-instructions.md` - Critical instructions for Claude

#### Enhanced code_start
- Now requires `init()` to be called first (init enforcement)
- Automatically loads Phase 2a methodology in response
- Includes coding manual in response
- New `load_methodology` config option (default: true)

### Changed

#### Project Rename (RFC-006)
- **Package**: `mcp-rta-server` → `mcp-qualitative-analysis-rta`
- **Server name**: `phase2-coding-server` → `qualitative-analysis-rta-server`
- **Server class**: `Phase2CodingServer` → `QualitativeAnalysisRTAServer`

#### Tool Naming Convention (RFC-003)
- **Core tools** (no prefix): `init`, `project_setup`, `add_line_index`, `methodology_load`
- **Phase 2a tools** (prefix `phase2a-coding:`):
  - `phase2a-coding:code_start`
  - `phase2a-coding:code_read_next`
  - `phase2a-coding:code_write_segment`
  - `phase2a-coding:code_skip_chunk`
  - `phase2a-coding:code_status`
  - `phase2a-coding:code_verify`
  - `phase2a-coding:code_reset_status`
  - `phase2a-coding:code_clear_all`
  - `phase2a-coding:code_delete_segment`

#### Dependencies
- Added `js-yaml` for YAML parsing
- Added `@types/js-yaml` for TypeScript support

### Removed
- `docs/rfcs/RFC-003-critical-review.md` (deprecated, replaced by RFC-003-methodology-separation-architecture.md)

### Documentation
- Updated `ROADMAP.md` with v0.3.0 completion status
- Updated `README.md` with new project name and description
- All RFCs updated: MPC_RTA → qualitative-analysis-rta

### RFCs Implemented
- [RFC-003: Methodology Separation Architecture](docs/rfcs/RFC-003-methodology-separation-architecture.md)
- [RFC-004: Phase 2 Terminology Alignment](docs/rfcs/RFC-004-phase2-terminology-alignment.md)
- [RFC-005: Implementation Plan](docs/rfcs/RFC-005-implementation-plan-methodology-separation.md)
- [RFC-006: Rename to qualitative-analysis-rta](docs/rfcs/RFC-006-rename-to-qualitative-analysis-rta.md)

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
- **BREAKING:** Renamed server and tools from `phase1-coding` → `phase2-coding` (2026-01-11)
  - Aligns with Braun & Clarke RTA terminology: Phase 2 = Initial Coding
  - Server class: `Phase1CodingServer` → `Phase2CodingServer`
  - Server name: `phase1-coding-server` → `phase2-coding-server`
  - Requires update to Claude Desktop config for tool prefix change
  - See: [RFC-004-phase2-terminology-alignment.md](/docs/rfcs/RFC-004-phase2-terminology-alignment.md)
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

### Planned (v0.3.0) - Phase 2b: Critical Review of Semi-Automated Coding + Advanced STATUS
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

- **Advanced STATUS Management** (RFC 002 - Long-term)
  - Atomic STATUS updates (no partial state)
  - Auto-recovery from STATUS desynchronization
  - Enhanced error messages with visual displays
  - Pre-flight validation before all operations
  - Architectural improvements to prevent issues found in v0.2.1 production use

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
