const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du module "Découvrir mes compétences" (5813 lignes,
// le plus gros module de l'application, destiné au public le plus
// éloigné de l'emploi). Ajoutée lors de l'audit de stabilisation du
// 2026-09-12 : ce module n'avait jusque-là aucune couverture Node.
// Périmètre volontairement ciblé sur la logique la plus critique
// (parsing de la réponse assistant, validation d'une compétence,
// machine à états du raffinement, choix du type de CV) plutôt
// qu'exhaustif sur les 1476 lignes pures des 6 fichiers.
require('./_domStub').installerStubDom();
const { extraireBlocJSONDepuisTexte } = require('../js/app.js');
global.extraireBlocJSONDepuisTexte = extraireBlocJSONDepuisTexte;

const {
  DECOUVERTE_CATEGORIES,
  DECOUVERTE_ORIGINES,
  DECOUVERTE_TYPES_CV,
  construireCompetence,
  competenceEstValide
} = require('../modules/decouverte-competences/decouverteClassification.js');
global.DECOUVERTE_ORIGINES = DECOUVERTE_ORIGINES;
global.DECOUVERTE_CATEGORIES = DECOUVERTE_CATEGORIES;
global.DECOUVERTE_TYPES_CV = DECOUVERTE_TYPES_CV;

const { analyserReponseDecouverte } = require('../modules/decouverte-competences/decouverteAnalyse.js');
const { determinerTypeCV, calculerScoresStrategies } = require('../modules/decouverte-competences/decouverteStrategie.js');
const {
  DECOUVERTE_ETATS_FRAGMENT,
  _decouverteTransitionner,
  initialiserEtatFragment
} = require('../modules/decouverte-competences/decouverteRaffinement.js');

function colleJSON(objet) {
  return '```json\n' + JSON.stringify(objet) + '\n```';
}

// ---------- decouverteClassification.js ----------

test('construireCompetence : defauts prudents (transferable/autre), jamais validee au depart', () => {
  const c = construireCompetence({ texte: 'Rigueur' });
  assert.equal(c.categorie, DECOUVERTE_CATEGORIES.TRANSFERABLE);
  assert.equal(c.origine, DECOUVERTE_ORIGINES.AUTRE);
  assert.equal(c.validee, false);
  assert.deepEqual(c.preuve, []);
});

test('competenceEstValide : exige validee=true, texte non vide, ET au moins une preuve', () => {
  assert.equal(competenceEstValide(construireCompetence({ texte: 'X', preuve: ['fait'], validee: true })), true);
  assert.equal(competenceEstValide(construireCompetence({ texte: 'X', preuve: [], validee: true })), false);
  assert.equal(competenceEstValide(construireCompetence({ texte: '', preuve: ['fait'], validee: true })), false);
  assert.equal(competenceEstValide(construireCompetence({ texte: 'X', preuve: ['fait'], validee: false })), false);
  assert.equal(competenceEstValide(null), false);
});

// ---------- decouverteAnalyse.js ----------

test('analyserReponseDecouverte : fragment valide, competence avec preuve conservee', () => {
  const r = analyserReponseDecouverte(colleJSON({
    fragments: [{
      texteBrut: 'Vendeur en boulangerie 3 ans', origine: 'proDeclaree',
      propositions: ['Vente en boulangerie'],
      competencesProposees: [{ texte: 'Accueil client', categorie: 'savoirEtre', preuve: ['3 ans en boulangerie'] }]
    }],
    questionsCiblees: [{ texte: 'Sur quelle periode ?', fragmentIndex: 0, type: 'date' }],
    reciteNettoye: 'Vendeur en boulangerie.'
  }));
  assert.equal(r.succes, true);
  assert.equal(r.valeurs.fragments.length, 1);
  assert.equal(r.valeurs.fragments[0].competencesProposees.length, 1);
  assert.equal(r.valeurs.fragments[0].competencesProposees[0].preuve[0], '3 ans en boulangerie');
});

test('analyserReponseDecouverte : competence SANS preuve rejetee en silence (jamais presentee)', () => {
  const r = analyserReponseDecouverte(colleJSON({
    fragments: [{
      texteBrut: 'Aide a un proche', origine: 'personnelleFamiliale', propositions: ['Aide'],
      competencesProposees: [{ texte: 'Sans preuve', categorie: 'aptitude', preuve: [] }]
    }],
    questionsCiblees: [], reciteNettoye: ''
  }));
  assert.equal(r.valeurs.fragments[0].competencesProposees.length, 0);
});

test('analyserReponseDecouverte : fragment professionnel sans question de date -> repli automatique ajoute', () => {
  const r = analyserReponseDecouverte(colleJSON({
    fragments: [{ texteBrut: 'Vendeur en boulangerie', origine: 'proDeclaree', propositions: ['Vente'], competencesProposees: [] }],
    questionsCiblees: [], reciteNettoye: ''
  }));
  assert.equal(r.valeurs.questionsCiblees.length, 1);
  assert.equal(r.valeurs.questionsCiblees[0].type, 'date');
  assert.equal(r.valeurs.questionsCiblees[0].fragmentIndex, 0);
  assert.match(r.valeurs.questionsCiblees[0].texte, /Vendeur en boulangerie/);
});

test('analyserReponseDecouverte : fragment professionnel AVEC question de date -> pas de doublon', () => {
  const r = analyserReponseDecouverte(colleJSON({
    fragments: [{ texteBrut: 'Vendeur', origine: 'proDeclaree', propositions: ['Vente'], competencesProposees: [] }],
    questionsCiblees: [{ texte: 'Depuis quand ?', fragmentIndex: 0, type: 'date' }], reciteNettoye: ''
  }));
  assert.equal(r.valeurs.questionsCiblees.length, 1);
  assert.equal(r.valeurs.questionsCiblees[0].texte, 'Depuis quand ?');
});

test('analyserReponseDecouverte : analyseImpossible -> aucun fragment fabrique, questions remontees comme pistes', () => {
  const r = analyserReponseDecouverte(colleJSON({ analyseImpossible: true, message: 'Texte trop vague', questionsCiblees: ['Reessayez avec plus de details'] }));
  assert.equal(r.succes, false);
  assert.equal(r.analyseImpossible, true);
  assert.equal(r.message, 'Texte trop vague');
  assert.equal(r.questionsCiblees[0].texte, 'Reessayez avec plus de details');
});

test('analyserReponseDecouverte : fragments vides (assistant n\'a rien trouve) -> meme signal que analyseImpossible', () => {
  const r = analyserReponseDecouverte(colleJSON({ fragments: [], questionsCiblees: [] }));
  assert.equal(r.succes, false);
  assert.equal(r.analyseImpossible, true);
});

test('analyserReponseDecouverte : texte vide ou sans JSON -> erreur claire, jamais d\'exception', () => {
  assert.equal(analyserReponseDecouverte('').succes, false);
  assert.equal(analyserReponseDecouverte('   ').succes, false);
  assert.equal(analyserReponseDecouverte('bonjour, comment allez-vous ?').succes, false);
});

test('analyserReponseDecouverte : questionsCiblees plafonnees a 10', () => {
  const questions = [];
  for (let i = 0; i < 15; i++) { questions.push({ texte: 'Question ' + i, fragmentIndex: null, type: 'texte' }); }
  const r = analyserReponseDecouverte(colleJSON({
    fragments: [{ texteBrut: 'Fragment', origine: 'autre', propositions: [], competencesProposees: [] }],
    questionsCiblees: questions, reciteNettoye: ''
  }));
  assert.equal(r.valeurs.questionsCiblees.length, 10);
});

// ---------- decouverteStrategie.js ----------

test('determinerTypeCV : reconversion marquee -> toujours Par competences, quel que soit le reste', () => {
  const r = determinerTypeCV({ nombreExperiencesProfessionnelles: 5, nombreExperiencesPersonnelles: 5, objectifReconversion: true });
  assert.equal(r.type, DECOUVERTE_TYPES_CV.PAR_COMPETENCES);
  assert.equal(r.regle, 'reconversion-marquee');
});

test('determinerTypeCV : 2+ experiences pro sans personnel -> Chronologique', () => {
  const r = determinerTypeCV({ nombreExperiencesProfessionnelles: 3, nombreExperiencesPersonnelles: 0 });
  assert.equal(r.type, DECOUVERTE_TYPES_CV.CHRONOLOGIQUE);
});

test('determinerTypeCV : 2+ experiences pro ET personnel -> Mixte', () => {
  const r = determinerTypeCV({ nombreExperiencesProfessionnelles: 2, nombreExperiencesPersonnelles: 1 });
  assert.equal(r.type, DECOUVERTE_TYPES_CV.MIXTE);
});

test('determinerTypeCV : aucune experience -> Par competences (profil mince)', () => {
  const r = determinerTypeCV({});
  assert.equal(r.type, DECOUVERTE_TYPES_CV.PAR_COMPETENCES);
  assert.equal(r.regle, 'defaut-profil-mince');
});

test('calculerScoresStrategies : les 3 scores totalisent 100, aucun a 0 (plancher)', () => {
  const r = calculerScoresStrategies({ nombreExperiencesProfessionnelles: 1, nombreExperiencesPersonnelles: 0 });
  const total = r.scores.chronologique + r.scores.mixte + r.scores.parCompetences;
  assert.ok(total >= 99 && total <= 101);
  assert.ok(r.scores.chronologique > 0 && r.scores.mixte > 0 && r.scores.parCompetences > 0);
});

test('calculerScoresStrategies : reconversion pousse tres fort vers Par competences', () => {
  const r = calculerScoresStrategies({ nombreExperiencesProfessionnelles: 3, objectifReconversion: true });
  assert.equal(r.recommandation, 'parCompetences');
});

// ---------- decouverteRaffinement.js ----------

test('initialiserEtatFragment : etat de depart toujours propositionInitiale, 0 tour effectue', () => {
  const f = { id: 'frag-1', indexOriginal: 0, origine: 'proDeclaree', texteBrut: 'X', propositions: ['a'], competencesProposees: [], elementsFactuels: [] };
  const e = initialiserEtatFragment(f);
  assert.equal(e.etat, DECOUVERTE_ETATS_FRAGMENT.PROPOSITION_INITIALE);
  assert.equal(e.toursEffectues, 0);
  assert.equal(e.fragmentId, 'frag-1');
});

test('transitionner : chemin normal jusqu\'a valide, jamais plus de 2 raffinements', () => {
  const etat = { etat: DECOUVERTE_ETATS_FRAGMENT.PROPOSITION_INITIALE };
  assert.equal(_decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.PREMIER_RAFFINEMENT).succes, true);
  assert.equal(_decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.DEUXIEME_RAFFINEMENT).succes, true);
  assert.equal(_decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.REPLI_MOTS_PERSONNE).succes, true);
  assert.equal(_decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.VALIDE).succes, true);
  assert.equal(etat.etat, DECOUVERTE_ETATS_FRAGMENT.VALIDE);
});

