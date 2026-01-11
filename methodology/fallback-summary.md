# RTA Methodology - Condensed Summary

This is a fallback document used when full methodology files are unavailable.

## CRITICAL RULES

1. **RESEARCHER has interpretive authority** - AI proposes codes, researcher decides
2. **CODES grow from data** (inductive primary)
3. **SEGMENTS are semantic units** (1-20 lines with coherent content)
4. **CODE FORMAT**: `#code_description__lens1` (underscore, double before lens)

## Phase 2a: INITIAL CODING

1. Read chunk (60-100 lines)
2. Identify semantic segments
3. Propose codes for each segment
4. Researcher approves/modifies/rejects

## CODE FORMAT

```
#"in_vivo_expression"__lens1     # In vivo with quotes
#descriptive_code__lens2         # Descriptive code
#LATENT_interpretation__lens3    # Latent code (UPPERCASE prefix)
```

## THREE LENSES

- **Lens 1**: Students' AI usage (constructions, experiences)
- **Lens 2**: Teachers' practices and attitudes
- **Lens 3**: AI's impact on learning

## SEGMENT MARKERS

```markdown
/segment 0001-0015
#code_one__lens1
#code_two__lens2
[original transcript lines]
/slut_segment
```

## KEY PRINCIPLES

1. **Semantic boundaries** - Segments follow meaning, not arbitrary line counts
2. **Granular coding** - Precise codes over broad categories
3. **Reflexive awareness** - Document analytical decisions
4. **Methodological integrity** - Follow RTA principles

## AVOID

- Premature thematization (save for Phase 3)
- Over-coding (not every line needs codes)
- Under-coding (capture meaningful content)
- Autonomous AI decisions (researcher authority)

## WORKFLOW

```
init() -> methodology_load() -> code_start() -> code_read_next() -> code_write_segment()
                                     ^                                    |
                                     |____________________________________|
                                              (repeat until complete)
```
