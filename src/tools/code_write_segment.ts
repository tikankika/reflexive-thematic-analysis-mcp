import { promises as fs } from 'fs';
import { SegmentWriter } from '../core/segment_writer.js';
import { StatusManager } from '../core/status_manager.js';
import { CodeSegmentInput } from '../types/chunk.js';
import { ProcessLogger } from '../core/process_logger.js';
import { CodingLogWriter } from '../core/coding_log_writer.js';

/**
 * code_write_segment - Write codes for segment(s)
 *
 * Supports two modes:
 * 1. LEGACY (v0.1.0): Single 80-line segment using STATUS boundaries
 * 2. NEW (v0.2.0): Multiple small segments with explicit line ranges
 *
 * LEGACY Input (backwards compatible):
 *   file_path: string - Path to transcript file
 *   codes: string[] - Array of code strings (e.g., ["#kod_lins1"])
 *
 * NEW Input (v0.2.0):
 *   file_path: string - Path to transcript file
 *   segments: Array<{start_line, end_line, codes}> - Multiple segments to write
 *
 * Output:
 *   {
 *     segment_written/segments_written: number,
 *     codes_written/total_codes_written: number,
 *     next_segment_ready: boolean,
 *     progress: string
 *   }
 */
export async function codeWriteSegment(args: {
  file_path: string;
  codes?: string[];
  segments?: CodeSegmentInput[];
  reflexive_note?: string;
  coding_rationale?: string;
  segment_title?: string;
  researcher_decision?: string;
}): Promise<any> {
  const { file_path, codes, segments, reflexive_note, coding_rationale, segment_title, researcher_decision } = args;

  const writer = new SegmentWriter();
  const statusManager = new StatusManager();

  // API detection - enforce mutual exclusion
  if (segments !== undefined && codes !== undefined) {
    throw new Error(
      'Cannot provide both "codes" and "segments". ' +
      'Use "codes" for legacy single-segment mode (v0.1.0), ' +
      'or "segments" for new multi-segment mode (v0.2.0).'
    );
  }

  if (segments === undefined && codes === undefined) {
    throw new Error(
      'Must provide either "codes" (legacy mode) or "segments" (new mode)'
    );
  }

  // Coding log params (shared across modes)
  const logParams = { reflexive_note, coding_rationale, segment_title, researcher_decision };

  // Route to appropriate mode
  if (segments !== undefined) {
    return await writeMultiSegmentMode(file_path, segments, writer, statusManager, logParams);
  } else {
    return await writeLegacyMode(file_path, codes!, writer, statusManager, logParams);
  }
}

/**
 * NEW MODE (v0.2.0): Write multiple small segments with explicit line ranges
 *
 * @param file_path - Path to transcript file
 * @param segments - Array of segments to write
 * @param writer - SegmentWriter instance
 * @param statusManager - StatusManager instance
 * @returns Result object
 */
/** Optional coding log parameters (top-level, shared across all segments in a batch) */
interface CodingLogParams {
  reflexive_note?: string;
  coding_rationale?: string;
  segment_title?: string;
  researcher_decision?: string;
}

async function writeMultiSegmentMode(
  file_path: string,
  segments: CodeSegmentInput[],
  writer: SegmentWriter,
  statusManager: StatusManager,
  logParams: CodingLogParams
): Promise<any> {
  // Write all segments using new multi-segment API
  const result = await writer.writeMultipleSegments(file_path, segments);

  // Read current STATUS for context
  const status = await statusManager.read(file_path);
  const segmentSize = 80; // TODO: Get from STATUS or config

  // Update STATUS with max coded INDEX (not file line!) and last file position
  await statusManager.update(
    file_path,
    result.max_coded_index,
    result.lastFilePosition,
    segmentSize
  );

  // Read updated STATUS for progress
  const updatedStatus = await statusManager.read(file_path);

  // Auto-log to process log
  try {
    const processLogger = new ProcessLogger();
    await processLogger.log(file_path, 'codes_written', {
      phase: '2a',
      context: {
        segment: segments.length > 0
          ? `${segments[0].start_line}-${segments[segments.length - 1].end_line}`
          : undefined,
        code_count: result.total_codes_written,
      },
    });
  } catch {
    // Don't fail the write if logging fails
  }

  // Auto-append to coding log — hierarchical chunk > segments (best-effort)
  try {
    const codingLogWriter = new CodingLogWriter();
    const codingLogPath = codingLogWriter.getLogPath(file_path);
    await codingLogWriter.appendChunk(codingLogPath, segments, {
      chunk_title: logParams.segment_title,
      researcher_decision: logParams.researcher_decision,
      reflexive_note: logParams.reflexive_note,
      coding_rationale: logParams.coding_rationale,
    });
  } catch {
    // Don't fail the write if coding log fails
  }

  return {
    segments_written: result.segments_written,
    codes_written: result.total_codes_written,
    next_segment_ready: result.next_segment_ready,
    progress: `${updatedStatus.codedSegments}/${Math.ceil(status.totalLines / segmentSize)} (${updatedStatus.progress})`
  };
}

