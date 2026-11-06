import type {
  AccuseResult,
  Bilingual,
  CharacterId,
  ClueCard,
  EndingView,
  ExamineResult,
  GameView,
  Hint,
  Level,
  Objective,
  SceneId,
  Suggestion,
  TestimonyCard,
} from "@/shared/types";
import { HOTSPOTS, SCENES } from "@/shared/publicCase";
import { classify, looksNotFrench } from "./classify";
import type {
  CaseDefinition,
  Condition,
  EvidenceCategory,
  Fact,
  GameState,
  LevelLine,
  TopicId,
} from "./types";

export const MAX_TURNS = 400;
export const MAX_EVIDENCE = 3;
const HISTORY_PER_CHARACTER = 4;

export class GameError extends Error {
  constructor(
    public code: "bad_request" | "ended" | "limit",
    message: string,
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------- état

export function newGame(def: CaseDefinition, level: Level): GameState {
  return {
    v: 1,
    caseId: def.id,
    level,
    clues: [],
    facts: [],
    flags: [],
    visited: [],
    examined: [],
    talkedTo: [],
    turns: 0,
    hintsUsed: 0,
    history: {},
    startedAt: Date.now(),
  };
}

function clone(s: GameState): GameState {
  return structuredClone(s);
}

export function check(s: GameState, c?: Condition): boolean {
  if (!c) return true;
  if (c.clues && !c.clues.every((x) => s.clues.includes(x))) return false;
  if (c.facts && !c.facts.every((x) => s.facts.includes(x))) return false;
  if (c.flags && !c.flags.every((x) => s.flags.includes(x))) return false;
  if (c.notFlags && c.notFlags.some((x) => s.flags.includes(x))) return false;
  if (c.anyFacts && !c.anyFacts.some((x) => s.facts.includes(x))) return false;
  return true;
}

function addUnique<T>(arr: T[], ...items: T[]) {
  for (const it of items) if (!arr.includes(it)) arr.push(it);
}

export function assertPlayable(s: GameState) {
  if (s.ended) throw new GameError("ended", "La partie est terminée.");
  if (s.turns >= MAX_TURNS) throw new GameError("limit", "Nombre maximum d'actions atteint pour cette partie.");
}

/** Un mensonge est contredit dès qu'un fait qui le dément est connu du joueur. */
function isContradicted(s: GameState, f: Fact) {
  return !!f.contradictedBy?.some((id) => s.facts.includes(id));
}

/**
 * Un personnage arrête de répéter son mensonge seulement quand IL a avoué
 * (il ne sait pas ce que les autres ont dit au joueur).
 */
function abandonedLie(def: CaseDefinition, s: GameState, f: Fact) {
  return !!f.contradictedBy?.some((id) => s.facts.includes(id) && factById(def, id)?.character === f.character);
}

// ---------------------------------------------------------------- faits

export function factById(def: CaseDefinition, id: string): Fact | undefined {
  return def.facts.find((f) => f.id === id);
}

/**
 * Faits qu'un personnage a le DROIT de dire maintenant.
 * C'est la seule liste transmise à l'IA : un fait verrouillé n'en sort jamais.
 */
export function allowedFacts(def: CaseDefinition, s: GameState, character: CharacterId): Fact[] {
  return def.facts.filter((f) => {
    if (f.character !== character) return false;
    if (abandonedLie(def, s, f)) return false;
    if (s.facts.includes(f.id)) return true;
    if (f.topics.length === 0) return false; // révélé seulement par une réaction
    return check(s, f.requires);
  });
}

export type Plan =
  | { kind: "facts"; facts: Fact[]; topics: TopicId[] }
  | { kind: "line"; line: LevelLine; reason: "greet" | "meta" | "clarify" | "offtopic" | "notFrench" | "bye" };

const BYE: LevelLine = {
  A2: "Au revoir. Revenez si vous avez d'autres questions.",
  B1: "Au revoir. N'hésitez pas à revenir si vous avez d'autres questions.",
  pt: "Até logo. Não hesite em voltar se tiver outras perguntas.",
};
const REGREET: LevelLine = {
  A2: "Oui ? Je vous écoute.",
  B1: "Oui ? Je vous écoute, posez votre question.",
  pt: "Sim? Estou ouvindo, faça sua pergunta.",
};

/** Plan de réponse déterministe (mode démonstration et repli si l'IA échoue). */
export function planReply(def: CaseDefinition, s: GameState, character: CharacterId, message: string): Plan {
  const persona = def.personas[character];
  if (looksNotFrench(message)) return { kind: "line", line: persona.notFrench, reason: "notFrench" };
  const topics = classify(message);
  if (topics.includes("meta")) return { kind: "line", line: persona.meta, reason: "meta" };

  const allowed = allowedFacts(def, s, character);
  const chosen: Fact[] = [];
  // « box » est un sujet très large : on ne l'utilise que si rien de plus précis ne répond.
  const ordered = [...topics.filter((t) => t !== "box"), ...(topics.includes("box") ? (["box"] as TopicId[]) : [])];
  for (const topic of ordered) {
    if (topic === "box" && chosen.length > 0) break;
    const candidates = allowed
      .filter((f) => f.topics.includes(topic) && !chosen.includes(f))
      .sort((a, b) => {
        const ra = s.facts.includes(a.id) ? 1 : 0;
        const rb = s.facts.includes(b.id) ? 1 : 0;
        if (ra !== rb) return ra - rb; // non révélés d'abord
        return (b.priority ?? 0) - (a.priority ?? 0);
      });
    if (candidates[0]) chosen.push(candidates[0]);
    if (chosen.length >= 2) break;
  }
  // Si un fait nouveau a été trouvé, on ne répète pas un fait déjà dit à côté.
  const fresh = chosen.filter((f) => !s.facts.includes(f.id));
  const final = fresh.length > 0 ? fresh : chosen.slice(0, 1);
  if (final.length > 0) return { kind: "facts", facts: final, topics };

  if (topics.includes("greet")) {
    const already = s.talkedTo.includes(character);
    return { kind: "line", line: already ? REGREET : persona.greeting, reason: "greet" };
  }
  if (topics.includes("bye")) return { kind: "line", line: BYE, reason: "bye" };
  if (topics.length > 0) return { kind: "line", line: persona.offtopic, reason: "offtopic" };
  const idx = s.turns % persona.clarify.length;
  return { kind: "line", line: persona.clarify[idx], reason: "clarify" };
}

/** Enregistre les faits dits par un personnage. Seuls les faits autorisés sont acceptés. */
export function revealFacts(
  def: CaseDefinition,
  s: GameState,
  character: CharacterId,
  ids: string[],
): { state: GameState; newTestimonies: string[] } {
  const allowed = new Set(allowedFacts(def, s, character).map((f) => f.id));
  const next = clone(s);
  const newTestimonies: string[] = [];
  for (const id of ids) {
    if (!allowed.has(id) || next.facts.includes(id)) continue;
    const f = factById(def, id)!;
    next.facts.push(id);
    if (f.sets) addUnique(next.flags, ...f.sets);
    if (f.note) newTestimonies.push(id);
  }
  return { state: next, newTestimonies };
}

export function recordTurn(s: GameState, character: CharacterId, player: string, reply: string): GameState {
  const next = clone(s);
  next.turns += 1;
  addUnique(next.talkedTo, character);
  const h = next.history[character] ?? [];
  h.push({ player: player.slice(0, 300), reply: reply.slice(0, 500) });
  next.history[character] = h.slice(-HISTORY_PER_CHARACTER);
  return next;
}

// ---------------------------------------------------------------- actions

export function visit(s: GameState, scene: SceneId): GameState {
  if (!SCENES.some((x) => x.id === scene)) throw new GameError("bad_request", "Lieu inconnu.");
  const next = clone(s);
  addUnique(next.visited, scene);
  return next;
}

export function examine(
  def: CaseDefinition,
  s: GameState,
  hotspot: string,
): { state: GameState; result: ExamineResult } {
  assertPlayable(s);
  const spot = HOTSPOTS.find((h) => h.id === hotspot);
  if (!spot) throw new GameError("bad_request", "Point d'intérêt inconnu.");
  const rule = def.examine.find((r) => r.hotspot === hotspot && check(s, r.requires));
  if (!rule) throw new GameError("bad_request", "Rien à examiner ici.");
  const next = clone(s);
  next.turns += 1;
  addUnique(next.visited, spot.scene);
  addUnique(next.examined, hotspot);
  if (rule.sets) addUnique(next.flags, ...rule.sets);
  const lvl = s.level;
  let text: Bilingual = { fr: rule.text[lvl], pt: rule.text.pt };
  let newClue: string | undefined;
  if (rule.clue) {
    const clue = def.clues.find((c) => c.id === rule.clue)!;
    text = { fr: `${rule.text[lvl]} ${clue.text[lvl]}`, pt: `${rule.text.pt} ${clue.text.pt}` };
    if (!next.clues.includes(clue.id)) {
      next.clues.push(clue.id);
      newClue = clue.id;
    }
  }
  return { state: next, result: { text, newClue } };
}

/** Le joueur possède-t-il cet élément (pièce ou témoignage du carnet) ? */
export function owns(def: CaseDefinition, s: GameState, item: string): boolean {
  if (s.clues.includes(item)) return true;
  const f = factById(def, item);
  return !!f && !!f.note && s.facts.includes(item);
}

export function present(
  def: CaseDefinition,
  s: GameState,
  character: CharacterId,
  item: string,
): { state: GameState; line: LevelLine; newTestimonies: string[] } {
  assertPlayable(s);
  if (!owns(def, s, item)) throw new GameError("bad_request", "Vous n'avez pas cet élément dans votre carnet.");
  const reaction = def.reactions.find((r) => r.character === character && r.item === item && check(s, r.requires));
  let next = clone(s);
  const newTestimonies: string[] = [];
  let line: LevelLine = def.personas[character].genericPresent;
  if (reaction) {
    line = reaction.line;
    if (reaction.sets) addUnique(next.flags, ...reaction.sets);
    for (const id of reaction.reveals ?? []) {
      if (next.facts.includes(id)) continue;
      const f = factById(def, id)!;
      next.facts.push(id);
      if (f.sets) addUnique(next.flags, ...f.sets);
      if (f.note) newTestimonies.push(id);
    }
  }
  next = recordTurn(next, character, `[présente : ${item}]`, line[s.level]);
  return { state: next, line, newTestimonies };
}

// ---------------------------------------------------------------- accusation

export function evaluateEvidence(def: CaseDefinition, evidence: string[]) {
  const covered: Record<EvidenceCategory, boolean> = { lie: false, link: false, motive: false };
  const weak: Record<EvidenceCategory, number> = { lie: 0, link: 0, motive: 0 };
  for (const id of evidence) {
    const e = def.evidence[id];
    if (!e) continue;
    if (e.strength === "strong") covered[e.category] = true;
    else weak[e.category] += 1;
  }
  for (const k of Object.keys(weak) as EvidenceCategory[]) if (weak[k] >= 2) covered[k] = true;
  return covered;
}

export function accuse(
  def: CaseDefinition,
  s: GameState,
  suspect: CharacterId,
  evidence: string[],
): { state: GameState; result: AccuseResult } {
  assertPlayable(s);
  const unique = [...new Set(evidence)];
  if (unique.length === 0 || unique.length > MAX_EVIDENCE)
    throw new GameError("bad_request", `Choisissez entre 1 et ${MAX_EVIDENCE} preuves.`);
  for (const id of unique)
    if (!owns(def, s, id)) throw new GameError("bad_request", "Une des preuves n'est pas dans votre carnet.");

  const next = clone(s);
  next.turns += 1;
  if (suspect !== def.truth.culprit) {
    next.ended = { kind: "wrong", accused: suspect };
    return { state: next, result: { accepted: true } };
  }
  const c = evaluateEvidence(def, unique);
  const solved = c.link && (c.lie || c.motive);
  if (!solved) {
    const missing = (Object.keys(c) as EvidenceCategory[]).filter((k) => !c[k]).map((k) => def.rebuttals.missing[k]);
    return {
      state: next,
      result: {
        accepted: false,
        rebuttal: { fr: def.rebuttals.insufficient[s.level], pt: def.rebuttals.insufficient.pt },
        missing,
      },
    };
  }
  next.ended = { kind: c.lie && c.motive ? "perfect" : "solved", accused: suspect };
  return { state: next, result: { accepted: true } };
}

// ---------------------------------------------------------------- vue publique

function objectives(s: GameState): Objective[] {
  const has = (id: string) => s.facts.includes(id);
  const out: Objective[] = [
    {
      id: "talk",
      text: { fr: "Parlez à Odile, Karim et Monsieur Lambert.", pt: "Converse com Odile, Karim e o Sr. Lambert." },
      done: s.talkedTo.length >= 3,
      progress: `${Math.min(s.talkedTo.length, 3)}/3`,
    },
    {
      id: "explore",
      text: { fr: "Examinez la réception, le salon et le jardin.", pt: "Examine a recepção, o salão e o jardim." },
      done: s.visited.length >= 3,
      progress: `${Math.min(s.visited.length, 3)}/3`,
    },
  ];
  const contradiction = has("k_left") || has("l_garden") || has("o_admits");
  out.push({
    id: "contradiction",
    text: {
      fr: "Quelqu'un ne dit pas la vérité. Trouvez une contradiction et présentez une preuve à cette personne.",
      pt: "Alguém não está dizendo a verdade. Encontre uma contradição e apresente uma prova a essa pessoa.",
    },
    done: contradiction,
  });
  if (contradiction) {
    out.push({
      id: "night",
      text: {
        fr: "Reconstituez la nuit : qui était où entre 22 h 45 et minuit ?",
        pt: "Reconstitua a noite: quem estava onde entre 22h45 e meia-noite?",
      },
      done: has("k_odile_sent") && has("l_light"),
    });
  }
  if (has("l_light")) {
    out.push({
      id: "find",
      text: { fr: "Retrouvez le Rossignol.", pt: "Encontre o Rossignol." },
      done: s.clues.includes("boite"),
    });
  }
  if (contradiction) {
    out.push({
      id: "conclude",
      text: {
        fr: "Quand vous êtes prêt·e : « Conclure l'enquête » avec un suspect et trois preuves.",
        pt: "Quando estiver pronto(a): \"Concluir a investigação\" com um suspeito e três provas.",
      },
      done: !!s.ended,
    });
  }
  return out;
}

function endingView(def: CaseDefinition, s: GameState): EndingView | undefined {
  if (!s.ended) return undefined;
  const lvl = s.level;
  const e =
    s.ended.kind === "wrong"
      ? def.endings.wrong[s.ended.accused]
      : s.ended.kind === "perfect"
        ? def.endings.perfect
        : def.endings.solved;
  return {
    kind: s.ended.kind,
    title: e.title,
    story: e.story.map((l) => ({ fr: l[lvl], pt: l.pt })),
    explanation: def.endings.explanation,
  };
}

export function view(def: CaseDefinition, s: GameState): GameView {
  const lvl = s.level;
  const clues: ClueCard[] = s.clues.map((id) => {
    const c = def.clues.find((x) => x.id === id)!;
    return { id, scene: c.scene, title: c.title, text: { fr: c.text[lvl], pt: c.text.pt }, icon: c.icon };
  });
  const testimonies: TestimonyCard[] = s.facts
    .map((id) => factById(def, id)!)
    .filter((f) => f.note)
    .map((f) => ({
      id: f.id,
      character: f.character,
      text: f.note!,
      time: f.time,
      contradicted: isContradicted(s, f) || undefined,
    }));
  return {
    caseId: s.caseId,
    level: s.level,
    clues,
    testimonies,
    objectives: objectives(s),
    talkedTo: s.talkedTo,
    visited: s.visited,
    examined: s.examined,
    turns: s.turns,
    ending: endingView(def, s),
  };
}

// ---------------------------------------------------------------- aides

interface HintStep {
  when: (s: GameState) => boolean;
  vague: Bilingual;
  precise: Bilingual;
}

const HINTS: HintStep[] = [
  {
    when: (s) => s.talkedTo.length === 0,
    vague: { fr: "Commencez par saluer quelqu'un. Karim est à la réception.", pt: "Comece cumprimentando alguém. Karim está na recepção." },
    precise: { fr: "Cliquez sur Karim et dites : « Bonjour ! Qu'est-ce qui s'est passé ? »", pt: "Clique no Karim e diga: \"Bonjour ! Qu'est-ce qui s'est passé ?\"" },
  },
  {
    when: (s) => !s.clues.includes("ticket"),
    vague: { fr: "À la réception, quelqu'un a jeté un petit papier…", pt: "Na recepção, alguém jogou fora um papelzinho…" },
    precise: { fr: "Examinez la corbeille de la réception.", pt: "Examine a lixeira da recepção." },
  },
  {
    when: (s) => s.clues.includes("ticket") && !s.facts.includes("k_left"),
    vague: { fr: "Le registre dit une chose, le ticket en dit une autre…", pt: "O registro diz uma coisa, o recibo diz outra…" },
    precise: { fr: "Présentez le ticket du Café du Port à Karim.", pt: "Apresente o recibo do Café du Port ao Karim." },
  },
  {
    when: (s) => s.facts.includes("k_left") && !s.facts.includes("k_odile_sent"),
    vague: { fr: "Si Karim était au café, qui gardait la réception ?", pt: "Se o Karim estava no café, quem cuidava da recepção?" },
    precise: { fr: "Demandez à Karim : « Qui surveillait la réception ? »", pt: "Pergunte ao Karim: \"Qui surveillait la réception ?\"" },
  },
  {
    when: (s) => !s.clues.includes("lunettes"),
    vague: { fr: "Quelqu'un a oublié quelque chose dehors, sous la pluie.", pt: "Alguém esqueceu algo lá fora, na chuva." },
    precise: { fr: "Examinez le banc du jardin.", pt: "Examine o banco do jardim." },
  },
  {
    when: (s) => s.clues.includes("lunettes") && !s.facts.includes("l_garden"),
    vague: { fr: "« R.L. »… À qui sont ces lunettes ? Et que faisaient-elles dehors ?", pt: "\"R.L.\"… De quem são esses óculos? E o que faziam lá fora?" },
    precise: { fr: "Présentez les lunettes à Monsieur Lambert.", pt: "Apresente os óculos ao Sr. Lambert." },
  },
  {
    when: (s) => s.facts.includes("l_garden") && !s.facts.includes("l_light"),
    vague: { fr: "Lambert était dans le jardin à 23 h 15. Il a peut-être vu quelque chose.", pt: "Lambert estava no jardim às 23h15. Talvez tenha visto algo." },
    precise: { fr: "Demandez à Lambert : « Vous avez vu quelque chose dans le jardin ? »", pt: "Pergunte ao Lambert: \"Vous avez vu quelque chose dans le jardin ?\"" },
  },
  {
    when: (s) => s.facts.includes("l_light") && !s.clues.includes("boite"),
    vague: { fr: "La lumière allait vers le fond du jardin…", pt: "A luz ia para o fundo do jardim…" },
    precise: { fr: "Examinez la cabane du jardin.", pt: "Examine a casinha do jardim." },
  },
  {
    when: (s) => s.facts.includes("k_odile_sent") && !s.facts.includes("o_admits"),
    vague: { fr: "Odile dit qu'elle dormait. Karim dit autre chose.", pt: "Odile diz que estava dormindo. Karim diz outra coisa." },
    precise: { fr: "Présentez à Odile le témoignage de Karim (22 h 50).", pt: "Apresente à Odile o depoimento do Karim (22h50)." },
  },
  {
    when: (s) => !s.clues.includes("photo") && !s.clues.includes("lettre"),
    vague: { fr: "Pourquoi quelqu'un voudrait-il garder la boîte ici ?", pt: "Por que alguém iria querer manter a caixa aqui?" },
    precise: { fr: "Regardez le piano du salon et le casier de la réception.", pt: "Olhe o piano do salão e o escaninho da recepção." },
  },
];

const READY: Bilingual = {
  fr: "Vous avez de quoi conclure. Choisissez un suspect et trois preuves : un mensonge, un lien avec la cachette, une raison.",
  pt: "Você já pode concluir. Escolha um suspeito e três provas: uma mentira, uma ligação com o esconderijo, um motivo.",
};

export function hint(s: GameState, precise: boolean): { state: GameState; hint: Hint } {
  const step = HINTS.find((h) => h.when(s));
  const next = clone(s);
  next.hintsUsed += 1;
  if (!step) return { state: next, hint: { text: READY, precision: "precise" } };
  return { state: next, hint: { text: precise ? step.precise : step.vague, precision: precise ? "precise" : "vague" } };
}

const GENERIC_SUGGESTIONS: Record<Level, Suggestion[]> = {
  A2: [
    { fr: "Qu'est-ce qui s'est passé ?", pt: "O que aconteceu?" },
    { fr: "Regardez ça. Qu'est-ce que vous en pensez ?", pt: "Olhe isto. O que você acha? (use \"Apresentar\")" },
  ],
  B1: [
    { fr: "Pouvez-vous me raconter ce qui s'est passé hier soir ?", pt: "Pode me contar o que aconteceu ontem à noite?" },
    { fr: "J'aimerais vous montrer quelque chose. Qu'en pensez-vous ?", pt: "Gostaria de te mostrar algo. O que acha? (use \"Apresentar\")" },
  ],
};

/** Formulations de questions utiles maintenant, sans révéler les réponses. */
export function suggestions(def: CaseDefinition, s: GameState, character: CharacterId): Suggestion[] {
  const lvl = s.level;
  const out = allowedFacts(def, s, character)
    .filter((f) => f.ask && !s.facts.includes(f.id))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 3)
    .map((f) => ({ fr: f.ask![lvl], pt: lvl === "A2" ? (f.ask!.ptA2 ?? f.ask!.pt) : f.ask!.pt }));
  if (out.length < 2) out.push(...GENERIC_SUGGESTIONS[lvl].slice(0, 3 - out.length));
  return out;
}
