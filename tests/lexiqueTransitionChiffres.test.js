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
  const suivie = { id: 'suivie', corps: 'Une aide de 500 € pendant douze mois.', detailsAJour: { verifieLe: '2026-11-03', phraseGenerale: 'Une aide dont le montant et la durée changent.', source: { nom: 'x', url: 'https://exemple.fr' }, lignes: [{ libelle: 'Montant', valeur: '500 €', categorie: 'montant', peutChanger: true }] } };
  const sansGenerale = Object.assign({}, suivie, { detailsAJour: Object.assign({}, suivie.detailsAJour, { phraseGenerale: undefined }) });
  assert.strictEqual(regles.controlerChiffresDuTexte([sansGenerale], []).length, 1, 'un chiffre du texte exige la phrase générale du bloc (consigne 95)');
  assert.deepStrictEqual(regles.controlerChiffresDuTexte([suivie], []), [], 'un chiffre du texte est permis quand la fiche a son bloc « Les chiffres à jour » (consigne 94, 03/11/2026)');
  assert.strictEqual(regles.controlerChiffresDuTexte([Object.assign({}, suivie, { detailsAJour: { lignes: [] } })], []).length, 1, 'un bloc vide ne suit rien');
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
  const propre = fiches.filter((f) => !R.reperes(f.corps).length && !f.detailsAJour)[0];
  propre.corps += ' Elle est ouverte depuis 2031.';
  const e = regles.controlerChiffresDuTexte(fiches, liste);
  assert.strictEqual(e.length, 1);
  assert.ok(e[0].indexOf('"' + propre.id + '"') !== -1);
});

test('second niveau : un chiffre exige le suivi (date, source, phrase générale sans chiffre), sauf entrée de la liste de transition', () => {
  const suivi = { verifieLe: '2026-11-03', source: { nom: 'Service Public', url: 'https://www.service-public.gouv.fr' }, phraseGenerale: 'Une règle qui change : consultez la source officielle.' };
  const avec = { id: 'a', corps: 'Depuis le 1er septembre 2026, la durée est de 15 mois.' };
  assert.strictEqual(regles.controlerSecondNiveau([avec], []).length, 1, 'chiffre sans suivi : erreur');
  assert.deepStrictEqual(regles.controlerSecondNiveau([Object.assign({}, avec, { suivi: suivi })], []), [], 'chiffre avec suivi : permis');
  assert.deepStrictEqual(regles.controlerSecondNiveau([avec], ['a']), [], 'chiffre sans suivi mais sur la liste de transition : permis');
  assert.strictEqual(regles.controlerSecondNiveau([Object.assign({}, avec, { suivi: suivi })], ['a']).length, 1, 'listé alors qu\'il a son suivi : à retirer de la liste');
  assert.strictEqual(regles.controlerSecondNiveau([{ id: 'b', corps: 'Un texte sans aucun chiffre.' }], ['b']).length, 1, 'listé sans chiffre : à retirer de la liste');
  assert.strictEqual(regles.controlerSecondNiveau([avec], ['inconnu', 'a']).length, 1, 'la liste cite une entrée qui n\'existe pas');
  assert.ok(regles.controlerSecondNiveau([Object.assign({}, avec, { suivi: Object.assign({}, suivi, { phraseGenerale: 'Une durée de 15 mois.' }) })], []).some((m) => /aucun chiffre/.test(m)), 'la phrase générale ne contient aucun chiffre');
  assert.ok(regles.controlerSecondNiveau([Object.assign({}, avec, { suivi: Object.assign({}, suivi, { phraseGenerale: '' }) })], []).some((m) => /phrase générale manque/.test(m)));
  assert.ok(regles.controlerSecondNiveau([Object.assign({}, avec, { suivi: Object.assign({}, suivi, { verifieLe: '2026-02-30' }) })], []).some((m) => /vraie date/.test(m)));
  assert.ok(regles.controlerSecondNiveau([Object.assign({}, avec, { suivi: Object.assign({}, suivi, { source: { nom: 'x', url: 'http://non-securise.fr' } }) })], []).some((m) => /https/.test(m)));
  assert.ok(regles.controlerSecondNiveau([Object.assign({}, avec, { suivi: Object.assign({}, suivi, { inconnu: 1 }) })], []).some((m) => /Champ inconnu/.test(m)));
});

test('second niveau : le VRAI Lexique respecte la règle (tout chiffre a son suivi ou sa place sur la liste de transition, liste triée)', () => {
  const donnees = regles.chargerDonnees();
  const liste = regles.lireTransition(fs.readFileSync(regles.CHEMIN_TRANSITION_SECOND_NIVEAU, 'utf8'));
  assert.deepStrictEqual(regles.controlerSecondNiveau(donnees.LEXIQUE_SECOND_NIVEAU, liste), []);
  assert.strictEqual(new Set(liste).size, liste.length, 'aucun identifiant en double dans la liste');
  assert.deepStrictEqual(liste.slice().sort(), liste, 'liste triée : une modification se relit facilement');
});
