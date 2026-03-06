/**
 * workflow_status - Show project-wide RTA progress
 *
 * Reads rta_config.yaml, lists all transcripts with status,
 * calculates phase progress, and recommends next step.
 *
 * CRITICAL: Requires init() to be called first.
 */

import { sessionState } from '../core/session_state.js';
import { ProjectConfig, RtaConfig } from '../core/project_config.js';

export async function workflowStatus(args: {
  project_path?: string;
}): Promise<any> {
  sessionState.requireInit();

  const { project_path } = args;

  // Resolve config path: explicit arg > session state
  let configPath = project_path
    ? `${project_path}/rta_config.yaml`
    : sessionState.getConfigPath();

  if (!configPath) {
    throw new Error(
      'No project path provided and no config path in session. ' +
      'Provide project_path or run a tool that sets the config path first.'
    );
  }

  // If session state has a config path but it's a transcript path, find config
  if (!configPath.endsWith('rta_config.yaml')) {
    const found = await ProjectConfig.findFromTranscript(configPath);
    if (!found) {
      throw new Error(`Could not find rta_config.yaml from path: ${configPath}`);
    }
    const loaded = await found.load();
    return buildStatus(loaded, found);
  }

  const projectConfig = new ProjectConfig(configPath);
  const config = await projectConfig.load();
  return buildStatus(config, projectConfig);
}

function buildStatus(config: RtaConfig, projectConfig: ProjectConfig): any {
  const transcripts = config.transcripts || [];
  const currentPhase = config.state?.current_phase || null;

  // Compute per-transcript status
  const transcriptStatuses = transcripts.map((t) => ({
    path: t.path,
    status: t.status || 'not_started',
    current_phase: t.current_phase || null,
  }));

  // Count statuses
  const statusCounts: Record<string, number> = {};
  for (const t of transcriptStatuses) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  }

  // Determine overall progress
  const total = transcripts.length;
  const completed2a = transcripts.filter(
    (t) => t.status?.includes('phase2a_complete') || t.status?.includes('phase2b')
  ).length;
  const completed2b = transcripts.filter(
    (t) => t.status?.includes('phase2b_complete') || t.status?.includes('phase3')
  ).length;

  // Recommend next step
  const nextStep = recommendNextStep(config, transcriptStatuses);

  return {
    project: config.project.name,
    researcher: config.project.researcher,
    current_phase: currentPhase,
    transcripts: {
      total,
      statuses: transcriptStatuses,
      summary: statusCounts,
    },
    progress: {
      phase2a_coded: `${completed2a}/${total}`,
      phase2b_reviewed: `${completed2b}/${total}`,
    },
    next_step: nextStep,
    phases_available: Object.keys(config.methodology?.phases || {}),
  };
}

function recommendNextStep(
  config: RtaConfig,
  transcripts: { path: string; status: string; current_phase: string | null }[]
): string {
  // Find first transcript that needs work
  const notStarted = transcripts.find((t) => t.status === 'not_started');
  const inProgress2a = transcripts.find((t) => t.status?.includes('phase2a_in_progress'));
  const complete2a = transcripts.find(
    (t) => t.status?.includes('phase2a_complete') && !t.status?.includes('phase2b')
  );
  const inProgress2b = transcripts.find((t) => t.status?.includes('phase2b_in_progress'));

  if (inProgress2a) {
    return `Continue Phase 2a coding: ${inProgress2a.path} (in progress)`;
  }
  if (inProgress2b) {
    return `Continue Phase 2b review: ${inProgress2b.path} (in progress)`;
  }
  if (complete2a) {
    return `Start Phase 2b review: ${complete2a.path} (coding complete, not yet reviewed)`;
  }
  if (notStarted) {
    return `Start Phase 2a coding: ${notStarted.path} (not yet started)`;
  }

  // All transcripts coded and reviewed
  const all2bComplete = transcripts.every(
    (t) => t.status?.includes('phase2b_complete') || t.status?.includes('phase3')
  );
  if (all2bComplete && transcripts.length > 0) {
    return 'All transcripts coded and reviewed. Ready for Phase 3: call phase3_extract_codes()';
  }

  return 'Check transcript statuses above and decide next step with researcher.';
}
