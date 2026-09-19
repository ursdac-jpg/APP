const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerResultatAxe, bilanCreerAlertePrioritaire, bilanAlertePrioritaireEstValide,
  bilanCreerDiagnosticResultat, bilanDiagnosticResultatEstValide, bilanValiderDiagnosticResultat
} = require('../modules/bilan-candidature/modeles/diagnosticResultat.js');

function resultatValide(champsSupp) {
  return bilanCreerDiagnosticResultat(Object.assign({
    syntheseGenerale: { statutPreparation: 'a_ajuster', resumeNarratif: 'texte' },
    alertesPrioritaires: [],
    axes: [bilanCreerResultatAxe({ axeId: 'adequation', restitutionQualitative: 'convaincant' })],
    recommandations: [{ id: 'reco-1' }],
    planAction: ['reco-1']
  }, champsSupp || {}));
}

test('bilanCreerDiagnosticResultat : listes vides par defaut, jamais undefined', () => {
  const resultat = bilanCreerDiagnosticResultat({});
  assert.deepEqual(resultat.axes, []);
  assert.deepEqual(resultat.recommandations, []);
  assert.deepEqual(resultat.alertesPrioritaires, []);
});

test('bilanCreerResultatAxe : attentes vide par defaut (diagnostic ancien, sans cette structure)', () => {
  const axe = bilanCreerResultatAxe({ axeId: 'adequation', restitutionQualitative: 'convaincant' });
  assert.deepEqual(axe.attentes, []);
});

test('bilanDiagnosticResultatEstValide : invariant 7, jamais pret si une alerte existe', () => {
  const resultat = resultatValide({
    syntheseGenerale: { statutPreparation: 'pret', resumeNarratif: 'texte' },
    alertesPrioritaires: [{ id: 'alerte-1', type: 'contradiction' }]
  });
  assert.equal(bilanDiagnosticResultatEstValide(resultat), false);
});

test('bilanDiagnosticResultatEstValide : pret accepte sans alerte', () => {
  const resultat = resultatValide({ syntheseGenerale: { statutPreparation: 'pret', resumeNarratif: 'texte' }, alertesPrioritaires: [] });
  assert.equal(bilanDiagnosticResultatEstValide(resultat), true);
});

test('bilanDiagnosticResultatEstValide : planAction ne peut citer un id absent des recommandations', () => {
  const resultat = resultatValide({ planAction: ['reco-inexistante'] });
  assert.equal(bilanDiagnosticResultatEstValide(resultat), false);
});

test('bilanDiagnosticResultatEstValide : un axe avec restitutionQualitative invalide rend le tout invalide', () => {
  const resultat = resultatValide({ axes: [bilanCreerResultatAxe({ axeId: 'adequation', restitutionQualitative: 'excellent' })] });
  assert.equal(bilanDiagnosticResultatEstValide(resultat), false);
});

test('bilanValiderDiagnosticResultat : leve ReponseIncomplete sinon', () => {
  assert.throws(() => bilanValiderDiagnosticResultat(resultatValide({ planAction: ['inexistant'] })),
    (erreur) => erreur.code === 'ReponseIncomplete');
});

test('bilanCreerAlertePrioritaire : id genere si absent', () => {
  const alerte = bilanCreerAlertePrioritaire({ type: 'contradiction', description: 'Deux dates incompatibles.' });
  assert.match(alerte.id, /^alerte-/);
});

test('bilanAlertePrioritaireEstValide : type hors enumeration refuse', () => {
  const alerte = bilanCreerAlertePrioritaire({ type: 'invente', description: 'x' });
  assert.equal(bilanAlertePrioritaireEstValide(alerte), false);
});

test('bilanAlertePrioritaireEstValide : alerte complete acceptee', () => {
  const alerte = bilanCreerAlertePrioritaire({ type: 'contradiction', description: 'x' });
  assert.equal(bilanAlertePrioritaireEstValide(alerte), true);
});
