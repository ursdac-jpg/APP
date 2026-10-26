/* ============================================================
   cvPdfLisibilite.js : GARDE-FOU DE LISIBILITE du texte du CV (decision de Denis, 26/10/2026 ; maquette docs/MAQUETTE_LISIBILITE_TEXTE_2026-10-26.html,
   mesures docs/mesures_2026-10-26/lot8/).
   ------------------------------------------------------------
   Un texte blanc sur un fond pale, ou sombre sur un fond fonce, ne se lit pas (nom blanc sur un bandeau pale, nom sombre sur un bandeau marine, certifications blanches
   sur une colonne « contour » vide...). Apres chaque affichage de l'apercu, on regarde le fond REEL derriere chaque texte ; SEULEMENT si le contraste est insuffisant sur
   toute la longueur du texte, il passe au blanc ou au sombre, avec la meme regle que les compositions (_compoCouleurTexte, cvPdfCompositions.js).
   Regles de prudence (jamais d'effet bloquant, jamais de nouveau defaut) :
     - un texte deja lisible n'est JAMAIS touche : les CV lisibles restent exactement les memes ;
     - si une couche de fond derriere le texte n'est pas comprise (forme dessinee par un pseudo-element, image, transparence), le texte n'est pas touche ;
     - rien n'est fait quand une composition ou un croisement colorie deja le texte d'apres le fond (ils ont leur propre moteur) ;
     - le texte a deux tons (copie `.tete-hors`) n'est pas concerne.
   Les parties pures (decision, polygone, degrade) se testent sans navigateur : tests/lisibilite.test.js.
   ============================================================ */

var _LISIBILITE_SEUIL = 2.2;   // contraste en dessous duquel un texte est declare illisible (4,5 serait la norme de confort ; 2,2 ne retient que les vrais defauts)

// Les dependances viennent de cvPdfCompositions.js et de cvPdfTexteHors.js : globales dans le navigateur, require() sous Node (tests).
var _lisibDep = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('./cvPdfCompositions.js'), require('./cvPdfTexteHors.js')) : null;
function _lisibFn(nom) { return (_lisibDep && _lisibDep[nom]) || ((typeof window !== 'undefined' && window[nom]) ? window[nom] : null) || ((typeof globalThis !== 'undefined' && globalThis[nom]) ? globalThis[nom] : null); }

// Les fonds possibles derriere un texte (plusieurs pour un degrade), la couleur du texte : rend la couleur a poser (« #ffffff » ou le sombre), ou '' s'il n'y a rien a faire.
//   texteHex : couleur actuelle du texte ; fondsHex : liste de fonds (un par bout de texte et par bout de degrade).
function _lisibiliteDecision(texteHex, fondsHex, seuil) {
  var contraste = _lisibFn('_compoContraste'), lum = _lisibFn('_compoLuminance'), choisir = _lisibFn('_compoCouleurTexte');
  if (!contraste || !lum || !choisir || !texteHex || !fondsHex || !fondsHex.length) { return ''; }
  seuil = seuil || _LISIBILITE_SEUIL;
  for (var i = 0; i < fondsHex.length; i++) { if (contraste(texteHex, fondsHex[i]) >= seuil) { return ''; } }   // lisible quelque part : on ne touche a rien
  var plusSombre = fondsHex.reduce(function (a, f) { return lum(f) < lum(a) ? f : a; }, fondsHex[0]);
  var c = fondsHex.every(function (f) { return lum(f) > 0.5; }) ? '#1b1b1b' : choisir(plusSombre);
  // le remede doit vraiment mieux se lire que l'existant sur chacun des fonds, sinon on laisse
  for (var j = 0; j < fondsHex.length; j++) { if (contraste(c, fondsHex[j]) <= contraste(texteHex, fondsHex[j])) { return ''; } }
  return c;
}

