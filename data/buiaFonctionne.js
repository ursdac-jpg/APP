/* ============================================================
   Module « Bien utiliser l'IA » : textes du chemin 4 « Comment fonctionne un assistant » (théorie pure, aucune demande construite ici).
   Source : maquette docs/maquettes/maquette-bien-utiliser-ia-enrichissement-2026-11-24.html, décisions de Denis du 24/11/2026 (consignes 596, 598, 599) :
   un quatrième chemin à part, sept assistants nommés sur un seul écran daté, projets et mémoire en « Pour aller plus loin » avec garde-fous.
   Le mot reste « assistant » ; une seule phrase, à l'écran 1, dit que l'assistant est une intelligence artificielle (IA).
   Les quatre fiches qui n'avaient été vues que sur des articles tiers (Copilot, Gemini, Le Chat, DeepSeek) ont été relues sur les pages officielles le 24/11/2026 :
   le champ `source` de chaque fiche donne la page lue (jamais affiché). Chaque fiche porte `aSourcer: false` tant qu'elle est relue ; la remettre à `true` si une affirmation
   doute. Mettre à jour BUIA_C4_DATE_MAJ à chaque relecture. Revue prévue tous les six mois.
   Règle de rédaction : décrire l'usage de chaque assistant, jamais un quota ni un prix (ils changent trop vite).
   Écran 6 (projets et mémoire), relu le 24/11/2026 sur les pages officielles : couper la mémoire n'efface pas les souvenirs, supprimer une conversation n'efface pas non plus les souvenirs
   (OpenAI help.openai.com/en/articles/8590148-memory-faq ; Anthropic support.claude.com, article 11817273 ; Microsoft support.microsoft.com, « Manage Copilot Memory » ;
   Google support.google.com/gemini/answer/16598469), et une conversation temporaire ne crée aucun souvenir (OpenAI « Temporary Chat », Claude « Incognito chats », Gemini « Temporary Chats »).
   ============================================================ */

var BUIA_C4_ROUTE_TITRE = 'Comment fonctionne un assistant';
var BUIA_C4_SOUS_TITRE = 'Ce qu’il est, comment il écrit, d’où vient ce qu’il sait, et comment choisir.';

// Étiquette du niveau de lecture : mêmes boutons que le chemin 1 (data/buiaComprendre.js, BUIA_C1_NIVEAUX).

// Les huit étapes de la barre (sept écrans, puis la fiche « Ce qu'il faut retenir »).
var BUIA_C4_ETAPES = [
  { label: 'L’assistant', icone: '<i class="bi bi-cpu"></i>' },
  { label: 'Ses phrases', icone: '<i class="bi bi-type"></i>' },
  { label: 'Son savoir', icone: '<i class="bi bi-book"></i>' },
  { label: 'Recherche web', icone: '<i class="bi bi-search"></i>' },
  { label: 'Les assistants', icone: '<i class="bi bi-grid"></i>' },
  { label: 'Projets et mémoire', icone: '<i class="bi bi-folder2-open"></i>' },
  { label: 'S’en passer', icone: '<i class="bi bi-signpost-2"></i>' },
  { label: 'À retenir', icone: '<i class="bi bi-bookmark-check"></i>' }
];

// Date affichée sur l'écran des assistants et sur l'écran des projets : à changer à chaque revue.
var BUIA_C4_DATE_MAJ = '24/11/2026';
var BUIA_C4_DATE_LIBELLE = 'Cet écran est à jour au ';

// Écran 1.
var BUIA_C4_E1 = {
  titre: 'Un assistant, c’est une intelligence artificielle',
  intro: 'Quand vous écrivez à un assistant en ligne, vous utilisez une intelligence artificielle, souvent écrite « IA ». Dans ce module, nous disons simplement « l’assistant » : c’est la même chose.',
  schemaLibelle: 'Schéma : vous écrivez, un programme lit, il écrit',
  schema: [
    { titre: 'Vous écrivez', texte: 'une demande, avec vos mots' },
    { titre: 'Un programme', texte: 'qui a lu énormément de textes' },
    { titre: 'Il écrit', texte: 'un texte qui a l’air juste' }
  ],
  idee: { titre: 'L’idée à retenir :', texte: 'derrière l’écran, il n’y a ni une personne ni un moteur de recherche. Il y a un programme qui écrit du texte.' },
  plus: { titre: 'Un mot que vous croiserez', texte: 'Les assistants qui écrivent du texte reposent sur un « grand modèle de langage », en anglais « Large Language Model », abrégé « LLM ». Ce sont les mots que vous verrez dans les articles. Vous n’avez pas besoin de les retenir pour bien utiliser un assistant.' }
};

