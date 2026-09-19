const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerDiagnostic, bilanMarquerDiagnosticComplet, bilanMarquerDiagnosticEchecParsing,
  bilanDiagnosticEstValide, bilanValiderDiagnostic
} = require('../modules/bilan-candidature/modeles/diagnostic.js');

test('bilanCreerDiagnostic : statut genere, resultat et texteBrutReponseIA nuls', () => {
  const diagnostic = bilanCreerDiagnostic({ candidatureId: 'c1' });
  assert.equal(diagnostic.statut, 'genere');
  assert.equal(diagnostic.resultat, null);
  assert.equal(diagnostic.texteBrutReponseIA, null);
});

test('bilanMarquerDiagnosticComplet : retourne une copie, ne modifie jamais l\'original', () => {
  const diagnostic = bilanCreerDiagnostic({ candidatureId: 'c1' });
  const complet = bilanMarquerDiagnosticComplet(diagnostic, { syntheseGenerale: {} }, 'texte brut');
  assert.equal(diagnostic.statut, 'genere');
  assert.equal(complet.statut, 'complete');
  assert.notEqual(diagnostic, complet);
});

test('bilanMarquerDiagnosticEchecParsing : resultat reste null', () => {
  const diagnostic = bilanCreerDiagnostic({ candidatureId: 'c1' });
  const echec = bilanMarquerDiagnosticEchecParsing(diagnostic, 'texte illisible');
  assert.equal(echec.statut, 'echec_parsing');
  assert.equal(echec.resultat, null);
  assert.equal(echec.texteBrutReponseIA, 'texte illisible');
});

test('bilanDiagnosticEstValide : complete sans resultat est invalide', () => {
  const diagnostic = bilanCreerDiagnostic({ candidatureId: 'c1' });
  diagnostic.statut = 'complete';
  assert.equal(bilanDiagnosticEstValide(diagnostic), false);
});

test('bilanDiagnosticEstValide : echec_parsing sans texteBrutReponseIA est invalide', () => {
  const diagnostic = bilanCreerDiagnostic({ candidatureId: 'c1' });
  diagnostic.statut = 'echec_parsing';
  assert.equal(bilanDiagnosticEstValide(diagnostic), false);
});

test('bilanValiderDiagnostic : leve ReponseIncomplete si etat incoherent', () => {
  const diagnostic = bilanCreerDiagnostic({ candidatureId: 'c1' });
  diagnostic.statut = 'complete';
  assert.throws(() => bilanValiderDiagnostic(diagnostic), (erreur) => erreur.code === 'ReponseIncomplete');
});
