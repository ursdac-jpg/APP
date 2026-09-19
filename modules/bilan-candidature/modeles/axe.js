/* ============================================================
   modules/bilan-candidature/modeles/axe.js
   ------------------------------------------------------------
   Forme d'une entree du catalogue des axes (CONTRATS.md, section 1).
   Cette couche ne fournit QUE la forme (bilanCreerDefinitionAxe) et sa
   validation mecanique -- jamais les 10 entrees reelles elles-memes.
   Les 10 entrees (adequation, credibilite, risques...) sont une donnee
   metier reelle, pas une simple forme : elles seront peuplees dans
   analyse/axeAnalyseRegistry.js (couche analyse/, pas encore ecrite),
   seul proprietaire du catalogue effectif. Separation deliberee entre
   la forme (ici) et la donnee (la-bas).
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanEnumsAxe = require('./enums.js');
  var BILAN_AXE_POIDS = _bilanEnumsAxe.BILAN_AXE_POIDS;
  var bilanNiveauAnalyseEstValide = _bilanEnumsAxe.bilanNiveauAnalyseEstValide;
  var _bilanUtilAxe = require('./utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilAxe.bilanCreerErreurMetier;
}

function bilanCreerDefinitionAxe(donnees) {
  donnees = donnees || {};
  return {
    id: donnees.id,
    nom: donnees.nom,
    poids: donnees.poids,
    niveauMinimum: donnees.niveauMinimum,
    // plafonneA : null pour un axe determinant/differenciateur (aucun
    // plafond) ; 'a_renforcer' pour un axe amplificateur/contextuel.
    plafonneA: donnees.plafonneA || null,
    // TACHE (consolidation Bilan, bloc 1.4, 2026-08-30) : couche 2 du
    // rapport -- "ce qu'on regarde sur cet axe", texte fixe affiche dans
    // l'accordeon de l'axe meme s'il est solide. Tire de bilan-v1.md
    // section 2, reformule pour la personne. Optionnel cote forme (aucune
    // validation mecanique ci-dessous), obligatoire cote donnee : le test
    // tests/bilanCoherencePrompt1CatalogueAxes.test.js verifie que les 9
    // axes du catalogue en ont un non vide.
    ceQuOnRegarde: donnees.ceQuOnRegarde || ''
  };
}

function bilanDefinitionAxeEstValide(definitionAxe) {
  if (!definitionAxe || !definitionAxe.id || !definitionAxe.nom) { return false; }
  if (BILAN_AXE_POIDS.indexOf(definitionAxe.poids) === -1) { return false; }
  if (!bilanNiveauAnalyseEstValide(definitionAxe.niveauMinimum)) { return false; }
  var poidsPlafonnable = definitionAxe.poids === 'amplificateur' || definitionAxe.poids === 'contextuel';
  if (definitionAxe.plafonneA && !poidsPlafonnable) { return false; }
  return true;
}

function bilanValiderDefinitionAxe(definitionAxe) {
  if (!bilanDefinitionAxeEstValide(definitionAxe)) {
    throw bilanCreerErreurMetier('ReferenceInconnue', 'Definition d\'axe mal formee.', { definitionAxe: definitionAxe });
  }
}

// Un resultat 'prioritaire' est-il atteignable pour cet axe ? Faux pour
// un axe plafonne, sauf l'exception Lisibilite -- qui n'est pas un
// plafond different ici (elle reste un axe "amplificateur" au sens du
// poids), mais une derogation geree explicitement par la couche qui
// interprete la reponse de l’assistant (diagnostic/diagnosticResponseParser.js),
// jamais par un second champ ajoute ici.
function bilanAxeAutorisePrioritaire(definitionAxe) {
  return !definitionAxe.plafonneA;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanCreerDefinitionAxe: bilanCreerDefinitionAxe,
    bilanDefinitionAxeEstValide: bilanDefinitionAxeEstValide,
    bilanValiderDefinitionAxe: bilanValiderDefinitionAxe,
    bilanAxeAutorisePrioritaire: bilanAxeAutorisePrioritaire
  };
}
