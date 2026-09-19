const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  bilanCreerElementRelecture, bilanCreerEtatRelecture, bilanBasculerSelectionRelecture,
  bilanElementsSelectionnesRelecture, bilanCompteSelectionRelecture
} = require('../modules/bilan-candidature/assistance/etatRelecture.js');

function elementValide(champs) {
  return Object.assign({
    id: 'reco-1', dimension: 'credibilite', texteActuel: 'Gestion d\'un portefeuille.',
    texteApres: 'Pilotage d\'un portefeuille de 40 comptes clients.',
    destination: { index: 0, champ: 'missions' }
  }, champs || {});
}

// --- construction, un element ---

test('bilanCreerElementRelecture : cas nominal, pre-coche par defaut', () => {
  const el = bilanCreerElementRelecture(elementValide());
  assert.equal(el.id, 'reco-1');
  assert.equal(el.texteActuel, 'Gestion d\'un portefeuille.');
  assert.equal(el.texteApres, 'Pilotage d\'un portefeuille de 40 comptes clients.');
  assert.equal(el.selectionne, true);
  assert.deepEqual(el.destination, { index: 0, champ: 'missions' });
});

test('bilanCreerElementRelecture : texteActuel absent (creation) -> null, jamais chaine vide', () => {
  const el = bilanCreerElementRelecture(elementValide({ texteActuel: null }));
  assert.equal(el.texteActuel, null);
});

test('bilanCreerElementRelecture : destination opaque, transmise telle quelle sans interpretation', () => {
  const destinationSelection = { type: 'selection', candidats: ['rechercheCandidature.entreprise', 'rechercheCandidature.site'] };
  const el = bilanCreerElementRelecture(elementValide({ destination: destinationSelection }));
  assert.deepEqual(el.destination, destinationSelection);
});

// TACHE (correctif "suggestion pertinente par experience", Carte 3, 2026-08-25)

test('bilanCreerElementRelecture : ecriture absente -> "remplacement" par defaut (comportement inchange, deja valide par ecritureRelecture.js)', () => {
  assert.equal(bilanCreerElementRelecture(elementValide()).ecriture, 'remplacement');
});

test('bilanCreerElementRelecture : ecriture "ajout" conservee telle quelle (flux multi-experiences)', () => {
  assert.equal(bilanCreerElementRelecture(elementValide({ ecriture: 'ajout' })).ecriture, 'ajout');
});

test('bilanCreerElementRelecture : selectionne explicitement false conserve tel quel (experience jugee peu pertinente par l\'IA)', () => {
  assert.equal(bilanCreerElementRelecture(elementValide({ selectionne: false })).selectionne, false);
});

test('bilanCreerElementRelecture : id manquant -> ElementRelectureInvalide', () => {
  assert.throws(
    () => bilanCreerElementRelecture(elementValide({ id: null })),
    (erreur) => erreur.code === 'ElementRelectureInvalide'
  );
});

test('bilanCreerElementRelecture : texteApres manquant -> ElementRelectureInvalide, jamais un element sans proposition', () => {
  assert.throws(
    () => bilanCreerElementRelecture(elementValide({ texteApres: null })),
    (erreur) => erreur.code === 'ElementRelectureInvalide'
  );
});

// --- construction, etat complet ---

test('bilanCreerEtatRelecture : assemble plusieurs elements, tous pre-coches', () => {
  const etat = bilanCreerEtatRelecture([
    elementValide({ id: 'reco-1' }),
    elementValide({ id: 'reco-2', texteActuel: null })
  ]);
  assert.equal(etat.elements.length, 2);
  assert.ok(etat.elements.every((e) => e.selectionne === true));
});

test('bilanCreerEtatRelecture : tableau vide -> etat valide avec 0 element, jamais une exception', () => {
  const etat = bilanCreerEtatRelecture([]);
  assert.deepEqual(etat.elements, []);
});

test('bilanCreerEtatRelecture : donnees absentes -> meme comportement qu\'un tableau vide', () => {
  const etat = bilanCreerEtatRelecture(undefined);
  assert.deepEqual(etat.elements, []);
});

// --- selection individuelle ---

test('bilanBasculerSelectionRelecture : decoche puis recoche un element precis, les autres inchanges', () => {
  const etat = bilanCreerEtatRelecture([elementValide({ id: 'reco-1' }), elementValide({ id: 'reco-2' })]);
  bilanBasculerSelectionRelecture(etat, 'reco-1');
  assert.equal(etat.elements[0].selectionne, false);
  assert.equal(etat.elements[1].selectionne, true);
  bilanBasculerSelectionRelecture(etat, 'reco-1');
  assert.equal(etat.elements[0].selectionne, true);
});

test('bilanBasculerSelectionRelecture : id inconnu -> aucun effet, jamais une exception', () => {
  const etat = bilanCreerEtatRelecture([elementValide({ id: 'reco-1' })]);
  assert.doesNotThrow(() => bilanBasculerSelectionRelecture(etat, 'id-inexistant'));
  assert.equal(etat.elements[0].selectionne, true);
});

// --- preparation de l'application groupee ---

test('bilanElementsSelectionnesRelecture : seulement les elements encore coches, dans l\'ordre d\'origine', () => {
  const etat = bilanCreerEtatRelecture([
    elementValide({ id: 'reco-1' }), elementValide({ id: 'reco-2' }), elementValide({ id: 'reco-3' })
  ]);
  bilanBasculerSelectionRelecture(etat, 'reco-2');
  const selectionnes = bilanElementsSelectionnesRelecture(etat);
  assert.deepEqual(selectionnes.map((e) => e.id), ['reco-1', 'reco-3']);
});

test('bilanElementsSelectionnesRelecture : tout decoche -> tableau vide, jamais une exception', () => {
  const etat = bilanCreerEtatRelecture([elementValide({ id: 'reco-1' })]);
  bilanBasculerSelectionRelecture(etat, 'reco-1');
  assert.deepEqual(bilanElementsSelectionnesRelecture(etat), []);
});

test('bilanCompteSelectionRelecture : compte total et selectionnes, coherent avec les bascules', () => {
  const etat = bilanCreerEtatRelecture([
    elementValide({ id: 'reco-1' }), elementValide({ id: 'reco-2' }), elementValide({ id: 'reco-3' })
  ]);
  assert.deepEqual(bilanCompteSelectionRelecture(etat), { selectionnes: 3, total: 3 });
  bilanBasculerSelectionRelecture(etat, 'reco-2');
  assert.deepEqual(bilanCompteSelectionRelecture(etat), { selectionnes: 2, total: 3 });
});
