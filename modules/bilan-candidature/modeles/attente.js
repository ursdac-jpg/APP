/* ============================================================
   modules/bilan-candidature/modeles/attente.js
   ------------------------------------------------------------
   Forme, creation et validation mecanique de l'objet Attente.
   Contrat de reference : docs/CHANTIER_CARTE_CORRESPONDANCE.md,
   section 5 -- pas CONTRATS.md, qui reste figee sans amendement pour ce
   chantier (l'ajout est une nouvelle sous-structure, jamais une
   modification d'un objet existant). Conception complete : doctrine
   (docs/DOCTRINE_CARTE_CORRESPONDANCE.md), evolution du Prompt 1
   (docs/CHANTIER_PROMPT1_ATTENTES.md).

   Sous-structure du resultat de l'axe `adequation` uniquement --
   aujourd'hui jamais utilisee pour un autre axe (docs/CHANTIER_PROMPT1_ATTENTES.md,
   1.2), meme si `axeLie` reste un champ generique plutot qu'une valeur
   figee en dur, pour rester reutilisable si un besoin reel apparait.

   4 champs seulement, deliberement minimal (audit d'architecture du
   2026-08-19) :
   - `id` et `axeLie` ne sont JAMAIS fournis par l’assistant -- generes ici a la
     reconstruction, meme principe deterministe que l'id d'une
     Observation argumentee (voir observation.js,
     bilanGenererIdObservationArgumentee).
   - `observationsLiees` contient des ids d'Observation DEJA RESOLUS --
     ce fichier ne resout jamais un texte en id lui-meme, cette
     responsabilite reste dans diagnostic/diagnosticResponseParser.js
     (voir docs/CHANTIER_PROMPT1_ATTENTES.md, 1.3, pour la regle de
     resolution texte -> id et son cas limite : deux observations au
     texte identique, premiere occurrence retenue).

   IMPORTANT (doctrine, principe 2) : aucune notion de competence ici,
   deliberement absente -- une competence est une interpretation
   dependante du contexte, jamais une donnee structurante. Ne jamais
   ajouter un tel champ sans rouvrir explicitement la doctrine.

   IMPORTANT (contrat, section 5 ; doctrine, principe 4) : l'etat de
   couverture n'est JAMAIS un champ de cet objet -- voir
   bilanAttenteEtatCouverture() plus bas, qui le derive a chaque appel
   depuis observationsLiees.length, pour ne jamais risquer une
   desynchronisation entre l'etat affiche et les observations reellement
   presentes.

   IMPORTANT (contrat, section 5) : aucune relation directe avec
   Recommandation, choix delibere -- ce module ne montre jamais le
   "quoi faire", seulement le raisonnement. Ne jamais ajouter un champ
   qui relierait une Attente a une Recommandation sans rouvrir le
   contrat explicitement.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilAttente = require('./utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilAttente.bilanCreerErreurMetier;
}

// axeId : identifiant de l'axe (Axe.id) auquel appartient cette attente
// -- aujourd'hui toujours 'adequation', jamais fourni par l’assistant. index :
// position de l'attente dans son axe (0, 1, 2...), utilisee pour
// generer un id deterministe si aucun n'est fourni.
// Deterministe : meme axeId + meme index => meme id, a chaque parsing --
// meme principe que bilanGenererIdObservationArgumentee() (observation.js).
function bilanGenererIdAttente(axeId, index) {
  return (axeId || 'axe-inconnu') + '-attente-' + (typeof index === 'number' ? index : 0);
}

function bilanCreerAttente(donnees, index) {
  donnees = donnees || {};
  var axeId = donnees.axeLie;
  return {
    id: donnees.id || bilanGenererIdAttente(axeId, index),
    contenu: donnees.contenu || '',
    axeLie: axeId,
    observationsLiees: donnees.observationsLiees || []
  };
}

function bilanAttenteEstValide(attente) {
  if (!attente || !attente.id || !attente.contenu) { return false; }
  if (!attente.axeLie) { return false; }
  if (!Array.isArray(attente.observationsLiees)) { return false; }
  return true;
}

function bilanValiderAttente(attente) {
  if (!bilanAttenteEstValide(attente)) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'Attente mal formee (contenu ou axeLie manquant).', { attente: attente });
  }
}

// Etat de couverture -- TOUJOURS derive, jamais stocke sur l'objet
// (voir en-tete de fichier). Fonction pure : ne lit que
// attente.observationsLiees, aucun etat externe, aucun jugement --
// uniquement un compte (doctrine, principe 4 : "des etats a decrire,
// jamais a noter"). Seule source de verite pour ce vocabulaire a 3
// valeurs ('aucun'/'un'/'plusieurs') -- l'affichage (js/app.js) lit ce
// que cette fonction retourne, jamais une copie parallele.
function bilanAttenteEtatCouverture(attente) {
  var nb = (attente && Array.isArray(attente.observationsLiees)) ? attente.observationsLiees.length : 0;
  if (nb >= 2) { return 'plusieurs'; }
  if (nb === 1) { return 'un'; }
  return 'aucun';
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerAttente: bilanCreerAttente,
    bilanGenererIdAttente: bilanGenererIdAttente,
    bilanAttenteEstValide: bilanAttenteEstValide,
    bilanValiderAttente: bilanValiderAttente,
    bilanAttenteEtatCouverture: bilanAttenteEtatCouverture
  };
}
