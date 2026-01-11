# Phase 2: Generating Initial Codes in AI-Augmented Reflexive Thematic Analysis

## Overview
Phase 2 focuses on systematic generation of codes—the fundamental building blocks of themes. In AI-augmented RTA, the researcher maintains primary responsibility for code generation while using AI to scaffold the coding process. This phase is highly iterative and involves multiple passes through the data.

## Core Principle (Byrne 2022)
**"Codes are the fundamental building blocks of what will later become themes. The process of coding is undertaken to produce succinct, shorthand descriptive or interpretive labels for pieces of information that may be of relevance to the research question(s)."**

---

## CRITICAL: What Phase 2 Is and Is NOT

### This Phase IS:
- ✅ **Systematic human coding** of entire dataset
- ✅ **Iterative refinement** across multiple passes
- ✅ **Both semantic and latent** coding
- ✅ **Data-driven but research-question aware**
- ✅ **ONLY coding - NO thematization yet**

### This Phase is NOT:
- ❌ Moving to theme development
- ❌ Outsourcing coding to AI
- ❌ Accepting AI codes uncritically
- ❌ One-pass-and-done coding

---

## Part A: Human Coding (Primary Work)

### The Successful Simple Approach (Based on Proven Practice)

**Method: Direct Hashtag Coding in Markdown**

This approach has proven successful because it is:
- Simple and trackable
- Maintains original language
- Allows for immediate iteration
- Creates visible progression

#### Basic Coding Template:

```markdown
**[SPEAKER]:** [Exact quote from transcript]
#code1 #code2 #"in_vivo_code" #latent_interpretation (analytical comment)

**[SPEAKER]:** [Next quote]
#code3 #code1 (same code reappearing) #new_code
```

#### Example from Actual Coding:

```markdown
**[SPEAKER_03]:** Jag måste komplettera det här arbetet... jag får en känsla 
av att det här inte är deras arbete... Det är inte bara en "skrivbordsprodukt" 
som någon annan har författat, eller AI, utan att de förstår innehållet.
#misstanke_om_äkthet #muntlig_verifiering #"skrivbordsprodukt" 
#förståelse_som_kunskap #osäkerhet

**[SPEAKER_05]:** Fattar de ingenting, då kan de ju inte det.
#binär_bedömning (antingen kan de eller inte)
```

### Coding Conventions to Maintain:

1. **Use underscores for multi-word codes**: `#academic_writing` not `#academic writing`

2. **In vivo codes in quotation marks**: `#"skrivbordsprodukt"` 
   - Use participant's exact language
   - Preserves meaningful expressions

3. **Analytical comments in parentheses**: `(antingen kan de eller inte)`
   - Your interpretive observations
   - Questions that arise
   - Connections you notice

4. **Code in original language**: Keep Swedish codes in Swedish
   - Preserves meaning nuances
   - Maintains cultural context
   - Translation can come later if needed

5. **Multiple codes per passage allowed**: Some passages warrant several codes

6. **Codes should stand alone**: Must be understandable without seeing data

### Good vs. Poor Code Examples (Byrne 2022):

**POOR CODE:** `#not_relatable`
- Too vague
- Needs context to understand
- Who/what is not relatable?

**GOOD CODE:** `#wellbeing_guidelines_not_relatable_for_students`
- Self-explanatory
- Specific and contextual
- Can stand alone

**POOR CODE:** `#positivity`
- Whose positivity?
- About what?

**GOOD CODE:** `#educator_positivity_about_wellbeing_curriculum`
- Clear subject
- Clear object
- Interpretable without data

---

## Systematic Coding Process

### Step 1: Initial Coding Pass (First Iteration)

**Work systematically through entire dataset:**

```markdown
## Coding Session: [Date] - Iteration 1

Data Item: [Transcript ID/Name]
Duration: [Time spent]

Process:
- [ ] Read passage
- [ ] Identify interesting/relevant aspects
- [ ] Generate code(s)
- [ ] Move to next passage
- [ ] Repeat for ENTIRE transcript

Reflexive Notes:
- Patterns emerging:
- Questions arising:
- Coding decisions made:
```

**Important (Byrne 2022):**
> "It is recommended that the researcher work systematically through the entire dataset, 
> attending to each data item with equal consideration."

### Step 2: Code Tracking & Organization

**Create a Code Evolution Tracker:**

#### Option A: Simple List (in markdown)

