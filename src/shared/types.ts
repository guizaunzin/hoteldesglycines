// Types partagés entre le serveur et le navigateur.
// Rien ici ne doit contenir d'information secrète sur l'affaire.

export type Level = "A2" | "B1";
export type CharacterId = "odile" | "karim" | "lambert";
export type SceneId = "reception" | "salon" | "jardin";

/** Texte en français + traduction portugaise (affichée seulement à la demande). */
export interface Bilingual {
  fr: string;
  pt: string;
}

export interface ClueCard {
  id: string;
  scene: SceneId;
  title: Bilingual;
  text: Bilingual;
  icon: string;
}

export interface TestimonyCard {
  id: string;
  character: CharacterId;
  text: Bilingual;
  /** Heure concernée, pour la chronologie (ex. "23:15"). */
  time?: string;
  /** Vrai quand une version plus fiable l'a contredit. */
  contradicted?: boolean;
}

export interface Objective {
  id: string;
  text: Bilingual;
  done: boolean;
  progress?: string;
}

export interface EndingView {
  kind: "perfect" | "solved" | "wrong";
  title: Bilingual;
  /** Paragraphes du dénouement. */
  story: Bilingual[];
  /** Explication point par point de la vérité. */
  explanation: Bilingual[];
}

export interface GameView {
  caseId: string;
  level: Level;
  clues: ClueCard[];
  testimonies: TestimonyCard[];
  objectives: Objective[];
  talkedTo: CharacterId[];
  visited: SceneId[];
  /** Points d'intérêt déjà examinés (pour l'affichage). */
  examined: string[];
  turns: number;
  ending?: EndingView;
}

export interface CharacterLine {
  fr: string;
  pt: string;
}

export type ReplySource = "ai" | "script" | "fallback";

export interface TalkReply {
  character: CharacterId;
  line: CharacterLine;
  source: ReplySource;
  /** Témoignages nouvellement ajoutés au carnet. */
  newTestimonies: string[];
  newClues: string[];
}

export interface ExamineResult {
  text: Bilingual;
  newClue?: string;
}

export interface Suggestion {
  fr: string;
  pt: string;
}

export interface Hint {
  text: Bilingual;
  /** "vague" puis "précis" au deuxième clic. */
  precision: "vague" | "precise";
}

export interface AccuseResult {
  accepted: boolean;
  /** Quand l'accusation est refusée faute de preuves. */
  rebuttal?: Bilingual;
  missing?: Bilingual[];
}

export interface AppConfig {
  dialogue: "ai" | "demo";
  model?: string;
  serverStt: boolean;
  serverTts: boolean;
  stateSecretConfigured: boolean;
}

export interface Improvement {
  /** Identifiant de la règle (sert à la vérification en mode démo). */
  id: string;
  title: Bilingual;
  explanation: string; // en portugais
  examples: { original: string; better: string }[];
  practice: {
    instruction: string; // en portugais
    model: string; // phrase modèle en français
  };
}

export interface Utterance {
  character: CharacterId;
  text: string;
  at: number;
}
