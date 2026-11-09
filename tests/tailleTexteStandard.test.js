'use strict';
// Consigne 187 (09/11/2026) : taille du texte standard (16, 17, 18 px au plus), longueur de ligne limitée, message d'options d'affichage sur petit écran.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { messageAffichageDoitSAfficher, htmlMessageAffichage, MESSAGE_AFFICHAGE_LARGEUR_MAX } = require('../modules/message-affichage/messageAffichage.js');

const RACINE = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(RACINE, 'css', 'style.css'), 'utf8');

test('taille du texte : jamais plus de 18 px (palier maximal 1,125), paliers 17 px dès 1000 px et 18 px dès 1400 px', () => {
  const paliers = [...css.matchAll(/@media \(min-width: (\d+)px\) \{ :root \{ --palier-taille: ([\d.]+); \} \}/g)].map((m) => [Number(m[1]), Number(m[2])]);
  assert.deepStrictEqual(paliers, [[1000, 1.0625], [1400, 1.125]]);
  paliers.forEach(([, valeur]) => assert.ok(valeur * 16 <= 18, 'le texte ne dépasse jamais 18 px'));
});

test('longueur de ligne : le texte courant des modules est limité à 34 em, les cartes et tableaux gardent la pleine largeur', () => {
  assert.match(css, /\.page-catalogue-contenu :is\(p, li\) \{ max-width: 34em; \}/);
  // la limite ne vise que p et li : aucune règle ne plafonne les cartes, tableaux ou conteneurs
  assert.doesNotMatch(css, /\.page-catalogue-contenu \{[^}]*max-width: 34em/);
});

test('message d\'options d\'affichage : seulement sous 1000 px de large, et une seule fois par visite', () => {
  assert.strictEqual(MESSAGE_AFFICHAGE_LARGEUR_MAX, 1000);
  assert.strictEqual(messageAffichageDoitSAfficher(375, false), true);
  assert.strictEqual(messageAffichageDoitSAfficher(768, false), true);
  assert.strictEqual(messageAffichageDoitSAfficher(999, false), true);
  assert.strictEqual(messageAffichageDoitSAfficher(1000, false), false);
  assert.strictEqual(messageAffichageDoitSAfficher(1920, false), false);
  assert.strictEqual(messageAffichageDoitSAfficher(375, true), false);
  assert.strictEqual(messageAffichageDoitSAfficher(0, false), false);
  assert.strictEqual(messageAffichageDoitSAfficher(undefined, false), false);
});

test('message d\'options d\'affichage : texte simple, deux vrais boutons, ni tiret long ni le mot IA', () => {
  const html = htmlMessageAffichage();
  assert.match(html, /<button type="button"[^>]*id="messageAffichageOuvrir"/);
  assert.match(html, /<button type="button"[^>]*id="messageAffichageFermer"/);
  assert.match(html, /agrandir le texte ou changer la police/);
  assert.doesNotMatch(html, new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']'));
  assert.doesNotMatch(html, /\bIA\b/);
});

test('message d\'options d\'affichage : branché dans index.html et appelé AVANT le calage des icônes à l\'arrivée sur l\'accueil', () => {
  const index = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  assert.match(index, /modules\/message-affichage\/messageAffichage\.js/);
  assert.match(index, /modules\/message-affichage\/messageAffichage\.css/);
  const app = fs.readFileSync(path.join(RACINE, 'js', 'app.js'), 'utf8');
  const appel = app.indexOf("afficherMessageAffichage();");
  const caleIcones = app.indexOf("carnetApresNavigation(); }", appel);
  assert.ok(appel !== -1 && caleIcones > appel, 'le message doit être posé avant carnetApresNavigation');
});
