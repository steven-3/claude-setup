# claude-mem Analysis Report

**Repo:** https://github.com/thedotmack/claude-mem
**Version analyzed:** 10.5.6 (plugin.json shows 10.4.1)
**Language:** TypeScript (Bun runtime)
**License:** AGPL-3.0 (ragtime subdir: PolyForm Noncommercial 1.0.0)
**Created:** 2025-08-31
**Last updated:** 2026-03-17

---

## 1. Architecture Overview

claude-mem is a **Claude Code plugin** that runs a persistent background worker process to capture, compress, and recall context across sessions. It is a substantial system (~119KB repo) with multiple coordinating subsystems.

### Core Components

```
Plugin Hooks (hooks.json)          Claude Code lifecycle events
        |
        v
Worker Service (port 37777)        Background HTTP server (Bun)
   |         |          |
   v         v          v
SDKAgent   SessionManager   SearchManager
   |         |          |
   v         v          v
SQLite DB  ChromaDB     MCP Server (stdio)
(~/.claude-mem/claude-mem.db)  (vector search)   (tools for Claude)
```

**Three independent processes run simultaneously:**
1. **Claude Code** itself (the user's session)
2. **Worker Service** -- persistent HTTP server on port 37777 managing sessions, database, Chroma, and the web viewer UI
3. **SDK Agent subprocess** -- a *second* Claude Code instance spawned via `@anthropic-ai/claude-agent-sdk` that acts as an "observer" to compress tool outputs into structured observations

### Hook Lifecycle

The plugin registers 5 Claude Code lifecycle hooks (defined in `plugin/hooks/hooks.json`):

| Hook | Trigger | Action |
|------|---------|--------|
| `SessionStart` | Session startup/clear/compact | Install deps, start worker, inject context |
| `UserPromptSubmit` | Each user message | Initialize/continue SDK session |
| `PostToolUse` | After every tool call | Send tool input/output to SDK agent for compression |
| `Stop` | Claude stops responding | Trigger summary generation |
| `SessionEnd` | Session closes | Mark session complete |

### Data Flow (Write Path)

1. User interacts with Claude Code normally
2. After each tool use, the `PostToolUse` hook fires
3. The hook sends the tool name, input, and output to the Worker Service
4. The Worker queues this as a "pending message" for the SDK Agent
5. The SDK Agent (a separate Claude subprocess) receives the raw tool data and compresses it into structured XML:

```xml
<observation>
  <type>discovery | implementation | debugging | ...</type>
  <title>Short title</title>
  <subtitle>One-line context</subtitle>
  <facts>
    <fact>Specific detail 1</fact>
    <fact>Specific detail 2</fact>
  </facts>
  <narrative>Compressed natural language summary</narrative>
  <concepts><concept>tag1</concept></concepts>
  <files_read><file>path</file></files_read>
  <files_modified><file>path</file></files_modified>
</observation>
```

6. The parser (`src/sdk/parser.ts`) extracts fields from the XML using regex
7. Observation is stored in SQLite with content-hash deduplication (30s window)
8. Observation is simultaneously synced to ChromaDB for vector search (narrative and each fact become separate vector documents)

### Data Flow (Read Path -- Session Start)

On `SessionStart`, the context hook calls `generateContext()` which:
1. Loads config from `~/.claude-mem/settings.json` (default: 50 most recent observations)
2. Queries SQLite for recent observations and session summaries, scoped to the current project
3. Builds a timeline merging observations and summaries chronologically
4. Calculates token economics (compression ratio vs. discovery cost)
5. Injects the formatted context into Claude's session via `hookSpecificOutput`

### Data Flow (Read Path -- On-Demand Search via MCP)

The MCP server exposes 7 tools to Claude during a session:

| Tool | Purpose |
|------|---------|
| `search` | Search memory index (returns IDs, ~50-100 tokens/result) |
| `timeline` | Get chronological context around an observation |
| `get_observations` | Fetch full details by IDs (batch) |
| `smart_search` | AST-aware codebase search using tree-sitter |
| `smart_unfold` | Expand a specific symbol from a file |
| `smart_outline` | Get structural outline of a file |
| `__IMPORTANT` | Meta-tool documenting the 3-layer workflow |

The prescribed 3-layer workflow is: search -> timeline -> get_observations, designed for ~10x token savings by filtering before fetching full details.

---

## 2. What Does It Persist?

### Observations (per tool use)
- **type**: Categorized (discovery, implementation, debugging, architecture, configuration, testing, etc.)
- **title/subtitle**: Short identifiers
- **facts**: Array of specific details
- **narrative**: Compressed natural-language summary
- **concepts**: Semantic tags for filtering
- **files_read/files_modified**: File paths touched
- **discovery_tokens**: Token cost to produce this observation
- **content_hash**: SHA-256 for deduplication

### Session Summaries (per session end)
- **request**: What the user asked for
- **investigated**: What was explored
- **learned**: Key findings
- **completed**: What was accomplished
- **next_steps**: Suggested follow-up work
- **notes**: Additional context

### User Prompts
- Raw user prompt text stored and synced to ChromaDB for semantic search

### SDK Sessions
- Session metadata linking content_session_id (Claude Code's session) to memory_session_id (the observer agent's session)

---

## 3. Storage Backend and Format

### Primary: SQLite

- **Location:** `~/.claude-mem/claude-mem.db`
- **Engine:** `bun:sqlite` with WAL mode, 256MB mmap, 10,000 page cache
- **Schema:** 7 migrations creating tables: `sessions`, `observations`, `session_summaries`, `sdk_sessions`, `user_prompts`, plus FTS5 virtual tables (deprecated, maintained for backward compatibility)
- **Key tables:**
  - `observations` -- one row per compressed tool observation
  - `session_summaries` -- one row per session summary
  - `sdk_sessions` -- session state tracking
  - `user_prompts` -- raw user prompts

### Secondary: ChromaDB (Vector Search)

- **Connection:** Via `chroma-mcp` MCP server (spawned as subprocess via `uvx`)
- **Mode:** Local persistent (default) or remote server
- **Collection naming:** `cm__<sanitized_project_name>`
- **Document strategy:** Granular -- each observation's narrative and each individual fact become separate vector documents with shared metadata. Summaries similarly split into per-field documents.
- **Embedding:** Handled by chroma-mcp server internally (uses its default embedding model)
- **Recency filter:** 90-day window applied to vector search results by default

### Configuration: JSON

- **Settings:** `~/.claude-mem/settings.json` (flat key-value, auto-created on first run)
- **Priority:** Environment variables > settings file > hardcoded defaults

---

## 4. Context Injection Mechanism

Context is injected via the `SessionStart` hook's `hookSpecificOutput` return value. The `ContextBuilder` assembles:

1. **Header** with project name, observation count, token economics
2. **Timeline** of recent observations (configurable, default 50) showing title, subtitle, type, and timestamp
3. **Recent session summaries** (configurable, default last 10 sessions)
4. **Prior session messages** (optional, extracts from JSONL transcript files)
5. **Footer** with search tool documentation

The output format can be colored terminal text or markdown depending on context.

### Context Configuration Defaults

From `SettingsDefaultsManager`:
```
CLAUDE_MEM_CONTEXT_OBSERVATIONS: '50'     -- observations per context injection
CLAUDE_MEM_CONTEXT_FULL_COUNT: '0'        -- full-detail observations (0 = titles only)
CLAUDE_MEM_CONTEXT_SESSION_COUNT: '10'    -- session summaries included
CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY: 'true'
CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE: 'false'
```

---

## 5. Retrieval Mechanism Details

### Search Strategy Selection (SearchOrchestrator)

```
Has query text?
  NO  -> SQLiteSearchStrategy (filter-only: date range, type, concepts, files)
  YES -> ChromaDB available?
           YES -> ChromaSearchStrategy (semantic vector search)
                    Failed? -> SQLiteSearchStrategy (fallback, drops query)
           NO  -> Empty result
```

### ChromaSearchStrategy
1. Query ChromaDB with semantic embedding of the search text
2. Filter results by 90-day recency window
3. Categorize by document type (observation, summary, prompt)
4. Hydrate full records from SQLite by ID
5. Apply post-hoc filters (type, concepts, files, project)

### HybridSearchStrategy
- Combines metadata filtering with semantic ranking
- Used for `findByConcept`, `findByType`, `findByFile` operations

### SQLiteSearchStrategy
- Direct SQL queries with WHERE clauses
- No text search (FTS5 exists but is deprecated/unused)
- Supports: project, type, date range, concept (JSON array search), file path filters

### Key Insight
The search is **primarily semantic (vector-based)** when ChromaDB is available, with SQLite providing structured filtering. Without ChromaDB, search degrades to metadata-only filtering -- there is no keyword/text search fallback since FTS5 tables are maintained but explicitly unused.

---

## 6. Token Cost Analysis

### Per-Conversation Overhead

claude-mem imposes costs at multiple levels:

**A. Context Injection (SessionStart)**
- 50 observation titles/subtitles at ~50-100 tokens each = **~2,500-5,000 tokens** injected into context
- 10 session summaries at ~200-400 tokens each = **~2,000-4,000 tokens**
- Total baseline injection: **~4,500-9,000 tokens per session start**

**B. SDK Agent (the "observer" subprocess)**
This is the major cost. For each tool use in the primary session:
- A second Claude instance receives the tool input/output and generates an observation
- Default model: `claude-sonnet-4-5`
- Each observation prompt includes: system identity prompt + XML format instructions + tool data
- Initial prompt (first observation): ~1,000-2,000 tokens system prompt + tool data
- Subsequent observations: incremental (the SDK agent maintains conversation context)
- The SDK agent itself is billed at standard API rates

**Rough estimate per primary session:**
- 20 tool uses x ~500-1,000 tokens input + ~200-500 tokens output per observation = **~14,000-30,000 additional tokens consumed by the observer agent**
- This is ON TOP of the primary session's token usage
- Authentication: CLI subscription (bills to your Claude subscription) or explicit API key

**C. MCP Tool Calls (on-demand search)**
- `search` results: ~50-100 tokens per result
- `get_observations` full details: ~500-1,000 tokens per observation
- 3-layer workflow designed to minimize this to relevant results only

### The Compression Trade-off
The system tracks "discovery_tokens" (how many tokens were consumed to discover something) vs. "read_tokens" (how many tokens to recall it). The claim is a significant compression ratio, but the observer agent itself represents a substantial token multiplier on every session.

---

## 7. What Survives Session Restarts

**Everything.** The SQLite database and ChromaDB persist independently of Claude Code sessions:
- All observations with their structured data
- Session summaries
- User prompts
- Vector embeddings for semantic search
- Session metadata and linking

On session restart, the `SessionStart` hook re-injects the most recent 50 observations and 10 session summaries into the new session's context. The MCP tools remain available for on-demand deeper searches.

---

## 8. What Survives Across Projects

### Data Storage: Project-scoped but shared database

All projects share a single SQLite database (`~/.claude-mem/claude-mem.db`) and ChromaDB instance. Data is scoped by a `project` column derived from the git root path: `<parent_dir>/<repo_name>` (e.g., `work/monorepo`).

- **Context injection:** Only shows observations for the current project (with worktree support for parent/child projects)
- **MCP search tools:** Can search across projects by omitting the `project` parameter, but default to current project
- **Cross-project awareness:** Possible but not the default behavior
- **ChromaDB collections:** Named `cm__<project>` -- project-scoped by metadata, but all projects can be queried

### Global State
- `~/.claude-mem/settings.json` -- shared configuration
- `~/.claude-mem/modes/` -- custom mode definitions (e.g., "code" mode vs custom observation types)
- Worker service on port 37777 -- single instance serves all projects

---

## 9. Comparison to Claude Code's Built-in Memory

### Claude Code's Built-in System (`~/.claude/projects/*/memory/`)

| Feature | Built-in Memory | claude-mem |
|---------|----------------|------------|
| **Storage** | Markdown files in `~/.claude/` | SQLite + ChromaDB |
| **Format** | Flat text, human-readable | Structured (typed observations, facts, narratives) |
| **Persistence** | Survives restarts | Survives restarts |
| **Cross-project** | Per-project by default | Per-project, cross-project search possible |
| **Search** | None (injected wholesale) | Semantic vector search (ChromaDB) + metadata filters |
| **Compression** | None (verbatim or user-written) | AI-compressed via observer agent |
| **Token cost** | ~0 extra (just the memory file size) | Substantial (observer agent runs per tool use) |
| **Injection** | Automatic, simple | Automatic, configurable (count, fields, toggles) |
| **Selectivity** | All-or-nothing | 3-layer progressive disclosure |
| **Dependencies** | None | Bun, ChromaDB (via Python uvx), Claude Agent SDK |
| **Complexity** | ~0 | Very high (~50+ source files, 3 processes) |
| **User control** | Edit markdown files directly | Settings JSON, web UI, modes |
| **Observation types** | N/A | discovery, implementation, debugging, architecture, etc. |
| **Session summaries** | N/A | Structured (request, investigated, learned, completed, next_steps) |
| **Privacy** | File-level | `<private>` tag support |
| **Infrastructure** | None | Worker service, MCP server, ChromaDB server |
| **Web UI** | None | localhost:37777 viewer |
| **Multi-provider** | N/A | Claude (SDK), Gemini, OpenRouter for the observer agent |

---

## 10. Honest Assessment

### Strengths

1. **Structured memory is genuinely better than raw text.** Typed observations with facts, narratives, concepts, and file references allow much richer retrieval than flat markdown files.

2. **Semantic search is a real advantage.** Being able to search past sessions by meaning rather than exact keywords addresses a genuine limitation of the built-in system.

3. **Progressive disclosure (3-layer workflow) is well-designed.** The search -> timeline -> get_observations pattern prevents context bloat.

4. **Automatic operation.** No manual memory curation required -- observations are captured from every tool use.

5. **Session summaries are valuable.** The structured summary format (request, investigated, learned, completed, next_steps) creates a useful session log.

6. **Multi-project with a shared database** enables cross-project knowledge transfer that the built-in system cannot do.

### Weaknesses

1. **Token cost is the elephant in the room.** Running a *second Claude instance* as an observer for every tool use roughly doubles the token consumption of every session. For CLI subscription users, this eats into your rate limits. For API key users, this directly increases cost. The system's "compression ratio" metrics compare recall cost to discovery cost, but the real comparison should be: total cost with claude-mem vs. total cost without it.

2. **Enormous complexity.** ~50+ TypeScript files, 3 concurrent processes (Claude Code, Worker, SDK Agent subprocess), SQLite + ChromaDB + MCP server. The built-in memory system is zero-dependency. Every component here is a potential failure point, and the repo has 110 open issues.

3. **ChromaDB dependency is fragile.** Requires Python (uvx) to run chroma-mcp. Without ChromaDB, search degrades to metadata-only filtering with no text search (FTS5 exists but is explicitly unused). On Windows, the `bun:sqlite` FTS5 extension may not be available at all.

4. **Observer agent accuracy.** The quality of persisted memory depends entirely on how well a Sonnet-class model compresses tool outputs into observations. Misinterpretations, omissions, or hallucinated summaries are silently stored and recalled in future sessions.

5. **Port 37777 is a fixed dependency.** A persistent HTTP server running on a specific port is unusual for a code editor plugin and can conflict with other services.

6. **AGPL-3.0 license** is restrictive. The ragtime subdirectory uses PolyForm Noncommercial, adding further licensing complexity.

7. **Bun runtime required.** Not standard in most development environments, adding an installation dependency.

### Is This Better Than the Built-in System?

**For most users: No.** The built-in memory system is simple, zero-cost, and reliable. It requires no infrastructure, no additional token spend, and no debugging of a complex multi-process system.

**For power users with specific needs: Potentially yes, with caveats.** If you:
- Work on long-running projects across many sessions
- Need to recall specific technical decisions or findings from weeks ago
- Want semantic search over past work
- Are willing to accept roughly 2x token usage
- Can tolerate the operational complexity

...then claude-mem provides capabilities the built-in system simply does not have. Semantic search over structured, typed observations is genuinely more powerful than injecting a flat markdown file.

**The ideal solution would be simpler.** Many of claude-mem's benefits (structured observations, semantic search, session summaries) could be achieved with a lighter-weight approach -- perhaps by writing structured markdown files that a simpler search tool indexes, without requiring a second Claude instance running as a constant observer. The observer agent pattern is claude-mem's most innovative feature and simultaneously its biggest cost and complexity driver.

### Recommendation

If you are evaluating claude-mem for your workflow:

1. **Start with the built-in system** and curate your `CLAUDE.md` and project memory files manually. This costs nothing and is surprisingly effective.

2. **Consider claude-mem only if** you find yourself frequently needing to recall specific technical context from past sessions and the built-in memory is insufficient.

3. **Monitor token usage carefully** if you adopt it. The observer agent consumes significant resources that are easy to overlook.

4. **The Gemini/OpenRouter provider option** for the observer agent can reduce cost dramatically (Gemini free tier, OpenRouter free models), though compression quality may vary.

5. **Disable ChromaDB** (`CLAUDE_MEM_CHROMA_ENABLED: 'false'`) if you want to reduce complexity, accepting metadata-only search as a trade-off.
