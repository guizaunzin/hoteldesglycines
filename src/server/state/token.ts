import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { GameState } from "../engine/types";

// L'état de la partie est chiffré (AES-256-GCM) puis confié au navigateur.
// Avantages : pas de base de données, aucun secret lisible côté client,
// et toute modification du jeton est détectée (authentification GCM).

const DEV_FALLBACK = "dev-only-insecure-secret-change-me";

export function stateSecretConfigured(): boolean {
  return !!process.env.GAME_STATE_SECRET && process.env.GAME_STATE_SECRET.length >= 16;
}

let warned = false;
function key(): Buffer {
  const secret = process.env.GAME_STATE_SECRET;
  if (!secret || secret.length < 16) {
    if (!warned) {
      console.warn("[hotel-glycines] GAME_STATE_SECRET absent ou trop court : clé de développement utilisée.");
      warned = true;
    }
    return createHash("sha256").update(DEV_FALLBACK).digest();
  }
  return createHash("sha256").update(secret).digest();
}

const charId = z.enum(["odile", "karim", "lambert"]);
const stateSchema = z.object({
  v: z.literal(1),
  caseId: z.string(),
  level: z.enum(["A2", "B1"]),
  clues: z.array(z.string()).max(50),
  facts: z.array(z.string()).max(200),
  flags: z.array(z.string()).max(50),
  visited: z.array(z.enum(["reception", "salon", "jardin"])).max(3),
  examined: z.array(z.string()).max(50),
  talkedTo: z.array(charId).max(3),
  turns: z.number().int().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  history: z.partialRecord(
    charId,
    z.array(z.object({ player: z.string().max(400), reply: z.string().max(800) })).max(10),
  ),
  ended: z
    .object({ kind: z.enum(["perfect", "solved", "wrong"]), accused: charId })
    .optional(),
  startedAt: z.number(),
});

export function sealState(state: GameState): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(state), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), body.toString("base64url"), tag.toString("base64url")].join(".");
}

export class InvalidTokenError extends Error {}

export function openState(token: string): GameState {
  try {
    const [version, ivB64, bodyB64, tagB64] = token.split(".");
    if (version !== "v1" || !ivB64 || !bodyB64 || !tagB64) throw new Error("format");
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const json = Buffer.concat([decipher.update(Buffer.from(bodyB64, "base64url")), decipher.final()]).toString(
      "utf8",
    );
    return stateSchema.parse(JSON.parse(json)) as GameState;
  } catch {
    throw new InvalidTokenError("Jeton de partie invalide ou modifié.");
  }
}
