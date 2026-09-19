const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  bilanClasserRecommandationAssistance, bilanRepartirRecommandationsAssistance
} = require('../modules/bilan-candidature/assistance/orchestrationAssistance.js');
const { BILAN_CATALOGUE_AXES } = require('../modules/bilan-candidature/analyse/axeAnalyseRegistry.js');

const EXPERIENCE_UNIQUE = [{ index: 0, poste: 'Chargée de clientèle', missions: 'Gestion d\'un portefeuille diversifié.' }];
const EXPERIENCES_MULTIPLES = [
  { index: 0, poste: 'Chargée de clientèle', missions: 'Gestion d\'un portefeuille diversifié.' },
  { index: 1, poste: 'Assistante commerciale', missions: 'Accueil et suivi administratif.' }
];

function reco(champs) {
  return Object.assign({ id: 'reco-1', contenu: 'x', dimensionsLiees: ['credibilite'], priorite: 'haute', extraitConcerne: null, observationsLiees: ['obs-1'] }, champs);
}

// --- remplacement (Niveau 1, extrait retrouve) ---

test('remplacement : extrait retrouve verbatim -> destination et texteActuel deja connus', () => {
  const r = reco({ extraitConcerne: 'Gestion d\'un portefeuille diversifié' });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'remplacement');
  assert.deepEqual(classement.destination, { liste: 'experiences', index: 0, champ: 'missions' });
  assert.equal(classement.texteActuel, 'Gestion d\'un portefeuille diversifié.');
});

// --- redactionnel (Niveau 2, experiences, une seule experience -> non ambigu) ---

