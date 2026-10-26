const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../scripts/reperesChiffres.js');
const lex = require('../outils/veilleLexique.js');
const mots = require('../outils/veilleMots.js');

const cats = (t) => R.reperes(t).map((r) => r.cat + ':' + r.texte);

test('reperes : les six categories sont reconnues, avec le texte exact repere', () => {
  assert.deepStrictEqual(cats('Un plafond de 1 500 € par an.'), ['montant:1 500 €']);
  assert.ok(cats('Depuis le 26 février 2026, un décret.').indexOf('date:26 février 2026') !== -1);
  assert.ok(cats('Pendant douze mois, puis 5 dernières années.').indexOf('duree:douze mois') !== -1);
  assert.ok(cats('Pendant douze mois, puis 5 dernières années.').indexOf('duree:5 dernières années') !== -1);
  assert.deepStrictEqual(cats('Une hausse de 3,5 %.'), ['pourcent:3,5 %']);
  assert.ok(cats('Selon la loi n° 2023-1196 du 18 décembre 2023.').some((x) => x.indexOf('ref:loi n° 2023-1196') === 0));
  assert.deepStrictEqual(cats('Les jeunes de 18 à 25 ans.'), ['seuil:de 18 à 25 ans']);
  assert.deepStrictEqual(cats('aux 16-25 ans'), ['seuil:16-25 ans']);
  assert.deepStrictEqual(cats('au moins 15 km par trajet'), ['seuil:15 km']);
  assert.deepStrictEqual(cats('à partir de 50 salariés'), ['seuil:50 salariés']);
});

test('reperes : un chiffre qui fait partie d\'un nom n\'est jamais un repere', () => {
  ['Le 115 est gratuit, 24h/24.', 'Le 3919 est gratuit.', 'Le bulletin n° 3 est un extrait.', 'de A1 (débutant) à C2', 'permis A1, A2, B, B1, BE', 'La Fondation de la 2ème Chance', 'Le contrat s\'appelle O2R', 'Drogues Info Service (0 800 23 13 13)']
    .forEach((t) => assert.deepStrictEqual(R.reperes(t), [], t));
  assert.ok(R.reperes('Le 115 existe depuis 1993.').some((r) => r.cat === 'date'), 'une annee reste un repere meme a cote d\'un nom a chiffre');
});

test('reperes : jamais deux reperes sur le meme texte, ordonnes par position, extrait et categories', () => {
  const t = 'Jusqu\'à 1 600 € pendant douze mois depuis 2026.';
  const r = R.reperes(t);
  for (let i = 1; i < r.length; i++) { assert.ok(r[i].debut >= r[i - 1].fin, 'pas de chevauchement'); }
  assert.deepStrictEqual(R.categoriesDe(t), ['date', 'montant', 'duree']);
  assert.ok(R.extrait(t).indexOf('1 600 €') !== -1);
  assert.strictEqual(R.extrait('Un texte sans aucun chiffre.'), '');
  assert.deepStrictEqual(R.reperes(''), []);
  assert.deepStrictEqual(R.reperes(undefined), []);
});

// Mesure sur le vrai Lexique (20 octobre 2026) : 64 fiches avec un chiffre quelque part, 70 fiches avec au moins un repere.
// Les fiches qui ont un chiffre mais AUCUN repere ne sont que des noms ou des numeros : la liste est courte, ecrite, et ne peut pas grandir sans qu'on la relise.
const NOMS_A_CHIFFRE = ['casier-judiciaire', 'hebergement-urgence', 'violences', 'addictologie', 'o2r', 'siao-115', 'accueil-de-jour', 'pension-invalidite', 'bulletin-n-3', 'bulletin-2-ou-bulletin-3', 'cecrl'];
test('mesure sur le vrai Lexique : tout chiffre est un repere, sauf dans les noms et numeros listes ; aucune fiche qui avait un chiffre n\'est perdue', () => {
  const tous = lex.lireMots(fs.readFileSync(path.join(__dirname, '..', 'data', 'lexique.js'), 'utf8'));
  const avecChiffre = tous.filter((m) => /\d/.test(m.corps));
  const sansRepere = avecChiffre.filter((m) => !R.reperes(m.corps).length).map((m) => m.id).sort();
  assert.deepStrictEqual(sansRepere, NOMS_A_CHIFFRE.slice().sort(), 'une fiche avec un chiffre et aucun repere : soit un nom a ajouter a la liste apres relecture, soit un repere que le detecteur rate');
  const avecRepere = tous.filter((m) => R.reperes(m.corps).length);
  assert.ok(avecRepere.length >= 64, 'le detecteur ne repere jamais moins que l\'ancien reperage (' + avecRepere.length + ')');
  // aucun repere n'est un faux positif de type « nom a chiffre » dans les fiches de la liste
  NOMS_A_CHIFFRE.forEach((id) => assert.deepStrictEqual(R.reperes(tous.filter((m) => m.id === id)[0].corps), [], id));
});

test('l\'avertissement du formulaire (veilleMots) utilise le detecteur partage et nomme la categorie', () => {
  const mot = { id: 'essai', titre: 'Essai', titreDeTri: 'Essai', type: 'terme', gabarit: '', univers: 'dispositifs', registres: ['langage-cip'], variantes: ['essai'], corps: 'Une aide de 500 € par an. Elle est versée sous conditions.', relations: [] };
  const v = mots.verifierMot(mot, [], { original: Object.assign({}, mot, { corps: 'Une aide. Elle est versée sous conditions.' }), phrase: 'x', transition: ['essai'] });
  const a = v.avertissements.filter((x) => /Chiffre ou date repéré/.test(x))[0];
  assert.ok(a, 'avertissement present');
  assert.match(a, /montant/);
  assert.match(a, /500 €/);
  const sans = mots.verifierMot(Object.assign({}, mot, { corps: 'Une aide versée sous conditions. Elle peut changer.' }), [], { nouveau: true });
  assert.ok(!sans.avertissements.some((x) => /Chiffre ou date repéré/.test(x)));
});

test('reperes : « un jour » et « un trimestre » en tournure ne sont pas des durees (mais « 1 jour » ou « 3 trimestres » le restent)', () => {
  assert.deepStrictEqual(R.reperes('Le dispositif pourrait être relancé un jour, de trimestre en trimestre, d\'un trimestre à l\'autre.'), []);
  assert.deepStrictEqual(R.reperes('Un délai de carence de 1 jour puis 3 trimestres.').map((r) => r.texte), ['1 jour', '3 trimestres']);
});
