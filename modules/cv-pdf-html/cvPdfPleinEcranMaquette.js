// ============================================================
// « Aperçu en plein écran » du CV en PDF, tel que la maquette
//
// TACHE (Denis, 2026-09-25, tranche 4 de la refonte de « La mise en page » du CV en PDF, plan
// docs/PLAN_TRANCHE2_FEUILLE_ET_MODELES_2026-09-25.md) : la maquette docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html est la
// SOURCE DE VERITE (fonctions plein, basculer, brancherEntete, barre-rub, barre-bloc). Decision de Denis : « suivre la
// maquette, retirer » - cet ecran REMPLACE le grand apercu historique (ouvrirGrandApercuPdf) pour les modeles de la maquette
// (Standard, Sobre et Créatif de la maquette). Les fonctions de l'ancien ecran absentes de la maquette (police propre a une
// rubrique, style des puces par rubrique, forcer une rubrique dans une colonne, glisser-deposer des rubriques, barre gras /
// italique sur la selection, curseur de largeur de l'accroche) sont retirees ; voir docs/TACHES_VALIDEES.md.
//
// Architecture : cet ecran (fenetre parente) affiche la feuille dans son PROPRE iframe, reconstruite a chaque changement a
// partir du meme rendu que le petit apercu (_pdfMqResultat, panneau de reglages) ; il ne garde AUCUN etat : chaque geste
// appelle l'API _pdfMq* du panneau (cvPdfPanneauReglages.js), qui change l'etat, rafraichit le petit apercu et le persiste
// dans dossier.pdfReglages.
// ============================================================

var _mqPlein = { mode: { deplacer: false, retirer: false, retirerRubrique: false, texte: false, entete: false, couleurs: false, rubriques: false }, rub: null, bl: null, zc: null, histRub: [] };

function _mqPanneau() {
  try { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; } catch (e) { return null; }
}
function _mqEl(id) { return document.getElementById(id); }
function _mqR1(v) { return Math.round(v * 10) / 10; }
function _mqToast(t) {
  var e = _mqEl('mqToast'); if (!e) { return; }
  e.textContent = t; e.style.display = 'block';
  clearTimeout(_mqToast.h); _mqToast.h = setTimeout(function () { e.style.display = 'none'; }, 2400);
}

var _MQ_TETE_NOMS = { nom: 'Nom', coord: 'Coordonnées', metier: 'Titre du CV', accroche: 'Phrase d’accroche', b1: 'Rectangle des compétences professionnelles', b2: 'Rectangle des compétences comportementales', b3: 'Rectangle des savoirs' };

// Feuille de style propre a l'iframe de la feuille (modes d'edition), reprise de la maquette.
var _MQ_CSS_MODES =
  'body{margin:0;background:transparent}' +
  '.cv .pill .x,.cv li .x{margin-left:5px;border:0;background:#c0392b;color:#fff;border-radius:50%;width:15px;height:15px;font-size:10px;line-height:15px;padding:0;text-align:center}' +
  '.mode-retirer .cv .pill .x,.mode-retirer .cv li .x{display:inline-block}' +
  '.ctl-exp button{border:1px solid #b6c0cc;background:#fff;color:#1c2430;border-radius:5px;width:24px;height:17px;font-size:9px;padding:0;line-height:1}' +
  // Retour Denis 2026-09-30 : plus de fleches. Chaque experience, formation et mission se prend par sa poignee et se depose ou l'on veut.
  '.mode-deplacer .cv .item[data-exp],.mode-deplacer .cv .fr-item[data-exp],.mode-deplacer .cv .item[data-form],.mode-deplacer .cv .fr-item[data-form],.mode-deplacer .cv .rc-item[data-form],.mode-deplacer .cv .ph-item[data-form]{position:relative;padding-left:28px;outline:1px dashed var(--cv);outline-offset:2px}' +
  '.mode-deplacer .cv li{position:relative}' +
  '.mq-poi{position:absolute;left:3px;top:1px;width:20px;height:22px;text-align:center;line-height:22px;font-size:16px;cursor:grab;color:#0d6efd;background:#eef4ff;border:1px solid #b6c9f2;border-radius:5px;z-index:6;user-select:none;touch-action:none}' +
  '.mq-poi-m{left:-26px;top:-1px;width:18px;height:18px;line-height:18px;font-size:13px}' +
  '.mq-poi:active{cursor:grabbing}' +
  '.mq-ins{position:absolute;height:4px;background:#0d6efd;border-radius:3px;z-index:8;pointer-events:none;box-shadow:0 0 0 2px rgba(13,110,253,.25)}' +
  '.mq-glisse{opacity:.35}' +
  '.cv h2[data-rub]{cursor:pointer}.cv h2[data-rub]:hover{outline:1px dashed var(--cv);outline-offset:2px}' +
  // TACHE (J4, 2026-09-28, "Retirer une rubrique ou une mission") : croix injectees en JS
  // uniquement quand ce mode est actif (jamais presentes dans le DOM sinon, donc pas besoin de les
  // cacher/montrer comme .pill .x ci-dessus) -- meme apparence que les croix de competences.
  '.mq-x{display:inline-block;margin-left:6px;border:0;background:#c0392b;color:#fff;border-radius:50%;width:15px;height:15px;font-size:10px;line-height:15px;padding:0;text-align:center;cursor:pointer;vertical-align:middle}' +
  '.mode-retirer-rubrique .cv [data-rub]{cursor:default;outline:none}' +
  '.mode-retirer-rubrique .cv [data-rub]:hover{outline:1px dashed #c0392b;outline-offset:2px}' +
  '.mode-retirer-rubrique .cv li{position:relative}' +
  '[contenteditable="true"]{outline:1px dashed var(--cv)}' +
  '.mode-entete .poi-l,.mode-entete .poi-h,.mode-entete .poi-b{display:block!important}' +
  '.mode-entete .tete.libre{outline:1px dotted #8a95a3}' +
  '.mode-entete [data-bl]{outline:1px dashed #8a95a3;outline-offset:2px;cursor:pointer}' +
  '.mode-entete .blc{cursor:move;touch-action:none}' +
  '.mode-entete [data-bl].hors-cadre{outline:3px solid #dc2626;outline-offset:2px;background:rgba(220,38,38,.08)}' +
  // TACHE (couleur par zone, 2026-09-29) : zones colorees. Mode « Modifier les couleurs » : toutes entourees. Hors mode : seul un survol discret,
  // et seulement si aucun autre outil n'est actif. Les formes decoupees (triangles, diagonales) ne montrent pas un contour (clip-path) : elles pulsent.
  '.mode-couleurs [data-zc]{outline:2px dashed #0d6efd;outline-offset:-2px;cursor:pointer}' +
  '.mode-couleurs [data-zc]:hover{outline-style:solid;outline-width:3px}' +
  '.mode-couleurs [data-zc="titres"]{outline-offset:2px}' +
  '.mode-couleurs .fr-coin,.mode-couleurs .fr-coin2,.mode-couleurs .tete-diag,.mode-couleurs .tete-vague{outline:0;animation:mqPulse 1.3s ease-in-out infinite}' +
  '@keyframes mqPulse{0%,100%{opacity:1}50%{opacity:.7}}' +
  '@media (prefers-reduced-motion:reduce){.mode-couleurs .fr-coin,.mode-couleurs .fr-coin2,.mode-couleurs .tete-diag,.mode-couleurs .tete-vague{animation:none;opacity:.8}}' +
  'body:not([class*="mode-"]) [data-zc]:not([data-zc="titres"]){cursor:pointer}' +
  'body:not([class*="mode-"]) [data-zc]:not([data-zc="titres"]):hover{outline:2px dashed rgba(13,110,253,.7);outline-offset:-2px}' +
  // Denis, 2026-09-29 : deplacer les rubriques a la souris (emplacements predefinis, jamais libre)
  '.mq-poignee{display:none;margin-left:8px;cursor:grab;font-size:16px;line-height:1;color:#0d6efd;user-select:none;touch-action:none;text-transform:none;letter-spacing:0;font-weight:400;vertical-align:middle}' +
  '.mq-cote{position:absolute;border:2px dashed #0d6efd;background:rgba(13,110,253,.06);border-radius:4px;z-index:5;pointer-events:none;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font:700 11px sans-serif;color:#0d6efd;text-align:center;line-height:1.15}' +
  '.mq-cote.actif{background:rgba(13,110,253,.22);border-style:solid}' +
  // Retour Denis 2026-09-30 (C20-d) : un emplacement qui refuse la rubrique est franchement ROUGE (fond compris), y compris sous la souris.
  '.mq-cote.interdit{border-color:#c0392b;color:#c0392b;background:rgba(192,57,43,.14)}' +
  '.mq-cote.interdit.actif{background:rgba(192,57,43,.32);border-style:solid}' +
  '.mq-cote.attention{border-color:#d97706;color:#b45309;background:rgba(217,119,6,.1)}' +
  '.mq-cote.attention.actif{background:rgba(217,119,6,.25)}' +
  '.mode-rubriques .mq-poignee{display:block}' +
  '.mq-fleche{cursor:pointer;padding:0 4px;font-size:14px}.mq-fleche:hover{background:#dbe8ff;border-radius:4px}' +
  '.mode-rubriques [data-mq-unite]{outline:1px dashed #0d6efd;outline-offset:3px}' +
  '.mq-leve{opacity:.28}' +
  '.mq-selectionne{outline:3px solid #0d6efd!important;outline-offset:3px!important;box-shadow:0 0 0 7px rgba(13,110,253,.18)}' +
  '.mq-slot{position:absolute;height:6px;border:2px dashed #0d6efd;border-radius:4px;z-index:5;pointer-events:none;box-sizing:border-box}' +
  '.mq-slot.actif{height:16px;background:rgba(13,110,253,.18);border-style:solid}' +
  '.mq-slot.interdit{border-color:#c0392b;background:rgba(192,57,43,.14)}' +
  '.mq-slot.interdit.actif{background:rgba(192,57,43,.32)}' +
  '.mq-fantome.refus{background:#c0392b;border-color:#c0392b;color:#fff}' +
  '.mq-hint-refus{color:#c0392b!important;font-weight:700}' +
  '.mq-fantome{position:absolute;z-index:9;pointer-events:none;background:#fff;border:2px solid #0d6efd;border-radius:8px;padding:5px 10px;font:700 12px sans-serif;text-transform:uppercase;color:#0d6efd;box-shadow:0 6px 16px rgba(0,0,0,.25)}' +
  '.marque-page{position:absolute;left:0;right:0;height:0;border-top:2px dashed #e4572e;z-index:3}' +
  '.marque-page span{position:absolute;right:8px;top:-18px;background:#fff;color:#e4572e;font-size:10.5px;padding:0 5px}' +
  '@media print{.marque-page{display:none!important}}';

function _mqTexteAide() {
  var m = _mqPlein.mode;
  if (m.entete) { return 'Glissez un bloc pour le déplacer, tirez sa poignée grise de droite pour l’élargir, celle du bas pour la hauteur. Cliquez sur un bloc pour ses réglages.'; }
  return m.deplacer ? 'Prenez une expérience, une formation ou une mission par sa poignée ⠿ et déposez-la à son nouvel endroit : une ligne bleue montre où elle ira.'
    : m.retirer ? 'Cliquez sur la croix rouge d’une compétence pour la retirer de ce CV.'
    : m.retirerRubrique ? 'Cliquez sur la croix rouge du titre d’une rubrique pour la retirer entière, ou sur celle d’une mission pour ne retirer qu’elle.'
    : m.texte ? 'Cliquez dans le CV pour corriger un texte.'
    : m.couleurs ? 'Toutes les zones colorées sont entourées : cliquez sur celle dont vous voulez changer la couleur.'
    : m.rubriques ? 'Prenez une rubrique par sa poignée ⠿ et déposez-la sur une ligne bleue (nouvelle ligne) ou sur une case « à côté » ; tirez ↕ pour régler l’espace au-dessus ; cliquez sur son titre pour sa taille, son interligne et son espace. Elle n’est déposée qu’au relâchement (Échap : on annule).'
    : 'Vous agissez directement sur le CV. Cliquez sur un fond coloré pour changer sa couleur.';
}

function _mqEnteteEtat() {
  var w = _mqPanneau();
  var e = (w && w._cvPdfEnteteLibreMq) || {};
  return {
    libre: !!e.libre, modif: !!e.modif, disp: e.disp || null,
    pos: JSON.parse(JSON.stringify(e.pos || {})), larg: JSON.parse(JSON.stringify(e.larg || {})),
    haut: e.haut || null, hautB: e.hautB || null, hautBl: JSON.parse(JSON.stringify(e.hautBl || {})), ech: JSON.parse(JSON.stringify(e.ech || {})), sty: JSON.parse(JSON.stringify(e.sty || {})),
    // TACHE (P11) : "plan" (1er/2e/3e), uniquement pour les rectangles de compétences ("Rectangles arrondis").
    plan: JSON.parse(JSON.stringify(e.plan || {}))
  };
}
function _mqEnteteDefinir(etat) {
  var w = _mqPanneau(); if (!w) { return; }
  w._pdfMqDefinirEntete(etat);
  _mqRendu();
}

function _mqOuvrirBarreRub(h) {
  _mqPlein.rub = h.getAttribute('data-rub');
  _mqMajBarreRub();
  var b = _mqEl('mqBarreRub'); b.style.display = 'flex';
  var r = h.getBoundingClientRect(), f = _mqEl('mqFrame').getBoundingClientRect();
  b.style.left = Math.max(8, Math.min(window.innerWidth - 480, f.left + r.left)) + 'px';
  b.style.top = Math.max(8, f.top + r.top - b.offsetHeight - 6) + 'px';
}
function _mqStyleRub() {
  var w = _mqPanneau(); var cur = (w && w._cvPdfReglagesRubriquesMq && w._cvPdfReglagesRubriquesMq[_mqPlein.rub]) || {};
  return { t: cur.t || 1, il: cur.il || 1.38, esp: cur.esp || 0 };
}
// Barre d'une rubrique : trois curseurs (retour Denis 2026-10-01, « la barre de taille du texte, et une deuxieme pour les interlignes »).
function _mqMajBarreRub() {
  // Le nom affiché suit l'intitulé choisi (ou le titre d'office, « Expériences professionnelles ») : la clé _mqPlein.rub reste le nom d'origine.
  _mqEl('mqRubNom').textContent = _mqPlein.rub ? ((typeof _mepIntitule === 'function') ? _mepIntitule(_mqPlein.rub) : _mqPlein.rub) : '';
  var st = _mqStyleRub();
  _mqEl('mqRubT').value = Math.round(st.t * 100); _mqEl('mqRubTv').textContent = Math.round(st.t * 100) + ' %';
  _mqEl('mqRubIl').value = Math.round(st.il * 100); _mqEl('mqRubIlv').textContent = st.il.toFixed(2).replace('.', ',');
  _mqEl('mqRubEsp').value = st.esp; _mqEl('mqRubEspv').textContent = st.esp + ' px';
}
function _mqAppliquerStyleRub(patch) {
  var w = _mqPanneau(); if (!w) { return; }
  _mqPlein.histRub.push(w._pdfMqEtatDisposition());   // « Annuler le dernier reglage » reprend aussi la taille, l'interligne et l'espace
  var st = _mqStyleRub();
  Object.keys(patch).forEach(function (k) { st[k] = patch[k]; });
  w._pdfMqStyleRubrique(_mqPlein.rub, st);
  _mqRendu(); _mqMajBarreRub();
}

