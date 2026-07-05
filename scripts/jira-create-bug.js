/**
 * jira-create-bug.js
 *
 * Create a JIRA Bug ticket on the AMBS board from a Datadog error discovery.
 * Builds an ADF-formatted description and previews the ticket before creating.
 *
 * Credentials loaded from (in order):
 *   .env  →  ATLASSIAN_* env vars  →  ~/.copilot/mcp.json
 *
 * Usage:
 *   node jira-create-bug.js \
 *     --summary "Datadog - PDF Generation Timeout" \
 *     --endpoint "GET /api/v1/reports/pdf" \
 *     --error "GuzzleHttp\\Exception\\ConnectException: cURL error 28" \
 *     --count 47 \
 *     --window "2026-04-08 14:00 to 2026-04-09 02:00" \
 *     --apm-link "https://app.datadoghq.com/apm/traces?..."
 *
 *   # Preview without creating:
 *   node jira-create-bug.js --summary "..." --endpoint "..." --error "..." --dry-run
 */

'use strict';

require('../lib/load-env');
const axios    = require('axios');
const readline = require('readline');
const { program } = require('commander');
const { loadJiraCredentials } = require('../lib/credentials');

program
  .name('jira-create-bug')
  .description('Create a JIRA Bug ticket on the AMBS board from a Datadog error')
  .requiredOption('--summary <text>', 'Ticket summary (e.g. "Datadog - PDF Generation Timeout")')
  .requiredOption('--endpoint <text>', 'HTTP endpoint (e.g. "GET /api/v1/cases")')
  .requiredOption('--error <text>', 'Error message or exception text')
  .option('--count <n>', 'Number of occurrences', parseInt)
  .option('--window <text>', 'Time window (e.g. "last 24h", "2026-04-01 to 2026-04-02")')
  .option('--apm-link <url>', 'Datadog APM traces link')
  .option('--trace-link <url>', 'Direct Datadog trace link')
  .option('--stack-trace <text>', 'Stack trace text')
  .option('--findings <text>', 'Brief findings from initial investigation')
  .option('--dry-run', 'Preview the ticket without creating it')
  .parse(process.argv);

const opts = program.opts();

// ── AMBS-specific JIRA field defaults ────────────────────────────────────────

const AMBS_DEFAULTS = {
  projectId:   '17438',
  issueTypeId: '1',      // Bug
  priorityId:  '4',      // Minor
  labels:      ['DatadogMH', ...(process.env.JIRA_LABELS ? process.env.JIRA_LABELS.split(',').map(s => s.trim()) : [])],
  componentId: '32162',  // MedHub_Datadog
};

// ── Credentials ───────────────────────────────────────────────────────────────

const { baseUrl, email, token } = loadJiraCredentials();

if (!email || !token) {
  console.error('ERROR: JIRA credentials not found.');
  console.error('  Set JIRA_USER_EMAIL + JIRA_API_TOKEN in ~/.copilot/.env');
  console.error('  or add ~/.copilot/mcp.json with atlassian env vars');
  process.exit(1);
}

if (!baseUrl) {
  console.error('ERROR: JIRA_BASE_URL not found. Set it in ~/.copilot/.env');
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

// ── ADF builder ───────────────────────────────────────────────────────────────

function txt(t)  { return { type: 'text', text: t }; }
function bold(t) { return { type: 'text', text: t, marks: [{ type: 'strong' }] }; }
function br()    { return { type: 'hardBreak' }; }

function link(url, label) {
  return {
    type: 'text',
    text: label || url,
    marks: [{ type: 'link', attrs: { href: url } }],
  };
}

function buildDescription() {
  const inline = [];

  const field = (label, value) => {
    if (!value) return;
    inline.push(bold(label + ': '), txt(value), br());
  };

  const fieldLink = (label, url) => {
    if (!url) return;
    inline.push(bold(label + ': '), link(url), br());
  };

  field('Endpoint',   opts.endpoint);
  field('Error',      opts.error);
  if (opts.count  !== undefined) field('Occurrences', String(opts.count));
  if (opts.window)  field('Window',      opts.window);
  fieldLink('Datadog APM Traces', opts.apmLink);
  fieldLink('Direct Trace',       opts.traceLink);
  if (opts.findings) field('Findings', opts.findings);
  field('Work Order', 'Investigate the scenario where this error might be encountered, and fix the issue.');

  // Remove trailing hardBreak
  while (inline.length && inline[inline.length - 1].type === 'hardBreak') inline.pop();

  const content = [{ type: 'paragraph', content: inline }];

  if (opts.stackTrace) {
    content.push({
      type: 'codeBlock',
      attrs: { language: 'text' },
      content: [txt(opts.stackTrace)],
    });
  }

  return { version: 1, type: 'doc', content };
}

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const description = buildDescription();

  const payload = {
    fields: {
      project:    { id: AMBS_DEFAULTS.projectId },
      issuetype:  { id: AMBS_DEFAULTS.issueTypeId },
      priority:   { id: AMBS_DEFAULTS.priorityId },
      summary:    opts.summary,
      description,
      labels:     AMBS_DEFAULTS.labels,
      components: [{ id: AMBS_DEFAULTS.componentId }],
    },
  };

  const hr = '═'.repeat(70);
  console.log(`\n${hr}`);
  console.log('PREVIEW — JIRA Bug Ticket (AMBS)');
  console.log(hr);
  console.log(`Summary     : ${opts.summary}`);
  console.log(`Endpoint    : ${opts.endpoint}`);
  console.log(`Error       : ${opts.error}`);
  if (opts.count  !== undefined) console.log(`Occurrences : ${opts.count}`);
  if (opts.window)   console.log(`Window      : ${opts.window}`);
  if (opts.apmLink)  console.log(`APM Link    : ${opts.apmLink}`);
  if (opts.traceLink) console.log(`Trace       : ${opts.traceLink}`);
  if (opts.findings) console.log(`Findings    : ${opts.findings}`);
  console.log(`Labels      : ${AMBS_DEFAULTS.labels.join(', ')}`);
  console.log(`Priority    : Minor`);
  console.log(`Component   : MedHub_Datadog`);
  console.log(`${hr}\n`);

  if (opts.dryRun) {
    console.log('Dry-run payload:\n');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const answer = await prompt('Create this ticket on AMBS? [y/N] ');
  if (answer !== 'y' && answer !== 'yes') {
    console.log('\nAborted. No ticket created.');
    return;
  }

  const { data } = await api.post('/rest/api/3/issue', payload);
  console.log(`\n✓ Created: ${data.key}`);
  console.log(`  ${SITE_URL}/browse/${data.key}`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
