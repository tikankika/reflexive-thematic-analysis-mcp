import { promises as fs } from 'fs';

/**
 * SegmentReviser - Modify codes within existing coded segments
 *
 * Unlike SegmentWriter (which creates NEW coded segments), SegmentReviser
 * modifies the codes within EXISTING /segment.../slut_segment blocks.
 *
 * This is used in Phase 2b when the researcher reviews AI-assisted coding
 * and decides to add, remove, or replace codes.
 *
 * File format expected:
 *   /segment
 *   0030 [SPEAKER_01]: text...
 *   0031 [SPEAKER_01]: more text...
 *
 *   #existing_code_1
 *   #existing_code_2
 *   /slut_segment
 */
export class SegmentReviser {
  /**
   * Revise codes in an existing segment.
   *
   * Finds the segment by its 1-based index (counting /segment markers),
   * then modifies its codes according to the specified action.
   *
   * @param filePath - Path to transcript file
   * @param segmentIndex - 1-based segment index
   * @param action - 'add' | 'remove' | 'replace'
   * @param codes - Codes to add/remove/replace with
   * @returns Updated codes array after revision
   * @throws Error if segment not found or action fails
   */
  async reviseCodes(
    filePath: string,
    segmentIndex: number,
    action: 'add' | 'remove' | 'replace',
    codes: string[]
  ): Promise<{ updatedCodes: string[]; previousCodes: string[] }> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Find the segment by index
    const segmentBounds = this.findSegmentBounds(lines, segmentIndex);

    // Extract current codes
    const currentCodes = this.extractCodes(lines, segmentBounds);

    // Apply revision
    let updatedCodes: string[];

    switch (action) {
      case 'add':
        updatedCodes = [...currentCodes, ...codes];
        break;

      case 'remove':
        const removeSet = new Set(codes);
        updatedCodes = currentCodes.filter((c) => !removeSet.has(c));
        break;

      case 'replace':
        updatedCodes = [...codes];
        break;

      default:
        throw new Error(`Unknown action: ${action}. Use 'add', 'remove', or 'replace'.`);
    }

    // Warn if removing >50% of codes
    if (
      action === 'remove' &&
      currentCodes.length > 0 &&
      updatedCodes.length < currentCodes.length * 0.5
    ) {
      console.error(
        `[segment_reviser] WARNING: Removing >50% of codes from segment ${segmentIndex} ` +
          `(${currentCodes.length} → ${updatedCodes.length})`
      );
    }

    // Rebuild segment in file
    this.rewriteSegmentCodes(lines, segmentBounds, updatedCodes);

    // Write back
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');

    return {
      updatedCodes,
      previousCodes: currentCodes,
    };
  }

  /**
   * Find the bounds of a segment by its 1-based index.
   *
   * @returns Object with start (line of /segment), end (line of /slut_segment),
   *          and codeStart (first code line or blank line before codes)
   * @private
   */
  private findSegmentBounds(
    lines: string[],
    segmentIndex: number
  ): { start: number; end: number; codeStart: number } {
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '/segment') {
        currentIndex++;

        if (currentIndex === segmentIndex) {
          // Found target segment — now find /slut_segment
          const start = i;
          let end = -1;
          let codeStart = -1;

          for (let j = i + 1; j < lines.length; j++) {
            const trimmed = lines[j].trim();

            if (trimmed === '/slut_segment') {
              end = j;
              break;
            }

            // Track where codes begin (first # line or the blank line before codes)
            if (trimmed.startsWith('#') && codeStart === -1) {
              // Look back for blank line separator
              codeStart = j;
              if (j > 0 && lines[j - 1].trim() === '') {
                codeStart = j - 1;
              }
            }
          }

          if (end === -1) {
            throw new Error(
              `Segment ${segmentIndex}: found /segment at line ${start + 1} but no matching /slut_segment`
            );
          }

          // If no codes found, codeStart is just before /slut_segment
          if (codeStart === -1) {
            codeStart = end;
          }

          return { start, end, codeStart };
        }
      }
    }

    throw new Error(
      `Segment ${segmentIndex} not found. File has ${currentIndex} segments.`
    );
  }

  /**
   * Extract code lines from a segment.
   * @private
   */
  private extractCodes(
    lines: string[],
    bounds: { start: number; end: number }
  ): string[] {
    const codes: string[] = [];

    for (let i = bounds.start + 1; i < bounds.end; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('#')) {
        codes.push(trimmed);
      }
    }

    return codes;
  }

  /**
   * Rewrite the code section of a segment in-place.
   *
   * Replaces everything from codeStart to end-1 (before /slut_segment)
   * with blank line + new codes.
   *
   * @private
   */
  private rewriteSegmentCodes(
    lines: string[],
    bounds: { start: number; end: number; codeStart: number },
    newCodes: string[]
  ): void {
    // Build replacement: blank line + codes
    const replacement: string[] = [];
    replacement.push(''); // blank line separator
    for (const code of newCodes) {
      replacement.push(code);
    }

    // Remove old code section (from codeStart to just before /slut_segment)
    const removeCount = bounds.end - bounds.codeStart;
    lines.splice(bounds.codeStart, removeCount, ...replacement);
  }
}
