# Changelog

All notable changes to Qualitative Analysis RTA (Braun & Clarke) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Coding log (Tier 2)** — `code_write_segment` now automatically appends a human-readable markdown entry to `[transcript]_coding_log.md`. Each entry includes segment title, line range, codes, researcher decision, reflexive note, and coding rationale. Four new optional parameters: `reflexive_note`, `coding_rationale`, `segment_title`, `researcher_decision`. Fully backwards compatible — works in both legacy and multi-segment modes. Best-effort (never fails the primary write).
- **`reflexive_note` tool (Tier 3)** — researcher's own voice: thoughts, doubts, insights, bias reflections. Saves timestamped markdown memos to `_process_memos/` directory alongside the transcript. Cross-references in `_process_log.jsonl` (type: `meta_reflexive`). Usable in any phase. Requires `init()` first.
- **`CodingLogWriter` core module** (`src/core/coding_log_writer.ts`) — append-only markdown writer with `getLogPath()` and `append()`. Follows the same pattern as `ProcessLogger`.

### Changed
- **Example protocol files prefixed with `EXAMPLE_`** — `protocols/coding_protocol_disruptive_3rq.md` → `EXAMPLE_coding_protocol_disruptive_3rq.md`, `coding_protocol_sensemaking_v1.md` → `EXAMPLE_coding_protocol_sensemaking_v1.md`. Clarifies that these are format examples; researchers create their own protocols alongside them. Updated references in `methodology_loader.ts`, `code_start.ts`, and `protocols/README.md`.

### Documentation
- **RFC-001 status updated to Accepted** — Cowork plugin analysis concluded: plugin rejected, MCP improvements (v0.6.1) implemented instead.

---

## [0.6.1] - 2026-03-06

### Added
- **`workflow_status` tool** — show project-wide RTA progress: lists all transcripts with status, calculates phase progress, recommends next step. Uses rta_config.yaml or session state.
- **`session_reflection` tool** — structured reflection questions based on process log data. Counts corrections, rejections, discoveries from the current session and generates targeted questions. Use before `log_session_end`.
- **`process_log_summary` tool** — surface process log events with optional filtering by event type or last N events. Groups by type with counts, shows patterns.
- **`methodology_load` phase scaffolding for Phase 4–6** — when loading the last methodology document for phase4, phase5, or phase6, the response now includes `phase_scaffolding` with structured work steps, reflection questions, and AI countermeasures. Phase 1–3 remain unchanged (no scaffolding).

### Documentation
- **RFC-001: Cowork Plugin vs MCP Analysis** (`docs/rfcs/RFC-001-cowork-plugin.md`) — systematic evaluation of whether a Cowork plugin should complement the MCP server. Conclusion: plugin rejected in favor of MCP improvements.

---

## [0.6.0] - 2026-02-24

### Changed
- **Terminology: "AI-Augmented RTA" → "Dialogic Reflexive Thematic Analysis" across entire repository.** The term "Dialogic" replaces "AI-Augmented" because analytical meaning is constructed through multi-layered dialogue — between researcher and AI, researcher and data, and researcher and their own interpretive commitments. The dialogue *is* the method, not a means to the method. Updated in: all 6 phase documents, all 4 epistemology documents, README, package.json, CONTRIBUTING, RESEARCH_WORKFLOW, ROADMAP, init-instructions. Reference section headers changed from "AI-Augmented Qualitative Research" to "AI in Qualitative Research". The two remaining "AI-Augmented" references in `constructionist.md` are intentional — they explain the rationale for the terminological change.
- **`methodology/rta_overview.md` replaced by `methodology/README.md`** — researcher-facing guide to the methodology. Introduces four foundational principles (adding dialogic reflexivity as the fourth), reading order, and document map. The previous `rta_overview.md` was an abstract framework document; the new README addresses the researcher directly. Original content preserved in git history; `rta_overview.md` now contains a redirect.
- **`methodology/epistemology/constructionist.md` fused** with operational content from `Section_3.1.1_Epistemology_Guide.md` (Nextcloud). New sections: "A Note on Terminology" (introducing Dialogic RTA), "Positioning Your Analysis" (four questions), "Orienting the Dialogic Partnership" (AI familiarization as epistemological practice), "Documenting the Epistemological Dialogue", "Readiness Check". Scaffold placeholders (`[YOUR ANSWER]`) transformed to methodological instructions.
- **`package.json`** description and keywords updated: "AI-augmented" → "Dialogic", keyword "ai-augmented" → "dialogic".

