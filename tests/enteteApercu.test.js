'use strict';
// REGLER L'EN-TETE SUR LE PETIT APERCU (modules/cv-pdf-html/cvPdfEnteteApercu.js) : les reglages d'un texte de l'en-tete se testent sans navigateur
// (les gestes et le panneau sont rejoues par l'essai navigateur « enteteApercu »).
const test = require('node:test');
const assert = require('node:assert');
const m = require('../modules/cv-pdf-html/cvPdfEnteteApercu.js');

const vide = () => ({ libre: true, modif: false, pos: {}, larg: {}, ech: {}, sty: {}, plan: {}, lig: {} });

test('taille : par pas, jamais sous 0,6 ni au-dela de 2,2', () => {
  const e = vide();
  m._enteteRegTaille(e, 'nom', 0.1); assert.strictEqual(e.ech.nom, 1.1);
  m._enteteRegTaille(e, 'nom', 0.1); assert.strictEqual(e.ech.nom, 1.2);
  for (let i = 0; i < 40; i++) { m._enteteRegTaille(e, 'nom', 0.1); }
  assert.strictEqual(e.ech.nom, 2.2);
  for (let i = 0; i < 60; i++) { m._enteteRegTaille(e, 'nom', -0.1); }
  assert.strictEqual(e.ech.nom, 0.6);
  m._enteteRegTaille(e, 'coord', 'abc'); assert.strictEqual(e.ech.coord, 1);
});

test('style : fusionne gras, italique, couleur et interligne sans effacer le reste', () => {
  const e = vide();
  m._enteteRegStyle(e, 'metier', { g: true });
  m._enteteRegStyle(e, 'metier', { c: '#ff0000' });
  m._enteteRegStyle(e, 'metier', { g: false });
  assert.deepStrictEqual(e.sty.metier, { g: false, c: '#ff0000' });
  assert.deepStrictEqual(e.sty.nom === undefined, true);
});

test('lignes : la valeur d\'office est effacee, une valeur inconnue est ignoree', () => {
  const e = vide();
  m._enteteRegLignes(e, 'nom', '2'); assert.deepStrictEqual(e.lig, { nom: '2' });
  m._enteteRegLignes(e, 'nom', '1'); assert.deepStrictEqual(e.lig, {});
  m._enteteRegLignes(e, 'coord', '1'); assert.deepStrictEqual(e.lig, { coord: '1' });
  m._enteteRegLignes(e, 'coord', '2'); assert.deepStrictEqual(e.lig, { coord: '2' });
  m._enteteRegLignes(e, 'coord', 'col'); assert.deepStrictEqual(e.lig, {});
  m._enteteRegLignes(e, 'coord', '3'); assert.deepStrictEqual(e.lig, {});
  m._enteteRegLignes(e, 'nom', 'col'); assert.deepStrictEqual(e.lig, {});     // « une par ligne » n'a pas de sens pour le nom
  m._enteteRegLignes(e, 'accroche', '2'); assert.deepStrictEqual(e.lig, {});  // l'accroche n'a pas ce choix
  const sans = { sty: {} };
  m._enteteRegLignes(sans, 'metier', '2'); assert.deepStrictEqual(sans.lig, { metier: '2' });
});

test('modif : vrai des qu\'un reglage a la main existe (lignes comprises), faux sinon', () => {
  assert.strictEqual(m._enteteRegModif(vide()), false);
  const a = vide(); a.lig.nom = '2'; assert.strictEqual(m._enteteRegModif(a), true);
  const b = vide(); b.haut = 150; assert.strictEqual(m._enteteRegModif(b), true);
  const c = vide(); c.pos.nom = { x: 4, y: 10 }; assert.strictEqual(m._enteteRegModif(c), true);
  assert.strictEqual(m._enteteRegModif({}), false);
});

test('remettre ce texte : efface seulement les reglages de ce bloc et recalcule « modif »', () => {
  const e = vide();
  e.pos = { nom: { x: 1, y: 2 }, metier: { x: 3, y: 4 } }; e.larg = { nom: 40 }; e.ech = { nom: 1.3 }; e.sty = { nom: { g: true } }; e.lig = { nom: '2', coord: '1' }; e.modif = true;
  m._enteteRegRemettre(e, 'nom');
  assert.deepStrictEqual(e.pos, { metier: { x: 3, y: 4 } });
  assert.deepStrictEqual(e.larg, {}); assert.deepStrictEqual(e.ech, {}); assert.deepStrictEqual(e.sty, {});
  assert.deepStrictEqual(e.lig, { coord: '1' });
  assert.strictEqual(e.modif, true);
  m._enteteRegRemettre(e, 'metier'); m._enteteRegRemettre(e, 'coord');
  assert.strictEqual(e.modif, false);
});
