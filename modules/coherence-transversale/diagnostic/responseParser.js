/* ============================================================
   modules/coherence-transversale/diagnostic/responseParser.js
   ------------------------------------------------------------
   Interprete le texte colle par l'utilisateur (reponse du prompt) en
   { syntheseGenerale, constats: Constat[], recommandations: Recommandation[] }.
   Reutilise extraireBlocJSONDepuisTexte() (js/app.js, deja eprouvee en
   production) pour l'extraction JSON -- jamais une reimplementation.

   PARSER TOLERANT, JAMAIS TOUT-OU-RIEN (meme discipline que
   modules/bilan-candidature/diagnostic/diagnosticResponseParser.js) :
   un constat ou une recommandation mal forme est ECARTE et consigne en
   anomalie, jamais un throw qui jetterait toute une reponse par ailleurs
   exploitable. Seule l'absence totale de JSON ou de syntheseGenerale
   est une erreur reelle (ReponseIllisible / ReponseIncomplete).
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctConstatDRP = require('../modeles/constat.js');
  var ctCreerConstat = _ctConstatDRP.ctCreerConstat;
  var ctConstatEstValide = _ctConstatDRP.ctConstatEstValide;

  var _ctRecoDRP = require('../modeles/recommandation.js');
  var ctCreerRecommandation = _ctRecoDRP.ctCreerRecommandation;
  var ctRecommandationEstValide = _ctRecoDRP.ctRecommandationEstValide;

  var _ctUtilDRP = require('../modeles/utilitaires.js');
  var ctCreerErreurMetier = _ctUtilDRP.ctCreerErreurMetier;
}

function ctListeDeChaines(valeur) {
  if (!Array.isArray(valeur)) { return []; }
  return valeur.filter(function (v) { return typeof v === 'string' && v.trim().length > 0; });
}

// TACHE (couleur de la synthese, 2026-08-25, DECISION DE DENIS suite a un
// bug reel constate : fond rouge alors que le texte disait "coherent")
// -- demande EXPLICITEMENT a l'IA, jamais deduit par l'application a
// partir des constats (un premier essai heuristique cote application a
// produit exactement cette contradiction, un seul constat mineur suffisant
// a declencher le rouge malgre une synthese globalement positive). Meme
// source de verite que syntheseGenerale => jamais plus de contradiction
// possible entre le texte et la couleur. Valeur absente/invalide => null,
// l'ecran retombe alors sur un habillage neutre (jamais une couleur
// devinee).
var CT_NIVEAUX_VALIDES = ['coherent', 'incoherences_mineures', 'incoherences_majeures'];
function ctReconstruireNiveau(valeur) {
  return (typeof valeur === 'string' && CT_NIVEAUX_VALIDES.indexOf(valeur) !== -1) ? valeur : null;
}

// TACHE (synthese narrative globale, 2026-08-25, DECISION DE DENIS) :
// purement decorative cote parsing, comme parDocument -- absente/vide =>
// null, jamais une anomalie ni un blocage du reste du rapport (la
// rubrique "Synthese" reste alors simplement repliable sans contenu
// supplementaire, voir ui.js).
function ctReconstruireSyntheseNarrative(valeur) {
  return (typeof valeur === 'string' && valeur.trim()) ? valeur.trim() : null;
}

// TACHE (entretien avance, Pass A, 2026-08-25, DECISION DE DENIS) :
// questions courtes et LEGERES (pas une simulation d'entretien -- voir
// prompts/coherence-transversale.md), destinees a nourrir de contexte le
// futur module "entretien avance". Purement decoratif cote parsing, meme
// discipline que syntheseNarrative/parDocument : absent/vide => tableau
// vide, jamais une anomalie ni un blocage du reste du rapport.
function ctReconstruireQuestionsEntretien(valeur) {
  return ctListeDeChaines(valeur);
}

// TACHE (version courte de la lettre pour un email, 2026-08-25, DECISION
// DE DENIS) : purement decorative cote parsing, meme discipline que
// syntheseNarrative -- absente/vide => null, jamais une anomalie ni un
// blocage du reste du rapport.
function ctReconstruireLettreVersionCourte(valeur) {
  return (typeof valeur === 'string' && valeur.trim()) ? valeur.trim() : null;
}

// TACHE (tableau de bord "Votre candidature", 2026-08-25, DECISION DE
// DENIS) : titre (poste/metier retrouve dans CE document precis) +
// resume court (2 points forts/2 points faibles), demandes explicitement
// a l'IA plutot que devines par l'application -- jamais fiable a partir
// d'un texte libre non structure. PUREMENT DECORATIF cote parsing :
// absent/malforme => null, ne genere jamais d'anomalie ni ne bloque le
// reste du diagnostic (le rapport reste exploitable meme sans ca).
function ctReconstruireInfosDocument(brut) {
  if (!brut || typeof brut !== 'object') { return null; }
  var titre = typeof brut.titre === 'string' ? brut.titre.trim() : '';
  if (!titre) { return null; }
  return {
    titre: titre,
    pointsForts: ctListeDeChaines(brut.pointsForts),
    pointsFaibles: ctListeDeChaines(brut.pointsFaibles)
  };
}

function ctReconstruireParDocument(parDocumentBrut) {
  var brut = (parDocumentBrut && typeof parDocumentBrut === 'object') ? parDocumentBrut : {};
  return {
    cv: ctReconstruireInfosDocument(brut.cv),
    lettre: ctReconstruireInfosDocument(brut.lettre),
    entretien: ctReconstruireInfosDocument(brut.entretien)
  };
}

function ctReconstruireConstat(constatBrut, index) {
  if (!constatBrut || typeof constatBrut !== 'object') {
    return { constat: null, anomalie: { chemin: 'constats[' + index + ']', detail: 'Entrée absente ou non-objet.' } };
  }
  var constat = ctCreerConstat({
    ancrage: ctListeDeChaines(constatBrut.ancrage),
    nature: constatBrut.nature,
    dimension: typeof constatBrut.dimension === 'string' ? constatBrut.dimension : '',
    preuve: ctListeDeChaines(constatBrut.preuve),
    message: typeof constatBrut.message === 'string' ? constatBrut.message : '',
    confiance: (constatBrut.confiance === 'certaine' || constatBrut.confiance === 'deduite') ? constatBrut.confiance : null
  }, index);

  if (!ctConstatEstValide(constat)) {
    return { constat: null, anomalie: { chemin: 'constats[' + index + ']', detail: 'Constat reconstruit invalide (ancrage, preuve, nature ou message manquant/invalide).', valeurRecue: constatBrut } };
  }
  return { constat: constat, anomalie: null };
}

// constatsDejaReconstruits : necessaires pour resoudre recoBrute.constatsLies
// (des INDEX dans le tableau constats[] du JSON, jamais un texte ni un id
// invente par l'IA -- voir prompts/coherence-transversale.md, note finale).
function ctReconstruireRecommandation(recoBrute, index, constatsDejaReconstruits) {
  if (!recoBrute || typeof recoBrute !== 'object') {
    return { recommandation: null, anomalie: { chemin: 'recommandations[' + index + ']', detail: 'Entrée absente ou non-objet.' } };
  }
  if (!recoBrute.contenu) {
    return { recommandation: null, anomalie: { chemin: 'recommandations[' + index + '].contenu', detail: 'contenu manquant.' } };
  }

  var constatsLies = [];
  (Array.isArray(recoBrute.constatsLies) ? recoBrute.constatsLies : []).forEach(function (idxConstat) {
    if (typeof idxConstat === 'number' && constatsDejaReconstruits[idxConstat]) {
      constatsLies.push(constatsDejaReconstruits[idxConstat].id);
    }
  });
  if (constatsLies.length === 0) {
    return { recommandation: null, anomalie: { chemin: 'recommandations[' + index + '].constatsLies', detail: 'aucun constat lié résolu (invariant : jamais orpheline).', valeurRecue: recoBrute.constatsLies } };
  }

  var recommandation = ctCreerRecommandation({
    constatsLies: constatsLies,
    contenu: recoBrute.contenu,
    documentCible: recoBrute.documentCible,
    modeApplication: recoBrute.modeApplication,
    texteAncre: (typeof recoBrute.texteAncre === 'string' && recoBrute.texteAncre) || null,
    textePropose: (typeof recoBrute.textePropose === 'string' && recoBrute.textePropose) || null
  }, index);

  if (!ctRecommandationEstValide(recommandation)) {
    return { recommandation: null, anomalie: { chemin: 'recommandations[' + index + ']', detail: 'Recommandation reconstruite invalide (documentCible/modeApplication/texteAncre).', valeurRecue: recoBrute } };
  }
  return { recommandation: recommandation, anomalie: null };
}

// dependances : { extraireJSON } -- injectable, defaut = extraireBlocJSONDepuisTexte (js/app.js).
// Retourne { syntheseGenerale, constats, recommandations, anomalies }.
// Leve ReponseIllisible ou ReponseIncomplete uniquement si RIEN
// d'exploitable ne peut etre reconstruit.
function ctParserReponseDiagnostic(texteColle, dependances) {
  dependances = dependances || {};
  var extraireJSON = dependances.extraireJSON || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null);

  if (typeof extraireJSON !== 'function') {
    throw ctCreerErreurMetier('ReponseIllisible', 'Aucune fonction d\'extraction JSON disponible (ni injectée, ni globale).');
  }

  var extraction = extraireJSON(texteColle);
  if (!extraction) {
    throw ctCreerErreurMetier('ReponseIllisible', 'Aucun bloc JSON identifiable dans le texte collé.');
  }
  // TACHE (retour Denis, 2026-08-31, Chantier 4) : sortie de secours du prompt
  // quand les pieces fournies ne permettent aucune analyse de coherence
  // (documents vides ou illisibles). Erreur metier dediee -> l'appelant (ui.js)
  // affiche un ecran "les pieces ne sont pas exploitables, revenez au depot",
  // jamais un rapport de coherence vide bati sur rien.
  if (extraction.analyseImpossible === true) {
    throw ctCreerErreurMetier('SaisieInexploitable',
      (typeof extraction.message === 'string' && extraction.message.trim())
        ? extraction.message.trim()
        : 'Les pièces fournies ne permettent pas d\'analyser la cohérence de la candidature.',
      { analyseImpossible: true });
  }
  if (typeof extraction.syntheseGenerale !== 'string' || !extraction.syntheseGenerale.trim()) {
    throw ctCreerErreurMetier('ReponseIncomplete', 'syntheseGenerale absente ou invalide : rien d\'exploitable à présenter à la personne.', { syntheseGenerale: extraction.syntheseGenerale });
  }

  var anomalies = [];
  var constats = [];
  (Array.isArray(extraction.constats) ? extraction.constats : []).forEach(function (constatBrut, index) {
    var reconstruction = ctReconstruireConstat(constatBrut, index);
    if (reconstruction.constat) { constats.push(reconstruction.constat); }
    if (reconstruction.anomalie) { anomalies.push(reconstruction.anomalie); }
  });

  var recommandations = [];
  (Array.isArray(extraction.recommandations) ? extraction.recommandations : []).forEach(function (recoBrute, index) {
    var reconstruction = ctReconstruireRecommandation(recoBrute, index, constats);
    if (reconstruction.recommandation) { recommandations.push(reconstruction.recommandation); }
    if (reconstruction.anomalie) { anomalies.push(reconstruction.anomalie); }
  });

  return {
    syntheseGenerale: extraction.syntheseGenerale,
    niveau: ctReconstruireNiveau(extraction.niveau),
    syntheseNarrative: ctReconstruireSyntheseNarrative(extraction.syntheseNarrative),
    questionsEntretien: ctReconstruireQuestionsEntretien(extraction.questionsEntretien),
    lettreVersionCourte: ctReconstruireLettreVersionCourte(extraction.lettreVersionCourte),
    constats: constats,
    recommandations: recommandations,
    parDocument: ctReconstruireParDocument(extraction.parDocument),
    anomalies: anomalies
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctReconstruireConstat: ctReconstruireConstat,
    ctReconstruireRecommandation: ctReconstruireRecommandation,
    ctReconstruireSyntheseNarrative: ctReconstruireSyntheseNarrative,
    ctReconstruireQuestionsEntretien: ctReconstruireQuestionsEntretien,
    ctReconstruireLettreVersionCourte: ctReconstruireLettreVersionCourte,
    ctReconstruireInfosDocument: ctReconstruireInfosDocument,
    ctReconstruireParDocument: ctReconstruireParDocument,
    ctReconstruireNiveau: ctReconstruireNiveau,
    ctParserReponseDiagnostic: ctParserReponseDiagnostic
  };
}