function _mqMajBarreBloc() {
  var bl = _mqPlein.bl; if (!bl) { return; }
  var ent = _mqEnteteEtat(), st = ent.sty[bl] || {};
  _mqEl('mqBlNom').textContent = 'Vous réglez : ' + _MQ_TETE_NOMS[bl];
  // La carte choisie est ENTOUREE sur le CV (Denis, 2026-09-29) : on sait toujours pour quelle carte le panneau est ouvert.
  var dSel = _mqEl('mqFrame').contentDocument;
  Array.prototype.forEach.call(dSel.querySelectorAll('.mq-selectionne'), function (x) { x.classList.remove('mq-selectionne'); });
  var selEl = dSel.querySelector('[data-bl="' + bl + '"]'); if (selEl) { selEl.classList.add('mq-selectionne'); }
  var d = _mqEl('mqFrame').contentDocument, el = d.querySelector('[data-bl="' + bl + '"] .' + (bl === 'coord' ? 'coord' : bl));
  var cs = el ? d.defaultView.getComputedStyle(el) : null;
  _mqEl('mqBlGras').classList.toggle('on', st.g !== undefined ? !!st.g : (cs ? parseInt(cs.fontWeight, 10) >= 600 : false));
  _mqEl('mqBlItal').classList.toggle('on', st.i !== undefined ? !!st.i : (cs ? cs.fontStyle === 'italic' : false));
  if (cs) {
    var m = cs.color.match(/\d+/g) || [0, 0, 0];
    _mqEl('mqBlCoul').value = st.c || '#' + [0, 1, 2].map(function (i) { return ('0' + (+m[i]).toString(16)).slice(-2); }).join('');
  }
  // Interligne du bloc (retour Denis 2026-10-01) : la valeur choisie, sinon celle que le CV applique deja.
  var ilBloc = st.il || (cs && parseFloat(cs.lineHeight) > 0 && parseFloat(cs.fontSize) > 0 ? parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) : 1.38);
  ilBloc = Math.max(1, Math.min(2, Math.round(ilBloc * 20) / 20));
  _mqEl('mqBlIl').value = Math.round(ilBloc * 100); _mqEl('mqBlIlv').textContent = ilBloc.toFixed(2).replace('.', ',');
  _mqEl('mqBarreBloc').classList.toggle('sans-libre', !ent.libre);
  _mqEl('mqBarreBloc').classList.toggle('sans-boite', !/^b\d$/.test(bl));
  // TACHE (P11) : plan actuel de ce rectangle (defaut = son rang naturel b1/b2/b3, voir _pdfPlanDefautBoite ci-dessous).
  var ordre = _mqOrdreBoites(ent), rangActuel = ordre.indexOf(bl) + 1;
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-bp]'), function (b) {
    b.classList.toggle('on', parseInt(b.getAttribute('data-bp'), 10) === rangActuel);
    b.disabled = parseInt(b.getAttribute('data-bp'), 10) > ordre.length;
  });
  _mqDessinerPile(ordre, bl);
  // Puces et colonnes du rectangle choisi (par defaut : fleche ; colonnes = ce que la feuille affiche).
  var puActuelle = st.pu || '';
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-pu]'), function (b) { b.classList.toggle('on', b.getAttribute('data-pu') === puActuelle); });
  var liste = d.querySelector('[data-bl="' + bl + '"] .rc-fl'), coActuel = st.co || ((liste && liste.classList.contains('rc-2col')) ? 2 : 1);
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-co]'), function (b) { b.classList.toggle('on', parseInt(b.getAttribute('data-co'), 10) === coActuel); });
}
// Rectangles de competences presents dans la feuille, du DEVANT vers le DERRIERE (z-index decroissant ; a egalite, l'ordre naturel b3, b2, b1).
function _mqOrdreBoites(ent) {
  var d = _mqEl('mqFrame').contentDocument, bls = ['b1', 'b2', 'b3'].filter(function (b) { return d && d.querySelector('[data-bl="' + b + '"]'); });
  return bls.slice().sort(function (a, b) { return ((ent.plan && ent.plan[b]) || _pdfPlanDefautBoite(b)) === ((ent.plan && ent.plan[a]) || _pdfPlanDefautBoite(a)) ? (parseInt(b[1], 10) - parseInt(a[1], 10)) : (((ent.plan && ent.plan[b]) || _pdfPlanDefautBoite(b)) - ((ent.plan && ent.plan[a]) || _pdfPlanDefautBoite(a))); });
}
var _MQ_NOMS_BOITES = { b1: 'Savoir-faire', b2: 'Savoir-être', b3: 'Savoirs' };
// Petite pile de feuilles : la feuille du DEVANT en bas a gauche, les autres plus haut et plus a droite, derriere ; celle du rectangle choisi est en couleur.
function _mqDessinerPile(ordre, courant) {
  var pile = _mqEl('mqPile'); if (!pile) { return; }
  pile.innerHTML = ordre.map(function (bl, i) {
    return '<i class="' + (bl === courant ? 'cur' : '') + '" style="left:' + (i * 13) + 'px;top:' + ((ordre.length - 1 - i) * 9) + 'px;z-index:' + (10 - i) + '" title="' + _MQ_NOMS_BOITES[bl] + ' : ' + (i + 1) + (i === 0 ? ' (devant)' : (i === ordre.length - 1 ? ' (derrière)' : '')) + '">' + (i + 1) + '</i>';
  }).join('');
  pile.setAttribute('title', ordre.map(function (bl, i) { return (i + 1) + ' : ' + _MQ_NOMS_BOITES[bl]; }).join(' ; '));
}
// TACHE (P11) : plan par defaut = le rang naturel du rectangle (b1=1er plan, b2=2e, b3=3e), identique au z-index fixe
// d'avant ce correctif (cvPdfTemplateMaquette.js) -- zero regression pour qui ne touche jamais ce nouveau reglage.
function _pdfPlanDefautBoite(bl) {
  var m = /^b(\d)$/.exec(bl);
  return m ? parseInt(m[1], 10) : 1;
}
function _mqOuvrirBarreBloc(bl, el) {
  _mqPlein.bl = bl; _mqMajBarreBloc();
  var b = _mqEl('mqBarreBloc'); b.style.display = 'flex';
  var f = _mqEl('mqFrame').getBoundingClientRect(), r = el.getBoundingClientRect(), t = el.closest('.tete'), rt = t ? t.getBoundingClientRect() : r;
  b.style.left = Math.max(8, Math.min(window.innerWidth - 480, f.left + r.left)) + 'px';
  b.style.top = Math.max(8, Math.min(window.innerHeight - b.offsetHeight - 8, f.top + rt.bottom + 12)) + 'px';
}

// Position / largeur reelles d'un bloc (en %, et y en px) : depuis le DOM, sinon les valeurs enregistrees.
function _mqGeomDom(bl) {
  var d = _mqEl('mqFrame').contentDocument, b = d.querySelector('.blc[data-bl="' + bl + '"]');
  if (!b) { return { x: 0, y: 0, w: 30 }; }
  var t = b.parentNode;
  return { x: _mqR1(b.offsetLeft / t.offsetWidth * 100), y: b.offsetTop, w: _mqR1(b.offsetWidth / t.offsetWidth * 100) };
}
function _mqTouche(ent) {
  if (!ent.haut) { var t = _mqEl('mqFrame').contentDocument.querySelector('.tete.libre'); if (t) { ent.haut = t.offsetHeight; } }
  // (La hauteur de la zone des rectangles n'est PAS figee ici : elle suit son contenu tant que la personne n'a pas tire sa poignee.)
  ent.modif = true; ent.libre = true;
}
// Rectangles de competences (Rectangles arrondis) : un rectangle qui CACHE du texte d'un autre (le sien passe par-dessus, en le recouvrant) est
// signale en rouge ; le leger chevauchement des bordures voulu par le modele, lui, ne l'est pas.
function _mqTextesDe(blc) {
  return Array.prototype.slice.call(blc.querySelectorAll('.rc-boxt, li'));
}
function _mqRectCacheTexte(r, blocCible) {
  // On mesure le TEXTE lui-meme (ses lignes reelles), pas la case de la ligne, qui va jusqu'au bord du rectangle meme quand le texte est court.
  return _mqTextesDe(blocCible).some(function (t) {
    var plage = t.ownerDocument.createRange();
    plage.selectNodeContents(t);
    return Array.prototype.some.call(plage.getClientRects(), function (q) {
      return q.width > 0 && !(r.right <= q.left + 1 || r.left >= q.right - 1 || r.bottom <= q.top + 1 || r.top >= q.bottom - 1);
    });
  });
}
function _mqVerifierRouge(tete, chevauchementPermis) {
  var blocs = Array.prototype.slice.call(tete.querySelectorAll('.blc')), tr = tete.getBoundingClientRect();
  var rects = blocs.map(function (b) { return b.getBoundingClientRect(); }), n = 0;
  blocs.forEach(function (b, i) {
    // Zone des rectangles a hauteur AUTOMATIQUE : elle grandit avec son contenu, le bas n'est donc jamais « hors cadre » ; seuls les cotes et le haut le sont.
    var basLibre = chevauchementPermis && tete.getAttribute('data-hfixe') !== '1';
    var r = rects[i], sort = r.left < tr.left - 0.5 || r.top < tr.top - 0.5 || r.right > tr.right + 0.5 || (!basLibre && r.bottom > tr.bottom + 0.5), recouvre = false, cache = false;
    if (!chevauchementPermis) { rects.forEach(function (q, j) { if (j !== i && !(r.right <= q.left + 0.5 || r.left >= q.right - 0.5 || r.bottom <= q.top + 0.5 || r.top >= q.bottom - 0.5)) { recouvre = true; } }); }
    else {
      var zi = parseInt(b.style.zIndex, 10) || 0;
      blocs.forEach(function (autre) { if (autre !== b && (parseInt(autre.style.zIndex, 10) || 0) < zi && _mqRectCacheTexte(r, autre)) { cache = true; } });
    }
    if (cache) { b.setAttribute('data-cache', '1'); } else { b.removeAttribute('data-cache'); }
    b.classList.toggle('hors-cadre', sort || recouvre || cache);
  });
  var d = tete.ownerDocument;
  n = d.querySelectorAll('.hors-cadre').length;
  _mqEl('mqHint').textContent = !n ? _mqTexteAide()
    : (d.querySelector('.hors-cadre[data-cache]') ? '⚠ Cadre rouge : ce rectangle cache du texte d’un autre. Déplacez-le, réduisez-le, ou cliquez sur « Écarter les rectangles ».'
      : '⚠ Cadre rouge : ce bloc dépasse de sa zone ou en recouvre un autre. Déplacez-le, réduisez-le, ou agrandissez la zone (poignée du bas).');
  return n;
}

// « Ecarter les rectangles » : chaque rectangle qui cache du texte d'un autre est replace juste sous celui-ci (leger chevauchement de bordure
// conserve) ; les autres ne bougent pas. La zone reprend sa hauteur automatique pour les contenir.
function _mqEcarterRectangles() {
  var d = _mqEl('mqFrame').contentDocument, zone = d.querySelector('.rc-boxes.libre');
  if (!zone) { return; }
  var zr = zone.getBoundingClientRect();
  var blocs = ['b1', 'b2', 'b3'].map(function (bl) { return d.querySelector('.blc[data-bl="' + bl + '"]'); }).filter(Boolean);
  var ent = _mqEnteteEtat(), deplaces = 0, places = [];
  blocs.forEach(function (b) {
    var w = b.offsetWidth, h = b.offsetHeight, x = b.offsetLeft, y = b.offsetTop, bouge = false;
    for (var essai = 0; essai < 30; essai++) {
      var cand = { left: zr.left + x, right: zr.left + x + w, top: zr.top + y, bottom: zr.top + y + h };
      var gene = places.filter(function (p) { return _mqRectCacheTexte(cand, p); });
      if (!gene.length) { break; }
      var bas = 0;
      gene.forEach(function (p) { bas = Math.max(bas, p.offsetTop + p.offsetHeight); });
      y = bas - 6; bouge = true;
    }
    if (bouge) {
      ent.pos = ent.pos || {};
      // x reste celui du rectangle (en % de la zone, tel qu'ecrit dans son style) : jamais un arrondi qui le ferait sortir de la zone.
      var xPct = (/%$/.test(b.style.left) ? parseFloat(b.style.left) : _mqR1(x / zone.offsetWidth * 100));
      ent.pos[b.getAttribute('data-bl')] = { x: xPct, y: Math.round(y) };
      b.style.top = Math.round(y) + 'px';
      deplaces++;
    }
    places.push(b);
  });
  if (!deplaces) { _mqToast('Aucun rectangle ne cache de texte : rien à écarter.'); return; }
  ent.modif = true; ent.libre = true; ent.hautB = null;
  _mqEnteteDefinir(ent);
  _mqToast(deplaces + (deplaces > 1 ? ' rectangles ont été écartés' : ' rectangle a été écarté') + ' : plus aucun texte n’est caché.');
}

// Branche les gestes sur la feuille fraichement ecrite (deplacer une experience, retirer une competence, reglage d'une
// rubrique, texte, en-tete libre).
function _mqBrancher(d, feuille) {
  if (!_mqPanneau()) { return; }
  // Le panneau des reglages est relu A CHAQUE GESTE : la page peut etre reconstruite sous le plein ecran (le petit apercu est alors
  // remplace) ; un panneau memorise au moment du rendu serait detache et le geste serait perdu (2026-09-26).
  var pan = function () { return _mqPanneau(); };
  // « Photo et frise » : nom et coordonnees sont dans la colonne (pas d'en-tete libre) : l'outil « Regler l'en-tete » n'a rien a regler.
  _mqOutilDisponible('mqTEntete', !feuille.classList.contains('cv-photo'), 'Sans effet : sur ce modèle, le nom et les coordonnées sont dans la colonne, il n’y a pas d’en-tête à régler.');
  _mqEl('mqTEcarter').style.display = (_mqPlein.mode.entete && feuille.querySelector('.rc-boxes.libre')) ? '' : 'none';
  _mqEl('mqTEntete').innerHTML = feuille.classList.contains('cv-rect') ? '&#10530; R&eacute;gler l&rsquo;en-t&ecirc;te et les rectangles' : '&#10530; R&eacute;gler l&rsquo;en-t&ecirc;te';
  var m = _mqPlein.mode;
  // Espaces entre rubriques : outils grises (jamais masques) quand ils n'ont rien a faire.
  _mqOutilDisponible('mqTEspacer', _mqUnitesRubriques(feuille).unites.length > 1, 'Sans effet : ce modèle n’a pas plusieurs rubriques à espacer.');
  _mqOutilDisponible('mqTEspRaz', _mqEspacesActuels().length > 0, 'Aucun espace réglé pour l’instant.');
  // Couleur par zone (2026-09-29) : zones marquees ; le bouton n'existe que si le modele a au moins un fond colore modifiable.
  _mqMarquerZones(feuille);
  _mqOutilDisponible('mqTCouleurs', !!feuille.querySelector('[data-zc]:not([data-zc="titres"])'), 'Sans effet : ce modèle n’a pas de zone colorée à modifier.');
  feuille.addEventListener('click', function (ev) {
    if (!m.couleurs && (m.deplacer || m.retirer || m.retirerRubrique || m.texte || m.entete || m.rubriques)) { return; } // un autre outil est actif : aucun conflit
    var t = ev.target, el = t.closest && t.closest('[data-zc]');
    if (!el) { return; }
    var id = el.getAttribute('data-zc');
    if (!m.couleurs) {
      // clic direct : seulement sur le FOND lui-meme (ou une decoration sans texte), jamais sur un texte, une photo ou un bloc qui ont deja leur role
      if (id === 'titres') { return; }
      if (!(t === el || !(t.textContent || '').trim())) { return; }
      if (t.closest('img, [data-bl], h2[data-rub], .ctl-exp, button, a')) { return; }
    }
    _mqOuvrirBarreCoul(id, el);
  });
  // Reglage d'une rubrique seule : clic sur son titre (sauf en mode texte)
  feuille.addEventListener('click', function (ev) {
    var h = ev.target.closest && ev.target.closest('h2[data-rub]');
    // Retour Denis 2026-10-01 : aussi dans « Regler le corps du CV » (mode rubriques), pour regler taille, interligne et espace de chaque rubrique.
    if (h && !m.texte && !m.retirerRubrique && !m.couleurs && !ev.target.closest('.mq-poignee, .mq-poignee-esp')) { _mqOuvrirBarreRub(h); }
  });
  // Deplacer experiences, formations et missions a la souris (poignee ⠿) : voir _mqBrancherOrdre.
  if (m.deplacer) { _mqBrancherOrdre(d, feuille); }
  // Retirer une competence (×)
  Array.prototype.forEach.call(feuille.querySelectorAll('.pill .x, li .x'), function (b) {
    b.addEventListener('click', function (ev) {
      ev.stopPropagation();
      pan()._pdfMqRetirerCompetence(b.getAttribute('data-ret'));
      _mqToast('Compétence retirée de ce CV. Vous la retrouvez dans « Compétences > Les montrer et les choisir ».');
      _mqRendu();
    });
  });
  // TACHE (J4, 2026-09-28) : retirer une rubrique entiere (croix sur son titre, [data-rub] --
  // ajoute par _pdfMqTitreH2/barreR/phH/phLh/<h3> pour TOUS les modeles de la galerie) ou une
  // mission precise (croix sur sa ligne, quelle que soit sa source -- meme cle data-ed que
  // "Modifier le texte", jamais une nouvelle convention). Croix injectees ICI seulement (jamais
  // presentes dans le rendu normal), la feuille etant reecrite en entier a chaque _mqRendu().
  if (m.retirerRubrique) {
    Array.prototype.forEach.call(feuille.querySelectorAll('[data-rub]'), function (h) {
      var x = d.createElement('span');
      x.className = 'mq-x'; x.textContent = '✕'; x.title = 'Retirer cette rubrique';
      h.appendChild(x);
      x.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var rub = h.getAttribute('data-rub');
        pan()._pdfMqRetirerRubrique(rub);
        _mqToast('Rubrique « ' + rub + ' » retirée de ce CV. Vous pouvez l’annuler avec « Annuler le dernier retrait ».');
        _mqRendu();
      });
    });
    Array.prototype.forEach.call(feuille.querySelectorAll('li [data-ed]'), function (span) {
      var cle = span.getAttribute('data-ed') || '';
      if (!/^(mi|fm|em):\d+:\d+$/.test(cle)) { return; }
      var li = span.closest('li'); if (!li) { return; }
      var x = d.createElement('span');
      x.className = 'mq-x'; x.title = 'Retirer cette mission'; x.textContent = '✕';
      li.appendChild(x);
      x.addEventListener('click', function (ev) {
        ev.stopPropagation();
        pan()._pdfMqRetirerMission(cle);
        _mqToast('Mission retirée de ce CV. Vous pouvez l’annuler avec « Annuler le dernier retrait ».');
        _mqRendu();
      });
    });
  }
  // Modifier le texte : chaque texte corrigeable (data-ed) devient editable, la correction est gardee
  if (m.texte) {
    Array.prototype.forEach.call(feuille.querySelectorAll('[data-ed]'), function (el) {
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); } });
      el.addEventListener('input', function () {
        pan()._pdfMqTexteEdite(el.getAttribute('data-ed'), el.getAttribute('data-t'), el.textContent);
      });
      // Retour Denis 2026-10-02 : une mission ou une compétence dont on a effacé tout le texte laissait sa puce toute seule.
      // À la sortie du champ, un texte vide devient un RETRAIT (mission ou compétence), annulable avec « Annuler le dernier retrait ».
      el.addEventListener('blur', function () {
        if (el.textContent.trim() !== '') { return; }
        var cle = el.getAttribute('data-ed') || '';
        var retire = false;
        if (/^(mi|fm|em):\d+:\d+$/.test(cle) && el.closest('li')) {
          pan()._pdfMqTexteEdite(cle, el.getAttribute('data-t'), el.getAttribute('data-t'));
          pan()._pdfMqRetirerMission(cle);
          retire = 'Mission';
        } else {
          var conteneur = el.closest('.pill, li');
          var x = conteneur && conteneur.querySelector('.x[data-ret]');
          if (x) {
            pan()._pdfMqTexteEdite(cle, el.getAttribute('data-t'), el.getAttribute('data-t'));
            pan()._pdfMqRetirerCompetence(x.getAttribute('data-ret'));
            retire = 'Compétence';
          }
        }
        if (retire) {
          _mqToast(retire + ' retirée de ce CV. Vous pouvez l’annuler avec « Annuler le dernier retrait ».');
          _mqRendu();
        }
      });
    });
  }
  // En-tete libre : deplacer, elargir, changer la hauteur
  if (m.entete) { _mqBrancherEntete(d, feuille); }
  // Deplacer les rubriques a la souris : le bouton n'existe que pour les modeles a gabarit commun (colonnes ou groupes de rubriques)
  _mqOutilDisponible('mqTRubriques', _mqUnitesRubriques(feuille).unites.length > 0, 'Sans effet : ce modèle a sa propre disposition, ses rubriques ne se déplacent pas.');
  if (m.rubriques) { _mqBrancherRubriques(d, feuille); }
}

