/* ============================================================
   modules/coherence-transversale/modeles/dossierTransversal.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet DossierTransversal
   (CONTRATS.md, section 1) -- equivalent du Candidature du Bilan, mais
   avec ses propres regles : cv ET lettre obligatoires (invariant 1),
   jamais l'offre (mode "candidature spontanee" explicitement voulu).
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilDossier = require('./utilitaires.js');
  var ctGenererId = _ctUtilDossier.ctGenererId;
  var ctCalculerHashContenu = _ctUtilDossier.ctCalculerHashContenu;
  var ctCreerErreurMetier = _ctUtilDossier.ctCreerErreurMetier;
}

function ctCreerDossierTransversal(donnees) {
  donnees = donnees || {};
  var dossier = {
    id: donnees.id || ctGenererId('dossier'),
    cv: donnees.cv || '',
    lettre: donnees.lettre || '',
    offreEmploi: donnees.offreEmploi || null,
    entrepriseCiblee: donnees.entrepriseCiblee || null,
    siteEntreprise: donnees.siteEntreprise || null,
    preparationEntretien: donnees.preparationEntretien || null,
    // TACHE (carte "Votre candidature" du tableau de bord, 2026-08-25,
    // DECISION DE DENIS) : reutilise BILAN_TYPES_STRUCTURE (data/metiers.js,
    // 10 types deja utilises par le Bilan) -- jamais une nouvelle liste.
    // Toujours saisie libre (jamais auto-lue depuis l'app), meme principe
    // que questionsPersonne.
    typeStructure: donnees.typeStructure || null,
    // TACHE (chantier "Coherence transversale", 2026-08-25, DECISION DE
    // DENIS) : questions concretes de la personne sur sa candidature
    // ("est-ce que j'ai assez insiste sur...", "aurais-je du mettre plus
    // d'ambition..."), facultatif -- si absent, l'analyse se deroule
    // exactement comme avant (aucun changement de comportement). Si
    // present, chaque question doit recevoir une reponse explicite (voir
    // prompts/coherence-transversale.md). Texte libre, une question par
    // ligne ou en continu -- jamais un tableau structure, meme principe
    // que lettre/preparationEntretien.
    questionsPersonne: donnees.questionsPersonne || null,
    // A l'usage exclusif de analyse/verificationsDeterministes.js (jamais
    // envoyee telle quelle a l'IA, deja incluse dans le CV lui-meme si
    // pertinente) -- voir collecte/hostDataAdapter.js pour son origine.
    accrocheCv: donnees.accrocheCv || null,
    dateCreation: donnees.dateCreation || new Date().toISOString(),
    confidentialiteValidee: false
  };
  dossier.hashContenu = ctCalculerHashContenu([
    dossier.cv, dossier.lettre, dossier.offreEmploi, dossier.entrepriseCiblee,
    dossier.siteEntreprise, dossier.preparationEntretien, dossier.questionsPersonne
  ]);
  return dossier;
}

// Invariant 1 (CONTRATS.md) : cv ET lettre non vides, seule condition de
// validite -- tout le reste (offre, entreprise, entretien) reste optionnel.
function ctDossierTransversalEstValide(dossier) {
  return !!(dossier && dossier.cv && dossier.cv.trim() && dossier.lettre && dossier.lettre.trim());
}

function ctValiderDossierTransversal(dossier) {
  if (!ctDossierTransversalEstValide(dossier)) {
    throw ctCreerErreurMetier('DossierTransversalInvalide', 'Le CV et la lettre de motivation sont tous les deux obligatoires pour démarrer la Cohérence transversale.', { dossier: dossier });
  }
}

function ctMarquerConfidentialiteValidee(dossier, contenuValide) {
  dossier.confidentialiteValidee = true;
  if (typeof contenuValide === 'object' && contenuValide !== null) {
    if (typeof contenuValide.cv === 'string') { dossier.cv = contenuValide.cv; }
    if (typeof contenuValide.lettre === 'string') { dossier.lettre = contenuValide.lettre; }
    if (typeof contenuValide.preparationEntretien === 'string') { dossier.preparationEntretien = contenuValide.preparationEntretien; }
  }
  return dossier;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctCreerDossierTransversal: ctCreerDossierTransversal,
    ctDossierTransversalEstValide: ctDossierTransversalEstValide,
    ctValiderDossierTransversal: ctValiderDossierTransversal,
    ctMarquerConfidentialiteValidee: ctMarquerConfidentialiteValidee
  };
}
