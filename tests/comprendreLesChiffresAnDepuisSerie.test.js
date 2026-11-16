const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Cartes « demandeurs d'emploi » et « longue durée » : la ligne « il y a un an » est calculée à partir de la série
// (point situé quatre trimestres avant la valeur affichée), chantier C.3 du 10/11/2026.
require('./_domStub').installerStubDom();

const {
  _comprendreLesChiffresParserDigest: parserDigest,
  _comprendreLesChiffresAnPrecedentDepuisSerie: anDepuisSerie
} = require('../modules/comprendre-les-chiffres/index.js');

const pts = (liste) => liste.map(([label, v]) => ({ label, v }));
const SERIE_PC = pts([['T3 2024', 45.5], ['T4 2024', 45.3], ['T1 2025', 43.6], ['T2 2025', 44.8], ['T3 2025', 44.7], ['T4 2025', 45.5], ['T1 2026', 46.9], ['T2 2026', 47.4], ['T3 2026', 48.1]]);

test('il y a un an : un pourcentage prend le point de la série quatre trimestres plus tôt', () => {
  const e = { valeur: 'environ 48 %', date: '3e trimestre 2026', anPrecedent: '', serie: SERIE_PC };
  assert.equal(anDepuisSerie(e), true);
  assert.equal(e.anPrecedent, '44,7 %');
});

test('il y a un an : un effectif est arrondi à la centaine, et au millier au-delà d\'un million', () => {
  const dep = { valeur: 'environ 17 000 personnes', date: '3e trimestre 2026', anPrecedent: '', serie: pts([['T3 2025', 17000], ['T4 2025', 17050], ['T1 2026', 16900], ['T2 2026', 16810], ['T3 2026', 17040]]) };
  anDepuisSerie(dep);
  assert.equal(dep.anPrecedent, 'environ 17 000 personnes');
  const na = { valeur: 'environ 263 400 personnes', date: '3e trimestre 2026', anPrecedent: '', serie: pts([['T3 2025', 253940], ['T4 2025', 257510], ['T1 2026', 255200], ['T2 2026', 259580], ['T3 2026', 263360]]) };
  anDepuisSerie(na);
  assert.equal(na.anPrecedent, 'environ 253 900 personnes');
  const fr = { valeur: 'environ 3 353 000 personnes', date: '3e trimestre 2026', anPrecedent: '', serie: pts([['T3 2025', 3284000], ['T4 2025', 3333770], ['T1 2026', 3295090], ['T2 2026', 3322970], ['T3 2026', 3353400]]) };
  anDepuisSerie(fr);
  assert.equal(fr.anPrecedent, 'environ 3 284 000 personnes');
});

test('il y a un an : une ligne déjà écrite dans le digest n\'est jamais écrasée', () => {
  const e = { valeur: '8,2 %', date: '3e trimestre 2026', anPrecedent: '7,8 %', serie: SERIE_PC };
  assert.equal(anDepuisSerie(e), false);
  assert.equal(e.anPrecedent, '7,8 %');
});

test('il y a un an : aucun chiffre deviné (série trop courte, série qui ne finit pas au trimestre affiché, trimestre manquant)', () => {
  assert.equal(anDepuisSerie({ valeur: '48 %', date: '3e trimestre 2026', anPrecedent: '', serie: SERIE_PC.slice(-4) }), false);
  assert.equal(anDepuisSerie({ valeur: '48 %', date: '4e trimestre 2026', anPrecedent: '', serie: SERIE_PC }), false, 'la série finit au 3e trimestre');
  assert.equal(anDepuisSerie({ valeur: '48 %', date: '', anPrecedent: '', serie: SERIE_PC }), false, 'pas de date lisible');
  const trou = SERIE_PC.filter((p) => p.label !== 'T3 2025');
  const e = { valeur: '48 %', date: '3e trimestre 2026', anPrecedent: '', serie: trou };
  assert.equal(anDepuisSerie(e), false);
  assert.equal(e.anPrecedent, '');
  assert.equal(anDepuisSerie({ valeur: '', date: '3e trimestre 2026', anPrecedent: '', serie: SERIE_PC }), false);
  assert.equal(anDepuisSerie(null), false);
});

test('digest réel : demandeurs d\'emploi et longue durée ont leur ligne « il y a un an », les autres cartes ne sont pas touchées', () => {
  const md = fs.readFileSync(path.resolve(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu', '2026-06.md'), 'utf8').replace(/\r\n/g, '\n');
  const d = parserDigest(md);
  ['demandeurs', 'longue-duree'].forEach((slug) => {
    const lignes = d.sections[slug];
    assert.ok(lignes.length >= 4, slug + ' : 4 territoires');
    lignes.forEach((e) => assert.ok(e.anPrecedent, slug + ' ' + e.labelBrut + ' : il y a un an'));
  });
  const parTerr = (slug, t) => d.sections[slug].find((e) => e.terr === t);
  assert.equal(parTerr('longue-duree', '24').anPrecedent, '44,7 %');
  assert.equal(parTerr('longue-duree', '87').anPrecedent, '44,0 %');
  assert.equal(parTerr('longue-duree', 'na').anPrecedent, '43,9 %');
  assert.equal(parTerr('demandeurs', '24').anPrecedent, 'environ 17 000 personnes');
  assert.equal(parTerr('demandeurs', '87').anPrecedent, 'environ 14 500 personnes');
  // le chômage garde sa ligne écrite dans le digest, l'emploi salarié n'en reçoit pas
  assert.equal(d.sections.chomage[0].anPrecedent, '7,8 %');
  (d.sections['emploi-salarie'] || []).forEach((e) => assert.equal(e.anPrecedent, '', 'emploi salarié : rien de calculé'));
});
