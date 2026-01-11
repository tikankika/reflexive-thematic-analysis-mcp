# KODNINGSMANUAL: AI-Augmented RTA (Lins 1)
## Praktisk guide för replikation

**Syfte:** Denna manual beskriver exakt hur du kodar nästa fokusgrupp-transkript (BSG eller MÅG) med samma metod som NE.

**Tidsåtgång:** ~4-6 timmar för 800-1000 raders transkript

---

## STEG 0: FÖRBEREDELSE (Gör en gång)

### 0.1 Skapa arbetsdokument

**Kopiera transkriptet till nytt dokument:**
```
NE_Lins1_Kodning.md (eller BSG_Lins1_Kodning.md)
```

**Lägg till header:**
```markdown
# [SKOLA] FOKUSGRUPP - LINS 1 KODNING
## Elevers användning av generativ AI

**Metodologi:** Reflexive Thematic Analysis (Braun &amp; Clarke)
**Epistemologi:** Konstruktionistisk
**Approach:** Primärt induktiv
**Kodningsnivå:** Både semantisk och latent

**LINS 1 FOKUS:**
- BETEENDE: Hur använder elever faktiskt? När? Var? Vilka verktyg?
- FÖRSTÅELSE: Vad tror elever AI är? Skillnad information vs kunskap?
- KÄNSLOR/ATTITYDER: Osäkerhet, skam, entusiasm?
- STÄLLNINGSTAGANDEN: Vad tycker elever är legitimt? Var drar DE gränsen?
- VARIATION: Skillnader mellan elever

**Data = lärarnas konstruktioner av elevers användning**

---

## TRANSKRIPT MED KODNING
```

### 0.2 Förbered AI-instruktioner (kopiera detta)

**VIKTIGT:** Ge Claude denna instruktion INNAN du börjar koda:

```markdown
# DIN ROLL I DENNA KODNINGSPROCESS

Du ska hjälpa mig koda fokusgrupp-data med Reflexive Thematic Analysis (RTA).

## GRUNDPRINCIPER

**Epistemologi:** KONSTRUKTIONISTISK
- Detta är LÄRARES konstruktioner av elevers AI-användning
- Inte "objektiv sanning" om vad elever gör
- Språk konstruerar mening, speglar inte bara verklighet

**Metod:** Reflexive Thematic Analysis (Braun &amp; Clarke, Byrne 2022)
- Induktiv approach: koder växer från data, inte förutbestämda
- Både semantisk (vad sägs) och latent (djupare mening) kodning
- Forskaren har tolkningsauktoritet, inte AI

## DIN SPECIFIKA UPPGIFT

**Steg 1: LÄS segment med Lins 1-filter**
Jag ger dig ~60-100 rader transkript.
Läs med fokus på: Vad sägs om ELEVERS användning av AI?

**Steg 2: IDENTIFIERA meningsbärande enheter**
- INTE rad-för-rad kodning
- Hitta meningsfulla enheter (kan vara flera rader)
- Bara innehåll relevant för Lins 1

**Steg 3: FRÅGA om osäkerheter FÖRST**
Innan du föreslår koder, FRÅGA om:
- Svenska idiom/uttryck du är osäker på
- Kontext som är oklar
- Tolkning som kan vara dubbeltydig

**Steg 4: FÖRESLÅ koder**
Format:
#kod_beskrivning__lins1 (eller __lins2, __lins3)

VIKTIGA REGLER:
- Bevara SVENSKA in vivo-uttryck i citationstecken
  Exempel: #"fulanvändning"__lins1
- En kod = en idé/observation
- Kod på SVENSKA när möjligt
- Linsmärkning INBYGGD i kodnamn (__lins1, __lins2, __lins3)

**Steg 5: UPPDATERA dokumentet**
Lägg till koder direkt i transkriptet inom /segment markörer

## EXEMPEL

Input:
```
00:10:46.948 --> 00:10:50.713
[SPEAKER_02]: Jag har de här instuderingsfrågorna som de kommer kolla av imorgon.
Jag bara, fort, rasslar igenom det. Där har vi den.
```

Din output:
```
/segment
00:10:46.948 --> 00:10:50.713
[SPEAKER_02]: Jag har de här instuderingsfrågorna som de kommer kolla av imorgon.
Jag bara, fort, rasslar igenom det. Där har vi den.

