---
name: analyze-dd-tickets
description: "Root cause analysis for AMBS Datadog ticket clusters. Reads a dd-analysis JSON file produced by the ambs-metrics `npm run dd-analyze` script, locates the PHP files involved in each error group, runs git log to correlate with recent commits and AMBS ticket changes, applies the Blast-Radius / Recency / Dependency / Ghost-Config / Incident risk patterns against git history, then recommends process improvements (phpstan rules, unit/integration tests, lint) to prevent recurrence. Use when the user has run dd-analyze on the ambs-metrics machine and wants to understand WHY errors are firing and how to reduce them systematically."
---

# Analyze DD Tickets

Root cause analysis for Datadog ticket clusters — links each error group to PHP code, git history, and process improvement recommendations.

## Instructions

### Prerequisites

- The `dd-analysis-{date}.json` file produced by `npm run dd-analyze` in the ambs-metrics repo
- The relevant codebases checked out locally under `~/workspace/` (the PHP source files)
- Access to run `git log` in each codebase repo

> **Datadog errors span more than one repo.** Not all work lives in `medhub`. The stack-trace host path in each ticket tells you which service the error came from — resolve the correct repo under `~/workspace/` per error group (Step 1b) before running any git command. Run every `git` command **inside that repo**, never assuming a single tree. This skill only *reads* git history (`git log` / `git show`); it does not commit, push, or edit code in any repo.

### Step 1 — Read the JSON

Load the file at the path the user provided. Report:
- Total tickets, open/closed/canceled/regression counts (from `summary`)
- Top 5 error groups by `impactScore` from `errorGroups[]`

Each `errorGroups[]` entry carries CSV-derived signals you will confirm against git:
- `resourcePaths` — in-repo PHP/`.mh` paths pulled from the stack trace (use these to locate files)
- `sampleStack` — first frames of a representative trace
- `vendorPackages` — third-party packages seen in the trace (**Dependency** pattern)
- `vendorOriginated` — count of tickets thrown *inside* a vendor library
- `folderSpread` — number of distinct app modules the trace touches (**Blast-Radius** proxy)
- `configSignals` — config/setting/env/migration/secret keywords (**Ghost-Config** pattern)
- `incidentRefs` — incident references found in the ticket body (**Incident** pattern)

The top-level `riskPatterns` object pre-ranks tickets for each pattern: `blastRadius`, `dependencyPackages`, `vendorOriginated`, `ghostConfig`, `incidents`.

Ask the user: "Which groups should I prioritize, or should I analyse all of them?"

### Step 1b — Resolve the Repo for Each Error Group

A Datadog error can originate in any of several MedHub services, each its own git repo under `~/workspace/`. Before locating files or running git, map the group's stack-trace path to the right repo. The **host path prefix** in `resourcePaths` / `sampleStack` (and the raw description) identifies the service:

| Stack-trace host path | Service | Repo under `~/workspace/` |
|---|---|---|
| `/home/mhdeploy/releases/main/releases/<stamp>/app|public|vendor/…` | Main MedHub app (monorepo) | `~/workspace/medhub` |
| `/home/sites/medhub_support/…` | Support service | `~/workspace/support` (confirm name) |
| `/home/sites/medhub_<client>_apps/…` (maize, blue, green, community, …) | Per-client "apps" deployment of the support/apps codebase | same apps repo (confirm name) |

Resolution procedure:

```bash
# 1. See what is actually checked out
ls ~/workspace

# 2. Strip the deploy stamp to get the in-repo path, then match the host prefix above
#    to a directory in ~/workspace. Set REPO for the commands in later steps:
REPO=~/workspace/medhub          # or ~/workspace/support, etc. — per error group
```

- The local directory names may not match the host path verbatim. **Match by `ls ~/workspace`**, not by guessing.
- If a group's path doesn't map cleanly to a checked-out repo, **ask the user which repo it belongs to** rather than assuming `medhub`.
- A single analysis run can touch multiple repos — track which `REPO` each group resolved to and use it consistently in Steps 2, 3, and 6.

### Step 2 — Locate PHP Files (per group)

For each error group in `errorGroups[]`:

1. Extract `resourcePaths` and `sampleSummary`
2. Derive the PHP filename (search inside the repo resolved in Step 1b):
   - `/u/a/evaluations_faculty.mh` → search for `evaluations_faculty.mh` or `evaluations_faculty.php`
   - Use: `find "$REPO" -name "evaluations_faculty*" -not -path "*/node_modules/*"`
3. Read the file. Find the function or class method mentioned in the stack trace (`sampleSummary` often contains the method name or the file path frame)
4. Read the relevant function body — understand what it does, what inputs it expects, where the failure condition arises

**Do not add null guards, try-catch wrappers, or error suppression.** The goal is to understand the root cause, not mask it.

### Step 3 — Git History Correlation

