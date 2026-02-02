#!/usr/bin/env node
import { supermemoryClient } from "./services/client.js";
import { getTags } from "./services/tags.js";
import { formatContextForPrompt } from "./services/context.js";
import { stripPrivateContent, isFullyPrivate } from "./services/privacy.js";
import { isConfigured, CONFIG } from "./config.js";
import { log } from "./services/logger.js";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import * as readline from "node:readline";
import type { MemoryScope, MemoryType } from "./types.js";

const CONFIG_DIR = join(homedir(), ".config", "kimi");
const CREDENTIALS_FILE = join(homedir(), ".kimi-supermemory", "credentials.json");

interface Args {
  command: string;
  content?: string;
  query?: string;
  type?: MemoryType;
  scope?: MemoryScope;
  memoryId?: string;
  limit?: number;
  directory?: string;
}

function printHelp(): void {
  console.log(`
kimi-supermemory - Persistent memory for Kimi CLI

Commands:
  add <content>          Add a new memory
    --type <type>        Memory type: project-config, architecture, error-solution, preference, learned-pattern, conversation
    --scope <scope>      Scope: user (cross-project) or project (default)
    --directory <dir>    Project directory (default: cwd)

  search <query>         Search memories
    --scope <scope>      Search specific scope only
    --directory <dir>    Project directory (default: cwd)

  list                   List recent memories
    --scope <scope>      List specific scope only
    --limit <n>          Max memories to list (default: 20)
    --directory <dir>    Project directory (default: cwd)

  forget <memory-id>     Delete a memory

  context                Get formatted context for current session
    --directory <dir>    Project directory (default: cwd)
    --query <query>      Optional query for relevance

  init                   Initialize configuration

  init-codebase          Interactive codebase initialization guide

  help                   Show this help message

Environment:
  KIMI_SUPERMEMORY_API_KEY    Your Supermemory API key

Examples:
  bunx kimi-supermemory add "Uses Bun runtime" --type project-config
  bunx kimi-supermemory search "testing workflow"
  bunx kimi-supermemory list --limit 10
  bunx kimi-supermemory context
`);
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  const result: Args = { command };

  // Parse flags
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--type":
        if (nextArg) result.type = nextArg as MemoryType;
        break;
      case "--scope":
        if (nextArg) result.scope = nextArg as MemoryScope;
        break;
      case "--limit":
        if (nextArg) result.limit = parseInt(nextArg, 10);
        break;
      case "--directory":
        if (nextArg) result.directory = nextArg;
        break;
      case "--query":
        if (nextArg) result.query = nextArg;
        break;
    }
  }

  // Content/query is everything after command (before flags) or the second positional arg
  if (args[1] && !args[1].startsWith("--")) {
    if (command === "add") {
      result.content = args[1];
    } else if (command === "search" || command === "forget") {
      result.query = args[1];
    } else if (command === "forget") {
      result.memoryId = args[1];
    }
  }

  // Join remaining args for content/query if not set
  const positionalArgs: string[] = [];
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      i++; // skip next arg (value)
    } else {
      positionalArgs.push(args[i]);
    }
  }

  if (positionalArgs.length > 0) {
    const combined = positionalArgs.join(" ");
    if (command === "add" && !result.content) {
      result.content = combined;
    } else if (command === "search" && !result.query) {
      result.query = combined;
    } else if (command === "forget" && !result.memoryId) {
      result.memoryId = combined;
    }
  }

  return result;
}

async function addCommand(args: Args): Promise<number> {
  if (!isConfigured()) {
    console.error("Error: KIMI_SUPERMEMORY_API_KEY not set");
    console.error("Get your API key from https://console.supermemory.ai");
    return 1;
  }

  if (!args.content) {
    console.error("Error: content is required");
    console.error("Usage: kimi-supermemory add <content> [--type <type>] [--scope <scope>]");
    return 1;
  }

  const directory = args.directory || process.cwd();
  const tags = getTags(directory);
  const scope = args.scope || "project";
  const containerTag = scope === "user" ? tags.user : tags.project;

  // Strip private content
  const sanitizedContent = stripPrivateContent(args.content);
  if (isFullyPrivate(args.content)) {
    console.error("Error: Cannot store fully private content");
    return 1;
  }

  const result = await supermemoryClient.addMemory(sanitizedContent, containerTag, {
    type: args.type,
  });

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    return 1;
  }

  console.log(`✓ Memory added to ${scope} scope`);
  console.log(`  ID: ${result.id}`);
  if (args.type) console.log(`  Type: ${args.type}`);
  return 0;
}

