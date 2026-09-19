/* ============================================================
   modules/bilan-candidature/modeles/propositionAmelioration.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de PropositionAmelioration
   (CONTRATS.md, section 1) : sortie du Prompt 2, rattachee a exactement
   une DemandeAmelioration et, via elle, a exactement une Recommandation.

   CORRECTION (2026-08-08, amelioration/) : actionsConcretes peut
   desormais etre vide. La regle initiale ("jamais vide", sur le modele
   de dimensionsLiees/observationsLiees de Recommandation) contredisait
   prompts/bilan-v2.md, ecrit et valide ensuite : "une liste vide est un
   resultat normal si rien de plus n'est utile a dire". Decision prise
   avec l'utilisateur avant de coder ameliorationResponseParser.js --
   forcer une action a chaque fois aurait pousse le modele a inventer du
   remplissage, contraire a la philosophie du module.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilPA = require('./utilitaires.js');
  var bilanGenererId = _bilanUtilPA.bilanGenererId;
  var bilanCreerErreurMetier = _bilanUtilPA.bilanCreerErreurMetier;
  var _bilanEnumsPA = require('./enums.js');
  var BILAN_ACTION_PROPOSITION = _bilanEnumsPA.BILAN_ACTION_PROPOSITION;
  var bilanEnumEstValide = _bilanEnumsPA.bilanEnumEstValide;
}

// TACHE (contrat Niveau 2, 2026-08-11, voir docs/ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md) :
// action reste null par defaut -- JAMAIS obligatoire, contrairement a
// proposition/justification. Sans objet pour une PropositionAmelioration
// issue d'un extraitConcerne present (Niveau 1, hors perimetre du Prompt 2) ;
// null egalement si l’assistant ne l'a pas fourni ou a fourni une valeur hors
// enumeration (voir amelioration/ameliorationResponseParser.js -- jamais un
// echec pour ce seul champ, meme discipline tolerante qu'actionsConcretes).
function bilanCreerPropositionAmelioration(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id || bilanGenererId('prop'),
    demandeAmeliorationId: donnees.demandeAmeliorationId,
    recommandationId: donnees.recommandationId,
    proposition: donnees.proposition || '',
    justification: donnees.justification || '',
    actionsConcretes: donnees.actionsConcretes || [],
    action: bilanEnumEstValide(BILAN_ACTION_PROPOSITION, donnees.action) ? donnees.action : null,
    // TACHE (correctif "suggestion pertinente par experience", Carte 3,
    // 2026-08-25) : true par defaut -- comportement inchange pour tout
    // appelant qui ne connait pas ce champ (1:1, hors-modalite, famille2,
    // Carte 2 -- une seule destination possible, jamais d'ambiguite de
    // pertinence). Seul le flux multi-experiences de la Carte 3 fournit
    // explicitement `false` (voir ameliorationResponseParser.js).
    pertinent: donnees.pertinent !== false
  };
}

function bilanPropositionAmeliorationEstValide(proposition) {
  if (!proposition || !proposition.id) { return false; }
  if (!proposition.demandeAmeliorationId || !proposition.recommandationId) { return false; }
  if (!proposition.proposition || !proposition.justification) { return false; }
  // actionsConcretes : tableau obligatoire (jamais null/undefined), mais
  // peut etre vide -- voir la correction en tete de fichier.
  if (!Array.isArray(proposition.actionsConcretes)) { return false; }
  // action : jamais obligatoire -- null est une valeur normale (voir
  // commentaire de bilanCreerPropositionAmelioration ci-dessus), pas une
  // erreur a rejeter ici.
  if (proposition.action !== null && !bilanEnumEstValide(BILAN_ACTION_PROPOSITION, proposition.action)) { return false; }
  return true;
}

function bilanValiderPropositionAmelioration(proposition) {
  if (!bilanPropositionAmeliorationEstValide(proposition)) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'PropositionAmelioration mal formee.', { proposition: proposition });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerPropositionAmelioration: bilanCreerPropositionAmelioration,
    bilanPropositionAmeliorationEstValide: bilanPropositionAmeliorationEstValide,
    bilanValiderPropositionAmelioration: bilanValiderPropositionAmelioration
  };
}
