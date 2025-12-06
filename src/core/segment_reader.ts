import { promises as fs } from 'fs';
import { Segment } from '../types/segment.js';

/**
 * SegmentReader - Reads transcript segments from files
 *
 * Responsibilities:
 * - Count total lines in transcript
 * - Read specific line ranges (segments)
 * - Return raw text without interpretation
 */
export class SegmentReader {
  /**
   * Count total number of lines in a file
   * Excludes STATUS frontmatter if present
   */
  async countLines(filePath: string): Promise<number> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // If file has STATUS, don't count those lines
      const contentStart = await this.getContentStartLine(filePath);

      return lines.length - contentStart;
    } catch (error) {
      throw new Error(`Failed to count lines in ${filePath}: ${error}`);
    }
  }

  /**
   * Read a segment of lines from file
   *
   * @param filePath - Path to transcript file
   * @param startLine - Starting line (0-indexed)
   * @param size - Number of lines to read
   * @returns Segment with raw text
   */
  async readSegment(
    filePath: string,
    startLine: number,
    size: number
  ): Promise<Segment> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const allLines = content.split('\n');

      // Calculate end line (don't go past end of file)
      const endLine = Math.min(startLine + size, allLines.length);

      // Extract segment lines
      const segmentLines = allLines.slice(startLine, endLine);
      const text = segmentLines.join('\n');

      // Calculate segment number (approximate, 1-indexed)
      const segmentNumber = Math.floor(startLine / size) + 1;

      return {
        number: segmentNumber,
        startLine,
        endLine: endLine - 1,  // Make end line inclusive
        text
      };
    } catch (error) {
      throw new Error(`Failed to read segment from ${filePath}: ${error}`);
    }
  }

  /**
   * Read lines from file (helper method)
   *
   * @param filePath - Path to file
   * @returns Array of lines
   */
  async readLines(filePath: string): Promise<string[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.split('\n');
    } catch (error) {
      throw new Error(`Failed to read lines from ${filePath}: ${error}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Find where STATUS frontmatter ends
   * Returns the line number where actual content starts (0-indexed)
   * Returns 0 if no STATUS found
   */
  async getContentStartLine(filePath: string): Promise<number> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // If file doesn't start with ---, there's no STATUS
      if (!content.startsWith('---')) {
        return 0;
      }

      const lines = content.split('\n');

      // Find second --- (end of frontmatter)
      let foundFirst = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          if (foundFirst) {
            // Found second ---, content starts at next line
            return i + 1;
          }
          foundFirst = true;
        }
      }

      // No second --- found, no valid STATUS
      return 0;
    } catch (error) {
      throw new Error(`Failed to find content start in ${filePath}: ${error}`);
    }
  }
}
