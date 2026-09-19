const { test } = require('node:test');
const assert = require('node:assert/strict');

const { bilanConstruirePromptTitreAccroche } = require('../modules/bilan-candidature/amelioration/titreAccrochePromptBuilder.js');

const TEMPLATE = 'Métier visé : {METIER_VISE_OU_NON_FOURNI}\nOffre : {OFFRE_EMPLOI_OU_NON_FOURNIE}\nCV :\n{CV_TEXTE}';

test('remplace les 3 emplacements avec les valeurs fournies', () => {
  const prompt = bilanConstruirePromptTitreAccroche(TEMPLATE, {
    cv: 'Expériences : Vendeur, 3 ans.',
    metierVise: 'Chargé de clientèle',
    offreEmploi: 'Offre pour un poste de conseiller.'
  });
  assert.equal(prompt.texte, 'Métier visé : Chargé de clientèle\nOffre : Offre pour un poste de conseiller.\nCV :\nExpériences : Vendeur, 3 ans.');
});

test('metierVise et offreEmploi absents -> "Non fourni.", jamais un champ vide ou undefined', () => {
  const prompt = bilanConstruirePromptTitreAccroche(TEMPLATE, { cv: 'x' });
  assert.equal(prompt.texte, 'Métier visé : Non fourni.\nOffre : Non fourni.\nCV :\nx');
});

test('cv absent -> "Non fourni." egalement, jamais undefined dans le texte', () => {
  const prompt = bilanConstruirePromptTitreAccroche(TEMPLATE, {});
  assert.equal(prompt.texte.indexOf('undefined'), -1);
  assert.ok(prompt.texte.indexOf('CV :\nNon fourni.') !== -1);
});

test('espaces superflus dans metierVise/offreEmploi -> retires (trim)', () => {
  const prompt = bilanConstruirePromptTitreAccroche(TEMPLATE, { cv: 'x', metierVise: '  Vendeur  ' });
  assert.ok(prompt.texte.indexOf('Métier visé : Vendeur\n') !== -1);
});

test('dateGeneration : utilise l\'horodatage injecte, jamais Date.now() en dur', () => {
  const prompt = bilanConstruirePromptTitreAccroche(TEMPLATE, { cv: 'x' }, () => '2026-08-25T10:00:00.000Z');
  assert.equal(prompt.dateGeneration, '2026-08-25T10:00:00.000Z');
});
