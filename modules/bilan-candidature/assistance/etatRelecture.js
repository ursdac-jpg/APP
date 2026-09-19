/* ============================================================
   modules/bilan-candidature/assistance/etatRelecture.js
   ------------------------------------------------------------
   TACHE (chantier "Assistance a la finalisation du CV", brique 3,
   2026-08-11) : structure et gestion de l'etat de l'ecran de relecture
   unique (docs/EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md, section 3,
   "Ecran de relecture" + "Trois moments de reprise de main", moment 3).
   Perimetre volontairement limite a cette brique, valide avant code :
     - la structure de l'etat (liste d'elements, chacun selectionnable) ;
     - l'avant/apres par element ;
     - la selection individuelle (case a decocher, jamais tout ou rien) ;
     - la preparation de l'application groupee (la liste des elements
       encore selectionnes au moment de valider).

   Volontairement ABSENT de cette brique, par decision explicite :
     - toute ecriture dans `dossier` -- reservee a la brique 4, aucune
       exception, y compris pour un element de Niveau 1 (destination
       deterministe). Cette brique prepare la selection, ne l'applique
       jamais.
     - toute interpretation du champ `destination` : ce module le traite
       comme une valeur opaque, injectee par l'appelant -- deja resolue
       par resolutionDestination.js pour le Niveau 1 (remplacement), ou
       resolutionChampExperience.js pour le Niveau 2 redactionnel (voir
       assistance/orchestrationAssistance.js, qui ne construit un element
       de relecture QUE lorsque cette resolution est `type: 'unique'`,
       sans ambiguite). Le cas `type: 'selection'` (plusieurs experiences,
       aucun selecteur humain construit pour cette V1) n'atteint jamais ce
       module : orchestrationAssistance.js classe ces recommandations en
       "hors-automatisation" avant meme d'en arriver la.
     - tout rendu HTML/DOM : comme resolutionChampExperience.js, un
       module pur, teste independamment de app.js -- meme separation
       deja appliquee au reste du chantier (logique avant ecran).

   Cases pre-cochees par defaut, decision deja validee par maquette
   interactive (2026-08-10) : chaque element decoule d'une recommandation
   deja consultee et retenue par le candidat plus tot dans le parcours,
   voir docs/EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md, "Ecran de
   relecture". Aucune option pour demarrer decoche : la case a decocher
   individuellement est le seul geste prevu, jamais un "tout decocher"
   par defaut qui contredirait cette decision.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilER = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilER.bilanCreerErreurMetier;
}

// texteActuel : null = absent du CV (cas d'une creation, action 'creer') --
// jamais une chaine vide. texteApres : obligatoire, un element sans
// texte propose n'a rien a faire sur cet ecran -- une erreur ici signale
// un appelant en tort, jamais une saisie utilisateur.
function bilanCreerElementRelecture(donnees) {
  donnees = donnees || {};
  if (!donnees.id) {
    throw bilanCreerErreurMetier('ElementRelectureInvalide', 'Un element de relecture doit avoir un id.', { donnees: donnees });
  }
  if (!donnees.texteApres) {
    throw bilanCreerErreurMetier('ElementRelectureInvalide', 'Un element de relecture doit avoir un texteApres (rien a proposer sinon).', { donnees: donnees });
  }
  return {
    id: donnees.id,
    dimension: donnees.dimension || null,
    texteActuel: donnees.texteActuel || null,
    texteApres: donnees.texteApres,
    destination: donnees.destination,
    // TACHE (correctif "suggestion pertinente par experience", Carte 3,
    // 2026-08-25) : 'remplacement' par defaut -- comportement inchange
    // pour tout appelant existant (voir ecritureRelecture.js). Seul le
    // flux multi-experiences fournit explicitement 'ajout' : la
    // proposition y est une ADDITION pensee pour completer les missions
    // deja ecrites, jamais un texte complet destine a les remplacer (a la
    // difference du flux mono-experience existant, ou l’assistant recoit deja le
    // texte actuel et produit une version complete amelioree -- remplacer
    // y est correct et deja valide par les tests d'ecritureRelecture.js).
    ecriture: donnees.ecriture === 'ajout' ? 'ajout' : 'remplacement',
    // TACHE (meme correctif) : true par defaut -- comportement inchange
    // (aucune option pour demarrer decoche, voir en-tete de fichier). Seul
    // le flux multi-experiences peut fournir explicitement false (une
    // experience que l’assistant juge peu pertinente reste visible mais decochee).
    selectionne: donnees.selectionne !== false
  };
}

function bilanCreerEtatRelecture(elements) {
  return { elements: (elements || []).map(bilanCreerElementRelecture) };
}

// Bascule silencieuse si l'id est inconnu (defense en profondeur, meme
// discipline que le reste du module) -- jamais une exception pour un
// simple clic sur un element qui n'existe plus.
function bilanBasculerSelectionRelecture(etat, id) {
  var element = ((etat && etat.elements) || []).filter(function (e) { return e.id === id; })[0];
  if (element) { element.selectionne = !element.selectionne; }
  return etat;
}

// La preparation de l'application groupee : exactement les elements
// encore coches au moment de valider, dans leur ordre d'origine. La
// brique 4 consomme ce tableau tel quel, sans le reinterpreter.
function bilanElementsSelectionnesRelecture(etat) {
  return ((etat && etat.elements) || []).filter(function (e) { return e.selectionne; });
}

function bilanCompteSelectionRelecture(etat) {
  var total = ((etat && etat.elements) || []).length;
  return { selectionnes: bilanElementsSelectionnesRelecture(etat).length, total: total };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerElementRelecture: bilanCreerElementRelecture,
    bilanCreerEtatRelecture: bilanCreerEtatRelecture,
    bilanBasculerSelectionRelecture: bilanBasculerSelectionRelecture,
    bilanElementsSelectionnesRelecture: bilanElementsSelectionnesRelecture,
    bilanCompteSelectionRelecture: bilanCompteSelectionRelecture
  };
}
