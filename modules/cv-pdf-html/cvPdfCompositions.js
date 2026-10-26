/* ============================================================
   cvPdfCompositions.js : COMPOSITIONS de l'en-tete et des marges du CV (Denis, 2026-10-22 ; maquettes
   docs/MAQUETTE_COMPOSITIONS_UNE_COLONNE_2026-10-22.html et docs/MAQUETTE_BANDEAU_ET_COLONNE_FUSION_2026-10-22.html,
   analyse docs/ANALYSE_COMPATIBILITE_COMPOSITIONS_2026-10-22.md).
   ------------------------------------------------------------
   Une composition est un STYLE COMPLET choisi d'un clic (equerre, plaque de titre, diagonale...) : quelques zones de couleur posees derriere le texte, dans l'en-tete
   et dans les marges, jamais derriere le corps du CV. Une composition REMPLACE le bandeau du modele (sa forme et sa couleur d'origine ne s'ajoutent pas).
   Le dessin est CALCULE sur des mesures de la page reelle (hauteur de l'en-tete, ou finit le nom et ou commence le metier, ou commence le corps du CV, marges du texte) :
   un decor ne depasse jamais sur le texte. La couleur du texte se decide zone par zone, d'apres le fond reellement derriere lui (blanc ou sombre, le meilleur contraste).
   Une seule source : les dessins (_compoCalculer) et la mise sur la page (_compoPoser) sont ici, utilises par l'apercu du panneau et par le grand apercu.
   Les parties sans page (liste, melange de couleurs, contraste, calcul des zones) sont pures : testees en Node (tests/compositions.test.js).
   Phase 1 et 2 (2026-10-22) : les huit compositions du CV a UNE colonne. Les huit du CV a deux colonnes viennent ensuite (meme moteur : `deux` dans STYLES).
   ============================================================ */
var _COMPOSITIONS = {
  PAGE_L: 794, PAGE_H: 1123,
  SOMBRE: '#1f2933', CLAIR: '#ffffff',
  // `une` : la composition existe pour un CV a une colonne ; `deux` : pour deux colonnes (phase 3). `ico` : la petite image du bouton (viewBox 0 0 64 44).
  STYLES: [
    { id: 'equerre', nom: 'Équerre', une: true, deux: true, ico: '<path d="M4 16V4H34" fill="none" stroke="currentColor" stroke-width="5"/><path d="M60 28V40H30" fill="none" stroke="currentColor" stroke-width="5"/>' },
    { id: 'plaque', nom: 'Plaque de titre', une: true, deux: true, ico: '<rect x="2" y="2" width="60" height="16" fill="currentColor"/><rect x="26" y="5" width="32" height="10" rx="4" fill="#fff" opacity=".7"/>' },
    { id: 'diagonale', nom: 'Diagonale', une: true, deux: true, ico: '<polygon points="2,2 38,2 30,18 2,18" fill="currentColor" opacity=".35"/><polygon points="38,2 62,2 62,18 30,18" fill="currentColor"/>' },
    { id: 'l', nom: 'L mince', une: true, deux: true, ico: '<path d="M2 2H62V16H10Q6 16 6 20V42H2Z" fill="currentColor"/>' },
    { id: 'volets', nom: 'Volets superposés', une: true, deux: true, ico: '<rect x="2" y="2" width="38" height="16" fill="currentColor" opacity=".3"/><rect x="22" y="8" width="40" height="16" fill="currentColor" opacity=".5"/>' },
    { id: 'etiquette', nom: 'Étiquette suspendue', une: true, deux: true, ico: '<rect x="2" y="2" width="60" height="16" fill="currentColor" opacity=".3"/><path d="M6 2H26V20Q26 24 22 24H10Q6 24 6 20Z" fill="currentColor"/>' },
    { id: 'carte', nom: 'Carte qui chevauche', une: false, deux: true, ico: '<rect x="2" y="2" width="60" height="14" fill="currentColor"/><rect x="5" y="10" width="22" height="30" rx="5" fill="#fff" stroke="currentColor" stroke-width="2"/>' },
    { id: 'ruban', nom: 'Ruban', une: true, deux: false, ico: '<path d="M44 2H56V24L50 19L44 24Z" fill="currentColor"/>' },
    { id: 'quart', nom: 'Quarts de cercle', une: true, deux: false, ico: '<path d="M62 2V30A28 28 0 0 1 34 2Z" fill="currentColor" opacity=".3"/><path d="M62 2V18A16 16 0 0 1 46 2Z" fill="currentColor" opacity=".55"/>' }
  ],
  // Modeles dont la structure (frise, rectangles, photo, bande verticale) n'a pas d'en-tete horizontal : aucune composition (masquee, jamais grisee).
  EXCLUS: ['creatif:bandeauVertical', 'creatif:frise', 'creatif:friseFoncee', 'creatif:photoFrise', 'creatif:rectangles', 'sobre:mq-frise', 'sobre:mq-photo', 'sobre:mq-rectangles']
};

function _compoStyle(id) { for (var i = 0; i < _COMPOSITIONS.STYLES.length; i++) { if (_COMPOSITIONS.STYLES[i].id === id) { return _COMPOSITIONS.STYLES[i]; } } return null; }
// Un identifiant venu de n'importe ou (stockage, essai) : connu, sinon '' (= « Comme aujourd'hui »). Jamais d'exception.
function _compoNormaliser(id) { return (typeof id === 'string' && _compoStyle(id)) ? id : ''; }
// Les compositions proposees pour un CV a `nbCol` colonnes (1 ou 2).
function _compoListePour(nbCol) { return _COMPOSITIONS.STYLES.filter(function (s) { return nbCol === 2 ? s.deux : s.une; }); }
function _compoModeleExclu(cle) { return _COMPOSITIONS.EXCLUS.indexOf(cle) !== -1; }

