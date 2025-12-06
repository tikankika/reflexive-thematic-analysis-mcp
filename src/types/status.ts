/**
 * STATUS tracking interface for coding progress
 * Stored as YAML frontmatter in transcript files
 */
export interface Status {
  /** Original transcript filename */
  file: string;

  /** Total lines in transcript (content only, excluding STATUS) */
  totalLines: number;

  /** Last CONTENT line number that was coded (1-indexed) */
  lastCodedLine: number;

  /** Last FILE line position after writing (0-indexed) */
  lastFilePosition: number;

  /** Starting CONTENT line for next segment (1-indexed) */
  nextSegmentStart: number;

  /** Number of segments completed */
  codedSegments: number;

  /** Progress as percentage string (e.g., "16%") */
  progress: string;

  /** ISO date when STATUS was created/updated */
  date: string;
}

/**
 * Raw STATUS as it appears in YAML frontmatter
 * Used for parsing and serialization
 */
export interface RawStatus {
  'CODING-STATUS': {
    File: string;
    'Total-lines': number;
    'Last-coded-line': number;
    'Last-file-position': number;
    'Next-segment': string;  // e.g., "241-320"
    Progress: string;        // e.g., "3/18"
    Date: string;
  };
}
