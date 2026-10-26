const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const lex = require('../outils/veilleLexique.js');
const mots = require('../outils/veilleMots.js');
const regles = require('../scripts/checkLexique.js');

const CONTENU = fs.readFileSync(path.join(__dirname, '..', 'data', 'lexique.js'), 'utf8');
const TOUS = lex.lireMots(CONTENU);
const BLOC = {
  verifieLe: '2026-10-12',
  source: { nom: 'service-public.fr', url: 'https://www.service-public.fr' },
  lignes: [
    { libelle: 'Plafond pour un bilan de compétences', valeur: '1 600 €', categorie: 'montant', peutChanger: true },
    { libelle: 'Décret d\'entrée en vigueur', valeur: '26 février 2026', categorie: 'date', peutChanger: false },
    { libelle: 'Un guillemet " et une barre \\ dans une valeur', valeur: 'jusqu\'à 12 mois', categorie: 'duree', peutChanger: true }
  ]
};
// Le fichier charge pour de vrai, comme le fait scripts/checkLexique.js (jamais dans l'outil).
function charger(texte) {
  return new Function('exports', texte + '\nreturn LEXIQUE_FICHES;')({});
}

test('details : le lecteur d\'objet accepte la forme du fichier et refuse tout le reste (jamais eval)', () => {
  assert.deepStrictEqual(lex.lireLitteral("{ a: 'x', 'b': [1, true, null, \"y\"], c: { d: false } } // fin"), { a: 'x', b: [1, true, null, 'y'], c: { d: false } });
  ['{ a: process.exit() }', '{ a: `x` }', '{ a: 1 + 2 }', '{ __proto__: {} }', '{ a: "non fermee }', '{ a: 1 } 2', '[1, ]x', 'function(){}'].forEach((m) => {
    assert.throws(() => lex.lireLitteral(m), undefined, m);
  });
  assert.ok(lex.lireDetails("detailsAJour: { verifieLe: 'x' ").illisible, 'un bloc qui ne se lit pas est signale, jamais ignore');
  assert.strictEqual(lex.lireDetails(''), null);
});

test('details : ajouter un bloc a une fiche sur quatre (toutes les formes de mise en page du fichier), le relire, le retirer : le fichier redevient identique octet pour octet', () => {
  TOUS.filter((m, i) => i % 4 === 0 || i > TOUS.length - 3).forEach((m) => {
    const r = lex.remplacerChamps(CONTENU, m.id, { details: BLOC });
    assert.ok(r.ok, m.id + ' : ' + r.erreur);
    const relu = lex.lireMots(r.texte);
    assert.strictEqual(relu.length, TOUS.length, m.id);
    assert.deepStrictEqual(relu.filter((x) => x.id === m.id)[0].details, BLOC, m.id);
    const b = lex.remplacerChamps(r.texte, m.id, { details: null });
    assert.ok(b.ok, m.id + ' : ' + b.erreur);
    assert.strictEqual(b.texte, CONTENU, 'aller-retour de ' + m.id);
  });
});

test('details : le fichier modifie se charge pour de vrai et donne le meme objet que le lecteur de l\'outil ; les autres fiches ne bougent pas', () => {
  const id = TOUS[10].id, r = lex.remplacerChamps(CONTENU, id, { details: BLOC });
  const vrai = charger(r.texte), avant = charger(CONTENU);
  assert.deepStrictEqual(vrai.filter((f) => f.id === id)[0].detailsAJour, BLOC);
  assert.deepStrictEqual(vrai.filter((f) => f.id !== id), avant.filter((f) => f.id !== id));
  const sans = vrai.filter((f) => f.id === id)[0]; delete sans.detailsAJour;
  assert.deepStrictEqual(sans, avant.filter((f) => f.id === id)[0]);
  // le meme fichier, relu par l'outil, redonne le meme resultat que lireMots sur le fichier d'origine pour tous les autres champs
  const a = lex.lireMots(CONTENU), b = lex.lireMots(r.texte);
  b.forEach((m, i) => { if (m.id === id) { m = Object.assign({}, m, { details: null }); } assert.deepStrictEqual(m, a[i], m.id); });
});

test('details : remplacer un bloc existant ne touche que lui ; un champ modifie en meme temps reste modifie', () => {
  const id = TOUS[40].id, r1 = lex.remplacerChamps(CONTENU, id, { details: BLOC });
  const autre = Object.assign({}, BLOC, { verifieLe: '2026-10-20', lignes: BLOC.lignes.slice(0, 1) });
  const r2 = lex.remplacerChamps(r1.texte, id, { details: autre, titre: 'Titre changé pour essai' });
  assert.ok(r2.ok, r2.erreur);
  const m = lex.lireMots(r2.texte).filter((x) => x.id === id)[0];
  assert.deepStrictEqual(m.details, autre);
  assert.strictEqual(m.titre, 'Titre changé pour essai');
  const r3 = lex.remplacerChamps(r2.texte, id, { details: null, titre: TOUS[40].titre });
  assert.strictEqual(r3.texte, CONTENU, 'bloc retire et titre rendu : fichier d\'origine');
  assert.strictEqual(lex.remplacerChamps(CONTENU, id, { details: { verifieLe: '', source: BLOC.source, lignes: [] } }).ok, false, 'un bloc sans ligne n\'est pas ecrit');
});

