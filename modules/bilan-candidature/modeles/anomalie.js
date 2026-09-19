/* ============================================================
   modules/bilan-candidature/modeles/anomalie.js
   ------------------------------------------------------------
   Ajoute pendant diagnostic/ (2026-08-08), pas prevu dans CONTRATS.md
   initial -- justification : le parser tolerant de diagnostic/
   (diagnosticResponseParser.js) doit signaler precisement pourquoi une
   entree de la reponse de l’assistant a ete ecartee, sans jamais invalider tout le
   DiagnosticResultat pour autant. Une Anomalie est un OUTIL DE
   DIAGNOSTIC TECHNIQUE : aucun autre composant du module ne doit s'en
   servir pour fonctionner -- seul le DiagnosticResultat reconstruit est
   consomme normalement. Les anomalies servent au debogage, aux logs, et
   eventuellement a informer l'utilisateur -- jamais une seconde
   representation des donnees.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanEnumsAnomalie = require('./enums.js');
  var BILAN_TYPES_ANOMALIE = _bilanEnumsAnomalie.BILAN_TYPES_ANOMALIE;
}

function bilanCreerAnomalie(donnees) {
  donnees = donnees || {};
  return {
    type: donnees.type,
    chemin: donnees.chemin || '',
    detail: donnees.detail || '',
    valeurRecue: donnees.valeurRecue !== undefined ? donnees.valeurRecue : null
  };
}

function bilanAnomalieEstValide(anomalie) {
  return !!(anomalie && BILAN_TYPES_ANOMALIE.indexOf(anomalie.type) !== -1 && anomalie.chemin);
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerAnomalie: bilanCreerAnomalie,
    bilanAnomalieEstValide: bilanAnomalieEstValide
  };
}
