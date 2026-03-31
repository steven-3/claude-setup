---
name: supermind
description: Complexity router — auto-detects task scope and routes to /quick or /project mode
---

# Supermind — Complexity Router

This skill activates at the start of every task. It decides how much ceremony the task needs, then routes to the appropriate mode.

**This is a meta-skill. It does NOT do any work itself.** It:
1. Reads the user's prompt
2. Decides Quick or Project
3. Invokes the appropriate skill (`/quick` or `/project`)
4. Passes through all flags and the original prompt

## Auto-Detection Signals

### Quick Signals (route to `/quick`)

- **Keywords:** "fix", "rename", "typo", "update config", "add test for", "change X to Y", "remove", "delete", "bump", "move"
- **Scope:** single file mentioned, specific function/variable named
- **Clarity:** the request is unambiguous — you know exactly what to do
- **Size:** trivially small change

### Project Signals (route to `/project`)

- **Keywords:** "build", "implement", "create", "add feature", "refactor", "redesign", "new", "architect", "migrate", "integrate"
- **Scope:** multiple files, multiple systems, or scope is unclear
- **Ambiguity:** requirements need clarification
- **Size:** non-trivial — multiple behaviors, new abstractions, integration work

## Routing Behavior

1. Analyze the user's prompt against the signal lists above
2. Make a decision
3. Announce it with an escape hatch:
   - **Quick:** *"This looks like a quick task — running in quick mode. Say `/project` if you want the full lifecycle."*
   - **Project:** *"This looks like a multi-step project — running in project mode. Say `/quick` if this is simpler than I think."*
4. Brief pause (one message) for the user to override, then proceed
5. Invoke the chosen skill via the Skill tool — `/quick` or `/project`

## Explicit Overrides (always respected)

These bypass auto-detection entirely:

| User input | Action |
|-----------|--------|
| `quick: <task>` or `/quick` | Quick Mode, no questions asked |
| `/project` | Project Mode, no questions asked |
| `/project --assumptions` | Project Mode with assumptions |
| `/project --skip-discuss` | Project Mode starting at research |
| `/project --skip-research` | Project Mode starting at plan |
| `/project --max-parallel N` | Project Mode with custom parallelism |
| `/quick --with-research` | Quick Mode with pre-dispatch research |
| `/quick --with-discuss` | Quick Mode with clarifying questions |

All composable flags from Quick and Project modes pass through unchanged.

## Edge Cases

- **Not a task** (greeting, question, discussion): respond normally — do NOT route
- **Active `.planning/` session** (user references it or says "continue"/"resume"): resume Project Mode at the last checkpoint
- **Ambiguous** (could be quick or project): default to **quick** — less ceremony, and the user can escalate with `/project`

## Available Sub-Commands

- `/supermind-init` — Initialize a project: CLAUDE.md setup, ARCHITECTURE.md/DESIGN.md generation, health checks
- `/supermind-living-docs` — Manually sync ARCHITECTURE.md and DESIGN.md with the current codebase
