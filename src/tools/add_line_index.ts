import { promises as fs } from 'fs';

/**
 * add_line_index - Add permanent line indices to transcript file
 *
 * Prepares a transcript for coding by adding permanent line indices (0001, 0002, ...).
 * These indices are PERMANENT IDENTIFIERS that don't change when segments are added.
 * This should be run BEFORE code_start.
 *
 * Terminology:
 * - LINE INDEX: Permanent identifier (0001, 0002, ...) that stays fixed
 * - LINE NUMBER: File position that changes when /segment markers are added
 *
 * Input:
 *   file_path: string - Path to transcript file
 *   config?: {
 *     digits?: number - Number of digits for line indices (default: 4)
 *   }
 *
 * Output:
 *   {
 *     status: "success",
 *     total_lines: number,
 *     backup_created: string,
 *     first_line: string,
 *     last_line: string
 *   }
 */
export async function addLineIndex(args: {
  file_path: string;
  config?: {
    digits?: number;
  };
}): Promise<any> {
  const { file_path, config } = args;
  const digits = config?.digits || 4;

  // Check if file exists
  try {
    await fs.access(file_path);
  } catch {
    throw new Error(`File not found: ${file_path}`);
  }

  // Read file
  const content = await fs.readFile(file_path, 'utf-8');
  const lines = content.split('\n');

  // Check if empty
  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
    throw new Error('Cannot add line indices to empty file');
  }

  // Check if already indexed (regex to match N digits followed by space)
  const firstLine = lines[0];
  const digitPattern = new RegExp(`^\\d{${digits}}\\s`);
  const startsWithDigits = digitPattern.test(firstLine);

  if (startsWithDigits) {
    throw new Error('File already has line indices (first line starts with digits)');
  }

  // Create backup with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = file_path.replace('.md', `_BACKUP_${timestamp}.md`);
  await fs.copyFile(file_path, backupPath);

  // Add line indices
  const indexedLines = lines.map((line, index) => {
    const lineIndex = String(index + 1).padStart(digits, '0');
    return `${lineIndex} ${line}`;
  });

  // Write back
  await fs.writeFile(file_path, indexedLines.join('\n'), 'utf-8');

  return {
    status: 'success',
    total_lines: lines.length,
    backup_created: backupPath,
    first_line: indexedLines[0].substring(0, 80),
    last_line: indexedLines[indexedLines.length - 1].substring(0, 80)
  };
}
