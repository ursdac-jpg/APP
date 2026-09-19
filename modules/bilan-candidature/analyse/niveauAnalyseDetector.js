/* ============================================================
   modules/bilan-candidature/analyse/niveauAnalyseDetector.js
   ------------------------------------------------------------
   Determine le niveau d'analyse atteignable (1 a 4) a partir d'une
   Candidature deja validee (confidentialiteValidee: true). Seul endroit
   du module ou cette logique existe -- aucun autre composant ne doit
   retester "y a-t-il un metier vise ?" a sa maniere.

   Chaque niveau est defini par SA PROPRE donnee, pas cumulativement :
   une offre presente suffit pour le niveau 3 (elle porte deja
   implicitement le metier vise), independamment de metierVise.
   ============================================================ */

function bilanDeterminerNiveauAnalyse(candidature) {
  candidature = candidature || {};
  var aMetier = !!candidature.metierVise;
  var aOffre = !!candidature.offreEmploi;
  var aLettre = !!candidature.lettreMotivation;
  var aEntretien = !!candidature.preparationEntretien;

  if (aOffre && aLettre && aEntretien) {
    return { niveau: 4, donneesManquantes: [] };
  }
  if (aOffre) {
    var manquantesNiveau4 = [];
    if (!aLettre) { manquantesNiveau4.push('lettreMotivation'); }
    if (!aEntretien) { manquantesNiveau4.push('preparationEntretien'); }
    return { niveau: 3, donneesManquantes: manquantesNiveau4 };
  }
  if (aMetier) {
    return { niveau: 2, donneesManquantes: ['offreEmploi'] };
  }
  return { niveau: 1, donneesManquantes: ['metierVise'] };
}

// TACHE (posture prioritaire pour profil reconversion/debutant,
// 2026-08-24, DECISION DE DENIS) : determine si l'axe posture doit
// devenir prioritaire (voir prompts/bilan-v1.md) -- deux signaux
// deterministes, jamais devines par l’assistant (lecon de la fusion V3 :
// un signal cense declencher une vraie regle doit etre calcule et
// explicite, jamais laisse a l'inference). candidature.objectif : voir
// hostDataAdapter.js (dossier.objectif, deja rempli ailleurs dans
// l'app pour la population qui y est passee). nombreExperiencesProfessionnelles :
// 0 signifie premier emploi -- jamais les experiencesPerso, qui sont
// precisement la matiere sur laquelle ce profil s'appuierait.
function bilanProfilRequiertPosturePrioritaire(candidature) {
  candidature = candidature || {};
  return candidature.objectif === 'reconversion' || candidature.nombreExperiencesProfessionnelles === 0;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanDeterminerNiveauAnalyse: bilanDeterminerNiveauAnalyse,
    bilanProfilRequiertPosturePrioritaire: bilanProfilRequiertPosturePrioritaire
  };
}
