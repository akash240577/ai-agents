/**
 * jira-clone-ticket.js
 *
 * Create a JIRA Bug ticket by cloning a template ticket (e.g. AMBS-22917).
 * Copies all custom fields from the template (severity, found_in_env, found_via,
 * is_in_prod, etc.) and overrides summary, description, labels, and Datadog links.
 *
 * Template fields are loaded from cache (data/jira-template-{KEY}.json) if available,
 * otherwise fetched live from Jira. Re-cache with: node cache-template.js --template AMBS-22917
 *
 * Credentials loaded from (in order):
 *   .env  →  ATLASSIAN_* env vars  →  ~/.copilot/mcp.json
 *
 * Usage:
 *   node jira-clone-ticket.js \
 *     --template AMBS-22917 \
 *     --summary "Datadog - Incomplete Evaluations XLS Export Timeout" \
 *     --endpoint "GET /u/c/evaluations_incomplete.mh" \
 *     --url "https://buffalo.medhub.com/u/c/evaluations_incomplete.mh?export=xls&status=3" \
 *     --error "Maximum execution time of 30 seconds exceeded" \
 *     --first-seen "today" \
 *     --version "mh.20260521165521" \
 *     --trace-link "https://us3.datadoghq.com/apm/trace/abc123" \
 *     [--apm-link "https://us3.datadoghq.com/apm/traces?query=..."] \
 *     [--stack-trace "..."] \
 *     [--findings "..."] \
 *     [--dd-issue-id "uuid"] \
 *     [--dd-fp "16hex"] \
 *     [--dd-ep "8hex"] \
 *     [--dry-run]
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios    = require('axios');
const fs       = require('fs');
const path     = require('path');
const readline = require('readline');
const { program } = require('commander');
const { loadJiraCredentials } = require('../lib/credentials');
const { execSync } = require('child_process');

program
  .name('jira-clone-ticket')
  .description('Create a JIRA Bug by cloning a template ticket and filling Datadog error details')
  .requiredOption('--template <KEY>',   'Template ticket to clone (e.g. AMBS-22917)')
  .requiredOption('--summary <text>',   'Ticket summary (e.g. "Datadog - PDF Generation Timeout")')
  .requiredOption('--endpoint <text>',  'HTTP endpoint (e.g. "GET /u/f/reports.mh")')
  .option('--error <text>',             'Error message or exception text')
  .option('--url <url>',                'Full URL with query params (from APM logs)')
  .option('--count <n>',                'Number of occurrences', parseInt)
  .option('--window <text>',            'Time window (e.g. "2026-04-01 to 2026-04-02")')
  .option('--first-seen <text>',        'Human-readable "first seen" text (e.g. "2 days ago")')
  .option('--last-seen <text>',         'Human-readable "last seen" text (e.g. "11 hours ago")')
  .option('--version <text>',           'Deploy version tag (e.g. "mh.20260521165521")')
  .option('--apm-link <url>',           'Datadog APM traces link')
  .option('--trace-link <url>',         'Direct Datadog trace link')
  .option('--stack-trace <text>',       'Stack trace text')
  .option('--findings <text>',          'Brief findings from initial investigation')
  .option('--dd-issue-id <uuid>',       'Datadog issue UUID (for dd-issue-* label)')
  .option('--dd-fp <hex>',              'Datadog fingerprint 16-hex (for dd-fp-* label)')
  .option('--dd-ep <hex>',              'Datadog endpoint key 8-hex (for dd-ep-* label)')
  .option('--repo-root <path>',         'Path to repository root for repo inspection (overrides default)')
  .option('--dry-run',                  'Preview the ticket without creating it')
  .parse(process.argv);

const opts = program.opts();

// ── Credentials ───────────────────────────────────────────────────────────────

const { baseUrl, email, token } = loadJiraCredentials();

if (!email || !token) {
  console.error('ERROR: JIRA credentials not found.');
  console.error('  Set JIRA_USER_EMAIL + JIRA_API_TOKEN in .env');
  process.exit(1);
}

const SITE_URL = baseUrl || 'https://ascend-learning.atlassian.net';

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

function txt(t)        { return { type: 'text', text: t }; }
function bold(t)       { return { type: 'text', text: t, marks: [{ type: 'strong' }] }; }
function underline(t)  { return { type: 'text', text: t, marks: [{ type: 'underline' }] }; }

function link(url, label) {
  return {
    type: 'text',
    text: label || url,
    marks: [{ type: 'link', attrs: { href: url } }],
  };
}

function para(...inline) {
  return { type: 'paragraph', content: inline };
}

function buildDescription() {
  const content = [];

  // Split findings into: investigation text, end user impact block, related changes block
  let investigationText = opts.findings || '';
  let endUserImpactText = '';
  let relatedChangesText = '';

  if (investigationText) {
    const impactMatch = investigationText.match(/\n\nEnd User Impact:\n([\s\S]*?)(?=\n\nRelated Recent Changes:|$)/);
    const changesMatch = investigationText.match(/\n\nRelated Recent Changes:\n([\s\S]*?)$/);
    if (impactMatch) {
      endUserImpactText = impactMatch[1].trim();
      investigationText = investigationText.slice(0, investigationText.indexOf('\n\nEnd User Impact:')).trim();
    }
    if (changesMatch) {
      relatedChangesText = changesMatch[1].trim();
    }
  }

  // SUMMARY OF ISSUE
  content.push(para(bold('SUMMARY OF ISSUE')));

  // Business-facing summary (derived from summary option)
  content.push(para(txt(opts.summary.replace(/^Datadog - /, ''))));

  // End User Impact (moved into SUMMARY OF ISSUE)
  if (endUserImpactText) {
    content.push(para(bold('End User Impact')));
    endUserImpactText.split('\n').forEach(line => {
      if (line.trim()) content.push(para(txt(line.trim())));
    });
  }

  // URL line
  if (opts.url) {
    content.push(para(txt('URL: ' + opts.url)));
  } else if (opts.endpoint) {
    content.push(para(txt('URL: ' + opts.endpoint)));
  }

  // Datadog link line
  const ddLink = opts.traceLink || opts.apmLink;
  if (ddLink) {
    content.push(para(txt('Datadog - '), link(ddLink)));
  }

  // First / Last seen and version line
  {
    const parts = [];
    parts.push(bold('First seen '));
    if (opts.firstSeen) parts.push(underline(opts.firstSeen + ' '));

    if (opts.lastSeen) {
      parts.push(txt('  '), bold('Last seen '), underline(opts.lastSeen + ' '));
    }

    if (opts.version) {
      parts.push(txt('  '), txt(opts.version));
    }

    if (parts.length > 1) {
      content.push(para(...parts));
    }
  }

  // Error + Stack trace code block (always include full message + frames)
  if (opts.stackTrace || opts.error) {
    content.push(para(bold('ERROR')));
    let fullStack = opts.stackTrace ? String(opts.stackTrace) : '';
    // If an explicit error message was provided and isn't already contained in the stack block, prepend it
    if (opts.error) {
      const errText = String(opts.error);
      if (!fullStack.includes(errText)) {
        fullStack = errText + (fullStack ? '\n' + fullStack : '');
      }
    }

    // Push entire stack/message into a single code block so the ticket contains the full context
    content.push({
      type: 'codeBlock',
      attrs: { language: 'text' },
      content: [txt(fullStack)],
    });
  }

  // Findings
  content.push(para(bold('Findings')));
  const findingsBody = [investigationText, relatedChangesText ? 'Related Recent Changes:\n' + relatedChangesText : '']
    .filter(Boolean).join('\n\n') || 'See trace for details.';
  content.push(para(txt(findingsBody)));

  // Work Order
  content.push(para(bold('WORK ORDER')));
  content.push(para(txt('Investigate the scenario where this error might be encountered, and fix the issue.')));

  return { version: 1, type: 'doc', content };
}

// ── Field copying: decide which template fields to inherit ────────────────────

// Fields that must NOT be copied from the template (they are set fresh)
const SKIP_FIELDS = new Set([
  'summary', 'description', 'labels', 'comment', 'attachment',
  'issuelinks', 'subtasks', 'worklog', 'votes', 'watches',
  'created', 'updated', 'resolutiondate', 'lastViewed',
  'status', 'resolution', 'assignee', 'reporter',
  'project', 'issuetype', 'aggregateprogress', 'progress',
  'timespent', 'aggregatetimespent', 'timeestimate',
  'aggregatetimeoriginalestimate', 'timeoriginalestimate',
  'rankBeforeIssue', 'rankAfterIssue', 'rank',
  'customfield_10019', // rank field
]);

function extractInheritedFields(templateFields) {
  const inherited = {};
  for (const [key, value] of Object.entries(templateFields)) {
    if (SKIP_FIELDS.has(key)) continue;
    if (value === null || value === undefined) continue;
    // Custom fields (start with 'customfield_') — copy as-is if non-null
    if (key.startsWith('customfield_')) {
      // Skip rank/order fields — Jira rejects these on create
      if (key === 'customfield_10019' || key === 'customfield_12020') continue;
      inherited[key] = value;
    }
  }
  return inherited;
}

// ── Labels: merge template labels with Datadog-specific ones ─────────────────

function buildLabels(templateLabels) {
  const base = new Set(templateLabels ?? []);
  base.add('DatadogMH');
  base.add('akash');
  base.add('DATADOG-AI-CREATE');
  return [...base];
}

// ── prompt ────────────────────────────────────────────────────────────────────

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

// ── Template loader: cache-first ─────────────────────────────────────────────

const TEMPLATE_CACHE_DIR = path.join(__dirname, 'data');

function loadTemplateFromCache(templateKey) {
  const cachePath = path.join(TEMPLATE_CACHE_DIR, `jira-template-${templateKey}.json`);
  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    // Rehydrate into the shape extractInheritedFields expects (flat fields object)
    const fields = {
      ...cached.fields.customFields,
      project:   cached.fields.project,
      issuetype: cached.fields.issuetype,
      priority:  cached.fields.priority,
      labels:    cached.fields.labels,
      components: cached.fields.components,
    };
    console.log(`\nLoaded template ${templateKey} from cache (fetched ${cached.fetchedAt.slice(0, 10)})`);
    return fields;
  }
  return null;
}

async function fetchTemplateFromJira(templateKey) {
  console.log(`\nFetching template ${templateKey} from Jira...`);
  const { data } = await api.get(`/rest/api/3/issue/${templateKey}`, { params: { fields: '*all' } });
  return data.fields;
}

// ── Repository inspection helper (git-based) ─────────────────────────────────

function assessRecentRepoActivity() {
  // Inspect the local repository for recent (6 months) activity that may be related
  // Allow overriding the repo root for support or alternate codebases via --repo-root or SUPPORT_REPO_PATH env var
  const repoRoot = opts.repoRoot || process.env.SUPPORT_REPO_PATH || path.resolve(__dirname, '..', '..');
  const months = '6 months ago';
  const results = [];
  try {
    // 1) Direct ticket references (e.g., MEDM-10399)
    const ticketKey = 'MEDM-10399';
    try {
      const cmdTicket = `git -C "${repoRoot}" log --since="${months}" --pretty=format:%h%x09%s --grep="${ticketKey}"`;
      const ticketOut = execSync(cmdTicket, { encoding: 'utf8' }).trim();
      if (ticketOut) {
        results.push(`Commits referencing ${ticketKey} (last 6 months):\n${ticketOut.split(/\r?\n/).slice(0,10).join('\n')}`);
      }
    } catch (e) {
      // ignore grep failures
    }

    // 2) If stack trace contains a file path, find commits touching that filename in last 6 months
    const st = String(opts.stackTrace || opts.error || '');
    const fileMatch = st.match(/(\/[^\s:]+?\.[a-zA-Z0-9_]+):\d+/);
    if (fileMatch) {
      const fullPath = fileMatch[1];
      const filename = path.basename(fullPath);
      try {
        const cmd = `git -C "${repoRoot}" log --since="${months}" --pretty=format:%h%x09%s --name-only`;
        const out = execSync(cmd, { encoding: 'utf8' });
        const lines = out.split(/\r?\n/);
        const hits = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          // commit lines contain a tab (hash + message); file lines are filenames without tab
          if (line.indexOf('\t') === -1 && line.endsWith(filename)) {
            // find previous commit header
            let j = i - 1;
            while (j >= 0 && !lines[j].includes('\t')) j--;
            const commitLine = lines[j] ? lines[j].trim() : '';
            hits.push(`${commitLine} => ${line}`);
          }
        }
        if (hits.length) {
          results.push(`Commits touching ${filename} (last 6 months):\n${hits.slice(0,10).join('\n')}`);
        }
      } catch (e) {
        // ignore failures
      }
    }
  } catch (e) {
    // overall failure
  }

  return results.join('\n\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Load template fields (cache-first, fallback to live fetch)
  const tf = loadTemplateFromCache(opts.template) ?? await fetchTemplateFromJira(opts.template);

  const inheritedFields = extractInheritedFields(tf);
  const labels          = buildLabels(tf.labels);

  // Check local git repo for recent work (last 6 months) that references tickets or touches files in the stack trace
  try {
    const repoFindings = assessRecentRepoActivity();
    if (repoFindings) {
      opts.findings = [opts.findings, 'Repository investigation:', repoFindings].filter(Boolean).join('\n\n');
    }
  } catch (e) {
    // keep going if git check fails
    console.warn('Warning: git repository inspection failed:', e.message || e);
  }

  const description     = buildDescription();

  const payload = {
    fields: {
      // Inherited from template (custom fields: severity, env, found_via, etc.)
      ...inheritedFields,

      // Fixed AMBS defaults
      project:   { id: tf.project?.id ?? '17438' },
      issuetype: { id: tf.issuetype?.id ?? '1' },  // Bug
      priority:  tf.priority ? { id: tf.priority.id } : { id: '4' },

      // Override / new values
      summary:     opts.summary,
      description,
      labels,
      components: tf.components?.length ? tf.components.map(c => ({ id: c.id })) : [{ id: '32162' }],
    },
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const hr = '═'.repeat(70);
  console.log(`\n${hr}`);
  console.log(`PREVIEW — JIRA Bug Ticket (cloned from ${opts.template})`);
  console.log(hr);
  console.log(`Summary      : ${opts.summary}`);
  if (opts.endpoint) console.log(`Endpoint     : ${opts.endpoint}`);
  if (opts.url)      console.log(`URL          : ${opts.url}`);
  if (opts.error)    console.log(`Error        : ${opts.error}`);
  if (opts.firstSeen) console.log(`First seen   : ${opts.firstSeen}`);
  if (opts.lastSeen)  console.log(`Last seen    : ${opts.lastSeen}`);
  if (opts.version)   console.log(`Version      : ${opts.version}`);
  if (opts.count !== undefined) console.log(`Occurrences  : ${opts.count}`);
  if (opts.window)   console.log(`Window       : ${opts.window}`);
  if (opts.traceLink) console.log(`Trace        : ${opts.traceLink}`);
  if (opts.apmLink)  console.log(`APM Link     : ${opts.apmLink}`);
  if (opts.findings) console.log(`Findings     : ${opts.findings}`);
  console.log(`Labels       : ${labels.join(', ')}`);
  console.log(`Priority     : ${tf.priority?.name ?? 'Minor'}`);
  console.log(`Components   : ${tf.components?.map(c => c.name).join(', ') ?? 'MedHub_Datadog'}`);
  console.log(`Template     : ${SITE_URL}/browse/${opts.template}`);

  const inheritedCount = Object.keys(inheritedFields).length;
  if (inheritedCount > 0) {
    console.log(`Custom fields: ${inheritedCount} inherited from template`);
  }
  console.log(hr + '\n');

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
