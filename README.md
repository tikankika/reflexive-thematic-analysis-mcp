# MPC_RTA - Phase 1 Coding Server

MCP (Model Context Protocol) Server for AI-Augmented Reflexive Thematic Analysis (RTA).

**Version:** 0.2.0
**Status:** Private Development

## Features

### Phase 1: Coding (Current - v0.2.0)
- 📖 Chunk-based reading for large transcripts (60-100 lines per chunk)
- 🔍 Segment-based coding for semantic meaning units (variable size)
- 🔧 Multi-segment API for granular qualitative coding
- 📊 STATUS tracking via YAML frontmatter
- 🔄 Backwards compatible with v0.1.0
- 📖 Complete documentation in `/docs`

### Phase 2: Reflexive Analysis (Planned - v0.3.0)
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
- [User Guide](./docs/USER_GUIDE.md) - Step-by-step workflow
- [API Reference](./docs/API.md) - Tool specifications
- [Design Docs](./docs/design/) - Architecture decisions
- [Roadmap](./docs/ROADMAP.md) - Future plans

## Installation
```bash
npm install
npm run build
```

See [docs/README.md](./docs/README.md) for full setup instructions.

## License
MIT - Niklas Karlsson
