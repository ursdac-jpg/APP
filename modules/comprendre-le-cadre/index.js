/* ============================================================
   modules/comprendre-le-cadre/index.js
   ------------------------------------------------------------
   Module « Comprendre le cadre » (sous-carte de « Se tenir informé »).
   Point d'entrée unique et orchestrateur pur du module, même principe
   que modules/reperes/index.js : jamais un module qui laisse son rendu
   dans js/app.js. Voir ARCHITECTURE_TECHNIQUE.md (ce dossier) pour le
   détail des dépendances et des points de contact avec le reste d'ERIP.

   RÈGLE STRICTE (FAMILLE 1, décision de la maquette) : module de pure
   consultation. Aucune donnée personnelle n'y transite, rien n'est
   écrit dans `dossier`, rien à sauvegarder ni à reprendre - l'état de
   navigation interne (rayon ouvert, fiche ouverte) est volontairement
   perdu au rechargement de la page, jamais persisté. Aucun assistant en
   ligne n'est appelé depuis ce fichier : un texte de recherche peut être
   préparé pour être copié ailleurs, mais aucun `fetch()` vers un
   assistant ne part d'ici.

   Statut : étape 6 (accueil, lecture réelle d'un rayon, orienteur « Par
   où commencer ? » fonctionnel, écran « Près de chez moi » par rayon -
   une structure n'affiche un lien que si son adresse est vérifiée dans
   liens-verifies.txt, LECONS 9.16 -, module réellement routé depuis
   l'accueil d'ERIP, 2 des 5 outils de la maquette : les digests
   trimestriels Balayage et Chiffres. Restent hors périmètre : le récit
   libre de l'orienteur envoyé à un assistant, le tableau des sources
   officielles, « Vérifier une information récente » et le digest « À
   confronter » - voir ARCHITECTURE_TECHNIQUE.md, "Étapes d'implémentation").
   ============================================================ */

// ============================================================
// MODÈLE
// ============================================================

// Emplacement du contenu : modules/comprendre-le-cadre/contenu/<rayon>/*.md.
// Les 14 rayons y ont ete migres et verifies sur les sources officielles
// entre le 2026-09-05 et le 2026-09-06 (voir ARCHITECTURE_TECHNIQUE.md).
// Chemin en variable plutot que fige en dur dans chaque fetch() : permet
// de rebrancher le harnais de test sur un autre dossier en le redefinissant
// avant le premier appel.
var COMPRENDRE_LE_CADRE_BASE_CONTENU = 'modules/comprendre-le-cadre/contenu/';

// Registre partagé (pas un fichier par rayon) qui associe un nom court
// (ex. "spip-dordogne") à une adresse et sa date de vérification
// humaine. Chemin configurable pour la même raison que
// COMPRENDRE_LE_CADRE_BASE_CONTENU ci-dessus.
var COMPRENDRE_LE_CADRE_CHEMIN_LIENS_VERIFIES = 'modules/comprendre-le-cadre/liens-verifies.txt';
var COMPRENDRE_LE_CADRE_CHEMIN_SOURCES = 'modules/comprendre-le-cadre/sources.txt';

// Fiches « méthode » (contenu/methode/) affichées en bas de l'accueil dans
// un dépliant « Comment lire ces fiches » (décision Denis 2026-09-06,
// option A). « comment-lire-un-taux-de-chomage » est parti dans le module
// « Comprendre les chiffres ».
var COMPRENDRE_LE_CADRE_METHODE_FICHES = [
  'comment-savoir-quelle-regle-s-applique-a-ma-situation',
  'reconnaitre-une-source-officielle'
];
var _comprendreLeCadreCacheMethode = null;
var _comprendreLeCadreCacheSourcesOfficielles = null;
var _comprendreLeCadreAccueilExtraEtat = 'inactif';

// Etat de navigation interne, volontairement hors de `dossier` (voir la
// regle stricte en tete de fichier) : ecran courant, rayon ouvert, fiche
// ouverte. Perdu au rechargement, jamais persiste.
var _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null };

// Détour de consultation : vrai pendant qu'on regarde la page de
// présentation APRÈS avoir cliqué "Revoir la présentation" depuis le
// module (pageIntroSeTenirInforme(), data/metiers.js, s'en sert pour
// afficher "Revenir au module" au lieu du CTA normal). Remis à faux dès
// qu'on est de retour DANS le module (haut de pageComprendreLeCadre()).
// Famille 1 : pas d'encart de reprise, juste ce drapeau.
var _comprendreLeCadreDetourPresentation = false;

// Cache mémoire uniquement (jamais localStorage - la regle stricte
// n'exclut pas de garder un rayon deja charge en RAM le temps de la
// session, seulement de le PERSISTER). id de rayon -> tableau de fiches
// deja chargees et analysees. Evite de refaire les fetch() a chaque
// aller-retour rayon <-> fiche dans la meme visite.
var _comprendreLeCadreCache = {};

// Cache mémoire des structures « à qui s'adresser » par rayon (issues de
// <rayon>.collecte.md) et du registre liens-verifies.txt (partagé, chargé
// une seule fois pour toute la session). Même principe que
// _comprendreLeCadreCache ci-dessus.
var _comprendreLeCadreCacheStructures = {};
var _comprendreLeCadreCacheLiensVerifies = null;

// Les 2 outils de consultation de l'etape 6 (sur les 5 de la maquette -
// « Trouver une source officielle » et « Vérifier une information
// récente » restent hors périmètre, non traités ici). `dossier` = le
// sous-dossier de contenu ET la valeur d'écran (`_comprendreLeCadreEtat.ecran`),
// les deux coïncident toujours pour ces 2 outils - une seule clé, jamais
// une table de correspondance à tenir à jour en double.
// 2026-09-06 : le digest « Comprendre les chiffres » est SORTI d'ici -
// il est devenu un module a part entiere (2e sous-carte de « Se tenir
// informe », modules/comprendre-les-chiffres/, decision Denis, chantier
// docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md). Ne reste ici que le Balayage.
var COMPRENDRE_LE_CADRE_OUTILS = [
  { dossier: 'balayage', icone: 'bi-megaphone', titre: 'Ce qui a changé récemment',
    quoi: 'Le digest trimestriel des changements officiels (emploi, formation, droits sociaux, séjour). Daté, sourcé.',
    accroche: 'Les changements officiels du dernier trimestre, en emploi, formation, insertion, droits sociaux et séjour.' }
];

// Barre d'étapes du module (retour Denis, 2026-09-05) : liste FIXE et
// toujours entièrement affichée, même principe que CT_ETAPES
// (modules/coherence-transversale/ui.js, implémentation de référence
// LANGAGE_VISUEL_COMMUN 5bis) et COMPARER_NAV_ETAPES - jamais le nom du
// module lui-même en première pastille (ça ne dit rien : on est
// évidemment dans le module), toujours des zones réelles de navigation.
// Le module n'étant pas un parcours linéaire mais un centre avec 3 zones
// parallèles (rayons, orienteur, outils), la coche « fait » d'une zone
// non visitée reste approximative si on saute directement à une autre -
// même limite qu'un sommaire classique face à une navigation libre,
// largement compensée par la cohérence avec le reste d'ERIP.
var COMPRENDRE_LE_CADRE_ETAPES = [
  { label: 'Accueil', icone: '&#127968;' },
  { label: 'Un rayon', icone: '&#128203;' },
  { label: 'Affiner ma recherche', icone: '&#128269;' },
  { label: 'Outils', icone: '&#128202;' }
];

// Nombre de trimestres passés que l'on tente de charger pour l'archive
// (8 = 2 ans) - un simple fetch() par mois candidat, tolérant au 404 des
// mois pas encore publiés. Pas de manifeste séparé à tenir à jour : le
// nom de fichier EST l'information (décision VEILLE_PROMPTS.md 5bis),
// même principe que le README de rayon pour les fiches.
var COMPRENDRE_LE_CADRE_NB_TRIMESTRES_ARCHIVE = 8;

// Table déterministe de l'orienteur « Par où commencer ? » (décision 19
// de la maquette). Une case cochée affiche toujours le même rayon,
// jamais un tri par pertinence, jamais un avis sur la personne. Clés =
// vrais id de rayon (rayon: dans le frontmatter des fiches), pas les
// clés de démo de la maquette (qui utilisait "contrats" au lieu de
// "emploi", et n'avait aucune case pour "accompagnement" - corrigé ici,
// voir échange du 2026-09-04).
var ORIENTEUR_CASES = [
  { r: 'emploi', libelle: "J'ai une question sur mon contrat de travail" },
  { r: 'former', libelle: 'Je veux me former ou changer de métier' },
  { r: 'accompagnement', libelle: "Je cherche à être accompagné vers l'emploi" },
  { r: 'creer', libelle: 'Je veux créer mon activité' },
  { r: 'employeurs', libelle: "Je veux comprendre le point de vue d'un employeur" },
  { r: 'jeunes', libelle: "J'ai moins de 26 ans" },
  { r: 'seniors', libelle: "J'ai plus de 50 ans, je pense à ma fin de carrière ou à la retraite" },
  { r: 'handicap', libelle: 'J\'ai un souci de santé qui gêne mon travail' },
  { r: 'etranger', libelle: "Je viens d'un autre pays" },
  { r: 'justice', libelle: 'Je sors de détention' },
  { r: 'budget', libelle: "J'ai des dettes, des difficultés d'argent" },
  { r: 'mobilite', libelle: "Je n'ai pas de moyen de transport" },
  { r: 'logement', libelle: "J'ai un problème de logement" },
  { r: 'garde', libelle: "J'ai un problème de garde d'enfant" },
  { r: 'francais', libelle: 'Je comprends mal le français écrit' },
  { r: 'juridique', libelle: "J'ai un litige, un problème de droit" },
  { r: 'sante', libelle: "Je n'arrive pas à trouver un médecin près de chez moi" }
];

// ============================================================
// « Affiner ma recherche » : la recherche libre en deux temps.
// Conception : docs/CHANTIER_COMPRENDRE_LE_CADRE_RECHERCHE_LIBRE.md,
// maquette docs/MAQUETTE_COMPRENDRE_LE_CADRE_RECHERCHE_LIBRE_2026-09-06.html
// (validée par Denis le 2026-09-06). Comble le 2e temps de l'orienteur,
// laissé « hors périmètre » lors des 7 étapes et jamais repris.
// ============================================================

// Questions posées par le code à l'étape « creuser », un jeu par rayon
// (décision Denis 2026-09-06 : elles ne peuvent pas être les mêmes pour
// tous les sujets). Le code affiche les questions des rayons auxquels
// appartiennent les sous-chapitres cochés, plus les 4 universelles.
// Garde-fou : jamais de question sur la santé, la situation familiale
// précise, les revenus chiffrés, le statut administratif. Les rayons
// handicap / etranger / justice ont un garde-fou renforcé (on interroge
// le besoin, jamais la condition de la personne).
var COMPRENDRE_LE_CADRE_QUESTIONS_UNIVERSELLES = [
  "Depuis combien de temps êtes-vous dans cette situation ?",
  "Avez-vous déjà fait une démarche à ce sujet ?",
  "Est-ce urgent (une échéance, une date limite) ?"
];
var COMPRENDRE_LE_CADRE_QUESTIONS_RAYON = {
  emploi: [
    "Quel type de contrat (CDI, CDD, intérim, apprentissage) ?",
    "Êtes-vous en poste, ou le contrat est-il terminé ou en cours de rupture ?",
    "Depuis combien de temps dans l'entreprise ?"
  ],
  former: [
    "Êtes-vous salarié, demandeur d'emploi, ou sans activité ?",
    "Avez-vous une idée précise de formation, ou cherchez-vous encore ?",
    "Visez-vous un diplôme, ou surtout des compétences ?"
  ],
  accompagnement: [
    "Êtes-vous inscrit à France Travail ?",
    "Avez-vous déjà un conseiller ou un référent ?",
    "Percevez-vous le RSA ?"
  ],
  creer: [
    "Avez-vous un projet précis, ou explorez-vous encore ?",
    "Êtes-vous demandeur d'emploi avec des droits au chômage ?",
    "Activité artisanale, commerciale, ou de services ?"
  ],
  employeurs: [
    "Votre question porte sur : les obligations légales, le coût d'une embauche, ou la fin d'un contrat ?",
    "Cherchez-vous à comprendre une situation précise avec un employeur, ou une question plus générale ?"
  ],
  jeunes: [
    "Quel âge avez-vous ?",
    "Êtes-vous en études, en emploi, ou sans solution ?",
    "Avez-vous un diplôme ?"
  ],
  seniors: [
    "Êtes-vous en emploi, en recherche d'emploi, ou déjà en retraite ?",
    "Votre question porte sur : aménager votre fin de carrière, partir en retraite, ou continuer à travailler en étant retraité ?",
    "Avez-vous déjà fait le point sur vos droits (relevé de carrière, entretien retraite) ?"
  ],
  handicap: [
    "Avez-vous une reconnaissance de travailleur handicapé, ou une demande en cours ?",
    "Êtes-vous en poste, en arrêt, ou en recherche d'emploi ?"
  ],
  etranger: [
    "Sur quoi porte votre question : le séjour, le travail, les diplômes, le permis, la nationalité ?"
  ],
  justice: [
    "Êtes-vous encore en détention, en aménagement de peine, ou déjà sorti ?",
    "Avez-vous un suivi par un service pénitentiaire d'insertion et de probation ?"
  ],
  budget: [
    "S'agit-il de dettes, d'un découvert, d'un refus de banque, ou d'une aide d'urgence ?",
    "Avez-vous déjà contacté un point conseil budget ou un travailleur social ?",
    "Percevez-vous le RSA ?"
  ],
  mobilite: [
    "Avez-vous le permis de conduire ?",
    "Avez-vous un véhicule, même en panne ?",
    "Le besoin est-il lié à un emploi précis avec une date, ou plus général ?"
  ],
  logement: [
    "Êtes-vous locataire, hébergé, sans logement, ou menacé d'expulsion ?",
    "Avez-vous déjà une dette de loyer ?",
    "Avez-vous déposé une demande de logement social ?"
  ],
  garde: [
    "Quel âge a l'enfant : moins de 3 ans, 3 à 6 ans, déjà scolarisé ?",
    "Élevez-vous seul votre enfant ?",
    "Le besoin est-il régulier, ponctuel, ou en horaires décalés ?"
  ],
  francais: [
    "Est-ce pour la vie quotidienne, pour un titre de séjour ou la nationalité, ou pour le travail ?",
    "Avez-vous déjà passé un test ou suivi une formation de français ?"
  ],
  juridique: [
    "De quel type de litige s'agit-il : employeur, administration, discrimination, autre ?",
    "Avez-vous reçu un courrier officiel avec un délai ?",
    "Avez-vous déjà consulté un point-justice ou un avocat ?"
  ],
  sante: [
    "Cherchez-vous un médecin traitant, un dentiste, ou un autre professionnel de santé ?",
    "Avez-vous déjà essayé l'Annuaire santé de l'Assurance maladie, ou contacté votre CPAM ?"
  ]
};

// Socle des textes de recherche. NE PAS RÉÉCRIRE : reprise mot pour mot
// des briques éprouvées de l'outil de veille (outils/veille.html :
// socleRecherche() et TON ; docs/VEILLE_PROMPTS.md pour la ligne « pas
// d'avis / pas de ton alarmiste »). Décision Denis 2026-09-06 : ne rien
// inventer. Si ces textes changent dans veille.html, les reporter ici
// (dette de duplication B.8 de docs/BRIQUES_COMMUNES.md). Deux ajouts
// Denis 2026-09-06 : « réponds toujours en français » et le bloc
// [REFORMULATION] (le public écrit souvent avec des fautes, on lui montre
// qu'on l'a compris avant de chercher).
function _comprendreLeCadreSocleRecherche() {
  return "Nous sommes le " + new Date().toISOString().slice(0, 10) + ". "
    + "Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. "
    + "N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro "
    + "de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un "
    + "résultat, écris « à vérifier » à la place. Certains sites officiels (Légifrance, ministères, "
    + "France Travail, immigration.interieur) bloquent parfois la lecture automatique : appuie-toi alors "
    + "sur les relais qui les republient (service-public.gouv.fr, vie-publique.fr, l'Unédic) et signale "
    + "clairement chaque point que tu n'as pas pu confirmer sur la source primaire.";
}
var COMPRENDRE_LE_CADRE_TON_RECHERCHE =
  "Réponds toujours en français. Écris pour une personne réelle qui va te lire, pas pour un système. "
  + "Phrases courtes. Jamais condescendant, jamais un pavé technique. Commence par le cas concret. "
  + "Ton posé, clair, un peu chaleureux : ni administratif, ni familier. Développe chaque sigle une fois. "
  + "Pas de classement, pas de recommandation, aucun avis sur la situation de la personne, aucun ton "
  + "alarmiste : tu expliques, elle décide.";

// État de la recherche libre en cours. Volontairement HORS de
// `_comprendreLeCadreEtat` et NON persisté : décision Denis 2026-09-06,
// rien n'est gardé (on ignore le temps écoulé entre deux ouvertures et ce
// qui aura changé dans la loi ; une réponse ancienne serait un risque).
// Vit en mémoire de page uniquement ; remis à zéro à chaque nouvelle
// recherche et à chaque sortie du module.
var _comprendreLeCadreRecherche = null;
function _comprendreLeCadreRechercheNeuve() {
  _comprendreLeCadreRecherche = {
    texteLibre: '', casesCochees: [],
    reformulation: '', sujets: [], questionsAssistant: [],
    sujetsChoisis: [], reponsesQuestions: {}, contexteLibre: '',
    brutReponse1: '', brutReponse2: ''
  };
}

