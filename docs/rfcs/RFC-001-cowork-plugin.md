# RFC-001: Cowork Plugin som komplement till MCP-servern

**Status:** Accepted
**Datum:** 2026-03-06
**Författare:** Niklas Karlsson + Claude (dialogiskt framtaget)

---

## Bakgrund

MCP-servern `qualitative-analysis-rta` styr idag Claudes beteende i Cowork genom:

1. **Gatekeeper-mekanism** — `init()` måste anropas före alla andra verktyg
2. **Instruktionsdokument** — `init-instructions.md` med 5 explicita REGLER
3. **Metodologiladdning** — fas-specifika dokument laddas via `methodology_load()`
4. **Verktygsdesign** — tools kräver explicit filsökväg, STATUS-tracking förhindrar hopp
5. **Processloggning** — dialogisk reflexivitet fångas i `_process_log.jsonl`

Cowork har sedan januari 2026 ett plugin-system med **Skills** (SKILL.md), **Commands**, **Agents** och **Hooks** — allt filbaserat (markdown + JSON). Frågan är om en plugin kan komplettera MCP-servern.

---

## Nuläge: Styrningskedjan

```
Session start
    │
    ▼
init() ──────────── Gatekeeper: blockerar alla tools tills anropad
    │                Returnerar: instruktioner + regler + verktygskatalog
    ▼
methodology_load() ─ Laddar fas-specifik metodik (2a, 2b, 3, 4, 5, 6)
    │                Måste anropas varje session
    ▼
code_start() ─────── Startar kodning, laddar kodningsprotokoll
    │                Auto-loggar session_start i process_log
    ▼
[analyscykel] ────── code_read_next → code_write_segment → review_revise_codes
    │                Forskaren styr, Claude föreslår
    ▼
log_session_end() ── Tvingar reflektion: "key analytical decisions"
```

### Smärtpunkter

| Problem | Konsekvens |
|---------|-----------|
| `init()` måste anropas varje session | Forskaren glömmer → kryptiskt felmeddelande |
| `methodology_load()` måste anropas varje session | Metodik inte tillgänglig förrän explicit laddad |
| Fas 4-6 har inga tools | Minimal scaffolding, fritt samtal utan struktur |
| Processlogg inte synlig | Forskaren ser inte tidigare korrigeringar/beslut |
| Kodningsprotokoll hårdkodat sökväg | Svårt att byta protokoll mitt i projekt |
| Ingen "nästa steg"-guidance | Forskaren måste minnas arbetsflödet |

---

## Vad en Cowork Plugin skulle ge

### Skills (SKILL.md) — Persistent metodologikunskap

Skills laddas automatiskt när Claude bedömer dem som relevanta. Beskrivningar (~30-50 tokens per skill) är *alltid* i context. Fullt innehåll laddas on-demand.

**Möjliga skills:**
- `rta-methodology/` — Braun & Clarkes RTA-ramverk, fasöversikt
- `dialogic-reflexivity/` — Forskaren har tolkningsauktoritet, dubbelreflexivitet
- `coding-conventions/` — Semantiska vs latenta koder, formatregler
- `phase-scaffolding/` — Vägledning för fas 4-6 (som idag saknar tools)

### Commands — Strukturerade workflows

Slash-commands som forskaren triggar explicit:
- `/rta:start-session` — Initialisering + metodologiladdning i ett steg
- `/rta:next-step` — Intelligent "vad ska jag göra nu?" baserat på projektstatus
- `/rta:session-reflection` — Strukturerad sessionsavslutning

### Hooks — Automatiska reaktioner

Event handlers som triggas av tool-användning:
- Post-coding: auto-påminnelse om processloggning
- Session-avslut: auto-prompt för reflektion

---

## Risker och konsekvenser

### RISK 1: Dubbelunderhåll — Metodologi på två ställen

**Scenario:** Samma RTA-metodik finns i MCP-serverns `methodology/`-filer OCH i plugin-skills.

**Konsekvens:**
- Ändringar måste synkas mellan två system
- Versionskonflikter: vilken källa är sanningen?
- Ökad kognitiv belastning för utvecklaren

