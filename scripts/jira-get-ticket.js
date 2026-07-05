/**
 * jira-get-ticket.js
 *
 * Fetch a JIRA ticket and print its details. Designed for use by AI agents
 * and skills that need ticket context (summary, status, subtasks, comments).
 *
 * Credentials loaded from (in order):
 *   .env  →  ATLASSIAN_* env vars  →  ~/.copilot/mcp.json
 *
 * Usage:
 *   node jira-get-ticket.js -t AMBS-1234
 *   node jira-get-ticket.js -t AMBS-1234 --json
 *   node jira-get-ticket.js -t AMBS-1234 --fields summary,status,subtasks
 */

'use strict';

require('../lib/load-env');
const axios  = require('axios');
const { program } = require('commander');
const { loadJiraCredentials } = require('../lib/credentials');

program
  .name('jira-get-ticket')
  .description('Fetch a JIRA ticket and print its details')
  .requiredOption('-t, --ticket <KEY>', 'Ticket key (e.g. AMBS-1234)')
  .option(
    '--fields <list>',
    'Comma-separated fields to fetch',
    'summary,status,assignee,priority,description,subtasks,comment,labels,components'
  )
  .option('--json', 'Output raw JSON instead of formatted text')
  .parse(process.argv);

const opts = program.opts();

// ── Credentials ───────────────────────────────────────────────────────────────

const { baseUrl, email, token } = loadJiraCredentials();

if (!email || !token) {
  console.error('ERROR: JIRA credentials not found.');
  console.error('  Set JIRA_USER_EMAIL + JIRA_API_TOKEN in ~/.copilot/.env');
  console.error('  or add ~/.copilot/mcp.json with atlassian env vars');
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

// ── ADF → plain text ──────────────────────────────────────────────────────────

function adfToText(node, indent = '') {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  if (node.type === 'hardBreak') return '\n' + indent;
  const children = (node.content || []).map(n => adfToText(n, indent)).join('');
  switch (node.type) {
    case 'paragraph':  return indent + children.trimEnd() + '\n';
    case 'heading':    return indent + children.trimEnd() + '\n';
    case 'bulletList': return children;
    case 'orderedList': return children;
    case 'listItem':   return indent + '• ' + children.trim() + '\n';
    case 'codeBlock':  return indent + children + '\n';
    case 'blockquote': return children;
    default:           return children;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const key = opts.ticket.toUpperCase();

  const { data } = await api.get(`/rest/api/3/issue/${key}`, {
    params: { fields: opts.fields },
  });

  if (opts.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const f = data.fields;
  const hr = '═'.repeat(70);
  const line = '─'.repeat(70);

  console.log(`\n${hr}`);
  console.log(`${data.key}  ${f.summary || '(no summary)'}`);
  console.log(hr);
  console.log(`Status    : ${f.status?.name || 'unknown'}`);
  console.log(`Assignee  : ${f.assignee?.displayName || 'Unassigned'}`);
  if (f.priority)   console.log(`Priority  : ${f.priority.name}`);
  if (f.labels?.length) console.log(`Labels    : ${f.labels.join(', ')}`);
  if (f.components?.length) console.log(`Components: ${f.components.map(c => c.name).join(', ')}`);

  if (f.description) {
    console.log(`\n${line}\nDescription\n${line}`);
    console.log(adfToText(f.description).trim());
  }

  if (f.subtasks?.length) {
    console.log(`\n${line}\nSub-tasks (${f.subtasks.length})\n${line}`);
    for (const st of f.subtasks) {
      console.log(`  ${st.key}  [${st.fields.status.name}]  ${st.fields.summary}`);
    }
  }

  if (f.comment?.comments?.length) {
    const comments = f.comment.comments;
    const recent   = comments.slice(-5);
    console.log(`\n${line}\nComments (${comments.length} total — showing last ${recent.length})\n${line}`);
    for (const c of recent) {
      const author = c.author?.displayName || 'unknown';
      const date   = c.created?.slice(0, 10) || '';
      console.log(`\n[${date}] ${author}:`);
      console.log(adfToText(c.body).trim());
    }
  }

  console.log(`\nURL: ${SITE_URL}/browse/${key}\n`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
