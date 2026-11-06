import "server-only";
import type { CharacterId, Improvement, Level, ReplySource, Utterance } from "@/shared/types";
import type { CaseDefinition, Fact, GameState } from "../engine/types";
import type { Plan } from "../engine/engine";

export interface CharacterTurnInput {
  def: CaseDefinition;
  state: GameState;
  character: CharacterId;
  message: string;
  /** Plan déterministe (toujours calculé : sert au mode démo et de repli). */
  plan: Plan;
  /** Faits que le personnage a le droit d'utiliser (calculés par le moteur). */
  allowed: Fact[];
}

export interface CharacterTurnOutput {
  fr: string;
  pt: string;
  /** Faits contenus dans la réplique ; le moteur ne retiendra que ceux autorisés. */
  factIds: string[];
  source: ReplySource;
}

export interface PracticeCheck {
  ok: boolean;
  feedback: string; // portugais
  better?: string;
}

/**
 * Interface remplaçable : un fournisseur d'IA (Claude) ou le mode démonstration.
 * Pour brancher un autre modèle, il suffit d'implémenter cette interface.
 */
export interface DialogueProvider {
  readonly kind: "ai" | "demo";
  readonly model?: string;
  characterTurn(input: CharacterTurnInput): Promise<CharacterTurnOutput>;
  explain(word: string, sentence: string, level: Level): Promise<{ text: string; source: ReplySource } | null>;
  debrief(utterances: Utterance[], level: Level): Promise<Improvement[]>;
  checkPractice(improvement: Improvement, answer: string, level: Level): Promise<PracticeCheck>;
}
