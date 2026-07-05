/**
 * fetch-jira.js
 *
 * Fetches all AMBS tickets labelled DatadogMH from Jira and writes them to
 * scripts/data/jira-tickets.csv so dd-dedup-check.js can perform offline
 * duplicate detection without hitting the Jira API on every trace.
 *
 * CSV columns:
 *   key, summary, description, status, created,
 *   labels, dd_issue_ids, dd_fps, dd_eps
 *
 * dd_issue_ids / dd_fps / dd_eps are extracted from Jira labels of the form:
 *   dd-issue-{uuid-no-dashes}
 *   dd-fp-{16hex}
 *   dd-ep-{8hex}
 *
 * Usage:
 *   cd "$PLUGIN_ROOT"
 *   node scripts/fetch-jira.js
 *   node scripts/fetch-jira.js --dry-run   (print count only, do not write)
 */

'use strict';

require('../lib/load-env');

const fs   = require('fs');
const path = require('path');
const axios = require('axios');
const { program } = require('commander');
const { writeCsv } = require('../utils/csv');
const { loadJiraCredentials } = require('../lib/credentials');

program
  .name('fetch-jira')
  .description('Fetch DatadogMH-labelled AMBS tickets and write to data/jira-tickets.csv')
  .option('--dry-run', 'Print fetched count without writing any files')
  .option('--project <key>', 'Jira project key', 'AMBS')
  .option('--label <label>', 'Label to filter by', 'DatadogMH')
  .parse(process.argv);

const opts = program.opts();

// ── Credentials ───────────────────────────────────────────────────────────────

const { baseUrl, email, token } = loadJiraCredentials();

if (!email || !token) {
  console.error('ERROR: Jira credentials not found.');
  console.error('  Set JIRA_USER_EMAIL + JIRA_API_TOKEN in ~/.copilot/.env');
  console.error('  or configure ~/.copilot/mcp.json with atlassian env vars');
  process.exit(1);
}

if (!baseUrl) {
  console.error('ERROR: JIRA_BASE_URL not set. Add it to ~/.copilot/.env');
  process.exit(1);
}

const SITE_URL = baseUrl;

const api = axios.create({
  baseURL: SITE_URL,
  headers: {
    Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// ── Paths ─────────────────────────────────────────────────────────────────────

const DATA_DIR  = path.resolve(__dirname, 'data');
const JIRA_CSV  = path.join(DATA_DIR, 'jira-tickets.csv');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

const JIRA_TICKET_HEADERS = [
  'key', 'summary', 'description', 'status', 'created',
  'labels', 'dd_issue_ids', 'dd_fps', 'dd_eps',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractDdLabels(labels) {
  const issueIds = [];
  const fps      = [];
  const eps      = [];
  for (const label of labels) {
    if (label.startsWith('dd-issue-'))      issueIds.push(label.slice('dd-issue-'.length));
    else if (label.startsWith('dd-fp-'))    fps.push(label.slice('dd-fp-'.length));
    else if (label.startsWith('dd-ep-'))    eps.push(label.slice('dd-ep-'.length));
  }
  return { issueIds, fps, eps };
}

// Recursively walks Atlassian Document Format nodes to produce plain text.
function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(adfToText).join(' ');
  }
  return '';
}

async function fetchPage(jql, nextPageToken) {
  const params = {
    jql,
    maxResults: 100,
    fields: 'summary,status,created,labels,description',
  };
  if (nextPageToken) params.nextPageToken = nextPageToken;
  const { data } = await api.get('/rest/api/3/search/jql', { params });
  return data;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const jql = `project = ${opts.project} AND labels = ${opts.label} ORDER BY created DESC`;
  console.log(`Fetching: ${jql}`);

  const allIssues    = [];
  let nextPageToken  = null;

  while (true) {
    const page   = await fetchPage(jql, nextPageToken);
    const issues = page.issues || [];
    allIssues.push(...issues);
    process.stdout.write(`\r  Fetched ${allIssues.length} tickets...   `);
    if (page.isLast || issues.length === 0) break;
    nextPageToken = page.nextPageToken;
  }
  console.log();

  const rows = allIssues.map(issue => {
    const f                       = issue.fields;
    const labels                  = f.labels || [];
    const { issueIds, fps, eps }  = extractDdLabels(labels);
    const descText                = adfToText(f.description)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 600);

    return {
      key:          issue.key,
      summary:      f.summary || '',
      description:  descText,
      status:       f.status?.name || '',
      created:      (f.created || '').slice(0, 10),
      labels:       labels.join(','),
      dd_issue_ids: issueIds.join(','),
      dd_fps:       fps.join(','),
      dd_eps:       eps.join(','),
    };
  });

  if (opts.dryRun) {
    console.log(`Dry-run — would write ${rows.length} rows to ${JIRA_CSV}`);
    return;
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  writeCsv(JIRA_CSV, rows, JIRA_TICKET_HEADERS);

  const state = { fetchedAt: new Date().toISOString(), count: rows.length };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log(`✓ ${rows.length} tickets → ${JIRA_CSV}`);
  console.log(`  State     → ${STATE_FILE}`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
