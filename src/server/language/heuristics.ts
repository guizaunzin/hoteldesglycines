import type { Improvement, Level, Utterance } from "@/shared/types";
import { looksNotFrench, normalize } from "../engine/classify";

// Analyse de démonstration : quelques règles simples, transparentes et
// vérifiables. Avec une clé d'API, l'IA produit un bilan plus fin.

interface Rule {
  id: string;
  weight: number;
  title: { fr: string; pt: string };
  explanation: string;
  detect: (u: string, n: string) => boolean;
  fix?: (u: string) => string | null;
  practice: { instruction: string; model: string };
  check: (answer: string, n: string) => boolean;
  levels?: Level[];
}

const PAST_TIME = /(hier|cette nuit|la nuit derniere|ce matin|23 ?h|minuit)/;
const PAST_FORMS =
  /(etiez|etait|etais|aviez|avait|avez|as-tu|\bai\b|\ba vu\b|est alle|est sorti|etes (alle|sorti|reste|monte|descendu)|faisiez|faisait|\bete\b|est-ce que vous avez|avez-vous|est reste|est rentre)/;

const TU_MAP: [RegExp, string][] = [
  [/\btu étais\b/gi, "vous étiez"],
  [/\btu etais\b/gi, "vous étiez"],
  [/\bt'étais\b/gi, "vous étiez"],
  [/\btu as\b/gi, "vous avez"],
  [/\bt'as\b/gi, "vous avez"],
  [/\bas-tu\b/gi, "avez-vous"],
  [/\btu es\b/gi, "vous êtes"],
  [/\bt'es\b/gi, "vous êtes"],
  [/\bes-tu\b/gi, "êtes-vous"],
  [/\btu faisais\b/gi, "vous faisiez"],
  [/\btu sais\b/gi, "vous savez"],
  [/\btu peux\b/gi, "vous pouvez"],
  [/\btu connais\b/gi, "vous connaissez"],
  [/\btu penses\b/gi, "vous pensez"],
  [/\btu vois\b/gi, "vous voyez"],
  [/\btoi\b/gi, "vous"],
  [/\bton\b/gi, "votre"],
  [/\bta\b/gi, "votre"],
  [/\btes\b/gi, "vos"],
];

const ACCENTS: [RegExp, string][] = [
  [/\betiez\b/g, "étiez"],
  [/\betait\b/g, "était"],
  [/\betais\b/g, "étais"],
  [/\bdeja\b/g, "déjà"],
  [/\bapres\b/g, "après"],
  [/\btres\b/g, "très"],
  [/\bete\b/g, "été"],
  [/\breception\b/g, "réception"],
  [/\bcle\b/g, "clé"],
  [/\bboite\b/g, "boîte"],
  [/\bderniere\b/g, "dernière"],
  [/\bfenetre\b/g, "fenêtre"],
  [/\bou etiez\b/g, "où étiez"],
  [/\bpres\b/g, "près"],
];

const RULES: Rule[] = [
  {
    id: "portugais",
    weight: 5,
    title: { fr: "Tout dire en français", pt: "Dizer tudo em francês" },
    explanation:
      "Algumas frases saíram em português (ou inglês). Os personagens só falam francês: mesmo uma frase simples em francês funciona melhor.",
    detect: (u) => looksNotFrench(u),
    practice: { instruction: "Reformule em francês: \"Onde você estava ontem à noite?\"", model: "Où étiez-vous hier soir ?" },
    check: (a, n) => !looksNotFrench(a) && /(ou|quand|qu)/.test(n) && /(vous|tu)/.test(n),
  },
  {
    id: "vous",
    weight: 4,
    title: { fr: "Vouvoyer les inconnus", pt: "Tratar desconhecidos por « vous »" },
    explanation:
      "Você usou « tu ». Com pessoas que você não conhece (uma hóspede, um cliente, a dona do hotel), o normal é « vous », com o verbo na forma de « vous » (étiez, avez, êtes…).",
    detect: (_u, n) => /\b(tu|toi|ton|ta|tes|t'as|t'es|t'etais|as-tu|es-tu)\b/.test(n),
    fix: (u) => {
      let out = u;
      for (const [re, rep] of TU_MAP) out = out.replace(re, rep);
      return out === u ? null : out;
    },
    practice: {
      instruction: "Pergunte ao Sr. Lambert, com « vous », o que ele fazia ontem à noite.",
      model: "Qu'est-ce que vous faisiez hier soir ?",
    },
    check: (_a, n) => /\bvous\b/.test(n) && !/\b(tu|toi|t'as|t'es)\b/.test(n),
  },
  {
    id: "passe",
    weight: 3,
    title: { fr: "Parler du passé", pt: "Falar do passado" },
    explanation:
      "Para perguntar sobre ontem à noite, use o passado: o imparfait para a situação (« Où étiez-vous ? », « Que faisiez-vous ? ») e o passé composé para ações pontuais (« Qu'avez-vous vu ? »).",
    detect: (_u, n) => PAST_TIME.test(n) && !PAST_FORMS.test(n) && /\b(vous|tu|il|elle)\b/.test(n),
    practice: {
      instruction: "Pergunte onde a pessoa estava às 23h, usando o imparfait.",
      model: "Où étiez-vous à 23 heures ?",
    },
    check: (_a, n) => /(etiez|faisiez|etait|aviez|avez|etes (alle|sorti|reste))/.test(n),
  },
  {
    id: "contractions",
    weight: 3,
    title: { fr: "« au », « du », « aux », « des »", pt: "Contrações « au », « du », « aux », « des »" },
    explanation:
      "Em francês, « à + le » vira « au », « de + le » vira « du », « à + les » vira « aux » e « de + les » vira « des ». Ex.: « au salon », « du jardin ».",
    detect: (u) => /\b(à le|de le|à les|de les)\s+(?!faire|voir|dire|prendre|trouver)/i.test(u),
    fix: (u) =>
      u
        .replace(/\bà le\b/gi, "au")
        .replace(/\bà les\b/gi, "aux")
        .replace(/\bde le\b/gi, "du")
        .replace(/\bde les\b/gi, "des"),
    practice: {
      instruction: "Diga que você vem do jardim e vai ao salão.",
      model: "Je viens du jardin et je vais au salon.",
    },
    check: (a) => /\b(au|du|aux|des)\b/i.test(a) && !/\b(à le|de le|à les|de les)\b/i.test(a),
  },
  {
    id: "questions-completes",
    weight: 2,
    title: { fr: "Poser des questions complètes", pt: "Fazer perguntas completas" },
    explanation:
      "Várias perguntas tinham só uma ou duas palavras. Perguntas completas, com palavra interrogativa e verbo, trazem respostas mais úteis e treinam mais o seu francês.",
    detect: (u, n) => {
      const words = n.split(/\s+/).filter(Boolean);
      return words.length <= 2 && !/^(bonjour|salut|merci|oui|non|d'accord|ok|au revoir|bonsoir|pardon)/.test(n) && u.length > 0;
    },
    practice: {
      instruction: "Transforme « Jardin ? » em uma pergunta completa.",
      model: "Qu'est-ce que vous avez vu dans le jardin ?",
    },
    check: (_a, n) => n.split(/\s+/).length >= 4 && /(qu|ou|quand|qui|comment|pourquoi|est-ce|\?)/.test(n),
  },
  {
    id: "politesse",
    weight: 1,
    title: { fr: "Demander poliment", pt: "Pedir com educação" },
    explanation:
      "Para pedir algo, « Pouvez-vous… ? » ou « Pourriez-vous… ? » soa mais natural e educado do que o imperativo sozinho (« Dites-moi… »).",
    detect: (_u, n) =>
      /^(dites|montrez|expliquez|racontez|repondez|parlez)/.test(n) && !/(s'il vous plait|svp|pourriez|pouvez)/.test(n),
    practice: {
      instruction: "Peça educadamente que Karim conte o que aconteceu.",
      model: "Pourriez-vous me raconter ce qui s'est passé ?",
    },
    check: (_a, n) => /(pourriez|pouvez|s'il vous plait|voudriez|est-ce que vous pouvez)/.test(n),
  },
  {
    id: "accents",
    weight: 1,
    title: { fr: "Les accents", pt: "Os acentos" },
    explanation:
      "Ao digitar, alguns acentos ficaram de fora (ex.: « etiez » → « étiez », « boite » → « boîte »). Eles mudam a pronúncia e às vezes o sentido (« ou » = ou / « où » = onde).",
    detect: (u) => /\b(etiez|etait|deja|apres|tres|reception|boite|derniere|fenetre)\b/.test(u.toLowerCase()),
    fix: (u) => {
      let out = u;
      for (const [re, rep] of ACCENTS) out = out.replace(re, rep);
      return out === u ? null : out;
    },
    practice: { instruction: "Escreva com os acentos: \"Ou etiez-vous apres le diner ?\"", model: "Où étiez-vous après le dîner ?" },
    check: (a) => /où/.test(a) && /étiez/.test(a) && /après/.test(a),
  },
];

const STRETCH: Record<Level, Rule> = {
  A2: {
    id: "varier-questions",
    weight: 0,
    title: { fr: "Varier les mots interrogatifs", pt: "Variar as palavras interrogativas" },
    explanation:
      "Boa comunicação! Para ir além, varie as perguntas: « À quelle heure… ? », « Pourquoi… ? », « Comment… ? », « Qui… ? ». Cada palavra abre um tipo de resposta.",
    detect: () => false,
    practice: {
      instruction: "Pergunte a que horas Karim saiu, com « À quelle heure ».",
      model: "À quelle heure est-ce que vous êtes sorti ?",
    },
    check: (_a, n) => /a quelle heure/.test(n) && /(sorti|parti|quitte|alle)/.test(n),
  },
  B1: {
    id: "imparfait-passe-compose",
    weight: 0,
    title: { fr: "Combiner imparfait et passé composé", pt: "Combinar imparfait e passé composé" },
    explanation:
      "Boa comunicação! Para o nível B1, combine os dois passados numa mesma pergunta: o imparfait para o contexto e o passé composé para o acontecimento.",
    detect: () => false,
    practice: {
      instruction: "Pergunte o que a pessoa fazia quando ouviu a chuva.",
      model: "Qu'est-ce que vous faisiez quand vous avez entendu la pluie ?",
    },
    check: (_a, n) => /(faisiez|etiez|faisait)/.test(n) && /(quand|lorsque)/.test(n) && /(avez|a |etes)/.test(n),
  },
};

function toImprovement(rule: Rule, examples: { original: string; better: string }[]): Improvement {
  return { id: rule.id, title: rule.title, explanation: rule.explanation, examples, practice: rule.practice };
}

export function analyzeUtterances(utterances: Utterance[], level: Level): Improvement[] {
  const texts = utterances.map((u) => u.text.trim()).filter(Boolean);
  const scored: { rule: Rule; hits: string[] }[] = [];
  for (const rule of RULES) {
    if (rule.levels && !rule.levels.includes(level)) continue;
    const hits = texts.filter((t) => rule.detect(t, normalize(t)));
    if (hits.length) scored.push({ rule, hits });
  }
  scored.sort((a, b) => b.hits.length * b.rule.weight - a.hits.length * a.rule.weight);
  const out = scored.slice(0, 3).map(({ rule, hits }) =>
    toImprovement(
      rule,
      [...new Set(hits)].slice(0, 2).map((h) => ({ original: h, better: rule.fix?.(h) ?? rule.practice.model })),
    ),
  );
  if (out.length < 3) out.push(toImprovement(STRETCH[level], []));
  return out.slice(0, 3);
}

export function checkPracticeHeuristic(ruleId: string, answer: string): { ok: boolean; feedback: string } {
  const rule = RULES.find((r) => r.id === ruleId) ?? Object.values(STRETCH).find((r) => r.id === ruleId);
  if (!rule) return { ok: false, feedback: "Exercício desconhecido." };
  if (!answer.trim()) return { ok: false, feedback: "Escreva ou fale uma frase primeiro." };
  if (looksNotFrench(answer)) return { ok: false, feedback: "Tente responder em francês." };
  const ok = rule.check(answer, normalize(answer));
  return ok
    ? { ok: true, feedback: "Muito bem! A estrutura está correta." }
    : { ok: false, feedback: `Quase! Compare com o modelo: « ${rule.practice.model} »` };
}
