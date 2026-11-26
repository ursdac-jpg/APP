/* ============================================================
   Module « Bien utiliser l'IA » : textes affichés du chemin 3 « Écrire ma propre demande » (écrans Écrire, Améliorer, Garder) et de « Mes demandes » (disquette).
   Source : maquette validée par Denis le 23/11/2026 (consigne 587, décisions de la consigne 595) : docs/maquettes/maquette-bien-utiliser-ia-ecrire-ma-demande-2026-11-23.html.
   Les phrases envoyées à l'assistant ne sont PAS ici : elles sont dans prompts/bien-utiliser-blocs.md (aucune copie dans le code).
   Les noms et libellés des réglages viennent de data/buiaDemande.js (une seule liste).
   Écart voulu avec la maquette : les corrections « but » et « situation » demandent une courte précision écrite (zone de saisie), pour ne laisser aucun « à compléter » dans la demande.
   ============================================================ */

var BUIA_C3_TITRE = 'Écrire ma propre demande';
var BUIA_C3_SOUS_TITRE = 'Construisez une demande sur le sujet de votre choix, testez-la, améliorez-la.';

// Les trois étapes de la barre. Tableau stable : la barre retient l'étape la plus loin atteinte.
var BUIA_C3_ETAPES = [
  { label: 'Écrire', icone: '<i class="bi bi-pencil-square"></i>' },
  { label: 'Améliorer', icone: '<i class="bi bi-arrow-repeat"></i>' },
  { label: 'Garder', icone: '<i class="bi bi-bookmark-check"></i>' }
];

var BUIA_C3_E1 = {
  titre: 'Écrire la mienne',
  rappel: { titre: 'Avant de coller un texte :', texte: 'masquez vous-même votre nom, votre adresse et vos numéros. Rien de ce que vous écrivez ici ne quitte cette page ni n’est enregistré. Les raisons sont expliquées dans le chemin « Comprendre », écran « Se protéger ».' },
  libre: { titre: 'Un sujet libre.', texte: 'Vous pouvez écrire sur n’importe quel sujet : une lettre à une ambassade, un rendez-vous à l’hôpital, un voyage. L’application ne peut pas tester le résultat d’un sujet qu’elle ne connaît pas : relisez toujours la réponse.' },
  exemple: { bouton: 'Voir un exemple rempli : un mot à l’école', but: 'écrire un mot pour prévenir l’école que mon fils sera absent jeudi', situation: 'mon fils a un rendez-vous chez le médecin jeudi après-midi et je veux prévenir poliment' },
  champs: {
    but: { lib: '1. Mon but', aide: 'Ce que l’assistant doit faire.', exemple: 'Ex. : écrire un mot pour prévenir l’école d’une absence', lignes: 2 },
    situation: { lib: '2. Ma situation, en une phrase', aide: 'Vous pouvez écrire comme vous parlez, ou dicter : les fautes ne gênent pas.', exemple: 'Ex. : mon fils a un rendez-vous chez le médecin jeudi après-midi', lignes: 2 },
    texte: { lib: '3. Le texte à traiter, si vous en avez un', aide: 'Un courrier, un mail, des notes. Laissez vide s’il n’y en a pas.', exemple: 'Collez le texte ici, sans votre nom ni vos numéros', lignes: 4 },
    exemple: { lib: 'Un exemple de la réponse attendue', aide: 'Un court exemple du style ou de la forme que vous voulez. L’assistant s’en inspire.', exemple: 'Ex. : Bonjour Madame, mon fils ne sera pas présent jeudi...', lignes: 2 }
  },
  attente: '4. Ce que j’attends',
  interdit: '5. Ce qu’il ne doit pas faire',
  date: { titre: '6. La date du jour', texte: 'est ajoutée automatiquement.' },
  conversations: { titre: 'Vos conversations', texte: 'Selon l’assistant, vos conversations peuvent servir à l’améliorer. Les réglages de confidentialité varient d’un assistant à l’autre : regardez-les dans l’assistant que vous utilisez, avant d’y écrire quoi que ce soit de personnel.' },
  apercu: {
    titre: 'Ma demande, qui se compose en direct',
    copier: 'Copier ma demande',
    copiee: 'Copiée. Collez-la dans votre assistant en ligne.',
    note: 'Au clic : la demande est copiée. Vous la collez ensuite dans l’assistant en ligne de votre choix. Rien n’est envoyé d’ici.',
    ajoutees: { titre: 'Lignes ajoutées par l’application :', texte: 'la date du jour, « français impeccable » et « un seul message ». Elles sont toujours présentes.' },
    recours: { titre: 'Contester ou faire un recours ?', texte: 'L’application ne rédige pas ce genre de courrier. Voyez une personne qui vous accompagne, ou une permanence d’accès aux droits.' }
  },
  chargement: 'Chargement des phrases...',
  indisponible: 'Les phrases de cette page ne sont pas disponibles pour le moment. Vérifiez votre connexion, puis réessayez. Rien n’est perdu.',
  reessayer: 'Réessayer'
};

