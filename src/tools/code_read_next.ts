import { ChunkReader } from '../core/chunk_reader.js';
import { StatusManager } from '../core/status_manager.js';

/**
 * code_read_next - Read next chunk to code
 *
 * Reads STATUS and returns next uncoded chunk for coding.
 *
 * Note: A "chunk" is a technical reading unit (60-100 lines) used to process
 * large transcripts in pieces. You will mark semantic "segments" with
 * /segment markers when coding within each chunk.
 *
 * Input:
 *   file_path: string - Path to transcript file
 *
 * Output:
 *   {
 *     chunk: {
 *       number: number,
 *       lines: string (e.g., "81-160"),
 *       text: string
 *     },
 *     progress: string (e.g., "1/18 (5%)")
 *   }
 */
export async function codeReadNext(args: {
  file_path: string;
}): Promise<any> {
  const { file_path } = args;

  const reader = new ChunkReader();
  const statusManager = new StatusManager();

  // Check if file exists
  const exists = await reader.fileExists(file_path);
  if (!exists) {
    throw new Error(`File not found: ${file_path}`);
  }

  // Read STATUS
  const status = await statusManager.read(file_path);

  // Check if all chunks are coded
  if (status.nextSegmentStart > status.totalLines) {
    return {
      status: 'complete',
      message: 'All chunks have been coded',
      progress: status.progress
    };
  }

  // Calculate chunk size
  const chunkSize = 80;  // TODO: Get from STATUS or config

  // Calculate how many content lines to read (might be less than chunkSize at end)
  const remainingContentLines = status.totalLines - status.lastCodedLine;
  const contentLinesToRead = Math.min(chunkSize, remainingContentLines);

  // Read from the FILE position right after the last coded chunk
  const fileStartLine = status.lastFilePosition + 1;

  // Read next chunk
  const chunk = await reader.readChunk(
    file_path,
    fileStartLine,
    contentLinesToRead
  );

  return {
    chunk: {
      number: chunk.number,
      lines: `${status.nextSegmentStart}-${status.nextSegmentStart + contentLinesToRead - 1}`,  // Content lines for display
      text: chunk.text
    },
    progress: `${status.codedSegments}/${Math.ceil(status.totalLines / chunkSize)} (${status.progress})`
  };
}
