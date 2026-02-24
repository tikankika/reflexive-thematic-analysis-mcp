# Dialogic Reflexive Thematic Analysis — Qualitative Coding with AI as Partner

Structured qualitative coding for Braun & Clarke's Reflexive Thematic Analysis, with AI as a dialogic partner. You read the data. AI proposes codes. You decide.

---

## Status

The tool infrastructure (Phase 2a, 2b) is stable and has been tested through extensive coding work on real focus group data. It works.

The methodology documents are working documents. They are theoretically grounded in Braun & Clarke's RTA and recent literature on AI in qualitative research, but they have not been peer-reviewed. References have not been systematically verified against their sources — some claims attributed to specific authors may need correction. The terminological framework ("Dialogic Reflexive Thematic Analysis") and the fourth foundational principle (dialogic reflexivity, grounded in Bakhtin, Gadamer, Schön, and postphenomenology) are recent theoretical developments undergoing refinement. Phase 3–6 methodology documents exist but have not been tested in practice.

This is an active research project, not a finished product. The methodology is being developed through use — insights from coding sessions feed back into the documents. If you use it, read critically.

---

## The problem this solves

Qualitative researchers working with AI assistants face a practical tension. Large interview and focus group transcripts exceed the AI's processing window, so either the data must be truncated or the analysis loses coherence. There is no systematic way to work through a full dataset, no persistent tracking of progress across sessions, and no built-in safeguard for the researcher's interpretive authority.

The result is ad hoc analysis — productive in short bursts, but difficult to sustain across the dozens of hours that rigorous qualitative coding demands.

## What this provides

At its core, this is a **methodology for conducting qualitative analysis with AI** — a set of documents that articulate how Braun & Clarke's Reflexive Thematic Analysis works when an AI language model participates in the analytical process. The methodology addresses the epistemological challenges that AI mediation introduces: the tendency toward shallow pattern reproduction, the risk of displaced researcher authority, and the need for a second layer of reflexivity directed at AI's influence on interpretation (Brailas, 2025; Ozuem et al., 2025).

