# Claude Code - Optimal Setup

## System Architecture
This setup uses **Superpowers** as the base skill system with ECC-inspired session persistence hooks.

## Skill System
- Superpowers skills are installed and auto-trigger per the using-superpowers meta-skill
- When I prefix a request with "quick:", skip brainstorming and skill gates
- Superpowers enforcement takes priority over all other methodology guidance
- **living-docs** skill keeps architecture.md and DESIGN.md in sync with code changes (fires on conversation start + after changes)

## Memory Protocol
- Project-specific rules belong in this file (CLAUDE.md)
- Use Serena `write_memory` for architectural decisions and conventions discovered during work
- Cross-project patterns: manually extract to `~/.serena/memories/global/` or Obsidian vault
- Session continuity is handled by hooks (session-start.js / session-end.js)

## MCP Servers
- **Serena** (via AIRIS gateway): Semantic code navigation with `--context claude-code`. Use for find-definition, find-references, rename refactoring. Serena memories persist in `.serena/memories/`
- **Context7**: Library documentation retrieval
- **Playwright**: Browser testing and interaction
- **Tavily**: Web search when WebSearch is insufficient
- **shadcn**: UI component references

## What Was Removed (and Why)
- **SuperClaude**: 17,500+ token overhead, placeholder implementations, no enforcement — every capability done better by Superpowers
- **Sequential Thinking MCP**: Redundant with Claude's native extended thinking, adds round-trip overhead
- **claude-mem**: Doubles token consumption, complex 3-process setup, 110+ open issues

## Hooks
Session persistence hooks fire automatically:
- `SessionStart`: Loads previous session summary (~500-700 tokens)
- `Stop`: Saves session context for next session + cost tracking
