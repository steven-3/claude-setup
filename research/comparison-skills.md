# Skill-by-Skill Comparison: SuperClaude vs Superpowers vs ECC

**Date**: 2026-03-17
**Method**: Blind judge working solely from standardized analyst reports. No source code was read by the judge.

---

## 1. Debugging

### Depth Scores
- **SuperClaude**: 3/5
- **Superpowers**: 5/5
- **ECC**: 2/5

### Enforcement Mechanisms

**SuperClaude** relies on a `--fix` flag gate and behavioral anti-patterns in the PM Agent:

> "DIAGNOSE FIRST - FIXES REQUIRE `--fix` FLAG"
> Default behavior: Diagnose the issue, Identify root cause, Propose solution options, STOP and present findings to user - do not apply any fixes.

The PM Agent adds anti-pattern guidance:

> Anti-Patterns: "Error occurred. Let me try again." / "Retry: 1st time... 2nd time... 3rd time..."
> Correct Patterns: "Error occurred. Check official documentation." / "Root cause: environment variable not set."

Key limitation noted by the analyst: "No automated tooling for debugging -- entirely prompt-based behavioral guidance."

**Superpowers** implements a mandatory 4-phase process with the Iron Law:

> "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"
> If you haven't completed Phase 1, you cannot propose fixes.

It includes 1,251 lines of supporting material across 11 files: root-cause-tracing (169 lines with backward call-chain tracing), defense-in-depth (122 lines, 4 layers of post-fix validation with working code), condition-based-waiting (115 lines + 158-line TypeScript example), and a `find-polluter.sh` script (63 lines) for bisecting test pollution. The rationalization table has 8 specific excuses with rebuttals. Red flags list contains 12 specific trigger thoughts.

The 3-fix architectural escalation is unique:

> If >= 3: STOP and question the architecture. DON'T attempt Fix #4 without architectural discussion.
> Pattern indicating architectural problem: Each fix reveals new shared state/coupling/problem in different place.

**ECC** scores lowest. The `/build-fix` command is 62 lines:

> "Concise procedural checklist. No anti-rationalization. Covers detection, fixing loop, recovery strategies. Effective but shallow -- a competent developer could draft this in 15 minutes."

Guardrails "suggest stopping after 3 retries" but there are "no mandatory gates."

### Winner: Superpowers

Superpowers wins decisively. It has the only Iron Law with mandatory phase gates, the only rationalization table for debugging, the only supporting technique library with executable code (root-cause tracing, defense-in-depth, condition-based waiting, polluter bisection), and the unique 3-fix architectural escalation. SuperClaude has a reasonable diagnosis-first gate but no anti-rationalization and no supporting techniques. ECC's debugging is a thin checklist.

**Margin**: Large. Not contested.

---

## 2. TDD (Test-Driven Development)

### Depth Scores
- **SuperClaude**: 2/5
- **Superpowers**: 5/5
- **ECC**: 4/5

### Enforcement Mechanisms

**SuperClaude**'s test command (3,088 bytes) explicitly disclaims test generation:

> "Will Not: Generate test cases or modify test framework configuration"

The Python expert agent mentions TDD as a principle ("TDD approach, unit/integration/property-based testing, 95%+ coverage") but TDD is "mentioned as a principle but not enforced." The confidence checker skill is the closest proxy, requiring >= 90% pre-implementation confidence, but its core methods are acknowledged placeholders:

> "Core confidence checker methods are placeholders: `_no_duplicates()`, `_architecture_compliant()`, `_has_oss_reference()`, `_root_cause_identified()`"

**Superpowers** treats any deviation from RED-GREEN-REFACTOR as a hard failure:

> "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"
> Write code before the test? Delete it. Start over.
> No exceptions: Don't keep it as "reference" / Don't "adapt" it while writing tests / Don't look at it / Delete means delete

The spirit-vs-letter defense closes meta-rationalizations:

> "Violating the letter of the rules is violating the spirit of the rules."

The rationalization table has 11 entries including sophisticated rebuttals:

> "Tests after achieve same goals" -> "Tests-after = 'what does this do?' Tests-first = 'what should this do?'"
> "TDD is dogmatic, being pragmatic means adapting" -> "TDD IS pragmatic... 'Pragmatic' shortcuts = debugging in production = slower."

