/* ============================================================
   Module « Un CV, plusieurs métiers » : LOGIQUE PURE (aucun DOM).
   Chargé avant modules/un-cv-plusieurs-metiers/index.js. Testé par
   tests/unCvPlusieursMetiers.test.js (Node). Plan : docs/PLAN_IMPLEMENTATION_UN_CV_PLUSIEURS_METIERS_2026-10-08.md ;
   plan de la nuit : docs/PLAN_MODE_NUIT_UN_CV_PLUSIEURS_METIERS_2026-10-09.md.

   Règles propres à ce module (décisions de Denis) :
   - 10 métiers au plus, « Créer mes CV » dès 2 cases ET un objectif par case cochée ;
   - la barre d'étapes est SEULEMENT visuelle ;
   - le module n'importe RIEN de la recherche d'offres.
   ============================================================ */

// Interrupteur d'ouverture du module au public : tant qu'il est faux, la tuile et la recherche de l'accueil le cachent. Passé à vrai le 2026-10-10 : les sept pages
// fonctionnent de bout en bout (essais de parcours). Pour le refermer avant une mise en ligne, le remettre à false.
var UCPM_OUVERT = true;

// Les sept pages du module, dans l'ordre (barre d'étapes seulement visuelle). Icônes : des objets, jamais de visage.
var UCPM_ETAPES = [
  { label: 'Mon CV', icone: '&#128196;' },
  { label: 'Métiers', icone: '&#129517;' },
  { label: 'Référence', icone: '&#9999;&#65039;' },
  { label: 'Accroches', icone: '&#128172;' },
  { label: 'Mes CV', icone: '&#128450;&#65039;' },
  { label: 'Lettres', icone: '&#9993;&#65039;' },
  { label: 'Fin', icone: '&#9989;' }
];
var UCPM_NB_PAGES = 7;
var UCPM_MAX_METIERS = 10;
var UCPM_MIN_METIERS_POUR_CREER = 2;

// État de session du module (donnée pure, sérialisable telle quelle : c'est aussi ce qui part dans la disquette).
// Les champs des pages suivantes sont ajoutés par leurs lots, toujours avec une valeur de départ ici.
function ucpmEtatInitial() {
  return {
    version: 1,
    page: 1,             // page affichée (1 à 7)
    pageMax: 1,          // page la plus avancée atteinte (mémoire de la barre d'étapes)
    texteCV: '',         // texte du CV relu et masqué (page 1)
    cvNom: '',           // nom du fichier déposé (page 1)
    cvRelu: false,       // le CV a été relu et masqué (page 1)
    p1Vue: 'depot',      // page 1 : 'depot' (déposer, puis demander) ou 'passage' (choisir l'assistant, coller la réponse)
    passages: {},        // état des passages avec l'assistant, par clé (voir passageAssistant.js)
    reponseMetiers: null,// lecture de la réponse « métiers » (page 1)
    intitules: null,     // colonne de gauche de la page 2 (autres noms du même métier), construite à la première visite
    autres: null,        // colonne de droite de la page 2 (autres métiers)
    sexe: '',            // 'f', 'm' ou '' : connu seulement quand la personne a choisi son identité (page 3)
    refId: '',           // page 3 : identifiant de l'entrée qui sert de CV de référence
    p3Vue: 'choix',      // page 3 : 'choix', 'structurer', 'assistant' ou 'editeur'
    p3Extrait: false,    // le CV a été rangé en rubriques (étape d'analyse faite)
    refPret: false,      // l'éditeur de CV a été validé (« Ce CV me convient »)
    refTitre: '',        // titre du CV de référence au moment de la validation
    accroches: null,     // page 4 : { identifiant d'entrée : [deux accroches courtes] } reçues de l'assistant
    accrochesManquantes: [], // page 4 : entrées pour lesquelles l'assistant n'a rien proposé
    cvs: {},             // page 5 : par identifiant d'entrée { titre, accroche, accrocheChoisie, aspect : null ou réglages d'aspect propres à ce CV }
    retourEditeur: 0,    // page vers laquelle revenir en quittant l'éditeur du CV de référence (5 quand on l'a rouvert depuis « Mes CV »)
    aspectEnCours: null, // page 5 : identifiant du CV dont l'aspect est en cours de réglage (jamais conservé dans la disquette)
    p4Vue: 'passage',    // page 4 : 'passage' (choisir l'assistant, coller) ou 'recu'
    objectifsPortee: {},  // page 2 : dernier objectif appliqué pour « tous », « gauche », « droite » (affiché dans le panneau d'objectif)
    accrochesSig: {},    // page 4 : empreinte de ce qui a été envoyé pour chaque métier à la réception des accroches (page périmée si elle change)
    lettresSig: {},      // page 6 : idem pour chaque lettre reçue
    lettresIds: null,    // page 6 : identifiants des CV pour lesquels une lettre est demandée (null = tous les CV)
    lettres: null,       // page 6 : { identifiant d'entrée : texte de la lettre } (formule d'appel et signature comprises), modifiable par la personne
    lettresOrigine: {},  // page 6 : la lettre telle que reçue, pour « Remettre la lettre reçue »
    lettresManquantes: [], // page 6 : CV pour lesquels l'assistant n'a rendu aucune lettre
    lettreSel: '',       // page 6 : lettre affichée
    p6Vue: 'passage',    // page 6 : 'passage' (choisir les CV, l'assistant, coller) ou 'lecture'
    p7Telecharge: false, // page 7 : un document a été envoyé à l'impression (la recherche d'offres en direct apparaît alors)
    departementLibre: '' // département ou ville écrits à la main quand « ailleurs » est choisi (recherche d'offres)
  };
}

