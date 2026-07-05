/**
 * dd-dedup-check.js
 *
 * Standalone dedup check: given an error class, HTTP resource, and stack trace,
 * check data/jira-tickets.csv for an existing Jira ticket.
 *
 * Uses the same 3-branch dedup logic as dd-fetch-mcp.js:
 *   Branch 1 — issue_id + endpoint hash
 *   Branch 2 — fingerprint + endpoint hash
 *   Branch 3 — legacy fuzzy (path/message substring match)
 *
 * Usage:
 *   node dd-dedup-check.js \
 *     --method GET \
 *     --resource "/u/f/evaluations_director.mh" \
 *     --error-class "TypeError" \
 *     [--stack-trace "..."] \
 *     [--issue-id "uuid"] \
 *     [--json]
 *
 * Exit codes:
 *   0 — no match (new error, safe to create ticket)
 *   1 — open Jira ticket already exists (duplicate — should be skipped)
 *   2 — closed Jira ticket found (regression — may want to reopen)
 *   3 — error running the check
 */

'use strict';

require('../lib/load-env');
const fs   = require('fs');
const path = require('path');
const { program } = require('commander');
const { readCsv } = require('../utils/csv');
const {
  computeFingerprint,
  computeEndpointKey,
  endpointKeyHash,
  stripReleaseHash,
} = require('../utils/fingerprint');

program
  .name('dd-dedup-check')
  .description('Check if a Datadog error already has a Jira ticket')
  .requiredOption('--method <METHOD>',       'HTTP method (GET, POST, etc.)')
  .requiredOption('--resource <path>',       'HTTP resource path (e.g. /u/f/evaluations_director.mh)')
  .option('--error-class <class>',           'Error class (e.g. TypeError, Error)')
  .option('--stack-trace <text>',            'Stack trace text (improves accuracy)')
  .option('--issue-id <uuid>',               'Datadog issue UUID (strongest dedup signal)')
  .option('--json',                          'Output JSON result instead of formatted text')
  .parse(process.argv);

const opts = program.opts();

const DATA_DIR = path.resolve(__dirname, 'data');
const JIRA_CSV = path.join(DATA_DIR, 'jira-tickets.csv');

const JIRA_TICKET_HEADERS = [
  'key', 'summary', 'description', 'status', 'created',
  'labels', 'dd_issue_ids', 'dd_fps', 'dd_eps',
];

const CLOSED_STATUSES = new Set(['closed', 'resolved', 'done', 'cancelled', 'canceled']);
const isOpen = s => !CLOSED_STATUSES.has((s ?? '').toLowerCase().trim());

function splitCsv(field) {
  return (field ?? '').split(',').map(s => s.trim()).filter(Boolean);
}

function buildJiraIndex(tickets) {
  const byIssueId = new Map();
  const byFp      = new Map();
  const byEpHash  = new Map();
  const legacyUnlabeled = [];

  for (const t of tickets) {
    const labels = splitCsv(t.labels);
    const hasDdLabel = labels.some(l =>
      l.startsWith('dd-issue-') || l.startsWith('dd-fp-') || l.startsWith('dd-ep-')
    );

    for (const id of splitCsv(t.dd_issue_ids)) {
      if (!byIssueId.has(id)) byIssueId.set(id, []);
      byIssueId.get(id).push(t);
    }
    for (const fp of splitCsv(t.dd_fps)) {
      if (!byFp.has(fp)) byFp.set(fp, []);
      byFp.get(fp).push(t);
    }
    for (const ep of splitCsv(t.dd_eps)) {
      if (!byEpHash.has(ep)) byEpHash.set(ep, []);
      byEpHash.get(ep).push(t);
    }
    if (!hasDdLabel) legacyUnlabeled.push(t);
  }

  return { byIssueId, byFp, byEpHash, legacyUnlabeled };
}

function intersectByKey(a, b) {
  const bKeys = new Set((b ?? []).map(t => t.key));
  return (a ?? []).filter(t => bKeys.has(t.key));
}

function pickByOpenness(matches) {
  const open = matches.find(t => isOpen(t.status));
  if (open) return { ticket: open, openness: 'open' };
  if (matches.length) return { ticket: matches[0], openness: 'closed' };
  return null;
}

