/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 8 « Préparer mes entretiens » (facultative, atteinte depuis la page 7).
   Plan et décisions de Denis (2026-10-15) : docs/PLAN_LETTRES_RETRAVAILLEES_ET_PREPARATION_ENTRETIEN_UCPM_2026-10-15.md ; maquette : docs/MAQUETTE_LETTRES_RETRAVAILLEES_ET_PREPARATION_UCPM_2026-10-15.html.
   Cinquième passage avec l'assistant (prompt prompts/ucpm-preparation.md, version 2, essayée par Denis) : une FEUILLE par métier, avec les questions probables (dont les questions délicates :
   périodes sans activité, changement de métier, pourquoi cette structure), ce que le recruteur cherche, une piste pour répondre, ce qu'il faut mettre en avant, et des conseils de savoir-être
   écrits par l'application. Deux modes : « générale » (plusieurs métiers cochés, version courte, niveau réaliste) et « approfondie » (un métier, niveau d'exigence, nombre de questions,
   sujets et pistes au choix). Aucun réglage de style d'écriture : ce n'est pas un texte que la personne envoie.
   Ce qui part : le profil validé du CV de référence, pour chaque métier son titre, son accroche, son objectif, sa lettre SANS signature, et les périodes sans activité repérées par l'application.
   Ce qui ne part jamais : le nom, le téléphone, l'adresse, le courriel.
   Impression : une feuille A4 par métier (deux pour une préparation approfondie qui ne tient pas lisiblement sur une), toutes ensemble ou une seule ; JAMAIS dans « Ce CV avec sa lettre ».
   Mise en page : les blocs sont mesurés à l'écran puis répartis (logiquePreparation.js, ucpmRepartirBlocs) : jamais une question coupée entre deux pages, corps de 10 points au moins.
   ============================================================ */

var UCPM_ETAPES_CHOIX_PREP = [
  { titre: 'Copie', detail: 'Le profil de votre CV de référence, et pour chaque métier son CV, son objectif et sa lettre (sans votre nom) sont copiés automatiquement. Vos coordonnées ne partent jamais.' },
  { titre: 'Propositions', detail: 'L’assistant écrit pour chaque métier les questions qu’un recruteur peut poser, ce qu’il cherche et des pistes pour répondre, en s’appuyant seulement sur votre CV. Il n’invente rien.' },
  { titre: 'Vous collez', detail: 'Vous copiez sa réponse avec son bouton « Copier » et vous la collez ici, en une seule fois.' },
  { titre: 'Vous relisez', detail: 'Vous lisez chaque feuille et vous la téléchargez. Elle est pour vous : vous ne l’envoyez pas à l’employeur.' }
];

var _ucpmUi8 = { cache: {}, occupe: false };

function _ucpmP8Cochees(etat) { return ucpmEntreesCochees(etat); }
function _ucpmP8Prep(etat, id) { var p = etat.preparations && etat.preparations[id]; return p && p.questions && p.questions.length ? p : null; }
function _ucpmP8AvecPrep(etat) { return _ucpmP8Cochees(etat).filter(function (e) { return !!_ucpmP8Prep(etat, e.id); }); }
function _ucpmP8Periodes() { var d = ucpmDossierVrai() || {}; return ucpmTextePeriodesSansActivite(ucpmPeriodesSansActivite(d.experiences)); }
function _ucpmP8Lettre(etat, id) { return ucpmRetirerSignature((etat.lettres && etat.lettres[id]) || '', _ucpmP6NomSignature()); }
function _ucpmP8Reglages(etat) {
  if (!etat.p8Reglages || typeof etat.p8Reglages !== 'object') { etat.p8Reglages = ucpmReglagesPreparationParDefaut('approfondi'); }
  etat.p8Reglages.mode = 'approfondi';
  return etat.p8Reglages;
}
function _ucpmP8NiveauTitre(id) { return (UCPM_PREP_NIVEAUX.filter(function (n) { return n.id === id; })[0] || {}).titre || ''; }

// Les métiers de la demande : tous les CV cochés (ou ceux choisis) pour la générale ; un seul pour l'approfondie.
function _ucpmP8CiblesGeneral(etat) { return ucpmCiblesPreparation(_ucpmP8Cochees(etat), etat.p8Ids); }
function _ucpmP8CibleApprofondie(etat) {
  var cochees = _ucpmP8Cochees(etat);
  var e = cochees.filter(function (x) { return x.id === etat.p8Metier; })[0] || cochees[0];
  return e ? [e] : [];
}
function _ucpmP8Cibles(etat, mode) { return mode === 'approfondi' ? _ucpmP8CibleApprofondie(etat) : _ucpmP8CiblesGeneral(etat); }

function _ucpmP8Items(etat, entrees) {
  var periodes = _ucpmP8Periodes();
  return entrees.map(function (e) {
    // « Autre métier » : l'entrée vient de la colonne de droite de la page 2 (les autres métiers), pas des autres noms du même métier.
    var autre = (etat.autres || []).some(function (x) { return x.id === e.id; });
    return { titre: _ucpmP6Titre(etat, e), accroche: _ucpmP6Accroche(etat, e), objectif: e.objectif, lettre: _ucpmP8Lettre(etat, e.id), periodes: periodes, changement: autre };
  });
}

