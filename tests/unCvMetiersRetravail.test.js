const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Logique pure du passage « Retravailler une lettre » (page 6) : ce qui part chez l'assistant et ce qui n'en part pas.
const base = require('../modules/un-cv-plusieurs-metiers/logique.js');
Object.assign(global, base);
const metiers = require('../modules/un-cv-plusieurs-metiers/logiqueMetiers.js');
Object.assign(global, metiers);
const cv = require('../modules/un-cv-plusieurs-metiers/logiqueCv.js');

const lire = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const LIGNES = { spontanee: 'ligne spontanée', offre: 'ligne offre', reconversion: 'ligne reconversion', stage: 'ligne stage', pmsmp: 'ligne immersion', alternance: 'ligne alternance', formation: 'ligne formation' };

test('retravail : la signature (le nom) est retirée, la formule d’appel et de politesse restent', () => {
  const l = 'Madame, Monsieur,\n\nCorps de la lettre.\n\nCordialement.\n\nCamille Martin';
  assert.equal(cv.ucpmRetirerSignature(l, 'Camille Martin'), 'Madame, Monsieur,\n\nCorps de la lettre.\n\nCordialement.');
  assert.equal(cv.ucpmRetirerSignature(l, 'camille  MARTIN'), 'Madame, Monsieur,\n\nCorps de la lettre.\n\nCordialement.', 'casse et espaces ignorés');
  assert.equal(cv.ucpmRetirerSignature('Corps.\n\nCordialement.', 'Camille Martin'), 'Corps.\n\nCordialement.', 'sans signature : rien ne change');
  assert.equal(cv.ucpmRetirerSignature('Corps.\n\nCamille', 'Camille Martin'), 'Corps.\n\nCamille', 'un prénom seul n’est pas le nom complet');
  assert.equal(cv.ucpmRetirerSignature(l, ''), l, 'sans nom connu : le texte est gardé');
  assert.equal(cv.ucpmRetirerSignature(null, 'X'), '');
  assert.ok(!cv.ucpmRetirerSignature('Texte\n\nCamille Martin\n', 'Camille Martin').includes('Camille'));
});

test('retravail : le bloc des lettres porte l’objectif, la lettre actuelle et la remarque, numérotés dans l’ordre', () => {
  const o = metiers.ucpmObjectifVide('offre');
  Object.assign(o, { employeur: 'Résidences des Tilleuls', civiliteRecruteur: 'Madame', nomRecruteur: 'Martin', posteOffre: 'Gardien' });
  const t = cv.ucpmBlocLettresRetravail([
    { titre: 'Agent', accroche: 'Agent.', objectif: metiers.ucpmObjectifVide('spontanee'), lettre: 'Madame, Monsieur,\n\nCorps A.', remarque: '  Parler du   bénévolat. ' },
    { titre: 'Gardien', accroche: 'Gardien.', objectif: o, lettre: 'Madame Martin,\n\nCorps B.', remarque: '' }], LIGNES);
  ['1. Titre du CV : Agent', '2. Titre du CV : Gardien', 'Recruteur : Madame Martin', 'Employeur : Résidences des Tilleuls', 'Corps A.', 'Corps B.'].forEach((x) => assert.ok(t.includes(x), x));
  assert.ok(t.includes('Ce que la personne veut changer ou ajouter : Parler du bénévolat.'), 'remarque nettoyée');
  assert.ok(t.includes('Ce que la personne veut changer ou ajouter : aucune remarque'), 'sans remarque');
  assert.ok(!/\n2\. Titre du CV : Agent/.test(t) && !t.includes('1. Titre du CV : Gardien'), 'numérotation propre');
});

test('retravail : le prompt est rempli, sans marqueur restant, et la lettre part sans signature', () => {
  const lettre = cv.ucpmRetirerSignature('Madame, Monsieur,\n\nCorps.\n\nCordialement.\n\nCamille Martin', 'Camille Martin');
  const bloc = cv.ucpmBlocLettresRetravail([{ titre: 'Agent', accroche: 'A.', objectif: metiers.ucpmObjectifVide('spontanee'), lettre, remarque: 'Plus court.' }], LIGNES);
  const t = cv.ucpmConstruirePromptRetravail(lire('prompts/ucpm-lettres-retravail.md'), { sexe: 'f', profil: 'Profil validé', lettres: bloc });
  assert.ok(!/\{(GENRE|PROFIL|LETTRES)\}/.test(t), 'aucun marqueur restant');
  assert.ok(t.includes('Féminin : la personne est une femme'));
  assert.ok(t.includes('Profil validé') && t.includes('Plus court.') && t.includes('Corps.'));
  assert.ok(!t.includes('Camille Martin'), 'le nom ne part pas');
});

test('retravail : les lettres retravaillées se lisent comme les lettres (même format de réponse)', () => {
  const rep = '```json\n[{"id":1,"metier":"Agent","lettre":"Madame, Monsieur,\\n\\nCorps.\\n\\nCordialement."}]\n```';
  const r = cv.ucpmLireReponseLettres(rep, ['d1']);
  assert.equal(r.succes, true);
  assert.equal(r.lettres.d1, 'Madame, Monsieur,\n\nCorps.\n\nCordialement.');
  const pretes = cv.ucpmPreparerLettresRecues(r.lettres, [{ id: 'd1', objectif: metiers.ucpmObjectifVide('spontanee') }], 'Camille Martin');
  assert.ok(pretes.d1.endsWith('\n\nCamille Martin'), 'la signature est remise par l’application');
});

test('retravail : les cibles sont la lettre choisie, ou toutes les lettres qui existent', () => {
  const entrees = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(cv.ucpmCiblesRetravail({ id: 'b', toutes: false }, entrees).map((e) => e.id), ['b']);
  assert.deepEqual(cv.ucpmCiblesRetravail({ id: 'b', toutes: true }, entrees).map((e) => e.id), ['a', 'b', 'c']);
  assert.deepEqual(cv.ucpmCiblesRetravail({ id: 'z', toutes: false }, entrees), [], 'une lettre disparue ne fait rien');
  assert.deepEqual(cv.ucpmCiblesRetravail(null, entrees), []);
});

test('retravail : l’état initial et la reprise d’une sauvegarde portent les nouveaux champs', () => {
  const e = base.ucpmEtatInitial();
  assert.equal(e.retravail, null);
  assert.deepEqual(e.lettresAvant, {});
  const n = base.ucpmNormaliserEtat({ page: 6, p6Vue: 'retravail' });
  assert.deepEqual(n.lettresAvant, {}, 'une ancienne sauvegarde reçoit les champs manquants');
  assert.equal(n.retravail, null);
});

test('retravail : le prompt ne contient ni tiret long ni le mot « IA » visible par la personne', () => {
  const p = lire('prompts/ucpm-lettres-retravail.md').replace(/\(– ou —\)/, '');
  assert.ok(!/[–—]/.test(p), 'aucun tiret long hors de la consigne qui l’interdit');
});
