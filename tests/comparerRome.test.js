const { test } = require('node:test');
const assert = require('node:assert/strict');
const { comparer, rapportTexte } = require('../scripts/importRome/comparerRome.js');

// Veille du ROME (phase 6) : la comparaison de deux versions, essayée sur de petits états inventés (aucun fichier du ROME lu).
const ancien = { version: ['v62'], codes: {
  A1: { libelle: 'Boulanger', empreinte: 'aaa', appellations: 3 },
  B2: { libelle: 'Maçon', empreinte: 'bbb', appellations: 4 },
  C3: { libelle: 'Ancien métier', empreinte: 'ccc', appellations: 1 },
  D4: { libelle: 'Peintre', empreinte: 'ddd', appellations: 2 },
  E5: { libelle: 'Vendeur', empreinte: 'eee', appellations: 5 }
} };
const nouveau = { codes: {
  A1: { libelle: 'Boulanger', empreinte: 'aaa', appellations: 3 },
  B2: { libelle: 'Maçon', empreinte: 'bbb2', appellations: 5 },
  D4: { libelle: 'Peintre en bâtiment', empreinte: 'ddd', appellations: 2 },
  E5: { libelle: 'Vendeur', empreinte: 'eee2', appellations: 5 },
  F6: { libelle: 'Nouveau métier', empreinte: 'fff', appellations: 2 }
} };

test('veille du ROME : codes nouveaux, supprimés, intitulés et contenus changés, inchangés', () => {
  const r = comparer(ancien, nouveau, new Set(['B2', 'C3']));
  assert.deepEqual(r.nouveaux.map((x) => x.code), ['F6']);
  assert.deepEqual(r.supprimes.map((x) => x.code), ['C3']);
  assert.equal(r.supprimes[0].aLaMain, true, 'un code supprimé qui avait une fiche à la main est signalé');
  assert.deepEqual(r.intituleChange.map((x) => x.code), ['D4']);
  assert.deepEqual(r.contenuChange.map((x) => x.code + (x.aLaMain ? ' main' : '')), ['B2 main', 'E5']);
  assert.deepEqual(r.appellationsChangees.map((x) => x.code), ['B2']);
  assert.equal(r.inchanges, 1);
});

test('veille du ROME : le rapport liste à relire les seules fiches à la main dont le ROME a bougé, sans tiret long', () => {
  const texte = rapportTexte(comparer(ancien, nouveau, new Set(['B2', 'C3'])), { versionAvant: ['v62'], versionApres: ['v63'], date: '2027-05-01' });
  assert.ok(texte.indexOf('## À relire par Denis : fiches écrites à la main dont la fiche du ROME a bougé (1)') !== -1);
  assert.ok(texte.indexOf('- B2 Maçon') !== -1);
  assert.ok(texte.indexOf('**(fiche écrite à la main : à décider)**') !== -1);
  assert.ok(!/[—–]/.test(texte), 'jamais de tiret long');
});

test('veille du ROME : deux versions identiques ne donnent aucun écart', () => {
  const r = comparer(ancien, ancien, new Set());
  assert.equal(r.nouveaux.length + r.supprimes.length + r.intituleChange.length + r.contenuChange.length + r.appellationsChangees.length, 0);
  assert.equal(r.inchanges, 5);
});
