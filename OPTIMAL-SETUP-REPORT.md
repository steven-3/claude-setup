# The Optimal Claude Code Setup

## 1. Executive Summary

**Install Superpowers as your base skill system.** It wins 7 of 9 capability categories with the deepest enforcement mechanisms, the only empirically-derived anti-rationalization tables, and the most architecturally sound multi-agent pipeline. **Add ECC in minimal profile** for its session persistence hooks (500-700 token overhead) and continuous learning infrastructure. **Add Serena MCP** for semantic code navigation and persistent cross-session memory. **Skip SuperClaude entirely** -- its 17,500+ token base overhead, placeholder implementations, and prompt-only enforcement are strictly dominated by the combination of Superpowers' skill depth and ECC's infrastructure. For knowledge management across projects, use an **Obsidian vault** with direct filesystem access, adding MCP servers only when the vault grows large enough to need semantic search.

---

## 2. System Scores

| System | Skill Depth | Enforcement | Breadth | Learning | Persistence | Token Efficiency | Ease of Use | Agent Quality | OVERALL |
|---|---|---|---|---|---|---|---|---|---|
| **SuperClaude** | 5 | 3 | 8 | 2 | 5 (requires Serena) | 3 | 5 | 4 | **4.4** |
| **Superpowers** | 10 | 10 | 5 | 1 | 2 | 6 | 6 | 9 | **7.4** |
| **ECC** | 5 | 4 | 8 | 7 | 7 | 8 | 7 | 6 | **6.5** |

### Justifications

**Skill Depth**: Superpowers has 5 skills at depth 5/5 (avg 4.5/5 across core capabilities); ECC's best agents reach depth 4/5 (avg 3.2/5); SuperClaude has 1 agent at depth 5/5 (avg 3.0/5). Evidence: comparison-skills.md depth score tables.

**Enforcement**: Superpowers has a 7-layer enforcement model (Iron Laws, spirit-vs-letter defense, rationalization tables, red flags, hard gates, gate functions, persuasion-informed design). ECC uses "MANDATORY" labels and severity gating. SuperClaude uses "STOP AFTER" boundaries with no anti-rationalization. Evidence: comparison-skills.md enforcement analysis.

**Breadth**: SuperClaude covers 20 domains (business panels, education, DevOps, security, multiple languages). ECC covers 25 agents including 14 language-specific reviewers. Superpowers covers only 8 core roles. Evidence: comparison-agents.md agent count table.

**Learning**: ECC is the only system with a deliberate learning pipeline (observation capture, instinct creation, confidence scoring, cross-project promotion). SuperClaude has no learning. Superpowers has no learning. Evidence: comparison-memory.md learning assessment.

**Persistence**: ECC has automatic session save/load at 500-700 tokens. SuperClaude requires Serena MCP for persistence (well-designed schema but external dependency). Superpowers has no session persistence mechanism. Evidence: comparison-memory.md persistence table.

**Token Efficiency**: ECC has ~500-700 token base overhead with profile-gated hooks. Superpowers has near-zero base with ~500-1,250 tokens per skill invocation on demand. SuperClaude has ~17,500 token base before any work begins, potentially 25,000+. Evidence: comparison-skills.md token efficiency section.

**Ease of Use**: ECC has Node.js hooks with three-tier profiles (minimal/standard/strict). Superpowers requires understanding skill invocation patterns. SuperClaude requires Serena MCP and multiple configuration files. Evidence: comparison-memory.md setup complexity table.

**Agent Quality**: Superpowers scores 58/70 in the agent architecture comparison (two-stage adversarial review, subagent isolation, cost-aware model selection). ECC scores 48/70 (native dispatch, model routing, language breadth). SuperClaude scores 38/70 (thin agents, no programmatic coordination, context pollution). Evidence: comparison-agents.md scoring summary.

---

## 3. Capability Winners

- **Debugging**: **Superpowers** -- The only system with an Iron Law ("NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"), a 4-phase mandatory process with 8-entry rationalization table, and a 3-fix architectural escalation rule backed by 1,251 lines of supporting material across 11 files.

- **TDD**: **Superpowers** -- The only system with a delete mandate (code written before tests must be deleted, no exceptions), 11-entry anti-rationalization table for TDD, and gate functions for testing anti-patterns; SuperClaude's test command explicitly refuses to generate tests.

