#!/usr/bin/env node
// Session Start Hook — loads previous session context + living docs summaries
// Fires on: SessionStart
// Outputs combined context: session summary + ARCHITECTURE.md + DESIGN.md + .planning/

const fs = require("fs");
const path = require("path");
const os = require("os");

const SESSION_DIR = path.join(os.homedir(), ".claude", "sessions");
const MAX_AGE_DAYS = 7;

// ─── Path safety ────────────────────────────────────────────────────────────

/**
 * Validate that each segment is safe (no traversal, not absolute), then join
 * onto a trusted base via string concatenation. This satisfies semgrep
 * taint-tracking rules for path.join/path.resolve with untrusted input.
 * NOTE: Duplicated from cli/lib/planning.js — hooks run standalone and cannot
 * import from cli/lib/. Keep both copies in sync.
 */
function safeJoin(trustedBase, ...segments) {
  for (const seg of segments) {
    if (typeof seg !== "string" || seg.length === 0) {
      throw new Error("safeJoin: segment must be a non-empty string");
    }
    if (path.isAbsolute(seg)) {
      throw new Error("safeJoin: segment must not be an absolute path");
    }
    for (const part of seg.split(/[\\/]/)) {
      if (part === "..") {
        throw new Error("safeJoin: path traversal not allowed");
      }
    }
  }
  const joined = trustedBase + path.sep + segments.join(path.sep);
  if (!joined.startsWith(trustedBase + path.sep)) {
    throw new Error("safeJoin: resolved path escapes base directory");
  }
  return joined;
}

// ─── Session loading ─────────────────────────────────────────────────────────

function getLatestSession(projectDir) {
  if (!fs.existsSync(SESSION_DIR)) return null;

  const files = fs.readdirSync(SESSION_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      const filepath = safeJoin(SESSION_DIR, f);
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

function formatSessionContext(session) {
  if (!session) return "[Session] No previous session found. Starting fresh.";

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

  return parts.join("\n");
}

// ─── Living docs extraction ──────────────────────────────────────────────────

function extractDocSummary(content, maxChars) {
  const sections = content.split(/^## /m);
  const headings = [];
  let overview = "";
  let techStack = "";

  for (const section of sections) {
    const lines = section.split("\n");
    const title = lines[0]?.trim();
    if (!title) continue;
    headings.push(title);

    if (/overview/i.test(title)) {
      const body = lines.slice(1).join("\n").trim();
      overview = body.split(/\n\s*\n/)[0]?.slice(0, 400) || "";
    }
    if (/tech stack/i.test(title)) {
      techStack = lines.filter(l => l.trim().startsWith("|")).join("\n").slice(0, 300);
    }
  }

  const parts = [];
  if (overview) parts.push("Overview: " + overview);
  if (techStack) parts.push("Tech Stack:\n" + techStack);
  if (headings.length) parts.push("Sections: " + headings.join(", "));
  return parts.join("\n").slice(0, maxChars);
}

function formatLivingDocs(projectDir) {
  const parts = [];

  // ARCHITECTURE.md — always check
  const archPath = safeJoin(projectDir, "ARCHITECTURE.md");
  if (fs.existsSync(archPath)) {
    try {
      const content = fs.readFileSync(archPath, "utf-8");
      const summary = extractDocSummary(content, 800);
      if (summary) parts.push(`[Architecture]\n${summary}`);
    } catch {}
  } else {
    parts.push("[Setup] No ARCHITECTURE.md found. Run /supermind-init to create one.");
  }

  // DESIGN.md — only if it exists
  const designPath = safeJoin(projectDir, "DESIGN.md");
  if (fs.existsSync(designPath)) {
    try {
      const content = fs.readFileSync(designPath, "utf-8");
      const summary = extractDocSummary(content, 400);
      if (summary) parts.push(`[Design]\n${summary}`);
    } catch {}
  }

  return parts.join("\n");
}

// ─── Project health check ────────────────────────────────────────────────────

function checkProjectHealth(projectDir) {
  const missing = [];
  if (!fs.existsSync(safeJoin(projectDir, "CLAUDE.md"))) {
    missing.push("CLAUDE.md");
  }
  if (missing.length > 0) {
    return `[Setup] Missing: ${missing.join(", ")} — consider creating one for this project.`;
  }
  return null;
}

// ─── Planning session detection ─────────────────────────────────────────────

function formatPlanningContext(projectDir) {
  const planningDir = safeJoin(projectDir, ".planning");
  if (!fs.existsSync(planningDir)) return null;

  try {
    // Read roadmap to find active phase
    const roadmapPath = safeJoin(planningDir, "roadmap.md");
    if (!fs.existsSync(roadmapPath)) {
      return "[Planning] Active .planning/ directory detected (initializing)";
    }

    const roadmapContent = fs.readFileSync(roadmapPath, "utf-8");
    const phases = [];
    for (const line of roadmapContent.split("\n")) {
      const match = line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/);
      if (match && match[2].trim()) {
        phases.push({
          phase: parseInt(match[1], 10),
          status: match[2].trim(),
          description: match[3].trim(),
        });
      }
    }

    if (phases.length === 0) {
      return "[Planning] Active .planning/ directory detected (no phases yet)";
    }

    const completed = phases.filter(p => p.status === "completed").length;
    const active = phases.find(p => p.status !== "completed" && p.status !== "skipped");

    if (!active) {
      return `[Planning] All ${phases.length} phases completed`;
    }

    // Read progress.md from the active phase — validate phase number
    const phaseNum = Number(active.phase);
    if (!Number.isInteger(phaseNum) || phaseNum < 1) {
      return "[Planning] Active .planning/ directory detected (invalid phase number)";
    }
    const phasesDir = safeJoin(planningDir, "phases");
    const phaseDir = safeJoin(phasesDir, `phase-${phaseNum}`);
    const progressPath = safeJoin(phaseDir, "progress.md");
    let progressSummary = "";
    if (fs.existsSync(progressPath)) {
      const progressContent = fs.readFileSync(progressPath, "utf-8");
      const entries = [];
      for (const line of progressContent.split("\n")) {
        const match = line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/);
        if (match) {
          entries.push({ wave: parseInt(match[1], 10), status: match[3].trim() });
        }
      }
      if (entries.length > 0) {
        const done = entries.filter(e => e.status === "completed").length;
        const currentWave = Math.max(
          ...entries.filter(e => e.status !== "completed").map(e => e.wave).concat([0])
        );
        progressSummary = `, Wave ${currentWave}, ${done}/${entries.length} tasks complete`;
      }
    }

    return `[Planning] Active planning session detected — Phase ${phaseNum} (${active.description})${progressSummary} [${completed}/${phases.length} phases done]`;
  } catch {
    return "[Planning] Active .planning/ directory detected (could not read state)";
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  try {
    const projectDir = process.env.PROJECT_DIR || process.cwd();

    const outputParts = [];

    // Project health check
    const healthWarning = checkProjectHealth(projectDir);
    if (healthWarning) outputParts.push(healthWarning);

    // Session context
    const session = getLatestSession(projectDir);
    outputParts.push(formatSessionContext(session));

    // Living docs
    const docsContext = formatLivingDocs(projectDir);
    if (docsContext) outputParts.push(docsContext);

    // Planning session awareness
    const planningContext = formatPlanningContext(projectDir);
    if (planningContext) outputParts.push(planningContext);

    console.log(outputParts.join("\n---\n"));
  } catch (err) {
    console.log("[Session] Hook error: " + err.message);
  }
}

main();