// Empreinte de ce qui a été envoyé pour un métier (titre, accroche, lettre sans signature, périodes) : si elle change, la feuille est signalée « peut-être plus à jour ».
function _ucpmP8Supplement(etat, e) { return JSON.stringify([_ucpmP6Titre(etat, e), _ucpmP6Accroche(etat, e), _ucpmP8Lettre(etat, e.id), _ucpmP8Periodes()]); }
function _ucpmP8Signatures(etat, entrees, profil) {
  var s = {};
  entrees.forEach(function (e) { s[e.id] = ucpmSignatureEntree(e, etat.sexe, profil, _ucpmP8Supplement(etat, e)); });
  return s;
}
function _ucpmP8Perimees(etat) {
  var profil = ucpmConstruireProfilValide(ucpmDossierVrai());
  var sigs = etat.preparationsSig || {};
  return _ucpmP8AvecPrep(etat).filter(function (e) { return !!sigs[e.id] && sigs[e.id] !== ucpmSignatureEntree(e, etat.sexe, profil, _ucpmP8Supplement(etat, e)); });
}
function _ucpmP8HtmlPerimees(etat) {
  var p = _ucpmP8Perimees(etat);
  if (!p.length) { return ''; }
  return '<div class="cv-section" style="border-left:4px solid var(--warning-strong);" role="status"><p class="mb-1"><strong>' + (p.length > 1 ? 'Certaines préparations ne correspondent peut-être plus.' : 'Une préparation ne correspond peut-être plus.') + '</strong></p>' +
    '<p class="small mb-0">Vous avez changé quelque chose depuis la demande (objectif, titre, accroche, lettre, CV de référence). Concernées : ' +
    p.map(function (e) { return _ucpmEsc(ucpmLibelleCv(etat, e)); }).join(', ') + '. Rien n’est effacé : refaites la demande si vous le souhaitez.</p></div>';
}

// ---------------- Demande à l'assistant ----------------

function _ucpmP8TexteMetiers(cibles) { return cibles.length + ' métier' + (cibles.length > 1 ? 's' : ''); }

function _ucpmConfigPassagePrep(etat, mode) {
  var general = mode === 'general';
  return {
    idSuffixe: general ? 'UcpmPrepGen' : 'UcpmPrepApp',
    etapes: UCPM_ETAPES_CHOIX_PREP,
    texteConfidentialite: 'Seuls le profil de votre CV de référence, le CV de chaque métier et sa lettre (sans signature) sont envoyés : votre nom, votre téléphone et votre adresse ne partent pas.',
    recapHtml: general ? _ucpmP8HtmlRecapGeneral(etat) : _ucpmP8HtmlRecapApprofondi(etat),
    avantEnvoi: function () {
      var cibles = _ucpmP8Cibles(etat, mode);
      if (!cibles.length) { return 'Choisissez au moins un métier.'; }
      if (ucpmPreparationTropDeMetiers(cibles.length, mode)) { return 'Avec ' + _ucpmP8TexteMetiers(cibles) + ', la réponse de l’assistant risque d’être coupée. Gardez ' + UCPM_PREP_MAX_METIERS_GENERAL + ' métiers au plus, puis faites une deuxième demande pour les autres.'; }
      return '';
    },
    construireTexte: function () {
      var cibles = _ucpmP8Cibles(etat, mode);
      var reglages = general ? { mode: 'general' } : _ucpmP8Reglages(etat);
      return ucpmChargerPrompt('ucpm-preparation', 'ucpm-preparation.md').then(function (modele) {
        return ucpmConstruirePromptPreparation(modele, {
          sexe: etat.sexe,
          profil: ucpmConstruireProfilValide(ucpmDossierVrai()),
          reglages: ucpmBlocReglagesPreparation(reglages),
          metiers: ucpmBlocMetiersPreparation(_ucpmP8Items(etat, cibles))
        });
      });
    },
    importer: function (texte) {
      var cibles = _ucpmP8Cibles(etat, mode);
      var r = ucpmLireReponsePreparation(texte, cibles.map(function (e) { return e.id; }));
      if (r.succes) {
        var recues = cibles.filter(function (e) { return !!r.preparations[e.id]; });
        etat.preparations = ucpmFusionnerPreparations(etat.preparations, r.preparations, general ? 'general' : 'approfondi', general ? '' : _ucpmP8Reglages(etat).niveau);
        etat.preparationsSig = Object.assign({}, etat.preparationsSig, _ucpmP8Signatures(etat, recues, ucpmConstruireProfilValide(ucpmDossierVrai())));
        etat.p8Sel = recues[0] ? recues[0].id : (cibles[0] ? cibles[0].id : '');
        _ucpmUi8.cache = {};
        if (typeof trackEvenement === 'function') { trackEvenement('ucpm_preparations_lues', { mode: mode, metiers: recues.length, manquants: r.manquants.length }); }
      }
      return r;
    },
    apresSucces: function () { etat.p8Vue = 'lecture'; ucpmRendrePage(); }
  };
}

