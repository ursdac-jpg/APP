'use strict';
// TEXTE A DEUX TONS (modules/cv-pdf-html/cvPdfTexteHors.js) : la lecture de la forme et le chemin de decoupe se testent sans navigateur.
const test = require('node:test');
const assert = require('node:assert');
const m = require('../modules/cv-pdf-html/cvPdfTexteHors.js');

test('forme en polygone : les pourcentages deviennent des pixels de la boite', () => {
  assert.strictEqual(m._texteHorsForme('polygon(0 0, 100% 0, 100% 74%, 0 100%)', 800, 200), 'M0 0L800 0L800 148L0 200Z');
  assert.strictEqual(m._texteHorsForme('polygon(0 0, 66% 0, 56% 100%, 0 100%)', 1000, 100), 'M0 0L660 0L560 100L0 100Z');
});
test('forme en rectangle (arrondi) : chemin avec arcs, rayons bornes par la boite', () => {
  assert.strictEqual(m._texteHorsForme('inset(0)', 100, 50), 'M0 0H100V50H0V0Z');
  const c = m._texteHorsForme('inset(8px 28px 6px round 16px)', 800, 200);
  assert.ok(/^M44 8H756A16 16 0 0 1 772 24V178A16 16 0 0 1 756 194H44A16 16 0 0 1 28 178V24A16 16 0 0 1 44 8Z$/.test(c), c);
  assert.ok(/A12 12/.test(m._texteHorsForme('inset(0 round 50px)', 24, 24)), 'rayon borne a la demi-boite');
  assert.ok(m._texteHorsForme('inset(0 round 0 0 26px 26px)', 800, 100).indexOf('A26 26 0 0 1 774 100') !== -1);
});
test('forme inconnue ou abimee : chemin vide, jamais d\'exception', () => {
  ['', 'none', 'circle(50%)', 'polygon(0 0, 10%)', null, undefined].forEach((x) => assert.strictEqual(m._texteHorsForme(x, 100, 100), ''));
  assert.strictEqual(m._texteHorsCheminComplement('circle(50%)', 100, 100), '');
});
test('découpe de la copie : un très grand rectangle moins la forme (règle evenodd)', () => {
  const c = m._texteHorsCheminComplement('polygon(0 0, 100% 0, 100% 74%, 0 100%)', 800, 200);
  assert.strictEqual(c, 'M-4000 -4000H8000V8000H-4000ZM0 0L800 0L800 148L0 200Z');
});

test('bord bas de la forme à une abscisse donnée (sert à garder la photo en médaillon sur le bord)', () => {
  const pointe = 'polygon(0 0, 100% 0, 100% 74%, 50% 100%, 0 74%)';
  assert.strictEqual(m._texteHorsBordBas(pointe, 200, 100, 100), 100);
  assert.strictEqual(m._texteHorsBordBas(pointe, 200, 100, 0), 74);
  assert.ok(Math.abs(m._texteHorsBordBas(pointe, 200, 100, 10) - 76.6) < 0.01);
  assert.strictEqual(m._texteHorsBordBas('inset(8px 28px 6px round 16px)', 800, 200, 100), 194);
  assert.strictEqual(m._texteHorsBordBas('circle(5%)', 100, 100, 50), -1);
});
