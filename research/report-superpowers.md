# Superpowers Analysis

## Executive Summary

Superpowers is a comprehensive, opinionated software development workflow system for AI coding agents (Claude Code, Codex, Cursor, Gemini CLI, OpenCode). It implements a full development lifecycle -- from brainstorming through implementation to code review and branch completion -- as a set of composable "skills" that auto-trigger based on context. The system's distinguishing characteristic is its depth of enforcement: it does not merely suggest workflows but actively prevents the AI from cutting corners through extensive rationalization tables, anti-pattern lists, red-flag detection, and hard gates. The subagent-driven development system with two-stage review (spec compliance then code quality) is the centerpiece of autonomous execution. The total corpus across all skills is approximately 6,400+ lines of structured instruction and supporting material.

## Skill Inventory

| Skill Name | Total Lines (with supporting files) | Depth Score (1-5) | Enforcement Type | Brief Description |
|---|---|---|---|---|
| using-superpowers | 173 (SKILL + codex-tools + gemini-tools refs) | 5 | Mandatory gates, red flags table, rationalization prevention | Meta-skill: auto-trigger system that forces skill invocation before any response |
| brainstorming | 1,340 (SKILL + visual-companion + spec-reviewer + scripts) | 4 | Hard gate, checklist, spec review loop, user approval gates | Socratic design exploration with visual companion and automated spec review |
| systematic-debugging | 1,251 (SKILL + root-cause-tracing + defense-in-depth + condition-based-waiting + example + find-polluter + tests + creation-log) | 5 | Iron Law, 4-phase mandatory process, red flags, rationalization table, 3-fix architectural escalation | 4-phase root cause debugging with supporting technique library |
| test-driven-development | 670 (SKILL + testing-anti-patterns) | 5 | Iron Law, delete-and-restart mandate, red flags, rationalization table, verification checklist | Strict RED-GREEN-REFACTOR with code deletion enforcement |
| subagent-driven-development | 477 (SKILL + implementer-prompt + spec-reviewer-prompt + code-quality-reviewer-prompt) | 5 | Two-stage review (spec then quality), status handling protocol, red flags list | Dispatches fresh subagent per task with two-stage review pipeline |
| writing-plans | 191 (SKILL + plan-document-reviewer-prompt) | 4 | Plan review loop, bite-sized task mandate, scope check | Creates implementation plans assuming zero-context engineer |
| requesting-code-review | 251 (SKILL + code-reviewer) | 3 | Mandatory review points, severity-based response protocol | Dispatches code reviewer subagent with structured template |
| receiving-code-review | 213 | 5 | Forbidden responses list, YAGNI check, source-specific handling | Technical evaluation over performative agreement; anti-sycophancy enforcement |
| executing-plans | 70 | 2 | Stop-and-ask protocol, sub-skill requirement | Fallback plan execution for environments without subagents |
| verification-before-completion | 139 | 5 | Iron Law, gate function, rationalization prevention table | Prevents any completion claim without fresh verification evidence |
| using-git-worktrees | 218 | 3 | Safety verification, directory priority, baseline test requirement | Isolated workspace creation with gitignore verification |
| finishing-a-development-branch | 200 | 3 | Test verification gate, structured 4-option presentation, discard confirmation | Guides branch completion with merge/PR/keep/discard options |
| dispatching-parallel-agents | 182 | 3 | Independence verification, prompt structure requirements | Concurrent subagent dispatch for independent problems |
| writing-skills | 2,734 (SKILL + persuasion-principles + testing-skills-with-subagents + anthropic-best-practices + graphviz-conventions + render-graphs + CLAUDE_MD_TESTING example) | 5 | Iron Law (no skill without failing test), TDD-for-documentation cycle, CSO optimization | Meta-skill: TDD applied to process documentation with pressure testing methodology |

## Core Capability Deep-Dives

### Debugging

**Depth Score: 5/5**

The systematic-debugging skill is one of the most thoroughly developed capabilities in the system. It implements a mandatory 4-phase process with an absolute prohibition on attempting fixes before root cause investigation.

