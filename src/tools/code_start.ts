import { SegmentReader } from '../core/segment_reader.js';
import { StatusManager } from '../core/status_manager.js';

/**
 * code_start - Initialize coding session
 *
 * Creates STATUS frontmatter and returns first segment
 *
 * Input:
 *   file_path: string - Path to transcript file
 *   config?: {
 *     segment_size?: number - Lines per segment (default: 80)
 *   }
 *
 * Output:
 *   {
 *     status: "ready",
 *     total_lines: number,
 *     segment: {
 *       number: number,
 *       lines: string (e.g., "1-80"),
 *       text: string
 *     }
 *   }
 */
export async function codeStart(args: {
  file_path: string;
  config?: {
    segment_size?: number;
  };
}): Promise<any> {
  const { file_path, config } = args;
  const segmentSize = config?.segment_size || 80;

  const reader = new SegmentReader();
  const statusManager = new StatusManager();

  // Check if file exists
  const exists = await reader.fileExists(file_path);
  if (!exists) {
    throw new Error(`File not found: ${file_path}`);
  }

  // Check if STATUS already exists
  const hasStatus = await statusManager.hasStatus(file_path);
  if (hasStatus) {
    throw new Error(
      `File already has STATUS. Use code_read_next to continue, or remove STATUS to restart.`
    );
  }

  // Count lines
  const totalLines = await reader.countLines(file_path);

  // Create STATUS
  await statusManager.create(file_path, totalLines, segmentSize);

  // Find where actual content starts (after STATUS frontmatter)
  const contentStart = await reader.getContentStartLine(file_path);

  // Read first segment starting from actual content
  const segment = await reader.readSegment(file_path, contentStart, segmentSize);

  return {
    status: 'ready',
    total_lines: totalLines,
    estimated_segments: Math.ceil(totalLines / segmentSize),
    segment: {
      number: segment.number,
      lines: `${segment.startLine + 1}-${segment.endLine + 1}`,  // 1-indexed for display
      text: segment.text
    }
  };
}