// Écran 2 : les mots vraisemblables. Les pourcentages sont INVENTÉS pour l'exemple et le disent.
var BUIA_C4_E2 = {
  titre: 'Comment il écrit ses phrases',
  intro: 'L’assistant a lu une quantité immense de textes. Il en a retenu quels mots suivent souvent quels autres. Quand vous lui écrivez, il choisit le mot le plus vraisemblable, puis le suivant, puis le suivant, jusqu’à la fin de la réponse.',
  exempleTitre: 'Un exemple.',
  exempleTexte: 'Pour finir « Le ciel est… », les mots les plus vraisemblables sont :',
  contexteBouton: 'Ajouter le contexte : « Nous sommes au coucher du soleil. »',
  sans: [{ mot: 'bleu', pct: 66 }, { mot: 'gris', pct: 14 }, { mot: 'clair', pct: 9 }, { mot: 'nuageux', pct: 7 }, { mot: 'sombre', pct: 4 }],
  avec: [{ mot: 'rouge', pct: 41 }, { mot: 'orange', pct: 33 }, { mot: 'rose', pct: 17 }, { mot: 'bleu', pct: 6 }, { mot: 'sombre', pct: 3 }],
  legendeSans: 'Sans contexte, « bleu » est le plus vraisemblable. Les pourcentages sont inventés pour l’exemple.',
  legendeAvec: 'Avec le contexte, d’autres mots deviennent les plus vraisemblables. Les pourcentages sont inventés pour l’exemple.',
  consigneTitre: 'Pourquoi votre consigne change la réponse',
  consigne: 'Votre consigne fait partie du texte que l’assistant continue. Si vous écrivez « avec des mots simples », les mots simples deviennent plus vraisemblables que les mots compliqués. C’est pour cela que préciser la longueur, le ton ou la forme change vraiment le résultat.',
  idee: { titre: 'Ce qu’il faut en retenir :', texte: 'l’assistant n’a ni avis ni intention. Il écrit la suite la plus probable de ce que vous lui avez donné. Donnez-lui donc de quoi bien continuer.' },
  plus: { titre: 'Pourquoi deux réponses différentes', texte: 'Un peu de hasard est volontairement mélangé au choix des mots, pour que les réponses ne soient pas toujours identiques. Deux demandes identiques peuvent donc donner deux textes différents. Ce n’est pas une panne.' }
};

// Écran 3.
var BUIA_C4_E3 = {
  titre: 'D’où vient ce qu’il sait',
  oui: { titre: 'Ce qu’il a', items: ['Ce qu’il a lu pendant son apprentissage, qui s’arrête à une date.', 'Ce que vous écrivez dans la conversation en cours.'] },
  non: { titre: 'Ce qu’il n’a pas', items: ['Ce qui s’est passé après la fin de son apprentissage.', 'Votre situation, si vous ne l’écrivez pas.', 'Les sites d’Internet, sauf si la recherche web est activée.'] },
  savoir: { titre: 'À savoir :', texte: 'un horaire, un montant, une règle ou une date limite peuvent avoir changé depuis son apprentissage. Pour ces informations, il faut la recherche web (écran suivant), puis vérifier vous-même.' },
  plus: { titre: 'Pourquoi il peut inventer', texte: 'Quand il ne sait pas, l’assistant écrit quand même la suite la plus vraisemblable. Cela peut donner une date, un nom ou une loi qui n’existent pas, dans une phrase très sûre d’elle. Vous pouvez lui demander d’écrire « je ne sais pas » quand une information manque : cela réduit le risque, sans le supprimer.' }
};

