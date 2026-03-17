# Claude Code Setup

Portable Claude Code configuration with skills, session persistence, custom status line, and semantic code navigation.

## For Claude Code: Auto-Setup Instructions

If a user has given you this repo URL and asked you to set it up, follow these steps:

### 1. Clone and run setup

```bash
git clone https://github.com/steven-3/claude-setup.git /tmp/claude-setup
cd /tmp/claude-setup
```

If the user has API keys to configure, ask them before running setup:
- `TAVILY_API_KEY` — for web search (optional)
- `TWENTYFIRST_API_KEY` — for 21st.dev magic components (optional)

If they provide keys, create the `.env` file:
```bash
cat > /tmp/claude-setup/.env << 'EOF'
TAVILY_API_KEY=<their_key>
TWENTYFIRST_API_KEY=<their_key>
EOF
```

Then run the setup script. It will prompt the user to choose between Docker and Direct MCP installation:
```bash
bash /tmp/claude-setup/setup.sh
```

### 2. Create CLAUDE.md in the current project

After setup completes, go back to the user's project directory and run the `/init` skill to create a project-specific `CLAUDE.md`. This will:
- Copy the template to the project root
- Auto-detect the tech stack, commands, and project structure
- Fill in what it can and leave placeholders for the rest

### 3. Tell the user to restart Claude Code

The new settings, hooks, plugins, and status line take effect after restarting.

---

## What's Included

| Component | Purpose |
|-----------|---------|
| **Superpowers** | TDD, debugging, planning, code review with enforcement |
| **5 Plugins** | superpowers, claude-md-management, interface-design, frontend-design, ui-ux-pro-max |
| **Session Hooks** | Auto-save/load session context between conversations |
| **Status Line** | 2-line colored display: model, branch, context usage, active agents, cost |
| **MCP Servers** | Serena, Context7, Playwright, Tavily, chrome-devtools, shadcn (Docker or Direct) |
| **Living Docs** | Auto-syncs architecture.md and DESIGN.md with code changes |
| **CLAUDE.md Template** | Starter instructions for any new project |
| **/init skill** | Run `/init` in any project to scaffold CLAUDE.md with auto-detection |

## Manual Setup

See [SETUP.md](SETUP.md) for detailed manual installation instructions, API key configuration, per-project Serena setup, and troubleshooting.
