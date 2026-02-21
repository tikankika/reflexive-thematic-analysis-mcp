import { basename } from 'path';
import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { NoteManager } from '../core/note_manager.js';
import { ReviewNote } from '../types/review.js';

/**
 * review_write_note - Write a reflexive note for a segment
 *
 * Creates or updates a review note for the specified segment.
 * The note captures the researcher's analytical observations.
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
  const noteManager = new NoteManager();

  // Get segment data for metadata
  const segment = await reader.getSegment(file_path, index);
  const totalSegments = await reader.countSegments(file_path);

  // Load or create notes file
  const notesPath = noteManager.getNotesPath(file_path);
  const notesExist = await noteManager.exists(notesPath);

  let notesFile;
  if (notesExist) {
    notesFile = await noteManager.load(notesPath);
  } else {
    notesFile = await noteManager.create(
      notesPath,
      basename(file_path),
      'researcher',
      totalSegments
    );
  }

  // Check for existing note to preserve revision history
  const existingNote = noteManager.getNote(notesFile, index);
  const now = new Date().toISOString();

  const reviewNote: ReviewNote = {
    index,
    line_range: `${segment.startIndex}-${segment.endIndex}`,
    codes: segment.codes,
    reflexive_note: note,
    reviewed_at: now,
    codes_revised: existingNote?.codes_revised ?? false,
    revision_history: existingNote?.revision_history ?? [],
  };

  // Save
  noteManager.setNote(notesFile, reviewNote);
  await noteManager.save(notesPath, notesFile);

  // Get updated stats
  const stats = noteManager.getStats(notesFile, totalSegments);

  return {
    success: true,
    saved_at: now,
    segment_index: index,
    line_range: reviewNote.line_range,
    progress: {
      reviewed: stats.reviewed,
      remaining: stats.remaining,
      percent: stats.progressPercent,
      revisions: stats.totalRevisions,
    },
  };
}
