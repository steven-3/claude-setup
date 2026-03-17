# Everything Claude Code Analysis

## Executive Summary

Everything Claude Code (ECC) is a large, mature agent harness configuration system (v1.8.0, 50K+ stars, 10+ months of development) that provides 25 agents, 108 skills, and 57 commands for Claude Code and other AI agent harnesses. Its three distinguishing features are: (1) a continuous learning system that captures tool-use observations via hooks and evolves them into "instincts" with confidence scoring, (2) a session persistence lifecycle using hooks at SessionStart/Stop/PreCompact to maintain cross-session context, and (3) a comprehensive hook architecture with profile-based runtime controls (minimal/standard/strict). The system is genuinely deep in several areas (planner, code-reviewer, architect agents; hook infrastructure; instinct CLI) while being template-level in others (many commands are thin wrappers that delegate to agents). The continuous learning system is prompt-driven pattern extraction, not machine learning, but it is well-engineered prompt-driven extraction with real infrastructure (1,148-line Python CLI, project-scoped storage, confidence decay).

## Core Command Quality

The five core commands assessed are: build-fix (debugging/troubleshooting), tdd, code-review, plan, and orchestrate (implementation).

| Command | Lines | Depth Score | Enforcement | Honest Assessment |
|---------|-------|-------------|-------------|-------------------|
| `/build-fix` | 62 | 2/5 | Guardrails suggest stopping after 3 retries; no mandatory gates | Concise procedural checklist. No anti-rationalization. Covers detection, fixing loop, recovery strategies. Effective but shallow -- a competent developer could draft this in 15 minutes. |
| `/tdd` | 328 | 4/5 | "MANDATORY: Tests must be written BEFORE implementation" stated explicitly; 80% coverage requirement | Most detailed core command. Full worked example with RED/GREEN/REFACTOR cycle, edge case list, anti-patterns, integration guidance. The depth comes from the example, not from unique methodology. |
| `/code-review` | 40 | 1/5 | "Block commit if CRITICAL or HIGH issues found" | Extremely thin. Just a bulleted checklist with severity categories. The actual depth lives in the `code-reviewer` agent (237 lines), not the command. The command is a dispatch stub. |
| `/plan` | 115 | 3/5 | "CRITICAL: The planner agent will NOT write any code until you explicitly confirm" -- user confirmation gate | Moderate depth. Describes the process and shows a worked example. The real depth is in the `planner` agent (212 lines) with its worked Stripe example. The command is a competent wrapper. |
| `/orchestrate` | 231 | 3/5 | Sequential agent pipeline; handoff document format enforced | Describes multi-agent workflows (feature, bugfix, refactor, security) with handoff document format, control-plane block, and tmux/worktree integration. Practical but not deeply prescriptive about how to handle failures. |

**Overall pattern**: Commands are thin dispatch layers. The real depth lives in agent definitions. This is arguably a good architecture (commands = invocation, agents = methodology), but it means assessing commands alone understates the system's depth.

## Sampled Command Quality

Ten additional commands sampled across different domains:

| Command | Lines | Depth Score | Enforcement | Honest Assessment |
|---------|-------|-------------|-------------|-------------------|
| `/e2e` | 365 | 4/5 | Flaky test quarantine; critical flow prioritization | Most detailed command in the repo. Full Playwright examples with Page Object Model, CI/CD integration, artifact handling, PMX-specific flows. |
| `/refactor-clean` | 80 | 3/5 | "Never delete without running tests first"; atomic one-at-a-time deletion | Solid safety-focused methodology with SAFE/CAUTION/DANGER tiers. Practical, actionable. |
| `/verify` | 59 | 2/5 | "If it fails, report errors and STOP" | Procedural checklist of build/type/lint/test/secrets/logs checks. Useful but generic. |
| `/learn` | 70 | 2/5 | "Ask user to confirm before saving" | Thin extraction prompt. No quality gate. Superseded by `/learn-eval`. |
| `/learn-eval` | 116 | 4/5 | Explicit checklist + holistic verdict system (Save/Improve/Absorb/Drop); must grep existing skills | Sophisticated quality gate with mandatory deduplication checking. Best-designed learning command. |
| `/evolve` | 178 | 3/5 | Minimum 3 instincts required; confidence thresholds | Clear clustering rules (command vs skill vs agent). Practical but the actual clustering is simple keyword normalization, not semantic. |
| `/go-review` | 148 | 3/5 | Block merge on CRITICAL; automated static analysis commands | Go-specific review with race condition, error wrapping, concurrency patterns. Good language specialization. |
| `/multi-plan` | 268 | 4/5 | Stop-loss: "Do not proceed to next phase until current phase output is validated" | Elaborate multi-model (Codex + Gemini) collaborative planning with parallel execution, session reuse, and plan file persistence. Complex but assumes specific tooling (codeagent-wrapper). |
| `/harness-audit` | 71 | 3/5 | Deterministic scoring via script; "do not rescore manually" | Delegates to `scripts/harness-audit.js` for reproducible 7-category scoring. Command is thin but the system is real. |
| `/skill-create` | 174 | 3/5 | None | Git history analysis for pattern extraction. Well-structured but no enforcement -- purely generative. |

