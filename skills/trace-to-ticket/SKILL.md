---
name: trace-to-ticket
description: "Given a Datadog trace URL, fetch the trace details, check for Jira duplicates, investigate the codebase, and create a properly structured Bug ticket by cloning the AMBS template (AMBS-22917). Use when the user provides a Datadog trace URL and wants to log an error as a Jira bug."
---

# trace-to-ticket

Given a Datadog trace URL, this skill:
1. Fetches the trace and extracts full error context
2. Checks for duplicate Jira tickets (dedup logic)
3. **Investigates the relevant codebase entry point** ← MANDATORY, cannot be skipped
4. **Derives end user impact (Who / Feature / What they cannot do)** ← MANDATORY, cannot be skipped
5. Presents a ticket preview for approval (blocked until steps 3–4 are done)
6. Creates a Bug ticket by cloning the AMBS template (AMBS-22917)

> ⛔ **Steps 3 and 4 are non-negotiable.** Do NOT show the preview or create the ticket until both are complete with real findings — not placeholders. A ticket with no end user impact context is incomplete and must not be created.

## Prerequisites

`$PLUGIN_ROOT` is set automatically by the Copilot CLI. If it is empty, the plugin is not installed — tell the user to run `copilot plugin install https://git.ascendlearning.com/ascend/medhub/utilities/ai-agents.git`.

Always `cd` to `$PLUGIN_ROOT` before running scripts so relative paths (`data/`, `utils/`) resolve correctly:

```powershell
cd "$PLUGIN_ROOT"
```

Credentials (`JIRA_API_TOKEN`, `GITLAB_TOKEN`) are loaded automatically from `~/.copilot/.env`. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed.

---

## Step 1 — Extract Trace ID

From the URL: `https://us3.datadoghq.com/apm/trace/{TRACE_ID}`

Extract the hex trace ID (e.g. `6a1060e1000000005253296c7126fa24`).

---

## Step 2 — Fetch Trace Details

Use the `get_datadog_trace` tool with `only_service_entry_spans=true` to get a condensed view. Then expand error spans as needed using `expand_span_id`.

Also request `extra_fields: ["error.*", "db.*", "http.*"]` to capture all error context.

From the trace spans, extract:

| Field | Source |
|-------|--------|
| `method` | `@http.method` or inferred from `resource_name` |
| `resource` | `resource_name` (e.g. `GET /u/f/evaluations_director.mh`) |
| `host` | `peer.hostname` or `@http.url` domain |
| `http_status` | `@http.status_code` |
| `error_class` | `@error.type` (e.g. `TypeError`, `Error`) |
| `error_message` | `@error.message` |
| `stack_trace` | `@error.stack` |
| `first_seen` | `issue.first_seen` in the span `metrics` block — this is a **Unix ms epoch** (e.g. `1.781065521134e+12`). Convert to a human-readable date/time. **Do NOT derive first_seen from the version tag** (e.g. `mh.20260604001535` — the date in the tag is the *deploy* date, not when the error first occurred). |
| `version` | `version` tag |
| `http_url` | `@http.url` (full URL with query params) |
| `query_params` | extracted from `@http.url` |
| `dd_issue_id` | `@error.issue.id` (Datadog error tracking issue UUID) — found in `custom.issue.id` when fetching spans with `custom_attributes: ["error.issue.id"]` or via `search_datadog_spans` |

Construct the **APM link** for this error:
```
https://us3.datadoghq.com/apm/traces?query=service:web.request resource_name:"{METHOD} {RESOURCE}" status:error env:mh-prd
```

Construct the **Error Tracking link** using `dd_issue_id`:
```
https://us3.datadoghq.com/error-tracking?sp=%5B%7B%22i%22%3A%22error-tracking-issue%22%2C%22p%22%3A%7B%22issueId%22%3A%22{DD_ISSUE_ID}%22%7D%7D%5D
```

> **Note:** `dd_issue_id` is NOT the same as `error.fingerprint`. The fingerprint (`v10.xxx`) is for dedup; the issue UUID (e.g. `0df71638-5942-11f1-b009-da7ad0900003`) is what Error Tracking URLs need. If the initial `get_datadog_trace` call doesn't return it, fetch spans with `custom_attributes: ["error.issue.id"]` via `search_datadog_spans`.

---

## Step 3 — Dedup Check

Run the dedup check to see if this error already has an open Jira ticket:

```powershell
cd "$PLUGIN_ROOT"
node scripts/dd-dedup-check.js `
  --method "{METHOD}" `
  --resource "{RESOURCE}" `
  --error-class "{ERROR_CLASS}" `
  --stack-trace "{STACK_TRACE}" `
  --issue-id "{DD_ISSUE_ID}"
