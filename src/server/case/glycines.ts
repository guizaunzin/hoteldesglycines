import "server-only";
import { CASE_ID } from "@/shared/publicCase";
import type { CaseDefinition, Fact, Reaction } from "../engine/types";

// ===========================================================================
//  L'AFFAIRE DU ROSSIGNOL — définition complète et SECRÈTE.
//  Ce fichier n'est importé que par le code serveur (routes /api).
// ===========================================================================
//
//  Vérité : Odile Fontaine a caché elle-même la boîte à musique de sa mère
//  pour ne pas la vendre (son fils Julien insiste pour la vendre).
//  Karim (sorti voir un match) et Lambert (sorti téléphoner) mentent aussi,
//  mais pour d'autres raisons.

const facts: Fact[] = [
  // ------------------------------------------------------------------ KARIM
  {
    id: "k_self",
    character: "karim",
    topics: ["self", "studies"],
    line: {
      A2: "Je m'appelle Karim. Je suis le réceptionniste de nuit. Le jour, je suis étudiant en tourisme.",
      B1: "Je m'appelle Karim, je suis réceptionniste de nuit ici depuis un an. La journée, je fais des études de tourisme à Caen.",
      pt: "Meu nome é Karim, sou recepcionista da noite aqui há um ano. Durante o dia, estudo turismo em Caen.",
    },
  },
  {
    id: "k_box",
    character: "karim",
    topics: ["box"],
    line: {
      A2: "Le Rossignol, c'est la boîte à musique de Madame Fontaine. C'est un petit oiseau qui chante. Elle était dans la vitrine du salon.",
      B1: "Le Rossignol, c'est la boîte à musique de Madame Fontaine : un petit oiseau mécanique qui chante quand on la remonte. Elle était exposée dans la vitrine du salon.",
      pt: "O Rossignol é a caixa de música da Sra. Fontaine: um passarinho mecânico que canta quando se dá corda. Ficava exposta na vitrine do salão.",
    },
  },
  {
    id: "k_lastseen",
    character: "karim",
    topics: ["lastseen", "box"],
    priority: 2,
    time: "22:45",
    line: {
      A2: "Je l'ai vue hier soir, à 22 h 45. Je fais une ronde dans l'hôtel, et elle était dans la vitrine.",
      B1: "Je l'ai vue hier soir vers 22 h 45, pendant ma ronde. Elle était bien dans la vitrine, j'en suis sûr.",
      pt: "Eu a vi ontem à noite por volta das 22h45, durante a minha ronda. Ela estava na vitrine, tenho certeza.",
    },
    note: {
      fr: "Karim : à 22 h 45, la boîte était encore dans la vitrine.",
      pt: "Karim: às 22h45, a caixa ainda estava na vitrine.",
    },
    ask: {
      A2: "Quand avez-vous vu la boîte pour la dernière fois ?",
      B1: "À quelle heure avez-vous vu la boîte pour la dernière fois ?",
      pt: "A que horas você viu a caixa pela última vez?",
      ptA2: "Quando você viu a caixa pela última vez?",
    },
  },
  {
    id: "k_night_lie",
    character: "karim",
    topics: ["night"],
    priority: 1,
    time: "23:00",
    contradictedBy: ["k_left"],
    line: {
      A2: "Hier soir, j'étais ici, à la réception. Toute la nuit. Il n'y a rien eu de spécial.",
      B1: "J'étais à la réception toute la nuit, comme d'habitude. Je n'ai pas bougé, et il ne s'est rien passé de spécial.",
      pt: "Eu fiquei na recepção a noite toda, como sempre. Não saí daqui, e não aconteceu nada de especial.",
    },
    note: {
      fr: "Karim affirme qu'il est resté à la réception toute la nuit.",
      pt: "Karim afirma que ficou na recepção a noite toda.",
    },
    ask: {
      A2: "Où étiez-vous hier soir, vers 23 heures ?",
      B1: "Qu'est-ce que vous faisiez hier soir entre 23 heures et minuit ?",
      pt: "O que você fazia ontem à noite entre 23h e meia-noite?",
      ptA2: "Onde você estava ontem à noite, por volta das 23h?",
    },
  },
  {
    id: "k_noise",
    character: "karim",
    topics: ["noise"],
    requires: { notFlags: ["karim_confessed"] },
    line: {
      A2: "Non, je n'ai rien entendu. C'était très calme.",
      B1: "Non, rien du tout. C'était une nuit très calme… enfin, je crois.",
      pt: "Não, nada. Foi uma noite muito tranquila… quer dizer, eu acho.",
    },
  },
  {
    id: "k_key",
    character: "karim",
    topics: ["vitrine"],
    priority: 2,
    line: {
      A2: "La clé de la vitrine est ici, derrière le comptoir, sur le tableau des clés. Ce matin, elle était à sa place.",
      B1: "La petite clé de la vitrine est accrochée ici, au tableau des clés, derrière le comptoir. Ce matin, elle était à sa place.",
      pt: "A chavinha da vitrine fica pendurada aqui, no quadro de chaves, atrás do balcão. Hoje de manhã, estava no lugar.",
    },
    note: {
      fr: "La clé de la vitrine est au tableau des clés, derrière la réception. Ce matin, elle était à sa place.",
      pt: "A chave da vitrine fica no quadro de chaves, atrás da recepção. Hoje de manhã, estava no lugar.",
    },
    ask: {
      A2: "Où est la clé de la vitrine ?",
      B1: "Qui peut prendre la clé de la vitrine ?",
      pt: "Quem pode pegar a chave da vitrine?",
      ptA2: "Onde fica a chave da vitrine?",
    },
  },
  {
    id: "k_odile",
    character: "karim",
    topics: ["about_odile"],
    line: {
      A2: "Madame Fontaine est gentille. Mais en ce moment, elle est triste. Elle n'aime pas parler de la vente.",
      B1: "Madame Fontaine, c'est quelqu'un de bien. Mais depuis qu'elle a décidé de vendre la boîte, elle est triste. Elle évite d'en parler.",
      pt: "A Sra. Fontaine é uma boa pessoa. Mas desde que decidiu vender a caixa, está triste. Evita falar disso.",
    },
    note: {
      fr: "Karim : depuis la décision de vendre, Odile est triste et évite d'en parler.",
      pt: "Karim: desde a decisão de vender, Odile está triste e evita falar no assunto.",
    },
    ask: {
      A2: "Comment est Madame Fontaine ?",
      B1: "Comment va Madame Fontaine en ce moment ?",
      pt: "Como está a Sra. Fontaine ultimamente?",
      ptA2: "Como é a Sra. Fontaine?",
    },
  },
  {
    id: "k_lambert",
    character: "karim",
    topics: ["about_lambert", "sale"],
    line: {
      A2: "Monsieur Lambert voulait acheter la boîte. Hier, il a fait une offre à Madame Fontaine. Elle a dit non.",
      B1: "Monsieur Lambert voulait absolument la boîte. Hier après-midi, il a fait une offre à Madame Fontaine, et elle a refusé. Il n'était pas content.",
      pt: "O Sr. Lambert queria muito a caixa. Ontem à tarde, fez uma oferta à Sra. Fontaine, e ela recusou. Ele não ficou contente.",
    },
    note: {
      fr: "Karim : hier, Lambert a fait une offre pour la boîte ; Odile a refusé.",
      pt: "Karim: ontem, Lambert fez uma oferta pela caixa; Odile recusou.",
    },
    ask: {
      A2: "Vous connaissez Monsieur Lambert ?",
      B1: "Que pouvez-vous me dire sur Monsieur Lambert ?",
      pt: "O que você pode me dizer sobre o Sr. Lambert?",
      ptA2: "Você conhece o Sr. Lambert?",
    },
  },
  {
    id: "k_football",
    character: "karim",
    topics: ["football"],
    requires: { notFlags: ["karim_confessed"] },
    line: {
      A2: "Le foot ? J'adore ! Hier soir, il y avait Brest–Lyon. Mais moi, je travaillais…",
      B1: "Le foot, c'est ma passion. Hier soir, il y avait Brest–Lyon, un match important… mais bon, moi, j'étais au travail.",
      pt: "Futebol é a minha paixão. Ontem à noite teve Brest x Lyon, um jogo importante… mas enfim, eu estava trabalhando.",
    },
  },
  {
    id: "k_rain",
    character: "karim",
    topics: ["rain"],
    time: "23:00",
    line: {
      A2: "Il a commencé à pleuvoir vers 23 heures.",
      B1: "Il s'est mis à pleuvoir vers 23 heures, une grosse averse.",
      pt: "Começou a chover por volta das 23h, um temporal.",
    },
    note: { fr: "La pluie a commencé vers 23 h.", pt: "A chuva começou por volta das 23h." },
  },
  {
    id: "k_garden",
    character: "karim",
    topics: ["garden"],
    line: {
      A2: "La nuit, la porte du jardin est fermée. Mais on peut sortir par la porte-fenêtre du salon.",
      B1: "La nuit, je ferme la porte du jardin à clé. Mais la porte-fenêtre du salon s'ouvre de l'intérieur, donc on peut sortir par là.",
      pt: "À noite, eu tranco a porta do jardim. Mas a porta-janela do salão abre por dentro, então dá para sair por ali.",
    },
    note: {
      fr: "La nuit, on peut aller au jardin par la porte-fenêtre du salon.",
      pt: "À noite, dá para ir ao jardim pela porta-janela do salão.",
    },
    ask: {
      A2: "On peut aller au jardin la nuit ?",
      B1: "Comment peut-on aller au jardin pendant la nuit ?",
      pt: "Como se pode ir ao jardim durante a noite?",
      ptA2: "Dá para ir ao jardim à noite?",
    },
  },
  {
    id: "k_sale",
    character: "karim",
    topics: ["sale"],
    line: {
      A2: "Monsieur Delorme, l'antiquaire, arrive à midi. Il achète la boîte.",
      B1: "L'antiquaire, Monsieur Delorme, doit arriver à midi pour acheter la boîte. C'est votre patron, non ?",
      pt: "O antiquário, Sr. Delorme, deve chegar ao meio-dia para comprar a caixa. É o seu chefe, não é?",
    },
  },
  {
    id: "k_money",
    character: "karim",
    topics: ["money"],
    line: {
      A2: "L'hôtel a des problèmes d'argent, je crois. Le toit est très vieux.",
      B1: "Entre nous, je crois que l'hôtel a des soucis d'argent. Le toit est en mauvais état et les travaux coûtent cher.",
      pt: "Cá entre nós, acho que o hotel tem problemas de dinheiro. O telhado está em mau estado e a obra é cara.",
    },
    note: {
      fr: "Karim : l'hôtel a des problèmes d'argent (le toit à refaire).",
      pt: "Karim: o hotel tem problemas de dinheiro (o telhado precisa de obra).",
    },
  },
  {
    id: "k_family",
    character: "karim",
    topics: ["family"],
    line: {
      A2: "Madame Fontaine a un fils, Julien. Il habite à Paris.",
      B1: "Elle a un fils, Julien, qui vit à Paris. Il appelle souvent pour parler des comptes de l'hôtel.",
      pt: "Ela tem um filho, Julien, que mora em Paris. Ele liga sempre para falar das contas do hotel.",
    },
  },
  {
    id: "k_deny",
    character: "karim",
    topics: ["accuse_direct"],
    line: {
      A2: "Moi ? Non ! Je n'ai pas touché à cette boîte !",
      B1: "Moi ? Mais non ! Je n'ai jamais touché à cette boîte, je vous le jure !",
      pt: "Eu? Claro que não! Nunca toquei nessa caixa, eu juro!",
    },
  },
  // Vérités de Karim (après le ticket du café)
  {
    id: "k_left",
    character: "karim",
    topics: ["night", "football"],
    priority: 10,
    time: "23:00",
    requires: { flags: ["karim_confessed"] },
    line: {
      A2: "Bon… d'accord. Je suis sorti. De 23 heures à 23 h 45, j'étais au Café du Port pour voir la fin du match.",
      B1: "Bon… vous avez raison. Je suis sorti de 23 heures à 23 h 45, au Café du Port, pour voir la fin du match. J'ai écrit « RAS » pour ne pas avoir de problèmes.",
      pt: "Bom… você tem razão. Saí das 23h às 23h45, fui ao Café du Port ver o fim do jogo. Escrevi \"nada a relatar\" para não ter problemas.",
    },
    note: {
      fr: "Karim a menti : de 23 h à 23 h 45, il était au Café du Port. La réception était vide.",
      pt: "Karim mentiu: das 23h às 23h45, estava no Café du Port. A recepção ficou vazia.",
    },
  },
  {
    id: "k_odile_sent",
    character: "karim",
    topics: ["night", "why", "who", "vitrine", "about_odile"],
    priority: 10,
    time: "22:50",
    requires: { facts: ["k_left"] },
    line: {
      A2: "Et ce n'était pas mon idée ! Vers 22 h 50, Madame Fontaine est descendue. Elle m'a dit : « Va voir ton match, je surveille la réception. Mais ne dis rien à personne. »",
      B1: "Et ce n'était pas mon idée, je vous jure. Vers 22 h 50, Madame Fontaine est descendue et elle m'a dit : « Va voir la fin de ton match, je surveille la réception. Mais ça reste entre nous. »",
      pt: "E não foi ideia minha, juro. Por volta das 22h50, a Sra. Fontaine desceu e me disse: \"Vai ver o fim do seu jogo, eu fico de olho na recepção. Mas isso fica entre nós.\"",
    },
    note: {
      fr: "Karim : vers 22 h 50, Odile est descendue. Elle l'a envoyé voir le match et a promis de surveiller la réception (« ça reste entre nous »).",
      pt: "Karim: por volta das 22h50, Odile desceu. Mandou-o ver o jogo e prometeu vigiar a recepção (\"isso fica entre nós\").",
    },
    ask: {
      A2: "Qui surveillait la réception ?",
      B1: "Pendant que vous étiez au café, qui surveillait la réception ?",
      pt: "Enquanto você estava no café, quem vigiava a recepção?",
      ptA2: "Quem vigiava a recepção?",
    },
  },
  {
    id: "k_return",
    character: "karim",
    topics: ["night", "noise", "garden"],
    priority: 9,
    time: "23:45",
    requires: { facts: ["k_left"] },
    line: {
      A2: "Quand je suis revenu, à 23 h 45, il n'y avait personne. La porte-fenêtre du salon était ouverte, avec la pluie ! Je l'ai fermée.",
      B1: "Quand je suis rentré, vers 23 h 45, la réception était vide et la porte-fenêtre du salon était grande ouverte, sous la pluie. Je l'ai fermée, sans regarder la vitrine.",
      pt: "Quando voltei, por volta das 23h45, a recepção estava vazia e a porta-janela do salão estava escancarada, debaixo de chuva. Fechei, sem olhar a vitrine.",
    },
    note: {
      fr: "Karim : à 23 h 45, personne à la réception ; la porte-fenêtre du salon était ouverte sous la pluie.",
      pt: "Karim: às 23h45, ninguém na recepção; a porta-janela do salão estava aberta, na chuva.",
    },
    ask: {
      A2: "Qu'est-ce que vous avez vu quand vous êtes revenu ?",
      B1: "Qu'avez-vous remarqué en revenant du café ?",
      pt: "O que você notou ao voltar do café?",
      ptA2: "O que você viu quando voltou?",
    },
  },
  {
    id: "k_scarf",
    character: "karim",
    topics: [],
    note: {
      fr: "Karim reconnaît le foulard vert brodé « O.F. » : c'est celui d'Odile.",
      pt: "Karim reconhece o lenço verde bordado \"O.F.\": é o da Odile.",
    },
    line: {
      A2: "Ce foulard vert, c'est le foulard de Madame Fontaine.",
      B1: "Ce foulard vert, c'est celui de Madame Fontaine. Elle le porte tout le temps.",
      pt: "Esse lenço verde é o da Sra. Fontaine. Ela usa o tempo todo.",
    },
  },

  // ---------------------------------------------------------------- LAMBERT
  {
    id: "l_self",
    character: "lambert",
    topics: ["self", "collection"],
    line: {
      A2: "Rémi Lambert. Je collectionne les boîtes à musique et les automates. Je suis ici depuis trois jours, chambre 3.",
      B1: "Rémi Lambert, collectionneur de boîtes à musique et d'automates. Je séjourne ici depuis trois jours, chambre 3.",
      pt: "Rémi Lambert, colecionador de caixas de música e autômatos. Estou hospedado aqui há três dias, quarto 3.",
    },
  },
  {
    id: "l_box",
    character: "lambert",
    topics: ["box"],
    line: {
      A2: "Le Rossignol est une boîte très rare. Elle date de 1890 et elle vient de Suisse. Une merveille !",
      B1: "Le Rossignol est une pièce exceptionnelle : fabriquée en Suisse vers 1890, avec un oiseau qui bouge les ailes. Il n'en reste que trois au monde.",
      pt: "O Rossignol é uma peça excepcional: fabricada na Suíça por volta de 1890, com um pássaro que mexe as asas. Só restam três no mundo.",
    },
  },
  {
    id: "l_offer",
    character: "lambert",
    topics: ["sale", "money", "about_odile"],
    priority: 3,
    line: {
      A2: "Oui, hier, j'ai proposé 8 000 euros à Madame Fontaine. Plus que l'antiquaire ! Mais elle a dit non. Bizarre, non ?",
      B1: "Je ne le cache pas : hier, j'ai proposé 8 000 euros à Madame Fontaine, bien plus que votre antiquaire. Elle a refusé tout de suite. Étrange, pour quelqu'un qui a besoin d'argent, vous ne trouvez pas ?",
      pt: "Não escondo: ontem ofereci 8.000 euros à Sra. Fontaine, bem mais que o seu antiquário. Ela recusou na hora. Estranho, para quem precisa de dinheiro, não acha?",
    },
    note: {
      fr: "Lambert a proposé 8 000 € (plus que l'antiquaire). Odile a refusé tout de suite.",
      pt: "Lambert ofereceu 8.000 € (mais que o antiquário). Odile recusou na hora.",
    },
    ask: {
      A2: "Vous vouliez acheter la boîte ?",
      B1: "Est-ce que vous avez fait une offre pour la boîte ?",
      pt: "Você fez uma oferta pela caixa?",
      ptA2: "Você queria comprar a caixa?",
    },
  },
  {
    id: "l_night_lie",
    character: "lambert",
    topics: ["night"],
    priority: 1,
    time: "23:00",
    contradictedBy: ["l_garden"],
    line: {
      A2: "Hier soir, j'étais dans ma chambre. J'ai lu un livre et j'ai dormi. C'est tout.",
      B1: "J'ai passé toute la soirée dans ma chambre. J'ai lu un peu, puis je me suis endormi. Je ne suis pas sorti.",
      pt: "Passei a noite toda no meu quarto. Li um pouco e depois peguei no sono. Não saí.",
    },
    note: {
      fr: "Lambert affirme qu'il est resté dans sa chambre toute la soirée.",
      pt: "Lambert afirma que ficou no quarto a noite toda.",
    },
    ask: {
      A2: "Où étiez-vous hier soir ?",
      B1: "Qu'avez-vous fait hier soir, après le dîner ?",
      pt: "O que você fez ontem à noite, depois do jantar?",
      ptA2: "Onde você estava ontem à noite?",
    },
  },
  {
    id: "l_odile",
    character: "lambert",
    topics: ["about_odile", "accuse_direct"],
    line: {
      A2: "Madame Fontaine dit que je suis un voleur ! C'est ridicule. Je suis collectionneur, pas voleur.",
      B1: "Madame Fontaine m'accuse devant tout le monde ! C'est absurde : je suis collectionneur, pas cambrioleur.",
      pt: "A Sra. Fontaine me acusa na frente de todo mundo! É absurdo: sou colecionador, não ladrão.",
    },
  },
  {
    id: "l_karim",
    character: "lambert",
    topics: ["about_karim"],
    line: {
      A2: "Le jeune réceptionniste ? Il est sympathique. Un peu distrait, peut-être.",
      B1: "Le jeune réceptionniste ? Charmant garçon. Un peu distrait, peut-être : il parle beaucoup de football.",
      pt: "O jovem recepcionista? Rapaz simpático. Um pouco distraído, talvez: fala muito de futebol.",
    },
  },
  {
    id: "l_vitrine",
    character: "lambert",
    topics: ["vitrine"],
    priority: 2,
    line: {
      A2: "J'ai regardé la vitrine : la serrure n'est pas cassée. Le voleur avait la clé.",
      B1: "J'ai examiné la vitrine ce matin : la serrure est intacte. Un cambrioleur aurait cassé la vitre. Non, cette personne avait la clé.",
      pt: "Examinei a vitrine hoje de manhã: a fechadura está intacta. Um ladrão teria quebrado o vidro. Não, essa pessoa tinha a chave.",
    },
    note: {
      fr: "Lambert : la serrure est intacte, la personne avait la clé.",
      pt: "Lambert: a fechadura está intacta, a pessoa tinha a chave.",
    },
    ask: {
      A2: "Qu'est-ce que vous pensez de la vitrine ?",
      B1: "Selon vous, comment a-t-on ouvert la vitrine ?",
      pt: "Na sua opinião, como abriram a vitrine?",
      ptA2: "O que você acha da vitrine?",
    },
  },
  {
    id: "l_photos",
    character: "lambert",
    topics: ["collection"],
    priority: 1,
    line: {
      A2: "Oui, j'ai pris des photos de la vitrine. Je prends toujours des photos des belles pièces. Ce n'est pas un crime !",
      B1: "J'ai photographié la vitrine, oui. Je photographie toutes les belles pièces que je vois. Ce n'est tout de même pas un crime !",
      pt: "Fotografei a vitrine, sim. Fotografo todas as peças bonitas que vejo. Isso não é crime!",
    },
  },
  {
    id: "l_phone",
    character: "lambert",
    topics: ["phone"],
    priority: 2,
    line: {
      A2: "Dans ma chambre, mon téléphone ne marche pas. Il n'y a pas de réseau. C'est pénible !",
      B1: "Dans ma chambre, impossible de téléphoner : pas de réseau. Pour un hôtel, c'est un peu fort !",
      pt: "No meu quarto, impossível telefonar: não tem sinal. Para um hotel, é demais!",
    },
    note: {
      fr: "Lambert : pas de réseau téléphonique dans sa chambre.",
      pt: "Lambert: não há sinal de celular no quarto dele.",
    },
    ask: {
      A2: "Votre téléphone marche bien ici ?",
      B1: "Est-ce que vous avez téléphoné à quelqu'un hier soir ?",
      pt: "Você telefonou para alguém ontem à noite?",
      ptA2: "Seu celular funciona bem aqui?",
    },
  },
  {
    id: "l_garden_lie",
    character: "lambert",
    topics: ["garden", "shed"],
    requires: { notFlags: ["lambert_confessed"] },
    line: {
      A2: "Le jardin ? Je ne sais pas. Je ne suis pas sorti.",
      B1: "Le jardin ? Je n'en sais rien, je n'y ai pas mis les pieds.",
      pt: "O jardim? Não sei de nada, nem pus os pés lá.",
    },
  },
  {
    id: "l_noise",
    character: "lambert",
    topics: ["noise"],
    requires: { notFlags: ["lambert_confessed"] },
    line: {
      A2: "Non, je n'ai rien vu. J'étais dans ma chambre.",
      B1: "Non, rien. Je vous l'ai dit, j'étais dans ma chambre.",
      pt: "Não, nada. Já disse, eu estava no meu quarto.",
    },
  },
  {
    id: "l_rain",
    character: "lambert",
    topics: ["rain"],
    line: {
      A2: "La pluie ? Oui… vers 23 heures. Je l'ai entendue depuis ma chambre, bien sûr.",
      B1: "La pluie ? Elle a commencé vers 23 heures… Je l'ai entendue depuis ma chambre, évidemment.",
      pt: "A chuva? Começou por volta das 23h… Ouvi do meu quarto, evidentemente.",
    },
  },
  // Vérités de Lambert (après les lunettes)
  {
    id: "l_garden",
    character: "lambert",
    topics: ["night", "garden", "phone"],
    priority: 10,
    time: "23:15",
    requires: { flags: ["lambert_confessed"] },
    line: {
      A2: "Ah… mes lunettes ! Bon, je vais vous dire la vérité. Vers 23 h 15, je suis descendu dans le jardin pour téléphoner. Dans ma chambre, il n'y a pas de réseau.",
      B1: "Mes lunettes… Bon. Je vous dois la vérité. Vers 23 h 15, je suis descendu au jardin pour téléphoner, puisqu'il n'y a pas de réseau dans ma chambre. Je n'ai rien dit parce que ça me rendait suspect.",
      pt: "Meus óculos… Bom. Devo-lhe a verdade. Por volta das 23h15, desci ao jardim para telefonar, já que não há sinal no meu quarto. Não disse nada porque isso me tornava suspeito.",
    },
    note: {
      fr: "Lambert a menti : vers 23 h 15, il était dans le jardin pour téléphoner.",
      pt: "Lambert mentiu: por volta das 23h15, estava no jardim para telefonar.",
    },
  },
  {
    id: "l_why_lied",
    character: "lambert",
    topics: ["why", "phone"],
    priority: 7,
    requires: { facts: ["l_garden"] },
    line: {
      A2: "J'ai appelé un collectionneur de Genève. Je lui ai dit : « Je vais avoir le Rossignol. » Ce n'est pas très joli, je sais.",
      B1: "J'appelais un collectionneur de Genève pour lui dire que le Rossignol serait bientôt à moi, quel que soit le prix. Avouez que ce n'est pas très élégant… d'où mon silence.",
      pt: "Eu estava ligando para um colecionador de Genebra para dizer que o Rossignol logo seria meu, custasse o que custasse. Admita que não é muito elegante… daí o meu silêncio.",
    },
    note: {
      fr: "Lambert a menti par gêne : il appelait un collectionneur de Genève.",
      pt: "Lambert mentiu por vergonha: estava ligando para um colecionador de Genebra.",
    },
    ask: {
      A2: "Pourquoi vous n'avez pas dit la vérité ?",
      B1: "Pourquoi m'avez-vous menti tout à l'heure ?",
      pt: "Por que você mentiu para mim agora há pouco?",
      ptA2: "Por que você não disse a verdade?",
    },
  },
  {
    id: "l_light",
    character: "lambert",
    topics: ["noise", "garden", "shed", "night", "who"],
    priority: 9,
    time: "23:20",
    requires: { facts: ["l_garden"] },
    line: {
      A2: "Dans le jardin, j'ai vu une petite lumière. Une lampe de poche. Quelqu'un est sorti par la porte-fenêtre du salon et il est allé à la cabane. Il était 23 h 20.",
      B1: "Et j'ai vu quelque chose. Vers 23 h 20, une petite lumière, une lampe de poche, est sortie par la porte-fenêtre du salon et elle est allée jusqu'à la cabane, au fond du jardin.",
      pt: "E eu vi uma coisa. Por volta das 23h20, uma luzinha, uma lanterna, saiu pela porta-janela do salão e foi até a casinha de ferramentas, no fundo do jardim.",
    },
    note: {
      fr: "Lambert : vers 23 h 20, quelqu'un avec une lampe de poche est allé du salon jusqu'à la cabane du jardin.",
      pt: "Lambert: por volta das 23h20, alguém com uma lanterna foi do salão até a casinha do jardim.",
    },
    ask: {
      A2: "Vous avez vu quelque chose dans le jardin ?",
      B1: "Avez-vous remarqué quelque chose pendant que vous étiez dans le jardin ?",
      pt: "Você notou alguma coisa enquanto estava no jardim?",
      ptA2: "Você viu alguma coisa no jardim?",
    },
  },
  {
    id: "l_silhouette",
    character: "lambert",
    topics: ["who", "noise"],
    priority: 8,
    requires: { facts: ["l_light"] },
    line: {
      A2: "Je n'ai pas vu le visage. Il pleuvait. C'était une personne pas très grande, avec un long vêtement clair. Comme une robe de chambre.",
      B1: "Je n'ai pas vu son visage : il pleuvait et il faisait noir. Une silhouette plutôt petite, avec un long vêtement clair… une robe de chambre, peut-être.",
      pt: "Não vi o rosto: chovia e estava escuro. Uma silhueta mais para baixa, com uma roupa longa e clara… um roupão, talvez.",
    },
    note: {
      fr: "Lambert : la silhouette était petite, avec un long vêtement clair (une robe de chambre ?).",
      pt: "Lambert: a silhueta era baixa, com uma roupa longa e clara (um roupão?).",
    },
    ask: {
      A2: "Comment était cette personne ?",
      B1: "Pouvez-vous décrire la personne avec la lampe ?",
      pt: "Pode descrever a pessoa com a lanterna?",
      ptA2: "Como era essa pessoa?",
    },
  },
  {
    id: "l_forgot",
    character: "lambert",
    topics: ["garden", "rain"],
    priority: 4,
    requires: { facts: ["l_garden"] },
    line: {
      A2: "Après, il a plu très fort. J'ai couru à l'intérieur et j'ai oublié mes lunettes sur le banc.",
      B1: "Ensuite, l'averse a redoublé. Je suis rentré en courant et j'ai oublié mes lunettes sur le banc.",
      pt: "Depois, a chuva apertou. Entrei correndo e esqueci os óculos no banco.",
    },
  },
  {
    id: "l_shoes",
    character: "lambert",
    topics: [],
    note: {
      fr: "Les traces de terre sont trop petites pour les chaussures de Lambert (pointure 45).",
      pt: "As marcas de terra são pequenas demais para os sapatos de Lambert (número 45 francês).",
    },
    line: {
      A2: "Regardez mes chaussures : du 45 ! Ces traces sont toutes petites. Ce n'est pas moi.",
      B1: "Regardez mes chaussures : je fais du 45 ! Ces traces sont minuscules. Ce n'est certainement pas moi.",
      pt: "Olhe meus sapatos: calço 45! Essas marcas são minúsculas. Certamente não fui eu.",
    },
  },
  {
    id: "l_scarf",
    character: "lambert",
    topics: [],
    note: {
      fr: "Lambert : le foulard brodé « O.F. » — Odile Fontaine.",
      pt: "Lambert: o lenço bordado \"O.F.\" — Odile Fontaine.",
    },
    line: {
      A2: "Ce foulard avec « O.F. »… Odile Fontaine, non ?",
      B1: "Et ce foulard brodé « O.F. »… Odile Fontaine, évidemment.",
      pt: "E esse lenço bordado \"O.F.\"… Odile Fontaine, evidentemente.",
    },
  },

  // ------------------------------------------------------------------ ODILE
  {
    id: "o_self",
    character: "odile",
    topics: ["self"],
    line: {
      A2: "Je suis Odile Fontaine. Cet hôtel, c'est toute ma vie. Ma mère l'a ouvert en 1965.",
      B1: "Odile Fontaine. Cet hôtel, c'est toute ma vie : ma mère l'a ouvert en 1965, et je ne l'ai jamais quitté.",
      pt: "Odile Fontaine. Este hotel é a minha vida inteira: minha mãe o abriu em 1965, e eu nunca saí daqui.",
    },
  },
  {
    id: "o_box",
    character: "odile",
    topics: ["box"],
    line: {
      A2: "Le Rossignol, c'est une boîte à musique. Un petit oiseau qui chante. Elle était à ma mère.",
      B1: "Le Rossignol… C'est une boîte à musique avec un petit oiseau qui chante. Elle appartenait à ma mère.",
      pt: "O Rossignol… É uma caixa de música com um passarinho que canta. Pertencia à minha mãe.",
    },
  },
  {
    id: "o_accuse_lambert",
    character: "odile",
    topics: ["who", "about_lambert", "box"],
    priority: 3,
    line: {
      A2: "C'est Monsieur Lambert, j'en suis sûre ! Il voulait la boîte. Hier, il a pris des photos de la vitrine !",
      B1: "C'est Monsieur Lambert, j'en suis certaine ! Il voulait cette boîte à tout prix. Hier, je l'ai vu photographier la vitrine !",
      pt: "Foi o Sr. Lambert, tenho certeza! Ele queria essa caixa a qualquer preço. Ontem, eu o vi fotografando a vitrine!",
    },
    note: {
      fr: "Odile accuse Lambert : il voulait la boîte et il a photographié la vitrine.",
      pt: "Odile acusa Lambert: ele queria a caixa e fotografou a vitrine.",
    },
    ask: {
      A2: "Qui a pris la boîte, à votre avis ?",
      B1: "Selon vous, qui a pu prendre la boîte ?",
      pt: "Na sua opinião, quem pode ter pegado a caixa?",
      ptA2: "Quem pegou a caixa, na sua opinião?",
    },
  },
  {
    id: "o_night_lie",
    character: "odile",
    topics: ["night"],
    priority: 2,
    time: "22:30",
    contradictedBy: ["k_odile_sent", "o_admits"],
    line: {
      A2: "Hier soir, je suis montée à 22 h 30. J'ai pris un somnifère et j'ai dormi jusqu'à 7 heures.",
      B1: "Je suis montée me coucher vers 22 h 30. J'ai pris mon somnifère, comme toujours, et j'ai dormi d'une traite jusqu'à 7 heures.",
      pt: "Subi para dormir por volta das 22h30. Tomei meu sonífero, como sempre, e dormi direto até as 7h.",
    },
    note: {
      fr: "Odile affirme qu'elle s'est couchée à 22 h 30 et qu'elle a dormi jusqu'à 7 h (somnifère).",
      pt: "Odile afirma que se deitou às 22h30 e dormiu até as 7h (sonífero).",
    },
    ask: {
      A2: "Qu'est-ce que vous avez fait hier soir ?",
      B1: "Où étiez-vous hier soir entre 23 heures et minuit ?",
      pt: "Onde você estava ontem à noite entre 23h e meia-noite?",
      ptA2: "O que você fez ontem à noite?",
    },
  },
  {
    id: "o_lastseen",
    character: "odile",
    topics: ["lastseen"],
    time: "22:30",
    line: {
      A2: "Je l'ai vue hier soir, à 22 h 30, avant de monter.",
      B1: "Je l'ai vue hier soir vers 22 h 30, juste avant de monter.",
      pt: "Eu a vi ontem à noite por volta das 22h30, logo antes de subir.",
    },
  },
  {
    id: "o_discovery",
    character: "odile",
    topics: ["discovery"],
    time: "07:00",
    line: {
      A2: "Ce matin, à 7 heures, je suis descendue. La vitrine était vide ! J'ai crié.",
      B1: "Ce matin, à 7 heures, je suis descendue et j'ai vu la vitrine vide. J'ai crié si fort que Karim est arrivé en courant.",
      pt: "Hoje de manhã, às 7h, desci e vi a vitrine vazia. Gritei tão alto que o Karim veio correndo.",
    },
    note: { fr: "Odile a découvert la vitrine vide à 7 h.", pt: "Odile descobriu a vitrine vazia às 7h." },
    ask: {
      A2: "Qui a découvert la vitrine vide ?",
      B1: "Comment avez-vous découvert la disparition ?",
      pt: "Como você descobriu o sumiço?",
      ptA2: "Quem descobriu a vitrine vazia?",
    },
  },
  {
    id: "o_key",
    character: "odile",
    topics: ["vitrine"],
    line: {
      A2: "La clé de la vitrine ? Elle est à la réception, au tableau des clés. Tout le monde le sait…",
      B1: "La clé ? Elle est accrochée au tableau, derrière la réception. N'importe qui pouvait la prendre quand Karim avait le dos tourné.",
      pt: "A chave? Fica pendurada no quadro, atrás da recepção. Qualquer um podia pegá-la quando o Karim estava de costas.",
    },
  },
  {
    id: "o_sale",
    character: "odile",
    topics: ["sale", "money"],
    priority: 2,
    line: {
      A2: "L'antiquaire arrive à midi. C'est… c'est mieux comme ça. L'hôtel a besoin d'argent.",
      B1: "Votre patron doit arriver à midi. C'est… c'est la meilleure solution, je suppose. L'hôtel a besoin de cet argent.",
      pt: "Seu chefe deve chegar ao meio-dia. É… é a melhor solução, imagino. O hotel precisa desse dinheiro.",
    },
    note: {
      fr: "Odile vend la boîte parce que l'hôtel a besoin d'argent… mais elle hésite.",
      pt: "Odile vende a caixa porque o hotel precisa de dinheiro… mas hesita.",
    },
    ask: {
      A2: "Pourquoi vous vendez la boîte ?",
      B1: "Pourquoi avez-vous décidé de vendre la boîte ?",
      pt: "Por que você decidiu vender a caixa?",
      ptA2: "Por que você vende a caixa?",
    },
  },
  {
    id: "o_lambert_offer",
    character: "odile",
    topics: ["sale", "why", "about_lambert"],
    priority: 6,
    requires: { anyFacts: ["l_offer", "k_lambert"] },
    line: {
      A2: "Oui, il m'a proposé beaucoup d'argent. J'ai dit non. Je ne vends pas le Rossignol à n'importe qui.",
      B1: "Il m'a proposé 8 000 euros, oui. Et j'ai refusé. Je… je ne vends pas le Rossignol à n'importe qui. Voilà.",
      pt: "Ele me ofereceu 8.000 euros, sim. E eu recusei. Eu… eu não vendo o Rossignol para qualquer um. Pronto.",
    },
    note: {
      fr: "Odile a refusé l'offre de Lambert : « pas à n'importe qui ».",
      pt: "Odile recusou a oferta de Lambert: \"não para qualquer um\".",
    },
    ask: {
      A2: "Pourquoi vous avez refusé l'offre de Monsieur Lambert ?",
      B1: "Pourquoi avez-vous refusé l'offre de Monsieur Lambert ?",
      pt: "Por que você recusou a oferta do Sr. Lambert?",
      ptA2: "Por que você recusou a oferta do Sr. Lambert?",
    },
  },
  {
    id: "o_money",
    character: "odile",
    topics: ["money"],
    line: {
      A2: "Le toit de l'hôtel est très vieux. Les travaux coûtent cher.",
      B1: "Le toit a plus de cent ans. Les travaux coûtent une fortune, et la banque ne veut plus nous prêter.",
      pt: "O telhado tem mais de cem anos. A obra custa uma fortuna, e o banco não quer mais nos emprestar.",
    },
  },
  {
    id: "o_family",
    character: "odile",
    topics: ["family"],
    line: {
      A2: "Mon fils, Julien, habite à Paris. Il m'aide avec les comptes de l'hôtel.",
      B1: "Mon fils Julien vit à Paris. Il s'occupe des comptes de l'hôtel… il est très raisonnable, lui.",
      pt: "Meu filho Julien mora em Paris. Ele cuida das contas do hotel… ele é muito sensato.",
    },
  },
  {
    id: "o_family_letter",
    character: "odile",
    topics: ["family", "sale", "why"],
    priority: 7,
    requires: { clues: ["lettre"] },
    line: {
      A2: "Vous avez lu ma lettre ? … Oui. Julien veut vendre la boîte. Il a raison, je suppose.",
      B1: "Vous avez lu mon courrier ?… Bon. Oui, c'est Julien qui veut vendre. Il dit que c'est raisonnable. Il a sans doute raison.",
      pt: "Você leu a minha carta?… Bom. Sim, é o Julien que quer vender. Ele diz que é o sensato. Deve ter razão.",
    },
    note: {
      fr: "Odile : c'est son fils Julien qui veut vendre ; elle, elle hésite.",
      pt: "Odile: é o filho, Julien, quem quer vender; ela hesita.",
    },
    ask: {
      A2: "Votre fils veut vendre la boîte ?",
      B1: "Est-ce que c'est votre fils qui a décidé de vendre ?",
      pt: "Foi o seu filho que decidiu vender?",
      ptA2: "Seu filho quer vender a caixa?",
    },
  },
  {
    id: "o_garden",
    character: "odile",
    topics: ["garden"],
    line: {
      A2: "Je viens au jardin tous les matins. La glycine, c'est ma fierté.",
      B1: "Je viens au jardin tous les matins, ça me calme. Cette glycine, c'est ma mère qui l'a plantée.",
      pt: "Venho ao jardim todas as manhãs, me acalma. Esta glicínia foi minha mãe quem plantou.",
    },
  },
  {
    id: "o_shed",
    character: "odile",
    topics: ["shed"],
    line: {
      A2: "La cabane ? Il n'y a que des vieux outils. Rien d'intéressant. Vraiment.",
      B1: "La cabane ? Oh, il n'y a que de vieux outils et des sacs de terreau. Rien d'intéressant, croyez-moi.",
      pt: "A casinha? Ah, só tem ferramentas velhas e sacos de terra. Nada de interessante, acredite.",
    },
  },
  {
    id: "o_rain",
    character: "odile",
    topics: ["rain"],
    line: {
      A2: "Il a plu cette nuit ? … Oui, peut-être. Je dormais.",
      B1: "Il a plu cette nuit ?… Ah oui, peut-être. Je dormais, vous savez.",
      pt: "Choveu esta noite?… Ah, sim, talvez. Eu estava dormindo, sabe.",
    },
  },
  {
    id: "o_karim",
    character: "odile",
    topics: ["about_karim"],
    line: {
      A2: "Karim est un bon garçon. Il travaille bien.",
      B1: "Karim est un bon garçon, sérieux et gentil. Je lui fais confiance.",
      pt: "O Karim é um bom rapaz, sério e gentil. Confio nele.",
    },
  },
  {
    id: "o_deny",
    character: "odile",
    topics: ["accuse_direct"],
    requires: { notFlags: ["odile_cornered"] },
    line: {
      A2: "Moi ? Prendre ma propre boîte ? Vous plaisantez !",
      B1: "Moi ? Voler ma propre boîte ? Vous plaisantez, j'espère !",
      pt: "Eu? Roubar a minha própria caixa? Espero que esteja brincando!",
    },
  },
  {
    id: "o_silent",
    character: "odile",
    topics: ["accuse_direct", "why", "night", "shed"],
    priority: 20,
    requires: { flags: ["odile_cornered"] },
    line: {
      A2: "… Je n'ai rien à dire. Pas maintenant.",
      B1: "… Je préfère ne rien dire. Pas maintenant, s'il vous plaît.",
      pt: "… Prefiro não dizer nada. Agora não, por favor.",
    },
  },
  // Vérités d'Odile (après confrontation)
  {
    id: "o_admits",
    character: "odile",
    topics: ["night"],
    priority: 10,
    time: "22:50",
    requires: { flags: ["odile_admitted"] },
    line: {
      A2: "Karim a dit ça ? … Bon. Oui, je suis descendue. Je ne pouvais pas dormir. Mais je suis remontée tout de suite !",
      B1: "Karim vous a dit ça ?… Bon, d'accord. Je suis descendue, je n'arrivais pas à dormir. Mais je suis remontée presque tout de suite, je vous assure !",
      pt: "O Karim te disse isso?… Bom, está bem. Eu desci, não conseguia dormir. Mas subi quase na mesma hora, garanto!",
    },
    note: {
      fr: "Odile a menti : elle est descendue vers 22 h 50. Elle dit qu'elle est « remontée tout de suite ».",
      pt: "Odile mentiu: desceu por volta das 22h50. Diz que \"subiu logo em seguida\".",
    },
  },
  {
    id: "o_photo",
    character: "odile",
    topics: [],
    note: {
      fr: "Odile, émue : sa mère lui avait demandé de garder la boîte « toujours ».",
      pt: "Odile, emocionada: a mãe lhe pediu para guardar a caixa \"para sempre\".",
    },
    line: {
      A2: "C'est moi, petite, avec ma mère. Elle m'a dit : « Garde-la toujours. »",
      B1: "C'est moi, avec ma mère. Elle m'avait dit : « Garde-la toujours. »",
      pt: "Sou eu, com a minha mãe. Ela tinha me dito: \"Guarde-a para sempre.\"",
    },
  },
  {
    id: "o_cornered",
    character: "odile",
    topics: [],
    note: {
      fr: "Odile reconnaît son foulard, mais refuse d'expliquer comment la boîte est arrivée dans la cabane.",
      pt: "Odile reconhece o lenço, mas se recusa a explicar como a caixa foi parar na casinha.",
    },
    line: {
      A2: "Mon foulard…",
      B1: "Mon foulard…",
      pt: "Meu lenço…",
    },
  },
];