// Icône (Bootstrap Icons, cohérent avec le reste d'ERIP - jamais un
// emoji brut en dur dans le rendu final, contrairement à la maquette
// statique), titre ET description courte ("quoi") de chaque rayon.
// Seule source de vérité pour l'accueil du module ET les résultats de
// l'orienteur : jamais un deuxième jeu de titres à tenir à jour ailleurs.
// "quoi" repris tel quel de la maquette validée (docs/MAQUETTE_SE_TENIR_
// INFORME_PARCOURS_2026-09-03.html, span.quoi) - décision Denis
// 2026-09-05 : montrer sur l'accueil ce que chaque rayon couvre
// concrètement, sans attendre le chargement des vraies fiches (qui reste
// exclu de l'accueil, voir ARCHITECTURE_TECHNIQUE.md).
var RAYON_LABEL = {
  emploi: { icone: 'bi-briefcase', titre: 'Emploi et contrats',
    quoi: "Période d'essai, rupture conventionnelle, CDD, CDI, intérim et intérim d'insertion." },
  former: { icone: 'bi-mortarboard', titre: 'Se former et se reconvertir',
    quoi: "Compte personnel de formation, préparation à l'emploi, validation des acquis, démission-reconversion, période de reconversion." },
  accompagnement: { icone: 'bi-people', titre: "L'accompagnement et les structures de l'insertion",
    quoi: "France Travail, Mission Locale, Cap emploi, structures d'insertion par l'activité économique, clause sociale, plan local pour l'insertion." },
  creer: { icone: 'bi-rocket-takeoff', titre: 'Créer son activité',
    quoi: "Micro-entreprise, société, coopérative d'activité et d'emploi, aides à la création." },
  employeurs: { icone: 'bi-building', titre: 'Employeurs et entrepreneurs',
    quoi: "Ce que représente une embauche pour un employeur : obligations, coût réel, période d'essai, licenciement, aides pour recruter." },
  jeunes: { icone: 'bi-backpack2', titre: 'Moins de 26 ans',
    quoi: "Mission Locale et contrat d'engagement jeune, école de la deuxième chance, EPIDE, service civique, obligation de formation des 16-18 ans, écoles de production, accompagnement intensif jeunes." },
  seniors: { icone: 'bi-hourglass-split', titre: 'Travailler après 50 ans et retraite',
    quoi: "Aménager sa fin de carrière, la retraite progressive, le cumul emploi-retraite, le départ et la mise à la retraite, où s'informer sur ses droits." },
  handicap: { icone: 'bi-universal-access-circle', titre: 'Handicap et emploi',
    quoi: "Reconnaissance (RQTH), dossier MDPH, médecin traitant et médecine du travail, AGEFIPH, Cap emploi, aménagement de poste." },
  etranger: { icone: 'bi-globe2', titre: "Venir de l'étranger",
    quoi: "Droit au travail selon le titre de séjour, reconnaissance des diplômes, permis de conduire, naturalisation, démarches en préfecture." },
  justice: { icone: 'bi-door-open', titre: 'Justice : sortie de détention',
    quoi: "Service pénitentiaire d'insertion et de probation, aménagement de peine, casier, reprise d'un parcours vers l'emploi." },
  budget: { icone: 'bi-cash-coin', titre: 'Budget, dettes, droits sociaux',
    quoi: "Surendettement, point conseil budget, dossier Banque de France, microcrédit, RSA et prime d'activité, cumul avec un emploi, MSA." },
  mobilite: { icone: 'bi-car-front', titre: 'Mobilité',
    quoi: "Permis, permis annulé et récupération de points, garage solidaire, achat de voiture, aide France Travail à la mobilité, location solidaire, transport à la demande." },
  logement: { icone: 'bi-house', titre: 'Logement',
    quoi: "Action Logement, garantie Visale, fonds de solidarité pour le logement, hébergement temporaire." },
  garde: { icone: 'bi-balloon', titre: "Garde d'enfant",
    quoi: "Crèche à vocation d'insertion, halte-garderie, aide de la CAF, garde ponctuelle pour un entretien." },
  francais: { icone: 'bi-book', titre: 'Apprendre le français',
    quoi: "Formation de français langue étrangère, cours de l'OFII, ateliers sociolinguistiques, français à visée professionnelle." },
  juridique: { icone: 'bi-bank', titre: 'Questions juridiques',
    quoi: "Conseil de prud'hommes, tribunal administratif, défenseur des droits, aide juridictionnelle, radiation d'une entreprise, litige avec l'administration." },
  sante: { icone: 'bi-heart-pulse', titre: 'Accès aux soins',
    quoi: "Trouver un médecin traitant, un dentiste ou un autre professionnel de santé, comprendre le désert médical, la CPAM." }
};

// Groupement des 17 rayons en 4 familles pour l'écran d'accueil, même
// ordre et mêmes familles que l'accueil général d'ERIP
// (data/metiers.js, cartes[]) : « Emploi et parcours », « Situations et
// publics », « Lever un frein du quotidien », « Faire valoir ses
// droits ». Ordre interne à chaque famille repris de la maquette
// (docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html). « employeurs »
// ajouté le 2026-09-12 (Denis) : un 3e regard (bénéficiaire, professionnel,
// employeur), rattaché à « Emploi et parcours » comme « creer » (l'autre
// rayon qui regarde le monde du travail depuis l'autre côté). « sante »
// ajouté le 2026-09-13 (Denis) : nouveau rayon, aucun des 15 precedents ne
// couvrait l'acces aux soins / desert medical.
var COMPRENDRE_LE_CADRE_FAMILLES = [
  { titre: 'Emploi et parcours', rayons: ['emploi', 'former', 'accompagnement', 'creer', 'employeurs'] },
  { titre: 'Situations et publics', rayons: ['jeunes', 'seniors', 'handicap', 'etranger', 'justice', 'budget', 'sante'] },
  { titre: 'Lever un frein du quotidien', rayons: ['mobilite', 'logement', 'garde', 'francais'] },
  { titre: 'Faire valoir ses droits', rayons: ['juridique'] }
];

// Une case cochée = son propre id de rayon, aucune indirection. Cette
// fonction garde seulement l'ordre d'affichage (celui de
// ORIENTEUR_CASES), au cas où le DOM les rendrait dans un autre ordre.
function _comprendreLeCadreRayonsPourCasesCochees(idsCoches) {
  return ORIENTEUR_CASES
    .filter(function (c) { return idsCoches.indexOf(c.r) !== -1; })
    .map(function (c) { return c.r; });
}

// ============================================================
// DONNÉES (chargement et analyse des fiches - jamais d'écriture,
// module de pure consultation)
// ============================================================

// Analyseur de frontmatter YAML, porté de parseFiche() (outils/veille.html)
// et complété pour couvrir tous les champs utilisés côté application
// (rayon, frein en booléen, statut, collecte, lexique en paires
// terme/définition, tags en liste courte [a, b, c]) - veille.html n'avait
// besoin que d'un sous-ensemble, adapté à son propre formulaire. Même
// technique (une passe de recherche par champ), jamais une dépendance à
// une librairie YAML pour un format aussi restreint et entièrement
// maîtrisé (86 fiches, toutes écrites à la main sur le même gabarit).
function _comprendreLeCadreParserFiche(texteMd) {
  var m = texteMd.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) { return null; }
  var entete = m[1];
  var f = {
    id: '', rayon: '', titre: '', pour_qui: '', territoire: '', statut: 'actif',
    frein: false, verifie_le: '', tags: [], lexique: [], voir_aussi_lexique: [], voir_aussi_chiffres: '', sources: [],
    ce_qui_change_souvent: [], revisions: [], collecte: '', corps: (m[2] || '').trim()
  };
  // TACHE (extension Chiffres, 2026-09-12) : phrase courte optionnelle
  // (ex. "Comment on est embauché ici"), affichee sur le bouton "Pour
  // aller plus loin -> Comprendre les chiffres" -- vide par defaut, jamais
  // devinee, meme principe que voir_aussi_lexique.
  ['id', 'rayon', 'titre', 'pour_qui', 'territoire', 'statut', 'verifie_le', 'collecte', 'voir_aussi_chiffres'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { f[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });
  var mFrein = entete.match(/^frein:\s*(true|false)/m);
  f.frein = !!(mFrein && mFrein[1] === 'true');
  var mTags = entete.match(/^tags:\s*\[([^\]]*)\]/m);
  if (mTags) { f.tags = mTags[1].split(',').map(function (t) { return t.trim(); }).filter(Boolean); }
  // TACHE (audit croise Lexique/Cadre/Chiffres, 2026-09-12) : liste simple
  // d'ids de fiches Lexique, affichee en "Pour aller plus loin" en bas de
  // fiche (voir _comprendreLeCadreRenduFiche) -- validee par Denis sur la
  // fiche emploi-csp avant generalisation. Volontairement vide par defaut :
  // rempli fiche par fiche, seulement quand un vrai lien existe, jamais
  // devine automatiquement.
  ['sources', 'ce_qui_change_souvent', 'revisions', 'voir_aussi_lexique'].forEach(function (cle) {
    f[cle] = _comprendreLeCadreExtraireListeYaml(entete, cle);
  });
  var reLex = /-\s*terme:\s*"?([^"\n]+?)"?\s*\n\s*definition:\s*"?([^"\n]+?)"?\s*(\n|$)/g, mm2;
  while ((mm2 = reLex.exec(entete))) { f.lexique.push({ terme: mm2[1].trim(), definition: mm2[2].trim() }); }
  return f;
}

// Même technique que extraireListe() (outils/veille.html) : lit une liste
// YAML simple ("- item") jusqu'à la prochaine clé de premier niveau.
function _comprendreLeCadreExtraireListeYaml(bloc, nom) {
  var lignes = bloc.split('\n'), dedans = false, out = [];
  for (var i = 0; i < lignes.length; i++) {
    if (new RegExp('^' + nom + '\\s*:').test(lignes[i])) { dedans = true; continue; }
    if (dedans) {
      if (/^[a-z_]+\s*:/.test(lignes[i]) && !/^\s*-/.test(lignes[i])) { break; }
      var it = lignes[i].replace(/^\s*[-*]\s*/, '').replace(/^"|"$/g, '').trim();
      if (it) { out.push(it); }
    }
  }
  return out;
}

// La liste des fiches d'un rayon n'est décrite nulle part ailleurs que
// dans le tableau "Les N fiches" du README.md de ce rayon (déjà tenu à
// jour à la main pour la relecture de Denis) : ce même tableau sert de
// manifeste pour l'application - une seule source de vérité, jamais un
// second fichier de liste à maintenir en parallèle qui pourrait diverger.
function _comprendreLeCadreExtraireIdsDepuisReadme(texteReadme) {
  var ids = [], re = /\|\s*`([a-z0-9-]+)`\s*\|/g, mm;
  while ((mm = re.exec(texteReadme))) { ids.push(mm[1]); }
  return ids;
}

// Charge et analyse toutes les fiches actives d'un rayon (jamais celles
// en statut "retire"), depuis le cache si déjà fait dans cette session.
// Formatage humain d'une date de vérification : "2026-09" -> "septembre
// 2026" ; "2026-09-05" -> "5 septembre 2026" ; toute autre forme rendue
// telle quelle. Sert à rendre ces dates lisibles (retour Denis 2026-09-05
// "je veux que les dates ressortent un peu plus").
var COMPRENDRE_LE_CADRE_MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function _comprendreLeCadreDateFr(s) {
  var d = String(s || '').trim();
  var mAM = d.match(/^(\d{4})-(\d{2})$/);
  if (mAM) { return (COMPRENDRE_LE_CADRE_MOIS_FR[parseInt(mAM[2], 10) - 1] || mAM[2]) + ' ' + mAM[1]; }
  var mC = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mC) { return parseInt(mC[3], 10) + ' ' + (COMPRENDRE_LE_CADRE_MOIS_FR[parseInt(mC[2], 10) - 1] || mC[2]) + ' ' + mC[1]; }
  return d;
}

// La collecte d'un rayon a une section "sources:" au même format que
// "structures:" ("nom-court | titre lisible | url | date"). On en tire un
// nom lisible par nom-court, pour afficher sous chaque fiche le vrai
// libellé de la source plutôt que la clé technique.
function _comprendreLeCadreParserSourcesCollecte(texteCollecte) {
  var table = {};
  var fm = String(texteCollecte || '').match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fm) { return table; }
  _comprendreLeCadreExtraireListeYaml(fm[1], 'sources').forEach(function (ligne) {
    var parts = ligne.split('|').map(function (p) { return p.trim().replace(/^"|"$/g, ''); });
    if (parts[0]) { table[parts[0]] = parts[1] || parts[0]; }
  });
  return table;
}

// onCharge(fiches) / onErreur(message) - jamais d'exception qui remonte
// jusqu'à l'appelant, ce module reste silencieux sur ses propres échecs
// réseau et laisse l'écran l'expliquer simplement à la personne.
function _comprendreLeCadreChargerRayon(id, onCharge, onErreur) {
  if (_comprendreLeCadreCache[id]) { onCharge(_comprendreLeCadreCache[id]); return; }
  var base = COMPRENDRE_LE_CADRE_BASE_CONTENU + id + '/';
  fetch(base + 'README.md').then(function (reponse) {
    if (!reponse.ok) { throw new Error('readme'); }
    return reponse.text();
  }).then(function (texteReadme) {
    var ids = _comprendreLeCadreExtraireIdsDepuisReadme(texteReadme);
    if (!ids.length) { throw new Error('liste-vide'); }
    return Promise.all(ids.map(function (idFiche) {
      return fetch(base + idFiche + '.md').then(function (reponse) {
        if (!reponse.ok) { throw new Error('fiche-manquante'); }
        return reponse.text();
      });
    }));
  }).then(function (textes) {
    var fiches = textes.map(_comprendreLeCadreParserFiche).filter(function (f) {
      return f && f.statut !== 'retire';
    });
    // Résout les sources: de chaque fiche vers un nom lisible (collecte) et
    // une adresse cliquable si (et seulement si) elle a une date de
    // vérification dans liens-verifies.txt (LECONS 9.16). La collecte et
    // le registre manquants ne sont pas une erreur : la fiche s'affiche
    // alors avec les noms courts, sans lien.
    return Promise.all([
      fetch(base + id + '.collecte.md').then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }),
      new Promise(function (resolve) { _comprendreLeCadreChargerLiensVerifies(resolve, function () { resolve({}); }); })
    ]).then(function (res) {
      var titres = _comprendreLeCadreParserSourcesCollecte(res[0]);
      var liens = res[1] || {};
      fiches.forEach(function (f) {
        f.sourcesResolues = (f.sources || []).map(function (nom) {
          var l = liens[nom];
          var verifie = !!(l && l.dateVerification);
          return {
            nom: nom, titre: titres[nom] || nom,
            url: verifie ? l.url : '', date: verifie ? l.dateVerification : '', verifie: verifie
          };
        });
      });
      _comprendreLeCadreCache[id] = fiches;
      onCharge(fiches);
    });
  }).catch(function () {
    onErreur();
  });
}

// Analyse le registre partagé liens-verifies.txt :
// "nom | adresse | date de vérification | portée" par ligne, une ligne
// "#" = commentaire ignoré. La 3e colonne vide veut dire adresse
// candidate jamais vérifiée à la main (LECONS 9.16) - le nom existe alors
// dans le registre mais reste sans adresse exploitable pour la personne.
// La 4e colonne (portée : national / region / 24 / 87) sert à
// "Près de chez moi" (voir CHANTIER_TERRITOIRE_REGION_DEPARTEMENT.md) ;
// vide = pas encore taguée, la structure s'affiche alors pour tout le
// monde comme avant (rétrocompatible).
function _comprendreLeCadreParserLiensVerifies(texte) {
  var table = {};
  texte.split('\n').forEach(function (ligne) {
    var l = ligne.trim();
    if (!l || l.charAt(0) === '#') { return; }
    var parts = l.split('|').map(function (p) { return p.trim(); });
    if (parts.length < 2 || !parts[0]) { return; }
    table[parts[0]] = { url: parts[1] || '', dateVerification: parts[2] || '', portee: (parts[3] || '').toLowerCase() };
  });
  return table;
}

// Charge (une seule fois pour toute la session) le registre partagé.
function _comprendreLeCadreChargerLiensVerifies(onCharge, onErreur) {
  if (_comprendreLeCadreCacheLiensVerifies) { onCharge(_comprendreLeCadreCacheLiensVerifies); return; }
  fetch(COMPRENDRE_LE_CADRE_CHEMIN_LIENS_VERIFIES).then(function (reponse) {
    if (!reponse.ok) { throw new Error('liens-verifies'); }
    return reponse.text();
  }).then(function (texte) {
    _comprendreLeCadreCacheLiensVerifies = _comprendreLeCadreParserLiensVerifies(texte);
    onCharge(_comprendreLeCadreCacheLiensVerifies);
  }).catch(function () { onErreur(); });
}

// Une entrée structures: de <rayon>.collecte.md est écrite
// "nom-du-lien | description | url-candidate | date-de-collecte" - le
// même format que sources: (voir outils/veille.html). "nom-du-lien" est
// une clé technique (ex. "ccas-mairie"), jamais affichée telle quelle :
// la description commence presque toujours par un nom lisible suivi de
// " : " et d'un complément (ex. "CCAS de la commune : aide sociale,
// domiciliation..."), séparés ici pour un affichage en deux niveaux.
// Quand la description n'a pas de " : ", elle sert de titre entier.
// L'adresse retenue vient toujours du registre liens-verifies.txt (voir
// _comprendreLeCadreChargerStructuresRayon), jamais de la 3e colonne de
// cette ligne, qui n'est qu'une adresse candidate au moment de la
// collecte, pas une adresse vérifiée.
function _comprendreLeCadreParserLigneStructure(ligne) {
  var parts = ligne.split('|').map(function (p) { return p.trim(); });
  var nom = parts[0] || '', description = parts[1] || '';
  var iSep = description.indexOf(' : ');
  var titre = iSep === -1 ? description : description.slice(0, iSep);
  var detail = iSep === -1 ? '' : description.slice(iSep + 3);
  return { nom: nom, titre: titre, detail: detail };
}

