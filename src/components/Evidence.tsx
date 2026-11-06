"use client";

import { useState } from "react";
import { CHARACTERS } from "@/shared/publicCase";
import type { AccuseResult, CharacterId, GameView } from "@/shared/types";
import { Portrait } from "./art/Portraits";
import { Modal } from "./ui";

export function itemLabelFor(view: GameView | null, id: string): string {
  if (!view) return id;
  const clue = view.clues.find((c) => c.id === id);
  if (clue) return `${clue.icon} ${clue.title.fr}`;
  const t = view.testimonies.find((x) => x.id === id);
  if (t) return `🗣 ${t.text.fr}`;
  return id;
}

function ItemList({
  view,
  selected,
  onToggle,
  max,
}: {
  view: GameView;
  selected: string[];
  onToggle: (id: string) => void;
  max: number;
}) {
  const full = selected.length >= max;
  return (
    <div className="item-list">
      <h3 className="small-title">Pièces</h3>
      {view.clues.length === 0 && <p className="muted small">Nenhuma prova ainda.</p>}
      <ul>
        {view.clues.map((c) => {
          const on = selected.includes(c.id);
          return (
            <li key={c.id}>
              <button
                className={`item ${on ? "on" : ""}`}
                onClick={() => onToggle(c.id)}
                disabled={!on && full && max > 1}
                aria-pressed={on}
                data-item={c.id}
              >
                <span aria-hidden="true">{c.icon}</span>
                <span lang="fr">{c.title.fr}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <h3 className="small-title">Témoignages</h3>
      {view.testimonies.length === 0 && <p className="muted small">Nenhum depoimento ainda.</p>}
      <ul>
        {view.testimonies.map((t) => {
          const on = selected.includes(t.id);
          return (
            <li key={t.id}>
              <button
                className={`item testimony-item ${on ? "on" : ""}`}
                onClick={() => onToggle(t.id)}
                disabled={!on && full && max > 1}
                aria-pressed={on}
                data-item={t.id}
              >
                <span className="who" style={{ background: CHARACTERS[t.character].color }}>
                  {CHARACTERS[t.character].short}
                </span>
                <span lang="fr">{t.text.fr}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PresentPicker({
  view,
  character,
  onPick,
  onClose,
}: {
  view: GameView;
  character: CharacterId;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`Présenter à ${CHARACTERS[character].short}`} onClose={onClose} labelledBy="present-title">
      <p className="muted small">Escolha uma prova ou um depoimento para mostrar. As reações podem revelar contradições.</p>
      <ItemList view={view} selected={[]} max={1} onToggle={(id) => onPick(id)} />
    </Modal>
  );
}

export function AccuseDialog({
  view,
  onAccuse,
  onClose,
}: {
  view: GameView;
  onAccuse: (suspect: CharacterId, evidence: string[]) => Promise<AccuseResult | null>;
  onClose: () => void;
}) {
  const [suspect, setSuspect] = useState<CharacterId | null>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<AccuseResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!suspect) return;
    setBusy(true);
    const r = await onAccuse(suspect, evidence);
    setBusy(false);
    setConfirm(false);
    if (r && !r.accepted) setResult(r);
  }

  return (
    <Modal title="Conclure l'enquête" onClose={onClose} wide labelledBy="accuse-title" className="accuse">
      <p className="muted">
        Quem escondeu o Rossignol? Escolha um suspeito e até <strong>três provas</strong>. Um bom dossiê mostra: uma{" "}
        <em>mentira</em>, uma <em>ligação com o esconderijo</em> e um <em>motivo</em>.
      </p>
      <h3 className="small-title">1. Qui ?</h3>
      <div className="suspects" role="radiogroup" aria-label="Suspeito">
        {(["karim", "lambert", "odile"] as CharacterId[]).map((id) => (
          <button
            key={id}
            role="radio"
            aria-checked={suspect === id}
            className={`suspect ${suspect === id ? "on" : ""}`}
            onClick={() => setSuspect(id)}
            data-suspect={id}
          >
            <Portrait character={id} size={72} />
            <span>{CHARACTERS[id].name}</span>
          </button>
        ))}
      </div>
      <h3 className="small-title">2. Vos preuves ({evidence.length}/3)</h3>
      <ItemList
        view={view}
        selected={evidence}
        max={3}
        onToggle={(id) =>
          setEvidence((ev) => (ev.includes(id) ? ev.filter((x) => x !== id) : ev.length < 3 ? [...ev, id] : ev))
        }
      />
      {result && !result.accepted && (
        <div className="rebuttal" role="alert">
          <p lang="fr">{result.rebuttal?.fr}</p>
          <p lang="pt-BR" className="pt">
            {result.rebuttal?.pt}
          </p>
          <ul>
            {result.missing?.map((m) => (
              <li key={m.fr}>
                <span lang="fr">{m.fr}</span> <span className="muted small">— {m.pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="modal-foot">
        {!confirm ? (
          <button className="btn primary" disabled={!suspect || evidence.length === 0} onClick={() => setConfirm(true)}>
            Accuser {suspect ? CHARACTERS[suspect].short : "…"}
          </button>
        ) : (
          <div className="confirm">
            <p>
              Tem certeza? Uma acusação errada <strong>encerra a partida</strong>.
            </p>
            <button className="btn ghost" onClick={() => setConfirm(false)}>
              Voltar
            </button>
            <button className="btn danger" onClick={submit} disabled={busy}>
              {busy ? "…" : "Oui, j'accuse !"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
