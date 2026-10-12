/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 6 « Mes lettres de motivation ».
   Quatrième passage avec l'assistant (prompt prompts/ucpm-lettres.md, version 7 NON TESTÉE sur un vrai assistant, la version 6 l'est) : UNE réponse contient une lettre par CV choisi.
   Tout est dans la page (passageAssistant.js) : choix des CV par leur nom (tous cochés au départ, l'objectif de chacun visible), choix de l'assistant, chez l'assistant, collage,
   puis lecture et modification des lettres, une à la fois, avec un sélecteur.
   Ce que l'application impose : la formule d'appel (« Madame Martin, » si le recruteur est connu, sinon « Madame, Monsieur, ») et la signature (prénom et nom de l'identité
   choisie à la page 3) ; l'assistant ne signe pas. Ce qui part : le profil validé du CV de référence (jamais le CV brut, jamais de coordonnées) et, pour chaque CV choisi,
   son titre, sa phrase d'accroche et tout son objectif.
   Les lettres sont gardées dans une liste propre au module (etat.lettres), jamais dans dossier.lettreMotivation qui est unique. Rien n'est supprimé en revenant en arrière.
   ============================================================ */

var UCPM_ETAPES_CHOIX_LETTRES = [
  { titre: 'Copie', detail: 'Votre CV de référence validé et, pour chaque CV choisi, son titre, sa phrase d’accroche et son objectif sont copiés automatiquement. Vos coordonnées ne partent jamais.' },
  { titre: 'Propositions', detail: 'L’assistant écrit une lettre par CV, qui suit l’objectif de ce CV. Il s’appuie seulement sur votre CV et n’invente rien.' },
  { titre: 'Vous collez', detail: 'Vous copiez sa réponse avec son bouton « Copier » et vous la collez ici, en une seule fois.' },
  { titre: 'Vous relisez', detail: 'Vous lisez chaque lettre et vous la modifiez comme vous voulez. Votre nom est ajouté en bas par l’application.' }
];

var UCPM_PLACEHOLDER_LETTRE = 'L’assistant n’a pas écrit de lettre pour ce CV. Vous pouvez écrire la vôtre ici, ou refaire la demande.';

function _ucpmP6Titre(etat, e) { var cv = etat.cvs && etat.cvs[e.id]; return (cv && cv.titre) || ucpmNomMetier(e, etat.sexe); }
function _ucpmP6Accroche(etat, e) { var cv = etat.cvs && etat.cvs[e.id]; return (cv && cv.accroche) || ''; }
function _ucpmP6Numero(etat, id) {
  var liste = ucpmEntreesCochees(etat);
  for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) { return i + 1; } }
  return 0;
}

// Les CV pour lesquels une lettre est demandée : tous les CV, ou ceux que la personne a gardés cochés.
function _ucpmP6Choisies(etat) {
  var cochees = ucpmEntreesCochees(etat);
  if (!Array.isArray(etat.lettresIds)) { return cochees; }
  var gardees = cochees.filter(function (e) { return etat.lettresIds.indexOf(e.id) >= 0; });
  return gardees.length ? gardees : cochees;
}

// Les lettres qui existent (texte non vide) pour un CV encore coché.
function _ucpmP6LettresExistantes(etat) {
  return ucpmEntreesCochees(etat).filter(function (e) { return !!(etat.lettres && String(etat.lettres[e.id] || '').trim()); });
}

function _ucpmP6NomSignature() { var v = ucpmDossierVrai(); return ucpmNomComplet(v && v.identite); }

// ---------------- Choix des CV (dans le récapitulatif du passage) ----------------