// ============================================================
// DEPLACER EXPERIENCES, FORMATIONS ET MISSIONS A LA SOURIS (Denis, 2026-09-30). Une poignee ⠿ sur chaque element ; on le prend, on le depose
// entre deux autres ; une ligne bleue montre ou il ira. Toujours a l'interieur de son groupe : les experiences entre elles, les formations
// entre elles, les missions d'un meme element entre elles (jamais d'une experience a une autre).
// ============================================================
function _mqCleMission(t) {
  var s = String(t || '');
  [160, 9, 10, 13].forEach(function (code) { s = s.split(String.fromCharCode(code)).join(' '); });
  s = s.split(' ').filter(Boolean).join(' ');
  while (s.length && s.charAt(s.length - 1) === '.') { s = s.slice(0, -1); }
  return s.trim().toLowerCase();
}
// Cle d'un element de l'experience personnelle : le texte de son titre, normalise comme cote panneau (_mepCleExpPerso).
function _mqCleTitrePerso(el) {
  var t = el ? (el.getAttribute('data-t') || el.textContent || '') : '';
  return (typeof normaliserPourComparaison === 'function') ? normaliserPourComparaison(t) : String(t).toLowerCase().trim();
}
function _mqBrancherOrdre(d, feuille) {
  // 1. experiences
  var exps = Array.prototype.slice.call(feuille.querySelectorAll('.item[data-exp], .fr-item[data-exp]'));
  if (exps.length > 1) {
    _mqPoignees(d, feuille, exps, false, function (nouvel) {
      var ordre = nouvel.map(function (x) { return parseInt(x.getAttribute('data-exp'), 10); });
      // les experiences non affichees gardent leur place relative, apres celles qui le sont
      var total = ((window.dossier && dossier.experiences) || []).length, reste = [];
      for (var k = 0; k < total; k++) { if (ordre.indexOf(k) === -1) { reste.push(k); } }
      _mqPanneau()._pdfMqDefinirOrdreExperiences(ordre.concat(reste));
    });
  }
  // 2. formations (ordre memorise par cle de formation)
  var forms = Array.prototype.slice.call(feuille.querySelectorAll('[data-form]'));
  if (forms.length > 1) {
    _mqPoignees(d, feuille, forms, false, function (nouvel) {
      var cles = nouvel.map(function (x) { return x.getAttribute('data-form'); });
      var toutes = (typeof _mepListeFormationsEtCertifsMoteur === 'function' ? _mepListeFormationsEtCertifsMoteur() : []).map(function (f) { return _mepCleExpPerso(f); });
      _mqPanneau()._pdfMqDefinirOrdreFormations(cles.concat(toutes.filter(function (c) { return cles.indexOf(c) === -1; })));
    });
  }
  // 2 bis. experience personnelle (mode « Developper » : un bloc par element ; en « Citer » c'est une seule ligne, rien a glisser)
  // Selon le modele, un element est un bloc « .item » ou une ligne de liste « li » (modeles a rectangles) : dans les deux cas c'est le conteneur
  // direct du titre (repere par data-ed="ep:n") qui se glisse.
  var persos = [];
  Array.prototype.forEach.call(feuille.querySelectorAll('[data-ed^="ep:"]'), function (e) {
    if (!/^ep:\d+$/.test(e.getAttribute('data-ed') || '')) { return; }
    var cont = (e.parentElement && e.parentElement.tagName === 'LI') ? e.parentElement : e.closest('.item');
    if (cont && persos.indexOf(cont) === -1) { persos.push(cont); }
  });
  if (persos.length > 1) {
    persos.forEach(function (el) { el.style.position = 'relative'; el.style.paddingLeft = '28px'; el.style.outline = '1px dashed var(--cv)'; el.style.outlineOffset = '2px'; });
    _mqPoignees(d, feuille, persos, false, function (nouvel) {
      var cles = nouvel.map(function (x) { return _mqCleTitrePerso(x.querySelector('[data-ed^="ep:"]')); });
      var toutes = (((window.dossier && dossier.experiencesPerso) || []).concat((window.dossier && dossier.engagements) || [])).map(function (it) { return _mepCleExpPerso(it); });
      _mqPanneau()._pdfMqDefinirOrdreExpPerso(cles.concat(toutes.filter(function (c) { return cles.indexOf(c) === -1; })));
    });
  }
  // 3. missions : chaque liste de missions d'un meme element (experience, formation, experience personnelle)
  Array.prototype.forEach.call(feuille.querySelectorAll('ul'), function (ul) {
    var lis = Array.prototype.filter.call(ul.children, function (li) {
      var ed = li.tagName === 'LI' ? li.querySelector('[data-ed]') : null;
      return !!ed && ['mi:', 'fm:', 'em:'].indexOf((ed.getAttribute('data-ed') || '').slice(0, 3)) !== -1;
    });
    if (lis.length < 2) { return; }
    var cle0 = lis[0].querySelector('[data-ed]').getAttribute('data-ed');
    var prefixe = cle0.slice(0, cle0.lastIndexOf(':'));
    _mqPoignees(d, feuille, lis, true, function (nouvel) {
      var textes = nouvel.map(function (li) { return _mqCleMission(li.querySelector('[data-ed]').getAttribute('data-t')); });
      _mqPanneau()._pdfMqDefinirOrdreMissions(prefixe, textes);
    });
  });
}
// Ajoute une poignee a chaque element du groupe ; onOrdre(nouvelOrdreDesElements) est appele apres un depot qui change l'ordre.
// Glisser commun aux deplacements du grand apercu (retour Denis 2026-10-01) : l'element est TENU tant que le bouton de la souris est enfonce et n'est depose
// qu'au RELACHEMENT (pointerup). Tout autre fin annule sans rien deposer : touche Echap, perte du pointeur (pointercancel, fenetre quittee, onglet masque).
// Pres du haut ou du bas de la zone, le CV defile tout seul (et les cases suivent le curseur, meme quand on defile a la molette).
//   bouger({clientX, clientY}) : suit le curseur ; deposer() : appele au relachement ; annuler() : appele pour toute autre fin.
function _mqGlisserAvecGarde(d, poignee, ev, bouger, deposer, annuler) {
  var zone = _mqEl('mqZone'), cadre = _mqEl('mqFrame'), actif = true, minuteur = null, vitesse = 0, parent = null;
  function lirePosition(e) { var r = cadre.getBoundingClientRect(); parent = { x: r.left + e.clientX, y: r.top + e.clientY }; }
  function dansCadre() { var r = cadre.getBoundingClientRect(); return { clientX: parent.x - r.left, clientY: parent.y - r.top }; }
  function arreter() {
    actif = false;
    if (minuteur) { clearInterval(minuteur); minuteur = null; }
    // Le suivi ne depend PLUS de la poignee (retour Denis 2026-10-01 : le 2e deplacement restait bloque) : la page est reecrite pendant le relachement du 1er geste, et le
    // navigateur gardait la souris « capturee » par une poignee disparue. On ecoute la page entiere (apercu et fenetre) et on rend la capture explicitement.
    [d, document].forEach(function (cible) { ['pointermove', 'pointerup', 'pointercancel'].forEach(function (nom) { cible.removeEventListener(nom, ecoute, true); }); });
    try { if (poignee.releasePointerCapture) { poignee.releasePointerCapture(ev.pointerId); } } catch (e) { /* deja relachee */ }
    d.removeEventListener('keydown', touche); document.removeEventListener('keydown', touche);
    if (zone) { zone.removeEventListener('scroll', defile); }
  }
  function bord() {
    if (!zone) { return; }
    var z = zone.getBoundingClientRect(), marge = 48;
    vitesse = parent.y < z.top + marge ? -Math.ceil((z.top + marge - parent.y) / 5) : (parent.y > z.bottom - marge ? Math.ceil((parent.y - (z.bottom - marge)) / 5) : 0);
    vitesse = Math.max(-26, Math.min(26, vitesse));
    if (vitesse && !minuteur) { minuteur = setInterval(function () { var av = zone.scrollTop; zone.scrollTop += vitesse; if (zone.scrollTop !== av) { bouger(dansCadre()); } }, 16); }
    if (!vitesse && minuteur) { clearInterval(minuteur); minuteur = null; }
  }
  function suivre(e) { if (!actif) { return; } if (Math.abs(e.clientX - debut.x) + Math.abs(e.clientY - debut.y) > 4) { aBouge = true; } lirePosition(e); bouger(e); bord(); }
  function defile() { if (actif && parent) { bouger(dansCadre()); } }
  var debut = { x: ev.clientX, y: ev.clientY, t: Date.now() }, aBouge = false;
  function relacher() {
    if (!actif) { return; }
    arreter();
    // Un simple clic (sans glisser) ne depose rien : on l'explique au lieu de laisser un ecran bleu sans effet (retour Denis 2026-10-01)
    if (!aBouge && Date.now() - debut.t < 700) { annuler(); _mqToast('Pour déplacer : gardez le bouton enfoncé, glissez la rubrique, puis relâchez. Plus simple : utilisez les flèches ▲ ▼ à côté du titre.'); return; }
    try { deposer(); } catch (e) { annuler(); }   // jamais d'ecran bloque : en cas d'erreur, tout est remis en etat
  }
  function abandonner() { if (!actif) { return; } arreter(); annuler(); }
  // Un evenement venu de la fenetre (hors apercu) est ramene aux coordonnees de l'apercu ; un evenement de la poignee remonte aussi jusqu'ici, sans double effet.
  function ecoute(e) {
    if (!actif || (e.pointerId !== undefined && ev.pointerId !== undefined && e.pointerId !== ev.pointerId)) { return; }
    var vient = (e.view && e.view !== d.defaultView);
    var c = vient ? { clientX: e.clientX - cadre.getBoundingClientRect().left, clientY: e.clientY - cadre.getBoundingClientRect().top } : e;
    if (e.type === 'pointermove') { suivre(c); }
    else if (e.type === 'pointerup') { relacher(); }
    else { abandonner(); }
  }
  function touche(e) { if (e.key === 'Escape') { e.preventDefault(); abandonner(); } }
  try { poignee.setPointerCapture(ev.pointerId); } catch (e) { /* capture indisponible : le glissement continue sur la poignee */ }
  [d, document].forEach(function (cible) { ['pointermove', 'pointerup', 'pointercancel'].forEach(function (nom) { cible.addEventListener(nom, ecoute, true); }); });
  d.addEventListener('keydown', touche); document.addEventListener('keydown', touche);
  if (zone) { zone.addEventListener('scroll', defile); }
  lirePosition(ev); bouger(ev);
}

function _mqPoignees(d, feuille, els, mission, onOrdre) {
  els.forEach(function (el) {
    var h = d.createElement('span');
    h.className = 'mq-poi' + (mission ? ' mq-poi-m' : ''); h.textContent = '⠿'; h.title = 'Glisser pour changer l’ordre';
    el.insertBefore(h, el.firstChild);
    h.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); _mqGlisserOrdre(d, feuille, els, el, h, ev, onOrdre); });
  });
}
function _mqGlisserOrdre(d, feuille, els, el, poignee, ev, onOrdre) {
  var fr = feuille.getBoundingClientRect();
  var pos = els.map(function (x) { var r = x.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, width: r.width }; });
  var ins = d.createElement('div'); ins.className = 'mq-ins'; feuille.appendChild(ins);
  var fant = d.createElement('div'); fant.className = 'mq-fantome';
  var libelle = (el.textContent || '').replace('⠿', '').trim(); fant.textContent = libelle.length > 42 ? libelle.slice(0, 42) + '…' : libelle;
  feuille.appendChild(fant);
  el.classList.add('mq-glisse');
  var courant = null;
  function bouger(e) {
    fant.style.left = (e.clientX - fr.left + 12) + 'px'; fant.style.top = (e.clientY - fr.top + 8) + 'px';
    var cible = pos.length;
    for (var i = 0; i < pos.length; i++) { if (e.clientY < (pos[i].top + pos[i].bottom) / 2) { cible = i; break; } }
    var y = cible < pos.length ? pos[cible].top - 3 : pos[pos.length - 1].bottom + 3;
    ins.style.left = (pos[0].left - fr.left) + 'px'; ins.style.width = pos[0].width + 'px'; ins.style.top = (y - fr.top - 2) + 'px';
    courant = cible;
  }
  function nettoyer() {
    if (ins.parentNode) { ins.parentNode.removeChild(ins); }
    if (fant.parentNode) { fant.parentNode.removeChild(fant); }
    el.classList.remove('mq-glisse');
  }
  function annule() { nettoyer(); _mqToast('Déplacement annulé : rien n’a changé.'); }
  function fin() {
    nettoyer();
    var i = els.indexOf(el), j = courant;
    if (j === null || j === i || j === i + 1) { return; } // deposee a sa place : rien ne change
    var nouvel = els.slice(); nouvel.splice(i, 1); nouvel.splice(j > i ? j - 1 : j, 0, el);
    onOrdre(nouvel);
    _mqToast('Ordre modifié.');
    _mqRendu();
  }
  _mqGlisserAvecGarde(d, poignee, ev, bouger, fin, annule);
}

