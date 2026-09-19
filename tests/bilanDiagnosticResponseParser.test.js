const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./_domStub').installerStubDom();
const { extraireBlocJSONDepuisTexte } = require('../js/app.js');

const { bilanParserReponseDiagnostic } = require('../modules/bilan-candidature/diagnostic/diagnosticResponseParser.js');
const { BILAN_CATALOGUE_AXES } = require('../modules/bilan-candidature/analyse/axeAnalyseRegistry.js');
const { bilanDiagnosticResultatEstValide } = require('../modules/bilan-candidature/modeles/diagnosticResultat.js');

const CONTEXTE = { catalogueAxes: BILAN_CATALOGUE_AXES, niveauEnvoye: 1 };
const DEPENDANCES = { extraireJSON: extraireBlocJSONDepuisTexte };

// Enveloppe un objet JS dans un texte realiste (prose + bloc de code),
// exactement comme une reponse d'IA reelle -- exerce systematiquement
// extraireBlocJSONDepuisTexte(), pas seulement JSON.parse().
function texteColleDepuis(objet, avecTexteParasite) {
  const bloc = '```json\n' + JSON.stringify(objet, null, 2) + '\n```';
  return avecTexteParasite
    ? 'Voici votre bilan de candidature :\n\n' + bloc + '\n\nJ\'espère que cela vous aide dans votre recherche !'
    : bloc;
}

function reponseDeBase(champsSupp) {
  return Object.assign({
    metaDiagnostic: { niveauAnalyse: 1, dimensionsNonEvaluables: [] },
    alertesPrioritaires: [],
    syntheseGenerale: { statutPreparation: 'a_ajuster', resumeNarratif: 'Synthèse du bilan.' },
    premiereImpression: { texte: 'Bonne première impression.' },
    ceQuiDonneEnvie: { texte: 'Un parcours cohérent.' },
    ceQuiPeutFreiner: { texte: 'Peu de résultats chiffrés.' },
    axes: [{
      id: 'credibilite',
      restitutionQualitative: 'convaincant',
      observationsArgumentees: [{ texte: 'Affirmations étayées.', observationsFactuellesLiees: [] }],
      pointsForts: ['Ton mesuré'], pointsFaibles: [], incoherences: [], risques: []
    }],
    recommandations: [{
      // observationsLiees porte le TEXTE d'une observation (ici celle de
      // l'axe ci-dessus), jamais un id genere -- l'IA ne le connait
      // jamais (voir diagnosticResponseParser.js, bilanReconstruireRecommandation).
      id: 'reco-1', contenu: 'Ajouter un résultat chiffré.', dimensionsLiees: ['credibilite'],
      priorite: 'moyenne', extraitConcerne: null, observationsLiees: ['Affirmations étayées.']
    }],
    planAction: ['reco-1'],
    syntheseProjectionRecruteur: { texte: 'Impression globale positive.' }
  }, champsSupp || {});
}

test('cas nominal : reponse parfaite -> resultat complet, aucune anomalie', () => {
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponseDeBase()), CONTEXTE, DEPENDANCES);
  assert.equal(anomalies.length, 0);
  assert.equal(resultat.axes.length, 1);
  assert.equal(resultat.recommandations.length, 1);
  assert.equal(bilanDiagnosticResultatEstValide(resultat), true);
});

test('texte parasite avant et après le JSON : extrait quand meme le bloc, resultat identique', () => {
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponseDeBase(), true), CONTEXTE, DEPENDANCES);
  assert.equal(anomalies.length, 0);
  assert.equal(resultat.syntheseGenerale.resumeNarratif, 'Synthèse du bilan.');
});

test('axe inconnu : ecarte seul, anomalie ReferenceInconnue, le reste du resultat reste intact', () => {
  const reponse = reponseDeBase({ axes: [
    reponseDeBase().axes[0],
    { id: 'axe_invente', restitutionQualitative: 'convaincant', observationsArgumentees: [], pointsForts: [], pointsFaibles: [], incoherences: [], risques: [] }
  ] });
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.axes.length, 1);
  assert.equal(resultat.axes[0].axeId, 'credibilite');
  assert.equal(anomalies.length, 1);
  assert.equal(anomalies[0].type, 'ReferenceInconnue');
  assert.equal(anomalies[0].chemin, 'axes[1].id');
});

