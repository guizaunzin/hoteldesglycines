// Données PUBLIQUES de l'affaire : ce que le joueur peut voir dès le début.
// La vérité, les conditions de révélation et le contenu des pistes sont côté serveur
// (src/server/case), jamais dans ce fichier.

import type { Bilingual, CharacterId, Level, SceneId } from "./types";

export const CASE_ID = "glycines-rossignol-v1";

export interface PublicCharacter {
  id: CharacterId;
  name: string;
  /** Nom court utilisé dans l'interface. */
  short: string;
  role: Bilingual;
  scene: SceneId;
  bio: Bilingual;
  /** Réglages de synthèse vocale du navigateur. */
  voice: { pitch: number; rateFactor: number; preferMale: boolean };
  color: string;
}

export const CHARACTERS: Record<CharacterId, PublicCharacter> = {
  karim: {
    id: "karim",
    name: "Karim Haddad",
    short: "Karim",
    role: { fr: "Réceptionniste de nuit", pt: "Recepcionista da noite" },
    scene: "reception",
    bio: {
      fr: "23 ans, étudiant. Il a travaillé toute la nuit et il a l'air fatigué.",
      pt: "23 anos, estudante. Trabalhou a noite toda e parece cansado.",
    },
    voice: { pitch: 1.05, rateFactor: 1.05, preferMale: true },
    color: "#2f6f8f",
  },
  lambert: {
    id: "lambert",
    name: "Rémi Lambert",
    short: "M. Lambert",
    role: { fr: "Client, collectionneur", pt: "Hóspede, colecionador" },
    scene: "salon",
    bio: {
      fr: "Collectionneur de boîtes à musique. Chambre 3. Il est très vexé.",
      pt: "Colecionador de caixas de música. Quarto 3. Está muito ofendido.",
    },
    voice: { pitch: 0.8, rateFactor: 0.95, preferMale: true },
    color: "#7a4b2a",
  },
  odile: {
    id: "odile",
    name: "Odile Fontaine",
    short: "Odile",
    role: { fr: "Propriétaire de l'hôtel", pt: "Dona do hotel" },
    scene: "jardin",
    bio: {
      fr: "67 ans. Sa mère a ouvert l'hôtel en 1965. Elle est bouleversée.",
      pt: "67 anos. A mãe dela abriu o hotel em 1965. Está abalada.",
    },
    voice: { pitch: 1.15, rateFactor: 0.95, preferMale: false },
    color: "#6b4f9e",
  },
};

export interface PublicScene {
  id: SceneId;
  name: Bilingual;
  short: string;
  character: CharacterId;
}

export const SCENES: PublicScene[] = [
  { id: "reception", name: { fr: "La réception", pt: "A recepção" }, short: "Réception", character: "karim" },
  { id: "salon", name: { fr: "Le salon", pt: "O salão" }, short: "Salon", character: "lambert" },
  { id: "jardin", name: { fr: "Le jardin", pt: "O jardim" }, short: "Jardin", character: "odile" },
];

export interface PublicHotspot {
  id: string;
  scene: SceneId;
  label: Bilingual;
}

export const HOTSPOTS: PublicHotspot[] = [
  { id: "registre", scene: "reception", label: { fr: "Le registre de nuit", pt: "O livro de registro da noite" } },
  { id: "corbeille", scene: "reception", label: { fr: "La corbeille", pt: "A lixeira" } },
  { id: "casier", scene: "reception", label: { fr: "Le casier à courrier", pt: "O escaninho de correspondência" } },
  { id: "tableau-cles", scene: "reception", label: { fr: "Le tableau des clés", pt: "O quadro de chaves" } },
  { id: "sonnette", scene: "reception", label: { fr: "La sonnette", pt: "A campainha" } },
  { id: "vitrine", scene: "salon", label: { fr: "La vitrine vide", pt: "A vitrine vazia" } },
  { id: "porte-fenetre", scene: "salon", label: { fr: "La porte-fenêtre", pt: "A porta-janela" } },
  { id: "piano", scene: "salon", label: { fr: "Le piano et les photos", pt: "O piano e as fotos" } },
  { id: "cheminee", scene: "salon", label: { fr: "La cheminée", pt: "A lareira" } },
  { id: "banc", scene: "jardin", label: { fr: "Le banc", pt: "O banco" } },
  { id: "cabane", scene: "jardin", label: { fr: "La cabane de jardin", pt: "A casinha de ferramentas" } },
  { id: "glycine", scene: "jardin", label: { fr: "La glycine", pt: "A glicínia" } },
  { id: "fontaine", scene: "jardin", label: { fr: "La fontaine", pt: "A fonte" } },
];

export const INTRO: Record<Level, Bilingual[]> = {
  A2: [
    {
      fr: "Vous travaillez pour Monsieur Delorme, antiquaire à Rouen. Ce matin, il vous envoie à l'Hôtel des Glycines, à Port-Lunel.",
      pt: "Você trabalha para o Sr. Delorme, antiquário em Rouen. Hoje de manhã, ele te mandou ao Hôtel des Glycines, em Port-Lunel.",
    },
    {
      fr: "Votre mission : chercher le Rossignol, une vieille boîte à musique. Monsieur Delorme l'achète aujourd'hui, à midi.",
      pt: "Sua missão: buscar o Rossignol, uma antiga caixa de música. O Sr. Delorme vai comprá-la hoje, ao meio-dia.",
    },
    {
      fr: "Mais quand vous arrivez, la vitrine du salon est vide. La boîte a disparu cette nuit ! Parlez aux trois personnes de l'hôtel et découvrez la vérité.",
      pt: "Mas quando você chega, a vitrine do salão está vazia. A caixa sumiu esta noite! Converse com as três pessoas do hotel e descubra a verdade.",
    },
  ],
  B1: [
    {
      fr: "Vous êtes l'assistant·e de Monsieur Delorme, antiquaire à Rouen. Ce matin, il vous a envoyé·e à l'Hôtel des Glycines, une petite pension de Port-Lunel, au bord de la mer.",
      pt: "Você é assistente do Sr. Delorme, antiquário em Rouen. Hoje de manhã, ele te enviou ao Hôtel des Glycines, uma pequena pousada de Port-Lunel, à beira-mar.",
    },
    {
      fr: "Vous deviez récupérer le Rossignol, une boîte à musique de 1890 que la propriétaire a accepté de vendre. Monsieur Delorme doit arriver à midi pour signer.",
      pt: "Você deveria buscar o Rossignol, uma caixa de música de 1890 que a dona aceitou vender. O Sr. Delorme deve chegar ao meio-dia para assinar.",
    },
    {
      fr: "Mais à votre arrivée, la vitrine du salon est vide : la boîte a disparu pendant la nuit. Chacun a sa version des faits… À vous de démêler le vrai du faux.",
      pt: "Mas quando você chega, a vitrine do salão está vazia: a caixa sumiu durante a noite. Cada um tem sua versão dos fatos… Cabe a você separar o verdadeiro do falso.",
    },
  ],
};

export function sceneOf(character: CharacterId): SceneId {
  return CHARACTERS[character].scene;
}
