# User Guide - Technical Workflow

**Phase 1 Coding MCP Server - Step-by-Step Technical Guide**

This guide explains **how to use the tools**. For coding methodology (RTA, Grounded Theory, etc.), refer to your own coding manual.

---

## Prerequisites

Before you start:

✅ Node.js 18+ installed
✅ Claude Desktop installed
✅ MCP server built (`npm run build`)
✅ Server configured in Claude Desktop
✅ Transcript file in `.md` format
✅ Your coding manual ready to upload

---

## Setup (One-Time)

### 1. Build the Server

```bash
cd /path/to/MPC_RTA
npm install
npm run build
```

Verify build success:
```bash
ls dist/server.js  # Should exist
```

### 2. Configure Claude Desktop

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "phase1-coding": {
      "command": "node",
      "args": [
        "/absolute/path/to/MPC_RTA/dist/server.js"
      ]
    }
  }
}
```

**Important:** Use absolute path, not relative.

### 3. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

### 4. Verify Server is Running

In Claude Desktop:
```
You: "What MCP tools do you have available?"

Claude should list:
- add_line_index
- code_start
- code_read_next
- code_write_segment
- code_skip_chunk
- code_status
```

---

## Workflow: Coding a Transcript

### Phase A: Preparation

**Step 1:** Prepare your coding manual
- Example: `KODNINGSMANUAL_AI_Augmented_RTA_Lins1.md`
- Contains YOUR coding rules, not ours

**Step 2:** Upload coding manual to Claude Desktop
- Drag and drop into chat, OR
- Use "Add file" button

**Step 3:** Prepare transcript file
- Must be `.md` format
- Can have timestamps (optional)
- Must NOT already have STATUS or /segment markers

---

### Phase B: Start Coding

**Step 1:** Initialize Session

```
You: "Start coding Fokusgrupp_AI_School_1.md"

Claude: [Uses code_start tool]
```

**What happens:**
1. Server creates STATUS frontmatter in your file
2. Server returns first 80 lines of transcript (raw text)
3. Claude reads the segment

**Claude will display:**
```
✅ STATUS created
Total lines: 1500
Estimated segments: 19

First segment (lines 1-80):
[raw transcript text shown here]
```

**Step 2:** Claude Analyzes (based on YOUR manual)

Claude reads:
- The segment text
- Your coding manual (already in context)

Claude does:
- Analysis according to YOUR rules
- Proposes codes

**Step 3:** Review Codes

Claude shows:
```
Proposed codes:
#student_uses_AI_detected_lins1
#"fulanvändning"_lins1
#ambivalence_AI_use_lins2

Accept? (say "accept", modify, or reject)
```

**Your options:**
- `"accept"` → Write codes as-is
- `"change code 2 to #better_name_lins1"` → Modify before writing
- `"reject"` → Skip this segment

**Step 4:** Write Codes

```
You: "accept"

Claude: [Uses code_write_segment tool]
```

**What happens:**
1. Server wraps segment in `/segment` markers
2. Server adds your codes
3. Server updates STATUS

**Claude confirms:**
```
✅ Segment 1 coded (3 codes written)
Progress: 1/19 (5%)
```

**Step 5:** Continue

```
You: "continue"

Claude: [Uses code_read_next tool]
```

**What happens:**
1. Server reads next 80 lines
2. Server returns raw text
3. Loop back to Step 2

---

### Phase C: Monitoring & Resuming

**Check Progress Anytime:**

```
You: "status"

Claude: [Uses code_status tool]
```

**Output:**
```
File: Fokusgrupp_AI_School_1.md
Coded segments: 5/19
Progress: 26%
Last coded line: 400
Next segment starts: 401
```

**Pause Session:**

Just close Claude Desktop. STATUS is saved in the file.

**Resume Session:**

1. Open Claude Desktop
2. Upload coding manual again (each session)
3. Say: `"Continue coding Fokusgrupp_AI_School_1.md"`

```
Claude: [Uses code_read_next tool]
→ Picks up where you left off
```

---

## File Format Details

### Before Coding

Your transcript:
```markdown
00:00:00.130 --> 00:00:21.380; [SPEAKER_05]: Ja, ja.
00:00:21.400 --> 00:00:21.861; [SPEAKER_05]: Ja, ja, jag hoppas det.
...
```

### After code_start

STATUS added:
```yaml
---
CODING-STATUS:
  File: transcript.md
  Total-lines: 1500
  Last-coded-line: 0
  Next-segment: 1-80
  Progress: 0/19
  Date: 2025-12-06
