import { promises as fs } from 'fs';
import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';

/**
 * review_split_segment - Split a segment into two during Phase 2b review
 *
 * Splits a segment at a specified line, copies all codes to both new
 * segments. Neither new segment has /reviewed — both need fresh review.
 * This is methodologically correct: if segmentation was wrong, both
 * halves need review.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   segment_index: number - 1-based segment index to split
 *   split_at_line: string - 4-digit line index: first line of second half
 *
 * Output:
 *   { success, original_index, new_segments, codes_copied, hint }
 */
export async function reviewSplitSegment(args: {
  file_path: string;
  segment_index: number;
  split_at_line: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, segment_index, split_at_line } = args;

  const reader = new SegmentReader();

  // 1. Extract all segments
  const segments = await reader.extractSegments(file_path);

  if (segment_index < 1 || segment_index > segments.length) {
    throw new Error(
      `Segment index ${segment_index} out of range. File has ${segments.length} segments (1-${segments.length}).`
    );
  }

  const segment = segments[segment_index - 1];

  // 2. Validate split_at_line exists in segment's text lines
  const splitLineIdx = segment.textLines.findIndex((line) => {
    const match = line.match(/^(\d{4})\s/);
    return match && match[1] === split_at_line;
  });

  if (splitLineIdx < 0) {
    const availableIndices = segment.textLines
      .map((line) => {
        const m = line.match(/^(\d{4})\s/);
        return m ? m[1] : null;
      })
      .filter(Boolean);
    throw new Error(
      `Line index "${split_at_line}" not found in segment ${segment_index}. ` +
        `Available line indices: ${availableIndices.join(', ')}`
    );
  }

  if (splitLineIdx === 0) {
    throw new Error(
      `Cannot split at first line of segment — first half would be empty. ` +
        `split_at_line must be a line after the first text line.`
    );
  }

  // 3. Split text lines into two groups
  const textLinesFirst = segment.textLines.slice(0, splitLineIdx);
  const textLinesSecond = segment.textLines.slice(splitLineIdx);

  // 4. Read file and build replacement blocks
  // Neither block gets /reviewed — both need fresh review
  const content = await fs.readFile(file_path, 'utf-8');
  const lines = content.split('\n');

  // Build block 1
  const block1: string[] = [
    '/segment',
    ...textLinesFirst,
    '',
    ...segment.codes,
    '/slut_segment',
  ];

  // Build block 2
  const block2: string[] = [
    '',
    '/segment',
    ...textLinesSecond,
    '',
    ...segment.codes,
    '/slut_segment',
  ];

  // 5. Replace original segment with two new blocks
  const replaceStart = segment.fileStartLine;
  const replaceCount = segment.fileEndLine - segment.fileStartLine + 1;

  lines.splice(replaceStart, replaceCount, ...block1, ...block2);

  // 6. Write file back
  await fs.writeFile(file_path, lines.join('\n'), 'utf-8');

  return {
    success: true,
    original_index: segment_index,
    new_segments: {
      first: segment_index,
      second: segment_index + 1,
    },
    codes_copied: segment.codes,
    hint: 'Both new segments need review. Use review_revise_codes to adjust codes on each half.',
  };
}
