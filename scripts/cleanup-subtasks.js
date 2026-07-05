/**
 * cleanup-subtasks.js
 *
 * Finds open sub-tasks titled "Code Changes", "Dev Investigation", or "Dev Testing"
 * on tickets you worked on last month that are no longer in Backlog or In Progress.
 *
 * Usage:
 *   node cleanup-subtasks.js                        # last month (default)
 *   node cleanup-subtasks.js --month 2026-03        # specific month
 *   node cleanup-subtasks.js --ticket AMBS-123      # single parent ticket
 *   node cleanup-subtasks.js --ticket AMBS-123,AMBS-456  # multiple tickets
 *   node cleanup-subtasks.js --dry-run              # show only, no close
 */

'use strict';

require('../lib/load-env');
const axios = require('axios');
const readline = require('readline');
const { program } = require('commander');

program
  .name('cleanup-subtasks')
  .description('Find and close stale dev sub-tasks on completed parent tickets')
  .option('-m, --month <YYYY-MM>', 'Month to check (default: previous month)')
  .option('-t, --ticket <KEY[,KEY...]>', 'Parent ticket key(s) to target directly (e.g. AMBS-123 or AMBS-123,AMBS-456)')
  .option('--dry-run', 'List sub-tasks but do not close them')
  .parse(process.argv);

const opts = program.opts();

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL   = process.env.JIRA_BASE_URL;
const USER_EMAIL = process.env.JIRA_USER_EMAIL;
const API_TOKEN  = process.env.JIRA_API_TOKEN;
const PROJECT    = process.env.JIRA_PROJECT_KEY || 'AMBS';

if (!BASE_URL) {
  console.error('ERROR: JIRA_BASE_URL must be set in ~/.copilot/.env');
  process.exit(1);
}