// Écran 4.
var BUIA_C4_E4 = {
  titre: 'La recherche web',
  intro: 'La plupart des assistants proposent une recherche web : avant de répondre, l’assistant va lire des pages d’Internet, puis écrit sa réponse à partir de ce qu’il a trouvé.',
  activer: { titre: 'Quand l’activer', items: ['Pour une information précise ou récente : un horaire, un prix, une règle, une date limite, une adresse.', 'Pour demander les sources : « indique les sites que tu as lus ».'] },
  inutile: { titre: 'Quand elle n’est pas nécessaire', items: ['Pour reformuler ou corriger un texte que vous lui donnez.', 'Pour préparer un entretien à partir de votre propre parcours.'] },
  verifier: { titre: 'Même avec la recherche web, vérifiez.', texte: 'L’assistant peut résumer une page de travers ou s’appuyer sur une page ancienne. Ouvrez vous-même le lien et comparez avec le site de l’organisme.' },
  reglage: 'Où se trouve le réglage ? Cela dépend de l’assistant : cherchez un bouton ou une case « Recherche » ou « Web » près de la zone où vous écrivez.'
};

// Écran 5 : les assistants. Description d'usage seulement, jamais un quota ni un prix. `aSourcer` : à relire sur la page officielle avant l'ouverture.
var BUIA_C4_E5 = {
  titre: 'Les assistants : ce qui les distingue',
  prudence: 'Les offres gratuites, les comptes demandés et les réglages changent souvent. Regardez toujours la page de l’assistant avant de vous inscrire.',
  pourLibelle: 'Pour quoi faire : ',
  savoirLibelle: 'À savoir : ',
  assistants: [
    { id: 'chatgpt', nom: 'ChatGPT', pour: 'le plus répandu. Écrire, reformuler, expliquer, préparer un courrier.',
      savoir: 'la version gratuite propose la recherche web. Selon les réglages, vos conversations peuvent servir à améliorer le service : regardez la confidentialité.', aSourcer: false },
    { id: 'copilot', nom: 'Copilot (Microsoft)', pour: 'écrire et chercher, et, dans Word, Outlook ou Teams, aider à rédiger ou à résumer. Beaucoup de personnes l’ont déjà avec leur abonnement Microsoft 365 personnel ou familial (pour le titulaire de l’abonnement).',
      savoir: 'il existe deux versions : la version grand public, avec un compte Microsoft, dont les conversations sont gardées et peuvent, par défaut, servir à améliorer le service (un réglage permet de le refuser) ; et celle ouverte avec un compte de travail ou d’école, protégée par les règles de l’organisation. Dans le doute, n’y mettez rien de personnel.',
      aSourcer: false, source: 'https://support.microsoft.com/en-us/microsoft-copilot/privacy-faq-for-microsoft-copilot ; https://learn.microsoft.com/en-us/copilot/plan/privacy-and-protections' },
    { id: 'gemini', nom: 'Gemini (Google)', pour: 'écrire, expliquer, résumer. Il est relié aux services Google : Gmail, Documents, l’application du téléphone.',
      savoir: 'avec un compte Google, vos discussions sont gardées dans un historique que vous pouvez régler ou effacer, et un échantillon peut être relu par des personnes. Cherchez le réglage « Historique » (ou « Activité »).',
      aSourcer: false, source: 'https://support.google.com/gemini/answer/13594961?hl=fr' },
    { id: 'claude', nom: 'Claude', pour: 'des textes soignés, des documents longs à relire, et aussi du code, pas seulement de la mise en page.',
      savoir: 'un compte est demandé. La version gratuite a des limites d’usage dans la journée.', aSourcer: false },
    { id: 'perplexity', nom: 'Perplexity', pour: 'chercher une information. Chaque réponse montre des liens numérotés vers les sources, notamment des médias.',
      savoir: 'utilisable sans compte pour des recherches simples. Une source peut être ancienne ou mal résumée : ouvrez-la.', aSourcer: false },
    { id: 'lechat', nom: 'Le Chat (Mistral)', pour: 'l’assistant d’une entreprise française. Écrire, chercher sur le web avec des liens, résumer des documents.',
      savoir: 'une offre gratuite existe, avec un nombre limité de messages et de recherches sur le web. Le service s’appelle désormais Vibe : vous pouvez rencontrer les deux noms sur le site de Mistral.',
      aSourcer: false, source: 'https://mistral.ai/products/vibe/ ; https://mistral.ai/pricing/' },
    { id: 'deepseek', nom: 'DeepSeek', pour: 'un assistant pour écrire et expliquer, proposé par une entreprise chinoise.',
      savoir: 'c’est un service chinois. Selon sa politique de confidentialité, vos textes sont conservés en Chine et peuvent servir à améliorer ses modèles. N’y écrivez rien de personnel.',
      aSourcer: false, source: 'https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html' },
    { id: 'autres', nom: 'D’autres existent', pour: 'de nouveaux assistants apparaissent régulièrement. Les mêmes règles valent pour tous.',
      savoir: 'avant d’en essayer un : qui le propose, ce qu’il garde de vos échanges, et comment couper la mémoire.', aSourcer: false }
  ],
  choisir: { titre: 'Comment choisir ?', texte: 'Un seul assistant suffit pour commencer. Pour une information importante, posez la même question à deux assistants et comparez, puis vérifiez sur le site officiel.' }
};

