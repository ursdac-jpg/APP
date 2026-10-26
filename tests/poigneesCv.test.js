'use strict';
// POIGNEES RONDES de l'apercu (modules/cv-pdf-html/cvPdfPoigneesCv.js) : les limites se testent sans navigateur (le geste lui-meme est rejoue par l'essai navigateur « poigneesCv »).
const test = require('node:test');
const assert = require('node:assert');
const m = require('../modules/cv-pdf-html/cvPdfPoigneesCv.js');

test('hauteur du bandeau : jamais sous le contenu, jamais au-dela du maximum, entiere', () => {
  assert.strictEqual(m._poigneesCvLimiterHauteur(50, 120), 120);
  assert.strictEqual(m._poigneesCvLimiterHauteur(999, 120), 420);
  assert.strictEqual(m._poigneesCvLimiterHauteur(200.4, 120), 200);
  assert.strictEqual(m._poigneesCvLimiterHauteur('abc', 130), 130);
  assert.strictEqual(m._poigneesCvLimiterHauteur(NaN, undefined), 0);
});

test('largeur de la colonne : par pas de 5, entre 30 et 70, jamais NaN', () => {
  assert.strictEqual(m._poigneesCvPourcentLargeur(35, 0, 700), 35);
  assert.strictEqual(m._poigneesCvPourcentLargeur(35, 70, 700), 45);
  assert.strictEqual(m._poigneesCvPourcentLargeur(35, 36, 700), 40);
  assert.strictEqual(m._poigneesCvPourcentLargeur(35, -1000, 700), 30);
  assert.strictEqual(m._poigneesCvPourcentLargeur(35, 1000, 700), 70);
  assert.strictEqual(m._poigneesCvPourcentLargeur('x', 20, 0), 35);
  assert.strictEqual(m._poigneesCvPourcentLargeur(35, 'a', 700), 35);
});