**Supporting Files:**
- `skills/systematic-debugging/SKILL.md` (296 lines) -- Main 4-phase process
- `skills/systematic-debugging/root-cause-tracing.md` (169 lines) -- Backward tracing technique through call chains
- `skills/systematic-debugging/defense-in-depth.md` (122 lines) -- Multi-layer validation after bug fix
- `skills/systematic-debugging/condition-based-waiting.md` (115 lines) -- Replace arbitrary timeouts with condition polling
- `skills/systematic-debugging/condition-based-waiting-example.ts` (158 lines) -- Working TypeScript implementation
- `skills/systematic-debugging/find-polluter.sh` (63 lines) -- Script to bisect test pollution
- `skills/systematic-debugging/test-academic.md` (14 lines) -- Test scenario
- `skills/systematic-debugging/test-pressure-1.md` (58 lines) -- Pressure test scenario
- `skills/systematic-debugging/test-pressure-2.md` (68 lines) -- Pressure test scenario
- `skills/systematic-debugging/test-pressure-3.md` (69 lines) -- Pressure test scenario
- `skills/systematic-debugging/CREATION-LOG.md` (119 lines) -- Documents how the skill was developed via TDD

**Key Enforcement Content:**

The Iron Law:
> ```
> NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
> ```
> If you haven't completed Phase 1, you cannot propose fixes.

The 3-fix architectural escalation is a unique mechanism:
> **If >= 3: STOP and question the architecture (step 5 below)**
> DON'T attempt Fix #4 without architectural discussion
>
> **Pattern indicating architectural problem:**
> - Each fix reveals new shared state/coupling/problem in different place
> - Fixes require "massive refactoring" to implement
> - Each fix creates new symptoms elsewhere

The rationalization table includes 8 specific excuses with rebuttals, and the red flags section lists 12 specific thoughts that should trigger a process reset.

The supporting techniques are not generic advice -- they are concrete, executable methods. Root-cause-tracing provides a 5-step backward tracing process with real code examples. Defense-in-depth defines exactly 4 layers of validation (entry point, business logic, environment guards, debug instrumentation) with working code. Condition-based-waiting includes a complete polling implementation with domain-specific helpers.

### TDD

**Depth Score: 5/5**

The TDD skill is the most enforcement-heavy skill in the system. It treats any deviation from RED-GREEN-REFACTOR as a hard failure requiring restart.

**Supporting Files:**
- `skills/test-driven-development/SKILL.md` (371 lines) -- Main TDD enforcement
- `skills/test-driven-development/testing-anti-patterns.md` (299 lines) -- 5 anti-patterns with gate functions

**Key Enforcement Content:**

The delete mandate:
> Write code before the test? Delete it. Start over.
>
> **No exceptions:**
> - Don't keep it as "reference"
> - Don't "adapt" it while writing tests
> - Don't look at it
> - Delete means delete

The "spirit vs letter" defense:
> **Violating the letter of the rules is violating the spirit of the rules.**

The rationalization table includes 11 specific excuses, each with a pointed rebuttal. The most notable ones address sophisticated rationalizations:

> | "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
> | "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
> | "TDD is dogmatic, being pragmatic means adapting" | TDD IS pragmatic... "Pragmatic" shortcuts = debugging in production = slower. |

The testing-anti-patterns file adds "gate functions" -- decision procedures an agent must execute before taking certain actions:
> ```
> BEFORE asserting on any mock element:
>   Ask: "Am I testing real component behavior or just mock existence?"
>   IF testing mock existence:
>     STOP - Delete the assertion or unmock the component
> ```

Five anti-patterns are covered: testing mock behavior, test-only methods in production, mocking without understanding, incomplete mocks, and integration tests as afterthought.

### Planning

**Depth Score: 4/5**

**Supporting Files:**
- `skills/writing-plans/SKILL.md` (142 lines) -- Plan authoring process
- `skills/writing-plans/plan-document-reviewer-prompt.md` (49 lines) -- Automated plan review

**Key Enforcement Content:**

The task granularity mandate:
> **Each step is one action (2-5 minutes):**
> - "Write the failing test" - step
> - "Run it to make sure it fails" - step
> - "Implement the minimal code to make the test pass" - step
> - "Run the tests and make sure they pass" - step
> - "Commit" - step

