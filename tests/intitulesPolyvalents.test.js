const { test } = require('node:test');
const assert = require('node:assert/strict');

// Intitulés de poste proposés pour « plusieurs métiers d'un même domaine » (étape c5 du chantier lettre).
// Listes validées par Denis le 24/10/2026 : docs/INTITULES_PAR_DOMAINE_2026-10-23.md.
const { SECTEURS_DETAIL, intitulesPolyvalentsDuDomaine } = require('../data/secteurs.js');

test('chaque domaine a ses intitulés, sans doublon exact, de 4 à 7', () => {
  assert.equal(SECTEURS_DETAIL.length, 21);
  SECTEURS_DETAIL.forEach((s) => {
    assert.ok(Array.isArray(s.intitulesPolyvalents), 'pas de liste pour ' + s.cle);
    const n = s.intitulesPolyvalents.length;
    assert.ok(n >= 4 && n <= 7, s.cle + ' : ' + n + ' intitulés');
    assert.equal(new Set(s.intitulesPolyvalents.map((i) => i.toLowerCase())).size, n, 'doublon dans ' + s.cle);
  });
});

test('aucun intitulé « selon formation, diplôme ou permis » ni tiret long', () => {
  SECTEURS_DETAIL.forEach((s) => s.intitulesPolyvalents.forEach((i) => {
    assert.ok(!/selon|\(/i.test(i), 'mention conditionnelle dans « ' + i + ' »');
    assert.ok(!/[–—]/.test(i), 'tiret long dans « ' + i + ' »');
    assert.ok(i === i.trim() && i.length > 3, 'intitulé mal formé : « ' + i + ' »');
  }));
});

test('un intitulé n\'est proposé que dans un seul domaine', () => {
  const vus = {};
  SECTEURS_DETAIL.forEach((s) => s.intitulesPolyvalents.forEach((i) => {
    const cle = i.toLowerCase();
    assert.ok(!vus[cle], '« ' + i + ' » est dans ' + vus[cle] + ' et ' + s.cle);
    vus[cle] = s.cle;
  }));
});

test('intitulesPolyvalentsDuDomaine : par libellé, copie, vide si inconnu', () => {
  const l = intitulesPolyvalentsDuDomaine('Bâtiment et travaux publics');
  assert.ok(l.includes('Ouvrier polyvalent du bâtiment'));
  assert.ok(!l.includes('Manœuvre BTP'));
  l.push('x');
  assert.ok(!intitulesPolyvalentsDuDomaine('Bâtiment et travaux publics').includes('x'));
  assert.deepEqual(intitulesPolyvalentsDuDomaine('Domaine inexistant'), []);
});
