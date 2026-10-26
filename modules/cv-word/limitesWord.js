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
    quand: function (pr) { return !!(pr && pr.regCreatifActif && (pr.creatifVariante === 'colonneRuban' || pr.creatifVariante === 'rubanDiagonal' || pr.creatifVariante === 'bandeauxNoirs')); },
    ce: 'les titres de rubrique en ruban à pointe s’affichent en rectangles'
  },
  {
    // Constaté dans un vrai Word le 2026-10-11 : la carte (coins arrondis, marge, page crème) est reproduite, mais le filet de la couleur d'accent le long de la carte n'apparaît pas.
    id: 'carte-filet',
    quand: function (pr) { return !!(pr && pr.regCreatifActif && pr.creatifVariante === 'colonneClaire'); },
    ce: 'la colonne reste une carte aux coins arrondis, mais le filet de couleur le long de la carte n’apparaît pas'
  },
  {
    // Les formes décoratives transparentes (A2, 2026-10-20) sont un calque posé sur la page du PDF : l'extracteur Word l'ignore (classe `formes-deco`). Certain, sans avoir à l'ouvrir : l'élément n'est pas lu.
    id: 'formes-deco',
    quand: function (pr) { return !!(pr && Array.isArray(pr.formesDeco) && pr.formesDeco.length); },
    ce: 'les formes décoratives ne sont pas reproduites'
  },
  {
    // Constaté dans un vrai Word le 2026-10-22 : avec le bandeau « Ruban court », le texte qui dépasse du ruban est recoloré dans le PDF lettre par lettre (texte à deux tons, réglage « Quand le texte sort
    // de la couleur »). Le 2026-10-21 le Word le laissait BLANC (invisible) ; depuis le 2026-10-22 l'extracteur le recolore MOT PAR MOT (wordExtracteur.js, recolorerTexteHors) : visible, mais un mot a cheval sur le bord garde une seule couleur. Les autres formes de bandeau et de colonne, les lignes du nom, du titre et des coordonnées,
    // les bandeaux et colonnes doux du mode Sobre, la casse, les lettres espacées et le séparateur entre expériences ont été vus reproduits : rien à signaler pour eux.
    id: 'texte-deux-tons',
    quand: function (pr) { return !!(pr && (pr.regCreatifActif || pr.regSobreActif) && pr.regBordBandeau === 'rubanCourt' && pr.regTexteHors !== 'aucun'); },
    ce: 'le texte du bandeau qui dépasse du ruban change de couleur mot par mot (un mot à cheval sur le bord garde une seule couleur)'
  },
  {
    // Compositions du CV a une colonne (2026-10-22), vues dans un vrai Word sur le modele « Bandeau pale » : l'equerre, la plaque de titre, les volets, l'etiquette et le ruban (avec sa queue d'aronde) sont reproduits ;
    // la diagonale devient presque droite (l'oblique de 90 px n'en garde que quelques pixels), le coin interieur arrondi du L devient un coin droit. Les quarts de cercle (composition et decor) devenaient des disques entiers ; l'extracteur les dessine depuis le 2026-10-23 comme un vrai quart (polygone), revu dans un vrai Word : plus d'ecart.
    id: 'composition-diagonale',
    quand: function (pr) { return !!(pr && pr.composition === 'diagonale' && String(pr.regColonnes) !== '2'); },   // a deux colonnes l'oblique est reproduite
    ce: 'la ligne oblique qui coupe l’en-tête devient presque droite'
  },
  {
    id: 'composition-l',
    quand: function (pr) { return !!(pr && pr.composition === 'l'); },
    ce: 'le coin arrondi du L devient un coin droit'
  },
  {
    // Vu dans un vrai Word le 2026-10-22 (CV a deux colonnes) : l'etiquette de couleur (arrondie en haut seulement dans le PDF) est arrondie sur ses quatre coins. Les autres compositions a deux colonnes (equerre, plaque, diagonale, L, volets, carte) sont reproduites.
    id: 'composition-etiquette-deux-colonnes',
    quand: function (pr) { return !!(pr && pr.composition === 'etiquette' && String(pr.regColonnes) === '2'); },
    ce: 'l’étiquette de couleur est aussi arrondie en bas'
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