### Added
- **Status section in repository README** — honest about methodology maturity: tool infrastructure tested in practice, methodology documents are working documents with unverified references, terminological framework and fourth principle are recent developments, Phase 3–6 not tested in practice. "This is an active research project, not a finished product."
- **Process logging infrastructure for dialogic reflexivity.** Captures the epistemically significant moments in researcher-AI dialogue that existing tools do not preserve — corrections, redirections, rejections, discoveries, conventions.
  - `log_process_event` — manual tool for researcher-initiated events. Captures event type, researcher's exact words (in vivo), context, and before/after state.
  - `log_session_end` — session summary with key decisions and unresolved questions.
  - `ProcessLogger` core module (`src/core/process_logger.ts`) — append-only JSONL writer. One `_process_log.jsonl` file per transcript.
  - `ProcessEvent` types (`src/types/process_log.ts`) — 12 event types covering researcher-initiated and auto-logged events.
- **Auto-logging in existing tools:**
  - `code_start` and `review_start` auto-log `session_start` events.
  - `code_write_segment` auto-logs `codes_written` events (in both legacy and multi-segment modes).
  - `review_revise_codes` auto-logs `codes_revised` events with before/after codes.
  - All auto-logging is best-effort (try/catch) — primary operations never fail due to logging.
- **`methodology/dialogic_reflexivity.md`** — methodology document covering the theoretical foundations (Bakhtin, Gadamer, Schon, postphenomenology) and practical guidance for preserving the dialogic process.
- Soft validation: `log_process_event` warns (does not fail) when researcher-initiated event types lack `researcher_words`.

---

## [0.5.2] - 2026-02-22

### Added
- **`write_file` utility tool** — generic file writer for saving analytical work between sessions (candidate themes, thematic maps, definitions, report drafts). Creates parent directories. Refuses to overwrite coded transcripts or review notes unless explicitly confirmed. Closes the critical persistence gap for Phase 3–6: without this, all analytical work produced in conversation was lost when the session ended.

### Changed
- Phase 4–6 status changed from `coming_soon` to `available` in init tool output. These phases work through `methodology_load` + conversation using existing infrastructure — no dedicated tools needed.

---

## [0.5.1] - 2026-02-22

### Added
- **Phase 3 tool: `phase3_extract_codes`** — extracts all codes from coded transcripts into a single markdown file (`phase3_code_extraction.md`) with metadata: source transcript, line references, research question, semantic/latent level, and text excerpts. Grouped by RQ, then level, then alphabetically. Gives the researcher the complete code inventory for theme generation.
- **`CodeExtractor` core module** (`src/core/code_extractor.ts`) — parses code format using string splitting (not regex), detects coded transcripts by `/segment` marker presence rather than config status field, strips line index prefixes from text excerpts.

### Fixed
- **`rta_config.yaml` transcript status now updates during coding workflow.** Previously all transcripts stayed `pending` forever — Phase 2a tools never called `updateTranscriptStatus()`. Now: `code_start` → `phase2a_in_progress`, `code_read_next` (completion) → `phase2a_complete`, `review_start` → `phase2b_in_progress`. Uses best-effort config discovery from transcript path.
- **`templates/rta_config.yaml`** — replaced stale `KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md` references with `coding_protocol_disruptive_3rq.md` (2 occurrences). This was the last remaining KODNINGSMANUAL reference in the codebase.
- **`MethodologyLoader` infrastructure fixes for Phases 4–6:**
  - `getDocumentList()` now returns correct documents for phase4, phase5, phase6 (previously fell through to default).
  - `getPhaseFallback()` updated to current code format (`#code_name__rqN_semantic`), added phase 4–6 fallback texts.
  - `getHardcodedFallback()` updated to current terminology.
  - `checkAvailability()` no longer references non-existent `fallback-summary.md`.
- **`templates/rta_config.yaml`** — removed project-specific `coding_protocol_disruptive_3rq.md` from generic template (was listed under both `general` and `phase2a`). Coding protocols are project-specific and added during `project_setup`.

