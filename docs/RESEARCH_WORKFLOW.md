# Research Workflow

How to conduct qualitative analysis using this tool — from preparation through coding to review.

This document describes the researcher's analytical journey. For tool commands and parameters, see the [API Reference](API.md). For installation, see [Getting Started](GETTING_STARTED.md).

A note on what drives this process: the tool's core contribution is not its file operations but the methodology suite that structures how researcher and AI engage with qualitative data. The methodology loads at the start of each session and shapes every analytical decision that follows. What follows here is an orientation to the overall process; the methodology documents themselves provide the detailed analytical guidance.

---

## Before you begin

Three things need to be in place before you open Claude Desktop.

### Know your data

Phase 1 of Braun & Clarke's RTA — familiarization — happens before any tool-assisted coding. Read your transcripts independently. Listen to the recordings if you have them. Make notes about what strikes you, what surprises you, what you find yourself returning to. The tool's methodology documents include guidance for this phase, but the work is yours: building an intimate, unmediated relationship with the data before AI enters the picture.

This matters more than it might seem. When AI later proposes codes, your independent familiarity with the data is what enables you to distinguish a genuinely insightful proposal from a plausible-sounding but shallow one.

### Prepare your transcripts

The tool works with markdown files (`.md`). Each transcript should be a single file containing the full text — speaker labels, timestamps if available, and the spoken content. The tool will add permanent line indices (0001, 0002, ...) that serve as fixed reference points throughout coding and review.

If your transcripts are in another format (Word, PDF, plain text), convert them to markdown first. The content matters more than formatting — the tool needs readable text with consistent speaker identification.

### Write a coding protocol

A coding protocol defines the conventions specific to your project: your research questions, how codes are formatted, what labels map to which research question, and any language or domain-specific rules. The tool ships with example protocols from an educational research project (in `protocols/`); study these to understand the format, then write your own.

A coding protocol typically includes:

- Your research questions and how they map to code suffixes (e.g., `__rq1_semantic`, `__rq2_latent`)
- Code formatting rules — how to name codes, how to mark in vivo quotations, how to distinguish semantic from latent codes
- Project-specific decisions — how to handle moderator speech in focus groups, what counts as codeable content, which speakers are participants versus facilitators
- Language conventions — if your data is in a language other than English, specify whether codes should be in the data language, the reporting language, or both

The protocol becomes part of what Claude reads at the start of each session. Clear conventions here save repeated corrections later.

---

## Starting a project

Open Claude Desktop and begin with: *"Call the init tool."* This gives Claude the critical instructions for working with the RTA tools. You do this at the start of every session — Claude Desktop does not carry memory between conversations.

Then ask Claude to set up a project. You provide a project name, the location for your project folder, and the paths to your transcript files. The tool creates a project structure with a copy of the methodology suite and a configuration file that tracks which transcripts are in the project and their coding status.

### Engaging with the methodology

Before any coding begins, Claude loads the methodology for the current phase. This is the most important part of starting a session — more important than the technical setup, more important than getting to the data quickly.

