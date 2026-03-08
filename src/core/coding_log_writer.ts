import { promises as fs } from 'fs';

/**
 * CodingLogWriter - Append-only markdown writer for coding logs.
 *
 * Each transcript gets a companion _coding_log.md file.
 * Entries are appended, never overwritten. Human-readable markdown
 * format for colleague review (Tier 2 in dialogic reflexivity model).
 *
 * File naming: [transcript_name]_coding_log.md
 * Location: Same directory as transcript file
 */

export interface CodingLogEntry {
  /** Segment title, e.g. "SPEAKER_06 (0281–0295) — Elever söker direktsvar" */
  segment_title?: string;
  /** Line range string, e.g. "0281–0295" */
  line_range?: string;
  /** Researcher decision: accepted, modified, rejected, or free text */
  researcher_decision?: string;
  /** Codes written in this segment */
  codes: string[];
  /** Reflexive note from Claude or researcher */
  reflexive_note?: string;
  /** Rationale for why this segment was coded */
  coding_rationale?: string;
}

export class CodingLogWriter {
  /**
   * Derive the coding log path from a transcript path.
   */
  getLogPath(transcriptPath: string): string {
    return transcriptPath.replace(/\.md$/, '_coding_log.md');
  }

  /**
   * Append a coding log entry as formatted markdown.
   * Creates the file if it doesn't exist.
   */
  async append(logPath: string, entry: CodingLogEntry): Promise<void> {
    const timestamp = new Date().toISOString();
    const lines: string[] = [];

    // Heading
    const title = entry.segment_title || `Segment ${entry.line_range || '(okänt)'}`;
    lines.push(`## ${title}`);
    lines.push(`**Tidpunkt:** ${timestamp}`);

    if (entry.line_range) {
      lines.push(`**Rader:** ${entry.line_range}`);
    }
    if (entry.researcher_decision) {
      lines.push(`**Beslut:** ${entry.researcher_decision}`);
    }

    // Codes
    lines.push('');
    lines.push('### Koder');
    if (entry.codes.length > 0) {
      for (const code of entry.codes) {
        lines.push(`- ${code}`);
      }
    } else {
      lines.push('*(inga koder)*');
    }

    // Reflexive note
    if (entry.reflexive_note) {
      lines.push('');
      lines.push('### Reflexiv not');
      lines.push(entry.reflexive_note);
    }

    // Coding rationale
    if (entry.coding_rationale) {
      lines.push('');
      lines.push('### Motivering');
      lines.push(entry.coding_rationale);
    }

    // Separator
    lines.push('');
    lines.push('---');
    lines.push('');

    await fs.appendFile(logPath, lines.join('\n'), 'utf-8');
  }
}
