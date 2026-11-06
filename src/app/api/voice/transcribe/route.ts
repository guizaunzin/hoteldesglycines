import { errorResponse, json, rateLimited } from "@/server/http";
import { serverVoiceAvailable, transcribe } from "@/server/voice/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

// Limite Vercel : corps de requête ≤ 4,5 Mo. On refuse au-delà de 4 Mo
// (≈ 2 minutes d'audio compressé, largement assez pour une question).
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    if (!serverVoiceAvailable()) return json({ error: "unavailable", message: "Reconnaissance serveur non configurée." }, 501);
    if (rateLimited(req, 30)) return json({ error: "rate_limited", message: "Trop de requêtes." }, 429);
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob)) return json({ error: "bad_request", message: "Audio manquant." }, 400);
    if (audio.size > MAX_BYTES) return json({ error: "too_large", message: "Enregistrement trop long." }, 413);
    const name = audio.type.includes("mp4") ? "question.mp4" : audio.type.includes("ogg") ? "question.ogg" : "question.webm";
    // L'audio n'est ni écrit sur disque ni conservé : il est transmis puis oublié.
    const text = await transcribe(audio, name);
    return json({ text });
  } catch (error) {
    return errorResponse(error);
  }
}
