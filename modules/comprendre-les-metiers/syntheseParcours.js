/* ============================================================
   Module « Explorer les métiers » : « Mon parcours », ÉCRANS et GESTES (étape B de « Ma synthèse »).
   Créé le 19/11/2026. Maquette validée : docs/MAQUETTE_MON_PARCOURS_EXPLORER_LES_METIERS_V1_2026-11-19.html (quatre recommandations de Claude validées par Denis).
   Logique pure (testée sous Node) : syntheseParcoursLogique.js. Ici : le bloc de la page de synthèse, la page « Mon parcours » (liste et ajout d'un métier exercé),
   la page « fiche » (compétences à cocher), le résumé « ce que mon parcours apporte » aux métiers retenus.

   Règles tenues ici :
   - jusqu'à cinq métiers exercés ; « Autre expérience » = aucune fiche, seulement des compétences cherchées une à une ;
   - la recherche d'un métier et celle d'une compétence sont CELLES de « Chercher un métier » (pmcSuggestions) : aucune seconde recherche ;
   - les diplômes d'une fiche ne se cochent jamais ; une compétence non cochée n'est jamais présentée comme absente ;
   - le parcours est gardé avec « Garder ma synthèse » (disquette), jamais de texte libre, de date ni d'employeur ;
   - la comparaison à chaque piste de la lecture est faite par synComparerPiste (une seule brique), à partir du parcours (voir synSourceComparaison, syntheseLecture.js).
   ============================================================ */

var _synpEdit = 0;                 // numéro du métier exercé dont on coche les compétences
var _synpVoirSv = {};              // « Voir les autres » des savoirs, par métier exercé

function _synpD() { return (typeof _pmfD === 'function') ? _pmfD() : null; }
function _synpPluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }
function _synpTypes() { return [['sf', 'Mes savoir-faire', 'Savoir-faire', 'Gestes et tâches que j’ai réalisés dans ce poste.'],
  ['se', 'Mes qualités professionnelles', 'Savoir-être', 'Qualités que j’ai mises en œuvre dans mon travail.'],
  ['sv', 'Mes connaissances', 'Savoirs', 'Connaissances, outils et règles que j’ai utilisés.']]; }

/* ---------- Le bloc de la page « Ma synthèse » (écran 1 de la maquette) ---------- */
function _synBlocParcours(etat) {
  var s = synEtat(), n = s.parcours.length, D = _synpD();
  var h = '<div class="cml-bloc"><h2><i class="bi bi-briefcase" aria-hidden="true"></i> Mon parcours professionnel ' + _synPastilleEtat(n > 0, 'Rempli') + '</h2>' +
    '<p>Les métiers que vous avez déjà exercés, et ce que vous y avez vraiment fait. Cela permet de dire <b>ce que votre expérience apporte</b> aux métiers qui ressortent de vos passages. Rien n’est obligatoire.</p>';
  if (n) {
    h += '<ul class="cml-liste-simple mb-2">' + s.parcours.map(function (e) {
      return '<li><b>' + cmvE(D ? synpNomAffiche(D, e) : e.nom) + '</b> : ' + _synpPluriel(synpNbCoches(e), 'compétence cochée', 'compétences cochées') + '</li>'; }).join('') + '</ul>';
  }
  return h + '<div class="boutons-ligne"><button type="button" class="btn btn-primary" data-cml="aller" data-vue="parcours"><i class="bi bi-pencil" aria-hidden="true"></i> ' + (n ? 'Modifier mon parcours' : 'Ajouter mon parcours') + '</button></div></div>';
}

