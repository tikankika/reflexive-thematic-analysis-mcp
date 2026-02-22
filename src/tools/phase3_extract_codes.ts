import { sessionState } from '../core/session_state.js';
import { CodeExtractor } from '../core/code_extractor.js';

/**
 * phase3_extract_codes - Extract all codes from coded transcripts
 *
 * Infrastructure tool that reads all coded transcripts in a project
 * and produces a single markdown file with all codes and their metadata.
 * Gives the researcher the material to work with in Phase 3.
 *
 * This tool gathers data — nothing more. It does not suggest themes,
 * filter codes, or guide the analytical process.
 *
 * CRITICAL: Requires init() to be called first.
 *
 * Input:
 *   project_path: string - Path to project directory (contains rta_config.yaml)
 *
 * Output:
 *   { status, output_file, transcripts_processed, total_segments,
 *     total_codes, codes_per_rq, uncategorized_codes }
 */
export async function extractCodes(args: {
  project_path: string;
}): Promise<any> {
  sessionState.requireInit();

  const { project_path } = args;

  if (!project_path) {
    throw new Error('project_path is required');
  }

  const extractor = new CodeExtractor();
  const result = await extractor.extract(project_path);

  return {
    status: 'success',
    output_file: result.outputFile,
    project_name: result.projectName,
    transcripts_processed: result.transcriptsProcessed,
    transcripts_skipped: result.transcriptsSkipped,
    total_segments: result.totalSegments,
    total_codes: result.totalCodes,
    codes_per_rq: result.codesPerRq,
    uncategorized_codes: result.uncategorizedCodes,
    instructions:
      'Code extraction complete. The researcher should now load Phase 3 methodology ' +
      '(methodology_load with phase="phase3") before beginning theme generation work.',
  };
}
