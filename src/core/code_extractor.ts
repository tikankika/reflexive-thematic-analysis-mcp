import { promises as fs } from 'fs';
import { join, basename } from 'path';
import * as yaml from 'js-yaml';
import { SegmentReader } from './segment_reader.js';

/**
 * CodeExtractor - Extract and aggregate all codes from coded transcripts
 *
 * Reads all coded transcripts in a project, parses code metadata,
 * and generates a markdown summary file for Phase 3 theme generation.
 *
 * This is a READ-ONLY module (relative to transcripts). It produces
 * a new markdown output file but never modifies source transcripts.
 */

// =============================================================================
// Types
// =============================================================================

export interface ParsedCode {
  raw: string;
  name: string;
  rq: string | null;
  level: string | null;
  inVivo: boolean;
}

export interface ExtractedCode extends ParsedCode {
  source: string;
  segmentIndex: number;
  startLine: string;
  endLine: string;
  textExcerpt: string;
}

export interface TranscriptInfo {
  path: string;
  name: string;
  segmentCount: number;
  codeCount: number;
  partial: boolean;
}

export interface ExtractionResult {
  outputFile: string;
  summaryFile: string;
  projectName: string;
  transcriptsProcessed: number;
  transcriptsSkipped: number;
  totalSegments: number;
  totalCodes: number;
  codesPerRq: Record<string, { semantic: number; latent: number; inVivo: number }>;
  uncategorizedCodes: number;
}

// =============================================================================
// Code parsing
// =============================================================================

/**
 * Parse a code string into its components using string splitting.
 *
 * Format: #code_name__rqN_level
 * In vivo: #"exact_quote"__rqN_level
 * Uncategorized: #anything_without_double_underscore_suffix
 */
export function parseCode(raw: string): ParsedCode {
  // Step 1: remove # prefix
  const withoutHash = raw.startsWith('#') ? raw.slice(1) : raw;

  // Step 2: split on __ to separate name from suffix
  const doubleUnderscoreIndex = withoutHash.lastIndexOf('__');

  if (doubleUnderscoreIndex === -1) {
    // No __ separator — uncategorized
    return { raw, name: withoutHash, rq: null, level: null, inVivo: false };
  }

  const name = withoutHash.slice(0, doubleUnderscoreIndex);
  const suffix = withoutHash.slice(doubleUnderscoreIndex + 2);

  // Step 3: parse suffix for RQ and level
  const suffixMatch = suffix.match(/^(\w+)_(semantic|latent)$/);
  const rq = suffixMatch ? suffixMatch[1] : null;
  const level = suffixMatch ? suffixMatch[2] : null;

  // Step 4: detect in vivo
  const inVivo = name.startsWith('"') && name.endsWith('"');

  // If suffix didn't parse, treat as uncategorized but keep the name
  if (!rq || !level) {
    return { raw, name: withoutHash, rq: null, level: null, inVivo };
  }

  return { raw, name, rq, level, inVivo };
}

/**
 * Strip 4-digit line index prefix from a text line.
 * "0042 [SPEAKER_01]: text..." → "[SPEAKER_01]: text..."
 */
function stripLineIndex(line: string): string {
  return line.replace(/^\d{4}\s/, '');
}

/**
 * Create a text excerpt from segment text lines.
 * Strips line indices, joins, truncates to maxLength characters.
 */
function createExcerpt(textLines: string[], maxLength: number = 200): string {
  const stripped = textLines.map(stripLineIndex).join(' ').trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trimEnd() + '...';
}

// =============================================================================
// CodeExtractor class
// =============================================================================

export class CodeExtractor {
  private segmentReader: SegmentReader;

  constructor() {
    this.segmentReader = new SegmentReader();
  }

  /**
   * Extract all codes from a project's coded transcripts.
   *
   * @param projectPath - Path to project directory (contains rta_config.yaml)
   * @returns ExtractionResult with summary and path to generated markdown file
   */
  async extract(projectPath: string): Promise<ExtractionResult> {
    // 1. Load project config
    const configPath = join(projectPath, 'rta_config.yaml');
    let config: any;
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      config = yaml.load(configContent);
    } catch {
      throw new Error(
        'No project configuration found. Run project_setup first.'
      );
    }

    const projectName = config?.project?.name || basename(projectPath);
    const transcripts: { path: string; name: string }[] = (
      config?.transcripts || []
    ).map((t: any) => ({
      path: t.path,
      name: t.name || basename(t.path),
    }));

    if (transcripts.length === 0) {
      throw new Error(
        'No transcripts listed in rta_config.yaml. Run project_setup first.'
      );
    }

    // 2. Process each transcript — detect coded ones by /segment presence
    const allCodes: ExtractedCode[] = [];
    const processedTranscripts: TranscriptInfo[] = [];
    let skippedCount = 0;
    let totalSegments = 0;

