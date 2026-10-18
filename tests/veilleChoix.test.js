'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../outils/veilleChoix.js');
const L = require('../outils/veilleLexique.js');
const { creerDepot } = require('../outils/veilleDepot.js');

const RACINE = path.resolve(__dirname, '..');
const COLLECTE = 'sources:\n  - "src-un | Titre de la source un | https://exemple.org/un | 2026-09-04"\n  - "src-deux | Titre de la source deux | https://exemple.org/deux | 2026-09-05"\n  - "src-fantome | Source absente du registre | https://exemple.org/f | 2026-09-05"\n  - "src-un | Doublon | https://exemple.org/un | 2026-09-04"\nstructures:\n  - "asso-x | Structure | https://exemple.org/x | 2026-09-04"\n';
const REGISTRE = [{ nom: 'src-un', date: '2026-10-01' }, { nom: 'src-deux', date: '' }, { nom: 'asso-x', date: '2026-10-02' }];

test('sourcesDuRayon : titre et date du registre, jamais une source absente du registre, sans doublon', () => {
  const s = C.sourcesDuRayon(COLLECTE, REGISTRE);
  assert.deepStrictEqual(s.map((x) => [x.nom, x.titre, x.date]), [['src-un', 'Titre de la source un', '2026-10-01'], ['src-deux', 'Titre de la source deux', ''], ['asso-x', 'Structure', '2026-10-02']]);
  assert.deepStrictEqual(C.sourcesDuRayon('', REGISTRE), []);
});

test('premierePhrase : une phrase de 40 a 230 caracteres, sinon le debut du texte', () => {
  assert.strictEqual(C.premierePhrase('Le CESU permet a un particulier de declarer un salarie a son domicile. Deuxieme phrase ici.'), 'Le CESU permet a un particulier de declarer un salarie a son domicile.');
  assert.strictEqual(C.premierePhrase('Court.'), 'Court.');
  assert.strictEqual(C.premierePhrase(''), '');
});

const ENTREES = [
  { id: 'cesu', titre: 'CESU (cheque emploi service universel)', corps: 'Le CESU est un moyen simplifie de declarer un salarie a domicile. Suite.', variantes: ['garde', 'emploi chez un particulier'], relations: ['bulletin-salaire'] },
  { id: 'bulletin-salaire', titre: 'Bulletin de salaire', corps: 'Le bulletin de salaire est le document remis chaque mois a la personne salariee par son employeur.', variantes: [], relations: [] },
  { id: 'astreintes', titre: 'Astreintes', corps: 'Une astreinte est une periode pendant laquelle une personne reste disponible pour intervenir si besoin.', variantes: ['garde'], relations: [] },
  { id: 'conges-payes', titre: 'Conges payes', corps: 'Les conges payes sont des jours de repos payes par l\'employeur chaque annee de travail.', variantes: ['conges annuels'], relations: ['bulletin-salaire'] },
  { id: 'deja', titre: 'Deja lie', corps: 'Un mot deja lie a la fiche ne doit pas etre propose de nouveau a la personne.', variantes: [], relations: [] }
];

test('propositionsVoirAussi : texte puis rayon puis relation ; un mot isole trop general ne declenche rien ; les mots deja lies sont exclus', () => {
  const fiche = { id: 'emploi-x', titre: 'Travailler avec le CESU', pour_qui: 'Garde d\'enfant ou menage chez un particulier', corps: 'On peut avoir un emploi chez un particulier et aussi des conges annuels.', voir_aussi: ['deja'] };
  const autres = [{ voir_aussi: ['astreintes'] }, { voir_aussi: ['conges-payes', 'deja'] }];
  const p = C.propositionsVoirAussi(fiche, autres, ENTREES);
  assert.deepStrictEqual(p.map((x) => [x.id, x.raison, x.via]), [
    ['cesu', 'texte', ''], ['conges-payes', 'texte', ''], ['astreintes', 'rayon', ''], ['bulletin-salaire', 'relation', 'Conges payes']
  ]);
  assert.ok(!p.some((x) => x.id === 'deja'));
  assert.strictEqual(p[0].def, 'Le CESU est un moyen simplifie de declarer un salarie a domicile.');
  assert.ok(p.every((x) => x.titre));
});

test('motsDeRechercheDuRayon : les plus employes d\'abord, ordre alphabetique ensuite', () => {
  const m = C.motsDeRechercheDuRayon([{ tags: ['b', 'a'] }, { tags: ['b', 'c'] }, { tags: [] }, {}]);
  assert.deepStrictEqual(m, [{ t: 'b', n: 2 }, { t: 'a', n: 1 }, { t: 'c', n: 1 }]);
});

test('lireEntrees : le Lexique est lu comme du texte (jamais execute) : identifiant, titre, corps, variantes, relations', () => {
  const contenu = "var LEXIQUE_FICHES = [\n  {\n    id: 'a', titre: 'Un mot d\\'essai', type: 'terme',\n    variantesRecherche: ['premiere', \"deuxieme variante\"],\n    corps: \"Un corps avec une apostrophe d'essai. Suite.\",\n    relations: [ { ficheId: 'b', type: 'voir-aussi' }, { ficheId: 'c', type: 'a-ne-pas-confondre' } ]\n  },\n  {\n    id: 'b', titre: \"Autre\", variantesRecherche: [], corps: \"Corps.\"\n  }\n];\nvar LEXIQUE_COLLECTIONS = [];\n";
  const e = L.lireEntrees(contenu);
  assert.strictEqual(e.length, 2);
  assert.deepStrictEqual(e[0], { id: 'a', titre: 'Un mot d\'essai', corps: 'Un corps avec une apostrophe d\'essai. Suite.', variantes: ['premiere', 'deuxieme variante'], relations: ['b', 'c'] });
  assert.deepStrictEqual(e[1].relations, []);
  assert.strictEqual(L.lireEntrees('rien'), null);
});

