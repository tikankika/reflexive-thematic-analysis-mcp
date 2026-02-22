# RFC-005: Implementation Plan - Methodology Separation Architecture

**Status:** APPROVED  
**Created:** 2026-01-11  
**Updated:** 2026-01-11  
**Author:** Niklas Karlsson  
**Implements:** RFC-003  
**Based on:** Deep analysis of assessment-mcp architecture  

---

## 1. Executive Summary

Denna RFC är en **konkret implementationsplan** för RFC-003 (Methodology Separation Architecture). Den specificerar exakt vilka filer som ska skapas, flyttas, och modifieras för att transformera qualitative-analysis-rta till samma arkitekturmönster som assessment-mcp.

### Nyckelprinciper (från assessment-mcp)

```
┌─────────────────────────────────────────────────────────────┐
│  SEPARATION OF CONCERNS                                     │
│                                                             │
│  src/           = MCP-kod (file operations, scaffolding)    │
│  methodology/   = Metodologi-kunskap (instruktioner)        │
│  docs/          = Dokumentation (för utvecklare/forskare)   │
│                                                             │
│  MCP laddar metodologi → Claude får kontext → Forskare      │
│  behåller tolkningsauktoritet                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Current State Analysis

### 2.1 qualitative-analysis-rta - What We Have (GOOD - KEEP!)

| Component | Status | Notes |
|-----------|--------|-------|
| **10 MCP-verktyg** | ✅ Fungerar | add_line_index, code_start, code_read_next, code_write_segment, code_skip_chunk, code_reset_status, code_verify, code_clear_all, code_delete_segment, code_status |
| **STATUS tracking** | ✅ Fungerar | YAML frontmatter i transkript |
| **Chunk/Segment** | ✅ Fungerar | ChunkReader, SegmentWriter, StatusManager |
| **v0.2.0 multi-segment API** | ✅ Fungerar | Granular segment coding |

### 2.2 Assessment-MCP - Pattern to Follow

| Component | Description | qualitative-analysis-rta Equivalent |
|-----------|-------------|-------------------|
| `methodology/` (root) | Metodologi-filer på toppnivå | ❌ Finns i docs/methodology/ |
| `MethodologyLoader` | Klass som laddar metodologi | ❌ Finns inte |
| `init` tool | Kritiska instruktioner | ❌ Finns inte |
| `phase*_methodology` tools | Progressiv metodologi-laddning | ❌ Finns inte |
| LOAD/SAVE pattern | Two-phase workflow | ⚠️ Delvis (code_read_next/code_write_segment) |

### 2.3 Gap Analysis

| Gap | Priority | Effort |
|-----|----------|--------|
| Skapa `methodology/` på toppnivå | 🔴 HIGH | Low |
| Flytta/konsolidera metodologi-filer | 🔴 HIGH | Medium |
| Implementera `MethodologyLoader` | 🔴 HIGH | Medium |
| Implementera `init` tool | 🔴 HIGH | Low |
| Modifiera `code_start` för metodologi-laddning | 🟡 MEDIUM | Low |
| Skapa `phase2_methodology` tool | 🟡 MEDIUM | Medium |
| Skapa `phase2b_review` tools | 🟢 LATER | High |
| Skapa `phase3_*` tools | 🟢 LATER | High |

---

## 3. Target Architecture

### 3.1 New Directory Structure

```
qualitative-analysis-rta/
├── src/
│   ├── server.ts                    # Uppdaterad med alla tools
│   ├── core/
│   │   ├── chunk_reader.ts          # BEHÅLL - Fungerar
│   │   ├── segment_writer.ts        # BEHÅLL - Fungerar
│   │   ├── status_manager.ts        # BEHÅLL - Fungerar
│   │   ├── methodology_loader.ts    # 🆕 NY
│   │   ├── project_config.ts        # 🆕 NY - Läser rta_config.yaml
│   │   └── session_state.ts         # 🆕 NY - Init enforcement
│   ├── tools/
│   │   │
│   │   ├── # === CORE (no prefix) ===
│   │   ├── init.ts                  # 🆕 NY
│   │   ├── project_setup.ts         # 🆕 NY - Skapar projekt + config
│   │   ├── add_line_index.ts        # BEHÅLL (generisk)
│   │   ├── methodology_load.ts      # 🆕 NY - Generisk, fas som parameter
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
│   │
│   ├── # === GENERELLA DOKUMENT ===
│   ├── rta_overview.md              # RTA-introduktion (ny sammanfattning)
│   ├── KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md  # Integrerad kodningsmanual
│   │
│   ├── # === FAS-SPECIFIKA DOKUMENT ===
│   ├── phase1_familiarization.md    # Braun & Clarke Phase 1
│   ├── phase2a_initial_coding.md    # Phase 2a: Semi-automated coding
│   ├── phase2b_critical_review.md   # Phase 2b: Critical Coding Review
│   ├── phase3_generating_themes.md  # Phase 3: Generating Themes
│   ├── phase4_reviewing_themes.md   # Phase 4
│   ├── phase5_defining_naming.md    # Phase 5
│   ├── phase6_producing_report.md   # Phase 6
│   │
│   ├── # === EPISTEMOLOGI ===
│   ├── epistemology/
│   │   ├── constructionist.md       # Konstruktionistisk epistemologi
│   │   ├── orientation.md           # Teoretisk orientering
│   │   ├── inductive_deductive.md   # Induktiv vs deduktiv
│   │   └── semantic_latent.md       # Semantisk vs latent
│   │
│   └── fallback-summary.md          # Komprimerad fallback
│
├── docs/
│   ├── mcp-usage/                   # 🆕 NY MAPP
│   │   ├── init-instructions.md     # Kritiska instruktioner för Claude
│   │   └── workflow-guide.md        # Användningsguide
│   ├── rfcs/
│   ├── design/
│   └── ... (övrig dokumentation)
│
└── # === NEXTCLOUD SYNC ===
    # methodology/ synkas automatiskt till:
    # /path/to/data/.../qualitative-analysis-rta_Methodology/
    # (konfigureras i Nextcloud-klient)
