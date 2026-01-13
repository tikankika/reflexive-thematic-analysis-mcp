/**
 * read_file - Read contents of a file
 *
 * Generic file reader for transcripts, methodology, etc.
 */

import { promises as fs } from 'fs';

export interface ReadFileInput {
  path: string;
  max_lines?: number; // Limit output (default: no limit)
}

export interface ReadFileOutput {
  path: string;
  content: string;
  size_bytes: number;
  lines: number;
  truncated: boolean;
}

export async function readFile(input: ReadFileInput): Promise<ReadFileOutput> {
  const { path, max_lines } = input;

  // Expand ~ to home directory
  const expandedPath = path.replace(/^~/, process.env.HOME || '');

  // Check if file exists
  try {
    const stat = await fs.stat(expandedPath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${expandedPath}`);
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${expandedPath}`);
    }
    throw error;
  }

  // Read file
  let content = await fs.readFile(expandedPath, 'utf-8');
  const totalLines = content.split('\n').length;
  let truncated = false;

  // Truncate if max_lines specified
  if (max_lines && max_lines > 0) {
    const lines = content.split('\n');
    if (lines.length > max_lines) {
      content = lines.slice(0, max_lines).join('\n');
      content += `\n\n... [TRUNCATED: showing ${max_lines} of ${totalLines} lines]`;
      truncated = true;
    }
  }

  const stat = await fs.stat(expandedPath);

  return {
    path: expandedPath,
    content,
    size_bytes: stat.size,
    lines: totalLines,
    truncated,
  };
}
