# ai-agents

GitHub Copilot agents, skills, and helper scripts for MedHub / AMBS daily dev work.

Covers: ticket investigation, MR review, Jira/GitLab operations, Datadog ticket creation, and Confluence sync.

---

## Install

**HTTPS:**
```shell
copilot plugin install https://git.ascendlearning.com/ascend/medhub/utilities/ai-agents.git
```

**SSH:**
```shell
copilot plugin install git@git.ascendlearning.com:ascend/medhub/utilities/ai-agents.git
```

**Install from a local clone (e.g. unreleased branch):**

`copilot plugin install` does not support local paths. Instead, clone the branch and symlink/copy it directly into the Copilot plugin directory.

On **Windows** (PowerShell — run as Administrator for symlink support):
```powershell
# 1. Clone the branch
git clone --branch ai-agent-initial-commit https://git.ascendlearning.com/ascend/medhub/utilities/ai-agents.git "$env:USERPROFILE\workspace\ai-agents"

# 2. Create a junction (no admin rights needed) pointing to the cloned folder
$target = "$env:USERPROFILE\workspace\ai-agents"
$link   = "$env:LOCALAPPDATA\copilot\marketplaces\ai-agents-local"
New-Item -ItemType Junction -Path $link -Target $target
```

On **macOS / Linux**:
```shell
# 1. Clone the branch
git clone --branch ai-agent-initial-commit https://git.ascendlearning.com/ascend/medhub/utilities/ai-agents.git ~/workspace/ai-agents

# 2. Symlink into the Copilot plugin directory
ln -s ~/workspace/ai-agents ~/.copilot/marketplaces/ai-agents-local
```

Then install dependencies and restart Copilot:
```shell
cd ~/workspace/ai-agents   # or the Windows path above
npm install
```

> **Note:** To unlink, delete the junction/symlink folder (`$link` or the `~/.copilot/marketplaces/ai-agents-local` directory). The original clone is unaffected.

Verify:

```shell
copilot plugin list
```

---

## Credentials

Create `~/.copilot/.env` with your tokens. Copy `.env.template` from this repo as a starting point:

```env
JIRA_BASE_URL=https://ascend-learning.atlassian.net
JIRA_USER_EMAIL=your.email@ascendlearning.com
JIRA_API_TOKEN=your_api_token_here
GITLAB_BASE_URL=https://git.ascendlearning.com
GITLAB_TOKEN=your_gitlab_token_here
```

