# ambs-toolkit

GitHub Copilot agents, skills, and helper scripts for MedHub / AMBS daily dev work.

Covers: ticket investigation, MR review, Jira operations, GitLab operations, Datadog ticket creation, and Confluence knowledge sync.

---

## Folder Structure

```
~/.copilot/                        ← exists after Copilot install; setup adds symlinks/junctions inside
  ├── agents/ ──symlink/junction──►  ~/your-path/ambs-toolkit/agents/
  └── skills/ ──symlink/junction──►  ~/your-path/ambs-toolkit/skills/

~/your-path/ambs-toolkit/    ← the toolkit folder (OneDrive-synced)
    ├── agents/              Agent definitions (ambs-debug, datadog-ticket)
    ├── skills/              Skill definitions — one folder per skill
    ├── scripts/             Node.js Jira / GitLab helpers
    ├── lib/                 Shared credential loader
    ├── utils/               Shared utilities (csv, http, logger)
    ├── knowledge/           Confluence page exports — platform-wide docs
    ├── .env                 Your credentials + INVESTIGATIONS_ROOT (gitignored)
    └── .env.template        Copy this to .env and fill in values

~/your-path/ambs-investigations/     ← set INVESTIGATIONS_ROOT in .env to point here
    └── AMBS-{TICKET}/               ← one folder per ticket, created by ambs-debug-workspace
        ├── investigation.md         ← root cause, findings, steps to reproduce
        ├── error.md                 ← raw error / stack trace
        ├── queries.sql              ← SELECT-only troubleshooting queries
        ├── dev-notes.md             ← running notes, hypotheses, decisions
        ├── teams-comment.md         ← generated Teams chat update
        └── jira-comment.md          ← generated JIRA comment (ready to post)

~/your-path/medhub/                  ← PROJECT_ROOT when debugging medhub tickets
    └── docs/
        ├── features/    Feature behavior docs (medhub-specific)
        ├── database.md  Schema reference
        └── architecture/ System structure docs

~/your-path/support/                 ← PROJECT_ROOT when debugging support tickets
    └── docs/features/               ← support-specific feature docs

~/your-path/app-server/              ← PROJECT_ROOT when debugging app-server tickets
    └── docs/features/
```

**Key design principle:** Investigation workspaces live in `ambs-investigations/` — outside all project repos. This means a single ticket that spans medhub, support, and app-server shares one `investigation.md` regardless of which project session you're currently in.

---

## Path Variables

Every agent and skill uses three runtime variables resolved once at session start:

| Variable | Resolved from | Example |
|----------|--------------|---------|
| `TOOLKIT_ROOT` | Follow `~/.copilot/agents` symlink/junction back to the toolkit folder | `~/workspace/ambs-toolkit` |
| `PROJECT_ROOT` | `git rev-parse --show-toplevel` in the active session | `~/workspace/medhub` |
| `INVESTIGATIONS_ROOT` | `INVESTIGATIONS_ROOT=` line in `$TOOLKIT_ROOT/.env` | `~/workspace/ambs-investigations` |

`PROJECT_ROOT` can switch mid-session for cross-repo tickets (e.g., start in medhub, then investigate the app-server side). The workspace in `INVESTIGATIONS_ROOT` never changes within a ticket session.

---

## Prerequisites