test('recommandation incomplete (sans dimensionsLiees) : ecartee seule, anomalie ChampManquant', () => {
  const reponse = reponseDeBase({ recommandations: [
    { id: 'reco-1', contenu: 'texte', dimensionsLiees: [], priorite: 'haute', observationsLiees: ['obsf-1'] }
  ], planAction: [] });
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.recommandations.length, 0);
  assert.equal(anomalies.some((a) => a.type === 'ChampManquant' && a.chemin === 'recommandations[0].dimensionsLiees'), true);
});

test('observation avec un champ manquant : ecartee seule, l\'axe et ses autres observations survivent', () => {
  const reponse = reponseDeBase();
  reponse.axes[0].observationsArgumentees = [
    { texte: 'Observation valide.', observationsFactuellesLiees: [] },
    { observationsFactuellesLiees: [] } // texte manquant
  ];
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.axes.length, 1);
  assert.equal(resultat.axes[0].observationsArgumentees.length, 1);
  assert.equal(resultat.axes[0].observationsArgumentees[0].contenu, 'Observation valide.');
  assert.equal(anomalies.some((a) => a.type === 'ChampManquant' && a.chemin.includes('observationsArgumentees[1]')), true);
});

test('JSON valide avec erreurs de structure (restitutionQualitative + priorite invalides) : entrees ecartees, anomalies ValeurInvalide', () => {
  const reponse = reponseDeBase();
  reponse.axes[0].restitutionQualitative = 'exceptionnel'; // hors enumeration
  // La recommandation reference l'observation d'un DEUXIEME axe, valide
  // celui-la -- sinon, l'axe invalide ci-dessus emporterait aussi son
  // observation, et la reco serait ecartee en cascade (orpheline) avant
  // meme d'atteindre sa propre priorite invalide : ce test veut isoler
  // les deux rejets, pas les enchainer.
  reponse.axes.push({
    id: 'lisibilite', restitutionQualitative: 'convaincant',
    observationsArgumentees: [{ texte: 'Structure claire.', observationsFactuellesLiees: [] }],
    pointsForts: [], pointsFaibles: [], incoherences: [], risques: []
  });
  reponse.recommandations[0].observationsLiees = ['Structure claire.'];
  reponse.recommandations[0].priorite = 'urgentissime'; // hors enumeration
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.axes.length, 1); // seul l'axe 'lisibilite' survit
  assert.equal(resultat.recommandations.length, 0);
  assert.equal(anomalies.filter((a) => a.type === 'ValeurInvalide').length, 2);
  // syntheseGenerale, elle, reste exploitable malgre ces deux pertes.
  assert.equal(resultat.syntheseGenerale.resumeNarratif, 'Synthèse du bilan.');
});

test('plusieurs anomalies simultanees : chacune typee et localisee independamment (cascade planAction incluse)', () => {
  const reponse = reponseDeBase({
    axes: [
      reponseDeBase().axes[0],
      { id: 'axe_invente', restitutionQualitative: 'convaincant', observationsArgumentees: [], pointsForts: [], pointsFaibles: [], incoherences: [], risques: [] }
    ],
    // recommandation vide -> ChampManquant, ET plan_Action ('reco-1', non
    // surcharge ici) la reference encore -> ReferenceInconnue en cascade :
    // exactement le comportement tolerant attendu, pas une erreur de test.
    recommandations: [
      { id: 'reco-1', contenu: '', dimensionsLiees: ['credibilite'], priorite: 'haute', observationsLiees: ['obsf-1'] }
    ],
    alertesPrioritaires: [{ id: 'alerte-1', type: 'type_invente', description: 'x' }]
  });
  const { anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  const types = anomalies.map((a) => a.type).sort();
  assert.deepEqual(types, ['ChampManquant', 'ReferenceInconnue', 'ReferenceInconnue', 'ValeurInvalide']);
});

test('planAction : reference vers une recommandation ecartee -> filtree, anomalie ReferenceInconnue', () => {
  const reponse = reponseDeBase({
    recommandations: [{ id: 'reco-1', contenu: '', dimensionsLiees: ['credibilite'], priorite: 'haute', observationsLiees: ['obsf-1'] }],
    planAction: ['reco-1']
  });
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.deepEqual(resultat.planAction, []);
  assert.equal(anomalies.some((a) => a.type === 'ReferenceInconnue' && a.chemin === 'planAction'), true);
});

test('invariant 7 : "pret" annonce malgre une alerte prioritaire -> corrige en a_retravailler, jamais laisse tel quel', () => {
  const reponse = reponseDeBase({
    syntheseGenerale: { statutPreparation: 'pret', resumeNarratif: 'texte' },
    alertesPrioritaires: [{ id: 'alerte-1', type: 'contradiction', description: 'Deux dates incompatibles.' }]
  });
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.syntheseGenerale.statutPreparation, 'a_retravailler');
  assert.equal(anomalies.some((a) => a.chemin === 'syntheseGenerale.statutPreparation'), true);
  assert.equal(bilanDiagnosticResultatEstValide(resultat), true);
});

