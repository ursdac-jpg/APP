/* ============================================================
   composeurDedoublonnage.js
   ------------------------------------------------------------
   Brique commune : une même compétence n'apparaît jamais deux fois dans
   une même liste du CV (retour terrain de Denis, 2026-09-21 : « Esprit
   d'équipe » affiché deux fois dans « Compétences comportementales »).

   Cause d'origine : composeurComposition.js mettait bout à bout des
   listes venant de sources différentes (savoir-être déduits du dossier,
   compétences personnelles du module Découverte...) sans jamais
   dédoublonner, puis coupait au plafond -- le doublon prenait donc aussi
   une place.

   Ce fichier est PUR (aucun accès au DOM ni au dossier) : testable en
   Node (tests/composeurDedoublonnage.test.js). Il ne compare que des
   libellés identiques à la casse, aux accents, aux apostrophes et aux
   espaces près : jamais un rapprochement « intelligent » de sens (une
   table de synonymes validée par Denis viendra plus tard, voir
   docs/NOTES_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md, Q76).
   ============================================================ */

// Clé de comparaison : minuscules, sans accents, apostrophes unifiées,
// ponctuation finale et espaces multiples retirés.
function composeurCleCompetence(texte) {
  return String(texte === null || texte === undefined ? '' : texte)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[\s.,;:!]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Texte d'un élément : une chaîne, ou un objet { competence } / { texte }
// (forme des compétences personnelles du module Découverte).
function composeurTexteCompetence(element) {
  if (typeof element === 'string') { return element; }
  if (element && typeof element === 'object') { return element.competence || element.texte || ''; }
  return '';
}

// Garde la PREMIÈRE occurrence de chaque libellé, dans l'ordre reçu (l'ordre
// des listes est déjà celui de la pertinence : jamais réordonné ici). Les
// éléments sans texte sont écartés.
function composeurDedoublonnerListe(liste, extraireTexte) {
  var lire = (typeof extraireTexte === 'function') ? extraireTexte : composeurTexteCompetence;
  var vus = {};
  var resultat = [];
  (liste || []).forEach(function (element) {
    var cle = composeurCleCompetence(lire(element));
    if (!cle || vus[cle]) { return; }
    vus[cle] = true;
    resultat.push(element);
  });
  return resultat;
}

if (typeof module !== 'undefined') {
  module.exports = {
    composeurCleCompetence: composeurCleCompetence,
    composeurTexteCompetence: composeurTexteCompetence,
    composeurDedoublonnerListe: composeurDedoublonnerListe
  };
}
