/* ============================================================
   modules/coherence-transversale/modeles/recommandation.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Recommandation
   (CONTRATS.md, section 1). Capacite absente du Bilan aujourd'hui :
   documentCible peut valoir 'lettre'/'entretien'/'plusieurs', pas
   seulement le CV (destinationRegistry.js du Bilan ne route que vers le
   CV) -- besoin reel de ce chantier, pas une anticipation.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilReco = require('./utilitaires.js');
  var ctGenererId = _ctUtilReco.ctGenererId;
  var ctCreerErreurMetier = _ctUtilReco.ctCreerErreurMetier;
}

var CT_DOCUMENTS_CIBLES = ['cv', 'lettre', 'entretien', 'plusieurs'];
var CT_MODES_APPLICATION = ['remplacement', 'ajout', 'conseil'];

function ctGenererIdRecommandation(index) {
  return 'reco-' + (typeof index === 'number' ? index : ctGenererId('auto'));
}

function ctCreerRecommandation(donnees, index) {
  donnees = donnees || {};
  return {
    id: donnees.id || ctGenererIdRecommandation(index),
    constatsLies: donnees.constatsLies || [],
    contenu: donnees.contenu || '',
    documentCible: donnees.documentCible || null,
    modeApplication: donnees.modeApplication || null,
    texteAncre: donnees.texteAncre || null,
    textePropose: donnees.textePropose || null
  };
}

function ctRecommandationEstValide(reco) {
  if (!reco || !reco.id || !reco.contenu) { return false; }
  if (!Array.isArray(reco.constatsLies) || reco.constatsLies.length === 0) { return false; }
  if (CT_DOCUMENTS_CIBLES.indexOf(reco.documentCible) === -1) { return false; }
  if (CT_MODES_APPLICATION.indexOf(reco.modeApplication) === -1) { return false; }
  if (reco.modeApplication === 'remplacement' && !reco.texteAncre) { return false; }
  return true;
}

function ctValiderRecommandation(reco) {
  if (!ctRecommandationEstValide(reco)) {
    throw ctCreerErreurMetier('ReponseIncomplete', 'Recommandation mal formee (constatsLies, documentCible ou modeApplication manquant/invalide).', { recommandation: reco });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    CT_DOCUMENTS_CIBLES: CT_DOCUMENTS_CIBLES,
    CT_MODES_APPLICATION: CT_MODES_APPLICATION,
    ctGenererIdRecommandation: ctGenererIdRecommandation,
    ctCreerRecommandation: ctCreerRecommandation,
    ctRecommandationEstValide: ctRecommandationEstValide,
    ctValiderRecommandation: ctValiderRecommandation
  };
}
