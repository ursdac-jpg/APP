// « Explorer les métiers » et la disquette : garde-fous de structure (l'essai de bout en bout se fait dans le navigateur).
// Décisions de Denis (16/11/2026) : seulement ce qui est gardé, le résultat jamais les réponses, structure extensible.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const lire = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const garder = lire('modules/comprendre-les-metiers/garder.js');
const app = lire('js/app.js');
const html = lire('index.html');

test('la disquette reçoit le résultat gardé, jamais les réponses', () => {
  assert.ok(/etat\.q\.garde && etat\.q\.resultat/.test(garder), 'seulement si la personne a gardé son résultat');
  assert.ok(!/etat\.q\.p[1-4]/.test(garder), 'aucune lecture des réponses du questionnaire');
  assert.ok(/cmqResultatAGarder\(/.test(garder), 'le résultat vient de la fonction testée');
});

test('structure extensible : tests.riasec + parActions, versionnée, relue avec méfiance', () => {
  assert.ok(/version: CMV_VERSION_SAUVEGARDE, tests: tests, parActions: parActions/.test(garder));
  assert.ok(/tests\.riasec = riasec/.test(garder), 'un autre test s’ajoute sous `tests`');
  assert.ok(/cmqNormaliserResultatGarde\(/.test(garder) && /_cmgIdentifiantsConnus\(/.test(garder), 'résultat et choix relus avec méfiance');
});

test('js/app.js branche le module sur la collecte et la restauration, et la page charge le fichier', () => {
  assert.ok(/comprendreLesMetiers: typeof cmvExporterEtatPourSauvegarde === 'function'/.test(app));
  assert.ok(/cmvRestaurerEtatDepuisSauvegarde\(modulesEtat\.comprendreLesMetiers \|\| null\)/.test(app));
  assert.ok(html.includes('modules/comprendre-les-metiers/garder.js'));
  assert.ok(html.indexOf('comprendre-les-metiers/garder.js') > html.indexOf('comprendre-les-metiers/parMetier.js'));
});
