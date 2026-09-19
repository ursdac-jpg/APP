const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du module Lexique. Ajoutee lors de l'audit de
// stabilisation du 2026-09-12 : ce module n'avait jusque-la aucune
// couverture Node, contrairement a ses voisins ATS/Regard recruteur.
// Ces fonctions lisent les globales LEXIQUE_FICHES/LEXIQUE_COLLECTIONS/
// LEXIQUE_SECOND_NIVEAU/normaliserTexte (chargees en vrai par un
// <script> navigateur) : on les pose ici avec un petit jeu de fiches,
// jamais le vrai corpus de data/lexique.js (deja couvert par
// scripts/checkLexique.js).
const { normaliserTexte } = require('../data/metiers.js');
global.normaliserTexte = normaliserTexte;
global.LEXIQUE_FICHES = [
  { id: 'cdi', titre: 'Contrat à durée indéterminée', variantesRecherche: ['cdi'], relations: [{ type: 'voir-aussi', ficheId: 'cdd' }] },
  { id: 'cdd', titre: 'Contrat à durée déterminée', variantesRecherche: ['cdd'] },
  { id: 'sans-lien', titre: 'Fiche isolée', variantesRecherche: [] }
];
global.LEXIQUE_COLLECTIONS = [
  { id: 'coll-contrats', fichesOrdonnees: ['cdi', 'cdd'] },
  { id: 'coll-solo', fichesOrdonnees: ['cdd'] }
];
global.LEXIQUE_SECOND_NIVEAU = [
  { id: 'sn-details', fichesEntree: ['cdi'] }
];

const {
  _lexiqueRechercher,
  _lexiqueConstruireIndexRelations,
  _lexiqueConstruireIndexCollections,
  _lexiqueConstruireIndexSecondNiveau
} = require('../modules/lexique/index.js');

test('rechercher : trouve par titre (insensible aux accents/majuscules)', () => {
  const r = _lexiqueRechercher('DUREE INDETERMINEE');
  assert.equal(r.length, 1);
  assert.equal(r[0].id, 'cdi');
});

test('rechercher : trouve par variante de recherche', () => {
  const r = _lexiqueRechercher('cdd');
  assert.equal(r.length, 1);
  assert.equal(r[0].id, 'cdd');
});

test('rechercher : texte vide, espaces seuls, ou sans resultat -> tableau vide, jamais d\'exception', () => {
  assert.deepEqual(_lexiqueRechercher(''), []);
  assert.deepEqual(_lexiqueRechercher('   '), []);
  assert.deepEqual(_lexiqueRechercher('mot introuvable xyz'), []);
});

test('rechercher : caracteres speciaux ne cassent jamais la recherche', () => {
  assert.doesNotThrow(() => _lexiqueRechercher('%^*()[]{}.*+?'));
});

test('indexRelations : fusionne les relations declarees dans les 2 sens, dedupliquees', () => {
  const idx = _lexiqueConstruireIndexRelations();
  assert.deepEqual(Object.keys(idx['cdi']['voir-aussi']), ['cdd']);
  assert.deepEqual(Object.keys(idx['cdd']['voir-aussi']), ['cdi']);
  assert.deepEqual(idx['sans-lien'], { 'voir-aussi': {}, 'a-ne-pas-confondre': {} });
});

test('indexCollections : inverse fichesOrdonnees -> id de fiche -> liste de collections', () => {
  const idx = _lexiqueConstruireIndexCollections();
  assert.deepEqual(idx['cdi'], ['coll-contrats']);
  assert.deepEqual(idx['cdd'], ['coll-contrats', 'coll-solo']);
  assert.equal(idx['sans-lien'], undefined);
});

test('indexSecondNiveau : inverse fichesEntree -> id de fiche -> liste d\'entrees de second niveau', () => {
  const idx = _lexiqueConstruireIndexSecondNiveau();
  assert.deepEqual(idx['cdi'], ['sn-details']);
  assert.equal(idx['cdd'], undefined);
});