// ---------------- Récapitulatifs et choix (dans le passage) ----------------

function _ucpmP8HtmlRecapGeneral(etat) {
  var cochees = _ucpmP8Cochees(etat);
  var choisies = _ucpmP8CiblesGeneral(etat).map(function (e) { return e.id; });
  return '<div class="cv-section mb-3"><fieldset style="border:0;padding:0;margin:0;"><legend class="mb-1" style="font-size:1rem;font-weight:600;float:none;">&#128221; Pour quels métiers ?</legend>' +
    '<div class="d-flex flex-wrap gap-2 mb-2"><button type="button" class="btn btn-outline-secondary btn-sm" id="btnUcpmP8Tous">Tout cocher</button><button type="button" class="btn btn-outline-secondary btn-sm" id="btnUcpmP8Aucun">Tout décocher</button></div>' +
    cochees.map(function (e) {
      return '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0 0 .4rem 0;"><input type="checkbox" style="margin-top:.3rem;" data-ucpm-p8-cv="' + e.id + '"' + (choisies.indexOf(e.id) >= 0 ? ' checked' : '') + '>' +
        '<span style="flex:1;min-width:0;"><strong>' + _ucpmEsc(ucpmLibelleCv(etat, e)) + '</strong><br><span class="small" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) +
        (_ucpmP8Prep(etat, e.id) ? ' &#183; une préparation existe déjà, elle sera remplacée' : '') + '</span></span></label>';
    }).join('') +
    '<p class="small mb-0" id="ucpmP8Avis" style="color:var(--warning-strong);" role="status"' + (ucpmPreparationTropDeMetiers(choisies.length, 'general') ? '' : ' hidden') + '>' + _ucpmEsc(_ucpmP8TexteTropDeMetiers()) + '</p></fieldset></div>' +
    '<div class="cv-section mb-3"><h4>Ce qui est prévu pour chaque métier</h4><ul class="small mb-1" style="padding-left:1.25rem;">' +
    '<li>Niveau « Réaliste » : les questions que posent le plus souvent les recruteurs, avec un ton encourageant.</li>' +
    '<li>5 questions : votre parcours, vos points délicats (une période sans activité, un changement de métier), pourquoi ce métier.</li>' +
    '<li>Ce que vous pouvez mettre en avant, et des conseils de savoir-être, d’attitude et de comportement.</li></ul>' +
    '<p class="small mb-0" style="color:var(--text-muted);">Pour choisir le niveau d’exigence ou les sujets : « Préparation approfondie », pour un métier à la fois.</p></div>';
}
function _ucpmP8TexteTropDeMetiers() { return 'Au-delà de ' + UCPM_PREP_MAX_METIERS_GENERAL + ' métiers cochés, la réponse de l’assistant risque d’être coupée : gardez ' + UCPM_PREP_MAX_METIERS_GENERAL + ' métiers au plus, puis faites une deuxième demande pour les autres.'; }

