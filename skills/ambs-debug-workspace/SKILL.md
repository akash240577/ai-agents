---
name: ambs-debug-workspace
argument-hint: "<AMBS-XXXXX>  [error description]"
description: "Set up a structured investigation workspace for an AMBS ticket. Trigger phrases: 'set up workspace for AMBS-XXXXX', 'create investigation folder', 'start new ticket', 'init ticket workspace', 'workspace for [ticket]', 'create debug folder'. Creates git branch, scaffolds $INVESTIGATIONS_ROOT/{TICKET}/ with investigation.md, error.md, queries.sql, dev-notes.md, and moves dev sub-tasks to In Progress."
---

# AMBS Debug Workspace

Set up a structured investigation workspace for an AMBS ticket. Provide the ticket number and error details.

## Instructions

Parse user input to extract the ticket number (e.g., `AMBS-19205`) and any error description provided after it.

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override by setting `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere. Credentials are loaded automatically from `~/.copilot/.env`.

### Step 1 — Git Branch

1. Check current branch: `git branch --show-current`
2. If NOT already on the ticket branch:
   - Ask the user if they want to switch branches (they may be working on something else)
   - If yes: `git checkout main && git pull && git checkout -b {TICKET_NUMBER}`
3. Confirm the active branch

### Step 2 — Create Investigation Folder via CLI

Use the init-ticket script, passing `$INVESTIGATIONS_ROOT` so the workspace lands in the configured investigations folder:

```cmd
node "$PLUGIN_ROOT/scripts/init-ticket.js {TICKET_NUMBER} --dir "$INVESTIGATIONS_ROOT" --error "{ERROR_DESCRIPTION}"
```

If there is no error text yet:

```cmd
node "$PLUGIN_ROOT/scripts/init-ticket.js {TICKET_NUMBER} --dir "$INVESTIGATIONS_ROOT"
```

This creates/updates `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/` with `investigation.md`, `error.md`, `queries.sql`, and `dev-notes.md`.

### Step 3 — Move Sub-Tasks to In Progress

Assign the standard dev sub-tasks to the current user and move them to In Progress:

```cmd
node "$PLUGIN_ROOT/scripts/assign-subtasks.js -t {TICKET_NUMBER}
```

This command handles everything in one step:
reads JIRA credentials, finds the Dev Investigation / Code Changes / Dev Testing sub-tasks,
assigns them to the authenticated user, and transitions each to In Progress.

Review the output and confirm which sub-tasks were updated. If any were missing (not yet
created on the ticket), note that for the user.

### Step 4 — Confirm

Report what was created and suggest next steps:
- Run ambs-investigate skill to analyze the error
- Or paste additional error details / stack traces

### Rules

- **Never commit investigation files to the main project repo** — the workspace at `$INVESTIGATIONS_ROOT/` is separate from the project repo; never stage or push these files via the main project repo / fix MR
- **Never push** any repository
- All investigation file paths use `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/` — defaults to `$PROJECT_ROOT/docs/ambs-investigations/{TICKET_NUMBER}/`; override via `INVESTIGATIONS_ROOT` in `~/.copilot/.env` if needed
