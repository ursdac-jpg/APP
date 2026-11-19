// Explorer les métiers, fiche enrichie et voyage : garde-fous sur le fichier navigateur parMetierFiche.js
// (non chargé par Node : on vérifie le texte du fichier, pas son exécution).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', 'parMetierFiche.js'), 'utf8');

test('parMetierFiche : aucun tiret cadratin ni demi-cadratin', () => {
  assert.ok(!/[–—]/.test(src));
});

test('parMetierFiche : aucun mot « IA » visible', () => {
  assert.ok(!/>[^<]*\bIA\b[^<]*</.test(src));
});

test('parMetierFiche : chaque action data-pmf du HTML existe dans PMF_ACTIONS', () => {
  const utilisees = new Set();
  const re = /data-pmf="([a-z]+)"/g;
  let m;
  while ((m = re.exec(src))) { utilisees.add(m[1]); }
  const bloc = src.slice(src.indexOf('var PMF_ACTIONS'));
  assert.ok(utilisees.size > 5);
  utilisees.forEach(function (a) {
    assert.ok(new RegExp('\\b' + a + '\\s*:\\s*function').test(bloc), 'action manquante : ' + a);
  });
});

test('parMetierFiche : le voyage et les blocs ne se montrent que module ouvert', () => {
  assert.ok(/function pmfActif\(\)[^\n]*cmvOuvert\(\)/.test(src));
  assert.ok(/function pmfBlocsFiche[\s\S]{0,400}pmfActif\(\)/.test(src));
  assert.ok(/function cmvFicheHaut[\s\S]{0,300}cmvOuvert\(\)/.test(src));
});

test('index.html charge parMetierFiche.js après parMetierEcran.js', () => {
  const h = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const a = h.indexOf('parMetierEcran.js'), b = h.indexOf('parMetierFiche.js');
  assert.ok(a > 0 && b > a);
});

test('le voyage s\'efface quand on sort de la fiche et du module (naviguerVers appelle pmfSurNavigation)', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.ok(/function naviguerVers[\s\S]{0,1800}pmfSurNavigation\(route\)/.test(app));
  assert.ok(/function pmfSurNavigation\(route\)[\s\S]{0,200}'fiche-metier'[\s\S]{0,60}CMV_ROUTE/.test(src));
});

test('l\'avertissement des offres est affiché juste avant « Copier la demande »', () => {
  assert.ok(/PMF_AVERTISSEMENT_OFFRES = 'L’assistant cherche seulement les offres publiées/.test(src));
  assert.ok(/id="pmfAvertissement">' \+ PMF_AVERTISSEMENT_OFFRES[\s\S]{0,200}data-pmf="copier"/.test(src));
});

test('boutons « Copier et ouvrir » : ChatGPT et Perplexity, lus dans ASSISTANTS_IA, copie avant ouverture, rien dans l\'adresse', () => {
  assert.ok(/PMF_ASSISTANTS_OFFRES = \['chatgpt', 'perplexity'\]/.test(src));
  assert.ok(/data-pmf="copierouvrir"/.test(src) && /copierouvrir: function/.test(src));
  assert.ok(/function _pmfAssistant[\s\S]{0,200}ASSISTANTS_IA/.test(src));
  assert.ok(/function _pmfCopierPuisOuvrir[\s\S]{0,400}execCommand\('copy'\)/.test(src));
  assert.ok(!/window\.open\([^)]*(encodeURIComponent|texte|z\.value)/.test(src));
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.ok(/id: 'chatgpt'/.test(app) && /id: 'perplexity'/.test(app));
});
