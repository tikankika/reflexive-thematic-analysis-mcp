import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { NoteManager } from '../core/note_manager.js';

/**
 * review_next - Get next unreviewed segment
 *
 * Finds the next segment that hasn't been reviewed yet.
 * Returns "complete" if all segments have been reviewed.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *
 * Output:
 *   { segment, has_existing_note, progress } or { status: "complete", ... }
 */
export async function reviewNext(args: {
  file_path: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path } = args;

  const reader = new SegmentReader();
  const noteManager = new NoteManager();

  // Extract segments
  const segments = await reader.extractSegments(file_path);
  const totalSegments = segments.length;

  // Load notes
  const notesPath = noteManager.getNotesPath(file_path);
  const notesExist = await noteManager.exists(notesPath);

  if (!notesExist) {
    throw new Error(
      `No review notes file found. Call phase2b_review_start first.`
    );
  }

  const notesFile = await noteManager.load(notesPath);
  const stats = noteManager.getStats(notesFile, totalSegments);

  // Find next unreviewed
  const nextIndex = noteManager.findNextUnreviewed(notesFile, totalSegments);

  if (nextIndex === -1) {
    return {
      status: 'complete',
      message: 'All segments have been reviewed!',
      progress: {
        reviewed: stats.reviewed,
        remaining: 0,
        percent: 100,
        revisions: stats.totalRevisions,
      },
    };
  }

  const segment = segments[nextIndex - 1];
  const existingNote = noteManager.getNote(notesFile, nextIndex);

  return {
    status: 'next_segment',
    segment: {
      index: segment.index,
      line_range: `${segment.startIndex}-${segment.endIndex}`,
      text: segment.textLines.join('\n'),
      codes: segment.codes,
    },
    has_existing_note: existingNote !== null,
    existing_note: existingNote,
    progress: {
      reviewed: stats.reviewed,
      remaining: stats.remaining,
      percent: stats.progressPercent,
      revisions: stats.totalRevisions,
    },
  };
}
