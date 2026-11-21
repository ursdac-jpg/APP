const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { construireNoms, lireFiches, nomsDeMetiers, NB_NOMS } = require('../scripts/importRome/genererNomsEmploi.js');
const { NOMS_EMPLOI } = require('../data/rome/nomsEmploi.js');
const { pmcNomsEmploi } = require('../modules/comprendre-les-metiers/parMetierCalcul.js');
const { pmdDonnees } = require('../modules/comprendre-les-metiers/parMetierDonnees.js');

// Noms d'emploi des cartes de métiers (consigne 498) : data/rome/nomsEmploi.js est calculé à partir des fiches du ROME, jamais écrit à la main.
const fiches = lireFiches();

test('le fichier des noms d’emploi correspond exactement aux fiches : sinon relancer node scripts/importRome/genererNomsEmploi.js', () => {
  assert.deepEqual(NOMS_EMPLOI, construireNoms(fiches, nomsDeMetiers(), pmcNomsEmploi));
});

test('trois noms au plus par métier, le total est juste, jamais le nom du métier lui-même, jamais de doublon, aucun tiret long', () => {
  const noms = nomsDeMetiers();
  Object.keys(NOMS_EMPLOI).forEach((code) => {
    const [liste, total] = NOMS_EMPLOI[code];
    assert.ok(liste.length >= 1 && liste.length <= NB_NOMS, code + ' : ' + liste.length + ' noms');
    assert.ok(total >= liste.length, code + ' : total trop petit');
    assert.equal(new Set(liste.map((x) => x.toLowerCase())).size, liste.length, code + ' : doublon');
    liste.forEach((n) => {
      assert.notEqual(n.toLowerCase(), String(noms[code] || '').toLowerCase(), code + ' : répète le nom du métier');
      assert.ok(!/[–—]/.test(n), code + ' : tiret long');
    });
  });
  assert.ok(Object.keys(NOMS_EMPLOI).length > 1600);
});

test('les données du module portent les noms, et un code sans autre nom n’a pas de ligne', () => {
  const D = pmdDonnees();
  assert.equal(D.aNoms, true);
  const i = D.m.findIndex((r) => r.code === 'K1303');
  assert.deepEqual(D.noms[D.m[i].code][0], ['Baby-sitter', 'Garde d’enfant à domicile', 'Gouvernant d’enfant à domicile']);
  assert.ok(D.m.some((r) => !D.noms[r.code]), 'il existe des métiers sans autre nom');
});

test('la ligne « Aussi appelé » : trois noms puis « (et N autres) », rien sans autre nom, noms échappés', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', 'parMetierFiche.js'), 'utf8');
  const debut = src.indexOf('function _pmfLigneNoms'), fin = src.indexOf('function _pmfCarteSimple');
  assert.ok(debut > 0 && fin > debut);
  const ligne = new Function('_pmfE', src.slice(debut, fin) + '; return _pmfLigneNoms;')((t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'));
  const D = { noms: { X1: [['A', 'B & C', 'D'], 6], X2: [['E', 'F'], 2], X3: [['G'], 3] } };
  assert.equal(ligne(D, { code: 'X0' }), '', 'pas de ligne sans autre nom');
  assert.match(ligne(D, { code: 'X1' }), /Aussi appelé :<\/span> A ; B &amp; C ; D <span class="plus">\(et 3 autres\)<\/span>/);
  assert.ok(!/\(et /.test(ligne(D, { code: 'X2' })), 'aucun « et N autres » quand tous les noms sont montrés');
  assert.match(ligne(D, { code: 'X3' }), /\(et 2 autres\)/);
  assert.match(ligne({ noms: { X4: [['A'], 2] } }, { code: 'X4' }), /\(et 1 autre\)/);
});

test('le chargeur du module demande le fichier des noms après l’index, sans en faire une condition', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', 'parMetierEcran.js'), 'utf8');
  assert.match(src, /data\/rome\/nomsEmploi\.js', function \(\) \{ fin\(true\); \}/);
});
