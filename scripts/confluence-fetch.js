'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');
const { fetchWithRetry } = require('../utils/http');
const { logger } = require('../utils/logger');

const BASE_URL = process.env.JIRA_BASE_URL;
const KNOWLEDGE_DIR = path.resolve(__dirname, '..', 'knowledge', 'confluence');
const INDEX_FILE = path.join(KNOWLEDGE_DIR, 'index.json');

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

// ── Auth ──────────────────────────────────────────────────────────────────────

function authHeaders() {
  const token = Buffer.from(
    `${process.env.JIRA_USER_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString('base64');
  return {
    Authorization: `Basic ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// ── Index (cache manifest) ────────────────────────────────────────────────────

function loadIndex() {
  if (!fs.existsSync(INDEX_FILE)) return {};
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
}

function saveIndex(index) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

// ── Confluence API (v1) ───────────────────────────────────────────────────────
// Using v1 REST API: offset-based pagination is reliable; space.key returned natively.

async function fetchPageMeta(pageId) {
  const url = `${BASE_URL}/wiki/rest/api/content/${pageId}?expand=version,space`;
  const res = await fetchWithRetry(url, { headers: authHeaders() });
  return res.json();
}

async function fetchPageWithBody(pageId) {
  const url = `${BASE_URL}/wiki/rest/api/content/${pageId}?expand=version,space,body.storage`;
  const res = await fetchWithRetry(url, { headers: authHeaders() });
  return res.json();
}

async function fetchChildren(pageId) {
  const pages = [];
  const limit = 50;
  let start = 0;
  while (true) {
    const url = `${BASE_URL}/wiki/rest/api/content/${pageId}/child/page?limit=${limit}&start=${start}&expand=version`;
    const res = await fetchWithRetry(url, { headers: authHeaders() });
    const data = await res.json();
    const results = data.results ?? [];
    pages.push(...results);
    if (results.length < limit) break;
    start += results.length;
  }
  return pages;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract the first ~300 chars of body text as a one-line summary for index.json. */
function extractSummary(markdown) {
  const text = markdown
    .replace(/^#+\s.*/gm, '')      // strip headings
    .replace(/[*_`#>|]/g, '')      // strip inline markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // collapse links to text
    .replace(/\s+/g, ' ')
    .trim();
  const truncated = text.slice(0, 320);
  const lastSentence = truncated.search(/[.!?][^.!?]*$/);
  return (lastSentence > 60 ? truncated.slice(0, lastSentence + 1) : truncated).trim();
}

function sanitize(title) {
  return title
    .replace(/[/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

function parsePageId(input) {
  const m = input.match(/\/pages\/(\d+)/);
  if (m) return m[1];
  if (/^\d+$/.test(input)) return input;
  throw new Error(`Cannot extract page ID from: ${input}`);
}

function parseSpaceKey(input) {
  const m = input.match(/\/spaces\/([^/]+)\//);
  return m ? m[1] : null;
}

// ── Core fetch logic ──────────────────────────────────────────────────────────

async function processPage(pageId, parentDir, index, refresh, spaceKey) {
  // Version check: if cached and not refreshing, fetch metadata only to compare
  const cached = index[pageId];
  let page;

  if (!refresh && cached) {
    const meta = await fetchPageMeta(pageId);
    const currentVersion = meta.version?.number;
    if (currentVersion && currentVersion === cached.version) {
      logger.info(`  skip  ${meta.title} (v${currentVersion} unchanged)`);
      // Still recurse to check children for updates
      const children = await fetchChildren(pageId);
      const childDir = path.join(parentDir, sanitize(meta.title));
      for (const child of children) {
        await processPage(child.id, childDir, index, refresh, spaceKey);
      }
      return;
    }
    logger.info(`  update ${meta.title} (v${cached.version} → v${currentVersion})`);
  }

  page = await fetchPageWithBody(pageId);
  const { title } = page;
  spaceKey = spaceKey ?? page.space?.key ?? 'UNKNOWN';
  const versionNumber = page.version?.number ?? 0;
  const body = page.body?.storage?.value ?? '';
  const markdown = td.turndown(body || '_(no content)_');

  fs.mkdirSync(parentDir, { recursive: true });
  const filename = sanitize(title) + '.md';
  const filePath = path.join(parentDir, filename);
  const relPath = path.relative(KNOWLEDGE_DIR, filePath);

  const content = `# ${title}\n\n${markdown}\n`;
  fs.writeFileSync(filePath, content, 'utf8');

  index[pageId] = {
    title,
    spaceKey,
    filePath: relPath,
    version: versionNumber,
    fetchedAt: new Date().toISOString(),
    summary: extractSummary(markdown),
  };

  logger.info(`  saved  ${relPath} (v${versionNumber})`);

  const children = await fetchChildren(pageId);
  if (children.length) {
    logger.info(`  ${children.length} child(ren) under "${title}"`);
    const childDir = path.join(parentDir, sanitize(title));
    for (const child of children) {
      await processPage(child.id, childDir, index, refresh);
    }
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find(a => !a.startsWith('--'));
  const refresh = args.includes('--refresh');

  if (!urlArg) {
    console.error('Usage: node confluence-fetch.js <page-url-or-id> [--refresh]');
    process.exit(1);
  }
  if (!BASE_URL || !process.env.JIRA_USER_EMAIL || !process.env.JIRA_API_TOKEN) {
    console.error('Missing required env vars: JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN');
    process.exit(1);
  }

  const pageId = parsePageId(urlArg);
  logger.info(`Fetching Confluence page ${pageId}${refresh ? ' (--refresh)' : ''}`);

  // Determine space key: prefer URL (reliable), fall back to v1 API's space.key
  const rootMeta = await fetchPageMeta(pageId);
  const spaceKey = parseSpaceKey(urlArg) ?? rootMeta.space?.key ?? 'UNKNOWN';
  const spaceDir = path.join(KNOWLEDGE_DIR, spaceKey);

  const index = loadIndex();
  await processPage(pageId, spaceDir, index, refresh, spaceKey);
  saveIndex(index);

  logger.info(`Done. Files saved under knowledge/confluence/${spaceKey}/`);
  logger.info(`Index: ${INDEX_FILE}`);
}

main().catch(err => {
  logger.error('confluence-fetch failed', err.message);
  process.exit(1);
});
