/* ============================================================
   modules/cv-word/wordXml.js  (2026-09-27)
   Export du CV en Word : fabrique du XML Word (WordprocessingML + DrawingML). Module PUR (Node).

   XML ecrit a la main, jamais par la bibliotheque docx.js : les essais du 2026-09-26 ont montre que ses formes
   produisent un XML que Word refuse, et que la balise mc:AlternateContent + w:pict vide bloque Word. Les formes
   sont donc « directes » (w:drawing / wp:anchor / wps:wsp), sans texte (le texte reste du vrai texte : ATS).
   L'ordre des elements respecte celui du schema Word (Word est strict sur ce point).

   Contexte `ctx` (cree par WordXml.creerContexte) : identifiants uniques de dessins, registre des images
   (media/imageN.ext) et relations par partie (document, header1...).
   ============================================================ */

var WordXml = (function () {
  var U = (typeof WordUnites !== 'undefined') ? WordUnites : require('./wordUnites.js');
  var esc = U.echapper;
  var tw = U.pxVersTwips;
  var emu = U.pxVersEmu;

  var NS_RACINE = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
    'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
    'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" ' +
    'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"';

  var TYPES_IMAGE = { png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', gif: 'image/gif' };

  function creerContexte() {
    var ctx = {
      prochainId: 100,
      medias: [],                 // { nom, type, donnees }
      relations: {},              // partie -> [ { id, cible } ]
      partie: 'document',
      identifiant: function () { ctx.prochainId += 1; return ctx.prochainId; },
      // Enregistre une image (une seule copie par contenu identique) et renvoie l'identifiant de relation dans la partie courante.
      relationImage: function (image) {
        var type = (image.type || 'png').toLowerCase();
        var cle = type + ':' + (image.cle || '');
        var media = null;
        if (image.cle) { for (var i = 0; i < ctx.medias.length; i++) { if (ctx.medias[i].cle === cle) { media = ctx.medias[i]; break; } } }
        if (!media) {
          media = { cle: cle, nom: 'image' + (ctx.medias.length + 1) + '.' + (type === 'jpg' ? 'jpeg' : type), type: type, donnees: image.donnees };
          ctx.medias.push(media);
        }
        var liste = ctx.relations[ctx.partie] || (ctx.relations[ctx.partie] = []);
        for (var j = 0; j < liste.length; j++) { if (liste[j].cible === 'media/' + media.nom) { return liste[j].id; } }
        var id = 'rIdImg' + (liste.length + 1);
        liste.push({ id: id, cible: 'media/' + media.nom });
        return id;
      }
    };
    return ctx;
  }

  // ---------- caracteres (w:r) ----------
  function ficheBordure(b) {
    // { couleur:'RRGGBB', epaisseurPx, style:'solid'|'dashed'|'dotted'|'double'|'none', espacePt }
    if (!b || !b.couleur || b.style === 'none') { return null; }
    var val = b.style === 'dashed' ? 'dashed' : (b.style === 'dotted' ? 'dotted' : (b.style === 'double' ? 'double' : 'single'));
    var sz = U.borner(Math.round((b.epaisseurPx || 1) * 6), 2, 96);   // huitiemes de point
    return { val: val, sz: sz, space: U.borner(Math.round(b.espacePt || 0), 0, 31), color: b.couleur };
  }
  function xmlBordure(nom, b) {
    var f = ficheBordure(b);
    if (!f) { return ''; }
    return '<w:' + nom + ' w:val="' + f.val + '" w:sz="' + f.sz + '" w:space="' + f.space + '" w:color="' + f.color + '"/>';
  }
  function xmlBordureNulle(nom) { return '<w:' + nom + ' w:val="nil"/>'; }

  function xmlProprietesCaracteres(r) {
    var p = '';
    if (r.police) { p += '<w:rFonts w:ascii="' + esc(r.police) + '" w:hAnsi="' + esc(r.police) + '" w:eastAsia="' + esc(r.police) + '" w:cs="' + esc(r.police) + '"/>'; }
    if (r.gras) { p += '<w:b/><w:bCs/>'; }
    if (r.italique) { p += '<w:i/><w:iCs/>'; }
    if (r.capitales) { p += '<w:caps/>'; }
    if (r.cache) { p += '<w:vanish/>'; }
    if (r.couleur) { p += '<w:color w:val="' + r.couleur + '"/>'; }
    if (r.espacementPx) { p += '<w:spacing w:val="' + Math.round(r.espacementPx * 15) + '"/>'; }
    if (r.echelleLargeurPct && r.echelleLargeurPct !== 100) { p += '<w:w w:val="' + Math.round(r.echelleLargeurPct) + '"/>'; }
    if (r.positionDemiPts) { p += '<w:position w:val="' + Math.round(r.positionDemiPts) + '"/>'; }
    if (r.tailleDemiPts) { p += '<w:sz w:val="' + Math.round(r.tailleDemiPts) + '"/><w:szCs w:val="' + Math.round(r.tailleDemiPts) + '"/>'; }
    if (r.souligne) { p += '<w:u w:val="single"/>'; }
    if (r.ombrage) { p += '<w:shd w:val="clear" w:color="auto" w:fill="' + r.ombrage + '"/>'; }
    return p ? '<w:rPr>' + p + '</w:rPr>' : '';
  }

  function xmlTexte(texte) {
    // \t -> tabulation, \n -> saut de ligne ; le reste est du texte (espaces conserves).
    var t = U.nettoyerTexteXml(texte);
    var morceaux = t.split(/(\t|\n)/);
    var xml = '';
    for (var i = 0; i < morceaux.length; i++) {
      var m = morceaux[i];
      if (m === '\t') { xml += '<w:tab/>'; }
      else if (m === '\n') { xml += '<w:br/>'; }
      else if (m !== '') { xml += '<w:t xml:space="preserve">' + esc(m) + '</w:t>'; }
    }
    return xml;
  }

  function xmlCaracteres(r, ctx) {
    if (r.image) { return '<w:r>' + xmlProprietesCaracteres(r) + xmlImageEnLigne(r.image, ctx) + '</w:r>'; }
    if (r.saut === 'page') { return '<w:r><w:br w:type="page"/></w:r>'; }
    return '<w:r>' + xmlProprietesCaracteres(r) + xmlTexte(r.texte) + '</w:r>';
  }

  // ---------- paragraphes (w:p) ----------
  function xmlProprietesParagraphe(p) {
    var x = '';
    if (p.style) { x += '<w:pStyle w:val="' + esc(p.style) + '"/>'; }
    if (p.garderAvecSuivant) { x += '<w:keepNext/>'; }
    if (p.nePasSeparer) { x += '<w:keepLines/>'; }
    if (p.sautAvant) { x += '<w:pageBreakBefore/>'; }
    if (p.cadre) {
      var c = p.cadre;
      x += '<w:framePr w:w="' + tw(c.lPx) + '" w:h="' + tw(c.hPx) + '" w:hRule="' + (c.regleHauteur === 'auMoins' ? 'atLeast' : 'exact') + '" w:hSpace="0" w:vSpace="0" w:wrap="' + (c.wrap || 'notBeside') + '" ' +
        'w:vAnchor="' + (c.ancrageV || 'page') + '" w:hAnchor="' + (c.ancrageH || 'page') + '" w:x="' + tw(c.xPx) + '" w:y="' + tw(c.yPx) + '"/>';
    }
    x += '<w:widowControl/>';
    if (p.bordures || p.ombrage) {
      var b = p.bordures || {};
      var bord = xmlBordure('top', b.haut) + xmlBordure('left', b.gauche) + xmlBordure('bottom', b.bas) + xmlBordure('right', b.droite);
      if (bord) { x += '<w:pBdr>' + bord + '</w:pBdr>'; }
      if (p.ombrage) { x += '<w:shd w:val="clear" w:color="auto" w:fill="' + p.ombrage + '"/>'; }
    }
    if (p.tabulations && p.tabulations.length) {
      x += '<w:tabs>' + p.tabulations.map(function (t) {
        var meneur = t.meneur === 'points' ? 'dot' : (t.meneur === 'trait' ? 'underscore' : 'none');
        return '<w:tab w:val="' + (t.genre === 'centre' ? 'center' : (t.genre === 'gauche' ? 'left' : 'right')) + '" w:leader="' + meneur + '" w:pos="' + tw(t.posPx) + '"/>';
      }).join('') + '</w:tabs>';
    }
    var sp = '';
    sp += ' w:before="' + Math.max(0, tw(p.avantPx || 0)) + '" w:after="' + Math.max(0, tw(p.apresPx || 0)) + '"';
    if (p.interligneExactPx) { sp += ' w:line="' + Math.max(20, tw(p.interligneExactPx)) + '" w:lineRule="exact"'; }
    else if (p.interligneMultiple) { sp += ' w:line="' + Math.round(p.interligneMultiple * 240) + '" w:lineRule="auto"'; }
    x += '<w:spacing' + sp + '/>';
    if (p.retraitGauchePx || p.retraitDroitPx || p.retraitPremierPx) {
      var ind = '';
      if (p.retraitGauchePx) { ind += ' w:left="' + tw(p.retraitGauchePx) + '"'; }
      if (p.retraitDroitPx) { ind += ' w:right="' + tw(p.retraitDroitPx) + '"'; }
      if (p.retraitPremierPx) { ind += (p.retraitPremierPx < 0 ? ' w:hanging="' + tw(-p.retraitPremierPx) + '"' : ' w:firstLine="' + tw(p.retraitPremierPx) + '"'); }
      x += '<w:ind' + ind + '/>';
    }
    var jc = { gauche: 'left', centre: 'center', droite: 'right', justifie: 'both' }[p.alignement];
    if (jc && jc !== 'left') { x += '<w:jc w:val="' + jc + '"/>'; }
    if (p.niveauPlan !== undefined && p.niveauPlan !== null) { x += '<w:outlineLvl w:val="' + p.niveauPlan + '"/>'; }
    if (p.marqueCachee) { x += '<w:rPr><w:vanish/></w:rPr>'; }
    else if (p.tailleMarqueDemiPts) { x += '<w:rPr><w:sz w:val="' + p.tailleMarqueDemiPts + '"/><w:szCs w:val="' + p.tailleMarqueDemiPts + '"/></w:rPr>'; }
    return '<w:pPr>' + x + '</w:pPr>';
  }

  function xmlParagraphe(p, ctx) {
    var corps = '';
    (p.decors || []).forEach(function (f) { corps += '<w:r>' + xmlForme(f, ctx, 'paragraphe') + '</w:r>'; });
    (p.runs || []).forEach(function (r) { corps += xmlCaracteres(r, ctx); });
    return '<w:p>' + xmlProprietesParagraphe(p) + corps + '</w:p>';
  }

  // Petit paragraphe de separation (entre deux tableaux, fin de cellule, fin de document). Hauteur minimale.
  function xmlParagrapheMinuscule() {
    return '<w:p><w:pPr><w:widowControl/><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/><w:rPr><w:sz w:val="2"/><w:szCs w:val="2"/></w:rPr></w:pPr></w:p>';
  }

  // ---------- tableaux (w:tbl) ----------
  function xmlCellule(c, ctx) {
    var pr = '<w:tcW w:w="' + tw(c.largeurPx) + '" w:type="dxa"/>';
    if (c.fusionColonnes && c.fusionColonnes > 1) { pr += '<w:gridSpan w:val="' + c.fusionColonnes + '"/>'; }
    var b = c.bordures || {};
    var bord = (b.haut ? xmlBordure('top', b.haut) : xmlBordureNulle('top')) + (b.gauche ? xmlBordure('left', b.gauche) : xmlBordureNulle('left')) +
      (b.bas ? xmlBordure('bottom', b.bas) : xmlBordureNulle('bottom')) + (b.droite ? xmlBordure('right', b.droite) : xmlBordureNulle('right'));
    pr += '<w:tcBorders>' + bord + '</w:tcBorders>';
    if (c.ombrage) { pr += '<w:shd w:val="clear" w:color="auto" w:fill="' + c.ombrage + '"/>'; }
    var m = c.margesPx || {};
    pr += '<w:tcMar><w:top w:w="' + tw(m.haut || 0) + '" w:type="dxa"/><w:left w:w="' + tw(m.gauche || 0) + '" w:type="dxa"/><w:bottom w:w="' + tw(m.bas || 0) + '" w:type="dxa"/><w:right w:w="' + tw(m.droite || 0) + '" w:type="dxa"/></w:tcMar>';
    if (c.directionTexte === 'btLr') { pr += '<w:textDirection w:val="btLr"/>'; }
    if (c.alignementVertical) { pr += '<w:vAlign w:val="' + (c.alignementVertical === 'centre' ? 'center' : (c.alignementVertical === 'bas' ? 'bottom' : 'top')) + '"/>'; }
    var blocs = (c.blocs && c.blocs.length) ? c.blocs : [];
    // « Garder avec le suivant » / « ne pas separer » : sans effet utile dans une cellule, et dangereux (une ligne de tableau dont tous les paragraphes
    // sont lies ne peut plus se couper : Word la renvoie entiere sur la page suivante des qu'elle depasse de quelques pixels)
    var blocsSansLiens = blocs.map(function (b) { return (b.genre === 'paragraphe' && (b.garderAvecSuivant || b.nePasSeparer)) ? Object.assign({}, b, { garderAvecSuivant: false, nePasSeparer: false }) : b; });
    var contenu = xmlBlocs(blocsSansLiens, ctx);
    // Une cellule doit finir par un paragraphe.
    if (!blocs.length || blocs[blocs.length - 1].genre === 'tableau') { contenu += xmlParagrapheMinuscule(); }
    return '<w:tc><w:tcPr>' + pr + '</w:tcPr>' + contenu + '</w:tc>';
  }

  function xmlTableau(t, ctx) {
    var largeurTotale = t.largeursPx.reduce(function (a, b) { return a + b; }, 0);
    // tableau flottant (texte vertical, bande) : position absolue dans la page ; reste du vrai texte du corps du document
    var pr = t.flottant ? '<w:tblpPr w:leftFromText="0" w:rightFromText="0" w:topFromText="0" w:bottomFromText="0" w:vertAnchor="page" w:horzAnchor="page" w:tblpX="' + tw(t.flottant.xPx) + '" w:tblpY="' + tw(t.flottant.yPx) + '"/><w:tblOverlap w:val="overlap"/>' : '';
    pr += '<w:tblW w:w="' + tw(largeurTotale) + '" w:type="dxa"/>';
    if (t.retraitGauchePx) { pr += '<w:tblInd w:w="' + tw(t.retraitGauchePx) + '" w:type="dxa"/>'; }
    pr += '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>';
    pr += '<w:tblLayout w:type="fixed"/>';
    pr += '<w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar>';
    var grille = '<w:tblGrid>' + t.largeursPx.map(function (l) { return '<w:gridCol w:w="' + tw(l) + '"/>'; }).join('') + '</w:tblGrid>';
    var lignes = (t.lignes || []).map(function (l) {
      var trPr = '';
      if (l.nePasSeparer) { trPr += '<w:cantSplit/>'; }
      // Word ajoute environ 1 px (0,75 pt) a la hauteur de chaque ligne de tableau (mesure sur des listes de 11 experiences) : on le retire
      if (l.hauteurPx) { trPr += '<w:trHeight w:val="' + tw(Math.max(1, l.hauteurPx - 1)) + '" w:hRule="' + (l.regleHauteur === 'exacte' ? 'exact' : 'atLeast') + '"/>'; }
      return '<w:tr>' + (trPr ? '<w:trPr>' + trPr + '</w:trPr>' : '') + (l.cellules || []).map(function (c) { return xmlCellule(c, ctx); }).join('') + '</w:tr>';
    }).join('');
    return '<w:tbl><w:tblPr>' + pr + '</w:tblPr>' + grille + lignes + '</w:tbl>';
  }

  // Enchaine des blocs (paragraphes et tableaux). Deux tableaux qui se suivent seraient fusionnes par Word :
  // un paragraphe minuscule les separe.
  function xmlBlocs(blocs, ctx) {
    var xml = '';
    var precedent = null;
    (blocs || []).forEach(function (b) {
      if (b.genre === 'tableau') {
        if (precedent === 'tableau') { xml += xmlParagrapheMinuscule(); }
        xml += xmlTableau(b, ctx);
        precedent = 'tableau';
      } else {
        xml += xmlParagraphe(b, ctx);
        precedent = 'paragraphe';
      }
    });
    return xml;
  }

  // ---------- dessins ----------
  function xmlRemplissage(f) {
    if (!f) { return '<a:noFill/>'; }
    var alpha = (f.alpha !== undefined && f.alpha < 1) ? '<a:alpha val="' + Math.round(f.alpha * 100000) + '"/>' : '';
    if (f.genre === 'degrade' && f.couleurs && f.couleurs.length >= 2) {
      var n = f.couleurs.length;
      var stops = f.couleurs.map(function (c, i) {
        var pos = f.positions && f.positions[i] !== undefined ? f.positions[i] : (i / (n - 1));
        return '<a:gs pos="' + Math.round(pos * 100000) + '"><a:srgbClr val="' + c + '"/></a:gs>';
      }).join('');
      var ang = Math.round((((f.angleDeg || 0) % 360) + 360) % 360 * 60000);
      return '<a:gradFill rotWithShape="1"><a:gsLst>' + stops + '</a:gsLst><a:lin ang="' + ang + '" scaled="0"/></a:gradFill>';
    }
    return '<a:solidFill><a:srgbClr val="' + f.couleur + '">' + alpha + '</a:srgbClr></a:solidFill>';
  }

  function xmlContour(c) {
    if (!c || !c.couleur) { return '<a:ln><a:noFill/></a:ln>'; }
    var trait = c.style === 'dashed' ? '<a:prstDash val="dash"/>' : (c.style === 'dotted' ? '<a:prstDash val="sysDot"/>' : '');
    return '<a:ln w="' + emu(c.epaisseurPx || 1) + '"><a:solidFill><a:srgbClr val="' + c.couleur + '"/></a:solidFill>' + trait + '</a:ln>';
  }

  function xmlGeometrie(f) {
    if (f.genre === 'rectArrondi') {
      var m = Math.min(f.lPx, f.hPx) || 1;
      var adj = U.borner(Math.round((f.rayonPx || 0) / m * 100000), 0, 50000);
      return '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ' + adj + '"/></a:avLst></a:prstGeom>';
    }
    if (f.genre === 'ellipse') { return '<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>'; }
    if (f.genre === 'losange') { return '<a:prstGeom prst="diamond"><a:avLst/></a:prstGeom>'; }
    if (f.genre === 'polygone' && f.points && f.points.length >= 3) {
      var w = Math.max(1, Math.round(f.lPx * 100)), h = Math.max(1, Math.round(f.hPx * 100));
      var pts = f.points.map(function (p) { return [Math.round(p[0] * 100), Math.round(p[1] * 100)]; });
      var chemin = '<a:moveTo><a:pt x="' + pts[0][0] + '" y="' + pts[0][1] + '"/></a:moveTo>' +
        pts.slice(1).map(function (p) { return '<a:lnTo><a:pt x="' + p[0] + '" y="' + p[1] + '"/></a:lnTo>'; }).join('') + '<a:close/>';
      return '<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst><a:path w="' + w + '" h="' + h + '">' + chemin + '</a:path></a:pathLst></a:custGeom>';
    }
    return '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>';
  }

  // Position d'ancrage : « page » (decors) ou « paragraphe » (decor qui suit son contenu : x depuis la marge gauche
  // de la colonne, y depuis le haut du paragraphe).
  function xmlAncre(f, ctx, ancrage, contenuGraphique, nomDefaut) {
    var id = ctx.identifiant();
    var relH = (ancrage === 'paragraphe') ? 'column' : 'page';
    var relV = (ancrage === 'paragraphe') ? 'paragraph' : 'page';
    var derriere = f.derriereTexte === false ? 0 : 1;
    // TACHE (bug reel trouve le 2026-09-27, "Remplir la page" du Mini CV A5) : base sur ctx.identifiant() (unique sur TOUT le
    // document, header1/header2 compris), jamais sur f.ordreZ seul (identique pour un MEME decor duplique dans header1 ET
    // header2 -- 2 CV cote a cote/empiles sur une page -- Word refusait alors d'ouvrir le fichier, relativeHeight identique
    // dans 2 parties differentes).
    var z = 251650000 + id * 16 + (derriere ? 0 : 100000000);
    return '<w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="' + z + '" behindDoc="' + derriere + '" locked="0" layoutInCell="1" allowOverlap="1">' +
      '<wp:simplePos x="0" y="0"/>' +
      '<wp:positionH relativeFrom="' + relH + '"><wp:posOffset>' + emu(f.xPx) + '</wp:posOffset></wp:positionH>' +
      '<wp:positionV relativeFrom="' + relV + '"><wp:posOffset>' + emu(f.yPx) + '</wp:posOffset></wp:positionV>' +
      '<wp:extent cx="' + emu(f.lPx) + '" cy="' + emu(f.hPx) + '"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/>' +
      '<wp:docPr id="' + id + '" name="' + esc(f.nom || (nomDefaut + ' ' + id)) + '" descr="' + esc(f.alt || '') + '"/><wp:cNvGraphicFramePr/>' +
      contenuGraphique + '</wp:anchor></w:drawing>';
  }

  function xmlForme(f, ctx, ancrage) {
    if (f.genre === 'image') { return xmlImageAncree(f, ctx, ancrage); }
    if (f.genre === 'texteVertical') {
      var corps = '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr>' + (f.runs || []).map(function (r) { return xmlCaracteres(r, ctx); }).join('') + '</w:p>';
      var grapheV = '<a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><wps:wsp><wps:cNvSpPr txBox="1"/><wps:spPr>' +
        '<a:xfrm><a:off x="0" y="0"/><a:ext cx="' + emu(f.lPx) + '" cy="' + emu(f.hPx) + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></wps:spPr>' +
        '<wps:txbx><w:txbxContent>' + corps + '</w:txbxContent></wps:txbx>' +
        '<wps:bodyPr vert="vert270" lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr" anchorCtr="0"><a:noAutofit/></wps:bodyPr></wps:wsp></a:graphicData></a:graphic>';
      return xmlAncre(Object.assign({}, f, { derriereTexte: false }), ctx, ancrage || 'page', grapheV, 'Texte vertical');
    }
    var graph = '<a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><wps:wsp><wps:cNvSpPr/><wps:spPr>' +
      '<a:xfrm><a:off x="0" y="0"/><a:ext cx="' + emu(f.lPx) + '" cy="' + emu(f.hPx) + '"/></a:xfrm>' +
      xmlGeometrie(f) + xmlRemplissage(f.remplissage) + xmlContour(f.contour) +
      '</wps:spPr><wps:bodyPr/></wps:wsp></a:graphicData></a:graphic>';
    return xmlAncre(f, ctx, ancrage || 'page', graph, 'Decor');
  }

  function xmlImageGraphique(im, ctx, idImage) {
    var rid = ctx.relationImage(im);
    var geom = im.geometrie === 'ellipse' ? '<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>'
      : (im.geometrie === 'losange' ? '<a:prstGeom prst="diamond"><a:avLst/></a:prstGeom>'
        : (im.geometrie === 'rectArrondi' ? xmlGeometrie({ genre: 'rectArrondi', lPx: im.lPx, hPx: im.hPx, rayonPx: im.rayonPx || 8 }) : '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'));
    var rogne = '';
    if (im.rognagePct) { var g = im.rognagePct; rogne = '<a:srcRect l="' + Math.round((g.gauche || 0) * 1000) + '" t="' + Math.round((g.haut || 0) * 1000) + '" r="' + Math.round((g.droite || 0) * 1000) + '" b="' + Math.round((g.bas || 0) * 1000) + '"/>'; }
    return '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>' +
      '<pic:nvPicPr><pic:cNvPr id="' + idImage + '" name="' + esc(im.nom || ('Image ' + idImage)) + '" descr="' + esc(im.alt || '') + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="' + rid + '"/>' + rogne + '<a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + emu(im.lPx) + '" cy="' + emu(im.hPx) + '"/></a:xfrm>' + geom + (im.contour ? xmlContour(im.contour) : '') + '</pic:spPr></pic:pic></a:graphicData></a:graphic>';
  }

  function xmlImageAncree(f, ctx, ancrage) {
    var idImage = ctx.prochainId + 1;
    return xmlAncre(f, ctx, ancrage || 'page', xmlImageGraphique(f, ctx, idImage), 'Image');
  }

  // Image dans le texte (icone, petite photo) : image.decalageVerticalPx pour l'aligner sur la ligne de base.
  function xmlImageEnLigne(im, ctx) {
    var id = ctx.identifiant();
    return '<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + emu(im.lPx) + '" cy="' + emu(im.hPx) + '"/><wp:effectExtent l="0" t="0" r="0" b="0"/>' +
      '<wp:docPr id="' + id + '" name="' + esc(im.nom || ('Image ' + id)) + '" descr="' + esc(im.alt || '') + '"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      xmlImageGraphique(im, ctx, id) + '</wp:inline></w:drawing>';
  }

  // ---------- section ----------
  function xmlSection(page, refs) {
    var m = page.margesPx;
    var r = '';
    (refs || []).forEach(function (x) { r += '<w:headerReference w:type="' + x.type + '" r:id="' + x.id + '"/>'; });
    return '<w:sectPr>' + r + '<w:pgSz w:w="' + tw(page.largeurPx) + '" w:h="' + tw(page.hauteurPx) + '"/>' +
      '<w:pgMar w:top="' + tw(m.haut) + '" w:right="' + tw(m.droite) + '" w:bottom="' + tw(m.bas) + '" w:left="' + tw(m.gauche) + '" w:header="0" w:footer="0" w:gutter="0"/>' +
      ((refs || []).some(function (x) { return x.type === 'first'; }) ? '<w:titlePg/>' : '') + '</w:sectPr>';
  }

  return {
    NS_RACINE: NS_RACINE, TYPES_IMAGE: TYPES_IMAGE, creerContexte: creerContexte,
    xmlTexte: xmlTexte, xmlCaracteres: xmlCaracteres, xmlParagraphe: xmlParagraphe, xmlParagrapheMinuscule: xmlParagrapheMinuscule,
    xmlTableau: xmlTableau, xmlBlocs: xmlBlocs, xmlForme: xmlForme, xmlImageEnLigne: xmlImageEnLigne, xmlSection: xmlSection,
    xmlProprietesParagraphe: xmlProprietesParagraphe, xmlProprietesCaracteres: xmlProprietesCaracteres, xmlGeometrie: xmlGeometrie, xmlRemplissage: xmlRemplissage
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = WordXml; }
