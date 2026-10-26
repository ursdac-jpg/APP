const { test } = require('node:test');
const assert = require('node:assert/strict');

// Règles de blocage du bouton « Choisir mon assistant » (page « Préparer » de la lettre),
// validées par Denis le 23/10/2026.
const { raisonsBlocageLettreCo, phraseBlocageLettreCo } = require('../modules/lettre-core/raisonsBlocageLettreCo.js');

const base = { cvPresent: true, cvRelu: true, situationActuelle: 'recherche' };

test('sans CV déposé : seul le CV est demandé en premier, puis la situation', () => {
  assert.deepEqual(raisonsBlocageLettreCo({}), ['déposer votre CV', 'indiquer votre situation actuelle dans « Adaptation au métier »']);
  assert.deepEqual(raisonsBlocageLettreCo({ cvPresent: true, situationActuelle: 'x' }), ['relire votre CV']);
});

test('CV relu mais aucun objectif : il faut choisir le type de candidature', () => {
  assert.deepEqual(raisonsBlocageLettreCo(base), ['choisir le type de candidature']);
});

test('offre : le métier suffit, ni entreprise, ni site, ni offre ne bloquent', () => {
  const o = Object.assign({}, base, { objectif: 'offre', modeRecherche: 'metier', metierCible: 'Boulanger', typeRecherche: 'offre', entreprise: '' });
  assert.deepEqual(raisonsBlocageLettreCo(o), []);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { metierCible: '  ' })), ['indiquer le métier visé']);
});

test('domaine : le domaine puis un intitulé de poste sont exigés, pas le métier', () => {
  const o = Object.assign({}, base, { objectif: 'spontanee', modeRecherche: 'domaine', secteurCible: '', typeRecherche: 'simple' });
  assert.deepEqual(raisonsBlocageLettreCo(o), ['indiquer le domaine visé']);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { secteurCible: 'Bâtiment' })), ['choisir l’intitulé de poste à mettre en avant']);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { secteurCible: 'Bâtiment', intituleDomaine: '  ' })), ['choisir l’intitulé de poste à mettre en avant']);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { secteurCible: 'Bâtiment', intituleDomaine: 'Aide-maçon polyvalent' })), []);
});

test('spontanée : le choix général ou entreprise est exigé, et le nom de l\'entreprise si elle est visée', () => {
  const o = Object.assign({}, base, { objectif: 'spontanee', modeRecherche: 'metier', metierCible: 'Plombier' });
  assert.deepEqual(raisonsBlocageLettreCo(o), ['dire si vous vous adressez à une entreprise précise ou non']);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { typeRecherche: 'simple' })), []);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { typeRecherche: 'offre' })), ['indiquer le nom de l’entreprise']);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { typeRecherche: 'offre', entreprise: 'XEFI' })), []);
});

test('changer de métier : le métier, puis l\'un des trois choix ; seul « entreprise précise sans offre » exige le nom', () => {
  const o = Object.assign({}, base, { objectif: 'reconversion', modeRecherche: 'metier', metierCible: 'Aide-soignant' });
  assert.deepEqual(raisonsBlocageLettreCo(o), ['dire si vous répondez à une offre, visez une entreprise précise ou cherchez de façon générale']);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { typeRecherche: 'simple', forme: 'generale' })), []);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { typeRecherche: 'offre', forme: 'offre' })), []);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { typeRecherche: 'offre', forme: 'entreprise' })), ['indiquer le nom de l’entreprise']);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, o, { typeRecherche: 'offre', forme: 'entreprise', entreprise: 'XEFI' })), []);
  assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, base, { objectif: 'reconversion' })), ['dire si vous visez un métier précis ou plusieurs métiers d’un domaine']);
});

test('stage, alternance, immersion, formation : objectif et situation suffisent', () => {
  for (const objectif of ['stage', 'alternance', 'pmsmp', 'formation']) {
    assert.deepEqual(raisonsBlocageLettreCo(Object.assign({}, base, { objectif })), []);
    assert.deepEqual(raisonsBlocageLettreCo({ cvPresent: true, cvRelu: true, objectif }), ['indiquer votre situation actuelle dans « Adaptation au métier »']);
  }
});

test('phraseBlocageLettreCo : vide sans raison, « Il reste à A et à B. » sinon', () => {
  assert.equal(phraseBlocageLettreCo([]), '');
  assert.equal(phraseBlocageLettreCo(['A']), 'Il reste à A.');
  assert.equal(phraseBlocageLettreCo(['A', 'B']), 'Il reste à A et à B.');
  assert.equal(phraseBlocageLettreCo(['A', 'B', 'C']), 'Il reste à A, à B et à C.');
});