test('transitionner : depuis deuxiemeRaffinement, impossible de redemander un 3e tour', () => {
  const etat = { etat: DECOUVERTE_ETATS_FRAGMENT.DEUXIEME_RAFFINEMENT };
  const r = _decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.DEUXIEME_RAFFINEMENT);
  assert.equal(r.succes, false);
  assert.equal(etat.etat, DECOUVERTE_ETATS_FRAGMENT.DEUXIEME_RAFFINEMENT);
});

test('transitionner : depuis valide, seul un retour vers propositionInitiale est autorise', () => {
  const etat = { etat: DECOUVERTE_ETATS_FRAGMENT.VALIDE };
  assert.equal(_decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.PREMIER_RAFFINEMENT).succes, false);
  assert.equal(_decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.PROPOSITION_INITIALE).succes, true);
});

test('transitionner : jamais de retour en arriere depuis premierRaffinement vers propositionInitiale', () => {
  const etat = { etat: DECOUVERTE_ETATS_FRAGMENT.PREMIER_RAFFINEMENT };
  const r = _decouverteTransitionner(etat, DECOUVERTE_ETATS_FRAGMENT.PROPOSITION_INITIALE);
  assert.equal(r.succes, false);
});

// ---------- Réponses suggérées sous « Quelques précisions » (consigne 217, 10/11/2026) ----------
// Règle essentielle de Denis : TOUTES les questions reçues sont gardées, avec ou sans suggestions.

