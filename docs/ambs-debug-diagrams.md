# ambs-debug Agent — Mermaid Diagrams

## Overview: Agent Phases & Skills

```mermaid
flowchart TD
    START([User: debug AMBS-XXXXX]) --> P0

    P0["🔧 Phase 0 — Resolve Paths
    PLUGIN_ROOT · PROJECT_ROOT · INVESTIGATIONS_ROOT"]

    P0 --> P1["📁 Phase 1 — Set Up Workspace
    skill: ambs-debug-workspace"]

    P1 -->|site name provided| DB["💾 db-download
    (optional)"]
    DB --> P2
    P1 -->|no site| P2

    P2["🔍 Phase 2 — Investigate
    skill: ambs-investigate"]

    P2 -->|database error?| P3["🗄️ Phase 3 — SQL Queries
    skill: ambs-debug-sql"]
    P2 -->|no DB involvement| P4
    P3 --> P4

    P4["🛠️ Phase 4 — Fix Plan & Implementation
    skill: ambs-fix-plan"]

    P4 -->|user approves plan| IMPL["✏️ Implement code changes"]
    IMPL --> P5

    P5["🚀 Phase 5 — Commit & MR
    skill: ambs-commit-mr"]

    P5 --> P6["💬 Phase 6 — Generate Comments
    skill: ambs-jira-comment"]

    P6 -->|user confirms JIRA posted| P7["✅ Phase 7 — Close Sub-Tasks
    skill: ambs-close-subtasks"]

    P7 --> DONE([Done])

    style P0 fill:#e8f4f8,stroke:#2980b9
    style P1 fill:#eafaf1,stroke:#27ae60
    style DB fill:#fef9e7,stroke:#f39c12
    style P2 fill:#eafaf1,stroke:#27ae60
    style P3 fill:#eafaf1,stroke:#27ae60
    style P4 fill:#eafaf1,stroke:#27ae60
    style P5 fill:#eafaf1,stroke:#27ae60
    style P6 fill:#eafaf1,stroke:#27ae60
    style P7 fill:#eafaf1,stroke:#27ae60
```

---

## Phase 1 — `ambs-debug-workspace`

```mermaid
flowchart TD
    IN([Input: AMBS ticket number + optional error text]) --> S1

    S1["Step 1 — Git Branch
    git branch --show-current"]
    S1 -->|already on ticket branch| S2
    S1 -->|different branch| ASK{"Ask user: switch branch?"}
    ASK -->|yes| SWITCH["git checkout main && git pull
    git checkout -b TICKET_NUMBER"]
    ASK -->|no| S2
    SWITCH --> S2

    S2["Step 2 — Scaffold Workspace
    node init-ticket.js TICKET_NUMBER
      --dir INVESTIGATIONS_ROOT
      --error ERROR_DESCRIPTION"]

    S2 --> FILES["Creates:
    📄 investigation.md
    📄 error.md
    📄 queries.sql
    📄 dev-notes.md"]

    FILES --> S3["Step 3 — Move Sub-Tasks to In Progress
    node assign-subtasks.js -t TICKET_NUMBER"]

    S3 --> REPORT["Step 4 — Confirm & Report
    List created files
    Note any missing sub-tasks"]

    REPORT --> OPTDB{Site name provided?}
    OPTDB -->|yes| DBDL["Invoke db-download skill"]
    OPTDB -->|no| DONE

    DBDL --> DONE([Workspace ready])

    style FILES fill:#fef9e7,stroke:#f39c12
    style DBDL fill:#fdf2f8,stroke:#8e44ad
```

---

## Phase 1 (optional) — `db-download`

```mermaid
flowchart TD
    IN([Input: site name e.g. mayo, stanford, musc]) --> CHECK

    CHECK["Step 1 — Verify Docker
    docker ps --filter name=mh-php-fpm"]

    CHECK -->|container running| DL
    CHECK -->|not running| ERR["❌ Tell user to start
    Docker dev environment"]

    DL["Step 2 — Download Main DB
    echo n | docker exec -i mh-php-fpm
    php tools/db-download.php SITE
    (skips reports DB)"]

    DL -->|success| OK["Step 3 — Confirm
    ✅ medhub_SITE imported
    Dev settings applied
    Ready at docker.medhub.com"]

    DL -->|failure| FAIL["Surface error
    Suggest: check dbreload.yaml,
    GPG passphrase, site name"]

    style OK fill:#eafaf1,stroke:#27ae60
    style ERR fill:#fdedec,stroke:#e74c3c
    style FAIL fill:#fdedec,stroke:#e74c3c
```

