/* ============================================================
   modules/cv-word/wordUnites.js  (2026-09-27)
   Export du CV en Word depuis le rendu du PDF : conversions d'unites.
   Module PUR (aucun acces au DOM) : testable sous Node. Voir docs/CHANTIER_WORD_DEPUIS_PDF_2026-09-26.md.

   Reperes : la page du navigateur est en pixels a 96 par pouce (A4 = 793,7 x 1122,5 px). Word compte en
   twips (1/20 de point : 15 par pixel), en EMU pour les dessins (9 525 par pixel) et en DEMI-POINTS pour la taille
   des caracteres (Word n'accepte pas d'autre precision : 9, 9,5, 10...).
   ============================================================ */

var WordUnites = (function () {
  // Etalonnage par police (rempli par scripts/word/etalonnage-polices.js). facteurTaille multiplie la taille avant
  // l'arrondi au demi-point ; decalageDemiPts s'y ajoute. Sans entree : arrondi au demi-point le plus proche.
  var ETALONNAGE_POLICES = {
    // Etalonnage du 2026-09-27 (10 polices du PDF, CV de demonstration, Standard, banc d'essai Word) : avec la compensation de l'arrondi au
    // demi-point, la largeur du texte dans Word / navigateur vaut entre 0,9967 et 1,0005 pour Arial, Calibri, Georgia, Verdana, Segoe UI,
    // Garamond, Times New Roman, Tahoma, Trebuchet MS et Book Antiqua : aucun facteur propre a une police n'est necessaire (k = 1).
  };

  // Une valeur non numerique (NaN, Infinity) ecrite dans le XML rend le .docx illisible pour Word : on la ramene a 0 plutot que de casser tout le fichier.
  function fini(v) { return (typeof v === 'number' && isFinite(v)) ? v : 0; }
  function pxVersTwips(px) { return Math.round(fini(px) * 15); }
  function pxVersEmu(px) { return Math.round(fini(px) * 9525); }
  function pxVersPt(px) { return px * 0.75; }
  function mmVersPx(mm) { return mm * 96 / 25.4; }
  function twipsVersPx(tw) { return tw / 15; }

  function cleFamille(famille) { return String(famille || '').toLowerCase().replace(/["']/g, '').split(',')[0].trim(); }

  function etalonnage(famille) { return ETALONNAGE_POLICES[cleFamille(famille)] || null; }

  // Taille en demi-points (entier, au moins 2 = 1 pt) pour une taille en points.
  function ptVersDemiPoints(pt, famille) {
    var e = etalonnage(famille);
    var v = pt * 2 * ((e && e.facteurTaille) || 1) + ((e && e.decalageDemiPts) || 0);
    return Math.max(2, Math.round(v));
  }
  function pxVersDemiPoints(px, famille) { return ptVersDemiPoints(pxVersPt(px), famille); }

  // Compensation de l'ecart de largeur entre Word et le navigateur : `k` = largeur du texte dans Word / dans le navigateur a taille egale
  // (etalonnage par police), et l'arrondi de la taille au demi-point. Word accepte un etirement horizontal des caracteres en pourcentage
  // entier (propriete « echelle » du texte) : on renvoie le pourcentage qui rend la largeur identique (100 = aucun changement).
  function echelleLargeurPct(px, famille) {
    var pt = pxVersPt(px);
    var demi = ptVersDemiPoints(pt, famille);
    var e = etalonnage(famille);
    var k = (e && e.k) || 1;
    var pct = Math.round(100 * (pt * 2) / (demi * k));
    if (pct < 80 || pct > 125) { pct = Math.max(80, Math.min(125, pct)); }
    return pct;
  }

  // Echappement XML (texte et attributs).
  function echapper(texte) {
    return String(texte === null || texte === undefined ? '' : texte)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Retire les caracteres interdits en XML 1.0 (controles), jamais les accents ni les espaces insecables.
  function nettoyerTexteXml(texte) {
    return String(texte === null || texte === undefined ? '' : texte).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  }

  function borner(v, min, max) { return Math.min(max, Math.max(min, v)); }

  return {
    ETALONNAGE_POLICES: ETALONNAGE_POLICES,
    pxVersTwips: pxVersTwips, pxVersEmu: pxVersEmu, pxVersPt: pxVersPt, mmVersPx: mmVersPx, twipsVersPx: twipsVersPx,
    ptVersDemiPoints: ptVersDemiPoints, pxVersDemiPoints: pxVersDemiPoints, echelleLargeurPct: echelleLargeurPct, cleFamille: cleFamille,
    echapper: echapper, nettoyerTexteXml: nettoyerTexteXml, borner: borner
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = WordUnites; }
