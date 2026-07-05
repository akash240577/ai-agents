---
name: ambs-investigate
context: fork
description: "Investigate an AMBS ticket error. Trigger phrases: 'investigate the error', 'parse the stack trace', 'search codebase for this error', 'find root cause', 'analyze the error', 'trace the bug', 'look into the stack trace'. Parses stack traces, searches code, consults documentation (ref_database.md, architecture.md, feature docs), writes local reproduction steps for docker.medhub.com, and documents findings in investigation.md. Requires ambs-debug-workspace workspace to exist first."
---

# AMBS Investigate

Investigate an AMBS ticket error by parsing the stack trace, searching code, and documenting findings. The investigation workspace must exist first.

## Instructions

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override by setting `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere. `$TICKET_NUMBER` — extract from the current git branch (`git branch --show-current`) or ask the user.

The investigation workspace at `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/` must exist — run ambs-debug-workspace first if it doesn't.

### Step 1 — Load Context

1. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/error.md` for the error details
2. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` for current state
3. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/dev-notes.md` for any prior notes
4. If any of these files don't exist, tell the user to run the ambs-debug-workspace skill first. The workspace lives at `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/`

### Step 2 — Parse the Error

Extract from the error text:
- **Stack traces**: PHP file paths, line numbers, class names, method names
- **Database errors**: Table names, column names, constraint violations, query fragments
- **Error classification**: Fatal error, exception type, warning, performance issue
- **User context**: UserID, session info, request parameters, workflow stage

Update the `investigation.md` Error Summary section.

### Step 2a — Understand the Feature First (Business Context)

Before analysing code, understand what the feature does from a business standpoint. The goal is to first understand the business workflow the failing code supports — who uses it, what they are trying to accomplish, and how the feature fits into the broader MedHub workflow.

Derive this from the feature keyword, the resource path, the documentation found in Step 3, and the surrounding code. Write a concise summary into the **Feature Overview (Business Context)** section at the top of `investigation.md` covering:
- What the feature is and what business problem it solves
- Who the primary users are (admin, coordinator, student, faculty, etc.)
- The normal business workflow / happy path the code supports
- Where in that workflow the error occurs

Keep it focused — this frames the rest of the investigation. If the business purpose is not yet clear, note what is known and refine after Step 3 (documentation) and Step 4 (code search).

### Step 3 — Build Doc Brief (before code search)

Build a targeted document brief using the parsed error from Step 2. Load the minimum files needed — do not speculatively load all docs.

#### 3a — Extract lookup keys

From the Step 2 output, collect:
- **PHP class names** from the stack trace (e.g., `StudentController`, `AbsenceApprovalService`)
- **Table names** from any DB error or SQL fragment in the error text
- **Feature keyword** — infer from the file path or error message (e.g., `app/Controllers/Student/` → "Student Enrollment")

#### 3b — Targeted Confluence lookup (execute in order, stop when you have enough)

**Lookup 1 — TAGS.json** (zero file loading):
- Read `$PLUGIN_ROOT/knowledge/confluence/TAGS.json`
- Look up each class name, table name, and feature keyword under the `classes`, `tables`, and `features` keys
- Collect matching Confluence page IDs
- If TAGS.json doesn't exist or returns no matches: proceed to Lookup 2

**Lookup 2 — Index title/summary scan** (one file):
- Read `$PLUGIN_ROOT/knowledge/confluence/index.json`
- Filter entries whose `title` or `summary` field contains any lookup key (case-insensitive substring match)
- Add matching page IDs to the list
- For each match: check `fetchedAt` — mark ⚠️ stale if older than 30 days

**Lookup 3 — Resolve IDs → file paths, then load** (full content, only confirmed matches):
- For each unique page ID collected from Lookups 1 and 2: look it up in `index.json` to get its `filePath` field (e.g. `"MH-SPACE/Student-Enrollment.md"`)
- Load `$PLUGIN_ROOT/knowledge/confluence/{filePath}` for each resolved path
- Cap at 5 pages: if more matched, sort by `fetchedAt` descending, load the top 5, and note the rest were skipped
- If a page ID from TAGS.json has no entry in index.json: skip it and note it as missing in `investigation.md` (the page may not have been fetched yet)
- If `knowledge/confluence/` is empty or `index.json` is missing: write "Knowledge base not populated — run `node $PLUGIN_ROOT/scripts/confluence-fetch.js <url>`" in `investigation.md` and proceed to 3c

#### 3c — Project docs lookup

