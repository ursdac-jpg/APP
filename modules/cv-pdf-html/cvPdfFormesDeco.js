/* ============================================================
   cvPdfFormesDeco.js : FORMES DECORATIVES transparentes sur la page du CV (Denis, 2026-10-20, chantier
   docs/CHANTIER_NOUVEAUX_MODELES_ET_OPTIONS_CV_2026-10-20.md, tache A2 ; maquette docs/MAQUETTE_OPTIONS_ET_FORMES_CV_2026-10-20.html)
   ------------------------------------------------------------
   Un calque de 1 a 7 formes (rond, anneau, demi-rond, triangle, lame effilee, bande oblique, ovale, pilule, rectangle arrondi, losange, hexagone, points,
   hachures), posees sur la page du CV, TRANSPARENTES : le texte reste lisible par-dessus (melange « multiplier » et plafond de transparence, comme le coin colore).
   Valable pour TOUS les modeles : le calque s'ajoute a la page deja construite, jamais dans un gabarit. Les formes se placent dans une zone (dont « Autour du metier »),
   ou LIBREMENT (fractions de la page : meme resultat a l'ecran, en PDF et sur les miniatures) ; les formes etirables (ovale, pilule...) se deforment a la main.
   Une seule source : les regles (catalogue, geometrie, rendu) sont ici, utilisees par l'apercu du CV (iframe), les miniatures de la galerie
   et l'edition a la main. Les parties sans page (normaliser, geometrie, html) sont pures : testees en Node (tests/formesDeco.test.js).
   Le Word ne les reproduit pas : le calque est ignore par l'extracteur (modules/cv-word/wordExtracteur.js) et un message le dit
   (modules/cv-word/limitesWord.js).
   ============================================================ */
var _FORMES_DECO = {
  MAX: 7,   // jusqu'a sept formes (demande de Denis, 2026-10-20) : une personne peut en poser une par rubrique ; le style aleatoire, lui, n'en tire jamais autant
  PAGE_L: 794, PAGE_H: 1123,
  // `w` : largeur de la forme en multiple de la taille choisie ; `ratio` : hauteur / largeur ; `miroir` : le dessin est oriente (coin, lame) et se retourne dans les zones de droite ;
  // `etirable` : largeur et hauteur se reglent separement (ovale, pilule...) ; `svg` (dessin a l'echelle de la boite) ou `css` (fond et arrondis) ; `ico` : la petite image du bouton.
  FORMES: [
    { id: 'rond', nom: 'Rond', w: 1, ratio: 1, vb: '0 0 100 100', svg: '<circle cx="50" cy="50" r="50" fill="currentColor"/>', ico: '<circle cx="50" cy="30" r="28" fill="currentColor"/>' },
    { id: 'anneau', nom: 'Anneau', w: 1, ratio: 1, sansContour: true, vb: '0 0 100 100', svg: '<circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="14"/>', ico: '<circle cx="50" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="9"/>' },
    { id: 'demi', nom: 'Demi-rond', w: 1, ratio: 0.5, vb: '0 0 100 50', svg: '<path d="M0 50A50 50 0 0 1 100 50Z" fill="currentColor"/>', ico: '<path d="M18 50A32 32 0 0 1 82 50Z" fill="currentColor"/>' },
    { id: 'triangle', nom: 'Triangle', w: 1, ratio: 1, vb: '0 0 100 100', svg: '<polygon points="0,0 100,0 0,100" fill="currentColor"/>', ico: '<polygon points="28,4 80,4 28,56" fill="currentColor"/>', miroir: true },
    { id: 'lame', nom: 'Lame effilée', w: 2.6, ratio: 0.1, sansContour: true, vb: '0 0 100 100', svg: '<polygon points="0,0 100,0 0,100" fill="currentColor"/>', ico: '<polygon points="4,20 96,30 4,40" fill="currentColor"/>', miroir: true },
    { id: 'bande', nom: 'Bande oblique', w: 1.3, ratio: 0.3, vb: '0 0 100 100', svg: '<polygon points="20,0 100,0 80,100 0,100" fill="currentColor"/>', ico: '<polygon points="26,8 94,8 74,52 6,52" fill="currentColor"/>' },
    { id: 'ovale', nom: 'Ovale', w: 1.8, ratio: 0.45, etirable: true, vb: '0 0 100 100', svg: '<ellipse cx="50" cy="50" rx="50" ry="50" fill="currentColor"/>', ico: '<ellipse cx="50" cy="30" rx="46" ry="22" fill="currentColor"/>' },
    { id: 'pilule', nom: 'Pilule', w: 1.8, ratio: 0.3, etirable: true, css: 'background:currentColor;border-radius:9999px;', ico: '<rect x="6" y="14" width="88" height="32" rx="16" fill="currentColor"/>' },
    { id: 'rectarrondi', nom: 'Rectangle arrondi', w: 1.5, ratio: 0.6, etirable: true, css: 'background:currentColor;border-radius:14%;', ico: '<rect x="10" y="8" width="80" height="44" rx="9" fill="currentColor"/>' },
    { id: 'losange', nom: 'Losange', w: 1, ratio: 1, etirable: true, vb: '0 0 100 100', svg: '<polygon points="50,0 100,50 50,100 0,50" fill="currentColor"/>', ico: '<polygon points="50,2 94,30 50,58 6,30" fill="currentColor"/>' },
    { id: 'hexagone', nom: 'Hexagone', w: 1, ratio: 0.87, etirable: true, vb: '0 0 100 100', svg: '<polygon points="25,0 75,0 100,50 75,100 25,100 0,50" fill="currentColor"/>', ico: '<polygon points="26,4 74,4 98,30 74,56 26,56 2,30" fill="currentColor"/>' },
    { id: 'points', nom: 'Points', w: 1.4, ratio: 0.7, etirable: true, sansContour: true, css: 'background-image:radial-gradient(circle,currentColor 2.4px,transparent 2.8px);background-size:15px 15px;',
      ico: '<circle cx="14" cy="12" r="5" fill="currentColor"/><circle cx="50" cy="12" r="5" fill="currentColor"/><circle cx="86" cy="12" r="5" fill="currentColor"/><circle cx="14" cy="30" r="5" fill="currentColor"/><circle cx="50" cy="30" r="5" fill="currentColor"/><circle cx="86" cy="30" r="5" fill="currentColor"/><circle cx="14" cy="48" r="5" fill="currentColor"/><circle cx="50" cy="48" r="5" fill="currentColor"/><circle cx="86" cy="48" r="5" fill="currentColor"/>' },
    { id: 'hachures', nom: 'Hachures', w: 1.4, ratio: 0.7, etirable: true, sansContour: true, css: 'background-image:repeating-linear-gradient(135deg,currentColor 0,currentColor 3px,transparent 3px,transparent 13px);',
      ico: '<line x1="8" y1="50" x2="30" y2="8" stroke="currentColor" stroke-width="6"/><line x1="32" y1="50" x2="54" y2="8" stroke="currentColor" stroke-width="6"/><line x1="56" y1="50" x2="78" y2="8" stroke="currentColor" stroke-width="6"/><line x1="80" y1="50" x2="102" y2="8" stroke="currentColor" stroke-width="6"/>' }
  ],
  ZONES: [
    { id: 'hg', nom: 'Coin en haut à gauche' }, { id: 'hd', nom: 'Coin en haut à droite' }, { id: 'nom', nom: 'Derrière le nom' }, { id: 'metier', nom: 'Autour du métier' },
    { id: 'sous', nom: 'Sous l’en-tête' }, { id: 'mil', nom: 'Au milieu de la page' }, { id: 'bas', nom: 'En bas de page' }
  ],
  TAILLES: [
    { id: 'XS', nom: 'Très petite', px: 100 }, { id: 'S', nom: 'Petite', px: 160 }, { id: 'M', nom: 'Moyenne', px: 250 },
    { id: 'L', nom: 'Grande', px: 380 }, { id: 'XL', nom: 'Très grande', px: 560 }
  ],
  TRANSPARENCES: [{ id: 'leger', nom: 'Légère', op: 0.28 }, { id: 'moyen', nom: 'Moyenne', op: 0.46 }],
  COULEURS: [{ id: 'cv', nom: 'Couleur du CV' }, { id: 'claire', nom: 'Couleur claire' }, { id: 'gris', nom: 'Gris' }],
  // Remplissage : « plein » (couleur transparente posee sur le CV, en relief), « vide » (une DECOUPE : la forme efface ce qu'elle recouvre et laisse voir le papier, par exemple un trou dans le bandeau),
  // « contour » (un simple trait qui suit la forme). `ico` : la petite image du bouton.
  STYLES: [
    { id: 'plein', nom: 'Plein', ico: '<ellipse cx="50" cy="30" rx="44" ry="24" fill="currentColor"/>' },
    { id: 'vide', nom: 'Vide', ico: '<path fill="currentColor" fill-rule="evenodd" d="M4 4h92v52H4z M50 10a36 20 0 1 0 0.01 0z"/>' },
    { id: 'contour', nom: 'Contour', ico: '<ellipse cx="50" cy="30" rx="42" ry="22" fill="none" stroke="currentColor" stroke-width="7"/>' }
  ],
  TEINTES: ['#9db8d9', '#a8d5ba', '#f3d58a', '#f0b4a8', '#d3b5e5', '#b5e0e0', '#f5c6d6', '#cfcfcf']
};

