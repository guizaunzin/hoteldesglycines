import { describe, expect, it } from "vitest";
import { STORAGE_KEY, loadGame, loadPrefs, saveGame, DEFAULT_PREFS, type SavedGame } from "@/client/storage";

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
    removeItem: (k: string) => {
      delete data[k];
    },
  };
}

const game: SavedGame = {
  version: 1,
  token: "v1.abc.def.ghi",
  level: "B1",
  scene: "salon",
  transcripts: { karim: [{ id: "1", who: "player", fr: "Bonjour" }] },
  utterances: [{ character: "karim", text: "Bonjour", at: 1 }],
  savedAt: 0,
};

describe("sauvegarde locale", () => {
  it("aller-retour", () => {
    const s = memory();
    expect(saveGame(game, s)).toBe(true);
    const loaded = loadGame(s)!;
    expect(loaded.token).toBe(game.token);
    expect(loaded.scene).toBe("salon");
    expect(loaded.transcripts.karim?.[0].fr).toBe("Bonjour");
  });

  it("données corrompues ou d'un autre format → partie ignorée sans planter", () => {
    expect(loadGame(memory({ [STORAGE_KEY]: "{pas du json" }))).toBeNull();
    expect(loadGame(memory({ [STORAGE_KEY]: JSON.stringify({ version: 2, token: 1 }) }))).toBeNull();
    expect(loadGame(memory({ [STORAGE_KEY]: JSON.stringify({ ...game, scene: "cave" }) }))).toBeNull();
    expect(loadGame(null)).toBeNull();
  });

  it("stockage plein ou bloqué → le jeu continue", () => {
    const full = { getItem: () => null, setItem: () => { throw new Error("QuotaExceeded"); }, removeItem: () => {} };
    expect(saveGame(game, full)).toBe(false);
    const blocked = { getItem: () => { throw new Error("SecurityError"); }, setItem: () => {}, removeItem: () => {} };
    expect(loadGame(blocked)).toBeNull();
    expect(loadPrefs(blocked)).toEqual(DEFAULT_PREFS);
  });

  it("la transcription est bornée", () => {
    const s = memory();
    const many = Array.from({ length: 500 }, (_, i) => ({ id: String(i), who: "player" as const, fr: "x" }));
    saveGame({ ...game, transcripts: { karim: many } }, s);
    expect(loadGame(s)!.transcripts.karim!.length).toBeLessThanOrEqual(120);
  });
});
