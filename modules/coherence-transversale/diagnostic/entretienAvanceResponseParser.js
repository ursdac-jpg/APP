/* ============================================================
   modules/coherence-transversale/diagnostic/entretienAvanceResponseParser.js
   ------------------------------------------------------------
   Interprete le texte colle par l'utilisateur (reponse du 2e prompt) en
   { synthese, pointsForts, axesAmelioration, recommandations, parQuestion, anomalies }.
   Meme discipline TOLERANTE que diagnostic/responseParser.js : une
   entree malformee de parQuestion est ECARTEE et consignee en anomalie,
   jamais un throw qui jetterait toute une reponse par ailleurs
   exploitable. Seule l'absence totale de JSON ou de `synthese` est une
   erreur reelle (ReponseIllisible / ReponseIncomplete).

   `recommandations` ici est une simple liste de textes (pas l'objet
   Recommandation du 1er prompt) -- DECISION DE DENIS, 2026-08-25 : ces
   recommandations ne sont jamais actionnables dans l'application, juste
   consultables/imprimables.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilEARP = require('../modeles/utilitaires.js');
  var ctCreerErreurMetier = _ctUtilEARP.ctCreerErreurMetier;
}

function ctListeDeChainesEA(valeur) {
  if (!Array.isArray(valeur)) { return []; }
  return valeur.filter(function (v) { return typeof v === 'string' && v.trim().length > 0; });
}

function ctReconstruireEntreeParQuestion(brut, index) {
  if (!brut || typeof brut !== 'object') {
    return { entree: null, anomalie: { chemin: 'parQuestion[' + index + ']', detail: 'Entrée absente ou non-objet.' } };
  }
  var question = typeof brut.question === 'string' ? brut.question.trim() : '';
  if (!question) {
    return { entree: null, anomalie: { chemin: 'parQuestion[' + index + '].question', detail: 'question manquante.' } };
  }
  return {
    entree: {
      question: question,
      resumeReponse: typeof brut.resumeReponse === 'string' ? brut.resumeReponse.trim() : '',
      attentesEmployeur: typeof brut.attentesEmployeur === 'string' ? brut.attentesEmployeur.trim() : ''
    },
    anomalie: null
  };
}

// dependances : { extraireJSON } -- injectable, defaut = extraireBlocJSONDepuisTexte (js/app.js).
function ctParserReponseEntretienAvance(texteColle, dependances) {
  dependances = dependances || {};
  var extraireJSON = dependances.extraireJSON || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null);

  if (typeof extraireJSON !== 'function') {
    throw ctCreerErreurMetier('ReponseIllisible', 'Aucune fonction d\'extraction JSON disponible (ni injectée, ni globale).');
  }

  var extraction = extraireJSON(texteColle);
  if (!extraction) {
    throw ctCreerErreurMetier('ReponseIllisible', 'Aucun bloc JSON identifiable dans le texte collé.');
  }
  if (typeof extraction.synthese !== 'string' || !extraction.synthese.trim()) {
    throw ctCreerErreurMetier('ReponseIncomplete', 'synthese absente ou invalide : rien d\'exploitable à présenter à la personne.', { synthese: extraction.synthese });
  }

  var anomalies = [];
  var parQuestion = [];
  (Array.isArray(extraction.parQuestion) ? extraction.parQuestion : []).forEach(function (brut, index) {
    var reconstruction = ctReconstruireEntreeParQuestion(brut, index);
    if (reconstruction.entree) { parQuestion.push(reconstruction.entree); }
    if (reconstruction.anomalie) { anomalies.push(reconstruction.anomalie); }
  });

  return {
    synthese: extraction.synthese.trim(),
    pointsForts: ctListeDeChainesEA(extraction.pointsForts),
    axesAmelioration: ctListeDeChainesEA(extraction.axesAmelioration),
    recommandations: ctListeDeChainesEA(extraction.recommandations),
    parQuestion: parQuestion,
    anomalies: anomalies
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctReconstruireEntreeParQuestion: ctReconstruireEntreeParQuestion,
    ctParserReponseEntretienAvance: ctParserReponseEntretienAvance
  };
}