function _formesDecoTrouver(liste, id) {
  for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) { return liste[i]; } }
  return liste[0];
}
function _formesDecoIdValide(liste, id) { for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) { return true; } } return false; }
function _formesDecoNombre(v, min, max, defaut) { var n = parseFloat(v); if (!isFinite(n)) { return defaut; } return Math.max(min, Math.min(max, n)); }

// Une forme par defaut (la premiere que la personne ajoute).
function _formesDecoParDefaut() { return { forme: 'rond', zone: 'hd', taille: 'M', transp: 'leger', couleur: 'cv', teinte: '#9db8d9', flip: false, style: 'plein' }; }
// La forme que la personne obtient en en ajoutant une de plus : une forme, une zone et une couleur DIFFERENTES de ce qu'elle a deja, pour que les formes se repartissent sur la page sans s'empiler
// (sept zones, sept formes). `existantes` : les formes deja posees ; on prend la premiere proposition dont la zone est libre.
var _FORMES_DECO_PROPOSITIONS = [['anneau', 'bas', 'L', 'claire'], ['triangle', 'hg', 'M', 'cv'], ['demi', 'mil', 'S', 'gris'], ['ovale', 'metier', 'M', 'cv'], ['bande', 'sous', 'S', 'claire'], ['pilule', 'nom', 'S', 'gris'], ['rond', 'hd', 'S', 'cv']];
function _formesDecoSuivante(nbDeja, existantes) {
  var prises = {}, formesPrises = {};
  (Array.isArray(existantes) ? existantes : []).forEach(function (f) { if (f) { prises[f.zone] = true; formesPrises[f.forme] = true; } });
  var choix = null, i;
  for (i = 0; i < _FORMES_DECO_PROPOSITIONS.length && !choix; i++) { if (!prises[_FORMES_DECO_PROPOSITIONS[i][1]] && !formesPrises[_FORMES_DECO_PROPOSITIONS[i][0]]) { choix = _FORMES_DECO_PROPOSITIONS[i]; } }
  for (i = 0; i < _FORMES_DECO_PROPOSITIONS.length && !choix; i++) { if (!prises[_FORMES_DECO_PROPOSITIONS[i][1]]) { choix = _FORMES_DECO_PROPOSITIONS[i]; } }
  if (!choix) { choix = _FORMES_DECO_PROPOSITIONS[Math.max(0, (nbDeja || 1) - 1) % _FORMES_DECO_PROPOSITIONS.length]; }
  var f = _formesDecoParDefaut(); f.forme = choix[0]; f.zone = choix[1]; f.taille = choix[2]; f.couleur = choix[3];
  return f;
}
// Nettoie une liste venue de n'importe ou (stockage, essai de la personne) : au plus MAX formes, valeurs connues, nombres bornes. Jamais d'exception.
function _formesDecoNormaliser(liste) {
  var out = [];
  if (!Array.isArray(liste)) { return out; }
  for (var i = 0; i < liste.length && out.length < _FORMES_DECO.MAX; i++) {
    var f = liste[i]; if (!f || typeof f !== 'object') { continue; }
    var forme = _formesDecoIdValide(_FORMES_DECO.FORMES, f.forme) ? f.forme : 'rond';
    var n = {
      forme: forme,
      zone: (f.zone === 'libre' || _formesDecoIdValide(_FORMES_DECO.ZONES, f.zone)) ? f.zone : 'hd',
      taille: (f.taille === 'perso' || _formesDecoIdValide(_FORMES_DECO.TAILLES, f.taille)) ? f.taille : 'M',
      transp: _formesDecoIdValide(_FORMES_DECO.TRANSPARENCES, f.transp) ? f.transp : 'leger',
      couleur: _formesDecoIdValide(_FORMES_DECO.COULEURS, f.couleur) ? f.couleur : 'cv',
      teinte: (typeof f.teinte === 'string' && /^#[0-9a-fA-F]{6}$/.test(f.teinte)) ? f.teinte : '#9db8d9',
      flip: !!f.flip,
      style: _formesDecoIdValide(_FORMES_DECO.STYLES, f.style) ? f.style : 'plein'
    };
    // Orientation (rotation 2D autour du centre, en degres entiers de -180 a 180) : gardee seulement quand elle n'est pas nulle ; la forme reste sur place, seule sa facon d'etre change.
    if (f.croise === 'coupe') { n.croise = 'coupe'; }   // contour : le trait s'interrompt autour des lettres (par defaut : le trait reste entier, les lettres changent de couleur)
    if (f.traits === false) { n.traits = false; }   // « Cacher » les zones colorees dans une forme vide (par defaut elles restent visibles, en teinte tres claire)
    var rot = Math.round(Number(f.rot));
    if (isFinite(rot)) { rot = ((rot + 180) % 360 + 360) % 360 - 180; if (rot) { n.rot = rot; } }
    // Un motif (points, hachures) n'a pas de contour : il reste plein.
    if (n.style === 'contour' && _formesDecoTrouver(_FORMES_DECO.FORMES, forme).sansContour) { n.style = 'plein'; }
    if (n.zone === 'libre') { n.fx = _formesDecoNombre(f.fx, -1, 1.2, 0.3); n.fy = _formesDecoNombre(f.fy, -1, 1.2, 0.2); }
    if (n.taille === 'perso' || n.zone === 'libre') { n.fw = _formesDecoNombre(f.fw, 0.05, 1.3, 0.3); }
    if (n.zone === 'libre' && n.taille !== 'perso') { n.taille = 'perso'; }
    // Proportions d'une forme etirable (hauteur / largeur), gardees seulement quand la personne les a reglees.
    if (_formesDecoTrouver(_FORMES_DECO.FORMES, forme).etirable && f.fr !== undefined && f.fr !== null) { n.fr = _formesDecoNombre(f.fr, 0.08, 3, _formesDecoTrouver(_FORMES_DECO.FORMES, forme).ratio); }
    out.push(n);
  }
  return out;
}
function _formesDecoHauteurDe(F, w, fr) {
  if (F.etirable && fr) { return Math.max(6, Math.round(w * fr)); }
  return F.id === 'lame' ? Math.round(w * 0.028) + 8 : Math.round(w * F.ratio);
}

// Geometrie d'une forme sur une page. ctx : { pageL, pageH, enteteBas, metier } (px de la page ; enteteBas = bas de l'en-tete mesure, 214 par defaut ; metier = { x, y, w, h } du titre du metier).
// Rend { css (position et taille), w, h, miroir, ancre }. Pure : aucun acces a la page.
function _formesDecoGeometrie(f, ctx) {
  ctx = ctx || {};
  var pageL = ctx.pageL || _FORMES_DECO.PAGE_L, pageH = ctx.pageH || _FORMES_DECO.PAGE_H, k = pageL / _FORMES_DECO.PAGE_L;
  var enteteBas = (typeof ctx.enteteBas === 'number' && ctx.enteteBas > 0) ? ctx.enteteBas : 214;
  var F = _formesDecoTrouver(_FORMES_DECO.FORMES, f.forme);
  var w = (f.taille === 'perso' || f.zone === 'libre') ? Math.round((f.fw || 0.3) * pageL) : Math.min(pageL, Math.round(_formesDecoTrouver(_FORMES_DECO.TAILLES, f.taille).px * F.w * k));
  var h = _formesDecoHauteurDe(F, w, f.fr), pos, miroirBase = false;
  var zone = f.zone;
  if (zone === 'metier' && !(ctx.metier && ctx.metier.w > 0)) { zone = 'nom'; }   // pas de titre de metier sur cette page : derriere le nom
  if (zone === 'libre') { pos = 'left:' + Math.round((f.fx || 0) * pageL) + 'px;top:' + Math.round((f.fy || 0) * pageH) + 'px;'; }
  else {
    miroirBase = !!(F.miroir && (zone === 'hd' || zone === 'mil'));
    if (zone === 'hg') { pos = 'left:0;top:0;'; }
    else if (zone === 'hd') { pos = 'right:0;top:0;'; }
    else if (zone === 'nom') { pos = 'left:' + Math.round(70 * k) + 'px;top:' + Math.max(24, Math.round(enteteBas / 2 - h / 2)) + 'px;'; }
    else if (zone === 'metier') {
      var m = ctx.metier;
      if (F.etirable && f.taille !== 'perso') {
        // une forme etirable entoure le titre du metier (marge autour du texte) : la taille choisie ne compte pas, sauf reglage a la main
        w = Math.round(m.w + 36 * k); h = Math.round(m.h + 20 * k);
        pos = 'left:' + Math.round(m.x - 18 * k) + 'px;top:' + Math.round(m.y - 10 * k) + 'px;';
      } else {
        pos = 'left:' + Math.round(m.x + m.w / 2 - w / 2) + 'px;top:' + Math.round(m.y + m.h / 2 - h / 2) + 'px;';
      }
    }
    else if (zone === 'sous') { pos = (F.id === 'lame' ? 'left:0;' : 'left:' + Math.round((pageL - w) / 2) + 'px;') + 'top:' + Math.max(0, Math.round(enteteBas - 8)) + 'px;'; }
    else if (zone === 'mil') { pos = 'right:' + Math.round(36 * k) + 'px;top:' + Math.round(pageH * 0.46) + 'px;'; }
    else { pos = 'left:' + Math.round((pageL - w) / 2) + 'px;bottom:0;'; }
  }
  return { F: F, w: w, h: h, pos: pos, miroir: miroirBase !== !!f.flip, rot: f.rot || 0 };
}
// ---- STYLE ALEATOIRE des formes (Denis, 2026-10-20) ----
// 1 ou 2 formes (nombre au hasard ; decision de Denis, 24/10/2026 : « mieux vaut une ou deux formes bien placees que quatre entassees ») posees LIBREMENT par le code, SANS se chevaucher ni se toucher (marge de 14 px entre deux boites, mesure sur la boite englobante de la forme tournee),
// jamais sur les zones interdites (tout texte et photo, 24/10/2026 : les formes proposees ne vont que sur du blanc ; `ctx.interdits`, liste de { x, y, w, h } en px de la page), toujours entieres dans la page. Forme, taille, orientation, remplissage (plein, vide, contour),
// transparence et couleur (couleur du CV, gris, teinte claire) au hasard. Pure : `rnd` (par defaut Math.random) est remplacable par un essai ; ctx : { pageL, pageH, interdits }.
function _formesDecoAuHasard(ctx, rnd) {
  ctx = ctx || {}; rnd = rnd || Math.random;
  var pageL = ctx.pageL || _FORMES_DECO.PAGE_L, pageH = ctx.pageH || _FORMES_DECO.PAGE_H, MARGE = 14;
  var interdits = (Array.isArray(ctx.interdits) ? ctx.interdits : []).filter(function (b) { return b && b.w > 0 && b.h > 0; });
  var tire = function (t) { return t[Math.floor(rnd() * t.length) % t.length]; };
  var inter = function (a, b, m) { return a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y; };
  var nombre = 1 + Math.floor(rnd() * 2), pris = [], sortie = [], essai;
  for (var i = 0; i < nombre; i++) {
    for (essai = 0; essai < 60; essai++) {
      var F = tire(_FORMES_DECO.FORMES);
      var fw = 0.11 + rnd() * 0.25;
      var rot = tire([0, 0, 0, 45, 90, 135, -45, -90]);
      var f = { forme: F.id, zone: 'libre', taille: 'perso', fw: Math.round(fw * 1000) / 1000, rot: rot, fx: 0, fy: 0 };
      var g = _formesDecoGeometrie(f, { pageL: pageL, pageH: pageH });
      var rad = rot * Math.PI / 180, bw = Math.abs(g.w * Math.cos(rad)) + Math.abs(g.h * Math.sin(rad)), bh = Math.abs(g.w * Math.sin(rad)) + Math.abs(g.h * Math.cos(rad));
      if (bw > pageL - 20 || bh > pageH - 20) { continue; }
      var cx = bw / 2 + 4 + rnd() * (pageL - bw - 8), cy = bh / 2 + 4 + rnd() * (pageH - bh - 8);
      var boite = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh }, libre = true, j;
      for (j = 0; j < interdits.length && libre; j++) { if (inter(boite, interdits[j], 6)) { libre = false; } }
      for (j = 0; j < pris.length && libre; j++) { if (inter(boite, pris[j], MARGE)) { libre = false; } }
      if (!libre) { continue; }
      f.fx = Math.round((cx - g.w / 2) / pageL * 1000) / 1000; f.fy = Math.round((cy - g.h / 2) / pageH * 1000) / 1000;
      var r = rnd();
      f.style = r < 0.55 ? 'plein' : (r < 0.75 ? 'vide' : 'contour');
      f.transp = tire(['leger', 'leger', 'moyen']);
      f.couleur = tire(['cv', 'cv', 'gris', 'claire']);
      f.teinte = tire(_FORMES_DECO.TEINTES);
      if (!rot) { delete f.rot; }
      pris.push(boite); sortie.push(f);
      break;
    }
  }
  return _formesDecoNormaliser(sortie);
}
// Ce qui change selon le remplissage : couleur, transparence, melange, dessin et fond.
// plein : couleur choisie, transparence choisie, melange « multiplier » (le texte reste lisible, la forme est en relief) ;
// vide : la couleur du PAPIER, opaque, sans melange : la forme efface ce qu'elle recouvre ; contour : un trait de la couleur choisie.
function _formesDecoRendu(f, F, ctx) {
  var P = _formesDecoTrouver(_FORMES_DECO.TRANSPARENCES, f.transp);
  // vide : la boite de la forme reste TRANSPARENTE (c'est elle qu'on touche) ; le dessin vient de la fenetre masquee posee dessous (_formesDecoPoserVides) : la forme ne cache jamais le texte.
  if (f.style === 'vide') { return { couleur: 'transparent', opacite: 1, blend: '', svg: '', css: '' }; }
  // contour : la boite reste TRANSPARENTE (c'est elle qu'on touche) ; le trait est dessine par la fenetre masquee posee dessous (_formesDecoPoserContours).
  if (f.style === 'contour') { return { couleur: 'transparent', opacite: 1, blend: '', svg: '', css: '' }; }
  return { couleur: _formesDecoCouleurCss(f), opacite: P.op, blend: 'mix-blend-mode:multiply;', svg: F.svg, css: F.css || '' };
}
function _formesDecoCouleurCss(f) {
  if (f.couleur === 'claire') { return f.teinte || '#9db8d9'; }
  if (f.couleur === 'gris') { return '#8a8f98'; }
  return 'var(--cv,#1e3a5f)';
}
// Le calque en HTML (chaine). Vide quand il n'y a aucune forme : une page sans forme n'est jamais modifiee. L'enveloppe est positionnee et coupe ce qui depasse de la page (pas de page en trop a l'impression) ;
// elle ne cree pas de contexte d'empilement, pour que le melange « multiplier » des formes agisse sur le CV. Les formes ne captent aucun clic.
function _formesDecoHtml(liste, ctx) {
  var l = _formesDecoNormaliser(liste);
  if (!l.length) { return ''; }
  var html = '<div class="formes-deco" aria-hidden="true" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;">';
  l.forEach(function (f, i) {
    var g = _formesDecoGeometrie(f, ctx), R = _formesDecoRendu(f, g.F, ctx);
    html += '<div class="forme-deco" data-idx="' + i + '" data-style="' + f.style + '" style="position:absolute;' + g.pos + 'width:' + g.w + 'px;height:' + g.h + 'px;color:' + R.couleur + ';opacity:' + R.opacite +
      ';' + R.blend + 'z-index:5;pointer-events:none;' + ((g.rot || g.miroir) ? 'transform:' + (g.rot ? 'rotate(' + g.rot + 'deg)' : '') + (g.rot && g.miroir ? ' ' : '') + (g.miroir ? 'scaleX(-1)' : '') + ';' : '') + R.css + '">' +
      (R.svg ? '<svg viewBox="' + g.F.vb + '" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" style="overflow:visible">' + R.svg + '</svg>' : '') + '</div>';
  });
  return html + '</div>';
}