The zero-context engineer assumption:
> Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it.

The plan review loop provides automated quality assurance:
> 1. Dispatch a single plan-document-reviewer subagent
> 2. If Issues Found: fix the issues, re-dispatch reviewer for the whole plan
> 3. If Approved: proceed to execution handoff

The plan document reviewer checks: completeness (no TODOs/placeholders), spec alignment (covers all requirements), task decomposition (clear boundaries), and buildability (could an engineer follow without getting stuck).

### Code Review

**Depth Score: 4/5 (combined)**

The system has two complementary skills: requesting-code-review (outbound) and receiving-code-review (inbound).

**Supporting Files:**
- `skills/requesting-code-review/SKILL.md` (105 lines) -- When and how to request reviews
- `skills/requesting-code-review/code-reviewer.md` (146 lines) -- Reviewer agent template
- `skills/receiving-code-review/SKILL.md` (213 lines) -- How to process feedback

**Key Enforcement Content from receiving-code-review:**

The anti-sycophancy mandate:
> **NEVER:**
> - "You're absolutely right!" (explicit CLAUDE.md violation)
> - "Great point!" / "Excellent feedback!" (performative)
> - "Let me implement that now" (before verification)

The YAGNI check:
> ```
> IF reviewer suggests "implementing properly":
>   grep codebase for actual usage
>   IF unused: "This endpoint isn't called. Remove it (YAGNI)?"
>   IF used: Then implement properly
> ```

The pushback protocol:
> Push back when:
> - Suggestion breaks existing functionality
> - Reviewer lacks full context
> - Violates YAGNI (unused feature)
> - Technically incorrect for this stack
> - Conflicts with human partner's architectural decisions

The receiving-code-review skill explicitly bans any form of gratitude expression, which is unusual and specifically targets AI sycophancy patterns:
> **If you catch yourself about to write "Thanks":** DELETE IT. State the fix instead.

### Implementation / Subagent System

**Depth Score: 5/5**

This is the most architecturally sophisticated capability in Superpowers. It implements a multi-agent orchestration system with three distinct agent roles: implementer, spec reviewer, and code quality reviewer.

**Supporting Files:**
- `skills/subagent-driven-development/SKILL.md` (277 lines) -- Orchestration process
- `skills/subagent-driven-development/implementer-prompt.md` (113 lines) -- Implementer agent template
- `skills/subagent-driven-development/spec-reviewer-prompt.md` (61 lines) -- Spec compliance reviewer template
- `skills/subagent-driven-development/code-quality-reviewer-prompt.md` (26 lines) -- Code quality reviewer template

**How Two-Stage Review Works:**

For each task in a plan:
1. **Controller** extracts full task text (never makes subagent read the plan file)
2. **Implementer subagent** is dispatched with full task text + context. It can ask questions before starting, implements, tests, commits, and self-reviews. Reports one of four statuses: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, BLOCKED.
3. **Spec reviewer subagent** is dispatched to verify the implementation matches the spec. This reviewer is explicitly told to distrust the implementer's report:
   > The implementer finished suspiciously quickly. Their report may be incomplete, inaccurate, or optimistic. You MUST verify everything independently.
4. Only after spec compliance passes, a **code quality reviewer subagent** evaluates clean code, testing, architecture.
5. If either reviewer finds issues, the implementer fixes them and the reviewer re-reviews. Loop until approved.

**The model selection system** is cost-aware:
> **Mechanical implementation tasks** (isolated functions, clear specs, 1-2 files): use a fast, cheap model.
> **Integration and judgment tasks** (multi-file coordination, pattern matching, debugging): use a standard model.
> **Architecture, design, and review tasks**: use the most capable available model.

**The escalation protocol** handles four implementer statuses with specific guidance for each, including re-dispatch with more capable model and task decomposition for BLOCKED status.

**Key enforcement from the implementer prompt:**

The "in over your head" clause:
> It is always OK to stop and say "this is too hard for me." Bad work is worse than no work. You will not be penalized for escalating.
>
> **STOP and escalate when:**
> - The task requires architectural decisions with multiple valid approaches
> - You need to understand code beyond what was provided and can't find clarity
> - You feel uncertain about whether your approach is correct

