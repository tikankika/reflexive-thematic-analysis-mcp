# MPC_RTA Vision

## Purpose

Provide a technical file handling infrastructure (MCP server) that enables researchers to conduct systematic qualitative analysis in Claude Desktop without memory constraints.

## What This Server Is

**A file operations toolkit** that:
- Reads large files in manageable chunks
- Writes structured data to files
- Tracks progress via file-based STATUS
- Maintains file integrity during multi-session work

**Technical role**: Enable Claude Desktop to work with large transcript files (1000+ lines) by breaking them into processable segments.

## What This Server Is NOT

**This server does NOT:**
- Contain any coding methodology or analysis logic
- Make analytical decisions or interpretations
- Provide coding rules or guidelines
- Automate qualitative analysis

**Separation of concerns:**
- **Methodology** → Lives in researcher's manual uploaded to Claude Desktop
- **Analysis** → Performed by Claude Desktop based on manual
- **File operations** → Handled by this MCP server

## Target Users

- Researchers using Claude Desktop for qualitative analysis
- Anyone working with large text files that exceed Claude Desktop's data volume limits
- Researchers needing persistent progress tracking across sessions
- Solo researchers working with structured transcript data

## Problem Statement

### Technical Challenge

**Claude Desktop data volume constraint:**
- Cannot load entire coded transcript (1000-1500 lines) in one request
- Attempting to load large files causes context overflow or errors
- No native chunking mechanism for systematic file processing

**No persistent progress tracking:**
- Manual segment extraction is error-prone
- Difficult to resume work after Claude Desktop restart
- No reliable way to track which parts of file are processed

**File writing complexity:**
- Large files need careful insertion of codes and markers
- Manual file editing risks corrupting structure
- No validation of segment boundaries or code placement

### Solution

**MPC_RTA provides technical infrastructure:**
- Chunk-based reading (60-100 lines per chunk)
- Segment-based writing (variable size semantic units)
- File-based STATUS tracking (persistent across sessions)
- Automated segment marker placement
- Line index system for permanent reference points

## Success Criteria

### Technical Performance

**Phase 1 (Coding Infrastructure) - v0.2.x**
- [x] Handle files with 1000+ lines without memory issues
- [x] Read/write operations complete in <2 seconds
- [x] STATUS tracking persists across Claude Desktop restarts
- [x] Multi-segment API for granular file operations
- [ ] Process 10+ files without errors or corruption
- [ ] Recover gracefully from interrupted operations

**Phase 2 (Reflexive Analysis Infrastructure) - v0.3.x**
- [ ] Present one segment at a time from coded files
- [ ] Support code revision (add/remove/replace operations)
- [ ] Track revision history in structured format
- [ ] Enable session persistence for segment-by-segment review
- [ ] Complete 5+ file analyses without data loss

**Phase 3 (Data Export Infrastructure) - v0.4.x**
- [ ] Extract codes and segments to structured formats (JSON, CSV)
- [ ] Support code consolidation operations (rename, merge)
- [ ] Enable cross-file data aggregation

**Production Release - v1.0**
- [ ] 100+ files processed successfully
- [ ] Complete API documentation
- [ ] Error recovery mechanisms tested
- [ ] Multi-platform support (macOS, Linux, Windows)
- [ ] No breaking changes to file format or API

### Quality Metrics

- **Reliability**: Zero data loss or file corruption
- **Performance**: <2s response time for all operations
- **Compatibility**: Works with any transcript format (timestamped, speaker-labeled, plain text)
- **Transparency**: All operations logged and traceable
- **Recovery**: Can detect and fix STATUS corruption automatically

## Not Goals

**Methodology-specific features:**
- ❌ Coding rules or guidelines (researcher provides via manual)
- ❌ Analysis logic or interpretation (Claude Desktop performs)
- ❌ Methodology validation (RTA, GT, IPA - researcher decides)
- ❌ Quality criteria enforcement (researcher controls)

**Automated analysis:**
- ❌ Automatic code generation (researcher codes)
- ❌ Automatic theme identification (researcher identifies)
- ❌ AI-driven pattern detection (researcher interprets)

