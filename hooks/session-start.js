#!/usr/bin/env node
// Session Start Hook - Loads previous session summary into context
// Based on ECC minimal session persistence pattern
// Fires on: SessionStart

const fs = require("fs");
const path = require("path");
const os = require("os");

const SESSION_DIR = path.join(os.homedir(), ".claude", "sessions");
const MAX_AGE_DAYS = 7;

function getLatestSession(projectDir) {
  if (!fs.existsSync(SESSION_DIR)) return null;

  const files = fs.readdirSync(SESSION_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      const filepath = path.join(SESSION_DIR, f);
      const stat = fs.statSync(filepath);
      return { filepath, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);

  // Find the most recent session for this project (or any session)
  for (const file of files) {
    const ageDays = (Date.now() - file.mtime) / (1000 * 60 * 60 * 24);
    if (ageDays > MAX_AGE_DAYS) continue;

    try {
      const data = JSON.parse(fs.readFileSync(file.filepath, "utf-8"));
      if (!projectDir || data.project === projectDir) {
        return data;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function checkProjectHealth(cwd) {
  const missing = [];
  if (!fs.existsSync(path.join(cwd, "CLAUDE.md"))) {
    missing.push("CLAUDE.md");
  }
  if (missing.length > 0) {
    console.log(`[Setup] Missing: ${missing.join(", ")} — consider creating one for this project.`);
  }
}

function main() {
  const cwd = process.env.PROJECT_DIR || process.cwd();

  checkProjectHealth(cwd);

  const session = getLatestSession(cwd);

  if (!session) {
    console.log("[Session] No previous session found. Starting fresh.");
    return;
  }

  const age = Math.round((Date.now() - new Date(session.timestamp).getTime()) / (1000 * 60 * 60));
  const ageStr = age < 24 ? `${age}h ago` : `${Math.round(age / 24)}d ago`;

  const parts = [`[Previous Session: ${ageStr}]`];

  if (session.summary) parts.push(`Summary: ${session.summary}`);
  if (session.branch) parts.push(`Branch: ${session.branch}`);
  if (session.filesModified?.length) {
    parts.push(`Modified: ${session.filesModified.slice(0, 15).join(", ")}`);
  }
  if (session.decisions?.length) {
    parts.push(`Key decisions: ${session.decisions.join("; ")}`);
  }
  if (session.nextSteps) parts.push(`Next steps: ${session.nextSteps}`);

  console.log(parts.join("\n"));
}

main();
