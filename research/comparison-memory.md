# Memory and Persistence Systems -- Comparative Analysis

## Scope

This analysis compares six memory/persistence approaches available to Claude Code users, working exclusively from analyst reports on each system. The systems under review:

1. **Built-in Memory** -- Claude Code's native `~/.claude/projects/*/memory/MEMORY.md` and `CLAUDE.md` files
2. **ECC Session Persistence** -- Everything Claude Code's hook-based session save/load lifecycle
3. **ECC Continuous Learning** -- Everything Claude Code's observation capture, instinct extraction, and evolution pipeline
4. **claude-mem** -- Background observer agent with SQLite + ChromaDB persistence
5. **Serena** -- LSP-powered MCP server with Markdown-based memory tools
6. **Obsidian** -- Vault-based knowledge management via MCP servers or direct filesystem access

Sequential Thinking is excluded from the memory comparison as the analyst report confirms it has no persistence mechanism (in-memory only, lost on restart).

---

## Dimension-by-Dimension Comparison

### What Survives Session Restart?

| System | What Survives | Mechanism | Evidence |
|--------|---------------|-----------|----------|
| **Built-in Memory** | Everything in MEMORY.md and CLAUDE.md | Flat markdown files on disk; loaded automatically at session start | Zero-infrastructure; files persist indefinitely |
| **ECC Persistence** | Last 10 user messages (truncated to 200 chars), up to 20 tools used, up to 30 files modified, project/branch metadata | `session-end.js` hook writes to `~/.claude/sessions/{date}-{shortId}-session.tmp`; `session-start.js` loads the latest file from the last 7 days | Report estimates 500-700 tokens injected per session load |
| **ECC Learning** | Instinct YAML files (trigger, action, evidence, confidence score), accumulated JSONL observations | Project-scoped directories hashed from git remote URL; instinct-cli.py manages storage | 1,148-line Python CLI; instincts persist indefinitely with confidence decay |
| **claude-mem** | All observations (typed, structured XML), session summaries (request/investigated/learned/completed/next_steps), user prompts, vector embeddings | SQLite database + ChromaDB vectors at `~/.claude-mem/` | Report: "Everything. The SQLite database and ChromaDB persist independently of Claude Code sessions" |
| **Serena** | Project memories (architecture, conventions, commands), global memories, LSP caches | Markdown files in `.serena/memories/` (project) and `~/.serena/memories/global/` (global); content-hash-validated LSP caches in `.serena/` | Six dedicated CRUD tools; automatic onboarding creates initial memories |
| **Obsidian** | Entire vault -- notes, links, metadata, graph structure | Markdown files in vault directory; accessed via MCP server or direct filesystem | Survives everything; vault is independent of any AI tool |

### What Survives Across Projects?

| System | Cross-Project? | Mechanism | Limitations |
|--------|---------------|-----------|-------------|
| **Built-in Memory** | No | Per-project scoping by directory path | No cross-project mechanism exists |
| **ECC Persistence** | No | Session files include project metadata but load is not cross-project aware | Sessions are scoped to the project where they were created |
| **ECC Learning** | Yes, with criteria | Cross-project promotion when instincts appear in 2+ projects with avg confidence >= 0.8 | Clustering is keyword-based, not semantic; promotion is manual via `/evolve` |
| **claude-mem** | Partially | Shared SQLite database; MCP search can omit project filter to query all projects | Default behavior is project-scoped; cross-project search is opt-in per query |
| **Serena** | Yes | Global memories in `~/.serena/memories/global/`; cross-project query tool reads other registered projects | No semantic search over memories; relies on LLM reading file names for relevance |
| **Obsidian** | Yes, natively | Single vault serves all projects; symlinks connect project repos; wikilinks create cross-references | Requires dedicated vault setup; not automatic |

### What Improves Over Time?