// Charge la liste "à qui s'adresser" d'un rayon : la collecte donne le
// nom et la description, le registre liens-verifies.txt donne l'adresse
// SI ET SEULEMENT SI elle a été vérifiée à la main (date non vide). Une
// structure dont l'adresse n'est pas encore vérifiée reste affichée
// (le nom et la description restent une information utile en soi),
// mais jamais sous forme de lien cliquable.
function _comprendreLeCadreChargerStructuresRayon(id, onCharge, onErreur) {
  if (_comprendreLeCadreCacheStructures[id]) { onCharge(_comprendreLeCadreCacheStructures[id]); return; }
  var base = COMPRENDRE_LE_CADRE_BASE_CONTENU + id + '/';
  Promise.all([
    fetch(base + id + '.collecte.md').then(function (reponse) {
      if (!reponse.ok) { throw new Error('collecte'); }
      return reponse.text();
    }),
    new Promise(function (resolve, reject) {
      _comprendreLeCadreChargerLiensVerifies(resolve, reject);
    })
  ]).then(function (resultats) {
    var texteCollecte = resultats[0], liensVerifies = resultats[1];
    var fm = texteCollecte.match(/^---\s*\n([\s\S]*?)\n---/);
    var lignesStructures = fm ? _comprendreLeCadreExtraireListeYaml(fm[1], 'structures') : [];
    var structures = lignesStructures.map(_comprendreLeCadreParserLigneStructure).map(function (s) {
      var lien = liensVerifies[s.nom];
      var verifie = !!(lien && lien.dateVerification);
      return {
        titre: s.titre, detail: s.detail,
        url: verifie ? lien.url : '', verifie: verifie,
        date: verifie ? lien.dateVerification : '',
        portee: (lien && lien.portee) || ''
      };
    });
    _comprendreLeCadreCacheStructures[id] = structures;
    onCharge(structures);
  }).catch(function () { onErreur(); });
}

// Mois (format "AAAA-MM") de fin des n derniers trimestres CIVILS
// COMPLETS, du plus récent au plus ancien - jamais le trimestre en
// cours, qui n'est pas encore terminé (VEILLE_PROMPTS.md 5bis : "dernier
// trimestre civil complet"). Ex. le 2026-09-05, le T3 2026 (juil-sept)
// n'est pas fini : le premier candidat est 2026-06 (T2, avril-juin).
function _comprendreLeCadreMoisTrimestresRecents(n) {
  var out = [];
  var d = new Date();
  var mois = d.getMonth() + 1, annee = d.getFullYear();
  var finTrimestre = Math.ceil(mois / 3) * 3;
  if (mois <= finTrimestre) {
    finTrimestre -= 3;
    if (finTrimestre <= 0) { finTrimestre += 12; annee -= 1; }
  }
  for (var i = 0; i < n; i++) {
    out.push(annee + '-' + (finTrimestre < 10 ? '0' : '') + finTrimestre);
    finTrimestre -= 3;
    if (finTrimestre <= 0) { finTrimestre += 12; annee -= 1; }
  }
  return out;
}

// Un digest (balayage ou chiffres, même frontmatter) : periode/publie_le
// dans l'en-tête, le corps est du markdown libre volontairement peu
// contraint (rédigé à la main par Denis) - voir
// _comprendreLeCadreRenduDigestCorps() pour son rendu, pas de parseur
// rigide par champ ici (le format du corps varie d'un digest à l'autre,
// contrairement au gabarit fixe d'une fiche).
function _comprendreLeCadreParserDigest(texteMd) {
  var m = texteMd.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) { return null; }
  var entete = m[1];
  var d = { periode: '', publie_le: '', corps: (m[2] || '').trim() };
  ['periode', 'publie_le'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { d[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });
  return d;
}

// Charge tous les digests d'un dossier (balayage/, chiffres/) qui
// existent parmi les n derniers trimestres candidats, du plus récent au
// plus ancien. onCharge(digests) seulement si au moins un existe ;
// onErreur() sinon (aucun digest publié pour l'instant - message honnête
// côté écran, pas une erreur réseau à faire réessayer).
function _comprendreLeCadreChargerDigests(dossier, onCharge, onErreur) {
  var moisCandidats = _comprendreLeCadreMoisTrimestresRecents(COMPRENDRE_LE_CADRE_NB_TRIMESTRES_ARCHIVE);
  var base = COMPRENDRE_LE_CADRE_BASE_CONTENU + dossier + '/';
  Promise.all(moisCandidats.map(function (mois) {
    return fetch(base + mois + '.md').then(function (reponse) {
      return reponse.ok ? reponse.text() : null;
    }).catch(function () { return null; });
  })).then(function (textes) {
    var digests = [];
    textes.forEach(function (texte) {
      if (!texte) { return; }
      var d = _comprendreLeCadreParserDigest(texte);
      if (d) { digests.push(d); }
    });
    if (!digests.length) { onErreur(); return; }
    onCharge(digests);
  }).catch(function () { onErreur(); });
}