test('details : controles de forme (verifierDetails, meme fonction pour l\'outil et checkLexique)', () => {
  assert.deepStrictEqual(regles.verifierDetails(BLOC), []);
  assert.deepStrictEqual(regles.verifierDetails(Object.assign({}, BLOC, { verifieLe: '' })), [], 'jamais verifie : permis');
  const un = (o) => regles.verifierDetails(Object.assign({}, BLOC, o));
  assert.ok(un({ verifieLe: '2026-02-30' }).some((m) => /vraie date/.test(m)));
  assert.ok(un({ verifieLe: '2999-01-01' }).some((m) => /futur/.test(m)));
  assert.ok(un({ verifieLe: undefined }).some((m) => /date de vérification manque/.test(m)));
  assert.ok(un({ source: { nom: '', url: 'https://x.fr' } }).some((m) => /source officielle/.test(m)));
  assert.ok(un({ source: { nom: 'x', url: 'http://x.fr' } }).some((m) => /https:\/\//.test(m)));
  assert.ok(un({ source: { nom: 'x', url: 'javascript:alert(1)' } }).some((m) => /https:\/\//.test(m)));
  assert.ok(un({ lignes: [] }).some((m) => /au moins une ligne/.test(m)));
  assert.ok(un({ lignes: new Array(9).fill(BLOC.lignes[0]) }).some((m) => /plafond/.test(m)));
  assert.ok(un({ lignes: [{ libelle: 'a', valeur: '', categorie: 'montant', peutChanger: true }] }).some((m) => /valeur est vide/.test(m)));
  assert.ok(un({ lignes: [{ libelle: 'a', valeur: 'b', categorie: 'autre', peutChanger: true }] }).some((m) => /catégorie inconnue/.test(m)));
  assert.ok(un({ lignes: [{ libelle: 'a', valeur: 'b', categorie: 'date', peutChanger: 'oui' }] }).some((m) => /peut changer/.test(m)));
  assert.ok(un({ lignes: [{ libelle: 'a – b', valeur: 'b', categorie: 'date', peutChanger: true }] }).some((m) => /tiret/.test(m)));
  assert.ok(un({ extra: 1 }).some((m) => /inconnu/.test(m)));
  assert.ok(regles.verifierDetails(null).length && regles.verifierDetails([]).length);
});

test('details : le controle d\'un mot (verifierMot) bloque un bloc mal forme ou illisible, et l\'evolution decrit le bloc en clair', () => {
  const original = TOUS[5], mot = Object.assign({}, original, { details: BLOC });
  const bon = mots.verifierMot(mot, TOUS.filter((x) => x.id !== original.id), { original: original, phrase: 'bloc ajouté' });
  assert.deepStrictEqual(bon.erreurs, []);
  assert.deepStrictEqual(bon.modifies, ['details']);
  const mauvais = mots.verifierMot(Object.assign({}, original, { details: Object.assign({}, BLOC, { lignes: [] }) }), [], { original: original, phrase: 'x' });
  assert.ok(mauvais.erreurs.some((m) => /au moins une ligne/.test(m)));
  const illisible = mots.verifierMot(Object.assign({}, original, { details: { illisible: 'valeur non reconnue' } }), [], { original: original, phrase: 'x' });
  assert.ok(illisible.erreurs.some((m) => /ne se lit pas/.test(m)));
  const diffs = mots.differences(original, mot);
  assert.strictEqual(diffs.length, 1);
  assert.match(diffs[0].apres, /vérifié le 2026-10-12 ; source : service-public.fr ; Plafond pour un bilan de compétences : 1 600 €/);
  assert.match(diffs[0].apres, /\(fait passé\)/);
});

test('details : tous les blocs deja ecrits dans le vrai fichier sont valides, lus pareil par l\'outil et par le chargement reel', () => {
  const vrai = charger(CONTENU);
  vrai.filter((f) => f.detailsAJour !== undefined).forEach((f) => {
    assert.deepStrictEqual(regles.verifierDetails(f.detailsAJour), [], f.id);
    assert.deepStrictEqual(TOUS.filter((m) => m.id === f.id)[0].details, f.detailsAJour, f.id);
  });
  assert.strictEqual(TOUS.filter((m) => m.details !== null && m.details.illisible).length, 0, 'aucun bloc illisible');
});