#"fort_rasslar_igenom"__lins1
#inför_kontroll_nästa_dag__lins1
/slut_segment
```

## VAD DU INTE SKA GÖRA

❌ Koda meta-organisatoriskt innehåll
❌ Översätt svenska uttryck till engelska i kodnamn
❌ Koda samma sak flera gånger med olika ord
❌ Besluta själv vid osäkerhet - FRÅGA först
❌ Ge långa förklaringar - håll det koncist

## VÅR ARBETSRYTM

1. Jag säger: "Koda rad X-Y"
2. Du läser → frågar om osäkerheter → föreslår koder
3. Jag säger: acceptera/modifiera/förkasta
4. Du uppdaterar dokumentet med segment-struktur
5. Loop till hela transkriptet kodat

Redo att börja?
```

---

## STEG 1: KODNING SEGMENT FÖR SEGMENT

### 1.1 Första segmentet (testa arbetsflöde)

**Din prompt:**
```
Vi börjar med de första 60 raderna. 

Läs med Lins 1-filter (elevers användning av AI).

FÖRE du föreslår koder: Fråga mig om allt som är oklart - 
svenska uttryck, kontext, tolkning.

SEN: Föreslå koder med format #kod_beskrivning__lins1
```

**Vänta på AI:s frågor → Svara → Få kodförslag**

### 1.2 Granska kodförslag

**Checklista:**
- [ ] Är detta relevant för Lins 1?
- [ ] Är svenska in vivo-uttryck bevarade?
- [ ] Är en kod = en idé (inte tre idéer i en kod)?
- [ ] Är linsmärkning korrekt (__lins1, __lins2, eller __lins3)?
- [ ] Överlappar denna kod med tidigare koder?

**Dina svar-alternativ:**
1. "Acceptera alla" (om allt ser bra ut)
2. "Acceptera 1, 3, 5; ändra 2 till [ny formulering]; skippa 4"
3. "Gå igenom igen, leta fler latenta mönster"

### 1.3 AI uppdaterar dokument

**AI ska skapa:**
```markdown
/segment
[tidsstämpel] → [tidsstämpel]; [SPEAKER]: [text]
#kod1__lins1
#kod2__lins2

[tidsstämpel] → [tidsstämpel]; [SPEAKER]: [text]

[tidsstämpel] → [tidsstämpel]; [SPEAKER]: [text]
#kod3__lins1
/slut_segment
```

**VIKTIGT:** Segment-struktur med /segment och /slut_segment gör det lätt navigera senare!

### 1.4 Reflexiv notering

**Efter varje 100 rader, fråga AI:**
```
Sammanfatta:
1. Antal nya koder detta segment
2. Totalt antal koder hittills
3. Framväxande mönster du ser

Håll det kort - bullet points.
```

**Spara detta som löpande minnesanteckningar** (utanför transkriptet)

---

## STEG 2: MELLERSTA SEGMENTEN (Iteration)

### 2.1 Arbetsrytm som funkar

**Din prompt för varje nytt segment:**
```
Fortsätt med rad [X-Y].

Samma process:
1. Fråga om osäkerheter
2. Föreslå koder
3. Uppdatera dokument med /segment struktur

Kom ihåg: Bevara svenska in vivo, en kod = en idé
```

### 2.2 Hantera överlappande koder

**När AI föreslår kod som LIKNAR tidigare kod:**

**AI:** "Ska jag skapa #elever_använder_för_genvägar__lins1 eller är detta samma som #ta_genvägar_få_svar__lins1?"

**Bra svar:**
- "Samma - använd den befintliga koden"
- "Nej, ny nyans: genvägar generellt vs. specifikt för att slippa göra"
- "Hmm, låt mig tänka... [förklara]"

