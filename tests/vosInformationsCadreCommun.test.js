const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Consigne 326 (Denis, 15/11/2026) : « Vos informations » est dans le même cadre que les autres pages de création.
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
const page = app.slice(app.indexOf('function pageProjet()'), app.indexOf('function _projetGrilleHTML('));

test('« Vos informations » ouvre et referme le cadre commun, barre du bas en dehors', () => {
  assert.ok(page.includes("var html = '<div class=\"page-catalogue-contenu\">' +"));
  assert.ok(page.includes("_projetGrilleHTML(modeAllege) + '</div>' +"));
  assert.ok(page.indexOf("_projetGrilleHTML(modeAllege) + '</div>'") < page.indexOf('barre-navigation-fixe'));
});

test('la colonne porte la réserve du bas : la grille ne la double pas', () => {
  assert.ok(css.includes('.page-catalogue-contenu > .grille-mon-projet { padding-bottom: 0; }'));
});
