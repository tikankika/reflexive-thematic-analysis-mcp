# Phase 1 Coding MCP Server

**Minimal File Handler for Segment-Based Qualitative Coding**

A lightweight MCP server for memory-efficient, segment-based coding of qualitative data transcripts. Handles file operations while Claude Desktop performs the analysis.

---

## Overview

This server provides **file handling tools** for qualitative coding workflows in Claude Desktop:

- **Segment reading**: Read transcripts 60-100 lines at a time
- **Code writing**: Write codes with proper segment markers
- **STATUS tracking**: File-based progress management
- **Stateless iterations**: No memory accumulation across segments

**What this server does:**
✅ Reads segments from transcript files
✅ Writes codes to files with proper formatting
✅ Tracks coding progress via STATUS frontmatter

**What this server does NOT do:**
❌ Analyze data (that's Claude Desktop's job)
❌ Store coding rules (read your manual into Claude Desktop)
❌ Make coding decisions (researcher authority)

---

## Separation of Concerns

### Your Coding Manual
📄 Upload to Claude Desktop as a normal file
Contains: methodology, coding rules, quality checks

### This MCP Server
🔧 Provides 4 simple file handling tools
Handles: segment reading, code writing, STATUS updates

### Claude Desktop
🧠 Reads manual + applies rules
Does: analysis, code proposals, quality checking

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Claude Desktop installed
- Transcript files in `.md` format
- Coding manual (e.g., RTA coding guide)

### Installation

```bash
# Navigate to project
cd MPC_RTA

# Install dependencies
npm install

# Build the server
npm run build
```

### Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "phase1-coding": {
      "command": "node",
      "args": [
        "/path/to/MPC_RTA/dist/server.js"
      ]
    }
  }
}
```

Restart Claude Desktop.

### First Coding Session

**Step 1:** Upload your coding manual to Claude Desktop

**Step 2:** Start coding

```
You: "I want to code Fokusgrupp_AI_School_1.md according to this manual"
     [Use code_start tool]

Claude: ✅ STATUS created. First segment (80 lines) loaded.

        Here are my code proposals based on your manual:
        #student_uses_AI_detected_lins1
        #"fulanvändning"_lins1

        Accept? (say "accept" or modify)

You: "accept"

Claude: [Uses code_write_segment tool]
        ✅ Segment 1 complete (1/18). Continue?

You: "continue"

Claude: [Uses code_read_next tool]
        [Repeat...]
```

---

## The 4 MCP Tools

### 1. `code_start`
Creates STATUS, returns first segment (raw text)

### 2. `code_read_next`
Reads next segment based on STATUS

### 3. `code_write_segment`
Writes codes with `/segment` markers

### 4. `code_status`
Shows progress

See [API.md](./API.md) for detailed tool specifications.

---

## Why This Approach?

### The Problem

Traditional AI-assisted coding in Claude Desktop:

1. **Memory overflow**: Long transcripts → context compression → lost detail
2. **No persistence**: Can't pause and resume reliably
3. **Manual tracking**: Researcher must remember coding position

### The Solution

**Phase 1 Coding Server** provides:

1. **Segment-based processing**: Only 60-100 lines in memory per iteration
2. **Manual in Claude context**: Upload coding manual once per session
3. **FILE-based STATUS**: Progress tracked in the transcript file itself
4. **Simple tools**: Just read/write operations, no complex logic

---

## File Format

### Transcript with STATUS

```yaml
---
CODING-STATUS:
File: transcript.md
Total-lines: 1500
Last-coded-line: 240
Next-segment: 241-320
Progress: 3/18
Date: 2025-12-05
---
```

### Coded Segment

```markdown
/segment
00:00:30.146 --> 00:00:55.105; [SPEAKER_02]: Original text preserved...
00:00:55.125 --> 00:00:55.265; [SPEAKER_02]: More text...

#code_description_suffix
#"in_vivo_expression"_suffix
/slut_segment
```

---

## Use Cases

**Designed for:** Qualitative coding workflows (RTA, Grounded Theory, IPA, etc.)

**Example project:**
- **Data**: Focus group transcripts (9 files × 1500 lines each)
- **Methodology**: Reflexive Thematic Analysis with 3 coding lenses
- **Challenge**: Memory-efficient coding without losing context
- **Solution**: Segment-by-segment coding with this MCP server

**Works with:**
- Any coding manual (RTA, GT, IPA, etc.)
- Any transcript format (focus groups, interviews, etc.)
- Any language (Swedish in-vivo codes tested)

---

## Documentation

- **[API.md](./API.md)** - Complete tool specifications
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Step-by-step workflow
- **[ROADMAP.md](./ROADMAP.md)** - Future development plans

---

## Technical Stack

- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Protocol**: Model Context Protocol (MCP)
- **Purpose**: Phase 1 Coding (segment + codes)

**Not included** (separate tools):
- Phase 2: Theme generation
- Phase 3: Thematic mapping

---

## Project Status

**Current Version**: v0.1.0 (MVP - Basic file handling)

---

## License

CC BY-NC-SA 4.0 — See [LICENSE](../LICENSE)

---

## Authors

Developed for AI-augmented qualitative research workflows.

---

## Contributing

This is a research tool under active development. Feedback and contributions welcome.

---

## Acknowledgments

- Anthropic for Claude Desktop and MCP protocol
- Qualitative researchers testing early versions
- Braun & Clarke for RTA methodology inspiration

---

**Next Steps**: Read [USER_GUIDE.md](./USER_GUIDE.md) to start your first coding session.
