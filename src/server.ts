#!/usr/bin/env node

/**
 * Phase 1 Coding MCP Server
 *
 * Minimal file handler for chunk-based reading and segment-based coding
 *
 * Terminology:
 * - CHUNK: Technical reading unit (60-100 lines) for processing large files
 * - SEGMENT: Semantic coding unit (variable size) marked with /segment
 *
 * Tools:
 * - add_line_numbers: Add line numbers to transcript (prep tool)
 * - code_start: Initialize coding session (returns first chunk)
 * - code_read_next: Read next chunk for coding
 * - code_write_segment: Write codes for semantic segments
 * - code_status: Show progress
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { addLineNumbers } from './tools/add_line_numbers.js';
import { codeStart } from './tools/code_start.js';
import { codeReadNext } from './tools/code_read_next.js';
import { codeWriteSegment } from './tools/code_write_segment.js';
import { codeStatus } from './tools/code_status.js';

/**
 * MCP Server for Phase 1 Coding
 */
class Phase1CodingServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'phase1-coding-server',
        version: '0.2.0',
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
        {
          name: 'add_line_numbers',
          description:
            'Add line numbers to transcript file. Prepares file for coding by adding permanent 4-digit line numbers (0001, 0002, ...). Run this BEFORE code_start if you want to reference specific lines during coding.',
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
                    description: 'Number of digits for line numbers (default: 4)',
                  },
                },
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'code_start',
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
          name: 'code_read_next',
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
          name: 'code_write_segment',
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
                        'Starting line number in 4-digit format (e.g., "0030")',
                    },
                    end_line: {
                      type: 'string',
                      description:
                        'Ending line number in 4-digit format, inclusive (e.g., "0034")',
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
          name: 'code_status',
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
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        switch (name) {
          case 'add_line_numbers':
            result = await addLineNumbers(args as any);
            break;

          case 'code_start':
            result = await codeStart(args as any);
            break;

          case 'code_read_next':
            result = await codeReadNext(args as any);
            break;

          case 'code_write_segment':
            result = await codeWriteSegment(args as any);
            break;

          case 'code_status':
            result = await codeStatus(args as any);
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
    console.error('Phase 1 Coding MCP Server running...');
    console.error('Tools: add_line_numbers, code_start, code_read_next, code_write_segment, code_status');
  }
}

// Start server
const server = new Phase1CodingServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
