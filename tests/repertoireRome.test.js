// Répertoire élargi des métiers (data/repertoireRome.js, généré depuis le ROME 4.0 de France Travail) : cohérence avec les 21 domaines
// de l'application et forme des lignes. Le fichier est généré par scripts/construireRepertoireRome.js : ne jamais le modifier à la main.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..');
function charger(fichier, nomVariable) {
  return new Function(fs.readFileSync(path.join(racine, fichier), 'utf8') + '; return ' + nomVariable + ';')();
}
const R = charger('data/repertoireRome.js', 'REPERTOIRE_ROME');
const SECTEURS = charger('data/competencesSecteurs.js', 'COMPETENCES_SECTEURS');
const BASE = charger('data/metiers.js', 'baseMetiers');

test('les 21 domaines du répertoire élargi sont exactement ceux des compétences par secteur', () => {
  assert.deepStrictEqual(R.domaines.slice().sort(), Object.keys(SECTEURS).sort());
});

test('chaque ligne a un intitulé, un code ROME valide et un domaine existant', () => {
  assert.ok(R.metiers.length > 10000, 'répertoire trop petit : ' + R.metiers.length);
  R.metiers.forEach(function (l) {
    assert.strictEqual(l.length, 3);
    assert.ok(typeof l[0] === 'string' && l[0].trim().length >= 2, 'intitulé vide');
    assert.match(l[1], /^[A-N]\d{4}$/, 'code ROME invalide : ' + l[1]);
    assert.ok(Number.isInteger(l[2]) && l[2] >= 0 && l[2] < R.domaines.length, 'domaine invalide : ' + l[0]);
  });
});

test('aucun intitulé en double, aucun tiret cadratin ni demi-cadratin', () => {
  const vus = {};
  R.metiers.forEach(function (l) {
    const cle = l[0].toLowerCase();
    assert.ok(!vus[cle], 'doublon : ' + l[0]);
    vus[cle] = true;
    assert.ok(!/[–—]/.test(l[0]), 'tiret long : ' + l[0]);
  });
});

test('les 21 domaines reçoivent tous des métiers', () => {
  const compte = {};
  R.metiers.forEach(function (l) { compte[l[2]] = (compte[l[2]] || 0) + 1; });
  R.domaines.forEach(function (d, i) { assert.ok(compte[i] > 0, 'aucun métier pour : ' + d); });
});

test('la forme masculine est utilisée : plus de « Boucher / Bouchère » mais « Boucher »', () => {
  const noms = R.metiers.map(function (l) { return l[0]; });
  assert.ok(noms.indexOf('Boucher') !== -1);
  assert.ok(noms.indexOf('Abatteur de carrière') !== -1);
  assert.ok(R.metiers.filter(function (l) { return / \/ /.test(l[0]); }).length < 10);
});

test('les domaines des métiers de notre base cohabitent avec ceux du ROME (contrôle de bon sens)', () => {
  // Les métiers de notre base portent leur propre domaine ; on vérifie seulement que le répertoire contient des intitulés proches.
  const noms = R.metiers.map(function (l) { return l[0].toLowerCase(); });
  assert.ok(noms.some(function (n) { return n.indexOf('coiffeur') === 0; }));
  assert.ok(BASE.length > 100);
});
