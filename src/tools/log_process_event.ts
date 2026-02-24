import { sessionState } from '../core/session_state.js';
import { ProcessLogger } from '../core/process_logger.js';
import { EventType, ProcessEvent } from '../types/process_log.js';

/**
 * log_process_event - Log a reflexive process event during coding or review
 *
 * Called by Claude when researcher corrects AI patterns, redirects analytical
 * focus, rejects a suggestion, discovers something, or establishes a convention.
 * Captures the dialogic process that existing tools don't preserve.
 *
 * Input:
 *   file_path: string - Transcript as context reference
 *   type: EventType - Required
 *   researcher_words?: string - Researcher's exact words (in vivo)
 *   description?: string - Claude's summary of what happened
 *   phase?: string - "2a", "2b", "3", etc.
 *   context?: { segment?, chunk?, codes_before?, codes_after? }
 */

// Event types that should have researcher_words
const RESEARCHER_EVENT_TYPES: EventType[] = [
  'correction',
  'focus',
  'rejection',
  'discovery',
  'convention',
  'methodology',
  'meta_reflexive',
];

export async function logProcessEvent(args: {
  file_path: string;
  type: EventType;
  researcher_words?: string;
  description?: string;
  phase?: string;
  context?: {
    segment?: string;
    chunk?: number;
    codes_before?: string[];
    codes_after?: string[];
  };
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, type, researcher_words, description, phase, context } =
    args;

  // Soft warning if researcher_words missing on researcher-initiated events
  let warning: string | undefined;
  if (
    RESEARCHER_EVENT_TYPES.includes(type) &&
    !researcher_words
  ) {
    warning =
      `Event type '${type}' should include researcher_words (their exact words). ` +
      `The event was logged but researcher_words is the primary data — add it if possible.`;
  }

  const logger = new ProcessLogger();
  const fields: Omit<ProcessEvent, 'timestamp' | 'type'> = {};
  if (phase) fields.phase = phase;
  if (description) fields.description = description;
  if (researcher_words) fields.researcher_words = researcher_words;
  if (context) fields.context = context;

  const logPath = await logger.log(file_path, type, fields);
  const eventCount = await logger.count(logPath);

  return {
    success: true,
    logged_at: new Date().toISOString(),
    log_path: logPath,
    event_count: eventCount,
    type,
    ...(warning ? { warning } : {}),
  };
}
