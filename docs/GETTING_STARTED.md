# Getting Started

Get from zero to your first coded segment in ~10 minutes.

## Prerequisites

- **Node.js 18+** ([download](https://nodejs.org/))
- **Claude Desktop** ([download](https://claude.ai/download))
- A transcript file in `.md` format

## 1. Install

```bash
git clone https://github.com/tikankika/MPC_RTA.git
cd MPC_RTA
npm install
npm run build
```

Verify: `ls dist/server.js` should exist.

## 2. Configure Claude Desktop

Edit your Claude Desktop config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add this MCP server entry:

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

Replace `/absolute/path/to/MPC_RTA` with the actual path where you cloned the repo.

## 3. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

## 4. Start Your First Session

In Claude Desktop, type:

> "Call the init tool"

Claude will receive instructions on how to use the RTA tools. Then:

> "Set up a new project for my transcript at /path/to/my_transcript.md"

This creates a project structure with methodology files and indexes your transcript.

## 5. Start Coding (Phase 2a)

> "Start coding the transcript"

Claude will:
1. Load the methodology for you to review
2. Present the first chunk of text (~80 lines)
3. Propose codes based on the content
4. **Ask for your approval** before writing anything

You decide which codes to keep, modify, or reject. The researcher always has interpretive authority.

## 6. Review Your Coding (Phase 2b)

After all segments are coded:

> "Start a critical review of the coding"

This walks through each coded segment for you to:
- Check segment boundaries
- Verify code accuracy and sufficiency
- Write reflexive notes
- Revise codes where needed

## What's Next?

- [User Guide](USER_GUIDE.md) — Detailed workflow and all tool options
- [API Reference](API.md) — Full tool specifications
- [Methodology](../methodology/) — RTA methodology documents

## Troubleshooting

**Claude doesn't list the MCP tools:**
- Verify the path in `claude_desktop_config.json` is absolute and correct
- Restart Claude Desktop after config changes
- Check that `dist/server.js` exists (run `npm run build`)

**"init not called" errors:**
- Always start a session by asking Claude to call `init`

**Coding seems stuck:**
- Ask Claude to call `code_status` to check progress
- Use `code_verify(fix=true)` to fix STATUS inconsistencies
