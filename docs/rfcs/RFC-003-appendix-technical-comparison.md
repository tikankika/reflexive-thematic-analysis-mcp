# Technical Comparison: assessment-mcp vs MPC_RTA

**Created:** 2026-01-09  
**Purpose:** Side-by-side comparison to guide MPC_RTA refactoring  

---

## 1. Directory Structure Comparison

### assessment-mcp ✅
```
assessment-mcp/
├── src/
│   ├── server.ts
│   ├── core/
│   │   ├── methodology_loader.ts    ← 🔑 NYCKEL
│   │   ├── assessment_parser.ts
│   │   ├── assessment_writer.ts
│   │   ├── status_manager.ts
│   │   └── ...
│   ├── tools/
│   │   ├── init.ts                  ← 🔑 KRITISK
│   │   ├── phase4a_questions.ts
│   │   ├── phase4b_rubric.ts
│   │   ├── phase6_start.ts
│   │   ├── phase6_methodology.ts
│   │   └── ...
│   └── types/
├── methodology/                      ← 🔑 TOPPNIVÅ
│   ├── bedomningsmetod_generell_v2.md
│   ├── instruktioner_ai_bedomning_v2.md
│   ├── phase4a_question_detection.md
│   ├── phase4b_rubric_validation.md
│   ├── phase4c_student_report.md
│   ├── phase4d_answer_boundaries.md
│   └── fallback-summary.md
└── docs/
```

### MPC_RTA ❌ (nuvarande)
```
MPC_RTA/
├── src/
│   ├── server.ts
│   ├── core/
│   │   ├── chunk_reader.ts
│   │   ├── segment_writer.ts
│   │   └── status_manager.ts
│   │   # SAKNAS: methodology_loader.ts
│   ├── tools/
│   │   ├── code_start.ts
│   │   ├── code_read_next.ts
│   │   ├── code_write_segment.ts
│   │   └── ...
│   │   # SAKNAS: init.ts
│   │   # SAKNAS: fas-specifika verktyg
│   └── types/
├── docs/
│   └── methodology/                  ← 🔴 FEL PLATS
│       ├── KODNINGSMANUAL_*.md
│       ├── Linser_fordjupat.md
│       ├── epistemology/
│       └── RTA_phases/
# SAKNAS: methodology/ på toppnivå
```

---

## 2. Component Comparison

| Component | assessment-mcp | MPC_RTA | Status |
|-----------|---------------|---------|--------|
| **MethodologyLoader** | ✅ `src/core/methodology_loader.ts` | ❌ Saknas | 🔴 Kritisk |
| **init tool** | ✅ `src/tools/init.ts` | ❌ Saknas | 🔴 Kritisk |
| **methodology/ directory** | ✅ Toppnivå | ❌ I docs/ | 🔴 Kritisk |
| **Fas-specifik laddning** | ✅ loadPhase4A(), loadPhase4B() | ❌ Ingen | 🔴 Kritisk |
| **Fallback-summary** | ✅ fallback-summary.md | ❌ Saknas | 🟡 Viktig |
| **LOAD/SAVE pattern** | ✅ Alla phase-tools | ❌ Ingen | 🟡 Viktig |
| **status_manager** | ✅ Finns | ✅ Finns | ✅ OK |
| **Tool registration** | ✅ server.ts | ✅ server.ts | ✅ OK |

---

## 3. Tool Pattern Comparison

### assessment-mcp: phase4a_questions

```typescript
// LOAD mode: Returnerar data + metodologi
async function loadExamAndMethodology(input): Promise<Phase4aLoadOutput> {
  const methodologyLoader = new MethodologyLoader();
  
  const examContent = await fs.readFile(input.exam_path, 'utf-8');
  const methodology = await methodologyLoader.loadPhase4A();  // 🔑
  
  return {
    mode: 'load',
    exam_content: examContent,
    methodology: methodology,     // 🔑 INKLUDERAD!
    instructions: '...',
  };
}

// SAVE mode: Skriver efter verifiering
async function saveResults(input): Promise<Phase4aSaveOutput> {
  // ... write files ...
  return { mode: 'save', success: true, files_created: [...] };
}
```

