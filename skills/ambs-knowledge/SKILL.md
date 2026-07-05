---
name: ambs-knowledge
description: "Capture and recall durable knowledge learned while working AMBS tickets — architecture details, deployment quirks, troubleshooting patterns, business context, environment facts. Trigger phrases: 'remember this', 'save this learning', 'add to knowledge base', 'save to second brain', 'what do we know about X', 'check the knowledge base', 'seed the knowledge base'. Writes one-fact-per-file entries to $PLUGIN_ROOT/knowledge/learned/ with an INDEX.md for cheap recall. Invoked automatically by the ambs-debug agent at ticket close (Phase 6.5) and available standalone anytime."
---

# AMBS Knowledge (Second Brain)

Capture distilled, durable knowledge from ticket work into `$PLUGIN_ROOT/knowledge/learned/`, and recall it on demand. Recall during investigations happens automatically inside `ambs-investigate` (Step 3b, Lookup 0) — this skill covers explicit capture, explicit recall, and one-time seeding.

## Instructions

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override by setting `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere.

The knowledge base lives at `$PLUGIN_ROOT/knowledge/learned/`. If the directory does not exist, create it with an `INDEX.md` (header + `<!-- entries below this line -->` marker) and point the user to `knowledge/learned/README.md` in this repo for the format spec. Read `$PLUGIN_ROOT/knowledge/learned/README.md` before writing any entry — it is the format contract.

Decide the mode from the request: **Capture** ("remember this", "save this learning", agent Phase 6.5), **Recall** ("what do we know about X"), or **Seed** ("seed the knowledge base").

---

## Capture Mode

### Step C1 — Gather candidates

Source depends on how the skill was invoked:

- **Mid-session ("remember this")** — the candidate is the fact the user just pointed at in the conversation. Restate it precisely.
- **Ticket close (agent Phase 6.5)** — read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` (and `dev-notes.md` if present, read-only) and extract candidate learnings.

### Step C2 — Filter hard

Keep only facts that would change how a **future** ticket is investigated or fixed. The test: "If a similar error appears in six months, does knowing this save time?"

**Keep** (with `type`):
- `architecture` — how a subsystem actually fits together, non-obvious data flow
- `deployment-quirk` — build/deploy/config behaviours that bite (per-site config, cache, cron timing)
- `troubleshooting-pattern` — a diagnostic shortcut proven to work (e.g. "spinner stuck on X page → check shared method Y for stray echo")
- `domain-gotcha` — API/framework contracts that mislead (return-null conventions, side effects, output contracts)
- `business-context` — who uses a feature and what workflow breaks when it fails
- `environment` — local-dev/Docker/tooling facts that were painful to discover

**Discard:**
- Ticket-specific data: record IDs, user IDs, one-off data states, dates of a single incident
- Anything derivable from code, git history, or `ref_database.md` — the crash line, the diff, column types
- The fix itself (that lives in the MR and `investigation.md`) — keep only the *reusable pattern* behind it, if any

"Nothing worth saving" is a valid outcome — say so and stop.

### Step C3 — Dedupe against existing entries

For each candidate, grep `$PLUGIN_ROOT/knowledge/learned/INDEX.md` (case-insensitive) for the candidate's classes, tables, and feature keywords. For any hit, read the matched entry file:

- **Same fact** → update the existing entry: refine wording if the new ticket adds nuance, append the ticket to `sources`. Do not create a duplicate.
- **Related but distinct fact** → new entry; add a `Related: [[existing-entry-name]]` link both ways.
- **Existing entry contradicted by new evidence** → propose correcting or deleting it, citing the new ticket.

### Step C4 — Propose and confirm (REQUIRED GATE)

Show the user each proposed entry in full (or the diff to an existing entry) and ask for confirmation before writing anything. The user may approve, edit, or skip each candidate individually. **Never write an entry without explicit confirmation.**

### Step C5 — Write

For each approved entry:

1. Write `$PLUGIN_ROOT/knowledge/learned/{name}.md` following the README.md format exactly — frontmatter (`name`, `description`, `type`, `tags` with `classes`/`tables`/`features`, `sources`, `learned` as an absolute `YYYY-MM-DD` date), body of 2–6 sentences, then `**Why it matters:**` and `**How to apply:**` lines.
2. Add (or update) its line in `INDEX.md` below the `<!-- entries below this line -->` marker:
   ```
   - [Title](entry-file.md) — one-line hook (tags: ClassName, table_name, Feature Keyword)
   ```
   Tags must be flattened inline — recall greps only this file.

Then suggest committing via the `git-commit` skill **in this repo** (`$PLUGIN_ROOT`). Never stage knowledge files in the project repo or mix them into a ticket MR.

---

## Recall Mode

1. Read `$PLUGIN_ROOT/knowledge/learned/INDEX.md`. If it is missing or has no entries, tell the user the knowledge base is empty and stop.
2. Match the query terms (class names, table names, feature keywords, free text) against index lines — case-insensitive substring match on title, hook, and tags.
3. Load only the matching entry files, cap at 5 (most relevant first); note any skipped.
4. Summarize each matched entry: the fact, **How to apply**, and source ticket(s). Point to the entry file for the full text.

---

## Seed Mode (one-time backfill, on explicit request only)

1. List past investigations: `$INVESTIGATIONS_ROOT/AMBS-*/investigation.md` (confirm `INVESTIGATIONS_ROOT` with the user — for cross-project backfill they may want to point at more than one repo's docs folder).
2. Process in small batches (3–5 tickets at a time). For each `investigation.md`: run Steps C2–C3 to extract and dedupe candidates.
3. Present each batch's candidates for confirmation (Step C4) before writing (Step C5). Expect most tickets to yield zero entries — that is normal; only durable, recurring knowledge qualifies.
4. After all batches, report totals: entries created, entries updated, tickets that yielded nothing.

---

### Rules

- **Approval gate is mandatory** — never write or modify a knowledge entry without showing it to the user first.
- **One fact per file; non-obvious only** — never store what is derivable from code, git history, or `ref_database.md`; never store ticket-specific record/user IDs.
- **Update instead of duplicating; delete entries proven wrong.**
- **Absolute dates only** in `learned` and entry bodies.
- **`INDEX.md` is the recall contract** — every entry must have exactly one line in it, tags flattened inline; a broken index makes entries invisible to `ambs-investigate` Lookup 0.
- Knowledge files live in `$PLUGIN_ROOT/knowledge/learned/` and are committed to the ai-agents repo only — **never** to the project repo, never in a ticket MR.
- This skill never modifies application code, `investigation.md`, or `dev-notes.md`.