**Quality distribution**: Mixed. 3 commands at depth 4, 4 at depth 3, 3 at depth 2. No command reaches depth 5 (deep operating manual with anti-rationalization and mandatory gates). The system's depth is in its infrastructure (hooks, scripts, agents), not its commands.

## Agent Inventory

25 agents total. All use Claude Code's `---` frontmatter for name, description, tools, and model selection.

| Agent | Domain | Model | Lines | Depth Score |
|-------|--------|-------|-------|-------------|
| planner | Implementation planning | opus | 212 | 4/5 |
| architect | System design | opus | 211 | 4/5 |
| code-reviewer | Quality review | sonnet | 237 | 4/5 |
| security-reviewer | Vulnerability detection | sonnet | 108 | 3/5 |
| tdd-guide | Test-driven development | sonnet | 91 | 3/5 |
| build-error-resolver | Build fixing | sonnet | 114 | 3/5 |
| e2e-runner | Playwright E2E | sonnet | 107 | 3/5 |
| refactor-cleaner | Dead code removal | sonnet | 85 | 2/5 |
| doc-updater | Documentation sync | sonnet | 107 | 3/5 |
| go-reviewer | Go code review | sonnet | 76 | 2/5 |
| go-build-resolver | Go build errors | sonnet | 94 | 2/5 |
| python-reviewer | Python code review | sonnet | 98 | 2/5 |
| database-reviewer | Database/Supabase | sonnet | 91 | 2/5 |
| chief-of-staff | Communication triage | opus | 151 | 3/5 |
| harness-optimizer | Config optimization | sonnet | 35 | 1/5 |
| loop-operator | Autonomous loop mgmt | sonnet | 36 | 1/5 |
| docs-lookup | Documentation search | sonnet | 68 | 2/5 |
| cpp-reviewer | C++ code review | sonnet | 72 | 2/5 |
| cpp-build-resolver | C++ build errors | sonnet | 90 | 2/5 |
| java-reviewer | Java code review | sonnet | 92 | 2/5 |
| java-build-resolver | Java build errors | sonnet | 153 | 3/5 |
| kotlin-reviewer | Kotlin code review | sonnet | 159 | 3/5 |
| kotlin-build-resolver | Kotlin build errors | sonnet | 118 | 3/5 |
| rust-reviewer | Rust code review | sonnet | 94 | 2/5 |
| rust-build-resolver | Rust build errors | sonnet | 148 | 3/5 |

**Activation**: All agents use `description` field for proactive activation (e.g., "Use PROACTIVELY when..."). Model routing is explicit per agent.

**Quality distribution**: 3 agents at depth 4 (planner, architect, code-reviewer), 12 at depth 3, 8 at depth 2, 2 at depth 1 (harness-optimizer and loop-operator are stubs at 35-36 lines). The core trio (planner, architect, code-reviewer) is genuinely deep with worked examples, checklists, and anti-patterns. Language-specific reviewers are competent but lighter.

## Continuous Learning System

### How It Works (with code quotes)

The continuous learning system has three layers:

**Layer 1: Observation Capture (observe.sh)**

Every tool call fires an observation hook via `PreToolUse` and `PostToolUse` matchers in `hooks.json`. The hook captures JSON from stdin, parses tool name/input/output, detects the current project via git remote URL hash, scrubs secrets with regex, and appends a JSONL line to project-scoped observation files.