### MPC_RTA: code_start (nuvarande)

```typescript
// Returnerar BARA data, ingen metodologi
export async function codeStart(input): Promise<CodeStartOutput> {
  const status = await statusManager.initialize(input.file_path);
  const chunk = await chunkReader.readChunk(input.file_path, 0);
  
  return {
    status,
    chunk: chunk.content,
    // 🔴 INGEN metodologi!
    // 🔴 INGA instruktioner!
  };
}
```

---

## 4. Methodology Loading Patterns

### assessment-mcp

```typescript
class MethodologyLoader {
  // Generella dokument
  async load(): Promise<string> {
    // Laddar bedomningsmetod + instruktioner
  }
  
  // Fas-specifika dokument
  async loadPhase4A(): Promise<string> {
    const path = join(this.DEFAULT_PATH, 'phase4a_question_detection.md');
    return await fs.readFile(path, 'utf-8');
  }
  
  async loadPhase4B(): Promise<string> { ... }
  async loadPhase4D(): Promise<string> { ... }
  
  // Fallbacks
  private getPhase4AFallback(): string {
    return `# Phase 4A: Question Detection (Fallback)
    
    When analyzing exam_questions.md:
    1. Skip Table of Contents...
    2. Find real questions...
    ...`;
  }
}
```

### MPC_RTA (föreslaget)

```typescript
class MethodologyLoader {
  // Generella RTA-dokument
  async load(): Promise<string> {
    // Laddar rta_overview + coding_manual + lenses
  }
  
  // Fas-specifika dokument
  async loadPhase1(): Promise<string> { ... }
  async loadPhase2a(): Promise<string> { ... }
  async loadPhase2b(): Promise<string> { ... }
  async loadPhase3(): Promise<string> { ... }
  
  // Lins-specifika
  async loadLens(lens: 1 | 2 | 3): Promise<string> { ... }
  
  // Epistemologi
  async loadEpistemology(type): Promise<string> { ... }
}
```

---

## 5. init Tool Pattern

### assessment-mcp

```typescript
export async function init(): Promise<{
  instructions: string;
  availableTools: string[];
  criticalRules: string[];
}> {
  return {
    instructions: await fs.readFile('docs/mcp-usage/init-instructions.md'),
    availableTools: [
      'assessment_start - Start assessment session',
      'assessment_read_next - Read next student',
      // ...
    ],
    criticalRules: [
      'NEVER use bash/find/ls/cat',
      'NEVER say "upload the file"',
      'ALWAYS call MPC tools directly with full path',
    ],
  };
}
```

**Tool description:**
```
'CALL THIS FIRST! Returns critical instructions for using MPC tools. 
You MUST follow these instructions. 
NEVER use bash/find/ls/cat. ALWAYS call MPC tools directly.'
```

### MPC_RTA (föreslaget)

```typescript
export async function init(): Promise<{
  instructions: string;
  availableTools: string[];
  criticalRules: string[];
  rtaPhases: string[];
}> {
  return {
    instructions: await fs.readFile('docs/mcp-usage/init-instructions.md'),
    availableTools: [
      'phase2_code_start - Start coding session',
      'phase2_code_read_next - Read next chunk',
      // ...
    ],
    criticalRules: [
      'RESEARCHER maintains interpretive authority',
      'AI proposes codes, researcher decides',
      'Use coding manual for code format',
    ],
    rtaPhases: [
      'Phase 1: Familiarization',
      'Phase 2a: Initial Coding',
      'Phase 2b: Critical Review',
      'Phase 3: Generating Themes',
      // ...
    ],
  };
}
```

---

## 6. Workflow Comparison

### assessment-mcp Workflow