function _ucpmP8HtmlRecapApprofondi(etat) {
  var cochees = _ucpmP8Cochees(etat);
  var r = _ucpmP8Reglages(etat);
  var cible = _ucpmP8CibleApprofondie(etat)[0];
  var niveau = UCPM_PREP_NIVEAUX.filter(function (n) { return n.id === r.niveau; })[0] || UCPM_PREP_NIVEAUX[1];
  var pill = function (attr, valeur, texte, actif) { return '<button type="button" class="btn btn-sm ' + (actif ? 'btn-primary' : 'btn-outline-primary') + '" ' + attr + '="' + valeur + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + texte + '</button>'; };
  return '<div class="cv-section mb-3"><fieldset style="border:0;padding:0;margin:0;"><legend class="mb-1" style="font-size:1rem;font-weight:600;float:none;">&#128221; Pour quel métier ?</legend>' +
    cochees.map(function (e) {
      return '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0 0 .4rem 0;"><input type="radio" name="ucpmP8Metier" style="margin-top:.3rem;" data-ucpm-p8-metier="' + e.id + '"' + (cible && cible.id === e.id ? ' checked' : '') + '>' +
        '<span style="flex:1;min-width:0;"><strong>' + _ucpmEsc(ucpmLibelleCv(etat, e)) + '</strong><br><span class="small" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) +
        (_ucpmP8Prep(etat, e.id) ? ' &#183; une préparation existe déjà, elle sera remplacée' : '') + '</span></span></label>';
    }).join('') + '</fieldset></div>' +
    '<div class="cv-section mb-3"><h4>Niveau d’exigence</h4><div class="d-flex flex-wrap gap-2" id="ucpmP8Niveaux" role="group" aria-label="Niveau d’exigence">' +
    UCPM_PREP_NIVEAUX.map(function (n) { return pill('data-ucpm-p8-niveau', n.id, n.titre, n.id === niveau.id); }).join('') + '</div>' +
    '<p class="small mt-2 mb-0" id="ucpmP8NiveauTexte" style="color:var(--text-muted);">' + _ucpmEsc(niveau.texte) + '</p>' +
    '<p class="small mt-1 mb-0" id="ucpmP8RelanceTexte" style="color:var(--text-muted);"' + (ucpmPreparationAvecRelance(niveau.id) ? '' : ' hidden') + '>À ce niveau, une relance du recruteur s’ajoute sous chaque piste de réponse.</p></div>' +
    '<div class="cv-section mb-3"><h4>Nombre de questions</h4><div class="d-flex flex-wrap gap-2" id="ucpmP8Nombres" role="group" aria-label="Nombre de questions">' +
    UCPM_PREP_NOMBRES.map(function (n) { return pill('data-ucpm-p8-nombre', n, n, parseInt(r.nombre, 10) === n); }).join('') + '</div>' +
    '<p class="small mt-2 mb-0" style="color:var(--text-muted);">Avec 10 questions ou plus, la feuille peut occuper deux pages A4.</p></div>' +
    '<div class="cv-section mb-3"><h4>Sujets à aborder</h4>' +
    UCPM_PREP_SUJETS.map(function (s) {
      return '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0 0 .35rem 0;"><input type="checkbox" style="margin-top:.3rem;" data-ucpm-p8-sujet="' + s.id + '"' + ((r.sujets || []).indexOf(s.id) >= 0 ? ' checked' : '') + '><span>' + _ucpmEsc(s.titre) + '</span></label>';
    }).join('') +
    '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:.6rem 0 0 0;"><input type="checkbox" style="margin-top:.3rem;" id="ucpmP8Pistes"' + (r.pistes === false ? '' : ' checked') + '><span>Ajouter pour chaque question une piste pour répondre</span></label>' +
    '<p class="small mt-1 mb-0" id="ucpmP8AvisSujets" style="color:var(--warning-strong);" role="status" hidden>Gardez au moins un sujet coché.</p></div>';
}

function _ucpmP8CablerRecapGeneral(etat) {
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  var maj = function () {
    var cases = Array.prototype.slice.call(document.querySelectorAll('[data-ucpm-p8-cv]'));
    var ids = cases.filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute('data-ucpm-p8-cv'); });
    etat.p8Ids = ids.length === cases.length ? null : ids;
    var avis = document.getElementById('ucpmP8Avis');
    if (avis) { avis.hidden = !ucpmPreparationTropDeMetiers(ids.length, 'general'); }
  };
  $$('[data-ucpm-p8-cv]', function (el) {
    el.addEventListener('change', function () {
      var cases = Array.prototype.slice.call(document.querySelectorAll('[data-ucpm-p8-cv]'));
      if (!cases.some(function (c) { return c.checked; })) { el.checked = true; }
      maj();
    });
  });
  var tous = document.getElementById('btnUcpmP8Tous');
  if (tous) { tous.addEventListener('click', function () { $$('[data-ucpm-p8-cv]', function (c) { c.checked = true; }); maj(); }); }
  var aucun = document.getElementById('btnUcpmP8Aucun');
  if (aucun) { aucun.addEventListener('click', function () { var cases = document.querySelectorAll('[data-ucpm-p8-cv]'); Array.prototype.forEach.call(cases, function (c, i) { c.checked = i === 0; }); maj(); }); }
}

function _ucpmP8CablerRecapApprofondi(etat) {
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  var r = _ucpmP8Reglages(etat);
  $$('[data-ucpm-p8-metier]', function (el) { el.addEventListener('change', function () { etat.p8Metier = el.getAttribute('data-ucpm-p8-metier'); }); });
  var basculer = function (selecteur, attr, valeur) {
    $$(selecteur, function (b) { var actif = b.getAttribute(attr) === String(valeur); b.setAttribute('aria-pressed', actif ? 'true' : 'false'); b.classList.toggle('btn-primary', actif); b.classList.toggle('btn-outline-primary', !actif); });
  };
  $$('[data-ucpm-p8-niveau]', function (el) {
    el.addEventListener('click', function () {
      r.niveau = el.getAttribute('data-ucpm-p8-niveau');
      basculer('[data-ucpm-p8-niveau]', 'data-ucpm-p8-niveau', r.niveau);
      var n = UCPM_PREP_NIVEAUX.filter(function (x) { return x.id === r.niveau; })[0];
      var t = document.getElementById('ucpmP8NiveauTexte'); if (t && n) { t.textContent = n.texte; }
      var rel = document.getElementById('ucpmP8RelanceTexte'); if (rel) { rel.hidden = !ucpmPreparationAvecRelance(r.niveau); }
    });
  });
  $$('[data-ucpm-p8-nombre]', function (el) {
    el.addEventListener('click', function () { r.nombre = parseInt(el.getAttribute('data-ucpm-p8-nombre'), 10); basculer('[data-ucpm-p8-nombre]', 'data-ucpm-p8-nombre', r.nombre); });
  });
  $$('[data-ucpm-p8-sujet]', function (el) {
    el.addEventListener('change', function () {
      var ids = [];
      $$('[data-ucpm-p8-sujet]', function (c) { if (c.checked) { ids.push(c.getAttribute('data-ucpm-p8-sujet')); } });
      var avis = document.getElementById('ucpmP8AvisSujets');
      if (!ids.length) { el.checked = true; if (avis) { avis.hidden = false; } return; }
      if (avis) { avis.hidden = true; }
      r.sujets = ids;
    });
  });
  var pistes = document.getElementById('ucpmP8Pistes');
  if (pistes) { pistes.addEventListener('change', function () { r.pistes = !!pistes.checked; }); }
}

