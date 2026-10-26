/* ============================================================
   cvPdfEnteteApercu.js : REGLER L'EN-TETE DIRECTEMENT SUR LE PETIT APERCU (Denis, 2026-10-21, demande 13 option B ;
   maquette docs/MAQUETTE_ENTETE_SUR_APERCU_2026-10-21.html, validee par Denis).
   ------------------------------------------------------------
   Un bouton « Régler l'en-tête » (rangée des onglets de l'aperçu) fait entourer en orange les quatre textes de l'en-tête (nom, titre, coordonnées,
   accroche) : on les glisse, on tire leur poignée ronde (largeur) et celle du bas de l'en-tête (hauteur). Un clic sur un texte ouvre UN PANNEAU
   LIBRE (il se prend par sa barre de titre et se pose n'importe où) : taille, gras, italique, couleur, nombre de lignes du nom, du titre et des
   coordonnées, gras du téléphone et de l'e-mail, couleur du texte qui sort de la couleur, interligne, « Remettre ce texte ».
   - AUCUNE duplication des gestes : ils viennent de _mqBrancherZone (cvPdfPleinEcranMaquette.js), appelée avec un « hôte » (le document du petit aperçu).
   - Meme etat que le grand apercu : `_cvPdfEnteteLibreMq` (relu par _mqEnteteEtat), donc le grand apercu montre les memes reglages.
   - Le texte a deux tons, le gras des coordonnees et la couleur du texte qui sort reutilisent les reglages existants (jamais un second reglage).
   Les fonctions pures sont testees sans navigateur : tests/enteteApercu.test.js.
   ============================================================ */

var _enteteApercu = { actif: false, bl: null, replie: false, horsOuvert: null, paletteOuverte: false, plusOuvert: false, pos: null };

// ---------- fonctions pures (etat d'en-tete libre : { libre, modif, pos, larg, ech, sty, plan, lig, haut ... }) ----------
var _ENTETE_LIGNES_DEFAUT = { nom: '1', metier: '1', coord: 'col' };

// Taille d'un texte : echelle par pas, entre 0,6 et 2,2 (memes bornes que le grand apercu).
function _enteteRegTaille(ent, bl, delta) {
  ent.ech = ent.ech || {};
  var cur = ent.ech[bl] || 1, d = parseFloat(delta); if (!isFinite(d)) { d = 0; }
  ent.ech[bl] = Math.max(0.6, Math.min(2.2, Math.round((cur + d) * 100) / 100));
  return ent;
}
// Style d'un texte (gras g, italique i, couleur c, interligne il) : fusionne dans ent.sty[bl].
function _enteteRegStyle(ent, bl, patch) {
  ent.sty = ent.sty || {};
  var st = Object.assign({}, ent.sty[bl] || {});
  Object.keys(patch || {}).forEach(function (k) { st[k] = patch[k]; });
  ent.sty[bl] = st;
  return ent;
}
// Nombre de lignes : la valeur d'office est effacee (jamais un choix inutile gardé) ; seules 'nom' et 'metier' (1 ou 2) et 'coord' (col, 1, 2) existent.
function _enteteRegLignes(ent, bl, valeur) {
  ent.lig = ent.lig || {};
  var permis = (bl === 'coord') ? ['col', '1', '2'] : (bl === 'nom' || bl === 'metier') ? ['1', '2'] : [];
  if (permis.indexOf(String(valeur)) === -1) { return ent; }
  if (String(valeur) === _ENTETE_LIGNES_DEFAUT[bl]) { delete ent.lig[bl]; } else { ent.lig[bl] = String(valeur); }
  return ent;
}
// Y a-t-il encore un reglage a la main ? (sert a savoir si l'en-tete doit rester libre quand on quitte le mode.)
function _enteteRegModif(ent) {
  var n = function (o) { return Object.keys(o || {}).length; };
  return (n(ent.lig) + n(ent.pos) + n(ent.larg) + n(ent.ech) + n(ent.sty) + n(ent.hautBl) + (ent.haut ? 1 : 0)) > 0;
}
// « Remettre ce texte » : efface tout ce qui a ete regle pour ce bloc.
function _enteteRegRemettre(ent, bl) {
  ['pos', 'larg', 'ech', 'sty', 'hautBl', 'plan', 'lig'].forEach(function (c) { if (ent[c]) { delete ent[c][bl]; } });
  ent.modif = _enteteRegModif(ent);
  return ent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { _enteteRegTaille: _enteteRegTaille, _enteteRegStyle: _enteteRegStyle, _enteteRegLignes: _enteteRegLignes, _enteteRegModif: _enteteRegModif, _enteteRegRemettre: _enteteRegRemettre, _ENTETE_LIGNES_DEFAUT: _ENTETE_LIGNES_DEFAUT };
}