// Rendu minimal du corps d'une fiche : le corpus n'utilise que des
// paragraphes, du gras (**...**) et, parfois, de courtes listes à puces -
// jamais de titre, de lien ni de tableau dans le corps d'une fiche (voir
// docs/CONTENU_COMPRENDRE_LE_CADRE/, toutes rédigées sur ce même gabarit
// volontairement simple). Pas de dépendance à une librairie markdown pour
// un sous-ensemble aussi restreint et entièrement maîtrisé.
function _comprendreLeCadreRenduCorps(corps) {
  return corps.split(/\n\s*\n/).map(function (bloc) {
    var lignes = bloc.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var estListe = lignes.length > 0 && lignes.every(function (l) { return /^[-*]\s/.test(l); });
    if (estListe) {
      return '<ul>' + lignes.map(function (l) {
        return '<li>' + l.replace(/^[-*]\s/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</li>';
      }).join('') + '</ul>';
    }
    return '<p>' + bloc.trim().replace(/\n/g, ' ').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>';
  }).join('');
}

// Rendu du corps libre d'un digest (balayage) : contrairement au gabarit
// fixe d'une fiche, ce corps est du markdown à main levée, avec des
// niveaux de titre (## domaine, ### intitulé), des lignes "Label :
// valeur" et des listes à puces. Regroupe d'abord le texte par domaine
// puis par changement (chaque "### intitulé" ouvre un changement) avant
// de le convertir en HTML, plutôt qu'une conversion ligne à ligne à
// plat : un domaine à plusieurs changements se lisait comme un seul bloc
// de texte continu, sans séparation visuelle (retour Denis 2026-09-14).
// Pas de parseur rigide par champ (voir _comprendreLeCadreParserDigest) :
// toujours tolérant à la variation d'un trimestre à l'autre, plutôt
// qu'un format qui casserait au premier mot déplacé.
function _comprendreLeCadreRenduDigestCorps(corps) {
  var corpsSansTitre = corps.replace(/^#\s+.*(\r?\n|$)/, '');
  var domaines = [], domaineCourant = null, itemCourant = null, listeCourante = null;
  function assurerDomaine() {
    if (!domaineCourant) { domaineCourant = { nom: '', items: [], notes: [] }; domaines.push(domaineCourant); }
  }
  // Où pousser le prochain bloc : dans le changement en cours s'il y en a
  // un, sinon dans les notes « libres » du domaine (ex. la phrase de
  // contexte après un changement, ou une ligne "Rien de nouveau retenu").
  function cible() { assurerDomaine(); return itemCourant ? itemCourant.blocs : domaineCourant.notes; }
  corpsSansTitre.split('\n').forEach(function (ligneBrute) {
    var ligne = ligneBrute.trim();
    if (!ligne) { listeCourante = null; return; }
    var mH2 = ligne.match(/^##\s+(.+)$/);
    if (mH2) { domaineCourant = { nom: mH2[1].trim(), items: [], notes: [] }; domaines.push(domaineCourant); itemCourant = null; listeCourante = null; return; }
    var mH3 = ligne.match(/^###\s+(.+)$/);
    if (mH3) { assurerDomaine(); itemCourant = { titre: mH3[1].trim(), blocs: [] }; domaineCourant.items.push(itemCourant); listeCourante = null; return; }
    var mListe = ligne.match(/^[-*]\s+(.+)$/);
    if (mListe) { var nv = { type: 'liste', lignes: [mListe[1]] }; cible().push(nv); listeCourante = nv; return; }
    if (listeCourante) { listeCourante.lignes.push(ligne); return; }
    var mItalique = ligne.match(/^_(.+)_$/);
    // Une note en italique referme le changement en cours : elle
    // s'adresse au domaine entier, jamais au seul changement précédent.
    // Refermer AVANT d'appeler cible() (bug trouvé le 2026-09-14 : cible()
    // appelé avant renvoyait encore les blocs du changement en cours,
    // rattachant la 1re note italique après un changement à sa carte au
    // lieu du domaine - visible quand un changement est immédiatement
    // suivi d'une note, ex. Accompagnement des jeunes).
    if (mItalique) { itemCourant = null; cible().push({ type: 'italique', texte: mItalique[1] }); return; }
    cible().push({ type: 'paragraphe', texte: ligne });
  });
  // Un lien « Source : [titre](https://...) » devient une adresse cliquable
  // (retour Denis 2026-09-14 : les sources du digest ne l'étaient pas),
  // même icône et mêmes attributs que les sources de fiche
  // (.comprendre-le-cadre-source-lien) pour rester cohérent.
  function gras(s) {
    return s
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> $1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  function renduBlocs(blocs) {
    var html = '', dansUneListe = false;
    blocs.forEach(function (b) {
      if (b.type === 'liste') {
        if (!dansUneListe) { html += '<ul>'; dansUneListe = true; }
        html += '<li>' + b.lignes.map(function (l, i) {
          return i === 0 ? gras(l) : '<span class="d-block small text-muted">' + gras(l) + '</span>';
        }).join('') + '</li>';
        return;
      }
      if (dansUneListe) { html += '</ul>'; dansUneListe = false; }
      if (b.type === 'italique') { html += '<p class="comprendre-le-cadre-digest-note text-muted fst-italic mb-2">' + gras(b.texte) + '</p>'; return; }
      var mChamp = b.texte.match(/^([A-Za-zÀ-ÿ' ]{2,30})\s*:\s*(.+)$/);
      if (!mChamp) { html += '<p class="mb-1">' + gras(b.texte) + '</p>'; return; }
      var label = mChamp[1].trim(), valeur = gras(mChamp[2]);
      // « Ce qui change » est la seule ligne que la plupart des gens
      // liront : pleine lisibilité. « Source » ferme le changement,
      // à part, comme une référence. Le reste (type, dates, public
      // concerné) reste en note discrète au-dessus.
      html += /^ce qui change$/i.test(label)
        ? '<p class="comprendre-le-cadre-digest-cle mb-2"><strong>' + label + ' :</strong> ' + valeur + '</p>'
        : /^source$/i.test(label)
          ? '<p class="comprendre-le-cadre-digest-source small text-muted mb-0">' + label + ' : ' + valeur + '</p>'
          : '<p class="small text-muted mb-1"><strong>' + label + ' :</strong> ' + valeur + '</p>';
    });
    if (dansUneListe) { html += '</ul>'; }
    return html;
  }
  var html = '';
  domaines.forEach(function (d, i) {
    if (d.nom) {
      // Survol du badge = la liste des titres, pour prévisualiser sans
      // ouvrir chaque changement (retour Denis 2026-09-14). Attribut
      // `title` natif, pas un composant à maintenir : se lit au survol
      // sur ordinateur, et reste sans effet indésirable au doigt sur
      // mobile (le détail complet est de toute façon juste en dessous).
      var infobulle = d.items.map(function (it) { return it.titre; }).join('\n')
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      html += '<h3 class="comprendre-le-cadre-digest-domaine h6 text-uppercase mt-4 mb-2">' + d.nom
        + (d.items.length ? ' <span class="comprendre-le-cadre-digest-badge" title="' + infobulle + '">' + d.items.length
          + (d.items.length > 1 ? ' changements' : ' changement') + '</span>' : '') + '</h3>';
    }
    d.items.forEach(function (it) {
      html += '<div class="comprendre-le-cadre-digest-item">' +
        '<p class="comprendre-le-cadre-digest-item-titre fw-semibold mb-2">' + gras(it.titre) + '</p>' +
        renduBlocs(it.blocs) +
        '</div>';
    });
    html += renduBlocs(d.notes);
  });
  return html;
}

// ============================================================
// RENDU
// ============================================================

// Bandeau de territoire : lit le département déjà mémorisé par la
// brique partagée (js/app.js, même clé localStorage que Ressources,
// docs/BRIQUES_COMMUNES.md) - jamais un deuxième sélecteur de
// département propre à ce module. Si rien n'est encore connu, affiche
// un état neutre plutôt que de forcer la question dès l'accueil : elle
// n'est vraiment nécessaire qu'au moment d'afficher des structures
// locales (étape « Près de chez moi », pas encore construite).
function _comprendreLeCadreLibelleTerritoire() {
  var dep = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
  if (dep === '24') { return 'Dordogne (24)'; }
  if (dep === '87') { return 'Haute-Vienne (87)'; }
  if (dep === 'ailleurs') { return 'Hors Dordogne et Haute-Vienne'; }
  return 'non choisi';
}

// Bandeau du territoire, affiché seulement quand un territoire EST connu
// (l'accueil passe par _comprendreLeCadreRenduChoixTerritoire() sinon,
// voir la façade). "Changer le territoire" : libellé explicite et bouton
// bien visible (retour Denis 2026-09-05). La fenêtre ouverte au clic
// reste demanderDepartementSiInconnu() (js/app.js), brique canonique
// partagée avec Ressources.
function _comprendreLeCadreRenduBandeauTerritoire() {
  return '' +
    '<div class="comprendre-le-cadre-territoire d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">' +
      '<span class="fs-6"><i class="bi bi-geo-alt"></i> Votre territoire : <strong>' + _comprendreLeCadreLibelleTerritoire() + '</strong></span>' +
      '<button type="button" class="btn btn-outline-secondary" data-comprendre-le-cadre-changer-territoire>' +
        '<i class="bi bi-arrow-repeat"></i> Changer le territoire</button>' +
    '</div>';
}

// Écran-porte : tant qu'aucun territoire n'est connu (ni ici, ni ailleurs
// dans l'application), on ne laisse pas entrer dans le module (décision
// Denis 2026-09-05 : "si elle ne fait pas le choix de son territoire,
// elle ne pourra pas naviguer à l'intérieur"). Décision Denis 2026-09-09 :
// on montre quand même tout le contenu (les sujets, les outils) juste en
// dessous de l'appel à l'action, mais verrouillé - visible, pas cliquable.
// Choisir son territoire débloque l'ensemble d'un coup. Un clic n'importe
// où dans l'aperçu verrouillé rouvre la fenêtre de choix (câblage dans
// _comprendreLeCadreBrancherChoixTerritoire).
function _comprendreLeCadreRenduChoixTerritoire() {
  return '' +
    '<div class="text-center mb-3">' +
      '<h1><i class="bi bi-newspaper"></i> Comprendre le cadre</h1>' +
    '</div>' +
    '<div class="comprendre-le-cadre-encart">' +
      '<p class="fs-5 fw-bold mb-2"><i class="bi bi-geo-alt"></i> Avant de commencer, indiquez votre territoire</p>' +
      '<p class="mb-3">Certaines aides et beaucoup de structures dépendent de votre département. Sans cette information, les indications locales risquent de ne pas vous concerner.</p>' +
      '<button type="button" class="btn btn-primary btn-lg" data-comprendre-le-cadre-choisir-territoire>' +
        '<i class="bi bi-geo-alt"></i> Choisir mon territoire</button>' +
    '</div>' +
    '<div class="comprendre-le-cadre-apercu-verrou" data-comprendre-le-cadre-apercu role="button" tabindex="0" ' +
        'aria-label="Choisir mon territoire pour débloquer le contenu">' +
      '<p class="comprendre-le-cadre-apercu-mot"><i class="bi bi-lock"></i> Choisissez votre territoire pour ouvrir ces sujets.</p>' +
      '<div class="comprendre-le-cadre-apercu-contenu" inert aria-hidden="true">' +
        _comprendreLeCadreRenduFamilles() +
        _comprendreLeCadreRenduOutils() +
      '</div>' +
    '</div>';
}

// Rayons ET outils rendus avec .sous-carte-accueil (css/style.css),
// jamais un style inventé pour ce module : le même composant déjà
// validé pour les sous-cartes de "Mes documents"/"Boîte à outils" (icône
// accent, titre gras, description) - retour Denis 2026-09-05, cohérence
// visuelle avec le reste d'ERIP. `attribut` = le data-attribut qui
// distingue un rayon (ouvrir-rayon) d'un outil (ouvrir-digest).
function _comprendreLeCadreRenduSousCarte(attribut, id, icone, titre, quoi) {
  return '<button type="button" class="sous-carte-accueil" ' + attribut + '="' + id + '">' +
    '<i class="bi ' + icone + '"></i>' +
    '<strong>' + titre + '</strong>' +
    '<span>' + (quoi || '') + '</span>' +
  '</button>';
}
function _comprendreLeCadreRenduRayon(id) {
  var info = RAYON_LABEL[id];
  if (!info) { return ''; }
  return _comprendreLeCadreRenduSousCarte('data-comprendre-le-cadre-ouvrir-rayon', id, info.icone, info.titre, info.quoi);
}

// id sur le conteneur (jamais sur un seul h2/bouton) uniquement pour
// servir de point d'ancrage à l'aide guidée (AIDE_PAGES['comprendre-le-cadre'],
// js/app.js) - même principe que #reperesListeConteneur/#carnetListeConteneur.
// data-comprendre-le-cadre-famille sur chaque bloc : point d'ancrage de
// la recherche (_comprendreLeCadreFiltrer(), plus bas), qui masque une
// famille entière si aucun de ses rayons ne correspond au texte tapé.
function _comprendreLeCadreRenduFamilles() {
  return '<div id="comprendreLeCadreRayons">' +
    COMPRENDRE_LE_CADRE_FAMILLES.map(function (famille) {
      return '' +
        '<div data-comprendre-le-cadre-famille>' +
        '<h2 class="h4 fw-bold text-uppercase text-muted mt-4 mb-2">' + famille.titre + '</h2>' +
        '<div class="grille-sous-cartes-accueil">' + famille.rayons.map(_comprendreLeCadreRenduRayon).join('') + '</div>' +
        '</div>';
    }).join('') +
  '</div>';
}

// Famille « Outils » (étape 6, 2 des 5 outils de la maquette - voir
// COMPRENDRE_LE_CADRE_OUTILS). Même sous-carte que les rayons, sur un
// attribut différent (data-comprendre-le-cadre-ouvrir-digest) puisque ce
// n'est pas un rayon. id sur le conteneur pour la même raison que
// #comprendreLeCadreRayons ci-dessus (ancrage de l'aide guidée et de la
// recherche).
function _comprendreLeCadreRenduOutils() {
  return '<div id="comprendreLeCadreOutils" data-comprendre-le-cadre-famille>' +
    '<h2 class="h4 fw-bold text-uppercase text-muted mt-4 mb-2">Outils</h2>' +
    '<div class="grille-sous-cartes-accueil">' +
    COMPRENDRE_LE_CADRE_OUTILS.map(function (o) {
      return _comprendreLeCadreRenduSousCarte('data-comprendre-le-cadre-ouvrir-digest', o.dossier, o.icone, o.titre, o.quoi);
    }).join('') +
    '</div></div>';
}

// Index courant dans COMPRENDRE_LE_CADRE_ETAPES pour l'écran affiché.
function _comprendreLeCadreIndexEtape() {
  var e = _comprendreLeCadreEtat.ecran;
  if (e === 'rayon' || e === 'fiche' || e === 'structures') { return 1; }
  if (e === 'orienteur' || e.indexOf('recherche-') === 0) { return 2; }
  if (COMPRENDRE_LE_CADRE_OUTILS.some(function (o) { return o.dossier === e; })) { return 3; }
  return 0;
}

// En-tête commune à tous les écrans du module (façade, voir plus bas).
// Ordre repris de l'implémentation de référence (ctHtmlBandeReprise(),
// modules/coherence-transversale/ui.js, LANGAGE_VISUEL_COMMUN 5bis) :
// la barre d'étapes D'ABORD (plus haute), le bouton partagé « Revoir la
// présentation » juste en dessous - jamais l'inverse (retour Denis,
// 2026-09-05 : l'ordre précédent plaçait le bouton au-dessus).
function _comprendreLeCadreRenduEnTete() {
  return '' +
    (typeof barreEtapesModule === 'function'
      ? barreEtapesModule(COMPRENDRE_LE_CADRE_ETAPES, _comprendreLeCadreIndexEtape())
      : '') +
    (typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule('btnComprendreLeCadreRevoirIntro', 'bi-newspaper', 'Revoir la présentation', false)
      : '');
}

// Pied commun : la barre fixe partagée par tous les modules
// (barre-navigation-fixe), toujours visible quel que soit le défilement.
function _comprendreLeCadreRenduPiedFixe() {
  return (typeof barreNavigation === 'function')
    ? '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_comprendreLeCadreAllerVersPrecedent()' }) + '</div>'
    : '';
}

// Un seul cran en arrière à la fois, jamais un saut par-dessus l'accueil
// du module (retour Denis, 2026-09-05 : « le bouton retour doit garder la
// trace historique et ramener à chaque fois d'un cran en arrière ») -
// PARTAGÉE par le bouton contextuel en tête de chaque écran ET le bouton
// « Retour » de la barre fixe du bas : les deux doivent se comporter
// EXACTEMENT pareil, jamais deux logiques de navigation qui pourraient
// diverger. Seul l'accueil du module n'a plus de cran interne : il sort
// vers la présentation (règle LANGAGE_VISUEL_COMMUN 5bis, point 1),
// laquelle renvoie elle-même vers la vraie page précédente (la carte
// d'accueil, carteRetour: 'informe' dans pageIntroSeTenirInforme()).
function _comprendreLeCadreAllerVersPrecedent() {
  var e = _comprendreLeCadreEtat;
  var estOutil = COMPRENDRE_LE_CADRE_OUTILS.some(function (o) { return o.dossier === e.ecran; });
  if (e.ecran === 'fiche' || e.ecran === 'structures') {
    e.ecran = 'rayon';
  } else if (e.ecran === 'recherche-resultat') {
    e.ecran = 'recherche-prompt2';
  } else if (e.ecran === 'recherche-prompt2') {
    e.ecran = 'recherche-questions';
  } else if (e.ecran === 'recherche-questions') {
    e.ecran = 'recherche-sujets';
  } else if (e.ecran === 'recherche-sujets') {
    e.ecran = 'recherche-prompt1';
  } else if (e.ecran === 'recherche-prompt1') {
    e.ecran = 'orienteur';
  } else if (e.ecran === 'rayon' || e.ecran === 'orienteur' || estOutil) {
    e.ecran = 'accueil';
  } else {
    // Déjà sur l'accueil du module : on sort vers la présentation en
    // mode NORMAL (jamais en détour), pour que son propre « Retour »
    // continue vers la vraie page précédente (la carte « Se tenir
    // informé »). En détour, la présentation afficherait « Revenir au
    // module » et on bouclerait accueil <-> présentation sans fin
    // (LECONS section 2, variante boucle infinie ; balayage 2026-09-09).
    _comprendreLeCadreRetour();
    return;
  }
  pageComprendreLeCadre();
}

// « Retour » de la barre du bas depuis l'accueil du module : présentation
// en mode NORMAL. À ne pas confondre avec _comprendreLeCadreRevoirPresentation()
// (bouton « Revoir la présentation » de l'en-tête), qui lui ouvre la
// présentation EN DÉTOUR (« Revenir au module »).
function _comprendreLeCadreRetour() {
  _comprendreLeCadreDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('se-tenir-informe-intro'); }
}

// Partagée par le bouton du pied fixe ET le bouton « Revoir la
// présentation » de l'en-tête. Marque le détour : la page de
// présentation affichera alors « Revenir au module » et le clic
// retombera pile sur l'écran quitté (l'écran interne n'est jamais remis
// à zéro, il reste en mémoire). Le drapeau est nettoyé au retour dans le
// module (haut de pageComprendreLeCadre()).
function _comprendreLeCadreRevoirPresentation() {
  _comprendreLeCadreDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('se-tenir-informe-intro'); }
}

// « Revenir au module » depuis la présentation en détour - retour exact à
// l'écran quitté. Fonction globale : appelée depuis la config de
// pageIntroSeTenirInforme() (data/metiers.js).
function comprendreLeCadreRevenirDeLaPresentation() {
  _comprendreLeCadreDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('comprendre-le-cadre'); }
}
window.comprendreLeCadreRevenirDeLaPresentation = comprendreLeCadreRevenirDeLaPresentation;

// Écran d'accueil du module. La recherche (retour Denis, 2026-09-05)
// filtre les rayons et les outils par titre et par description ("quoi",
// RAYON_LABEL/COMPRENDRE_LE_CADRE_OUTILS) - jamais le contenu des
// fiches elles-mêmes, qui ne sont pas chargées sur cet écran (décision
// d'architecture : jamais les 14 rayons préchargés). Une recherche par
// fiche viendra avec le chantier d'indexation, une fois le contenu migré.
function _comprendreLeCadreRenduAccueil() {
  return '' +
    '<div class="text-center mb-3">' +
      '<h1><i class="bi bi-newspaper"></i> Comprendre le cadre</h1>' +
      '<p class="sousTitre">Des fiches courtes et des liens officiels, à consulter quand vous en avez besoin.</p>' +
    '</div>' +
    _comprendreLeCadreRenduBandeauTerritoire() +
    // TACHE (relecture LECONS 9.10 avant commit) : .alert-light, .bg-light,
    // .form-control et .input-group-text sont des classes Bootstrap non
    // adaptees au mode sombre nulle part dans css/style.css (verifie par
    // grep avant d'ecrire ce fichier, puis confirme a l'oeil dans le
    // navigateur : boites blanches figees en mode sombre). Plutot que
    // d'ajouter une regle de plus a un fichier partage, classes propres au
    // module (comprendre-le-cadre.css), qui consomment directement les
    // variables deja theme-aware (--bg-subtle, --border, --text-strong...).
    '<div class="comprendre-le-cadre-encart small mb-3">' +
      '<i class="bi bi-calendar-check"></i> Les fiches de cet espace sont rédigées à la main, à une date indiquée. ' +
      'Les règles et les chiffres peuvent évoluer : sous chaque fiche, le lien officiel pointe vers la version à jour.' +
    '</div>' +
    '<div class="comprendre-le-cadre-recherche mb-1">' +
      '<i class="bi bi-search"></i>' +
      '<input type="text" id="comprendreLeCadreRechercheInput" placeholder="Chercher : une aide, un contrat, un mot...">' +
    '</div>' +
    '<p class="small text-muted mb-4" id="comprendreLeCadreRechercheVide" hidden>Aucun rayon ne correspond à cette recherche.</p>' +
    '<div class="comprendre-le-cadre-encart mb-3">' +
      '<p class="mb-2"><strong>Vous ne trouvez pas, ou votre situation touche plusieurs sujets ?</strong> Décrivez-la avec vos mots, on prépare une recherche pour vous.</p>' +
      '<button type="button" class="btn btn-primary" data-comprendre-le-cadre-ouvrir-orienteur>' +
        '<i class="bi bi-search"></i> Affiner ma recherche' +
      '</button>' +
    '</div>' +
    _comprendreLeCadreRenduFamilles() +
    _comprendreLeCadreRenduOutils() +
    _comprendreLeCadreRenduAccueilExtra();
}

// ============================================================
// Bas de l'accueil : « Comment lire ces fiches » + « Le tableau des
// sources officielles » (2 dépliants, décision Denis 2026-09-06 option A).
// Chargés une fois par session, l'accueil se re-rend quand c'est prêt.
// ============================================================

function _comprendreLeCadreChargerAccueilExtra() {
  if (_comprendreLeCadreAccueilExtraEtat === 'encours' || _comprendreLeCadreAccueilExtraEtat === 'ok') { return; }
  _comprendreLeCadreAccueilExtraEtat = 'encours';
  var fiches = Promise.all(COMPRENDRE_LE_CADRE_METHODE_FICHES.map(function (id) {
    return fetch(COMPRENDRE_LE_CADRE_BASE_CONTENU + 'methode/' + id + '.md')
      .then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
  }));
  var sources = fetch(COMPRENDRE_LE_CADRE_CHEMIN_SOURCES)
    .then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; });
  var liens = new Promise(function (res) { _comprendreLeCadreChargerLiensVerifies(res, function () { res({}); }); });
  Promise.all([fiches, sources, liens]).then(function (r) {
    _comprendreLeCadreCacheMethode = r[0].map(function (t, i) {
      var f = t ? _comprendreLeCadreParserFiche(t) : null;
      return f ? { titre: f.titre, pour_qui: f.pour_qui, corps: _comprendreLeCadreRenduCorpsMethode(f.corps) } : null;
    }).filter(Boolean);
    _comprendreLeCadreCacheSourcesOfficielles = _comprendreLeCadreParserSourcesOfficielles(r[1], r[2]);
    _comprendreLeCadreAccueilExtraEtat = 'ok';
    if (_comprendreLeCadreEtat.ecran === 'accueil') { pageComprendreLeCadre(); }
  }).catch(function () { _comprendreLeCadreAccueilExtraEtat = 'erreur'; });
}

// sources.txt : « nom | à quoi ça sert | quand l'ouvrir | nom-du-lien ».
// L'adresse (et sa date) vient de liens-verifies.txt ; lien cliquable
// seulement si la date de vérification est renseignée (LECONS 9.16).
function _comprendreLeCadreParserSourcesOfficielles(texte, liens) {
  return (texte || '').split('\n').map(function (l) {
    var s = l.trim();
    if (!s || s.charAt(0) === '#') { return null; }
    var p = s.split('|').map(function (x) { return x.trim(); });
    if (p.length < 4 || !p[0]) { return null; }
    var lien = (liens && liens[p[3]]) || {};
    return {
      nom: p[0], aQuoi: p[1], quand: p[2],
      url: lien.dateVerification ? lien.url : '',
      date: lien.dateVerification || ''
    };
  }).filter(Boolean);
}

// Corps d'une fiche méthode : ## sous-titres, **gras**, listes, paragraphes.
function _comprendreLeCadreRenduCorpsMethode(corps) {
  var html = '', dansListe = false;
  var gras = function (s) { return _comprendreLeCadreEchapper(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); };
  (corps || '').replace(/^#\s+.*$/m, '').split('\n').forEach(function (brute) {
    var ligne = brute.trim();
    if (!ligne) { if (dansListe) { html += '</ul>'; dansListe = false; } return; }
    var mH = ligne.match(/^##\s+(.+)$/);
    if (mH) {
      if (dansListe) { html += '</ul>'; dansListe = false; }
      html += '<p class="fw-semibold mt-3 mb-1">' + _comprendreLeCadreEchapper(mH[1]) + '</p>';
      return;
    }
    var mL = ligne.match(/^[-*]\s+(.+)$/);
    if (mL) {
      if (!dansListe) { html += '<ul>'; dansListe = true; }
      html += '<li>' + gras(mL[1]) + '</li>';
      return;
    }
    if (dansListe) { html += '</ul>'; dansListe = false; }
    html += '<p>' + gras(ligne) + '</p>';
  });
  if (dansListe) { html += '</ul>'; }
  return html;
}

function _comprendreLeCadreRenduAccueilExtra() {
  if (_comprendreLeCadreAccueilExtraEtat !== 'ok') { return ''; }
  var html = '';

  var fiches = _comprendreLeCadreCacheMethode || [];
  if (fiches.length) {
    html += '<details class="comprendre-le-cadre-depli">' +
      '<summary><span class="comprendre-le-cadre-depli-titre">Comment lire ces fiches</span>' +
      '<span class="comprendre-le-cadre-depli-clic">Cliquez pour ouvrir</span>' +
      '<span class="comprendre-le-cadre-depli-desc">Deux repères de méthode : savoir quelle version d\'une règle s\'applique, reconnaître une source officielle.</span></summary>' +
      '<div class="comprendre-le-cadre-depli-corps">' +
      fiches.map(function (f) {
        return '<details class="comprendre-le-cadre-depli">' +
          '<summary><span class="comprendre-le-cadre-depli-titre">' + _comprendreLeCadreEchapper(f.titre) + '</span>' +
          '<span class="comprendre-le-cadre-depli-clic">Cliquez pour ouvrir</span>' +
          (f.pour_qui ? '<span class="comprendre-le-cadre-depli-desc">' + _comprendreLeCadreEchapper(f.pour_qui) + '</span>' : '') +
          '</summary><div class="comprendre-le-cadre-depli-corps">' + f.corps + '</div></details>';
      }).join('') +
      '</div></details>';
  }

  var sources = _comprendreLeCadreCacheSourcesOfficielles || [];
  if (sources.length) {
    html += '<details class="comprendre-le-cadre-depli">' +
      '<summary><span class="comprendre-le-cadre-depli-titre">Le tableau des sources officielles</span>' +
      '<span class="comprendre-le-cadre-depli-clic">Cliquez pour ouvrir</span>' +
      '<span class="comprendre-le-cadre-depli-desc">À quoi sert chaque source, et quand l\'ouvrir.</span></summary>' +
      '<div class="comprendre-le-cadre-depli-corps"><ul class="comprendre-le-cadre-sources">' +
      sources.map(function (s) {
        return '<li>' +
          '<span class="comprendre-le-cadre-source-nom">' + _comprendreLeCadreEchapper(s.nom) + '</span>' +
          '<span class="d-block small text-muted">' + _comprendreLeCadreEchapper(s.aQuoi) + '</span>' +
          '<span class="d-block small text-muted"><em>' + _comprendreLeCadreEchapper(s.quand) + '</em></span>' +
          (s.url
            ? '<a class="comprendre-le-cadre-source-lien" href="' + _comprendreLeCadreEchapper(s.url) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> ' + _comprendreLeCadreEchapper(s.url) + '</a>' +
              '<span class="comprendre-le-cadre-source-date">adresse vérifiée le ' + _comprendreLeCadreDateFr(s.date) + '</span>'
            : '<span class="comprendre-le-cadre-source-date comprendre-le-cadre-source-nonverif">adresse pas encore vérifiée</span>') +
          '</li>';
      }).join('') +
      '</ul></div></details>';
  }
  return html;
}

// Écran « Affiner ma recherche » (ex-orienteur « Par où commencer ? »,
// décision 19 de la maquette + chantier récit libre 2026-09-06). Deux
// parties : (1) les cases à cocher, voie rapide, réponse immédiate et
// déterministe, jamais un avis sur la personne ; (2) le champ libre, qui
// prépare un texte de recherche pour un assistant en ligne (2e temps de
// la maquette, enfin construit). État de l'écran : `orienteur`.
function _comprendreLeCadreRenduOrienteur() {
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Revenir à Comprendre le cadre') +
    '<h1><i class="bi bi-search"></i> Affiner ma recherche</h1>' +
    '<p class="fs-6">Deux façons de trouver les bons sujets. La première si vous savez nommer votre situation. La seconde si c\'est plus flou.</p>' +
    '<h2 class="h5 fw-bold mt-4 mb-1">1. Cochez ce qui vous concerne</h2>' +
    '<p class="small text-muted mb-2">Vous pouvez en cocher plusieurs. Ce n\'est pas un avis sur vous : on vous montre juste les rayons à regarder.</p>' +
    '<div class="comprendre-le-cadre-orienteur-cases mb-3" id="comprendreLeCadreOrienteurCases">' +
      ORIENTEUR_CASES.map(function (c) {
        return '<button type="button" class="comprendre-le-cadre-case" data-comprendre-le-cadre-case="' + c.r + '">' +
          '<i class="bi bi-square"></i><span>' + c.libelle + '</span></button>';
      }).join('') +
    '</div>' +
    '<div id="comprendreLeCadreOrienteurResultat"></div>' +
    '<h2 class="h5 fw-bold mt-4 mb-1">2. Ou décrivez votre situation avec vos mots</h2>' +
    '<div class="comprendre-le-cadre-encart comprendre-le-cadre-avert mb-2">' +
      '<i class="bi bi-shield-lock"></i> <strong>N\'écrivez pas votre nom, votre adresse, le nom de votre employeur.</strong> ' +
      'Décrivez la situation, pas les personnes. Rien n\'est enregistré.' +
    '</div>' +
    '<textarea id="comprendreLeCadreRechercheTexte" class="comprendre-le-cadre-textarea" rows="4" ' +
      'placeholder="Par exemple : je viens de trouver un emploi à trente kilomètres, je n\'ai pas le permis, ' +
      'j\'ai encore des dettes d\'un ancien loyer et je ne sais pas si je peux être aidé pour la voiture..."></textarea>' +
    '<p class="small text-muted mt-1 mb-2">L\'application prépare un texte de recherche. Vous le collez chez un assistant en ligne, ' +
      'qui vous renvoie les sujets que votre message touche (pas un avis sur vous), et vous pose au besoin quelques questions.</p>' +
    '<button type="button" class="btn btn-primary" id="comprendreLeCadreRecherchePreparer" disabled>' +
      'Préparer ma recherche <i class="bi bi-arrow-right"></i></button>';
}

// ---- « Affiner ma recherche » : le premier temps (prompt 1) ----

// Construit le premier texte de recherche à partir du champ libre + du
// territoire connu. Socle et ton repris de l'outil de veille (voir
// _comprendreLeCadreSocleRecherche / COMPRENDRE_LE_CADRE_TON_RECHERCHE).
function _comprendreLeCadreRecherchePrompt1() {
  var r = _comprendreLeCadreRecherche || {};
  var terr = _comprendreLeCadreTerritoirePourPrompt();
  return _comprendreLeCadreSocleRecherche() + "\n\n"
    + "J'accompagne une personne en insertion professionnelle. Elle a décrit sa situation avec ses mots ; "
    + "aide-la à comprendre quels sujets sa demande touche.\n\n"
    + "Ce qu'elle a écrit, tel quel :\n« " + (r.texteLibre || '').trim() + " »\n\n"
    + "D'abord : reformule sa demande dans un français correct et clair, en une ou deux phrases, sans rien "
    + "ajouter ni retirer. Elle pourra vérifier que tu l'as bien comprise.\n\n"
    + terr + "\n\n"
    + "Organise ta réponse en sous-chapitres, six au maximum. Pour chacun : un titre court, deux à trois "
    + "phrases de description, et le domaine concerné (emploi, budget, logement, mobilité...).\n\n"
    + "Si des points sont ambigus dans ce qu'elle a écrit, pose-lui des questions courtes.\n\n"
    + COMPRENDRE_LE_CADRE_TON_RECHERCHE + "\n\n"
    + "Réponds dans ce format, en gardant les balises :\n"
    + "[REFORMULATION] ta reformulation [/REFORMULATION]\n"
    + "[SUJET] titre | domaine | description [/SUJET]  (autant de fois que de sujets, six maximum)\n"
    + "[QUESTION] ta question [/QUESTION]  (zéro, une ou plusieurs)";
}

// Le territoire connu du module, mis en phrase pour le texte de
// recherche : trois couches (national / régional / départemental), et
// « ne mélange jamais les départements » (décision 9 de la maquette
// d'origine, reprise de docs/VEILLE_PROMPTS.md).
function _comprendreLeCadreTerritoirePourPrompt() {
  var dep = _comprendreLeCadreDepartementCourant();
  var noms = { '24': 'la Dordogne', '87': 'la Haute-Vienne' };
  if (dep && noms[dep]) {
    return "Territoire : réponds pour " + noms[dep] + ". Distingue le niveau national, le niveau régional "
      + "(Nouvelle-Aquitaine) et le niveau départemental. Ne mélange jamais les départements. "
      + "La loi est la même dans tout le département, mais les métiers qui recrutent, les structures et "
      + "les dispositifs peuvent varier d'un bassin d'emploi à l'autre : si c'est le cas, précise pour quelle zone.";
  }
  return "Territoire : réponds pour la France entière. Si une règle particulière ne vaut que dans certaines "
    + "régions ou certains départements, signale-le.";
}

// Écran « copier le texte de recherche / coller la réponse », partagé par
// les deux temps (prompt 1 et prompt 2) : seul le contenu change (titre,
// texte du prompt, ids de la zone de réponse et du bouton suivant).
function _comprendreLeCadreRenduCollageRecherche(cfg) {
  var assistantsSans = (typeof ASSISTANTS_IA !== 'undefined')
    ? ASSISTANTS_IA.filter(function (a) { return typeof ASSISTANTS_SANS_COMPTE_IA !== 'undefined' && ASSISTANTS_SANS_COMPTE_IA.indexOf(a.id) !== -1; })
    : [];
  var assistantsCompte = (typeof ASSISTANTS_IA !== 'undefined')
    ? ASSISTANTS_IA.filter(function (a) { return !(typeof ASSISTANTS_SANS_COMPTE_IA !== 'undefined' && ASSISTANTS_SANS_COMPTE_IA.indexOf(a.id) !== -1); })
    : [];
  function liens(liste, label) {
    if (!liste.length) { return ''; }
    return '<p class="small text-muted mb-1 mt-2">' + label + '</p>' +
      '<div class="comprendre-le-cadre-assistants mb-2">' + liste.map(function (a) {
        return '<a class="comprendre-le-cadre-assistant" href="' + a.url + '" target="_blank" rel="noopener">' + a.nom + '</a>';
      }).join('') + '</div>';
  }
  return '' +
    _comprendreLeCadreRenduBoutonRetour(cfg.retourLabel) +
    '<h1><i class="bi bi-search"></i> ' + cfg.titre + '</h1>' +
    '<p class="fs-6">' + cfg.sousTitre + '</p>' +
    '<div class="comprendre-le-cadre-prompt">' + _comprendreLeCadreEchapper(cfg.promptTexte) + '</div>' +
    '<button type="button" class="btn btn-primary mt-2 mb-3" id="' + cfg.btnCopierId + '">' +
      '<i class="bi bi-clipboard"></i> Copier le texte</button>' +
    '<p class="small text-muted mb-1"><strong>1.</strong> Copiez le texte, ouvrez un assistant en ligne, collez.</p>' +
    liens(assistantsSans, 'Sans compte :') +
    liens(assistantsCompte, 'Avec un compte :') +
    '<p class="small text-muted mb-1 mt-2"><strong>2.</strong> Copiez sa réponse et collez-la ici :</p>' +
    '<textarea id="' + cfg.reponseId + '" class="comprendre-le-cadre-textarea" rows="5" ' +
      'placeholder="Collez ici la réponse de l\'assistant..."></textarea>' +
    '<p class="small text-danger mt-1 mb-2" id="' + cfg.errId + '" hidden></p>' +
    '<button type="button" class="btn btn-primary" id="' + cfg.btnSuivantId + '">' +
      cfg.btnSuivantLabel + ' <i class="bi bi-arrow-right"></i></button>';
}

function _comprendreLeCadreRenduRecherchePrompt1() {
  return _comprendreLeCadreRenduCollageRecherche({
    retourLabel: 'Revenir à ma recherche',
    titre: 'Le texte de recherche',
    sousTitre: 'L\'application a préparé ce texte à partir de ce que vous avez écrit. Vous n\'avez rien à rédiger.',
    promptTexte: _comprendreLeCadreRecherchePrompt1(),
    btnCopierId: 'comprendreLeCadreRechercheCopier1',
    reponseId: 'comprendreLeCadreRechercheReponse1',
    errId: 'comprendreLeCadreRechercheErr1',
    btnSuivantId: 'comprendreLeCadreRechercheVoirSujets',
    btnSuivantLabel: 'Voir les sujets'
  });
}

function _comprendreLeCadreRenduRecherchePrompt2() {
  return _comprendreLeCadreRenduCollageRecherche({
    retourLabel: 'Revenir aux précisions',
    titre: 'Le texte de recherche approfondie',
    sousTitre: 'Préparé à partir des sujets choisis et de vos réponses.',
    promptTexte: _comprendreLeCadreRecherchePrompt2(),
    btnCopierId: 'comprendreLeCadreRechercheCopier2',
    reponseId: 'comprendreLeCadreRechercheReponse2',
    errId: 'comprendreLeCadreRechercheErr2',
    btnSuivantId: 'comprendreLeCadreRechercheVoirResultat',
    btnSuivantLabel: 'Voir le résultat'
  });
}

// Découpe une réponse d'assistant balisée [REFORMULATION] / [SUJET] /
// [QUESTION]. Tolérant : si aucune balise n'est trouvée, renvoie null,
// l'appelant affiche alors la réponse brute (comme les digests).
function _comprendreLeCadreParserReponse1(texte) {
  var t = String(texte || '');
  var reformulation = (t.match(/\[REFORMULATION\]([\s\S]*?)\[\/REFORMULATION\]/i) || [])[1] || '';
  var sujets = [];
  var reSujet = /\[SUJET\]([\s\S]*?)\[\/SUJET\]/gi, m;
  while ((m = reSujet.exec(t)) && sujets.length < 6) {
    var parts = m[1].split('|').map(function (p) { return p.trim(); });
    if (parts[0]) { sujets.push({ titre: parts[0], domaine: (parts[1] || '').toLowerCase(), description: parts[2] || '' }); }
  }
  var questions = [];
  var reQ = /\[QUESTION\]([\s\S]*?)\[\/QUESTION\]/gi;
  while ((m = reQ.exec(t))) { var q = m[1].trim(); if (q) { questions.push(q); } }
  if (!reformulation && !sujets.length && !questions.length) { return null; }
  return { reformulation: reformulation.trim(), sujets: sujets, questions: questions, brut: t.trim() };
}

// Échappe le HTML (les textes de prompt et les réponses d'assistant sont
// affichés dans des <div>, jamais injectés comme HTML).
function _comprendreLeCadreEchapper(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _comprendreLeCadreRenduRechercheSujets() {
  var r = _comprendreLeCadreRecherche || {};
  var domaineLabel = function (d) { return (RAYON_LABEL[d] && RAYON_LABEL[d].titre) || d; };
  var sujetsHTML = r.sujets.length
    ? r.sujets.map(function (s, i) {
        var estRayon = !!RAYON_LABEL[s.domaine];
        return '<label class="comprendre-le-cadre-sujet" for="comprendreLeCadreSujet' + i + '">' +
          '<input type="checkbox" class="comprendre-le-cadre-sujet-case" id="comprendreLeCadreSujet' + i + '" data-comprendre-le-cadre-sujet-index="' + i + '">' +
          '<span class="comprendre-le-cadre-sujet-corps">' +
            '<span class="comprendre-le-cadre-sujet-titre">' + _comprendreLeCadreEchapper(s.titre) +
              (s.domaine ? ' <span class="comprendre-le-cadre-badge">' + _comprendreLeCadreEchapper(domaineLabel(s.domaine)) + '</span>' : '') +
            '</span>' +
            (s.description ? '<span class="comprendre-le-cadre-sujet-desc">' + _comprendreLeCadreEchapper(s.description) + '</span>' : '') +
            (estRayon ? '<button type="button" class="btn btn-sm btn-outline-secondary mt-1" data-comprendre-le-cadre-sujet-rayon="' + s.domaine + '">' +
              'Ouvrir le rayon ' + _comprendreLeCadreEchapper(domaineLabel(s.domaine)) + '</button>' : '') +
          '</span>' +
          '</label>';
      }).join('')
    : '<p class="text-muted">L\'assistant n\'a pas renvoyé de sujet dans le format attendu. Sa réponse complète est ci-dessous.</p>' +
      '<div class="comprendre-le-cadre-prompt">' + _comprendreLeCadreEchapper(r.brutReponse1 || '') + '</div>';
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Revenir au texte de recherche') +
    '<h1><i class="bi bi-list-check"></i> Les sujets que votre message touche</h1>' +
    (r.reformulation
      ? '<div class="comprendre-le-cadre-encart comprendre-le-cadre-ok mb-3">' +
          '<p class="mb-1"><strong>Ce que l\'assistant a compris de votre demande :</strong></p>' +
          '<p class="mb-0">' + _comprendreLeCadreEchapper(r.reformulation) + '</p>' +
        '</div>'
      : '') +
    (r.sujets.length ? '<p class="fs-6">Cochez ceux que vous voulez creuser.</p>' : '') +
    sujetsHTML +
    (r.sujets.length
      ? '<button type="button" class="btn btn-primary mt-3" id="comprendreLeCadreRechercheVersQuestions" disabled>' +
          'Préparer la recherche approfondie <i class="bi bi-arrow-right"></i></button>'
      : '');
}

// Écran « Quelques précisions » : les questions posées avant le 2e texte
// de recherche. Trois origines, dans cet ordre : les 3 questions
// universelles (toujours), puis les questions du rayon de chaque sujet
// coché (COMPRENDRE_LE_CADRE_QUESTIONS_RAYON), puis les questions que
// l'assistant a posées dans sa réponse au 1er texte. Toutes facultatives.
// Écran séparé de la sélection des sujets (déviation assumée par rapport
// à la maquette, qui les montrait ensemble) : un pas = une tâche, plus
// clair pour le public.
function _comprendreLeCadreRenduRechercheQuestions() {
  var r = _comprendreLeCadreRecherche || {};
  var rayonsChoisis = [];
  r.sujetsChoisis.forEach(function (i) {
    var d = (r.sujets[i] || {}).domaine;
    if (d && COMPRENDRE_LE_CADRE_QUESTIONS_RAYON[d] && rayonsChoisis.indexOf(d) === -1) { rayonsChoisis.push(d); }
  });
  function champ(cle, question) {
    return '<label class="mt-2" for="' + cle + '">' + _comprendreLeCadreEchapper(question) + '</label>' +
      '<input type="text" class="comprendre-le-cadre-champ" id="' + cle + '" data-comprendre-le-cadre-question="' + cle + '">';
  }
  var universelles = COMPRENDRE_LE_CADRE_QUESTIONS_UNIVERSELLES.map(function (q, i) {
    return champ('comprendreLeCadreQU' + i, q);
  }).join('');
  var parRayon = rayonsChoisis.map(function (d) {
    return '<p class="q-origine mt-3">Questions liées à « ' + _comprendreLeCadreEchapper((RAYON_LABEL[d] && RAYON_LABEL[d].titre) || d) + ' »</p>' +
      COMPRENDRE_LE_CADRE_QUESTIONS_RAYON[d].map(function (q, i) { return champ('comprendreLeCadreQR_' + d + '_' + i, q); }).join('');
  }).join('');
  var assistant = r.questionsAssistant.length
    ? '<p class="q-origine mt-3">Questions posées par l\'assistant</p>' +
      r.questionsAssistant.map(function (q, i) { return champ('comprendreLeCadreQA' + i, q); }).join('')
    : '';
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Revenir aux sujets') +
    '<h1><i class="bi bi-chat-left-text"></i> Quelques précisions pour aller plus loin</h1>' +
    '<p class="fs-6">Vous pouvez laisser une question sans réponse : ce n\'est jamais bloquant. Rien de tout ceci n\'est enregistré.</p>' +
    '<p class="q-origine">Questions de l\'application</p>' +
    universelles +
    parRayon +
    assistant +
    '<label class="mt-3" for="comprendreLeCadreRechercheContexte">Autre chose à ajouter ? <span class="text-muted small">(facultatif)</span></label>' +
    '<textarea id="comprendreLeCadreRechercheContexte" class="comprendre-le-cadre-textarea" rows="3" ' +
      'placeholder="Un détail qui vous paraît important..."></textarea>' +
    '<button type="button" class="btn btn-primary mt-3" id="comprendreLeCadreRechercheVersPrompt2">' +
      'Préparer le texte de recherche <i class="bi bi-arrow-right"></i></button>';
}

// Construit le second texte de recherche : les sujets cochés, les
// réponses aux questions (universelles + rayon + assistant, celles qui
// sont remplies), le contexte libre, le territoire. Même socle et même
// ton que le premier (repris de l'outil de veille).
function _comprendreLeCadreRecherchePrompt2() {
  var r = _comprendreLeCadreRecherche || {};
  var sujets = r.sujetsChoisis.map(function (i) { return (r.sujets[i] || {}).titre; }).filter(Boolean);
  var precisions = Object.keys(r.reponsesQuestions).map(function (q) {
    var a = (r.reponsesQuestions[q] || '').trim();
    return a ? '- ' + q + ' ' + a : '';
  }).filter(Boolean).join("\n");
  return _comprendreLeCadreSocleRecherche() + "\n\n"
    + "Approfondis les sujets suivants, pour une personne que j'accompagne en insertion.\n\n"
    + _comprendreLeCadreTerritoirePourPrompt() + "\n\n"
    + "Sujets à creuser :\n" + sujets.map(function (t) { return "- " + t; }).join("\n") + "\n\n"
    + (precisions ? "Ce que la personne a précisé :\n" + precisions + "\n\n" : "")
    + ((r.contexteLibre || '').trim() ? "Elle ajoute : « " + r.contexteLibre.trim() + " »\n\n" : "")
    + "Pour chaque sujet :\n"
    + "- l'information concrète (qui a droit, combien, comment demander) ;\n"
    + "- la source officielle et sa date ;\n"
    + "- ce qui change souvent, à revérifier ;\n"
    + "- la ou les structures à contacter sur ce territoire, avec le moyen de contact.\n\n"
    + COMPRENDRE_LE_CADRE_TON_RECHERCHE + "\n"
    + "Si la réponse dépend de la situation personnelle de la personne, explique de quoi elle dépend, sans conclure à sa place.";
}

// Écran final : la réponse de l'assistant au 2e texte, remise en forme
// (markdown à main levée, même rendu tolérant que les fiches) dans un
// cadre d'avertissement - jamais présentée comme une vérité de
// l'application. Rappel appuyé que rien n'est enregistré (option A,
// décision Denis 2026-09-06) : si la personne veut garder, elle copie
// maintenant. Renvois vers les rayons touchés + reprise à zéro.
function _comprendreLeCadreRenduRechercheResultat() {
  var r = _comprendreLeCadreRecherche || {};
  var rayonsChoisis = [];
  (r.sujetsChoisis || []).forEach(function (i) {
    var d = (r.sujets[i] || {}).domaine;
    if (d && RAYON_LABEL[d] && rayonsChoisis.indexOf(d) === -1) { rayonsChoisis.push(d); }
  });
  var lienRayons = rayonsChoisis.length
    ? '<p class="small mb-1 mt-4">Pour vérifier sur nos fiches :</p>' +
      rayonsChoisis.map(function (d) {
        return '<button type="button" class="btn btn-outline-secondary text-start w-100 d-flex align-items-center gap-2 mb-2" data-comprendre-le-cadre-sujet-rayon="' + d + '">' +
          '<i class="bi ' + RAYON_LABEL[d].icone + '"></i> ' + _comprendreLeCadreEchapper(RAYON_LABEL[d].titre) + '</button>';
      }).join('')
    : '';
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Revenir au texte de recherche') +
    '<h1><i class="bi bi-file-text"></i> Ce que l\'assistant a répondu</h1>' +
    '<div class="comprendre-le-cadre-encart comprendre-le-cadre-avert mb-3">' +
      '<p class="mb-1"><i class="bi bi-exclamation-triangle"></i> <strong>C\'est la réponse d\'un assistant en ligne, pas un avis de l\'application ni un avis sur votre situation.</strong></p>' +
      '<p class="mb-0">Vérifiez chaque point sur la source officielle citée avant d\'agir. En cas de doute, parlez-en à la structure indiquée ou à votre conseiller.</p>' +
    '</div>' +
    '<div class="comprendre-le-cadre-corps">' + _comprendreLeCadreRenduCorps(r.brutReponse2 || '') + '</div>' +
    '<div class="comprendre-le-cadre-encart comprendre-le-cadre-avert mt-3">' +
      '<p class="mb-1"><i class="bi bi-clipboard"></i> <strong>Cette recherche n\'est pas enregistrée.</strong></p>' +
      '<p class="mb-2">Les règles changent souvent : garder une réponse ancienne serait un risque. Si vous voulez la conserver, copiez le texte maintenant et collez-le où vous le gardez d\'habitude.</p>' +
      '<button type="button" class="btn btn-primary" id="comprendreLeCadreRechercheCopierResultat">' +
        '<i class="bi bi-clipboard"></i> Copier la réponse</button>' +
    '</div>' +
    lienRayons +
    '<div class="d-flex flex-wrap gap-2 mt-4">' +
      '<button type="button" class="btn btn-outline-primary" id="comprendreLeCadreRechercheRecommencer">' +
        '<i class="bi bi-arrow-repeat"></i> Nouvelle recherche</button>' +
      '<button type="button" class="btn btn-outline-secondary" id="comprendreLeCadreRechercheFin">' +
        'Revenir au module</button>' +
    '</div>';
}

function _comprendreLeCadreBrancherRechercheResultat() {
  var r = _comprendreLeCadreRecherche || {};
  var btnCopier = document.getElementById('comprendreLeCadreRechercheCopierResultat');
  if (btnCopier) {
    btnCopier.addEventListener('click', function () {
      var ok = function () {
        btnCopier.innerHTML = '<i class="bi bi-check2"></i> Copié';
        setTimeout(function () { btnCopier.innerHTML = '<i class="bi bi-clipboard"></i> Copier la réponse'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(r.brutReponse2 || '').then(ok, function () {});
      }
    });
  }
  document.querySelectorAll('[data-comprendre-le-cadre-sujet-rayon]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreOuvrirRayon(this.dataset.comprendreLeCadreSujetRayon);
    });
  });
  var btnRecommencer = document.getElementById('comprendreLeCadreRechercheRecommencer');
  if (btnRecommencer) {
    btnRecommencer.addEventListener('click', function () {
      _comprendreLeCadreRecherche = null;
      _comprendreLeCadreEtat.ecran = 'orienteur';
      pageComprendreLeCadre();
      if (typeof trackEvenement === 'function') { trackEvenement('comprendre_le_cadre_recherche_recommencee'); }
    });
  }
  var btnFin = document.getElementById('comprendreLeCadreRechercheFin');
  if (btnFin) {
    btnFin.addEventListener('click', function () {
      _comprendreLeCadreRecherche = null;
      _comprendreLeCadreEtat.ecran = 'accueil';
      pageComprendreLeCadre();
    });
  }
}

// ---- fin « Affiner ma recherche » (temps 1 et temps 2) ----


// Bouton de retour contextuel de chaque écran (rayon, fiche, orienteur,
// structures, digest) - jamais un bouton "Retour" générique qui
// ramènerait à l'accueil de toute l'application (voir
// LECONS_A_NE_PAS_REPRODUIRE.md, section 2 : toujours l'écran précédent).
// Retour Denis 2026-09-05 : un vrai bouton plein, de la même couleur que
// « Par où commencer ? » (btn btn-primary), pour qu'on comprenne au
// premier regard que c'est bien un bouton d'action - jamais un lien de
// texte. Reste visuellement distinct de la pilule à contour « Revoir la
// présentation » (celle-là est une bordure, pas un bouton plein).
function _comprendreLeCadreRenduBoutonRetour(libelle) {
  return '<button type="button" class="btn btn-primary comprendre-le-cadre-bouton-retour" data-comprendre-le-cadre-retour>' +
    '<i class="bi bi-arrow-left"></i> ' + libelle + '</button>';
}

// Écran "liste des fiches d'un rayon" (étape 2). Chaque ligne affiche le
// titre et, en soutien, le "pour qui" déjà écrit dans la fiche - jamais
// un extrait du corps, qui obligerait à afficher un bout de phrase hors
// contexte.
function _comprendreLeCadreRenduListeFiches(idRayon, fiches) {
  var info = RAYON_LABEL[idRayon] || { icone: 'bi-folder2', titre: idRayon };
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Tous les rayons') +
    '<h1><i class="bi ' + info.icone + '"></i> ' + info.titre + '</h1>' +
    '<button type="button" class="btn btn-outline-primary mb-3" data-comprendre-le-cadre-ouvrir-structures>' +
      '<i class="bi bi-geo-alt"></i> Près de chez moi</button>' +
    fiches.map(function (f) {
      return '' +
        '<button type="button" class="btn btn-outline-secondary text-start w-100 mb-2" data-comprendre-le-cadre-ouvrir-fiche="' + f.id + '">' +
          '<span class="d-block fw-semibold">' + f.titre + '</span>' +
          (f.pour_qui ? '<span class="d-block small text-muted mt-1">' + f.pour_qui + '</span>' : '') +
        '</button>';
    }).join('');
}

// Écran d'erreur de chargement (rayon introuvable, réseau coupé...) -
// jamais un écran blanc silencieux ni un message technique brut.
function _comprendreLeCadreRenduErreurChargement(libelleRetour) {
  return '' +
    _comprendreLeCadreRenduBoutonRetour(libelleRetour || 'Tous les rayons') +
    '<div class="comprendre-le-cadre-encart">' +
      '<i class="bi bi-exclamation-triangle"></i> Ce rayon n\'a pas pu être chargé pour le moment. Réessayez dans un instant.' +
    '</div>';
}

// Écran "une fiche" (étape 2). Bloc de vérification en pied : la date à
// laquelle l'information a été contrôlée (rendue lisible et un peu plus
// visible, retour Denis 2026-09-05) et, pour chaque source, son nom
// lisible + l'adresse. L'adresse n'est cliquable que si elle a une date
// de vérification dans liens-verifies.txt (LECONS 9.16) : la personne
// peut alors "aller voir de ses propres yeux". Sinon, nom seul + mention
// honnête.
function _comprendreLeCadreRenduFiche(f) {
  var sources = f.sourcesResolues || (f.sources || []).map(function (n) { return { nom: n, titre: n, verifie: false }; });
  var listeSources = !sources.length ? '' :
    '<ul class="comprendre-le-cadre-sources">' + sources.map(function (s) {
      if (s.verifie) {
        return '<li>' +
          '<span class="comprendre-le-cadre-source-nom">' + s.titre + '</span>' +
          '<a class="comprendre-le-cadre-source-lien" href="' + s.url + '" target="_blank" rel="noopener">' +
            '<i class="bi bi-box-arrow-up-right"></i> ' + s.url + '</a>' +
          '<span class="comprendre-le-cadre-source-date">adresse vérifiée le ' + _comprendreLeCadreDateFr(s.date) + '</span>' +
        '</li>';
      }
      return '<li>' +
        '<span class="comprendre-le-cadre-source-nom">' + s.titre + '</span>' +
        '<span class="comprendre-le-cadre-source-date comprendre-le-cadre-source-nonverif">adresse pas encore vérifiée</span>' +
      '</li>';
    }).join('') + '</ul>';
  // TACHE (audit croise Lexique/Cadre/Chiffres, 2026-09-12, principe
  // valide par Denis sur la fiche emploi-csp -> Lexique "csp") : un
  // renvoi vers le Lexique par fiche liee (voir_aussi_lexique en
  // frontmatter), jamais devine -- vide tant qu'aucun lien reel n'a ete
  // pose pour cette fiche. Le clic est branche dans pageComprendreLeCadre()
  // (ecran 'fiche'), qui pose aussi le bouton "colle" (definirRetourModuleExterne(),
  // app.js) pour que la personne retrouve cette fiche EXACTEMENT, meme
  // apres avoir navigue entre plusieurs fiches du Lexique.
  var voirAussiLexique = (f.voir_aussi_lexique || []).map(function (idLex) {
    var ficheLex = (typeof _lexiqueTrouverFiche === 'function') ? _lexiqueTrouverFiche(idLex) : null;
    if (!ficheLex) { return ''; }
    return '<button type="button" class="btn btn-outline-secondary btn-sm me-2 mb-2" data-voir-aussi-lexique="' + idLex + '">' +
      '<i class="bi bi-book"></i> ' + ficheLex.titre + ' (Lexique)</button>';
  }).join('');
  // TACHE (retour Denis 2026-09-12) : le titre seul ne disait pas la vraie
  // valeur ajoutee du Lexique. 1ere formulation ecartee ("explique ce mot
  // plus en detail") : pas toujours vrai, la fiche du Cadre est parfois
  // deja plus detaillee -- la vraie valeur, toujours vraie elle, c'est le
  // reseau de mots lies (relations "voir aussi" / "a ne pas confondre
  // avec" du Lexique, d'un mot a l'autre) qu'on ne trouve nulle part dans
  // Comprendre le cadre.
  // TACHE (extension Comprendre les chiffres, 2026-09-12) : meme principe
  // que voir_aussi_lexique, mais ce module n'a pas de fiches individuelles
  // adressables comme le Lexique -- un seul bouton generique vers son
  // accueil, avec la phrase du frontmatter comme etiquette (ex. "Comment
  // on est embauche ici"). Le clic est branche dans pageComprendreLeCadre().
  var voirAussiChiffres = f.voir_aussi_chiffres
    ? '<button type="button" class="btn btn-outline-secondary btn-sm me-2 mb-2" data-voir-aussi-chiffres="1">' +
        '<i class="bi bi-bar-chart"></i> ' + f.voir_aussi_chiffres + ' (Comprendre les chiffres)</button>'
    : '';
  var phrasesVoirAussi = '' +
    (voirAussiLexique ? '<p class="text-muted small mb-2">Le Lexique relie ce mot à d\'autres mots et expressions du même sujet, pour naviguer de l\'un à l\'autre.</p>' : '') +
    (voirAussiChiffres ? '<p class="text-muted small mb-2">Comprendre les chiffres montre, pour votre territoire, les chiffres réels derrière cette question.</p>' : '');
  var blocVoirAussi = (voirAussiLexique || voirAussiChiffres)
    ? '<div class="comprendre-le-cadre-encart mt-4">' +
        '<p class="fw-semibold mb-1">Pour aller plus loin :</p>' +
        phrasesVoirAussi + voirAussiLexique + voirAussiChiffres +
      '</div>'
    : '';
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Retour au rayon') +
    '<h1>' + f.titre + '</h1>' +
    (f.pour_qui ? '<p class="text-muted">' + f.pour_qui + '</p>' : '') +
    '<div class="comprendre-le-cadre-corps">' + _comprendreLeCadreRenduCorps(f.corps) + '</div>' +
    blocVoirAussi +
    '<div class="comprendre-le-cadre-fiche-verif mt-4">' +
      '<p class="comprendre-le-cadre-verif-ligne">' +
        '<i class="bi bi-calendar-check"></i> Information vérifiée en ' +
        '<strong>' + (_comprendreLeCadreDateFr(f.verifie_le) || 'date inconnue') + '</strong>.' +
      '</p>' +
      (listeSources
        ? '<p class="small mb-1 mt-2">Pour vérifier vous-même, les sources officielles :</p>' + listeSources
        : '') +
    '</div>';
}

// Département brut mémorisé : '24' / '87' / 'ailleurs' / null.
function _comprendreLeCadreDepartementCourant() {
  return (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
}

// Carte d'une structure (retour Denis 2026-09-05 : lien cliquable
// seulement si l'adresse est vérifiée, LECONS 9.16 ; sinon nom +
// description en texte simple avec une mention honnête).
function _comprendreLeCadreRenduCarteStructure(s) {
  return '' +
    '<div class="comprendre-le-cadre-encart mb-2">' +
      '<span class="d-block fw-semibold">' + s.titre + '</span>' +
      (s.detail ? '<span class="d-block small">' + s.detail + '</span>' : '') +
      (s.verifie
        ? '<a href="' + s.url + '" target="_blank" rel="noopener" class="d-block small mt-1"><i class="bi bi-box-arrow-up-right"></i> ' + s.url + '</a>' +
          '<span class="comprendre-le-cadre-source-date">adresse vérifiée le ' + _comprendreLeCadreDateFr(s.date) + '</span>'
        : '<span class="d-block small text-muted mt-1"><i class="bi bi-clock-history"></i> Adresse pas encore vérifiée.</span>') +
    '</div>';
}

// Écran "Près de chez moi" : les structures à qui s'adresser pour ce
// rayon, groupées par portée (national / régional Nouvelle-Aquitaine /
// départemental) selon le 4e champ de liens-verifies.txt - voir
// docs/CHANTIER_TERRITOIRE_REGION_DEPARTEMENT.md. National et régional
// toujours affichés ; départemental filtré sur le département choisi.
// Si rien de départemental : phrase de repli honnête (échelle niveau 2).
// Structures pas encore taguées : section neutre à part, jamais mélangées
// aux autres. Utilisateur "ailleurs" : national uniquement.
function _comprendreLeCadreRenduStructures(idRayon, structures) {
  var info = RAYON_LABEL[idRayon] || { icone: 'bi-folder2', titre: idRayon };
  var dep = _comprendreLeCadreDepartementCourant();
  var libDep = _comprendreLeCadreLibelleTerritoire();
  var estNaq = (dep === '24' || dep === '87');

  var national = [], regional = [], departemental = [], nonTaguees = [];
  structures.forEach(function (s) {
    if (s.portee === 'national') { national.push(s); }
    else if (s.portee === 'region') { regional.push(s); }
    else if (s.portee === '24' || s.portee === '87') { if (s.portee === dep) { departemental.push(s); } }
    else { nonTaguees.push(s); }
  });

  function section(titre, liste) {
    if (!liste.length) { return ''; }
    return '<h2 class="h5 fw-bold text-uppercase text-muted mt-4 mb-2">' + titre + '</h2>' +
      liste.map(_comprendreLeCadreRenduCarteStructure).join('');
  }

  var corps = '';
  corps += section('Partout en France', national);
  if (estNaq) { corps += section('En Nouvelle-Aquitaine', regional); }
  if (estNaq) {
    if (departemental.length) {
      corps += section('En ' + libDep, departemental);
    } else if (national.length || regional.length) {
      corps += '<div class="comprendre-le-cadre-encart mt-4">' +
        '<i class="bi bi-info-circle"></i> Nous n\'avons pas encore de structure précise pour ' + libDep +
        ' sur ce sujet. Les organismes ci-dessus s\'appliquent aussi chez vous ; pour le point d\'entrée près de chez vous, adressez-vous à France Travail, votre Mission Locale, le CCAS de votre commune ou un point conseil budget.' +
      '</div>';
    }
  }
  if (nonTaguees.length) {
    corps += '<h2 class="h5 fw-bold text-uppercase text-muted mt-4 mb-2">À vérifier selon votre territoire</h2>' +
      '<p class="small text-muted">Ces structures n\'ont pas encore été rattachées à un territoire précis. Vérifiez qu\'elles correspondent bien à ' + (estNaq ? libDep : 'votre département') + '.</p>' +
      nonTaguees.map(_comprendreLeCadreRenduCarteStructure).join('');
  }
  if (!estNaq && (regional.length || departemental.length || nonTaguees.length) && !national.length && !corps) {
    corps = '<div class="comprendre-le-cadre-encart"><i class="bi bi-info-circle"></i> Les structures recensées pour ce rayon concernent la Dordogne ou la Haute-Vienne. Pour votre département, adressez-vous aux portes universelles : le CCAS de votre commune, une Maison des solidarités, France Services, un point conseil budget.</div>';
  }
  if (!corps) {
    corps = '<div class="comprendre-le-cadre-encart"><i class="bi bi-info-circle"></i> Aucune structure recensée pour ce rayon pour le moment.</div>';
  }

  return '' +
    _comprendreLeCadreRenduBoutonRetour('Retour au rayon') +
    '<h1><i class="bi bi-geo-alt"></i> Près de chez moi</h1>' +
    '<p class="text-muted">Rayon : ' + info.titre + ' · Territoire : ' + libDep + '.</p>' +
    corps +
    '<div class="comprendre-le-cadre-encart small mt-4">' +
      '<p class="mb-2"><i class="bi bi-signpost-2"></i> Pour un annuaire plus large des structures de votre territoire :</p>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-comprendre-le-cadre-annuaire>Ouvrir l\'annuaire local</button>' +
    '</div>';
}

// Écran « Aucun digest disponible » (étape 6) : les 8 trimestres
// candidats ont tous échoué, situation normale tant que Denis n'a publié
// aucun digest - jamais le même message que
// _comprendreLeCadreRenduErreurChargement() (qui invite à réessayer,
// utile seulement pour un vrai incident réseau), pour rester honnête sur
// la vraie raison.
function _comprendreLeCadreRenduDigestAbsent() {
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Tous les rayons') +
    '<div class="comprendre-le-cadre-encart"><i class="bi bi-info-circle"></i> Aucun digest disponible pour le moment. Revenez plus tard.</div>';
}

// Écran d'un outil « digest » (Balayage ou Chiffres, étape 6). `outil` =
// l'entrée de COMPRENDRE_LE_CADRE_OUTILS ; `digests` = tableau déjà
// chargé (le plus récent en position 0) ; `index` = celui affiché
// (change sans nouveau fetch en cliquant un trimestre précédent, tous
// les digests candidats étant déjà en mémoire, même principe que
// l'orienteur).
function _comprendreLeCadreRenduDigest(outil, digests, index) {
  // Garde-fou : cet écran n'est atteint normalement que via
  // _comprendreLeCadreOuvrirDigest(), qui charge `digests` AVANT de poser
  // l'état. Si on y arrive sans (état forcé, reprise), on montre l'écran
  // « rien publié » plutôt que de planter.
  var d = digests && digests[index || 0];
  if (!d) { return _comprendreLeCadreRenduDigestAbsent(); }
  return '' +
    _comprendreLeCadreRenduBoutonRetour('Tous les rayons') +
    '<h1><i class="bi ' + outil.icone + '"></i> ' + outil.titre + '</h1>' +
    '<p class="text-muted">' + outil.accroche + '</p>' +
    '<div class="comprendre-le-cadre-encart mb-3">' +
      '<i class="bi bi-calendar-event"></i> Digest du trimestre ' + (d.periode || 'non daté') +
      (d.publie_le ? '. Publié en ' + d.publie_le + '.' : '.') +
    '</div>' +
    _comprendreLeCadreRenduDigestCorps(d.corps) +
    (digests.length > 1
      ? '<h3 class="h6 text-uppercase text-muted mt-4 mb-2">Les trimestres précédents</h3>' +
        '<div class="d-flex flex-wrap gap-2 mb-3">' +
        digests.map(function (dg, i) {
          return i === index ? '' :
            '<button type="button" class="btn btn-outline-secondary btn-sm" data-comprendre-le-cadre-digest-index="' + i + '">' + dg.periode + '</button>';
        }).join('') +
        '</div>'
      : '') +
    '<div class="comprendre-le-cadre-encart small">' +
      '<i class="bi bi-exclamation-triangle"></i> Ce n\'est pas une source de droit. Chaque élément renvoie, quand c\'est indiqué, au texte officiel : à recouper avant de vous en servir.' +
    '</div>';
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================

function _comprendreLeCadreBrancherAccueil() {
  var btnTerritoire = document.querySelector('[data-comprendre-le-cadre-changer-territoire]');
  if (btnTerritoire) {
    btnTerritoire.addEventListener('click', function () {
      if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); }
      if (typeof demanderDepartementSiInconnu === 'function') {
        demanderDepartementSiInconnu(function () { pageComprendreLeCadre(); });
      }
    });
  }

  document.querySelectorAll('[data-comprendre-le-cadre-ouvrir-rayon]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreOuvrirRayon(this.dataset.comprendreLeCadreOuvrirRayon);
    });
  });

  var btnOrienteur = document.querySelector('[data-comprendre-le-cadre-ouvrir-orienteur]');
  if (btnOrienteur) {
    btnOrienteur.addEventListener('click', function () {
      _comprendreLeCadreEtat.ecran = 'orienteur';
      pageComprendreLeCadre();
    });
  }

  document.querySelectorAll('[data-comprendre-le-cadre-ouvrir-digest]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreOuvrirDigest(this.dataset.comprendreLeCadreOuvrirDigest);
    });
  });

  var champRecherche = document.getElementById('comprendreLeCadreRechercheInput');
  if (champRecherche) {
    champRecherche.addEventListener('input', function () { _comprendreLeCadreFiltrerAccueil(this.value); });
  }
}

