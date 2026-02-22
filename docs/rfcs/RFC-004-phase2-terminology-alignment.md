# RFC-004: Phase 2 Terminology Alignment

**Status:** Draft  
**Created:** 2026-01-11  
**Author:** Niklas Karlsson  

---

## Summary

Rename MCP tools from `phase1-coding:*` to `phase2-coding:*` to align with Braun & Clarke's Reflexive Thematic Analysis terminology.

## Motivation

### The Problem

Current MCP tool naming creates confusion:

| MCP Tool Name | What It Does | Braun & Clarke Phase |
|---------------|--------------|----------------------|
| `phase1-coding:code_start` | Initial coding | **Phase 2** |
| `phase1-coding:code_write_segment` | Write codes | **Phase 2** |

### Braun & Clarke RTA Phases

| Phase | Name | Description |
|-------|------|-------------|
| **Phase 1** | Familiarization | Reading, understanding data |
| **Phase 2** | Initial Coding | Generating codes from data |
| **Phase 3** | Generating Themes | Clustering codes into themes |
| **Phase 4** | Reviewing Themes | Testing themes against data |
| **Phase 5** | Defining & Naming | Refining themes |
| **Phase 6** | Producing Report | Writing |

**Conclusion:** Our MCP tools do Phase 2 work, but are named "phase1".

---

## Implementation Plan

### Files to Modify

#### ✅ Already Changed (2026-01-11)

| File | Changes Made |
|------|--------------|
| `src/server.ts` | Class name, server name, comments |
| `README.md` | Title, features section |
| `CHANGELOG.md` | Header, v0.3.0 section, new BREAKING entry |
| `docs/ROADMAP.md` | Title, terminologi-box, v0.3.0 section |

#### ❌ Still Need Changes

| File | What to Change |
|------|----------------|
| `docs/USER_GUIDE.md` | Tool name references |
| `docs/API.md` | Tool name references |
| `docs/README.md` | Any "Phase 1" references |
| `Claude Desktop config` | Server name prefix (CRITICAL) |

---

## Detailed Changes

### 1. docs/ROADMAP.md

**Search and replace:**

```
OLD: # Phase 1 Coding MCP Server - Development Roadmap
NEW: # Phase 2 Coding MCP Server - Development Roadmap (Braun & Clarke RTA)

OLD: Phase 1 Coding MCP Server
NEW: Phase 2 Coding MCP Server

OLD: phase1-coding:
NEW: phase2-coding:
```

**Note:** The terminologi-anmärkning at the top can be removed or updated to say "COMPLETED".

---

### 2. docs/USER_GUIDE.md

**Check for and replace:**
- Any `phase1-coding:` → `phase2-coding:`
- Any "Phase 1 Coding" → "Phase 2 Coding"

---

### 3. docs/API.md

**Check for and replace:**
- Any `phase1-coding:` → `phase2-coding:`
- Any "Phase 1" references in tool descriptions

---

### 4. docs/README.md

**Check for and replace:**
- Any `phase1-coding:` → `phase2-coding:`

---

### 5. Claude Desktop Config (CRITICAL)

**Location (macOS):**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Expected current config:**
```json
{
  "mcpServers": {
    "phase1-coding": {
      "command": "node",
      "args": ["/path/to/MPC_RTA/dist/server.js"]
    }
  }
}
```

**Change to:**
```json
{
  "mcpServers": {
    "phase2-coding": {
      "command": "node",
      "args": ["/path/to/MPC_RTA/dist/server.js"]
    }
  }
}
```

**⚠️ NOTE:** The key name `"phase1-coding"` or `"phase2-coding"` determines the tool prefix in Claude!

---

### 6. Rebuild and Restart

After all changes:

```bash
cd <PROJECT_ROOT>
npm run build
```

Then restart Claude Desktop completely.

---

## Verification Checklist

After implementation, verify:

- [ ] `npm run build` completes without errors
- [ ] Claude Desktop shows tools as `phase2-coding:*`
- [ ] `phase2-coding:code_status` works on a test file
- [ ] All documentation references Phase 2

---

## Rollback Plan

If issues occur:

1. Revert Claude Desktop config key back to `"phase1-coding"`
2. Restart Claude Desktop
3. Tools will work with old names

Code changes in repo don't affect functionality - only Claude Desktop config matters for tool naming.

---

## Related Documents

- [ROADMAP.md](../ROADMAP.md) - Contains terminologi-anmärkning about this change
- [Phase_2b_Critical_Coding_Review_DRAFT.md](../development_ideas/Phase_2b_Critical_Coding_Review_DRAFT.md) - Next phase after this rename

---

## Phase 2b Methodology Documentation (Pending)

This terminology alignment enables proper naming for the next methodological innovation:

**Phase 2b: Critical Coding Review**

| Old Name | New Name | Description |
|----------|----------|-------------|
| "Phase 1.5" | "Phase 2b" | Critical review of semi-automated coding |

### What Phase 2b Is

A researcher-driven critical review step between:
- **Phase 2a**: Semi-automated coding (AI-assisted)
- **Phase 3**: Generating themes

### Key Questions in Phase 2b

1. Is segment coherently bounded or should it split?
2. Are codes accurate and sufficient?
3. What codes should be added/removed/refined?
4. What analytical observations emerge (without premature thematization)?

### Pending Tasks

| Task | Status | Location |
|------|--------|----------|
| Conceptual draft | ✅ Done | `docs/development_ideas/Phase_2b_Critical_Coding_Review_DRAFT.md` |
| Braun & Clarke literature review | ⏳ Pending | - |
| Formal methodology guide | ⏳ Pending | `docs/methodology/phase2b_critical_review.md` (to create) |
| MCP tools for Phase 2b | ⏳ Planned v0.3.0+ | See ROADMAP.md |

### Why This Matters

Phase 2b solves the **AI-augmented RTA tension**:
- AI has processing capacity (can handle large datasets)
- Researcher retains interpretive authority
- Phase 2b is WHERE this authority is actively exercised

See: [Phase_2b_Critical_Coding_Review_DRAFT.md](../development_ideas/Phase_2b_Critical_Coding_Review_DRAFT.md) for full concept description.

---

## Timeline

| Step | Status |
|------|--------|
| Draft RFC | ✅ Done |
| Update src/server.ts | ✅ Done |
| Update README.md | ✅ Done |
| Update CHANGELOG.md | ✅ Done |
| Update ROADMAP.md | ✅ Done |
| Update USER_GUIDE.md | ⏳ Pending |
| Update API.md | ⏳ Pending |
| Update Claude Desktop config | ⏳ Pending (needs user action) |
| Rebuild | ⏳ Pending |
| Restart Claude Desktop | ⏳ Pending |
| Verify | ⏳ Pending |
| **Create Phase 2b methodology guide** | ⏳ Pending (separate task) |

---

*RFC-004 created 2026-01-11*
