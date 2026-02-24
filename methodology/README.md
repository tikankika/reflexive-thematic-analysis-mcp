# Dialogic Reflexive Thematic Analysis: A Researcher's Guide

## What You're Reading

This folder contains the complete methodology for conducting Reflexive Thematic Analysis (Braun & Clarke, 2006, 2022) as a dialogic practice between researcher and AI. Read this document first. It orients you to the methodology, its principles, and where to find what you need.

---

## What Is Dialogic RTA?

Reflexive Thematic Analysis is a qualitative method for constructing themes — patterns of shared meaning — from data through the researcher's active interpretive engagement (Braun & Clarke, 2019, 2022).

Dialogic RTA conducts this analysis through multi-layered dialogue — between researcher and AI, researcher and data, and researcher and their own interpretive commitments. The term "Dialogic" replaces "AI-Augmented" because it captures what actually happens: analytical meaning is not produced by a researcher using a tool but constructed through conversation, where each participant (human and computational) shapes the other's contribution. The dialogue *is* the method — not a means to the method.

This is not a neutral addition to traditional RTA. AI mediation changes the conditions under which analysis occurs. It introduces a processing layer with its own biases, tendencies, and blind spots that interact with the researcher's analytical work. A responsible methodology must theorize this interaction, not merely acknowledge it. That theorization is distributed across the documents in this folder.

---

## Four Foundational Principles

### 1. The "Proving the Obvious" Problem

Brailas (2025), drawing on Dröge (2025), identifies a core risk: Large Language Models generate responses by selecting the most statistically probable continuation based on training data. AI-generated codes and thematic suggestions tend to reproduce dominant, expected patterns rather than surface anomalies, contradictions, or contextually specific meanings. AI may give an illusion of analytical depth while reflecting common-sense generalizations already embedded in training data.

For qualitative research, this matters because the purpose of analysis is not to mirror common sense but to trouble it (Brailas, 2025). The richness of qualitative data lies in what resists easy categorization.

**The operational question that should accompany every analytical decision:**

> "What would AI expect the data to say — and where does the actual data diverge from that expectation?"

This transforms AI's predictive bias from a liability into a heuristic device. AI's tendency toward the obvious becomes a tool for discovering the non-obvious.

### 2. Double Reflexivity

Standard reflexive practice involves the researcher examining their own biases and interpretive lens (Braun & Clarke, 2019). Dialogic RTA requires a second layer.

Ozuem et al. (2025) propose **double reflexivity**:

1. **Reflexivity toward one's own positioning** — the researcher's theoretical commitments, assumptions, and interpretive habits
2. **Reflexivity toward AI mediation** — how the AI tool's processing shapes, filters, or distorts the analytical encounter

The second layer asks: Does this code or theme reflect something genuinely present in the data, or has AI's "way of seeing" imposed a pattern from its training data?

### 3. AI as Heuristic Partner, Not Authority

AI proposes, the researcher constructs. AI's outputs are starting points for interpretive engagement, not findings. The researcher's interpretive authority is not ceremonial — it is the methodological core of RTA.

This is not a limitation to be managed but a feature to be exploited. The dialogue between researcher and AI — where proposals are evaluated, challenged, revised, and sometimes rejected — makes interpretive reasoning more explicit than purely human coding often does. The researcher must articulate *why* a suggestion works or doesn't, which strengthens the reflexive audit trail.

### 4. Dialogic Reflexivity

The dialogue between researcher and AI constitutes the reflexive process itself. Every correction, redirection, rejection, and discovery in the analytical dialogue is an exercise of interpretive authority — and contains methodologically crucial knowledge that exists nowhere else.

This principle demands that the dialogic process be systematically preserved and reflected upon. Without this, the methodology claims to make interpretive reasoning more explicit through dialogue while allowing that dialogue to disappear between sessions. The result would be worse than traditional RTA: the illusion of transparency without actual preservation.

