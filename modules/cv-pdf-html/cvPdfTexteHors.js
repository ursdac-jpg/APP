/* ============================================================
   cvPdfTexteHors.js : TEXTE A DEUX TONS de l'en-tete (Denis, 2026-10-20, maquette docs/MAQUETTE_TEXTE_DEUX_TONS_2026-10-20.html,
   chantier docs/PASSATION_MODELES_CV_2026-10-20.md, point 2).
   ------------------------------------------------------------
   Un texte blanc qui sort de la couleur du bandeau devient invisible sur le papier. Ici, la partie qui DEPASSE de la forme prend une autre couleur
   (couleur du bandeau, fonce, gris ou une couleur au choix) : le texte reste blanc DANS la forme et change de couleur DEHORS, raccorde exactement au bord.
   Technique (meme esprit que la forme « Vide ») : le vrai en-tete reste inchange (texte blanc, modifiable, deplacable) ; apres chaque rendu, une COPIE
   non interactive de l'en-tete est posee juste dessus, colorée de la couleur choisie et DECOUPEE par le complement de la forme (tout ce qui est hors de la forme).
   Si la copie manque (Word, miniature, erreur), le CV est exactement celui d'avant : jamais d'effet bloquant.
   Le gabarit (cvPdfTemplateMaquette.js) donne trois variables CSS sur la page : --clip-bandeau (la forme, au format clip-path : polygon(...) ou inset(... round ...)),
   --hors (la couleur du texte hors forme) et --hors-actif (1 ou 0).
   Les parties pures (lecture de la forme, chemin du complement) sont testees sans navigateur : tests/texteHors.test.js.
   ============================================================ */

