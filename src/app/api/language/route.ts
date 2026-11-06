import { z } from "zod";
import { getDialogueProvider } from "@/server/dialogue";
import { errorResponse, json, rateLimited } from "@/server/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const level = z.enum(["A2", "B1"]);
const improvement = z.object({
  id: z.string().max(60),
  title: z.object({ fr: z.string().max(200), pt: z.string().max(200) }),
  explanation: z.string().max(1500),
  examples: z.array(z.object({ original: z.string().max(400), better: z.string().max(400) })).max(3),
  practice: z.object({ instruction: z.string().max(500), model: z.string().max(300) }),
});

const body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("explain"), word: z.string().trim().min(1).max(60), sentence: z.string().max(600), level }),
  z.object({
    action: z.literal("debrief"),
    level,
    utterances: z
      .array(
        z.object({
          character: z.enum(["odile", "karim", "lambert"]),
          text: z.string().max(300),
          at: z.number(),
        }),
      )
      .max(200),
  }),
  z.object({ action: z.literal("practice"), level, improvement, answer: z.string().trim().max(300) }),
]);

export async function POST(req: Request) {
  try {
    if (rateLimited(req, 30)) return json({ error: "rate_limited", message: "Trop de requêtes." }, 429);
    const input = body.parse(await req.json());
    const provider = getDialogueProvider();
    switch (input.action) {
      case "explain": {
        const out = await provider.explain(input.word, input.sentence, input.level);
        return json({ explanation: out?.text ?? null, source: out?.source ?? null });
      }
      case "debrief":
        return json({ improvements: await provider.debrief(input.utterances, input.level) });
      case "practice":
        return json({ check: await provider.checkPractice(input.improvement, input.answer, input.level) });
    }
  } catch (error) {
    return errorResponse(error);
  }
}