The testing-anti-patterns file (299 lines) adds gate functions -- procedural decision checks:

> BEFORE asserting on any mock element: Ask: "Am I testing real component behavior or just mock existence?" IF testing mock existence: STOP - Delete the assertion or unmock the component

Five specific anti-patterns covered with executable gate functions.

**ECC**'s `/tdd` command is 328 lines with a full worked example:

> "MANDATORY: Tests must be written BEFORE implementation"; 80% coverage requirement.

The analyst calls it "Most detailed core command. Full worked example with RED/GREEN/REFACTOR cycle, edge case list, anti-patterns, integration guidance. The depth comes from the example, not from unique methodology." There is also a `tdd-guide` agent (91 lines, depth 3/5).

### Winner: Superpowers

Superpowers wins clearly. It is the only system with a delete mandate (code written before tests must be deleted, no exceptions), the only one with anti-rationalization tables specifically for TDD (11 entries), the only one with gate functions for testing anti-patterns, and the only one that explicitly closes the "spirit vs letter" loophole. ECC has a solid worked example and mandatory label but no anti-rationalization and no gate functions. SuperClaude essentially does not enforce TDD -- it mentions TDD as a principle and its testing command explicitly refuses to generate tests.

**Margin**: Large between Superpowers and ECC. Enormous between Superpowers and SuperClaude.

---

## 3. Planning / Design Workflow

### Depth Scores
- **SuperClaude**: 4/5
- **Superpowers**: 4/5
- **ECC**: 3/5

### Enforcement Mechanisms

**SuperClaude** has the PDCA (Plan-Do-Check-Act) cycle as its centerpiece:

> 1. Plan (Hypothesis): write_memory("plan", goal_statement), Create docs/temp/hypothesis-YYYY-MM-DD.md
> 2. Do (Experiment): TodoWrite for task tracking, write_memory("checkpoint", progress) every 30min
> 3. Check (Evaluation): think_about_task_adherence(), Assess against goals
> 4. Act (Improvement): Success -> docs/patterns/, Failure -> docs/mistakes/

Strong boundary enforcement:

> "STOP AFTER PLAN CREATION" - This command produces an IMPLEMENTATION PLAN ONLY - no code execution.
> Explicitly Will NOT: Execute any implementation tasks, Write or modify code

The workflow command (5,155 bytes) and design command (3,579 bytes) provide the planning structure. The PM Agent (20,962 bytes) orchestrates with session persistence to Serena MCP.

**Superpowers** has the writing-plans skill (191 lines) with an automated plan review loop:

> Each step is one action (2-5 minutes): "Write the failing test" - step / "Run it to make sure it fails" - step / "Implement the minimal code" - step

The zero-context engineer assumption:

> Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste.

The plan review loop provides automated quality assurance:

> 1. Dispatch a single plan-document-reviewer subagent
> 2. If Issues Found: fix the issues, re-dispatch reviewer for the whole plan
> 3. If Approved: proceed to execution handoff

The reviewer checks: completeness (no TODOs/placeholders), spec alignment, task decomposition, and buildability.

**ECC**'s `/plan` command is 115 lines (depth 3/5):

> "CRITICAL: The planner agent will NOT write any code until you explicitly confirm" -- user confirmation gate.

The real depth is in the `planner` agent (212 lines, depth 4/5) with a worked Stripe example. The `/multi-plan` command (268 lines, depth 4/5) adds multi-model collaborative planning but assumes external tooling (codeagent-wrapper, ace-tool MCP).

### Winner: Tie -- SuperClaude and Superpowers (different strengths)

This is genuinely contested. SuperClaude has the more comprehensive planning *framework* (PDCA cycle with memory persistence, hypothesis documentation, checkpoint intervals, mistake recording). Superpowers has the more *actionable* planning output (2-5 minute granular steps, zero-context engineer assumption, automated plan review loop). SuperClaude's plan is more strategic; Superpowers' plan is more executable. Both have boundary enforcement preventing premature implementation.