const r = (
  character: Reaction["character"],
  item: string,
  line: Reaction["line"],
  extra: Partial<Reaction> = {},
): Reaction => ({ character, item, line, ...extra });

const reactions: Reaction[] = [
  // --- Ticket du café
  r(
    "karim",
    "ticket",
    {
      A2: "Ce ticket… Il vient de la corbeille ? Bon… d'accord. Je suis sorti. De 23 heures à 23 h 45, j'étais au Café du Port pour voir la fin du match.",
      B1: "Ce ticket… vous l'avez trouvé dans la corbeille ? Bon… vous avez raison. Je suis sorti de 23 heures à 23 h 45, au Café du Port, pour voir la fin du match. J'ai écrit « RAS » pour ne pas avoir de problèmes.",
      pt: "Esse recibo… você achou no lixo? Bom… você tem razão. Saí das 23h às 23h45, fui ao Café du Port ver o fim do jogo. Escrevi \"nada a relatar\" para não ter problemas.",
    },
    { requires: { notFlags: ["karim_confessed"] }, sets: ["karim_confessed"], reveals: ["k_left"] },
  ),
  r("karim", "ticket", {
    A2: "Oui, je sais… Je vous ai dit la vérité : j'étais au café.",
    B1: "Oui, je sais… Je vous ai déjà tout avoué : j'étais au café pendant le match.",
    pt: "Sim, eu sei… Já te confessei tudo: eu estava no café durante o jogo.",
  }),
  r("odile", "ticket", {
    A2: "Un ticket du Café du Port ? Karim est sorti pendant son travail ? Je… je ne savais pas.",
    B1: "Un ticket du Café du Port, à 23 h 12 ? Karim aurait quitté son poste ? Je… je n'étais pas au courant.",
    pt: "Um recibo do Café du Port, às 23h12? O Karim teria saído do posto? Eu… eu não sabia.",
  }, { requires: { notFlags: ["odile_admitted"] } }),
  r("odile", "ticket", {
    A2: "Bon, oui. C'est moi qui lui ai dit d'y aller. Et alors ?",
    B1: "Bon, oui, c'est moi qui lui ai dit d'y aller. Ce n'est pas un crime.",
    pt: "Bom, sim, fui eu que disse para ele ir. Não é crime.",
  }),
  r("lambert", "ticket", {
    A2: "Un chocolat chaud au Café du Port, à 23 h 12 ? Ce n'est pas à moi. Je ne bois pas de chocolat.",
    B1: "Un chocolat chaud au Café du Port, à 23 h 12 ? Ce n'est pas à moi. Je ne bois que du thé, très cher.",
    pt: "Um chocolate quente no Café du Port, às 23h12? Não é meu. Eu só bebo chá, meu caro.",
  }),

  // --- Registre
  r("karim", "registre", {
    A2: "Oui, c'est mon registre. « RAS », ça veut dire « rien à signaler ».",
    B1: "C'est mon registre de nuit. « RAS » : rien à signaler. Je l'écris presque tous les soirs.",
    pt: "É o meu livro de registro da noite. \"RAS\": nada a relatar. Escrevo isso quase toda noite.",
  }, { requires: { notFlags: ["karim_confessed"] } }),
  r("karim", "registre", {
    A2: "Je sais… J'ai écrit « RAS », mais ce n'était pas vrai. Pardon.",
    B1: "Je sais… J'ai écrit « RAS », mais c'était faux. Je suis désolé.",
    pt: "Eu sei… Escrevi \"nada a relatar\", mas era mentira. Desculpe.",
  }),
  r("odile", "registre", {
    A2: "Karim écrit tout dans ce registre. C'est un garçon sérieux.",
    B1: "Karim note tout dans ce registre. C'est un garçon très sérieux.",
    pt: "O Karim anota tudo nesse registro. É um rapaz muito sério.",
  }),

  // --- Lunettes
  r(
    "lambert",
    "lunettes",
    {
      A2: "Ah… mes lunettes ! Bon, je vais vous dire la vérité. Vers 23 h 15, je suis descendu dans le jardin pour téléphoner. Dans ma chambre, il n'y a pas de réseau.",
      B1: "Mes lunettes… Où les avez-vous… ? Bon. Je vous dois la vérité. Vers 23 h 15, je suis descendu au jardin pour téléphoner, puisqu'il n'y a pas de réseau dans ma chambre. Je n'ai rien dit parce que ça me rendait suspect.",
      pt: "Meus óculos… Onde você os… ? Bom. Devo-lhe a verdade. Por volta das 23h15, desci ao jardim para telefonar, já que não há sinal no meu quarto. Não disse nada porque isso me tornava suspeito.",
    },
    { requires: { notFlags: ["lambert_confessed"] }, sets: ["lambert_confessed"], reveals: ["l_garden"] },
  ),
  r("lambert", "lunettes", {
    A2: "Oui, ce sont mes lunettes. Je vous ai déjà expliqué.",
    B1: "Oui, mes lunettes. Je vous ai déjà tout expliqué à ce sujet.",
    pt: "Sim, meus óculos. Já te expliquei tudo sobre isso.",
  }),
  r("karim", "lunettes", {
    A2: "R.L. ? Ce sont les lunettes de Monsieur Lambert, je crois. Il lit toujours au salon.",
    B1: "« R.L. »… Ce sont sûrement les lunettes de Monsieur Lambert. Il lit tous les soirs au salon.",
    pt: "\"R.L.\"… Devem ser os óculos do Sr. Lambert. Ele lê toda noite no salão.",
  }),
  r("odile", "lunettes", {
    A2: "Les lunettes de Lambert ? Dans mon jardin ? Vous voyez ! Il était dehors cette nuit !",
    B1: "Les lunettes de Lambert, dans mon jardin ? Vous voyez bien ! Il était dehors cette nuit, je vous l'avais dit !",
    pt: "Os óculos do Lambert, no meu jardim? Está vendo! Ele estava lá fora esta noite, eu te disse!",
  }),

  // --- Boîte retrouvée (avec le foulard)
  r(
    "karim",
    "boite",
    {
      A2: "Le Rossignol ! Il était dans la cabane ? Et ce foulard vert… c'est le foulard de Madame Fontaine !",
      B1: "Le Rossignol ! Dans la cabane du jardin ? Et ce foulard vert… mais c'est celui de Madame Fontaine, elle le porte tout le temps !",
      pt: "O Rossignol! Na casinha do jardim? E esse lenço verde… mas é o da Sra. Fontaine, ela usa o tempo todo!",
    },
    { reveals: ["k_scarf"] },
  ),
  r(
    "lambert",
    "boite",
    {
      A2: "Le Rossignol ! Il n'est pas cassé, heureusement. Et ce foulard avec « O.F. »… Odile Fontaine, non ?",
      B1: "Le Rossignol ! Intact, Dieu merci. Et ce foulard brodé « O.F. »… Odile Fontaine, évidemment. Tiens, tiens.",
      pt: "O Rossignol! Intacto, graças a Deus. E esse lenço bordado \"O.F.\"… Odile Fontaine, evidentemente. Ora, ora.",
    },
    { reveals: ["l_scarf"] },
  ),
  r(
    "odile",
    "boite",
    {
      A2: "Mon foulard… Je… Je ne veux pas en parler. Pas maintenant. Faites ce que vous devez faire.",
      B1: "Mon foulard… Je… Je ne veux pas en parler. Pas maintenant. Faites… faites ce que vous avez à faire.",
      pt: "Meu lenço… Eu… Não quero falar disso. Agora não. Faça… faça o que tiver que fazer.",
    },
    { sets: ["odile_cornered"], reveals: ["o_cornered"] },
  ),

  // --- Photo
  r(
    "odile",
    "photo",
    {
      A2: "Où avez-vous trouvé ça ? C'est moi, petite, avec ma mère. Elle m'a dit : « Garde-la toujours. »… Excusez-moi.",
      B1: "Où avez-vous trouvé ça ?… C'est moi, à huit ans, avec ma mère. Elle m'avait dit : « Garde-la toujours. »… Excusez-moi, je suis un peu émue.",
      pt: "Onde você achou isso?… Sou eu, aos oito anos, com a minha mãe. Ela tinha me dito: \"Guarde-a para sempre.\"… Desculpe, estou um pouco emocionada.",
    },
    { reveals: ["o_photo"] },
  ),
  r("lambert", "photo", {
    A2: "C'est touchant. Pour elle, ce n'est pas seulement un objet. C'est un souvenir de sa mère.",
    B1: "Touchant. Pour elle, ce n'est pas seulement un objet de valeur… c'est le souvenir de sa mère.",
    pt: "Comovente. Para ela, não é só um objeto de valor… é a lembrança da mãe.",
  }),
  r("karim", "photo", {
    A2: "C'est Madame Fontaine, petite, avec sa mère. Elle adore cette boîte.",
    B1: "C'est Madame Fontaine enfant, avec sa mère. Elle tient énormément à cette boîte.",
    pt: "É a Sra. Fontaine criança, com a mãe. Ela tem um apego enorme a essa caixa.",
  }),

  // --- Lettre de Julien
  r(
    "odile",
    "lettre",
    {
      A2: "Vous avez lu ma lettre ? … Oui. Julien veut vendre la boîte. Il a raison, je suppose.",
      B1: "Vous avez lu mon courrier ?… Bon. Oui, c'est Julien qui veut vendre. Il dit que c'est raisonnable. Il a sans doute raison.",
      pt: "Você leu a minha carta?… Bom. Sim, é o Julien que quer vender. Ele diz que é o sensato. Deve ter razão.",
    },
    { reveals: ["o_family_letter"] },
  ),
  r("lambert", "lettre", {
    A2: "Son fils veut vendre… Je comprends mieux. Peut-être qu'elle, elle ne voulait pas vendre.",
    B1: "C'est donc le fils qui pousse à la vente… Voilà qui explique bien des choses. Elle, je crois, n'en avait aucune envie.",
    pt: "Então é o filho que pressiona pela venda… Isso explica muita coisa. Ela, acho, não tinha a menor vontade.",
  }),
  r("karim", "lettre", {
    A2: "C'est le courrier de Madame Fontaine… Je préfère ne pas le lire.",
    B1: "C'est le courrier de Madame Fontaine… Je préfère ne pas lire ça, désolé.",
    pt: "É a correspondência da Sra. Fontaine… Prefiro não ler isso, desculpe.",
  }),

  // --- Traces de terre
  r("lambert", "terre", fact_line("l_shoes"), { reveals: ["l_shoes"] }),
  r("karim", "terre", {
    A2: "De la terre ? Je ne sais pas…",
    B1: "De la terre sur le tapis ? Aucune idée, je ne l'avais pas remarquée.",
    pt: "Terra no tapete? Não faço ideia, nem tinha reparado.",
  }, { requires: { notFlags: ["karim_confessed"] } }),
  r("karim", "terre", {
    A2: "Peut-être quand la porte-fenêtre était ouverte… Quelqu'un est entré du jardin ?",
    B1: "Ça doit dater du moment où la porte-fenêtre était ouverte… Quelqu'un est rentré du jardin ?",
    pt: "Deve ser do momento em que a porta-janela estava aberta… Alguém entrou vindo do jardim?",
  }),
  r("odile", "terre", {
    A2: "De la terre dans un hôtel avec un jardin… Il y en a partout !",
    B1: "De la terre, dans un hôtel avec un jardin ? Il y en a partout, voyons !",
    pt: "Terra, num hotel com jardim? Tem em todo lugar, ora!",
  }),

  // --- Vitrine
  r("lambert", "vitrine", fact_line("l_vitrine"), { reveals: ["l_vitrine"] }),
  r("odile", "vitrine", {
    A2: "Elle n'est pas cassée, oui. Il a pris la clé à la réception, c'est tout !",
    B1: "Elle n'est pas cassée, et alors ? Il a pris la clé à la réception, voilà tout !",
    pt: "Não está quebrada, e daí? Ele pegou a chave na recepção, simples assim!",
  }),
  r("karim", "vitrine", fact_line("k_key"), { reveals: ["k_key"] }),

  // --- Témoignages présentés
  r("odile", "k_odile_sent", {
    A2: "Karim a dit ça ? … Bon. Oui, je suis descendue. Je ne pouvais pas dormir. Mais je suis remontée tout de suite !",
    B1: "Karim vous a dit ça ?… Bon, d'accord. Je suis descendue, je n'arrivais pas à dormir. Mais je suis remontée presque tout de suite, je vous assure !",
    pt: "O Karim te disse isso?… Bom, está bem. Eu desci, não conseguia dormir. Mas subi quase na mesma hora, garanto!",
  }, { sets: ["odile_admitted"], reveals: ["o_admits"] }),
  r("lambert", "k_odile_sent", {
    A2: "Madame Fontaine était en bas vers 23 heures ? Tiens, tiens… Elle a dit qu'elle dormait.",
    B1: "Madame Fontaine était en bas vers 23 heures ? Tiens, tiens… Elle prétend pourtant avoir dormi toute la nuit.",
    pt: "A Sra. Fontaine estava lá embaixo perto das 23h? Ora, ora… E ela diz que dormiu a noite toda.",
  }),
  r("karim", "o_night_lie", {
    A2: "Elle dit qu'elle dormait ? Non ! À 22 h 50, elle était en bas, avec moi !",
    B1: "Elle prétend qu'elle dormait ? C'est faux : à 22 h 50, elle était en bas, avec moi !",
    pt: "Ela diz que estava dormindo? É mentira: às 22h50, ela estava lá embaixo, comigo!",
  }, { requires: { facts: ["k_odile_sent"] } }),
  r("karim", "o_night_lie", {
    A2: "Oui, elle se couche tôt, d'habitude.",
    B1: "Oui, d'habitude elle se couche tôt.",
    pt: "Sim, normalmente ela dorme cedo.",
  }),
  r("odile", "l_light", {
    A2: "Une lampe dans le jardin ? Ça peut être n'importe qui ! Ce n'est pas une preuve.",
    B1: "Une lampe de poche dans le jardin ? Ça pouvait être n'importe qui ! Ce n'est pas une preuve.",
    pt: "Uma lanterna no jardim? Podia ser qualquer um! Isso não é prova.",
  }),
  r("odile", "l_silhouette", {
    A2: "Une robe de chambre ? Beaucoup de gens ont une robe de chambre !",
    B1: "Une robe de chambre claire ? Tout le monde a une robe de chambre, enfin !",
    pt: "Um roupão claro? Todo mundo tem um roupão, ora!",
  }),
  r("karim", "l_light", {
    A2: "Quelqu'un dans le jardin ? C'est pour ça que la porte-fenêtre était ouverte !",
    B1: "Quelqu'un dans le jardin ? Voilà pourquoi la porte-fenêtre était ouverte !",
    pt: "Alguém no jardim? Por isso a porta-janela estava aberta!",
  }, { requires: { facts: ["k_left"] } }),
  r("lambert", "o_accuse_lambert", fact_line("l_photos"), { reveals: ["l_photos"] }),
  r("odile", "l_offer", fact_line("o_lambert_offer"), { reveals: ["o_lambert_offer"] }),
  r("odile", "k_scarf", {
    A2: "Oui, j'ai un foulard vert. Et alors ? Beaucoup de gens ont des foulards.",
    B1: "J'ai un foulard vert, oui. Et alors ? Ça ne prouve rien.",
    pt: "Tenho um lenço verde, sim. E daí? Isso não prova nada.",
  }, { requires: { notFlags: ["odile_cornered"] } }),
  r("odile", "l_scarf", {
    A2: "Oui, j'ai un foulard vert. Et alors ?",
    B1: "J'ai un foulard vert, oui. Et alors ? Ça ne prouve rien.",
    pt: "Tenho um lenço verde, sim. E daí? Isso não prova nada.",
  }, { requires: { notFlags: ["odile_cornered"] } }),
  r("karim", "l_night_lie", {
    A2: "Monsieur Lambert dans sa chambre ? Je ne sais pas… Moi, je n'étais pas toujours à la réception.",
    B1: "Monsieur Lambert dans sa chambre ? Je ne peux pas le confirmer… je n'étais pas toujours à la réception.",
    pt: "O Sr. Lambert no quarto? Não posso confirmar… eu não estava o tempo todo na recepção.",
  }, { requires: { facts: ["k_left"] } }),
];

