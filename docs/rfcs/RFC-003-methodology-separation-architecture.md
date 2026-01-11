# RFC-003: Methodology Separation Architecture

**Status:** APPROVED WITH MODIFICATIONS  
**Created:** 2026-01-09  
**Reviewed:** 2026-01-11  
**Author:** Niklas Karlsson  
**Based on:** Deep analysis of assessment-mcp architecture  

---

## 1. Executive Summary

Denna RFC föreslår en arkitekturell förändring av qualitative-analysis-rta för att separera **metodologi** (RTA-fasspecifik kunskap) från **MCP-verktyg** (filoperationer). Mönstret är beprövat i assessment-mcp och löser problemet med att metodologi idag ligger i Claude Project Knowledge istället för att vara integrerad i MCP-servern.

### Nyckelinsikt från assessment-mcp

```
┌─────────────────────────────────────────────────────────────┐
│  MCP = Scaffolding (src/)                                   │
│    - File operations                                        │
│    - Progress tracking                                      │
│    - Tool orchestration                                     │
│                                                             │
│  Methodology = Knowledge (methodology/)                     │
│    - Fas-specifika instruktioner                            │
│    - Processbeskrivningar                                   │
│    - Quality criteria                                       │
│                                                             │
│  Claude Desktop = Generation                                │
│    - Applies methodology to data                            │
│    - Proposes codes/themes                                  │
│    - Maintains researcher dialogue                          │
│                                                             │
│  Researcher = Authority                                     │
│    - Final decisions on all codes                           │
│    - Interpretive authority                                 │
│    - Quality control                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Problem Statement

### 2.1 Nuvarande situation i qualitative-analysis-rta

```
qualitative-analysis-rta/
├── src/                           # MCP-kod
│   ├── server.ts                  # Inga methodology-referenser
│   ├── core/                      # Bara file operations
│   └── tools/                     # Verktyg utan metodologi-laddning
├── docs/
│   └── methodology/               # Metodologi finns här men...
│       ├── KODNINGSMANUAL_*.md    # ...laddas INTE av MCP!
│       ├── Linser_fordjupat.md
│       ├── epistemology/
│       └── RTA_phases/
└── (ingen methodology/ på toppnivå)
```

**Problem:**
1. Metodologi måste manuellt laddas upp till Claude Project Knowledge
2. Ingen fas-specifik metodologi-laddning
3. MCP-verktyg returnerar bara data, inte metodologi-kontext
4. Inget `init`-verktyg som ger Claude kritiska instruktioner

### 2.2 Assessment-mcp lösning

```
assessment-mcp/
├── src/
│   ├── server.ts                  # Registrerar alla verktyg
│   ├── core/
│   │   └── methodology_loader.ts  # 🔑 NYCKELKOMPONENT
│   └── tools/
│       ├── init.ts                # Returnerar kritiska instruktioner
│       ├── phase4a_questions.ts   # Laddar phase4a metodologi
│       ├── phase4b_rubric.ts      # Laddar phase4b metodologi
│       ├── phase6_start.ts        # Laddar generell metodologi
│       └── ...
└── methodology/                   # 🔑 PÅ TOPPNIVÅ
    ├── bedomningsmetod_generell_v2.md
    ├── instruktioner_ai_bedomning_v2.md
    ├── phase4a_question_detection.md
    ├── phase4b_rubric_validation.md
    ├── phase4c_student_report.md
    ├── phase4d_answer_boundaries.md
    ├── teacher_insights_guide.md
    └── fallback-summary.md
