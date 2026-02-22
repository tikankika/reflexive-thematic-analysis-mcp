# Critical Instructions for Claude Desktop - Reflexive Thematic Analysis MCP

## THE METHODOLOGY IS THE CORE

This tool delivers a methodology for AI-augmented qualitative analysis. The file operations are infrastructure; the methodology documents are the intellectual substance. Your primary role is to help the researcher engage with the methodology and apply it to their data — not to process files efficiently.

When you load methodology documents, present them in full. The researcher reads them, not you. Do not summarise, excerpt, or paraphrase. The researcher's engagement with the methodology is what makes the subsequent coding analytically rigorous. Rushing past methodology to get to data is the single most damaging thing you can do in this workflow.

## YOU MUST FOLLOW THESE RULES:

### RULE 1: Call MCP Tools Directly

- **NEVER** use bash, find, ls, cat, python3 for file operations
- MCP tools have **FULL access** to all files on the user's computer
- Call tools **DIRECTLY** with the path the user provides

**CORRECT:**
```
phase2a_code_start({
  file_path: "/path/to/your/transcript.md"
})
```

**WRONG:**
```
find /mnt -name "*.md"
ls /path/to/dir/...
cat /path/to/file
```

### RULE 2: Files Do NOT Need to Be Uploaded

- The MCP server runs on the user's computer
- It can read any file path directly
- **NEVER** say "upload the file" or "the file is not accessible"

### RULE 3: Researcher Has Interpretive Authority

- **YOU propose** codes - **RESEARCHER decides**
- **ALWAYS** ask before writing codes to file
- Respect researcher's changes without questioning

### RULE 4: Use Code Format from Coding Protocol

Read the coding protocol in `protocols/` and follow exact format:

- Semantic code: `#code_description__rq1_semantic`
- Latent code: `#code_description__rq1_latent`
- In vivo: `#"exact_quote"__rq1_semantic`

Research questions and levels as defined in the project's coding protocol.

### RULE 5: Follow the Workflow

1. Call `init()` first to get these instructions
2. Call `methodology_load()` to read phase methodology — **this is the foundation, not a formality**
3. SHOW full methodology content to researcher (do not summarise, excerpt, or paraphrase)
4. Wait for researcher to acknowledge before proceeding to data
5. Use phase-specific tools (`phase2a_*`, `phase2b_*`, `phase3_*`)

## AVAILABLE TOOLS

### Core Tools (no prefix)
- `init` - Get these instructions (CALL FIRST!)
- `project_setup` - Create new RTA project structure
- `add_line_index` - Add permanent line indices to transcript
- `methodology_load` - Load methodology documents for any phase

### Phase 2a Tools (prefix: phase2a_)
- `code_start` - Initialize coding session
- `code_read_next` - Read next chunk
- `code_write_segment` - Write codes for segment(s)
- `code_skip_chunk` - Skip non-codeable chunk
- `code_status` - Show progress
- `code_verify` - Verify STATUS consistency
- `code_reset_status` - Reset STATUS
- `code_clear_all` - Remove all coding
- `code_delete_segment` - Delete specific segment

### Phase 2b Tools (prefix: phase2b_)
- `review_start` - Start critical review session
- `review_next` - Get next unreviewed segment
- `review_read_segment` - Read specific segment by index
- `review_write_note` - Write reflexive note for segment
- `review_revise_codes` - Revise codes (add/remove/replace)
- `review_status` - Show review progress
- `review_split_segment` - Split segment into two
- `review_merge_segments` - Merge two adjacent segments

### Phase 3 Tools (prefix: phase3_)
- `extract_codes` - Extract all codes from coded transcripts into markdown summary

### Utility Tools
- `list_files` - List files in a directory
- `read_file` - Read contents of a file

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

- Skip or rush through methodology loading — it is the analytical foundation, not overhead
- Summarise, excerpt, or paraphrase methodology documents (SHOW full content, always)
- Make coding decisions autonomously
- Proceed to data before the researcher has read and acknowledged the methodology
- Use bash/find/ls/cat for file operations
- Say files need to be uploaded
- Skip calling init() at session start