Key code from `observe.sh`:
```bash
# Archive if file too large (atomic: rename with unique suffix to avoid race)
if [ -f "$OBSERVATIONS_FILE" ]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]; then
    archive_dir="${PROJECT_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/observations-$(date +%Y%m%d-%H%M%S)-$$.jsonl"
  fi
fi
```

**Layer 2: Pattern Detection (observer.md agent)**

A background Haiku-model agent reads accumulated observations and looks for four pattern types:
1. User corrections ("No, use X instead of Y")
2. Error resolutions (error followed by fix sequence)
3. Repeated workflows (same tool sequence used multiple times)
4. Tool preferences (consistent tool choices)

Confidence is calculated by observation frequency:
- 1-2 observations: 0.3 (tentative)
- 3-5 observations: 0.5 (moderate)
- 6-10 observations: 0.7 (strong)
- 11+ observations: 0.85 (very strong)

**Layer 3: Instinct Management (instinct-cli.py, 1,148 lines)**

A full Python CLI with commands: `status`, `import`, `export`, `evolve`, `promote`, `projects`. Handles project-scoped storage (SHA-256 hash of git remote URL), instinct file validation, cross-project promotion logic.

### Instinct Extraction Quality

Instincts are YAML files with frontmatter and markdown body. Example from the repo's own curated instincts:

```yaml
---
id: everything-claude-code-hooks-change-set
trigger: "when modifying hooks or hook-adjacent behavior in everything-claude-code"
confidence: 0.88
domain: workflow
source: repo-curation
source_repo: affaan-m/everything-claude-code
---

# Everything Claude Code Hooks Change Set

## Action
Update the hook script, its configuration, its tests, and its user-facing documentation together.

## Evidence
- Hook fixes routinely span hooks/hooks.json, scripts/hooks/, tests/hooks/, tests/integration/, and hooks/README.md.
- Partial hook changes are a common source of regressions and stale docs.
```

The format is well-designed: atomic (one trigger, one action), evidence-backed, confidence-weighted, scope-aware.

### Evolution Mechanism

The `/evolve` command clusters instincts using simple keyword normalization on trigger strings:

```python
trigger_key = trigger.lower()
for keyword in ['when', 'creating', 'writing', 'adding', 'implementing', 'testing']:
    trigger_key = trigger_key.replace(keyword, '').strip()
trigger_clusters[trigger_key].append(inst)
```

Clusters of 2+ instincts become skill candidates. High-confidence workflow instincts become command candidates. Clusters of 3+ with avg confidence >= 0.75 become agent candidates. The `--generate` flag writes actual SKILL.md, command, and agent files.

Cross-project promotion logic is real: instincts seen in 2+ projects with avg confidence >= 0.8 are auto-promotion candidates.

### Honest Assessment: Real Learning or Theater?

**It is prompt-driven pattern extraction with real infrastructure, not machine learning.**

What makes it genuine:
- The observation pipeline is real engineering: project-scoped storage, secret scrubbing, file rotation, signal throttling, race-condition guards (flock/lockfile), PID management
- The instinct CLI is 1,148 lines of Python with validation, promotion, cross-project detection
- Confidence scoring has real decay mechanics and promotion thresholds
- The `/learn-eval` command has a genuine quality gate (checklist + dedup check + verdict system)

What makes it theater:
- The "observer agent" is just a Haiku prompt that reads JSONL and writes YAML. There is no actual ML model being trained, no embedding space, no gradient descent
- "Clustering" is keyword removal on trigger strings, not semantic similarity
- Confidence values are heuristic (observation count thresholds), not learned from outcomes
- The observer is disabled by default (`"enabled": false` in config.json)
- Most instinct creation likely happens via manual `/learn` commands, not the automatic observer

**Verdict**: It is a well-engineered knowledge management system that uses LLM prompts for pattern extraction. Calling it "continuous learning" is aspirational marketing, but the underlying infrastructure is solid and the instinct format is genuinely useful. The system is more akin to a structured note-taking pipeline with LLM-assisted summarization than to actual machine learning.

## Session Persistence

### Save Phase (with code quotes)

The save phase runs on the `Stop` hook (fires after each Claude response). `session-end.js` reads the transcript path from stdin JSON, parses JSONL entries, and extracts:
- Last 10 user messages (truncated to 200 chars)
- Tools used (up to 20)
- Files modified (up to 30)

