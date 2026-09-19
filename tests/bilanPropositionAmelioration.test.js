const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerPropositionAmelioration, bilanPropositionAmeliorationEstValide, bilanValiderPropositionAmelioration
} = require('../modules/bilan-candidature/modeles/propositionAmelioration.js');

function propositionValide(champsSupp) {
  return bilanCreerPropositionAmelioration(Object.assign({
    demandeAmeliorationId: 'dem-1',
    recommandationId: 'reco-1',
    proposition: 'Reformuler la mission X',
    justification: 'Repond a l\'observation Y',
    actionsConcretes: ['Ajouter un chiffre']
  }, champsSupp || {}));
}

test('bilanCreerPropositionAmelioration : id genere si absent', () => {
  assert.match(propositionValide().id, /^prop-/);
});

test('bilanPropositionAmeliorationEstValide : actionsConcretes vide accepte (corrige le 2026-08-08 -- coherent avec prompts/bilan-v2.md)', () => {
  assert.equal(bilanPropositionAmeliorationEstValide(propositionValide({ actionsConcretes: [] })), true);
});

test('bilanPropositionAmeliorationEstValide : actionsConcretes qui n\'est pas un tableau refuse (ex. valeur mal formee, pas simplement absente)', () => {
  const proposition = propositionValide();
  proposition.actionsConcretes = 'pas un tableau';
  assert.equal(bilanPropositionAmeliorationEstValide(proposition), false);
});

test('bilanPropositionAmeliorationEstValide : proposition complete acceptee', () => {
  assert.equal(bilanPropositionAmeliorationEstValide(propositionValide()), true);
});

test('bilanValiderPropositionAmelioration : leve ReponseIncomplete sinon', () => {
  assert.throws(() => bilanValiderPropositionAmelioration(propositionValide({ justification: '' })),
    (erreur) => erreur.code === 'ReponseIncomplete');
});

// TACHE (contrat Niveau 2, 2026-08-11, voir docs/ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md)

test('bilanCreerPropositionAmelioration : action absente -> null (jamais obligatoire, cas Niveau 1/extrait present)', () => {
  assert.equal(propositionValide().action, null);
});

test('bilanCreerPropositionAmelioration : action valide (completer/creer) conservee telle quelle', () => {
  assert.equal(propositionValide({ action: 'completer' }).action, 'completer');
  assert.equal(propositionValide({ action: 'creer' }).action, 'creer');
});

test('bilanCreerPropositionAmelioration : action hors enumeration (ex. "remplacer", ou valeur inventee) -> null, jamais recopiee telle quelle', () => {
  assert.equal(propositionValide({ action: 'remplacer' }).action, null);
  assert.equal(propositionValide({ action: 'autre_chose' }).action, null);
});

test('bilanPropositionAmeliorationEstValide : action null acceptee (valeur normale, pas une erreur)', () => {
  assert.equal(bilanPropositionAmeliorationEstValide(propositionValide()), true);
});

test('bilanPropositionAmeliorationEstValide : action completer/creer acceptees', () => {
  assert.equal(bilanPropositionAmeliorationEstValide(propositionValide({ action: 'completer' })), true);
  assert.equal(bilanPropositionAmeliorationEstValide(propositionValide({ action: 'creer' })), true);
});

test('bilanPropositionAmeliorationEstValide : action mal formee directement sur l\'objet (contournant le createur) refusee', () => {
  const proposition = propositionValide();
  proposition.action = 'remplacer';
  assert.equal(bilanPropositionAmeliorationEstValide(proposition), false);
});

// TACHE (correctif "suggestion pertinente par experience", Carte 3, 2026-08-25)

test('bilanCreerPropositionAmelioration : pertinent absent -> true par defaut (comportement inchange pour 1:1/hors-modalite/famille2/Carte 2)', () => {
  assert.equal(propositionValide().pertinent, true);
});

test('bilanCreerPropositionAmelioration : pertinent explicitement false conserve tel quel (seul le flux multi-experiences le fournit)', () => {
  assert.equal(propositionValide({ pertinent: false }).pertinent, false);
});

test('bilanCreerPropositionAmelioration : pertinent explicitement true conserve tel quel', () => {
  assert.equal(propositionValide({ pertinent: true }).pertinent, true);
});