```

---

## 3. Technical Analysis: assessment-mcp Architecture

### 3.1 MethodologyLoader (src/core/methodology_loader.ts)

**Syfte:** Laddar och returnerar metodologi-dokument till Claude Desktop.

**Nyckelmetoder:**

| Metod | Syfte | När den anropas |
|-------|-------|-----------------|
| `load()` | Ladda alla generella dokument | Vid session-start |
| `loadDocument(filename)` | Ladda specifikt dokument | On-demand |
| `loadPhase4A()` | Ladda phase4a-specifik metodologi | När phase4a_questions anropas |
| `loadPhase4B()` | Ladda phase4b-specifik metodologi | När phase4b_rubric anropas |
| `loadPhase4D()` | Ladda phase4d-specifik metodologi | När phase4d_boundaries anropas |
| `getCondensed()` | Komprimerad sammanfattning | Context refresh |
| `checkAvailability()` | Verifiera att filer finns | Diagnostik |

**Fallback-strategi:**
- Om fil inte hittas → Hårdkodad fallback-text
- Säkerställer att Claude alltid får instruktioner

**Exempel från koden:**

```typescript
async loadPhase4A(): Promise<string> {
  const filePath = join(this.DEFAULT_PATH, 'phase4a_question_detection.md');
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.formatSection('phase4a_question_detection.md', content);
  } catch (error) {
    console.error('[MethodologyLoader] Phase 4A methodology not found:', error);
    return this.getPhase4AFallback();  // Hårdkodad fallback
  }
}
```

### 3.2 Tool Pattern: LOAD + SAVE modes

Assessment-mcp använder ett **two-phase workflow**:

```
┌─────────────────────────────────────────────────────────────┐
│  LOAD MODE                                                  │
│    Tool returnerar:                                         │
│    - Data (exam_content, student_answer, etc.)              │
│    - Methodology (instruktioner för Claude)                 │
│    - Instructions (konkreta steg att följa)                 │
│                                                             │
│  Claude analyserar med AI-förståelse                        │
│  Lärare verifierar                                          │
│                                                             │
│  SAVE MODE                                                  │
│    Tool skriver:                                            │
│    - Verifierad data till filer                             │
│    - Updates STATUS                                         │
│    - Returns confirmation                                   │
└─────────────────────────────────────────────────────────────┘
```

**Exempel från phase4a_questions.ts:**

```typescript
// LOAD MODE
async function loadExamAndMethodology(input): Promise<Phase4aLoadOutput> {
  const methodologyLoader = new MethodologyLoader();
  
  // 1. Read exam file
  const examContent = await fs.readFile(input.exam_path, 'utf-8');
  
  // 2. Load methodology (instructions for Claude)
  const methodology = await methodologyLoader.loadPhase4A();
  
  // 3. Build mode-specific instructions
  let instructions = `MODE: ${input.mode}\n\n`;
  // ... mode-specific instructions ...
  
  return {
    mode: 'load',
    exam_content: examContent,
    methodology: methodology,        // 🔑 Methodology included!
    analysis_mode: input.mode,
    instructions: instructions,
  };
}
```

### 3.3 init Tool Pattern

**Kritiskt verktyg som MÅSTE anropas först:**

```typescript
export async function init(): Promise<{
  instructions: string;
  availableTools: string[];
  criticalRules: string[];
}> {
  // Load instructions from file
  const instructionsPath = join(__dirname, '../../docs/mcp-usage/init-instructions.md');
  const instructions = await fs.readFile(instructionsPath, 'utf-8');
  
  return {
    instructions,
    availableTools: [
      'assessment_start - Start assessment session',
      // ... alla verktyg ...
    ],
    criticalRules: [
      'NEVER use bash/find/ls/cat',
      'NEVER say "upload the file"',
      'ALWAYS call MPC tools directly with full path',
      'MPC has FULL file access to user computer',
    ],
  };
}
```

**Tool description i server.ts:**

```typescript
{
  name: 'init',
  description:
    'CALL THIS FIRST! Returns critical instructions for using MPC tools. ' +
    'You MUST follow these instructions. ' +
    'NEVER use bash/find/ls/cat. ALWAYS call MPC tools directly.',
  inputSchema: { ... },
}
```

### 3.4 Fas-specifik Methodology Loading

**Phase 6 (Assessment) exempel:**

```typescript
// phase6_start.ts
{
  name: 'phase6_start',
  description:
    'Phase 6: Initialize an assessment session for a Q-file. ' +
    'IMPORTANT: After calling this, you MUST call phase6_methodology ' +
    'for EACH document in methodology_documents list BEFORE assessing any student.',
  // ...
}

