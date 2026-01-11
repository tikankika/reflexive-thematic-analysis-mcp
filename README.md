# Qualitative Analysis RTA - MCP Server

MCP server for AI-augmented Reflexive Thematic Analysis (Braun & Clarke).

**Version:** 0.3.0
**Status:** Private Development

## Features

### Current (v0.2.0) - Braun & Clarke Phase 2: Initial Coding
- 📖 Chunk-based reading for large transcripts (60-100 lines per chunk)
- 🔍 Segment-based coding for semantic meaning units (variable size)
- 🔧 Multi-segment API for granular qualitative coding
- 📊 STATUS tracking via YAML frontmatter
- 🔄 Backwards compatible with v0.1.0
- 📖 Complete documentation in `/docs`

### Planned (v0.3.0) - Phase 2b: Critical Review of Semi-Automated Coding
- 🔁 Segment-by-segment reflexive note-taking
- ✏️ Code revision during reflexive review (add/remove/replace)
- 📈 Progress tracking with revision statistics
- 💾 Session persistence across Claude Desktop restarts
- 📝 Revision history for methodological transparency
- 🎯 Addresses Claude Desktop data volume constraints
- 📚 Follows iterative RTA methodology (Braun & Clarke)

## Terminology
- **CHUNK**: Technical reading unit (60-100 lines) used to process large files
- **SEGMENT**: Semantic coding unit (variable size) marked with `/segment` markers

## Documentation
- [Vision](./VISION.md) - Project purpose and goals
- [Roadmap](./docs/ROADMAP.md) - Development timeline and planned features
- [User Guide](./docs/USER_GUIDE.md) - Step-by-step workflow
- [API Reference](./docs/API.md) - Tool specifications
- [Design Docs](./docs/design/) - Architecture decisions
- [RFCs](./docs/rfcs/) - Request for Comments for major features

## Installation
```bash
npm install
npm run build
```

See [docs/README.md](./docs/README.md) for full setup instructions.

## License
MIT - Niklas Karlsson
