/**
 * code_clear_all - Remove ALL coding from file
 *
 * Removes /segment markers, content, and codes for all segments.
 * Preserves line indices and transcript content.
 * Creates automatic backup. Requires confirm: true for safety.
 * Resets STATUS to uncoded state. Use to start over from scratch.
 */

import { promises as fs } from 'fs';
import { StatusManager } from '../core/status_manager.js';

export async function codeClearAll(args: {
  file_path: string;
  confirm: boolean;
}): Promise<any> {
  const { file_path, confirm } = args;

  // Safety check: require explicit confirmation
  if (confirm !== true) {
    throw new Error(
      'code_clear_all requires explicit confirmation. ' +
        'Set confirm: true to proceed. This will remove ALL coding from the file.'
    );
  }

  const statusManager = new StatusManager();

  // 1. Create backup before clearing
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  const backupPath = file_path.replace('.md', `_BEFORE_CLEAR_${timestamp}.md`);
  await fs.copyFile(file_path, backupPath);

  // 2. Read file and count what will be removed
  const content = await fs.readFile(file_path, 'utf-8');
  const segmentMatches = content.match(/^\/segment$/gm);
  const segmentsToRemove = segmentMatches ? segmentMatches.length : 0;

  const codeMatches = content.match(/^#[^\n]+$/gm);
  const codesToRemove = codeMatches ? codeMatches.length : 0;

  // 3. Remove all segments using regex
  // Pattern: /segment...anything.../slut_segment (including newlines)
  const cleanedContent = content.replace(
    /^\/segment\n[\s\S]*?\n\/slut_segment\n?/gm,
    ''
  );

  // 4. Write cleaned content back
  await fs.writeFile(file_path, cleanedContent, 'utf-8');

  // 5. Reset STATUS to uncoded state
  const segmentSize = 80;
  await statusManager.update(file_path, 0, 8, segmentSize);

  return {
    status: 'cleared',
    message: 'All coding removed from file',
    segments_removed: segmentsToRemove,
    codes_removed: codesToRemove,
    backup_created: backupPath,
    note: 'Line indices preserved (if present)',
  };
}
