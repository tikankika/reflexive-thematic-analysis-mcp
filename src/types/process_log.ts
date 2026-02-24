/**
 * Process Log Type Definitions
 *
 * Types for the dialogic reflexivity infrastructure.
 * Captures epistemically significant events during researcher-AI dialogue.
 */

// =============================================================================
// Event Types
// =============================================================================

/**
 * Categories of epistemically significant events.
 */
export type EventType =
  | 'correction'      // Researcher corrects AI's pattern
  | 'focus'           // Researcher redirects toward RQ
  | 'rejection'       // Researcher rejects AI suggestion
  | 'discovery'       // New pattern or insight emerges
  | 'convention'      // New coding convention established
  | 'methodology'     // Methodological decision made
  | 'tool_issue'      // Tool problem affecting analysis
  | 'meta_reflexive'  // Reflection on the process itself
  | 'codes_written'   // Auto: segment coded
  | 'codes_revised'   // Auto: codes revised in review
  | 'session_start'   // Auto: coding/review session begun
  | 'session_end'     // Session summary
  | 'other';          // Anything else

// =============================================================================
// Event Structure
// =============================================================================

/**
 * A single process event — one line in the JSONL file.
 */
export interface ProcessEvent {
  /** ISO timestamp */
  timestamp: string;

  /** Event category */
  type: EventType;

  /** Current RTA phase */
  phase?: string;

  /** What happened — in Claude's words or auto-generated */
  description?: string;

  /** Researcher's exact words (in vivo from dialogue) */
  researcher_words?: string;

  /** Contextual reference */
  context?: {
    /** Segment line range, e.g. "0213-0225" */
    segment?: string;
    /** Chunk number */
    chunk?: number;
    /** Codes before change */
    codes_before?: string[];
    /** Codes after change */
    codes_after?: string[];
    /** Number of codes written */
    code_count?: number;
  };

  /** For session_end: key decisions this session */
  key_decisions?: string[];

  /** For session_end: unresolved questions */
  unresolved?: string[];
}
