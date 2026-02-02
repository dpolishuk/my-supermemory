# Supermemory for Kimi CLI

Persistent memory for your coding sessions. Your agent remembers what you tell it - across sessions, across projects.

## Overview

This skill enables kimi-cli to save and retrieve memories using [Supermemory](https://supermemory.ai), an intelligent memory API that stores knowledge as semantic embeddings for meaning-based retrieval.

## Configuration

### API Key

Set your Supermemory API key:

```bash
export SUPERMEMORY_API_KEY="sm_..."
```

Or run the setup command:

```bash
bunx kimi-supermemory@latest init
```

Get your API key from [console.supermemory.ai](https://console.supermemory.ai)

### Optional Config File

Create `~/.config/kimi/supermemory.json`:

```json
{
  "apiKey": "sm_...",
  "similarityThreshold": 0.6,
  "maxMemories": 5,
  "maxProjectMemories": 10,
  "keywordPatterns": ["log\\s+this", "write\\s+down"]
}
```

## When to Save Memories

**AUTOMATICALLY detect and save when user says:**

- "remember", "memorize"
- "save this", "note this"
- "keep in mind", "don't forget"
- "learn this", "store this"
- "record this", "make a note"
- "take note", "jot down"
- "commit to memory"
- "remember that", "never forget"
- "always remember"

**Or any custom patterns from config.**

## Memory Scopes

| Scope | Description | Use For |
|-------|-------------|---------|
| `project` (default) | Project-specific knowledge | Build commands, architecture, conventions |
| `user` | Cross-project preferences | Communication style, coding preferences |

## Memory Types

- `project-config` - Tech stack, commands, tooling
- `architecture` - Codebase structure, components, data flow
- `error-solution` - Known issues and fixes
- `preference` - Coding style preferences
- `learned-pattern` - Conventions specific to this codebase
- `conversation` - Session summaries

## CLI Commands

Use these via bash tool:

```bash
# Add a memory
bunx kimi-supermemory@latest add "Uses Bun runtime" --type project-config --scope project

# Search memories
bunx kimi-supermemory@latest search "testing workflow"

# List recent memories
bunx kimi-supermemory@latest list --scope project --limit 10

# Delete a memory
bunx kimi-supermemory@latest forget <memory-id>

# Initialize codebase memory
bunx kimi-supermemory@latest init-codebase
```

## Context Injection (Session Start)

**At the start of each session, fetch and inject relevant memories:**

1. Run `bunx kimi-supermemory@latest context` to get formatted context
2. Include this context in your system prompt or first response
3. This includes user profile + project knowledge + relevant memories

## Privacy

Content wrapped in `<private>...</private>` tags is never stored:

```
My API key is <private>sk-abc123</private>
```

## Examples

### Good Memory Triggers

**User**: "Remember that this project uses Bun, not Node.js"

**Action**: 
```bash
bunx kimi-supermemory@latest add "Uses Bun runtime and package manager. Commands: bun install, bun run dev, bun test" --type project-config --scope project
```

**User**: "Don't forget to always run lint before committing"

**Action**:
```bash
bunx kimi-supermemory@latest add "Always run lint before committing" --type preference --scope project
```

**User**: "I prefer concise responses without fluff"

**Action**:
```bash
bunx kimi-supermemory@latest add "User prefers concise, terse responses without fluff" --type preference --scope user
```

### Context Retrieval

**At session start:**

```bash
bunx kimi-supermemory@latest context
```

This returns formatted context like:
```
[SUPERMEMORY]

User Profile:
- Prefers concise responses
- Expert in TypeScript

Project Knowledge:
- [100%] Uses Bun, not Node.js
- [100%] Build: bun run build

Relevant Memories:
- [82%] Build fails if .env.local missing
```

## Codebase Initialization

To deeply understand a codebase and save key insights:

```bash
bunx kimi-supermemory@latest init-codebase
```

This will guide you through:
1. Reading README, package.json, config files
2. Understanding project structure
3. Identifying conventions and patterns
4. Saving memories incrementally

## Troubleshooting

**Command not found?** Make sure `bunx` is available or use `npx`.

**API errors?** Check that `SUPERMEMORY_API_KEY` is set.

**No memories appearing?** Run `bunx kimi-supermemory@latest list` to verify connection.