Dialogic reflexivity operates in two modes: **reflection-in-action** (logging epistemically significant moments during analytical work) and **reflection-on-action** (writing process memos between phases that reflect on the dialogic process as a whole).

For the full theoretical grounding and practical implementation, see `dialogic_reflexivity.md`.

---

## How to Use This Methodology

### Reading order

**Before your first project:**
1. **This document** — the four principles and overall orientation
2. **`epistemology/constructionist.md`** — epistemological positioning, the constructionist-computational tension, and how to orient the dialogic partnership
3. **`dialogic_reflexivity.md`** — the cross-cutting practice of preserving and reflecting on the dialogic process
4. **`epistemology/orientation.md`** — experiential versus critical orientation
5. **`epistemology/inductive_deductive.md`** — approach
6. **`epistemology/semantic_latent.md`** — coding levels

**Before each phase:**
Read the relevant phase document. Each is self-contained but builds on the principles established here and in the epistemology documents.

### Document map

```
methodology/
│
├── README.md                      ← YOU ARE HERE
│                                    Four principles, reading order, overview
│
├── dialogic_reflexivity.md        ← Cross-cutting practice
│                                    Reflection-in-action, reflection-on-action,
│                                    process logging, process memos
│                                    Theoretical: Bakhtin, Gadamer, Schön,
│                                    postphenomenology
│
├── epistemology/
│   ├── constructionist.md         ← Epistemological foundation
│   │                                Constructionist-computational tension,
│   │                                positioning your analysis,
│   │                                orienting the dialogic partnership
│   ├── orientation.md             ← Experiential vs critical
│   ├── inductive_deductive.md     ← Approach
│   └── semantic_latent.md         ← Coding levels
│
├── phase1_familiarization.md      ← Preparatory (not yet analytical)
├── phase2a_initial_coding.md      ← Generating codes through dialogue
├── phase2b_critical_review.md     ← Researcher exercises interpretive authority
├── phase3_generating_themes.md    ← Constructing themes from code patterns
├── phase4_reviewing_themes.md     ← Testing themes against data
├── phase5_defining_naming.md      ← Articulating what each theme captures
└── phase6_producing_report.md     ← Writing the analytical narrative
```

---

## Epistemological Foundation

The epistemological commitments that shape this methodology are articulated fully in `epistemology/constructionist.md`. In brief:

**Constructionist epistemology.** Meaning is socially produced through language, not simply reflected by it. Codes and themes are constructions, not discoveries. AI's computational pattern recognition risks reifying interpretations as objective — the methodology actively resists this.

**Experiential orientation.** Participants' own meaning-making is prioritized. AI cannot access experiential meaning — it processes text. The gap between textual patterns and experiential meaning is where the researcher's interpretive work is most essential.

**Predominantly inductive approach.** Codes and themes grow from the data. AI's training data constitutes an implicit framework that may masquerade as induction — this is the "proving the obvious" problem applied to method.

**Semantic and latent coding.** Both levels are employed. AI performs better at semantic coding than latent. Phase 2b specifically targets this asymmetry.

---

## The Six Phases

RTA comprises six recursive, non-linear phases (Braun & Clarke, 2006, 2022; Byrne, 2022). Dialogic RTA changes how each phase is conducted but not what each phase must accomplish. At every phase, the dialogic process produces epistemically significant moments requiring preservation (see `dialogic_reflexivity.md`).

| Phase | Purpose | AI's Role | Key Risk | Dialogic Focus |
|-------|---------|-----------|----------|----------------|
| **1** Familiarization | Establish intimate knowledge of data | Oriented to project; scaffolds immersion | Outsourcing immersion to AI summaries | Orienting the partnership |
| **2a** Initial Coding | Generate codes through close reading | Proposes codes; researcher evaluates | Accepting plausible but shallow codes | Bias identification, RQ focus |
| **2b** Critical Review | Exercise interpretive authority | Codes treated as proposals under review | Rubber-stamping AI output | Contextual knowledge, revision rationale |
| **3** Generating Themes | Construct themes from code patterns | Suggests clusters; researcher constructs | Reproducing expected structures | Meaningfulness vs frequency |
| **4** Reviewing Themes | Test themes against data and RQ | Helps interrogate; researcher decides | AI confirming weak themes | Theme-breaking, alternative readings |
| **5** Defining & Naming | Articulate what each theme captures | Assists definition; researcher owns voice | Generic labels displacing researcher | Analytical precision, data grounding |
| **6** Producing Report | Write analytical narrative | Assists drafting; researcher maintains voice | Flattened prose lacking depth | Constructionist argument, interpretive voice |

