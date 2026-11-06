import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { GameError } from "./engine/engine";
import { InvalidTokenError } from "./state/token";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function errorResponse(error: unknown) {
  if (error instanceof InvalidTokenError) return json({ error: "invalid_token", message: error.message }, 409);
  if (error instanceof GameError) return json({ error: error.code, message: error.message }, 400);
  if (error instanceof ZodError) return json({ error: "bad_request", message: "Requête invalide." }, 400);
  if (error instanceof SyntaxError) return json({ error: "bad_request", message: "JSON invalide." }, 400);
  console.error(error);
  return json({ error: "server_error", message: "Erreur interne." }, 500);
}

// Limiteur best-effort en mémoire (par instance serverless). Pour une vraie
// protection, activer une règle de rate limiting dans le pare-feu Vercel.
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimited(req: Request, limit = 60, windowMs = 60_000): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) buckets.clear();
    return false;
  }
  b.count += 1;
  return b.count > limit;
}
