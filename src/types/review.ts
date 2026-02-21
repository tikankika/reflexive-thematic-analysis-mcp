/**
 * Phase 2b: Critical Coding Review - Type Definitions
 *
 * Types for the researcher-driven critical review of AI-assisted coding.
 * Phase 2b sits between Phase 2a (initial coding) and Phase 3 (theme generation).
 */

// =============================================================================
// Segment Types
// =============================================================================

/**
 * A coded segment extracted from a transcript file.
 * Represents the content between /segment and /slut_segment markers.
 */
export interface ReviewSegment {
  /** 1-based segment index within the transcript */
  index: number;

  /** Starting line index (4-digit permanent identifier, e.g., "0030") */
  startIndex: string;

  /** Ending line index (4-digit permanent identifier, e.g., "0042") */
  endIndex: string;

  /** Raw transcript text lines (without markers or codes) */
  textLines: string[];

  /** Codes assigned to this segment */
  codes: string[];

  /** Starting position in file (0-indexed line number) */
  fileStartLine: number;

  /** Ending position in file (0-indexed line number, inclusive of /slut_segment) */
  fileEndLine: number;
}

// =============================================================================
// Note Types
// =============================================================================

/**
 * A single code revision action within a review note.
 */
export interface CodeRevision {
  /** Type of revision */
  action: 'add' | 'remove' | 'replace';

  /** Codes involved in this revision */
  codes: string[];

  /** ISO timestamp */
  timestamp: string;

  /** Optional researcher rationale */
  note?: string;
}

/**
 * Review note for a single segment.
 */
export interface ReviewNote {
  /** 1-based segment index */
  index: number;

  /** Line range for reference (e.g., "0030-0042") */
  line_range: string;

  /** Codes at time of review (snapshot) */
  codes: string[];

  /** Researcher's reflexive note (markdown) */
  reflexive_note: string;

  /** ISO timestamp when note was written/last updated */
  reviewed_at: string;

  /** Whether codes were revised during this review */
  codes_revised: boolean;

  /** History of code revisions (if any) */
  revision_history: CodeRevision[];
}

/**
 * Top-level structure for the review notes JSON file.
 */
export interface ReviewNotesFile {
  metadata: {
    transcript: string;
    created_at: string;
    last_modified: string;
    researcher: string;
    total_segments: number;
  };

  segments: ReviewNote[];
}

// =============================================================================
// Session / Status Types
// =============================================================================

/**
 * Review session state (in-memory, not persisted).
 */
export interface ReviewSession {
  /** Path to transcript file being reviewed */
  filePath: string;

  /** Path to review notes JSON file */
  notesPath: string;

  /** All segments extracted from transcript */
  segments: ReviewSegment[];

  /** Total segment count */
  totalSegments: number;

  /** Index of current segment being reviewed (1-based) */
  currentIndex: number;
}

/**
 * Review progress status returned by review_status tool.
 */
export interface ReviewStatus {
  /** Transcript file being reviewed */
  file: string;

  /** Total segments in transcript */
  total_segments: number;

  /** Segments that have been reviewed (have notes) */
  reviewed: number;

  /** Segments remaining */
  remaining: number;

  /** Progress as percentage */
  progress_percent: number;

  /** Number of segments where codes were revised */
  segments_with_revisions: number;

  /** Total code revisions across all segments */
  total_revisions: number;
}
