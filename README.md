# Supermemory for Coding Agents

Persistent memory for AI coding agents using [Supermemory](https://supermemory.ai).

Your agent remembers what you tell it - across sessions, across projects.

## Supported Platforms

- **OpenCode** - Plugin with hooks and tool integration
- **Kimi CLI** - Skill-based approach with CLI tool

---

# opencode-supermemory

OpenCode plugin for persistent memory.

## Installation

### For Humans

```bash
bunx opencode-supermemory@latest install
```

Then get your API key from [console.supermemory.ai](https://console.supermemory.ai) and set it:

```bash
export SUPERMEMORY_API_KEY="sm_..."
```

**Or let your agent do it** - paste this into OpenCode:
```
Install opencode-supermemory by following https://raw.githubusercontent.com/supermemoryai/opencode-supermemory/main/README.md
```

### For LLM Agents

<details>
<summary>Instructions for LLM Agents (click to expand)</summary>

If you're an LLM agent helping set up opencode-supermemory, follow these steps:

#### Step 1: Run the installer

```bash
bunx opencode-supermemory@latest install --no-tui
```

This will:
- Register the plugin in `~/.config/opencode/opencode.jsonc`
- Create the `/supermemory-init` command

#### Step 2: Verify the config

```bash
cat ~/.config/opencode/opencode.jsonc
```

Should contain:
```json
{
  "plugin": ["opencode-supermemory"]
}
```

If not, add it manually:

**JSONC:**
```jsonc
{
  "plugin": [
    "opencode-supermemory"
    // ... other plugins
  ]
}
```

**JSON:**
```json
{
  "plugin": ["opencode-supermemory"]
}
```

#### Step 3: Configure API key

Ask the user to get their API key from [console.supermemory.ai](https://console.supermemory.ai).

Then set it via environment variable:

```bash
export SUPERMEMORY_API_KEY="sm_..."
```

Or create `~/.config/opencode/supermemory.jsonc`:

```jsonc
{
  "apiKey": "sm_..."
}
```

#### Step 4: Verify setup

Tell the user to restart OpenCode and run:

```bash
opencode -c
```

They should see `supermemory` in the tools list. If not, check:
1. Is `SUPERMEMORY_API_KEY` set?
2. Is the plugin in `opencode.jsonc`?
3. Check logs: `tail ~/.opencode-supermemory.log`

#### Step 5: Initialize codebase memory (optional)

Run `/supermemory-init` to have the agent explore and memorize the codebase.

</details>

## Features

### Context Injection

On first message, the agent receives (invisible to user):
- User profile (cross-project preferences)
- Project memories (all project knowledge)
- Relevant user memories (semantic search)

Example of what the agent sees:
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

The agent uses this context automatically - no manual prompting needed.

### Keyword Detection

Say "remember", "save this", "don't forget" etc. and the agent auto-saves to memory.

```
You: "Remember that this project uses bun"
Agent: [saves to project memory]
```

Add custom triggers via `keywordPatterns` config.

### Codebase Indexing

Run `/supermemory-init` to explore and memorize your codebase structure, patterns, and conventions.

### Preemptive Compaction

When context hits 80% capacity:
1. Triggers OpenCode's summarization
2. Injects project memories into summary context
3. Saves session summary as a memory

This preserves conversation context across compaction events.

### Privacy

```
API key is <private>sk-abc123</private>
```

Content in `<private>` tags is never stored.

## Tool Usage

The `supermemory` tool is available to the agent:

| Mode | Args | Description |
|------|------|-------------|
| `add` | `content`, `type?`, `scope?` | Store memory |
| `search` | `query`, `scope?` | Search memories |
| `profile` | `query?` | View user profile |
| `list` | `scope?`, `limit?` | List memories |
| `forget` | `memoryId`, `scope?` | Delete memory |

**Scopes:** `user` (cross-project), `project` (default)

**Types:** `project-config`, `architecture`, `error-solution`, `preference`, `learned-pattern`, `conversation`

## Memory Scoping

| Scope | Tag | Persists |
|-------|-----|----------|
| User | `opencode_user_{sha256(git email)}` | All projects |
| Project | `opencode_project_{sha256(directory)}` | This project |

## Configuration

Create `~/.config/opencode/supermemory.jsonc`:

```jsonc
{
  // API key (can also use SUPERMEMORY_API_KEY env var)
  "apiKey": "sm_...",
  
  // Min similarity for memory retrieval (0-1)
  "similarityThreshold": 0.6,
  
  // Max memories injected per request
  "maxMemories": 5,
  
  // Max project memories listed
  "maxProjectMemories": 10,
  
  // Max profile facts injected
  "maxProfileItems": 5,
  
  // Include user profile in context
  "injectProfile": true,
  
  // Prefix for container tags
  "containerTagPrefix": "opencode",
  
  // Extra keyword patterns for memory detection (regex)
  "keywordPatterns": ["log\\s+this", "write\\s+down"],
  
  // Context usage ratio that triggers compaction (0-1)
  "compactionThreshold": 0.80
}
```

All fields optional. Env var `SUPERMEMORY_API_KEY` takes precedence over config file.

## Usage with Oh My OpenCode

If you're using [Oh My OpenCode](https://github.com/code-yeongyu/oh-my-opencode), disable its built-in auto-compact hook to let supermemory handle context compaction:

Add to `~/.config/opencode/oh-my-opencode.json`:

```json
{
  "disabled_hooks": ["anthropic-context-window-limit-recovery"]
}
```

## Development

```bash
bun install
bun run build
bun run typecheck
```

Local install:

```jsonc
{
  "plugin": ["file:///path/to/opencode-supermemory"]
}
```

## Logs

```bash
tail -f ~/.opencode-supermemory.log
```

---

# kimi-supermemory

Kimi CLI skill for persistent memory using Supermemory.

## Installation

### For Humans

#### Step 1: Install the CLI tool

```bash
bun add -g kimi-supermemory
```

Or use without installing (just add `@latest` to commands):

```bash
bunx kimi-supermemory@latest <command>
```

#### Step 2: Configure your API key

Get your API key from [console.supermemory.ai](https://console.supermemory.ai)

```bash
export KIMI_SUPERMEMORY_API_KEY="sm_..."
```

Or run the interactive setup:

```bash
kimi-supermemory init
```

#### Step 3: Install the skill

The skill file teaches Kimi CLI's LLM how to use supermemory:

```bash
mkdir -p ~/.codex/skills/kimi-supermemory
cp $(bun pm bin)/../kimi-supermemory/SKILL.md ~/.codex/skills/kimi-supermemory/
```

Or manually download:

```bash
mkdir -p ~/.codex/skills/kimi-supermemory
curl -o ~/.codex/skills/kimi-supermemory/SKILL.md \
  https://raw.githubusercontent.com/supermemoryai/kimi-supermemory/main/SKILL.md
```

**Or let your agent do it** - paste this into Kimi CLI:
```
Install kimi-supermemory by following https://raw.githubusercontent.com/supermemoryai/kimi-supermemory/main/README.md
```

### For LLM Agents

<details>
<summary>Instructions for LLM Agents (click to expand)</summary>

If you're an LLM agent helping set up kimi-supermemory, follow these steps:

#### Step 1: Install the CLI tool

```bash
bun add -g kimi-supermemory
```

Verify installation:
```bash
which kimi-supermemory
```

#### Step 2: Configure API key

Ask the user to get their API key from [console.supermemory.ai](https://console.supermemory.ai).

Then set it via environment variable:

```bash
export KIMI_SUPERMEMORY_API_KEY="sm_..."
```

Or run the interactive setup:

```bash
kimi-supermemory init
```

#### Step 3: Install the skill

```bash
mkdir -p ~/.codex/skills/kimi-supermemory

# Copy SKILL.md from the package
if [ -f "$(bun pm bin)/../kimi-supermemory/SKILL.md" ]; then
  cp "$(bun pm bin)/../kimi-supermemory/SKILL.md" ~/.codex/skills/kimi-supermemory/
else
  # Download from GitHub
  curl -o ~/.codex/skills/kimi-supermemory/SKILL.md \
    https://raw.githubusercontent.com/supermemoryai/kimi-supermemory/main/SKILL.md
fi
```

#### Step 4: Verify setup

Test the CLI:

```bash
kimi-supermemory help
```

Test with a memory:

```bash
kimi-supermemory add "Test memory from setup" --type project-config
kimi-supermemory list
```

Check skill is installed:

```bash
ls ~/.codex/skills/kimi-supermemory/SKILL.md
```

If you see the skill file, the setup is complete!

#### Step 5: Initialize codebase memory (optional)

Run this command and follow the prompts to explore and memorize the codebase:

```bash
kimi-supermemory init-codebase
```

This will guide you through researching the project and saving key insights.

</details>

## How It Works

Unlike OpenCode's plugin system with automatic hooks, kimi-supermemory uses a **skill-based approach**:

1. **SKILL.md** - Contains instructions that teach the LLM when to save memories and how to use the CLI
2. **CLI Tool** - The `kimi-supermemory` command provides memory operations
3. **LLM-Driven** - The LLM reads the skill and decides when to save/retrieve memories

### Example Session

```
User: Remember that this project uses Bun instead of Node.js

LLM: [reads SKILL.md, sees "remember" trigger]
LLM: [executes] bunx kimi-supermemory@latest add "Uses Bun runtime 
      and package manager. Commands: bun install, bun run dev, bun test" 
      --type project-config
LLM: Got it! I've saved that this project uses Bun. I'll remember the 
      key commands: bun install, bun run dev, and bun test.
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `add <content>` | Save a memory | `kimi-supermemory add "Uses TypeScript" --type project-config` |
| `search <query>` | Search memories | `kimi-supermemory search "testing workflow"` |
| `list` | List recent memories | `kimi-supermemory list --scope project --limit 10` |
| `forget <id>` | Delete a memory | `kimi-supermemory forget abc123` |
| `context` | Get formatted context | `kimi-supermemory context` |
| `init` | Interactive setup | `kimi-supermemory init` |
| `init-codebase` | Codebase initialization guide | `kimi-supermemory init-codebase` |

### Memory Scopes

- **project** (default): Project-specific knowledge (build commands, architecture, conventions)
- **user**: Cross-project preferences (coding style, communication preferences)

### Memory Types

- `project-config`: Tech stack, commands, tooling
- `architecture`: Codebase structure, components, data flow
- `error-solution`: Known issues and their fixes
- `preference`: Coding style preferences
- `learned-pattern`: Conventions specific to this codebase
- `conversation`: Session summaries

## Features

### Context Retrieval

At the start of each session, the LLM should fetch context:

```bash
kimi-supermemory context
```

This returns formatted context including:
- User profile (cross-project preferences)
- Project knowledge (all project memories)
- Relevant user memories (semantic search based on session)

Example output:
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

### Keyword Detection

The skill teaches the LLM to detect trigger words:
- "remember", "memorize"
- "save this", "note this"  
- "keep in mind", "don't forget"
- "learn this", "store this"
- "record this", "make a note"
- "take note", "jot down"
- "commit to memory"
- "remember that", "never forget"
- "always remember"

Custom patterns can be added via config.

### Privacy

```
API key is <private>sk-abc123</private>
```

Content in `<private>` tags is never stored.

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

All fields optional. Environment variable `KIMI_SUPERMEMORY_API_KEY` takes precedence.

## Memory Scoping

| Scope | Tag | Persists |
|-------|-----|----------|
| User | `kimi_user_{sha256(git email)}` | All projects |
| Project | `kimi_project_{sha256(directory)}` | This project |

## Logs

```bash
tail -f ~/.local/share/kimi-supermemory/log.txt
```

## Comparison

| Feature | OpenCode | Kimi CLI |
|---------|----------|----------|
| Installation | Plugin system | CLI tool + Skill file |
| Hooks | Automatic | LLM-driven via SKILL.md |
| Context Injection | Automatic | LLM fetches via command |
| Compaction | Automatic | Manual workflow |
| Tool Registration | Native | Bash command |

Both provide the same core memory capabilities!

---

## License

MIT
