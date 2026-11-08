const { test } = require('node:test');
const assert = require('node:assert/strict');

// « Les mots de cette page » (consignes 155 et 156) : repérage des mots du Lexique dans le texte d'une page.
const { normaliserTexte } = require('../data/metiers.js');
global.normaliserTexte = normaliserTexte;
global.LEXIQUE_FICHES = [
  { id: 'inflation', titre: 'Inflation', univers: 'bulletin-salaire', variantesRecherche: ['hausse des prix'] },
  { id: 'smic', titre: 'Smic', univers: 'bulletin-salaire' },
  { id: 'are', titre: 'ARE', univers: 'protection-sociale', variantesRecherche: ['chomage'] },
  { id: 'cdi', titre: 'CDI', univers: 'contrats-statuts-emploi' },
  { id: 'periode-essai', titre: "Période d'essai", univers: 'droit-travail' },
  { id: 'freins-emploi', titre: 'Trouver ou garder un emploi', univers: 'freins-parcours' },
  { id: 'urgence-x', titre: 'Urgence', univers: 'urgences' },
  { id: 'comparaison', titre: 'Critique ou reproche ?', univers: 'accompagnement-insertion' },
  { id: 'court', titre: 'Qi', univers: 'formation' }
];
const lex = require('../modules/lexique/index.js');

test('les mots sont rendus dans l\'ordre où ils apparaissent dans la page', () => {
  const r = lex._lexiqueMotsDeLaPage('Le Smic monte. Ensuite l\'inflation ralentit, et la période d’essai reste la même.');
  assert.deepEqual(r.mots.map((m) => m.id), ['smic', 'inflation', 'periode-essai']);
});

test('seul le titre compte : « chômage » ne fait pas apparaître ARE, ni « hausse des prix » Inflation', () => {
  const r = lex._lexiqueMotsDeLaPage('Le chômage et la hausse des prix sont en débat.');
  assert.deepEqual(r.mots, []);
});

test('jamais une fiche de freins ou d\'urgence, ni un titre de comparaison, ni un titre trop court', () => {
  const r = lex._lexiqueMotsDeLaPage('Trouver ou garder un emploi. Urgence. Critique ou reproche ? Qi.');
  assert.deepEqual(r.mots, []);
});

test('un mot est repéré avec ses accents, sa majuscule et son pluriel, mais pas à l\'intérieur d\'un autre mot', () => {
  assert.equal(lex._lexiqueMotsDeLaPage('Des CDI, partout.').mots.length, 1);
  assert.equal(lex._lexiqueMotsDeLaPage('Un acdis ou un cdix.').mots.length, 0);
});

test('la liste est plafonnée, et le total dit combien il y en a en tout', () => {
  const r = lex._lexiqueMotsDeLaPage('Smic inflation CDI ARE période d\'essai', 2);
  assert.equal(r.mots.length, 2);
  assert.equal(r.total, 5);
});

test('un texte vide ne donne rien et ne plante pas', () => {
  assert.deepEqual(lex._lexiqueMotsDeLaPage('').mots, []);
  assert.deepEqual(lex._lexiqueMotsDeLaPage(undefined).mots, []);
});
