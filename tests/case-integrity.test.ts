import { describe, expect, it } from "vitest";
import { GLYCINES as def } from "@/server/case/glycines";
import { allowedFacts, check, examine, newGame, owns, present, revealFacts } from "@/server/engine/engine";
import type { GameState } from "@/server/engine/types";
import { HOTSPOTS } from "@/shared/publicCase";
import type { CharacterId } from "@/shared/types";

const CHARS: CharacterId[] = ["odile", "karim", "lambert"];
const factIds = new Set(def.facts.map((f) => f.id));
const clueIds = new Set(def.clues.map((c) => c.id));

describe("intégrité de la définition de l'affaire", () => {
  it("identifiants uniques", () => {
    expect(factIds.size).toBe(def.facts.length);
    expect(clueIds.size).toBe(def.clues.length);
  });

  it("toutes les références existent", () => {
    const refs: string[] = [];
    for (const f of def.facts) {
      refs.push(...(f.requires?.facts ?? []), ...(f.requires?.anyFacts ?? []), ...(f.contradictedBy ?? []));
      for (const c of f.requires?.clues ?? []) expect(clueIds.has(c), c).toBe(true);
    }
    for (const r of def.reactions) {
      refs.push(...(r.reveals ?? []), ...(r.requires?.facts ?? []));
      expect(clueIds.has(r.item) || factIds.has(r.item), r.item).toBe(true);
    }
    for (const e of def.examine) {
      expect(HOTSPOTS.some((h) => h.id === e.hotspot), e.hotspot).toBe(true);
      if (e.clue) expect(clueIds.has(e.clue)).toBe(true);
    }
    for (const id of Object.keys(def.evidence)) expect(clueIds.has(id) || factIds.has(id), id).toBe(true);
    for (const id of refs) expect(factIds.has(id), id).toBe(true);
  });

  it("chaque point d'intérêt a une règle d'examen par défaut", () => {
    for (const h of HOTSPOTS) {
      expect(def.examine.some((e) => e.hotspot === h.id && !e.requires), h.id).toBe(true);
    }
  });

  it("le nombre de pistes respecte le cadrage (6 à 8)", () => {
    expect(def.clues.length).toBeGreaterThanOrEqual(6);
    expect(def.clues.length).toBeLessThanOrEqual(8);
  });

  it("chaque réplique existe en A2, B1 et en traduction", () => {
    const lines = [
      ...def.facts.map((f) => f.line),
      ...def.reactions.map((r) => r.line),
      ...def.examine.map((e) => e.text),
      ...def.clues.map((c) => c.text),
    ];
    for (const l of lines) {
      expect(l.A2.length).toBeGreaterThan(0);
      expect(l.B1.length).toBeGreaterThan(0);
      expect(l.pt.length).toBeGreaterThan(0);
    }
  });

  it("la solution est atteignable et toutes les pistes / tous les témoignages sont accessibles", () => {
    // Fermeture : on applique toutes les actions possibles jusqu'à stabilité.
    let s: GameState = newGame(def, "B1");
    for (let round = 0; round < 20; round++) {
      const before = JSON.stringify([s.clues, s.facts, s.flags]);
      s = { ...s, turns: 0 }; // la fermeture fait beaucoup d'actions
      for (const h of HOTSPOTS) s = examine(def, s, h.id).state;
      for (const c of CHARS) s = revealFacts(def, s, c, allowedFacts(def, s, c).map((f) => f.id)).state;
      for (const c of CHARS) {
        const items = [...s.clues, ...s.facts].filter((i) => owns(def, s, i));
        for (const item of items) s = present(def, s, c, item).state;
      }
      if (JSON.stringify([s.clues, s.facts, s.flags]) === before) break;
    }
    for (const c of def.clues) expect(s.clues, c.id).toContain(c.id);
    for (const f of def.facts.filter((x) => x.note)) expect(s.facts, f.id).toContain(f.id);
    // chaque catégorie de preuve contre le coupable est obtenable
    for (const cat of ["lie", "link", "motive"]) {
      const ok = Object.entries(def.evidence).some(
        ([id, e]) => e.category === cat && e.strength === "strong" && owns(def, s, id),
      );
      expect(ok, cat).toBe(true);
    }
  });

  it("les faits verrouillés ont bien une condition", () => {
    const truthFacts = ["k_left", "k_odile_sent", "k_return", "l_garden", "l_light", "l_silhouette", "o_admits"];
    const s = newGame(def, "A2");
    for (const id of truthFacts) {
      const f = def.facts.find((x) => x.id === id)!;
      expect(check(s, f.requires), id).toBe(false);
    }
  });
});
