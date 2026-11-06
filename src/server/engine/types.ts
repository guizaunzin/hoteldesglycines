import type { Bilingual, CharacterId, Level, SceneId } from "@/shared/types";

/** Identifiants de sujets reconnus dans les questions du joueur. */
export type TopicId =
  | "greet"
  | "self"
  | "box"
  | "lastseen"
  | "night"
  | "noise"
  | "vitrine"
  | "sale"
  | "garden"
  | "shed"
  | "rain"
  | "money"
  | "family"
  | "football"
  | "phone"
  | "about_odile"
  | "about_karim"
  | "about_lambert"
  | "studies"
  | "collection"
  | "why"
  | "who"
  | "discovery"
  | "accuse_direct"
  | "meta"
  | "bye";

/** Condition vérifiée par le code. Toutes les listes doivent être satisfaites. */
export interface Condition {
  clues?: string[];
  facts?: string[];
  flags?: string[];
  notFlags?: string[];
  /** Au moins un de ces faits. */
  anyFacts?: string[];
}

/** Une réplique écrite pour chaque niveau, avec sa traduction. */
export interface LevelLine {
  A2: string;
  B1: string;
  pt: string;
}

/**
 * Un fait : une information qu'un personnage peut dire.
 * Le personnage ne peut le dire que si `requires` est satisfait.
 */
export interface Fact {
  id: string;
  character: CharacterId;
  topics: TopicId[];
  requires?: Condition;
  line: LevelLine;
  /** Entrée du carnet. Sans `note`, c'est de la conversation sans valeur de preuve. */
  note?: Bilingual;
  time?: string;
  /** Plus la priorité est haute, plus le fait est choisi en premier pour un sujet. */
  priority?: number;
  /** Fait mensonger : contredit quand un des faits listés est révélé. */
  contradictedBy?: string[];
  sets?: string[];
  /** Question modèle proposée par l'aide « Comment demander ? » (pt = traduction de B1). */
  ask?: LevelLine & { ptA2?: string };
}

/** Réaction déterministe quand le joueur présente une pièce ou un témoignage. */
export interface Reaction {
  character: CharacterId;
  /** Id de piste ou de témoignage présenté. */
  item: string;
  requires?: Condition;
  line: LevelLine;
  reveals?: string[];
  sets?: string[];
}

export interface Clue {
  id: string;
  scene: SceneId;
  hotspot: string;
  title: Bilingual;
  text: LevelLine;
  icon: string;
}

/** Résultat d'examen d'un point d'intérêt : la première entrée dont la condition est remplie gagne. */
export interface ExamineRule {
  hotspot: string;
  requires?: Condition;
  text: LevelLine;
  clue?: string;
  sets?: string[];
}

export type EvidenceCategory = "lie" | "link" | "motive";

export interface Persona {
  character: CharacterId;
  /** Description publique et style de parole (envoyés à l'IA). */
  description: string;
  style: string;
  /** Position publique du personnage (ce qu'il affirme), sans secret. */
  stance: string;
  /** Répliques de repli quand la question n'est pas comprise. */
  clarify: LevelLine[];
  /** Quand on lui demande de « révéler la solution » ou d'ignorer les règles. */
  meta: LevelLine;
  /** Quand on lui pose une question hors sujet. */
  offtopic: LevelLine;
  /** Quand le joueur ne parle pas français. */
  notFrench: LevelLine;
  /** Quand on présente une pièce sans réaction prévue. */
  genericPresent: LevelLine;
  greeting: LevelLine;
}

export interface CaseDefinition {
  id: string;
  /** Vérité de l'affaire (jamais envoyée au navigateur ni à l'IA avant la fin). */
  truth: {
    culprit: CharacterId;
    summary: string;
    timeline: { time: string; event: string }[];
  };
  clues: Clue[];
  examine: ExamineRule[];
  facts: Fact[];
  reactions: Reaction[];
  personas: Record<CharacterId, Persona>;
  /** Pièces et témoignages qui comptent comme preuve contre le coupable, par catégorie. */
  evidence: Record<string, { category: EvidenceCategory; strength: "strong" | "weak" }>;
  endings: {
    perfect: { title: Bilingual; story: LevelLine[] };
    solved: { title: Bilingual; story: LevelLine[] };
    wrong: Record<CharacterId, { title: Bilingual; story: LevelLine[] }>;
    explanation: Bilingual[];
  };
  rebuttals: {
    insufficient: LevelLine;
    missing: Record<EvidenceCategory, Bilingual>;
  };
}

export interface HistoryTurn {
  player: string;
  reply: string;
}

/** État complet d'une partie (chiffré dans le jeton côté navigateur). */
export interface GameState {
  v: 1;
  caseId: string;
  level: Level;
  clues: string[];
  facts: string[];
  flags: string[];
  visited: SceneId[];
  examined: string[];
  talkedTo: CharacterId[];
  turns: number;
  hintsUsed: number;
  history: Partial<Record<CharacterId, HistoryTurn[]>>;
  ended?: { kind: "perfect" | "solved" | "wrong"; accused: CharacterId };
  startedAt: number;
}
