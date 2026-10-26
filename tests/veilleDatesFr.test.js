const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Toute date AFFICHÉE dans l'outil de veille se lit en français (leçon 9.54) ; l'ISO reste dans les données.
const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
const bloc = /function dateFr\(iso\) \{[\s\S]*?function moisFr\(ym\) \{[\s\S]*?\n  \}\n/.exec(html)[0];
const F = new Function(bloc + '; return { dateFr: dateFr, revisionFr: revisionFr, moisFr: moisFr };')();

test('dateFr : jour, mois seul, vide', () => {
  assert.strictEqual(F.dateFr('2026-10-20'), '20/10/2026');
  assert.strictEqual(F.dateFr('2026-10'), 'octobre 2026');
  assert.strictEqual(F.dateFr(''), '');
  assert.strictEqual(F.dateFr(null), '');
});

test('revisionFr : seule la date de tête change', () => {
  assert.strictEqual(F.revisionFr('2026-09 : barème relevé'), 'septembre 2026 : barème relevé');
  assert.strictEqual(F.revisionFr('texte sans date'), 'texte sans date');
});

test('dateFr est définie une seule fois et les écrans clés l\'utilisent', () => {
  assert.strictEqual((html.match(/function dateFr\(/g) || []).length, 1);
  ['dateFr(chi.lu.verifieLe)', 'dateFr(chi.lu.aujourdhui)', 'echap(dateFr(x.verifie_le))', 'dateFr(x.date)', 'dateFr(r.avant.date)', 'dateFr(f.verifieLe)', 'dateFr(chg.aujourdhui)']
    .forEach((t) => assert.ok(html.includes(t), t));
});
