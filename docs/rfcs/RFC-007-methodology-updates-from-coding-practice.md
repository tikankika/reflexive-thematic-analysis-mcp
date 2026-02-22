# RFC-007: Methodology Document Updates from Coding Practice

**Status:** Draft  
**Created:** 2026-02-18  
**Author:** Niklas Karlsson  

---

## Summary

Update the methodology source documents (`/methodology/`) to reflect decisions made during actual Phase 2a coding work (January 2026). Currently, critical lessons learned exist only in chat history and are lost between sessions, causing Claude to repeat the same mistakes at session start.

## Motivation

### The Problem

During coding of `Ai_fokusgrupp_ne_traff_1_rec_1.md` (55 segments, ~390 codes) and partial coding of `traff_1_rec_2.md`, multiple significant methodology decisions were made through dialogue between researcher and Claude. These decisions improved coding quality substantially. However:

1. **None were written back into the source documents** — file sizes and timestamps confirm no changes since January 11-14.
2. **Each new session starts from the unchanged documents** — Claude reads them via `methodology_load` and proceeds to make the same errors.
3. **The researcher must re-correct the same patterns** every session, wasting time and cognitive effort.

### What Went Wrong Without These Updates

When Claude followed the current documents literally, it produced:

- **Mechanical coding patterns**: Always exactly 2 codes per level (semantic + latent), regardless of content richness
- **Rigid segmentation**: Treating the tool's technical chunk size (60-80 lines) as the semantic unit, rather than identifying meaning-driven segments of variable size
- **Formulaic reflexive notes**: "Detta LIKNAR disruption av X" pattern repeated identically, rather than genuine reflexive engagement ("Vad slår mig? Vad är jag osäker på?")
- **Broken Obsidian tags**: In vivo codes with quotation marks (`#"uttryck"__rq1_semantisk`) that rendered incorrectly

### Evidence from Chat History

Key corrections documented in chat `846933c8` ("QA-rta MCP implementation 260119"):

**Researcher (on rigid coding):** "två koder per segment - det måste vara mer flexibelt!! varje chunk måste behandlas separat - antal koder, hur lång chunk... varierar"

**Researcher (on whether to be flexible):**
- Antal koder dikteras av innehåll? "JAAA"
- Latent bara vid genuint djupare mening? "JAAA"  
- Segmentstorlek baserad på meningsinnehåll? "JAAAA"

**Researcher (on reflexive notes):** Corrected from formulaic "Detta LIKNAR disruption av..." to genuine reflection: "Vad SLÅR mig här? Vad är svårt? Vad är jag osäker på?"

---

## Proposed Changes

### Part A: Source Document Updates (`/methodology/`)

These changes apply to all future projects and sessions.

#### A1. `KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md`

**Section: Kodformat / Code Format**

Add after existing format examples:

```markdown
### Flexibilitet i kodning

Antal koder per segment dikteras av INNEHÅLLET, inte av en mall:
- Ett segment kan ha 1 kod om det fångar en enda tydlig idé
- Ett segment kan ha 8+ koder om innehållet är rikt och mångfacetterat
- Koda VARJE distinkt idé/observation — konsolidera i senare iteration

Semantisk och latent nivå:
- Koda ALLTID semantisk nivå
- Koda latent nivå ENDAST när det finns genuint djupare mening att fånga
- Tvinga inte fram latent kodning om semantisk nivå är tillräcklig
- Fråga: "Finns det något outtalat, underförstått eller teoretiskt här som 
  den semantiska koden INTE fångar?" Om nej → ingen latent kod behövs.

In vivo-koder:
- Skriv UTAN citattecken i hashtag-formatet (citattecken bryter Obsidian-taggar)
- Notera att koden är in vivo i den reflexiva noten
- Exempel: #alla_exempel_direktanvändning__rq1_semantisk 
  (reflexiv not: "in vivo — lärarens egen formulering 'alla exempel'")
- INTE: #"alla_exempel"__rq1_semantisk ← BRYTER OBSIDIAN
```

