/* ============================================================
   modules/bilan-candidature/amelioration/titreAccrocheResponseParser.js
   ------------------------------------------------------------
   TACHE (chantier "titre et accroche du CV", 2026-08-25) : interprete le
   texte colle par l'utilisateur (reponse de prompts/bilan-titre-accroche.md)
   en { titre, accroches }. Reutilise extraireBlocJSONDepuisTexte()
   (js/app.js) -- meme fonction que tous les autres parseurs du module,
   jamais une 2e extraction JSON.

   Delibrement SANS lien a une DemandeAmelioration/PropositionAmelioration
   (voir titreAccrochePromptBuilder.js pour la meme raison) : ni titre ni
   accroche n'a d'id de recommandation a retrouver.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilTARP = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilTARP.bilanCreerErreurMetier;
}

function _bilanListeDeChainesTARP(valeur) {
  if (!Array.isArray(valeur)) { return []; }
  return valeur
    .filter(function (v) { return typeof v === 'string' && v.trim().length > 0; })
    .map(function (v) { return v.trim(); });
}

// dependances : { extraireJSON } -- injectable, defaut = extraireBlocJSONDepuisTexte (js/app.js).
// Retourne { titre, accroches }. Leve ReponseIllisible (aucun JSON) ou
// ReponseIncomplete (ni titre ni accroche exploitable -- rien a proposer).
// Un seul des deux presents (ex. titre sans accroches) reste un resultat
// valide : la personne n'a pas forcement les deux absents au depart (voir
// alerte structurelle, app.js -- une personne peut n'avoir qu'un titre
// manquant, ou qu'une accroche manquante).
function bilanParserReponseTitreAccroche(texteColle, dependances) {
  dependances = dependances || {};
  var extraireJSON = dependances.extraireJSON || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null);

  if (typeof extraireJSON !== 'function') {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucune fonction d\'extraction JSON disponible (ni injectée, ni globale).');
  }

  var extraction = extraireJSON(texteColle);
  if (!extraction) {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucun bloc JSON identifiable dans le texte collé.');
  }

  var titre = (typeof extraction.titre === 'string') ? extraction.titre.trim() : '';
  var accroches = _bilanListeDeChainesTARP(extraction.accroches);

  if (!titre && !accroches.length) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'Ni titre ni accroche exploitable dans le texte collé.', { extraction: extraction });
  }

  return { titre: titre, accroches: accroches };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanParserReponseTitreAccroche: bilanParserReponseTitreAccroche
  };
}
