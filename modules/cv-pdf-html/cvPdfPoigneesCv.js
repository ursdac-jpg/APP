/* ============================================================
   cvPdfPoigneesCv.js : POIGNEES RONDES posees sur le CV de l'apercu pour regler a la main
   l'EPAISSEUR DU BANDEAU et la LARGEUR DE LA COLONNE (Denis, 2026-10-20, chantier docs/PASSATION_MODELES_CV_2026-10-20.md, etape 5).
   ------------------------------------------------------------
   Meme principe que les formes decoratives (cvPdfFormesDeco.js) : aucune phrase ni bouton sur le CV, une poignee ronde, l'apercu n'est PAS reconstruit
   pendant le geste ; la fin du geste garde le choix.
   - Poignee du bandeau (bord bas, au milieu) : tirer vers le bas ou le haut ; l'apercu suit en direct (hauteur minimale du bandeau, jamais sous ce que
     son contenu demande) ; a la fin, `rappels.bandeau(hauteur, libre)`.
   - Poignee de la colonne (bord interieur, a mi-hauteur) : tirer vers la gauche ou la droite ; un trait pointille montre la largeur visee (par pas de 5 %,
     de 30 a 70 %, comme le curseur « Largeur de la colonne ») ; a la fin, `rappels.largeur(pourcent)` (un seul rendu).
   Les poignees ne sont posees que si le panneau Bandeau (resp. Colonne) est ouvert et que le modele permet ce choix (contexte donne par l'application),
   jamais a l'impression, jamais dans le grand apercu. Fonctions pures (limites) testees sans navigateur : tests/poigneesCv.test.js.
   ============================================================ */

var _POIGNEES_CV = { hautMax: 420, largMin: 30, largMax: 70, pas: 5 };

// Hauteur visee du bandeau : jamais sous la hauteur naturelle (le contenu), jamais au-dela du maximum.
function _poigneesCvLimiterHauteur(h, naturelle) {
  var n = parseFloat(naturelle); if (!isFinite(n) || n < 0) { n = 0; }
  var v = parseFloat(h); if (!isFinite(v)) { v = n; }
  return Math.round(Math.max(n, Math.min(_POIGNEES_CV.hautMax, v)));
}
// Largeur de la colonne gauche visee (en %) : l'actuelle plus le deplacement (px) rapporte a la largeur du corps de page, arrondie au pas de 5, entre 30 et 70.
function _poigneesCvPourcentLargeur(actuel, dxPx, corpsPx) {
  var a = parseFloat(actuel); if (!isFinite(a)) { a = 35; }
  var c = parseFloat(corpsPx); if (!isFinite(c) || c <= 0) { return Math.max(_POIGNEES_CV.largMin, Math.min(_POIGNEES_CV.largMax, Math.round(a / _POIGNEES_CV.pas) * _POIGNEES_CV.pas)); }
  var v = a + (parseFloat(dxPx) || 0) / c * 100;
  v = Math.round(v / _POIGNEES_CV.pas) * _POIGNEES_CV.pas;
  return Math.max(_POIGNEES_CV.largMin, Math.min(_POIGNEES_CV.largMax, v));
}

function _poigneesCvStyle(doc) {
  if (doc.getElementById('stylePoigneesCv')) { return; }
  var st = doc.createElement('style'); st.id = 'stylePoigneesCv'; st.textContent = '@media print{.poignees-cv{display:none !important}}';
  (doc.head || doc.documentElement).appendChild(st);
}

