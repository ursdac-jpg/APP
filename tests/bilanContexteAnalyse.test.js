const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerContexteAnalyse, bilanContexteAnalyseEstValide, bilanValiderContexteAnalyse
} = require('../modules/bilan-candidature/modeles/contexteAnalyse.js');

test('bilanCreerContexteAnalyse : donneesManquantes et observations vides par defaut', () => {
  const contexte = bilanCreerContexteAnalyse({ candidatureId: 'c1', niveau: 1 });
  assert.deepEqual(contexte.donneesManquantes, []);
  assert.deepEqual(contexte.observations, []);
});

test('bilanContexteAnalyseEstValide : niveau hors 1-4 refuse', () => {
  assert.equal(bilanContexteAnalyseEstValide(bilanCreerContexteAnalyse({ candidatureId: 'c1', niveau: 5 })), false);
  assert.equal(bilanContexteAnalyseEstValide(bilanCreerContexteAnalyse({ candidatureId: 'c1', niveau: 2 })), true);
});

test('bilanContexteAnalyseEstValide : candidatureId obligatoire', () => {
  assert.equal(bilanContexteAnalyseEstValide(bilanCreerContexteAnalyse({ niveau: 1 })), false);
});

test('bilanContexteAnalyseEstValide : refuse une observation non factuelle', () => {
  const contexte = bilanCreerContexteAnalyse({
    candidatureId: 'c1', niveau: 1,
    observations: [{ origine: 'argumentee' }]
  });
  assert.equal(bilanContexteAnalyseEstValide(contexte), false);
});

test('bilanValiderContexteAnalyse : leve NiveauIncoherent si invalide', () => {
  assert.throws(() => bilanValiderContexteAnalyse(bilanCreerContexteAnalyse({ candidatureId: 'c1', niveau: 9 })),
    (erreur) => erreur.code === 'NiveauIncoherent');
});
