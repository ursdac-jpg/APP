// « Pour ne rien rater » (délais à ne pas rater, alertes arnaques) : fichier généré à jour, forme des lignes, règles d'affichage.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
require('./_domStub').installerStubDom();
const M = require('../modules/comprendre-le-cadre/index.js');
const G = require('../scripts/genererDelais.js');

const RACINE = path.join(__dirname, '..');
const DELAIS = path.join(RACINE, 'modules/comprendre-le-cadre/donnees/delais.json');
const ARNAQUES = path.join(RACINE, 'modules/comprendre-le-cadre/donnees/arnaques.txt');

test('delais.json est identique à ce que produit scripts/genererDelais.js (sinon : node scripts/genererDelais.js)', () => {
  const r = G.construire();
  assert.deepStrictEqual(r.erreurs, []);
  assert.ok(r.delais.length >= 1, 'aucun délai');
  assert.strictEqual(fs.readFileSync(DELAIS, 'utf8').replace(/\r\n/g, '\n'), G.texteSortie(r.delais));
});

test('chaque délai a ses quatre textes, une date de vérification, une fiche existante, et aucun tiret long', () => {
  const liste = JSON.parse(fs.readFileSync(DELAIS, 'utf8'));
  liste.forEach((d) => {
    ['theme', 'quand', 'situation', 'resume', 'fiche', 'rayon', 'titre'].forEach((k) => assert.ok(String(d[k] || '').trim(), d.fiche + ' : ' + k + ' vide'));
    assert.match(d.verifie_le, /^\d{4}-\d{2}(-\d{2})?$/, d.fiche + ' : date de vérification absente');
    assert.ok(fs.existsSync(path.join(RACINE, 'modules/comprendre-le-cadre/contenu', d.rayon, d.fiche + '.md')) || fs.readdirSync(path.join(RACINE, 'modules/comprendre-le-cadre/contenu', d.rayon)).some((f) => /\.md$/.test(f) && fs.readFileSync(path.join(RACINE, 'modules/comprendre-le-cadre/contenu', d.rayon, f), 'utf8').indexOf('id: ' + d.fiche) !== -1), d.fiche + ' : fiche introuvable');
    assert.ok(!/[–—]/.test(JSON.stringify(d)), d.fiche + ' : tiret long');
    assert.ok(d.resume.length <= 330, d.fiche + ' : résumé trop long pour une carte');
  });
});

test('le regroupement par thème garde l\'ordre d\'apparition et ne perd aucun délai', () => {
  const g = M._comprendreLeCadreGrouperDelais([{ theme: 'B', n: 1 }, { theme: 'A', n: 2 }, { theme: 'B', n: 3 }]);
  assert.deepStrictEqual(g.map((x) => x.theme), ['B', 'A']);
  assert.strictEqual(g[0].delais.length, 2);
  assert.deepStrictEqual(M._comprendreLeCadreGrouperDelais(null), []);
});

test('âge en mois : jour compris, dates illisibles = null', () => {
  assert.strictEqual(M._comprendreLeCadreAgeEnMois('2026-05-10', '2026-11-05'), 5);
  assert.strictEqual(M._comprendreLeCadreAgeEnMois('2026-05-05', '2026-11-05'), 6);
  assert.strictEqual(M._comprendreLeCadreAgeEnMois('2025-11-06', '2026-11-05'), 11);
  assert.strictEqual(M._comprendreLeCadreAgeEnMois('2026-05', '2026-11-05'), 6);
  assert.strictEqual(M._comprendreLeCadreAgeEnMois('bientôt', '2026-11-05'), null);
});

test('arnaques.txt : chaque ligne est lisible, identifiants uniques, adresses en https, dates valides, aucun tiret long', () => {
  const texte = fs.readFileSync(ARNAQUES, 'utf8');
  const lignes = texte.split(/\r?\n/).filter((l) => l.trim() && l.trim()[0] !== '#');
  const lues = M._comprendreLeCadreParserArnaques(texte);
  assert.strictEqual(lues.length, lignes.length, 'une ligne d\'alerte est mal formée (11 colonnes séparées par « | » attendues)');
  const ids = {};
  lues.forEach((a) => {
    assert.ok(!ids[a.id], 'identifiant en double : ' + a.id); ids[a.id] = true;
    assert.ok(['a-valider', 'valide'].indexOf(a.statut) !== -1, a.id + ' : statut inconnu');
    ['titre', 'sePasse', 'quoiFaire', 'signaler', 'sourceLibelle'].forEach((k) => assert.ok(a[k], a.id + ' : ' + k + ' vide'));
    assert.ok(a.sourceUrl, a.id + ' : adresse de source absente ou pas en https (une alerte se fonde sur une page officielle ouverte)');
    assert.match(a.ajoutee, /^\d{4}-\d{2}-\d{2}$/); assert.match(a.verifiee, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!/[–—]/.test(JSON.stringify(a)), a.id + ' : tiret long');
  });
});

test('seules les alertes validées et vérifiées depuis moins de 12 mois s\'affichent, les plus récentes d\'abord, 10 au plus', () => {
  const a = (id, statut, verifiee) => ({ id: id, statut: statut, verifiee: verifiee });
  const liste = [a('x1', 'a-valider', '2026-11-01'), a('x2', 'valide', '2025-11-04'), a('x3', 'valide', '2025-11-06'), a('x4', 'valide', '2026-10-01'), a('x5', 'valide', 'n importe quoi')];
  assert.deepStrictEqual(M._comprendreLeCadreArnaquesAffichables(liste, '2026-11-05').map((x) => x.id), ['x4', 'x3']);
  const beaucoup = [];
  for (let i = 1; i <= 14; i++) { beaucoup.push(a('b' + i, 'valide', '2026-10-' + (i < 10 ? '0' : '') + i)); }
  const r = M._comprendreLeCadreArnaquesAffichables(beaucoup, '2026-11-05');
  assert.strictEqual(r.length, 10);
  assert.strictEqual(r[0].id, 'b14');
});

test('une ligne d\'alerte mal formée ou une adresse sans https est écartée, jamais une exception', () => {
  const l = M._comprendreLeCadreParserArnaques('# commentaire\n\nid | valide | titre seulement\n' + ['a1', 'valide', 'T', 'p', 'r', 'f', 's', 'L', 'http://pas-securise.fr', '2026-11-05', '2026-11-05'].join(' | '));
  assert.strictEqual(l.length, 1);
  assert.strictEqual(l[0].sourceUrl, '');
});