// Y a-t-il un travail engagé (de quoi proposer « Continuer / Recommencer ») ?
function ucpmAUnTravailEnCours(etat) {
  if (!etat || typeof etat !== 'object') { return false; }
  if ((etat.page || 1) > 1) { return true; }
  if (String(etat.texteCV || '').trim()) { return true; }
  if (etat.reponseMetiers) { return true; }
  return false;
}

// Borne un numéro de page dans 1..7 (jamais une exception, quoi qu'on passe).
function ucpmBornerPage(n) {
  var v = parseInt(n, 10);
  if (isNaN(v) || v < 1) { return 1; }
  if (v > UCPM_NB_PAGES) { return UCPM_NB_PAGES; }
  return v;
}

// Remet un état venant d'une sauvegarde (disquette) dans une forme sûre : champs manquants complétés, page bornée. Renvoie null si
// la donnée n'est pas un état exploitable.
function ucpmNormaliserEtat(brut) {
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) { return null; }
  var e = ucpmEtatInitial();
  Object.keys(brut).forEach(function (k) { e[k] = brut[k]; });
  e.version = 1;
  e.aspectEnCours = null;   // un réglage d'aspect interrompu (rechargement) n'est jamais repris : le vrai dossier est la seule référence
  e.page = ucpmBornerPage(e.page);
  e.pageMax = Math.max(e.page, ucpmBornerPage(e.pageMax));
  return e;
}

// Copie JSON de l'état pour la disquette (null s'il n'y a rien à garder).
function ucpmExporterEtat(etat) {
  if (!ucpmAUnTravailEnCours(etat)) { return null; }
  try { return JSON.parse(JSON.stringify(etat)); } catch (e) { return null; }
}

// ---------------- Lecture défensive de la réponse de l'assistant (JSON dans un bloc de code) ----------------
// Reprend la logique éprouvée de scripts/essai_prompts_ucpm.js (qui l'appelle désormais d'ici) : retire les balises de bloc de code, les
// barres obliques que la copie ajoute devant [ ] _ * #, prend du premier { ou [ au dernier } ou ], et reconnaît une réponse COUPÉE.
// Renvoie { json, echappes } ou { erreur, coupe }. Jamais d'exception.
function ucpmExtraireJson(texte) {
  var t = String(texte == null ? '' : texte).replace(/```json|```/g, '');
  var BARRE = String.fromCharCode(92);
  var echappes = 0;
  ['[', ']', '_', '*', '#'].forEach(function (c) {
    var motif = BARRE + c;
    while (t.indexOf(motif) >= 0) { t = t.replace(motif, c); echappes++; }
  });
  var debut = Infinity;
  ['[', '{'].forEach(function (c) { var i = t.indexOf(c); if (i >= 0 && i < debut) { debut = i; } });
  if (!isFinite(debut)) { return { erreur: 'aucun JSON trouvé dans la réponse', coupe: false }; }
  var fermant = t.charAt(debut) === '[' ? ']' : '}';
  var fin = t.lastIndexOf(fermant);
  var extrait = fin > debut ? t.slice(debut, fin + 1) : t.slice(debut);
  try { return { json: JSON.parse(extrait), echappes: echappes }; } catch (e1) { /* on tente le filet des guillemets typographiques */ }
  var droit = extrait.replace(/[\u201C\u201D\u201F\u2033]/g, '"');
  try { return { json: JSON.parse(droit), echappes: echappes }; } catch (e2) { /* réponse coupée ou invalide */ }
  var niveau = 0;
  var enChaine = false;
  var precedent = '';
  t.slice(debut).split('').forEach(function (c) {
    if (c === '"' && precedent !== BARRE) { enChaine = !enChaine; }
    if (!enChaine) {
      if (c === '[' || c === '{') { niveau++; }
      if (c === ']' || c === '}') { niveau--; }
    }
    precedent = c;
  });
  return { erreur: niveau > 0 ? 'la réponse semble coupée avant la fin' : 'la réponse n’est pas un JSON lisible', coupe: niveau > 0 };
}