function legacyFuzzyMatch(resource, errorMessage, legacyTickets) {
  const normPath = resource.toLowerCase().trim().replace(/^[a-z]+\s+/, '').replace(/\/$/, '');
  const normMsg  = stripReleaseHash((errorMessage ?? '').toLowerCase().trim());
  for (const ticket of legacyTickets) {
    const sum  = (ticket.summary ?? '').toLowerCase();
    const desc = (ticket.description ?? '').toLowerCase();
    if (!sum.includes('datadog')) continue;
    if (normPath && (sum.includes(normPath) || desc.includes(normPath))) return ticket;
    if (normMsg && normMsg.length > 20 && stripReleaseHash(desc).includes(normMsg)) return ticket;
  }
  return null;
}

function main() {
  if (!fs.existsSync(JIRA_CSV)) {
    const msg = `data/jira-tickets.csv not found — run: npm run fetch-jira`;
    if (opts.json) {
      console.log(JSON.stringify({ error: msg }));
    } else {
      console.warn(`⚠  ${msg}`);
      console.log('No dedup data available — treating as NEW (exit 0)');
    }
    process.exit(0);
  }

  const jiraTickets = readCsv(JIRA_CSV, JIRA_TICKET_HEADERS);
  const jiraIdx     = buildJiraIndex(jiraTickets);

  const stackTrace  = opts.stackTrace ?? '';
  const errorClass  = opts.errorClass ?? '';
  const method      = (opts.method ?? 'GET').toUpperCase();
  const resource    = opts.resource ?? '';

  const fp          = computeFingerprint({ errorClass, stackTrace });
  const endpointKey = computeEndpointKey({ method, resource, stackTrace });
  const epHash      = endpointKeyHash(endpointKey);

  const issueIdStripped = (opts.issueId ?? '').replace(/-/g, '');

  const epMatches  = jiraIdx.byEpHash.get(epHash) ?? [];
  const idMatches  = issueIdStripped ? (jiraIdx.byIssueId.get(issueIdStripped) ?? []) : [];
  const fpMatches  = jiraIdx.byFp.get(fp) ?? [];

  let resolved = null;

  // Branch 1 — issue_id + endpoint
  if (issueIdStripped) {
    const idEp = intersectByKey(idMatches, epMatches);
    if (idEp.length) resolved = { branch: 'issue+ep', ...pickByOpenness(idEp) };
  }

  // Branch 2 — fingerprint + endpoint
  if (!resolved) {
    const fpEp = intersectByKey(fpMatches, epMatches);
    if (fpEp.length) resolved = { branch: 'fp+ep', ...pickByOpenness(fpEp) };
  }

  // Branch 3 — legacy fuzzy
  if (!resolved) {
    const legacy = legacyFuzzyMatch(resource, errorClass, jiraIdx.legacyUnlabeled);
    if (legacy) {
      resolved = {
        branch:   'fuzzy',
        ticket:   legacy,
        openness: isOpen(legacy.status) ? 'open' : 'closed',
      };
    }
  }

  if (!resolved) {
    if (opts.json) {
      console.log(JSON.stringify({ match: false, fp, endpointKey, epHash }));
    } else {
      console.log('✓ No duplicate found — safe to create a new ticket.');
      console.log(`  fp=${fp}  ep=${epHash}`);
    }
    process.exit(0);
  }

  const { ticket, openness, branch } = resolved;
  const jiraBase = (process.env.JIRA_BASE_URL || '').replace(/\/$/, '');
  const ticketUrl = jiraBase ? `${jiraBase}/browse/${ticket.key}` : ticket.key;

  if (opts.json) {
    console.log(JSON.stringify({
      match: true,
      openness,
      branch,
      ticket: { key: ticket.key, summary: ticket.summary, status: ticket.status, url: ticketUrl },
      fp,
      endpointKey,
      epHash,
    }));
  } else {
    if (openness === 'open') {
      console.log(`⚠  DUPLICATE (open ticket exists)`);
      console.log(`   Branch    : ${branch}`);
      console.log(`   Ticket    : ${ticket.key}  [${ticket.status}]`);
      console.log(`   Summary   : ${ticket.summary}`);
      console.log(`   URL       : ${ticketUrl}`);
    } else {
      console.log(`↩  REGRESSION (previously closed ticket)`);
      console.log(`   Branch    : ${branch}`);
      console.log(`   Ticket    : ${ticket.key}  [${ticket.status}]`);
      console.log(`   Summary   : ${ticket.summary}`);
      console.log(`   URL       : ${ticketUrl}`);
    }
  }

  process.exit(openness === 'open' ? 1 : 2);
}

try {
  main();
} catch (err) {
  console.error('FATAL:', err.message);
  process.exit(3);
}
