const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Consigne 325 (Denis, 15/11/2026, présentation 1) : « x choisis sur 16 maximum » sur « Votre parcours », plus de pastilles bleues ni de « 8 choix ».
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const page = app.slice(app.indexOf('function pageVotreParcours()'), app.indexOf('6. PAGE POTENTIEL'));
const style = app.slice(app.indexOf('function _vpStyle()'), app.indexOf('function pageVotreParcours()'));

test('la pastille de chaque question dit combien de choix sur quel maximum', () => {
  assert.ok(page.includes("' choisi' + (n > 1 ? 's' : '') + ' sur ' + q.limite + ' maximum</span>'"));
  assert.ok(page.includes('à compléter'), 'sans choix, la question reste « à compléter »');
  assert.ok(!page.includes("' choix fait'"), 'plus de « choix faits » sans maximum');
});

test('la famille ne dit plus le nombre de cartes disponibles, seulement ses choix, en texte simple', () => {
  assert.ok(!page.includes("groupe.items.length + ' choix"), 'plus de « 8 choix »');
  assert.ok(page.includes("choisisFamille.length + ' choisi'"));
  assert.ok(!page.includes('vp-mini') && !style.includes('vp-mini'), 'plus de pastilles bleues');
  assert.ok(page.includes("map(function (it) { return it.label; }).join(', ')"));
});

test('la flèche de la famille reste sur la première ligne ; limites 16, 16 et 12', () => {
  assert.ok(style.includes('order:4;') && style.includes('order:5;'));
  assert.ok(/champ: 'activites', limite: 16/.test(app) && /champ: 'actions', limite: 16/.test(app) && /champ: 'environnement', limite: 12/.test(app));
});

test('« Tout désélectionner » (consigne 328) : un bouton par question qui a des choix, à gauche de la pastille, sans refermer la question', () => {
  assert.ok(page.includes("(n ? '<button type=\"button\" class=\"vp-qvider\" data-vp-vider=\"' + q.champ + '\""));
  assert.ok(page.indexOf('vp-qvider') < page.indexOf('+ pil + \'</summary>\''), 'le bouton est avant la pastille');
  assert.ok(page.includes('Tout désélectionner'));
  const gestionnaire = page.slice(page.indexOf("querySelectorAll('[data-vp-vider]')"), page.indexOf("querySelectorAll('.vp-carte')"));
  assert.ok(gestionnaire.includes('e.preventDefault()') && gestionnaire.includes('e.stopPropagation()'), 'le clic ne replie pas la question');
  assert.ok(gestionnaire.includes('dossier[champ] = []'));
  assert.ok(style.includes('.vp-qvider{') && style.includes('.vp-qvider+.vp-qpil{margin-left:0;}'));
  assert.ok(style.includes('background:var(--alert-bg);color:var(--alert)'), 'fond saumon, comme « Recommencer »');
  assert.ok(/\.vp-question>summary\{[^}]*flex-wrap:wrap/.test(style), 'sur téléphone, rien ne déborde');
});

test('aucun tiret long dans ce qui a été écrit pour la page', () => {
  const zone = page + style;
  assert.ok(!zone.includes(String.fromCharCode(0x2013)) && !zone.includes(String.fromCharCode(0x2014)));
});
