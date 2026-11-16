const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { baseMetiers, ficheParCodeRome } = require('../data/metiers.js');
const { CATEGORIES_SAVOIRS } = require('../scripts/importRome/tablesCompetences.js');
const { phrases } = require('../data/competencesRome.js').COMPETENCES_ROME;

// Fiches complètes en langage courant (data/rome/fiche_<lettre>.js), chargées à la demande. Un code ROME = une fiche, jamais deux.

const dossier = path.join(__dirname, '..', 'data', 'rome');
const fiches = {};
fs.readdirSync(dossier).filter((f) => /^fiche_[A-N]\.js$/.test(f)).forEach((f) => {
  Object.assign(fiches, require('../data/rome/' + f).FICHES_ROME_LETTRE);
});

test('les 1 923 codes du ROME ont une fiche complète, rangée dans le fichier de sa lettre', () => {
  assert.equal(Object.keys(fiches).length, 1923);
  const tous = new Set(baseMetiers.map((m) => m.rome).filter(Boolean));
  const manquants = Array.from(tous).filter((c) => !fiches[c]);
  assert.deepEqual(manquants.slice(0, 10), []);
});

test('chaque fiche a une présentation, des compétences, des savoirs ; très peu de codes sans missions', () => {
  const sansMissions = [], mauvais = [];
  Object.keys(fiches).forEach((c) => {
    const f = fiches[c];
    if (!f.d) { mauvais.push(c + ' sans présentation'); }
    if ((!f.k || !f.k.length) && ['C1129', 'C1216'].indexOf(c) === -1) { mauvais.push(c + ' sans compétences'); }
    if (!f.m) { sansMissions.push(c); }
  });
  assert.deepEqual(mauvais.slice(0, 10), []);
  assert.ok(sansMissions.length <= 10, 'codes sans missions : ' + sansMissions.length);
});

test('les numéros de macro-compétence et de catégorie renvoient à des lignes qui existent', () => {
  const nbMacros = phrases.length;
  assert.equal(nbMacros, 489);
  const mauvais = [];
  Object.keys(fiches).forEach((c) => {
    const f = fiches[c];
    (f.k || []).forEach((g) => { if (!(g[0] >= 0 && g[0] < nbMacros)) { mauvais.push(c + ' macro ' + g[0]); } if (g[1] > g[2].length) { mauvais.push(c + ' cœur > liste'); } });
    (f.s || []).forEach((g) => { if (!CATEGORIES_SAVOIRS[g[0]]) { mauvais.push(c + ' catégorie ' + g[0]); } if (g[1] > g[2].length) { mauvais.push(c + ' savoirs cœur > liste'); } });
    (f.p || []).forEach((p) => { if (!fiches[p]) { mauvais.push(c + ' proche inconnu ' + p); } });
  });
  assert.deepEqual(mauvais.slice(0, 10), []);
});

test('aucun texte des fiches ne contient le mot « IA », un tiret long ou une apostrophe droite', () => {
  const texte = JSON.stringify(fiches);
  assert.equal(/\bIA\b/.test(texte.replace(/"ri":"[RIASEC]{1,2}"/g, '')), false, 'le mot IA ne doit jamais apparaître');
  assert.equal(/[—–]/.test(texte), false, 'aucun tiret cadratin ni demi-cadratin');
  assert.equal(/[a-zé]'[a-zé]/i.test(texte.replace(/"[a-z]+":/g, '')), false, 'apostrophes typographiques seulement');
});

test('un fichier de lettre ne dépasse pas 1,6 Mo (chargement à la demande raisonnable)', () => {
  // Limite relevée de 1,3 à 1,6 Mo le 14/11/2026 : le champ mi (missions à l'infinitif, phrases cochables du CV) ajoute environ 12 % ; la lettre K, la plus lourde, passe de 1,28 à 1,44 Mo (non compressé)
  fs.readdirSync(dossier).forEach((f) => { assert.ok(fs.statSync(path.join(dossier, f)).size < 1.6 * 1024 * 1024, f + ' trop gros'); });
});

test('la fiche affichée à l’écran a de quoi s’afficher : noms des catégories, autres noms du métier, interrupteur ouvert depuis le 16/11/2026', () => {
  const cp = require('../data/competencesRome.js').COMPETENCES_ROME;
  assert.deepEqual(cp.categories, CATEGORIES_SAVOIRS.map((c) => c[1]), 'les noms de catégories du navigateur viennent de la même table que le générateur');
  const avecNoms = Object.keys(fiches).filter((c) => fiches[c].n && fiches[c].n.length).length;
  assert.ok(avecNoms > 1800, 'presque toutes les fiches ont des autres noms de métier : ' + avecNoms);
  const avecLettres = Object.keys(fiches).filter((c) => fiches[c].ri).length;
  assert.ok(avecLettres > 1850, 'presque toutes les fiches ont leurs lettres RIASEC : ' + avecLettres);
  Object.keys(fiches).forEach((c) => { if (fiches[c].ri) { assert.match(fiches[c].ri, /^[RIASEC]{1,2}$/, c + ' : lettres RIASEC invalides'); } });
  assert.ok(Object.keys(fiches).some((c) => fiches[c].n && fiches[c].n.length > 8), 'les autres noms ne sont plus plafonnés à 8');
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.match(app, /var FICHE_ROME_COMPLETE_OUVERTE = true;/, 'la fiche complète est ouverte depuis la décision de Denis du 16/11/2026');
});
