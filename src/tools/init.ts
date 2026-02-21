/**
 * init - Get critical instructions for Claude Desktop
 *
 * This tool should be called FIRST to receive instructions
 * on how to properly use the qualitative analysis tools.
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
  availableTools: {
    category: string;
    tools: string[];
  }[];
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
  // CRITICAL: Mark session as initialized
  sessionState.markInitCalled();

  // Load instructions from file
  let instructions: string;
  try {
    const instructionsPath = join(
      __dirname,
      '../../docs/mcp-usage/init-instructions.md'
    );
    instructions = await fs.readFile(instructionsPath, 'utf-8');
  } catch (error) {
    instructions = `# Critical Instructions

1. NEVER use bash/find/ls/cat - use MCP tools directly
2. Files do NOT need to be uploaded - MCP has full file access
3. RESEARCHER has interpretive authority - propose codes, don't decide
4. Use coding manual format: #code__lens1
`;
  }

  // Check methodology availability
  const methodologyLoader = new MethodologyLoader();
  const methodologyStatus = await methodologyLoader.checkAvailability();

  return {
    instructions,

    availableTools: [
      {
        category: 'Core (no prefix)',
        tools: [
          'init - Get these instructions (call FIRST!)',
          'list_files - List files in a directory (find transcripts)',
          'read_file - Read contents of any file',
          'project_setup - Create new RTA project structure',
          'add_line_index - Add permanent line indices to transcript',
          'methodology_load - Load methodology documents for any phase',
        ],
      },
      {
        category: 'Phase 2a - Initial Coding (prefix: phase2a_)',
        tools: [
          'code_start - Initialize coding session',
          'code_read_next - Read next chunk for coding',
          'code_write_segment - Write codes for segment(s)',
          'code_skip_chunk - Skip chunk without codeable content',
          'code_status - Show coding progress',
          'code_verify - Verify STATUS matches file content',
          'code_reset_status - Reset STATUS to uncoded state',
          'code_clear_all - Remove all coding from file',
          'code_delete_segment - Delete specific segment',
        ],
      },
      {
        category: 'Phase 2b - Critical Review (prefix: phase2b_)',
        tools: [
          'review_start - Start critical review session',
          'review_next - Get next unreviewed segment',
          'review_read_segment - Read specific segment by index',
          'review_write_note - Write reflexive note for segment',
          'review_revise_codes - Revise codes (add/remove/replace)',
          'review_status - Show review progress',
        ],
      },
    ],

    criticalRules: [
      'RESEARCHER maintains interpretive authority - propose codes, researcher decides',
      'NEVER use bash/find/ls/cat - MCP tools have full file access',
      'NEVER say "upload the file" - MCP reads files directly',
      'Read KODNINGSMANUAL in methodology/ for exact code format',
      'Code format: #kod_beskrivning__rq1_semantisk or __rq1_latent',
      'In vivo codes: #"exakt_citat"__rq1_semantisk (with quotes)',
      'SHOW full methodology content to researcher (do NOT summarize)',
    ],

    rtaPhases: [
      { phase: '1', name: 'Familiarization', status: 'coming_soon' },
      { phase: '2a', name: 'Initial Coding', status: 'available' },
      { phase: '2b', name: 'Critical Review', status: 'available' },
      { phase: '3', name: 'Generating Themes', status: 'coming_soon' },
      { phase: '4', name: 'Reviewing Themes', status: 'coming_soon' },
      { phase: '5', name: 'Defining & Naming', status: 'coming_soon' },
      { phase: '6', name: 'Producing Report', status: 'coming_soon' },
    ],

    methodologyStatus,
  };
}