For Phase 2a, you will read the methodological framework and the initial coding guide together with Claude. These documents are substantial. They establish three foundational principles that govern AI-augmented analysis: the "proving the obvious" problem (AI reproduces expected patterns rather than surfacing what is analytically interesting), double reflexivity (monitoring both your own and AI's influence on interpretation), and AI as heuristic partner (treating proposals as starting points for interpretive engagement, not conclusions).

The methodology also addresses your specific epistemological position — what it means to code constructionistically with AI, how to maintain an experiential orientation when AI lacks access to experiential meaning, where AI is competent at semantic coding and where it fails at latent coding.

Do not skip this. Do not skim it. The methodology is not a preamble to the real work — it *is* the analytical framework that makes the subsequent coding rigorous rather than superficial. When Claude later proposes a code, your capacity to evaluate that proposal depends on having internalised these principles. When you write a reflexive note during review, the depth of that note reflects how seriously you engaged with the methodology's concept of double reflexivity.

In subsequent sessions on the same transcript, Claude loads the methodology again. This is not redundant — each re-reading deepens your engagement, and the fresh start prevents the methodological framework from fading into background noise over time.

---

## Coding your data

### How a session unfolds

After the methodology has been read and acknowledged, the coding begins. Claude presents a chunk of transcript text — typically around 80 lines. You read it together. Claude proposes codes for the meaningful segments it identifies within that chunk, drawing on the methodology you have just reviewed and your coding protocol.

Your role at this point is evaluative and interpretive. For each proposed code, consider:

- Does this code capture the meaning that matters here, or does it name a surface feature?
- Is the code at the right level — semantic (what was explicitly said) or latent (what is implied, assumed, or left unsaid)?
- Does the code reflect what this participant is expressing in this context, or could it apply to almost any data on this topic?
- What would AI be expected to propose here — and does the data actually say something different or more specific?

You accept codes that work, modify codes that are close but imprecise, reject codes that miss the point, and add codes that Claude did not see. When you are satisfied, Claude writes the codes to your transcript file and presents the next chunk. Progress is tracked automatically and persists across sessions.

### Chunks and segments

The distinction between these two concepts is important. A **chunk** is a technical reading unit — the tool loads approximately 80 lines at a time to stay within processing limits. A **segment** is a semantic coding unit — a stretch of text that carries a coherent meaning worth coding. Segments can be short (a single strong utterance) or long (an extended argument), and a single chunk may contain several segments.

The tool manages chunks. You and Claude identify segments based on meaning. Do not let the chunk boundaries dictate where segments begin and end — meaning does not respect line counts.

### What good coding feels like

Coding with AI has a different rhythm than coding alone. Some segments will flow quickly — the codes are obvious and you both agree. Others will require genuine deliberation: you disagree with Claude's proposal, or you sense something in the data that resists easy labelling, or a participant contradicts themselves in a way that demands careful interpretive attention.

The productive moments are often the difficult ones. When you find yourself pausing over a segment, uncertain how to code it, that uncertainty is analytically valuable. Document it in your reflexive notes. Do not let the pace of AI-assisted coding pressure you into quick decisions on segments that deserve slow thinking.

The number of codes per segment varies with the content. A rich, complex exchange might generate eight or more codes. A simple factual statement might need one. Do not impose a formula — let the data determine the coding density.

### Between sessions

When you close Claude Desktop, your progress is saved in the transcript file itself as STATUS metadata. The next time you open Claude Desktop and call `init`, you can resume where you left off. Claude reads the STATUS and picks up at the next uncoded chunk.

However, Claude does not remember the previous conversation. Each session is fresh — including the methodology, which loads again from the beginning. This is actually useful. It prevents accumulated interpretive drift within a single long session, it means you encounter the data with renewed distance, and the repeated engagement with the methodology deepens your analytical framework rather than letting it fade.

---

## Reviewing your coding

### Why review matters

Phase 2b — critical review — exists because AI-assisted coding creates a specific methodological risk. During Phase 2a, the researcher evaluates AI proposals in the flow of coding, which can create a bias toward acceptance: proposals that sound reasonable get approved without the deeper engagement that generates genuine analytical insight.

Review is where you step back and look at each coded segment with critical distance. You are no longer in the flow of production. You are asking: does this coding actually capture what is happening in this data?

The Phase 2b methodology is distinct from Phase 2a's. It introduces specific analytical concepts — the "proving the obvious" heuristic as a review tool, double reflexivity directed at your own coding history, attention to where AI's proposals shaped what you subsequently saw in the data. Claude loads this methodology at the start of the review session. As with Phase 2a, reading it is not a formality — it provides the critical lens through which you examine the coding.

### How review works

Claude presents each coded segment one at a time — the transcript text and its assigned codes. For each segment, you do three things.

First, evaluate the codes. Are they accurate? Are they sufficient — do they capture the full meaning of this segment, or did something get missed? Are any codes too generic? Is the semantic/latent distinction meaningful here, or is a latent code actually just restating the semantic code in different words?

Second, write a reflexive note. This is not a summary of the segment or a mechanical annotation. It is a record of your analytical thinking at this moment: what strikes you about this data, what you are uncertain about, what connections you see forming across segments, what surprises you. Reflexive notes vary in length and focus. Sometimes a sentence is enough. Sometimes a complex segment warrants a paragraph. The methodology documents provide detailed guidance on reflexive note-writing.

Third, revise codes where needed. You can add codes you now see, remove codes that do not hold up under scrutiny, or replace the entire code set for a segment. You can also restructure segments — splitting one segment into two when it contains distinct meaning units, or merging adjacent segments that belong together. Every revision is logged, creating an audit trail of your analytical development.

### The difference between coding and reviewing

In Phase 2a, you and Claude work together on fresh data. In Phase 2b, you examine work that has already been done — some of it by AI, some of it by you under AI's influence. The critical question shifts from "what codes does this segment need?" to "does this coding reflect genuine analytical engagement with the data, or does it reflect the path of least resistance?"

This is where the "proving the obvious" principle becomes most operational. AI tends to produce codes that are correct but unsurprising — codes that any competent coder would generate. Review is where you push beyond the obvious: what is this data actually doing that the initial codes do not capture?

---

## After coding and review

When all transcripts are coded and reviewed, you have:

- **Coded transcript files** — your data with structured segments, codes, and permanent line references, all in plain markdown
- **Review notes** — a file for each transcript containing your reflexive notes per segment, documenting your analytical reasoning and code revisions
- **An audit trail** — the combination of codes, notes, and logged revisions constitutes a transparent record of your interpretive process

These files form the foundation for Phase 3 (generating themes), where you move from individual codes to broader patterns of shared meaning across your dataset. Phase 3 tooling is planned but not yet available. In the meantime, the coded files and review notes are plain text — they work with any tool or approach you prefer for thematic development.

---

## Practical matters

### Session management

Start every Claude Desktop session by calling `init`. This is not optional — the tool enforces it. Claude needs the methodological context to work effectively, and each session is a fresh start.

Work with one transcript per session. Coding requires sustained attention to a single data source; switching between transcripts within a session risks fragmenting your analytical engagement.

Check your progress before closing a session. Ask Claude to show the coding or review status so you know exactly where to resume.

### Working with multiple transcripts

Code each transcript fully (Phase 2a) before starting the next. This allows patterns to develop within each data source before cross-transcript comparison begins. When you return to earlier transcripts after coding later ones — which RTA's recursive nature encourages — you bring a richer interpretive framework that may reveal aspects you initially missed.

### Version control

If you use Git or another version control system, commit after each coding session. The tool creates backups before destructive operations (clearing all codes, for instance), but systematic version control gives you the freedom to experiment with coding approaches knowing you can always return to a previous state.

### When things go wrong

The tool includes recovery mechanisms. If progress tracking falls out of sync with the actual file content — which can happen after manual edits or interrupted sessions — you can ask Claude to verify and fix the STATUS. If a segment was coded incorrectly, you can delete it specifically. In extreme cases, you can clear all coding from a file and start fresh; the tool creates a backup before doing so.

These situations are normal in iterative qualitative work, not signs of failure. The tool is designed to support the kind of revisiting and revision that rigorous RTA demands.