### Changed
- Phase 3 status changed from `coming_soon` to `available` in init tool output.
- `init-instructions.md` updated with Phase 3 tools section and Phase 4–6 workflow guidance.
- `API.md` updated with Phase 3 tool specification.

---

## [0.5.0] - 2026-02-22

### Changed
- **Project identity reframed: methodology as core, tools as infrastructure.** All public documentation now presents the methodology suite as the intellectual substance of the project, with file operations explicitly secondary. This affects README, RESEARCH_WORKFLOW, and init-instructions.
- **README.md completely rewritten for researcher audience.** Opens with the research problem, not the technology. Concrete coding session description. "What you get" section with code example. Honest about setup complexity. Technical content (architecture, MCP) moved to clearly labelled developer section at the bottom.
- **docs/GETTING_STARTED.md rewritten.** Linux path added. Verification steps after each installation step. Troubleshooting expanded. "Try it out" replaces full tutorial — points to RESEARCH_WORKFLOW for the analytical process.
- **docs/ROADMAP.md rewritten** from 655 lines of internal planning to 75 lines: current release, next priorities, future development, design principles.
- **docs/API.md** — orienting introduction added for researchers ("You do not need to know these tool names").
- **CONTRIBUTING.md** — project structure section added explaining methodology/protocols/tools separation.
- **docs/mcp-usage/init-instructions.md** — methodology engagement elevated to primary instruction. New opening section "THE METHODOLOGY IS THE CORE". Phase 2b tools and utility tools added to available tools list. Workflow reordered: methodology → show full → wait for acknowledgement → then data.

### Added
- **docs/RESEARCH_WORKFLOW.md** — new document covering the researcher's complete analytical journey: preparation (know your data, prepare transcripts, write coding protocol), engaging with the methodology (why it matters, what to read, why not to skip it), how coding sessions unfold, chunks vs segments, what good coding feels like, between-session continuity, why review matters, the difference between coding and reviewing, what you get after coding and review, practical session management. Written in academic prose for a researcher audience, with no tool names or API references.

### Removed
- **docs/USER_GUIDE.md** — replaced by RESEARCH_WORKFLOW.md. The User Guide mixed workflow and technical reference without serving either audience well.
- **docs/PUBLIC_RELEASE_CLEANUP.md** — self-deleting instruction document, job completed.

### Repository
- GitHub repository renamed from `MPC_RTA` to `reflexive-thematic-analysis-mcp`
- GitHub About description updated to lead with researcher value, not technology
- GitHub Topics expanded for researcher discoverability

---

## [0.4.2] - 2026-02-22

### Changed
- **Methodology suite upgraded to Phase 2b quality level** — all phase documents now share consistent analytical register, theoretical sophistication, and AI-epistemological integration
  - `rta_overview.md` → Full methodological framework: three foundational principles ("proving the obvious", double reflexivity, AI as heuristic partner), epistemological foundation with AI-specific implications, phase table with AI roles and risks, "Methodological Integrity" rewritten from checklist to argument
  - `phase2a_initial_coding.md` → Reduced from ~700 to ~350 lines. Epistemological grounding moved to overview. Four analytical questions per code added. AI-orientation list rewritten as paragraph. Approach A deepened to match Approach B
  - `phase3_generating_themes.md` → AI integrated throughout (not bolted on). "Similarity is not meaning" as core distinction. Salience section strengthened with concrete example
  - `phase4_reviewing_themes.md` → AI confirmation bias section added. Byrne Level One example strengthened. "Quality Indicators" and "What You Should Have" merged
  - `phase5_defining_naming.md` → AI language colonization risk identified. Balanced AI section added (testing definitions, alternative names, boundary cases)
  - `phase6_producing_report.md` → "Analytical flattening" as AI-specific writing risk. Illustrative/analytical overlap with Phase 5 removed. AI transparency rewritten from checklist to method argument. Theme ordering refers to Phase 5
  - `phase2b_critical_review.md` — Unchanged (already at target quality)
  - `phase1_familiarization.md` — Unchanged (different in kind: preparatory, not analytical)

### Added
- **`protocols/` directory** (project root level) — Coding Protocols separated from methodology
  - `coding_protocol_disruptive_3rq.md` — Three-RQ disruption study (moved from `methodology/KODNINGSMANUAL_...`)
  - `coding_protocol_sensemaking_v1.md` — Sensemaking study (copied from Nextcloud project)
