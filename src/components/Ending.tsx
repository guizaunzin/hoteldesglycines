"use client";

import { useState } from "react";
import type { EndingView, Improvement, Level, Utterance } from "@/shared/types";
import { api } from "@/client/api";
import { Bi } from "./ui";

export function Ending({
  ending,
  level,
  utterances,
  onRestart,
}: {
  ending: EndingView;
  level: Level;
  utterances: Utterance[];
  onRestart: () => void;
}) {
  const [pt, setPt] = useState(false);
  const [improvements, setImprovements] = useState<Improvement[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDebrief() {
    setLoading(true);
    setError(null);
    try {
      const r = await api.debrief(utterances, level);
      setImprovements(r.improvements);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ending">
      <div className={`ending-banner ${ending.kind}`}>
        <p className="eyebrow">{ending.kind === "wrong" ? "Fin de l'enquête" : "Affaire classée"}</p>
        <h1 lang="fr">{ending.title.fr}</h1>
        <p lang="pt-BR" className="muted">
          {ending.title.pt}
        </p>
      </div>
      <label className="pt-toggle">
        <input type="checkbox" checked={pt} onChange={(e) => setPt(e.target.checked)} /> mostrar tradução
      </label>
      <div className="story">
        {ending.story.map((p, i) => (
          <Bi key={i} text={p} open={pt} />
        ))}
      </div>
      <h2 className="section-title">Ce qui s&apos;est vraiment passé</h2>
      <ol className="explanation">
        {ending.explanation.map((p, i) => (
          <li key={i}>
            <Bi text={p} open={pt} />
          </li>
        ))}
      </ol>

      <section className="debrief" aria-labelledby="debrief-title">
        <h2 id="debrief-title" className="section-title">
          Votre français <span className="muted small">— seu balanço</span>
        </h2>
        <p className="muted">
          Até três pontos prioritários, com exemplos do que você disse ({utterances.length} frases nesta partida).
        </p>
        {!improvements && (
          <button className="btn primary" onClick={loadDebrief} disabled={loading}>
            {loading ? "Analisando…" : "Ver meu balanço"}
          </button>
        )}
        {error && <p role="alert">{error}</p>}
        {improvements && (
          <ol className="improvements">
            {improvements.map((imp) => (
              <ImprovementCard key={imp.id} imp={imp} level={level} />
            ))}
          </ol>
        )}
      </section>

      <div className="ending-actions">
        <button className="btn primary" onClick={onRestart}>
          Rejouer l&apos;enquête
        </button>
      </div>
    </div>
  );
}

function ImprovementCard({ imp, level }: { imp: Improvement; level: Level }) {
  const [answer, setAnswer] = useState("");
  const [check, setCheck] = useState<{ ok: boolean; feedback: string; better?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [showModel, setShowModel] = useState(false);

  async function verify() {
    setBusy(true);
    try {
      setCheck((await api.practice(imp, answer, level)).check);
    } catch (e) {
      setCheck({ ok: false, feedback: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="card improvement">
      <h3>
        <span lang="fr">{imp.title.fr}</span> <span className="muted small">— {imp.title.pt}</span>
      </h3>
      <p lang="pt-BR">{imp.explanation}</p>
      {imp.examples.length > 0 && (
        <ul className="examples">
          {imp.examples.map((ex, i) => (
            <li key={i}>
              <span className="before" lang="fr">
                {ex.original}
              </span>
              <span aria-hidden="true">→</span>
              <span className="after" lang="fr">
                {ex.better}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="practice">
        <p>
          <strong>Pratique :</strong> <span lang="pt-BR">{imp.practice.instruction}</span>
        </p>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            if (answer.trim()) verify();
          }}
        >
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            lang="fr"
            placeholder="Votre phrase…"
            aria-label="Sua frase de prática"
            maxLength={300}
          />
          <button className="btn primary" disabled={busy || !answer.trim()}>
            {busy ? "…" : "Vérifier"}
          </button>
        </form>
        {check && (
          <p className={check.ok ? "ok" : "ko"} role="status">
            {check.ok ? "✓ " : "↻ "}
            {check.feedback}
            {check.better && check.better !== answer && (
              <>
                {" "}
                <span lang="fr" className="better">
                  « {check.better} »
                </span>
              </>
            )}
          </p>
        )}
        <button className="link-btn" onClick={() => setShowModel((s) => !s)}>
          {showModel ? "ocultar modelo" : "ver um modelo"}
        </button>
        {showModel && (
          <p lang="fr" className="model">
            {imp.practice.model}
          </p>
        )}
      </div>
    </li>
  );
}