**Section: Reflexiva noter**

Replace or significantly expand existing guidance:

```markdown
### Reflexiva noter — genuint reflexivt tänkande

Reflexiva noter är INTE:
- En formel ("Detta LIKNAR disruption av X")
- Teoretisk kategorisering
- Samma struktur varje gång

Reflexiva noter ÄR dokumentation av forskarens tolkningsprocess. 
Variera form och fokus baserat på vad segmentet väcker.

Frågor att ställa sig:
- Vad SLÅR mig i detta segment?
- Vad är jag osäker på?
- Vilka antaganden gör jag?
- Vad överraskar mig?
- Vad var svårt att koda och varför?
- Ser jag preliminära mönster som BÖRJAR framträda?
- Hur kopplar detta till tidigare segment?

Längd: Varierar. Ibland en mening ("Stark formulering — måste återkomma 
till detta"). Ibland ett helt stycke vid komplexa segment.

UNDVIK: Att rutinmässigt avsluta varje not med en disruption-koppling. 
Teoretisk koppling ska uppstå organiskt, inte tvingas fram.
```

#### A2. `phase2a_initial_coding.md`

**Section: Chunk vs Segment**

Add explicit clarification:

```markdown
### Chunk vs Segment — viktig distinktion

CHUNK = teknisk läsenhet (60-100 rader). Bestäms av verktyget. 
Används för att portionera transkriptet i hanterbara bitar.

SEGMENT = semantisk kodningsenhet (variabel storlek). Bestäms av 
INNEHÅLLET. En meningsbärande enhet som kan vara:
- En enda rad (en stark, koncentrerad utsaga)
- 3-5 rader (ett uttalande med kontext)
- 20+ rader (en längre sammanhängande argumentation)

En chunk kan innehålla FLERA segment, eller ibland bara ETT om 
hela chunken utgör en sammanhängande argumentation.

Principen: Segmentera efter MENING, inte efter radantal.
```

**Section: AI-assistant behavior**

Add new section or append to existing instructions:

```markdown
### Instruktioner för AI-assistenten vid kodning

UNDVIK mekaniska mönster:
- Samma antal koder per segment
- Alltid både semantisk OCH latent nivå
- Identisk struktur i reflexiva noter
- Tvinga inte data in i förutbestämda kategorier

VARIERA baserat på innehåll:
- Rikt segment → generös kodning med många koder
- Enkelt segment → 1-2 koder räcker
- Genuint latent mening → koda latent
- Inget latent → hoppa över
- Reflexiva noter varierar i längd och fokus

FRÅGA VID OSÄKERHET:
- Vem talar? (SPEAKER-nummer kan vara opålitliga)
- Moderator eller deltagare?
- Vilket RQ:s perspektiv fångar detta bäst?
- Ska segment delas upp eller hållas ihop?
```

### Part B: Project-Specific Decisions File

Create a new file for project-specific context that Claude reads at session start.

**Location:** Project root, e.g., `/AI_Teachers_Focus_Group_qarta_test3/coding_decisions.md`

**Content:**

```markdown
# Kodningsbeslut — AI_Teachers_Focus_Group_qarta_test3

## Projektkontext
- Forskare: [Researcher]
- Data: 5 transkript från fokusgrupper (2 träffar)
- Moderatorer: [Moderator 1] och [Moderator 2]

## Dataspecifika beslut

### SPEAKER-nummer
SPEAKER-nummer i dessa transkript är INTE pålitliga — samma person 
kan ha olika nummer i olika segment. Bedöm talare utifrån INNEHÅLL 
och kontext, inte SPEAKER-ID.

### Moderator-hantering
- [Moderator 1] och [Moderator 2] var moderatorer
- Meta-organisatoriskt innehåll (tidsramar, logistik) → SKIPPA
- Moderator-frågor/inramningar med substantivt innehåll → KODA med 
  prefix `moderator_` i kodnamnet
- T.ex. `#moderator_förmår_använda__rq1_semantisk`

