---
name: ambs-debug-sql
argument-hint: "<AMBS-XXXXX>"
user-invocable: false
description: "Generate safe, read-only SQL troubleshooting queries for a database-related AMBS ticket. Trigger phrases: 'generate sql for AMBS ticket', 'write troubleshooting queries', 'database error queries', 'sql to investigate [table] error', 'create debug queries'. Reads investigation.md for table/column context and writes SELECT-only queries with LIMIT clauses to $INVESTIGATIONS_ROOT/{TICKET}/queries.sql. Requires ambs-investigate to be complete."
---

# AMBS Debug SQL

Generate safe, read-only SQL troubleshooting queries for a database-related AMBS ticket. Writes queries to the investigation workspace.

## Instructions

### Prerequisites

`PLUGIN_ROOT` is set automatically by the Copilot CLI. `INVESTIGATIONS_ROOT` defaults to `$PROJECT_ROOT/docs/ambs-investigations` — no configuration needed; override by setting `INVESTIGATIONS_ROOT` in `~/.copilot/.env` only if investigations are stored elsewhere. `$TICKET_NUMBER` — extract from the current git branch (`git branch --show-current`) or ask the user.

The investigation workspace at `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/` must exist with a completed `investigation.md` — run ambs-debug-workspace and ambs-investigate first if not.

### Step 1 — Load Context

1. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/investigation.md` — focus on Affected Components (tables) and Code Analysis
2. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/error.md` for the raw error
3. Read `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/dev-notes.md` if it exists — for any developer-added database context
4. **Schema lookup** — open `$PROJECT_ROOT\.github\ref_database.md` and search for the heading `` ### `{table_name}` `` for each table name extracted from the error; read only that section. Use the column definitions (types, nullable, FK relationships) to write accurate queries. Do not load the full file.

If the investigation workspace doesn't exist, tell the user to run ambs-debug-workspace and ambs-investigate first.

### Step 2 — Identify Database Context

From the investigation, extract:
- Table names mentioned in errors or code analysis
- Column names involved in failures
- Foreign key relationships
- User IDs, record IDs, or other identifiers from the error context

If the error isn't database-related, tell the user and stop.

### Step 3 — Generate Queries

Write queries to `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/queries.sql`. Each query must:

- Be **SELECT-only** — no INSERT, UPDATE, DELETE, DROP, or ALTER
- Include **LIMIT 100** (or appropriate limit)
- Have a **comment** explaining its purpose
- Use **parameterized placeholders** where user-specific IDs should go (e.g., `-- Replace {USER_ID} with actual value`)

#### Query Categories

Generate queries as applicable:

**Record existence checks:**
```sql
-- Verify the record exists and check its current state
SELECT * FROM {table} WHERE {id_column} = {ID} LIMIT 1;
```

**Foreign key relationship verification:**
```sql
-- Check if related records exist
SELECT a.*, b.{key_column}
FROM {parent_table} a
LEFT JOIN {child_table} b ON a.{fk} = b.{pk}
WHERE a.{id} = {ID}
LIMIT 100;
```

**Orphaned record detection:**
```sql
-- Find orphaned records (missing parent)
SELECT c.*
FROM {child_table} c
LEFT JOIN {parent_table} p ON c.{fk} = p.{pk}
WHERE p.{pk} IS NULL
  AND c.{some_filter}
LIMIT 100;
```

**Data pattern analysis:**
```sql
-- Analyze distribution of relevant field values
SELECT {field}, COUNT(*) as cnt
FROM {table}
WHERE {filter}
GROUP BY {field}
ORDER BY cnt DESC
LIMIT 100;
```

**Null checks for the specific failure:**
```sql
-- Check for null values in the column that caused the error
SELECT {id}, {nullable_column}
FROM {table}
WHERE {nullable_column} IS NULL
  AND {scope_filter}
LIMIT 100;
```

### Step 4 — Report

Show the user a summary of what queries were generated and why. Suggest they run the queries against a staging or read-replica database.

### Rules

- **SELECT only** — never generate write queries
- **Always include LIMIT** — prevent excessive result sets
- **Never hardcode credentials** or connection strings
- All queries are written to `$INVESTIGATIONS_ROOT/{TICKET_NUMBER}/queries.sql`, never displayed inline only
- Append to existing `queries.sql` content, don't overwrite previous queries