### 2.3 Hantera latent vs. semantisk

**Påminn AI regelbundet:**
```
I nästa segment: Leta både semantiska OCH latenta mönster.

Semantisk = vad sägs direkt
Latent = djupare mening, antaganden, motsättningar

T.ex. "Tyvärr. Eller, ja..." = LATENT ambivalens
```

---

## STEG 3: AVSLUTA KODNING

### 3.1 Sista segmentet

**Din prompt:**
```
Sista segmentet: rad [X] till slut.

Koda som vanligt, men lägg till:

EFTER sista /slut_segment, skriv:

## KODNING SLUTFÖRD

**Statistik:**
- Totalt rader: [X]
- Totalt koder: [Y]
- Fördelning:
  - Lins 1 (elevers användning): [antal]
  - Lins 2 (lärares attityder): [antal]
  - Lins 3 (påverkan lärande): [antal]

**Främsta mönster som framträtt:**
1. [mönster 1]
2. [mönster 2]
3. [mönster 3]
```

### 3.2 Kod-review

**Nu viktigt steg! Fråga AI:**
```
Gör en kod-review:

1. Finns det koder som är nästan identiska? Lista dem.
2. Finns det koder som är för breda? (innehåller flera idéer)
3. Finns det koder som bara förekommer EN gång och kanske inte är så viktiga?

Format som tabell för läsbarhet.
```

**Detta ger dig underlag för beslutsfattning i nästa fas!**

---

## STEG 4: KVALITETSKONTROLL

### Checklist (gör själv)

**Genomgång av dokumentet:**
- [ ] Alla segment har /segment och /slut_segment?
- [ ] Svenska in vivo-uttryck bevarade i koder?
- [ ] Linsmärkning konsekvent (__lins1, __lins2, __lins3)?
- [ ] Inga uppenbara duplikatkoder?
- [ ] Meta-organisatoriskt innehåll EJ kodat?
- [ ] Både semantiska OCH latenta koder finns?

**Test av konstruktionistisk medvetenhet:**
- [ ] Har jag kodat lärarnas UTSAGOR (inte "objektiv sanning")?
- [ ] Har jag varit medveten om att detta är lärar-perspektiv på elever?

---

## STEG 5: DOKUMENTERA PROCESS

### 5.1 Skapa processdokumentation

**Nytt dokument:** `[SKOLA]_Lins1_Kodningsprocess_Reflektion.md`

**Innehåll:**
```markdown
# KODNINGSPROCESS - [SKOLA] LINS 1

**Datum:** [datum]
**Tid:** [start] - [slut] (totalt X timmar)
**Resultat:** [antal] koder från [antal] rader

## ARBETSFLÖDE

Segment-storlek: ~[X] rader
Antal segment: [Y]
Genomsnittlig tid per segment: [Z] minuter

## METODOLOGISKA BESLUT

**Stora beslut:**
1. [Exempel: "Valde att inte koda facilitators ramar"]
2. [Exempel: "Slog samman tre koder om 'genvägar'"]

## REFLEXIVA NOTERINGAR

**Utmaningar:**
- [Utmaning 1]
- [Utmaning 2]

**Överraskningar:**
- [Överraskning 1]
- [Överraskning 2]

**Framväxande mönster:**
1. [Mönster 1 + kortfattad beskrivning]
2. [Mönster 2 + kortfattad beskrivning]

## NÄSTA STEG

Går vidare till Phase 3: Generating Themes
```

---

## TIPS &amp; TRICKS (från NE-erfarenhet)

### ✅ VAD SOM FUNKADE BRA

**1. Fråga-före-kodning:**
AI:s osäkerhetsfrågor tvingade mig tänka djupare

**2. Segment-struktur:**
/segment markörer gjorde dokumentet navigerbart

**3. Svenska in vivo:**
Bevarade autenticitet och kulturell mening

**4. Reflexiva noteringar UNDER kodning:**
Mönster växte fram organiskt, inte efterkonstruerat

