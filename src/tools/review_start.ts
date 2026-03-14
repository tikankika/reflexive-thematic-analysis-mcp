import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { MethodologyLoader } from '../core/methodology_loader.js';
import { ProjectConfig } from '../core/project_config.js';
import { ProcessLogger } from '../core/process_logger.js';

/**
 * review_start - Initialize Phase 2b critical review session
 *
 * Parses a coded transcript, finds the first unreviewed segment
 * (via /reviewed marker), and returns it with methodology instructions.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *
 * Output:
 *   { status, total_segments, segment, progress, methodology, instructions }
 */
export async function reviewStart(args: {
  file_path: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path } = args;

  const reader = new SegmentReader();

  // Extract all segments from coded transcript
  const segments = await reader.extractSegments(file_path);

  if (segments.length === 0) {
    throw new Error(
      `No coded segments found in ${file_path}. Run Phase 2a coding first.`
    );
  }

  // Calculate progress from /reviewed markers
  const reviewedCount = segments.filter((s) => s.reviewed).length;
  const resuming = reviewedCount > 0;

  // Find first unreviewed segment
  const nextUnreviewed = segments.find((s) => !s.reviewed);
  const firstSegment = nextUnreviewed || segments[0];

  // Update project config status (best-effort)
  try {
    const projectConfig = await ProjectConfig.findFromTranscript(file_path);
    if (projectConfig) {
      await projectConfig.load();
      await projectConfig.updateTranscriptStatus(file_path, 'phase2b_in_progress', 'phase2b');
    }
  } catch {
    // Non-critical — status update is best-effort
  }

  // Auto-log session start
  try {
    const processLogger = new ProcessLogger();
    await processLogger.log(file_path, 'session_start', { phase: '2b' });
  } catch {
    // Don't fail review if logging fails
  }

  // Load Phase 2b methodology
  let methodology: string | undefined;
  try {
    const loader = new MethodologyLoader();
    methodology = await loader.loadPhase2b();
  } catch (error) {
    console.error('[review_start] Failed to load Phase 2b methodology:', error);
  }

  return {
    status: resuming ? 'resumed' : 'started',
    total_segments: segments.length,
    current_index: firstSegment.index,
    segment: {
      index: firstSegment.index,
      line_range: `${firstSegment.startIndex}-${firstSegment.endIndex}`,
      text: firstSegment.textLines.join('\n'),
      codes: firstSegment.codes,
      reviewed: firstSegment.reviewed,
    },
    progress: {
      reviewed: reviewedCount,
      remaining: segments.length - reviewedCount,
      percent: segments.length > 0 ? Math.round((reviewedCount / segments.length) * 100) : 0,
    },
    methodology,
    instructions: `
PHASE 2b: CRITICAL CODING REVIEW

CRITICAL — SHOW METHODOLOGY FIRST:
Above is 'methodology' — the Phase 2b methodology document.
You MUST show the FULL methodology content to the researcher BEFORE
you begin reviewing segments. DO NOT summarise — show complete text.
Wait for the researcher's "OK" before proceeding to the first segment.

REVIEW PROCESS (after methodology is read):
For each segment:
1. Read the transcript text carefully
2. Review assigned codes — are they accurate?
3. Write a reflexive note (review_write_note)
4. If needed: revise codes (review_revise_codes)
5. Proceed to next segment (review_next)

TOOLS:
- phase2b_review_next: Next unreviewed segment
- phase2b_review_read_segment: Read specific segment
- phase2b_review_write_note: Write reflexive note
- phase2b_review_revise_codes: Change codes (add/remove/replace)
- phase2b_review_status: Show review progress

THE RESEARCHER HAS INTERPRETIVE AUTHORITY.
    `.trim(),
  };
}