// Sans accents ni casse, pour qu'une recherche tape sans accent
// ("degrossir", "reconversion") trouve quand meme "dégressif"/"reconversion".
function _comprendreLeCadreNormaliser(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Recherche sur l'accueil (retour Denis, 2026-09-05) : filtre les
// sous-cartes de rayons ET d'outils par titre + description ("quoi"),
// jamais par contenu de fiche (pas chargé sur cet écran, voir
// _comprendreLeCadreRenduAccueil()). Une famille entière se masque
// quand aucun de ses rayons ne correspond, pour ne jamais laisser un
// titre de famille sans rien dessous.
function _comprendreLeCadreFiltrerAccueil(texte) {
  var t = _comprendreLeCadreNormaliser(texte);
  var auMoinsUnResultat = false;
  document.querySelectorAll('[data-comprendre-le-cadre-famille]').forEach(function (bloc) {
    var unVisible = false;
    bloc.querySelectorAll('.sous-carte-accueil').forEach(function (carte) {
      var hay = _comprendreLeCadreNormaliser(carte.textContent);
      var correspond = !t || hay.indexOf(t) !== -1;
      carte.hidden = !correspond;
      if (correspond) { unVisible = true; }
    });
    bloc.hidden = !unVisible;
    if (unVisible) { auMoinsUnResultat = true; }
  });
  var messageVide = document.getElementById('comprendreLeCadreRechercheVide');
  if (messageVide) { messageVide.hidden = !t || auMoinsUnResultat; }
}

// Écouteur du bouton de retour, partagé par les écrans rayon, fiche et
// orienteur - une seule fonction plutôt que plusieurs écouteurs quasi
// identiques qui pourraient diverger (voir Règle 13, une source de
// vérité).
function _comprendreLeCadreBrancherRetour(onRetour) {
  var btn = document.querySelector('[data-comprendre-le-cadre-retour]');
  if (btn) { btn.addEventListener('click', onRetour); }
}

// Une case cliquée bascule son état actif puis met à jour uniquement la
// zone de résultat (jamais un re-rendu complet de l'écran, qui perdrait
// l'état des autres cases déjà cochées) - même principe que
// orienteurMaj() dans la maquette.
function _comprendreLeCadreBrancherOrienteur() {
  document.querySelectorAll('#comprendreLeCadreOrienteurCases [data-comprendre-le-cadre-case]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var actif = this.classList.toggle('active');
      this.setAttribute('aria-pressed', actif ? 'true' : 'false');
      var icone = this.querySelector('i.bi');
      if (icone) { icone.className = actif ? 'bi bi-check-square-fill' : 'bi bi-square'; }
      _comprendreLeCadreOrienteurMettreAJour();
    });
  });

  // Partie 2 : le champ libre. Le bouton « Préparer ma recherche » ne
  // s'active qu'avec au moins quelques mots (garde-fou contre le clic à
  // vide), jamais désactivé silencieusement.
  var champ = document.getElementById('comprendreLeCadreRechercheTexte');
  var btnPreparer = document.getElementById('comprendreLeCadreRecherchePreparer');
  if (champ && btnPreparer) {
    var maj = function () { btnPreparer.disabled = champ.value.trim().length < 10; };
    champ.addEventListener('input', maj);
    maj();
    btnPreparer.addEventListener('click', function () {
      _comprendreLeCadreRechercheNeuve();
      _comprendreLeCadreRecherche.texteLibre = champ.value.trim();
      _comprendreLeCadreEtat.ecran = 'recherche-prompt1';
      pageComprendreLeCadre();
      if (typeof trackEvenement === 'function') { trackEvenement('comprendre_le_cadre_recherche_libre_demarree'); }
    });
  }
}

