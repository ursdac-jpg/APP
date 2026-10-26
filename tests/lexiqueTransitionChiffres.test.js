const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const R = require('../scripts/reperesChiffres.js');
const regles = require('../scripts/checkLexique.js');

test('transition : un chiffre dans le texte d\'une fiche hors liste est une erreur ; une fiche listee sans chiffre doit sortir de la liste ; un identifiant inconnu est refuse', () => {
  const fiches = [
    { id: 'propre', corps: 'Un texte sans aucun chiffre. Il explique un mot.' },
    { id: 'avec-chiffre', corps: 'Une aide de 500 € pendant douze mois.' },
    { id: 'listee-avec-chiffre', corps: 'Depuis 2026, cette règle existe.' },
    { id: 'listee-propre', corps: 'Un texte devenu sans chiffre.' },
    { id: 'nom-a-chiffre', corps: 'Le 115 répond jour et nuit, comme le 3919.' }
  ];
  const e = regles.controlerChiffresDuTexte(fiches, ['listee-avec-chiffre', 'listee-propre', 'fantome']);
  assert.strictEqual(e.length, 3);
  assert.ok(e.some((m) => /"avec-chiffre"/.test(m) && /500 €/.test(m) && /bloc « Les chiffres à jour »/.test(m)));
  assert.ok(e.some((m) => /"listee-propre"/.test(m) && /Retirez-la/.test(m)));
  assert.ok(e.some((m) => /"fantome"/.test(m) && /n'est pas une fiche/.test(m)));
  assert.deepStrictEqual(regles.controlerChiffresDuTexte(fiches.slice(0, 1), []), []);
  assert.deepStrictEqual(regles.controlerChiffresDuTexte([fiches[4]], []), [], 'un numero d\'urgence n\'est pas un chiffre a deplacer');
});

test('transition : la lecture du fichier ignore les commentaires et les lignes vides', () => {
  assert.deepStrictEqual(regles.lireTransition('# titre\n\nabc\n  def  # note\r\n\n'), ['abc', 'def']);
  assert.deepStrictEqual(regles.lireTransition(''), []);
});

test('transition : le VRAI Lexique respecte la regle (tout chiffre du texte est sur la liste, toute fiche listee a encore un chiffre)', () => {
  const fiches = regles.chargerDonnees().LEXIQUE_FICHES;
  const liste = regles.lireTransition(fs.readFileSync(regles.CHEMIN_TRANSITION, 'utf8'));
  assert.deepStrictEqual(regles.controlerChiffresDuTexte(fiches, liste), []);
  assert.strictEqual(new Set(liste).size, liste.length, 'aucun identifiant en double dans la liste');
  assert.deepStrictEqual(liste.slice().sort(), liste, 'liste triee : une modification se relit facilement');
});

test('transition : ajouter un chiffre dans le texte d\'une fiche propre FAIT echouer la regle (le verrou tient)', () => {
  const fiches = regles.chargerDonnees().LEXIQUE_FICHES.map((f) => Object.assign({}, f));
  const liste = regles.lireTransition(fs.readFileSync(regles.CHEMIN_TRANSITION, 'utf8'));
  const propre = fiches.filter((f) => !R.reperes(f.corps).length)[0];
  propre.corps += ' Elle est ouverte depuis 2031.';
  const e = regles.controlerChiffresDuTexte(fiches, liste);
  assert.strictEqual(e.length, 1);
  assert.ok(e[0].indexOf('"' + propre.id + '"') !== -1);
});
