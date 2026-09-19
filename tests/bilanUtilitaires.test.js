const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanGenererId, bilanCalculerHashContenu, bilanCreerErreurMetier, bilanEstErreurMetier,
  bilanAssainirTypographie, bilanAssainirTypographieProfond
} = require('../modules/bilan-candidature/modeles/utilitaires.js');

test('bilanGenererId : prefixe respecte, jamais deux id identiques', () => {
  const id1 = bilanGenererId('obs');
  const id2 = bilanGenererId('obs');
  assert.match(id1, /^obs-/);
  assert.notEqual(id1, id2);
});

test('bilanCalculerHashContenu : deterministe (memes valeurs => meme hash)', () => {
  const h1 = bilanCalculerHashContenu(['a', 'b', null]);
  const h2 = bilanCalculerHashContenu(['a', 'b', null]);
  assert.equal(h1, h2);
});

test('bilanCalculerHashContenu : change si une valeur change', () => {
  const h1 = bilanCalculerHashContenu(['a', 'b']);
  const h2 = bilanCalculerHashContenu(['a', 'c']);
  assert.notEqual(h1, h2);
});

test('bilanCreerErreurMetier : vraie instance d\'Error, avec code et details', () => {
  const erreur = bilanCreerErreurMetier('CandidatureInvalide', 'CV vide', { candidatureId: 'x' });
  assert.equal(erreur instanceof Error, true);
  assert.equal(erreur.code, 'CandidatureInvalide');
  assert.equal(erreur.message, 'CV vide');
  assert.deepEqual(erreur.details, { candidatureId: 'x' });
});

test('bilanEstErreurMetier : distingue le code attendu du reste', () => {
  const erreur = bilanCreerErreurMetier('RelectureAnnulee', 'annule');
  assert.equal(bilanEstErreurMetier(erreur, 'RelectureAnnulee'), true);
  assert.equal(bilanEstErreurMetier(erreur, 'CandidatureInvalide'), false);
  assert.equal(bilanEstErreurMetier(null, 'RelectureAnnulee'), false);
});

test('bilanAssainirTypographie : tiret cadratin/demi-cadratin -> tiret court espace', () => {
  assert.equal(bilanAssainirTypographie('un point fort — a valoriser'), 'un point fort - a valoriser');
  assert.equal(bilanAssainirTypographie('un point fort – a valoriser'), 'un point fort - a valoriser');
  assert.equal(bilanAssainirTypographie('un point—fort'), 'un point - fort');
});

test('bilanAssainirTypographie : bord de chaine et ponctuation collee resserres', () => {
  assert.equal(bilanAssainirTypographie('— Attention au ton'), 'Attention au ton');
  assert.equal(bilanAssainirTypographie('Le CV est clair —.'), 'Le CV est clair.');
});

test('bilanAssainirTypographie : trait d\'union conditionnel invisible supprime', () => {
  assert.equal(bilanAssainirTypographie('déve­loppe­ment'), 'développement');
});

test('bilanAssainirTypographie : texte sans tiret long inchange, non-chaine inchangee', () => {
  assert.equal(bilanAssainirTypographie('Un CV bien construit, clair et sobre.'), 'Un CV bien construit, clair et sobre.');
  assert.equal(bilanAssainirTypographie(42), 42);
  assert.equal(bilanAssainirTypographie(null), null);
});

test('bilanAssainirTypographieProfond : recursif sur objet/tableau, forme inchangee', () => {
  const entree = {
    resume: 'Bon profil — a etayer',
    axes: [{ points: ['clair', 'concis — parfois trop'] }],
    n: 3
  };
  const sortie = bilanAssainirTypographieProfond(entree);
  assert.equal(sortie.resume, 'Bon profil - a etayer');
  assert.equal(sortie.axes[0].points[1], 'concis - parfois trop');
  assert.equal(sortie.n, 3);
});
