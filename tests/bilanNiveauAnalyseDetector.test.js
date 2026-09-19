const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bilanDeterminerNiveauAnalyse, bilanProfilRequiertPosturePrioritaire } = require('../modules/bilan-candidature/analyse/niveauAnalyseDetector.js');

test('niveau 1 : aucune donnee complementaire', () => {
  const resultat = bilanDeterminerNiveauAnalyse({});
  assert.equal(resultat.niveau, 1);
  assert.deepEqual(resultat.donneesManquantes, ['metierVise']);
});

test('niveau 2 : metier vise seul', () => {
  const resultat = bilanDeterminerNiveauAnalyse({ metierVise: 'Boulanger' });
  assert.equal(resultat.niveau, 2);
  assert.deepEqual(resultat.donneesManquantes, ['offreEmploi']);
});

test('niveau 3 : offre presente, meme sans metierVise explicite (l\'offre le porte deja)', () => {
  const resultat = bilanDeterminerNiveauAnalyse({ offreEmploi: 'Texte de l\'offre' });
  assert.equal(resultat.niveau, 3);
  assert.deepEqual(resultat.donneesManquantes, ['lettreMotivation', 'preparationEntretien']);
});

test('niveau 3 : offre + lettre seule, entretien encore manquant', () => {
  const resultat = bilanDeterminerNiveauAnalyse({ offreEmploi: 'x', lettreMotivation: 'y' });
  assert.equal(resultat.niveau, 3);
  assert.deepEqual(resultat.donneesManquantes, ['preparationEntretien']);
});

test('niveau 4 : offre + lettre + preparation entretien', () => {
  const resultat = bilanDeterminerNiveauAnalyse({ offreEmploi: 'x', lettreMotivation: 'y', preparationEntretien: 'z' });
  assert.equal(resultat.niveau, 4);
  assert.deepEqual(resultat.donneesManquantes, []);
});

test('candidature undefined : ne leve rien, retombe sur niveau 1', () => {
  assert.doesNotThrow(() => bilanDeterminerNiveauAnalyse());
  assert.equal(bilanDeterminerNiveauAnalyse().niveau, 1);
});

// TACHE (posture prioritaire pour profil reconversion/debutant, 2026-08-24, DECISION DE DENIS)
test('bilanProfilRequiertPosturePrioritaire : true si objectif reconversion, quel que soit le nombre d\'experiences', () => {
  assert.equal(bilanProfilRequiertPosturePrioritaire({ objectif: 'reconversion', nombreExperiencesProfessionnelles: 12 }), true);
});

test('bilanProfilRequiertPosturePrioritaire : true si aucune experience professionnelle, quel que soit l\'objectif', () => {
  assert.equal(bilanProfilRequiertPosturePrioritaire({ objectif: 'offre', nombreExperiencesProfessionnelles: 0 }), true);
});

test('bilanProfilRequiertPosturePrioritaire : false si objectif classique ET au moins une experience', () => {
  assert.equal(bilanProfilRequiertPosturePrioritaire({ objectif: 'offre', nombreExperiencesProfessionnelles: 1 }), false);
});

test('bilanProfilRequiertPosturePrioritaire : candidature vide ou undefined -> false, jamais d\'exception', () => {
  assert.doesNotThrow(() => bilanProfilRequiertPosturePrioritaire());
  assert.equal(bilanProfilRequiertPosturePrioritaire(), false);
  assert.equal(bilanProfilRequiertPosturePrioritaire({}), false);
});
