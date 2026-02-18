/**
 * project_setup - Create RTA project structure and configuration
 *
 * Creates project folder with:
 * - rta_config.yaml (from template)
 * - methodology/ (copied from repo)
 * - coding_decisions.md (from template - researcher fills in during coding)
 * - transcripts/ (COPIED from originals - originals are NEVER modified)
 * - project_state.json
 *
 * NOTE: This tool does NOT require init() to be called first.
 * It is a setup tool that prepares the project structure.
 */

import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import { addLineIndex } from './add_line_index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ProjectSetupInput {
  project_name: string;
  output_path: string;
  researcher: string;
  transcripts: string[];
}

export interface ProjectSetupOutput {
  success: boolean;
  project_path: string;
  config_path: string;
  files_created: string[];
  transcripts_copied: string[];
  transcripts_indexed: string[];
  message: string;
  next_step: string;
}

/**
 * Recursively copy a directory
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  let entries;
  try {
    entries = await fs.readdir(src, { withFileTypes: true });
  } catch (error) {
    // Source directory doesn't exist - skip
    console.error(`[project_setup] Source directory not found: ${src}`);
    return;
  }

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function projectSetup(
  input: ProjectSetupInput
): Promise<ProjectSetupOutput> {
  const { project_name, output_path, researcher, transcripts } = input;

  // Validate input
  if (!project_name || project_name.trim() === '') {
    throw new Error('project_name is required');
  }
  if (!output_path || output_path.trim() === '') {
    throw new Error('output_path is required');
  }
  if (!researcher || researcher.trim() === '') {
    throw new Error('researcher is required');
  }
  if (!transcripts || !Array.isArray(transcripts)) {
    throw new Error('transcripts must be an array');
  }

  // 1. Create project directory
  const projectPath = join(output_path, project_name);
  await fs.mkdir(projectPath, { recursive: true });

  const filesCreated: string[] = [];

  // 2. Copy methodology/ from repo to project
  const repoMethodology = join(__dirname, '../../methodology');
  const projectMethodology = join(projectPath, 'methodology');

  try {
    await copyDirectory(repoMethodology, projectMethodology);
    filesCreated.push('methodology/');
  } catch (error) {
    console.error('[project_setup] Failed to copy methodology:', error);
    // Create empty methodology folder
    await fs.mkdir(projectMethodology, { recursive: true });
    filesCreated.push('methodology/ (empty - source not found)');
  }

  // 3. Copy coding_decisions_template.md → coding_decisions.md
  const codingDecisionsTemplate = join(__dirname, '../../templates/coding_decisions_template.md');
  const codingDecisionsDest = join(projectPath, 'coding_decisions.md');

  try {
    await fs.copyFile(codingDecisionsTemplate, codingDecisionsDest);
    filesCreated.push('coding_decisions.md');
  } catch (error) {
    console.error('[project_setup] Failed to copy coding_decisions_template.md:', error);
    filesCreated.push('coding_decisions.md (FAILED - template not found)');
  }

  // 4. Load and customize rta_config template
  const templatePath = join(__dirname, '../../templates/rta_config.yaml');
  let template: string;

  try {
    template = await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(`Template not found at ${templatePath}. Run from repo root.`);
  }

  const now = new Date().toISOString();
  const configContent = template
    .replace(/\{\{PROJECT_NAME\}\}/g, project_name)
    .replace(/\{\{RESEARCHER\}\}/g, researcher)
    .replace(/\{\{CREATED\}\}/g, now);

  // 5. Create transcripts/ folder and COPY transcripts (originals never touched)
  const transcriptsDir = join(projectPath, 'transcripts');
  await fs.mkdir(transcriptsDir, { recursive: true });
  filesCreated.push('transcripts/');

  const transcriptsCopied: string[] = [];
  const copiedTranscriptPaths: { original: string; copied: string; name: string }[] = [];

  for (const originalPath of transcripts) {
    const fileName = basename(originalPath);
    const copiedPath = join(transcriptsDir, fileName);

    try {
      await fs.copyFile(originalPath, copiedPath);
      transcriptsCopied.push(fileName);
      copiedTranscriptPaths.push({
        original: originalPath,
        copied: copiedPath,
        name: fileName,
      });
    } catch (error) {
      console.error(`[project_setup] Failed to copy transcript: ${originalPath}`, error);
      transcriptsCopied.push(`${fileName} (FAILED TO COPY)`);
    }
  }

  // 6. Add line indices to all copied transcripts (0001, 0002, ...)
  const transcriptsIndexed: string[] = [];

  for (const t of copiedTranscriptPaths) {
    try {
      await addLineIndex({ file_path: t.copied });
      transcriptsIndexed.push(t.name);
    } catch (error) {
      console.error(`[project_setup] Failed to add line index to: ${t.name}`, error);
      transcriptsIndexed.push(`${t.name} (INDEX FAILED)`);
    }
  }

  // 7. Parse and add transcripts (pointing to COPIED files, not originals)
  const configObj = yaml.load(configContent) as any;
  configObj.transcripts = copiedTranscriptPaths.map((t) => ({
    path: t.copied,
    original_path: t.original,
    name: t.name,
    status: 'pending',
    indexed: transcriptsIndexed.includes(t.name),
    current_phase: null,
  }));

  const configPath = join(projectPath, 'rta_config.yaml');
  await fs.writeFile(configPath, yaml.dump(configObj, { indent: 2 }));
  filesCreated.push('rta_config.yaml');

  // 8. Create project_state.json
  const projectState = {
    version: '1.0',
    project_name,
    created: now,
    last_updated: now,
    current_phase: null,
    phases: {},
  };

  const statePath = join(projectPath, 'project_state.json');
  await fs.writeFile(statePath, JSON.stringify(projectState, null, 2));
  filesCreated.push('project_state.json');

  return {
    success: true,
    project_path: projectPath,
    config_path: configPath,
    files_created: filesCreated,
    transcripts_copied: transcriptsCopied,
    transcripts_indexed: transcriptsIndexed,
    message: `Project '${project_name}' created. ${transcriptsCopied.length} transcript(s) COPIED and INDEXED (originals preserved).`,
    next_step:
      'Call init() to get critical instructions, then use methodology_load or phase2a_code_start to begin coding',
  };
}
