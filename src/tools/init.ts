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
          'write_file - Write content to a file (save analytical work between sessions)',
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
          'review_split_segment - Split segment into two (adjusts notes)',
          'review_merge_segments - Merge two adjacent segments (adjusts notes)',
          'review_status - Show review progress',
        ],
      },
      {
        category: 'Phase 3 - Generating Themes (prefix: phase3_)',
        tools: [
          'extract_codes - Extract all codes from coded transcripts into markdown summary',
        ],
      },
      {
        category: 'Process Logging',
        tools: [
          'log_process_event - Log epistemically significant moment in researcher-AI dialogue',
          'log_session_end - Summarize and close a coding/review session',
        ],
      },
    ],

    criticalRules: [
      'RESEARCHER maintains interpretive authority - propose codes, researcher decides',
      'NEVER use bash/find/ls/cat - MCP tools have full file access',
      'NEVER say "upload the file" - MCP reads files directly',
      'Read coding protocol in protocols/ for exact code format',
      'Code format: #code_description__rq1_semantic or __rq1_latent',
      'In vivo codes: #"exact_quote"__rq1_semantic (with quotes)',
      'SHOW full methodology content to researcher (do NOT summarize)',
      'PROCESS LOGGING: When researcher corrects your patterns, redirects focus, rejects a suggestion, or establishes a convention — call log_process_event. Capture researcher exact words in researcher_words field.',
      'SESSION END: Before ending any coding or review session, call log_session_end with a summary of key analytical decisions.',
    ],

    rtaPhases: [
      { phase: '1', name: 'Familiarization', status: 'coming_soon' },
      { phase: '2a', name: 'Initial Coding', status: 'available' },
      { phase: '2b', name: 'Critical Review', status: 'available' },
      { phase: '3', name: 'Generating Themes', status: 'available' },
      { phase: '4', name: 'Reviewing Themes', status: 'available' },
      { phase: '5', name: 'Defining & Naming', status: 'available' },
      { phase: '6', name: 'Producing Report', status: 'available' },
    ],

    methodologyStatus,
  };
}