**5. Tillåta hög kod-density:**
Bättre för mycket i fas 1 än missa viktigt - rensa i fas 3

### ⚠️ VAD SOM VAR KNEPIGT

**1. Kod-överlapp:**
AI föreslog ibland samma idé med olika ord
→ **Lösning:** Regelbunden kod-review, våga säga "samma som #X"

**2. Meta-innehåll:**
Början av transkript ofta mycket organisatoriskt
→ **Lösning:** Explicit "koda inte meta" - okej hoppa rader

**3. Balans semantisk/latent:**
AI drar åt semantiskt
→ **Lösning:** Påminn aktivt om latent kodning

**4. Svenska tolkningar:**
AI missar ibland kulturella nyanser
→ **Lösning:** AI MÅSTE fråga vid osäkerhet

---

## VANLIGA FRÅGOR

### Q: Hur stort ska varje segment vara?
**A:** 60-100 rader fungerade bra för NE. Kan variera beroende på innehållets densitet.

### Q: Vad gör jag om AI föreslår för många koder?
**A:** Det är OK! Bättre för mycket i fas 1. Du rensas och konsoliderar i tema-fasen.

### Q: Ska jag koda upprepningar?
**A:** Om någon säger samma sak om igen: nej, koda inte igen. Men om det sägs i ny kontext eller med ny nyans: ja, överväg ny kod.

### Q: Hur vet jag om kod är Lins 1, 2 eller 3?
**A:** 
- **Lins 1:** Elevers ANVÄNDNING/beteende/attityder
- **Lins 2:** Lärares ANVÄNDNING/attityder/praktik
- **Lins 3:** Påverkan på LÄRANDE (inte bara användning)

### Q: Vad gör jag när AI är osäker?
**A:** BRA! Detta är systemet som fungerar. Svara på AI:s frågor - detta tvingar dig vara reflexiv.

### Q: Hur många reflexiva noteringar behövs?
**A:** Varje ~100 rader räcker. Mer om du ser något spännande mönster växa fram.

### Q: Kan jag ändra beslut senare?
**A:** JA! Detta är iterativ process. I tema-fasen kan du gå tillbaka och revidera koder.

---

## SNABBSTART-CHECKLISTA

Innan du börjar nästa transkript:

**Förberedelse:**
- [ ] Transkript kopierat till nytt dokument med header
- [ ] AI-instruktioner (från avsnitt 0.2) givna till Claude
- [ ] Klar på vad Lins 1 innebär

**Under kodning:**
- [ ] Jobba i segment om ~60-100 rader
- [ ] AI frågar FÖRE kodning
- [ ] Jag granskar kodförslag kritiskt
- [ ] /segment struktur används konsekvent
- [ ] Reflexiva noteringar varje ~100 rader

**Efter kodning:**
- [ ] Kod-review genomförd
- [ ] Kvalitetskontroll checklist gjord
- [ ] Processdokumentation skriven

---

## NÄSTA STEG EFTER KODNING

När hela transkriptet är kodat:

1. **Kod-review:** Identifiera överlappande/redundanta koder
2. **Latent pass:** Gå djupare in i vissa segment för latent tolkning
3. **Kod-sammanställning:** Skapa komplett lista alla koder
4. **Phase 3:** Generera preliminära teman från koder

Se: `phase3_generating_themes.md` för nästa steg.

---

**REDO ATT BÖRJA MED NÄSTA TRANSKRIPT?**

Kopiera AI-instruktionerna från 0.2, öppna nästa transkript, och kör!

---

## APPENDIX A: AI-PROMPT TEMPLATE (COPY-PASTE)

