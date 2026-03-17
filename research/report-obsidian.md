# Obsidian as a Knowledge System for Claude Code

## Executive Summary

Obsidian is a local-first, markdown-based knowledge management application that has emerged as one of the most popular "second brain" tools for developers using Claude Code. Because Obsidian vaults are just directories of plain markdown files, they integrate naturally with Claude Code's filesystem-based workflow. A rich ecosystem of MCP servers, community plugins, and integration patterns has developed, making Obsidian a viable persistent knowledge layer for AI-assisted development.

---

## 1. Available MCP Servers and Integrations

### Primary MCP Servers

| Server | Transport | Language | Stars | Key Differentiator |
|--------|-----------|----------|-------|--------------------|
| [obsidian-claude-code-mcp](https://github.com/iansinnott/obsidian-claude-code-mcp) | WebSocket + HTTP/SSE | TypeScript | - | Native Claude Code auto-discovery via `/ide` |
| [mcp-obsidian (MarkusPfundstein)](https://github.com/MarkusPfundstein/mcp-obsidian) | stdio (via REST API) | Python | 3k | Most mature; 7 tools; requires Local REST API plugin |
| [mcp-obsidian (smithery-ai)](https://github.com/smithery-ai/mcp-obsidian) | stdio | JavaScript | 1.3k | Simplest setup; reads any markdown directory |
| [obsidian-mcp-tools](https://github.com/jacksteamdev/obsidian-mcp-tools) | stdio | TypeScript | - | Semantic search via Smart Connections; Templater integration |
| [obsidian-semantic-mcp](https://github.com/aaronsb/obsidian-semantic-mcp) | stdio | JavaScript | - | Consolidates 20+ tools into 5 semantic operations with workflow hints |
| [Claudesidian MCP / Nexus](https://github.com/ProfSynapse/claudesidian-mcp) | stdio | JavaScript | 83 | Agent-mode architecture; local embeddings via sqlite-vec |

### Detailed Server Breakdown

#### obsidian-claude-code-mcp (Ian Sinnott)
The most Claude Code-native option. Installs as an Obsidian plugin and exposes an MCP server on port 22360. Claude Code auto-discovers it through the `/ide` command, selecting "Obsidian" from the IDE list.

**Tools exposed:**
- File operations: `view`, `str_replace`, `create`, `insert`
- Workspace: `get_current_file`, `get_workspace_files`
- API access: `obsidian_api`
- IDE-specific (WebSocket only): `getDiagnostics`, `openDiff`, `close_tab`

**Limitation:** Uses the legacy HTTP+SSE protocol (2024-11-05) because the newer Streamable HTTP protocol (2025-03-26) is not yet supported by Claude Code or Claude Desktop.

#### mcp-obsidian (MarkusPfundstein)
The most established server with 3,000+ stars. Requires the Local REST API community plugin running in Obsidian.

**Tools exposed:**
1. `list_files_in_vault` - Root-level file listing
2. `list_files_in_dir` - Directory contents
3. `get_file_contents` - Read individual notes
4. `search` - Full-text search across vault
5. `patch_content` - Insert relative to headings/block refs
6. `append_content` - Add to new or existing files
7. `delete_file` - Remove files/directories

**Setup:** `uvx mcp-obsidian` with environment variables `OBSIDIAN_API_KEY`, `OBSIDIAN_HOST`, `OBSIDIAN_PORT`.

#### obsidian-semantic-mcp (Aaron Bostrom)
A novel approach that consolidates 20+ granular tools into 5 semantic operations, reducing AI decision fatigue:

1. **vault** - File/folder management (list, read, create, update, delete, search, fragments)
2. **edit** - Smart content modification with fuzzy matching
3. **view** - Content navigation with context windows
4. **workflow** - Guided next-step suggestions
5. **system** - Infrastructure operations

**Standout features:**
- Fragment retrieval: Returns relevant sections from large files using TF-IDF, proximity, or semantic chunking strategies
- Fuzzy window editing: Tolerates minor text variations when locating content to replace
- State-aware workflow hints via Petri net-inspired token tracking

#### obsidian-mcp-tools (Jack Steamdev)
Adds semantic search to the MCP layer using Obsidian's Smart Connections plugin. Requires Obsidian v1.7.7+. The server binary installs to `{vault}/.obsidian/plugins/obsidian-mcp-tools/bin/` and connects via stdio.

Three capabilities:
1. Vault access (via Local REST API)
2. Semantic search (via Smart Connections)
3. Template execution (via Templater)

### Non-MCP Integrations

- **Claude Vault** ([ksanderer/claude-vault](https://github.com/ksanderer/claude-vault)): Git-based sync between Claude Code and Obsidian using a PARA-structured vault template. Users interact in Obsidian; Claude interacts via Claude Code; Git synchronizes changes.
- **Obsidian CLI** (v1.12+): Direct agent access to vault operations; 54x faster than grep for tasks like finding orphan notes.
- **Official Claude Skills for Obsidian**: Kepano (Obsidian CEO) is building official Claude Skills to help Claude Code edit `.md`, `.base`, and `.canvas` files natively.

---

## 2. How Vault Content Gets Injected into Claude's Context

### Method A: Direct Filesystem Access (No MCP Required)

The simplest approach. Run `claude` from within or adjacent to your Obsidian vault directory. Claude Code reads markdown files directly via its built-in filesystem tools (`Read`, `Glob`, `Grep`).

**How context flows:**
1. `CLAUDE.md` at vault root loads automatically at session start with standing instructions
2. Claude uses `Glob` to discover vault structure
3. Claude uses `Read` to pull specific notes into context
4. Claude uses `Grep` to search across vault content

**Strengths:** Zero dependencies; works immediately; no plugins required.
**Weaknesses:** No semantic search; Claude must guess which files are relevant; large vaults consume many tokens.

### Method B: MCP Server Bridge

An MCP server runs inside (or alongside) Obsidian, exposing vault operations as callable tools. Claude Code queries the vault while working in any repository.

**How context flows:**
1. Claude Code connects to MCP server (auto-discovery or manual config)
2. Claude calls tools like `search`, `get_file_contents`, `list_files_in_vault`
3. Results return as tool responses, injected into conversation context
4. Claude can also write back via `append_content`, `patch_content`, `create`

**Strengths:** Works from any working directory; structured API access; can add semantic search.
**Weaknesses:** Requires Obsidian running; adds infrastructure complexity; each tool call costs tokens.

### Method C: Session Hooks and Skills

Claude Code hooks and custom slash commands automate context injection:

- **SessionStart hook**: Automatically checks vault's Inbox folder at session start; surfaces new notes
- **`/vault-review` skill**: Reads vault notes, compares against current discussion, proposes updates
- **`/recall` skill**: Pulls relevant context from vault before starting new work
- **`/my-world` command**: Loads full vault context on demand

### Method D: QMD Semantic Chunking

QMD provides semantic search over markdown vaults with reported 60%+ token reduction vs. grep. Combined with `sync-claude-sessions` (auto-exports Claude Code sessions to markdown), it creates a fully searchable session history within the vault.

---

## 3. Retrieval Mechanisms

### Full-Text Search
- Built into most MCP servers (mcp-obsidian's `search` tool, semantic-mcp's `vault` operation)
- Claude Code's native `Grep` works directly on vault files
- Obsidian CLI (v1.12+) provides optimized search: 0.26s vs. grep's 15.6s for orphan notes

### Semantic Search
- **Smart Connections plugin** + obsidian-mcp-tools: Meaning-based search across vault
- **Claudesidian / Nexus**: Local embeddings via Ollama or sqlite-vec vector search with no external API calls
- **obsidian-semantic-mcp**: Fragment retrieval using TF-IDF keyword matching, proximity detection, or semantic document chunking
- **QMD**: Semantic chunking with 60%+ token reduction

### Backlinks and Graph Traversal
Obsidian's `[[wikilinks]]` create a navigable knowledge graph. Advanced retrieval can:
- Follow backlinks to expand context (GraphRAG approach)
- Surface connected notes up to two hops away
- Reveal hidden connections between ideas
- Enable Claude to traverse relationships between concepts

### Tags and Metadata
- Frontmatter YAML properties enable structured filtering (`type: claude-config`, `project: my-app`, `stack: [nextjs, tailwind]`)
- AI Tagger plugin auto-generates tags using LLMs
- Dataview queries aggregate notes by metadata across the vault
- Tags serve as retrieval anchors for both human browsing and AI search

### Folder Structure and Index Files
- Per-folder `index.md` files act as navigation maps
- `VAULT-INDEX.md` serves as a master dashboard
- CLAUDE.md instructs Claude to update indexes on file create/delete, creating a self-maintaining directory

---

## 4. Practical Setup for a Developer Knowledge Base

### Recommended Architecture: Strategy 1 (Dedicated Developer Vault with Symlinks)

```
~/Developer-Vault/
├── CLAUDE.md                    # Global instructions for Claude
├── .claude/                     # Skills, hooks, slash commands
│   ├── hooks/
│   │   └── session-start.sh     # Auto-check inbox on session start
│   └── skills/
│       ├── vault-review.md      # /vault-review command
│       └── recall.md            # /recall command
├── claude-global -> ~/.claude   # Symlink to global Claude config
├── projects/
│   ├── my-app -> ~/projects/my-app  # Symlink to actual repo
│   ├── my-api -> ~/projects/my-api
│   └── index.md                 # Project directory
├── knowledge/
│   ├── patterns/                # Reusable code patterns
│   ├── architecture/            # Architecture decision records
│   ├── debugging/               # Bug solutions and fixes
│   └── tools/                   # Tool configurations and tips
├── research/                    # Research notes and findings
├── daily-notes/                 # Daily developer journal
├── inbox/                       # Quick capture; processed by Claude
└── templates/                   # Templater templates for new notes
```

**Obsidian configuration** (`.obsidian/app.json`):
```json
{
  "userIgnoreFilters": [
    "node_modules/", ".next/", "dist/", ".git/", ".vercel/",
    "/.*\\.js/", "/.*\\.json/", "/.*\\.png/"
  ]
}
```

### Essential Plugins

| Plugin | Purpose |
|--------|---------|
| Local REST API | Enables MCP server communication |
| File Explorer++ | Filter/hide non-markdown files |
| Dataview | Query across notes by metadata |
| Templater | Standardized note creation templates |
| Smart Connections | Semantic search for MCP tools |
| obsidian-claude-code-mcp | Claude Code auto-discovery |

### CLAUDE.md Template for Vault

```markdown
---
type: claude-config
vault: developer-brain
status: active
---

# Developer Vault -- Claude Code Configuration

## Vault Conventions
- All notes use [[wikilinks]] for internal references
- Every folder has an index.md; update it when creating/deleting files
- Tags use kebab-case: #architecture-decision, #bug-fix, #code-pattern
- Frontmatter includes: type, project, tags, date, status

## Retrieval Instructions
- Before starting work, check inbox/ for unprocessed notes
- Search knowledge/ for relevant patterns before writing new code
- Check projects/{project-name}/ for project-specific context
- Reference architecture/ for system design decisions

## Writing Rules
- Keep notes atomic: one concept per note
- Link related concepts with [[wikilinks]]
- Add frontmatter metadata to every new note
- Prefer updating existing notes over creating duplicates
```

### MCP Configuration for Claude Code

Add to `~/.claude/claude_desktop_config.json` or project `.mcp.json`:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "uvx",
      "args": ["mcp-obsidian"],
      "env": {
        "OBSIDIAN_API_KEY": "your-api-key",
        "OBSIDIAN_HOST": "127.0.0.1",
        "OBSIDIAN_PORT": "27124"
      }
    }
  }
}
```

Or for the auto-discovery approach (obsidian-claude-code-mcp):
1. Install the plugin in Obsidian
2. Run `claude` and type `/ide`
3. Select "Obsidian" -- connection established automatically on port 22360

---

## 5. Obsidian vs. Other Memory Systems

### Comparison Matrix

| Dimension | CLAUDE.md / Built-in Memory | mem0 | Obsidian Vault | QMD |
|-----------|---------------------------|------|----------------|-----|
| **Storage** | Flat markdown files | Vector database + API | Markdown files in graph | Semantic chunks |
| **Search** | Filename guessing; no semantic | Semantic by meaning | Full-text + optional semantic | Semantic with 60% token reduction |
| **Persistence** | Per-project files | Cross-project service | Cross-project local vault | Cross-project local |
| **Human editing** | Text editor | API only | Rich GUI (Obsidian) | CLI |
| **Visualization** | None | None | Graph view, canvas, backlinks | None |
| **Cost** | Free | Self-hosted or paid | Free (core) + $4/mo sync | Free |
| **Setup complexity** | Zero | Medium (Docker/API) | Low-Medium | Medium |
| **Agent-agnostic** | No (Claude-specific) | Yes (MCP) | Yes (markdown) | Yes |
| **Mobile capture** | No | API | Yes (Obsidian mobile + sync) | No |
| **Token efficiency** | Low (loads full files) | High (90% reduction reported) | Medium (depends on retrieval) | High (60%+ reduction) |

### When Obsidian Wins

1. **You want human-readable, human-editable knowledge**: Obsidian's GUI with backlinks, graph view, and rich rendering makes knowledge browsable and maintainable by humans, not just machines.

2. **Cross-project knowledge sharing**: A single vault can serve context to multiple projects via symlinks or MCP, unlike project-scoped CLAUDE.md files.

3. **Mobile capture workflow**: Obsidian mobile + Syncthing or Obsidian Sync enables capturing notes on the go, processed by Claude Code later via session hooks.

4. **Visual knowledge mapping**: Graph view reveals connections between concepts that flat files cannot show. Canvas files enable visual architecture diagrams.

5. **Long-term knowledge accumulation**: The vault grows over time, accumulating patterns, decisions, and solutions that survive individual project lifespans.

6. **Agent-agnostic future-proofing**: Because the vault is just markdown files, it works with any future AI tool, not just Claude Code.

### When Obsidian Falls Short

1. **Token efficiency**: Without semantic search, Claude must read full files or guess which files to open. This is less efficient than mem0's semantic retrieval or QMD's chunking.

2. **Automated relevance**: mem0 automatically extracts and surfaces relevant memories. Obsidian requires manual organization or additional semantic search plugins.

3. **Setup overhead**: Adding MCP servers, REST API plugins, and semantic search requires more configuration than Claude Code's built-in MEMORY.md approach.

4. **Research finding on context files**: A study ("Evaluating AGENTS.md") found that LLM-generated context files can decrease agent performance by 0.5-2% while raising costs by 20%+. The key is human-curated, concise vault content rather than AI-generated bulk.

### Complementary Usage (Recommended)

The best approach combines systems rather than replacing one with another:

- **CLAUDE.md**: Project-specific coding instructions, style guides, architecture constraints (loads automatically, zero overhead)
- **Obsidian vault**: Cross-project knowledge base, research notes, decision logs, pattern libraries (accessed via MCP or direct filesystem)
- **mem0 or QMD** (optional): Semantic memory layer for high-volume retrieval where token efficiency matters

The "Agents Read, Humans Write" principle applies: keep your authentic thinking and curated knowledge in Obsidian. Let Claude read it for context. Keep Claude's outputs in project directories or `.claude/`, not polluting the vault with generated content.

---

## 6. Key Community Patterns

### Pattern: Status File Per Project
Create one `status.md` per project containing phase progress, remaining tasks, and a decision log. Claude reads this at session start for instant context.

### Pattern: Session Export and Review
Use `sync-claude-sessions` to auto-export Claude Code conversations to the vault as markdown. Run `/vault-review` to let Claude reconcile session learnings with existing knowledge.

### Pattern: Kickoff Interview
Prompt Claude: "Ask me about my goals, tasks, preferences. Ask one question at a time. Continue until fully aligned. Propose folder structure and starter files. Then execute." This bootstraps a personalized vault structure.

### Pattern: Atomic Notes with Wikilinks
Structure knowledge as single-concept notes linked by `[[wikilinks]]`. This enables graph traversal for context expansion and makes individual facts reusable across contexts. Developers report finding forgotten solutions 60-70% faster when AI can traverse these connections.

---

## 7. Conclusions and Recommendations

### Verdict

Obsidian is the strongest candidate for a developer knowledge base that serves both human browsing and AI context injection. Its markdown foundation makes it inherently compatible with Claude Code, and the MCP ecosystem is mature enough for production use.

### Recommended Starting Point

1. Create a dedicated developer vault
2. Install `obsidian-claude-code-mcp` for auto-discovery, or `mcp-obsidian` (MarkusPfundstein) for the most stable MCP bridge
3. Write a focused `CLAUDE.md` with vault conventions
4. Start with direct filesystem access; add MCP only when working outside the vault directory
5. Add semantic search (Smart Connections + obsidian-mcp-tools) only after the vault grows large enough to need it

### Watch List

- **Official Claude Skills for Obsidian** (from Kepano) -- will likely simplify the integration significantly
- **Obsidian CLI** (v1.12+) -- provides faster, more token-efficient vault access than REST API
- **Nexus** (successor to Claudesidian) -- local semantic search without external API calls
- **Streamable HTTP protocol** adoption -- will modernize MCP transport once Claude Code supports it

---

## Sources

- [obsidian-claude-code-mcp (Ian Sinnott)](https://github.com/iansinnott/obsidian-claude-code-mcp)
- [mcp-obsidian (MarkusPfundstein)](https://github.com/MarkusPfundstein/mcp-obsidian)
- [mcp-obsidian (smithery-ai)](https://github.com/smithery-ai/mcp-obsidian)
- [obsidian-mcp-tools (Jack Steamdev)](https://github.com/jacksteamdev/obsidian-mcp-tools)
- [obsidian-semantic-mcp (Aaron Bostrom)](https://github.com/aaronsb/obsidian-semantic-mcp)
- [Claudesidian MCP / Nexus](https://github.com/ProfSynapse/claudesidian-mcp)
- [claude-vault (ksanderer)](https://github.com/ksanderer/claude-vault)
- [obsidian-claude-pkm (ballred)](https://github.com/ballred/obsidian-claude-pkm)
- [Obsidian + Claude Code: The Complete Integration Guide](https://blog.starmorph.com/blog/obsidian-claude-code-integration-guide)
- [Build Your Second Brain With Claude Code & Obsidian](https://www.whytryai.com/p/claude-code-obsidian)
- [Claude Code + Obsidian: Persistent Memory That Works](https://www.chaseai.io/blog/claude-code-obsidian-persistent-memory)
- [Memory Systems That Don't Forget: QMD, Mem0, Cognee, Obsidian](https://agentnativedev.medium.com/openclaw-memory-systems-that-dont-forget-qmd-mem0-cognee-obsidian-4ad96c02c9cc)
- [Claude Code Memory vs mem0 Tested](https://www.logicweave.ai/claude-code-memory-vs-mem0-tested/)
- [How Claude + Obsidian + MCP Solved My Organizational Problems](https://www.eleanorkonik.com/p/how-claude-obsidian-mcp-solved-my)
- [Claude MCP for Obsidian using Rest API (Obsidian Forum)](https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284)
- [I put Claude Code inside Obsidian, and it was awesome (XDA)](https://www.xda-developers.com/claude-code-inside-obsidian-and-it-was-eye-opening/)
- [Turning Obsidian into an AI-Native Knowledge System with Claude Code](https://medium.com/@martk/turning-obsidian-into-an-ai-native-knowledge-system-with-claude-code-27cb224404cf)
- [Obsidian AI Second Brain: Complete Guide 2026](https://www.nxcode.io/resources/news/obsidian-ai-second-brain-complete-guide-2026)
- [MCP-Vault](https://mcp-obsidian.org/)
