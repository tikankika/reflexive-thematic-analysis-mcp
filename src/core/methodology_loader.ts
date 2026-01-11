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
    'coding_manual.md',
    'lenses_operationalized.md',
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
      'fallback-summary.md',
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
          'coding_manual.md',
          'lenses_operationalized.md',
          'phase2a_initial_coding.md',
        ];
      case 'phase2b':
        return ['phase2b_critical_review.md'];
      case 'phase3':
        return ['phase3_generating_themes.md'];
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

1. Read transcript chunk (60-100 lines)
2. Identify semantic segments (1-20 lines)
3. Propose codes for each segment
4. Researcher approves/modifies/rejects
5. Code format: #code__lens1
`,
      phase2b: `
# Phase 2b: Critical Review (Fallback)

Review each coded segment:
1. Are segment boundaries correct?
2. Are codes accurate and sufficient?
3. What codes to add/remove/refine?
4. Document analytical observations
`,
      phase3: `
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
4. CODE FORMAT: #code__lens1

## Workflow
1. Read chunk -> Identify segments -> Propose codes -> Researcher decides
`;
  }
}
