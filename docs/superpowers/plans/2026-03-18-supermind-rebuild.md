# Supermind Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the claude-setup repo as a clean npm package called `supermind-claude` with a JS CLI, rewritten hooks, skill-creator-compliant skills, and templates.

**Architecture:** npm package with `cli/` (entry point + commands + lib modules), `hooks/` (5 hook scripts), `skills/` (3 skill directories), `templates/`, and `airis/` config. Zero runtime dependencies — Node.js built-ins only. Cross-platform (Windows, macOS, Linux).

**Tech Stack:** Node.js (>=18), npm (packaging/publishing), Git

**Spec:** `docs/superpowers/specs/2026-03-18-supermind-rebuild-design.md`

---

### Task 1: Scaffold package.json and CLI entry point

**Files:**
- Create: `package.json`
- Create: `cli/index.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "supermind-claude",
  "version": "2.0.0",
  "description": "Complete, opinionated Claude Code setup — hooks, skills, status line, MCP servers, and living documentation",
  "bin": {
    "supermind-claude": "./cli/index.js",
    "supermind": "./cli/index.js"
  },
  "files": [
    "cli/",
    "hooks/",
    "skills/",
    "templates/",
    "airis/",
    ".env.example"
  ],
  "keywords": ["claude", "claude-code", "ai", "developer-tools", "mcp"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/USER/supermind"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: Create cli/index.js**

```js
#!/usr/bin/env node
'use strict';

const { version } = require('../package.json');

const COMMANDS = {
  install: () => require('./commands/install'),
  update: () => require('./commands/update'),
  doctor: () => require('./commands/doctor'),
  uninstall: () => require('./commands/uninstall'),
};

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = {};
  let command = 'install'; // default

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { flags.help = true; continue; }
    if (arg === '--version' || arg === '-v') { flags.version = true; continue; }
    if (arg === '--non-interactive') { flags.nonInteractive = true; continue; }
    if (arg === '--yes' || arg === '-y') { flags.yes = true; continue; }
    if (arg === '--mcp' && args[i + 1]) { flags.mcp = args[++i]; continue; }
    if (!arg.startsWith('-') && COMMANDS[arg]) { command = arg; continue; }
  }

  return { command, flags };
}

function showHelp() {
  console.log(`
  supermind-claude v${version}

  Usage: supermind-claude [command] [options]

  Commands:
    install     Full global setup (default)
    update      Refresh hooks, skills, and templates
    doctor      Verify installation health
    uninstall   Remove all Supermind components

  Options:
    --non-interactive   Skip all prompts, use defaults
    --mcp <mode>        MCP setup: docker, direct, or skip
    --yes, -y           Auto-confirm destructive operations
    --help, -h          Show this help
    --version, -v       Show version
`);
}

function main() {
  const { command, flags } = parseArgs(process.argv);

  if (flags.version) { console.log(version); process.exit(0); }
  if (flags.help) { showHelp(); process.exit(0); }

  const run = COMMANDS[command]();
  run(flags);
}

main();
```

- [ ] **Step 3: Verify the CLI entry point parses args correctly**

Run: `node cli/index.js --version`
Expected: `2.0.0`

Run: `node cli/index.js --help`
Expected: Help text with commands and options listed

- [ ] **Step 4: Commit**

```bash
git add package.json cli/index.js
git commit -m "Scaffold package.json and CLI entry point"
```

---

### Task 2: CLI lib modules — platform, logger

**Files:**
- Create: `cli/lib/platform.js`
- Create: `cli/lib/logger.js`

- [ ] **Step 1: Create cli/lib/platform.js**

Cross-platform path resolution. All paths use `path.join()` with `os.homedir()`.

```js
'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

const home = os.homedir();