```javascript
function extractSessionSummary(transcriptPath) {
  const content = readFile(transcriptPath);
  if (!content) return null;
  const lines = content.split('\n').filter(Boolean);
  const userMessages = [];
  const toolsUsed = new Set();
  const filesModified = new Set();
  // ... parses each JSONL line for user messages, tool_use entries
  return {
    userMessages: userMessages.slice(-10),
    toolsUsed: Array.from(toolsUsed).slice(0, 20),
    filesModified: Array.from(filesModified).slice(0, 30),
    totalMessages: userMessages.length
  };
}
```

Session files are saved to `~/.claude/sessions/{date}-{shortId}-session.tmp` with markdown structure including header (date, project, branch, worktree) and summary block with markers for idempotent updates:

```javascript
const SUMMARY_START_MARKER = '<!-- ECC:SUMMARY:START -->';
const SUMMARY_END_MARKER = '<!-- ECC:SUMMARY:END -->';
```

### Load Phase (with code quotes)

The load phase runs on `SessionStart`. `session-start.js` finds recent session files (last 7 days), reads the latest, and outputs its content to stdout for context injection:

```javascript
const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });
if (recentSessions.length > 0) {
  const latest = recentSessions[0];
  const content = readFile(latest.path);
  if (content && !content.includes('[Session context goes here]')) {
    output(`Previous session summary:\n${content}`);
  }
}
```

It also reports:
- Learned skills count
- Session aliases (up to 5)
- Package manager detection
- Project type/framework detection

### Failure Modes

1. **SessionStart hook fails to resolve plugin root**: The hooks.json contains an elaborate bash fallback chain that searches multiple possible plugin installation paths. If all fail, it logs a warning and passes stdin through unmodified. Sessions start without context but don't crash.

2. **Stop hook fails**: All hooks use `process.exit(0)` in catch blocks to prevent blocking. Session state is not saved, but the next session's SessionStart will still find the most recent valid session file.

3. **Transcript path not available**: The system falls back to `CLAUDE_TRANSCRIPT_PATH` env var. If neither is available, session-end creates a blank template file.

4. **PreCompact hook**: Appends a compaction marker to the active session file before context compaction. This is informational only -- it doesn't preserve actual context.

### Token Cost

The session summary injected at start is lightweight:
- Header: ~100 tokens (date, project, branch metadata)
- Task list: ~20 tokens per task * 10 tasks max = ~200 tokens
- Files modified: ~10 tokens per file * 30 files max = ~300 tokens
- Tools used: ~50 tokens

**Estimated total: 500-700 tokens per session load.** This is minimal and well within acceptable overhead.

The suggest-compact hook adds no tokens -- it only writes to stderr (log messages to the hook system, not context injection).

## Hook Architecture

### What Fires When

**PreToolUse (7 hooks):**
| Hook | Matcher | Profile | Behavior |
|------|---------|---------|----------|
| auto-tmux-dev | Bash | always | Auto-start dev servers in tmux |
| tmux-reminder | Bash | strict | Remind to use tmux for long commands |
| git-push-reminder | Bash | strict | Remind before git push |
| doc-file-warning | Write | standard,strict | Warn about non-standard doc files |
| suggest-compact | Edit\|Write | standard,strict | Suggest compaction at intervals |
| observe (CLv2) | * | standard,strict | Capture tool use for learning (async, 10s timeout) |
| insaits-security | Bash\|Write\|Edit\|MultiEdit | standard,strict | Optional AI security monitor (15s timeout) |

**PostToolUse (7 hooks):**
| Hook | Matcher | Profile | Behavior |
|------|---------|---------|----------|
| pr-created | Bash | standard,strict | Log PR URL after creation |
| build-complete | Bash | standard,strict | Async build analysis (30s timeout) |
| quality-gate | Edit\|Write\|MultiEdit | standard,strict | Quality checks after edits (async, 30s) |
| post-edit-format | Edit | standard,strict | Auto-format JS/TS files |
| post-edit-typecheck | Edit | standard,strict | TypeScript check after edits |
| post-edit-console-warn | Edit | standard,strict | Warn about console.log |
| observe (CLv2) | * | standard,strict | Capture tool results for learning (async, 10s) |

