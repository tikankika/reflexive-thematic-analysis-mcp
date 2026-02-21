import { basename } from 'path';
import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { SegmentReviser } from '../core/segment_reviser.js';
import { NoteManager } from '../core/note_manager.js';
import { CodeRevision } from '../types/review.js';

/**
 * review_revise_codes - Revise codes for a segment during review
 *
 * Modifies codes in the transcript file and logs the revision
 * in the review notes file.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   segment_index: number - 1-based segment index
 *   action: "add" | "remove" | "replace" - Revision type
 *   codes: string[] - Codes to add/remove/replace with
 *
 * Output:
 *   { success, updated_codes, previous_codes, revision_logged }
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
  const noteManager = new NoteManager();
  const reader = new SegmentReader();

  // Revise codes in the transcript file
  const { updatedCodes, previousCodes } = await reviser.reviseCodes(
    file_path,
    segment_index,
    action,
    codes
  );

  // Log revision in review notes
  const notesPath = noteManager.getNotesPath(file_path);
  const notesExist = await noteManager.exists(notesPath);
  const totalSegments = await reader.countSegments(file_path);

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

  // Create revision record
  const revision: CodeRevision = {
    action,
    codes,
    timestamp: new Date().toISOString(),
  };

  // Update or create the note for this segment
  const existingNote = noteManager.getNote(notesFile, segment_index);

  if (existingNote) {
    existingNote.codes_revised = true;
    existingNote.revision_history.push(revision);
    existingNote.codes = updatedCodes;
    noteManager.setNote(notesFile, existingNote);
  } else {
    // Get segment metadata for new note
    const segments = await reader.extractSegments(file_path);
    const segment = segments[segment_index - 1];

    noteManager.setNote(notesFile, {
      index: segment_index,
      line_range: `${segment.startIndex}-${segment.endIndex}`,
      codes: updatedCodes,
      reflexive_note: '',
      reviewed_at: new Date().toISOString(),
      codes_revised: true,
      revision_history: [revision],
    });
  }

  await noteManager.save(notesPath, notesFile);

  return {
    success: true,
    segment_index,
    action,
    updated_codes: updatedCodes,
    previous_codes: previousCodes,
    revision_logged: true,
  };
}
