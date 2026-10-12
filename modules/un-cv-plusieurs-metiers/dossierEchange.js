/* ============================================================
   Module « Un CV, plusieurs métiers » : ÉCHANGE TEMPORAIRE DU DOSSIER et rendu d'un CV à partir d'une copie.
   Contexte (prototype P3, plan de la nuit) : l'éditeur et le moteur de rendu des CV lisent le dossier global (`dossier`, js/app.js) pour leurs réglages (l'iframe lit
   window.parent.dossier). Pour rendre ou régler l'aspect d'un AUTRE CV que celui de référence, sa copie prend la place du dossier le temps nécessaire, puis le vrai
   dossier revient (toujours : try/finally, départ par un autre lien, annulation). Prouvé : le vrai dossier reste identique au JSON de contrôle.
   Garde-fous : la disquette (sauvegarderSession) enregistre toujours le VRAI dossier (ucpmDossierVrai) ; naviguerVers restaure le vrai dossier si la personne quitte
   l'éditeur d'aspect autrement que par « Valider » ou « Annuler » (ucpmGardeDossier).
   ============================================================ */

var _ucpmDossierReference = null;   // le vrai dossier, pendant qu'une copie le remplace
var _ucpmEchangeLong = false;       // vrai pendant le réglage de l'aspect d'un CV (éditeur ouvert), faux pendant un simple rendu
var _ucpmFileRendu = Promise.resolve();   // les rendus se font un par un : un seul échange à la fois
var _ucpmCacheRendu = {};           // id d'entrée -> { cle, resultat } (miniatures et PDF réutilisent le dernier rendu à jour)

// Le vrai dossier (celui du CV de référence), même pendant un échange.
function ucpmDossierVrai() { return _ucpmDossierReference || window.dossier; }

function ucpmRestaurerDossier() {
  if (_ucpmDossierReference) {
    window.dossier = _ucpmDossierReference;
    _ucpmDossierReference = null;
  }
  _ucpmEchangeLong = false;
  window._modeAspectUcpm = false;
}

// Appelé par naviguerVers (js/app.js) : quitter pour une autre page que l'éditeur pendant un réglage d'aspect = abandon du réglage, le vrai dossier revient.
function ucpmGardeDossier(route) {
  if (_ucpmDossierReference && _ucpmEchangeLong && route !== 'resultats') {
    ucpmRestaurerDossier();
    if (typeof _ucpmEtat !== 'undefined' && _ucpmEtat) { _ucpmEtat.aspectEnCours = null; }
  }
}

// Exécute une action asynchrone avec `copie` à la place du dossier, puis remet le vrai dossier quoi qu'il arrive. Un seul échange à la fois (file d'attente).
function ucpmAvecDossier(copie, action) {
  var tache = _ucpmFileRendu.then(function () {
    if (_ucpmDossierReference) { throw new Error('échange déjà en cours'); }
    _ucpmDossierReference = window.dossier;
    window.dossier = copie;
    return Promise.resolve().then(action).then(function (r) { ucpmRestaurerDossierCourt(); return r; }, function (e) { ucpmRestaurerDossierCourt(); throw e; });
  });
  _ucpmFileRendu = tache.catch(function () { /* la file continue même si un rendu échoue */ });
  return tache;
}
function ucpmRestaurerDossierCourt() { if (!_ucpmEchangeLong) { ucpmRestaurerDossier(); } }

// Empreinte courte d'un contenu (pour savoir si un rendu en cache est encore à jour).
function ucpmEmpreinte(texte) { return ucpmHachage(texte); }

// La copie du dossier pour UN CV : le dossier de référence avec le titre, l'accroche et, s'il en a un, l'aspect propre à ce CV.
// cv = etat.cvs[id] = { titre, accroche, aspect : null | { pdfReglages, reglagesMiseEnPageCV } }.
function ucpmDossierPourCv(etat, id) {
  var vrai = ucpmDossierVrai();
  var copie = JSON.parse(JSON.stringify(vrai));
  var cv = (etat.cvs && etat.cvs[id]) || {};
  var ref = ucpmRefCourante(etat);
  if (cv.titre) { copie.titreCV = cv.titre; }
  if (!ref || id !== ref.id) {
    copie.ia = copie.ia || {};
    copie.ia.cv = copie.ia.cv || {};
    var acc = String(cv.accroche || '').trim();
    copie.ia.cv.profil = acc;
    copie.ia.cv.accrochesProposees = acc ? [acc] : [];
    copie.ia.cv.accrocheIdx = 0;
    if (cv.aspect) {
      copie.pdfReglages = JSON.parse(JSON.stringify(cv.aspect.pdfReglages || null));
      copie.reglagesMiseEnPageCV = JSON.parse(JSON.stringify(cv.aspect.reglagesMiseEnPageCV || null));
    }
  }
  copie.reglagesMiseEnPageCV = copie.reglagesMiseEnPageCV || {};
  return copie;
}

