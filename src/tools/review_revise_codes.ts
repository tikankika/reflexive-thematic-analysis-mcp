import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { SegmentReviser } from '../core/segment_reviser.js';
import { CodingLogWriter } from '../core/coding_log_writer.js';
import { ProcessLogger } from '../core/process_logger.js';

/**
 * review_revise_codes - Revise codes for a segment during review
 *
 * Modifies codes in the transcript file and logs the revision
 * to _coding_log.md and _process_log.jsonl.
 *
 * Does NOT mark the segment as reviewed — only review_write_note does that.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   segment_index: number - 1-based segment index
 *   action: "add" | "remove" | "replace" - Revision type
 *   codes: string[] - Codes to add/remove/replace with
 *
 * Output:
 *   { success, updated_codes, previous_codes }
 */
export async function reviewReviseCodes(args: {
  file_path: string;
  segment_index: number;
  action: 'add' | 'remove' | 'replace';
  codes: string[];
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, segment_index, action, codes } = args;

  const reviser = new SegmentReviser();
  const reader = new SegmentReader();

  // Get segment metadata before revision (for logging)
  const segment = await reader.getSegment(file_path, segment_index);
  const lineRange = `${segment.startIndex}–${segment.endIndex}`;

  // Revise codes in the transcript file
  const { updatedCodes, previousCodes } = await reviser.reviseCodes(
    file_path,
    segment_index,
    action,
    codes
  );

  // Compute added/removed for log
  const prevSet = new Set(previousCodes);
  const newSet = new Set(updatedCodes);
  const codesAdded = updatedCodes.filter((c) => !prevSet.has(c));
  const codesRemoved = previousCodes.filter((c) => !newSet.has(c));

  // Log revision to _coding_log.md (best-effort)
  try {
    const logWriter = new CodingLogWriter();
    const logPath = logWriter.getLogPath(file_path);
    await logWriter.appendReview(logPath, {
      segmentIndex: segment_index,
      lineRange,
      codesAdded,
      codesRemoved,
    });
  } catch {
    // Non-critical — coding log is best-effort
  }

  // Auto-log to process log (best-effort)
  try {
    const processLogger = new ProcessLogger();
    await processLogger.log(file_path, 'codes_revised', {
      phase: '2b',
      context: {
        segment: `segment_${segment_index}`,
        codes_before: previousCodes,
        codes_after: updatedCodes,
      },
    });
  } catch {
    // Don't fail the revision if logging fails
  }

  return {
    success: true,
    segment_index,
    action,
    updated_codes: updatedCodes,
    previous_codes: previousCodes,
  };
}
