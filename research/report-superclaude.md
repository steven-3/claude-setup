# SuperClaude Framework Analysis

## Executive Summary

SuperClaude Framework (v4.2.0, 21,558 stars, 1,805 forks) is a meta-programming configuration system that transforms Claude Code through behavioral instruction injection via markdown files installed as slash commands. Its philosophy is "structured development through prompt engineering" -- it does NOT modify Claude Code's runtime but instead provides elaborate system prompts that guide Claude's behavior when users invoke `/sc:*` commands. The framework's strongest point is its comprehensive PDCA (Plan-Do-Check-Act) workflow methodology centered around a PM Agent that orchestrates sub-agents, with genuine innovation in its confidence-checking pre-implementation gates and anti-hallucination protocols. Its weakest point is that the vast majority of its "30 commands and 16 agents" are moderate-depth behavioral templates (markdown files averaging 3-5KB) that describe *what Claude should do* rather than enforcing it through programmatic means -- the actual Python execution code has significant placeholder implementations.

## Command Inventory

All commands are markdown files in `src/superclaude/commands/`. Size in bytes; approximate line count = bytes/40.

| Command | Bytes | ~Lines | Depth (1-5) | Enforcement | Description |
|---------|-------|--------|-------------|-------------|-------------|
| pm.md | 20,962 | ~524 | 5 | Strong gates, PDCA cycle, anti-patterns | PM Agent orchestrator: session lifecycle, sub-agent delegation, error investigation, memory schema |
| recommend.md | 32,488 | ~812 | 3 | Pattern matching only | Keyword-to-command recommendation engine with multi-language support (Turkish/English) |
| spec-panel.md | 18,301 | ~458 | 4 | Multi-expert review structure | Simulated expert panel (Wiegers, Adzic, Cockburn, Fowler, Nygard, etc.) for spec review |
| help.md | 8,196 | ~205 | 2 | None (reference doc) | Framework help and command listing |
| brainstorm.md | 5,657 | ~141 | 3 | Boundary: "STOP AFTER REQUIREMENTS DISCOVERY" | Socratic dialogue for requirements discovery, multi-persona orchestration |
| workflow.md | 5,155 | ~129 | 3 | Boundary: "STOP AFTER PLAN CREATION" | Implementation workflow generation from PRDs |
| task.md | 4,862 | ~122 | 3 | TodoWrite integration | Hierarchical task management with memory schema |
| implement.md | 4,772 | ~119 | 3 | Completion criteria checklist | Feature implementation with persona activation and MCP integration |
| estimate.md | 4,526 | ~113 | 3 | Multi-persona estimation | Development estimation with architect + performance + PM personas |
| improve.md | 4,514 | ~113 | 3 | Iterative loop with gates | Code improvement with quality validation |
| spawn.md | 4,351 | ~109 | 3 | Boundary: "STOP AFTER TASK DECOMPOSITION" | Meta-system task orchestration, Epic->Story->Task breakdown |
| troubleshoot.md | 4,307 | ~108 | 3 | --fix flag gate, diagnosis-first | Issue diagnosis with mandatory root cause analysis before fixes |
| cleanup.md | 4,113 | ~103 | 3 | Auto-fix vs approval-required split | Code cleanup with safety thresholds |
| reflect.md | 3,957 | ~99 | 3 | Serena MCP reflection tools | Task reflection and validation using Serena analysis |
| task.md (index) | 3,835 | ~96 | 2 | Basic indexing | Project indexing and knowledge management |
| explain.md | 3,789 | ~95 | 2 | None | Code explanation with multiple depth levels |
| research.md | 3,782 | ~95 | 3 | Boundary: "STOP AFTER RESEARCH REPORT" | Deep web research with adaptive planning, multi-hop reasoning |
| business-panel.md | 3,719 | ~93 | 3 | Boundary: "SYNTHESIS OUTPUT ONLY" | Multi-expert business analysis (Christensen, Porter, Drucker, etc.) |
| select-tool.md | 3,717 | ~93 | 3 | Complexity scoring matrix | Intelligent MCP tool selection between Serena and Morphllm |
| save.md | 3,680 | ~92 | 2 | Serena MCP dependency | Session context persistence to Serena memory |
| design.md | 3,579 | ~89 | 2 | Boundary: design only, no code | System and component design specification |
| load.md | 3,575 | ~89 | 2 | Serena MCP dependency | Project context loading from Serena memory |
| analyze.md | 3,537 | ~88 | 2 | Analysis-only, no modifications | Multi-domain code analysis (quality, security, performance, architecture) |
| build.md | 3,383 | ~85 | 2 | None | Build, compile, package projects |
| document.md | 3,286 | ~82 | 2 | None | Documentation generation (inline, external, API, guides) |
| test.md | 3,088 | ~77 | 2 | Playwright MCP for e2e | Test execution with coverage and quality reporting |
| agent.md | 2,802 | ~70 | 4 | Confidence gate >=0.90 | SC Agent session controller with startup checklist, helper orchestration |
| index-repo.md | 2,745 | ~69 | 2 | Freshness check (7-day) | Repository indexing with PROJECT_INDEX.md generation |
| sc.md | 2,654 | ~66 | 2 | None | Framework info and status |
| git.md | 2,476 | ~62 | 2 | None | Git workflow helpers |