const { decouverteReponsesSuggerees } = require('../modules/decouverte-competences/decouverteAnalyse.js');

function reponseAvecQuestions(questions) {
  return analyserReponseDecouverte(colleJSON({
    fragments: [{
      texteBrut: 'Serveur 3 ans', origine: 'proDeclaree', propositions: ['Service en salle'],
      competencesProposees: [{ texte: 'Accueil client', categorie: 'savoirEtre', preuve: ['3 ans'] }]
    }],
    questionsCiblees: questions, reciteNettoye: 'Serveur.'
  }));
}

test('questions : les réponses suggérées et le mode (un choix / plusieurs choix) sont conservés pour une question « texte »', () => {
  const r = reponseAvecQuestions([
    { texte: 'Quelles étaient vos missions ?', fragmentIndex: null, type: 'texte', choix: 'multiple', reponses: ['Accueillir', 'Servir', 'Encaisser'] },
    { texte: 'Aviez-vous des responsabilités ?', fragmentIndex: null, type: 'texte', choix: 'unique', reponses: ['Oui', 'Non'] }
  ]);
  assert.equal(r.succes, true);
  const q = r.valeurs.questionsCiblees.filter((x) => x.type === 'texte');
  assert.equal(q.length, 2);
  assert.equal(q[0].choix, 'multiple');
  assert.deepEqual(q[0].reponses, ['Accueillir', 'Servir', 'Encaisser']);
  assert.equal(q[1].choix, 'unique');
});

