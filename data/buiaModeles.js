/* ============================================================
   Module « Bien utiliser l'IA » : catalogue des modèles du chemin 2 « J'ai un papier ou une situation » et courriers fictifs d'essai.
   Source : maquette validée par Denis le 23/11/2026 (consigne 589) : docs/maquettes/maquette-bien-utiliser-ia-mes-modeles-2026-11-23.html.
   `mots` : les mots qui font reconnaître le modèle, écrits SANS accent et en minuscules (le repérage compare des mots : il ne comprend pas le texte).
   `redige` : le texte du modèle existe. Les modèles 4, 5 et 9 viennent du corpus ; les modèles 1, 2, 3, 6, 7, 8, 10, 11 et 12 ont été écrits le 24/11/2026 à la demande expresse de Denis (version 1, jamais essayée)
   (audit du 23/11/2026, point 3.1). À l'ouverture au public, seuls les modèles rédigés et testés par Denis sont proposés.
   Les phrases envoyées à l'assistant ne sont pas ici (prompts/bien-utiliser-blocs.md pour les phrases communes, un fichier propre à chaque modèle ensuite).
   ============================================================ */

var BUIA_FAMILLES = ['Chercher un emploi', 'Administration et démarches', 'Écrire et comprendre', 'Pour les professionnels'];
var BUIA_RAPPEL_PRO = 'Écrivez sans noms ni données nominatives : remplacez-les par des repères.';

var BUIA_MODELES = [
  { id: 1, nom: 'Écrire un mail de candidature', famille: 'Chercher un emploi', redige: true, variantes: 'spontanée, après un entretien, relance, remerciement, demande de stage ou d’immersion',
    mots: ['candidature', 'candidater', 'motivation', 'postuler', 'spontanee', 'offre', 'emploi', 'mail', 'lettre', 'stage', 'immersion', 'decouvrir'] },
  { id: 2, nom: 'Relire mon CV face à une offre', famille: 'Chercher un emploi', redige: true, variantes: 'points forts et points à améliorer, sans note',
    mots: ['cv', 'curriculum', 'relire', 'offre', 'emploi'] },
  { id: 3, nom: 'Préparer un entretien', famille: 'Chercher un emploi', redige: true, variantes: 'm’entraîner aux questions, expliquer un trou dans mon parcours',
    mots: ['entretien', 'recruteur', 'entrainer', 'simuler', 'embauche', 'questions'] },
  { id: 4, nom: 'Comprendre un courrier reçu', famille: 'Administration et démarches', redige: true, variantes: 'ce que je dois faire, et pour quand',
    mots: ['courrier', 'lettre', 'recu', 'comprendre', 'caisse', 'indu', 'trop-percu', 'percu', 'administration', 'convocation', 'papier', 'delai', 'allocations', 'comprends'] },
  { id: 5, nom: 'Répondre à l’administration', famille: 'Administration et démarches', redige: true, variantes: 'fournir une pièce, demander une explication, un délai ou un rendez-vous, signaler un changement',
    mots: ['repondre', 'reponse', 'piece', 'justificatif', 'administration', 'caisse', 'delai', 'changement', 'situation', 'allocations'] },
  { id: 9, nom: 'Préparer un rendez-vous ou un appel', famille: 'Administration et démarches', redige: true, variantes: 'liste de questions, ce que je dois apporter',
    mots: ['rendez-vous', 'rdv', 'appel', 'telephone', 'telephoner', 'convocation', 'convoque', 'entretien', 'preparer', 'conseiller'] },
  { id: 6, nom: 'Écrire un mail clair et poli', famille: 'Écrire et comprendre', redige: true, variantes: 'répondre, relancer, refuser, s’excuser d’un retard',
    mots: ['mail', 'message', 'courriel', 'email', 'relancer', 'refuser', 'excuser', 'retard', 'poli'] },
  { id: 7, nom: 'Reformuler ou résumer un texte', famille: 'Écrire et comprendre', redige: true, variantes: 'plus simple, plus court, plus posé',
    mots: ['reformuler', 'resumer', 'resume', 'texte', 'raccourcir', 'simplifier', 'simple'] },
  { id: 8, nom: 'Me faire expliquer un mot ou un document', famille: 'Écrire et comprendre', redige: true, variantes: 'en langage simple, étape par étape, un formulaire case par case',
    mots: ['expliquer', 'explique', 'mot', 'document', 'comprends', 'simple', 'etape', 'formulaire', 'case', 'cases', 'remplir'] },
  { id: 10, nom: 'Synthèse de notes d’entretien', famille: 'Pour les professionnels', redige: true, pro: true, variantes: 'sans noms, fidèle au texte',
    mots: ['synthese', 'notes', 'entretien', 'resumer'] },
  { id: 11, nom: 'Compte rendu ou bilan', famille: 'Pour les professionnels', redige: true, pro: true, variantes: 'gabarit de la structure, ton neutre',
    mots: ['compte', 'rendu', 'bilan', 'parcours'] },
  { id: 12, nom: 'Passer un document en langage simple', famille: 'Pour les professionnels', redige: true, pro: true, variantes: 'pour les personnes accompagnées',
    mots: ['simple', 'langage', 'document', 'accompagnees', 'facile'] },
  { id: 13, nom: 'Préparer un atelier', famille: 'Pour les professionnels', redige: true, pro: true, variantes: 'le déroulé, des exercices à faire en groupe',
    mots: ['atelier', 'animer', 'animation', 'collectif', 'groupe', 'seance', 'deroule', 'exercices'] }
];