// ---- Couleurs (pures) ----
function _compoRgb(hex) { var m = /^#([0-9a-fA-F]{6})$/.exec(hex || ''); if (!m) { return [30, 58, 95]; } return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)]; }
function _compoHex(rgb) { return '#' + rgb.map(function (v) { var h = Math.max(0, Math.min(255, Math.round(v))).toString(16); return h.length < 2 ? '0' + h : h; }).join(''); }
// Mele une couleur avec du blanc : t = 0 (la couleur) a 1 (blanc). Des teintes pleines, jamais de transparence (le Word ne la reproduit pas).
function _compoMelanger(hex, t) { return _compoHex(_compoRgb(hex).map(function (v) { return v + (255 - v) * t; })); }
function _compoLuminance(hex) {
  var c = _compoRgb(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function _compoContraste(a, b) { var la = _compoLuminance(a), lb = _compoLuminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
// La couleur de texte qui se lit le mieux sur ce fond : le blanc ou le sombre.
function _compoCouleurTexte(fond) { return _compoContraste(_COMPOSITIONS.CLAIR, fond) >= _compoContraste(_COMPOSITIONS.SOMBRE, fond) ? _COMPOSITIONS.CLAIR : _COMPOSITIONS.SOMBRE; }

// Un fond sur lequel du texte se lit : si ni le blanc ni le sombre ne donnent un contraste d'au moins 4,5 (tons moyens : rouge vif, gris), la couleur est foncee ou eclaircie juste ce qu'il faut.
function _compoLisible(fond) {
  var meilleur = function (f) { return Math.max(_compoContraste(_COMPOSITIONS.CLAIR, f), _compoContraste(_COMPOSITIONS.SOMBRE, f)); };
  if (meilleur(fond) >= 4.5) { return fond; }
  var vers = _compoLuminance(fond) < 0.23 ? '#000000' : '#ffffff', rgb = _compoRgb(fond), cible = _compoRgb(vers);
  for (var t = 0.05; t <= 1; t += 0.05) {
    var f = _compoHex(rgb.map(function (v, i) { return v + (cible[i] - v) * t; }));
    if (meilleur(f) >= 4.5) { return f; }
  }
  return fond;
}
// Une teinte claire de la couleur du CV (mele avec du blanc), assez claire pour que le texte sombre s'y lise.
function _compoTeinte(couleur, t) {
  var f = _compoMelanger(couleur, t);
  while (_compoContraste(_COMPOSITIONS.SOMBRE, f) < 4.5 && t < 1) { t += 0.05; f = _compoMelanger(couleur, t); }
  return f;
}

// Un fond CSS (rgb ou rgba, eventuellement translucide) pose sur une couleur : la couleur reellement vue. Un fond transparent ou inconnu laisse la couleur du dessous.
// Lit une couleur CSS calculee : rgb(), rgba() ou color(srgb ...) (forme que donne le navigateur pour un melange de couleurs). Rend [r, g, b, alpha] (0 a 255, alpha 0 a 1) ou null.
function _compoCssRgba(css) {
  var m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\s*\)/.exec(css || ''), k = 1;
  if (!m) { m = /color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/.exec(css || ''); k = 255; }
  if (!m) { return null; }
  var a = m[4] === undefined ? 1 : (/%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
  return [+m[1] * k, +m[2] * k, +m[3] * k, Math.max(0, Math.min(1, isFinite(a) ? a : 1))];
}
function _compoComposer(dessous, css) {
  var c = _compoCssRgba(css);
  if (!c || !(c[3] > 0)) { return dessous; }
  var d = _compoRgb(dessous);
  return _compoHex([0, 1, 2].map(function (i) { return c[i] * c[3] + d[i] * (1 - c[3]); }));
}
// Le trait sous l'en-tete (`.trait`) : de la meme couleur que le bandeau au-dessus, il ressemblerait a une erreur (retour de Denis, 2026-10-22). Sur un bandeau FONCE il passe en gris, sur un bandeau CLAIR il prend la couleur du CV.
function _compoCouleurTrait(fondDessus, couleur) { return _compoLuminance(fondDessus) < 0.35 ? '#b8bdc7' : couleur; }
// Le choix de la personne pour ce trait : '' = automatique (ci-dessus), 'aucun' = pas de trait, 'gris', 'cv' = la couleur du CV.
var _COMPO_TRAITS = [{ id: '', nom: 'Automatique' }, { id: 'aucun', nom: 'Sans trait' }, { id: 'gris', nom: 'Gris' }, { id: 'cv', nom: 'Couleur du CV' }];
function _compoTraitNormaliser(v) { return (v === 'aucun' || v === 'gris' || v === 'cv') ? v : ''; }
function _compoCssVersHex(css) { var c = _compoCssRgba(css); return c ? _compoHex(c.slice(0, 3)) : null; }

// ---- Zones (pures) ----
function _compoDansForme(f, x, y) {
  if (!f) { return false; }
  if (f.poly) {
    var c = false, p = f.poly;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i][1] > y) !== (p[j][1] > y)) && (x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) { c = !c; } }
    return c;
  }
  return x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h;
}
// Le fond reellement derriere le point (x, y) : la derniere zone portant du texte qui le contient ; sinon le papier (blanc).
function _compoFondEn(zones, x, y) {
  for (var i = zones.length - 1; i >= 0; i--) { if (zones[i].texte && _compoDansForme(zones[i].forme, x, y)) { return zones[i].fill; } }
  return '#ffffff';
}
// La zone portant du texte derriere le point (x, y), ou null (le papier).
function _compoZoneEn(zones, x, y) {
  for (var i = zones.length - 1; i >= 0; i--) { if (zones[i].texte && _compoDansForme(zones[i].forme, x, y)) { return zones[i]; } }
  return null;
}
function _compoBorne(v, min, max) { return Math.max(min, Math.min(max, v)); }
function _compoPolyCss(pts) { return pts.map(function (q) { return Math.round(q[0]) + 'px ' + Math.round(q[1]) + 'px'; }).join(','); }

