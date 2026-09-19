const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bilanCreerAnomalie, bilanAnomalieEstValide } = require('../modules/bilan-candidature/modeles/anomalie.js');

test('bilanCreerAnomalie : valeurRecue absente => null, jamais undefined', () => {
  const anomalie = bilanCreerAnomalie({ type: 'ChampManquant', chemin: 'axes[0].id', detail: 'id manquant.' });
  assert.equal(anomalie.valeurRecue, null);
});

test('bilanAnomalieEstValide : type hors enumeration refuse', () => {
  assert.equal(bilanAnomalieEstValide(bilanCreerAnomalie({ type: 'TypeInexistant', chemin: 'x' })), false);
});

test('bilanAnomalieEstValide : chemin obligatoire', () => {
  assert.equal(bilanAnomalieEstValide(bilanCreerAnomalie({ type: 'ChampManquant', chemin: '' })), false);
});

test('bilanAnomalieEstValide : anomalie complete acceptee', () => {
  assert.equal(bilanAnomalieEstValide(bilanCreerAnomalie({ type: 'ReferenceInconnue', chemin: 'axes[0].id', detail: 'x' })), true);
});