## Agent Inventory

All agents are markdown files in `src/superclaude/agents/`. There are 20 files but some are duplicates/variants.

| Agent | Bytes | Domain | Activation | Depth (1-5) | Description |
|-------|-------|--------|------------|-------------|-------------|
| pm-agent | 22,307 | Meta/Orchestration | Auto (session start), `/sc:pm` | 5 | PDCA lifecycle, session persistence, sub-agent delegation, self-improvement |
| socratic-mentor | 12,061 | Education | Manual `@agent-mentor` | 4 | Socratic method teaching with Clean Code, Design Patterns, TDD book knowledge |
| business-panel-experts | 9,822 | Business Strategy | `/sc:business-panel` | 4 | 9 business thought leaders (Christensen, Porter, etc.) with YAML persona specs |
| deep-research-agent | 4,702 | Research | `/sc:research` | 3 | Adaptive planning, multi-hop reasoning, evidence chains |
| python-expert | 3,127 | Python Dev | Auto (Python files) | 3 | Production Python: SOLID, TDD, 95%+ coverage, security |
| security-engineer | 3,064 | Security | Auto (security keywords) | 3 | OWASP Top 10, threat modeling, zero-trust |
| root-cause-analyst | 3,022 | Debugging | Auto (complex debugging) | 3 | Evidence-based investigation, hypothesis testing |
| requirements-analyst | 2,977 | Analysis | Auto (ambiguous requests) | 2 | Requirements discovery, PRD creation, stakeholder analysis |
| learning-guide | 2,982 | Education | Manual | 2 | Progressive learning path design, concept explanation |
| refactoring-expert | 2,946 | Code Quality | Auto (refactoring requests) | 2 | SOLID principles, incremental improvement, safe transformation |
| technical-writer | 2,847 | Documentation | Auto (doc requests) | 2 | Audience-focused documentation, accessibility |
| quality-engineer | 2,787 | Testing | Auto (testing contexts) | 2 | Test strategy, edge case detection, risk-based testing |
| performance-engineer | 2,700 | Performance | Auto (performance keywords) | 2 | Measure-first optimization, Core Web Vitals, profiling |
| system-architect | 2,580 | Architecture | Auto (architecture contexts) | 2 | 10x growth design, dependency management, pattern selection |
| devops-architect | 2,534 | DevOps | Auto (infrastructure contexts) | 2 | CI/CD, IaC, observability, container orchestration |
| frontend-architect | 2,402 | Frontend | Auto (UI contexts) | 2 | WCAG 2.1, Core Web Vitals, responsive design, component systems |
| backend-architect | 2,346 | Backend | Auto (backend contexts) | 2 | API design, database architecture, fault tolerance |
| repo-index | 1,454 | Discovery | `/sc:agent` session start | 3 | Repository structure scanning, PROJECT_INDEX generation |
| self-review | 1,412 | Quality | Post-implementation | 3 | 4 mandatory self-check questions, reflexion pattern |
| deep-research | 1,373 | Research | `@deep-research` | 2 | Lightweight research agent variant |