For each PHP file identified — **run inside the repo resolved in Step 1b** (`git -C "$REPO" …` so the history is from the correct service, not whichever repo you happen to be in):

```bash
# Recent commits on this file
git -C "$REPO" log --oneline --follow -20 -- <file-path>

# AMBS ticket references touching this file
git -C "$REPO" log --oneline --grep="AMBS-" -- <file-path>

# Commits around the date of the first Jira ticket in this group
git -C "$REPO" log --oneline --after="<created-date minus 2 weeks>" --before="<created-date plus 1 week>" -- <file-path>
```

Note:
- Was this a recent change? What ticket drove it?
- Does a PHP 8 migration commit appear near the error onset?
- Did a feature ticket (AMBS-XXXX) introduce the change that exposed the error path?

Report the relevant commit hashes and summaries alongside the analysis.

### Step 3b — Risk Pattern Analysis (git-confirmed)

The JSON gives CSV-derived *signals*; this step confirms each pattern against git history. Run these for the files in each prioritized group.

**🧨 Blast Radius** — how many modules/folders the *fix* commit touched. Tight coupling makes bugs likely.
```bash
# Find the commit that introduced/changed this code path, then measure its spread:
git show --stat <commit>                       # files + dirs touched in one commit
git log --oneline --grep="AMBS-<key>"          # locate the feature/fix commit for a ticket
```
- The JSON `folderSpread` is the trace-based proxy. Confirm with the real commit: if a single feature commit changed 8–10+ files across unrelated folders, flag the architecture as too tightly coupled and recommend splitting the change / adding seams + tests around the boundary.

**🕰️ Recency** — was legacy code modified? Editing a file untouched for years is high-risk and needs extra review.
```bash
git log -1 --format="%ci" -- <file>            # when the file was last touched before the change
git log --follow --format="%ci" -- <file> | tail -1   # when it was first created
```
- Compute the gap between the file's prior commit and the bug-introducing commit. A large gap (e.g. >1–2 years dormant, then edited) → recommend the change should have had mandatory peer review + characterization tests before touching legacy code.

**📦 Dependency** — did the bug land right after a library/framework/internal-package upgrade?
```bash
git log --oneline -- composer.json composer.lock package.json package-lock.json
git log -p -S "<vendorPackage>" -- composer.lock    # when was this package's version bumped?
git log --oneline --after="<bump-date>" --before="<error-onset +1w>"
```
- For each group's `vendorPackages` (especially where `vendorOriginated > 0`), check whether the package version changed shortly before the error onset. If yes → root cause is the upgrade; recommend a contract/integration test pinning the behavior, and review the upgrade's changelog for breaking changes.

**👻 Ghost Config** — defect from environmental drift, a feature flag, or a migration, not app code.
```bash
git show --stat <commit>                        # did the commit touch ONLY config/SQL?
# Look for commits that changed only: .env*, *.yaml, *.yml, *.json, *.ini, db migrations / *.sql
```
- For groups with `configSignals`, check whether the relevant commit changed only config/migration files rather than `.php`. If so → it's a config/migration-timing issue. Recommend: config validation on boot, a migration that backfills/guards the data, or a feature-flag default review — **not** an application-code null guard.

**🚨 Incident correlation** — which ticket fixes caused or resolved a production incident.
```bash
git log --grep="INC-" --grep="incident" --grep="SEV" -i --oneline    # incident-tagged commits
git log --oneline --grep="AMBS-<key>"                                # then inspect that commit's message/body
```
- Cross-reference `incidentRefs` plus the Jira ticket (check its comments via the Atlassian tooling if available). Report which closed tickets' fixes were tied to an incident number — these are the highest-stakes code paths and should get the strongest test coverage.

### Step 4 — Root Cause Classification

Classify each group's root cause:

| Root Cause | Indicators |
|---|---|
| `php8-migration` | TypeError/ValueError on methods now type-strict in PHP 8; DateMalformedStringException from PHP 8.3; return-type violations |
| `data-integrity` | DomainModelException / getOrFail on IDs that reference deleted or stale records |
| `n1-query` | Timeout errors from a loop that queries the DB on each iteration without eager loading |
| `feature-regression` | Git log shows a recent AMBS feature commit changed the code path; the error appeared shortly after |
| `infrastructure` | SSH/SFTP failures, MySQL gone-away on long crons — not fixable in application code |
| `config-error` | Missing configuration, wrong environment variable, invalid route |

### Step 5 — Process Improvement Recommendations

For each group, based on root cause, recommend one or more of:

**phpstan:**
- `php8-migration` → phpstan level 6 catches null dereferences; level 8 catches return type mismatches; `phpstan/phpstan-strict-rules` catches implicit type coercions
- `data-integrity` → a custom phpstan rule or `@throws` annotation on `getOrFail` callers ensures callers handle the exception
- Cite the specific rule or level, not just "add phpstan"

