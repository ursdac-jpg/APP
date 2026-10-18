/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 7 « Mes documents sont prêts » (fin du parcours, maquette V2 validée par Denis).
   Plus rien à modifier ici : on télécharge.
   - Document 1 : tous les CV en UN seul PDF (un compartiment étanche par CV : modèles différents sans contamination).
   - Document 2 : toutes les lettres en un seul PDF (une lettre par page, mise en page classique française : logiqueDocuments.js).
   - « Mes CV, un par un » : un CV seul, ou un CV avec sa lettre en un seul fichier (le CV, puis sa lettre).
   - APRÈS un téléchargement seulement : « Chercher des offres en direct » (même panneau que la page 2, ucpmHtmlPanneauOffres), rien n'est importé.
   Les PDF passent par l'impression du navigateur (cadre invisible, le public choisit « Enregistrer en PDF »), comme les autres fiches de l'application.
   Pas de Word fusionné (décision de Denis) ; le fichier Word d'un CV reste dans le parcours habituel de l'application.
   ============================================================ */

var _ucpmUi7 = { offres: null, promptOffres: null, offresIds: null, occupe: false };

function _ucpmP7Cvs(etat) { return ucpmEntreesCochees(etat); }
function _ucpmP7TexteLettre(etat, id) { return String((etat.lettres && etat.lettres[id]) || '').trim(); }
function _ucpmP7AvecLettre(etat) { return _ucpmP7Cvs(etat).filter(function (e) { return !!_ucpmP7TexteLettre(etat, e.id); }); }

// Entrées proposées pour la recherche d'offres : toutes par défaut, ou celles que la personne a gardées cochées.
function _ucpmP7OffresChoisies(etat) {
  var cvs = _ucpmP7Cvs(etat);
  if (!Array.isArray(_ucpmUi7.offresIds)) { return cvs; }
  return cvs.filter(function (e) { return _ucpmUi7.offresIds.indexOf(e.id) >= 0; });
}

// ---------------- Impression (cadre invisible) ----------------

// Imprime un document HTML complet dans un cadre invisible. Le titre de la page de l'application est posé le temps de l'impression : c'est lui que le navigateur
// propose comme nom du fichier PDF (même méthode que l'impression du CV). window.__ucpmImpressionSimulee (essais seulement) remplace l'ouverture de la boîte d'impression.
function ucpmImprimerDocument(titre, html) {
  return new Promise(function (resoudre) {
    if (typeof window.__ucpmImpressionSimulee === 'function') { window.__ucpmImpressionSimulee(titre, html); resoudre(); return; }
    var ancien = document.getElementById('ucpmCadreImpression');
    if (ancien) { ancien.remove(); }
    var cadre = document.createElement('iframe');
    cadre.id = 'ucpmCadreImpression';
    cadre.setAttribute('aria-hidden', 'true');
    cadre.setAttribute('tabindex', '-1');
    cadre.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(cadre);
    var doc = cadre.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    var essais = 0;
    (function attendre() {
      essais += 1;
      var pretes = Array.prototype.every.call(doc.images || [], function (im) { return im.complete; }) && (!doc.fonts || doc.fonts.status !== 'loading');
      if (!pretes && essais < 40) { setTimeout(attendre, 100); return; }
      var titreAvant = document.title;
      document.title = titre;
      try { cadre.contentWindow.focus(); cadre.contentWindow.print(); }
      catch (e) { if (typeof afficherToast === 'function') { afficherToast('L’impression n’a pas pu s’ouvrir. Réessayez dans un instant.', 6000); } }
      finally { document.title = titreAvant; }
      resoudre();
    })();
  });
}

