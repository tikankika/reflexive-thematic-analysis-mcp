import { promises as fs } from 'fs';
import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';

/**
 * review_merge_segments - Merge two adjacent segments during Phase 2b review
 *
 * Merges two consecutive segments into one, deduplicates codes.
 * The merged segment has no /reviewed marker — it needs fresh review.
 * This is methodologically correct: if segmentation was wrong,
 * the merged segment needs review.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   first_segment_index: number - 1-based index of first segment
 *   second_segment_index: number - Must be first_segment_index + 1
 *
 * Output:
 *   { success, merged_from, merged_to, combined_codes }
 */
export async function reviewMergeSegments(args: {
  file_path: string;
  first_segment_index: number;
  second_segment_index: number;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, first_segment_index, second_segment_index } = args;

  // Validate adjacency
  if (second_segment_index !== first_segment_index + 1) {
    throw new Error(
      `Segments must be adjacent. second_segment_index (${second_segment_index}) ` +
        `must equal first_segment_index + 1 (${first_segment_index + 1}).`
    );
  }

  const reader = new SegmentReader();

  // 1. Extract all segments
  const segments = await reader.extractSegments(file_path);

  if (first_segment_index < 1 || second_segment_index > segments.length) {
    throw new Error(
      `Segment indices out of range. File has ${segments.length} segments (1-${segments.length}).`
    );
  }

  const seg1 = segments[first_segment_index - 1];
  const seg2 = segments[second_segment_index - 1];

  // 2. Combine text lines
  const combinedTextLines = [...seg1.textLines, ...seg2.textLines];

  // 3. Combine and deduplicate codes
  const codeSet = new Set([...seg1.codes, ...seg2.codes]);
  const combinedCodes = Array.from(codeSet);

  // 4. Read file and build merged block (no /reviewed marker)
  const content = await fs.readFile(file_path, 'utf-8');
  const lines = content.split('\n');

  const mergedBlock: string[] = [
    '/segment',
    ...combinedTextLines,
    '',
    ...combinedCodes,
    '/slut_segment',
  ];

  // 5. Replace from seg1 start to seg2 end (covers any whitespace between them)
  const replaceStart = seg1.fileStartLine;
  const replaceCount = seg2.fileEndLine - seg1.fileStartLine + 1;

  lines.splice(replaceStart, replaceCount, ...mergedBlock);

  // 6. Write file back
  await fs.writeFile(file_path, lines.join('\n'), 'utf-8');

  return {
    success: true,
    merged_from: [first_segment_index, second_segment_index],
    merged_to: first_segment_index,
    combined_codes: combinedCodes,
  };
}
