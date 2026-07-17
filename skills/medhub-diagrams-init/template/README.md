# MedHub Diagrams

Interactive drill-down diagrams of the MedHub monolith, generated one feature at a time by the `medhub-diagram-feature` Copilot skill. This app is scaffolded by `medhub-diagrams-init` — you normally don't edit it by hand.

## Run

```bash
npm install
npm run dev       # view
npm run build     # typecheck + build
npm run check     # headless data-invariant check
```

## Tiers

- **L1** `/` — System Interaction: the monolith + external boundaries.
- **L2** `/system/medhub` — Feature map (nodes = features, edges = cross-feature dependencies).
- **L3** `/system/medhub/feature/<slug>` — the feature's request flow through the PHP layers.
- **L4** — click a **ⓘ** step for fields / SQL / rules, with `file:line` citations.

## Data

Each feature owns two files — `src/data/features/<slug>.ts` (L2 node) and `src/data/flows/<slug>.ts` (L3/L4). They import only *types* from `features.ts` / `flows.ts`, which glob-collect them. See `CONTEXT.md` for vocabulary and `docs/adr/` for why it's built this way.