test('niveauAnalyse : jamais la valeur echoee par l\'IA -- toujours celle reellement envoyee', () => {
  const reponse = reponseDeBase({ metaDiagnostic: { niveauAnalyse: 3, dimensionsNonEvaluables: [] } });
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), { catalogueAxes: BILAN_CATALOGUE_AXES, niveauEnvoye: 1 }, DEPENDANCES);
  assert.equal(resultat.metaDiagnostic.niveauAnalyse, 1);
  assert.equal(anomalies.some((a) => a.chemin === 'metaDiagnostic.niveauAnalyse'), true);
});

test('ReponseIllisible : aucun JSON identifiable dans le texte', () => {
  assert.throws(
    () => bilanParserReponseDiagnostic('Ceci n\'est pas du JSON, juste du texte libre.', CONTEXTE, DEPENDANCES),
    (erreur) => erreur.code === 'ReponseIllisible'
  );
});

test('ReponseIncomplete : JSON valide mais syntheseGenerale absente -- rien d\'exploitable', () => {
  const reponse = reponseDeBase({ syntheseGenerale: undefined });
  delete reponse.syntheseGenerale;
  assert.throws(
    () => bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES),
    (erreur) => erreur.code === 'ReponseIncomplete'
  );
});

// TACHE (retour Denis, 2026-08-31, Chantier 4) : sortie de secours du prompt
// quand le texte fourni n'est pas un CV analysable.
test('SaisieInexploitable : { analyseImpossible: true } -> erreur metier dediee, jamais un rapport vide', () => {
  assert.throws(
    () => bilanParserReponseDiagnostic(
      texteColleDepuis({ analyseImpossible: true, message: 'Le texte fourni ne permet pas de faire une analyse de candidature.' }),
      CONTEXTE, DEPENDANCES
    ),
    (erreur) => erreur.code === 'SaisieInexploitable' && /analyse de candidature/.test(erreur.message)
  );
});

test('anomalies[] est un outil de diagnostic, jamais necessaire a l\'usage du resultat', () => {
  const reponse = reponseDeBase({ axes: [reponseDeBase().axes[0], { id: 'axe_invente', restitutionQualitative: 'convaincant' }] });
  const { resultat } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  // Le resultat doit rester pleinement exploitable et valide SANS jamais consulter anomalies.
  assert.equal(bilanDiagnosticResultatEstValide(resultat), true);
});

test('filet anonymisation (liste) : pointsFaibles mentionnant un element anonymise est filtre, anomalie MentionElementAnonymiseFiltree', () => {
  const reponse = reponseDeBase();
  reponse.axes[0].pointsFaibles = ['Aucune photo n\'est présente sur le CV.', 'Peu de resultats chiffres.'];
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.deepEqual(resultat.axes[0].pointsFaibles, ['Peu de resultats chiffres.']);
  assert.equal(anomalies.some((a) => a.type === 'MentionElementAnonymiseFiltree' && a.chemin === 'axes[0].pointsFaibles'), true);
});

