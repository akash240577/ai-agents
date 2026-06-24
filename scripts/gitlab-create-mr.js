/**
 * gitlab-create-mr.js
 *
 * Create a GitLab merge request from the current (or specified) branch.
 *
 * Credentials loaded from (in order):
 *   .env  →  GITLAB_TOKEN env var  →  ~/.gitlab_token
 *
 * Usage:
 *   node gitlab-create-mr.js --project 1234 --title "AMBS-9999 Fix null check"
 *   node gitlab-create-mr.js --project 1234 --source AMBS-9999 --target main --title "..."
 *   node gitlab-create-mr.js --project 1234 --title "..." --dry-run
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { execSync } = require('child_process');
const axios        = require('axios');
const readline     = require('readline');
const { program }  = require('commander');
const { loadGitLabCredentials } = require('../lib/credentials');

program
  .name('gitlab-create-mr')
  .description('Create a GitLab merge request from the current branch')
  .requiredOption('--project <PROJECT_ID>', 'GitLab project ID (numeric)')
  .option('--source <branch>', 'Source branch (default: current git branch)')
  .option('--target <branch>', 'Target branch (default: main)', 'main')
  .option('--title <text>', 'MR title (default: source branch name)')
  .option('--dry-run', 'Show what would be created without making changes')
  .parse(process.argv);

const opts = program.opts();

// ── Credentials ───────────────────────────────────────────────────────────────

const { baseUrl, token } = loadGitLabCredentials();

if (!token) {
  console.error('ERROR: GitLab token not found.');
  console.error('  Set GITLAB_TOKEN in .env or create ~/.gitlab_token');
  process.exit(1);
}

const api = axios.create({
  baseURL: baseUrl,
  headers: { 'PRIVATE-TOKEN': token, 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

function currentBranch() {
  try {
    return execSync('git branch --show-current', { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString().trim();
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const source = opts.source || currentBranch();
  if (!source) {
    console.error('ERROR: Could not detect current git branch. Use --source <branch>.');
    process.exit(1);
  }

  const title = opts.title || source;

  console.log(`\nProject : ${opts.project}`);
  console.log(`Source  : ${source}`);
  console.log(`Target  : ${opts.target}`);
  console.log(`Title   : ${title}`);
  console.log(`Dry-run : ${opts.dryRun ? 'YES' : 'no'}\n`);

  if (opts.dryRun) {
    console.log('Dry-run mode — no MR created.');
    return;
  }

  const answer = await prompt('Create this merge request? [y/N] ');
  if (answer !== 'y' && answer !== 'yes') {
    console.log('\nAborted. No MR created.');
    return;
  }

  const { data } = await api.post(
    `/api/v4/projects/${opts.project}/merge_requests`,
    {
      source_branch:        source,
      target_branch:        opts.target,
      title,
      remove_source_branch: true,
    }
  );

  console.log(`\n✓ MR created: !${data.iid}`);
  console.log(`  ${data.web_url}`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
