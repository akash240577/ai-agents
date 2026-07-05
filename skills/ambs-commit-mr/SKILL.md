---
name: ambs-commit-mr
user-invocable: false
description: "Commit ticket-related file changes and create a GitLab merge request. Stages only files belonging to the current AMBS ticket, confirms commit message with the user, pushes, and creates the MR. Use after the fix is implemented and tested."
---

# AMBS Commit & Create Merge Request

Commit only the files related to the current AMBS ticket and create a GitLab merge request. Never commit unrelated changes.

## Instructions

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override by setting `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere. `$TICKET_NUMBER` — extract from the current git branch (`git branch --show-current`) or ask the user.

The fix must be implemented and locally tested before running this skill.

Credentials are loaded automatically from `~/.copilot/.env`.

### Step 1 — Identify the Ticket

Determine the ticket number from:
1. Current git branch name (e.g., `AMBS-19436`)
2. Or ask the user if the branch name doesn't contain a ticket number

### Step 2 — Load Investigation Context

If `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/` exists, read these files for context:
- `investigation.md` — affected components, proposed fix, files changed
- `dev-notes.md` — findings, decisions, implementation notes

Use the **Affected Components** and **Proposed Fix** sections to understand which files are part of this fix.

### Step 3 — Review Changed Files

```bash
git status --short
```

Cross-reference changed files against the investigation docs. **Carefully identify** which files belong to this ticket's fix. Ask the user to confirm if any file's relationship to the ticket is unclear.

**Never stage files that are unrelated** to the current ticket (other feature work, config changes, unrelated formatting, etc.).

### Step 4 — Stage Ticket-Related Files

```bash
git add {FILE_1} {FILE_2} ...
```

Only add the files confirmed as part of this fix.

### Step 5 — Compose and Confirm Commit Message

Format: `{TICKET_NUMBER} <one-liner change description>`

For simple changes:
```
AMBS-22260 Fix advisees check to use correct variable and native count()
```

For complex changes, add detail lines after a blank line:
```
AMBS-19408 Fix enrollment load to handle null block_period gracefully

- Guard Model::get() return before dereferencing in EnrollmentService::load()
- Logger::warning for records where block_periodID is null to track data cleanup needs
- Null originates in legacy import — data remediation SQL in queries.sql
```

**Present the commit message to the user for confirmation before committing.**

### Step 6 — Commit

```bash
git commit -m "{APPROVED_COMMIT_MESSAGE}"
```

### Step 7 — Push Branch

```bash
git push -u origin {TICKET_NUMBER}
```

### Step 8 — Create GitLab Merge Request

Use the `node "$PLUGIN_ROOT/scripts/gitlab-create-mr.js` wrapper. It uses
`GITLAB_BASE_URL` and `GITLAB_TOKEN` from `~/.copilot/.env`.

```cmd
node "$PLUGIN_ROOT/scripts/gitlab-create-mr.js --project {PROJECT_ID} --source {TICKET_NUMBER} --title "{TICKET_NUMBER} {ONE_LINE_DESCRIPTION}"
```

The `{PROJECT_ID}` must be the numeric GitLab project ID. Determine it from:
- The git remote URL: `git remote get-url origin` (then look up the project in GitLab UI → Settings → General)
- Or ask the user if unknown

### Step 9 — Report Result

```
✅ Committed and pushed {TICKET_NUMBER}
🔗 {MR_URL}
```

Provide the MR URL so the user can add it to the JIRA comment (Assets / Branch section).

## Rules

- **Never commit unrelated files** — only stage files belonging to this ticket's fix
- **Never expose tokens** in output
- **Always confirm the commit message** with the user before committing
- The `{PROJECT_ID}` must be determined from the git remote URL or asked from the user
- If `git push` fails (e.g., branch already exists on remote), diagnose and inform the user rather than force-pushing
