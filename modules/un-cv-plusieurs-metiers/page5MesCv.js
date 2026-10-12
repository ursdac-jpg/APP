/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 5 « Mes CV » (option A de la maquette, validée par Denis).
   Une carte par CV, en grille (3 par ligne en grand écran, 2 en largeur moyenne, 1 sur téléphone) : miniature du vrai CV, objectif, titre modifiable, phrase d'accroche
   (repliée : « Choisir ma phrase d'accroche » déplie les deux propositions de l'assistant, modifiables, plus « Ma propre phrase »), aspect.
   Par défaut tous les CV ont l'aspect du CV de référence ; « Changer l'aspect » ouvre l'éditeur de CV commun sur la COPIE de ce CV (échange temporaire du dossier,
   dossierEchange.js), panneaux d'aspect seulement ; « Valider cet aspect » le garde, « Annuler » le jette.
   « Passer aux lettres » reste bloqué tant qu'un CV (hors référence, déjà choisi à la page 3) n'a pas sa phrase d'accroche.
   Les miniatures sont rendues par le moteur de CV de l'application, un CV à la fois, puis montrées dans un compartiment étanche (shadow root) à l'échelle.
   ============================================================ */

var _ucpmUi5 = { accOuverte: null };
var UCPM_LARGEUR_MINIATURE = 150;

function _ucpmP5Assurer(etat) {
  etat.cvs = etat.cvs || {};
  var ref = ucpmRefCourante(etat);
  var vrai = ucpmDossierVrai();
  ucpmEntreesCochees(etat).forEach(function (e) {
    var cv = etat.cvs[e.id] = etat.cvs[e.id] || {};
    var estRef = !!ref && e.id === ref.id;
    if (cv.titre === undefined) { cv.titre = (estRef && (etat.refTitre || vrai.titreCV)) || ucpmNomMetier(e, etat.sexe); }
    if (estRef) {
      cv.accroche = String((vrai.ia && vrai.ia.cv && vrai.ia.cv.profil) || '');
      cv.accrocheChoisie = true;
    } else if (cv.accroche === undefined) {
      cv.accroche = ''; cv.accrocheChoisie = false;
    }
  });
}

function _ucpmP5Numero(etat, id) {
  var liste = ucpmEntreesCochees(etat);
  for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) { return i + 1; } }
  return 0;
}

// Les CV qui n'ont pas encore leur phrase d'accroche (la référence a déjà la sienne).
function ucpmCvSansAccroche(etat) {
  var ref = ucpmRefCourante(etat);
  return ucpmEntreesCochees(etat).filter(function (e) {
    return (!ref || e.id !== ref.id) && !(etat.cvs && etat.cvs[e.id] && etat.cvs[e.id].accrocheChoisie && String(etat.cvs[e.id].accroche || '').trim());
  });
}

