import { promises as fs } from 'fs';
import { ReviewSegment } from '../types/review.js';

/**
 * SegmentReader - Parse coded transcripts and extract segments
 *
 * Reads a Phase 2a-coded transcript file and extracts all segments
 * (content between /segment and /slut_segment markers) with their
 * text, codes, and position metadata.
 *
 * This is a READ-ONLY module. It does not modify files.
 */
export class SegmentReader {
  /**
   * Extract all coded segments from a transcript file.
   *
   * Parses the file looking for /segment.../slut_segment blocks.
   * For each block, extracts:
   * - Transcript text lines (with 4-digit line indices)
   * - Code lines (starting with #)
   * - File positions for later modification
   *
   * @param filePath - Path to coded transcript file
   * @returns Array of ReviewSegment objects, ordered by position
   * @throws Error if file cannot be read or has malformed segments
   */
  async extractSegments(filePath: string): Promise<ReviewSegment[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const segments: ReviewSegment[] = [];

    let segmentIndex = 0;
    let i = 0;

    while (i < lines.length) {
      if (lines[i].trim() === '/segment') {
        segmentIndex++;
        const fileStartLine = i;
        const textLines: string[] = [];
        const codes: string[] = [];
        let startIndex = '';
        let endIndex = '';

        // Move past /segment marker
        i++;

        // Collect text lines and codes until /slut_segment
        let foundEnd = false;
        while (i < lines.length) {
          const trimmed = lines[i].trim();

          if (trimmed === '/slut_segment') {
            foundEnd = true;
            break;
          }

          if (trimmed.startsWith('#')) {
            // Code line
            codes.push(trimmed);
          } else if (trimmed !== '') {
            // Non-empty, non-code line = transcript text
            textLines.push(lines[i]);

            // Extract line index from text lines (format: "0030 [SPEAKER...]...")
            const indexMatch = lines[i].match(/^(\d{4})\s/);
            if (indexMatch) {
              const idx = indexMatch[1];
              if (!startIndex) startIndex = idx;
              endIndex = idx;
            }
          }

          i++;
        }

        if (!foundEnd) {
          throw new Error(
            `Malformed segment ${segmentIndex}: /segment at line ${fileStartLine + 1} has no matching /slut_segment`
          );
        }

        const fileEndLine = i; // Position of /slut_segment

        segments.push({
          index: segmentIndex,
          startIndex: startIndex || '????',
          endIndex: endIndex || '????',
          textLines,
          codes,
          fileStartLine,
          fileEndLine,
        });
      }

      i++;
    }

    return segments;
  }

  /**
   * Extract a single segment by its 1-based index.
   *
   * @param filePath - Path to coded transcript file
   * @param index - 1-based segment index
   * @returns The requested segment
   * @throws Error if index is out of range
   */
  async getSegment(filePath: string, index: number): Promise<ReviewSegment> {
    const segments = await this.extractSegments(filePath);

    if (index < 1 || index > segments.length) {
      throw new Error(
        `Segment index ${index} out of range. File has ${segments.length} segments (1-${segments.length}).`
      );
    }

    return segments[index - 1];
  }

  /**
   * Count total coded segments in a file.
   *
   * Faster than extractSegments() when you only need the count.
   *
   * @param filePath - Path to coded transcript file
   * @returns Number of /segment markers found
   */
  async countSegments(filePath: string): Promise<number> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    let count = 0;

    for (const line of lines) {
      if (line.trim() === '/segment') {
        count++;
      }
    }

    return count;
  }
}