If forced to pick one: **Superpowers** has a slight edge because its plan review loop provides automated quality assurance (a subagent checks the plan before execution), while SuperClaude's PDCA cycle relies on the same agent self-checking. But this is close.

**Margin**: Very close. The choice depends on whether you value strategic lifecycle management (SuperClaude) or actionable task decomposition with review (Superpowers).

---

## 4. Code Review

### Depth Scores
- **SuperClaude**: 3/5
- **Superpowers**: 4/5 (combined requesting + receiving)
- **ECC**: 1/5 (command) / 4/5 (agent)

### Enforcement Mechanisms

**SuperClaude** has two review mechanisms. The self-review agent (1,412 bytes) runs 4 mandatory questions:

> 1. Tests/validation executed? (include command + outcome)
> 2. Edge cases covered? (list anything intentionally left out)
> 3. Requirements matched? (tie back to acceptance criteria)
> 4. Follow-up or rollback steps needed?

The spec-panel command (18,301 bytes) simulates 10 industry experts reviewing specifications. Creative but "entirely simulated through prompt engineering."

**Superpowers** has two complementary skills. The requesting-code-review skill (251 lines) dispatches a code reviewer subagent. The receiving-code-review skill (213 lines, depth 5/5) enforces anti-sycophancy:

> NEVER: "You're absolutely right!" / "Great point!" / "Excellent feedback!" / "Let me implement that now" (before verification)
> If you catch yourself about to write "Thanks": DELETE IT. State the fix instead.

The YAGNI check:

> IF reviewer suggests "implementing properly": grep codebase for actual usage. IF unused: "This endpoint isn't called. Remove it (YAGNI)?"

The pushback protocol explicitly requires disagreement when technically warranted, including when the reviewer "lacks full context" or when suggestions "conflict with human partner's architectural decisions."

**ECC**'s `/code-review` command is only 40 lines (depth 1/5): "Extremely thin. Just a bulleted checklist with severity categories." The actual depth lives in the `code-reviewer` agent (237 lines, depth 4/5) which has checklists and anti-patterns but no anti-rationalization mechanisms.

### Winner: Superpowers

Superpowers wins because it addresses both sides of the review process (requesting and receiving), includes the only anti-sycophancy enforcement (explicitly banning performative agreement), the only YAGNI check, and the only pushback protocol. SuperClaude's spec-panel is creative but simulated. ECC's code-reviewer agent is competent but has no mechanism to prevent the agent from rubber-stamping reviews.

The anti-sycophancy enforcement is a genuine innovation that addresses a known AI failure mode no other system tackles.

**Margin**: Moderate. ECC's code-reviewer agent is solid, but Superpowers' receiving-code-review addresses a fundamentally different problem (how to process feedback critically).

---

## 5. Implementation / Code Execution

### Depth Scores
- **SuperClaude**: 3/5
- **Superpowers**: 5/5
- **ECC**: 3/5

### Enforcement Mechanisms

**SuperClaude**'s implement command (4,772 bytes) coordinates through persona activation and MCP integration. The agent command (2,802 bytes) provides the session controller with a confidence gate:

> Track confidence from skill results; do not implement below 0.90.
> Escalate to the user if confidence stalls or new context is required.

The parallel execution engine (`parallel.py`) is real Python code with ThreadPoolExecutor and Wave->Checkpoint->Wave patterns. The PM Agent orchestrates sub-agents but "coordination is described through markdown behavioral instructions, not code. Agents do not communicate with each other programmatically."

**Superpowers** implements a multi-agent orchestration system with three distinct roles:

> 1. Controller extracts full task text (never makes subagent read the plan file)
> 2. Implementer subagent: implements, tests, commits, self-reviews. Reports DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
> 3. Spec reviewer subagent verifies implementation matches spec (told to distrust the implementer)
> 4. Code quality reviewer subagent evaluates clean code, testing, architecture
> 5. If either reviewer finds issues, implementer fixes and reviewer re-reviews. Loop until approved.

The spec reviewer is explicitly instructed to distrust:

> "The implementer finished suspiciously quickly. Their report may be incomplete, inaccurate, or optimistic. You MUST verify everything independently."

The implementer has an escalation clause:

> "It is always OK to stop and say 'this is too hard for me.' Bad work is worse than no work."

Cost-aware model selection routes mechanical tasks to cheap models and architecture tasks to capable models.

**ECC**'s `/orchestrate` command (231 lines, depth 3/5) describes multi-agent workflows with handoff document format and tmux/worktree integration. "Practical but not deeply prescriptive about how to handle failures." The planner agent (212 lines, depth 4/5) generates plans, but the execution pipeline lacks the multi-stage review loop.

### Winner: Superpowers

Superpowers wins with the most architecturally sophisticated implementation system. The two-stage review (spec compliance then code quality) with mandatory distrust of the implementer is a genuine multi-agent verification pipeline. The four-status escalation protocol (DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED) with specific handling for each status is well-designed. The "it's OK to escalate" clause prevents bad work from silently passing. Cost-aware model selection is pragmatic.

SuperClaude's confidence gate at 0.90 is a good pre-implementation check, and the parallel execution engine is real code, but the agents "do not communicate with each other programmatically." ECC's orchestration command is practical but lacks review gates within the implementation loop.

**Margin**: Large. The two-stage review with mandatory distrust is a structural advantage no other system matches.

---

## 6. Brainstorming / Ideation

### Depth Scores
- **SuperClaude**: 3/5
- **Superpowers**: 4/5
- **ECC**: N/A (no dedicated brainstorming capability)

### Enforcement Mechanisms

**SuperClaude**'s brainstorm command (5,657 bytes) uses Socratic dialogue with multi-persona orchestration:

> Socratic Dialogue: Question-driven exploration -> systematic requirements discovery
> Multi-Domain Analysis: Cross-functional expertise -> comprehensive feasibility assessment

Explicit boundary:

> "STOP AFTER REQUIREMENTS DISCOVERY" - Explicitly Will NOT: Create architecture diagrams, Generate implementation code, Make architectural decisions

The business-panel system simulates 9 business thought leaders:

> Clayton Christensen: "What job is the customer hiring this to do?" (Disruption Theory)
> Michael Porter: "If successful, what prevents competitive copying?" (Five Forces)

Three analysis phases: Discussion (collaborative), Debate (adversarial), Socratic Inquiry (question-driven).

**Superpowers** has a hard gate:

> Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

The anti-pattern for "simple" projects:

> Every project goes through this process. A todo list, a single-function utility, a config change -- all of them. "Simple" projects are where unexamined assumptions cause the most wasted work.

The visual companion system launches a local web server serving HTML mockups during brainstorming with browser-based event capture. The spec review loop adds automated quality assurance with a max of 3 iterations.

**ECC** has no dedicated brainstorming skill or command identified in the report. The planner agent can do design work, but there is no specific brainstorming flow.

### Winner: Superpowers

Superpowers wins for three reasons: (1) the hard gate preventing any implementation before design approval is more rigorous than SuperClaude's "STOP AFTER" boundary, (2) the visual companion is a genuinely novel capability that adds a visual channel to text-based design discussions, and (3) the spec review loop provides automated quality assurance on brainstorming output.

SuperClaude's business-panel with 9 thought leaders and three analysis phases is creative and arguably more intellectually rich, but it is entirely simulated through prompts with no enforcement mechanism beyond "STOP AFTER." Superpowers' hard gate (XML-tagged, applies to every project) is structurally stronger.

**Margin**: Moderate. SuperClaude's business-panel is genuinely creative; Superpowers' enforcement and visual tooling are more practical.

---

## 7. Auto-Trigger / Activation Intelligence

### How Each System Activates

**SuperClaude** claims three auto-trigger mechanisms:
1. PM Agent auto-activates on session start via Serena MCP memory
2. SessionStart hook runs `session-init.sh` (prints git status)
3. Keyword-based agent auto-selection in RULES.md (security keywords -> security-engineer, `.py` files -> python-expert)

The analyst's verdict: "There is NO runtime code that forces agent activation. It is 100% prompt-based behavioral suggestion. Whether Claude actually follows the 'ALWAYS activate PM Agent' instruction depends on Claude's own judgment."

