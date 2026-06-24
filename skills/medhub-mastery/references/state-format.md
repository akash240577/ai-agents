# State File Formats

State persists across sessions in `docs/medhub-mastery/` inside the repo (per the repo convention that all generated docs live under `docs/`). Always read the relevant files at session start; always update them at session end. Keep them concise and human-readable — the user may open them too.

---

## FEATURES.md (workspace index)

One row per feature studied. Mastery levels: `Untouched` → `Traced` → `Learning` → `Troubleshooting-Ready`.

```markdown
# MedHub Mastery — Feature Index

| Feature | Slug | Mastery | Last touched | Next |
|---------|------|---------|--------------|------|
| Resident Evaluations | resident-evaluations | Learning | 2026-06-09 | Quiz: cross-program permission edge cases |
| Duty Hours Logging | duty-hours-logging | Traced | 2026-06-07 | Begin quizzing on approval flow |
```

---

## TRACE.md (per feature — the source of truth)

This is authoritative. Every quiz and lesson draws from it. Every claim cites a real file path; unconfirmed items are marked `[UNVERIFIED]`.

```markdown
# Trace: <Feature Name>

_Last verified against code: <date> @ <git sha if available>_

## 1. Business Purpose
- What it does for the GME program and who uses it.
- Real-world rules/regulations enforced (e.g. ACGME duty-hour limits).

## 2. Entry Points
- `path/to/handler.php:120-180` — <what invokes this>
- AJAX: `js/feature.js:44` → `path/to/ajax_handler.php`

## 3. Request Lifecycle (action: "<concrete action>")
1. Input: `...php:NN` — params read/validated (note weak validation)
2. Permission: `...php:NN` — role/program gate
3. Business logic: `...php:NN` — function `xyz()`
4. Data layer: `...php:NN` — writes `table_a`, `table_b`
5. Response: `...php:NN`

## 4. Data Model
- `table_name` — key columns, PK/FK, status columns
- Relationships / join tables
- [UNVERIFIED] suspected denormalized copy in `other_table`

## 5. Business Rules in Code
- `...php:NN` — the non-obvious conditional / status transition / permission combo

## 6. Failure Modes
- Nullable assumption: `...php:NN`
- Permission edge case: ...
- Cron/scheduled mutation: `cron/...php`
```

---

## MASTERY.md (per feature — what the user knows)

Loosely like an architectural decision record, but for the learner's knowledge. Read at session start to resume; update at session end.

```markdown
# Mastery: <Feature Name>

## Mastered (verified by correct scenario answers)
- Business purpose and ACGME rule it enforces
- The happy-path approval lifecycle

## Open gaps
- [technical] Doesn't yet trace how the AJAX approval handler updates status
- [integration] Can't connect "log shows approved but not counted" → the reporting query

## Difficulty calibration
- Comfortable with business framing; needs more on the data/reporting layer.

NEXT: Quiz on the reporting query join and the soft-delete flag interaction.
```

---

## glossary.html

Same visual style as lessons (see `lesson-html.md`). Alphabetized MedHub + GME terms, each with a plain-English definition and the file/table it maps to where relevant. Append new terms; never regenerate from scratch.

---

## Update discipline

- **Session start:** read `FEATURES.md`, plus the active feature's `TRACE.md` and `MASTERY.md`.
- **After each re-teach:** update `MASTERY.md` (move items from gaps → mastered, adjust calibration) and append glossary terms.
- **Session end:** finalize `MASTERY.md` `NEXT:` line, update the feature's row in `FEATURES.md`.
- Never let a session end without persisting progress.
