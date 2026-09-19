/* ============================================================
   modules/bilan-candidature/modeles/diagnosticResultat.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de DiagnosticResultat
   (CONTRATS.md, section 1) : contenu pur, sans identite propre, imbrique
   dans Diagnostic.resultat -- reprend exactement le schema de sortie du
   Prompt 1 V2 (prompts/bilan-v1.md). Inclut la forme du "resultat d'axe"
   (sous-structure, jamais un objet top-level independant).

   IMPORTANT (invariant 7, CONTRATS.md) : statutPreparation ne peut
   jamais valoir 'pret' si alertesPrioritaires contient au moins un
   element -- verifie mecaniquement ici (comparaison de deux champs deja
   presents), ce n'est pas une regle interpretative.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanEnumsDR = require('./enums.js');
  var BILAN_STATUT_PREPARATION = _bilanEnumsDR.BILAN_STATUT_PREPARATION;
  var BILAN_RESTITUTION_QUALITATIVE = _bilanEnumsDR.BILAN_RESTITUTION_QUALITATIVE;
  var BILAN_TYPE_ALERTE = _bilanEnumsDR.BILAN_TYPE_ALERTE;
  var bilanEnumEstValide = _bilanEnumsDR.bilanEnumEstValide;
  var _bilanUtilDR = require('./utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilDR.bilanCreerErreurMetier;
  var bilanGenererId = _bilanUtilDR.bilanGenererId;
}

// Sous-structure imbriquee dans DiagnosticResultat.axes[] -- pas un
// objet du domaine independant (voir CONTRATS.md, section "Axe").
// `attentes` : ajoute pendant le chantier "Carte de correspondance"
// (2026-08-19, docs/CHANTIER_CARTE_CORRESPONDANCE.md section 5) --
// generique (n'importe quel axe peut en porter), meme si seul l'axe
// `adequation` en produit reellement aujourd'hui (docs/CHANTIER_PROMPT1_ATTENTES.md,
// 1.2) ; liste vide par defaut, comme les autres listes de cette forme.
function bilanCreerResultatAxe(donnees) {
  donnees = donnees || {};
  return {
    axeId: donnees.axeId,
    restitutionQualitative: donnees.restitutionQualitative,
    observationsArgumentees: donnees.observationsArgumentees || [],
    pointsForts: donnees.pointsForts || [],
    pointsFaibles: donnees.pointsFaibles || [],
    incoherences: donnees.incoherences || [],
    risques: donnees.risques || [],
    attentes: donnees.attentes || []
  };
}

function bilanResultatAxeEstValide(resultatAxe) {
  if (!resultatAxe || !resultatAxe.axeId) { return false; }
  return bilanEnumEstValide(BILAN_RESTITUTION_QUALITATIVE, resultatAxe.restitutionQualitative);
}

// Sous-structure imbriquee dans DiagnosticResultat.alertesPrioritaires[]
// -- ajoutee pendant diagnostic/ (2026-08-08) pour la meme raison que
// bilanCreerResultatAxe : une forme partagee, plutot qu'un objet
// litteral construit a la main a chaque fois qu'une alerte est
// reconstruite (diagnosticResponseParser.js).
function bilanCreerAlertePrioritaire(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || bilanGenererId('alerte'),
    type: donnees.type,
    description: donnees.description || '',
    dimensionLiee: donnees.dimensionLiee || null
  };
}

function bilanAlertePrioritaireEstValide(alerte) {
  if (!alerte || !alerte.id || !alerte.description) { return false; }
  return bilanEnumEstValide(BILAN_TYPE_ALERTE, alerte.type);
}

function bilanCreerDiagnosticResultat(donnees) {
  donnees = donnees || {};
  return {
    metaDiagnostic: donnees.metaDiagnostic || { niveauAnalyse: null, dimensionsNonEvaluables: [] },
    alertesPrioritaires: donnees.alertesPrioritaires || [],
    syntheseGenerale: donnees.syntheseGenerale || { statutPreparation: null, resumeNarratif: '' },
    premiereImpression: donnees.premiereImpression || { texte: '' },
    ceQuiDonneEnvie: donnees.ceQuiDonneEnvie || { texte: '' },
    ceQuiPeutFreiner: donnees.ceQuiPeutFreiner || { texte: '' },
    axes: donnees.axes || [],
    recommandations: donnees.recommandations || [],
    planAction: donnees.planAction || [],
    syntheseProjectionRecruteur: donnees.syntheseProjectionRecruteur || { texte: '' }
  };
}

function bilanDiagnosticResultatEstValide(resultat) {
  if (!resultat || !resultat.syntheseGenerale) { return false; }
  var statut = resultat.syntheseGenerale.statutPreparation;
  if (!bilanEnumEstValide(BILAN_STATUT_PREPARATION, statut)) { return false; }
  // Invariant 7 : jamais 'pret' si une alerte non-compensable existe.
  if (statut === 'pret' && (resultat.alertesPrioritaires || []).length > 0) { return false; }
  var axes = resultat.axes || [];
  for (var i = 0; i < axes.length; i += 1) {
    if (!bilanResultatAxeEstValide(axes[i])) { return false; }
  }
  // planAction ne peut citer qu'un id present dans recommandations.
  var idsRecommandations = (resultat.recommandations || []).map(function (r) { return r.id; });
  var planAction = resultat.planAction || [];
  for (var j = 0; j < planAction.length; j += 1) {
    if (idsRecommandations.indexOf(planAction[j]) === -1) { return false; }
  }
  return true;
}

function bilanValiderDiagnosticResultat(resultat) {
  if (!bilanDiagnosticResultatEstValide(resultat)) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'DiagnosticResultat incoherent (statutPreparation, axe ou planAction invalide).', { resultat: resultat });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerResultatAxe: bilanCreerResultatAxe,
    bilanResultatAxeEstValide: bilanResultatAxeEstValide,
    bilanCreerAlertePrioritaire: bilanCreerAlertePrioritaire,
    bilanAlertePrioritaireEstValide: bilanAlertePrioritaireEstValide,
    bilanCreerDiagnosticResultat: bilanCreerDiagnosticResultat,
    bilanDiagnosticResultatEstValide: bilanDiagnosticResultatEstValide,
    bilanValiderDiagnosticResultat: bilanValiderDiagnosticResultat
  };
}