```

**Interpret exit codes:**
- Exit `0` — ✅ No duplicate, safe to proceed
- Exit `1` — ⚠️ **Open Jira ticket exists** (duplicate). Show the user the existing ticket URL. Ask: *"An open Jira ticket already exists for this error. Do you still want to create a new ticket?"* If NO, stop here.
- Exit `2` — 🔄 Regression (previously closed ticket). Mention the prior ticket in findings.

If `data/jira-tickets.csv` is missing, the script exits `0` with message *"No dedup data available — treating as NEW"*. **Flag this explicitly to the user** — a duplicate may exist but cannot be confirmed. Do not silently proceed.

> `npm run fetch-jira` does **not** exist in this toolkit. If the CSV is missing, note it and continue.

---

## Step 4 — Investigate Codebase ⛔ MANDATORY — Do NOT skip

> This step is required. Do not proceed to Step 5 or show any preview until all four sub-steps below are completed with real findings. Do not fill in placeholders.

Using the **entry point** extracted from the stack trace (e.g. `u/f/evaluations_director.mh`):

1. **Locate the PHP entry point** in the codebase:
   ```
   $PROJECT_ROOT/public/{entry_point}
   ```
   Read it to understand what the page/feature does.

2. **Find the failing class/method** from the stack trace frames:
   - Look for the first `/app/` frame — that's usually the root cause location
   - Use `grep` to find it: search `$PROJECT_ROOT` for the class name

3. **Understand the error context**:
   - What action was the user performing?
   - What data or condition triggers the null/undefined access?
   - Is there a guard missing, or a race condition?

4. **Check recent commits to the affected file(s)**:
   ```cmd
   cd /d $PROJECT_ROOT
   git --no-pager log --oneline --since="6 months ago" --all -- {affected_file}
   ```
   - For each commit found: verify it actually touches the **failing function/method** (not just the same file). Use `git show {SHA} -- {file} | Select-String -Pattern "{method_name}"` to confirm.
   - Only highlight commits that modified the specific failing code path.
   - **Discard** commits referencing unrelated features (e.g. a JS-only PLA deletion commit does not relate to a PHP API error in procedures.mh).
   - If no related commits exist, state that explicitly: *"No recent commits are directly related to this error."*

Summarize findings in **2–3 sentences** focused on: what fails, where, and likely why.

> ✅ Step 4 is complete when you have: (a) read the entry point file, (b) identified the root cause code path, (c) run the git log and assessed commit relevance, (d) written a concrete 2–3 sentence summary. Only then move to Step 5.

---

## Step 5 — Generate Summary and End User Impact ⛔ MANDATORY — Do NOT skip

> This step is required. Do not proceed to Step 6 or show any preview until all three end user impact points are filled with real, specific values derived from the codebase investigation. Generic placeholders (e.g. "users are affected", "a feature is impacted") are not acceptable.

**Title format:** `{Site/Caller} {Feature}: {What Fails} — {User-Visible Consequence}`

Make the title **business-friendly** — describe the user impact, not the PHP exception. Examples:
- `UMMC Integration: Procedure Locations API Returns 500 Error — R Reporting Scripts Cannot Retrieve Location Data`
- `Evaluations Director Page Crashes for Program Directors — Cannot View Evaluation Dashboard`
- `PDF Report Generation Fails for Attendings — Exported PDFs Are Blank`

Derive the feature, caller, and consequence from: the entry point file, the `http.host`, the `http.useragent`, and the error context. **Never use raw exception class names in the title.**

**End user impact** (always include these three points — rendered in the **SUMMARY OF ISSUE** section of the Jira ticket):
- **Who** is affected (specific user type, role, site, or integration system)
- **Feature impacted** (the named MedHub feature or integration)
- **What they cannot do** (concrete action blocked — e.g., "cannot retrieve procedure locations", "cannot submit evaluation", "cannot export PDF")

> ✅ Step 5 is complete when you have a business-friendly title and all three impact points filled with specific, non-generic values. Only then move to Step 6.

---

## Step 6 — Present Preview and Ask for Approval

> ⛔ **Gate check:** Before rendering this preview, confirm Steps 4 and 5 are done:
> - [ ] Entry point file read and feature identified
> - [ ] Root cause code path understood
> - [ ] Git log checked and relevant commits noted (or explicitly "None")
> - [ ] Business-friendly title written (no raw exception class names)
> - [ ] All three end user impact points filled with specific values
>
> If any of the above are missing, go back and complete them first.

Show the user a clear summary of everything gathered:

```
══════════════════════════════════════════════════════════════════════
TRACE-TO-TICKET PREVIEW
══════════════════════════════════════════════════════════════════════
Summary     : {Business-friendly title}
Trace       : https://us3.datadoghq.com/apm/trace/{TRACE_ID}
Error Track : https://us3.datadoghq.com/error-tracking?sp=...{DD_ISSUE_ID}...
Endpoint    : GET /u/f/evaluations_director.mh
URL         : https://{host}/u/f/evaluations_director.mh?{query_params}
Error       : TypeError: Cannot read property 'getId' of null
First seen  : today  mh.20260521165521
Stack top   : {first 3-4 frames}
Occurrences : 7 in the last 30 days
Dedup       : ✅ No duplicate  (or ⚠️ open: AMBS-XXXXX)
End User    : {Who is affected, what they cannot do}
Findings    : {2-3 sentence investigation summary}
Rel. commits: {commit SHA + message if directly related, or "None"}
Template    : https://ascend-learning.atlassian.net/browse/AMBS-22917
══════════════════════════════════════════════════════════════════════
```

**Ask the user:** *"Create this ticket by cloning AMBS-22917? [y/N]"*

Only proceed to Step 7 if the user confirms.

---

## Step 7 — Create Ticket (Clone AMBS-22917)

The template fields are cached in `data/jira-template-AMBS-22917.json` — no live Jira fetch needed. If the file is missing or stale, run:
```cmd
node -e "require('./jira-clone-ticket.js')" -- --template AMBS-22917 --dry-run ...
```
(it will fall back to a live fetch and you can re-cache manually)

```powershell
cd "$PLUGIN_ROOT"
node scripts/jira-clone-ticket.js `
  --template AMBS-22917 `
  --summary "{BUSINESS_FRIENDLY_TITLE}" `
  --endpoint "{METHOD} {RESOURCE}" `
  --url "{FULL_URL_WITH_QUERY_PARAMS}" `
  --error "{ERROR_MESSAGE}" `
  --first-seen "{e.g. today / 2 days ago / 7 hours ago}" `
  --last-seen "{e.g. 7 hours ago}" `
  --count {OCCURRENCE_COUNT} `
  --version "{VERSION_TAG}" `
  --trace-link "{TRACE_URL}" `
  --apm-link "{APM_URL}" `
  --stack-trace "{STACK_TRACE_FIRST_10_LINES}" `
  --findings "{2-3_SENTENCE_INVESTIGATION}\n\nEnd User Impact:\n- Who: {user/integration}\n- Feature: {feature name}\n- What they cannot do: {concrete action blocked}\n\nRelated Recent Changes:\n{MEDM-XXXXX commit context OR 'No recent commits are directly related to this error.'}" `
  --dd-issue-id "{DD_ISSUE_ID}" `
  --dd-fp "{FINGERPRINT_16HEX}" `
  --dd-ep "{ENDPOINT_HASH_8HEX}"
