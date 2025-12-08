/**
 * code_verify - Verify STATUS matches actual file content
 *
 * Counts /segment markers and compares to STATUS.
 * With fix=true, auto-corrects STATUS based on actual segments found.
 * Use to diagnose and fix STATUS inconsistencies.
 */

import { promises as fs } from 'fs';
import { StatusManager } from '../core/status_manager.js';

export async function codeVerify(args: {
  file_path: string;
  fix?: boolean;
}): Promise<any> {
  const { file_path, fix = false } = args;

  const statusManager = new StatusManager();

  // 1. Read STATUS
  const status = await statusManager.read(file_path);

  // 2. Count actual /segment markers in file
  const content = await fs.readFile(file_path, 'utf-8');
  const segmentMatches = content.match(/^\/segment$/gm);
  const actualSegments = segmentMatches ? segmentMatches.length : 0;

  // 3. Validate consistency
  const issues: string[] = [];

  if (actualSegments !== status.codedSegments) {
    issues.push(
      `STATUS says ${status.codedSegments} segments coded, ` +
        `but file contains ${actualSegments} /segment markers`
    );
  }

  if (status.lastCodedLine > status.totalLines) {
    issues.push(
      `Last-coded-line (${status.lastCodedLine}) exceeds ` +
        `Total-lines (${status.totalLines})`
    );
  }

  const segmentSize = 80; // TODO: Read from config
  const expectedCodedSegments = Math.ceil(status.lastCodedLine / segmentSize);
  if (expectedCodedSegments !== status.codedSegments && status.lastCodedLine > 0) {
    issues.push(
      `STATUS Progress (${status.codedSegments} segments) doesn't match ` +
        `Last-coded-line (${status.lastCodedLine} = ${expectedCodedSegments} segments)`
    );
  }

  // 4. If fix=true, auto-correct STATUS based on actual segments
  let fixed = false;
  if (fix && issues.length > 0) {
    // Calculate correct values based on actual segment count
    const correctLastCodedLine = actualSegments * segmentSize;

    // Find actual last /slut_segment position in file
    const lines = content.split('\n');
    let lastSegmentEndLine = 8; // After STATUS frontmatter

    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '/slut_segment') {
        lastSegmentEndLine = i;
        break;
      }
    }

    await statusManager.update(
      file_path,
      correctLastCodedLine,
      lastSegmentEndLine,
      segmentSize
    );

    fixed = true;
  }

  // 5. Return validation report
  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : ['No issues found'],
    actual_segments: actualSegments,
    status_segments: status.codedSegments,
    status_last_coded_line: status.lastCodedLine,
    status_total_lines: status.totalLines,
    ...(fix && {
      fixed,
      message: fixed ? 'STATUS auto-corrected' : 'No fix needed',
    }),
  };
}