```markdown
# DIN ROLL I DENNA KODNINGSPROCESS

Du ska hjälpa mig koda fokusgrupp-data med Reflexive Thematic Analysis (RTA).

## GRUNDPRINCIPER

**Epistemologi:** KONSTRUKTIONISTISK
- Detta är LÄRARES konstruktioner av elevers AI-användning
- Inte "objektiv sanning" om vad elever gör
- Språk konstruerar mening, speglar inte bara verklighet

**Metod:** Reflexive Thematic Analysis (Braun &amp; Clarke, Byrne 2022)
- Induktiv approach: koder växer från data, inte förutbestämda
- Både semantisk (vad sägs) och latent (djupare mening) kodning
- Forskaren har tolkningsauktoritet, inte AI

## DIN SPECIFIKA UPPGIFT

**Steg 1: LÄS segment med Lins 1-filter**
Jag ger dig ~60-100 rader transkript.
Läs med fokus på: Vad sägs om ELEVERS användning av AI?

**Steg 2: IDENTIFIERA meningsbärande enheter**
- INTE rad-för-rad kodning
- Hitta meningsfulla enheter (kan vara flera rader)
- Bara innehåll relevant för Lins 1

**Steg 3: FRÅGA om osäkerheter FÖRST**
Innan du föreslår koder, FRÅGA om:
- Svenska idiom/uttryck du är osäker på
- Kontext som är oklar
- Tolkning som kan vara dubbeltydig

**Steg 4: FÖRESLÅ koder**
Format:
#kod_beskrivning__lins1 (eller __lins2, __lins3)

VIKTIGA REGLER:
- Bevara SVENSKA in vivo-uttryck i citationstecken
  Exempel: #"fulanvändning"__lins1
- En kod = en idé/observation
- Kod på SVENSKA när möjligt
- Linsmärkning INBYGGD i kodnamn (__lins1, __lins2, __lins3)

**Steg 5: UPPDATERA dokumentet**
Lägg till koder direkt i transkriptet inom /segment markörer

## VAD DU INTE SKA GÖRA

❌ Koda meta-organisatoriskt innehåll
❌ Översätt svenska uttryck till engelska i kodnamn
❌ Koda samma sak flera gånger med olika ord
❌ Besluta själv vid osäkerhet - FRÅGA först
❌ Ge långa förklaringar - håll det koncist

## VÅR ARBETSRYTM

1. Jag säger: "Koda rad X-Y"
2. Du läser → frågar om osäkerheter → föreslår koder
3. Jag säger: acceptera/modifiera/förkasta
4. Du uppdaterar dokumentet med segment-struktur
5. Loop till hela transkriptet kodat

Redo att börja?
```

---

## APPENDIX B: EXEMPEL-SEGMENT (komplett)

```markdown
/segment
00:10:46.948 --> 00:10:50.713
[SPEAKER_02]: Jag har de här instuderingsfrågorna som de kommer kolla av imorgon.
Jag bara, fort, rasslar igenom det. Där har vi den.
Lärandet i det kanske inte är jättestort.

#"fort_rasslar_igenom"__lins1
#inför_kontroll_nästa_dag__lins1
#lärandet_inte_jättestort__lins3
/slut_segment

/segment
00:11:15.066 --> 00:11:20.289
[SPEAKER_04]: Som svensklärare tycker jag att den är bättre än ChatGPT.

[LINS 2 - lärares verktygsval, ej Lins 1]
/slut_segment

/segment
00:22:03.150 --> 00:22:08.338
[SPEAKER_02]: Även om man tar självständigt användande av modeller så upplever jag 
att eleven hamnar i den översta raden. I fysik till exempel så kan det vara att 
de inte förstår ett koncept så frågar de en modell förklara rörelsemängdens bevarande.
Jag vill bara ha ett svar. Och jag litar omedelbart på det modellen. 
Jag tar det som samtidigt.

#elever_hamnar_i_direktanvändning__lins1
#frågar_AI_förklara_koncept__lins1
#"vill_bara_ha_ett_svar"__lins1
#litar_omedelbart_på_AI_output__lins1
#tolkar_output_som_sant__lins1
/slut_segment
```

---

**VERSION:** 1.0  
**SKAPAD:** 2025-11-30  
**BASERAD PÅ:** NE Lins 1 kodningsprocess