    for (const transcript of transcripts) {
      let segments;
      try {
        segments = await this.segmentReader.extractSegments(transcript.path);
      } catch {
        // File not found or unreadable — skip silently
        skippedCount++;
        continue;
      }

      if (segments.length === 0) {
        // No /segment markers — not coded yet, skip silently
        skippedCount++;
        continue;
      }

      totalSegments += segments.length;

      // Check if partially coded (has CODING-STATUS showing incomplete)
      let partial = false;
      try {
        const content = await fs.readFile(transcript.path, 'utf-8');
        const progressMatch = content.match(/Progress:\s*(\d+)\/(\d+)/);
        if (progressMatch) {
          const done = parseInt(progressMatch[1]);
          const total = parseInt(progressMatch[2]);
          if (done < total) partial = true;
        }
      } catch {
        // Ignore — partial detection is best-effort
      }

      let transcriptCodeCount = 0;

      // 3. Parse codes from each segment
      for (const segment of segments) {
        if (segment.codes.length === 0) continue;

        const excerpt = createExcerpt(segment.textLines);

        for (const codeRaw of segment.codes) {
          const parsed = parseCode(codeRaw);
          allCodes.push({
            ...parsed,
            source: transcript.name,
            segmentIndex: segment.index,
            startLine: segment.startIndex,
            endLine: segment.endIndex,
            textExcerpt: excerpt,
          });
          transcriptCodeCount++;
        }
      }

      processedTranscripts.push({
        path: transcript.path,
        name: transcript.name,
        segmentCount: segments.length,
        codeCount: transcriptCodeCount,
        partial,
      });
    }

    if (processedTranscripts.length === 0) {
      throw new Error(
        'No coded transcripts found in any project transcript. Complete Phase 2a coding first.'
      );
    }

    // 4. Aggregate codes by RQ → level → code name
    const codesPerRq = this.aggregateByRq(allCodes);
    const uncategorizedCodes = allCodes.filter((c) => c.rq === null);

    // 5. Generate full detail markdown output
    const outputFile = join(projectPath, 'phase3_code_extraction.md');
    const markdown = this.generateMarkdown(
      projectName,
      processedTranscripts,
      allCodes,
      codesPerRq,
      uncategorizedCodes
    );
    await fs.writeFile(outputFile, markdown, 'utf-8');

    // 5b. Generate condensed summary (all codes visible in one read)
    const summaryFile = join(projectPath, 'phase3_code_summary.md');
    const summary = this.generateSummary(projectName, allCodes);
    await fs.writeFile(summaryFile, summary, 'utf-8');

    // 6. Build summary stats
    const stats: Record<
      string,
      { semantic: number; latent: number; inVivo: number }
    > = {};
    for (const code of allCodes) {
      if (!code.rq) continue;
      if (!stats[code.rq]) stats[code.rq] = { semantic: 0, latent: 0, inVivo: 0 };
      if (code.level === 'semantic') stats[code.rq].semantic++;
      if (code.level === 'latent') stats[code.rq].latent++;
      if (code.inVivo) stats[code.rq].inVivo++;
    }