**Bedömning:** HÖG RISK — men **löst genom designprincip**.

**Lösning: Strikt ansvarsfördelning — noll överlappning**

Plugin skills innehåller ALDRIG metodologiinnehåll. De innehåller enbart **meta-kunskap**:
- *Hur* man arbetar (arbetsflöde, principer, beteenderegler)
- *Inte vad* RTA innebär (det äger MCP-serverns `methodology/*.md` exklusivt)

```
MCP-server (ENDA SANNINGSKÄLLA):         Plugin (META-KUNSKAP):
├── methodology/                         ├── skills/
│   ├── phase2a_initial_coding.md        │   ├── rta-awareness/SKILL.md
│   ├── phase2b_critical_review.md       │   │   "Kalla init(). Ladda metodologi
│   ├── phase3_generating_themes.md      │   │    via methodology_load(). Forskaren
│   ├── phase4_reviewing_themes.md       │   │    styr. Var tentativ."
│   ├── phase5_defining_naming.md        │   │
│   ├── phase6_producing_report.md       │   ├── phase-4-6-workflow/SKILL.md
│   └── dialogic_reflexivity.md          │   │   "Ladda fas-metodik via MCP.
│                                        │   │    Arbeta i samtal. Strukturera
├── docs/mcp-usage/                      │   │    reflektion så här..."
│   └── init-instructions.md             │   │
│                                        │   └── reflexive-reminder/SKILL.md
└── src/tools/ (alla verktyg)            │       "Föreslå, bestäm aldrig.
                                         │        Forskarens ord är primärdata."
                                         └── commands/
                                             └── reflect/SKILL.md
```

**Princip:** Plugin pekar alltid TILLBAKA till MCP:n för metodologiinnehåll. Om en skill behöver referera till metodik säger den "ladda via `methodology_load(phase='X')`", aldrig en kopia av innehållet.

**Testfråga vid varje skill-redigering:** "Skulle denna text behöva uppdateras om metodologin ändras?" Om ja → den hör inte hemma i plugin.

---

### ~~RISK 2: Förlust av medveten metodologisk engagemang~~ → EJ RISK

**Ursprungligt scenario:** Med skills "alltid tillgängliga" försvinner det medvetna steget att ladda metodologi.

**Forskarens bedömning:** Att ladda dokument är inte samma sak som metodologisk medvetenhet. Reflexivt engagemang sker i det faktiska analysarbetet — i dialogen om koder, i korrigeringar, i tolkningsbeslut — inte i ritualen att kalla `methodology_load()`.

Persistent tillgänglighet av meta-kunskap (arbetsflöde, principer) är en **förbättring**, inte en förlust. Forskaren förlorar inte sin medvetenhet för att Claude redan vet att init() ska kallas — tvärtom slipper forskaren onödig friktion och kan fokusera på det som faktiskt kräver reflexivitet: analysen.

---

### RISK 3: "Proving the obvious" förstärks — KRITISK

**Scenario:** Claude har persistent metodologikunskap via skills. Den "vet" redan hur RTA fungerar. Claude blir mer övertygande men inte nödvändigtvis mer autentisk.

**Konsekvens:**
- Forskarens kritiska blick kan slappna av — "Claude verkar redan förstå"
- AI-kodning som "låter rätt" men saknar den materialnärkontakt som forskaren har
- Dialogisk reflexivitet undermineras: om AI aldrig behöver korrigeras, var är dialogen?

**Bedömning:** KRITISK RISK.

**Forskarens insikt:** `methodology_load()` är inte bara "konfiguration av Claude" — det är ett **delat läsningsmoment**. Både forskaren och Claude läser metodologidokumentet tillsammans. Det är lika mycket till forskaren som till Claude. Att göra detta osynligt eller automatiskt innebär att forskaren inte återengagerar sig med metoden vid varje session.

**Designkonsekvens:** Metodologiladdning får ALDRIG automatiseras bort. Plugin-skills ska:
- ALDRIG innehålla metodologikunskap (redan löst i Risk 1)
- ALDRIG göra `methodology_load()` överflödig
- Tvärtom: skill `rta-awareness` ska *påminna* om att det delade läsningsmomentet behöver ske
- Formulering i skill: "Forskaren och Claude behöver läsa metodologin tillsammans via `methodology_load()` — detta är ett gemensamt steg, inte bara en teknisk laddning"