// Définition de chaque modèle dont le texte existe : où lire ses phrases, ses champs, ses choix, et l'ORDRE d'assemblage de la demande.
// Modèles codés : les treize. Les phrases elles-mêmes sont dans le fichier indiqué (jamais dans le code).
//  - champs : ce que la personne écrit ; `gardee: false` : jamais envoyé sur la disquette (un courrier peut contenir des données personnelles) ; `repere` : le repère {{...}} remplacé dans le bloc ; `vide` : ce qui s'affiche tant que le champ est vide (et bloque la copie) ; `court` : le nom du champ dans le message « complétez... ».
//  - groupes : un seul bloc par groupe (jamais deux phrases contradictoires) ; `element` : l'élément de la demande (1 à 6, la couleur).
//  - `sansPointFinal` (champ) : le point final écrit par la personne est retiré (le bloc ajoute le sien) ; `facultatifSi: { groupe, v }` (champ) : le champ n'est pas exigé quand ce choix est fait ; `facultatif: true` (champ) : le champ n'est jamais exigé.
//  - `papier: true` (champ) : le champ qui reçoit le papier ou le texte déjà collé à l'étape 1 ; `masquer: true` (champ) : le champ porte le bouton « Masquer les numéros et courriels » (un CV, un parcours) ; `alerteDates: true` (modèle) : l'écran signale une date proche trouvée dans ce papier ; `suite: [..]` (modèle) : les boutons proposés à l'étape 3 (`repondre`, `rendezvous`), dans l'ordre, le premier en couleur.
//  - `crochetsPermis` (modèle) : les rares textes entre crochets que la demande donne en consigne à l'assistant (par exemple « [à compléter] » dans le courrier à écrire) ; ils ne comptent pas comme un champ resté vide.
//  - `ecran` (modèle) : l'ordre des champs et des choix à l'écran Compléter ; { groupes: [..] } place plusieurs choix dans un même bloc.
//  - ordre : bloc (un bloc du fichier), groupe (le bloc choisi dans le groupe), code (une ligne produite par le code : date du jour, reprise de la date) ; `saut` : une ligne vide avant ; `sauf: { groupe: valeur }` : l'élément est omis quand ce choix est fait ; `siChamp: 'id'` : l'élément n'est envoyé que si ce champ est rempli ; `sansChamp: 'id'` : l'élément n'est envoyé que si ce champ est vide (le plan standard quand aucun plan n'est collé).
//  - `confirmation: { lib, court }` (modèle, les trois modèles pour les professionnels) : une case à cocher (« J'ai retiré les noms… ») sans laquelle la demande ne se copie pas ; elle n'est jamais gardée sur la disquette et se redemande à chaque réouverture ; elle se décoche quand le texte collé change.
var BUIA_DEF_MODELES = {
  1: {
    fichier: 'prompts/bien-utiliser-modele-1.md', version: '1', suite: [],
    crochetsPermis: ['[à compléter]', '[mon nom]', '[mon téléphone]'],
    champs: [
      { id: 'poste', repere: 'poste', lib: 'Le poste visé', aide: 'Le métier ou le poste.', exemple: 'Ex. : agent d’accueil', lignes: 1, vide: '[à compléter]', court: 'le poste', sansPointFinal: true },
      { id: 'entreprise', repere: 'entreprise', lib: 'L’entreprise', aide: 'Son nom, ou son type si vous ne la connaissez pas.', exemple: 'Ex. : une grande surface près de chez moi', lignes: 1, vide: '[à compléter]', court: 'l’entreprise', sansPointFinal: true },
      { id: 'parcours', repere: 'parcours', lib: 'Mon parcours, avec mes mots', aide: 'Quelques phrases : vos métiers, vos formations, ce que vous savez faire. Sans votre nom ni vos coordonnées.', exemple: 'Ex. : trois ans en caisse, un stage en accueil, je sais renseigner les clients', lignes: 4, vide: '[à compléter]', court: 'votre parcours', gardee: false, masquer: true, sansPointFinal: true },
      { id: 'offre', repere: 'offre', lib: 'L’offre d’emploi', aide: 'Le texte de l’offre. Si vous n’avez pas d’offre, laissez cette case vide.', exemple: 'Collez l’offre ici', lignes: 6, vide: '[à compléter : coller l’offre ici]', court: 'l’offre', gardee: false, papier: true, facultatif: true }
    ],
    groupes: [
      { id: 'objectif', titre: 'Ce que je veux faire', element: 1, defaut: 'offre', choix: [{ v: 'offre', lib: 'Répondre à une offre', bloc: 'objectif-offre' }, { v: 'spontanee', lib: 'Candidature spontanée', bloc: 'objectif-spontanee' }, { v: 'relance', lib: 'Relancer', bloc: 'objectif-relance' }, { v: 'remerciement', lib: 'Remercier après un entretien', bloc: 'objectif-remerciement' }, { v: 'immersion', lib: 'Demander un stage ou une immersion', bloc: 'objectif-immersion' }] },
      { id: 'longueur', titre: 'Longueur du mail', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'langage', titre: 'Langage', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'objectif' }, { champ: 'poste' }, { champ: 'entreprise' }, { champ: 'parcours' }, { champ: 'offre' }, { groupes: ['longueur', 'langage'] }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'objectif' },
      { code: 'dateDuJour', element: 6, saut: true },
      { bloc: 'parcours', element: 2 },
      { bloc: 'offre', element: 3, saut: true, siChamp: 'offre' },
      { bloc: 'format', element: 4, saut: true },
      { groupe: 'longueur' },
      { groupe: 'langage' },
      { bloc: 'ton', element: 5 },
      { bloc: 'genre', element: 5 },
      { bloc: 'texte-simple', element: 5 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  2: {
    fichier: 'prompts/bien-utiliser-modele-2.md', version: '1', suite: [],
    champs: [
      { id: 'offre', repere: 'offre', lib: 'L’offre d’emploi', aide: 'Collez le texte de l’offre.', exemple: 'Collez l’offre ici', lignes: 7, vide: '[à compléter : coller l’offre ici]', court: 'l’offre', gardee: false, papier: true },
      { id: 'cv', repere: 'cv', lib: 'Mon CV', aide: 'Collez le texte de votre CV, sans votre nom, votre adresse, votre téléphone ni votre courriel.', exemple: 'Collez votre CV ici', lignes: 9, vide: '[à compléter : coller le CV ici]', court: 'votre CV', gardee: false, masquer: true }
    ],
    groupes: [
      { id: 'exemples', titre: 'Voulez-vous aussi un exemple de phrase pour chaque point à améliorer ?', element: 4, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'exemples-non' }, { v: 'oui', lib: 'Oui', bloc: 'exemples-oui' }] },
      { id: 'longueur', titre: 'Longueur de la réponse', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'langage', titre: 'Langage', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ champ: 'offre' }, { champ: 'cv' }, { groupe: 'exemples' }, { groupes: ['longueur', 'langage'] }, { groupe: 'questions' }],
    ordre: [
      { bloc: 'but', element: 1 },
      { bloc: 'cv', element: 3, saut: true },
      { bloc: 'offre', element: 3, saut: true },
      { bloc: 'plan', element: 4, saut: true },
      { groupe: 'exemples' },
      { groupe: 'longueur' },
      { groupe: 'langage' },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  3: {
    fichier: 'prompts/bien-utiliser-modele-3.md', version: '1', suite: [],
    champs: [
      { id: 'poste', repere: 'poste', lib: 'Le poste visé', aide: 'Le métier ou le poste.', exemple: 'Ex. : agent d’accueil', lignes: 1, vide: '[à compléter]', court: 'le poste', sansPointFinal: true },
      { id: 'parcours', repere: 'parcours', lib: 'Mon parcours, avec mes mots', aide: 'Quelques phrases : vos métiers, vos formations, ce que vous savez faire. Sans votre nom ni vos coordonnées.', exemple: 'Ex. : trois ans en caisse, un stage en accueil, je sais renseigner les clients', lignes: 4, vide: '[à compléter]', court: 'votre parcours', gardee: false, masquer: true, sansPointFinal: true },
      { id: 'trou', repere: 'trou', lib: 'Ce que je veux expliquer', aide: 'Une période sans emploi, un arrêt, un changement de métier. Vous choisissez ce que vous voulez dire, rien de plus.', exemple: 'Ex. : je me suis arrêté deux ans pour m’occuper de ma famille', lignes: 3, vide: '[à compléter]', court: 'ce que vous voulez expliquer', gardee: false, sansPointFinal: true, facultatifSi: { groupe: 'objectif', v: 'entrainement' } },
      { id: 'offre', repere: 'offre', lib: 'L’offre d’emploi', aide: 'Le texte de l’offre. Si vous n’avez pas d’offre, laissez cette case vide.', exemple: 'Collez l’offre ici', lignes: 6, vide: '[à compléter : coller l’offre ici]', court: 'l’offre', gardee: false, papier: true, facultatif: true }
    ],
    groupes: [
      { id: 'objectif', titre: 'Ce que je veux faire', element: 1, defaut: 'entrainement', choix: [{ v: 'entrainement', lib: 'M’entraîner aux questions', bloc: 'objectif-entrainement' }, { v: 'trou', lib: 'Expliquer un trou dans mon parcours', bloc: 'objectif-trou' }] },
      { id: 'langage', titre: 'Langage', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'objectif' }, { champ: 'poste' }, { champ: 'parcours' }, { champ: 'trou' }, { champ: 'offre' }, { groupe: 'langage' }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'objectif' },
      { bloc: 'parcours', element: 2 },
      { bloc: 'trou', element: 2, siChamp: 'trou', sauf: { objectif: 'entrainement' } },
      { bloc: 'offre', element: 3, saut: true, siChamp: 'offre' },
      { bloc: 'faire-entrainement', element: 4, saut: true, sauf: { objectif: 'trou' } },
      { bloc: 'faire-trou', element: 4, saut: true, sauf: { objectif: 'entrainement' } },
      { groupe: 'langage' },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  4: {
    fichier: 'prompts/bien-utiliser-modele-4.md', version: '3.1', alerteDates: true, suite: ['repondre', 'rendezvous'],
    champs: [
      { id: 'situation', repere: 'situation', lib: 'Ma situation, en une phrase', aide: 'Vous pouvez écrire comme vous parlez, ou dicter.', exemple: 'Ex. : j’ai reçu ce courrier de la caisse et je ne sais pas quoi faire', lignes: 2, vide: '[à compléter]', court: 'votre situation', sansPointFinal: true },
      { id: 'courrier', repere: 'courrier', lib: 'Le courrier', aide: 'Sans votre nom ni vos numéros.', exemple: 'Collez le courrier ici', lignes: 6, vide: '[à compléter : coller le courrier ici]', court: 'le courrier', gardee: false, papier: true }
    ],
    groupes: [
      { id: 'variante', titre: 'Ce que je veux', element: 4, defaut: 'complet', choix: [{ v: 'complet', lib: 'Comprendre tout le courrier', bloc: 'points-complet' }, { v: 'faire', lib: 'Seulement ce que je dois faire, et pour quand', bloc: 'points-faire' }] },
      { id: 'longueur', titre: 'Longueur de la réponse', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'langage', titre: 'Langage', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] },
      { id: 'droits', titre: 'Voulez-vous aussi un rappel général de vos droits ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'droits-non' }, { v: 'oui', lib: 'Oui', bloc: 'droits-oui' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'variante' }, { champ: 'situation' }, { champ: 'courrier' }, { groupes: ['longueur', 'langage'] }, { groupe: 'droits' }, { groupe: 'questions' }],
    ordre: [
      { bloc: 'but', element: 1 },
      { code: 'dateDuJour', element: 6, saut: true },
      { code: 'repriseDate', element: 6 },
      { bloc: 'situation', element: 2 },
      { bloc: 'courrier', element: 3, saut: true },
      { groupe: 'variante', saut: true },
      { groupe: 'longueur', saut: true },
      { groupe: 'langage' },
      { groupe: 'droits' },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  5: {
    fichier: 'prompts/bien-utiliser-modele-5.md', version: '3.3', alerteDates: true, suite: ['rendezvous'],
    crochetsPermis: ['[à compléter]', '[mon nom]', '[mon adresse]', '[mon téléphone]'],
    champs: [
      { id: 'message', repere: 'message', lib: 'Ce que je veux dire, avec mes mots', aide: 'Vous pouvez écrire comme vous parlez, ou dicter : les fautes ne gênent pas.', exemple: 'Ex. : je vous envoie les pièces demandées et je voudrais savoir où les envoyer', lignes: 3, vide: '[à compléter]', court: 'ce que vous voulez dire', sansPointFinal: true },
      { id: 'courrier', repere: 'courrier', lib: 'Le courrier reçu', aide: 'Sans votre nom ni vos numéros.', exemple: 'Collez le courrier ici', lignes: 6, vide: '[à compléter : coller le courrier ici]', court: 'le courrier', gardee: false, papier: true, facultatifSi: { groupe: 'conversation', v: 'oui' } }
    ],
    groupes: [
      { id: 'conversation', titre: 'Je continue dans la même conversation que celle où l’assistant m’a expliqué le courrier', element: 1, defaut: 'non', choix: [{ v: 'non', lib: 'Non, nouvelle conversation', bloc: 'conversation-non' }, { v: 'oui', lib: 'Oui, même conversation', bloc: 'conversation-oui' }] },
      { id: 'objectif', titre: 'Ce que je veux faire', element: 1, defaut: 'pieces', choix: [{ v: 'pieces', lib: 'Fournir des pièces', bloc: 'objectif-pieces' }, { v: 'explication', lib: 'Demander une explication', bloc: 'objectif-explication' }, { v: 'delai', lib: 'Demander un délai', bloc: 'objectif-delai' }, { v: 'rendezvous', lib: 'Demander un rendez-vous', bloc: 'objectif-rendezvous' }, { v: 'changement', lib: 'Signaler un changement de situation', bloc: 'objectif-changement' }] },
      { id: 'longueur', titre: 'Longueur du courrier', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'langage', titre: 'Langage', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'conversation' }, { groupe: 'objectif' }, { champ: 'message' }, { champ: 'courrier' }, { groupes: ['longueur', 'langage'] }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'conversation' },
      { code: 'dateDuJour', element: 6, saut: true },
      { groupe: 'objectif' },
      { bloc: 'message', element: 2 },
      { bloc: 'courrier', element: 3, saut: true, sauf: { conversation: 'oui' } },
      { bloc: 'format', element: 4, saut: true },
      { groupe: 'longueur', saut: true },
      { groupe: 'langage' },
      { bloc: 'ton', element: 5 },
      { bloc: 'temps', element: 5 },
      { bloc: 'texte-simple', element: 5 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  9: {
    fichier: 'prompts/bien-utiliser-modele-9.md', version: '3.3', alerteDates: true, suite: ['repondre'],
    champs: [
      { id: 'organisme', repere: 'organisme', lib: 'Avec qui', aide: 'Le type d’organisme, sans nom de personne.', exemple: 'Ex. : mon agence pour l’emploi', lignes: 1, vide: '[à compléter]', court: 'avec qui', sansPointFinal: true },
      { id: 'objectif', repere: 'objectif', lib: 'Mon objectif', aide: 'Ce que vous voulez obtenir ou comprendre. Vous pouvez écrire comme vous parlez, ou dicter.', exemple: 'Ex. : comprendre ce qui est attendu de moi et ne rien oublier', lignes: 2, vide: '[à compléter]', court: 'votre objectif', sansPointFinal: true },
      { id: 'situation', repere: 'situation', lib: 'Ce que je sais déjà de ma situation', aide: 'Sans nom ni numéro. Les fautes ne gênent pas.', exemple: 'Ex. : j’ai reçu une convocation et je ne sais pas ce que je dois apporter', lignes: 3, vide: '[à compléter]', court: 'votre situation', sansPointFinal: true },
      { id: 'courrier', repere: 'courrier', lib: 'Le courrier de convocation', aide: 'Sans votre nom ni vos numéros. Si vous n’avez pas de courrier, laissez cette case vide.', exemple: 'Collez le courrier ici', lignes: 6, vide: '[à compléter : coller le courrier ici]', court: 'le courrier', gardee: false, papier: true, facultatif: true }
    ],
    groupes: [
      { id: 'forme', titre: 'Je prépare', element: 1, defaut: 'rendezvous', choix: [{ v: 'rendezvous', lib: 'Un rendez-vous', bloc: 'forme-rendezvous' }, { v: 'appel', lib: 'Un appel', bloc: 'forme-appel' }] },
      { id: 'longueur', titre: 'Longueur de la réponse', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'langage', titre: 'Langage', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] },
      { id: 'droits', titre: 'Voulez-vous aussi un rappel général de vos droits ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'droits-non' }, { v: 'oui', lib: 'Oui', bloc: 'droits-oui' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'forme' }, { champ: 'organisme' }, { champ: 'objectif' }, { champ: 'situation' }, { champ: 'courrier' }, { groupes: ['longueur', 'langage'] }, { groupe: 'droits' }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'forme' },
      { code: 'dateDuJour', element: 6, saut: true },
      { code: 'repriseDate', element: 6 },
      { bloc: 'objectif', element: 1 },
      { bloc: 'situation', element: 2 },
      { bloc: 'courrier', element: 3, saut: true, siChamp: 'courrier' },
      { groupe: 'longueur', saut: true },
      { bloc: 'flou', element: 4, siChamp: 'courrier' },
      { bloc: 'voix', element: 4 },
      { groupe: 'langage' },
      { groupe: 'droits' },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  6: {
    fichier: 'prompts/bien-utiliser-modele-6.md', version: '1', suite: [],
    crochetsPermis: ['[à compléter]', '[mon nom]'],
    champs: [
      { id: 'destinataire', repere: 'destinataire', lib: 'À qui j’écris', aide: 'Le type de personne, sans nom : mon employeur, mon propriétaire, une collègue.', exemple: 'Ex. : mon propriétaire', lignes: 1, vide: '[à compléter]', court: 'à qui vous écrivez', sansPointFinal: true },
      { id: 'message', repere: 'message', lib: 'Ce que je veux dire, avec mes mots', aide: 'Vous pouvez écrire comme vous parlez, ou dicter : les fautes ne gênent pas.', exemple: 'Ex. : je serai en retard de dix minutes à la réunion de demain', lignes: 3, vide: '[à compléter]', court: 'ce que vous voulez dire', sansPointFinal: true },
      { id: 'recu', repere: 'recu', lib: 'Le message que j’ai reçu', aide: 'Utile pour répondre ou relancer. Sans nom ni numéro. Si vous n’avez pas de message, laissez cette case vide.', exemple: 'Collez le message ici', lignes: 5, vide: '[à compléter : coller le message ici]', court: 'le message reçu', gardee: false, papier: true, facultatif: true }
    ],
    groupes: [
      { id: 'objectif', titre: 'Ce que je veux faire', element: 1, defaut: 'repondre', choix: [{ v: 'repondre', lib: 'Répondre', bloc: 'objectif-repondre' }, { v: 'relancer', lib: 'Relancer', bloc: 'objectif-relancer' }, { v: 'refuser', lib: 'Refuser poliment', bloc: 'objectif-refuser' }, { v: 'excuser', lib: 'M’excuser d’un retard', bloc: 'objectif-excuser' }] },
      { id: 'ton', titre: 'Ton', element: 4, defaut: 'sobre', choix: [{ v: 'sobre', lib: 'Sobre', bloc: 'ton-sobre' }, { v: 'chaleureux', lib: 'Chaleureux', bloc: 'ton-chaleureux' }] },
      { id: 'longueur', titre: 'Longueur du mail', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'langage', titre: 'Langage', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'objectif' }, { champ: 'destinataire' }, { champ: 'message' }, { champ: 'recu' }, { groupes: ['ton', 'longueur', 'langage'] }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'objectif' },
      { code: 'dateDuJour', element: 6, saut: true },
      { bloc: 'message', element: 2 },
      { bloc: 'recu', element: 3, saut: true, siChamp: 'recu' },
      { bloc: 'format', element: 4, saut: true },
      { groupe: 'ton' },
      { groupe: 'longueur' },
      { groupe: 'langage' },
      { bloc: 'voix', element: 5 },
      { bloc: 'texte-simple', element: 5 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  7: {
    fichier: 'prompts/bien-utiliser-modele-7.md', version: '1', suite: [],
    champs: [
      { id: 'texte', repere: 'texte', lib: 'Le texte à transformer', aide: 'Sans nom ni numéro. Le texte peut venir d’un courrier, d’un mail ou de vos notes.', exemple: 'Collez le texte ici', lignes: 8, vide: '[à compléter : coller le texte ici]', court: 'le texte', gardee: false, papier: true },
      { id: 'contexte', repere: 'contexte', lib: 'À qui il s’adresse ou à quoi il sert', aide: 'Une phrase, si cela change la façon de l’écrire. Si vous n’avez rien à ajouter, laissez cette case vide.', exemple: 'Ex. : un message à mon propriétaire', lignes: 2, vide: '[à compléter]', court: 'à qui il s’adresse', sansPointFinal: true, facultatif: true }
    ],
    groupes: [
      { id: 'transformation', titre: 'Ce que je veux', element: 1, defaut: 'simple', choix: [{ v: 'simple', lib: 'Plus simple', bloc: 'transformation-simple' }, { v: 'court', lib: 'Plus court, un résumé', bloc: 'transformation-court' }, { v: 'pose', lib: 'Plus posé', bloc: 'transformation-pose' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'transformation' }, { champ: 'contexte' }, { champ: 'texte' }, { groupe: 'questions' }],
    ordre: [
      { bloc: 'but', element: 1 },
      { bloc: 'contexte', element: 2, siChamp: 'contexte' },
      { bloc: 'texte', element: 3, saut: true },
      { groupe: 'transformation', saut: true },
      { bloc: 'sortie', element: 4 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  8: {
    fichier: 'prompts/bien-utiliser-modele-8.md', version: '1', suite: [],
    champs: [
      { id: 'objet', repere: 'objet', lib: 'Le mot ou le texte à expliquer', aide: 'Un mot, une phrase, un document ou les intitulés d’un formulaire, sans nom ni numéro. Pour un formulaire, ne collez jamais un formulaire déjà rempli.', exemple: 'Ex. : forclusion', lignes: 6, vide: '[à compléter : écrire le mot ou coller le texte ici]', court: 'le mot ou le texte', gardee: false, papier: true },
      { id: 'lieu', repere: 'lieu', lib: 'Où je l’ai rencontré', aide: 'Une phrase, si cela aide à comprendre. Si vous n’avez rien à ajouter, laissez cette case vide.', exemple: 'Ex. : dans un courrier de la caisse d’allocations', lignes: 2, vide: '[à compléter]', court: 'où vous l’avez rencontré', sansPointFinal: true, facultatif: true }
    ],
    groupes: [
      { id: 'quoi', titre: 'Je veux comprendre', element: 1, defaut: 'mot', choix: [{ v: 'mot', lib: 'Un mot', bloc: 'quoi-mot' }, { v: 'document', lib: 'Un document', bloc: 'quoi-document' }, { v: 'formulaire', lib: 'Un formulaire, case par case', bloc: 'quoi-formulaire' }] },
      { id: 'forme', titre: 'Façon d’expliquer', element: 4, defaut: 'simple', choix: [{ v: 'simple', lib: 'En langage simple', bloc: 'forme-simple' }, { v: 'etapes', lib: 'Étape par étape', bloc: 'forme-etapes' }] },
      { id: 'longueur', titre: 'Longueur de la réponse', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'quoi' }, { champ: 'objet' }, { champ: 'lieu' }, { groupes: ['forme', 'longueur'] }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'quoi' },
      { bloc: 'lieu', element: 2, siChamp: 'lieu' },
      { bloc: 'objet', element: 3, saut: true },
      { groupe: 'forme', saut: true },
      { groupe: 'longueur' },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  10: {
    fichier: 'prompts/bien-utiliser-modele-10.md', version: '1', suite: [],
    confirmation: { lib: 'J’ai retiré les noms et les données nominatives de mes notes.', court: 'la case « noms retirés »' },
    champs: [
      { id: 'notes', repere: 'notes', lib: 'Mes notes d’entretien', aide: 'Sans aucun nom, adresse, numéro ni courriel : remplacez-les par des repères (la personne, le conseiller, l’employeur). Les fautes ne gênent pas.', exemple: 'Collez vos notes ici', lignes: 10, vide: '[à compléter : coller les notes ici]', court: 'les notes', gardee: false, papier: true, masquer: true },
      { id: 'usage', repere: 'usage', lib: 'À quoi servira la synthèse', aide: 'Une phrase, si cela change ce qu’il faut mettre en avant. Si vous n’avez rien à ajouter, laissez cette case vide.', exemple: 'Ex. : préparer le prochain rendez-vous', lignes: 2, vide: '[à compléter]', court: 'à quoi servira la synthèse', sansPointFinal: true, facultatif: true }
    ],
    groupes: [
      { id: 'citations', titre: 'Citer les notes pour chaque point ?', element: 4, defaut: 'oui', choix: [{ v: 'oui', lib: 'Oui, avec le passage', bloc: 'citations-oui' }, { v: 'non', lib: 'Non', bloc: 'citations-non' }] },
      { id: 'longueur', titre: 'Longueur de la synthèse', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ champ: 'notes' }, { champ: 'usage' }, { groupes: ['citations', 'longueur'] }, { groupe: 'questions' }],
    ordre: [
      { bloc: 'but', element: 1 },
      { bloc: 'usage', element: 2, siChamp: 'usage' },
      { bloc: 'notes', element: 3, saut: true },
      { bloc: 'plan', element: 4, saut: true },
      { groupe: 'citations' },
      { groupe: 'longueur' },
      { bloc: 'ton', element: 4 },
      { bloc: 'texte-simple', element: 5 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  11: {
    fichier: 'prompts/bien-utiliser-modele-11.md', version: '1', suite: [],
    confirmation: { lib: 'J’ai retiré les noms et les données nominatives de mes notes.', court: 'la case « noms retirés »' },
    champs: [
      { id: 'notes', repere: 'notes', lib: 'Mes notes', aide: 'Sans aucun nom, adresse, numéro ni courriel : remplacez-les par des repères (la personne, le professionnel, l’employeur). Les fautes ne gênent pas.', exemple: 'Collez vos notes ici', lignes: 10, vide: '[à compléter : coller les notes ici]', court: 'les notes', gardee: false, papier: true, masquer: true },
      { id: 'gabarit', repere: 'gabarit', lib: 'Le plan de ma structure', aide: 'Les rubriques de votre modèle de compte rendu, sans donnée personnelle. Si vous n’en avez pas, laissez cette case vide : un plan simple sera proposé.', exemple: 'Ex. : 1. Contexte  2. Objectifs  3. Actions menées  4. Suites', lignes: 5, vide: '[à compléter]', court: 'le plan', facultatif: true }
    ],
    groupes: [
      { id: 'type', titre: 'Je veux écrire', element: 1, defaut: 'compterendu', choix: [{ v: 'compterendu', lib: 'Un compte rendu d’entretien', bloc: 'type-compterendu' }, { v: 'bilan', lib: 'Un bilan de parcours', bloc: 'type-bilan' }, { v: 'point', lib: 'Un point d’étape', bloc: 'type-point' }] },
      { id: 'longueur', titre: 'Longueur du document', element: 4, defaut: 'moyen', choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'type' }, { champ: 'notes' }, { champ: 'gabarit' }, { groupe: 'longueur' }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'type' },
      { bloc: 'notes', element: 3, saut: true },
      { bloc: 'gabarit', element: 2, saut: true, siChamp: 'gabarit' },
      { bloc: 'plan-standard', element: 2, saut: true, sansChamp: 'gabarit' },
      { groupe: 'longueur', saut: true },
      { bloc: 'ton', element: 4 },
      { bloc: 'texte-simple', element: 5 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  12: {
    fichier: 'prompts/bien-utiliser-modele-12.md', version: '1', suite: [],
    confirmation: { lib: 'J’ai retiré les noms et les données nominatives de mon document.', court: 'la case « noms retirés »' },
    champs: [
      { id: 'document', repere: 'document', lib: 'Le document à rendre simple', aide: 'Sans aucun nom, adresse, numéro ni courriel : remplacez-les par des repères. Le document peut être un courrier type, une notice ou un règlement.', exemple: 'Collez le document ici', lignes: 10, vide: '[à compléter : coller le document ici]', court: 'le document', gardee: false, papier: true, masquer: true },
      { id: 'public', repere: 'public', lib: 'À qui s’adresse la version simple', aide: 'Une phrase, si cela change la façon d’écrire. Si vous n’avez rien à ajouter, laissez cette case vide.', exemple: 'Ex. : des personnes qui lisent peu le français', lignes: 2, vide: '[à compléter]', court: 'à qui elle s’adresse', sansPointFinal: true, facultatif: true }
    ],
    groupes: [
      { id: 'niveau', titre: 'Niveau de simplicité', element: 4, defaut: 'simple', choix: [{ v: 'tresfacile', lib: 'Très facile', bloc: 'niveau-tresfacile' }, { v: 'simple', lib: 'Simple', bloc: 'niveau-simple' }] },
      { id: 'forme', titre: 'Forme', element: 4, defaut: 'texte', choix: [{ v: 'texte', lib: 'Un texte', bloc: 'forme-texte' }, { v: 'etapes', lib: 'Des étapes', bloc: 'forme-etapes' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ champ: 'document' }, { champ: 'public' }, { groupes: ['niveau', 'forme'] }, { groupe: 'questions' }],
    ordre: [
      { bloc: 'but', element: 1 },
      { bloc: 'public', element: 2, siChamp: 'public' },
      { bloc: 'document', element: 3, saut: true },
      { groupe: 'niveau', saut: true },
      { groupe: 'forme' },
      { bloc: 'garde', element: 4 },
      { bloc: 'texte-simple', element: 5 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  },
  13: {
    fichier: 'prompts/bien-utiliser-modele-13.md', version: '1', suite: [],
    confirmation: { lib: 'J’ai retiré les noms et les données nominatives de ce que j’ai écrit.', court: 'la case « noms retirés »' },
    champs: [
      { id: 'theme', repere: 'theme', lib: 'Le thème de l’atelier', aide: 'Ce dont l’atelier parle, en une phrase.', exemple: 'Ex. : écrire une lettre de motivation', lignes: 1, vide: '[à compléter]', court: 'le thème', sansPointFinal: true },
      { id: 'public', repere: 'public', lib: 'Le public', aide: 'Qui participe : le nombre, le niveau, ce que les personnes savent déjà. Sans nom de personne.', exemple: 'Ex. : huit personnes en recherche d’emploi, qui lisent peu le français', lignes: 2, vide: '[à compléter]', court: 'le public', sansPointFinal: true },
      { id: 'objectif', repere: 'objectif', lib: 'Ce que les participants sauront faire à la fin', aide: 'Une ou deux phrases, en commençant par un verbe : se présenter, écrire, trouver.', exemple: 'Ex. : écrire les trois premières phrases de leur lettre', lignes: 2, vide: '[à compléter]', court: 'ce que les participants sauront faire', sansPointFinal: true },
      { id: 'materiel', repere: 'materiel', lib: 'La salle et le matériel', aide: 'Si vous n’avez rien à ajouter, laissez cette case vide.', exemple: 'Ex. : une salle avec cinq ordinateurs et un paperboard', lignes: 2, vide: '[à compléter]', court: 'la salle et le matériel', sansPointFinal: true, facultatif: true }
    ],
    groupes: [
      { id: 'type', titre: 'Je veux', element: 1, defaut: 'deroule', choix: [{ v: 'deroule', lib: 'Le déroulé de l’atelier', bloc: 'type-deroule' }, { v: 'exercices', lib: 'Des exercices à faire en groupe', bloc: 'type-exercices' }] },
      { id: 'duree', titre: 'Durée', element: 4, defaut: '2h', choix: [{ v: '1h', lib: 'Une heure', bloc: 'duree-1h' }, { v: '2h', lib: 'Deux heures', bloc: 'duree-2h' }, { v: 'demi', lib: 'Une demi-journée', bloc: 'duree-demi' }] },
      { id: 'questions', titre: 'Laisser l’assistant me poser d’abord des questions ?', element: 5, defaut: 'non', choix: [{ v: 'non', lib: 'Non', bloc: 'questions-non' }, { v: 'oui', lib: 'Oui', bloc: 'questions-oui' }] }
    ],
    ecran: [{ groupe: 'type' }, { champ: 'theme' }, { champ: 'public' }, { champ: 'objectif' }, { champ: 'materiel' }, { groupe: 'duree' }, { groupe: 'questions' }],
    ordre: [
      { groupe: 'type' },
      { bloc: 'theme', element: 2, saut: true },
      { bloc: 'public', element: 2 },
      { bloc: 'objectif', element: 2 },
      { bloc: 'materiel', element: 2, siChamp: 'materiel' },
      { groupe: 'duree', saut: true },
      // Variante « exercices » : `plan-exercices` remplace les six temps (essai du 25/11/2026 : la réponse refaisait tout le déroulé).
      { bloc: 'plan', element: 4, sauf: { type: 'exercices' } },
      { bloc: 'plan-exercices', element: 4, sauf: { type: 'deroule' } },
      { bloc: 'ton', element: 4 },
      { bloc: 'texte-simple', element: 5 },
      { groupe: 'questions' },
      { bloc: 'regles', element: 5, saut: true }
    ]
  }
};

// Trois courriers FICTIFS pour essayer sans papier réel (corpus du 23/11/2026 : docs/RECHERCHE_COURRIERS_ET_CORPUS_BIEN_UTILISER_L_IA_2026-11-23.md).
// Ville, numéros et organismes inventés. Les dates sont celles du corpus (novembre 2026) : elles servent aux essais de l'alerte de date.
var BUIA_COURRIERS_FICTIFS = {
  A: { bouton: 'Courrier fictif : pièces à fournir',
    texte: 'Caisse d’allocations de Villeneuve-Exemple, service des prestations\nVilleneuve-Exemple, le 12 novembre 2026\nRéférence du dossier : 0000-EX-123\n\nObjet : demande de pièces justificatives\n\nMadame, Monsieur,\n\nDans le cadre de l’examen de votre dossier, nous constatons que certaines informations sont incomplètes. Nous vous remercions de nous faire parvenir, dans un délai de 15 jours à compter de la réception du présent courrier :\n- un justificatif de ressources récent ;\n- une pièce d’identité en cours de validité ;\n- l’attestation de votre employeur ou de votre ancien employeur.\n\nÀ défaut de réponse dans ce délai, le versement de vos prestations pourra être suspendu.\nVous pouvez déposer ces documents sur votre espace en ligne ou les envoyer par courrier à l’adresse ci-dessous.\n\nNous vous prions d’agréer, Madame, Monsieur, l’expression de nos salutations distinguées.\n\nLe responsable du service' },
  B: { bouton: 'Courrier fictif : convocation',
    texte: 'Agence de l’emploi de Villeneuve-Exemple\nVilleneuve-Exemple, le 5 novembre 2026\n\nObjet : convocation à un entretien de suivi\n\nMadame, Monsieur,\n\nNous vous convoquons à un entretien de suivi le mardi 24 novembre 2026 à 14 h 30, dans nos locaux. Merci de vous munir des documents utiles à votre situation.\nSi vous ne pouvez pas vous présenter, vous devez nous en informer au plus tôt, par votre espace personnel ou par téléphone.\nUne absence non justifiée à cet entretien peut avoir des conséquences sur votre situation.\n\nCordialement,\n\nVotre conseiller' },
  C: { bouton: 'Courrier fictif : trop-perçu',
    texte: 'Caisse d’allocations de Villeneuve-Exemple, service des indus\nVilleneuve-Exemple, le 18 novembre 2026\nRéférence du dossier : 0000-EX-456\n\nObjet : notification d’un trop-perçu\n\nMadame, Monsieur,\n\nAprès vérification de votre dossier, il apparaît que vous avez perçu à tort la somme de 287,40 euros au titre de la période du 1er mars au 31 mai 2026, en raison d’une modification de vos ressources non déclarée. Cette somme doit être remboursée.\nÀ défaut de remboursement ou de réponse dans un délai de deux mois, des retenues pourront être effectuées sur vos prestations à venir.\nVous pouvez demander des précisions sur le calcul de cette somme auprès de votre caisse.\nSi vous contestez cette décision, vous pouvez former un recours dans un délai de deux mois à compter de la réception du présent courrier.\n\nSalutations distinguées.\n\nLe service des indus' }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUIA_FAMILLES: BUIA_FAMILLES, BUIA_RAPPEL_PRO: BUIA_RAPPEL_PRO, BUIA_MODELES: BUIA_MODELES, BUIA_DEF_MODELES: BUIA_DEF_MODELES, BUIA_COURRIERS_FICTIFS: BUIA_COURRIERS_FICTIFS };
}