/* ---------- La page « Mon parcours » (écran 2) ---------- */
function _synpHtmlParcours(etat) {
  var s = synEtat(), n = s.parcours.length, D = _synpD();
  if (!_synFichesPretes()) { return cmvEncart('bi-hourglass-split', 'Les fiches des métiers se chargent. Patientez quelques secondes.'); }
  var h = cmvEncart('bi-shield-check', 'Ce n’est pas un CV : pas de dates, pas d’employeurs. Votre nom, votre adresse et vos réponses ne partent jamais. Seuls les noms des métiers et les compétences que vous cochez peuvent être lus par l’assistant en ligne, et seulement si vous lui faites lire votre synthèse.');
  h += '<div class="cml-bloc"><h2><i class="bi bi-list-check" aria-hidden="true"></i> Mes métiers exercés ' + _synPastilleEtat(n > 0, n + ' sur ' + SYNP_MAX_METIERS) + '</h2>';
  if (!n) { h += '<p class="mb-0">Vous n’avez encore ajouté aucun métier. Tapez ci-dessous le nom d’un métier que vous avez exercé, même peu de temps, même il y a longtemps.</p>'; }
  s.parcours.forEach(function (e, k) {
    var nb = synpNbCoches(e);
    h += '<div class="cml-ligne-metier"><div><b>' + cmvE(D ? synpNomAffiche(D, e) : e.nom) + '</b><div class="cml-note">' + _synpPluriel(nb, 'compétence cochée', 'compétences cochées') + '</div></div>' +
      '<div class="boutons-ligne"><button type="button" class="btn btn-outline-primary" data-cml="synpEditer" data-k="' + k + '"><i class="bi bi-ui-checks" aria-hidden="true"></i> Cocher mes compétences</button>' +
      '<button type="button" class="btn btn-outline-secondary" data-cml="synpRetirer" data-k="' + k + '"><i class="bi bi-trash" aria-hidden="true"></i> Retirer</button></div></div>';
  });
  h += '</div>';
  if (n < SYNP_MAX_METIERS) {
    h += '<div class="cml-bloc"><h2><i class="bi bi-search" aria-hidden="true"></i> Ajouter un métier que j’ai exercé</h2>' +
      '<label for="synpRechM" class="cml-note">Tapez le nom du métier</label>' +
      '<input id="synpRechM" type="search" class="form-control" autocomplete="off" placeholder="Par exemple : cuisinier, animateur, cariste" aria-describedby="synpSuggM">' +
      '<div id="synpSuggM" class="cml-sugg-zone" aria-live="polite"></div>' +
      (s.parcours.some(function (e) { return synpEstAutre(e); }) ? '' :
        '<p class="cml-note mt-3 mb-1">Votre expérience n’est pas un métier de la liste (petit boulot, bénévolat, tâches à la maison) ?</p>' +
        '<div class="boutons-ligne"><button type="button" class="btn btn-outline-primary" data-cml="synpAutre"><i class="bi bi-plus-circle" aria-hidden="true"></i> Ajouter « ' + SYNP_AUTRE + ' »</button></div>') +
      '</div>';
  } else { h += cmvEncart('bi-check-circle', 'Vous avez ajouté cinq métiers, c’est le maximum. Retirez-en un pour en ajouter un autre.'); }
  h += _synpHtmlApport(etat, D);
  return h;
}

/* ---------- Ce que mon parcours apporte aux métiers retenus (écran 4, hors lecture) ---------- */
function _synpHtmlApport(etat, D) {
  var s = synEtat();
  if (!D || !synpBagageIds(D, s.parcours).length) { return ''; }
  var retenus = [1, 2, 3].map(function (p) { return synRetenu(p); }).filter(Boolean).filter(function (r, i, t) { return t.findIndex(function (x) { return synNormaliser(x.nom) === synNormaliser(r.nom); }) === i; });
  var h = '<div class="cml-bloc"><h2><i class="bi bi-diagram-3" aria-hidden="true"></i> Ce que mon parcours apporte</h2>';
  if (!retenus.length) {
    return h + '<p class="mb-0">Retenez un métier dans l’un des passages (« Retenir pour ma synthèse ») : vous verrez ici ce que votre parcours lui apporte. La lecture de l’assistant le fait aussi pour chacune de ses pistes.</p></div>';
  }
  h += '<p class="cml-note">Pour chaque métier que vous avez retenu. Calculé par l’application à partir de ce que vous avez coché : ce n’est pas une note, et une compétence non cochée n’est pas une compétence que vous n’avez pas.</p>';
  retenus.forEach(function (r) {
    var idx = _synIdxMetier(D, r.nom), c = idx >= 0 ? synComparerPiste(synpBagageIds(D, s.parcours), synpFichePourComparaison(D, idx)) : null;
    h += '<div class="cml-piste"><b>' + cmvE(r.nom) + '</b>';
    if (!c) { h += '<p class="cml-note mb-0">Rien à comparer pour ce métier (pas de fiche ou aucune compétence cochée).</p></div>'; return; }
    h += _synCamembert(c.deja, c.total) +
      (c.transferables.length ? '<p class="mb-1"><b>Transférables :</b> ' + _synLibs(D, c.transferables, 4) + '.</p>' : '') +
      (c.transversales.length ? '<p class="mb-1"><b>Transversales :</b> ' + _synLibs(D, c.transversales, 4) + '.</p>' : '') +
      (c.aAcquerir.length ? '<p class="mb-0"><b>À acquérir :</b> ' + _synLibs(D, c.aAcquerir, 4) + '.</p>' : '<p class="mb-0">Tout ce que ce métier demande est déjà dans votre parcours.</p>') + '</div>';
  });
  return h + '</div>';
}

