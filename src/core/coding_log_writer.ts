import { promises as fs } from 'fs';
import { CodeSegmentInput } from '../types/chunk.js';

/**
 * CodingLogWriter - Append-only markdown writer for coding logs.
 *
 * Each transcript gets a companion _coding_log.md file.
 * Entries are appended, never overwritten. Human-readable markdown
 * format for colleague review (Tier 2 in dialogic reflexivity model).
 *
 * Format:
 *   ## Chunk N: title
 *   ### Segment 1: title (start–end)
 *   #### Koder
 *   #### Reflexiv not
 *   ### Segment 2: ...
 *   ---
 *
 * File naming: [transcript_name]_coding_log.md
 * Location: Same directory as transcript file
 */

/** Chunk-level metadata for the coding log */
export interface ChunkLogParams {
  /** Chunk title, e.g. "Chunk 7 — AI-detektion, förbud→lösning" */
  chunk_title?: string;
  /** Researcher decision for the whole chunk */
  researcher_decision?: string;
  /** Chunk-level reflexive note (overall reflection) */
  reflexive_note?: string;
  /** Chunk-level coding rationale */
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
   * Append a full chunk entry with per-segment detail.
   * Each segment gets its own ### heading with codes and reflexive note.
   */
  async appendChunk(
    logPath: string,
    segments: CodeSegmentInput[],
    params: ChunkLogParams
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const lines: string[] = [];

    // Chunk heading
    const rangeStr = segments.length > 0
      ? `${segments[0].start_line}–${segments[segments.length - 1].end_line}`
      : '';
    const chunkTitle = params.chunk_title || `Chunk ${rangeStr}`;
    lines.push(`## ${chunkTitle}`);
    lines.push(`**Tidpunkt:** ${timestamp}`);
    if (params.researcher_decision) {
      lines.push(`**Beslut:** ${params.researcher_decision}`);
    }
    lines.push('');

    // Per-segment entries
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segRange = `${seg.start_line}–${seg.end_line}`;
      const segTitle = seg.title || `Segment ${i + 1} (${segRange})`;
      lines.push(`### ${segTitle}`);
      lines.push(`**Rader:** ${segRange}`);

      // Codes
      lines.push('');
      lines.push('#### Koder');
      if (seg.codes.length > 0) {
        for (const code of seg.codes) {
          lines.push(`- ${code}`);
        }
      } else {
        lines.push('*(inga koder)*');
      }

      // Per-segment reflexive note
      if (seg.reflexive_note) {
        lines.push('');
        lines.push('#### Reflexiv not');
        lines.push(seg.reflexive_note);
      }

      lines.push('');
    }

    // Chunk-level reflexive note (overall)
    if (params.reflexive_note) {
      lines.push('### Reflexion');
      lines.push(params.reflexive_note);
      lines.push('');
    }

    // Chunk-level rationale
    if (params.coding_rationale) {
      lines.push('### Motivering');
      lines.push(params.coding_rationale);
      lines.push('');
    }

    // Separator
    lines.push('---');
    lines.push('');

    await fs.appendFile(logPath, lines.join('\n'), 'utf-8');
  }
}
