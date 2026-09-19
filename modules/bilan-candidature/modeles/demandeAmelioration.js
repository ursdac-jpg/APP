/* ============================================================
   modules/bilan-candidature/modeles/demandeAmelioration.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de DemandeAmelioration
   (CONTRATS.md, section 1, "objet de support"). Fige (copie profonde) la
   recommandation selectionnee et ses observations resolues au moment de
   la creation -- invariant 9 : reste valide meme si le Diagnostic
   d'origine est regenere ensuite. diagnosticSourceId sert uniquement a
   la tracabilite, jamais relu pour reconstruire quoi que ce soit.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilDA = require('./utilitaires.js');
  var bilanGenererId = _bilanUtilDA.bilanGenererId;
  var bilanCreerErreurMetier = _bilanUtilDA.bilanCreerErreurMetier;
}

// Copie profonde volontairement simple (JSON.parse/stringify) : les
// objets manipules ici sont des donnees pures (chaines, tableaux,
// nombres), jamais de fonctions ni de dates autres que des chaines ISO --
// suffisant et sans dependance externe.
function _bilanCopieProfonde(valeur) {
  return valeur === null || valeur === undefined ? valeur : JSON.parse(JSON.stringify(valeur));
}

function bilanCreerDemandeAmelioration(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || bilanGenererId('dem'),
    diagnosticSourceId: donnees.diagnosticSourceId,
    recommandationSelectionnee: _bilanCopieProfonde(donnees.recommandationSelectionnee),
    observationsResolues: _bilanCopieProfonde(donnees.observationsResolues) || [],
    objectifs: donnees.objectifs || [],
    dateCreation: donnees.dateCreation
  };
}

function bilanDemandeAmeliorationEstValide(demande) {
  if (!demande || !demande.id || !demande.diagnosticSourceId) { return false; }
  if (!demande.recommandationSelectionnee || !demande.recommandationSelectionnee.id) { return false; }
  return true;
}

function bilanValiderDemandeAmelioration(demande) {
  if (!bilanDemandeAmeliorationEstValide(demande)) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'DemandeAmelioration sans recommandation valide.', { demande: demande });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerDemandeAmelioration: bilanCreerDemandeAmelioration,
    bilanDemandeAmeliorationEstValide: bilanDemandeAmeliorationEstValide,
    bilanValiderDemandeAmelioration: bilanValiderDemandeAmelioration
  };
}