test('questions : une question SANS suggestion est quand même gardée (champ libre), jamais supprimée', () => {
  const r = reponseAvecQuestions([
    { texte: 'Autre chose à savoir ?', fragmentIndex: null, type: 'texte' },
    { texte: 'Une seule suggestion ?', fragmentIndex: null, type: 'texte', choix: 'unique', reponses: ['Seule'] },
    { texte: 'Suggestions mal formées ?', fragmentIndex: null, type: 'texte', choix: 'unique', reponses: 'pas une liste' }
  ]);
  const q = r.valeurs.questionsCiblees.filter((x) => x.type === 'texte');
  assert.equal(q.length, 3, 'les trois questions reçues sont gardées');
  q.forEach((x) => { assert.equal(x.reponses, undefined); assert.equal(x.choix, undefined); });
});

test('questions : les suggestions sont nettoyées (doublons, vides, « Autre » de l’assistant, 6 au plus, mode inconnu = un choix)', () => {
  const s = decouverteReponsesSuggerees({ choix: 'bizarre', reponses: ['  Oui ', 'oui', '', 42, 'Autre', 'Autre chose', 'A', 'B', 'C', 'D', 'E', 'F'] });
  assert.equal(s.choix, 'unique');
  assert.deepEqual(s.reponses, ['Oui', 'A', 'B', 'C', 'D', 'E']);
  assert.equal(decouverteReponsesSuggerees({ choix: 'multiple', reponses: ['x'.repeat(200), 'ok'] }), null, 'une réponse trop longue est écartée ; il en reste moins de deux');
  assert.equal(decouverteReponsesSuggerees(null), null);
});

test('questions : une question de type « date » ne reçoit jamais de suggestions', () => {
  const r = reponseAvecQuestions([{ texte: 'Quelle période ?', fragmentIndex: 0, type: 'date', choix: 'unique', reponses: ['2019', '2020'] }]);
  const d = r.valeurs.questionsCiblees.filter((x) => x.type === 'date');
  assert.equal(d.length, 1);
  assert.equal(d[0].reponses, undefined);
});
