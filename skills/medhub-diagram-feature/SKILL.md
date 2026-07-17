---
name: medhub-diagram-feature
description: "Document ONE MedHub feature as a drill-down diagram (L2 node + L3 sequence flow + L4 step detail). Trigger phrases: 'diagram the X feature', 'add X to the medhub diagrams', 'map the flow for X', 'generate a diagram for the X feature'. Takes a feature name + entry point(s), traces the request through the PHP layers from SOURCE (docs are hints only), and writes one features/<slug>.ts + one flows/<slug>.ts into the medhub-diagrams app. Requires medhub-diagrams-init to have run first."
---

# MedHub Diagram — One Feature

Add a single MedHub feature to the growing diagram app. Each run writes exactly two files and never touches another feature's files. Read [../medhub-diagrams-init/template/CONTEXT.md](../medhub-diagrams-init/template/CONTEXT.md) first for the vocabulary — this skill assumes System / Feature / Flow / Actor / Step / Step Detail mean exactly what the glossary says.

## Paths & preconditions

- `PROJECT_ROOT` — the `medhub` checkout (the code you trace).
- `DIAGRAMS_ROOT` — the app. Default `$PROJECT_ROOT/../medhub-diagrams`; override in `~/.copilot/.env`.
- **Precondition:** `$DIAGRAMS_ROOT/package.json` must exist. If not, tell the user to run `medhub-diagrams-init` first and stop.
- Sibling repos (`global-api`, `app-server`, `framework`, `support`) may hold code a feature calls out to — search them if the trace leaves `medhub`.

## Input (ask if missing)

1. **Feature name** — human name, e.g. "Dynamic Forms". Derive the **slug** (kebab-case, e.g. `dynamic-forms`). The slug is the file name and the L2 node id.
2. **Entry point(s)** — at least one: a `.mh` page, a URL, an AJAX listener, or a controller action. **Do not proceed on a bare name** — grep on a generic name over this monolith returns noise. If the user gives only a name, help them find an entry point (search routes/templates), confirm it, then proceed.

If `features/<slug>.ts` already exists, this is a **refresh** — you will overwrite both files (idempotent by design; ADR-0001). Say so.

## Step 1 — Orient with docs/KB as HINTS ONLY

Consult, but do not trust:
- `$PROJECT_ROOT/docs/features/<name>.md` if present.
- The Confluence KB the way `ambs-investigate` does (`$PLUGIN_ROOT/knowledge/confluence/index.json` → files), if available.

Treat everything here as a lead to verify against code. MedHub docs drift; the reference project repeatedly found docs describing endpoints and validation that the code did not implement. **Every fact in the output must come from code and carry a citation.**

## Step 2 — Trace the flow from source

This is the forward trace from `ambs-investigate` (Step 4 there), reused to *build* a flow rather than debug one. From each entry point, follow the request through the layers and record them as **Actors**:

`browser / .mh page or AJAX listener → route/controller → service or model (app/services, app/models, app/domainModels) → gateway → app\services\core\Database → template/JSON response`

- Give each layer you actually pass through a `FlowActor` (`role: 'user'` for the human/browser, `'layer'` for MedHub code, `'system'` for an external boundary).
- Record each call between layers as a `FlowStep` in request order (`seq` 1..n), with an explicit **`kind`**: `action` (user submits/clicks), `route` (into a controller/action), `query` (a real SQL call via the gateway/`Database`), `render` (produces the response/template), `external` (calls a sibling service, MySQL as a boundary, email, or a third party), `cross-feature` (hands off to another feature's code).
- **There is no label-regex inference** — you set `kind` from what the code does. Do not rely on wording.

### Boundary rule (where the feature ends)

When the trace reaches code that belongs to a **different feature**, STOP — do not recurse into it. Emit:
- a `cross-feature` step with `crossFeatureTo: '<other-slug>'`, and
- a matching L2 edge in this feature's `dependsOn` (`{ to: '<other-slug>', label: '…' }`).

When the trace calls **out** of the monolith (MySQL, a sibling repo, email, a third party), that target is an **L1 boundary**: use an `external` step whose `to` actor is that boundary. If that boundary is **not already a node in `src/data/systems.ts`**, append it (and an edge from `medhub`) — L1 is mutable and append-only. Do not append a boundary that already exists.

## Step 3 — Add L4 detail, SELECTIVELY

L4 (`step.detail`) is expensive — add it only where it earns its place:
- the **form-submit `action` step** → `fields` (name, type, `required`, validation, notes) with per-field `source`;
- every **`query` step** → the actual `sql` (and the tables), plus any rules;
- **`external` / `cross-feature` steps** → the `request`/`response` contract.

Plain `route`/`render` steps usually stay L3-only. **Every `detail` must set `sources` with `file:line` citations** — the check script enforces this, and `query` details must include `sql`.

Determine `required` from the **code**, not the UI asterisks (the reference found required-looking fields that were never enforced server-side — note that kind of gap in the flow `note`).

## Step 4 — Write the two files

Write `$DIAGRAMS_ROOT/src/data/features/<slug>.ts` and `$DIAGRAMS_ROOT/src/data/flows/<slug>.ts`. Follow the shapes in [references/example-feature.md](references/example-feature.md) exactly:
- feature file `export default` a `FeatureNode` (id = slug, `entryPoints` = what you traced, `actors` = short chips, `dependsOn` = cross-feature edges);
- flow file `export default` a `FeatureFlowData` with `key: 'medhub/<slug>'`.
- Import **types only** (`import type { … }`) from `../features` / `../flows` — never import the barrels' runtime values.

Record any real caveat (unenforced validation, dead code, silent failure) in the flow `note`.

## Step 5 — Verify (mandatory)

```bash
cd "$DIAGRAMS_ROOT" && npm run build && npm run check
```

- `npm run build` — types must compile.
- `npm run check` — invariants: every `from`/`to` is a declared actor, `key` resolves to your feature node, every `dependsOn`/`crossFeatureTo` target exists, seqs are 1..n, and every L4 detail carries a citation.

Fix and re-run until both are green. Only then report done. Optionally `npm run dev` and open `/system/medhub/feature/<slug>` for a visual check.

## Rules

- **Source-first, always cited.** No fact without a `file:line`. Docs/KB are hints, not truth.
- **One feature per run, two files.** Never edit another feature's files. `systems.ts` is the only shared file you may append to, and only for a genuinely new boundary.
- **Stop at feature boundaries** — hand off with a `cross-feature` step + `dependsOn` edge; don't absorb another feature.
- **Idempotent** — re-running overwrites this feature's two files cleanly.
- **Green gate** — `npm run build` and `npm run check` both pass before you claim success.