// Espace libre (en pixels d'écran) sous le dernier contenu de la dernière page A4 d'un document de CV, null si on ne peut pas le mesurer. Un CV qui en laisse trop peu
// (moins de UCPM_MARGE_SECURITE_PX) peut déborder sur une deuxième page à l'impression, alors qu'il tient sur une page à l'écran (ucpmCvTresRempli, logiqueDocuments.js).
function ucpmEspaceLibreDocument(doc) {
  try {
    var pagesEls = doc.querySelectorAll('.page-a4');
    var derniere = pagesEls.length ? pagesEls[pagesEls.length - 1] : null;
    if (!derniere) { return null; }
    var basPage = derniere.getBoundingClientRect().bottom;
    var basContenu = 0;
    Array.prototype.forEach.call(derniere.querySelectorAll('*'), function (el) {
      var porteContenu = el.tagName === 'IMG' || (!el.children.length && String(el.textContent || '').trim());
      if (!porteContenu) { return; }
      var r = el.getBoundingClientRect();
      if (r.height > 0 && r.bottom > basContenu) { basContenu = r.bottom; }
    });
    return basContenu > 0 ? Math.round(basPage - basContenu) : null;
  } catch (e) { return null; }
}

// Le rendu en cache de ce CV existe-t-il et correspond-il à son état actuel (titre, accroche, aspect) ? Sinon il faut le refaire (ucpmRendreCv).
function ucpmRenduAJour(etat, id) {
  var c = _ucpmCacheRendu[id];
  return !!c && c.cle === ucpmEmpreinte(JSON.stringify(ucpmDossierPourCv(etat, id)));
}

// Rend UN CV dans une iframe cachée (même moteur que l'aperçu et l'export Word). Renvoie { html, css, nbPages, hauteurPage, police, libre } : html = les pages (`.page-a4`),
// css = les règles du CV, de quoi les montrer isolées dans un compartiment (shadow root) sans toucher aux autres CV. Le rendu passe par l'échange de dossier.
function ucpmRendreCv(etat, id) {
  var copie = ucpmDossierPourCv(etat, id);
  var cle = ucpmEmpreinte(JSON.stringify(copie));
  var cache = _ucpmCacheRendu[id];
  if (cache && cache.cle === cle) { return Promise.resolve(cache.resultat); }
  return ucpmAvecDossier(copie, function () {
    return new Promise(function (resoudre, rejeter) {
      var identite = copie.identite || {};
      var nomComplet = [identite.prenom, identite.nom].filter(Boolean).join(' ');
      var iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.setAttribute('tabindex', '-1');
      iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden;pointer-events:none;';
      document.body.appendChild(iframe);
      var retirer = function () { try { if (iframe.parentNode) { iframe.parentNode.removeChild(iframe); } } catch (e) { /* déjà retirée */ } };
      try {
        iframe.contentWindow.__cvPdfDossierSource = copie;
        iframe.contentWindow.__cvPdfModeGrandApercu = false;
        iframe.contentDocument.open();
        iframe.contentDocument.write(construirePageInteractivePdfA4(nomComplet, copie));
        iframe.contentDocument.close();
      } catch (e) { retirer(); rejeter(e); return; }
      var essais = 0, derniere = -1;
      (function attendre() {
        essais += 1;
        var doc = iframe.contentDocument;
        var cv = doc && (doc.querySelector('#conteneurPage .cv') || doc.querySelector('#conteneurPage .feuille-a4-remplie') || doc.querySelector('#conteneurPage .page-a5'));
        if (!cv) { if (essais > 150) { retirer(); rejeter(new Error('page du CV introuvable')); return; } setTimeout(attendre, 100); return; }
        var remplissagePret = !(doc.defaultView && doc.defaultView.__cvPdfRemplissagePret === false);
        var pretes = remplissagePret && (doc.fonts && doc.fonts.status ? doc.fonts.status === 'loaded' : true) && Array.prototype.every.call(doc.images || [], function (im) { return im.complete; });
        var hauteur = cv.getBoundingClientRect().height;
        if (!(pretes && hauteur === derniere) && essais <= 150) { derniere = hauteur; setTimeout(attendre, 120); return; }
        var conteneur = doc.getElementById('conteneurPage');
        // Les couleurs et les échelles de taille du moteur de CV (--cv, --col, --k, --kh, --tt...) sont définies sur « :root ». Dans un compartiment étanche (shadow root),
        // « :root » ne désigne rien : sans cette conversion en « :host », le CV perd ses couleurs et ses tailles (CV blanc, accroche trop grande, textes qui se chevauchent).
        var styles = ['styleCv', 'stylePage'].map(function (sid) { var s = doc.getElementById(sid); return s ? s.textContent : ''; }).join(String.fromCharCode(10));
        styles = ucpmCssPourCompartiment(styles);
        var clone = conteneur.cloneNode(true);
        Array.prototype.forEach.call(clone.querySelectorAll('[contenteditable]'), function (el) { el.removeAttribute('contenteditable'); });
        var pages = doc.querySelectorAll('.page-a4').length || 1;
        var libre = ucpmEspaceLibreDocument(doc);
        var police = (doc.defaultView && doc.defaultView.getComputedStyle) ? doc.defaultView.getComputedStyle(cv).fontFamily : '';
        var resultat = { html: clone.innerHTML, css: styles, nbPages: pages, hauteurPage: Math.round(hauteur), police: police, libre: libre };
        retirer();
        _ucpmCacheRendu[id] = { cle: cle, resultat: resultat };
        resoudre(resultat);
      })();
    });
  });
}

