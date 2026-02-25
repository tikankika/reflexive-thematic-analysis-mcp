# Dialogic Reflexivity in Dialogic RTA

## Purpose

Every phase of Dialogic RTA produces analytical dialogue between researcher and AI — proposals, corrections, redirections, rejections, discoveries. This dialogue is where interpretive authority is exercised. It is the reflexive process itself.

Dialogic reflexivity is the systematic practice of **preserving and reflecting on this dialogue** as a methodological artefact. It is not a separate phase. It is a cross-cutting practice that operates within and between all six phases of RTA, wherever researcher and AI engage in analytical work.

The foundational principles — "proving the obvious," double reflexivity, and AI as heuristic partner — are established in the Methodological Framework. This document adds a fourth principle: that the dialogue through which these principles are enacted must itself be documented and reflected upon, or the methodology's claim to transparency becomes hollow.

---

## What This Means in Practice

Dialogic reflexivity has two modes, following Schön's (1983) distinction between reflection-in-action and reflection-on-action.

### During each phase: Log epistemically significant moments

While coding, reviewing, generating themes, or writing with AI, **the dialogue itself produces methodologically important knowledge.** Not every exchange — but those moments where the researcher exercises interpretive authority against AI's computational tendencies.

**Log these moments via `log_process_event`:**

| Moment | Example | Event type |
|--------|---------|------------|
| You correct AI's pattern | "varför alltid samma antal koder?" | `correction` |
| You redirect toward research questions | "har vi frågeställningen i fokus?" | `focus` |
| You reject AI's suggestion on epistemological grounds | "nej, koda varianterna" | `rejection` |
| You discover something AI cannot see | Identifying moderators in recording | `discovery` |
| You establish a new convention | Creating `_mod`-suffix | `convention` |
| You make a methodological decision | "latent bara vid genuint djupare mening" | `methodology` |
| A tool-level issue affects the analysis | Segment deletion destroys data | `tool_issue` |
| You reflect on the process itself | "detta fångar ju inte dialogen..." | `meta_reflexive` |

**What is captured:** Event type, your exact words (in vivo), context (phase, segment, chunk), and before/after state where relevant.

**What is NOT captured here:** The full dialogue. That requires chat export (see below).

**Granularity principle:** Log at epistemically significant moments — when you correct, redirect, reject, discover, or decide. Not at every coding decision. The threshold is: *would losing this moment impoverish the audit trail?*

### Between phases: Write a dialogic process memo

After completing a major analytical unit — one transcript through phases 2a+2b, or one complete cycle of phase 3, 4, 5, or 6 — **stop and reflect on the process before continuing.**

Use the process log as an index: it tells you where the significant moments occurred. Use the exported chat dialogue (if available) for full context. Then write a memo addressing:

1. **AI bias patterns observed.** What systematic tendencies did AI exhibit? (uniformity, condensation, drift from RQ, formulaic output, lexical clustering, computational agreeableness) Were these the same as in previous phases/transcripts, or different?

