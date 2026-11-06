"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { CHARACTERS, HOTSPOTS } from "@/shared/publicCase";
import type { CharacterId, SceneId } from "@/shared/types";

// Scènes illustrées en SVG (viewBox 1000×625). Chaque point d'intérêt est
// un bouton accessible au clavier ; une liste textuelle équivalente est
// affichée sous la scène.

interface SceneProps {
  examined: string[];
  onHotspot: (id: string) => void;
  onCharacter: (id: CharacterId) => void;
  busy?: boolean;
}

function activate(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

function Hotspot({
  id,
  children,
  mx,
  my,
  props,
}: {
  id: string;
  children: ReactNode;
  mx: number;
  my: number;
  props: SceneProps;
}) {
  const label = HOTSPOTS.find((h) => h.id === id)?.label.fr ?? id;
  const seen = props.examined.includes(id);
  return (
    <g
      className={`hotspot ${seen ? "seen" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Examiner : ${label}`}
      data-hotspot={id}
      onClick={() => props.onHotspot(id)}
      onKeyDown={activate(() => props.onHotspot(id))}
    >
      <title>{label}</title>
      {children}
      <g className="marker" transform={`translate(${mx} ${my})`}>
        <circle r="15" className="marker-ring" />
        <circle r="8" className="marker-dot" />
        <path d="M-3.5 0 L3.5 0 M0 -3.5 L0 3.5" stroke="#1d2340" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Person({ id, x, y, s = 1, badge, props, children }: { id: CharacterId; x: number; y: number; s?: number; badge: [number, number]; props: SceneProps; children: ReactNode }) {
  const name = CHARACTERS[id].name;
  return (
    <g
      className="person"
      role="button"
      tabIndex={0}
      aria-label={`Parler à ${name}`}
      data-character={id}
      transform={`translate(${x} ${y}) scale(${s})`}
      onClick={() => props.onCharacter(id)}
      onKeyDown={activate(() => props.onCharacter(id))}
    >
      <title>{`Parler à ${name}`}</title>
      {children}
      <g className="speech-badge" transform={`translate(${badge[0]} ${badge[1]})`}>
        <rect x="-22" y="-16" width="44" height="30" rx="12" fill="#fffaf0" stroke="#1d2340" strokeWidth="2" />
        <path d="M-6 14 L-12 24 L4 14 Z" fill="#fffaf0" stroke="#1d2340" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="-9" cy="-1" r="2.6" fill="#1d2340" />
        <circle cx="0" cy="-1" r="2.6" fill="#1d2340" />
        <circle cx="9" cy="-1" r="2.6" fill="#1d2340" />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------- personnages */

function KarimFigure() {
  // buste derrière le comptoir (origine = base du buste)
  return (
    <g>
      <path d="M-58 0 C-56 -52 -36 -70 0 -72 C36 -70 56 -52 58 0 Z" fill="#23365c" />
      <path d="M-14 -70 L0 -46 L14 -70 Z" fill="#f4f1ea" />
      <path d="M-4 -64 L0 -46 L4 -64 L0 -58 Z" fill="#9b2f3b" />
      <rect x="20" y="-48" width="20" height="6" rx="2" fill="#d9a441" />
      <rect x="-10" y="-88" width="20" height="20" fill="#b07a52" />
      <ellipse cx="0" cy="-110" rx="25" ry="30" fill="#b97f55" />
      <path d="M-25 -116 C-28 -142 -10 -148 0 -147 C16 -148 30 -138 25 -116 C20 -128 12 -132 2 -131 C-8 -134 -18 -128 -25 -116 Z" fill="#1f1714" />
      {[-175, -155, -135, -115, -95, -75, -55, -35, -15].map((a, i) => (
        <circle key={i} cx={26 * Math.cos((a * Math.PI) / 180)} cy={-114 + 26 * Math.sin((a * Math.PI) / 180)} r={i % 2 ? 7 : 8} fill="#1f1714" />
      ))}
      <ellipse cx="-9" cy="-110" rx="3" ry="2.6" fill="#24170f" />
      <ellipse cx="9" cy="-110" rx="3" ry="2.6" fill="#24170f" />
      <path d="M-6 -95 Q0 -92 6 -95" stroke="#6e3a2c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M-22 -100 C-18 -84 -8 -82 0 -82 C8 -82 18 -84 22 -100 C16 -92 8 -89 0 -89 C-8 -89 -16 -92 -22 -100 Z" fill="#3b2a22" opacity=".3" />
    </g>
  );
}

function LambertFigure() {
  // debout (origine = pieds)
  return (
    <g>
      <ellipse cx="0" cy="4" rx="46" ry="9" fill="#000" opacity=".18" />
      <path d="M-24 0 L-20 -120 L20 -120 L24 0 L8 0 L4 -86 L-4 -86 L-8 0 Z" fill="#3f342c" />
      <path d="M-12 0 h-16 v-8 h18 Z M12 0 h16 v-8 h-18 Z" fill="#1a1411" />
      <path d="M-38 -110 L-42 -186 Q-40 -204 -18 -206 L18 -206 Q40 -204 42 -186 L38 -110 Z" fill="#7a4b2a" />
      <path d="M-12 -202 L0 -170 L12 -202 Z" fill="#f2ead8" />
      <path d="M-9 -194 L0 -189 L-9 -184 Z M9 -194 L0 -189 L9 -184 Z" fill="#7d1f2e" />
      <path d="M-42 -192 Q-56 -188 -56 -170 L-54 -118 Q-52 -108 -44 -110 L-40 -120 Z" fill="#6c4224" />
      <path d="M42 -192 Q56 -188 56 -170 L54 -118 Q52 -108 44 -110 L40 -120 Z" fill="#6c4224" />
      <path d="M-30 -150 H-22 M22 -150 H30" stroke="#3d2412" strokeWidth="2" />
      <circle cx="-49" cy="-106" r="7" fill="#eec8a6" />
      <circle cx="49" cy="-106" r="7" fill="#eec8a6" />
      <rect x="-9" y="-222" width="18" height="18" fill="#e3b995" />
      <ellipse cx="0" cy="-244" rx="24" ry="28" fill="#eec8a6" />
      <path d="M-24 -246 C-26 -262 -20 -270 -14 -272 C-16 -262 -16 -254 -20 -244 Z M24 -246 C26 -262 20 -270 14 -272 C16 -262 16 -254 20 -244 Z" fill="#b9b4ad" />
      <path d="M-14 -272 C-6 -278 6 -278 14 -272 C6 -275 -6 -275 -14 -272 Z" fill="#cfcac3" />
      <path d="M-15 -254 L-5 -251 M15 -254 L5 -251" stroke="#8c867f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="-9" cy="-246" r="2.6" fill="#2b2420" />
      <circle cx="9" cy="-246" r="2.6" fill="#2b2420" />
      <path d="M-18 -232 C-16 -216 -8 -214 0 -214 C8 -214 16 -216 18 -232 C14 -226 8 -228 0 -228 C-8 -228 -14 -226 -18 -232 Z" fill="#d8d3cc" />
    </g>
  );
}

function OdileFigure() {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="40" ry="8" fill="#000" opacity=".18" />
      <path d="M-30 0 L-24 -100 L24 -100 L30 0 Z" fill="#4c4a63" />
      <path d="M-20 0 h-12 v-7 h14 Z M20 0 h12 v-7 h-14 Z" fill="#6b4f3a" />
      <path d="M-32 -96 L-36 -160 Q-34 -178 -14 -180 L14 -180 Q34 -178 36 -160 L32 -96 Z" fill="#8e7cc3" />
      <path d="M-8 -178 C-4 -150 -2 -120 0 -96 C2 -120 4 -150 8 -178 Z" fill="#f6efe3" />
      <path d="M-36 -166 Q-48 -162 -48 -146 L-46 -106 Q-44 -98 -38 -100 L-33 -110 Z" fill="#7d6bb3" />
      <path d="M36 -166 Q47 -162 49 -146 L50 -114 Q50 -104 44 -104 L38 -112 Z" fill="#7d6bb3" />
      <circle cx="-42" cy="-96" r="6" fill="#f3d6bd" />
      {/* arrosoir */}
      <g transform="translate(52 -100)">
        <path d="M-12 0 L-10 -30 L18 -30 L20 0 Z" fill="#5e8a74" />
        <path d="M18 -24 L44 -40 L46 -36 L20 -18 Z" fill="#5e8a74" />
        <path d="M-4 -30 C-4 -44 12 -44 12 -30" stroke="#47705b" strokeWidth="4" fill="none" />
      </g>
      <circle cx="47" cy="-100" r="6" fill="#f3d6bd" />
      <rect x="-8" y="-196" width="16" height="18" fill="#efcfb4" />
      <ellipse cx="0" cy="-216" rx="21" ry="25" fill="#f3d6bd" />
      <circle cx="0" cy="-246" r="11" fill="#ecebe8" />
      <path d="M-21 -214 C-26 -238 -14 -244 0 -244 C14 -244 26 -238 21 -214 C19 -228 12 -234 0 -234 C-12 -234 -19 -228 -21 -214 Z" fill="#e4e2de" />
      <circle cx="-8" cy="-216" r="2.4" fill="#3a2d2a" />
      <circle cx="8" cy="-216" r="2.4" fill="#3a2d2a" />
      <path d="M-14 -224 Q-9 -227 -4 -224 M4 -224 Q9 -227 14 -224" stroke="#a49e98" strokeWidth="2" fill="none" />
      <path d="M-6 -202 Q0 -204 6 -202" stroke="#9a5b55" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------------------------------------------------------- réception */

export function ReceptionScene(props: SceneProps) {
  return (
    <svg viewBox="0 0 1000 625" className="scene-svg" role="group" aria-label="La réception de l'Hôtel des Glycines">
      <defs>
        <linearGradient id="rc-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f3e6cf" />
          <stop offset="1" stopColor="#e8d4b4" />
        </linearGradient>
        <linearGradient id="rc-wood" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8a5a36" />
          <stop offset="1" stopColor="#5d3a22" />
        </linearGradient>
        <linearGradient id="rc-light" x1="0" x2="1">
          <stop offset="0" stopColor="#fff6d8" stopOpacity=".8" />
          <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
        </linearGradient>
        <pattern id="rc-stripes" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="url(#rc-wall)" />
          <rect width="4" height="36" x="16" fill="#c9bde8" opacity=".35" />
        </pattern>
        <pattern id="rc-tiles" width="60" height="30" patternUnits="userSpaceOnUse">
          <rect width="60" height="30" fill="#e9dcc6" />
          <path d="M0 0 L30 15 L0 30 Z M60 0 L30 15 L60 30 Z" fill="#cdb594" />
        </pattern>
      </defs>
      <rect width="1000" height="470" fill="url(#rc-stripes)" />
      <rect y="360" width="1000" height="110" fill="#d9c3a0" />
      <path d="M0 360 H1000" stroke="#a88660" strokeWidth="6" />
      <rect y="470" width="1000" height="155" fill="url(#rc-tiles)" />
      <path d="M0 470 H1000" stroke="#7d5a3a" strokeWidth="5" />

      {/* porte d'entrée vitrée */}
      <g>
        <rect x="40" y="120" width="170" height="350" fill="#6e4a2e" rx="6" />
        <rect x="58" y="138" width="134" height="200" fill="#bfe0ea" />
        <path d="M125 138 V338 M58 238 H192" stroke="#6e4a2e" strokeWidth="8" />
        <path d="M58 138 L140 138 L58 300 Z" fill="#fff" opacity=".35" />
        <circle cx="185" cy="400" r="7" fill="#d9a441" />
        <path d="M210 120 L420 470 L210 470 Z" fill="url(#rc-light)" opacity=".5" />
      </g>

      {/* enseigne et glycine */}
      <g>
        <rect x="360" y="40" width="300" height="70" rx="10" fill="#1d2340" />
        <text x="510" y="86" textAnchor="middle" fontFamily="var(--font-display)" fontSize="34" fill="#f6efe3" fontStyle="italic">
          Hôtel des Glycines
        </text>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i} transform={`translate(${372 + i * 46} 112)`}>
            <path d={`M0 0 C2 ${14 + (i % 3) * 6} -2 ${24 + (i % 2) * 8} 0 ${34 + (i % 3) * 8}`} stroke="#5f7d55" strokeWidth="2" fill="none" />
            {[0, 1, 2, 3].map((j) => (
              <circle key={j} cx={(j % 2) * 6 - 3} cy={6 + j * 8} r={6 - j} fill={j % 2 ? "#a491d6" : "#8e7cc3"} />
            ))}
          </g>
        ))}
      </g>

      {/* casier à courrier */}
      <Hotspot id="casier" mx={300} my={185} props={props}>
        <rect x="245" y="150" width="120" height="120" fill="#7a4f2f" rx="4" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={253 + c * 37} y={158 + r * 37} width="31" height="31" fill="#4a2f1b" />),
        )}
        <rect x="292" y="196" width="26" height="16" fill="#f6efe3" transform="rotate(-8 305 204)" />
        <rect x="245" y="150" width="120" height="120" className="hit" />
        {!props.examined.includes("casier") && <rect x="300" y="440" width="34" height="22" fill="#f6efe3" transform="rotate(14 317 451)" stroke="#bfae94" />}
      </Hotspot>

      {/* tableau des clés */}
      <Hotspot id="tableau-cles" mx={760} my={160} props={props}>
        <rect x="700" y="140" width="190" height="130" rx="6" fill="#6b4428" />
        <rect x="710" y="150" width="170" height="110" rx="4" fill="#8a5a36" />
        {[0, 1, 2, 3, 4].map((c) =>
          [0, 1].map((r) => (
            <g key={`${c}${r}`} transform={`translate(${730 + c * 33} ${168 + r * 50})`}>
              <circle r="3" fill="#d9a441" />
              <path d="M0 3 V22" stroke="#d9a441" strokeWidth="3" />
              <rect x="-7" y="22" width="14" height="10" rx="2" fill={c === 4 && r === 1 ? "#c9bde8" : "#e8d9b8"} />
            </g>
          )),
        )}
        <rect x="700" y="140" width="190" height="130" className="hit" />
      </Hotspot>

      {/* Karim derrière le comptoir */}
      <Person id="karim" x={560} y={400} badge={[52, -150]} props={props}>
        <KarimFigure />
      </Person>

      {/* comptoir */}
      <g>
        <rect x="380" y="380" width="420" height="150" fill="url(#rc-wood)" />
        <rect x="370" y="368" width="440" height="22" rx="4" fill="#9b6a42" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={398 + i * 100} y="404" width="84" height="108" rx="4" fill="none" stroke="#3f2715" strokeWidth="3" opacity=".6" />
        ))}
        {/* lampe */}
        <path d="M745 368 L760 300 L790 300 L775 368 Z" fill="#d9a441" />
        <path d="M740 300 L810 300 L790 270 L760 270 Z" fill="#4f7a63" />
      </g>

      {/* registre */}
      <Hotspot id="registre" mx={470} my={330} props={props}>
        <path d="M420 366 L470 352 L520 366 L470 376 Z" fill="#f6efe3" stroke="#a48b67" strokeWidth="2" />
        <path d="M470 352 L470 376" stroke="#a48b67" strokeWidth="2" />
        <path d="M432 362 L462 356 M434 366 L462 360 M480 356 L508 362 M480 360 L506 366" stroke="#7d6bb3" strokeWidth="1.5" />
        <rect x="410" y="336" width="120" height="48" className="hit" />
      </Hotspot>

      {/* sonnette */}
      <Hotspot id="sonnette" mx={655} my={330} props={props}>
        <ellipse cx="655" cy="368" rx="22" ry="5" fill="#8a6a2a" />
        <path d="M637 366 C637 344 673 344 673 366 Z" fill="#d9a441" />
        <circle cx="655" cy="344" r="4" fill="#d9a441" />
        <rect x="628" y="330" width="54" height="44" className="hit" />
      </Hotspot>

      {/* corbeille */}
      <Hotspot id="corbeille" mx={872} my={470} props={props}>
        <path d="M838 470 L848 560 L900 560 L910 470 Z" fill="#4f7a63" />
        <path d="M838 470 L910 470" stroke="#3a5c4a" strokeWidth="6" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${846 + i * 13} 474 V556`} stroke="#3a5c4a" strokeWidth="2" opacity=".6" />
        ))}
        <circle cx="862" cy="466" r="12" fill="#f6efe3" stroke="#bfae94" />
        <circle cx="886" cy="462" r="10" fill="#efe4d2" stroke="#bfae94" />
        <rect x="830" y="440" width="90" height="125" className="hit" />
      </Hotspot>

      {/* plante */}
      <g transform="translate(950 470)">
        <path d="M-24 0 L-18 -50 L18 -50 L24 0 Z" fill="#b5534a" />
        <path d="M0 -50 C-30 -90 -40 -120 -20 -150 M0 -50 C10 -100 30 -120 40 -140 M0 -50 C0 -90 0 -120 6 -160" stroke="#4f7a63" strokeWidth="5" fill="none" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------- salon */

export function SalonScene(props: SceneProps) {
  const vitrineSeen = props.examined.includes("vitrine");
  return (
    <svg viewBox="0 0 1000 625" className="scene-svg" role="group" aria-label="Le salon">
      <defs>
        <linearGradient id="sl-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2f4f5a" />
          <stop offset="1" stopColor="#264049" />
        </linearGradient>
        <linearGradient id="sl-garden" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c9d8e0" />
          <stop offset=".6" stopColor="#9fc0a8" />
          <stop offset="1" stopColor="#6f9a7c" />
        </linearGradient>
        <linearGradient id="sl-glass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".08" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".3" />
        </linearGradient>
        <pattern id="sl-damask" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="url(#sl-wall)" />
          <path d="M30 8 C40 20 40 28 30 36 C20 28 20 20 30 8 Z" fill="#3b5f6b" opacity=".6" />
        </pattern>
      </defs>
      <rect width="1000" height="480" fill="url(#sl-damask)" />
      <path d="M0 120 H1000" stroke="#c9a65b" strokeWidth="4" opacity=".6" />
      <rect y="480" width="1000" height="145" fill="#6b4428" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M${i * 140} 480 L${i * 140 - 60} 625`} stroke="#5a3820" strokeWidth="3" />
      ))}

      {/* cheminée */}
      <Hotspot id="cheminee" mx={150} my={300} props={props}>
        <rect x="40" y="270" width="230" height="210" fill="#e9dfd0" />
        <rect x="28" y="256" width="254" height="22" rx="3" fill="#d8ccb9" />
        <path d="M90 480 V360 C90 320 220 320 220 360 V480 Z" fill="#2a2420" />
        <path d="M110 480 L130 450 L160 470 L190 445 L205 480 Z" fill="#3d3530" />
        <rect x="190" y="232" width="56" height="24" rx="2" fill="#7d1f2e" />
        <rect x="194" y="236" width="48" height="4" fill="#d9a441" />
        <rect x="28" y="230" width="254" height="250" className="hit" />
      </Hotspot>
      {/* tableau au-dessus */}
      <rect x="80" y="110" width="150" height="110" fill="#c9a65b" />
      <rect x="90" y="120" width="130" height="90" fill="#8fb3a0" />
      <path d="M90 190 C120 160 150 175 220 150 V210 H90 Z" fill="#5f7d55" />

      {/* vitrine */}
      <Hotspot id="vitrine" mx={400} my={170} props={props}>
        <rect x="320" y="140" width="170" height="360" rx="6" fill="#5b3a22" />
        <rect x="334" y="154" width="142" height="300" fill="#1f343c" />
        <rect x="334" y="154" width="142" height="300" fill="url(#sl-glass)" />
        <path d="M334 254 H476 M334 354 H476" stroke="#c9a65b" strokeWidth="3" />
        {/* coussin vide : la boîte a disparu */}
        <ellipse cx="405" cy="342" rx="44" ry="10" fill="#7d1f2e" />
        <ellipse cx="405" cy="338" rx="26" ry="5" fill="#5e1622" opacity=".7" />
        <rect x="360" y="230" width="22" height="20" fill="#d9a441" opacity=".8" />
        <rect x="420" y="430" width="40" height="18" fill="#c9bde8" opacity=".7" />
        <circle cx="470" cy="300" r="4" fill="#d9a441" />
        {vitrineSeen && <path d="M340 160 L470 450" stroke="#fff" strokeOpacity=".15" strokeWidth="2" />}
        <rect x="320" y="140" width="170" height="360" className="hit" />
      </Hotspot>

      {/* porte-fenêtre vers le jardin */}
      <Hotspot id="porte-fenetre" mx={760} my={540} props={props}>
        <rect x="660" y="100" width="210" height="380" fill="#efe4d2" />
        <rect x="676" y="116" width="178" height="364" fill="url(#sl-garden)" />
        <path d="M690 300 C700 260 740 250 760 290 C780 240 830 250 840 300 Z" fill="#8e7cc3" opacity=".8" />
        <path d="M765 116 V480 M676 240 H854 M676 360 H854" stroke="#efe4d2" strokeWidth="8" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${690 + i * 28} ${130 + (i % 3) * 30} l-6 18`} stroke="#fff" strokeWidth="1.5" opacity=".6" />
        ))}
        {/* tapis avec petites traces */}
        <path d="M600 560 L940 560 L980 610 L560 610 Z" fill="#9b2f3b" />
        <path d="M612 566 L928 566 L962 604 L578 604 Z" fill="none" stroke="#d9a441" strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={760 - i * 34 + (i % 2) * 10} cy={572 + i * 9} rx="7" ry="4.5" fill="#5a3e2b" opacity=".75" />
        ))}
        <rect x="560" y="520" width="420" height="100" className="hit" />
      </Hotspot>

      {/* piano et photos */}
      <Hotspot id="piano" mx={570} my={250} props={props}>
        <rect x="520" y="300" width="130" height="190" fill="#1a1a22" />
        <rect x="512" y="290" width="146" height="16" rx="3" fill="#24242e" />
        <rect x="520" y="390" width="130" height="16" fill="#f6efe3" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={526 + i * 16} y="390" width="8" height="10" fill="#1a1a22" />
        ))}
        <rect x="530" y="250" width="34" height="40" fill="#c9a65b" />
        <rect x="535" y="255" width="24" height="30" fill="#d8c7a4" />
        <circle cx="547" cy="266" r="5" fill="#8a7a62" />
        <rect x="580" y="262" width="26" height="28" fill="#8a6a2a" />
        <rect x="584" y="266" width="18" height="20" fill="#cfc0a0" />
        <rect x="616" y="256" width="30" height="34" fill="#c9a65b" />
        <rect x="620" y="260" width="22" height="26" fill="#b9d0c0" />
        <rect x="512" y="240" width="146" height="250" className="hit" />
      </Hotspot>

      {/* fauteuil */}
      <g>
        <path d="M80 560 L80 500 C80 470 250 470 250 500 L250 560 Z" fill="#4f7a63" />
        <rect x="60" y="500" width="40" height="80" rx="16" fill="#3e6350" />
        <rect x="230" y="500" width="40" height="80" rx="16" fill="#3e6350" />
        <rect x="90" y="530" width="150" height="34" rx="10" fill="#5e8a74" />
      </g>

      <Person id="lambert" x={300} y={600} s={0.95} badge={[46, -296]} props={props}>
        <LambertFigure />
      </Person>
    </svg>
  );
}

/* ------------------------------------------------------------------- jardin */

export function JardinScene(props: SceneProps) {
  const found = props.examined.includes("cabane");
  return (
    <svg viewBox="0 0 1000 625" className="scene-svg" role="group" aria-label="Le jardin">
      <defs>
        <linearGradient id="jd-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#b9cfe0" />
          <stop offset="1" stopColor="#eef0e6" />
        </linearGradient>
        <linearGradient id="jd-grass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8fb27f" />
          <stop offset="1" stopColor="#5f8a5a" />
        </linearGradient>
      </defs>
      <rect width="1000" height="625" fill="url(#jd-sky)" />
      {/* nuages après la pluie */}
      <g fill="#fff" opacity=".8">
        <ellipse cx="620" cy="80" rx="90" ry="26" />
        <ellipse cx="680" cy="64" rx="60" ry="24" />
        <ellipse cx="860" cy="120" rx="70" ry="20" />
      </g>
      {/* mer au loin */}
      <rect y="250" width="1000" height="40" fill="#8fb3c4" />
      <path d="M0 262 Q20 258 40 262 T80 262 T120 262" stroke="#fff" strokeOpacity=".5" fill="none" />
      <rect y="285" width="1000" height="340" fill="url(#jd-grass)" />

      {/* mur de l'hôtel avec la glycine */}
      <Hotspot id="glycine" mx={150} my={110} props={props}>
        <rect x="0" y="40" width="260" height="440" fill="#efe4d2" />
        <rect x="40" y="260" width="90" height="200" fill="#efe4d2" stroke="#c4b49a" strokeWidth="6" />
        <rect x="52" y="272" width="66" height="176" fill="#9fb9c4" />
        <path d="M0 60 C60 40 160 50 260 90 L260 70 C160 30 60 20 0 40 Z" fill="#5f7d55" />
        {Array.from({ length: 22 }).map((_, i) => {
          const x = 12 + (i * 23) % 250;
          const y = 70 + ((i * 37) % 70);
          const len = 50 + ((i * 13) % 60);
          return (
            <g key={i}>
              {Array.from({ length: 6 }).map((__, j) => (
                <ellipse key={j} cx={x + (j % 2) * 5 - 2} cy={y + j * (len / 6)} rx={8 - j * 1.1} ry={9 - j} fill={["#7d6bb3", "#a491d6", "#c9bde8"][j % 3]} />
              ))}
            </g>
          );
        })}
        <rect x="0" y="40" width="260" height="240" className="hit" />
      </Hotspot>

      {/* allée de gravier */}
      <path d="M260 625 C330 480 420 380 600 330 L680 330 C560 390 520 480 520 625 Z" fill="#d8ccb4" />
      <ellipse cx="460" cy="560" rx="60" ry="12" fill="#a9c2cf" opacity=".8" />
      <ellipse cx="620" cy="420" rx="40" ry="8" fill="#a9c2cf" opacity=".8" />

      {/* cabane au fond */}
      <Hotspot id="cabane" mx={835} my={210} props={props}>
        <path d="M720 380 L720 270 L820 210 L920 270 L920 380 Z" fill="#8a6a4a" />
        <path d="M700 276 L820 196 L940 276 L928 286 L820 214 L712 286 Z" fill="#5e3f2a" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${736 + i * 30} 280 V380`} stroke="#6f5338" strokeWidth="2" />
        ))}
        <rect x="790" y="300" width="56" height="80" fill={found ? "#2a1e14" : "#6f5338"} />
        {!found && <path d="M790 300 L846 300 L846 380 L790 380 Z" fill="none" stroke="#4a3220" strokeWidth="3" />}
        {found && <path d="M846 300 L870 306 L870 376 L846 380 Z" fill="#6f5338" />}
        <rect x="738" y="296" width="36" height="30" fill="#c4d6dc" stroke="#5e3f2a" strokeWidth="3" />
        <rect x="700" y="196" width="240" height="190" className="hit" />
      </Hotspot>

      {/* fontaine */}
      <Hotspot id="fontaine" mx={640} my={470} props={props}>
        <ellipse cx="640" cy="520" rx="90" ry="26" fill="#a8a29a" />
        <ellipse cx="640" cy="514" rx="76" ry="18" fill="#8fb3c4" />
        <rect x="628" y="440" width="24" height="74" fill="#b9b3aa" />
        <ellipse cx="640" cy="440" rx="34" ry="10" fill="#a8a29a" />
        <circle cx="628" cy="516" r="3" fill="#d9a441" />
        <circle cx="652" cy="512" r="3" fill="#d9a441" />
        <rect x="550" y="430" width="180" height="120" className="hit" />
      </Hotspot>

      {/* banc */}
      <Hotspot id="banc" mx={390} my={410} props={props}>
        <rect x="320" y="410" width="170" height="14" rx="3" fill="#5e3f2a" />
        <rect x="320" y="384" width="170" height="10" rx="3" fill="#5e3f2a" />
        <rect x="320" y="368" width="170" height="10" rx="3" fill="#5e3f2a" />
        <rect x="330" y="424" width="10" height="40" fill="#3d2a1c" />
        <rect x="470" y="424" width="10" height="40" fill="#3d2a1c" />
        {!props.examined.includes("banc") && (
          <g transform="translate(440 404)">
            <circle cx="-8" cy="0" r="6" fill="none" stroke="#2b2420" strokeWidth="2" />
            <circle cx="8" cy="0" r="6" fill="none" stroke="#2b2420" strokeWidth="2" />
            <path d="M-2 0 H2" stroke="#2b2420" strokeWidth="2" />
          </g>
        )}
        <rect x="310" y="360" width="190" height="110" className="hit" />
      </Hotspot>

      {/* massifs */}
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={60 + i * 34} cy={560 - (i % 2) * 8} r="26" fill="#4f7a63" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={70 + i * 40} cy={540 - (i % 2) * 10} r="7" fill={i % 2 ? "#e2a03f" : "#b5534a"} />
        ))}
      </g>

      <Person id="odile" x={250} y={590} s={0.95} badge={[40, -282]} props={props}>
        <OdileFigure />
      </Person>
    </svg>
  );
}

export const SCENE_COMPONENTS: Record<SceneId, (p: SceneProps) => React.ReactElement> = {
  reception: ReceptionScene,
  salon: SalonScene,
  jardin: JardinScene,
};