var BUIA_C3_E2 = {
  titre: 'Lire la réponse et améliorer ma demande',
  intro: 'Collez votre demande dans l’assistant, lisez sa réponse, puis cochez ce qui est vrai. Chaque case vous propose une petite correction à ajouter à votre demande.',
  rappel: { titre: 'Cette liste juge la demande, pas vous.', texte: 'Changez une seule chose à la fois : vous saurez ce qui a marché.' },
  essai: 'À essayer : ',
  ajouter: 'Ajouter à ma demande',
  retirer: 'Retirer de ma demande',
  ajoutee: 'Ajoutée à votre demande (écran Écrire).',
  retiree: 'Retirée de votre demande.',
  dejaLa: 'Cette phrase est déjà dans votre demande : vérifiez plutôt la réponse vous-même.',
  precisionVide: 'Écrivez d’abord la précision, puis ajoutez-la.',
  tests: [
    { id: 'but', q: 'La réponse ne répond pas vraiment à ce que j’ai demandé.', essai: 'Précisez votre but : dites en une phrase ce que l’assistant doit produire.', precision: { lib: 'Mon but exact, en une phrase', exemple: 'Ex. : un mot de trois phrases, poli et simple' } },
    { id: 'longueur', q: 'Elle est trop longue ou trop courte.', essai: 'Changez la longueur dans l’écran Écrire (court, moyen, détaillé).' },
    { id: 'langage', q: 'Le langage ne me convient pas.', essai: 'Changez le langage dans l’écran Écrire (simple ou soigné).' },
    { id: 'inventer', q: 'Elle contient une information que je n’ai pas donnée, ou une date, un montant ou un nom que je ne reconnais pas.', essai: 'Ajoutez « Ne rien inventer » et vérifiez vous-même les informations qui comptent.' },
    { id: 'situation', q: 'Elle ne tient pas compte de ma situation.', essai: 'Complétez votre situation avec un détail de plus, par exemple pour qui est le texte.', precision: { lib: 'Le détail de plus', exemple: 'Ex. : le mot est pour l’institutrice de ma fille' } },
    { id: 'suppose', q: 'Il manque un point important.', essai: 'Demandez à l’assistant ce qu’il suppose, ou de vous poser trois questions d’abord.' }
  ],
  garder: { titre: 'Garder la version qui marche', texte: 'Quand une demande donne une bonne réponse, gardez-la telle quelle et notez ce que vous avez changé. Testez-la ensuite sur un cas imaginaire (sans vos vraies informations) pour voir si elle tient pour d’autres situations. Une demande qui marche une fois peut se comporter autrement avec un autre assistant, ou le mois suivant : retestez-la de temps en temps.' }
};

