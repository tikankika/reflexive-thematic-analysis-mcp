import { promises as fs } from 'fs';
import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { CodingLogWriter } from '../core/coding_log_writer.js';
import { ProcessLogger } from '../core/process_logger.js';

/**
 * review_write_note - Write a reflexive note for a segment
 *
 * Marks the segment as reviewed by writing /reviewed marker to the
 * transcript file, and appends the reflexive note to _coding_log.md.
 *
 * A segment is "reviewed" when the researcher writes a reflexive note,
 * not when codes are revised. This matches the workflow:
 *   read → (revise codes) → write note = done.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   index: number - 1-based segment index
 *   note: string - Reflexive note text (markdown)
 *
 * Output:
 *   { success, saved_at, progress }
 */
export async function reviewWriteNote(args: {
  file_path: string;
  index: number;
  note: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, index, note } = args;

  const reader = new SegmentReader();

  // Get all segments for progress calculation
  const segments = await reader.extractSegments(file_path);

  if (index < 1 || index > segments.length) {
    throw new Error(
      `Segment index ${index} out of range. File has ${segments.length} segments (1-${segments.length}).`
    );
  }

  const segment = segments[index - 1];
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // 1. Write /reviewed marker to transcript (if not already present)
  if (!segment.reviewed) {
    const content = await fs.readFile(file_path, 'utf-8');
    const lines = content.split('\n');

    // Insert /reviewed marker right after /segment line
    // fileStartLine points to the /segment line
    lines.splice(segment.fileStartLine + 1, 0, `/reviewed ${today}`);

    await fs.writeFile(file_path, lines.join('\n'), 'utf-8');
  }

  // 2. Append reflexive note to _coding_log.md (best-effort)
  try {
    const logWriter = new CodingLogWriter();
    const logPath = logWriter.getLogPath(file_path);
    await logWriter.appendReview(logPath, {
      segmentIndex: index,
      lineRange: `${segment.startIndex}–${segment.endIndex}`,
      reflexiveNote: note,
    });
  } catch {
    // Non-critical — coding log is best-effort
  }

  // 3. Log event to process log (best-effort)
  try {
    const processLogger = new ProcessLogger();
    await processLogger.log(file_path, 'review_segment_complete', {
      phase: '2b',
      context: {
        segment: `${segment.startIndex}-${segment.endIndex}`,
      },
    });
  } catch {
    // Don't fail the review if logging fails
  }

  // 4. Calculate updated progress
  // +1 for the segment we just reviewed (if it wasn't already)
  const previouslyReviewed = segments.filter((s) => s.reviewed).length;
  const reviewedCount = segment.reviewed ? previouslyReviewed : previouslyReviewed + 1;
  const totalSegments = segments.length;

  return {
    success: true,
    saved_at: now,
    segment_index: index,
    line_range: `${segment.startIndex}-${segment.endIndex}`,
    progress: {
      reviewed: reviewedCount,
      remaining: totalSegments - reviewedCount,
      percent: totalSegments > 0 ? Math.round((reviewedCount / totalSegments) * 100) : 0,
    },
  };
}
