# kimi-supermemory

Persistent memory for [Kimi CLI](https://github.com/MoonshotAI/kimi-cli) using [Supermemory](https://supermemory.ai).

Your agent remembers what you tell it - across sessions, across projects.

## Installation

### 1. Install the CLI tool

```bash
bun add -g kimi-supermemory
# or
npm install -g kimi-supermemory
```

Or use without installing:

```bash
bunx kimi-supermemory@latest <command>
```

### 2. Configure your API key

Get your API key from [console.supermemory.ai](https://console.supermemory.ai)

```bash
export KIMI_SUPERMEMORY_API_KEY="sm_..."
```

Or run the interactive setup:

```bash
kimi-supermemory init
```

### 3. Install the skill

Copy the `SKILL.md` file to your kimi-cli skills directory:

```bash
mkdir -p ~/.codex/skills/kimi-supermemory
cp node_modules/kimi-supermemory/SKILL.md ~/.codex/skills/kimi-supermemory/
```

Or manually create `~/.codex/skills/kimi-supermemory/SKILL.md` with the contents from this repo.

## Usage

### Command Line

```bash
# Add a memory
kimi-supermemory add "Uses Bun runtime and package manager" --type project-config

# Search memories
kimi-supermemory search "testing workflow"

# List recent memories
kimi-supermemory list --limit 10

# Delete a memory
kimi-supermemory forget <memory-id>

# Get context for current session
kimi-supermemory context

# Get help
kimi-supermemory help
```

### From Kimi CLI

Once the skill is installed, the LLM will automatically:

1. **Detect memory triggers** - When you say "remember", "don't forget", etc.
2. **Save memories** - Using the `kimi-supermemory add` command
3. **Retrieve context** - At the start of sessions, fetching relevant memories

Example conversation:

```
You: Remember that this project uses Bun, not Node.js
Kimi: [saves to project memory]

You: How do I run tests?
Kimi: [searches memories, finds: "Uses Bun runtime..."]
Kimi: You can run tests with `bun test`
```

## Memory Scopes

- **project** (default): Project-specific knowledge like build commands, architecture
- **user**: Cross-project preferences like coding style, communication preferences

## Memory Types

- `project-config`: Tech stack, commands, tooling
- `architecture`: Codebase structure, components
- `error-solution`: Known issues and fixes
- `preference`: Coding style preferences
- `learned-pattern`: Conventions specific to codebase
- `conversation`: Session summaries

## Configuration

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

All fields are optional. The `KIMI_SUPERMEMORY_API_KEY` environment variable takes precedence.

## Privacy

Content wrapped in `<private>...</private>` tags is never stored:

```
My API key is <private>sk-abc123</private>
```

## Comparison with OpenCode Plugin

| Feature | OpenCode Plugin | Kimi CLI Skill |
|---------|----------------|----------------|
| Installation | Plugin system | CLI tool + Skill file |
| Hooks | Automatic | LLM-driven via SKILL.md |
| Context Injection | Automatic | LLM fetches via command |
| Compaction | Automatic | Manual workflow |
| Tool Registration | Native | Bash command execution |

The skill-based approach gives you the same memory capabilities while working within kimi-cli's architecture.

## Development

```bash
bun install
bun run build
bun run typecheck
```

## License

MIT