**Out of scope:**
- ❌ Audio/video processing (text transcripts only)
- ❌ Real-time coding during interviews (batch processing only)
- ❌ Team collaboration features (solo researcher focus in v1.0)
- ❌ Web interface or cloud hosting (local CLI tool only)

## Core Philosophy

**File handler, not analysis tool.**

This server provides **technical infrastructure** only:
- Read operations (chunk, segment)
- Write operations (codes, markers, notes)
- STATUS management (progress tracking)
- File integrity (validation, recovery)

**Researcher authority is paramount:**
- Researcher uploads methodology manual to Claude Desktop
- Researcher reviews and approves all codes
- Researcher makes all analytical decisions
- Server only executes file operations

**Methodology-agnostic design:**
- Works with any qualitative methodology (RTA, GT, IPA, etc.)
- Works with any transcript format
- Works with any language (Swedish in-vivo codes tested)
- No built-in analytical assumptions

## Timeline

- **v0.2.0** (December 2025) - Phase 1 Coding Infrastructure - ✅ COMPLETED
- **v0.2.1** (December 2025) - Error Recovery Tools - ✅ COMPLETED
- **v0.2.2** (January 2026) - Coding Log & Safety - 🚧 PLANNED
- **v0.3.0** (January-February 2026) - Phase 2 Reflexive Analysis Infrastructure - 🎯 NEXT
- **v0.4.0** (March 2026) - Phase 3 Data Export Infrastructure
- **v1.0.0** (June 2026) - Production Release

See [docs/ROADMAP.md](./docs/ROADMAP.md) for detailed feature planning.

## Impact

By providing reliable technical infrastructure for large file processing in Claude Desktop, this server enables:

**For researchers:**
- Work with larger datasets without memory constraints
- Maintain consistent progress tracking across sessions
- Reduce risk of data loss or file corruption
- Focus on analysis instead of file management

**For qualitative research:**
- Faster iteration cycles (reduced technical overhead)
- Better transparency (all operations logged)
- Increased reliability (automated integrity checks)
- Methodology-agnostic tools (works with any approach)

**Technical contribution:**
- Demonstrates MCP server for academic research workflows
- Provides reference implementation for file chunking patterns
- Shows how to integrate Claude Desktop with complex file operations

## Use Cases

**Valid use cases (technical support):**
✅ "Process 1500-line transcript in 80-line chunks"
✅ "Track which segments have been processed"
✅ "Write codes to specific line ranges"
✅ "Resume work after Claude Desktop restart"
✅ "Extract all segments containing specific codes"
✅ "Validate file integrity after manual edits"

**Invalid use cases (methodology, not infrastructure):**
❌ "Tell me how to code this data" → Upload coding manual to Claude Desktop
❌ "Is this code good?" → Claude Desktop evaluates based on your manual
❌ "Automatically generate themes" → Researcher identifies themes
❌ "What methodology should I use?" → Researcher decides methodology

## Success Story (Target)

**Researcher workflow with MPC_RTA:**

1. **Setup (5 minutes)**
   - Install MCP server
   - Upload coding manual to Claude Desktop
   - Start coding session

2. **Phase 1: Coding (faster, not automated)**
   - Server presents 80-line chunks from 1500-line transcript
   - Claude Desktop applies researcher's manual to propose codes
   - Researcher reviews and approves each segment
   - Server writes codes to file with proper formatting
   - STATUS tracks progress automatically

3. **Phase 2: Reflexive Analysis (manageable volume)**
   - Server presents one segment at a time (not entire 1500-line file)
   - Claude Desktop supports researcher's reflexive review
   - Researcher writes analytical notes per segment
   - Researcher revises codes as understanding deepens
   - Server tracks revision history for transparency

4. **Phase 3: Theme Generation (structured data)**
   - Server extracts all codes to structured JSON
   - Researcher clusters codes into themes (manual decision-making)
   - Researcher defines themes with supporting quotes
   - Server exports thematic structure for publication

**Key principle**: Server handles file operations. Researcher maintains full analytical control.

## Acknowledgments

- **Anthropic** - For Claude Desktop and MCP protocol
- **Qualitative research community** - For methodological inspiration
- **Early testers** - For feedback on real-world usage

## License

MIT License - Open source for academic and research use.

---

**Last updated:** December 10, 2025