// ---------------- Mise en page : mesure à l'écran puis répartition sur les pages A4 ----------------

function _ucpmP8MmEnPx(mm) { return mm * 96 / 25.4; }

// Mesure chaque bloc d'une feuille à un corps donné (même largeur utile que la feuille imprimée). Renvoie { hauteurs, hEntete, hSuite }.
function _ucpmP8Mesurer(blocs, taillePt) {
  var hote = document.createElement('div');
  hote.setAttribute('aria-hidden', 'true');
  hote.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(hote);
  try {
    var ombre = hote.attachShadow({ mode: 'open' });
    var largeur = UCPM_PREP_LARGEUR_MM - 2 * UCPM_PREP_MARGE_LATERALE_MM;
    ombre.innerHTML = '<style>' + ucpmCssPreparation() + '.prep{height:auto;overflow:visible;padding:0;width:' + largeur + 'mm;}.m{display:flow-root;}</style>' +
      '<div class="prep" style="font-size:' + taillePt + 'pt;"><div class="m" id="mEntete">' + blocs.entete + '</div><div class="m" id="mSuite">' + blocs.suite + '</div>' +
      ucpmListeBlocsPreparation(blocs).map(function (h, i) { return '<div class="m" data-i="' + i + '">' + h + '</div>'; }).join('') + '</div>';
    var h = function (el) { return el ? el.getBoundingClientRect().height : 0; };
    var hauteurs = Array.prototype.map.call(ombre.querySelectorAll('[data-i]'), h);
    return { hauteurs: hauteurs, hEntete: h(ombre.getElementById('mEntete')), hSuite: h(ombre.getElementById('mSuite')) };
  } finally { hote.remove(); }
}

// Choisit le corps le plus grand (11, 10,5 puis 10 points) qui donne le moins de pages ; renvoie { pages : [html], taillePt }.
function ucpmPaginerPreparation(blocs) {
  var capacite = _ucpmP8MmEnPx(UCPM_PREP_HAUTEUR_MM - 2 * UCPM_PREP_MARGE_MM) - 4;
  var meilleur = null;
  UCPM_PREP_TAILLES_PT.forEach(function (taille) {
    var m = _ucpmP8Mesurer(blocs, taille);
    var repartition = ucpmRepartirBlocs(m.hauteurs, { premiere: capacite - m.hEntete, suivantes: capacite - m.hSuite });
    if (!meilleur || repartition.length < meilleur.repartition.length) { meilleur = { taille: taille, repartition: repartition }; }
  });
  var pages = meilleur.repartition.map(function (indices, i) { return ucpmHtmlPagePreparation(blocs, indices, { premiere: i === 0, taillePt: meilleur.taille }); });
  return { pages: pages, taillePt: meilleur.taille };
}

// Les blocs de la feuille d'un métier (titre du CV, étiquette de l'objectif, niveau).
function _ucpmP8Blocs(etat, e) {
  var p = _ucpmP8Prep(etat, e.id);
  return ucpmBlocsHtmlPreparation({ metier: _ucpmP6Titre(etat, e), etiquette: ucpmEtiquetteObjectif(e.objectif), niveauTitre: p.mode === 'approfondi' ? _ucpmP8NiveauTitre(p.niveau) : '', prep: p });
}

// Les pages d'un métier, gardées tant que rien ne change.
function _ucpmP8Pages(etat, e) {
  var blocs = _ucpmP8Blocs(etat, e);
  var cle = JSON.stringify(ucpmListeBlocsPreparation(blocs)) + blocs.entete;
  var c = _ucpmUi8.cache[e.id];
  if (c && c.cle === cle) { return c.resultat; }
  var resultat = ucpmPaginerPreparation(blocs);
  _ucpmUi8.cache[e.id] = { cle: cle, resultat: resultat };
  return resultat;
}

// ---------------- Lecture ----------------

function _ucpmP8HtmlSelecteur(etat, avec) {
  return '<div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Choisir la préparation à lire">' + avec.map(function (e) {
    var actif = etat.p8Sel === e.id;
    return '<button type="button" class="btn btn-sm ' + (actif ? 'btn-primary' : 'btn-outline-primary') + '" data-ucpm-p8-sel="' + e.id + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + _ucpmEsc(ucpmLibelleCv(etat, e)) + '</button>';
  }).join('') + '</div>';
}

