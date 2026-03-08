import { ChunkReader } from '../core/chunk_reader.js';
import { StatusManager } from '../core/status_manager.js';
import { sessionState } from '../core/session_state.js';
import { MethodologyLoader } from '../core/methodology_loader.js';
import { ProjectConfig } from '../core/project_config.js';
import { ProcessLogger } from '../core/process_logger.js';

/**
 * code_start - Initialize coding session (Phase 2a: Initial Coding)
 *
 * Creates STATUS frontmatter and returns first chunk for coding.
 * Also loads Phase 2a methodology if not disabled.
 *
 * CRITICAL: Requires init() to be called first.
 *
 * Note: A "chunk" is a technical reading unit (60-100 lines) used to process
 * large transcripts in pieces. You will mark semantic "segments" with
 * /segment markers when coding within each chunk.
 *
 * Input:
 *   file_path: string - Path to transcript file
 *   config?: {
 *     chunk_size?: number - Lines per chunk (default: 80)
 *     segment_size?: number - (deprecated, use chunk_size)
 *     load_methodology?: boolean - Load methodology in response (default: true)
 *   }
 *
 * Output:
 *   {
 *     status: "ready",
 *     total_lines: number,
 *     chunk: {...},
 *     methodology?: string,
 *     coding_manual?: string,
 *     instructions: string
 *   }
 */
export async function codeStart(args: {
  file_path: string;
  config?: {
    chunk_size?: number;
    segment_size?: number; // Backwards compatibility
    load_methodology?: boolean;
  };
}): Promise<any> {
  // CRITICAL: Require init first
  sessionState.requireInit();

  const { file_path, config } = args;
  // Support both chunk_size (new) and segment_size (backwards compat)
  const chunkSize = config?.chunk_size || config?.segment_size || 80;

  const reader = new ChunkReader();
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
  await statusManager.create(file_path, totalLines, chunkSize);

  // Update project config status (best-effort)
  try {
    const projectConfig = await ProjectConfig.findFromTranscript(file_path);
    if (projectConfig) {
      await projectConfig.load();
      await projectConfig.updateTranscriptStatus(file_path, 'phase2a_in_progress', 'phase2a');
    }
  } catch {
    // Non-critical — status update is best-effort
  }

  // Auto-log session start
  try {
    const processLogger = new ProcessLogger();
    await processLogger.log(file_path, 'session_start', { phase: '2a' });
  } catch {
    // Don't fail coding if logging fails
  }

  // Find where actual content starts (after STATUS frontmatter)
  const contentStart = await reader.getContentStartLine(file_path);

  // Read first chunk starting from actual content
  const chunk = await reader.readChunk(file_path, contentStart, chunkSize);

  // Load methodology if requested (default: true)
  let methodology: string | undefined;
  let codingManual: string | undefined;

  if (config?.load_methodology !== false) {
    const loader = new MethodologyLoader();

    try {
      methodology = await loader.loadPhase2a();
    } catch (error) {
      console.error('[code_start] Failed to load Phase 2a methodology:', error);
    }

    try {
      codingManual = await loader.loadDocument('../protocols/EXAMPLE_coding_protocol_disruptive_3rq.md');
    } catch (error) {
      console.error('[code_start] Failed to load coding manual:', error);
    }
  }

  return {
    status: 'ready',
    total_lines: totalLines,
    estimated_chunks: Math.ceil(totalLines / chunkSize),
    chunk: {
      number: chunk.number,
      lines: `${chunk.startLine + 1}-${chunk.endLine + 1}`, // 1-indexed for display
      text: chunk.text,
    },
    // Include methodology if loaded
    methodology,
    coding_manual: codingManual,
    instructions: `
CRITICAL: Read methodology and coding_manual before proposing codes.
- Researcher has interpretive authority
- Code format: #code_description__rq1_semantic or __rq1_latent
- In vivo: #"exact_quote"__rq1_semantic (with quotes)
- Research questions as defined in coding protocol
- Two levels: semantic (explicit), latent (interpretive)
    `.trim(),
  };
}
