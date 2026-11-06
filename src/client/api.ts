"use client";

import type {
  AccuseResult,
  AppConfig,
  CharacterId,
  ExamineResult,
  GameView,
  Hint,
  Improvement,
  Level,
  SceneId,
  Suggestion,
  TalkReply,
  Utterance,
} from "@/shared/types";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network", "Sem conexão com o servidor. Verifique sua internet.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "server_error", data.message ?? "Erro no servidor.", res.status);
  return data as T;
}

type WithState = { token: string; view: GameView };

export const api = {
  async config(): Promise<AppConfig> {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (!res.ok) throw new ApiError("config", "Configuração indisponível", res.status);
    return res.json();
  },
  newGame: (level: Level) => post<WithState>("/api/game", { action: "new", level }),
  state: (token: string) => post<WithState>("/api/game", { action: "state", token }),
  setLevel: (token: string, level: Level) => post<WithState>("/api/game", { action: "level", token, level }),
  visit: (token: string, scene: SceneId) => post<WithState>("/api/game", { action: "visit", token, scene }),
  examine: (token: string, hotspot: string) =>
    post<WithState & { result: ExamineResult }>("/api/game", { action: "examine", token, hotspot }),
  talk: (token: string, character: CharacterId, message: string) =>
    post<WithState & { reply: TalkReply }>("/api/game", { action: "talk", token, character, message }),
  present: (token: string, character: CharacterId, item: string) =>
    post<WithState & { reply: TalkReply }>("/api/game", { action: "present", token, character, item }),
  suggest: (token: string, character: CharacterId) =>
    post<{ suggestions: Suggestion[] }>("/api/game", { action: "suggest", token, character }),
  hint: (token: string, precise: boolean) => post<WithState & { hint: Hint }>("/api/game", { action: "hint", token, precise }),
  accuse: (token: string, suspect: CharacterId, evidence: string[]) =>
    post<WithState & { result: AccuseResult }>("/api/game", { action: "accuse", token, suspect, evidence }),

  explain: (word: string, sentence: string, level: Level) =>
    post<{ explanation: string | null }>("/api/language", { action: "explain", word, sentence, level }),
  debrief: (utterances: Utterance[], level: Level) =>
    post<{ improvements: Improvement[] }>("/api/language", { action: "debrief", utterances, level }),
  practice: (improvement: Improvement, answer: string, level: Level) =>
    post<{ check: { ok: boolean; feedback: string; better?: string } }>("/api/language", {
      action: "practice",
      improvement,
      answer,
      level,
    }),
};