| System | Learning Mechanism | Quality of Improvement | Assessment |
|--------|-------------------|----------------------|------------|
| **Built-in Memory** | None automatic; user manually edits files | Only as good as user discipline | Effective when curated; stagnates when neglected |
| **ECC Persistence** | None; each session overwrites the previous summary | No cumulative improvement | Provides recency, not learning |
| **ECC Learning** | Observation capture -> pattern detection -> instinct creation -> evolution -> promotion | Prompt-driven extraction, not ML; confidence scoring with decay; `/learn-eval` has quality gates | Report verdict: "well-engineered knowledge management... more akin to structured note-taking with LLM-assisted summarization than actual machine learning" |
| **claude-mem** | Automatic observation compression on every tool use; session summaries accumulate | Improves recall coverage over time; semantic search gets richer with more data | Real accumulation but observer accuracy depends on Sonnet-class model; misinterpretations are silently stored |
| **Serena** | Automatic onboarding on first project encounter; LLM updates memories as project evolves | Memories reflect current project state if LLM maintains them | No automatic cleanup or compression; memories can grow stale without LLM discipline |
| **Obsidian** | Manual or hook-assisted; session export + vault review pattern; wikilinks create emergent structure | Human-curated quality is high; graph structure enables serendipitous discovery | Report: "developers report finding forgotten solutions 60-70% faster when AI can traverse wikilink connections" |

### Token Cost Per Session

| System | Estimated Token Overhead | Cost Driver |
|--------|------------------------|-------------|
| **Built-in Memory** | Size of MEMORY.md + CLAUDE.md (typically 200-2,000 tokens) | Loaded wholesale; no filtering |
| **ECC Persistence** | ~500-700 tokens per session start | Lightweight: header + task list + file list |
| **ECC Learning** | Variable; depends on loaded instincts and skills. Observer hook is disabled by default. When active, Haiku model runs observation analysis | Standard profile adds ~100-200ms sync latency per tool call for 2 hooks; instinct loading cost depends on count |
| **claude-mem** | ~4,500-9,000 tokens injected at session start + ~14,000-30,000 additional tokens consumed by observer agent per session (20 tool uses) | Report: "Running a second Claude instance as an observer for every tool use roughly doubles the token consumption" |
| **Serena** | Minimal; memories loaded on demand via tool calls (LLM reads only what it needs) | Each memory read is a tool call; no bulk injection |
| **Obsidian** | Variable; depends on retrieval method. Direct file reads are full-file cost; MCP search returns targeted results | Without semantic search, Claude must guess which files to open |

### Setup Complexity

| System | Setup Effort | Dependencies |
|--------|-------------|-------------|
| **Built-in Memory** | Zero | None; ships with Claude Code |
| **ECC Persistence** | Medium | Node.js; ECC installation; hooks.json configuration; profile selection |
| **ECC Learning** | Medium-High | Above + Python for instinct-cli.py; understanding of learn/evolve workflow; observer disabled by default |
| **claude-mem** | High | Bun runtime; ChromaDB via Python (uvx); persistent background worker on port 37777; Claude Agent SDK; 3 concurrent processes |
| **Serena** | Medium | Python (uv/uvx); language server runtimes per language; MCP configuration; project activation |
| **Obsidian** | Low-Medium | Obsidian app (free); optional: MCP server plugin, Local REST API plugin, Smart Connections for semantic search |

### Reliability (What If It Fails?)

| System | Failure Mode | Graceful Degradation? |
|--------|-------------|----------------------|
| **Built-in Memory** | File deleted or corrupted | Markdown files are trivially backed up; git-trackable; near-zero failure surface |
| **ECC Persistence** | Hook fails to fire; plugin root not found; transcript path unavailable | Yes: all hooks use `process.exit(0)` in catch blocks; session starts without context but does not crash; fallback chain for plugin resolution |
| **ECC Learning** | Observer disabled; instinct file corruption; clustering misfire | Observer is disabled by default already; instinct CLI validates files; individual instinct corruption is isolated |
| **claude-mem** | Worker process dies; ChromaDB unavailable; SQLite corruption; port 37777 conflict; Bun unavailable | Partial: without ChromaDB, search degrades to metadata-only (no text search); if worker dies, all memory operations fail; 110 open issues in repo |
| **Serena** | Language server crashes; MCP connection drops; memory file corruption | Good: automatic LSP restart on crash; memories are plain markdown (trivially recoverable); MCP reconnection handled |
| **Obsidian** | Obsidian app not running (for MCP); plugin conflicts; vault corruption | Excellent: vault is just markdown files on disk; works without Obsidian app via direct filesystem access; MCP is optional |

