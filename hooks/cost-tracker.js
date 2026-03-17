#!/usr/bin/env node
// Cost Tracker Hook - Logs session cost estimate
// Fires on: Stop (async)

const fs = require("fs");
const path = require("path");
const os = require("os");

const LOG_FILE = path.join(os.homedir(), ".claude", "cost-log.jsonl");

function main() {
  const entry = {
    timestamp: new Date().toISOString(),
    project: process.env.PROJECT_DIR || process.cwd(),
    sessionId: process.env.SESSION_ID || "unknown"
  };

  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch {
    // Non-critical - silently fail
  }
}

main();
