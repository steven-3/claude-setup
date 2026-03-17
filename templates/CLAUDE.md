# Claude Code Instructions

## Quick Reference
<!-- Update these as documentation files are created -->
- **Architecture details**: See `ARCHITECTURE.md`
- **Design system**: See `DESIGN.md`

## Commands
<!-- Fill in the project's common commands -->
```bash
# npm run dev / start / build / test etc.
```

## Tech Stack
<!-- List the project's core technologies -->

## Project Structure
<!-- Document the directory layout -->

## Git Commands

Always use the GitHub CLI (`gh`) instead of raw `git` commands when available. For example:

- Use `gh repo clone` instead of `git clone`
- Use `gh pr create` instead of manual branch push + PR creation
- Use `gh pr checkout` instead of `git fetch` + `git checkout`
- Use `gh pr merge` instead of `git merge`
- Use `gh issue list/create/view` for issue management
- Use `gh api` for GitHub API interactions

This ensures consistent authentication and better integration with GitHub workflows.

## MCP Servers
Use these naturally when relevant — don't wait to be asked.

- **Magic MCP** — `component_builder`, `component_inspiration`, `component_refiner`, `logo_search` — use when building/refining UI components
- **Airis Gateway** (Docker, localhost:9400) — cold-start sub-servers:
  - **context7** — Library docs lookup
  - **playwright** — Browser automation/testing
  - **serena** — Symbolic code navigation (run `activate_project` on first use)
  - **tavily** — Web search/research
  - **chrome-devtools** — Chrome debugging
  - **shadcn** — shadcn/ui component search

## UI Changes
- When making any UI/frontend changes, invoke the `/ui-ux-pro-max` skill for design guidance and quality checks.

## Living Documentation
- Run `/living-docs` at the **start** of every conversation to load `ARCHITECTURE.md` and `DESIGN.md` as working context.
- After making code or design changes, update the relevant doc (`ARCHITECTURE.md` for structural changes, `DESIGN.md` for UI/styling changes) before ending the conversation.