// ---------------- Réglage de l'aspect d'un CV avec l'éditeur commun (page « Vos documents ») ----------------
// La copie du CV prend la place du dossier pendant tout le réglage ; « Valider cet aspect » garde ses réglages d'aspect, « Annuler » ou tout autre départ les jette.

function ucpmOuvrirAspect(id) {
  var etat = ouvrirUnCvPlusieursMetiers();
  if (_ucpmDossierReference) { return; }
  var copie = ucpmDossierPourCv(etat, id);
  _ucpmDossierReference = window.dossier;
  _ucpmEchangeLong = true;
  window.dossier = copie;
  window._modeAspectUcpm = true;
  etat.aspectEnCours = id;
  // Le CV de ce module est validé par construction (page 3) : l'éditeur s'ouvre sur les réglages, jamais sur les étapes de l'assistant.
  if (typeof ucpmPreparerEtatEditeur === 'function') { ucpmPreparerEtatEditeur(); }
  naviguerVers('resultats');
}

function ucpmFinAspect(valider) {
  var etat = ouvrirUnCvPlusieursMetiers();
  var id = etat.aspectEnCours;
  var copie = window.dossier;
  if (valider && id && _ucpmDossierReference && copie) {
    etat.cvs = etat.cvs || {};
    etat.cvs[id] = etat.cvs[id] || {};
    etat.cvs[id].aspect = {
      pdfReglages: JSON.parse(JSON.stringify(copie.pdfReglages || null)),
      reglagesMiseEnPageCV: JSON.parse(JSON.stringify(copie.reglagesMiseEnPageCV || null))
    };
    delete _ucpmCacheRendu[id];
  }
  ucpmRestaurerDossier();
  etat.aspectEnCours = null;
  etat.page = 5; etat.pageMax = Math.max(etat.pageMax || 1, 5);
  naviguerVers('un-cv-plusieurs-metiers');
}

// Barre du bas de l'éditeur d'aspect (appelée par pageResultats via ucpmBarreDepuisEditeur, page3Reference.js).
function ucpmBarreAspect() {
  return barreNavigation('un-cv-plusieurs-metiers', 'un-cv-plusieurs-metiers', 'Valider cet aspect &#8594;', {
    onclickPrecedent: 'ucpmFinAspect(false)',
    onclickSuivant: 'ucpmFinAspect(true)'
  });
}

// L'éditeur d'aspect ne montre que les panneaux d'aspect (modèle, mise en page, allure, ambiance, en-tête) : le corps du CV reste celui de la référence.
// Les panneaux qui changent le contenu sont cachés par une règle CSS posée quand l'éditeur est ouvert pour un aspect.
var UCPM_CSS_ASPECT = '<style id="styleAspectUcpm">#cOrg,#cExp,#cForm,#cExpPerso,#cComp,#cSupp{display:none !important;}</style>';
