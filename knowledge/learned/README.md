# Learned Knowledge Base

Distilled, durable knowledge accumulated from working AMBS tickets — architecture details, deployment quirks, troubleshooting patterns, business context. This is the plugin's "second brain": facts that would change how a *future* ticket is investigated, so the agent (and the developer) don't rediscover them from scratch.

Managed by the `ambs-knowledge` skill. Recalled automatically by `ambs-investigate` (Step 3b, Lookup 0) and consulted by `ambs-fix-plan`.

## Layout

```
knowledge/learned/
├── README.md          # this file — the format spec
├── INDEX.md           # one line per entry — the ONLY file loaded for recall
└── <entry-name>.md    # one fact per file, kebab-case filename matching frontmatter name
```

## Entry format

```markdown
---
name: pdc-channels-need-db-property-injection
description: PDC channel classes read `db` from a protected property, not constructor args
type: domain-gotcha
tags:
  classes: [PDCLoginStatistics, PortfolioDashboardChannel]
  tables: []
  features: [Portfolio Dashboard]
sources: [AMBS-22260]
learned: 2026-07-05
---

PDC channel classes never receive the Database wrapper through their constructor — it is
injected as a protected `db` property by the dashboard bootstrap. Any channel code path
that runs outside the dashboard (cron, unit test) has a null `db` until injected.

**Why it matters:** Stack traces landing inside a channel's query call look like a channel
bug, but the real fault is the caller that instantiated the channel without injecting `db`.

**How to apply:** When a channel class crashes on a DB call, trace who constructed it and
whether the `db` property was set — check the bootstrap path, not the channel.

Related: [[some-other-entry]]
```

### Fields

| Field | Rule |
|---|---|
| `name` | kebab-case slug, matches the filename (without `.md`) |
| `description` | one line — what the fact is, used to judge relevance at recall time |
| `type` | one of: `architecture` \| `deployment-quirk` \| `troubleshooting-pattern` \| `domain-gotcha` \| `business-context` \| `environment` |
| `tags` | `classes` / `tables` / `features` lists — same vocabulary as `knowledge/confluence/TAGS.json`; these drive recall matching |
| `sources` | ticket(s) that taught this (e.g. `AMBS-22260`); append when a new ticket confirms it |
| `learned` | absolute date (`YYYY-MM-DD`) — never relative dates |

Body: the fact in 2–6 sentences, then **Why it matters:** (the failure mode hit without this knowledge) and **How to apply:** (what to do/check when it comes up). Link related entries with `[[entry-name]]`.

## INDEX.md contract

One line per entry, exactly this shape:

```
- [Title](entry-file.md) — one-line hook (tags: ClassName, table_name, Feature Keyword)
```

Tags are flattened inline so a single case-insensitive grep of `INDEX.md` for a class,
table, or feature keyword resolves matching entries — no other file is loaded for recall.

## Rules

- **One fact per file.** Split unrelated learnings into separate entries.
- **Non-obvious only.** Never store what is derivable from code, git history, or `ref_database.md` — store what those sources *don't* say.
- **No ticket-specific data.** Record IDs, one-off data states, and per-ticket details stay in the ticket's `investigation.md`.
- **Update, don't duplicate.** If an entry already covers the fact, refine it and append the new source ticket instead of creating a sibling.
- **Delete entries proven wrong.** Stale knowledge is worse than no knowledge.
- **This repo only.** Entries are committed to the ai-agents repo — never staged into a project-repo ticket MR.
