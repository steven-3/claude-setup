---
name: living-docs
description: Use at the start of every conversation and after making any code or design changes — keeps architecture.md and DESIGN.md synchronized with the codebase
---

# Living Documentation

## Overview

Maintain two living documents that stay synchronized with the codebase. **Read both before any work. Update both after any changes.**

## The Two Documents

| Document | Location | Tracks |
|----------|----------|--------|
| `architecture.md` | Project root | File structure, data flow, API contracts, dependencies, env vars |
| `DESIGN.md` | Project root | Colors, typography, spacing, shadows, animation, component patterns, page layouts |

## Workflow

### On Every Conversation Start

1. Read `architecture.md` and `DESIGN.md` from the project root (if they exist)
2. Use them as context for understanding the current system state
3. Reference them when making decisions about where code goes and how it should look
4. If either document doesn't exist and the project has enough structure to warrant one, offer to create it

### After Code Changes

Update `architecture.md` if you:
- Added, removed, or renamed files
- Changed API routes or their contracts
- Modified the data flow or added new dependencies
- Changed environment variables
- Added new types or modified existing ones
- Changed the component hierarchy

### After Design Changes

Update `DESIGN.md` if you:
- Changed colors, fonts, spacing, or shadows in globals.css
- Added or modified UI components
- Changed animation variants or timing
- Altered page layouts or responsive breakpoints
- Modified component variants or props

### Update Rules

- **Be surgical** — only update the sections that changed, don't rewrite the whole doc
- **Use the Edit tool** — don't rewrite the entire file for a small change
- **Keep it factual** — document what IS, not what should be
- **Include file paths** — always reference the actual source files
- **Match the existing format** — follow the section structure already in the doc

## Integration with Serena

If Serena MCP is available, use `write_memory` for architectural decisions that go beyond what architecture.md tracks (e.g., rationale behind choices, cross-project patterns). architecture.md tracks structure; Serena memories track reasoning.

## What NOT to Do

- Don't skip reading the docs "because you remember" — the codebase may have changed
- Don't defer updates to "later" — update immediately after changes
- Don't add aspirational content — only document current state
- Don't duplicate code in the docs — reference files, describe structure