**Superpowers** has the using-superpowers meta-skill that fires at the start of every conversation with a 1% threshold:

> If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

The red flags table catches 12 rationalizations for skipping skills. The priority ordering (process skills first, then implementation skills) and rigid/flexible classification provide structure. The safety valve (user instructions override skills) prevents over-triggering.

**ECC** uses agent `description` fields for proactive activation ("Use PROACTIVELY when..."), model routing per agent, and hook-based lifecycle triggers (SessionStart loads context, PreToolUse/PostToolUse fire observations). The profile system (minimal/standard/strict) controls what activates.

### Winner: Superpowers

Superpowers has the most aggressive and most defended auto-trigger system. The 1% threshold with 12-entry rationalization table is the strongest enforcement for ensuring skills are actually invoked. SuperClaude relies on Claude's voluntary compliance with keyword matching. ECC's description-based activation is standard Claude Code agent behavior with no special enforcement.

All three systems ultimately rely on the LLM following prompt instructions -- none can force activation programmatically within Claude Code's architecture. But Superpowers' anti-rationalization defense (catching 12 specific excuses for NOT invoking skills) is the most likely to produce consistent activation.

**Margin**: Moderate. Superpowers' rationalization defense is unique; the others have no comparable mechanism.

---

## 8. Token Efficiency

### Baseline Context Overhead

**SuperClaude**:
> Base context of ~17,500 tokens (CLAUDE.md + PLANNING.md + KNOWLEDGE.md + TASK.md + RULES.md + PRINCIPLES.md + FLAGS.md). With PM Agent, mode files, and agent definitions, active overhead can reach 25,000+ tokens.
> Per-command: ~1,000-5,000 tokens per invocation. PM Agent alone adds ~10,800 tokens.
> Total repo context (all markdown): ~80,000 tokens.

**Superpowers**:
> Skills are loaded on demand, not all at once. But "a session that triggers multiple skills (brainstorming -> writing-plans -> subagent-driven-development -> TDD -> code-review) will consume significant context."
> No base always-loaded context beyond the meta-skill (using-superpowers, 115 lines ~300 tokens) and whatever is in CLAUDE.md.
> Individual skills range from 70 lines (executing-plans) to 2,734 lines (writing-skills with all supporting files). Most core skills are 200-500 lines (~500-1,250 tokens each).

**ECC**:
> Session load overhead: ~500-700 tokens (lightweight metadata).
> Rules files are "always-follow guidelines" in `~/.claude/rules/`. "Installing all language rules would add significant system prompt overhead."
> Hook overhead per tool call: ~100-200ms (2 sync hooks) + async hooks (non-blocking). Token cost is minimal for hooks since they run externally.
> Commands are thin (40-365 lines); agents range from 35-237 lines.

### Winner: ECC

ECC has the lightest session-start overhead (~500-700 tokens) with the most granular control (three-tier profiles, per-hook disabling). Superpowers has no large always-loaded base but accumulates context as skills trigger during a session. SuperClaude has the heaviest baseline (~17,500 tokens before any work, potentially 25,000+).

**Ranking**:
1. **ECC**: ~500-700 token base, hooks run externally (no context cost), profile-gated
2. **Superpowers**: Near-zero base, ~500-1,250 tokens per skill invocation (on-demand)
3. **SuperClaude**: ~17,500 token base, 1,000-5,000 per command on top

**Margin**: Large between ECC/Superpowers and SuperClaude. Close between ECC and Superpowers (ECC wins on base cost; Superpowers may accumulate less if fewer skills trigger).

---

## 9. Agent / Subagent Architecture Quality

### Architecture Comparison

**SuperClaude** has 20 agent files:
- PM Agent (22,307 bytes, depth 5/5) is the orchestrator
- Socratic Mentor (12,061 bytes, depth 4/5) is the deepest teaching agent
- 14 agents are under 3,100 bytes (~78 lines) with minimal differentiation
- "Agents do not communicate with each other programmatically"
- Dispatch is keyword matching in RULES.md