```

> **Note:** `--et-link` does **not** exist in `jira-clone-ticket.js`. Do not pass it.

The script will:
- Load AMBS-22917 custom fields from cache (severity, found_in_env, found_via, is_in_prod)
- Build description matching the AMBS-22917 template: SUMMARY OF ISSUE → URL → Datadog link → First seen + version → stack trace code block → Findings → WORK ORDER
- Apply labels: `DatadogMH`, `akash`, `DATADOG-AI-CREATE`
- Show a final preview and prompt once more before creating

Report the created ticket key and URL to the user.

---

## Computing Fingerprint / Endpoint Hashes (optional)

The inline `node -e` approach **breaks on multiline stack traces**. Use a temp file instead:

```powershell
cd "$PLUGIN_ROOT"

# Write temp script (use Create tool, not heredoc)
# Content:
# const { computeFingerprint, computeEndpointKey, endpointKeyHash, extractEntryPoint } = require('./utils/fingerprint');
# const st = [ '#0 ...', '#1 ...', ... ].join('\n');
# const fp = computeFingerprint({ errorClass: '{ERROR_CLASS}', stackTrace: st });
# const ek = computeEndpointKey({ method: '{METHOD}', resource: '{RESOURCE}', stackTrace: st });
# const ep = endpointKeyHash(ek);
# console.log(JSON.stringify({ fp, ep, entryPoint: extractEntryPoint(st) }));

# Save as fp_compute.js using the `create` file tool, then:
node --env-file=.env fp_compute.js
Remove-Item fp_compute.js
```

Use the `create` tool (not PowerShell heredoc) to write `fp_compute.js` — heredocs mangle backslashes in stack traces. Always delete the temp file after.

Pass `--dd-fp` and `--dd-ep` to `jira-clone-ticket.js` so Jira label dedup works for future runs.

---

## Safety Rules

1. **Never expose API tokens** in output
2. **Always get explicit user approval** before creating the ticket (Step 6)
3. **Do NOT browse APM or trace links** — include them as-is in the ticket description
4. **Do NOT modify codebase files** — investigation is read-only
5. **Do NOT commit or stage changes** — read-only git operations only
6. **One trace → one ticket** — if the trace has multiple error spans, use the root/entry-point error only unless the user asks for more
7. **Never create a ticket without end user impact** — if Steps 4–5 were skipped or produced only placeholders, go back and complete them before calling `jira-clone-ticket.js`