- **Planning**: **Tie (Superpowers and SuperClaude)** -- SuperClaude has the more comprehensive strategic framework (PDCA cycle with hypothesis documentation and checkpoint intervals); Superpowers has more actionable output (2-5 minute granular steps, zero-context engineer assumption, automated plan review loop with subagent).

- **Code Review**: **Superpowers** -- The only system addressing both sides of review (requesting and receiving), with anti-sycophancy enforcement that bans performative agreement, a YAGNI check, and a pushback protocol; no other system targets the AI rubber-stamping failure mode.

- **Implementation**: **Superpowers** -- Two-stage review pipeline (spec compliance then code quality) with mandatory distrust of the implementer, four-status escalation protocol (DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED), and cost-aware model selection.

- **Brainstorming**: **Superpowers** -- Hard gate preventing any implementation before design approval (applies to every project including "simple" ones), visual companion web server for design mockups, and spec review loop with max 3 iterations.

- **Auto-trigger**: **Superpowers** -- 1% threshold for skill invocation with 12-entry rationalization table catching specific excuses for skipping skills; SuperClaude relies on Claude voluntarily following keyword matching in RULES.md; ECC uses standard description-based activation.

- **Memory/Persistence**: **ECC** -- Automatic session save/load at 500-700 tokens with graceful degradation, plus the only deliberate learning pipeline (observation capture, instinct creation with confidence scoring, cross-project promotion when instincts appear in 2+ projects with avg confidence >= 0.8).

- **Learning**: **ECC** -- 1,148-line Python CLI for instinct management with project-scoped storage, confidence decay, and `/learn-eval` quality gate with checklist + verdict + dedup check; no other system has a structured learning pipeline.

- **Agent Architecture**: **Superpowers** -- Multi-role pipeline with adversarial review (spec reviewer explicitly told to distrust implementer), fresh subagent dispatch per task (no context contamination), and the "in over your head" escalation clause.

- **Token Efficiency**: **ECC** -- ~500-700 token base with profile-gated hooks running externally (no context cost), per-hook disabling via environment variables; Superpowers is close with near-zero base but accumulates per-skill.

- **MCP Coordination**: **SuperClaude** -- The select-tool command describes intelligent routing between Serena and Morphllm MCPs with complexity scoring, though this is prompt-based rather than programmatic; neither Superpowers nor ECC has explicit MCP coordination logic.

---

## 4. Recommended Setup

### Base system to install
**Superpowers** -- Install as your primary skill system. This provides the deepest enforcement for debugging, TDD, planning, implementation, code review, and brainstorming.

### Components to cherry-pick from ECC
1. **Session persistence hooks** (`session-start.js`, `session-end.js`) -- Automatic 500-700 token context bridge between sessions
2. **Continuous Learning v2** (`instinct-cli.py`, `/learn-eval`, `/evolve`) -- Structured knowledge accumulation across sessions and projects
3. **Cost tracker hook** (`cost-tracker.js`) -- Per-session cost estimation
4. **Profile system** (`ECC_HOOK_PROFILE=minimal`) -- Run only essential hooks to minimize overhead

### Components to cherry-pick from SuperClaude
**None.** Every SuperClaude capability is either done better by Superpowers (debugging, TDD, planning, review, implementation) or provided more efficiently by ECC (session persistence, learning). The PDCA cycle concept is valuable but can be captured in your CLAUDE.md as a concise planning protocol without the 17,500-token framework overhead.

