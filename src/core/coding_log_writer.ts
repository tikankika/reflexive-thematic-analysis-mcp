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
 *   ## Chunk title
 *   ### Segment 1
 *   [full analytical text as-is]
 *   ### Segment 2
 *   [full analytical text as-is]
 *   ---
 *
 * File naming: [transcript_name]_coding_log.md
 * Location: Same directory as transcript file
 */

/** Chunk-level metadata for the coding log */
export interface ChunkLogParams {
  chunk_title?: string;
  researcher_decision?: string;
  reflexive_note?: string;
  coding_rationale?: string;
}

export class CodingLogWriter {
  getLogPath(transcriptPath: string): string {
    return transcriptPath.replace(/\.md$/, '_coding_log.md');
  }

  /**
   * Append a chunk entry. Each segment's log_text is written as-is.
   * Falls back to listing codes if log_text is not provided.
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
      lines.push(`### Segment ${i + 1}`);

      if (seg.log_text) {
        // Full analytical text — write as-is
        lines.push(seg.log_text);
      } else {
        // Fallback: just list codes
        const segRange = `${seg.start_line}–${seg.end_line}`;
        lines.push(`**Rader:** ${segRange}`);
        if (seg.codes.length > 0) {
          for (const code of seg.codes) {
            lines.push(`- ${code}`);
          }
        }
      }

      lines.push('');
    }

    lines.push('---');
    lines.push('');

    await fs.appendFile(logPath, lines.join('\n'), 'utf-8');
  }

  /**
   * Append a Phase 2b review entry to the coding log.
   * Called by review_write_note and review_revise_codes.
   */
  async appendReview(
    logPath: string,
    params: {
      segmentIndex: number;
      lineRange: string;
      reflexiveNote?: string;
      codesAdded?: string[];
      codesRemoved?: string[];
      revisionRationale?: string;
    }
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const lines: string[] = [];

    lines.push(`## Phase 2b Review — Segment ${params.segmentIndex} (${params.lineRange})`);
    lines.push(`**Tidpunkt:** ${timestamp}`);
    lines.push('');

    if (params.reflexiveNote) {
      lines.push('### Reflexive Note');
      lines.push(params.reflexiveNote);
      lines.push('');
    }

    const hasRevision = (params.codesAdded && params.codesAdded.length > 0) ||
      (params.codesRemoved && params.codesRemoved.length > 0);

    if (hasRevision) {
      lines.push('### Code Revision');
      if (params.codesAdded && params.codesAdded.length > 0) {
        for (const code of params.codesAdded) {
          lines.push(`- Added: ${code}`);
        }
      }
      if (params.codesRemoved && params.codesRemoved.length > 0) {
        for (const code of params.codesRemoved) {
          lines.push(`- Removed: ${code}`);
        }
      }
      if (params.revisionRationale) {
        lines.push(`- Rationale: ${params.revisionRationale}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');

    await fs.appendFile(logPath, lines.join('\n'), 'utf-8');
  }
}
