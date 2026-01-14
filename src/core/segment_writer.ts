import { promises as fs } from 'fs';
import {
  ChunkWriteResult,
  CodeSegmentInput,
  ParsedCodeSegment,
  MultiSegmentWriteResult
} from '../types/chunk.js';

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
  ): Promise<ChunkWriteResult> {
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

      // CRITICAL: Check if lines are already inside a coded segment
      // This prevents double-coding (duplicate /segment markers)
      if (this.isLineInsideCodedSegment(startLine, lines)) {
        throw new Error(
          `Line at position ${startLine} is already inside a coded segment. ` +
          `Cannot code the same content twice. Use code_delete_segment first if you want to recode.`
        );
      }
      if (this.isLineInsideCodedSegment(endLine, lines)) {
        throw new Error(
          `Line at position ${endLine} is already inside a coded segment. ` +
          `Cannot code the same content twice. Use code_delete_segment first if you want to recode.`
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
        chunkNumber: Math.floor(startLine / 80) + 1,  // Approximate
        startLine,
        endLine: newEndLine,
        codesWritten: codes.length,
        nextChunkReady: newEndLine + 1 < lines.length
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

  /**
   * Check if a line is inside a coded segment (between /segment and /slut_segment)
   *
   * This prevents double-coding when the same content is coded twice.
   *
   * @param lineIndex - 0-indexed position in lines array
   * @param lines - Array of all file lines
   * @returns True if line is inside a coded segment
   * @private
   */
  private isLineInsideCodedSegment(lineIndex: number, lines: string[]): boolean {
    // Search backwards for /segment or /slut_segment
    let foundSegmentStart = false;
    for (let i = lineIndex - 1; i >= 0; i--) {
      const trimmed = lines[i].trim();
      if (trimmed === '/slut_segment') {
        // Found end marker first - line is NOT inside a segment
        return false;
      }
      if (trimmed === '/segment') {
        // Found start marker - line IS inside a segment
        foundSegmentStart = true;
        break;
      }
    }

    if (!foundSegmentStart) {
      return false;
    }

    // Verify there's a /slut_segment after this line
    for (let i = lineIndex + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === '/slut_segment') {
        return true; // Properly closed segment
      }
      if (trimmed === '/segment') {
        // Found another start before end - malformed, treat as not inside
        return false;
      }
    }

    return false;
  }

  // ==========================================================================
  // Multi-Segment API Methods (v0.2.0)
  // ==========================================================================

  /**
   * Check if a line is metadata (not transcript content)
   *
   * Metadata lines should be skipped during line index validation because
   * they don't have (and shouldn't have) line index prefixes.
   *
   * @param line - Line to check
   * @returns True if line is metadata
   * @private
   */
  private isMetadataLine(line: string): boolean {
    const trimmed = line.trim();
    return (
      trimmed === '' ||                           // Empty line
      trimmed.startsWith('#') ||                  // Code line
      trimmed.startsWith('/') ||                  // Segment marker
      trimmed.startsWith('---') ||                // STATUS delimiter
      trimmed.includes('CODING-STATUS') ||        // STATUS header
      trimmed.match(/^\s+[\w-]+:/) !== null       // STATUS field (indented key:value)
    );
  }

  /**
   * Find line by permanent line index (e.g., "0028")
   *
   * Searches through file for line that starts with the given index prefix.
   * This correctly handles line indices added by add_line_index tool.
   *
   * @param lineIndex - Line index string (e.g., "0030")
   * @param lines - Array of file lines to search through
   * @returns 0-indexed array position where line with this index is found
   * @throws Error if format is invalid or index not found
   * @private
   */
  private findLineByIndex(lineIndex: string, lines: string[]): number {
    // Validate 4-digit format
    if (!/^\d{4}$/.test(lineIndex)) {
      throw new Error(
        `Invalid line index format: "${lineIndex}". Expected 4-digit format (e.g., "0030")`
      );
    }

    // Search for line that starts with this index
    // Line format: "0030 [SPEAKER_05]: text..." or "0030 text..."
    const prefix = lineIndex + ' ';

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(prefix)) {
        return i;
      }
    }

    throw new Error(
      `Line index ${lineIndex} not found in file. ` +
        `Make sure file has line indices added with add_line_index tool.`
    );
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
   * @param lines - Array of all file lines (to search for line indices)
   * @returns Parsed and sorted segments
   * @throws Error if validation fails
   * @private
   */
  private validateMultiSegmentInput(
    segments: CodeSegmentInput[],
    lines: string[]
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

      // Find actual line positions by searching for line indices
      const startLine = this.findLineByIndex(seg.start_line, lines);
      const endLine = this.findLineByIndex(seg.end_line, lines);

      // CRITICAL: Check if lines are already inside a coded segment
      // This prevents double-coding (duplicate /segment markers)
      if (this.isLineInsideCodedSegment(startLine, lines)) {
        throw new Error(
          `Segment ${i + 1}: Line ${seg.start_line} is already inside a coded segment. ` +
          `Cannot code the same content twice. Use code_delete_segment first if you want to recode.`
        );
      }
      if (this.isLineInsideCodedSegment(endLine, lines)) {
        throw new Error(
          `Segment ${i + 1}: Line ${seg.end_line} is already inside a coded segment. ` +
          `Cannot code the same content twice. Use code_delete_segment first if you want to recode.`
        );
      }

      // Validate range
      if (startLine > endLine) {
        throw new Error(
          `Segment ${i + 1}: start_line (${seg.start_line}) > end_line (${seg.end_line}). ` +
          `Line index ${seg.start_line} appears after ${seg.end_line} in file.`
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

      // 2. Validate and parse segments (now searches for line indices in file)
      const parsedSegments = this.validateMultiSegmentInput(segments, lines);

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
      // Extract maximum INDEX NUMBER from coded segments (not file line!)
      // IMPORTANT: Read from ORIGINAL lines (before insertion) since seg.endLine
      // refers to original positions, not positions after insertion
      const maxCodedIndex = Math.max(
        ...parsedSegments.map(seg => {
          const lastLineText = lines[seg.endLine];

          // Skip validation for metadata lines (codes, markers, empty lines)
          if (this.isMetadataLine(lastLineText)) {
            // Search backwards for the last transcript line with index
            for (let i = seg.endLine - 1; i >= seg.startLine; i--) {
              const candidateLine = lines[i];
              if (!this.isMetadataLine(candidateLine)) {
                const indexMatch = candidateLine.match(/^(\d{4})\s/);
                if (indexMatch) {
                  return parseInt(indexMatch[1], 10);
                }
              }
            }
            throw new Error(
              `Segment ending at line ${seg.endLine} contains no transcript lines with line index. ` +
              `This should not happen - check segment boundaries.`
            );
          }

          const indexMatch = lastLineText.match(/^(\d{4})\s/);
          if (!indexMatch) {
            throw new Error(
              `Line at position ${seg.endLine} does not have line index prefix. ` +
              `Expected format: "0001 text...". Got: "${lastLineText.substring(0, 50)}"`
            );
          }
          return parseInt(indexMatch[1], 10);
        })
      );

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
        max_coded_index: maxCodedIndex, // Index number, not file line!
        lastFilePosition,
        next_segment_ready: nextSegmentReady,
        progress: '' // Will be set by caller (tool layer)
      };
    } catch (error) {
      throw new Error(`Failed to write multiple segments to ${filePath}: ${error}`);
    }
  }
}
