const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  BILAN_AXE_POIDS, BILAN_RESTITUTION_QUALITATIVE, BILAN_PRIORITE_RECOMMANDATION, BILAN_TYPES_ANOMALIE,
  BILAN_ACTION_PROPOSITION,
  bilanEnumEstValide, bilanNiveauAnalyseEstValide
} = require('../modules/bilan-candidature/modeles/enums.js');

test('bilanEnumEstValide : accepte une valeur de la liste, refuse le reste', () => {
  assert.equal(bilanEnumEstValide(BILAN_AXE_POIDS, 'determinant'), true);
  assert.equal(bilanEnumEstValide(BILAN_AXE_POIDS, 'inexistant'), false);
  assert.equal(bilanEnumEstValide(BILAN_RESTITUTION_QUALITATIVE, 'prioritaire'), true);
  assert.equal(bilanEnumEstValide(BILAN_PRIORITE_RECOMMANDATION, 'critique'), true);
});

test('bilanNiveauAnalyseEstValide : uniquement 1 a 4', () => {
  assert.equal(bilanNiveauAnalyseEstValide(1), true);
  assert.equal(bilanNiveauAnalyseEstValide(4), true);
  assert.equal(bilanNiveauAnalyseEstValide(0), false);
  assert.equal(bilanNiveauAnalyseEstValide(5), false);
  assert.equal(bilanNiveauAnalyseEstValide('2'), false);
});

test('BILAN_TYPES_ANOMALIE : en PascalCase, meme convention que les codes d\'erreur metier', () => {
  assert.deepEqual(BILAN_TYPES_ANOMALIE, ['ReferenceInconnue', 'ChampManquant', 'ValeurInvalide']);
});

// TACHE (contrat Niveau 2, 2026-08-11) : deux valeurs seulement -- jamais
// 'remplacer' (deja couvert par le Niveau 1/extraitConcerne present, hors
// perimetre de cette enumeration), voir docs/ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md.
test('BILAN_ACTION_PROPOSITION : completer et creer uniquement', () => {
  assert.deepEqual(BILAN_ACTION_PROPOSITION, ['completer', 'creer']);
});
