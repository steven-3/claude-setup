# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-18

### Fixed
- Skill namespace mismatch: child skills used `name: init` / `name: living-docs` instead of `name: supermind:init` / `name: supermind:living-docs`, so `/supermind:init` was never discoverable
- Parent skill `name: sm` didn't match directory name `supermind` — now `name: supermind`

### Changed
- All skill references renamed from `/sm:*` to `/supermind:*` across CLAUDE.md, templates, setup.sh, update.sh, README.md, SETUP.md
- `update.sh` now migrates users from old `/sm:*` skill names — replaces `/sm:` with `/supermind:` in `~/.claude/templates/CLAUDE.md`

### Added
- Version tracking (`VERSION` file, `CHANGELOG.md`)
- `update.sh` prints version on completion

## [1.0.0] - 2026-03-17

Initial release.

### Added
- Superpowers plugin integration with enforcement
- Session persistence hooks (session-start.js, session-end.js, cost-tracker.js)
- Smart bash-permissions.js PreToolUse hook with compound command parsing
- Two-line status line (statusline-command.js)
- MCP server setup: Docker (AIRIS gateway) or Direct mode
- Supermind skills: /sm:init (project initialization), /sm:living-docs (doc sync)
- CLAUDE.md template with smart section-level merge
- ARCHITECTURE.md and DESIGN.md skeleton templates
- Worktree-aware permission rules
- Pencil and Magic MCP auto-detection
- setup.sh (full install) and update.sh (lightweight refresh)