**Agent dispatch method**: Agents are activated through keyword matching in RULES.md: security keywords trigger security-engineer, `.py` files trigger python-expert, etc. The PM Agent auto-activates on session start (claimed). Users can manually override with `@agent-[name]` prefix. There is no programmatic dispatch -- it relies entirely on Claude's contextual recognition of the markdown instructions.

**Agent coordination**: The PM Agent claims to orchestrate all other agents as sub-agents. In practice, coordination is described through markdown behavioral instructions, not code. Agents do not communicate with each other programmatically.

## Core Capability Deep-Dives

### Debugging

**Depth: 3/5**

The troubleshooting command (`troubleshoot.md`, 4,307 bytes) and root-cause-analyst agent (`root-cause-analyst.md`, 3,022 bytes) provide the debugging methodology.

**Enforcement**: The `--fix` flag gate is the strongest enforcement mechanism:

> **DIAGNOSE FIRST - FIXES REQUIRE `--fix` FLAG**
> This command is DIAGNOSIS-FIRST by default.
> **Default behavior (no `--fix` flag)**: Diagnose the issue, Identify root cause, Propose solution options, **STOP and present findings to user** - do not apply any fixes
> **With `--fix` flag**: After diagnosis, prompt user for confirmation before applying. Apply fix only after user explicitly approves.

The PM Agent's self-correcting execution section is the deepest debugging content in the framework:

> **Never retry the same approach without understanding WHY it failed.**
> Anti-Patterns: "Error occurred. Let me try again." / "Retry: 1st time... 2nd time... 3rd time..." / "Timeout so let me increase wait time" (ignoring root cause)
> Correct Patterns: "Error occurred. Check official documentation." / "Root cause: environment variable not set. Why needed? Understand the spec."

**Key limitation**: No automated tooling for debugging -- entirely prompt-based behavioral guidance.

### TDD/Testing

**Depth: 2/5**

The test command (`test.md`, 3,088 bytes) is surprisingly thin for a testing-focused framework. It primarily describes test discovery and execution patterns:

> **Behavioral Flow**: 1. Discover: Categorize available tests 2. Configure: Set up test environment 3. Execute: Run tests with monitoring 4. Analyze: Generate coverage reports 5. Report: Provide actionable recommendations

The Python expert agent mentions TDD:

> **Testing Excellence**: TDD approach, unit/integration/property-based testing, 95%+ coverage, mutation testing

However, there is NO command that generates tests. The `test.md` command explicitly states:

> **Will Not**: Generate test cases or modify test framework configuration

TDD is mentioned as a principle but not enforced. The confidence checker skill is the closest to enforcement:

> Pre-implementation confidence assessment (>=90% required). Use before starting any implementation.

The actual Python pytest plugin (`src/superclaude/pytest_plugin.py`) provides fixtures for confidence checking, self-check, and reflexion patterns -- this is real code, not just prompts. But the core confidence methods are placeholders:

From TASK.md: "Core confidence checker methods are placeholders: `_no_duplicates()`, `_architecture_compliant()`, `_has_oss_reference()`, `_root_cause_identified()`"

### Planning/Design

**Depth: 4/5**

Planning is the framework's second strongest area after the PM Agent. The workflow command (`workflow.md`, 5,155 bytes) generates implementation plans, and the design command (`design.md`, 3,579 bytes) handles architecture.

The PM Agent's PDCA cycle is the most structured planning system:

> 1. Plan (Hypothesis): write_memory("plan", goal_statement), Create docs/temp/hypothesis-YYYY-MM-DD.md, Define what to implement and why
> 2. Do (Experiment): TodoWrite for task tracking, write_memory("checkpoint", progress) every 30min
> 3. Check (Evaluation): think_about_task_adherence(), Assess against goals
> 4. Act (Improvement): Success -> docs/patterns/, Failure -> docs/mistakes/

**Enforcement**: Strong boundary commands. The workflow command explicitly states:

> **STOP AFTER PLAN CREATION** - This command produces an IMPLEMENTATION PLAN ONLY - no code execution.
> **Explicitly Will NOT**: Execute any implementation tasks, Write or modify code, Create files (except the workflow plan document)

