/**
 * utils/fingerprint.js — Stable correlation IDs for the Datadog → Jira pipeline.
 *
 * Three distinct identities:
 *   - fingerprint (`fp`): SHA-256 over error_class + first 3 in-app (/app/) frames + entry point.
 *                          Distinguishes errors that share the same low-level root cause but
 *                          originate from different features/pages (e.g. same mysqli failure
 *                          triggered from evaluations.mh vs index.mh → two different `fp` values
 *                          → two separate Jira tickets).
 *   - endpoint_key:        Method + entry-point path (or HTTP resource when no entry point found).
 *                          Stored as label dd-ep-{8hex} on Jira tickets.
 *   - entry_point:         The last public/*.mh frame in the stack — the feature/page that
 *                          initiated the failing request. Extracted by extractEntryPoint().
 */
'use strict';
const crypto = require('crypto');

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function stripReleaseHash(text) {
  return (text ?? '').replace(
    /\/releases\/main\/releases\/[a-f0-9]+-\d+\//g,
    '/releases/main/releases/APP_RELEASE/'
  );
}

function normalizeResource(resource) {
  if (!resource) return '';
  let s = resource.toLowerCase().trim();
  s = s.replace(/\b\d{2,}\b/g, ':id');
  s = s.replace(/\/+$/, '');
  return s;
}

function normalizeStackTop(stackTrace, frameCount = 3) {
  if (!stackTrace) return '';
  const normalized = stripReleaseHash(stackTrace.replace(/\\n/g, '\n'));
  const lines = normalized.split('\n');

  const frames = [];
  for (const line of lines) {
    if (!/^#\d+/.test(line.trim())) continue;
    if (!line.includes('/app/')) continue;
    const stripped = line.replace(/\((\d+)\)/g, '()').replace(/:\d+\b/g, '');
    frames.push(stripped.trim());
    if (frames.length >= frameCount) break;
  }
  return frames.join('\n');
}

/**
 * Extract the entry-point frame from a PHP stack trace.
 *
 * In MedHub stacks the entry point is the last `.mh` file in `/public/` before `{main}`.
 * This is the feature/page that initiated the request, and is what distinguishes:
 *   "mysqli error triggered from evaluations.mh" vs "mysqli error triggered from index.mh"
 * even when both share the same low-level /app/ frames and the same Datadog issue_id.
 *
 * Returns a normalized path like "u/f/evaluations_director.mh" (no leading slash,
 * no release hash, no line number).
 * Returns '' when no entry point can be found (vendor-only stack, etc.).
 */
function extractEntryPoint(stackTrace) {
  if (!stackTrace) return '';
  const normalized = stripReleaseHash(stackTrace.replace(/\\n/g, '\n'));
  const lines = normalized.split('\n').reverse();
  for (const line of lines) {
    if (!/^#\d+/.test(line.trim())) continue;
    const m = line.match(/\/public\/([^\s(]+\.(?:mh|php))/);
    if (m) {
      return m[1].replace(/\(\d+\)$/, '').replace(/\\/g, '/').toLowerCase();
    }
  }
  return '';
}

/**
 * Fingerprint = error_class + first-3-app-frames + entry_point.
 */
function computeFingerprint({ errorClass, stackTrace }) {
  const canonical = [
    errorClass ?? '',
    normalizeStackTop(stackTrace ?? '', 3),
    extractEntryPoint(stackTrace ?? ''),
  ].join('|');
  return sha256Hex(canonical).slice(0, 16);
}

/**
 * Endpoint key uses the entry point path when available (more specific than the HTTP resource
 * name, which can be generic like "GET /"). Falls back to the HTTP resource name.
 */
function computeEndpointKey({ method, resource, stackTrace }) {
  const normMethod = (method ?? '').trim().toUpperCase();
  const entryPoint = stackTrace ? extractEntryPoint(stackTrace) : '';
  const key = entryPoint || normalizeResource(resource);
  return `${normMethod}|${key}`;
}

function endpointKeyHash(endpointKey) {
  return sha256Hex(endpointKey).slice(0, 8);
}

function issueIdLabel(issueId) {
  return `dd-issue-${(issueId ?? '').replace(/-/g, '')}`;
}

function fingerprintLabel(fp) {
  return `dd-fp-${fp}`;
}

function endpointKeyLabel(endpointKey) {
  return `dd-ep-${endpointKeyHash(endpointKey)}`;
}

module.exports = {
  stripReleaseHash,
  normalizeResource,
  normalizeStackTop,
  extractEntryPoint,
  computeFingerprint,
  computeEndpointKey,
  endpointKeyHash,
  issueIdLabel,
  fingerprintLabel,
  endpointKeyLabel,
};
