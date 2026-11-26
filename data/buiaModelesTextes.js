/* ============================================================
   Module « Bien utiliser l'IA » : textes affichés du chemin 2 « J'ai un papier ou une situation » (écrans Choisir, Compléter, Après la réponse).
   Source : maquette validée par Denis le 23/11/2026 (consigne 589) : docs/maquettes/maquette-bien-utiliser-ia-mes-modeles-2026-11-23.html.
   Les phrases envoyées à l'assistant ne sont PAS ici : elles sont dans prompts/bien-utiliser-modele-N.md (lecture au besoin, aucune copie dans le code).
   Plan : docs/AUDIT_ET_PLAN_BIEN_UTILISER_L_IA_2026-11-23.md, commit 5.
   ============================================================ */

var BUIA_C2_TITRE = 'Mes modèles à compléter';
var BUIA_C2_SOUS_TITRE = 'Choisissez votre situation, complétez quelques lignes, copiez votre demande.';

// Les trois étapes de la barre. Tableau stable : la barre retient l'étape la plus loin atteinte.
var BUIA_C2_ETAPES = [
  { label: 'Choisir mon modèle', icone: '<i class="bi bi-search"></i>' },
  { label: 'Compléter ma demande', icone: '<i class="bi bi-pencil-square"></i>' },
  { label: 'Après la réponse', icone: '<i class="bi bi-check2-square"></i>' }
];

// Tant que les modèles ne sont pas tous écrits, une proposition peut viser un modèle absent : le message le dit calmement (décision à l'ouverture, commit 9).
var BUIA_C2_PROPOSER_NON_REDIGES = true;
var BUIA_C2_BIENTOT = 'Ce modèle n’est pas encore disponible. Il sera ajouté bientôt.';
var BUIA_C2_BIENTOT_PASTILLE = 'Bientôt';

