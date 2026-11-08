// Encadré « métiers qui recrutent le plus » (enquête BMO) de Comprendre les chiffres : péremption, rendu, données.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
require('./_domStub').installerStubDom();

const M = require('../modules/comprendre-les-chiffres/index.js');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../modules/comprendre-les-chiffres/donnees/bmo-metiers.json'), 'utf8'));
const { topMetiers } = require('../scripts/genereBmoMetiers.js');

test('Péremption : la liste reste affichée treize mois après la publication de l\'enquête', () => {
  assert.equal(M._comprendreLesChiffresBmoEtat(D, '2026-11-05').aJour, true);
  assert.equal(M._comprendreLesChiffresBmoEtat(D, '2027-05-20').aJour, true);
  assert.equal(M._comprendreLesChiffresBmoEtat(D, '2027-05-21').aJour, false);
  assert.equal(M._comprendreLesChiffresBmoEtat({ publie_le: 'n\'importe quoi' }, '2026-11-05').aJour, false);
});

test('Données : dix métiers par département, triés, saisonniers jamais au-dessus du total', () => {
  ['24', '87'].forEach((dep) => {
    const l = D.departements[dep].metiers;
    assert.equal(l.length, 10);
    for (let i = 1; i < l.length; i++) { assert.ok(l[i - 1].met >= l[i].met); }
    l.forEach((o) => { assert.ok(o.s >= 0 && o.s <= o.met); });
  });
});

test('Calcul : les nombres masqués sont ignorés, les métiers de même nom sont additionnés', () => {
  const lignes = [
    ['1', 'Maçons', '24', 'a', 'A', 10, null, 4],
    ['1', 'Maçons', '24', 'b', 'B', 5, null, null],
    ['1', 'Maçons', '24', 'c', 'C', null, null, 3],
    ['2', 'Aides-soignants', '24', 'a', 'A', 12, null, 0],
    ['1', 'Maçons', '87', 'a', 'A', 99, null, 99]
  ];
  assert.deepEqual(topMetiers(lignes, '24', 10), [{ nom: 'Maçons', met: 15, s: 4 }, { nom: 'Aides-soignants', met: 12, s: 0 }]);
});

test('Carte : chaque chiffre porte sa source, « au moins », aucun tiret long, message sans chiffre si périmée', () => {
  const h = M._comprendreLesChiffresRenduCarteBmo(D, { aJour: true }, '24');
  const chiffres = h.match(/<span class="chiffre"/g) || [];
  const sources = h.match(/<span class="chiffre" data-source="[^"]*enquête Besoins en main-d’œuvre 2026, Dordogne, publiée en avril 2026"/g) || [];
  assert.equal(chiffres.length, 21, '20 chiffres dans la liste + le chiffre principal de la carte');
  assert.ok(h.includes('comprendre-les-chiffres-indic-valeur'), 'chiffre principal : sans lui, pas de bouton « Ma fiche de chiffres »');
  assert.equal(chiffres.length, sources.length);
  assert.ok(h.includes('Au moins '));
  assert.ok(h.includes('data-comprendre-les-chiffres-fiche-lexique="besoins-en-main-d-oeuvre"'));
  assert.ok(h.includes('data-signaler-probleme'));
  assert.ok(!/[–—]/.test(h));
  const h87 = M._comprendreLesChiffresRenduCarteBmo(D, { aJour: true }, '87');
  assert.ok(h87.includes('Haute-Vienne') && h87.includes('<button type="button" class="actif" data-comprendre-les-chiffres-bmo-dep="87">'));
  const vieux = M._comprendreLesChiffresRenduCarteBmo(D, { aJour: false }, '24');
  assert.ok(!/class="chiffre"/.test(vieux) && !/Au moins/.test(vieux));
  assert.ok(vieux.includes('comprendre-les-chiffres-indic-absent') && vieux.includes('datent de plus d’un an'));
});
