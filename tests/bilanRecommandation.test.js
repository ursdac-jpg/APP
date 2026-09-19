const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerRecommandation, bilanRecommandationEstValide, bilanValiderRecommandation
} = require('../modules/bilan-candidature/modeles/recommandation.js');

function recommandationValide(champsSupp) {
  return bilanCreerRecommandation(Object.assign({
    contenu: 'Ajouter un resultat chiffre',
    dimensionsLiees: ['impact'],
    priorite: 'haute',
    observationsLiees: ['obsf-1']
  }, champsSupp || {}));
}

test('bilanCreerRecommandation : id genere si absent', () => {
  const recommandation = recommandationValide();
  assert.match(recommandation.id, /^reco-/);
});

test('bilanRecommandationEstValide : invariant 4, jamais orpheline (dimension)', () => {
  const recommandation = recommandationValide({ dimensionsLiees: [] });
  assert.equal(bilanRecommandationEstValide(recommandation), false);
});

test('bilanRecommandationEstValide : invariant 4, jamais orpheline (observation)', () => {
  const recommandation = recommandationValide({ observationsLiees: [] });
  assert.equal(bilanRecommandationEstValide(recommandation), false);
});

test('bilanRecommandationEstValide : priorite hors enumeration refusee', () => {
  const recommandation = recommandationValide({ priorite: 'urgentissime' });
  assert.equal(bilanRecommandationEstValide(recommandation), false);
});

test('bilanRecommandationEstValide : recommandation complete acceptee', () => {
  assert.equal(bilanRecommandationEstValide(recommandationValide()), true);
});

test('bilanValiderRecommandation : leve ReponseIncomplete sinon', () => {
  assert.throws(() => bilanValiderRecommandation(recommandationValide({ dimensionsLiees: [] })),
    (erreur) => erreur.code === 'ReponseIncomplete');
});