- **`$PROJECT_ROOT\.github\ref_database.md`** *(only if table names were extracted)*: Search for the heading `` ### `{table_name}` `` for each table and read only that section — do not load the full file. Note column types, FK relationships, nullable fields.
- **`$PROJECT_ROOT/docs/architecture/system-architecture.md`** *(only if the failing file path is in an unfamiliar module)*: Load fully.
- **`$PROJECT_ROOT/docs/features/{FEATURE_KEYWORD}.md`** *(always)*: Search for a file whose name contains the feature keyword. Load fully if found. If not found: create a stub at `$PROJECT_ROOT/docs/features/{FEATURE_NAME}.md` — populate it fully after Step 4 code search adds context.

#### 3d — Write Doc Brief to `investigation.md`

Populate the **Related Documentation** section. For each doc read, write:
- Filename
- 2-3 bullet points of **actual facts found** (specific column names, business rules, edge cases — not "I read this file")
- ⚠️ freshness warning if Confluence `fetchedAt` > 30 days

If nothing was found across all lookups: write "No documentation found for [{feature keyword}] — knowledge base may need update" and continue.

#### 3e — Update TAGS.json with any new mappings

If TAGS.json does not exist, create it at `$PLUGIN_ROOT/knowledge/confluence/TAGS.json` with this exact stub:

```json
{
  "classes": {},
  "tables": {},
  "features": {}
}
```

Each key maps a lookup term to a list of Confluence page IDs. Example after population:

```json
{
  "classes": {
    "StudentController": ["123456", "789012"],
    "AbsenceApprovalService": ["234567"]
  },
  "tables": {
    "absence_requests": ["234567"],
    "student_enrollments": ["345678"]
  },
  "features": {
    "Absence Approval": ["234567", "789012"]
  }
}
```

After creating or confirming the file exists: if this investigation matched a Confluence page to a class, table, or feature keyword not yet listed, append those mappings now.

### Step 4 — Search the Codebase

**Doc-informed focus**: Using the Doc Brief from Step 3, prioritize discrepancies between documented behavior and what the code actually does — these are the highest-probability bug locations. If Step 3 flagged a nullable column, search specifically for code that dereferences it without a null check.

Search for:
- The exact file and line number from the stack trace
- Related controllers, models, and services
- Database queries involving affected tables
- Similar error handling patterns and existing fixes
- Existing similar investigations in `$INVESTIGATIONS_ROOT/` for comparison

**Backward trace (required for null / unexpected-value errors):**
Trace the producer — find where the null/unexpected value was set (or not set) and under what conditions:
- Which method/function returns the value consumed at the crash site?
- What input data or DB state causes it to be null?
- Is the fix location the crash site, or the producer? (A null guard at the crash site only suppresses the symptom for root cause categories 1–3.)

**Forward / caller trace (required when the failing value comes from request input — e.g. `$request->get(...)`, `$_REQUEST`, `$_POST`, `$_GET`, or a route/controller argument):**
Tracing the producer alone is not enough. You must also trace the request *forward from its entry point* to learn whether the triggering input can actually arrive through the real caller, or only via a tampered/direct request. Skipping this is the most common cause of wrong reproduction steps.

1. **Find the caller(s)** — grep the workspace for the failing script/endpoint name, route name, or controller action (e.g. `grep -rl "listener_ajax_reports_aggregate" .`, or search route definitions in `app/routes/` for a controller action). A failing endpoint may be invoked by:
   - a legacy `.mh` page or template (often via a jQuery/`fetch` AJAX call — grep for the endpoint URL in `templates/`, `app/templates/`, `app/includes/`, and `public*/`),
   - another `.mh`/PHP file via `include`/`require`,
   - a routed MVC controller, a cron/job, or an external/API client.
2. **Determine how the triggering parameter is produced** by each caller — is it hardcoded, forced to a fixed value, sourced from a curated dropdown / enum / DB lookup, carried in a hidden field, or genuinely free user input?
3. **Decide reachability** — can the failing value actually reach the sink through the real entry point? If the parameter is constrained by the caller (forced value, validated list, server-set hidden field), then the failure is **only reproducible via a tampered or directly-crafted request** (curl/Postman/devtools) — state this explicitly rather than implying a normal user flow triggers it.
4. **Never assume a request parameter is freely user-controllable** without tracing at least one caller. If no caller can be found (e.g. the endpoint is only hit by bots/scanners or a deprecated page), say so.

Document both traces in `investigation.md` as you go. If `dev-notes.md` exists and the developer has left context there, read it — but never write agent findings to `dev-notes.md`.

### Step 4a — Search Past Investigations (REQUIRED before forming hypothesis)

Before writing the root cause hypothesis, search for prior related investigations:

1. **Search `$INVESTIGATIONS_ROOT/`** for folders matching classes, table names, or feature keywords from the stack trace:
   ```bash
   grep -rl "{CLASS_NAME}\|{TABLE_NAME}" "$INVESTIGATIONS_ROOT" --include="investigation.md"
   ```
2. **Search `$PROJECT_ROOT/docs/ambs/`** (or `$PROJECT_ROOT/docs/`) for any feature docs referencing the same area.

If a related investigation is found: read its `investigation.md` — note any prior root cause findings, data integrity issues, or fix patterns. Avoids re-deriving known solutions and surfaces recurring data problems.

Write a "Prior Investigations" line in the Related Documentation section of `investigation.md`.

### Step 4b — Recognize Core Domain Model Patterns

These are intentional patterns in MedHub — do not flag them as bugs:

| Pattern | Behaviour | What to look for instead |
|---------|-----------|--------------------------|
| `Model::get()` | Returns `null` if not found | Caller that dereferences without null check |
| `Model::getOrNew()` | Creates new instance if not found | Unintended record creation |
| `Model::getOrFail()` | Throws if not found — caller guarantees existence | Caller assumption that is wrong |
| `loadRelatedModel()` | Skips load if ID is null — by design | Producer that leaves ID null unexpectedly |

If the stack trace lands inside one of these methods: the bug is almost always in the CALLER, not the method itself. Document this in the Code Analysis section.

### Step 4c — Search Sibling Projects

If the failing class, function, or table is not found in `$PROJECT_ROOT` (medhub):

Search these repos in the same workspace (paths vary — ask user or check `$PLUGIN_ROOT/.env`):
- `support/`
- `app-server/`
- `global-api/`
- `framework/`

Update `$PROJECT_ROOT` mid-session to the repo that owns the failing code. The investigation workspace stays constant.

### Step 4d — Git History: Find the Introducing Commit

After locating the failing file and method, check git history to determine when the bug was introduced and which ticket caused it:

1. **Log the failing file:**
   ```bash
   git --no-pager log --oneline --since="12 months ago" -- {FAILING_FILE}
   ```

2. **Narrow to the failing method** — for each commit in the list, verify it actually touches the failing function (not just the same file):
   ```bash
   git show {SHA} -- {FAILING_FILE} | grep -A 20 "function {METHOD_NAME}\|{METHOD_NAME}("
   ```
   Discard commits that only touch unrelated code in the same file.

3. **Identify the regression commit** — the earliest commit that modified the specific code path that fails. Look for:
   - Addition of a call that now dereferences a potentially null value
   - Removal of a guard that previously prevented the failure
   - A refactor that changed the return type or contract of a called function

4. **Extract the ticket number** from the commit message (e.g. `AMBS-19408` or `MEDM-1234`).

5. **Write to `investigation.md`** in the Root Cause Depth block:
   ```
   - Introducing commit: {SHA} — {COMMIT_MESSAGE_FIRST_LINE}
   - Introducing ticket: {AMBS-XXXXX} (or "unknown / predates git history")
   - Introduced: {relative date, e.g. "3 months ago, 2026-03-12"}
   ```

If no commit clearly introduced the failure (e.g. it is a latent bug that always existed, or it predates the git history window), write "No regression commit found — likely latent".

### Step 4e — Assess Business / User Impact (REQUIRED)

A root cause is not complete without explaining what the failure *costs the people using MedHub*. Translate the technical fault into a concrete business consequence — what can a user no longer do, see, or complete because of this error? This is what the ticket reader (developer, PM, support) actually needs to triage severity.

Determine impact from the forward/caller trace (Step 4) plus the feature context (Step 2a):

1. **What breaks for the user** — describe the blocked outcome in user terms, not code terms. Examples by failure shape:
   - **AJAX listener / fragment endpoint fails** → the host page still loads, but the piece it powers is broken: a count/preview never updates, a dropdown stays empty, a "Next"/"Submit" button never enables, a section spins forever or shows a JS error. The user is **stuck at that step and cannot proceed** even though the page looks fine. (The caller — possibly another `.mh`/PHP page or template — defines exactly which on-screen action is dead; name it.)
   - **Full-page `.mh`/controller request fails** → the user hits a 500 / white screen / error page and cannot view or use that screen at all.
   - **Form POST / save action fails** → the user's data is not saved (possible silent data loss); they may retry and create duplicates.
   - **Cron / job / background process fails** → no immediate user-visible error, but downstream data is stale, missing, or not delivered (reports, notifications, syncs). Identify the delayed/owed outcome.
   - **API / integration endpoint fails** → the calling system gets an error; identify the consumer and the broken downstream workflow.