var BUIA_C2_E1 = {
  papier: {
    titre: 'J’ai un papier',
    rappel: { titre: 'Avant de coller :', texte: 'masquez votre nom et votre adresse. Le texte reste sur cet appareil : il n’est ni envoyé, ni enregistré.' },
    label: 'Collez ici le texte de votre papier',
    placeholder: 'Courrier, mail, convocation, message reçu...',
    boutons: { reperer: 'Repérer le bon modèle', masquer: 'Masquer les numéros et courriels', effacer: 'Effacer' },
    essai: 'Pour essayer sans papier réel :',
    videAvertissement: 'Collez d’abord le texte de votre papier.',
    fictifColle: 'Courrier fictif collé.'
  },
  mots: {
    titre: 'Ou je dis en quelques mots ce dont j’ai besoin',
    label: 'Ma situation en quelques mots',
    aide: 'Écrivez comme vous parlez, ou dictez. Les fautes ne gênent pas.',
    placeholder: 'Ex. : je dois répondre à la caisse d’allocations',
    exemplesTitre: 'Exemples à toucher :',
    exemples: ['je dois répondre à la caisse', 'lettre de motivation', 'résumer un texte', 'préparer un rendez-vous', 'je ne comprends pas ce courrier']
  },
  resultats: {
    titre: 'Ce que j’ai repéré',
    chapoPapier: 'À partir de votre papier, ces modèles peuvent vous aider. Choisissez celui qui correspond.',
    chapoMots: 'À partir de vos mots, ces modèles peuvent vous aider. Choisissez celui qui correspond.',
    motsReperes: 'Mots repérés : ',
    choisir: 'Choisir ce modèle',
    aucun: 'Aucun modèle ne ressort de ces mots. Vous pouvez reformuler, choisir dans la liste ci-dessous, ou écrire votre propre demande.',
    prudence: 'L’application compare des mots : elle ne comprend pas votre texte. C’est donc vous qui choisissez, toujours.'
  },
  liste: { titre: 'Ou je choisis dans la liste', variantes: 'Variantes : ', choisir: 'Choisir', familleOuverte: 'Administration et démarches', choisirD: 'Choisissez d’abord un modèle, dans la liste ou grâce à votre papier.' },
  // Décision C du 24/11/2026 (propositions P11 et P12), affichés dans la famille « Pour les professionnels » seulement.
  // P11 : des QUESTIONS à poser à sa structure, jamais une règle écrite à sa place (décision du 22/11/2026). S'appuie sur la compétence Pix 2.5 (charte d'usage dans une organisation).
  // P12 : grille d'essai affichée à l'écran, sans bouton d'impression (consigne 588, 23/11/2026). Les trois cas sont les courriers fictifs de l'écran 1.
  pro: {
    questions: {
      titre: 'Avant d’utiliser un assistant dans mon travail : les questions à poser à ma structure',
      intro: 'Ces questions sont à poser à votre structure. Les réponses sont les siennes : l’application n’en donne aucune à sa place.',
      liste: [
        'Quels assistants ma structure autorise-t-elle, et lesquels faut-il éviter ?',
        'Quelles informations ne doivent jamais y être écrites ?',
        'Les personnes accompagnées doivent-elles être prévenues, ou donner leur accord ?',
        'Qui vérifie un texte produit avec un assistant avant qu’il soit utilisé ?',
        'Où conserver les textes produits, et faut-il noter qu’un assistant a servi à les écrire ?',
        'À qui m’adresser en cas de doute, ou si une information a été envoyée par erreur ?'],
      attente: { titre: 'En attendant les réponses :', texte: 'écrivez sans noms ni données nominatives, et relisez toujours le résultat avant de vous en servir.' }
    },
    grille: {
      titre: 'Une grille pour tester mes demandes',
      intro: 'Une demande qui marche aujourd’hui peut se comporter autrement avec un autre assistant, ou dans quelques mois. Testez la vôtre sur des cas inventés, jamais sur de vrais dossiers.',
      casTitre: 'Trois cas inventés :',
      cas: 'les trois courriers fictifs proposés plus haut, à l’écran « Mon papier ». Rejouez les mêmes trois cas après chaque changement.',
      relectureTitre: 'Pour chaque réponse, je relis :',
      relecture: [
        'Répond-elle à ce que j’ai demandé ?',
        'Les dates, les montants et les noms sont-ils justes ?',
        'Contient-elle une information que je n’ai pas donnée ?',
        'La longueur et le langage conviennent-ils ?',
        'Le ton convient-il à la personne qui lira ?'],
      noterTitre: 'À chaque essai, je note :',
      noter: 'le nom de l’assistant, la date de l’essai, et ce que j’ai changé dans la demande.',
      reserve: 'Cette grille est à lire à l’écran et à recopier sur votre propre feuille.'
    }
  },
  aucunConvient: {
    titre: 'Aucun ne convient',
    texte: 'Votre besoin n’est pas dans la liste ? Vous pouvez écrire votre propre demande, sur le sujet de votre choix.',
    ecrire: 'Écrire ma propre demande'
  }
};

// Alerte de date (faite par le code) : titres des cases.
var BUIA_C2_ALERTE = {
  vu: 'Je l’ai vu',
  reprise: 'Ajouter cette date à ma demande, pour que l’assistant la mette en haut de sa réponse'
};

var BUIA_C2_E2 = {
  famille: 'Famille : ',
  apercuTitre: 'Ma demande, qui se compose en direct',
  dateAuto: { titre: 'La date du jour', texte: 'est ajoutée automatiquement.' },
  copier: 'Copier ma demande',
  copiee: 'Copiée. Collez-la dans votre assistant en ligne.',
  copieImpossible: 'La copie n’a pas fonctionné. Sélectionnez le texte de la demande et copiez-le à la main.',
  note: 'Vous la collez ensuite dans l’assistant en ligne de votre choix. Rien n’est envoyé d’ici.',
  pourquoi: 'Pourquoi ça marche ?',
  chargement: 'Chargement des phrases du modèle...',
  indisponible: 'Les phrases de ce modèle ne sont pas disponibles pour le moment. Vérifiez votre connexion, puis réessayez. Rien n’est perdu.',
  reessayer: 'Réessayer',
  autreModele: 'Choisir un autre modèle'
};

