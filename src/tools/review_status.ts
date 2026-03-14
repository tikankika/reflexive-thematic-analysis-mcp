import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';

/**
 * review_status - Show Phase 2b review progress
 *
 * Counts /reviewed markers vs total segments in the transcript.
 * Progress is computed directly from the transcript — no external state.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *
 * Output:
 *   { file, total_segments, reviewed, remaining, progress_percent }
 */
export async function reviewStatus(args: {
  file_path: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path } = args;

  const reader = new SegmentReader();

  const segments = await reader.extractSegments(file_path);
  const totalSegments = segments.length;
  const reviewedCount = segments.filter((s) => s.reviewed).length;
  const remaining = totalSegments - reviewedCount;
  const progressPercent = totalSegments > 0 ? Math.round((reviewedCount / totalSegments) * 100) : 0;

  return {
    file: file_path,
    total_segments: totalSegments,
    reviewed: reviewedCount,
    remaining,
    progress_percent: progressPercent,
  };
}
