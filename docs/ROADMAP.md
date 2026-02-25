# Roadmap

Development plans for the Reflexive Thematic Analysis MCP Server.

---

## Current release (v0.4.x)

The tool supports two phases of Braun & Clarke's six-phase RTA methodology:

**Phase 2a — Initial coding.** Chunk-based reading for large transcripts, segment-based coding with variable semantic boundaries, multi-segment API for precise line-level coding, progress tracking across sessions, error recovery tools.

**Phase 2b — Critical review.** Segment-by-segment review of coding, reflexive note-taking, code revision with audit trail, segment restructuring (split and merge).

**Supporting infrastructure.** Project setup with methodology loading, permanent line indexing, methodology suite covering all six RTA phases with epistemological foundations, coding protocol separation from methodology.

---

## Next priorities

**STATUS reliability.** Improve synchronisation between progress tracking and actual file content. Address edge cases discovered in production use — STATUS exceeding total lines, segment count mismatches after manual edits, safer handling of reset operations.

**Project-specific context loading.** Automatically load project decisions (speaker identification, moderator handling, coding conventions established during earlier sessions) at the start of each session, reducing the need for the researcher to re-establish context.

**Coding protocol guidance.** Tools or templates to help researchers create their own coding protocols, rather than only providing examples.

---

## Future development

**Phase 3 — Generating themes.** Tools for working with codes across transcripts: extracting codes to structured formats, supporting theme construction through code clustering, cross-file aggregation. The researcher identifies and constructs themes; the tools handle data organisation.

**Code export.** Structured export of codes, segments, and review notes to JSON, CSV, or other formats for use in external tools or quantitative summaries.

**Broader methodology support.** While the included methodology suite is for Braun & Clarke's RTA, the tool infrastructure is methodology-agnostic. Future work may include methodology suites for other qualitative approaches (Grounded Theory, IPA) contributed by researchers using those methods.

---

## Design principles

These principles guide what gets built and what does not.

**Researcher authority is non-negotiable.** The tool proposes; the researcher decides. No feature should automate interpretive decisions or obscure the researcher's analytical role.

**Infrastructure, not analysis.** The tool handles file operations, progress tracking, and methodology loading. Analytical logic — what constitutes a good code, when to split a segment, how to construct a theme — belongs in the methodology documents and the researcher's judgment.

**Methodology-agnostic tools, opinionated methodology.** The tool infrastructure works with any qualitative approach. The included methodology takes a clear position grounded in Braun & Clarke's RTA and recent literature on dialogic analysis. These are separate concerns.

**Plain text, open formats.** All outputs are markdown. No proprietary formats, no lock-in, no database dependencies. A researcher who stops using this tool keeps all their work in readable files.
