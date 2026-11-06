import { z } from "zod";
import { GLYCINES } from "@/server/case/glycines";
import {
  accuse,
  allowedFacts,
  assertPlayable,
  examine,
  hint,
  newGame,
  planReply,
  present,
  recordTurn,
  revealFacts,
  suggestions,
  view,
  visit,
} from "@/server/engine/engine";
import { openState, sealState } from "@/server/state/token";
import { getDialogueProvider } from "@/server/dialogue";
import { errorResponse, json, rateLimited } from "@/server/http";
import type { TalkReply } from "@/shared/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const def = GLYCINES;
const token = z.string().min(10).max(60_000);
const character = z.enum(["odile", "karim", "lambert"]);
const level = z.enum(["A2", "B1"]);

const body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("new"), level }),
  z.object({ action: z.literal("state"), token }),
  z.object({ action: z.literal("level"), token, level }),
  z.object({ action: z.literal("visit"), token, scene: z.enum(["reception", "salon", "jardin"]) }),
  z.object({ action: z.literal("examine"), token, hotspot: z.string().max(40) }),
  z.object({ action: z.literal("talk"), token, character, message: z.string().trim().min(1).max(280) }),
  z.object({ action: z.literal("present"), token, character, item: z.string().max(40) }),
  z.object({ action: z.literal("suggest"), token, character }),
  z.object({ action: z.literal("hint"), token, precise: z.boolean() }),
  z.object({ action: z.literal("accuse"), token, suspect: character, evidence: z.array(z.string().max(40)).max(3) }),
]);

export async function POST(req: Request) {
  try {
    const input = body.parse(await req.json());
    if (input.action === "talk" && rateLimited(req, 40)) {
      return json({ error: "rate_limited", message: "Trop de messages. Patientez une minute." }, 429);
    }

    if (input.action === "new") {
      const s = newGame(def, input.level);
      return json({ token: sealState(s), view: view(def, s) });
    }

    let s = openState(input.token);
    if (s.caseId !== def.id) return json({ error: "invalid_token", message: "Partie d'une autre version." }, 409);

    switch (input.action) {
      case "state":
        return json({ token: input.token, view: view(def, s) });

      case "level": {
        s = { ...s, level: input.level };
        return json({ token: sealState(s), view: view(def, s) });
      }

      case "visit": {
        s = visit(s, input.scene);
        return json({ token: sealState(s), view: view(def, s) });
      }

      case "examine": {
        const { state, result } = examine(def, s, input.hotspot);
        return json({ token: sealState(state), view: view(def, state), result });
      }

      case "talk": {
        assertPlayable(s);
        const provider = getDialogueProvider();
        const plan = planReply(def, s, input.character, input.message);
        const allowed = allowedFacts(def, s, input.character);
        const out = await provider.characterTurn({
          def,
          state: s,
          character: input.character,
          message: input.message,
          plan,
          allowed,
        });
        const revealed = revealFacts(def, s, input.character, out.factIds);
        s = recordTurn(revealed.state, input.character, input.message, out.fr);
        const reply: TalkReply = {
          character: input.character,
          line: { fr: out.fr, pt: out.pt },
          source: out.source,
          newTestimonies: revealed.newTestimonies,
          newClues: [],
        };
        return json({ token: sealState(s), view: view(def, s), reply });
      }

      case "present": {
        const { state, line, newTestimonies } = present(def, s, input.character, input.item);
        const reply: TalkReply = {
          character: input.character,
          line: { fr: line[state.level], pt: line.pt },
          source: "script",
          newTestimonies,
          newClues: [],
        };
        return json({ token: sealState(state), view: view(def, state), reply });
      }

      case "suggest":
        return json({ suggestions: suggestions(def, s, input.character) });

      case "hint": {
        const { state, hint: h } = hint(s, input.precise);
        return json({ token: sealState(state), view: view(def, state), hint: h });
      }

      case "accuse": {
        const { state, result } = accuse(def, s, input.suspect, input.evidence);
        return json({ token: sealState(state), view: view(def, state), result });
      }
    }
  } catch (error) {
    return errorResponse(error);
  }
}
