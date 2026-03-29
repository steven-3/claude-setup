'use strict';

const logger = require('../lib/logger');
const openspecLib = require('../lib/openspec');

function handleInstall() {
  const result = openspecLib.installCli();
  if (result.success) {
    logger.success('OpenSpec CLI installed');
  } else {
    logger.error('Failed: ' + result.error);
  }
}

function handleDoctor() {
  const health = openspecLib.checkHealth();

  if (health.installed) {
    logger.success(`OpenSpec CLI installed at version ${health.version}`);
    if (health.compatible) {
      logger.success(`Compatible with minimum version ${openspecLib.OPENSPEC_MIN_VERSION}`);
    } else {
      logger.warn(`Version ${health.version} is below minimum required ${openspecLib.OPENSPEC_MIN_VERSION}`);
    }
  } else {
    logger.error('OpenSpec CLI is not installed');
  }
}

function showHelp() {
  console.log(`
  Usage: supermind openspec <command>

  Commands:
    install     Install or update the OpenSpec CLI
    doctor      Check OpenSpec CLI health
`);
}

module.exports = function openspec(flags) {
  const subcommand = (flags.args && flags.args[0]) || '';

  switch (subcommand) {
    case 'install':
      return handleInstall();
    case 'doctor':
      return handleDoctor();
    default:
      showHelp();
  }
};
