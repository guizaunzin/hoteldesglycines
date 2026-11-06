// Sauvegarde locale de la partie (navigateur uniquement).
// L'état de jeu lui-même est un jeton chiffré : on ne stocke ici que ce jeton,
// la transcription des conversations et les préférences. Aucun audio.

import type { CharacterId, Level, ReplySource, SceneId, Utterance } from "@/shared/types";

export const STORAGE_KEY = "glycines:save:v1";
export const PREFS_KEY = "glycines:prefs:v1";

export interface TranscriptEntry {
  id: string;
  who: "player" | CharacterId | "narrator";
  fr: string;
  pt?: string;
  source?: ReplySource;
  /** Élément présenté (pour l'affichage). */
  presented?: string;
}

export interface SavedGame {
  version: 1;
  token: string;
  level: Level;
  scene: SceneId;
  transcripts: Partial<Record<CharacterId, TranscriptEntry[]>>;
  utterances: Utterance[];
  savedAt: number;
}

export interface Prefs {
  autoSpeak: boolean;
  autoSend: boolean;
  micConsent: boolean;
  voiceEngine: "auto" | "browser" | "server";
}

export const DEFAULT_PREFS: Prefs = { autoSpeak: true, autoSend: true, micConsent: false, voiceEngine: "auto" };

interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function store(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null; // navigation privée, stockage bloqué…
  }
}

const MAX_TRANSCRIPT = 120;
const MAX_UTTERANCES = 200;

export function isSavedGame(x: unknown): x is SavedGame {
  if (!x || typeof x !== "object") return false;
  const g = x as Record<string, unknown>;
  return (
    g.version === 1 &&
    typeof g.token === "string" &&
    (g.level === "A2" || g.level === "B1") &&
    (g.scene === "reception" || g.scene === "salon" || g.scene === "jardin") &&
    typeof g.transcripts === "object" &&
    g.transcripts !== null &&
    Array.isArray(g.utterances)
  );
}

export function loadGame(s: StorageLike | null = store()): SavedGame | null {
  if (!s) return null;
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSavedGame(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGame, s: StorageLike | null = store()): boolean {
  if (!s) return false;
  const trimmed: SavedGame = {
    ...game,
    transcripts: Object.fromEntries(
      Object.entries(game.transcripts).map(([k, v]) => [k, (v ?? []).slice(-MAX_TRANSCRIPT)]),
    ),
    utterances: game.utterances.slice(-MAX_UTTERANCES),
    savedAt: Date.now(),
  };
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    return false; // quota dépassé ou stockage indisponible : le jeu continue
  }
}

export function clearGame(s: StorageLike | null = store()) {
  try {
    s?.removeItem(STORAGE_KEY);
  } catch {
    /* rien */
  }
}

export function loadPrefs(s: StorageLike | null = store()): Prefs {
  try {
    const raw = s?.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: Prefs, s: StorageLike | null = store()) {
  try {
    s?.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* rien */
  }
}