---

## Per-System Deep Assessment

### Built-in Memory

**Persistence: Real and robust.** Files on disk with no moving parts. The most reliable system by far.

**Learning: None.** This is a static store. It holds what you put in it and nothing more. Its value is entirely determined by user curation quality.

**Token overhead: Minimal and predictable.** Equal to the file sizes, loaded once at session start.

**Combinability: Excellent.** Every other system listed here can coexist with built-in memory. It should always be the foundation layer.

### ECC Session Persistence

**Persistence: Real but shallow.** The save/load lifecycle is well-engineered with race condition guards, idempotent markers, and fallback chains. However, what it persists is a statistical summary (messages, tools, files) not a semantic one (decisions, reasoning, blockers). The report notes: "The loaded context tells you what happened but not why."

**Learning: None.** Each session overwrites the previous summary. There is no cumulative benefit across sessions.

**Token overhead: Excellent at 500-700 tokens.** The lightest automatic injection of any system reviewed.

**Combinability: Good.** Coexists naturally with built-in memory and ECC learning. Does not conflict with any other system.

### ECC Continuous Learning

**Persistence: Real and well-structured.** Instinct YAML files with trigger/action/evidence/confidence are a genuinely useful format. Project-scoped storage with cross-project promotion criteria is thoughtful engineering.

**Learning: Partially real, partially theater.** The infrastructure is impressive (1,148-line CLI, confidence decay, quality gates in `/learn-eval`). But the observer that would automate learning is disabled by default, clustering is keyword removal rather than semantic analysis, and confidence values are heuristic thresholds rather than outcome-based measures. Most instinct creation is manual.

**Token overhead: Variable.** Instincts loaded into context scale with count. The observation hooks add async overhead (non-blocking) but the observer Haiku agent, when enabled, adds real cost.

**Combinability: Good.** The instinct format is self-contained. Works alongside built-in memory. The promotion mechanism could feed into Obsidian or Serena memories.

### claude-mem

**Persistence: The most comprehensive.** Structured observations (typed, factual, narrative), session summaries, vector embeddings, and semantic search. This is the only system that captures what happened, why it happened, and how to find it later.

**Learning: Real accumulation, questionable accuracy.** Observations accumulate automatically and semantic search genuinely improves with more data. But the observer agent (Sonnet-class) can misinterpret, omit, or hallucinate summaries that are silently stored and recalled. There is no human review gate.

**Token overhead: The highest by far.** Report estimates ~4,500-9,000 tokens at session start plus ~14,000-30,000 additional tokens per session for the observer agent. This approximately doubles total session cost.

**Combinability: Limited.** The system is complex enough (3 concurrent processes, fixed port, Bun runtime) that adding more tools increases operational risk. It could coexist with built-in memory but adding Serena or Obsidian MCP servers on top creates a fragile stack.

### Serena

**Persistence: Good, clean, and human-readable.** Markdown files in `.serena/memories/` are plain text, git-trackable, and editable by humans. Global memories enable cross-project sharing. The six dedicated CRUD tools give the LLM structured access.

**Learning: Onboarding-driven, then manual.** Automatic onboarding generates initial project memories (structure, commands, conventions). After that, memory maintenance depends on LLM discipline or user intervention. No automatic learning pipeline.

**Token overhead: Low on-demand.** Memories are fetched only when the LLM calls the read tool, not bulk-injected. This is the most token-efficient retrieval pattern for systems with many memories.

**Combinability: Excellent.** Serena's primary value is semantic code navigation (LSP), and its memory system is a clean add-on. The `claude-code` context disables redundant tools, making it a well-behaved MCP citizen.

### Obsidian

**Persistence: The most durable and human-friendly.** A vault is just a directory of markdown files. It outlives any AI tool, any editor, any workflow system. Wikilinks create a navigable graph. Frontmatter enables structured queries.