2. **Who is affected** — which roles/personas (resident, student, faculty, coordinator, admin, GME office, external system), and at which step of their workflow.
3. **Scope & frequency** — is it every user of this feature, or only an edge case (specific config, data state, tampered/out-of-range input)? Tie this to the reachability finding from the forward trace: a failure only reachable via a malformed/direct request is far lower impact than one a normal user hits. Use occurrence counts from `error.md` / Datadog if available.
4. **Workaround** — is there any way for the user to still get the job done (alternate path, different report, manual step), or are they fully blocked?
5. **Severity framing** — one line: e.g. "Blocks all coordinators from generating aggregate evaluation reports" vs. "Cosmetic — only triggered by a manipulated request parameter; normal users never hit it."

Write a **Business Impact** section in `investigation.md` covering points 1–5. Keep it factual and tied to evidence from the traces — do not overstate severity.

### Step 4f — Shared-Method & Output-Contract Audit (REQUIRED before proposing a fix inside a shared method)

Do not propose a fix to a function, method, or include that is consumed by more than one entry point until you have enumerated **every** caller and confirmed the change preserves **each** caller's output contract. Superficially fixing the one caller in the stack trace, while ignoring the others, is a primary cause of regressions (and of "fixes" that re-break the original symptom in a different view).

1. **Enumerate all call sites.** Grep the method/function name across the whole workspace — `$PROJECT_ROOT` **and** sibling projects (`support/`, `app-server/`, `global-api/`, `framework/`, `public/`, `public_reporting/`, `templates/`, `app/`). Don't stop at the first caller. Build a complete list.
2. **Classify each caller's runtime context / output contract.** For each call site, determine what the caller expects the code to *emit* and *return*:
   - **AJAX / fragment endpoint** → expects a machine-readable body (usually JSON, sometimes a bare number/HTML snippet the JS parses). Any stray `echo`/HTML/`exit` corrupts the payload — the classic symptom is a **stuck spinner, `0` never rendered, or a silent JS parse failure**.
   - **Full HTML page render** (`.mh` page, controller view, Twig template) → may legitimately rely on the method `echo`-ing markup and/or `exit`-ing to short-circuit the page.
   - **Cron / job / CLI** → expects no output at all; `echo`/`exit` can corrupt logs or abort the batch.
   - **API / integration** → expects a strict response schema.
3. **Hunt side effects inside the shared method.** Grep the method body for `echo`, `print`, `printf`, `var_dump`, `die(`, `exit`, `header(`, `http_response_code(`, `ob_*`, and direct `return`-of-HTML. These fire **regardless of caller**, so a side effect added for one context (e.g. an HTML page printing `<span class="red">0</span>` then `exit`) silently violates a different caller's contract (e.g. an AJAX listener that needed JSON). This is exactly the kind of cross-contract leak that produces a stuck spinner.
4. **Decide where the fix belongs.** If callers have **conflicting** contracts (one needs HTML, another needs JSON), the fix must move to the **boundary** — make the shared method side-effect-free (return a value / sentinel, never `echo`/`exit`), and let *each* caller render its own contract (JSON for the listener, HTML for the page). Hardcoding one caller's format inside the shared method just moves the bug to the other caller. Only when *every* caller shares the same contract is it safe to change the output format in place.
5. **Verify the other callers still work.** For each non-trivial caller affected by the proposed change, confirm (by reading that caller) that it already guards the new return value (e.g. `if (strlen($sqlStr) > 0)`) or note the additional guard it will need. List any caller that needs a companion change.
6. **Document the matrix.** Write a "Shared-Method Call Sites & Contracts" subsection in the Code Analysis section of `investigation.md`: a table of *call site → context → expected output → impact of the proposed change → companion change needed (y/n)*. The fix plan (Step 4 of `ambs-fix-plan`) must address every row, not just the crash-site caller.

### Step 5 — Update Investigation Report

Populate these sections in `investigation.md`:
- **Affected Components** — files, tables, controllers, models, services discovered. Include the **caller(s) / entry point** found in the forward trace, not just the crash-site file.
- **Related Documentation** — links to any feature docs found
- **Business Impact** — from Step 4e: what users can't do, who is affected, scope/frequency, workaround, severity framing
- **Code Analysis** — stack trace walkthrough, root cause hypothesis, relevant code snippets. Must include a **Root Cause Depth** block:
  - **Value source** — where does the null / unexpected value originate?
  - **Conditions** — what data or timing causes this to happen?
  - **Input reachability** — can the triggering input reach the sink through the real entry point (caller/UI), or only via a tampered / directly-crafted request? Name the caller(s) and how the parameter is supplied (forced, curated list, hidden field, free input).
  - **Data vs. code** — is the root cause bad data in DB, or a logic gap in code?
  - **Fix location** — which file is the correct place to fix (not just crash site)?
  - **Root cause category:** `1` = upstream bug · `2` = data integrity · `3` = missing validation · `4` = legitimate edge case · `5` = design gap
  - **Introducing commit** — SHA + message first line (or "latent / predates history")
  - **Introducing ticket** — AMBS-XXXXX extracted from commit message (or "unknown")
