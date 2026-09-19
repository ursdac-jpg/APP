const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctDeposerDossier, ctDemarrerDiagnostic, ctSoumettreReponseDiagnostic,
  ctDemarrerEntretienAvance, ctSoumettreReponseEntretienAvance, ctObtenirEntretienAvance,
  ctAnnulerDiagnostic, ctObtenirDossier, ctObtenirDiagnostic, ctReinitialiserPourTests
} = require('../modules/coherence-transversale/core/moduleOrchestrator.js');
const { ctReinitialiserCacheTemplate } = require('../modules/coherence-transversale/diagnostic/promptTemplateLoader.js');

// ctChargerTemplate met en cache PAR CHEMIN (voir promptTemplateLoader.js) --
// reinitialise a chaque test pour que le lecteurTemplate injecte soit
// systematiquement rappele, jamais un resultat cache d'un test precedent.
beforeEach(() => { ctReinitialiserPourTests(); ctReinitialiserCacheTemplate(); });

var TEMPLATE_DE_TEST = 'CV:{CV}\nLETTRE:{LETTRE}\nOFFRE:{OFFRE_OU_NON_FOURNIE}\nENTREPRISE:{ENTREPRISE_OU_NON_FOURNIE}\nSITE:{SITE_ENTREPRISE_OU_NON_FOURNI}\nENTRETIEN:{PREPARATION_ENTRETIEN_OU_NON_FOURNIE}\nCONSTATS:{CONSTATS_DETERMINISTES}';

function dependancesCollecteDeTest() {
  return {
    lecteurs: {
      lireCv: () => 'Mon CV complet',
      lireLettreTexte: () => 'Madame, Monsieur...',
      lireEntrepriseCiblee: () => null,
      lireSiteEntreprise: () => null,
      lireEntretienTexte: () => '',
      lireAccrocheCv: () => ''
    },
    afficherEcran: (contenu, titre, callbacks) => callbacks.onValider(contenu)
  };
}

function extraireJSONDeTest(texte) {
  const match = texte.match(/```json\s*([\s\S]*?)```/);
  return match ? JSON.parse(match[1]) : null;
}

function reponseIADeTest() {
  return 'Analyse prête.\n```json\n' + JSON.stringify({
    syntheseGenerale: 'Dossier globalement cohérent.',
    constats: [{ ancrage: ['lettre'], nature: 'force', dimension: 'motivation', preuve: ['extrait'], message: 'Bonne motivation exprimée.' }],
    recommandations: [{ constatsLies: [0], contenu: 'Rien à changer ici.', documentCible: 'lettre', modeApplication: 'conseil' }]
  }) + '\n```';
}

test('ctDemarrerDiagnostic : rejette avec SequenceInvalide si aucun dossier n\'a ete depose', async () => {
  await assert.rejects(() => ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST }), (e) => e.code === 'SequenceInvalide');
});

test('parcours complet : deposer -> demarrer -> soumettre', async () => {
  const dossier = await ctDeposerDossier({}, { collecte: dependancesCollecteDeTest() });
  assert.equal(dossier.cv, 'Mon CV complet');
  assert.equal(ctObtenirDossier().id, dossier.id);

  const diagnostic = await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });
  assert.equal(diagnostic.statut, 'genere');
  assert.ok(diagnostic.promptTexte.indexOf('CV:Mon CV complet') !== -1);
  assert.ok(diagnostic.promptTexte.indexOf('OFFRE:Non fournie.') !== -1);

  const { diagnostic: diagnosticComplet, anomalies } = ctSoumettreReponseDiagnostic(reponseIADeTest(), { parser: { extraireJSON: extraireJSONDeTest } });
  assert.equal(diagnosticComplet.statut, 'complete');
  assert.deepEqual(anomalies, []);
  assert.equal(diagnosticComplet.resultat.syntheseGenerale, 'Dossier globalement cohérent.');
  assert.equal(diagnosticComplet.resultat.recommandations.length, 1);
  assert.equal(ctObtenirDiagnostic().statut, 'complete');
});

test('ctDemarrerDiagnostic : les constats deterministes (duplication) rejoignent ceux de l\'IA a la soumission', async () => {
  const phraseLongue = 'Professionnelle engagée avec cinq ans d’expérience en gestion de projet.';
  await ctDeposerDossier({}, {
    collecte: {
      lecteurs: {
        lireCv: () => phraseLongue,
        lireLettreTexte: () => phraseLongue + ' Je postule avec motivation.',
        lireEntrepriseCiblee: () => null,
        lireSiteEntreprise: () => null,
        lireEntretienTexte: () => '',
        lireAccrocheCv: () => ''
      },
      afficherEcran: (contenu, titre, callbacks) => callbacks.onValider(contenu)
    }
  });
  const diagnostic = await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });
  assert.equal(diagnostic.constatsDeterministes.length, 1);
  assert.equal(diagnostic.constatsDeterministes[0].nature, 'duplication');

  const { diagnostic: diagnosticComplet } = ctSoumettreReponseDiagnostic(reponseIADeTest(), { parser: { extraireJSON: extraireJSONDeTest } });
  // 1 constat deterministe (duplication) + 1 constat produit par l'IA (force).
  assert.equal(diagnosticComplet.resultat.constats.length, 2);
  assert.ok(diagnosticComplet.resultat.constats.some((c) => c.nature === 'duplication'));
  assert.ok(diagnosticComplet.resultat.constats.some((c) => c.nature === 'force'));
});

