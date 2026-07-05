---
name: ambs-jira-comment
description: "Generate a JIRA comment from a completed AMBS investigation (and, only when explicitly requested, a Teams status update). Trigger phrases: 'write jira comment', 'generate teams update', 'draft comment for AMBS ticket', 'create ticket comment', 'write the jira update', 'generate handoff comment', 'write investigation summary'. Reads investigation.md and dev-notes.md, produces jira-comment.md (structured JIRA sections) by default, and teams-comment.md (plain prose for Teams chat) only when the user explicitly asks. Requires fix to be complete."
---

# AMBS JIRA Comment

Generate a JIRA comment from a completed investigation. Reads investigation.md and dev-notes.md, produces the formatted `jira-comment.md` output file. A Teams status update (`teams-comment.md`) is **only** generated when the user explicitly asks for it.

## Instructions

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override by setting `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere. `$TICKET_NUMBER` — extract from the current git branch (`git branch --show-current`) or ask the user.

The fix should be implemented and the GitLab MR created (via ambs-commit-mr) before running this skill so the MR URL can be included in the Assets / Branch section.

Credentials are loaded automatically from `~/.copilot/.env`.

### Step 1 — Load Context

Read all investigation files:
1. `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md`
2. `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/dev-notes.md` *(if it exists — developer scratch pad, read for any additional context not in investigation.md)*
3. `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/error.md` or `error.txt` *(whichever exists)*

Also check for a GitLab MR link — look in recent git log or ask the user. If the ambs-commit-mr skill was run, the MR URL should be available for the Assets / Branch section.

If investigation.md has "TBD" in Proposed Fix, warn the user the investigation may be incomplete and ask if they want to proceed anyway.

### Step 2 — Generate Teams Comment (only when explicitly requested)

**Skip this step by default.** Only generate `teams-comment.md` when the user explicitly asks for a Teams comment / Teams update (e.g. "write the teams comment", "also generate the teams update"). If the user only asked for a JIRA comment, do **not** write `teams-comment.md` — go straight to Step 3.

When the user has explicitly requested it, **ALWAYS** read the Teams comment template from the `docs/ambs-investigations/` folder — `$INVESTIGATIONS_ROOT/teams-resolution-template.md` (equivalently `$PROJECT_ROOT/docs/ambs-investigations/teams-resolution-template.md`; both resolve to the same maintained file). This template is **mandatory**: read it every time and reproduce its `## Template` section structure exactly — do not invent, reorder, omit, or rename sections, and do not write the comment from memory or ad-hoc. Follow its Guidelines. If the template file cannot be found, **stop and tell the user** the template is missing rather than improvising.

Write `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/teams-comment.md` using that template, which has this structure:

```
Regarding - https://ascend-learning.atlassian.net/browse/{TICKET_NUMBER}

SUMMARY OF ISSUE:

{One-line description of the reported error}

FINDINGS:

{Concise findings: is it reproducible, current Datadog status, root cause if identified, fix status}

PROPOSED SOLUTION:

{Business-facing summary of the proposed fix and expected user impact}
```

The structure above is shown for reference only — the `docs/ambs-investigations/teams-resolution-template.md` file is the source of truth and must be read and followed every time.

**Teams comment rules:**
- **No code blocks** — plain prose only. Mention file names, method names, and table names as plain text, not in backticks
- Keep it brief — this is for a Teams chat
- Include specific evidence (dates, record IDs, error counts)
- Focus on actionable status: is it still happening? what's the next step?
- Always include `PROPOSED SOLUTION` immediately after `FINDINGS`

### Step 3 — Generate JIRA Comment

**ALWAYS** read the JIRA comment template from the `docs/ambs-investigations/` folder — `$INVESTIGATIONS_ROOT/jira-template.md` (equivalently `$PROJECT_ROOT/docs/ambs-investigations/jira-template.md`; both resolve to the same maintained file). This template is **mandatory**: read it every time and reproduce its exact section structure — do not invent, reorder, omit, or rename sections, and do not write the comment from memory or ad-hoc. If the template file cannot be found, **stop and tell the user** the template is missing rather than improvising.

Write `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/jira-comment.md` with these sections:

- **Client Resolution** — Plain-language summary for the client or QE. No code blocks. 2-4 sentences.
- **Internal Notes** — Developer-facing root cause details, code paths investigated, hypotheses ruled out. 2-4 sentences.
- **Recommendations** — Follow-up actions or monitoring suggestions. 2-4 sentences.
- **Changes** — High-level description of what was changed. File names inline as plain text. 2-4 sentences.
- **Resolution** (under Deployment Task) — Steps to deploy (e.g., "Deploy support-save.mh to production").
- **Assets / Branch** — Git branch name and GitLab MR link (from ambs-commit-mr or ask the user).
- **Files Changed** — List only application source files modified for the ticket. Never include files from `$INVESTIGATIONS_ROOT` — those are local investigation artifacts.
- **Tables/Fields Involved** — Database tables and fields, or "None".
- **Dependencies** — Other tickets or deployments, or "None".
- **Data Sets** — Specific records, institutions, or user IDs, or "None".
- **QE Notes** — Bullet points of test scenarios QE should verify.
- **Regression Testing** — Areas to regression-test.
- **Root Cause and Actions** — Concise technical root cause and the action taken.
- **Developer Testing Notes** — Steps taken to verify the fix.

In **Developer Testing Notes**, always include a brief `DBReload backup filepaths (all projects)` item populated from `config/dbreload.yaml` (`servers.*.filepaths`) and keep the configured placeholder patterns intact.

**JIRA comment rules:**
- Use backticks for technical identifiers (variables, classes, methods, files, tables, columns) everywhere except **Client Resolution**
- No fenced code blocks anywhere — inline backticks only
- Every section must be populated ("None" or "N/A" if not applicable — never blank)
- Read `dev-notes.md` before writing to ensure no context is lost
- **Be concise** — 2-4 sentences per prose section. QE Notes and Regression Testing as bullet points.
- Do not repeat the same information across sections
- Include `DBReload backup filepaths (all projects)` in `Developer Testing Notes` using `config/dbreload.yaml` (`servers.*.filepaths`).
- In `Files Changed`, never list files from `$INVESTIGATIONS_ROOT`; those are local investigation artifacts.

### Step 4 — Present and Confirm

Show the user the generated `jira-comment.md` (and `teams-comment.md` only if it was generated in Step 2) and ask if any edits are needed.

### Step 4b — Provide One-Liner Commit Message (always)

After presenting the generated comment file(s), **always** provide a single one-liner Git
commit message for the ticket's code change. This is mandatory and must be given every time
this skill runs, immediately after the JIRA comment.

- Format: `{TICKET_NUMBER} {imperative summary of the change}` (imperative mood, brief, no trailing period).
- Tag with the ticket's own key (the defect key for defects), matching the current git branch.
- Base the summary on the actual code change described in the `Changes` / `Root Cause and Actions`
  sections of `jira-comment.md`.
- Present it on its own so the user can copy it directly.

### Step 5 — Confirm Manual JIRA Post

The user posts the JIRA comment to Jira **manually**. Do **not** post it automatically. Instead, after presenting `jira-comment.md`, ask the user explicitly:

> "Have you posted the JIRA comment to the ticket?"

Wait for their answer:
- **Yes** → proceed to Step 6 (sub-task cleanup).
- **No / not yet** → stop here. Do not run cleanup. Let the user know they can re-run cleanup later once posted (e.g. by asking to "clean up sub-tasks for {TICKET_NUMBER}").

The Teams comment (`teams-comment.md`), if generated, must also be copied manually.

### Step 6 — Close Sub-Tasks

Only run this step once the user has confirmed (in Step 5) that they posted the JIRA comment. When confirmed, run the cleanup-subtasks script without waiting for further confirmation:

```cmd
node "$PLUGIN_ROOT/scripts/cleanup-subtasks.js" -t {TICKET_NUMBER}
```

Review the output and report which sub-tasks were closed and which (if any) were already closed or not found. If the user said they have **not** posted the JIRA comment, skip this step.

### Rules

- **Templates are mandatory** — always read `docs/ambs-investigations/jira-template.md` (and `docs/ambs-investigations/teams-resolution-template.md` only when a Teams comment was explicitly requested) from the `docs/ambs-investigations/` folder and follow their structure exactly. Never write `jira-comment.md` or `teams-comment.md` ad-hoc, from memory, or with a custom structure. If a required template file is missing, stop and tell the user.
- **Do not generate `teams-comment.md` by default** — only write it when the user explicitly asks for a Teams comment/update. A request to "write the JIRA comment" does not include the Teams comment.
- This skill only generates documentation — it does not modify application code
- **`$INVESTIGATIONS_ROOT`** defaults to `$PROJECT_ROOT/docs/ambs-investigations` — never hardcode it; override via `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere
- **Never commit investigation files to the main project repo** — the workspace lives in `$INVESTIGATIONS_ROOT/`, which is separate from the project repo; never stage or push these files via the main project repo
- **Never push** any repository