---

## Phase 2 — `ambs-investigate`

```mermaid
flowchart TD
    IN([Workspace exists with error.md]) --> S1

    S1["Step 1 — Load Context
    Read error.md · investigation.md · dev-notes.md"]

    S1 --> S2["Step 2 — Parse the Error
    Extract: stack trace, file paths, line numbers
    class names, DB errors, user context
    → Update Error Summary in investigation.md"]

    S2 --> S2A["Step 2a — Business Context
    What does this feature do?
    Who uses it? Where does error occur in workflow?
    → Write Feature Overview section"]

    S2A --> S3["Step 3 — Build Doc Brief"]

    S3 --> S3A["3a — Extract lookup keys
    PHP classes · table names · feature keyword"]

    S3A --> S3B["3b — Confluence lookup
    1. Check TAGS.json
    2. Scan index.json titles/summaries
    3. Load up to 5 matching pages"]

    S3B --> S3C["3c — Project docs
    ref_database.md (table sections only)
    system-architecture.md (if unfamiliar module)
    docs/features/FEATURE.md (create stub if missing)"]

    S3C --> S3D["3d — Write Doc Brief
    Populate Related Documentation section
    Note ⚠️ stale pages > 30 days"]

    S3D --> S3E["3e — Update TAGS.json
    Add new class/table/feature → page ID mappings"]

    S3E --> S4["Step 4 — Search Codebase
    Exact file + line from stack trace
    Controllers · Models · Services · DB queries
    Similar patterns & existing fixes"]

    S4 --> S4BT["Backward trace (null/unexpected-value errors)
    Where was the null value produced?
    Is fix at crash site or producer?"]

    S4BT --> S4FT["Forward trace (request-input errors)
    Find callers of the endpoint
    Is the bad value reachable via normal user flow?"]

    S4FT --> S4A["Step 4a — Search Past Investigations
    grep INVESTIGATIONS_ROOT for class/table names
    Read related investigation.md files"]

    S4A --> S4B["Step 4b — Core Domain Patterns
    Identify Model::get() · getOrNew() · getOrFail()
    Bug usually in CALLER, not the method"]

    S4B --> S4C{Class/file found in PROJECT_ROOT?}
    S4C -->|no| S4D["Step 4c — Search Sibling Projects
    support/ · app-server/ · global-api/ · framework/
    Update PROJECT_ROOT to owning repo"]
    S4C -->|yes| S4E
    S4D --> S4E

    S4E["Step 4d — Git History
    git log --follow failing file
    Find introducing commit & ticket"]

    S4E --> S5["Step 5 — Root Cause Hypothesis
    Classify category 1–5
    Record in Root Cause Depth block"]

    S5 --> S6["Step 6 — Reproduction Steps
    Local docker.medhub.com steps
    Verified against actual caller traces"]

    S6 --> DONE["Update investigation.md
    All sections populated including
    Affected Components, Code Analysis,
    Proposed Fix (initial), Debug Logging"]

    style S3B fill:#fef9e7,stroke:#f39c12
    style S4BT fill:#fdf2f8,stroke:#8e44ad
    style S4FT fill:#fdf2f8,stroke:#8e44ad
    style DONE fill:#eafaf1,stroke:#27ae60
```

---

## Phase 3 — `ambs-debug-sql`

