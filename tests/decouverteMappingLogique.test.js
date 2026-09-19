const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE de decouverteMapping.js (5e des 6 fichiers du module
// "Decouvrir mes competences" a couvrir, chantier de stabilisation,
// 2026-09-13). Contrat officiel du module : transforme des fragments
// DEJA VALIDES vers le format `dossier`, sans jamais prendre de
// decision metier, en tracant chaque donnee produite dans un journal
// de provenance separe. Meme technique de pont inter-fichiers que
// tests/decouverteLogique.test.js : DECOUVERTE_CATEGORIES et
// DECOUVERTE_ETATS_FRAGMENT sont des variables globales attendues par
// decouverteMapping.js, fournies ici depuis leurs fichiers d'origine.
// Aucun stub DOM necessaire : ni decouverteMapping.js ni ses deux
// dependances ne touchent document/window (fichiers deja purs) --
// requerir data/metiers.js SANS stub laisse `document` non defini,
// ce qui desactive proprement son bloc de style navigateur en tete
// de fichier (garde `typeof document === 'undefined'`), meme principe
// que tests/lexiqueLogique.test.js.
const { DECOUVERTE_CATEGORIES } = require('../modules/decouverte-competences/decouverteClassification.js');
const { DECOUVERTE_ETATS_FRAGMENT } = require('../modules/decouverte-competences/decouverteRaffinement.js');
global.DECOUVERTE_CATEGORIES = DECOUVERTE_CATEGORIES;
global.DECOUVERTE_ETATS_FRAGMENT = DECOUVERTE_ETATS_FRAGMENT;
const { normaliserTexte } = require('../data/metiers.js');
global.normaliserTexte = normaliserTexte;

const {
  mapperFragmentsVersDossier,
  appliquerMisesAJourDossier,
  _decouverteRessembleADisposition,
  _decouvertePreuvesProches,
  _decouverteConcatenerPreuve,
  _decouverteDedupliquerSousEnsembles
} = require('../modules/decouverte-competences/decouverteMapping.js');

// ---------- _decouverteRessembleADisposition ----------
// Garde-fou contre un bug reel constate (une disposition classee a
// tort en centre d'interet).

test('_decouverteRessembleADisposition : reconnait les formulations de disposition/qualite', () => {
  assert.equal(_decouverteRessembleADisposition('Goût pour le service aux personnes'), true);
  assert.equal(_decouverteRessembleADisposition('Capacité à s\'adapter'), true);
  assert.equal(_decouverteRessembleADisposition('Apprendre des nouvelles choses'), true);
});

test('_decouverteRessembleADisposition : un nom d\'activite classique n\'est jamais pris pour une disposition', () => {
  assert.equal(_decouverteRessembleADisposition('Cinéma'), false);
  assert.equal(_decouverteRessembleADisposition('Randonnée'), false);
});

// ---------- _decouvertePreuvesProches ----------
// Detecte les quasi-doublons de preuve (meme fait reformule 2 fois),
// bug reel constate sur un recit court en liste.

test('_decouvertePreuvesProches : deux formulations tres proches du meme fait sont detectees', () => {
  assert.equal(_decouvertePreuvesProches('jai fait maconnerie carrelage', 'jai fait carrelage maconnerie electricite'), true);
});

test('_decouvertePreuvesProches : deux faits distincts ne sont jamais confondus', () => {
  assert.equal(_decouvertePreuvesProches('lecture', 'cinema'), false);
});

test('_decouvertePreuvesProches : une chaine vide ne matche jamais rien', () => {
  assert.equal(_decouvertePreuvesProches('', 'jai fait maconnerie'), false);
});

// ---------- _decouverteConcatenerPreuve ----------

test('_decouverteConcatenerPreuve : jointure par point-virgule, jamais un point qui casserait la lecture', () => {
  assert.equal(_decouverteConcatenerPreuve(['fait ceci.', 'fait cela ;']), 'fait ceci ; fait cela.');
});

test('_decouverteConcatenerPreuve : preuve vide donne une chaine vide, jamais "undefined"', () => {
  assert.equal(_decouverteConcatenerPreuve([]), '');
  assert.equal(_decouverteConcatenerPreuve(null), '');
});

// ---------- _decouverteDedupliquerSousEnsembles ----------
// Bug reel constate : "Sport" en double d'une entree plus longue qui
// le contient deja ("sport, randonnee, natation, sports collectifs").

test('_decouverteDedupliquerSousEnsembles : retire une entree courte deja incluse dans une entree plus longue', () => {
  var out = _decouverteDedupliquerSousEnsembles(['Sport', 'sport, randonnée, natation, sports collectifs', 'Lecture']);
  assert.deepEqual(out, ['sport, randonnée, natation, sports collectifs', 'Lecture']);
});

test('_decouverteDedupliquerSousEnsembles : deux entrees comparables qui ne se recoupent pas restent toutes les deux', () => {
  var out = _decouverteDedupliquerSousEnsembles(['Lecture', 'Cinéma']);
  assert.deepEqual(out, ['Lecture', 'Cinéma']);
});

// ---------- mapperFragmentsVersDossier ----------

function fragmentExperience(overrides) {
  return Object.assign({
    fragmentId: 'f1',
    etat: DECOUVERTE_ETATS_FRAGMENT.VALIDE,
    origine: 'proDeclaree',
    texteRetenu: 'Ouvrier du bâtiment',
    texteOriginalConserve: true,
    competencesValidees: [
      { id: 'c1', texte: 'Maçonnerie', categorie: DECOUVERTE_CATEGORIES.TECHNIQUE, preuve: ['j\'ai fait de la maçonnerie'], texteOriginalConserve: true }
    ]
  }, overrides);
}

test('mapperFragmentsVersDossier : un fragment "valide" d\'origine pro devient une experience avec missions concatenees', () => {
  var res = mapperFragmentsVersDossier([fragmentExperience()], { f1: { entreprise: 'ACME', dateDebut: '2020' } });
  assert.equal(res.misesAJour.experiences.length, 1);
  var exp = res.misesAJour.experiences[0];
  assert.equal(exp.poste, 'Ouvrier du bâtiment');
  assert.equal(exp.entreprise, 'ACME');
  assert.equal(exp.missions, 'j\'ai fait de la maçonnerie.');
  assert.deepEqual(res.misesAJour.competences.savoirFaire, ['Maçonnerie']);
});

test('mapperFragmentsVersDossier : un fragment qui n\'est pas a l\'etat "valide" est ignore', () => {
  var fragment = fragmentExperience({ etat: DECOUVERTE_ETATS_FRAGMENT.PREMIER_RAFFINEMENT });
  var res = mapperFragmentsVersDossier([fragment], {});
  assert.equal(res.misesAJour.experiences.length, 0);
  assert.equal(res.journalProvenance.length, 0);
});

test('mapperFragmentsVersDossier : un loisir dont la reformulation ressemble a une disposition part en savoirEtre, jamais en centre d\'interet', () => {
  var fragment = {
    fragmentId: 'f2', etat: DECOUVERTE_ETATS_FRAGMENT.VALIDE, origine: 'personnelleFamiliale',
    texteRetenu: 'Goût pour le service aux personnes', texteOriginalConserve: false,
    elementsFactuels: ['Bénévolat association locale'],
    competencesValidees: [
      { id: 'c2', texte: 'Goût pour le service aux personnes', categorie: DECOUVERTE_CATEGORIES.CENTRE_INTERET, preuve: [], texteOriginalConserve: false }
    ]
  };
  var res = mapperFragmentsVersDossier([fragment], {});
  assert.deepEqual(res.misesAJour.loisirs, ['Bénévolat association locale']);
  assert.deepEqual(res.misesAJour.competences.savoirEtre, ['Goût pour le service aux personnes']);
  assert.deepEqual(res.misesAJour.competences.savoirFaire, []);
  assert.deepEqual(res.misesAJour.competencesPersonnelles, [{ competence: 'Goût pour le service aux personnes', source: 'Bénévolat association locale' }]);
});

test('mapperFragmentsVersDossier : chaque donnee produite est tracee dans le journal de provenance, jamais melangee aux donnees', () => {
  var res = mapperFragmentsVersDossier([fragmentExperience()], {});
  assert.ok(res.journalProvenance.length > 0);
  res.journalProvenance.forEach((entree) => {
    assert.ok('champDossier' in entree);
    assert.ok('origine' in entree);
    assert.ok('moduleProducteur' in entree);
    assert.equal(entree.moduleProducteur, 'decouverte-competences');
  });
  assert.equal(res.misesAJour.journalProvenance, undefined);
});

test('mapperFragmentsVersDossier : sans fragments, renvoie des listes vides plutot que de planter', () => {
  var res = mapperFragmentsVersDossier([], {});
  assert.deepEqual(res.misesAJour.experiences, []);
  assert.deepEqual(res.journalProvenance, []);
  assert.deepEqual(mapperFragmentsVersDossier(null, {}).misesAJour.experiences, []);
});

// ---------- appliquerMisesAJourDossier ----------

test('appliquerMisesAJourDossier : additif, jamais un ecrasement du dossier existant', () => {
  var dossier = { experiences: [{ poste: 'Existant' }], loisirs: ['Lecture'], engagements: [], competences: { savoirFaire: ['Existant'], savoirEtre: [] } };
  var misesAJour = { experiences: [{ poste: 'Nouveau' }], loisirs: ['Cinéma'], engagements: [], competences: { savoirFaire: ['Nouveau'], savoirEtre: [] }, competencesPersonnelles: [] };
  appliquerMisesAJourDossier(dossier, misesAJour);
  assert.deepEqual(dossier.experiences.map((e) => e.poste), ['Existant', 'Nouveau']);
  assert.deepEqual(dossier.loisirs, ['Lecture', 'Cinéma']);
  assert.deepEqual(dossier.competences.savoirFaire, ['Existant', 'Nouveau']);
});

test('appliquerMisesAJourDossier : un loisir strictement identique a un existant n\'est jamais duplique', () => {
  var dossier = { experiences: [], loisirs: ['Lecture'], engagements: [], competences: { savoirFaire: [], savoirEtre: [] } };
  var misesAJour = { experiences: [], loisirs: ['Lecture'], engagements: [], competences: { savoirFaire: [], savoirEtre: [] }, competencesPersonnelles: [] };
  appliquerMisesAJourDossier(dossier, misesAJour);
  assert.deepEqual(dossier.loisirs, ['Lecture']);
});

test('appliquerMisesAJourDossier : un engagement se compare par son texte (objets distincts), pas par reference', () => {
  var dossier = { experiences: [], loisirs: [], engagements: [{ texte: 'Bénévolat', dateDebut: '2019' }], competences: { savoirFaire: [], savoirEtre: [] } };
  var misesAJour = { experiences: [], loisirs: [], engagements: [{ texte: 'Bénévolat', dateDebut: '2019' }], competences: { savoirFaire: [], savoirEtre: [] }, competencesPersonnelles: [] };
  appliquerMisesAJourDossier(dossier, misesAJour);
  assert.equal(dossier.engagements.length, 1);
});

test('appliquerMisesAJourDossier : competencesPersonnellesDecouverte reste un champ distinct, jamais fusionne dans competences', () => {
  var dossier = { experiences: [], loisirs: [], engagements: [], competences: { savoirFaire: [], savoirEtre: [] } };
  var misesAJour = { experiences: [], loisirs: [], engagements: [], competences: { savoirFaire: [], savoirEtre: [] }, competencesPersonnelles: [{ competence: 'X', source: 'Y' }] };
  appliquerMisesAJourDossier(dossier, misesAJour);
  assert.deepEqual(dossier.competencesPersonnellesDecouverte, [{ competence: 'X', source: 'Y' }]);
  assert.deepEqual(dossier.competences.savoirFaire, []);
});