function _ucpmP6HtmlChoixCv(etat) {
  var cochees = ucpmEntreesCochees(etat);
  var choisies = _ucpmP6Choisies(etat).map(function (e) { return e.id; });
  return '<div class="cv-section recap-contexte-envoi mb-3">' +
    '<fieldset style="border:0;padding:0;margin:0;"><legend class="mb-1" style="font-size:1rem;font-weight:600;float:none;">&#9993;&#65039; Pour quels CV voulez-vous une lettre ?</legend>' +
    '<p class="small mb-2" style="color:var(--text-muted);">Tous sont cochés. Décochez un CV dont vous n’avez pas besoin de lettre. L’assistant écrit toutes les lettres d’un coup, en suivant l’objectif de chaque CV.</p>' +
    cochees.map(function (e) {
      return '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0 0 .4rem 0;">' +
        '<input type="checkbox" style="margin-top:.3rem;" data-ucpm-lettre-cv="' + e.id + '"' + (choisies.indexOf(e.id) >= 0 ? ' checked' : '') + '>' +
        '<span style="flex:1;min-width:0;"><strong>CV ' + _ucpmP6Numero(etat, e.id) + ' : ' + _ucpmEsc(_ucpmP6Titre(etat, e)) + '</strong><br>' +
        '<span class="small" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) +
        (etat.lettres && String(etat.lettres[e.id] || '').trim() ? ' &#183; une lettre existe déjà, elle sera remplacée' : '') + '</span></span></label>';
    }).join('') +
    '<p class="small mb-0" id="ucpmP6AvisChoix" style="color:var(--warning-strong);" hidden>Gardez au moins un CV coché.</p></fieldset></div>';
}

function _ucpmP6CablerChoixCv(etat) {
  Array.prototype.forEach.call(document.querySelectorAll('[data-ucpm-lettre-cv]'), function (el) {
    el.addEventListener('change', function () {
      var cases = Array.prototype.slice.call(document.querySelectorAll('[data-ucpm-lettre-cv]'));
      var ids = cases.filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute('data-ucpm-lettre-cv'); });
      if (!ids.length) {
        el.checked = true;
        var avis = document.getElementById('ucpmP6AvisChoix');
        if (avis) { avis.hidden = false; }
        return;
      }
      var avis2 = document.getElementById('ucpmP6AvisChoix');
      if (avis2) { avis2.hidden = true; }
      etat.lettresIds = ids.length === cases.length ? null : ids;
    });
  });
}

// ---------------- Passage avec l'assistant ----------------

function _ucpmConfigPassageLettres(etat) {
  var entrees = _ucpmP6Choisies(etat);
  return {
    idSuffixe: 'UcpmLettres',
    etapes: UCPM_ETAPES_CHOIX_LETTRES,
    texteConfidentialite: 'Seul le profil de votre CV de référence et les informations de chaque CV choisi sont envoyés : votre nom, votre téléphone et votre adresse ne partent pas.',
    recapHtml: ucpmHtmlStyleEcriture('lettre') + _ucpmP6HtmlChoixCv(etat),
    construireTexte: function () {
      return ucpmChargerPrompt('ucpm-lettres', 'ucpm-lettres.md').then(function (modele) {
        return ucpmConstruirePromptLettres(modele, {
          sexe: etat.sexe,
          profil: ucpmConstruireProfilValide(ucpmDossierVrai()),
          cvs: ucpmBlocCvLettres(entrees.map(function (e) {
            return { titre: _ucpmP6Titre(etat, e), accroche: _ucpmP6Accroche(etat, e), objectif: e.objectif };
          }))
        }) + ucpmConsignesStyle('lettre');
      });
    },
    importer: function (texte) {
      var r = ucpmLireReponseLettres(texte, entrees.map(function (e) { return e.id; }));
      if (r.succes) {
        var pretes = ucpmPreparerLettresRecues(r.lettres, entrees, _ucpmP6NomSignature());
        etat.lettres = ucpmFusionnerLettres(etat.lettres, pretes);
        etat.lettresOrigine = ucpmFusionnerLettres(etat.lettresOrigine, pretes);
        etat.lettresManquantes = r.manquants;
        var recues = entrees.filter(function (e) { return !!pretes[e.id]; });
        etat.lettresSig = Object.assign({}, etat.lettresSig, ucpmSignaturesLettres(etat, recues, ucpmConstruireProfilValide(ucpmDossierVrai()), _ucpmP6NomSignature()));
        etat.lettreSel = entrees[0] ? entrees[0].id : '';
        if (typeof trackEvenement === 'function') { trackEvenement('ucpm_lettres_lues', { lettres: Object.keys(r.lettres).length, manquants: r.manquants.length }); }
      }
      return r;
    },
    apresSucces: function () { etat.p6Vue = 'lecture'; ucpmRendrePage(); }
  };
}