// phase6_methodology.ts
{
  name: 'phase6_methodology',
  description:
    'Phase 6: Load and DISPLAY ONE methodology document at a time. ' +
    'CRITICAL: You MUST display the full document.content to the teacher! ' +
    'Do NOT summarize or skip.',
  // ...
}
```

**Workflow:**
1. `phase6_start` → Returnerar lista över methodology_documents
2. `phase6_methodology(index=0)` → Laddar första dokumentet
3. Claude visar innehållet för läraren
4. Lärare säger "Ok"
5. `phase6_methodology(index=1)` → Laddar nästa
6. ... repeat ...
7. När alla dokument laddade → `phase6_rubric` → börja bedömning

---

## 4. Proposed Architecture for qualitative-analysis-rta

### 4.1 New Directory Structure

```
qualitative-analysis-rta/
├── src/
│   ├── server.ts
│   ├── core/
│   │   ├── chunk_reader.ts
│   │   ├── segment_writer.ts
│   │   ├── status_manager.ts
│   │   ├── methodology_loader.ts    # 🆕 NY KOMPONENT
│   │   └── project_config.ts        # 🆕 NY: Läser rta_config.yaml
│   ├── tools/
│   │   │
│   │   ├── # === CORE (no prefix) ===
│   │   ├── init.ts                  # 🆕 NY: Kritiska instruktioner
│   │   ├── project_setup.ts         # 🆕 NY: Skapar projekt + config
│   │   ├── add_line_index.ts        # BEHÅLL (generisk)
│   │   ├── methodology_load.ts      # 🆕 NY: Generisk methodology loader
│   │   │
│   │   ├── # === PHASE 2a: Initial Coding (prefix: phase2a-coding:) ===
│   │   ├── phase2a_code_start.ts    # Renamed from code_start.ts
│   │   ├── phase2a_code_read_next.ts
│   │   ├── phase2a_code_write_segment.ts
│   │   ├── phase2a_code_skip_chunk.ts
│   │   ├── phase2a_code_status.ts
│   │   ├── phase2a_code_verify.ts
│   │   ├── phase2a_code_clear_all.ts
│   │   ├── phase2a_code_delete_segment.ts
│   │   ├── phase2a_code_reset_status.ts
│   │   │
│   │   ├── # === PHASE 2b: Critical Review (prefix: phase2b-review:) ===
│   │   ├── phase2b_start.ts         # 🆕 FRAMTIDA
│   │   ├── phase2b_next.ts          # 🆕 FRAMTIDA
│   │   │
│   │   └── # === PHASE 3+ (FRAMTIDA) ===
│   │
│   └── types/
│
├── templates/                        # 🆕 NY TOPPNIVÅ-MAPP
│   └── rta_config.yaml              # Mall för projektkonfiguration
│
├── methodology/                      # 🆕 NY TOPPNIVÅ-MAPP
│   ├── rta_overview.md              # Generell RTA-introduktion
│   ├── coding_manual.md             # Kodningsmanual (nu: KODNINGSMANUAL_*)
│   ├── lenses_operationalized.md    # Linser (nu: Linser_fordjupat.md)
│   │
│   ├── phase1_familiarization.md    # Fas 1 specifik
│   ├── phase2a_initial_coding.md    # Fas 2a specifik
│   ├── phase2b_critical_review.md   # Fas 2b specifik (ny!)
│   ├── phase3_generating_themes.md  # Fas 3 specifik
│   ├── phase4_reviewing_themes.md
│   ├── phase5_defining_naming.md
│   ├── phase6_producing_report.md
│   │
│   ├── epistemology/                # Epistemologiska guider
│   │   ├── constructionist.md
│   │   ├── inductive_deductive.md
│   │   └── semantic_latent.md
│   │
│   └── fallback-summary.md          # Komprimerad fallback
│
└── docs/
    ├── methodology/                 # DEPRECATED → methodology/
    └── ...
```

### 4.2 MethodologyLoader for qualitative-analysis-rta

```typescript
// src/core/methodology_loader.ts

export class MethodologyLoader {
  private readonly DEFAULT_PATH = 
    process.env.METHODOLOGY_PATH || join(__dirname, '../../methodology');
  
  // Generella dokument
  private readonly GENERAL_FILES = [
    'rta_overview.md',
    'coding_manual.md',
    'lenses_operationalized.md',
  ];
  
  /**
   * Load all general methodology for session start
   */
  async load(): Promise<string> { ... }
  
  /**
   * Load Phase 1: Familiarization methodology
   */
  async loadPhase1(): Promise<string> {
    return this.loadPhaseDocument('phase1_familiarization.md');
  }
  
  /**
   * Load Phase 2a: Initial Coding methodology
   */
  async loadPhase2a(): Promise<string> {
    return this.loadPhaseDocument('phase2a_initial_coding.md');
  }
  
  /**
   * Load Phase 2b: Critical Coding Review methodology
   */
  async loadPhase2b(): Promise<string> {
    return this.loadPhaseDocument('phase2b_critical_review.md');
  }
  
  /**
   * Load Phase 3: Generating Themes methodology
   */
  async loadPhase3(): Promise<string> {
    return this.loadPhaseDocument('phase3_generating_themes.md');
  }
  
  // ... phase 4, 5, 6 ...
  
  // NOTE: No loadLens() method - lens information is part of methodology content,
  // not MCP responsibility. This keeps MCP generic and flexible.
  
