# MedHub Diagrams — setup on a new machine

Two GitHub Copilot skills that generate an interactive, drill-down diagram app for the MedHub PHP monolith — one feature at a time. Modeled on the KLOwen `klowen-diagrams` React app (tiers L1→L4), adapted for a single PHP monolith.

- **`medhub-diagrams-init`** — run **once**. Scaffolds the React/Vite app beside the `medhub` repo and seeds the L1 system map.
- **`medhub-diagram-feature`** — run **per feature**. Traces one feature from source and writes its L2 node + L3/L4 flow.

The generated app lives at **`~/workspace/medhub-diagrams/`** (sibling of `~/workspace/medhub/`), is its own git repo, and never goes inside the PHP repo (see `template/docs/adr/0002-*`).

## Prerequisites on the machine

- **Node.js 18+** and npm on the host PATH (the diagram app is JS/Vite — unlike MedHub's PHP, which runs in Docker; nothing here needs Docker).
- The **`medhub` repo checked out**, e.g. `~/workspace/medhub`. Ideally the sibling repos too (`global-api`, `app-server`, `framework`, `support`) if features call into them.
- **GitHub Copilot CLI** with these two skills installed (below).

## 1 — Install the skills

Copy both skill folders into your Copilot skills location (the same place your other `medhub-*` / `ambs-*` skills live — the directory the CLI exposes as `$PLUGIN_ROOT/skills`):

```
<your-copilot-plugin>/skills/
├── medhub-diagrams-init/        ← includes template/ (the app source) + README + CONTEXT + ADRs
└── medhub-diagram-feature/      ← includes references/example-feature.md
```

Copy them whole — `medhub-diagrams-init/template/` **is** the app that gets stamped out, so it must travel with the skill.

## 2 — Configure paths (`~/.copilot/.env`)

Both skills default sensibly; override only if your layout differs:

```dotenv
# Where the medhub repo is checked out (the code the feature skill traces).
PROJECT_ROOT=~/workspace/medhub
# Where the diagram app is created. Default: $PROJECT_ROOT/../medhub-diagrams
# DIAGRAMS_ROOT=~/workspace/medhub-diagrams
```

## 3 — Initialize (once)

In Copilot, trigger **`medhub-diagrams-init`** ("set up medhub diagrams"). It will:
1. refuse if the app already exists (idempotent);
2. copy `template/` → `DIAGRAMS_ROOT`;
3. `npm install`;
4. leave the seeded L1 (`medhub`, MySQL, sibling services, email) as-is;
5. verify with `npm run build` && `npm run check`.

Optionally have it `git init` the new app.

## 4 — Document a feature (repeat per feature)

Trigger **`medhub-diagram-feature`** with a **feature name + at least one entry point**:

> "Diagram the Dynamic Forms feature — entry point `/dynamicform.mh` / `DynamicFormController::render`."

It traces the request through the PHP layers **from source** (docs/Confluence are only hints), writes `src/data/features/<slug>.ts` and `src/data/flows/<slug>.ts`, appends any genuinely new L1 boundary, and verifies with `npm run build` && `npm run check`. Re-running the same feature safely overwrites its two files.

## 5 — View

```bash
cd ~/workspace/medhub-diagrams
npm run dev        # open the printed localhost URL
```

Navigate: **L1** system map (`/`) → click **MedHub** → **L2** feature map → click a feature → **L3** sequence flow → click a **ⓘ** step → **L4** detail (fields / SQL / rules, with `file:line` citations).

## Generated app layout

```
medhub-diagrams/
├── CONTEXT.md                 # glossary (System/Feature/Flow/Step)
├── docs/adr/                  # 0001 file-per-feature, 0002 app-beside-repo
├── scripts/check-feature.mjs  # headless invariant check (npm run check)
└── src/
    ├── pages/                 # SystemInteraction (L1), FeatureMap (L2), FeatureFlow (L3/L4)
    └── data/
        ├── systems.ts         # L1 — single, mutable, append-only
        ├── features.ts        # L2 types + glob barrel
        ├── flows.ts           # L3/L4 types + glob barrel + getFlow
        ├── features/<slug>.ts # one per feature  ← the feature skill writes these
        └── flows/<slug>.ts    # one per feature  ←
```

## Key design decisions (why it's shaped this way)

- **One growing app**, not one app per feature — so L1/L2 stay meaningful and you scaffold once.
- **File-per-feature data** (`docs/adr/0001`) — each run is an idempotent whole-file write; no splicing into a giant file, no key collisions.
- **App beside the repo** (`docs/adr/0002`) — keeps a Node build out of the PHP tree; diagrams version independently.
- **Source-first with `file:line` citations** — MedHub docs drift; the code is the truth, and `npm run check` enforces that L4 details are cited.
- **Explicit step `kind`** — no label-regex guessing (a wart inherited-and-removed from the reference app).
