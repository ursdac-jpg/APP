const { test } = require('node:test');
const assert = require('node:assert/strict');

const { bilanElementAnonymiseMentionne, BILAN_ELEMENTS_ANONYMISES } = require('../modules/bilan-candidature/modeles/elementsAnonymises.js');

test('catalogue : chaque element concept+negation -> id detecte', () => {
  assert.equal(bilanElementAnonymiseMentionne('Le prénom du candidat est absent du document.'), 'nom');
  assert.equal(bilanElementAnonymiseMentionne('Aucune photo n\'est présente sur le CV.'), 'photo');
  assert.equal(bilanElementAnonymiseMentionne('Le numéro de téléphone est manquant.'), 'telephone');
  assert.equal(bilanElementAnonymiseMentionne('L\'adresse e-mail est manquante.'), 'email');
  assert.equal(bilanElementAnonymiseMentionne('L\'adresse postale du candidat est absente.'), 'adresse');
  assert.equal(bilanElementAnonymiseMentionne('Les coordonnées sont manquantes, difficile de le recontacter.'), 'coordonnees');
});

test('BILAN_ELEMENTS_ANONYMISES : couvre bien les 6 elements attendus', () => {
  const ids = BILAN_ELEMENTS_ANONYMISES.map((e) => e.id).sort();
  assert.deepEqual(ids, ['adresse', 'coordonnees', 'email', 'nom', 'photo', 'telephone'].sort());
});

test('concept seul, sans negation : aucune correspondance', () => {
  assert.equal(bilanElementAnonymiseMentionne('Le candidat a un beau parcours professionnel.'), null);
  assert.equal(bilanElementAnonymiseMentionne('La photo choisie est de bonne qualité.'), null);
});

test('negation seule, sans concept du catalogue : aucune correspondance', () => {
  assert.equal(bilanElementAnonymiseMentionne('Aucun résultat chiffré n\'est mentionné dans cette expérience.'), null);
});

test('texte non lié : aucune correspondance', () => {
  assert.equal(bilanElementAnonymiseMentionne('Bonne cohérence chronologique sur les 5 dernières années.'), null);
});

test('faux positif attendu absent : "coordonnées de l\'entreprise" sans negation ne matche pas', () => {
  assert.equal(bilanElementAnonymiseMentionne('Les coordonnées de l\'entreprise ciblée figurent dans l\'offre.'), null);
});

test('entree vide/non-chaine : aucune correspondance, pas d\'exception', () => {
  assert.equal(bilanElementAnonymiseMentionne(''), null);
  assert.equal(bilanElementAnonymiseMentionne(null), null);
  assert.equal(bilanElementAnonymiseMentionne(undefined), null);
  assert.equal(bilanElementAnonymiseMentionne(42), null);
});
