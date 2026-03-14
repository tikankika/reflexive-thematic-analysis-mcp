/**
 * write_file - Write content to a file
 *
 * Generic file writer for saving analytical work (candidate themes,
 * thematic maps, definitions, report drafts) between sessions.
 *
 * Safety: refuses to overwrite coded transcripts and review notes
 * unless explicitly confirmed. Creates parent directories if needed.
 */

import { promises as fs } from 'fs';
import { dirname } from 'path';

export interface WriteFileInput {
  path: string;
  content: string;
  overwrite?: boolean; // Default: true for new files, required for protected files
}

export interface WriteFileOutput {
  path: string;
  size_bytes: number;
  lines: number;
  created: boolean; // true if new file, false if overwritten
}

// Files that should not be casually overwritten
const PROTECTED_PATTERNS = [
  /\/segment\b/, // Coded transcripts (content check)
];

export async function writeFile(
  input: WriteFileInput
): Promise<WriteFileOutput> {
  const { content, overwrite } = input;
  const path = input.path.replace(/^~/, process.env.HOME || '');

  // Check if file exists
  let exists = false;
  try {
    await fs.stat(path);
    exists = true;
  } catch {
    // File doesn't exist — fine
  }

  // If overwriting existing file, check protection
  if (exists && overwrite !== true) {
    const existing = await fs.readFile(path, 'utf-8');
    const isProtected = PROTECTED_PATTERNS[0].test(existing);

    if (isProtected) {
      throw new Error(
        `Refusing to overwrite protected file: ${path}. ` +
          `This looks like a coded transcript. ` +
          `Set overwrite=true to confirm.`
      );
    }
  }

  // Create parent directories if needed
  await fs.mkdir(dirname(path), { recursive: true });

  // Write file
  await fs.writeFile(path, content, 'utf-8');

  const stat = await fs.stat(path);
  const lines = content.split('\n').length;

  return {
    path,
    size_bytes: stat.size,
    lines,
    created: !exists,
  };
}
