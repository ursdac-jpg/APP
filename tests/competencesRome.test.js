const { test } = require('node:test');
const assert = require('node:assert/strict');
const { METIERS_ROME } = require('../data/metiersRome.js');
const { categorieCompetence, DESCRIPTIFS_COMPETENCES } = require('../data/competences.js');
const { OBJECTIFS, MACROS } = require('../scripts/importRome/tablesCompetences.js');

// Phase 4 de l'import du ROME : les compétences du ROME sont traduites dans le vocabulaire de l'application (scripts/importRome/tablesCompetences.js).
// Le CV s'appuie sur ces listes : une fiche ne doit jamais en manquer.

test('chaque fiche du ROME a au moins 3 savoir-faire, 3 savoir-être et des savoirs, du bon côté du vocabulaire', () => {
  const mauvais = [];
  METIERS_ROME.forEach((m) => {
    if (m.savoirFaire.length < 3) { mauvais.push(m.id + ' moins de 3 savoir-faire'); }
    if (m.savoirEtre.length < 3) { mauvais.push(m.id + ' moins de 3 savoir-être'); }
    if (!m.savoirs.length) { mauvais.push(m.id + ' sans savoirs'); }
    m.savoirFaire.forEach((t) => { if (categorieCompetence[t] !== 'Savoir-faire') { mauvais.push(m.id + ' savoir-faire « ' + t + ' » classé ' + categorieCompetence[t]); } });
    m.savoirEtre.forEach((t) => { if (categorieCompetence[t] !== 'Savoir-etre') { mauvais.push(m.id + ' savoir-être « ' + t + ' » classé ' + categorieCompetence[t]); } });
  });
  assert.deepEqual(mauvais.slice(0, 10), []);
});

test('les tables de traduction n\'emploient que des mots du vocabulaire, rangés du bon côté, tous décrits', () => {
  const mauvais = [];
  const verifier = (nom, ligne) => {
    (ligne.sf || []).forEach((m) => { if (categorieCompetence[m] !== 'Savoir-faire') { mauvais.push(nom + ' savoir-faire « ' + m + ' »'); } });
    (ligne.se || []).forEach((m) => { if (categorieCompetence[m] !== 'Savoir-etre') { mauvais.push(nom + ' savoir-être « ' + m + ' »'); } });
    (ligne.sv || []).forEach((m) => { if (categorieCompetence[m] !== 'Savoirs') { mauvais.push(nom + ' savoir « ' + m + ' »'); } });
    (ligne.sf || []).concat(ligne.se || []).forEach((m) => { if (!DESCRIPTIFS_COMPETENCES[m]) { mauvais.push(nom + ' « ' + m + ' » sans descriptif'); } });
  };
  Object.keys(OBJECTIFS).forEach((o) => verifier('objectif ' + o, OBJECTIFS[o]));
  MACROS.forEach((r, i) => verifier('macro ' + i, r[1]));
  assert.deepEqual(mauvais, []);
  assert.equal(Object.keys(OBJECTIFS).length, 83, 'les 83 objectifs du ROME ont chacun une ligne');
});

test('les listes ne se limitent plus à quelques mots passe-partout : le vocabulaire est bien réparti', () => {
  const compte = {}; METIERS_ROME.forEach((m) => m.savoirFaire.forEach((t) => { compte[t] = (compte[t] || 0) + 1; }));
  assert.ok(Object.keys(compte).length >= 60, 'au moins 60 savoir-faire différents employés, trouvé ' + Object.keys(compte).length);
  Object.keys(compte).forEach((t) => { assert.ok(compte[t] / METIERS_ROME.length < 0.4, '« ' + t + ' » dans plus de 40 % des fiches : trop passe-partout'); });
});

test('les mots ajoutés par la phase 4 ne contiennent jamais le mot « IA » ni un tiret long', () => {
  const nouveaux = Object.keys(DESCRIPTIFS_COMPETENCES).concat(Object.keys(categorieCompetence));
  nouveaux.forEach((t) => { assert.ok(!/\bIA\b|[—–]/.test(t + ' ' + (DESCRIPTIFS_COMPETENCES[t] || '')), t); });
});

test('chaque fiche écrite à la main a au moins 3 savoir-faire et 3 savoir-être (le CV s\'appuie dessus)', () => {
  const { baseMetiersDetaillees } = require('../data/metiers.js');
  const mauvais = baseMetiersDetaillees.filter((m) => (m.savoirFaire || []).length < 3 || (m.savoirEtre || []).length < 3).map((m) => m.id);
  assert.deepEqual(mauvais, []);
});
