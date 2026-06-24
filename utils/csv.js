'use strict';
const fs = require('fs');

function escapeField(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { fields.push(current); current = ''; }
      else { current += ch; }
    }
  }
  fields.push(current);
  return fields;
}

function readCsv(filePath, headers) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(l => l.trim());
  if (lines.length <= 1) return [];
  const fileHeaders = headers ?? parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    return Object.fromEntries(fileHeaders.map((h, i) => [h, values[i] ?? '']));
  });
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escapeField(row[h])).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

function appendCsv(filePath, rows, headers) {
  const needsHeader = !fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8').trim() === '';
  const lines = [];
  if (needsHeader) lines.push(headers.join(','));
  for (const row of rows) {
    lines.push(headers.map(h => escapeField(row[h])).join(','));
  }
  fs.appendFileSync(filePath, lines.join('\n') + '\n');
}

module.exports = { readCsv, writeCsv, appendCsv };
