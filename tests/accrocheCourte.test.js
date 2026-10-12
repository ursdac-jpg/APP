/* ============================================================
   tests/accrocheCourte.test.js  (R9, 2026-09-29 ; accroches courtes par definition depuis le 2026-10-10)
   ------------------------------------------------------------
   Les accroches sont courtes par definition (une phrase, prompts/cv.md) : plus de « Version courte » a choisir.
   La phrase affichee sur le CV est toujours la proposition choisie (dossier.ia.cv.profil). Les anciennes versions courtes
   eventuellement presentes dans un dossier, et l'ancien reglage accrocheCourte, sont ignores.
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { _cvAccrocheAffichee } = require('../modules/cv-core/normaliserDonneesCV.js');

const LONGUES = ['Accroche A, une phrase.', 'Accroche B, une phrase.', 'Accroche C.'];
const COURTES = ['Courte A.', 'Courte B.', ''];
function dossier(profil, courte, extra) {
  return Object.assign({ ia: { cv: { profil: profil, accrochesProposees: LONGUES.slice(), accrochesCourtesProposees: COURTES.slice() } },
    reglagesMiseEnPageCV: courte ? { accrocheCourte: true } : {} }, extra || {});
}

test('la phrase affichee est la proposition choisie', () => {
  assert.strictEqual(_cvAccrocheAffichee(dossier(LONGUES[1], false)), LONGUES[1]);
});

test('un ancien reglage « version courte » et de vieilles versions courtes sont ignores', () => {
  assert.strictEqual(_cvAccrocheAffichee(dossier(LONGUES[0], true)), LONGUES[0]);
  assert.strictEqual(_cvAccrocheAffichee(dossier(LONGUES[2], true)), LONGUES[2]);
  const ancienne = { ia: { cv: { profil: LONGUES[0], accrochesProposees: LONGUES.slice() } }, reglagesMiseEnPageCV: { accrocheCourte: true } };
  assert.strictEqual(_cvAccrocheAffichee(ancienne), LONGUES[0]);
});

test('une accroche modifiee a la main est affichee telle quelle', () => {
  const d = dossier('Ma phrase reecrite', true);
  d.ia.cv.accrocheIdx = 1;
  assert.strictEqual(_cvAccrocheAffichee(d), 'Ma phrase reecrite');
});

test('sans accroche, rien', () => {
  assert.strictEqual(_cvAccrocheAffichee({ ia: { cv: { profil: '' } } }), '');
  assert.strictEqual(_cvAccrocheAffichee({}), '');
});

test('Le prompt du CV demande 5 accroches de longueur moyenne, sans version courte séparée (décision de Denis, 2026-10-10)', () => {
  const prompt = fs.readFileSync(path.join(__dirname, '..', 'prompts/cv.md'), 'utf8');
  assert.ok(prompt.indexOf('longueur MOYENNE') !== -1, 'les accroches sont de longueur moyenne');
  assert.ok(prompt.indexOf('deux phrases, 45 mots au plus') !== -1);
  assert.ok(prompt.indexOf('accrochesCourtesProposees') === -1, 'plus de version courte séparée dans la demande');
  assert.ok(prompt.indexOf('"accrochesProposees"') !== -1);
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
  assert.strictEqual(_cvAccrocheAffichee({ ia: { cv: cv } }), 'Bilan 1.');
});

test('R9 partie 2 : une accroche du Bilan retouchée à la main garde la courte de sa proposition d\'origine', () => {
  const cv = { profil: '', accrochesProposees: [], accrochesCourtesProposees: [] };
  _cvAjouterAccrochesAvecCourtes(cv, ['P0.', 'P1.'], ['c0.', 'c1.'], 'P1 retouchée.', 1);
  assert.strictEqual(cv.profil, 'P1 retouchée.');
  assert.strictEqual(_cvAccrocheAffichee({ ia: { cv: cv } }), 'P1 retouchée.');
});

test('Le prompt de Découvrir ne demande plus de version courte séparée (comme celui du CV)', () => {
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', 'prompts', f), 'utf8');
  assert.ok(lire('decouverte-redaction.md').indexOf('accrochesCourtesProposees') === -1);
  assert.ok(lire('decouverte-redaction.md').indexOf('longueur MOYENNE') !== -1);
  assert.ok(lire('decouverte-redaction.md').indexOf('Voulez-vous aussi le complément de CV') !== -1, 'Découverte propose aussi le complément');
  assert.ok(lire('decouverte-redaction.md').indexOf('Rédige 8 à 10 missions concrètes pour la formation retenue') !== -1, 'les 8 à 10 missions de la formation sont dans le complément');
});

test('Le prompt du CV propose le complément de CV : question après le bloc, second bloc limité aux formations, certifications et loisir', () => {
  const prompt = fs.readFileSync(path.join(__dirname, '..', 'prompts/cv.md'), 'utf8');
  assert.ok(prompt.indexOf('Voulez-vous aussi le complément de CV') !== -1);
  assert.ok(prompt.indexOf('Copiez ce message dans l') !== -1);
  assert.ok(prompt.indexOf('couleursEntrepriseSuggerees') !== -1, 'les couleurs d entreprise sont dans le complément');
  assert.ok(prompt.indexOf('"formationsAvecMissions"') !== -1 && prompt.indexOf('"certificationsAvecMissions"') !== -1 && prompt.indexOf('"loisirRetenu"') !== -1);
  assert.ok(prompt.indexOf('Aucune mission pour un Baccalauréat général') !== -1);
});