  /**
   * Load epistemological guide (on-demand or at project start)
   */
  async loadEpistemology(type: 'constructionist' | 'inductive' | 'semantic'): Promise<string> { ... }
  
  private async loadPhaseDocument(filename: string): Promise<string> {
    const filePath = join(this.DEFAULT_PATH, filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.formatSection(filename, content);
    } catch (error) {
      return this.getFallback(filename);
    }
  }
}
```

### 4.3 Tool Modifications

#### 4.3.0 Tool Naming Convention (UPDATED)

**Core tools (no prefix):**
- `init` - Session-start instructions
- `project_setup` - Create project structure
- `add_line_index` - Prepare transcript
- `methodology_load` - Load methodology documents (generic, phase as parameter)

**Phase-specific tools (with prefix):**
- `phase2a-coding:code_start` - Start Phase 2a coding
- `phase2a-coding:code_read_next` - Read next chunk
- `phase2a-coding:code_write_segment` - Write codes
- `phase2a-coding:code_skip_chunk` - Skip chunk
- `phase2a-coding:code_status` - Show progress
- `phase2a-coding:code_verify` - Verify STATUS
- `phase2a-coding:code_clear_all` - Clear all coding
- `phase2a-coding:code_delete_segment` - Delete segment
- `phase2a-coding:code_reset_status` - Reset STATUS

- `phase2b-review:start` - Start Phase 2b review (FUTURE)
- `phase2b-review:next` - Review next segment (FUTURE)

- `phase3-themes:start` - Start Phase 3 (FUTURE)

#### 4.3.1 New: init tool

```typescript
// src/tools/init.ts

export async function init(): Promise<{
  instructions: string;
  availableTools: string[];
  criticalRules: string[];
  rtaPhases: string[];
}> {
  const instructionsPath = join(__dirname, '../../docs/mcp-usage/init-instructions.md');
  const instructions = await fs.readFile(instructionsPath, 'utf-8');
  
  return {
    instructions,
    availableTools: [
      'phase2_code_start - Start coding session (Phase 2)',
      'phase2_code_read_next - Read next chunk',
      'phase2_code_write_segment - Write codes for segment(s)',
      'phase2_code_status - Show progress',
      // ...
    ],
    criticalRules: [
      'RESEARCHER maintains interpretive authority',
      'AI proposes codes, researcher decides',
      'Use coding manual for code format',
      'Mark semantic segments, not arbitrary chunks',
    ],
    rtaPhases: [
      'Phase 1: Familiarization (coming soon)',
      'Phase 2a: Initial Coding (current)',
      'Phase 2b: Critical Review (coming soon)',
      'Phase 3: Generating Themes (coming soon)',
      // ...
    ],
  };
}
```

#### 4.3.2 New: methodology_load tool (generic)

```typescript
// src/tools/methodology_load.ts

/**
 * methodology_load - Generic methodology loader
 * 
 * Reads from rta_config.yaml to determine which documents to load
 * for the specified phase. Supports progressive loading.
 */

export interface MethodologyLoadInput {
  config_path: string;        // Path to rta_config.yaml
  phase: string;              // e.g., "phase2a", "phase2b", "phase3"
  document_index?: number;    // For progressive loading (0, 1, 2...)
}

export interface MethodologyLoadOutput {
  document: {
    name: string;
    content: string;
  };
  progress: {
    current_index: number;
    total_documents: number;
    remaining: string[];
  };
  next_action: string;
}

export async function methodologyLoad(input: MethodologyLoadInput): Promise<MethodologyLoadOutput> {
  const { config_path, phase, document_index = 0 } = input;
  
  // 1. Load config
  const config = await loadConfig(config_path);
  
  // 2. Get documents for phase from config
  const phaseDocs = config.methodology.phases[phase] || [];
  
  if (phaseDocs.length === 0) {
    throw new Error(`No methodology documents configured for phase: ${phase}`);
  }
  
  // 3. Load specific document
  const methodologyPath = join(dirname(config_path), 'methodology');
  const docName = phaseDocs[document_index];
  const content = await fs.readFile(join(methodologyPath, docName), 'utf-8');
  
  // 4. Build response
  const remaining = phaseDocs.slice(document_index + 1);
  
  return {
    document: { name: docName, content },
    progress: {
      current_index: document_index,
      total_documents: phaseDocs.length,
      remaining
    },
    next_action: remaining.length === 0
      ? `All methodology loaded for ${phase}. Ready to proceed.`
      : `SHOW full content to researcher. Ask "Ok?" Then call with document_index=${document_index + 1}`
  };
}
```

#### 4.3.3 Modified: phase2a_code_start

```typescript
// src/tools/phase2_code_start.ts (renamed from code_start.ts)

