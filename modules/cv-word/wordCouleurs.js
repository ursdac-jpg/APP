/* ============================================================
   modules/cv-word/wordCouleurs.js  (2026-09-27)
   Export du CV en Word : lecture des couleurs CSS et calculs de contraste. Module PUR (Node).
   Le navigateur renvoie des valeurs deja calculees : rgb(...), rgba(...), color(srgb r g b / a) pour color-mix().
   ============================================================ */

var WordCouleurs = (function () {
  var NOMS = { white: [255, 255, 255], black: [0, 0, 0], transparent: [0, 0, 0, 0] };

  function borner255(v) { return Math.max(0, Math.min(255, Math.round(v))); }

  // Renvoie { r, g, b, a } (a entre 0 et 1) ou null si la valeur n'est pas comprise.
  function analyser(css) {
    if (css === null || css === undefined) { return null; }
    var s = String(css).trim().toLowerCase();
    if (!s) { return null; }
    if (NOMS[s]) { return { r: NOMS[s][0], g: NOMS[s][1], b: NOMS[s][2], a: NOMS[s].length === 4 ? NOMS[s][3] : 1 }; }
    var m = /^#([0-9a-f]{3})$/.exec(s);
    if (m) { return { r: parseInt(m[1][0] + m[1][0], 16), g: parseInt(m[1][1] + m[1][1], 16), b: parseInt(m[1][2] + m[1][2], 16), a: 1 }; }
    m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(s);
    if (m) { return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: m[2] ? parseInt(m[2], 16) / 255 : 1 }; }
    m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(s);
    if (m) {
      var a = 1;
      if (m[4] !== undefined) { a = /%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]); }
      return { r: borner255(parseFloat(m[1])), g: borner255(parseFloat(m[2])), b: borner255(parseFloat(m[3])), a: a };
    }
    m = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(s);
    if (m) {
      var a2 = 1;
      if (m[4] !== undefined) { a2 = /%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]); }
      return { r: borner255(parseFloat(m[1]) * 255), g: borner255(parseFloat(m[2]) * 255), b: borner255(parseFloat(m[3]) * 255), a: a2 };
    }
    return null;
  }

  function deuxChiffres(n) { var h = borner255(n).toString(16).toUpperCase(); return h.length < 2 ? '0' + h : h; }
  // 'RRGGBB' (majuscules, sans #).
  function versHex(c) { return c ? deuxChiffres(c.r) + deuxChiffres(c.g) + deuxChiffres(c.b) : null; }
  // Couleur CSS -> 'RRGGBB' ou null si transparente (a = 0) ou incomprise.
  function cssVersHex(css) { var c = analyser(css); return (c && c.a > 0.01) ? versHex(c) : null; }

  // Pose une couleur avec transparence sur un fond (fond blanc par defaut) : sert aux fonds translucides.
  function surFond(c, fond) {
    var f = fond || { r: 255, g: 255, b: 255, a: 1 };
    return { r: borner255(c.r * c.a + f.r * (1 - c.a)), g: borner255(c.g * c.a + f.g * (1 - c.a)), b: borner255(c.b * c.a + f.b * (1 - c.a)), a: 1 };
  }

  function canal(v) { var x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
  function luminance(c) { return 0.2126 * canal(c.r) + 0.7152 * canal(c.g) + 0.0722 * canal(c.b); }
  function contraste(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  return { analyser: analyser, versHex: versHex, cssVersHex: cssVersHex, surFond: surFond, luminance: luminance, contraste: contraste };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = WordCouleurs; }