// Un point est-il dans la forme (clip-path polygon(...) d'une boite w x h) ? Les autres formes (inset, cercle...) comptent comme la boite entiere.
function _lisibiliteDansForme(clip, w, h, x, y) {
  if (x < 0 || y < 0 || x > w || y > h) { return false; }
  var m = String(clip || '').trim().match(/^polygon\((.*)\)$/i), longueur = _lisibFn('_texteHorsLongueur'), jetons = _lisibFn('_texteHorsJetons'), dedans = _lisibFn('_compoDansForme');
  if (!m || !longueur || !jetons || !dedans) { return true; }
  var pts = m[1].split(/,(?![^(]*\))/).map(function (p) { var q = jetons(p.trim()); return q.length === 2 ? [longueur(q[0], w), longueur(q[1], h)] : null; });
  if (pts.length < 3 || pts.some(function (p) { return !p; })) { return true; }
  return dedans({ poly: pts }, x, y);
}

// Les couleurs d'un degrade CSS (linear-gradient(...) en couleurs unies) : liste de couleurs CSS, [] si ce n'est pas un degrade simple.
function _lisibiliteCouleursDegrade(img) {
  img = String(img || ''); if (!/gradient\(/i.test(img)) { return []; }
  var l = img.match(/rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-fA-F]{6}\b/g) || [];
  return l.length >= 2 ? l : [];
}

// ------------------------------------------------------------------------------------------------------------------------------
// Partie navigateur : aucune ligne n'est testee sous Node (js/app.js et les modules d'affichage ne sont pas charges par les tests).
// ------------------------------------------------------------------------------------------------------------------------------
var _LISIB_HORS = '.tete-hors, .tete-hors-colonne, .compo-z, .croi-z, .formes-deco, .forme-deco-edition, .marque-page, .poignees-cv, .poi-l, .poi-h, script, style';

