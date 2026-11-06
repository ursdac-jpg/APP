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
test('degrade vertical simple : la couleur exacte a une hauteur donnee (haut, milieu, bas, sens inverse)', () => {
  const g = 'linear-gradient(rgb(61, 107, 44), rgb(127, 174, 63))';
  assert.strictEqual(m._lisibiliteDegradeA(g, 0), 'rgb(61, 107, 44)');
  assert.strictEqual(m._lisibiliteDegradeA(g, 1), 'rgb(127, 174, 63)');
  assert.strictEqual(m._lisibiliteDegradeA(g, 0.5), 'rgb(94, 141, 54)');
  assert.strictEqual(m._lisibiliteDegradeA('linear-gradient(0deg, rgb(61, 107, 44), rgb(127, 174, 63))', 0), 'rgb(127, 174, 63)');
  assert.strictEqual(m._lisibiliteDegradeA(g, 2), 'rgb(127, 174, 63)');
});
test('degrade qui n\'est pas vertical a deux couleurs : on ne devine pas', () => {
  assert.strictEqual(m._lisibiliteDegradeA('linear-gradient(90deg, rgb(1, 2, 3), rgb(4, 5, 6))', 0.5), '');
  assert.strictEqual(m._lisibiliteDegradeA('linear-gradient(rgb(1, 2, 3), rgb(4, 5, 6), rgb(7, 8, 9))', 0.5), '');
  assert.strictEqual(m._lisibiliteDegradeA('linear-gradient(rgb(1, 2, 3) 20%, rgb(4, 5, 6))', 0.5), '');
  assert.strictEqual(m._lisibiliteDegradeA('none', 0.5), '');
});
test('texte de la couleur du haut du degrade : illisible au milieu, la decision le corrige quand on lui donne la couleur exacte', () => {
  const texte = '#3d6b2c', milieu = '#5e8d36';
  assert.strictEqual(m._lisibiliteDecision(texte, ['#3d6b2c', '#7fae3f']), '');   // les deux bouts : lisible sur le bas, donc rien (cas prudent d'avant)
  assert.notStrictEqual(m._lisibiliteDecision(texte, [milieu]), '');               // la couleur reelle du milieu : le texte est corrige
});
