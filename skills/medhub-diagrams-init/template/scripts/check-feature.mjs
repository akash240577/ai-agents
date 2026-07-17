// Headless invariant check for the MedHub Diagrams data files.
// Run with tsx so it can import the .ts data files: `npm run check`.
//
// Catches the cross-file mistakes that `tsc` cannot: dangling actor refs,
// flow keys with no matching feature node, L2 edges to non-existent features,
// bad seq numbering, and missing citations on L4 details.
//
// Feature/flow files import ONLY types from the barrels, so importing them here
// never triggers `import.meta.glob` (which is Vite-only). systems.ts has no glob.

import { readdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', 'src', 'data')

const errors = []
const err = (m) => errors.push(m)

const STEP_KINDS = new Set(['action', 'route', 'query', 'render', 'external', 'cross-feature'])
const CITATION = /\.(php|mh|inc|tpl|twig|js|ts)(:\d+)?/i

async function importDefault(file) {
  const mod = await import(pathToFileURL(file).href)
  return mod.default
}

async function loadDir(sub) {
  const dir = join(dataDir, sub)
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts'))
  const out = []
  for (const f of files) out.push({ file: `${sub}/${f}`, slug: f.replace(/\.ts$/, ''), value: await importDefault(join(dir, f)) })
  return out
}

const { systemNodes } = await import(pathToFileURL(join(dataDir, 'systems.ts')).href)
const systemIds = new Set(systemNodes.map((s) => s.id))
const featureMapSystems = new Set(systemNodes.filter((s) => s.hasFeatureMap).map((s) => s.id))

const features = await loadDir('features')
const flows = await loadDir('flows')

const featureIds = new Set(features.map((f) => f.value.id))

// ---- feature nodes ----
const seenFeatureIds = new Set()
for (const { file, slug, value: f } of features) {
  if (!f || !f.id) { err(`${file}: missing default export or id`); continue }
  if (f.id !== slug) err(`${file}: feature id "${f.id}" must match filename slug "${slug}"`)
  if (seenFeatureIds.has(f.id)) err(`${file}: duplicate feature id "${f.id}"`)
  seenFeatureIds.add(f.id)
  const sys = f.system ?? 'medhub'
  if (!systemIds.has(sys)) err(`${file}: system "${sys}" is not an L1 node`)
  else if (!featureMapSystems.has(sys)) err(`${file}: system "${sys}" has hasFeatureMap=false`)
  for (const dep of f.dependsOn ?? []) {
    if (!featureIds.has(dep.to)) err(`${file}: dependsOn target "${dep.to}" is not a documented feature`)
  }
  if (!f.entryPoints || f.entryPoints.length === 0) err(`${file}: no entryPoints recorded (skill must capture what it traced)`)
}

// ---- flows ----
const seenKeys = new Set()
for (const { file, value: flow } of flows) {
  if (!flow || !flow.key) { err(`${file}: missing default export or key`); continue }
  if (seenKeys.has(flow.key)) err(`${file}: duplicate flow key "${flow.key}"`)
  seenKeys.add(flow.key)

  const [sys, feat] = flow.key.split('/')
  if (!sys || !feat) err(`${file}: key "${flow.key}" must be "{system}/{featureId}"`)
  if (sys && !systemIds.has(sys)) err(`${file}: key system "${sys}" is not an L1 node`)
  if (feat && !featureIds.has(feat)) err(`${file}: key feature "${feat}" has no feature node`)

  const actorIds = new Set((flow.actors ?? []).map((a) => a.id))
  if (actorIds.size !== (flow.actors ?? []).length) err(`${file}: duplicate actor id`)
  if (!flow.steps || flow.steps.length === 0) { err(`${file}: flow has no steps`); continue }

  flow.steps.forEach((s, i) => {
    const at = `${file} step[${i}] (seq ${s.seq})`
    if (s.seq !== i + 1) err(`${at}: seq should be ${i + 1} (steps must be 1..n in order)`)
    if (!STEP_KINDS.has(s.kind)) err(`${at}: invalid kind "${s.kind}"`)
    if (!actorIds.has(s.from)) err(`${at}: from "${s.from}" is not a declared actor`)
    if (!actorIds.has(s.to)) err(`${at}: to "${s.to}" is not a declared actor`)
    if (s.kind === 'cross-feature') {
      if (!s.crossFeatureTo) err(`${at}: cross-feature step needs crossFeatureTo`)
      else if (!featureIds.has(s.crossFeatureTo)) err(`${at}: crossFeatureTo "${s.crossFeatureTo}" is not a documented feature`)
      else {
        const f = features.find((x) => x.value.id === feat)
        const hasEdge = f?.value.dependsOn?.some((d) => d.to === s.crossFeatureTo)
        if (!hasEdge) err(`${at}: cross-feature to "${s.crossFeatureTo}" has no matching L2 dependsOn edge on feature "${feat}"`)
      }
    }
    if (s.detail) {
      const d = s.detail
      const hasBody = d.summary || d.fields || d.sql || d.request || d.response || d.rules
      if (!hasBody) err(`${at}: detail is present but empty`)
      if (!d.sources || d.sources.length === 0) err(`${at}: L4 detail must cite sources (file:line)`)
      else if (!d.sources.some((s2) => CITATION.test(s2))) err(`${at}: detail sources should look like file:line citations`)
      if (s.kind === 'query' && (!d.sql || d.sql.length === 0)) err(`${at}: query step detail should include the SQL`)
    }
  })
}

if (errors.length) {
  console.error(`\n✗ check-feature: ${errors.length} problem(s)\n`)
  for (const e of errors) console.error('  - ' + e)
  console.error('')
  process.exit(1)
}
console.log(`✓ check-feature: ${features.length} feature(s), ${flows.length} flow(s) — all invariants hold`)
