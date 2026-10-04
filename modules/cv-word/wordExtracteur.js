/* ============================================================
   modules/cv-word/wordExtracteur.js  (2026-09-27)
   Export du CV en Word depuis le rendu du PDF : EXTRACTEUR (navigateur seulement).
   Lit le DOM FINAL de la page du CV (positions, styles calcules) et produit un PLAN DE PAGE (voir wordPaquet.js)
   que l'ecrivain transforme en .docx. Aucune logique de mise en page du PDF n'est recopiee : on lit la geometrie reelle.

   Principes (cahier de chantier, § 4.4) :
   - le texte reste du vrai texte (paragraphes, tableaux) ; les fonds, bandeaux, formes sont des decors sans texte ;
   - la structure vient de la geometrie : des blocs cote a cote forment un tableau, des blocs empiles forment des paragraphes ;
   - espacements et interlignes sont MESURES (interligne exact = pas de ligne mesure), pas recalcules depuis le CSS.
   ============================================================ */

var WordExtracteur = (function () {
  var U = (typeof WordUnites !== 'undefined') ? WordUnites : null;
  var C = (typeof WordCouleurs !== 'undefined') ? WordCouleurs : null;

  var CLASSES_IGNOREES = /(^|\s)(ctl-exp|poi-l|poi-h|poi-b|x|rc-poignee|marque-page)(\s|$)/;
  var BALISES_IGNOREES = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, BUTTON: 1, TEMPLATE: 1 };

  function extraire(doc, options) {
    var opts = options || {};
    var win = doc.defaultView;
    // « Remplir la page » (Mini CV A5, 2 exemplaires cote a cote ou empiles sur une feuille A4, cvPdfTemplateA5.js) : la vraie racine
    // est alors .feuille-a4-remplie (deux .page-a5 a l'interieur) -- cherchee AVANT .page-a5 seul, sinon on ne prendrait qu'un exemplaire.
    var cv = opts.racine || doc.querySelector('#conteneurPage .cv') || doc.querySelector('.page-a4') || doc.querySelector('.feuille-a4-remplie') || doc.querySelector('.page-a5');
    if (!cv) { throw new Error('Page du CV introuvable'); }
    var base = cv.getBoundingClientRect();
    // Hauteur d'UNE page (jamais la hauteur totale d'un CV sur plusieurs pages, voir base.height plus bas) : lue directement sur le
    // min-height CSS de la page (.page-a4 = 297 mm, .page-a5 = 210 ou 148 mm selon l'orientation, cvPdfTemplateA4/A5.js) -- s'adapte
    // seule a n'importe quel format de page, jamais une valeur A4 ecrite en dur. .feuille-a4-remplie n'a pas de min-height propre
    // (sa hauteur vient de ses 2 pages A5 empilees/cote a cote) : dans ce cas, ou tout autre cas non prevu, on prend sa vraie hauteur
    // mesuree (base.height) -- toujours juste ici puisque ce conteneur ne fait jamais plusieurs pages.
    var HAUTEUR_PAGE_PX = (function () {
      var v = parseFloat(win.getComputedStyle(cv).minHeight);
      if (isFinite(v) && v > 0) { return v; }
      if (opts.hauteurPagePx) { return opts.hauteurPagePx; }
      return base.height > 0 ? base.height : 1122.52;
    })();
    var avertissements = [];
    var decors = [];
    var vus = new WeakSet();
    var absolusTraites = new WeakSet();
    var imagesEnAttente = [];   // icones SVG : converties en PNG (asynchrone) par extraireAsync   // enfants a position absolue deja traites : ils ne comptent plus dans la structure de leur parent
    var ordreZ = 0;

    function cs(el, pseudo) { return win.getComputedStyle(el, pseudo || null); }
    function px(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
    function rect(el) {
      var r = el.getBoundingClientRect();
      return { x: r.left - base.left, y: r.top - base.top, l: r.width, h: r.height, r: r.right - base.left, b: r.bottom - base.top };
    }
    function rectPlage(r) { return { x: r.left - base.left, y: r.top - base.top, l: r.width, h: r.height, r: r.right - base.left, b: r.bottom - base.top }; }
    function zoomDe(el) {
      var z = 1;
      for (var e = el; e && e.nodeType === 1; e = e.parentElement) { var v = parseFloat(cs(e).zoom); if (isFinite(v) && v > 0 && v !== 1) { z *= v; } }
      return z;
    }
    function ignore(el) {
      if (BALISES_IGNOREES[el.tagName]) { return true; }
      if (typeof el.className === 'string' && CLASSES_IGNOREES.test(el.className)) { return true; }
      var s = cs(el);
      return s.display === 'none' || s.visibility === 'hidden';
    }
    function estInlineNiveau(n) {
      if (n.nodeType === 3) { return true; }
      if (n.nodeType !== 1) { return false; }
      if (estPastilleIcone(n)) { return true; }
      var d = cs(n).display;
      // un titre (ou tout bloc a fond) en « inline-flex » reste un bloc : son fond et ses bordures suivent son paragraphe
      if (d === 'inline-flex' && !estPastilleIcone(n) && (/^H[1-6]$/.test(n.tagName) || couleurHex(cs(n).backgroundColor, true))) { return false; }
      return d === 'inline' || d === 'inline-block' || d === 'inline-flex' || d === 'contents' || n.tagName === 'BR' || n.tagName === 'IMG' && d.indexOf('inline') === 0;
    }
    function noeudsUtiles(el) {
      return Array.prototype.filter.call(el.childNodes, function (n) {
        if (n.nodeType === 3) { return /\S/.test(n.nodeValue); }
        return n.nodeType === 1 && !ignore(n) && !absolusTraites.has(n);
      });
    }
    function toutEnLigne(noeuds) { return noeuds.every(estInlineNiveau); }
    // Comme noeudsUtiles, mais garde les espaces entre elements en ligne (« date : » puis « poste » : l'espace qui les separe compte)
    function noeudsAvecEspaces(el) {
      return Array.prototype.filter.call(el.childNodes, function (n) {
        if (n.nodeType === 3) { return true; }
        return n.nodeType === 1 && !ignore(n) && !absolusTraites.has(n);
      });
    }

    // ---------- couleurs et decors ----------
    function couleurHex(css, surBlanc) {
      var c = C.analyser(css);
      if (!c || c.a <= 0.01) { return null; }
      return C.versHex(surBlanc && c.a < 1 ? C.surFond(c) : c);
    }

    function analyserDegrade(bgImage, r) {
      // linear-gradient(120deg, color, color) : angle CSS -> angle Word ; couleurs deja resolues par le navigateur.
      var m = /linear-gradient\(([^]*)\)\s*$/.exec(bgImage || '');
      if (!m) { return null; }
      var interieur = m[1];
      // separe aux virgules hors parentheses
      var parts = [], prof = 0, cur = '';
      for (var i = 0; i < interieur.length; i++) {
        var ch = interieur[i];
        if (ch === '(') { prof++; } else if (ch === ')') { prof--; }
        if (ch === ',' && prof === 0) { parts.push(cur.trim()); cur = ''; } else { cur += ch; }
      }
      parts.push(cur.trim());
      var angleCss = 180;
      if (/^-?[\d.]+deg$/.test(parts[0])) { angleCss = parseFloat(parts[0]); parts.shift(); }
      else if (/^to /.test(parts[0])) {
        var dir = parts.shift();
        var tab = { 'to top': 0, 'to right': 90, 'to bottom': 180, 'to left': 270, 'to top right': 45, 'to bottom right': 135, 'to bottom left': 225, 'to top left': 315 };
        angleCss = tab[dir] !== undefined ? tab[dir] : 180;
      }
      var couleurs = [], positions = [];
      parts.forEach(function (p) {
        var mm = /^(.*?)(?:\s+([\d.]+)%)?$/.exec(p);
        var hex = couleurHex(mm[1], true);
        if (hex) { couleurs.push(hex); positions.push(mm[2] !== undefined ? parseFloat(mm[2]) / 100 : null); }
      });
      if (couleurs.length < 2) { return null; }
      // CSS : 0deg = vers le haut, 90deg = vers la droite. OOXML : 0 = vers la droite, 90 = vers le bas.
      var angle = (angleCss - 90 + 360) % 360;
      var pos = positions.every(function (p) { return p !== null; }) ? positions : undefined;
      return { genre: 'degrade', couleurs: couleurs, angleDeg: angle, positions: pos };
    }

    function evaluerLongueur(expr, refPx, elRef) {
      // valeurs d'un clip-path : 12%, 34px, 1.5mm, calc(100% - 1.5mm), calc(100% - 4.2mm)
      expr = expr.trim();
      var m = /^calc\((.*)\)$/.exec(expr);
      if (m) {
        var t = m[1].replace(/\s+/g, ' ');
        var mm2 = /^(.+?) ([+-]) (.+)$/.exec(t);
        if (!mm2) { return evaluerLongueur(t, refPx); }
        var a = evaluerLongueur(mm2[1], refPx), b = evaluerLongueur(mm2[3], refPx);
        return mm2[2] === '+' ? a + b : a - b;
      }
      var n = parseFloat(expr);
      if (/%$/.test(expr)) { return n / 100 * refPx; }
      if (/mm$/.test(expr)) { return n * 96 / 25.4; }
      if (/cm$/.test(expr)) { return n * 96 / 2.54; }
      if (/px$/.test(expr) || /^-?[\d.]+$/.test(expr)) { return n; }
      return 0;
    }
    function analyserClipPath(clip, l, h) {
      var m = /^polygon\((.*)\)$/.exec((clip || '').trim());
      if (!m) { return null; }
      var pts = [], prof = 0, cur = '', bruts = [];
      for (var i = 0; i < m[1].length; i++) {
        var ch = m[1][i];
        if (ch === '(') { prof++; } else if (ch === ')') { prof--; }
        if (ch === ',' && prof === 0) { bruts.push(cur.trim()); cur = ''; } else { cur += ch; }
      }
      bruts.push(cur.trim());
      bruts.forEach(function (p) {
        // "x y" ou "calc(...) y" : le premier separateur d'espace hors parentheses
        var j = 0, pr = 0, coupe = -1;
        for (; j < p.length; j++) { if (p[j] === '(') { pr++; } else if (p[j] === ')') { pr--; } else if (p[j] === ' ' && pr === 0) { coupe = j; break; } }
        if (coupe < 0) { return; }
        pts.push([evaluerLongueur(p.slice(0, coupe), l), evaluerLongueur(p.slice(coupe + 1), h)]);
      });
      return pts.length >= 3 ? pts : null;
    }

    function ajouterDecor(f) { f.ordreZ = ordreZ++; decors.push(f); }

    // Couleur du decor visible derriere le point (x, y) : dernier decor plein ou degrade qui le contient (degrade lu a la position du point).
    function fondEn(x, y) {
      for (var i = decors.length - 1; i >= 0; i--) {
        var d = decors[i];
        if (!d.remplissage || d.genre === 'image' || d.genre === 'texteVertical') { continue; }
        if (x < d.xPx || x > d.xPx + d.lPx || y < d.yPx || y > d.yPx + d.hPx) { continue; }
        var r = d.remplissage;
        if (r.genre === 'uni') { if (r.alpha !== undefined && r.alpha < 0.99) { continue; } return r.couleur; }
        if (r.genre === 'degrade' && r.couleurs.length >= 2) {
          var ang = (r.angleDeg || 0) * Math.PI / 180;
          var dx = Math.cos(ang), dy = Math.sin(ang);
          var longueur = Math.abs(d.lPx * dx) + Math.abs(d.hPx * dy) || 1;
          var t = ((x - (d.xPx + d.lPx / 2)) * dx + (y - (d.yPx + d.hPx / 2)) * dy) / longueur + 0.5;
          t = Math.max(0, Math.min(1, t));
          var pos = r.couleurs.length - 1, k = Math.min(pos - 1, Math.floor(t * pos)), u = t * pos - k;
          var c1 = C.analyser('#' + r.couleurs[k]), c2 = C.analyser('#' + r.couleurs[k + 1]);
          return C.versHex({ r: c1.r + (c2.r - c1.r) * u, g: c1.g + (c2.g - c1.g) * u, b: c1.b + (c2.b - c1.b) * u, a: 1 });
        }
      }
      return null;
    }

    function decorRectangle(r, s, aFond, pseudoCle) {
      var rayon = Math.min(px(s.borderTopLeftRadius), px(s.borderTopRightRadius), px(s.borderBottomLeftRadius), px(s.borderBottomRightRadius));
      var rayonMax = Math.max(px(s.borderTopLeftRadius), px(s.borderTopRightRadius), px(s.borderBottomLeftRadius), px(s.borderBottomRightRadius));
      var rem = null;
      var cFond = C.analyser(s.backgroundColor);
      var hex = (cFond && cFond.a > 0.01) ? C.versHex(cFond) : null;
      if (s.backgroundImage && s.backgroundImage !== 'none') { rem = analyserDegrade(s.backgroundImage); }
      if (!rem && hex) { rem = { genre: 'uni', couleur: hex }; if (cFond.a < 0.99) { rem.alpha = cFond.a; } }
      if (!rem) { return; }
      var pts = null;
      if (s.clipPath && s.clipPath !== 'none') { pts = analyserClipPath(s.clipPath, r.l, r.h); }
      var f = { xPx: r.x, yPx: r.y, lPx: r.l, hPx: r.h, remplissage: rem };
      // superposition du PDF (z-index positif) : sans elle, l'ordre du code HTML decidait seul (le petit coin de la frise etait cache par la colonne)
      var zCss = parseInt(s.zIndex, 10); if (zCss > 0) { f._z = zCss; }
      if (pts) { f.genre = 'polygone'; f.points = pts; }
      else if (rayonMax >= Math.min(r.l, r.h) / 2 - 0.5 && Math.abs(r.l - r.h) < 2) { f.genre = 'ellipse'; }
      else if (rayonMax > 0.5) { f.genre = 'rectArrondi'; f.rayonPx = rayonMax; }
      else { f.genre = 'rect'; }
      ajouterDecor(f);
    }

    function decorBordures(r, s) {
      var cotes = [['Top', 'haut'], ['Right', 'droite'], ['Bottom', 'bas'], ['Left', 'gauche']];
      var largeurs = {}, couleurs = {}, tous = true, premier = null;
      cotes.forEach(function (c) {
        var w = px(s['border' + c[0] + 'Width']);
        var st = s['border' + c[0] + 'Style'];
        var col = couleurHex(s['border' + c[0] + 'Color'], true);
        if (st === 'none' || st === 'hidden' || w <= 0 || !col) { tous = false; largeurs[c[1]] = 0; return; }
        largeurs[c[1]] = w; couleurs[c[1]] = col;
        if (premier === null) { premier = w + col; } else if (premier !== w + col) { tous = false; }
      });
      var nb = ['haut', 'droite', 'bas', 'gauche'].filter(function (k) { return largeurs[k] > 0; }).length;
      if (nb === 0) { return; }
      var rayon = Math.max(px(s.borderTopLeftRadius), px(s.borderTopRightRadius));
      if (nb === 4 && tous) {
        var w = largeurs.haut;
        var f = { genre: rayon > 0.5 ? 'rectArrondi' : 'rect', xPx: r.x + w / 2, yPx: r.y + w / 2, lPx: Math.max(1, r.l - w), hPx: Math.max(1, r.h - w), rayonPx: Math.max(0, rayon - w / 2), remplissage: null, contour: { couleur: couleurs.haut, epaisseurPx: w } };
        ajouterDecor(f);
        return;
      }
      if (largeurs.haut) { ajouterDecor({ genre: 'rect', xPx: r.x, yPx: r.y, lPx: r.l, hPx: largeurs.haut, remplissage: { genre: 'uni', couleur: couleurs.haut } }); }
      if (largeurs.bas) { ajouterDecor({ genre: 'rect', xPx: r.x, yPx: r.b - largeurs.bas, lPx: r.l, hPx: largeurs.bas, remplissage: { genre: 'uni', couleur: couleurs.bas } }); }
      if (largeurs.gauche) { ajouterDecor({ genre: 'rect', xPx: r.x, yPx: r.y, lPx: largeurs.gauche, hPx: r.h, remplissage: { genre: 'uni', couleur: couleurs.gauche } }); }
      if (largeurs.droite) { ajouterDecor({ genre: 'rect', xPx: r.r - largeurs.droite, yPx: r.y, lPx: largeurs.droite, hPx: r.h, remplissage: { genre: 'uni', couleur: couleurs.droite } }); }
    }

    // Decors d'un element : fond, degrade, bordures, forme decoupee, pseudo-elements decoratifs absolus.
    // options.sansFond : le fond est traite par le paragraphe (ombrage), options.sansBordures : idem pour les bordures.
    function decorsDe(el, options) {
      if (vus.has(el)) { return; }
      vus.add(el);
      var o = options || {};
      var s = cs(el);
      var r = rect(el);
      var estPage = (el === cv);
      if (r.l > 0.5 && r.h > 0.5) {
        var aFond = !o.sansFond && !estPage && ((couleurHex(s.backgroundColor, true) !== null) || (s.backgroundImage && s.backgroundImage !== 'none'));
        if (aFond) { decorRectangle(r, s, true); }
        if (!o.sansBordures) { decorBordures(r, s); }
      }
      if (r.l > 0.5 && r.h > 0.5 && s.boxShadow && s.boxShadow !== 'none') {
        var ombres = [], prof = 0, cur = '';
        for (var ii = 0; ii < s.boxShadow.length; ii++) {
          var ch = s.boxShadow[ii];
          if (ch === '(') { prof++; } else if (ch === ')') { prof--; }
          if (ch === ',' && prof === 0) { ombres.push(cur.trim()); cur = ''; } else { cur += ch; }
        }
        ombres.push(cur.trim());
        ombres.forEach(function (o) {
          if (!/inset/.test(o)) { return; }
          var couleurMatch = /(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-fA-F]{3,8})/.exec(o);
          var nombres = o.replace(couleurMatch ? couleurMatch[0] : '', '').replace('inset', '').trim().split(/\s+/).map(parseFloat);
          if (!couleurMatch || nombres.length < 4 || nombres[2] !== 0 || nombres[0] !== 0 || nombres[1] !== 0 || !(nombres[3] > 0)) { return; }
          var hexOmbre = couleurHex(couleurMatch[0], true);
          if (!hexOmbre) { return; }
          var w2 = nombres[3];
          ajouterDecor({ genre: 'rect', xPx: r.x + w2 / 2, yPx: r.y + w2 / 2, lPx: r.l - w2, hPx: r.h - w2, remplissage: null, contour: { couleur: hexOmbre, epaisseurPx: w2 } });
        });
      }
      ['::before', '::after'].forEach(function (pseudo) {
        var p = cs(el, pseudo);
        if (!p || p.content === 'none' || p.content === 'normal') { return; }
        if (p.position !== 'absolute') { return; }
        var hasFond = couleurHex(p.backgroundColor, true) !== null || (p.backgroundImage && p.backgroundImage !== 'none');
        if (!hasFond) { return; }
        var w = px(p.width), h = px(p.height);
        var x = r.x + px(p.left), y = r.y + px(p.top);
        if (p.left === 'auto' && p.right !== 'auto') { x = r.r - px(p.right) - w; }
        if (p.top === 'auto' && p.bottom !== 'auto') { y = r.b - px(p.bottom) - h; }
        if (w > 0.5 && h > 0.5) { decorRectangle({ x: x, y: y, l: w, h: h, r: x + w, b: y + h }, p, true); }
      });
    }

    // ---------- texte : styles et morceaux ----------
    function familleDe(s) {
      var f = (s.fontFamily || '').split(',')[0].replace(/["']/g, '').trim();
      return f || 'Arial';
    }
    function styleTexte(el, extra) {
      var s = cs(el);
      var fam = familleDe(s);
      var taillePx = px(s.fontSize) * zoomDe(el);
      var poids = parseInt(s.fontWeight, 10);
      var deco = s.textDecorationLine || s.textDecoration || '';
      // Le soulignement d'un element « en ligne » se transmet a son texte (un titre souligne par <span style="text-decoration:underline"> autour d'un autre <span>) : on remonte les
      // elements en ligne (corrige le 2026-10-02 : le « S » des titres de formations et d'experience personnelle n'arrivait pas dans le Word).
      if (!/underline/.test(deco)) {
        for (var anc = el.parentElement, prof = 0; anc && prof < 6; anc = anc.parentElement, prof++) {
          var sa = cs(anc), da = sa.textDecorationLine || '';
          if (/underline/.test(da)) { deco = da; break; }
          if (sa.display !== 'inline') { break; }
        }
      }
      var couleur = couleurHex(s.color, true) || '000000';
      var st = {
        police: fam, tailleDemiPts: U.pxVersDemiPoints(taillePx, fam), echelleLargeurPct: U.echelleLargeurPct(taillePx, fam), gras: (poids >= 600 || s.fontWeight === 'bold'), italique: s.fontStyle === 'italic',
        souligne: /underline/.test(deco), couleur: couleur, capitales: s.textTransform === 'uppercase',
        espacementPx: (s.letterSpacing && s.letterSpacing !== 'normal') ? px(s.letterSpacing) : 0
      };
      if (extra && extra.ombrage) { st.ombrage = extra.ombrage; }
      return st;
    }

    function estPastille(el) {
      if (el.nodeType !== 1) { return false; }
      var s = cs(el);
      if (s.display !== 'inline-block' && s.display !== 'inline') { return false; }
      return couleurHex(s.backgroundColor, true) !== null && /\S/.test(el.textContent || '');
    }

    function contenuPseudo(el, pseudo, extra) {
      var p = cs(el, pseudo);
      if (!p || p.content === 'none' || p.content === 'normal') { return null; }
      if (p.position === 'absolute') { return null; }
      var c = p.content;
      var mm = /^"([^]*)"$/.exec(c);
      if (!mm) { return null; }
      var txt = mm[1];
      if (txt !== '') {
        var st = styleTexte(el, extra);
        var couleur = couleurHex(p.color, true);
        if (couleur) { st.couleur = couleur; }
        st.texte = (extra && extra.insecable) ? txt.replace(/^ /, String.fromCharCode(160)) : txt;
        return st;
      }
      // pseudo-element decoratif en ligne (petit carre ou rond de couleur) : un caractere plein colore
      var w = px(p.width), h = px(p.height);
      var fond = C.analyser(p.backgroundColor);
      if (w > 1 && h > 1 && fond && fond.a > 0.01 && (p.display === 'inline-block' || p.display === 'block')) {
        var op = parseFloat(p.opacity);
        var col = C.surFond({ r: fond.r, g: fond.g, b: fond.b, a: fond.a * (isFinite(op) ? op : 1) });
        var rond = px(p.borderTopLeftRadius) >= Math.min(w, h) / 2 - 0.5;
        var famille = familleDe(cs(el));
        return {
          texte: rond ? '●' : '■', police: 'Arial', tailleDemiPts: U.pxVersDemiPoints(w * 1.67, 'arial'), gras: false, italique: false, souligne: false,
          couleur: C.versHex(col), capitales: false, espacementPx: px(p.marginRight), _puceDecor: true, _famille: famille
        };
      }
      return null;
    }

    function marqueSvg(svg) {
      var clone = svg.cloneNode(true);
      var sv = cs(svg);
      var couleur = sv.color;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      var r = svg.getBoundingClientRect();
      clone.setAttribute('width', r.width); clone.setAttribute('height', r.height);
      if (sv.stroke && sv.stroke !== 'none') { clone.setAttribute('stroke', sv.stroke); }
      clone.removeAttribute('class'); clone.removeAttribute('style');
      return new win.XMLSerializer().serializeToString(clone).replace(/currentColor/g, couleur);
    }
    function imageSvg(svg) {
      var rs = rect(svg);
      if (rs.l < 1 || rs.h < 1) { return null; }
      var markup = marqueSvg(svg);
      var im = { type: 'png', donnees: null, cle: 'svg:' + markup.length + ':' + markup.slice(-60), lPx: rs.l, hPx: rs.h, alt: '', _svg: { markup: markup, l: rs.l, h: rs.h } };
      return im;
    }
    // Pastille d'icone : element en ligne a fond (souvent rond) qui ne contient qu'une icone SVG : une seule image (fond + icone)
    function estPastilleIcone(n) {
      if (n.nodeType !== 1 || n.children.length !== 1 || n.firstElementChild.tagName.toLowerCase() !== 'svg' || /\S/.test(n.textContent || '')) { return false; }
      var st = cs(n);
      return /inline|flex|block/.test(st.display) && (couleurHex(st.backgroundColor, true) !== null);
    }
    function imagePastilleIcone(n) {
      var rn = rect(n), svg = n.firstElementChild, rs = rect(svg), st = cs(n);
      if (rn.l < 1 || rn.h < 1) { return null; }
      var bg = C.analyser(st.backgroundColor);
      var rayon = Math.max(px(st.borderTopLeftRadius), px(st.borderTopRightRadius));
      var forme = rayon >= Math.min(rn.l, rn.h) / 2 - 0.5 ? '<ellipse cx="' + (rn.l / 2) + '" cy="' + (rn.h / 2) + '" rx="' + (rn.l / 2) + '" ry="' + (rn.h / 2) + '"' : '<rect width="' + rn.l + '" height="' + rn.h + '" rx="' + Math.min(rayon, rn.l / 2) + '"';
      var fond = forme + ' fill="' + C.versHex(bg).replace(/^/, '#') + '"' + (bg.a < 0.99 ? ' fill-opacity="' + bg.a + '"' : '') + '/>';
      var interne = marqueSvg(svg).replace(/^<svg /, '<svg x="' + (rs.x - rn.x) + '" y="' + (rs.y - rn.y) + '" ');
      var markup = '<svg xmlns="http://www.w3.org/2000/svg" width="' + rn.l + '" height="' + rn.h + '" viewBox="0 0 ' + rn.l + ' ' + rn.h + '">' + fond + interne + '</svg>';
      var im = { type: 'png', donnees: null, cle: 'pastille:' + markup.length + ':' + markup.slice(-60), lPx: rn.l, hPx: rn.h, alt: '', _svg: { markup: markup, l: rn.l, h: rn.h } };
      return im;
    }
    function ajouterTexte(runs, texte, st) {
      if (texte === '') { return; }
      var dernier = runs[runs.length - 1];
      var cle = function (r) { return [r.police, r.tailleDemiPts, r.echelleLargeurPct, r.gras, r.italique, r.souligne, r.couleur, r.capitales, r.espacementPx, r.ombrage || ''].join('|'); };
      // text-transform: uppercase : le texte est mis en capitales (Word retire les accents des capitales avec la propriete « capitales »).
      var nouveau = Object.assign({}, st, { texte: st.capitales ? texte.toUpperCase() : texte });
      if (st.capitales) { nouveau.capitales = false; }
      if (dernier && !dernier.image && !dernier._puceDecor && !nouveau._puceDecor && cle(dernier) === cle(nouveau)) { dernier.texte += nouveau.texte; }
      else { runs.push(nouveau); }
    }

    function imageDe(img, r) {
      var src = img.currentSrc || img.src || '';
      var m = /^data:image\/(png|jpeg|jpg|gif);base64,([^]*)$/.exec(src);
      if (!m) { avertissements.push('image non intégrée (source non locale)'); return null; }
      var s = cs(img);
      var nw = img.naturalWidth || r.l, nh = img.naturalHeight || r.h;
      var rogne = null;
      if (s.objectFit === 'cover' && nw > 0 && nh > 0) {
        var ech = Math.max(r.l / nw, r.h / nh);
        var vw = r.l / ech, vh = r.h / ech;
        var pos = (s.objectPosition || '50% 50%').split(' ');
        var px2 = /%$/.test(pos[0]) ? parseFloat(pos[0]) / 100 : 0.5;
        var py2 = /%$/.test(pos[1] || '') ? parseFloat(pos[1]) / 100 : 0.5;
        var cx = (nw - vw) * px2, cy = (nh - vh) * py2;
        rogne = { gauche: cx / nw * 100, haut: cy / nh * 100, droite: (nw - vw - cx) / nw * 100, bas: (nh - vh - cy) / nh * 100 };
      }
      var rayon = Math.max(px(s.borderTopLeftRadius), px(s.borderTopRightRadius));
      var geom = 'rect';
      if (s.clipPath && s.clipPath !== 'none') { var pp = analyserClipPath(s.clipPath, r.l, r.h); if (pp && pp.length === 4) { geom = 'losange'; } }
      else if (rayon >= Math.min(r.l, r.h) / 2 - 0.5) { geom = 'ellipse'; }
      else if (rayon > 0.5) { geom = 'rectArrondi'; }
      var contour = null;
      var bw = px(s.borderTopWidth);
      if (bw > 0 && s.borderTopStyle !== 'none') { contour = { couleur: couleurHex(s.borderTopColor, true) || 'FFFFFF', epaisseurPx: bw }; }
      return { donnees: m[2], type: m[1] === 'jpg' ? 'jpeg' : m[1], cle: 'img:' + m[2].length + ':' + m[2].slice(0, 40) + ':' + m[2].slice(-40), lPx: r.l, hPx: r.h, geometrie: geom, rayonPx: rayon, rognagePct: rogne, contour: contour, alt: img.getAttribute('alt') || '' };
    }

    // Texte d'un noeud avec un saut de ligne a chaque changement de ligne mesure dans le navigateur.
    function avecCoupures(n, t) {
      var v = n.nodeValue, re = /\S+/g, m, mots = [];
      while ((m = re.exec(v)) !== null) {
        var rg = doc.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        var q = rg.getClientRects();
        if (!q.length) { return t; }
        mots.push({ t: m[0], y: q[0].top, h: q[0].height });
      }
      if (mots.length < 2) { return t; }
      var sortie = /^\s/.test(v) ? ' ' : '';
      mots.forEach(function (w, i) { sortie += (i === 0 ? '' : (w.y > mots[i - 1].y + w.h * 0.5 ? String.fromCharCode(10) : ' ')) + w.t; });
      return sortie + (/\s$/.test(v) ? ' ' : '');
    }

    // Morceaux de texte (runs) d'une liste de noeuds.
    function collecterRuns(noeuds, runs, extra) {
      noeuds.forEach(function (n) {
        if (n.nodeType === 3) {
          var t = n.nodeValue.replace(/[ \t\r\n\f]+/g, ' ');
          // bloc en ligne sur plusieurs lignes dans le navigateur : les coupures du navigateur deviennent des sauts de ligne (Word coupe ailleurs sinon)
          if (extra && extra.coupures) { t = avecCoupures(n, t); }
          // dans une pastille (bloc en ligne insecable dans le navigateur), les espaces sont insecables : la pastille ne se coupe pas entre deux lignes
          if (extra && extra.insecable) { t = t.replace(/ /g, String.fromCharCode(160)); }
          if (t !== '') { ajouterTexte(runs, t, styleTexte(n.parentElement, extra)); }
          return;
        }
        if (n.nodeType !== 1 || ignore(n)) { return; }
        if (n.tagName === 'BR') { runs.push({ texte: '\n', police: familleDe(cs(n)) }); return; }
        if (n.tagName === 'IMG') {
          var im = imageDe(n, rect(n));
          if (im) { runs.push({ image: im }); }
          return;
        }
        if (n.tagName === 'svg' || n.tagName === 'SVG') {
          var ims = imageSvg(n);
          if (ims) {
            runs.push({ image: ims });
            // marge a droite de l'icone : une espace insecable de la taille du texte voisin
            if (px(cs(n).marginRight) > 1.5 && n.parentElement) { var stv = styleTexte(n.parentElement, extra); stv.texte = String.fromCharCode(160); runs.push(stv); }
          }
          return;
        }
        if (estPastilleIcone(n)) {
          var imp = imagePastilleIcone(n);
          var rnb = rect(n);
          if (imp) { runs.push({ _badge: { x: rnb.x, y: rnb.y, image: imp } }); }
          return;
        }
        var ext2 = extra;
        var estBlocEnLigne = (cs(n).display === 'inline-block');
        if (estBlocEnLigne) {
          // un bloc en ligne qui tient sur une seule ligne dans le navigateur ne doit pas se couper dans Word (espaces insecables) ;
          // s'il occupe deja plusieurs lignes dans le navigateur (plus large que la colonne), il se coupe normalement
          var rBloc = rect(n);
          var tailleBloc = px(cs(n).fontSize) * zoomDe(n);
          // et qui n'occupe pas presque toute la largeur de sa ligne (sinon Word couperait un mot faute de place : mieux vaut une coupure normale)
          var largeurParent = n.parentElement ? rect(n.parentElement).l : 0;
          var uneLigne = rBloc.h < tailleBloc * 2.3 && !(largeurParent > 0 && rBloc.l > 0.88 * largeurParent);
          ext2 = Object.assign({}, extra || {}, { insecable: uneLigne, coupures: rBloc.h >= tailleBloc * 2.3 });
        }
        var avant = contenuPseudo(n, '::before', ext2);
        if (avant) { runs.push(avant); }
        if (estPastille(n)) {
          var c = C.analyser(cs(n).backgroundColor);
          var rp = rect(n);
          var derriere = fondEn(rp.x + rp.l / 2, rp.y + rp.h / 2);
          ext2 = Object.assign({}, ext2 || {}, { ombrage: C.versHex(C.surFond(c, derriere ? C.analyser('#' + derriere) : null)), insecable: ext2 && ext2.insecable });
          var couleurTexte = null;
          // pastille qui commence une nouvelle rangee dans le navigateur : saut de ligne explicite (Word mesure les pastilles un peu plus etroites
          // et remonterait la pastille sur la rangee du dessus)
          if (ext2 && ext2.insecable) {
            if (runs._rangeeY !== undefined && rp.y > runs._rangeeY + rp.h * 0.5) { runs.push({ texte: String.fromCharCode(10), police: familleDe(cs(n)), tailleDemiPts: styleTexte(n, ext2).tailleDemiPts }); }
            runs._rangeeY = rp.y;
          }
          runs.push({ texte: ' ', police: familleDe(cs(n)), tailleDemiPts: styleTexte(n, ext2).tailleDemiPts, ombrage: ext2.ombrage, couleur: '000000' });
          collecterRuns(Array.prototype.slice.call(n.childNodes), runs, ext2);
          runs.push({ texte: ' ', police: familleDe(cs(n)), tailleDemiPts: styleTexte(n, ext2).tailleDemiPts, ombrage: ext2.ombrage, couleur: '000000' });
        } else {
          collecterRuns(Array.prototype.slice.call(n.childNodes), runs, ext2);
        }
        var apres = contenuPseudo(n, '::after', ext2);
        if (apres) { runs.push(apres); }
        // marge a droite d'un element en ligne sans fond (liste d'elements separes par une puce) : autant d'espaces insecables que la marge en demande
        if (!estBlocEnLigne && cs(n).display === 'inline' && !estPastille(n) && px(cs(n).marginRight) > 1.5) {
          var stm = styleTexte(n, ext2);
          var nbm = Math.max(1, Math.round(px(cs(n).marginRight) * zoomDe(n) / (px(cs(n).fontSize) * zoomDe(n) * 0.27)));
          stm.texte = new Array(nbm + 1).join(String.fromCharCode(160));
          runs.push(stm);
        }
      });
    }

    function nettoyerRuns(runs) {
      // retire les espaces de debut et de fin de paragraphe, fusionne les espaces doubles
      var badges = runs.filter(function (r) { return r._badge; });
      runs = runs.filter(function (r) { return !r._badge; });
      while (runs.length && !runs[0].image && /^ +$/.test(runs[0].texte) && !runs[0].ombrage) { runs.shift(); }
      while (runs.length && !runs[runs.length - 1].image && /^ +$/.test(runs[runs.length - 1].texte) && !runs[runs.length - 1].ombrage) { runs.pop(); }
      if (runs.length && !runs[0].image && !runs[0].ombrage) { runs[0].texte = runs[0].texte.replace(/^ +/, ''); }
      runs.badges = badges;
      var dern = runs[runs.length - 1];
      if (dern && !dern.image && !dern.ombrage && dern.texte) { dern.texte = dern.texte.replace(/ +$/, ''); }
      var precedentFinEspace = false;
      runs.forEach(function (r) {
        if (r.image) { precedentFinEspace = false; return; }
        if (precedentFinEspace && /^ /.test(r.texte) && !r.ombrage) { r.texte = r.texte.replace(/^ +/, ''); }
        precedentFinEspace = / $/.test(r.texte);
      });
      var filtre = runs.filter(function (r) { return r.image || r.texte !== ''; });
      filtre.badges = badges;
      return filtre;
    }

    // ---------- lignes de texte (pas de ligne mesure) ----------
    function rectsDesNoeuds(noeuds) {
      var rects = [];
      function parcourir(n) {
        if (n.nodeType === 3) {
          if (!/\S/.test(n.nodeValue)) { return; }
          var rg = doc.createRange(); rg.selectNodeContents(n);
          Array.prototype.forEach.call(rg.getClientRects(), function (q) { if (q.width > 0 && q.height > 0) { rects.push(rectPlage(q)); } });
          return;
        }
        if (n.nodeType !== 1 || ignore(n)) { return; }
        var s = cs(n);
        if (n.tagName === 'IMG' || (s.display === 'inline-block' && couleurHex(s.backgroundColor, true))) {
          var q = rect(n);
          var multiLigne = n.tagName !== 'IMG' && q.h > px(s.fontSize) * zoomDe(n) * 2.3;
          if (q.l > 0 && q.h > 0 && !multiLigne) { rects.push(q); }
          if (n.tagName === 'IMG') { return; }
        }
        Array.prototype.forEach.call(n.childNodes, parcourir);
      }
      noeuds.forEach(parcourir);
      return rects;
    }
    function lignesDe(rects) {
      var tries = rects.slice().sort(function (a, b) { return (a.y + a.h / 2) - (b.y + b.h / 2); });
      var lignes = [];
      tries.forEach(function (q) {
        var c = q.y + q.h / 2;
        var l = lignes[lignes.length - 1];
        if (l && Math.abs(c - l.centre) <= Math.min(l.h, q.h) * 0.55) {
          l.haut = Math.min(l.haut, q.y); l.bas = Math.max(l.bas, q.b); l.h = Math.max(l.h, q.h); l.g = Math.min(l.g, q.x); l.d = Math.max(l.d, q.r);
          l.centre = (l.haut + l.bas) / 2;
        } else { lignes.push({ centre: c, haut: q.y, bas: q.b, h: q.h, g: q.x, d: q.r }); }
      });
      return lignes;
    }

    // ---------- paragraphes ----------
    function paragrapheDe(el, noeuds, ctx, options) {
      var o = options || {};
      var runs = [];
      // Petit carre decoratif ::before du paragraphe lui-meme (icone devant une ligne de coordonnees :
      // `.coord div::before`). Jusqu'ici seuls les pseudo-elements des ENFANTS etaient lus : ces carres du PDF
      // manquaient dans le Word (retour de test Denis, 2026-09-29). Limite aux petits carres en ligne, pour ne
      // jamais transformer un trait ou une barre decorative en caractere.
      if (o.pseudoAvantParagraphe !== false && noeuds && el && el.tagName !== 'LI') {
        var carreAvant = contenuPseudo(el, '::before', null);
        var pav = carreAvant ? cs(el, '::before') : null;
        if (carreAvant && carreAvant._puceDecor && pav && pav.display === 'inline-block' &&
            px(pav.width) <= 14 && px(pav.height) <= 14 && Math.abs(px(pav.width) - px(pav.height)) <= 1) {
          runs.push(carreAvant);
        }
      }
      collecterRuns(noeuds, runs, null);
      runs = nettoyerRuns(runs);
      var badgesP = runs.badges || [];
      if (!runs.length) { return null; }
      var s = cs(el);
      var rects = rectsDesNoeuds(noeuds);
      var lignes = lignesDe(rects);
      var r = rect(el);
      var pas;
      var tailleLigneCss = s.lineHeight && s.lineHeight !== 'normal' ? px(s.lineHeight) * zoomDe(el) : px(s.fontSize) * zoomDe(el) * 1.2;
      var haut, bas;
      if (lignes.length >= 2) {
        pas = (lignes[lignes.length - 1].centre - lignes[0].centre) / (lignes.length - 1);
        haut = lignes[0].centre - pas / 2; bas = lignes[lignes.length - 1].centre + pas / 2;
      } else if (lignes.length === 1) {
        pas = Math.max(tailleLigneCss, lignes[0].h);
        if (r.h > 0 && r.h < pas * 1.6 && r.h >= lignes[0].h) { pas = r.h - px(s.paddingTop) - px(s.paddingBottom) - px(s.borderTopWidth) - px(s.borderBottomWidth); }
        if (!(pas > 4)) { pas = Math.max(tailleLigneCss, lignes[0].h); }
        haut = lignes[0].centre - pas / 2; bas = lignes[0].centre + pas / 2;
      } else { return null; }
      if (badgesP.length) {
        badgesP.forEach(function (rb) {
          var b = rb._badge, im = b.image;
          ajouterDecor({ genre: 'image', xPx: b.x, yPx: b.y, lPx: im.lPx, hPx: im.hPx, type: 'png', donnees: null, cle: im.cle, geometrie: 'rect', alt: '', derriereTexte: false, _svg: im._svg });
        });
        o.gaucheTexte = lignes[0].g;
      }
      var p = { genre: 'paragraphe', runs: runs, interligneExactPx: pas, _y: haut, _b: bas, _extraHaut: 0, _extraBas: 0, _colGauche: ctx.gauche };
      // image seule : la ligne s'adapte a l'image (jamais tronquee)
      // (sauf petites images, des icones : le pas de ligne mesure est conserve, sinon Word resserre les lignes d'icones)
      if (runs.some(function (x) { return x.image && x.image.hPx > pas * 0.9; })) { delete p.interligneExactPx; p.interligneMultiple = 1; }
      // alignement
      var ta = s.textAlign;
      p.alignement = ta === 'center' ? 'centre' : (ta === 'right' || ta === 'end' ? 'droite' : (ta === 'justify' ? 'justifie' : 'gauche'));
      // retraits : depuis la zone courante de Word
      var gaucheContenu = lignes.length ? lignes[0].g : r.x;
      var gaucheBloc = r.x + px(s.paddingLeft) + px(s.borderLeftWidth);
      var retrait = Math.max(0, (o.gaucheTexte !== undefined ? o.gaucheTexte : gaucheBloc) - ctx.gauche);
      if (retrait > 0.8) { p.retraitGauchePx = retrait; }
      var droiteBloc = r.r - px(s.paddingRight) - px(s.borderRightWidth);
      var retraitD = ctx.droite - droiteBloc;
      if (retraitD > 1.5 && p.alignement !== 'gauche' || retraitD > 1.5) { p.retraitDroitPx = retraitD; }
      // bordures et fond du bloc (seulement pour un vrai bloc : el a lui-meme le contenu)
      if (o.blocPropre) {
        var bordures = {}, aBordure = false;
        [['Top', 'haut'], ['Right', 'droite'], ['Bottom', 'bas'], ['Left', 'gauche']].forEach(function (c) {
          var w = px(s['border' + c[0] + 'Width']);
          var col = couleurHex(s['border' + c[0] + 'Color'], true);
          if (w > 0 && s['border' + c[0] + 'Style'] !== 'none' && col) {
            bordures[c[1]] = { couleur: col, epaisseurPx: w, style: s['border' + c[0] + 'Style'] === 'dashed' ? 'dashed' : 'solid', espacePt: px(s['padding' + c[0]]) * 0.75 };
            aBordure = true;
          }
        });
        if (aBordure) {
          p.bordures = bordures;
          p._extraHaut = (bordures.haut ? px(s.paddingTop) + bordures.haut.epaisseurPx : 0);
          p._extraBas = (bordures.bas ? px(s.paddingBottom) + bordures.bas.epaisseurPx : 0);
        }
        var cFondP = C.analyser(s.backgroundColor);
        var fond = (cFondP && cFondP.a >= 0.99) ? C.versHex(cFondP) : null;
        var rayon = Math.max(px(s.borderTopLeftRadius), px(s.borderTopRightRadius));
        var pleineLargeur = Math.abs(r.x - ctx.gauche) < 4 && Math.abs(r.r - ctx.droite) < 4;
        if (fond && rayon < 0.5 && pleineLargeur && !(s.backgroundImage && s.backgroundImage !== 'none')) { p.ombrage = fond; o.fondTraite = true; }
        o.bordTraitees = aBordure;
      }
      if (/^H[1-6]$/.test(el.tagName) && lignes.length >= 2 && runs.length === 1 && !runs[0].image) {
        var texteTitre = '', dernierY = null;
        var mots = [];
        (function (n) {
          var t = n.nodeValue || '';
          var re = /\S+/g, m;
          while ((m = re.exec(t)) !== null) {
            var rg = doc.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
            var q = rg.getClientRects();
            if (q.length) { mots.push({ t: m[0], y: q[0].top }); }
          }
        })(el.querySelector('span') && el.querySelector('span').firstChild && el.querySelector('span').firstChild.nodeType === 3 ? el.querySelector('span').firstChild : (el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : { nodeValue: '' }));
        if (mots.length >= 2) {
          mots.forEach(function (w, i) {
            var sep = i === 0 ? '' : ((Math.abs(w.y - dernierY) > 4) ? '\n' : ' ');
            texteTitre += sep + (runs[0].texte.replace(/\s/g, '') === runs[0].texte.replace(/\s/g, '').toUpperCase() ? w.t.toUpperCase() : w.t);
            dernierY = w.y;
          });
          if (texteTitre.replace(/[\s\n]/g, '').toUpperCase() === runs[0].texte.replace(/[\s\n]/g, '').toUpperCase()) { runs[0].texte = texteTitre.replace(/\u00A0/g, ' '); }
        }
      }
      // une seule ligne dans le navigateur : quelques pixels de marge a droite (et a gauche si centre) pour que Word ne la coupe pas
      if (lignes.length === 1 && !runs.some(function (x) { return x.image; })) {
        var marge = Math.min(10, Math.max(0, (o.gaucheTexte !== undefined ? 10 : 10)));
        if (p.alignement === 'centre') { p.retraitGauchePx = (p.retraitGauchePx || 0) - marge / 2; p.retraitDroitPx = (p.retraitDroitPx || 0) - marge / 2; }
        else if (p.alignement === 'droite') { p.retraitGauchePx = (p.retraitGauchePx || 0) - marge; }
        else { p.retraitDroitPx = (p.retraitDroitPx || 0) - marge; }
      }
      // plusieurs lignes : Word mesure le texte 0,2 % plus etroit que le navigateur, un mot a la limite peut donc remonter sur la ligne du dessus ;
      // un peu de retrait a droite garde les coupures du navigateur
      if (lignes.length >= 2 && !runs.some(function (x) { return x.image; }) && p.alignement !== 'centre') {
        p.retraitDroitPx = (p.retraitDroitPx || 0) + 2;
      }
      // titres : garder avec le suivant
      if (/^H[1-6]$/.test(el.tagName)) { p.garderAvecSuivant = true; p.style = 'Titre1'; p.niveauPlan = 0; }
      // puce de liste
      if (el.tagName === 'LI' && s.listStyleType !== 'none') {
        var puceTexte = s.listStyleType === 'circle' ? '◦' : (s.listStyleType === 'square' ? '▪' : '•');
        // signe ecrit (« ▸ », « ◆ », « – ») : valeur de list-style-type entre guillemets, posee par le choix « Forme des puces » (cvPdfTemplateMaquette.js)
        var signePuce = /^["'](.+?)\s*["']$/.exec(String(s.listStyleType || ''));
        if (signePuce) { puceTexte = signePuce[1]; }
        var st0 = runs.find(function (x) { return !x.image; }) || {};
        p.runs.unshift({ texte: puceTexte + '\t', police: 'Arial', tailleDemiPts: st0.tailleDemiPts || 19, couleur: st0.couleur || '000000', gras: false, italique: false, souligne: false, capitales: false, espacementPx: 0 });
        p.retraitPremierPx = -12;
        p.retraitGauchePx = (p.retraitGauchePx || 0);
      }
      return p;
    }

    // ---------- structure : lignes a tabulation, tableaux, empilement ----------
    function cadreZone(ctx, gauche, droite) { return { gauche: gauche, droite: droite }; }

    function essayerLigneTabulation(el, blocEls, ctx) {
      if (blocEls.length !== 2) { return null; }
      var s = cs(el);
      if (s.display !== 'flex' && s.display !== 'inline-flex') { return null; }
      var a = blocEls[0], b = blocEls[1];
      var na = noeudsUtiles(a), nb = noeudsUtiles(b);
      if (!na.length || !nb.length) { return null; }
      var ra = rect(a), rb = rect(b), re = rect(el);
      var droiteContenu = re.r - px(s.paddingRight);
      if (Math.abs(rb.r - droiteContenu) > 3) { return null; }
      if (!(rb.x >= ra.x + ra.l - 2)) { return null; }
      if (Math.abs((rb.y + rb.h / 2) - (ra.y + ra.h / 2)) > Math.max(ra.h, rb.h) * 0.6 && rb.h < ra.h) { return null; }
      var runsA = [], runsB = [];
      collecterRuns(noeudsAvecEspaces(a), runsA, null); collecterRuns(noeudsAvecEspaces(b), runsB, null);
      runsA = nettoyerRuns(runsA); runsB = nettoyerRuns(runsB);
      if (!runsA.length || !runsB.length) { return null; }
      var lignesA = lignesDe(rectsDesNoeuds(na)), lignesB = lignesDe(rectsDesNoeuds(nb));
      if (!lignesA.length || !lignesB.length) { return null; }
      // le texte de gauche passe sur plusieurs lignes dans le navigateur (place reduite par la date) : deux cellules aux largeurs mesurees, comme le navigateur
      if (lignesA.length >= 2) { return null; }
      var pas = lignesA.length >= 2 ? (lignesA[lignesA.length - 1].centre - lignesA[0].centre) / (lignesA.length - 1) : Math.max(lignesA[0].h, ra.h);
      var p = { genre: 'paragraphe', runs: runsA.concat([{ texte: '\t', police: runsA[0].police || 'Arial', tailleDemiPts: runsA[0].tailleDemiPts || 19 }]).concat(runsB), interligneExactPx: pas,
        tabulations: [{ posPx: droiteContenu - ctx.gauche, genre: 'droite' }], alignement: 'gauche', _y: lignesA[0].centre - pas / 2, _b: lignesA[lignesA.length - 1].centre + pas / 2, _extraHaut: 0, _extraBas: 0, _colGauche: ctx.gauche };
      var retrait = Math.max(0, ra.x - ctx.gauche);
      if (retrait > 0.8) { p.retraitGauchePx = retrait; }
      return p;
    }

    function grouper(valeurs, tolerance) {
      var tries = valeurs.slice().sort(function (a, b) { return a - b; });
      var groupes = [];
      tries.forEach(function (v) { var g = groupes[groupes.length - 1]; if (g && Math.abs(v - g.v) <= tolerance) { g.n++; } else { groupes.push({ v: v, n: 1 }); } });
      return groupes.map(function (g) { return g.v; });
    }

    function essayerTableau(el, blocEls, ctx) {
      if (blocEls.length < 2) { return null; }
      var s = cs(el);
      var items = blocEls.map(function (b) { return { el: b, r: rect(b) }; }).filter(function (i) { return i.r.l > 1; });
      if (items.length < 2) { return null; }
      // lignes de la grille
      var hauts = grouper(items.map(function (i) { return i.r.y; }), 4);
      var lignes = hauts.map(function (h) { return items.filter(function (i) { return Math.abs(i.r.y - h) <= 4; }); });
      var casColonnes = lignes.some(function (l) { return l.length >= 2; });
      if (!casColonnes) { return null; }
      // colonnes : positions gauches distinctes
      var gauches = grouper(items.map(function (i) { return i.r.x; }), 3);
      if (gauches.length < 2) { return null; }
      // les elements d'une meme ligne ne doivent pas se chevaucher horizontalement
      var ok = lignes.every(function (l) {
        var t = l.slice().sort(function (a, b) { return a.r.x - b.r.x; });
        for (var i = 1; i < t.length; i++) { if (t[i].r.x < t[i - 1].r.r - 2) { return false; } }
        return true;
      });
      if (!ok) { return null; }
      var re = rect(el);
      var droiteMax = Math.max.apply(null, items.map(function (i) { return i.r.r; }));
      var largeurs = gauches.map(function (g, i) { return (i + 1 < gauches.length ? gauches[i + 1] : droiteMax) - g; });
      var colIndex = function (x) { var k = 0; for (var i = 0; i < gauches.length; i++) { if (Math.abs(x - gauches[i]) <= 3) { k = i; break; } } return k; };
      var rows = lignes.map(function (l, li) {
        var haut = hauts[li];
        var suivant = hauts[li + 1];
        var cellules = [];
        var col = 0;
        var tri = l.slice().sort(function (a, b) { return a.r.x - b.r.x; });
        tri.forEach(function (it) {
          var c0 = colIndex(it.r.x);
          // colonnes vides avant
          while (col < c0) { cellules.push({ largeurPx: largeurs[col], blocs: [] }); col++; }
          // etendue : nombre de colonnes couvertes
          var c1 = c0;
          while (c1 + 1 < gauches.length && it.r.r > gauches[c1 + 1] + 3) { c1++; }
          var larg = 0; for (var k = c0; k <= c1; k++) { larg += largeurs[k]; }
          var margeG = it.r.x - gauches[c0];
          var margeD = Math.max(0, larg - margeG - it.r.l);
          var ctxCell = { gauche: it.r.x, droite: it.r.r, y0: haut };
          var blocs = espacer(blocsDe(it.el, ctxCell), ctxCell);
          cellules.push({ largeurPx: larg, fusionColonnes: c1 > c0 ? (c1 - c0 + 1) : undefined, blocs: blocs, margesPx: { gauche: margeG, droite: margeD, haut: 0, bas: 0 }, alignementVertical: (s.alignItems === 'center' ? 'centre' : (/end/.test(s.alignItems) ? 'bas' : undefined)), _it: it });
          col = c1 + 1;
        });
        while (col < gauches.length) { cellules.push({ largeurPx: largeurs[col], blocs: [] }); col++; }
        // hauteur minimale : ecart jusqu'a la ligne suivante, ou hauteur de la ligne si elle est courte (garde les marges internes du bloc) ; jamais sur une derniere ligne tres haute, qui doit pouvoir se couper entre deux pages
        var hauteurLigne = suivant !== undefined ? (suivant - haut) : (function () { var hm = Math.max.apply(null, l.map(function (i) { return i.r.h; })); return hm < 0.6 * HAUTEUR_PAGE_PX ? hm : 0; })();
        return { hauteurPx: hauteurLigne || undefined, regleHauteur: 'auMoins', cellules: cellules };
      });
      var haut0 = Math.min.apply(null, items.map(function (i) { return i.r.y; }));
      var bas0 = Math.max.apply(null, items.map(function (i) { return i.r.b; }));
      var t = { genre: 'tableau', largeursPx: largeurs, lignes: rows, retraitGauchePx: gauches[0] - ctx.gauche, _y: haut0, _b: bas0, _extraHaut: 0, _extraBas: 0 };
      // les fonds et bordures des cellules (blocs enfants) sont traites par blocsDe (decors)
      return t;
    }

    // Decor de page (colle au bord de la page, ou plus haut que la moitie de la page) ou decor de contenu (suit son paragraphe).
    function decorDePage(d) {
      return d.xPx <= 2 || d.xPx + d.lPx >= pageL - 2 || d.yPx <= 2 || d.hPx > 0.5 * HAUTEUR_PAGE_PX || d.lPx > 0.8 * pageL;
    }
    function premierParagraphe(blocs) {
      for (var i = 0; i < blocs.length; i++) {
        var b = blocs[i];
        if (b.genre === 'paragraphe' && !b._flottant) { return b; }
        if (b.genre === 'tableau' && !b._flottant) {
          for (var j = 0; j < b.lignes.length; j++) { for (var k = 0; k < b.lignes[j].cellules.length; k++) { var q = premierParagraphe(b.lignes[j].cellules[k].blocs); if (q) { return q; } } }
        }
      }
      return null;
    }
    // Rectangle du TEXTE d'un element (union des lignes) : sert quand les boites se chevauchent mais pas les textes (rectangles de competences).
    function rectContenu(el) {
      var rects = rectsDesNoeuds([el]);
      if (!rects.length) { return null; }
      var x = Math.min.apply(null, rects.map(function (q) { return q.x; })), y = Math.min.apply(null, rects.map(function (q) { return q.y; }));
      var r = Math.max.apply(null, rects.map(function (q) { return q.r; })), b = Math.max.apply(null, rects.map(function (q) { return q.b; }));
      return { x: x, y: y, r: r, b: b, l: r - x, h: b - y };
    }

    // Boites qui se recouvrent sans qu'on puisse les mettre en colonnes : la premiere reste dans le flux, chaque suivante qui la recouvre devient
    // un bloc de paragraphes en cadre (position exacte sur la page, sans habillage), ses decors restant attaches a la page.
    function essayerSuperposition(items, ctx) {
      var recouvre = function (a, b) { return a.c.y < b.c.b - 1 && a.c.b > b.c.y + 1 && a.c.x < b.c.r - 1 && a.c.r > b.c.x + 1; };
      var conflit = items.some(function (a, i) { return items.some(function (b, j) { return j < i && recouvre(a, b); }); });
      if (!conflit) { return null; }
      var sortie = [];
      var dansLeFlux = [];
      items.forEach(function (it) {
        var chevauche = dansLeFlux.some(function (o) { return recouvre(it, o); });
        if (!chevauche) {
          dansLeFlux.push(it);
          blocsDe(it.el, ctx).forEach(function (b) { sortie.push(b); });
          return;
        }
        var ctxA = { gauche: it.c.x, droite: it.c.r + 6, y0: it.c.y };
        var internes = espacer(blocsDe(it.el, ctxA), ctxA);
        var cadre = { xPx: it.c.x, yPx: it.c.y, lPx: it.c.l + 6, hPx: it.c.h, ancrageH: 'page', ancrageV: 'page', wrap: 'none', regleHauteur: 'auMoins' };
        var premier = premierParagraphe(internes);
        internes.forEach(function (b) {
          if (b.genre !== 'paragraphe') { avertissements.push('tableau ignoré dans un bloc superposé'); return; }
          b.cadre = cadre; b._flottant = true;
          // les decors du bloc (rectangle arrondi) restent fixes sur la page, a leur place mesuree
          if (b._decors) { b._decors.forEach(function (d) { decors.push(d); }); delete b._decors; }
          sortie.push(b);
        });
        void premier;
      });
      return sortie;
    }

    // Enfants dont les boites se chevauchent (grille superposee) mais dont les textes sont disjoints : rangees de cellules d'apres le texte.
    function essayerRangees(el, blocEls, ctx) {
      var items = blocEls.map(function (b) { return { el: b, c: rectContenu(b) }; }).filter(function (i) { return i.c; });
      if (items.length < 2) { return null; }
      items.sort(function (a, b) { return a.c.y - b.c.y; });
      var rangees = [];
      items.forEach(function (it) {
        var rg = rangees[rangees.length - 1];
        var dansLaRangee = rg && it.c.y < rg.bas - 1 && rg.items.every(function (o) { return it.c.x >= o.c.r + 2 || it.c.r <= o.c.x - 2; });
        if (dansLaRangee) { rg.items.push(it); rg.bas = Math.max(rg.bas, it.c.b); rg.haut = Math.min(rg.haut, it.c.y); }
        else { rangees.push({ items: [it], haut: it.c.y, bas: it.c.b }); }
      });
      if (!rangees.some(function (rg) { return rg.items.length >= 2; })) { return essayerSuperposition(items, ctx); }
      var sortie = [];
      rangees.forEach(function (rg) {
        if (rg.items.length === 1) {
          var c1 = { gauche: ctx.gauche, droite: ctx.droite, y0: rg.haut };
          rg.items[0].el && blocsDe(rg.items[0].el, ctx).forEach(function (b) { sortie.push(b); });
          return;
        }
        var tri = rg.items.slice().sort(function (a, b) { return a.c.x - b.c.x; });
        var gauches = tri.map(function (i) { return i.c.x; });
        var droiteMax = Math.max.apply(null, tri.map(function (i) { return i.c.r; }));
        var largeurs = gauches.map(function (g, i) { return (i + 1 < gauches.length ? gauches[i + 1] : droiteMax) - g; });
        var cellules = tri.map(function (it, i) {
          var ctxCell = { gauche: it.c.x, droite: it.c.x + largeurs[i], y0: rg.haut };
          return { largeurPx: largeurs[i], blocs: espacer(blocsDe(it.el, ctxCell), ctxCell), margesPx: { gauche: 0, droite: 0, haut: 0, bas: 0 } };
        });
        sortie.push({ genre: 'tableau', largeursPx: largeurs, lignes: [{ hauteurPx: rg.bas - rg.haut, regleHauteur: 'auMoins', cellules: cellules }],
          retraitGauchePx: gauches[0] - ctx.gauche, _y: rg.haut, _b: rg.bas, _extraHaut: 0, _extraBas: 0 });
      });
      return sortie;
    }

    // Blocs (paragraphes / tableaux) d'un element, sans espacement (l'espacement est pose par espacer() au niveau du flux).
    // Les decors produits pour cet element (et pas deja rattaches par un descendant) qui ne sont pas des decors de page
    // sont rattaches au premier paragraphe : ils suivent le texte au lieu de rester a une position fixe de la page.
    function blocsDe(el, ctx) {
      var i0 = decors.length;
      // enfants a position absolue : traites d'abord (decor, cadre...), puis retires de la structure du parent
      var sortieAbs = [];
      if (!(cs(el).position === 'absolute' || cs(el).position === 'fixed')) {
        Array.prototype.forEach.call(el.children, function (k) {
          if (ignore(k)) { return; }
          var pk = cs(k).position;
          if (pk === 'absolute' || pk === 'fixed') { absolusTraites.add(k); sortieAbs = sortieAbs.concat(blocsAbsolus(k, ctx)); }
        });
      }
      var sortie = sortieAbs.concat(blocsDeBrut(el, ctx));
      if (decors.length > i0) {
        var cible = premierParagraphe(sortie);
        if (cible) {
          var locaux = decors.splice(i0, decors.length - i0);
          locaux.forEach(function (d) {
            if (decorDePage(d)) { decors.push(d); }
            else { (cible._decors = cible._decors || []).push(d); }
          });
        }
      }
      return sortie;
    }
    // Elements a position absolue : image = decor ancre a la page, texte vertical = tableau flottant, autre texte = paragraphes en cadre (sans habillage).
    function blocsAbsolus(el, ctx) {
      var s = cs(el);
      var ra = rect(el);
      if (el.tagName === 'IMG') {
        var im = imageDe(el, ra);
        if (im) { ajouterDecor(Object.assign({ genre: 'image', xPx: ra.x, yPx: ra.y }, im, { lPx: ra.l, hPx: ra.h, derriereTexte: false })); }
        return [];
      }
      decorsDe(el);
      var noeudsA = noeudsUtiles(el);
      if (!noeudsA.length) { return []; }
      var estVertical = /vertical|sideways/.test(s.writingMode || '') ||
        Array.prototype.some.call(el.querySelectorAll('*'), function (x) { return /vertical|sideways/.test(cs(x).writingMode || ''); });
      if (estVertical) {
        var runsV = [];
        collecterRuns(noeudsAvecEspaces(el), runsV, null);
        runsV = nettoyerRuns(runsV);
        if (!runsV.length) { return []; }
        // zone de texte vertical (Word) + copie cachee du texte dans le corps (lecture par les logiciels de recrutement)
        ajouterDecor({ genre: 'texteVertical', xPx: ra.x, yPx: ra.y, lPx: ra.l, hPx: ra.h, runs: runsV, remplissage: null });
        var cachees = runsV.map(function (r) { return Object.assign({}, r, { cache: true }); });
        return [{ genre: 'paragraphe', runs: cachees, marqueCachee: true, interligneExactPx: 1, _flottant: true, _y: ra.y, _b: ra.y, _extraHaut: 0, _extraBas: 0, _colGauche: ctx.gauche }];
      }
      var ctxA = { gauche: ra.x, droite: ra.r, y0: ra.y };
      var internes = espacer(blocsDeContenu(el, ctxA), ctxA);
      var cadre = { xPx: ra.x, yPx: ra.y, lPx: ra.l, hPx: ra.h, ancrageH: 'page', ancrageV: 'page', wrap: 'none', regleHauteur: 'auMoins' };
      var sortieA = [];
      internes.forEach(function (b) {
        if (b.genre !== 'paragraphe') { avertissements.push('tableau ignoré dans un bloc positionné'); return; }
        b.cadre = cadre; b._flottant = true;
        sortieA.push(b);
      });
      return sortieA;
    }
    function blocsDeBrut(el, ctx) {
      if (ignore(el)) { return []; }
      var pos = cs(el).position;
      if ((pos === 'absolute' || pos === 'fixed') && el !== cv) { return blocsAbsolus(el, ctx); }
      return blocsDeContenu(el, ctx);
    }
    // Une rangee visuelle de pastilles = un paragraphe A PART (garde le vrai espacement mesure entre rangees, espacer() s'en charge
    // ensuite) -- jamais des pastilles glissees dans un seul paragraphe avec des sauts de ligne internes (le fond de chaque pastille
    // deborderait alors sur toute la hauteur de ligne de Word, sans le blanc reel qui les separe dans le navigateur : trouve sur une
    // colonne etroite du Mini CV A5 ou une seule pastille tient par rangee).
    function paragraphesRangeesPastilles(el, noeuds, ctx) {
      var pastilles = noeuds.filter(estPastille);
      var hautsP = grouper(pastilles.map(function (k) { return rect(k).y; }), 4);
      var sortiePastilles = [];
      hautsP.forEach(function (h) {
        var rangee = pastilles.filter(function (k) { return Math.abs(rect(k).y - h) <= 4; });
        var liste = [];
        rangee.forEach(function (k, i) { if (i) { liste.push({ nodeType: 3, nodeValue: ' ', parentElement: el }); } liste.push(k); });
        var pr = paragrapheDe(el, liste, ctx, {});
        if (pr) { sortiePastilles.push(pr); }
      });
      return sortiePastilles;
    }

    function blocsDeContenu(el, ctx) {
      if (ignore(el)) { return []; }
      var s = cs(el);
      var noeuds = noeudsUtiles(el);
      if (el.tagName === 'IMG') {
        var im = imageDe(el, rect(el));
        if (!im) { return []; }
        var r = rect(el);
        var p = { genre: 'paragraphe', runs: [{ image: im }], interligneMultiple: 1, _y: r.y, _b: r.b, _extraHaut: 0, _extraBas: 0, _colGauche: ctx.gauche };
        var retrait = Math.max(0, r.x - ctx.gauche);
        if (retrait > 0.8) { p.retraitGauchePx = retrait; }
        return [p];
      }
      if (!noeuds.length) { decorsDe(el); return []; }
      var blocEls = noeuds.filter(function (k) { return k.nodeType === 1 && !estInlineNiveau(k); });
      // element tout en ligne : un paragraphe (avec ses bordures et son fond)
      if (toutEnLigne(noeuds)) {
        // pastilles : une rangee visuelle = un paragraphe (la hauteur d'une pastille est le pas de ligne, l'ecart entre rangees est un espacement)
        if (noeuds.some(estPastille)) {
          var sortiePastilles = paragraphesRangeesPastilles(el, noeuds, ctx);
          decorsDe(el);
          return sortiePastilles;
        }
        var opt = { blocPropre: true };
        var par = paragrapheDe(el, noeudsAvecEspaces(el), ctx, opt);
        decorsDe(el, { sansFond: !!opt.fondTraite, sansBordures: !!opt.bordTraitees });
        return par ? [par] : [];
      }
      var toutBloc = noeuds.every(function (k) { return blocEls.indexOf(k) !== -1; });
      if (blocEls.length >= 2 && toutBloc && (s.display === 'flex' || s.display === 'grid' || s.display === 'inline-flex' || s.display === 'inline-grid')) {
        var lt = essayerLigneTabulation(el, blocEls, ctx);
        if (lt) { decorsDe(el); return [lt]; }
        var tb = essayerTableau(el, blocEls, ctx);
        if (tb) { decorsDe(el); return [tb]; }
        var rg = essayerRangees(el, blocEls, ctx);
        if (rg) { decorsDe(el); return rg; }
      }
      // conteneur flex dont chaque enfant ne contient que du texte en ligne (titre : icone + texte) : UN paragraphe portant les bordures du conteneur
      if ((s.display === 'flex' || s.display === 'inline-flex') && blocEls.length >= 1 && noeuds.length <= 4) {
        var aplati = [];
        var toutSimple = noeuds.every(function (k) {
          if (estInlineNiveau(k)) { aplati.push(k); return true; }
          var nk = noeudsUtiles(k);
          if (!nk.length || !toutEnLigne(nk)) { return false; }
          if (aplati.length) { aplati.push({ nodeType: 3, nodeValue: ' ', parentElement: el }); }
          nk.forEach(function (x) { aplati.push(x); });
          return true;
        });
        if (toutSimple) {
          var optF = { blocPropre: true };
          var parF = paragrapheDe(el, aplati, ctx, optF);
          decorsDe(el, { sansFond: !!optF.fondTraite, sansBordures: !!optF.bordTraitees });
          if (parF) { return [parF]; }
        }
      }
      // (colonnes CSS en liste sur deux colonnes : phase 3)
      decorsDe(el);
      var sortie = [];
      var anonymes = [];
      var vider = function () {
        if (!anonymes.length) { return; }
        var elsAnonymes = anonymes.filter(function (k) { return k.nodeType === 1; });
        if (elsAnonymes.length && elsAnonymes.every(estPastille)) {
          paragraphesRangeesPastilles(el, anonymes, ctx).forEach(function (pr) { sortie.push(pr); });
        } else {
          var pa = paragrapheDe(el, anonymes, ctx, {});
          if (pa) { sortie.push(pa); }
        }
        anonymes = [];
      };
      noeudsAvecEspaces(el).forEach(function (k) {
        if (estInlineNiveau(k)) { anonymes.push(k); }
        else { vider(); sortie = sortie.concat(blocsDe(k, ctx)); }
      });
      vider();
      return sortie;
    }

    // Espacements mesures entre blocs successifs d'un meme niveau de flux.
    function espacer(blocs, ctx) {
      var curseur = ctx.y0;
      var sortie = [];
      blocs.forEach(function (b) {
        if (b._flottant) { sortie.push(b); return; }
        var hautReel = b._y - (b._extraHaut || 0);
        var avant = Math.max(0, hautReel - curseur);
        // Word ignore l'espace avant d'un tableau : un paragraphe vide de la bonne hauteur le remplace
        // Idem pour le PREMIER paragraphe du corps de la page quand un en-tete libre (blocs flottants) le precede : Word ignore l'espace
        // avant en haut de page, le titre remontait alors sous l'en-tete (constate 2026-09-30, CV de Nicolas, en-tete libre + competences en tete).
        var premierDuCorps = (ctx === ctxRacine) && !sortie.some(function (x) { return !x._flottant; });
        if (b.genre === 'tableau' || (premierDuCorps && avant > 0.6)) {
          if (avant > 0.6) { sortie.push({ genre: 'paragraphe', runs: [], interligneExactPx: avant, avantPx: 0, apresPx: 0, tailleMarqueDemiPts: 2, _y: curseur, _b: hautReel, _extraHaut: 0, _extraBas: 0, _colGauche: ctx.gauche }); }
          b.avantPx = 0;
        } else { b.avantPx = avant; }
        b.apresPx = 0;
        sortie.push(b);
        curseur = b._b + (b._extraBas || 0);
      });
      return sortie;
    }

    // ---------- mots (pour la verification et pour les marges) ----------
    var mots = [];
    (function collecterMots() {
      function parcourir(n) {
        if (n.nodeType === 3) {
          var t = n.nodeValue;
          if (!/\S/.test(t)) { return; }
          var re = /\S+/g, m;
          while ((m = re.exec(t)) !== null) {
            var rg = doc.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
            var q = rg.getClientRects();
            if (q.length) { var rr = rectPlage(q[0]); mots.push({ t: m[0], x: rr.x, y: rr.y, l: rr.l, h: rr.h, _vertical: /vertical|sideways/.test(cs(n.parentElement).writingMode || '') }); }
          }
          return;
        }
        if (n.nodeType !== 1 || ignore(n)) { return; }
        Array.prototype.forEach.call(n.childNodes, parcourir);
      }
      parcourir(cv);
    })();

    var pageL = base.width, pageH = base.height;
    var motsHoriz = mots.filter(function (m) { return !m._vertical; });
    var gaucheMin = motsHoriz.length ? Math.min.apply(null, motsHoriz.map(function (m) { return m.x; })) : 38;
    var droiteMax = motsHoriz.length ? Math.max.apply(null, motsHoriz.map(function (m) { return m.x + m.l; })) : pageL - 38;
    var hautMin = motsHoriz.length ? Math.min.apply(null, motsHoriz.map(function (m) { return m.y; })) : 38;
    var margeG = Math.max(0, Math.floor(gaucheMin)), margeD = Math.max(0, Math.floor(pageL - droiteMax));
    var margeHaut = Math.max(0, Math.floor(hautMin - 4));

    var ctxRacine = { gauche: margeG, droite: pageL - margeD, y0: margeHaut };
    var blocsBruts = blocsDe(cv, ctxRacine);
    // marge haute de la page = haut du premier bloc (Word pose le premier bloc a la marge, sans espace avant)
    if (blocsBruts.length) { margeHaut = Math.max(0, Math.floor(Math.min.apply(null, blocsBruts.map(function (b) { return b._y - (b._extraHaut || 0); })))); }
    ctxRacine.y0 = margeHaut;
    var blocsRacine = espacer(blocsBruts, ctxRacine);

    // marge basse : la place restante sous le dernier bloc (moins une securite), pour qu'un CV d'une page ne passe jamais sur une deuxieme page pour quelques pixels
    var basContenu = blocsRacine.length ? Math.max.apply(null, blocsRacine.map(function (b) { return b._b + (b._extraBas || 0); })) : 0;
    var margeBas = opts.margeBasPx !== undefined ? opts.margeBasPx : (basContenu <= HAUTEUR_PAGE_PX ? Math.max(0, Math.min(30, Math.floor(HAUTEUR_PAGE_PX - basContenu - 8))) : 20);
    // « Remplir la page » (2 Mini CV A5 sur une feuille A4, cvPdfTemplateA5.js) : les 2 tableaux occupent TOUTE la hauteur de la page, donc la marge de
    // securite ci-dessus tombe a 0 et plus rien n'absorbe les paragraphes de separation que Word impose (entre les tableaux, apres le dernier) : le
    // dernier passait sur une 2e page VIDE (variante Paysage, 2 A5 empiles). On rend a la page quelques pixels en raccourcissant la derniere ligne du
    // dernier tableau (hauteur « au moins », le contenu n'est jamais rogne). Reserve a cette feuille : aucun autre export n'est touche.
    (function () {
      var derniere = blocsRacine[blocsRacine.length - 1];
      var place = HAUTEUR_PAGE_PX - basContenu;
      if (cv.matches && cv.matches('.feuille-a4-remplie') && basContenu <= HAUTEUR_PAGE_PX && place < 7 && derniere && derniere.genre === 'tableau' && derniere.lignes && derniere.lignes.length) {
        var ligne = derniere.lignes[derniere.lignes.length - 1];
        if (ligne.hauteurPx && ligne.regleHauteur !== 'exacte') { ligne.hauteurPx = Math.max(1, ligne.hauteurPx - (7 - place)); }
      }
    })();
    var racineStyle = cs(cv);
    var famRacine = familleDe(racineStyle);
    var plan = {
      version: 1,
      titre: opts.titre || 'CV', auteur: opts.auteur || '', langue: 'fr-FR',
      page: { largeurPx: pageL, hauteurPx: HAUTEUR_PAGE_PX, margesPx: { haut: margeHaut, bas: margeBas, gauche: margeG, droite: margeD } },
      policeParDefaut: famRacine, tailleParDefautDemiPts: U.pxVersDemiPoints(px(racineStyle.fontSize), famRacine),
      decorsPage: [], decorsPremierePage: [], decorsSuivantes: [], flux: blocsRacine
    };
    (function finaliserDecorsAncres(blocs) {
      blocs.forEach(function (b) {
        if (b.genre === 'paragraphe') {
          if (b._decors) {
            var hautParagraphe = b._y - (b._extraHaut || 0) - (b.avantPx || 0);
            b.decors = b._decors.map(function (d) { return Object.assign({}, d, { xPx: d.xPx - b._colGauche, yPx: d.yPx - hautParagraphe }); });
          }
        } else if (b.genre === 'tableau') {
          b.lignes.forEach(function (l) { l.cellules.forEach(function (c) { finaliserDecorsAncres(c.blocs); }); });
        }
      });
    })(blocsRacine);
    // decors : la page 1 en reçoit la partie visible ; un decor haut (colonne, cadre) est repete sur les pages suivantes
    var HAUTEUR_A4 = HAUTEUR_PAGE_PX; // nom garde (repris ailleurs dans ce bloc), valeur desormais celle de la page reelle
    // TACHE (2026-09-29, « le petit coin de la frise n'apparait pas dans le Word ») : les formes sont EMISES dans cet ordre, et Word empile dans l'ordre d'emission.
    // Les formes dont le z-index CSS est positif passent donc APRES les autres (tri stable : l'ordre du code HTML est conserve entre formes de meme niveau).
    decors.map(function (d, i) { return { d: d, i: i }; }).sort(function (x, y) { return ((x.d._z || 0) - (y.d._z || 0)) || (x.i - y.i); })
      .forEach(function (e, k) { decors[k] = e.d; delete e.d._z; });
    decors.forEach(function (d) {
      if (d.yPx >= HAUTEUR_A4) { return; }
      var piece = d;
      if (d.yPx + d.hPx > HAUTEUR_A4 + 0.5 && d.genre !== 'polygone') { piece = Object.assign({}, d, { hPx: HAUTEUR_A4 - d.yPx }); }
      plan.decorsPremierePage.push(piece);
      // decor de pleine hauteur (colonne coloree, cadre de page, bande verticale) : repete sur les pages suivantes
      if (d.hPx > 0.8 * HAUTEUR_A4 && d.yPx <= 2 && d.genre !== 'image') {
        plan.decorsSuivantes.push(d.genre === 'polygone' ? Object.assign({}, d) : Object.assign({}, d, { yPx: 0, hPx: HAUTEUR_A4 }));
      }
    });
    // TACHE (retour utilisateur H3/point 21, 2026-09-28, bug reel confirme) : un bloc d'en-tete en
    // "position libre" (glisse/redimensionne a la main, cvPdfPleinEcranMaquette.js) qui deborde de sa
    // zone ou en recouvre un autre casse le calcul de l'espacement du corps du CV qui suit (espacer()
    // ci-dessus mesure le bas du DERNIER bloc d'en-tete pour placer le corps -- un bloc en debordement
    // fausse cette mesure) : un immense vide apparait avant la rubrique suivante, repoussant tout le
    // reste sur une page inutile. Meme detection que le "Cadre rouge" du plein ecran (_mqVerifierRouge,
    // cvPdfPleinEcranMaquette.js) - copie volontairement minimale ici (ce module n'a pas acces a ce
    // fichier, charge seulement dans la fenetre principale) : garder les 2 en phase si l'un des deux
    // change. Avertissement seulement (jamais de rejet -- rejeter declenche le repli silencieux vers
    // l'ancien moteur Word, cote appelant, qui perd l'avertissement).
    (function verifierEnTeteLibreDeborde() {
      var zones = cv.querySelectorAll('.tete.libre, .rc-boxes.libre');
      var probleme = Array.prototype.some.call(zones, function (zone) {
        var estRect = zone.classList.contains('rc-boxes');
        var basLibre = estRect && zone.getAttribute('data-hfixe') !== '1';
        var tr = zone.getBoundingClientRect();
        var blocs = Array.prototype.filter.call(zone.querySelectorAll('.blc'), function (b) { return b.parentElement === zone; });
        var rects = blocs.map(function (b) { return b.getBoundingClientRect(); });
        return blocs.some(function (b, i) {
          var r = rects[i];
          var sort = r.left < tr.left - 0.5 || r.top < tr.top - 0.5 || r.right > tr.right + 0.5 || (!basLibre && r.bottom > tr.bottom + 0.5);
          if (sort || estRect) { return sort; } // chevauchement volontaire pour ce modele (Rectangles arrondis) : seul le debordement compte
          return rects.some(function (q, j) { return j !== i && !(r.right <= q.left + 0.5 || r.left >= q.right - 0.5 || r.bottom <= q.top + 0.5 || r.top >= q.bottom - 0.5); });
        });
      });
      if (probleme) {
        avertissements.push('Un bloc de l’en-tête dépasse de sa zone ou en recouvre un autre : ouvrez « Régler l’en-tête » sur le CV pour le corriger, sinon la mise en page de ce Word peut être décalée.');
      }
    })();
    return { plan: plan, mots: mots, avertissements: avertissements, imagesEnAttente: imagesEnAttente };
  }

  function rasteriserImage(doc, im) {
    var win = doc.defaultView;
    return new Promise(function (resolve) {
      var vide = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
      try {
        var img = new win.Image();
        img.onload = function () {
          try {
            var echelle = 4;
            var c = doc.createElement('canvas');
            c.width = Math.max(1, Math.round(im._svg.l * echelle)); c.height = Math.max(1, Math.round(im._svg.h * echelle));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            im.donnees = c.toDataURL('image/png').split(',')[1];
          } catch (e) { im.donnees = vide; }
          resolve();
        };
        img.onerror = function () { im.donnees = vide; resolve(); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(im._svg.markup);
      } catch (e) { im.donnees = vide; resolve(); }
    });
  }

  // Extraction complete : les icones SVG sont converties en PNG (chargement d'image, asynchrone) avant de rendre le plan.
  function extraireAsync(doc, options) {
    var r = extraire(doc, options);
    // toutes les images du plan final qui attendent leur PNG (icones SVG, pastilles d'icone) : dans les decors, les decors ancres et les runs
    var aConvertir = [];
    function chercher(o) {
      if (!o || typeof o !== 'object') { return; }
      if (o._svg && !o.donnees) { aConvertir.push(o); }
      var cles = Array.isArray(o) ? o : Object.keys(o).filter(function (k) { return k !== '_svg'; }).map(function (k) { return o[k]; });
      cles.forEach(function (v) { if (v && typeof v === 'object') { chercher(v); } });
    }
    chercher(r.plan);
    return Promise.all(aConvertir.map(function (im) { return rasteriserImage(doc, im); })).then(function () { return r; });
  }

  return { extraire: extraire, extraireAsync: extraireAsync };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = WordExtracteur; }
