/* ============================================================
   modules/bilan-candidature/modeles/candidature.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Candidature
   (CONTRATS.md, section 1). Validation strictement mecanique ici : cv
   non vide, types corrects -- jamais une regle interpretative du
   referentiel.

   IMPORTANT : confidentialiteValidee vaut toujours false a la creation.
   Seul modules/confidentialite/ (ServiceConfidentialite) est autorise a
   le faire passer a true, apres validation explicite de l'utilisateur.
   ============================================================ */

// Sous Node (tests), les dependances d'un autre fichier de modeles/ ne
// sont pas visibles sans require() explicite (chaque fichier est un
// module isole). Dans le navigateur, `require` n'existe pas : ce bloc ne
// s'execute pas, et les fonctions sont deja visibles depuis le scope
// global partage par les balises <script> (utilitaires.js charge avant
// candidature.js). Meme pattern repris dans tous les fichiers de
// modeles/ qui en ont besoin.
if (typeof require !== 'undefined') {
  var _bilanUtilCandidature = require('./utilitaires.js');
  var bilanCalculerHashContenu = _bilanUtilCandidature.bilanCalculerHashContenu;
  var bilanCreerErreurMetier = _bilanUtilCandidature.bilanCreerErreurMetier;
}

function bilanCreerCandidature(donnees) {
  donnees = donnees || {};
  var candidature = {
    id: donnees.id,
    cv: donnees.cv || '',
    metierVise: donnees.metierVise || null,
    offreEmploi: donnees.offreEmploi || null,
    entrepriseCiblee: donnees.entrepriseCiblee || null,
    // TACHE (ciblage offre d'emploi, 2026-08-24, demande de Denis) : 3
    // informations facultatives supplementaires, toutes "saisie libre"
    // (aucune source dans dossier -- voir contexteCandidatureCollector.js).
    // siteEntreprise : URL, consultee par le prompt de diagnostic quand
    // fournie (voir prompts/bilan-v1.md). typeStructure : une des 10
    // categories de BILAN_TYPES_STRUCTURE (js/app.js) ou 'Autre' ;
    // typeStructureAutre : texte libre, rempli uniquement si
    // typeStructure === 'Autre'.
    siteEntreprise: donnees.siteEntreprise || null,
    typeStructure: donnees.typeStructure || null,
    typeStructureAutre: donnees.typeStructureAutre || null,
    // TACHE (posture prioritaire pour profil reconversion/debutant,
    // 2026-08-24, DECISION DE DENIS) : objectif (dossier.objectif, deja
    // rempli ailleurs dans l'app -- voir hostDataAdapter.js) et
    // nombreExperiencesProfessionnelles (compte simple, jamais les
    // experiencesPerso) determinent si l'axe posture doit devenir
    // prioritaire dans le diagnostic (voir diagnosticPromptBuilder.js).
    // Jamais une saisie libre : les deux viennent toujours de l'app.
    objectif: donnees.objectif || null,
    nombreExperiencesProfessionnelles: donnees.nombreExperiencesProfessionnelles || 0,
    lettreMotivation: donnees.lettreMotivation || null,
    preparationEntretien: donnees.preparationEntretien || null,
    // TACHE (chantier "ignorer un point du rapport", 2026-08-25, DECISION
    // DE DENIS) : liste de recommandations que la personne a choisi de
    // garder ignorees au moment d'une reanalyse ("Analyser a nouveau") --
    // transmise au prochain Prompt 1 pour qu'il ne les resouleve pas sous
    // une autre formulation (voir diagnosticPromptBuilder.js). Jamais
    // rempli au premier depot (rien a deja connaitre) -- uniquement via
    // bilanMettreAJourPointsDejaConnusCandidature() (moduleOrchestrator.js),
    // juste avant une reanalyse.
    pointsDejaConnus: donnees.pointsDejaConnus || null,
    // TACHE (transfert Coherence transversale -> Bilan, 2026-08-25,
    // DECISION DE DENIS) : constats/recommandations visant le CV deja
    // identifies par Coherence transversale (module separe), transmis en
    // texte libre au Prompt 1 -- champ additif (contrat CONTRATS.md),
    // jamais rempli hors de ce transfert explicite.
    elementsCoherenceTransversale: donnees.elementsCoherenceTransversale || null,
    dateCreation: donnees.dateCreation,
    confidentialiteValidee: false
  };
  candidature.hashContenu = bilanCalculerHashContenu([
    candidature.cv, candidature.metierVise, candidature.offreEmploi,
    candidature.entrepriseCiblee, candidature.siteEntreprise, candidature.typeStructure,
    candidature.typeStructureAutre, candidature.objectif, candidature.nombreExperiencesProfessionnelles,
    candidature.lettreMotivation, candidature.preparationEntretien, candidature.pointsDejaConnus,
    candidature.elementsCoherenceTransversale
  ]);
  return candidature;
}

// Seule condition de validite (CONTRATS.md) : cv non vide. Tout le reste
// peut etre absent.
function bilanCandidatureEstValide(candidature) {
  return !!(candidature && typeof candidature.cv === 'string' && candidature.cv.trim().length > 0);
}

function bilanValiderCandidature(candidature) {
  if (!bilanCandidatureEstValide(candidature)) {
    throw bilanCreerErreurMetier('CandidatureInvalide', 'Le CV est absent ou vide.', { candidatureId: candidature && candidature.id });
  }
}

// Recalcule hashContenu apres une modification (ex. relecture de
// confidentialite qui change candidature.cv) -- jamais recalcule a la
// main ailleurs dans le module.
function bilanRecalculerHashCandidature(candidature) {
  candidature.hashContenu = bilanCalculerHashContenu([
    candidature.cv, candidature.metierVise, candidature.offreEmploi,
    candidature.entrepriseCiblee, candidature.siteEntreprise, candidature.typeStructure,
    candidature.typeStructureAutre, candidature.objectif, candidature.nombreExperiencesProfessionnelles,
    candidature.lettreMotivation, candidature.preparationEntretien, candidature.pointsDejaConnus,
    candidature.elementsCoherenceTransversale
  ]);
  return candidature.hashContenu;
}

// Candidature.confidentialiteValidee ne devient true qu'ici -- point de
// passage unique, appele exclusivement apres resolution de
// ServiceConfidentialite.demanderRelecture() (voir moduleOrchestrator,
// couche core/, pas encore ecrite).
function bilanMarquerConfidentialiteValidee(candidature, contenuValide) {
  candidature.cv = contenuValide;
  bilanRecalculerHashCandidature(candidature);
  candidature.confidentialiteValidee = true;
  return candidature;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerCandidature: bilanCreerCandidature,
    bilanCandidatureEstValide: bilanCandidatureEstValide,
    bilanValiderCandidature: bilanValiderCandidature,
    bilanRecalculerHashCandidature: bilanRecalculerHashCandidature,
    bilanMarquerConfidentialiteValidee: bilanMarquerConfidentialiteValidee
  };
}
