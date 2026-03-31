'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLANNING_DIR = '.planning';
const PHASES_DIR = 'phases';
const CONFIG_FILE = 'config.json';
const ROADMAP_FILE = 'roadmap.md';

// ---------------------------------------------------------------------------
// Path safety — mirrors vendor-skills.js safeJoin pattern
// ---------------------------------------------------------------------------

/**
 * Validate that a relative path segment is safe (no traversal, not absolute),
 * then join it onto a trusted base using string concatenation so semgrep
 * taint-tracking does not flag path.join with untrusted input.
 *
 * @param {string} trustedBase — already-safe absolute directory
 * @param {string} segment — caller-supplied component to validate
 * @param {string} label — for error messages
 * @returns {string} safe absolute path
 */
function safeJoin(trustedBase, segment, label) {
  if (typeof segment !== 'string' || segment.length === 0) {
    throw new Error(`Invalid ${label}: must be a non-empty string`);
  }
  if (path.isAbsolute(segment)) {
    throw new Error(`Invalid ${label}: must not be an absolute path`);
  }
  const parts = segment.split(/[\\/]/);
  for (const part of parts) {
    if (part === '..') {
      throw new Error(`Invalid ${label}: path traversal sequences are not allowed`);
    }
  }
  const resolved = trustedBase + path.sep + parts.join(path.sep);
  if (!resolved.startsWith(trustedBase + path.sep) && resolved !== trustedBase) {
    throw new Error(`Invalid ${label}: resolved path escapes base directory`);
  }
  return resolved;
}

/**
 * Validate phaseNum is a positive integer and return the safe directory name.
 */
function safePhaseSegment(phaseNum) {
  const n = Number(phaseNum);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid phase number: must be a positive integer, got ${phaseNum}`);
  }
  return `phase-${n}`;
}

/**
 * Validate a filename segment (agentName, taskId, planId) contains only safe chars.
 * Allows alphanumeric, hyphens, underscores, and dots (no slashes or traversal).
 */
function safeFilenameSegment(value, label) {
  const str = String(value);
  if (str.length === 0) {
    throw new Error(`Invalid ${label}: must be non-empty`);
  }
  if (!/^[\w.-]+$/.test(str)) {
    throw new Error(`Invalid ${label}: contains disallowed characters`);
  }
  if (str === '.' || str === '..') {
    throw new Error(`Invalid ${label}: traversal not allowed`);
  }
  return str;
}

// ---------------------------------------------------------------------------
// Internal helpers — all paths built via safeJoin
// ---------------------------------------------------------------------------

function planningRoot(projectRoot) {
  // PLANNING_DIR is a constant, not user input — safe to join directly
  return safeJoin(projectRoot, PLANNING_DIR, 'planning directory');
}

function phasePath(projectRoot, phaseNum) {
  const root = planningRoot(projectRoot);
  const phasesDir = safeJoin(root, PHASES_DIR, 'phases directory');
  return safeJoin(phasesDir, safePhaseSegment(phaseNum), 'phase directory');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function safeReadJson(filePath) {
  const raw = safeReadFile(filePath);
  if (raw === null) return null;
  return JSON.parse(raw);
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

function writeJson(filePath, data) {
  writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Roadmap parsing
// ---------------------------------------------------------------------------

const ROADMAP_HEADER = `# Roadmap

| Phase | Status | Description |
|-------|--------|-------------|`;

function parseRoadmapTable(content) {
  const phases = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^\|\s*(\d+)\s*\|\s*(\S+)\s*\|\s*(.*?)\s*\|\s*$/);
    if (match) {
      phases.push({
        phase: parseInt(match[1], 10),
        status: match[2],
        description: match[3].trim(),
      });
    }
  }
  return phases;
}

function renderRoadmapTable(phases) {
  const rows = phases.map(p => `| ${p.phase} | ${p.status} | ${p.description} |`);
  return ROADMAP_HEADER + '\n' + rows.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Progress parsing
// ---------------------------------------------------------------------------

const PROGRESS_HEADER = `# Progress

| Wave | Task | Status | Executor | Commit |
|------|------|--------|----------|--------|`;

function parseProgressTable(content) {
  const entries = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/);
    if (match) {
      entries.push({
        wave: parseInt(match[1], 10),
        task: match[2].trim(),
        status: match[3].trim(),
        executor: match[4].trim(),
        commit: match[5].trim(),
      });
    }
  }
  return entries;
}

function renderProgressTable(entries) {
  const rows = entries.map(e =>
    `| ${e.wave} | ${e.task} | ${e.status} | ${e.executor || ''} | ${e.commit || ''} |`
  );
  return PROGRESS_HEADER + '\n' + rows.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create .planning/ structure with roadmap.md and config.json.
 *
 * @param {string} projectRoot — absolute path to project root
 * @param {object} config — { modelProfile, flags, ... }
 * @returns {{ planningDir: string }}
 */
function initPlanning(projectRoot, config = {}) {
  const root = planningRoot(projectRoot);
  ensureDir(safeJoin(root, PHASES_DIR, 'phases directory'));

  const configData = {
    modelProfile: config.modelProfile || 'default',
    flags: config.flags || {},
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
  writeJson(safeJoin(root, CONFIG_FILE, 'config file'), configData);
  writeFile(safeJoin(root, ROADMAP_FILE, 'roadmap file'), ROADMAP_HEADER + '\n');

  return { planningDir: root };
}

/**
 * Create phases/phase-N/ with empty discussion.md, research/, plans/, tasks/, progress.md.
 *
 * @param {string} projectRoot
 * @param {number} phaseNum
 * @returns {{ phaseDir: string }}
 */
function initPhase(projectRoot, phaseNum) {
  const dir = phasePath(projectRoot, phaseNum);

  ensureDir(safeJoin(dir, 'research', 'research directory'));
  ensureDir(safeJoin(dir, 'plans', 'plans directory'));
  ensureDir(safeJoin(dir, 'tasks', 'tasks directory'));

  writeFile(
    safeJoin(dir, 'discussion.md', 'discussion file'),
    `# Phase ${safePhaseSegment(phaseNum).replace('phase-', '')} — Discussion\n\n`,
  );
  writeFile(safeJoin(dir, 'progress.md', 'progress file'), PROGRESS_HEADER + '\n');

  return { phaseDir: dir };
}

