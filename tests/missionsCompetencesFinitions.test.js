const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Lot 9 (consigne 315) : finitions de l'étape « Vos missions et compétences ».
const racine = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
const lexique = fs.readFileSync(path.join(racine, 'data', 'lexique.js'), 'utf8');

test("l'étape a son aide contextuelle, qui vise des éléments réels de la page", () => {
  const debut = app.indexOf("AIDE_PAGES['missions-competences'] = [");
  assert.ok(debut > 0, 'entrée AIDE_PAGES de la route');
  const bloc = app.slice(debut, app.indexOf("AIDE_PAGES['mes-competences'] = ["));
  ['.barre-etapes-bilan', 'details.vp-question:nth-of-type(1)', 'details.vp-question:nth-of-type(2)', '.barre-navigation'].forEach((s) => assert.ok(bloc.includes(s), s));
  assert.ok(!/[\u2013\u2014]/.test(bloc), 'jamais de tiret long');
  assert.ok(!/\bon\b/i.test(bloc.replace(/« [^»]*»/g, '')), 'pas de « on » dans les textes (consigne 274)');
});

test("les textes d'aide ne citent plus un nombre d'étapes qui change selon le parcours", () => {
  const sansComparer = app.replace(/La barre en haut suit les six étapes : Mes pistes[^']*/, '');
  assert.ok(!/suit les six étapes du parcours/.test(sansComparer));
});

test('le Lexique explique la fiche du métier (ROME) et elle est reliée depuis le savoir-faire', () => {
  assert.ok(lexique.includes("id: 'fiche-metier-rome'"));
  assert.ok(lexique.includes("{ ficheId: 'fiche-metier-rome', type: 'voir-aussi' }"));
});