**Learning: Manual with automation assists.** Session export hooks, vault review skills, and the inbox pattern create workflows for knowledge accumulation. But there is no automatic learning -- it requires deliberate curation.

**Token overhead: Variable and potentially high.** Without semantic search, Claude reads full files or guesses. With Smart Connections or Nexus for semantic search, retrieval becomes targeted. The report warns that LLM-generated context files can decrease performance by 0.5-2% while raising costs 20%+; human-curated content is key.

**Combinability: Excellent.** Obsidian is purely a knowledge store. It has no opinions about coding workflows, session management, or tool usage. It combines cleanly with any other system.

---

## Verdicts

### Best Session Persistence System: ECC Session Persistence

**Evidence:** ECC's hook-based save/load cycle provides automatic, lightweight (500-700 tokens) context injection at session start with graceful degradation on failure. claude-mem provides richer session data but at roughly 10-18x the token cost and with fragile multi-process infrastructure. Built-in memory has no automatic session persistence at all. ECC persistence wins on the cost/value ratio for what happens between sessions.

**Caveat:** ECC persistence captures "what happened" (messages, tools, files) but not "why." For teams that need semantic session continuity, claude-mem's structured summaries (request/investigated/learned/completed/next_steps) are superior in format, despite the cost.

### Best Cross-Session Learning System: ECC Continuous Learning

**Evidence:** ECC is the only system with a deliberate learning pipeline: observation capture, pattern detection, instinct creation with confidence scoring, evolution clustering, and cross-project promotion with real criteria (2+ projects, avg confidence >= 0.8). The `/learn-eval` quality gate (checklist + verdict + dedup check) prevents knowledge rot. claude-mem accumulates observations automatically but has no quality gate, no evolution mechanism, and no way to promote patterns across projects. Serena's memory is static once written. Obsidian requires fully manual curation.

**Caveat:** ECC's observer is disabled by default, clustering is keyword-based not semantic, and most instinct creation is manual. The system is better described as "structured knowledge management with LLM-assisted extraction" than "learning." But it is the closest any system comes to genuine cross-session improvement.

### Best Knowledge Management System: Obsidian

**Evidence:** Obsidian provides the richest knowledge infrastructure: wikilink-based graph navigation, frontmatter metadata queries, visual graph view, mobile capture, human-readable/editable markdown, and a mature MCP ecosystem (6+ servers, including semantic search options). It is the only system where knowledge is fully agent-agnostic and survives the obsolescence of any specific AI tool. The vault structure enables cross-project sharing natively. Developers report 60-70% faster retrieval of past solutions when AI can traverse wikilink connections.

**Caveat:** Obsidian requires active curation and vault architecture. Without semantic search plugins, retrieval is inefficient. Setup complexity increases with MCP servers and plugins. It is a knowledge system, not a memory system -- it stores what you deliberately put into it, not what happens automatically.

### Best Automatic Memory Capture: claude-mem

**Evidence:** claude-mem is the only system that captures structured observations from every tool use without any user intervention. Its observation format (type, title, facts, narrative, concepts, files) is richer than any other automatic capture. Semantic vector search via ChromaDB enables meaning-based retrieval. Session summaries are well-structured.

**Caveat:** This comes at approximately 2x total token cost per session, requires 3 concurrent processes, depends on Bun and ChromaDB (fragile on Windows), and has 110 open issues. The observer agent can silently store misinterpretations. For most users, this cost-complexity tradeoff is not justified.

---

## Recommended Memory Architecture

The systems are not mutually exclusive. The optimal architecture layers complementary systems:

### Tier 1: Foundation (Everyone Should Use)

**Built-in Memory (CLAUDE.md + MEMORY.md)**
- Project-specific coding instructions, style guides, architecture constraints
- Zero cost, zero dependencies, zero failure modes
- Human-curated; keep it concise and current
- This is the single most reliable persistence mechanism

### Tier 2: Session Continuity (Recommended Addition)

