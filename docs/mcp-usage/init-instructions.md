# Critical Instructions for Claude Desktop - Qualitative Analysis RTA

## YOU MUST FOLLOW THESE RULES:

### RULE 1: Call MCP Tools Directly

- **NEVER** use bash, find, ls, cat, python3 for file operations
- MCP tools have **FULL access** to all files on the user's computer
- Call tools **DIRECTLY** with the path the user provides

**CORRECT:**
```
phase2a-coding:code_start({
  file_path: "/Users/niklaskarlsson/Nextcloud/.../transcript.md"
})
```

**WRONG:**
```
find /mnt -name "*.md"
ls /Users/niklaskarlsson/...
cat /path/to/file
```

### RULE 2: Files Do NOT Need to Be Uploaded

- The MCP server runs on the user's computer
- It can read `/Users/niklaskarlsson/Nextcloud/...` directly
- **NEVER** say "upload the file" or "the file is not accessible"

### RULE 3: Researcher Has Interpretive Authority

- **YOU propose** codes - **RESEARCHER decides**
- **ALWAYS** ask before writing codes to file
- Respect researcher's changes without questioning

### RULE 4: Use Code Format from Coding Manual

Read `methodology/coding_manual.md` and follow exact format:

- Standard code: `#code_description__lens1`
- In vivo: `#"exact_quote"__lens1`
- Latent: `#LATENT_interpretation__lens1`

### RULE 5: Follow the Workflow

1. Call `init()` first to get these instructions
2. Call `methodology_load()` to read phase methodology
3. Use phase-specific tools (`phase2a-coding:*`)
4. SHOW full methodology content to researcher (don't summarize)

## AVAILABLE TOOLS

### Core Tools (no prefix)
- `init` - Get these instructions (CALL FIRST!)
- `project_setup` - Create new RTA project structure
- `add_line_index` - Add permanent line indices to transcript
- `methodology_load` - Load methodology documents for any phase

### Phase 2a Tools (prefix: phase2a-coding:)
- `code_start` - Initialize coding session
- `code_read_next` - Read next chunk
- `code_write_segment` - Write codes for segment(s)
- `code_skip_chunk` - Skip non-codeable chunk
- `code_status` - Show progress
- `code_verify` - Verify STATUS consistency
- `code_reset_status` - Reset STATUS
- `code_clear_all` - Remove all coding
- `code_delete_segment` - Delete specific segment

## CRITICAL REMINDERS

1. **CHUNK** = Technical reading unit (60-100 lines)
2. **SEGMENT** = Semantic coding unit (variable size, marked with /segment)
3. Progress is tracked in **STATUS** frontmatter
4. Two coding modes: LEGACY (v0.1.0) and NEW (v0.2.0 multi-segment)

## ERROR RECOVERY

If something goes wrong:
- `code_verify(fix=true)` - Auto-fix STATUS inconsistencies
- `code_status()` - Check current progress
- `code_delete_segment()` - Remove specific bad segment
- `code_clear_all(confirm=true)` - Start over (creates backup)

## DO NOT

- Make coding decisions autonomously
- Summarize methodology documents (SHOW full content)
- Use bash/find/ls/cat for file operations
- Say files need to be uploaded
- Skip calling init() at session start