// Écran 6 : niveau « Pour aller plus loin » dans son ensemble (pastille dans le titre).
var BUIA_C4_E6 = {
  titre: 'Les projets et la mémoire',
  intro: 'Certains assistants permettent de regrouper plusieurs conversations et des documents dans un projet, avec des consignes communes. D’autres gardent une mémoire : ils retiennent des éléments d’une conversation à l’autre.',
  oui: { titre: 'Ce que cela apporte', items: ['Pas besoin de tout réexpliquer à chaque fois.', 'Des réponses plus cohérentes sur un même sujet.'] },
  non: { titre: 'Ce qu’il faut savoir', items: [
    'Ce que vous y mettez est conservé.',
    'Selon l’assistant, un compte, parfois une formule payante.',
    'Couper la mémoire n’efface pas ce qui a déjà été retenu : l’effacement se fait à part.',
    'Supprimer une conversation n’efface pas non plus ce qui en a été retenu.'
  ] },
  jamais: { titre: 'Ne mettez jamais dans un projet ou dans la mémoire :', texte: 'votre nom, votre adresse, vos numéros, des informations de santé ou de situation administrative. Cherchez le réglage qui permet de couper la mémoire, puis celui qui efface ce qui a été retenu.' },
  temporaire: { titre: 'Pour ne rien laisser derrière vous :', texte: 'plusieurs assistants proposent une conversation temporaire (le nom change selon l’assistant) : rien n’y est retenu pour la suite. Cherchez-la avant d’écrire.' },
  // Propositions P7 et P8 (feu vert de Denis du 24/11/2026), sourcées le 24/11/2026 (paragraphe 5 bis du dossier PROPOSITIONS_BIEN_UTILISER_L_IA_2026-11-24.md).
  // P7 : pages officielles d'OpenAI, d'Anthropic et de Google lues ; aucun nombre de caractères (il change selon le forfait). P8 : un seul éditeur lu, donc « certains outils », aucun nom, aucune promesse de confidentialité.
  consignes: { titre: 'Des consignes une fois pour toutes', texte: 'Plusieurs assistants permettent d’écrire une fois pour toutes vos préférences, par exemple « réponds avec des phrases courtes et des mots simples ». Elles s’appliquent ensuite à chaque conversation. Ce n’est pas la mémoire : c’est vous qui écrivez, et vous pouvez les modifier, les couper ou les effacer. Le nom et l’endroit du réglage changent selon l’assistant. Même précaution que pour la mémoire : n’y écrivez ni votre nom, ni votre adresse, ni rien de personnel, car ce texte accompagne chacune de vos demandes. Regardez aussi les réglages de confidentialité : selon l’assistant, il peut servir à l’améliorer.' },
  documents: { titre: 'Répondre seulement à partir de vos documents', texte: 'Certains outils répondent uniquement à partir des documents que vous leur donnez, et disent quand la réponse n’y figure pas. Deux précautions : le passage cité n’est pas toujours indiqué, retrouvez-le vous-même dans votre document ; et les documents envoyés suivent les mêmes règles que n’importe quel texte, sans noms ni numéros, car rien ne garantit qu’ils ne servent pas à améliorer l’outil.' }
};

