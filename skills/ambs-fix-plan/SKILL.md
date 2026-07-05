---
name: ambs-fix-plan
description: "Present a fix plan for an AMBS ticket and implement it after explicit user approval. Trigger phrases: 'create fix plan', 'plan the fix', 'implement the fix', 'ready to fix', 'write the fix', 'propose a solution', 'draft a fix'. Reads investigation.md, drafts the plan with risks and testing steps, gates on approval before writing any code. Requires ambs-investigate to be complete."
---

# AMBS Fix Plan

Present a fix plan for an AMBS ticket and implement it after approval. Requires investigation to be complete.

## Instructions

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override by setting `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere. `$TICKET_NUMBER` — extract from the current git branch (`git branch --show-current`) or ask the user.

The Code Analysis section of `investigation.md` must be populated — run ambs-investigate first if it shows "TBD".

### Step 1 — Load Context

1. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` — the Code Analysis and Proposed Fix sections
2. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/dev-notes.md` for additional context
3. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/error.md` for the original error

If Code Analysis is still "TBD", tell the user to run the ambs-investigate skill first.

### Step 2 — Draft the Fix Plan

Based on the investigation, prepare a fix plan covering:

1. **Root cause** — concise statement of why the error occurs
2. **Root cause category** — which of the 5 categories applies (from investigation.md Root Cause Depth; run ambs-investigate first if this block is missing)
3. **Fix location justification** — explicitly explain why the chosen file is the correct fix location, not just where the crash occurs
4. **Files to modify** — list each file with a description of what changes, organized by layer
5. **Debug logging to add** — Logger calls at strategic points (from investigation.md)
6. **Database migrations** — if any are required (usually none)
7. **Risks and side effects** — what could break, what to watch for
8. **Testing plan** — specific steps to verify the fix

### Step 2a — Depth Check (required before presenting plan)

Answer these before presenting:
- Have we traced where the bad value originates — not just where it crashes?
- Is the proposed fix at the source, or is it suppressing a symptom?
- For root cause categories 1–3: a null check at the crash site alone is NOT an acceptable fix — at minimum Layer 1 + Layer 2 are required.

If the Code Analysis Root Cause Depth block in `investigation.md` is missing or incomplete, stop and run ambs-investigate first.

### Step 3 — Present and Get Approval (REQUIRED GATE)

**Do NOT implement any code changes until the user explicitly approves.**

Present the fix plan using the **Multi-Layer Fix Pattern** (include all applicable layers):

| Layer | Purpose | Example |
|-------|---------|---------|
| 1 — Immediate safety | Guard at crash site to prevent 500s while root fix deploys | Null check + Logger::warning |
| 2 — Root cause fix | Fix at the source: the producer, entry point, or DB insert path | Fix the method that returns null when it shouldn't |
| 3 — Data remediation | SQL to repair existing bad records (required for category 2) | `UPDATE table SET col = default WHERE col IS NULL` |
| 4 — Prevention | Constraint, validation, or test to prevent recurrence | DB NOT NULL constraint, controller guard, unit test |

Present each layer as a separate section with files and code approach. Never present a single option — the layers replace the old "Option A (recommended)" format.

Then ask the user:
- **Approve** — proceed with implementation
- **Modify** — adjust the plan based on feedback

If the user requests modifications, update the plan and re-present.

### Fix Anti-Patterns — Never Propose These

- **Suppress and move on** — `try/catch` with empty body or log-only when the error can be prevented
- **Fix at symptom only** — null check at crash site without fixing the producer (Layer 1 without Layer 2)
- **Silent skip** — `if (null === $x) return;` with no logging, no upstream fix
- **Null-coalesce to wrong default** — `$x ?? 0` when 0 is semantically wrong
- **Single-option fix** — presenting only one layer when multiple are needed

### Fix Best Practices

- **Fix at source** — fix where the bad value is produced, not just consumed
- **Validate at entry** — add guards at the controller or API boundary where data enters
- **Defensive + upstream** — combine crash-site guard (Layer 1) with source fix (Layer 2)
- **Data migration** — pair code fix with SQL remediation for existing bad records (Layer 3)
- **Constraint addition** — add DB NOT NULL / FK constraint to block future bad data (Layer 4)

### Step 4 — Implement (only after approval)

Apply the code changes:
- Follow PSR-12 coding standard
- Use parameterized SQL queries (never string concatenation)
- Add the planned Logger calls using existing codebase patterns
- Handle null checks and edge cases identified in the investigation

After implementation:
- Update `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` Proposed Fix section with the actual changes made
- Update `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` Testing Plan with verification steps
- Record implementation notes in `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` (never in `dev-notes.md` — that is the developer's scratch pad)

### Step 5 — Post-Implementation

Report what was changed and suggest next steps:
- Run ambs-commit-mr skill to commit and create a GitLab merge request
- Run ambs-jira-comment skill to generate JIRA/Teams comments (after MR is created, so the MR link is available)
- Test the fix locally

### Rules

- **Never skip the approval gate** — always ask before modifying application code
- Follow MedHub coding standards from `.github/copilot-instructions.md`
- Use UTF8MB4 encoding for any database operations
- **Never commit the main workspace** — the developer commits manually
- **Never push** any repository