    return {
      outputFile,
      summaryFile,
      projectName,
      transcriptsProcessed: processedTranscripts.length,
      transcriptsSkipped: skippedCount,
      totalSegments,
      totalCodes: allCodes.length,
      codesPerRq: stats,
      uncategorizedCodes: uncategorizedCodes.length,
    };
  }

  // ===========================================================================
  // Private helpers
  // ===========================================================================

  /**
   * Group codes by RQ → level → code name → occurrences
   */
  private aggregateByRq(
    codes: ExtractedCode[]
  ): Map<string, Map<string, Map<string, ExtractedCode[]>>> {
    const rqMap = new Map<
      string,
      Map<string, Map<string, ExtractedCode[]>>
    >();

    for (const code of codes) {
      if (!code.rq || !code.level) continue;

      if (!rqMap.has(code.rq)) rqMap.set(code.rq, new Map());
      const levelMap = rqMap.get(code.rq)!;

      if (!levelMap.has(code.level)) levelMap.set(code.level, new Map());
      const codeMap = levelMap.get(code.level)!;

      if (!codeMap.has(code.raw)) codeMap.set(code.raw, []);
      codeMap.get(code.raw)!.push(code);
    }

    return rqMap;
  }

  /**
   * Generate a condensed summary with all codes visible in one read.
   * Each code listed once with occurrence count and line ranges.
   */
  private generateSummary(
    projectName: string,
    allCodes: ExtractedCode[]
  ): string {
    const now = new Date().toISOString().split('T')[0];

    // Group by unique code name → occurrences
    const codeMap = new Map<string, ExtractedCode[]>();
    for (const code of allCodes) {
      if (!codeMap.has(code.raw)) codeMap.set(code.raw, []);
      codeMap.get(code.raw)!.push(code);
    }

    const uniqueCount = codeMap.size;
    const sortedCodes = [...codeMap.entries()].sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    const lines: string[] = [];
    lines.push(`# Code Summary — ${projectName}`);
    lines.push('');
    lines.push(
      `Generated: ${now} | Total occurrences: ${allCodes.length} | Unique codes: ${uniqueCount}`
    );
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const [codeRaw, occurrences] of sortedCodes) {
      const lineRanges = occurrences
        .sort((a, b) => a.startLine.localeCompare(b.startLine))
        .map((o) => `${o.startLine}–${o.endLine}`)
        .join(', ');
      lines.push(`${codeRaw} (${occurrences.length}) — ${lineRanges}`);
    }

    lines.push('');
    return lines.join('\n');
  }

  /**
   * Generate the full markdown output file.
   */
  private generateMarkdown(
    projectName: string,
    transcripts: TranscriptInfo[],
    allCodes: ExtractedCode[],
    codesPerRq: Map<string, Map<string, Map<string, ExtractedCode[]>>>,
    uncategorized: ExtractedCode[]
  ): string {
    const now = new Date().toISOString().split('T')[0];
    const lines: string[] = [];

    // Header
    lines.push(`# Code Extraction — ${projectName}`);
    lines.push('');
    lines.push(
      `Generated: ${now} | Transcripts: ${transcripts.length} | ` +
        `Segments: ${transcripts.reduce((s, t) => s + t.segmentCount, 0)} | ` +
        `Total codes: ${allCodes.length}`
    );

    // Note partial transcripts
    const partials = transcripts.filter((t) => t.partial);
    if (partials.length > 0) {
      lines.push('');
      for (const p of partials) {
        lines.push(
          `> **Note:** ${p.name}: partially coded (${p.segmentCount} segments found)`
        );
      }
    }

    lines.push('');
    lines.push('---');

    // RQ sections — sorted by RQ name
    const sortedRqs = [...codesPerRq.keys()].sort();
    for (const rq of sortedRqs) {
      const levelMap = codesPerRq.get(rq)!;
      lines.push('');
      lines.push(`## ${rq.toUpperCase()}`);

      for (const level of ['semantic', 'latent']) {
        const codeMap = levelMap.get(level);
        if (!codeMap || codeMap.size === 0) continue;

        // Count total occurrences for this level
        let levelOccurrences = 0;
        for (const occurrences of codeMap.values()) {
          levelOccurrences += occurrences.length;
        }

        lines.push('');
        lines.push(
          `### ${level} (${codeMap.size} codes, ${levelOccurrences} occurrences)`
        );

        // Sort codes alphabetically
        const sortedCodes = [...codeMap.entries()].sort((a, b) =>
          a[0].localeCompare(b[0])
        );

        for (const [codeRaw, occurrences] of sortedCodes) {
          lines.push('');
          lines.push(`#### ${codeRaw} (${occurrences.length} occurrences)`);

          // Sort occurrences by transcript then line number
          const sorted = [...occurrences].sort((a, b) => {
            const srcCmp = a.source.localeCompare(b.source);
            if (srcCmp !== 0) return srcCmp;
            return a.startLine.localeCompare(b.startLine);
          });

          for (const occ of sorted) {
            lines.push(
              `- **${occ.source}** [${occ.startLine}–${occ.endLine}]: "${occ.textExcerpt}"`
            );
          }
        }
      }

      lines.push('');
      lines.push('---');
    }

    // Uncategorized section
    if (uncategorized.length > 0) {
      lines.push('');
      lines.push('## Uncategorized codes');
      lines.push('');
      lines.push(
        'Codes that do not match the `#name__rqN_level` format:'
      );

      // Group uncategorized by code name
      const uncatMap = new Map<string, ExtractedCode[]>();
      for (const code of uncategorized) {
        if (!uncatMap.has(code.raw)) uncatMap.set(code.raw, []);
        uncatMap.get(code.raw)!.push(code);
      }

      const sortedUncat = [...uncatMap.entries()].sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      for (const [codeRaw, occurrences] of sortedUncat) {
        lines.push('');
        lines.push(`#### ${codeRaw}`);
        for (const occ of occurrences) {
          lines.push(
            `- **${occ.source}** [${occ.startLine}–${occ.endLine}]: "${occ.textExcerpt}"`
          );
        }
      }

      lines.push('');
      lines.push('---');
    }

    // Summary table
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| RQ | Semantic | Latent | In vivo | Total |');
    lines.push('|----|----------|--------|---------|-------|');

    let grandSemantic = 0;
    let grandLatent = 0;
    let grandInVivo = 0;
    let grandTotal = 0;

    for (const rq of sortedRqs) {
      const rqCodes = allCodes.filter((c) => c.rq === rq);
      const sem = rqCodes.filter((c) => c.level === 'semantic').length;
      const lat = rqCodes.filter((c) => c.level === 'latent').length;
      const iv = rqCodes.filter((c) => c.inVivo).length;
      const total = rqCodes.length;
      grandSemantic += sem;
      grandLatent += lat;
      grandInVivo += iv;
      grandTotal += total;
      lines.push(`| ${rq} | ${sem} | ${lat} | ${iv} | ${total} |`);
    }

    if (uncategorized.length > 0) {
      lines.push(
        `| Uncategorized | — | — | — | ${uncategorized.length} |`
      );
      grandTotal += uncategorized.length;
    }

    lines.push(
      `| **Total** | **${grandSemantic}** | **${grandLatent}** | **${grandInVivo}** | **${grandTotal}** |`
    );

    lines.push('');

    return lines.join('\n');
  }
}
