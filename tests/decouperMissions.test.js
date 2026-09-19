const { test } = require('node:test');
const assert = require('node:assert/strict');
const { _decouperMissions, _sansPonctuationFinale, _formaterPeriode } = require('../modules/cv-composeur/composeurRender.js');

test('_decouperMissions : vide ou absent', () => {
  assert.deepEqual(_decouperMissions(''), []);
  assert.deepEqual(_decouperMissions(undefined), []);
  assert.deepEqual(_decouperMissions('   '), []);
});

test('_decouperMissions : format 1 -- une mission par ligne', () => {
  const brut = 'Gerer le planning\nAnimer une equipe de 5 personnes\n';
  assert.deepEqual(_decouperMissions(brut), ['Gerer le planning', 'Animer une equipe de 5 personnes']);
});

test('_decouperMissions : format 2 -- separateur point-virgule (une seule ligne)', () => {
  const brut = 'Gerer le planning; Animer une equipe; Suivre les indicateurs';
  assert.deepEqual(_decouperMissions(brut), ['Gerer le planning', 'Animer une equipe', 'Suivre les indicateurs']);
});

test('_decouperMissions : format 3 -- phrases jointes par ". " + majuscule (le separateur, point inclus, est consomme -- seul le dernier segment garde son point final)', () => {
  const brut = 'Gere un portefeuille de 50 clients. Anime une equipe de 3 personnes. Pilote le reporting mensuel.';
  assert.deepEqual(_decouperMissions(brut), [
    'Gere un portefeuille de 50 clients',
    'Anime une equipe de 3 personnes',
    'Pilote le reporting mensuel.'
  ]);
});

test('_decouperMissions : format 3 ne coupe pas un nombre decimal', () => {
  const brut = 'Gere un budget de 3.5 millions €.';
  assert.deepEqual(_decouperMissions(brut), ['Gere un budget de 3.5 millions €.']);
});

test('_sansPonctuationFinale : retire ponctuation de debut/fin', () => {
  assert.equal(_sansPonctuationFinale('Gerer le planning.'), 'Gerer le planning');
  assert.equal(_sansPonctuationFinale('  ; Anime une equipe ; '), 'Anime une equipe');
  assert.equal(_sansPonctuationFinale(''), '');
  assert.equal(_sansPonctuationFinale(undefined), '');
});

test('_formaterPeriode : date de debut seule -> "en cours"', () => {
  assert.equal(_formaterPeriode('2020', ''), '2020 - en cours');
});

test('_formaterPeriode : periode complete ou vide', () => {
  assert.equal(_formaterPeriode('2018', '2020'), '2018 - 2020');
  assert.equal(_formaterPeriode('', ''), '');
});