test('redactionnel : axe experience sans extrait, une seule experience -> destination resolue via resolutionChampExperience', () => {
  const r = reco({ dimensionsLiees: ['risques'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'redactionnel');
  assert.deepEqual(classement.destination, { liste: 'experiences', index: 0, champ: 'missions' });
  assert.equal(classement.texteActuel, 'Gestion d\'un portefeuille diversifié.');
});

// --- chantier "enrichissement CV legers via experiencesPerso" (2026-08-22) ---

test('redactionnel : une seule experience, mais PERSONNELLE (aucune professionnelle) -> automatisable au meme titre, texteActuel retrouve via liste+index', () => {
  const experiencePersoUnique = [{ liste: 'experiencesPerso', index: 0, poste: 'Aide au garage familial', missions: 'Réparations mécaniques simples, accueil clients.' }];
  const r = reco({ dimensionsLiees: ['risques'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: experiencePersoUnique, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'redactionnel');
  assert.deepEqual(classement.destination, { liste: 'experiencesPerso', index: 0, champ: 'missions' });
  assert.equal(classement.texteActuel, 'Réparations mécaniques simples, accueil clients.');
});

// --- hors-automatisation (impossible de rattacher a UNE experience precise) ---
// TACHE (fan-out retire, 2026-08-28, DECISION DE DENIS "zero carte grise") :
// une recommandation liee a une experience sans extrait cite ET avec
// plusieurs experiences possibles n'est plus eclatee en une carte par
// experience -- elle rejoint 'hors-automatisation' (formulation proposee a
// placer soi-meme). Le couplage a UNE experience se fait en amont, par
// extraitConcerne que le 1er prompt remplit pour les recos impact/credibilite.

test('hors-automatisation : axe experience sans extrait, PLUSIEURS experiences -> non automatise (jamais un fan-out par experience)', () => {
  const r = reco({ dimensionsLiees: ['impact'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: EXPERIENCES_MULTIPLES, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'hors-automatisation');
  assert.equal(classement.destination, null);
  assert.equal(classement.destinationsCandidates, undefined);
});

test('hors-automatisation : axe experience sans extrait et sans aucune experience -> non automatise, jamais une exception', () => {
  const r = reco({ dimensionsLiees: ['posture'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: [], structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'hors-automatisation');
});

// --- completude (Famille 2, candidature) ---

test('completude : axe adequation -> aucune destination d\'ecriture, navigation uniquement', () => {
  const r = reco({ dimensionsLiees: ['adequation'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'completude');
  assert.equal(classement.destination, null);
  assert.equal(classement.texteActuel, null);
});

test('completude : axe personnalisation -> meme mecanisme que adequation', () => {
  const r = reco({ dimensionsLiees: ['personnalisation'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'completude');
});

// --- hors-modalite (texte-libre, quelle qu'en soit la raison) ---

// TACHE (axe lisibilite -> "Lisibilite et structure", 2026-08-28, DECISION
// DE DENIS) : une reco de lisibilite avec un CV structure porte sur
// l'organisation du CV (ordre/presence des rubriques) -- aucun texte a
// reformuler, donc mecanisme 'structure' (carte de guidage, jamais de
// generation), plus 'hors-modalite'. Le CV importe (structurationDisponible
// faux) garde 'hors-modalite' : la reformulation y reste utile.
test('structure : axe lisibilite + CV structure -> mecanisme structure, jamais de generation', () => {
  const r = reco({ dimensionsLiees: ['lisibilite'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'structure');
  assert.equal(classement.destination, null);
  assert.equal(classement.texteActuel, null);
});

test('hors-modalite : structurationDisponible false (CV importe) -> texte-libre quel que soit l\'axe, meme lisibilite', () => {
  const r = reco({ dimensionsLiees: ['lisibilite'], extraitConcerne: null });
  const classement = bilanClasserRecommandationAssistance(r, { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: false }, BILAN_CATALOGUE_AXES);
  assert.equal(classement.mecanisme, 'hors-modalite');
});

// --- repartition en lot ---

test('bilanRepartirRecommandationsAssistance : repartit un lot heterogene dans les 5 groupes, chacun isole', () => {
  const recommandations = [
    reco({ id: 'r-remplacement', extraitConcerne: 'Gestion d\'un portefeuille diversifié' }),
    reco({ id: 'r-redactionnel', dimensionsLiees: ['risques'], extraitConcerne: null }),
    reco({ id: 'r-completude', dimensionsLiees: ['adequation'], extraitConcerne: null }),
    reco({ id: 'r-structure', dimensionsLiees: ['lisibilite'], extraitConcerne: null })
  ];
  const repartition = bilanRepartirRecommandationsAssistance(
    recommandations, { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: true }, BILAN_CATALOGUE_AXES
  );
  assert.deepEqual(repartition.famille1.map((c) => c.recommandation.id), ['r-remplacement', 'r-redactionnel']);
  assert.deepEqual(repartition.famille2.map((c) => c.recommandation.id), ['r-completude']);
  assert.deepEqual(repartition.structure.map((c) => c.recommandation.id), ['r-structure']);
  assert.deepEqual(repartition.horsModalite, []);
  assert.deepEqual(repartition.horsAutomatisation, []);
});

test('bilanRepartirRecommandationsAssistance : lot vide -> les 5 groupes vides, jamais une exception', () => {
  const repartition = bilanRepartirRecommandationsAssistance([], { experiencesTexte: EXPERIENCE_UNIQUE, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.deepEqual(repartition, { famille1: [], famille2: [], structure: [], horsAutomatisation: [], horsModalite: [] });
});

test('bilanRepartirRecommandationsAssistance (fan-out retire) : une recommandation a plusieurs experiences possibles, sans extrait -> horsAutomatisation, jamais famille1', () => {
  const recommandations = [reco({ id: 'r-multi', dimensionsLiees: ['impact'], extraitConcerne: null })];
  const repartition = bilanRepartirRecommandationsAssistance(
    recommandations, { experiencesTexte: EXPERIENCES_MULTIPLES, structurationDisponible: true }, BILAN_CATALOGUE_AXES
  );
  assert.deepEqual(repartition.horsAutomatisation.map((c) => c.recommandation.id), ['r-multi']);
  assert.deepEqual(repartition.famille1, []);
});
