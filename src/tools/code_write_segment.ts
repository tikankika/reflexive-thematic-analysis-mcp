import { SegmentWriter } from '../core/segment_writer.js';
import { StatusManager } from '../core/status_manager.js';
import { CodeSegmentInput } from '../types/chunk.js';

/**
 * code_write_segment - Write codes for segment(s)
 *
 * Supports two modes:
 * 1. LEGACY (v0.1.0): Single 80-line segment using STATUS boundaries
 * 2. NEW (v0.2.0): Multiple small segments with explicit line ranges
 *
 * LEGACY Input (backwards compatible):
 *   file_path: string - Path to transcript file
 *   codes: string[] - Array of code strings (e.g., ["#kod_lins1"])
 *
 * NEW Input (v0.2.0):
 *   file_path: string - Path to transcript file
 *   segments: Array<{start_line, end_line, codes}> - Multiple segments to write
 *
 * Output:
 *   {
 *     segment_written/segments_written: number,
 *     codes_written/total_codes_written: number,
 *     next_segment_ready: boolean,
 *     progress: string
 *   }
 */
export async function codeWriteSegment(args: {
  file_path: string;
  codes?: string[];
  segments?: CodeSegmentInput[];
}): Promise<any> {
  const { file_path, codes, segments } = args;

  const writer = new SegmentWriter();
  const statusManager = new StatusManager();

  // API detection - enforce mutual exclusion
  if (segments !== undefined && codes !== undefined) {
    throw new Error(
      'Cannot provide both "codes" and "segments". ' +
      'Use "codes" for legacy single-segment mode (v0.1.0), ' +
      'or "segments" for new multi-segment mode (v0.2.0).'
    );
  }

  if (segments === undefined && codes === undefined) {
    throw new Error(
      'Must provide either "codes" (legacy mode) or "segments" (new mode)'
    );
  }

  // Route to appropriate mode
  if (segments !== undefined) {
    return await writeMultiSegmentMode(file_path, segments, writer, statusManager);
  } else {
    return await writeLegacyMode(file_path, codes!, writer, statusManager);
  }
}

/**
 * NEW MODE (v0.2.0): Write multiple small segments with explicit line ranges
 *
 * @param file_path - Path to transcript file
 * @param segments - Array of segments to write
 * @param writer - SegmentWriter instance
 * @param statusManager - StatusManager instance
 * @returns Result object
 */
async function writeMultiSegmentMode(
  file_path: string,
  segments: CodeSegmentInput[],
  writer: SegmentWriter,
  statusManager: StatusManager
): Promise<any> {
  // Write all segments using new multi-segment API
  const result = await writer.writeMultipleSegments(file_path, segments);

  // Read current STATUS for context
  const status = await statusManager.read(file_path);
  const segmentSize = 80; // TODO: Get from STATUS or config

  // Update STATUS with max coded line and last file position
  await statusManager.update(
    file_path,
    result.max_coded_line,
    result.lastFilePosition,
    segmentSize
  );

  // Read updated STATUS for progress
  const updatedStatus = await statusManager.read(file_path);

  return {
    segments_written: result.segments_written,
    codes_written: result.total_codes_written,
    next_segment_ready: result.next_segment_ready,
    progress: `${updatedStatus.codedSegments}/${Math.ceil(status.totalLines / segmentSize)} (${updatedStatus.progress})`
  };
}

/**
 * LEGACY MODE (v0.1.0): Write single 80-line segment using STATUS boundaries
 *
 * Backwards compatible with v0.1.0 behavior.
 *
 * @param file_path - Path to transcript file
 * @param codes - Array of codes for segment
 * @param writer - SegmentWriter instance
 * @param statusManager - StatusManager instance
 * @returns Result object
 */
async function writeLegacyMode(
  file_path: string,
  codes: string[],
  writer: SegmentWriter,
  statusManager: StatusManager
): Promise<any> {
  // Validate codes
  if (!codes || codes.length === 0) {
    throw new Error('No codes provided');
  }

  // Read current STATUS
  const status = await statusManager.read(file_path);

  // Calculate segment boundaries
  const segmentSize = 80; // TODO: Get from STATUS or config

  // Start writing from the line AFTER the last coded segment in the FILE
  const fileStartLine = status.lastFilePosition + 1;

  // Calculate how many content lines to code (might be less than segmentSize at end)
  const remainingContentLines = status.totalLines - status.lastCodedLine;
  const contentLinesToCode = Math.min(segmentSize, remainingContentLines);

  // Calculate file end line (0-indexed, inclusive)
  const fileEndLine = fileStartLine + contentLinesToCode - 1;

  // Write segment (v0.1.0 API)
  const result = await writer.writeSegment(file_path, fileStartLine, fileEndLine, codes);

  // Update STATUS with CONTENT line count and FILE position
  const newLastCodedLine = status.lastCodedLine + contentLinesToCode;
  const newLastFilePosition = result.endLine;

  await statusManager.update(file_path, newLastCodedLine, newLastFilePosition, segmentSize);

  // Read updated STATUS for progress
  const updatedStatus = await statusManager.read(file_path);

  return {
    segment_written: result.chunkNumber,
    codes_written: result.codesWritten,
    next_segment_ready: result.nextChunkReady,
    progress: `${updatedStatus.codedSegments}/${Math.ceil(status.totalLines / segmentSize)} (${updatedStatus.progress})`
  };
}