```

### 3.2 File Mapping (Current → New)

| Current Location | New Location | Action |
|------------------|--------------|--------|
| `methodology/KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md` | *(keep as-is)* | KEEP |
| `docs/methodology/RTA_phases/phase1_familiarization_template.md` | `methodology/phase1_familiarization.md` | ALREADY DONE |
| `docs/methodology/RTA_phases/phase2_*.md` | `methodology/phase2a_initial_coding.md` | ALREADY DONE |
| `docs/methodology/RTA_phases/phase3_generating_themes.md` | `methodology/phase3_generating_themes.md` | ALREADY DONE |
| `docs/methodology/RTA_phases/phase4_reviewing_themes.md` | `methodology/phase4_reviewing_themes.md` | ALREADY DONE |
| `docs/methodology/RTA_phases/phase5_defining_naming_themes.md` | `methodology/phase5_defining_naming.md` | ALREADY DONE |
| `docs/methodology/RTA_phases/phase6_producing_report.md` | `methodology/phase6_producing_report.md` | ALREADY DONE |
| `docs/methodology/epistemology/Section_3.1.1_Epistemology_Guide.md` | `methodology/epistemology/constructionist.md` | ALREADY DONE |
| `docs/methodology/epistemology/Section_3_1_3_Inductive_Deductive_Guide.md` | `methodology/epistemology/inductive_deductive.md` | ALREADY DONE |
| `docs/methodology/epistemology/Section_3_1_4_Semantic_Latent_Guide.md` | `methodology/epistemology/semantic_latent.md` | ALREADY DONE |
| *(ny)* | `methodology/rta_overview.md` | CREATE |
| *(ny)* | `methodology/phase2b_critical_review.md` | CREATE (from development_ideas/) |
| *(ny)* | `methodology/fallback-summary.md` | CREATE |

**FILES TO DELETE:**
- `methodology/coding_manual.md` - replaced by integrated KODNINGSMANUAL
- `methodology/lenses_operationalized.md` - lens info is in KODNINGSMANUAL

---

## 4. Implementation Steps

### STEG 0: Project Setup Infrastructure (1 tim) - NEW

**Skapa templates/ mapp och rta_config.yaml:**

```bash
mkdir -p <PROJECT_ROOT>/templates
```

**Fil:** `templates/rta_config.yaml`

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
    - KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md
  
  # Fas-specifika dokument
  phases:
    phase1:
      - phase1_familiarization.md
    phase2a:
      - phase2a_initial_coding.md
      - KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md
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
  # - path: "/path/to/transcript.md"
  #   status: "pending"
  #   current_phase: null

# State tracking
state:
  current_phase: null
  started_at: null
```

**Fil:** `src/tools/project_setup.ts`

```typescript
/**
 * project_setup - Create RTA project structure and configuration
 * 
 * Creates project folder in Nextcloud with:
 * - rta_config.yaml (from template)
 * - methodology/ (copied from repo)
 * - project_state.json
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ProjectSetupInput {
  project_name: string;
  output_path: string;
  researcher: string;
  transcripts: string[];
}

export interface ProjectSetupOutput {
  success: boolean;
  project_path: string;
  config_path: string;
  files_created: string[];
  message: string;
  next_step: string;
}

export async function projectSetup(input: ProjectSetupInput): Promise<ProjectSetupOutput> {
  const { project_name, output_path, researcher, transcripts } = input;
  
  // 1. Create project directory
  const projectPath = join(output_path, project_name);
  await fs.mkdir(projectPath, { recursive: true });
  
  const filesCreated: string[] = [];
  
  // 2. Copy methodology/ from repo to project
  const repoMethodology = join(__dirname, '../../methodology');
  const projectMethodology = join(projectPath, 'methodology');
  await copyDirectory(repoMethodology, projectMethodology);
  filesCreated.push('methodology/');
  
  // 3. Load and customize template
  const templatePath = join(__dirname, '../../templates/rta_config.yaml');
  const template = await fs.readFile(templatePath, 'utf-8');
  
  const config = template
    .replace(/\{\{PROJECT_NAME\}\}/g, project_name)
    .replace(/\{\{RESEARCHER\}\}/g, researcher)
    .replace(/\{\{CREATED\}\}/g, new Date().toISOString());
  
  // Parse and add transcripts
  const configObj = yaml.load(config) as any;
  configObj.transcripts = transcripts.map(path => ({
    path,
    status: 'pending',
    current_phase: null
  }));
  
  const configPath = join(projectPath, 'rta_config.yaml');
  await fs.writeFile(configPath, yaml.dump(configObj, { indent: 2 }));
  filesCreated.push('rta_config.yaml');
  
  // 4. Create project_state.json
  const projectState = {
    version: '1.0',
    project_name,
    created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    current_phase: null,
    phases: {}
  };
  
  const statePath = join(projectPath, 'project_state.json');
  await fs.writeFile(statePath, JSON.stringify(projectState, null, 2));
  filesCreated.push('project_state.json');
  
  return {
    success: true,
    project_path: projectPath,
    config_path: configPath,
    files_created: filesCreated,
    message: `Project '${project_name}' created with ${transcripts.length} transcripts`,
    next_step: 'Call init to get critical instructions, then phase2_methodology to load methodology'
  };
}

async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
```

