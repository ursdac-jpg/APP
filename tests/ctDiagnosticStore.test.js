const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctStoreDefinirDossier, ctStoreObtenirDossier, ctStoreDefinirDiagnostic, ctStoreObtenirDiagnostic,
  ctStoreDefinirEntretienAvance, ctStoreObtenirEntretienAvance, ctStoreReinitialiser,
  ctStoreExporterEtat, ctStoreRestaurerEtat
} = require('../modules/coherence-transversale/core/diagnosticStore.js');

beforeEach(() => { ctStoreReinitialiser(); });

test('ctStoreObtenirDossier : null avant tout depot', () => {
  assert.equal(ctStoreObtenirDossier(), null);
});

test('ctStoreDefinirDossier / ctStoreObtenirDossier : conserve le dossier depose', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  assert.deepEqual(ctStoreObtenirDossier(), { id: 'dossier-1' });
});

test('ctStoreDefinirDossier : reinitialise le diagnostic actif (nouveau dossier = nouveau cycle)', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  ctStoreDefinirDiagnostic({ id: 'diag-1' });
  ctStoreDefinirDossier({ id: 'dossier-2' });
  assert.equal(ctStoreObtenirDiagnostic(), null);
});

test('ctStoreReinitialiser : efface dossier ET diagnostic', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  ctStoreDefinirDiagnostic({ id: 'diag-1' });
  ctStoreReinitialiser();
  assert.equal(ctStoreObtenirDossier(), null);
  assert.equal(ctStoreObtenirDiagnostic(), null);
});

// TACHE (entretien avance, Pass B, 2026-08-25, DECISION DE DENIS)
test('ctStoreDefinirDossier : reinitialise aussi l\'entretien avance actif (nouveau dossier = nouveau cycle)', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  ctStoreDefinirEntretienAvance({ id: 'entretien-1' });
  ctStoreDefinirDossier({ id: 'dossier-2' });
  assert.equal(ctStoreObtenirEntretienAvance(), null);
});

test('ctStoreReinitialiser : efface aussi l\'entretien avance', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  ctStoreDefinirEntretienAvance({ id: 'entretien-1' });
  ctStoreReinitialiser();
  assert.equal(ctStoreObtenirEntretienAvance(), null);
});

// TACHE (disquette -- couverture des modules isoles, 2026-08-25, DECISION DE DENIS)
test('ctStoreExporterEtat : null si aucun dossier actif', () => {
  assert.equal(ctStoreExporterEtat(), null);
});

test('ctStoreExporterEtat : capture dossier/diagnostic/entretienAvance actifs', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  ctStoreDefinirDiagnostic({ id: 'diag-1' });
  ctStoreDefinirEntretienAvance({ id: 'entretien-1' });
  assert.deepEqual(ctStoreExporterEtat(), { dossier: { id: 'dossier-1' }, diagnostic: { id: 'diag-1' }, entretienAvance: { id: 'entretien-1' } });
});

test('ctStoreRestaurerEtat : restaure exactement l\'etat exporte (aller-retour)', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  ctStoreDefinirDiagnostic({ id: 'diag-1' });
  var etat = ctStoreExporterEtat();
  ctStoreReinitialiser();
  ctStoreRestaurerEtat(etat);
  assert.deepEqual(ctStoreObtenirDossier(), { id: 'dossier-1' });
  assert.deepEqual(ctStoreObtenirDiagnostic(), { id: 'diag-1' });
});

test('ctStoreRestaurerEtat : etat null remet tout a zero, jamais une exception', () => {
  ctStoreDefinirDossier({ id: 'dossier-1' });
  assert.doesNotThrow(() => ctStoreRestaurerEtat(null));
  assert.equal(ctStoreObtenirDossier(), null);
});
