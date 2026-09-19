const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

require('./_domStub').installerStubDom();
const { extraireBlocJSONDepuisTexte } = require('../js/app.js');

const orchestrateur = require('../modules/bilan-candidature/core/moduleOrchestrator.js');
const { bilanReinitialiserCacheTemplate } = require('../modules/bilan-candidature/diagnostic/promptTemplateLoader.js');

const TEXTE_PROMPT_1 = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v1.md'), 'utf8');
const TEXTE_PROMPT_2 = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2.md'), 'utf8');

beforeEach(() => {
  bilanReinitialiserCacheTemplate();
  orchestrateur.bilanReinitialiserPourTests();
});

function dependancesCollecte(overrides) {
  return Object.assign({
    lecteurs: {
      lireCv: () => 'Jean Dupont — CV complet, plusieurs expériences.',
      // Ni metierVise ni offreEmploi : niveau 1, coherent avec
      // metaDiagnostic.niveauAnalyse: 1 code en dur dans reponseDiagnosticJSON().
      lireMetierVise: () => null,
      lireEntrepriseCiblee: () => null
    },
    afficherEcranRelecture: (contenu, callbacks) => { callbacks.onValider(contenu); },
    maintenant: () => '2026-08-08T00:00:00.000Z'
  }, overrides || {});
}

function reponseDiagnosticJSON() {
  return {
    metaDiagnostic: { niveauAnalyse: 1, dimensionsNonEvaluables: [] },
    alertesPrioritaires: [],
    syntheseGenerale: { statutPreparation: 'a_ajuster', resumeNarratif: 'Synthèse du bilan.' },
    premiereImpression: { texte: 'Bonne première impression.' },
    ceQuiDonneEnvie: { texte: 'Un parcours cohérent.' },
    ceQuiPeutFreiner: { texte: 'Peu de résultats chiffrés.' },
    axes: [{
      id: 'credibilite', restitutionQualitative: 'convaincant',
      observationsArgumentees: [{ texte: 'Affirmations étayées.', observationsFactuellesLiees: [] }],
      pointsForts: [], pointsFaibles: [], incoherences: [], risques: []
    }],
    recommandations: [{
      id: 'reco-1', contenu: 'Ajouter un résultat chiffré.', dimensionsLiees: ['credibilite'],
      // TACHE (correction bug "Une erreur est survenue" systematique sur
      // "Ameliorer cette recommandation") : observationsLiees porte le
      // TEXTE d'une observation, jamais un id genere -- l'IA ne connait
      // jamais cet id (voir diagnosticResponseParser.js,
      // bilanReconstruireRecommandation). Reproduit ici une reponse IA
      // realiste, pas le format interne post-resolution.
      priorite: 'moyenne', extraitConcerne: 'A géré une équipe.', observationsLiees: ['Affirmations étayées.']
    }],
    planAction: ['reco-1'],
    syntheseProjectionRecruteur: { texte: 'Impression globale positive.' }
  };
}

function texteColleJSON(objet) {
  return 'Voici le résultat :\n```json\n' + JSON.stringify(objet, null, 2) + '\n```\nN\'hésitez pas à demander plus de détails.';
}

// TACHE (RC-02, architecture finale, 2026-08-22) : le depot de la
// candidature est desormais une operation SEPAREE du lancement du
// diagnostic (bilanDeposerCandidature() puis bilanDemarrerDiagnostic()),
// jamais couplees -- reflete l'ordre reel du parcours (relecture avant
// choix de l'assistant, aligne sur CV/Lettre/Entretien).
async function deposerCandidature(overridesCollecte) {
  return orchestrateur.bilanDeposerCandidature({}, { collecte: dependancesCollecte(overridesCollecte) });
}

async function demarrerEtCompleterDiagnostic() {
  await deposerCandidature();
  await orchestrateur.bilanDemarrerDiagnostic({
    lecteursAnalyse: { lireExperiencesDates: () => [] },
    lecteurTemplate1: () => TEXTE_PROMPT_1,
    horodatage: () => '2026-08-08T00:00:00.000Z'
  });
  return orchestrateur.bilanSoumettreReponseDiagnostic(texteColleJSON(reponseDiagnosticJSON()), {
    parser: { extraireJSON: extraireBlocJSONDepuisTexte }
  });
}