**Fil:** `src/core/project_config.ts`

```typescript
/**
 * ProjectConfig - Reads and manages rta_config.yaml
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import * as yaml from 'js-yaml';

export interface RtaConfig {
  project: {
    name: string;
    researcher: string;
    created: string;
    last_updated: string;
  };
  methodology: {
    general: string[];
    phases: Record<string, string[]>;
    epistemology: string[];
  };
  transcripts: {
    path: string;
    status: string;
    current_phase: string | null;
  }[];
  state: {
    current_phase: string | null;
    started_at: string | null;
  };
}

export class ProjectConfig {
  private config: RtaConfig;
  private configPath: string;
  
  constructor(configPath: string) {
    this.configPath = configPath;
  }
  
  async load(): Promise<RtaConfig> {
    const content = await fs.readFile(this.configPath, 'utf-8');
    this.config = yaml.load(content) as RtaConfig;
    return this.config;
  }
  
  async save(): Promise<void> {
    this.config.project.last_updated = new Date().toISOString();
    await fs.writeFile(this.configPath, yaml.dump(this.config, { indent: 2 }));
  }
  
  getMethodologyPath(): string {
    return join(dirname(this.configPath), 'methodology');
  }
  
  getPhaseDocuments(phase: string): string[] {
    return this.config.methodology.phases[phase] || [];
  }
  
  getGeneralDocuments(): string[] {
    return this.config.methodology.general;
  }
}
```

---

### STEG 1: Skapa methodology/ struktur (30 min)

**Filer att skapa:**

```bash
# Skapa mappar
mkdir -p <PROJECT_ROOT>/methodology
mkdir -p <PROJECT_ROOT>/methodology/epistemology
mkdir -p <PROJECT_ROOT>/docs/mcp-usage
```

**Flytta/kopiera filer:**

```bash
# Generella dokument - REDAN GJORT
# KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md finns redan i methodology/

# Fas-specifika dokument - REDAN GJORT
# phase1_familiarization.md till phase6_producing_report.md finns redan i methodology/

# Epistemologi - REDAN GJORT
# epistemology/*.md finns redan i methodology/epistemology/
```

**Ta bort utdaterade filer:**

```bash
rm methodology/coding_manual.md
rm methodology/lenses_operationalized.md
```

---

### STEG 2: Skapa nya filer (1-2 tim)

#### 2.1 methodology/rta_overview.md

```markdown
# RTA Overview - AI-Augmented Reflexive Thematic Analysis

## Vad är RTA?

Reflexive Thematic Analysis (Braun & Clarke, 2006, 2019, 2022) är en kvalitativ 
analysmetod för att identifiera mönster (teman) i data.

## AI-Augmented RTA

Denna implementation använder AI (Claude) som **dialogpartner** i kodningsprocessen,
där forskaren behåller full tolkningsauktoritet.

## Faser

| Fas | Namn | MCP-verktyg |
|-----|------|-------------|
| 1 | Familiarization | (manuell) |
| 2a | Initial Coding | phase2_code_start, code_read_next, code_write_segment |
| 2b | Critical Review | phase2b_start, phase2b_review (kommande) |
| 3 | Generating Themes | phase3_start (kommande) |
| 4 | Reviewing Themes | (kommande) |
| 5 | Defining & Naming | (kommande) |
| 6 | Producing Report | (kommande) |

## Epistemologisk grund

- **Konstruktionistisk**: Data representerar tolkningar, inte objektiv sanning
- **Primärt induktiv**: Koder växer från data
- **Semantisk + latent**: Både explicita och underliggande meningar

## Kritiska principer

1. **Forskaren har tolkningsauktoritet** - AI föreslår, forskaren beslutar
2. **Reflexivitet** - Dokumentera analytiska beslut
3. **Transparency** - Visa hur teman växer fram från data
```

#### 2.2 methodology/phase2b_critical_review.md

```markdown
# Phase 2b: Critical Coding Review

## Syfte

Phase 2b är en **forskardriven kritisk granskning** av semi-automatiserad kodning.
Den sker mellan Phase 2a (initial coding) och Phase 3 (theme generation).

## Nyckel-frågor

För varje kodat segment, fråga:

1. **Segmentgränser**: Är segmentet koherent avgränsat eller bör det delas?
2. **Kodkorrekthet**: Är koderna korrekta och tillräckliga?
3. **Kodrevision**: Vilka koder ska läggas till/tas bort/förfinas?
4. **Analytiska observationer**: Vad framträder som mönster? (utan prematur tematisering!)

## Workflow

```
Phase 2a: Semi-automated coding (AI föreslår koder)
    ↓
