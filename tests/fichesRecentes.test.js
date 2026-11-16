// Bloc « Dans les fiches » de « Ce qui a changé récemment » (consigne 186, 09/11/2026) : les fiches ajoutées ou mises à jour viennent du journal des modifications
// de l'outil de veille, par un petit fichier généré (jamais modifié à la main).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
require('./_domStub').installerStubDom();
const M = require('../modules/comprendre-le-cadre/index.js');
const G = require('../scripts/genererFichesRecentes.js');

const RACINE = path.join(__dirname, '..');

const JOURNAL = [
  '# Journal des modifications : date, heure | registre | fiche | action',
  '2026-10-17 22:34 | lieux | cdad-dordogne | modifiée',
  '2026-11-08 21:10 | cadre | handicap-aah-et-travail | modifiée | 2026-11-08 : conditions d\'accès',
  '2026-11-08 22:26 | cadre | handicap-aah-et-travail | modifiée | précisions',
  '2026-11-09 22:38 | cadre | sante-mon-soutien-psy-seances-psychologue | ajoutée | nouvelle fiche',
  '2026-11-09 23:10 | cadre | sante-mon-soutien-psy-seances-psychologue | modifiée | retouche',
  '2026-11-09 22:38 | cadre | fiche-qui-n-existe-plus | modifiée | effacée depuis',
  '2026-11-09 22:38 | lexique | primes | modifiée | pas une fiche du cadre',
  '2026-11-09 22:38 | cadre | logement-aides-au-logement-caf | supprimée | action inconnue'
].join('\n');

test('le fichier généré est identique à ce que produit scripts/genererFichesRecentes.js (sinon : node scripts/genererFichesRecentes.js)', () => {
  const fichier = path.join(RACINE, 'modules/comprendre-le-cadre/donnees/fiches-recentes.json');
  assert.ok(fs.existsSync(fichier), 'fichier absent');
  assert.strictEqual(fs.readFileSync(fichier, 'utf8').replace(/\r\n/g, '\n'), G.texteSortie(G.construire()));
});

test('une entrée par fiche du cadre : dernière date, date d\'ajout, titre et rayon pris dans la fiche ; le reste est ignoré', () => {
  const l = G.construire(JOURNAL);
  assert.deepStrictEqual(l.map((x) => x.id), ['sante-mon-soutien-psy-seances-psychologue', 'handicap-aah-et-travail']);
  const psy = l[0], aah = l[1];
  assert.strictEqual(psy.date, '2026-11-09');
  assert.strictEqual(psy.ajoutee, '2026-11-09');
  assert.strictEqual(psy.rayon, 'sante');
  assert.match(psy.titre, /Mon soutien psy/);
  assert.strictEqual(aah.date, '2026-11-08', 'la dernière des deux modifications');
  assert.strictEqual(aah.ajoutee, '');
});

test('un journal vide ou absent ne casse rien', () => {
  assert.deepStrictEqual(G.construire(''), []);
});

test('la vue : les fiches des 60 derniers jours, « nouvelle » si ajoutée dans la période, la plus récente d\'abord, jamais une date future', () => {
  const fiches = [
    { id: 'a', rayon: 'sante', titre: 'A', date: '2026-11-09', ajoutee: '2026-11-09' },
    { id: 'b', rayon: 'logement', titre: 'B', date: '2026-11-08', ajoutee: '' },
    { id: 'c', rayon: 'sante', titre: 'C', date: '2026-08-01', ajoutee: '2026-07-01' },
    { id: 'd', rayon: 'sante', titre: 'D', date: '2026-10-20', ajoutee: '2026-07-01' },
    { id: 'e', rayon: 'sante', titre: 'E', date: '2026-12-01', ajoutee: '' }
  ];
  const v = M._comprendreLeCadreFichesRecentesVue(fiches, '2026-11-09');
  assert.deepStrictEqual(v.map((x) => x.id), ['a', 'b', 'd']);
  assert.strictEqual(v[0].nouvelle, true);
  assert.strictEqual(v[1].nouvelle, false);
  assert.strictEqual(v[2].nouvelle, false, 'ajoutée il y a plus de 60 jours : une mise à jour');
  assert.strictEqual(v[2].date, '2026-10-20', 'la date affichée d\'une mise à jour est celle de sa modification');
  assert.deepStrictEqual(M._comprendreLeCadreFichesRecentesVue([], '2026-11-09'), []);
  assert.deepStrictEqual(M._comprendreLeCadreFichesRecentesVue(null, '2026-11-09'), []);
  assert.strictEqual(M._comprendreLeCadreDateMoinsJours('2026-11-09', 60), '2026-09-10');
});