```markdown
# Code List - Iteration 1

## Codes Generated:
1. #misstanke_om_äkthet (Transcript A, B)
2. #muntlig_verifiering (Transcript A, C)
3. #"skrivbordsprodukt" - in vivo (Transcript A)
4. #förståelse_som_kunskap (Transcript A, D)
5. #osäkerhet (Transcript A, B, C)
...

## Preliminary Observations:
- Code #osäkerhet appears very frequently
- Codes related to verification methods clustering
- Need to watch for: assessment practices
```

#### Option B: Spreadsheet (more structured)

| Code | Type | Appears In | Description | Iteration Added |
|------|------|------------|-------------|-----------------|
| #misstanke_om_äkthet | Latent | A, B | Teacher suspicion about authenticity | 1 |
| #muntlig_verifiering | Semantic | A, C | Using oral verification methods | 1 |
| #"skrivbordsprodukt" | In vivo | A | Exact participant term for inauthentic work | 1 |

### Step 3: Second Coding Pass (Iteration 2)

**Purpose: Refine, consolidate, identify gaps**

```markdown
## Coding Session: [Date] - Iteration 2

Focus for this pass:
- [ ] Review all codes from Iteration 1
- [ ] Look for code overlap/redundancy
- [ ] Identify codes needing refinement
- [ ] Check for missed aspects
- [ ] Ensure equal attention to all data

Changes Made:
| Original Code | Changed To | Reason |
|---------------|------------|---------|
| #positivity | #teacher_positivity_AI_tools | Too vague |
| #verification | #muntlig_verifiering | Consolidate with existing |
```

### Step 4: Third Pass (Iteration 3+)

**Purpose: Finalize codes, ensure saturation**

Continue iterations until:
- ✓ Codes are clear and self-explanatory
- ✓ Redundant codes consolidated
- ✓ All relevant data coded
- ✓ No major gaps identified
- ✓ Confident in code stability

---

## Part B: AI-Scaffolded Coding (Supporting Human Work)

### When and How AI Can Help

**IMPORTANT:** AI does not do primary coding. Rather, AI can:
1. Help identify potential coding gaps
2. Suggest alternative code formulations
3. Check for consistency
4. Facilitate comparison across data items

### Scaffolding Method 1: Gap Identification

**After completing human coding of a transcript:**

```markdown
PROMPT:
I have coded the following transcript excerpt from my focus group data. 
Here is the coded section:

[Paste your coded section]

Based on the research questions I shared earlier [about teachers' AI usage], 
are there aspects of this passage I might have overlooked? 

Do NOT provide codes - just identify what aspects might be under-coded.
```

**Human Response to AI Output:**
```markdown
AI suggested I consider:
- [Aspect AI identified]

My reflection:
- Is this relevant to my RQs? [Yes/No - Why]
- Did I actually overlook this? [Yes/No]
- If yes, what code captures this? [My code, not AI's]

Decision:
- [ ] Add new code: [code]
- [ ] Keep existing coding
- [ ] Reason: [explanation]
```

### Scaffolding Method 2: Code Clarity Check

```markdown
PROMPT:
I have generated the following codes from my data:

#code1
#code2  
#code3

Without seeing my data, can you understand what each code likely refers to? 
Tell me which codes need more specificity to stand alone.
```

**Human Response:**
```markdown
Codes needing refinement (per AI):
- #code2 - AI couldn't determine context

My action:
- Refined to: #more_specific_code2
- Rationale: [why this is clearer]
```

### Scaffolding Method 3: Consistency Check

```markdown
PROMPT:
I am coding across multiple transcripts. Here are codes I've used for 
similar concepts:

Transcript A: #teacher_verification_oral
Transcript B: #muntlig_verifiering  
Transcript C: #oral_checking

These seem to describe similar phenomena. Should I consolidate these? 
If so, which formulation best captures the concept?
```

**Human Response:**
```markdown
AI recommendation: [summary]

My decision:
- Consolidate to: #muntlig_verifiering
- Rationale: 
  - Maintains original language
  - Most frequently used
  - Clearest meaning
  
Changes to make:
- Find/replace in Transcripts A, C
- Update code tracker
```

### Scaffolding Method 4: Semantic vs. Latent Coding

```markdown
PROMPT:
I have coded this passage semantically as: #teachers_express_concern

The passage is: "[exact quote]"

Given my constructionist epistemology, what latent meanings might be 
present here? DO NOT provide codes - just identify potential latent aspects.
```

**Human Response:**
```markdown
AI identified potential latent aspects:
- [Aspect 1]
- [Aspect 2]

My latent code(s):
- #underlying_professional_anxiety (my interpretation)
- Reason: Captures implicit meaning about [explanation]

Double-coding decision:
- Keep semantic code: #teachers_express_concern
- Add latent code: #underlying_professional_anxiety
- Rationale: Both levels meaningful to analysis
```