### Components to explicitly disable/skip
- SuperClaude entirely (17,500+ token base overhead, placeholder implementations, prompt-only enforcement)
- ECC observer agent (disabled by default; the Haiku-model observer adds overhead without proportional value)
- ECC strict profile hooks (tmux-reminder, git-push-reminder add friction without enforcement)
- claude-mem (doubles token consumption per session; 3 concurrent processes; 110 open issues; fragile on Windows)
- Sequential Thinking MCP (Claude's native extended thinking is strictly superior; the server is a prompt engineering technique with zero persistence)
- ECC language-specific rules files (installing all language rules adds significant system prompt overhead; use only what applies to your stack)

### MCP servers to include
1. **Serena** -- Semantic code navigation (LSP-powered find-definition, find-references, rename refactoring) + persistent cross-session memory via `.serena/memories/`
2. **Obsidian MCP** (when vault is large enough) -- Cross-project knowledge base with optional semantic search
3. **AIRIS Gateway** (if already configured) -- Route to other MCP servers as needed

### Memory system architecture
- **Tier 1 (Foundation)**: `CLAUDE.md` + `MEMORY.md` -- Human-curated project instructions (zero overhead, always loaded)
- **Tier 2 (Session continuity)**: ECC session persistence hooks -- Automatic context bridge at 500-700 tokens
- **Tier 3 (Structured learning)**: ECC instinct system via `/learn-eval` and `/evolve` -- Manual curation of cross-session patterns
- **Tier 4 (Cross-project knowledge)**: Serena global memories (`~/.serena/memories/global/`) + Obsidian vault for long-term knowledge

---

## 5. Memory Architecture

### What stores what

| Store | What It Holds | Lifecycle | Token Cost |
|---|---|---|---|
| `CLAUDE.md` | Project coding instructions, style guides, architecture constraints, stack-specific rules | Permanent; human-curated | ~200-2,000 tokens (loaded automatically) |
| `MEMORY.md` | Session-to-session working notes, current priorities, recent decisions | Semi-permanent; updated by Claude with user approval | ~200-1,000 tokens (loaded automatically) |
| ECC session file | Last session's messages (10), tools used (20), files modified (30), project/branch metadata | Overwritten each session; last 7 days retained | ~500-700 tokens (injected at SessionStart) |
| ECC instincts | YAML files with trigger/action/evidence/confidence per pattern | Permanent with confidence decay; cross-project promotion at 2+ projects, confidence >= 0.8 | Variable (loaded on demand) |
| Serena project memories | Architecture, conventions, commands, workflows as Markdown in `.serena/memories/` | Permanent; updated by LLM or human | Low (on-demand via tool calls) |
| Serena global memories | Cross-project patterns, personal conventions in `~/.serena/memories/global/` | Permanent; manually maintained | Low (on-demand via tool calls) |
| Obsidian vault | Long-term knowledge base: patterns, architecture decisions, research, debugging solutions | Permanent; human-curated with AI assistance | Variable (depends on retrieval method) |

### Session lifecycle

**Session start:**
1. Claude Code loads `CLAUDE.md` and `MEMORY.md` automatically (~200-2,000 tokens)
2. ECC `SessionStart` hook fires, injecting previous session summary (~500-700 tokens)
3. Superpowers' `using-superpowers` meta-skill activates, establishing skill invocation rules (~300 tokens)
4. Serena onboarding check runs (first time only; subsequent sessions read memories on demand)

**During work:**
5. Superpowers skills auto-trigger based on context (1% threshold)
6. Serena provides symbol navigation and code understanding via MCP tool calls
7. ECC observation hooks capture tool use patterns (async, non-blocking)
8. Claude writes to Serena memories when architectural decisions are made or conventions are established

**Session end:**
9. ECC `Stop` hook fires, persisting session summary to `~/.claude/sessions/`
10. ECC cost tracker logs token usage metrics
11. User optionally runs `/learn-eval` to extract instincts from the session
12. User optionally exports session learnings to Obsidian vault

**Next session:**
13. Steps 1-4 repeat, with the new session summary from step 9 providing continuity
14. Instincts created in step 11 are available for future sessions
15. Serena memories from step 8 provide project context without re-discovery

### Cross-project knowledge flow

```
Project A session
  -> /learn-eval creates instinct (confidence 0.5)
  -> Pattern repeats in Project A (confidence rises to 0.7)

Project B session
  -> Same pattern observed -> instinct created (confidence 0.5)

/evolve detects:
  -> Same instinct in 2 projects, avg confidence >= 0.8
  -> Promotes to global instinct
  -> Also written to Serena global memory for tool-accessible retrieval
  -> Optionally documented in Obsidian vault under knowledge/patterns/
```

### What tools/MCP servers support this

- **ECC hooks** (`session-start.js`, `session-end.js`): Automatic session persistence
- **ECC instinct CLI** (`instinct-cli.py`): Cross-project instinct management
- **Serena MCP**: On-demand memory read/write via 6 CRUD tools, cross-project query
- **Obsidian** (direct filesystem or MCP): Long-term knowledge retrieval

---

## 6. MCP Server Configuration

### Serena: Keep (High Value)

**What it adds:** Semantic code navigation (find-definition, find-references, rename refactoring across 30+ languages), persistent memory system, automatic project onboarding, cross-project queries.

**Configuration:**
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from", "git+https://github.com/oraios/serena",
        "serena", "start-mcp-server",
        "--context", "claude-code",
        "--project", "/path/to/project"
      ]
    }
  }
}
```

The `--context claude-code` flag is critical -- it disables tools that duplicate Claude Code's native capabilities (file I/O, shell commands) and exposes only Serena's unique features (symbol tools, memory tools, workflow tools).

**When to use:** Any project with an existing codebase where you need to navigate, understand, or refactor code. Less valuable for greenfield projects or very small codebases.

### Sequential Thinking: Skip

**Evidence:** The analyst report confirms the server "does almost nothing" -- it stores what the LLM sends and echoes back metadata. The entire intelligence comes from the tool description prompt. For Claude specifically, native extended thinking is strictly superior: same reasoning quality at lower latency (single inference pass vs. N round-trips) and lower token cost. The server has zero persistence (in-memory only, lost on restart) and no thought retrieval tool.

**The one exception:** If you use a multi-model architecture where cheaper non-Claude models handle some tasks, Sequential Thinking forces those models to reason step-by-step. For Claude-only setups, skip it entirely.

### Obsidian MCP: Keep (Conditional)

**What it adds:** Cross-project knowledge base accessible from any working directory, semantic search over past solutions, human-readable/editable vault.

**When to add:** After your vault has grown large enough that direct filesystem access becomes unwieldy (typically 100+ notes). Start with direct filesystem access from the vault directory.

**Recommended server:** `mcp-obsidian` (MarkusPfundstein, 3k stars) for stability, or `obsidian-claude-code-mcp` (Ian Sinnott) for auto-discovery. Add `obsidian-mcp-tools` (Jack Steamdev) with Smart Connections only when you need semantic search.

### AIRIS Gateway: Keep (If Already Configured)

**What it adds:** Centralized routing to MCP servers, potentially reducing configuration overhead.

**When to use:** If you already have AIRIS configured, route Serena and other servers through it. Do not add AIRIS solely for this setup -- direct MCP configuration is simpler for 2-3 servers.

### claude-mem: Skip

**Evidence:** Approximately doubles total session token cost (~14,000-30,000 additional tokens per session for the observer agent). Requires 3 concurrent processes (Claude Code, Worker on port 37777, SDK Agent subprocess). Depends on Bun runtime and ChromaDB via Python. Has 110 open issues. The observer agent (Sonnet-class) can silently store misinterpretations with no human review gate. The comparison-memory report concludes: "For most users: No" when asked if this is better than the built-in system.

---

## 7. What to Skip

### From SuperClaude (Skip Everything)

| Component | Why Skip | Evidence |
|---|---|---|
| Entire framework | 17,500+ token base overhead consumes 12-25% of context window before any work begins | report-superclaude.md: "~69,958 bytes (~1,747 lines, ~17,500 tokens)" always loaded |
| PM Agent | 10,800 tokens for a single agent; orchestration is prompt-based, not programmatic | report-superclaude.md: agents "do not communicate with each other programmatically" |
| 14 thin agents | Under 3,100 bytes each; follow near-identical template; minimal differentiation between e.g. "backend-architect" and "system-architect" | report-superclaude.md: "14 are under 3,100 bytes (~78 lines)" |
| Confidence checker | Core methods are acknowledged placeholders (`_no_duplicates()`, `_architecture_compliant()`, etc.) | report-superclaude.md TASK.md quote: "Core confidence checker methods are placeholders" |
| Expert panels | Creative but entirely simulated through prompt engineering with no enforcement mechanism | comparison-skills.md: "entirely simulated through prompt engineering" |
| v5.0 plugin system | Does not exist; described in detail but tracked as Issue #419 | report-superclaude.md: "vaporware" |
| Keyword-based dispatch | 100% prompt-based; no runtime code forces agent activation | report-superclaude.md: "There is NO runtime code that forces agent activation" |

### From ECC (Skip Selectively)

| Component | Why Skip | Evidence |
|---|---|---|
| Observer agent | Disabled by default; Haiku model reads JSONL and writes YAML; not actual ML; adds processing overhead | report-ecc.md: `"enabled": false` in config.json |
| Strict profile hooks | tmux-reminder and git-push-reminder add friction without enforcement depth | report-ecc.md: hook profile table |
| All language rule files at once | Installing all languages adds significant system prompt overhead | report-ecc.md: "Installing all language rules would add significant system prompt overhead" |
| `/multi-plan` command | Assumes external tooling (codeagent-wrapper, ace-tool MCP, Codex backend) most users lack | report-ecc.md: "tools that most users will not have configured" |
| harness-optimizer and loop-operator agents | Stubs at 35-36 lines; barely qualify as agent definitions | report-ecc.md: "2 stubs at depth 1/5" |

### From Superpowers (Nothing to Skip)

All Superpowers skills are depth 2/5 or above and loaded on demand. The only consideration is the visual companion for brainstorming (experimental, can be token-intensive), which can be ignored for non-visual workflows without affecting core functionality.

### From MCP Servers

| Component | Why Skip | Evidence |
|---|---|---|
| Sequential Thinking | Claude's native extended thinking is strictly superior; zero persistence; each thought = 1 tool call round-trip | report-sequential-thinking.md: "For Claude specifically, extended thinking is strictly superior" |
| claude-mem | ~2x total token cost per session; 3 concurrent processes; fragile on Windows; 110 open issues | report-claude-mem.md: "roughly doubles the token consumption" |

---

## 8. Conflict Resolution

### Conflict 1: Superpowers skills vs. ECC commands for the same task

**Conflict:** Both systems provide debugging, TDD, planning, code review, and implementation commands/skills. Running both could cause confusion about which to invoke.

**Resolution:** Superpowers skills take priority for methodology. Remove or do not install ECC commands that overlap with Superpowers skills:
- Skip ECC `/build-fix` (use Superpowers `systematic-debugging`)
- Skip ECC `/tdd` (use Superpowers `test-driven-development`)
- Skip ECC `/code-review` command (use Superpowers `requesting-code-review` / `receiving-code-review`)
- Skip ECC `/plan` (use Superpowers `writing-plans`)
- Keep ECC `/orchestrate` for tmux/worktree infrastructure (Superpowers lacks parallel execution infrastructure)
- Keep ECC `/learn-eval` and `/evolve` (Superpowers has no learning system)
- Keep ECC `/e2e` (Superpowers has no E2E testing skill)

**Priority order:** Superpowers enforcement > ECC infrastructure > ECC methodology

### Conflict 2: ECC hooks vs. Superpowers skill auto-trigger

**Conflict:** ECC hooks fire on every tool use (PreToolUse, PostToolUse). Superpowers' `using-superpowers` meta-skill triggers at conversation start. Both try to influence behavior.

**Resolution:** These are complementary, not conflicting. ECC hooks operate at the infrastructure level (session persistence, observation capture, formatting). Superpowers skills operate at the methodology level (how to debug, how to write tests). No modification needed -- they layer cleanly.

### Conflict 3: Serena memory vs. ECC instincts vs. CLAUDE.md

**Conflict:** Three different places to store cross-session knowledge creates ambiguity about where to put what.

**Resolution:** Assign clear scopes:
- `CLAUDE.md` / `MEMORY.md`: Project-specific coding rules and current state (auto-loaded, always present)
- ECC instincts: Trigger-action patterns learned from observation (loaded by instinct system, used for behavioral guidance)
- Serena project memories: Architectural knowledge, build commands, conventions (loaded on-demand via MCP tool calls)
- Serena global memories: Cross-project conventions and personal preferences

**Rule of thumb:** If it should always be in context -> `CLAUDE.md`. If it is a behavioral pattern -> ECC instinct. If it is reference knowledge -> Serena memory.

### Conflict 4: Superpowers' hard gates vs. experienced user workflow

**Conflict:** Superpowers mandates brainstorming for every project ("A todo list, a single-function utility, a config change -- all of them") and deleting all code written before tests. Experienced users may find this overly rigid.

**Resolution:** Superpowers includes a safety valve: "User instructions override skills." Add a line to your `CLAUDE.md`:
```
When I prefix a request with "quick:", skip brainstorming and skill gates. Use your judgment.
```
This preserves enforcement by default while allowing experienced users to bypass it explicitly. The key is that bypassing requires deliberate action, not silent rationalization.

---

## 9. Setup Instructions

### Prerequisites
- Claude Code installed and working
- Python 3.10+ with `uv` / `uvx` installed
- Node.js 18+ installed
- Git configured

### Step 1: Install Superpowers

```bash
# Clone the Superpowers repository
git clone https://github.com/superpowers-ai/superpowers.git ~/.claude/superpowers

