/* ============================================================
   modules/bilan-candidature/core/diagnosticStore.js
   ------------------------------------------------------------
   Etat central du module -- seule source de verite. STRICTEMENT :
   stockage des objets, controles de coherence d'etat (comparaisons
   d'id, jamais d'interpretation de leur contenu), lecture/ecriture.
   AUCUNE regle metier, AUCUNE decision -- un champ mal forme, une
   priorite incoherente, une observation douteuse : jamais le probleme
   de ce fichier, deja gere par la couche qui a produit l'objet.

   IMPORTANT (invariant 10, CONTRATS.md) : aucun fichier autre que
   core/moduleOrchestrator.js ne doit importer ce fichier -- garanti
   structurellement (verifie par grep), pas par un garde-fou interne
   (un objet JS ne peut pas verifier "qui" l'appelle sans un mecanisme
   disproportionne pour ce besoin).

   Invariant 8 (jamais deux Diagnostic actifs pour la meme Candidature)
   garanti PAR LA FORME de l'etat lui-meme : un seul emplacement
   "diagnostic", jamais un tableau -- structurellement impossible d'en
   avoir deux, aucune verification a ecrire pour ca.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtil_DS = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtil_DS.bilanCreerErreurMetier;
}

function bilanEtatInitial() {
  return {
    candidature: null,
    diagnostic: null,
    demandesAmelioration: {},
    propositionsAmelioration: {}
  };
}

var _bilanEtat = bilanEtatInitial();

// Nouvelle candidature => plus aucun diagnostic/demande/proposition ne
// peut lui correspondre : reinitialisation totale. Controle de
// coherence d'etat, pas une decision sur le contenu de la candidature.
function bilanStoreDefinirCandidature(candidature) {
  _bilanEtat = bilanEtatInitial();
  _bilanEtat.candidature = candidature;
}

function bilanStoreObtenirCandidature() {
  return _bilanEtat.candidature;
}

// TACHE (RC-02, architecture finale -- "une seule candidature, jamais
// dupliquee", 2026-08-22) : DISTINCTE de bilanStoreDefinirCandidature()
// ci-dessus -- celle-ci signifie "nouvelle candidature", reinitialisation
// totale assumee. Une CORRECTION du texte d'une candidature deja active
// (ex. correction texte-libre) ne doit jamais remettre en cause le
// diagnostic deja obtenu ni la progression de correction en cours :
// seul le champ cv change, tout le reste de l'etat reste intact. Copie,
// jamais une mutation en place (meme discipline que
// bilanMarquerDiagnosticComplet ailleurs dans le module).
function bilanStoreMettreAJourCvCandidature(nouveauCv) {
  if (!_bilanEtat.candidature) {
    throw bilanCreerErreurMetier('EtatIncoherent', 'Aucune candidature active a mettre a jour.');
  }
  _bilanEtat.candidature = Object.assign({}, _bilanEtat.candidature, { cv: nouveauCv });
}

// TACHE (chantier "ignorer un point du rapport", 2026-08-25) : meme
// principe EXACT que bilanStoreMettreAJourCvCandidature ci-dessus --
// copie, jamais une mutation en place. Appelee juste avant une reanalyse
// (bilanRecommencerDiagnostic()), qui re-stocke ensuite cette MEME
// candidature (donc ce nouveau champ survit au reset d'etat qu'elle
// declenche).
function bilanStoreMettreAJourPointsDejaConnusCandidature(pointsDejaConnus) {
  if (!_bilanEtat.candidature) {
    throw bilanCreerErreurMetier('EtatIncoherent', 'Aucune candidature active a mettre a jour.');
  }
  _bilanEtat.candidature = Object.assign({}, _bilanEtat.candidature, { pointsDejaConnus: pointsDejaConnus });
}

function bilanStoreDefinirDiagnostic(diagnostic) {
  if (!_bilanEtat.candidature || !diagnostic || diagnostic.candidatureId !== _bilanEtat.candidature.id) {
    throw bilanCreerErreurMetier('EtatIncoherent', 'Le diagnostic ne correspond pas à la candidature active.', {
      candidatureId: _bilanEtat.candidature && _bilanEtat.candidature.id,
      diagnosticCandidatureId: diagnostic && diagnostic.candidatureId
    });
  }
  _bilanEtat.diagnostic = diagnostic;
}

function bilanStoreObtenirDiagnostic() {
  return _bilanEtat.diagnostic;
}

// TACHE (RC-03, « Retour un cran a la fois », 2026-09-10) : un « Retour »
// depuis « Coller la reponse » revient a « Choisir mon assistant » -- on
// abandonne le diagnostic en attente (et tout ce qui en depend) SANS
// toucher a la candidature deja deposee. Re-choisir un assistant recree un
// diagnostic frais (bilanDemarrerDiagnostic). Distinct de
// bilanStoreDefinirCandidature() (nouvelle candidature = tout a zero) et de
// bilanStoreReinitialiser() (session entiere).
function bilanStoreAbandonnerDiagnostic() {
  _bilanEtat.diagnostic = null;
  _bilanEtat.demandesAmelioration = {};
  _bilanEtat.propositionsAmelioration = {};
}

function bilanStoreAjouterDemandeAmelioration(demande) {
  if (!_bilanEtat.diagnostic || !demande || demande.diagnosticSourceId !== _bilanEtat.diagnostic.id) {
    throw bilanCreerErreurMetier('EtatIncoherent', 'La demande d\'amélioration ne correspond pas au diagnostic actif.', {
      diagnosticId: _bilanEtat.diagnostic && _bilanEtat.diagnostic.id,
      demandeSourceId: demande && demande.diagnosticSourceId
    });
  }
  _bilanEtat.demandesAmelioration[demande.id] = demande;
}

function bilanStoreObtenirDemandeAmelioration(id) {
  return _bilanEtat.demandesAmelioration[id] || null;
}

function bilanStoreAjouterPropositionAmelioration(proposition) {
  if (!proposition || !_bilanEtat.demandesAmelioration[proposition.demandeAmeliorationId]) {
    throw bilanCreerErreurMetier('EtatIncoherent', 'La proposition ne correspond à aucune demande d\'amélioration active.', {
      demandeAmeliorationId: proposition && proposition.demandeAmeliorationId
    });
  }
  _bilanEtat.propositionsAmelioration[proposition.demandeAmeliorationId] = proposition;
}

function bilanStoreObtenirPropositionAmelioration(idDemandeAmelioration) {
  return _bilanEtat.propositionsAmelioration[idDemandeAmelioration] || null;
}

// Reservee aux tests (et a un futur "nouvelle session" explicite).
function bilanStoreReinitialiser() {
  _bilanEtat = bilanEtatInitial();
}

// TACHE (disquette -- couverture des modules isoles, 2026-08-25, DECISION
// DE DENIS) : contrat standard "donne tes infos"/"reprends tes infos",
// le meme pour chaque module qui garde son etat hors de `dossier` (voir
// aussi modules/coherence-transversale/core/diagnosticStore.js) -- la
// sauvegarde de session (js/app.js) appelle ces 2 fonctions SANS jamais
// connaitre le detail interne de ce module. null si aucune candidature
// active (jamais un objet vide a restaurer par-dessus une session neuve).
function bilanStoreExporterEtat() {
  if (!_bilanEtat.candidature) { return null; }
  return _bilanEtat;
}
function bilanStoreRestaurerEtat(etat) {
  _bilanEtat = etat || bilanEtatInitial();
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanStoreDefinirCandidature: bilanStoreDefinirCandidature,
    bilanStoreObtenirCandidature: bilanStoreObtenirCandidature,
    bilanStoreMettreAJourCvCandidature: bilanStoreMettreAJourCvCandidature,
    bilanStoreMettreAJourPointsDejaConnusCandidature: bilanStoreMettreAJourPointsDejaConnusCandidature,
    bilanStoreDefinirDiagnostic: bilanStoreDefinirDiagnostic,
    bilanStoreObtenirDiagnostic: bilanStoreObtenirDiagnostic,
    bilanStoreAbandonnerDiagnostic: bilanStoreAbandonnerDiagnostic,
    bilanStoreAjouterDemandeAmelioration: bilanStoreAjouterDemandeAmelioration,
    bilanStoreObtenirDemandeAmelioration: bilanStoreObtenirDemandeAmelioration,
    bilanStoreAjouterPropositionAmelioration: bilanStoreAjouterPropositionAmelioration,
    bilanStoreObtenirPropositionAmelioration: bilanStoreObtenirPropositionAmelioration,
    bilanStoreReinitialiser: bilanStoreReinitialiser,
    bilanStoreExporterEtat: bilanStoreExporterEtat,
    bilanStoreRestaurerEtat: bilanStoreRestaurerEtat
  };
}
