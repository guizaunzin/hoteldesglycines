"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHARACTERS, HOTSPOTS, SCENES } from "@/shared/publicCase";
import type {
  AccuseResult,
  AppConfig,
  Bilingual,
  CharacterId,
  GameView,
  Hint,
  Level,
  SceneId,
  TalkReply,
  Utterance,
} from "@/shared/types";
import { api, ApiError } from "@/client/api";
import {
  DEFAULT_PREFS,
  clearGame,
  loadGame,
  loadPrefs,
  saveGame,
  savePrefs,
  type Prefs,
  type TranscriptEntry,
} from "@/client/storage";
import { speakBrowser, speakServer, stopSpeaking, warmUpVoices } from "@/client/voice";
import { SCENE_COMPONENTS } from "./art/Scenes";
import { Portrait } from "./art/Portraits";
import { Dialogue } from "./Dialogue";
import { Notebook } from "./Notebook";
import { AccuseDialog, PresentPicker, itemLabelFor } from "./Evidence";
import { Ending } from "./Ending";
import { Intro } from "./Intro";
import { ConsentDialog, Settings } from "./Settings";
import { Bi, GlycineMark, Modal, Toast } from "./ui";

type Panel = null | "notebook" | "accuse" | "settings" | "present";
type Transcripts = Partial<Record<CharacterId, TranscriptEntry[]>>;