**Princip:** Metodologiladdningen är en dialogisk handling, inte en teknisk operation. Den ska förbli synlig, medveten och delad.

---

### RISK 4: Context window-kostnad

**Scenario:** Plugin-skills konsumerar tokens. MCP-tools konsumerar tokens. Tillsammans tränger de ut analysdata.

**Siffror:**
- Plugin-skills (5-7 st): ~250 tokens beskrivningar (alltid i context) + ~500-1000 tokens (vid invokering)
- MCP-tools (96 st, redan idag): ≈ 20K-48K tokens bara för scheman
- Context window (Cowork/Opus): 200K tokens

**Bedömning:** FÖRSUMBAR RISK. Pluginen adderar ~250 tokens till en redan existerande MCP-kostnad på 20-48K tokens. Det är en rundningsfråga. Den verkliga context-kostnaden drivs av MCP-verktygen, inte av skills.

---

### RISK 5: Ändrat arbetsflöde — Vem styr vem? — KRITISK

**Nuvarande modell:**
```
Forskare → init() → metodologi → medvetet val → analys
```
Forskaren driver. Claude väntar. Varje steg är explicit.

**Felaktig plugin-modell (AVVISAD):**
```
[Skills laddas automatiskt] → Forskare ställer fråga → Claude har redan kontext
```
Claude "vet redan". Maktdynamiken förskjuts. **Detta får inte ske.**

**Konsekvens om detta tillåts:**
- RTA bygger på att forskaren gör tolkningsarbetet
- Om Claude har persistent metodologikunskap blir det otydligt *vem* som driver analysen
- Process-loggen fångar korrigeringar, men om Claude aldrig *behöver* korrigeras — fångar loggen hela bilden?

**Bedömning:** KRITISK — detta är en hård gräns, inte en avvägning.

**Designkonsekvens — korrekt plugin-modell:**
```
[Skills ger meta-påminnelser]  → Forskare initierar  → init() + methodology_load()
        ↑                              ↑                        ↑
   "init krävs"              Forskaren driver        Delat läsningsmoment
   "forskaren styr"          (inget ändras)          (bevaras intakt)
   "var tentativ"
```

Plugin-skills får ENBART:
1. **Påminna** om att init + metodologiladdning behövs (inte ersätta dem)
2. **Förstärka** forskarens auktoritet ("föreslå, bestäm aldrig")
3. **Guida** i faser utan tools (4-6) genom att peka till `methodology_load()`
4. **Strukturera** reflektion via commands (`/rta:reflect`)

Skills får ALDRIG ge Claude metodologisk kontext som gör att forskaren kan skippa det delade läsningsmomentet.

---

### RISK 6: Plugin-distribution och reproducerbarhet

**Scenario:** En annan forskare vill reproducera analysen.

**Med enbart MCP-server:** Klonar repo → startar server → alla verktyg och metodik finns.
**Med MCP + plugin:** Klonar repo → startar server → måste OCKSÅ installera plugin.

**Bedömning:** LÅG RISK. Plugin kan bundlas i samma repo. Men måste dokumenteras.

---

## Konsekvensanalys: Vad förändras i praktiken?

### Scenario A: Plugin ERSÄTTER init-flödet

| Före (MCP only) | Efter (Plugin + MCP) |
|-----------------|---------------------|
| Forskare kallar `init()` | Skills laddar automatiskt |
| Forskare kallar `methodology_load()` | Metodologi "redan känd" |
| Explicit gatekeeper | Ingen gatekeeper |
| Forskaren *måste* engagera sig | Forskaren *kan* hoppa direkt in |
| Tydlig audittrail: "init kallades kl 14:03" | Otydligt: "skills var tillgängliga" |

**Rekommendation:** NEJ. Förlust av gatekeeper och medveten engagemang är för hög kostnad.

### Scenario B: Plugin KOMPLETTERAR init-flödet

