const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Consigne 330 (Denis, 15/11/2026) : maximum de largeur, texte plafonné ; question de la photo de « Vos informations ».
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

test('plus de plafond de colonne, marges de 20 px sur ordinateur, texte plafonné à 52 em', () => {
  assert.doesNotMatch(css, /\.page-catalogue-contenu \{[^}]*max-width: 1440px/);
  assert.match(css, /#app:has\(\.page-catalogue-contenu\) \{ padding-left: 20px; padding-right: 20px; \}/);
  assert.match(css, /\.page-catalogue-contenu :is\(p, li\) \{ max-width: 52em; \}/);
});

test('les familles de « Votre parcours » se rangent en colonnes quand la place le permet', () => {
  const style = app.slice(app.indexOf('function _vpStyle()'), app.indexOf('function pageVotreParcours()'));
  assert.ok(style.includes('.vp-qcorps{display:grid;grid-template-columns:repeat(auto-fit,minmax(26rem,1fr));'));
  assert.ok(style.includes('.vp-qcorps>*{grid-column:1/-1;}.vp-qcorps>.vp-fam{grid-column:auto;min-width:0;}'));
});

test('« Vos informations » : question de la photo en bande sur fond blanc sous les coordonnées (consigne 355)', () => {
  assert.ok(app.includes('<div class="vi-photo mt-3">'));
  assert.ok(!app.includes('vi-photo-colonne'), 'plus de colonne à droite');
  assert.doesNotMatch(css, /\.vi-photo-colonne/);
  assert.ok(app.includes('var champsOuResume = contenuIdentiteChamps(blocQuestionPhoto);'), 'le bloc est posé sous les coordonnées');
  assert.ok(app.includes('<strong>Aucune photo déposée :</strong> votre CV sera sans photo.'), 'Oui sans photo déposée : le dire clairement');
  assert.ok(app.includes('Sans réponse de votre part, votre CV sera sans photo.'), 'pas de réponse : sans photo');
  const bloc = app.slice(app.indexOf('<div class="vi-photo mt-3">') - 200, app.indexOf('<div class="vi-photo mt-3">') + 400);
  assert.ok(!/background/.test(bloc), 'aucun fond coloré autour de la question');
});

test('« Vos informations » est dans le cadre commun', () => {
  const page = app.slice(app.indexOf('function pageProjet()'), app.indexOf('function _projetGrilleHTML('));
  assert.ok(page.includes("var html = '<div class=\"page-catalogue-contenu\">' +"));
});

test('« Revoir la présentation » ne dépasse plus à gauche : sa marge négative est annulée quand la marge de la page est de 20 px', () => {
  assert.match(css, /@media \(min-width: 769px\) \{ #app:has\(\.page-catalogue-contenu\) :is\(\.bande-reprise-module-gauche, \.bloc-revoir-module, \.note-revoir-module\) \{ margin-left: 0; \} \}/);
});
