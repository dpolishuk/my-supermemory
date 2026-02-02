#!/bin/bash
set -e

echo "🧠 Installing kimi-supermemory..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Install the CLI tool
echo -e "${BLUE}Installing CLI tool...${NC}"
if command -v bun &> /dev/null; then
    bun add -g kimi-supermemory
elif command -v npm &> /dev/null; then
    npm install -g kimi-supermemory
else
    echo "Error: Neither bun nor npm found. Please install one of them first."
    exit 1
fi

echo -e "${GREEN}✓ CLI tool installed${NC}"

# Create skills directory
SKILL_DIR="$HOME/.codex/skills/kimi-supermemory"
mkdir -p "$SKILL_DIR"

# Copy SKILL.md
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/../SKILL.md" ]; then
    cp "$SCRIPT_DIR/../SKILL.md" "$SKILL_DIR/"
    echo -e "${GREEN}✓ Skill installed to $SKILL_DIR${NC}"
else
    echo "Warning: Could not find SKILL.md to copy"
fi

# Check for API key
if [ -z "$SUPERMEMORY_API_KEY" ]; then
    echo ""
    echo "🔑 Next step: Configure your API key"
    echo ""
    echo "Get your API key from: https://console.supermemory.ai"
    echo ""
    echo "Then either:"
    echo "  1. Run: kimi-supermemory init"
    echo "  2. Set env var: export SUPERMEMORY_API_KEY='sm_...'"
else
    echo -e "${GREEN}✓ API key already configured${NC}"
fi

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Quick start:"
echo "  kimi-supermemory add 'Your first memory' --type project-config"
echo "  kimi-supermemory search 'testing'"
echo "  kimi-supermemory context"
