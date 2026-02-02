# Agent Instructions - Installing my-supermemory for Kimi CLI

These instructions are for LLM agents helping users set up my-supermemory with Kimi CLI.

## Quick Install

If the user wants to install my-supermemory, run these commands:

```bash
# Step 1: Install the CLI tool
bun add -g kimi-supermemory

# Step 2: Configure API key (ask user for their key from console.supermemory.ai)
export SUPERMEMORY_API_KEY="sm_..."

# Step 3: Install the skill
mkdir -p ~/.codex/skills/kimi-supermemory
curl -o ~/.codex/skills/kimi-supermemory/SKILL.md \
  https://raw.githubusercontent.com/dpolishuk/my-supermemory/main/kimi-supermemory/SKILL.md

# Step 4: Verify
kimi-supermemory help
```

## Detailed Instructions

### Step 1: Install CLI Tool

```bash
bun add -g kimi-supermemory
```

Verify:
```bash
which kimi-supermemory
```

### Step 2: Configure API Key

Ask the user: "Please get your API key from https://console.supermemory.ai"

Once they provide it:
```bash
export SUPERMEMORY_API_KEY="sm_..."
```

Or use interactive setup:
```bash
kimi-supermemory init
```

### Step 3: Install Skill

The skill teaches Kimi CLI's LLM how to use supermemory:

```bash
mkdir -p ~/.codex/skills/kimi-supermemory
curl -o ~/.codex/skills/kimi-supermemory/SKILL.md \
  https://raw.githubusercontent.com/dpolishuk/my-supermemory/main/kimi-supermemory/SKILL.md
```

### Step 4: Verify Setup

Test CLI:
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

### Step 5: Initialize Codebase Memory (Optional)

If the user wants to memorize the current codebase:

```bash
kimi-supermemory init-codebase
```

This will guide you through researching the project structure and saving key insights.

## What to Tell the User

After installation, tell the user:

> ✅ my-supermemory is now installed for Kimi CLI!
> 
> The skill file teaches me to:
> - Save memories when you say "remember", "don't forget", etc.
> - Retrieve relevant context at the start of our sessions
> 
> Your memories will persist across sessions and projects.

## Troubleshooting

If `kimi-supermemory` command not found:
- Make sure `bun` is installed: `curl -fsSL https://bun.sh/install | bash`
- Or use with `bunx`: `bunx kimi-supermemory@latest <command>`

If API errors:
- Check `SUPERMEMORY_API_KEY` is set: `echo $SUPERMEMORY_API_KEY`
- Verify the key starts with `sm_`

## Usage Examples

Once installed, I'll automatically detect memory triggers:

**User**: "Remember that this project uses Bun"

**Agent**: [runs] `kimi-supermemory add "Uses Bun runtime" --type project-config`

**Agent**: "Got it! I've saved that this project uses Bun."

---

For more details, see: https://github.com/dpolishuk/my-supermemory
