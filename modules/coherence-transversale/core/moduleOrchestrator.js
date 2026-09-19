/* ============================================================
   modules/coherence-transversale/core/moduleOrchestrator.js
   ------------------------------------------------------------
   Orchestrateur PUR (meme discipline que modules/bilan-candidature/core/
   moduleOrchestrator.js) : enchaine collecte/, analyse/, diagnostic/, met
   a jour diagnosticStore, propage les erreurs metier telles quelles.
   AUCUNE regle metier ici -- chaque couche appelee porte deja les
   siennes.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctStore_MO = require('./diagnosticStore.js');
  var ctStoreDefinirDossier = _ctStore_MO.ctStoreDefinirDossier;
  var ctStoreObtenirDossier = _ctStore_MO.ctStoreObtenirDossier;
  var ctStoreDefinirDiagnostic = _ctStore_MO.ctStoreDefinirDiagnostic;
  var ctStoreObtenirDiagnostic = _ctStore_MO.ctStoreObtenirDiagnostic;
  var ctStoreDefinirEntretienAvance = _ctStore_MO.ctStoreDefinirEntretienAvance;
  var ctStoreObtenirEntretienAvance = _ctStore_MO.ctStoreObtenirEntretienAvance;
  var ctStoreReinitialiser = _ctStore_MO.ctStoreReinitialiser;
  var ctStoreExporterEtat = _ctStore_MO.ctStoreExporterEtat;
  var ctStoreRestaurerEtat = _ctStore_MO.ctStoreRestaurerEtat;
  var _ctDTC_MO = require('../collecte/dossierTransversalCollector.js');
  var ctCollecterDossierTransversal = _ctDTC_MO.ctCollecterDossierTransversal;
  var _ctVD_MO = require('../analyse/verificationsDeterministes.js');
  var ctExecuterVerificationsDeterministes = _ctVD_MO.ctExecuterVerificationsDeterministes;
  var _ctDiagModele_MO = require('../modeles/diagnostic.js');
  var ctCreerDiagnostic = _ctDiagModele_MO.ctCreerDiagnostic;
  var ctMarquerDiagnosticComplet = _ctDiagModele_MO.ctMarquerDiagnosticComplet;
  var ctMarquerDiagnosticEchecParsing = _ctDiagModele_MO.ctMarquerDiagnosticEchecParsing;
  var _ctEAModele_MO = require('../modeles/entretienAvance.js');
  var ctCreerEntretienAvance = _ctEAModele_MO.ctCreerEntretienAvance;
  var ctMarquerEntretienAvanceComplet = _ctEAModele_MO.ctMarquerEntretienAvanceComplet;
  var ctMarquerEntretienAvanceEchecParsing = _ctEAModele_MO.ctMarquerEntretienAvanceEchecParsing;
  var _ctPTL_MO = require('../diagnostic/promptTemplateLoader.js');
  var ctChargerTemplate = _ctPTL_MO.ctChargerTemplate;
  var _ctPB_MO = require('../diagnostic/promptBuilder.js');
  var ctConstruirePromptDiagnostic = _ctPB_MO.ctConstruirePromptDiagnostic;
  var _ctRP_MO = require('../diagnostic/responseParser.js');
  var ctParserReponseDiagnostic = _ctRP_MO.ctParserReponseDiagnostic;
  var _ctEAPB_MO = require('../diagnostic/entretienAvancePromptBuilder.js');
  var ctConstruirePromptEntretienAvance = _ctEAPB_MO.ctConstruirePromptEntretienAvance;
  var _ctEARP_MO = require('../diagnostic/entretienAvanceResponseParser.js');
  var ctParserReponseEntretienAvance = _ctEARP_MO.ctParserReponseEntretienAvance;
  var _ctUtil_MO = require('../modeles/utilitaires.js');
  var ctCreerErreurMetier = _ctUtil_MO.ctCreerErreurMetier;
}

var CT_CHEMIN_PROMPT = 'prompts/coherence-transversale.md';
var CT_CHEMIN_PROMPT_ENTRETIEN_AVANCE = 'prompts/coherence-transversale-entretien.md';

// saisieLibre, dependances : voir collecte/dossierTransversalCollector.js.
// Retourne une Promise<DossierTransversal>.
function ctDeposerDossier(saisieLibre, dependances) {
  dependances = dependances || {};
  return ctCollecterDossierTransversal(saisieLibre, dependances.collecte).then(function (dossier) {
    ctStoreDefinirDossier(dossier);
    return dossier;
  });
}

// Opere UNIQUEMENT sur le dossier deja depose (ctDeposerDossier ci-dessus).
// dependances : { lecteurTemplate, horodatage }. Leve SequenceInvalide si
// aucun dossier n'est actif -- ne devrait jamais arriver via le parcours
// normal (defense en profondeur, meme principe que le Bilan).
// Retourne une Promise<Diagnostic> (statut 'genere').
function ctDemarrerDiagnostic(dependances) {
  dependances = dependances || {};
  var dossier = ctStoreObtenirDossier();
  if (!dossier) {
    return Promise.reject(ctCreerErreurMetier('SequenceInvalide', 'Aucun dossier déposé avant de lancer le diagnostic.'));
  }

  return Promise.resolve().then(function () {
    var constatsDeterministes = ctExecuterVerificationsDeterministes(dossier);

    return ctChargerTemplate(CT_CHEMIN_PROMPT, dependances.lecteurTemplate).then(function (texteTemplate) {
      var promptDiagnostic = ctConstruirePromptDiagnostic(texteTemplate, dossier, constatsDeterministes, dependances.horodatage);
      var diagnostic = ctCreerDiagnostic({
        dossierId: dossier.id,
        promptTexte: promptDiagnostic.texte,
        dateGeneration: promptDiagnostic.dateGeneration
      });
      // Les constats deterministes font partie du diagnostic des sa
      // creation (statut 'genere') -- deja disponibles avant meme la
      // reponse de l'IA, jamais recalcules ni perdus a l'etape suivante.
      diagnostic.constatsDeterministes = constatsDeterministes;
      ctStoreDefinirDiagnostic(diagnostic);
      return diagnostic;
    });
  });
}

// dependances : { parser }. Retourne { diagnostic, anomalies }. Leve
// SequenceInvalide si aucun diagnostic n'attend de reponse ; propage
// sinon toute erreur levee par le parser (ReponseIllisible/
// ReponseIncomplete), apres avoir consigne l'echec dans le store.
function ctSoumettreReponseDiagnostic(texteColle, dependances) {
  dependances = dependances || {};

  var diagnostic = ctStoreObtenirDiagnostic();
  // TACHE (retour Denis, 2026-08-31, bug reel repere sur le Bilan, meme
  // motif copie ici) : un nouvel essai apres un echec de parsing est
  // legitime -- 'echec_parsing' n'est pas un cul-de-sac, l'ecran "Collez la
  // reponse" reste affiche et invite a reessayer.
  if (!diagnostic || (diagnostic.statut !== 'genere' && diagnostic.statut !== 'echec_parsing')) {
    throw ctCreerErreurMetier('SequenceInvalide', 'Aucun diagnostic en attente de réponse.', { statutActuel: diagnostic && diagnostic.statut });
  }

  try {
    var sortie = ctParserReponseDiagnostic(texteColle, dependances.parser);
    // Les constats deterministes (deja disponibles avant la reponse IA,
    // voir ctDemarrerDiagnostic ci-dessus) rejoignent ceux produits par
    // l'IA -- un seul et meme ensemble pour l'ecran de rapport, jamais
    // deux listes separees a afficher.
    var resultat = {
      syntheseGenerale: sortie.syntheseGenerale,
      niveau: sortie.niveau,
      syntheseNarrative: sortie.syntheseNarrative,
      questionsEntretien: sortie.questionsEntretien,
      lettreVersionCourte: sortie.lettreVersionCourte,
      constats: (diagnostic.constatsDeterministes || []).concat(sortie.constats),
      recommandations: sortie.recommandations,
      parDocument: sortie.parDocument
    };
    var diagnosticComplet = ctMarquerDiagnosticComplet(diagnostic, resultat, texteColle);
    ctStoreDefinirDiagnostic(diagnosticComplet);
    return { diagnostic: diagnosticComplet, anomalies: sortie.anomalies };
  } catch (erreur) {
    var diagnosticEchec = ctMarquerDiagnosticEchecParsing(diagnostic, texteColle);
    ctStoreDefinirDiagnostic(diagnosticEchec);
    throw erreur;
  }
}

// ---------- Entretien avance (2e prompt, Pass B, DECISION DE DENIS) ----------

// questionsReponses : [{question, reponse}] (les questions legeres du 1er
// prompt, repondues par la personne). recommandationsAppliquees/
// recommandationsNonAppliquees : fournies par l'appelant (ui.js), scope
// volontairement limite aux recommandations pour la lettre de motivation
// -- seules celles-la ont un signal d'application fiable dans l'app,
// voir ui.js. dependances : { lecteurTemplate, horodatage }. Leve
// SequenceInvalide si aucun diagnostic complet n'existe -- l'entretien
// avance n'a pas de sens sans une 1ere analyse deja terminee.
function ctDemarrerEntretienAvance(questionsReponses, recommandationsAppliquees, recommandationsNonAppliquees, dependances) {
  dependances = dependances || {};
  var dossier = ctStoreObtenirDossier();
  var diagnosticPrecedent = ctStoreObtenirDiagnostic();
  if (!dossier || !diagnosticPrecedent || diagnosticPrecedent.statut !== 'complete') {
    return Promise.reject(ctCreerErreurMetier('SequenceInvalide', 'Aucune analyse de cohérence complète avant de lancer l’entretien avancé.'));
  }

  return ctChargerTemplate(CT_CHEMIN_PROMPT_ENTRETIEN_AVANCE, dependances.lecteurTemplate).then(function (texteTemplate) {
    var prompt = ctConstruirePromptEntretienAvance(texteTemplate, dossier, diagnosticPrecedent, questionsReponses, recommandationsAppliquees, recommandationsNonAppliquees, { maintenant: dependances.horodatage });
    var entretienAvance = ctCreerEntretienAvance({
      dossierId: dossier.id,
      questionsReponses: questionsReponses,
      promptTexte: prompt.texte,
      dateGeneration: prompt.dateGeneration
    });
    ctStoreDefinirEntretienAvance(entretienAvance);
    return entretienAvance;
  });
}

// dependances : { parser }. Leve SequenceInvalide si aucun entretien
// avance n'attend de reponse ; propage sinon toute erreur levee par le
// parser, apres avoir consigne l'echec dans le store (meme discipline
// que ctSoumettreReponseDiagnostic).
function ctSoumettreReponseEntretienAvance(texteColle, dependances) {
  dependances = dependances || {};

  var entretienAvance = ctStoreObtenirEntretienAvance();
  // TACHE (retour Denis, 2026-08-31, meme motif que ci-dessus) : un nouvel
  // essai apres un echec de parsing est legitime.
  if (!entretienAvance || (entretienAvance.statut !== 'genere' && entretienAvance.statut !== 'echec_parsing')) {
    throw ctCreerErreurMetier('SequenceInvalide', 'Aucun entretien avancé en attente de réponse.', { statutActuel: entretienAvance && entretienAvance.statut });
  }

  try {
    var resultat = ctParserReponseEntretienAvance(texteColle, dependances.parser);
    var entretienAvanceComplet = ctMarquerEntretienAvanceComplet(entretienAvance, resultat, texteColle);
    ctStoreDefinirEntretienAvance(entretienAvanceComplet);
    return { entretienAvance: entretienAvanceComplet, anomalies: resultat.anomalies };
  } catch (erreur) {
    var entretienAvanceEchec = ctMarquerEntretienAvanceEchecParsing(entretienAvance, texteColle);
    ctStoreDefinirEntretienAvance(entretienAvanceEchec);
    throw erreur;
  }
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "le bouton
// retour m'envoie a l'accueil") : abandonne un diagnostic EN COURS
// (statut 'genere', avant tout collage de reponse) pour revenir au choix
// d'assistant, SANS jamais toucher au dossier -- rien de perdu, la
// personne peut recommencer le choix d'assistant avec les memes
// documents. N'efface le diagnostic que s'il n'est pas deja complet (ne
// jamais annuler un resultat deja obtenu par erreur d'appel).
function ctAnnulerDiagnostic() {
  var diagnostic = ctStoreObtenirDiagnostic();
  if (diagnostic && diagnostic.statut !== 'complete') { ctStoreDefinirDiagnostic(null); }
}

// TACHE (disquette -- couverture des modules isoles, 2026-08-25, DECISION
// DE DENIS) : contrat standard, meme nom de fonction dans chaque module
// concerne ("Xxx ExporterEtatPourSauvegarde"/"Xxx RestaurerEtatDepuisSauvegarde") --
// js/app.js les appelle sans jamais connaitre la forme interne de l'etat.
function ctExporterEtatPourSauvegarde() { return ctStoreExporterEtat(); }
function ctRestaurerEtatDepuisSauvegarde(etat) { ctStoreRestaurerEtat(etat); }

// Lectures -- seul point d'acces au store depuis l'exterieur du module
// (meme invariant que le Bilan).
function ctObtenirDossier() { return ctStoreObtenirDossier(); }
function ctObtenirDiagnostic() { return ctStoreObtenirDiagnostic(); }
function ctObtenirEntretienAvance() { return ctStoreObtenirEntretienAvance(); }
function ctReinitialiserPourTests() { ctStoreReinitialiser(); }

if (typeof module !== 'undefined') {
  module.exports = {
    CT_CHEMIN_PROMPT: CT_CHEMIN_PROMPT,
    CT_CHEMIN_PROMPT_ENTRETIEN_AVANCE: CT_CHEMIN_PROMPT_ENTRETIEN_AVANCE,
    ctDeposerDossier: ctDeposerDossier,
    ctDemarrerDiagnostic: ctDemarrerDiagnostic,
    ctSoumettreReponseDiagnostic: ctSoumettreReponseDiagnostic,
    ctDemarrerEntretienAvance: ctDemarrerEntretienAvance,
    ctSoumettreReponseEntretienAvance: ctSoumettreReponseEntretienAvance,
    ctAnnulerDiagnostic: ctAnnulerDiagnostic,
    ctExporterEtatPourSauvegarde: ctExporterEtatPourSauvegarde,
    ctRestaurerEtatDepuisSauvegarde: ctRestaurerEtatDepuisSauvegarde,
    ctObtenirDossier: ctObtenirDossier,
    ctObtenirDiagnostic: ctObtenirDiagnostic,
    ctObtenirEntretienAvance: ctObtenirEntretienAvance,
    ctReinitialiserPourTests: ctReinitialiserPourTests
  };
}
