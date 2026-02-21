import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { NoteManager } from '../core/note_manager.js';
import { ReviewStatus } from '../types/review.js';

/**
 * review_status - Show Phase 2b review progress
 *
 * Returns statistics on review progress including segments reviewed,
 * remaining, and code revisions made.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *
 * Output:
 *   ReviewStatus object
 */
export async function reviewStatus(args: {
  file_path: string;
}): Promise<ReviewStatus> {
  sessionState.requireInit();

  const { file_path } = args;

  const reader = new SegmentReader();
  const noteManager = new NoteManager();

  // Count segments
  const totalSegments = await reader.countSegments(file_path);

  // Load notes
  const notesPath = noteManager.getNotesPath(file_path);
  const notesExist = await noteManager.exists(notesPath);

  if (!notesExist) {
    return {
      file: file_path,
      total_segments: totalSegments,
      reviewed: 0,
      remaining: totalSegments,
      progress_percent: 0,
      segments_with_revisions: 0,
      total_revisions: 0,
    };
  }

  const notesFile = await noteManager.load(notesPath);
  const stats = noteManager.getStats(notesFile, totalSegments);

  return {
    file: file_path,
    total_segments: totalSegments,
    reviewed: stats.reviewed,
    remaining: stats.remaining,
    progress_percent: stats.progressPercent,
    segments_with_revisions: stats.segmentsWithRevisions,
    total_revisions: stats.totalRevisions,
  };
}