---
```

Then original transcript follows.

### After code_write_segment

Coded segments:
```markdown
/segment
00:00:00.130 --> 00:00:21.380; [SPEAKER_05]: Ja, ja.
00:00:21.400 --> 00:00:21.861; [SPEAKER_05]: Ja, ja, jag hoppas det.

#student_uses_AI_detected_lins1
#"fulanvändning"_lins1
/slut_segment
```

Uncoded parts remain as raw text.

---

## Common Tasks

### Task: Start New Transcript

1. Prepare transcript file (`.md`)
2. Upload coding manual to Claude
3. `"Start coding [filename]"`
4. Claude uses `code_start`
5. Begin cycle: analyze → accept → continue

### Task: Resume Interrupted Session

1. Upload coding manual (required each session)
2. `"Continue coding [filename]"`
3. Claude uses `code_read_next`
4. Continue from where STATUS says

### Task: Code Multiple Transcripts

**Sequential (one at a time):**
```
Finish transcript 1 → Start transcript 2 → etc.
```

**Parallel (not recommended):**
Don't code multiple files in same chat. Use separate Claude Desktop windows.

### Task: Change Segment Size

Default is 80 lines. To change:
```
You: "Start coding [filename] with 60 lines per segment"

Claude: [Uses code_start with config: {segment_size: 60}]
```

**Note:** Size is locked after `code_start`. Can't change mid-session.

### Task: View Progress

```
You: "Show progress for [filename]"

Claude: [Uses code_status]
→ "5/19 segments (26%) complete"
```

### Task: Skip Non-Codeable Chunks

**When to skip:**
- Chunk contains only facilitator talk (not to be coded per methodology)
- Meta-organizational content
- Technical setup or introductions

**Workflow:**

```
You: "Skip this chunk, it's only facilitator talk"

Claude: [Uses code_skip_chunk tool]
→ Chunk marked as processed (no codes)
→ Progress updates (e.g., 1/9 → 2/9)
→ Next chunk ready to read
```

**What happens:**
1. Server writes `/segment` marker around content
2. Server adds NO codes (empty)
3. Server updates STATUS
4. You can continue with `code_read_next`

**Alternative (manual):**
```
You: "Use code_skip_chunk on /path/to/transcript.md"

Claude: [Calls tool directly]
        ✅ Chunk 1 skipped (0 codes)
        Progress: 1/9 (11%)
```

**File result:**
```markdown
/segment
0001 [Facilitator content...]
0080 [End of chunk]

/slut_segment
```

Note: Empty segment (no codes between text and `/slut_segment`)

---

## Troubleshooting

### Problem: "File already has STATUS"

**Cause:** You ran `code_start` twice.

**Solution:**
- Use `code_read_next` to continue, OR
- Manually remove STATUS from file to restart

### Problem: "No STATUS frontmatter found"

**Cause:** Trying to use `code_read_next` or `code_write_segment` before `code_start`.

**Solution:**
Run `code_start` first.

### Problem: Codes not written to file

**Check:**
1. File permissions (can you edit it?)
2. File path correct?
3. Did Claude call `code_write_segment`? (Check tool calls)

### Problem: Segment contains wrong lines

**Cause:** STATUS out of sync (rare).

**Solution:**
1. Check STATUS in file (lines should be sequential)
2. Use `code_status` to verify
3. If broken, fix STATUS manually or restart

### Problem: Server not found in Claude Desktop

**Check:**
1. `dist/server.js` exists?
2. Config file has correct absolute path?
3. Claude Desktop restarted?
4. Check Claude Desktop logs (stderr output)

### Problem: Codes have wrong format

**Note:** Server doesn't validate code format. It writes whatever you provide.

**Your responsibility:**
- Codes start with `#`
- Format: `#description_suffix`
- In-vivo: `#"expression"_suffix`

### Problem: code_read_next returns same chunk repeatedly

**Cause:** Current chunk not yet coded or skipped.

**Behavior:**
`code_read_next` requires you to process the current chunk before moving forward.

**Solution:**
- Either code the chunk with `code_write_segment`, OR
- Skip the chunk with `code_skip_chunk` (if no codeable content)

**Example:**
```
You: "read next"
Claude: [Returns chunk 1 again because chunk 1 not processed]

You: "skip this chunk"
Claude: [Uses code_skip_chunk]

You: "read next"
Claude: [NOW returns chunk 2]
```

---

## Tips & Best Practices

### Tip 1: Keep Coding Manual Uploaded

Each Claude Desktop session is fresh. Upload your manual at start of each session.

