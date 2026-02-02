import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const CONFIG_DIR = join(homedir(), ".config", "kimi");
const CONFIG_FILES = [
  join(CONFIG_DIR, "supermemory.json"),
];

interface SupermemoryConfig {
  apiKey?: string;
  similarityThreshold?: number;
  maxMemories?: number;
  maxProjectMemories?: number;
  maxProfileItems?: number;
  injectProfile?: boolean;
  containerTagPrefix?: string;
  filterPrompt?: string;
  keywordPatterns?: string[];
}

const DEFAULT_KEYWORD_PATTERNS = [
  "remember",
  "memorize",
  "save\\s+this",
  "note\\s+this",
  "keep\\s+in\\s+mind",
  "don'?t\\s+forget",
  "learn\\s+this",
  "store\\s+this",
  "record\\s+this",
  "make\\s+a\\s+note",
  "take\\s+note",
  "jot\\s+down",
  "commit\\s+to\\s+memory",
  "remember\\s+that",
  "never\\s+forget",
  "always\\s+remember",
];

const DEFAULTS: Required<Omit<SupermemoryConfig, "apiKey">> = {
  similarityThreshold: 0.6,
  maxMemories: 5,
  maxProjectMemories: 10,
  maxProfileItems: 5,
  injectProfile: true,
  containerTagPrefix: "kimi",
  filterPrompt:
    "You are a stateful coding agent. Remember all the information, including but not limited to user's coding preferences, tech stack, behaviours, workflows, and any other relevant details.",
  keywordPatterns: [],
};

function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

function loadConfig(): SupermemoryConfig {
  for (const path of CONFIG_FILES) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, "utf-8");
        return JSON.parse(content) as SupermemoryConfig;
      } catch {
        // Invalid config, use defaults
      }
    }
  }
  return {};
}

const fileConfig = loadConfig();

function getApiKey(): string | undefined {
  // Priority: env var > config file
  if (process.env.KIMI_SUPERMEMORY_API_KEY) return process.env.KIMI_SUPERMEMORY_API_KEY;
  if (process.env.SUPERMEMORY_API_KEY) return process.env.SUPERMEMORY_API_KEY;
  if (fileConfig.apiKey) return fileConfig.apiKey;
  return undefined;
}

export const CONFIG = {
  apiKey: getApiKey(),
  similarityThreshold: fileConfig.similarityThreshold ?? DEFAULTS.similarityThreshold,
  maxMemories: fileConfig.maxMemories ?? DEFAULTS.maxMemories,
  maxProjectMemories: fileConfig.maxProjectMemories ?? DEFAULTS.maxProjectMemories,
  maxProfileItems: fileConfig.maxProfileItems ?? DEFAULTS.maxProfileItems,
  injectProfile: fileConfig.injectProfile ?? DEFAULTS.injectProfile,
  containerTagPrefix: fileConfig.containerTagPrefix ?? DEFAULTS.containerTagPrefix,
  filterPrompt: fileConfig.filterPrompt ?? DEFAULTS.filterPrompt,
  keywordPatterns: [
    ...DEFAULT_KEYWORD_PATTERNS,
    ...(fileConfig.keywordPatterns ?? []).filter(isValidRegex),
  ],
};

export function isConfigured(): boolean {
  return !!CONFIG.apiKey;
}
