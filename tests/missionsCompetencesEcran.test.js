const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Contrôles de l'écran de l'étape « Vos missions et compétences » (lot 3) : l'écran lui-même se vérifie dans le navigateur (js/app.js et ui.js ne sont pas chargés par Node).
const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'missions-competences', 'ui.js'), 'utf8');

test('ui.js : le fichier est du JavaScript valide et déclare la page', () => {
  assert.doesNotThrow(() => new Function(src));
  assert.ok(/function pageMissionsCompetences\(\)/.test(src));
});

test('ui.js : jamais de tiret long, jamais le mot « IA » visible', () => {
  assert.ok(!/[—–]/.test(src), 'pas de tiret cadratin ni demi-cadratin');
  assert.ok(!/\bIA\b/.test(src), 'pas le mot IA');
});

test('ui.js : l\'écran n\'utilise que les outils d\'écriture déjà existants de l\'application', () => {
  ['ajouterSavoirFaireCV', 'retirerSavoirFaireCV', 'ajouterSavoirEtreCV', 'retirerSavoirEtreCV', 'ajouterSavoirCV', 'retirerSavoirCV'].forEach((f) => assert.ok(src.includes(f), f));
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  ['ajouterSavoirFaireCV', 'retirerSavoirFaireCV', 'ajouterSavoirEtreCV', 'retirerSavoirEtreCV', 'ajouterSavoirCV', 'retirerSavoirCV'].forEach((f) => assert.ok(app.includes('function ' + f + '('), 'js/app.js déclare ' + f));
});

test('ui.js : chaque action cliquable dessinée a son traitement', () => {
  const dessinees = Array.from(new Set((src.match(/data-mc-[a-z-]+/g) || [])));
  dessinees.forEach((a) => assert.ok(src.includes("'" + a + "'") || src.includes('"' + a + '"') || src.includes('[' + a), 'traitement de ' + a));
});