// Texte d'affichage : aucun tiret long dans l'application (règle de Denis), espaces nettoyés.
function ucpmNettoyerTexte(valeur) {
  return String(valeur == null ? '' : valeur).replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
}
function _ucpmListeTextes(liste, max) {
  if (!Array.isArray(liste)) { return []; }
  var vus = {};
  var sortie = [];
  liste.forEach(function (x) {
    var t = ucpmNettoyerTexte(x);
    if (t && !vus[t.toLowerCase()]) { vus[t.toLowerCase()] = true; sortie.push(t); }
  });
  return typeof max === 'number' ? sortie.slice(0, max) : sortie;
}

var UCPM_MSG_REPONSE_ILLISIBLE = 'Cette réponse ne ressemble pas à ce que l’application attend. Redemandez-la à l’assistant, puis copiez-la avec son bouton « Copier ».';
var UCPM_MSG_REPONSE_COUPEE = 'La réponse de l’assistant semble coupée avant la fin. Redemandez-lui de la reprendre depuis le début, puis copiez-la en entier.';

// Lit la réponse du premier passage (prompts/ucpm-metiers.md, V5) : synthèse du CV, autres intitulés du même métier, autres métiers.
// Chaque intitulé existe sous deux formes (le sexe de la personne est inconnu à ce stade) ; si l'assistant n'en donne qu'une, on la reprend
// pour les deux (mieux vaut une forme que rien, la personne corrige). Au plus 6 intitulés et UCPM_MAX_METIERS autres métiers.
// Renvoie { succes, valeurs, erreur, coupe, echappes }.
function ucpmLireReponseMetiers(texte) {
  var brut = String(texte == null ? '' : texte);
  if (!brut.trim()) { return { succes: false, erreur: 'Aucun texte n’a été collé.', coupe: false }; }
  var r = ucpmExtraireJson(brut);
  if (r.erreur) { return { succes: false, coupe: !!r.coupe, erreur: r.coupe ? UCPM_MSG_REPONSE_COUPEE : UCPM_MSG_REPONSE_ILLISIBLE }; }
  var j = r.json;
  if (!j || typeof j !== 'object' || Array.isArray(j)) { return { succes: false, coupe: false, erreur: UCPM_MSG_REPONSE_ILLISIBLE }; }
  var s = j.synthese && typeof j.synthese === 'object' ? j.synthese : {};
  var experiences = (Array.isArray(s.experiences) ? s.experiences : []).map(function (e) {
    e = e || {};
    return {
      intitule: ucpmNettoyerTexte(e.intitule),
      missionsPrincipales: _ucpmListeTextes(e.missionsPrincipales),
      competencesRetirees: _ucpmListeTextes(e.competencesRetirees)
    };
  }).filter(function (e) { return e.intitule || e.missionsPrincipales.length; });
  var intitules = (Array.isArray(j.intitulesMemeMetier) ? j.intitulesMemeMetier : []).map(function (x) {
    x = x || {};
    var m = ucpmNettoyerTexte(x.intituleMasculin || x.intitule || x.intituleFeminin);
    var f = ucpmNettoyerTexte(x.intituleFeminin || x.intituleMasculin || x.intitule);
    return { masculin: m, feminin: f, retrouveDansLeCV: ucpmNettoyerTexte(Array.isArray(x.retrouveDansLeCV) ? x.retrouveDansLeCV.join(' ; ') : x.retrouveDansLeCV) };
  }).filter(function (x) { return x.masculin; }).slice(0, 6);
  var metiers = (Array.isArray(j.autresMetiers) ? j.autresMetiers : []).map(function (x) {
    x = x || {};
    var m = ucpmNettoyerTexte(x.metierMasculin || x.metier || x.metierFeminin);
    var f = ucpmNettoyerTexte(x.metierFeminin || x.metierMasculin || x.metier);
    return {
      masculin: m, feminin: f,
      retrouveDansLeCV: _ucpmListeTextes(Array.isArray(x.retrouveDansLeCV) ? x.retrouveDansLeCV : [x.retrouveDansLeCV], 2),
      aVerifier: ucpmNettoyerTexte(x.aVerifier)
    };
  }).filter(function (x) { return x.masculin; }).slice(0, UCPM_MAX_METIERS);
  var valeurs = {
    synthese: {
      metier: ucpmNettoyerTexte(s.metier),
      competencesCles: _ucpmListeTextes(s.competencesCles, 8),
      experiences: experiences
    },
    intitulesMemeMetier: intitules,
    autresMetiers: metiers
  };
  if (!valeurs.synthese.metier && !intitules.length && !metiers.length) {
    return { succes: false, coupe: false, erreur: 'La réponse est lisible, mais elle ne contient ni métier ni intitulé. Redemandez-la à l’assistant.' };
  }
  return { succes: true, valeurs: valeurs, echappes: r.echappes || 0 };
}