var BUIA_C2_E3 = {
  titre: 'Après la réponse de l’assistant',
  relisez: { titre: 'Relisez.', texte: 'Si une phrase ne vous ressemble pas ou que vous ne la comprenez pas, demandez à l’assistant de la simplifier.' },
  verifier: { titre: 'Ce que vous devez vérifier vous-même :', texte: 'les dates, les montants et les noms, en les comparant avec votre courrier. L’assistant termine sa réponse par la liste de ce qu’il faut vérifier auprès de l’organisme.' },
  // Pour les modèles qui ne parlent pas d'un courrier (1, 2, 3, 6, 7, 8), ce qu'il faut vérifier soi-même.
  verifierModele: {
    1: 'le nom de l’entreprise, le poste, les dates et ce que le mail dit de votre parcours, en les comparant avec la réalité. L’assistant termine sa réponse par trois points à vérifier avant l’envoi.',
    2: 'que chaque point de votre CV est exact et que rien n’a été ajouté ni exagéré. Votre CV reste le vôtre, prenez ce qui vous aide et laissez le reste.',
    3: 'que ce que vous dites est vrai et que vous êtes à l’aise avec ces phrases. Reformulez-les avec vos mots, à voix haute si possible.',
    6: 'les noms, les dates et ce que le mail promet, en les comparant avec ce que vous vouliez dire. L’assistant termine sa réponse par trois points à vérifier avant l’envoi.',
    7: 'que le sens n’a pas changé, en comparant les chiffres, les dates et les noms avec votre texte.',
    8: 'tout ce qui engage une décision (une somme, un délai, une obligation), en le comparant avec le document lui-même, ou en le demandant à l’organisme ou à une personne de confiance.',
    10: 'que chaque point s’appuie bien sur vos notes, que les dates et les décisions sont exactes, et qu’aucun nom ni aucune donnée nominative n’a été ajouté. Les déductions de l’assistant sont rangées à part, à vérifier avant tout usage.',
    11: 'les dates, les décisions et les suites, en les comparant avec vos notes, et qu’aucun nom ni aucune donnée nominative n’apparaît dans le document. L’assistant termine sa réponse par la liste de ce qu’il faut vérifier avant de le transmettre.',
    12: 'que chaque date, chaque montant et chaque démarche du document d’origine se retrouve, tels quels, dans la version simple. Faites-la relire par une personne concernée ou un collègue avant de la remettre, car elle ne porte aucun label.',
    13: 'que chaque durée tient dans le temps dont vous disposez, que le matériel demandé existe dans votre salle et qu’aucun résultat n’est promis aux participants. L’assistant termine sa réponse par la liste de ce que vous devez préparer avant l’atelier.'
  },
  maintenant: 'Et maintenant ?',
  boutons: { repondre: 'Préparer ma réponse à ce courrier', rendezvous: 'Préparer un rendez-vous ou un appel', garder: 'Garder cette demande' },
  // Messages honnêtes tant que la suite n'est pas construite (modèles 5 et 9 : après les essais de Denis ; disquette : commit 6).
  repondreBientot: 'Le modèle « Répondre à l’administration » sera ajouté bientôt, avec le courrier déjà rempli (pas de double collage).',
  rendezvousBientot: 'Le modèle « Préparer un rendez-vous ou un appel » sera ajouté bientôt.',
  garderBientot: 'Garder une demande se fera avec la disquette : cette fonction sera ajoutée bientôt.'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUIA_C2_TITRE: BUIA_C2_TITRE, BUIA_C2_SOUS_TITRE: BUIA_C2_SOUS_TITRE, BUIA_C2_ETAPES: BUIA_C2_ETAPES, BUIA_C2_PROPOSER_NON_REDIGES: BUIA_C2_PROPOSER_NON_REDIGES,
    BUIA_C2_BIENTOT: BUIA_C2_BIENTOT, BUIA_C2_BIENTOT_PASTILLE: BUIA_C2_BIENTOT_PASTILLE, BUIA_C2_E1: BUIA_C2_E1, BUIA_C2_ALERTE: BUIA_C2_ALERTE, BUIA_C2_E2: BUIA_C2_E2,
    BUIA_C2_E3: BUIA_C2_E3 };
}
