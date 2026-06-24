/**
 * assign-subtasks.js
 *
 * For a given parent ticket, finds open sub-tasks titled "Code Changes",
 * "Dev Investigation", or "Dev Testing", assigns them to you, and moves
 * them to In Progress.
 *
 * Usage:
 *   node assign-subtasks.js --ticket AMBS-123
 *   node assign-subtasks.js --ticket AMBS-123,AMBS-456
 *   node assign-subtasks.js --ticket AMBS-123 --dry-run
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const readline = require('readline');
const { program } = require('commander');

program
  .name('assign-subtasks')
  .description('Assign dev sub-tasks to yourself and move them to In Progress')
  .requiredOption('-t, --ticket <KEY[,KEY...]>', 'Parent ticket key(s) (e.g. AMBS-123 or AMBS-123,AMBS-456)')
  .option('--dry-run', 'Show what would happen but make no changes')
  .parse(process.argv);

const opts = program.opts();

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL   = process.env.JIRA_BASE_URL   || 'https://ascend-learning.atlassian.net';
const USER_EMAIL = process.env.JIRA_USER_EMAIL;
const API_TOKEN  = process.env.JIRA_API_TOKEN;
const PROJECT    = process.env.JIRA_PROJECT_KEY || 'AMBS';

if (!USER_EMAIL || !API_TOKEN) {
  console.error('ERROR: JIRA_USER_EMAIL and JIRA_API_TOKEN must be set in .env');
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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

async function getCurrentUser() {
  const { data } = await api.get('/rest/api/3/myself');
  return data; // { accountId, emailAddress, displayName, ... }
}

async function assignIssue(issueKey, accountId) {
  await api.put(`/rest/api/3/issue/${issueKey}/assignee`, { accountId });
}

async function getTransitions(issueKey) {
  const { data } = await api.get(`/rest/api/3/issue/${issueKey}/transitions`);
  return data.transitions || [];
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

async function moveToInProgress(issueKey) {
  const transitions = await getTransitions(issueKey);

  const t =
    transitions.find(t => t.to && t.to.name.toLowerCase() === 'in progress') ||
    transitions.find(t => t.to && t.name.toLowerCase().includes('progress')) ||
    transitions.find(t => t.to && t.name.toLowerCase().includes('start'));

  if (!t) {
    const available = transitions.map(t => `"${t.name}" → ${t.to && t.to.name}`).join(', ');
    throw new Error(`No In Progress transition found for ${issueKey}. Available: ${available}`);
  }

  await api.post(`/rest/api/3/issue/${issueKey}/transitions`, {
    transition: { id: t.id },
  });

  return t.to.name;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const parentKeys = opts.ticket.split(',').map(k => k.trim().toUpperCase()).filter(Boolean);

  console.log(`\n=== Assign Dev Sub-tasks ===`);
  console.log(`Project : ${PROJECT}`);
  console.log(`User    : ${USER_EMAIL}`);
  console.log(`Tickets : ${parentKeys.join(', ')}`);
  console.log(`Dry-run : ${opts.dryRun ? 'YES' : 'no'}\n`);

  // ── Step 1: Resolve current user's accountId ──
  const me = await getCurrentUser();
  console.log(`Resolved user: ${me.displayName} (${me.accountId})`);

  // ── Step 2: Find open sub-tasks under those parents ──
  // Note: `summary in (...)` is not a valid JQL operator; filter by title client-side.
  const subtaskJql = [
    `project = ${PROJECT}`,
    `issuetype = Sub-task`,
    `parent in (${parentKeys.join(', ')})`,
    `status NOT IN ("Closed", "Done", "Canceled", "In Progress")`,
  ].join(' AND ');

  const allSubtasks = await jqlSearch(subtaskJql, 'open dev sub-tasks');
  const subtaskIssues = allSubtasks.filter(i =>
    TARGET_SUBTASK_TITLES.includes(i.fields.summary.toLowerCase())
  );

  if (subtaskIssues.length === 0) {
    console.log('\nNo eligible sub-tasks found matching target titles (already active or none exist).');
    return;
  }

  // ── Step 3: Display what will be done ──
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Found ${subtaskIssues.length} sub-task(s) to assign + move to In Progress:\n`);

  for (const sub of subtaskIssues) {
    const currentAssignee = sub.fields.assignee ? sub.fields.assignee.displayName : 'Unassigned';
    const status = sub.fields.status.name;
    const parentKey = sub.fields.parent ? sub.fields.parent.key : '(no parent)';
    console.log(`  ${sub.key}  [${status}]  "${sub.fields.summary}"  (parent: ${parentKey}, currently: ${currentAssignee})`);
  }

  console.log(`${'─'.repeat(70)}\n`);

  if (opts.dryRun) {
    console.log('Dry-run mode — no changes made.');
    return;
  }

  // ── Step 4: Confirm ──
  const answer = await prompt(`Assign + move ${subtaskIssues.length} sub-task(s) to In Progress? [y/N] `);
  if (answer !== 'y' && answer !== 'yes') {
    console.log('\nAborted. No changes made.');
    return;
  }

  // ── Step 5: Assign + transition ──
  console.log('\nAssigning and moving to In Progress...');
  let done = 0;
  let failed = 0;

  for (const sub of subtaskIssues) {
    const label = `${sub.key}  "${sub.fields.summary}"`;
    try {
      await assignIssue(sub.key, me.accountId);
    } catch (err) {
      console.error(`  ✗ ${label}  FAILED (assign): ${err.message}`);
      failed++;
      continue;
    }
    try {
      const toStatus = await moveToInProgress(sub.key);
      console.log(`  ✓ ${label}  → assigned to you, status: ${toStatus}`);
      done++;
    } catch (err) {
      console.error(`  ✗ ${label}  FAILED (transition): ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Updated: ${done}  Failed: ${failed}`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
