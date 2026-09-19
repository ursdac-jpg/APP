/* ============================================================
   modules/bilan-candidature/modeles/observation.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Observation
   (CONTRATS.md, section 1). Deux origines : 'factuelle' (calculee par
   analyse/faitsExtractor.js, id genere a ce moment-la) et 'argumentee'
   (produite par l’assistant dans le Prompt 1 -- qui ne fournit PAS d'id, limite
   connue et assumee du prompt fige). bilanGenererIdObservationArgumentee
   referme ce manque : diagnostic/diagnosticResponseParser.js (pas encore
   ecrit) l'appellera au moment du parsing, jamais l’assistant elle-meme.

   IMPORTANT (invariant 2, CONTRATS.md) : une Observation, une fois
   creee, n'est jamais modifiee. Aucune fonction de mutation ici, par
   construction -- seulement des fonctions de creation.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilObs = require('./utilitaires.js');
  var bilanGenererId = _bilanUtilObs.bilanGenererId;
  var bilanCreerErreurMetier = _bilanUtilObs.bilanCreerErreurMetier;
}

function bilanCreerObservationFactuelle(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || bilanGenererId('obsf'),
    origine: 'factuelle',
    contenu: donnees.contenu || '',
    categorie: donnees.categorie || null,
    axeLie: null,
    observationsFactuellesLiees: []
  };
}

// axeId : identifiant de l'axe (Axe.id) auquel appartient cette
// observation -- obligatoire pour une observation argumentee (CONTRATS.md).
// index : position de l'observation dans son axe (0, 1, 2...), utilisee
// pour generer un id deterministe et stable si aucun n'est fourni.
function bilanCreerObservationArgumentee(donnees, index) {
  donnees = donnees || {};
  var axeId = donnees.axeLie;
  return {
    id: donnees.id || bilanGenererIdObservationArgumentee(axeId, index),
    origine: 'argumentee',
    contenu: donnees.contenu || '',
    categorie: null,
    axeLie: axeId,
    observationsFactuellesLiees: donnees.observationsFactuellesLiees || []
  };
}

// Deterministe : meme axeId + meme index => meme id, a chaque parsing.
// Ne depend jamais d'un compteur global ni de l'heure -- c'est ce qui
// permet de re-parser la meme reponse de l’assistant sans generer un id different a
// chaque fois.
function bilanGenererIdObservationArgumentee(axeId, index) {
  return (axeId || 'axe-inconnu') + '-obs-' + (typeof index === 'number' ? index : 0);
}

function bilanObservationEstValide(observation) {
  if (!observation || !observation.id || !observation.contenu) { return false; }
  if (observation.origine !== 'factuelle' && observation.origine !== 'argumentee') { return false; }
  if (observation.origine === 'argumentee' && !observation.axeLie) { return false; }
  return true;
}

function bilanValiderObservation(observation) {
  if (!bilanObservationEstValide(observation)) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'Observation mal formee (id, contenu ou axeLie manquant).', { observation: observation });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerObservationFactuelle: bilanCreerObservationFactuelle,
    bilanCreerObservationArgumentee: bilanCreerObservationArgumentee,
    bilanGenererIdObservationArgumentee: bilanGenererIdObservationArgumentee,
    bilanObservationEstValide: bilanObservationEstValide,
    bilanValiderObservation: bilanValiderObservation
  };
}
