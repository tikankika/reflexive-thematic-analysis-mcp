# MPC_RTA Methodology Documentation

This directory contains the theoretical and practical foundations for AI-Augmented Reflexive Thematic Analysis (RTA) used with the MPC_RTA server.

---

## Overview

MPC_RTA implements a **methodology-agnostic file handler** for qualitative coding. The methodology itself (RTA, Grounded Theory, IPA, etc.) lives in these documents.

**Core Principle**: Server handles ONLY file operations. Coding methodology lives in external documentation uploaded to Claude.

---

## Document Structure

### Main Guides

| Document | Purpose |
|----------|---------|
| `KODNINGSMANUAL_AI_Augmented_RTA_Lins1.md` | Practical step-by-step coding guide |
| `Linser_operationella_definitioner.md` | Operational definitions for Lins 1/2/3 |

### RTA Phases (`/RTA_phases/`)

| Phase | Document | Focus |
|-------|----------|-------|
| 1 | `phase1_familiarization.md` | Data immersion, AI orientation |
| 2 | `phase2_coding.md` | Generating initial codes |
| 3 | `phase3_generating_themes.md` | Clustering codes into themes |
| 4 | `phase4_reviewing_themes.md` | Critical review and refinement |
| 5 | `phase5_defining_naming_themes.md` | Precise definitions, naming |
| 6 | `phase6_producing_report.md` | Analytical write-up |

---

## Theoretical Foundation

### Epistemology
**Constructionist** — Meaning is socially constructed through language

### Orientation
**Experiential** — Prioritize participants' own meaning-making

### Approach
**Predominantly Inductive** — Codes emerge from data, not predetermined

### Coding Level
**Semantic + Latent** — Both surface meanings and underlying assumptions

---

## The Three Lenses (Linser)

For this research project on teachers' perspectives on AI:

| Lins | Focus | Example |
|------|-------|---------|
| **Lins 1** | Elevers användning | "Elever klistrar in hela uppgiften i ChatGPT" |
| **Lins 2** | Lärares praktiker/attityder | "Jag känner mig osäker på hur jag ska bedöma" |
| **Lins 3** | Lärandepåverkan | "De utvecklar inte kritiskt tänkande" |

**Konstruktionistisk påminnelse**: Data är lärares TOLKNINGAR, inte objektiv sanning.

---

## Code Format

```markdown
#kod_beskrivning__lins1        (semantisk kod)
#"in_vivo_uttryck"__lins1      (in vivo kod)
#→latent_tolkning__lins2       (latent kod)
```

---

## MPC_RTA Tools → Methodology Mapping

| Methodology Step | MPC_RTA Tool |
|------------------|--------------|
| Läsa segment (60-100 rader) | `code_read_next` |
| Föreslå koder | Claude + manual |
| Skriva koder med /segment | `code_write_segment` |
| Hoppa över meta-innehåll | `code_skip_chunk` |
| Spåra progress | `code_status` |
| Felhantering | `code_verify`, `code_clear_all` |

---

## Reflexive Practice

After each ~100 lines, document:
1. Antal nya koder detta segment
2. Totalt antal koder hittills
3. Framväxande mönster

---

## Key References

- Byrne, D. (2022). A worked example of Braun and Clarke's approach to reflexive thematic analysis. *Quality & Quantity*, 56, 1391-1412.
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77-101.
- Braun, V., & Clarke, V. (2019). Reflecting on reflexive thematic analysis. *Qualitative Research in Sport, Exercise and Health*, 11(4), 589-597.

---

## Source

This documentation was originally developed for the ULF project (2025-12-07) analyzing focus group data about teachers' experiences with AI in Swedish education.

Copied to MPC_RTA project: 2026-01-08