// Un nombre de clip-path (« 0 », « 74% », « 12px », « 3mm », « calc(100% - 12mm) ») en pixels, pour une longueur de reference.
var _TEXTE_HORS_PX_PAR_MM = 96 / 25.4;
function _texteHorsLongueur(t, ref) {
  t = String(t).trim();
  var m = t.match(/^calc\((.*)\)$/i);
  if (m) {   // somme ou difference de termes simples : calc(100% - 12mm), calc(0% + 2.6mm)
    var total = 0, signe = 1, termes = m[1].trim().split(/\s+/);
    for (var i = 0; i < termes.length; i++) {
      if (termes[i] === '+') { signe = 1; } else if (termes[i] === '-') { signe = -1; } else { total += signe * _texteHorsLongueur(termes[i], ref); signe = 1; }
    }
    return total;
  }
  if (/%$/.test(t)) { return parseFloat(t) / 100 * ref; }
  if (/mm$/i.test(t)) { return parseFloat(t) * _TEXTE_HORS_PX_PAR_MM; }
  var n = parseFloat(t); return isFinite(n) ? n : 0;
}
// Coupe « 100% 74% » ou « calc(100% - 8mm) 12% » en jetons, sans couper a l'interieur des parentheses.
function _texteHorsJetons(t) {
  var out = [], cur = '', prof = 0;
  for (var i = 0; i < t.length; i++) {
    var ch = t.charAt(i);
    if (ch === '(') { prof++; } else if (ch === ')') { prof--; }
    if (/\s/.test(ch) && prof === 0) { if (cur) { out.push(cur); cur = ''; } } else { cur += ch; }
  }
  if (cur) { out.push(cur); }
  return out;
}
// La forme (texte clip-path) en liste de sous-chemins SVG en pixels, pour une boite de largeur w et de hauteur h. Rend '' quand la forme n'est pas comprise.
//   polygon(0 0, 100% 0, 100% 74%, 0 100%)  ->  M0 0L w 0L w .74h L0 h Z
//   inset(8px 28px 6px round 16px)           ->  rectangle arrondi (rayons : 1 a 4 valeurs, ordre haut-gauche, haut-droite, bas-droite, bas-gauche)
function _texteHorsForme(clip, w, h, dx, dy) {
  clip = String(clip || '').trim(); dx = dx || 0; dy = dy || 0;   // (dx, dy) : decalage de la boite de la forme dans la boite de l'en-tete
  var m = clip.match(/^polygon\((.*)\)$/i);
  if (m) {
    var pts = m[1].split(/,(?![^(]*\))/).map(function (p) { var q = _texteHorsJetons(p.trim()); return q.length === 2 ? [_texteHorsLongueur(q[0], w) + dx, _texteHorsLongueur(q[1], h) + dy] : null; });
    if (pts.length < 3 || pts.some(function (p) { return !p; })) { return ''; }
    return 'M' + pts.map(function (p) { return (Math.round(p[0] * 100) / 100) + ' ' + (Math.round(p[1] * 100) / 100); }).join('L') + 'Z';
  }
  m = clip.match(/^inset\(([^)]*)\)$/i);
  if (m) {
    var parts = m[1].split(/\bround\b/i), d = parts[0].trim().split(/\s+/).filter(Boolean);
    var haut = d[0], droite = d.length > 1 ? d[1] : d[0], bas = d.length > 2 ? d[2] : d[0], gauche = d.length > 3 ? d[3] : droite;
    var x1 = _texteHorsLongueur(gauche, w), y1 = _texteHorsLongueur(haut, h), x2 = w - _texteHorsLongueur(droite, w), y2 = h - _texteHorsLongueur(bas, h);
    var r = (parts[1] || '').trim().split(/\s+/).filter(Boolean).map(function (v) { return _texteHorsLongueur(v, Math.min(w, h)); });
    var tl = r.length ? r[0] : 0, tr = r.length > 1 ? r[1] : tl, br = r.length > 2 ? r[2] : tl, bl = r.length > 3 ? r[3] : tr;
    var lim = Math.max(0, Math.min((x2 - x1) / 2, (y2 - y1) / 2));
    tl = Math.min(tl, lim); tr = Math.min(tr, lim); br = Math.min(br, lim); bl = Math.min(bl, lim);
    var f = function (v) { return Math.round(v * 100) / 100; };
    return 'M' + f(x1 + tl) + ' ' + f(y1) + 'H' + f(x2 - tr) + (tr ? 'A' + f(tr) + ' ' + f(tr) + ' 0 0 1 ' + f(x2) + ' ' + f(y1 + tr) : '') + 'V' + f(y2 - br) + (br ? 'A' + f(br) + ' ' + f(br) + ' 0 0 1 ' + f(x2 - br) + ' ' + f(y2) : '') +
      'H' + f(x1 + bl) + (bl ? 'A' + f(bl) + ' ' + f(bl) + ' 0 0 1 ' + f(x1) + ' ' + f(y2 - bl) : '') + 'V' + f(y1 + tl) + (tl ? 'A' + f(tl) + ' ' + f(tl) + ' 0 0 1 ' + f(x1 + tl) + ' ' + f(y1) : '') + 'Z';
  }
  return '';
}
// Hauteur (px) du BORD BAS de la forme a l'abscisse x (le point le plus bas de la forme sur cette verticale), ou -1 si la forme n'est pas comprise. Sert a garder la photo en medaillon a cheval sur le bord, quelle que soit la forme.
function _texteHorsBordBas(clip, w, h, x) {
  clip = String(clip || '').trim();
  var m = clip.match(/^polygon\((.*)\)$/i);
  if (m) {
    var pts = m[1].split(/,(?![^(]*\))/).map(function (p) { var q = _texteHorsJetons(p.trim()); return q.length === 2 ? [_texteHorsLongueur(q[0], w), _texteHorsLongueur(q[1], h)] : null; });
    if (pts.length < 3 || pts.some(function (p) { return !p; })) { return -1; }
    var maxY = -1;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[0] <= x && x <= b[0]) || (b[0] <= x && x <= a[0])) {
        var y = (a[0] === b[0]) ? Math.max(a[1], b[1]) : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
        if (y > maxY) { maxY = y; }
      }
    }
    return maxY;
  }
  m = clip.match(/^inset\(([^)]*)\)$/i);
  if (m) {
    var d = m[1].split(/round/i)[0].trim().split(/\s+/).filter(Boolean);
    var bas = d.length > 2 ? d[2] : d[0];
    return h - _texteHorsLongueur(bas, h);
  }
  return -1;
}
// Photo en MEDAILLON : accrochee au bord bas de la forme choisie (centre de la photo sur le bord), pas au bas de la boite.
function _photoMedaillonAjuster(pageEl) {
  var photo = pageEl.querySelector('.photo-mq.medaillon'), tete = photo && photo.closest('.tete');
  if (!photo || !tete) { return; }
  var vue = pageEl.ownerDocument.defaultView, clip = vue ? String(vue.getComputedStyle(tete).getPropertyValue('--clip-bandeau')).trim() : '';
  photo.style.bottom = '';
  if (!clip) { return; }
  var w = tete.offsetWidth, h = tete.offsetHeight, xc = photo.offsetLeft + photo.offsetWidth / 2;
  var y = _texteHorsBordBas(clip, w, h, xc);
  if (y > 0 && y < h) { photo.style.bottom = Math.round(h - y) + 'px'; }
}
// Le chemin de DECOUPE de la copie : un tres grand rectangle MOINS la forme (regle « evenodd »). Tout ce qui est hors de la forme reste visible, tout ce qui est dedans disparait.
function _texteHorsCheminComplement(clip, w, h, dx, dy) {
  var forme = _texteHorsForme(clip, w, h, dx, dy);
  if (!forme) { return ''; }
  return 'M-4000 -4000H8000V8000H-4000Z' + forme;
}

