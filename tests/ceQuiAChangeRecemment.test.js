// « Ce qui a changé récemment » (consigne 186, 09/11/2026) : une seule liste de changements lue de deux façons, « Récemment » et « Par trimestre ».
// Les dates viennent du contenu de chaque changement, jamais du nom du fichier ni d'un titre écrit à la main.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
require('./_domStub').installerStubDom();
const M = require('../modules/comprendre-le-cadre/index.js');

const RACINE = path.join(__dirname, '..');

function digest(corps, publie) { return { corps: corps, publie_le: publie || '2026-09', sources: [] }; }
function item(titre, type, verifie) {
  return '### ' + titre + '\n' + (type ? 'Type : ' + type + '\n' : '') + 'Concerne : tous\nCe qui change : ceci.\nSource : [S](https://exemple.fr/s)\n' + (verifie ? 'Vérifié le : ' + verifie + '\n' : '') + '\n';
}

test('la date d\'un changement est la plus tardive entre « en vigueur » et « publié », sinon la première date, sinon la vérification', () => {
  const l = M._comprendreLeCadreAplatirChangements([digest('## D\n\n' +
    item('A', 'décret, publié le 2026-06-12, en vigueur le 2026-09-01.') +
    item('B', 'arrêtés du 2026-07-31, publiés au Journal officiel le 2026-09-02, en vigueur le 2026-06-01.') +
    item('C', 'circulaire du 2026-04-03, publiée au bulletin officiel le 2026-04-30.') +
    item('D', 'annonce du Premier ministre, entrée en vigueur prévue le 2026-12-01.') +
    item('E', 'information du 2026-09-08.', '2026-10-15') +
    item('F', '', '2026-10-15') +
    item('G', '') )]);
  const d = {}; l.forEach((c) => { d[c.titre] = c.date; });
  assert.strictEqual(d.A, '2026-09-01');
  assert.strictEqual(d.B, '2026-09-02', 'application rétroactive : la publication est la date à retenir');
  assert.strictEqual(d.C, '2026-04-30');
  assert.strictEqual(d.D, '2026-12-01');
  assert.strictEqual(d.E, '2026-09-08');
  assert.strictEqual(d.F, '2026-10-15');
  assert.strictEqual(d.G, '2026-09-01', 'dernier recours : le mois de publication du fichier');
});

test('la liste est triée du plus récent au plus ancien et un même changement déposé deux fois n\'apparaît qu\'une fois', () => {
  const l = M._comprendreLeCadreAplatirChangements([
    digest('## D\n\n' + item('Nouveau', 'décret, en vigueur le 2026-10-01.', '2026-11-09'), '2026-10'),
    digest('## D\n\n' + item('Ancien', 'décret, en vigueur le 2026-07-01.') + item('Nouveau', 'décret, en vigueur le 2026-01-01.'), '2026-09')
  ]);
  assert.deepStrictEqual(l.map((c) => c.titre), ['Nouveau', 'Ancien']);
  assert.strictEqual(l[0].date, '2026-10-01', 'le fichier le plus récent l\'emporte');
});

test('un changement « à vérifier » n\'est jamais dans la liste (décision du 15/10/2026)', () => {
  const l = M._comprendreLeCadreAplatirChangements([digest('## D\n\n' + item('Sûr', 'décret, en vigueur le 2026-10-01.') + item('Douteux', 'décret, en vigueur à vérifier.'))]);
  assert.deepStrictEqual(l.map((c) => c.titre), ['Sûr']);
});

test('« Récemment » : à venir d\'abord, puis les 60 derniers jours rangés par mois, et rien au-delà', () => {
  const l = M._comprendreLeCadreAplatirChangements([digest('## D\n\n' +
    item('Futur', 'annonce, en vigueur le 2026-12-01.') +
    item('Octobre', 'décret, en vigueur le 2026-10-08.') +
    item('Septembre', 'décret, en vigueur le 2026-09-15.') +
    item('Trop vieux', 'décret, en vigueur le 2026-09-01.'))]);
  const v = M._comprendreLeCadreVueRecente(l, '2026-11-09');
  assert.deepStrictEqual(v.avenir.map((c) => c.titre), ['Futur']);
  assert.deepStrictEqual(v.mois.map((m) => m.cle), ['2026-10', '2026-09']);
  assert.strictEqual(v.nb, 3);
  assert.strictEqual(v.depuis, '2026-09-10', 'la date de début se calcule, jamais écrite à la main');
  // le même contenu, six semaines plus tard : la liste récente se renouvelle toute seule (l'annonce du 1er décembre est passée, octobre est sorti)
  const v2 = M._comprendreLeCadreVueRecente(l, '2026-12-20');
  assert.deepStrictEqual(v2.avenir, []);
  assert.deepStrictEqual(v2.mois.map((m) => m.cle), ['2026-12']);
  assert.strictEqual(v2.nb, 1);
});

test('les dates d\'une phrase : AAAA-MM-JJ, JJ/MM/AAAA et « 26 octobre 2026 », sans les mises à jour', () => {
  const d = M._comprendreLeCadreDatesDuTexte('décret du 26 octobre 2026, publié le 2026-10-27, annoncé le 09/11/2026, 1er décembre 2026, actualité mise à jour le 30/09/2026, modifiée le 21/10/2026');
  assert.deepStrictEqual(d.sort(), ['2026-10-26', '2026-10-27', '2026-11-09', '2026-12-01']);
  assert.deepStrictEqual(M._comprendreLeCadreDatesDuTexte(''), []);
});