function _mqBrancherEntete(d, feuille) {
  Array.prototype.forEach.call(feuille.querySelectorAll('.tete.libre, .rc-boxes.libre'), function (zone) { _mqBrancherZone(d, feuille, zone); });
}
// Une zone libre : l'en-tete (« .tete.libre ») ou la zone des trois rectangles de competences (« .rc-boxes.libre », Rectangles arrondis :
// les rectangles se chevauchent par conception, seul un debordement de la zone est signale en rouge).
function _mqBrancherZone(d, feuille, zone) {
  var tete = zone;
  var estRect = zone.classList.contains('rc-boxes');
  var cleHaut = estRect ? 'hautB' : 'haut';
  Array.prototype.forEach.call(tete.querySelectorAll('[data-bl]'), function (b) { b.addEventListener('click', function (ev) { ev.stopPropagation(); }); });
  var k = function () { return tete.getBoundingClientRect().width / tete.offsetWidth; };
  Array.prototype.forEach.call(tete.querySelectorAll('.blc'), function (b) {
    b.addEventListener('pointerdown', function (ev) {
      if (ev.target.closest('.poi-l') || (ev.button !== undefined && ev.button !== 0)) { return; }
      ev.preventDefault();
      var bl = b.getAttribute('data-bl'), ech = k(), x0 = ev.clientX, y0 = ev.clientY, g = _mqGeomDom(bl), bouge = false, nx = g.x, ny = g.y;
      b.setPointerCapture(ev.pointerId);
      function mv(e) {
        var dx = (e.clientX - x0) / ech, dy = (e.clientY - y0) / ech; if (Math.abs(dx) > 3 || Math.abs(dy) > 3) { bouge = true; }
        nx = Math.max(0, Math.min(98, g.x + dx / tete.offsetWidth * 100)); ny = Math.max(0, g.y + dy);
        b.style.left = nx + '%'; b.style.top = ny + 'px'; _mqVerifierRouge(tete, estRect);
      }
      function up() {
        b.removeEventListener('pointermove', mv); b.removeEventListener('pointerup', up); b.removeEventListener('pointercancel', up);
        if (bouge) { var ent = _mqEnteteEtat(); _mqTouche(ent); ent.pos[bl] = { x: _mqR1(nx), y: Math.round(ny) }; _mqEnteteDefinir(ent); }
        else { _mqOuvrirBarreBloc(bl, b); }
      }
      b.addEventListener('pointermove', mv); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    });
  });
  Array.prototype.forEach.call(tete.querySelectorAll('.poi-l'), function (poi) {
    poi.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var b = poi.closest('.blc'), bl = b.getAttribute('data-bl'), ech = k(), x0 = ev.clientX, g = _mqGeomDom(bl), w = g.w;
      poi.setPointerCapture(ev.pointerId);
      function mv(e) { w = Math.max(12, Math.min(100 - g.x, g.w + (e.clientX - x0) / ech / tete.offsetWidth * 100)); b.style.width = w + '%'; _mqVerifierRouge(tete, estRect); }
      function up() {
        poi.removeEventListener('pointermove', mv); poi.removeEventListener('pointerup', up); poi.removeEventListener('pointercancel', up);
        var ent = _mqEnteteEtat(); _mqTouche(ent); ent.larg[bl] = Math.round(w); _mqEnteteDefinir(ent);
      }
      poi.addEventListener('pointermove', mv); poi.addEventListener('pointerup', up); poi.addEventListener('pointercancel', up);
    });
  });
  var ph = tete.querySelector('.poi-h');
  if (ph) {
    ph.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var ech = k(), y0 = ev.clientY, h0 = tete.offsetHeight, h = h0; ph.setPointerCapture(ev.pointerId);
      function mv(e) { h = Math.round(Math.max(estRect ? 60 : 100, Math.min(estRect ? 700 : 400, h0 + (e.clientY - y0) / ech))); tete.style.height = h + 'px'; _mqVerifierRouge(tete, estRect); }
      function up() {
        ph.removeEventListener('pointermove', mv); ph.removeEventListener('pointerup', up); ph.removeEventListener('pointercancel', up);
        var ent = _mqEnteteEtat(); _mqTouche(ent); ent[cleHaut] = h; _mqEnteteDefinir(ent);
      }
      ph.addEventListener('pointermove', mv); ph.addEventListener('pointerup', up); ph.addEventListener('pointercancel', up);
    });
  }
  // Poignee du bas de CHAQUE rectangle de competences : sa hauteur (minimale : il grandit seul si son texte en a besoin).
  Array.prototype.forEach.call(tete.querySelectorAll('.poi-b'), function (pb) {
    pb.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var b = pb.closest('.blc'), bl = b.getAttribute('data-bl'), boite = b.querySelector('.rc-box'), ech = k(), y0 = ev.clientY;
      var avantMin = boite.style.minHeight; boite.style.minHeight = '0'; var mini = b.offsetHeight; boite.style.minHeight = avantMin;
      var h0 = b.offsetHeight, h = h0; pb.setPointerCapture(ev.pointerId);
      function mv(e) { h = Math.round(Math.max(mini, h0 + (e.clientY - y0) / ech)); boite.style.minHeight = h + 'px'; _mqVerifierRouge(tete, estRect); }
      function up() {
        pb.removeEventListener('pointermove', mv); pb.removeEventListener('pointerup', up); pb.removeEventListener('pointercancel', up);
        var ent = _mqEnteteEtat(); _mqTouche(ent); ent.hautBl = ent.hautBl || {}; ent.hautBl[bl] = h; _mqEnteteDefinir(ent);
      }
      pb.addEventListener('pointermove', mv); pb.addEventListener('pointerup', up); pb.addEventListener('pointercancel', up);
    });
  });
  _mqVerifierRouge(tete, estRect);
}