// ---------------- Lecture et modification ----------------

function _ucpmP6HtmlSelecteur(etat, cochees) {
  return '<div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Choisir la lettre à lire">' + cochees.map(function (e) {
    var a = !!String((etat.lettres && etat.lettres[e.id]) || '').trim();
    var actif = etat.lettreSel === e.id;
    return '<button type="button" class="btn btn-sm ' + (actif ? 'btn-primary' : 'btn-outline-primary') + '" data-ucpm-lettre-sel="' + e.id + '" data-ucpm-pastille-base="CV ' + _ucpmP6Numero(etat, e.id) + ' : ' + _ucpmEsc(_ucpmP6Titre(etat, e)) + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' +
      'CV ' + _ucpmP6Numero(etat, e.id) + ' : ' + _ucpmEsc(_ucpmP6Titre(etat, e)) + (a ? '' : ' (à écrire)') + '</button>';
  }).join('') + '</div>';
}

function _ucpmP6HtmlLettre(etat, e) {
  var texte = String((etat.lettres && etat.lettres[e.id]) || '');
  var origine = String((etat.lettresOrigine && etat.lettresOrigine[e.id]) || '');
  var modifiee = !!origine && texte !== origine;
  var mots = ucpmNombreMots(texte);
  var formule = ucpmFormuleAppel(e.objectif).replace(/,$/, '');
  return '<div class="cv-section" data-ucpm-lettre="' + e.id + '">' +
    '<p class="mb-1"><strong>Lettre du CV ' + _ucpmP6Numero(etat, e.id) + ' : ' + _ucpmEsc(_ucpmP6Titre(etat, e)) + '</strong></p>' +
    '<p class="small mb-2" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) + ' &#183; adressée à : ' + _ucpmEsc(formule) + (e.objectif && e.objectif.employeur ? ' (' + _ucpmEsc(e.objectif.employeur) + ')' : '') + '</p>' +
    '<label class="visually-hidden" for="ucpmTexteLettre">Texte de la lettre</label>' +
    '<textarea class="form-control" id="ucpmTexteLettre" rows="18" data-ucpm-lettre-texte="' + e.id + '" placeholder="' + UCPM_PLACEHOLDER_LETTRE + '">' + echapperTexteUcpm(texte) + '</textarea>' +
    '<p class="small mt-1 mb-1" style="color:var(--text-muted);"><span id="ucpmP6Mots">' + mots + '</span> mots</p>' +
    '<p class="small mb-2" id="ucpmP6Longue" style="color:var(--warning-strong);"' + (ucpmLettreLongue(texte) ? '' : ' hidden') + '>Cette lettre est longue : elle risque de passer sur deux pages une fois imprimée. Pensez à la raccourcir pour qu’elle tienne sur une page.</p>' +
    '<div class="d-flex flex-wrap gap-2">' +
    (origine ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-lettre-origine="' + e.id + '"' + (modifiee ? '' : ' disabled') + '>Remettre la lettre reçue</button>' : '') +
    '</div></div>';
}

// Règle de Retour : les lettres dont ce qui avait été envoyé a changé depuis (objectif, identité, titre, phrase d'accroche, CV de référence) sont signalées, sans rien effacer.
function _ucpmP6Perimees(etat) { return ucpmLettresPerimees(etat, ucpmConstruireProfilValide(ucpmDossierVrai()), _ucpmP6NomSignature()); }

function _ucpmP6HtmlPerimees(etat) {
  var p = _ucpmP6Perimees(etat);
  if (!p.length) { return ''; }
  return '<div class="cv-section" style="border-left:4px solid var(--warning-strong);" role="status"><p class="mb-1"><strong>' + (p.length > 1 ? 'Certaines lettres ne correspondent peut-être plus.' : 'Une lettre ne correspond peut-être plus.') + '</strong></p>' +
    '<p class="small mb-1">Vous avez changé quelque chose depuis la demande (objectif, identité, titre ou phrase d’accroche, CV de référence). Lettres concernées : ' +
    p.map(function (e) { return 'CV ' + _ucpmP6Numero(etat, e.id) + ' (' + _ucpmEsc(_ucpmP6Titre(etat, e)) + ')'; }).join(', ') + '.</p>' +
    '<p class="small mb-2">Rien n’est effacé : vos lettres restent telles quelles tant que vous ne refaites pas la demande.</p>' +
    '<button type="button" class="btn btn-outline-primary btn-sm" id="btnUcpmRefairePerimees">Refaire ' + (p.length > 1 ? 'ces lettres' : 'cette lettre') + '</button></div>';
}

function _ucpmP6HtmlLecture(etat) {
  var cochees = ucpmEntreesCochees(etat);
  if (!etat.lettreSel || !cochees.some(function (e) { return e.id === etat.lettreSel; })) { etat.lettreSel = cochees[0] ? cochees[0].id : ''; }
  var courante = cochees.filter(function (e) { return e.id === etat.lettreSel; })[0];
  var sansLettre = cochees.filter(function (e) { return !String((etat.lettres && etat.lettres[e.id]) || '').trim(); });
  return '<div class="cv-section"><p class="mb-1">Voici une lettre par CV. Chacune commence par la formule d’appel et finit par votre nom, ajoutés par l’application.</p>' +
    '<p class="mb-0 small" style="color:var(--text-muted);">Relisez-les et modifiez-les comme vous voulez : ce que vous voyez ici est ce qui sera imprimé. Une lettre doit tenir sur une page.</p></div>' +
    _ucpmP6HtmlPerimees(etat) +
    _ucpmP6HtmlSelecteur(etat, cochees) +
    (courante ? _ucpmP6HtmlLettre(etat, courante) : '') +
    (sansLettre.length
      ? '<div class="cv-section" style="border-left:4px solid var(--warning-strong);"><p class="mb-0 small">' + sansLettre.length + ' CV ' + (sansLettre.length > 1 ? 'n’ont' : 'n’a') + ' pas de lettre : ' +
        sansLettre.map(function (e) { return 'CV ' + _ucpmP6Numero(etat, e.id); }).join(', ') + '. Vous pouvez l’écrire vous-même, refaire la demande, ou continuer sans.</p></div>'
      : '') +
    '<div class="mt-3"><button type="button" class="btn btn-outline-secondary" id="btnUcpmRefaireLettres">Refaire la demande</button></div>';
}

function _ucpmP6CablerLecture(etat) {
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  $$('[data-ucpm-lettre-sel]', function (el) {
    el.addEventListener('click', function () { etat.lettreSel = el.getAttribute('data-ucpm-lettre-sel'); ucpmRendrePage(); });
  });
  $$('[data-ucpm-lettre-texte]', function (el) {
    var id = el.getAttribute('data-ucpm-lettre-texte');
    el.addEventListener('input', function () {
      etat.lettres = etat.lettres || {};
      etat.lettres[id] = ucpmSansTiretLong(el.value);
      var m = document.getElementById('ucpmP6Mots'); if (m) { m.textContent = ucpmNombreMots(etat.lettres[id]); }
      var l = document.getElementById('ucpmP6Longue'); if (l) { l.hidden = !ucpmLettreLongue(etat.lettres[id]); }
      var o = document.querySelector('[data-ucpm-lettre-origine="' + id + '"]');
      if (o) { o.disabled = etat.lettres[id] === (etat.lettresOrigine && etat.lettresOrigine[id]); }
      var pastille = document.querySelector('[data-ucpm-lettre-sel="' + id + '"]');
      if (pastille) { pastille.textContent = pastille.getAttribute('data-ucpm-pastille-base') + (String(etat.lettres[id]).trim() ? '' : ' (à écrire)'); }
    });
  });
  $$('[data-ucpm-lettre-origine]', function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-ucpm-lettre-origine');
      var faire = function () { etat.lettres[id] = etat.lettresOrigine[id]; ucpmRendrePage(); };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Remettre la lettre reçue ?', 'Vos modifications de cette lettre seront remplacées par le texte reçu de l’assistant.', 'Remettre la lettre reçue', 'btn-primary', faire);
      } else { faire(); }
    });
  });
  var perimees = document.getElementById('btnUcpmRefairePerimees');
  if (perimees) {
    perimees.addEventListener('click', function () {
      var ids = _ucpmP6Perimees(etat).map(function (e) { return e.id; });
      var faire = function () { etat.lettresIds = ids.length === ucpmEntreesCochees(etat).length ? null : ids; etat.p6Vue = 'passage'; ucpmPassageReinitialiser(etat, 'lettres'); ucpmRendrePage(); };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Refaire la demande ?', 'L’assistant réécrira ' + (ids.length > 1 ? 'ces lettres' : 'cette lettre') + ' avec ce que vous avez changé. Vos modifications ' + (ids.length > 1 ? 'de ces lettres' : 'de cette lettre') + ' seront remplacées au collage ; les autres lettres ne changent pas.', 'Refaire la demande', 'btn-primary', faire);
      } else { faire(); }
    });
  }
  var refaire = document.getElementById('btnUcpmRefaireLettres');
  if (refaire) {
    refaire.addEventListener('click', function () {
      var faire = function () { etat.p6Vue = 'passage'; ucpmPassageReinitialiser(etat, 'lettres'); ucpmRendrePage(); };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Refaire la demande ?', 'Au prochain collage, les lettres des CV choisis seront remplacées par celles de l’assistant, y compris vos modifications. Les lettres des CV que vous décochez ne changent pas.', 'Refaire la demande', 'btn-primary', faire);
      } else { faire(); }
    });
  }
}

