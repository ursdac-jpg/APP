const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Consigne 147, C8 : les chapitres d'une fiche du Lexique sont des boutons de couleur,
// regroupés en 5 familles. Ce test garantit qu'aucun chapitre n'est oublié (sinon il
// prendrait la couleur par défaut sans qu'on le voie) et que chaque couleur existe en CSS.
const { normaliserTexte } = require('../data/metiers.js');
global.normaliserTexte = normaliserTexte;
const lex = require('../modules/lexique/index.js');

test('chaque chapitre (univers) du Lexique a une famille de couleur', () => {
  const manquants = Object.keys(lex._LEXIQUE_LIBELLES_UNIVERS).filter((u) => !lex._LEXIQUE_FAMILLE_UNIVERS[u]);
  assert.deepEqual(manquants, []);
});

test('la table des familles ne cite aucun chapitre inconnu et reste dans 1 à 5', () => {
  for (const [u, f] of Object.entries(lex._LEXIQUE_FAMILLE_UNIVERS)) {
    assert.ok(lex._LEXIQUE_LIBELLES_UNIVERS[u], 'chapitre inconnu : ' + u);
    assert.ok(f >= 1 && f <= 5, 'famille hors limites pour ' + u);
  }
});

test('la classe d\'un chapitre inconnu retombe sur la famille 4 sans planter', () => {
  assert.equal(lex._lexiqueClasseChapitre('inconnu'), 'chapitre-lexique chapitre-lexique-4');
  assert.equal(lex._lexiqueClasseChapitre('formation'), 'chapitre-lexique chapitre-lexique-4');
});

test('le CSS définit les 5 familles, le registre, et leurs valeurs en mode sombre et daltonien', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'modules', 'lexique', 'lexique.css'), 'utf8');
  for (let n = 1; n <= 5; n++) {
    assert.ok(css.includes('.chapitre-lexique-' + n + ' '), 'classe famille ' + n);
    const re = new RegExp('--chap-' + n + ':', 'g');
    assert.ok((css.match(re) || []).length >= 4, 'famille ' + n + ' : clair, sombre, daltonien, sombre+daltonien');
  }
  assert.ok(css.includes('.chapitre-lexique-registre'));
});
