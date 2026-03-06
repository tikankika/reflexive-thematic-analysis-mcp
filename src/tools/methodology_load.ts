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

export interface PhaseScaffolding {
  work_steps: string[];
  reflection_questions: string[];
  ai_countermeasures: string[];
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
  phase_scaffolding?: PhaseScaffolding;
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
    nextAction = `DONE! All methodology documents for ${phase} loaded. Ready to continue.`;
  } else {
    nextAction =
      `IMPORTANT: SHOW the FULL document.content to the researcher (DO NOT SUMMARISE!). ` +
      `Then ask: "OK to continue to ${remaining[0]}?" ` +
      `Wait for response. Then call with document_index=${document_index + 1}`;
  }

  // Add phase scaffolding for phases 4-6 (only with last document)
  const scaffolding = remaining.length === 0
    ? getPhaseScaffolding(phase)
    : undefined;

  const result: MethodologyLoadResult = {
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

  if (scaffolding) {
    result.phase_scaffolding = scaffolding;
  }

  return result;
}

/**
 * Return structured work scaffolding for phases 4-6.
 * Phases 1-3 return undefined (no scaffolding needed — they have dedicated tools).
 */
function getPhaseScaffolding(phase: string): PhaseScaffolding | undefined {
  switch (phase) {
    case 'phase4':
      return {
        work_steps: [
          '1. Load Phase 3 code extraction (read_file) — review all codes across transcripts',
          '2. Researcher identifies initial candidate themes by grouping related codes',
          '3. For each candidate theme: name it, list its codes, describe what it captures',
          '4. Create a thematic map showing relationships between themes',
          '5. Check: does every code have a home? Are there orphan codes that need attention?',
          '6. Save candidate themes to file (write_file) for next session',
        ],
        reflection_questions: [
          'Are these themes driven by patterns in the data, or by your research questions? Both are valid, but you should know which.',
          'Could any of these candidate themes be collapsed into one? Or does one theme actually contain two distinct ideas?',
          'Are there codes that resist categorization? What do they tell you?',
          'How do these themes relate to each other — are any hierarchical, overlapping, or in tension?',
        ],
        ai_countermeasures: [
          'WARNING: AI tends to create neat, symmetric theme structures. Real data is messy — resist premature tidiness.',
          'WARNING: AI may propose theme names that sound academic but flatten the data. Prefer names grounded in participant language.',
          'WARNING: Do not let AI "confirm" your themes. If you ask for evaluation, instruct it to argue AGAINST the theme first.',
          'The researcher decides which codes group together. AI can organize and display, but grouping is an interpretive act.',
        ],
      };

    case 'phase5':
      return {
        work_steps: [
          '1. Take each candidate theme from Phase 4 and test it against the data',
          '2. Re-read the coded extracts for each theme — do they form a coherent pattern?',
          '3. Define each theme: what story does it tell? What is its scope and boundary?',
          '4. Name each theme with a concise, evocative label (not just a topic descriptor)',
          '5. Write a detailed description for each theme: central concept, scope, and how it relates to research questions',
          '6. Revise the thematic map — collapse, split, or discard themes as needed',
          '7. Save refined themes and definitions to file (write_file)',
        ],
        reflection_questions: [
          'Can you describe each theme in 1-2 sentences? If not, it may not be a coherent theme yet.',
          'Does each theme tell a story, or is it just a topic or domain? Themes should capture something about the data.',
          'Are there overlaps between themes that indicate they should be merged or more clearly differentiated?',
          'If you removed one theme entirely, would something important be lost? This tests whether each theme carries unique weight.',
        ],
        ai_countermeasures: [
          'WARNING: AI may over-polish theme definitions, making them sound finished before they are. Draft definitions should feel provisional.',
          'WARNING: AI favors comprehensive coverage. It is OK to have themes that only capture part of the data — not everything needs to be themed.',
          'WARNING: AI-generated theme names tend toward the generic. Push for names that could only describe YOUR data, not any study on this topic.',
          'Defining themes is the most interpretive act in RTA. The researcher must own every word of the definition.',
        ],
      };

    case 'phase6':
      return {
        work_steps: [
          '1. Select vivid, compelling data extracts that illustrate each theme',
          '2. Write the analytical narrative for each theme — not just description, but interpretation',
          '3. Embed extracts within the narrative (extracts illustrate, they do not replace analysis)',
          '4. Connect themes back to research questions and existing literature',
          '5. Write the overall narrative that weaves themes together',
          '6. Review: does the report tell a coherent, convincing story grounded in data?',
          '7. Save report draft to file (write_file)',
        ],
        reflection_questions: [
          'For each extract you selected: why this one and not another? What makes it vivid?',
          'Does your analysis go beyond describing what participants said to interpreting what it means?',
          'Have you made your theoretical framework explicit in the writing?',
          'If a reader unfamiliar with your data read this report, would they understand your themes?',
        ],
        ai_countermeasures: [
          'WARNING: AI writes fluent academic prose that can mask shallow analysis. Every sentence should earn its place through analytical work.',
          'WARNING: AI may default to a "theme 1, theme 2, theme 3" structure. Consider whether a different narrative structure better serves your argument.',
          'WARNING: Do not let AI write the analytical narrative for you. Use it to organize extracts, check citations, and format — the interpretation is yours.',
          'The report is the researcher\'s argument. AI assists with structure and presentation, not with what the data means.',
        ],
      };

    default:
      // Phases 1-3 and unknown phases: no scaffolding
      return undefined;
  }
}
