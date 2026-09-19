const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctDecouperPhrases, ctDetecterDuplicationCvLettre, ctDetecterDuplicationAccroche, ctExecuterVerificationsDeterministes
} = require('../modules/coherence-transversale/analyse/verificationsDeterministes.js');

test('ctDecouperPhrases : decoupe sur la ponctuation de fin de phrase et les retours a la ligne', () => {
  const phrases = ctDecouperPhrases('Bonjour. Je suis motivé !\nJ’ai de l’expérience ?');
  assert.deepEqual(phrases, ['Bonjour.', 'Je suis motivé !', 'J’ai de l’expérience ?']);
});

test('ctDecouperPhrases : texte vide ou absent -> tableau vide, jamais une exception', () => {
  assert.deepEqual(ctDecouperPhrases(''), []);
  assert.doesNotThrow(() => ctDecouperPhrases(undefined));
});

test('ctDetecterDuplicationCvLettre : signale une phrase longue identique entre CV et lettre', () => {
  const phraseLongue = 'Professionnelle engagée avec cinq ans d’expérience en gestion de projet.';
  const dossier = { cv: 'Profil. ' + phraseLongue, lettre: 'Bonjour. ' + phraseLongue + ' Je postule avec motivation.' };
  const constats = ctDetecterDuplicationCvLettre(dossier);
  assert.equal(constats.length, 1);
  assert.equal(constats[0].nature, 'duplication');
  assert.deepEqual(constats[0].ancrage, ['cv', 'lettre']);
  assert.ok(constats[0].message.indexOf(phraseLongue) !== -1);
});

test('ctDetecterDuplicationCvLettre : ignore les phrases courtes/generiques (sous le seuil)', () => {
  const dossier = { cv: 'Cordialement.', lettre: 'Cordialement.' };
  assert.deepEqual(ctDetecterDuplicationCvLettre(dossier), []);
});

test('ctDetecterDuplicationCvLettre : insensible a la casse et aux espaces multiples, pas au sens', () => {
  const phraseLongue = 'Professionnelle engagée avec cinq ans d’expérience en gestion de projet.';
  const dossier = {
    cv: phraseLongue,
    lettre: '  PROFESSIONNELLE   ENGAGÉE avec cinq ans d’expérience en gestion   de projet.  '
  };
  assert.equal(ctDetecterDuplicationCvLettre(dossier).length, 1);
});

test('ctDetecterDuplicationCvLettre : aucune duplication -> tableau vide', () => {
  const dossier = { cv: 'Expérience en vente depuis trois ans.', lettre: 'Je suis très motivé pour ce poste précis.' };
  assert.deepEqual(ctDetecterDuplicationCvLettre(dossier), []);
});

test('ctDetecterDuplicationAccroche : signale l\'accroche du CV recopiee mot pour mot dans la lettre', () => {
  const accroche = 'Passionnée par la relation client, rigoureuse et toujours souriante.';
  const dossier = { lettre: 'Madame, Monsieur, ' + accroche + ' Je postule donc à votre offre.', accrocheCv: accroche };
  const constats = ctDetecterDuplicationAccroche(dossier);
  assert.equal(constats.length, 1);
  assert.deepEqual(constats[0].ancrage, ['cv.accroche', 'lettre']);
  assert.equal(constats[0].confiance, 'certaine');
});

test('ctDetecterDuplicationAccroche : idee reprise mais REFORMULEE differemment -> aucun constat', () => {
  const dossier = {
    lettre: 'Madame, Monsieur, mon sens du contact et ma rigueur font partie de mes points forts.',
    accrocheCv: 'Passionnée par la relation client, rigoureuse et toujours souriante.'
  };
  assert.deepEqual(ctDetecterDuplicationAccroche(dossier), []);
});

test('ctDetecterDuplicationAccroche : aucune accroche ou aucune lettre -> tableau vide, jamais une exception', () => {
  assert.deepEqual(ctDetecterDuplicationAccroche({ lettre: 'Texte.' }), []);
  assert.doesNotThrow(() => ctDetecterDuplicationAccroche({}));
});

test('ctExecuterVerificationsDeterministes : combine les deux verifications, ids uniques sur le resultat combine', () => {
  const phraseLongue = 'Professionnelle engagée avec cinq ans d’expérience en gestion de projet.';
  const accroche = 'Passionnée par la relation client, rigoureuse et toujours souriante.';
  const dossier = {
    cv: phraseLongue,
    lettre: phraseLongue + ' ' + accroche,
    accrocheCv: accroche
  };
  const constats = ctExecuterVerificationsDeterministes(dossier);
  assert.equal(constats.length, 2);
  const ids = constats.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('ctExecuterVerificationsDeterministes : dossier vide/absent -> tableau vide, jamais une exception', () => {
  assert.deepEqual(ctExecuterVerificationsDeterministes({}), []);
  assert.doesNotThrow(() => ctExecuterVerificationsDeterministes());
});
