'use strict';

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/platform');
const logger = require('../lib/logger');

const APPROVED_FILE = path.join(PATHS.claudeHome, 'supermind-approved.json');

function loadApproved() {
  try {
    const data = JSON.parse(fs.readFileSync(APPROVED_FILE, 'utf-8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveApproved(list) {
  fs.writeFileSync(APPROVED_FILE, JSON.stringify(list, null, 2) + '\n');
}

module.exports = function approve(flags) {
  const args = process.argv.slice(3).filter(a => !a.startsWith('-'));

  // supermind-claude approve --list
  if (flags.list || args.length === 0) {
    const approved = loadApproved();
    if (approved.length === 0) {
      console.log('\n  No approved commands. Add one with:\n');
      console.log('    supermind-claude approve "git push"');
      console.log('    supermind-claude approve "/npm run .*/"\n');
      return;
    }
    console.log('\n  Approved commands:\n');
    for (const cmd of approved) {
      logger.success(cmd);
    }
    console.log('');
    return;
  }

  // supermind-claude approve --remove "pattern"
  if (flags.remove) {
    const pattern = args[0];
    if (!pattern) {
      logger.error('Specify the command to remove: supermind-claude approve --remove "git push"');
      return;
    }
    const approved = loadApproved();
    const filtered = approved.filter(c => c !== pattern);
    if (filtered.length === approved.length) {
      logger.warn(`"${pattern}" not found in approved commands`);
      return;
    }
    saveApproved(filtered);
    logger.success(`Removed: ${pattern}`);
    return;
  }

  // supermind-claude approve "command"
  const pattern = args[0];
  const approved = loadApproved();
  if (approved.includes(pattern)) {
    logger.info(`Already approved: ${pattern}`);
    return;
  }
  approved.push(pattern);
  saveApproved(approved);
  logger.success(`Approved: ${pattern}`);
  logger.info('This command will now be auto-allowed by bash-permissions hook');
};