// ---- Parties qui touchent a la page (navigateur) ----
// Mesure de la page : taille, bas de l'en-tete (premier element « en-tete » connu des gabarits), place du titre du metier.
function _formesDecoMesurer(pageEl) {
  var ctx = { pageL: pageEl.offsetWidth || _FORMES_DECO.PAGE_L, pageH: pageEl.offsetHeight || _FORMES_DECO.PAGE_H, enteteBas: 0 };
  var ent = pageEl.querySelector('.tete-fond, .tete, .ban, .ent');
  if (ent) { ctx.enteteBas = ent.offsetTop + ent.offsetHeight; }
  // Couleur du papier (fond de la page) : celle d'une forme « vide » (une decoupe qui laisse voir le papier).
  try {
    var vue = pageEl.ownerDocument.defaultView, bg = vue && vue.getComputedStyle(pageEl).backgroundColor;
    ctx.papier = (bg && !/^rgba\(.*,\s*0\)$/.test(bg) && bg !== 'transparent') ? bg : '#ffffff';
  } catch (e) { ctx.papier = '#ffffff'; }
  var met = pageEl.querySelector('.metier');
  if (met && met.getBoundingClientRect) {
    var pr = pageEl.getBoundingClientRect(), mr = met.getBoundingClientRect();
    var k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1;
    if (mr.width > 0 && mr.height > 0) { ctx.metier = { x: (mr.left - pr.left) / k, y: (mr.top - pr.top) / k, w: mr.width / k, h: mr.height / k }; }
  }
  return ctx;
}
// ---- IMPRESSION des formes « vide » et « contour » (essai d'impression reel, 2026-10-21) ----
// Le moteur d'impression de Chrome et d'Edge ignore les masques d'image : on redessine alors la forme avec ce qui s'imprime, c'est-a-dire un clip-path vectoriel (vide) et un trait SVG (contour).
// Les contours des formes sont calcules ici en points (figures simples) ; fonctions pures, testees sans navigateur. Renvoie des anneaux [[x, y], ...] en pixels de la page, ou null (motifs : points, hachures).
function _formesDecoEllipse(cx, cy, rx, ry, n) {
  var pts = [];
  for (var i = 0; i < n; i++) { var t = i / n * 2 * Math.PI; pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
  return pts;
}
function _formesDecoRectArrondi(x, y, w, h, rx, ry) {
  rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
  var pts = [], n = 16, coins = [[x + w - rx, y + ry, -Math.PI / 2], [x + w - rx, y + h - ry, 0], [x + rx, y + h - ry, Math.PI / 2], [x + rx, y + ry, Math.PI]];
  coins.forEach(function (c) { for (var i = 0; i <= n; i++) { var t = c[2] + i / n * Math.PI / 2; pts.push([c[0] + rx * Math.cos(t), c[1] + ry * Math.sin(t)]); } });
  return pts;
}
// Contour de la forme dans son propre repere (largeur w, hauteur h), avant rotation et miroir.
function _formesDecoAnneauxLocaux(F, w, h) {
  if (!F) { return null; }
  if (F.id === 'pilule') { return [_formesDecoRectArrondi(0, 0, w, h, h / 2, h / 2)]; }
  if (F.id === 'rectarrondi') { return [_formesDecoRectArrondi(0, 0, w, h, w * 0.14, h * 0.14)]; }
  if (!F.svg || !F.vb) { return null; }   // motifs (points, hachures) : aucun contour
  var vb = F.vb.split(' ').map(Number), sx = w / vb[2], sy = h / vb[3], m;
  var mise = function (pts) { return pts.map(function (p) { return [p[0] * sx, p[1] * sy]; }); };
  if (F.id === 'rond' || F.id === 'ovale') { return [mise(_formesDecoEllipse(50, 50, 50, 50, 72))]; }
  if (F.id === 'anneau') { return [mise(_formesDecoEllipse(50, 50, 49, 49, 72)), mise(_formesDecoEllipse(50, 50, 35, 35, 72))]; }
  if (F.id === 'demi') {
    var arc = []; for (var i = 0; i <= 36; i++) { var t = Math.PI - i / 36 * Math.PI; arc.push([50 + 50 * Math.cos(t), 50 - 50 * Math.sin(t)]); }
    return [mise(arc)];
  }
  m = /points="([^"]+)"/.exec(F.svg);
  if (m) { return [mise(m[1].trim().split(/\s+/).map(function (p) { var q = p.split(',').map(Number); return [q[0], q[1]]; }))]; }
  return null;
}
// Les anneaux en pixels de la page : meme place, meme rotation, meme miroir que le masque (voir _formesDecoMasqueSvg).
function _formesDecoAnneauxPage(F, f, boite, miroir) {
  var locaux = _formesDecoAnneauxLocaux(F, boite.w, boite.h); if (!locaux) { return null; }
  var a = (f.rot || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cx = boite.x + boite.w / 2, cy = boite.y + boite.h / 2;
  return locaux.map(function (anneau) {
    return anneau.map(function (p) {
      var x = p[0] - boite.w / 2, y = p[1] - boite.h / 2;
      if (miroir) { x = -x; }
      return [Math.round((cx + x * ca - y * sa) * 10) / 10, Math.round((cy + x * sa + y * ca) * 10) / 10];
    });
  });
}
function _formesDecoCheminAnneaux(anneaux) {
  return anneaux.map(function (a) { return 'M' + a.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + 'Z'; }).join('');
}
// ---- Forme « vide » : la forme ne cache JAMAIS le texte (decision de Denis, 2026-10-20) ----
// Dans la forme, la page devient papier et tout le texte passe en couleur foncee : une COPIE du CV, recoloree par la feuille de style ci-dessous, n'est montree qu'A L'INTERIEUR de la forme,
// grace a un masque SVG de la taille de la page. Le masque porte la forme ET sa rotation : la copie, donc le texte, reste droite. Option `traits` (vrai par defaut) : les zones colorees (bandeau, colonne,
// pastilles...) restent visibles en teinte tres claire a l'interieur de la forme, pour voir ou elles s'arretent ; « Cacher » ne laisse que le texte sur le papier.
// Le masque d'une forme : meme dessin que la forme pleine (svg ou css), place, tourne et retourne comme elle. `boite` : { x, y, w, h } en px de la page.
function _formesDecoMasqueSvg(F, f, boite, pageL, pageH, miroir) {
  var w = boite.w, h = boite.h, corps;
  if (F.svg && F.vb) {
    var vb = F.vb.split(' ').map(Number);
    corps = '<g transform="scale(' + (w / vb[2]) + ' ' + (h / vb[3]) + ')">' + F.svg.replace(/currentColor/g, '#000') + '</g>';
  } else if (F.id === 'pilule') { corps = '<rect width="' + w + '" height="' + h + '" rx="' + (h / 2) + '" ry="' + (h / 2) + '" fill="#000"/>'; }
  else if (F.id === 'rectarrondi') { corps = '<rect width="' + w + '" height="' + h + '" rx="' + (w * 0.14) + '" ry="' + (h * 0.14) + '" fill="#000"/>'; }
  else if (F.id === 'points') { corps = '<defs><pattern id="m" width="15" height="15" patternUnits="userSpaceOnUse"><circle cx="7.5" cy="7.5" r="2.6" fill="#000"/></pattern></defs><rect width="' + w + '" height="' + h + '" fill="url(#m)"/>'; }
  else if (F.id === 'hachures') { corps = '<defs><pattern id="m" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="13" fill="#000"/></pattern></defs><rect width="' + w + '" height="' + h + '" fill="url(#m)"/>'; }
  else { corps = '<rect width="' + w + '" height="' + h + '" fill="#000"/>'; }
  var tr = 'translate(' + (boite.x + w / 2) + ' ' + (boite.y + h / 2) + ') rotate(' + (f.rot || 0) + ') ' + (miroir ? 'scale(-1 1) ' : '') + 'translate(' + (-w / 2) + ' ' + (-h / 2) + ')';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + pageL + '" height="' + pageH + '" viewBox="0 0 ' + pageL + ' ' + pageH + '"><g transform="' + tr + '">' + corps + '</g></svg>';
}
// La copie du CV (sans le calque, le cadre de reglage et les reperes), une seule fois par page : identifiants et attributs data-* retires pour qu'aucune fonction du CV ne la prenne pour le vrai CV.
function _formesDecoCopieHtml(pageEl) {
  if (pageEl.__copieVide) { return pageEl.__copieVide; }
  var racine = pageEl.cloneNode(false);
  Array.prototype.forEach.call(pageEl.childNodes, function (n) {
    if (n.nodeType === 1 && n.matches && n.matches('.formes-deco, .forme-deco-edition, .marque-page, .mq-fantome, .mq-cote')) { return; }
    racine.appendChild(n.cloneNode(true));
  });
  var tout = [racine].concat(Array.prototype.slice.call(racine.querySelectorAll('*')));
  tout.forEach(function (e) {
    e.removeAttribute('id');
    Array.prototype.slice.call(e.attributes).forEach(function (a) { if (/^data-/.test(a.name) || a.name === 'tabindex' || a.name === 'contenteditable') { e.removeAttribute(a.name); } });
  });
  racine.style.position = 'absolute'; racine.style.left = '0'; racine.style.top = '0'; racine.style.margin = '0'; racine.style.boxShadow = 'none'; racine.style.transform = 'none';
  racine.style.width = pageEl.offsetWidth + 'px'; racine.style.height = pageEl.offsetHeight + 'px';
  pageEl.__copieVide = racine.outerHTML;
  return pageEl.__copieVide;
}
var _FORMES_DECO_STYLE_VIDE = [
  '.forme-deco-vide .vide-texte, .forme-deco-vide .vide-texte *, .forme-deco-vide .vide-texte *::before, .forme-deco-vide .vide-texte *::after { background: transparent !important; background-image: none !important; color: #1d2433 !important; border-color: #1d2433 !important; box-shadow: none !important; text-shadow: none !important; outline: 0 !important; filter: none !important; mix-blend-mode: normal !important; }',
  '.forme-deco-vide .vide-fond { opacity: .22; }',
  '.forme-deco-vide .vide-fond > * { background: transparent !important; }',
  '.forme-deco-vide .vide-fond, .forme-deco-vide .vide-fond * { color: transparent !important; text-shadow: none !important; border-color: transparent !important; }',
  '.forme-deco-vide .vide-fond img, .forme-deco-vide .vide-fond svg { visibility: hidden !important; }',
  '.forme-deco-contour .contour-texte, .forme-deco-contour .contour-texte *, .forme-deco-contour .contour-texte *::before, .forme-deco-contour .contour-texte *::after { background: transparent !important; background-image: none !important; color: var(--contraste, #fff) !important; border-color: transparent !important; box-shadow: none !important; text-shadow: none !important; outline: 0 !important; filter: none !important; mix-blend-mode: normal !important; }',
  '.forme-deco-vide .vide-copie, .forme-deco-contour .vide-copie { position: absolute; left: 0; top: 0; }',
  // IMPRESSION (essai d'impression reel, 2026-10-21) : le moteur d'impression de Chrome et d'Edge IGNORE les masques d'image (CSS et SVG) : la fenetre couvrait alors toute la page (page entiere
  // de la couleur du CV, textes en double). Seuls les clip-path vectoriels et les traits SVG s'impriment : la fenetre est donc retiree a l'impression.
  '.forme-deco-impr { display: none; }',
  // Sans redessin possible (motifs), la fenetre est retiree ; sinon : « vide » = la meme fenetre decoupee par un clip-path vectoriel, « contour » = un trait SVG (`.forme-deco-impr`).
  '@media print { .forme-deco-vide:not(.forme-deco-imprimable), .forme-deco-contour { display: none !important; } .forme-deco-vide.forme-deco-imprimable { -webkit-mask-image: none !important; mask-image: none !important; clip-path: var(--clip-impr) !important; } .forme-deco-impr { display: block !important; } }'
].join('\n');
// La feuille de style de la copie : dans le document, ou dans le compartiment etanche (shadow root) d'une miniature.
function _formesDecoStyleVide(pageEl) {
  var racine = pageEl.getRootNode ? pageEl.getRootNode() : pageEl.ownerDocument, cible = (racine.nodeType === 9) ? (racine.head || racine.documentElement) : racine;
  if (!cible || (cible.querySelector && cible.querySelector('style[data-formes-deco-vide]'))) { return; }
  var st = pageEl.ownerDocument.createElement('style'); st.setAttribute('data-formes-deco-vide', '1'); st.textContent = _FORMES_DECO_STYLE_VIDE;
  cible.appendChild(st);
}
// Pose, pour chaque forme « vide », sa fenetre (copie masquee) JUSTE SOUS la boite de saisie de la forme (qui, elle, reste transparente : c'est elle qu'on touche pour la deplacer).
function _formesDecoPoserVides(pageEl, l, ctx) {
  var cont = pageEl.querySelector('.formes-deco');
  if (!cont) { return; }
  var vides = []; l.forEach(function (f, i) { if (f.style === 'vide') { vides.push(i); } });
  if (!vides.length) { return; }
  _formesDecoStyleVide(pageEl);
  var copie = _formesDecoCopieHtml(pageEl), doc = pageEl.ownerDocument;
  vides.forEach(function (i) {
    var f = l[i], el = cont.querySelector('.forme-deco[data-idx="' + i + '"]'); if (!el) { return; }
    var g = _formesDecoGeometrie(f, ctx);
    var svg = _formesDecoMasqueSvg(g.F, f, { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }, ctx.pageL, ctx.pageH, g.miroir);
    var url = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
    var fen = doc.createElement('div'); fen.className = 'forme-deco-vide'; fen.setAttribute('data-idx', String(i)); fen.setAttribute('aria-hidden', 'true');
    fen.style.cssText = 'position:absolute;left:0;top:0;width:' + ctx.pageL + 'px;height:' + ctx.pageH + 'px;overflow:hidden;pointer-events:none;z-index:5;background:' + (ctx.papier || '#ffffff') + ';' +
      '-webkit-mask-image:' + url + ';mask-image:' + url + ';-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;';
    fen.innerHTML = (f.traits === false ? '' : '<div class="vide-copie vide-fond">' + copie + '</div>') + '<div class="vide-copie vide-texte">' + copie + '</div>';
    var anneauxImpr = _formesDecoAnneauxPage(g.F, f, { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }, g.miroir);
    if (anneauxImpr) { fen.className += ' forme-deco-imprimable'; fen.style.setProperty('--clip-impr', "path(evenodd, '" + _formesDecoCheminAnneaux(anneauxImpr) + "')"); }
    cont.insertBefore(fen, el);
  });
}
// ---- Forme « contour » : le trait reste lisible quand il passe sur des lettres (decision de Denis, 2026-10-20) ----
// Le trait est dessine par une fenetre de la taille de la page, de la couleur choisie, masquee par un anneau SVG (le dessin de la forme, en trait de 3 px, avec sa place, sa rotation et son miroir).
// Deux facons au choix quand le trait croise du texte (`croise`) : « contraste » (par defaut) : le trait reste entier et les lettres qu'il croise passent dans une couleur qui contraste avec lui (une copie recoloree
// du texte, visible seulement sur le trait) ; « coupe » : le trait s'interrompt autour des lettres (un petit vide autour de chaque ligne de texte qu'il croise).
// Les boites de texte (une par ligne) du CV : en px de la page, pour savoir ou couper le trait. Le calque, le cadre et les reperes sont ignores.
function _formesDecoRectsTexte(pageEl, zone) {
  var doc = pageEl.ownerDocument, r0 = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && r0.width) ? r0.width / pageEl.offsetWidth : 1, sortie = [];
  var marcheur = doc.createTreeWalker(pageEl, 4, function (n) {
    if (!n.nodeValue || !n.nodeValue.trim()) { return 2; }
    var p = n.parentNode;
    return (p && p.closest && p.closest('.formes-deco, .forme-deco-edition, .marque-page, script, style')) ? 2 : 1;
  }, false);
  var n;
  while ((n = marcheur.nextNode())) {
    var rg = doc.createRange(); rg.selectNodeContents(n);
    var rs = rg.getClientRects();
    for (var j = 0; j < rs.length; j++) {
      var r = rs[j]; if (r.width < 1 || r.height < 1) { continue; }
      var b = { x: (r.left - r0.left) / k, y: (r.top - r0.top) / k, w: r.width / k, h: r.height / k };
      if (!zone || (b.x < zone.x + zone.w && b.x + b.w > zone.x && b.y < zone.y + zone.h && b.y + b.h > zone.y)) { sortie.push(b); }
    }
  }
  return sortie;
}
function _formesDecoMasqueContour(F, f, boite, pageL, pageH, miroir, rects) {
  var w = boite.w, h = boite.h, trait = 'fill="none" stroke="#fff" stroke-width="3" vector-effect="non-scaling-stroke"', corps;
  if (F.svg && F.vb) {
    var vb = F.vb.split(' ').map(Number);
    corps = '<g transform="scale(' + (w / vb[2]) + ' ' + (h / vb[3]) + ')">' + F.svg.replace(/fill="currentColor"/g, trait) + '</g>';
  } else if (F.id === 'pilule') { corps = '<rect x="1.5" y="1.5" width="' + (w - 3) + '" height="' + (h - 3) + '" rx="' + ((h - 3) / 2) + '" ry="' + ((h - 3) / 2) + '" ' + trait + '/>'; }
  else if (F.id === 'rectarrondi') { corps = '<rect x="1.5" y="1.5" width="' + (w - 3) + '" height="' + (h - 3) + '" rx="' + (w * 0.14) + '" ry="' + (h * 0.14) + '" ' + trait + '/>'; }
  else { corps = '<rect x="1.5" y="1.5" width="' + (w - 3) + '" height="' + (h - 3) + '" ' + trait + '/>'; }
  var tr = 'translate(' + (boite.x + w / 2) + ' ' + (boite.y + h / 2) + ') rotate(' + (f.rot || 0) + ') ' + (miroir ? 'scale(-1 1) ' : '') + 'translate(' + (-w / 2) + ' ' + (-h / 2) + ')';
  var trous = (rects || []).map(function (r) { return '<rect x="' + (r.x - 2) + '" y="' + (r.y - 1) + '" width="' + (r.w + 4) + '" height="' + (r.h + 2) + '" fill="#000"/>'; }).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + pageL + '" height="' + pageH + '" viewBox="0 0 ' + pageL + ' ' + pageH + '"><defs><mask id="c" maskUnits="userSpaceOnUse" x="0" y="0" width="' + pageL + '" height="' + pageH + '">' +
    '<g transform="' + tr + '">' + corps + '</g>' + trous + '</mask></defs><rect width="' + pageL + '" height="' + pageH + '" fill="#000" mask="url(#c)"/></svg>';
}
// Couleur du trait en rgb (la couleur du CV est une variable CSS : on la fait resoudre par le navigateur) et couleur qui contraste avec elle.
function _formesDecoCouleurResolue(pageEl, css) {
  var doc = pageEl.ownerDocument, sonde = doc.createElement('span'); sonde.style.color = css; sonde.style.display = 'none';
  pageEl.appendChild(sonde);
  var rgb = (pageEl.ownerDocument.defaultView.getComputedStyle(sonde).color || '').match(/\d+(\.\d+)?/g) || [30, 58, 95];
  sonde.remove();
  var lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  return { css: 'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')', contraste: lum > 0.6 ? '#1d2433' : '#ffffff' };
}
function _formesDecoPoserContours(pageEl, l, ctx) {
  var cont = pageEl.querySelector('.formes-deco');
  if (!cont) { return; }
  var liste = []; l.forEach(function (f, i) { if (f.style === 'contour') { liste.push(i); } });
  if (!liste.length) { return; }
  _formesDecoStyleVide(pageEl);
  var doc = pageEl.ownerDocument, copie = null;
  liste.forEach(function (i) {
    var f = l[i], el = cont.querySelector('.forme-deco[data-idx="' + i + '"]'); if (!el) { return; }
    var g = _formesDecoGeometrie(f, ctx);
    var boite = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    var rayon = Math.sqrt(boite.w * boite.w + boite.h * boite.h) / 2 + 6, cx = boite.x + boite.w / 2, cy = boite.y + boite.h / 2;
    var rects = (f.croise === 'coupe') ? _formesDecoRectsTexte(pageEl, { x: cx - rayon, y: cy - rayon, w: 2 * rayon, h: 2 * rayon }) : [];
    var svg = _formesDecoMasqueContour(g.F, f, boite, ctx.pageL, ctx.pageH, g.miroir, rects);
    var url = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
    var couleur = _formesDecoCouleurResolue(pageEl, _formesDecoCouleurCss(f));
    var fen = doc.createElement('div'); fen.className = 'forme-deco-contour'; fen.setAttribute('data-idx', String(i)); fen.setAttribute('aria-hidden', 'true');
    fen.style.cssText = 'position:absolute;left:0;top:0;width:' + ctx.pageL + 'px;height:' + ctx.pageH + 'px;overflow:hidden;pointer-events:none;z-index:5;opacity:.9;background:' + couleur.css + ';--contraste:' + couleur.contraste + ';' +
      '-webkit-mask-image:' + url + ';mask-image:' + url + ';-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;';
    if (f.croise !== 'coupe') { if (copie === null) { copie = _formesDecoCopieHtml(pageEl); } fen.innerHTML = '<div class="vide-copie contour-texte">' + copie + '</div>'; }
    cont.insertBefore(fen, el);
    var anneauxContour = _formesDecoAnneauxPage(g.F, f, boite, g.miroir);
    if (anneauxContour) {   // impression : le trait en SVG vectoriel (les masques ne s'impriment pas)
      var impr = doc.createElement('div'); impr.className = 'forme-deco-impr'; impr.setAttribute('aria-hidden', 'true'); impr.setAttribute('data-idx', String(i));
      impr.style.cssText = 'position:absolute;left:0;top:0;width:' + ctx.pageL + 'px;height:' + ctx.pageH + 'px;pointer-events:none;z-index:5;opacity:.9;';
      impr.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="' + ctx.pageL + '" height="' + ctx.pageH + '" viewBox="0 0 ' + ctx.pageL + ' ' + ctx.pageH + '"><path d="' + _formesDecoCheminAnneaux(anneauxContour) + '" fill="none" stroke="' + couleur.css + '" stroke-width="3" stroke-linejoin="round"/></svg>';
      cont.insertBefore(impr, el);
    }
  });
}
// Pose (ou retire) le calque sur une page : remplace l'ancien. Sans forme, la page est laissee exactement comme elle etait.
function _formesDecoPoser(pageEl, liste) {
  if (!pageEl || !pageEl.querySelector) { return; }
  pageEl.__copieVide = null;   // la copie du CV (formes vide et contour) est reprise a chaque pose : la page a pu changer depuis (hauteur de l'en-tete...)
  var ancien = pageEl.querySelector('.formes-deco');
  if (ancien) { ancien.remove(); }
  var l = _formesDecoNormaliser(liste);
  if (!l.length) { return; }
  var vue = pageEl.ownerDocument.defaultView;
  if (vue && vue.getComputedStyle(pageEl).position === 'static') { pageEl.style.position = 'relative'; }   // les formes se placent par rapport a la page
  var ctx = _formesDecoMesurer(pageEl);
  pageEl.insertAdjacentHTML('beforeend', _formesDecoHtml(l, ctx));
  _formesDecoPoserVides(pageEl, l, ctx);
  _formesDecoPoserContours(pageEl, l, ctx);
}

