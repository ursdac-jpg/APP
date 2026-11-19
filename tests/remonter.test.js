const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../modules/remonter/index.js');
const lire = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');

test('flèche Remonter : visible dès que les trois quarts du premier écran sont dépassés, jamais avant', () => {
  assert.strictEqual(R.remonterDoitEtreVisible(0, 800, null, 'bilan'), false);
  assert.strictEqual(R.remonterDoitEtreVisible(600, 800, null, 'bilan'), false, 'exactement les trois quarts : pas encore');
  assert.strictEqual(R.remonterDoitEtreVisible(601, 800, null, 'bilan'), true);
  assert.strictEqual(R.remonterDoitEtreVisible(5000, 800, null, 'introduction'), true);
});
test('flèche Remonter : avec une cible, elle apparaît quand la cible est sortie de l\'écran par le haut', () => {
  assert.strictEqual(R.remonterDoitEtreVisible(0, 800, 300, 'nouveautes'), false, 'cible encore à l\'écran');
  assert.strictEqual(R.remonterDoitEtreVisible(2000, 800, 30, 'nouveautes'), true);
  assert.strictEqual(R.remonterDoitEtreVisible(2000, 800, -400, 'nouveautes'), true);
});
test('flèche Remonter : aucune flèche sur le diaporama d\'introduction', () => {
  assert.strictEqual(R.remonterDoitEtreVisible(9000, 800, null, 'introduction-diaporama'), false);
});
test('flèche Remonter : un seul composant, branché une fois, effacé à chaque changement de page', () => {
  const html = lire('index.html'), app = lire('js', 'app.js'), css = lire('css', 'style.css');
  assert.strictEqual(html.split('modules/remonter/index.js').length, 2);
  assert.ok(app.indexOf("remonterSurNavigation()") !== -1, 'naviguerVers efface la cible');
  assert.ok(css.indexOf('.fleche-remonter {') !== -1 && css.indexOf('.fleche-remonter[hidden]') !== -1 && /@media print \{ \.fleche-remonter/.test(css));
  const src = lire('modules', 'remonter', 'index.js');
  assert.ok(src.indexOf('prefers-reduced-motion') !== -1, 'défilement sans animation si la personne le demande');
  assert.ok(!/[–—]/.test(src), 'aucun tiret long');
  // aucun module ne recopie la flèche : seul le composant crée le bouton
  ['modules/nouveautes/index.js', 'js/app.js'].forEach((f) => assert.ok(lire(...f.split('/')).indexOf('bi-arrow-up') === -1, f));
});