// Remplit le prompt des métiers (prompts/ucpm-metiers.md). Marqueurs : {INTITULE}, {OBJECTIFS}, {CV}. Au premier passage les objectifs ne sont pas
// encore choisis (ils se choisissent page 2) : valeur de repli explicite, texte NON TESTÉ (voir le plan de la nuit, lot L2).
var UCPM_OBJECTIFS_PAR_DEFAUT = 'Aucun objectif n’est encore précisé : propose des métiers variés qui valorisent les mêmes compétences (le même métier appelé autrement, des métiers voisins, d’autres secteurs), sans te concentrer sur un seul type de démarche.';
function ucpmConstruirePromptMetiers(template, valeurs) {
  var v = valeurs || {};
  var tables = {
    INTITULE: ucpmNettoyerTexte(v.intitule) || 'Non précisé : déduis-le du CV.',
    OBJECTIFS: String(v.objectifs || '').trim() || UCPM_OBJECTIFS_PAR_DEFAUT,
    CV: String(v.cv == null ? '' : v.cv).trim() || 'Non fourni'
  };
  return String(template == null ? '' : template).replace(/\{(INTITULE|OBJECTIFS|CV)\}/g, function (m, nom) { return tables[nom]; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UCPM_ETAPES: UCPM_ETAPES,
    UCPM_NB_PAGES: UCPM_NB_PAGES,
    UCPM_MAX_METIERS: UCPM_MAX_METIERS,
    UCPM_MIN_METIERS_POUR_CREER: UCPM_MIN_METIERS_POUR_CREER,
    ucpmEtatInitial: ucpmEtatInitial,
    ucpmAUnTravailEnCours: ucpmAUnTravailEnCours,
    ucpmBornerPage: ucpmBornerPage,
    ucpmNormaliserEtat: ucpmNormaliserEtat,
    ucpmExporterEtat: ucpmExporterEtat,
    ucpmExtraireJson: ucpmExtraireJson,
    ucpmNettoyerTexte: ucpmNettoyerTexte,
    ucpmLireReponseMetiers: ucpmLireReponseMetiers,
    UCPM_OBJECTIFS_PAR_DEFAUT: UCPM_OBJECTIFS_PAR_DEFAUT, UCPM_MSG_REPONSE_ILLISIBLE: UCPM_MSG_REPONSE_ILLISIBLE, UCPM_MSG_REPONSE_COUPEE: UCPM_MSG_REPONSE_COUPEE,
    ucpmConstruirePromptMetiers: ucpmConstruirePromptMetiers
  };
}
