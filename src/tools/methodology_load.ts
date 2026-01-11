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
import { MethodologyLoader } from '../core/methodology_loader.js';

export interface MethodologyLoadParams {
  config_path?: string; // Path to rta_config.yaml (optional if using repo methodology)
  phase: string; // e.g., "phase2a", "phase2b", "phase3"
  document_index?: number; // For progressive loading (0, 1, 2...)
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
  // CRITICAL: Require init first
  sessionState.requireInit();

  const { config_path, phase, document_index = 0 } = args;

  let phaseDocs: string[];
  let methodologyPath: string;

  if (config_path) {
    // Load from project config
    const configContent = await fs.readFile(config_path, 'utf-8');
    const config = yaml.load(configContent) as any;

    phaseDocs = config.methodology?.phases?.[phase] || [];
    methodologyPath = join(dirname(config_path), 'methodology');
  } else {
    // Use default methodology loader (from repo)
    const loader = new MethodologyLoader();
    phaseDocs = loader.getDocumentList(phase);
    methodologyPath = loader.getMethodologyPath();
  }

  if (phaseDocs.length === 0) {
    throw new Error(`No methodology documents configured for phase: ${phase}`);
  }

  if (document_index >= phaseDocs.length) {
    throw new Error(
      `document_index ${document_index} out of range (0-${phaseDocs.length - 1})`
    );
  }

  // Load specific document
  const docName = phaseDocs[document_index];
  const docPath = join(methodologyPath, docName);

  let content: string;
  try {
    content = await fs.readFile(docPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load methodology document: ${docPath}`);
  }

  // Build progress info
  const remaining = phaseDocs.slice(document_index + 1);
  let nextAction: string;

  if (remaining.length === 0) {
    nextAction = `KLART! Alla metodologi-dokument för ${phase} laddade. Redo att fortsätta.`;
  } else {
    nextAction =
      `VIKTIGT: VISA HELA document.content för forskaren (SAMMANFATTA INTE!). ` +
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
