# MedHub Diagrams

The domain vocabulary for the MedHub drill-down diagram system — a set of Copilot skills that generate an interactive React app visualizing MedHub features tier-by-tier (system → feature → flow → step). This glossary is shared by both skills (`medhub-diagrams-init`, `medhub-diagram-feature`) and by the generated app itself. It is a glossary only — no implementation details.

## Language

### Tiers (the drill-down levels)

**System** (L1):
A deployable/runtime boundary. MedHub is modeled as **one** System (the PHP monolith) plus its real external boundaries — `global-api`, `app-server`, `framework`, `support`, the MySQL database, email, and any third party a feature actually calls. An L1 node.
_Avoid_: Service (means a code layer in MedHub — see below), app, module.

**Feature** (L2):
A unit of MedHub functionality a user would name — e.g. Dynamic Forms, Evaluations, Absence. The L2 map is the surface that grows one Feature per skill run. Features are **not isolated**: a Feature may depend on another, drawn as an L2 edge.
_Avoid_: Module, page, screen, section.

**Flow** (L3):
The request path of a single Feature through MedHub's internal layers — browser/`.mh` page or AJAX listener → route/controller → service/model → gateway → `Database` → template/JSON response. A Flow is a sequence diagram, not a node graph.
_Avoid_: Sequence, trace, workflow.

**Step Detail** (L4):
The drill-down on one Step: form fields with required-status, the actual SQL a gateway runs, request/response shapes, validation rules, and `file:line` citations. Rendered in an in-panel, not a separate route.
_Avoid_: Drill-down (that's the whole mechanism, not this tier).

### Flow parts

**Actor**:
A participant on a Flow's lifeline — the browser/page, a controller, a service/model, a gateway, the `Database` wrapper, or a template/response. For MedHub these are **internal code layers of the monolith**, not separate Systems.
_Avoid_: Participant, lane, service.

**Step**:
One ordered call/message between two Actors in a Flow (`seq`, `from`, `to`, `label`, `kind`). `kind` is one of `action | route | query | render | external | cross-feature`. A Step carrying a Step Detail is clickable. A `cross-feature` Step marks a hand-off to another Feature and corresponds to an L2 edge.
_Avoid_: Message, event (an event is a specific *kind* of Step), interaction.

### Flagged ambiguities

**"Service"** — resolved to two distinct terms. A deployable boundary is a **System** (L1). A `app/services/` PHP class is a **service layer**, which appears as an **Actor** in a Flow. Never use bare "service" for an L1 node.

**"Feature" vs the code that implements it** — "Dynamic Forms" the Feature (L2 node) is distinct from any single controller/`.mh` page that implements part of it. A Feature usually spans several files; its Flow names them via citations.

## Example dialogue

> **Dev:** For Dynamic Forms, is the form-renderer controller a System or an Actor?
> **Domain:** An Actor. It's a code layer inside the monolith — the monolith is the System. It only becomes a System boundary if it calls *out* to `global-api` or the DB.
> **Dev:** And Dynamic Forms links to Evaluations — is that an Actor too?
> **Domain:** No. Evaluations is another Feature. That link is an L2 edge between two Features, not a lifeline in the Dynamic Forms Flow. You'd only see Evaluations *inside* the Flow if Dynamic Forms' request path calls Evaluations' code directly — and then it shows up as a `cross-feature` Step, cited by file, which is also what draws the L2 edge.
> **Dev:** The save Step runs three SQL statements. One Step or three?
> **Domain:** One Step (browser → gateway "save responses"), and the three SQL statements live in its Step Detail at L4.