test('filet anonymisation (liste) : recommandation entiere ecartee si son contenu mentionne un element anonymise', () => {
  const reponse = reponseDeBase({
    recommandations: [{
      id: 'reco-1', contenu: 'Le numéro de téléphone est manquant, il faudrait l\'ajouter.',
      dimensionsLiees: ['credibilite'], priorite: 'moyenne', extraitConcerne: null, observationsLiees: ['obsf-1']
    }],
    planAction: ['reco-1']
  });
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.recommandations.length, 0);
  assert.deepEqual(resultat.planAction, []);
  assert.equal(anomalies.some((a) => a.type === 'MentionElementAnonymiseFiltree' && a.chemin === 'recommandations[0].contenu'), true);
});

test('filet anonymisation (prose libre) : resumeNarratif mentionnant un element anonymise reste intact, anomalie MentionElementAnonymiseDetectee seulement', () => {
  const reponse = reponseDeBase({
    syntheseGenerale: { statutPreparation: 'a_ajuster', resumeNarratif: 'Bon profil global, mais les coordonnées sont manquantes, difficile de le recontacter.' }
  });
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.syntheseGenerale.resumeNarratif, 'Bon profil global, mais les coordonnées sont manquantes, difficile de le recontacter.');
  assert.equal(anomalies.some((a) => a.type === 'MentionElementAnonymiseDetectee' && a.chemin === 'syntheseGenerale.resumeNarratif'), true);
});

test('recommandations[].observationsLiees : resout le TEXTE d\'une observation factuelle (pas seulement argumentee), jamais un id invente', () => {
  const reponse = reponseDeBase();
  reponse.recommandations[0].observationsLiees = ['Fait deterministe.'];
  const { resultat, anomalies } = bilanParserReponseDiagnostic(
    texteColleDepuis(reponse),
    { ...CONTEXTE, observationsFactuelles: [{ id: 'obsf-1', contenu: 'Fait deterministe.' }] },
    DEPENDANCES
  );
  assert.equal(anomalies.length, 0);
  assert.equal(resultat.recommandations.length, 1);
  assert.deepEqual(resultat.recommandations[0].observationsLiees, ['obsf-1']);
});

test('recommandations[].observationsLiees : texte sans aucune correspondance -> recommandation ecartee, anomalie ReferenceInconnue (regression du bug "Une erreur est survenue" systematique)', () => {
  const reponse = reponseDeBase();
  reponse.recommandations[0].observationsLiees = ['Ce texte ne correspond a aucune observation reelle.'];
  const { resultat, anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponse), CONTEXTE, DEPENDANCES);
  assert.equal(resultat.recommandations.length, 0);
  assert.equal(anomalies.some((a) => a.type === 'ReferenceInconnue' && a.chemin === 'recommandations[0].observationsLiees'), true);
  assert.equal(anomalies.some((a) => a.type === 'ChampManquant' && a.chemin === 'recommandations[0].observationsLiees'), true);
});

test('filet anonymisation : aucune fausse alerte quand aucun texte ne mentionne d\'element anonymise', () => {
  const { anomalies } = bilanParserReponseDiagnostic(texteColleDepuis(reponseDeBase()), CONTEXTE, DEPENDANCES);
  assert.equal(anomalies.some((a) => a.type === 'MentionElementAnonymiseFiltree' || a.type === 'MentionElementAnonymiseDetectee'), false);
});

test('phraseAChiffrer (Carte 3) : parsee quand presente, null quand absente, jamais une anomalie', () => {
  const avec = reponseDeBase();
  avec.recommandations[0].phraseAChiffrer = 'Sur ce poste, j\'ai suivi ___ dossiers par mois.';
  const r1 = bilanParserReponseDiagnostic(texteColleDepuis(avec), CONTEXTE, DEPENDANCES);
  assert.equal(r1.anomalies.length, 0);
  assert.equal(r1.resultat.recommandations[0].phraseAChiffrer, 'Sur ce poste, j\'ai suivi ___ dossiers par mois.');

  const sans = bilanParserReponseDiagnostic(texteColleDepuis(reponseDeBase()), CONTEXTE, DEPENDANCES);
  assert.equal(sans.resultat.recommandations[0].phraseAChiffrer, null);
});
