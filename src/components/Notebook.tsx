"use client";

import { useState } from "react";
import { CHARACTERS } from "@/shared/publicCase";
import type { Bilingual, GameView, Hint } from "@/shared/types";
import { Bi } from "./ui";

type Tab = "objectives" | "clues" | "testimonies" | "timeline";

export function Notebook({
  view,
  onHint,
  initialTab = "objectives",
}: {
  view: GameView;
  onHint: (precise: boolean) => Promise<Hint | null>;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [hint, setHint] = useState<Hint | null>(null);
  const [showPt, setShowPt] = useState(false);

  const timeline = [...view.testimonies]
    .filter((t) => t.time)
    .sort((a, b) => sortTime(a.time!) - sortTime(b.time!));

  const tabs: [Tab, string, number?][] = [
    ["objectives", "Objectifs"],
    ["clues", "Pièces", view.clues.length],
    ["testimonies", "Témoignages", view.testimonies.length],
    ["timeline", "Chronologie"],
  ];

  return (
    <div className="notebook">
      <div className="tabs" role="tablist" aria-label="Carnet">
        {tabs.map(([id, label, n]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
            {n !== undefined && <span className="count">{n}</span>}
          </button>
        ))}
        <label className="pt-toggle">
          <input type="checkbox" checked={showPt} onChange={(e) => setShowPt(e.target.checked)} /> PT
        </label>
      </div>

      {tab === "objectives" && (
        <div role="tabpanel" className="nb-panel">
          <ul className="objectives">
            {view.objectives.map((o) => (
              <li key={o.id} className={o.done ? "done" : ""}>
                <span className="check" aria-hidden="true">
                  {o.done ? "✓" : "○"}
                </span>
                <div>
                  <Bi text={o.text} open={showPt} />
                  {o.progress && !o.done && <span className="muted small">{o.progress}</span>}
                </div>
              </li>
            ))}
          </ul>
          <div className="hint-box">
            <p className="muted small">Travou na investigação?</p>
            <div className="row">
              <button className="btn ghost" onClick={async () => setHint(await onHint(false))}>
                💡 Une piste
              </button>
              {hint && (
                <button className="btn ghost" onClick={async () => setHint(await onHint(true))}>
                  🔎 Plus précis
                </button>
              )}
            </div>
            {hint && (
              <div className="hint" role="status">
                <Bi text={hint.text} open />
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "clues" && (
        <div role="tabpanel" className="nb-panel">
          {view.clues.length === 0 && <p className="muted">Nenhuma prova ainda. Examine os lugares (✦).</p>}
          <ul className="cards">
            {view.clues.map((c) => (
              <li key={c.id} className="card clue">
                <span className="clue-icon" aria-hidden="true">
                  {c.icon}
                </span>
                <div>
                  <h3 lang="fr">{c.title.fr}</h3>
                  <Bi text={c.text} open={showPt || undefined} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "testimonies" && (
        <div role="tabpanel" className="nb-panel">
          {view.testimonies.length === 0 && <p className="muted">Converse com os personagens para reunir depoimentos.</p>}
          {(["karim", "lambert", "odile"] as const).map((who) => {
            const list = view.testimonies.filter((t) => t.character === who);
            if (!list.length) return null;
            return (
              <section key={who} className="testimony-group">
                <h3 style={{ color: CHARACTERS[who].color }}>{CHARACTERS[who].name}</h3>
                <ul className="cards">
                  {list.map((t) => (
                    <li key={t.id} className={`card testimony ${t.contradicted ? "contradicted" : ""}`}>
                      {t.contradicted && <span className="stamp">Contredit</span>}
                      {t.time && <span className="time">{t.time.replace(":", " h ")}</span>}
                      <Bi text={t.text} open={showPt || undefined} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {tab === "timeline" && (
        <div role="tabpanel" className="nb-panel">
          {timeline.length === 0 && <p className="muted">As horas mencionadas nos depoimentos aparecerão aqui.</p>}
          <ol className="timeline">
            {timeline.map((t) => (
              <li key={t.id} className={t.contradicted ? "contradicted" : ""}>
                <span className="time">{t.time!.replace(":", " h ")}</span>
                <span className="dot" style={{ background: CHARACTERS[t.character].color }} />
                <div>
                  <strong>{CHARACTERS[t.character].short}</strong>
                  {t.contradicted && <span className="stamp small">Contredit</span>}
                  <Bi text={t.text as Bilingual} open={showPt} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/** La nuit commence le soir : 07:00 vient après 23:45. */
function sortTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h < 12 ? h + 24 : h) * 60 + m;
}