```
1. init() 
   → Returns critical instructions
   
2. phase6_start(q_file, rubric)
   → Returns session info + methodology_documents list
   
3. phase6_methodology(index=0)
   → Returns first methodology doc
   → Claude DISPLAYS to teacher
   → Teacher says "Ok"
   
4. phase6_methodology(index=1)
   → Returns second methodology doc
   → Claude DISPLAYS to teacher
   → Teacher says "Ok"
   
5. phase6_rubric(question_id)
   → Returns rubric section
   → Claude DISPLAYS to teacher
   → Teacher says "Redo"
   
6. phase6_read_next()
   → Returns student answer
   → Claude proposes assessment
   → Teacher confirms
   
7. phase6_write(assessment)
   → Writes assessment to file
```

### MPC_RTA Workflow (nuvarande)

```
1. code_start(file)
   → Returns first chunk only
   → NO methodology included!
   
2. (Researcher must remember methodology from Project Knowledge)

3. code_write_segment(codes)
   → Writes codes
   
4. code_read_next()
   → Returns next chunk
```

### MPC_RTA Workflow (föreslaget)

```
1. init()
   → Returns critical instructions + RTA phases
   
2. phase2_code_start(file, lens?)
   → Returns first chunk
   → Returns Phase 2a methodology
   → Returns coding manual
   → Returns lens-specific instructions (if specified)
   
3. Claude applies methodology to chunk
   → Proposes codes
   → Researcher decides
   
4. phase2_code_write_segment(codes)
   → Writes codes
   
5. phase2_code_read_next()
   → Returns next chunk
   → (Methodology already in context)
   
6. (Optional) phase2b_review(segment)
   → Returns segment for review
   → Returns Phase 2b methodology
   → Researcher validates codes
```

---

## 7. Key Differences Summary

| Aspect | assessment-mcp | MPC_RTA (nuvarande) |
|--------|---------------|---------------------|
| **Methodology location** | `/methodology/` (toppnivå) | `/docs/methodology/` |
| **Methodology loading** | Automatisk via tools | Manuell via Project Knowledge |
| **init tool** | ✅ Finns | ❌ Saknas |
| **Fas-specifik metodologi** | ✅ loadPhase4A(), etc. | ❌ Ingen |
| **LOAD/SAVE pattern** | ✅ Alla tools | ❌ Ingen |
| **Fallback strategy** | ✅ Hårdkodade fallbacks | ❌ Ingen |
| **Claude får instruktioner** | ✅ I tool response | ❌ Måste komma ihåg |

---

## 8. Implementation Checklist

### Must Have (v0.3.0)

- [ ] Create `/methodology/` directory
- [ ] Move files from `/docs/methodology/`
- [ ] Implement `MethodologyLoader`
- [ ] Create `init` tool
- [ ] Modify `code_start` → `phase2_code_start` with methodology
- [ ] Add fallback-summary.md

### Should Have (v0.3.1)

- [ ] Add lens parameter to `phase2_code_start`
- [ ] Implement `loadLens()` method
- [ ] Create phase-specific methodology files

### Nice to Have (v0.4.0+)

- [ ] Implement `phase1_familiarization` tool
- [ ] Implement `phase2b_review` tool
- [ ] Implement `phase3_generate_themes` tool
- [ ] Implement sequential methodology loading (like phase6_methodology)

---

## 9. Files to Create

### New TypeScript Files

```typescript
// src/core/methodology_loader.ts
// src/tools/init.ts
// src/tools/phase2_code_start.ts (rename from code_start.ts)
// src/tools/phase2b_review.ts (future)
```

### New Methodology Files

```markdown
# methodology/rta_overview.md
# methodology/coding_manual.md (rename from KODNINGSMANUAL)
# methodology/lenses_operationalized.md (rename from Linser_fordjupat)
# methodology/phase1_familiarization.md
# methodology/phase2a_initial_coding.md
# methodology/phase2b_critical_review.md
# methodology/phase3_generating_themes.md
# methodology/fallback-summary.md
```

---

**Document Status:** Reference for RFC-003 implementation
