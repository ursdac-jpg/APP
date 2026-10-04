// Fragment commun « voix humaine » (prompts/_voix-humaine.md) : present, sans tiret cadratin, et repris par les prompts qui redigent un texte pour la personne.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..', 'prompts');
const lire = (nom) => fs.readFileSync(path.join(racine, nom), 'utf8');

test('le fragment voix humaine existe, sans tiret cadratin ni demi-cadratin', () => {
  const f = lire('_voix-humaine.md');
  assert.ok(f.includes('Une voix humaine'));
  assert.ok(!/[\u2013\u2014]/.test(f), 'pas de tiret long dans le fragment');
  assert.ok(!/\bIA\b/.test(f), 'jamais le mot IA');
});

test('les sept prompts de redaction portent le repere {{VOIX_HUMAINE}} une seule fois', () => {
  ['cv', 'decouverte-redaction', 'lettre', 'lettre-co', 'entretien', 'entretien-accueil', 'reformuler-cv'].forEach((nom) => {
    const t = lire(nom + '.md');
    assert.equal(t.split('{{VOIX_HUMAINE}}').length - 1, 1, nom);
  });
});

test('les prompts de reecriture du Bilan (Prompt 2 et lot) portent {VOIX_HUMAINE} une seule fois', () => {
  ['bilan-v2.md', 'bilan-v2-lot.md'].forEach((nom) => {
    assert.equal(lire(nom).split('{VOIX_HUMAINE}').length - 1, 1, nom);
  });
});

test('le prompt titre et accroche du Bilan porte le repere {VOIX_HUMAINE} et le builder le remplace', () => {
  const tpl = lire('bilan-titre-accroche.md');
  assert.equal(tpl.split('{VOIX_HUMAINE}').length - 1, 1);
  const { bilanConstruirePromptTitreAccroche } = require('../modules/bilan-candidature/amelioration/titreAccrochePromptBuilder.js');
  const r = bilanConstruirePromptTitreAccroche(tpl, { cv: 'CV test', metierVise: 'Vendeur', offreEmploi: '' });
  assert.ok(!r.texte.includes('{VOIX_HUMAINE}'));
});
