const { test } = require('node:test');
const assert = require('node:assert/strict');
const ctIndex = require('../modules/coherence-transversale/index.js');

test('index.js : expose exactement les 11 fonctions publiques prevues', () => {
  assert.deepEqual(Object.keys(ctIndex).sort(), [
    'ctAnnulerDiagnostic', 'ctDemarrerDiagnostic', 'ctDemarrerEntretienAvance', 'ctDeposerDossier',
    'ctExporterEtatPourSauvegarde', 'ctObtenirDiagnostic', 'ctObtenirDossier', 'ctObtenirEntretienAvance',
    'ctRestaurerEtatDepuisSauvegarde', 'ctSoumettreReponseDiagnostic', 'ctSoumettreReponseEntretienAvance'
  ]);
});

test('index.js : chaque fonction exposee est bien une fonction', () => {
  Object.values(ctIndex).forEach((valeur) => assert.equal(typeof valeur, 'function'));
});
