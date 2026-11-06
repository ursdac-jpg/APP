// BLOC « Quelques passages à préciser » EN PAGE : dessin et câblage (navigateur). La logique (réponses, journal d'annulation, textes du compteur) est dans logique.js (testée sous Node).
// A remplacé l'ancienne fenêtre « Quelques passages à préciser » (supprimée le 01/11/2026) : voir docs/CHANTIER_RELECTURE_EN_PAGE_2026-11-01.md. Maquette : docs/MAQUETTE_RELECTURE_EN_PAGE_2026-11-01.html.
// Usage dans une page : insérer htmlBlocPassages(etat) en haut, puis brancherBlocPassages(element, etat, { apresChangement: function (i, resultat) {} }).
//   etat = passagesCreerEtat(points, { appliquer, cibles }) (logique.js), gardé par le module tant que la page qui suit n'est pas validée : le bloc se redessine à l'identique si la page se redessine.
//   Quand la page est validée : passagesFinaliser(etat, dossier), puis htmlBlocPassages(etat) n'affiche plus que la ligne de résumé (plus de modification possible).

function _pbEchapper(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _pbTextePilule(etat, i) {
  var r = etat.reponses[i];
  if (r.statut === 'repondu') { return 'répondu : ' + r.valeur.slice(0, 24); }
  if (r.statut === 'passe') { return 'passé'; }
  if (r.statut === 'retire') { return 'à retirer'; }
  return 'à préciser';
}

function _pbQuestionHTML(etat, i, avecNumero) {
  var p = etat.points[i], r = etat.reponses[i];
  var fige = etat.finalise;
  var valeurAffichee = r.statut === 'retire' ? 'À retirer du CV' : r.valeur;
  var verrou = (r.statut === 'passe' || r.statut === 'retire') ? ' disabled' : '';
  var h = '<details class="bloc-depli bd-warn" open data-passage="' + i + '"><summary>' +
    (avecNumero ? '<span class="preparer-num">' + (i + 1) + '</span>' : '') +
    '<span class="preparer-titre">' + _pbEchapper(p.titre || 'Un passage à préciser') + '</span>' +
    '<span class="pilule-etat ' + (r.statut === 'attente' ? 'pe-attente' : 'pe-ok') + '" data-passage-pilule="' + i + '">' + _pbEchapper(_pbTextePilule(etat, i)) + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    (p.extrait ? '<p class="preparer-detail mb-2">Passage retrouvé dans le document : « ' + _pbEchapper(p.extrait) + ' »</p>' : '') +
    '<label class="form-label small mb-1" for="passageReponse' + i + '">' + _pbEchapper(p.question) + '</label>' +
    '<input type="text" class="form-control" id="passageReponse' + i + '" data-passage-champ="' + i + '" value="' + _pbEchapper(valeurAffichee) + '"' + verrou + (fige ? ' disabled' : '') + '>' +
    '<p class="preparer-detail mt-1 mb-0 passages-avis" data-passage-avis="' + i + '" aria-live="polite" hidden></p>';
  if (!fige) {
    if (p.suggestion) { h += '<div class="mt-2"><button type="button" class="btn btn-outline-primary btn-sm" data-passage-suggestion="' + i + '" data-valeur="' + _pbEchapper(p.suggestion) + '">Utiliser « ' + _pbEchapper(p.suggestion) + ' »</button></div>'; }
    if (p.suggestions && p.suggestions.length) {
      // Plusieurs propositions possibles (ex. les deux années d'une formation pour une certification sans date) : un bouton par proposition.
      h += '<div class="mt-2 d-flex gap-2 flex-wrap">' + p.suggestions.map(function (sg) {
        return '<button type="button" class="btn btn-outline-primary btn-sm" data-passage-suggestion="' + i + '" data-valeur="' + _pbEchapper(sg) + '">' + _pbEchapper(sg) + '</button>';
      }).join('') + '</div>';
    }
    if (p.retirer) { h += '<div class="mt-2"><button type="button" class="btn btn-outline-primary btn-sm" data-passage-retirer="' + i + '">Retirer « ' + _pbEchapper(p.extrait) + ' »</button></div>'; }
    h += '<div class="mt-2 d-flex gap-2 flex-wrap">' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-passage-passer="' + i + '">Je ne sais pas, passer cette question</button>' +
      '<button type="button" class="btn btn-outline-primary btn-sm" data-passage-reprendre="' + i + '"' + (verrou ? '' : ' hidden') + '>Répondre finalement</button></div>';
  }
  return h + '</div></details>';
}

// HTML du bloc. Rien si aucune question. Après « Terminé » (etat.ouvert = false) ou page validée (etat.finalise) : une ligne de résumé.
function htmlBlocPassages(etat) {
  if (!etat || !etat.points.length) { return ''; }
  var corps = '';
  var groupes = passagesGroupesAnnees(etat.points);
  var sujets = passagesSujets(etat.points);
  var plusieursSujets = sujets.length >= 2;
  if (!etat.finalise) {
    corps += '<p class="mb-3">Votre document était peut-être une image ou un scan, ou l’assistant a relevé un point à préciser. <strong>Rien n’est obligatoire</strong> : passez une question si vous ne savez pas. ' +
      ((etat.differe && !etat.rejoue) ? 'Vos réponses sont gardées et seront appliquées quand vous validerez cette page : vous pouvez les changer jusque-là.' : 'Vos réponses sont gardées : vous pouvez revenir ici tant que vous n’avez pas validé la page.') + '</p>';
    groupes.forEach(function (g, gi) {
      corps += '<div class="cv-section mb-3"><p class="mb-1"><strong>Les ' + g.indices.length + ' certifications rangées sous « ' + _pbEchapper(g.nom) + ' » ont-elles la même année ?</strong> ' +
        '<span class="preparer-detail">Un clic remplit toutes les réponses ci-dessous ; vous pouvez ensuite en corriger une.</span></p><div class="d-flex gap-2 flex-wrap">' +
        g.annees.map(function (a) { return '<button type="button" class="btn btn-primary btn-sm" data-passage-groupe="' + gi + '" data-valeur="' + _pbEchapper(a) + '">' + _pbEchapper(a) + ' pour toutes</button>'; }).join('') +
        '</div></div>';
    });
  }
  sujets.forEach(function (su) {
    if (plusieursSujets) { corps += '<h3 class="passages-sujet">' + _pbEchapper(su.nom) + (su.indices.length > 1 ? ' <span class="cpv-badge">' + su.indices.length + ' questions</span>' : '') + '</h3>'; }
    su.indices.forEach(function (i) { corps += _pbQuestionHTML(etat, i, !plusieursSujets); });
  });
  if (!etat.finalise) {
    corps += '<div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3"><span class="preparer-detail" data-passages-compteur aria-live="polite">' + _pbEchapper(passagesTexteCompteur(etat)) + '</span>' +
      '<button type="button" class="btn btn-primary" data-passages-termine>Terminé</button></div>';
  }
  var replie = etat.finalise || !etat.ouvert;
  var pilule = passagesBilan(etat).restantes ? '<span class="pilule-etat pe-attente" data-passages-pilule>' + passagesBilan(etat).restantes + ' à préciser</span>' : '<span class="pilule-etat pe-ok" data-passages-pilule>terminé</span>';
  var resume = '<div class="passages-resume" data-passages-resume' + (replie ? '' : ' hidden') + '><span class="passages-resume-ok" aria-hidden="true">&#10003;</span>' +
    '<span data-passages-resume-texte>' + _pbEchapper(passagesTexteResume(etat)) + '</span>' +
    (etat.finalise ? '' : '<button type="button" class="btn btn-outline-primary btn-sm ms-auto" data-passages-modifier>Modifier mes réponses</button>') + '</div>';
  return '<details class="bloc-depli bd-warn passages-a-preciser" open data-passages-bloc><summary><span class="preparer-titre">Quelques passages à préciser</span>' + pilule + '</summary>' +
    '<div class="bloc-depli-corps"><div data-passages-corps' + (replie ? ' hidden' : '') + '>' + corps + '</div>' + resume + '</div></details>';
}

// ---------------- Pour une page hôte (un seul bloc à la fois, rattaché à un module par sa clé) ----------------
// Le module pose son état avec passagesPoserPourPage(cle, etat, apresChangement) ; la page l'affiche avec htmlBlocPassagesDePage(cle) (vide si ce n'est pas le bon module : un état oublié ne réapparaît jamais ailleurs)
// puis le câble avec brancherBlocPassagesDePage(cle). À la validation de la page : passagesFinaliser puis passagesRetirerDePage().
var _passagesDePage = null;
function passagesPoserPourPage(cle, etat, apresChangement) { _passagesDePage = { cle: cle, etat: etat, apresChangement: apresChangement }; }
function passagesRetirerDePage() { _passagesDePage = null; }
function passagesEtatDePage(cle) { return (_passagesDePage && _passagesDePage.cle === cle) ? _passagesDePage.etat : null; }
function htmlBlocPassagesDePage(cle) { var e = passagesEtatDePage(cle); return e ? htmlBlocPassages(e) : ''; }
function brancherBlocPassagesDePage(cle) {
  var e = passagesEtatDePage(cle);
  if (e) { brancherBlocPassages(document, e, { apresChangement: _passagesDePage.apresChangement }); }
}

// Pose le bloc pour la page « Vos informations » à partir des points relevés dans l'import : une réponse s'applique tout de suite sur le dossier (déjà rangé) et peut être changée jusqu'à la
// validation de la page. Rien à poser s'il n'y a aucun point. Utilisé par tous les modules qui rangent un CV puis ouvrent « Vos informations » (Un CV plusieurs métiers, version rapide...).
function passagesPoserSurDossier(cle, points) {
  if (!points || !points.length) { passagesRetirerDePage(); return; }
  var e = passagesCreerEtat(points, {
    cibles: function () { return [dossier]; },
    dossierInfos: dossier,
    marqueurRetirer: PRECISION_RETIRER,
    appliquer: function (extrait, valeur, point) { return appliquerPrecisionSurValeurs(dossier)(extrait, valeur, point); }
  });
  passagesPoserPourPage(cle, e, function () { if (typeof projetRedessinerBlocs === 'function') { projetRedessinerBlocs(); } });
}
// Variante pour l'écran de validation du Bilan : les réponses sont seulement gardées (la liste à cocher ne bouge pas) ; la page les applique d'un coup avec passagesAppliquerSurObjet().
function passagesPoserDifferePourPage(cle, points) {
  if (!points || !points.length) { passagesRetirerDePage(); return; }
  passagesPoserPourPage(cle, passagesCreerEtat(points, { differe: true, marqueurRetirer: PRECISION_RETIRER }), null);
}
// La page est validée (bouton « Continuer ») : le bloc n'est plus modifiable, ses réponses sont déjà dans le dossier.
function passagesValiderPage(cle) {
  var e = passagesEtatDePage(cle);
  if (e) { passagesFinaliser(e, dossier); passagesRetirerDePage(); }
}

// Câble le bloc dessiné par htmlBlocPassages(). options.apresChangement(i, resultat) : appelée après chaque réponse (le module peut redessiner ce que la réponse a changé).
function brancherBlocPassages(racine, etat, options) {
  if (!racine || !etat || etat.finalise) { return; }
  var bloc = racine.querySelector('[data-passages-bloc]') || racine;
  function champ(i) { return bloc.querySelector('[data-passage-champ="' + i + '"]'); }
  function majPilules() {
    etat.points.forEach(function (p, i) {
      var pil = bloc.querySelector('[data-passage-pilule="' + i + '"]');
      if (pil) { pil.className = 'pilule-etat ' + (etat.reponses[i].statut === 'attente' ? 'pe-attente' : 'pe-ok'); pil.textContent = _pbTextePilule(etat, i); }
      var c = champ(i), r = etat.reponses[i];
      if (c) {
        c.disabled = r.statut === 'passe' || r.statut === 'retire';
        c.placeholder = r.statut === 'passe' ? 'Passé' : '';
        if (r.statut === 'retire') { c.value = 'À retirer du CV'; } else if (r.statut === 'passe') { c.value = ''; }
      }
      var rep = bloc.querySelector('[data-passage-reprendre="' + i + '"]');
      if (rep) { rep.hidden = !(r.statut === 'passe' || r.statut === 'retire'); }
    });
    var cpt = bloc.querySelector('[data-passages-compteur]');
    if (cpt) { cpt.textContent = passagesTexteCompteur(etat); }
    var b = passagesBilan(etat);
    var pil = bloc.querySelector('[data-passages-pilule]');
    if (pil) { pil.className = 'pilule-etat ' + (b.restantes ? 'pe-attente' : 'pe-ok'); pil.textContent = b.restantes ? b.restantes + ' à préciser' : 'terminé'; }
    var rt = bloc.querySelector('[data-passages-resume-texte]');
    if (rt) { rt.textContent = passagesTexteResume(etat); }
  }
  function definir(i, statut, valeur) {
    var res = passagesDefinirReponse(etat, i, statut, valeur);
    var avis = bloc.querySelector('[data-passage-avis="' + i + '"]');
    if (avis) {
      avis.hidden = !res.ignorees;
      avis.textContent = res.ignorees ? 'Vous aviez déjà modifié ce passage vous-même : je n’y ai pas touché.' : '';
    }
    majPilules();
    if (options && typeof options.apresChangement === 'function') { options.apresChangement(i, res); }
    return res;
  }
  function validerChamp(i) {
    var c = champ(i);
    if (!c || c.disabled) { return; }
    var texte = c.value.trim();
    var r = etat.reponses[i];
    if (texte === (r.statut === 'repondu' ? r.valeur : '')) { return; }   // rien n'a changé
    definir(i, texte ? 'repondu' : 'attente', texte);
  }
  etat.points.forEach(function (p, i) {
    var c = champ(i);
    if (!c) { return; }
    c.addEventListener('blur', function () { validerChamp(i); });
    // Touche Entrée (retour Denis 2026-10-19) : valide la réponse et passe à la question suivante ; après la dernière, « Terminé » prend le focus.
    c.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter') { return; }
      ev.preventDefault();
      validerChamp(i);
      var suivant = null;
      for (var k = i + 1; k < etat.points.length && !suivant; k++) {
        var s = champ(k);
        if (s && !s.disabled) { suivant = s; }
      }
      if (suivant) {
        var d = suivant.closest('details'); if (d) { d.open = true; }
        suivant.focus({ preventScroll: true });
        suivant.scrollIntoView({ block: 'nearest' });
      } else {
        var bt = bloc.querySelector('[data-passages-termine]'); if (bt) { bt.focus({ preventScroll: true }); bt.scrollIntoView({ block: 'nearest' }); }
      }
    });
  });
  bloc.querySelectorAll('[data-passage-suggestion]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.passageSuggestion, 10), c = champ(i);
      if (c) { c.value = btn.dataset.valeur; }
      definir(i, 'repondu', btn.dataset.valeur);
    });
  });
  var groupes = passagesGroupesAnnees(etat.points);
  bloc.querySelectorAll('[data-passage-groupe]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var g = groupes[parseInt(btn.dataset.passageGroupe, 10)];
      if (!g) { return; }
      g.indices.forEach(function (i) { var c = champ(i); if (c) { c.value = btn.dataset.valeur; } definir(i, 'repondu', btn.dataset.valeur); });
    });
  });
  bloc.querySelectorAll('[data-passage-retirer]').forEach(function (btn) {
    btn.addEventListener('click', function () { definir(parseInt(btn.dataset.passageRetirer, 10), 'retire'); });
  });
  bloc.querySelectorAll('[data-passage-passer]').forEach(function (btn) {
    btn.addEventListener('click', function () { definir(parseInt(btn.dataset.passagePasser, 10), 'passe'); });
  });
  bloc.querySelectorAll('[data-passage-reprendre]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.passageReprendre, 10);
      definir(i, 'attente');
      var c = champ(i);
      if (c) { c.disabled = false; c.value = ''; c.focus(); }
    });
  });
  function montrer(ouvert) {
    etat.ouvert = ouvert;
    var corps = bloc.querySelector('[data-passages-corps]'), resume = bloc.querySelector('[data-passages-resume]');
    if (corps) { corps.hidden = !ouvert; }
    if (resume) { resume.hidden = ouvert; }
    majPilules();
  }
  var fin = bloc.querySelector('[data-passages-termine]');
  if (fin) { fin.addEventListener('click', function () { var a = document.activeElement; if (a && a.blur) { a.blur(); } montrer(false); }); }
  var modif = bloc.querySelector('[data-passages-modifier]');
  if (modif) { modif.addEventListener('click', function () { montrer(true); }); }
  majPilules();
}
