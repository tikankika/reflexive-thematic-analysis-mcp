# KÄLLFILER FÖR CLAUDE PROJECT KNOWLEDGE

**Dokument:** Referens för AI-Augmented RTA-metodologi
**Skapad:** 2026-01-08
**Syfte:** Dokumentera exakta källfiler, sökvägar och eventuella encoding-problem

---

## ⚠️ KRITISK INFORMATION

### Encoding-problem upptäckt

Vid uppladdning till Claude Project Knowledge konverterades UTF-8 svenska tecken **felaktigt** i vissa filer:

| Korrekt | Blev (trasigt) |
|---------|----------------|
| `ö` | `Ã¶` |
| `ä` | `Ã¤` |
| `å` | `Ã¥` |
| `Ö` | `Ã–` |
| `Ä` | `Ã„` |
| `Å` | `Ã…` |

**Orsak:** UTF-8 → Latin-1 → UTF-8 double-encoding vid uppladdning.

---

## KÄLLFILER - KORREKT SÖKVÄG

### Basmapp (lokal)

```
/Users/niklaskarlsson/Nextcloud/Fokusgrupper_AI_2025/Analysis/ULF_2025-12-07/
Method descriptions used in knowledge in Claude Project + specific files for this case/
```

---

## 1. METODOLOGI-FILER (Huvudmapp)

| Filnamn (KORREKT) | Storlek | Encoding | Status i Project Knowledge |
|-------------------|---------|----------|---------------------------|
| `KODNINGSMANUAL_AI_Augmented_RTA_Lins1.md` | 15,281 bytes | UTF-8 | 🔴 **KORRUPT** (16,292 bytes, trasig encoding) |
| `Linser fördjupat.md` | 6,920 bytes | UTF-8 | ✅ **IDENTISK** (men filnamn blev `Linser_fo_rdjupat.md`) |
| `Linser fördjupat.pdf` | - | - | Ej verifierad |

---

## 2. RTA DESCRIPTION (Undermapp)

### Sökväg
```
.../Method descriptions used in knowledge in Claude Project + specific files for this case/RTA description/
```

### Filer

| Filnamn (KORREKT lokal) | Filnamn i Project Knowledge | Storlek lokal | Storlek PK | Status |
|-------------------------|----------------------------|---------------|------------|--------|
| `Section_3.1.1_Epistemology_Guide.md` | `Section_3_1_1_Epistemology_Guide.md` | 21,425 | 21,672 | 🔴 **KORRUPT** (+247 bytes) |
| `Section_3_1_2_Orientation_Guide.md` | `Section_3_1_2_Orientation_Guide.md` | - | 18K | ⚠️ Ej verifierad |
| `Section_3_1_3_Inductive_Deductive_Guide.md` | `Section_3_1_3_Inductive_Deductive_Guide.md` | - | 30K | ⚠️ Ej verifierad |
| `Section_3_1_4_Semantic_Latent_Guide.md` | `Section_3_1_4_Semantic_Latent_Guide.md` | - | 38K | ⚠️ Ej verifierad |
| `phase1_familiarization_template.md` | `phase1_familiarization_template.md` | - | 12K | ⚠️ Ej verifierad |
| `phase2_coding_template ver01.md` | `phase2_coding_template_ver01.md` | - | 18K | ⚠️ Ej verifierad (filnamn ändrat) |
| `phase2_coding_template_final_INTEGRATED_byrne_based.md` | `phase2_coding_template_final_INTEGRATED_byrne_based.md` | - | 32K | ⚠️ Ej verifierad |
| `phase2_REVISED_two_approaches ver02.md` | `phase2_REVISED_two_approaches_ver02.md` | - | 16K | ⚠️ Ej verifierad (filnamn ändrat) |
| `phase3_generating_themes.md` | `phase3_generating_themes.md` | 22,483 | 22,615 | 🔴 **KORRUPT** (+132 bytes) |
| `phase4_reviewing_themes.md` | `phase4_reviewing_themes.md` | - | 23K | ⚠️ Ej verifierad |
| `phase5_defining_naming_themes.md` | `phase5_defining_naming_themes.md` | - | 22K | ⚠️ Ej verifierad |
| `phase6_producing_report.md` | `phase6_producing_report.md` | - | 30K | ⚠️ Ej verifierad |

---

## 3. LITTERATUR/REFERENSER (Undermapp)

### Sökväg
```
.../RTA description/Literature, references/
```

### PDF-filer (ej uppladdade till Project Knowledge)

| Filnamn |
|---------|
| `Why AI has a "proving the obvious" problem...pdf` |
| `al-fattal-singh-2025-comparative-reflections-on-human-driven-and-generative-artificial-intelligence-assisted-thematic.pdf` |
| `naeem-thomas-2025-case-study-research-and-artificial-intelligence...pdf` |
| `ozuem-et-al-2025-thematic-analysis-in-an-artificial-intelligence-driven-context...pdf` |
| `psycholint-07-00078-v2.pdf` |
| `s10676-024-09777-3.pdf` |
| `s11135-021-01182-y (1).pdf` |
| `tai-et-al-2024-an-examination-of-the-use-of-large-language-models...pdf` |

