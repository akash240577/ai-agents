# ai-agents — Copilot Instructions

GitHub Copilot agents, skills, and Node.js helper scripts for MedHub / AMBS daily dev work. This repo is the toolkit itself — not a MedHub/PHP project. All scripts are Node.js.

---

## Commands

```bash
npm install                                        # install dependencies (axios, commander, dotenv, turndown)
node scripts/<script-name>.js --help              # each script supports --help
node scripts/jira-get-ticket.js -t AMBS-1234      # example: fetch a ticket
node scripts/jira-get-ticket.js -t AMBS-1234 --json  # raw JSON output
node scripts/dd-dedup-check.js --method GET --resource "/u/f/x.mh" --error-class "TypeError" --stack-trace "..." --issue-id "uuid"
```

No test suite or linter is configured.

---

## Architecture

### Runtime path variables

Every agent and skill uses these variables:

| Variable | Resolved from |
|---|---|
| `PLUGIN_ROOT` | Set automatically by the Copilot CLI at invocation time — never hardcode or guess this |
| `PROJECT_ROOT` | `git rev-parse --show-toplevel` in the active project session |
| `INVESTIGATIONS_ROOT` | Defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override via env var if storing investigations outside the project |

`PROJECT_ROOT` can change mid-session for cross-repo tickets (medhub → app-server). The investigation workspace at `$INVESTIGATIONS_ROOT/AMBS-{TICKET}/` never changes within a ticket.

### Installation model

This repo is packaged as a GitHub Copilot CLI plugin (`plugin.json` at the root). Install it with:

```shell
copilot plugin install https://git.ascendlearning.com/ascend/medhub/utilities/ai-agents.git
```

The plugin system handles agent/skill loading automatically. No junctions, symlinks, or setup scripts needed.

### Credential loading (`lib/credentials.js`)

Scripts load credentials in this priority order:

**Jira:** env vars `JIRA_BASE_URL` / `JIRA_USER_EMAIL` / `JIRA_API_TOKEN` → `~/.copilot/.env` → `ATLASSIAN_*` env variants → `~/.copilot/mcp.json`

**GitLab:** `GITLAB_TOKEN` env var → `~/.copilot/.env` → `~/.gitlab_token`

Users place credentials in `~/.copilot/.env`. Copy `.env.template` from this repo as a starting point.

### Investigation workspace layout

```
$INVESTIGATIONS_ROOT/AMBS-{TICKET}/
├── investigation.md   # structured findings — agent writes, developer reads
├── error.md           # raw error / stack trace
├── queries.sql        # SELECT-only troubleshooting queries
├── dev-notes.md       # developer scratch pad — agent reads but NEVER writes
├── teams-comment.md   # generated Teams update
└── jira-comment.md    # generated Jira comment (ready to post)
```

---

## Key Conventions

### Skills structure

Each skill lives in `skills/<skill-name>/SKILL.md`. The frontmatter `name` and `description` fields determine when Copilot triggers the skill — be precise and comprehensive in descriptions. Skills must load instructions from `SKILL.md` and optionally from `references/` subdirectory.

### Agents vs. Skills

- **Agents** (in `agents/*.agent.md`) orchestrate multi-phase workflows by invoking skills in sequence
- **Skills** (in `skills/*/SKILL.md`) own a single phase's detailed steps
- The `ambs-debug` agent runs phases 0–7, delegating each to the appropriate skill

### Approval gates — never skip

All skills that make external or destructive changes have a mandatory gate:
- `ambs-fix-plan`: never write application code before user approves the plan
- `review-mr`: never post to GitLab without user approval
- `datadog-ticket` / `trace-to-ticket`: never create Jira ticket without user approval
- `ambs-commit-mr`: always confirm commit message before committing

### Safety rules across all skills

- All SQL must be `SELECT`-only with `LIMIT` — never modify data
- Never expose API tokens in output
- Never commit files from `$INVESTIGATIONS_ROOT` to any project repo
- Never `git push` unless the skill explicitly calls for it
- Never stage files unrelated to the current ticket

### Scripts calling convention

Skills call scripts as:
```cmd
node "$PLUGIN_ROOT/scripts/<script-name>.js" [args]
```

Scripts must be run from `$PLUGIN_ROOT` when they use relative paths to `data/` or `utils/`:
```powershell
cd "$PLUGIN_ROOT"
node scripts/dd-dedup-check.js ...
```

### Dedup fingerprinting

When computing fingerprints for `jira-clone-ticket.js`, write a temp JS file using the `create` tool — never PowerShell heredoc — because heredocs mangle backslashes in stack traces. Always delete the temp file after.

### Commit message format

```
{TICKET_NUMBER} {one-line summary in imperative mood, ≤50 chars, no trailing period}

- optional body explaining what and why
- wrap at 72 characters
```

Example: `AMBS-19436 Add null check for block period in enrollment delete`

### Fix plan multi-layer pattern

When proposing fixes, always use the multi-layer approach — never a single option:

| Layer | Purpose |
|---|---|
| 1 — Immediate safety | Guard at crash site to prevent 500s |
| 2 — Root cause fix | Fix at the producer/source |
| 3 — Data remediation | SQL to repair existing bad records |
| 4 — Prevention | DB constraint / validation / test |

Null check at crash site alone (Layer 1 without Layer 2) is never an acceptable fix for root cause categories 1–3.

### `trace-to-ticket` mandatory gates

Steps 4 (codebase investigation) and 5 (end user impact) are non-negotiable before showing the ticket preview. A ticket without concrete end user impact must not be created. Title format must be business-friendly — no raw PHP exception class names.

### `dev-notes.md` ownership

`dev-notes.md` is the developer's scratch pad. The agent reads it for context but **never writes to it**. All agent output goes to `investigation.md`.

---

## Scripts Reference

| Script | Purpose |
|---|---|
| `jira-get-ticket.js` | Fetch Jira ticket details |
| `jira-post-comment.js` | Post comment to a Jira ticket |
| `jira-create-bug.js` | Create new Jira Bug (Datadog errors) |
| `jira-clone-ticket.js` | Create Bug by cloning template AMBS-22917 |
| `gitlab-get-mr.js` | Fetch GitLab MR diff, commits, description |
| `gitlab-create-mr.js` | Create GitLab MR from current branch |
| `gitlab-post-comment.js` | Post inline review comments to GitLab MR |
| `assign-subtasks.js` | Assign dev sub-tasks, move to In Progress |
| `cleanup-subtasks.js` | Close stale dev sub-tasks as Done |
| `init-ticket.js` | Scaffold investigation workspace |
| `dd-dedup-check.js` | Check if Datadog error already has open Jira ticket |
| `confluence-fetch.js` | Download Confluence pages as Markdown to `knowledge/` |