// Écran 7 : quand ne pas demander à un assistant (proposition P4 du dossier docs/PROPOSITIONS_BIEN_UTILISER_L_IA_2026-11-24.md, option 1 choisie par Denis le 24/11/2026). Visible aux deux niveaux de lecture.
// Fondements relus le 24/11/2026 : le guide d'Anthropic « Reduce hallucinations » conseille de toujours vérifier une information importante, surtout avant une décision grave ;
// le référentiel Pix IA v1.5 (compétence 2.2) conseille de ne pas fournir de données personnelles, sensibles ou confidentielles ; le thème « Quand interagir avec des systèmes d'IA ? » vient de DigComp 2.2.
// Aucun numéro d'urgence cité de mémoire ; aucun nom d'outil ; jamais un avis médical ou juridique.
var BUIA_C4_E7 = {
  titre: 'Quand s’en passer',
  intro: 'Un assistant est utile, mais pas pour tout. Voici quatre situations où il vaut mieux se tourner vers une personne ou vers la source officielle.',
  cartes: [
    { titre: 'Une urgence ou un danger', texte: 'Appelez les secours ou une personne près de vous. Un assistant ne peut pas intervenir.' },
    { titre: 'Une grande décision (santé, argent, droit)', texte: 'Parlez à un professionnel. L’assistant peut aider à préparer vos questions, pas à décider à votre place.' },
    { titre: 'Une réponse qui doit être exacte', texte: 'Un délai, un montant, une règle : retrouvez-les chez l’organisme concerné, sur son site officiel.' },
    { titre: 'Un texte qui parle d’autres personnes', texte: 'Leurs noms et leurs situations ne vous appartiennent pas. Retirez-les avant d’écrire, ou n’écrivez pas.' }
  ],
  rappel: { titre: 'À savoir :', texte: 'les guides officiels d’un éditeur d’assistant le disent eux-mêmes : toujours vérifier une information importante, surtout avant une décision grave.' }
};

// Fiche finale « Ce qu'il faut retenir ».
var BUIA_C4_FICHE = {
  titre: 'Ce qu’il faut retenir',
  points: [
    'L’assistant est une intelligence artificielle : un programme qui écrit du texte.',
    'Il écrit la suite la plus vraisemblable : une consigne claire change la réponse.',
    'Son savoir s’arrête à une date : pour une information précise, activez la recherche web.',
    'Même avec la recherche web, vérifiez les dates, les montants et ouvrez les sources.',
    'Les assistants diffèrent : regardez les conditions et la confidentialité avant de vous inscrire.',
    'Pour une urgence, une grande décision ou une réponse qui doit être exacte, adressez-vous à une personne ou à la source officielle.'
  ],
  boutons: { modeles: 'Mettre en pratique avec un modèle', comprendre: 'Apprendre à écrire une demande' },
  boutonFin: 'Choisir un chemin'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BUIA_C4_ROUTE_TITRE: BUIA_C4_ROUTE_TITRE, BUIA_C4_SOUS_TITRE: BUIA_C4_SOUS_TITRE, BUIA_C4_ETAPES: BUIA_C4_ETAPES, BUIA_C4_DATE_MAJ: BUIA_C4_DATE_MAJ, BUIA_C4_DATE_LIBELLE: BUIA_C4_DATE_LIBELLE,
    BUIA_C4_E1: BUIA_C4_E1, BUIA_C4_E2: BUIA_C4_E2, BUIA_C4_E3: BUIA_C4_E3, BUIA_C4_E4: BUIA_C4_E4, BUIA_C4_E5: BUIA_C4_E5, BUIA_C4_E6: BUIA_C4_E6, BUIA_C4_E7: BUIA_C4_E7, BUIA_C4_FICHE: BUIA_C4_FICHE
  };
}