### Tip 2: Use `code_status` Regularly

Before closing session:
```
You: "status"
→ Note which segment you're on
```

### Tip 3: Version Control

Use Git for your transcripts:
```bash
git add transcript.md
git commit -m "Coded 5 segments (26%)"
```

Allows undo if needed.

### Tip 4: Backup Before Starting

```bash
cp transcript.md transcript_backup.md
```

### Tip 5: Don't Mix Tools

Let Claude call the tools. Don't try to call them directly unless you know MCP protocol.

### Tip 6: Consistent Naming

Use clear file names:
```
Fokusgrupp_AI_School_1.md  ✅
transcript.md              ❌ (too generic)
```

### Tip 7: One Coding Manual Per Session

Don't switch manuals mid-transcript. Finish with one methodology, then switch.

---

## Advanced Workflow: Granular Coding (v0.2.0) ⭐

**Use Case:** Instead of coding fixed 80-line segments, you want Claude to identify specific meaningful units (quotes, exchanges, themes) and code them precisely.

**Benefits:**
- Precise line-level code associations for citation
- Multiple segments written in one operation
- Each segment has its own `/segment` block with specific codes

---

### When to Use Granular Coding

✅ **Use granular coding when:**
- You need to cite specific quotes in publications (with exact line numbers)
- You're coding thematic exchanges or dialogues
- Different parts of an 80-line segment need different codes
- You want precise associations between codes and text

❌ **Use standard coding (legacy mode) when:**
- You're doing initial exploratory coding
- Line precision isn't critical
- You prefer simple sequential workflow

---

### Granular Coding Workflow

#### Step 1: Preparation (Same as Standard)

```
You: "Upload my coding manual KODNINGSMANUAL_AI_Augmented_RTA_Lins1.md"
     "Start coding Fokusgrupp_AI_School_1.md"

Claude: [Initializes session, shows first content]
```

#### Step 2: Read and Identify Meaningful Units

```
You: "Read lines 1-200 and identify all direct quotes about AI.
     Code each quote as a separate segment."

Claude: [Analyzes text with coding manual in mind]

        I found 3 direct quotes about AI:

        1. Lines 30-34: Student discusses AI homework help
           Context: Student describes using ChatGPT for assignments
           Proposed codes: #AI_homework_help__lins1, #student_perspective__lins2

        2. Lines 78-82: Teacher expresses concern about learning
           Context: Teacher worried about assessment integrity
           Proposed codes: #teacher_concern_AI__lins1, #ethical_worries__lins2

        3. Lines 150-155: Parent discusses convenience vs. skills
           Context: Parent ambivalent about AI use
           Proposed codes: #parent_ambivalence__lins1, #convenience_vs_learning__lins2

        Accept these codes? I'll write all 3 segments in one operation.
```

#### Step 3: Review and Accept

```
You: "Accept"

Claude: [Uses code_write_segment with segments array]
        ✅ 3 segments coded (6 codes written)
        Progress: 3/19 (15%)

        File updated with granular segments. Continue?
```

#### Step 4: Continue Reading

```
You: "Continue reading lines 200-400, identify key exchanges about 'fulanvändning'"

Claude: [Identifies 2 exchanges, proposes codes, writes segments]
```

---

### Example: Granular vs. Standard Coding

#### Standard Coding (v0.1.0)

**Result:** All codes for lines 1-80 grouped together
```markdown
/segment
0001 [Various content...]
0080 [End of segment]

#kod1__lins1
#kod2__lins1
#kod3__lins2
#kod4__lins1
/slut_segment
```

**Problem:** Can't tell which codes apply to which specific lines.

#### Granular Coding (v0.2.0)

**Result:** Each meaningful unit gets its own segment
```markdown
/segment
0010 [Specific quote about X]
0012 [Quote continues...]

#kod1__lins1
#kod2__lins2
/slut_segment

[Uncoded text...]

/segment
0045 [Different quote about Y]
0048 [Quote ends]

#kod3__lins1
/slut_segment
```

**Benefit:** Clear association between codes and specific text ranges.

---

### Tips for Granular Coding

#### Tip 1: Use Line Indices

If you used `add_line_index` tool, Claude can reference exact lines by their permanent indices (0001, 0002, ...):

```
You: "Code lines 0234-0245 with #teacher_frustration__lins2"

Claude: [Writes single segment for exact range]
```

#### Tip 2: Identify Patterns First, Code Later