function _ucpmP5HtmlAccroche(etat, e, cv, estRef) {
  if (estRef) {
    return '<p class="small mb-2"><strong>Phrase d’accroche</strong> <span style="color:var(--success-strong);">&#10003; choisie à la page 3</span><br><span style="color:var(--text-muted);">' + _ucpmEsc(cv.accroche) + '</span></p>';
  }
  var choisie = !!(cv.accrocheChoisie && String(cv.accroche || '').trim());
  var h = '<div class="mb-2"><p class="small mb-1"><strong>Phrase d’accroche</strong> ' +
    (choisie ? '<span style="color:var(--success-strong);">&#10003; choisie</span>' : '<span style="color:var(--danger);">à choisir</span>') + '</p>';
  if (choisie) { h += '<p class="small mb-1" style="color:var(--text-muted);">' + _ucpmEsc(cv.accroche) + '</p>'; }
  if (_ucpmUi5.accOuverte === e.id) {
    var props = (etat.accroches && etat.accroches[e.id]) || [];
    var rang = cv.accrocheRang;
    var options = props.map(function (t, k) { return { cle: String(k), titre: 'Proposition ' + (k + 1), texte: (cv.accrocheModifs && cv.accrocheModifs[k] !== undefined) ? cv.accrocheModifs[k] : t }; });
    options.push({ cle: 'perso', titre: 'Ma propre phrase', texte: cv.accrochePerso || '' });
    h += '<div class="mt-2">' + options.map(function (o) {
      return '<div class="mb-2"><label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0;"><input type="radio" style="margin-top:.35rem;" name="ucpmAccr_' + e.id + '" data-ucpm-acc-radio="' + e.id + '|' + o.cle + '"' + (String(rang) === o.cle ? ' checked' : '') + '>' +
        '<span style="flex:1;min-width:0;"><strong class="small">' + o.titre + '</strong>' +
        '<textarea class="form-control mt-1" rows="3" maxlength="260" data-ucpm-acc-texte="' + e.id + '|' + o.cle + '" aria-label="' + o.titre + '"' + (o.cle === 'perso' ? ' placeholder="Écrivez une phrase courte, avec vos mots."' : '') + '>' + echapperTexteUcpm(o.texte) + '</textarea></span></label></div>';
    }).join('') + '<button type="button" class="btn ' + (choisie ? 'btn-primary' : 'btn-outline-secondary') + ' btn-sm" data-ucpm-acc-fermer="' + e.id + '">' + (choisie ? 'Valider' : 'Fermer') + '</button></div>';
  } else {
    h += '<button type="button" class="btn btn-outline-primary btn-sm" data-ucpm-acc-ouvrir="' + e.id + '">' + (choisie ? 'Changer ma phrase d’accroche' : 'Choisir ma phrase d’accroche') + '</button>';
  }
  return h + '</div>';
}

