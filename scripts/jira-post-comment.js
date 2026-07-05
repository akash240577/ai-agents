/**
 * jira-post-comment.js
 *
 * Post a comment to a JIRA ticket from a file or inline text.
 * Converts plain text / markdown to Atlassian Document Format (ADF).
 *
 * Credentials loaded from (in order):
 *   .env  →  ATLASSIAN_* env vars  →  ~/.copilot/mcp.json
 *
 * Usage:
 *   node jira-post-comment.js -t AMBS-1234 -f docs/ambs/AMBS-1234/jira-comment.md
 *   node jira-post-comment.js -t AMBS-1234 --comment "Fix deployed to production."
 *   node jira-post-comment.js -t AMBS-1234 -f comment.md --dry-run
 */

'use strict';

require('../lib/load-env');
const fs       = require('fs');
const axios    = require('axios');
const readline = require('readline');
const { program } = require('commander');
const { loadJiraCredentials } = require('../lib/credentials');

program
  .name('jira-post-comment')
  .description('Post a comment to a JIRA ticket from a file or inline text')
  .requiredOption('-t, --ticket <KEY>', 'Ticket key (e.g. AMBS-1234)')
  .option('-f, --file <path>', 'Path to a text/markdown file to post as comment')
  .option('--comment <text>', 'Inline comment text (alternative to --file)')
  .option('--dry-run', 'Print the comment without posting')
  .parse(process.argv);

const opts = program.opts();

if (!opts.file && !opts.comment) {
  console.error('ERROR: Provide --file <path> or --comment <text>');
  process.exit(1);
}

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

/**
 * Convert plain text (with blank-line paragraph breaks) to ADF.
 * Each paragraph becomes a paragraph node; lines within a paragraph
 * are joined with a hardBreak.
 */
function textToAdf(text) {
  const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

  const content = blocks.map(block => {
    const lines = block.split('\n');
    const inlineContent = [];
    for (let i = 0; i < lines.length; i++) {
      inlineContent.push({ type: 'text', text: lines[i] });
      if (i < lines.length - 1) inlineContent.push({ type: 'hardBreak' });
    }
    return { type: 'paragraph', content: inlineContent };
  });

  return { version: 1, type: 'doc', content };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const ticketKey = opts.ticket.toUpperCase();
  const text = opts.file
    ? fs.readFileSync(opts.file, 'utf8')
    : opts.comment;

  console.log(`\nTicket  : ${ticketKey}`);
  console.log(`Source  : ${opts.file || '(inline text)'}`);
  console.log(`Dry-run : ${opts.dryRun ? 'YES' : 'no'}`);
  console.log(`\n${'─'.repeat(70)}`);
  const preview = text.length > 600 ? text.slice(0, 600) + '\n...(truncated)' : text;
  console.log(preview);
  console.log(`${'─'.repeat(70)}\n`);

  if (opts.dryRun) {
    console.log('Dry-run mode — no comment posted.');
    return;
  }

  const answer = await prompt(`Post this comment to ${ticketKey}? [y/N] `);
  if (answer !== 'y' && answer !== 'yes') {
    console.log('\nAborted. No comment posted.');
    return;
  }

  const { data } = await api.post(`/rest/api/3/issue/${ticketKey}/comment`, {
    body: textToAdf(text),
  });

  console.log(`\n✓ Comment posted`);
  console.log(`  ${SITE_URL}/browse/${ticketKey}?focusedCommentId=${data.id}`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
