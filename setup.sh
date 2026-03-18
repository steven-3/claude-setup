#!/usr/bin/env bash
set -euo pipefail

# Claude Code Optimal Setup
# Based on multi-agent research analysis (see OPTIMAL-SETUP-REPORT.md)
# Architecture: Superpowers (skills) + ECC-style hooks (persistence) + Serena (semantic nav)
# Run: bash setup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
HOOKS_DIR="$CLAUDE_DIR/hooks"
AIRIS_DIR="$HOME/.claude/airis-mcp-gateway"

echo "=== Claude Code Optimal Setup ==="
echo ""

# ── 1. Settings ──────────────────────────────────────────────
echo "[1/7] Installing settings.json..."
mkdir -p "$CLAUDE_DIR"
if [ -f "$CLAUDE_DIR/settings.json" ]; then
    cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.bak"
    echo "  Backed up existing settings to settings.json.bak"
fi
cp "$SCRIPT_DIR/settings.json" "$CLAUDE_DIR/settings.json"
echo "  Done."

# ── 2. Plugins (Superpowers + UI) ───────────────────────────
echo "[2/7] Installing plugins..."
PLUGINS=(
    "superpowers@claude-plugins-official"
    "claude-md-management@claude-plugins-official"
    "interface-design@interface-design"
    "frontend-design@claude-plugins-official"
    "ui-ux-pro-max@ui-ux-pro-max-skill"
)
for plugin in "${PLUGINS[@]}"; do
    echo "  Installing $plugin..."
    claude plugin install "$plugin" 2>/dev/null || echo "  (already installed or install manually)"
done
echo "  Done."

# ── 3. Remove SuperClaude (if present) ──────────────────────
echo "[3/7] Cleaning up deprecated components..."
if [ -d "$CLAUDE_DIR/commands/sc" ]; then
    rm -rf "$CLAUDE_DIR/commands/sc"
    echo "  Removed SuperClaude commands (replaced by Superpowers)"
fi
if [ -d "$HOME/.superclaude" ] && [ ! -d "$HOME/.superclaude/airis-mcp-gateway" ]; then
    echo "  WARNING: ~/.superclaude exists but may contain non-AIRIS data."
    echo "  Review and remove manually if no longer needed."
fi
echo "  Done."

# ── 4. Session Persistence Hooks ─────────────────────────────
echo "[4/7] Installing session persistence hooks..."
mkdir -p "$HOOKS_DIR"
cp "$SCRIPT_DIR/hooks/session-start.js" "$HOOKS_DIR/session-start.js"
cp "$SCRIPT_DIR/hooks/session-end.js" "$HOOKS_DIR/session-end.js"
cp "$SCRIPT_DIR/hooks/cost-tracker.js" "$HOOKS_DIR/cost-tracker.js"
cp "$SCRIPT_DIR/hooks/statusline-command.js" "$HOOKS_DIR/statusline-command.js"

# Install hooks.json if not already customized
if [ ! -f "$CLAUDE_DIR/hooks.json" ]; then
    # Rewrite paths to absolute
    sed "s|hooks/session-start.js|$HOOKS_DIR/session-start.js|g; s|hooks/session-end.js|$HOOKS_DIR/session-end.js|g; s|hooks/cost-tracker.js|$HOOKS_DIR/cost-tracker.js|g" \
        "$SCRIPT_DIR/hooks.json" > "$CLAUDE_DIR/hooks.json"
    echo "  Installed hooks.json"
else
    echo "  hooks.json already exists — skipped (merge manually if needed)"
fi
mkdir -p "$CLAUDE_DIR/sessions"

# Install skills
SKILLS_DIR="$CLAUDE_DIR/skills"
mkdir -p "$SKILLS_DIR/living-docs"
cp "$SCRIPT_DIR/skills/living-docs/SKILL.md" "$SKILLS_DIR/living-docs/SKILL.md"
echo "  Installed living-docs skill"
mkdir -p "$SKILLS_DIR/living-docs/init"
cp "$SCRIPT_DIR/skills/living-docs/init/SKILL.md" "$SKILLS_DIR/living-docs/init/SKILL.md"
cp "$SCRIPT_DIR/skills/living-docs/init/architecture-template.md" "$SKILLS_DIR/living-docs/init/architecture-template.md"
cp "$SCRIPT_DIR/skills/living-docs/init/design-template.md" "$SKILLS_DIR/living-docs/init/design-template.md"
echo "  Installed living-docs:init skill"
mkdir -p "$SKILLS_DIR/init"
cp "$SCRIPT_DIR/skills/init/SKILL.md" "$SKILLS_DIR/init/SKILL.md"
echo "  Installed init skill (run /init in any project)"
echo "  Done."

