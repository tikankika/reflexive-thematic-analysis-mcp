import { promises as fs } from 'fs';
import { Status, RawStatus } from '../types/status.js';

/**
 * StatusManager - Manages CODING-STATUS frontmatter in transcript files
 *
 * Responsibilities:
 * - Create STATUS YAML frontmatter
 * - Read STATUS from file
 * - Update STATUS fields
 * - Calculate progress
 *
 * STATUS format:
 * ---
 * CODING-STATUS:
 *   File: transcript.md
 *   Total-lines: 1500
 *   Last-coded-line: 0
 *   Last-file-position: 8
 *   Next-segment: 1-80
 *   Progress: 0/18
 *   Date: 2025-12-05
 * ---
 */
export class StatusManager {
  private readonly DEFAULT_SEGMENT_SIZE = 80;

  /**
   * Create STATUS frontmatter in file
   *
   * @param filePath - Path to transcript file
   * @param totalLines - Total lines in transcript
   * @param segmentSize - Size of each segment (default: 80)
   */
  async create(
    filePath: string,
    totalLines: number,
    segmentSize: number = this.DEFAULT_SEGMENT_SIZE
  ): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Check if STATUS already exists
      if (content.startsWith('---')) {
        throw new Error('STATUS already exists in file');
      }

      const fileName = filePath.split('/').pop() || 'unknown.md';
      const today = new Date().toISOString().split('T')[0];
      const totalSegments = Math.ceil(totalLines / segmentSize);

      const status: RawStatus = {
        'CODING-STATUS': {
          'File': fileName,
          'Total-lines': totalLines,
          'Current-file-lines': totalLines + 9,  // Initial: content + 9 STATUS header lines
          'Last-coded-line': 0,
          'Last-file-position': 8,  // STATUS frontmatter is 9 lines (0-8)
          'Next-segment': `1-${Math.min(segmentSize, totalLines)}`,
          'Progress': `0/${totalSegments}`,
          'Date': today
        }
      };

      const yamlFrontmatter = this.serializeStatus(status);
      const newContent = `${yamlFrontmatter}\n${content}`;

