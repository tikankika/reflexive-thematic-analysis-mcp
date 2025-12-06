/**
 * Segment of transcript to be coded
 */
export interface Segment {
  /** Segment number (1-indexed) */
  number: number;

  /** Starting line number (0-indexed in file) */
  startLine: number;

  /** Ending line number (0-indexed in file) */
  endLine: number;

  /** Raw text content of segment */
  text: string;
}

/**
 * Configuration for segment size
 */
export interface SegmentConfig {
  /** Minimum lines per segment (default: 60) */
  minLines?: number;

  /** Maximum lines per segment (default: 100) */
  maxLines?: number;

  /** Default segment size (default: 80) */
  defaultSize?: number;
}

/**
 * Result of writing a coded segment
 */
export interface SegmentWriteResult {
  /** Segment number that was written */
  segmentNumber: number;

  /** Starting line where segment was written */
  startLine: number;

  /** Ending line where segment was written */
  endLine: number;

  /** Number of codes written */
  codesWritten: number;

  /** Whether next segment is ready to code */
  nextSegmentReady: boolean;
}

// ============================================================================
// Multi-Segment API Types (v0.2.0)
// ============================================================================

/**
 * Small segment input for multi-segment coding (v0.2.0)
 *
 * Used when Claude identifies specific meaningful units to code.
 * Each segment specifies exact line range and associated codes.
 *
 * @since v0.2.0
 */
export interface CodeSegmentInput {
  /**
   * Starting line number in 4-digit format
   * @example "0030"
   */
  start_line: string;

  /**
   * Ending line number in 4-digit format (inclusive)
   * @example "0034"
   */
  end_line: string;

  /**
   * Array of codes for this specific segment
   * @example ["#AI_usage__lins1", "#student_perspective__lins2"]
   * @note Can be empty array (segment markers only)
   */
  codes: string[];
}

/**
 * Parsed segment after validation (internal use)
 *
 * @internal
 */
export interface ParsedCodeSegment {
  /** Starting line (0-indexed, converted from 4-digit format) */
  startLine: number;

  /** Ending line (0-indexed, inclusive) */
  endLine: number;

  /** Codes for this segment */
  codes: string[];

  /** Original input (for error messages) */
  original: CodeSegmentInput;
}

/**
 * Result of writing multiple segments
 *
 * @since v0.2.0
 */
export interface MultiSegmentWriteResult {
  /** Number of segments written */
  segments_written: number;

  /** Total codes written across all segments */
  total_codes_written: number;

  /** Max content line number coded (1-indexed, for STATUS) */
  max_coded_line: number;

  /** File position after last segment (0-indexed, for STATUS) */
  lastFilePosition: number;

  /** Whether next segment is ready */
  next_segment_ready: boolean;

  /** Progress string (set by caller) */
  progress: string;
}
