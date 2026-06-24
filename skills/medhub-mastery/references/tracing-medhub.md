# Tracing a Feature in MedHub's Legacy PHP

MedHub is a large PHP codebase (800+ database tables) from Ascend Learning. It is a **hybrid**: modern routed MVC traffic enters `public/index.php` → FastRoute config in `app/routes.php` → `app\controllers\...` controllers, with a Pimple DI container (`app/services.php`), gateways (`app/gateways.php`), and a domain-model layer (`app/domainModels/`); **alongside** legacy `.mh` scripts under `public/`, `public/functions/`, `public/u/` that execute directly and bootstrap via `app/includes/common/include_initialize.mh`. A given feature may live on either path (or both), so don't assume one style — confirm everything by reading.

**Tool reference (use whichever agent you're in):**
- Search file contents → Claude Code: `Grep` | Copilot: `#codebase` keyword search
- Find files by name/pattern → Claude Code: `Glob` | Copilot: `#codebase` / `@workspace`
- Read a file → Claude Code: `Read` | Copilot: `#file:path/to/file.php`

## Step 0: Mine the curated docs first (do this before grepping code)

This repo ships two knowledge bases that already did much of the tracing. Start here to get verified pointers and tribal knowledge, then confirm in code:

- **Business view — `C:\Users\akash.rajput\workspace\ambs-toolkit\knowledge\confluence`**: grep `index.json` for the feature, open its `MED\...\MedHub-<Feature>\...-markdown.md` page for purpose, real behavior, and "what to watch for" (failure modes). This is support/GME tribal knowledge you cannot infer from code.
- **Technical view — `docs/`**: read `docs/ARCHITECTURE_OVERVIEW.md` (index), the relevant `docs/architecture/*.md` workflow, and the matching `docs/features/*.md` (often already code-traced with file paths). For DB table details, use `C:\Users\akash.rajput\workspace\medhub\.github\ref_database.md` — search for `` ### `{table_name}` `` headings to look up specific tables among the 800+ without loading the full file.

Treat these as a map, not gospel: still open the real files and cite exact paths/lines. If docs and code conflict, **production code wins** — note the mismatch.

## Step 1: Find the entry points

A feature is invoked from somewhere. Look, in order:

- **URL → handler mapping.** Two patterns coexist: (a) **routed MVC** — named routes in `app/routes/*.php` map to `app\controllers\...` actions (params and container services are auto-wired by `MHController::resolveParameters()`); (b) **legacy `.mh`** — URLs map directly to `.mh`/`.php` scripts in `public/`. Grep `app/routes/` for the feature's route name, and separately grep `public/` for the page name, menu label, or form `action=` targets.
- **Menu/nav definitions.** Coordinator/faculty/resident portals usually have nav config that reveals the canonical entry URL for a feature.
- **AJAX endpoints.** Much MedHub interactivity is AJAX POSTs to specific PHP handlers. Grep for the JS that fires the request to find the server handler.

Record exact file paths and line numbers in `TRACE.md`.

## Step 2: Walk the request lifecycle

Trace one concrete action (e.g. "coordinator approves a duty-hour log"):

1. **Input handling** — how are `$_GET`/`$_POST`/request params read and validated? Legacy code often validates inline and inconsistently; note where validation is weak (a future failure mode).
2. **Auth/permission checks** — MedHub is multi-role (resident, faculty, coordinator, admin) and multi-program. Find the permission gate. These checks are a classic source of prod bugs and are easy for a newcomer to miss.
3. **Business logic** — the functions that enforce the actual rules. In legacy PHP this is often procedural functions or large "manager"/"helper" includes rather than tidy service classes. Follow `require`/`include` chains.
4. **Data layer** — how it reaches the DB. Modern slices use gateways (`app/gateways/`, extending `AbstractGateway`) with parameterized helpers, and domain models in `app/domainModels/`; legacy code uses raw SQL strings via the `Database` wrapper. Capture the actual table and column names — don't paraphrase them. Cross-reference `C:\Users\akash.rajput\workspace\medhub\.github\ref_database.md` (search `` ### `{table_name}` `` headings) to confirm column types, FKs, and nullable fields for tables belonging to the feature.
5. **Response/render** — how output is produced (inline HTML echo, template include, JSON for AJAX).

## Step 3: Map the data model precisely

With 800+ tables, precision matters. For the feature:
- Identify the **core tables** it reads/writes and their primary/foreign keys.
- Note **status/state columns** (e.g. `status`, `approved`, `is_deleted`, soft-delete flags) — state transitions are where business rules and bugs concentrate.
- Note **join tables** linking residents↔programs↔rotations↔evaluations etc.
- Watch for **denormalized or duplicated data** and audit/history tables — legacy systems often keep parallel copies that drift.

## Step 4: Surface where business rules hide

The highest-value, hardest-to-spot logic in legacy PHP:
- Conditionals on role + program + status combinations.
- Date/time logic (academic years, rotation periods, ACGME reporting windows) — timezone and boundary bugs are common.
- Hardcoded constants, magic numbers, and feature flags.
- Cron jobs / scheduled scripts that mutate state outside the request cycle — these cause "it changed and nobody touched it" prod mysteries.

## Step 5: Identify failure modes

For troubleshooting readiness, explicitly note:
- Nullable columns the code assumes are populated.
- Permission edge cases (cross-program access, deactivated users, role changes mid-cycle).
- Race conditions on concurrent edits/approvals.
- Data-integrity gaps where no FK or validation enforces an assumed invariant.
- Places where validation is client-side only.

## Discipline

- Cite a real file path + line range for every claim.
- If you cannot confirm something from the code, mark it `[UNVERIFIED]`. Do not fill gaps with assumptions about how PHP apps "usually" work.
- Keep MedHub source **and** the Confluence knowledge in `ambs-toolkit\knowledge` local — never paste either into web search or external tools. Web search is only for general GME/ACGME or PHP-language questions.