- **Jira API token:** Jira → Profile → Security → [API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- **GitLab token:** GitLab → User → Preferences → Access Tokens (scope: `api`)

Scripts load from `~/.copilot/.env` first, then fall back to env vars and `~/.copilot/mcp.json`.

---

## Investigations folder

Investigation workspaces are created automatically inside your project at `docs/ambs-investigations/` — **no configuration needed**.

```
{PROJECT_ROOT}/docs/ambs-investigations/
└── AMBS-{TICKET}/
    ├── investigation.md    ← root cause, findings, steps to reproduce
    ├── error.md            ← raw error / stack trace
    ├── queries.sql         ← SELECT-only troubleshooting queries
    ├── dev-notes.md        ← developer scratch pad (agent reads, never writes)
    ├── teams-comment.md    ← generated Teams update
    └── jira-comment.md     ← generated Jira comment (ready to post)
```

> **Tip:** Add `docs/ambs-investigations/` to your project's `.gitignore` so investigation files are never accidentally committed.

**Custom path (optional):** If you want investigations stored outside the project (e.g. shared across repos), set `INVESTIGATIONS_ROOT` in `~/.copilot/.env`:

```env
INVESTIGATIONS_ROOT=/path/to/shared/investigations
```

---

## After install

Skills and agents load automatically. Type `/` in Copilot to see `/ambs-debug-workspace`, `/ambs-investigate`, etc.

> **First use:** The plugin auto-installs Node.js dependencies via `hooks.json` on first session start. If a script fails with `Cannot find module`, run `npm install` inside the plugin directory (`copilot plugin list` shows the path).

---

## Updating

```shell
copilot plugin update ai-agents
```

`~/.copilot/.env` is never touched by updates.

---

## Plugin management

```shell
copilot plugin list                  # list installed plugins
copilot plugin update ai-agents      # update to latest
copilot plugin disable ai-agents     # disable without uninstalling
copilot plugin uninstall ai-agents   # remove completely
```

---

## Agents

### `ambs-debug`
End-to-end debugging workflow for AMBS/MedHub tickets. Runs 8 phases in sequence, each delegated to a dedicated skill:

| Phase | Skill | What it does |
|-------|-------|-------------|
| 0 | — | Resolve `PLUGIN_ROOT`, `PROJECT_ROOT`, `INVESTIGATIONS_ROOT` |
| 1 | `ambs-debug-workspace` | Create git branch, scaffold investigation folder, move sub-tasks to In Progress |
| 2 | `ambs-investigate` | Parse error, search codebase, consult docs, document findings |
| 3 | `ambs-debug-sql` | Generate read-only SQL queries *(DB errors only)* |
| 4 | `ambs-fix-plan` | Draft multi-layer fix plan, gate on user approval, implement |
| 5 | `ambs-commit-mr` | Stage files, confirm commit message, push, create GitLab MR |
| 6 | `ambs-jira-comment` | Generate `jira-comment.md` and optionally `teams-comment.md` |
| 7 | `ambs-close-subtasks` | Transition dev sub-tasks to Done *(conditional)* |

**Trigger:** "debug ticket AMBS-XXXXX", "investigate error in AMBS-XXXXX", "set up debugging for AMBS-XXXXX"

---

### `datadog-ticket (Not Maintained)`
Creates a well-formatted JIRA Bug ticket on the AMBS board from a Datadog error description. Parses endpoint, stack trace, occurrence count and window; generates an ADF-formatted description; previews for approval; then creates via the JIRA REST API.

**Trigger:** "create a datadog ticket", "datadog ticket for this error", "new datadog ticket"

---

## Skills

| Skill | What it does |
|-------|-------------|
| `/ambs-debug-workspace` | Creates git branch, scaffolds `$INVESTIGATIONS_ROOT/{TICKET}/`, moves dev sub-tasks to In Progress |
| `/ambs-investigate` | Parses stack trace, searches codebase, consults project docs and platform knowledge, builds root cause hypothesis, documents findings in `investigation.md` |
| `/ambs-debug-sql` | Generates read-only `SELECT` troubleshooting queries with `LIMIT` clauses for database-related errors; writes to `queries.sql` |
| `/ambs-fix-plan` | Drafts a multi-layer fix plan (crash-site guard → root cause fix → data remediation → prevention); gates on explicit user approval before writing any code |
| `/ambs-commit-mr` | Stages only ticket-related files, confirms commit message with the user, pushes, and creates a GitLab MR |
| `/ambs-jira-comment` | Generates `jira-comment.md` (structured JIRA sections) from investigation findings; generates `teams-comment.md` only when explicitly requested |
| `/ambs-close-subtasks` | Transitions the three dev sub-tasks (Dev Investigation, Code Changes, Dev Testing) to Done |
| `/datadog-ticket` | Creates a JIRA Bug ticket on the AMBS board from a Datadog error description (ADF-formatted, previewed before creation) |
| `/trace-to-ticket` | Given a Datadog trace URL, fetches trace details, checks for Jira duplicates, investigates the codebase entry point, derives end-user impact, and clones the AMBS ticket template |
| `/review-mr` | Reviews a GitLab MR against a PHP 8.x checklist and Jira acceptance criteria; posts inline comments with severity ratings after user approval |
| `/git-commit` | Drafts 2–3 commit message candidates following Chris Beams' seven rules; validates and commits after user confirmation |
| `/db-download` | Downloads a named site's production database into the local Docker environment (`mh-php-fpm` container) |
| `/analyze-dd-tickets` | Root cause analysis for Datadog ticket clusters: correlates errors with PHP files and git history, classifies root causes, and recommends phpstan rules, unit tests, and process improvements |
| `/medhub-integration-test` | Generates PHPUnit integration tests for MedHub PHP controllers, services, domain models, gateways, and legacy `.mh` includes that run against a real MariaDB test database |
| `/medhub-phpunit` | Writes and runs PHPUnit unit tests for the MedHub PHP monolith inside the `mh-php-fpm` Docker container; covers mocking the Database wrapper, Reflection for private state, and test placement conventions |
| `/microsoft-skill-creator` | Creates GitHub Copilot skills for any Microsoft technology by deep-searching the Microsoft Learn docs (MCP server or `mslearn` CLI) and generating a self-contained `SKILL.md` with local knowledge and dynamic search guidance |

---

## Scripts

Scripts in `scripts/` are called automatically by skills via `$PLUGIN_ROOT`. They can also be run directly from the plugin directory:

| Script | What it does |
|--------|-------------|
| `jira-get-ticket.js` | Fetch a Jira ticket's summary, description, status, and sub-tasks |
| `jira-post-comment.js` | Post a comment to a Jira ticket |
| `jira-create-bug.js` | Create a new Jira Bug (Datadog error → AMBS ticket) |
| `jira-clone-ticket.js` | Create a Jira Bug by cloning a template ticket |
| `gitlab-get-mr.js` | Fetch a GitLab MR's diff, commits, and description |
| `gitlab-create-mr.js` | Create a GitLab MR from the current branch |
| `gitlab-post-comment.js` | Post inline review comments to a GitLab MR |
| `assign-subtasks.js` | Assign dev sub-tasks and move them to In Progress |
| `cleanup-subtasks.js` | Close stale dev sub-tasks as Done |
| `init-ticket.js` | Scaffold an investigation workspace |
| `dd-dedup-check.js` | Check if a Datadog error already has an open Jira ticket |
| `confluence-fetch.js` | Download Confluence pages as Markdown into `knowledge/` |
| `setup-permissions.js` | Configure Copilot's access to the investigations folder |

Run scripts from inside the plugin directory: `cd "$PLUGIN_ROOT" && node scripts/<script>.js [args]`

---

## Troubleshooting

**`Cannot find module 'axios'`**
```shell
copilot plugin list        # find plugin path
cd <plugin-path>
npm install
```

**Skills not appearing**
Ensure plugin is enabled: `copilot plugin list`. Restart Copilot after install.

**`JIRA_API_TOKEN is undefined`**
Check `~/.copilot/.env` — confirm the key exists and has no spaces around `=`.

**`INVESTIGATIONS_ROOT` path issues**
The default `docs/ambs-investigations/` inside the project is created automatically. If you have set a custom `INVESTIGATIONS_ROOT` in `~/.copilot/.env`, ensure the directory exists.

**Access denied writing to `$INVESTIGATIONS_ROOT`**
```shell
node "$PLUGIN_ROOT/scripts/setup-permissions.js" "$INVESTIGATIONS_ROOT"
```

---

## Repo structure

```
ai-agents/
├── plugin.json          ← plugin manifest
├── hooks.json           ← sessionStart hook (auto npm install)
├── .env.template        ← copy to ~/.copilot/.env and fill in values
├── agents/              ← agent definitions (ambs-debug, datadog-ticket)
├── skills/              ← one folder per skill
├── scripts/             ← Node.js helpers
├── lib/                 ← shared credential + env loader
├── utils/               ← shared utilities (csv, http, logger)
└── knowledge/           ← Confluence page exports
```
