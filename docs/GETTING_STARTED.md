# Getting Started

From zero to your first coded segment in approximately 10 minutes.

---

## What you need

- **Claude Desktop** ([download](https://claude.ai/download)) — the application this tool extends
- **Node.js 18+** ([download](https://nodejs.org/)) — the runtime environment that runs the tool
- A transcript file in `.md` (markdown) format

If you are unsure whether Node.js is installed, open a terminal and type `node --version`. If you see a version number (18 or higher), you are ready.

---

## 1. Install the tool

Open a terminal and run:

```bash
git clone https://github.com/tikankika/reflexive-thematic-analysis-mcp.git
cd reflexive-thematic-analysis-mcp
npm install
npm run build
```

To verify the build succeeded, check that the file `dist/server.js` exists:

```bash
ls dist/server.js
```

---

## 2. Connect to Claude Desktop

Claude Desktop needs to know where to find the tool. Open the configuration file in a text editor:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

If the file does not exist, create it. Add the following (or add the `reflexive-thematic-analysis-mcp` entry to an existing `mcpServers` object):

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

Replace `/absolute/path/to/reflexive-thematic-analysis-mcp` with the actual location on your computer. For example, if you cloned the repository to your home directory on macOS, the path would be `/Users/yourname/reflexive-thematic-analysis-mcp/dist/server.js`.

Save the file and restart Claude Desktop (close it fully and reopen).

---

## 3. Verify the connection

In Claude Desktop, type:

> *"Call the init tool"*

If the connection is working, Claude will respond with a list of available tools and instructions for using them. If you see an error or Claude does not recognise the request, see Troubleshooting below.

---

## 4. Try it out

With the tool connected, you can test the full workflow. You will need a transcript file in markdown format — even a short test file will do.

Ask Claude to set up a project:

> *"Set up a new project called test_project for my transcript at /path/to/my_transcript.md"*

Claude creates a project structure and indexes your transcript. Then start coding:

> *"Start coding the transcript"*

Claude will load the methodology for you to read, then present the first chunk of text (approximately 80 lines). It proposes codes based on the content and waits for your decision. You accept, modify, or reject each proposal.

This brief test confirms everything works. For a full account of the analytical process — preparation, coding, review, and what you get at the end — see the [Research Workflow](RESEARCH_WORKFLOW.md) guide.

---

## Troubleshooting

**Claude does not recognise the tool or shows no MCP tools:**
- Check that the path in `claude_desktop_config.json` is absolute (starts with `/` on macOS/Linux or `C:\` on Windows), not relative
- Ensure `dist/server.js` exists — if not, run `npm run build` again
- Restart Claude Desktop fully (not just close the window — quit the application)
- On macOS, check Activity Monitor to confirm Claude Desktop is not still running in the background

**"init not called" errors:**
- Every Claude Desktop session starts fresh. Begin each session by asking Claude to call `init` before doing anything else

**Progress seems wrong or coding is stuck:**
- Ask Claude: *"Verify and fix the STATUS for my transcript"*
- This checks the actual file content against the progress tracking and corrects any inconsistencies

**Build fails during installation:**
- Ensure Node.js is version 18 or higher: `node --version`
- Delete `node_modules/` and try again: `rm -rf node_modules && npm install && npm run build`

---

## Next steps

- [Research Workflow](RESEARCH_WORKFLOW.md) — how to conduct your analysis with this tool
- [API Reference](API.md) — complete tool specifications
- [Methodology](../methodology/) — the RTA methodology documents that load during sessions