| Före (MCP only) | Efter (Plugin + MCP) |
|-----------------|---------------------|
| Forskare kallar `init()` | Skill *påminner* om init, men kräver det fortfarande |
| Fas 4-6 utan scaffolding | Skills ger strukturerad vägledning för fas 4-6 |
| Ingen "nästa steg" | `/rta:next-step` command |
| Processlogg begravd i JSONL | Skill som hjälper att reflektera |
| Kodningsprotokoll hårdkodat | Skill som laddar rätt protokoll per projekt |

**Rekommendation:** JA, men med tydliga gränser.

### Scenario C: Ingen plugin — förbättra MCP-servern istället

| Problem | MCP-lösning |
|---------|-------------|
| Måste kalla init varje session | Auto-init vid första tool-anrop (fallback) |
| Fas 4-6 utan tools | Lägg till fas 4-6 tools |
| Ingen "nästa steg" | Nytt tool: `workflow_status()` |
| Processlogg inte synlig | Nytt tool: `process_log_summary()` |

**Rekommendation:** Enklare, men löser inte persistent kunskapsfrågan.

---

## Kritisk analys: Ger en plugin REELLT mervärde?

Efter att vi satt alla nödvändiga begränsningar (Risk 1, 3, 5) — vad kan en plugin
faktiskt göra som MCP-servern inte redan gör eller enkelt kan göra?

### Vad vi TAGIT BORT från plugin-scopet

| Ursprunglig plugin-fördel | Bortfiltrerad pga risk | Status |
|---------------------------|----------------------|--------|
| Persistent metodologikunskap | Risk 1: dubbelunderhåll | ❌ Borttagen |
| Automatisk metodologiladdning | Risk 3: delat läsningsmoment försvinner | ❌ Borttagen |
| Claude "vet redan" utan init | Risk 5: maktförskjutning | ❌ Borttagen |

### Vad som ÅTERSTÅR i plugin-scopet

| Plugin-funktion | Vad den gör | Kan MCP lösa samma sak? |
|----------------|-------------|------------------------|
| Skill: "kalla init()" | Påminnelse före första tool-anrop | **Ja.** MCP-gatekeeper visar redan `🛑 STOP! Call init first.` |
| Skill: "forskaren styr" | Bakgrundspåminnelse om auktoritet | **Ja.** `init-instructions.md` säger redan detta. Laddas vid init(). |
| Skill: "var tentativ" | Tonalitetsstyrning | **Ja.** Redan i init-instructions RULE 3. |
| Skill: fas 4-6 workflow | Vägledning för tool-lösa faser | **Delvis.** `methodology_load(phase='4')` finns redan. Men MCP kunde lägga till `phase_guide()` tool. |
| Command: `/rta:reflect` | Strukturerad sessionsreflektion | **Ja.** Nytt MCP-tool: `session_reflection()` |
| Command: `/rta:next-step` | Nästa steg i workflow | **Ja.** Nytt MCP-tool: `workflow_status()` |

### Ärligt svar

**Plugin-unikt mervärde efter alla begränsningar: MINIMALT.**

Det enda en plugin ger som MCP *strukturellt* inte kan:

1. **Pre-init kontext** — Skills finns i Claudes kontext *innan* init() kallas. MCP-tools syns som namn men Claude vet inte vad de gör förrän init körs. En skill kan säga "du arbetar med kvalitativ analys, börja med init()".

2. **Slash-commands för forskaren** — `/rta:reflect` låter forskaren trigga ett strukturerat flöde. MCP-tools anropas av Claude, inte direkt av forskaren.

Men:
- Pre-init: Forskaren skriver redan "ladda init" som första meddelande. Skill sparar en mening.
- Slash-commands: Forskaren kan skriva "kör sessionsreflektion" istället för `/rta:reflect`. Skillnaden är kosmetisk.

### Reell kostnad av plugin

- **Underhåll av en till artefakt** (plugin.json, SKILL.md-filer, commands/)
- **Mer att dokumentera** för reproducerbarhet
- **Risk 6**: En till sak forskare måste installera
- **Konceptuell komplexitet**: Var finns vad? MCP eller plugin?

