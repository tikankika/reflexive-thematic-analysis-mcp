import { SegmentWriter } from '../core/segment_writer.js';
import { StatusManager } from '../core/status_manager.js';

/**
 * code_skip_chunk - Skip current chunk without coding
 *
 * Use when chunk contains no codeable content (e.g., facilitator-only talk)
 *
 * Writes /segment marker with empty codes array to maintain file structure
 * consistency, then updates STATUS to mark chunk as processed.
 *
 * Input:
 *   file_path: string - Path to transcript file
 *
 * Output:
 *   {
 *     skipped: boolean,
 *     chunk_number: number,
 *     codes_written: number,
 *     next_chunk_ready: boolean,
 *     progress: string
 *   }
 */
export async function codeSkipChunk(args: {
  file_path: string;
}): Promise<any> {
  const { file_path } = args;

  const writer = new SegmentWriter();
  const statusManager = new StatusManager();

  // Read current STATUS
  const status = await statusManager.read(file_path);

  // Check if already complete
  if (status.nextSegmentStart > status.totalLines) {
    throw new Error('All chunks already coded/skipped');
  }

  // Calculate chunk size from STATUS
  const chunkSize = 80; // TODO: Get from STATUS or config

  // Start writing from the line AFTER the last coded segment in the FILE
  const fileStartLine = status.lastFilePosition + 1;

  // Calculate how many content lines to skip (might be less than chunkSize at end)
  const remainingContentLines = status.totalLines - status.lastCodedLine;
  const contentLinesToSkip = Math.min(chunkSize, remainingContentLines);

  // Calculate file end line (0-indexed, inclusive)
  const fileEndLine = fileStartLine + contentLinesToSkip - 1;

  // Write segment with EMPTY codes array []
  // SegmentWriter will create:
  //   /segment
  //   <original text>
  //
  //   /slut_segment
  const result = await writer.writeSegment(
    file_path,
    fileStartLine,
    fileEndLine,
    []  // Empty codes array - this is the key!
  );

  // Update STATUS with CONTENT line count and FILE position
  const newLastCodedLine = status.lastCodedLine + contentLinesToSkip;
  const newLastFilePosition = result.endLine;

  await statusManager.update(
    file_path,
    newLastCodedLine,
    newLastFilePosition,
    chunkSize
  );

  // Read updated STATUS for progress
  const updatedStatus = await statusManager.read(file_path);

  return {
    skipped: true,
    chunk_number: result.chunkNumber,
    codes_written: 0,
    next_chunk_ready: result.nextChunkReady,
    progress: `${updatedStatus.codedSegments}/${Math.ceil(status.totalLines / chunkSize)} (${updatedStatus.progress})`
  };
}