const PATHS = {
  claudeHome: path.join(home, '.claude'),
  settings: path.join(home, '.claude', 'settings.json'),
  settingsBackup: path.join(home, '.claude', 'settings.json.backup'),
  hooksDir: path.join(home, '.claude', 'hooks'),
  skillsDir: path.join(home, '.claude', 'skills'),
  templatesDir: path.join(home, '.claude', 'templates'),
  sessionsDir: path.join(home, '.claude', 'sessions'),
  versionFile: path.join(home, '.claude', '.supermind-version'),
  legacyHooksJson: path.join(home, '.claude', 'hooks.json'),
  airisDir: path.join(home, '.claude', 'airis'),
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getPackageRoot() {
  return path.resolve(__dirname, '..', '..');
}

module.exports = { PATHS, ensureDir, getPackageRoot };
```

- [ ] **Step 2: Create cli/lib/logger.js**

Colored output with ANSI codes. No dependencies.

```js
'use strict';

const { version } = require('../../package.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const R = '\x1b[0m';

function banner() {
  console.log(`\n${CYAN}${BOLD}  ⚡ Supermind${R} ${DIM}v${version}${R}`);
  console.log(`${DIM}  Complete Claude Code setup${R}\n`);
}

function step(n, total, message) {
  console.log(`${DIM}[${n}/${total}]${R} ${message}`);
}

function success(message) {
  console.log(`  ${GREEN}✓${R} ${message}`);
}

function warn(message) {
  console.log(`  ${YELLOW}⚠${R} ${message}`);
}

function error(message) {
  console.log(`  ${RED}✗${R} ${message}`);
}

function info(message) {
  console.log(`  ${DIM}${message}${R}`);
}

module.exports = { banner, step, success, warn, error, info };
```

- [ ] **Step 3: Verify modules load**

Run: `node -e "const p = require('./cli/lib/platform'); console.log(p.PATHS.claudeHome)"`
Expected: Path ending in `.claude`

Run: `node -e "const l = require('./cli/lib/logger'); l.banner()"`
Expected: Supermind banner with version

- [ ] **Step 4: Commit**

```bash
git add cli/lib/platform.js cli/lib/logger.js
git commit -m "Add platform detection and logger lib modules"
```

---

### Task 3: CLI lib modules — settings, plugins

**Files:**
- Create: `cli/lib/settings.js`
- Create: `cli/lib/plugins.js`

- [ ] **Step 1: Create cli/lib/settings.js**

Key-type-aware merge. Identifies Supermind-owned entries by known hook filenames and plugin IDs.

```js
'use strict';

const fs = require('fs');
const { PATHS } = require('./platform');
const logger = require('./logger');

// Known Supermind hook filenames — used to identify owned entries
const SUPERMIND_HOOKS = [
  'bash-permissions.js', 'session-start.js', 'session-end.js',
  'cost-tracker.js', 'statusline-command.js',
];

const SUPERMIND_PLUGINS = [
  'superpowers@claude-plugins-official',
  'claude-md-management@claude-plugins-official',
  'frontend-design@claude-plugins-official',
  'ui-ux-pro-max@ui-ux-pro-max-skill',
];

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(PATHS.settings, 'utf-8'));
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  fs.writeFileSync(PATHS.settings, JSON.stringify(settings, null, 2) + '\n');
}

function backupSettings() {
  if (fs.existsSync(PATHS.settings) && !fs.existsSync(PATHS.settingsBackup)) {
    fs.copyFileSync(PATHS.settings, PATHS.settingsBackup);
    logger.info('Backed up existing settings.json');
  }
}

function isSupermindHookEntry(entry) {
  const cmd = entry?.command || '';
  return SUPERMIND_HOOKS.some(h => cmd.includes(h));
}

// Merge hook arrays: keep user entries, upsert Supermind entries by filename match
function mergeHookArray(existing, incoming) {
  const result = (existing || []).filter(e => !isSupermindHookEntry(e));
  for (const entry of incoming) {
    result.push(entry);
  }
  return result;
}

// Merge objects: add missing keys, preserve existing
function mergeObjects(existing, incoming) {
  const result = { ...existing };
  for (const [key, val] of Object.entries(incoming)) {
    if (!(key in result)) result[key] = val;
  }
  return result;
}

// Merge hook event configs: each event has a { matcher?, hooks: [] } structure
function mergeHookEvents(existing, incoming) {
  const result = { ...existing };
  for (const [event, configs] of Object.entries(incoming)) {
    if (!result[event]) {
      result[event] = configs;
      continue;
    }
    // Merge each config entry's hooks array
    const existingConfigs = Array.isArray(result[event]) ? result[event] : [result[event]];
    const incomingConfigs = Array.isArray(configs) ? configs : [configs];

    for (const inConfig of incomingConfigs) {
      const matcher = inConfig.matcher || null;
      const existingIdx = existingConfigs.findIndex(c => (c.matcher || null) === matcher);
      if (existingIdx >= 0) {
        existingConfigs[existingIdx] = {
          ...existingConfigs[existingIdx],
          hooks: mergeHookArray(existingConfigs[existingIdx].hooks, inConfig.hooks),
        };
      } else {
        existingConfigs.push(inConfig);
      }
    }
    result[event] = existingConfigs;
  }
  return result;
}

function mergeSettings(existing, defaults) {
  const result = { ...existing };

  // Scalars: set only if absent
  for (const key of ['alwaysThinkingEnabled', 'effortLevel', 'voiceEnabled', 'skipDangerousModePermissionPrompt']) {
    if (!(key in result) && key in defaults) result[key] = defaults[key];
  }

  // Supermind-owned (always overwrite)
  if (defaults.statusLine) result.statusLine = defaults.statusLine;

  // Objects: recursive merge
  if (defaults.permissions) result.permissions = mergeObjects(result.permissions || {}, defaults.permissions);
  if (defaults.enabledPlugins) result.enabledPlugins = mergeObjects(result.enabledPlugins || {}, defaults.enabledPlugins);
  if (defaults.extraKnownMarketplaces) result.extraKnownMarketplaces = mergeObjects(result.extraKnownMarketplaces || {}, defaults.extraKnownMarketplaces);

  // Hooks: special merge
  if (defaults.hooks) result.hooks = mergeHookEvents(result.hooks || {}, defaults.hooks);

  return result;
}

// Remove Supermind entries from settings (for uninstall)
function removeSupermindEntries(settings) {
  const result = { ...settings };

  // Remove statusLine
  delete result.statusLine;

  // Remove Supermind plugins
  if (result.enabledPlugins) {
    for (const id of SUPERMIND_PLUGINS) {
      delete result.enabledPlugins[id];
    }
  }

  // Remove Supermind marketplace entries
  if (result.extraKnownMarketplaces) {
    delete result.extraKnownMarketplaces['ui-ux-pro-max-skill'];
  }

  // Remove Supermind hooks from each event
  if (result.hooks) {
    for (const [event, configs] of Object.entries(result.hooks)) {
      const configArr = Array.isArray(configs) ? configs : [configs];
      for (const config of configArr) {
        if (config.hooks) {
          config.hooks = config.hooks.filter(h => !isSupermindHookEntry(h));
        }
      }
      // Clean up empty configs
      result.hooks[event] = configArr.filter(c => c.hooks?.length > 0);
      if (result.hooks[event].length === 0) delete result.hooks[event];
    }
    if (Object.keys(result.hooks).length === 0) delete result.hooks;
  }

  // Remove scalars Supermind set
  delete result.alwaysThinkingEnabled;
  delete result.effortLevel;

  return result;
}

module.exports = {
  readSettings, writeSettings, backupSettings,
  mergeSettings, removeSupermindEntries,
  SUPERMIND_HOOKS, SUPERMIND_PLUGINS,
};
```

- [ ] **Step 2: Create cli/lib/plugins.js**

Returns the plugin/marketplace config objects for merging into settings.

```js
'use strict';

function getPluginDefaults() {
  return {
    enabledPlugins: {
      'superpowers@claude-plugins-official': true,
      'claude-md-management@claude-plugins-official': true,
      'frontend-design@claude-plugins-official': true,
      'ui-ux-pro-max@ui-ux-pro-max-skill': true,
    },
    extraKnownMarketplaces: {
      'ui-ux-pro-max-skill': {
        source: { source: 'github', repo: 'nextlevelbuilder/ui-ux-pro-max-skill' },
      },
    },
  };
}

module.exports = { getPluginDefaults };
```

- [ ] **Step 3: Verify settings merge works**

Run: `node -e "const s = require('./cli/lib/settings'); console.log(typeof s.mergeSettings)"`
Expected: `function`

- [ ] **Step 4: Commit**

```bash
git add cli/lib/settings.js cli/lib/plugins.js
git commit -m "Add settings merge and plugin config lib modules"
```

---

### Task 4: CLI lib modules — hooks, skills, templates

**Files:**
- Create: `cli/lib/hooks.js`
- Create: `cli/lib/skills.js`
- Create: `cli/lib/templates.js`

- [ ] **Step 1: Create cli/lib/hooks.js**

Copies hook files and returns the settings.json hook config for merging.

```js
'use strict';

const fs = require('fs');
const path = require('path');
const { PATHS, ensureDir, getPackageRoot } = require('./platform');
const logger = require('./logger');

function getHookFiles() {
  const hooksSource = path.join(getPackageRoot(), 'hooks');
  return fs.readdirSync(hooksSource).filter(f => f.endsWith('.js'));
}

function installHooks() {
  ensureDir(PATHS.hooksDir);
  const hooksSource = path.join(getPackageRoot(), 'hooks');
  const files = getHookFiles();

  for (const file of files) {
    fs.copyFileSync(path.join(hooksSource, file), path.join(PATHS.hooksDir, file));
    logger.success(file);
  }
  return files;
}

function getHookSettings() {
  const hooksDir = PATHS.hooksDir;
  return {
    hooks: {
      PreToolUse: [{
        matcher: 'Bash',
        hooks: [{ type: 'command', command: `node ${path.join(hooksDir, 'bash-permissions.js')}`, timeout: 5 }],
      }],
      SessionStart: [{
        hooks: [{ type: 'command', command: `node ${path.join(hooksDir, 'session-start.js')}`, statusMessage: 'Loading session context...' }],
      }],
      Stop: [{
        hooks: [
          { type: 'command', command: `node ${path.join(hooksDir, 'session-end.js')}`, async: true },
          { type: 'command', command: `node ${path.join(hooksDir, 'cost-tracker.js')}`, async: true },
        ],
      }],
    },
    statusLine: {
      type: 'command',
      command: `node ${path.join(hooksDir, 'statusline-command.js')}`,
    },
  };
}

function removeHooks() {
  if (!fs.existsSync(PATHS.hooksDir)) return;
  for (const file of getHookFiles()) {
    const target = path.join(PATHS.hooksDir, file);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      logger.success(`Removed ${file}`);
    }
  }
}

