/**
 * session_reflection - Structured reflection based on process log data
 *
 * Reads the process log, counts events by type, and generates
 * reflection questions grounded in the session's actual data.
 *
 * CRITICAL: Requires init() to be called first.
 */

import { sessionState } from '../core/session_state.js';
import { ProcessLogger } from '../core/process_logger.js';
import { ProcessEvent } from '../types/process_log.js';

export async function sessionReflection(args: {
  file_path: string;
  phase?: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, phase } = args;
  const logger = new ProcessLogger();
  const logPath = logger.getLogPath(file_path);

  const events = await logger.readAll(logPath);

  if (events.length === 0) {
    return {
      status: 'no_events',
      message: 'No process log events found for this transcript. Start a coding or review session first.',
      action: 'Start a session with code_start or review_start.',
    };
  }

  // Count events by type
  const typeCounts: Record<string, number> = {};
  for (const e of events) {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  }

  // Find the latest session_start to scope "this session"
  const sessionStarts = events.filter((e) => e.type === 'session_start');
  const lastSessionStart = sessionStarts.length > 0
    ? sessionStarts[sessionStarts.length - 1]
    : null;

  // Events since last session start
  const sessionEvents = lastSessionStart
    ? events.filter((e) => e.timestamp >= lastSessionStart.timestamp)
    : events;

  const sessionTypeCounts: Record<string, number> = {};
  for (const e of sessionEvents) {
    sessionTypeCounts[e.type] = (sessionTypeCounts[e.type] || 0) + 1;
  }

  // Generate reflection questions based on actual data
  const questions = generateReflectionQuestions(sessionEvents, sessionTypeCounts, phase);

  // Extract researcher_words from this session for reflection
  const researcherWords = sessionEvents
    .filter((e) => e.researcher_words)
    .map((e) => ({
      type: e.type,
      words: e.researcher_words,
      timestamp: e.timestamp,
    }));

  return {
    transcript: file_path,
    phase: phase || 'unknown',
    total_events: events.length,
    session_events: sessionEvents.length,
    event_counts: {
      all_time: typeCounts,
      this_session: sessionTypeCounts,
    },
    researcher_voice: researcherWords.length > 0
      ? researcherWords.slice(-5) // Last 5 researcher statements
      : [],
    reflection_questions: questions,
    action: 'Discuss these questions with the researcher. Then call log_session_end to close the session.',
  };
}

function generateReflectionQuestions(
  events: ProcessEvent[],
  counts: Record<string, number>,
  phase?: string
): string[] {
  const questions: string[] = [];

  // Always ask about overall experience
  questions.push(
    'What was the most significant analytical moment in this session?'
  );

  // Questions based on corrections
  if ((counts['correction'] || 0) > 0) {
    const n = counts['correction'];
    questions.push(
      `You corrected the AI ${n} time(s) this session. Do these corrections reveal a pattern in how the AI misreads your data?`
    );
  }

  // Questions based on rejections
  if ((counts['rejection'] || 0) > 0) {
    const n = counts['rejection'];
    questions.push(
      `You rejected ${n} AI suggestion(s). What does this tell you about the boundary between your analytical perspective and the AI's tendencies?`
    );
  }

  // Questions based on discoveries
  if ((counts['discovery'] || 0) > 0) {
    questions.push(
      'You noted new discoveries. How do these connect to your research questions? Are any of them surprising given your theoretical framework?'
    );
  }

  // Questions based on conventions
  if ((counts['convention'] || 0) > 0) {
    questions.push(
      'New coding conventions were established. Do these conventions reflect your epistemological commitments, or are they pragmatic shortcuts?'
    );
  }

  // No researcher-initiated events
  const researcherEvents = (counts['correction'] || 0) +
    (counts['rejection'] || 0) +
    (counts['focus'] || 0) +
    (counts['discovery'] || 0);

  if (researcherEvents === 0) {
    questions.push(
      'No corrections, rejections, or redirections were logged this session. ' +
      'Was the AI consistently aligned with your interpretation, or were there moments of disagreement that went unlogged?'
    );
  }

  // Phase-specific questions
  if (phase === '2a' || phase === 'phase2a') {
    questions.push(
      'Are your codes staying close to the data (semantic), or are you already interpreting at a latent level? Is that appropriate at this stage?'
    );
  } else if (phase === '2b' || phase === 'phase2b') {
    questions.push(
      'During review, did you find codes that no longer fit? What changed in your understanding between initial coding and review?'
    );
  } else if (phase === '3' || phase === 'phase3') {
    questions.push(
      'As you generate themes, are they driven by the data patterns or by your research questions? How do you maintain the balance?'
    );
  }

  return questions;
}
