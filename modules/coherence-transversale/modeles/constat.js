/* ============================================================
   modules/coherence-transversale/modeles/constat.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Constat
   (CONTRATS.md, section 1). Emprunte uniquement le PRINCIPE de
   l'Observation de la reflexion V4 (docs/ARCHITECTURE_COMPREHENSION_CV.md,
   gelee) -- jamais son architecture complete (pas de graphe de Relations,
   pas de moteur d'Observations). Voir garde-fou explicite : invariant 4
   de CONTRATS.md, aucun champ ajoute sans besoin reel.

   IMPORTANT (invariant 2, CONTRATS.md) : un Constat, une fois cree,
   n'est jamais modifie. Aucune fonction de mutation ici, par
   construction -- seulement des fonctions de creation.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilConstat = require('./utilitaires.js');
  var ctGenererId = _ctUtilConstat.ctGenererId;
  var ctCreerErreurMetier = _ctUtilConstat.ctCreerErreurMetier;
}

var CT_NATURES_CONSTAT = ['incoherence', 'absence', 'duplication', 'contradiction', 'alignement', 'force'];
var CT_NIVEAUX_CONFIANCE = ['certaine', 'deduite'];

// index : position du constat dans la reponse IA (0, 1, 2...), utilisee
// pour generer un id deterministe et stable si aucun n'est fourni --
// meme principe que bilanGenererIdObservationArgumentee (Bilan), pour
// pouvoir re-parser la meme reponse sans generer un id different.
function ctGenererIdConstat(index) {
  return 'constat-' + (typeof index === 'number' ? index : ctGenererId('auto'));
}

function ctCreerConstat(donnees, index) {
  donnees = donnees || {};
  return {
    id: donnees.id || ctGenererIdConstat(index),
    ancrage: donnees.ancrage || [],
    nature: donnees.nature || null,
    dimension: donnees.dimension || '',
    preuve: donnees.preuve || [],
    message: donnees.message || '',
    confiance: donnees.confiance || null
  };
}

function ctConstatEstValide(constat) {
  if (!constat || !constat.id || !constat.message) { return false; }
  if (!Array.isArray(constat.ancrage) || constat.ancrage.length === 0) { return false; }
  if (!Array.isArray(constat.preuve) || constat.preuve.length === 0) { return false; }
  if (CT_NATURES_CONSTAT.indexOf(constat.nature) === -1) { return false; }
  if (constat.confiance !== null && CT_NIVEAUX_CONFIANCE.indexOf(constat.confiance) === -1) { return false; }
  return true;
}

function ctValiderConstat(constat) {
  if (!ctConstatEstValide(constat)) {
    throw ctCreerErreurMetier('ReponseIncomplete', 'Constat mal forme (ancrage, preuve, nature ou message manquant/invalide).', { constat: constat });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    CT_NATURES_CONSTAT: CT_NATURES_CONSTAT,
    CT_NIVEAUX_CONFIANCE: CT_NIVEAUX_CONFIANCE,
    ctGenererIdConstat: ctGenererIdConstat,
    ctCreerConstat: ctCreerConstat,
    ctConstatEstValide: ctConstatEstValide,
    ctValiderConstat: ctValiderConstat
  };
}