**Stop (4 hooks):**
| Hook | Matcher | Profile | Behavior |
|------|---------|---------|----------|
| check-console-log | * | standard,strict | Check modified files for console.log |
| session-end | * | minimal,standard,strict | Persist session state (async, 10s) |
| evaluate-session | * | minimal,standard,strict | Extract patterns from sessions (async, 10s) |
| cost-tracker | * | minimal,standard,strict | Track token/cost metrics (async, 10s) |

**Other lifecycle hooks:**
- `SessionStart`: Load previous context (minimal,standard,strict)
- `SessionEnd`: Session end lifecycle marker (minimal,standard,strict)
- `PreCompact`: Save state before compaction (standard,strict)

### Performance Overhead

- **Async hooks**: observe, build-complete, quality-gate, session-end, evaluate-session, cost-tracker all run with `"async": true` and short timeouts (10-30s). They do not block tool execution.
- **Sync hooks**: tmux-reminder, git-push-reminder, doc-file-warning, suggest-compact, format, typecheck, console-warn are synchronous but lightweight (file reads, simple checks).
- **run-with-flags.js optimization**: Hooks that export a `run()` function are loaded via `require()` instead of spawning a child process, saving ~50-100ms per hook invocation.
- **Signal throttling**: The observe hook only signals the observer process every N observations (default 20) to prevent CPU storms.
- **Profile gating**: The `minimal` profile runs only session-end, evaluate-session, and cost-tracker. All other hooks are skipped, providing a fast path for automated/CI sessions.

**Estimated overhead per tool call (standard profile)**: 2 sync hooks (~100-200ms total) + 2 async hooks (non-blocking). Acceptable for interactive use.

### Profile Differences

Controlled by `ECC_HOOK_PROFILE` environment variable:

| Hook Category | minimal | standard | strict |
|---------------|---------|----------|--------|
| Session lifecycle (start/end/cost) | Yes | Yes | Yes |
| Observation capture (CLv2) | No | Yes | Yes |
| Doc file warnings | No | Yes | Yes |
| Suggest compact | No | Yes | Yes |
| Format/typecheck/console-warn | No | Yes | Yes |
| Quality gate | No | Yes | Yes |
| tmux reminder | No | No | Yes |
| git push reminder | No | No | Yes |
| insaits security | No | Yes | Yes |

Additionally, individual hooks can be disabled via `ECC_DISABLED_HOOKS=comma,separated,hook,ids`.

## Unique Strengths

1. **Project-scoped instinct isolation (v2.1)**: The continuous learning system hashes git remote URLs to create per-project instinct directories, preventing React patterns from contaminating Python projects. Cross-project promotion has real criteria (2+ projects, avg confidence >= 0.8). This is a thoughtful design.

2. **Hook runtime controls**: The `ECC_HOOK_PROFILE` and `ECC_DISABLED_HOOKS` mechanism provides fine-grained control without editing configuration files. The three-tier profile system (minimal/standard/strict) is practical for different contexts (CI vs. development vs. security review).

3. **Cross-platform engineering**: All hooks are rewritten in Node.js for Windows/macOS/Linux compatibility. The SessionStart hook has an elaborate plugin-root resolution fallback chain. Package manager detection cascades through 6 sources.

4. **Cross-harness parity**: The same system ships for Claude Code, Cursor, OpenCode, Codex, and Antigravity with harness-specific adaptations (`.cursor/hooks/`, `.codex/AGENTS.md`, `.opencode/` plugin).

5. **Real test infrastructure**: 997 internal tests covering hooks, scripts, CI validators, session management, skill evolution, and state store. This is not a config pack -- it is a tested software system.

6. **`/learn-eval` quality gate**: The checklist + holistic verdict system for extracting skills is well-designed. The explicit dedup requirement (grep existing skills, check MEMORY.md) prevents knowledge rot.

7. **Security scanning integration**: AgentShield with 1,282 tests, 102 rules, and a red-team/blue-team/auditor Opus pipeline is a genuine companion tool.

8. **Cost tracking**: The `cost-tracker.js` hook estimates per-session costs by model tier and appends to a JSONL metrics file. Simple but practical.

## Honest Weaknesses

1. **Commands are largely thin wrappers**: The `/code-review` command is 40 lines. The actual methodology lives in the `code-reviewer` agent (237 lines). Many commands are dispatch stubs that add a description and say "this invokes agent X." The command/agent split creates discoverability confusion.