// Câblage partagé de l'écran « copier / coller » (temps 1 et temps 2) :
// bouton Copier (retour visuel « Copié » 2 s) + bouton suivant qui refuse
// une zone de réponse quasi vide (garde-fou) puis appelle onSuivant(brut).
function _comprendreLeCadreBrancherCollageRecherche(cfg) {
  var btnCopier = document.getElementById(cfg.btnCopierId);
  if (btnCopier) {
    btnCopier.addEventListener('click', function () {
      var txt = cfg.promptFn();
      var ok = function () {
        btnCopier.innerHTML = '<i class="bi bi-check2"></i> Copié';
        setTimeout(function () { btnCopier.innerHTML = '<i class="bi bi-clipboard"></i> Copier le texte'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(ok, function () {});
      }
    });
  }
  var btnSuivant = document.getElementById(cfg.btnSuivantId);
  var champ = document.getElementById(cfg.reponseId);
  var err = document.getElementById(cfg.errId);
  if (btnSuivant && champ) {
    btnSuivant.addEventListener('click', function () {
      var brut = champ.value.trim();
      if (brut.length < 20) {
        if (err) { err.hidden = false; err.textContent = 'Collez d\'abord la réponse de l\'assistant.'; }
        return;
      }
      cfg.onSuivant(brut);
    });
  }
}

function _comprendreLeCadreBrancherRecherchePrompt1() {
  _comprendreLeCadreBrancherCollageRecherche({
    promptFn: _comprendreLeCadreRecherchePrompt1,
    btnCopierId: 'comprendreLeCadreRechercheCopier1',
    reponseId: 'comprendreLeCadreRechercheReponse1',
    errId: 'comprendreLeCadreRechercheErr1',
    btnSuivantId: 'comprendreLeCadreRechercheVoirSujets',
    onSuivant: function (brut) {
      var parse = _comprendreLeCadreParserReponse1(brut);
      var r = _comprendreLeCadreRecherche;
      r.brutReponse1 = brut;
      r.reformulation = parse ? parse.reformulation : '';
      r.sujets = parse ? parse.sujets : [];
      r.questionsAssistant = parse ? parse.questions : [];
      r.sujetsChoisis = [];
      _comprendreLeCadreEtat.ecran = 'recherche-sujets';
      pageComprendreLeCadre();
      if (typeof trackEvenement === 'function') {
        trackEvenement('comprendre_le_cadre_recherche_sujets_extraits', { sujets: r.sujets.length, questions: r.questionsAssistant.length });
      }
    }
  });
}

function _comprendreLeCadreBrancherRecherchePrompt2() {
  _comprendreLeCadreBrancherCollageRecherche({
    promptFn: _comprendreLeCadreRecherchePrompt2,
    btnCopierId: 'comprendreLeCadreRechercheCopier2',
    reponseId: 'comprendreLeCadreRechercheReponse2',
    errId: 'comprendreLeCadreRechercheErr2',
    btnSuivantId: 'comprendreLeCadreRechercheVoirResultat',
    onSuivant: function (brut) {
      _comprendreLeCadreRecherche.brutReponse2 = brut;
      _comprendreLeCadreEtat.ecran = 'recherche-resultat';
      pageComprendreLeCadre();
    }
  });
}

function _comprendreLeCadreBrancherRechercheSujets() {
  var r = _comprendreLeCadreRecherche || {};
  var btnVers = document.getElementById('comprendreLeCadreRechercheVersQuestions');
  var majBouton = function () {
    if (btnVers) { btnVers.disabled = !(r.sujetsChoisis && r.sujetsChoisis.length); }
  };
  document.querySelectorAll('[data-comprendre-le-cadre-sujet-index]').forEach(function (input) {
    input.addEventListener('change', function () {
      var i = parseInt(this.getAttribute('data-comprendre-le-cadre-sujet-index'), 10);
      r.sujetsChoisis = r.sujetsChoisis || [];
      var pos = r.sujetsChoisis.indexOf(i);
      if (this.checked && pos === -1) { r.sujetsChoisis.push(i); }
      else if (!this.checked && pos !== -1) { r.sujetsChoisis.splice(pos, 1); }
      majBouton();
    });
  });
  majBouton();
  document.querySelectorAll('[data-comprendre-le-cadre-sujet-rayon]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreOuvrirRayon(this.dataset.comprendreLeCadreSujetRayon);
    });
  });
  if (btnVers) {
    btnVers.addEventListener('click', function () {
      _comprendreLeCadreEtat.ecran = 'recherche-questions';
      pageComprendreLeCadre();
    });
  }
}