test('lireEntrees : le vrai Lexique se lit en entier (tous les mots ont un titre et un corps)', () => {
  const e = L.lireEntrees(fs.readFileSync(path.join(RACINE, 'data', 'lexique.js'), 'utf8'));
  assert.ok(e.length >= 380);
  assert.ok(e.every((x) => x.titre && x.corps));
  assert.ok(e.reduce((n, x) => n + x.relations.length, 0) > 300, 'les relations sont lues');
});

test('lireFiche (vrai depot, lecture seule) : chaque fiche propose des choix du rayon ; la quasi-totalite de ses sources sont dans la liste du rayon', () => {
  const depot = creerDepot(RACINE, {});
  const liste = depot.listerFiches();
  let sources = 0, dansRayon = 0, fiches = 0;
  liste.fiches.filter((f) => !f.illisible).forEach((f) => {
    const r = depot.lireFiche(f.rayon, f.id);
    assert.ok(r.ok, f.id);
    fiches++;
    assert.ok(r.choix.lexique.length >= 380, f.id + ' : Lexique absent');
    assert.ok(r.choix.sourcesRayon.length >= 1, f.rayon + ' : aucune source de rayon');
    assert.ok(r.choix.propositions.every((p) => (r.champs.voir_aussi_lexique || []).indexOf(p.id) === -1), f.id + ' : un mot deja lie est propose');
    (r.champs.sources || []).forEach((s) => { sources++; if (r.choix.sourcesRayon.some((x) => x.nom === s)) { dansRayon++; } });
  });
  assert.ok(fiches >= 120);
  assert.ok(dansRayon / sources >= 0.9, 'au moins 90 % des sources des fiches sont dans la liste de leur rayon (mesure du 2026-10-18 : 97 %) : ' + dansRayon + '/' + sources);
});

test('guillemetsFr : aucun texte propose ne contient de guillemet droit (il serait refuse a l\'enregistrement) ; tous les mots du vrai Lexique passent', () => {
  assert.strictEqual(C.guillemetsFr('Un "mot" cite et un " isole'), 'Un « mot » cite et un  isole');
  const m = C.motsDuLexique(L.lireEntrees(fs.readFileSync(path.join(RACINE, 'data', 'lexique.js'), 'utf8')));
  assert.ok(m.length >= 380);
  assert.ok(m.every((x) => x.titre.indexOf('"') === -1 && x.def.indexOf('"') === -1));
});

test('lireFiche (vrai depot) : les phrases du bouton vers Comprendre les chiffres sont proposees, et frein / structures sont montres en lecture seule', () => {
  const depot = creerDepot(RACINE, {});
  const r = depot.lireFiche('mobilite', 'mobilite-se-deplacer-sans-voiture');
  assert.ok(r.ok);
  assert.strictEqual(r.champs.voir_aussi_chiffres, "Combien de personnes n'ont pas de voiture ici");
  const p = r.choix.phrasesChiffres;
  assert.ok(p.length >= 6, 'les phrases des fiches de tous les rayons, pas seulement du rayon courant');
  assert.strictEqual(p[0].phrase, 'Comment on est embauché ici', 'la plus utilisee en premier');
  assert.strictEqual(p[0].nb, 2);
  assert.ok(p.some((x) => x.phrase === r.champs.voir_aussi_chiffres), 'la phrase actuelle y figure (l\'ecran la marque comme actuelle)');
  assert.ok(r.choix.longueurMaxPhraseChiffres >= 85);
  assert.ok(r.lectureSeule && ['oui', 'non', ''].indexOf(r.lectureSeule.frein) !== -1 && Array.isArray(r.lectureSeule.structures));
  const g = depot.lireFiche('accompagnement', 'accompagnement-geiq');
  assert.deepStrictEqual(g.lectureSeule.structures, ['asso-geiq-24']);
});

test('presence des enseignes : chaque enseigne connait les departements ou une fiche du meme nom existe (registre et sas), calcules d\'apres les communes, sans mention saisie', () => {
  const depot = creerDepot(RACINE, {});
  ['listerSas', 'listerTerritoire'].forEach((fn) => {
    const lignes = depot[fn]('employeurs').lignes.filter((l) => l.valeurs.nature === 'enseigne');
    assert.ok(lignes.length >= 5, fn);
    lignes.forEach((l) => {
      assert.ok(Array.isArray(l.depsEnseigne), fn + ' ' + l.id + ' : depsEnseigne absent');
      (l.etabs || []).forEach((e) => { if (e.dep) { assert.ok(l.depsEnseigne.indexOf(e.dep) !== -1, fn + ' ' + l.id + ' : le departement de ses propres magasins manque'); } });
    });
  });
  const nonEnseigne = depot.listerTerritoire('employeurs').lignes.filter((l) => l.valeurs.nature !== 'enseigne');
  assert.ok(nonEnseigne.every((l) => l.depsEnseigne === undefined), 'les agences d\'interim n\'ont pas ce calcul');
});
