/* ============================================================
   tests/accrocheCourte.test.js  (R9, 2026-09-29)
   ------------------------------------------------------------
   Chaque proposition d'accroche a une version courte (une phrase, meme rang). La personne choisit la longue ou la courte
   (dossier.reglagesMiseEnPageCV.accrocheCourte). Sans version courte pour la proposition choisie, la longue reste affichee :
   le code n'invente ni ne raccourcit jamais une accroche.
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { _cvAccrocheAffichee, _cvAccrocheCourteChoisie } = require('../modules/cv-core/normaliserDonneesCV.js');

const LONGUES = ['Accroche longue A, avec plusieurs phrases.', 'Accroche longue B, avec plusieurs phrases.', 'Accroche longue C.'];
const COURTES = ['Courte A.', 'Courte B.', ''];
function dossier(profil, courte, extra) {
  return Object.assign({ ia: { cv: { profil: profil, accrochesProposees: LONGUES.slice(), accrochesCourtesProposees: COURTES.slice() } },
    reglagesMiseEnPageCV: courte ? { accrocheCourte: true } : {} }, extra || {});
}

test('R9 : sans le réglage « version courte », c\'est la version longue', () => {
  assert.strictEqual(_cvAccrocheAffichee(dossier(LONGUES[1], false)), LONGUES[1]);
});

test('R9 : avec le réglage, la version courte de la MÊME proposition (même rang)', () => {
  assert.strictEqual(_cvAccrocheAffichee(dossier(LONGUES[0], true)), 'Courte A.');
  assert.strictEqual(_cvAccrocheAffichee(dossier(LONGUES[1], true)), 'Courte B.');
});

test('R9 : sans version courte pour la proposition choisie, la longue reste affichée', () => {
  assert.strictEqual(_cvAccrocheAffichee(dossier(LONGUES[2], true)), LONGUES[2]);
  const ancienne = { ia: { cv: { profil: LONGUES[0], accrochesProposees: LONGUES.slice() } }, reglagesMiseEnPageCV: { accrocheCourte: true } };
  assert.strictEqual(_cvAccrocheAffichee(ancienne), LONGUES[0]);
});

test('R9 : une longue modifiée à la main garde sa version courte grâce au rang mémorisé (accrocheIdx)', () => {
  const d = dossier('Ma version longue réécrite', true);
  assert.strictEqual(_cvAccrocheAffichee(d), 'Ma version longue réécrite', 'sans rang connu, on ne devine pas : la longue');
  d.ia.cv.accrocheIdx = 1;
  assert.strictEqual(_cvAccrocheAffichee(d), 'Courte B.');
  d.reglagesMiseEnPageCV.accrocheCourte = false;
  assert.strictEqual(_cvAccrocheAffichee(d), 'Ma version longue réécrite');
});

test('R9 : une version courte modifiée à la main est celle qui s\'affiche', () => {
  const d = dossier(LONGUES[0], true);
  d.ia.cv.accrochesCourtesProposees[0] = 'Courte A réécrite.';
  assert.strictEqual(_cvAccrocheAffichee(d), 'Courte A réécrite.');
  assert.strictEqual(_cvAccrocheCourteChoisie(d.ia.cv), 'Courte A réécrite.');
});

test('R9 : pas d\'accroche du tout : rien', () => {
  assert.strictEqual(_cvAccrocheAffichee({ ia: { cv: { profil: '' } }, reglagesMiseEnPageCV: { accrocheCourte: true } }), '');
  assert.strictEqual(_cvAccrocheAffichee({}), '');
});

test('R9 : le prompt du CV demande les versions courtes', () => {
  const prompt = fs.readFileSync(path.join(__dirname, '..', 'prompts/cv.md'), 'utf8');
  assert.ok(prompt.indexOf('"accrochesCourtesProposees"') !== -1);
  assert.ok(prompt.indexOf('`accrochesCourtesProposees`') !== -1);
});

const { _cvAjouterAccrochesAvecCourtes, _cvMemoriserRangAccroche, _cvRangAccrocheChoisie } = require('../modules/cv-core/normaliserDonneesCV.js');

test('R9 partie 2 : un rang mémorisé est ignoré si un autre circuit a changé le texte de l\'accroche depuis', () => {
  const cv = { profil: LONGUES[0], accrochesProposees: LONGUES.slice(), accrochesCourtesProposees: COURTES.slice() };
  _cvMemoriserRangAccroche(cv, 0);
  assert.strictEqual(_cvRangAccrocheChoisie(cv), 0);
  cv.profil = LONGUES[1]; // écrit par le Bilan ou un import, sans passer par le rang
  assert.strictEqual(_cvRangAccrocheChoisie(cv), 1, 'on retombe sur le rang du texte, jamais la courte de l\'ancienne accroche');
  cv.profil = 'Texte inconnu de la liste';
  assert.strictEqual(_cvRangAccrocheChoisie(cv), -1);
  assert.strictEqual(_cvAccrocheAffichee({ ia: { cv: cv }, reglagesMiseEnPageCV: { accrocheCourte: true } }), 'Texte inconnu de la liste');
});

test('R9 partie 2 : les propositions du Bilan rejoignent celles du CV avec leur courte, sans rien perdre', () => {
  const cv = { profil: LONGUES[0], accrochesProposees: LONGUES.slice(), accrochesCourtesProposees: COURTES.slice() };
  _cvAjouterAccrochesAvecCourtes(cv, ['Bilan 1.', 'Bilan 2.'], ['Bilan 1 courte.', ''], 'Bilan 1.', 0);
  assert.deepStrictEqual(Array.from(cv.accrochesProposees), LONGUES.concat(['Bilan 1.', 'Bilan 2.']));
  assert.deepStrictEqual(Array.from(cv.accrochesCourtesProposees), COURTES.concat(['Bilan 1 courte.', '']));
  assert.strictEqual(cv.profil, 'Bilan 1.');
  assert.strictEqual(_cvAccrocheAffichee({ ia: { cv: cv }, reglagesMiseEnPageCV: { accrocheCourte: true } }), 'Bilan 1 courte.');
});

test('R9 partie 2 : une accroche du Bilan retouchée à la main garde la courte de sa proposition d\'origine', () => {
  const cv = { profil: '', accrochesProposees: [], accrochesCourtesProposees: [] };
  _cvAjouterAccrochesAvecCourtes(cv, ['P0.', 'P1.'], ['c0.', 'c1.'], 'P1 retouchée.', 1);
  assert.strictEqual(cv.profil, 'P1 retouchée.');
  assert.strictEqual(_cvAccrocheAffichee({ ia: { cv: cv }, reglagesMiseEnPageCV: { accrocheCourte: true } }), 'c1.');
});

test('R9 partie 2 : les prompts du Bilan et de Découvrir demandent les versions courtes', () => {
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', 'prompts', f), 'utf8');
  assert.ok(lire('bilan-titre-accroche.md').indexOf('"accrochesCourtes"') !== -1);
  assert.ok(lire('decouverte-redaction.md').indexOf('"accrochesCourtesProposees"') !== -1);
});
