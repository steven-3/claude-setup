#!/usr/bin/env node
// Cost Tracker Hook — logs session cost estimate to JSONL
// Fires on: Stop (async)

const fs = require("fs");
const path = require("path");
const os = require("os");

const LOG_FILE = path.join(os.homedir(), ".claude", "cost-log.jsonl");

function main() {
  const entry = {
    timestamp: new Date().toISOString(),
    project: process.env.PROJECT_DIR || process.cwd(),
    sessionId: process.env.SESSION_ID || "unknown",
    costUsd: process.env.CLAUDE_SESSION_COST_USD || null,
  };

  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch {
    // Non-critical — silently fail
  }
}

main();
