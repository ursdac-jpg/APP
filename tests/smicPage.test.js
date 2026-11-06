// Page « Le Smic et l'inflation » de Comprendre les chiffres (consigne 117) : péremption et rendu.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
require('./_domStub').installerStubDom();

const M = require('../modules/comprendre-les-chiffres/index.js');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../modules/comprendre-les-chiffres/donnees/smic-inflation.json'), 'utf8'));

test('Péremption : le Smic reste affiché six mois, l\'inflation jusqu\'à la prochaine publication', () => {
  assert.deepEqual(M._comprendreLesChiffresSmicEtat(D, '2026-11-05'), { smicAJour: true, inflationAJour: true });
  assert.equal(M._comprendreLesChiffresSmicEtat(D, '2026-11-27').inflationAJour, false);
  assert.equal(M._comprendreLesChiffresSmicEtat(D, '2026-11-26').inflationAJour, true);
  assert.equal(M._comprendreLesChiffresSmicEtat(D, '2027-05-04').smicAJour, true);
  assert.equal(M._comprendreLesChiffresSmicEtat(D, '2027-05-05').smicAJour, false);
});

test('Formatage : virgule, espace insécable, jamais de point', () => {
  assert.equal(M._comprendreLesChiffresFormatEuros(1867.02), '1\u00a0867,02\u00a0€');
  assert.equal(M._comprendreLesChiffresFormatEuros(12.31), '12,31\u00a0€');
  assert.equal(M._comprendreLesChiffresFormatPourcent(3.4, 1), '3,4\u00a0%');
  assert.equal(M._comprendreLesChiffresFormatPourcent(2.41, 2), '2,41\u00a0%');
});

test('Cartes : chaque chiffre porte sa source, aucun tiret long, le vieux chiffre disparaît', () => {
  const smic = M._comprendreLesChiffresRenduCarteSmic(D, { smicAJour: true, inflationAJour: true });
  const infl = M._comprendreLesChiffresRenduCarteInflation(D, { smicAJour: true, inflationAJour: true });
  [smic, infl].forEach((h) => {
    const chiffres = h.match(/<span class="chiffre"/g) || [];
    const sources = h.match(/<span class="chiffre" data-source="[^"]+"/g) || [];
    assert.ok(chiffres.length >= 4);
    assert.equal(chiffres.length, sources.length);
    assert.ok(!/[\u2013\u2014]/.test(h));
  });
  assert.ok(smic.includes('12,31\u00a0€') && smic.includes('1\u00a0867,02\u00a0€') && smic.includes('2,41\u00a0%'));
  assert.ok(infl.includes('3,4\u00a0%') && infl.includes('Estimation provisoire'));
  const vieux = M._comprendreLesChiffresRenduCarteSmic(D, { smicAJour: false, inflationAJour: false });
  assert.ok(!vieux.includes('12,31') && vieux.includes('comprendre-les-chiffres-indic-absent') && vieux.includes('Ouvrir la page'));
  const vieuxI = M._comprendreLesChiffresRenduCarteInflation(D, { smicAJour: false, inflationAJour: false });
  assert.ok(!vieuxI.includes('3,4') && vieuxI.includes('Un nouveau chiffre est paru'));
});
