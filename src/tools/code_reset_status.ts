/**
 * code_reset_status - Reset STATUS to uncoded state without modifying file content
 *
 * Use when file was manually cleaned but STATUS is out of sync.
 * Resets Last-coded-line to 0 and Progress to 0/N.
 */

import { StatusManager } from '../core/status_manager.js';

export async function codeResetStatus(args: {
  file_path: string;
}): Promise<any> {
  const { file_path } = args;

  const statusManager = new StatusManager();

  // Read current STATUS to get totalLines
  const currentStatus = await statusManager.read(file_path);

  // Calculate segment size (default 80, could read from config)
  const segmentSize = 80;
  const totalSegments = Math.ceil(currentStatus.totalLines / segmentSize);

  // Store previous state for reporting
  const previousState = {
    coded_segments: currentStatus.codedSegments,
    progress: currentStatus.progress,
  };

  // Reset to initial state:
  // - Last-coded-line: 0
  // - Last-file-position: 8 (after STATUS frontmatter which is 9 lines, 0-indexed)
  // - This will auto-calculate Next-segment: "1-80" and Progress: "0/N"
  await statusManager.update(
    file_path,
    0, // lastCodedLine = 0
    8, // lastFilePosition = 8 (after STATUS frontmatter)
    segmentSize
  );

  return {
    status: 'reset',
    message: 'STATUS reset to uncoded state',
    previous: previousState,
    current: {
      coded_segments: 0,
      progress: `0/${totalSegments} (0%)`,
    },
    note: 'File content unchanged - only STATUS was reset',
  };
}