- Clear architectural separation: `methodology/` = how to think (stable), `protocols/` = how to code (project-specific)

### Removed
- `methodology/KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md` (moved to `protocols/`)
- `methodology/fallback-summary.md` — outdated terminology ("Lens 1/2/3"), actively misleading. Methodology files ship with the tool; a fallback that contradicts them is worse than no fallback
- `VISION.md` — redundant with README.md, contained outdated framing ("methodology-agnostic", "file handler not analysis tool")
- `docs/README.md` — completely outdated ("Phase 1 Coding MCP Server", "4 tools", "MPC_RTA")
- `docs/development_ideas/` — pre-implementation drafts now implemented in the tool
- `docs/methodology/` — empty directory, methodology lives at repo root
- `fix_double_index.py`, `fix_status_headers.py` — one-off utility scripts

### Archived to Nextcloud (internal development history)
- `docs/rfcs/` (9 files) — historical decision logs, 30-50% Swedish, valuable as development record but not user-facing
- `docs/design/001-multi-segment-api.md` — already implemented
- `templates/coding_decisions_template.md` — Swedish research artefact
- `docs/LANGUAGE_REVIEW_CODE.md` — internal cleanup instruction

### Documentation
- **Epistemology documents rewritten** from tutorial format to researcher-colleague register
  - `epistemology/constructionist.md` → ~500→130 lines. Central argument: AI tends toward essentialist assumptions; constructionism is actually better suited to AI augmentation. Constructionist-computational tension as full section
  - `epistemology/orientation.md` → ~450→120 lines. Key insight: AI produces text that looks like chosen orientation without doing its analytical work. Experiential and critical risks differentiated
  - `epistemology/inductive_deductive.md` → ~500→120 lines. Core claim: AI has no genuinely inductive capacity — its proposals are deductive (training-data derived). Research questions as diagnostic tool
  - `epistemology/semantic_latent.md` → ~550→130 lines. Sharpest AI distinction: competent at semantic, weak at latent. Two failure patterns identified: generic theoretical labels and disguised semantic codes
  - All four: tutorial elements removed (26 "Write here" blocks, 11 AI prompt templates, exercise sections, methodology-section writing templates), project-specific references anonymised, consistent voice throughout
- **Phase 1 familiarization rewritten** from tutorial format (~300 lines, 15+ checklists, 5 prompt templates) to researcher-colleague register (~90 lines). Three dimensions preserved: human immersion, AI orientation, dialogic scaffolding
- **protocols/README.md created** — English summary explaining why coding protocols are in Swedish
- **docs/LANGUAGE_REVIEW_CODE.md created** — instructions for Claude Code: src/ language cleanup, KODNINGSMANUAL→coding protocol terminology, fallback-summary.md decision
- **docs/PUBLIC_RELEASE_CLEANUP.md created** — comprehensive 6-phase instruction for Claude Code: archive 15 internal files to Nextcloud, delete redundant files, update .gitignore, language cleanup in src/, update public docs, verify build
- **Source code language cleanup** — all user-facing text in TypeScript translated from Swedish to English
  - `session_state.ts`, `code_start.ts`, `methodology_load.ts`, `review_start.ts`, `init.ts` — Swedish instructions and error messages translated
  - `init-instructions.md` — updated to match
  - Stale `KODNINGSMANUAL` references in `methodology_loader.ts` and `code_start.ts` fixed to point to `protocols/coding_protocol_disruptive_3rq.md`
- **Public documentation rewritten for external users**
  - `docs/API.md` → Complete rewrite: "4 tools" → all 22 tools with correct `phase2a_`/`phase2b_` prefixes, current parameters, file format reference
  - `docs/USER_GUIDE.md` → Complete rewrite: "Phase 1 Coding" → Phase 2a/2b workflow, removed KODNINGSMANUAL references, removed Swedish examples
  - `docs/ROADMAP.md` → 655→85 lines. Removed internal planning, Swedish terminology boxes, RFC cross-references. Now: current version, next priorities, future vision, design principles
  - `README.md`, `GETTING_STARTED.md`, `CONTRIBUTING.md` → git clone URL updated from `MPC_RTA` to `reflexive-thematic-analysis-mcp`
  - `package.json` → name updated to `reflexive-thematic-analysis-mcp`
  - Dead links to removed files (VISION.md, docs/rfcs/, docs/design/) cleaned from README