The brainstorm command has similar gates:

> **STOP AFTER REQUIREMENTS DISCOVERY** - Explicitly Will NOT: Create architecture diagrams, Generate implementation code, Make architectural decisions

### Code Review

**Depth: 3/5**

The self-review agent (`self-review.md`, 1,412 bytes) and spec-panel command (`spec-panel.md`, 18,301 bytes) handle review.

Self-review runs 4 mandatory questions:

> 1. Tests/validation executed? (include command + outcome)
> 2. Edge cases covered? (list anything intentionally left out)
> 3. Requirements matched? (tie back to acceptance criteria)
> 4. Follow-up or rollback steps needed?

The spec-panel simulates 10 industry experts (Karl Wiegers, Gojko Adzic, Alistair Cockburn, Martin Fowler, Michael Nygard, Sam Newman, Gregor Hohpe, Lisa Crispin, Janet Gregory, Kelsey Hightower) reviewing specifications:

> **KARL WIEGERS**: "The requirement 'SHALL handle failures gracefully' lacks specificity. What constitutes graceful handling?"
> **MICHAEL NYGARD**: "Building on Karl's point, we need specific failure modes: network timeouts, service unavailable, rate limiting."
> **GOJKO ADZIC**: "Let's make this concrete with examples: Given: Service timeout after 30 seconds, When: Circuit breaker activates, Then: Return cached response within 100ms"

This is creative and detailed but entirely simulated through prompt engineering.

### Implementation/Execution

**Depth: 3/5**

The implement command (`implement.md`, 4,772 bytes) coordinates work through persona activation:

> **Context Detection**: Framework/tech stack -> appropriate persona and MCP activation
> **Multi-Persona Coordination**: Frontend + Backend + Security -> comprehensive solutions

The agent command (`agent.md`, 2,802 bytes) is more interesting as the actual session controller:

> 1. Clarify scope: Confirm success criteria, blockers, and constraints
> 2. Plan investigation: Use parallel tool calls where possible
>    - @confidence-check skill (pre-implementation score >=0.90 required)
>    - @deep-research agent (web/MCP research)
>    - @repo-index agent (repository structure + file shortlist)
>    - @self-review agent (post-implementation validation)
> 3. Iterate until confident: Track confidence from skill results; do not implement below 0.90

The confidence gate at 0.90 is the strongest enforcement mechanism in the implementation flow.

The parallel execution engine (`src/superclaude/execution/parallel.py`) is real Python code implementing Wave->Checkpoint->Wave patterns with ThreadPoolExecutor. This is one of the few pieces of actual executable infrastructure.

### Brainstorming/Ideation

**Depth: 3/5**

The brainstorm command (`brainstorm.md`, 5,657 bytes) uses Socratic dialogue methodology:

> **Socratic Dialogue**: Question-driven exploration -> systematic requirements discovery
> **Multi-Domain Analysis**: Cross-functional expertise -> comprehensive feasibility assessment

The business-panel system is the most creative ideation tool, simulating 9 business thought leaders with distinct frameworks:

> **Clayton Christensen**: "What job is the customer hiring this to do?" (Disruption Theory)
> **Michael Porter**: "If successful, what prevents competitive copying?" (Five Forces)
> **Nassim Nicholas Taleb**: Risk Management, Antifragility
> **Donella Meadows**: Systems Thinking, Leverage Points

Three analysis phases: Discussion (collaborative), Debate (adversarial), Socratic Inquiry (question-driven). This is genuinely creative prompt engineering.

## Architecture

### How Commands Are Loaded

Commands are installed as markdown files to `~/.claude/commands/` via `superclaude install`. Claude Code's native slash command system loads them. There is NO dynamic loading -- all installed commands are available in every session. The `hooks.json` file references a `session-init.sh` script that runs on session start:

```json
{
  "hooks": {
    "SessionStart": [{ "type": "command", "command": "./scripts/session-init.sh", "timeout": 10 }]
  }
}
```

This script only prints git status and service availability -- it does not load commands dynamically.

### Estimated Token Overhead

