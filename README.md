# Supermind

A unified skill engine for Claude Code — execution infrastructure meets behavioral discipline. Two modes, 15 skills, 8 hooks, zero dependencies.

## Install

```bash
npx supermind-claude
```

Or install globally: `npm install -g supermind-claude && supermind-claude`

Then run `/supermind-init` in any project to generate CLAUDE.md, ARCHITECTURE.md, and DESIGN.md.

## Two Modes

**`/quick`** — Single-executor path for small tasks (bug fixes, renames, config changes). Fast and stateless.

**`/project`** — Full six-phase lifecycle for features and refactors: discuss, research, plan, execute (parallel waves), verify, ship. Coordinates fresh-context subagents with injected methodology skills.

**`/supermind`** auto-detects which mode fits your task and routes accordingly.

## What's Included

| Component | Count | Purpose |
|-----------|-------|---------|
| Skills | 15 | Complexity router, TDD, debugging, brainstorming, code review, planning, execution, worktrees, and more |
| Hooks | 8 | Bash permissions (blocklist), session persistence, cost tracking, status line, context monitoring |
| Agents | 1 | Code reviewer for structured review in verify phase |
| Executor engine | 3 modules | Task packets, wave parallelism, agent prompt templates (cli/lib/) |
| Safety layer | 1 hook | Blocklist-based command classification with gate override logging |
| Living docs | 2 skills | Project onboarding (/supermind-init) and doc sync (/supermind-living-docs) |
| Vendor skills | CLI | Install third-party skills from GitHub with hash-locked integrity |
| Plugin | manifest | Dual distribution: npm package + Claude Code plugin |

## Commands

| Command | Purpose |
|---------|---------|
| `supermind-claude` | Full global setup |
| `supermind-claude update` | Refresh hooks, skills, templates |
| `supermind-claude doctor` | Verify installation health |
| `supermind-claude uninstall` | Remove all components |
| `supermind-claude approve "cmd"` | Auto-approve a blocked command |
| `supermind-claude skill add <url>` | Install vendor skill from GitHub |
| `supermind-claude skill update [name]` | Update vendor skill(s) |
| `supermind-claude skill list` | List installed vendor skills |
| `supermind-claude skill remove <name>` | Remove vendor skill |

## MCP Servers

Optional. Choose during setup:
- **Docker** (AIRIS gateway): Single endpoint routing to context7, playwright, serena, tavily, chrome-devtools, shadcn
- **Direct**: Individual servers via npx/uvx

## Platforms

Windows, macOS, and Linux. Requires Node.js >= 18.

## Troubleshooting

Run `supermind-claude doctor` to check installation health.

## Credits

Methodology skills forked from [obra/superpowers](https://github.com/obra/superpowers) (MIT) by Jesse Vincent and the Prime Radiant team. Execution architecture inspired by [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) (MIT). Both adapted and rebuilt as Supermind-native implementations.