// Écran des précisions : collecte à la volée chaque réponse dans
// reponsesQuestions (clé = libellé de la question, pour que le 2e prompt
// puisse écrire « - question réponse ») + le contexte libre, puis passe
// au 2e texte de recherche. Rien n'est enregistré (option A).
function _comprendreLeCadreBrancherRechercheQuestions() {
  var r = _comprendreLeCadreRecherche || {};
  r.reponsesQuestions = {};
  document.querySelectorAll('[data-comprendre-le-cadre-question]').forEach(function (input) {
    var label = document.querySelector('label[for="' + input.id + '"]');
    var question = label ? label.textContent.trim() : input.id;
    input.addEventListener('input', function () {
      r.reponsesQuestions[question] = this.value;
    });
  });
  var contexte = document.getElementById('comprendreLeCadreRechercheContexte');
  if (contexte) {
    contexte.addEventListener('input', function () { r.contexteLibre = this.value; });
  }
  var btn = document.getElementById('comprendreLeCadreRechercheVersPrompt2');
  if (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreEtat.ecran = 'recherche-prompt2';
      pageComprendreLeCadre();
    });
  }
}

function _comprendreLeCadreOrienteurMettreAJour() {
  var actifs = Array.prototype.map.call(
    document.querySelectorAll('#comprendreLeCadreOrienteurCases .active'),
    function (b) { return b.dataset.comprendreLeCadreCase; }
  );
  var zone = document.getElementById('comprendreLeCadreOrienteurResultat');
  if (!zone) { return; }
  if (!actifs.length) { zone.innerHTML = ''; return; }
  var rayons = _comprendreLeCadreRayonsPourCasesCochees(actifs);
  zone.innerHTML = '' +
    '<div class="comprendre-le-cadre-encart mb-3">' +
      '<p class="mb-2"><i class="bi bi-geo-alt"></i> <strong>D\'après ce que vous avez coché, ces rayons peuvent vous aider :</strong></p>' +
      rayons.map(function (id) {
        var info = RAYON_LABEL[id];
        return '<button type="button" class="btn btn-outline-secondary text-start w-100 d-flex align-items-center gap-2 mb-2" data-comprendre-le-cadre-suggestion="' + id + '">' +
          '<i class="bi ' + info.icone + '"></i> ' + info.titre + '</button>';
      }).join('') +
    '</div>';
  zone.querySelectorAll('[data-comprendre-le-cadre-suggestion]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreOuvrirRayon(this.dataset.comprendreLeCadreSuggestion);
    });
  });
  if (typeof trackEvenement === 'function') { trackEvenement('comprendre_le_cadre_orienteur_case_cochee', { nb: actifs.length }); }
}

function _comprendreLeCadreBrancherListeFiches() {
  document.querySelectorAll('[data-comprendre-le-cadre-ouvrir-fiche]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreEtat.ecran = 'fiche';
      _comprendreLeCadreEtat.ficheId = this.dataset.comprendreLeCadreOuvrirFiche;
      pageComprendreLeCadre();
    });
  });
  var btnStructures = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]');
  if (btnStructures) {
    btnStructures.addEventListener('click', function () {
      _comprendreLeCadreOuvrirStructures(_comprendreLeCadreEtat.rayon);
    });
  }
}

// Ouvre l'écran "Près de chez moi" d'un rayon déjà ouvert - même
// principe de chargement immédiat + écran d'erreur simple que
// _comprendreLeCadreOuvrirRayon() ci-dessous, le retour ramène toujours
// à la liste des fiches du rayon, jamais à l'accueil.
// Affiche un état transitoire (chargement ou erreur) AVANT que
// _comprendreLeCadreEtat.ecran ne pointe vers un écran réel de la façade
// (pageComprendreLeCadre()) - ces quelques instants ne doivent pourtant
// jamais priver la personne de l'en-tête (« Revoir la présentation », fil
// d'Ariane) ni du pied fixe (« Retour » / « Accueil », toujours visible) :
// même enveloppe que la façade, jamais un deuxième gabarit à maintenir en
// double. `onRetour` = même callback que celui passé d'ordinaire à
// _comprendreLeCadreBrancherRetour(). `ecranPrecedent` = le nom d'écran
// que ce même clic doit rejoindre ('accueil' ou 'rayon') : PENDANT ce
// moment transitoire, _comprendreLeCadreEtat.ecran vaut toujours encore
// 'accueil' (le fetch n'a pas fini), donc le bouton générique de la
// barre fixe (_comprendreLeCadreAllerVersPrecedent(), qui LIT cet état)
// se tromperait et sortirait vers la présentation - bug remonté par
// Denis 2026-09-05 depuis l'écran d'erreur d'un rayon. On construit donc
// ici un pied fixe dédié, dont le clic vise directement la bonne cible,
// au lieu de dépendre d'un état pas encore à jour.
function _comprendreLeCadreAfficherTransitoire(corpsHTML, onRetour, ecranPrecedent) {
  var piedFixe = (typeof barreNavigation === 'function')
    ? '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, {
        onclickPrecedent: "_comprendreLeCadreEtat.ecran='" + ecranPrecedent + "';pageComprendreLeCadre();"
      }) + '</div>'
    : '';
  app.innerHTML = '<div class="page-catalogue-contenu">' + _comprendreLeCadreRenduEnTete() + corpsHTML + '</div>' + piedFixe;
  _comprendreLeCadreBrancherRetour(onRetour);
  var btnRevoir = document.getElementById('btnComprendreLeCadreRevoirIntro');
  if (btnRevoir) { btnRevoir.addEventListener('click', _comprendreLeCadreRevoirPresentation); }
}

