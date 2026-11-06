import { normalize } from "../engine/classify";

// Garde-fou après génération : même si l'IA ne connaît pas la vérité,
// on refuse une réplique qui ressemblerait à un aveu ou à une accusation
// inventée, ou qui sortirait du personnage. Dans ce cas, on utilise la
// réplique écrite à la place.

const FORBIDDEN = [
  /\bj'ai (cache|vole|pris) (la|le|cette) (boite|rossignol)/,
  /c'est moi qui (ai|l'ai) (cache|vole|pris)/,
  /\bje l'ai (cachee|volee|prise)\b/,
  /\b(le|la) coupable,? c'est\b/,
  /\bc'est (odile|karim|lambert|madame fontaine|monsieur lambert) qui (a|l'a) (vole|cache|pris)/,
  /\b(en tant qu'|je suis une |je suis un )(ia|intelligence artificielle|modele de langage|assistant virtuel)/,
  /\b(prompt|instructions systeme|system prompt)\b/,
];

export function violatesGuard(reply: string): boolean {
  const n = normalize(reply);
  if (n.length === 0 || n.length > 700) return true;
  return FORBIDDEN.some((re) => re.test(n));
}