      await fs.writeFile(filePath, newContent, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to create STATUS in ${filePath}: ${error}`);
    }
  }

  /**
   * Read STATUS from file
   *
   * @param filePath - Path to transcript file
   * @returns Parsed Status object
   */
  async read(filePath: string): Promise<Status> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      if (!content.startsWith('---')) {
        throw new Error('No STATUS frontmatter found in file');
      }

      const rawStatus = this.parseStatus(content);
      return this.rawToStatus(rawStatus);
    } catch (error) {
      throw new Error(`Failed to read STATUS from ${filePath}: ${error}`);
    }
  }

  /**
   * Update STATUS after coding a segment
   *
   * @param filePath - Path to transcript file
   * @param lastCodedLine - Last CONTENT line that was coded (not file line)
   * @param lastFilePosition - Last FILE line position after writing segment
   * @param segmentSize - Size of segments (default: 80)
   */
  async update(
    filePath: string,
    lastCodedLine: number,
    lastFilePosition: number,
    segmentSize: number = this.DEFAULT_SEGMENT_SIZE
  ): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const rawStatus = this.parseStatus(content);

      const totalLines = rawStatus['CODING-STATUS']['Total-lines'];
      const totalSegments = Math.ceil(totalLines / segmentSize);
      const codedSegments = Math.ceil(lastCodedLine / segmentSize);

      const nextStart = lastCodedLine + 1;
      const nextEnd = Math.min(nextStart + segmentSize - 1, totalLines);

      // Count actual file lines (grows as segments are added)
      const lines = content.split('\n');
      const currentFileLines = lines.length;

      // Update fields
      rawStatus['CODING-STATUS']['Current-file-lines'] = currentFileLines;
      rawStatus['CODING-STATUS']['Last-coded-line'] = lastCodedLine;
      rawStatus['CODING-STATUS']['Last-file-position'] = lastFilePosition;
      rawStatus['CODING-STATUS']['Next-segment'] = `${nextStart}-${nextEnd}`;
      rawStatus['CODING-STATUS']['Progress'] = `${codedSegments}/${totalSegments}`;
      rawStatus['CODING-STATUS']['Date'] = new Date().toISOString().split('T')[0];

      // Replace old STATUS with new
      const newYaml = this.serializeStatus(rawStatus);
      const contentWithoutStatus = this.removeStatusFromContent(content);
      const newContent = `${newYaml}\n${contentWithoutStatus}`;

      await fs.writeFile(filePath, newContent, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to update STATUS in ${filePath}: ${error}`);
    }
  }

  /**
   * Check if file has STATUS frontmatter
   */
  async hasStatus(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.startsWith('---') && content.includes('CODING-STATUS:');
    } catch {
      return false;
    }
  }

  /**
   * Parse STATUS from file content (handles inline comments)
   * @private
   */
  private parseStatus(content: string): RawStatus {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      throw new Error('Invalid STATUS frontmatter format');
    }

    const yamlContent = match[1];
    const lines = yamlContent.split('\n');

    const status: any = { 'CODING-STATUS': {} };
    let inStatus = false;

    for (const line of lines) {
      if (line.trim() === 'CODING-STATUS:') {
        inStatus = true;
        continue;
      }

      if (inStatus && line.includes(':')) {
        // Remove inline comments (# ...) before parsing
        const lineWithoutComment = line.split('#')[0];
        const [key, ...valueParts] = lineWithoutComment.split(':');
        const trimmedKey = key.trim();
        const value = valueParts.join(':').trim();

        if (!value) continue; // Skip empty values

        // Parse value type
        // Handle "3/18 (23%)" format - extract just "3/18"
        const cleanValue = value.replace(/\s*\(.*?\)\s*$/, '').trim();

        if (cleanValue.match(/^\d+$/)) {
          status['CODING-STATUS'][trimmedKey] = parseInt(cleanValue, 10);
        } else {
          status['CODING-STATUS'][trimmedKey] = cleanValue;
        }
      }
    }

    return status as RawStatus;
  }

  /**
   * Serialize STATUS to YAML with inline comments
   * @private
   */
  private serializeStatus(status: RawStatus): string {
    const s = status['CODING-STATUS'];

    // Calculate percentage for Progress display
    const [codedSegs, totalSegs] = s.Progress.split('/').map(n => parseInt(n, 10));
    const percent = Math.round((codedSegs / totalSegs) * 100);

    return `---
CODING-STATUS:
  File: ${s.File}
  Total-lines: ${s['Total-lines']}                       # Original transcript lines (unchanged)
  Current-file-lines: ${s['Current-file-lines']}          # Actual file size after coding
  Last-coded-line: ${s['Last-coded-line']}                # Last transcript line index coded
  Last-file-position: ${s['Last-file-position']}          # Physical file line position
  Next-segment: ${s['Next-segment']}                      # Next transcript indices to code
  Progress: ${s.Progress} (${percent}%)                   # Segments coded / total
  Date: ${s.Date}
---`;
  }

  /**
   * Remove STATUS frontmatter from content
   * @private
   */
  private removeStatusFromContent(content: string): string {
    return content.replace(/^---\n[\s\S]*?\n---\n/, '');
  }

  /**
   * Convert RawStatus to Status
   * @private
   */
  private rawToStatus(raw: RawStatus): Status {
    const s = raw['CODING-STATUS'];
    const [nextStart] = s['Next-segment'].split('-');
    const [coded, total] = s.Progress.split('/');

    return {
      file: s.File,
      totalLines: s['Total-lines'],
      currentFileLines: s['Current-file-lines'] || s['Total-lines'], // Fallback for old STATUS
      lastCodedLine: s['Last-coded-line'],
      lastFilePosition: s['Last-file-position'],
      nextSegmentStart: parseInt(nextStart, 10),
      codedSegments: parseInt(coded, 10),
      totalSegments: parseInt(total, 10),
      progress: `${Math.round((parseInt(coded, 10) / parseInt(total, 10)) * 100)}%`,
      date: s.Date
    };
  }
}