// "Près de chez moi" est le SEUL écran du module qui dépend vraiment du
// département (les fiches, elles, restent nationales) : c'est ici, et
// seulement ici, qu'on le demande si inconnu (retour Denis, 2026-09-05)
// - jamais un gel de tout le module, qui pénaliserait inutilement la
// lecture des fiches nationales. Même patron que ouvrirRenvoiAnnuaire()
// (js/app.js) : demanderDepartementSiInconnu() ne fait rien si déjà
// connu, sinon ouvre la fenêtre canonique et n'appelle la suite qu'une
// fois choisi.
function _comprendreLeCadreOuvrirStructures(id) {
  var onRetourStructures = function () { _comprendreLeCadreEtat.ecran = 'rayon'; pageComprendreLeCadre(); };
  function ouvrir() {
    _comprendreLeCadreAfficherTransitoire(
      _comprendreLeCadreRenduBoutonRetour('Retour au rayon') + '<p class="text-muted">Chargement...</p>', onRetourStructures, 'rayon');
    _comprendreLeCadreChargerStructuresRayon(id, function (structures) {
      _comprendreLeCadreEtat.ecran = 'structures';
      _comprendreLeCadreEtat.structures = structures;
      pageComprendreLeCadre();
    }, function () {
      _comprendreLeCadreAfficherTransitoire(_comprendreLeCadreRenduErreurChargement('Retour au rayon'), onRetourStructures, 'rayon');
    });
  }
  if (typeof demanderDepartementSiInconnu === 'function') { demanderDepartementSiInconnu(ouvrir); } else { ouvrir(); }
}

// Ouvre un rayon : affiche un état de chargement immédiat (jamais un
// écran figé pendant le fetch), puis bascule vers la liste de ses
// fiches une fois chargées, ou vers un écran d'erreur simple en cas
// d'échec réseau - jamais une exception qui remonte jusqu'à la console
// sans explication côté personne.
function _comprendreLeCadreOuvrirRayon(id) {
  if (typeof trackEvenement === 'function') { trackEvenement('comprendre_le_cadre_rayon_ouvert', { rayon: id }); }
  var onRetourRayon = function () { _comprendreLeCadreEtat.ecran = 'accueil'; pageComprendreLeCadre(); };
  _comprendreLeCadreAfficherTransitoire(
    _comprendreLeCadreRenduBoutonRetour('Tous les rayons') + '<p class="text-muted">Chargement...</p>', onRetourRayon, 'accueil');
  _comprendreLeCadreChargerRayon(id, function (fiches) {
    _comprendreLeCadreEtat.ecran = 'rayon';
    _comprendreLeCadreEtat.rayon = id;
    _comprendreLeCadreEtat.fiches = fiches;
    pageComprendreLeCadre();
  }, function () {
    _comprendreLeCadreAfficherTransitoire(_comprendreLeCadreRenduErreurChargement(), onRetourRayon, 'accueil');
  });
}

// TACHE (liens bidirectionnels, item 14 de TACHES_VALIDEES.md, decide par
// Denis le 2026-09-13) : point d'entree public pour arriver directement
// sur UNE fiche depuis un autre module (Lexique -> Cadre), sans passer
// par l'ecran "tous les rayons". Meme chargement paresseux que
// _comprendreLeCadreOuvrirRayon() (un seul rayon charge, pas les 17) ;
// le "Retour" interne de la fiche ramene ensuite normalement a la liste
// du rayon (_comprendreLeCadreAllerVersPrecedent, cas 'fiche' -> 'rayon'),
// le bouton "Revenir a..." (definirRetourModuleExterne) reste le chemin
// pour repartir vers le module d'origine. Meme signature que
// lexiqueOuvrirFiche() (modules/lexique/index.js).
function comprendreLeCadreOuvrirFiche(rayon, ficheId, provenanceLabel, provenanceRoute, provenanceRetour) {
  naviguerVers('comprendre-le-cadre');
  var onRetourRayon = function () { _comprendreLeCadreEtat.ecran = 'accueil'; pageComprendreLeCadre(); };
  _comprendreLeCadreAfficherTransitoire(
    _comprendreLeCadreRenduBoutonRetour('Tous les rayons') + '<p class="text-muted">Chargement...</p>', onRetourRayon, 'accueil');
  _comprendreLeCadreChargerRayon(rayon, function (fiches) {
    _comprendreLeCadreEtat.ecran = 'fiche';
    _comprendreLeCadreEtat.rayon = rayon;
    _comprendreLeCadreEtat.fiches = fiches;
    _comprendreLeCadreEtat.ficheId = ficheId;
    pageComprendreLeCadre();
    if (provenanceLabel && typeof definirRetourModuleExterne === 'function') {
      definirRetourModuleExterne(provenanceLabel, provenanceRetour, provenanceRoute, 'comprendre-le-cadre');
    }
  }, function () {
    _comprendreLeCadreAfficherTransitoire(_comprendreLeCadreRenduErreurChargement(), onRetourRayon, 'accueil');
  });
}

// Bascule le trimestre affiché sans nouveau fetch (tous les digests
// candidats sont déjà en mémoire, _comprendreLeCadreEtat.digests) - même
// principe que _comprendreLeCadreOrienteurMettreAJour(), un ré-rendu
// complet de l'écran plutôt qu'une mise à jour ciblée, ce qui reste bon
// marché pour un contenu de cette taille.
function _comprendreLeCadreBrancherDigest() {
  document.querySelectorAll('[data-comprendre-le-cadre-digest-index]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLeCadreEtat.digestIndex = parseInt(this.dataset.comprendreLeCadreDigestIndex, 10);
      pageComprendreLeCadre();
    });
  });
}

// Ouvre un outil « digest » (Balayage ou Chiffres, étape 6) : `dossier`
// est à la fois le sous-dossier de contenu et la valeur d'écran (voir
// COMPRENDRE_LE_CADRE_OUTILS) - même état de chargement immédiat et même
// tolérance à l'échec que _comprendreLeCadreOuvrirRayon(), mais un
// message différent quand la vraie raison est « rien publié pour
// l'instant » plutôt qu'un incident réseau (voir
// _comprendreLeCadreRenduDigestAbsent()).
function _comprendreLeCadreOuvrirDigest(dossier) {
  var onRetourDigest = function () { _comprendreLeCadreEtat.ecran = 'accueil'; pageComprendreLeCadre(); };
  _comprendreLeCadreAfficherTransitoire(
    _comprendreLeCadreRenduBoutonRetour('Tous les rayons') + '<p class="text-muted">Chargement...</p>', onRetourDigest, 'accueil');
  _comprendreLeCadreChargerDigests(dossier, function (digests) {
    _comprendreLeCadreEtat.ecran = dossier;
    _comprendreLeCadreEtat.digests = digests;
    _comprendreLeCadreEtat.digestIndex = 0;
    pageComprendreLeCadre();
  }, function () {
    _comprendreLeCadreAfficherTransitoire(_comprendreLeCadreRenduDigestAbsent(), onRetourDigest, 'accueil');
  });
}

// ============================================================
// FAÇADE
// ============================================================

// Point d'entrée unique, appelé par la table `routes` de js/app.js sur
// la clé 'comprendre-le-cadre' (voir ARCHITECTURE_TECHNIQUE.md, "Points
// de contact"). Dessine l'écran courant selon l'état interne de
// navigation - jamais une route par écran (même patron que
// pageComparerPistes()).
function pageComprendreLeCadre() {
  // De retour dans le module : le détour vers la présentation, s'il y en
  // avait un, est terminé.
  _comprendreLeCadreDetourPresentation = false;
  var corpsHTML, brancherCorps, evenement, evenementDonnees;
  var outilCourant = COMPRENDRE_LE_CADRE_OUTILS.filter(function (o) { return o.dossier === _comprendreLeCadreEtat.ecran; })[0];

  if (_comprendreLeCadreEtat.ecran === 'rayon') {
    corpsHTML = _comprendreLeCadreRenduListeFiches(_comprendreLeCadreEtat.rayon, _comprendreLeCadreEtat.fiches);
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherListeFiches();
    };
    evenement = 'comprendre_le_cadre_rayon_affiche'; evenementDonnees = { rayon: _comprendreLeCadreEtat.rayon };
  } else if (_comprendreLeCadreEtat.ecran === 'fiche') {
    var fiche = (_comprendreLeCadreEtat.fiches || []).filter(function (f) { return f.id === _comprendreLeCadreEtat.ficheId; })[0];
    if (!fiche) { _comprendreLeCadreEtat.ecran = 'rayon'; pageComprendreLeCadre(); return; }
    corpsHTML = _comprendreLeCadreRenduFiche(fiche);
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      // TACHE (audit croise Lexique/Cadre/Chiffres, 2026-09-12) : autant de
      // boutons "Pour aller plus loin" que de fiches liees en frontmatter
      // (voir_aussi_lexique) -- generalise depuis la demo validee par Denis
      // sur emploi-csp -> Lexique "csp".
      document.querySelectorAll('[data-voir-aussi-lexique]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idLexique = this.dataset.voirAussiLexique;
          var ecranActuel = _comprendreLeCadreEtat.ecran;
          var ficheActuelle = _comprendreLeCadreEtat.ficheId;
          // TACHE (retour Denis 2026-09-12 : "les deux boutons font la meme
          // chose") : le "Retour" local de la fiche Lexique (1er argument)
          // n'est PLUS ce chemin -- laisse a null, il garde son
          // comportement habituel (retour a la recherche du Lexique). Seul
          // le bouton qui colle (5e argument, provenanceRetour) ramene ici.
          lexiqueOuvrirFiche(idLexique, null, 'Comprendre le cadre', 'comprendre-le-cadre', function () {
            _comprendreLeCadreEtat.ecran = ecranActuel;
            _comprendreLeCadreEtat.ficheId = ficheActuelle;
            naviguerVers('comprendre-le-cadre');
          });
        });
      });
      // TACHE (extension Comprendre les chiffres, 2026-09-12) : meme
      // principe que le lien Lexique ci-dessus, mais vers l'accueil de
      // Comprendre les chiffres (pas de fiche individuelle adressable
      // dans ce module).
      var btnVoirAussiChiffres = document.querySelector('[data-voir-aussi-chiffres]');
      if (btnVoirAussiChiffres) {
        btnVoirAussiChiffres.addEventListener('click', function () {
          var ecranActuel = _comprendreLeCadreEtat.ecran;
          var ficheActuelle = _comprendreLeCadreEtat.ficheId;
          naviguerVers('comprendre-les-chiffres');
          if (typeof definirRetourModuleExterne === 'function') {
            definirRetourModuleExterne('Comprendre le cadre', function () {
              _comprendreLeCadreEtat.ecran = ecranActuel;
              _comprendreLeCadreEtat.ficheId = ficheActuelle;
              naviguerVers('comprendre-le-cadre');
            }, 'comprendre-le-cadre', 'comprendre-les-chiffres');
          }
        });
      }
    };
    evenement = 'comprendre_le_cadre_fiche_affichee'; evenementDonnees = { fiche: fiche.id };
  } else if (_comprendreLeCadreEtat.ecran === 'orienteur') {
    corpsHTML = _comprendreLeCadreRenduOrienteur();
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherOrienteur();
    };
    evenement = 'comprendre_le_cadre_orienteur_affiche';
  } else if (_comprendreLeCadreEtat.ecran === 'recherche-prompt1') {
    corpsHTML = _comprendreLeCadreRenduRecherchePrompt1();
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherRecherchePrompt1();
    };
    evenement = 'comprendre_le_cadre_recherche_prompt1_affiche';
  } else if (_comprendreLeCadreEtat.ecran === 'recherche-sujets') {
    corpsHTML = _comprendreLeCadreRenduRechercheSujets();
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherRechercheSujets();
    };
    evenement = 'comprendre_le_cadre_recherche_sujets_affiche';
    evenementDonnees = { sujets: (_comprendreLeCadreRecherche && _comprendreLeCadreRecherche.sujets.length) || 0 };
  } else if (_comprendreLeCadreEtat.ecran === 'recherche-questions') {
    corpsHTML = _comprendreLeCadreRenduRechercheQuestions();
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherRechercheQuestions();
    };
    evenement = 'comprendre_le_cadre_recherche_questions_affiche';
  } else if (_comprendreLeCadreEtat.ecran === 'recherche-prompt2') {
    corpsHTML = _comprendreLeCadreRenduRecherchePrompt2();
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherRecherchePrompt2();
    };
    evenement = 'comprendre_le_cadre_recherche_prompt2_texte_affiche';
  } else if (_comprendreLeCadreEtat.ecran === 'recherche-resultat') {
    corpsHTML = _comprendreLeCadreRenduRechercheResultat();
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherRechercheResultat();
    };
    evenement = 'comprendre_le_cadre_recherche_resultat_vu';
  } else if (_comprendreLeCadreEtat.ecran === 'structures') {
    corpsHTML = _comprendreLeCadreRenduStructures(_comprendreLeCadreEtat.rayon, _comprendreLeCadreEtat.structures);
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      var lienAnnuaire = document.querySelector('[data-comprendre-le-cadre-annuaire]');
      if (lienAnnuaire && typeof ouvrirRenvoiAnnuaire === 'function') {
        lienAnnuaire.addEventListener('click', function (e) { e.preventDefault(); ouvrirRenvoiAnnuaire(); });
      }
    };
    evenement = 'comprendre_le_cadre_structures_affichees'; evenementDonnees = { rayon: _comprendreLeCadreEtat.rayon };
  } else if (outilCourant) {
    corpsHTML = _comprendreLeCadreRenduDigest(outilCourant, _comprendreLeCadreEtat.digests, _comprendreLeCadreEtat.digestIndex);
    brancherCorps = function () {
      _comprendreLeCadreBrancherRetour(_comprendreLeCadreAllerVersPrecedent);
      _comprendreLeCadreBrancherDigest();
    };
    evenement = 'comprendre_le_cadre_digest_affiche'; evenementDonnees = { outil: outilCourant.dossier };
  } else if (!_comprendreLeCadreTerritoireConnu()) {
    // Porte : aucun territoire connu -> on ne rend PAS l'accueil, mais
    // l'écran de choix bloquant (décision Denis 2026-09-05).
    corpsHTML = _comprendreLeCadreRenduChoixTerritoire();
    brancherCorps = _comprendreLeCadreBrancherChoixTerritoire;
    evenement = 'comprendre_le_cadre_territoire_demande';
  } else {
    if (_comprendreLeCadreAccueilExtraEtat === 'inactif') { _comprendreLeCadreChargerAccueilExtra(); }
    corpsHTML = _comprendreLeCadreRenduAccueil();
    brancherCorps = _comprendreLeCadreBrancherAccueil;
    evenement = 'comprendre_le_cadre_accueil_affiche';
  }

  // En-tête (bouton « Revoir la présentation » + fil d'Ariane) et pied
  // (barre-navigation-fixe, « Retour » vers la présentation) communs à
  // tous les écrans - jamais recopiés dans chaque _comprendreLeCadreRendu*(),
  // un seul endroit à faire évoluer. Le corps est enveloppé dans
  // .page-catalogue-contenu (css/style.css) : c'est lui qui réserve le
  // padding-bas pour que la barre fixe ne recouvre jamais les dernières
  // cartes (retour Denis 2026-09-05) - même enveloppe que Carnet/Lexique.
  app.innerHTML = '<div class="page-catalogue-contenu">' + _comprendreLeCadreRenduEnTete() + corpsHTML + '</div>' + _comprendreLeCadreRenduPiedFixe();
  brancherCorps();
  var btnRevoir = document.getElementById('btnComprendreLeCadreRevoirIntro');
  if (btnRevoir) { btnRevoir.addEventListener('click', _comprendreLeCadreRevoirPresentation); }
  if (typeof trackEvenement === 'function') { trackEvenement(evenement, evenementDonnees); }
}

// Vrai dès qu'un territoire est enregistré quelque part dans
// l'application (pas seulement via ce module) : la brique partagée
// departementRessourcesMemorise() (js/app.js).
function _comprendreLeCadreTerritoireConnu() {
  return typeof departementRessourcesMemorise === 'function' && !!departementRessourcesMemorise();
}

function _comprendreLeCadreBrancherChoixTerritoire() {
  if (typeof demanderDepartementSiInconnu !== 'function') { return; }
  var declencher = function () {
    demanderDepartementSiInconnu(function () { pageComprendreLeCadre(); });
  };
  var btn = document.querySelector('[data-comprendre-le-cadre-choisir-territoire]');
  if (btn) { btn.addEventListener('click', declencher); }
  // L'aperçu verrouillé sous l'encart : un clic ou une touche Entrée /
  // Espace n'importe où dedans rouvre la fenêtre de choix du territoire
  // (décision Denis 2026-09-09 : "dès que je l'ai choisi, tout ça se
  // débloque"). Le contenu interne est `inert`, donc c'est bien le
  // conteneur qui reçoit l'événement.
  var apercu = document.querySelector('[data-comprendre-le-cadre-apercu]');
  if (apercu) {
    apercu.addEventListener('click', declencher);
    apercu.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        declencher();
      }
    });
  }
}

// Aucune autre fonction publique tant qu'aucun appelant réel n'existe,
// même règle que Carnet, Repères et Regard extérieur.
window.pageComprendreLeCadre = pageComprendreLeCadre;

// Export CommonJS protege -- tests/comprendreLeCadreLogique.test.js (Node),
// aucun effet sur le chargement navigateur classique (balise <script>,
// ou `module` n'est jamais defini).
if (typeof module !== 'undefined') {
  module.exports = {
    _comprendreLeCadreParserFiche: _comprendreLeCadreParserFiche,
    _comprendreLeCadreParserLiensVerifies: _comprendreLeCadreParserLiensVerifies,
    _comprendreLeCadreParserLigneStructure: _comprendreLeCadreParserLigneStructure,
    _comprendreLeCadreDateFr: _comprendreLeCadreDateFr
  };
}