// Cree une poignee ronde (meme aspect que celles des formes decoratives) ; `sens` : 'v' (deplacement vertical) ou 'h' (horizontal).
function _poigneesCvCreer(doc, sens, gros, libelle) {
  var p = doc.createElement('span');
  p.className = 'poignee-cv'; p.setAttribute('role', 'slider'); p.setAttribute('aria-label', libelle); p.tabIndex = -1;
  p.style.cssText = 'position:absolute;pointer-events:auto;background:#1e4f8a;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.4);touch-action:none;box-sizing:border-box;display:flex;align-items:center;justify-content:center;' +
    'width:' + gros + 'px;height:' + gros + 'px;cursor:' + (sens === 'v' ? 'ns-resize' : 'ew-resize') + ';';
  p.innerHTML = sens === 'v'
    ? '<svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden="true"><path d="M12 4l-4 5h8zM12 20l-4-5h8z" fill="#fff"/></svg>'
    : '<svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden="true"><path d="M4 12l5-4v8zM20 12l-5-4v8z" fill="#fff"/></svg>';
  return p;
}

function _poigneesCvPoser(pageEl, ctx, rappels) {
  var doc = pageEl.ownerDocument, ancien = pageEl.querySelector('.poignees-cv');
  if (ancien) { ancien.remove(); }
  if (!ctx || (!ctx.bandeau && !ctx.colonne) || !rappels) { return; }
  var tete = ctx.bandeau ? pageEl.querySelector('.tete-fond') : null;
  var cv = pageEl.classList.contains('cv') ? pageEl : pageEl.querySelector('.cv'), cvEl = cv || pageEl;
  var colG = cvEl.classList.contains('col-vague-g'), colD = cvEl.classList.contains('col-vague-d');
  var colonne = ctx.colonne && (colG || colD);
  if (!tete && !colonne) { return; }
  _poigneesCvStyle(doc);
  // L'apercu est reduit par le panneau (l'iframe est mise a l'echelle) : la poignee est agrandie d'autant pour rester facile a saisir.
  var vue = doc.defaultView, fe = vue && vue.frameElement, kp = (fe && fe.clientWidth) ? fe.getBoundingClientRect().width / fe.clientWidth : 1;
  var gros = Math.max(20, Math.round(26 / kp));
  var rp0 = pageEl.getBoundingClientRect(), k = (pageEl.offsetWidth && rp0.width) ? rp0.width / pageEl.offsetWidth : 1;
  var calque = doc.createElement('div'); calque.className = 'poignees-cv';
  calque.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:9;pointer-events:none;';
  pageEl.appendChild(calque);
  if (typeof _formesDecoSansClic === 'function') { _formesDecoSansClic(doc); }

  // ---- Bandeau : epaisseur ----
  if (tete) {
    var pb = _poigneesCvCreer(doc, 'v', gros, 'Épaisseur du bandeau : tirer vers le haut ou vers le bas');
    calque.appendChild(pb);
    var placerB = function () {
      var rp = pageEl.getBoundingClientRect(), rt = tete.getBoundingClientRect();
      pb.style.left = Math.round(pageEl.offsetWidth / 2 - gros / 2) + 'px';
      pb.style.top = Math.round((rt.bottom - rp.top) / k - gros / 2) + 'px';
    };
    placerB();
    pb.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button > 0) { return; }
      e.preventDefault(); e.stopPropagation();
      var libre = tete.classList.contains('libre'), h0 = tete.offsetHeight, y0 = e.clientY, h = h0, naturelle;
      if (libre) {
        var maxB = 0; Array.prototype.forEach.call(tete.querySelectorAll('.blc'), function (b) { maxB = Math.max(maxB, b.offsetTop + b.offsetHeight); });
        naturelle = maxB + 12;
      } else {
        var avant = tete.style.minHeight; tete.style.minHeight = '0px'; naturelle = tete.offsetHeight; tete.style.minHeight = avant;
      }
      if (rappels.debut) { rappels.debut('bandeau'); }
      try { pb.setPointerCapture(e.pointerId); } catch (er) { /* capture indisponible : le geste continue sur la page */ }
      var bouger = function (ev) {
        h = _poigneesCvLimiterHauteur(h0 + (ev.clientY - y0) / k, naturelle);
        if (libre) { tete.style.height = h + 'px'; } else { tete.style.minHeight = h + 'px'; tete.style.boxSizing = 'border-box'; }
        placerB();
        if (typeof _texteHorsPoser === 'function') { _texteHorsPoser(pageEl); }   // le texte a deux tons suit la nouvelle epaisseur
      };
      var fin = function () {
        doc.removeEventListener('pointermove', bouger, true); doc.removeEventListener('pointerup', fin, true); doc.removeEventListener('pointercancel', fin, true);
        try { pb.releasePointerCapture(e.pointerId); } catch (er) { /* deja relachee */ }
        if (typeof _formesDecoSansClic === 'function') { _formesDecoSansClic(doc); }
        if (h !== h0 && rappels.bandeau) { rappels.bandeau(h, libre); }
      };
      doc.addEventListener('pointermove', bouger, true); doc.addEventListener('pointerup', fin, true); doc.addEventListener('pointercancel', fin, true);
    });
  }

  // ---- Colonne : largeur ----
  if (colonne) {
    var av = vue.getComputedStyle(cvEl, '::before'), lPage = pageEl.offsetWidth;
    var largFond = parseFloat(av.width) || 0, gauche = parseFloat(av.left), droite = parseFloat(av.right);
    var xInterieur = colG ? ((isFinite(gauche) ? gauche : 0) + largFond) : (lPage - (isFinite(droite) ? droite : 0) - largFond);
    var pc = _poigneesCvCreer(doc, 'h', gros, 'Largeur de la colonne : tirer vers la gauche ou vers la droite');
    pc.style.left = Math.round(xInterieur - gros / 2) + 'px'; pc.style.top = Math.round(pageEl.offsetHeight * 0.45 - gros / 2) + 'px';
    calque.appendChild(pc);
    pc.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button > 0) { return; }
      e.preventDefault(); e.stopPropagation();
      var corps = pageEl.querySelector('.corps'), corpsPx = corps ? corps.clientWidth : lPage * 0.85;
      var cur = null;
      try { cur = parseFloat(doc.getElementById('regLargeurColonneGauche').value); } catch (er) { /* curseur absent */ }
      if (!isFinite(cur)) { cur = 35; }
      var x0 = e.clientX, nouveau = cur;
      var trait = doc.createElement('div');
      trait.style.cssText = 'position:absolute;top:0;height:100%;width:0;border-left:2px dashed #1e4f8a;pointer-events:none;left:' + Math.round(xInterieur) + 'px;';
      calque.appendChild(trait);
      if (rappels.debut) { rappels.debut('colonne'); }
      try { pc.setPointerCapture(e.pointerId); } catch (er) { /* capture indisponible */ }
      var bouger = function (ev) {
        nouveau = _poigneesCvPourcentLargeur(cur, (ev.clientX - x0) / k, corpsPx);
        var xCible = xInterieur + (nouveau - cur) / 100 * corpsPx;
        trait.style.left = Math.round(xCible) + 'px'; pc.style.left = Math.round(xCible - gros / 2) + 'px';
      };
      var fin = function () {
        doc.removeEventListener('pointermove', bouger, true); doc.removeEventListener('pointerup', fin, true); doc.removeEventListener('pointercancel', fin, true);
        try { pc.releasePointerCapture(e.pointerId); } catch (er) { /* deja relachee */ }
        if (typeof _formesDecoSansClic === 'function') { _formesDecoSansClic(doc); }
        if (trait.parentNode) { trait.remove(); }
        if (nouveau !== cur && rappels.largeur) { rappels.largeur(nouveau); } else { pc.style.left = Math.round(xInterieur - gros / 2) + 'px'; }
      };
      doc.addEventListener('pointermove', bouger, true); doc.addEventListener('pointerup', fin, true); doc.addEventListener('pointercancel', fin, true);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { _POIGNEES_CV: _POIGNEES_CV, _poigneesCvLimiterHauteur: _poigneesCvLimiterHauteur, _poigneesCvPourcentLargeur: _poigneesCvPourcentLargeur };
}
