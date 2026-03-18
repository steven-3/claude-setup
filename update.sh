#!/usr/bin/env bash
set -euo pipefail

# Lightweight update — refreshes hooks, skills, and templates only.
# Does NOT touch settings.json, plugins, or MCP servers.
# Run: bash update.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
HOOKS_DIR="$CLAUDE_DIR/hooks"
SKILLS_DIR="$CLAUDE_DIR/skills"

echo "=== Claude Code Update (hooks + skills + templates) ==="
echo ""

# ── Hooks ──────────────────────────────────────────────────
echo "[1/3] Updating hooks..."
mkdir -p "$HOOKS_DIR"
for hook in session-start.js session-end.js cost-tracker.js statusline-command.js bash-permissions.js; do
    if [ -f "$SCRIPT_DIR/hooks/$hook" ]; then
        cp "$SCRIPT_DIR/hooks/$hook" "$HOOKS_DIR/$hook"
    fi
done
echo "  Updated: session-start, session-end, cost-tracker, statusline, bash-permissions"

# ── Skills ─────────────────────────────────────────────────
echo "[2/3] Updating skills..."

# Remove old /init skill (renamed to /sm:init)
if [ -d "$SKILLS_DIR/init" ]; then
    rm -rf "$SKILLS_DIR/init"
    echo "  Removed old /init skill"
fi

mkdir -p "$SKILLS_DIR/sm/init"
cp "$SCRIPT_DIR/skills/sm/init/SKILL.md" "$SKILLS_DIR/sm/init/SKILL.md"
echo "  Updated sm:init"

mkdir -p "$SKILLS_DIR/living-docs"
cp "$SCRIPT_DIR/skills/living-docs/SKILL.md" "$SKILLS_DIR/living-docs/SKILL.md"
echo "  Updated living-docs"

mkdir -p "$SKILLS_DIR/living-docs/init"
cp "$SCRIPT_DIR/skills/living-docs/init/SKILL.md" "$SKILLS_DIR/living-docs/init/SKILL.md"
cp "$SCRIPT_DIR/skills/living-docs/init/architecture-template.md" "$SKILLS_DIR/living-docs/init/architecture-template.md"
cp "$SCRIPT_DIR/skills/living-docs/init/design-template.md" "$SKILLS_DIR/living-docs/init/design-template.md"
echo "  Updated living-docs:init + templates"

# ── Templates ──────────────────────────────────────────────
echo "[3/3] Updating CLAUDE.md template..."
TEMPLATE_DEST="$CLAUDE_DIR/templates"
mkdir -p "$TEMPLATE_DEST"
cp "$SCRIPT_DIR/templates/CLAUDE.md" "$TEMPLATE_DEST/CLAUDE.md"
echo "  Updated template"

echo ""
echo "=== Update complete ==="
echo "Restart Claude Code (or open /hooks) to pick up changes."
