# RFC-006: Rename Project to qualitative-analysis-rta

**Status:** APPROVED  
**Created:** 2026-01-11  
**Author:** Niklas Karlsson  

---

## 1. Summary

Byt namn på projektet från `MPC_RTA` / `phase1-coding-server` till `qualitative-analysis-rta`.

## 2. Motivation

- Nuvarande namn `phase1-coding-server` är begränsande och felaktigt (vi är i Phase 2)
- `MPC_RTA` är internt och otydligt
- Nytt namn reflekterar projektets syfte: Qualitative Analysis med Reflexive Thematic Analysis

## 3. New Names

| Kontext | Gammalt | Nytt |
|---------|---------|------|
| Mapp | `MPC_RTA` | `qualitative-analysis-rta` |
| Package (npm) | `phase1-coding-server` | `mcp-qualitative-analysis-rta` |
| Server name | `phase1-coding-server` | `qualitative-analysis-rta-server` |

## 4. Files to Update

### 4.1 package.json

```json
{
  "name": "mcp-qualitative-analysis-rta",
  "description": "MCP server for AI-augmented Reflexive Thematic Analysis (Braun & Clarke)",
  ...
}
```

### 4.2 src/server.ts

Find and replace server name references:
- `phase1-coding-server` → `qualitative-analysis-rta-server`

### 4.3 README.md

Update title and description:
```markdown
# Qualitative Analysis RTA - MCP Server

MCP server for AI-augmented Reflexive Thematic Analysis (Braun & Clarke).
```

### 4.4 ROADMAP.md

Update title:
```markdown
# Qualitative Analysis RTA - Development Roadmap (Braun & Clarke RTA)
```

Replace all occurrences of:
- `MPC_RTA` → `qualitative-analysis-rta`
- `Phase 1 Coding MCP Server` → `Qualitative Analysis RTA`

### 4.5 RFC-003-methodology-separation-architecture.md

Replace all occurrences of:
- `MPC_RTA` → `qualitative-analysis-rta`
- `MPC_RTA/` → `qualitative-analysis-rta/`

### 4.6 RFC-005-implementation-plan-methodology-separation.md

Replace all occurrences of:
- `MPC_RTA` → `qualitative-analysis-rta`
- `MPC_RTA/` → `qualitative-analysis-rta/`

### 4.7 Other files to check

- `CHANGELOG.md`
- `VISION.md`
- Any other documentation referencing the old name

## 5. Files to Delete

```bash
rm docs/rfcs/RFC-003-critical-review.md
```

## 6. Implementation

Run these replacements:

```bash
# In all markdown files
find . -name "*.md" -exec sed -i '' 's/MPC_RTA/qualitative-analysis-rta/g' {} \;
find . -name "*.md" -exec sed -i '' 's/phase1-coding-server/qualitative-analysis-rta-server/g' {} \;

# Update package.json manually
# Update server.ts manually
```

## 7. Verification

After renaming:
1. `npm run build` - Verify TypeScript compiles
2. Check that MCP server starts with correct name
3. Verify Claude Desktop config uses new server name

---

**Decision:** APPROVED  
**Next Action:** Execute renaming  