// Ce que contiendrait le PDF « toutes mes préparations », et les métiers qui n'ont pas encore de préparation (page 7 et page 8, une seule fonction).
function _ucpmP8HtmlContenuPdf(etat) {
  var avec = _ucpmP8AvecPrep(etat);
  var sans = _ucpmP8Cochees(etat).filter(function (e) { return !_ucpmP8Prep(etat, e.id); });
  return (avec.length > 1 ? '<p class="small mt-2 mb-0" style="color:var(--text-muted);">Dans le PDF : ' + avec.map(function (e) { return _ucpmEsc(ucpmLibelleCv(etat, e)); }).join(' ; ') + '.</p>' : '') +
    (sans.length ? '<p class="small mt-1 mb-0" style="color:var(--text-muted);">Pas encore de préparation pour : ' + sans.map(function (e) { return _ucpmEsc(ucpmLibelleCv(etat, e)); }).join(', ') + '.</p>' : '');
}

function _ucpmP8HtmlLecture(etat) {
  var avec = _ucpmP8AvecPrep(etat);
  if (!etat.p8Sel || !avec.some(function (e) { return e.id === etat.p8Sel; })) { etat.p8Sel = avec[0] ? avec[0].id : ''; }
  var courante = avec.filter(function (e) { return e.id === etat.p8Sel; })[0];
  var sans = _ucpmP8Cochees(etat).filter(function (e) { return !_ucpmP8Prep(etat, e.id); });
  var p = courante ? _ucpmP8Prep(etat, courante.id) : null;
  var etiquette = p ? (p.mode === 'approfondi' ? 'Préparation approfondie, niveau ' + _ucpmP8NiveauTitre(p.niveau).toLowerCase() : 'Préparation générale') + ' · ' + p.questions.length + ' question' + (p.questions.length > 1 ? 's' : '') : '';
  return '<div class="cv-section"><p class="mb-1">Voici une feuille par métier. Elle est <strong>pour vous</strong> : vous la gardez pour vous préparer, vous ne l’envoyez pas à l’employeur.</p>' +
    '<p class="mb-0 small" style="color:var(--text-muted);">Les questions marquées « question délicate » sont celles où l’on hésite le plus souvent : relisez bien leurs pistes. Les conseils de savoir-être sont les mêmes pour tous vos métiers.</p></div>' +
    _ucpmP8HtmlPerimees(etat) + _ucpmP8HtmlSelecteur(etat, avec) +
    (courante
      ? '<div class="cv-section"><p class="mb-1"><strong>' + _ucpmEsc(ucpmLibelleCv(etat, courante)) + '</strong></p>' +
        '<p class="small mb-2" style="color:var(--text-muted);">' + _ucpmEsc(etiquette) + ' &#183; <span id="ucpmP8NbPages">mise en page en cours</span></p>' +
        '<div data-ucpm-p8-apercu="' + courante.id + '" role="img" aria-label="Aperçu de la feuille de préparation" style="border:1px solid var(--border);border-radius:6px;background:var(--bg-subtle);overflow:hidden;min-height:8rem;"></div>' +
        '<div class="d-flex flex-wrap gap-2 mt-3"><button type="button" class="btn btn-primary" data-ucpm-p8-tel="un" data-ucpm-p8-tel-id="' + courante.id + '">Télécharger cette préparation</button>' +
        (p.mode === 'general' ? '<button type="button" class="btn btn-outline-primary" data-ucpm-p8-approfondir="' + courante.id + '">Une préparation approfondie pour ce métier</button>' : '') + '</div></div>'
      : '') +
    '<div class="cv-section"><div class="d-flex flex-wrap gap-2">' +
    (avec.length > 1 ? '<button type="button" class="btn btn-primary" data-ucpm-p8-tel="toutes">Télécharger toutes mes préparations (un seul PDF)</button>' : '') +
    '<button type="button" class="btn btn-outline-secondary" id="btnUcpmP8Autre">Faire une autre préparation</button></div>' +
    _ucpmP8HtmlContenuPdf(etat) + '</div>';
}

