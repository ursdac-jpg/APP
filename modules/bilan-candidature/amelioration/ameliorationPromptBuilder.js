/* ============================================================
   modules/bilan-candidature/amelioration/ameliorationPromptBuilder.js
   ------------------------------------------------------------
   Construit le texte du Prompt 2 a partir d'une DemandeAmelioration.
   Verifie avant d'ecrire quoi que ce soit : reutilise integralement
   bilanResoudrePlaceholders (diagnostic/promptTemplateLoader.js, 100%
   generique, aucune modification necessaire) et
   bilanFormaterValeurOptionnelle / bilanFormaterObservationsDeterministes
   (diagnostic/diagnosticPromptBuilder.js) -- ce dernier nomme
   "deterministes" pour le Prompt 1, mais sa mecanique (liste a puces de
   .contenu) est generique ; reutilise tel quel plutot que duplique pour
   une simple difference de nom de variable.

   Meme separation qu'au Prompt 1 : ce fichier est le SEUL a connaitre
   les noms reels des placeholders du Prompt 2 (voir prompts/bilan-v2.md,
   section finale). promptTemplateLoader.js reste inchange.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanTemplateLoader_APB = require('../diagnostic/promptTemplateLoader.js');
  var bilanResoudrePlaceholders = _bilanTemplateLoader_APB.bilanResoudrePlaceholders;
  var _bilanDiagPB_APB = require('../diagnostic/diagnosticPromptBuilder.js');
  var bilanFormaterValeurOptionnelle = _bilanDiagPB_APB.bilanFormaterValeurOptionnelle;
  var bilanFormaterObservationsDeterministes = _bilanDiagPB_APB.bilanFormaterObservationsDeterministes;
  var bilanFormaterTypeStructure = _bilanDiagPB_APB.bilanFormaterTypeStructure;
  var _bilanUtil_APB = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtil_APB.bilanCreerErreurMetier;
  var _bilanNiveau_APB = require('../analyse/niveauAnalyseDetector.js');
  var bilanProfilRequiertPosturePrioritaire = _bilanNiveau_APB.bilanProfilRequiertPosturePrioritaire;
}

function bilanFormaterDimensionsLiees(dimensionsLiees) {
  return (dimensionsLiees && dimensionsLiees.length) ? dimensionsLiees.join(', ') : 'Non précisé.';
}

function bilanFormaterObjectifs(objectifs) {
  return (objectifs && objectifs.length) ? objectifs.join(' ; ') : 'Aucun objectif particulier exprimé.';
}

// TACHE (ciblage offre d'emploi, 2026-08-24, DECISION DE DENIS) : le
// Prompt 2 (formulations/corrections) n'exploitait jusqu'ici aucune
// information de contexte de candidature -- confirme par Denis comme un
// vrai manque, pas seulement le Prompt 1 (diagnostic) doit s'aligner sur
// l'offre/l'entreprise/la structure, les reformulations proposees aussi.
// Isole dans sa propre fonction (plutot qu'inline dans
// bilanConstruireValeursPlaceholdersAmelioration ci-dessous) car reutilise
// TEL QUEL par bilanConstruirePromptAmeliorationLot() pour l'en-tete du
// lot (le contexte de candidature est commun au lot entier, resolu une
// seule fois, jamais par recommandation -- voir plus bas). candidature
// facultatif (defaut {}) : memes 4 champs que
// bilanConstruireValeursPlaceholders() (diagnosticPromptBuilder.js),
// memes formateurs reutilises a l'identique -- jamais une 2e logique de
// formatage.
function bilanFormaterValeursCandidatureAmelioration(candidature) {
  candidature = candidature || {};
  return {
    OFFRE_EMPLOI_OU_NON_FOURNIE: bilanFormaterValeurOptionnelle(candidature.offreEmploi),
    ENTREPRISE_CIBLEE_OU_NON_FOURNIE: bilanFormaterValeurOptionnelle(candidature.entrepriseCiblee),
    SITE_ENTREPRISE_OU_NON_FOURNI: bilanFormaterValeurOptionnelle(candidature.siteEntreprise),
    TYPE_STRUCTURE_OU_NON_FOURNI: bilanFormaterTypeStructure(candidature),
    // TACHE (posture prioritaire pour profil reconversion/debutant,
    // 2026-08-24, DECISION DE DENIS) : le Prompt 2 n'a jamais besoin de
    // savoir si une recommandation est "prioritaire" (ca ne le regarde
    // pas, seul le Prompt 1 juge), mais il peut ecrire une meilleure
    // reformulation savoir-etre s'il sait que ce profil s'appuie
    // particulierement dessus -- meme principe deja applique a
    // entretien.md/lettre.md le meme jour.
    PROFIL_RECONVERSION_OU_DEBUTANT: bilanProfilRequiertPosturePrioritaire(candidature) ? 'Oui' : 'Non'
  };
}

function bilanConstruireValeursPlaceholdersAmelioration(demandeAmelioration, candidature) {
  var recommandation = demandeAmelioration.recommandationSelectionnee;
  var valeurs = {
    RECOMMANDATION_CONTENU: recommandation.contenu,
    RECOMMANDATION_DIMENSIONS: bilanFormaterDimensionsLiees(recommandation.dimensionsLiees),
    EXTRAIT_CONCERNE_OU_NON_FOURNI: bilanFormaterValeurOptionnelle(recommandation.extraitConcerne),
    OBSERVATIONS_RESOLUES: bilanFormaterObservationsDeterministes(demandeAmelioration.observationsResolues),
    OBJECTIFS_OU_NON_FOURNIS: bilanFormaterObjectifs(demandeAmelioration.objectifs)
  };
  var valeursCandidature = bilanFormaterValeursCandidatureAmelioration(candidature);
  for (var cle in valeursCandidature) { valeurs[cle] = valeursCandidature[cle]; }
  return valeurs;
}

function bilanHorodatageParDefaut_apb() {
  return new Date().toISOString();
}

// Retourne { texte, demandeAmeliorationId, dateGeneration } -- meme
// forme minimale (pas de champ "id") que bilanConstruirePromptDiagnostic,
// pour rester coherent avec ce precedent deja etabli plutot que de
// suivre a la lettre l'esquisse plus ancienne de CONTRATS.md.
// candidature : parametre ajoute EN DERNIER (2026-08-24), facultatif,
// pour ne casser aucun appelant existant qui passait encore
// (texteTemplate, demandeAmelioration, dependances) -- voir
// bilanConstruireValeursPlaceholdersAmelioration() ci-dessus.
function bilanConstruirePromptAmelioration(texteTemplate, demandeAmelioration, dependances, candidature) {
  dependances = dependances || {};
  var maintenant = dependances.maintenant || bilanHorodatageParDefaut_apb;

  if (!demandeAmelioration || !demandeAmelioration.recommandationSelectionnee) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'Aucune DemandeAmelioration valide fournie.', {});
  }

  var valeurs = bilanConstruireValeursPlaceholdersAmelioration(demandeAmelioration, candidature);
  var resolution = bilanResoudrePlaceholders(texteTemplate, valeurs);

  if (resolution.placeholdersNonResolus.length > 0) {
    throw bilanCreerErreurMetier('PlaceholderNonResolu', 'Placeholders non résolus : ' + resolution.placeholdersNonResolus.join(', '), { placeholders: resolution.placeholdersNonResolus });
  }

  return {
    texte: resolution.texte,
    demandeAmeliorationId: demandeAmelioration.id,
    dateGeneration: maintenant()
  };
}

// TACHE (point 11, stabilisation Bilan, 2026-08-22, DECISION DE DENIS --
// evolution raisonnable du mecanisme 1:1 existant, jamais une refonte) :
// genere UN SEUL prompt pour PLUSIEURS DemandeAmelioration -- reutilise
// integralement bilanConstruireValeursPlaceholdersAmelioration() et
// bilanResoudrePlaceholders() ci-dessus (memes fonctions, aucune 2e
// logique de resolution de placeholder). Le template (prompts/bilan-v2-lot.md)
// porte un marqueur "## MODELE_BLOC_RECOMMANDATION" : tout ce qui suit ce
// marqueur est le modele d'UN bloc, repete une fois par DemandeAmelioration
// et injecte dans {BLOC_RECOMMANDATIONS} (seul placeholder de l'en-tete).
// bilanConstruireDemandeAmelioration() (selectionAmeliorationManager.js)
// anticipait deja explicitement cet appelant ("pour plusieurs
// recommandations, l'appelant... appelle cette fonction plusieurs fois --
// jamais une boucle interne ici") : cette fonction-ci EST cet appelant.
var BILAN_MARQUEUR_MODELE_BLOC_AMELIORATION = '## MODELE_BLOC_RECOMMANDATION';

// candidature : parametre ajoute EN DERNIER (2026-08-24), facultatif,
// meme raison que sur bilanConstruirePromptAmelioration() ci-dessus.
// Contrairement aux placeholders propres a chaque recommandation, le
// contexte de candidature (offre/entreprise/site/structure) est commun
// a tout le lot -- resolu UNE SEULE FOIS dans l'en-tete (prompts/
// bilan-v2-lot.md, avant le marqueur), jamais repete par bloc.
function bilanConstruirePromptAmeliorationLot(texteTemplate, demandesAmelioration, dependances, candidature) {
  dependances = dependances || {};
  var maintenant = dependances.maintenant || bilanHorodatageParDefaut_apb;

  if (!Array.isArray(demandesAmelioration) || !demandesAmelioration.length) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'Aucune DemandeAmelioration fournie pour le lot.', {});
  }

  var indexMarqueur = (texteTemplate || '').indexOf(BILAN_MARQUEUR_MODELE_BLOC_AMELIORATION);
  if (indexMarqueur === -1) {
    throw bilanCreerErreurMetier('PlaceholderNonResolu', 'Modèle de bloc recommandation introuvable dans le template du lot.', {});
  }
  var texteEnTete = texteTemplate.slice(0, indexMarqueur);
  var texteBloc = texteTemplate.slice(indexMarqueur + BILAN_MARQUEUR_MODELE_BLOC_AMELIORATION.length);

  var placeholdersNonResolusBlocs = [];
  var blocs = demandesAmelioration.map(function (demande, index) {
    if (!demande || !demande.recommandationSelectionnee) {
      throw bilanCreerErreurMetier('RecommandationInexistante', 'Une DemandeAmelioration du lot est invalide.', { index: index });
    }
    var valeursBloc = bilanConstruireValeursPlaceholdersAmelioration(demande);
    valeursBloc.RECOMMANDATION_INDEX = String(index + 1);
    // TACHE (correctif "suggestion pertinente par experience", Carte 3,
    // 2026-08-25) : demande.id (unique par construction, meme pour 2
    // demandes issues de la MEME recommandation -- voir modeles/
    // demandeAmelioration.js) plutot que l'id de la recommandation --
    // resout a la racine la collision qui se produisait quand une meme
    // recommandation etait appliquee a plusieurs experiences a la fois
    // (voir memoire de session). Comportement inchange en pratique pour
    // tout lot sans repetition : demande.id reste tout aussi unique.
    valeursBloc.RECOMMANDATION_ID = demande.id;
    // TACHE (meme correctif) : facultatif, uniquement renseigne par
    // l'appelant (js/app.js) pour un bloc issu du flux multi-experiences --
    // bilanFormaterValeurOptionnelle() retombe deja sur "Non fourni." si
    // absent, jamais une chaine vide silencieuse (meme discipline que les
    // 4 champs de contexte de candidature).
    valeursBloc.EXPERIENCE_CONCERNEE_OU_NON_FOURNIE = bilanFormaterValeurOptionnelle(demande.contexteDestination || null);
    var resolutionBloc = bilanResoudrePlaceholders(texteBloc, valeursBloc);
    placeholdersNonResolusBlocs = placeholdersNonResolusBlocs.concat(resolutionBloc.placeholdersNonResolus);
    return resolutionBloc.texte;
  }).join('\n---\n');

  if (placeholdersNonResolusBlocs.length > 0) {
    throw bilanCreerErreurMetier('PlaceholderNonResolu', 'Placeholders non résolus (bloc recommandation) : ' + placeholdersNonResolusBlocs.join(', '), { placeholders: placeholdersNonResolusBlocs });
  }

  var valeursEnTete = bilanFormaterValeursCandidatureAmelioration(candidature);
  valeursEnTete.BLOC_RECOMMANDATIONS = blocs;
  var resolutionEnTete = bilanResoudrePlaceholders(texteEnTete, valeursEnTete);
  if (resolutionEnTete.placeholdersNonResolus.length > 0) {
    throw bilanCreerErreurMetier('PlaceholderNonResolu', 'Placeholders non résolus : ' + resolutionEnTete.placeholdersNonResolus.join(', '), { placeholders: resolutionEnTete.placeholdersNonResolus });
  }

  return {
    texte: resolutionEnTete.texte,
    demandeAmeliorationIds: demandesAmelioration.map(function (d) { return d.id; }),
    dateGeneration: maintenant()
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanFormaterDimensionsLiees: bilanFormaterDimensionsLiees,
    bilanFormaterObjectifs: bilanFormaterObjectifs,
    bilanFormaterValeursCandidatureAmelioration: bilanFormaterValeursCandidatureAmelioration,
    bilanConstruireValeursPlaceholdersAmelioration: bilanConstruireValeursPlaceholdersAmelioration,
    bilanConstruirePromptAmelioration: bilanConstruirePromptAmelioration,
    bilanConstruirePromptAmeliorationLot: bilanConstruirePromptAmeliorationLot
  };
}
