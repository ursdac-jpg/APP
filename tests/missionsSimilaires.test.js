const test = require('node:test');
const assert = require('node:assert');
const { _cvMissionsSimilaires } = require('../modules/cv-core/normaliserDonneesCV.js');

test('deux phrases identiques (casse, accents, ponctuation ignorés) sont la même mission', () => {
  assert.strictEqual(_cvMissionsSimilaires('Aide à la toilette.', 'aide a la TOILETTE'), true);
});

test('un quasi-doublon de même longueur est reconnu', () => {
  assert.strictEqual(_cvMissionsSimilaires(
    'Préparer les repas et accompagner leur prise en tenant compte des besoins de la personne',
    'Préparer les repas et accompagner la prise des repas en tenant compte des besoins de la personne'), true);
});

test('un court intitulé de compétence ne fait jamais disparaître une mission qui le contient', () => {
  assert.strictEqual(_cvMissionsSimilaires(
    'Bionettoyage et hygiène hospitalière',
    'Réaliser le bionettoyage des chambres et des locaux de soins selon les protocoles d\'hygiène hospitalière'), false);
});

test('deux missions différentes sur le même sujet ne sont pas confondues', () => {
  assert.strictEqual(_cvMissionsSimilaires(
    'Aide à la toilette et à l\'habillage de personnes âgées dépendantes',
    'Préparation et aide à la prise des repas de personnes âgées dépendantes'), false);
});

test('les phrases vides ou trop courtes ne sont jamais jugées semblables (sauf identiques)', () => {
  assert.strictEqual(_cvMissionsSimilaires('', 'Toilette'), false);
  assert.strictEqual(_cvMissionsSimilaires('Toilette complète', 'Toilette partielle'), false);
  assert.strictEqual(_cvMissionsSimilaires('Toilette', 'Toilette'), true);
});

const { _cvMissionsParDefaut } = require('../modules/cv-core/normaliserDonneesCV.js');
test('LIM-4 : 2 missions par défaut pour un CV fourni (3 expériences ou plus), 3 pour un CV plus mince', () => {
  assert.strictEqual(_cvMissionsParDefaut(1), 3);
  assert.strictEqual(_cvMissionsParDefaut(2), 3);
  assert.strictEqual(_cvMissionsParDefaut(3), 2);
  assert.strictEqual(_cvMissionsParDefaut(9), 2);
  assert.strictEqual(_cvMissionsParDefaut(undefined), 3);
});
