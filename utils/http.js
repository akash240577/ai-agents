'use strict';
const { logger } = require('./logger');

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = parseInt(res.headers.get('Retry-After') ?? '0', 10);
      const delay = retryAfter > 0 ? retryAfter * 1000 : Math.pow(2, attempt) * 1000;
      logger.warn(`HTTP ${res.status} on ${url} — retrying in ${delay}ms (attempt ${attempt}/${retries})`);
      await sleep(delay);
      lastError = res;
      continue;
    }

    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}\n${body}`);
  }
  throw new Error(`Max retries exceeded for ${url} (last status: ${lastError?.status})`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { fetchWithRetry, sleep };