function _lisibiliteGarder(pageEl) {
  try { _lisibiliteGarderCorps(pageEl); } catch (e) { /* un plus : jamais bloquer l'affichage du CV */ }
}
function _lisibiliteGarderCorps(pageEl) {
  if (!pageEl || !pageEl.ownerDocument || !pageEl.querySelectorAll) { return; }
  var doc = pageEl.ownerDocument, vue = doc.defaultView; if (!vue) { return; }
  var cssRgba = _lisibFn('_compoCssRgba'), hexDe = _lisibFn('_compoCssVersHex'), composer = _lisibFn('_compoComposer');
  if (!cssRgba || !hexDe || !composer) { return; }
  // remise a zero (le geste « Regler l'en-tete » et les poignees relancent le dessin sans refaire la page)
  Array.prototype.forEach.call(pageEl.querySelectorAll('[data-lisib]'), function (e) { e.style.removeProperty('color'); e.style.removeProperty('-webkit-text-fill-color'); e.removeAttribute('data-lisib'); });
  Array.prototype.forEach.call(pageEl.querySelectorAll('[data-lisib-place]'), function (e) { e.style.removeProperty('flex-direction'); e.style.removeProperty('gap'); e.style.removeProperty('align-items'); e.style.removeProperty('max-width'); e.removeAttribute('data-lisib-place'); });
  if (pageEl.hasAttribute('data-compo') || pageEl.hasAttribute('data-croi')) { return; }
  var pr = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && pr.width) ? pr.width / pageEl.offsetWidth : 1;
  var sPage = vue.getComputedStyle(pageEl);
  var blanc = '#ffffff', pagePose = cssRgba(sPage.backgroundColor);
  var base = (pagePose && pagePose[3] > 0.5) ? hexDe(sPage.backgroundColor) : blanc;
  // la colonne coloree pleine hauteur : pseudo-element ::before de la page (boite, forme et fond lus tels qu'affiches)
  var colonne = null, pv = vue.getComputedStyle(pageEl, '::before');
  if (pv && pv.content !== 'none' && !pageEl.classList.contains('col-vide')) {
    var cl = cssRgba(pv.backgroundColor), degr = _lisibiliteCouleursDegrade(pv.backgroundImage), larg = parseFloat(pv.width), haut = parseFloat(pv.height);
    if (isFinite(larg) && isFinite(haut) && larg > 10 && haut > 10 && ((cl && cl[3] > 0) || degr.length)) {
      var gauche = parseFloat(pv.left), droite = parseFloat(pv.right);
      var x0 = isFinite(gauche) ? gauche : (isFinite(droite) ? pageEl.offsetWidth - droite - larg : 0), y0 = isFinite(parseFloat(pv.top)) ? parseFloat(pv.top) : 0;
      colonne = { x: x0, y: y0, w: larg, h: haut, clip: pv.clipPath, couleurs: degr.length ? degr : [pv.backgroundColor] };
    } else if (pv.backgroundImage && pv.backgroundImage !== 'none') { return; }   // fond de colonne en image : non compris, on ne touche a rien
  }
  // PLACE : une ligne datee (intitule a gauche, date a droite) qui commence dans la colonne coloree de gauche mais dont la date sort du fond colore (texte blanc qui continue sur le papier) :
  // la ligne est bornee a la colonne coloree et la date passe SOUS l'intitule (decision de Denis, 26/10/2026). Les lignes qui tiennent, ou qui sont dans l'autre colonne, ne bougent pas.
  if (colonne && colonne.x + colonne.w / 2 < pageEl.offsetWidth / 2) {
    var droiteCol = colonne.x + colonne.w;
    Array.prototype.forEach.call(pageEl.querySelectorAll('.ligne'), function (row) {
      if (row.closest(_LISIB_HORS)) { return; }
      var d = null; for (var c = 0; c < row.children.length; c++) { if (row.children[c].classList && row.children[c].classList.contains('dates')) { d = row.children[c]; } }
      if (!d) { return; }
      var rr = row.getBoundingClientRect(), left = (rr.left - pr.left) / k, droiteDate = (d.getBoundingClientRect().right - pr.left) / k;
      if (left < colonne.x + 2 || left > droiteCol - 20) { return; }   // ne commence pas dans la colonne coloree
      if (droiteDate <= droiteCol - 2) { return; }                     // tient dans la colonne
      row.style.setProperty('flex-direction', 'column'); row.style.setProperty('gap', '0'); row.style.setProperty('align-items', 'flex-start'); row.style.setProperty('max-width', Math.max(40, Math.floor(droiteCol - left - 8)) + 'px'); row.setAttribute('data-lisib-place', '1');
    });
  }
  var marcheur = doc.createTreeWalker(pageEl, 4, null, false), n, parElement = [];
  while ((n = marcheur.nextNode())) {
    if (!/\S/.test(n.nodeValue)) { continue; }
    var p = n.parentElement; if (!p || p.closest(_LISIB_HORS)) { continue; }
    var st = vue.getComputedStyle(p); if (st.display === 'none' || st.visibility === 'hidden') { continue; }
    var rg = doc.createRange(); rg.selectNodeContents(n); var q = rg.getBoundingClientRect(); if (q.width < 2 || q.height < 2) { continue; }
    var enregistre = null;
    for (var i = 0; i < parElement.length; i++) { if (parElement[i].p === p) { enregistre = parElement[i]; break; } }
    if (!enregistre) { enregistre = { p: p, items: [] }; parElement.push(enregistre); }
    enregistre.items.push(q);
  }
  parElement.forEach(function (o) {
    var p = o.p, st = vue.getComputedStyle(p);
    var cTexte = cssRgba(st.webkitTextFillColor) || cssRgba(st.color); if (!cTexte || cTexte[3] < 0.5) { return; }
    var texteHex = hexDe(st.webkitTextFillColor && cssRgba(st.webkitTextFillColor) ? st.webkitTextFillColor : st.color);
    // couches derriere le texte : les ancetres (du plus exterieur au plus interieur), jamais plus de ce qu'on comprend
    var chaine = []; for (var e = p; e && e !== pageEl; e = e.parentElement) { chaine.unshift(e); }
    var inconnu = false, couches = [];
    chaine.forEach(function (e) {
      var se = vue.getComputedStyle(e);
      if (parseFloat(se.opacity) < 1 || (se.mixBlendMode && se.mixBlendMode !== 'normal') || (se.filter && se.filter !== 'none')) { inconnu = true; }
      if (se.backgroundImage && se.backgroundImage !== 'none' && !_lisibiliteCouleursDegrade(se.backgroundImage).length) { inconnu = true; }
      ['::before', '::after'].forEach(function (ps) {
        var s2 = vue.getComputedStyle(e, ps); if (!s2 || s2.content === 'none') { return; }
        var c2 = cssRgba(s2.backgroundColor), degr2 = _lisibiliteCouleursDegrade(s2.backgroundImage), visible = (c2 && c2[3] > 0) || (s2.backgroundImage && s2.backgroundImage !== 'none');
        if (!visible) { return; }
        var w2 = parseFloat(s2.width), h2 = parseFloat(s2.height);
        if (isFinite(w2) && isFinite(h2) && (w2 < 30 || h2 < 30)) { return; }   // petite puce ou filet decoratif
        // un ::before dessine un fond SOUS le texte (forme decoupee d'un bandeau) : sa boite, sa forme et sa couleur sont lues telles qu'affichees ; un ::after (au-dessus du texte) reste inconnu
        var l2 = parseFloat(s2.left), t2 = parseFloat(s2.top);
        if (ps === '::before' && s2.position === 'absolute' && isFinite(w2) && isFinite(h2) && isFinite(l2) && isFinite(t2) && (s2.backgroundImage === 'none' || degr2.length) && (!s2.mixBlendMode || s2.mixBlendMode === 'normal') && (!s2.filter || s2.filter === 'none')) {
          var er = e.getBoundingClientRect();
          couches.push({ e: e, x: (er.left - pr.left) / k + l2, y: (er.top - pr.top) / k + t2, w: w2, h: h2, clip: s2.clipPath, couleurs: degr2.length ? degr2 : [s2.backgroundColor] });
          return;
        }
        inconnu = true;
      });
    });
    if (inconnu) { return; }
    // Texte de l'en-tete a deux tons : la partie qui sort de la forme est deja reprise par la copie `.tete-hors` (couleur du bandeau) ; seuls les points DANS une couche coloree comptent.
    var teteP = p.closest('.tete'), deuxTons = !!(teteP && !teteP.classList.contains('tete-vide') && String(vue.getComputedStyle(teteP).getPropertyValue('--hors-actif')).trim() === '1');
    var fondsTotal = [], fondsCouleur = [];
    o.items.forEach(function (q) {
      // une grille de points sur le texte (5 en largeur, 3 en hauteur) : un texte a cheval sur le bord d'une forme est vu des deux cotes
      var gx = [], gy = [], i2, j2;
      for (i2 = 0; i2 < 5; i2++) { gx.push((q.left + 1 + (q.width - 2) * i2 / 4 - pr.left) / k); }
      for (j2 = 0; j2 < 3; j2++) { gy.push((q.top + q.height * (0.25 + 0.25 * j2) - pr.top) / k); }
      var pointsXY = []; gy.forEach(function (yy) { gx.forEach(function (xx) { pointsXY.push([xx, yy]); }); });
      pointsXY.forEach(function (pt) {
        var x = pt[0], y = pt[1];
        var fonds = [base];
        if (colonne && _lisibiliteDansForme(colonne.clip, colonne.w, colonne.h, x - colonne.x, y - colonne.y)) {
          fonds = colonne.couleurs.map(function (c) { return composer(base, c); });
        }
        chaine.forEach(function (e) {
          var se = vue.getComputedStyle(e), degr = _lisibiliteCouleursDegrade(se.backgroundImage);
          if (degr.length) { fonds = degr.map(function (c) { return composer(fonds[0], c); }); }
          else { fonds = fonds.map(function (f) { return composer(f, se.backgroundColor); }); }
          couches.forEach(function (cc) {
            if (cc.e === e && _lisibiliteDansForme(cc.clip, cc.w, cc.h, x - cc.x, y - cc.y)) { var dessous = fonds[0]; fonds = cc.couleurs.map(function (c) { return composer(dessous, c); }); }
          });
        });
        fondsTotal = fondsTotal.concat(fonds);
        if (fonds.length !== 1 || fonds[0] !== base) { fondsCouleur = fondsCouleur.concat(fonds); }
      });
    });
    var c = _lisibiliteDecision(texteHex, deuxTons ? fondsCouleur : fondsTotal, _LISIBILITE_SEUIL);
    if (!c) { return; }
    p.style.setProperty('color', c, 'important'); p.style.setProperty('-webkit-text-fill-color', c, 'important'); p.setAttribute('data-lisib', '1');
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { _lisibiliteDecision: _lisibiliteDecision, _lisibiliteDansForme: _lisibiliteDansForme, _lisibiliteCouleursDegrade: _lisibiliteCouleursDegrade };
}
