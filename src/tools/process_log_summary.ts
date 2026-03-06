/**
 * process_log_summary - Surface process log events with filtering
 *
 * Reads _process_log.jsonl, filters by event type or last N events,
 * groups by type with counts, and returns a structured summary.
 *
 * CRITICAL: Requires init() to be called first.
 */

import { sessionState } from '../core/session_state.js';
import { ProcessLogger } from '../core/process_logger.js';
import { ProcessEvent } from '../types/process_log.js';

export async function processLogSummary(args: {
  file_path: string;
  filter_type?: string;
  last_n?: number;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, filter_type, last_n } = args;
  const logger = new ProcessLogger();
  const logPath = logger.getLogPath(file_path);

  let events = await logger.readAll(logPath);

  if (events.length === 0) {
    return {
      transcript: file_path,
      total_events: 0,
      events: [],
      summary: {},
      message: 'No process log events found. Start a coding or review session first.',
    };
  }

  // Apply filter_type if specified
  if (filter_type) {
    events = events.filter((e) => e.type === filter_type);
  }

  // Apply last_n if specified
  if (last_n && last_n > 0) {
    events = events.slice(-last_n);
  }

  // Group by type with counts
  const typeCounts: Record<string, number> = {};
  for (const e of events) {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  }

  // Extract key patterns
  const corrections = events.filter((e) => e.type === 'correction');
  const rejections = events.filter((e) => e.type === 'rejection');
  const discoveries = events.filter((e) => e.type === 'discovery');
  const conventions = events.filter((e) => e.type === 'convention');

  // Build summary
  const patterns: string[] = [];
  if (corrections.length > 0) {
    patterns.push(`${corrections.length} correction(s) — researcher corrected AI patterns`);
  }
  if (rejections.length > 0) {
    patterns.push(`${rejections.length} rejection(s) — researcher rejected AI suggestions`);
  }
  if (discoveries.length > 0) {
    patterns.push(`${discoveries.length} discovery/ies — new patterns or insights emerged`);
  }
  if (conventions.length > 0) {
    patterns.push(`${conventions.length} convention(s) — coding conventions established`);
  }

  // Session boundaries
  const sessions = events.filter((e) => e.type === 'session_start' || e.type === 'session_end');

  return {
    transcript: file_path,
    total_events: events.length,
    filter: {
      type: filter_type || 'all',
      last_n: last_n || 'all',
    },
    summary: typeCounts,
    patterns,
    sessions: sessions.length > 0
      ? sessions.map((s) => ({
          type: s.type,
          timestamp: s.timestamp,
          phase: s.phase,
          description: s.description,
        }))
      : [],
    events: events.map((e) => ({
      timestamp: e.timestamp,
      type: e.type,
      phase: e.phase,
      description: e.description,
      researcher_words: e.researcher_words,
    })),
  };
}
