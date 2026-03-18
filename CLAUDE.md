# Claude Code - Optimal Setup

## System Architecture
This setup uses **Superpowers** as the base skill system with ECC-inspired session persistence hooks.

## Skill System
- Superpowers skills are installed and auto-trigger per the using-superpowers meta-skill
- When I prefix a request with "quick:", skip brainstorming and skill gates
- Superpowers enforcement takes priority over all other methodology guidance
- **living-docs** skill keeps ARCHITECTURE.md and DESIGN.md in sync with code changes (fires on conversation start + after changes)

## Git Commands

Always use the GitHub CLI (`gh`) instead of raw `git` commands when available. For example:

- Use `gh repo clone` instead of `git clone`
- Use `gh pr create` instead of manual branch push + PR creation
- Use `gh pr checkout` instead of `git fetch` + `git checkout`
- Use `gh pr merge` instead of `git merge`
- Use `gh issue list/create/view` for issue management
- Use `gh api` for GitHub API interactions

This ensures consistent authentication and better integration with GitHub workflows.

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

**Important:** To preserve auto-approval, run each git command as its own Bash tool call. Never chain auto-approved commands with `&&` or prefix with `cd` — compound commands don't match the auto-approved patterns and will trigger manual approval prompts.

## Worktree Development Workflow

When implementing changes beyond a trivial edit, use a worktree. The bar is low — if it touches more than 2-3 files, involves logic changes, or follows an implementation plan, it goes through a worktree.

Always use **subagent-driven development** for implementation.

### Setup

Use the superpowers `/using-git-worktrees` skill for worktree creation. It handles:
- Directory selection (`.worktrees/` preferred, already configured)
- `.gitignore` safety verification (adds entry + commits if missing)
- Dependency installation (auto-detects package.json, Cargo.toml, etc.)
- Baseline test verification (reports failures before work begins)

**Constraint:** The skill must branch from `HEAD` (the current local branch), never from a remote ref.

### Process (runs fully autonomously — no approval needed at any step)

1. **Create worktree** — invoke `/using-git-worktrees` as described above
2. **Implement** all changes in the worktree directory using subagent-driven development
3. **Commit** all work in the worktree
4. **Review** — run the superpowers `code-reviewer` agent against the changes
5. **Fix everything** — address ALL issues found by the reviewer (critical, minor, style, naming — everything). Do not ask what to fix. Fix all of them. Then re-review until the reviewer passes clean.
6. **Finish** — invoke `/finishing-a-development-branch` to merge back and clean up. The skill handles:
   - Merging the worktree branch into the originating branch
   - Removing the worktree directory
   - Deleting the temporary branch

### Rules

- The worktree branch must always be created from and merged back into the **same branch** — the one you are currently on locally. Never merge into a different branch.
- `git merge`, `git worktree remove`, and `git branch -d` are auto-approved **only** within this worktree workflow. In all other contexts, these still require user approval.
- The code reviewer must find zero remaining issues before merging. If it finds problems, fix them and run the reviewer again. Repeat until clean.
- Never skip the review step. Never skip "minor" fixes. Every finding gets fixed.
- This entire process — create, implement, review, fix, merge, clean up — executes without stopping to ask for permission.

## Memory Protocol
- Project-specific rules belong in this file (CLAUDE.md)
- Use Serena `write_memory` for architectural decisions and conventions discovered during work
- Cross-project patterns: manually extract to `~/.serena/memories/global/` or Obsidian vault
- Session continuity is handled by hooks (session-start.js / session-end.js)

## MCP Servers
Use these naturally when relevant — don't wait to be asked.

- **Serena** (via AIRIS gateway): Semantic code navigation with `--context claude-code`. Use for find-definition, find-references, rename refactoring. Serena memories persist in `.serena/memories/`
- **Context7**: Library documentation retrieval
- **Playwright**: Browser testing and interaction
- **Tavily**: Web search when WebSearch is insufficient
- **shadcn**: UI component references
- **Magic MCP**: `component_builder`, `component_inspiration`, `component_refiner`, `logo_search`

## UI Changes
- When making any UI/frontend changes, invoke the `/ui-ux-pro-max` skill for design guidance and quality checks.

## Living Documentation
- At conversation start, check for `ARCHITECTURE.md` (always) and `DESIGN.md` (only if it exists).
- If `ARCHITECTURE.md` is missing, prompt the user to run `/living-docs:init` before starting any coding work.
- If `DESIGN.md` exists, treat this as a UI project and maintain it alongside `ARCHITECTURE.md`.
- After code changes, update `ARCHITECTURE.md`. After design/UI changes, update `DESIGN.md` (if it exists).

## Hooks
Session persistence hooks fire automatically:
- `SessionStart`: Loads previous session summary (~500-700 tokens)
- `Stop`: Saves session context for next session + cost tracking