test('« Nouveau cette semaine » : uniquement une information qui vient de sortir (décision, publication ou entrée en vigueur dans les 7 jours), jamais parce que nous venons de la repérer', () => {
  const nouveau = (type, verifie) => M._comprendreLeCadreEstNouveau(
    M._comprendreLeCadreAplatirChangements([digest('## D\n\n' + item('X', type, verifie))])[0], '2026-11-09');
  assert.strictEqual(nouveau('décret, publié le 2026-11-05, en vigueur le 2026-11-06.'), true);
  assert.strictEqual(nouveau('annonce du Premier ministre du 09/11/2026, entrée en vigueur prévue le 2026-12-01.'), true, 'décidé cette semaine, applicable plus tard');
  assert.strictEqual(nouveau('décret du 2 novembre 2026, en vigueur le 2026-12-01.'), true, 'exactement 7 jours');
  assert.strictEqual(nouveau('décret du 1er novembre 2026, en vigueur le 2026-12-01.'), false);
  assert.strictEqual(nouveau('décret, en vigueur le 2026-10-01.', '2026-11-09'), false, 'repéré aujourd\'hui mais sorti il y a plus d\'un mois : pas nouveau');
  assert.strictEqual(nouveau('annonce, en vigueur le 2026-12-01.'), false, 'une date à venir seule n\'est pas « nouvelle »');
  assert.strictEqual(nouveau('', '2026-11-09'), false, 'sans date de sortie, jamais nouveau');
});

test('« Par trimestre » : la même liste rangée par trimestre, le trimestre en cours toujours présent, les plus récents d\'abord', () => {
  const l = M._comprendreLeCadreAplatirChangements([digest('## D\n\n' +
    item('T2', 'décret, en vigueur le 2026-06-15.') + item('T3', 'décret, en vigueur le 2026-09-01.') + item('T4', 'décret, en vigueur le 2026-10-08.'))]);
  const t = M._comprendreLeCadreTrimestres(l, '2026-11-09');
  assert.deepStrictEqual(t.map((x) => x.cle), ['2026T4', '2026T3', '2026T2']);
  assert.strictEqual(t[0].enCours, true);
  assert.strictEqual(t[1].enCours, false);
  const vide = M._comprendreLeCadreTrimestres(l, '2027-01-10');
  assert.strictEqual(vide[0].cle, '2027T1', 'le trimestre en cours existe même sans changement');
  assert.strictEqual(vide[0].items.length, 0);
  const avenir = M._comprendreLeCadreTrimestres(M._comprendreLeCadreAplatirChangements([digest('## D\n\n' + item('Janvier', 'annonce, en vigueur le 2027-01-05.'))]), '2026-11-09');
  assert.strictEqual(avenir[0].cle, '2027T1');
  assert.strictEqual(avenir[0].avenir, true);
});

test('les mois candidats du chargement sont tous les mois, du mois en cours en arrière (plus seulement les fins de trimestre)', () => {
  const m = M._comprendreLeCadreMoisRecents(4);
  assert.strictEqual(m.length, 4);
  m.forEach((x) => assert.match(x, /^\d{4}-\d{2}$/));
  const [a, b] = [m[0].split('-').map(Number), m[1].split('-').map(Number)];
  assert.strictEqual(a[0] * 12 + a[1] - 1, b[0] * 12 + b[1], 'un mois de moins à chaque pas');
});

test('les vrais fichiers de balayage : chaque changement affiché a une date lisible, et octobre comme novembre sont dans la liste', () => {
  const dossier = path.join(RACINE, 'modules/comprendre-le-cadre/contenu/balayage');
  const digests = fs.readdirSync(dossier).filter((f) => /^\d{4}-\d{2}\.md$/.test(f)).sort().reverse()
    .map((f) => M._comprendreLeCadreParserDigest(fs.readFileSync(path.join(dossier, f), 'utf8')));
  const l = M._comprendreLeCadreAplatirChangements(digests);
  assert.ok(l.length >= 10);
  l.forEach((c) => assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/, c.titre + ' : date illisible'));
  assert.ok(l.some((c) => /Smic de 1,6/.test(c.titre)), 'le fichier de novembre est lu');
  assert.ok(l.some((c) => /mandat électif/.test(c.titre)), 'le fichier d\'octobre est lu');
  assert.ok(M._comprendreLeCadreDerniereMiseAJour(l) >= '2026-11-09', 'la date de mise à jour vient du contenu');
});

test('le rendu : deux onglets, aucun titre « publié en… » figé, aucun tiret long', () => {
  const src = fs.readFileSync(path.join(RACINE, 'modules/comprendre-le-cadre/index.js'), 'utf8');
  assert.ok(/data-comprendre-le-cadre-digest-vue/.test(src) && /Par trimestre/.test(src) && /Nouveau cette semaine/.test(src));
  assert.ok(!/Publié en/.test(src.slice(src.indexOf('function _comprendreLeCadreRenduVueRecente'), src.indexOf('function _comprendreLeCadreRenduDigest('))));
  const bloc = src.slice(src.indexOf('« Ce qui a changé récemment » : UNE SEULE LISTE'), src.indexOf('function _comprendreLeCadreRenduDigest('));
  assert.ok(bloc.length > 3000 && !/—|–/.test(bloc));
});
