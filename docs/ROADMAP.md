# Development Roadmap

Current status and future direction for the Reflexive Thematic Analysis MCP Server.

---

## Current Version: v0.4.x

### What exists and works

**Phase 2a — Initial Coding**
- Chunk-based reading (60–100 lines per chunk)
- Multi-segment coding with precise line ranges
- STATUS tracking via YAML frontmatter (pause/resume across sessions)
- Error recovery: verify, reset, clear, delete

**Phase 2b — Critical Review**
- Segment-by-segment review of AI-assisted coding
- Reflexive note-taking per segment
- Code revision with full audit trail (add/remove/replace)
- Segment restructuring (split/merge) with note synchronisation
- Progress tracking across sessions

**Core Infrastructure**
- Project setup with methodology loading
- Permanent line indexing for transcripts
- Progressive methodology loading per phase
- Init enforcement (session safety)
- Methodology suite: all six RTA phases + four epistemological guides

---

## Next Priorities

**Methodology loader improvements**
- Auto-detect project coding protocol from `rta_config.yaml`
- Support multiple coding protocols per project
- Load project-specific coding decisions at session start

**STATUS reliability**
- Better recovery from interrupted writes
- Cross-validate STATUS against actual segment count on session resume

**Code export**
- Export all codes from a transcript as structured data (JSON/CSV)
- Cross-file code aggregation for multi-transcript projects

---

## Future Vision

**Phase 3 — Generating Themes**
- Cluster related codes across transcripts
- Candidate theme generation with researcher approval
- Theme-to-code mapping

**Phase 4 — Reviewing Themes**
- Theme testing against data
- Thematic map visualisation support

**Phase 5–6 — Defining, Naming, Writing**
- Theme definition tools
- Report structure support

---

## Design Principles

These guide all development decisions:

1. **Researcher has interpretive authority.** AI proposes, researcher decides. No automated analysis.
2. **Methodology lives in documents, not code.** The tool loads and presents methodology — it does not enforce analytical decisions.
3. **Separation of concerns.** `methodology/` = how to think (stable). `protocols/` = how to code (project-specific). `src/` = file operations (technical).
4. **Session safety.** Progress is tracked in files. Work survives session boundaries.

---

**Last updated:** 2026-02-22