### In vivo-kodformat
Inga citattecken i hashtaggar. Notera in vivo-status i reflexiv not.
Se KODNINGSMANUAL för format.

## Kodningsstatus
- traff_1_rec_1.md: KLAR (100%, 11/11 segment)
- traff_1_rec_2.md: PÅBÖRJAD (22%, 2/9 segment, stannade rad 158)
- traff_1_rec_3.md: Ej påbörjad
- traff_2_rec_1.md: Ej påbörjad
- traff_2_rec_2.md: Ej påbörjad

## Framväxande mönster (preliminära)
- "Instrumentell användning" — elever vill ha snabba svar
- Stark variation i elevers kritiska medvetenhet
- Lärare osäkra om egen AI-kompetens
- Kvalitetsgap mellan gratis och betalda AI-verktyg
- Formativ bedömning konstrueras som omöjliggjord
- Paradox: lära elever använda opålitligt verktyg
```

### Part C: Methodology-load Workflow Update

Consider whether `methodology_load` should also check for a `coding_decisions.md` in the project directory and present it alongside the methodology documents. This would be a code change in the MCP tool itself.

**Proposed behavior:**
1. Load phase methodology as now (doc index 0, 1, ...)
2. After all methodology docs loaded, check for `coding_decisions.md` in project root
3. If found, present it to Claude as project-specific context

This ensures project decisions are always loaded without requiring the researcher to manually reference them.

---

## Implementation Steps

### Priority 1: Source Document Updates (immediate)
1. [x] Update `KODNINGSMANUAL...md` in `/methodology/` — add flexibility, in vivo format, reflexive notes sections
2. [x] Update `phase2a_initial_coding.md` in `/methodology/` — add chunk/segment distinction, AI behavior instructions
3. [ ] Verify changes render correctly via `methodology_load`

### Priority 2: Project Decisions Template (immediate)
4. [x] Create `templates/coding_decisions_template.md` as generic template
5. [ ] Update `project_setup` tool to copy template into new projects
6. [ ] Populate `test3/coding_decisions.md` with project-specific decisions

### Priority 3: Tool Enhancement (future)
7. [ ] Consider updating `methodology_load` to auto-detect and present `coding_decisions.md`
8. [ ] Consider having `coding_decisions.md` loaded automatically at session start

---

## Files Affected

| File | Location | Change |
|------|----------|--------|
| `KODNINGSMANUAL_AI_Augmented_RTA_DISRUPTIV_INTEGRATED_2026-01-10.md` | `/methodology/` | Add flexibility, in vivo, reflexive notes guidance |
| `phase2a_initial_coding.md` | `/methodology/` | Add chunk/segment distinction, AI instructions |
| `coding_decisions.md` | Project root (new) | Project-specific decisions template |
| Possibly `src/` tool code | `/src/` | Auto-load coding_decisions.md |

## Risks

- **Over-specification**: Adding too many rules could create new rigidity. The documents should emphasize principles over prescriptions.
- **Staleness**: Project decisions file needs manual updating as coding progresses. Consider adding a prompt to update it at session end.
- **Divergence**: Source docs in `/methodology/` vs copies in projects may drift. The `project_setup` copy is a snapshot — consider noting this clearly.

---

## Discussion

### Open Questions

1. **Should the KODNINGSMANUAL date be updated in the filename?** Current: `2026-01-10`. Could become `2026-02-18` or simply drop the date.
2. **Should `project_setup` create an empty `coding_decisions.md` template?** This would establish the practice from the start.
3. **How much AI-specific instruction belongs in methodology docs vs in the MCP tool's `init()` response?** Currently `init()` gives format rules but not the qualitative nuances.
4. **Should reflexive notes be written into the transcript file or into a separate document?** Currently embedded — this works but makes extraction harder later.