# Copy skills to Claude Code's skills directory
cp -r ~/.claude/superpowers/skills/ ~/.claude/skills/
```

Verify by opening Claude Code and checking that skills are available. The `using-superpowers` meta-skill should auto-trigger on conversation start.

Note: Follow the actual Superpowers repository README for the most current installation instructions, as the exact directory structure may differ.

### Step 2: Install ECC (Minimal Profile)

```bash
# Clone ECC repository
git clone https://github.com/affaan-m/everything-claude-code.git ~/.claude/ecc

# Install session persistence hooks
# Copy hooks.json to your project or global config
# Set profile to minimal to avoid overhead
export ECC_HOOK_PROFILE=minimal
```

From ECC, install only these components:
1. `scripts/hooks/session-start.js` -- SessionStart hook
2. `scripts/hooks/session-end.js` -- Stop hook for session persistence
3. `scripts/hooks/cost-tracker.js` -- Stop hook for cost tracking
4. `skills/continuous-learning-v2/scripts/instinct-cli.py` -- Instinct management CLI
5. `commands/learn-eval.md` -- Quality-gated learning command
6. `commands/evolve.md` -- Instinct evolution command

Configure `hooks.json` in your project or `~/.claude/`:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "node ~/.claude/ecc/scripts/hooks/session-start.js",
        "timeout": 10000
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "node ~/.claude/ecc/scripts/hooks/session-end.js",
        "timeout": 10000,
        "async": true
      },
      {
        "type": "command",
        "command": "node ~/.claude/ecc/scripts/hooks/cost-tracker.js",
        "timeout": 10000,
        "async": true
      }
    ]
  }
}
```