// ============================================================
// DEPLACER LES RUBRIQUES A LA SOURIS (Denis, 2026-09-29 ; maquette docs/MAQUETTE_DEPLACER_RUBRIQUES_2026-09-29.html ; cahier
// CHANTIER_DISPOSITION_PAR_DEFAUT). Emplacements PREDEFINIS (jamais un placement libre) : a 2 colonnes, entre les rubriques de chaque colonne ;
// a 1 colonne, entre les grands groupes (competences, experiences, formations, petites rubriques). « Experience professionnelle » reste a droite.
// Un geste passe en ordre PERSONNALISE (plus aucun recalcul automatique) ; l'etat d'avant est garde pour « Annuler le dernier deplacement ».
// Premiere version : rubriques empilees (le « cote a cote » vient ensuite, meme cahier).
// ============================================================
// Principe general (Denis, 2026-09-29) : un outil qu'on ne peut pas appliquer au modele affiche n'est jamais masque : il est GRISE, avec la raison au survol.
function _mqOutilDisponible(id, actif, raison) {
  var b = _mqEl(id); if (!b) { return; }
  b.style.display = '';
  b.disabled = !actif; b.title = actif ? '' : raison;
  b.style.opacity = actif ? '' : '0.5'; b.style.cursor = actif ? '' : 'not-allowed';
}
function _mqCleRubrique(titre) {
  var T = (typeof _MEP_TITRES_COLONNES !== 'undefined') ? _MEP_TITRES_COLONNES : {};
  for (var k in T) { if (Object.prototype.hasOwnProperty.call(T, k) && _PDF_INTITULES[T[k]] === titre) { return k; } }
  return null;
}
// Nom AFFICHÉ d'une rubrique (intitulé choisi, sinon titre d'office) : les messages ne citent jamais un nom d'origine périmé (retour Denis 2026-10-03).
function _mqNom(origine) { return '« ' + ((typeof _mepIntitule === 'function') ? _mepIntitule(origine) : origine) + ' »'; }
function _mqAvertDuo() { return 'Attention : ' + _mqNom('Formations') + ' et ' + _mqNom('Expérience personnelle') + ', avec leurs missions, seront chacune sur la moitié de la largeur. Vérifiez que le CV reste facile à lire.'; }
// Rubriques contenues dans un element (une ligne du CV) : [{ el, cle }]
function _mqUnitesDe(el) {
  var secs = (el.matches && el.matches('.rub-sec[data-rub]')) ? [el] : Array.prototype.slice.call(el.querySelectorAll('.rub-sec[data-rub]'));
  var l = [];
  secs.forEach(function (s) {
    var k = _mqCleRubrique(s.getAttribute('data-rub'));
    if (k && !l.some(function (u) { return u.cle === k; })) { l.push({ el: s, cle: k }); }
  });
  return l;
}
// Classe d'une rubrique : 'long' (missions developpees : reste seule sur sa ligne), 'moyen' (competences), 'court'.
function _mqClasseRubrique(u) {
  if (u.cle === 'exp') { return 'long'; }
  if (u.cle === 'form' || u.cle === 'perso') { return u.el.querySelector('ul') ? 'long' : 'court'; }
  if (u.cle === 'pro' || u.cle === 'comp') { return 'moyen'; }
  return 'court';
}
// Une ligne (rang) peut-elle accueillir la rubrique u en plus ? max = nombre de rubriques par ligne de la colonne (3 a une colonne, 2 dans la grande colonne, 1 dans l'etroite).
// EXCEPTION voulue par Denis (2026-09-29) : a UNE colonne, Formations et Expérience personnelle peuvent partager une ligne MEME avec des missions developpees
// (deux rubriques secondaires, jamais plus de deux, jamais avec l'Experience professionnelle) ; un avertissement previent que les deux seront plus etroites.
function _mqEstDuoFormPerso(rang, u, unique) {
  var autres = rang.filter(function (x) { return x.cle !== u.cle; });
  return !!unique && autres.length === 1 && ['form', 'perso'].indexOf(u.cle) !== -1 && ['form', 'perso'].indexOf(autres[0].cle) !== -1;
}
// EXCEPTION voulue par Denis (2026-10-01) : a UNE colonne, quand les experiences sont legeres (peu de missions, courtes), l'Experience professionnelle peut
// partager sa ligne avec UNE seule rubrique courte (Certifications, Logiciels, Langues, Centres d'interet, Informations) : l'experience a gauche (60 %), la rubrique
// courte a droite (40 %), pour mieux remplir la page. Un avertissement previent que l'experience sera moins large.
function _mqEstDuoExpCourt(rang, u, unique) {
  var autres = rang.filter(function (x) { return x.cle !== u.cle; });
  if (!unique || autres.length !== 1) { return false; }
  var a = autres[0];
  return (u.cle === 'exp' && a.cle !== 'exp' && _mqClasseRubrique(a) === 'court') || (a.cle === 'exp' && u.cle !== 'exp' && _mqClasseRubrique(u) === 'court');
}
function _mqAvertExp() { return 'Attention : ' + _mqNom('Expérience professionnelle') + ' sera sur 60 % de la largeur, l’autre rubrique sur 40 %. Vérifiez que les expériences restent faciles à lire.'; }
function _mqPeutAccueillir(rang, u, max, unique) {
  var autres = rang.filter(function (x) { return x.cle !== u.cle; });
  if (!autres.length || rang.some(function (x) { return x.cle === u.cle; })) { return false; }
  if (_mqEstDuoFormPerso(rang, u, unique)) { return true; }
  if (_mqEstDuoExpCourt(rang, u, unique)) { return true; }
  if (_mqClasseRubrique(u) === 'long') { return false; }
  if (autres.some(function (x) { return _mqClasseRubrique(x) === 'long'; })) { return false; }
  var moyen = _mqClasseRubrique(u) === 'moyen' || autres.some(function (x) { return _mqClasseRubrique(x) === 'moyen'; });
  return autres.length < (moyen ? Math.min(max, 2) : max);
}
function _mqRaisonRefus(rang, u, max) {
  if (u.cle === 'exp' || rang.some(function (x) { return x.cle === 'exp'; })) { return _mqNom('Expérience professionnelle') + ' ne partage sa ligne qu’avec une seule rubrique courte (' + ['certifications', 'logiciels', 'langues', 'loisirs'].map(function (k) { return _mqNom(_PDF_INTITULES[k]); }).join(', ') + '), à une colonne.'; }
  if (_mqClasseRubrique(u) === 'long') { return 'Cette rubrique a des missions développées : elle reste seule sur sa ligne (sauf ' + _mqNom('Formations') + ' avec ' + _mqNom('Expérience personnelle') + ', à une colonne).'; }
  if (rang.some(function (x) { return x.cle !== u.cle && _mqClasseRubrique(x) === 'long'; })) { return 'Cette ligne contient une rubrique avec missions : elle reste seule.'; }
  return 'Cette ligne est pleine (' + max + ' rubrique' + (max > 1 ? 's' : '') + ' au plus).';
}
// Disposition affichee : { deux, colonnes: [{ nom, el, rangs: [[{el,cle}]], large, max }], unites }
function _mqUnitesRubriques(feuille) {
  var res = { deux: false, colonnes: [], unites: [] };
  var corps = feuille.querySelector('.corps.deux');
  if (corps && corps.children.length >= 2) {
    res.deux = true;
    var cols = [0, 1].map(function (ci) {
      var el = corps.children[ci], rangs = [];
      Array.prototype.forEach.call(el.children, function (c) { var us = _mqUnitesDe(c); if (us.length) { rangs.push(us); } });
      return { el: el, rangs: rangs };
    });
    // « gauche » / « droite » par le CONTENU (l'experience professionnelle est toujours a droite) : robuste aux colonnes inversees
    var iDroite = cols[0].rangs.some(function (r) { return r.some(function (u) { return u.cle === 'exp'; }); }) ? 0 : 1;
    var lmax = Math.max(cols[0].el.getBoundingClientRect().width, cols[1].el.getBoundingClientRect().width);
    cols.forEach(function (c, ci) {
      c.nom = ci === iDroite ? 'droite' : 'gauche';
      c.large = c.el.getBoundingClientRect().width >= lmax - 1; c.max = c.large ? 2 : 1;
    });
    res.colonnes = cols;
  } else {
    var g1 = feuille.querySelector('.corps:not(.deux)');
    if (g1) {
      var rangs1 = [];
      Array.prototype.forEach.call(g1.children, function (grp) {
        Array.prototype.forEach.call(grp.children, function (c) { var us = _mqUnitesDe(c); if (us.length) { rangs1.push(us); } });
      });
      if (rangs1.length) { res.colonnes = [{ nom: 'unique', el: g1, rangs: rangs1, large: true, max: 3 }]; }
    }
  }
  res.colonnes.forEach(function (c) { c.rangs.forEach(function (r) { res.unites = res.unites.concat(r); }); });
  return res;
}
function _mqBrancherRubriques(d, feuille) {
  var info = _mqUnitesRubriques(feuille);
  info.unites.forEach(function (u) {
    u.el.setAttribute('data-mq-unite', u.cle);
    var h = d.createElement('span');
    h.className = 'mq-poignee'; h.textContent = '⠿'; h.title = 'Glisser pour déplacer cette rubrique';
    (u.el.querySelector('h2, .rc-barre, .ph-h, .fr-h, h3') || u.el).appendChild(h);
    h.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); _mqDemarrerDeplacement(d, feuille, info, u, h, ev); });
    // Poignee « espace au-dessus » (retour Denis 2026-10-01) : tirer vers le bas pour espacer, vers le haut pour rapprocher, par crans.
    var he = d.createElement('span');
    he.className = 'mq-poignee mq-poignee-esp'; he.textContent = '↕'; he.title = 'Tirer vers le haut ou le bas pour régler l’espace au-dessus de cette rubrique';
    (u.el.querySelector('h2, .rc-barre, .ph-h, .fr-h, h3') || u.el).appendChild(he);
    he.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); _mqDemarrerEspace(d, feuille, u, he, ev); });
    // Flèches ▲ ▼ (retour Denis 2026-10-01 : « trop difficile d'attraper les rubriques ») : monter ou descendre la rubrique d'un cran, d'un simple clic.
    [['▲', -1, 'Monter cette rubrique d’un cran'], ['▼', 1, 'Descendre cette rubrique d’un cran']].forEach(function (fl) {
      var b = d.createElement('span');
      b.className = 'mq-poignee mq-fleche'; b.textContent = fl[0]; b.title = fl[2];
      (u.el.querySelector('h2, .rc-barre, .ph-h, .fr-h, h3') || u.el).appendChild(b);
      b.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); });
      b.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); _mqDeplacerUnCran(info, u, fl[1]); });
    });
  });
}
function _mqDemarrerDeplacement(d, feuille, info, u, poignee, ev) {
  Array.prototype.forEach.call(feuille.querySelectorAll('.mq-fantome, .mq-slot, .mq-cote'), function (x) { if (x.parentNode) { x.parentNode.removeChild(x); } });   // restes d'un geste interrompu
  var fr = feuille.getBoundingClientRect(), slots = [];
  var rangRect = function (rang) {
    var t = 1e9, b = -1e9, r0 = -1e9, l0 = 1e9;
    rang.forEach(function (x) { var r = x.el.getBoundingClientRect(); t = Math.min(t, r.top); b = Math.max(b, r.bottom); r0 = Math.max(r0, r.right); l0 = Math.min(l0, r.left); });
    return { top: t, bottom: b, right: r0, left: l0 };
  };
  info.colonnes.forEach(function (c) {
    var cr = c.el.getBoundingClientRect(), rs = c.rangs;
    // 1. lignes bleues entre les lignes : la rubrique prend sa PROPRE ligne
    for (var i = 0; i <= rs.length; i++) {
      var y = !rs.length ? cr.top + 8 : (i === 0 ? rangRect(rs[0]).top - 4 : (i === rs.length ? rangRect(rs[rs.length - 1]).bottom + 4 : (rangRect(rs[i - 1]).bottom + rangRect(rs[i]).top) / 2));
      var b = d.createElement('div'); b.className = 'mq-slot';
      b.style.left = (cr.left - fr.left) + 'px'; b.style.width = cr.width + 'px'; b.style.top = (y - fr.top - 3) + 'px';
      feuille.appendChild(b);
      slots.push({ type: 'ligne', col: c.nom, i: i, y: y, x0: cr.left, x1: cr.right, el: b });
    }
    // 2. cases « a cote » (grande colonne ou une colonne) : a droite de chaque ligne
    if (c.max > 1) {
      rs.forEach(function (rang, r) {
        if (rang.some(function (x) { return x.cle === u.cle; })) { return; }
        var unique = c.nom === 'unique', rr = rangRect(rang), ok = _mqPeutAccueillir(rang, u, c.max, unique);
        var duoExp = ok && _mqEstDuoExpCourt(rang, u, unique);
        var attention = duoExp || (ok && _mqEstDuoFormPerso(rang, u, unique) && (_mqClasseRubrique(u) === 'long' || _mqClasseRubrique(rang[0]) === 'long'));
        var bx = d.createElement('div'); bx.className = 'mq-cote' + (ok ? (attention ? ' attention' : '') : ' interdit'); bx.innerHTML = '＋<br>à côté';
        // La case montre la PART que prendrait la nouvelle rubrique : la moitie de la ligne si elle n'en partage qu'une, un tiers si elle en partage deja deux.
        // Experience + rubrique courte : 60 % / 40 % ; l'experience va toujours a gauche.
        var part = (rr.right - rr.left) / (rang.length + 1), bxl = rr.right - part;
        if (duoExp) { part = (rr.right - rr.left) * (u.cle === 'exp' ? 0.6 : 0.4); bxl = u.cle === 'exp' ? rr.left : rr.right - part; }
        bx.style.left = (bxl - fr.left) + 'px'; bx.style.width = part + 'px'; bx.style.top = (rr.top - fr.top) + 'px'; bx.style.height = Math.max(26, rr.bottom - rr.top) + 'px';
        feuille.appendChild(bx);
        slots.push({ type: 'cote', col: c.nom, r: r, ref: rang[0].cle, ok: ok, attention: attention, duoExp: duoExp, rang: rang, max: c.max, y: (rr.top + rr.bottom) / 2, x0: bxl, x1: bxl + part, el: bx, ht: (rr.bottom - rr.top) / 2 });
      });
    }
  });
  var fant = d.createElement('div'); fant.className = 'mq-fantome';
  var titre = u.el.querySelector('[data-rub]:not(.rub-sec)'); fant.textContent = titre ? ((typeof _mepIntitule === 'function') ? _mepIntitule(titre.getAttribute('data-rub')) : titre.getAttribute('data-rub')) : u.cle;
  feuille.appendChild(fant);
  u.el.classList.add('mq-leve');
  var cible = null;
  function refuseColonne(s) { return info.deux && u.cle === 'exp' && s.col !== 'droite'; }
  function bouger(e) {
    fant.style.left = (e.clientX - fr.left + 12) + 'px'; fant.style.top = (e.clientY - fr.top + 8) + 'px';
    var meilleur = null, dmin = 1e9;
    slots.forEach(function (s) {
      s.el.classList.remove('actif');
      var dx = (e.clientX < s.x0) ? s.x0 - e.clientX : (e.clientX > s.x1 ? e.clientX - s.x1 : 0);
      var dd = s.type === 'cote' ? (dx + Math.max(0, Math.abs(s.y - e.clientY) - s.ht)) * 0.7 : (dx * 3 + Math.abs(s.y - e.clientY));
      if (dd < dmin) { dmin = dd; meilleur = s; }
    });
    // Retour Denis 2026-10-01 : curseur juste sous (ou au-dessus de) une case « à côté » acceptée, dans sa largeur : elle passe avant la ligne bleue voisine
    // (sinon la rubrique se retrouvait seule sur sa ligne alors que la personne visait la case). La ligne garde la main si le curseur est tout contre elle.
    if (meilleur && meilleur.type === 'ligne' && Math.abs(meilleur.y - e.clientY) > 6) {
      var proche = null, pmin = 1e9;
      slots.forEach(function (s) {
        if (s.type !== 'cote' || !s.ok || e.clientX < s.x0 || e.clientX > s.x1) { return; }
        var dy = Math.max(0, Math.abs(s.y - e.clientY) - s.ht);
        if (dy <= 24 && dy < pmin) { pmin = dy; proche = s; }
      });
      if (proche) { meilleur = proche; }
    }
    cible = meilleur;
    if (meilleur) {
      meilleur.el.classList.add('actif');
      if (meilleur.type === 'ligne') { meilleur.el.classList.toggle('interdit', refuseColonne(meilleur)); }
      var refus = refuseColonne(meilleur) || (meilleur.type === 'cote' && !meilleur.ok);
      fant.classList.toggle('refus', refus);
      _mqEl('mqHint').classList.toggle('mq-hint-refus', refus);
      _mqEl('mqHint').textContent = refuseColonne(meilleur) ? _mqNom('Expérience professionnelle') + ' reste toujours dans la colonne de droite.'
        : (meilleur.type === 'cote' && !meilleur.ok) ? _mqRaisonRefus(meilleur.rang, u, meilleur.max)
        : (meilleur.type === 'cote' && meilleur.attention) ? (meilleur.duoExp ? _mqAvertExp() : _mqAvertDuo()) : _mqTexteAide();
    }
  }
  function annule() { _mqEl('mqHint').classList.remove('mq-hint-refus'); _mqToast('Déplacement annulé : rien n’a changé.'); _mqRendu(); }
  function fin() {
    _mqEl('mqHint').classList.remove('mq-hint-refus');
    var s = cible;
    if (!s) { _mqRendu(); return; }
    if (refuseColonne(s)) { _mqToast(_mqNom('Expérience professionnelle') + ' reste toujours dans la colonne de droite.'); _mqRendu(); return; }
    if (s.type === 'cote' && !s.ok) { _mqToast(_mqRaisonRefus(s.rang, u, s.max)); _mqRendu(); return; }
    _mqAppliquerDeplacement(info, u, s);
  }
  _mqGlisserAvecGarde(d, poignee, ev, bouger, fin, annule);
}
// Ecrit la nouvelle disposition (ordre PERSONNALISE) et memorise l'etat d'avant.
function _mqAppliquerDeplacement(info, u, slot) {
  var p = _mqPanneau(); if (!p) { return; }
  var rows = {};
  info.colonnes.forEach(function (c) { rows[c.nom] = c.rangs.map(function (r) { return r.map(function (x) { return x.cle; }); }); });
  var i = slot.i;
  Object.keys(rows).forEach(function (nom) {
    for (var r = 0; r < rows[nom].length; r++) {
      var j = rows[nom][r].indexOf(u.cle);
      if (j === -1) { continue; }
      rows[nom][r].splice(j, 1);
      if (!rows[nom][r].length) { rows[nom].splice(r, 1); if (slot.type === 'ligne' && nom === slot.col && r < i) { i--; } }
      break;
    }
  });
  if (slot.type === 'cote') {
    var cible = rows[slot.col].filter(function (r) { return r.indexOf(slot.ref) !== -1; })[0];
    if (!cible) { _mqRendu(); return; }
    cible.push(u.cle);
    if (slot.duoExp) { cible.sort(function (a, b) { return (a === 'exp' ? 0 : 1) - (b === 'exp' ? 0 : 1); }); }   // l'experience reste a gauche
  } else {
    rows[slot.col].splice(i, 0, [u.cle]);
  }
  _mqPlein.histRub.push(p._pdfMqEtatDisposition());
  if (info.deux) { p._pdfMqDefinirDispositionColonnes({ gauche: rows.gauche, droite: rows.droite }); }
  else { p._pdfMqDefinirLignes1Col(rows.unique); }
  _mqToast(slot.type === 'cote' && slot.duoExp ? _mqAvertExp()
    : slot.type === 'cote' && slot.attention ? _mqAvertDuo()
    : slot.type === 'cote' ? 'Rubrique placée à côté. Le CV n’est plus recalculé automatiquement.' : 'Rubrique déplacée. Le CV n’est plus recalculé automatiquement : « Disposition automatique » ramène l’automatique.');
  _mqRendu();
}
// Monter (delta -1) ou descendre (delta 1) une rubrique d'un cran dans sa colonne : la facon la plus simple de la deplacer, sans glisser.
function _mqDeplacerUnCran(info, u, delta) {
  var col = null, r = -1;
  info.colonnes.forEach(function (c) { c.rangs.forEach(function (rang, i) { if (rang.some(function (x) { return x.cle === u.cle; })) { col = c; r = i; } }); });
  if (!col) { return; }
  var seule = col.rangs[r].length === 1;
  if (delta < 0 ? (seule && r === 0) : (seule && r >= col.rangs.length - 1)) { _mqToast('Cette rubrique est déjà tout ' + (delta < 0 ? 'en haut' : 'en bas') + '.'); return; }
  var i = delta < 0 ? (seule ? r - 1 : r) : (seule ? r + 2 : r + 1);
  _mqAppliquerDeplacement(info, u, { type: 'ligne', col: col.nom, i: i });
}
function _mqAnnulerRubriques() {
  var p = _mqPanneau(); if (!p) { return; }
  var e = _mqPlein.histRub.pop();
  if (!e) { _mqToast('Rien à annuler pour l’instant.'); return; }
  p._pdfMqRestaurerDisposition(e);
  _mqToast('Dernier déplacement annulé.'); _mqRendu();
}
function _mqDispositionAutomatique() {
  var p = _mqPanneau(); if (!p) { return; }
  _mqPlein.histRub.push(p._pdfMqEtatDisposition());
  p._pdfMqRestaurerDisposition({ perso: false, ordreColonnes: null, ordreGroupes: null });
  _mqToast('Disposition automatique rétablie.'); _mqRendu();
}

// ============================================================
// ESPACES ENTRE LES RUBRIQUES (retour Denis 2026-10-01). Un seul reglage par rubrique : « espace au-dessus » (px), pose sur le titre de la rubrique
// (reglagesRubriques[titre].esp, voir sec() dans cvPdfTemplateMaquette.js). Trois facons de le regler : le bouton « Espacer les rubriques » (automatique,
// reste sur UNE page, une ou deux colonnes au choix), la poignee ↕ de chaque rubrique (a la main, par CRANS de 4 px : jamais n'importe ou) et le curseur
// « Espace au-dessus » de la barre de la rubrique. Les rubriques d'une meme ligne prennent toujours le meme espace (leurs titres restent alignes).
// ============================================================
var _MQ_CRAN_ESPACE = 4, _MQ_ESPACE_MAX = 48;
function _mqFeuille() { var f = _mqEl('mqFrame'), d = f && f.contentDocument; return d ? d.querySelector('.page-a4') : null; }
function _mqTitreUnite(u) { return u.el.getAttribute('data-rub'); }
function _mqTitresDeLigne(titre) {
  var feuille = _mqFeuille(), res = [titre];
  if (!feuille) { return res; }
  _mqUnitesRubriques(feuille).colonnes.forEach(function (c) {
    c.rangs.forEach(function (r) { if (r.some(function (x) { return _mqTitreUnite(x) === titre; })) { res = r.map(_mqTitreUnite); } });
  });
  return res;
}
function _mqDefinirEspaceLigne(titre, px) {
  var p = _mqPanneau(); if (!p) { return; }
  p._pdfMqFigerDisposition();   // a deux colonnes : la disposition affichee est gardee (sinon la mise en page automatique replace les rubriques)
  var map = {}; _mqTitresDeLigne(titre).forEach(function (t) { map[t] = px; });
  p._pdfMqEspacesRubriques(map);
}
function _mqEspacesActuels() {
  var p = _mqPanneau(), r = (p && p._cvPdfReglagesRubriquesMq) || {};
  return Object.keys(r).filter(function (k) { return r[k] && r[k].esp > 0; });
}
// « Espacer les rubriques » : repartit la place libre entre les rubriques, sans jamais depasser la page. portee : 'toutes' | 'gauche' | 'droite'
// (a une colonne, toujours toute la colonne). Plafond de _MQ_ESPACE_MAX px entre deux rubriques : un CV court n'est pas etire jusqu'au bout.
// Calcul commun au grand apercu ET a la suggestion « Espacer les rubriques » du bouton « Mise en page » (panneau des reglages).
// ctx : { portee, panneau (porte _pdfMqEspacesRubriques / _pdfMqFigerDisposition), feuille() (relit la page A4 a chaque appel : elle est reecrite apres chaque reglage),
// rendre() (reecrit l'apercu quand il n'est pas deja a jour) }. Renvoie { parties, bloque, fige } ou null quand il n'y a rien a espacer.
function _mqEspacerRubriques(ctx) {
  var p = ctx.panneau, portee = ctx.portee, _mqFeuille = ctx.feuille, _mqRendu = ctx.rendre, feuille = _mqFeuille();
  if (!p || !feuille) { return null; }
  // L'apercu peut etre affiche reduit (panneau) : toutes les mesures sont ramenees a la taille reelle de la page.
  var k = feuille.offsetWidth ? (feuille.getBoundingClientRect().width / feuille.offsetWidth) : 1;
  var fige = p._pdfMqFigerDisposition();   // a deux colonnes : la disposition affichee est gardee pendant le calcul
  var info = _mqUnitesRubriques(feuille);
  var cibles = info.colonnes.filter(function (c) { return !info.deux || portee === 'toutes' || c.nom === portee; });
  var raz = {};
  cibles.forEach(function (c) { c.rangs.forEach(function (r) { r.forEach(function (x) { raz[_mqTitreUnite(x)] = 0; }); }); });
  p._pdfMqEspacesRubriques(raz); _mqRendu();
  feuille = _mqFeuille(); info = _mqUnitesRubriques(feuille);
  cibles = info.colonnes.filter(function (c) { return !info.deux || portee === 'toutes' || c.nom === portee; });
  var mm = 96 / 25.4, limite = feuille.getBoundingClientRect().top / k + 297 * mm - 8 * mm - 4;   // bas de la page A4, moins le bas de page
  var bas = function (e) { return e.getBoundingClientRect().bottom / k; };
  var fond = 0;
  Array.prototype.forEach.call(feuille.querySelectorAll('.corps, .corps-pleine-largeur'), function (e) { fond = Math.max(fond, bas(e)); });
  var resume = [], bloque = [];
  var appliquer = function (c, par) {
    var map = {}; c.rangs.forEach(function (r, i) { r.forEach(function (x) { map[_mqTitreUnite(x)] = i === 0 ? 0 : par; }); });
    p._pdfMqEspacesRubriques(map);
  };
  var par = {};
  cibles.forEach(function (c) {
    var corps = c.el.closest ? c.el.closest('.corps') : null;
    var apres = corps ? Math.max(0, fond - bas(corps)) : 0;     // ce qui vient sous les colonnes (ex. bas de page)
    var libre = limite - apres - bas(c.el), trous = c.rangs.length - 1;
    var px = (trous > 0 && libre > 0) ? Math.min(_MQ_ESPACE_MAX, Math.floor(libre / trous)) : 0;
    par[c.nom] = px; if (trous > 0 && libre > 0 && Math.floor(libre / trous) > _MQ_ESPACE_MAX) { bloque.push(c.nom); }
    resume.push({ nom: c.nom, px: px, trous: trous, bas0: bas(c.el), c: c });
  });
  // Deux colonnes visees : elles doivent finir A LA MEME HAUTEUR (rendu homogene). La colonne la plus courte, qui plafonne plus tot, peut alors prendre un espace
  // un peu plus large (jusqu'a 1,5 fois le plafond) pour rejoindre le bas de l'autre.
  if (resume.length > 1) {
    var cible = Math.max.apply(null, resume.map(function (r) { return r.bas0 + r.px * r.trous; }));
    resume.forEach(function (r) {
      if (r.trous < 1) { return; }
      var voulu = Math.min(Math.round(_MQ_ESPACE_MAX * 1.5), Math.floor((cible - r.bas0) / r.trous));
      if (voulu > r.px) { r.px = voulu; par[r.nom] = voulu; }
    });
  }
  resume.forEach(function (r) { appliquer(r.c, r.px); });
  _mqRendu();
  // controle : jamais sous le bas de la page (au pire on retire 1 px a la fois)
  for (var essai = 0; essai < 12; essai++) {
    feuille = _mqFeuille(); info = _mqUnitesRubriques(feuille);
    var depasse = false;
    Array.prototype.forEach.call(feuille.querySelectorAll('.corps, .corps-pleine-largeur'), function (e) { if (bas(e) > limite + 1) { depasse = true; } });
    if (!depasse) { break; }
    var reduit = false;
    info.colonnes.filter(function (c) { return par[c.nom] > 0; }).forEach(function (c) { par[c.nom] -= 1; appliquer(c, par[c.nom]); reduit = true; });
    if (!reduit) { break; }
    _mqRendu();
  }
  var parties = resume.filter(function (r) { return r.trous > 0; }).map(function (r) { return (info.deux ? (r.nom === 'gauche' ? 'colonne de gauche' : 'colonne de droite') + ' : ' : '') + (par[r.nom] || 0) + ' px entre les rubriques'; });
  return parties.length ? { parties: parties, bloque: bloque, fige: fige } : null;
}
// Bouton « Espacer les rubriques » du grand apercu.
function _mqEspacerAuto(portee) {
  var p = _mqPanneau(); if (!p || !_mqFeuille()) { return; }
  _mqPlein.histRub.push(p._pdfMqEtatDisposition());
  var r = _mqEspacerRubriques({ portee: portee, panneau: p, feuille: _mqFeuille, rendre: _mqRendu });
  _mqToast(r
    ? 'Rubriques espacées (' + r.parties.join(', ') + '). Le CV reste sur une page.' + (r.bloque.length ? ' Une colonne est trop courte pour être étirée davantage.' : '') + (r.fige ? ' La disposition des colonnes est gardée telle qu’elle est (« Disposition automatique » la rend à l’automatique).' : '')
    : 'Il n’y a pas assez de rubriques à espacer ici.');
}
function _mqEspacerRaz() {
  var p = _mqPanneau(); if (!p) { return; }
  var map = {}; _mqEspacesActuels().forEach(function (t) { map[t] = 0; });
  _mqPlein.histRub.push(p._pdfMqEtatDisposition());
  p._pdfMqEspacesRubriques(map); _mqToast('Les espaces entre les rubriques sont remis comme au départ.'); _mqRendu();
}
// A la main : la poignee ↕ d'une rubrique. L'espace suit le curseur par crans de 4 px ; il n'est enregistre qu'au relachement (Echap : on annule).
function _mqDemarrerEspace(d, feuille, u, poignee, ev) {
  var titre = _mqTitreUnite(u), p = _mqPanneau(); if (!p) { return; }
  var courant = ((p._cvPdfReglagesRubriquesMq || {})[titre] || {}), esp0 = courant.esp || 0, zoom = courant.t || 1, y0 = ev.clientY, px = esp0;
  var secs = _mqTitresDeLigne(titre).map(function (t) { var l = feuille.querySelectorAll('.rub-sec[data-rub]'); for (var i = 0; i < l.length; i++) { if (l[i].getAttribute('data-rub') === t) { return l[i]; } } return null; }).filter(Boolean);
  var fant = d.createElement('div'); fant.className = 'mq-fantome'; feuille.appendChild(fant);
  var fr = feuille.getBoundingClientRect();
  function bouger(e) {
    var brut = esp0 + (e.clientY - y0);
    px = Math.max(0, Math.min(_MQ_ESPACE_MAX, Math.round(brut / _MQ_CRAN_ESPACE) * _MQ_CRAN_ESPACE));
    secs.forEach(function (s) { s.style.paddingTop = px > 0 ? (px / zoom) + 'px' : ''; });
    fant.textContent = 'Espace au-dessus : ' + px + ' px';
    var r = feuille.getBoundingClientRect(); fr = r;
    fant.style.left = (e.clientX - r.left + 14) + 'px'; fant.style.top = (e.clientY - r.top + 10) + 'px';
  }
  function deposer() {
    if (fant.parentNode) { fant.parentNode.removeChild(fant); }
    if (px === esp0) { _mqRendu(); return; }
    _mqPlein.histRub.push(p._pdfMqEtatDisposition());
    _mqDefinirEspaceLigne(titre, px); _mqToast('Espace réglé à ' + px + ' px au-dessus de « ' + titre + ' ».'); _mqRendu();
  }
  function annuler() { if (fant.parentNode) { fant.parentNode.removeChild(fant); } _mqToast('Réglage annulé : rien n’a changé.'); _mqRendu(); }
  _mqGlisserAvecGarde(d, poignee, ev, bouger, deposer, annuler);
}

