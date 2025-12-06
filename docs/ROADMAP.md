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
  - `code_undo()` - Remove last coded segment
  - `code_skip()` - Skip current segment without coding
  - Progress percentage in all tool outputs

**Success Criteria**:
- Code 5000+ line transcripts without performance degradation
- Recover from STATUS corruption automatically
- Handle filesystem errors gracefully
- Multi-segment coding works with both legacy and new modes seamlessly

---

### 📋 v0.3.0 - Code Management Tools

**Target**: Q2 2026
**Goal**: Built-in tools for code review and consolidation

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

**Use Case**:
Quality control and code consolidation during reflexive review.

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