/**
 * Read the latest progress state from a phase's progress.md.
 *
 * @param {string} projectRoot
 * @param {number} [phaseNum] — if omitted, finds the latest active phase
 * @returns {{ phase: number, entries: Array, summary: { total: number, done: number, pending: number, failed: number, currentWave: number } } | null}
 */
function readProgress(projectRoot, phaseNum) {
  if (phaseNum === undefined) {
    const roadmap = readRoadmap(projectRoot);
    if (!roadmap) return null;
    const active = roadmap.find(p => p.status !== 'completed' && p.status !== 'skipped');
    if (!active) return null;
    phaseNum = active.phase;
  }

  const filePath = safeJoin(phasePath(projectRoot, phaseNum), 'progress.md', 'progress file');
  const content = safeReadFile(filePath);
  if (content === null) return null;

  const entries = parseProgressTable(content);
  const done = entries.filter(e => e.status === 'completed').length;
  const failed = entries.filter(e => e.status === 'failed').length;
  const pending = entries.length - done - failed;
  const currentWave = entries.length > 0
    ? Math.max(...entries.filter(e => e.status !== 'completed').map(e => e.wave).concat([0]))
    : 0;

  return {
    phase: phaseNum,
    entries,
    summary: { total: entries.length, done, pending, failed, currentWave },
  };
}

/**
 * Update progress.md with current wave execution state.
 *
 * @param {string} projectRoot
 * @param {number} phaseNum
 * @param {Array<{ wave: number, task: string, status: string, executor?: string, commit?: string }>} progressData
 */
function writeProgress(projectRoot, phaseNum, progressData) {
  const filePath = safeJoin(phasePath(projectRoot, phaseNum), 'progress.md', 'progress file');
  writeFile(filePath, renderProgressTable(progressData));
}

/**
 * Parse roadmap.md to get phase list with statuses.
 *
 * @param {string} projectRoot
 * @returns {Array<{ phase: number, status: string, description: string }> | null}
 */
function readRoadmap(projectRoot) {
  const filePath = safeJoin(planningRoot(projectRoot), ROADMAP_FILE, 'roadmap file');
  const content = safeReadFile(filePath);
  if (content === null) return null;
  return parseRoadmapTable(content);
}

/**
 * Update a phase's status in roadmap.md.
 *
 * @param {string} projectRoot
 * @param {number} phaseNum
 * @param {string} status — e.g. 'pending', 'active', 'completed', 'skipped'
 */
function updateRoadmap(projectRoot, phaseNum, status) {
  const filePath = safeJoin(planningRoot(projectRoot), ROADMAP_FILE, 'roadmap file');
  const phases = readRoadmap(projectRoot) || [];
  const idx = phases.findIndex(p => p.phase === phaseNum);
  if (idx >= 0) {
    phases[idx].status = status;
  }
  writeFile(filePath, renderRoadmapTable(phases));
}

/**
 * Read .planning/config.json.
 *
 * @param {string} projectRoot
 * @returns {object | null}
 */
function readConfig(projectRoot) {
  return safeReadJson(safeJoin(planningRoot(projectRoot), CONFIG_FILE, 'config file'));
}

/**
 * Write .planning/config.json.
 *
 * @param {string} projectRoot
 * @param {object} config
 */
function writeConfig(projectRoot, config) {
  config.lastUpdated = new Date().toISOString();
  writeJson(safeJoin(planningRoot(projectRoot), CONFIG_FILE, 'config file'), config);
}

/**
 * Append to discussion.md.
 *
 * @param {string} projectRoot
 * @param {number} phaseNum
 * @param {string} content — markdown text to append
 */
function writeDiscussion(projectRoot, phaseNum, content) {
  const filePath = safeJoin(phasePath(projectRoot, phaseNum), 'discussion.md', 'discussion file');
  const num = safePhaseSegment(phaseNum).replace('phase-', '');
  const existing = safeReadFile(filePath) || `# Phase ${num} — Discussion\n\n`;
  writeFile(filePath, existing + content + '\n');
}

