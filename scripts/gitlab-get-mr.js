/**
 * gitlab-get-mr.js
 *
 * Fetch a GitLab merge request (metadata, diff, commits) and print it.
 * Accepts a full GitLab MR web URL or a PROJECT_ID/MR_IID shorthand.
 *
 * Credentials loaded from (in order):
 *   .env  →  GITLAB_TOKEN env var  →  ~/.gitlab_token
 *
 * Usage:
 *   node gitlab-get-mr.js --mr https://git.ascendlearning.com/group/repo/-/merge_requests/42
 *   node gitlab-get-mr.js --mr 123/42 --diff --commits
 *   node gitlab-get-mr.js --mr https://... --diff --commits --json
 */

'use strict';

require('../lib/load-env');
const axios  = require('axios');
const { program } = require('commander');
const { loadGitLabCredentials } = require('../lib/credentials');

program
  .name('gitlab-get-mr')
  .description('Fetch a GitLab merge request (metadata, diff, commits)')
  .requiredOption('--mr <URL|PROJECT_ID/MR_IID>', 'GitLab MR web URL or PROJECT_ID/MR_IID')
  .option('--diff',    'Include file changes')
  .option('--commits', 'Include commit list')
  .option('--json',    'Output raw JSON instead of formatted text')
  .parse(process.argv);

const opts = program.opts();

// ── Credentials ───────────────────────────────────────────────────────────────

const { baseUrl, token } = loadGitLabCredentials();

if (!token) {
  console.error('ERROR: GitLab token not found.');
  console.error('  Set GITLAB_TOKEN in .env or create ~/.gitlab_token');
  process.exit(1);
}

const GITLAB_URL = baseUrl;

const api = axios.create({
  baseURL: GITLAB_URL,
  headers: { 'PRIVATE-TOKEN': token, 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── MR ref parser ─────────────────────────────────────────────────────────────

/**
 * Parse a GitLab MR reference into { projectId?, projectPath?, mrIid }.
 * Supported forms:
 *   - https://host/group/repo/-/merge_requests/42      → projectPath + mrIid
 *   - https://host/api/v4/projects/123/merge_requests/42 → projectId + mrIid
 *   - 123/42                                           → projectId + mrIid
 */
function parseMrRef(ref) {
  // API URL form: /projects/123/merge_requests/42
  const apiMatch = ref.match(/\/projects\/(\d+)\/merge_requests\/(\d+)/);
  if (apiMatch) return { projectId: apiMatch[1], mrIid: apiMatch[2] };

  // Web URL form: https://host/group/.../repo/-/merge_requests/42
  const webMatch = ref.match(/https?:\/\/[^/]+\/(.+?)\/-\/merge_requests\/(\d+)/);
  if (webMatch) return { projectPath: webMatch[1], mrIid: webMatch[2] };

  // Numeric shorthand: PROJECT_ID/MR_IID
  const idMatch = ref.match(/^(\d+)\/(\d+)$/);
  if (idMatch) return { projectId: idMatch[1], mrIid: idMatch[2] };

  return null;
}

async function resolveProjectId(parsed) {
  if (parsed.projectId) return parsed.projectId;
  const encoded = encodeURIComponent(parsed.projectPath);
  const { data } = await api.get(`/api/v4/projects/${encoded}`);
  return String(data.id);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const parsed = parseMrRef(opts.mr);
  if (!parsed) {
    console.error('ERROR: Could not parse MR reference.');
    console.error('  Use a full GitLab MR URL or PROJECT_ID/MR_IID (e.g. 123/42)');
    process.exit(1);
  }

  const projectId = await resolveProjectId(parsed);
  const mrIid     = parsed.mrIid;
  const base      = `/api/v4/projects/${projectId}/merge_requests/${mrIid}`;

  const [mrRes, diffRes, commitsRes] = await Promise.all([
    api.get(base),
    opts.diff    ? api.get(`${base}/changes`)  : Promise.resolve(null),
    opts.commits ? api.get(`${base}/commits`)  : Promise.resolve(null),
  ]);

  const mr = mrRes.data;

  if (opts.json) {
    const out = { mr };
    if (diffRes)    out.changes = diffRes.data.changes;
    if (commitsRes) out.commits = commitsRes.data;
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  const hr   = '═'.repeat(70);
  const line = '─'.repeat(70);

  console.log(`\n${hr}`);
  console.log(`MR !${mr.iid}  ${mr.title}`);
  console.log(hr);
  console.log(`State          : ${mr.state}`);
  console.log(`Author         : ${mr.author?.name || 'unknown'}`);
  console.log(`Source branch  : ${mr.source_branch}`);
  console.log(`Target branch  : ${mr.target_branch}`);
  console.log(`URL            : ${mr.web_url}`);

  if (mr.description?.trim()) {
    const desc = mr.description.slice(0, 500);
    console.log(`\n${line}\nDescription\n${line}`);
    console.log(desc + (mr.description.length > 500 ? '\n...(truncated)' : ''));
  }

  if (mr.diff_refs) {
    console.log(`\n${line}\nDiff refs (needed for inline comments)\n${line}`);
    console.log(`  base_sha  : ${mr.diff_refs.base_sha}`);
    console.log(`  head_sha  : ${mr.diff_refs.head_sha}`);
    console.log(`  start_sha : ${mr.diff_refs.start_sha}`);
  }

  if (commitsRes) {
    const commits = commitsRes.data;
    console.log(`\n${line}\nCommits (${commits.length})\n${line}`);
    for (const c of commits) {
      console.log(`  ${c.short_id}  ${c.title}`);
    }
  }

  if (diffRes) {
    const changes = diffRes.data.changes || [];
    console.log(`\n${line}\nChanged files (${changes.length})\n${line}`);
    for (const f of changes) {
      const status = f.new_file ? 'A' : f.deleted_file ? 'D' : f.renamed_file ? 'R' : 'M';
      console.log(`  ${status}  ${f.new_path}`);
    }
  }

  console.log();
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
