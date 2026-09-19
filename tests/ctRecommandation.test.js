const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  CT_DOCUMENTS_CIBLES, CT_MODES_APPLICATION, ctCreerRecommandation, ctRecommandationEstValide, ctValiderRecommandation
} = require('../modules/coherence-transversale/modeles/recommandation.js');

function recoValide(overrides) {
  return ctCreerRecommandation(Object.assign({
    constatsLies: ['constat-0'],
    contenu: 'Reformulez cette phrase pour ne pas la dupliquer.',
    documentCible: 'lettre',
    modeApplication: 'remplacement',
    texteAncre: 'phrase d\'origine',
    textePropose: 'phrase reformulee'
  }, overrides || {}), 0);
}

test('CT_DOCUMENTS_CIBLES : inclut lettre et entretien, pas seulement le cv (capacite absente du Bilan)', () => {
  assert.deepEqual(CT_DOCUMENTS_CIBLES, ['cv', 'lettre', 'entretien', 'plusieurs']);
});

test('CT_MODES_APPLICATION : remplacement, ajout, conseil', () => {
  assert.deepEqual(CT_MODES_APPLICATION, ['remplacement', 'ajout', 'conseil']);
});

test('ctCreerRecommandation : assemble tous les champs fournis', () => {
  const r = recoValide();
  assert.equal(r.documentCible, 'lettre');
  assert.equal(r.modeApplication, 'remplacement');
  assert.deepEqual(r.constatsLies, ['constat-0']);
});

test('ctRecommandationEstValide : une recommandation complete est valide', () => {
  assert.equal(ctRecommandationEstValide(recoValide()), true);
});

test('ctRecommandationEstValide : constatsLies vide -> invalide (jamais orpheline)', () => {
  assert.equal(ctRecommandationEstValide(recoValide({ constatsLies: [] })), false);
});

test('ctRecommandationEstValide : documentCible inconnu -> invalide', () => {
  assert.equal(ctRecommandationEstValide(recoValide({ documentCible: 'autre-chose' })), false);
});

test('ctRecommandationEstValide : documentCible "plusieurs" accepte (suggestion multi-documents)', () => {
  assert.equal(ctRecommandationEstValide(recoValide({ documentCible: 'plusieurs' })), true);
});

test('ctRecommandationEstValide : modeApplication "remplacement" sans texteAncre -> invalide', () => {
  assert.equal(ctRecommandationEstValide(recoValide({ texteAncre: null })), false);
});

test('ctRecommandationEstValide : modeApplication "conseil" n\'exige pas texteAncre', () => {
  assert.equal(ctRecommandationEstValide(recoValide({ modeApplication: 'conseil', texteAncre: null, documentCible: 'entretien' })), true);
});

test('ctValiderRecommandation : leve ReponseIncomplete si invalide', () => {
  assert.throws(() => ctValiderRecommandation(recoValide({ constatsLies: [] })), (e) => e.code === 'ReponseIncomplete');
  assert.doesNotThrow(() => ctValiderRecommandation(recoValide()));
});