// Calcule le dessin d'une composition pour un CV a UNE colonne. m : mesures de la page, en px de la page :
//   pageL, pageH ; H : bas de l'en-tete ; gauche : bord droit du nom et des coordonnees ; droite / droiteMetier : bord gauche et bord droit du titre du metier ;
//   topCorps : haut du premier element du corps (sous l'en-tete) ; bordG, bordD, basCorps : marges reelles du texte du corps ; couleur : couleur du CV (#rrggbb).
// Rend { zones: [{ css, fill, texte, forme }], largeurMetier: px ou null, ok: vrai/faux } ; `texte` vrai = du texte peut etre pose sur cette zone (le calcul de la couleur du texte s'en sert) ; null si la composition n'existe pas.
function _compoCalculer(id, m) {
  if (m && m.col) { return _compoCalculer2(id, m); }
  var P = m.pageL || _COMPOSITIONS.PAGE_L, PH = m.pageH || _COMPOSITIONS.PAGE_H, H = Math.max(60, m.H || 214), C0 = m.couleur || '#1e3a5f', C = _compoLisible(C0);
  var gauche = typeof m.gauche === 'number' ? m.gauche : 240, droite = typeof m.droite === 'number' ? m.droite : 300, droiteMetier = typeof m.droiteMetier === 'number' ? m.droiteMetier : P - 38;
  var topCorps = typeof m.topCorps === 'number' ? m.topCorps : H + 40;
  var bordG = typeof m.bordG === 'number' ? m.bordG : 38, bordD = typeof m.bordD === 'number' ? m.bordD : P - 38, basCorps = typeof m.basCorps === 'number' ? m.basCorps : PH - 200;
  // Place libre sous l'en-tete : un decor qui deborde ne depasse jamais sur le premier element du corps (modele Technique : bandes de rubriques juste dessous).
  var ov = _compoBorne(Math.round(topCorps - H - 6), 0, 34);
  var clair = _compoTeinte(C0, 0.85), moyen = _compoTeinte(C0, 0.68), croise = _compoTeinte(C0, 0.5);
  var Z = [], largeurMetier = null;
  var rect = function (x, y, w, h, fill, css, texte) { Z.push({ css: 'left:' + Math.round(x) + 'px;top:' + Math.round(y) + 'px;width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px;background:' + fill + ';' + (css || ''), fill: fill, texte: texte !== false, forme: { x: x, y: y, w: w, h: h } }); };
  if (id === 'equerre') {
    var t = _compoBorne(Math.min(16, bordG - 8, P - bordD - 8), 8, 16);
    Z.push({ css: 'left:0;top:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.34) + 'px;box-sizing:border-box;border-top:' + t + 'px solid ' + C0 + ';border-left:' + t + 'px solid ' + C0, fill: C0, texte: false, forme: null });
    // L'equerre du bas n'est dessinee que si le corps du CV la laisse libre (un CV qui remplit la page ne la recouvre jamais).
    if (basCorps <= PH - t - 8) { Z.push({ css: 'right:0;bottom:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.30) + 'px;box-sizing:border-box;border-bottom:' + t + 'px solid ' + C0 + ';border-right:' + t + 'px solid ' + C0, fill: C0, texte: false, forme: null }); }
  } else if (id === 'plaque') {
    var px0 = Math.max(gauche + 24, droite - 30), px1 = Math.min(P - 24, Math.max(droiteMetier + 30, px0 + 140));
    rect(0, 0, P, H, C, '', true);
    rect(px0, 20, px1 - px0, H - 40, clair, 'border-radius:22px;', true);
  } else if (id === 'diagonale') {
    var xt = Math.max(gauche + 24, droite - 18), xb = Math.max(gauche + 20, xt - 90);
    var gP = [[0, 0], [xt, 0], [xb, H], [0, H]], dP = [[xt, 0], [P, 0], [P, H], [xb, H]];
    Z.push({ css: 'left:0;top:0;width:' + P + 'px;height:' + H + 'px;background:' + clair + ';clip-path:polygon(' + _compoPolyCss(gP) + ')', fill: clair, texte: true, forme: { poly: gP } });
    Z.push({ css: 'left:0;top:0;width:' + P + 'px;height:' + H + 'px;background:' + C + ';clip-path:polygon(' + _compoPolyCss(dP) + ')', fill: C, texte: true, forme: { poly: dP } });
  } else if (id === 'l') {
    var s = _compoBorne(Math.min(20, bordG - 10), 10, 20), r = _compoBorne(bordG - s - 4, 8, 24);   // le coin arrondi reste dans la marge : il ne touche jamais le texte du corps
    rect(0, 0, P, H, C, '', true);
    rect(0, 0, s, PH, C, '', false);
    Z.push({ css: 'left:' + s + 'px;top:' + H + 'px;width:' + (r + 2) + 'px;height:' + (r + 2) + 'px;background:radial-gradient(circle at 100% 100%, transparent ' + (r + 1.4) + 'px, ' + C + ' ' + (r + 1.4) + 'px)', fill: C, texte: false, forme: null });
  } else if (id === 'volets') {
    var xa = Math.min(P - 120, Math.round((droite + droiteMetier) / 2) + 70), xb0 = droite + 30, yb = 36, hb = H - yb + Math.min(14, ov);
    rect(0, 0, xa, H, clair, '', true);
    rect(xb0, yb, P - xb0, hb, moyen, '', true);
    rect(xb0, yb, xa - xb0, H - yb, croise, '', true);
  } else if (id === 'etiquette') {
    var ex0 = 16, ex1 = Math.max(gauche + 28, ex0 + 120), eh = H + Math.min(16, ov);
    rect(0, 0, P, H, clair, '', true);
    rect(ex0, 0, ex1 - ex0, eh, C, 'border-radius:0 0 22px 22px;', true);
  } else if (id === 'ruban') {
    var rx = P - 126, rh = H + ov, qa = Math.min(26, 12 + ov * 0.4);
    Z.push({ css: 'left:' + rx + 'px;top:0;width:76px;height:' + Math.round(rh) + 'px;background:' + C + ';clip-path:polygon(0 0,100% 0,100% 100%,50% calc(100% - ' + Math.round(qa) + 'px),0 100%)', fill: C, texte: false, forme: null });
    // Le titre du metier ne touche jamais le ruban : sa largeur est reduite si besoin.
    if (droiteMetier > rx - 18) { largeurMetier = Math.max(120, rx - 18 - droite); }
  } else if (id === 'quart') {
    var g = Math.min(240, H + ov), p2 = Math.round(g * 0.625);
    Z.push({ css: 'left:' + (P - g) + 'px;top:0;width:' + g + 'px;height:' + g + 'px;background:' + clair + ';border-radius:0 0 0 100%', fill: clair, texte: true, forme: { poly: _compoQuartPoly(P, g) } });
    Z.push({ css: 'left:' + (P - p2) + 'px;top:0;width:' + p2 + 'px;height:' + p2 + 'px;background:' + moyen + ';border-radius:0 0 0 100%', fill: moyen, texte: true, forme: { poly: _compoQuartPoly(P, p2) } });
  } else { return null; }
  return { zones: Z, largeurMetier: largeurMetier, ok: true, couleur: C };
}
// Calcule le dessin d'une composition pour un CV a DEUX colonnes (colonne a gauche). m.col = { W : bord droit de la colonne (et de son fond), mainLeft : bord gauche du texte de la grande colonne }.
// Le fond de la colonne est dessine par la composition (celui du modele est retire) ; le texte de la colonne et de l'en-tete prend la couleur qui se lit sur ce fond.
// Rend { zones, blocs : { metier : { left, width } }, ok } ; les blocs deplaces le sont seulement quand le titre du metier toucherait la colonne ou un decor.
function _compoCalculer2(id, m) {
  if (m.col && m.col.droite) { return _compoCalculerDroite(id, m); }
  var P = m.pageL || _COMPOSITIONS.PAGE_L, PH = m.pageH || _COMPOSITIONS.PAGE_H, H = Math.max(60, m.H || 214), C0 = m.couleur || '#1e3a5f', C = _compoLisible(C0);
  var W = _compoBorne(m.col.W, 150, 420), mainL = typeof m.col.mainLeft === 'number' ? m.col.mainLeft : W + 8;
  var gauche = typeof m.gauche === 'number' ? m.gauche : 240, droite = typeof m.droite === 'number' ? m.droite : 300;
  var basGauche = typeof m.basGauche === 'number' ? m.basGauche : H - 40, topCorps = typeof m.topCorps === 'number' ? m.topCorps : H + 8;
  var bordG = typeof m.bordG === 'number' ? m.bordG : 38, bordD = typeof m.bordD === 'number' ? m.bordD : P - 38, basCorps = typeof m.basCorps === 'number' ? m.basCorps : PH - 200;
  var clair = _compoTeinte(C0, 0.85), moyen = _compoTeinte(C0, 0.62), tres = _compoTeinte(C0, 0.9), croise = _compoTeinte(C0, 0.45);
  var Z = [], blocs = {};
  var rect = function (x, y, w, h, fill, css, texte) { Z.push({ css: 'left:' + Math.round(x) + 'px;top:' + Math.round(y) + 'px;width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px;background:' + fill + ';' + (css || ''), fill: fill, texte: texte !== false, forme: { x: x, y: y, w: w, h: h } }); };
  var metierA = function (gaucheMin, droiteMax) {   // le titre du metier commence au moins a gaucheMin et finit avant droiteMax
    if (droite < gaucheMin) { blocs.metier = { left: Math.round(gaucheMin), width: Math.round(Math.max(140, droiteMax - gaucheMin)) }; }
  };
  if (id === 'equerre') {
    var t = _compoBorne(Math.min(16, bordG - 8, P - bordD - 8), 8, 16);
    Z.push({ css: 'left:0;top:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.34) + 'px;box-sizing:border-box;border-top:' + t + 'px solid ' + C0 + ';border-left:' + t + 'px solid ' + C0, fill: C0, texte: false, forme: null });
    if (basCorps <= PH - t - 8) { Z.push({ css: 'right:0;bottom:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.30) + 'px;box-sizing:border-box;border-bottom:' + t + 'px solid ' + C0 + ';border-right:' + t + 'px solid ' + C0, fill: C0, texte: false, forme: null }); }
  } else if (id === 'plaque') {
    var px0 = W + 18, px1 = P - 24;
    rect(0, 0, W, PH, C, '', true);
    rect(px0, 18, px1 - px0, H - 32, clair, 'border-radius:22px;', true);
    metierA(W + 52, px1 - 24);
  } else if (id === 'diagonale') {
    var xt = W + 96, gP = [[0, 0], [xt, 0], [W, H], [W, PH], [0, PH]], dP = [[xt, 0], [P, 0], [P, H], [W, H]];
    Z.push({ css: 'left:0;top:0;width:' + P + 'px;height:' + PH + 'px;background:' + clair + ';clip-path:polygon(' + _compoPolyCss(gP) + ')', fill: clair, texte: true, forme: { poly: gP } });
    Z.push({ css: 'left:0;top:0;width:' + P + 'px;height:' + H + 'px;background:' + C + ';clip-path:polygon(' + _compoPolyCss(dP) + ')', fill: C, texte: true, forme: { poly: dP } });
    metierA(xt + 30, P - 38);
  } else if (id === 'l') {
    var r = _compoBorne(Math.min(mainL - W, topCorps - H) - 2, 0, 40);
    rect(0, 0, P, H, C, '', true);
    rect(0, 0, W, PH, C, '', true);
    if (r >= 6) { Z.push({ css: 'left:' + Math.round(W) + 'px;top:' + Math.round(H) + 'px;width:' + Math.round(r + 2) + 'px;height:' + Math.round(r + 2) + 'px;background:radial-gradient(circle at 100% 100%, transparent ' + (r + 1.4) + 'px, ' + C + ' ' + (r + 1.4) + 'px)', fill: C, texte: false, forme: null }); }
  } else if (id === 'volets') {
    rect(0, 0, P, H, moyen, '', true);
    rect(0, 0, W, PH, tres, '', true);
    rect(0, 0, W, H, croise, '', true);
  } else if (id === 'etiquette') {
    rect(0, 0, P, H, clair, '', true);
    rect(26, 34, W - 26, PH - 68, C, 'border-radius:26px 26px 0 0;', true);
    metierA(W + 36, P - 38);
  } else if (id === 'carte') {
    var cy = _compoBorne(Math.max(H - 34, basGauche + 8), H - 34, H - 4), ch = PH - cy - 24;
    rect(0, 0, P, H, C, '', true);
    rect(19, cy - 5, W - 24 + 10, ch + 10, '#ffffff', 'border-radius:27px;', false);
    rect(24, cy, W - 24, ch, tres, 'border-radius:22px;', true);
  } else { return null; }
  return { zones: Z, blocs: blocs, largeurMetier: null, ok: true, couleur: C };
}
// Calcule le dessin d'une composition pour un CV a deux colonnes dont la colonne est a DROITE (modeles chronologiques, editorial large, colonnes inversees).
// Sur ces modeles l'en-tete est classique (pas de blocs libres) : son texte reste a gauche, au-dessus de la grande colonne, et aucun bloc n'est deplace. m.col = { W, x0 (bord gauche du fond de la colonne), mainRight }.
// Le dessin entoure le texte de l'en-tete (`texteDroite` : son bord droit mesure) sans jamais le couper.
function _compoCalculerDroite(id, m) {
  var P = m.pageL || _COMPOSITIONS.PAGE_L, PH = m.pageH || _COMPOSITIONS.PAGE_H, H = Math.max(60, m.H || 170), C0 = m.couleur || '#1e3a5f', C = _compoLisible(C0);
  var x0 = _compoBorne(m.col.x0, 380, P - 150), W = P - x0, mainRight = typeof m.col.mainRight === 'number' ? m.col.mainRight : x0 - 8;
  var gauche = typeof m.gauche === 'number' ? m.gauche : 240, droiteMetier = typeof m.droiteMetier === 'number' ? m.droiteMetier : 300;
  var texteDroite = Math.max(gauche, droiteMetier);
  var topCorps = typeof m.topCorps === 'number' ? m.topCorps : H + 8;
  var bordG = typeof m.bordG === 'number' ? m.bordG : 38, bordD = typeof m.bordD === 'number' ? m.bordD : P - 38, basCorps = typeof m.basCorps === 'number' ? m.basCorps : PH - 200;
  var clair = _compoTeinte(C0, 0.85), moyen = _compoTeinte(C0, 0.62), tres = _compoTeinte(C0, 0.9), croise = _compoTeinte(C0, 0.45);
  var Z = [];
  var rect = function (x, y, w, h, fill, css, texte) { Z.push({ css: 'left:' + Math.round(x) + 'px;top:' + Math.round(y) + 'px;width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px;background:' + fill + ';' + (css || ''), fill: fill, texte: texte !== false, forme: { x: x, y: y, w: w, h: h } }); };
  if (id === 'equerre') {
    var t = _compoBorne(Math.min(16, bordG - 8, P - bordD - 8), 8, 16);
    Z.push({ css: 'left:0;top:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.34) + 'px;box-sizing:border-box;border-top:' + t + 'px solid ' + C0 + ';border-left:' + t + 'px solid ' + C0, fill: C0, texte: false, forme: null });
    if (basCorps <= PH - t - 8) { Z.push({ css: 'right:0;bottom:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.30) + 'px;box-sizing:border-box;border-bottom:' + t + 'px solid ' + C0 + ';border-right:' + t + 'px solid ' + C0, fill: C0, texte: false, forme: null }); }
  } else if (id === 'plaque') {
    // le titre du metier peut passer au-dessus de la colonne : la plaque couvre donc TOUTE la largeur de l'en-tete (un seul fond derriere le texte), la colonne commence juste dessous
    rect(18, 18, P - 36, H - 32, clair, 'border-radius:22px;', true);
    rect(x0, H - 14, W, PH - H + 14, C, '', true);
  } else if (id === 'diagonale') {
    // un bandeau dont le bord du bas est OBLIQUE (plus haut a droite) ; le texte de l'en-tete reste entierement sur la couleur, la colonne claire suit l'oblique
    var chute = _compoBorne(Math.min(60, H - (typeof m.basGauche === 'number' ? m.basGauche : H - 70) - 6), 0, 60), yo = function (x) { return H - chute * x / P; };
    // le titre du metier s'etend plus a droite que le nom : l'oblique doit passer sous le BAS du titre, a l'endroit ou le titre se termine (sinon ses lettres du bas sortent du bandeau, blanches sur blanc)
    if (typeof m.metierBas === 'number' && typeof m.droiteMetier === 'number' && m.droiteMetier > 0) { chute = _compoBorne(Math.min(chute, (H - m.metierBas - 6) * P / m.droiteMetier), 0, 60); }
    var bP = [[0, 0], [P, 0], [P, yo(P)], [0, yo(0)]], kP = [[x0, yo(x0)], [P, yo(P)], [P, PH], [x0, PH]];
    Z.push({ css: 'left:0;top:0;width:' + P + 'px;height:' + PH + 'px;background:' + C + ';clip-path:polygon(' + _compoPolyCss(bP) + ')', fill: C, texte: true, forme: { poly: bP } });
    Z.push({ css: 'left:0;top:0;width:' + P + 'px;height:' + PH + 'px;background:' + clair + ';clip-path:polygon(' + _compoPolyCss(kP) + ')', fill: clair, texte: true, forme: { poly: kP } });
  } else if (id === 'l') {
    var r = _compoBorne(Math.min(x0 - mainRight, topCorps - H) - 2, 0, 40);
    rect(0, 0, P, H, C, '', true);
    rect(x0, 0, W, PH, C, '', true);
    if (r >= 6) { Z.push({ css: 'left:' + Math.round(x0 - r - 2) + 'px;top:' + Math.round(H) + 'px;width:' + Math.round(r + 2) + 'px;height:' + Math.round(r + 2) + 'px;background:radial-gradient(circle at 0% 100%, transparent ' + (r + 1.4) + 'px, ' + C + ' ' + (r + 1.4) + 'px)', fill: C, texte: false, forme: null }); }
  } else if (id === 'volets') {
    rect(0, 0, P, H, moyen, '', true);
    rect(x0, 0, W, PH, tres, '', true);
    rect(x0, 0, W, H, croise, '', true);
  } else if (id === 'etiquette') {
    rect(0, 0, P, H, clair, '', true);
    rect(x0, H - 8, W - 26, PH - H - 26, C, 'border-radius:26px 26px 0 0;', true);
  } else if (id === 'carte') {
    var cy = H - 34, ch = PH - cy - 24;
    rect(0, 0, P, H, C, '', true);
    rect(x0 - 5, cy - 5, W - 24 + 10, ch + 10, '#ffffff', 'border-radius:27px;', false);
    rect(x0, cy, W - 24, ch, tres, 'border-radius:22px;', true);
  } else { return null; }
  return { zones: Z, blocs: {}, largeurMetier: null, ok: true, couleur: C };
}
// Le quart de cercle du coin haut droit (un polygone, pour savoir si un texte est dessus) : un quart de disque de centre le coin haut droit de la page et de rayon g
// (c'est ce que dessine `border-radius: 0 0 0 100%` sur une boite carree de cote g).
function _compoQuartPoly(P, g) {
  var pts = [[P, 0]];
  for (var j = 0; j <= 24; j++) { var b = (j / 24) * Math.PI / 2; pts.push([P - g * Math.cos(b), g * Math.sin(b)]); }
  return pts;
}

// ---- Mise sur la page (navigateur) ----
// Pose, derriere le texte, les zones d'une composition ; remplace la precedente. Sans identifiant, la page est laissee exactement comme elle etait.
function _compoNettoyer(pageEl) {
  var doc = pageEl.ownerDocument;
  Array.prototype.forEach.call(pageEl.querySelectorAll(':scope > .compo-z, :scope > .croi-z'), function (z) { z.remove(); });
  Array.prototype.forEach.call(doc.querySelectorAll('style[data-croi]'), function (st) { st.remove(); });
  Array.prototype.forEach.call(doc.querySelectorAll('style[data-compo]'), function (s) { s.remove(); });
  Array.prototype.forEach.call(pageEl.querySelectorAll('[data-compo-c]'), function (e) { e.style.removeProperty('color'); e.removeAttribute('data-compo-c'); e.classList.remove('compo-puce'); });
  Array.prototype.forEach.call(pageEl.querySelectorAll('[data-compo-t]'), function (e) { var o = e.getAttribute('data-compo-t'); e.style.removeProperty('display'); if (o && o !== '-') { e.style.setProperty('background', o); } else { e.style.removeProperty('background'); } e.removeAttribute('data-compo-t'); });
  Array.prototype.forEach.call(pageEl.querySelectorAll('[data-compo-p]'), function (e) { e.style.removeProperty('background'); e.removeAttribute('data-compo-p'); });
  pageEl.removeAttribute('data-compo');
}
// Mesures de la page reelle (px de la page). Jamais d'exception : null si la page n'a pas d'en-tete mesurable.
function _compoMesurer(pageEl) {
  var tete = pageEl.querySelector('.tete');
  if (!tete) { return null; }
  var doc = pageEl.ownerDocument, vue = doc.defaultView, pr = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1;
  var m = { pageL: pageEl.offsetWidth || _COMPOSITIONS.PAGE_L, pageH: pageEl.offsetHeight || _COMPOSITIONS.PAGE_H };
  m.H = Math.round((tete.getBoundingClientRect().bottom - pr.top) / k);
  if (!(m.H > 20)) { return null; }   // un en-tete vide (modele qui ne le dessine pas dans cette configuration) : aucune composition
  var v = vue.getComputedStyle(pageEl).getPropertyValue('--cv').trim();
  m.couleur = /^#[0-9a-fA-F]{6}$/.test(v) ? v : '#1e3a5f';
  var rects = function (el) {
    var out = [], w = doc.createTreeWalker(el, 4, null, false), n;
    while ((n = w.nextNode())) {
      if (!/\S/.test(n.nodeValue)) { continue; }
      var rg = doc.createRange(); rg.selectNodeContents(n);
      var rs = rg.getClientRects();
      for (var i = 0; i < rs.length; i++) { if (rs[i].width >= 1 && rs[i].height >= 1) { out.push({ x: (rs[i].left - pr.left) / k, r: (rs[i].right - pr.left) / k, y: (rs[i].top - pr.top) / k, b: (rs[i].bottom - pr.top) / k }); } }
    }
    return out;
  };
  var maxR = function (l) { return l.reduce(function (a, q) { return Math.max(a, q.r); }, -1); };
  var minL = function (l) { return l.reduce(function (a, q) { return Math.min(a, q.x); }, 1e9); };
  var gauche = []; Array.prototype.forEach.call(tete.querySelectorAll('.nom, .coord'), function (e) { gauche = gauche.concat(rects(e)); });
  var met = []; Array.prototype.forEach.call(tete.querySelectorAll('.metier'), function (e) { met = met.concat(rects(e)); });
  if (gauche.length) { m.gauche = Math.round(maxR(gauche)); m.basGauche = Math.round(gauche.reduce(function (a, q) { return Math.max(a, q.b); }, 0)); }
  if (met.length) { m.droite = Math.round(minL(met)); m.droiteMetier = Math.round(maxR(met)); m.metierHaut = Math.round(met.reduce(function (a, q) { return Math.min(a, q.y); }, 1e9)); m.metierBas = Math.round(met.reduce(function (a, q) { return Math.max(a, q.b); }, 0)); }
  // le corps du CV : tout ce qui suit l'en-tete (sans le calque des formes, ni nos zones)
  var suivant = tete.nextElementSibling;
  while (suivant && suivant.matches && suivant.matches('.formes-deco, .compo-z, .marque-page, .tete-hors')) { suivant = suivant.nextElementSibling; }
  if (suivant) { m.topCorps = Math.round((suivant.getBoundingClientRect().top - pr.top) / k); }
  var corps = [];
  Array.prototype.forEach.call(pageEl.children, function (e) { if (e === tete || (e.matches && e.matches('.formes-deco, .compo-z, .marque-page, .tete-hors, .forme-deco-edition, .poignees-cv, script, style'))) { return; } corps = corps.concat(rects(e)); });
  corps = corps.filter(function (q) { return q.y < m.pageH; });
  // CV a deux colonnes : la colonne est la plus etroite des deux colonnes du corps ; elle doit etre a GAUCHE (une colonne a droite n'a pas de composition pour l'instant).
  var cols = pageEl.querySelector('.corps.deux');
  if (cols && cols.children.length === 2) {
    var a = cols.children[0].getBoundingClientRect(), b = cols.children[1].getBoundingClientRect();
    var etroite = a.width <= b.width ? a : b, large = a.width <= b.width ? b : a;
    if (etroite.width > 40 && ((etroite.left + etroite.right) / 2 - pr.left) / k < m.pageL / 2) { m.col = { W: Math.round((etroite.right - pr.left) / k + 7), mainLeft: Math.round((large.left - pr.left) / k) }; }
    else if (etroite.width > 40) { m.col = { droite: true, x0: Math.round((etroite.left - pr.left) / k) - 8, W: 0, mainRight: Math.round((large.right - pr.left) / k) }; m.col.W = m.pageL - m.col.x0; }
  }
  if (corps.length) { m.bordG = Math.round(minL(corps)); m.bordD = Math.round(maxR(corps)); m.basCorps = Math.round(corps.reduce(function (a, q) { return Math.max(a, q.b); }, 0)); }
  return m;
}
var _COMPO_STYLE_BASE = '.cv .tete{background:none !important;border:0 !important;box-shadow:none !important;position:relative}.cv .tete::before,.cv .tete::after,.cv::before,.cv .tete-fond:not(.tete),.cv .tete-hors{display:none !important}' +
  '.cv > *:not(.tete):not(.formes-deco):not(.compo-z):not(.forme-deco-edition):not(.marque-page){position:relative;z-index:2}.cv .tete > *{position:relative;z-index:2}.cv .tete > .poi-h{position:absolute}.cv .compo-puce::before{background-color:currentColor !important}';
// Colore le texte (blanc ou sombre) d'apres le fond reellement derriere lui : zones posees, puis fonds des elements qui le portent. `etendu` : toute la page (deux colonnes) ; sinon l'en-tete seulement.
// Partagee par les compositions et par les reglages du croisement bandeau et colonne.
function _compoColorier(pageEl, zones, etendu) {
  var doc = pageEl.ownerDocument, vue = doc.defaultView, tete = pageEl.querySelector('.tete');
  var pr = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1;
  var dessin = { zones: zones };
  var racineTexte = etendu ? pageEl : tete;
  // Le fond reellement derriere un texte : la zone (ou le papier), puis les fonds des elements qui le portent (carte, pastille), du plus exterieur au plus interieur, composes un a un.
  // Un fond translucide (carte claire posee sur une colonne foncee) donne donc une couleur claire : le texte est sombre, jamais blanc sur gris clair (retour de Denis, 2026-10-22).
  var fondEffectif = function (el, base, surpastille) {
    var chaine = []; for (var e = el; e && e !== pageEl; e = e.parentElement) { chaine.unshift(e); }
    var f = base;
    chaine.forEach(function (e) {
      var css = vue.getComputedStyle(e).backgroundColor;
      if (surpastille && e.classList && e.classList.contains('pill')) { css = surpastille; }
      f = _compoComposer(f, css);
    });
    return f;
  };
  var marcheur = doc.createTreeWalker(racineTexte, 4, null, false), n, vus = [];
  while ((n = marcheur.nextNode())) {
    if (!/\S/.test(n.nodeValue)) { continue; }
    var p = n.parentElement; if (!p || p.closest('.compo-z, .croi-z, .formes-deco, .forme-deco-edition, .marque-page, .poignees-cv, .poi-l, .poi-h, .tete-hors, script, style')) { continue; }
    var dansTete = tete.contains(p);
    var rg = doc.createRange(); rg.selectNodeContents(n); var q = rg.getBoundingClientRect(); if (q.width < 1) { continue; }
    var x = ((q.left + q.right) / 2 - pr.left) / k, y = ((q.top + q.bottom) / 2 - pr.top) / k;
    var zone = _compoZoneEn(dessin.zones, x, y);
    if (!dansTete) {
      // texte du corps : seulement sur une zone, ou s'il est BLANC sur le papier (texte de colonne foncee d'origine)
      var cr = _compoCssRgba(vue.getComputedStyle(p).color) || [0, 0, 0, 1];
      var claireOrigine = (0.2126 * cr[0] + 0.7152 * cr[1] + 0.0722 * cr[2]) / 255 > 0.75;
      if (!zone && !claireOrigine) { continue; }
    }
    // un texte a cheval sur deux zones prend la couleur qui se lit sur la plus sombre des deux : on teste aussi ses deux bouts
    var bases = [_compoFondEn(dessin.zones, x, y), _compoFondEn(dessin.zones, (q.left - pr.left) / k + 1, y), _compoFondEn(dessin.zones, (q.right - pr.left) / k - 1, y)];
    var fonds = bases.map(function (b) { return fondEffectif(p, b, _compoLuminance(b) < 0.4 ? 'rgba(255,255,255,.18)' : 'rgba(31,41,51,.08)'); });
    var plusSombre = fonds.reduce(function (a, f) { return _compoLuminance(f) < _compoLuminance(a) ? f : a; }, fonds[0]);
    var couleur = fonds.every(function (f) { return _compoLuminance(f) > 0.5; }) ? _COMPOSITIONS.SOMBRE : _compoCouleurTexte(plusSombre);
    vus.push({ p: p, c: couleur, zone: zone, baseSombre: _compoLuminance(bases[0]) < 0.4 });
  }
  vus.forEach(function (o) {
    o.p.style.setProperty('color', o.c, 'important'); o.p.setAttribute('data-compo-c', '1');
    // pastille de competence : son fond suit la zone (clair translucide sur fond sombre, sombre translucide sur fond clair)
    var pil = o.p.closest && o.p.closest('.pill');
    if (pil && o.zone) { pil.style.setProperty('background', o.baseSombre ? 'rgba(255,255,255,.18)' : 'rgba(31,41,51,.08)', 'important'); pil.setAttribute('data-compo-p', '1'); }
    // petite puce pleine devant une ligne de coordonnees : elle suit la couleur du texte (la couleur est posee sur la ligne elle-meme, la puce est son pseudo-element)
    var ligne = o.p.closest && o.p.closest('.coord div, .coord > *');
    if (ligne) {
      ligne.style.setProperty('color', o.c, 'important'); ligne.setAttribute('data-compo-c', '1');
      var b = vue.getComputedStyle(ligne, '::before');
      if (b && b.content && b.content !== 'none' && b.backgroundColor && !/^rgba\(.*,\s*0\)$/.test(b.backgroundColor) && b.backgroundColor !== 'transparent' && (!b.backgroundImage || b.backgroundImage === 'none')) { ligne.classList.add('compo-puce'); }
    }
  });
}
function _compoPoser(pageEl, id, optionTrait) {
  if (!pageEl || !pageEl.querySelector) { return; }
  _compoNettoyer(pageEl);
  id = _compoNormaliser(id);
  if (!id) { return; }
  var m = _compoMesurer(pageEl); if (!m) { return; }
  var dessin = _compoCalculer(id, m); if (!dessin) { return; }
  var doc = pageEl.ownerDocument, vue = doc.defaultView;
  if (vue.getComputedStyle(pageEl).position === 'static') { pageEl.style.position = 'relative'; }
  var st = doc.createElement('style'); st.setAttribute('data-compo', id);
  st.textContent = _COMPO_STYLE_BASE + (m.col ? '.cv .corps.deux > *{background:none !important;box-shadow:none !important}' : '') + (dessin.largeurMetier ? '.cv .blc[data-bl="metier"]{width:' + Math.round(dessin.largeurMetier) + 'px !important}' : '');
  if (dessin.blocs && dessin.blocs.metier) { st.textContent += '.cv .blc[data-bl="metier"]{left:' + dessin.blocs.metier.left + 'px !important;width:' + dessin.blocs.metier.width + 'px !important}'; }
  doc.head.appendChild(st);
  var avant = pageEl.firstChild;   // les zones se posent DANS L'ORDRE du dessin (la derniere est dessinee par-dessus les autres)
  dessin.zones.forEach(function (z) {
    var e = doc.createElement('div'); e.className = 'compo-z'; e.setAttribute('aria-hidden', 'true'); e.setAttribute('data-texte', z.texte ? '1' : '0');
    e.style.cssText = 'position:absolute;z-index:1;pointer-events:none;' + z.css;
    pageEl.insertBefore(e, avant);
  });
  pageEl.setAttribute('data-compo', id);
  // Couleur du texte : blanc ou sombre selon le fond reellement derriere chaque morceau de texte (l'en-tete ; avec deux colonnes, toute la page, sauf le texte qui a son propre fond : cartes, pastilles).
  var tete = pageEl.querySelector('.tete'), pr = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1;
  // le trait sous l'en-tete : jamais de la couleur du bandeau qui est juste au-dessus
  var trait = pageEl.querySelector(':scope > .trait'), choixTrait = _compoTraitNormaliser(optionTrait);
  if (trait && choixTrait === 'aucun') {
    trait.setAttribute('data-compo-t', trait.style.getPropertyValue('background') || '-');
    trait.style.setProperty('display', 'none', 'important');
  } else if (trait && (choixTrait === 'gris' || choixTrait === 'cv')) {
    trait.setAttribute('data-compo-t', trait.style.getPropertyValue('background') || '-');
    trait.style.setProperty('background', choixTrait === 'gris' ? '#b8bdc7' : dessin.couleur, 'important');
  } else if (trait) {
    var rt = trait.getBoundingClientRect(), fondDessus = _compoFondEn(dessin.zones, ((rt.left + rt.right) / 2 - pr.left) / k, (rt.top - pr.top) / k - 3);
    if (fondDessus !== '#ffffff') {
      var actuelle = _compoCssVersHex(vue.getComputedStyle(trait).backgroundColor);
      if (!actuelle || _compoContraste(actuelle, fondDessus) < 2.2) {
        trait.setAttribute('data-compo-t', trait.style.getPropertyValue('background') || '-');
        trait.style.setProperty('background', _compoCouleurTrait(fondDessus, dessin.couleur), 'important');
      }
    }
  }
  _compoColorier(pageEl, dessin.zones, !!m.col);
}

// ============================================================
// CROISEMENT DU BANDEAU ET DE LA COLONNE (Denis, 2026-10-22 ; maquette docs/MAQUETTE_BANDEAU_ET_COLONNE_FUSION_2026-10-22.html)
// Pour « Comme aujourd'hui » seulement (aucune composition choisie), sur un CV a deux colonnes dont le bandeau a un fond propre ET dont la colonne est dessinee
// (modele a bandeau et colonne, formes droites) : couleurs (chacune la sienne ou la meme), qui est devant (le bandeau ou la colonne), angle au croisement (droit ou arrondi, une seule taille), lisere blanc.
// Sans aucun choix, la page n'est JAMAIS modifiee. Le texte se colore d'apres le fond reel (meme moteur que les compositions).
// ============================================================
// Un choix venu de n'importe ou : seules les valeurs qui changent quelque chose sont gardees ({} = rien).
function _croisementNormaliser(o) {
  var r = {};
  if (!o || typeof o !== 'object') { return r; }
  if (o.meme === 'oui') { r.meme = 'oui'; }
  if (o.devant === 'colonne') { r.devant = 'colonne'; }
  if (o.angle === 'arrondi') { r.angle = 'arrondi'; }
  if (o.lisere === true) { r.lisere = true; }
  return r;
}
function _croisementActif(o) { var r = _croisementNormaliser(o); return !!(r.meme || r.devant || r.angle || r.lisere); }
// Le rayon qu'un angle arrondi peut avoir sans toucher le texte (une seule taille pour tous, 28 px au plus).
function _croisementRayon(m) { return Math.min(28, (typeof m.mainLeft === 'number' ? m.mainLeft - m.W : 28), (typeof m.topCorps === 'number' ? m.topCorps - m.H : 28)) - 2; }
// Calcule, pour des mesures et un choix, ce qu'il faut poser. m : { pageL, pageH, H, W, mainLeft, topCorps, bandeauHex, bandeauCss, colonneHex, colonneCss, rayon, pale }.
// Rend { style (feuille de style), zones : [{ css }], zonesTexte : [{ fill, texte, forme }], coin : rayon du coin ou 0 }.
function _croisementCalculer(o, m) {
  o = _croisementNormaliser(o);
  var P = m.pageL || _COMPOSITIONS.PAGE_L, PH = m.pageH || _COMPOSITIONS.PAGE_H, H = m.H, W = m.W;
  var meme = o.meme === 'oui', colonneDevant = o.devant === 'colonne' && !meme;
  var coulCol = meme ? m.bandeauHex : m.colonneHex;
  var style = '';
  if (meme) { style += '.cv.col-vague-g::before,.cv.col-vague-d::before{background:' + m.bandeauCss + ' !important}'; }
  if (colonneDevant || o.angle || o.lisere || meme) {
    style += '.cv > *:not(.tete):not(.formes-deco):not(.croi-z):not(.compo-z):not(.forme-deco-edition):not(.marque-page){position:relative;z-index:2}.cv .tete{position:relative}.cv .tete > *{position:relative;z-index:2}.cv .tete > .poi-h{position:absolute}.cv .compo-puce::before{background-color:currentColor !important}';
  }
  if (colonneDevant) {
    style += '.cv.col-vague-g::before,.cv.col-vague-d::before{z-index:1 !important}';
    if (!m.pale) { style += '.cv .tete-fond{background:none !important}.cv .tete-fond::before{content:"";position:absolute;inset:0;z-index:0;background:' + m.bandeauCss + ';border-radius:' + (m.rayon || '0') + '}'; }
  }
  var zones = [], coin = 0;
  var avant = (colonneDevant || meme) ? coulCol : m.bandeauHex, avantCss = (colonneDevant || meme) ? (meme ? m.bandeauCss : m.colonneCss) : m.bandeauCss;
  if (o.angle === 'arrondi') {
    var libre = _croisementRayon(m);
    coin = libre >= 8 ? Math.round(libre) : 0;
    if (coin) { zones.push({ css: 'left:' + Math.round(W) + 'px;top:' + Math.round(H) + 'px;width:' + (coin + 2) + 'px;height:' + (coin + 2) + 'px;background:radial-gradient(circle at 100% 100%, transparent ' + (coin + 1.4) + 'px, ' + (/gradient/.test(avantCss) ? avant : avantCss) + ' ' + (coin + 1.4) + 'px);z-index:3' }); }
  }
  if (o.lisere) { zones.push({ css: colonneDevant ? 'left:' + Math.round(W - 3) + 'px;top:0;width:3px;height:' + Math.round(H) + 'px;background:#ffffff;z-index:3' : 'left:0;top:' + Math.round(H - 3) + 'px;width:' + Math.round(W) + 'px;height:3px;background:#ffffff;z-index:3' }); }
  var bande = { fill: m.bandeauHex, texte: true, forme: { x: 0, y: 0, w: P, h: H } }, colonne = { fill: coulCol, texte: true, forme: { x: 0, y: 0, w: W, h: PH } };
  return { style: style, zones: zones, zonesTexte: colonneDevant ? [bande, colonne] : [colonne, bande], coin: coin };
}
function _croisementNettoyer(pageEl) {
  var doc = pageEl.ownerDocument;
  Array.prototype.forEach.call(pageEl.querySelectorAll(':scope > .croi-z'), function (z) { z.remove(); });
  Array.prototype.forEach.call(doc.querySelectorAll('style[data-croi]'), function (st) { st.remove(); });
}
// Mesures de la page pour le croisement, ou null quand le CV ne s'y prete pas (une colonne, colonne a droite, colonne non dessinee, bandeau sans fond propre).
function _croisementMesurer(pageEl) {
  var tete = pageEl.querySelector('.tete');
  if (!tete || !pageEl.classList.contains('deux-col') || !pageEl.classList.contains('col-vague-g')) { return null; }
  var doc = pageEl.ownerDocument, vue = doc.defaultView, pr = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1;
  var pcol = vue.getComputedStyle(pageEl, '::before');
  if (pcol.display === 'none' || !(parseFloat(pcol.width) > 60)) { return null; }
  var m = { pageL: pageEl.offsetWidth || _COMPOSITIONS.PAGE_L, pageH: pageEl.offsetHeight || _COMPOSITIONS.PAGE_H };
  m.W = Math.round((parseFloat(pcol.left) || 0) + parseFloat(pcol.width));
  m.H = Math.round((tete.getBoundingClientRect().bottom - pr.top) / k);
  if (!(m.H > 20)) { return null; }
  m.pale = /tete-vague|tete-diag|tete-pale/.test(tete.className);
  var fs = m.pale ? vue.getComputedStyle(tete, '::before') : vue.getComputedStyle(tete);
  m.rayon = vue.getComputedStyle(tete).borderRadius;
  var cb = _compoCssRgba(fs.backgroundColor), imageB = fs.backgroundImage && fs.backgroundImage !== 'none' ? fs.backgroundImage : '';
  if (!imageB && (!cb || cb[3] < 0.5)) { return null; }   // le bandeau n'a pas de fond propre : rien a croiser
  var ccol = _compoCssRgba(pcol.backgroundColor);
  if (!ccol || ccol[3] < 0.5) { return null; }   // colonne non coloree
  var premier = imageB ? (/rgba?\([^)]*\)|color\([^)]*\)/.exec(imageB) || [''])[0] : '';
  m.bandeauHex = _compoCssVersHex(cb && cb[3] >= 0.5 ? fs.backgroundColor : premier) || '#1e3a5f';
  m.bandeauCss = imageB || fs.backgroundColor;
  m.colonneHex = _compoCssVersHex(pcol.backgroundColor) || '#dde4f0'; m.colonneCss = pcol.backgroundColor;
  var cols = pageEl.querySelector('.corps.deux');
  if (cols && cols.children.length === 2) {
    var a = cols.children[0].getBoundingClientRect(), b = cols.children[1].getBoundingClientRect(), large = a.width <= b.width ? b : a;
    m.mainLeft = Math.round((large.left - pr.left) / k);
  }
  var suivant = tete.nextElementSibling;
  while (suivant && suivant.matches && suivant.matches('.formes-deco, .compo-z, .croi-z, .marque-page, .tete-hors, .trait')) { suivant = suivant.nextElementSibling; }
  if (suivant) { m.topCorps = Math.round((suivant.getBoundingClientRect().top - pr.top) / k); }
  m.coinPossible = _croisementRayon(m) >= 8;   // un angle arrondi visible demande de la place : sinon le choix est masque
  return m;
}
// Pose le croisement sur la page (remplace le precedent). Sans choix, ou sans mesure possible : rien n'est modifie.
function _croisementPoser(pageEl, opts) {
  if (!pageEl || !pageEl.querySelector) { return; }
  _compoNettoyer(pageEl);   // nettoie aussi les couleurs de texte posees avant
  var o = _croisementNormaliser(opts);
  if (!_croisementActif(o)) { return; }
  var m = _croisementMesurer(pageEl); if (!m) { return; }
  var plan = _croisementCalculer(o, m), doc = pageEl.ownerDocument;
  if (doc.defaultView.getComputedStyle(pageEl).position === 'static') { pageEl.style.position = 'relative'; }
  var st = doc.createElement('style'); st.setAttribute('data-croi', '1'); st.textContent = plan.style; doc.head.appendChild(st);
  plan.zones.forEach(function (z) { var e = doc.createElement('div'); e.className = 'croi-z'; e.setAttribute('aria-hidden', 'true'); e.style.cssText = 'position:absolute;pointer-events:none;' + z.css; pageEl.appendChild(e); });
  pageEl.setAttribute('data-croi', '1'); pageEl.setAttribute('data-croi-coin', m.coinPossible ? '1' : '0');
  _compoColorier(pageEl, plan.zonesTexte, true);
}

// ============================================================
// DECOR AJOUTE (Denis, 2026-10-22 ; maquette docs/MAQUETTE_DECOR_AJOUTE_2026-10-22.html, tous les decors gardes)
// Un decor pose PAR-DESSUS le modele tel qu'il est (son bandeau et sa colonne restent) : equerre, ruban, quarts de cercle, plaque sur le titre. Avec « Comme aujourd'hui » seulement
// (une composition remplace deja le bandeau et la colonne). Couleur : automatique (teinte moyenne, visible sur le fonce comme sur le blanc), couleur du CV, gris.
// Regles : jamais sur le texte du corps du CV, jamais de la couleur de ce qu'il y a derriere (automatique), le texte pose sur la plaque se lit toujours.
// ============================================================
var _DECORS = {
  LISTE: [{ id: 'equerre', nom: 'Équerre' }, { id: 'ruban', nom: 'Ruban' }, { id: 'quarts', nom: 'Quarts de cercle' }, { id: 'plaque', nom: 'Plaque sur le titre' }],
  COULEURS: [{ id: '', nom: 'Automatique' }, { id: 'cv', nom: 'Couleur du CV' }, { id: 'gris', nom: 'Gris' }]
};
function _decorNormaliser(o) {
  var r = {};
  if (!o || typeof o !== 'object') { return r; }
  var ok = _DECORS.LISTE.some(function (d) { return d.id === o.id; });
  if (!ok) { return r; }
  r.id = o.id;
  if (o.couleur === 'cv' || o.couleur === 'gris') { r.couleur = o.couleur; }
  return r;
}
function _decorActif(o) { return !!_decorNormaliser(o).id; }
// La couleur du decor ; `fondHex` (la couleur du bandeau derriere, si on la connait) : un decor automatique n'est jamais de cette couleur-la.
function _decorCouleur(couleur, C0, fondHex) {
  var D = couleur === 'cv' ? C0 : (couleur === 'gris' ? '#b8bdc7' : _compoMelanger(C0, 0.5));
  if (!couleur && fondHex && _compoContraste(D, fondHex) < 1.6) { D = _compoMelanger(C0, 0.82); }
  return D;
}
// Calcule le decor. m : mesures de la page (voir _compoMesurer, + fondHex facultatif). Rend { zones : [{ css }], largeurMetier, plaque : { x, y, w, h } ou null } ; null si le decor n'existe pas ou ne peut pas se poser.
function _decorCalculer(o, m) {
  o = _decorNormaliser(o);
  if (!o.id) { return null; }
  var P = m.pageL || _COMPOSITIONS.PAGE_L, PH = m.pageH || _COMPOSITIONS.PAGE_H, H = Math.max(60, m.H || 214), C0 = m.couleur || '#1e3a5f';
  var topCorps = typeof m.topCorps === 'number' ? m.topCorps : H + 40;
  var bordG = typeof m.bordG === 'number' ? m.bordG : 38, bordD = typeof m.bordD === 'number' ? m.bordD : P - 38, basCorps = typeof m.basCorps === 'number' ? m.basCorps : PH - 200;
  var ov = _compoBorne(Math.round(topCorps - H - 6), 0, 34);
  var D = _decorCouleur(o.couleur, C0, m.fondHex), zones = [], largeurMetier = null, plaque = null;
  if (o.id === 'equerre') {
    var t = _compoBorne(Math.min(16, bordG - 8, P - bordD - 8), 8, 16);
    zones.push({ css: 'left:0;top:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.34) + 'px;box-sizing:border-box;border-top:' + t + 'px solid ' + D + ';border-left:' + t + 'px solid ' + D });
    if (basCorps <= PH - t - 8) { zones.push({ css: 'right:0;bottom:0;width:' + Math.round(P * 0.58) + 'px;height:' + Math.round(PH * 0.30) + 'px;box-sizing:border-box;border-bottom:' + t + 'px solid ' + D + ';border-right:' + t + 'px solid ' + D }); }
  } else if (o.id === 'ruban') {
    var rx = P - 126, qa = Math.min(26, 12 + ov * 0.4);
    zones.push({ css: 'left:' + rx + 'px;top:0;width:76px;height:' + Math.round(H + ov) + 'px;background:' + D + ';clip-path:polygon(0 0,100% 0,100% 100%,50% calc(100% - ' + Math.round(qa) + 'px),0 100%)' });
    if (typeof m.droiteMetier === 'number' && m.droiteMetier > rx - 18) { largeurMetier = Math.max(120, rx - 18 - (typeof m.droite === 'number' ? m.droite : 300)); }
  } else if (o.id === 'quarts') {
    // m.gMax : le plus grand rayon qui laisse libre tout le texte de l'en-tete (mesure du navigateur) ; sous 44 px, il n'y a pas la place : pas de decor
    var g = Math.min(240, H + ov, typeof m.gMax === 'number' ? m.gMax : 240);
    if (g < 44) { return null; }
    var p2 = Math.round(g * 0.625), B = o.couleur === 'gris' ? '#8a909c' : C0;
    zones.push({ css: 'left:' + (P - g) + 'px;top:0;width:' + g + 'px;height:' + g + 'px;background:' + _compoMelanger(B, 0.72) + ';border-radius:0 0 0 100%' });
    zones.push({ css: 'left:' + (P - p2) + 'px;top:0;width:' + p2 + 'px;height:' + p2 + 'px;background:' + _compoMelanger(B, 0.5) + ';border-radius:0 0 0 100%' });
  } else if (o.id === 'plaque') {
    if (typeof m.droite !== 'number' || typeof m.droiteMetier !== 'number' || typeof m.metierHaut !== 'number' || typeof m.metierBas !== 'number') { return null; }   // pas de titre de metier : pas de plaque
    var x0 = Math.max(8, m.droite - 24), y0 = Math.max(8, m.metierHaut - 14), w = Math.min(P - 16 - x0, m.droiteMetier - m.droite + 48), h = m.metierBas - m.metierHaut + 28;
    plaque = { x: x0, y: y0, w: w, h: h };
    zones.push({ css: 'left:' + Math.round(x0) + 'px;top:' + Math.round(y0) + 'px;width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px;background:' + _compoTeinte(C0, 0.85) + ';border-radius:22px' });
  }
  return { zones: zones, largeurMetier: largeurMetier, plaque: plaque, couleur: D };
}
function _decorNettoyer(pageEl) {
  var doc = pageEl.ownerDocument;
  Array.prototype.forEach.call(pageEl.querySelectorAll(':scope > .deco-z'), function (z) { z.remove(); });
  Array.prototype.forEach.call(doc.querySelectorAll('style[data-deco]'), function (st) { st.remove(); });
  Array.prototype.forEach.call(pageEl.querySelectorAll('[data-deco-c]'), function (e) { e.style.removeProperty('color'); e.removeAttribute('data-deco-c'); });
  pageEl.removeAttribute('data-deco');
}
// Le plus grand rayon de quarts de cercle (centre : coin haut droit de la page) qui laisse libres toutes les lignes de texte de l'en-tete (rectangles en px de la page, une marge de 8 px).
function _decorRayonLibre(rects, P) {
  var g = 240;
  rects.forEach(function (r) {
    var dx = P - Math.min(r.r, P), dy = Math.max(r.t, 0);
    g = Math.min(g, Math.sqrt(dx * dx + dy * dy) - 8);
  });
  return g;
}
// Les rectangles (px de la page) des lignes de texte de l'en-tete.
function _decorTextesTete(pageEl, tete) {
  var doc = pageEl.ownerDocument, pr = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1, res = [];
  var marcheur = doc.createTreeWalker(tete, 4, null, false), n;
  while ((n = marcheur.nextNode())) {
    if (!/\S/.test(n.nodeValue)) { continue; }
    var p = n.parentElement; if (!p || p.closest('.poi-l, .poi-h, .tete-hors, script, style')) { continue; }
    var rg = doc.createRange(); rg.selectNodeContents(n);
    Array.prototype.forEach.call(rg.getClientRects(), function (q) { if (q.width >= 1 && q.height >= 1) { res.push({ l: (q.left - pr.left) / k, t: (q.top - pr.top) / k, r: (q.right - pr.left) / k, b: (q.bottom - pr.top) / k }); } });
  }
  return res;
}
// Pose le decor sur la page (remplace le precedent). Sans choix, ou sans mesure possible : rien n'est modifie.
function _decorPoser(pageEl, opts) {
  if (!pageEl || !pageEl.querySelector) { return; }
  _decorNettoyer(pageEl);
  var o = _decorNormaliser(opts);
  if (!o.id) { return; }
  var m = _compoMesurer(pageEl); if (!m) { return; }
  var doc = pageEl.ownerDocument, vue = doc.defaultView, tete = pageEl.querySelector('.tete');
  var fondTete = _compoCssRgba(vue.getComputedStyle(tete).backgroundColor);
  if (fondTete && fondTete[3] >= 0.5) { m.fondHex = _compoHex(fondTete.slice(0, 3)); }
  if (o.id === 'quarts') { m.gMax = _decorRayonLibre(_decorTextesTete(pageEl, tete), m.pageL || _COMPOSITIONS.PAGE_L); }   // les quarts de cercle ne passent jamais sous le texte de l'en-tete
  var dessin = _decorCalculer(o, m); if (!dessin || !dessin.zones.length) { return; }
  if (vue.getComputedStyle(pageEl).position === 'static') { pageEl.style.position = 'relative'; }
  var st = doc.createElement('style'); st.setAttribute('data-deco', o.id);
  st.textContent = '.cv > *:not(.tete):not(.compo-z):not(.croi-z):not(.deco-z):not(.formes-deco):not(.forme-deco-edition):not(.marque-page){position:relative;z-index:2}.cv .tete{position:relative}.cv .tete > *{position:relative;z-index:2}.cv .tete > .poi-h{position:absolute}' +
    (dessin.largeurMetier ? '.cv .blc[data-bl="metier"]{width:' + Math.round(dessin.largeurMetier) + 'px !important}' : '');
  doc.head.appendChild(st);
  var avant = pageEl.firstChild;
  dessin.zones.forEach(function (z) { var e = doc.createElement('div'); e.className = 'deco-z'; e.setAttribute('aria-hidden', 'true'); e.style.cssText = 'position:absolute;z-index:1;pointer-events:none;' + z.css; pageEl.insertBefore(e, avant); });
  pageEl.setAttribute('data-deco', o.id);
  // le texte pose sur la plaque claire est sombre (le titre blanc d'un bandeau foncé deviendrait illisible)
  if (dessin.plaque) {
    var pr = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1, pl = dessin.plaque;
    var marcheur = doc.createTreeWalker(tete, 4, null, false), n;
    while ((n = marcheur.nextNode())) {
      if (!/\S/.test(n.nodeValue)) { continue; }
      var p = n.parentElement; if (!p || p.closest('.poi-l, .poi-h, .tete-hors, script, style')) { continue; }
      var rg = doc.createRange(); rg.selectNodeContents(n); var q = rg.getBoundingClientRect(); if (q.width < 1) { continue; }
      var x = ((q.left + q.right) / 2 - pr.left) / k, y = ((q.top + q.bottom) / 2 - pr.top) / k;
      if (x >= pl.x && x <= pl.x + pl.w && y >= pl.y && y <= pl.y + pl.h) { p.style.setProperty('color', _COMPOSITIONS.SOMBRE, 'important'); p.setAttribute('data-deco-c', '1'); }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _COMPOSITIONS: _COMPOSITIONS, _compoStyle: _compoStyle, _compoNormaliser: _compoNormaliser, _compoListePour: _compoListePour, _compoModeleExclu: _compoModeleExclu,
    _compoMelanger: _compoMelanger, _compoLisible: _compoLisible, _compoTeinte: _compoTeinte, _compoLuminance: _compoLuminance, _compoContraste: _compoContraste, _compoCouleurTexte: _compoCouleurTexte,
    _DECORS: _DECORS, _decorRayonLibre: _decorRayonLibre, _decorNormaliser: _decorNormaliser, _decorActif: _decorActif, _decorCouleur: _decorCouleur, _decorCalculer: _decorCalculer, _croisementNormaliser: _croisementNormaliser, _croisementActif: _croisementActif, _croisementCalculer: _croisementCalculer, _compoCssRgba: _compoCssRgba, _compoComposer: _compoComposer, _COMPO_TRAITS: _COMPO_TRAITS, _compoTraitNormaliser: _compoTraitNormaliser, _compoCouleurTrait: _compoCouleurTrait, _compoCssVersHex: _compoCssVersHex, _compoDansForme: _compoDansForme, _compoFondEn: _compoFondEn, _compoZoneEn: _compoZoneEn, _compoCalculer: _compoCalculer, _compoQuartPoly: _compoQuartPoly
  };
}
