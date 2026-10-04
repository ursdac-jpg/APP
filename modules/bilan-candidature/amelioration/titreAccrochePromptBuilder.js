/* ============================================================
   modules/bilan-candidature/amelioration/titreAccrochePromptBuilder.js
   ------------------------------------------------------------
   TACHE (chantier "titre et accroche du CV", 2026-08-25, conception
   validee avec Denis) : construit le prompt du fichier
   prompts/bilan-titre-accroche.md a partir du contexte disponible.

   Delibrement SEPARE de amelioration/ameliorationPromptBuilder.js :
   celui-ci ameliore TOUJOURS une recommandation deja identifiee par le
   diagnostic (DemandeAmelioration/RecommandationSelectionnee, voir
   modeles/demandeAmelioration.js) -- l'absence de titre/accroche n'est
   PAS une recommandation du diagnostic (detection deterministe, jamais
   soumise a l’assistant, voir memoire de session) : forcer ce besoin dans le
   moule DemandeAmelioration aurait demande d'inventer une fausse
   recommandation, plus complexe et moins honnete qu'un prompt dedie.

   contexte : { cv, metierVise, offreEmploi } -- memes champs que
   Candidature (modeles/candidature.js), transmis tels quels par
   l'appelant (moduleOrchestrator.js), jamais relus depuis le store ici
   (fonction pure, meme discipline que ameliorationPromptBuilder.js).
   ============================================================ */

function _bilanValeurOuNonFournieTAPB(valeur) {
  return (valeur && String(valeur).trim()) ? String(valeur).trim() : 'Non fourni.';
}

// Genre du candidat (retour Denis 2026-10-01) : le titre et l'accroche doivent etre accordes a la personne. Source unique : modules/cv-core/genreCandidat.js
// (global navigateur) ; absente (tests Node) : aucune consigne ajoutee.
function _bilanConsigneGenreTAPB() {
  try { return (typeof consigneGenreCandidat === 'function') ? '\n\n' + consigneGenreCandidat() : ''; } catch (e) { return ''; }
}

// Retourne { texte, dateGeneration } -- meme forme que
// bilanConstruirePromptAmelioration()/bilanConstruirePromptAmeliorationLot(),
// jamais une forme differente pour ce seul prompt.
function bilanConstruirePromptTitreAccroche(texteTemplate, contexte, horodatage) {
  contexte = contexte || {};
  var maintenant = (typeof horodatage === 'function') ? horodatage : function () { return new Date().toISOString(); };

  var texte = texteTemplate
    .replace('{METIER_VISE_OU_NON_FOURNI}', _bilanValeurOuNonFournieTAPB(contexte.metierVise))
    .replace('{OFFRE_EMPLOI_OU_NON_FOURNIE}', _bilanValeurOuNonFournieTAPB(contexte.offreEmploi))
    .replace('{CV_TEXTE}', function () { return (contexte.cv && String(contexte.cv).trim()) || 'Non fourni.'; })
    // Fragment commun « voix humaine » (prompts/_voix-humaine.md), charge par js/app.js ; absent (tests, chargement en echec) : le repere disparait.
    .replace('{VOIX_HUMAINE}', function () { return ((typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges['voix-humaine']) || '') + _bilanConsigneGenreTAPB(); });

  return { texte: texte, dateGeneration: maintenant() };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanConstruirePromptTitreAccroche: bilanConstruirePromptTitreAccroche
  };
}
