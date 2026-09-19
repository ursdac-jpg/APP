/* ============================================================
   modules/coherence-transversale/modeles/diagnostic.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Diagnostic
   (CONTRATS.md, section 1) : identite + statut + cycle de vie
   (genere -> complete/echec_parsing). Copie du meme motif que
   modules/bilan-candidature/modeles/diagnostic.js.

   Les transitions de statut retournent un NOUVEL objet, jamais une
   mutation de l'original.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilDiag = require('./utilitaires.js');
  var ctGenererId = _ctUtilDiag.ctGenererId;
  var ctCreerErreurMetier = _ctUtilDiag.ctCreerErreurMetier;
}

var CT_STATUTS_DIAGNOSTIC = ['genere', 'complete', 'echec_parsing'];

function ctCreerDiagnostic(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || ctGenererId('diag'),
    dossierId: donnees.dossierId,
    promptTexte: donnees.promptTexte || '',
    dateGeneration: donnees.dateGeneration,
    statut: 'genere',
    resultat: null,
    texteBrutReponseIA: null
  };
}

function _ctCopierDiagnostic(diagnostic) {
  return {
    id: diagnostic.id,
    dossierId: diagnostic.dossierId,
    promptTexte: diagnostic.promptTexte,
    dateGeneration: diagnostic.dateGeneration,
    statut: diagnostic.statut,
    resultat: diagnostic.resultat,
    texteBrutReponseIA: diagnostic.texteBrutReponseIA
  };
}

function ctMarquerDiagnosticComplet(diagnostic, resultat, texteBrutReponseIA) {
  var copie = _ctCopierDiagnostic(diagnostic);
  copie.statut = 'complete';
  copie.resultat = resultat;
  copie.texteBrutReponseIA = texteBrutReponseIA;
  return copie;
}

function ctMarquerDiagnosticEchecParsing(diagnostic, texteBrutReponseIA) {
  var copie = _ctCopierDiagnostic(diagnostic);
  copie.statut = 'echec_parsing';
  copie.resultat = null;
  copie.texteBrutReponseIA = texteBrutReponseIA;
  return copie;
}

function ctDiagnosticEstValide(diagnostic) {
  if (!diagnostic || !diagnostic.id || !diagnostic.dossierId) { return false; }
  if (CT_STATUTS_DIAGNOSTIC.indexOf(diagnostic.statut) === -1) { return false; }
  if (diagnostic.statut === 'complete' && !diagnostic.resultat) { return false; }
  if (diagnostic.statut === 'echec_parsing' && (!diagnostic.texteBrutReponseIA || diagnostic.resultat)) { return false; }
  return true;
}

function ctValiderDiagnostic(diagnostic) {
  if (!ctDiagnosticEstValide(diagnostic)) {
    throw ctCreerErreurMetier('ReponseIncomplete', 'Diagnostic dans un etat incoherent (statut/resultat/texteBrutReponseIA).', { diagnostic: diagnostic });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    CT_STATUTS_DIAGNOSTIC: CT_STATUTS_DIAGNOSTIC,
    ctCreerDiagnostic: ctCreerDiagnostic,
    ctMarquerDiagnosticComplet: ctMarquerDiagnosticComplet,
    ctMarquerDiagnosticEchecParsing: ctMarquerDiagnosticEchecParsing,
    ctDiagnosticEstValide: ctDiagnosticEstValide,
    ctValiderDiagnostic: ctValiderDiagnostic
  };
}