Phase 2b: CRITICAL REVIEW (forskaren granskar aktivt)
    - Segmentgränser korrekta?
    - Koder korrekta och tillräckliga?
    - Lägg till/ta bort/förfina koder
    - Reflexiv not om processen
    ↓
Phase 3: Generating themes
```

## Reflexiv not-format

```markdown
## VAD HÄNDER I SEGMENTET?
[Kort beskrivning av innehållet]

## VAD NOTERAR JAG?
[Analytiska observationer - mönster, överraskningar, kopplingar]
[Kodningsbeslut och motiveringar]
```

## Viktigt: Undvik prematur tematisering

Phase 2b handlar om att **granska kodning**, INTE om att börja gruppera koder 
till teman. Det är Phase 3.

Tecken på prematur tematisering:
- ❌ "Detta hänger ihop med X som bildar ett tema..."
- ❌ "Jag ser ett mönster som jag kallar Y..."

Rätt i Phase 2b:
- ✓ "Jag noterar att flera segment nämner Z"
- ✓ "Koden X återkommer - värd att uppmärksamma"
```

#### 2.3 methodology/fallback-summary.md

```markdown
# RTA Methodology - Condensed Summary

## KRITISKA REGLER

1. FORSKAREN har tolkningsauktoritet - AI föreslår, forskare beslutar
2. KODER växer från data (induktivt primärt)
3. SEGMENT är semantiska enheter (1-20 rader med koherent innehåll)
4. KODFORMAT: #kod_beskrivning__lins1 (understreck, dubbelt före lins)

## FAS 2a: INITIAL CODING

- Läs chunk (60-100 rader)
- Identifiera semantiska segment
- Föreslå koder för varje segment
- Forskaren godkänner/modifierar/avvisar

## KODFORMAT

```
#"in_vivo_uttryck"__lins1       # In vivo med citattecken
#beskrivande_kod__lins2         # Beskrivande kod
#LATENT_tolkning__lins3         # Latent kod (VERSALER)
```

## TRE LINSER

- Lins 1: Elevers AI-användning (konstruktioner)
- Lins 2: Lärares praktiker och attityder
- Lins 3: AI:s påverkan på lärande
```

#### 2.4 docs/mcp-usage/init-instructions.md

```markdown
# Critical Instructions for Claude Desktop - qualitative-analysis-rta

## DU MÅSTE FÖLJA DESSA REGLER:

### REGEL 1: Anropa MCP-verktyg direkt
- ALDRIG använd bash, find, ls, cat, python3
- MCP-verktyg har FULL åtkomst till alla filer på användarens dator
- Anropa verktyg DIREKT med sökvägen användaren ger

### REGEL 2: Filer behöver INTE laddas upp
- MCP-servern körs på användarens dator
- Den kan läsa /path/to/data/... direkt
- SÄGG ALDRIG "ladda upp filen" eller "filen är inte tillgänglig"

### REGEL 3: Korrekt syntax

**RÄTT:**
```
code_start({
  file_path: "/path/to/data/.../transkript.md"
})
```

**FEL:**
```
find /mnt -name "*.md"
ls /path/to/dir/...
"Filen måste laddas upp"
```

### REGEL 4: Forskaren har tolkningsauktoritet
- DU föreslår koder - FORSKAREN beslutar
- Fråga ALLTID innan du skriver koder
- Respektera forskarens ändringar utan att ifrågasätta

### REGEL 5: Använd kodformat från kodningsmanual
- Läs methodology/KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md
- Följ exakt format: #kod__lins1
- In vivo: #"uttryck"__lins1
- Latent: #LATENT_tolkning__lins1
```

---

### STEG 3: Implementera MethodologyLoader (1-2 tim)

**Fil:** `src/core/methodology_loader.ts`