// Montre les pages d'un métier dans un compartiment étanche, réduites à la largeur de l'écran.
function _ucpmP8RendreApercu(etat, e) {
  var cont = document.querySelector('[data-ucpm-p8-apercu="' + e.id + '"]');
  if (!cont) { return; }
  var r;
  try { r = _ucpmP8Pages(etat, e); } catch (err) { cont.textContent = 'L’aperçu n’a pas pu être préparé.'; return; }
  var ombre = cont.shadowRoot || cont.attachShadow({ mode: 'open' });
  var largeurPage = _ucpmP8MmEnPx(UCPM_PREP_LARGEUR_MM), hauteurPage = _ucpmP8MmEnPx(UCPM_PREP_HAUTEUR_MM);
  ombre.innerHTML = '<style>' + ucpmCssPreparation() + '#cadre{width:' + largeurPage + 'px;transform-origin:top left;}.page{margin:0 0 12px 0;box-shadow:0 1px 6px rgba(0,0,0,.25);}</style><div id="cadre">' +
    r.pages.map(function (h) { return '<div class="page">' + h + '</div>'; }).join('') + '</div>';
  var echelle = Math.min(1, (cont.clientWidth || largeurPage) / largeurPage);
  ombre.getElementById('cadre').style.transform = 'scale(' + echelle + ')';
  cont.style.height = Math.ceil((r.pages.length * (hauteurPage + 12)) * echelle) + 'px';
  var nb = document.getElementById('ucpmP8NbPages');
  if (nb) { nb.textContent = r.pages.length > 1 ? 'cette feuille occupe ' + r.pages.length + ' pages A4' : 'cette feuille tient sur une page A4'; }
}

// ---------------- Téléchargement ----------------

// id : un métier, ou null pour toutes les préparations (un seul PDF, une feuille A4 par métier, dans l'ordre des CV).
function ucpmTelechargerPreparations(etat, id) {
  if (_ucpmUi8.occupe) { return; }
  var cibles = id ? _ucpmP8AvecPrep(etat).filter(function (e) { return e.id === id; }) : _ucpmP8AvecPrep(etat);
  if (!cibles.length) { return; }
  _ucpmUi8.occupe = true;
  Array.prototype.forEach.call(document.querySelectorAll('[data-ucpm-p8-tel], [data-ucpm-p8-tel-p7]'), function (b) { b.disabled = true; });
  var titre = id ? _ucpmP6Titre(etat, cibles[0]) : '';
  Promise.resolve().then(function () {
    var feuilles = [];
    cibles.forEach(function (e) { _ucpmP8Pages(etat, e).pages.forEach(function (h) { feuilles.push({ css: ucpmCssPreparation(), html: h }); }); });
    var nom = ucpmNomFichierPdf(id ? 'preparation' : 'preparations', titre, ucpmDossierVrai().identite);
    return ucpmImprimerDocument(nom, ucpmDocumentImpression(nom, feuilles));
  }).then(function () {
    etat.p8Telecharge = true;
    if (typeof trackEvenement === 'function') { trackEvenement('ucpm_telechargement', { type: id ? 'preparation' : 'preparations' }); }
  }).catch(function () {
    if (typeof afficherToast === 'function') { afficherToast('Le document n’a pas pu être préparé. Merci de réessayer dans un instant.', 6000); }
  }).then(function () {
    _ucpmUi8.occupe = false;
    if (pageActuelle === 'un-cv-plusieurs-metiers') { ucpmRendrePage(); }
  });
}

// ---------------- Choix du mode ----------------

function _ucpmP8HtmlChoix(etat) {
  var avec = _ucpmP8AvecPrep(etat);
  return '<div class="cv-section"><p class="mb-1">Une feuille par métier : les questions qu’un recruteur peut poser, ce qu’il cherche derrière chacune, et des pistes pour y répondre avec ce que votre CV montre vraiment.</p>' +
    '<p class="mb-0 small" style="color:var(--text-muted);">Cette feuille est <strong>pour vous</strong> : vous l’imprimez à part et vous n’envoyez à l’employeur que le CV et la lettre.</p></div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:1rem;margin-bottom:1rem;">' +
    '<div class="cv-section" style="margin:0;"><h4>Une préparation générale</h4><p class="small" style="color:var(--text-muted);">Pour tous vos métiers, ou ceux que vous cochez, en une seule demande. Version courte : 5 questions, des conseils, ce que vous pouvez mettre en avant.</p><button type="button" class="btn btn-primary" id="btnUcpmP8General">Choisir &#8594;</button></div>' +
    '<div class="cv-section" style="margin:0;"><h4>Une préparation approfondie</h4><p class="small" style="color:var(--text-muted);">Pour un seul métier, plus poussée : 8 à 12 questions, vous choisissez le niveau d’exigence et les sujets abordés.</p><button type="button" class="btn btn-outline-primary" id="btnUcpmP8Approfondie">Choisir &#8594;</button></div></div>' +
    '<div class="cv-section" style="border-left:4px solid var(--accent);"><p class="mb-0 small">Ce n’est pas le même outil que « M’entraîner à un entretien » de l’accueil : celui-là est une conversation avec l’assistant, ici vous recevez une feuille écrite à imprimer.</p></div>' +
    (avec.length
      ? '<div class="cv-section"><h4>Vos préparations</h4><p class="small" style="color:var(--text-muted);">' + avec.map(function (e) { var p = _ucpmP8Prep(etat, e.id); return '' + _ucpmEsc(ucpmLibelleCv(etat, e)) + ' (' + (p.mode === 'approfondi' ? 'approfondie' : 'générale') + ')'; }).join(' &#183; ') + '</p>' +
        '<button type="button" class="btn btn-outline-primary" id="btnUcpmP8Lire">Lire mes préparations</button></div>'
      : '');
}