cmvEnregistrerVue('parcours', {
  titre: 'Mon parcours',
  barre: function () { return { retour: 'synthese' }; },
  rendre: _synpHtmlParcours,
  cabler: function () {
    _synChargerFiches();
    var champ = document.getElementById('synpRechM'), zone = document.getElementById('synpSuggM');
    if (!champ || !zone) { return; }
    champ.addEventListener('input', function () { zone.innerHTML = _synpSuggestionsMetiers(champ.value); });
  }
});

// Les métiers qui répondent à la saisie : la recherche de « Chercher un métier » (nom, autre nom, sigle). Aucun métier déjà ajouté.
function _synpSuggestionsMetiers(texte) {
  var D = _synpD();
  if (!D || !String(texte || '').trim()) { return ''; }
  var res = pmcSuggestions(D, pmcEtatInitial(), texte, {});
  if (!res || !res.metiers) { return ''; }
  var deja = synEtat().parcours.map(function (e) { return e.rome; });
  var items = res.metiers.items.filter(function (i) { return deja.indexOf(D.m[i].code) === -1; });
  if (!items.length) { return '<p class="cml-note mt-2 mb-0">Aucun métier ne correspond. Essayez un autre mot, ou ajoutez « ' + SYNP_AUTRE + ' ».</p>'; }
  return '<div class="cml-sugg">' + items.map(function (i) {
    return '<button type="button" data-cml="synpAjouter" data-rome="' + cmvE(D.m[i].code) + '" data-nom="' + cmvE(D.m[i][0]) + '"><span><b>' + cmvE(D.m[i][0]) + '</b></span><span class="cml-note"><i class="bi bi-plus-circle" aria-hidden="true"></i> Ajouter</span></button>';
  }).join('') + '</div>';
}

cmvEnregistrerAction('synpAjouter', function (el) {
  var s = synEtat(), r = synpAjouterMetier(s.parcours, el.getAttribute('data-rome'), el.getAttribute('data-nom'));
  if (!r.ok) { if (r.raison === 'plein' && typeof afficherToast === 'function') { afficherToast('Cinq métiers au plus. Retirez-en un pour en ajouter un autre.'); } return r.raison === 'plein' ? false : true; }
  _synpEdit = s.parcours.length - 1;
  cmvAller('parcours-fiche');
  return false;
});
cmvEnregistrerAction('synpAutre', function () {
  var s = synEtat(), r = synpAjouterMetier(s.parcours, '', '');
  if (!r.ok) { return true; }
  _synpEdit = s.parcours.length - 1;
  cmvAller('parcours-fiche');
  return false;
});
cmvEnregistrerAction('synpEditer', function (el) { _synpEdit = parseInt(el.getAttribute('data-k'), 10) || 0; cmvAller('parcours-fiche'); return false; });
cmvEnregistrerAction('synpRetirer', function (el) {
  var s = synEtat(), k = parseInt(el.getAttribute('data-k'), 10), e = s.parcours[k];
  if (!e) { return false; }
  var retirer = function () { synpRetirerMetier(s.parcours, k); _synpEdit = 0; cmvRendre(); };
  if (synpNbCoches(e) > 0 && typeof confirmerAction === 'function') {
    confirmerAction('Retirer ce métier ?', 'Les compétences que vous avez cochées pour « ' + (_synpD() ? synpNomAffiche(_synpD(), e) : e.nom) + ' » seront effacées de votre parcours.', 'Retirer', 'btn-danger', retirer, 'Garder');
  } else { retirer(); }
  return false;
});

