'use strict';

/**
 * lib/credentials.js
 *
 * Shared credential loader for JIRA and GitLab scripts.
 *
 * JIRA priority:
 *   1. JIRA_BASE_URL / JIRA_USER_EMAIL / JIRA_API_TOKEN  (from .env via dotenv)
 *   2. ATLASSIAN_SITE_URL / ATLASSIAN_USER_EMAIL / ATLASSIAN_API_TOKEN  (env variants)
 *   3. ~/.copilot/mcp.json  (used by GitHub Copilot / MCP tooling)
 *
 * GitLab priority:
 *   1. GITLAB_BASE_URL / GITLAB_TOKEN  (from .env via dotenv)
 *   2. ~/.gitlab_token  (bash export file, e.g. export GITLAB_TOKEN=xxx)
 */

const fs   = require('fs');
const os   = require('os');
const path = require('path');

function loadJiraCredentials() {
  const baseUrl = process.env.JIRA_BASE_URL || process.env.ATLASSIAN_SITE_URL;
  const email   = process.env.JIRA_USER_EMAIL || process.env.ATLASSIAN_USER_EMAIL;
  const token   = process.env.JIRA_API_TOKEN || process.env.ATLASSIAN_API_TOKEN;

  if (baseUrl && email && token) return { baseUrl, email, token };

  // Fallback: ~/.copilot/mcp.json
  const mcpPath = path.join(os.homedir(), '.copilot', 'mcp.json');
  if (fs.existsSync(mcpPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
      const env = cfg?.mcpServers?.atlassian?.env || {};
      if (env.ATLASSIAN_SITE_URL && env.ATLASSIAN_USER_EMAIL && env.ATLASSIAN_API_TOKEN) {
        return {
          baseUrl: env.ATLASSIAN_SITE_URL,
          email:   env.ATLASSIAN_USER_EMAIL,
          token:   env.ATLASSIAN_API_TOKEN,
        };
      }
    } catch { /* ignore parse errors */ }
  }

  return { baseUrl, email, token };
}

function loadGitLabCredentials() {
  const baseUrl = process.env.GITLAB_BASE_URL || 'https://git.ascendlearning.com';
  let token = process.env.GITLAB_TOKEN;

  if (!token) {
    // Fallback: ~/.gitlab_token (bash export file)
    const tokenPath = path.join(os.homedir(), '.gitlab_token');
    if (fs.existsSync(tokenPath)) {
      try {
        const content = fs.readFileSync(tokenPath, 'utf8');
        const match   = content.match(/GITLAB_TOKEN=['"]?([^'"\s\n]+)['"]?/);
        if (match) token = match[1];
      } catch { /* ignore */ }
    }
  }

  return { baseUrl, token };
}

module.exports = { loadJiraCredentials, loadGitLabCredentials };
