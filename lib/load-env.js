'use strict';

/**
 * lib/load-env.js
 *
 * Centralised .env loader for all ai-agents scripts.
 *
 * Loading order (first file wins for each variable):
 *   1. ~/.copilot/.env  — user credentials in the standard Copilot config dir
 *   2. ./.env           — local .env in the plugin directory (for local dev / testing)
 *
 * Require this module at the top of every script instead of calling
 * dotenv.config() directly:
 *
 *   require('../lib/load-env');
 */

const path   = require('path');
const os     = require('os');
const dotenv = require('dotenv');

// 1. User credentials — standard Copilot config dir, never overwritten by plugin updates
dotenv.config({ path: path.join(os.homedir(), '.copilot', '.env') });

// 2. Local .env in plugin directory — for contributors developing the plugin locally
dotenv.config({ path: path.join(__dirname, '..', '.env') });