### Brainstorming

**Depth Score: 4/5**

**Supporting Files:**
- `skills/brainstorming/SKILL.md` (164 lines) -- Main design exploration process
- `skills/brainstorming/visual-companion.md` (285 lines) -- Browser-based visual brainstorming
- `skills/brainstorming/spec-document-reviewer-prompt.md` (49 lines) -- Automated spec review
- `skills/brainstorming/scripts/server.js` (338 lines) -- WebSocket-based visual companion server
- `skills/brainstorming/scripts/frame-template.html` (214 lines) -- HTML template
- `skills/brainstorming/scripts/helper.js` (88 lines) -- Client-side helper
- `skills/brainstorming/scripts/start-server.sh` (147 lines) -- Server launcher
- `skills/brainstorming/scripts/stop-server.sh` (55 lines) -- Server cleanup

**Key Enforcement Content:**

The hard gate:
> ```
> <HARD-GATE>
> Do NOT invoke any implementation skill, write any code, scaffold any project, or take any
> implementation action until you have presented a design and the user has approved it. This
> applies to EVERY project regardless of perceived simplicity.
> </HARD-GATE>
> ```

The anti-pattern for "simple" projects:
> Every project goes through this process. A todo list, a single-function utility, a config change -- all of them. "Simple" projects are where unexamined assumptions cause the most wasted work.

The design-for-isolation principle:
> Break the system into smaller units that each have one clear purpose, communicate through well-defined interfaces, and can be understood and tested independently.

The visual companion system is notable -- it launches a local web server that serves HTML mockups, wireframes, and design options during brainstorming. The user interacts via browser clicks, and events are recorded to a `.events` file that the agent reads. This provides a visual channel during text-based design discussions.

The spec review loop adds automated quality assurance with a max of 3 iterations before escalating to the human.

## Auto-Trigger System

**File:** `skills/using-superpowers/SKILL.md` (115 lines)

The using-superpowers skill is the auto-trigger meta-skill. It fires at the start of every conversation and establishes the rule that all other skills must be invoked before any response.

**The Decision Tree:**

```
User message received
  -> About to enter plan mode? -> Already brainstormed? -> No: Invoke brainstorming
  -> Might any skill apply? (even 1% chance)
    -> Yes: Invoke Skill tool
      -> Announce usage
      -> Has checklist? -> Create TodoWrite items
      -> Follow skill exactly
    -> Definitely not: Respond normally
```

**Priority ordering when multiple skills apply:**
1. Process skills first (brainstorming, debugging) -- these determine HOW to approach
2. Implementation skills second -- these guide execution

**The Red Flags Table** is the enforcement backbone. It catches 12 specific rationalizations:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept != using the skill. Invoke it. |

**Aggressiveness Assessment:**

The system is deliberately aggressive. The 1% threshold for skill invocation is explicit:
> If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

The skill also uses XML-tagged emphasis:
> ```
> <EXTREMELY-IMPORTANT>
> IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.
> This is not negotiable. This is not optional. You cannot rationalize your way out of this.
> </EXTREMELY-IMPORTANT>
> ```

However, it includes a safety valve: user instructions (CLAUDE.md, direct requests) take priority over skill requirements. This prevents the system from overriding user intent.

**Skill Type Classification:**
> **Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.
> **Flexible** (patterns): Adapt principles to context.
> The skill itself tells you which.

## Enforcement Model

Superpowers uses a multi-layered enforcement approach that draws explicitly from persuasion research (Cialdini, 2021; Meincke et al., 2025 -- N=28,000 LLM conversations showing compliance increased from 33% to 72% with persuasion techniques).

### Layer 1: Iron Laws
Non-negotiable rules stated as absolutes:
- "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"
- "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"
- "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE"
- "NO SKILL WITHOUT A FAILING TEST FIRST"

### Layer 2: Spirit-vs-Letter Defense
Applied globally via the phrase:
> **Violating the letter of the rules is violating the spirit of the rules.**

This preemptively closes the entire category of "I'm following the spirit, not the letter" rationalizations.