module.exports = { installHooks, getHookSettings, removeHooks, getHookFiles };
```

- [ ] **Step 2: Create cli/lib/skills.js**

Recursively copies skill directories.

```js
'use strict';

const fs = require('fs');
const path = require('path');
const { PATHS, ensureDir, getPackageRoot } = require('./platform');
const logger = require('./logger');

function getSkillDirs() {
  const skillsSource = path.join(getPackageRoot(), 'skills');
  return fs.readdirSync(skillsSource).filter(f =>
    fs.statSync(path.join(skillsSource, f)).isDirectory()
  );
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function installSkills() {
  ensureDir(PATHS.skillsDir);
  const skillsSource = path.join(getPackageRoot(), 'skills');
  const dirs = getSkillDirs();

  for (const dir of dirs) {
    copyDirRecursive(path.join(skillsSource, dir), path.join(PATHS.skillsDir, dir));
    logger.success(dir);
  }
  return dirs;
}

function removeSkills() {
  const dirs = getSkillDirs();
  for (const dir of dirs) {
    const target = path.join(PATHS.skillsDir, dir);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
      logger.success(`Removed ${dir}`);
    }
  }
}

// Remove legacy skill paths from previous versions
function removeLegacySkills() {
  const legacyPaths = [
    path.join(PATHS.skillsDir, 'supermind', 'init'),
    path.join(PATHS.skillsDir, 'supermind', 'living-docs'),
    path.join(PATHS.skillsDir, 'sm'),
  ];
  for (const p of legacyPaths) {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      logger.info(`Cleaned up legacy path: ${path.basename(p)}`);
    }
  }
}

module.exports = { installSkills, removeSkills, removeLegacySkills, getSkillDirs };
```

- [ ] **Step 3: Create cli/lib/templates.js**

```js
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
```

- [ ] **Step 4: Commit**

```bash
git add cli/lib/hooks.js cli/lib/skills.js cli/lib/templates.js
git commit -m "Add hooks, skills, and templates lib modules"
```

---

### Task 5: CLI lib module — MCP server setup

**Files:**
- Create: `cli/lib/mcp.js`

- [ ] **Step 1: Create cli/lib/mcp.js**

Interactive MCP setup with Docker/Direct/Skip options. Reads from package's `airis/` directory.

```js
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { PATHS, ensureDir, getPackageRoot } = require('./platform');
const logger = require('./logger');

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

