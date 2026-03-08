/**
 * Chunk of transcript to be coded
 *
 * A chunk is a technical reading unit (typically 60-100 lines) used to
 * process large transcripts in manageable pieces. This is different from
 * a semantic "segment" (marked with /segment in output) which is a
 * meaningful coding unit of variable size.
 */
export interface Chunk {
  /** Chunk number (1-indexed) */
  number: number;

  /** Starting line number (0-indexed in file) */
  startLine: number;

  /** Ending line number (0-indexed in file) */
  endLine: number;

  /** Raw text content of chunk */
  text: string;
}

/**
 * Configuration for chunk size
 */
export interface ChunkConfig {
  /** Minimum lines per chunk (default: 60) */
  minLines?: number;

  /** Maximum lines per chunk (default: 100) */
  maxLines?: number;

  /** Default chunk size (default: 80) */
  defaultSize?: number;
}

/**
 * Result of writing a coded chunk
 */
export interface ChunkWriteResult {
  /** Chunk number that was written */
  chunkNumber: number;

  /** Starting line where chunk was written */
  startLine: number;

  /** Ending line where chunk was written */
  endLine: number;

  /** Number of codes written */
  codesWritten: number;

  /** Whether next chunk is ready to code */
  nextChunkReady: boolean;
}

// ============================================================================
// Backwards Compatibility
// ============================================================================

/**
 * @deprecated Use Chunk instead
 */
export type Segment = Chunk;

/**
 * @deprecated Use ChunkConfig instead
 */
export type SegmentConfig = ChunkConfig;

/**
 * @deprecated Use ChunkWriteResult instead
 */
export type SegmentWriteResult = ChunkWriteResult;

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

  /**
   * Full analytical text for this segment (for coding log).
   * Contains everything: title, quotes, codes by level, reflexive note.
   * Written as-is to the coding log — no parsing or restructuring.
   * @example "SPEAKER_09 (0612–0617) — Elever döljer AI\n\"Det var många...\"\nNIVÅ 1: ...\nREFLEXIV NOT: ..."
   */
  log_text?: string;
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

  /** Highest INDEX NUMBER coded (e.g., 464 from "0464 text..."), for STATUS */
  max_coded_index: number;

  /** File position after last segment (0-indexed, for STATUS) */
  lastFilePosition: number;

  /** Whether next segment is ready */
  next_segment_ready: boolean;

  /** Progress string (set by caller) */
  progress: string;
}
