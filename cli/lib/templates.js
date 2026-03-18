'use strict';

const fs = require('fs');
const path = require('path');
const { PATHS, ensureDir, getPackageRoot } = require('./platform');
const logger = require('./logger');

function installTemplates() {
  ensureDir(PATHS.templatesDir);
  const src = path.join(getPackageRoot(), 'templates', 'CLAUDE.md');
  const dest = path.join(PATHS.templatesDir, 'CLAUDE.md');
  fs.copyFileSync(src, dest);
  logger.success('CLAUDE.md template');
}

function removeTemplates() {
  const dest = path.join(PATHS.templatesDir, 'CLAUDE.md');
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
    logger.success('Removed CLAUDE.md template');
  }
}

module.exports = { installTemplates, removeTemplates };