- **Database Analysis** — if applicable: schema observations, data integrity concerns

### Step 6 — Steps to Reproduce Locally

Write a concrete reproduction plan that a developer can follow on `docker.medhub.com` (local dev environment). **Base the steps on the caller / entry point found in the forward trace (Step 4), not on the crash-site path** — the user never navigates to a listener or internal include directly. Include:

1. **Login** — which user role to log in as (admin, student, coordinator, etc.) based on the error context. If a specific user ID is in the error, mention it.
2. **Navigation** — exact URL of the **caller page** the user actually visits (e.g., the report options page that issues the AJAX call), not the failing endpoint's URL. Derive this from the forward trace; identify the link/button/menu text from templates or nav files where possible. For AJAX/listener or included-file failures, the user-facing page is the caller.
3. **Actions** — step-by-step clicks or form submissions to trigger the error. **Confirm the triggering parameter value is actually producible from that page.** If the caller constrains the parameter (forced value, curated dropdown, server-set hidden field) so a normal flow cannot produce the failing value, say so and give the exact tampered/direct request instead (e.g. a `curl`/devtools POST with the out-of-range value, valid CSRF token, and required fields).
4. **Expected result** — what the user would see when the bug triggers, tied to the Business Impact (e.g. "the response count never updates and the Next button stays disabled — user cannot proceed", or "500 error page").
5. **Prerequisite data** — any specific records, settings, or database state needed to reproduce. Include SQL queries to find or create test data if needed.
6. **If not reproducible via the normal UI** — state why (parameter constrained by the caller, depends on production data, race condition, specific institution config, bot/scanner traffic) and give the alternative verification path: the exact crafted request, a unit test, or targeted logging.

Add this to the **Steps to Reproduce** section in `investigation.md`.

### Step 7 — Suggest Debug Logging

Identify strategic locations for Monolog Logger calls. Use existing patterns from the codebase. Place at:
- Error boundaries
- Before/after critical operations
- Data transformations where nulls could appear

Example pattern:
```php
Logger::error('Error description', [
    'userId' => $userId,
    'ticketId' => $ticketId,
    'exception' => $e,
    'context' => $data
]);
```

Update the **Debug Logging Added** section in `investigation.md`.

### Step 8 — Present Findings

Summarize what you found:
- Root cause hypothesis (with confidence level)
- Key files involved — including the caller / entry point, not just the crash site
- **Business impact** — what users can't do, who is affected, and whether normal users hit it or only tampered/edge-case requests
- Whether database queries would help (suggest ambs-debug-sql skill)
- Whether a fix plan is ready (suggest ambs-fix-plan skill)

Ask the user if they want to:
- Investigate additional code areas
- Generate SQL troubleshooting queries
- Proceed to fix planning

### Rules

- **Read-only** — do not modify any application code; only write to `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/` and `$PROJECT_ROOT/docs/features/`
- **Never write to `dev-notes.md`** — it is the developer's scratch pad. All agent investigation output goes into `investigation.md` only. You may read `dev-notes.md` for developer context, but never populate it.
- Use backticks for all technical tokens in markdown files (variables, class names, methods, file names, table names)
- Be thorough but focused — investigate the error path, not tangential code
- Verify you've analyzed ALL files mentioned in the stack trace before concluding
- **Trace both directions** — for any failure driven by request input, you must trace the producer (backward) *and* at least one caller / entry point (forward) before writing reproduction steps. A repro that assumes free control of a curated, forced, or server-set parameter is invalid; verify the triggering input is actually producible by the real entry point, otherwise document it as a tampered/direct-request repro.
- **Always state business impact** — every investigation must explain, in user terms, what the failure blocks or breaks and who is affected. A technical root cause without a business consequence is incomplete. The caller that breaks may itself be another `.mh`/PHP page or template — name the on-screen action that dies.
- `$PROJECT_ROOT` is the active project repo (may change mid-session for cross-repo tickets); `$INVESTIGATIONS_ROOT` never changes within a ticket session
