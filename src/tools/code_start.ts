import { ChunkReader } from '../core/chunk_reader.js';
import { StatusManager } from '../core/status_manager.js';

/**
 * code_start - Initialize coding session
 *
 * Creates STATUS frontmatter and returns first chunk for coding
 *
 * Note: A "chunk" is a technical reading unit (60-100 lines) used to process
 * large transcripts in pieces. You will mark semantic "segments" with
 * /segment markers when coding within each chunk.
 *
 * Input:
 *   file_path: string - Path to transcript file
 *   config?: {
 *     chunk_size?: number - Lines per chunk (default: 80)
 *     segment_size?: number - (deprecated, use chunk_size)
 *   }
 *
 * Output:
 *   {
 *     status: "ready",
 *     total_lines: number,
 *     chunk: {
 *       number: number,
 *       lines: string (e.g., "1-80"),
 *       text: string
 *     }
 *   }
 */
export async function codeStart(args: {
  file_path: string;
  config?: {
    chunk_size?: number;
    segment_size?: number;  // Backwards compatibility
  };
}): Promise<any> {
  const { file_path, config } = args;
  // Support both chunk_size (new) and segment_size (backwards compat)
  const chunkSize = config?.chunk_size || config?.segment_size || 80;

  const reader = new ChunkReader();
  const statusManager = new StatusManager();

  // Check if file exists
  const exists = await reader.fileExists(file_path);
  if (!exists) {
    throw new Error(`File not found: ${file_path}`);
  }

  // Check if STATUS already exists
  const hasStatus = await statusManager.hasStatus(file_path);
  if (hasStatus) {
    throw new Error(
      `File already has STATUS. Use code_read_next to continue, or remove STATUS to restart.`
    );
  }

  // Count lines
  const totalLines = await reader.countLines(file_path);

  // Create STATUS
  await statusManager.create(file_path, totalLines, chunkSize);

  // Find where actual content starts (after STATUS frontmatter)
  const contentStart = await reader.getContentStartLine(file_path);

  // Read first chunk starting from actual content
  const chunk = await reader.readChunk(file_path, contentStart, chunkSize);

  return {
    status: 'ready',
    total_lines: totalLines,
    estimated_chunks: Math.ceil(totalLines / chunkSize),
    chunk: {
      number: chunk.number,
      lines: `${chunk.startLine + 1}-${chunk.endLine + 1}`,  // 1-indexed for display
      text: chunk.text
    }
  };
}