test('le câblage : lecture du fichier à l\'ouverture, bouton qui ouvre la fiche, fichier regénéré et protégé par l\'outil de veille', () => {
  const src = fs.readFileSync(path.join(RACINE, 'modules/comprendre-le-cadre/index.js'), 'utf8');
  assert.ok(/fiches-recentes\.json/.test(src) && /_comprendreLeCadreChargerFichesRecentes\(function \(\) \{ pageComprendreLeCadre\(\); \}\)/.test(src));
  assert.ok(/data-comprendre-le-cadre-fiche-recente=/.test(src) && /comprendreLeCadreOuvrirFiche\(this\.dataset\.comprendreLeCadreFicheRecenteRayon/.test(src));
  assert.ok(/Nouvelle fiche/.test(src) && /Fiche mise à jour/.test(src));
  const gen = fs.readFileSync(path.join(RACINE, 'scripts/genererBaseVeille.js'), 'utf8');
  assert.ok(/genererFichesRecentes/.test(gen), 'regénéré avec la base de l\'outil de veille');
  const depot = fs.readFileSync(path.join(RACINE, 'outils/veilleDepot.js'), 'utf8');
  assert.ok(/'fiches-recentes\.json'/.test(depot), 'sauvegardé et remis en cas d\'échec comme les autres fichiers générés');
});

test('aucun tiret long dans ce qui a été écrit', () => {
  const src = fs.readFileSync(path.join(RACINE, 'scripts/genererFichesRecentes.js'), 'utf8');
  assert.ok(!/[–—]/.test(src));
});

// Consigne 416 (Denis, 16/11/2026) : une fiche créée ou mise à jour doit TOUJOURS apparaître dans « Dans les fiches » (donc dans la page Nouveautés).
// Garde-fou : toute fiche dont la dernière révision est datée du 15/11/2026 ou après doit figurer dans le fichier généré. Si ce test échoue, la fiche a été écrite
// sans passer par l'outil de veille (ou le journal a été oublié) : ajouter sa ligne « cadre » au journal, puis node scripts/genererFichesRecentes.js.
test('toute fiche révisée depuis le 15/11/2026 figure dans « Dans les fiches »', () => {
  const contenu = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu');
  const presentes = new Set(JSON.parse(fs.readFileSync(G.SORTIE, 'utf8')).map(function (f) { return f.id; }));
  const absentes = [];
  fs.readdirSync(contenu).forEach(function (rayon) {
    const dossier = path.join(contenu, rayon);
    if (!fs.statSync(dossier).isDirectory() || rayon === 'balayage' || rayon === 'methode') { return; }
    fs.readdirSync(dossier).forEach(function (nom) {
      if (!/\.md$/.test(nom) || /^README\.md$/i.test(nom) || /\.collecte\.md$/.test(nom)) { return; }
      const texte = fs.readFileSync(path.join(dossier, nom), 'utf8').replace(/\r\n/g, '\n');
      const bloc = texte.match(/^revisions:\n((?:  - .*\n?)+)/m);
      if (!bloc) { return; }
      const dates = Array.from(bloc[1].matchAll(/^  - "?(?:\d{4}-\d{2} : )?(\d{4}-\d{2}-\d{2})/gm)).map(function (m) { return m[1]; }).sort();
      const derniere = dates[dates.length - 1];
      if (derniere && derniere >= '2026-11-15' && !presentes.has(nom.replace(/\.md$/, ''))) { absentes.push(nom.replace(/\.md$/, '')); }
    });
  });
  assert.deepStrictEqual(absentes, [], 'fiches absentes du bloc « Dans les fiches » : ' + absentes.join(', '));
});