2. **No anti-rationalization mechanisms**: None of the commands or agents contain anti-rationalization guards ("Do not skip this step because you think it's unnecessary"). The enforcement is "MANDATORY" labels and "CRITICAL" markers, but there is no mechanism to prevent an LLM from rationalizing past them.

3. **Continuous learning observer is disabled by default**: `config.json` sets `"enabled": false`. The observation hooks fire (capturing JSONL), but the Haiku agent that would analyze them and create instincts does not run automatically. Most instinct creation requires manual `/learn` or `/learn-eval` commands.

4. **Evolution clustering is shallow**: The "clustering" algorithm for `/evolve` is keyword removal on trigger strings. Two instincts with triggers "when creating components" and "when building React components" would not cluster together unless the keyword list happened to match. There is no semantic similarity, embedding comparison, or LLM-based grouping.

5. **Breadth over depth in language support**: There are 14 language-specific agents (Go, Python, Java, Kotlin, C++, Rust reviewers and build resolvers), but most are 72-159 lines of generic review checklists adapted for language idioms. None approach the depth of the core planner/architect/code-reviewer trio.

6. **Some agents are stubs**: `harness-optimizer` (35 lines) and `loop-operator` (36 lines) are minimal descriptions that barely qualify as agent definitions. They list a workflow but provide no worked examples, checklists, or error handling guidance.

7. **Session persistence is transcript-based, not semantic**: The session-end hook extracts user messages, tools used, and files modified -- but not decisions made, problems solved, or context that would actually be useful for session resumption. The loaded context tells you what happened but not why.

8. **No verification that hooks actually fired**: There is no telemetry or health check to confirm hooks are executing. If a hook silently fails (e.g., Node.js not in PATH, plugin root misconfigured), the system degrades silently. The `scripts/doctor.js` file exists but was not examined in detail.

9. **Token overhead scales with skill count**: The README claims 108 skills. While individual skills are loaded on demand, the rules files are "always-follow guidelines" copied to `~/.claude/rules/`. Installing all language rules would add significant system prompt overhead.

10. **Multi-plan command assumes external tooling**: The `/multi-plan` command references `codeagent-wrapper`, `ace-tool MCP`, Codex backend, and Gemini backend -- tools that most users will not have configured. The fallback path exists but the primary workflow is highly specialized.

## Raw Evidence

### File Counts
- **Agents**: 25 files in `agents/` (35-237 lines each)
- **Commands**: 57+ files in `commands/` (40-365 lines each)
- **Skills**: 108+ SKILL.md files across `skills/` subdirectories
- **Hook scripts**: 20+ files in `scripts/hooks/`
- **Tests**: 40+ test files in `tests/`
- **Rules**: 5 language directories (common, typescript, python, golang, swift, php) with 5 files each

### Key File Paths
- Hook configuration: `hooks/hooks.json`
- Session start: `scripts/hooks/session-start.js`
- Session end: `scripts/hooks/session-end.js`
- Suggest compact: `scripts/hooks/suggest-compact.js`
- Evaluate session: `scripts/hooks/evaluate-session.js`
- Pre-compact: `scripts/hooks/pre-compact.js`
- Cost tracker: `scripts/hooks/cost-tracker.js`
- Hook runtime flags: `scripts/lib/hook-flags.js`
- Hook flag wrapper: `scripts/hooks/run-with-flags.js`
- Observation hook: `skills/continuous-learning-v2/hooks/observe.sh`
- Observer agent: `skills/continuous-learning-v2/agents/observer.md`
- Instinct CLI: `skills/continuous-learning-v2/scripts/instinct-cli.py` (1,148 lines)
- CLv2 skill doc: `skills/continuous-learning-v2/SKILL.md`
- Example instincts: `.claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml`

### Version and Scale
- Current version: v1.8.0 (March 2026)
- Repository: github.com/affaan-m/everything-claude-code
- Stars: 50K+ | Forks: 6K+ | Contributors: 30
- Internal tests: 997 passing
- Supported harnesses: Claude Code, Cursor, OpenCode, Codex (app + CLI), Antigravity
- Languages: TypeScript, Python, Go, Swift, PHP, Kotlin, Java, C++, Rust, Perl
