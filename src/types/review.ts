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

  /** Whether this segment has been reviewed (has /reviewed marker) */
  reviewed: boolean;

  /** Date from /reviewed marker, if present (e.g., "2026-03-11") */
  reviewedAt?: string;
}
