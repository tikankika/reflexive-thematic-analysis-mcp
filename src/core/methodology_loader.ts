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

  // General documents loaded at session start
  private readonly GENERAL_FILES = [
    'rta_overview.md',
    '../protocols/coding_protocol_disruptive_3rq.md',
  ];

  // Phase-specific documents
  private readonly PHASE_FILES: Record<string, string> = {
    phase1: 'phase1_familiarization.md',
    phase2a: 'phase2a_initial_coding.md',
    phase2b: 'phase2b_critical_review.md',
    phase3: 'phase3_generating_themes.md',
    phase4: 'phase4_reviewing_themes.md',
    phase5: 'phase5_defining_naming.md',
    phase6: 'phase6_producing_report.md',
  };

  constructor(methodologyPath?: string) {
    this.DEFAULT_PATH =
      methodologyPath ||
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
    type:
      | 'constructionist'
      | 'orientation'
      | 'inductive_deductive'
      | 'semantic_latent'
  ): Promise<string> {
    const filename = `epistemology/${type}.md`;
    return this.loadDocument(filename);
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
          '../protocols/coding_protocol_disruptive_3rq.md',
          'phase2a_initial_coding.md',
        ];
      case 'phase2b':
        return ['phase2b_critical_review.md'];
      case 'phase3':
        return ['phase3_generating_themes.md'];
      case 'phase4':
        return ['phase4_reviewing_themes.md'];
      case 'phase5':
        return ['phase5_defining_naming.md'];
      case 'phase6':
        return ['phase6_producing_report.md'];
      default:
        return this.GENERAL_FILES;
    }
  }

  /**
   * Get the methodology path
   */
  getMethodologyPath(): string {
    return this.DEFAULT_PATH;
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
      phase2a: `
# Phase 2a: Initial Coding (Fallback)
Methodology documents not found. Core workflow:
1. Read transcript chunk
2. Identify semantic segments
3. Propose codes: #code_name__rq1_semantic or #code_name__rq1_latent
4. Researcher approves/modifies/rejects
`,
      phase2b: `
# Phase 2b: Critical Review (Fallback)
Methodology documents not found. Core workflow:
1. Review each coded segment
2. Evaluate codes critically
3. Write reflexive note
4. Revise codes where needed
`,
      phase3: `
# Phase 3: Generating Themes (Fallback)
Methodology documents not found. Core workflow:
1. Review all codes across transcripts
2. Look for patterns of shared meaning
3. Cluster codes into candidate themes
4. Researcher constructs themes — AI proposes, researcher decides
`,
      phase4: `
# Phase 4: Reviewing Themes (Fallback)
Methodology documents not found. Core workflow:
1. Test each theme against coded data (Level One)
2. Test thematic framework against full dataset (Level Two)
3. Reconceptualise, split, merge, or discard themes as needed
`,
      phase5: `
# Phase 5: Defining and Naming Themes (Fallback)
Methodology documents not found. Core workflow:
1. Define what each theme captures and does not capture
2. Articulate the central organizing concept
3. Select data extracts for the report
4. Finalize theme names
`,
      phase6: `
# Phase 6: Producing the Report (Fallback)
Methodology documents not found. Core workflow:
1. Write analytical narrative — interpret, don't describe
2. Integrate data extracts as evidence
3. Weave literature into analysis
4. Document AI transparency
`,
    };

    return fallbacks[phase] || '# Methodology not available for this phase.';
  }

  private getHardcodedFallback(): string {
    return `
# RTA Methodology — Fallback

Methodology documents not found. Critical principles:
1. Researcher has interpretive authority — AI proposes, researcher decides
2. Code format: #code_name__rqN_semantic or #code_name__rqN_latent
3. Methodology loads at each phase — read it fully before proceeding
`;
  }
}
