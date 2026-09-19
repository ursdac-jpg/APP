const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctCreerDiagnostic, ctMarquerDiagnosticComplet, ctMarquerDiagnosticEchecParsing, ctDiagnosticEstValide, ctValiderDiagnostic
} = require('../modules/coherence-transversale/modeles/diagnostic.js');

test('ctCreerDiagnostic : statut "genere" par defaut, resultat/texteBrutReponseIA nuls', () => {
  const d = ctCreerDiagnostic({ dossierId: 'dossier-1', promptTexte: 'x', dateGeneration: '2026-08-25' });
  assert.equal(d.statut, 'genere');
  assert.equal(d.resultat, null);
  assert.equal(d.texteBrutReponseIA, null);
});

test('ctMarquerDiagnosticComplet : retourne une COPIE, ne modifie jamais l\'original', () => {
  const original = ctCreerDiagnostic({ dossierId: 'dossier-1' });
  const complet = ctMarquerDiagnosticComplet(original, { syntheseGenerale: 'x' }, 'texte brut');
  assert.equal(original.statut, 'genere');
  assert.equal(complet.statut, 'complete');
  assert.deepEqual(complet.resultat, { syntheseGenerale: 'x' });
});

test('ctMarquerDiagnosticEchecParsing : statut echec_parsing, resultat reste null', () => {
  const original = ctCreerDiagnostic({ dossierId: 'dossier-1' });
  const echec = ctMarquerDiagnosticEchecParsing(original, 'texte illisible');
  assert.equal(echec.statut, 'echec_parsing');
  assert.equal(echec.resultat, null);
  assert.equal(echec.texteBrutReponseIA, 'texte illisible');
});

test('ctDiagnosticEstValide : complete sans resultat -> invalide', () => {
  const d = ctCreerDiagnostic({ dossierId: 'dossier-1' });
  d.statut = 'complete';
  assert.equal(ctDiagnosticEstValide(d), false);
});

test('ctDiagnosticEstValide : echec_parsing avec resultat present -> invalide (incoherent)', () => {
  const d = ctCreerDiagnostic({ dossierId: 'dossier-1' });
  d.statut = 'echec_parsing';
  d.texteBrutReponseIA = 'x';
  d.resultat = { x: 1 };
  assert.equal(ctDiagnosticEstValide(d), false);
});

test('ctValiderDiagnostic : leve ReponseIncomplete si invalide, ne leve rien si valide', () => {
  const genere = ctCreerDiagnostic({ dossierId: 'dossier-1' });
  assert.doesNotThrow(() => ctValiderDiagnostic(genere));
  const invalide = ctCreerDiagnostic({ dossierId: 'dossier-1' });
  invalide.statut = 'complete';
  assert.throws(() => ctValiderDiagnostic(invalide), (e) => e.code === 'ReponseIncomplete');
});