### Layer 3: Rationalization Tables
Every discipline-enforcing skill includes a table mapping specific excuses to rebuttals. The TDD skill has 11 entries, the debugging skill has 8, verification-before-completion has 8, and using-superpowers has 12. These are not generic -- they were developed by running pressure tests on agents and capturing their actual rationalizations verbatim.

### Layer 4: Red Flags Lists
Explicit "STOP" triggers that the agent should recognize as signs it is rationalizing. The TDD skill lists 13 specific red flag thoughts.

### Layer 5: Hard Gates
XML-tagged blocking conditions that prevent progression:
> `<HARD-GATE>Do NOT invoke any implementation skill...until you have presented a design and the user has approved it.</HARD-GATE>`

### Layer 6: Gate Functions
Procedural decision checks embedded in anti-pattern documentation:
> ```
> BEFORE asserting on any mock element:
>   Ask: "Am I testing real component behavior or just mock existence?"
>   IF testing mock existence:
>     STOP - Delete the assertion or unmock the component
> ```

### Layer 7: Persuasion-Informed Design
The writing-skills skill explicitly documents how persuasion principles (authority, commitment, scarcity, social proof, unity) are applied to skill authoring, with research citations. Skills are designed to use imperative language, require public announcements (commitment), and establish norms (social proof).

## Unique Strengths

1. **TDD applied to documentation itself.** The writing-skills skill treats skill creation as a TDD process: write pressure scenarios (tests), run without the skill (RED/watch fail), write the skill (GREEN), close loopholes (REFACTOR). This means enforcement mechanisms are empirically derived from observed agent failures, not hypothetical.

2. **Two-stage review in subagent system.** The separation of spec compliance review from code quality review is architecturally sound. The spec reviewer is explicitly told to distrust the implementer, preventing rubber-stamp reviews.

3. **Anti-sycophancy enforcement.** The receiving-code-review skill explicitly bans performative agreement, gratitude expressions, and "You're absolutely right!" responses. This directly targets a known AI failure mode and is unusually specific about it.

4. **The 3-fix architectural escalation.** The debugging skill's rule that 3+ failed fixes should trigger architectural questioning (not a 4th fix attempt) is a practical insight that prevents fix-chasing spirals.

5. **Rationalization tables derived from actual agent testing.** The tables are not hypothetical -- the testing-skills-with-subagents methodology describes running real pressure tests (sunk cost + time + exhaustion) and capturing agent rationalizations verbatim. This makes the enforcement empirically grounded.

6. **Visual companion for brainstorming.** A local web server that serves HTML mockups during design discussions, with event capture for user interactions. This adds a visual channel that most text-only systems lack.

7. **Cost-aware model selection.** The subagent system explicitly recommends using cheaper models for mechanical tasks and reserving expensive models for architecture/review, which is pragmatic and unusual.

8. **Multi-platform support.** The system works across Claude Code, Codex, Cursor, Gemini CLI, and OpenCode, with platform-specific adaptation documented.

9. **Explicit priority hierarchy.** User instructions > Superpowers skills > Default system prompt. This prevents the system from overriding user intent.

10. **CSO (Claude Search Optimization).** The insight that skill descriptions should ONLY contain triggering conditions (not workflow summaries) because Claude will follow descriptions as shortcuts instead of reading full skills is a practical discovery about LLM behavior.

## Honest Weaknesses

1. **Token cost.** The system is large. Loading all skills adds thousands of tokens to context. While skills are loaded on demand (not all at once), a session that triggers multiple skills (brainstorming -> writing-plans -> subagent-driven-development -> TDD -> code-review) will consume significant context. The writing-skills skill acknowledges this with word count targets but the core skills themselves are substantial.

2. **Rigidity for experienced users.** The system is designed for maximum enforcement, which may frustrate users who know when to deviate. The "every project goes through brainstorming" mandate and the "delete all code written before tests" rule do not account for legitimate cases where a lighter touch is appropriate (though user instructions can override).

3. **Subagent dependency.** The most powerful workflow (subagent-driven-development) requires a platform with subagent support. The fallback (executing-plans) is explicitly described as inferior. Users on platforms without subagents get a degraded experience.