The methodology is delivered through an extension for [Claude Desktop](https://claude.ai/download) that loads the relevant analytical framework at each phase of the research process. Claude does not generate generic responses — it operates within an explicit methodological position that the researcher reads, engages with, and applies to their data.

The tool also handles the practical infrastructure — chunking large transcripts, tracking progress across sessions, writing codes to files, managing segment boundaries — so that the conversation between researcher and AI can focus on interpretation rather than file management.

Two phases are currently supported: **Phase 2a** (initial coding) and **Phase 2b** (critical review of that coding). Phases 3–6 are planned.

## What a coding session looks like

You work in Claude Desktop. The conversation is natural language — you talk to Claude as you would to a research colleague who shares your methodological framework.

Each session begins with methodology. Claude loads the relevant phase document — not as a formality but as the analytical foundation for the work that follows. You read it together. The methodology establishes what counts as a good code, what risks AI introduces at this phase, and what questions should guide your interpretive decisions. This shared framework is what makes the subsequent coding dialogue productive rather than ad hoc.

**Phase 2a — Initial coding.** Claude presents approximately 80 lines of transcript text. You read it together. Claude proposes codes — semantic and latent, mapped to your research questions — grounded in the methodology you have just reviewed. You evaluate each proposal: accept, modify, reject, or add codes Claude missed. When you are satisfied, the codes are written to your transcript file with permanent line references. Claude presents the next chunk. This continues until the transcript is fully coded.

**Phase 2b — Critical review.** Claude presents each coded segment one at a time. The Phase 2b methodology introduces specific concepts — the "proving the obvious" problem, double reflexivity — that structure how you revisit the coding. You review the codes with fresh eyes, write a reflexive note capturing your analytical observations, and revise codes where your understanding has deepened. You can split segments that contain multiple meaning units or merge segments that belong together. Every revision is logged.

Throughout both phases, Claude operates within the methodology, not alongside it. It proposes — you decide. This is not automated coding; it is a structured analytical dialogue where the researcher retains full interpretive authority.

## What you get

After coding, your transcript file contains structured segments with codes and permanent line references:

```markdown
/segment
0042 00:05:12 --> 00:05:38; [SPEAKER_03]: I just tell them to check with
0043 another source, but honestly I don't know if that's enough anymore...

#uncertainty_about_own_guidance__rq2_semantic
#professional_knowledge_gap_constructed_as_personal__rq2_latent
/slut_segment
```

After review, each segment also has a reflexive note documenting your analytical reasoning — creating an audit trail of interpretive decisions that strengthens methodological transparency.

The coded files are plain markdown. They work with any text editor, version control system, or qualitative analysis tool that reads text.

## What you need

- **Claude Desktop** — free or Pro ([download](https://claude.ai/download))
- **Node.js 18+** — a runtime environment required by the tool ([download](https://nodejs.org/))
- **Your transcripts** in markdown format (`.md`)
- **Your methodological knowledge** — familiarity with RTA or a comparable qualitative approach

The initial setup takes approximately 10 minutes and involves running a few commands in the terminal and editing a configuration file. The [Getting Started](docs/GETTING_STARTED.md) guide walks through each step. Once configured, all subsequent work happens through natural language conversation in Claude Desktop.

## Setup

```bash
git clone https://github.com/tikankika/reflexive-thematic-analysis-mcp.git
cd reflexive-thematic-analysis-mcp
npm install
npm run build
```

Add the server to your Claude Desktop configuration file (see [Getting Started](docs/GETTING_STARTED.md) for the exact file location on your operating system):

```json
{
  "mcpServers": {
    "reflexive-thematic-analysis-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/reflexive-thematic-analysis-mcp/dist/server.js"]
    }
  }
}
```

Replace `/absolute/path/to/` with the actual location where you cloned the repository. Restart Claude Desktop. Then type: *"Call the init tool"* — and you are ready to begin.

## What ships with the tool

**Methodology suite** (`methodology/`). This is the intellectual core of the project. Phase-specific documents for all six RTA phases articulate how each analytical task works when AI participates in the process — what risks emerge, what questions the researcher should ask, and where human interpretive capacity is most essential. The methodology is grounded in Braun & Clarke (2006, 2022) and draws on recent literature addressing AI's role in qualitative research (Brailas, 2025; Ozuem et al., 2025; Al-Fattal & Singh, 2025). Three foundational principles — the "proving the obvious" problem, double reflexivity, and AI as heuristic partner — run through every phase document. These are not background reading; they load automatically at the start of each session and shape how Claude engages with your data.

**Epistemological foundations** (`methodology/epistemology/`). Four documents addressing constructionist epistemology, theoretical orientation, inductive/deductive reasoning, and semantic/latent coding. Each examines how AI mediation affects that analytical dimension — where AI is competent, where it fails, and what the researcher must supply.

**Example coding protocols** (`protocols/`). Project-specific coding conventions — code formatting, research question mapping, segment structure. The included protocols are from an educational research project and serve as concrete examples. For your own research, you would write a coding protocol that defines your research questions, code format conventions, and any project-specific rules. The [Research Workflow](docs/RESEARCH_WORKFLOW.md) guide explains how.

**Tool infrastructure** (`src/`). The file operations, progress tracking, and session management that make the methodology usable with large datasets. The tools are important but secondary — they exist to serve the analytical process, not to replace it.

## For developers

The tool is built as an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server — a standard interface for extending Claude Desktop with external tools. It separates three concerns:

- **Methodology** (`methodology/`) tells Claude *how to think* about analysis — epistemology, phase-specific guidance, analytical principles. These are stable across projects.
- **Protocols** (`protocols/`) tell Claude *how to format* that thinking — code syntax, research question labels, language conventions. These vary by project.
- **Tools** (`src/`) handle file operations — reading chunks, writing codes, tracking progress, managing segments. These are methodology-agnostic.

This separation means the infrastructure can support different qualitative methodologies, research designs, and languages. The included methodology is for Braun & Clarke's RTA, but the tools do not depend on it.

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) — Installation and first session
- [Research Workflow](docs/RESEARCH_WORKFLOW.md) — How to conduct your analysis with this tool
- [API Reference](docs/API.md) — Complete tool specifications
- [Roadmap](docs/ROADMAP.md) — Development plans
- [Changelog](CHANGELOG.md) — Version history

## Contributing

Feedback, bug reports, and contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

CC BY-NC-SA 4.0 — free for academic and research use. See [LICENSE](LICENSE).

Copyright © 2025–2026 Niklas Karlsson
