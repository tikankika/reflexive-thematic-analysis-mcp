import { promises as fs } from 'fs';
import * as path from 'path';
import { sessionState } from '../core/session_state.js';
import { ProcessLogger } from '../core/process_logger.js';

/**
 * reflexive_note - Save researcher's reflexive note
 *
 * The researcher's own voice: thoughts, doubts, insights, bias reflections.
 * Generic tool — usable in any phase, at any time.
 *
 * Saves to _process_memos/ at project root (beside rta_config.yaml).
 * Falls back to transcript directory if project root not found.
 * Also cross-references in the process log (type: meta_reflexive).
 *
 * Tier 3 in the dialogic reflexivity model.
 */

/**
 * Find project root by walking up from a path looking for rta_config.yaml.
 */
async function findProjectRoot(startPath: string): Promise<string | null> {
  let dir = path.dirname(startPath);
  for (let i = 0; i < 10; i++) {
    try {
      await fs.access(path.join(dir, 'rta_config.yaml'));
      return dir;
    } catch {
      const parent = path.dirname(dir);
      if (parent === dir) break; // filesystem root
      dir = parent;
    }
  }
  return null;
}

export async function reflexiveNote(args: {
  file_path: string;
  note: string;
  phase?: string;
  context?: string;
}): Promise<any> {
  sessionState.requireInit();

  const { file_path, note, phase, context } = args;

  if (!note || note.trim().length === 0) {
    throw new Error('Note text is required');
  }

  // Find project root (where rta_config.yaml lives), fall back to transcript dir
  const projectRoot = await findProjectRoot(file_path);
  const baseDir = projectRoot || path.dirname(file_path);
  const memoDir = path.join(baseDir, '_process_memos');

  // Create directory if needed
  await fs.mkdir(memoDir, { recursive: true });

  // Generate timestamp-based filename
  const timestamp = new Date().toISOString();
  const fileTimestamp = timestamp.replace(/[:.]/g, '-').replace('Z', '');
  const memoFilename = `memo_${fileTimestamp}.md`;
  const memoPath = path.join(memoDir, memoFilename);

  // Format markdown content
  const lines: string[] = [];
  lines.push('# Reflexiv not');
  lines.push(`**Datum:** ${timestamp}`);
  if (phase) {
    lines.push(`**Fas:** ${phase}`);
  }
  if (context) {
    lines.push(`**Kontext:** ${context}`);
  }
  lines.push('');
  lines.push(note.trim());
  lines.push('');

  await fs.writeFile(memoPath, lines.join('\n'), 'utf-8');

  // Cross-reference in process log (best-effort)
  try {
    const processLogger = new ProcessLogger();
    await processLogger.log(file_path, 'meta_reflexive', {
      phase: phase || undefined,
      description: `Reflexiv not sparad: ${memoFilename}`,
      context: context ? { segment: context } : undefined,
    });
  } catch {
    // Don't fail the memo if logging fails
  }

  // Count existing memos
  let memoCount = 0;
  try {
    const files = await fs.readdir(memoDir);
    memoCount = files.filter(f => f.startsWith('memo_') && f.endsWith('.md')).length;
  } catch {
    memoCount = 1;
  }

  return {
    success: true,
    memo_path: memoPath,
    memo_count: memoCount,
  };
}
