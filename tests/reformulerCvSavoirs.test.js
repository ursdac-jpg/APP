// Savoirs (connaissances) proposés par l'assistant dans « Reformuler mon CV » (retour Denis 2026-09-30, C3 : « Vos savoirs » restait vide).
const { test } = require('node:test');
const assert = require('node:assert/strict');

const m = require('../data/metiers.js');

test('savoirs proposés : lus, sans doublon avec les compétences, les qualités ou les logiciels, 6 au plus', () => {
  const struct = m._reformulerCvNettoyerStruct({
    competences: [{ intitule: 'Aide à la toilette', origine: 'cv' }],
    savoirEtre: ['Écoute'],
    logiciels: ['Word'],
    savoirs: ['Protocoles de toilette', 'protocoles de toilette', 'Aide à la toilette', 'Écoute', 'Word', 'Hygiène à domicile', 'Réglementation ERP',
      'Gestes de premiers secours', 'Alimentation de la personne âgée', 'Droits des usagers', 'Prévention des chutes']
  });
  assert.deepEqual(struct.savoirs, ['Protocoles de toilette', 'Hygiène à domicile', 'Réglementation ERP', 'Gestes de premiers secours', 'Alimentation de la personne âgée', 'Droits des usagers']);
});

test('réponse sans le champ savoirs : liste vide, jamais une erreur', () => {
  assert.deepEqual(m._reformulerCvNettoyerStruct({}).savoirs, []);
  assert.deepEqual(m._reformulerCvNettoyerStruct({ savoirs: null }).savoirs, []);
});

test('le prompt de Reformuler demande les savoirs et les présente comme proposés', () => {
  const fs = require('node:fs');
  const t = fs.readFileSync(__dirname + '/../prompts/reformuler-cv.md', 'utf8');
  assert.ok(t.includes('"savoirs": ['));
  assert.ok(/`savoirs` : de 3 à 6 \*\*connaissances\*\*/.test(t));
  assert.ok(/seulement \*\*proposés\*\*/.test(t));
});

test('rattachements : le lien certification / formation donné par l’assistant est lu, nettoyé, et demandé par le prompt', () => {
  const fs = require('node:fs');
  const brut = JSON.stringify({ pasUnCV: false, pointsAVerifier: [], rattachements: [{ certification: ' SST ', formation: 'Plaquiste' }, { certification: 'Vide', formation: '' }, null], propositions: [{ certifications: ['SST'], formations: [{ intitule: 'Plaquiste', annee: '2025 - 2026' }] }] });
  const lire = { extraireJSON: (t) => JSON.parse(t) };
  const parse = m._reformulerCvParserReponse(brut, lire);
  assert.deepEqual(parse.rattachements, [{ certification: 'SST', formation: 'Plaquiste' }]);
  assert.deepEqual(m._reformulerCvParserReponse(JSON.stringify({ pasUnCV: false, propositions: [] }), lire).rattachements, []);
  assert.match(fs.readFileSync(__dirname + '/../prompts/reformuler-cv.md', 'utf8'), /"rattachements"/);
});
