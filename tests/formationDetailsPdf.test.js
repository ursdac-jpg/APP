const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// cvPdfTemplateA4.js est un script de navigateur (sans export) : chargement dans un contexte isole.
const contexte = {};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateA4.js', 'utf8'), contexte);
const details = function (f, aff) { return JSON.parse(JSON.stringify(contexte._pdfFormationDetails(f, aff))); };
const f = { etablissement: 'AFTRAL', lieu: 'Bergerac', annee: '2026' };

// Retour Denis 2026-10-01 : un lieu capte dans le CV s'affiche toujours, sauf si la personne decoche la case « Lieu » (avant : masque par defaut).
test('formation : par defaut centre, lieu et annee sont montres quand ils existent', () => {
  assert.deepEqual(details(f, undefined), { endroit: 'AFTRAL, Bergerac', annee: '2026' });
  assert.deepEqual(details(f, {}), { endroit: 'AFTRAL, Bergerac', annee: '2026' });
});

test('formation : lieu decoche = plus de lieu ; chaque case decochee retire son element', () => {
  assert.deepEqual(details(f, { lieu: false }), { endroit: 'AFTRAL', annee: '2026' });
  assert.deepEqual(details(f, { centre: false, lieu: true, annee: false }), { endroit: 'Bergerac', annee: '' });
  assert.deepEqual(details(f, { centre: false, lieu: false, annee: false }), { endroit: '', annee: '' });
});

test('formation : champs absents ne produisent ni virgule ni tiret parasite', () => {
  assert.deepEqual(details({ annee: '2019' }, { lieu: true }), { endroit: '', annee: '2019' });
  assert.deepEqual(details({ etablissement: 'Lycée' }, { lieu: true }), { endroit: 'Lycée', annee: '' });
});
