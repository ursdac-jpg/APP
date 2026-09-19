/* ============================================================
   modules/coherence-transversale/modeles/entretienAvance.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet EntretienAvance --
   le 2e prompt du chantier (DECISION DE DENIS, 2026-08-25) : une
   conversation d'entretien plus poussee, distincte du diagnostic
   principal, jamais fusionnee avec lui (meme discipline "un prompt, un
   role" que le reste de l'app). Copie du meme motif que
   modeles/diagnostic.js -- cycle de vie identique (genere ->
   complete/echec_parsing), transitions qui retournent un NOUVEL objet,
   jamais une mutation de l'original.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilEA = require('./utilitaires.js');
  var ctGenererId = _ctUtilEA.ctGenererId;
  var ctCreerErreurMetier = _ctUtilEA.ctCreerErreurMetier;
}

var CT_STATUTS_ENTRETIEN_AVANCE = ['genere', 'complete', 'echec_parsing'];

// questionsReponses : [{ question, reponse }] -- les questions legeres du
// 1er prompt (diagnostic.resultat.questionsEntretien), avec la reponse
// ecrite par la personne pour chacune.
function ctCreerEntretienAvance(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || ctGenererId('entretien-avance'),
    dossierId: donnees.dossierId,
    questionsReponses: donnees.questionsReponses || [],
    promptTexte: donnees.promptTexte || '',
    dateGeneration: donnees.dateGeneration,
    statut: 'genere',
    resultat: null,
    texteBrutReponseIA: null
  };
}

function _ctCopierEntretienAvance(entretienAvance) {
  return {
    id: entretienAvance.id,
    dossierId: entretienAvance.dossierId,
    questionsReponses: entretienAvance.questionsReponses,
    promptTexte: entretienAvance.promptTexte,
    dateGeneration: entretienAvance.dateGeneration,
    statut: entretienAvance.statut,
    resultat: entretienAvance.resultat,
    texteBrutReponseIA: entretienAvance.texteBrutReponseIA
  };
}

function ctMarquerEntretienAvanceComplet(entretienAvance, resultat, texteBrutReponseIA) {
  var copie = _ctCopierEntretienAvance(entretienAvance);
  copie.statut = 'complete';
  copie.resultat = resultat;
  copie.texteBrutReponseIA = texteBrutReponseIA;
  return copie;
}

function ctMarquerEntretienAvanceEchecParsing(entretienAvance, texteBrutReponseIA) {
  var copie = _ctCopierEntretienAvance(entretienAvance);
  copie.statut = 'echec_parsing';
  copie.resultat = null;
  copie.texteBrutReponseIA = texteBrutReponseIA;
  return copie;
}

function ctEntretienAvanceEstValide(entretienAvance) {
  if (!entretienAvance || !entretienAvance.id || !entretienAvance.dossierId) { return false; }
  if (CT_STATUTS_ENTRETIEN_AVANCE.indexOf(entretienAvance.statut) === -1) { return false; }
  if (entretienAvance.statut === 'complete' && !entretienAvance.resultat) { return false; }
  if (entretienAvance.statut === 'echec_parsing' && (!entretienAvance.texteBrutReponseIA || entretienAvance.resultat)) { return false; }
  return true;
}

if (typeof module !== 'undefined') {
  module.exports = {
    CT_STATUTS_ENTRETIEN_AVANCE: CT_STATUTS_ENTRETIEN_AVANCE,
    ctCreerEntretienAvance: ctCreerEntretienAvance,
    ctMarquerEntretienAvanceComplet: ctMarquerEntretienAvanceComplet,
    ctMarquerEntretienAvanceEchecParsing: ctMarquerEntretienAvanceEchecParsing,
    ctEntretienAvanceEstValide: ctEntretienAvanceEstValide
  };
}
