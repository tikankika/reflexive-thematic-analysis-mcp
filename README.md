# Reflexive Thematic Analysis — MCP Server

Structured AI-augmented qualitative coding for Braun & Clarke's Reflexive Thematic Analysis. You read the data. AI proposes codes. You decide.

---

## The problem this solves

Qualitative researchers working with AI assistants like Claude face a practical tension. Large interview and focus group transcripts exceed the AI's processing window, so either the data must be truncated or the analysis loses coherence. There is no systematic way to work through a full dataset, no persistent tracking of progress across sessions, and no built-in safeguard for the researcher's interpretive authority.

The result is ad hoc analysis — productive in short bursts, but difficult to sustain across the dozens of hours that rigorous qualitative coding demands.

## What this tool provides

This is an [MCP server](https://modelcontextprotocol.io/) that connects to Claude Desktop and structures the coding process. It handles the infrastructure — chunking large transcripts, tracking progress, writing codes to files, managing segment boundaries — so that the conversation between researcher and AI can focus on interpretation.

The tool ships with a complete methodology suite grounded in Braun & Clarke's six-phase RTA framework (2006, 2022), adapted for AI-augmented analysis with attention to the epistemological challenges that AI mediation introduces. The methodology loads automatically at each phase, so Claude operates within an explicit analytical framework rather than generating generic responses.

Two phases are currently supported: **Phase 2a** (initial coding) and **Phase 2b** (critical review of that coding). Phases 3–6 are planned.

## What a coding session looks like

You work in Claude Desktop. The conversation is natural language — you talk to Claude as you would to a research assistant who knows your methodology.

**Phase 2a — Initial coding.** Claude presents ~80 lines of transcript text. You read it together. Claude proposes codes — semantic and latent, mapped to your research questions. You evaluate each proposal: accept, modify, reject, or add codes Claude missed. When you are satisfied, the codes are written to your transcript file with permanent line references. Claude presents the next chunk. This continues until the transcript is fully coded.

**Phase 2b — Critical review.** Claude presents each coded segment one at a time. You review the codes with fresh eyes, write a reflexive note capturing your analytical observations, and revise codes where your understanding has deepened. You can split segments that contain multiple meaning units or merge segments that belong together. Every revision is logged.

Throughout both phases, Claude follows the project's methodology documents and coding protocol. It proposes — you decide. This is not automated coding; it is a structured dialogue where the researcher retains full interpretive authority.

## What you need

- **Claude Desktop** — free or Pro ([download](https://claude.ai/download))
- **Node.js 18+** — for running the MCP server ([download](https://nodejs.org/))
- **Your transcripts** in markdown format (`.md`)
- **Your methodological knowledge** — familiarity with RTA or a comparable qualitative approach

No programming experience is required beyond the initial 10-minute setup.

## Setup

Install and configure in three steps:

```bash
git clone https://github.com/tikankika/reflexive-thematic-analysis-mcp.git
cd reflexive-thematic-analysis-mcp
npm install
npm run build
```

Add the server to your Claude Desktop configuration file:

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

Restart Claude Desktop. Then type: *"Call the init tool"* — and you are ready to begin.

For detailed installation steps, see [Getting Started](docs/GETTING_STARTED.md).

## What ships with the tool

**Methodology suite** (`methodology/`). Phase-specific guidance for all six RTA phases, grounded in Braun & Clarke (2006, 2022) and recent literature on AI-augmented qualitative research (Brailas, 2025; Ozuem et al., 2025). These documents load automatically when you begin each phase — you review them with Claude before coding starts.

**Epistemological foundations** (`methodology/epistemology/`). Four documents addressing constructionist epistemology, theoretical orientation, inductive/deductive reasoning, and semantic/latent coding — each written with specific attention to how AI mediation affects these analytical dimensions.

**Coding protocols** (`protocols/`). Project-specific coding conventions — code formatting, research question mapping, segment structure. The included protocols are examples from an educational research project; you would create your own for your research.

## Architecture

The tool separates three concerns:

- **Methodology** tells Claude *how to think* about analysis — epistemology, phase-specific guidance, analytical principles. These are stable across projects.
- **Protocols** tell Claude *how to format* that thinking — code syntax, research question labels, language conventions. These vary by project.
- **Tools** handle file operations — reading chunks, writing codes, tracking progress, managing segments. These are methodology-agnostic infrastructure.

This separation means the tool can support different qualitative methodologies, different research designs, and different languages. The included methodology is for Braun & Clarke's RTA, but the infrastructure does not depend on it.

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) — Installation and first session
- [User Guide](docs/USER_GUIDE.md) — Step-by-step workflow
- [API Reference](docs/API.md) — Complete tool specifications
- [Roadmap](docs/ROADMAP.md) — Development plans
- [Changelog](CHANGELOG.md) — Version history

## Contributing

Feedback, bug reports, and contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

CC BY-NC-SA 4.0 — free for academic and research use. See [LICENSE](LICENSE).

Copyright © 2025–2026 Niklas Karlsson