function _ucpmP5HtmlCarte(etat, e, ref) {
  var cv = etat.cvs[e.id];
  var estRef = !!ref && e.id === ref.id;
  var propre = !!(cv.aspect && !estRef);
  var alerte = _ucpmCacheRendu[e.id] ? ucpmTexteAlerteCv(_ucpmCacheRendu[e.id].resultat.nbPages, _ucpmCacheRendu[e.id].resultat.libre) : '';
  return '<div class="cv-section" style="margin:0;" data-ucpm-carte="' + e.id + '">' +
    '<div style="display:flex;gap:.8rem;align-items:flex-start;">' +
    '<div data-ucpm-miniature="' + e.id + '" style="width:' + UCPM_LARGEUR_MINIATURE + 'px;height:' + Math.round(UCPM_LARGEUR_MINIATURE * 1123 / 794) + 'px;flex:0 0 ' + UCPM_LARGEUR_MINIATURE + 'px;border:1px solid var(--border);border-radius:4px;background:var(--bg-card);overflow:hidden;position:relative;"' +
    ' role="img" aria-label="Aperçu du CV ' + _ucpmP5Numero(etat, e.id) + '"><span class="small" style="color:var(--text-muted);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:.5rem;">Préparation de l’aperçu…</span></div>' +
    '<div style="flex:1;min-width:0;"><p class="mb-1"><strong>CV ' + _ucpmP5Numero(etat, e.id) + '</strong>' + (estRef ? ' <span class="badge bg-secondary">CV de référence</span>' : '') + '</p>' +
    '<p class="small mb-1" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) + '</p>' +
    '<p class="small mb-0" data-ucpm-alerte-pages="' + e.id + '" style="color:var(--warning-strong);"' + (alerte ? '' : ' hidden') + '>' + _ucpmEsc(alerte) + '</p></div></div>' +
    '<div class="mt-2 mb-2"><label class="form-label small mb-1" for="ucpmTitre_' + e.id + '"><strong>Titre du CV</strong></label>' +
    '<input type="text" class="form-control" id="ucpmTitre_' + e.id + '" data-ucpm-titre="' + e.id + '" maxlength="80" value="' + _ucpmEsc(cv.titre) + '"></div>' +
    _ucpmP5HtmlAccroche(etat, e, cv, estRef) +
    '<p class="small mb-1"><strong>Aspect</strong> ' + (propre ? '<span class="badge bg-secondary">propre à ce CV</span>' : '<span style="color:var(--text-muted);">comme la référence</span>') + '</p>' +
    '<div class="d-flex flex-wrap gap-2">' +
    (estRef
      ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-regler-ref>Régler le CV de référence</button>'
      : '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-aspect="' + e.id + '">Changer l’aspect</button>' +
        (propre ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-aspect-ref="' + e.id + '">Revenir à l’aspect de référence</button>' : '')) +
    '</div></div>';
}

function _ucpmP5Rendre(etat) {
  _ucpmP5Assurer(etat);
  var ref = ucpmRefCourante(etat);
  var cochees = ucpmEntreesCochees(etat);
  var unePropre = cochees.some(function (e) { return etat.cvs[e.id] && etat.cvs[e.id].aspect && (!ref || e.id !== ref.id); });
  return '<div class="cv-section"><p class="mb-2">Ces CV reprennent le modèle et le corps de votre CV de référence. Pour chacun, vérifiez le titre, choisissez sa phrase d’accroche et changez son aspect si vous le souhaitez.</p>' +
    '<p class="mb-0 small" style="color:var(--text-muted);">Par défaut, tous vos CV ont <strong>l’aspect de votre CV de référence</strong>. Vous ne changez que celui des CV dont vous voulez un autre aspect.</p></div>' +
    (unePropre ? '<div class="mb-3"><button type="button" class="btn btn-outline-secondary" id="btnUcpmToutRemettre">Remettre l’aspect du CV de référence à tous les CV</button></div>' : '') +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:1rem;align-items:start;">' +
    cochees.map(function (e) { return _ucpmP5HtmlCarte(etat, e, ref); }).join('') + '</div>';
}

// ---------------- Miniatures ----------------

function _ucpmP5MontrerMiniature(id, r) {
  var el = document.querySelector('[data-ucpm-miniature="' + id + '"]');
  if (!el) { return; }
  var racine = el.shadowRoot || el.attachShadow({ mode: 'open' });
  var echelle = UCPM_LARGEUR_MINIATURE / 794;
  racine.innerHTML = '<style>:host{display:block;}.ucpm-ech{width:794px;transform-origin:0 0;transform:scale(' + echelle + ');}.ucpm-ech *{pointer-events:none;}' + r.css + '</style>' +
    '<div class="ucpm-ech">' + r.html + '</div>';
  var alerte = document.querySelector('[data-ucpm-alerte-pages="' + id + '"]');
  if (alerte) {
    var texteAlerte = ucpmTexteAlerteCv(r.nbPages, r.libre);
    alerte.textContent = texteAlerte;
    alerte.hidden = !texteAlerte;
  }
}

// Rend les miniatures une par une (le moteur de CV lit le dossier global : un échange à la fois, voir dossierEchange.js).
function _ucpmP5RendreMiniatures(etat, ids, page) {
  var chaine = Promise.resolve();
  ids.forEach(function (id) {
    chaine = chaine.then(function () {
      if (pageActuelle !== 'un-cv-plusieurs-metiers' || etat.page !== (page || 5)) { return null; }
      return ucpmRendreCv(etat, id).then(function (r) { _ucpmP5MontrerMiniature(id, r); }).catch(function () {
        var el = document.querySelector('[data-ucpm-miniature="' + id + '"] span');
        if (el) { el.textContent = 'Aperçu indisponible'; }
      });
    });
  });
  return chaine;
}

// ---------------- Câblage ----------------

function _ucpmP5Cabler(etat) {
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  var rafraichir = function (id) { _ucpmP5RendreMiniatures(etat, [id]); };

  $$('[data-ucpm-titre]', function (el) {
    el.addEventListener('change', function () {
      var id = el.getAttribute('data-ucpm-titre');
      var t = String(el.value || '').replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
      etat.cvs[id].titre = t;
      var ref = ucpmRefCourante(etat);
      if (ref && ref.id === id) { etat.refTitre = t; var v = ucpmDossierVrai(); if (v) { v.titreCV = t; } }
      rafraichir(id);
    });
  });

  $$('[data-ucpm-acc-ouvrir]', function (el) { el.addEventListener('click', function () { _ucpmUi5.accOuverte = el.getAttribute('data-ucpm-acc-ouvrir'); ucpmRendrePage(); }); });
  $$('[data-ucpm-acc-fermer]', function (el) { el.addEventListener('click', function () { _ucpmUi5.accOuverte = null; ucpmRendrePage(); }); });
  var choisirOption = function (id, cle) {
    var cv = etat.cvs[id];
    var zone = document.querySelector('[data-ucpm-acc-texte="' + id + '|' + cle + '"]');
    var texte = ucpmNormaliserApostrophes(ucpmNettoyerTexte(zone ? zone.value : ''));
    cv.accrocheRang = cle;
    if (cle === 'perso') { cv.accrochePerso = zone ? zone.value : ''; }
    else { cv.accrocheModifs = cv.accrocheModifs || {}; cv.accrocheModifs[cle] = zone ? zone.value : ''; }
    cv.accroche = texte;
    cv.accrocheChoisie = !!texte;
  };
  $$('[data-ucpm-acc-radio]', function (el) {
    el.addEventListener('change', function () {
      var p = el.getAttribute('data-ucpm-acc-radio').split('|');
      choisirOption(p[0], p[1]);
      ucpmRendrePage();   // la phrase choisie s'affiche, « Passer aux lettres » se débloque, la miniature suit
    });
  });
  $$('[data-ucpm-acc-texte]', function (el) {
    el.addEventListener('change', function () {
      var p = el.getAttribute('data-ucpm-acc-texte').split('|');
      var cv = etat.cvs[p[0]];
      if (String(cv.accrocheRang) === p[1]) { choisirOption(p[0], p[1]); ucpmRendrePage(); }
      else if (p[1] === 'perso') { cv.accrochePerso = el.value; }
      else { cv.accrocheModifs = cv.accrocheModifs || {}; cv.accrocheModifs[p[1]] = el.value; }
    });
  });

  $$('[data-ucpm-aspect]', function (el) { el.addEventListener('click', function () { ucpmOuvrirAspect(el.getAttribute('data-ucpm-aspect')); }); });
  $$('[data-ucpm-aspect-ref]', function (el) {
    el.addEventListener('click', function () { var id = el.getAttribute('data-ucpm-aspect-ref'); etat.cvs[id].aspect = null; ucpmRendrePage(); });
  });
  $$('[data-ucpm-regler-ref]', function (el) { el.addEventListener('click', function () { etat.p3Vue = 'editeur'; etat.retourEditeur = 5; ucpmOuvrirEditeur(); }); });
  var tout = document.getElementById('btnUcpmToutRemettre');
  if (tout) {
    tout.addEventListener('click', function () {
      var faire = function () { Object.keys(etat.cvs).forEach(function (id) { etat.cvs[id].aspect = null; }); ucpmRendrePage(); };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Remettre l’aspect de référence à tous ?', 'Les CV dont vous aviez changé l’aspect reprendront celui de votre CV de référence. Leurs titres et leurs phrases d’accroche ne changent pas.', 'Remettre à tous', 'btn-primary', faire);
      } else { faire(); }
    });
  }

  _ucpmP5RendreMiniatures(etat, ucpmEntreesCochees(etat).map(function (e) { return e.id; }));
}

ucpmEnregistrerPage(5, {
  rendre: _ucpmP5Rendre,
  cabler: _ucpmP5Cabler,
  libelleContinuer: 'Passer aux lettres &#8594;',
  peutContinuer: function (etat) { _ucpmP5Assurer(etat); return ucpmCvSansAccroche(etat).length === 0; },
  raisonBlocage: function (etat) {
    _ucpmP5Assurer(etat);
    var n = ucpmCvSansAccroche(etat).length;
    return 'Choisissez la phrase d’accroche de ' + (n > 1 ? 'chacun des ' + n + ' CV qui n’en ont pas encore' : 'votre dernier CV') + ' pour continuer.';
  },
  continuer: function () { _ucpmUi5.accOuverte = null; ucpmAllerPage(6); }
});
