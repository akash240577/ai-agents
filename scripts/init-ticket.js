'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');

program
  .argument('<ticket>', 'Ticket number, e.g. AMBS-1234')
  .option('-e, --error <msg>', 'Error message to write to error.md', '')
  .option('-d, --dir <path>', 'Base investigations directory (workspace created at <dir>/<ticket>). Defaults to <git-root>/docs/ambs/<ticket>')
  .parse(process.argv);

const ticket   = program.args[0].trim().toUpperCase();
const errorMsg = program.opts().error;
const baseDir  = program.opts().dir;

let branch = 'unknown';
try {
  branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim() || 'unknown';
} catch { /* ignore */ }

let dir;
if (baseDir) {
  dir = path.join(path.resolve(baseDir.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '~')), ticket);
} else {
  let codebaseRoot;
  try {
    codebaseRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch {
    console.error('Error: could not determine git repo root. Provide --dir or run from inside a git repository.');
    process.exit(1);
  }
  dir = path.join(codebaseRoot, 'docs', 'ambs', ticket);
}

const today   = new Date().toISOString().slice(0, 10);
const jiraUrl = `https://ascend-learning.atlassian.net/browse/${ticket}`;

function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`  skipped (exists): ${filePath}`);
  } else {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  created : ${filePath}`);
  }
}

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`  created : ${dir}`);
}

writeIfMissing(path.join(dir, 'error.md'), errorMsg);

const errorLine = errorMsg ? '(see error.md)' : 'TBD - paste the error into error.md';
writeIfMissing(path.join(dir, 'investigation.md'), `# Investigation: ${ticket}

## Ticket Information
- **Ticket**: [${ticket}](${jiraUrl})
- **Date**: ${today}
- **Investigator**: ambs-debug agent
- **Branch**: ${branch}

## Feature Overview (Business Context)
TBD - what is this feature, who uses it, and what business workflow does it support? Understand this before diving into the error.

## Error Summary
${errorLine}

## Affected Components
- **Files**: TBD
- **Tables**: TBD
- **Controllers**: TBD
- **Models**: TBD
- **Services**: TBD

## Related Documentation
TBD

## Code Analysis
TBD

## Database Analysis
N/A unless database-related

## Steps to Reproduce
1. Login to \`docker.medhub.com\` as: TBD
2. Navigate to: TBD
3. Actions: TBD
4. Expected result: TBD
5. Prerequisite data: TBD

## Proposed Fix
TBD - requires investigation

## Debug Logging Added
TBD

## Testing Plan
TBD

## Next Steps
- [ ] Proceed to investigation
`);

writeIfMissing(path.join(dir, 'queries.sql'), `-- Troubleshooting queries for ${ticket}
-- All queries are SELECT-only with LIMIT clauses
-- Replace placeholders like {USER_ID} with actual values before running
`);

writeIfMissing(path.join(dir, 'dev-notes.md'), `# Dev Notes: ${ticket}

## Hypotheses

## Findings

## Decisions
`);

console.log('');
console.log('Done.');
console.log(`  Workspace : ${dir}`);
console.log(`  Ticket    : ${jiraUrl}`);