/**
 * LEGACY MODE (v0.1.0): Write single 80-line segment using STATUS boundaries
 *
 * Backwards compatible with v0.1.0 behavior.
 *
 * @param file_path - Path to transcript file
 * @param codes - Array of codes for segment
 * @param writer - SegmentWriter instance
 * @param statusManager - StatusManager instance
 * @returns Result object
 */
async function writeLegacyMode(
  file_path: string,
  codes: string[],
  writer: SegmentWriter,
  statusManager: StatusManager,
  logParams: CodingLogParams
): Promise<any> {
  // Validate codes
  if (!codes || codes.length === 0) {
    throw new Error('No codes provided');
  }

  // Read current STATUS
  const status = await statusManager.read(file_path);

  // Calculate segment boundaries
  const segmentSize = 80; // TODO: Get from STATUS or config

  // Start writing from the line AFTER the last coded segment in the FILE
  const fileStartLine = status.lastFilePosition + 1;

  // Calculate how many content lines to code (might be less than segmentSize at end)
  const remainingContentLines = status.totalLines - status.lastCodedLine;
  const contentLinesToCode = Math.min(segmentSize, remainingContentLines);

  // Calculate file end line (0-indexed, inclusive)
  const fileEndLine = fileStartLine + contentLinesToCode - 1;

  // Write segment (v0.1.0 API)
  const result = await writer.writeSegment(file_path, fileStartLine, fileEndLine, codes);

  // Extract actual index number from last coded line
  const content = await fs.readFile(file_path, 'utf-8');
  const lines = content.split('\n');
  const lastCodedLineText = lines[result.endLine];
  const indexMatch = lastCodedLineText.match(/^(\d{4})\s/);
  const actualCodedIndex = indexMatch
    ? parseInt(indexMatch[1], 10)
    : status.lastCodedLine + contentLinesToCode;

  // Update STATUS with INDEX number (not file line!) and FILE position
  const newLastFilePosition = result.endLine;

  await statusManager.update(file_path, actualCodedIndex, newLastFilePosition, segmentSize);

  // Read updated STATUS for progress
  const updatedStatus = await statusManager.read(file_path);

  // Auto-log to process log
  try {
    const processLogger = new ProcessLogger();
    await processLogger.log(file_path, 'codes_written', {
      phase: '2a',
      context: {
        segment: `${fileStartLine}-${fileEndLine}`,
        code_count: result.codesWritten,
      },
    });
  } catch {
    // Don't fail the write if logging fails
  }

  // Auto-append to coding log (best-effort)
  try {
    const codingLogWriter = new CodingLogWriter();
    const codingLogPath = codingLogWriter.getLogPath(file_path);
    const legacySegment = {
      start_line: String(fileStartLine),
      end_line: String(fileEndLine),
      codes,
    };
    await codingLogWriter.appendChunk(codingLogPath, [legacySegment], {
      chunk_title: logParams.segment_title,
      researcher_decision: logParams.researcher_decision,
      reflexive_note: logParams.reflexive_note,
      coding_rationale: logParams.coding_rationale,
    });
  } catch {
    // Don't fail the write if coding log fails
  }

  return {
    segment_written: result.chunkNumber,
    codes_written: result.codesWritten,
    next_segment_ready: result.nextChunkReady,
    progress: `${updatedStatus.codedSegments}/${Math.ceil(status.totalLines / segmentSize)} (${updatedStatus.progress})`
  };
}