```typescript
/**
 * MethodologyLoader - Loads RTA methodology documents for Claude Desktop
 * 
 * Pattern from assessment-mcp adapted for RTA phases.
 * 
 * Usage:
 *   const loader = new MethodologyLoader();
 *   const phase2a = await loader.loadPhase2a();
 *   const codingManual = await loader.loadDocument('coding_manual.md');
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MethodologyLoader {
  private readonly DEFAULT_PATH: string;
  
  // Generella dokument som laddas vid session-start
  private readonly GENERAL_FILES = [
    'rta_overview.md',
    'KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md',
  ];
  
  // Fas-specifika dokument
  private readonly PHASE_FILES: Record<string, string> = {
    'phase1': 'phase1_familiarization.md',
    'phase2a': 'phase2a_initial_coding.md',
    'phase2b': 'phase2b_critical_review.md',
    'phase3': 'phase3_generating_themes.md',
    'phase4': 'phase4_reviewing_themes.md',
    'phase5': 'phase5_defining_naming.md',
    'phase6': 'phase6_producing_report.md',
  };
  
  constructor(methodologyPath?: string) {
    this.DEFAULT_PATH = methodologyPath || 
      process.env.METHODOLOGY_PATH || 
      join(__dirname, '../../methodology');
  }
  
  /**
   * Load all general methodology documents
   */
  async load(): Promise<string> {
    const sections: string[] = [];
    
    for (const file of this.GENERAL_FILES) {
      try {
        const content = await this.loadDocument(file);
        sections.push(content);
      } catch (error) {
        console.error(`[MethodologyLoader] Failed to load ${file}:`, error);
      }
    }
    
    if (sections.length === 0) {
      return this.getFallback();
    }
    
    return sections.join('\n\n---\n\n');
  }
  
  /**
   * Load a specific document by filename
   */
  async loadDocument(filename: string): Promise<string> {
    const filePath = join(this.DEFAULT_PATH, filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.formatSection(filename, content);
    } catch (error) {
      console.error(`[MethodologyLoader] Document not found: ${filePath}`);
      throw error;
    }
  }
  
  /**
   * Load Phase 1: Familiarization methodology
   */
  async loadPhase1(): Promise<string> {
    return this.loadPhaseDocument('phase1');
  }
  
  /**
   * Load Phase 2a: Initial Coding methodology
   */
  async loadPhase2a(): Promise<string> {
    return this.loadPhaseDocument('phase2a');
  }
  
  /**
   * Load Phase 2b: Critical Coding Review methodology
   */
  async loadPhase2b(): Promise<string> {
    return this.loadPhaseDocument('phase2b');
  }
  
  /**
   * Load Phase 3: Generating Themes methodology
   */
  async loadPhase3(): Promise<string> {
    return this.loadPhaseDocument('phase3');
  }
  
  /**
   * Load Phase 4: Reviewing Themes methodology
   */
  async loadPhase4(): Promise<string> {
    return this.loadPhaseDocument('phase4');
  }
  
  /**
   * Load Phase 5: Defining & Naming methodology
   */
  async loadPhase5(): Promise<string> {
    return this.loadPhaseDocument('phase5');
  }
  
  /**
   * Load Phase 6: Producing Report methodology
   */
  async loadPhase6(): Promise<string> {
    return this.loadPhaseDocument('phase6');
  }
  
  /**
   * Load epistemological guide
   */
  async loadEpistemology(
    type: 'constructionist' | 'orientation' | 'inductive_deductive' | 'semantic_latent'
  ): Promise<string> {
    const filename = `epistemology/${type}.md`;
    return this.loadDocument(filename);
  }
  
  /**
   * Load lens-specific operationalization
   * NOTE: Lens information is now part of the integrated KODNINGSMANUAL
   */
  async loadLens(lensNumber: 1 | 2 | 3): Promise<string> {
    const content = await this.loadDocument(
      'KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md'
    );
    // Lens info is integrated in the KODNINGSMANUAL
    return content;
  }
  
  /**
   * Check which methodology files are available
   */
  async checkAvailability(): Promise<{
    available: string[];
    missing: string[];
  }> {
    const allFiles = [
      ...this.GENERAL_FILES,
      ...Object.values(this.PHASE_FILES),
    ];
    
    const available: string[] = [];
    const missing: string[] = [];
    
    for (const file of allFiles) {
      const filePath = join(this.DEFAULT_PATH, file);
      try {
        await fs.access(filePath);
        available.push(file);
      } catch {
        missing.push(file);
      }
    }
    
    return { available, missing };
  }
  
  /**
   * Get condensed fallback if main files unavailable
   */
  async getFallback(): Promise<string> {
    try {
      return await this.loadDocument('fallback-summary.md');
    } catch {
      return this.getHardcodedFallback();
    }
  }
  
  /**
   * Get list of available documents for progressive loading
   */
  getDocumentList(phase: string): string[] {
    switch (phase) {
      case 'phase2a':
        return [
          'KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md',
          'phase2a_initial_coding.md'
        ];
      case 'phase2b':
        return ['phase2b_critical_review.md'];
      case 'phase3':
        return ['phase3_generating_themes.md'];
      default:
        return this.GENERAL_FILES;
    }
  }
  
  // Private methods
  
  private async loadPhaseDocument(phase: string): Promise<string> {
    const filename = this.PHASE_FILES[phase];
    if (!filename) {
      throw new Error(`Unknown phase: ${phase}`);
    }
    
    try {
      return await this.loadDocument(filename);
    } catch {
      return this.getPhaseFallback(phase);
    }
  }
  
  private formatSection(filename: string, content: string): string {
    return `<!-- METHODOLOGY: ${filename} -->\n\n${content}`;
  }
  
  private getPhaseFallback(phase: string): string {
    const fallbacks: Record<string, string> = {
      'phase2a': `
# Phase 2a: Initial Coding (Fallback)

1. Read transcript chunk (60-100 lines)
2. Identify semantic segments (1-20 lines)
3. Propose codes for each segment
4. Researcher approves/modifies/rejects
5. Code format: #kod__lins1
`,
      'phase2b': `
# Phase 2b: Critical Review (Fallback)

Review each coded segment:
1. Are segment boundaries correct?
2. Are codes accurate and sufficient?
3. What codes to add/remove/refine?
4. Document analytical observations
`,
      'phase3': `
# Phase 3: Generating Themes (Fallback)

1. Cluster related codes
2. Identify candidate themes
3. Check themes against data
4. Researcher authority on theme naming
`,
    };
    
    return fallbacks[phase] || '# Methodology not available';
  }
  
  private getHardcodedFallback(): string {
    return `
# RTA Methodology - Fallback

## Critical Rules
1. RESEARCHER has interpretive authority
2. CODES grow from data (inductive)
3. SEGMENTS are semantic units (1-20 lines)
4. CODE FORMAT: #kod__lins1

