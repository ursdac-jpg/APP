const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  CT_NATURES_CONSTAT, ctCreerConstat, ctConstatEstValide, ctValiderConstat
} = require('../modules/coherence-transversale/modeles/constat.js');

function constatValide(overrides) {
  return ctCreerConstat(Object.assign({
    ancrage: ['cv.experience[0]', 'lettre.paragraphe[2]'],
    nature: 'incoherence',
    dimension: 'autonomie',
    preuve: ['texte du CV', 'texte de la lettre'],
    message: 'Incohérence détectée entre le CV et la lettre.'
  }, overrides || {}), 0);
}

test('ctCreerConstat : assemble tous les champs fournis', () => {
  const c = constatValide();
  assert.equal(c.nature, 'incoherence');
  assert.equal(c.dimension, 'autonomie');
  assert.deepEqual(c.ancrage, ['cv.experience[0]', 'lettre.paragraphe[2]']);
  assert.deepEqual(c.preuve, ['texte du CV', 'texte de la lettre']);
});

test('ctCreerConstat : id deterministe base sur l\'index si aucun id fourni', () => {
  const c1 = ctCreerConstat({}, 2);
  const c2 = ctCreerConstat({}, 2);
  assert.equal(c1.id, c2.id);
  assert.equal(c1.id, 'constat-2');
});

test('ctCreerConstat : confiance absente par defaut (null)', () => {
  assert.equal(constatValide().confiance, null);
});

test('CT_NATURES_CONSTAT : inclut "force", pas seulement des problemes', () => {
  assert.ok(CT_NATURES_CONSTAT.includes('force'));
  assert.ok(CT_NATURES_CONSTAT.includes('incoherence'));
  assert.ok(CT_NATURES_CONSTAT.includes('absence'));
  assert.ok(CT_NATURES_CONSTAT.includes('duplication'));
});

test('ctConstatEstValide : un constat complet est valide', () => {
  assert.equal(ctConstatEstValide(constatValide()), true);
});

test('ctConstatEstValide : ancrage vide -> invalide (jamais de constat sans trace)', () => {
  assert.equal(ctConstatEstValide(constatValide({ ancrage: [] })), false);
});

test('ctConstatEstValide : preuve vide -> invalide', () => {
  assert.equal(ctConstatEstValide(constatValide({ preuve: [] })), false);
});

test('ctConstatEstValide : nature inconnue -> invalide', () => {
  assert.equal(ctConstatEstValide(constatValide({ nature: 'n\'importe-quoi' })), false);
});

test('ctConstatEstValide : confiance invalide -> invalide, mais confiance absente reste valide', () => {
  assert.equal(ctConstatEstValide(constatValide({ confiance: 'peut-etre' })), false);
  assert.equal(ctConstatEstValide(constatValide({ confiance: 'certaine' })), true);
});

test('ctValiderConstat : leve ReponseIncomplete si invalide, ne leve rien si valide', () => {
  assert.throws(() => ctValiderConstat(constatValide({ nature: null })), (e) => e.code === 'ReponseIncomplete');
  assert.doesNotThrow(() => ctValiderConstat(constatValide()));
});
