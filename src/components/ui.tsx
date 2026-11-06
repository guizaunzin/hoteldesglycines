"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Bilingual, Level } from "@/shared/types";
import { api } from "@/client/api";

export function Modal({
  title,
  onClose,
  children,
  wide,
  labelledBy,
  className = "",
}: {
  title?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
  labelledBy?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        className={`modal ${wide ? "modal-wide" : ""} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={ref}
      >
        {(title || onClose) && (
          <div className="modal-head">
            {title && (
              <h2 id={labelledBy} className="modal-title">
                {title}
              </h2>
            )}
            {onClose && (
              <button className="icon-btn" onClick={onClose} aria-label="Fechar">
                ✕
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/** Texte français avec traduction portugaise affichable à la demande. */
export function Bi({ text, open, className = "" }: { text: Bilingual; open?: boolean; className?: string }) {
  const [show, setShow] = useState(false);
  const visible = open ?? show;
  return (
    <div className={`bi ${className}`}>
      <p lang="fr">{text.fr}</p>
      {visible && (
        <p lang="pt-BR" className="pt">
          {text.pt}
        </p>
      )}
      {open === undefined && (
        <button className="link-btn" onClick={() => setShow((s) => !s)} aria-expanded={show}>
          {show ? "ocultar tradução" : "traduzir"}
        </button>
      )}
    </div>
  );
}

/** Rend un texte français dont chaque mot peut être expliqué. */
export function WordText({ text, level }: { text: string; level: Level }) {
  const [active, setActive] = useState<{ word: string; index: number } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tokens = text.split(/(\s+)/);

  async function explain(word: string, index: number) {
    const clean = word.replace(/^[«"(]+|[»".,!?;:)…]+$/g, "");
    if (!clean) return;
    if (active?.index === index) {
      setActive(null);
      return;
    }
    setActive({ word: clean, index });
    setExplanation(null);
    setLoading(true);
    try {
      const r = await api.explain(clean, text, level);
      setExplanation(r.explanation ?? "Palavra não encontrada no glossário de demonstração.");
    } catch (e) {
      setExplanation((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="word-text" lang="fr">
      {tokens.map((t, i) =>
        /^\s+$/.test(t) || !/[\p{L}]/u.test(t) ? (
          <span key={i}>{t}</span>
        ) : (
          <span key={i} className="word-wrap">
            <button
              type="button"
              className={`word ${active?.index === i ? "active" : ""}`}
              onClick={() => explain(t, i)}
              aria-label={`Explicar « ${t.replace(/[.,!?;:»«]/g, "")} »`}
            >
              {t}
            </button>
            {active?.index === i && (
              <span className="word-pop" role="status" lang="pt-BR">
                <strong lang="fr">{active.word}</strong> — {loading ? "…" : explanation}
              </span>
            )}
          </span>
        ),
      )}
    </span>
  );
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3800);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export function GlycineMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path d="M6 6 C16 4 26 6 34 10" stroke="#9fc28f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((j) => (
        <circle key={j} cx={20 + (j % 2) * 4 - 2} cy={10 + j * 5.5} r={5 - j * 0.8} fill={["#8e7cc3", "#a491d6", "#c9bde8"][j % 3]} />
      ))}
      {[0, 1, 2].map((j) => (
        <circle key={`b${j}`} cx={10 + (j % 2) * 3} cy={10 + j * 5} r={3.5 - j * 0.8} fill={["#a491d6", "#c9bde8", "#8e7cc3"][j % 3]} />
      ))}
    </svg>
  );
}
