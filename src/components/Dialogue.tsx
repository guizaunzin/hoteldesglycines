"use client";

import { useEffect, useRef, useState } from "react";
import { CHARACTERS } from "@/shared/publicCase";
import type { AppConfig, CharacterId, GameView, Level, Suggestion } from "@/shared/types";
import type { Prefs, TranscriptEntry } from "@/client/storage";
import {
  browserSttSupported,
  recordingSupported,
  startBrowserStt,
  startServerStt,
  type Listening,
} from "@/client/voice";
import { Portrait } from "./art/Portraits";
import { WordText } from "./ui";

interface Props {
  character: CharacterId;
  entries: TranscriptEntry[];
  level: Level;
  view: GameView;
  busy: boolean;
  config: AppConfig | null;
  prefs: Prefs;
  speakingId: string | null;
  onSend: (text: string) => void;
  onOpenPresent: () => void;
  onSuggest: () => Promise<Suggestion[]>;
  onSpeak: (entry: TranscriptEntry, slow: boolean) => void;
  onClose: () => void;
  onNeedConsent: () => Promise<boolean>;
  itemLabel: (id: string) => string;
}

type MicState = "idle" | "listening" | "processing";

export function Dialogue(props: Props) {
  const { character, entries, level, busy } = props;
  const c = CHARACTERS[character];
  const [text, setText] = useState("");
  const [mic, setMic] = useState<MicState>("idle");
  const [micError, setMicError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [openPt, setOpenPt] = useState<Record<string, boolean>>({});
  const listening = useRef<Listening | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const useServer =
    props.prefs.voiceEngine === "server" || (props.prefs.voiceEngine === "auto" && !!props.config?.serverStt);
  const micAvailable = useServer ? recordingSupported() && !!props.config?.serverStt : browserSttSupported();

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [entries.length, busy]);

  useEffect(() => {
    setSuggestions(null);
    setText("");
    return () => listening.current?.cancel();
  }, [character]);

  function submit(value = text) {
    const v = value.trim();
    if (!v || busy) return;
    props.onSend(v);
    setText("");
    setSuggestions(null);
  }

  async function toggleMic() {
    setMicError(null);
    if (mic === "listening") {
      listening.current?.stop();
      if (useServer) setMic("processing");
      return;
    }
    if (!(await props.onNeedConsent())) return;
    setMic("listening");
    setText("");
    const cb = {
      onInterim: (t: string) => setText(t),
      onFinal: (t: string) => {
        setText(t);
        if (props.prefs.autoSend) submit(t);
        else inputRef.current?.focus();
      },
      onError: (m: string) => setMicError(m),
      onEnd: () => setMic("idle"),
    };
    listening.current = useServer ? await startServerStt(cb) : startBrowserStt(cb);
  }

  async function askSuggestions() {
    if (suggestions) return setSuggestions(null);
    setSuggestions(await props.onSuggest());
  }

  const empty = entries.length === 0;

  return (
    <section className="dialogue" aria-label={`Conversa com ${c.name}`}>
      <header className="dialogue-head">
        <Portrait character={character} size={64} mood={busy ? "talking" : "neutral"} />
        <div className="dialogue-id">
          <h2>{c.name}</h2>
          <p className="muted">
            <span lang="fr">{c.role.fr}</span> · <span lang="pt-BR">{c.role.pt}</span>
          </p>
        </div>
        <button className="icon-btn" onClick={props.onClose} aria-label="Fechar conversa">
          ✕
        </button>
      </header>

      <div className="dialogue-log" ref={logRef} aria-live="polite" aria-relevant="additions">
        {empty && (
          <div className="dialogue-empty">
            <p lang="fr" className="bio">
              {c.bio.fr}
            </p>
            <p lang="pt-BR" className="muted">
              {c.bio.pt}
            </p>
            <p className="muted">
              Fale ou escreva em francês. Comece com um <strong lang="fr">« Bonjour ! »</strong>
            </p>
          </div>
        )}
        {entries.map((e) =>
          e.who === "player" ? (
            <div key={e.id} className="bubble player">
              {e.presented ? (
                <p>
                  <span className="present-tag">📎 Présenté</span> {props.itemLabel(e.presented)}
                </p>
              ) : (
                <p lang="fr">{e.fr}</p>
              )}
            </div>
          ) : (
            <div key={e.id} className={`bubble npc ${props.speakingId === e.id ? "speaking" : ""}`}>
              <p>
                <WordText text={e.fr} level={level} />
              </p>
              {openPt[e.id] && e.pt && (
                <p className="pt" lang="pt-BR">
                  {e.pt}
                </p>
              )}
              <div className="bubble-tools">
                <button onClick={() => props.onSpeak(e, false)} aria-label="Ouvir de novo">
                  🔊 <span>Répéter</span>
                </button>
                <button onClick={() => props.onSpeak(e, true)} aria-label="Ouvir mais devagar">
                  🐢 <span>Lentement</span>
                </button>
                {e.pt && (
                  <button onClick={() => setOpenPt((o) => ({ ...o, [e.id]: !o[e.id] }))} aria-expanded={!!openPt[e.id]}>
                    🇧🇷 <span>{openPt[e.id] ? "Ocultar" : "Traduzir"}</span>
                  </button>
                )}
                {e.source === "fallback" && <span className="tag-muted" title="A IA não respondeu; resposta pré-escrita">reserva</span>}
              </div>
            </div>
          ),
        )}
        {busy && (
          <div className="bubble npc typing" aria-label={`${c.name} está respondendo`}>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      {suggestions && (
        <div className="suggestions" aria-label="Sugestões de perguntas">
          <p className="muted small">Diga em voz alta, ou toque para usar:</p>
          {suggestions.map((s) => (
            <button
              key={s.fr}
              className="suggestion"
              onClick={() => {
                setText(s.fr);
                inputRef.current?.focus();
              }}
            >
              <span lang="fr">{s.fr}</span>
              <span lang="pt-BR" className="muted small">
                {s.pt}
              </span>
            </button>
          ))}
        </div>
      )}

      {micError && (
        <p className="mic-error" role="alert">
          {micError}
        </p>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <button
          type="button"
          className={`mic ${mic}`}
          onClick={toggleMic}
          disabled={!micAvailable || busy || mic === "processing"}
          aria-pressed={mic === "listening"}
          aria-label={mic === "listening" ? "Parar e enviar" : "Falar em francês"}
          title={micAvailable ? "Falar em francês" : "Reconhecimento de voz indisponível neste navegador — use o texto"}
        >
          {mic === "listening" ? <span className="mic-wave" aria-hidden="true" /> : mic === "processing" ? "…" : "🎙"}
        </button>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mic === "listening" ? "Je vous écoute…" : "Écrivez en français…"}
          lang="fr"
          maxLength={280}
          aria-label="Sua mensagem em francês"
          autoComplete="off"
          spellCheck
        />
        <button type="submit" className="btn primary" disabled={!text.trim() || busy}>
          Envoyer
        </button>
      </form>
      <div className="dialogue-actions">
        <button className="btn ghost" onClick={props.onOpenPresent} disabled={busy}>
          📎 Présenter <span className="muted small">apresentar prova</span>
        </button>
        <button className="btn ghost" onClick={askSuggestions} disabled={busy} aria-expanded={!!suggestions}>
          💬 Comment demander ? <span className="muted small">sugestões</span>
        </button>
      </div>
    </section>
  );
}
