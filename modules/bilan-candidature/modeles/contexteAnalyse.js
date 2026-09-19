/* ============================================================
   modules/bilan-candidature/modeles/contexteAnalyse.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de ContexteAnalyse
   (CONTRATS.md, section 1) : regroupe niveau + donnees manquantes +
   observations factuelles en un seul objet, transmis tel quel d'un
   composant a l'autre.

   IMPORTANT : la coherence "niveau correspond reellement a la
   Candidature" est une regle croisee entre deux objets -- elle
   n'appartient pas a cette couche (validation mecanique uniquement),
   elle est garantie par analyse/niveauAnalyseDetector.js (couche
   analyse/, pas encore ecrite), seul habilite a produire un niveau.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanEnumsContexte = require('./enums.js');
  var bilanNiveauAnalyseEstValide = _bilanEnumsContexte.bilanNiveauAnalyseEstValide;
  var BILAN_ORIGINE_OBSERVATION = _bilanEnumsContexte.BILAN_ORIGINE_OBSERVATION;
  var _bilanUtilContexte = require('./utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilContexte.bilanCreerErreurMetier;
}

function bilanCreerContexteAnalyse(donnees) {
  donnees = donnees || {};
  return {
    candidatureId: donnees.candidatureId,
    niveau: donnees.niveau,
    donneesManquantes: donnees.donneesManquantes || [],
    observations: donnees.observations || []
  };
}

function bilanContexteAnalyseEstValide(contexteAnalyse) {
  if (!contexteAnalyse || !contexteAnalyse.candidatureId) { return false; }
  if (!bilanNiveauAnalyseEstValide(contexteAnalyse.niveau)) { return false; }
  var observations = contexteAnalyse.observations || [];
  for (var i = 0; i < observations.length; i += 1) {
    if (observations[i].origine !== 'factuelle') { return false; }
  }
  return true;
}

function bilanValiderContexteAnalyse(contexteAnalyse) {
  if (!bilanContexteAnalyseEstValide(contexteAnalyse)) {
    throw bilanCreerErreurMetier('NiveauIncoherent', 'ContexteAnalyse mal forme ou observations non factuelles.', { contexteAnalyse: contexteAnalyse });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerContexteAnalyse: bilanCreerContexteAnalyse,
    bilanContexteAnalyseEstValide: bilanContexteAnalyseEstValide,
    bilanValiderContexteAnalyse: bilanValiderContexteAnalyse
  };
}
