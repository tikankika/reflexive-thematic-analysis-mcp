import { sessionState } from '../core/session_state.js';
import { SegmentReader } from '../core/segment_reader.js';
import { NoteManager } from '../core/note_manager.js';

/**
 * review_read_segment - Read a specific segment by index
 *
 * Returns segment text, codes, and any existing review note.
 *
 * Input:
 *   file_path: string - Path to coded transcript file
 *   index: number - 1-based segment index
 *
 * Output:
 *   { segment, existing_note }
 */
export async function reviewReadSegment(args: {
  file_path: string;
  index: number;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, index } = args;

  const reader = new SegmentReader();
  const noteManager = new NoteManager();

  // Get the specific segment
  const segment = await reader.getSegment(file_path, index);

  // Check for existing note
  const notesPath = noteManager.getNotesPath(file_path);
  const notesExist = await noteManager.exists(notesPath);

  let existingNote = null;
  if (notesExist) {
    const notesFile = await noteManager.load(notesPath);
    existingNote = noteManager.getNote(notesFile, index);
  }

  return {
    segment: {
      index: segment.index,
      line_range: `${segment.startIndex}-${segment.endIndex}`,
      text: segment.textLines.join('\n'),
      codes: segment.codes,
    },
    existing_note: existingNote,
  };
}