// ---- Edition a la main : deplacer ET agrandir une forme directement sur l'apercu (placement libre, taille « Regler moi-meme ») ----
// Passe une forme en placement libre SANS qu'elle bouge : sa place et sa taille actuelles, mesurees sur la page, deviennent des fractions de la page.
function _formesDecoVersLibre(pageEl, liste, i) {
  var l = _formesDecoNormaliser(liste), f = l[i];
  if (!f || (f.zone === 'libre' && f.taille === 'perso')) { return l; }
  var el = pageEl.querySelector('.formes-deco .forme-deco[data-idx="' + i + '"]');
  if (!el) { return l; }
  var ctx = _formesDecoMesurer(pageEl), g = _formesDecoGeometrie(f, ctx);
  f.fx = el.offsetLeft / ctx.pageL; f.fy = el.offsetTop / ctx.pageH; f.fw = el.offsetWidth / ctx.pageL;
  f.flip = g.miroir; f.zone = 'libre'; f.taille = 'perso';
  if (g.F.etirable && el.offsetWidth) { f.fr = el.offsetHeight / el.offsetWidth; }   // une forme etirable garde ses proportions du moment
  return _formesDecoNormaliser(l);
}
// Garde au moins un tiers de la forme sur la page (jamais perdue hors de la feuille), taille bornee.
function _formesDecoLimiter(f, ctx) {
  var g = _formesDecoGeometrie(f, ctx);
  f.fw = Math.max(0.05, Math.min(1.3, f.fw));
  if (f.fr) { f.fr = Math.max(0.08, Math.min(3, f.fr)); }
  f.fx = Math.max(-g.w * 0.7 / ctx.pageL, Math.min(1 - g.w * 0.3 / ctx.pageL, f.fx));
  f.fy = Math.max(-g.h * 0.7 / ctx.pageH, Math.min(1 - g.h * 0.3 / ctx.pageH, f.fy));
  return f;
}
// Un geste sur la forme n° i : 'deplacer', 'taille' (la poignee ronde du coin) ou 'pivoter' (la poignee ronde au-dessus : rotation 2D autour du centre, la forme reste sur place ; un simple clic la tourne de 45 degres).
// Les ecouteurs sont poses sur le DOCUMENT : le calque est redessine a chaque mouvement, aucun element ne peut garder la capture du pointeur.
// `rappels` : { lire() : liste actuelle ; changer(liste) : nouvelle liste, sans reconstruire le CV ; debutGeste() : au premier vrai mouvement (pour l'annulation) ; valider() : a la fin du geste, pour garder }.
// Apres avoir touche ou deplace une forme, le « clic » que le navigateur envoie au relachement ne doit JAMAIS arriver au CV (il ouvrirait le grand apercu) : un ecouteur de capture sur le document l'arrete pendant un court instant.
function _formesDecoSansClic(doc) {
  doc.__formesDecoSansClicJusqua = Date.now() + 500;
  if (!doc.__formesDecoSansClicBranche) {
    doc.__formesDecoSansClicBranche = true;
    doc.addEventListener('click', function (ev) { if (Date.now() < (doc.__formesDecoSansClicJusqua || 0)) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  }
}
function _formesDecoGeste(pageEl, i, rappels, mode, e) {
  var doc = pageEl.ownerDocument, cur0 = _formesDecoNormaliser(rappels.lire())[i];
  if (!cur0) { return; }
  _formesDecoSansClic(doc);
  var rp = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && rp.width) ? rp.width / pageEl.offsetWidth : 1;
  var g0 = _formesDecoGeometrie(cur0, _formesDecoMesurer(pageEl));
  var dep = { x: e.clientX, y: e.clientY, fx: cur0.fx, fy: cur0.fy, fw: cur0.fw, w: g0.w, h: g0.h, rot: cur0.rot || 0 }, commence = false;
  var bouger = function (ev) {
    if (!commence) { if (Math.abs(ev.clientX - dep.x) + Math.abs(ev.clientY - dep.y) < 3) { return; } commence = true; if (rappels.debutGeste) { rappels.debutGeste(); } }
    var l = _formesDecoNormaliser(rappels.lire()), cur = l[i]; if (!cur) { return; }
    var c = _formesDecoMesurer(pageEl), dxp = (ev.clientX - dep.x) / k, dyp = (ev.clientY - dep.y) / k;
    if (mode === 'deplacer') { cur.fx = dep.fx + dxp / c.pageL; cur.fy = dep.fy + dyp / c.pageH; }
    else if (mode === 'pivoter') {
      // l'angle est celui du pointeur autour du centre de la forme (la poignee est au-dessus : +90 degres) ; petit aimant sur les multiples de 45 degres
      var r = pageEl.getBoundingClientRect(), cx = dep.fx * c.pageL + dep.w / 2, cy = dep.fy * c.pageH + dep.h / 2;
      var a = Math.round(Math.atan2((ev.clientY - r.top) / k - cy, (ev.clientX - r.left) / k - cx) * 180 / Math.PI + 90), p45 = Math.round(a / 45) * 45;
      cur.rot = (Math.abs(a - p45) <= 5) ? p45 : a;
    } else {
      // Taille : le coin haut-gauche (tel qu'on le voit, meme si la forme est tournee) reste en place ; le pointeur est lu dans le repere de la forme.
      var th = dep.rot * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
      var lx = dxp * co + dyp * si, ly = -dxp * si + dyp * co;
      var F = _formesDecoTrouver(_FORMES_DECO.FORMES, cur.forme), w = Math.max(18, dep.w + lx);
      // une forme etirable se deforme : le coin tire la largeur ET la hauteur ; les autres gardent leurs proportions
      cur.fw = w / c.pageL;
      if (F.etirable) { cur.fr = Math.max(8, dep.h + ly) / Math.max(1, w); }
      var h = _formesDecoHauteurDe(F, Math.round(w), F.etirable ? cur.fr : undefined);
      var c0x = dep.fx * c.pageL + dep.w / 2, c0y = dep.fy * c.pageH + dep.h / 2;
      var tlx = c0x - (dep.w / 2) * co + (dep.h / 2) * si, tly = c0y - (dep.w / 2) * si - (dep.h / 2) * co;
      var c1x = tlx + (w / 2) * co - (h / 2) * si, c1y = tly + (w / 2) * si + (h / 2) * co;
      cur.fx = (c1x - w / 2) / c.pageL; cur.fy = (c1y - h / 2) / c.pageH;
    }
    _formesDecoLimiter(cur, c);
    rappels.changer(l);
  };
  var fin = function () {
    doc.removeEventListener('pointermove', bouger, true); doc.removeEventListener('pointerup', fin, true); doc.removeEventListener('pointercancel', fin, true);
    _formesDecoSansClic(doc);
    if (commence) { if (rappels.valider) { rappels.valider(); } return; }
    if (mode === 'pivoter') {   // simple clic sur la poignee : un huitieme de tour de plus
      var l = _formesDecoNormaliser(rappels.lire()), cur = l[i]; if (!cur) { return; }
      if (rappels.debutGeste) { rappels.debutGeste(); }
      cur.rot = (cur.rot || 0) + 45; rappels.changer(l); if (rappels.valider) { rappels.valider(); }
    }
  };
  doc.addEventListener('pointermove', bouger, true); doc.addEventListener('pointerup', fin, true); doc.addEventListener('pointercancel', fin, true);
}
// Le cadre de la forme n° i (celle qui est selectionnee) : une bordure et une poignee ronde dans le coin pour la grandir ; on la deplace en la touchant (souris, doigt) ou avec les fleches du clavier (plus et moins pour la taille).
// AUCUN message sur le CV (decision de Denis, 2026-10-20) : une phrase sur la page laisserait croire a une erreur ; l'indication est dans le panneau « Formes ». Un seul cadre ; il garde le numero de la forme dans `data-idx`.
function _formesDecoPoserCadre(pageEl, liste, i, rappels) {
  var doc = pageEl.ownerDocument, ancien = pageEl.querySelector('.forme-deco-edition');
  var f = (i === null || i === undefined) ? null : _formesDecoNormaliser(liste)[i];
  if (!f || f.zone !== 'libre') { if (ancien) { ancien.remove(); } return; }
  var ctx = _formesDecoMesurer(pageEl), g = _formesDecoGeometrie(f, ctx);
  // L'apercu est reduit par le panneau (l'iframe est mise a l'echelle) : la poignee et le trait sont agrandis d'autant pour rester faciles a saisir.
  var vue = doc.defaultView, fe = vue && vue.frameElement, kp = (fe && fe.clientWidth) ? fe.getBoundingClientRect().width / fe.clientWidth : 1;
  var gros = Math.max(20, Math.round(26 / kp)), trait = Math.max(2, Math.round(2 / kp));
  var cadre = ancien;
  if (!cadre) {
    if (!doc.getElementById('styleFormeDecoEdition')) {
      var st = doc.createElement('style'); st.id = 'styleFormeDecoEdition'; st.textContent = '@media print{.forme-deco-edition{display:none !important}}';
      (doc.head || doc.documentElement).appendChild(st);
    }
    cadre = doc.createElement('div'); cadre.className = 'forme-deco-edition'; cadre.tabIndex = 0; cadre.setAttribute('role', 'group');
    cadre.setAttribute('aria-label', 'Forme sélectionnée : flèches pour la déplacer, plus et moins pour la grandir ou la réduire, Échap pour la désélectionner');
    cadre.innerHTML = '<span class="poignee-forme" aria-hidden="true"></span><span class="pivot-forme" aria-hidden="true" title="Faire pivoter la forme"><svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block"><path d="M18 12a6 6 0 1 1-2-4.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M18.6 4.6v4.4h-4.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    cadre.style.cssText = 'position:absolute;z-index:9;cursor:move;touch-action:none;box-sizing:border-box;';
    var poignee = cadre.firstChild, pivot = cadre.childNodes[1];
    pivot.style.cssText = 'position:absolute;left:50%;background:#1e4f8a;border:2px solid #fff;border-radius:50%;cursor:grab;box-shadow:0 1px 3px rgba(0,0,0,.4);touch-action:none;box-sizing:border-box;padding:3px;';
    poignee.style.cssText = 'position:absolute;background:#1e4f8a;border:2px solid #fff;border-radius:50%;cursor:nwse-resize;box-shadow:0 1px 3px rgba(0,0,0,.4);touch-action:none;';
    var appliquer = function (fn) {
      var idx = parseInt(cadre.getAttribute('data-idx'), 10);
      var l = _formesDecoNormaliser(rappels.lire()), cur = l[idx]; if (!cur) { return; }
      var c = _formesDecoMesurer(pageEl);
      fn(cur, c); _formesDecoLimiter(cur, c);
      rappels.changer(l);
    };
    cadre.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      _formesDecoGeste(pageEl, parseInt(cadre.getAttribute('data-idx'), 10), rappels, (e.target === poignee) ? 'taille' : ((e.target === pivot || (pivot.contains && pivot.contains(e.target))) ? 'pivoter' : 'deplacer'), e);
    });
    cadre.addEventListener('keydown', function (e) {
      var pas = e.shiftKey ? 20 : 5, ok = true;
      if (e.key === 'Escape') { e.preventDefault(); if (rappels.deselectionner) { rappels.deselectionner(); } return; }
      appliquer(function (cur, c) {
        if (e.key === 'ArrowLeft') { cur.fx -= pas / c.pageL; } else if (e.key === 'ArrowRight') { cur.fx += pas / c.pageL; }
        else if (e.key === 'ArrowUp') { cur.fy -= pas / c.pageH; } else if (e.key === 'ArrowDown') { cur.fy += pas / c.pageH; }
        else if (e.key === '+' || e.key === '=') { cur.fw += pas * 2 / c.pageL; } else if (e.key === '-') { cur.fw -= pas * 2 / c.pageL; }
        else if (e.key === 'r' || e.key === 'R') { cur.rot = (cur.rot || 0) + (e.shiftKey ? -15 : 15); }
        else { ok = false; }
      });
      if (ok) { e.preventDefault(); if (rappels.valider) { rappels.valider(); } }
    });
    pageEl.appendChild(cadre);
  }
  cadre.setAttribute('data-idx', String(i));
  cadre.style.border = trait + 'px solid #1e4f8a';
  var pg = cadre.querySelector('.poignee-forme');
  var pv = cadre.querySelector('.pivot-forme');
  pv.style.width = gros + 'px'; pv.style.height = gros + 'px'; pv.style.marginLeft = Math.round(-gros / 2) + 'px'; pv.style.top = Math.round(-gros * 1.8 - trait) + 'px';
  cadre.style.transform = g.rot ? 'rotate(' + g.rot + 'deg)' : '';
  pg.style.width = gros + 'px'; pg.style.height = gros + 'px'; pg.style.right = Math.round(-gros / 2 - trait) + 'px'; pg.style.bottom = Math.round(-gros / 2 - trait) + 'px';
  cadre.style.left = Math.round((f.fx || 0) * ctx.pageL) + 'px'; cadre.style.top = Math.round((f.fy || 0) * ctx.pageH) + 'px';
  cadre.style.width = Math.max(18, g.w) + 'px'; cadre.style.height = Math.max(18, g.h) + 'px';
}
// Rend les formes du CV du panneau TOUCHABLES (uniquement ici : ni la miniature, ni le grand apercu, ni l'impression ne les rendent interactives, pour ne jamais gener la modification du texte ou le
// deplacement des rubriques) : toucher une forme la selectionne (elle passe en placement libre sans bouger) et la deplace ; toucher le CV ailleurs la deselectionne, sans bloquer ce que le clic fait deja.
// `rappels.selectionner(i)` et `rappels.deselectionner()`.
function _formesDecoActiver(pageEl, rappels) {
  var doc = pageEl.ownerDocument;
  Array.prototype.forEach.call(pageEl.querySelectorAll('.formes-deco .forme-deco'), function (el) {
    el.style.pointerEvents = 'auto'; el.style.cursor = 'grab'; el.style.touchAction = 'none'; el.style.userSelect = 'none';
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button > 0) { return; }
      e.preventDefault(); e.stopPropagation();
      var i = parseInt(el.getAttribute('data-idx'), 10);
      if (rappels.selectionner) { rappels.selectionner(i); }
      _formesDecoGeste(pageEl, i, rappels, 'deplacer', e);
    });
  });
  if (!doc.__formesDecoDeselection) {
    doc.__formesDecoDeselection = true;
    doc.addEventListener('pointerdown', function (e) {
      if (!e.target || !e.target.closest || e.target.closest('.forme-deco, .forme-deco-edition')) { return; }
      if (rappels.deselectionner) { rappels.deselectionner(); }
    }, true);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _FORMES_DECO: _FORMES_DECO, _formesDecoParDefaut: _formesDecoParDefaut, _formesDecoSuivante: _formesDecoSuivante, _formesDecoAuHasard: _formesDecoAuHasard, _formesDecoNormaliser: _formesDecoNormaliser,
    _formesDecoAnneauxLocaux: _formesDecoAnneauxLocaux, _formesDecoAnneauxPage: _formesDecoAnneauxPage, _formesDecoCheminAnneaux: _formesDecoCheminAnneaux,
    _formesDecoGeometrie: _formesDecoGeometrie, _formesDecoHtml: _formesDecoHtml, _formesDecoCouleurCss: _formesDecoCouleurCss, _formesDecoLimiter: _formesDecoLimiter, _formesDecoRendu: _formesDecoRendu, _formesDecoMasqueSvg: _formesDecoMasqueSvg, _formesDecoMasqueContour: _formesDecoMasqueContour
  };
}
