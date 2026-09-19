const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerDefinitionAxe, bilanDefinitionAxeEstValide, bilanValiderDefinitionAxe, bilanAxeAutorisePrioritaire
} = require('../modules/bilan-candidature/modeles/axe.js');

test('bilanCreerDefinitionAxe : plafonneA absent par defaut', () => {
  const axe = bilanCreerDefinitionAxe({ id: 'adequation', nom: 'Adequation avec le poste', poids: 'determinant', niveauMinimum: 2 });
  assert.equal(axe.plafonneA, null);
});

test('bilanDefinitionAxeEstValide : poids hors enumeration refuse', () => {
  const axe = bilanCreerDefinitionAxe({ id: 'x', nom: 'X', poids: 'inexistant', niveauMinimum: 1 });
  assert.equal(bilanDefinitionAxeEstValide(axe), false);
});

test('bilanDefinitionAxeEstValide : plafonneA interdit sur un axe determinant/differenciateur', () => {
  const axe = bilanCreerDefinitionAxe({ id: 'credibilite', nom: 'Credibilite', poids: 'determinant', niveauMinimum: 1, plafonneA: 'a_renforcer' });
  assert.equal(bilanDefinitionAxeEstValide(axe), false);
});

test('bilanDefinitionAxeEstValide : plafonneA autorise sur un axe amplificateur', () => {
  const axe = bilanCreerDefinitionAxe({ id: 'differenciation', nom: 'Differenciation', poids: 'amplificateur', niveauMinimum: 1, plafonneA: 'a_renforcer' });
  assert.equal(bilanDefinitionAxeEstValide(axe), true);
});

test('bilanValiderDefinitionAxe : leve ReferenceInconnue si mal formee', () => {
  assert.throws(() => bilanValiderDefinitionAxe(bilanCreerDefinitionAxe({ id: 'x', nom: 'X', poids: 'determinant', niveauMinimum: 9 })),
    (erreur) => erreur.code === 'ReferenceInconnue');
});

test('bilanAxeAutorisePrioritaire : faux pour un axe plafonne, vrai sinon', () => {
  const plafonne = bilanCreerDefinitionAxe({ id: 'posture', nom: 'Posture', poids: 'amplificateur', niveauMinimum: 1, plafonneA: 'a_renforcer' });
  const determinant = bilanCreerDefinitionAxe({ id: 'risques', nom: 'Risques', poids: 'determinant', niveauMinimum: 1 });
  assert.equal(bilanAxeAutorisePrioritaire(plafonne), false);
  assert.equal(bilanAxeAutorisePrioritaire(determinant), true);
});
