import { StatusManager } from '../core/status_manager.js';

/**
 * code_status - Show coding progress
 *
 * Reads and returns current STATUS
 *
 * Input:
 *   file_path: string - Path to transcript file
 *
 * Output:
 *   {
 *     file: string,
 *     total_lines: number,
 *     coded_segments: number,
 *     total_segments: number,
 *     progress: string (e.g., "16%"),
 *     last_coded_line: number,
 *     next_segment_start: number,
 *     date: string
 *   }
 */
export async function codeStatus(args: {
  file_path: string;
}): Promise<any> {
  const { file_path } = args;

  const statusManager = new StatusManager();

  // Read STATUS
  const status = await statusManager.read(file_path);

  // Calculate total segments (assume 80 lines per segment)
  const segmentSize = 80;
  const totalSegments = Math.ceil(status.totalLines / segmentSize);

  return {
    file: status.file,
    total_lines: status.totalLines,
    coded_segments: status.codedSegments,
    total_segments: totalSegments,
    progress: status.progress,
    last_coded_line: status.lastCodedLine,
    next_segment_start: status.nextSegmentStart,
    date: status.date,
    status: status.codedSegments >= totalSegments ? 'complete' : 'in_progress'
  };
}
