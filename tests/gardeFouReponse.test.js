// Fragment commun « garde-fou de la réponse » (prompts/_garde-fou-reponse.md) : il demande à l'assistant les deux marques que la fenêtre unique
// de collage sait lire (ligne [SUITE] et champ "fin":"complet"). Une seule source : les constantes de modules/collage-reponse/logique.js.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { COLLAGE_MARQUEUR_SUITE, COLLAGE_CHAMP_FIN, analyserCompletude } = require('../modules/collage-reponse/logique.js');

const racine = path.join(__dirname, '..');
const fragment = fs.readFileSync(path.join(racine, 'prompts', '_garde-fou-reponse.md'), 'utf8');

test('le fragment existe, sans tiret cadratin ni demi-cadratin, sans le mot IA', () => {
  assert.ok(fragment.includes('en un seul message'));
  assert.ok(!/[–—]/.test(fragment), 'pas de tiret long');
  assert.ok(!/\bIA\b/.test(fragment), 'jamais le mot IA');
});

test('il demande exactement les marques que la fenêtre sait lire', () => {
  assert.ok(fragment.includes(COLLAGE_MARQUEUR_SUITE), 'la ligne de suite');
  assert.ok(fragment.includes(COLLAGE_CHAMP_FIN), 'le champ de fin');
  assert.ok(fragment.includes('« suite »'), 'le mot que la personne écrit');
});

test('la réponse que le fragment demande est bien reconnue par la fenêtre', () => {
  assert.equal(analyserCompletude('Voici.\n{"a":1,' + COLLAGE_CHAMP_FIN + '}', { exigerFin: true }).statut, 'complete');
  assert.equal(analyserCompletude('Voici.\n{"a":1}', { exigerFin: true }).statut, 'coupee');
  assert.equal(analyserCompletude('Début de réponse\n' + COLLAGE_MARQUEUR_SUITE).statut, 'coupee');
});

test('le chargeur de prompts remplace le repère {{GARDE_FOU_REPONSE}} (js/app.js, non chargé par Node : contrôle du texte)', () => {
  const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
  assert.ok(app.includes('prompts/_garde-fou-reponse.md'));
  assert.ok(app.includes('{{GARDE_FOU_REPONSE}}'));
});