test('bilanDeposerCandidature : collecte, relit, et STOCKE la candidature -- disponible immediatement via bilanObtenirCandidature', async () => {
  const candidature = await deposerCandidature();
  assert.equal(orchestrateur.bilanObtenirCandidature(), candidature);
  assert.equal(candidature.cv, 'Jean Dupont — CV complet, plusieurs expériences.');
  assert.equal(candidature.confidentialiteValidee, true);
});

test('bilanDemarrerDiagnostic : leve SequenceInvalide si aucune candidature n\'a ete deposee', async () => {
  await assert.rejects(
    () => orchestrateur.bilanDemarrerDiagnostic({ lecteurTemplate1: () => TEXTE_PROMPT_1 }),
    (erreur) => erreur.code === 'SequenceInvalide'
  );
});

test('bilanDemarrerDiagnostic : opere sur la candidature deja deposee, ne collecte plus rien elle-meme', async () => {
  await deposerCandidature();
  const diagnostic = await orchestrateur.bilanDemarrerDiagnostic({
    lecteursAnalyse: { lireExperiencesDates: () => [] },
    lecteurTemplate1: () => TEXTE_PROMPT_1
  });
  assert.equal(diagnostic.candidatureId, orchestrateur.bilanObtenirCandidature().id);
});

test('flux complet : deposer -> demarrer -> soumettre diagnostic -> demander amelioration -> soumettre amelioration, tracabilite preservee', async () => {
  const { diagnostic, anomalies } = await demarrerEtCompleterDiagnostic();
  assert.equal(diagnostic.statut, 'complete');
  assert.equal(anomalies.length, 0);

  const { demande, promptTexte } = await orchestrateur.bilanDemanderAmelioration('reco-1', ['ton direct'], {
    lecteurTemplate2: () => TEXTE_PROMPT_2,
    horodatage: () => '2026-08-08T00:00:00.000Z'
  });
  assert.doesNotMatch(promptTexte, /\{[A-Z_]+\}/);
  assert.equal(demande.recommandationSelectionnee.id, 'reco-1');

  const proposition = orchestrateur.bilanSoumettreReponseAmelioration(
    demande.id,
    texteColleJSON({ proposition: 'Texte amélioré.', justification: 'Répond à l\'observation citée.', actionsConcretes: [] }),
    { parser: { extraireJSON: extraireBlocJSONDepuisTexte } }
  );

  // Chaine Observation -> Recommandation -> Amelioration jamais rompue.
  assert.equal(proposition.recommandationId, 'reco-1');
  assert.equal(proposition.demandeAmeliorationId, demande.id);
  assert.equal(orchestrateur.bilanObtenirPropositionAmelioration(demande.id), proposition);
});

test('bilanDemarrerDiagnostic : le prompt genere ne contient plus aucun placeholder (vrai gabarit reel)', async () => {
  await deposerCandidature();
  const diagnostic = await orchestrateur.bilanDemarrerDiagnostic({
    lecteursAnalyse: { lireExperiencesDates: () => [] },
    lecteurTemplate1: () => TEXTE_PROMPT_1
  });
  assert.doesNotMatch(diagnostic.promptTexte, /\{[A-Z_]+\}/);
  assert.equal(diagnostic.statut, 'genere');
});

test('bilanSoumettreReponseDiagnostic : leve SequenceInvalide si aucun diagnostic n\'attend de reponse', () => {
  assert.throws(
    () => orchestrateur.bilanSoumettreReponseDiagnostic('peu importe', {}),
    (erreur) => erreur.code === 'SequenceInvalide'
  );
});

test('bilanSoumettreReponseDiagnostic : erreur de parsing propagee telle quelle, ET diagnostic passe a echec_parsing dans le store', async () => {
  await deposerCandidature();
  await orchestrateur.bilanDemarrerDiagnostic({
    lecteursAnalyse: { lireExperiencesDates: () => [] },
    lecteurTemplate1: () => TEXTE_PROMPT_1
  });

  // bilanSoumettreReponseDiagnostic est entierement synchrone (aucun
  // travail asynchrone necessaire en interne) -- assert.throws, pas
  // assert.rejects.
  assert.throws(
    () => orchestrateur.bilanSoumettreReponseDiagnostic('texte sans aucun JSON', { parser: { extraireJSON: extraireBlocJSONDepuisTexte } }),
    (erreur) => erreur.code === 'ReponseIllisible'
  );

  assert.equal(orchestrateur.bilanObtenirDiagnostic().statut, 'echec_parsing');
});