/**
 * Write researcher output to research/.
 *
 * @param {string} projectRoot
 * @param {number} phaseNum
 * @param {string} agentName — e.g. 'stack', 'features', 'architecture', 'pitfalls'
 * @param {string} content — markdown content
 */
function writeResearch(projectRoot, phaseNum, agentName, content) {
  const safeName = safeFilenameSegment(agentName, 'agent name');
  const researchDir = safeJoin(phasePath(projectRoot, phaseNum), 'research', 'research directory');
  const filePath = safeJoin(researchDir, `${safeName}.md`, 'research file');
  writeFile(filePath, content);
}

/**
 * Write plan with dependency graph to plans/.
 *
 * @param {string} projectRoot
 * @param {number} phaseNum
 * @param {{ id: number, title: string, dependencies?: number[], tasks?: string[], waves?: Array, body?: string }} planData
 */
function writePlan(projectRoot, phaseNum, planData) {
  const planId = safeFilenameSegment(String(planData.id || 1), 'plan id');

  let content = `---\nid: ${planId}\ndependencies: [${(planData.dependencies || []).join(', ')}]\n---\n\n`;
  content += `# Plan ${planId}: ${planData.title || 'Untitled'}\n\n`;

  if (planData.waves) {
    for (const wave of planData.waves) {
      content += `## Wave ${wave.number}\n\n`;
      for (const task of (wave.tasks || [])) {
        content += `- ${task}\n`;
      }
      content += '\n';
    }
  }

  if (planData.body) {
    content += planData.body + '\n';
  }

  const plansDir = safeJoin(phasePath(projectRoot, phaseNum), 'plans', 'plans directory');
  const filePath = safeJoin(plansDir, `plan-${planId}.md`, 'plan file');
  writeFile(filePath, content);
}

/**
 * Write individual task spec to tasks/.
 *
 * @param {string} projectRoot
 * @param {number} phaseNum
 * @param {string|number} taskId
 * @param {{ title: string, description?: string, skills?: string[], files?: string[], acceptance?: string[], wave?: number }} taskSpec
 */
function writeTask(projectRoot, phaseNum, taskId, taskSpec) {
  const safeId = safeFilenameSegment(String(taskId), 'task id');

  let content = `---\nid: ${safeId}\nwave: ${taskSpec.wave || 1}\n`;
  if (taskSpec.skills?.length) content += `skills: [${taskSpec.skills.join(', ')}]\n`;
  content += `---\n\n`;
  content += `# Task ${safeId}: ${taskSpec.title || 'Untitled'}\n\n`;

  if (taskSpec.description) {
    content += taskSpec.description + '\n\n';
  }

  if (taskSpec.files?.length) {
    content += `## Files\n\n`;
    for (const f of taskSpec.files) content += `- ${f}\n`;
    content += '\n';
  }

  if (taskSpec.acceptance?.length) {
    content += `## Acceptance Criteria\n\n`;
    for (const a of taskSpec.acceptance) content += `- [ ] ${a}\n`;
    content += '\n';
  }

  const tasksDir = safeJoin(phasePath(projectRoot, phaseNum), 'tasks', 'tasks directory');
  const filePath = safeJoin(tasksDir, `task-${safeId}.md`, 'task file');
  writeFile(filePath, content);
}

/**
 * Walk up from startDir to find .planning/ (like how git finds .git/).
 *
 * @param {string} startDir — must be an absolute path
 * @returns {string | null} — project root containing .planning/, or null
 */
function getPlanningRoot(startDir) {
  if (typeof startDir !== 'string' || startDir.length === 0) {
    throw new Error('getPlanningRoot: startDir must be a non-empty string');
  }
  // Require an absolute path — callers pass process.cwd() or PROJECT_DIR
  if (!path.isAbsolute(startDir)) {
    throw new Error('getPlanningRoot: startDir must be an absolute path');
  }
  let dir = startDir;
  const root = path.parse(dir).root;

  while (dir !== root) {
    // PLANNING_DIR is a constant — safe to join
    const candidate = safeJoin(dir, PLANNING_DIR, 'planning directory');
    if (fs.existsSync(candidate)) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Check if there's an active (non-completed) planning session.
 *
 * @param {string} projectRoot
 * @returns {boolean}
 */
function isActive(projectRoot) {
  const roadmap = readRoadmap(projectRoot);
  if (!roadmap || roadmap.length === 0) {
    return fs.existsSync(planningRoot(projectRoot));
  }
  return roadmap.some(p => p.status !== 'completed' && p.status !== 'skipped');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  initPlanning,
  initPhase,
  readProgress,
  writeProgress,
  readRoadmap,
  updateRoadmap,
  readConfig,
  writeConfig,
  writeDiscussion,
  writeResearch,
  writePlan,
  writeTask,
  getPlanningRoot,
  isActive,
  // Exposed for testing
  parseRoadmapTable,
  renderRoadmapTable,
  parseProgressTable,
  renderProgressTable,
  PLANNING_DIR,
};