export async function phase2CodeStart(input: Phase2StartInput): Promise<Phase2StartOutput> {
  const methodologyLoader = new MethodologyLoader();
  
  // 1. Initialize STATUS (existing logic)
  const status = await statusManager.initialize(input.file_path);
  
  // 2. Read first chunk (existing logic)
  const chunk = await chunkReader.readChunk(input.file_path, 0);
  
  // 3. Load Phase 2a methodology (NEW!)
  const methodology = await methodologyLoader.loadPhase2a();
  
  // 4. Load coding manual (NEW!)
  const codingManual = await methodologyLoader.loadDocument('coding_manual.md');
  
  // NOTE: Lens information is included in coding_manual.md
  // MCP is generic and does not know about specific lenses
  
  return {
    status,
    chunk: chunk.content,
    methodology,           // 🆕 Inkluderat!
    codingManual,          // 🆕 Inkluderat!
    instructions: `
      Read the methodology carefully.
      Apply coding manual format for all codes.
      Researcher has final authority on all codes.
    `,
  };
}
```

### 4.4 Init Enforcement (CRITICAL)

**Problem:** Claude följer inte alltid "CALL THIS FIRST!" instruktioner i tool descriptions.

**Lösning:** Hård enforcement via SessionState - tools VAGRAR köra utan init.

#### 4.4.1 SessionState Manager

```typescript
// src/core/session_state.ts

class SessionState {
  private static instance: SessionState;
  private _initCalled: boolean = false;
  private _configPath: string | null = null;
  
  static getInstance(): SessionState {
    if (!SessionState.instance) {
      SessionState.instance = new SessionState();
    }
    return SessionState.instance;
  }
  
  markInitCalled(): void {
    this._initCalled = true;
  }
  
  requireInit(): void {
    if (!this._initCalled) {
      throw new Error(
        "🛑 STOPP! Du MÅSTE anropa 'init' först.\n" +
        "Anropa: init()\n" +
        "Sedan kan du använda andra tools."
      );
    }
  }
  
  setConfigPath(path: string): void {
    this._configPath = path;
  }
  
  getConfigPath(): string | null {
    return this._configPath;
  }
}

export const sessionState = SessionState.getInstance();
```

#### 4.4.2 Tool Requirements Matrix

| Tool | Kräver init? | Varför |
|------|--------------|--------|
| `init` | ❌ Nej | ÄR init |
| `project_setup` | ❌ Nej | Körs innan init (skapar projekt) |
| `add_line_index` | ❌ Nej | Förberedelse, kan köras separat |
| `methodology_load` | ✅ Ja | Kräver session-kontext |
| `phase2a-coding:*` | ✅ Ja | Kräver session-kontext |
| `phase2b-review:*` | ✅ Ja | Kräver session-kontext |
| `phase3-themes:*` | ✅ Ja | Kräver session-kontext |

#### 4.4.3 Implementation Pattern

```typescript
// init.ts - Markerar session som initierad
import { sessionState } from '../core/session_state.js';

export async function init(): Promise<InitResult> {
  sessionState.markInitCalled();  // ✅ Markera som anropad
  
  return { instructions, availableTools, criticalRules, rtaPhases };
}

// methodology_load.ts - Kräver init
import { sessionState } from '../core/session_state.js';

export async function methodologyLoad(input): Promise<...> {
  sessionState.requireInit();  // 🛑 KRASCHAR om init inte anropats
  
  // ... resten av koden
}

// phase2a_code_start.ts - Kräver init
import { sessionState } from '../core/session_state.js';

export async function phase2aCodeStart(input): Promise<...> {
  sessionState.requireInit();  // 🛑 KRASCHAR om init inte anropats
  
  // ... resten av koden
}
```

#### 4.4.4 Workflow med Enforcement

```
Claude: "Jag ska börja koda..."
       ↓
Claude anropar: phase2a-coding:code_start
       ↓
Tool returnerar: 🛑 STOPP! Du MÅSTE anropa 'init' först.
       ↓
Claude: "Ok, jag anropar init först"
       ↓
Claude anropar: init()
       ↓
Tool returnerar: ✅ Instruktioner + availableTools
       ↓
Claude anropar: phase2a-coding:code_start
       ↓