let idCounter = 0;
const uid = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export default function Game() {
  const [booted, setBooted] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<GameView | null>(null);
  const [level, setLevelState] = useState<Level>("A2");
  const [scene, setScene] = useState<SceneId>("reception");
  const [transcripts, setTranscripts] = useState<Transcripts>({});
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [talkingTo, setTalkingTo] = useState<CharacterId | null>(null);
  const [narration, setNarration] = useState<{ title: string; text: Bilingual; isNew?: boolean } | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unseen, setUnseen] = useState(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [consentAsk, setConsentAsk] = useState<((ok: boolean) => void) | null>(null);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  // ------------------------------------------------------------ démarrage
  useEffect(() => {
    warmUpVoices();
    setPrefsState(loadPrefs());
    api.config().then(setConfig).catch(() => setConfig(null));
    const saved = loadGame();
    if (!saved) {
      setBooted(true);
      return;
    }
    setLevelState(saved.level);
    setScene(saved.scene);
    setTranscripts(saved.transcripts);
    setUtterances(saved.utterances);
    api
      .state(saved.token)
      .then((r) => {
        setToken(r.token);
        setView(r.view);
        setLevelState(r.view.level);
      })
      .catch((e: ApiError) => {
        clearGame();
        setTranscripts({});
        setUtterances([]);
        setError(
          e.code === "invalid_token"
            ? "Não foi possível retomar a partida salva (versão diferente). Comece uma nova investigação."
            : e.message,
        );
      })
      .finally(() => setBooted(true));
  }, []);

  // ------------------------------------------------------------ sauvegarde
  useEffect(() => {
    if (!token) return;
    saveGame({ version: 1, token, level, scene, transcripts, utterances, savedAt: Date.now() });
  }, [token, level, scene, transcripts, utterances]);

  const setPrefs = useCallback((p: Prefs) => {
    setPrefsState(p);
    savePrefs(p);
  }, []);

  const apply = useCallback((r: { token: string; view: GameView }) => {
    setToken(r.token);
    setView(r.view);
  }, []);

  const fail = useCallback((e: unknown) => {
    const err = e as ApiError;
    if (err.code === "invalid_token") {
      setError("A partida salva não é mais válida. Recomece a investigação.");
      setToken(null);
      setView(null);
      clearGame();
    } else {
      setToast(err.message || "Erro inesperado.");
    }
  }, []);

  // ------------------------------------------------------------ actions
  async function start(l: Level) {
    setBusy(true);
    setError(null);
    try {
      const r = await api.newGame(l);
      apply(r);
      setLevelState(l);
      setTranscripts({});
      setUtterances([]);
      setScene("reception");
      setTalkingTo(null);
      setNarration(null);
      setUnseen(0);
      api.visit(r.token, "reception").then(apply).catch(() => {});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function restart() {
    if (!window.confirm("Recomeçar do zero? O progresso atual será apagado.")) return;
    stopSpeaking();
    clearGame();
    setToken(null);
    setView(null);
    setPanel(null);
    setTalkingTo(null);
    setNarration(null);
    setTranscripts({});
    setUtterances([]);
  }

  async function goScene(s: SceneId) {
    setScene(s);
    setNarration(null);
    setTalkingTo(null);
    stopSpeaking();
    if (token && view && !view.visited.includes(s)) {
      try {
        apply(await api.visit(token, s));
      } catch (e) {
        fail(e);
      }
    }
  }

  async function examine(id: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      const r = await api.examine(token, id);
      apply(r);
      const label = HOTSPOTS.find((h) => h.id === id)?.label.fr ?? id;
      setNarration({ title: label, text: r.result.text, isNew: !!r.result.newClue });
      if (r.result.newClue) {
        const clue = r.view.clues.find((c) => c.id === r.result.newClue);
        setToast(`Nouvelle pièce au carnet : ${clue?.icon ?? ""} ${clue?.title.fr ?? ""}`);
        setUnseen((n) => n + 1);
      }
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  const speak = useCallback(
    async (entry: TranscriptEntry, slow = false) => {
      if (entry.who === "player" || entry.who === "narrator") return;
      setSpeakingId(entry.id);
      try {
        if (config?.serverTts) {
          try {
            await speakServer(entry.fr, entry.who, level, slow);
          } catch {
            await speakBrowser(entry.fr, entry.who, level, slow);
          }
        } else {
          await speakBrowser(entry.fr, entry.who, level, slow);
        }
      } catch {
        /* pas de synthèse disponible : le texte reste affiché */
      } finally {
        setSpeakingId((cur) => (cur === entry.id ? null : cur));
      }
    },
    [config?.serverTts, level],
  );

  function pushEntry(who: CharacterId, entry: TranscriptEntry) {
    setTranscripts((t) => ({ ...t, [who]: [...(t[who] ?? []), entry] }));
  }

  function handleReply(reply: TalkReply, r: { view: GameView }) {
    const entry: TranscriptEntry = { id: uid(), who: reply.character, fr: reply.line.fr, pt: reply.line.pt, source: reply.source };
    pushEntry(reply.character, entry);
    if (reply.newTestimonies.length) {
      setUnseen((n) => n + reply.newTestimonies.length);
      const before = new Set(view?.testimonies.filter((t) => t.contradicted).map((t) => t.id));
      const contradiction = r.view.testimonies.some((t) => t.contradicted && !before.has(t.id));
      setToast(
        reply.newTestimonies.length > 1
          ? `${reply.newTestimonies.length} témoignages ajoutés au carnet`
          : contradiction
            ? "Témoignage ajouté — une contradiction apparaît dans le carnet !"
            : "Témoignage ajouté au carnet",
      );
    }
    if (prefs.autoSpeak) speak(entry);
  }

  async function send(text: string) {
    if (!token || !talkingTo) return;
    const who = talkingTo;
    stopSpeaking();
    pushEntry(who, { id: uid(), who: "player", fr: text });
    setUtterances((u) => [...u, { character: who, text, at: Date.now() }]);
    setBusy(true);
    try {
      const r = await api.talk(token, who, text);
      apply(r);
      handleReply(r.reply, r);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function presentItem(item: string) {
    if (!token || !talkingTo) return;
    const who = talkingTo;
    setPanel(null);
    stopSpeaking();
    pushEntry(who, { id: uid(), who: "player", fr: "", presented: item });
    setBusy(true);
    try {
      const r = await api.present(token, who, item);
      apply(r);
      handleReply(r.reply, r);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function changeLevel(l: Level) {
    setLevelState(l);
    if (!token) return;
    try {
      apply(await api.setLevel(token, l));
    } catch (e) {
      fail(e);
    }
  }

  async function getHint(precise: boolean): Promise<Hint | null> {
    if (!token) return null;
    try {
      const r = await api.hint(token, precise);
      apply(r);
      return r.hint;
    } catch (e) {
      fail(e);
      return null;
    }
  }

  async function accuse(suspect: CharacterId, evidence: string[]): Promise<AccuseResult | null> {
    if (!token) return null;
    try {
      const r = await api.accuse(token, suspect, evidence);
      apply(r);
      if (r.result.accepted) {
        setPanel(null);
        setTalkingTo(null);
        stopSpeaking();
        window.scrollTo({ top: 0 });
      }
      return r.result;
    } catch (e) {
      fail(e);
      return null;
    }
  }

  const needConsent = useCallback((): Promise<boolean> => {
    if (prefs.micConsent) return Promise.resolve(true);
    return new Promise((resolve) => {
      setConsentAsk(() => (ok: boolean) => {
        setConsentAsk(null);
        if (ok) setPrefs({ ...prefs, micConsent: true });
        resolve(ok);
      });
    });
  }, [prefs, setPrefs]);

  function openCharacter(id: CharacterId) {
    setNarration(null);
    setTalkingTo(id);
  }

  // ------------------------------------------------------------ rendu
  const currentObjective = view?.objectives.find((o) => !o.done);
  const SceneArt = SCENE_COMPONENTS[scene];
  const sceneInfo = SCENES.find((s) => s.id === scene)!;
  const sceneHotspots = HOTSPOTS.filter((h) => h.scene === scene);
  const itemLabel = useMemo(() => (id: string) => itemLabelFor(view, id), [view]);

  if (view?.ending) {
    return (
      <div className="app">
        <TopBar config={config} />
        <main className="ending-wrap">
          <Ending ending={view.ending} level={level} utterances={utterances} onRestart={restart} />
        </main>
      </div>
    );
  }

  return (
    <div className={`app ${talkingTo ? "with-dialogue" : ""}`}>
      <TopBar config={config}>
        {view && (
          <>
            <button
              className="objective-chip"
              onClick={() => {
                setPanel("notebook");
                setUnseen(0);
              }}
              title="Ver objetivos"
            >
              <span className="eyebrow">Objectif</span>
              <span lang="fr">{currentObjective?.text.fr ?? "Toutes les pistes sont réunies."}</span>
            </button>
            <div className="top-actions">
              <div className="seg compact" role="radiogroup" aria-label="Nível">
                {(["A2", "B1"] as Level[]).map((l) => (
                  <button key={l} role="radio" aria-checked={level === l} className={level === l ? "on" : ""} onClick={() => changeLevel(l)}>
                    {l}
                  </button>
                ))}
              </div>
              <button
                className="btn notebook-btn"
                onClick={() => {
                  setPanel("notebook");
                  setUnseen(0);
                }}
              >
                📓 <span className="label">Carnet</span>
                {unseen > 0 && <span className="badge" aria-label={`${unseen} novidades`}>{unseen}</span>}
              </button>
              <button className="btn accuse-btn" onClick={() => setPanel("accuse")}>
                ⚖️ <span className="label">Conclure</span>
              </button>
              <button className="icon-btn light" onClick={() => setPanel("settings")} aria-label="Ajustes">
                ⚙
              </button>
            </div>
          </>
        )}
      </TopBar>

      <main className="stage">
        <div className="scene-col">
          <nav className="scene-tabs" aria-label="Lugares do hotel">
            {SCENES.map((s) => (
              <button
                key={s.id}
                className={s.id === scene ? "active" : ""}
                aria-current={s.id === scene ? "page" : undefined}
                onClick={() => goScene(s.id)}
              >
                <span lang="fr">{s.name.fr}</span>
                {view && !view.visited.includes(s.id) && <span className="new-dot" aria-label="não visitado" />}
              </button>
            ))}
          </nav>

          <div className="scene-frame">
            <SceneArt
              examined={view?.examined ?? []}
              onHotspot={examine}
              onCharacter={openCharacter}
              busy={busy}
            />
            {narration && (
              <div className={`narration ${narration.isNew ? "new" : ""}`} role="status">
                <div className="narration-head">
                  <strong lang="fr">{narration.title}</strong>
                  {narration.isNew && <span className="tag">Nouvelle pièce</span>}
                  <button className="icon-btn" onClick={() => setNarration(null)} aria-label="Fechar">
                    ✕
                  </button>
                </div>
                <Bi text={narration.text} />
              </div>
            )}
          </div>

          <div className="scene-list">
            <button className="person-chip" onClick={() => openCharacter(sceneInfo.character)} data-talk={sceneInfo.character}>
              <Portrait character={sceneInfo.character} size={40} />
              <span>
                Parler à <strong>{CHARACTERS[sceneInfo.character].short}</strong>
              </span>
            </button>
            <ul className="hotspot-list" aria-label="Pontos de interesse">
              {sceneHotspots.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => examine(h.id)}
                    className={view?.examined.includes(h.id) ? "seen" : ""}
                    disabled={busy}
                    data-examine={h.id}
                  >
                    <span aria-hidden="true">{view?.examined.includes(h.id) ? "✓" : "✦"}</span> <span lang="fr">{h.label.fr}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {talkingTo && view && (
          <div className="dialogue-col">
            <Dialogue
              character={talkingTo}
              entries={transcripts[talkingTo] ?? []}
              level={level}
              view={view}
              busy={busy}
              config={config}
              prefs={prefs}
              speakingId={speakingId}
              onSend={send}
              onOpenPresent={() => setPanel("present")}
              onSuggest={async () => {
                if (!token) return [];
                try {
                  return (await api.suggest(token, talkingTo)).suggestions;
                } catch (e) {
                  fail(e);
                  return [];
                }
              }}
              onSpeak={(e, slow) => speak(e, slow)}
              onClose={() => {
                stopSpeaking();
                setTalkingTo(null);
              }}
              onNeedConsent={needConsent}
              itemLabel={itemLabel}
            />
          </div>
        )}
      </main>

      {config?.dialogue === "demo" && (
        <p className="demo-banner" role="note">
          <strong>MODO DEMONSTRAÇÃO</strong> — falas pré-escritas, sem IA. Configure <code>ANTHROPIC_API_KEY</code> para conversa
          livre.
        </p>
      )}

      {booted && !view && <Intro config={config} onStart={start} busy={busy} error={error} />}

      {panel === "notebook" && view && (
        <Modal title="Carnet d'enquête" onClose={() => setPanel(null)} wide labelledBy="nb-title">
          <Notebook view={view} onHint={getHint} />
        </Modal>
      )}
      {panel === "present" && view && talkingTo && (
        <PresentPicker view={view} character={talkingTo} onPick={presentItem} onClose={() => setPanel(null)} />
      )}
      {panel === "accuse" && view && <AccuseDialog view={view} onAccuse={accuse} onClose={() => setPanel(null)} />}
      {panel === "settings" && (
        <Settings
          prefs={prefs}
          config={config}
          level={level}
          onPrefs={setPrefs}
          onLevel={changeLevel}
          onRestart={() => {
            setPanel(null);
            restart();
          }}
          onClose={() => setPanel(null)}
        />
      )}
      {consentAsk && <ConsentDialog onAnswer={consentAsk} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function TopBar({ config, children }: { config: AppConfig | null; children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="brand">
        <GlycineMark />
        <div>
          <span className="brand-name">Hôtel des Glycines</span>
          <span className="brand-sub">L&apos;affaire du Rossignol</span>
        </div>
        {config?.dialogue === "demo" && <span className="demo-pill">DÉMO</span>}
      </div>
      {children}
    </header>
  );
}