/* ---------- La page « fiche » : ce que j'ai fait comme « ce métier » (écran 3) ---------- */
function _synpHtmlFiche(etat) {
  var s = synEtat();
  if (!s.parcours.length) { return _synInviteParcoursVide(); }
  if (_synpEdit >= s.parcours.length || _synpEdit < 0) { _synpEdit = 0; }
  if (!_synFichesPretes()) { return cmvEncart('bi-hourglass-split', 'Les fiches des métiers se chargent. Patientez quelques secondes.'); }
  var D = _synpD(), e = s.parcours[_synpEdit], fiche = D ? synpFiche(D, e) : null, nom = D ? synpNomAffiche(D, e) : e.nom;
  var h = '<div class="cml-fil" style="grid-template-columns:repeat(' + s.parcours.length + ',minmax(0,1fr))">' + s.parcours.map(function (q, k) {
    return '<button type="button" class="cml-fil-t ' + (k === _synpEdit ? 'encours' : 'fait') + '" data-cml="synpEditer" data-k="' + k + '"' + (k === _synpEdit ? ' aria-current="step"' : '') + '><span class="cml-num">' + (k + 1) + '</span><span><b>' +
      cmvE(D ? synpNomAffiche(D, q) : q.nom) + '</b><small>' + _synpPluriel(synpNbCoches(q), 'cochée', 'cochées') + '</small></span></button>'; }).join('') + '</div>';
  h += cmvBandeau(0, synpEstAutre(e) ? 'Mes autres expériences' : 'Mon expérience de « ' + cmvE(nom) + ' »',
    synpEstAutre(e) ? 'Cherchez, ci-dessous, les compétences que vous avez pratiquées (bénévolat, petits boulots, tâches à la maison). Rien n’est obligatoire.'
      : 'Cochez ce que vous avez vraiment pratiqué, même un peu. Cette liste décrit le métier en général : elle peut différer de votre poste.', { icone: 'bi-ui-checks' });
  if (!synpEstAutre(e) && !fiche) { h += cmvEncart('bi-info-circle', 'Je ne retrouve plus la fiche de ce métier dans l’application. Vous pouvez quand même ajouter des compétences une à une ci-dessous.'); }
  var dansFiche = {};
  if (fiche) {
    _synpTypes().forEach(function (T) {
      var t = T[0], liste = fiche[t], coches = liste.filter(function (x) { return e[t].indexOf(x.l) !== -1; }).length;
      liste.forEach(function (x) { dansFiche[t + '|' + x.l] = 1; });
      var limite = (t === 'sv' && !_synpVoirSv[_synpEdit]) ? 10 : liste.length;
      h += '<div class="cml-groupe-comp"><h3>' + T[1] + ' <small>' + T[2] + ' : ' + _synpPluriel(coches, 'cochée', 'cochées') + ' sur ' + liste.length + '</small></h3><p class="cml-note mb-1">' + T[3] + '</p>' +
        '<div class="cml-jetons">' + liste.slice(0, limite).map(function (x) { return _synpJeton(t, x.l, e[t].indexOf(x.l) !== -1); }).join('') + '</div>' +
        '<div class="boutons-ligne"><button type="button" class="btn btn-sm btn-outline-secondary" data-cml="synpRien" data-t="' + t + '">Tout décocher</button>' +
        (t === 'sv' && liste.length > 10 ? '<button type="button" class="btn btn-sm btn-outline-primary" data-cml="synpVoirSv">' + (_synpVoirSv[_synpEdit] ? 'Voir moins' : 'Voir les ' + (liste.length - 10) + ' autres') + '</button>' : '') + '</div></div>';
    });
    if (fiche.diplomes.length) {
      h += cmvEncart('bi-mortarboard', '<b>Diplômes et habilitations souvent demandés</b> pour ce métier : ' + fiche.diplomes.map(cmvE).join(' ; ') + '. Ils ne sont pas à cocher ici : ce sont des titres, pas des compétences pratiquées. Ils restent visibles sur la fiche du métier.');
    }
  }
  // Compétences ajoutées à la main (hors fiche) et recherche de compétences
  var ajoutees = [];
  _synpTypes().forEach(function (T) { e[T[0]].forEach(function (l) { if (!dansFiche[T[0] + '|' + l]) { ajoutees.push({ t: T[0], l: l }); } }); });
  h += '<div class="cml-bloc"><h2><i class="bi bi-plus-circle" aria-hidden="true"></i> ' + (synpEstAutre(e) ? 'Chercher mes compétences' : 'Une compétence que la fiche ne cite pas ?') + '</h2>' +
    '<p class="cml-note">' + (synpEstAutre(e) ? 'Cherchez parmi toutes les compétences de l’application.' : 'Vous avez fait autre chose dans ce poste ? Cherchez une compétence parmi toutes celles de l’application.') + '</p>' +
    '<label for="synpRechC" class="visually-hidden">Chercher une compétence</label>' +
    '<input id="synpRechC" type="search" class="form-control" autocomplete="off" placeholder="Par exemple : animer, planning, hygiène" aria-describedby="synpSuggC">' +
    '<div id="synpSuggC" class="cml-sugg-zone" aria-live="polite"></div>' +
    (ajoutees.length ? '<p class="cml-note mt-3 mb-1">Ajoutées par vous :</p><div class="cml-jetons">' + ajoutees.map(function (x) { return _synpJeton(x.t, x.l, true); }).join('') + '</div>' : '') + '</div>';
  h += '<div class="boutons-ligne"><button type="button" class="btn btn-primary" data-cml="aller" data-vue="parcours"><i class="bi bi-check2" aria-hidden="true"></i> Terminer ce métier</button></div>';
  return h;
}
function _synpJeton(t, lib, actif) {
  return '<button type="button" class="cml-jt' + (actif ? ' is-actif' : '') + '" data-cml="synpCoche" data-t="' + t + '" data-l="' + cmvE(lib) + '" aria-pressed="' + !!actif + '"><i class="bi bi-check-lg" aria-hidden="true"></i> ' + cmvE(lib) + '</button>';
}
function _synInviteParcoursVide() {
  return '<div class="cml-invite"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><p class="mb-1">Ajoutez d’abord un métier que vous avez exercé.</p>' +
    '<button type="button" class="btn btn-primary" data-cml="aller" data-vue="parcours">Ajouter un métier</button></div></div>';
}