Tool returnerar: ✅ Chunk + methodology
```

---

### 4.5 Workflow Comparison

#### Current qualitative-analysis-rta Workflow

```
1. User uploads methodology to Claude Project Knowledge (MANUAL!)
2. User calls code_start → Returns only chunk data
3. Claude must remember methodology from Project Knowledge
4. ... coding proceeds ...
```

#### Proposed qualitative-analysis-rta Workflow

```
1. User calls init → Returns critical instructions + available tools
2. User calls phase2_code_start → Returns:
   - Chunk data
   - Phase 2a methodology (auto-loaded)
   - Coding manual (auto-loaded, includes lens information)
3. Claude has ALL needed context in tool response
4. ... coding proceeds with methodology in context ...

5. (Optional) User calls phase2b_review → Returns:
   - Current segment for review
   - Phase 2b methodology (auto-loaded)
   - Review checklist
```

### 4.6 Project Setup and Configuration (NEW)

#### 4.6.1 project_setup Tool

**Purpose:** Create project structure and configuration before Phase 1.

```typescript
// src/tools/project_setup.ts

export async function projectSetup(input: ProjectSetupInput): Promise<ProjectSetupOutput> {
  // 1. Create project directory in output_path
  const projectPath = join(input.output_path, input.project_name);
  await fs.mkdir(projectPath, { recursive: true });
  
  // 2. Copy methodology/ from qualitative-analysis-rta repo to project
  await copyDirectory(
    join(__dirname, '../../methodology'),
    join(projectPath, 'methodology')
  );
  
  // 3. Copy and customize rta_config.yaml from template
  const template = await fs.readFile(
    join(__dirname, '../../templates/rta_config.yaml'),
    'utf-8'
  );
  const config = customizeTemplate(template, {
    project_name: input.project_name,
    researcher: input.researcher,
    transcripts: input.transcripts,
    created: new Date().toISOString()
  });
  await fs.writeFile(join(projectPath, 'rta_config.yaml'), config);
  
  // 4. Create project_state.json
  const state = createProjectState(input.project_name);
  await fs.writeFile(
    join(projectPath, 'project_state.json'),
    JSON.stringify(state, null, 2)
  );
  
  return {
    success: true,
    project_path: projectPath,
    config_path: join(projectPath, 'rta_config.yaml'),
    message: `Project '${input.project_name}' created with ${input.transcripts.length} transcripts`,
    next_step: 'Call init, then phase1_familiarization'
  };
}
```

**Input:**
```typescript
interface ProjectSetupInput {
  project_name: string;           // e.g., "AI_Teachers_Focus_Groups"
  output_path: string;            // e.g., "/Users/.../Nextcloud/Analysis"
  researcher: string;             // e.g., "Niklas Karlsson"
  transcripts: string[];          // Paths to transcript files
}
```

#### 4.6.2 rta_config.yaml Template

**Location:** `templates/rta_config.yaml`

```yaml
# RTA Project Configuration
# Generated by: project_setup tool
# Purpose: Single source of truth for methodology and project state

project:
  name: "{{PROJECT_NAME}}"
  researcher: "{{RESEARCHER}}"
  created: "{{CREATED}}"
  last_updated: "{{CREATED}}"

methodology:
  # Generella dokument (laddas vid projekt-start)
  general:
    - rta_overview.md
    - coding_manual.md
  
  # Fas-specifika dokument
  # Claude läser dessa dynamiskt baserat på aktuell fas
  phases:
    phase1:
      - phase1_familiarization.md
    phase2a:
      - phase2a_initial_coding.md
      - coding_manual.md
    phase2b:
      - phase2b_critical_review.md
    phase3:
      - phase3_generating_themes.md
    phase4:
      - phase4_reviewing_themes.md
    phase5:
      - phase5_defining_naming.md
    phase6:
      - phase6_producing_report.md
  
  # Epistemologi (laddas vid projekt-start + on-demand)
  epistemology:
    load_at_start: true           # Ladda vid init()
    documents:
      - epistemology/constructionist.md
      - epistemology/inductive_deductive.md
      - epistemology/semantic_latent.md

# Transkript att analysera
transcripts: []
  # Populated by project_setup:
  # - path: "/path/to/transcript1.md"
  #   status: "pending"
  #   current_phase: null

# State tracking
state:
  current_phase: null
  started_at: null
