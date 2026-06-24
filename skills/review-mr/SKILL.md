---
name: review-mr
description: "Review a GitLab merge request for a PHP project. Fetches MR details, extracts JIRA ticket references from commits, retrieves JIRA context, evaluates code against a PHP 8.x checklist (type safety, security, PSR-12, deprecated usage), checks requirements alignment with JIRA acceptance criteria, and posts inline comments with severity ratings to GitLab after user approval. Use when the user provides a GitLab MR link to review."
---

# Review MR

Review a GitLab merge request comprehensively by understanding both the code changes and their JIRA context. Provide structured, actionable feedback.

## Instructions

### Prerequisites

Scripts are called automatically by this skill. Credentials are loaded from `ambs-toolkit/.env`.

### Step 1 — Fetch MR Details

Use the `node "$TOOLKIT_ROOT/scripts/gitlab-get-mr.js` wrapper. It accepts a full
GitLab MR web URL and handles token loading automatically.

```cmd
node "$TOOLKIT_ROOT/scripts/gitlab-get-mr.js --mr {MR_URL} --diff --commits --json
```

This prints JSON with three top-level keys: `mr` (metadata + diff_refs), `changes`
(per-file diffs), and `commits` (commit list with messages).

Extract all JIRA ticket references (e.g., AMBS-12345) from commit messages.

### Step 2 — Fetch JIRA Context

For each JIRA ticket found in the commits, use the `node "$TOOLKIT_ROOT/scripts/jira-get-ticket.js` wrapper:

```cmd
node "$TOOLKIT_ROOT/scripts/jira-get-ticket.js -t {TICKET_KEY}
```

Or for raw JSON to parse acceptance criteria:

```cmd
node "$TOOLKIT_ROOT/scripts/jira-get-ticket.js -t {TICKET_KEY} --json
```

If no ticket reference is found, proceed with code review only and note that requirements
cannot be verified.

### Step 4 — PHP 8.x Code Review Checklist

Evaluate the code changes against:

**Type Safety & Declarations:**
- Strict types declared (`declare(strict_types=1)`)
- Function parameter and return types specified
- Property types declared
- Union types used appropriately
- `mixed` avoided where a more specific type is possible

**PHP 8.x Syntax & Features:**
- Constructor property promotion used where appropriate
- Named arguments for clarity
- Match expressions instead of switch where appropriate
- Nullsafe operator (`?->`) to prevent null errors
- Enums for fixed value sets

**Security:**
- No SQL injection (parameterized queries only)
- No XSS (proper output encoding)
- Input validation present
- Sensitive data not logged
- Auth checks in place
- No hardcoded credentials

**Code Quality:**
- Single-responsibility functions
- Cyclomatic complexity < 10
- Specific exception handling (not generic `catch`)
- PSR-12 style
- No dead code or unreachable statements
- Consistent naming

**Testing:**
- Unit tests added/updated for new code
- Edge cases and error conditions covered

**Compatibility:**
- No deprecated PHP functions or library functions
- Compatible with PHP 8.0+
- No breaking changes without version bump

### Step 5 — Requirements Alignment

For each JIRA acceptance criterion:
- Mark as Met or Not Met
- Provide explanation
- Identify scope creep or missing requirements

### Step 6 — Collect Inline Comments

For each actionable finding, record:
- **File path** (relative, as shown in MR diff)
- **Line number** (new_line from diff hunks)
- **Severity**: Critical, High, Medium, Low
- **Comment body** with suggested fix

Skip inline comments for positive findings, requirements alignment notes, and generic observations.

### Step 7 — Preview and Get Approval (REQUIRED GATE)

Display all inline comments in a numbered table with file, line, severity, and comment text.

**Do NOT post anything to GitLab until the user explicitly approves.**

Options:
- Post all comments
- Remove some comments first
- Cancel

### Step 8 — Post to GitLab (only after approval)

Use the `node "$TOOLKIT_ROOT/scripts/gitlab-post-comment.js` wrapper. It handles
token loading, summary notes, and inline discussions in one call.

First, write the review summary to a temp file, then build an inline-comments JSON file:

**Inline comments JSON** (`/tmp/inline-comments.json`):
```json
[
  {
    "file":      "path/to/file.php",
    "line":      42,
    "body":      "Severity: High\n\nComment text here.",
    "base_sha":  "<from MR diff_refs.base_sha>",
    "head_sha":  "<from MR diff_refs.head_sha>",
    "start_sha": "<from MR diff_refs.start_sha>"
  }
]
```

Then post everything:
```cmd
node "$TOOLKIT_ROOT/scripts/gitlab-post-comment.js --mr {MR_URL} -f /tmp/review-summary.md --inline-file /tmp/inline-comments.json
```

SHA values come from `diff_refs` in the `node "$TOOLKIT_ROOT/scripts/gitlab-get-mr.js --json` output (Step 1).

Prefix each inline comment body with severity: `Severity: Critical/High/Medium/Low`

The script reports how many comments were posted and automatically offers to fall back
to regular MR notes for any inline comment that fails (e.g., line not in diff).

### Output Format

```
## MR Review: [MR Title]

### Context
- **JIRA Ticket(s)**: [Ticket links/numbers]
- **Description**: [Brief summary]
- **Key Requirements**: [From acceptance criteria]

### Code Review

#### Critical Issues
[Issues that block merge or pose security/stability risks]

#### High Priority
[Code quality or partial requirement fulfillment]

#### Medium Priority
[Best practice recommendations]

#### Low Priority
[Minor style or documentation suggestions]

### Positive Findings
[Good practices, security implementations, clean code]

### Requirements Alignment
- Requirement 1: Met / Not met - explanation
- Requirement 2: Met / Not met - explanation

### Recommendation
[Approve / Approve with comments / Request changes]
```

### Rules

- **Never expose API tokens** in output
- **Always get approval** before posting to GitLab
- Read-only — do not modify any code
- Every inline comment must reference a real file path and line number from the MR diff
