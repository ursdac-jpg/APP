const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerObservationFactuelle, bilanCreerObservationArgumentee,
  bilanGenererIdObservationArgumentee, bilanObservationEstValide, bilanValiderObservation
} = require('../modules/bilan-candidature/modeles/observation.js');

test('bilanCreerObservationFactuelle : origine et forme correctes', () => {
  const observation = bilanCreerObservationFactuelle({ contenu: 'CV de 2 pages', categorie: 'structure' });
  assert.equal(observation.origine, 'factuelle');
  assert.equal(observation.axeLie, null);
  assert.equal(observation.contenu, 'CV de 2 pages');
});

test('bilanGenererIdObservationArgumentee : deterministe (memes entrees => meme id)', () => {
  assert.equal(bilanGenererIdObservationArgumentee('adequation', 0), bilanGenererIdObservationArgumentee('adequation', 0));
  assert.notEqual(bilanGenererIdObservationArgumentee('adequation', 0), bilanGenererIdObservationArgumentee('adequation', 1));
  assert.equal(bilanGenererIdObservationArgumentee('adequation', 2), 'adequation-obs-2');
});

test('bilanCreerObservationArgumentee : id genere si absent, referme le manque du Prompt 1 V2', () => {
  const observation = bilanCreerObservationArgumentee({ contenu: 'Peu de resultats chiffres', axeLie: 'impact', observationsFactuellesLiees: ['obsf-1'] }, 1);
  assert.equal(observation.id, 'impact-obs-1');
  assert.equal(observation.origine, 'argumentee');
});

test('bilanObservationEstValide : argumentee sans axeLie est invalide', () => {
  const observation = bilanCreerObservationArgumentee({ contenu: 'texte', axeLie: null }, 0);
  assert.equal(bilanObservationEstValide(observation), false);
});

test('bilanValiderObservation : leve ReponseIncomplete si mal formee', () => {
  assert.throws(() => bilanValiderObservation({ id: 'x', origine: 'argumentee', contenu: 'texte', axeLie: null }),
    (erreur) => erreur.code === 'ReponseIncomplete');
});