// Ecrit la feuille dans l'iframe du plein ecran, a partir du rendu courant du panneau.
function _mqRendu() {
  var w = _mqPanneau(), f = _mqEl('mqFrame'); if (!w || !f) { return; }
  var res = w._pdfMqResultat().resultat;
  var m = _mqPlein.mode;
  var classes = (m.deplacer ? 'mode-deplacer ' : '') + (m.retirer ? 'mode-retirer ' : '') + (m.retirerRubrique ? 'mode-retirer-rubrique ' : '') + (m.entete ? 'mode-entete ' : '') + (m.couleurs ? 'mode-couleurs ' : '') + (m.rubriques ? 'mode-rubriques ' : '') + (m.texte ? 'mode-texte' : '');
  var d = f.contentDocument;
  d.open();
  d.write('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><style>' + res.css + _MQ_CSS_MODES + '</style></head><body class="' + classes + '">' + res.pageHtml + '</body></html>');
  d.close();
  var feuille = d.querySelector('.page-a4');
  if (!feuille) { return; }
  feuille.style.margin = '0 auto';
  if (typeof _pdfMqApresRendu === 'function') { _pdfMqApresRendu(feuille); }
  var h = feuille.scrollHeight, pages = h > 1125 ? 2 : 1;
  if (pages === 2) {
    var mp = d.createElement('div'); mp.className = 'marque-page'; mp.style.top = '1123px'; mp.innerHTML = '<span>fin de la page 1 (estimation)</span>'; feuille.appendChild(mp);
  }
  _mqEl('mqPage').textContent = pages === 1 ? 'Estimation : le CV tient sur 1 page' : 'Estimation : le CV occupe environ 2 pages';
  f.style.height = (h + 30) + 'px';
  _mqBrancher(d, feuille);
  if (m.entete && _mqPlein.bl) { _mqMajBarreBloc(); }
  if (!m.entete) { _mqEl('mqHint').textContent = _mqTexteAide(); }
}

function _mqBasculer(nom) {
  var m = _mqPlein.mode, etait = nom ? m[nom] : false;
  ['deplacer', 'retirer', 'retirerRubrique', 'texte', 'entete', 'couleurs', 'rubriques'].forEach(function (c) { m[c] = false; });
  if (nom && !etait) { m[nom] = true; }
  [['mqTDeplacer', 'deplacer'], ['mqTRetirer', 'retirer'], ['mqTRetirerRubrique', 'retirerRubrique'], ['mqTTexte', 'texte'], ['mqTEntete', 'entete'], ['mqTCouleurs', 'couleurs'], ['mqTRubriques', 'rubriques']].forEach(function (p) { _mqEl(p[0]).classList.toggle('on', m[p[1]]); });
  _mqEl('mqSegRub').style.display = 'flex';   // visible aussi hors « Regler le corps du CV » : « Espacer les rubriques » s'annule ici
  var ent = _mqEnteteEtat();
  ent.libre = !!(m.entete || ent.modif);
  // Sur la frise, l'en-tete empile toujours les 4 blocs au depart : la disposition 2 / 3 colonnes n'a pas de sens (maquette : enFrise()).
  var frMq = _mqEl('mqFrame').contentDocument;
  _mqEl('mqZoneDisp').style.display = (m.entete && !(frMq && (frMq.querySelector('.cv-frise') || frMq.querySelector('.cv-rect')))) ? 'block' : 'none';
  _mqEl('mqBarreBloc').style.display = 'none'; _mqPlein.bl = null;
  _mqEl('mqBarreRub').style.display = 'none'; _mqPlein.rub = null;
  _mqEl('mqBarreCoul').style.display = 'none'; _mqPlein.zc = null;
  _mqEl('mqHint').textContent = _mqTexteAide();
  var w = _mqPanneau(); if (w) { w._pdfMqDefinirEntete(ent); }
  _mqSegDisp();
  _mqRendu();
}
function _mqSegDisp() {
  var d = _mqEnteteEtat().disp, fr = _mqEl('mqFrame').contentDocument, met = fr && fr.querySelector('.metier');
  var courant = d || ((met && met.textContent.length > 42) ? '2' : '3');
  Array.prototype.forEach.call(document.querySelectorAll('#mqSegDisp button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === courant); });
}

// ============================================================
// Couleur de CHAQUE ZONE (Denis, 2026-09-29) -- registre des zones et generation des couleurs : cvPdfCouleursZones.js ; cahier
// docs/CHANTIER_COULEURS_PAR_ZONE_2026-09-29.md. Deux declenchements : le bouton « Modifier les couleurs » (toutes les zones entourees) et le
// clic direct sur un fond sans autre role. Les couleurs GENERALES (accent, degrade) passent par les memes fonctions que la carte « Allure ».
// ============================================================
var _MQ_COULEURS_EXTRA = ['#93aac6', '#e8bf8f', '#ffffff']; // en plus des couleurs de la carte « Allure » : bleu clair, beige, blanc

function _mqCopie(o) { var c = {}; Object.keys(o || {}).forEach(function (k) { c[k] = o[k]; }); return c; }
function _mqChoixCoul() { var w = _mqPanneau(); return (w && w._cvPdfChoixMq) || {}; }
function _mqRgbVersHex(rgb) {
  var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb || '');
  if (!m) { return null; }
  return '#' + [m[1], m[2], m[3]].map(function (n) { var h = parseInt(n, 10).toString(16); return h.length < 2 ? '0' + h : h; }).join('');
}
function _mqMarquerZones(feuille) {
  _PDF_ZONES_COULEUR.forEach(function (z) {
    Array.prototype.forEach.call(feuille.querySelectorAll(z.clic), function (el) {
      if (el.hasAttribute('data-zc')) { return; } // la premiere zone declaree gagne (la plus precise)
      el.setAttribute('data-zc', z.id);
      if (z.id !== 'titres' || _mqPlein.mode.couleurs) { el.setAttribute('title', z.nom + ' : cliquez pour changer sa couleur'); }
    });
  });
}
// Couleur ACTUELLE d'une zone, lue dans le rendu (fond uni, fond d'un ::before, ou premiere couleur d'un degrade).
function _mqCouleurLue(id) {
  var f = _mqEl('mqFrame'), d = f && f.contentDocument, el = d && d.querySelector('[data-zc="' + id + '"]');
  if (!el) { return null; }
  var v = d.defaultView, cs = v.getComputedStyle(el);
  if (id === 'titres') { return _mqRgbVersHex(cs.color); }
  var plein = function (c) { return c && c.indexOf('rgba(0, 0, 0, 0)') === -1 && c !== 'transparent'; };
  if (plein(cs.backgroundColor)) { return _mqRgbVersHex(cs.backgroundColor); }
  var pb = v.getComputedStyle(el, '::before');
  if (plein(pb.backgroundColor)) { return _mqRgbVersHex(pb.backgroundColor); }
  var g = /rgb\(\d+, \d+, \d+\)/.exec(cs.backgroundImage) || /rgb\(\d+, \d+, \d+\)/.exec(pb.backgroundImage);
  if (g) { return _mqRgbVersHex(g[0]); }
  // Colonne « vague » : la couleur est celle du ::before de la PAGE (uni ou dégradé), pas celle de la colonne.
  if (id === 'colonne') {
    var page = d.querySelector('.page-a4'), pp = page && v.getComputedStyle(page, '::before');
    if (pp) {
      if (plein(pp.backgroundColor)) { return _mqRgbVersHex(pp.backgroundColor); }
      var gp = /rgb\(\d+, \d+, \d+\)/.exec(pp.backgroundImage);
      if (gp) { return _mqRgbVersHex(gp[0]); }
    }
  }
  return null;
}
// Alerte de LISIBILITE (Denis, 2026-09-29, « pour mon public ») : la couleur choisie rend-elle le texte de la zone difficile a lire ?
// Mesure sur le VRAI rendu : chaque texte de la zone est compare au fond (et, en degrade, a son extremite claire). Titres : compares au blanc de la page.
function _mqContrasteZone(id, hex, degrade) {
  var f = _mqEl('mqFrame'), d = f && f.contentDocument;
  if (!d || !_pdfHexCouleurValide(hex)) { return null; }
  var v = d.defaultView, pire = null;
  var fonds = id === 'titres' ? ['#ffffff'] : (degrade ? [hex, _pdfExtremiteDegrade(hex)] : [hex]);
  var racines = Array.prototype.slice.call(d.querySelectorAll('[data-zc="' + id + '"]'));
  racines.forEach(function (racine) {
    var els = [racine].concat(Array.prototype.slice.call(racine.querySelectorAll('*')));
    els.forEach(function (el) {
      var texte = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); }).map(function (n) { return n.nodeValue.trim(); }).join(' ');
      if (!texte) { return; }
      var cs = v.getComputedStyle(el), coul = _mqRgbVersHex(cs.color); if (!coul) { return; }
      var taille = parseFloat(cs.fontSize), gras = parseInt(cs.fontWeight, 10) >= 700, grand = taille >= 24 || (taille >= 18.66 && gras);
      fonds.forEach(function (fond) {
        var ratio = _pdfRatioContraste(id === 'titres' ? hex : coul, id === 'titres' ? fond : fond);
        var verdict = _pdfVerdictContraste(ratio, grand);
        if (verdict === 'bon') { return; }
        if (!pire || ratio < pire.ratio) { pire = { verdict: verdict, ratio: ratio, exemple: texte.slice(0, 26) }; }
      });
    });
  });
  return pire;
}
function _mqZoneSuitLaGenerale(z, choix) { return z.suit === 'texte' || _pdfZoneSuitLaGenerale(z, choix.zonesLiees); }