```mermaid
flowchart TD
    IN([investigation.md complete with DB context]) --> S1

    S1["Step 1 — Load Context
    Read investigation.md · error.md · dev-notes.md
    Schema lookup: ref_database.md
    (target table sections only)"]

    S1 --> S2["Step 2 — Identify DB Context
    Extract: table names · column names
    FK relationships · user/record IDs from error"]

    S2 --> DBCHECK{Error is database-related?}
    DBCHECK -->|no| STOP["Tell user — no DB queries needed
    Stop skill"]
    DBCHECK -->|yes| S3

    S3["Step 3 — Generate Queries
    (all SELECT-only, all with LIMIT)"]

    S3 --> Q1["Record existence checks
    SELECT * FROM table WHERE id = ID LIMIT 1"]
    S3 --> Q2["FK relationship verification
    LEFT JOIN parent/child tables"]
    S3 --> Q3["Orphaned record detection
    LEFT JOIN WHERE parent.pk IS NULL"]
    S3 --> Q4["Data pattern analysis
    GROUP BY field ORDER BY cnt DESC"]
    S3 --> Q5["Null checks for specific failure
    WHERE nullable_col IS NULL"]

    Q1 & Q2 & Q3 & Q4 & Q5 --> WRITE["Write to queries.sql
    (append — never overwrite)
    Each query has explanatory comment
    Placeholders for user IDs: {USER_ID}"]

    WRITE --> S4["Step 4 — Report
    Summarise queries generated and why
    Suggest running against staging/read-replica"]

    style STOP fill:#fdedec,stroke:#e74c3c
    style WRITE fill:#eafaf1,stroke:#27ae60
```

---

## Phase 4 — `ambs-fix-plan`

```mermaid
flowchart TD
    IN([investigation.md Code Analysis populated]) --> S1

    S1["Step 1 — Load Context
    Read investigation.md · dev-notes.md · error.md"]

    S1 --> TBD{Code Analysis = TBD?}
    TBD -->|yes| STOP["Tell user: run ambs-investigate first"]
    TBD -->|no| S2

    S2["Step 2 — Draft Fix Plan
    Root cause statement
    Root cause category (1–5)
    Fix location justification
    Files to modify (per layer)
    Debug logging additions
    DB migrations (if any)
    Risks & side effects
    Testing plan"]

    S2 --> S2A["Step 2a — Depth Check
    Is null traced to its producer?
    Is fix at source, not just crash site?
    For categories 1–3: Layer 1 alone is NOT enough"]

    S2A --> S3["Step 3 — Present Multi-Layer Fix Plan"]

    S3 --> L1["Layer 1 — Immediate Safety
    Guard at crash site: null check + Logger::warning
    Prevents 500s while root fix deploys"]
    S3 --> L2["Layer 2 — Root Cause Fix
    Fix at producer: the method returning null
    or the entry-point not validating input"]
    S3 --> L3["Layer 3 — Data Remediation
    SQL to repair existing bad records
    Required for root cause category 2"]
    S3 --> L4["Layer 4 — Prevention
    DB NOT NULL constraint
    Controller guard · Unit test"]

    L1 & L2 & L3 & L4 --> GATE{"User decision"}

    GATE -->|Approve| S4
    GATE -->|Modify| REVISE["Revise plan based on feedback
    Re-present updated layers"]
    REVISE --> GATE

    S4["Step 4 — Implement (only after approval)
    PSR-12 coding standard
    Parameterized SQL (no string concat)
    Logger calls from investigation
    Null checks and edge cases"]

    S4 --> S5["Step 5 — Post-Implementation
    Update investigation.md
    Proposed Fix + Testing Plan sections
    Suggest: ambs-commit-mr → ambs-jira-comment"]

    style STOP fill:#fdedec,stroke:#e74c3c
    style GATE fill:#fef9e7,stroke:#f39c12
    style L1 fill:#fdf2f8,stroke:#8e44ad
    style L2 fill:#eaf0fb,stroke:#2980b9
    style L3 fill:#fef9e7,stroke:#f39c12
    style L4 fill:#eafaf1,stroke:#27ae60
```

---

## Phase 5 — `ambs-commit-mr`

