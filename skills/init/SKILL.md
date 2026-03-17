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