## Workflow
1. Read chunk → Identify segments → Propose codes → Researcher decides
`;
  }
}
```

---

### STEG 4: Implementera init tool + SessionState (1 tim)

**Fil:** `src/core/session_state.ts`

```typescript
/**
 * SessionState - Singleton for tracking session state
 * 
 * Used to enforce that init() is called before other tools.
 */

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
  
  isInitCalled(): boolean {
    return this._initCalled;
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
  
  // Reset for testing
  reset(): void {
    this._initCalled = false;
    this._configPath = null;
  }
}

export const sessionState = SessionState.getInstance();
```

**Fil:** `src/tools/init.ts`

```typescript
/**
 * init - Get critical instructions for Claude Desktop
 * 
 * This tool should be called FIRST to receive instructions
 * on how to properly use qualitative-analysis-rta tools.
 * 
 * CRITICAL: This tool marks the session as initialized.
 * Other tools will REFUSE to run if init hasn't been called.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MethodologyLoader } from '../core/methodology_loader.js';
import { sessionState } from '../core/session_state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface InitResult {
  instructions: string;
  availableTools: string[];
  criticalRules: string[];
  rtaPhases: {
    phase: string;
    name: string;
    status: 'available' | 'coming_soon';
  }[];
  methodologyStatus: {
    available: string[];
    missing: string[];
  };
}

export async function init(): Promise<InitResult> {
  // ✅ CRITICAL: Mark session as initialized
  sessionState.markInitCalled();
  
  // Load instructions from file
  let instructions: string;
  try {
    const instructionsPath = join(__dirname, '../../docs/mcp-usage/init-instructions.md');
    instructions = await fs.readFile(instructionsPath, 'utf-8');
  } catch (error) {
    instructions = `# Critical Instructions

1. NEVER use bash/find/ls/cat - use MCP tools directly
2. Files do NOT need to be uploaded - MCP has full file access
3. RESEARCHER has interpretive authority - propose codes, don't decide
4. Use coding manual format: #kod__lins1
`;
  }
  
  // Check methodology availability
  const methodologyLoader = new MethodologyLoader();
  const methodologyStatus = await methodologyLoader.checkAvailability();
  
  return {
    instructions,
    
    availableTools: [
      // Core tools (no prefix)
      'project_setup - Create new RTA project structure',
      'init - Get these instructions (call FIRST!)',
      'add_line_index - Add permanent line indices to transcript',
      'methodology_load - Load methodology documents for any phase',
      
      // Phase 2a tools (prefix: phase2a-coding:)
      'phase2a-coding:code_start - Initialize coding session',
      'phase2a-coding:code_read_next - Read next chunk for coding',
      'phase2a-coding:code_write_segment - Write codes for segment(s)',
      'phase2a-coding:code_skip_chunk - Skip chunk without codeable content',
      'phase2a-coding:code_status - Show coding progress',
      'phase2a-coding:code_verify - Verify STATUS matches file content',
      'phase2a-coding:code_reset_status - Reset STATUS to uncoded state',
      'phase2a-coding:code_clear_all - Remove all coding from file',
      'phase2a-coding:code_delete_segment - Delete specific segment',
    ],
    
    criticalRules: [
      'RESEARCHER maintains interpretive authority - propose codes, researcher decides',
      'NEVER use bash/find/ls/cat - MCP tools have full file access',
      'NEVER say "upload the file" - MCP reads files directly',
      'Use coding manual format: #kod__lins1 (underscore, double before lens)',
      'In vivo codes: #"uttryck"__lins1 (with quotes)',
      'Latent codes: #LATENT_tolkning__lins1 (uppercase prefix)',
    ],
    
    rtaPhases: [
      { phase: '1', name: 'Familiarization', status: 'coming_soon' },
      { phase: '2a', name: 'Initial Coding', status: 'available' },
      { phase: '2b', name: 'Critical Review', status: 'coming_soon' },
      { phase: '3', name: 'Generating Themes', status: 'coming_soon' },
      { phase: '4', name: 'Reviewing Themes', status: 'coming_soon' },
      { phase: '5', name: 'Defining & Naming', status: 'coming_soon' },
      { phase: '6', name: 'Producing Report', status: 'coming_soon' },
    ],
    
    methodologyStatus,
  };
}
```

---

### STEG 5: Implementera methodology_load tool (1 tim)

**Fil:** `src/tools/methodology_load.ts`

