/* ============================================================
   modules/bilan-candidature/diagnostic/diagnosticPromptBuilder.js
   ------------------------------------------------------------
   Seule couche du module qui connait les noms reels des placeholders du
   Prompt 1 -- CV, NIVEAU_ANALYSE, METIER_VISE_OU_NON_FOURNI,
   OFFRE_EMPLOI_OU_NON_FOURNIE, ENTREPRISE_CIBLEE_OU_NON_FOURNIE,
   SITE_ENTREPRISE_OU_NON_FOURNI, TYPE_STRUCTURE_OU_NON_FOURNI,
   PROFIL_RECONVERSION_OU_DEBUTANT,
   OBSERVATIONS_DETERMINISTES, POINTS_DEJA_CONNUS_OU_NON_FOURNIS,
   ELEMENTS_DEJA_IDENTIFIES_OU_NON_FOURNIS (voir prompts/bilan-v1.md,
   section finale "Donnees de la candidature a analyser"). Si ces noms changent un
   jour, seule bilanConstruireValeursPlaceholders() est concernee,
   jamais promptTemplateLoader.js (qui ne connait aucun nom de
   placeholder).
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanTemplateLoaderPB = require('./promptTemplateLoader.js');
  var bilanResoudrePlaceholders = _bilanTemplateLoaderPB.bilanResoudrePlaceholders;
  var _bilanUtilPB = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilPB.bilanCreerErreurMetier;
  var _bilanNiveauPB = require('../analyse/niveauAnalyseDetector.js');
  var bilanProfilRequiertPosturePrioritaire = _bilanNiveauPB.bilanProfilRequiertPosturePrioritaire;
}

function bilanFormaterValeurOptionnelle(valeur) {
  return valeur ? valeur : 'Non fourni.';
}

function bilanFormaterObservationsDeterministes(observations) {
  if (!observations || observations.length === 0) { return 'Aucune observation déterministe disponible.'; }
  return observations.map(function (obs) { return '- ' + obs.contenu; }).join('\n');
}

// TACHE (ciblage offre d'emploi, 2026-08-24) : typeStructure vaut soit
// une des categories fixes (BILAN_TYPES_STRUCTURE, js/app.js), soit
// 'Autre' -- dans ce dernier cas, le texte utile pour le prompt est
// typeStructureAutre (saisi librement), jamais le mot generique 'Autre'.
function bilanFormaterTypeStructure(candidature) {
  if (!candidature.typeStructure) { return 'Non fourni.'; }
  if (candidature.typeStructure === 'Autre') {
    return candidature.typeStructureAutre ? candidature.typeStructureAutre : 'Autre (non précisé).';
  }
  return candidature.typeStructure;
}

function bilanConstruireValeursPlaceholders(candidature, contexteAnalyse) {
  return {
    NIVEAU_ANALYSE: String(contexteAnalyse.niveau),
    CV: candidature.cv,
    METIER_VISE_OU_NON_FOURNI: bilanFormaterValeurOptionnelle(candidature.metierVise),
    OFFRE_EMPLOI_OU_NON_FOURNIE: bilanFormaterValeurOptionnelle(candidature.offreEmploi),
    ENTREPRISE_CIBLEE_OU_NON_FOURNIE: bilanFormaterValeurOptionnelle(candidature.entrepriseCiblee),
    SITE_ENTREPRISE_OU_NON_FOURNI: bilanFormaterValeurOptionnelle(candidature.siteEntreprise),
    TYPE_STRUCTURE_OU_NON_FOURNI: bilanFormaterTypeStructure(candidature),
    PROFIL_RECONVERSION_OU_DEBUTANT: bilanProfilRequiertPosturePrioritaire(candidature) ? 'Oui' : 'Non',
    OBSERVATIONS_DETERMINISTES: bilanFormaterObservationsDeterministes(contexteAnalyse.observations),
    // TACHE (chantier "ignorer un point du rapport", 2026-08-25, DECISION
    // DE DENIS) : recommandations que la personne a choisi de garder
    // ignorees lors d'une reanalyse -- deja formatees en texte par
    // l'appelant (app.js, bilanFormaterPointsDejaConnus()), jamais
    // recalcule ici (cette couche ne fait que resoudre des placeholders,
    // voir en-tete de fichier).
    POINTS_DEJA_CONNUS_OU_NON_FOURNIS: bilanFormaterValeurOptionnelle(candidature.pointsDejaConnus),
    // TACHE (transfert Coherence transversale -> Bilan, 2026-08-25,
    // DECISION DE DENIS) : bloc optionnel, jamais rempli hors d'un
    // transfert explicite depuis ce module separe (voir candidature.js) --
    // le Prompt 1 reste inchange pour tout usage normal du Bilan.
    ELEMENTS_DEJA_IDENTIFIES_OU_NON_FOURNIS: bilanFormaterValeurOptionnelle(candidature.elementsCoherenceTransversale)
  };
}

function bilanHorodatageParDefaut_pb() {
  return new Date().toISOString();
}

// Retourne un PromptDiagnostic { texte, niveau, dateGeneration,
// hashContexteUtilise }. Leve RelectureNonValidee (verification
// independante de moduleOrchestrator -- second niveau de protection,
// meme principe que pour collecte/) ou PlaceholderNonResolu.
function bilanConstruirePromptDiagnostic(texteTemplate, candidature, contexteAnalyse, dependances) {
  dependances = dependances || {};
  var maintenant = dependances.maintenant || bilanHorodatageParDefaut_pb;

  if (!candidature || candidature.confidentialiteValidee !== true) {
    throw bilanCreerErreurMetier('RelectureNonValidee', 'La Candidature doit être validée (confidentialiteValidee: true) avant de construire un prompt.', { candidatureId: candidature && candidature.id });
  }

  var valeurs = bilanConstruireValeursPlaceholders(candidature, contexteAnalyse);
  var resolution = bilanResoudrePlaceholders(texteTemplate, valeurs);

  if (resolution.placeholdersNonResolus.length > 0) {
    throw bilanCreerErreurMetier('PlaceholderNonResolu', 'Placeholders non résolus : ' + resolution.placeholdersNonResolus.join(', '), { placeholders: resolution.placeholdersNonResolus });
  }

  return {
    texte: resolution.texte,
    niveau: contexteAnalyse.niveau,
    dateGeneration: maintenant(),
    hashContexteUtilise: candidature.hashContenu
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanFormaterValeurOptionnelle: bilanFormaterValeurOptionnelle,
    bilanFormaterObservationsDeterministes: bilanFormaterObservationsDeterministes,
    bilanFormaterTypeStructure: bilanFormaterTypeStructure,
    bilanConstruireValeursPlaceholders: bilanConstruireValeursPlaceholders,
    bilanConstruirePromptDiagnostic: bilanConstruirePromptDiagnostic
  };
}
