/* ============================================================
   modules/coherence-transversale/collecte/dossierTransversalCollector.js
   ------------------------------------------------------------
   Assemble un DossierTransversal a partir de hostDataAdapter (donnees de
   l'app) + relectureConfidentialite (validation obligatoire avant que
   confidentialiteValidee ne passe a true). Meme structure que
   modules/bilan-candidature/collecte/contexteCandidatureCollector.js,
   sans en dependre.

   Ordre volontaire : la validation mecanique (cv + lettre non vides,
   invariant 1) a lieu AVANT d'ouvrir les ecrans de relecture -- inutile
   de faire relire des textes vides.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctHostAdapter = require('./hostDataAdapter.js');
  var ctLireDonneesBrutes = _ctHostAdapter.ctLireDonneesBrutes;
  var _ctRelecture = require('./relectureConfidentialite.js');
  var ctDemanderRelectureDossier = _ctRelecture.ctDemanderRelectureDossier;
  var _ctDossierModele = require('../modeles/dossierTransversal.js');
  var ctCreerDossierTransversal = _ctDossierModele.ctCreerDossierTransversal;
  var ctValiderDossierTransversal = _ctDossierModele.ctValiderDossierTransversal;
  var ctMarquerConfidentialiteValidee = _ctDossierModele.ctMarquerConfidentialiteValidee;
}

function ctHorodatageParDefaut() {
  return new Date().toISOString();
}

// saisieLibre : { cv, lettre, preparationEntretien, offreEmploi,
// entrepriseCiblee, siteEntreprise, questionsPersonne } -- cv/lettre/
// preparationEntretien issus du depot sequentiel (ui.js,
// obtenirOuDeposerTexteCV()/ctObtenirOuDeposerTexteLettre()/
// ctObtenirOuDeposerTexteEntretien()) si non deja presents dans l'app ;
// les 4 autres, meme principe que le Bilan (saisieLibre prioritaire,
// repli sur la donnee auto-detectee).
// dependances (toutes optionnelles, injectables pour les tests) :
//   lecteurs           -> transmis a ctLireDonneesBrutes
//   afficherEcran      -> transmis a ctDemanderRelectureDossier
//   dejaRelu           -> transmis a ctDemanderRelectureDossier (documents
//                         deja relus via ouvrirAssistantDepotCV(), jamais
//                         relus une 2e fois -- voir relectureConfidentialite.js)
//   maintenant         -> fonction () -> string ISO, pour dateCreation
// Retourne TOUJOURS une Promise<DossierTransversal> (confidentialiteValidee:
// true), jamais un throw synchrone.
function ctCollecterDossierTransversal(saisieLibre, dependances) {
  saisieLibre = saisieLibre || {};
  dependances = dependances || {};
  var maintenant = dependances.maintenant || ctHorodatageParDefaut;

  return Promise.resolve().then(function () {
    var brut = ctLireDonneesBrutes(dependances.lecteurs);
    var dossier = ctCreerDossierTransversal({
      cv: saisieLibre.cv || brut.cv,
      lettre: saisieLibre.lettre || brut.lettre,
      offreEmploi: saisieLibre.offreEmploi || brut.texteOffre || null,
      entrepriseCiblee: saisieLibre.entrepriseCiblee || brut.entrepriseCiblee,
      siteEntreprise: saisieLibre.siteEntreprise || brut.siteEntreprise,
      preparationEntretien: saisieLibre.preparationEntretien || brut.preparationEntretien,
      questionsPersonne: saisieLibre.questionsPersonne || null,
      typeStructure: saisieLibre.typeStructure || null,
      accrocheCv: brut.accrocheCv,
      dateCreation: maintenant()
    });

    // La personne ne doit jamais voir un ecran de relecture pour un
    // dossier incomplet (invariant 1 : cv + lettre obligatoires).
    ctValiderDossierTransversal(dossier);

    return ctDemanderRelectureDossier(dossier, dependances.afficherEcran, dependances.dejaRelu).then(function (contenuValide) {
      ctMarquerConfidentialiteValidee(dossier, contenuValide);
      return dossier;
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctCollecterDossierTransversal: ctCollecterDossierTransversal
  };
}
