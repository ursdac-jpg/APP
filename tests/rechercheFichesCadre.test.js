// Consigne 101 : les fiches de « Comprendre le cadre » se trouvent par la barre de recherche de l'accueil (index généré, jamais le corps des fiches).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
require('./_domStub').installerStubDom();

const RACINE = path.join(__dirname, '..');
const G = require('../scripts/genererIndexFichesCadre.js');
const M = require('../modules/comprendre-le-cadre/index.js');

function chargerRecherche(departement) {
  const ctx = { console, window: {}, departementRessourcesMemorise: function () { return departement || null; } };
  vm.createContext(ctx);
  // Les mêmes fichiers de données que index.html, dans le même ordre (jusqu'au Lexique).
  const html = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  const fichiers = (html.match(/<script src="data\/[^"]+\.js"/g) || []).map(function (s) { return s.match(/"([^"]+)"/)[1]; });
  fichiers.slice(0, fichiers.indexOf('data/lexique.js') + 1).forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(RACINE, f), 'utf8'), ctx, { filename: f });
  });
  vm.runInContext('var RAYON_LABEL = { garde: { titre: "Garde d\'enfant" }, emploi: { titre: "Emploi et contrats" } };', ctx);
  return function (texte) { return vm.runInContext('rechercherBaseConnaissances(' + JSON.stringify(texte) + ')', ctx); };
}

test('L\'index des fiches est à jour : relancer node scripts/genererIndexFichesCadre.js sinon', () => {
  const attendu = G.contenuFichier(G.construireIndex(M._comprendreLeCadreParserFiche));
  const actuel = fs.readFileSync(G.SORTIE, 'utf8').replace(/\r\n/g, '\n');
  assert.equal(actuel, attendu, 'data/indexFichesCadre.js n\'est plus à jour : lancez node scripts/genererIndexFichesCadre.js');
});

test('Index : chaque fiche a un identifiant, un rayon, un titre et des mots-clés, sans tiret long', () => {
  const index = G.construireIndex(M._comprendreLeCadreParserFiche);
  assert.ok(index.length > 100);
  const ids = {};
  index.forEach((f) => {
    assert.ok(f.id && f.rayon && f.titre && f.tags.length > 0, f.id);
    assert.ok(!ids[f.id], 'identifiant en double : ' + f.id);
    ids[f.id] = true;
    assert.ok(!new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']').test(f.titre + f.pour_qui), f.id);
  });
});

test('Recherche : « garde enfant » ramène des fiches du rayon garde, en groupe « Dans Comprendre le cadre », avant le Lexique', () => {
  const groupes = chargerRecherche(null)('garde enfant');
  const g = groupes.filter((x) => x.type === 'cadre')[0];
  assert.ok(g, 'groupe absent');
  assert.equal(g.categorie, 'Dans Comprendre le cadre');
  assert.ok(g.resultats.length >= 1 && g.resultats.length <= 8);
  assert.ok(g.resultats.some((f) => f.rayon === 'garde'));
  g.resultats.forEach((f) => { assert.ok(f.id && f.titre && f.rayon); });
  const rangLexique = groupes.findIndex((x) => x.type === 'lexique');
  if (rangLexique >= 0) { assert.ok(groupes.indexOf(g) < rangLexique); }
});

test('Recherche : le titre passe avant le mot-clé, rien ne sort pour une saisie sans rapport', () => {
  const trouve = chargerRecherche(null)('arrêt maladie').filter((x) => x.type === 'cadre')[0];
  assert.ok(trouve && trouve.resultats[0].id === 'emploi-arret-maladie');
  const vide = chargerRecherche(null)('zzzxqw').filter((x) => x.type === 'cadre');
  assert.equal(vide.length, 0);
});

test('Recherche : une fiche propre à un département n\'est pas proposée à l\'autre', () => {
  const index = G.construireIndex(M._comprendreLeCadreParserFiche);
  const propre = index.filter((f) => f.territoire === '24' || f.territoire === '87');
  assert.ok(propre.length >= 1);
  const f = propre[0];
  const autre = f.territoire === '24' ? '87' : '24';
  const mot = f.tags[0];
  const idsAutre = (chargerRecherche(autre)(mot).filter((x) => x.type === 'cadre')[0] || { resultats: [] }).resultats.map((r) => r.id);
  assert.ok(idsAutre.indexOf(f.id) === -1);
  const idsMeme = (chargerRecherche(f.territoire)(mot).filter((x) => x.type === 'cadre')[0] || { resultats: [] }).resultats.map((r) => r.id);
  assert.ok(idsMeme.indexOf(f.id) !== -1);
});