**Core files always loaded by Claude Code at session start**:
- CLAUDE.md: 9,501 bytes (~237 lines)
- PLANNING.md: 11,936 bytes (~298 lines)
- KNOWLEDGE.md: 14,652 bytes (~366 lines)
- TASK.md: 9,707 bytes (~243 lines)
- Core RULES.md: 16,132 bytes (~403 lines)
- Core PRINCIPLES.md: 2,573 bytes (~64 lines)
- Core FLAGS.md: 5,457 bytes (~136 lines)

**Subtotal for always-loaded context**: ~69,958 bytes (~1,747 lines, ~17,500 tokens)

**Per-command overhead**: Each command invocation loads its markdown file (avg ~4KB, ~1,000 tokens). Complex commands like pm.md add ~5,250 tokens.

**Per-agent overhead**: Agent definitions average ~3KB (~750 tokens each).

**Total framework overhead estimate**: Base context of ~17,500 tokens plus ~1,000-5,000 tokens per command invocation. The PM Agent alone (command + agent definition) adds ~10,800 tokens.

**Risk**: At 17,500 base tokens, the framework consumes a meaningful portion of Claude's context window before any user interaction begins. With mode files and agent definitions, the active context can easily reach 25,000+ tokens.

### Auto-Triggering

The framework claims auto-triggering in several places:

1. **PM Agent**: Claims "ALWAYS activates to restore context" at session start via Serena MCP memory
2. **Session hook**: `session-init.sh` runs automatically via `hooks.json`
3. **Agent auto-selection**: RULES.md describes keyword-based agent activation

