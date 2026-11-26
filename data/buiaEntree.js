/* ============================================================
   Module « Bien utiliser l'IA » : textes de l'écran d'entrée et de la page de présentation.
   Source unique de ces textes : la page les lit, le test (tests/bienUtiliserIaLogique.test.js) les contrôle.
   Décisions de Denis (consignes 587 à 595, puis 596 à 599) : un seul module, quatre chemins (Comprendre, Comment il fonctionne, Mes modèles, Écrire ma propre demande) ;
   ordre des boutons : Comprendre, Comment il fonctionne, Mes modèles, Écrire ; aucun chemin n'est conseillé ni mis en avant (décision de Denis du 25/11/2026 : le module ne sait pas pourquoi la personne est là), chaque tuile porte une phrase « Choisissez ce chemin si » (champ `quand`) ;
   le mot « IA » est permis dans ce module seulement (dérogation du 22/11/2026) ; on écrit « demande », « prompt » seulement dans le Lexique ;
   « assistant en ligne », jamais d'icône de robot ni de visage.
   Maquette : docs/maquettes/maquette-bien-utiliser-ia-entree-2026-11-23.html. Plan : docs/AUDIT_ET_PLAN_BIEN_UTILISER_L_IA_2026-11-23.md.
   Avant l'ouverture au public (commit 9) : ajouter la mention de la vidéo au chemin « Comprendre » quand elle existera.
   ============================================================ */

var BUIA_NOM = 'Bien utiliser l’IA';
var BUIA_SOUS_TITRE = 'Apprenez à écrire une demande claire et à vérifier la réponse.';
var BUIA_ICONE = 'bi-chat-left-text';

var BUIA_CHEMINS = [
  {
    id: 'comprendre', icone: 'bi-book', titre: 'Je veux comprendre',
    quand: 'vous n’avez jamais utilisé d’assistant en ligne, ou si vous ne savez pas par où commencer.',
    texte: 'Pourquoi une demande claire change la réponse, et comment la vérifier.',
    detail: 'Rien à écrire. Huit écrans à lire, pour tous les sujets : emploi, santé, administration, voyage.',
    bouton: 'Commencer à comprendre'
  },
  {
    id: 'fonctionne', icone: 'bi-gear-wide-connected', titre: 'Je veux savoir comment il fonctionne',
    quand: 'vous vous demandez comment un assistant fonctionne et d’où vient ce qu’il sait.',
    texte: 'Ce qu’est un assistant, comment il écrit, d’où vient ce qu’il sait, la recherche web, ce qui distingue les différents assistants, les projets et la mémoire, et les cas où s’en passer.',
    detail: 'Rien à écrire. Huit étapes à lire.',
    bouton: 'Découvrir comment il fonctionne'
  },
  {
    id: 'modeles', icone: 'bi-envelope-paper', titre: 'J’ai un papier ou une situation',
    quand: 'vous avez un courrier, un mail ou une démarche devant vous.',
    texte: 'Un courrier, un mail, une démarche, une recherche d’emploi : la demande est déjà écrite, vous la complétez et vous la copiez.',
    detail: 'Vous pouvez coller votre papier : l’application vous propose le bon modèle. Des modèles existent aussi pour les professionnels.',
    bouton: 'Trouver mon modèle'
  },
  {
    id: 'ecrire', icone: 'bi-pencil-square', titre: 'Je veux écrire ma propre demande',
    quand: 'vous avez déjà utilisé un assistant et que votre sujet n’est pas dans les modèles.',
    texte: 'Pour un sujet que les modèles ne couvrent pas : une lettre à une ambassade, un rendez-vous à l’hôpital, un voyage.',
    detail: 'Vous la construisez pas à pas, puis vous la relisez et vous l’améliorez.',
    bouton: 'Écrire la mienne'
  }
];

var BUIA_REASSURANCE = [
  { titre: 'Aucune note, aucun test', texte: 'Ce module est là pour vous aider, pas pour vous évaluer.' },
  { titre: 'Rien n’est envoyé d’ici', texte: 'Vos textes restent sur cet appareil. Vous copiez votre demande, puis vous la collez vous-même dans l’assistant de votre choix.' },
  { titre: 'Vérifiez toujours la réponse', texte: 'Un assistant peut se tromper ou inventer. Le module vous montre comment relire.' }
];