---

## 4. TRANSKRIPT (Separata filer)

Transkripten laddades upp separat och finns i Project Knowledge:

| Filnamn | Storlek i PK | Källa |
|---------|--------------|-------|
| `Ai_fokusgrupp_ne_traff_1_rec_1.md` | 122K | Separat uppladdning |
| `Ai_fokusgrupp_ne_traff_1_rec_2.md` | 98K | Separat uppladdning |
| `Ai_fokusgrupp_ne_traff_1_rec_3.md` | 137K | Separat uppladdning |
| `Ai_fokusgrupp_ne_traff_2_rec_1.md` | 107K | Separat uppladdning |
| `Ai_fokusgrupp_ne_traff_2_rec_2.md` | 123K | Separat uppladdning |

---

## 5. TEMATISKA STRUKTURER (Genererade under analys)

Dessa skapades UNDER analysen, inte uppladdade från lokal mapp:

| Filnamn | Lins | Status |
|---------|------|--------|
| `Lins_1_KOMPLETT_tematisk_struktur_lins1_UTKAST.md` | 1 | Utkast |
| `Lins1_PRELIMINÄRA_TEMATISKA_KLUSTER_-_Phase_3.md` | 1 | Preliminär |
| `LINS2_preliminara_kluster_FORE_ihopslagning.md` | 2 | Pre-merge |
| `LINS3_preliminara_kluster_FORE_ihopslagning.md` | 3 | Pre-merge |
| `SLUTGILTIG_tematisk_struktur_lins2.md` | 2 | Slutgiltig |
| `SLUTGILTIG_tematisk_struktur_lins3.md` | 3 | Slutgiltig |

---

## 6. ÖVRIGA FILER I PROJECT KNOWLEDGE

| Filnamn | Ursprung |
|---------|----------|
| `AI-Augmented_RTA_Methodology_Draft.md` | Genererad under projekt |
| `Chat_history.md` | Genererad under projekt (2MB) |

---

## VERIFIERINGSMETOD

### Hur verifieringen gjordes (2026-01-08)

1. **Storleksjämförelse:** `wc -c` (bytes) mellan lokal fil och Project Knowledge
2. **Innehållsjämförelse:** Manuell inspektion av första/sista rader
3. **Encoding-kontroll:** Sökning efter `Ã¶`, `Ã¤`, `Ã¥` (trasiga tecken)

### Verifierade filer

| Fil | Metod | Resultat |
|-----|-------|----------|
| `KODNINGSMANUAL_AI_Augmented_RTA_Lins1.md` | Storlek + innehåll | 🔴 KORRUPT |
| `Linser fördjupat.md` | Storlek + innehåll | ✅ IDENTISK |
| `Section_3.1.1_Epistemology_Guide.md` | Storlek | 🔴 KORRUPT |
| `phase3_generating_themes.md` | Storlek | 🔴 KORRUPT |

---

## REKOMMENDATIONER

### För framtida uppladdningar

1. **Kontrollera encoding FÖRE uppladdning**
   ```bash
   file -I filnamn.md  # Ska visa "charset=utf-8"
   ```

2. **Verifiera EFTER uppladdning**
   - Jämför filstorlek
   - Sök efter `Ã¶` i Project Knowledge-versionen

3. **Använd konsekvent namngivning**
   - Undvik mellanslag i filnamn (använd `_`)
   - Undvik svenska tecken i filnamn

### För nuvarande projekt

**Filer som BÖR laddas upp igen med korrekt encoding:**
- [ ] `KODNINGSMANUAL_AI_Augmented_RTA_Lins1.md`
- [ ] `Section_3.1.1_Epistemology_Guide.md`
- [ ] `phase3_generating_themes.md`
- [ ] (Verifiera övriga Section_3_1_*.md och phase*.md)

---

## FILNAMNSÄNDRINGAR VID UPPLADDNING

| Lokalt filnamn | Project Knowledge-namn | Ändring |
|----------------|------------------------|---------|
| `Section_3.1.1_Epistemology_Guide.md` | `Section_3_1_1_Epistemology_Guide.md` | `.` → `_` |
| `phase2_coding_template ver01.md` | `phase2_coding_template_ver01.md` | mellanslag → `_` |
| `phase2_REVISED_two_approaches ver02.md` | `phase2_REVISED_two_approaches_ver02.md` | mellanslag → `_` |
| `Linser fördjupat.md` | `Linser_fo_rdjupat.md` | `ö` → `o_r` (encoding-fel i filnamn) |

---

## ÄNDRINGSLOGG

| Datum | Ändring |
|-------|---------|
| 2026-01-08 | Dokument skapat efter verifiering av källfiler |

---

**Kontakt:** Niklas Karlsson
**Projekt:** AI-Augmented Reflexive Thematic Analysis
