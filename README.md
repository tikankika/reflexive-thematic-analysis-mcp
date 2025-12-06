# MPC_RTA - Phase 1 Coding Server

MCP (Model Context Protocol) Server for AI-Augmented Reflexive Thematic Analysis (RTA).

**Version:** 0.2.0
**Status:** Private Development

## Features
- 📖 Chunk-based reading for large transcripts (60-100 lines per chunk)
- 🔍 Segment-based coding for semantic meaning units (variable size)
- 🔧 Multi-segment API for granular qualitative coding
- 📊 STATUS tracking via YAML frontmatter
- 🔄 Backwards compatible with v0.1.0
- 📖 Complete documentation in `/docs`

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
