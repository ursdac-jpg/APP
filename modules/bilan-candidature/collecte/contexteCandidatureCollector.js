/* ============================================================
   modules/bilan-candidature/collecte/contexteCandidatureCollector.js
   ------------------------------------------------------------
   Assemble une Candidature a partir de hostDataAdapter (donnees de
   l'app) + saisie libre (offreEmploi/entrepriseCiblee/siteEntreprise/
   typeStructure/typeStructureAutre -- voir hostDataAdapter.js pour ce
   qui vient reellement de l'app) + relectureConfidentialite (validation
   obligatoire avant que confidentialiteValidee ne passe a true).

   Ordre volontaire : la validation mecanique (cv non vide) a lieu AVANT
   d'ouvrir l'ecran de relecture -- inutile de faire relire un texte vide
   a la personne. TACHE (ciblage offre d'emploi, 2026-08-24) :
   offreEmploi/entrepriseCiblee/siteEntreprise/typeStructure sont
   desormais exploites par diagnosticPromptBuilder.js et
   ameliorationPromptBuilder.js -- ne plus les considerer comme de
   simples champs transportes.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanHostAdapter = require('./hostDataAdapter.js');
  var bilanLireDonneesBrutesCandidat = _bilanHostAdapter.bilanLireDonneesBrutesCandidat;
  var bilanLireDonneesStructureesAnalyse = _bilanHostAdapter.bilanLireDonneesStructureesAnalyse;
  var _bilanRelecture = require('./relectureConfidentialite.js');
  var bilanDemanderRelectureCv = _bilanRelecture.bilanDemanderRelectureCv;
  var _bilanCandidatureModele = require('../modeles/candidature.js');
  var bilanCreerCandidature = _bilanCandidatureModele.bilanCreerCandidature;
  var bilanValiderCandidature = _bilanCandidatureModele.bilanValiderCandidature;
  var bilanMarquerConfidentialiteValidee = _bilanCandidatureModele.bilanMarquerConfidentialiteValidee;
}

function bilanHorodatageParDefaut() {
  return new Date().toISOString();
}

// Passe-plat delibere vers hostDataAdapter.bilanLireDonneesStructureesAnalyse()
// (experiencesDates -- a l'usage exclusif de analyse/faitsExtractor.js).
// Ajoute pendant core/ (2026-08-08) : sans cette fonction, moduleOrchestrator
// aurait du appeler hostDataAdapter directement, seul point de couplage
// documente avec l'app hote devant rester confine a collecte/. Ne contient
// aucune logique propre -- uniquement le maintien de cette frontiere.
function bilanCollecterDonneesStructureesAnalyse(lecteurs) {
  return bilanLireDonneesStructureesAnalyse(lecteurs);
}

// saisieLibre : { offreEmploi, entrepriseCiblee, siteEntreprise,
// typeStructure, typeStructureAutre } -- donnees de ce module qui ne
// viennent jamais de l'app hote (voir hostDataAdapter.js), sauf
// entrepriseCiblee qui peut aussi venir de brut.entrepriseCiblee (deja
// renseignee ailleurs dans l'app) -- saisieLibre.entrepriseCiblee est
// alors prioritaire (la personne peut la confirmer/corriger sur cet
// ecran, voir ecran de ciblage offre d'emploi, data/metiers.js).
// dependances (toutes optionnelles, injectables pour les tests) :
//   lecteurs              -> transmis a bilanLireDonneesBrutesCandidat
//   afficherEcranRelecture -> transmis a bilanDemanderRelectureCv
//   cvDejaRelu             -> transmis a bilanDemanderRelectureCv (RC-02 --
//                             texte deja relu ailleurs, ex. depot leger)
//   maintenant            -> fonction () -> string ISO, pour dateCreation
// Retourne TOUJOURS une Promise<Candidature> (confidentialiteValidee:
// true) -- y compris pour la validation mecanique (CandidatureInvalide),
// jamais un throw synchrone. Une fonction consommee via .then()/.catch()
// ne doit jamais melanger rejet asynchrone et exception synchrone : un
// appelant qui ne fait que .catch() manquerait sinon cette erreur.
function bilanCollecterCandidature(saisieLibre, dependances) {
  saisieLibre = saisieLibre || {};
  dependances = dependances || {};
  var maintenant = dependances.maintenant || bilanHorodatageParDefaut;

  return Promise.resolve().then(function () {
    var brut = bilanLireDonneesBrutesCandidat(dependances.lecteurs);
    var candidature = bilanCreerCandidature({
      cv: brut.cv,
      metierVise: brut.metierVise,
      // TACHE (transfert Coherence transversale -> Bilan, 2026-08-25,
      // DECISION DE DENIS) : repli sur brut.offreEmploi (memorise app-wide
      // par Coherence transversale) -- meme principe que siteEntreprise
      // juste en dessous, la personne peut confirmer/corriger sur l'ecran
      // de ciblage avant tout envoi.
      offreEmploi: saisieLibre.offreEmploi || brut.offreEmploi || null,
      entrepriseCiblee: saisieLibre.entrepriseCiblee || brut.entrepriseCiblee,
      // TACHE (chantier "Coherence transversale CV/lettre/entretien",
      // 2026-08-25) : repli sur brut.siteEntreprise (siteCibleActuel(),
      // deja saisi ailleurs dans l'app) desormais possible depuis que
      // hostDataAdapter l'expose -- meme principe que entrepriseCiblee
      // juste au-dessus, la personne peut confirmer/corriger sur cet ecran.
      siteEntreprise: saisieLibre.siteEntreprise || brut.siteEntreprise || null,
      typeStructure: saisieLibre.typeStructure || brut.typeStructure || null,
      objectif: brut.objectif,
      nombreExperiencesProfessionnelles: brut.nombreExperiencesProfessionnelles,
      typeStructureAutre: saisieLibre.typeStructureAutre || null,
      // TACHE (transfert Coherence transversale -> Bilan, 2026-08-25,
      // DECISION DE DENIS) : constats/recommandations deja identifies par
      // le module Coherence transversale, transmis en texte libre --
      // toujours saisieLibre (jamais lu depuis brut/hostDataAdapter, un
      // seul point d'entree possible : le transfert explicite au moment
      // de "Corriger dans le Bilan", voir ui.js du module et
      // demarrerBilanCandidatureAvecDepot(), data/metiers.js).
      elementsCoherenceTransversale: saisieLibre.elementsCoherenceTransversale || null,
      dateCreation: maintenant()
    });

    // La personne ne doit jamais voir un ecran de relecture pour un CV
    // vide -- verifie avant toute ouverture d'ecran, mais reste dans la
    // meme chaine de Promise que le reste.
    bilanValiderCandidature(candidature);

    return bilanDemanderRelectureCv(candidature.cv, dependances.afficherEcranRelecture, dependances.cvDejaRelu).then(function (resultat) {
      bilanMarquerConfidentialiteValidee(candidature, resultat.contenuValide);
      return candidature;
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCollecterCandidature: bilanCollecterCandidature,
    bilanCollecterDonneesStructureesAnalyse: bilanCollecterDonneesStructureesAnalyse
  };
}
