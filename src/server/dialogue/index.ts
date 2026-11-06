import "server-only";
import type { DialogueProvider } from "./provider";
import { demoProvider } from "./demo";
import { createClaudeProvider, DEFAULT_MODEL } from "./claude";

let cached: DialogueProvider | null = null;

/** Choisit le fournisseur de dialogue selon l'environnement. */
export function getDialogueProvider(): DialogueProvider {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  const forceDemo = process.env.AI_PROVIDER === "demo";
  cached = key && !forceDemo ? createClaudeProvider(key, process.env.ANTHROPIC_MODEL || DEFAULT_MODEL) : demoProvider;
  return cached;
}
