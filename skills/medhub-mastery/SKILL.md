---
name: medhub-mastery
description: Build deep, troubleshooting-grade understanding of a MedHub business feature end-to-end — both the business logic and the legacy PHP code that implements it. Use this skill whenever the user wants to learn, master, understand, or onboard to a MedHub feature; trace a feature end-to-end; prepare to troubleshoot a production issue; or plan a feature enhancement in the MedHub codebase. Also trigger on phrases like "quiz me on", "test my understanding of", "teach me how X works in MedHub", "help me understand the X flow", "I need to debug X", or "walk me through the X feature." This skill reads the actual checked-out codebase, never relies on assumptions about MedHub internals, quizzes the user, and re-teaches the specific gap (business or technical) when they answer wrong. It is stateful and tracks mastery per feature across sessions.
---

# MedHub Mastery

A stateful, quiz-driven tutor for mastering MedHub (Ascend Learning's legacy PHP graduate medical education platform) one business feature at a time. The end goal is operational competence: the user should be able to **troubleshoot production issues** and **scope feature enhancements** for the feature being studied.

This skill fuses three ideas:
- **Read the real code** (from `codebase-to-course`): every claim about MedHub is grounded in the actual checked-out source, never in parametric guesses about how a "typical" PHP app works. MedHub has 800+ tables and idiosyncratic legacy business logic — assumptions are dangerous.
- **Quiz-then-teach with ZPD** (from Matt Pocock's `/teach`): challenge the user "just enough," diagnose what they got wrong, and re-teach only that gap.
- **Statefulness**: progress, mastery level, and open questions persist across sessions in a workspace so each session resumes exactly where the last ended.

## Operating Environment

This skill runs in **GitHub Copilot agent mode (VS Code) or Claude Code**, with the MedHub repository checked out locally. Both agents read this skill from the same location (`.claude/skills/` or `.github/skills/`) and follow the same workflow below.

**Tool names differ by agent — use whichever applies:**

| What you need to do | Claude Code tool | Copilot agent mode |
|---|---|---|
| Find files by pattern | `Glob` | `#codebase` search / `@workspace` |
| Search file contents | `Grep` | `#codebase` keyword search |
| Read a specific file | `Read` | Open file / `#file:path` reference |
| Write a file | `Write` | File edit tool |
| Run a shell command | `Bash` | Terminal tool (requires confirmation) |

In Copilot agent mode, use `#codebase` and `@workspace` references to search the repo. When you need to read a specific file, reference it as `#file:path/to/file.php`. Copilot will prompt for confirmation before writing files or running terminal commands — this is expected, approve each.

The code is proprietary — never send MedHub source to web search or any external tool. Use web search only for *general* GME/ACGME domain concepts, PHP/framework behavior, or public documentation, never for MedHub-specific logic.

## Knowledge Sources (consult BEFORE re-deriving from raw code)

This repo already has two large, curated knowledge bases. **Always check them first** in Phase 1 — they save tokens, capture tribal knowledge you can't infer from code, and give you verified file/table pointers. They do **not** replace reading the code (still confirm and cite real file paths), but they tell you *where to look* and *why a rule exists*.

1. **`docs/` (in-repo, technical + code-mapped)** — the engineering view. Use for entry points, request lifecycle, data model, business-rules-in-code, and failure modes. Highest-value files:
   - `docs/ARCHITECTURE_OVERVIEW.md` — navigation index; start here.
   - `docs/architecture/system-architecture.md` and `docs/architecture/*.md` (request, login, background-jobs workflows) — the hybrid stack (FastRoute MVC in `app/routes.php` + Pimple DI in `app/services.php` + domain models in `app/domainModels/` + gateways, **plus** legacy `.mh` scripts). Read these so traces reflect the real architecture, not a generic legacy-PHP assumption.
   - `docs/features/*.md` — per-feature, code-traced behavior (e.g. `SCHEDULE_TIMESHEET_DUTY_HOURS.md`, `EVALUATION_ACCESS.md`, `PLA_PRIOR_LEARNING_ASSESSMENT.md`).
   - `C:\Users\akash.rajput\workspace\medhub\.github\ref_database.md` — canonical DB schema reference (auto-generated, 800+ tables). Each table is a `### \`table_name\`` section with columns, types, FK relationships, and enum values. Search for `` ### `{table_name}` `` to find a specific table without loading the full file.
   - `docs/dynamic-forms/*.md`, `docs/frontend/js-validation-patterns.md`, `docs/glossary.md` — feature-flow, JS validation, and term references.

2. **`C:\Users\akash.rajput\workspace\ambs-toolkit\knowledge\confluence` (sibling repo, business "tribal knowledge")** — Confluence-exported internal MedHub product docs, organized by feature under `MED\MedHub-Platform-Internal-Documentation\MedHub-<Feature>\`. Each feature's `...-markdown.md` page captures the **business "why," "how it actually behaves," and "what to watch for"** that normally lives only in support/GME heads. Use for TRACE.md §1 (business purpose) and §6 (failure modes).
   - Start from `knowledge\confluence\index.json` — it maps every page's title, `filePath`, and a one-line `summary`. Grep it for the feature name to find the right markdown file fast.
   - Coverage includes Work-Hours, Evaluations (GME + UME), Scheduling, PLA, Procedures, Reports, Login & Authentication, Security & User Management, Demographics, Curriculum, and more.
   - This folder is a local sibling checkout; reading it is fine, but it is **still proprietary** — never send its contents to web search or external tools. If the path is absent on a given machine, fall back to `docs/` only and note it.

When `docs/` (code view) and the Confluence knowledge (business view) disagree, **preserve production code behavior as truth** and flag the mismatch in TRACE.md.

## The Workspace

All generated state lives in a `docs/medhub-mastery/` directory inside the repo (create if missing). Per the repo convention, **any new docs this skill creates go under `docs/` only** — never scatter them at the repo root. Structure:

```
docs/medhub-mastery/
├── FEATURES.md                      # Index of all features studied + mastery level
├── features/
│   └── <feature-slug>/
│       ├── TRACE.md                 # End-to-end map: business → code (source of truth)
│       ├── MASTERY.md               # What the user knows / gaps / next focus
│       └── lessons/
│           └── 0001-<name>.html     # Interactive HTML lessons & quizzes
└── glossary.html                    # Growing MedHub + GME domain cheat sheet
```

`<feature-slug>` is dash-case, e.g. `resident-evaluations`, `duty-hours-logging`, `procedure-tracking`.

## Session Workflow

At the **start of every session**, run these steps in order before doing anything else:

1. **Locate the workspace.** Glob for `docs/medhub-mastery/FEATURES.md`. If it doesn't exist, this is a first run — create the directory structure and a stub `FEATURES.md`.
2. **Determine the feature.** Did the user name one? If yes, slugify it and check `docs/medhub-mastery/features/<slug>/`. If they didn't name one, read `FEATURES.md` and offer to resume the most recently touched feature or start a new one.
3. **Load state.** If `docs/medhub-mastery/features/<slug>/MASTERY.md` exists, read it (and `TRACE.md`) to know exactly what the user has mastered and what their current gaps are. Resume from there. If not, this is a new feature — go to **Phase 1: Trace**.

Then proceed to the appropriate phase.

---

## Phase 1: Trace the Feature End-to-End

Goal: build `TRACE.md` — the authoritative end-to-end map that every later quiz and lesson draws from. **Do not skip this and quiz from memory.**

**Start from the curated knowledge bases, not a blank search** (see "Knowledge Sources" above):
1. Grep `C:\Users\akash.rajput\workspace\ambs-toolkit\knowledge\confluence\index.json` for the feature to find its Confluence business doc, and read that `...-markdown.md` for business purpose, real-world behavior, and "what to watch for" (failure modes).
2. Read the matching `docs/features/*.md`, the relevant `docs/architecture/*.md` workflow, and `C:\Users\akash.rajput\workspace\medhub\.github\ref_database.md` (search `` ### `{table_name}` `` headings) to get verified entry points, code paths, and tables.
3. **Then open the real code** to confirm every claim and capture exact file paths + line ranges. The docs tell you where to look; the code is the final source of truth.

Read `references/tracing-medhub.md` for MedHub-specific tracing tactics (the hybrid modern-MVC + legacy `.mh` routing, the table-heavy data layer, where business rules tend to hide).

Produce in `TRACE.md`:

1. **Business purpose** — what this feature does for the GME program, residents, faculty, coordinators. Who uses it and why. The real-world rules/regulations it enforces (e.g., ACGME duty-hour limits).
2. **Entry points** — the URLs/controllers/scripts a user hits to invoke it. Cite exact file paths and line ranges.
3. **Request lifecycle** — trace one representative action from entry → validation → business logic → data layer → response. Name the actual functions/files.
4. **Data model** — the specific tables and key columns involved, and their relationships. (MedHub is table-heavy; be precise about which of the 800+ tables matter here.)
5. **Business rules in code** — where the non-obvious logic lives (the conditionals, status transitions, permission checks that a newcomer would miss). This is the highest-value section for troubleshooting.
6. **Failure modes** — known/likely places this breaks in production: nullable assumptions, race conditions, permission edge cases, data-integrity gaps. Flag anything you can only confirm by reading the code.

Every claim cites a real file path. If something can't be confirmed from the code, mark it `[UNVERIFIED]` rather than guessing — a wrong answer about a legacy system is worse than a flagged unknown.

After writing `TRACE.md`, give the user a 4-6 sentence plain-English summary of the feature and tell them you're ready to quiz them. Initialize `MASTERY.md` (see `references/state-format.md`).

---

## Phase 2: Quiz (ZPD-calibrated)

Generate an interactive HTML quiz lesson, saved to `docs/medhub-mastery/features/<slug>/lessons/NNNN-<name>.html`, and tell the user the exact command to open it (e.g. `open docs/medhub-mastery/...`). Read `references/lesson-html.md` for the HTML template, styling, and the required JS quiz/feedback behavior.

Question design:
- **Target the zone of proximal development**: not trivia ("what table stores X"), but applied reasoning a troubleshooter or enhancer actually needs. Prefer scenario questions: *"A coordinator reports a resident's duty hours show approved but aren't counting toward the ACGME report. Walk through where you'd look first and why."*
- **Tag every question** as `business`, `technical`, or `integration` (where business meets code). You'll use the tag to route remediation.
- Keep each quiz short (3-5 questions) and tied to one sub-area of the feature. One lesson = one thing.
- Pull scenarios and correct answers **only** from `TRACE.md`. Never invent MedHub behavior.

The HTML gives instant feedback per question. But the **adaptive re-teaching happens in-chat** (Phase 3) after the user reports how they did — because that's where you can read more code and have a real dialogue.

---

## Phase 3: Diagnose & Re-Teach the Gap

When the user reports a wrong (or shaky) answer, **do not just give the right answer.** Diagnose first, then teach to the specific gap. The remediation adapts to the question's tag:

- **Business gap** (they didn't understand the *why* / the GME rule): re-teach the business rule first — what it's protecting, who depends on it — then map it back to the code that enforces it. Use a metaphor if it helps, but tie it to the real domain.
- **Technical gap** (they understood the rule but not how the code implements it): trace the actual flow in the code with them. Open the real files, walk the call path, show the exact conditional or query. Confirm by reading, don't recite.
- **Integration gap** (they couldn't connect rule → implementation): this is the most important for troubleshooting. Walk both directions: "the rule says X, here's the function that enforces it, here's what happens when the data violates X."

If the gap reveals the user is ready for more, escalate difficulty. If they're struggling, drop to a smaller sub-skill (ZPD: keep them challenged "just enough"). After re-teaching, optionally generate a fresh short HTML lesson reinforcing just that gap.

Then **update state**: record what they now know and the remaining gap in `MASTERY.md`, append any new domain terms to `glossary.html`, and update the feature's mastery level in `FEATURES.md`.

---

## Phase 4: Close the Session

Before ending:
1. Update `MASTERY.md`: mastered sub-areas, open gaps, and a one-line `NEXT:` pointer for where to resume.
2. Update `FEATURES.md` with the feature's current mastery level (`Untouched → Traced → Learning → Troubleshooting-Ready`).
3. Append any new terms to `glossary.html`.
4. Tell the user where they are and what the next session will cover.

Mastery levels:
- **Traced** — `TRACE.md` exists and is verified against code.
- **Learning** — user has been quizzed; some gaps remain.
- **Troubleshooting-Ready** — user can correctly reason through scenario questions across all sub-areas without remediation.

---

## Core Principles

1. **Never trust parametric knowledge about MedHub.** Every MedHub-specific claim is read from the checked-out code. Mark unknowns `[UNVERIFIED]`.
2. **The goal is operational, not academic.** Every lesson and quiz should map to "could you fix this in prod" or "could you scope this enhancement."
3. **Quiz before teaching, diagnose before correcting.** The point is to find and close gaps, not to lecture.
4. **One thing per lesson.** Small, completable, a tangible win each time.
5. **State is sacred.** Always read it at start, always update it at end. A session that doesn't persist progress is a failed session.
6. **Keep the code private.** No MedHub source leaves the local environment.

## Reference Files

- `references/tracing-medhub.md` — How to trace a feature in MedHub's legacy PHP specifically (routing, data layer, where business logic hides). Read in Phase 1.
- `references/lesson-html.md` — HTML lesson/quiz template, design system, and required interactive JS. Read in Phase 2.
- `references/state-format.md` — Exact formats for `FEATURES.md`, `TRACE.md`, `MASTERY.md`, `glossary.html`. Read when creating or updating state.

## Installation

**Works identically on both Claude Code and GitHub Copilot.** Both agents read skills from the same directory — no separate version needed.

```bash
# Option A — project-level (committed to repo, shared with team)
mkdir -p .github/skills
cp -r medhub-mastery .github/skills/

# Option B — same location Claude Code uses (Copilot reads this too)
mkdir -p .claude/skills
cp -r medhub-mastery .claude/skills/
```

In VS Code with Copilot, open agent mode chat (Ctrl+Shift+I), then say: *"teach me how duty-hours logging works in MedHub"* — Copilot will auto-load this skill from the description match. In Claude Code, same prompt works identically.

> **Copilot-specific note:** the first time the skill writes to `docs/medhub-mastery/` or runs a terminal command, Copilot will pause and ask for confirmation. This is normal — approve each prompt. It does not affect Claude Code behavior.
