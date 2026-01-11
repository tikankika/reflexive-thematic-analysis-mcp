# RTA Overview - AI-Augmented Reflexive Thematic Analysis

## What is RTA?

Reflexive Thematic Analysis (Braun & Clarke, 2006, 2019, 2022) is a qualitative analysis method for identifying patterns (themes) in data. Unlike other thematic analysis approaches, RTA emphasizes:

- **Researcher reflexivity** - Active engagement with the data and awareness of one's own interpretive lens
- **Organic theme development** - Themes grow from data through interpretation, not from pre-set categories
- **Flexibility** - Can be used with different epistemological positions and research questions

## AI-Augmented RTA

This implementation uses AI (Claude) as a **dialogue partner** in the coding process, where the researcher maintains full interpretive authority.

### Key Principles

1. **Researcher Authority** - AI proposes codes, researcher decides
2. **Transparency** - All coding decisions are documented and traceable
3. **Reflexivity** - The process supports (not replaces) researcher reflexivity
4. **Memory Management** - Chunked processing for large transcripts without context overflow

### What AI Can Do

- Read large transcripts in manageable chunks
- Propose initial codes based on methodology guidelines
- Track progress and manage STATUS
- Apply consistent code formatting

### What AI Cannot Do

- Make final coding decisions (researcher authority)
- Generate themes autonomously (Phase 3+ is researcher-led)
- Replace reflexive engagement with data
- Bypass methodological principles

## RTA Phases

| Phase | Name | MCP Tools | Status |
|-------|------|-----------|--------|
| 1 | Familiarization | (manual reading) | Coming soon |
| 2a | Initial Coding | phase2a-coding:code_start, code_read_next, code_write_segment | Available |
| 2b | Critical Review | phase2b-review:start, next | Coming soon |
| 3 | Generating Themes | phase3-themes:start | Coming soon |
| 4 | Reviewing Themes | (planned) | Future |
| 5 | Defining & Naming | (planned) | Future |
| 6 | Producing Report | (planned) | Future |

## Epistemological Foundation

This implementation is designed with:

- **Constructionist epistemology** - Data represents interpretations, not objective truth
- **Primarily inductive approach** - Codes grow from data (though deductive lenses can guide focus)
- **Semantic + latent levels** - Both explicit statements and underlying meanings

## Key Terminology

- **CHUNK** - Technical reading unit (60-100 lines) for memory management
- **SEGMENT** - Semantic coding unit (variable size) marked with `/segment`
- **CODE** - A label capturing meaning, format: `#code_description__lens1`
- **STATUS** - YAML frontmatter tracking coding progress

## Three Analytical Lenses

This project uses three complementary lenses:

1. **Lens 1**: Students' AI usage (constructions, experiences)
2. **Lens 2**: Teachers' practices and attitudes toward AI
3. **Lens 3**: AI's impact on learning processes

## Getting Started

1. Call `init()` to receive critical instructions
2. Call `project_setup()` if starting a new project
3. Use `methodology_load()` to read phase-specific methodology
4. Begin coding with `phase2a-coding:code_start`

## References

- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology.
- Braun, V., & Clarke, V. (2019). Reflecting on reflexive thematic analysis.
- Braun, V., & Clarke, V. (2022). Thematic analysis: A practical guide.
- Byrne, D. (2022). A worked example of Braun and Clarke's approach to reflexive thematic analysis.
