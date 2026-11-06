import type { TopicId } from "./types";

/** Minuscules, sans accents, apostrophes normalisées, espaces compactés. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’`´]/g, "'")
    .replace(/œ/g, "oe")
    .replace(/\s+/g, " ")
    .trim();
}

// L'ordre compte : les sujets listés en premier sont prioritaires quand
// plusieurs sont détectés.
const PATTERNS: [TopicId, RegExp][] = [
  ["meta", /(ignore|oublie (tes|vos) (instructions|regles)|instruction|prompt|systeme|\bsystem\b|intelligence artificielle|\bi\.?a\.?\b|chatgpt|\bclaude\b|\bllm\b|solution|developpeur|mode debug|regles du jeu|donne[sz]?-?moi la reponse|revele|spoiler|tu es un (robot|bot|programme)|vous etes un (robot|bot|programme))/],
  ["accuse_direct", /(c'est (vous|toi) qui|c'est (vous|toi)!?$|vous avez (vole|pris|cache) (la|le|cette)|tu as (vole|pris|cache)|vous mentez|tu mens|menteu(r|se)|vous etes (le|la) (voleu|coupable)|tu es (le|la) (voleu|coupable)|je vous accuse|je t'accuse)/],
  ["greet", /\b(bonjour|salut|bonsoir|enchante|coucou|bonne matinee)\b/],
  ["bye", /(au revoir|\bmerci\b|bonne journee|a plus tard|a bientot|a tout a l'heure)/],
  ["self", /(qui etes|vous etes qui|t'es qui|tu es qui|qui es-tu|comment vous appelez|comment tu t'appelles|votre nom|ton nom|presentez|presente-toi|votre travail|votre metier|ton travail|que faites-vous|vous faites quoi|tu fais quoi|quel est votre role|vous travaillez ici|depuis quand)/],
  ["lastseen", /((vu|vue|voir) (la boite|le rossignol|l'objet|la boite a musique)|derniere fois|vu pour la derniere|quand (est-ce que )?(vous avez|avez-vous|tu as|as-tu) vu|a quelle heure (est-ce que )?(vous avez|avez-vous|tu as)? ?(vu|vue)|encore la|toujours la hier)/],
  ["discovery", /(ce matin|decouvert|qui a trouve|a 7 ?h|sept heures|7 heures|remarque la disparition|vitrine vide)/],
  ["night", /(hier soir|cette nuit|la nuit|hier nuit|cette soiree|la soiree|ou etiez|ou etais|ou est-ce que (vous etiez|tu etais)|vous etiez ou|tu etais ou|qu'est-ce que (vous faisiez|tu faisais)|que faisiez|vous faisiez quoi|tu faisais quoi|faisiez-vous|alibi|\b2[23] ?h|\b2[23] heures|onze heures|dix heures|minuit|toute la nuit|reste a la reception|dans (votre|ta) chambre|\bsorti|\bparti|quitte (la|votre|ton) (reception|poste)|apres le diner|couche|dormi)/],
  ["noise", /(bruit|entendu|entendre|lumiere|lampe|vu quelque chose|vu quelqu|remarque|bizarre|etrange|suspect|quelque chose de special|quelque chose d'anormal|avez-vous vu|vous avez vu|as-tu vu|t'as vu|tu as vu|qu'avez-vous vu|qu'est-ce que vous avez vu|en revenant|revenu|rentre)/],
  ["who", /(qui a (pris|vole|cache|fait)|qui est le voleur|qui est la voleuse|qui l'a (pris|volee|cachee)|quelqu'un|une personne|qui surveillait|silhouette|visage|qui etait|decri|a quoi ressemblait|comment etait (cette|la) personne|homme ou (une )?femme|soupconnez|a votre avis|selon vous|vous pensez que)/],
  ["vitrine", /(vitrine|\bcles?\b|\bclef|serrure|ouvrir|ouvert|casse|forc)/],
  ["shed", /(cabane|remise|outils|terreau|abri de jardin)/],
  ["garden", /(jardin|dehors|exterieur|\bbanc\b|porte-fenetre|porte fenetre|terrasse)/],
  ["rain", /(pluie|pleu|\bplu\b|meteo|quel temps|orage|mouille|averse)/],
  ["football", /(match|\bfoot|cafe du port|\bcafe\b|\bbar\b|brest|lyon|ticket|chocolat)/],
  ["phone", /(telephon|appel|reseau|portable|mobile|coup de fil|geneve)/],
  ["sale", /(vend|vente|antiquaire|delorme|achet|achat|\bprix\b|offre|euros|8 ?000)/],
  ["money", /(argent|probleme|difficult|toit|travaux|banque|dette|financ|\bcher\b|payer|soucis)/],
  ["family", /(\bfils\b|julien|famille|\bmere\b|maman|enfance|enfant|souvenir|parents|photo de famille|vieille photo|lettre|courrier)/],
  ["studies", /(etudes|etudiant|universite|ecole|tourisme)/],
  ["collection", /(collection|automates|photographi|pris des photos|des photos de la vitrine)/],
  ["about_odile", /(odile|madame fontaine|mme fontaine|la patronne|proprietaire|la directrice|fontaine)/],
  ["about_karim", /(karim|receptionniste|le jeune homme|veilleur)/],
  ["about_lambert", /(lambert|collectionneur|le client|chambre 3|chambre trois)/],
  ["box", /(boite|rossignol|objet|disparu|disparition|\bvol\b|vole|volee|musique|oiseau|automate)/],
  ["why", /(pourquoi|pour quelle raison|comment ca se fait|la raison)/],
];

export function classify(text: string): TopicId[] {
  const n = normalize(text);
  const out: TopicId[] = [];
  for (const [topic, re] of PATTERNS) {
    if (re.test(n)) out.push(topic);
  }
  // « vous avez vu la boîte » = dernière fois, pas un bruit
  if (out.includes("lastseen")) return out.filter((t) => t !== "noise");
  return out;
}

const PT_EN_MARKERS =
  /\b(voce|voces|onde|estava|ontem|noite|quem|obrigad[oa]|nao|porque|caixa|roubou|senhora|senhor|where|what|who|were|you|did|night|yesterday|the|is|are|tell me|please|was)\b/g;
const FR_MARKERS =
  /\b(vous|tu|je|est|etait|etiez|avez|avez-vous|la|le|les|des|une|un|qui|quoi|ou|hier|soir|nuit|boite|bonjour|pourquoi|comment|quand|madame|monsieur)\b/g;

/** Détecte (grossièrement) une phrase qui n'est pas en français. */
export function looksNotFrench(text: string): boolean {
  const n = normalize(text);
  const foreign = n.match(PT_EN_MARKERS)?.length ?? 0;
  const french = n.match(FR_MARKERS)?.length ?? 0;
  return foreign >= 2 && foreign > french;
}
