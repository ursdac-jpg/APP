/* ============================================================
   modules/bilan-candidature/modeles/diagnostic.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Diagnostic
   (CONTRATS.md, section 1) : porte l'identite, le statut et le cycle de
   vie (genere -> complete/echec_parsing) -- distinct de DiagnosticResultat
   (diagnosticResultat.js), qui est le contenu pur, sans identite propre.

   IMPORTANT (principe 4, "eviter les effets de bord") : les transitions
   de statut retournent un NOUVEL objet plutot que de muter l'original --
   bilanMarquerDiagnosticComplet/EchecParsing ne modifient jamais leur
   parametre en place.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanEnumsDiag = require('./enums.js');
  var BILAN_STATUT_DIAGNOSTIC = _bilanEnumsDiag.BILAN_STATUT_DIAGNOSTIC;
  var _bilanUtilDiag = require('./utilitaires.js');
  var bilanGenererId = _bilanUtilDiag.bilanGenererId;
  var bilanCreerErreurMetier = _bilanUtilDiag.bilanCreerErreurMetier;
}

function bilanCreerDiagnostic(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || bilanGenererId('diag'),
    candidatureId: donnees.candidatureId,
    contexteAnalyse: donnees.contexteAnalyse,
    promptTexte: donnees.promptTexte || '',
    dateGeneration: donnees.dateGeneration,
    statut: 'genere',
    resultat: null,
    texteBrutReponseIA: null
  };
}

// Retourne une COPIE de diagnostic, jamais l'original modifie.
function bilanMarquerDiagnosticComplet(diagnostic, resultat, texteBrutReponseIA) {
  var copie = _bilanCopierDiagnostic(diagnostic);
  copie.statut = 'complete';
  copie.resultat = resultat;
  copie.texteBrutReponseIA = texteBrutReponseIA;
  return copie;
}

function bilanMarquerDiagnosticEchecParsing(diagnostic, texteBrutReponseIA) {
  var copie = _bilanCopierDiagnostic(diagnostic);
  copie.statut = 'echec_parsing';
  copie.resultat = null;
  copie.texteBrutReponseIA = texteBrutReponseIA;
  return copie;
}

function _bilanCopierDiagnostic(diagnostic) {
  return {
    id: diagnostic.id,
    candidatureId: diagnostic.candidatureId,
    contexteAnalyse: diagnostic.contexteAnalyse,
    promptTexte: diagnostic.promptTexte,
    dateGeneration: diagnostic.dateGeneration,
    statut: diagnostic.statut,
    resultat: diagnostic.resultat,
    texteBrutReponseIA: diagnostic.texteBrutReponseIA
  };
}

// CONTRATS.md : complete => resultat non null ; echec_parsing =>
// texteBrutReponseIA non vide et resultat null.
function bilanDiagnosticEstValide(diagnostic) {
  if (!diagnostic || !diagnostic.id || !diagnostic.candidatureId) { return false; }
  if (BILAN_STATUT_DIAGNOSTIC.indexOf(diagnostic.statut) === -1) { return false; }
  if (diagnostic.statut === 'complete' && !diagnostic.resultat) { return false; }
  if (diagnostic.statut === 'echec_parsing' && (!diagnostic.texteBrutReponseIA || diagnostic.resultat)) { return false; }
  return true;
}

function bilanValiderDiagnostic(diagnostic) {
  if (!bilanDiagnosticEstValide(diagnostic)) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'Diagnostic dans un etat incoherent (statut/resultat/texteBrutReponseIA).', { diagnostic: diagnostic });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerDiagnostic: bilanCreerDiagnostic,
    bilanMarquerDiagnosticComplet: bilanMarquerDiagnosticComplet,
    bilanMarquerDiagnosticEchecParsing: bilanMarquerDiagnosticEchecParsing,
    bilanDiagnosticEstValide: bilanDiagnosticEstValide,
    bilanValiderDiagnostic: bilanValiderDiagnostic
  };
}
