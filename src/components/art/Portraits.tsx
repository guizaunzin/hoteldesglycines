import type { CharacterId } from "@/shared/types";

// Portraits en buste (dialogue). Style gouache plat, palette de l'hôtel.

export function Portrait({ character, size = 96, mood = "neutral" }: { character: CharacterId; size?: number; mood?: "neutral" | "talking" }) {
  const mouth = mood === "talking" ? <ellipse cx="60" cy="74" rx="5" ry="3.2" fill="#7a3b3b" /> : null;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-hidden="true" className="portrait">
      <defs>
        <clipPath id={`pclip-${character}`}>
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill={BG[character]} />
      <g clipPath={`url(#pclip-${character})`}>
        {character === "karim" && <Karim mouth={mouth} />}
        {character === "lambert" && <Lambert mouth={mouth} />}
        {character === "odile" && <Odile mouth={mouth} />}
      </g>
      <circle cx="60" cy="60" r="58" fill="none" stroke="#1d2340" strokeOpacity=".15" strokeWidth="2" />
    </svg>
  );
}

const BG: Record<CharacterId, string> = { karim: "#cfe0e6", lambert: "#ead9c4", odile: "#e2daf2" };

function Karim({ mouth }: { mouth: React.ReactNode }) {
  return (
    <g>
      {/* veste de réceptionniste */}
      <path d="M14 120 C18 96 36 86 60 86 C84 86 102 96 106 120 Z" fill="#23365c" />
      <path d="M48 88 L60 104 L72 88 Z" fill="#f4f1ea" />
      <path d="M56 92 L60 104 L64 92 L60 96 Z" fill="#9b2f3b" />
      <rect x="76" y="100" width="16" height="5" rx="1.5" fill="#d9a441" />
      <rect x="52" y="70" width="16" height="20" fill="#b07a52" />
      {/* tête */}
      <ellipse cx="60" cy="54" rx="21" ry="25" fill="#b97f55" />
      <ellipse cx="39" cy="56" rx="4" ry="6" fill="#a96f48" />
      <ellipse cx="81" cy="56" rx="4" ry="6" fill="#a96f48" />
      {/* cheveux bouclés */}
      <path d="M38 48 C36 28 50 22 60 23 C74 22 86 30 82 48 C79 40 73 36 66 37 C58 34 46 38 38 48 Z" fill="#1f1714" />
      {[-175, -155, -135, -115, -95, -75, -55, -35, -15].map((a, i) => (
        <circle key={i} cx={60 + 22 * Math.cos((a * Math.PI) / 180)} cy={50 + 22 * Math.sin((a * Math.PI) / 180)} r={i % 2 ? 6 : 7} fill="#1f1714" />
      ))}
      {/* yeux fatigués */}
      <ellipse cx="51" cy="55" rx="2.6" ry="2.2" fill="#24170f" />
      <ellipse cx="69" cy="55" rx="2.6" ry="2.2" fill="#24170f" />
      <path d="M46 61 Q51 63 55 61 M65 61 Q69 63 74 61" stroke="#8d5a39" strokeWidth="1.2" fill="none" />
      <path d="M46 49 Q51 46 56 49 M64 49 Q69 46 74 49" stroke="#1f1714" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M60 58 Q58 66 61 67" stroke="#8d5a39" strokeWidth="1.5" fill="none" />
      {/* barbe de trois jours */}
      <path d="M42 64 C44 78 52 80 60 80 C68 80 76 78 78 64 C74 72 68 75 60 75 C52 75 46 72 42 64 Z" fill="#3b2a22" opacity=".35" />
      {mouth ?? <path d="M54 72 Q60 75 66 72" stroke="#6e3a2c" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </g>
  );
}

function Lambert({ mouth }: { mouth: React.ReactNode }) {
  return (
    <g>
      {/* veste en tweed */}
      <path d="M10 120 C14 94 34 84 60 84 C86 84 106 94 110 120 Z" fill="#7a4b2a" />
      <path d="M10 120 C14 94 34 84 60 84 C86 84 106 94 110 120 Z" fill="url(#tweed)" opacity=".35" />
      <defs>
        <pattern id="tweed" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0" stroke="#3d2412" strokeWidth="1" />
        </pattern>
      </defs>
      <path d="M46 86 L60 108 L74 86 Z" fill="#f2ead8" />
      <path d="M50 92 L60 97 L50 102 Z M70 92 L60 97 L70 102 Z" fill="#7d1f2e" />
      <circle cx="60" cy="97" r="2.5" fill="#5e1622" />
      <rect x="52" y="70" width="16" height="18" fill="#e3b995" />
      {/* tête */}
      <ellipse cx="60" cy="52" rx="22" ry="26" fill="#eec8a6" />
      <ellipse cx="38" cy="54" rx="4" ry="6" fill="#e2b592" />
      <ellipse cx="82" cy="54" rx="4" ry="6" fill="#e2b592" />
      {/* cheveux gris, front dégarni */}
      <path d="M38 52 C36 40 38 32 44 30 C42 40 44 46 40 54 Z M82 52 C84 40 82 32 76 30 C78 40 76 46 80 54 Z" fill="#b9b4ad" />
      <path d="M44 30 C50 24 70 24 76 30 C70 27 50 27 44 30 Z" fill="#cfcac3" />
      {/* sourcils froncés */}
      <path d="M45 44 L56 47 M75 44 L64 47" stroke="#8c867f" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="51" cy="52" rx="2.4" ry="2.4" fill="#2b2420" />
      <ellipse cx="69" cy="52" rx="2.4" ry="2.4" fill="#2b2420" />
      {/* marque de lunettes absentes sur le nez */}
      <path d="M57 53 Q60 51 63 53" stroke="#c99a7a" strokeWidth="1.2" fill="none" />
      <path d="M60 54 Q57 64 61 65" stroke="#c99a7a" strokeWidth="1.6" fill="none" />
      {/* moustache et barbe courte */}
      <path d="M44 66 C46 82 54 84 60 84 C66 84 74 82 76 66 C72 72 66 70 60 70 C54 70 48 72 44 66 Z" fill="#d8d3cc" />
      <path d="M50 68 Q60 63 70 68 Q60 70 50 68 Z" fill="#c4bfb7" />
      {mouth ?? <path d="M55 74 L65 74" stroke="#8a5a4a" strokeWidth="2" strokeLinecap="round" />}
    </g>
  );
}

function Odile({ mouth }: { mouth: React.ReactNode }) {
  return (
    <g>
      {/* gilet lilas */}
      <path d="M12 120 C16 96 34 86 60 86 C86 86 104 96 108 120 Z" fill="#8e7cc3" />
      <path d="M50 88 C54 100 58 108 60 120 C62 108 66 100 70 88 Z" fill="#f6efe3" />
      {[100, 108, 116].map((y) => (
        <circle key={y} cx="60" cy={y} r="1.8" fill="#5f4d97" />
      ))}
      {/* collier — pas de foulard aujourd'hui */}
      <path d="M50 88 Q60 96 70 88" stroke="#d9a441" strokeWidth="1.2" fill="none" />
      <rect x="53" y="72" width="14" height="16" fill="#efcfb4" />
      {/* tête */}
      <ellipse cx="60" cy="54" rx="20" ry="24" fill="#f3d6bd" />
      {/* chignon blanc */}
      <circle cx="60" cy="24" r="10" fill="#ecebe8" />
      <path d="M39 56 C34 34 46 28 60 28 C74 28 86 34 81 56 C79 44 72 38 60 38 C48 38 41 44 39 56 Z" fill="#e4e2de" />
      <path d="M44 40 Q52 34 60 36" stroke="#cfccc6" strokeWidth="1.2" fill="none" />
      {/* yeux inquiets */}
      <path d="M46 48 Q51 45 56 48 M64 48 Q69 45 74 48" stroke="#a49e98" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="51" cy="54" rx="2.3" ry="2.6" fill="#3a2d2a" />
      <ellipse cx="69" cy="54" rx="2.3" ry="2.6" fill="#3a2d2a" />
      {/* lunettes sur chaînette */}
      <circle cx="51" cy="54" r="6.5" fill="none" stroke="#7b6aa8" strokeWidth="1.3" />
      <circle cx="69" cy="54" r="6.5" fill="none" stroke="#7b6aa8" strokeWidth="1.3" />
      <path d="M57.5 54 L62.5 54" stroke="#7b6aa8" strokeWidth="1.3" />
      <path d="M44.5 55 C40 66 42 82 46 92" stroke="#d9a441" strokeWidth=".8" fill="none" />
      <path d="M60 57 Q58 64 61 65" stroke="#d3a98c" strokeWidth="1.4" fill="none" />
      <ellipse cx="46" cy="64" rx="4" ry="2.4" fill="#eaa9a0" opacity=".5" />
      <ellipse cx="74" cy="64" rx="4" ry="2.4" fill="#eaa9a0" opacity=".5" />
      {mouth ?? <path d="M54 71 Q60 69 66 71" stroke="#9a5b55" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </g>
  );
}
