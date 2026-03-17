# Agent Architecture Comparison

## 1. Agent Count and Domain Coverage

| Dimension | SuperClaude | Superpowers | ECC |
|-----------|-------------|-------------|-----|
| Named agents | 20 | 14 skills (some with subagent prompts) | 25 |
| Distinct roles | ~16 (4 duplicates/variants) | ~8 core roles + meta-skills | 25 (many language-specific) |
| Domain breadth | Wide: PM, security, frontend, backend, DevOps, research, education, business strategy | Narrow-deep: debugging, TDD, planning, implementation, code review, brainstorming | Wide: planning, architecture, review, 14 language-specific reviewers/resolvers, learning, ops |
| Depth distribution | 1 at depth 5, 1 at depth 4, 4 at depth 3, 14 at depth 2 | 5 skills at depth 5, 3 at depth 4, 3 at depth 3, 1 at depth 2 | 3 at depth 4, 12 at depth 3, 8 at depth 2, 2 at depth 1 |

**Verdict**: SuperClaude has the widest domain coverage (business panels, education mentors, DevOps). ECC has the most named agents but many are thin language-specific variants. Superpowers has the fewest agents but concentrates depth where it matters -- 5 of its 14 skills score 5/5, while SuperClaude has only 1 agent at depth 5 and ECC has zero at depth 5. **Superpowers leads on depth concentration. ECC leads on raw count. SuperClaude leads on domain breadth.**

## 2. Agent Prompt Quality

Depth scores across core capabilities (taken directly from reports):

| Capability | SuperClaude | Superpowers | ECC |
|------------|-------------|-------------|-----|
| Debugging | 3/5 | 5/5 | 2/5 |
| TDD/Testing | 2/5 | 5/5 | 4/5 |
| Planning | 4/5 | 4/5 | 3/5 |
| Code Review | 3/5 | 4/5 | 4/5 (agent, not command) |
| Implementation | 3/5 | 5/5 | 3/5 |
| Brainstorming | 3/5 | 4/5 | N/A |
| **Average** | **3.0** | **4.5** | **3.2** |

### Quality evidence

**SuperClaude**: Most agents are under 3,100 bytes (~78 lines). 14 of 20 agents follow a near-identical template: "Behavioral Mindset" paragraph, "Focus Areas" list, "Key Actions" list. The report notes the differentiation between agents like "backend-architect" and "system-architect" is minimal. The PM Agent (22,307 bytes, depth 5) is a genuine outlier -- the rest are moderate-depth behavioral templates.

**Superpowers**: Skills contain rationalization tables (8-13 entries each), red-flag lists, Iron Laws, gate functions, and hard gates. The debugging skill alone has 1,251 lines across 11 supporting files including executable scripts, working code examples, and pressure-test scenarios. The TDD skill mandates deleting code written before tests with zero exceptions. Enforcement mechanisms were empirically derived by running pressure tests on agents and capturing their actual rationalizations.

**ECC**: The three core agents (planner 212 lines, architect 211 lines, code-reviewer 237 lines) are genuinely deep with worked examples and checklists. However, the report explicitly notes "no anti-rationalization mechanisms" anywhere in the system -- enforcement relies on "MANDATORY" labels and "CRITICAL" markers alone.

**Verdict**: **Superpowers leads decisively on prompt quality.** Its enforcement model has seven layers (Iron Laws, spirit-vs-letter defense, rationalization tables, red flags, hard gates, gate functions, persuasion-informed design) compared to SuperClaude's boundary commands ("STOP AFTER...") and ECC's severity labels. The empirical testing methodology (write pressure tests, watch agents fail, capture rationalizations, write rebuttals) is unique and produces measurably better enforcement.

## 3. Dispatch Mechanism

