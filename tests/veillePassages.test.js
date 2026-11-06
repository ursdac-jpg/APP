const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { creerPassages } = require('../outils/veillePassages.js');

function neuf() {
  const racine = fs.mkdtempSync(path.join(os.tmpdir(), 'passages-'));
  fs.mkdirSync(path.join(racine, 'outils'));
  return { racine, p: creerPassages(racine, { maintenant: () => '2026-10-31T10:00:00Z' }) };
}

test('passages : sans fichier, la lecture rend une liste vide', () => {
  const { p } = neuf();
  assert.deepStrictEqual(p.lire(), { ok: true, passages: {} });
});

test('passages : une date est notée, la plus récente gagne, une date plus ancienne ne fait jamais reculer', () => {
  const { p } = neuf();
  assert.strictEqual(p.noter({ passages: { veille: '2026-10-20', 'rayon:etranger': '2026-10-01' } }).notes, 2);
  assert.strictEqual(p.noter({ passages: { veille: '2026-10-10' } }).notes, 0);
  assert.strictEqual(p.noter({ passages: { veille: '2026-10-30' } }).passages.veille, '2026-10-30');
  assert.deepStrictEqual(p.lire().passages, { 'rayon:etranger': '2026-10-01', veille: '2026-10-30' });
  assert.match(fs.readFileSync(p.fichier, 'utf8'), /\n$/);
});

test('passages : clé ou date invalide, date lointaine dans le futur = ignorées', () => {
  const { p } = neuf();
  const r = p.noter({ passages: { 'Veille!': '2026-10-20', mois: '2026-13-40', reseau: 'hier', chiffres: '2027-05-01', lexique: '2026-11-01', manuel: '2026-10-31' } });
  assert.deepStrictEqual(Object.keys(r.passages).sort(), ['lexique', 'manuel']);
});

test('passages : un fichier illisible n\'est jamais écrasé', () => {
  const { p } = neuf();
  fs.writeFileSync(p.fichier, '{ pas du json');
  const r = p.noter({ passages: { veille: '2026-10-20' } });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(fs.readFileSync(p.fichier, 'utf8'), '{ pas du json');
  assert.strictEqual(p.lire().ok, false);
});

test('passages : une demande mal formée est refusée, le nombre de clés est borné', () => {
  const { p } = neuf();
  assert.strictEqual(p.noter(null).ok, false);
  assert.strictEqual(p.noter({ passages: ['2026-10-20'] }).ok, false);
  const beaucoup = {}; for (let i = 0; i < 130; i++) { beaucoup['k' + i] = '2026-10-20'; }
  assert.strictEqual(Object.keys(p.noter({ passages: beaucoup }).passages).length, 100);
});
