import { describe, expect, it, vi } from "vitest";
import { GLYCINES as def } from "@/server/case/glycines";
import { allowedFacts, newGame, planReply } from "@/server/engine/engine";
import { createClaudeProvider, type ClaudeClient } from "@/server/dialogue/claude";

// Client factice : on vérifie la logique de sécurité sans appeler l'API réelle.
function fakeClient(impl: (params: Record<string, unknown>) => unknown) {
  const create = vi.fn(async (params: Record<string, unknown>) => impl(params));
  return { client: { beta: { messages: { create } } } as unknown as ClaudeClient, create };
}

function reply(json: object, stop_reason = "end_turn") {
  return { stop_reason, content: [{ type: "text", text: JSON.stringify(json) }] };
}

function input(message: string) {
  const state = newGame(def, "A2");
  return {
    def,
    state,
    character: "karim" as const,
    message,
    plan: planReply(def, state, "karim", message),
    allowed: allowedFacts(def, state, "karim"),
  };
}

describe("fournisseur Claude (client simulé)", () => {
  it("ne retient que les faits autorisés", async () => {
    const { client, create } = fakeClient(() =>
      reply({ reply: "J'étais à la réception.", translation_pt: "Eu estava na recepção.", facts_used: ["k_night_lie", "k_odile_sent", "inventé"], understood: true }),
    );
    const p = createClaudeProvider("test", "claude-opus-5-5", client);
    const out = await p.characterTurn(input("Où étiez-vous hier soir ?"));
    expect(out.source).toBe("ai");
    expect(out.factIds).toEqual(["k_night_lie"]);
    const params = create.mock.calls[0][0] as { system: string; model: string; fallbacks: string };
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.fallbacks).toBe("default");
    expect(params.system).not.toContain("Café du Port");
    expect(params.system).not.toContain(def.truth.summary);
  });

  it("une réplique qui invente un aveu est remplacée par la réplique écrite", async () => {
    const { client } = fakeClient(() =>
      reply({ reply: "C'est Odile qui a caché la boîte !", translation_pt: "…", facts_used: [], understood: true }),
    );
    const p = createClaudeProvider("test", undefined, client);
    const out = await p.characterTurn(input("Où étiez-vous hier soir ?"));
    expect(out.source).toBe("fallback");
    expect(out.fr).toMatch(/réception/);
  });

  it("une erreur d'API ou un refus bascule sur le mode écrit", async () => {
    const { client } = fakeClient(() => {
      throw new Error("réseau");
    });
    const out = await createClaudeProvider("test", undefined, client).characterTurn(input("Bonjour"));
    expect(out.source).toBe("fallback");

    const { client: c2 } = fakeClient(() => reply({}, "refusal"));
    const out2 = await createClaudeProvider("test", undefined, c2).characterTurn(input("Bonjour"));
    expect(out2.source).toBe("fallback");
  });

  it("un JSON invalide bascule sur le mode écrit", async () => {
    const { client } = fakeClient(() => ({ stop_reason: "end_turn", content: [{ type: "text", text: "pas du json" }] }));
    const out = await createClaudeProvider("test", undefined, client).characterTurn(input("Bonjour"));
    expect(out.source).toBe("fallback");
  });
});
