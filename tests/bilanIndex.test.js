const { test } = require('node:test');
const assert = require('node:assert/strict');
const indexModule = require('../modules/bilan-candidature/index.js');
const orchestrateur = require('../modules/bilan-candidature/core/moduleOrchestrator.js');

test('index.js : expose exactement les 9 fonctions de l\'API publique, ni plus ni moins', () => {
  const clesAttendues = [
    'bilanDemarrerDiagnostic',
    'bilanSoumettreReponseDiagnostic',
    'bilanDemanderAmelioration',
    'bilanSoumettreReponseAmelioration',
    'bilanObtenirDiagnostic',
    'bilanObtenirCatalogueAxes',
    'bilanRecommencerDiagnostic',
    'bilanExporterEtatPourSauvegarde',
    'bilanRestaurerEtatDepuisSauvegarde'
  ];
  assert.deepEqual(Object.keys(indexModule).sort(), clesAttendues.sort());
});

test('index.js : chaque export est une reference directe vers moduleOrchestrator (facade pure, aucune enveloppe)', () => {
  assert.equal(indexModule.bilanDemarrerDiagnostic, orchestrateur.bilanDemarrerDiagnostic);
  assert.equal(indexModule.bilanSoumettreReponseDiagnostic, orchestrateur.bilanSoumettreReponseDiagnostic);
  assert.equal(indexModule.bilanDemanderAmelioration, orchestrateur.bilanDemanderAmelioration);
  assert.equal(indexModule.bilanSoumettreReponseAmelioration, orchestrateur.bilanSoumettreReponseAmelioration);
  assert.equal(indexModule.bilanObtenirDiagnostic, orchestrateur.bilanObtenirDiagnostic);
  assert.equal(indexModule.bilanObtenirCatalogueAxes, orchestrateur.bilanObtenirCatalogueAxes);
  assert.equal(indexModule.bilanRecommencerDiagnostic, orchestrateur.bilanRecommencerDiagnostic);
});

test('index.js : n\'expose ni les lectures internes ni l\'outil reserve aux tests', () => {
  assert.equal(indexModule.bilanObtenirCandidature, undefined);
  assert.equal(indexModule.bilanObtenirDemandeAmelioration, undefined);
  assert.equal(indexModule.bilanObtenirPropositionAmelioration, undefined);
  assert.equal(indexModule.bilanReinitialiserPourTests, undefined);
});