**Superpowers** has a multi-role agent system:
- Controller (main agent) orchestrates
- Implementer subagent (113-line prompt template) executes tasks
- Spec reviewer subagent (61-line template) verifies spec compliance
- Code quality reviewer subagent (26-line template) checks code quality
- Subagents are dispatched fresh per task (no accumulated context contamination)
- Four-status protocol: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Cost-aware model selection per task type
- Plan document reviewer subagent for planning quality

**ECC** has 25 agents with explicit model routing:
- Core trio: planner (opus, 212 lines), architect (opus, 211 lines), code-reviewer (sonnet, 237 lines) at depth 4/5
- 12 language-specific agents (sonnet, 72-159 lines) at depth 2-3/5
- 2 stubs at depth 1/5 (35-36 lines)
- Model is declared per agent (opus for high-judgment, sonnet for standard)
- No multi-agent review pipeline within a single workflow

### Winner: Superpowers

Superpowers wins for architectural sophistication. The key differentiator is the multi-agent pipeline within a single task: controller dispatches implementer, spec reviewer independently verifies (with mandatory distrust), code quality reviewer evaluates independently, and the loop repeats until both reviewers approve. This is a genuine separation of concerns with adversarial verification.

SuperClaude has the most agent definitions by count (20) but most are thin and they do not communicate. ECC has the best model routing (explicit opus/sonnet per agent) and the most language coverage but no review pipeline.

**Ranking**:
1. **Superpowers**: Multi-role pipeline with adversarial review, fresh dispatch, cost-aware model selection
2. **ECC**: Explicit model routing, language breadth, but no inter-agent pipeline
3. **SuperClaude**: Most agents by count, but thin definitions and no programmatic coordination

**Margin**: Moderate between Superpowers and ECC. Large between either and SuperClaude's agent system.

---

## Summary Scorecard

| Capability | SuperClaude | Superpowers | ECC | Winner |
|---|---|---|---|---|
| Debugging | 3/5 | **5/5** | 2/5 | **Superpowers** (large margin) |
| TDD | 2/5 | **5/5** | 4/5 | **Superpowers** (large margin) |
| Planning | **4/5** | **4/5** | 3/5 | **Tie** (SC strategic, SP actionable) |
| Code Review | 3/5 | **4/5** | 1-4/5 | **Superpowers** (moderate margin) |
| Implementation | 3/5 | **5/5** | 3/5 | **Superpowers** (large margin) |
| Brainstorming | 3/5 | **4/5** | N/A | **Superpowers** (moderate margin) |
| Auto-Trigger | Prompt-based | **Anti-rationalization** | Description-based | **Superpowers** |
| Token Efficiency | 17,500+ base | On-demand | **500-700 base** | **ECC** |
| Agent Architecture | 20 agents (thin) | **Multi-role pipeline** | 25 agents (model-routed) | **Superpowers** |

### Overall Assessment

**Superpowers** wins 7 of 9 categories (or 6.5 counting the planning tie). Its dominance comes from a fundamentally different philosophy: it invests heavily in enforcement (Iron Laws, rationalization tables, red flags, gate functions, hard gates, spirit-vs-letter defense) rather than breadth of coverage. Every discipline-critical skill has multiple layers preventing the AI from cutting corners, and these mechanisms were empirically derived from pressure testing agents, not hypothetically designed.

**ECC** wins on token efficiency and has the strongest infrastructure (hooks, session persistence, learning pipeline, 997 tests). It is the most engineered system with real runtime controls. Its weakness is methodological depth -- no anti-rationalization, no mandatory gates, thin commands that delegate to agents.

**SuperClaude** has the most creative prompt engineering (expert panels, PDCA cycle, bilingual design) and the most ambitious vision (PM Agent orchestrating sub-agents, Serena MCP persistence, confidence gates). Its weakness is that the ambition outpaces the implementation -- placeholder code, prompt-only enforcement, enormous token overhead, and thin agent definitions undermine the sophisticated design.

### Key Insight

The fundamental differentiator is not what each system *tells* the AI to do, but how hard each system works to *prevent* the AI from rationalizing its way out of doing it. Superpowers is the only system that systematically addresses LLM compliance psychology with empirically-derived anti-rationalization mechanisms. The other two systems rely on "MANDATORY" labels and "CRITICAL" markers, which LLMs routinely bypass.
