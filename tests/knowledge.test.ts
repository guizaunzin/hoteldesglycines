import { describe, expect, it } from "vitest";
import { GLYCINES as def } from "@/server/case/glycines";
import { allowedFacts, examine, newGame, present, revealFacts } from "@/server/engine/engine";
import { buildCharacterSystemPrompt } from "@/server/dialogue/prompts";
import { violatesGuard } from "@/server/dialogue/guard";
import type { GameState } from "@/server/engine/types";
import type { CharacterId } from "@/shared/types";

const CHARS: CharacterId[] = ["odile", "karim", "lambert"];

function promptFor(s: GameState, c: CharacterId) {
  return buildCharacterSystemPrompt(def.personas[c], allowedFacts(def, s, c), s);
}

/** Vérifie qu'aucun fait non autorisé, ni la vérité, n'apparaît dans les consignes. */
function assertNoLeak(s: GameState) {
  for (const c of CHARS) {
    const prompt = promptFor(s, c);
    const allowed = new Set(allowedFacts(def, s, c).map((f) => f.id));
    expect(prompt).not.toContain(def.truth.summary);
    for (const t of def.truth.timeline) expect(prompt).not.toContain(t.event);
    for (const e of def.endings.explanation) expect(prompt).not.toContain(e.fr);
    for (const f of def.facts) {
      if (allowed.has(f.id)) continue;
      expect(prompt, `${c} ne doit pas connaître ${f.id}`).not.toContain(f.line.B1);
      expect(prompt).not.toContain(`[${f.id}]`);
    }
  }
}

describe("limites de connaissance des personnages (consignes IA)", () => {
  it("au début, aucune vérité ne figure dans les consignes", () => {
    const s = newGame(def, "A2");
    assertNoLeak(s);
    expect(promptFor(s, "odile")).not.toMatch(/cabane.*cach|foulard|lampe de poche/i);
    expect(promptFor(s, "karim")).not.toMatch(/Café du Port/);
  });

  it("à chaque étape de l'enquête, seuls les faits débloqués sont transmis", () => {
    let s = newGame(def, "B1");
    assertNoLeak(s);
    const steps: ((x: GameState) => GameState)[] = [
      (x) => examine(def, x, "corbeille").state,
      (x) => present(def, x, "karim", "ticket").state,
      (x) => revealFacts(def, x, "karim", ["k_odile_sent"]).state,
      (x) => examine(def, x, "banc").state,
      (x) => present(def, x, "lambert", "lunettes").state,
      (x) => revealFacts(def, x, "lambert", ["l_light"]).state,
      (x) => examine(def, x, "cabane").state,
      (x) => present(def, x, "odile", "boite").state,
    ];
    for (const step of steps) {
      s = step(s);
      assertNoLeak(s);
    }
    // Même en fin d'enquête, la vérité complète n'est jamais transmise.
    expect(promptFor(s, "odile")).not.toContain(def.truth.summary);
  });

  it("le garde-fou bloque les aveux inventés et les sorties de personnage", () => {
    expect(violatesGuard("Oui, j'ai caché la boîte dans la cabane.")).toBe(true);
    expect(violatesGuard("C'est Odile qui a volé la boîte.")).toBe(true);
    expect(violatesGuard("En tant qu'IA, je ne peux pas.")).toBe(true);
    expect(violatesGuard("Je ne sais pas, j'étais dans ma chambre.")).toBe(false);
  });
});
