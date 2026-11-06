"use client";

// Voix : reconnaissance (dictée) et synthèse (lecture des répliques).
// 1) Navigateur (Web Speech API) : gratuit, aucune clé ; disponibilité variable.
// 2) Serveur (optionnel) : enregistrement MediaRecorder → /api/voice/transcribe,
//    synthèse /api/voice/speak. L'audio n'est jamais stocké.

import { CHARACTERS } from "@/shared/publicCase";
import type { CharacterId, Level } from "@/shared/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyRecognition = any;

function recognitionCtor(): (new () => AnyRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function browserSttSupported(): boolean {
  return !!recognitionCtor();
}

export function recordingSupported(): boolean {
  return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis && typeof SpeechSynthesisUtterance !== "undefined";
}

export interface SttCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}

export interface Listening {
  stop: () => void;
  cancel: () => void;
}

const STT_ERRORS: Record<string, string> = {
  "not-allowed": "Acesso ao microfone negado. Libere o microfone nas configurações do navegador ou use o texto.",
  "service-not-allowed": "O reconhecimento de voz não está disponível neste navegador. Use o texto.",
  "no-speech": "Não ouvi nada. Tente de novo, mais perto do microfone.",
  "audio-capture": "Nenhum microfone encontrado.",
  network: "O reconhecimento de voz do navegador precisa de internet.",
};

export function startBrowserStt(cb: SttCallbacks): Listening {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    cb.onError("Reconhecimento de voz indisponível neste navegador.");
    cb.onEnd();
    return { stop() {}, cancel() {} };
  }
  const rec: AnyRecognition = new Ctor();
  rec.lang = "fr-FR";
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let finalText = "";
  let cancelled = false;
  rec.onresult = (e: any) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    cb.onInterim((finalText + interim).trim());
  };
  rec.onerror = (e: any) => {
    if (e.error === "aborted") return;
    cb.onError(STT_ERRORS[e.error] ?? `Erro de reconhecimento (${e.error}).`);
  };
  rec.onend = () => {
    if (!cancelled && finalText.trim()) cb.onFinal(finalText.trim());
    cb.onEnd();
  };
  try {
    rec.start();
  } catch {
    cb.onError("Não foi possível iniciar o microfone.");
    cb.onEnd();
  }
  return {
    stop: () => rec.stop(),
    cancel: () => {
      cancelled = true;
      rec.abort();
    },
  };
}

const MAX_RECORDING_MS = 30_000;

export async function startServerStt(cb: SttCallbacks): Promise<Listening> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    cb.onError(STT_ERRORS["not-allowed"]);
    cb.onEnd();
    return { stop() {}, cancel() {} };
  }
  const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) =>
    MediaRecorder.isTypeSupported?.(m),
  );
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: Blob[] = [];
  let cancelled = false;
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    clearTimeout(timer);
    if (cancelled || chunks.length === 0) return cb.onEnd();
    cb.onInterim("…");
    try {
      const form = new FormData();
      form.append("audio", new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
      const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Erro");
      if (data.text) cb.onFinal(data.text);
      else cb.onError(STT_ERRORS["no-speech"]);
    } catch (err) {
      cb.onError(`Transcrição indisponível (${(err as Error).message}). Use o texto.`);
    } finally {
      cb.onEnd();
    }
  };
  recorder.start();
  const timer = setTimeout(() => recorder.state === "recording" && recorder.stop(), MAX_RECORDING_MS);
  return {
    stop: () => recorder.state === "recording" && recorder.stop(),
    cancel: () => {
      cancelled = true;
      if (recorder.state === "recording") recorder.stop();
    },
  };
}

// ------------------------------------------------------------------ synthèse

const MALE_HINTS = /(thomas|daniel|nicolas|paul|henri|mathieu|olivier|antoine|jean|male|homme)/i;
const FEMALE_HINTS = /(am[ée]lie|audrey|aur[ée]lie|marie|julie|c[ée]line|virginie|denise|ho?rtense|female|femme|google fran)/i;

function pickVoice(character: CharacterId): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr"));
  if (voices.length === 0) return undefined;
  const wantMale = CHARACTERS[character].voice.preferMale;
  const match = voices.filter((v) => (wantMale ? MALE_HINTS : FEMALE_HINTS).test(v.name));
  const frFR = (list: SpeechSynthesisVoice[]) => list.find((v) => v.lang === "fr-FR") ?? list[0];
  return frFR(match) ?? frFR(voices);
}

let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function speakBrowser(text: string, character: CharacterId, level: Level, slow: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ttsSupported()) return reject(new Error("tts"));
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text.replace(/[«»]/g, ""));
    u.lang = "fr-FR";
    try {
      const voice = pickVoice(character);
      if (voice) u.voice = voice;
    } catch {
      /* voix par défaut du navigateur */
    }
    const cfg = CHARACTERS[character].voice;
    u.pitch = cfg.pitch;
    u.rate = (level === "A2" ? 0.85 : 1) * cfg.rateFactor * (slow ? 0.7 : 1);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export async function speakServer(text: string, character: CharacterId, level: Level, slow: boolean): Promise<void> {
  stopSpeaking();
  const res = await fetch("/api/voice/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, character, level }),
  });
  if (!res.ok) throw new Error("tts-server");
  const url = URL.createObjectURL(await res.blob());
  const audio = new Audio(url);
  audio.playbackRate = slow ? 0.75 : 1;
  (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
  currentAudio = audio;
  await new Promise<void>((resolve) => {
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
  URL.revokeObjectURL(url);
}

// Certains navigateurs chargent les voix de façon asynchrone.
export function warmUpVoices() {
  if (ttsSupported()) window.speechSynthesis.getVoices();
}