| Aspect | SuperClaude | Superpowers | ECC |
|--------|-------------|-------------|-----|
| Primary trigger | Keyword matching in RULES.md | Auto-trigger meta-skill with 1% threshold | Agent `description` field for proactive activation |
| User override | `@agent-[name]` prefix | User instructions override skills | Slash commands invoke specific agents |
| Programmatic dispatch | None -- 100% prompt-based | Skill tool invocation (uses Claude Code's native Skill tool) | Native Claude Code agent frontmatter dispatch |
| Auto-activation | PM Agent claims to always activate; relies on Claude's compliance | "using-superpowers" skill fires every conversation; enforced by rationalization prevention | SessionStart hook loads context; agents activate based on description matches |

### How each actually works

**SuperClaude**: RULES.md describes keyword-to-agent mappings (security keywords trigger security-engineer, `.py` files trigger python-expert). There is no runtime code enforcing this -- it relies entirely on Claude reading the markdown instructions and voluntarily complying. The report states: "There is NO programmatic dispatch -- it relies entirely on Claude's contextual recognition of the markdown instructions."

**Superpowers**: The using-superpowers meta-skill runs at conversation start and establishes a mandatory check: before any response, determine if a skill applies (threshold: 1% chance). The system uses Claude Code's native Skill tool for invocation. The red-flags table catches 12 specific rationalizations for skipping skill checks. The priority order is explicit: process skills first, then implementation skills.

**ECC**: Agents use Claude Code's native frontmatter format with `description` fields that say "Use PROACTIVELY when..." Claude Code's built-in agent dispatch handles activation. Model routing is explicit per agent (opus for planning/architecture, sonnet for review/implementation). This is the most platform-native approach.

**Verdict**: **ECC has the most reliable dispatch** because it uses Claude Code's native agent infrastructure rather than prompt-based suggestions. Superpowers has the most aggressive enforcement of its dispatch rules (12-entry rationalization table, 1% threshold). SuperClaude's dispatch is the weakest -- entirely dependent on prompt compliance with no fallback.

## 4. Multi-Agent Coordination

| Aspect | SuperClaude | Superpowers | ECC |
|--------|-------------|-------------|-----|
| Coordinator | PM Agent (PDCA lifecycle) | Controller in subagent-driven-development | `/orchestrate` command with handoff documents |
| Coordination model | Hub-and-spoke (PM delegates to specialists) | Pipeline (implement -> spec review -> quality review) | Sequential pipeline with handoff documents |
| Inter-agent communication | Markdown behavioral instructions; no programmatic communication | Controller extracts task text and passes to each subagent; subagents do not communicate with each other | Handoff document format with control-plane blocks |
| Failure handling | Self-correcting error protocol in PM Agent; anti-patterns documented | 4-status protocol (DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, BLOCKED) with escalation paths including model upgrades and task decomposition | Not deeply specified; "practical but not deeply prescriptive about how to handle failures" |

### Evidence of coordination depth

**SuperClaude**: The PM Agent's PDCA cycle (Plan-Do-Check-Act) is the most structured coordination model conceptually. It describes checkpoints every 30 minutes, hypothesis documentation, and success/failure archiving to `docs/patterns/` and `docs/mistakes/`. However, the report is explicit: "coordination is described through markdown behavioral instructions, not code. Agents do not communicate with each other programmatically."

**Superpowers**: The subagent-driven-development system is the most detailed implementation. For each task: (1) controller extracts task text (never makes the subagent read the plan file), (2) implementer subagent works with full context, (3) spec reviewer independently verifies, (4) code quality reviewer evaluates. The implementer has an explicit escalation clause: "It is always OK to stop and say 'this is too hard for me.'" BLOCKED status triggers task decomposition. The model selection system routes mechanical tasks to cheap models and architecture tasks to expensive ones.

**ECC**: The `/orchestrate` command describes multi-agent workflows (feature, bugfix, refactor, security) with handoff documents and tmux/worktree integration. It is practical but the report scores it 3/5 depth, noting it is "not deeply prescriptive about how to handle failures."

**Verdict**: **Superpowers leads on multi-agent coordination.** Its pipeline model with explicit status codes, escalation paths, model-aware routing, and the "in over your head" escape clause is the most operationally detailed. SuperClaude's PDCA cycle is conceptually rich but entirely prompt-based. ECC's orchestration is practical but shallow on failure modes.

## 5. Subagent Isolation

| Aspect | SuperClaude | Superpowers | ECC |
|--------|-------------|-------------|-----|
| Clean context? | No. All agents share the same session context. RULES.md + CLAUDE.md + agent definitions are all present simultaneously | Yes. Controller extracts full task text and passes it to each subagent. Subagents receive only their task + prompt template. "Never makes subagent read the plan file." | Partial. Agents have their own frontmatter but share session context. Worktree support provides filesystem isolation. |
| Cross-contamination risk | High. 17,500 base tokens + all mode/agent definitions means agents operate in a context polluted by framework instructions | Low. Each subagent gets a fresh context with only its task and role-specific prompt | Medium. Agents share session context but model routing (opus vs sonnet) provides some natural isolation |
| Context overhead per agent | ~750 tokens per agent definition, but base context is always ~17,500 tokens | Implementer prompt: 113 lines. Spec reviewer: 61 lines. Quality reviewer: 26 lines. Minimal, task-focused | Varies: 35-237 lines per agent. Session context adds 500-700 tokens |

**Verdict**: **Superpowers has the best subagent isolation.** The controller explicitly extracts task text and constructs a purpose-built context for each subagent. Subagents never read the plan file or other agents' outputs directly. This is true isolation. SuperClaude has the worst isolation -- all agents share a massive base context. ECC falls in between, with worktree support providing filesystem isolation but no context isolation.

## 6. Review Systems

| Aspect | SuperClaude | Superpowers | ECC |
|--------|-------------|-------------|-----|
| Review architecture | Single-pass self-review (4 questions) + expert panel simulation | Two-stage pipeline: spec compliance then code quality, each by a separate subagent | Single-pass code-reviewer agent (237 lines) |
| Reviewer independence | Self-review is self-assessment (agent reviews its own work). Spec-panel simulates 10 experts but within the same context | Spec reviewer is explicitly told to distrust the implementer: "Their report may be incomplete, inaccurate, or optimistic. You MUST verify everything independently." | Code-reviewer is a separate agent dispatched by the command, but there is no adversarial framing |
| Anti-rubber-stamp measures | 4 mandatory questions requiring evidence | Distrust mandate + anti-sycophancy enforcement ("DELETE 'Thanks'. State the fix instead.") | "Block commit if CRITICAL or HIGH issues found" -- severity-based gating only |
| Review loop | No iteration documented | Explicit loop: if reviewer finds issues, implementer fixes, reviewer re-reviews until approved. Max 3 spec-review iterations before human escalation | Not documented |

### Evidence

**SuperClaude's self-review** (1,412 bytes) asks 4 questions: tests executed? edge cases covered? requirements matched? follow-up needed? This is a checklist, not adversarial review. The spec-panel (18,301 bytes) simulates 10 experts within a single context -- creative but not actually independent.

**Superpowers' two-stage review** uses physically separate subagents. The spec reviewer gets its own context and is primed to be skeptical. The code quality reviewer only fires after spec compliance passes. The receiving-code-review skill adds anti-sycophancy enforcement that bans performative agreement ("You're absolutely right!", "Great point!", "Excellent feedback!"). This directly targets a documented AI failure mode.

**ECC's code-reviewer** (237 lines, depth 4/5) has good methodology with severity categories and commit-blocking on CRITICAL/HIGH. But the report notes the command itself is only 40 lines -- a dispatch stub. There is no adversarial framing or distrust mechanism.

**Verdict**: **Superpowers leads decisively on review systems.** Two-stage review with adversarial framing (distrust the implementer), anti-sycophancy enforcement, and explicit iteration loops is architecturally superior to self-assessment checklists (SuperClaude) or single-pass severity-gated review (ECC). The separation of spec compliance from code quality is a design insight that neither competitor implements.

## 7. Parallel Execution Capabilities

| Aspect | SuperClaude | Superpowers | ECC |
|--------|-------------|-------------|-----|
| Parallel infrastructure | `parallel.py` with ThreadPoolExecutor, dependency graph analysis, Wave->Checkpoint->Wave patterns. Claims 3.5x speedup | `dispatching-parallel-agents` skill (182 lines). Independence verification before parallel dispatch. Prompt structure requirements for each agent | `/orchestrate` with tmux integration and git worktree isolation. `/multi-plan` with multi-model parallel execution (Codex + Gemini) |
| Independence verification | Dependency graph analysis in Python code | Explicit: verify tasks are independent before parallel dispatch | Worktree-based filesystem isolation; tmux-based process isolation |
| Actual implementation | Real Python code (ThreadPoolExecutor) | Prompt-based (relies on Claude Code's native subagent parallelism) | Real infrastructure (tmux sessions, git worktrees, codeagent-wrapper) |

**Verdict**: **ECC and SuperClaude both have real parallel execution infrastructure** (tmux/worktrees and Python ThreadPoolExecutor respectively). Superpowers relies on the platform's native subagent parallelism with a prompt-based independence check. ECC's approach is more practical (tmux + worktrees = actual process and filesystem isolation), while SuperClaude's is more formally designed (dependency graphs, wave patterns) but has less evidence of real-world use given the placeholder issues elsewhere.

## Overall Assessment

### Scoring Summary

| Dimension | SuperClaude | Superpowers | ECC |
|-----------|-------------|-------------|-----|
| Agent count/coverage | 8/10 | 6/10 | 9/10 |
| Prompt quality (depth scores) | 5/10 | 10/10 | 6/10 |
| Dispatch mechanism | 4/10 | 8/10 | 9/10 |
| Multi-agent coordination | 6/10 | 9/10 | 5/10 |
| Subagent isolation | 3/10 | 10/10 | 6/10 |
| Review systems | 5/10 | 10/10 | 5/10 |
| Parallel execution | 7/10 | 5/10 | 8/10 |
| **Total** | **38/70** | **58/70** | **48/70** |

### Winner: Superpowers

**Superpowers has the best agent architecture**, and it is not close on the dimensions that matter most for autonomous agent quality.

**The decisive advantages are:**

1. **Prompt enforcement depth**: Superpowers is the only system with empirically-derived anti-rationalization mechanisms. Its seven-layer enforcement model (Iron Laws, spirit-vs-letter defense, rationalization tables, red flags, hard gates, gate functions, persuasion-informed design) was built by running pressure tests on agents and capturing their actual failure modes. SuperClaude and ECC both rely on "MANDATORY" labels and "STOP AFTER" boundaries that an LLM can rationalize past. Superpowers preemptively closes rationalizations with specific rebuttals.

2. **Two-stage adversarial review**: The separation of spec compliance review from code quality review, with the spec reviewer explicitly primed to distrust the implementer, is a genuine architectural innovation. Neither SuperClaude (self-review checklist) nor ECC (single-pass severity-gated review) approach this level of review rigor.

3. **Subagent isolation**: Superpowers gives each subagent a clean, purpose-built context. SuperClaude pollutes every agent's context with 17,500+ tokens of base framework instructions. This is not a minor detail -- context pollution degrades agent performance.

4. **Operational depth where it matters**: Five skills at depth 5/5, each with supporting files (debugging has 11 supporting files totaling 1,251 lines). The depth is not spread thin across 20 agents; it is concentrated in the capabilities that determine autonomous execution quality.

**Where Superpowers is weaker:**

- **Domain coverage**: No agents for DevOps, security auditing, or language-specific specialization. ECC's 14 language-specific agents and SuperClaude's business/education panels cover more ground.
- **Parallel execution**: Relies on platform-native subagent parallelism rather than providing its own infrastructure. ECC's tmux/worktree integration is more robust.
- **Platform infrastructure**: No hooks, no session persistence, no continuous learning system. ECC's hook architecture with profile-based controls is genuinely sophisticated engineering. SuperClaude's Serena MCP integration provides session persistence that Superpowers lacks entirely.

**However, these weaknesses do not undermine the core finding.** Agent architecture quality is primarily determined by: (a) how well agents perform their tasks (prompt quality), (b) whether review catches failures (review systems), and (c) whether agents interfere with each other (isolation). On all three, Superpowers leads by a significant margin. The infrastructure advantages of ECC (hooks, learning, persistence) and the breadth advantages of SuperClaude (20 agents, business panels) address orthogonal concerns -- they make the systems more featureful but do not make their agent architectures better.

### Second place: ECC

ECC earns second place for its native platform integration (reliable dispatch via frontmatter), real parallel execution infrastructure (tmux + worktrees), and the continuous learning pipeline (despite being prompt-based, it is well-engineered). Its core trio of agents (planner, architect, code-reviewer) is genuinely deep. Its weakness is the absence of anti-rationalization mechanisms and adversarial review.

### Third place: SuperClaude

SuperClaude has creative ideas (PDCA cycle, expert panel simulations, confidence gate) but executes them primarily through behavioral templates that Claude may or may not follow. The enormous base context overhead (17,500+ tokens), placeholder implementations in core features, and thin agent definitions (14 of 20 under 3,100 bytes) indicate a system optimized for breadth of ambition rather than depth of enforcement. The PM Agent is a genuine standout, but one deep agent does not compensate for 19 shallow ones.
