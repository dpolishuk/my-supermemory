import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const LOG_DIR = join(homedir(), ".local", "share", "kimi-supermemory");
const LOG_FILE = join(LOG_DIR, "log.txt");

function ensureLogDir(): void {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function log(message: string, data?: Record<string, unknown>): void {
  ensureLogDir();
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  const line = `[${timestamp}] ${message}${dataStr}\n`;
  
  try {
    appendFileSync(LOG_FILE, line);
  } catch {
    // Silent fail for logging
  }
}