```
You: "Read lines 1-500 and list all instances of 'fulanvändning' with line numbers.
     Don't code yet."

Claude: [Lists all instances with line ranges]

You: "Code instances 1, 3, and 5 as separate segments with #fulanvändning__lins1"

Claude: [Codes only specified instances]
```

#### Tip 3: Mix Standard and Granular

You can use both modes in the same transcript:

```
You: "Code segment 1 normally (lines 1-80)"
Claude: [Uses legacy mode]

You: "Now read lines 81-160 and code specific quotes separately"
Claude: [Uses granular mode]

You: "Resume normal coding for segment 3"
Claude: [Back to legacy mode]
```

#### Tip 4: Verify Segments Don't Overlap

Claude will auto-validate, but if you manually specify ranges, ensure:
- Line ranges don't overlap: `[10-15]` and `[14-20]` → ❌ Overlap at 14-15
- Line ranges are sequential or have gaps: `[10-15]` then `[20-25]` → ✅ OK

---

### Technical Details

**Under the Hood:**
- Claude calls `code_write_segment` with `segments` array (not `codes` array)
- Each segment specifies `start_line`, `end_line`, `codes`
- MCP validates, sorts, and writes all segments in one operation
- STATUS tracks max coded line (not necessarily sequential)

**Example Tool Call:**
```json
{
  "tool": "code_write_segment",
  "file_path": "/path/to/transcript.md",
  "segments": [
    {
      "start_line": "0030",
      "end_line": "0034",
      "codes": ["#kod1__lins1", "#kod2__lins2"]
    },
    {
      "start_line": "0078",
      "end_line": "0082",
      "codes": ["#kod3__lins1"]
    }
  ]
}
```

---

## Advanced: Manual Tool Invocation

If you need direct control:

```
You: "Use code_start on /path/to/file.md with 60 lines per segment"

Claude: [Calls tool with exact parameters]
```

```
You: "Use code_write_segment with these codes: [list]"

Claude: [Writes specified codes using legacy mode]
```

```
You: "Use code_write_segment with segments:
     - lines 0030-0034 with codes X, Y
     - lines 0050-0055 with codes Z"

Claude: [Writes specified segments using new mode]
```

**When to use:**
- Debugging
- Unusual workflows
- Scripting/automation

---

## File Organization

Suggested structure:

```
project/
├── transcripts/
│   ├── School_1.md        # Your transcript
│   ├── School_2.md
│   └── School_3.md
├── coding_manuals/
│   ├── LINS1_manual.md    # Your coding rules
│   ├── LINS2_manual.md
│   └── LINS3_manual.md
└── backups/
    └── (git repository)
```

---

## Limitations

**What this server does NOT do:**
- ❌ Analyze your data
- ❌ Store coding rules
- ❌ Make coding decisions
- ❌ Validate code quality
- ❌ Generate themes (that's Phase 2)

**What YOU must provide:**
- ✅ Coding methodology (your manual)
- ✅ Code proposals (via Claude + manual)
- ✅ Quality control
- ✅ Final decisions

---

## Next Steps

**For API details:** See [API.md](./API.md)

**For installation:** See [README.md](./README.md)

**For future features:** See [ROADMAP.md](./ROADMAP.md)

---

## Example Session (Full)

```
[1. Preparation]
You: Upload "KODNINGSMANUAL_RTA_LINS1.md"
You: "Start coding Fokusgrupp_AI_School_1.md"

[2. First Segment]
Claude: ✅ STATUS created. First segment (80 lines) loaded.
        [Shows transcript text]

        Proposed codes:
        #student_uses_AI_lins1
        #"fulanvändning"_lins1

        Accept?

You: "accept"

Claude: ✅ Segment 1 coded. Progress: 1/19 (5%)

[3. Continue]
You: "continue"

Claude: [Next segment loaded]
        Proposed codes:
        #ambivalence_AI_use_lins2

        Accept?

You: "change to #teacher_ambivalence_lins2"

Claude: ✅ Segment 2 coded. Progress: 2/19 (10%)

[4. Check Progress]
You: "status"

Claude: 2/19 segments (10%) complete
        Last coded: line 160
        Next segment: 161-240

[5. Pause]
You: [Close Claude Desktop]

[Later...]

[6. Resume]
You: Upload "KODNINGSMANUAL_RTA_LINS1.md" again
You: "Continue coding Fokusgrupp_AI_School_1.md"

Claude: Resuming from segment 3 (lines 161-240)
        [Shows segment text]
        ...

[7. Complete]
After segment 19:

Claude: ✅ All segments coded!
        Final: 19/19 (100%)
```

---

**Version**: 0.1.0
**Last Updated**: 2025-12-06
