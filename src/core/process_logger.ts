import { promises as fs } from 'fs';
import { ProcessEvent } from '../types/process_log.js';

/**
 * ProcessLogger - Append-only JSONL writer for dialogic process events.
 *
 * Each transcript gets a companion _process_log.jsonl file.
 * Events are appended, never overwritten.
 *
 * File naming: [transcript_name]_process_log.jsonl
 * Location: Same directory as transcript file and _review.json
 */
export class ProcessLogger {
  /**
   * Derive the process log path from a transcript path.
   */
  getLogPath(transcriptPath: string): string {
    return transcriptPath.replace(/\.md$/, '_process_log.jsonl');
  }

  /**
   * Append a single event to the log.
   * Creates the file if it doesn't exist.
   */
  async append(logPath: string, event: ProcessEvent): Promise<void> {
    const line = JSON.stringify(event) + '\n';
    await fs.appendFile(logPath, line, 'utf-8');
  }

  /**
   * Convenience: create event with timestamp and append.
   */
  async log(
    transcriptPath: string,
    type: ProcessEvent['type'],
    fields: Omit<ProcessEvent, 'timestamp' | 'type'>
  ): Promise<string> {
    const logPath = this.getLogPath(transcriptPath);
    const event: ProcessEvent = {
      timestamp: new Date().toISOString(),
      type,
      ...fields,
    };
    await this.append(logPath, event);
    return logPath;
  }

  /**
   * Read all events from a log file.
   */
  async readAll(logPath: string): Promise<ProcessEvent[]> {
    try {
      const content = await fs.readFile(logPath, 'utf-8');
      return content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line) as ProcessEvent);
    } catch {
      return [];
    }
  }

  /**
   * Check if a log file exists.
   */
  async exists(logPath: string): Promise<boolean> {
    try {
      await fs.access(logPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Count events in a log file.
   */
  async count(logPath: string): Promise<number> {
    const events = await this.readAll(logPath);
    return events.length;
  }

  /**
   * Get events filtered by type.
   */
  async getByType(
    logPath: string,
    type: ProcessEvent['type']
  ): Promise<ProcessEvent[]> {
    const events = await this.readAll(logPath);
    return events.filter((e) => e.type === type);
  }
}
