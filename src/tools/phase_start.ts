import { promises as fs } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { sessionState } from '../core/session_state.js';
import { MethodologyLoader } from '../core/methodology_loader.js';
import { ProcessLogger } from '../core/process_logger.js';
import { getPhaseScaffolding } from './methodology_load.js';

/**
 * phase_start - Initialize a phase (3–6) with methodology and project context
 *
 * Loads the phase methodology document, lists tool-generated files and
 * transcripts from rta_config.yaml. For phases 2a/2b, redirects to
 * dedicated start tools.
 *
 * Infrastructure only — does not guide analysis or impose workflow.
 *
 * Input:
 *   project_path: string - Path to project directory (contains rta_config.yaml)
 *   phase: string - "3", "4", "5", "6" (also accepts "2a", "2b")
 *
 * Output:
 *   { methodology, phase_scaffolding, tool_outputs, transcripts, instructions }
 */
export async function phaseStart(args: {
  project_path: string;
  phase: string;
}): Promise<any> {
  sessionState.requireInit();

  const { project_path, phase } = args;

  if (!project_path) {
    throw new Error('project_path is required');
  }

  // Normalise phase string: "3" → "phase3", "phase3" → "phase3"
  const phaseKey = phase.startsWith('phase') ? phase : `phase${phase}`;

  // Redirect for 2a/2b
  if (phaseKey === 'phase2a') {
    return {
      redirect: 'phase2a_code_start',
      message: 'Phase 2a has a dedicated start tool. Call phase2a_code_start(file_path=...) instead.',
    };
  }
  if (phaseKey === 'phase2b') {
    return {
      redirect: 'phase2b_review_start',
      message: 'Phase 2b has a dedicated start tool. Call phase2b_review_start(file_path=...) instead.',
    };
  }

  // Validate phase
  const validPhases = ['phase3', 'phase4', 'phase5', 'phase6'];
  if (!validPhases.includes(phaseKey)) {
    throw new Error(
      `Unknown phase: "${phase}". Valid phases: 3, 4, 5, 6 (or 2a, 2b for dedicated tools).`
    );
  }

  // 1. Load rta_config.yaml
  const configPath = join(project_path, 'rta_config.yaml');
  let config: any;
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    config = yaml.load(configContent);
  } catch {
    throw new Error(
      `No rta_config.yaml found at ${configPath}. Run project_setup first.`
    );
  }

  // 2. Load methodology
  const loader = new MethodologyLoader();
  let methodology: string;
  try {
    methodology = await loader.loadDocument(
      loader.getDocumentList(phaseKey)[0]
    );
  } catch {
    // Fall back to phase-specific loader
    try {
      const loadMethod = `load${phaseKey.charAt(0).toUpperCase() + phaseKey.slice(1)}` as keyof MethodologyLoader;
      methodology = await (loader[loadMethod] as () => Promise<string>)();
    } catch {
      methodology = `# Methodology not found for ${phaseKey}`;
    }
  }

  // 3. Get phase scaffolding
  const scaffolding = getPhaseScaffolding(phaseKey);

  // 4. Find tool-generated files that exist
  const toolOutputs = await findToolOutputs(project_path, config);

  // 5. Extract transcript info from config
  const transcripts = (config?.transcripts || []).map((t: any) => ({
    name: t.name,
    path: t.path,
    status: t.status,
    current_phase: t.current_phase || null,
  }));

  // 6. Log session start (best-effort)
  try {
    const firstTranscript = transcripts[0];
    if (firstTranscript?.path) {
      const processLogger = new ProcessLogger();
      await processLogger.log(firstTranscript.path, 'session_start', {
        phase: phase,
      });
    }
  } catch {
    // Best-effort
  }

  // 7. Build phase-specific instructions
  let phaseInstruction = '';
  if (phaseKey === 'phase3') {
    phaseInstruction =
      'When ready, call phase3_extract_codes(project_path=...) to generate the code summary.';
  }

  return {
    status: 'started',
    phase: phaseKey,
    methodology,
    phase_scaffolding: scaffolding || undefined,
    tool_outputs: toolOutputs,
    transcripts,
    instructions: `
PHASE START: ${phaseKey.toUpperCase()}

CRITICAL — SHOW METHODOLOGY FIRST:
Above is 'methodology' — the ${phaseKey} methodology document.
You MUST show the FULL methodology content to the researcher BEFORE
proceeding. DO NOT summarise — show complete text.
Wait for the researcher's "OK" before continuing.
${phaseInstruction ? '\n' + phaseInstruction : ''}

THE RESEARCHER HAS INTERPRETIVE AUTHORITY.
    `.trim(),
  };
}

/**
 * Find tool-generated files that exist in the project.
 * Only checks known paths — no glob patterns.
 */
async function findToolOutputs(
  projectPath: string,
  config: any
): Promise<{ path: string; size_kb: number; modified: string }[]> {
  const outputs: { path: string; size_kb: number; modified: string }[] = [];

  // Known tool-generated files in project root
  const knownFiles = [
    'phase3_code_extraction.md',
    'phase3_code_summary.md',
  ];

  for (const file of knownFiles) {
    const filePath = join(projectPath, file);
    try {
      const stat = await fs.stat(filePath);
      outputs.push({
        path: filePath,
        size_kb: Math.round(stat.size / 1024),
        modified: stat.mtime.toISOString().split('T')[0],
      });
    } catch {
      // File doesn't exist — skip
    }
  }

  // Transcript companion files (_coding_log.md, _process_log.jsonl)
  const transcripts = config?.transcripts || [];
  for (const t of transcripts) {
    if (!t.path) continue;

    const companions = [
      { suffix: '_coding_log.md', path: t.path.replace(/\.md$/, '_coding_log.md') },
      { suffix: '_process_log.jsonl', path: t.path.replace(/\.md$/, '_process_log.jsonl') },
    ];

    for (const comp of companions) {
      try {
        const stat = await fs.stat(comp.path);
        outputs.push({
          path: comp.path,
          size_kb: Math.round(stat.size / 1024),
          modified: stat.mtime.toISOString().split('T')[0],
        });
      } catch {
        // Doesn't exist — skip
      }
    }
  }

  return outputs;
}
