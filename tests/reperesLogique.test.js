const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du module "Mes Repères". Ajoutee lors de l'audit de
// stabilisation du 2026-09-12 : ce module n'avait jusque-la aucune
// couverture Node, contrairement a ses voisins ATS/Regard recruteur.
const {
  _reperesExtraitPourTitre,
  _reperesConstruire,
  _reperesTexteRechercheRepere,
  _reperesTexteProfond
} = require('../modules/reperes/index.js');

test('extraitPourTitre : garde les 4 premiers mots, espaces normalises', () => {
  assert.equal(_reperesExtraitPourTitre('Un texte assez long pour depasser le titre'), 'Un texte assez long');
  assert.equal(_reperesExtraitPourTitre('  Deux   mots  '), 'Deux mots');
});

test('extraitPourTitre : vide ou absent -> chaine vide', () => {
  assert.equal(_reperesExtraitPourTitre(''), '');
  assert.equal(_reperesExtraitPourTitre(undefined), '');
  assert.equal(_reperesExtraitPourTitre('   '), '');
});

test('construire : geste libre (source null) -> repere sans source ni frein', () => {
  const r = _reperesConstruire('libre', null);
  assert.equal(r.type, 'libre');
  assert.equal(r.source, null);
  assert.equal(r.analyse, false);
  assert.equal(r.titre, '');
  assert.equal(r.texte, '');
  assert.ok(r.id);
  assert.ok(r.date);
  assert.equal('frein' in r, false);
});

test('construire : contratSource avec libelle valide -> source reprise', () => {
  const r = _reperesConstruire('ancre', { libelle: 'Depuis le Bilan' });
  assert.equal(r.source, 'Depuis le Bilan');
});

test('construire : contratSource degrade (libelle absent/invalide) -> geste libre, jamais d\'exception', () => {
  assert.equal(_reperesConstruire('ancre', {}).source, null);
  assert.equal(_reperesConstruire('ancre', { libelle: '   ' }).source, null);
  assert.equal(_reperesConstruire('ancre', { libelle: 42 }).source, null);
});

test('construire : code frein valide (lettres seules) retenu, invalide ignore', () => {
  assert.equal(_reperesConstruire('ancre', { frein: 'mobilite' }).frein, 'mobilite');
  assert.equal('frein' in _reperesConstruire('ancre', { frein: 'mob-1' }), false);
  assert.equal('frein' in _reperesConstruire('ancre', { frein: '' }), false);
});

test('texteRechercheRepere : assemble titre/texte/source en minuscules', () => {
  const r = { titre: 'Titre', texte: 'Un TEXTE', source: 'Source' };
  assert.equal(_reperesTexteRechercheRepere(r), 'titre un texte source');
});

test('texteRechercheRepere : champs absents ignores, jamais d\'exception', () => {
  assert.equal(_reperesTexteRechercheRepere({}), '');
  assert.equal(_reperesTexteRechercheRepere({ titre: null, texte: undefined, source: '' }), '');
});

test('texteProfond : descend dans un tableau et un objet imbrique', () => {
  const acc = [];
  _reperesTexteProfond({ a: 'un', b: ['deux', { c: 'trois' }] }, acc);
  assert.deepEqual(acc, ['un', 'deux', 'trois']);
});

test('texteProfond : null/undefined ignores sans exception', () => {
  const acc = [];
  _reperesTexteProfond(null, acc);
  _reperesTexteProfond(undefined, acc);
  assert.deepEqual(acc, []);
});
