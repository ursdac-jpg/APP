const { test } = require('node:test');
const assert = require('node:assert/strict');
require('./_domStub').installerStubDom();
const { signatureExpPersoEtEngagements } = require('../js/app.js');

test('signatureExpPersoEtEngagements : dossier vide', () => {
  assert.equal(signatureExpPersoEtEngagements({}), '');
});

test('signatureExpPersoEtEngagements : experiencesPerso seules', () => {
  const d = { experiencesPerso: [{ intitule: 'Benevolat', detail: 'Banque alimentaire', missions: 'Distribution' }] };
  assert.equal(signatureExpPersoEtEngagements(d), 'Benevolat|Banque alimentaire|Distribution');
});

test('signatureExpPersoEtEngagements : engagements en chaines ET en objets', () => {
  const d = {
    engagements: ['Pompier volontaire', { texte: 'Delegue de classe', missions: 'Organisation de sorties' }]
  };
  assert.equal(signatureExpPersoEtEngagements(d), 'Pompier volontaire~~Delegue de classe|Organisation de sorties');
});

test('signatureExpPersoEtEngagements : combine experiencesPerso et engagements, jamais reordonne', () => {
  const d = {
    experiencesPerso: [{ intitule: 'A', detail: '', missions: '' }],
    engagements: ['B']
  };
  assert.equal(signatureExpPersoEtEngagements(d), 'A||~~B');
});

test('signatureExpPersoEtEngagements : deux appels avec le meme contenu donnent la meme signature', () => {
  const d1 = { experiencesPerso: [{ intitule: 'X', detail: 'Y', missions: 'Z' }], engagements: ['E'] };
  const d2 = { experiencesPerso: [{ intitule: 'X', detail: 'Y', missions: 'Z' }], engagements: ['E'] };
  assert.equal(signatureExpPersoEtEngagements(d1), signatureExpPersoEtEngagements(d2));
});