function fact_line(id: string) {
  const f = facts.find((x) => x.id === id);
  if (!f) throw new Error(`fait inconnu ${id}`);
  return f.line;
}

export const GLYCINES: CaseDefinition = {
  id: CASE_ID,
  truth: {
    culprit: "odile",
    summary:
      "Odile Fontaine a caché elle-même le Rossignol dans la cabane du jardin, enveloppé dans son foulard, pour ne pas le vendre. Elle a éloigné Karim en l'envoyant voir le match.",
    timeline: [
      { time: "22:30", event: "Odile dit bonsoir et monte." },
      { time: "22:45", event: "Ronde de Karim : la boîte est dans la vitrine." },
      { time: "22:50", event: "Odile redescend et envoie Karim voir la fin du match." },
      { time: "23:00", event: "Karim part au Café du Port. La pluie commence." },
      { time: "23:05", event: "Odile prend la clé, ouvre la vitrine, prend la boîte." },
      { time: "23:15", event: "Lambert descend au jardin pour téléphoner." },
      { time: "23:20", event: "Odile va à la cabane avec une lampe de poche ; Lambert voit la lumière." },
      { time: "23:30", event: "Odile rentre (terre sur le tapis), remet la clé, remonte. Lambert rentre sous la pluie et oublie ses lunettes." },
      { time: "23:45", event: "Karim revient, ferme la porte-fenêtre, écrit « RAS »." },
      { time: "07:00", event: "Odile « découvre » le vol et accuse Lambert." },
    ],
  },
  clues: [
    {
      id: "vitrine",
      scene: "salon",
      hotspot: "vitrine",
      icon: "🔓",
      title: { fr: "La vitrine intacte", pt: "A vitrine intacta" },
      text: {
        A2: "La vitrine est vide, mais elle n'est pas cassée. La serrure est intacte : quelqu'un a ouvert la vitrine avec la clé.",
        B1: "La vitrine est vide, mais la vitre n'est pas brisée et la serrure n'a pas été forcée. Quelqu'un l'a ouverte avec la clé.",
        pt: "A vitrine está vazia, mas o vidro não está quebrado e a fechadura não foi forçada. Alguém a abriu com a chave.",
      },
    },
    {
      id: "registre",
      scene: "reception",
      hotspot: "registre",
      icon: "📒",
      title: { fr: "Le registre de nuit", pt: "O registro da noite" },
      text: {
        A2: "Le registre de Karim. Pour hier : « 23 h – minuit : RAS (rien à signaler). Réception surveillée. K. »",
        B1: "Le registre de nuit tenu par Karim. Hier soir, il a noté : « 23 h – 0 h : RAS. Réception surveillée en permanence. K. »",
        pt: "O livro de registro da noite do Karim. Ontem ele anotou: \"23h–0h: nada a relatar. Recepção vigiada o tempo todo. K.\"",
      },
    },
    {
      id: "ticket",
      scene: "reception",
      hotspot: "corbeille",
      icon: "🧾",
      title: { fr: "Le ticket du Café du Port", pt: "O recibo do Café du Port" },
      text: {
        A2: "Un ticket froissé dans la corbeille : « Café du Port — hier, 23 h 12 — 1 chocolat chaud, 2,50 € ». Au stylo : « Allez Brest ! »",
        B1: "Un ticket de caisse froissé, au fond de la corbeille : « Café du Port — hier, 23 h 12 — 1 chocolat chaud, 2,50 € ». Quelqu'un a griffonné : « Allez Brest ! »",
        pt: "Um recibo amassado no fundo da lixeira: \"Café du Port — ontem, 23h12 — 1 chocolate quente, 2,50 €\". Alguém rabiscou: \"Vai, Brest!\"",
      },
    },
    {
      id: "terre",
      scene: "salon",
      hotspot: "porte-fenetre",
      icon: "👣",
      title: { fr: "Les traces de terre", pt: "As marcas de terra" },
      text: {
        A2: "Devant la porte-fenêtre, il y a des traces de terre sur le tapis. Elles sont petites et rondes : des pantoufles, pas des chaussures d'homme.",
        B1: "Sur le tapis, devant la porte-fenêtre, des traces de terre séchée. Elles sont petites et arrondies : on dirait des pantoufles, pas de grosses chaussures.",
        pt: "No tapete, diante da porta-janela, marcas de terra seca. São pequenas e arredondadas: parecem de pantufas, não de sapatos grandes.",
      },
    },
    {
      id: "photo",
      scene: "salon",
      hotspot: "piano",
      icon: "🖼️",
      title: { fr: "La photo de 1971", pt: "A foto de 1971" },
      text: {
        A2: "Sur le piano, une vieille photo : une petite fille et sa mère devant le Rossignol. Au dos : « Pour ma petite Odile. Garde-la toujours. Maman, 1971. »",
        B1: "Sur le piano, une photo jaunie : une fillette et sa mère, souriantes, devant le Rossignol. Au dos, on lit : « Pour ma petite Odile. Garde-la toujours. Maman, 1971. »",
        pt: "Sobre o piano, uma foto amarelada: uma menina e a mãe, sorrindo, diante do Rossignol. No verso: \"Para a minha pequena Odile. Guarde-a para sempre. Mamãe, 1971.\"",
      },
    },
    {
      id: "lettre",
      scene: "reception",
      hotspot: "casier",
      icon: "✉️",
      title: { fr: "La lettre de Julien", pt: "A carta de Julien" },
      text: {
        A2: "Une lettre ouverte, tombée du casier : « Maman, l'antiquaire vient demain à midi. Le toit ne peut pas attendre. Je sais que c'est difficile, mais il faut vendre la boîte. Julien »",
        B1: "Une lettre ouverte, tombée du casier d'Odile : « Maman, l'antiquaire passe demain à midi. Le toit ne peut plus attendre. Je sais que c'est dur pour toi, mais il faut vendre la boîte. Ne change pas d'avis. Je t'embrasse, Julien »",
        pt: "Uma carta aberta, caída do escaninho da Odile: \"Mãe, o antiquário vem amanhã ao meio-dia. O telhado não pode mais esperar. Sei que é difícil para você, mas é preciso vender a caixa. Não mude de ideia. Um beijo, Julien\"",
      },
    },
    {
      id: "lunettes",
      scene: "jardin",
      hotspot: "banc",
      icon: "👓",
      title: { fr: "Les lunettes mouillées", pt: "Os óculos molhados" },
      text: {
        A2: "Sur le banc, des lunettes de lecture, toutes mouillées. Sur l'étui, deux lettres : « R.L. ».",
        B1: "Sur le banc, une paire de lunettes de lecture trempées par la pluie de la nuit. L'étui en cuir porte les initiales « R.L. ».",
        pt: "No banco, um par de óculos de leitura encharcados pela chuva da noite. O estojo de couro tem as iniciais \"R.L.\".",
      },
    },
    {
      id: "boite",
      scene: "jardin",
      hotspot: "cabane",
      icon: "🐦",
      title: { fr: "Le Rossignol, dans un foulard", pt: "O Rossignol, num lenço" },
      text: {
        A2: "Derrière les sacs de terreau : le Rossignol ! La boîte est dans un foulard vert. Sur le foulard, deux lettres brodées : « O.F. ».",
        B1: "Derrière les sacs de terreau, soigneusement caché : le Rossignol ! Il est enveloppé dans un foulard de soie verte, brodé des initiales « O.F. ».",
        pt: "Atrás dos sacos de terra, cuidadosamente escondido: o Rossignol! Está embrulhado num lenço de seda verde, bordado com as iniciais \"O.F.\".",
      },
    },
  ],
  examine: [
    { hotspot: "registre", text: line("Vous ouvrez le registre de nuit.", "Vous feuilletez le registre posé sur le comptoir.", "Você folheia o livro de registro sobre o balcão."), clue: "registre" },
    { hotspot: "corbeille", text: line("Vous regardez dans la corbeille…", "Vous fouillez discrètement la corbeille…", "Você revira discretamente a lixeira…"), clue: "ticket" },
    { hotspot: "casier", text: line("Une lettre est tombée par terre.", "Une enveloppe ouverte a glissé du casier d'Odile.", "Um envelope aberto escorregou do escaninho da Odile."), clue: "lettre" },
    {
      hotspot: "tableau-cles",
      text: line(
        "Le tableau des clés. Il y a une petite clé avec l'étiquette « Vitrine ». Elle est à sa place.",
        "Le tableau des clés, derrière le comptoir. La petite clé étiquetée « Vitrine » est accrochée à sa place, comme si de rien n'était.",
        "O quadro de chaves, atrás do balcão. A chavinha com a etiqueta \"Vitrine\" está no lugar, como se nada tivesse acontecido.",
      ),
    },
    {
      hotspot: "sonnette",
      text: line("Ding ! Karim lève la tête. « Oui ? Je suis là ! »", "Ding ! Karim sursaute. « Oui, oui, je suis là ! »", "Ding! Karim leva um susto. \"Sim, sim, estou aqui!\""),
    },
    { hotspot: "vitrine", text: line("Vous regardez la vitrine de près.", "Vous examinez la vitrine de près.", "Você examina a vitrine de perto."), clue: "vitrine" },
    { hotspot: "porte-fenetre", text: line("Vous regardez le tapis devant la porte-fenêtre.", "Vous vous penchez sur le tapis, devant la porte-fenêtre.", "Você se inclina sobre o tapete, diante da porta-janela."), clue: "terre" },
    { hotspot: "piano", text: line("Il y a des photos sur le piano.", "Plusieurs cadres sont posés sur le piano.", "Vários porta-retratos estão sobre o piano."), clue: "photo" },
    {
      hotspot: "cheminee",
      text: line(
        "La cheminée est froide. Il y a un vieux livre : « Les oiseaux de Normandie ».",
        "La cheminée est éteinte depuis longtemps. Sur le rebord, un vieux livre : « Les oiseaux de Normandie ».",
        "A lareira está apagada há tempos. No parapeito, um livro antigo: \"As aves da Normandia\".",
      ),
    },
    { hotspot: "banc", text: line("Le banc est encore mouillé.", "Le banc est encore humide de la pluie de la nuit.", "O banco ainda está úmido da chuva da noite."), clue: "lunettes" },
    {
      hotspot: "cabane",
      requires: { facts: ["l_light"] },
      text: line(
        "Vous entrez dans la cabane. Lambert a vu une lumière ici… Vous cherchez bien.",
        "Vous entrez dans la cabane. Si la lampe de poche est venue jusqu'ici, il y a forcément quelque chose… Vous fouillez.",
        "Você entra na casinha. Se a lanterna veio até aqui, deve haver alguma coisa… Você procura.",
      ),
      clue: "boite",
    },
    {
      hotspot: "cabane",
      text: line(
        "Une vieille cabane en bois. Des outils, des pots, des sacs de terreau. Rien de spécial… pour le moment.",
        "Une vieille cabane en bois : des outils, des pots de fleurs, des sacs de terreau. À première vue, rien de particulier.",
        "Uma velha casinha de madeira: ferramentas, vasos, sacos de terra. À primeira vista, nada de especial.",
      ),
    },
    {
      hotspot: "glycine",
      text: line(
        "Une très vieille glycine, avec de grosses branches. C'est elle qui donne son nom à l'hôtel.",
        "Une glycine centenaire couvre tout le mur. C'est elle qui a donné son nom à l'hôtel.",
        "Uma glicínia centenária cobre todo o muro. Foi ela que deu nome ao hotel.",
      ),
    },
    {
      hotspot: "fontaine",
      text: line(
        "Une petite fontaine. Il y a des pièces de monnaie dans l'eau.",
        "Une petite fontaine en pierre. Quelques pièces brillent au fond : des vœux de clients.",
        "Uma pequena fonte de pedra. Algumas moedas brilham no fundo: desejos de hóspedes.",
      ),
    },
  ],
  facts,
  reactions,
  personas: {
    karim: {
      character: "karim",
      description:
        "Karim Haddad, 23 ans, réceptionniste de nuit à l'Hôtel des Glycines et étudiant en tourisme. Il a fini son service et il est fatigué. Il aime le football (il est supporter du Stade Brestois).",
      style:
        "Jeune, sympathique, un peu nerveux. Il vouvoie le joueur. Phrases simples, quelques expressions familières (« bon », « franchement », « je vous jure »).",
      stance: "Il veut garder son travail. Il dit qu'il n'a rien vu de spécial cette nuit.",
      clarify: [
        line("Pardon ? Je n'ai pas bien compris. Vous pouvez répéter ?", "Pardon, je n'ai pas bien compris. Vous pouvez reformuler ?", "Desculpe, não entendi bem. Pode reformular?"),
        line("Euh… Vous pouvez poser la question autrement ?", "Euh… je ne suis pas sûr de comprendre. Vous voulez savoir quoi, exactement ?", "Hã… não tenho certeza se entendi. O que você quer saber, exatamente?"),
      ],
      meta: line(
        "Je ne comprends pas… Moi, je suis réceptionniste. Je ne sais pas qui a pris la boîte !",
        "Je ne vois pas de quoi vous parlez… Je suis juste le réceptionniste, moi. Si je savais qui a pris la boîte, je vous le dirais !",
        "Não sei do que você está falando… Sou só o recepcionista. Se eu soubesse quem pegou a caixa, eu te diria!",
      ),
      offtopic: line(
        "Je ne sais pas… Posez-moi des questions sur hier soir, plutôt.",
        "Ça, je ne sais pas trop… Si vous voulez, posez-moi plutôt des questions sur la nuit dernière.",
        "Isso eu não sei muito bem… Se quiser, me pergunte sobre a noite passada.",
      ),
      notFrench: line(
        "Pardon, je ne comprends pas. En français, s'il vous plaît ?",
        "Désolé, je ne parle pas cette langue. Vous pouvez essayer en français ? Même simplement, ça ira.",
        "Desculpe, não falo essa língua. Pode tentar em francês? Mesmo simples, tudo bem.",
      ),
      genericPresent: line(
        "Hmm… Je ne sais pas quoi vous dire sur ça.",
        "Hmm… franchement, je ne vois pas ce que je peux vous dire là-dessus.",
        "Hmm… sinceramente, não sei o que posso dizer sobre isso.",
      ),
      greeting: line(
        "Bonjour ! Bienvenue à l'Hôtel des Glycines. Enfin… ce n'est pas une très bonne journée.",
        "Bonjour, bienvenue à l'Hôtel des Glycines ! Bon… vous n'arrivez pas au meilleur moment, je dois dire.",
        "Bom dia, bem-vindo(a) ao Hôtel des Glycines! Bom… você não chegou no melhor momento, devo dizer.",
      ),
    },
    lambert: {
      character: "lambert",
      description:
        "Rémi Lambert, environ 55 ans, collectionneur de boîtes à musique et d'automates, client de la chambre 3 depuis trois jours. Madame Fontaine l'accuse du vol et il est très vexé.",
      style:
        "Cultivé, un peu prétentieux, aime les mots précis et les tournures élégantes. Il vouvoie toujours. Il s'agace facilement mais reste poli.",
      stance: "Il est innocent et il le répète. Il dit qu'il a passé la soirée dans sa chambre.",
      clarify: [
        line("Pardon ? Je ne comprends pas votre question.", "Pardon ? Je crains de ne pas saisir votre question. Soyez plus précis·e.", "Perdão? Receio não ter entendido sua pergunta. Seja mais preciso(a)."),
        line("Pouvez-vous répéter, s'il vous plaît ?", "Auriez-vous l'amabilité de reformuler ?", "Teria a gentileza de reformular?"),
      ],
      meta: line(
        "Je ne sais pas de quoi vous parlez. Moi, je veux seulement prouver que je suis innocent.",
        "Je ne vois pas du tout de quoi vous parlez. Tout ce que je veux, c'est qu'on cesse de m'accuser.",
        "Não faço ideia do que você está falando. Só quero que parem de me acusar.",
      ),
      offtopic: line(
        "Ce n'est pas très important. Parlons plutôt de cette boîte, non ?",
        "Voilà qui n'a guère d'intérêt. Revenons plutôt à cette malheureuse boîte, voulez-vous ?",
        "Isso não tem grande interesse. Voltemos a essa infeliz caixa, sim?",
      ),
      notFrench: line(
        "Pardon ? En français, s'il vous plaît.",
        "Je vous prie de m'excuser, mais nous sommes en France : en français, s'il vous plaît.",
        "Peço desculpas, mas estamos na França: em francês, por favor.",
      ),
      genericPresent: line(
        "Je ne vois pas le rapport avec moi.",
        "Je ne vois pas bien le rapport avec ma personne.",
        "Não vejo bem a relação disso comigo.",
      ),
      greeting: line(
        "Bonjour. Vous êtes là pour la boîte, vous aussi ? Je n'ai rien fait, je vous préviens !",
        "Bonjour. Vous venez pour la boîte, je suppose ? Je vous préviens tout de suite : je n'y suis pour rien.",
        "Bom dia. Veio pela caixa, imagino? Já aviso: não tenho nada a ver com isso.",
      ),
    },
    odile: {
      character: "odile",
      description:
        "Odile Fontaine, 67 ans, propriétaire de l'Hôtel des Glycines, que sa mère a ouvert en 1965. Elle est dans son jardin, près de la glycine, et elle semble bouleversée.",
      style:
        "Chaleureuse mais nerveuse et émotive. Elle vouvoie. Elle s'agite quand on parle de la nuit et s'attendrit quand on parle de sa mère. Phrases parfois inachevées (« Je… enfin… »).",
      stance: "Elle est sûre que Monsieur Lambert a volé la boîte. Elle dit qu'elle a dormi toute la nuit.",
      clarify: [
        line("Pardon ? Je n'ai pas compris. Vous pouvez répéter ?", "Pardon, je n'ai pas bien compris, avec toutes ces émotions… Vous pouvez répéter ?", "Desculpe, não entendi bem, com toda essa emoção… Pode repetir?"),
        line("Excusez-moi… Qu'est-ce que vous voulez dire ?", "Excusez-moi… qu'est-ce que vous voulez dire exactement ?", "Desculpe… o que você quer dizer exatamente?"),
      ],
      meta: line(
        "Je ne comprends pas. Moi, je veux retrouver ma boîte. C'est Lambert, j'en suis sûre !",
        "Je ne comprends rien à ce que vous dites. Moi, je veux juste retrouver ma boîte. Allez plutôt interroger Lambert !",
        "Não entendo nada do que você diz. Eu só quero achar a minha caixa. Vá interrogar o Lambert!",
      ),
      offtopic: line(
        "Je ne sais pas… Je pense seulement à ma boîte, vous savez.",
        "Oh, je ne sais pas… Excusez-moi, je n'arrive à penser qu'à ma boîte.",
        "Ah, não sei… Desculpe, só consigo pensar na minha caixa.",
      ),
      notFrench: line(
        "Pardon ? Je ne parle que français, moi.",
        "Pardon ? Je suis désolée, je ne parle que français.",
        "Perdão? Sinto muito, só falo francês.",
      ),
      genericPresent: line(
        "Je ne sais pas… Ça ne me dit rien.",
        "Je ne sais pas… Ça ne me dit rien du tout.",
        "Não sei… Isso não me diz nada.",
      ),
      greeting: line(
        "Bonjour… Vous venez pour le Rossignol ? Il a disparu ! C'est terrible.",
        "Bonjour… Vous êtes l'envoyé·e de Monsieur Delorme ? Oh, c'est terrible, le Rossignol a disparu !",
        "Bom dia… Você é o(a) enviado(a) do Sr. Delorme? Ah, é terrível, o Rossignol sumiu!",
      ),
    },
  },
  evidence: {
    // mensonge sur la nuit
    k_odile_sent: { category: "lie", strength: "strong" },
    o_admits: { category: "lie", strength: "strong" },
    // lien matériel avec la cachette
    boite: { category: "link", strength: "strong" },
    k_scarf: { category: "link", strength: "strong" },
    l_scarf: { category: "link", strength: "strong" },
    o_cornered: { category: "link", strength: "strong" },
    terre: { category: "link", strength: "weak" },
    l_light: { category: "link", strength: "weak" },
    l_silhouette: { category: "link", strength: "weak" },
    l_shoes: { category: "link", strength: "weak" },
    // mobile
    photo: { category: "motive", strength: "strong" },
    o_photo: { category: "motive", strength: "strong" },
    lettre: { category: "motive", strength: "strong" },
    o_family_letter: { category: "motive", strength: "strong" },
    l_offer: { category: "motive", strength: "weak" },
    o_lambert_offer: { category: "motive", strength: "weak" },
  },
  endings: {
    perfect: {
      title: { fr: "Affaire résolue — le cœur du Rossignol", pt: "Caso resolvido — o coração do Rossignol" },
      story: [
        line(
          "Odile regarde vos trois preuves. Elle ne dit rien pendant un long moment. Puis elle pleure doucement.",
          "Odile regarde longuement les trois preuves que vous posez devant elle. Puis ses épaules tombent, et elle se met à pleurer doucement.",
          "Odile olha demoradamente as três provas que você coloca diante dela. Então seus ombros caem, e ela começa a chorar baixinho.",
        ),
        line(
          "« Oui, c'est moi. Ma mère m'a dit : garde-la toujours. Julien veut vendre… Je n'ai pas pu dire non. Alors j'ai caché la boîte. Et j'ai accusé Monsieur Lambert. C'était mal. »",
          "« Oui… c'est moi. Ma mère m'avait fait promettre de la garder toujours. Julien voulait vendre, et je n'ai pas eu le courage de lui dire non. Alors j'ai inventé un vol… et j'ai accusé Monsieur Lambert. C'était indigne de moi. »",
          "\"Sim… fui eu. Minha mãe me fez prometer guardá-la para sempre. Julien queria vender, e eu não tive coragem de dizer não. Então inventei um roubo… e acusei o Sr. Lambert. Foi indigno de mim.\"",
        ),
        line(
          "À midi, Monsieur Delorme arrive. Odile téléphone à Julien et dit enfin la vérité. Monsieur Lambert accepte ses excuses.",
          "À midi, Monsieur Delorme arrive. Odile appelle Julien et lui dit enfin ce qu'elle ressent. Monsieur Lambert, beau joueur, accepte ses excuses — et propose de prêter de l'argent pour le toit, à condition de pouvoir écouter le Rossignol chaque été.",
          "Ao meio-dia, o Sr. Delorme chega. Odile liga para Julien e finalmente diz o que sente. O Sr. Lambert, elegante, aceita as desculpas — e se oferece para emprestar dinheiro para o telhado, desde que possa ouvir o Rossignol todo verão.",
        ),
        line(
          "Le Rossignol retourne dans sa vitrine. Ce soir, il chante pour tout l'hôtel.",
          "Le Rossignol retrouve sa vitrine. Ce soir-là, pour la première fois depuis longtemps, il chante pour tout l'hôtel.",
          "O Rossignol volta para a vitrine. Naquela noite, pela primeira vez em muito tempo, ele canta para o hotel inteiro.",
        ),
      ],
    },
    solved: {
      title: { fr: "Affaire résolue", pt: "Caso resolvido" },
      story: [
        line(
          "Odile regarde vos preuves. Elle soupire. « Bon… Oui. C'est moi qui ai caché la boîte. »",
          "Odile examine vos preuves et soupire longuement. « Bon… Vous avez gagné. C'est moi qui ai caché la boîte. »",
          "Odile examina suas provas e suspira longamente. \"Bom… Você venceu. Fui eu que escondi a caixa.\"",
        ),
        line(
          "Elle explique : elle ne voulait pas vendre le souvenir de sa mère, mais elle n'osait pas le dire à son fils.",
          "Elle vous explique qu'elle ne supportait pas l'idée de vendre le souvenir de sa mère, mais qu'elle n'osait pas tenir tête à son fils.",
          "Ela explica que não suportava a ideia de vender a lembrança da mãe, mas não tinha coragem de enfrentar o filho.",
        ),
        line(
          "Monsieur Delorme repart sans la boîte, mais avec une bonne histoire. Votre enquête est juste… même si tous les détails ne sont pas encore clairs.",
          "Monsieur Delorme repart sans la boîte, mais avec une belle histoire à raconter. Votre conclusion est juste, même si votre dossier aurait pu être plus complet.",
          "O Sr. Delorme vai embora sem a caixa, mas com uma bela história para contar. Sua conclusão está certa, mesmo que o dossiê pudesse estar mais completo.",
        ),
      ],
    },
    wrong: {
      karim: {
        title: { fr: "Fausse piste", pt: "Pista falsa" },
        story: [
          line(
            "Karim est blanc comme un mur. « Moi ? Mais j'étais au café ! » Madame Fontaine baisse les yeux… et ne dit rien.",
            "Karim devient blanc comme un linge. « Moi ? Mais j'étais au café, tout le monde m'a vu ! » Madame Fontaine baisse les yeux et garde le silence.",
            "Karim fica branco como papel. \"Eu? Mas eu estava no café, todo mundo me viu!\" A Sra. Fontaine baixa os olhos e fica em silêncio.",
          ),
          line(
            "Le soir, Odile vient vous voir. Elle a honte : c'est elle qui a caché la boîte. Elle vous raconte tout.",
            "Le soir même, rongée par la culpabilité, Odile vient vous trouver : c'est elle qui a caché la boîte. Elle vous raconte tout.",
            "Na mesma noite, corroída pela culpa, Odile vem te procurar: foi ela que escondeu a caixa. Ela te conta tudo.",
          ),
        ],
      },
      lambert: {
        title: { fr: "Fausse piste", pt: "Pista falsa" },
        story: [
          line(
            "Monsieur Lambert est furieux. « Moi ? J'ai déjà dit la vérité ! » Il appelle son avocat.",
            "Monsieur Lambert devient écarlate. « C'est un scandale ! » Il quitte l'hôtel en menaçant d'appeler son avocat.",
            "O Sr. Lambert fica vermelho. \"É um escândalo!\" Ele deixa o hotel ameaçando chamar o advogado.",
          ),
          line(
            "Odile semble soulagée… mais le soir, elle ne peut pas dormir. Elle vient vous voir : c'est elle qui a caché la boîte.",
            "Odile paraît soulagée… mais le soir, incapable de dormir, elle vient vous avouer la vérité : c'est elle qui a caché la boîte.",
            "Odile parece aliviada… mas à noite, sem conseguir dormir, vem te confessar a verdade: foi ela que escondeu a caixa.",
          ),
        ],
      },
      odile: { title: { fr: "", pt: "" }, story: [] },
    },
    explanation: [
      {
        fr: "22 h 50 — Odile redescend et envoie Karim voir la fin du match : « je surveille la réception, ça reste entre nous ». Elle a la réception pour elle seule.",
        pt: "22h50 — Odile desce e manda Karim ver o fim do jogo: \"eu vigio a recepção, fica entre nós\". Ela fica sozinha com a recepção.",
      },
      {
        fr: "23 h 05 — Elle prend la clé au tableau et ouvre la vitrine sans la casser.",
        pt: "23h05 — Ela pega a chave no quadro e abre a vitrine sem quebrá-la.",
      },
      {
        fr: "23 h 20 — Avec une lampe de poche, elle sort par la porte-fenêtre et cache la boîte dans la cabane, enveloppée dans son foulard. Lambert, qui téléphone dans le jardin, voit la lumière.",
        pt: "23h20 — Com uma lanterna, ela sai pela porta-janela e esconde a caixa na casinha, embrulhada no seu lenço. Lambert, que telefonava no jardim, vê a luz.",
      },
      {
        fr: "23 h 30 — Elle rentre en pantoufles (les petites traces de terre), remet la clé et remonte, sans bien refermer la porte-fenêtre.",
        pt: "23h30 — Ela volta de pantufas (as pequenas marcas de terra), devolve a chave e sobe, sem fechar direito a porta-janela.",
      },
      {
        fr: "23 h 45 — Karim revient, ferme la porte-fenêtre et écrit « RAS » pour cacher sa sortie.",
        pt: "23h45 — Karim volta, fecha a porta-janela e escreve \"nada a relatar\" para esconder sua saída.",
      },
      {
        fr: "Pourquoi ? Sa mère lui avait demandé de garder la boîte « toujours ». Son fils Julien voulait la vendre. Odile n'a pas osé dire non : elle a fait croire à un vol… et a accusé Lambert.",
        pt: "Por quê? A mãe dela pediu que guardasse a caixa \"para sempre\". O filho, Julien, queria vendê-la. Odile não teve coragem de dizer não: simulou um roubo… e acusou Lambert.",
      },
      {
        fr: "Karim et Lambert ont menti, mais pas pour cacher le vol : Karim avait peur pour son travail, Lambert avait honte de son coup de téléphone.",
        pt: "Karim e Lambert mentiram, mas não para esconder o roubo: Karim temia pelo emprego, Lambert tinha vergonha do telefonema.",
      },
    ],
  },
  rebuttals: {
    insufficient: line(
      "« Moi ? Vous n'avez pas de preuves ! » Odile croise les bras. Votre dossier n'est pas assez solide. Continuez l'enquête.",
      "« Moi ? Et sur quelles preuves, je vous prie ? » Odile croise les bras. Votre dossier ne tient pas encore. Continuez l'enquête.",
      "\"Eu? E com que provas, por favor?\" Odile cruza os braços. Seu dossiê ainda não se sustenta. Continue a investigação.",
    ),
    missing: {
      lie: {
        fr: "Il manque une preuve qu'elle a menti sur sa nuit.",
        pt: "Falta uma prova de que ela mentiu sobre a noite dela.",
      },
      link: {
        fr: "Il manque une preuve matérielle qui la relie à la cachette.",
        pt: "Falta uma prova material que a ligue ao esconderijo.",
      },
      motive: {
        fr: "Il manque une raison : pourquoi aurait-elle fait ça ?",
        pt: "Falta um motivo: por que ela teria feito isso?",
      },
    },
  },
};

function line(A2: string, B1: string, pt: string) {
  return { A2, B1, pt };
}