```

#### 4.6.3 Project Structure After Setup

```
/Users/.../Nextcloud/Fokusgrupper_AI_2025/Analysis/
└── AI_Teachers_Focus_Groups/          # Created by project_setup
    ├── rta_config.yaml                 # Project configuration
    ├── project_state.json              # Phase tracking
    ├── methodology/                     # Copied from qualitative-analysis-rta repo
    │   ├── rta_overview.md
    │   ├── coding_manual.md
    │   ├── phase1_familiarization.md
    │   ├── phase2a_initial_coding.md
    │   ├── ...
    │   └── epistemology/
    └── transcripts/                     # Optional: copied or referenced
```

#### 4.6.4 MethodologyLoader with Config

```typescript
// src/core/methodology_loader.ts (updated)

export class MethodologyLoader {
  private config: RtaConfig;
  private methodologyPath: string;
  
  constructor(configPath: string) {
    this.config = yaml.load(fs.readFileSync(configPath, 'utf-8'));
    this.methodologyPath = join(dirname(configPath), 'methodology');
  }
  
  /**
   * Load documents for a specific phase from config
   */
  async loadPhase(phase: string): Promise<string[]> {
    const docs = this.config.methodology.phases[phase] || [];
    return Promise.all(
      docs.map(doc => this.loadDocument(doc))
    );
  }
  
  /**
   * Load general methodology documents
   */
  async loadGeneral(): Promise<string[]> {
    return Promise.all(
      this.config.methodology.general.map(doc => this.loadDocument(doc))
    );
  }
}
```

#### 4.6.5 Workflow with project_setup

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 0: Project Setup                                     │
│                                                             │
│  1. Researcher calls project_setup:                         │
│     - project_name: "AI_Teachers_Focus_Groups"              │
│     - output_path: "/Users/.../Nextcloud/Analysis"          │
│     - transcripts: ["NE_traff_1.md", "BSG_traff_1.md", ...] │
│                                                             │
│  2. Tool creates:                                           │
│     - Project directory                                     │
│     - rta_config.yaml (from template)                       │
│     - methodology/ (copied from repo)                       │
│     - project_state.json                                    │
│                                                             │
│  3. Researcher can customize rta_config.yaml if needed      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1-6: RTA Analysis                                    │
│                                                             │
│  All tools read from rta_config.yaml:                       │
│  - Which methodology docs to load for current phase         │
│  - Which transcripts to process                             │
│  - Current state and progress                               │
└─────────────────────────────────────────────────────────────┘
```

#### 4.6.6 Benefits of Config-Based Approach

| Benefit | Description |
|---------|-------------|
| **Flexibility** | Different projects can have different methodology documents |
| **Versioning** | Methodology copied to project = snapshot of version used |
| **Customization** | Researcher can edit config without touching repo |
| **Reproducibility** | Project folder is self-contained |
| **State tracking** | All state in project folder, not in MCP |

---

## 5. Implementation Plan

### Phase 0: Project Setup (v0.3.0) - NEW

1. **Create templates/ directory**
   - Add `templates/rta_config.yaml` template

2. **Implement project_setup tool**
   - Create project directory structure
   - Copy methodology/ to project
   - Generate rta_config.yaml from template
   - Create project_state.json

3. **Implement project_config.ts**
   - Read and parse rta_config.yaml
   - Provide config to other tools

### Phase 1: Foundation (v0.3.0)

1. **Create methodology/ directory structure**
   - Move files from docs/methodology/
   - Rename for consistency
   - Add fallback-summary.md

2. **Implement MethodologyLoader**
   - Port from assessment-mcp
   - Adapt for RTA phases
   - Add lens-loading support

3. **Create init tool**
   - Port pattern from assessment-mcp
   - Add RTA-specific content

4. **Rename tools: phase1-coding → phase2-coding**
   - Already planned in ROADMAP

### Phase 2: Integration (v0.3.1)

5. **Modify code_start → phase2_code_start**
   - Add methodology loading
   - Return methodology in response

   *Note: No lens parameter - lens information is part of methodology content (coding_manual.md), not MCP responsibility. This keeps MCP generic.*

### Phase 3: Extended Phases (v0.4.0+)

7. **Implement phase1_familiarization tool**
   - Read transcript without coding
   - Return familiarization methodology

8. **Implement phase2b_review tool**
   - Critical coding review
   - Load Phase 2b methodology

9. **Implement phase3_generate_themes tool**
   - Theme generation support
   - Load Phase 3 methodology

---

## 6. Migration Strategy

### 6.1 Files to Move