// ---------- tout ce qui suit touche le navigateur (non charge par les tests Node) ----------
function _eaIframe() { return document.querySelector('#zonePdfInlineCV iframe'); }
function _eaDoc() { var f = _eaIframe(); return f ? f.contentDocument : null; }
function _eaAide() {
  return 'Glissez un texte pour le déplacer. Cliquez sur un texte pour plus de réglages : taille, gras, couleur, nombre de lignes… La poignée ronde l’élargit, celle du bas règle la hauteur de l’en-tête.';
}
// Aucune phrase en continu sur l'apercu (retour de Denis, 2026-10-21) : l'explication est dans la pastille « i » ; seul un PROBLEME (cadre rouge) ecrit une courte ligne sous les boutons.
function _eaPhrase(txt) {
  var a = document.getElementById('eaAlerte');
  if (!txt) { if (a) { a.remove(); } return; }
  if (!a) {
    var rang = document.querySelector('#mepOngletsApercu .mep-onglets-entete'); if (!rang) { return; }
    a = document.createElement('p'); a.id = 'eaAlerte'; a.className = 'mep-ea-alerte'; a.setAttribute('role', 'alert');
    rang.parentNode.insertBefore(a, rang.nextSibling);
  }
  a.textContent = txt;
}
// La bulle d'explication s'ouvre d'elle-meme UNE SEULE FOIS (premiere activation du reglage), puis seulement a la demande.
function _enteteApercuBulleAuto(ancre) {
  try { if (localStorage.getItem('erip_entete_apercu_bulle_vue') === '1') { return; } localStorage.setItem('erip_entete_apercu_bulle_vue', '1'); } catch (e) { return; }
  setTimeout(function () { try { bulleInfoFlottanteBasculer(ancre, _eaAide()); } catch (e) { /* la bulle est un plus */ } }, 250);
}
function _eaHote() {
  return {
    doc: _eaDoc,
    aide: function () { return ''; },   // pas de phrase d'aide permanente : voir _eaPhrase
    phrase: _eaPhrase,
    ouvrir: function (bl, el) { _eaOuvrirPanneau(bl, el); },
    avant: function () { try { _mepPousserHistorique('entete'); } catch (e) { /* sans historique : le geste a quand meme lieu */ } },
    apres: null
  };
}
function _eaPage() { var d = _eaDoc(); return d ? d.querySelector('#conteneurPage .page-a4') : null; }
// Le modele a-t-il un en-tete reglable ? (« Photo et frise » : nom et coordonnees sont dans la colonne.)
function _enteteApercuDisponible() {
  var p = _eaPage();
  return !!p && !p.querySelector('.cv-photo') && !p.classList.contains('cv-photo');
}
function _enteteApercuActif() { return !!_enteteApercu.actif; }