test('ctSoumettreReponseDiagnostic : rejette avec SequenceInvalide si aucun diagnostic en attente', () => {
  assert.throws(() => ctSoumettreReponseDiagnostic('texte', {}), (e) => e.code === 'SequenceInvalide');
});

test('ctSoumettreReponseDiagnostic : ReponseIllisible -> diagnostic marque echec_parsing dans le store', async () => {
  await ctDeposerDossier({}, { collecte: dependancesCollecteDeTest() });
  await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });

  assert.throws(
    () => ctSoumettreReponseDiagnostic('texte sans JSON', { parser: { extraireJSON: extraireJSONDeTest } }),
    (e) => e.code === 'ReponseIllisible'
  );
  assert.equal(ctObtenirDiagnostic().statut, 'echec_parsing');
});

// TACHE (retour Denis, 2026-08-31, meme bug que sur le Bilan) : apres un
// echec de parsing, un 2e essai VALIDE doit aboutir -- 'echec_parsing' n'est
// pas un cul-de-sac, l'ecran de collage reste affiche et invite a reessayer.
test('ctSoumettreReponseDiagnostic : un 2e essai valide APRES un echec de parsing aboutit', async () => {
  await ctDeposerDossier({}, { collecte: dependancesCollecteDeTest() });
  await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });

  assert.throws(
    () => ctSoumettreReponseDiagnostic('texte sans JSON', { parser: { extraireJSON: extraireJSONDeTest } }),
    (e) => e.code === 'ReponseIllisible'
  );
  assert.equal(ctObtenirDiagnostic().statut, 'echec_parsing');

  const { diagnostic: diagnosticComplet } = ctSoumettreReponseDiagnostic(reponseIADeTest(), { parser: { extraireJSON: extraireJSONDeTest } });
  assert.equal(diagnosticComplet.statut, 'complete');
  assert.equal(ctObtenirDiagnostic().statut, 'complete');
});

// TACHE (entretien avance, Pass B, 2026-08-25, DECISION DE DENIS)
var TEMPLATE_ENTRETIEN_AVANCE_DE_TEST = 'CV:{CV}\nLETTRE:{LETTRE}\nOFFRE:{OFFRE_OU_NON_FOURNIE}\nENTREPRISE:{ENTREPRISE_OU_NON_FOURNIE}\nSITE:{SITE_ENTREPRISE_OU_NON_FOURNI}\nSTRUCTURE:{TYPE_STRUCTURE_OU_NON_FOURNI}\nSYNTHESE:{SYNTHESE_ANALYSE_PRECEDENTE}\nQR:{QUESTIONS_REPONSES_PERSONNE}\nAPPLIQUEES:{RECOMMANDATIONS_APPLIQUEES_OU_AUCUNE}\nNON_APPLIQUEES:{RECOMMANDATIONS_NON_APPLIQUEES_OU_AUCUNE}';

function reponseEntretienAvanceDeTest() {
  return 'Entretien terminé.\n```json\n' + JSON.stringify({
    synthese: 'Bon entretien global.',
    pointsForts: ['Discours clair'],
    axesAmelioration: ['Un exemple chiffré manquant'],
    recommandations: ['Préparer un exemple chiffré.'],
    parQuestion: [{ question: 'Présentez-vous.', resumeReponse: 'Parcours de vendeur.', attentesEmployeur: 'Cohérence avec le CV.' }]
  }) + '\n```';
}

test('ctDemarrerEntretienAvance : rejette avec SequenceInvalide si aucun diagnostic complet n\'existe', async () => {
  await assert.rejects(
    () => ctDemarrerEntretienAvance([], [], [], { lecteurTemplate: () => TEMPLATE_ENTRETIEN_AVANCE_DE_TEST }),
    (e) => e.code === 'SequenceInvalide'
  );
});