| Current Location | New Location |
|------------------|--------------|
| docs/methodology/KODNINGSMANUAL_*.md | methodology/coding_manual.md |
| docs/methodology/Linser_fordjupat.md | methodology/lenses_operationalized.md |
| docs/methodology/RTA_phases/phase1_*.md | methodology/phase1_familiarization.md |
| docs/methodology/RTA_phases/phase2_*.md | methodology/phase2a_initial_coding.md |
| docs/methodology/RTA_phases/phase3_*.md | methodology/phase3_generating_themes.md |
| docs/methodology/epistemology/*.md | methodology/epistemology/*.md |

### 6.2 Backward Compatibility

- Keep docs/methodology/ as symlink initially
- METHODOLOGY_PATH environment variable for override
- Fallback to hardcoded summary if files missing

### 6.3 Claude Project Knowledge

**After migration:**
- Project Knowledge is NOT USED
- All methodology loaded by MCP tools directly from filesystem
- MCP server reads methodology/ directory on researcher's computer
- No sync or upload required

---

## 7. Benefits

### 7.1 For Researcher

- **No manual upload required** - methodology auto-loaded
- **Fas-specifik kontext** - rätt metodologi för rätt fas
- **Konsekvent process** - samma instruktioner varje gång

### 7.2 For Development

- **Single source of truth** - methodology in repository
- **Version controlled** - changes tracked in git
- **Testable** - can verify methodology loading

### 7.3 For Replication

- **Self-contained** - entire methodology in repository
- **Documented** - clear separation of concerns
- **Portable** - methodology files can be shared

---

## 8. Open Questions - RESOLVED

### 8.1 Epistemology Integration - RESOLVED

**Q:** Ska epistemologiska guider laddas automatiskt eller on-demand?

**DECISION:**
1. **Vid projekt-start (init):** Ladda som bakgrundskontext
2. **On-demand:** När forskaren explicit begär det
3. **INTE vid varje fas-start** (onödigt, tar context-plats)

**Implementation i rta_config.yaml:**
```yaml
methodology:
  epistemology:
    load_at_start: true           # Ladda vid init()
    documents:
      - epistemology/constructionist.md
      - epistemology/inductive_deductive.md
      - epistemology/semantic_latent.md
```

**Workflow:**
```
init() → Laddar epistemologi som bakgrund
       → Forskaren får översikt
       → Kan begära fördjupning när som helst via methodology_load
```

### 8.2 Lens Selection - RESOLVED

**Q:** Hur ska lins-specifik kodning hanteras?

**DECISION:** Se Sektion 10, punkt 1-3. Lens information är methodology content (coding_manual.md), inte MCP-ansvar.

---

## 9. References

### 9.1 Assessment-mcp Files Analyzed

- `/src/core/methodology_loader.ts` - Nyckelkomponent
- `/src/tools/init.ts` - Init-mönster
- `/src/tools/phase4a_questions.ts` - LOAD/SAVE pattern
- `/src/tools/phase6_start.ts` - Session start with methodology
- `/src/tools/phase6_methodology.ts` - Sequential methodology loading
- `/src/server.ts` - Tool registration
- `/methodology/*.md` - All methodology files

### 9.2 Related Documents

- RFC-002: Workflow & State Management
- Phase_2b_Critical_Coding_Review_DRAFT.md
- ROADMAP.md (v0.3.0 terminology alignment)

---

## 10. Decision

**RFC-003 Status:** APPROVED WITH MODIFICATIONS

- [ ] Approve as-is
- [x] Approve with modifications (see below)
- [ ] Needs more analysis
- [ ] Reject

### Modifications Applied:
1. **Removed `loadLens()`** - Lens information is methodology content, not MCP function
2. **Removed lens parameter** from phase2_code_start - MCP is generic
3. **Epistemology loading** - At project start + on-demand (not every phase)
4. **Claude Project Knowledge** - Not used, MCP reads directly from filesystem
5. **Progressive methodology loading** - Confirmed same pattern as assessment-mcp
6. **Added project_setup tool** - Creates project structure with rta_config.yaml before Phase 1
7. **Added templates/rta_config.yaml** - Configurable methodology documents per phase
8. **Tool naming convention** - Core tools (no prefix): init, project_setup, add_line_index, methodology_load. Phase tools with prefix: `phase2a-coding:*`, `phase2b-review:*`
9. **Generic methodology_load** - Single tool that reads phase from parameter + yaml config
10. **Init enforcement** - Hard enforcement via SessionState - tools REFUSE to run without init first

---

**Document Status:** APPROVED  
**Decision Date:** 2026-01-11  
**Next Action:** Proceed with implementation (see RFC-005)  
**Implementation Target:** v0.3.0
