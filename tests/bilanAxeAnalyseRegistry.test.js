const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  BILAN_CATALOGUE_AXES, bilanObtenirAxe, bilanObtenirCatalogueAxes,
  bilanObtenirAxesApplicables, bilanObtenirAxesNonApplicables
} = require('../modules/bilan-candidature/analyse/axeAnalyseRegistry.js');
const { bilanDefinitionAxeEstValide } = require('../modules/bilan-candidature/modeles/axe.js');

test('BILAN_CATALOGUE_AXES : exactement 9 entrees', () => {
  assert.equal(BILAN_CATALOGUE_AXES.length, 9);
});

test('BILAN_CATALOGUE_AXES : identifiants tous uniques', () => {
  const ids = BILAN_CATALOGUE_AXES.map((axe) => axe.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('BILAN_CATALOGUE_AXES : chaque entree est une definition d\'axe valide (modeles/axe.js)', () => {
  BILAN_CATALOGUE_AXES.forEach((axe) => {
    assert.equal(bilanDefinitionAxeEstValide(axe), true, `axe invalide : ${axe.id}`);
  });
});

test('BILAN_CATALOGUE_AXES : projection recruteur absente du catalogue (synthese, pas une dimension analysee)', () => {
  assert.equal(bilanObtenirAxe('projection'), undefined);
});

test('bilanObtenirAxe : recupere par id, undefined si inconnu', () => {
  assert.equal(bilanObtenirAxe('adequation').nom, 'Adéquation avec le poste');
  assert.equal(bilanObtenirAxe('inexistant'), undefined);
});

test('bilanObtenirCatalogueAxes : retourne une copie, pas la reference interne', () => {
  const copie = bilanObtenirCatalogueAxes();
  copie.push({ id: 'intrus' });
  assert.equal(BILAN_CATALOGUE_AXES.length, 9);
});

test('bilanObtenirAxesApplicables : niveau 1 exclut adequation (min. 2), personnalisation (min. 3)', () => {
  const ids = bilanObtenirAxesApplicables(1).map((axe) => axe.id);
  assert.equal(ids.includes('adequation'), false);
  assert.equal(ids.includes('personnalisation'), false);
  assert.equal(ids.includes('credibilite'), true);
});

test('bilanObtenirAxesApplicables : niveau 4 inclut les 9 axes', () => {
  assert.equal(bilanObtenirAxesApplicables(4).length, 9);
});

test('bilanObtenirAxesNonApplicables : complementaire exacte de bilanObtenirAxesApplicables', () => {
  const niveau = 2;
  const total = bilanObtenirAxesApplicables(niveau).length + bilanObtenirAxesNonApplicables(niveau).length;
  assert.equal(total, 9);
});
