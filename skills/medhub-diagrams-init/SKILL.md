---
name: medhub-diagrams-init
description: "Scaffold the MedHub Diagrams app ONCE. Trigger phrases: 'set up medhub diagrams', 'init the diagrams app', 'bootstrap medhub-diagrams', 'create the diagram app'. Copies the bundled React/Vite template into a sibling folder of the medhub repo, installs deps, seeds the L1 system-interaction data, and verifies the build. Run this before medhub-diagram-feature. Idempotent — refuses to clobber an existing app."
---

# MedHub Diagrams — Init

Stand up the drill-down diagram app **once**, as a sibling of the `medhub` repo. After this, use `medhub-diagram-feature` (one run per feature) to fill in the L2 map and L3/L4 flows. Read [template/CONTEXT.md](template/CONTEXT.md) for the vocabulary (System / Feature / Flow / Step) and [template/docs/adr/](template/docs/adr/) for the two architectural decisions this app is built on.

## Paths

- `PLUGIN_ROOT` — set by the Copilot CLI. The template lives at `$PLUGIN_ROOT/skills/medhub-diagrams-init/template` (adjust if your plugin layout differs).
- `PROJECT_ROOT` — the `medhub` checkout.
- `DIAGRAMS_ROOT` — where the app is created. Default **`$PROJECT_ROOT/../medhub-diagrams`** (i.e. beside the repo, per ADR-0002). Override by setting `DIAGRAMS_ROOT` in `~/.copilot/.env`.

## Steps

### 1 — Guard against clobbering

If `$DIAGRAMS_ROOT/package.json` already exists, **stop**: the app is already initialized. Tell the user to run `medhub-diagram-feature` instead, or to delete the folder first if they really want a clean rebuild. Do not overwrite.

### 2 — Copy the template

Create `$DIAGRAMS_ROOT` and copy the **entire** `template/` directory into it (including `CONTEXT.md`, `docs/`, `scripts/`, `src/`, and the dotfiles like `.gitignore`).

```bash
# bash
mkdir -p "$DIAGRAMS_ROOT" && cp -R "$PLUGIN_ROOT/skills/medhub-diagrams-init/template/." "$DIAGRAMS_ROOT/"
```
```powershell
# PowerShell
New-Item -ItemType Directory -Force "$env:DIAGRAMS_ROOT" | Out-Null
Copy-Item -Recurse -Force "$env:PLUGIN_ROOT\skills\medhub-diagrams-init\template\*" "$env:DIAGRAMS_ROOT"
```

Confirm `src/data/features/` and `src/data/flows/` exist (they ship with a `.gitkeep`) — these are where the feature skill writes.

### 3 — Install

```bash
cd "$DIAGRAMS_ROOT" && npm install
```

Node/npm are on the host PATH (unlike PHP — that runs in Docker). If `npm install` fails on `tsx`/`vite`, check the Node version is 18+.

### 4 — Seed L1 (only if you already know real boundaries)

`src/data/systems.ts` ships with a sensible default L1: the `medhub` monolith, MySQL, the sibling repos (`global-api`, `app-server`, `framework`, `support`), and email. **Leave it as-is** unless the user can already name a concrete external boundary to add — L1 is append-only and the feature skill will grow it as flows reveal real calls (mutable-L1 rule; L1 stays a single file, unlike L2). Do not invent boundaries.

### 5 — Verify

Both must pass:

```bash
cd "$DIAGRAMS_ROOT" && npm run build && npm run check
```

- `npm run build` — `tsc -b` + `vite build`. Fails on any malformed data type.
- `npm run check` — headless invariant check (`scripts/check-feature.mjs`). With zero features it reports `0 feature(s), 0 flow(s)` and passes.

If the user wants to see it: `npm run dev` and open the printed localhost URL — L1 renders with the seed nodes.

### 6 — Optional: make it a git repo

The app is meant to version independently (ADR-0002). If the user wants that: `cd "$DIAGRAMS_ROOT" && git init && git add -A && git commit -m "Scaffold MedHub Diagrams app"`.

### 7 — Hand off

Tell the user init is done and the next step is `medhub-diagram-feature` with a feature name + entry point(s). Point them at `medhub-diagrams-init/README.md` for the full one-time machine setup.

## Rules

- **Idempotent** — never overwrite an existing app (step 1 guard).
- **Do not author features here** — this skill only scaffolds + seeds L1. Features are the other skill's job.
- **Do not invent L1 boundaries** — ship the default seed; let real flows grow L1.
