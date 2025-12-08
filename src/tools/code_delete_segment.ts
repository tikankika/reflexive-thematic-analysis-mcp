/**
 * code_delete_segment - Delete specific segment by line index range
 *
 * Removes /segment markers, content, and codes for the specified range.
 * Updates STATUS. Use when a specific segment was coded incorrectly.
 */

import { promises as fs } from 'fs';
import { StatusManager } from '../core/status_manager.js';

export async function codeDeleteSegment(args: {
  file_path: string;
  start_index: string;
  end_index: string;
}): Promise<any> {
  const { file_path, start_index, end_index } = args;

  // 1. Read file
  const content = await fs.readFile(file_path, 'utf-8');
  const lines = content.split('\n');

  // 2. Find segment containing these line indices
  let segmentStartLine = -1;
  let segmentEndLine = -1;
  let inSegment = false;
  let foundTargetLine = false;
  let codesInSegment = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect segment start
    if (line.trim() === '/segment') {
      segmentStartLine = i;
      inSegment = true;
      codesInSegment = 0;
    }

    // Check if this segment contains our target line index
    if (inSegment && line.startsWith(start_index)) {
      foundTargetLine = true;
    }

    // Count codes in this segment
    if (inSegment && line.startsWith('#')) {
      codesInSegment++;
    }

    // Detect segment end
    if (line.trim() === '/slut_segment' && inSegment) {
      segmentEndLine = i;

      if (foundTargetLine) {
        // Found the segment to delete!
        break;
      }

      // Reset for next segment
      inSegment = false;
      foundTargetLine = false;
      segmentStartLine = -1;
    }
  }

  // 3. Validate segment was found
  if (segmentStartLine === -1 || segmentEndLine === -1) {
    throw new Error(
      `No segment found containing line indices ${start_index}-${end_index}`
    );
  }

  // 4. Remove segment lines
  const newLines = [
    ...lines.slice(0, segmentStartLine),
    ...lines.slice(segmentEndLine + 1),
  ];

  await fs.writeFile(file_path, newLines.join('\n'), 'utf-8');

  // 5. Recalculate STATUS
  // Count remaining segments
  const newContent = newLines.join('\n');
  const remainingSegments = (newContent.match(/^\/segment$/gm) || []).length;

  const segmentSize = 80;
  const statusManager = new StatusManager();

  // Find last remaining /slut_segment
  let lastSegmentPos = 8; // Default after STATUS
  for (let i = newLines.length - 1; i >= 0; i--) {
    if (newLines[i].trim() === '/slut_segment') {
      lastSegmentPos = i;
      break;
    }
  }

  const newLastCodedLine = remainingSegments * segmentSize;
  await statusManager.update(
    file_path,
    newLastCodedLine,
    lastSegmentPos,
    segmentSize
  );

  // 6. Read updated status for progress
  const updatedStatus = await statusManager.read(file_path);

  return {
    status: 'deleted',
    message: `Segment ${start_index}-${end_index} removed`,
    segment_found: true,
    codes_removed: codesInSegment,
    new_progress: `${updatedStatus.codedSegments}/${Math.ceil(updatedStatus.totalLines / segmentSize)} (${updatedStatus.progress})`,
  };
}
