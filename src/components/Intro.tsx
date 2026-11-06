"use client";

import { useState } from "react";
import { INTRO } from "@/shared/publicCase";
import type { AppConfig, Level } from "@/shared/types";
import { GlycineMark, Modal } from "./ui";

export function Intro({
  config,
  onStart,
  busy,
  error,
}: {
  config: AppConfig | null;
  onStart: (level: Level) => void;
  busy: boolean;
  error: string | null;
}) {
  const [level, setLevel] = useState<Level>("A2");
  const [pt, setPt] = useState(false);
  return (
    <Modal labelledBy="intro-title" className="intro">
      <div className="intro-head">
        <GlycineMark size={44} />
        <div>
          <p className="eyebrow">Une enquête en français · A2–B1</p>
          <h1 id="intro-title">Le Rossignol a disparu</h1>
        </div>
      </div>
      <div className="intro-story">
        {INTRO[level].map((p, i) => (
          <div key={i}>
            <p lang="fr">{p.fr}</p>
            {pt && (
              <p lang="pt-BR" className="pt">
                {p.pt}
              </p>
            )}
          </div>
        ))}
        <button className="link-btn" onClick={() => setPt((v) => !v)}>
          {pt ? "ocultar tradução" : "traduzir para o português"}
        </button>
      </div>

      <fieldset className="levels">
        <legend>Seu nível</legend>
        {(
          [
            ["A2", "Frases curtas, presente e passé composé, fala mais lenta."],
            ["B1", "Falas mais longas e naturais, imparfait, mais nuances."],
          ] as [Level, string][]
        ).map(([l, d]) => (
          <label key={l} className={`level ${level === l ? "on" : ""}`}>
            <input type="radio" name="level" value={l} checked={level === l} onChange={() => setLevel(l)} />
            <strong>{l}</strong>
            <span className="muted small">{d}</span>
          </label>
        ))}
      </fieldset>

      <ul className="howto">
        <li>🔎 Examine os lugares marcados com ✦.</li>
        <li>🎙 Converse por voz ou texto, em francês, com os três personagens.</li>
        <li>📎 Apresente provas para revelar contradições.</li>
        <li>⚖️ Quando tiver certeza, conclua com um suspeito e três provas.</li>
      </ul>

      {config?.dialogue === "demo" && (
        <p className="demo-note">
          <strong>Modo demonstração:</strong> sem chave de IA configurada, os personagens usam falas pré-escritas e entendem
          perguntas simples. A investigação completa funciona do mesmo jeito.
        </p>
      )}
      {error && (
        <p role="alert" className="mic-error">
          {error}
        </p>
      )}
      <button className="btn primary big" onClick={() => onStart(level)} disabled={busy}>
        {busy ? "…" : "Commencer l'enquête"}
      </button>
    </Modal>
  );
}
