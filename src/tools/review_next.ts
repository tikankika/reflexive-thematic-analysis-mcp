import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';

/**
 * review_next - Get next unreviewed segment
 *
 * Finds the first segment without a /reviewed marker.
 * Returns "complete" if all segments have been reviewed.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *
 * Output:
 *   { segment, progress } or { status: "complete", ... }
 */
export async function reviewNext(args: {
  file_path: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path } = args;

  const reader = new SegmentReader();

  // Extract segments — reviewed flag comes from /reviewed marker
  const segments = await reader.extractSegments(file_path);
  const totalSegments = segments.length;
  const reviewedCount = segments.filter((s) => s.reviewed).length;

  // Find first unreviewed
  const nextSegment = segments.find((s) => !s.reviewed);

  if (!nextSegment) {
    return {
      status: 'complete',
      message: 'All segments have been reviewed!',
      progress: {
        reviewed: reviewedCount,
        remaining: 0,
        percent: 100,
      },
    };
  }

  return {
    status: 'next_segment',
    segment: {
      index: nextSegment.index,
      line_range: `${nextSegment.startIndex}-${nextSegment.endIndex}`,
      text: nextSegment.textLines.join('\n'),
      codes: nextSegment.codes,
    },
    progress: {
      reviewed: reviewedCount,
      remaining: totalSegments - reviewedCount,
      percent: totalSegments > 0 ? Math.round((reviewedCount / totalSegments) * 100) : 0,
    },
  };
}