var _EA_CSS_IFRAME =
  '.entete-apercu .tete.libre{outline:1px dotted #8a95a3}' +
  '.entete-apercu .blc{outline:1.5px dashed #e8710a;outline-offset:2px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}' +
  '.entete-apercu .blc.ea-sel{outline:2px solid #e8710a;background:rgba(232,113,10,.16)}' +
  '.entete-apercu .blc.hors-cadre{outline:3px solid #dc2626;outline-offset:2px;background:rgba(220,38,38,.08)}' +
  '.entete-apercu .poi-h,.entete-apercu .blc.ea-sel .poi-l{display:block!important}' +
  '.entete-apercu .poi-l,.entete-apercu .poi-h{background:#e8710a!important;border:2px solid #fff!important;box-sizing:border-box}' +
  '@media print{.entete-apercu .tete.libre{outline:0!important}.entete-apercu .blc{outline:0!important;background:none!important}.entete-apercu .poi-l,.entete-apercu .poi-h{display:none!important}}';

// Appelee par l'apercu (cvPdfPanneauReglages.js) a CHAQUE reconstruction du CV : pose les gestes, ou ne fait rien si le reglage est ferme.
function _enteteApercuPoser(pageEl) {
  try {
    if (!pageEl) { return; }
    var doc = pageEl.ownerDocument;
    pageEl.classList.remove('entete-apercu');
    if (!_enteteApercu.actif) { return; }
    if (!doc.getElementById('styleEnteteApercu')) {
      var st = doc.createElement('style'); st.id = 'styleEnteteApercu'; st.textContent = _EA_CSS_IFRAME; (doc.head || doc.documentElement).appendChild(st);
    }
    var zone = pageEl.querySelector('.tete.libre:not(.tete-hors)');
    if (!zone) { return; }
    pageEl.classList.add('entete-apercu');
    if (typeof _formesDecoSansClic === 'function') { _formesDecoSansClic(doc); }
    _mqBrancherZone(doc, pageEl, zone, _eaHote());
    if (_enteteApercu.bl) {
      var b = zone.querySelector('.blc[data-bl="' + _enteteApercu.bl + '"]');
      if (b) { b.classList.add('ea-sel'); } else { _enteteApercu.bl = null; }
    }
    _eaMajPanneau();
  } catch (e) { /* un plus : jamais bloquer l'apercu */ }
}

// Active ou ferme le reglage. En quittant, l'en-tete redevient normal s'il n'a aucun reglage a la main (comme dans le grand apercu).
function _enteteApercuBasculer(actif) {
  _enteteApercu.actif = (actif === undefined) ? !_enteteApercu.actif : !!actif;
  var w = _mqPanneau(); if (!w) { return; }
  _eaFermerPanneau();
  try { _mepPousserHistorique('entete'); } catch (e) { /* sans historique */ }
  var ent = _mqEnteteEtat();
  ent.libre = !!(_enteteApercu.actif || ent.modif);
  w._pdfMqDefinirEntete(ent);
  if (typeof _mepMajOngletsApercu === 'function') { _mepMajOngletsApercu(); }
}
// « Remettre comme avant » : l'en-tete entier, sans toucher aux formes ni aux autres reglages.
function _enteteApercuToutRemettre() {
  var w = _mqPanneau(); if (!w) { return; }
  try { _mepPousserHistorique('entete'); } catch (e) { /* sans historique */ }
  var ent = { libre: !!_enteteApercu.actif, modif: false, disp: null, pos: {}, larg: {}, haut: null, hautB: null, hautBl: {}, ech: {}, sty: {}, plan: {}, lig: {} };
  _eaFermerPanneau();
  w._pdfMqDefinirEntete(ent);
  if (typeof _mepMajOngletsApercu === 'function') { _mepMajOngletsApercu(); }
}
function _enteteApercuModifie() { try { return _enteteRegModif(_mqEnteteEtat()); } catch (e) { return false; } }

