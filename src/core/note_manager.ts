import { promises as fs } from 'fs';
import { ReviewNotesFile, ReviewNote } from '../types/review.js';

/**
 * NoteManager - Read/write Phase 2b review notes (JSON file)
 *
 * Manages the JSON file that stores reflexive notes, code revision
 * history, and review progress for each segment.
 *
 * File naming: [transcript_name]_review.json
 * Location: Same directory as transcript file
 */
export class NoteManager {
  /**
   * Derive the review notes file path from a transcript path.
   *
   * @param transcriptPath - Path to transcript .md file
   * @returns Path to corresponding _review.json file
   */
  getNotesPath(transcriptPath: string): string {
    return transcriptPath.replace(/\.md$/, '_review.json');
  }

  /**
   * Check if a review notes file exists.
   */
  async exists(notesPath: string): Promise<boolean> {
    try {
      await fs.access(notesPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new review notes file.
   *
   * @param notesPath - Path for the new JSON file
   * @param transcriptName - Filename of the transcript
   * @param researcher - Researcher name
   * @param totalSegments - Total number of coded segments
   * @returns The created ReviewNotesFile
   */
  async create(
    notesPath: string,
    transcriptName: string,
    researcher: string,
    totalSegments: number
  ): Promise<ReviewNotesFile> {
    const now = new Date().toISOString();

    const notesFile: ReviewNotesFile = {
      metadata: {
        transcript: transcriptName,
        created_at: now,
        last_modified: now,
        researcher,
        total_segments: totalSegments,
      },
      segments: [],
    };

    await this.save(notesPath, notesFile);
    return notesFile;
  }

  /**
   * Load an existing review notes file.
   *
   * @param notesPath - Path to _review.json file
   * @returns Parsed ReviewNotesFile
   * @throws Error if file doesn't exist or is malformed
   */
  async load(notesPath: string): Promise<ReviewNotesFile> {
    const content = await fs.readFile(notesPath, 'utf-8');
    const parsed = JSON.parse(content) as ReviewNotesFile;

    // Basic validation
    if (!parsed.metadata || !Array.isArray(parsed.segments)) {
      throw new Error(`Malformed review notes file: ${notesPath}`);
    }

    return parsed;
  }

  /**
   * Save review notes file to disk.
   *
   * @param notesPath - Path to write to
   * @param notesFile - Data to write
   */
  async save(notesPath: string, notesFile: ReviewNotesFile): Promise<void> {
    notesFile.metadata.last_modified = new Date().toISOString();
    const content = JSON.stringify(notesFile, null, 2);
    await fs.writeFile(notesPath, content, 'utf-8');
  }

  /**
   * Get the review note for a specific segment.
   *
   * @param notesFile - Loaded notes file
   * @param segmentIndex - 1-based segment index
   * @returns The note if it exists, or null
   */
  getNote(notesFile: ReviewNotesFile, segmentIndex: number): ReviewNote | null {
    return notesFile.segments.find((n) => n.index === segmentIndex) ?? null;
  }

  /**
   * Add or update a review note for a segment.
   *
   * If a note already exists for this segment, it is replaced.
   *
   * @param notesFile - Loaded notes file (modified in place)
   * @param note - The review note to save
   */
  setNote(notesFile: ReviewNotesFile, note: ReviewNote): void {
    const existingIdx = notesFile.segments.findIndex(
      (n) => n.index === note.index
    );

    if (existingIdx >= 0) {
      notesFile.segments[existingIdx] = note;
    } else {
      notesFile.segments.push(note);
      // Keep sorted by index
      notesFile.segments.sort((a, b) => a.index - b.index);
    }
  }

  /**
   * Find the index of the first unreviewed segment.
   *
   * @param notesFile - Loaded notes file
   * @param totalSegments - Total segments in transcript
   * @returns 1-based index of first unreviewed segment, or -1 if all reviewed
   */
  findNextUnreviewed(notesFile: ReviewNotesFile, totalSegments: number): number {
    const reviewedIndices = new Set(notesFile.segments.map((n) => n.index));

    for (let i = 1; i <= totalSegments; i++) {
      if (!reviewedIndices.has(i)) {
        return i;
      }
    }

    return -1; // All reviewed
  }

  /**
   * Calculate review statistics.
   *
   * @param notesFile - Loaded notes file
   * @param totalSegments - Total segments in transcript
   */
  getStats(
    notesFile: ReviewNotesFile,
    totalSegments: number
  ): {
    reviewed: number;
    remaining: number;
    progressPercent: number;
    segmentsWithRevisions: number;
    totalRevisions: number;
  } {
    const reviewed = notesFile.segments.length;
    const remaining = totalSegments - reviewed;
    const progressPercent =
      totalSegments > 0 ? Math.round((reviewed / totalSegments) * 100) : 0;

    const segmentsWithRevisions = notesFile.segments.filter(
      (n) => n.codes_revised
    ).length;

    const totalRevisions = notesFile.segments.reduce(
      (sum, n) => sum + n.revision_history.length,
      0
    );

    return {
      reviewed,
      remaining,
      progressPercent,
      segmentsWithRevisions,
      totalRevisions,
    };
  }
}
