import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';

/**
 * review_read_segment - Read a specific segment by index
 *
 * Returns segment text, codes, and review status.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   index: number - 1-based segment index
 *
 * Output:
 *   { segment }
 */
export async function reviewReadSegment(args: {
  file_path: string;
  index: number;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, index } = args;

  const reader = new SegmentReader();

  // Get the specific segment
  const segment = await reader.getSegment(file_path, index);

  return {
    segment: {
      index: segment.index,
      line_range: `${segment.startIndex}-${segment.endIndex}`,
      text: segment.textLines.join('\n'),
      codes: segment.codes,
      reviewed: segment.reviewed,
      reviewed_at: segment.reviewedAt || null,
    },
  };
}
