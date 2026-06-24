'use strict';
const fs   = require('fs');
const path = require('path');

const invRoot = process.argv[2];
if (!invRoot) {
  console.error('Usage: node setup-permissions.js <INVESTIGATIONS_ROOT>');
  process.exit(1);
}

const home = process.env.HOME || process.env.USERPROFILE;
const settingsPath = path.join(home, '.copilot', 'settings.json');

let settings = {};
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {
  // File doesn't exist or is invalid — start fresh
}

if (!settings.permissions) settings.permissions = {};
if (!settings.permissions.allow) settings.permissions.allow = [];

const rules = [
  `Read(${invRoot}/**)`,
  `Write(${invRoot}/**)`,
];

let added = 0;
for (const rule of rules) {
  if (!settings.permissions.allow.includes(rule)) {
    settings.permissions.allow.push(rule);
    added++;
  }
}

// ~/.copilot/ already exists (created by step 3), so no need to mkdir
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

if (added > 0) {
  console.log(`    updated ~/.copilot/settings.json — granted Read/Write access to ${invRoot}`);
} else {
  console.log(`    ~/.copilot/settings.json already has access for ${invRoot}`);
}
