const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanRassemblerToutesLesObservations, bilanResoudreObservations, bilanConstruireDemandeAmelioration
} = require('../modules/bilan-candidature/amelioration/selectionAmeliorationManager.js');

function diagnosticComplet(champsSupp) {
  return Object.assign({
    id: 'diag-1',
    statut: 'complete',
    contexteAnalyse: {
      observations: [{ id: 'obsf-1', origine: 'factuelle', contenu: 'Téléphone absent.' }]
    },
    resultat: {
      axes: [{
        axeId: 'credibilite',
        observationsArgumentees: [{ id: 'credibilite-obs-0', origine: 'argumentee', contenu: 'Affirmations peu étayées.' }]
      }],
      recommandations: [{
        id: 'reco-1', contenu: 'Ajouter un résultat chiffré.', dimensionsLiees: ['credibilite'],
        priorite: 'haute', extraitConcerne: 'A géré une équipe.', observationsLiees: ['obsf-1', 'credibilite-obs-0']
      }]
    }
  }, champsSupp || {});
}

test('bilanRassemblerToutesLesObservations : combine factuelles et argumentees', () => {
  const toutes = bilanRassemblerToutesLesObservations(diagnosticComplet());
  assert.deepEqual(toutes.map((o) => o.id).sort(), ['credibilite-obs-0', 'obsf-1']);
});

test('bilanResoudreObservations : resout les id connus, signale les autres', () => {
  const resultat = bilanResoudreObservations(diagnosticComplet(), ['obsf-1', 'id-inexistant']);
  assert.equal(resultat.observations.length, 1);
  assert.deepEqual(resultat.idsIntrouvables, ['id-inexistant']);
});

test('bilanConstruireDemandeAmelioration : assemble une DemandeAmelioration complete', () => {
  const demande = bilanConstruireDemandeAmelioration(diagnosticComplet(), 'reco-1', ['ton plus direct'], { maintenant: () => '2026-08-08T00:00:00.000Z' });
  assert.equal(demande.diagnosticSourceId, 'diag-1');
  assert.equal(demande.recommandationSelectionnee.id, 'reco-1');
  assert.equal(demande.observationsResolues.length, 2);
  assert.deepEqual(demande.objectifs, ['ton plus direct']);
});

test('bilanConstruireDemandeAmelioration : copie profonde -- une modification du diagnostic apres coup ne touche jamais la demande', () => {
  const diagnostic = diagnosticComplet();
  const demande = bilanConstruireDemandeAmelioration(diagnostic, 'reco-1', []);
  diagnostic.resultat.recommandations[0].contenu = 'modifié après coup';
  assert.equal(demande.recommandationSelectionnee.contenu, 'Ajouter un résultat chiffré.');
});

test('bilanConstruireDemandeAmelioration : objectifs par defaut = tableau vide', () => {
  const demande = bilanConstruireDemandeAmelioration(diagnosticComplet(), 'reco-1');
  assert.deepEqual(demande.objectifs, []);
});

test('bilanConstruireDemandeAmelioration : resolution partielle acceptee (au moins une observation resolue)', () => {
  const diagnostic = diagnosticComplet();
  diagnostic.resultat.recommandations[0].observationsLiees = ['obsf-1', 'id-fantome'];
  const demande = bilanConstruireDemandeAmelioration(diagnostic, 'reco-1');
  assert.equal(demande.observationsResolues.length, 1);
});

test('bilanConstruireDemandeAmelioration : leve RecommandationInexistante si le diagnostic n\'est pas complete', () => {
  assert.throws(
    () => bilanConstruireDemandeAmelioration(diagnosticComplet({ statut: 'genere', resultat: null }), 'reco-1'),
    (erreur) => erreur.code === 'RecommandationInexistante'
  );
});

test('bilanConstruireDemandeAmelioration : leve RecommandationInexistante si l\'id ne correspond a rien', () => {
  assert.throws(
    () => bilanConstruireDemandeAmelioration(diagnosticComplet(), 'reco-fantome'),
    (erreur) => erreur.code === 'RecommandationInexistante'
  );
});

test('bilanConstruireDemandeAmelioration : leve RecommandationInexistante si AUCUNE observation liee ne se resout', () => {
  const diagnostic = diagnosticComplet();
  diagnostic.resultat.recommandations[0].observationsLiees = ['id-fantome-1', 'id-fantome-2'];
  assert.throws(
    () => bilanConstruireDemandeAmelioration(diagnostic, 'reco-1'),
    (erreur) => erreur.code === 'RecommandationInexistante' && erreur.details.idsIntrouvables.length === 2
  );
});
