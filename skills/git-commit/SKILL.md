---
name: git-commit
description: "Generate and commit Git commit messages following Chris Beams' seven rules. Uses current branch for ticket number, analyzes recent AMBS/MEDM commits for examples, drafts candidate messages, validates style, and commits after user confirmation. Run this skill on demand to draft/enforce good commit messages."
---

# Git Commit Skill — Draft, Validate, and Commit

Generate a commit message that follows Chris Beams' seven rules (https://chris.beams.io/git-commit#seven-rules), using the current branch name for the ticket number and examples from recent AMBS/MEDM commits.

This skill is intended to be invoked on demand (not loaded every session). It drafts candidate messages, validates style rules, presents choices for user confirmation/editing, and performs the commit (and optional push / MR creation) only after explicit approval.

## Prerequisites

- Run from the repository root.
- Git must be available in PATH.
- If using AMBS/MEDM project conventions, branch names typically contain ticket numbers like `AMBS-12345` or `MEDM-9876`.
- Prefer to stage only the files that belong to the ticket before committing; the skill will help select files if none are staged.

## Overview (high level)

1. Determine ticket number from current branch name, or ask the user.
2. Collect up to 100 recent commit messages that reference AMBS/MEDM ticket numbers to use as style/examples.
3. Draft 2–3 candidate commit messages following Chris Beams' rules.
4. Validate each candidate against enforced checks (subject length, punctuation, imperative mood heuristics, blank line separation, wrap body at ~72 chars, etc.).
5. Present candidates to the user for selection or freeform edit.
6. Stage files (use staged files or interactively pick changed files).
7. Commit using the chosen message. Optionally push and create an MR/PR if requested.

## Detailed Instructions

### Step 1 — Identify ticket number

- Run: `git branch --show-current`
- Extract ticket using regex: `(AMBS|MEDM)-\d+` from the branch name.
- If not found, ask the user to provide a ticket number (or confirm a manual title without a ticket).

### Step 2 — Collect examples (past 100 AMBS/MEDM commits)

- Recommended command (POSIX shell):

```bash
git log --pretty=format:%s --grep="AMBS-" --grep="MEDM-" -n 500 | sed -n '1,100p'
```

- On Windows/PowerShell, similar intent: get the last ~500 commits and filter for AMBS/MEDM, then take the most recent 100 matching subjects.
- Use these subjects as examples for phrasing, verb usage, and common short descriptions; feed to the model to bias wording toward repository conventions.

### Step 3 — Draft candidates

- Draft header format exactly as:

```
{TICKET_NUMBER} {one-line-summary no trailing period}

{optional body separated by a blank line}
```

- Header rules (Chris Beams):
  - Keep subject (the text after ticket number) at or below 50 characters (prefer shorter).
  - Use the imperative mood: "Add", "Fix", "Remove", "Refactor".
  - Capitalize the first word (but do not end with a period).
  - Do not include the ticket number inside the body header line more than once.

- Body rules:
  - Use the body to explain the *why* and *what*, not the *how*.
  - Wrap lines at ~72 characters.
  - Separate header and body with a single blank line.

- Produce 2–3 candidate messages, varying brevity and detail.

### Step 4 — Validate candidates (automatic checks)

Checks to run on each candidate:
- Header begins with `{TICKET}` followed by a single space and non-empty summary.
- Header summary <= 50 characters (excluding the ticket prefix) — if longer, produce a suggested shorter variant.
- Header does not end with a period.
- There is exactly one blank line between header and body (if body exists).
- Body lines wrap at ~72 characters.
- Imperative-mood heuristic: header starts with a verb in base form (simple heuristic: first token matches common verbs like Add, Fix, Update, Remove, Revert, Refactor, Rename, Avoid, Use, Prevent, Guard, Ensure). If heuristic fails, suggest rephrasing.
- No references to secrets or tokens in message.

If a candidate fails checks, include an explanation and an auto-corrected suggestion.

### Step 5 — Present and get approval

- Show the candidates to the user with line-by-line diffs vs. the enforced rules.
- Offer choices: [Use candidate 1], [Use candidate 2], [Edit manually], [Abort].
- If the user chooses Edit manually, open an editor or accept freeform edited message.

### Step 6 — Stage files to commit

- If there are staged files (`git diff --cached --name-only` returns non-empty), propose to commit only those.
- If no staged files, list changed files (`git status --porcelain`) and ask the user to select which to include. Provide helpful heuristics:
  - Prefer files under paths referenced in investigation docs (`$INVESTIGATIONS_ROOT/{TICKET}/*`) or files modified in the same directories as previous ticket commits. Never stage files from `$INVESTIGATIONS_ROOT` itself.
  - Warn and disallow staging unrelated files by default.

- Stage chosen files: `git add {files...}`

### Step 7 — Commit

- Write chosen commit message to a temporary file (e.g., `commitmsg.txt`) and run:

```bash
git commit -F commitmsg.txt
```

- On success, show `git show --stat -1` and the commit SHA.

### Step 8 — Optional: Push and create MR/PR

- Ask the user if they want to push the branch and create a Merge Request / Pull Request.
- If yes, run `git push -u origin {branch}` and use existing repo wrappers if present (e.g., `node "$TOOLKIT_ROOT/scripts/gitlab-create-mr.js`) to create the MR. Confirm the MR URL and present it.

## Safety & Rules

- This skill is interactive and requires explicit user confirmation before making commits or pushes.
- Never include secrets, tokens, or credentials in commit messages or outputs.
- Never auto-stage or auto-commit unrelated files; always ask before staging files not part of the ticket.
- Preserve user control: show diffs and allow cancellation at every step.

## Chris Beams — Quick summary (Seven rules)

1. Separate subject from body with a blank line.
2. Limit the subject line to 50 characters.
3. Capitalize the subject line.
4. Do not end the subject line with a period.
5. Use the imperative mood in the subject line.
6. Wrap the body at 72 characters.
7. Use the body to explain what and why, not how.

Full guidance: https://chris.beams.io/git-commit#seven-rules

## Examples

```
AMBS-19436 Add null check for block period in enrollment delete

- Guard getBlockPeriod() call with a null check before cleanup
- Add debug logging for null block_periodID enrollments
```

```
MEDM-5021 Fix crash when patient has no insurance record

- Ensure code handles missing insurance gracefully by returning early
- Add a unit test covering patient with no insurance
```

## Implementation notes (for maintainers)

- This SKILL.md is intentionally self-contained; the Copilot CLI skill runner should parse the doc and follow the steps when invoked.
- The skill relies on local `git` commands to collect examples and to stage/commit/push changes.
- Keep the skill invoked only on demand so it does not load every CLI session.
- Chris Beams' seven commit-message rules are embedded in tools/ambs-metrics/gitlab-post-comment.js. That script exposes a `--show-rules` flag which prints the rules and exits (no network requests).

## Rules for the skill itself

- Confirm the commit message with the user before creating the commit.
- Use current git branch name to populate `{TICKET_NUMBER}`; if not available, ask the user.
- Use recent AMBS/MEDM commit subjects (up to 100) to bias candidate phrasing for consistency.

# End of skill
