// data/lettresRiasecRome.js est GÉNÉRÉ depuis les fiches du ROME (node scripts/importRome/extraireLettresRiasec.js) : ce test échoue
// si les fiches ont changé sans que le petit fichier soit régénéré, ou si un code de la base n'a pas ses lettres.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { lireLettres } = require('../scripts/importRome/extraireLettresRiasec.js');
const { LETTRES_RIASEC_ROME } = require('../data/lettresRiasecRome.js');
const { baseMetiers } = require('../data/metiers.js');

test('lettres RIASEC : le petit fichier est identique à ce que contiennent les 14 fiches du ROME', () => {
  const attendues = lireLettres(path.join(__dirname, '..'));
  assert.deepEqual(LETTRES_RIASEC_ROME, attendues, 'relancer : node scripts/importRome/extraireLettresRiasec.js');
});

test('lettres RIASEC : 1 923 codes, une ou deux lettres RIASEC chacun, et toute fiche de la base a ses lettres', () => {
  const codes = Object.keys(LETTRES_RIASEC_ROME);
  assert.equal(codes.length, 1923);
  codes.forEach((c) => assert.match(LETTRES_RIASEC_ROME[c], /^[RIASEC]{1,2}$/, c));
  const sans = baseMetiers.filter((m) => !LETTRES_RIASEC_ROME[m.rome]).map((m) => m.nom);
  assert.deepEqual(sans, [], 'fiches sans lettres');
});