2. **Your corrections.** What did you correct, and what does the pattern of corrections reveal about your own analytical commitments? Did you correct the same things repeatedly (suggesting AI's bias is systematic) or different things (suggesting your analytical sensitivity is developing)?

3. **Contextual knowledge you deployed.** Where did you bring knowledge that AI structurally cannot access? (Who is speaking, institutional context, cultural meaning, conversational dynamics, what was *not* said)

4. **Epistemological positions you maintained.** Where did you insist on an interpretive position against AI's computational tendencies? (Variants as data, meaningfulness over frequency, situated meaning over lexical pattern, constructionist over essentialist reading)

5. **Your analytical development.** How has your analysis changed through dialogue with AI? What do you see now that you did not see before? What has AI's mediation made visible — and what might it have obscured?

6. **Unresolved questions.** What remains open for the next phase or session?

**Where this is saved:**
```
process_memos/
├── memo_2a2b_rec_1.md
├── memo_2a2b_rec_2.md
├── memo_phase3.md
├── memo_phase4.md
└── memo_phase5.md
```

### Each phase produces different dialogic risks

The reflexive focus shifts across phases because AI's tendencies manifest differently:

| Phase | AI's typical tendency | Your reflexive focus |
|-------|----------------------|------------------------------|
| **2a** Initial coding | Uniform code density, drift from RQ, condensation of variants, formulaic notes | Bias identification, RQ focus, epistemological resistance |
| **2b** Critical review | Confirmation of own earlier proposals, surface-level agreement | "Proving the obvious" check, contextual knowledge, code revision rationale |
| **3** Theme generation | Clustering by lexical similarity, generic thematic structures (benefits/barriers) | Meaningfulness vs frequency, constructionist thematic construction |
| **4** Theme review | Validating weak themes, computational agreeableness | Deliberate theme-breaking, alternative readings, external challenge |
| **5** Defining/naming | Generic descriptive labels, abstracting away from data | Analytical precision, data-grounded naming, your voice |
| **6** Writing | Fluent but descriptive prose, categorizing rather than interpreting | Constructionist analytical argument, interpretive depth |

The process memo after each phase addresses these phase-specific risks while tracking your analytical development across the entire study. The researcher who has completed 2a+2b on five transcripts should be able to identify patterns in their own corrections across all five — and this meta-pattern is itself data about the analytical process.

### Three artefacts, three purposes

| Artefact | What it captures | Purpose |
|----------|-----------------|---------|
| `_process_log.jsonl` | Structured index of epistemically significant events | Tells you *where to look* |
| `chat_exports/` | Complete analytical dialogue, preserved as raw data | Tells you *what happened* |
| `process_memos/` | Researcher-authored reflection-on-action | Records *what it means* |

The relationship:

```
_process_log.jsonl  →  indexes  →  chat_exports/
       ↓                               ↓
  identifies what                provides the full
  to reflect on                  context for reflection
       ↓                               ↓
       └──────────→  process_memos/  ←──┘
                     (researcher writes)
```

---

## Why This Matters: The Epistemological Paradox

Dialogic RTA produces three categories of analytical artefact:

1. **Products** — coded transcripts, themes, theme maps, the final report
2. **Process documentation** — reflexive notes, code revision histories, review files
3. **The dialogic process itself** — the conversation between researcher and AI in which analytical decisions are made, challenged, revised, and justified

Categories 1 and 2 are preserved by existing tools and practices. Category 3 — which constitutes the actual reflexive work in Dialogic RTA — has, without the practices described above, no systematic infrastructure for preservation or analytical treatment.

This matters because the dialogic process contains methodologically crucial knowledge that exists nowhere else: the researcher's corrections of AI bias, the epistemological reasoning behind coding decisions, the discovery of contextual factors AI cannot access, the researcher's insistence on analytical positions that resist AI's computational tendencies. These are not incidental exchanges. They are the medium through which interpretive authority is exercised.

If the dialogic process is not preserved, Dialogic RTA faces an epistemological paradox: the methodology claims to make interpretive reasoning more explicit through dialogue, while the infrastructure preserves only the products of that dialogue, not the dialogue itself. The result is worse than traditional RTA — we have the illusion of transparency without actual preservation of the transparency that was produced.

---

## Theoretical Foundations

The practices described above rest on theoretical commitments that require articulation. Each tradition contributes a specific conceptual tool without which dialogic reflexivity cannot be adequately understood.

### From monologic to dialogic reflexivity

Reflexivity in qualitative research has traditionally been conceived as a **monologic** practice. The researcher reflects on their own assumptions, biases, and interpretive commitments — alone, in a research journal, through introspection. Braun and Clarke (2019, 2022) frame reflexivity as the researcher's awareness that their subjectivity shapes the analysis: "subjectivity as a resource, not a problem to be managed."

This framing assumes a single interpreting subject. Dialogic RTA disrupts this assumption. When the researcher works in dialogue with AI, the interpretive process is no longer contained within a single mind. It unfolds **between** two analytical agents — one human, one computational — through conversation. The reflexive question shifts from "how am I shaping this analysis?" to "how is this analysis being shaped through our dialogue?"

This shift has precedent in qualitative methodology. Collaborative reflexivity in team-based research (Barry et al., 1999; Finlay, 2002) recognizes that when multiple researchers analyse data together, the reflexive process becomes intersubjective — meaning is negotiated, not simply generated. Dialogic RTA extends this logic to human-machine dialogue, while recognizing that AI is not an equivalent intersubjective partner but a computational system with specific tendencies and limitations.

### Bakhtin: Meaning as dialogic

Bakhtin's (1981, 1986) theory of dialogism provides the deepest theoretical ground for understanding what happens in researcher-AI analytical dialogue.

For Bakhtin, meaning does not reside in individual utterances. It emerges in the **responsive relationship** between utterances — in the space between speaker and listener, between question and answer, between proposal and evaluation. Every utterance is shaped by the anticipated response; every response reshapes the meaning of what preceded it.

This maps directly onto the Dialogic RTA coding process. When AI proposes a code, the proposal's meaning is incomplete until the researcher responds — accepting, modifying, or rejecting it. And the researcher's response is itself shaped by AI's proposal: the researcher would not have articulated certain interpretive positions without the provocation of AI's suggestion.

Three Bakhtinian concepts are particularly relevant:

**Responsive understanding.** Bakhtin (1986) argues that genuine understanding is always responsive — it involves taking a position toward what is understood. When the researcher evaluates AI's proposed code, they are not passively assessing correctness but actively constructing meaning through their evaluative response. The code that enters the analysis is neither AI's proposal nor the researcher's independent construction — it is the product of responsive engagement.

**The utterance as unit.** For Bakhtin, the fundamental unit of communication is not the sentence but the utterance — a speech act that anticipates response and is shaped by the discourse that preceded it. In Dialogic RTA, the fundamental analytical unit is not the individual code but the **dialogic exchange**: AI's proposal, the researcher's evaluation, the resulting revision. Preserving only the final code is like preserving only the last sentence of a conversation — technically complete but contextually empty.

**Heteroglossia.** Bakhtin's concept of heteroglossia — the simultaneous coexistence of multiple voices and perspectives within discourse — illuminates the composite subjectivity of Dialogic RTA. The analytical voice is not singular. It carries traces of AI's computational patterns, the researcher's interpretive commitments, and the dialogue through which these were negotiated.

### Gadamer: Dialogue as the medium of understanding

Gadamer's (1960/2004) hermeneutics reinforces and extends the Bakhtinian framework. For Gadamer, understanding is not a method to be applied but an event that occurs in dialogue. The concept of **Horizontverschmelzung** (fusion of horizons) describes how understanding emerges when different perspectives — each with their own pre-understandings, assumptions, and interpretive frameworks — engage in genuine conversation.

In Dialogic RTA, two "horizons" meet:

- **The researcher's horizon:** Theoretical commitments, contextual knowledge, epistemological position, familiarity with the data, professional experience, cultural understanding
- **AI's horizon:** Statistical patterns from training data, tendency toward balanced structures, lexical pattern recognition, computational agreeableness, absence of situated context

Understanding — in the form of analytical codes and themes — emerges not from either horizon alone but from their encounter. The codes that survive the dialogic process carry the imprint of both horizons, refined through negotiation.

Critically, Gadamer insists that genuine dialogue requires **openness to being changed by the encounter.** The researcher who engages seriously with AI's proposals is not simply checking them against pre-established criteria — they are allowing AI's "seeing" to expand their own analytical vision, while simultaneously insisting on interpretive standards that AI cannot generate from within its computational horizon. This mutual transformation is the productive core of Dialogic RTA.

### Schön: Reflection-in-action and reflection-on-action

Schön's (1983) distinction between two modes of reflective practice provides the temporal structure for dialogic reflexivity as operationalized above:

**Reflection-in-action** occurs during the analytical work itself — in real time, within the dialogue. When the researcher says "har vi frågeställningen i fokus?" mid-coding, they are reflecting on the process while it unfolds. This is what the process log captures: structured events logged at the moment they occur.

**Reflection-on-action** occurs after the analytical work, looking back at what happened. This is what the process memo captures: the researcher reviewing the process log and chat dialogue, identifying patterns in their own analytical practice, and articulating what the dialogic process revealed.

Both modes are methodologically necessary. Reflection-in-action produces the corrections, redirections, and epistemological interventions that maintain analytical quality during the session. Reflection-on-action produces the meta-analytical awareness that informs future sessions and contributes to the audit trail.

Schön also introduces the concept of the **reflective practitioner** — someone who does not simply apply method but reflects on and adapts their practice in response to the situation. Dialogic RTA requires this reflexive adaptability: the researcher cannot follow a fixed protocol because AI's contributions are unpredictable, context-dependent, and require situated judgement.

### Postphenomenology: Technology as mediating experience

Ihde's (1990) and Verbeek's (2005, 2011) postphenomenological framework theorizes how technologies mediate human experience and perception — not as neutral instruments but as active shapers of what can be seen, thought, and done.

In Dialogic RTA, the AI tool mediates the researcher's encounter with data. It does not simply transmit or process — it **transforms** the analytical experience. Through AI's proposals, the researcher sees patterns they might not have seen alone. Through AI's biases, certain patterns are foregrounded while others are suppressed. Through the dialogic form itself, the researcher is compelled to articulate interpretive reasoning that might otherwise remain tacit.

Postphenomenology identifies multiple human-technology relations. Dialogic RTA involves at least two:

**Hermeneutic relation** (human → [technology–world]): The researcher interprets the data *through* AI's mediation. AI's codes and suggestions become the "text" through which the researcher reads the data. The risk: AI's reading becomes the researcher's reading without adequate critical distance.

**Alterity relation** (human → technology): The researcher engages with AI as a quasi-other — something that responds, proposes, and "pushes back" (even if only through computational patterns). The dialogue has interactional qualities even though AI is not a genuine interlocutor. The risk: anthropomorphizing AI's responses as analytical insight rather than recognizing them as computational output.

The postphenomenological contribution is the insistence that **the technology cannot be bracketed from the analysis.** AI is not a tool that leaves the analytical product unchanged. It participates in shaping what is produced. Documenting this participation — which is what dialogic reflexivity does — is not optional but epistemologically necessary.

### Ozuem et al. and Brailas: Double reflexivity and the "proving the obvious" problem

The existing methodology documents already engage with Ozuem et al.'s (2025) concept of double reflexivity and Brailas's (2025) identification of the "proving the obvious" problem. These are not repeated here but contextualized within the broader theoretical framework:

- **Double reflexivity** (Ozuem et al.) is the operational expression of what postphenomenology demands: reflexive attention to how AI mediates the analytical encounter
- **The "proving the obvious" problem** (Brailas/Dröge) identifies the specific epistemological risk of AI's statistical tendencies within constructionist analysis

What this document adds is the recognition that both concerns require **infrastructural support** — they cannot be addressed through awareness alone. The researcher who is aware of AI's biases but has no systematic way to document their corrective responses has awareness without evidence.

---

## Three Levels of Reflexivity

Dialogic RTA operates on three reflexive levels. Each requires different documentation and different analytical attention:

### Level 1: Reflexivity toward data
*What patterns do I see? What am I constructing from this data?*

This is standard RTA reflexivity. It is partially captured in codes, reflexive notes, and the review file. It applies to all qualitative research regardless of AI involvement.

### Level 2: Reflexivity toward the researcher
*How is my positioning — theoretical, professional, personal — shaping what I see?*

This is what Braun and Clarke (2019) mean by "subjectivity as a resource." It requires explicit researcher positionality and awareness of interpretive commitments. In Dialogic RTA, it includes the researcher's relationship to AI as a tool — comfort level, trust patterns, tendency to defer or resist.

### Level 3: Reflexivity toward AI mediation
*How is the AI tool shaping what gets coded, what gets missed, and what gets corrected?*

This is specific to Dialogic RTA and is the primary concern of this document. It asks not just "what did I decide?" but "what would I have decided without AI's mediation, and what does the difference tell me?"

Level 3 reflexivity has a further dimension: **meta-reflexivity** — reflexivity about the conditions under which the reflexive process itself operates. This is what occurs when the researcher recognizes that the dialogic process constituting their reflexive work exists in a medium (the chat conversation) that is not systematically preserved. Identifying the gap between methodology and infrastructure is itself a reflexive act — and one that only becomes possible through sustained engagement with dialogic practice.

---

## Methodological Status

This document describes a practice that is specific to Dialogic RTA and has no direct equivalent in traditional RTA. The closest analogues are:

- **The reflexive journal** in traditional RTA (Braun & Clarke, 2022) — but that is monologic
- **Collaborative reflexivity** in team-based research (Barry et al., 1999; Finlay, 2002) — but that assumes human co-researchers
- **Audit trails** in qualitative research quality criteria (Lincoln & Guba, 1985) — but those focus on decisions, not the dialogic process that produced them

Dialogic reflexivity extends all three: it is a reflexive journal that preserves dialogue, a collaborative practice between human and machine, and an audit trail that documents process as well as product.

---

## References

- Bakhtin, M. M. (1981). *The Dialogic Imagination: Four Essays* (M. Holquist, Ed.; C. Emerson & M. Holquist, Trans.). University of Texas Press.
- Bakhtin, M. M. (1986). *Speech Genres and Other Late Essays* (C. Emerson & M. Holquist, Eds.; V. W. McGee, Trans.). University of Texas Press.
- Barry, C. A., Britten, N., Barber, N., Bradley, C., & Stevenson, F. (1999). Using reflexivity to optimize teamwork in qualitative research. *Qualitative Health Research*, 9(1), 26–44.
- Brailas, A. (2025). Why AI has a "proving the obvious" problem, and what we can do about it. *Computer-Assisted Qualitative Data Analysis*.
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77–101.
- Braun, V., & Clarke, V. (2019). Reflecting on reflexive thematic analysis. *Qualitative Research in Sport, Exercise and Health*, 11(4), 589–597.
- Braun, V., & Clarke, V. (2022). *Thematic Analysis: A Practical Guide*. SAGE.
- Byrne, D. (2022). A worked example of Braun and Clarke's approach to reflexive thematic analysis. *Quality & Quantity*, 56, 1391–1412.
- Dröge, A. (2025). [Referenced in Brailas, 2025].
- Finlay, L. (2002). Negotiating the swamp: The opportunity and challenge of reflexivity in research practice. *Qualitative Research*, 2(2), 209–230.
- Gadamer, H.-G. (2004). *Truth and Method* (2nd rev. ed.; J. Weinsheimer & D. G. Marshall, Trans.). Continuum. (Original work published 1960)
- Ihde, D. (1990). *Technology and the Lifeworld: From Garden to Earth*. Indiana University Press.
- Lincoln, Y. S., & Guba, E. G. (1985). *Naturalistic Inquiry*. SAGE.
- Ozuem, W., Willis, M., & Grant, K. (2025). Leveraging thematic analysis with AI: opportunities and challenges. *Qualitative Research*.
- Schön, D. A. (1983). *The Reflective Practitioner: How Professionals Think in Action*. Basic Books.
- Verbeek, P.-P. (2005). *What Things Do: Philosophical Reflections on Technology, Agency, and Design*. Pennsylvania State University Press.
- Verbeek, P.-P. (2011). *Moralizing Technology: Understanding and Designing the Morality of Things*. University of Chicago Press.
