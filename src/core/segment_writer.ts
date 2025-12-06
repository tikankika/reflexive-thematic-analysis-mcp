import { promises as fs } from 'fs';
import {
  SegmentWriteResult,
  CodeSegmentInput,
  ParsedCodeSegment,
  MultiSegmentWriteResult
} from '../types/segment.js';

/**
 * SegmentWriter - Writes coded segments to transcript files
 *
 * Responsibilities:
 * - Add /segment and /slut_segment markers
 * - Write codes between text and closing marker
 * - Preserve original text exactly
 * - Add blank line between text and codes
 */
export class SegmentWriter {
  /**
   * Write a coded segment to file
   *
   * Format:
   * /segment
   * [original text preserved]
   *
   * #code1_suffix
   * #code2_suffix
   * /slut_segment
   *
   * @param filePath - Path to transcript file
   * @param startLine - Starting line of segment (0-indexed)
   * @param endLine - Ending line of segment (0-indexed, inclusive)
   * @param codes - Array of code strings (e.g., ["#kod_lins1", "#\"uttryck\"_lins1"])
   * @returns Write result with segment info
   */
  async writeSegment(
    filePath: string,
    startLine: number,
    endLine: number,
    codes: string[]
  ): Promise<SegmentWriteResult> {
    try {
      // Read entire file
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Validate line numbers
      if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
        throw new Error(
          `Invalid line range: ${startLine}-${endLine} (file has ${lines.length} lines)`
        );
      }

      // Build coded segment
      const codedSegment = this.buildCodedSegment(
        lines,
        startLine,
        endLine,
        codes
      );

      // Replace original lines with coded segment
      const before = lines.slice(0, startLine);
      const after = lines.slice(endLine + 1);
      const newLines = [...before, ...codedSegment, ...after];

      // Write back to file
      await fs.writeFile(filePath, newLines.join('\n'), 'utf-8');

      // Calculate new end line (segment is now longer due to markers + codes)
      const newEndLine = startLine + codedSegment.length - 1;

      return {
        segmentNumber: Math.floor(startLine / 80) + 1,  // Approximate
        startLine,
        endLine: newEndLine,
        codesWritten: codes.length,
        nextSegmentReady: newEndLine + 1 < lines.length
      };
    } catch (error) {
      throw new Error(`Failed to write segment to ${filePath}: ${error}`);
    }
  }

  /**
   * Build coded segment with markers and codes
   *
   * @private
   */
  private buildCodedSegment(
    lines: string[],
    startLine: number,
    endLine: number,
    codes: string[]
  ): string[] {
    const segment: string[] = [];

    // Add opening marker
    segment.push('/segment');

    // Add original text (preserve exactly)
    for (let i = startLine; i <= endLine; i++) {
      segment.push(lines[i]);
    }

    // Add blank line
    segment.push('');

    // Add codes
    for (const code of codes) {
      segment.push(code);
    }

    // Add closing marker
    segment.push('/slut_segment');

    return segment;
  }

  /**
   * Check if a segment has already been coded
   * (i.e., has /segment marker)
   *
   * @param filePath - Path to file
   * @param startLine - Starting line to check
   * @returns True if segment already has /segment marker
   */
  async isSegmentCoded(filePath: string, startLine: number): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      if (startLine < 0 || startLine >= lines.length) {
        return false;
      }

      // Check if line at or near startLine is /segment
      for (let i = Math.max(0, startLine - 2); i <= Math.min(lines.length - 1, startLine + 2); i++) {
        if (lines[i].trim() === '/segment') {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // Multi-Segment API Methods (v0.2.0)
  // ==========================================================================

  /**
   * Parse 4-digit line number to 0-indexed position
   *
   * @param lineStr - Line number string (e.g., "0030")
   * @returns 0-indexed line position (e.g., 29)
   * @throws Error if format is invalid or number < 1
   * @private
   */
  private parseLineNumber(lineStr: string): number {
    // Validate 4-digit format
    if (!/^\d{4}$/.test(lineStr)) {
      throw new Error(
        `Invalid line number format: "${lineStr}". Expected 4-digit format (e.g., "0030")`
      );
    }

    const parsed = parseInt(lineStr, 10);

    if (parsed < 1) {
      throw new Error(`Line number must be >= 1, got: "${lineStr}"`);
    }

    // Convert to 0-indexed
    return parsed - 1;
  }

  /**
   * Validate that segments don't overlap
   *
   * Assumes segments are already sorted by startLine
   *
   * @param segments - Array of parsed segments (sorted)
   * @throws Error if any overlap detected
   * @private
   */
  private validateNoOverlaps(segments: ParsedCodeSegment[]): void {
    for (let i = 0; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];

      if (current.endLine >= next.startLine) {
        throw new Error(
          `Overlapping segments detected: Segment ending at line ${current.endLine + 1} ` +
          `(original: ${current.original.end_line}) overlaps with segment starting at ` +
          `line ${next.startLine + 1} (original: ${next.original.start_line}). ` +
          `Segments must not overlap.`
        );
      }
    }
  }

  /**
   * Validate and parse multi-segment input
   *
   * @param segments - Array of segment inputs from user
   * @param totalFileLines - Total lines in file
   * @returns Parsed and sorted segments
   * @throws Error if validation fails
   * @private
   */
  private validateMultiSegmentInput(
    segments: CodeSegmentInput[],
    totalFileLines: number
  ): ParsedCodeSegment[] {
    if (!segments || segments.length === 0) {
      throw new Error('segments array cannot be empty');
    }

    const parsed: ParsedCodeSegment[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      // Validate presence of required fields
      if (!seg.start_line || !seg.end_line || !Array.isArray(seg.codes)) {
        throw new Error(
          `Segment ${i + 1} missing required fields (start_line, end_line, codes). ` +
          `Got: ${JSON.stringify(seg)}`
        );
      }

      // Parse line numbers
      const startLine = this.parseLineNumber(seg.start_line);
      const endLine = this.parseLineNumber(seg.end_line);

      // Validate range
      if (startLine > endLine) {
        throw new Error(
          `Segment ${i + 1}: start_line (${seg.start_line}) > end_line (${seg.end_line})`
        );
      }

      // Validate bounds
      if (startLine < 0 || endLine >= totalFileLines) {
        throw new Error(
          `Segment ${i + 1}: lines ${seg.start_line}-${seg.end_line} out of bounds ` +
          `(file has ${totalFileLines} lines, valid range: 0001-${String(totalFileLines).padStart(4, '0')})`
        );
      }

      parsed.push({
        startLine,
        endLine,
        codes: seg.codes,
        original: seg
      });
    }

    // Sort by startLine (ascending)
    parsed.sort((a, b) => a.startLine - b.startLine);

    // Check for overlaps
    this.validateNoOverlaps(parsed);

    return parsed;
  }

  /**
   * Calculate file position after writing multiple segments
   *
   * Accounts for segment growth due to markers and codes
   *
   * @param parsedSegments - Parsed segments (sorted)
   * @param insertedSegments - Built coded segments with metadata
   * @returns File line position after last segment (0-indexed)
   * @private
   */
  private calculateFileEndPosition(
    parsedSegments: ParsedCodeSegment[],
    insertedSegments: Array<{
      startLine: number;
      codedLines: string[];
      originalLineCount: number;
    }>
  ): number {
    if (parsedSegments.length === 0) {
      return -1;
    }

    const lastParsed = parsedSegments[parsedSegments.length - 1];
    const lastInserted = insertedSegments[insertedSegments.length - 1];

    // Calculate cumulative shift from all segments BEFORE the last one
    let cumulativeShift = 0;
    for (let i = 0; i < insertedSegments.length - 1; i++) {
      const seg = insertedSegments[i];
      const growth = seg.codedLines.length - seg.originalLineCount;
      cumulativeShift += growth;
    }

    // Last segment's growth
    const lastSegmentGrowth =
      lastInserted.codedLines.length - lastInserted.originalLineCount;

    // Calculate new file position
    return lastParsed.endLine + cumulativeShift + lastSegmentGrowth;
  }

  /**
   * Write multiple small segments in one operation (v0.2.0)
   *
   * Use case: Claude identifies specific meaningful units (quotes, exchanges,
   * thematic chunks) and codes them precisely.
   *
   * Algorithm:
   * 1. Validate and parse all segments
   * 2. Sort by start_line
   * 3. Check for overlaps
   * 4. Build all coded segments
   * 5. Insert in REVERSE order (preserves line indices)
   * 6. Write file
   * 7. Calculate STATUS updates
   *
   * @param filePath - Path to transcript file
   * @param segments - Array of segments to write
   * @returns Result with segments written, codes written, progress
   * @throws Error if validation fails or file operation fails
   * @since v0.2.0
   */
  async writeMultipleSegments(
    filePath: string,
    segments: CodeSegmentInput[]
  ): Promise<MultiSegmentWriteResult> {
    try {
      // 1. Read entire file
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // 2. Validate and parse segments
      const parsedSegments = this.validateMultiSegmentInput(segments, lines.length);

      // 3. Build all coded segments (but don't insert yet)
      const insertedSegments = parsedSegments.map(seg => ({
        startLine: seg.startLine,
        codedLines: this.buildCodedSegment(
          lines,
          seg.startLine,
          seg.endLine,
          seg.codes
        ),
        originalLineCount: seg.endLine - seg.startLine + 1
      }));

      // 4. Insert in REVERSE order (to preserve line indices)
      let modifiedLines = [...lines];
      for (let i = insertedSegments.length - 1; i >= 0; i--) {
        const seg = insertedSegments[i];

        // Remove original lines
        modifiedLines.splice(seg.startLine, seg.originalLineCount);

        // Insert coded segment
        modifiedLines.splice(seg.startLine, 0, ...seg.codedLines);
      }

      // 5. Write back to file
      await fs.writeFile(filePath, modifiedLines.join('\n'), 'utf-8');

      // 6. Calculate results
      const maxCodedLine = Math.max(...parsedSegments.map(s => s.endLine));
      const totalCodesWritten = parsedSegments.reduce(
        (sum, s) => sum + s.codes.length,
        0
      );
      const lastFilePosition = this.calculateFileEndPosition(
        parsedSegments,
        insertedSegments
      );
      const nextSegmentReady = lastFilePosition + 1 < modifiedLines.length;

      return {
        segments_written: parsedSegments.length,
        total_codes_written: totalCodesWritten,
        max_coded_line: maxCodedLine + 1, // Convert to 1-indexed for display
        lastFilePosition,
        next_segment_ready: nextSegmentReady,
        progress: '' // Will be set by caller (tool layer)
      };
    } catch (error) {
      throw new Error(`Failed to write multiple segments to ${filePath}: ${error}`);
    }
  }
}
