const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerDemandeAmelioration, bilanDemandeAmeliorationEstValide, bilanValiderDemandeAmelioration
} = require('../modules/bilan-candidature/modeles/demandeAmelioration.js');

test('bilanCreerDemandeAmelioration : copie profonde, pas une reference', () => {
  const recommandation = { id: 'reco-1', contenu: 'texte' };
  const demande = bilanCreerDemandeAmelioration({ diagnosticSourceId: 'diag-1', recommandationSelectionnee: recommandation });
  recommandation.contenu = 'modifie apres coup';
  assert.equal(demande.recommandationSelectionnee.contenu, 'texte');
  assert.notEqual(demande.recommandationSelectionnee, recommandation);
});

test('bilanCreerDemandeAmelioration : id genere si absent, objectifs vides par defaut', () => {
  const demande = bilanCreerDemandeAmelioration({ diagnosticSourceId: 'diag-1', recommandationSelectionnee: { id: 'reco-1' } });
  assert.match(demande.id, /^dem-/);
  assert.deepEqual(demande.objectifs, []);
});

test('bilanDemandeAmeliorationEstValide : sans recommandation selectionnee, invalide', () => {
  const demande = bilanCreerDemandeAmelioration({ diagnosticSourceId: 'diag-1' });
  assert.equal(bilanDemandeAmeliorationEstValide(demande), false);
});

test('bilanValiderDemandeAmelioration : leve RecommandationInexistante sinon', () => {
  assert.throws(() => bilanValiderDemandeAmelioration(bilanCreerDemandeAmelioration({ diagnosticSourceId: 'diag-1' })),
    (erreur) => erreur.code === 'RecommandationInexistante');
});