**Recursivity is fundamental.** The researcher moves between phases as understanding deepens. In Dialogic RTA, recursivity has an additional dimension: the researcher may need to revisit AI-coded segments with fresh interpretive eyes, precisely because initial engagement was mediated by AI's proposals.

**Phase 1 is different in kind from Phases 2–6.** It is preparatory, not analytical. It creates the conditions for dialogic analysis by establishing the researcher's independent relationship with the data.

---

## What AI Cannot Access

Across all phases, certain analytical capacities remain exclusively human:

- **Contextual and cultural meaning**: Local institutional cultures, policy contexts, professional discourse norms, cultural connotations of specific terms
- **Experiential weight**: Which statements carry strong emotion, hesitation, or conviction; what is said tentatively versus emphatically
- **Group dynamics**: Who speaks and who doesn't, how participants build on or challenge each other, what is safe to say in a given group
- **Silence and absence**: What is not said, what topics are avoided, where conversation redirects
- **Contradictions and ambivalence**: Internal tensions in reasoning, "yes, but..." moments, positions held simultaneously
- **Language beyond text**: Tone, pauses, laughter, emphasis — available from recordings but invisible to text-processing AI

These are not marginal concerns. They are often where the most analytically interesting data resides.

---

## References

### Core RTA Methodology
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77–101.
- Braun, V., & Clarke, V. (2014). What can "thematic analysis" offer health and wellbeing researchers? *International Journal of Qualitative Studies on Health and Well-being*, 9(1), 26152.
- Braun, V., & Clarke, V. (2019). Reflecting on reflexive thematic analysis. *Qualitative Research in Sport, Exercise and Health*, 11(4), 589–597.
- Braun, V., & Clarke, V. (2021). One size fits all? What counts as quality practice in (reflexive) thematic analysis? *Qualitative Research in Psychology*, 18(3), 328–352.
- Braun, V., & Clarke, V. (2022). *Thematic Analysis: A Practical Guide*. Sage.
- Byrne, D. (2022). A worked example of Braun and Clarke's approach to reflexive thematic analysis. *Quality & Quantity*, 56, 1391–1412.

### AI in Qualitative Research
- Al-Fattal, A., & Singh, J. (2025). Comparative reflections on human-driven and generative artificial intelligence-assisted thematic analysis. *International Journal of Qualitative Methods*, 24, 1–10.
- Brailas, A. (2025). Artificial intelligence in qualitative research: Beyond outsourcing data analysis to the machine. *Psychology International*, 7(3), 78.
- Dröge, K. (2025). Why AI has a "proving the obvious" problem, and what we can do about it. *CAQDAS Networking Project Blog*.
- Ozuem, W., Willis, M., Ranfagni, S., & Omeish, F. (2025). Thematic analysis in an artificial intelligence-driven context. *International Journal of Qualitative Methods*, 24, 1–15.

### Dialogic Reflexivity
- Bakhtin, M. M. (1981). *The Dialogic Imagination*. University of Texas Press.
- Gadamer, H.-G. (2004). *Truth and Method* (2nd rev. ed.). Continuum.
- Schön, D. A. (1983). *The Reflective Practitioner*. Basic Books.
- Ihde, D. (1990). *Technology and the Lifeworld*. Indiana University Press.
- Verbeek, P.-P. (2005). *What Things Do*. Pennsylvania State University Press.
