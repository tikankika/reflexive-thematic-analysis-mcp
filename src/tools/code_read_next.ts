import { SegmentReader } from '../core/segment_reader.js';
import { StatusManager } from '../core/status_manager.js';

/**
 * code_read_next - Read next segment to code
 *
 * Reads STATUS and returns next uncoded segment
 *
 * Input:
 *   file_path: string - Path to transcript file
 *
 * Output:
 *   {
 *     segment: {
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

  const reader = new SegmentReader();
  const statusManager = new StatusManager();

  // Check if file exists
  const exists = await reader.fileExists(file_path);
  if (!exists) {
    throw new Error(`File not found: ${file_path}`);
  }

  // Read STATUS
  const status = await statusManager.read(file_path);

  // Check if all segments are coded
  if (status.nextSegmentStart > status.totalLines) {
    return {
      status: 'complete',
      message: 'All segments have been coded',
      progress: status.progress
    };
  }

  // Calculate segment size
  const segmentSize = 80;  // TODO: Get from STATUS or config

  // Calculate how many content lines to read (might be less than segmentSize at end)
  const remainingContentLines = status.totalLines - status.lastCodedLine;
  const contentLinesToRead = Math.min(segmentSize, remainingContentLines);

  // Read from the FILE position right after the last coded segment
  const fileStartLine = status.lastFilePosition + 1;

  // Read next segment
  const segment = await reader.readSegment(
    file_path,
    fileStartLine,
    contentLinesToRead
  );

  return {
    segment: {
      number: segment.number,
      lines: `${status.nextSegmentStart}-${status.nextSegmentStart + contentLinesToRead - 1}`,  // Content lines for display
      text: segment.text
    },
    progress: `${status.codedSegments}/${Math.ceil(status.totalLines / segmentSize)} (${status.progress})`
  };
}