var BUIA_C3_E3 = {
  titre: 'Garder mes demandes',
  intro: 'Une demande qui marche peut resservir. Donnez-lui un nom et ajoutez-la à votre disquette : vous la retrouverez dans « Mes demandes », au chemin « J’ai un papier ou une situation ».',
  recommencer: 'Écrire une autre demande'
};

// « Mes demandes » : ce que la personne garde sur sa disquette (chemins 2 et 3).
var BUIA_GARDE_T = {
  nomLabel: 'Nom de ma demande',
  nomExemple: 'Ex. : mot pour l’école',
  bouton: 'Ajouter à ma disquette',
  ajoutee: function (nom) { return '« ' + nom + ' » est ajoutée à votre disquette. Pensez à enregistrer la disquette.'; },
  remplacee: function (nom) { return '« ' + nom + ' » a été mise à jour dans votre disquette. Pensez à enregistrer la disquette.'; },
  vide: 'Écrivez d’abord votre but ou votre situation, à l’écran Écrire.',
  plein: 'Votre disquette garde au plus 20 demandes. Supprimez-en une pour en ajouter.',
  modeleIndisponible: 'Ce modèle ne peut pas encore être gardé.',
  encart: 'Rien n’est gardé sur cet appareil. Pour ne pas perdre votre demande, enregistrez votre disquette avant de fermer.',
  pasLeTexte: 'Le texte ou le courrier que vous avez collé n’est jamais gardé : vous le collerez de nouveau au moment de vous en servir.',
  listeTitre: 'Mes demandes gardées',
  listeVide: 'Vous n’avez encore rien gardé.',
  familleTitre: 'Mes demandes',
  ouvrir: 'Ouvrir',
  supprimer: 'Supprimer',
  supprimee: function (nom) { return '« ' + nom + ' » est retirée de votre disquette. Pensez à enregistrer la disquette.'; },
  typeLibre: 'Demande écrite par moi',
  typeModele: function (nomModele) { return 'Modèle : ' + nomModele; },
  ouverte: 'Demande ouverte. Vous pouvez la modifier avant de la copier.',
  // Chemin 2, étape « Après la réponse » : garder la demande du modèle.
  modele: { titre: 'Garder cette demande', texte: 'Donnez-lui un nom : vos choix et votre situation seront gardés sur la disquette. Le courrier n’est pas gardé.', nomExemple: 'Ex. : courrier de la caisse' }
};