**Unit tests:**
- What function/method should be tested
- What specific input scenario triggers the error (e.g. "passing null as the second argument when the associated evaluation has been deleted")
- What the test should assert (exception thrown? error logged? graceful empty state?)

**Integration tests:**
- What HTTP request flow reproduces the error end-to-end
- What database state is required (e.g. a deleted evaluation record still referenced by an active assignment)
- Which user role / endpoint to cover

**Lint / static analysis:**
- If a pattern is consistently misused across multiple files (e.g. `new DateTime($untrustedString)` without try-catch in PHP 8.3), suggest a phpstan extension or a project-wide grep to find all instances

**Never recommend:** null guards (`if ($x !== null)`), `@` operator suppression, broad try-catch, or any change that hides the error without resolving the underlying cause.

### Step 6 — Regression Analysis

For each regression pair in `regressions[]` (a closed ticket followed by a new open ticket with the same error group):

```bash
# Find the commit that addressed the closed ticket
git log --oneline --grep="<closedKey>" --all
```

- Was the fix a workaround (e.g. added a null check, caught the exception) rather than a root cause fix?
- Did the same code path get re-triggered by a subsequent feature change?
- What would prevent this from recurring: a test that covers this scenario? A phpstan rule that catches the pattern?

### Step 7 — Output Report

Produce a structured Markdown report:

```markdown
# Datadog Ticket Root Cause Analysis — {date}

## Summary
- Total: X tickets (Y open, Z closed, W canceled, R regressions)

---

## {Subsystem} / {Category} — Impact {score} ({count} tickets)

**Tickets:** AMBS-XXXX, AMBS-YYYY, ...

**Affected file:** `path/to/file.php`

**Root cause:** {php8-migration | data-integrity | n1-query | feature-regression | infrastructure | config-error}

Explanation of why the error fires (2-4 sentences). What condition triggers it. Why it was not caught before. What changed to expose it.

**Risk patterns:**
- **Blast radius:** {fix commit touched N files across M folders — coupling note}
- **Recency:** {file dormant X years before the change / actively developed}
- **Dependency:** {package upgraded on DATE just before onset / not dependency-related}
- **Ghost config:** {commit changed only config/SQL — environmental / not config-related}
- **Incident:** {tied to INC-XXXX / no incident link}

**Relevant commits:**
- `abc1234` AMBS-XXXX: Description of change that introduced or exposed this
- `def5678` PHP8: Migration commit that made this strict

**Process improvement:**
- **phpstan:** level 8 + `phpstan-strict-rules` would catch the return type mismatch in `ClassName::method()`
- **Unit test:** Test `ClassName::method()` with a null `$evaluation` argument — assert `DomainModelException` is thrown (not silently swallowed)
- **Integration test:** POST `/functions/evaluations_submit.mh` with a deleted evaluation ID — assert 404, not 500

---

## Regressions

### AMBS-{closedKey} → AMBS-{openKey}
- Closed ticket fix: {what was done}
- Why it recurred: {reason}
- Prevention: {test / phpstan rule / architectural change}

---

## Canceled Tickets
- {N} Duplicate — same stack-trace file as another active ticket; already tracked elsewhere
- {N} AI auto-created and correctly dismissed
- {N} Cron/infrastructure — cannot be fixed in application code
- {N} Client-specific external dependencies
- {N} One-off / investigated and resolved
```

> The `canceledBreakdown[]` array in the JSON carries each ticket's `cancelReason` (`duplicate` | `ai-auto-created` | `cron-infrastructure` | `client-specific` | `one-off`). Use those counts directly.

### Rules

- **Read and run git commands only** — do not edit PHP files, create Jira tickets, or commit/push to any repo
- **Resolve the right repo per error group** (Step 1b) and run every `git`/`find` against that repo (`git -C "$REPO" …`). Errors come from multiple services under `~/workspace/`, not just `medhub` — never assume a single tree, and ask the user if a path doesn't map to a checked-out repo
- **Never recommend suppressing errors** — no null guards, `@` operator, try-catch without rethrow
- **Always cite the Jira ticket key** next to each finding
- **If a recent AMBS feature commit caused an error group**, name the commit hash and ticket explicitly so the team can follow up
- **Infrastructure root causes** (SSH failures, DB gone-away) — note them as out-of-scope for application fixes and suggest monitoring/alerting improvements instead
- **Evidence tickets MUST come from the JSON** — when citing AMBS ticket keys as evidence for a finding or fix recommendation, every key MUST appear in the `errorGroups[].tickets[].key` or `riskPatterns.*[].key` arrays of the loaded JSON file. Never invent, guess, or remember ticket numbers from prior runs. If a finding has no matching ticket in the data, say "no direct evidence in dataset" instead of fabricating a key. Template tickets (e.g. summary "Datadog - Template") and test tickets are already excluded from the JSON by the `analyze-datadog-tickets.js` script, so any key present in the JSON is a real production error ticket.