4. **Verification-before-completion is reactive.** It catches false claims after the agent has already done the work, rather than structurally preventing the situation. An agent can still do work incorrectly; it just cannot claim success without evidence.

5. **No skill for dependency management, CI/CD, or deployment.** The system covers design-through-merge but stops at the branch level. There is no skill for release management, deployment pipelines, or production monitoring.

6. **Limited coverage of non-code work.** Skills focus heavily on code implementation. There is no skill for documentation writing (beyond design specs), user research, performance optimization, or security auditing.

7. **The visual companion is experimental.** The README notes it is "still new and can be token-intensive." The server implementation (338 lines of JavaScript) adds complexity, and the file-watching approach with `.events` files is fragile compared to a proper WebSocket protocol.

8. **No explicit skill for refactoring.** While TDD covers refactoring as part of RED-GREEN-REFACTOR, there is no standalone skill for large-scale refactoring projects that are not bug fixes or new features.

9. **The "delete everything" TDD mandate may waste real work.** While the rationale (sunk cost fallacy) is sound in principle, enforcing deletion of hours of working code in every case, without exception, may be counterproductive in practice for large implementations where the design was sound but the process was imperfect.

## Raw Evidence

### Key Quotes with File Paths

**Auto-trigger enforcement** (`skills/using-superpowers/SKILL.md`):
> If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill. IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT. This is not negotiable. This is not optional. You cannot rationalize your way out of this.

**TDD Iron Law** (`skills/test-driven-development/SKILL.md`):
> NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
> Write code before the test? Delete it. Start over.
> No exceptions:
> - Don't keep it as "reference"
> - Don't "adapt" it while writing tests
> - Don't look at it
> - Delete means delete

**Debugging 3-fix escalation** (`skills/systematic-debugging/SKILL.md`):
> If < 3: Return to Phase 1, re-analyze with new information
> If >= 3: STOP and question the architecture (step 5 below)
> DON'T attempt Fix #4 without architectural discussion
> This is NOT a failed hypothesis - this is a wrong architecture.

**Spec reviewer distrust** (`skills/subagent-driven-development/spec-reviewer-prompt.md`):
> The implementer finished suspiciously quickly. Their report may be incomplete, inaccurate, or optimistic. You MUST verify everything independently.
> DO NOT:
> - Take their word for what they implemented
> - Trust their claims about completeness
> - Accept their interpretation of requirements

**Anti-sycophancy** (`skills/receiving-code-review/SKILL.md`):
> NEVER:
> - "You're absolutely right!" (explicit CLAUDE.md violation)
> - "Great point!" / "Excellent feedback!" (performative)
> - "Let me implement that now" (before verification)
> If you catch yourself about to write "Thanks": DELETE IT. State the fix instead.

**Verification gate** (`skills/verification-before-completion/SKILL.md`):
> NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
> If you haven't run the verification command in this message, you cannot claim it passes.
> From 24 failure memories:
> - Human partner said "I don't believe you" - trust broken
> - Undefined functions shipped - would crash
> - Violates: "Honesty is a core value. If you lie, you'll be replaced."

**Persuasion research basis** (`skills/writing-skills/persuasion-principles.md`):
> Meincke et al. (2025) tested 7 persuasion principles with N=28,000 AI conversations. Persuasion techniques more than doubled compliance rates (33% to 72%, p < .001).

**CSO discovery** (`skills/writing-skills/SKILL.md`):
> Testing revealed that when a description summarizes the skill's workflow, Claude may follow the description instead of reading the full skill content. A description saying "code review between tasks" caused Claude to do ONE review, even though the skill's flowchart clearly showed TWO reviews (spec compliance then code quality).

**Implementer escalation** (`skills/subagent-driven-development/implementer-prompt.md`):
> It is always OK to stop and say "this is too hard for me." Bad work is worse than no work. You will not be penalized for escalating.

**Hard gate on brainstorming** (`skills/brainstorming/SKILL.md`):
> Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

**Writing-skills TDD application** (`skills/writing-skills/SKILL.md`):
> Writing skills IS Test-Driven Development applied to process documentation.
> If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.
