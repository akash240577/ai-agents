/**
 * gitlab-post-comment.js
 *
 * Post a summary comment and/or inline discussion comments to a GitLab MR.
 * Summary comments use the MR notes API; inline comments use the discussions
 * API with diff position (file + line + SHA refs).
 *
 * Credentials loaded from (in order):
 *   .env  →  GITLAB_TOKEN env var  →  ~/.gitlab_token
 *
 * Usage:
 *   # Post a summary comment from a file
 *   node gitlab-post-comment.js --mr https://... -f review-summary.md
 *
 *   # Post inline comments from JSON
 *   node gitlab-post-comment.js --mr https://... --inline-file comments.json
 *
 *   # Both at once
 *   node gitlab-post-comment.js --mr https://... -f summary.md --inline-file comments.json
 *
 *   # Dry run (print without posting)
 *   node gitlab-post-comment.js --mr https://... -f summary.md --dry-run
 *
 * Inline comment JSON schema (array):
 *   [
 *     {
 *       "file":      "path/to/file.php",   // new_path from diff
 *       "line":      42,                    // new_line from diff
 *       "body":      "Comment text",
 *       "base_sha":  "abc123",              // from MR diff_refs (gitlab-get-mr --json)
 *       "head_sha":  "def456",
 *       "start_sha": "ghi789"
 *     }
 *   ]
 */

'use strict';

/* Embedded Chris Beams seven rules — included here so the script does not fetch them remotely.

1. Separate subject from body with a blank line.
2. Limit the subject line to 50 characters.
3. Capitalize the subject line.
4. Do not end the subject line with a period.
5. Use the imperative mood in the subject line.
6. Wrap the body at 72 characters.
7. Use the body to explain what and why, not how.
*/

const CHRIS_BEAMS_SEVEN_RULES = `1. Separate subject from body with a blank line.
2. Limit the subject line to 50 characters.
3. Capitalize the subject line.
4. Do not end the subject line with a period.
5. Use the imperative mood in the subject line.
6. Wrap the body at 72 characters.
7. Use the body to explain what and why, not how.`;



require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs       = require('fs');
const axios    = require('axios');
const readline = require('readline');
const { program } = require('commander');
const { loadGitLabCredentials } = require('../lib/credentials');

program
  .name('gitlab-post-comment')
  .description('Post a summary comment and/or inline discussions to a GitLab MR')
  .requiredOption('--mr <URL|PROJECT_ID/MR_IID>', 'GitLab MR web URL or PROJECT_ID/MR_IID')
  .option('-f, --file <path>',        'Markdown file to post as a summary MR note')
  .option('--comment <text>',         'Inline summary text (alternative to --file)')
  .option('--inline-file <path>',     'JSON file with array of inline discussion comments')
  .option('--show-rules',             'Print Chris Beams seven commit rules and exit')
  .option('--dry-run',                'Print what would be posted without making changes')
  .parse(process.argv);

const opts = program.opts();

if (opts.showRules) {
  console.log(CHRIS_BEAMS_SEVEN_RULES);
  process.exit(0);
}

if (!opts.file && !opts.comment && !opts.inlineFile) {
  console.error('ERROR: Provide at least one of --file, --comment, or --inline-file, or use --show-rules');
  process.exit(1);
}

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

// ── MR ref parser (same as gitlab-get-mr.js) ──────────────────────────────────