# ── 5. MCP Servers ──────────────────────────────────────────
echo "[5/7] Adding MCP servers..."

# Load .env for API keys
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
fi

# Pencil (local app — skip if not installed)
if [ -f "$LOCALAPPDATA/Programs/Pencil/resources/app.asar.unpacked/out/mcp-server-windows-x64.exe" ] 2>/dev/null; then
    claude mcp add -s user pencil -- "$LOCALAPPDATA/Programs/Pencil/resources/app.asar.unpacked/out/mcp-server-windows-x64.exe" --app desktop 2>/dev/null || true
    echo "  Added pencil"
fi

# Magic (21st.dev)
if [ -n "${TWENTYFIRST_API_KEY:-}" ]; then
    claude mcp add -s user -e API_KEY="$TWENTYFIRST_API_KEY" magic -- cmd /c npx -y @21st-dev/magic@latest 2>/dev/null || true
    echo "  Added magic"
else
    echo "  Skipped magic (no TWENTYFIRST_API_KEY in .env)"
fi

# Ask user for MCP mode
echo ""
echo "  How would you like to install MCP servers?"
echo "    [1] Docker via AIRIS gateway (recommended — single endpoint, all servers managed)"
echo "    [2] Direct (each server registered individually, no Docker required)"
echo ""
read -r -p "  Choose [1/2] (default: 1): " MCP_MODE
MCP_MODE="${MCP_MODE:-1}"

if [ "$MCP_MODE" = "2" ]; then
    # ── Direct MCP Installation ──────────────────────────────
    echo ""
    echo "  Installing MCP servers directly..."

    claude mcp add -s user context7 -- npx -y @upstash/context7-mcp 2>/dev/null || true
    echo "  Added context7 (library docs)"

    claude mcp add -s user playwright -- npx -y @playwright/mcp@latest 2>/dev/null || true
    echo "  Added playwright (browser automation)"

    claude mcp add -s user serena -- uvx --from "git+https://github.com/oraios/serena" serena start-mcp-server --context claude-code --enable-web-dashboard false --enable-gui-log-window false 2>/dev/null || true
    echo "  Added serena (semantic code navigation)"

    if [ -n "${TAVILY_API_KEY:-}" ]; then
        claude mcp add -s user -e TAVILY_API_KEY="$TAVILY_API_KEY" tavily -- npx -y tavily-mcp@0.1.2 2>/dev/null || true
        echo "  Added tavily (web search)"
    else
        echo "  Skipped tavily (no TAVILY_API_KEY in .env)"
    fi

    claude mcp add -s user chrome-devtools -- npx -y chrome-devtools-mcp@latest 2>/dev/null || true
    echo "  Added chrome-devtools"

    claude mcp add -s user shadcn -- npx -y shadcn@latest mcp 2>/dev/null || true
    echo "  Added shadcn (UI components)"

    MCP_INSTALL_MODE="direct"
    echo "  Done (direct mode)."
else
    # ── Docker/AIRIS MCP Installation ────────────────────────
    claude mcp add --transport sse -s user airis-mcp-gateway http://localhost:9400/sse 2>/dev/null || true
    echo "  Added airis-mcp-gateway (routes: serena, context7, playwright, tavily, shadcn, chrome-devtools)"
    MCP_INSTALL_MODE="docker"
    echo "  Done."
fi

