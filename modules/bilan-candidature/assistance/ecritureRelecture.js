/* ============================================================
   modules/bilan-candidature/assistance/ecritureRelecture.js
   ------------------------------------------------------------
   TACHE (chantier "Assistance a la finalisation du CV", brique 4,
   2026-08-11) : ecriture reelle dans `dossier`, seul role de cette
   brique -- aucune generation IA, aucune logique de relecture, aucune
   logique de resolution dupliquee ici (deja faites par les briques 1 a
   3). Consomme uniquement des elements deja valides par la brique 3
   (assistance/etatRelecture.js, typiquement le resultat de
   bilanElementsSelectionnesRelecture()).

   PERIMETRE (voir docs/EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md,
   "Distinction... deux familles", et docs/ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md,
   section 2) : uniquement la Famille 1 (redactionnelle), donc
   uniquement `cible: 'experiences'`. La Famille 2 (completude,
   `adequation`/`personnalisation`) n'ecrit jamais via ce module -- elle
   navigue vers un ecran existant que le candidat remplit lui-meme,
   aucune ecriture depuis cette modalite.

   Destination attendue, uniforme quel que soit le "type d'ecriture"
   (remplacement Niveau 1, complement ou creation Niveau 2) : `{ liste,
   index, champ }`, champ dans 'poste'|'missions'. `liste` (chantier
   "enrichissement CV legers via experiencesPerso", 2026-08-22) distingue
   dossier.experiences/dossier.experiencesPerso, defaut 'experiences' si
   absent -- retrocompatible avec tout appelant anterieur a ce chantier.
   TACHE (chantier "titre et accroche du CV", 2026-08-25) : `liste`
   accepte desormais aussi 'dossier' -- destination scalaire, sans
   `index`, `champ` dans BILAN_CHAMPS_DOSSIER_ECRITURE (voir plus bas).
   Verifie contre le contrat reel du Prompt 2 (prompts/bilan-v2.md, section 6) : `proposition` est
   toujours "le texte ameliore lui-meme, pret a etre utilise tel quel",
   jamais un fragment a concatener -- remplacement, complement et
   creation sont donc mecaniquement la MEME operation (une affectation
   complete du champ), seul le contexte (un texte existait deja ou non)
   differe. Aucune branche de code separee par "type d'ecriture" : les 3
   cas sont testes independamment (voir les tests), pas implementes
   separement.

   Ecriture atomique : toutes les destinations sont validees AVANT la
   moindre ecriture. Si une seule est invalide, aucun element du lot
   n'est ecrit -- jamais un `dossier` a moitie modifie.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilEcr = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilEcr.bilanCreerErreurMetier;
}

var BILAN_CHAMPS_EXPERIENCE_ECRITURE = ['poste', 'missions'];
// TACHE (chantier "enrichissement CV legers via experiencesPerso",
// 2026-08-22, DECISION DE DENIS -- verification d'architecture prealable
// faite avant ce code, voir memoire de session) : `destination.liste`
// distingue desormais 2 tableaux possibles, defaut 'experiences' pour
// rester retrocompatible avec toute destination qui ne le porterait pas
// encore. Ce fichier reste le SEUL point d'ecriture (deja son role
// exclusif documente en tete de fichier) -- aucun parcours (1, 2 ou 3)
// n'a besoin de savoir laquelle des 2 listes est concernee.
var BILAN_LISTES_DESTINATION_VALIDES = ['experiences', 'experiencesPerso'];

// TACHE (chantier "titre et accroche du CV", 2026-08-25, conception
// validee avec Denis) : `destination.liste === 'dossier'` vise un champ
// SCALAIRE du dossier (pas indexe dans un tableau d'experiences) --
// jusqu'ici ce module ne savait ecrire que 'poste'/'missions' d'une
// experience, une limitation decouverte commune aux Cartes 1, 2 et 3 (le
// meme whitelist BILAN_CHAMPS_EXPERIENCE_ECRITURE les sert toutes), pas
// specifique a ce chantier. Extension additive : le chemin
// 'experiences'/'experiencesPerso' existant n'est pas modifie.
var BILAN_CHAMPS_DOSSIER_ECRITURE = ['titreCV', 'accroche'];

function _bilanLireChampDossier(dossier, champ) {
  if (champ === 'titreCV') { return (dossier && dossier.titreCV) || ''; }
  if (champ === 'accroche') { return (dossier && dossier.ia && dossier.ia.cv && dossier.ia.cv.profil) || ''; }
  return '';
}

// 'accroche' vise dossier.ia.cv.profil -- EXACTEMENT le meme champ que
// l'ancien module "Creer un CV avec l’assistant" (js/app.js) et que le moteur de
// rendu (modules/cv-composeur/composeurComposition.js, normaliserDonneesCV.js) :
// une seule source de verite, ecriture la plus recente qui l'emporte,
// aucun mecanisme de fusion/verrouillage distinct invente ici.
function _bilanEcrireChampDossier(dossier, champ, valeur) {
  if (champ === 'titreCV') { dossier.titreCV = valeur; return; }
  if (champ === 'accroche') {
    dossier.ia = dossier.ia || {};
    dossier.ia.cv = dossier.ia.cv || {};
    dossier.ia.cv.profil = valeur;
  }
}

// TACHE (meme chantier) : seule connaissance de la correspondance
// poste/intitule tolérée dans ce fichier -- hostDataAdapter.js normalise
// deja poste/intitule cote LECTURE (dossier.experiencesPerso n'a pas de
// champ "poste", voir CONFIG_EXPERIENCES_PERSO/js/app.js) ; ceci en est
// le symetrique cote ECRITURE, jamais duplique ailleurs dans le module.
// 'missions' est identique dans les 2 tableaux, aucune correspondance
// necessaire pour ce champ.
function _bilanChampReelEcriture(liste, champ) {
  return (liste === 'experiencesPerso' && champ === 'poste') ? 'intitule' : champ;
}

function _bilanTableauDestination(dossier, destination) {
  var cle = (destination && destination.liste) || 'experiences';
  return (dossier && Array.isArray(dossier[cle])) ? dossier[cle] : null;
}

// Defense en profondeur : ne devrait jamais echouer si les briques 1 a 3
// ont fait leur travail, mais une destination hors-limites ou mal
// formee doit arreter tout le lot plutot que d'ecrire au mauvais
// endroit ou de planter au milieu de l'ecriture.
function _bilanDestinationEcritureValide(dossier, destination) {
  if (destination && destination.liste === 'dossier') {
    return !!dossier && BILAN_CHAMPS_DOSSIER_ECRITURE.indexOf(destination.champ) !== -1;
  }
  var liste = (destination && destination.liste) || 'experiences';
  var tableau = _bilanTableauDestination(dossier, destination);
  return !!destination
    && BILAN_LISTES_DESTINATION_VALIDES.indexOf(liste) !== -1
    && typeof destination.index === 'number'
    && BILAN_CHAMPS_EXPERIENCE_ECRITURE.indexOf(destination.champ) !== -1
    && !!tableau && !!tableau[destination.index];
}

function bilanValiderElementsRelectureAvantEcriture(dossier, elements) {
  (elements || []).forEach(function (element) {
    if (!_bilanDestinationEcritureValide(dossier, element.destination)) {
      throw bilanCreerErreurMetier(
        'DestinationEcritureInvalide',
        'Destination illisible ou hors limites pour un element de relecture.',
        { id: element.id, destination: element.destination }
      );
    }
  });
}

// TACHE (correctif "suggestion pertinente par experience", Carte 3,
// 2026-08-25) : `element.ecriture === 'ajout'` vient s'ajouter au contenu
// deja present (separateur '\n', meme convention que la saisie manuelle --
// voir modules/cv-composeur/composeurRender.js, _decouperMissions),
// jamais l'ecraser. Reserve au flux multi-experiences (une recommandation
// appliquee a plusieurs experiences a la fois -- voir memoire de session,
// bug reel trouve en comparant 2 CV exportes : un texte generique unique
// remplacait les missions reelles de 3 experiences differentes). Absent ou
// toute autre valeur ('remplacement', comportement historique) : remplace
// integralement, INCHANGE -- l’assistant recoit deja le texte actuel en contexte
// dans ce cas et produit une version complete amelioree qui l'incorpore
// (voir prompts/bilan-v2.md), remplacer y est correct, deja valide par les
// tests de ce fichier.
function _bilanValeurApresEcriture(valeurExistante, texteApres, modeEcriture) {
  if (modeEcriture !== 'ajout') { return texteApres; }
  var existant = (valeurExistante && String(valeurExistante).trim()) || '';
  return existant ? existant + '\n' + texteApres : texteApres;
}

// Point d'entree unique de cette brique. `elements` : le resultat de
// bilanElementsSelectionnesRelecture() (brique 3), ou tout tableau de
// meme forme -- ce module ne connait pas etatRelecture.js, il se contente
// de la forme { destination: { index, champ }, texteApres, ecriture }.
function bilanAppliquerElementsRelecture(dossier, elements) {
  var aEcrire = elements || [];
  bilanValiderElementsRelectureAvantEcriture(dossier, aEcrire);
  aEcrire.forEach(function (element) {
    if (element.destination.liste === 'dossier') {
      var valeurExistanteDossier = _bilanLireChampDossier(dossier, element.destination.champ);
      _bilanEcrireChampDossier(dossier, element.destination.champ, _bilanValeurApresEcriture(valeurExistanteDossier, element.texteApres, element.ecriture));
      return;
    }
    var tableau = _bilanTableauDestination(dossier, element.destination);
    var champReel = _bilanChampReelEcriture(element.destination.liste || 'experiences', element.destination.champ);
    var valeurExistante = tableau[element.destination.index][champReel];
    tableau[element.destination.index][champReel] = _bilanValeurApresEcriture(valeurExistante, element.texteApres, element.ecriture);
  });
  return dossier;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanValiderElementsRelectureAvantEcriture: bilanValiderElementsRelectureAvantEcriture,
    bilanAppliquerElementsRelecture: bilanAppliquerElementsRelecture
  };
}