However, the auto-triggering relies entirely on:
- Claude Code reading the `hooks.json` and running `session-init.sh` (lightweight, confirmed working)
- Claude Code reading CLAUDE.md/RULES.md and following the behavioral instructions (depends on Claude's compliance with prompt instructions)
- Serena MCP being installed and functional (optional dependency)

There is NO runtime code that forces agent activation. It is 100% prompt-based behavioral suggestion. Whether Claude actually follows the "ALWAYS activate PM Agent" instruction depends on Claude's own judgment.

### Session Persistence

Session persistence depends on **Serena MCP** being installed:

- `write_memory()` / `read_memory()` / `list_memories()` calls to Serena
- Memory key schema: `session/context`, `plan/[feature]/hypothesis`, `learning/patterns/[name]`, etc.
- The `/sc:save` and `/sc:load` commands wrap Serena memory operations
- Without Serena, session persistence is limited to file-based documentation in `docs/` directories

The `docs/memory/` directory contains examples of persisted session data, reflexion patterns, and workflow metrics.

### MCP Coordination: select-tool

The `select-tool.md` command describes an intelligent routing system between Serena and Morphllm MCPs:

> **Complexity Thresholds**: Score >0.6 -> Serena, Score <0.4 -> Morphllm, 0.4-0.6 -> Feature-based
> **Direct Mapping**: Symbol operations -> Serena, Pattern edits -> Morphllm, Memory operations -> Serena
> **Fallback Strategy**: Serena -> Morphllm -> Native tools degradation chain

This is entirely described through markdown behavioral instructions -- there is no Python code implementing the scoring matrix. The `select-tool` command's effectiveness depends on Claude reading and following the decision rules.

## Unique Strengths

1. **PDCA Cycle Integration**: The PM Agent's Plan-Do-Check-Act methodology is genuinely sophisticated, with structured memory schemas, checkpoint intervals, hypothesis documentation, and mistake recording. This is more structured than most prompt engineering frameworks.

2. **Anti-Hallucination Protocol**: The "Four Questions" and "Seven Red Flags" system is well-designed:
   - "Tests pass" without showing output is flagged
   - "Everything works" without evidence is flagged
   - "Probably works" language is explicitly forbidden

3. **Confidence Gate**: The 0.90 threshold before implementation is a genuine innovation. The `@confidence-check` skill with 5 weighted criteria (no duplicates 25%, architecture compliance 25%, official docs 20%, OSS references 15%, root cause identified 15%) provides structured pre-work validation.

4. **Command Boundary Enforcement**: Nearly every command has explicit "STOP AFTER" boundaries preventing scope creep:
   - brainstorm: STOP AFTER REQUIREMENTS DISCOVERY
   - workflow: STOP AFTER PLAN CREATION
   - research: STOP AFTER RESEARCH REPORT
   - troubleshoot: DIAGNOSE FIRST, fixes require --fix flag

5. **Expert Panel Simulations**: The spec-panel (10 software engineering experts) and business-panel (9 business thought leaders) are creative applications of multi-persona simulation that go beyond typical prompt engineering.

6. **Parallel Execution Engine**: The `parallel.py` module is real Python code with ThreadPoolExecutor, dependency graph analysis, and Wave->Checkpoint->Wave patterns. Claims 3.5x speedup.

7. **Bilingual/Multilingual Design**: Japanese workflow terminology (PDCA phases in Japanese), Turkish language support in recommend command, multi-language READMEs (EN, ZH, JA, KR).

8. **Self-Correcting Error Culture**: The "Zero Tolerance for Dismissal" policy on warnings is strong:
   > "Warning Detected: 1. NEVER dismiss with 'probably not important'. 2. ALWAYS investigate."

## Honest Weaknesses

1. **Placeholder Implementations**: The core confidence checker methods (`_no_duplicates()`, `_architecture_compliant()`, `_has_oss_reference()`, `_root_cause_identified()`) are acknowledged placeholders in TASK.md. The Python code that should power the framework's most important feature is incomplete.

2. **Zero Enforcement Mechanism**: Every behavioral instruction relies on Claude voluntarily following markdown prompts. There are no programmatic guards, no runtime checks, no CI gates. If Claude decides to skip the confidence check or ignore the "STOP AFTER" boundary, nothing prevents it.

3. **Enormous Token Overhead**: The base context (~17,500 tokens) before any work begins is substantial. With the PM Agent, mode files, and agent definitions, active overhead can reach 25,000+ tokens -- roughly 12-25% of Claude's context window consumed by framework instructions alone.

4. **Most Commands Are Templates**: Of 30 commands, only 3-4 (pm, spec-panel, recommend, agent) have genuine depth. The remaining 26 follow a nearly identical template: Triggers, Usage, Behavioral Flow (5 steps), MCP Integration, Tool Coordination, Examples, Boundaries. Many could be collapsed into parameterized versions of the same command.

5. **Most Agents Are Thin**: Of 20 agent files, 14 are under 3,100 bytes (~78 lines). They define a "Behavioral Mindset" paragraph, "Focus Areas" list, and "Key Actions" list. The actual differentiation between agents like "backend-architect" and "system-architect" is minimal.

6. **MCP Dependency Without Fallback**: Many features require specific MCP servers (Serena for persistence, Tavily for research, Context7 for docs, Playwright for testing). Without these, the framework degrades significantly, but the graceful degradation paths are poorly documented.

7. **No Test Coverage for Framework Itself**: TASK.md acknowledges "Current: 0% (tests just created)" for test coverage. The framework that preaches 80%+ coverage and TDD has minimal tests of its own code. The test files exist but are described as recently created.

8. **Session Persistence is Aspirational**: The elaborate Serena MCP memory schema (session/context, plan/[feature]/hypothesis, etc.) is beautifully designed but requires Serena MCP to be installed and running. Without it, the PM Agent's cross-session memory is just documentation files.

9. **Duplicate Content**: The `plugins/superclaude/` and `src/superclaude/` directories contain identical files (commands, agents, modes). This doubles the repository size without adding functionality. The plugins directory is labeled "v5.0 - NOT ACTIVE YET."

10. **v5.0 Plugin System is Vaporware**: The TypeScript plugin system, marketplace, and project-local plugin detection are described in detail but do not exist. Issue #419 tracks this.

## Raw Evidence

### Key Quote: Anti-Hallucination Protocol (KNOWLEDGE.md)
```
**The Four Questions**:
1. Are all tests passing? -> REQUIRE actual output
2. Are all requirements met? -> LIST each requirement
3. No assumptions without verification? -> SHOW documentation
4. Is there evidence? -> PROVIDE test results, code changes, validation

**Red flags that indicate hallucination**:
- "Tests pass" (without showing output)
- "Everything works" (without evidence)
- "Implementation complete" (with failing tests)
- Skipping error messages
- Ignoring warnings
- "Probably works" language
```
File: `KNOWLEDGE.md` (14,652 bytes)

### Key Quote: Confidence Gate (agent.md)
```
3. **Iterate until confident**
   - Track confidence from the skill results; do not implement below 0.90.
   - Escalate to the user if confidence stalls or new context is required.
```
File: `src/superclaude/commands/agent.md` (2,802 bytes)

### Key Quote: Self-Correcting Error Protocol (pm.md)
```
Anti-Patterns (absolutely forbidden):
  "Error occurred. Let me try again."
  "Retry: 1st time... 2nd time... 3rd time..."
  "Timeout so let me increase wait time" (ignoring root cause)
  "Warning exists but it works so OK" (future technical debt)

Correct Patterns (required):
  "Error occurred. Check official documentation."
  "Root cause: environment variable not set. Why needed? Understand the spec."
  "Solution: Add to .env + implement startup validation."
  "Learning: Next time execute environment variable check first."
```
File: `src/superclaude/commands/pm.md` (20,962 bytes)

### Key Quote: Command Boundaries (brainstorm.md)
```
**STOP AFTER REQUIREMENTS DISCOVERY**
This command produces a REQUIREMENTS SPECIFICATION ONLY.
**Explicitly Will NOT**:
- Create architecture diagrams or system designs (use /sc:design)
- Generate implementation code (use /sc:implement)
- Make architectural decisions
- Design database schemas or API contracts
- Create technical specifications beyond requirements
```
File: `src/superclaude/commands/brainstorm.md` (5,657 bytes)

### Key Quote: Placeholder Admission (TASK.md)
```
### 1. Complete Placeholder Implementations
**Status**: TODO
**File**: src/superclaude/pm_agent/confidence.py
**Lines**: 144, 162, 180, 198

**Issue**: Core confidence checker methods are placeholders:
- _no_duplicates() - Should search codebase with Glob/Grep
- _architecture_compliant() - Should read CLAUDE.md for tech stack
- _has_oss_reference() - Should search GitHub for implementations
- _root_cause_identified() - Should verify problem analysis

**Impact**: Confidence checking not fully functional
```
File: `TASK.md` (9,707 bytes)

### Key Quote: Token Overhead Awareness (KNOWLEDGE.md)
```
| Task Type | Typical Tokens | With PM Agent | Savings |
|-----------|---------------|---------------|---------|
| Typo fix | 200-500 | 200-300 | 40% |
| Bug fix | 2,000-5,000 | 1,000-2,000 | 50% |
| Feature | 10,000-50,000 | 5,000-15,000 | 60% |
| Wrong direction | 50,000+ | 100-200 (prevented) | 99%+ |
```
File: `KNOWLEDGE.md` (14,652 bytes)

### Key Quote: RULES.md Enforcement System
```
**Rule Priority System**
- RED CRITICAL: Security, data safety, production breaks - Never compromise
- YELLOW IMPORTANT: Quality, maintainability, professionalism - Strong preference
- GREEN RECOMMENDED: Optimization, style, best practices - Apply when practical

**Conflict Resolution Hierarchy**
1. Safety First: Security/data rules always win
2. Scope > Features: Build only what's asked > complete everything
3. Quality > Speed: Except in genuine emergencies
4. Context Matters: Prototype vs Production requirements differ
```
File: `src/superclaude/core/RULES.md` (16,132 bytes)

### Key Quote: Hooks System (hooks.json)
```json
{
  "hooks": {
    "SessionStart": [
      { "type": "command", "command": "./scripts/session-init.sh", "timeout": 10 }
    ]
  }
}
```
File: `src/superclaude/hooks/hooks.json` (227 bytes)

### Repository Statistics
- Stars: 21,558 | Forks: 1,805
- Created: 2025-06-22 | Last updated: 2026-03-17
- Default branch: master
- Total command files: 30 markdown files (~157KB total)
- Total agent files: 20 markdown files (~84KB total)
- Total mode files: 7 markdown files (~27KB total)
- Core rules/principles: 5 files (~50KB total)
- Python source code: ~22 files in src/superclaude/
- Total repository context (all markdown behavioral instructions): ~318KB (~80,000 tokens)