// TACHE (retour Denis, 2026-08-31, bug reel) : apres un echec de parsing,
// l'ecran "Collez la reponse" reste affiche et invite a reessayer -- un 2e
// essai VALIDE doit aboutir, sans que la personne ait a recommencer tout
// l'aller-retour avec l'assistant. 'echec_parsing' n'est PAS un cul-de-sac.
test('bilanSoumettreReponseDiagnostic : un 2e essai valide APRES un echec de parsing aboutit (echec_parsing accepte a la reprise)', async () => {
  await deposerCandidature();
  await orchestrateur.bilanDemarrerDiagnostic({
    lecteursAnalyse: { lireExperiencesDates: () => [] },
    lecteurTemplate1: () => TEXTE_PROMPT_1
  });
  assert.throws(
    () => orchestrateur.bilanSoumettreReponseDiagnostic('texte sans aucun JSON', { parser: { extraireJSON: extraireBlocJSONDepuisTexte } }),
    (erreur) => erreur.code === 'ReponseIllisible'
  );
  assert.equal(orchestrateur.bilanObtenirDiagnostic().statut, 'echec_parsing');

  const sortie = orchestrateur.bilanSoumettreReponseDiagnostic(
    texteColleJSON(reponseDiagnosticJSON()),
    { parser: { extraireJSON: extraireBlocJSONDepuisTexte } }
  );
  assert.equal(sortie.diagnostic.statut, 'complete');
  assert.equal(orchestrateur.bilanObtenirDiagnostic().statut, 'complete');
});

test('bilanDemanderAmelioration : RecommandationInexistante propagee telle quelle (aucune duplication de controle dans core/)', async () => {
  await demarrerEtCompleterDiagnostic();
  await assert.rejects(
    () => orchestrateur.bilanDemanderAmelioration('reco-fantome', [], { lecteurTemplate2: () => TEXTE_PROMPT_2 }),
    (erreur) => erreur.code === 'RecommandationInexistante'
  );
});

test('bilanDemanderAmelioration : RecommandationInexistante si appelee avant tout diagnostic (pas de SequenceInvalide invente ici)', async () => {
  await assert.rejects(
    () => orchestrateur.bilanDemanderAmelioration('reco-1', [], { lecteurTemplate2: () => TEXTE_PROMPT_2 }),
    (erreur) => erreur.code === 'RecommandationInexistante'
  );
});

test('lectures : bilanObtenirCandidature/Diagnostic reproduisent exactement l\'etat du store, sans transformation', async () => {
  await deposerCandidature();
  const diagnostic = await orchestrateur.bilanDemarrerDiagnostic({
    lecteursAnalyse: { lireExperiencesDates: () => [] },
    lecteurTemplate1: () => TEXTE_PROMPT_1
  });
  assert.equal(orchestrateur.bilanObtenirDiagnostic(), diagnostic);
  assert.equal(orchestrateur.bilanObtenirCandidature().cv, 'Jean Dupont — CV complet, plusieurs expériences.');
});

// TACHE (RC-02, architecture finale, 2026-08-22) : bilanMettreAJourCvCandidature
// est le seul point d'ecriture d'une correction depuis l'exterieur du
// module -- verifie ici qu'elle ne casse jamais le diagnostic en cours,
// exactement le bug identifie en revue d'architecture avant d'ecrire le code.
test('bilanMettreAJourCvCandidature : corrige le cv sans jamais casser le diagnostic ni la tracabilite en cours', async () => {
  await demarrerEtCompleterDiagnostic();
  const diagnosticAvant = orchestrateur.bilanObtenirDiagnostic();

  orchestrateur.bilanMettreAJourCvCandidature('Jean Dupont — CV corrige.');

  assert.equal(orchestrateur.bilanObtenirCandidature().cv, 'Jean Dupont — CV corrige.');
  assert.equal(orchestrateur.bilanObtenirDiagnostic(), diagnosticAvant);
});

