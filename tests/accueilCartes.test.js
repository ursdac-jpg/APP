/* Accueil : réglage « Cartes de l'accueil » et remplissage de l'écran (consignes 333 à 338).
   js/app.js n'est pas chargé par les tests Node : on vérifie ici la présence des éléments clés dans les sources (test navigateur fait à part). */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const lire = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('options d\'affichage : trois choix de cartes, dans le panneau de la roue', () => {
  const html = lire('index.html');
  ['normal', 'compact', 'tres-compact'].forEach((v) => {
    assert.ok(html.includes('data-pref-cartes="' + v + '"'), 'choix manquant : ' + v);
  });
});

test('app.js : le réglage est lu, validé, appliqué et branché', () => {
  const js = lire('js/app.js');
  assert.ok(js.includes("cartesAccueil: 'normal'"), 'valeur par défaut « normal »');
  assert.ok(js.includes("data-cartes-accueil"), 'attribut posé sur la racine');
  assert.ok(js.includes("[data-pref-cartes]"), 'boutons du panneau branchés');
  assert.ok(js.includes('function brancherInfosCartesAccueil'), 'bulle « i » des cartes');
  assert.ok(js.includes('class="accueil-page"'), 'enveloppe de la page d\'accueil');
  assert.strictEqual((js.match(/accueil-ressort accueil-ressort-/g) || []).length, 4, 'quatre ressorts');
});

test('feuille de style : remplissage, six cartes, cartes compactes, aucune écriture rapetissée', () => {
  const css = lire('css/style.css');
  const fin = css.slice(css.indexOf('/* Accueil : la page remplit l\'écran'));
  assert.ok(fin.length > 500, 'bloc de l\'accueil présent');
  assert.ok(fin.includes('#app:has(> .accueil-page)'), 'la page prend la hauteur de l\'écran');
  assert.ok(fin.includes('repeat(6, minmax(0, 1fr))'), 'six cartes sur une ligne');
  assert.ok(fin.includes('[data-cartes-accueil="tres-compact"]'), 'cartes très compactes');
  assert.ok(fin.includes('max-width: 1699.98px'), 'réglage réservé aux écrans de moins de 1700 px');
  assert.ok(!/font-size\s*:\s*[^;]*(?:h1|sousTitre)/.test(fin), 'jamais de taille de titre modifiée');
  assert.ok(!/\.accueil-page h1\s*\{[^}]*font-size/.test(fin), 'le titre garde sa taille');
  assert.ok(!/\.accueil-page \.sousTitre\s*\{[^}]*font-size/.test(fin), 'le sous-titre garde sa taille');
  assert.ok(!/#[0-9a-fA-F]{3,6}\b/.test(fin), 'aucune couleur en dur (mode sombre)');
});
