# Claude Code - Optimal Setup

## System Architecture
This setup uses **Superpowers** as the base skill system with ECC-inspired session persistence hooks.

## Skill System
- Superpowers skills are installed and auto-trigger per the using-superpowers meta-skill
- When I prefix a request with "quick:", skip brainstorming and skill gates
- Superpowers enforcement takes priority over all other methodology guidance
- **living-docs** skill keeps architecture.md and DESIGN.md in sync with code changes (fires on conversation start + after changes)

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

## Worktree Development Workflow

When implementing changes beyond a trivial edit, use a worktree. The bar is low — if it touches more than 2-3 files, involves logic changes, or follows an implementation plan, it goes through a worktree.

Always use **subagent-driven development** for implementation.

### Process (runs fully autonomously — no approval needed at any step)

1. **Create worktree** from the current local branch:
   ```bash
   git worktree add -b <descriptive-branch> .worktrees/<branch-name> HEAD
   ```
2. **Implement** all changes in the worktree directory using subagent-driven development
3. **Commit** all work in the worktree
4. **Review** — run the superpowers `code-reviewer` agent against the changes
5. **Fix everything** — address ALL issues found by the reviewer (critical, minor, style, naming — everything). Do not ask what to fix. Fix all of them. Then re-review until the reviewer passes clean.
6. **Merge back** — from the original directory, merge the worktree branch into the branch it was created from:
   ```bash
   git merge <worktree-branch>
   ```
7. **Clean up** — remove the worktree and delete the temporary branch:
   ```bash
   git worktree remove .worktrees/<branch-name>
   git branch -d <worktree-branch>
   ```

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
- Run `/living-docs` at the **start** of every conversation to load `ARCHITECTURE.md` and `DESIGN.md` as working context.
- After making code or design changes, update the relevant doc (`ARCHITECTURE.md` for structural changes, `DESIGN.md` for UI/styling changes) before ending the conversation.

## Hooks
Session persistence hooks fire automatically:
- `SessionStart`: Loads previous session summary (~500-700 tokens)
- `Stop`: Saves session context for next session + cost tracking
