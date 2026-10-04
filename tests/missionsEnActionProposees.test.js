// Lot N3 (2026-10-04) : le prompt du CV demande les phrases de missions regroupees (point 20) et le code sait les recevoir.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..');
const prompt = fs.readFileSync(path.join(racine, 'prompts/cv.md'), 'utf8');
const app = fs.readFileSync(path.join(racine, 'js/app.js'), 'utf8');

test('le prompt du CV demande missionsEnActionProposees (point 20) dans le format JSON', () => {
  assert.ok(prompt.indexOf('20. Propose, dans `missionsEnActionProposees`') !== -1);
  assert.ok(/"missionsEnActionProposees": \[\s*\{ "texte": "\.\.\.", "illustrePar": \["\.\.\.", "\.\.\."\], "competence": "\.\.\." \}\s*\]/.test(prompt));
  assert.ok(prompt.indexOf('Pour `missionsEnActionProposees` (voir point 20)') !== -1);
});

test('le point 20 garde les règles de prudence décidées par Denis', () => {
  const debut = prompt.indexOf('20. Propose, dans `missionsEnActionProposees`');
  const fin = prompt.indexOf('## Consignes de fiabilité');
  const point = prompt.slice(debut, fin);
  assert.ok(point.indexOf('6 à 10 phrases') !== -1);
  assert.ok(point.indexOf('une liste vide est un résultat normal') !== -1);
  assert.ok(point.indexOf('Aucun doublon') !== -1);
  assert.ok(point.indexOf('vingt mots au plus') !== -1);
  assert.ok(point.indexOf('Jamais une expérience absente du profil') !== -1);
  assert.ok(!/[–—]/.test(point), 'aucun tiret long dans le texte ajouté');
});

test('le code lit, audite, garde et transmet le champ (jamais perdu au « Je valide »)', () => {
  assert.ok(app.indexOf('function normaliserMissionsEnActionProposeesIA') !== -1);
  assert.ok(app.indexOf("missionsEnActionProposees: normaliserMissionsEnActionProposeesIA(recoBrut.missionsEnActionProposees)") !== -1);
  assert.ok(app.indexOf("'competencesGroupeesParTheme', 'missionsEnActionProposees'") !== -1);
  assert.ok(app.indexOf('missionsEnActionProposees: reco.missionsEnActionProposees || []') !== -1);
  assert.ok(app.indexOf('missionsEnActionProposees: brouillon.missionsEnActionProposees || []') !== -1);
  // oubli corrige : les thèmes de compétences ne se perdaient pas seulement pour le nouveau champ
  assert.ok(app.indexOf('competencesGroupeesParTheme: reco.competencesGroupeesParTheme || []') !== -1);
  assert.ok(app.indexOf('competencesGroupeesParTheme: brouillon.competencesGroupeesParTheme || []') !== -1);
});