async function searchCommand(args: Args): Promise<number> {
  if (!isConfigured()) {
    console.error("Error: KIMI_SUPERMEMORY_API_KEY not set");
    return 1;
  }

  if (!args.query) {
    console.error("Error: query is required");
    console.error("Usage: kimi-supermemory search <query> [--scope <scope>]");
    return 1;
  }

  const directory = args.directory || process.cwd();
  const tags = getTags(directory);

  if (args.scope === "user") {
    const result = await supermemoryClient.searchMemories(args.query, tags.user);
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      return 1;
    }
    printSearchResults(args.query, "user", result.results || []);
  } else if (args.scope === "project") {
    const result = await supermemoryClient.searchMemories(args.query, tags.project);
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      return 1;
    }
    printSearchResults(args.query, "project", result.results || []);
  } else {
    // Search both scopes
    const [userResult, projectResult] = await Promise.all([
      supermemoryClient.searchMemories(args.query, tags.user),
      supermemoryClient.searchMemories(args.query, tags.project),
    ]);

    if (!userResult.success || !projectResult.success) {
      console.error(`Error: ${userResult.error || projectResult.error}`);
      return 1;
    }

    const combined = [
      ...(userResult.results || []).map((r) => ({ ...r, scope: "user" as const })),
      ...(projectResult.results || []).map((r) => ({ ...r, scope: "project" as const })),
    ].sort((a, b) => b.similarity - a.similarity);

    printSearchResults(args.query, "all", combined.slice(0, args.limit || 10));
  }

  return 0;
}

function printSearchResults(
  query: string,
  scope: string,
  results: Array<{ id?: string; memory?: string; chunk?: string; similarity: number; scope?: string }>
): void {
  console.log(`\nSearch results for: "${query}"`);
  console.log(`Scope: ${scope}`);
  console.log(`Found: ${results.length} memories\n`);

  if (results.length === 0) {
    console.log("No memories found.");
    return;
  }

  results.forEach((r, i) => {
    const similarity = Math.round(r.similarity * 100);
    const content = r.memory || r.chunk || "";
    const scopeLabel = r.scope ? ` [${r.scope}]` : "";
    console.log(`${i + 1}. [${similarity}%]${scopeLabel} ${content.slice(0, 100)}${content.length > 100 ? "..." : ""}`);
    if (r.id) console.log(`   ID: ${r.id}`);
    console.log();
  });
}

async function listCommand(args: Args): Promise<number> {
  if (!isConfigured()) {
    console.error("Error: KIMI_SUPERMEMORY_API_KEY not set");
    return 1;
  }

  const directory = args.directory || process.cwd();
  const tags = getTags(directory);
  const scope = args.scope || "project";
  const containerTag = scope === "user" ? tags.user : tags.project;
  const limit = args.limit || 20;

  const result = await supermemoryClient.listMemories(containerTag, limit);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    return 1;
  }

  const memories = result.memories || [];
  console.log(`\n${scope === "user" ? "User" : "Project"} Memories (${memories.length}):\n`);

  if (memories.length === 0) {
    console.log("No memories found.");
    return 0;
  }

  memories.forEach((m, i) => {
    console.log(`${i + 1}. ${m.summary || m.content || ""}`);
    console.log(`   ID: ${m.id}`);
    console.log(`   Created: ${new Date(m.createdAt || Date.now()).toLocaleString()}`);
    const metadata = m.metadata as Record<string, string> | undefined;
    if (metadata?.type) console.log(`   Type: ${metadata.type}`);
    console.log();
  });

  return 0;
}

async function forgetCommand(args: Args): Promise<number> {
  if (!isConfigured()) {
    console.error("Error: KIMI_SUPERMEMORY_API_KEY not set");
    return 1;
  }

  if (!args.memoryId) {
    console.error("Error: memory-id is required");
    console.error("Usage: kimi-supermemory forget <memory-id>");
    return 1;
  }

  const result = await supermemoryClient.deleteMemory(args.memoryId);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    return 1;
  }

  console.log(`✓ Memory ${args.memoryId} deleted`);
  return 0;
}

