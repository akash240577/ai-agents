---
name: datadog-ticket
description: "Create a JIRA Bug ticket on the AMBS board from a Datadog error discovery. Parses error details (endpoint, status, stack trace, occurrences, window), generates a Datadog-prefixed summary and ADF-formatted description, previews the ticket for approval, then creates it via JIRA REST API. Use when the user provides a Datadog error and wants a JIRA ticket created."
---

# Datadog Ticket

Create a JIRA ticket on the AMBS board from a Datadog error discovery.

## Instructions

### Prerequisites

Scripts are called automatically by this skill. Credentials are loaded from `ambs-toolkit/.env`.

### Step 1 — Parse Error Details

Extract from the user's input:
- **Endpoint** — HTTP method + full URL
- **Query params** — if present
- **Error message** — exception or error text
- **HTTP status** — if available
- **Occurrences** — error count
- **Window** — first_seen to last_seen timeframe
- **Affected hosts** — if multiple
- **Datadog APM link** — if provided
- **Direct trace link** — if trace_id is present
- **Stack trace** — if provided

### Step 3 — Generate Summary

Format: `Datadog - {MedHub Feature Impacted}`

Examples:
- `Datadog - Advisor Access to Procedures/Cases Error`
- `Datadog - Get Evaluations Error`
- `Datadog - PDF Generation Timeout`

Keep it concise and descriptive of the feature area, not the raw error.

### Step 4 — Generate Description (ADF)

Build an Atlassian Document Format JSON description. For the complete ADF template, read `.github/instructions/datadog-ticket.instructions.md` (relative to the project root).

All fields rendered as a single tight block (one paragraph with hard line breaks):

1. **Endpoint** — `{METHOD} https://{host}{resource path}`
2. **Query params (sample)** — omit if not present
3. **Error** — error message; omit if not present
4. **Status** — HTTP status code; omit if not available
5. **Occurrences** — error count
6. **Window** — `{first_seen}` to `{last_seen}`
7. **Affected hosts** — show only when more than one host
8. **Datadog APM Traces** — linked APM URL; omit if not provided
9. **Direct Trace** — linked trace URL; omit if trace_id not present
10. **Stack Trace** — in ADF `codeBlock`
11. **Findings** — short findings from codebase investigation; omit if none yet
12. **Work Order** — `Investigate the scenario where this error might be encountered, and fix the issue.`

### Step 5 — Create Ticket via Script

Use the `node "$TOOLKIT_ROOT/scripts/jira-create-bug.js` wrapper. It reads JIRA
credentials automatically, shows a preview, prompts for approval, then creates the ticket.

```cmd
node "$TOOLKIT_ROOT/scripts/jira-create-bug.js \
  --summary "{SUMMARY}" \
  --endpoint "{METHOD} {URL}" \
  --error "{ERROR_MESSAGE}" \
  --count {OCCURRENCES} \
  --window "{FIRST_SEEN} to {LAST_SEEN}" \
  [--apm-link "{DATADOG_APM_URL}"] \
  [--trace-link "{TRACE_URL}"] \
  [--stack-trace "{STACK_TRACE}"] \
  [--findings "{BRIEF_FINDINGS}"]
```

Use `--dry-run` first if you want to preview the ADF payload without creating the ticket.

JIRA defaults applied by the script:

| Field | Value |
|---|---|
| Project | AMBS (id: `17438`) |
| Issue type | Bug (id: `1`) |
| Priority | Minor (id: `4`) |
| Labels | `DatadogMH`, `akash` |
| Component | MedHub_Datadog (id: `32162`) |

The script outputs the created ticket key and URL:
```
✓ Created: AMBS-XXXXX
  https://ascend-learning.atlassian.net/browse/AMBS-XXXXX
```

### Rules

- **Never expose API tokens** in output
- **Always get approval** before creating the ticket
- **Do NOT browse APM links** — include them as-is in the description
- **Do NOT modify code or files** — this skill only creates JIRA tickets
- **Do NOT commit or push** — read-only git operations only