---

## Part C: Integrative Documentation

### After Each Coding Session

**Complete this reflexive log:**

```markdown
## Coding Session Log: [Date]

### Human Coding Work
Data Items Coded: [List]
Iteration: [1st, 2nd, 3rd pass]
Duration: [Time]
New Codes Generated: [X]
Codes Revised: [X]

### Coding Decisions Made:
1. [Decision about specific code]
   - Reason: [Explanation]
2. [Decision about consolidation]
   - Reason: [Explanation]

### AI Scaffolding Used:
Scaffolding Type: [Gap check / Clarity check / Consistency]
Prompt Used: [Summary or exact]

AI Output Summary:
- [Key points]

My Response to AI:
- Accepted: [What and why]
- Rejected: [What and why]
- Modified: [What and why]

Impact on Coding:
- Did AI identify genuine oversight? [Yes/No]
- Did it help refine codes? [How]
- Did it prompt useful reflection? [How]

### Reflexivity
Interpretive Authority Maintained:
- [Example of me deciding against AI suggestion]
- [Example of me modifying AI suggestion]

Biases/Assumptions Noticed:
- [What I'm noticing about my coding patterns]

Questions for Next Iteration:
- [ ] [Question to explore]
- [ ] [Pattern to investigate]

### Code Evolution This Session:
| Code | Status | Notes |
|------|--------|-------|
| #code1 | New | Added iteration 2 |
| #code2 | Refined | Was #old_code2, now clearer |
| #code3 | Consolidated | Merged with #code4 |
| #code5 | Removed | Not relevant to RQs |
```

---

## Quality Indicators for Phase 2

### Strong Coding Process:
- ✅ Every data item systematically coded
- ✅ Multiple iterations completed
- ✅ Codes are clear and self-explanatory
- ✅ Both semantic and latent codes present (where appropriate)
- ✅ Code evolution tracked and documented
- ✅ Equal attention given to entire dataset
- ✅ Human interpretive authority maintained throughout
- ✅ AI scaffolding critically evaluated
- ✅ Reflexive logs complete

### Weak Coding Process:
- ❌ Only one pass through data
- ❌ Codes too vague to understand alone
- ❌ No tracking of code changes
- ❌ Accepting AI suggestions uncritically
- ❌ Skipping parts of dataset
- ❌ Moving to themes before coding complete
- ❌ No reflexive documentation

---

## Common Issues and Solutions

### Issue 1: "I have too many codes!"

**Solution:**
This is normal and expected in Phase 2. DO NOT consolidate into themes yet.

Byrne (2022):
> "Through repeated iterations of coding and further familiarisation, 
> the researcher can identify which codes are conducive to interpreting 
> themes and which can be discarded."

You will consolidate in Phase 3. For now, generate freely.

### Issue 2: "Some codes appear only once"

**Solution:**
Byrne (2022):
> "It is, however, necessary to ensure that codes pertain to more than one 
> data item."

- During Iteration 2/3, check if one-time codes can:
  a) Be merged with similar codes
  b) Actually represent something important despite low frequency
  c) Be removed as not relevant to RQs

### Issue 3: "My codes keep changing"

**Solution:**
This is completely normal and expected!

Byrne (2022):
> "RTA is a recursive process and it is rare that a researcher would follow 
> a linear path through the six phases."

- Document changes in your tracker
- Note reasons for changes
- This evolution is part of the reflexive process

### Issue 4: "I'm coding everything!"

**Solution:**
Check your codes against research questions:

```markdown
Code: #interesting_observation
Ask: Is this relevant to my RQs? [Yes/No]
If No: Remove or note as potentially interesting but off-topic
If Yes: Keep and refine
```

---

## Transition to Phase 3

### Before Moving to Theme Generation:

**Checklist:**

**Human Coding:**
- [ ] Entire dataset coded systematically
- [ ] Multiple iterations completed (minimum 2, ideally 3+)
- [ ] All codes clear and self-explanatory
- [ ] Code list finalized and documented
- [ ] Both semantic and latent codes present (where appropriate)
- [ ] Redundant codes consolidated
- [ ] One-time codes addressed
- [ ] All codes relevant to RQs

**AI Integration:**
- [ ] AI scaffolding used reflexively
- [ ] All AI contributions critically evaluated
- [ ] Decisions about AI input documented
- [ ] Interpretive authority maintained throughout

**Documentation:**
- [ ] Code evolution tracked across iterations
- [ ] Reflexive logs complete for each session
- [ ] Code descriptions/rationales documented
- [ ] Ready to begin examining patterns ACROSS codes

