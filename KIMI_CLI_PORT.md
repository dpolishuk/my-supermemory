# Kimi CLI Port - Summary

This document summarizes the port of the opencode-supermemory plugin to kimi-cli.

## Architecture Differences

### OpenCode Plugin System
- **Hooks**: `chat.message`, `event` - programmatic hooks that run automatically
- **Tool Registration**: Native tool registration via `tool: { supermemory: tool({...}) }`
- **Context Injection**: Automatic injection on first message
- **Compaction**: Automatic context compaction at 80% usage

### Kimi CLI Skill System
- **SKILL.md**: Markdown file that teaches the LLM how to use the memory system
- **CLI Tool**: Standalone CLI (`kimi-supermemory`) for memory operations
- **Context Retrieval**: LLM explicitly calls `kimi-supermemory context` to fetch memories
- **Keyword Detection**: SKILL.md documents trigger words; LLM recognizes and acts on them

## Port Mapping

| OpenCode Feature | Kimi CLI Implementation |
|-----------------|------------------------|
| `Plugin` export | `SKILL.md` file |
| `chat.message` hook | SKILL.md instructions for keyword detection |
| `tool` registration | Bash commands: `kimi-supermemory <command>` |
| `event` hook (compaction) | Not available; documented manual workflow |
| Context injection | `kimi-supermemory context` command |
| `supermemoryClient` | Ported to `kimi-supermemory/src/services/client.ts` |
| `getTags()` | Ported to `kimi-supermemory/src/services/tags.ts` |
| `formatContextForPrompt()` | Ported to `kimi-supermemory/src/services/context.ts` |
| Privacy filtering | Ported to `kimi-supermemory/src/services/privacy.ts` |
| Configuration | Ported to `kimi-supermemory/src/config.ts` |

## File Structure

```
kimi-supermemory/
├── SKILL.md                    # The skill definition for kimi-cli
├── README.md                   # User documentation
├── package.json               # NPM package configuration
├── tsconfig.json              # TypeScript configuration
├── scripts/
│   └── install.sh             # Installation script
└── src/
    ├── cli.ts                 # Main CLI entry point
    ├── types.ts               # TypeScript types
    ├── config.ts              # Configuration management
    └── services/
        ├── client.ts          # Supermemory API client
        ├── tags.ts            # Tag generation for scoping
        ├── context.ts         # Context formatting
        ├── privacy.ts         # Privacy filtering
        └── logger.ts          # Logging utility
```

## Key Commands

| Command | Description |
|---------|-------------|
| `kimi-supermemory add <content>` | Save a memory |
| `kimi-supermemory search <query>` | Search memories |
| `kimi-supermemory list` | List recent memories |
| `kimi-supermemory forget <id>` | Delete a memory |
| `kimi-supermemory context` | Get formatted context |
| `kimi-supermemory init` | Interactive setup |
| `kimi-supermemory init-codebase` | Codebase initialization guide |

## Installation Flow

1. **Install CLI Tool**: `bun add -g kimi-supermemory`
2. **Configure API Key**: `kimi-supermemory init` or env var
3. **Install Skill**: Copy `SKILL.md` to `~/.codex/skills/kimi-supermemory/`

## Usage Flow

### Memory Saving
1. User says "Remember that this project uses Bun"
2. LLM reads SKILL.md, recognizes "remember" trigger
3. LLM executes: `bunx kimi-supermemory add "Uses Bun runtime" --type project-config`
4. Memory is stored in Supermemory

### Context Retrieval
1. At session start, LLM reads SKILL.md
2. LLM executes: `bunx kimi-supermemory context`
3. LLM includes the returned context in its response

## Limitations vs OpenCode

| Feature | OpenCode | Kimi CLI |
|---------|----------|----------|
| Automatic context injection | ✅ Yes | ❌ LLM-driven |
| Automatic compaction | ✅ Yes | ❌ Not available |
| Native tool calls | ✅ Yes | ❌ Bash commands |
| Event hooks | ✅ Yes | ❌ Not available |

Despite these limitations, the kimi-cli version provides the same core functionality:
- Memory saving with keyword detection
- Semantic search
- Context retrieval
- Privacy filtering
- User/project scoping

## Testing

To test the kimi-cli version:

```bash
cd kimi-supermemory
bun install
bun run build

# Set API key
export KIMI_SUPERMEMORY_API_KEY="sm_..."

# Test commands
./dist/cli.js add "Test memory" --type project-config
./dist/cli.js list
./dist/cli.js search "test"
./dist/cli.js context
```

## Publishing

To publish to npm:

```bash
cd kimi-supermemory
bun run build
npm publish
```

## Future Improvements

1. **MCP Integration**: If kimi-cli adds MCP support, could provide native tools
2. **Automatic Context**: If kimi-cli adds session-start hooks, could auto-fetch context
3. **Compaction**: If kimi-cli adds event hooks, could implement auto-compaction
