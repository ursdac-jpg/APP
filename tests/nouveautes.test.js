// Page « Nouveautés » : logique pure (modules/nouveautes/logique.js) et données (data/nouveautes.js).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const L = require('../modules/nouveautes/logique.js');

const AUJ = new Date(2026, 9, 26);   // 26 octobre 2026

test('nvAgeJours et étiquette « Nouveau » : 30 jours, jamais une date future ni illisible', () => {
  assert.strictEqual(L.nvAgeJours('2026-10-26', AUJ), 0);
  assert.strictEqual(L.nvAgeJours('2026-09-26', AUJ), 30);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-09-26' }, AUJ), true);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-09-25' }, AUJ), false);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-10-27' }, AUJ), false);
  assert.strictEqual(L.nvAgeJours('pas une date', AUJ), null);
  assert.strictEqual(L.nvEstNouveau({}, AUJ), false);
});

test('dates affichées en français, jamais en AAAA-MM-JJ', () => {
  assert.strictEqual(L.nvDateFr('2026-10-26'), '26 octobre 2026');
  assert.strictEqual(L.nvDateFr('2026-11-01'), '1er novembre 2026');
  assert.strictEqual(L.nvMoisFr('2026-02-03'), 'février 2026');
  assert.strictEqual(L.nvDateFr('x'), '');
});

test('nvGrouperParMois : du plus récent au plus ancien, par mois, sans les dates futures ni illisibles', () => {
  const g = L.nvGrouperParMois([
    { date: '2026-09-15', titre: 'a' }, { date: '2026-10-20', titre: 'b' }, { date: '2026-10-26', titre: 'c1' }, { date: '2026-10-26', titre: 'c2' },
    { date: '2027-01-01', titre: 'futur' }, { date: 'zzz', titre: 'illisible' }
  ], AUJ);
  assert.deepStrictEqual(g.map((x) => x.mois), ['octobre 2026', 'septembre 2026']);
  assert.deepStrictEqual(g[0].items.map((x) => x.titre), ['c1', 'c2', 'b']);
  assert.strictEqual(L.nvCompterNouveaux([{ date: '2026-10-26' }, { date: '2026-01-01' }], AUJ), 1);
});

test('les données : chaque ligne a une date, un titre, un texte, un lien connu ; aucun tiret long ni mot « IA » ; jamais « Mon territoire »', () => {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'nouveautes.js'), 'utf8') + '\nthis.NOUV = NOUVEAUTES;', ctx);
  const liste = ctx.NOUV;
  assert.ok(liste.length > 0);
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  liste.forEach((n) => {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(n.date), n.titre);
    assert.ok(n.titre && n.texte, n.date);
    assert.ok(!n.route || app.indexOf("'" + n.route + "':") !== -1, 'route inconnue : ' + n.route);
    assert.ok(!n.route || /^bi-[a-z0-9-]+$/.test(n.icone || ''), 'icône manquante : ' + n.titre);
    const t = n.titre + ' ' + n.texte + ' ' + (n.module || '');
    assert.ok(!/[–—]/.test(t) && !/\bIA\b/.test(t), 'tiret long ou « IA » : ' + n.titre);
    assert.ok(!/territoire/i.test(t), 'fonction fermée au public : ' + n.titre);
  });
});
