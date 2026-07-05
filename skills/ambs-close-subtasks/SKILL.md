---
name: ambs-close-subtasks
user-invocable: false
description: "Close the standard dev sub-tasks (Dev Investigation, Code Changes, Dev Testing) on an AMBS ticket with resolution Done. Use after the fix is implemented, tested, and ready for merge."
---

# AMBS Close Sub-Tasks

Close the standard dev sub-tasks (Dev Investigation, Code Changes, Dev Testing) on an AMBS ticket with resolution "Done".

## Instructions

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `$TICKET_NUMBER` — extract from the current git branch (`git branch --show-current`) or ask the user.

Run only after the fix is committed and the MR is created.

Credentials are loaded automatically from `~/.copilot/.env`.

### Step 1 — Identify the Ticket

Determine the ticket number from:
1. Current git branch name (e.g., `AMBS-19436`)
2. Or `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` if the workspace exists — read it to confirm the ticket
3. Or ask the user if neither is available

### Step 2 — Close Sub-Tasks

Run the cleanup script:

```cmd
node "$PLUGIN_ROOT/scripts/cleanup-subtasks.js -t {TICKET_NUMBER}
```

This command handles everything: reads JIRA credentials, finds the Dev Investigation /
Code Changes / Dev Testing sub-tasks assigned to the current user, and transitions each to Done.

Review the output and report which sub-tasks were closed and which (if any) were already
closed or not found.

### Rules

- **Never expose API tokens** in output
- Only close the three named sub-tasks — do not touch other sub-tasks
- If a sub-task is already in a closed/done state, skip it and note that in the report
