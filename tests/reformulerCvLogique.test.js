const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du parcours "Reformuler et presenter mon CV" (mode
// _prepLEMode = 'reformuler' de la carte "Mes documents"). Ajoutee lors de
// l'audit de stabilisation du 2026-09-12 (couverture initiale), reecrite le
// 2026-09-16 : reformuler-cv.md renvoie desormais du JSON (comme
// ats.md/regard-recruteur.md/extraction-cv.md) au lieu d'une prose a
// decouper par heuristique -- l'ancien parseur deterministe texte->structure
// (bugs reels confirmes : "INFORMATIONS" confondu avec "FORMATIONS" par
// simple sous-chaine, un intitule de poste en majuscules qui coupait le
// bloc EXPERIENCES) est retire, plus rien a tester de ce cote.
// _reformulerCvRenduCorpsProposition n'est pas testee ici : elle appelle
// echapperAttribut() (js/app.js, DOM), hors de la logique pure exportee.
const {
  _reformulerCvParserReponse,
  _reformulerCvNettoyerStruct,
  _reformulerCvResumeChangements,
  _reformulerCvTexteFinalProposition
} = require('../data/metiers.js');

// Stub minimal de deps.extraireJSON (voir parserResultatAts(), modules/ats/
// resultatParser.js, meme patron) : simule extraireBlocJSONDepuisTexte()
// sans charger js/app.js (DOM) dans les tests Node -- extrait juste le
// premier bloc JSON valide du texte, suffisant pour ces tests.
function extraireJSONTest(texte) {
  const t = String(texte || '').trim();
  const debut = t.indexOf('{');
  const fin = t.lastIndexOf('}');
  if (debut === -1 || fin <= debut) { return null; }
  try { return JSON.parse(t.slice(debut, fin + 1)); } catch (e) { return null; }
}
const deps = { extraireJSON: extraireJSONTest };

// ---------- _reformulerCvParserReponse ----------

test('parserReponse : pasUnCV true renvoie le message, aucune proposition', () => {
  const r = _reformulerCvParserReponse('{"pasUnCV": true, "message": "ceci ressemble a une liste de courses", "propositions": []}', deps);
  assert.equal(r.pasUnCv, 'ceci ressemble a une liste de courses');
  assert.equal(r.propositions, undefined);
});

test('parserReponse : pasUnCV true sans message = message par defaut', () => {
  const r = _reformulerCvParserReponse('{"pasUnCV": true, "propositions": []}', deps);
  assert.equal(r.pasUnCv, 'Le texte reçu ne ressemble pas à un CV.');
});

test('parserReponse : aucun JSON reconnu = pasUnCv (jamais un throw)', () => {
  const r = _reformulerCvParserReponse('Bonjour, voici votre CV en texte libre.', deps);
  assert.ok(r.pasUnCv);
  assert.equal(r.propositions, undefined);
});

test('parserReponse : 2 propositions bien formees, struct + piste extraits', () => {
  const brut = JSON.stringify({
    pasUnCV: false,
    propositions: [
      { piste: '', titre: 'Vendeur', experiences: [{ poste: 'Vendeur', entreprise: 'Boutique X', missions: ['a vendu des choses'] }] },
      { piste: 'Version recommandee', titre: 'Vendeur', experiences: [{ poste: 'Vendeur', entreprise: 'Boutique X', missions: ['a vendu bien plus'] }] }
    ]
  });
  const r = _reformulerCvParserReponse(brut, deps);
  assert.equal(r.propositions.length, 2);
  assert.equal(r.propositions[0].piste, '');
  assert.equal(r.propositions[0].struct.experiences[0].missions[0], 'a vendu des choses');
  assert.equal(r.propositions[1].piste, 'Version recommandee');
});

test('parserReponse : plus de 2 propositions -> seules les 2 premieres sont gardees', () => {
  const brut = JSON.stringify({ propositions: [{ titre: 'A' }, { titre: 'B' }, { titre: 'C' }] });
  const r = _reformulerCvParserReponse(brut, deps);
  assert.equal(r.propositions.length, 2);
  assert.equal(r.propositions[0].struct.titre, 'A');
  assert.equal(r.propositions[1].struct.titre, 'B');
});

// ---------- _reformulerCvNettoyerStruct ----------

test('nettoyerStruct : champs manquants retombent sur des valeurs vides, jamais une exception', () => {
  const s = _reformulerCvNettoyerStruct({});
  assert.equal(s.titre, '');
  assert.deepEqual(s.experiences, []);
  assert.deepEqual(s.competences, []);
});

test('nettoyerStruct : structure complete conservee, champs mal types ignores', () => {
  const s = _reformulerCvNettoyerStruct({
    titre: 'Vendeur polyvalent',
    accroche: 'Motive',
    accrocheInventee: true,
    experiences: [{ poste: 'Vendeur', entreprise: 'Boutique X', dateDebut: '2019', dateFin: '2021', missions: ['accueil des clients', 'tenue de caisse'] }],
    formations: [{ intitule: 'CAP Vente', annee: '2018' }, { intitule: '' }],
    competences: [{ intitule: 'Vente', origine: 'a vendu des produits' }],
    langues: [{ langue: 'Anglais', niveau: 'B1' }],
    loisirs: 'pas un tableau'
  });
  assert.equal(s.titre, 'Vendeur polyvalent');
  assert.equal(s.accrocheInventee, true);
  assert.equal(s.experiences[0].poste, 'Vendeur');
  assert.deepEqual(s.experiences[0].missions, ['accueil des clients', 'tenue de caisse']);
  assert.equal(s.formations.length, 1, 'la formation sans intitule est ecartee');
  assert.equal(s.formations[0].annee, '2018');
  assert.equal(s.competences[0].origine, 'a vendu des produits');
  assert.equal(s.langues[0].langue, 'Anglais');
  assert.deepEqual(s.loisirs, [], 'un champ liste mal type retombe sur un tableau vide');
});

test('nettoyerStruct : ligne "informations complementaires" jamais confondue avec formations', () => {
  const s = _reformulerCvNettoyerStruct({
    formations: [{ intitule: 'BTS Gestion de la PME', annee: '2019' }],
    informationsComplementaires: ['Sophie Martin', '29 ans - Bergerac (24)', 'Disponible immediatement']
  });
  assert.equal(s.formations.length, 1);
  assert.equal(s.formations[0].intitule, 'BTS Gestion de la PME');
  assert.deepEqual(s.informationsComplementaires, ['Sophie Martin', '29 ans - Bergerac (24)', 'Disponible immediatement']);
});

// ---------- _reformulerCvResumeChangements ----------

test('resumeChangements : compte les competences avec origine, garde les 2 lignes fixes', () => {
  const lignes = _reformulerCvResumeChangements({ competences: [{ intitule: 'Vente', origine: 'a vendu' }, { intitule: 'Accueil', origine: '' }] });
  assert.match(lignes[0], /^1 intitulé\(s\) de compétence/);
  assert.equal(lignes[1], 'Formulations retravaillées : verbes d’action, phrases plus courtes.');
  assert.equal(lignes[2], 'Le fond n’a pas changé : mêmes expériences, mêmes dates, mêmes diplômes.');
});

test('resumeChangements : sans competence avec origine, seules les 2 lignes fixes restent', () => {
  const lignes = _reformulerCvResumeChangements({ competences: [] });
  assert.equal(lignes.length, 2);
});

test('resumeChangements : struct absent ou incomplet, jamais une exception', () => {
  assert.equal(_reformulerCvResumeChangements(undefined).length, 2);
});

// ---------- _reformulerCvTexteFinalProposition ----------

test('texteFinalProposition : serialise une structure complete en texte lisible par rubrique', () => {
  const texte = _reformulerCvTexteFinalProposition({
    titre: 'Vendeur polyvalent',
    accroche: 'Motive et rigoureux',
    experiences: [{ poste: 'Vendeur', entreprise: 'Boutique X', dateDebut: '2019', dateFin: '2021', missions: ['accueil des clients', 'tenue de caisse'] }],
    formations: [{ intitule: 'CAP Vente', annee: '2018' }],
    competences: [{ intitule: 'Vente', origine: 'a vendu' }],
    langues: [{ langue: 'Anglais', niveau: 'B1' }]
  });
  assert.match(texte, /^Vendeur polyvalent/);
  assert.match(texte, /PROFIL\nMotive et rigoureux/);
  assert.match(texte, /EXPÉRIENCES PROFESSIONNELLES\nVendeur - Boutique X \(2019 - 2021\)\n- accueil des clients\n- tenue de caisse/);
  assert.match(texte, /FORMATION\nCAP Vente - 2018/);
  assert.match(texte, /COMPÉTENCES\n- Vente/);
  assert.match(texte, /LANGUES\nAnglais - B1/);
});

test('texteFinalProposition : experience en cours (dateFin vide) affiche "Aujourd’hui"', () => {
  const texte = _reformulerCvTexteFinalProposition({
    experiences: [{ poste: 'Vendeur', entreprise: 'Boutique X', dateDebut: '2022', dateFin: '', missions: [] }]
  });
  assert.match(texte, /\(2022 - Aujourd’hui\)/);
});

test('texteFinalProposition : struct vide -> chaine vide, jamais une exception', () => {
  assert.equal(_reformulerCvTexteFinalProposition({}), '');
  assert.equal(_reformulerCvTexteFinalProposition(undefined), '');
});
