/**
 * ProjectConfig - Reads and manages rta_config.yaml
 *
 * Provides access to project configuration including:
 * - Methodology document paths
 * - Phase-specific document lists
 * - Transcript tracking
 * - State management
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
    epistemology: {
      load_at_start: boolean;
      documents: string[];
    };
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
  private config: RtaConfig | null = null;
  private configPath: string;

  constructor(configPath: string) {
    this.configPath = configPath;
  }

  /**
   * Load configuration from file
   */
  async load(): Promise<RtaConfig> {
    const content = await fs.readFile(this.configPath, 'utf-8');
    this.config = yaml.load(content) as RtaConfig;
    return this.config;
  }

  /**
   * Save configuration to file
   */
  async save(): Promise<void> {
    if (!this.config) {
      throw new Error('No configuration loaded');
    }
    this.config.project.last_updated = new Date().toISOString();
    await fs.writeFile(this.configPath, yaml.dump(this.config, { indent: 2 }));
  }

  /**
   * Get path to methodology directory
   */
  getMethodologyPath(): string {
    return join(dirname(this.configPath), 'methodology');
  }

  /**
   * Get documents for a specific phase
   */
  getPhaseDocuments(phase: string): string[] {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return this.config.methodology.phases[phase] || [];
  }

  /**
   * Get general methodology documents
   */
  getGeneralDocuments(): string[] {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return this.config.methodology.general;
  }

  /**
   * Get epistemology documents
   */
  getEpistemologyDocuments(): string[] {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return this.config.methodology.epistemology.documents;
  }

  /**
   * Check if epistemology should load at start
   */
  shouldLoadEpistemologyAtStart(): boolean {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return this.config.methodology.epistemology.load_at_start;
  }

  /**
   * Get current configuration
   */
  getConfig(): RtaConfig | null {
    return this.config;
  }

  /**
   * Update current phase
   */
  async setCurrentPhase(phase: string | null): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    this.config.state.current_phase = phase;
    if (phase && !this.config.state.started_at) {
      this.config.state.started_at = new Date().toISOString();
    }
    await this.save();
  }

  /**
   * Update transcript status
   */
  async updateTranscriptStatus(
    transcriptPath: string,
    status: string,
    currentPhase: string | null = null
  ): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }

    const transcript = this.config.transcripts.find(
      (t) => t.path === transcriptPath
    );
    if (transcript) {
      transcript.status = status;
      transcript.current_phase = currentPhase;
      await this.save();
    }
  }
}
