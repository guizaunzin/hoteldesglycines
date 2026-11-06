import "server-only";
import type { DialogueProvider } from "./provider";
import { analyzeUtterances, checkPracticeHeuristic } from "../language/heuristics";
import { lookup } from "../language/glossary";
import type { CharacterTurnInput, CharacterTurnOutput } from "./provider";

/** Rend un plan déterministe en réplique écrite (A2 ou B1). */
export function renderPlan(input: CharacterTurnInput): CharacterTurnOutput {
  const lvl = input.state.level;
  const { plan } = input;
  if (plan.kind === "line") {
    return { fr: plan.line[lvl], pt: plan.line.pt, factIds: [], source: "script" };
  }
  const repeated = plan.facts.every((f) => input.state.facts.includes(f.id));
  const prefix = repeated ? { fr: "Comme je vous l'ai dit : ", pt: "Como eu disse: " } : { fr: "", pt: "" };
  return {
    fr: prefix.fr + plan.facts.map((f) => f.line[lvl]).join(" "),
    pt: prefix.pt + plan.facts.map((f) => f.line.pt).join(" "),
    factIds: plan.facts.map((f) => f.id),
    source: "script",
  };
}

export const demoProvider: DialogueProvider = {
  kind: "demo",
  async characterTurn(input) {
    return renderPlan(input);
  },
  async explain(word, sentence) {
    const text = lookup(word, sentence);
    return text ? { text, source: "script" } : null;
  },
  async debrief(utterances, level) {
    return analyzeUtterances(utterances, level);
  },
  async checkPractice(improvement, answer) {
    return checkPracticeHeuristic(improvement.id, answer);
  },
};
