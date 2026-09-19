/* ============================================================
   modules/bilan-candidature/modeles/recommandation.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Recommandation
   (CONTRATS.md, section 1). Invariant 4 : jamais orpheline -- au moins
   un axe lie, au moins une observation liee. Verifie ici mecaniquement
   (compte des tableaux) ; la coherence de `priorite` avec la matrice de
   priorisation (poids x severite) reste une regle interpretative liee
   au contenu du diagnostic, hors du perimetre de cette couche.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanEnumsReco = require('./enums.js');
  var BILAN_PRIORITE_RECOMMANDATION = _bilanEnumsReco.BILAN_PRIORITE_RECOMMANDATION;
  var bilanEnumEstValide = _bilanEnumsReco.bilanEnumEstValide;
  var _bilanUtilReco = require('./utilitaires.js');
  var bilanGenererId = _bilanUtilReco.bilanGenererId;
  var bilanCreerErreurMetier = _bilanUtilReco.bilanCreerErreurMetier;
}

function bilanCreerRecommandation(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || bilanGenererId('reco'),
    contenu: donnees.contenu || '',
    dimensionsLiees: donnees.dimensionsLiees || [],
    priorite: donnees.priorite,
    extraitConcerne: donnees.extraitConcerne || null,
    observationsLiees: donnees.observationsLiees || [],
    // TACHE (Carte 3, ecran de preparation avant generation, 2026-08-28) :
    // phrase courte avec des trous "___" ou des chiffres renforceraient le
    // propos (recommandations impact/credibilite portant sur une experience).
    // Optionnelle, jamais un invariant -- reste null pour toutes les autres.
    phraseAChiffrer: donnees.phraseAChiffrer || null
  };
}

function bilanRecommandationEstValide(recommandation) {
  if (!recommandation || !recommandation.id || !recommandation.contenu) { return false; }
  if (!recommandation.dimensionsLiees || recommandation.dimensionsLiees.length === 0) { return false; }
  if (!recommandation.observationsLiees || recommandation.observationsLiees.length === 0) { return false; }
  if (!bilanEnumEstValide(BILAN_PRIORITE_RECOMMANDATION, recommandation.priorite)) { return false; }
  return true;
}

function bilanValiderRecommandation(recommandation) {
  if (!bilanRecommandationEstValide(recommandation)) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'Recommandation orpheline ou mal formee (dimension, observation ou priorite manquante).', { recommandation: recommandation });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerRecommandation: bilanCreerRecommandation,
    bilanRecommandationEstValide: bilanRecommandationEstValide,
    bilanValiderRecommandation: bilanValiderRecommandation
  };
}