// Partager ses demandes avec un collègue (proposition P13, décision de Denis du 25/11/2026, maquette docs/maquettes/maquette-bien-utiliser-ia-partager-mes-demandes-2026-11-25.html).
// Un fichier à part, jamais la disquette. L'application ne sait pas reconnaître un nom : la seule protection est de montrer ce qui part et de demander de relire.
function _buiaPluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }
var BUIA_PARTAGE_T = {
  envoi: {
    titre: 'Partager avec un collègue',
    intro: 'Cochez les demandes à envoyer. Le fichier ne contient que ces demandes : jamais votre disquette, jamais le texte ou le courrier que vous avez collé.',
    aucune: 'Aucune demande choisie.',
    choisies: function (n) { return _buiaPluriel(n, 'demande choisie', 'demandes choisies') + '.'; },
    preparer: 'Préparer le fichier à partager',
    prepaTitre: 'Ce qui va partir dans le fichier',
    prepaIntro: 'Lisez bien : tout ce qui est écrit ci-dessous sera lu par la personne qui recevra le fichier.',
    libBut: 'But', libSituation: 'Situation', libExemple: 'Exemple', libPrecision: 'Précision', rienEcrit: '(aucun texte écrit : seulement des choix)',
    verifier: { titre: 'À vérifier :', texte: 'aucun nom, aucune adresse, aucun numéro, rien qui permette de reconnaître une personne (vous, une personne accompagnée, un collègue). L’application ne peut pas le vérifier à votre place. Si vous en voyez un, retournez à la liste, ouvrez la demande et retirez-le.' },
    relu: 'J’ai relu : il n’y a rien de personnel dans ces demandes.',
    enregistrer: 'Enregistrer le fichier',
    retour: 'Retour à la liste',
    enregistre: function (n, nomFichier) {
      return _buiaPluriel(n, 'demande est enregistrée', 'demandes sont enregistrées') + ' dans le fichier « ' + nomFichier + ' ». Envoyez-le à votre collègue par courriel, sur une clé USB ou dans un dossier partagé (certaines messageries bloquent ce type de fichier : prenez alors la clé ou le dossier). Ce n’est pas votre disquette : vos autres travaux n’y sont pas.';
    }
  },
  reception: {
    titre: 'Recevoir des demandes d’un collègue',
    intro: 'Votre collègue vous a envoyé un fichier de demandes ? Choisissez-le ici : vous lirez d’abord ce qu’il contient, puis vous déciderez de l’ajouter ou non à vos demandes.',
    choisir: 'Choisir le fichier reçu',
    contenuTitre: 'Ce que contient ce fichier',
    resume: function (lues, valides, ecartees) {
      return _buiaPluriel(lues, 'demande lue', 'demandes lues') + ' : ' + _buiaPluriel(valides, 'est valide', 'sont valides') + (ecartees ? ', ' + _buiaPluriel(ecartees, 'est écartée', 'sont écartées') : '') + '.';
    },
    tiers: 'Ce texte vient d’une autre personne. Lisez-le avant de vous en servir : rien n’est envoyé à un assistant sans votre geste.',
    ecartee: 'Écartée',
    raisonLibelle: 'Raison : ',
    raisons: {
      modele: 'le modèle ne fait pas partie de cette application',
      vide: 'la demande est vide',
      inconnue: 'ce n’est pas une demande reconnue',
      trop: 'le fichier contient trop de demandes'
    },
    ajouter: 'Ajouter à mes demandes',
    annuler: 'Annuler',
    rien: 'Rien n’a été ajouté.',
    pleine: function (max) { return 'Votre disquette est pleine : elle garde au plus ' + max + ' demandes. Supprimez des demandes dans « Mes demandes », puis rouvrez le fichier.'; },
    partielle: function (max, n) { return 'Votre disquette garde au plus ' + max + ' demandes. Seules les ' + n + ' premières seront ajoutées. Pour ajouter les autres, supprimez des demandes dans « Mes demandes », puis rouvrez le fichier.'; },
    ajoutees: function (n) { return _buiaPluriel(n, 'demande est ajoutée', 'demandes sont ajoutées') + ' à votre disquette. Pensez à enregistrer la disquette.'; },
    nonAjoutees: function (n, max) { return _buiaPluriel(n, 'demande n’a pas été ajoutée', 'demandes n’ont pas été ajoutées') + ' : votre disquette garde au plus ' + max + ' demandes.'; },
    erreurs: {
      illisible: 'Ce fichier ne peut pas être lu : ce n’est pas un fichier de demandes. Vérifiez que vous avez choisi le bon fichier. Rien n’a été changé.',
      disquette: 'Ce fichier est une disquette complète, pas un fichier de demandes à partager. Pour retrouver votre travail, utilisez « Ouvrir ma disquette ». Rien n’a été changé.',
      autre: 'Ce fichier ne contient pas de demandes à partager. Vérifiez que vous avez choisi le bon fichier. Rien n’a été changé.'
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUIA_C3_TITRE: BUIA_C3_TITRE, BUIA_C3_SOUS_TITRE: BUIA_C3_SOUS_TITRE, BUIA_C3_ETAPES: BUIA_C3_ETAPES, BUIA_C3_E1: BUIA_C3_E1, BUIA_C3_E2: BUIA_C3_E2,
    BUIA_C3_E3: BUIA_C3_E3, BUIA_GARDE_T: BUIA_GARDE_T, BUIA_PARTAGE_T: BUIA_PARTAGE_T };
}