async function contextCommand(args: Args): Promise<number> {
  if (!isConfigured()) {
    console.error("Error: KIMI_SUPERMEMORY_API_KEY not set");
    return 1;
  }

  const directory = args.directory || process.cwd();
  const tags = getTags(directory);
  const query = args.query || "";

  const [profileResult, userMemoriesResult, projectMemoriesListResult] = await Promise.all([
    supermemoryClient.getProfile(tags.user, query),
    supermemoryClient.searchMemories(query || "general context", tags.user),
    supermemoryClient.listMemories(tags.project, CONFIG.maxProjectMemories),
  ]);

  const profile = profileResult.success ? profileResult : null;
  const userMemories = userMemoriesResult.success ? userMemoriesResult : { results: [] };
  const projectMemoriesList = projectMemoriesListResult.success ? projectMemoriesListResult : { memories: [] };

  const projectMemories = {
    results: (projectMemoriesList.memories || []).map((m: any) => ({
      id: m.id,
      memory: m.summary,
      similarity: 1,
      title: m.title,
      metadata: m.metadata,
    })),
    total: projectMemoriesList.memories?.length || 0,
    timing: 0,
  };

  const memoryContext = formatContextForPrompt(profile, userMemories, projectMemories);

  if (memoryContext) {
    console.log(memoryContext);
  } else {
    console.log("[SUPERMEMORY] No memories found. Use 'kimi-supermemory add' to save some.");
  }

  return 0;
}

function createReadline(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${question} `, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function initCommand(): Promise<number> {
  console.log("\n🧠 Kimi Supermemory Setup\n");

  const rl = createReadline();

  // Check if already configured
  if (isConfigured()) {
    console.log("✓ API key is already configured");
    const change = await prompt(rl, "Would you like to change it? (y/n)");
    if (change.toLowerCase() !== "y" && change.toLowerCase() !== "yes") {
      console.log("\nSetup complete!");
      rl.close();
      return 0;
    }
  }

  // Get API key
  console.log("Get your API key from: https://console.supermemory.ai\n");
  const apiKey = await prompt(rl, "Enter your Supermemory API key:");

  if (!apiKey || !apiKey.startsWith("sm_")) {
    console.error("\n✗ Invalid API key. It should start with 'sm_'");
    rl.close();
    return 1;
  }

  // Save to credentials file
  const credentialsDir = join(homedir(), ".kimi-supermemory");
  mkdirSync(credentialsDir, { recursive: true });
  writeFileSync(
    CREDENTIALS_FILE,
    JSON.stringify({ apiKey, createdAt: new Date().toISOString() }, null, 2)
  );

  console.log("\n✓ Credentials saved!");
  console.log(`  Location: ${CREDENTIALS_FILE}`);
  console.log("\nYou can also set the environment variable:");
  console.log(`  export KIMI_SUPERMEMORY_API_KEY="${apiKey}"`);

  rl.close();
  return 0;
}

async function initCodebaseCommand(): Promise<number> {
  console.log(`
🧠 Codebase Memory Initialization

This command provides guidance for initializing memory for a codebase.
Since kimi-cli doesn't support automated hooks, follow these steps:

1. RESEARCH THE CODEBASE
   - Read README.md, package.json, and config files
   - Explore the project structure
   - Identify tech stack and conventions

2. SAVE KEY INSIGHTS
   Use these commands to save what you learn:

   # Tech stack and commands
   bunx kimi-supermemory@latest add "Uses Next.js with TypeScript. Build: npm run build, Dev: npm run dev" --type project-config

   # Architecture insights
   bunx kimi-supermemory@latest add "API routes in src/app/api/, components in src/components/" --type architecture

   # Conventions
   bunx kimi-supermemory@latest add "Uses functional components with hooks, no class components" --type learned-pattern

   # Preferences (for cross-project memory)
   bunx kimi-supermemory@latest add "I prefer explicit return types on functions" --type preference --scope user

3. VERIFY MEMORIES
   bunx kimi-supermemory@latest list

4. USE CONTEXT IN SESSIONS
   At the start of each session, fetch context:
   bunx kimi-supermemory@latest context

The memories you save will be automatically searched and retrieved
based on relevance to your queries.

Happy coding with memory! 🚀
`);

  return 0;
}

async function main(): Promise<number> {
  const args = parseArgs();

  log("CLI started", { command: args.command, directory: args.directory || process.cwd() });

  switch (args.command) {
    case "add":
      return addCommand(args);
    case "search":
      return searchCommand(args);
    case "list":
      return listCommand(args);
    case "forget":
      return forgetCommand(args);
    case "context":
      return contextCommand(args);
    case "init":
      return initCommand();
    case "init-codebase":
      return initCodebaseCommand();
    case "help":
    case "--help":
    case "-h":
    default:
      printHelp();
      return 0;
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