```typescript
/**
 * methodology_load - Generic methodology loader for any phase
 * 
 * Reads from rta_config.yaml to determine which documents to load.
 * Supports progressive loading (one document at a time).
 * 
 * CRITICAL: Requires init() to be called first.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import * as yaml from 'js-yaml';
import { sessionState } from '../core/session_state.js';

export interface MethodologyLoadParams {
  config_path: string;        // Path to rta_config.yaml
  phase: string;              // e.g., "phase2a", "phase2b", "phase3"
  document_index?: number;    // For progressive loading (0, 1, 2...)
}

export interface MethodologyLoadResult {
  document: {
    name: string;
    content: string;
    size_chars: number;
  };
  progress: {
    current_index: number;
    total_documents: number;
    remaining: string[];
  };
  next_action: string;
}

export async function methodologyLoad(
  args: MethodologyLoadParams
): Promise<MethodologyLoadResult> {
  // 🛑 CRITICAL: Require init first
  sessionState.requireInit();
  
  const { config_path, phase, document_index = 0 } = args;
  
  // 1. Load config
  const configContent = await fs.readFile(config_path, 'utf-8');
  const config = yaml.load(configContent) as any;
  
  // 2. Get documents for phase
  const phaseDocs = config.methodology?.phases?.[phase] || [];
  
  if (phaseDocs.length === 0) {
    throw new Error(`No methodology documents configured for phase: ${phase}`);
  }
  
  if (document_index >= phaseDocs.length) {
    throw new Error(`document_index ${document_index} out of range (0-${phaseDocs.length - 1})`);
  }
  
  // 3. Load specific document
  const methodologyPath = join(dirname(config_path), 'methodology');
  const docName = phaseDocs[document_index];
  const content = await fs.readFile(join(methodologyPath, docName), 'utf-8');
  
  // 4. Build progress info
  const remaining = phaseDocs.slice(document_index + 1);
  let nextAction: string;
  
  if (remaining.length === 0) {
    nextAction = `KLART! Alla metodologi-dokument för ${phase} laddade. Redo att fortsätta.`;
  } else {
    nextAction = `VIKTIGT: VISA HELA document.content för forskaren (SAMMANFATTA INTE!). ` +
      `Fråga sedan: "Ok att fortsätta till ${remaining[0]}?" ` +
      `Vänta på svar. Anropa sedan med document_index=${document_index + 1}`;
  }
  
  return {
    document: {
      name: docName,
      content,
      size_chars: content.length,
    },
    progress: {
      current_index: document_index,
      total_documents: phaseDocs.length,
      remaining,
    },
    next_action: nextAction,
  };
}
```

---

### STEG 6: Modifiera code_start för metodologi (30 min)

**Fil:** `src/tools/code_start.ts` (modifiera befintlig)

Lägg till i slutet av `codeStart` funktionen:

```typescript
// ... existing code ...

// NEW: Load methodology if requested
let methodology: string | undefined;
let codingManual: string | undefined;

if (config?.load_methodology !== false) {  // Default: true
  const loader = new MethodologyLoader();
  
  try {
    methodology = await loader.loadPhase2a();
  } catch (error) {
    console.error('[code_start] Failed to load Phase 2a methodology:', error);
  }
  
  try {
    codingManual = await loader.loadDocument(
      'KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md'
    );
  } catch (error) {
    console.error('[code_start] Failed to load coding manual:', error);
  }
}

return {
  status: 'ready',
  total_lines: totalLines,
  estimated_chunks: Math.ceil(totalLines / chunkSize),
  chunk: {
    number: chunk.number,
    lines: `${chunk.startLine + 1}-${chunk.endLine + 1}`,
    text: chunk.text
  },
  // NEW: Include methodology
  methodology,
  coding_manual: codingManual,
  instructions: `
KRITISKT: Läs methodology och coding_manual innan du föreslår koder.
- Forskaren har tolkningsauktoritet
- Kodformat: #kod__lins1
- In vivo: #"uttryck"__lins1
- Latent: #LATENT_tolkning__lins1
  `.trim(),
};
```

---

### STEG 7: Uppdatera server.ts (1 tim)

Lägg till nya verktyg i `server.ts`:

```typescript
// Imports
import { init } from './tools/init.js';
import { projectSetup } from './tools/project_setup.js';
import { methodologyLoad } from './tools/methodology_load.js';

// I tools array:

// === CORE TOOLS (no prefix) ===
{
  name: 'project_setup',
  description:
    'Create a new RTA project structure. ' +
    'Creates project folder with rta_config.yaml, methodology/, and project_state.json. ' +
    'CALL THIS FIRST when starting a new research project.',
  inputSchema: {
    type: 'object',
    properties: {
      project_name: {
        type: 'string',
        description: 'Name of the project (e.g., "AI_Teachers_Focus_Groups")',
      },
      output_path: {
        type: 'string',
        description: 'Path where project folder should be created',
      },
      researcher: {
        type: 'string',
        description: 'Name of the researcher',
      },
      transcripts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of paths to transcript files',
      },
    },
    required: ['project_name', 'output_path', 'researcher', 'transcripts'],
  },
},
{
  name: 'init',
  description:
    'CALL THIS FIRST! Returns critical instructions for using qualitative-analysis-rta tools. ' +
    'You MUST follow these instructions. ' +
    'RESEARCHER has interpretive authority.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
},
{
  name: 'methodology_load',
  description:
    'Load methodology documents for any phase. ' +
    'CRITICAL: SHOW full document.content to researcher (do NOT summarize!). ' +
    'Start with document_index=0, ask "Ok?", wait for response, then document_index=1, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      config_path: {
        type: 'string',
        description: 'Path to rta_config.yaml',
      },
      phase: {
        type: 'string',
        description: 'Phase to load methodology for (e.g., "phase2a", "phase2b", "phase3")',
      },
      document_index: {
        type: 'number',
        description: '0-based index for progressive loading (default: 0)',
      },
    },
    required: ['config_path', 'phase'],
  },
},

// === PHASE 2a TOOLS (prefix: phase2a-coding:) ===
// Note: All existing code_* tools are renamed to phase2a_code_*
// and registered with prefix 'phase2a-coding:'

// I switch statement:
case 'project_setup':
  result = await projectSetup(args as any);
  break;

case 'init':
  result = await init();
  break;

case 'methodology_load':
  result = await methodologyLoad(args as any);
  break;
```