// ---- Partie qui touche a la page (navigateur) ----
var _TEXTE_HORS_NETTOYER = '.poi-l, .poi-h, .poi-b, .x, .rc-poignee, .ctl-exp, .poignees-cv';
// Pose (ou retire) la copie du texte hors forme sur la page donnee. Rien a faire sans en-tete colore, sans forme connue, ou quand le choix est « ne rien changer » : la page n'est alors pas modifiee.
function _texteHorsPoser(pageEl) {
  if (!pageEl || !pageEl.querySelectorAll) { return; }
  try { _photoMedaillonAjuster(pageEl); } catch (e) { /* un plus */ }
  Array.prototype.forEach.call(pageEl.querySelectorAll('.tete-hors'), function (x) { x.remove(); });
  var tete = pageEl.querySelector('.tete.tete-fond'), enColonne = false;
  var vue = pageEl.ownerDocument.defaultView; if (!vue) { return; }
  if (!tete) { tete = pageEl.querySelector('.tete'); enColonne = !!tete; }   // pas de bandeau colore : le texte blanc du nom ou des coordonnees est dans la COLONNE coloree
  if (!tete || tete.classList.contains('tete-vide') || !tete.parentNode) { return; }
  var cs = vue.getComputedStyle(tete);
  var w = tete.offsetWidth, h = tete.offsetHeight, chemin = '';
  if (!enColonne) {
    if (String(cs.getPropertyValue('--hors-actif')).trim() !== '1') { return; }
    chemin = _texteHorsCheminComplement(String(cs.getPropertyValue('--clip-bandeau')).trim(), w, h);
  } else {
    if (String(cs.getPropertyValue('--hors-actif-col')).trim() !== '1') { return; }
    var cc = String(cs.getPropertyValue('--clip-colonne')).trim(), fond = vue.getComputedStyle(pageEl, '::before');
    var lc = parseFloat(fond.width) || 0, hp = pageEl.offsetHeight, droite = pageEl.classList.contains('col-vague-d');
    var x0 = droite ? (pageEl.offsetWidth - (parseFloat(fond.right) || 0) - lc) : (parseFloat(fond.left) || 0);
    if (lc < 10 || !cc) { return; }
    chemin = _texteHorsCheminComplement(cc, lc, hp, x0 - tete.offsetLeft, -tete.offsetTop);   // la forme de la colonne, dans le repere de l'en-tete
  }
  if (!chemin || w < 10 || h < 10) { return; }
  var copie = tete.cloneNode(true);
  Array.prototype.forEach.call(copie.querySelectorAll(_TEXTE_HORS_NETTOYER), function (x) { x.remove(); });
  Array.prototype.forEach.call(copie.querySelectorAll('[contenteditable]'), function (x) { x.removeAttribute('contenteditable'); });
  Array.prototype.forEach.call(copie.querySelectorAll('[id]'), function (x) { x.removeAttribute('id'); });
  Array.prototype.forEach.call(copie.querySelectorAll('[data-bl]'), function (x) { x.setAttribute('data-bl-h', x.getAttribute('data-bl')); x.removeAttribute('data-bl'); });
  copie.removeAttribute('id'); copie.removeAttribute('data-bl');
  copie.classList.add('tete-hors'); copie.setAttribute('aria-hidden', 'true'); if (enColonne) { copie.classList.add('tete-hors-colonne'); }
  copie.style.position = 'absolute'; copie.style.left = tete.offsetLeft + 'px'; copie.style.top = tete.offsetTop + 'px'; copie.style.width = w + 'px'; copie.style.height = h + 'px'; copie.style.margin = '0';
  copie.style.clipPath = 'path(evenodd, "' + chemin + '")';
  tete.parentNode.insertBefore(copie, tete.nextSibling);
}
// Pendant un geste sur un bloc de l'en-tete (deplacer, elargir, agrandir), la copie suit EN DIRECT : memes positions, memes largeurs, meme hauteur.
function _texteHorsSuivre(tete) {
  if (!tete || !tete.nextElementSibling || !tete.nextElementSibling.classList.contains('tete-hors')) { return; }
  var copie = tete.nextElementSibling;
  Array.prototype.forEach.call(tete.querySelectorAll('.blc[data-bl]'), function (b) {
    var c = copie.querySelector('[data-bl-h="' + b.getAttribute('data-bl') + '"]');
    if (c) { c.style.cssText = b.style.cssText; }
  });
  if (tete.style.height) { copie.style.height = tete.style.height; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { _texteHorsJetons: _texteHorsJetons, _texteHorsBordBas: _texteHorsBordBas, _texteHorsLongueur: _texteHorsLongueur, _texteHorsForme: _texteHorsForme, _texteHorsCheminComplement: _texteHorsCheminComplement };
}
