/**
 * list_files - List files in a directory
 *
 * Returns list of files matching optional pattern.
 * Useful for finding transcripts to analyze.
 */

import { promises as fs } from 'fs';
import { join } from 'path';

export interface ListFilesInput {
  path: string;
  pattern?: string; // e.g., "*.md", ".md"
}

export interface ListFilesOutput {
  path: string;
  files: {
    name: string;
    full_path: string;
    size_bytes: number;
    modified: string;
  }[];
  total: number;
}

export async function listFiles(input: ListFilesInput): Promise<ListFilesOutput> {
  const { path, pattern } = input;

  // Expand ~ to home directory
  const expandedPath = path.replace(/^~/, process.env.HOME || '');

  // Check if directory exists
  try {
    const stat = await fs.stat(expandedPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${expandedPath}`);
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Directory not found: ${expandedPath}`);
    }
    throw error;
  }

  // Read directory
  const entries = await fs.readdir(expandedPath, { withFileTypes: true });

  // Filter and get file info
  const files: ListFilesOutput['files'] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    // Apply pattern filter
    if (pattern) {
      const ext = pattern.replace('*', '');
      if (!entry.name.endsWith(ext)) continue;
    }

    const fullPath = join(expandedPath, entry.name);
    const stat = await fs.stat(fullPath);

    files.push({
      name: entry.name,
      full_path: fullPath,
      size_bytes: stat.size,
      modified: stat.mtime.toISOString(),
    });
  }

  // Sort by name
  files.sort((a, b) => a.name.localeCompare(b.name));

  return {
    path: expandedPath,
    files,
    total: files.length,
  };
}
