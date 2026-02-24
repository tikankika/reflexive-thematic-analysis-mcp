import { sessionState } from '../core/session_state.js';
import { ProcessLogger } from '../core/process_logger.js';

/**
 * log_session_end - Summarize and close a coding or review session
 *
 * Claude proposes a summary of key analytical decisions; researcher can
 * modify before confirming. Call before ending any coding or review session.
 *
 * Input:
 *   file_path: string - Transcript as context reference
 *   summary: string - Claude's summary of session
 *   key_decisions: string[] - List of analytical decisions made
 *   unresolved?: string[] - Open questions for next session
 *   phase?: string - "2a", "2b", "3", etc.
 */
export async function logSessionEnd(args: {
  file_path: string;
  summary: string;
  key_decisions: string[];
  unresolved?: string[];
  phase?: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, summary, key_decisions, unresolved, phase } = args;

  const logger = new ProcessLogger();
  const logPath = logger.getLogPath(file_path);

  // Count events before adding session_end
  const eventsBefore = await logger.count(logPath);

  await logger.log(file_path, 'session_end', {
    phase,
    description: summary,
    key_decisions,
    unresolved,
  });

  const totalEvents = await logger.count(logPath);

  return {
    success: true,
    logged_at: new Date().toISOString(),
    log_path: logPath,
    session_events: totalEvents - eventsBefore,
    total_events: totalEvents,
  };
}
