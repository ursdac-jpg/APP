const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  composeurCleCompetence,
  composeurDedoublonnerListe
} = require('../modules/cv-composeur/composeurDedoublonnage.js');

test('cle : casse, accents, apostrophes typographiques et espaces sont ignores', () => {
  assert.equal(composeurCleCompetence("Esprit d’équipe"), composeurCleCompetence("  esprit d'equipe  "));
  assert.equal(composeurCleCompetence('Travail  en équipe.'), composeurCleCompetence('travail en equipe'));
});

test('cas reel de M. Doumbouya : Esprit d\'equipe present dans deux sources n\'apparait qu\'une fois', () => {
  const savoirEtre = ["Esprit d'équipe", 'Persévérance', 'Respect des règles', 'Créativité'];
  const decouverte = [{ competence: "Esprit d'équipe" }, { competence: 'Attentif et concentré' }];
  const fusion = savoirEtre.map((t) => ({ competence: t })).concat(decouverte);
  const resultat = composeurDedoublonnerListe(fusion);
  assert.deepEqual(
    resultat.map((c) => c.competence),
    ["Esprit d'équipe", 'Persévérance', 'Respect des règles', 'Créativité', 'Attentif et concentré']
  );
});

test('la premiere occurrence est gardee et l\'ordre n\'est jamais modifie', () => {
  const resultat = composeurDedoublonnerListe(['B', 'A', 'b', 'C', 'a']);
  assert.deepEqual(resultat, ['B', 'A', 'C']);
});

test('chaines et objets { competence } / { texte } sont compares entre eux', () => {
  const resultat = composeurDedoublonnerListe(['Patient', { competence: 'patient' }, { texte: 'PATIENT' }]);
  assert.equal(resultat.length, 1);
  assert.equal(resultat[0], 'Patient');
});

test('elements vides ou invalides ecartes, liste absente tolerée', () => {
  assert.deepEqual(composeurDedoublonnerListe(['', null, undefined, 'A', '  ']), ['A']);
  assert.deepEqual(composeurDedoublonnerListe(null), []);
  assert.deepEqual(composeurDedoublonnerListe(undefined), []);
});

test('deux competences differentes ne sont jamais fusionnees', () => {
  const resultat = composeurDedoublonnerListe(["Esprit d'équipe", 'Travail en équipe']);
  assert.equal(resultat.length, 2);
});

test('une fonction d\'extraction personnalisee est utilisee si fournie', () => {
  const resultat = composeurDedoublonnerListe([{ nom: 'X' }, { nom: 'x' }, { nom: 'Y' }], (e) => e.nom);
  assert.equal(resultat.length, 2);
});
