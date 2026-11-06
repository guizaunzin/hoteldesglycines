import "server-only";
import type { CharacterId } from "@/shared/types";

// Voix côté serveur (optionnelle) via l'API audio d'OpenAI.
// Sans OPENAI_API_KEY, le navigateur utilise la Web Speech API à la place.
// Aucun audio n'est conservé : il est transmis pour transcription puis oublié.

const BASE = "https://api.openai.com/v1";

export function serverVoiceAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

const VOICES: Record<CharacterId, { voice: string; instructions: string }> = {
  odile: {
    voice: "coral",
    instructions: "Parle français de France. Femme de 67 ans, chaleureuse mais nerveuse et émue. Débit posé.",
  },
  karim: {
    voice: "ash",
    instructions: "Parle français de France. Jeune homme de 23 ans, sympathique, un peu fatigué et nerveux.",
  },
  lambert: {
    voice: "onyx",
    instructions: "Parle français de France. Homme de 55 ans, cultivé, un peu hautain et vexé. Diction soignée.",
  },
};

export async function transcribe(audio: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", process.env.OPENAI_STT_MODEL || "gpt-4o-mini-transcribe");
  form.append("language", "fr");
  form.append("response_format", "json");
  const res = await fetch(`${BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`transcription ${res.status}`);
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

export async function speak(text: string, character: CharacterId, level: "A2" | "B1"): Promise<ArrayBuffer> {
  const v = VOICES[character];
  const pace = level === "A2" ? " Parle lentement et clairement, pour un apprenant de niveau A2." : "";
  const res = await fetch(`${BASE}/audio/speech`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: v.voice,
      input: text,
      instructions: v.instructions + pace,
      response_format: "mp3",
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`synthèse ${res.status}`);
  return res.arrayBuffer();
}
