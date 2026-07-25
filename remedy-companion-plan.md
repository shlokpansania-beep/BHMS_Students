# Remedy Companion — Build Plan

A study app for a BHMS (Homeopathy) student, combining a **Flashcard/Quiz system** for memorization with a **Repertory Search** tool for symptom-to-remedy lookup — built on a single shared remedy database.

---

## Core Idea

One web app, two connected modules sharing the same remedy database:
1. **Flashcard/Quiz module** — for memorizing remedies, keynotes, and modalities
2. **Repertory Search module** — for looking up remedies based on symptoms

Same data powers both, so the database is built once and reused everywhere.

---

## 1. Data Structure

For each remedy, store something like:

```json
{
  "name": "Pulsatilla",
  "source": "Plant (Wind Flower)",
  "keynotes": [
    "Weepy, clingy, changeable mood",
    "Thirstless",
    "Worse in warm room, better open air"
  ],
  "mind_symptoms": ["Sensitive", "Seeks sympathy", "Mood shifts easily"],
  "modalities": {
    "worse": ["Warm room", "Rich/fatty food", "Evening"],
    "better": ["Open air", "Cold applications", "Consolation"]
  },
  "common_uses": [
    "Colds with thick yellow discharge",
    "PMS",
    "Digestive complaints from fatty food"
  ],
  "related_remedies": ["Sepia", "Silicea"]
}
```

**Scope recommendation:** Start with **50–100 commonly studied remedies** rather than the full ~1000+, matching what's actually in her syllabus first.

---

## 2. Content Sources

- **Boericke's Materia Medica** and **Kent's Repertory** — widely available as public domain text/PDF, good base sources to structure data from.
- Ideally, base the remedy list and details on **her actual syllabus/reference books** — makes the tool directly useful for her exams, not generic.

---

## 3. Features

### Flashcard / Quiz Module
- Swipeable cards: front = remedy name, back = keynotes/symptoms
- Spaced repetition — remedies she gets wrong resurface sooner
- Quiz mode: symptoms shown → she picks the matching remedy (multiple choice)

### Repertory Search Module
- Text input for symptoms, with optional tag filters (mind / physical / modality)
- Returns ranked remedy matches
- Tapping a result opens that remedy's full flashcard/detail view

### Bonus: Compare-Two-Remedies View
- Side-by-side table for commonly confused remedy pairs (e.g., Pulsatilla vs Sepia, Nux Vomica vs Bryonia)
- A classic pain point for homeopathy students — high value, relatively easy to build

---

## 4. Tech Stack

- **Frontend:** React, built as a **PWA** (installable on her phone, works offline — useful for a student without constant data access)
- **Data layer:** Since the dataset is small and mostly read-only, a local JSON/SQLite file bundled with the app is enough — no complex backend needed
- **Progress storage:** `localStorage` for simplicity, or Firebase free tier if quiz scores need to sync across devices

---

## 5. Suggested Build Order

1. Structure data for ~30 remedies (prove the concept first)
2. Build the flashcard + quiz UI
3. Add the repertory search module
4. Polish UI, add a personal touch
5. Expand remedy count once the core works well

---

## Next Step

Scaffold the data structure and a working flashcard prototype (React artifact) to validate the idea before building out the full app.