function isDockerAvailable() {
  try {
    execSync('docker compose version', { stdio: 'pipe', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function getDirectMcpConfig() {
  const configPath = path.join(getPackageRoot(), 'airis', 'mcp-config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

async function setupDocker() {
  const airisSource = path.join(getPackageRoot(), 'airis');
  ensureDir(PATHS.airisDir);
  for (const file of ['docker-compose.yml', 'mcp-config.json']) {
    const src = path.join(airisSource, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(PATHS.airisDir, file));
    }
  }
  logger.success('AIRIS config copied');

  if (isDockerAvailable()) {
    logger.info('Starting AIRIS gateway...');
    try {
      execSync('docker compose up -d', { cwd: PATHS.airisDir, stdio: 'pipe', timeout: 60000 });
      logger.success('AIRIS gateway started');
    } catch {
      logger.warn('Could not start AIRIS gateway — start manually with: docker compose up -d');
    }
  } else {
    logger.warn('Docker not found — install Docker and run: docker compose up -d');
  }
}

function setupDirect() {
  const config = getDirectMcpConfig();
  // Return MCP server entries for merging into settings.json mcpServers
  return config.mcpServers || {};
}

async function setupMcp(flags) {
  // Determine mode from flags or prompt
  let mode = flags.mcp;
  if (!mode && !flags.nonInteractive) {
    console.log('\n  MCP Server Setup:');
    console.log('    1) Docker (AIRIS gateway — single endpoint, recommended)');
    console.log('    2) Direct (individual servers via npx/uvx)');
    console.log('    3) Skip\n');
    const answer = await prompt('  Choose [1/2/3]: ');
    mode = { '1': 'docker', '2': 'direct', '3': 'skip' }[answer] || 'skip';
  }
  if (!mode || mode === 'skip') {
    logger.info('Skipping MCP setup');
    return {};
  }

  if (mode === 'docker') {
    await setupDocker();
    return {}; // Docker mode uses AIRIS, not settings.json mcpServers
  }

  if (mode === 'direct') {
    const servers = setupDirect();
    logger.success(`Configured ${Object.keys(servers).length} MCP servers`);
    return { mcpServers: servers };
  }

  return {};
}

module.exports = { setupMcp };
```

- [ ] **Step 2: Commit**

```bash
git add cli/lib/mcp.js
git commit -m "Add MCP server setup lib module"
```

---

### Task 6: CLI commands — install, update

**Files:**
- Create: `cli/commands/install.js`
- Create: `cli/commands/update.js`

- [ ] **Step 1: Create cli/commands/install.js**

```js
'use strict';

const fs = require('fs');
const { PATHS, ensureDir } = require('../lib/platform');
const logger = require('../lib/logger');
const { readSettings, writeSettings, backupSettings, mergeSettings } = require('../lib/settings');
const { installHooks, getHookSettings } = require('../lib/hooks');
const { installSkills, removeLegacySkills } = require('../lib/skills');
const { getPluginDefaults } = require('../lib/plugins');
const { setupMcp } = require('../lib/mcp');
const { installTemplates } = require('../lib/templates');
const { version } = require('../../package.json');

module.exports = async function install(flags) {
  logger.banner();
  const TOTAL = 7;

  // Step 1: Platform setup
  logger.step(1, TOTAL, 'Detecting platform and creating directories...');
  ensureDir(PATHS.claudeHome);
  ensureDir(PATHS.hooksDir);
  ensureDir(PATHS.skillsDir);
  ensureDir(PATHS.sessionsDir);
  logger.success(`Claude home: ${PATHS.claudeHome}`);

  // Clean up legacy files
  if (fs.existsSync(PATHS.legacyHooksJson)) {
    fs.unlinkSync(PATHS.legacyHooksJson);
    logger.info('Removed legacy hooks.json');
  }

  // Step 2: Settings
  logger.step(2, TOTAL, 'Configuring settings...');
  backupSettings();
  const existing = readSettings();
  const hookSettings = getHookSettings();
  const pluginDefaults = getPluginDefaults();
  const defaults = {
    ...hookSettings,
    ...pluginDefaults,
    alwaysThinkingEnabled: true,
    effortLevel: 'high',
  };
  let merged = mergeSettings(existing, defaults);
  writeSettings(merged);
  logger.success('Settings merged');

  // Step 3: Hooks
  logger.step(3, TOTAL, 'Installing hooks...');
  const hookFiles = installHooks();
  logger.info(`${hookFiles.length} hooks installed`);

  // Step 4: Skills
  logger.step(4, TOTAL, 'Installing skills...');
  removeLegacySkills();
  const skillDirs = installSkills();
  logger.info(`${skillDirs.length} skill directories installed`);

  // Step 5: Plugins
  logger.step(5, TOTAL, 'Enabling plugins...');
  logger.success('superpowers, frontend-design, claude-md-management, ui-ux-pro-max');

  // Step 6: MCP servers
  logger.step(6, TOTAL, 'MCP server setup...');
  const mcpConfig = await setupMcp(flags);
  if (mcpConfig.mcpServers) {
    merged = readSettings();
    merged.mcpServers = { ...(merged.mcpServers || {}), ...mcpConfig.mcpServers };
    writeSettings(merged);
  }

  // Step 7: Templates
  logger.step(7, TOTAL, 'Installing templates...');
  installTemplates();

  // Write version marker
  fs.writeFileSync(PATHS.versionFile, version);

  // Summary
  console.log(`\n${'\x1b[32m'}✓ Supermind v${version} installed successfully${'\x1b[0m'}\n`);
  console.log('  Next steps:');
  console.log('    1. Restart Claude Code to activate plugins');
  console.log('    2. In any project, run /supermind-init to set up project docs');
  console.log('    3. Run: npx supermind-claude doctor  to verify installation\n');
};
```

- [ ] **Step 2: Create cli/commands/update.js**

```js
'use strict';

const fs = require('fs');
const { PATHS } = require('../lib/platform');
const logger = require('../lib/logger');
const { readSettings, writeSettings, mergeSettings } = require('../lib/settings');
const { installHooks, getHookSettings } = require('../lib/hooks');
const { installSkills, removeLegacySkills } = require('../lib/skills');
const { installTemplates } = require('../lib/templates');
const { version } = require('../../package.json');

module.exports = function update(flags) {
  logger.banner();

  // Version comparison
  let installedVersion = 'unknown';
  try { installedVersion = fs.readFileSync(PATHS.versionFile, 'utf-8').trim(); } catch {}

  if (installedVersion === version) {
    logger.info(`Already at v${version}, refreshing files...`);
  } else {
    logger.info(`Updating from v${installedVersion} to v${version}...`);
  }

  const TOTAL = 4;

  // Step 1: Hooks
  logger.step(1, TOTAL, 'Updating hooks...');
  installHooks();

  // Step 2: Hook settings (re-merge to pick up any new hooks)
  logger.step(2, TOTAL, 'Updating settings...');
  const existing = readSettings();
  const hookSettings = getHookSettings();
  const merged = mergeSettings(existing, hookSettings);
  writeSettings(merged);
  logger.success('Hook settings refreshed');

  // Step 3: Skills
  logger.step(3, TOTAL, 'Updating skills...');
  removeLegacySkills();
  installSkills();

  // Step 4: Templates
  logger.step(4, TOTAL, 'Updating templates...');
  installTemplates();

  // Write version marker
  fs.writeFileSync(PATHS.versionFile, version);

  console.log(`\n${'\x1b[32m'}✓ Supermind updated to v${version}${'\x1b[0m'}\n`);
};
```

- [ ] **Step 3: Test install command runs (dry check — won't actually install, just verifies no crashes)**

Run: `node -e "const install = require('./cli/commands/install'); console.log(typeof install)"`
Expected: `function`

- [ ] **Step 4: Commit**

```bash
git add cli/commands/install.js cli/commands/update.js
git commit -m "Add install and update CLI commands"
```

---

### Task 7: CLI commands — doctor, uninstall

**Files:**
- Create: `cli/commands/doctor.js`
- Create: `cli/commands/uninstall.js`

- [ ] **Step 1: Create cli/commands/doctor.js**

```js
'use strict';

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/platform');
const logger = require('../lib/logger');
const { readSettings, SUPERMIND_HOOKS, SUPERMIND_PLUGINS } = require('../lib/settings');
const { getHookFiles } = require('../lib/hooks');
const { getSkillDirs } = require('../lib/skills');
const { version } = require('../../package.json');

function check(label, pass, detail) {
  if (pass) {
    logger.success(label);
  } else {
    logger.error(`${label}${detail ? ' — ' + detail : ''}`);
  }
  return pass;
}

module.exports = function doctor(flags) {
  logger.banner();
  console.log('  Running health checks...\n');

  let passed = 0;
  let failed = 0;

  function run(label, pass, detail) {
    if (check(label, pass, detail)) passed++;
    else failed++;
  }

  // Node.js version
  const nodeVersion = parseInt(process.versions.node.split('.')[0], 10);
  run('Node.js >= 18', nodeVersion >= 18, `found v${process.versions.node}`);

  // Claude home
  run('~/.claude/ exists', fs.existsSync(PATHS.claudeHome));

  // Settings
  const settingsExists = fs.existsSync(PATHS.settings);
  run('settings.json exists', settingsExists);

  let settings = {};
  if (settingsExists) {
    try {
      settings = JSON.parse(fs.readFileSync(PATHS.settings, 'utf-8'));
      run('settings.json is valid JSON', true);
    } catch {
      run('settings.json is valid JSON', false, 'parse error');
    }
  }

  // Hooks present
  const expectedHooks = getHookFiles();
  for (const file of expectedHooks) {
    run(`Hook: ${file}`, fs.existsSync(path.join(PATHS.hooksDir, file)));
  }

  // Skills present
  const expectedSkills = getSkillDirs();
  for (const dir of expectedSkills) {
    const skillPath = path.join(PATHS.skillsDir, dir);
    run(`Skill: ${dir}`, fs.existsSync(skillPath) && fs.existsSync(path.join(skillPath, 'SKILL.md')));
  }

  // Plugins
  for (const id of SUPERMIND_PLUGINS) {
    run(`Plugin: ${id.split('@')[0]}`, settings.enabledPlugins?.[id] === true);
  }

  // Template
  run('CLAUDE.md template', fs.existsSync(path.join(PATHS.templatesDir, 'CLAUDE.md')));

  // Sessions directory
  run('Sessions directory writable', (() => {
    try {
      const testFile = path.join(PATHS.sessionsDir, '.doctor-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return true;
    } catch { return false; }
  })());

  // Version
  let installedVersion = 'not found';
  try { installedVersion = fs.readFileSync(PATHS.versionFile, 'utf-8').trim(); } catch {}
  run('Version marker', installedVersion === version, installedVersion !== version ? `installed: ${installedVersion}, package: ${version}` : undefined);

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
};
```

- [ ] **Step 2: Create cli/commands/uninstall.js**

```js
'use strict';

const fs = require('fs');
const readline = require('readline');
const { PATHS } = require('../lib/platform');
const logger = require('../lib/logger');
const { readSettings, writeSettings, removeSupermindEntries } = require('../lib/settings');
const { removeHooks } = require('../lib/hooks');
const { removeSkills } = require('../lib/skills');
const { removeTemplates } = require('../lib/templates');

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

module.exports = async function uninstall(flags) {
  logger.banner();

  if (!flags.yes && !flags.nonInteractive) {
    const answer = await prompt('  Remove all Supermind components? [y/N]: ');
    if (answer.toLowerCase() !== 'y') {
      console.log('  Cancelled.\n');
      return;
    }
  }

  console.log('');

  // Remove hooks
  console.log('  Removing hooks...');
  removeHooks();

  // Remove skills
  console.log('  Removing skills...');
  removeSkills();

  // Remove templates
  console.log('  Removing templates...');
  removeTemplates();

  // Clean settings
  console.log('  Cleaning settings...');
  const settings = readSettings();
  const cleaned = removeSupermindEntries(settings);
  writeSettings(cleaned);
  logger.success('Settings cleaned');

  // Remove version marker
  if (fs.existsSync(PATHS.versionFile)) {
    fs.unlinkSync(PATHS.versionFile);
  }

  // Remove legacy hooks.json
  if (fs.existsSync(PATHS.legacyHooksJson)) {
    fs.unlinkSync(PATHS.legacyHooksJson);
    logger.info('Removed legacy hooks.json');
  }

  // Optional: AIRIS config
  if (fs.existsSync(PATHS.airisDir)) {
    if (flags.yes || flags.nonInteractive) {
      fs.rmSync(PATHS.airisDir, { recursive: true, force: true });
      logger.success('Removed AIRIS config');
    } else {
      const answer = await prompt('  Also remove AIRIS/Docker config? [y/N]: ');
      if (answer.toLowerCase() === 'y') {
        fs.rmSync(PATHS.airisDir, { recursive: true, force: true });
        logger.success('Removed AIRIS config');
      }
    }
  }

  console.log(`\n${'\x1b[32m'}✓ Supermind uninstalled${'\x1b[0m'}\n`);
};
```

- [ ] **Step 3: Commit**

```bash
git add cli/commands/doctor.js cli/commands/uninstall.js
git commit -m "Add doctor and uninstall CLI commands"
```

---

### Task 8: Rewrite hooks — bash-permissions.js

**Files:**
- Rewrite: `hooks/bash-permissions.js`

- [ ] **Step 1: Rewrite hooks/bash-permissions.js**

Same logic as current, but cleaned up: constants at top, clear sections, under 150 lines. The current file is 357 lines and works well — the rewrite preserves all behavior while being more concise.

Key simplifications:
- Combine `SAFE_READ_COMMANDS` and `SAFE_PREFIXES` into a single lookup
- Inline `isSedSafe` check
- Keep the compound command parser but simplify the pipe-splitting
- Keep `detectWorktreeContext` and `classifySegment` logic intact

The current `hooks/bash-permissions.js` is well-tested and working. Rewrite it maintaining the same exact classification behavior but with:
- Constants grouped at top (SAFE_CMDS, SAFE_PREFIXES, GIT_SAFE_READ, GIT_SAFE_WRITE, GIT_WORKTREE_ONLY, GIT_DANGEROUS, DANGEROUS_PATTERNS, SAFE_WRITE_CMDS, GH_DANGEROUS)
- Single `classifySegment(cmd, opts)` function
- Single `splitCompound(command)` function for `&&`/`||`/`;` splitting with quote awareness
- Single `splitPipes(segment)` function
- Main function reads stdin JSON, classifies, outputs JSON

- [ ] **Step 2: Verify the rewritten hook produces same output for key test cases**

Run: `echo '{"tool_input":{"command":"ls -la"}}' | node hooks/bash-permissions.js`
Expected: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow",...}}`

Run: `echo '{"tool_input":{"command":"rm -rf /"}}' | node hooks/bash-permissions.js`
Expected: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask",...}}`

Run: `echo '{"tool_input":{"command":"git add . && git commit -m test"}}' | node hooks/bash-permissions.js`
Expected: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow",...}}`

- [ ] **Step 3: Commit**

```bash
git add hooks/bash-permissions.js
git commit -m "Rewrite bash-permissions hook: same logic, cleaner structure"
```

---

### Task 9: Rewrite hooks — session-start.js (with living docs)

**Files:**
- Rewrite: `hooks/session-start.js`

- [ ] **Step 1: Rewrite hooks/session-start.js**

Merged responsibility: load previous session context + extract ARCHITECTURE.md/DESIGN.md summaries.

Key behaviors:
1. Resolve project dir via `process.env.PROJECT_DIR || process.cwd()`
2. Load most recent session file from `~/.claude/sessions/` (max 7 days old, matching project)
3. Read `ARCHITECTURE.md` if exists — extract: Overview first paragraph, Tech Stack table, section headings as TOC. Cap at ~200 tokens (~800 chars).
4. Read `DESIGN.md` if exists — extract: Overview section, section headings. Cap at ~100 tokens (~400 chars).
5. If ARCHITECTURE.md missing, output note to run `/supermind-init`
6. Output combined context

Markdown extraction logic:
- Split on `## ` headings
- "Overview" section: take first paragraph (up to first blank line)
- "Tech Stack" section: take the full table (lines starting with `|`)
- All other sections: just the heading name
- Char-count truncation with priority (overview > tech stack > headings)

- [ ] **Step 2: Test the hook with a project that has ARCHITECTURE.md**

Create a test ARCHITECTURE.md, run the hook, verify output includes the summary.

- [ ] **Step 3: Commit**

```bash
git add hooks/session-start.js
git commit -m "Rewrite session-start hook: add living docs extraction"
```

---

### Task 10: Rewrite hooks — session-end.js, cost-tracker.js

**Files:**
- Rewrite: `hooks/session-end.js`
- Rewrite: `hooks/cost-tracker.js`

- [ ] **Step 1: Rewrite hooks/session-end.js**

Clean rewrite of existing logic. Same behavior, cleaner code:
- Save timestamp, project dir, git branch, modified files
- Read `SESSION_SUMMARY` from env (graceful fallback)
- Write to `~/.claude/sessions/session-{timestamp}.json`
- Clean old sessions (keep max 20)

- [ ] **Step 2: Rewrite hooks/cost-tracker.js**

Add `CLAUDE_SESSION_COST_USD` capture:
- Read `SESSION_ID`, `PROJECT_DIR`, `CLAUDE_SESSION_COST_USD` from env
- Append JSON line to `~/.claude/cost-log.jsonl`
- Silent fail

- [ ] **Step 3: Commit**

```bash
git add hooks/session-end.js hooks/cost-tracker.js
git commit -m "Rewrite session-end and cost-tracker hooks"
```

---

### Task 11: Rewrite hook — statusline-command.js

**Files:**
- Rewrite: `hooks/statusline-command.js`

- [ ] **Step 1: Rewrite hooks/statusline-command.js**

Same two-line display, cleaned up. The current file is 207 lines and works well. Rewrite with:
- Data collection section: user, host, cwd, model, git branch, thinking level, supabase ref, active agents, context window, cost
- Rendering section: ANSI color palette, progress bar, separator helpers
- Output section: compose and print line1 + line2

Keep all existing functionality. Target under 150 lines by removing redundant comments and tightening the subagent detection logic.

- [ ] **Step 2: Verify the hook outputs colored status**

Run: `echo '{}' | node hooks/statusline-command.js`
Expected: Colored output with user@host line

- [ ] **Step 3: Commit**

```bash
git add hooks/statusline-command.js
git commit -m "Rewrite statusline hook: same display, cleaner code"
```

---

### Task 12: Write skills — supermind namespace parent

**Files:**
- Rewrite: `skills/supermind/SKILL.md`

- [ ] **Step 1: Write skills/supermind/SKILL.md**

```markdown
---
name: supermind
description: "Supermind — project initialization, living documentation, and configuration skills"
---

# Supermind

Parent namespace for Supermind skills.

## Available Commands

- `/supermind-init` — Initialize a project: CLAUDE.md setup, ARCHITECTURE.md/DESIGN.md generation, health checks, and optional skill/MCP discovery
- `/supermind-living-docs` — Manually sync ARCHITECTURE.md and DESIGN.md with the current codebase
```

- [ ] **Step 2: Commit**

```bash
git add skills/supermind/SKILL.md
git commit -m "Rewrite supermind namespace parent skill"
```

---

### Task 13: Write skills — supermind-init

**Files:**
- Rewrite: `skills/supermind-init/SKILL.md`
- Keep: `skills/supermind-init/architecture-template.md` (clean up)
- Keep: `skills/supermind-init/design-template.md` (clean up)

- [ ] **Step 1: Write skills/supermind-init/SKILL.md**

Follow skill-creator patterns: pushy description, imperative instructions, explain reasoning not just rules, under 500 lines. Three clear phases.

The SKILL.md should contain the full instructions for Claude when this skill triggers. Reference the template files as bundled resources. Include the phase structure from the spec (Phase 1: CLAUDE.md, Phase 2: Living Docs, Phase 3: Health & Discovery).

Key improvements over current:
- Clearer section ownership rules for CLAUDE.md merge
- Better auto-detection instructions
- Phase 3 is new (health check + optional skill/MCP research subagent)
- Explain WHY each step matters (skill-creator guidance)

- [ ] **Step 2: Verify SKILL.md has valid frontmatter**

Run: `node -e "const fs = require('fs'); const c = fs.readFileSync('skills/supermind-init/SKILL.md','utf8'); console.log(c.startsWith('---'))"`
Expected: `true`

- [ ] **Step 3: Clean up architecture-template.md and design-template.md**

Review the existing templates. They're already in good shape — just verify they match the spec's section lists and clean up any inconsistencies.

- [ ] **Step 4: Commit**

```bash
git add skills/supermind-init/
git commit -m "Rewrite supermind-init skill with three-phase onboarding"
```

---

### Task 14: Write skills — supermind-living-docs

**Files:**
- Rewrite: `skills/supermind-living-docs/SKILL.md`

- [ ] **Step 1: Write skills/supermind-living-docs/SKILL.md**

This is the manual "sync now" command. The auto-read behavior is handled by the session-start hook.

Follow skill-creator patterns. Key content:
- When invoked, read ARCHITECTURE.md and DESIGN.md (if exists)
- Analyze recent changes via git diff
- Reason about what needs updating — don't update if nothing meaningful changed
- Make surgical edits (Edit tool, not full rewrites)
- Commit if changes were made
- Explain reasoning behind update rules

Remove the "On Every Conversation Start" workflow (now handled by session-start.js hook) and the Serena integration section (over-scoped).

- [ ] **Step 2: Commit**

```bash
git add skills/supermind-living-docs/SKILL.md
git commit -m "Rewrite supermind-living-docs skill as manual sync command"
```

---

### Task 15: Rewrite templates/CLAUDE.md

**Files:**
- Rewrite: `templates/CLAUDE.md`

- [ ] **Step 1: Rewrite templates/CLAUDE.md**

Simplified starter template per spec Section 8.1:
- Quick Reference (ARCHITECTURE.md, DESIGN.md links)
- Commands (placeholder)
- Tech Stack (placeholder)
- Project Structure (placeholder)
- Shell & Git Permissions (complete, references bash-permissions.js)
- Worktree Development Workflow (complete)
- MCP Servers (complete)
- UI Changes (references /ui-ux-pro-max)
- Living Documentation (explains hook auto-read + /supermind-living-docs manual sync)

Fix: change `/supermind:init` references to `/supermind-init` throughout.

- [ ] **Step 2: Commit**

```bash
git add templates/CLAUDE.md
git commit -m "Rewrite CLAUDE.md template with Supermind branding"
```

---

### Task 16: Rewrite repo documentation — CLAUDE.md, README.md, CHANGELOG.md

**Files:**
- Rewrite: `CLAUDE.md`
- Rewrite: `README.md`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Rewrite CLAUDE.md (for the Supermind repo itself)**

Per spec Section 9.4:
- Project overview (what Supermind is, npm package structure)
- File organization guide (cli/ for installer, hooks/ for runtime hooks, skills/ for SKILL.md files, templates/ for project templates)
- Development rules (worktree workflow, versioning, changelog updates)
- Release checklist (version bump in package.json, update CHANGELOG.md, test with `node cli/index.js doctor`, commit, publish)
- Keep existing Git Permissions, Worktree Workflow, MCP Servers, Living Documentation sections

- [ ] **Step 2: Rewrite README.md**

Per spec Section 13 structure. Focus on quick install UX.

- [ ] **Step 3: Create CHANGELOG.md**

```markdown
# Changelog

## [2.0.0] - 2026-03-18
### Changed
- Complete rebuild as npm package (`npx supermind-claude`)
- Replaced shell scripts (setup.sh, update.sh) with Node.js CLI
- Rewrote all hooks for consistency and clarity
- Rewrote all skills following skill-creator patterns
- Session-start hook now auto-reads ARCHITECTURE.md and DESIGN.md
- Standardized skill naming to hyphens (supermind-init, supermind-living-docs)

### Added
- `npx supermind-claude install` — full global setup
- `npx supermind-claude update` — lightweight refresh
- `npx supermind-claude doctor` — health check
- `npx supermind-claude uninstall` — clean removal
- `--non-interactive` and `--mcp` flags for scripted use
- Phase 3 in /supermind-init: health check + skill/MCP discovery
- Version tracking via ~/.claude/.supermind-version
- Cost tracker now captures CLAUDE_SESSION_COST_USD

### Removed
- setup.sh, update.sh (replaced by CLI)
- settings.json shipped as static file (now constructed programmatically)
- VERSION file (version lives in package.json)
- SETUP.md (merged into README.md)
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md README.md CHANGELOG.md
git commit -m "Rewrite repo docs: CLAUDE.md, README.md, CHANGELOG.md"
```

---

### Task 17: Clean up — delete old files, update .gitignore

**Files:**
- Delete: `setup.sh`, `update.sh`, `hooks.json`, `VERSION`, `RESEARCH-PROMPT.md`, `OPTIMAL-SETUP-REPORT.md`, `SETUP.md`, `settings.json`
- Delete: `research/` directory
- Modify: `.gitignore`

- [ ] **Step 1: Delete obsolete files**

```bash
git rm setup.sh update.sh hooks.json VERSION SETUP.md settings.json
git rm RESEARCH-PROMPT.md OPTIMAL-SETUP-REPORT.md
git rm -r research/
```

Note: Some of these may already be tracked, some may not. Use `git rm` for tracked files and regular `rm` for untracked.

- [ ] **Step 2: Update .gitignore**

Ensure it includes:
```
.env
.env.*
!.env.example
node_modules/
sessions/
.serena/
*.log
.worktrees/
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Remove obsolete files from pre-2.0 setup"
```

---

### Task 18: End-to-end verification

**Files:** None (testing only)

- [ ] **Step 1: Verify CLI commands work**

Run: `node cli/index.js --version`
Expected: `2.0.0`

Run: `node cli/index.js --help`
Expected: Help text

- [ ] **Step 2: Verify all hook files have shebangs and load**

Run: `node -e "const files = require('fs').readdirSync('hooks'); files.forEach(f => { const c = require('fs').readFileSync('hooks/'+f,'utf8'); console.log(f, c.startsWith('#!/usr/bin/env node') ? 'OK' : 'MISSING SHEBANG'); })"`
Expected: All files show OK

- [ ] **Step 3: Verify all SKILL.md files have valid frontmatter**

Run: `node -e "const fs = require('fs'); const glob = require('path'); ['supermind','supermind-init','supermind-living-docs'].forEach(d => { const c = fs.readFileSync('skills/'+d+'/SKILL.md','utf8'); const m = c.match(/^---\nname: (.+)\n/); console.log(d, m ? m[1] : 'NO MATCH'); })"`
Expected: Each shows correct name

- [ ] **Step 4: Verify package.json bin entry works**

Run: `node cli/index.js doctor`
Expected: Runs doctor checks (will show failures since not installed to ~/.claude, but should not crash)

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "Fix issues found during end-to-end verification"
```

---

### Task 19: Final commit — version bump and changelog

**Files:**
- Verify: `package.json` version is `2.0.0`
- Verify: `CHANGELOG.md` is up to date

- [ ] **Step 1: Review all changes**

Run: `git log --oneline` to verify clean commit history.
Run: `git diff HEAD~20 --stat` to see full scope of changes.

- [ ] **Step 2: Verify package is publishable**

Run: `npm pack --dry-run`
Expected: Lists all files that would be included in the package. Verify cli/, hooks/, skills/, templates/, airis/, .env.example are included.

- [ ] **Step 3: Tag the release**

```bash
git tag v2.0.0
```