**Final Code Audit:**

```markdown
## Phase 2 Completion Audit

Total unique codes generated: [X]
Number of iterations: [X]
Total coding time: [X hours]

Code distribution:
- Semantic codes: [X]
- Latent codes: [X]  
- In vivo codes: [X]

Most frequent codes (Top 10):
1. #code1 (appears in X transcripts)
2. #code2 (appears in X transcripts)
...

Codes appearing only once: [X]
- Action taken: [consolidated/removed/kept because...]

AI scaffolding sessions: [X]
- Types used: [gap/clarity/consistency checks]
- Impact: [brief summary]

Reflexive summary:
- Key patterns noticed:
- Interpretive decisions made:
- Biases addressed:

Ready for Phase 3? [Yes/No]
If No, what needs work: [List]
```

---

## Practical Templates

### Template 1: Coding Session Setup

```markdown
# Coding Session: [Date/Time]

## Pre-Session Setup
Data item: [Transcript name/ID]
Iteration: [1st / 2nd / 3rd pass]
Research questions reminder:
1. [RQ1]
2. [RQ2]

## Coding Workspace
[Your transcript with codes added below each passage]

## Post-Session Documentation
New codes: [List]
Revised codes: [List]
Observations: [Notes]
Questions for next session: [List]
```

### Template 2: Code Refinement Tracker

```markdown
# Code Refinement Log

| Original Code | Issue | Refined Version | Iteration | Reason |
|---------------|-------|-----------------|-----------|---------|
| #positivity | Too vague | #teacher_optimism_AI_potential | 2 | More specific |
| #verification | Generic | #muntlig_verifiering | 2 | Maintain original language |
```

### Template 3: AI Scaffolding Session

```markdown
# AI Scaffolding Session: [Date]

## Purpose
[Gap check / Clarity check / Consistency check]

## Human Work Completed First
- Coded: [Data items]
- Iteration: [X]
- Codes generated: [X]

## Prompt to AI
```
[Exact prompt text]
```

## AI Response
[Summary of key points]

## Human Evaluation
Useful: [What was helpful]
Not useful: [What wasn't helpful]
Actions taken: [What I did with AI input]

## Reflexive Note
How did this affect my coding: [Reflection]
Interpretive authority maintained: [How]
```

---

## Notes from Literature

**Byrne (2022) on Systematic Coding:**
> "It is recommended that the researcher work systematically through the 
> entire dataset, attending to each data item with equal consideration, 
> and identifying aspects of data items that are interesting and may be 
> informative in developing themes."

**Byrne (2022) on Code Evolution:**
> "I would recommend that the researcher document their progression through 
> iterations of coding to track the evolution of codes and indeed prospective 
> themes."

**Braun & Clarke (2006) on Coding Process:**
> "Phase 2 begins when you have read and familiarized yourself with the data, 
> and have generated an initial list of ideas about what is in the data and 
> what is interesting about them."

**Byrne (2022) on Double Coding:**
> "The same data item can be coded both semantically and latently if deemed 
> necessary... Both codes were revised later in the analysis. However, this 
> example illustrates the way in which any data item can be coded in multiple 
> ways and for multiple meanings."

---

## Your Successful Approach: Key Takeaways

What worked in your first test:

1. ✅ **Simple hashtag method** - Visible, trackable, flexible
2. ✅ **Original language** - Preserves meaning and context  
3. ✅ **In vivo codes marked** - Honors participant voice
4. ✅ **Analytical comments** - Captures interpretive thoughts
5. ✅ **Systematic work** - Through entire transcript
6. ✅ **No premature theming** - ONLY codes at this stage

**Continue this approach!** It aligns perfectly with Byrne's principles and RTA methodology.

**Add AI scaffolding** strategically to enhance (not replace) this human coding work.

---

## Phase 2 Summary

**Remember:**
- Coding is ITERATIVE - expect multiple passes
- Codes will EVOLVE - document changes
- Keep it SIMPLE - your hashtag method works
- Stay SYSTEMATIC - equal attention to all data  
- Maintain AUTHORITY - you interpret, AI scaffolds
- Be REFLEXIVE - document your decisions

**Phase 2 delivers:**
- A comprehensive set of codes
- Documentation of code evolution
- Reflexive awareness of coding decisions
- Foundation for theme generation in Phase 3

**You're ready for Phase 3 when:**
- All data systematically coded
- Multiple iterations complete
- Codes clear and documented
- Confident to begin finding patterns ACROSS codes
