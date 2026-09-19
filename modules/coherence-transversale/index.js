/* ============================================================
   modules/coherence-transversale/index.js
   ------------------------------------------------------------
   Facade publique du module -- seul fichier destine a etre importe par
   un consommateur externe (js/app.js, ou tout autre projet hote --
   objectif de portabilite, voir CONTRATS.md). Assemblage pur, aucune
   logique metier ici.
   ============================================================ */

if (typeof module !== 'undefined') {
  var _ctOrchestrator = require('./core/moduleOrchestrator.js');

  module.exports = {
    ctDeposerDossier: _ctOrchestrator.ctDeposerDossier,
    ctDemarrerDiagnostic: _ctOrchestrator.ctDemarrerDiagnostic,
    ctSoumettreReponseDiagnostic: _ctOrchestrator.ctSoumettreReponseDiagnostic,
    ctDemarrerEntretienAvance: _ctOrchestrator.ctDemarrerEntretienAvance,
    ctSoumettreReponseEntretienAvance: _ctOrchestrator.ctSoumettreReponseEntretienAvance,
    ctAnnulerDiagnostic: _ctOrchestrator.ctAnnulerDiagnostic,
    ctExporterEtatPourSauvegarde: _ctOrchestrator.ctExporterEtatPourSauvegarde,
    ctRestaurerEtatDepuisSauvegarde: _ctOrchestrator.ctRestaurerEtatDepuisSauvegarde,
    ctObtenirDossier: _ctOrchestrator.ctObtenirDossier,
    ctObtenirDiagnostic: _ctOrchestrator.ctObtenirDiagnostic,
    ctObtenirEntretienAvance: _ctOrchestrator.ctObtenirEntretienAvance
  };
}
