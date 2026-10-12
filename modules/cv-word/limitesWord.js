/* ============================================================
   limitesWord.js  --  ce que Word ne reproduit pas comme le PDF
   ------------------------------------------------------------
   Registre UNIQUE des ecarts CONSTATES (vrai Word ouvert) entre le rendu PDF d'un modele ou d'un style et son export Word.
   Sert a un seul endroit : le message affiche dans le bloc « Exporter » AVANT le choix du format (decision de Denis, 2026-10-07).
   Regle : on n'inscrit ici que ce qui a ete VU dans Word. Jamais une supposition (une alerte a tort inquiete pour rien).
   Un ecart se declare par : un identifiant, une condition lue dans les reglages PDF enregistres (dossier.pdfReglages), et la
   phrase qui dit CE QUI CHANGE dans Word, en mots simples.
   ============================================================ */
var _LIMITES_WORD = [
  {
    id: 'ruban-pointe',
    quand: function (pr) { return !!(pr && pr.regCreatifActif && (pr.creatifVariante === 'colonneRuban' || pr.creatifVariante === 'rubanDiagonal')); },
    ce: 'les titres de rubrique en ruban à pointe s’affichent en rectangles'
  },
  {
    // Constaté dans un vrai Word le 2026-10-11 : la carte (coins arrondis, marge, page crème) est reproduite, mais le filet de la couleur d'accent le long de la carte n'apparaît pas.
    id: 'carte-filet',
    quand: function (pr) { return !!(pr && pr.regCreatifActif && pr.creatifVariante === 'colonneClaire'); },
    ce: 'la colonne reste une carte aux coins arrondis, mais le filet de couleur le long de la carte n’apparaît pas'
  },
  {
    // Constaté dans un vrai Word le 2026-10-11 : le double cadre de « Cadre de page » s'affiche en un seul cadre épais (le liseré fin intérieur n'est pas reproduit).
    id: 'cadre-double',
    quand: function (pr) { return !!(pr && pr.regCreatifActif && pr.creatifVariante === 'mqCadre'); },
    ce: 'le double cadre de la page s’affiche en un seul cadre épais'
  }
];

// Ecarts qui concernent les reglages donnes (liste de phrases, vide s'il n'y en a aucun).
function limitesWordPourReglages(pr) {
  if (!pr || typeof pr !== 'object') { return []; }
  return _LIMITES_WORD.filter(function (l) { try { return !!l.quand(pr); } catch (e) { return false; } }).map(function (l) { return l.ce; });
}

// Phrase complete pour la personne (texte simple, sans HTML), ou '' quand Word reproduit tout.
function phraseLimitesWord(pr) {
  var ce = limitesWordPourReglages(pr);
  if (!ce.length) { return ''; }
  return 'Ce modèle est surtout fait pour le PDF. Dans Word, ' + ce.join(', et ') + '. ' +
    'Pour retrouver exactement ce que vous voyez à l’écran, nous vous conseillons d’enregistrer votre CV en PDF. ' +
    'Si vous préférez Word, votre modèle sera adapté pour que l’ensemble reste cohérent.';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { limitesWordPourReglages: limitesWordPourReglages, phraseLimitesWord: phraseLimitesWord, _LIMITES_WORD: _LIMITES_WORD };
}
