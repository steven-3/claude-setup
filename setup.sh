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
echo "[1/6] Installing settings.json..."
mkdir -p "$CLAUDE_DIR"
if [ -f "$CLAUDE_DIR/settings.json" ]; then
    cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.bak"
    echo "  Backed up existing settings to settings.json.bak"
fi
cp "$SCRIPT_DIR/settings.json" "$CLAUDE_DIR/settings.json"
echo "  Done."

# ── 2. Plugins (Superpowers + UI) ───────────────────────────
echo "[2/6] Installing plugins..."
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
echo "[3/6] Cleaning up deprecated components..."
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
echo "[4/6] Installing session persistence hooks..."
mkdir -p "$HOOKS_DIR"
cp "$SCRIPT_DIR/hooks/session-start.js" "$HOOKS_DIR/session-start.js"
cp "$SCRIPT_DIR/hooks/session-end.js" "$HOOKS_DIR/session-end.js"
cp "$SCRIPT_DIR/hooks/cost-tracker.js" "$HOOKS_DIR/cost-tracker.js"

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

# Install living-docs skill
SKILLS_DIR="$CLAUDE_DIR/skills"
mkdir -p "$SKILLS_DIR/living-docs"
cp "$SCRIPT_DIR/skills/living-docs/SKILL.md" "$SKILLS_DIR/living-docs/SKILL.md"
echo "  Installed living-docs skill"
echo "  Done."

# ── 5. MCP Servers ──────────────────────────────────────────
echo "[5/6] Adding MCP servers..."

# Pencil (local app — skip if not installed)
if [ -f "$LOCALAPPDATA/Programs/Pencil/resources/app.asar.unpacked/out/mcp-server-windows-x64.exe" ] 2>/dev/null; then
    claude mcp add -s user pencil -- "$LOCALAPPDATA/Programs/Pencil/resources/app.asar.unpacked/out/mcp-server-windows-x64.exe" --app desktop 2>/dev/null || true
    echo "  Added pencil"
fi

# Magic (21st.dev)
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
fi
if [ -n "${TWENTYFIRST_API_KEY:-}" ]; then
    claude mcp add -s user -e API_KEY="$TWENTYFIRST_API_KEY" magic -- cmd /c npx -y @21st-dev/magic@latest 2>/dev/null || true
    echo "  Added magic"
else
    echo "  Skipped magic (no TWENTYFIRST_API_KEY in .env)"
fi

# AIRIS gateway (SSE) — routes to Serena, Context7, Playwright, etc.
claude mcp add --transport sse -s user airis-mcp-gateway http://localhost:9400/sse 2>/dev/null || true
echo "  Added airis-mcp-gateway (routes: serena, context7, playwright, tavily, shadcn)"
echo "  Done."

# ── 6. AIRIS Gateway ────────────────────────────────────────
echo "[6/6] Setting up AIRIS MCP Gateway..."
mkdir -p "$AIRIS_DIR"
cp "$SCRIPT_DIR/airis/docker-compose.yml" "$AIRIS_DIR/docker-compose.yml"
cp "$SCRIPT_DIR/airis/mcp-config.json" "$AIRIS_DIR/mcp-config.json"
mkdir -p "$AIRIS_DIR/profiles"

if [ -f "$SCRIPT_DIR/.env" ]; then
    cp "$SCRIPT_DIR/.env" "$AIRIS_DIR/.env"
fi

echo "  Files copied to $AIRIS_DIR"
echo "  Start gateway with: cd $AIRIS_DIR && docker compose up -d"

# Auto-start if Docker is available
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    echo "  Docker detected — starting gateway..."
    cd "$AIRIS_DIR" && docker compose up -d 2>&1 | sed 's/^/  /'
    echo "  Gateway started."
else
    echo "  Docker not running — start manually later."
fi

# ── Verify ──────────────────────────────────────────────────
echo ""
echo "=== Setup complete! ==="
echo ""
echo "Architecture:"
echo "  Base skills:   Superpowers (auto-trigger, enforcement, TDD, debugging)"
echo "  Persistence:   Session hooks (session-start.js, session-end.js)"
echo "  Code nav:      Serena MCP (--context claude-code via AIRIS)"
echo "  Removed:       SuperClaude, Sequential Thinking, claude-mem"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and add your API keys"
echo "  2. Start AIRIS gateway: cd $AIRIS_DIR && docker compose up -d"
echo "  3. Restart Claude Code"
echo "  4. Verify: 'claude mcp list' should show all servers"
echo "  5. Test: Ask Claude to debug something — Superpowers should auto-trigger"
echo ""
echo "See OPTIMAL-SETUP-REPORT.md for full research and rationale."
