/* ============================================================
   modules/coherence-transversale/diagnostic/promptBuilder.js
   ------------------------------------------------------------
   Seule couche du module qui connait les noms reels des placeholders du
   prompt -- CV, LETTRE, OFFRE_OU_NON_FOURNIE, ENTREPRISE_OU_NON_FOURNIE,
   SITE_ENTREPRISE_OU_NON_FOURNI, TYPE_STRUCTURE_OU_NON_FOURNI,
   PREPARATION_ENTRETIEN_OU_NON_FOURNIE, CONSTATS_DETERMINISTES (voir
   prompts/coherence-transversale.md, section "Donnees a analyser"). Si
   ces noms changent, seule ctConstruireValeursPlaceholders() est
   concernee.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctTemplateLoaderPB = require('./promptTemplateLoader.js');
  var ctResoudrePlaceholders = _ctTemplateLoaderPB.ctResoudrePlaceholders;
  var _ctUtilPB = require('../modeles/utilitaires.js');
  var ctCreerErreurMetier = _ctUtilPB.ctCreerErreurMetier;
}

function ctFormaterValeurOptionnelle(valeur) {
  return valeur ? valeur : 'Non fournie.';
}

function ctFormaterConstatsDeterministes(constats) {
  if (!constats || constats.length === 0) { return 'Aucun constat déterministe disponible.'; }
  return constats.map(function (c) { return '- ' + c.message; }).join('\n');
}

function ctConstruireValeursPlaceholders(dossier, constatsDeterministes) {
  return {
    CV: dossier.cv,
    LETTRE: dossier.lettre,
    OFFRE_OU_NON_FOURNIE: ctFormaterValeurOptionnelle(dossier.offreEmploi),
    ENTREPRISE_OU_NON_FOURNIE: ctFormaterValeurOptionnelle(dossier.entrepriseCiblee),
    SITE_ENTREPRISE_OU_NON_FOURNI: ctFormaterValeurOptionnelle(dossier.siteEntreprise),
    TYPE_STRUCTURE_OU_NON_FOURNI: ctFormaterValeurOptionnelle(dossier.typeStructure),
    PREPARATION_ENTRETIEN_OU_NON_FOURNIE: ctFormaterValeurOptionnelle(dossier.preparationEntretien),
    CONSTATS_DETERMINISTES: ctFormaterConstatsDeterministes(constatsDeterministes),
    QUESTIONS_PERSONNE_OU_NON_FOURNIES: ctFormaterValeurOptionnelle(dossier.questionsPersonne)
  };
}

function ctHorodatageParDefaut_pb() {
  return new Date().toISOString();
}

// Retourne un PromptDiagnostic { texte, dateGeneration, hashContexteUtilise }.
// Leve RelectureNonValidee (verification independante -- second niveau de
// protection, meme principe que le Bilan) ou PlaceholderNonResolu.
function ctConstruirePromptDiagnostic(texteTemplate, dossier, constatsDeterministes, dependances) {
  dependances = dependances || {};
  var maintenant = dependances.maintenant || ctHorodatageParDefaut_pb;

  if (!dossier || dossier.confidentialiteValidee !== true) {
    throw ctCreerErreurMetier('RelectureNonValidee', 'Le DossierTransversal doit être validé (confidentialiteValidee: true) avant de construire un prompt.', { dossierId: dossier && dossier.id });
  }

  var valeurs = ctConstruireValeursPlaceholders(dossier, constatsDeterministes);
  var resolution = ctResoudrePlaceholders(texteTemplate, valeurs);

  if (resolution.placeholdersNonResolus.length > 0) {
    throw ctCreerErreurMetier('PlaceholderNonResolu', 'Placeholders non résolus : ' + resolution.placeholdersNonResolus.join(', '), { placeholders: resolution.placeholdersNonResolus });
  }

  return {
    texte: resolution.texte,
    dateGeneration: maintenant(),
    hashContexteUtilise: dossier.hashContenu
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctFormaterValeurOptionnelle: ctFormaterValeurOptionnelle,
    ctFormaterConstatsDeterministes: ctFormaterConstatsDeterministes,
    ctConstruireValeursPlaceholders: ctConstruireValeursPlaceholders,
    ctConstruirePromptDiagnostic: ctConstruirePromptDiagnostic
  };
}