ucpmEnregistrerPage(6, {
  rendre: function (etat) {
    var intro = '<div class="cv-section"><p class="mb-0">L’assistant écrit <strong>une lettre de motivation par CV</strong>, en une seule demande. Chaque lettre suit ce que vous cherchez avec ce CV (candidature spontanée, offre, stage, formation…) et s’appuie seulement sur votre CV validé : rien n’est inventé.</p></div>';
    if (etat.lettres && etat.p6Vue === 'lecture') { return _ucpmP6HtmlLecture(etat); }
    return intro + ucpmPassageRendre(etat, 'lettres', _ucpmConfigPassageLettres(etat));
  },
  cabler: function (etat) {
    if (etat.lettres && etat.p6Vue === 'lecture') { _ucpmP6CablerLecture(etat); return; }
    ucpmPassageCabler(etat, 'lettres', _ucpmConfigPassageLettres(etat));
    if (ucpmPassageVue(etat, 'lettres') === 'choix') { _ucpmP6CablerChoixCv(etat); ucpmCablerStyleEcriture('lettre', ucpmRendrePage); }
  },
  libelleContinuer: 'Terminer &#8594;',
  peutContinuer: function (etat) { return !!etat.lettres && etat.p6Vue === 'lecture' && _ucpmP6LettresExistantes(etat).length > 0; },
  raisonBlocage: function (etat) {
    if (etat.lettres && etat.p6Vue === 'lecture') { return 'Écrivez au moins une lettre, ou refaites la demande à l’assistant, pour continuer.'; }
    return 'Demandez vos lettres à l’assistant et collez sa réponse pour continuer.';
  },
  continuer: function () { ucpmAllerPage(7); },
  // « Retour » : recule d'une vue du passage ; depuis la lecture, ou au début du passage, revient à la page 5 sans rien supprimer.
  retour: function (etat) {
    if (etat.p6Vue === 'passage' && ucpmPassageRetour(etat, 'lettres')) { return true; }
    if (etat.p6Vue === 'passage' && etat.lettres) { etat.p6Vue = 'lecture'; ucpmRendrePage(); return true; }
    return false;
  }
});