function _ucpmP8VueValide(etat) {
  if (etat.p8Vue === 'lecture' && !_ucpmP8AvecPrep(etat).length) { etat.p8Vue = 'choix'; }
  if (['choix', 'general', 'approfondi', 'lecture'].indexOf(etat.p8Vue) < 0) { etat.p8Vue = 'choix'; }
  return etat.p8Vue;
}

ucpmEnregistrerPage(8, {
  rendre: function (etat) {
    var vue = _ucpmP8VueValide(etat);
    if (vue === 'general') { return '<div class="cv-section"><p class="mb-0">Préparation <strong>générale</strong> : une feuille courte par métier coché, en une seule demande.</p></div>' + ucpmPassageRendre(etat, 'prepGeneral', _ucpmConfigPassagePrep(etat, 'general')); }
    if (vue === 'approfondi') { return '<div class="cv-section"><p class="mb-0">Préparation <strong>approfondie</strong> : un seul métier, avec le niveau d’exigence et les sujets que vous choisissez.</p></div>' + ucpmPassageRendre(etat, 'prepApprofondie', _ucpmConfigPassagePrep(etat, 'approfondi')); }
    if (vue === 'lecture') { return _ucpmP8HtmlLecture(etat); }
    return _ucpmP8HtmlChoix(etat);
  },
  cabler: function (etat) {
    var vue = _ucpmP8VueValide(etat);
    var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
    if (vue === 'general') {
      ucpmPassageCabler(etat, 'prepGeneral', _ucpmConfigPassagePrep(etat, 'general'));
      if (ucpmPassageVue(etat, 'prepGeneral') === 'choix') { _ucpmP8CablerRecapGeneral(etat); }
      return;
    }
    if (vue === 'approfondi') {
      ucpmPassageCabler(etat, 'prepApprofondie', _ucpmConfigPassagePrep(etat, 'approfondi'));
      if (ucpmPassageVue(etat, 'prepApprofondie') === 'choix') { _ucpmP8CablerRecapApprofondi(etat); }
      return;
    }
    if (vue === 'lecture') {
      $$('[data-ucpm-p8-sel]', function (el) { el.addEventListener('click', function () { etat.p8Sel = el.getAttribute('data-ucpm-p8-sel'); ucpmRendrePage(); }); });
      $$('[data-ucpm-p8-tel]', function (el) { el.addEventListener('click', function () { ucpmTelechargerPreparations(etat, el.getAttribute('data-ucpm-p8-tel') === 'un' ? el.getAttribute('data-ucpm-p8-tel-id') : null); }); });
      $$('[data-ucpm-p8-approfondir]', function (el) {
        el.addEventListener('click', function () { etat.p8Metier = el.getAttribute('data-ucpm-p8-approfondir'); etat.p8Vue = 'approfondi'; ucpmPassageReinitialiser(etat, 'prepApprofondie'); ucpmRendrePage(); });
      });
      var autre = document.getElementById('btnUcpmP8Autre');
      if (autre) { autre.addEventListener('click', function () { etat.p8Vue = 'choix'; ucpmRendrePage(); }); }
      var courante = _ucpmP8AvecPrep(etat).filter(function (e) { return e.id === etat.p8Sel; })[0];
      if (courante) { setTimeout(function () { if (pageActuelle === 'un-cv-plusieurs-metiers' && etat.page === 8 && etat.p8Vue === 'lecture') { _ucpmP8RendreApercu(etat, courante); } }, 0); }
      return;
    }
    var g = document.getElementById('btnUcpmP8General');
    if (g) { g.addEventListener('click', function () { etat.p8Vue = 'general'; ucpmPassageReinitialiser(etat, 'prepGeneral'); ucpmRendrePage(); }); }
    var a = document.getElementById('btnUcpmP8Approfondie');
    if (a) { a.addEventListener('click', function () { etat.p8Vue = 'approfondi'; _ucpmP8Reglages(etat); ucpmPassageReinitialiser(etat, 'prepApprofondie'); ucpmRendrePage(); }); }
    var lire = document.getElementById('btnUcpmP8Lire');
    if (lire) { lire.addEventListener('click', function () { etat.p8Vue = 'lecture'; ucpmRendrePage(); }); }
  },
  libelleContinuer: null,
  peutContinuer: function () { return true; },
  // « Retour » : recule d'une vue du passage ; au début du passage, revient au choix ; depuis le choix, à la page 7, sans rien supprimer.
  retour: function (etat) {
    var vue = _ucpmP8VueValide(etat);
    if (vue === 'general' || vue === 'approfondi') {
      if (ucpmPassageRetour(etat, vue === 'general' ? 'prepGeneral' : 'prepApprofondie')) { return true; }
      etat.p8Vue = _ucpmP8AvecPrep(etat).length ? 'lecture' : 'choix'; ucpmRendrePage(); return true;
    }
    if (vue === 'lecture') { etat.p8Vue = 'choix'; ucpmRendrePage(); return true; }
    return false;
  }
});
