import { z } from "zod";
import { errorResponse, json, rateLimited } from "@/server/http";
import { serverVoiceAvailable, speak } from "@/server/voice/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const body = z.object({
  text: z.string().trim().min(1).max(600),
  character: z.enum(["odile", "karim", "lambert"]),
  level: z.enum(["A2", "B1"]),
});

export async function POST(req: Request) {
  try {
    if (!serverVoiceAvailable()) return json({ error: "unavailable", message: "Synthèse serveur non configurée." }, 501);
    if (rateLimited(req, 60)) return json({ error: "rate_limited", message: "Trop de requêtes." }, 429);
    const input = body.parse(await req.json());
    const audio = await speak(input.text, input.character, input.level);
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