- Literature base expanded across all documents: Brailas (2025), Ozuem et al. (2025), Al-Fattal & Singh (2025), Dröge (2025), Heersmink et al. (2024)
- Backup of pre-upgrade methodology saved to Nextcloud: `_archive_20260222_methodology_v3/`

---

## [0.4.1] - 2026-02-21

### Added
- **Segment restructuring tools for Phase 2b** — split and merge segments while keeping review notes in sync
  - `phase2b_review_split_segment` — Split a segment at a specified line into two; copies all codes to both halves
  - `phase2b_review_merge_segments` — Merge two adjacent segments into one; deduplicates codes
- **NoteManager enhancements:**
  - `shiftIndices(notesFile, fromIndex, delta)` — Shift review note indices after split/merge operations
  - `removeNote(notesFile, segmentIndex)` — Remove a specific segment's review note

### Technical Details
- Split/merge operations are atomic: file modification and note index updates happen together
- Split copies all original codes to both new segments (researcher adjusts with `review_revise_codes`)
- Merge deduplicates codes, keeps first segment's note, removes second segment's note
- All notes with indices after the affected segment are shifted automatically (+1 for split, -1 for merge)
- `metadata.total_segments` updated to reflect new segment count

---

## [0.4.0] - 2026-02-21

### Added
- **Phase 2b: Critical Review Tools** — 6 new MCP tools for researcher-driven review of AI-assisted coding
  - `phase2b_review_start` — Start/resume review session, load Phase 2b methodology, return first segment
  - `phase2b_review_next` — Get next unreviewed segment (or "complete" when done)
  - `phase2b_review_read_segment` — Read specific segment by 1-based index with existing note
  - `phase2b_review_write_note` — Write reflexive note for a segment (marks as reviewed)
  - `phase2b_review_revise_codes` — Revise codes in transcript (add/remove/replace) with audit trail
  - `phase2b_review_status` — Show review progress (reviewed, remaining, revisions)
- **Core modules for Phase 2b:**
  - `src/types/review.ts` — Type definitions (ReviewSegment, ReviewNote, ReviewNotesFile, ReviewStatus, CodeRevision)
  - `src/core/segment_reader.ts` — SegmentReader: parse coded transcripts, extract segments (read-only)
  - `src/core/note_manager.ts` — NoteManager: create/load/save review notes JSON, track progress
  - `src/core/segment_reviser.ts` — SegmentReviser: modify codes within existing segments
- **Review notes stored as `[transcript]_review.json`** in same directory as transcript
  - Per-segment reflexive notes with timestamps
  - Code revision history for methodological transparency
  - Progress tracking across sessions (resume support)

### Changed
- **Server version bumped to 0.4.0**
- **Phase 2b status in `init` changed from `coming_soon` to `available`**
- **Phase 2b methodology document expanded** (`methodology/phase2b_critical_review.md`)

---

## [0.3.3] - 2026-02-18

### Added
- **`coding_decisions.md` template** (`templates/coding_decisions_template.md`)
  - Generic project-level template for documenting coding decisions
  - Sections: project context, data-specific decisions, coding conventions, status, session log
  - Researcher fills in during coding; Claude reads at session start
- **`project_setup` now copies `coding_decisions_template.md` → `coding_decisions.md`** into each new project

### Changed
- **KODNINGSMANUAL updated** (RFC-007: methodology updates from coding practice)
  - Flexibility in coding: number of codes per segment dictated by content, not formula
  - Semantic/latent guidance: latent only when genuinely needed
  - In vivo codes: no quotes in hashtags (Obsidian compatibility)
  - Reflexive notes: genuine reflexive thinking, not formulaic patterns
- **phase2a_initial_coding.md updated**
  - Chunk vs segment distinction clarified
  - AI assistant instructions added (avoid mechanical patterns, researcher authority)

### Design Decision
- **Reflexive notes stay in chat during Phase 2a** — session log in `coding_decisions.md` captures key observations for Phase 2b/3
  - Avoids disrupting coding flow with file writes
  - Formal structured reflexive notes come in Phase 2b (RFC-001)

### Documentation
- RFC-007: Methodology Updates from Coding Practice
- RFC-007 Claude Code prompt for project_setup implementation

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
