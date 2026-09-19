/* ============================================================
   modules/coherence-transversale/diagnostic/entretienAvancePromptBuilder.js
   ------------------------------------------------------------
   Seule couche du module qui connait les noms reels des placeholders du
   2e prompt (prompts/coherence-transversale-entretien.md). Copie du
   meme motif que promptBuilder.js (1er prompt), jamais un import croise
   entre les deux -- chacun ses propres petites fonctions de formatage,
   objectif de portabilite (voir CONTRATS.md).

   recommandationsAppliquees/recommandationsNonAppliquees sont fournies
   par l'appelant (ui.js) -- ce fichier ne connait pas _ctRecommandationsLettreAppliquees
   (etat propre a l'ecran, pas au module).
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctTemplateLoaderEAPB = require('./promptTemplateLoader.js');
  var ctResoudrePlaceholders = _ctTemplateLoaderEAPB.ctResoudrePlaceholders;
  var _ctUtilEAPB = require('../modeles/utilitaires.js');
  var ctCreerErreurMetier = _ctUtilEAPB.ctCreerErreurMetier;
}

function ctFormaterValeurOptionnelleEA(valeur) {
  return valeur ? valeur : 'Non fournie.';
}

function ctFormaterQuestionsReponsesEA(questionsReponses) {
  if (!questionsReponses || !questionsReponses.length) { return 'Aucune.'; }
  return questionsReponses.map(function (qr) {
    return '- Q : ' + qr.question + '\n  R : ' + ((qr.reponse && qr.reponse.trim()) ? qr.reponse.trim() : '(pas de réponse donnée)');
  }).join('\n');
}

function ctFormaterListeRecommandationsEA(recommandations) {
  if (!recommandations || !recommandations.length) { return 'Aucune.'; }
  return recommandations.map(function (r) { return '- ' + (r.contenu || r); }).join('\n');
}

function ctConstruireValeursPlaceholdersEntretienAvance(dossier, diagnosticPrecedent, questionsReponses, recommandationsAppliquees, recommandationsNonAppliquees) {
  var resultatPrecedent = (diagnosticPrecedent && diagnosticPrecedent.resultat) || {};
  return {
    CV: dossier.cv,
    LETTRE: dossier.lettre,
    OFFRE_OU_NON_FOURNIE: ctFormaterValeurOptionnelleEA(dossier.offreEmploi),
    ENTREPRISE_OU_NON_FOURNIE: ctFormaterValeurOptionnelleEA(dossier.entrepriseCiblee),
    SITE_ENTREPRISE_OU_NON_FOURNI: ctFormaterValeurOptionnelleEA(dossier.siteEntreprise),
    TYPE_STRUCTURE_OU_NON_FOURNI: ctFormaterValeurOptionnelleEA(dossier.typeStructure),
    SYNTHESE_ANALYSE_PRECEDENTE: ctFormaterValeurOptionnelleEA(resultatPrecedent.syntheseGenerale),
    QUESTIONS_REPONSES_PERSONNE: ctFormaterQuestionsReponsesEA(questionsReponses),
    RECOMMANDATIONS_APPLIQUEES_OU_AUCUNE: ctFormaterListeRecommandationsEA(recommandationsAppliquees),
    RECOMMANDATIONS_NON_APPLIQUEES_OU_AUCUNE: ctFormaterListeRecommandationsEA(recommandationsNonAppliquees)
  };
}

function ctHorodatageParDefautEA_pb() {
  return new Date().toISOString();
}

// Retourne un PromptEntretienAvance { texte, dateGeneration }. Leve
// RelectureNonValidee (meme garde-fou que le 1er prompt -- defense en
// profondeur, ce dossier a deja ete valide pour generer le 1er
// diagnostic) ou PlaceholderNonResolu.
function ctConstruirePromptEntretienAvance(texteTemplate, dossier, diagnosticPrecedent, questionsReponses, recommandationsAppliquees, recommandationsNonAppliquees, dependances) {
  dependances = dependances || {};
  var maintenant = dependances.maintenant || ctHorodatageParDefautEA_pb;

  if (!dossier || dossier.confidentialiteValidee !== true) {
    throw ctCreerErreurMetier('RelectureNonValidee', 'Le DossierTransversal doit être validé (confidentialiteValidee: true) avant de construire ce prompt.', { dossierId: dossier && dossier.id });
  }

  var valeurs = ctConstruireValeursPlaceholdersEntretienAvance(dossier, diagnosticPrecedent, questionsReponses, recommandationsAppliquees, recommandationsNonAppliquees);
  var resolution = ctResoudrePlaceholders(texteTemplate, valeurs);

  if (resolution.placeholdersNonResolus.length > 0) {
    throw ctCreerErreurMetier('PlaceholderNonResolu', 'Placeholders non résolus : ' + resolution.placeholdersNonResolus.join(', '), { placeholders: resolution.placeholdersNonResolus });
  }

  return {
    texte: resolution.texte,
    dateGeneration: maintenant()
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctFormaterValeurOptionnelleEA: ctFormaterValeurOptionnelleEA,
    ctFormaterQuestionsReponsesEA: ctFormaterQuestionsReponsesEA,
    ctFormaterListeRecommandationsEA: ctFormaterListeRecommandationsEA,
    ctConstruireValeursPlaceholdersEntretienAvance: ctConstruireValeursPlaceholdersEntretienAvance,
    ctConstruirePromptEntretienAvance: ctConstruirePromptEntretienAvance
  };
}