// ---------- le panneau libre ----------
var _EA_NOMS = { nom: 'Nom', coord: 'Coordonnées', metier: 'Titre du CV', accroche: 'Phrase d’accroche', b1: 'Rectangle des savoir-faire', b2: 'Rectangle des savoir-être', b3: 'Rectangle des savoirs' };
function _eaAppliquer(ent) {
  var h = _eaHote();
  _mqTouche(ent, h);
  _mqEnteteDefinir(ent, h);
}
function _eaBouton(txt, attrs, classe) {
  return '<button type="button" class="ea-mini' + (classe ? ' ' + classe : '') + '" ' + (attrs || '') + '>' + txt + '</button>';
}
function _eaCreerPanneau() {
  var p = document.getElementById('eaPanneau'); if (p) { return p; }
  p = document.createElement('div'); p.id = 'eaPanneau'; p.className = 'ea-panneau'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Réglages de ce texte de l’en-tête'); p.hidden = true;
  p.innerHTML =
    '<div class="ea-titre" id="eaTitre" title="Prenez ici pour déplacer ce panneau où vous voulez"><span><span class="ea-manche" aria-hidden="true">&#10303;</span><span id="eaNom"></span></span>' +
    '<span><button type="button" class="ea-mini" id="eaRed" aria-label="Réduire le panneau" title="Réduire : ne garder que la barre de titre">&minus;</button> ' +
    '<button type="button" class="ea-mini" id="eaX" aria-label="Fermer ce panneau" title="Fermer">&times;</button></span></div>' +
    '<div class="ea-corps" id="eaCorps"></div>';
  document.body.appendChild(p);
  _eaCablerPanneau(p);
  return p;
}
function _eaFermerPanneau() {
  _enteteApercu.bl = null;
  var p = document.getElementById('eaPanneau'); if (p) { p.hidden = true; }
  var d = _eaDoc(); if (d) { Array.prototype.forEach.call(d.querySelectorAll('.ea-sel'), function (x) { x.classList.remove('ea-sel'); }); }
}
function _eaOuvrirPanneau(bl, el) {
  _enteteApercu.bl = bl;
  var d = _eaDoc(); if (d) { Array.prototype.forEach.call(d.querySelectorAll('.ea-sel'), function (x) { x.classList.remove('ea-sel'); }); }
  if (el) { el.classList.add('ea-sel'); }
  var p = _eaCreerPanneau(); p.hidden = false; p.classList.remove('ea-reduit');
  _eaMajPanneau();
  if (!_enteteApercu.pos) {   // premiere ouverture : a cote du CV ; ensuite, la ou la personne l'a posé
    var fr = _eaIframe(), r = fr ? fr.getBoundingClientRect() : { left: 20, right: 400, top: 80 };
    var largeur = p.offsetWidth || 340, x = r.right + 12;
    if (x + largeur > window.innerWidth - 8) { x = Math.max(8, window.innerWidth - largeur - 8); }
    p.style.left = x + 'px'; p.style.top = Math.max(8, Math.min(window.innerHeight - p.offsetHeight - 8, r.top + 20)) + 'px';
  }
}
function _eaCaracteristique(bl) {
  var d = _eaDoc(), blc = d && d.querySelector('.blc[data-bl="' + bl + '"]');
  var el = blc && blc.querySelector('.' + (bl === 'coord' ? 'coord' : bl));
  return { blc: blc, cs: el ? d.defaultView.getComputedStyle(el) : null };
}
function _eaHorsLu() {
  var d = _eaDoc(), s = d && d.getElementById('regTexteHors'), c = d && d.getElementById('regTexteHorsPerso');
  return { mode: s ? s.value : 'dessous', perso: c ? c.value : '#2f6690' };
}
function _eaCouleurBandeau() {
  var pg = _eaPage(), v = pg ? pg.ownerDocument.defaultView.getComputedStyle(pg).getPropertyValue('--cv') : '';
  return (v && /^\s*#/.test(v)) ? v.trim() : '#1e3a5f';
}
function _eaPalette() {
  var base = (typeof _MEP_COULEURS_SIMPLES !== 'undefined' ? _MEP_COULEURS_SIMPLES : []).concat(typeof _MQ_COULEURS_EXTRA !== 'undefined' ? _MQ_COULEURS_EXTRA : []);
  return base.filter(function (c, i, a) { return a.indexOf(c) === i; });
}
// Les cases de couleur du texte qui sort de la couleur : meme reglage que le panneau Bandeau (source unique : _mepReglageMoteur_texteHors).
function _enteteCasesHors(hors, couleurBandeau) {
  var cases = [['dessous', couleurBandeau, 'Comme la couleur du bandeau : le texte qui dépasse en prend la couleur', 'ea-bandeau'], ['fonce', '#222222', 'Foncé', ''], ['gris', '#6b7280', 'Gris', ''], ['aucun', '#ffffff', 'Ne rien changer : le texte reste blanc', 'ea-aucun']];
  return cases.map(function (c) {
    var on = hors.mode === c[0];
    return '<button type="button" class="ea-sw ' + c[3] + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-ea-hors="' + c[0] + '" title="' + c[2] + '" aria-label="' + c[2] + '" style="background:' + c[1] + '"></button>';
  }).join('');
}
function _eaLegendeHors(mode) {
  return { dessous: 'Le texte qui dépasse prend la couleur du bandeau.', fonce: 'Le texte qui dépasse devient foncé.', gris: 'Le texte qui dépasse devient gris.', perso: 'Le texte qui dépasse prend la couleur choisie.', aucun: 'Le texte reste blanc, même hors de la couleur.' }[mode] || '';
}
function _eaMajPanneau() {
  var p = document.getElementById('eaPanneau'); if (!p || p.hidden || !_enteteApercu.bl) { return; }
  var bl = _enteteApercu.bl, ent = _mqEnteteEtat(), st = (ent.sty || {})[bl] || {}, lig = ent.lig || {};
  var c = _eaCaracteristique(bl), cs = c.cs;
  var estTexte = (bl === 'nom' || bl === 'metier' || bl === 'coord' || bl === 'accroche');
  var gras = st.g !== undefined ? !!st.g : (cs ? parseInt(cs.fontWeight, 10) >= 600 : false);
  var ital = st.i !== undefined ? !!st.i : (cs ? cs.fontStyle === 'italic' : false);
  var coul = st.c || (cs ? '#' + (cs.color.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('') : '#000000');
  var cg = (typeof _mepEtatChoixMq === 'function' ? (_mepEtatChoixMq().coordGras || {}) : {});
  var hors = _eaHorsLu(), horsOuvert = _enteteApercu.horsOuvert === null ? false : _enteteApercu.horsOuvert;
  var il = st.il || (cs && parseFloat(cs.lineHeight) > 0 && parseFloat(cs.fontSize) > 0 ? parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) : 1.38);
  var rowsLig = '';
  if (bl === 'nom') { rowsLig = '<div class="ea-lig"><label>Nom sur</label>' + _eaBouton('1 ligne', 'data-ea-lig="1"', (lig.nom || '1') === '1' ? 'on' : '') + _eaBouton('2 lignes', 'data-ea-lig="2"', lig.nom === '2' ? 'on' : '') + '</div>'; }
  if (bl === 'metier') { rowsLig = '<div class="ea-lig"><label>Titre sur</label>' + _eaBouton('1 ligne', 'data-ea-lig="1"', (lig.metier || '1') === '1' ? 'on' : '') + _eaBouton('2 lignes', 'data-ea-lig="2"', lig.metier === '2' ? 'on' : '') + '</div>'; }
  if (bl === 'coord') {
    var m = lig.coord || 'col';
    rowsLig = '<div class="ea-lig"><label>Coordonnées</label>' + _eaBouton('Une par ligne', 'data-ea-lig="col"', m === 'col' ? 'on' : '') + _eaBouton('Sur 1 ligne', 'data-ea-lig="1"', m === '1' ? 'on' : '') + _eaBouton('Sur 2 lignes', 'data-ea-lig="2"', m === '2' ? 'on' : '') + '</div>' +
      '<div class="ea-lig"><label>En gras</label>' + _eaBouton('Téléphone', 'data-ea-cg="telephone"', cg.telephone ? 'on' : '') + _eaBouton('E-mail', 'data-ea-cg="email"', cg.email ? 'on' : '') + '</div>';
  }
  var resume = { dessous: 'comme le bandeau', fonce: 'foncé', gris: 'gris', perso: 'couleur choisie', aucun: 'ne rien changer' }[hors.mode] || '';
  var palette = '';
  if (_enteteApercu.paletteOuverte || hors.mode === 'perso') {
    palette = '<div class="ea-palette"><div class="ea-cases">' + _eaPalette().map(function (col) {
      return '<button type="button" class="ea-sw' + (hors.mode === 'perso' && col.toLowerCase() === hors.perso.toLowerCase() ? ' on' : '') + '" data-ea-pc="' + col + '" title="Couleur" aria-label="Couleur ' + col + '" style="background:' + col + '"></button>';
    }).join('') + '</div><div class="ea-lig"><label class="ea-perso" title="Choisir n’importe quelle couleur"><span class="ea-roue"></span><input type="color" id="eaHorsPerso" value="' + hors.perso + '" aria-label="Couleur personnalisée"> Personnalisée</label>' +
      _eaBouton('Pipette', 'id="eaPipette" title="Récupérez une couleur n’importe où sur votre écran"') + '</div></div>';
  }
  p.querySelector('#eaNom').textContent = 'Vous réglez : ' + (_EA_NOMS[bl] || bl);
  p.querySelector('#eaCorps').innerHTML =
    '<div class="ea-lig"><label>Taille</label>' + _eaBouton('A&minus;', 'data-ea-t="-0.1" aria-label="Plus petit"') + _eaBouton('A+', 'data-ea-t="0.1" aria-label="Plus grand"') +
    '<span class="ea-esp"></span>' + _eaBouton('<b>G</b>', 'id="eaGras" aria-label="Gras"', gras ? 'on' : '') + _eaBouton('<i>I</i>', 'id="eaItal" aria-label="Italique"', ital ? 'on' : '') +
    '<input type="color" id="eaCoul" value="' + coul + '" aria-label="Couleur du texte" title="Couleur du texte"></div>' +
    rowsLig +
    (estTexte ? '<div class="ea-sep"></div>' +
      '<div class="ea-lig"><button type="button" class="ea-mini ea-repli" id="eaHorsBtn" aria-expanded="' + horsOuvert + '">Texte qui sort de la couleur : <b>' + resume + '</b> &#9662;</button></div>' +
      (horsOuvert ? '<div class="ea-lig ea-hors"><div class="ea-cases" role="radiogroup" aria-label="Couleur du texte qui sort de la couleur">' + _enteteCasesHors(hors, _eaCouleurBandeau()) + '</div>' +
        _eaBouton('Autre couleur', 'id="eaAutre" aria-expanded="' + (_enteteApercu.paletteOuverte || hors.mode === 'perso') + '"', hors.mode === 'perso' ? 'on' : '') + palette + '<div class="ea-legende">' + _eaLegendeHors(hors.mode) + '</div></div>' : '') : '') +
    '<div class="ea-sep"></div><div class="ea-lig">' + _eaBouton('Plus de réglages &#9662;', 'id="eaPlus" aria-expanded="' + _enteteApercu.plusOuvert + '"') + _eaBouton('&#8634; Remettre ce texte', 'id="eaRaz"', 'ea-droite') + '</div>' +
    (_enteteApercu.plusOuvert ? '<div class="ea-lig"><label>Interligne</label>' + _eaBouton('&minus;', 'data-ea-il="-0.1" aria-label="Moins d’interligne"') + _eaBouton('+', 'data-ea-il="0.1" aria-label="Plus d’interligne"') + '<span class="ea-valeur">' + (Math.round(il * 100) / 100).toFixed(2).replace('.', ',') + '</span></div>' : '');
}
function _eaPipette(poser) {
  if (typeof window.EyeDropper !== 'function') {
    var v = window.prompt('Votre navigateur ne propose pas d’outil pipette. Écrivez le code couleur (6 caractères, par exemple #2f6690).');
    if (v && /^#?[0-9a-fA-F]{6}$/.test(v.trim())) { poser(v.trim().indexOf('#') === 0 ? v.trim() : '#' + v.trim()); }
    return;
  }
  new window.EyeDropper().open().then(function (r) { poser(r.sRGBHex); }).catch(function () { /* annule */ });
}
function _eaCablerPanneau(p) {
  // le panneau se prend par sa barre de titre et se pose n'importe ou ; il reste la ou la personne l'a mis
  var titre = p.querySelector('#eaTitre');
  titre.addEventListener('pointerdown', function (ev) {
    if (ev.target.closest('button')) { return; }
    ev.preventDefault(); try { titre.setPointerCapture(ev.pointerId); } catch (e) { /* capture indisponible */ }
    titre.classList.add('ea-prise');
    var x0 = ev.clientX, y0 = ev.clientY, l0 = p.offsetLeft, t0 = p.offsetTop;
    var bouger = function (e) {
      p.style.left = Math.max(0, Math.min(window.innerWidth - 60, l0 + e.clientX - x0)) + 'px';
      p.style.top = Math.max(0, Math.min(window.innerHeight - 40, t0 + e.clientY - y0)) + 'px';
      _enteteApercu.pos = true;
    };
    var fin = function () { titre.classList.remove('ea-prise'); titre.removeEventListener('pointermove', bouger); titre.removeEventListener('pointerup', fin); titre.removeEventListener('pointercancel', fin); };
    titre.addEventListener('pointermove', bouger); titre.addEventListener('pointerup', fin); titre.addEventListener('pointercancel', fin);
  });
  p.querySelector('#eaX').addEventListener('click', _eaFermerPanneau);
  p.querySelector('#eaRed').addEventListener('click', function () { p.classList.toggle('ea-reduit'); this.innerHTML = p.classList.contains('ea-reduit') ? '+' : '&minus;'; });
  p.addEventListener('click', function (ev) {
    var t = ev.target.closest('button'); if (!t || !_enteteApercu.bl) { return; }
    var bl = _enteteApercu.bl, ent;
    if (t.hasAttribute('data-ea-t')) { ent = _mqEnteteEtat(); _enteteRegTaille(ent, bl, t.getAttribute('data-ea-t')); _eaAppliquer(ent); return; }
    if (t.id === 'eaGras' || t.id === 'eaItal') {
      ent = _mqEnteteEtat(); var st = ent.sty[bl] || {}, c = _eaCaracteristique(bl).cs;
      if (t.id === 'eaGras') { _enteteRegStyle(ent, bl, { g: !(st.g !== undefined ? st.g : (c ? parseInt(c.fontWeight, 10) >= 600 : false)) }); }
      else { _enteteRegStyle(ent, bl, { i: !(st.i !== undefined ? st.i : (c ? c.fontStyle === 'italic' : false)) }); }
      _eaAppliquer(ent); return;
    }
    if (t.hasAttribute('data-ea-lig')) { ent = _mqEnteteEtat(); _enteteRegLignes(ent, bl, t.getAttribute('data-ea-lig')); _eaAppliquer(ent); return; }
    if (t.hasAttribute('data-ea-cg')) {
      var actuel = (typeof _mepEtatChoixMq === 'function' ? (_mepEtatChoixMq().coordGras || {}) : {}), nouveau = { telephone: !!actuel.telephone, email: !!actuel.email };
      nouveau[t.getAttribute('data-ea-cg')] = !nouveau[t.getAttribute('data-ea-cg')];
      _mepDefinirChoixMq('coordGras', nouveau); return;
    }
    if (t.hasAttribute('data-ea-il')) {
      ent = _mqEnteteEtat(); var s0 = (ent.sty[bl] || {}).il, c2 = _eaCaracteristique(bl).cs;
      var cur = s0 || (c2 && parseFloat(c2.lineHeight) > 0 && parseFloat(c2.fontSize) > 0 ? parseFloat(c2.lineHeight) / parseFloat(c2.fontSize) : 1.38);
      _enteteRegStyle(ent, bl, { il: Math.max(1, Math.min(2, Math.round((cur + parseFloat(t.getAttribute('data-ea-il'))) * 20) / 20)) }); _eaAppliquer(ent); return;
    }
    if (t.id === 'eaRaz') { ent = _mqEnteteEtat(); _enteteRegRemettre(ent, bl); _mqEnteteDefinir(ent, _eaHote()); return; }
    if (t.id === 'eaHorsBtn') { _enteteApercu.horsOuvert = !(_enteteApercu.horsOuvert === null ? false : _enteteApercu.horsOuvert); _eaMajPanneau(); return; }
    if (t.id === 'eaPlus') { _enteteApercu.plusOuvert = !_enteteApercu.plusOuvert; _eaMajPanneau(); return; }
    if (t.id === 'eaAutre') { _enteteApercu.paletteOuverte = !_enteteApercu.paletteOuverte; _eaMajPanneau(); return; }
    if (t.hasAttribute('data-ea-hors')) { _enteteApercu.paletteOuverte = false; _mepReglageMoteur_texteHors(t.getAttribute('data-ea-hors'), null); setTimeout(_eaMajPanneau, 60); return; }
    if (t.hasAttribute('data-ea-pc')) { _mepReglageMoteur_texteHors('perso', t.getAttribute('data-ea-pc')); setTimeout(_eaMajPanneau, 60); return; }
    if (t.id === 'eaPipette') { _eaPipette(function (hex) { _mepReglageMoteur_texteHors('perso', hex); setTimeout(_eaMajPanneau, 60); }); return; }
  });
  p.addEventListener('change', function (ev) {
    var t = ev.target; if (!_enteteApercu.bl) { return; }
    if (t.id === 'eaCoul') { var ent = _mqEnteteEtat(); _enteteRegStyle(ent, _enteteApercu.bl, { c: t.value }); _eaAppliquer(ent); }
    if (t.id === 'eaHorsPerso') { _mepReglageMoteur_texteHors('perso', t.value); setTimeout(_eaMajPanneau, 60); }
  });
  // Echap ferme le panneau ; les fleches du clavier deplacent le texte choisi (un cran, dix avec Maj), sauf dans un champ.
  document.addEventListener('keydown', function (e) {
    var pn = document.getElementById('eaPanneau'); if (!pn || pn.hidden || !_enteteApercu.bl) { return; }
    if (e.key === 'Escape') { _eaFermerPanneau(); return; }
    if (!/^Arrow/.test(e.key) || /INPUT|SELECT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) { return; }
    var pas = e.shiftKey ? 10 : 2, dx = e.key === 'ArrowLeft' ? -pas : e.key === 'ArrowRight' ? pas : 0, dy = e.key === 'ArrowUp' ? -pas : e.key === 'ArrowDown' ? pas : 0;
    var bl = _enteteApercu.bl, g = _mqGeomDom(bl, _eaHote()), ent = _mqEnteteEtat(), tete = _eaDoc().querySelector('.tete.libre');
    e.preventDefault();
    var largTete = tete ? tete.offsetWidth : 1;
    ent.pos = ent.pos || {}; ent.pos[bl] = { x: Math.max(0, Math.min(98, Math.round((g.x + dx / largTete * 100) * 10) / 10)), y: Math.max(0, g.y + dy) };
    _eaAppliquer(ent);
  });
}