// Nom proposé à l'enregistrement du PDF (le navigateur reprend le titre de la page), décidé par Denis le 2026-10-13 pour CE module :
//   tous les CV, ou un CV seul : « CV_NOM »  ·  toutes les lettres : « L_M_NOM »  ·  un CV avec sa lettre : « metier_NOM ».
// NOM = le nom écrit sur le CV, en majuscules, sans accent (même règle que le reste de l'application, nomFichierCV) ; metier = l'intitulé du CV choisi, en minuscules,
// mots reliés par des tirets, 40 caractères au plus. Sans nom : le prénom ; sans rien : le préfixe seul (« CV », « L_M ») ou « cv ».
function _ucpmP7Segment(texte) {
  if (typeof _identiteSegmentFichier === 'function') { return _identiteSegmentFichier(texte); }
  return String(texte || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function ucpmNomFichierPdf(mode, titreCV, identite) {
  var id = identite || {};
  var nom = _ucpmP7Segment(String(id.nom || id.prenom || '').toLocaleUpperCase('fr-FR'));
  var morceaux;
  if (mode === 'lettres') { morceaux = ['L_M', nom]; }
  else if (mode === 'cv-lettre' || mode === 'preparation') {
    var metier = _ucpmP7Segment(String(titreCV || '').toLocaleLowerCase('fr-FR'));
    if (metier.length > 40) { metier = metier.slice(0, 40).replace(/-[^-]*$/, '').replace(/^$/, metier.slice(0, 40)); }
    morceaux = mode === 'preparation' ? ['preparation', metier, nom] : [metier, nom];
  }
  else if (mode === 'preparations') { morceaux = ['PREPARATION', nom]; }
  else { morceaux = ['CV', nom]; }
  return morceaux.filter(Boolean).join('_') || 'cv';
}
function _ucpmP7NomFichier(mode, titreCV) {
  return ucpmNomFichierPdf(mode, titreCV, ucpmDossierVrai().identite);
}

// Coordonnées de la lettre : le téléphone écrit comme sur le CV (formaterTelephone, cv-core/identiteFormat.js), jamais en bloc de chiffres.
function _ucpmP7IdentiteLettre() {
  var id = Object.assign({}, ucpmDossierVrai().identite || {});
  if (typeof formaterTelephone === 'function' && id.telephone) { id.telephone = formaterTelephone(id.telephone); }
  return id;
}

function _ucpmP7FeuilleLettre(etat, e, police) {
  return {
    css: UCPM_CSS_LETTRE,
    html: ucpmHtmlLettre({ identite: _ucpmP7IdentiteLettre(), objectif: e.objectif, texte: _ucpmP7TexteLettre(etat, e.id), dateTexte: ucpmDateEnTexte(new Date()), police: police })
  };
}

// mode : 'cvs' (tous les CV), 'lettres' (toutes les lettres), 'cv' (un CV, id), 'cv-lettre' (un CV puis sa lettre, id).
function _ucpmP7Telecharger(etat, mode, id) {
  if (_ucpmUi7.occupe) { return; }
  var cvs = _ucpmP7Cvs(etat);
  var cibles = (mode === 'cv' || mode === 'cv-lettre') ? cvs.filter(function (e) { return e.id === id; }) : (mode === 'lettres' ? _ucpmP7AvecLettre(etat) : cvs);
  if (!cibles.length) { return; }
  _ucpmUi7.occupe = true;
  Array.prototype.forEach.call(document.querySelectorAll('[data-ucpm-tel]'), function (b) { b.disabled = true; });
  var chaine = Promise.resolve([]);
  cibles.forEach(function (e) {
    chaine = chaine.then(function (feuilles) {
      return ucpmRendreCv(etat, e.id).then(function (r) {
        if (mode === 'cvs' || mode === 'cv' || mode === 'cv-lettre') { feuilles.push({ css: r.css, html: r.html }); }
        if (mode === 'lettres' || mode === 'cv-lettre') { feuilles.push(_ucpmP7FeuilleLettre(etat, e, r.police)); }
        return feuilles;
      });
    });
  });
  var titreCvChoisi = (etat.cvs && etat.cvs[id] && etat.cvs[id].titre) || '';
  chaine.then(function (feuilles) {
    var nom = _ucpmP7NomFichier(mode, titreCvChoisi);
    return ucpmImprimerDocument(nom, ucpmDocumentImpression(nom, feuilles));
  }).then(function () {
    etat.p7Telecharge = true;
    if (typeof trackEvenement === 'function') { trackEvenement('ucpm_telechargement', { type: mode }); }
  }).catch(function () {
    if (typeof afficherToast === 'function') { afficherToast('Le document n’a pas pu être préparé. Merci de réessayer dans un instant.', 6000); }
  }).then(function () {
    _ucpmUi7.occupe = false;
    if (pageActuelle === 'un-cv-plusieurs-metiers' && etat.page === 7) { ucpmRendrePage(); }
  });
}

// ---------------- Page ----------------

function _ucpmP7Pages(etat, cvs) {
  return cvs.map(function (e) { var c = _ucpmCacheRendu[e.id]; return c && c.resultat ? c.resultat.nbPages : 1; });
}

function _ucpmP7HtmlCarte(etat, e, ref) {
  var cv = (etat.cvs && etat.cvs[e.id]) || {};
  var estRef = !!ref && e.id === ref.id;
  var c = _ucpmCacheRendu[e.id];
  var alerte = c && c.resultat ? ucpmTexteAlerteCv(c.resultat.nbPages, c.resultat.libre) : '';
  var a = !!_ucpmP7TexteLettre(etat, e.id);
  var longue = a && ucpmLettreLongue(_ucpmP7TexteLettre(etat, e.id));
  return '<div class="cv-section" style="margin:0;" data-ucpm-carte="' + e.id + '">' +
    '<div style="display:flex;gap:.8rem;align-items:flex-start;">' +
    '<div data-ucpm-miniature="' + e.id + '" style="width:' + UCPM_LARGEUR_MINIATURE + 'px;height:' + Math.round(UCPM_LARGEUR_MINIATURE * 1123 / 794) + 'px;flex:0 0 ' + UCPM_LARGEUR_MINIATURE + 'px;border:1px solid var(--border);border-radius:4px;background:var(--bg-card);overflow:hidden;position:relative;"' +
    ' role="img" aria-label="Aperçu du CV ' + _ucpmP6Numero(etat, e.id) + '"><span class="small" style="color:var(--text-muted);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:.5rem;">Préparation de l’aperçu…</span></div>' +
    '<div style="flex:1;min-width:0;"><p class="mb-1"><strong>CV ' + _ucpmP6Numero(etat, e.id) + ' : ' + _ucpmEsc(cv.titre || ucpmNomMetier(e, etat.sexe)) + '</strong>' + (estRef ? ' <span class="badge bg-secondary">CV de référence</span>' : '') + '</p>' +
    '<p class="small mb-1" style="color:var(--text-muted);">Objectif : ' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) + '</p>' +
    '<p class="small mb-1" data-ucpm-alerte-pages="' + e.id + '" style="color:var(--warning-strong);"' + (alerte ? '' : ' hidden') + '>' + _ucpmEsc(alerte) + '</p>' +
    (longue ? '<p class="small mb-0" style="color:var(--warning-strong);">Sa lettre est longue : elle risque de passer sur deux pages.</p>' : '') + '</div></div>' +
    '<div class="d-flex flex-wrap gap-2 mt-2">' +
    '<button type="button" class="btn btn-outline-primary btn-sm" data-ucpm-tel="cv" data-ucpm-tel-id="' + e.id + '">Télécharger ce CV</button>' +
    (a ? '<button type="button" class="btn btn-outline-primary btn-sm" data-ucpm-tel="cv-lettre" data-ucpm-tel-id="' + e.id + '">Télécharger ce CV avec sa lettre</button>' : '') +
    (_ucpmP8Prep(etat, e.id) ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-p8-tel-p7="' + e.id + '">Télécharger la préparation d’entretien</button>' : '') +
    '</div></div>';
}

function _ucpmP7HtmlOffres(etat, cvs) {
  if (!etat.p7Telecharge) {
    return '<p class="small text-center" style="color:var(--text-muted);">Après le téléchargement de vos documents, vous pourrez chercher des offres en direct pour vos métiers.</p>';
  }
  var choisies = _ucpmP7OffresChoisies(etat).map(function (e) { return e.id; });
  var h = '<div class="cv-section"><h4>&#128269; Chercher des offres en direct</h4>' +
    '<p class="mb-2">Choisissez les métiers pour lesquels chercher des offres en direct : tous, ou seulement un ou deux.</p>' +
    '<div class="d-flex flex-wrap gap-2 mb-2"><button type="button" class="btn btn-outline-secondary btn-sm" id="btnUcpmP7OffresTous">Tout cocher</button>' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnUcpmP7OffresAucun">Tout décocher</button></div>' +
    cvs.map(function (e) {
      var cv = (etat.cvs && etat.cvs[e.id]) || {};
      return '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0 0 .4rem 0;">' +
        '<input type="checkbox" style="margin-top:.3rem;" data-ucpm-p7-offre="' + e.id + '"' + (choisies.indexOf(e.id) >= 0 ? ' checked' : '') + '>' +
        '<span style="flex:1;min-width:0;"><strong>' + _ucpmEsc(cv.titre || ucpmNomMetier(e, etat.sexe)) + '</strong><br><span class="small" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) + '</span></span></label>';
    }).join('') +
    '<div class="mt-2"><button type="button" class="btn btn-primary" id="btnUcpmP7Offres"' + (choisies.length ? '' : ' disabled title="Cochez au moins un métier."') + '>Chercher des offres pour ' + choisies.length + ' métier' + (choisies.length > 1 ? 's' : '') + '</button></div>' +
    ucpmHtmlPanneauOffres(etat, _ucpmP7OffresChoisies(etat), _ucpmUi7, { libelle: 'Les métiers cochés et leur objectif' }) + '</div>';
  return h;
}

function _ucpmP7Rendre(etat) {
  var cvs = _ucpmP7Cvs(etat);
  var avec = _ucpmP7AvecLettre(etat);
  var ref = ucpmRefCourante(etat);
  var prets = cvs.every(function (e) { return ucpmRenduAJour(etat, e.id); });
  var pagesCv = _ucpmP7Pages(etat, cvs);
  var nbPages = ucpmPagesDocument(pagesCv, 0);
  var desactive = (!prets || _ucpmUi7.occupe) ? ' disabled' : '';
  var h = '<div class="cv-section" style="border-left:4px solid var(--success-strong);"><p class="mb-0">Vos documents sont prêts : <strong>' + cvs.length + ' CV</strong> et <strong>' + avec.length + ' lettre' + (avec.length > 1 ? 's' : '') + '</strong>. ' +
    'Pour les enregistrer, choisissez « Enregistrer en PDF » dans la fenêtre d’impression qui s’ouvre.</p>' +
    (prets ? '' : '<p class="small mb-0 mt-1" style="color:var(--text-muted);" role="status">Préparation de vos CV en cours : les boutons se débloquent dans un instant.</p>') + '</div>';

  h += _ucpmP7HtmlPerimees(etat);
  h += '<div class="cv-section"><h4>&#128196; Document 1 : mes CV</h4>' +
    '<p class="mb-2">Un seul document PDF de ' + nbPages + ' page' + (nbPages > 1 ? 's' : '') + (nbPages > cvs.length ? ' (certains CV passent sur plusieurs pages)' : ', un CV par page') + '.</p>' +
    '<div class="mb-2">' + cvs.map(function (e) { var cv = (etat.cvs && etat.cvs[e.id]) || {}; return '<span class="badge bg-secondary me-1 mb-1">CV ' + _ucpmP6Numero(etat, e.id) + ' : ' + _ucpmEsc(cv.titre || ucpmNomMetier(e, etat.sexe)) + '</span>'; }).join('') + '</div>' +
    '<button type="button" class="btn btn-primary" data-ucpm-tel="cvs"' + desactive + '>Télécharger mes CV (un seul PDF)</button></div>';

  h += '<div class="cv-section"><h4>&#9993;&#65039; Document 2 : mes lettres de motivation</h4>' +
    (avec.length
      ? '<p class="mb-2">Un seul document PDF de ' + avec.length + ' page' + (avec.length > 1 ? 's' : '') + ', une lettre par page.</p>' +
        '<div class="mb-2">' + avec.map(function (e) { var cv = (etat.cvs && etat.cvs[e.id]) || {}; return '<span class="badge bg-secondary me-1 mb-1">Lettre : ' + _ucpmEsc(cv.titre || ucpmNomMetier(e, etat.sexe)) + '</span>'; }).join('') + '</div>' +
        '<div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-primary" data-ucpm-tel="lettres"' + desactive + '>Télécharger mes lettres (un seul PDF)</button>' +
        '<button type="button" class="btn btn-outline-primary" id="btnUcpmP7Retravail">Retravailler une lettre avec l’assistant</button></div>'
      : '<p class="mb-0">Vous n’avez pas de lettre. Vous pouvez revenir en arrière pour en demander.</p>') + '</div>';

  h += '<div class="cv-section"><h4>&#128450;&#65039; Mes CV, un par un</h4>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:1rem;align-items:start;">' + cvs.map(function (e) { return _ucpmP7HtmlCarte(etat, e, ref); }).join('') + '</div>' +
    '<p class="small mt-2 mb-0" style="color:var(--text-muted);">« Ce CV avec sa lettre » donne un seul fichier : le CV, puis sa lettre, prêt à envoyer pour une candidature. <strong>Vous envoyez le CV et la lettre ; la préparation d’entretien est pour vous.</strong> Elle n’est jamais ajoutée à ce fichier.</p></div>';

  h += _ucpmP7HtmlPreparations(etat);

  return h + _ucpmP7HtmlOffres(etat, cvs);
}

// Document 3 : les préparations d'entretien (facultatives, pour la personne seule : jamais dans les fichiers à envoyer).
function _ucpmP7HtmlPreparations(etat) {
  var avec = _ucpmP8AvecPrep(etat);
  return '<div class="cv-section" style="border-left:4px solid var(--accent);"><h4>&#128221; Document 3 : mes préparations d’entretien <span class="small" style="color:var(--text-muted);font-weight:400;">(facultatif)</span></h4>' +
    '<p class="mb-2">Une feuille par métier : les questions probables, ce que le recruteur cherche, des pistes pour répondre et des conseils. À garder pour vous.</p>' +
    '<div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-primary" id="btnUcpmP7Entretiens">' + (avec.length ? 'Voir mes préparations' : 'Préparer mes entretiens') + ' &#8594;</button>' +
    (avec.length ? '<button type="button" class="btn btn-outline-primary" data-ucpm-p8-tel-p7="toutes">Télécharger toutes mes préparations (un seul PDF)</button>' : '') + '</div>' +
    (avec.length ? '<p class="small mt-2 mb-0" style="color:var(--text-muted);">' + avec.length + ' préparation' + (avec.length > 1 ? 's' : '') + ' : une feuille A4 par métier (deux pour une préparation approfondie qui ne tient pas sur une page).</p>' : '') + '</div>';
}

// Règle de Retour : une lettre dont ce qui avait été envoyé a changé est signalée avant le téléchargement (rien n'est modifié ici).
function _ucpmP7HtmlPerimees(etat) {
  var p = _ucpmP6Perimees(etat);
  if (!p.length) { return ''; }
  return '<div class="cv-section" style="border-left:4px solid var(--warning-strong);" role="status"><p class="mb-0 small"><strong>' + (p.length > 1 ? 'Certaines lettres ne correspondent peut-être plus' : 'Une lettre ne correspond peut-être plus') + '</strong> à ce que vous avez changé depuis la demande (' +
    p.map(function (e) { return 'CV ' + _ucpmP6Numero(etat, e.id); }).join(', ') + '). Pour la mettre à jour, revenez à la page des lettres avec le bouton « Retour ». Vous pouvez aussi télécharger telle quelle.</p></div>';
}

function _ucpmP7Cabler(etat) {
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  $$('[data-ucpm-tel]', function (el) {
    el.addEventListener('click', function () { _ucpmP7Telecharger(etat, el.getAttribute('data-ucpm-tel'), el.getAttribute('data-ucpm-tel-id')); });
  });

  // Document 3 : préparations d'entretien (page 8).
  var entretiens = document.getElementById('btnUcpmP7Entretiens');
  if (entretiens) { entretiens.addEventListener('click', function () { etat.p8Vue = _ucpmP8AvecPrep(etat).length ? 'lecture' : 'choix'; ucpmAllerPage(8); }); }
  $$('[data-ucpm-p8-tel-p7]', function (el) {
    el.addEventListener('click', function () { var v = el.getAttribute('data-ucpm-p8-tel-p7'); ucpmTelechargerPreparations(etat, v === 'toutes' ? null : v); });
  });

  // Retravailler une lettre : ouvre le passage de la page 6 (la première lettre est choisie, la personne peut en changer).
  var retravail = document.getElementById('btnUcpmP7Retravail');
  if (retravail) {
    retravail.addEventListener('click', function () {
      var premiere = _ucpmP7AvecLettre(etat)[0];
      if (premiere && ucpmPreparerRetravailLettre(etat, premiere.id)) { ucpmAllerPage(6); }
    });
  }

  // Recherche d'offres (après un téléchargement).
  var cvs = _ucpmP7Cvs(etat);
  $$('[data-ucpm-p7-offre]', function (el) {
    el.addEventListener('change', function () {
      var ids = [];
      $$('[data-ucpm-p7-offre]', function (c) { if (c.checked) { ids.push(c.getAttribute('data-ucpm-p7-offre')); } });
      _ucpmUi7.offresIds = ids.length === cvs.length ? null : ids;
      ucpmRendrePage();
    });
  });
  var tous = document.getElementById('btnUcpmP7OffresTous'); if (tous) { tous.addEventListener('click', function () { _ucpmUi7.offresIds = null; ucpmRendrePage(); }); }
  var aucun = document.getElementById('btnUcpmP7OffresAucun'); if (aucun) { aucun.addEventListener('click', function () { _ucpmUi7.offresIds = []; ucpmRendrePage(); }); }
  var ouvrir = document.getElementById('btnUcpmP7Offres');
  if (ouvrir) {
    ouvrir.addEventListener('click', function () {
      _ucpmUi7.offres = _ucpmUi7.offres ? null : { assistant: 'chatgpt' };
      if (_ucpmUi7.offres && !_ucpmUi7.promptOffres) {
        ucpmChargerPrompt('ucpm-offres', 'ucpm-offres.md').then(function (m) { _ucpmUi7.promptOffres = m; }).catch(function () { /* rechargé au clic si besoin */ });
      }
      ucpmRendrePage();
    });
  }
  ucpmCablerPanneauOffres(etat, _ucpmUi7, function () { return _ucpmP7OffresChoisies(etat); }, ucpmRendrePage);

  // Aperçus et nombre de pages de chaque CV : rendus un par un ; la page se redessine une fois, quand tout est prêt.
  var etaitPret = cvs.every(function (e) { return ucpmRenduAJour(etat, e.id); });
  _ucpmP5RendreMiniatures(etat, cvs.map(function (e) { return e.id; }), 7).then(function () {
    if (!etaitPret && pageActuelle === 'un-cv-plusieurs-metiers' && etat.page === 7 && cvs.every(function (e) { return ucpmRenduAJour(etat, e.id); })) { ucpmRendrePage(); }
  });
}

ucpmEnregistrerPage(7, {
  rendre: _ucpmP7Rendre,
  cabler: _ucpmP7Cabler,
  libelleContinuer: 'Préparer mes entretiens (facultatif) &#8594;',
  peutContinuer: function () { return true; },
  retour: function () { _ucpmUi7.offres = null; return false; }
});
