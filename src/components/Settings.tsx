"use client";

import type { AppConfig, Level } from "@/shared/types";
import type { Prefs } from "@/client/storage";
import { browserSttSupported, recordingSupported, ttsSupported } from "@/client/voice";
import { Modal } from "./ui";

export function Settings({
  prefs,
  config,
  level,
  onPrefs,
  onLevel,
  onRestart,
  onClose,
}: {
  prefs: Prefs;
  config: AppConfig | null;
  level: Level;
  onPrefs: (p: Prefs) => void;
  onLevel: (l: Level) => void;
  onRestart: () => void;
  onClose: () => void;
}) {
  const browserStt = browserSttSupported();
  const serverStt = !!config?.serverStt && recordingSupported();
  return (
    <Modal title="Ajustes" onClose={onClose} labelledBy="settings-title">
      <section className="settings-section">
        <h3 className="small-title">Nível</h3>
        <div className="seg" role="radiogroup" aria-label="Nível">
          {(["A2", "B1"] as Level[]).map((l) => (
            <button key={l} role="radio" aria-checked={level === l} className={level === l ? "on" : ""} onClick={() => onLevel(l)}>
              {l}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3 className="small-title">Voz</h3>
        <label className="check-row">
          <input type="checkbox" checked={prefs.autoSpeak} onChange={(e) => onPrefs({ ...prefs, autoSpeak: e.target.checked })} />
          Ler as respostas em voz alta automaticamente
        </label>
        <label className="check-row">
          <input type="checkbox" checked={prefs.autoSend} onChange={(e) => onPrefs({ ...prefs, autoSend: e.target.checked })} />
          Enviar automaticamente quando eu terminar de falar
        </label>
        <label className="check-row">
          Reconhecimento de voz:
          <select
            value={prefs.voiceEngine}
            onChange={(e) => onPrefs({ ...prefs, voiceEngine: e.target.value as Prefs["voiceEngine"] })}
          >
            <option value="auto">Automático</option>
            <option value="browser" disabled={!browserStt}>
              Navegador {browserStt ? "" : "(indisponível)"}
            </option>
            <option value="server" disabled={!serverStt}>
              Servidor {serverStt ? "" : "(não configurado)"}
            </option>
          </select>
        </label>
        <ul className="status-list small">
          <li>Reconhecimento no navegador: {browserStt ? "disponível" : "indisponível (use Chrome, Edge ou Safari)"}</li>
          <li>Reconhecimento no servidor: {config?.serverStt ? "configurado" : "não configurado"}</li>
          <li>Leitura em voz alta: {config?.serverTts ? "servidor" : ttsSupported() ? "navegador" : "indisponível"}</li>
        </ul>
        {prefs.micConsent && (
          <button className="link-btn" onClick={() => onPrefs({ ...prefs, micConsent: false })}>
            Revogar autorização do microfone
          </button>
        )}
        <p className="muted small">
          Nenhuma gravação é guardada. No reconhecimento pelo navegador, o áudio é processado pelo serviço do próprio navegador
          (no Chrome, servidores do Google). No modo servidor, o áudio é enviado uma vez para transcrição e descartado.
        </p>
      </section>

      <section className="settings-section">
        <h3 className="small-title">Diálogos</h3>
        <p className="small">
          {config?.dialogue === "ai" ? (
            <>
              IA ativa (<code>{config.model}</code>). As regras do mistério são verificadas pelo servidor; a IA só interpreta os
              personagens.
            </>
          ) : (
            <>Modo demonstração: falas pré-escritas, sem IA.</>
          )}
        </p>
      </section>

      <section className="settings-section">
        <h3 className="small-title">Partida</h3>
        <p className="muted small">O progresso fica salvo neste navegador.</p>
        <button className="btn danger" onClick={onRestart}>
          Recomeçar do zero
        </button>
      </section>
    </Modal>
  );
}

export function ConsentDialog({ onAnswer }: { onAnswer: (ok: boolean) => void }) {
  return (
    <Modal title="Usar o microfone?" onClose={() => onAnswer(false)} labelledBy="consent-title">
      <p>Para conversar por voz, o navegador vai pedir acesso ao microfone.</p>
      <ul className="small">
        <li>O áudio serve apenas para transformar sua fala em texto.</li>
        <li>
          Ele é processado pelo serviço de reconhecimento do navegador (no Chrome, servidores do Google) ou, se configurado, enviado
          uma única vez ao nosso servidor para transcrição.
        </li>
        <li>
          <strong>Nada é gravado nem guardado.</strong> Só o texto da conversa fica salvo neste navegador.
        </li>
        <li>Você pode usar o texto a qualquer momento.</li>
      </ul>
      <div className="modal-foot">
        <button className="btn ghost" onClick={() => onAnswer(false)}>
          Usar só texto
        </button>
        <button className="btn primary" onClick={() => onAnswer(true)}>
          Autorizar e falar
        </button>
      </div>
    </Modal>
  );
}
