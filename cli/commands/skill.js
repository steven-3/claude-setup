'use strict';

const logger = require('../lib/logger');
const vendorSkills = require('../lib/vendor-skills');

module.exports = async function skill(flags) {
  const subcommand = (flags.args && flags.args[0]) || '';
  const target = flags.args && flags.args[1];

  switch (subcommand) {
    case 'add':
      return handleAdd(target, flags);
    case 'update':
      return handleUpdate(target, flags);
    case 'list':
      return handleList();
    case 'remove':
      return handleRemove(target);
    default:
      showHelp();
  }
};

// ---------------------------------------------------------------------------
// handleAdd
// ---------------------------------------------------------------------------

function handleAdd(url, flags) {
  if (!url) {
    logger.error('Specify a GitHub URL: supermind-claude skill add <github-url> [--global]');
    return;
  }

  try {
    const result = vendorSkills.addSkill(url, { global: !!flags.global });
    console.log('');
    logger.success(`Installed ${result.installed.length} skill(s) from ${result.source}`);
    for (const name of result.installed) {
      logger.info(`  - ${name}`);
    }
    logger.info(`Commit: ${result.commit}`);
    console.log('');
  } catch (err) {
    logger.error(err.message);
  }
}

// ---------------------------------------------------------------------------
// handleUpdate
// ---------------------------------------------------------------------------

function handleUpdate(name, flags) {
  try {
    if (flags.all) {
      const result = vendorSkills.updateAll();
      console.log('');
      if (result.results.length === 0) {
        logger.info('No vendor skills installed');
        return;
      }
      logger.success(`Updated ${result.results.filter(r => r.updated).length} skill(s)`);
      for (const r of result.results) {
        if (r.error) {
          logger.warn(`${r.name}: ${r.error}`);
        } else if (r.updated) {
          logger.success(`  - ${r.name}: ${r.message || 'Updated'}`);
        } else {
          logger.info(`  - ${r.name}: ${r.message || 'No changes'}`);
        }
      }
      console.log('');
    } else if (name) {
      const result = vendorSkills.updateSkill(name);
      console.log('');
      if (result.updated) {
        logger.success(`Updated: ${name}`);
      } else {
        logger.info(`${name}: ${result.message || 'No changes'}`);
      }
      console.log('');
    } else {
      logger.error('Specify a skill name or use --all: supermind-claude skill update <name> [--all]');
    }
  } catch (err) {
    logger.error(err.message);
  }
}

// ---------------------------------------------------------------------------
// handleList
// ---------------------------------------------------------------------------

function handleList() {
  try {
    const skills = vendorSkills.listSkills();
    console.log('');
    if (skills.length === 0) {
      logger.info('No vendor skills installed');
      console.log('');
      return;
    }

    // Format as simple table
    console.log('  Vendor Skills:\n');
    const maxNameLen = Math.max(...skills.map(s => s.name.length));
    const maxSourceLen = Math.max(...skills.map(s => s.source.length));
    const maxScopeLen = Math.max(...skills.map(s => s.scope.length));

    for (const skill of skills) {
      const padName = skill.name.padEnd(maxNameLen);
      const padSource = skill.source.padEnd(maxSourceLen);
      const padScope = skill.scope.padEnd(maxScopeLen);
      const commit = skill.commit.substring(0, 8);
      console.log(`    ${padName}  ${padSource}  ${padScope}  ${commit}`);
    }
    console.log('');
  } catch (err) {
    logger.error(err.message);
  }
}

// ---------------------------------------------------------------------------
// handleRemove
// ---------------------------------------------------------------------------

function handleRemove(name) {
  if (!name) {
    logger.error('Specify a skill name: supermind-claude skill remove <name>');
    return;
  }

  try {
    vendorSkills.removeSkill(name);
    console.log('');
    logger.success(`Removed: ${name}`);
    console.log('');
  } catch (err) {
    logger.error(err.message);
  }
}

// ---------------------------------------------------------------------------
// showHelp
// ---------------------------------------------------------------------------

function showHelp() {
  console.log(`
  Usage: supermind-claude skill <command> [args]

  Commands:
    add <github-url> [--global]   Install skill from GitHub
    update [name] [--all]         Update skill(s) from source
    list                          Show installed vendor skills
    remove <name>                 Remove a vendor skill

  Examples:
    supermind-claude skill add https://github.com/owner/repo
    supermind-claude skill add github.com/owner/repo --global
    supermind-claude skill update my-skill
    supermind-claude skill update --all
    supermind-claude skill list
    supermind-claude skill remove my-skill
`);
}
