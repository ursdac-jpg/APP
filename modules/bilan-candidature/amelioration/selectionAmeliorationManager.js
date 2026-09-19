/* ============================================================
   modules/bilan-candidature/amelioration/selectionAmeliorationManager.js
   ------------------------------------------------------------
   Construit une DemandeAmelioration a partir d'un Diagnostic COMPLET
   (pas seulement DiagnosticResultat -- correction de contrat validee le
   2026-08-08, voir docs/ARCHITECTURE_PROMPT2_BILAN_CANDIDATURE.md) et
   d'un id de recommandation selectionnee.

   Reutilise integralement modeles/demandeAmelioration.js pour la copie
   profonde (bilanCreerDemandeAmelioration) -- aucune logique de copie
   reecrite ici.

   Relation 1:1 assumee (voir architecture du Prompt 2) : un appel = une
   recommandation. Pour plusieurs recommandations, l'appelant (core/
   moduleOrchestrator.js, pas encore ecrit) appelle cette fonction
   plusieurs fois -- jamais une boucle interne ici.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanDA_SAM = require('../modeles/demandeAmelioration.js');
  var bilanCreerDemandeAmelioration = _bilanDA_SAM.bilanCreerDemandeAmelioration;
  var bilanValiderDemandeAmelioration = _bilanDA_SAM.bilanValiderDemandeAmelioration;
  var _bilanUtil_SAM = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtil_SAM.bilanCreerErreurMetier;
}

// Rassemble en un seul tableau les deux sources d'Observation d'un
// Diagnostic : factuelles (contexteAnalyse.observations, jamais
// dupliquees dans resultat) et argumentees (resultat.axes[].observationsArgumentees).
// POINT DE VIGILANCE (decouvert en construisant cette couche, 2026-08-08) :
// diagnosticResponseParser.js garantit qu'une Recommandation a au moins
// un id dans observationsLiees (invariant "jamais orpheline"), mais ne
// garantit PAS que chacun de ces id correspond reellement a une
// Observation existante -- ce n'etait pas dans son perimetre de
// validation. bilanResoudreObservations() ci-dessous traite donc ce cas
// comme une possibilite reelle, jamais une certitude : voir
// idsIntrouvables.
function bilanRassemblerToutesLesObservations(diagnostic) {
  var factuelles = (diagnostic.contexteAnalyse && diagnostic.contexteAnalyse.observations) || [];
  var argumentees = [];
  var axes = (diagnostic.resultat && diagnostic.resultat.axes) || [];
  axes.forEach(function (axe) {
    argumentees = argumentees.concat(axe.observationsArgumentees || []);
  });
  return factuelles.concat(argumentees);
}

function bilanResoudreObservations(diagnostic, idsObservations) {
  var toutes = bilanRassemblerToutesLesObservations(diagnostic);
  var parId = {};
  toutes.forEach(function (obs) { parId[obs.id] = obs; });

  var observations = [];
  var idsIntrouvables = [];
  (idsObservations || []).forEach(function (id) {
    if (parId[id]) { observations.push(parId[id]); } else { idsIntrouvables.push(id); }
  });
  return { observations: observations, idsIntrouvables: idsIntrouvables };
}

// Retourne une DemandeAmelioration. Leve RecommandationInexistante si le
// diagnostic n'est pas complet, ou si aucune recommandation ne
// correspond a idRecommandation, ou si AUCUNE de ses observations liees
// ne se resout (recommandation orpheline en pratique, meme si valide en
// forme) -- une resolution PARTIELLE, elle, n'est jamais bloquante : on
// transmet ce qui existe reellement plutot que de tout rejeter.
function bilanConstruireDemandeAmelioration(diagnostic, idRecommandation, objectifs, dependances) {
  dependances = dependances || {};
  var maintenant = dependances.maintenant || function () { return new Date().toISOString(); };

  if (!diagnostic || diagnostic.statut !== 'complete' || !diagnostic.resultat) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'Aucun diagnostic complet fourni : aucune recommandation n\'est disponible.', { diagnosticId: diagnostic && diagnostic.id, statut: diagnostic && diagnostic.statut });
  }

  var recommandation = (diagnostic.resultat.recommandations || []).filter(function (r) { return r.id === idRecommandation; })[0];
  if (!recommandation) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'Aucune recommandation avec cet id dans ce diagnostic.', { idRecommandation: idRecommandation });
  }

  var resolution = bilanResoudreObservations(diagnostic, recommandation.observationsLiees);
  if (resolution.observations.length === 0) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'Aucune des observations liées à cette recommandation n\'a pu être résolue.', { idRecommandation: idRecommandation, idsIntrouvables: resolution.idsIntrouvables });
  }

  var demande = bilanCreerDemandeAmelioration({
    diagnosticSourceId: diagnostic.id,
    recommandationSelectionnee: recommandation,
    observationsResolues: resolution.observations,
    objectifs: objectifs || [],
    dateCreation: maintenant()
  });

  bilanValiderDemandeAmelioration(demande);

  return demande;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanRassemblerToutesLesObservations: bilanRassemblerToutesLesObservations,
    bilanResoudreObservations: bilanResoudreObservations,
    bilanConstruireDemandeAmelioration: bilanConstruireDemandeAmelioration
  };
}
