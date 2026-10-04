const { test } = require('node:test');
const assert = require('node:assert/strict');
const { dateFinImportee, estMentionEnCours, separerDatesDuTitre } = require('../modules/cv-core/dates.js');
const { _reformulerCvNettoyerStruct } = require('../data/metiers.js');

// Retour Denis 2026-10-01 : une SEULE annee ecrite dans le CV veut dire « cette annee-la », jamais « de cette annee jusqu'a aujourd'hui ».
// Dans le dossier, une date de fin vide veut dire « en cours » : une annee seule recoit donc la meme annee en debut et en fin.

test('une annee seule : la date de fin est la meme annee, jamais « en cours »', () => {
  assert.equal(dateFinImportee('2013', '', false), '2013');
  assert.equal(dateFinImportee('2013', 'null', false), '2013');
});

test('« en cours » n\'est retenu que s\'il est ecrit', () => {
  ['en cours', 'En cours', 'aujourd\'hui', 'Aujourd’hui', 'à ce jour', 'présent', 'poste actuel'].forEach((t) => {
    assert.equal(estMentionEnCours(t), true, t);
    assert.equal(dateFinImportee('2013', t, false), '', t);
  });
  assert.equal(estMentionEnCours('2013'), false);
  assert.equal(estMentionEnCours('mai 2013'), false);
});

test('une vraie date de fin est gardee et normalisee', () => {
  assert.equal(dateFinImportee('2013', '2015', false), '2015');
  assert.equal(dateFinImportee('2013-03', 'Sept. 2015', false), '2015-09');
});

test('« depuis 2013 » dans le titre est bien un poste en cours', () => {
  const r = separerDatesDuTitre('Agent de sécurité depuis 2013');
  assert.equal(r.trouve, true);
  assert.equal(r.enCours, true);
  assert.equal(dateFinImportee(r.dateDebut, '', r.enCours), '');
});

test('« (2013) » dans le titre est une annee seule, pas un poste en cours', () => {
  const r = separerDatesDuTitre('Agent de sécurité (2013)');
  assert.equal(r.enCours, false);
  assert.equal(dateFinImportee(r.dateDebut, '', r.enCours), '2013');
});

test('reponse de l\'assistant : annee seule -> meme annee ; « en cours » ecrit -> fin vide ; periode complete gardee', () => {
  const s = _reformulerCvNettoyerStruct({
    experiences: [
      { poste: 'Employée de commerce', entreprise: 'Intermarché', lieu: 'BERGERAC', dateDebut: '2018', dateFin: '', missions: [] },
      { poste: 'Assistante', entreprise: 'Prestige Auto', lieu: 'BERGERAC', dateDebut: '2023', dateFin: 'en cours', missions: [] },
      { poste: 'Animatrice radio', entreprise: '', lieu: 'ORAN', dateDebut: '2003', dateFin: '2006', missions: [] },
      { poste: 'Déléguée commerciale', entreprise: '', lieu: 'ORAN', dateDebut: '', dateFin: '', missions: ['Vendre'] }
    ], formations: [], competences: []
  });
  const par = (p) => s.experiences.find((e) => e.poste.indexOf(p) === 0);
  assert.equal(par('Employée').dateFin, '2018');
  assert.equal(par('Assistante').dateFin, '');
  assert.equal(par('Animatrice').dateFin, '2006');
  assert.equal(par('Déléguée').dateFin, '');
  assert.equal(par('Employée').lieu, 'BERGERAC');
});

test('reponse de l\'assistant : « Poste (2013) » dans le titre = annee seule, « Poste depuis 2013 » = en cours', () => {
  // dans le navigateur, separerDatesDuTitre est une fonction globale (cv-core/dates.js charge comme script)
  globalThis.separerDatesDuTitre = separerDatesDuTitre;
  try {
    const s = _reformulerCvNettoyerStruct({
      experiences: [
        { poste: 'Vendeur (2013)', entreprise: 'A', lieu: '', dateDebut: '', dateFin: '', missions: [] },
        { poste: 'Caissier depuis 2020', entreprise: 'B', lieu: '', dateDebut: '', dateFin: '', missions: [] }
      ], formations: [], competences: []
    });
    assert.equal(s.experiences.find((e) => e.entreprise === 'A').dateFin, '2013');
    assert.equal(s.experiences.find((e) => e.entreprise === 'B').dateFin, '');
  } finally { delete globalThis.separerDatesDuTitre; }
});