**ECC Session Persistence**
- Automatic context bridge between sessions at ~500-700 tokens
- Requires ECC installation but minimal profile (`minimal`) runs only essential hooks
- Graceful degradation if hooks fail
- Pairs naturally with Tier 1

### Tier 3: Choose Based on Workflow

Pick ONE of the following based on your primary need:

**For developers who want structured learning:**
- **ECC Continuous Learning** -- Add `/learn-eval` and `/evolve` to manually curate instincts
- Best for: Solo developers building personal best practices across projects
- Token cost: Low (manual workflow; observer disabled by default)
- Combines with: Tier 1 + Tier 2

**For developers who want a persistent knowledge base:**
- **Obsidian** -- Dedicated developer vault with MCP bridge
- Best for: Developers who maintain notes, research, and architectural decisions across many projects
- Start simple: Direct filesystem access from vault directory, add MCP servers only when needed
- Token cost: Variable (depends on retrieval strategy)
- Combines with: Tier 1 + Tier 2 + Serena (for LSP navigation)

**For developers who want automatic memory without curation:**
- **claude-mem** (with cost awareness) -- Full automatic observation capture
- Best for: Long-running complex projects where recalling past sessions matters and token budget allows
- Consider using Gemini/OpenRouter for the observer agent to reduce cost
- Token cost: High (~2x total session cost with Claude observer; reducible with alternative providers)
- Combines with: Tier 1 (but adds significant complexity; avoid layering more systems)

**For developers who want semantic code navigation + memory:**
- **Serena** -- LSP tools + clean markdown memories
- Best for: Developers working with large codebases who need precise symbol navigation AND cross-session memory
- The memory system is a useful bonus on top of the LSP value proposition
- Token cost: Low (on-demand retrieval)
- Combines with: Tier 1 + Tier 2 + Obsidian

### What NOT to Do

1. **Do not stack claude-mem + ECC learning + Obsidian MCP + Serena all at once.** Each adds processes, token overhead, and failure surface. The marginal value of each additional system decreases while operational complexity compounds.

2. **Do not rely on automatic systems without spot-checking.** Both claude-mem's observer and ECC's learning pipeline can store inaccurate information. Periodically review what has been captured.

3. **Do not skip Tier 1.** No system reviewed here replaces the value of a well-curated CLAUDE.md with project-specific instructions. The analyst report on Obsidian cites research showing that LLM-generated context files can decrease agent performance while raising costs -- human curation remains essential.

4. **Do not use Sequential Thinking MCP as a memory system.** It has zero persistence. Its in-memory thought history is lost on server restart. For Claude Code specifically, Claude's native extended thinking is strictly superior for reasoning quality.

---

## Summary Table

| Dimension | Built-in Memory | ECC Persistence | ECC Learning | claude-mem | Serena | Obsidian |
|---|---|---|---|---|---|---|
| **What survives restart?** | MEMORY.md, CLAUDE.md (everything written) | Last session summary (messages, tools, files) | Instinct YAML files, JSONL observations | All observations, summaries, embeddings, prompts | Project + global memories (Markdown), LSP caches | Entire vault (notes, links, metadata, graph) |
| **What survives across projects?** | Nothing (per-project) | Nothing (per-project) | Promoted instincts (2+ projects, confidence >= 0.8) | Opt-in cross-project search | Global memories in `~/.serena/memories/global/` | Everything (single vault, native cross-project) |
| **What improves over time?** | Nothing (static) | Nothing (overwrites) | Instinct confidence, evolved skills/commands/agents | Observation coverage, search richness | Memories if LLM maintains them | Knowledge graph density, wikilink connections |
| **Token cost per session** | ~200-2,000 (file size) | ~500-700 (lightweight) | Variable (depends on loaded instincts) | ~18,500-39,000 (session start + observer) | Low (on-demand reads) | Variable (depends on retrieval method) |
| **Setup complexity** | Zero | Medium | Medium-High | High | Medium | Low-Medium |
| **Reliability** | Excellent (flat files) | Good (graceful degradation) | Good (isolated instincts) | Fragile (3 processes, 110 open issues) | Good (auto-restart, plain files) | Excellent (just markdown files) |
