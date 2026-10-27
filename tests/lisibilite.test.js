'use strict';
// GARDE-FOU DE LISIBILITE (modules/cv-pdf-html/cvPdfLisibilite.js) : la decision, la forme et le degrade se testent sans navigateur.
// Ce que garantit ce test : un texte deja lisible n'est JAMAIS touche ; un texte illisible passe au blanc ou au sombre selon le fond ; en cas de doute (lisible quelque part, remede qui ne
// ferait pas mieux), on ne change rien.
const test = require('node:test');
const assert = require('node:assert');
const m = require('../modules/cv-pdf-html/cvPdfLisibilite.js');
const c = require('../modules/cv-pdf-html/cvPdfCompositions.js');

test('texte deja lisible : rien a faire', () => {
  assert.strictEqual(m._lisibiliteDecision('#ffffff', ['#1f2a44']), '');
  assert.strictEqual(m._lisibiliteDecision('#1b1b1b', ['#ffffff']), '');
  assert.strictEqual(m._lisibiliteDecision('#ffffff', ['#2f6690']), '');
});
test('blanc sur fond pale : le texte devient sombre ; sombre sur fond marine : il devient blanc', () => {
  assert.strictEqual(m._lisibiliteDecision('#ffffff', ['#e2eaef']), '#1b1b1b');
  assert.strictEqual(m._lisibiliteDecision('#ffffff', ['#ffffff']), '#1b1b1b');
  assert.strictEqual(m._lisibiliteDecision('#1b1b1b', ['#1f2a44']), '#ffffff');
  assert.strictEqual(m._lisibiliteDecision('#1f2a44', ['#1f2a44']), '#ffffff');
});
test('gris moyen sur le bleu de la colonne : le texte devient blanc', () => {
  assert.strictEqual(m._lisibiliteDecision('#7a8696', ['#2f6690']), '#ffffff');
});
test('lisible sur l\'un des fonds d\'un degrade : on ne touche pas (le texte peut etre a cheval)', () => {
  assert.strictEqual(m._lisibiliteDecision('#ffffff', ['#ffffff', '#1f2a44']), '');
});
test('degrade entierement clair ou entierement fonce : une seule couleur de remede', () => {
  assert.strictEqual(m._lisibiliteDecision('#ffffff', ['#f2f2f2', '#dde4f0']), '#1b1b1b');
  assert.strictEqual(m._lisibiliteDecision('#1b1b1b', ['#1f2a44', '#101a30']), '#ffffff');
});
test('donnees absentes ou abimees : jamais d\'exception, rien a faire', () => {
  assert.strictEqual(m._lisibiliteDecision('', ['#ffffff']), '');
  assert.strictEqual(m._lisibiliteDecision('#ffffff', []), '');
  assert.strictEqual(m._lisibiliteDecision('#ffffff', null), '');
});
test('la couleur posee se lit mieux que l\'ancienne sur tous les fonds (contraste >= 4,5 sur les cas courants)', () => {
  [['#ffffff', '#e2eaef'], ['#1b1b1b', '#1f2a44'], ['#7a8696', '#2f6690']].forEach(([t, f]) => {
    const r = m._lisibiliteDecision(t, [f]);
    assert.ok(r && c._compoContraste(r, f) >= 4.5, t + ' sur ' + f + ' -> ' + r);
  });
});
test('forme en polygone : dedans et dehors ; autre forme : la boite entiere', () => {
  const tri = 'polygon(0 0, 100% 0, 0 100%)';
  assert.strictEqual(m._lisibiliteDansForme(tri, 100, 100, 10, 10), true);
  assert.strictEqual(m._lisibiliteDansForme(tri, 100, 100, 90, 90), false);
  assert.strictEqual(m._lisibiliteDansForme('inset(0)', 100, 100, 90, 90), true);
  assert.strictEqual(m._lisibiliteDansForme('none', 100, 100, 50, 50), true);
  assert.strictEqual(m._lisibiliteDansForme(tri, 100, 100, 150, 10), false, 'hors de la boite');
});
test('degrade : les couleurs unies sont lues, tout le reste est ignore', () => {
  assert.deepStrictEqual(m._lisibiliteCouleursDegrade('linear-gradient(180deg, rgb(31, 42, 68), rgb(47, 102, 144))'), ['rgb(31, 42, 68)', 'rgb(47, 102, 144)']);
  assert.deepStrictEqual(m._lisibiliteCouleursDegrade('none'), []);
  assert.deepStrictEqual(m._lisibiliteCouleursDegrade('url("x.png")'), []);
});
