/* ============================================================
   modules/coherence-transversale/core/diagnosticStore.js
   ------------------------------------------------------------
   Etat partage du module (en memoire, une seule session) : le
   DossierTransversal actif et son diagnostic. Copie du meme motif que
   modules/bilan-candidature/core/diagnosticStore.js, en plus simple (pas
   de DemandeAmelioration/PropositionAmelioration -- ce module n'a pas
   (encore) de mecanisme d'amelioration en un aller-retour supplementaire,
   les corrections restent portees par les Recommandation du diagnostic
   lui-meme).

   Invariant : seul core/moduleOrchestrator.js importe ce fichier (jamais
   un acces direct depuis l'exterieur du module).
   ============================================================ */

var _ctDossierActif = null;
var _ctDiagnosticActif = null;
// TACHE (entretien avance, Pass B, 2026-08-25, DECISION DE DENIS) : le 2e
// prompt, son propre etat de cycle de vie -- remis a zero avec le reste
// des qu'un nouveau dossier est depose (ctStoreDefinirDossier) ou que le
// module est reinitialise, jamais conserve d'une analyse a l'autre.
var _ctEntretienAvanceActif = null;

function ctStoreDefinirDossier(dossier) { _ctDossierActif = dossier; _ctDiagnosticActif = null; _ctEntretienAvanceActif = null; }
function ctStoreObtenirDossier() { return _ctDossierActif; }
function ctStoreDefinirDiagnostic(diagnostic) { _ctDiagnosticActif = diagnostic; }
function ctStoreObtenirDiagnostic() { return _ctDiagnosticActif; }
function ctStoreDefinirEntretienAvance(entretienAvance) { _ctEntretienAvanceActif = entretienAvance; }
function ctStoreObtenirEntretienAvance() { return _ctEntretienAvanceActif; }
function ctStoreReinitialiser() { _ctDossierActif = null; _ctDiagnosticActif = null; _ctEntretienAvanceActif = null; }

// TACHE (disquette -- couverture des modules isoles, 2026-08-25, DECISION
// DE DENIS) : contrat standard "donne tes infos"/"reprends tes infos",
// le meme pour chaque module qui garde son etat hors de `dossier` (voir
// aussi modules/bilan-candidature/core/diagnosticStore.js) -- la
// sauvegarde de session (js/app.js) appelle ces 2 fonctions SANS jamais
// connaitre le detail interne de ce module. null si rien n'est actif
// (jamais un objet vide a restaurer par-dessus une session neuve).
function ctStoreExporterEtat() {
  if (!_ctDossierActif) { return null; }
  return { dossier: _ctDossierActif, diagnostic: _ctDiagnosticActif, entretienAvance: _ctEntretienAvanceActif };
}
function ctStoreRestaurerEtat(etat) {
  _ctDossierActif = (etat && etat.dossier) || null;
  _ctDiagnosticActif = (etat && etat.diagnostic) || null;
  _ctEntretienAvanceActif = (etat && etat.entretienAvance) || null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctStoreDefinirDossier: ctStoreDefinirDossier,
    ctStoreObtenirDossier: ctStoreObtenirDossier,
    ctStoreDefinirDiagnostic: ctStoreDefinirDiagnostic,
    ctStoreObtenirDiagnostic: ctStoreObtenirDiagnostic,
    ctStoreDefinirEntretienAvance: ctStoreDefinirEntretienAvance,
    ctStoreObtenirEntretienAvance: ctStoreObtenirEntretienAvance,
    ctStoreReinitialiser: ctStoreReinitialiser,
    ctStoreExporterEtat: ctStoreExporterEtat,
    ctStoreRestaurerEtat: ctStoreRestaurerEtat
  };
}
