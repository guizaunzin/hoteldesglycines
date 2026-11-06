import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Improvement, Level, Utterance } from "@/shared/types";
import type { CharacterTurnInput, CharacterTurnOutput, DialogueProvider, PracticeCheck } from "./provider";
import { renderPlan } from "./demo";
import { violatesGuard } from "./guard";
import {
  DEBRIEF_SCHEMA,
  EXPLAIN_SCHEMA,
  PRACTICE_SCHEMA,
  REPLY_SCHEMA,
  buildCharacterSystemPrompt,
} from "./prompts";
import { analyzeUtterances, checkPracticeHeuristic } from "../language/heuristics";
import { lookup } from "../language/glossary";

export const DEFAULT_MODEL = "claude-opus-5-5";

const replySchema = z.object({
  reply: z.string().min(1).max(800),
  translation_pt: z.string().max(1200),
  facts_used: z.array(z.string()).max(10),
  understood: z.boolean(),
});

const debriefSchema = z.object({
  improvements: z
    .array(
      z.object({
        id: z.string(),
        title_fr: z.string(),
        title_pt: z.string(),
        explanation_pt: z.string(),
        examples: z.array(z.object({ original: z.string(), better: z.string() })).max(3),
        practice_instruction_pt: z.string(),
        practice_model_fr: z.string(),
      }),
    )
    .max(3),
});

const practiceSchema = z.object({ ok: z.boolean(), feedback_pt: z.string(), better_fr: z.string() });
const explainSchema = z.object({ explanation_pt: z.string() });

type JsonSchema = Record<string, unknown>;

/** Sous-ensemble du client utilisé (injectable pour les tests). */
export type ClaudeClient = Pick<Anthropic, "beta">;

export function createClaudeProvider(apiKey: string, model = DEFAULT_MODEL, injected?: ClaudeClient): DialogueProvider {
  const client: ClaudeClient = injected ?? new Anthropic({ apiKey, timeout: 30_000, maxRetries: 1 });

  async function structured<T>(
    schema: z.ZodType<T>,
    jsonSchema: JsonSchema,
    system: string,
    messages: Anthropic.Beta.Messages.BetaMessageParam[],
    maxTokens = 4000,
  ): Promise<T> {
    const response = await client.beta.messages.create({
      model,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: jsonSchema } },
      system,
      messages,
    });
    if (response.stop_reason === "refusal") throw new Error("refusal");
    if (response.stop_reason === "max_tokens") throw new Error("max_tokens");
    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return schema.parse(JSON.parse(text));
  }

  function logError(where: string, error: unknown) {
    if (error instanceof Anthropic.RateLimitError) console.warn(`[claude:${where}] limite de débit`);
    else if (error instanceof Anthropic.AuthenticationError) console.error(`[claude:${where}] clé invalide`);
    else if (error instanceof Anthropic.APIError) console.error(`[claude:${where}] API ${error.status}: ${error.message}`);
    else console.error(`[claude:${where}]`, error instanceof Error ? error.message : error);
  }

  return {
    kind: "ai",
    model,

    async characterTurn(input: CharacterTurnInput): Promise<CharacterTurnOutput> {
      const { def, state, character, message, allowed } = input;
      const persona = def.personas[character];
      const system = buildCharacterSystemPrompt(persona, allowed, state);
      const history = state.history[character] ?? [];
      const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [];
      for (const turn of history) {
        messages.push({ role: "user", content: `Le joueur dit : « ${turn.player} »` });
        messages.push({ role: "assistant", content: JSON.stringify({ reply: turn.reply }) });
      }
      messages.push({ role: "user", content: `Le joueur dit : « ${message} »` });
      try {
        const out = await structured(replySchema, REPLY_SCHEMA, system, messages);
        if (violatesGuard(out.reply)) throw new Error("guard");
        const allowedIds = new Set(allowed.map((f) => f.id));
        return {
          fr: out.reply,
          pt: out.translation_pt,
          factIds: out.facts_used.filter((id) => allowedIds.has(id)),
          source: "ai",
        };
      } catch (error) {
        logError("turn", error);
        return { ...renderPlan(input), source: "fallback" };
      }
    },

    async explain(word: string, sentence: string, level: Level) {
      try {
        const out = await structured(
          explainSchema,
          EXPLAIN_SCHEMA,
          `You help a Brazilian adult learning French (level ${level}). Explain the French word or expression in its sentence, in Brazilian Portuguese, in at most 2 short sentences: meaning in this context, then a simple French synonym or example if useful.`,
          [{ role: "user", content: `Mot : « ${word} »\nPhrase : « ${sentence} »` }],
          1500,
        );
        return { text: out.explanation_pt, source: "ai" as const };
      } catch (error) {
        logError("explain", error);
        const text = lookup(word, sentence);
        return text ? { text, source: "fallback" as const } : null;
      }
    },

    async debrief(utterances: Utterance[], level: Level): Promise<Improvement[]> {
      if (utterances.length === 0) return analyzeUtterances(utterances, level);
      const transcript = utterances
        .slice(-60)
        .map((u) => `- (à ${u.character}) ${u.text}`)
        .join("\n");
      try {
        const out = await structured(
          debriefSchema,
          DEBRIEF_SCHEMA,
          `You are a supportive French teacher for Brazilian adults (target level ${level}). Below are the sentences a learner said while playing a detective game in French. Identify at most THREE priority improvements that would most help them communicate (comprehensibility first, then frequent grammar patterns such as register vous/tu, past tenses, question forms, articles/contractions; ignore tiny typos and missing accents unless frequent). For each: a short title in French and Portuguese, a brief explanation in Brazilian Portuguese, 1–2 examples taken verbatim from the learner's sentences with a corrected version, and one short practice task (instruction in Portuguese + a French model answer). If the learner made few errors, include a stretch goal appropriate to ${level}. Be encouraging and concise. Use kebab-case ids.`,
          [{ role: "user", content: `Phrases de l'apprenant :\n${transcript}` }],
          6000,
        );
        if (out.improvements.length === 0) return analyzeUtterances(utterances, level);
        return out.improvements.map((i) => ({
          id: i.id,
          title: { fr: i.title_fr, pt: i.title_pt },
          explanation: i.explanation_pt,
          examples: i.examples,
          practice: { instruction: i.practice_instruction_pt, model: i.practice_model_fr },
        }));
      } catch (error) {
        logError("debrief", error);
        return analyzeUtterances(utterances, level);
      }
    },

    async checkPractice(improvement: Improvement, answer: string, level: Level): Promise<PracticeCheck> {
      try {
        const out = await structured(
          practiceSchema,
          PRACTICE_SCHEMA,
          `You check a short practice answer from a Brazilian adult learning French (level ${level}). The goal is the structure described in the task. Accept any natural, understandable answer that uses the target structure, even with small spelling slips. Reply in JSON: ok, feedback_pt (one encouraging sentence in Brazilian Portuguese), better_fr (a corrected or more natural version, or the same sentence if it is already good).`,
          [
            {
              role: "user",
              content: `Objectif : ${improvement.title.fr} — ${improvement.explanation}\nConsigne : ${improvement.practice.instruction}\nModèle : ${improvement.practice.model}\nRéponse de l'apprenant : « ${answer} »`,
            },
          ],
          2000,
        );
        return { ok: out.ok, feedback: out.feedback_pt, better: out.better_fr };
      } catch (error) {
        logError("practice", error);
        return checkPracticeHeuristic(improvement.id, answer);
      }
    },
  };
}