### Vad MCP-servern ENKELT kan förbättras med istället

| Nytt tool | Vad det gör | Komplexitet |
|-----------|-------------|-------------|
| `workflow_status()` | Visar var i RTA-flödet man är, föreslår nästa steg | Låg — läser project_state |
| `session_reflection()` | Strukturerad reflektion vid sessionsslut | Låg — prompt + log_session_end |
| `process_log_summary()` | Visar senaste korrigeringar/beslut | Låg — läser _process_log.jsonl |
| Förbättrad `methodology_load()` för fas 4-6 | Bättre scaffolding med samtalsstruktur | Medel — utöka befintlig tool |

---

## Reviderad rekommendation

### Primärt: Scenario C — Förbättra MCP-servern

Plugin-scopet har krympt till nästan ingenting efter riskanalysen. Det som återstår kan lösas enklare och med mindre underhållskostnad genom att lägga till 3-4 MCP-tools.

**Fördelar:**
- En enda sanningskälla (inget dubbelt system)
- Inget nytt att installera/underhålla
- Alla förbättringar i samma repo, samma build
- Redan fungerande gatekeeper, metodologiladdning, processloggning
- Reproducerbarhet: klona repo → starta server → allt fungerar

### Sekundärt: Plugin som FRAMTIDA option

Om/när dessa villkor uppfylls kan plugin bli relevant:
- Cowork-plugins mognar och fler forskare använder dem
- Behov av distribution till andra forskargrupper (marketplace)
- Plugin-ekosystemet erbjuder funktioner MCP inte kan (t.ex. UI-integration)

Pluginens filstruktur och skills-design sparas i denna RFC som referens.

---

## Rekommenderade MCP-förbättringar (Scenario C)

### Nya MCP-tools att bygga

| Tool | Syfte | Komplexitet |
|------|-------|-------------|
| `workflow_status()` | Visar fas, progress, föreslår nästa steg | Låg — läser project_state.json |
| `session_reflection()` | Strukturerad reflektion med promptfrågor, loggar automatiskt | Låg — prompt + log_session_end |
| `process_log_summary()` | Visar senaste korrigeringar, beslut, mönster | Låg — läser _process_log.jsonl |

### Förbättringar av befintliga tools

| Tool | Förbättring |
|------|-------------|
| `methodology_load()` | Utöka fas 4-6 med samtalsstruktur och reflektionsfrågor |
| `init()` | Tydligare "nästa steg"-guidance i response |

### Verifiering

1. Starta Cowork → kalla init() → verifiera nya tools syns
2. Försök analysera utan `init()` → ska fortfarande blockeras av MCP-gatekeeper
3. Kör `workflow_status()` → visar korrekt fas och nästa steg
4. Kör `session_reflection()` → strukturerade reflektionsfrågor + auto-loggning
5. Kör `process_log_summary()` → visar senaste korrigeringar och beslut
6. Kör `methodology_load(phase='4')` → förbättrad scaffolding med samtalsstruktur

---

## Öppna frågor

1. **Ska `workflow_status()` vara tillgänglig utan init?**
   Argument för: hjälper forskaren orientera sig. Argument emot: bryter gatekeeper-principen.
   Förslag: Tillgänglig utan init, men med begränsad info ("init har inte anropats, kör init() först").

2. **Hur detaljerad ska `process_log_summary()` vara?**
   Alla events? Bara senaste sessionen? Filtrerat per typ (corrections, rejections)?
   Förslag: Default senaste sessionen, med filter-parametrar.

3. **Plugin som framtida option — vilka villkor triggar omvärdering?**
   Förslag: (a) fler forskare i teamet som behöver onboarding, (b) behov av marketplace-distribution, (c) Cowork-plugins erbjuder UI-integration som MCP inte kan.

---

## Referenser

- Braun, V. & Clarke, V. (2021). Thematic Analysis: A Practical Guide. Sage.
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Cowork Plugins](https://claude.com/blog/cowork-plugins)
- [Use plugins in Cowork](https://support.claude.com/en/articles/13837440-use-plugins-in-cowork)