// TACHE (chantier "continuite Diagnostic -> Correction", brique 5 ; revu
// RC-02, 2026-08-22) : bilanRecommencerDiagnostic est une operation
// metier reelle (ecran de cloture, "Analyser a nouveau mon CV").
// CHANGEMENT : ne vide plus la candidature -- seul un vrai "nouveau
// depart" (bilanReinitialiserPourTests) le fait. Une reanalyse doit
// pouvoir refleter une correction texte-libre deja appliquee via
// bilanMettreAJourCvCandidature -- perdre ce texte serait le meme bug que
// celui identifie en revue d'architecture.
test('bilanRecommencerDiagnostic : vide le diagnostic mais PRESERVE la candidature (et ses corrections)', async () => {
  await demarrerEtCompleterDiagnostic();
  orchestrateur.bilanMettreAJourCvCandidature('Jean Dupont — CV corrige avant reanalyse.');

  orchestrateur.bilanRecommencerDiagnostic();

  assert.equal(orchestrateur.bilanObtenirDiagnostic(), null);
  assert.notEqual(orchestrateur.bilanObtenirCandidature(), null);
  assert.equal(orchestrateur.bilanObtenirCandidature().cv, 'Jean Dupont — CV corrige avant reanalyse.');
});

test('bilanRecommencerDiagnostic : sans candidature active, ne leve jamais d\'exception (defense en profondeur)', () => {
  assert.doesNotThrow(() => orchestrateur.bilanRecommencerDiagnostic());
});

// TACHE (chantier "ignorer un point du rapport", 2026-08-25) : meme
// discipline que bilanMettreAJourCvCandidature ci-dessus -- verifie que
// mettre a jour pointsDejaConnus AVANT une reanalyse survit au reset
// d'etat que bilanRecommencerDiagnostic() declenche (c'est le seul moyen
// pour le prochain Prompt 1 de recevoir cette information, voir
// diagnosticPromptBuilder.js).
test('bilanMettreAJourPointsDejaConnusCandidature : la valeur survit a bilanRecommencerDiagnostic', async () => {
  await demarrerEtCompleterDiagnostic();
  orchestrateur.bilanMettreAJourPointsDejaConnusCandidature('- Ne pas remontrer la recommandation sur les chiffres.');

  orchestrateur.bilanRecommencerDiagnostic();

  assert.equal(orchestrateur.bilanObtenirCandidature().pointsDejaConnus, '- Ne pas remontrer la recommandation sur les chiffres.');
});

test('bilanMettreAJourPointsDejaConnusCandidature : sans candidature active, leve EtatIncoherent', () => {
  assert.throws(
    () => orchestrateur.bilanMettreAJourPointsDejaConnusCandidature('x'),
    (erreur) => erreur.code === 'EtatIncoherent'
  );
});

// ---------- chantier "titre et accroche du CV" (2026-08-25) : delibrement
// SANS lien a un diagnostic ni une candidature deposee -- contrairement a
// bilanDemanderAmelioration, ce mecanisme n'a pas de recommandation a
// retrouver (voir titreAccrochePromptBuilder.js). ----------

const TEXTE_PROMPT_TITRE_ACCROCHE = 'Métier : {METIER_VISE_OU_NON_FOURNI}\nOffre : {OFFRE_EMPLOI_OU_NON_FOURNIE}\nCV :\n{CV_TEXTE}';

test('bilanDemanderTitreEtAccroche : construit le prompt a partir du contexte fourni, sans dependre d\'un diagnostic', async () => {
  const { promptTexte } = await orchestrateur.bilanDemanderTitreEtAccroche(
    { cv: 'Vendeur, 3 ans.', metierVise: 'Chargé de clientèle' },
    { lecteurTemplate: () => TEXTE_PROMPT_TITRE_ACCROCHE }
  );
  assert.ok(promptTexte.indexOf('Chargé de clientèle') !== -1);
  assert.ok(promptTexte.indexOf('Vendeur, 3 ans.') !== -1);
  assert.ok(promptTexte.indexOf('Offre : Non fourni.') !== -1);
});

test('bilanSoumettreReponseTitreEtAccroche : parse la reponse collee, jamais d\'ecriture dans le store', async () => {
  const resultat = orchestrateur.bilanSoumettreReponseTitreEtAccroche(
    '```json\n' + JSON.stringify({ titre: 'Vendeur conseil', accroches: ['Accroche 1.', 'Accroche 2.'] }) + '\n```',
    { parser: { extraireJSON: extraireBlocJSONDepuisTexte } }
  );
  assert.equal(resultat.titre, 'Vendeur conseil');
  assert.deepEqual(resultat.accroches, ['Accroche 1.', 'Accroche 2.']);
});
