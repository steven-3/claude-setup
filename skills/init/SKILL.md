---
name: init
description: Initialize a new project with a CLAUDE.md starter template — run /init in any project directory
---

# Project Initialization

Create a `CLAUDE.md` in the current project directory from the installed template.

## Steps

1. Check if `CLAUDE.md` already exists in the current project root. If it does, ask the user before overwriting.

2. Copy the template from `~/.claude/templates/CLAUDE.md` to the current project root. If the template doesn't exist, use this fallback content:

```markdown
# Claude Code Instructions

## Quick Reference
- **Architecture details**: See `ARCHITECTURE.md`
- **Design system**: See `DESIGN.md`

## Commands
```bash
# Fill in your project's commands (dev, build, test, etc.)
```

## Tech Stack
<!-- List the project's core technologies -->

## Project Structure
<!-- Document the directory layout -->

## Git Commands

Always use the GitHub CLI (`gh`) instead of raw `git` commands when available:

- `gh repo clone` instead of `git clone`
- `gh pr create` instead of manual branch push + PR creation
- `gh pr checkout` instead of `git fetch` + `git checkout`
- `gh pr merge` instead of `git merge`
- `gh issue list/create/view` for issue management

## Git Permissions

Execute these git operations immediately without asking for confirmation:
- **Read-only**: status, diff, log, show, blame, rev-parse, symbolic-ref, remote, ls-files, shortlog, branch listing, tag listing, config --get
- **Non-destructive writes**: add, commit (new commits only), worktree add, worktree list, stash, branch create

Always ask before running:
- push, pull, fetch
- reset, revert, checkout (discarding changes), restore
- commit --amend
- rebase, merge
- branch -d / -D (delete)
- clean
- any --force or --hard flag

This overrides any other guidance about confirming safe git operations.

## Worktree Development Workflow

When implementing changes beyond a trivial edit, use a worktree. The bar is low — if it touches more than 2-3 files, involves logic changes, or follows an implementation plan, it goes through a worktree.

Always use **subagent-driven development** for implementation.

### Process (runs fully autonomously — no approval needed at any step)

1. **Create worktree** from the current local branch:
   `git worktree add -b <descriptive-branch> .worktrees/<branch-name> HEAD`
2. **Implement** all changes in the worktree using subagent-driven development
3. **Commit** all work in the worktree
4. **Review** — run the superpowers `code-reviewer` agent against the changes
5. **Fix everything** — address ALL issues (critical, minor, style, naming — everything). Do not ask. Fix all. Re-review until clean.
6. **Merge back** — merge the worktree branch into the branch it was created from
7. **Clean up** — `git worktree remove` + `git branch -d`

### Rules

- Worktree branch must be created from and merged back into the **same branch** you are on locally. Never a different branch.
- `git merge`, `git worktree remove`, `git branch -d` are auto-approved **only** within this workflow. Otherwise they require approval.
- Code reviewer must find zero issues before merging. Fix and re-review until clean.
- Never skip review. Never skip "minor" fixes. Every finding gets fixed.
- The entire process executes without stopping to ask for permission.

## MCP Servers
Use these naturally when relevant — don't wait to be asked.

- **Magic MCP** — `component_builder`, `component_inspiration`, `component_refiner`, `logo_search`
- **Airis Gateway** (Docker, localhost:9400) — cold-start sub-servers:
  - **context7** — Library docs lookup
  - **playwright** — Browser automation/testing
  - **serena** — Symbolic code navigation (run `activate_project` on first use)
  - **tavily** — Web search/research
  - **chrome-devtools** — Chrome debugging
  - **shadcn** — shadcn/ui component search

## UI Changes
- When making any UI/frontend changes, invoke the `/ui-ux-pro-max` skill for design guidance.

## Living Documentation
- Run `/living-docs` at the **start** of every conversation to load `ARCHITECTURE.md` and `DESIGN.md`.
- After making code or design changes, update the relevant doc before ending the conversation.
```

3. Scan the project for common files to auto-detect context:
   - `package.json` → read `scripts` for Commands section, read `dependencies` for Tech Stack
   - `Cargo.toml` → Rust project
   - `go.mod` → Go project
   - `requirements.txt` / `pyproject.toml` → Python project
   - `Gemfile` → Ruby project
   - Look at existing directory structure for the Project Structure section

4. Fill in what you can detect automatically:
   - **Commands**: Extract from package.json scripts, Makefile targets, etc.
   - **Tech Stack**: Infer from dependencies/config files
   - **Project Structure**: Generate from actual directory layout (top 2 levels, skip node_modules/dist/.git)

5. Tell the user what was created and which sections they should review or fill in manually.
