const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du module "Mon Carnet". Ajoutee lors de l'audit de
// stabilisation du 2026-09-12 : ce module n'avait jusque-la aucune
// couverture Node, contrairement a ses voisins ATS/Regard recruteur.
const {
  _carnetExtraitPourTitre,
  _carnetConstruire,
  _carnetTexteValide,
  _carnetDateRelative
} = require('../modules/carnet/index.js');

test('extraitPourTitre : garde les premiers mots, espaces normalises', () => {
  const t = _carnetExtraitPourTitre('  Deux   mots  ');
  assert.equal(t, 'Deux mots');
});

test('extraitPourTitre : vide ou absent -> chaine vide', () => {
  assert.equal(_carnetExtraitPourTitre(''), '');
  assert.equal(_carnetExtraitPourTitre(undefined), '');
  assert.equal(_carnetExtraitPourTitre('   '), '');
});

test('texteValide : texte non vide (meme avec espaces autour) = valide', () => {
  assert.equal(_carnetTexteValide('un texte'), true);
  assert.equal(_carnetTexteValide('  x  '), true);
});

test('texteValide : vide, espaces seuls, absent = invalide', () => {
  assert.equal(_carnetTexteValide(''), false);
  assert.equal(_carnetTexteValide('   '), false);
  assert.equal(_carnetTexteValide(undefined), false);
  assert.equal(_carnetTexteValide(null), false);
});

test('construire : assemble id/horodatage/texte/titre, drapeaux a false au depart', () => {
  const n = _carnetConstruire('bonjour le monde');
  assert.equal(n.texte, 'bonjour le monde');
  assert.equal(n.titre, 'bonjour le monde');
  assert.equal(n.titreModifieManuel, false);
  assert.equal(n.dejaTransformeeEnRepere, false);
  assert.ok(n.id);
  assert.equal(typeof n.horodatage, 'number');
});

test('dateRelative : aujourd\'hui, hier, il y a N jours, il y a N mois', () => {
  const maintenant = Date.now();
  assert.equal(_carnetDateRelative(maintenant), "aujourd'hui");
  assert.equal(_carnetDateRelative(maintenant - 86400000), 'hier');
  assert.equal(_carnetDateRelative(maintenant - 3 * 86400000), 'il y a 3 jours');
  assert.equal(_carnetDateRelative(maintenant - 45 * 86400000), 'il y a 1 mois');
  assert.equal(_carnetDateRelative(maintenant - 90 * 86400000), 'il y a 3 mois');
});

test('dateRelative : horodatage invalide -> chaine vide, jamais d\'exception', () => {
  assert.equal(_carnetDateRelative(NaN), '');
  assert.equal(_carnetDateRelative('pas une date'), '');
});
