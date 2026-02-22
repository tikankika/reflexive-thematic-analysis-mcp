import { basename } from 'path';
import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { NoteManager } from '../core/note_manager.js';
import { MethodologyLoader } from '../core/methodology_loader.js';
import { ProjectConfig } from '../core/project_config.js';

/**
 * review_start - Initialize Phase 2b critical review session
 *
 * Parses a coded transcript, creates or resumes a review notes file,
 * and returns the first segment with methodology instructions.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   researcher?: string - Researcher name (default: "researcher")
 *
 * Output:
 *   { status, total_segments, segment, existing_notes, methodology, instructions }
 */
export async function reviewStart(args: {
  file_path: string;
  researcher?: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, researcher = 'researcher' } = args;

  const reader = new SegmentReader();
  const noteManager = new NoteManager();

  // Extract all segments from coded transcript
  const segments = await reader.extractSegments(file_path);

  if (segments.length === 0) {
    throw new Error(
      `No coded segments found in ${file_path}. Run Phase 2a coding first.`
    );
  }

  // Check for existing review notes
  const notesPath = noteManager.getNotesPath(file_path);
  const notesExist = await noteManager.exists(notesPath);

  let notesFile;
  let resuming = false;

  if (notesExist) {
    notesFile = await noteManager.load(notesPath);
    resuming = true;
  } else {
    notesFile = await noteManager.create(
      notesPath,
      basename(file_path),
      researcher,
      segments.length
    );
  }

  // Find first segment to review
  const nextUnreviewed = noteManager.findNextUnreviewed(notesFile, segments.length);
  const startIndex = nextUnreviewed === -1 ? 1 : nextUnreviewed;
  const firstSegment = segments[startIndex - 1];

  // Get existing note for this segment (if resuming)
  const existingNote = noteManager.getNote(notesFile, startIndex);

  // Get review stats
  const stats = noteManager.getStats(notesFile, segments.length);

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
    current_index: startIndex,
    segment: {
      index: firstSegment.index,
      line_range: `${firstSegment.startIndex}-${firstSegment.endIndex}`,
      text: firstSegment.textLines.join('\n'),
      codes: firstSegment.codes,
    },
    existing_note: existingNote,
    progress: {
      reviewed: stats.reviewed,
      remaining: stats.remaining,
      percent: stats.progressPercent,
      revisions: stats.totalRevisions,
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