# ── 6. AIRIS Gateway (Docker mode only) ─────────────────────
if [ "$MCP_INSTALL_MODE" = "docker" ]; then
    echo "[6/7] Setting up AIRIS MCP Gateway..."

    # Check if Docker is installed, offer to install if not
    if ! command -v docker &>/dev/null; then
        echo ""
        echo "  Docker is not installed."
        OS_TYPE="$(uname -s)"
        case "$OS_TYPE" in
            Darwin)
                # macOS — auto-install via Homebrew
                if command -v brew &>/dev/null; then
                    read -r -p "  Install Docker Desktop via Homebrew? [Y/n]: " INSTALL_DOCKER
                    INSTALL_DOCKER="${INSTALL_DOCKER:-Y}"
                    if [[ "$INSTALL_DOCKER" =~ ^[Yy]$ ]]; then
                        echo "  Installing Docker Desktop..."
                        brew install --cask docker 2>&1 | sed 's/^/  /'
                        echo ""
                        echo "  Docker Desktop installed. Please launch it from Applications"
                        echo "  to complete first-time setup, then re-run this script."
                        exit 0
                    fi
                else
                    echo "  Install Homebrew first (https://brew.sh), then re-run setup."
                    echo "  Or download Docker Desktop: https://www.docker.com/products/docker-desktop/"
                fi
                ;;
            MINGW*|MSYS*|CYGWIN*|*_NT*)
                # Windows — cannot auto-install, direct user to download
                echo ""
                echo "  On Windows, Docker Desktop must be installed manually."
                echo "  Download it from: https://www.docker.com/products/docker-desktop/"
                echo ""
                echo "  After installing:"
                echo "    1. Enable WSL2 if prompted (wsl --install)"
                echo "    2. Restart your computer"
                echo "    3. Launch Docker Desktop"
                echo "    4. Re-run: bash setup.sh"
                ;;
            *)
                echo "  Install Docker: https://docs.docker.com/engine/install/"
                ;;
        esac
        echo ""
        read -r -p "  Continue setup without Docker? Files will be copied for later. [Y/n]: " CONTINUE_NO_DOCKER
        CONTINUE_NO_DOCKER="${CONTINUE_NO_DOCKER:-Y}"
        if [[ ! "$CONTINUE_NO_DOCKER" =~ ^[Yy]$ ]]; then
            echo "  Setup paused. Install Docker and re-run."
            exit 0
        fi
    fi

    mkdir -p "$AIRIS_DIR"
    cp "$SCRIPT_DIR/airis/docker-compose.yml" "$AIRIS_DIR/docker-compose.yml"
    cp "$SCRIPT_DIR/airis/mcp-config.json" "$AIRIS_DIR/mcp-config.json"
    mkdir -p "$AIRIS_DIR/profiles"

    if [ -f "$SCRIPT_DIR/.env" ]; then
        cp "$SCRIPT_DIR/.env" "$AIRIS_DIR/.env"
    fi

    echo "  Files copied to $AIRIS_DIR"
    echo "  Start gateway with: cd $AIRIS_DIR && docker compose up -d"

    # Auto-start if Docker is available and running
    if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
        echo "  Docker detected — starting gateway..."
        cd "$AIRIS_DIR" && docker compose up -d 2>&1 | sed 's/^/  /'
        echo "  Gateway started."
    else
        echo "  Docker not running — start manually after installing/launching Docker."
    fi
else
    echo "[6/7] Skipping AIRIS Gateway (direct mode selected)."
fi

# ── 7. CLAUDE.md Template ──────────────────────────────────
echo "[7/7] Installing CLAUDE.md template..."
TEMPLATE_SRC="$SCRIPT_DIR/templates/CLAUDE.md"
TEMPLATE_DEST="$CLAUDE_DIR/templates"
mkdir -p "$TEMPLATE_DEST"
cp "$TEMPLATE_SRC" "$TEMPLATE_DEST/CLAUDE.md"
echo "  Template installed to $TEMPLATE_DEST/CLAUDE.md"
echo "  Done."

# ── Verify ──────────────────────────────────────────────────
echo ""
echo "=== Setup complete! ==="
echo ""
echo "Architecture:"
echo "  Base skills:   Superpowers (auto-trigger, enforcement, TDD, debugging)"
echo "  Plugins:       interface-design, frontend-design, ui-ux-pro-max, claude-md-management"
echo "  Persistence:   Session hooks (session-start.js, session-end.js)"
echo "  Status line:   Custom 2-line display with metrics + subagent tracking"
if [ "$MCP_INSTALL_MODE" = "docker" ]; then
    echo "  MCP mode:      Docker via AIRIS gateway (localhost:9400)"
    echo "  Code nav:      Serena MCP (--context claude-code via AIRIS)"
else
    echo "  MCP mode:      Direct (each server registered individually)"
    echo "  Code nav:      Serena MCP (--context claude-code, standalone)"
fi
echo "  Removed:       SuperClaude, Sequential Thinking, claude-mem"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and add your API keys (if not done)"
if [ "$MCP_INSTALL_MODE" = "docker" ]; then
    echo "  2. Start AIRIS gateway: cd $AIRIS_DIR && docker compose up -d"
else
    echo "  2. Ensure Python/uvx is installed (required for Serena in direct mode)"
fi
echo "  3. Restart Claude Code"
echo "  4. Verify: 'claude mcp list' should show all servers"
echo "  5. Test: Ask Claude to debug something — Superpowers should auto-trigger"
echo ""
echo "New project setup:"
echo "  cp ~/.claude/templates/CLAUDE.md /path/to/project/CLAUDE.md"
echo "  Then fill in the project-specific sections (Commands, Tech Stack, Structure)"
echo ""
echo "See SETUP.md for full documentation and per-project setup."