// Nombre en lettres pour les phrases de la présentation (jamais un chiffre qui vieillit : le nombre vient du code, le mot est écrit ici).
function buiaNombreEnLettres(n) {
  var t = { 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix', 12: 'douze', 15: 'quinze', 20: 'vingt', 30: 'trente' };
  return t[n] || String(n);
}

// Page de présentation du module (décision de Denis du 25/11/2026 : « enrichir la présentation », maquette docs/maquettes/maquette-bien-utiliser-ia-presentation-2026-11-25.html).
// Source unique des textes : index.js les lit, le test (tests/bienUtiliserIaLogique.test.js, tests/bienUtiliserIaPresentation.test.js) les contrôle. Les chemins sont lus dans BUIA_CHEMINS,
// les familles de modèles dans BUIA_FAMILLES et le plafond de « Mes demandes » dans BUIA_GARDE_MAX : aucun nom ni nombre recopié. Aucun nom de produit, aucun chiffre qui vieillit.
var BUIA_PRESENTATION = {
  accroche: '<strong>Ni test, ni note.</strong> Vous apprenez à demander clairement, à votre rythme.',
  ceSert: {
    titre: 'À quoi ça sert',
    paragraphes: [
      'Un assistant en ligne ne devine rien : il répond à ce que vous écrivez. Une demande claire donne une réponse plus utile, et une réponse relue avec soin évite les erreurs.',
      'Ce module vous montre comment écrire cette demande, pour une démarche, un courrier, une recherche d’emploi ou n’importe quel autre sujet, et comment vérifier ce que l’assistant répond.'
    ]
  },
  chemins: {
    titre: 'Quatre chemins',
    niveaux: { titre: 'Deux niveaux de lecture.', texte: 'Pour « Je veux comprendre » et « Je veux savoir comment il fonctionne », « Les bases » suffit pour commencer. « Pour aller plus loin » ajoute des explications.' }
  },
  trouve: {
    titre: 'Ce que vous y trouvez',
    items: [
      { icone: 'bi-pencil-square', titre: 'Des exercices courts.', texte: 'Réparer une demande trop vague, repérer ce qui se vérifie dans une réponse, voir la différence entre deux demandes. Les cas sont inventés : vous n’avez rien de personnel à écrire, et rien n’est noté.' },
      { icone: 'bi-envelope-paper', titre: 'Des modèles déjà écrits.', texte: function (familles) { return 'Ils sont rangés en ' + buiaNombreEnLettres(familles.length) + ' familles : ' + familles.join(', ') + '. Vous complétez, puis vous copiez.'; } },
      { icone: 'bi-eraser', titre: 'Un coup de pouce pour protéger votre papier.', texte: 'Si vous collez un courrier, l’application peut masquer les numéros et les courriels avant que vous copiez. Les noms et les adresses, vous les masquez vous-même.' },
      { icone: 'bi-lightbulb', titre: 'Des repères sur les assistants.', texte: 'Comment un assistant écrit ses phrases, d’où vient ce qu’il sait, quand activer la recherche web, ce qui distingue les différents assistants, et les cas où il vaut mieux s’en passer.' }
    ]
  },
  garde: {
    titre: 'Ce que vous gardez',
    paragraphes: [
      function (max) { return 'Quand une demande marche bien, vous pouvez l’ajouter à votre disquette (' + buiaNombreEnLettres(max) + ' au plus). Vous la retrouvez ensuite dans « Mes demandes », au chemin « J’ai un papier ou une situation », prête à resservir.'; },
      'Rien d’autre n’est gardé : le papier que vous collez et la réponse de l’assistant restent sur la page et ne sont pas enregistrés. Rien ne quitte votre appareil, sauf ce que vous copiez vous-même.'
    ]
  },
  pro: {
    titre: 'Pour les professionnels',
    intro: 'Vous accompagnez des personnes ? Une famille de modèles est écrite pour vous : synthèse de notes d’entretien, compte rendu ou bilan, document passé en langage simple.',
    items: [
      { titre: 'Des questions à poser à votre structure', texte: ' avant d’utiliser un assistant : lesquels sont autorisés, quelles informations ne jamais envoyer, qui vérifie, où garder les textes produits. Le module ne dicte aucune règle à votre place.' },
      { titre: 'Une grille pour tester vos demandes', texte: ' sur des cas fictifs, et les rejouer quand l’assistant change.' },
      { titre: 'Le partage entre collègues.', texte: ' Vous pouvez préparer quelques-unes de vos demandes dans un petit fichier, après les avoir relues, et en recevoir d’un collègue. Le contenu est montré avant tout ajout.' }
    ]
  },
  sources: {
    titre: 'D’où viennent les informations',
    paragraphes: [
      'Ce que le module dit des assistants (leurs réglages, leur mémoire, ce qu’ils gardent) a été relu sur les pages officielles de leurs éditeurs. Ces pages changent vite : la date de la dernière relecture est affichée dans le chemin « Je veux savoir comment il fonctionne », et le contenu est relu régulièrement.',
      'En cas de doute, la page officielle de l’assistant que vous utilisez fait foi.'
    ]
  },
  nePasFaire: {
    titre: 'Ce que ce module ne fait pas',
    items: [
      'Il n’envoie rien : vous copiez votre demande et vous la collez vous-même dans l’assistant de votre choix.',
      'Il ne garde rien sur cet appareil, sauf les demandes que vous ajoutez vous-même à votre disquette.',
      'Il ne rédige pas de courrier pour contester une décision ou faire un recours : une personne qui vous accompagne peut vous aider.',
      'Il ne remplace pas une personne, ni un professionnel.',
      'Il ne classe pas les assistants et ne recommande aucun abonnement payant.',
      'Il ne dit jamais si une réponse est juste : il vous apprend à la vérifier.'
    ]
  },
  cta: 'Ouvrir le module &#8594;'
};

// Message affiché tant qu'un chemin n'est pas construit (le module est fermé au public pendant ce temps : seul le poste de Denis le voit).
var BUIA_EN_CONSTRUCTION = 'Ce chemin n’est pas encore construit. Il sera disponible avant l’ouverture du module au public.';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUIA_NOM: BUIA_NOM, BUIA_SOUS_TITRE: BUIA_SOUS_TITRE, BUIA_ICONE: BUIA_ICONE, BUIA_CHEMINS: BUIA_CHEMINS,
    BUIA_REASSURANCE: BUIA_REASSURANCE, BUIA_EN_CONSTRUCTION: BUIA_EN_CONSTRUCTION,
    BUIA_PRESENTATION: BUIA_PRESENTATION, buiaNombreEnLettres: buiaNombreEnLettres };
}
