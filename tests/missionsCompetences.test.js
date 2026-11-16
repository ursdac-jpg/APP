const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Étape « Vos missions et compétences » : logique pure (plan de codage du 14/11/2026).
const base = require('../modules/missions-competences/logique.js');

test('l\'étape est ouverte dans le dépôt local depuis le 15/11/2026 (consigne 321) ; la mise sur GitHub attend la fin des essais internes de Denis', () => {
  assert.equal(base.MC_OUVERT, true);
});

test('le fichier de logique est chargé par la page d\'accueil, avant js/app.js', () => {
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const posLogique = index.indexOf('modules/missions-competences/logique.js');
  const posApp = index.indexOf('<script src="js/app.js"');
  assert.ok(posLogique > 0, 'logique.js doit être chargé par index.html');
  assert.ok(posApp > posLogique, 'logique.js doit être chargé avant js/app.js');
});