```mermaid
flowchart TD
    IN([Fix implemented and locally tested]) --> S1

    S1["Step 1 — Identify Ticket
    git branch --show-current
    or ask user"]

    S1 --> S2["Step 2 — Load Investigation Context
    Read investigation.md
    Affected Components · Proposed Fix · Files Changed"]

    S2 --> S3["Step 3 — Review Changed Files
    git status --short
    Cross-reference with investigation docs"]

    S3 --> S4["Step 4 — Stage Ticket-Related Files Only
    git add FILE_1 FILE_2 ...
    Never stage unrelated files"]

    S4 --> UNCLEAR{Any file's relation to ticket unclear?}
    UNCLEAR -->|yes| ASK["Ask user to confirm that file"]
    ASK --> S4
    UNCLEAR -->|no| S5

    S5["Step 5 — Compose Commit Message
    Format: AMBS-XXXXX one-line summary
    (imperative mood, ≤50 chars)
    Optional detail lines after blank line"]

    S5 --> CONFIRM{"Present commit message
    to user for confirmation"}

    CONFIRM -->|approved| S6
    CONFIRM -->|revise| S5

    S6["Step 6 — Commit
    git commit -m APPROVED_MESSAGE"]

    S6 --> S7["Step 7 — Push Branch
    git push -u origin TICKET_NUMBER"]

    S7 --> PUSHOK{Push succeeded?}
    PUSHOK -->|no| PUSHERR["Diagnose error
    Inform user — never force-push"]
    PUSHOK -->|yes| S8

    S8["Step 8 — Create GitLab MR
    node gitlab-create-mr.js
      --project PROJECT_ID
      --source TICKET_NUMBER
      --title TICKET_NUMBER description"]

    S8 --> S9["Step 9 — Report
    ✅ Committed and pushed TICKET_NUMBER
    🔗 MR_URL (pass to ambs-jira-comment)"]

    style CONFIRM fill:#fef9e7,stroke:#f39c12
    style S9 fill:#eafaf1,stroke:#27ae60
    style PUSHERR fill:#fdedec,stroke:#e74c3c
```

---

## Phase 6 — `ambs-jira-comment`

```mermaid
flowchart TD
    IN([Fix complete, MR URL available]) --> S1

    S1["Step 1 — Load Context
    Read investigation.md · dev-notes.md · error.md
    Locate GitLab MR URL from git log or user"]

    S1 --> INCOMPLETE{investigation.md
    Proposed Fix = TBD?}
    INCOMPLETE -->|yes| WARN["Warn user: investigation may be incomplete
    Ask if they want to proceed"]
    INCOMPLETE -->|no| S2W
    WARN --> S2W

    S2W{User explicitly asked
    for Teams comment?}
    S2W -->|yes| S2["Step 2 — Generate Teams Comment
    Read teams-resolution-template.md (MANDATORY)
    Write teams-comment.md
    Plain prose only · no code blocks
    Brief · focus on status + next step"]
    S2W -->|no| S3

    S2 --> S3

    S3["Step 3 — Generate JIRA Comment
    Read jira-template.md (MANDATORY)
    Write jira-comment.md with sections:
    Client Resolution · Internal Notes · Recommendations
    Changes · Resolution · Assets/Branch
    Files Changed · Tables/Fields · Dependencies
    Data Sets · QE Notes · Regression Testing
    Root Cause and Actions · Developer Testing Notes
    (includes DBReload backup filepaths)"]

    S3 --> S4["Step 4 — Present to User
    Show jira-comment.md
    (and teams-comment.md if generated)
    Ask if edits needed"]

    S4 --> S4B["Step 4b — Always Provide One-Liner Commit Message
    TICKET_NUMBER imperative summary
    (mandatory, every time)"]

    S4B --> S5{"Step 5 — Confirm Manual JIRA Post
    'Have you posted the JIRA comment?'"}

    S5 -->|Yes| S6
    S5 -->|No / not yet| WAIT["Stop here
    User can re-run cleanup later"]

    S6["Step 6 — Close Sub-Tasks
    node cleanup-subtasks.js -t TICKET_NUMBER
    Report which sub-tasks closed/skipped"]

    style S3 fill:#eafaf1,stroke:#27ae60
    style S5 fill:#fef9e7,stroke:#f39c12
    style WAIT fill:#fdedec,stroke:#e74c3c
    style S6 fill:#eafaf1,stroke:#27ae60
```

---

## Phase 7 — `ambs-close-subtasks`

```mermaid
flowchart TD
    IN([Fix committed · MR created · JIRA comment posted]) --> S1

    S1["Step 1 — Identify Ticket
    git branch --show-current
    or read investigation.md
    or ask user"]

    S1 --> S2["Step 2 — Close Sub-Tasks
    node cleanup-subtasks.js -t TICKET_NUMBER
    Finds: Dev Investigation · Code Changes · Dev Testing
    Transitions each → Done"]

    S2 --> REVIEW["Review output
    Report closed sub-tasks
    Note any already closed or not found"]

    REVIEW --> DONE([Sub-tasks closed ✅])

    style DONE fill:#eafaf1,stroke:#27ae60
```