function parseMrRef(ref) {
  const apiMatch = ref.match(/\/projects\/(\d+)\/merge_requests\/(\d+)/);
  if (apiMatch) return { projectId: apiMatch[1], mrIid: apiMatch[2] };

  const webMatch = ref.match(/https?:\/\/[^/]+\/(.+?)\/-\/merge_requests\/(\d+)/);
  if (webMatch) return { projectPath: webMatch[1], mrIid: webMatch[2] };

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

// Validate and format summary text to follow commit message rules from Chris Beams
function wrapText(text, width = 72) {
  if (!text) return text;
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map(para => {
    const t = para.trim();
    if (t.startsWith('```')) return para; // leave code fences alone

    // detect simple list prefix
    const m = t.match(/^(\s*[-*]\s+)/);
    const prefix = m ? m[1] : '';
    const words = t.replace(/\s+/g, ' ').split(' ');
    const lines = [];
    let cur = prefix;
    for (const w of words) {
      const candidate = (cur === '' ? w : (cur + (cur.endsWith(' ') ? '' : ' ') + w));
      if (candidate.replace(/\s+$/,'').length > width) {
        if (cur.trim()) lines.push(cur.trimRight());
        cur = (prefix || '') + w + ' ';
      } else {
        cur = candidate + ' ';
      }
    }
    if (cur.trim()) lines.push(cur.trimRight());
    return lines.join('\n');
  }).join('\n\n');
}

function validateAndFormatCommitMessage(text) {
  if (!text) return { original: text, formatted: text, issues: [], applied: false };
  const txt = text.replace(/\r/g, '').trim();
  if (!txt) return { original: txt, formatted: txt, issues: [], applied: false };

  const lines = txt.split('\n');
  // find first non-empty line as header
  let header = null;
  let headerIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') { header = lines[i].trim(); headerIdx = i; break; }
  }
  const bodyLines = lines.slice(headerIdx + 1);
  const body = bodyLines.join('\n').replace(/^\s*\n/, '').trim();

  const ticketMatch = header.match(/^(AMBS|MEDM)-\d+/i);
  const ticket = ticketMatch ? ticketMatch[0].toUpperCase() : null;
  let subject = ticket ? header.replace(/^(AMBS|MEDM)-\d+\s*/i, '').trim() : header;

  const issues = [];
  let corrected = subject;
  // Capitalize first character
  if (corrected && corrected[0] && corrected[0] !== corrected[0].toUpperCase()) {
    corrected = corrected[0].toUpperCase() + corrected.slice(1);
    issues.push('Capitalized subject first word');
  }
  // Remove trailing period
  if (corrected.endsWith('.')) { corrected = corrected.replace(/\.+$/,''); issues.push('Removed trailing period from subject'); }

  // Imperative mood heuristic
  const firstWord = (corrected.split(/\s+/)[0] || '').replace(/[^A-Za-z]/g,'');
  const imperative = new Set(['Add','Fix','Update','Remove','Refactor','Handle','Ensure','Prevent','Guard','Use','Convert','Implement','Rename','Address','Increase','Decrease','Improve','Revert','Avoid','Return','Change','Restore','Resolve','Merge','Replace','Clean','Stop','Start','Disable','Enable','Allow','Reject','Create','Move','Extract','Document','Upgrade','Optimize','Simplify','Format','Fixes','Adds']);
  if (firstWord && !imperative.has(firstWord)) {
    issues.push(`Subject may not be in imperative mood (starts with "${firstWord}")`);
  }

  // Length check (<=50 characters)
  if (corrected.length > 50) {
    // try to truncate at last space before 50
    const trunc = corrected.slice(0, 50);
    const lastSpace = trunc.lastIndexOf(' ');
    let shortened = trunc;
    if (lastSpace > 10) shortened = trunc.slice(0, lastSpace);
    corrected = shortened;
    issues.push('Truncated subject to 50 characters');
  }

  const formattedHeader = (ticket ? ticket + ' ' : '') + corrected;
  const formattedBody = body ? wrapText(body, 72) : '';

  const formatted = formattedHeader + (formattedBody ? '\n\n' + formattedBody : '');
  const applied = formatted !== txt;
  return { original: txt, formatted, issues, applied };
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

  const summaryText    = opts.file    ? fs.readFileSync(opts.file, 'utf8') : (opts.comment || null);
  const inlineComments = opts.inlineFile
    ? JSON.parse(fs.readFileSync(opts.inlineFile, 'utf8'))
    : [];

  const totalActions = (summaryText ? 1 : 0) + inlineComments.length;

  console.log(`\nProject/MR : ${projectId}/${mrIid}`);
  console.log(`Summary    : ${summaryText ? (opts.file || 'inline text') : 'none'}`);
  console.log(`Inline     : ${inlineComments.length} comment(s)`);
  console.log(`Dry-run    : ${opts.dryRun ? 'YES' : 'no'}\n`);

  let commitFormatResult = null;
  if (summaryText) {
    commitFormatResult = validateAndFormatCommitMessage(summaryText);
    console.log(`${'─'.repeat(70)}`);
    if (commitFormatResult.issues && commitFormatResult.issues.length) {
      console.log('Commit-format issues/suggestions:');
      for (const i of commitFormatResult.issues) { console.log(' - ' + i); }
      console.log('');
    }
    const preview = (commitFormatResult && commitFormatResult.formatted)
      ? (commitFormatResult.formatted.length > 400 ? commitFormatResult.formatted.slice(0, 400) + '\n...(truncated)' : commitFormatResult.formatted)
      : (summaryText.length > 400 ? summaryText.slice(0, 400) + '\n...(truncated)' : summaryText);
    console.log(preview);
    console.log(`${'─'.repeat(70)}\n`);
  }

  if (inlineComments.length) {
    console.log(`Inline comments:`);
    for (const c of inlineComments) {
      const bodyPreview = c.body.length > 80 ? c.body.slice(0, 80) + '...' : c.body;
      console.log(`  ${c.file}:${c.line}  ${bodyPreview}`);
    }
    console.log();
  }

  if (opts.dryRun) {
    console.log('Dry-run mode — nothing posted.');
    return;
  }

  const answer = await prompt(`Post ${totalActions} comment(s) to MR !${mrIid}? [y/N] `);
  if (answer !== 'y' && answer !== 'yes') {
    console.log('\nAborted. Nothing posted.');
    return;
  }

  // ── Post summary note ──
  if (summaryText) {
    const bodyToPost = (typeof commitFormatResult !== 'undefined' && commitFormatResult && commitFormatResult.formatted) ? commitFormatResult.formatted : summaryText;
    await api.post(`/api/v4/projects/${projectId}/merge_requests/${mrIid}/notes`, {
      body: bodyToPost,
    });
    console.log('✓ Summary comment posted');
  }

  // ── Post inline discussions ──
  if (inlineComments.length) {
    let posted = 0;
    let failed = 0;
    const fallback = [];

    for (const c of inlineComments) {
      try {
        await api.post(`/api/v4/projects/${projectId}/merge_requests/${mrIid}/discussions`, {
          body: c.body,
          position: {
            base_sha:      c.base_sha,
            start_sha:     c.start_sha,
            head_sha:      c.head_sha,
            position_type: 'text',
            new_path:      c.file,
            new_line:      c.line,
          },
        });
        console.log(`  ✓ ${c.file}:${c.line}`);
        posted++;
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        console.error(`  ✗ ${c.file}:${c.line}  ${msg}`);
        fallback.push(c);
        failed++;
      }
    }

    console.log(`\nInline: ${posted} posted, ${failed} failed`);

    // Offer to post failed inline comments as regular notes
    if (fallback.length) {
      const ans = await prompt(`Post ${fallback.length} failed comment(s) as regular MR notes instead? [y/N] `);
      if (ans === 'y' || ans === 'yes') {
        for (const c of fallback) {
          const body = `**${c.file}:${c.line}**\n\n${c.body}`;
          await api.post(`/api/v4/projects/${projectId}/merge_requests/${mrIid}/notes`, { body });
          console.log(`  ✓ ${c.file}:${c.line}  (posted as note)`);
        }
      }
    }
  }
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (err.response) {
    console.error('HTTP Status:', err.response.status);
    console.error('Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