---

### STEG 8: Konfigurera Nextcloud-sync (10 min)

1. I Nextcloud Desktop-klient, lägg till selektiv sync för:
   ```
   <PROJECT_ROOT>/methodology/
   ```

2. Synka till:
   ```
   /path/to/data/AIED_Tools/qualitative-analysis-rta_Methodology/
   ```

3. Denna mapp kan sedan laddas upp till Claude Project Knowledge om önskat (men är nu OPTIONAL).

---

## 5. Testing Checklist

### 5.1 Unit Tests

- [ ] `MethodologyLoader.load()` returnerar generell metodologi
- [ ] `MethodologyLoader.loadPhase2a()` returnerar Phase 2a
- [ ] `MethodologyLoader.loadDocument('KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md')` fungerar
- [ ] `MethodologyLoader.checkAvailability()` returnerar korrekt status
- [ ] Fallback fungerar när filer saknas

### 5.2 Integration Tests

- [ ] `init()` returnerar instruktioner + tillgängliga verktyg
- [ ] `phase2_methodology(0)` laddar första dokumentet
- [ ] `phase2_methodology(1)` laddar andra dokumentet
- [ ] `code_start()` inkluderar metodologi i response
- [ ] Hela workflow: init → phase2_methodology → code_start → code_read_next

### 5.3 Claude Desktop Tests

- [ ] Claude anropar `init` först och följer instruktioner
- [ ] Claude visar metodologi-innehåll (sammanfattar INTE)
- [ ] Claude använder kodformat från manual
- [ ] Forskaren kan godkänna/avvisa kodförslag

---

## 6. Migration Strategy

### 6.1 Backward Compatibility

- Befintliga verktyg fungerar som tidigare
- `methodology` och `coding_manual` i `code_start` response är ADDERADE, inte ersättning
- Gamla transkript med STATUS fungerar fortfarande

### 6.2 Deprecation Plan

| Item | Status | Plan |
|------|--------|------|
| `docs/methodology/` | Deprecated | Behåll som symlink i v0.3.0, ta bort i v0.4.0 |
| Claude Project Knowledge | Optional | Kan fortfarande användas, men inte nödvändigt |
| `config.segment_size` | Deprecated | Använd `config.chunk_size` istället |

---

## 7. Timeline

| Phase | Effort | Target |
|-------|--------|--------|
| STEG 0: Project Setup Infrastructure | 1 tim | Dag 1 |
| STEG 1: Skapa methodology/ struktur | 30 min | Dag 1 |
| STEG 2: Skapa nya filer | 1-2 tim | Dag 1 |
| STEG 3: MethodologyLoader | 1-2 tim | Dag 1-2 |
| STEG 4: init tool + SessionState | 1 tim | Dag 2 |
| STEG 5: methodology_load | 1 tim | Dag 2 |
| STEG 6: Modifiera code_start | 30 min | Dag 2 |
| STEG 7: Uppdatera server.ts | 1 tim | Dag 2 |
| STEG 8: Nextcloud-sync | 10 min | Dag 2 |
| Testing | 2-3 tim | Dag 3 |
| **TOTAL** | **~12 tim** | **3 dagar** |

---

## 8. Success Criteria

✅ `templates/rta_config.yaml` finns med konfigurerbara methodology-dokument  
✅ `project_setup` tool skapar projektstruktur i Nextcloud  
✅ `methodology/` finns på toppnivå med alla dokument  
✅ `methodology_load` tool (generisk) laddar metodologi baserat på fas + yaml config  
✅ `init` tool returnerar kritiska instruktioner  
✅ `session_state.ts` enforcerar att init() måste anropas först  
✅ Core tools (no prefix): init, project_setup, add_line_index, methodology_load  
✅ Phase 2a tools (prefix `phase2a-coding:`): code_start, code_read_next, etc.  
✅ Claude Desktop följer instruktioner utan Project Knowledge  
✅ Nextcloud synkar `methodology/` automatiskt  
✅ Befintliga verktyg fungerar oförändrat (bara renamed)  

---

## 9. Open Questions

### 9.1 Lens-parameter - RESOLVED

**Q:** Ska `code_start` ha en `lens` parameter för att ladda lins-specifik metodologi?

**DECISION:** Nej - lens information är en del av methodology content (KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md), inte MCP-ansvar. Detta håller MCP generiskt och flexibelt för olika forskningsdesigns.

### 9.2 Phase 2b Tools

**Q:** När ska Phase 2b tools implementeras?

**Recommendation:** Efter v0.3.0 är stabil. Se RFC-001 för design.

---

## 10. References

- RFC-003: Methodology Separation Architecture
- RFC-001: Reflexive Note Feature
- RFC-004: Phase 2 Terminology Alignment
- assessment-mcp: `/src/core/methodology_loader.ts`, `/src/tools/init.ts`
- Phase_2b_Critical_Coding_Review_DRAFT.md

---

**Document Status:** Ready for Implementation  
**Next Action:** Execute STEG 0-8  
**Implementation Target:** v0.3.0

---

*RFC-005 created 2026-01-11, updated 2026-01-11*
