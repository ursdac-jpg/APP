const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ctGenererId, ctCalculerHashContenu, ctCreerErreurMetier, ctEstErreurMetier } = require('../modules/coherence-transversale/modeles/utilitaires.js');

test('ctGenererId : jamais deux ids identiques pour le meme prefixe', () => {
  const id1 = ctGenererId('constat');
  const id2 = ctGenererId('constat');
  assert.notEqual(id1, id2);
});

test('ctGenererId : commence bien par le prefixe fourni', () => {
  assert.ok(ctGenererId('dossier').startsWith('dossier-'));
});

test('ctCalculerHashContenu : deterministe, memes valeurs => meme hash', () => {
  assert.equal(ctCalculerHashContenu(['a', 'b']), ctCalculerHashContenu(['a', 'b']));
});

test('ctCalculerHashContenu : des valeurs differentes donnent des hash differents', () => {
  assert.notEqual(ctCalculerHashContenu(['a', 'b']), ctCalculerHashContenu(['a', 'c']));
});

test('ctCalculerHashContenu : tolere null/undefined sans exception', () => {
  assert.doesNotThrow(() => ctCalculerHashContenu([null, undefined, 'x']));
});

test('ctCreerErreurMetier : instance d\'Error avec un code stable', () => {
  const erreur = ctCreerErreurMetier('DossierTransversalInvalide', 'message', { x: 1 });
  assert.ok(erreur instanceof Error);
  assert.equal(erreur.code, 'DossierTransversalInvalide');
  assert.deepEqual(erreur.details, { x: 1 });
});

test('ctEstErreurMetier : distingue le code attendu du reste', () => {
  const erreur = ctCreerErreurMetier('DossierTransversalInvalide', 'x');
  assert.equal(ctEstErreurMetier(erreur, 'DossierTransversalInvalide'), true);
  assert.equal(ctEstErreurMetier(erreur, 'AutreCode'), false);
  assert.equal(ctEstErreurMetier(null, 'DossierTransversalInvalide'), false);
});
