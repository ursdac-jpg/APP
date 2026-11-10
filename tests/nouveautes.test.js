// Page « Nouveautés » : logique pure (modules/nouveautes/logique.js) et données (data/nouveautes.js).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const L = require('../modules/nouveautes/logique.js');

const AUJ = new Date(2026, 9, 26);   // 26 octobre 2026

test('nvAgeJours et étiquette « Nouveau » : 7 jours, jamais une date future ni illisible', () => {
  assert.strictEqual(L.nvAgeJours('2026-10-26', AUJ), 0);
  assert.strictEqual(L.nvAgeJours('2026-10-19', AUJ), 7);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-10-20' }, AUJ), true);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-10-19' }, AUJ), false);
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
  const CARTES = ['Mes documents', 'Me préparer à candidater', 'Boîte à outils', 'Outils d’analyse', 'Se tenir informé', 'Vous hésitez encore ?'];
  liste.forEach((n) => {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(n.date), n.titre);
    assert.ok(n.titre && n.texte, n.date);
    assert.ok(!n.route || app.indexOf("'" + n.route + "':") !== -1, 'route inconnue : ' + n.route);
    assert.ok(!n.route || /^bi-[a-z0-9-]+$/.test(n.icone || ''), 'icône manquante : ' + n.titre);
    const t = n.titre + ' ' + n.texte + ' ' + (n.module || '');
    assert.ok(!/[–—]/.test(t) && !/\bIA\b/.test(t), 'tiret long ou « IA » : ' + n.titre);
    assert.ok(!/territoire/i.test(t), 'fonction fermée au public : ' + n.titre);
    assert.ok(n.carte ? CARTES.indexOf(n.carte) !== -1 : !!n.lieu, 'carte de l’accueil inconnue (ou lieu manquant) : ' + n.titre);
  });
});

test('les trois entrées : entrée connue sinon « appli », origine par défaut « nous », mots affichés, total de la pastille', () => {
  assert.deepStrictEqual(L.NV_ENTREES, ['appli', 'regles', 'corriges']);
  assert.strictEqual(L.nvEntreeValide('regles'), 'regles');
  assert.strictEqual(L.nvEntreeValide('n importe quoi'), 'appli');
  assert.strictEqual(L.nvEntreeValide(undefined), 'appli');
  assert.strictEqual(L.nvOrigine({ origine: 'personne' }), 'personne');
  assert.strictEqual(L.nvOrigine({}), 'nous');
  assert.strictEqual(L.nvLibelleOrigine({ origine: 'personne' }), 'Signalé par un utilisateur');
  assert.strictEqual(L.nvLibelleOrigine({ origine: 'nous' }), '', 'rien d affiché pour un défaut repéré par nous');
  assert.strictEqual(L.nvLibelleOrigine({}), '');
  assert.strictEqual(L.nvLibelleAvant({ origine: 'personne' }), 'Ce qui avait été signalé');
  assert.strictEqual(L.nvLibelleAvant({ origine: 'nous' }), 'Ce qui avait été constaté');
  assert.strictEqual(L.nvTotalPastille(2, 3, 4), 9);
  assert.strictEqual(L.nvTotalPastille(2, null, 4), 6, 'le nombre des règles est inconnu tant que le module n a pas été lu');
  assert.strictEqual(L.nvTotalPastille(-1, undefined, 0), 0);
});

test('les problèmes corrigés : date, titre, deux phrases, origine connue ; aucun tiret long ni mot « IA » ; textes simples', () => {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'problemesCorriges.js'), 'utf8') + '\nthis.PC = PROBLEMES_CORRIGES;', ctx);
  const liste = ctx.PC;
  assert.ok(liste.length > 0);
  liste.forEach((p) => {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(p.date), p.titre);
    assert.ok(p.titre && p.signale && p.corrige, p.date);
    assert.ok(p.origine === 'personne' || p.origine === 'nous', 'origine inconnue : ' + p.titre);
    const t = p.titre + ' ' + p.signale + ' ' + p.corrige;
    assert.ok(!/[–—]/.test(t) && !/\bIA\b/.test(t), 'tiret long ou « IA » : ' + p.titre);
    assert.ok(!/territoire/i.test(t), 'fonction fermée au public : ' + p.titre);
  });
  assert.strictEqual(L.nvCompterNouveaux(liste, new Date(2026, 10, 10)), liste.filter((p) => p.date >= '2026-11-04').length);
});

test('la page est branchée : script chargé, recherche de l accueil pour les trois entrées, cible gérée par app.js', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.indexOf('data/problemesCorriges.js') !== -1);
  assert.ok(html.indexOf('data/problemesCorriges.js') < html.indexOf('modules/nouveautes/index.js'), 'les données avant l interface');
  const base = fs.readFileSync(path.join(__dirname, '..', 'data', 'baseConnaissancesERIP.js'), 'utf8');
  ['fn:nouveautes-appli', 'fn:nouveautes-regles', 'fn:nouveautes-corriges'].forEach((c) => assert.ok(base.indexOf(c) !== -1, c));
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.ok(app.indexOf("val.indexOf('nouveautes-') === 0") !== -1);
});
