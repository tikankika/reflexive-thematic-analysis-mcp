#!/usr/bin/env node

/**
 * Qualitative Analysis RTA Server (Braun & Clarke Reflexive Thematic Analysis)
 *
 * MCP server for AI-augmented qualitative analysis following Braun & Clarke RTA methodology.
 *
 * Terminology:
 * - CHUNK: Technical reading unit (60-100 lines) for processing large files
 * - SEGMENT: Semantic coding unit (variable size) marked with /segment
 *
 * Tool Categories:
 * - Core (no prefix): init, project_setup, add_line_index, methodology_load
 * - Phase 2a (prefix phase2a_): code_start, code_read_next, code_write_segment, etc.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Core tools
import { init } from './tools/init.js';
import { projectSetup } from './tools/project_setup.js';
import { addLineIndex } from './tools/add_line_index.js';
import { methodologyLoad } from './tools/methodology_load.js';
import { listFiles } from './tools/list_files.js';
import { readFile } from './tools/read_file.js';

// Phase 2a tools
import { codeStart } from './tools/code_start.js';
import { codeReadNext } from './tools/code_read_next.js';
import { codeWriteSegment } from './tools/code_write_segment.js';
import { codeSkipChunk } from './tools/code_skip_chunk.js';
import { codeResetStatus } from './tools/code_reset_status.js';
import { codeVerify } from './tools/code_verify.js';
import { codeClearAll } from './tools/code_clear_all.js';
import { codeDeleteSegment } from './tools/code_delete_segment.js';
import { codeStatus } from './tools/code_status.js';

// Phase 2b tools
import { reviewStart } from './tools/review_start.js';
import { reviewNext } from './tools/review_next.js';
import { reviewReadSegment } from './tools/review_read_segment.js';
import { reviewWriteNote } from './tools/review_write_note.js';
import { reviewReviseCodes } from './tools/review_revise_codes.js';
import { reviewStatus } from './tools/review_status.js';
import { reviewSplitSegment } from './tools/review_split_segment.js';
import { reviewMergeSegments } from './tools/review_merge_segments.js';

// Phase 3 tools
import { extractCodes } from './tools/phase3_extract_codes.js';

/**
 * MCP Server for Qualitative Analysis RTA (Braun & Clarke)
 */
class QualitativeAnalysisRTAServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'reflexive-thematic-analysis-mcp',
        version: '0.5.1',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // === CORE TOOLS (no prefix) ===
        {
          name: 'init',
          description:
            'CALL THIS FIRST! Returns critical instructions for using RTA tools. ' +
            'You MUST follow these instructions. ' +
            'RESEARCHER has interpretive authority - propose codes, researcher decides. ' +
            'NEVER use bash/find/ls/cat - MCP tools have full file access.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'project_setup',
          description:
            'Create a new RTA project structure. ' +
            'Creates project folder with rta_config.yaml, methodology/, and project_state.json. ' +
            'Use this when starting a new research project.',
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
          name: 'add_line_index',
          description:
            'Add permanent line indices to transcript file. Prepares file for coding by adding permanent 4-digit line indices (0001, 0002, ...). These indices are PERMANENT IDENTIFIERS that stay fixed even when /segment markers are added. Run this BEFORE code_start if you want to reference specific lines during coding.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file (.md)',
              },
              config: {
                type: 'object',
                properties: {
                  digits: {
                    type: 'number',
                    description: 'Number of digits for line indices (default: 4)',
                  },
                },
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'methodology_load',
          description:
            'Load methodology documents for any phase. ' +
            'CRITICAL: SHOW full document.content to researcher (do NOT summarize!). ' +
            'Start with document_index=0, ask "Ok?", wait for response, then document_index=1, etc. ' +
            'Requires init() to be called first.',
          inputSchema: {
            type: 'object',
            properties: {
              config_path: {
                type: 'string',
                description: 'Path to rta_config.yaml (optional, uses repo methodology if not provided)',
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
            required: ['phase'],
          },
        },
        {
          name: 'list_files',
          description:
            'List files in a directory. ' +
            'Useful for finding transcripts to analyze. ' +
            'Supports ~ for home directory and optional pattern filter.',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Directory path (supports ~ for home)',
              },
              pattern: {
                type: 'string',
                description: 'File pattern filter (e.g., "*.md" for markdown files)',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'read_file',
          description:
            'Read contents of a file. ' +
            'For transcripts, methodology, or any text file. ' +
            'Supports ~ for home directory.',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'File path (supports ~ for home)',
              },
              max_lines: {
                type: 'number',
                description: 'Limit output to N lines (optional)',
              },
            },
            required: ['path'],
          },
        },
        // === PHASE 2a TOOLS (Initial Coding) ===
        {
          name: 'phase2a_code_start',
          description:
            'Initialize coding session. Creates STATUS frontmatter and returns first chunk (raw text) for coding. Note: A "chunk" is a technical reading unit (60-100 lines). You will mark semantic "segments" with /segment markers when coding. Use this to start coding a new transcript.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file (.md)',
              },
              config: {
                type: 'object',
                properties: {
                  chunk_size: {
                    type: 'number',
                    description: 'Lines per reading chunk (default: 80). Note: This is different from semantic "segments" marked with /segment in output.',
                  },
                  segment_size: {
                    type: 'number',
                    description: '(Deprecated, use chunk_size) Lines per chunk (default: 80)',
                  },
                },
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2a_code_read_next',
          description:
            'Read next uncoded chunk. Returns raw text of next 60-100 lines based on STATUS for coding. Note: A "chunk" is a technical reading unit. You will mark semantic "segments" with /segment markers when coding within each chunk. Use this to continue coding after accepting previous chunk.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2a_code_write_segment',
          description:
            'Write codes for semantic segment(s). A "segment" here is a meaningful coding unit (variable size, marked with /segment). Supports TWO MODES: (1) LEGACY (v0.1.0): single chunk using STATUS boundaries - provide "codes" array. (2) NEW (v0.2.0): multiple small semantic segments with explicit line ranges - provide "segments" array. Use NEW mode when you have identified specific meaningful units (quotes, exchanges, thematic chunks) to code precisely. Use LEGACY mode for standard sequential chunk-based coding.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
              codes: {
                type: 'array',
                items: { type: 'string' },
                description:
                  '[LEGACY MODE - v0.1.0] Array of code strings for current chunk from STATUS (e.g., ["#kod_lins1", "#\\"uttryck\\"_lins1"]). Use this OR segments, not both.',
              },
              segments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    start_line: {
                      type: 'string',
                      description:
                        'Starting line index in 4-digit format (e.g., "0030"). This is the permanent line identifier added by add_line_index, NOT the file line number.',
                    },
                    end_line: {
                      type: 'string',
                      description:
                        'Ending line index in 4-digit format, inclusive (e.g., "0034"). This is the permanent line identifier added by add_line_index, NOT the file line number.',
                    },
                    codes: {
                      type: 'array',
                      items: { type: 'string' },
                      description:
                        'Codes for this specific semantic segment (e.g., ["#kod1_lins1", "#kod2_lins2"]). Can be empty array.',
                    },
                  },
                  required: ['start_line', 'end_line', 'codes'],
                },
                description:
                  '[NEW MODE - v0.2.0] Array of semantic segments to write. Each segment has explicit line range and codes, marked with /segment markers. Segments will be auto-sorted and validated for overlaps. Use this OR codes, not both.',
              },
            },
            required: ['file_path'],
            // Note: Either 'codes' OR 'segments' must be provided (validated in tool)
          },
        },
        {
          name: 'phase2a_code_skip_chunk',
          description:
            'Skip current chunk without coding. Use when chunk contains no codeable content (e.g., facilitator-only talk, meta-organizational content). Marks chunk as processed and advances to next chunk. Updates STATUS and returns progress.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2a_code_reset_status',
          description:
            'Reset STATUS to uncoded state without modifying file content. Use when file was manually cleaned but STATUS is out of sync. Resets Last-coded-line to 0 and Progress to 0/N.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2a_code_verify',
          description:
            'Verify STATUS matches actual file content. Counts /segment markers and compares to STATUS. With fix=true, auto-corrects STATUS based on actual segments found. Use to diagnose and fix STATUS inconsistencies.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
              fix: {
                type: 'boolean',
                description:
                  'Auto-fix STATUS if inconsistencies found (default: false)',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2a_code_clear_all',
          description:
            'Remove ALL coding from file (segments, markers, codes). Preserves line indices and transcript content. Creates automatic backup. Requires confirm: true for safety. Resets STATUS to uncoded state. Use to start over from scratch.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
              confirm: {
                type: 'boolean',
                description: 'REQUIRED: Must be true to proceed (safety check)',
              },
            },
            required: ['file_path', 'confirm'],
          },
        },
        {
          name: 'phase2a_code_delete_segment',
          description:
            'Delete specific segment by line index range. Removes /segment markers, content, and codes for the specified range. Updates STATUS. Use when a specific segment was coded incorrectly.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
              start_index: {
                type: 'string',
                description: 'Starting line index (e.g., "0123")',
              },
              end_index: {
                type: 'string',
                description: 'Ending line index (e.g., "0134")',
              },
            },
            required: ['file_path', 'start_index', 'end_index'],
          },
        },
        {
          name: 'phase2a_code_status',
          description:
            'Show coding progress. Returns current STATUS including segments coded, lines remaining, and progress percentage.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to transcript file',
              },
            },
            required: ['file_path'],
          },
        },
        // === PHASE 2b TOOLS (Critical Review) ===
        {
          name: 'phase2b_review_start',
          description:
            'Start Phase 2b critical review session. Parses coded transcript, creates or resumes review notes file, loads methodology, and returns first segment for review. CRITICAL: Response includes methodology document — you MUST show the FULL methodology to researcher and wait for "Ok" BEFORE reviewing any segments. Do NOT summarize.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file (.md)',
              },
              researcher: {
                type: 'string',
                description: 'Researcher name (default: "researcher")',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2b_review_next',
          description:
            'Get next unreviewed segment. Returns the next segment that has not been reviewed yet, or "complete" if all segments are done.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2b_review_read_segment',
          description:
            'Read a specific segment by its 1-based index. Returns segment text, codes, and any existing review note.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file',
              },
              index: {
                type: 'number',
                description: '1-based segment index',
              },
            },
            required: ['file_path', 'index'],
          },
        },
        {
          name: 'phase2b_review_write_note',
          description:
            'Write a reflexive note for a segment. Creates or updates the researcher\'s analytical observation for the specified segment. This marks the segment as reviewed.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file',
              },
              index: {
                type: 'number',
                description: '1-based segment index',
              },
              note: {
                type: 'string',
                description: 'Reflexive note text (markdown)',
              },
            },
            required: ['file_path', 'index', 'note'],
          },
        },
        {
          name: 'phase2b_review_revise_codes',
          description:
            'Revise codes for a segment. Modifies codes in the transcript file and logs the revision. Actions: "add" (append codes), "remove" (delete codes), "replace" (replace all codes).',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file',
              },
              segment_index: {
                type: 'number',
                description: '1-based segment index',
              },
              action: {
                type: 'string',
                enum: ['add', 'remove', 'replace'],
                description: 'Revision type: add, remove, or replace',
              },
              codes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Codes to add/remove/replace with (e.g., ["#new_code__rq1_semantisk"])',
              },
            },
            required: ['file_path', 'segment_index', 'action', 'codes'],
          },
        },
        {
          name: 'phase2b_review_status',
          description:
            'Show Phase 2b review progress. Returns total segments, reviewed count, remaining, percentage, and revision statistics.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'phase2b_review_split_segment',
          description:
            'Split a segment into two during review. Copies all codes to both new segments. Use when a segment contains two distinct meaning units that should be coded separately. After splitting, use review_revise_codes to adjust codes on each half.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file',
              },
              segment_index: {
                type: 'number',
                description: '1-based index of the segment to split',
              },
              split_at_line: {
                type: 'string',
                description:
                  '4-digit line index — the FIRST line of the second half (e.g., "0045")',
              },
            },
            required: ['file_path', 'segment_index', 'split_at_line'],
          },
        },
        {
          name: 'phase2b_review_merge_segments',
          description:
            'Merge two adjacent segments into one during review. Combines text and deduplicates codes. Use when two consecutive segments belong to the same meaning unit.',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to coded transcript file',
              },
              first_segment_index: {
                type: 'number',
                description: '1-based index of the first segment',
              },
              second_segment_index: {
                type: 'number',
                description:
                  '1-based index of the second segment (must be first_segment_index + 1)',
              },
            },
            required: ['file_path', 'first_segment_index', 'second_segment_index'],
          },
        },
        // === PHASE 3 TOOLS (Generating Themes) ===
        {
          name: 'phase3_extract_codes',
          description:
            'Extract all codes from coded transcripts into a single markdown file. ' +
            'Gathers codes with metadata (source, line reference, research question, level, original text) ' +
            'across all project transcripts. Run this when the researcher is ready to begin Phase 3 ' +
            '(generating themes).',
          inputSchema: {
            type: 'object',
            properties: {
              project_path: {
                type: 'string',
                description:
                  'Path to project directory (contains rta_config.yaml)',
              },
            },
            required: ['project_path'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        switch (name) {
          // === CORE TOOLS ===
          case 'init':
            result = await init();
            break;

          case 'project_setup':
            result = await projectSetup(args as any);
            break;

          case 'add_line_index':
            result = await addLineIndex(args as any);
            break;

          case 'methodology_load':
            result = await methodologyLoad(args as any);
            break;

          case 'list_files':
            result = await listFiles(args as any);
            break;

          case 'read_file':
            result = await readFile(args as any);
            break;

          // === PHASE 2a TOOLS ===
          case 'phase2a_code_start':
            result = await codeStart(args as any);
            break;

          case 'phase2a_code_read_next':
            result = await codeReadNext(args as any);
            break;

          case 'phase2a_code_write_segment':
            result = await codeWriteSegment(args as any);
            break;

          case 'phase2a_code_skip_chunk':
            result = await codeSkipChunk(args as any);
            break;

          case 'phase2a_code_reset_status':
            result = await codeResetStatus(args as any);
            break;

          case 'phase2a_code_verify':
            result = await codeVerify(args as any);
            break;

          case 'phase2a_code_clear_all':
            result = await codeClearAll(args as any);
            break;

          case 'phase2a_code_delete_segment':
            result = await codeDeleteSegment(args as any);
            break;

          case 'phase2a_code_status':
            result = await codeStatus(args as any);
            break;

          // === PHASE 2b TOOLS ===
          case 'phase2b_review_start':
            result = await reviewStart(args as any);
            break;

          case 'phase2b_review_next':
            result = await reviewNext(args as any);
            break;

          case 'phase2b_review_read_segment':
            result = await reviewReadSegment(args as any);
            break;

          case 'phase2b_review_write_note':
            result = await reviewWriteNote(args as any);
            break;

          case 'phase2b_review_revise_codes':
            result = await reviewReviseCodes(args as any);
            break;

          case 'phase2b_review_status':
            result = await reviewStatus(args as any);
            break;

          case 'phase2b_review_split_segment':
            result = await reviewSplitSegment(args as any);
            break;

          case 'phase2b_review_merge_segments':
            result = await reviewMergeSegments(args as any);
            break;

          // === PHASE 3 TOOLS ===
          case 'phase3_extract_codes':
            result = await extractCodes(args as any);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: errorMessage,
                  tool: name,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log to stderr (stdout is used for MCP protocol)
    console.error('Reflexive Thematic Analysis MCP Server v0.5.1 running...');
    console.error('Core: init, project_setup, add_line_index, methodology_load, list_files, read_file');
    console.error(
      'Phase 2a: code_start, code_read_next, code_write_segment, code_skip_chunk, code_status, code_verify, code_reset_status, code_clear_all, code_delete_segment'
    );
    console.error(
      'Phase 2b: review_start, review_next, review_read_segment, review_write_note, review_revise_codes, review_status, review_split_segment, review_merge_segments'
    );
    console.error('Phase 3: extract_codes');
  }
}

// Start server
const server = new QualitativeAnalysisRTAServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