cmvEnregistrerVue('parcours-fiche', {
  titre: function (etat) { var s = synEtat(), e = s.parcours[_synpEdit], D = _synpD(); return e ? (synpEstAutre(e) ? SYNP_AUTRE : 'Mon parcours : ' + (D ? synpNomAffiche(D, e) : e.nom)) : 'Mon parcours'; },
  barre: function () { return { retour: 'parcours' }; },
  rendre: _synpHtmlFiche,
  cabler: function () {
    _synChargerFiches();
    var champ = document.getElementById('synpRechC'), zone = document.getElementById('synpSuggC');
    if (!champ || !zone) { return; }
    champ.addEventListener('input', function () { zone.innerHTML = _synpSuggestionsCompetences(champ.value); });
  }
});

// Les compétences qui répondent à la saisie : la recherche de « Chercher un métier ». Ni diplôme, ni compétence déjà cochée.
function _synpSuggestionsCompetences(texte) {
  var D = _synpD(), s = synEtat(), e = s.parcours[_synpEdit];
  if (!D || !e || !String(texte || '').trim()) { return ''; }
  var S0 = pmcEtatInitial();
  S0.comp = synpBagageIds(D, [e]);     // celles déjà cochées pour ce métier ne sont plus proposées
  var res = pmcSuggestions(D, S0, texte, { plusCompetences: true });
  var items = ((res && res.competences) ? res.competences.items : []).filter(function (x) { return !(x.t === 'sv' && D.sv[x.i].cat === SYNP_CAT_DIPLOMES); }).slice(0, 8);
  if (!items.length) { return '<p class="cml-note mt-2 mb-0">Rien de trouvé avec ces mots.</p>'; }
  var noms = { sf: 'Savoir-faire', se: 'Savoir-être', sv: 'Savoir' };
  return '<div class="cml-sugg">' + items.map(function (x) {
    return '<button type="button" data-cml="synpCoche" data-t="' + x.t + '" data-l="' + cmvE(D[x.t][x.i].lib) + '"><span>' + cmvE(D[x.t][x.i].lib) + '</span><span class="cml-note">' + noms[x.t] + ' <i class="bi bi-plus-circle" aria-hidden="true"></i></span></button>';
  }).join('') + '</div>';
}

cmvEnregistrerAction('synpCoche', function (el) {
  var e = synEtat().parcours[_synpEdit];
  if (!synpBasculer(e, el.getAttribute('data-t'), el.getAttribute('data-l'))) {
    if (typeof afficherToast === 'function') { afficherToast('Vous avez déjà beaucoup de compétences cochées pour ce métier : décochez-en avant d’en ajouter.'); }
    return false;
  }
  return true;
});
cmvEnregistrerAction('synpRien', function (el) {
  var s = synEtat(), e = s.parcours[_synpEdit], D = _synpD(), t = el.getAttribute('data-t'), f = D ? synpFiche(D, e) : null;
  if (!f) { return false; }
  return synpToutDecocher(e, t, f[t].map(function (x) { return x.l; }));   // seulement ce qui vient de la fiche : ce que la personne a ajouté à la main reste
});
cmvEnregistrerAction('synpVoirSv', function () { _synpVoirSv[_synpEdit] = !_synpVoirSv[_synpEdit]; return true; });