### Step 3: Install Serena MCP

```bash
# Test Serena installation
uvx --from git+https://github.com/oraios/serena serena --help
```

Add to your project's `.mcp.json` or `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from", "git+https://github.com/oraios/serena",
        "serena", "start-mcp-server",
        "--context", "claude-code",
        "--project", "."
      ]
    }
  }
}
```

On first use, Serena will auto-onboard the project (scan structure, document commands, create initial memories in `.serena/memories/`).

### Step 4: Configure CLAUDE.md

Create or update your project's `CLAUDE.md` with these sections:

```markdown
# Project: [Your Project Name]

## Skill System
- Superpowers skills are installed and should auto-trigger per the using-superpowers meta-skill
- When I prefix a request with "quick:", skip brainstorming and skill gates

## Memory Protocol
- Use Serena write_memory for architectural decisions and conventions
- Project-specific rules belong in this file (CLAUDE.md)
- Cross-project patterns: use /learn-eval to create instincts

## Code Standards
[Your project-specific coding standards here]

## Architecture
[Your project architecture notes here]
```

### Step 5: Set Up Obsidian (Optional, for Cross-Project Knowledge)

1. Create a dedicated developer vault: `~/Developer-Vault/`
2. Install Obsidian (free) and open the vault
3. Create basic structure: `knowledge/`, `projects/`, `research/`, `inbox/`
4. Write a `CLAUDE.md` in the vault root with vault conventions
5. For now, access via direct filesystem: run `claude` from the vault directory when doing cross-project work
6. Add MCP server later when the vault exceeds ~100 notes

### Step 6: Verify the Setup

Start a new Claude Code session in a project directory and verify:
1. Previous session summary appears at start (ECC session persistence)
2. Ask "what skills are available" -- Superpowers skills should be listed
3. Ask "find the definition of [symbol]" -- Serena should provide LSP-powered results
4. Try a debugging task -- Superpowers' systematic-debugging skill should auto-trigger with Iron Law enforcement

---

## 10. The Evidence Trail

### "Install Superpowers as base system"
- **Source:** comparison-skills.md Summary Scorecard -- Superpowers wins 7 of 9 categories
- **Source:** comparison-agents.md Overall Assessment -- Superpowers scores 58/70 vs. ECC 48/70 vs. SuperClaude 38/70
- **Key evidence:** "The fundamental differentiator is not what each system tells the AI to do, but how hard each system works to prevent the AI from rationalizing its way out of doing it." (comparison-skills.md)
- **Key evidence:** Superpowers' 7-layer enforcement model was "built by running pressure tests on agents and capturing their actual failure modes" (comparison-agents.md)

### "Add ECC in minimal profile for session persistence"
- **Source:** comparison-memory.md Best Session Persistence verdict -- "ECC's hook-based save/load cycle provides automatic, lightweight (500-700 tokens) context injection"
- **Source:** comparison-memory.md Best Cross-Session Learning verdict -- "ECC is the only system with a deliberate learning pipeline"
- **Key evidence:** ECC session persistence is 10-18x cheaper in tokens than claude-mem while providing automatic context bridging

### "Add Serena MCP for code navigation and memory"
- **Source:** report-serena.md Summary Assessment -- "Semantic code understanding: Excellent; Memory/persistence: Good; MCP integration: Excellent"
- **Key evidence:** Serena's `claude-code` context disables redundant tools, making it "a well-behaved MCP citizen" (comparison-memory.md)
- **Key evidence:** Memory token cost is "Low (on-demand reads)" vs. claude-mem's "~18,500-39,000" (comparison-memory.md token cost table)

### "Skip SuperClaude entirely"
- **Source:** report-superclaude.md Weaknesses -- "Core confidence checker methods are placeholders", "Zero Enforcement Mechanism", "Enormous Token Overhead (~17,500 tokens base)"
- **Source:** comparison-skills.md -- SuperClaude scores lowest or ties for lowest in 7 of 9 categories
- **Source:** comparison-agents.md -- "SuperClaude has creative ideas but executes them primarily through behavioral templates that Claude may or may not follow"
- **Key evidence:** "14 of 20 agents are under 3,100 bytes (~78 lines)" with "minimal differentiation" (report-superclaude.md)

### "Skip Sequential Thinking MCP"
- **Source:** report-sequential-thinking.md Section 6 -- "For Claude specifically, extended thinking is strictly superior for reasoning quality"
- **Key evidence:** "The server stores what the LLM sends and echoes back metadata. It does not evaluate, score, validate, or transform the thoughts in any way." (report-sequential-thinking.md)
- **Key evidence:** "No thought persistence -- server state is in-memory only, lost on restart" (report-sequential-thinking.md)

### "Skip claude-mem"
- **Source:** report-claude-mem.md Section 10 -- "For most users: No" when asked if it is better than built-in memory
- **Key evidence:** "Running a second Claude instance as an observer for every tool use roughly doubles the token consumption" (comparison-memory.md)
- **Key evidence:** "110 open issues" and "Bun runtime required" and "ChromaDB dependency is fragile" (report-claude-mem.md)

### "Use Obsidian for cross-project knowledge"
- **Source:** comparison-memory.md Best Knowledge Management verdict -- "Obsidian provides the richest knowledge infrastructure"
- **Source:** report-obsidian.md -- "developers report finding forgotten solutions 60-70% faster when AI can traverse wikilink connections"
- **Key evidence:** "A vault is just a directory of markdown files. It outlives any AI tool, any editor, any workflow system." (comparison-memory.md)

### "Superpowers' enforcement model is the key differentiator"
- **Source:** comparison-skills.md Key Insight -- "Superpowers is the only system that systematically addresses LLM compliance psychology with empirically-derived anti-rationalization mechanisms"
- **Source:** report-superpowers.md Enforcement Model -- Research citation: "Meincke et al. (2025) tested 7 persuasion principles with N=28,000 AI conversations. Persuasion techniques more than doubled compliance rates (33% to 72%, p < .001)"
- **Key evidence:** The anti-rationalization tables "were developed by running pressure tests on agents and capturing their actual rationalizations verbatim" (report-superpowers.md)

### "ECC and Superpowers are complementary, not competing"
- **Source:** comparison-agents.md -- "The infrastructure advantages of ECC (hooks, learning, persistence) and the breadth advantages of SuperClaude address orthogonal concerns -- they make the systems more featureful but do not make their agent architectures better"
- **Key evidence:** Superpowers has "No hooks, no session persistence, no continuous learning system" (comparison-agents.md) while ECC has "no anti-rationalization mechanisms" (report-ecc.md) -- each fills the other's gap
