# Kimi-CLI Supermemory Skill Design

## Overview

Porting the my-supermemory plugin to work with kimi-cli using the skills system.

## Architecture Comparison

| OpenCode Feature | kimi-cli Equivalent | Implementation |
|-----------------|---------------------|----------------|
| `chat.message` hook | SKILL.md instructions | Document trigger words for the LLM |
| `tool` registration | Standalone CLI + SKILL.md | Create `kimi-supermemory` CLI tool |
| `event` hook (compaction) | Not available | Document manual compaction workflow |
| Context injection | SKILL.md instructions | Instruct agent to fetch context |

## Components

### 1. SKILL.md (The Skill Definition)

Located at `~/.codex/skills/kimi-supermemory/SKILL.md`:

- **Purpose**: Teach the LLM how to use supermemory
- **Content**:
  - Available commands (`supermemory add`, `supermemory search`, etc.)
  - When to save memories (keyword detection)
  - When to retrieve memories (on session start, relevant queries)
  - Memory types and scopes

### 2. CLI Tool (`kimi-supermemory`)

A standalone CLI that wraps the Supermemory API:

```bash
kimi-supermemory add "content" [--type <type>] [--scope <scope>]
kimi-supermemory search "query" [--scope <scope>]
kimi-supermemory list [--scope <scope>] [--limit <n>]
kimi-supermemory forget <memoryId>
kimi-supermemory init  # Interactive setup
```

### 3. Configuration

- Config file: `~/.config/kimi/supermemory.json`
- API key: `SUPERMEMORY_API_KEY` env var

## Memory Scoping

Same as original:
- **user**: Cross-project preferences (tagged by git email hash)
- **project**: Project-specific knowledge (tagged by directory hash)

## Usage Flow

1. User mentions "remember..." or similar trigger
2. LLM reads SKILL.md, recognizes trigger
3. LLM calls `kimi-supermemory add ...` via bash tool
4. Memory is stored in Supermemory

5. User starts new session
6. LLM reads SKILL.md, sees "fetch context on startup"
7. LLM calls `kimi-supermemory search ...` to get relevant memories
8. Context is included in response

## Implementation Plan

1. Create skill directory structure
2. Write comprehensive SKILL.md
3. Port CLI tool (TypeScript → compiled JS)
4. Create install/setup script
5. Test with kimi-cli
