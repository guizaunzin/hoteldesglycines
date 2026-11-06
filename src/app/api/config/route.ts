import { getDialogueProvider } from "@/server/dialogue";
import { json } from "@/server/http";
import { stateSecretConfigured } from "@/server/state/token";
import { serverVoiceAvailable } from "@/server/voice/openai";
import type { AppConfig } from "@/shared/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const provider = getDialogueProvider();
  const voice = serverVoiceAvailable();
  const config: AppConfig = {
    dialogue: provider.kind,
    model: provider.model,
    serverStt: voice,
    serverTts: voice,
    stateSecretConfigured: stateSecretConfigured(),
  };
  return json(config);
}
