# Qualitative Analysis RTA — MCP Server

MCP server for AI-augmented Reflexive Thematic Analysis (Braun & Clarke). Provides structured tools for qualitative coding where the researcher maintains full interpretive authority while AI assists with processing.

## What is this?

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that connects to Claude Desktop and provides tools for systematic qualitative analysis of interview/focus group transcripts. It follows Braun & Clarke's six-phase RTA methodology, currently supporting Phase 2a (initial coding) and Phase 2b (critical review).

## Quick Start

```bash
# Clone and build
git clone https://github.com/tikankika/MPC_RTA.git
cd MPC_RTA
npm install
npm run build
```

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "qualitative-analysis-rta": {
      "command": "node",
      "args": ["/absolute/path/to/MPC_RTA/dist/server.js"]
    }
  }
}
```

Then in Claude Desktop, call `init` to get started.

## Features

### Phase 2a — Initial Coding
- Chunk-based reading for large transcripts (60-100 lines per chunk)
- Segment-based coding for semantic meaning units (variable size)
- Multi-segment API for granular qualitative coding
- STATUS tracking via YAML frontmatter
- Error recovery tools (verify, reset, clear, delete)

### Phase 2b — Critical Review
- Segment-by-segment review of AI-assisted coding
- Reflexive note-taking per segment
- Code revision with full audit trail (add/remove/replace)
- Segment restructuring (split/merge) with note synchronization
- Progress tracking across sessions

### Core Tools
- Project setup with methodology loading
- Permanent line indexing for transcripts
- File browsing and reading

## Key Principle

**The researcher has interpretive authority.** AI proposes codes — the researcher decides. This is not automated coding; it is AI-augmented analysis where every code is subject to human judgment.

## Documentation

- [User Guide](docs/USER_GUIDE.md) — Step-by-step workflow
- [API Reference](docs/API.md) — Tool specifications
- [Vision](VISION.md) — Project purpose and goals
- [Roadmap](docs/ROADMAP.md) — Development timeline
- [Changelog](CHANGELOG.md) — Version history
- [Design Docs](docs/design/) — Architecture decisions
- [RFCs](docs/rfcs/) — Feature proposals

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

CC BY-NC-SA 4.0 — See [LICENSE](LICENSE)

Copyright (c) 2025-2026 Niklas Karlsson