if (!USER_EMAIL || !API_TOKEN) {
  console.error('ERROR: JIRA_USER_EMAIL and JIRA_API_TOKEN must be set in ~/.copilot/.env');
  process.exit(1);
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Basic ${Buffer.from(`${USER_EMAIL}:${API_TOKEN}`).toString('base64')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Sub-task summaries to look for (exact match, case-insensitive)
const TARGET_SUBTASK_TITLES = ['code changes', 'dev investigation', 'dev testing'];

// Statuses that mean "parent ticket is still being actively worked"
const SKIP_PARENT_STATUSES = ['backlog', 'in progress'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function defaultMonth() {
  const now  = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const start  = `${y}-${String(m).padStart(2, '0')}-01`;
  const last   = new Date(y, m, 0).getDate();
  const end    = `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
  return { start, end };
}

async function jqlSearch(jql, label) {
  const fields = 'summary,status,assignee,parent,issuetype';
  let issues = [];
  let nextPageToken = null;

  console.log(`\nFetching [${label}] ...`);
  console.log(`  JQL: ${jql}`);

  while (true) {
    const params = { jql, fields, maxResults: 100 };
    if (nextPageToken) params.nextPageToken = nextPageToken;

    const { data } = await api.get('/rest/api/3/search/jql', { params });
    issues = issues.concat(data.issues || []);
    nextPageToken = data.nextPageToken || null;

    if (!nextPageToken) break;
  }

  console.log(`  Found: ${issues.length}`);
  return issues;
}

async function getTransitions(issueKey) {
  const { data } = await api.get(`/rest/api/3/issue/${issueKey}/transitions`);
  return data.transitions || [];
}

async function closeIssue(issueKey) {
  const transitions = await getTransitions(issueKey);

  // Prefer a transition whose target status is "Closed"; fall back to "Done"
  const closeTransition =
    transitions.find(t => t.to && t.to.name.toLowerCase() === 'closed') ||
    transitions.find(t => t.to && t.to.name.toLowerCase() === 'done')   ||
    transitions.find(t => t.to && t.name.toLowerCase().includes('clos')) ||
    transitions.find(t => t.to && t.name.toLowerCase().includes('done'));

  if (!closeTransition) {
    const available = transitions.map(t => `"${t.name}" → ${t.to && t.to.name}`).join(', ');
    throw new Error(`No close/done transition found for ${issueKey}. Available: ${available}`);
  }

  await api.post(`/rest/api/3/issue/${issueKey}/transitions`, {
    transition: { id: closeTransition.id },
    fields: { resolution: { name: 'Done' } },
  });

  return closeTransition.to.name;
}

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  let parentKeys;
  let parentIssues;

  if (opts.ticket) {
    // ── Ticket mode: use the provided key(s) directly ──
    parentKeys = opts.ticket.split(',').map(k => k.trim().toUpperCase()).filter(Boolean);

    console.log(`\n=== Cleanup Dev Sub-tasks: ticket mode ===`);
    console.log(`Project : ${PROJECT}`);
    console.log(`User    : ${USER_EMAIL}`);
    console.log(`Tickets : ${parentKeys.join(', ')}`);
    console.log(`Dry-run : ${opts.dryRun ? 'YES' : 'no'}\n`);

    // Fetch the parent ticket details so we can display status/summary later
    const parentJql = `key in (${parentKeys.join(', ')})`;
    parentIssues = await jqlSearch(parentJql, 'parent tickets');

    if (parentIssues.length === 0) {
      console.log('\nTicket(s) not found in Jira. Check the key(s) and try again.');
      return;
    }
  } else {
    // ── Month mode: parent tickets you worked on last month ──
    const yearMonth = opts.month || defaultMonth();
    const { start, end } = monthRange(yearMonth);

    console.log(`\n=== Cleanup Dev Sub-tasks: ${yearMonth} ===`);
    console.log(`Project : ${PROJECT}`);
    console.log(`User    : ${USER_EMAIL}`);
    console.log(`Dry-run : ${opts.dryRun ? 'YES' : 'no'}\n`);

    const skipStatusList = SKIP_PARENT_STATUSES.map(s => `"${s}"`).join(', ');
    const parentJql = [
      `project = ${PROJECT}`,
      `assignee = currentUser()`,
      `status CHANGED TO "In Progress" DURING ("${start}", "${end}")`,
      `status NOT IN (${skipStatusList})`,
    ].join(' AND ');

    parentIssues = await jqlSearch(parentJql, 'parent tickets');

    if (parentIssues.length === 0) {
      console.log('\nNo eligible parent tickets found. Nothing to clean up.');
      return;
    }

    parentKeys = parentIssues.map(i => i.key);
  }

  console.log(`\nParent tickets (${parentKeys.length}): ${parentKeys.join(', ')}`);

  // ── Step 2: Open sub-tasks with matching titles under those parents ──
  // Note: `summary in (...)` is not a valid JQL operator; filter by title client-side.
  const subtaskJql = [
    `project = ${PROJECT}`,
    `issuetype = Sub-task`,
    `parent in (${parentKeys.join(', ')})`,
    `assignee = currentUser()`,
    `status NOT IN ("Closed", "Done", "Canceled")`,
  ].join(' AND ');

  const allSubtasks = await jqlSearch(subtaskJql, 'open dev sub-tasks');
  const subtaskIssues = allSubtasks.filter(i =>
    TARGET_SUBTASK_TITLES.includes(i.fields.summary.toLowerCase())
  );

  if (subtaskIssues.length === 0) {
    console.log('\nNo open dev sub-tasks found matching target titles. Already clean!');
    return;
  }

  // ── Step 3: Display results ──
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Found ${subtaskIssues.length} open dev sub-task(s) to close:\n`);

  // Group by parent for readability
  const byParent = {};
  for (const sub of subtaskIssues) {
    const parentKey = sub.fields.parent ? sub.fields.parent.key : '(no parent)';
    if (!byParent[parentKey]) byParent[parentKey] = [];
    byParent[parentKey].push(sub);
  }

  for (const [pk, subs] of Object.entries(byParent)) {
    const parent = parentIssues.find(p => p.key === pk);
    const parentStatus = parent ? parent.fields.status.name : '?';
    const parentSummary = parent ? parent.fields.summary : '';
    console.log(`  ${pk} [${parentStatus}]  ${parentSummary}`);
    for (const sub of subs) {
      const subStatus = sub.fields.status.name;
      console.log(`    └─ ${sub.key}  "${sub.fields.summary}"  [${subStatus}]`);
    }
  }

  console.log(`${'─'.repeat(70)}\n`);

  if (opts.dryRun) {
    console.log('Dry-run mode — no changes made.');
    return;
  }

  // ── Step 4: Confirm and close ──
  const answer = await prompt(`Close all ${subtaskIssues.length} sub-task(s)? [y/N] `);

  if (answer !== 'y' && answer !== 'yes') {
    console.log('\nAborted. No changes made.');
    return;
  }

  console.log('\nClosing sub-tasks...');
  let closed = 0;
  let failed = 0;

  for (const sub of subtaskIssues) {
    try {
      const toStatus = await closeIssue(sub.key);
      console.log(`  ✓ ${sub.key}  "${sub.fields.summary}"  → ${toStatus}`);
      closed++;
    } catch (err) {
      const detail = err.response
        ? JSON.stringify(err.response.data)
        : err.message;
      console.error(`  ✗ ${sub.key}  FAILED: ${detail}`);
      failed++;
    }
  }

  console.log(`\nDone. Closed: ${closed}  Failed: ${failed}`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