- Node.js v18+
- GitHub Copilot CLI
- Jira API token ([Jira → Profile → Security → API Token](https://id.atlassian.com/manage-profile/security/api-tokens))
- GitLab personal access token (GitLab → User → Preferences → Access Tokens, scopes: `api`)

---

## One-time Setup (per machine)

### Step 1 — Copy the toolkit

Copy the `ambs-toolkit/` folder from the shared OneDrive location to anywhere on your machine (e.g. `~/workspace/ambs-toolkit/`).

### Step 2 — Run the setup script

The setup script copies `.env.template` → `.env` inside `ambs-toolkit/`, writes `TOOLKIT_ROOT` into that `.env`, runs `npm install`, creates `~/.copilot/` as a real directory, then creates sub-junctions inside it for `agents/` and `skills/`.

**macOS / Linux:**
```bash
cd ~/workspace/ambs-toolkit
bash setup.sh
```

**Windows (run as Administrator for junction creation):**
```powershell
cd "$env:USERPROFILE\workspace\ambs-toolkit"
.\setup.ps1
```

#### Manual symlink / junction (if you prefer not to run the script)

**macOS / Linux:**
```bash
mkdir -p ~/.copilot
ln -s ~/workspace/ambs-toolkit/agents ~/.copilot/agents
ln -s ~/workspace/ambs-toolkit/skills ~/.copilot/skills
```

**Windows (Command Prompt, run as Administrator):**
```cmd
mkdir "%USERPROFILE%\.copilot"
mklink /J "%USERPROFILE%\.copilot\agents" "%USERPROFILE%\workspace\ambs-toolkit\agents"
mklink /J "%USERPROFILE%\.copilot\skills" "%USERPROFILE%\workspace\ambs-toolkit\skills"
```

Verify it worked:
```bash
# macOS / Linux
ls -la ~/.copilot

# Windows
dir %USERPROFILE%\.copilot
```

### Step 3 — Fill in credentials and paths

Open `ambs-toolkit/.env` — it was created from the template by setup. Fill in every field:

```
TOOLKIT_ROOT=/path/to/ambs-toolkit   ← auto-written by setup, do not change
JIRA_BASE_URL=https://ascend-learning.atlassian.net
JIRA_USER_EMAIL=your.email@ascendlearning.com
JIRA_API_TOKEN=<your token>          # Jira → Profile → Security → API Token
GITLAB_TOKEN=<your token>            # GitLab → User → Preferences → Access Tokens (scope: api)
INVESTIGATIONS_ROOT=~/workspace/ambs-investigations   ← edit if you want a different path
```

This is the only `.env` file — scripts and agents both read it.

### Step 4 — Create the investigations folder

Create the folder you set as `INVESTIGATIONS_ROOT`. It lives outside all project repos and is never committed.

**macOS / Linux:**
```bash
mkdir -p ~/workspace/ambs-investigations
```

**Windows:**
```cmd
mkdir "%USERPROFILE%\workspace\ambs-investigations"
```

If you keep your projects somewhere other than `~/workspace/`, use that path instead.

### Step 5 — Restart GitHub Copilot

Agents and skills appear automatically after restart. Confirm by typing `/` in GitHub Copilot — you should see `/ambs-debug-workspace`, `/ambs-investigate`, etc. in the list.

---

## Cross-Repo Debugging

Some tickets span multiple repos. For example, a "Schedule Timesheet" bug might involve:

```
app-server/  ← cron populates raw timesheet data
    ↓
database     ← shared tables
    ↓
medhub/      ← UI reads and displays timesheet
```

The `ambs-debug` agent handles this automatically:

1. **Start in the repo where the error surfaces** (e.g., trigger from a medhub session)
2. **Phase 0** resolves `PROJECT_ROOT=~/workspace/medhub` and creates the workspace at `$INVESTIGATIONS_ROOT/AMBS-{TICKET}/`
3. When you need to investigate the app-server side, tell the agent: *"Now investigate the app-server side"*
4. The agent updates `PROJECT_ROOT=~/workspace/app-server` — feature docs and codebase searches switch to app-server
5. The investigation workspace (`investigation.md`, `dev-notes.md`) stays at the same path throughout — findings from both repos accumulate in one place

---

## Allowing Access to the Investigations Folder

Access to `$INVESTIGATIONS_ROOT` is configured during setup (`setup.sh` / `setup.ps1`). The setup script writes the necessary permissions so Copilot can read and write investigation workspace files without prompting you each time.

If you see access-denied errors when the agent tries to read or write `$INVESTIGATIONS_ROOT`, re-run the setup script — it will reconfigure the permissions with the correct path.

No project location config is needed — `PROJECT_ROOT` is resolved automatically at session time via `git rev-parse --show-toplevel`.

---

## Scripts

Scripts live in `ambs-toolkit/scripts/` and are called automatically by skills using `$TOOLKIT_ROOT`. They can also be run directly (substitute the actual path for `$TOOLKIT_ROOT`):

| Script | What it does | Example |
|--------|-------------|---------|
| `jira-get-ticket.js` | Fetch a Jira ticket's summary, description, status, and sub-tasks | `node "$TOOLKIT_ROOT/scripts/jira-get-ticket.js" AMBS-1234` |
| `jira-post-comment.js` | Post a comment to a Jira ticket from a file or inline text | `node "$TOOLKIT_ROOT/scripts/jira-post-comment.js" -t AMBS-1234 -f comment.md` |
| `jira-create-bug.js` | Create a new Jira Bug ticket (Datadog error → AMBS ticket) | `node "$TOOLKIT_ROOT/scripts/jira-create-bug.js" --summary "Datadog - X" ...` |
| `jira-clone-ticket.js` | Create a Jira Bug by cloning a template ticket | `node "$TOOLKIT_ROOT/scripts/jira-clone-ticket.js" --template AMBS-22917 ...` |
| `gitlab-get-mr.js` | Fetch a GitLab MR's diff, commits, and description | `node "$TOOLKIT_ROOT/scripts/gitlab-get-mr.js" --mr <url> --diff --commits` |
| `gitlab-create-mr.js` | Create a GitLab MR from the current branch | `node "$TOOLKIT_ROOT/scripts/gitlab-create-mr.js" --project 1234 --source AMBS-9999 ...` |
| `gitlab-post-comment.js` | Post a summary and/or inline review comments to a GitLab MR | `node "$TOOLKIT_ROOT/scripts/gitlab-post-comment.js" --mr <url> -f review.md ...` |
| `assign-subtasks.js` | Assign dev sub-tasks on a ticket and move them to In Progress | `node "$TOOLKIT_ROOT/scripts/assign-subtasks.js" --ticket AMBS-1234` |
| `cleanup-subtasks.js` | Close stale dev sub-tasks as Done | `node "$TOOLKIT_ROOT/scripts/cleanup-subtasks.js" --ticket AMBS-1234` |
| `init-ticket.js` | Scaffold an investigation workspace at `$INVESTIGATIONS_ROOT/{TICKET}/` | `node "$TOOLKIT_ROOT/scripts/init-ticket.js" AMBS-1234 --dir "$INVESTIGATIONS_ROOT"` |
| `dd-dedup-check.js` | Check if a Datadog error already has an open Jira ticket | `node "$TOOLKIT_ROOT/scripts/dd-dedup-check.js" --method GET --resource "/u/f/x.mh" ...` |
| `confluence-fetch.js` | Download Confluence pages as Markdown into `knowledge/confluence/` | `node "$TOOLKIT_ROOT/scripts/confluence-fetch.js"` |

---

## Skills

| Skill | What it does |
|-------|-------------|
| `/ambs-debug-workspace` | Creates git branch, scaffolds `$INVESTIGATIONS_ROOT/{TICKET}/`, moves sub-tasks to In Progress |
| `/ambs-investigate` | Reads codebase + project docs + platform knowledge, traces the error, builds root cause hypothesis |
| `/ambs-debug-sql` | Generates read-only SELECT queries for database issues |
| `/ambs-fix-plan` | Drafts a fix plan; requires explicit user approval before any code changes |
| `/ambs-commit-mr` | Stages ticket-related files, confirms commit message, pushes, creates GitLab MR |
| `/ambs-jira-comment` | Generates Teams + Jira comments from investigation; optionally posts to Jira |
| `/ambs-close-subtasks` | Closes the three dev sub-tasks (Dev Investigation, Code Changes, Dev Testing) as Done |
| `/datadog-ticket` | Creates a Jira Bug ticket from a Datadog error description |
| `/trace-to-ticket` | Given a Datadog trace URL, deduplicates, investigates, and clones AMBS-22917 as a new ticket |
| `/review-mr` | Reviews a GitLab MR against a PHP 8.x checklist and the Jira acceptance criteria |
| `/git-commit` | Crafts a well-formatted git commit message |
| `/db-download` | Downloads a site's production database into the local Docker environment |
| `/humanizer` | Rewrites technical text for a non-technical audience |

---

## Credentials

All scripts read credentials from (in order):
1. `ambs-toolkit/.env` — loaded automatically by scripts via relative path (`../` from `scripts/`)
2. Environment variables (`JIRA_API_TOKEN`, `GITLAB_TOKEN`, etc.)

`.env` is gitignored and never committed — each user has their own copy.

---

## Getting Updates

When the shared OneDrive folder updates, your local copy syncs automatically (if OneDrive is running). No reinstall needed — the `~/.copilot` junction already points to this folder.

---

## Troubleshooting

**"Cannot find module '../lib/credentials'"**
Run `npm install` inside this folder.

**"~/.copilot/agents (or skills) not linked"**
Re-run `setup.sh` (macOS/Linux) or `setup.ps1` (Windows), or create them manually:

macOS/Linux:
```bash
mkdir -p ~/.copilot
ln -s ~/workspace/ambs-toolkit/agents ~/.copilot/agents
ln -s ~/workspace/ambs-toolkit/skills ~/.copilot/skills
```
Windows (Admin CMD):
```cmd
mkdir "%USERPROFILE%\.copilot"
mklink /J "%USERPROFILE%\.copilot\agents" "%USERPROFILE%\workspace\ambs-toolkit\agents"
mklink /J "%USERPROFILE%\.copilot\skills" "%USERPROFILE%\workspace\ambs-toolkit\skills"
```

**"JIRA_API_TOKEN is undefined"**
Open `.env` and confirm `JIRA_API_TOKEN` is set. The `.env` must be in this folder (not the project root).

**"INVESTIGATIONS_ROOT is not set"**
Open `ambs-toolkit/.env` and fill in `INVESTIGATIONS_ROOT=<path to your investigations folder>`. Create that folder if it doesn't exist yet.

**Skills not appearing in GitHub Copilot**
Restart GitHub Copilot after setup. Confirm `~/.copilot/skills/` contains the skill folders.