function _mqOuvrirBarreCoul(id, el) {
  _mqPlein.zc = id;
  var b = _mqEl('mqBarreCoul');
  b.style.display = 'flex';
  _mqMajBarreCoul();
  var r = el.getBoundingClientRect(), f = _mqEl('mqFrame').getBoundingClientRect();
  b.style.left = Math.max(8, Math.min(window.innerWidth - b.offsetWidth - 8, f.left + r.left + 14)) + 'px';
  b.style.top = Math.max(8, Math.min(window.innerHeight - b.offsetHeight - 8, f.top + r.top + 14)) + 'px';
}
function _mqMajBarreCoul() {
  var id = _mqPlein.zc, z = id && _pdfZoneCouleur(id); if (!z) { return; }
  var ch = _mqChoixCoul(), w = _mqPanneau(), suit = _mqZoneSuitLaGenerale(z, ch);
  var hex = _mqCouleurLue(id) || '#2f6690';
  _mqEl('mqCoulNom').textContent = z.nom;
  // pastilles : celles de la carte « Allure » + quelques teintes utiles pour une colonne ou un bandeau
  var base = (typeof _MEP_COULEURS_SIMPLES !== 'undefined' ? _MEP_COULEURS_SIMPLES : []).concat(_MQ_COULEURS_EXTRA)
    .filter(function (c, i, a) { return a.indexOf(c) === i; });
  _mqEl('mqCoulSw').innerHTML = base.map(function (c) {
    return '<button type="button" class="sw' + (c.toLowerCase() === hex.toLowerCase() ? ' on' : '') + '" data-c="' + c + '" title="Couleur" aria-label="Couleur ' + c + '" style="background:' + c + '"></button>';
  }).join('');
  Array.prototype.forEach.call(_mqEl('mqCoulSw').querySelectorAll('.sw'), function (b) { b.onclick = function () { _mqAppliquerCouleurZone(b.getAttribute('data-c')); }; });
  var perso = _mqEl('mqCoulPerso');
  perso.style.setProperty('--choisie', hex);
  perso.classList.toggle('on', base.map(function (c) { return c.toLowerCase(); }).indexOf(hex.toLowerCase()) === -1);
  _mqEl('mqCoulInput').value = hex;
  // « liees » : pour les zones qui suivent la couleur generale, et pour l'ecriture des titres
  _mqEl('mqCoulLiees').style.display = z.suit === 'fixe' ? 'none' : 'flex';
  _mqEl('mqCoulCkLiees').checked = _pdfZonesLieesEffectif(ch.zonesLiees);
  // degrade : pas pour l'ecriture. Zone liee : c'est le degrade GENERAL ; sinon, celui de la zone.
  _mqEl('mqCoulDeg').style.display = z.suit === 'texte' ? 'none' : 'flex';
  var dg = w && w.document.getElementById('regDegradeColonnes');
  _mqEl('mqCoulCkDeg').checked = suit ? !!(dg && dg.value !== 'aucun') : !!(ch.couleursZones && ch.couleursZones[id] && ch.couleursZones[id].d);
  var aPropre = !suit && !!(ch.couleursZones && ch.couleursZones[id]);
  _mqEl('mqCoulRaz').style.display = aPropre ? '' : 'none';
  var al = _mqEl('mqCoulAlerte'), ct = z.suit === 'texte' && !_mqCouleurLue(id) ? null : _mqContrasteZone(id, hex, _mqEl('mqCoulCkDeg').checked && z.suit !== 'texte');
  // On n'alerte que si le choix est PIRE que la couleur de départ : un modèle qu'on vient de choisir ne doit pas d'emblée nous avertir.
  // Le départ = le contraste mesuré à la première ouverture de la barre pour cette zone, pendant ce plein écran.
  var dep = _mqPlein.contrasteDepart = _mqPlein.contrasteDepart || {};
  if (!(id in dep)) { dep[id] = ct ? ct.ratio : null; }
  if (ct && dep[id] !== null && ct.ratio >= dep[id] - 0.05) { ct = null; }
  if (ct) {
    al.textContent = (ct.verdict === 'faible' ? '⚠️ Attention : sur ' + (id === 'titres' ? 'le fond blanc de la page' : 'ce fond') + ', le texte (par exemple « ' + ct.exemple + ' ») sera très difficile à lire. '
      : 'Lisibilité limite : le texte (par exemple « ' + ct.exemple + ' ») risque de fatiguer les yeux. ') + 'Une couleur plus claire ou plus foncée est plus confortable.';
    al.classList.toggle('faible', ct.verdict === 'faible'); al.style.display = '';
  } else { al.style.display = 'none'; al.textContent = ''; }
  _mqEl('mqCoulNote').textContent = z.suit === 'texte' ? 'Cette couleur est la couleur générale du CV : elle change aussi les fonds qui lui sont liés.'
    : suit ? 'Couleurs liées : ce fond, les titres et les autres fonds changent ensemble. Décochez « Garder la même couleur » pour régler ce fond seul.'
    : z.suit === 'fixe' ? 'Cette zone a sa propre couleur : elle change seule.' : 'Ce fond a sa propre couleur : les titres gardent la couleur générale.';
}
function _mqAppliquerCouleurZone(hex) {
  var id = _mqPlein.zc, z = id && _pdfZoneCouleur(id), w = _mqPanneau(); if (!z || !w || !_pdfHexCouleurValide(hex)) { return; }
  var ch = _mqChoixCoul();
  if (_mqZoneSuitLaGenerale(z, ch)) { window._mepPoserAccentGlobal(hex); }
  else {
    var zs = _mqCopie(ch.couleursZones), cur = zs[id] || {};
    zs[id] = { c: hex.toLowerCase(), d: !!cur.d };
    w._pdfMqChoix('couleursZones', zs);
  }
  _mqRendu(); _mqMajBarreCoul();
}
function _mqDegradeZone(actif) {
  var id = _mqPlein.zc, z = id && _pdfZoneCouleur(id), w = _mqPanneau(); if (!z || !w) { return; }
  var ch = _mqChoixCoul();
  if (_mqZoneSuitLaGenerale(z, ch)) { window._mepPoserDegradeGlobal(actif); }
  else {
    var zs = _mqCopie(ch.couleursZones), cur = zs[id] || { c: _mqCouleurLue(id) || '#2f6690' };
    zs[id] = { c: cur.c, d: !!actif };
    w._pdfMqChoix('couleursZones', zs);
  }
  _mqRendu(); _mqMajBarreCoul();
}
function _mqRazZone() {
  var id = _mqPlein.zc, w = _mqPanneau(); if (!id || !w) { return; }
  var zs = _mqCopie(_mqChoixCoul().couleursZones); delete zs[id];
  w._pdfMqChoix('couleursZones', Object.keys(zs).length ? zs : null);
  _mqRendu(); _mqMajBarreCoul(); _mqToast('Couleur d’origine remise.');
}
// Couleurs LIEES / DISSOCIEES (aussi appelee par la carte « Organisation » : options rapides). Relier : l'ecriture reprend la couleur du
// premier fond dissocie (decision de Denis) et les fonds redeviennent lies ; dissocier : chaque fond peut avoir sa couleur.
function _mqZonesLier(lier) {
  var w = _mqPanneau(); if (!w) { return; }
  var ch = _mqChoixCoul(), zs = _mqCopie(ch.couleursZones);
  if (lier) {
    var premier = null;
    _PDF_ZONES_COULEUR.forEach(function (z) { if (!premier && z.suit === 'globale' && zs[z.id] && _pdfHexCouleurValide(zs[z.id].c)) { premier = zs[z.id]; } });
    if (premier) { window._mepPoserAccentGlobal(premier.c); }
    _PDF_ZONES_COULEUR.forEach(function (z) { if (z.suit === 'globale') { delete zs[z.id]; } });
    w._pdfMqChoix('couleursZones', Object.keys(zs).length ? zs : null);
    w._pdfMqChoix('zonesLiees', null);
  } else {
    w._pdfMqChoix('zonesLiees', false);
  }
  if (_mqEl('mqFrame')) { _mqRendu(); if (_mqPlein.zc) { _mqMajBarreCoul(); } }
}
function _mqPipette() {
  function poser(hex) { _mqAppliquerCouleurZone(hex); }
  if (typeof window.EyeDropper !== 'function') {
    var v = window.prompt('Votre navigateur ne propose pas d’outil pipette. Écrivez le code couleur (6 caractères, par exemple #2f6690).');
    if (v && /^#?[0-9a-fA-F]{6}$/.test(v.trim())) { poser(v.trim().indexOf('#') === 0 ? v.trim() : '#' + v.trim()); }
    return;
  }
  new window.EyeDropper().open().then(function (r) { poser(r.sRGBHex); }).catch(function () { /* annule */ });
}
function _mqCablerBarreCoul() {
  _mqEl('mqCoulInput').onchange = function () { _mqAppliquerCouleurZone(this.value); };
  _mqEl('mqCoulPipette').onclick = _mqPipette;
  _mqEl('mqCoulCkDeg').onchange = function () { _mqDegradeZone(this.checked); };
  _mqEl('mqCoulCkLiees').onchange = function () { _mqZonesLier(this.checked); };
  _mqEl('mqCoulRaz').onclick = _mqRazZone;
  _mqEl('mqCoulFermer').onclick = function () { _mqEl('mqBarreCoul').style.display = 'none'; _mqPlein.zc = null; };
}

function fermerPleinEcranMaquette() {
  var r = _mqEl('mqPleinRacine');
  var ent = _mqEnteteEtat(); ent.libre = !!ent.modif;
  var w = _mqPanneau();
  if (w) { w._pdfMqDefinirEntete(ent); }
  if (r && r.parentNode) { r.parentNode.removeChild(r); }
  _mqPlein.mode = { deplacer: false, retirer: false, retirerRubrique: false, texte: false, entete: false, couleurs: false, rubriques: false };
  _mqPlein.histRub = [];
  _mqPlein.bl = null; _mqPlein.rub = null; _mqPlein.zc = null;
  // La page des reglages est reconstruite pour refleter TOUT ce qui a ete fait en plein ecran (ordre des experiences, competences retirees,
  // en-tete...) : avant le 2026-09-26, la fonction appelee (`rerendre`) n'existait pas hors de la page, donc les cartes de gauche restaient
  // sur leur ancien etat (ex. « Ordre » affichait encore « Du plus recent » alors que le CV suivait « Mon ordre »).
  try { if (typeof _mepRerendre === 'function') { _mepRerendre(); } else if (typeof pageResultats === 'function') { pageResultats(); } } catch (e) { /* page deja quittee */ }
}

// cible (optionnel) : { bloc: 'nom' | 'coord' | 'metier' | 'accroche' } ou { rubrique: 'Formations' } - un clic sur le petit CV
// ouvre directement le plein ecran sur l'element touche (comme la maquette).
function ouvrirPleinEcranMaquette(cible) {
  if (_mqEl('mqPleinRacine') || !_mqPanneau()) { return; }
  _mqPlein.contrasteDepart = {};
  var racine = document.createElement('div');
  racine.id = 'mqPleinRacine'; racine.className = 'mep-mq';
  racine.innerHTML =
    '<div class="plein ouvert" role="dialog" aria-label="Aperçu en plein écran">' +
    '<div class="plein-tete"><button type="button" class="mep-btn" id="mqRetour">&larr; Revenir aux r&eacute;glages</button>' +
    '<span class="hint" id="mqHint">Vous agissez directement sur le CV.</span><span class="hint" id="mqPage" style="margin-left:auto"></span></div>' +
    '<div class="plein-corps"><div class="plein-outils">' +
    '<button type="button" class="t" id="mqTTexte">&#9997;&#65039; Modifier le texte</button>' +
    '<button type="button" class="t" id="mqTEntete">&#10530; R&eacute;gler l&rsquo;en-t&ecirc;te</button>' +
    '<button type="button" class="t" id="mqTCouleurs">&#127912; Modifier les couleurs</button>' +
    '<div id="mqZoneDisp"><b>Disposition de d&eacute;part</b>' +
    '<div class="seg seg-mini" id="mqSegDisp"><button type="button" data-v="3">3 colonnes</button><button type="button" data-v="2">2 colonnes</button></div>' +
    '<button type="button" class="t" id="mqTRaz" style="width:100%">&#8634; Remettre l&rsquo;en-t&ecirc;te &agrave; sa place</button></div>' +
    '<button type="button" class="t" id="mqTEcarter" style="display:none">&#8645; &Eacute;carter les rectangles</button>' +
    '<button type="button" class="t" id="mqTDeplacer">&#8597; D&eacute;placer exp&eacute;riences, formations et missions</button>' +
    '<button type="button" class="t" id="mqTRubriques">&#10021; R&eacute;gler le corps du CV</button>' +
    '<div class="seg seg-mini" id="mqSegRub"><button type="button" id="mqTAnnulerRub">&#8617; Annuler le dernier r&eacute;glage</button><button type="button" id="mqTAutoRub">&#8634; Disposition automatique</button></div>' +
    '<button type="button" class="t" id="mqTEspacer">&#8597; Espacer les rubriques</button>' +
    '<div class="seg seg-mini" id="mqSegEsp" style="display:none"><button type="button" data-p="toutes">Les deux colonnes</button><button type="button" data-p="gauche">Colonne de gauche</button><button type="button" data-p="droite">Colonne de droite</button></div>' +
    '<div class="seg seg-mini" id="mqSegEspRaz"><button type="button" id="mqTEspRaz" title="Remet les espaces entre les rubriques comme au d&eacute;part">&#8634; Remettre les espaces</button></div>' +
    '<button type="button" class="t" id="mqTRetirer">&#10005; Retirer des missions et des comp&eacute;tences</button>' +
    '<button type="button" class="t" id="mqTRetirerRubrique">&#10005; Retirer une rubrique ou une mission</button>' +
    '<div class="seg seg-mini" id="mqSegAnnuler">' +
    '<button type="button" id="mqTAnnulerDernier" title="Annule le dernier &eacute;l&eacute;ment retir&eacute;">&#8617; Annuler le dernier retrait</button>' +
    '<button type="button" id="mqTToutRemettreRetraits" title="Remet tout ce qui a &eacute;t&eacute; retir&eacute;">&#8646; Tout remettre</button>' +
    '</div>' +
    '</div><div class="plein-zone" id="mqZone"><iframe id="mqFrame" title="Votre CV en grand" style="width:830px;height:1200px;border:0;background:transparent;flex:0 0 auto"></iframe></div></div></div>' +
    '<div class="barre-rub" id="mqBarreRub" style="display:none" role="dialog" aria-label="R&eacute;glages de cette rubrique"><b id="mqRubNom"></b>' +
    '<span class="grp"><label for="mqRubT">Taille du texte</label><input type="range" id="mqRubT" min="70" max="140" step="5"><output id="mqRubTv"></output></span>' +
    '<span class="grp"><label for="mqRubIl">Interligne</label><input type="range" id="mqRubIl" min="110" max="180" step="5"><output id="mqRubIlv"></output></span>' +
    '<span class="grp"><label for="mqRubEsp">Espace au-dessus</label><input type="range" id="mqRubEsp" min="0" max="48" step="4"><output id="mqRubEspv"></output></span>' +
    '<button type="button" id="mqRubRaz">Remettre</button><button type="button" id="mqRubFermer" class="barre-rub-fermer" aria-label="Fermer">&times;</button></div>' +
    '<div class="barre-rub" id="mqBarreBloc" style="display:none" role="dialog" aria-label="R&eacute;glages de ce bloc de l&rsquo;en-t&ecirc;te"><b id="mqBlNom"></b>' +
    '<span class="grp">Taille <button type="button" data-bt="-0.1" aria-label="Plus petit">A&minus;</button><button type="button" data-bt="0.1" aria-label="Plus grand">A+</button></span>' +
    '<span class="grp"><label for="mqBlIl">Interligne</label><input type="range" id="mqBlIl" min="100" max="200" step="5"><output id="mqBlIlv"></output></span>' +
    '<span class="grp"><button type="button" id="mqBlGras" aria-label="Gras"><b>G</b></button><button type="button" id="mqBlItal" aria-label="Italique"><i>I</i></button><input type="color" id="mqBlCoul" aria-label="Couleur du texte" style="width:30px;height:24px;padding:0;border:0"></span>' +
    '<span class="grp libre-seul">Largeur <button type="button" data-bw="-5" aria-label="Plus &eacute;troit">&minus;</button><button type="button" data-bw="5" aria-label="Plus large">+</button></span>' +
    '<span class="grp libre-seul boite-seule">Hauteur <button type="button" data-bh="-10" aria-label="Moins haut">&minus;</button><button type="button" data-bh="10" aria-label="Plus haut">+</button></span>' +
    '<span class="grp libre-seul">Position <button type="button" data-bn="-1,0" aria-label="&Agrave; gauche">&#9664;</button><button type="button" data-bn="0,-4" aria-label="Plus haut">&#9650;</button><button type="button" data-bn="0,4" aria-label="Plus bas">&#9660;</button><button type="button" data-bn="1,0" aria-label="&Agrave; droite">&#9654;</button></span>' +
    // TACHE (P11, audit "La mise en page" 2026-09-28) : "plan" -- pouvoir poser
    // un rectangle de competences sur un autre sans en cacher le texte
    // (uniquement pour les 3 rectangles du modele "Rectangles arrondis" --
    // "boite-seule", jamais affiche pour les 4 blocs de texte de l'en-tete).
    // Denis, 2026-09-29 (« Rectangles arrondis ») : une PILE de feuilles montre l'ordre ; 1 = devant (dessus), 3 = derriere ; les rangs restent tous differents.
    '<span class="grp libre-seul boite-seule">Ordre <span class="mq-pile" id="mqPile" aria-hidden="true"></span><button type="button" data-bp="1" aria-label="Devant (dessus)" title="Devant : ce rectangle passe par-dessus les autres">1</button><button type="button" data-bp="2" aria-label="Au milieu" title="Au milieu">2</button><button type="button" data-bp="3" aria-label="Derri&egrave;re (dessous)" title="Derri&egrave;re : les autres passent par-dessus ce rectangle">3</button></span>' +
    // Denis, 2026-09-29 : style des puces et nombre de colonnes, PAR rectangle de competences (« Rectangles arrondis »).
    '<span class="grp libre-seul boite-seule">Puces <button type="button" data-pu="" aria-label="Fl&egrave;che" title="Fl&egrave;che">&#10146;</button><button type="button" data-pu="rond" aria-label="Rond" title="Rond">&#9679;</button><button type="button" data-pu="carre" aria-label="Carr&eacute;" title="Carr&eacute;">&#9632;</button><button type="button" data-pu="coche" aria-label="Coche" title="Coche">&#10003;</button><button type="button" data-pu="losange" aria-label="Losange" title="Losange">&#9670;</button><button type="button" data-pu="aucune" aria-label="Sans puce" title="Sans puce">sans</button></span>' +
    '<span class="grp libre-seul boite-seule">Colonnes <button type="button" data-co="1" aria-label="Une colonne" title="Une colonne">1</button><button type="button" data-co="2" aria-label="Deux colonnes" title="Deux colonnes">2</button></span>' +
    '<button type="button" id="mqBlRaz">Remettre</button><button type="button" id="mqBlFermer" class="barre-rub-fermer" aria-label="Fermer">&times;</button></div>' +
    // TACHE (couleur par zone, 2026-09-29) : meme apparence que les barres flottantes ci-dessus (barre-rub) ; composants de la carte « Allure »
    // (pastilles .sw, « Personnalisee », case « Degrade »). Degrade en bas a droite, comme demande par Denis.
    '<div class="barre-rub barre-coul" id="mqBarreCoul" style="display:none" role="dialog" aria-label="Couleur de cette zone"><b id="mqCoulNom"></b>' +
    '<div class="swatches" id="mqCoulSw"></div>' +
    '<div class="rang"><label class="sw-perso" id="mqCoulPerso" title="Choisir n&rsquo;importe quelle couleur"><span class="roue"></span><input type="color" id="mqCoulInput" aria-label="Couleur personnalis&eacute;e"> Personnalis&eacute;e</label>' +
    '<button type="button" id="mqCoulPipette" title="R&eacute;cup&eacute;rez une couleur n&rsquo;importe o&ugrave; sur votre &eacute;cran">&#128396;&#65039; Pipette</button></div>' +
    '<label class="case" id="mqCoulLiees"><input type="checkbox" id="mqCoulCkLiees"> Garder la m&ecirc;me couleur que les titres</label>' +
    '<p class="note" id="mqCoulNote"></p>' +
    '<p class="alerte-contraste" id="mqCoulAlerte" role="alert" style="display:none"></p>' +
    '<div class="pied"><button type="button" id="mqCoulRaz">Remettre</button><label class="case" id="mqCoulDeg"><input type="checkbox" id="mqCoulCkDeg"> D&eacute;grad&eacute;</label></div>' +
    '<button type="button" id="mqCoulFermer" class="barre-rub-fermer" aria-label="Fermer">&times;</button></div>' +
    '<div class="toast" id="mqToast"></div>';
  document.body.appendChild(racine);

  _mqEl('mqRetour').onclick = fermerPleinEcranMaquette;
  _mqEl('mqTTexte').onclick = function () { _mqBasculer('texte'); };
  _mqEl('mqTEntete').onclick = function () { _mqBasculer('entete'); };
  _mqEl('mqTCouleurs').onclick = function () { _mqBasculer('couleurs'); };
  _mqCablerBarreCoul();
  _mqEl('mqTDeplacer').onclick = function () { _mqBasculer('deplacer'); };
  _mqEl('mqTRubriques').onclick = function () { _mqBasculer('rubriques'); };
  // « Espacer les rubriques » : a une colonne, tout de suite ; a deux colonnes, on demande d'abord laquelle (les deux, gauche, droite).
  _mqEl('mqTEspacer').onclick = function () {
    var f = _mqFeuille(); if (!f) { return; }
    if (_mqUnitesRubriques(f).deux) { var s = _mqEl('mqSegEsp'); s.style.display = s.style.display === 'none' ? 'flex' : 'none'; }
    else { _mqEspacerAuto('toutes'); }
  };
  Array.prototype.forEach.call(document.querySelectorAll('#mqSegEsp button'), function (b) {
    b.onclick = function () { _mqEl('mqSegEsp').style.display = 'none'; _mqEspacerAuto(b.getAttribute('data-p')); };
  });
  _mqEl('mqTEspRaz').onclick = _mqEspacerRaz;
  _mqEl('mqTAnnulerRub').onclick = _mqAnnulerRubriques;
  _mqEl('mqTAutoRub').onclick = _mqDispositionAutomatique;
  _mqEl('mqTEcarter').onclick = _mqEcarterRectangles;
  _mqEl('mqTRetirer').onclick = function () { _mqBasculer('retirer'); };
  _mqEl('mqTRetirerRubrique').onclick = function () { _mqBasculer('retirerRubrique'); };
  // TACHE (J4, 2026-09-28) : annulation commune a tous les retraits (competences, rubriques,
  // missions) -- pan() relu a chaque clic, meme raison que partout ailleurs dans ce fichier (voir
  // l'entete du fichier).
  _mqEl('mqTAnnulerDernier').onclick = function () {
    var p = _mqPanneau(); if (!p) { return; }
    if (p._pdfMqAnnulerDernierRetrait()) { _mqToast('Dernier retrait annulé.'); _mqRendu(); }
    else { _mqToast('Rien à annuler pour l’instant.'); }
  };
  _mqEl('mqTToutRemettreRetraits').onclick = function () {
    var p = _mqPanneau(); if (!p) { return; }
    if (p._pdfMqToutRemettreRetraits()) { _mqToast('Tout ce qui avait été retiré est remis.'); _mqRendu(); }
    else { _mqToast('Rien à remettre pour l’instant.'); }
  };
  // Disposition de depart (3 / 2 colonnes) : replace les blocs de l'en-tete
  Array.prototype.forEach.call(document.querySelectorAll('#mqSegDisp button'), function (b) {
    b.onclick = function () {
      var ent = _mqEnteteEtat(); ent.disp = b.getAttribute('data-v'); ent.pos = {}; ent.larg = {}; ent.haut = null;
      _mqEnteteDefinir(ent); _mqSegDisp();
      _mqToast('Positions de départ changées : les blocs de l’en-tête sont replacés.');
    };
  });
  _mqEl('mqTRaz').onclick = function () {
    var ent = { libre: _mqPlein.mode.entete, modif: false, disp: null, pos: {}, larg: {}, haut: null, ech: {}, sty: {} };
    _mqEl('mqBarreBloc').style.display = 'none';
    _mqEnteteDefinir(ent); _mqSegDisp(); _mqToast('L’en-tête est remis à sa place de départ.');
  };
  // Barre d'une rubrique
  // Les curseurs montrent le resultat en direct sur le CV (sans tout reecrire) ; le choix est enregistre au relachement.
  var _mqSecDe = function () { var d = _mqEl('mqFrame').contentDocument, l = d ? d.querySelectorAll('.rub-sec[data-rub]') : []; for (var i = 0; i < l.length; i++) { if (l[i].getAttribute('data-rub') === _mqPlein.rub) { return l[i]; } } return null; };
  var _mqApercuRub = function (st) {
    var s = _mqSecDe(); if (!s) { return; }
    s.style.zoom = st.t !== 1 ? String(st.t) : ''; s.style.lineHeight = String(st.il);
    s.style.paddingTop = st.esp > 0 ? (st.esp / (st.t || 1)) + 'px' : '';
  };
  [['mqRubT', 'mqRubTv', 't'], ['mqRubIl', 'mqRubIlv', 'il'], ['mqRubEsp', 'mqRubEspv', 'esp']].forEach(function (c) {
    var champ = _mqEl(c[0]), sortie = _mqEl(c[1]);
    var valeur = function () { var v = parseFloat(champ.value); return c[2] === 'esp' ? v : v / 100; };
    champ.oninput = function () {
      var st = _mqStyleRub(); st[c[2]] = valeur();
      sortie.textContent = c[2] === 't' ? Math.round(st.t * 100) + ' %' : (c[2] === 'il' ? st.il.toFixed(2).replace('.', ',') : st.esp + ' px');
      _mqApercuRub(st);
    };
    champ.onchange = function () {
      var patch = {}; patch[c[2]] = valeur();
      if (c[2] === 'esp') { var pn = _mqPanneau(); if (pn) { _mqPlein.histRub.push(pn._pdfMqEtatDisposition()); } _mqDefinirEspaceLigne(_mqPlein.rub, patch.esp); _mqRendu(); _mqMajBarreRub(); } else { _mqAppliquerStyleRub(patch); }
    };
  });
  _mqEl('mqRubRaz').onclick = function () {
    var w = _mqPanneau(); if (w) { _mqPlein.histRub.push(w._pdfMqEtatDisposition()); w._pdfMqStyleRubrique(_mqPlein.rub, null); }
    _mqRendu(); _mqMajBarreRub();
  };
  _mqEl('mqRubFermer').onclick = function () { _mqEl('mqBarreRub').style.display = 'none'; _mqPlein.rub = null; };
  // Barre d'un bloc de l'en-tete
  function sty(ent) { var bl = _mqPlein.bl; if (!ent.sty[bl]) { ent.sty[bl] = {}; } return ent.sty[bl]; }
  _mqEl('mqBlIl').oninput = function () { _mqEl('mqBlIlv').textContent = (parseFloat(this.value) / 100).toFixed(2).replace('.', ','); };
  _mqEl('mqBlIl').onchange = function () { var ent = _mqEnteteEtat(); sty(ent).il = parseFloat(this.value) / 100; _mqEnteteDefinir(ent); };
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-bt]'), function (b) {
    b.onclick = function () {
      var ent = _mqEnteteEtat(), bl = _mqPlein.bl, cur = ent.ech[bl] || 1;
      ent.ech[bl] = Math.max(0.6, Math.min(2.2, Math.round((cur + parseFloat(b.getAttribute('data-bt'))) * 100) / 100));
      _mqTouche(ent); _mqEnteteDefinir(ent); _mqMajBarreBloc();
    };
  });
  function estGras(ent) { var st = ent.sty[_mqPlein.bl] || {}; return st.g !== undefined ? st.g : _mqEl('mqBlGras').classList.contains('on'); }
  function estItal(ent) { var st = ent.sty[_mqPlein.bl] || {}; return st.i !== undefined ? st.i : _mqEl('mqBlItal').classList.contains('on'); }
  _mqEl('mqBlGras').onclick = function () { var ent = _mqEnteteEtat(), g = !estGras(ent); sty(ent).g = g; _mqTouche(ent); _mqEnteteDefinir(ent); _mqMajBarreBloc(); };
  _mqEl('mqBlItal').onclick = function () { var ent = _mqEnteteEtat(), i = !estItal(ent); sty(ent).i = i; _mqTouche(ent); _mqEnteteDefinir(ent); _mqMajBarreBloc(); };
  _mqEl('mqBlCoul').oninput = function () { var ent = _mqEnteteEtat(); sty(ent).c = this.value; _mqTouche(ent); _mqEnteteDefinir(ent); };
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-bw]'), function (b) {
    b.onclick = function () {
      var ent = _mqEnteteEtat(), bl = _mqPlein.bl, g = _mqGeomDom(bl);
      ent.larg[bl] = Math.round(Math.max(12, Math.min(100 - g.x, g.w + parseFloat(b.getAttribute('data-bw')))));
      _mqTouche(ent); _mqEnteteDefinir(ent);
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-bh]'), function (b) {
    b.onclick = function () {
      var ent = _mqEnteteEtat(), bl = _mqPlein.bl, blc = _mqEl('mqFrame').contentDocument.querySelector('.blc[data-bl="' + bl + '"]');
      var boite = blc && blc.querySelector('.rc-box'); if (!boite) { return; }
      var avantMin = boite.style.minHeight; boite.style.minHeight = '0'; var mini = blc.offsetHeight; boite.style.minHeight = avantMin;
      ent.hautBl = ent.hautBl || {};
      ent.hautBl[bl] = Math.max(mini, blc.offsetHeight + parseFloat(b.getAttribute('data-bh')));
      _mqTouche(ent); _mqEnteteDefinir(ent);
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-bn]'), function (b) {
    b.onclick = function () {
      var ent = _mqEnteteEtat(), bl = _mqPlein.bl, g = _mqGeomDom(bl), dd = b.getAttribute('data-bn').split(',');
      ent.pos[bl] = { x: _mqR1(Math.max(0, Math.min(98, g.x + parseFloat(dd[0])))), y: Math.max(0, g.y + parseFloat(dd[1])) };
      _mqTouche(ent); _mqEnteteDefinir(ent);
    };
  });
  // TACHE (P11, audit "La mise en page" 2026-09-28, retour Denis : "pouvoir poser
  // rectangle sur rectangle mais sans cacher le texte") : choix explicite du plan
  // (1er/2e/3e), remplace le z-index fixe par rectangle (cvPdfTemplateMaquette.js).
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-bp]'), function (b) {
    b.onclick = function () {
      var ent = _mqEnteteEtat(), bl = _mqPlein.bl, rang = parseInt(b.getAttribute('data-bp'), 10);
      if (!/^b\d$/.test(bl || '')) { return; }
      var ordre = _mqOrdreBoites(ent).filter(function (x) { return x !== bl; });
      ordre.splice(Math.min(rang - 1, ordre.length), 0, bl);
      ordre.forEach(function (x, i) { ent.plan[x] = ordre.length - i; }); // devant = plus grand z-index
      _mqTouche(ent); _mqEnteteDefinir(ent); _mqMajBarreBloc();
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll('#mqBarreBloc [data-pu], #mqBarreBloc [data-co]'), function (b) {
    b.onclick = function () {
      var ent = _mqEnteteEtat(), bl = _mqPlein.bl;
      if (!/^b\d$/.test(bl || '')) { return; }
      var st = Object.assign({}, ent.sty[bl] || {});
      if (b.hasAttribute('data-pu')) { if (b.getAttribute('data-pu')) { st.pu = b.getAttribute('data-pu'); } else { delete st.pu; } }
      else { st.co = parseInt(b.getAttribute('data-co'), 10); }
      ent.sty[bl] = st;
      _mqTouche(ent); _mqEnteteDefinir(ent); _mqMajBarreBloc();
    };
  });
  _mqEl('mqBlRaz').onclick = function () {
    var ent = _mqEnteteEtat(), bl = _mqPlein.bl;
    delete ent.pos[bl]; delete ent.larg[bl]; delete ent.ech[bl]; delete ent.sty[bl]; if (ent.hautBl) { delete ent.hautBl[bl]; } delete ent.plan[bl];
    ent.modif = (Object.keys(ent.pos).length + Object.keys(ent.larg).length + Object.keys(ent.ech).length + Object.keys(ent.sty).length + (ent.haut ? 1 : 0)) > 0;
    _mqEnteteDefinir(ent); _mqMajBarreBloc();
  };
  _mqEl('mqBlFermer').onclick = function () {
    _mqEl('mqBarreBloc').style.display = 'none'; _mqPlein.bl = null;
    Array.prototype.forEach.call(_mqEl('mqFrame').contentDocument.querySelectorAll('.mq-selectionne'), function (x) { x.classList.remove('mq-selectionne'); });
  };

  _mqEl('mqZoneDisp').style.display = 'none';
  var ent0 = _mqEnteteEtat();
  if (cible && cible.bloc) { _mqBasculer('entete'); }
  // cible.regler : la personne vient du bouton « Regler sur le CV » d'une carte (retour Denis 2026-10-01) : on arrive sur « Regler le corps du CV », a la rubrique
  // d'ou elle vient, deja reperee et avec sa barre (taille, interligne, espace) ouverte.
  else if (cible && cible.rubrique && cible.regler && !_mqPlein.mode.rubriques) { _mqBasculer('rubriques'); }
  else { _mqRendu(); }
  _mqSegDisp();
  if (cible && (cible.bloc || cible.rubrique)) {
    setTimeout(function () {
      var d = _mqEl('mqFrame').contentDocument;
      if (cible.bloc) { var b = d.querySelector('[data-bl="' + cible.bloc + '"]'); if (b) { _mqOuvrirBarreBloc(cible.bloc, b); } }
      else {
        // le titre de la rubrique : un h2, ou la barre « .rc-barre » du modele Rectangles (jamais le conteneur .rub-sec qui porte le meme attribut)
        var h = d.querySelector('[data-rub="' + cible.rubrique + '"]:not(.rub-sec)');
        if (h) {
          if (cible.regler) {
            var sec = h.closest('.rub-sec'); if (sec) { sec.classList.add('mq-selectionne'); }
            h.scrollIntoView({ block: 'center' });
          }
          _mqOuvrirBarreRub(h);
        }
      }
    }, 120);
  }
  return ent0;
}