test('parcours complet entretien avance : deposer -> diagnostic complet -> demarrer entretien avance -> soumettre', async () => {
  await ctDeposerDossier({}, { collecte: dependancesCollecteDeTest() });
  await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });
  ctSoumettreReponseDiagnostic(reponseIADeTest(), { parser: { extraireJSON: extraireJSONDeTest } });

  const questionsReponses = [{ question: 'Depuis quand ?', reponse: 'Trois ans.' }];
  const entretienAvance = await ctDemarrerEntretienAvance(
    questionsReponses, [{ contenu: 'Reco appliquée.' }], [{ contenu: 'Reco non appliquée.' }],
    { lecteurTemplate: () => TEMPLATE_ENTRETIEN_AVANCE_DE_TEST }
  );
  assert.equal(entretienAvance.statut, 'genere');
  assert.ok(entretienAvance.promptTexte.indexOf('SYNTHESE:Dossier globalement cohérent.') !== -1);
  assert.ok(entretienAvance.promptTexte.indexOf('APPLIQUEES:- Reco appliquée.') !== -1);
  assert.equal(ctObtenirEntretienAvance().id, entretienAvance.id);

  const { entretienAvance: entretienAvanceComplet, anomalies } = ctSoumettreReponseEntretienAvance(reponseEntretienAvanceDeTest(), { parser: { extraireJSON: extraireJSONDeTest } });
  assert.equal(entretienAvanceComplet.statut, 'complete');
  assert.deepEqual(anomalies, []);
  assert.equal(entretienAvanceComplet.resultat.synthese, 'Bon entretien global.');
  assert.equal(ctObtenirEntretienAvance().statut, 'complete');
});

test('ctSoumettreReponseEntretienAvance : rejette avec SequenceInvalide si aucun entretien avance en attente', () => {
  assert.throws(() => ctSoumettreReponseEntretienAvance('texte'), (e) => e.code === 'SequenceInvalide');
});

// TACHE (retour Denis, 2026-08-31, meme bug) : un 2e essai valide APRES un
// echec de parsing de l'entretien avance doit aboutir.
test('ctSoumettreReponseEntretienAvance : un 2e essai valide APRES un echec de parsing aboutit', async () => {
  await ctDeposerDossier({}, { collecte: dependancesCollecteDeTest() });
  await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });
  ctSoumettreReponseDiagnostic(reponseIADeTest(), { parser: { extraireJSON: extraireJSONDeTest } });
  await ctDemarrerEntretienAvance(
    [{ question: 'Depuis quand ?', reponse: 'Trois ans.' }], [], [],
    { lecteurTemplate: () => TEMPLATE_ENTRETIEN_AVANCE_DE_TEST }
  );

  assert.throws(
    () => ctSoumettreReponseEntretienAvance('texte sans JSON', { parser: { extraireJSON: extraireJSONDeTest } }),
    (e) => e.code === 'ReponseIllisible'
  );
  assert.equal(ctObtenirEntretienAvance().statut, 'echec_parsing');

  const { entretienAvance: complet } = ctSoumettreReponseEntretienAvance(reponseEntretienAvanceDeTest(), { parser: { extraireJSON: extraireJSONDeTest } });
  assert.equal(complet.statut, 'complete');
  assert.equal(ctObtenirEntretienAvance().statut, 'complete');
});

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "Retour" ne
// doit jamais envoyer a l'accueil)
test('ctAnnulerDiagnostic : efface un diagnostic "genere", jamais le dossier', async () => {
  await ctDeposerDossier({}, { collecte: dependancesCollecteDeTest() });
  await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });
  assert.ok(ctObtenirDiagnostic());
  ctAnnulerDiagnostic();
  assert.equal(ctObtenirDiagnostic(), null);
  assert.ok(ctObtenirDossier());
});

test('ctAnnulerDiagnostic : ne touche jamais un diagnostic deja complet', async () => {
  await ctDeposerDossier({}, { collecte: dependancesCollecteDeTest() });
  await ctDemarrerDiagnostic({ lecteurTemplate: () => TEMPLATE_DE_TEST });
  ctSoumettreReponseDiagnostic(reponseIADeTest(), { parser: { extraireJSON: extraireJSONDeTest } });
  ctAnnulerDiagnostic();
  assert.equal(ctObtenirDiagnostic().statut, 'complete');
});

test('ctAnnulerDiagnostic : sans diagnostic actif, ne fait rien, jamais une exception', () => {
  assert.doesNotThrow(() => ctAnnulerDiagnostic());
});

test('ctDeposerDossier : rejette avec DossierTransversalInvalide si la lettre manque, jamais depose dans le store', async () => {
  await assert.rejects(
    () => ctDeposerDossier({}, {
      collecte: {
        lecteurs: { lireCv: () => 'Mon CV', lireLettreTexte: () => '', lireEntrepriseCiblee: () => null, lireSiteEntreprise: () => null, lireEntretienTexte: () => '', lireAccrocheCv: () => '' },
        afficherEcran: () => {}
      }
    }),
    (e) => e.code === 'DossierTransversalInvalide'
  );
  assert.equal(ctObtenirDossier(), null);
});
