/* ============================================================
   Module « Nouveautés » : interface (pas de test Node : test navigateur obligatoire).
   Le bouton en haut à gauche (#btnNouveautes, index.html) est visible sur toutes les pages ; la pastille dit combien de nouveautés datent de moins de 7 jours.
   La page (route 'nouveautes') a trois entrées (consigne 201) : les nouveautés de l'application (data/nouveautes.js), les changements récents des règles (lus dans le module
   « Comprendre le cadre », jamais copiés) et les problèmes corrigés (data/problemesCorriges.js). Chaque entrée a sa couleur (bleu, vert, jaune) et son nombre ; la pastille additionne les trois. Logique pure : logique.js.
   Chantier : docs/CHANTIER_NOUVEAUTES_2026-10-26.md.
   ============================================================ */

function _nvEchap(t) {
  return String(t === undefined || t === null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Nombre de changements « de la semaine » dans les règles : connu seulement une fois les fichiers du module « Comprendre le cadre » lus (null avant).
var _nvNbRegles = null;
// Entrée affichée : 'choix' (page d'explication des trois parties, rien de présélectionné : la personne choisit), 'appli', 'regles' ou 'corriges'.
// Le bouton « Nouveautés » ramène toujours au choix ; la recherche de l'accueil ouvre directement une entrée.
var _nvEntree = 'choix';
// Vrai dès que la personne a cliqué sur l'une des trois entrées : les boutons arrêtent alors de pulser (pour le reste de la visite).
var _nvPulseFini = false;

function _nvNbAppli() { return typeof NOUVEAUTES !== 'undefined' ? nvCompterNouveaux(NOUVEAUTES, new Date()) : 0; }
function _nvNbCorriges() { return typeof PROBLEMES_CORRIGES !== 'undefined' ? nvCompterNouveaux(PROBLEMES_CORRIGES, new Date()) : 0; }

// Pastille du bouton : les trois nombres additionnés (application, règles, problèmes corrigés), cachée à zéro.
function nvMajPastille() {
  var p = document.getElementById('nvPastille'), b = document.getElementById('btnNouveautes');
  if (!p || !b) { return; }
  var n = nvTotalPastille(_nvNbAppli(), _nvNbRegles, _nvNbCorriges());
  p.textContent = n ? String(n) : '';
  p.hidden = !n;
  b.setAttribute('aria-label', n ? 'Nouveautés : ' + n + ' élément' + (n > 1 ? 's' : '') + ' récent' + (n > 1 ? 's' : '') : 'Nouveautés : voir ce qui a été ajouté');
}

// Lit une fois par session les changements récents des règles (module « Comprendre le cadre ») pour en connaître le nombre ; met à jour la pastille et l'entrée.
function _nvLireNombreRegles() {
  if (typeof comprendreLeCadreLireRecent !== 'function') { return; }
  comprendreLeCadreLireRecent(function (infos) {
    _nvNbRegles = infos ? infos.nbNouveaux : 0;
    nvMajPastille();
    var c = document.querySelector('[data-nv-compte="regles"]');
    if (c) { c.outerHTML = _nvCompteHtml('regles', _nvNbRegles); }
  });
}

function nvOuvrirPage() {
  _nvEntree = 'choix';
  if (typeof naviguerVers === 'function') { naviguerVers('nouveautes'); }
}

// Ouvre la page directement sur une entrée (recherche de l'accueil).
function nvOuvrirEntree(cle) {
  _nvEntree = nvEntreeValide(cle);
  if (typeof naviguerVers === 'function') { naviguerVers('nouveautes'); }
}

function nvEssayer(route) {
  if (route && typeof naviguerVers === 'function') { naviguerVers(route); }
}

var _NV_ENTREES_AFFICHAGE = {
  appli: { icone: 'bi-stars', titre: 'Nouveautés de l’application', couleur: 'bleu' },
  regles: { icone: 'bi-journal-text', titre: 'Droits et règles : ce qui change', couleur: 'jaune' },
  corriges: { icone: 'bi-check2-circle', titre: 'Problèmes corrigés', couleur: 'vert' }
};

function _nvCompteHtml(cle, n) {
  var c = _NV_ENTREES_AFFICHAGE[cle].couleur;
  return '<span class="nv-compte nv-compte--' + c + '" data-nv-compte="' + cle + '"' + (n ? ' aria-label="' + n + ' récent' + (n > 1 ? 's' : '') + '"' : ' hidden') + '>' + (n ? n : '') + '</span>';
}

function _nvEntreesHtml() {
  var nb = { appli: _nvNbAppli(), regles: _nvNbRegles, corriges: _nvNbCorriges() };
  return '<div class="nv-entrees' + (_nvEntree === 'choix' && !_nvPulseFini ? ' nv-pulse' : '') + '" role="tablist" aria-label="Que voulez-vous voir ?">' + NV_ENTREES.map(function (cle) {
    var e = _NV_ENTREES_AFFICHAGE[cle];
    return '<button type="button" class="nv-entree nv-entree--' + e.couleur + '" role="tab" id="nvEntree-' + cle + '" aria-selected="' + (cle === _nvEntree) + '" data-nv-entree="' + cle + '">' +
      '<i class="bi ' + e.icone + '" aria-hidden="true"></i> ' + e.titre + ' ' + _nvCompteHtml(cle, nb[cle]) + '</button>';
  }).join('') + '</div>';
}

// Page d'arrivée : à quoi correspond chacune des trois parties, en deux phrases. Aucune n'est choisie d'avance (consigne 201).
var _NV_EXPLICATIONS = {
  appli: 'Ce qui a été ajouté ou amélioré dans l’application : un nouveau module, une nouvelle fonction, une amélioration importante. Les ajouts des 7 derniers jours sont repérés et ont un bouton pour les essayer.',
  regles: 'Ce qui vient de changer dans les règles qui peuvent vous concerner : emploi, formation, aides, logement, santé. Chaque changement donne sa date et renvoie au texte officiel quand il existe.',
  corriges: 'Les problèmes qui ont été signalés ou que nous avons trouvés, et qui sont maintenant corrigés. Pour chacun : ce qui n’allait pas, et ce qui a été corrigé.'
};
function _nvPanneauChoix() {
  return '<h2 class="nv-choix-titre">Que voulez-vous regarder ?</h2>' +
    '<p class="nv-intro">Cette page a trois parties. Choisissez celle qui vous intéresse avec l’un des trois boutons ci-dessus.</p>' +
    NV_ENTREES.map(function (cle) {
      var e = _NV_ENTREES_AFFICHAGE[cle];
      return '<div class="nv-explic nv-entree--' + e.couleur + '"><div class="nv-explic-titre"><i class="bi ' + e.icone + '" aria-hidden="true"></i> ' + e.titre + '</div><p class="mb-0">' + _NV_EXPLICATIONS[cle] + '</p></div>';
    }).join('');
}

// Entrée 1 : la liste des ajouts de l'application (la page d'origine, inchangée).
function _nvPanneauAppli() {
  var auj = new Date();
  var groupes = nvGrouperParMois(typeof NOUVEAUTES !== 'undefined' ? NOUVEAUTES : [], auj);
  var corps = groupes.map(function (g) {
    return '<h2 class="nv-mois">' + _nvEchap(g.mois) + '</h2>' + g.items.map(function (n) {
      var recent = nvEstNouveau(n, auj);
      return '<div class="nv-carte"><div class="nv-tete"><span class="nv-date">' + _nvEchap(nvDateFr(n.date)) + '</span>' +
        (recent ? '<span class="nv-nouveau">Nouveau</span>' : '') + '</div>' +
        '<div class="nv-titre">' + _nvEchap(n.titre) + '</div><p class="mb-2">' + _nvEchap(n.texte) + '</p>' +
        (!recent && n.carte ? '<p class="nv-ou mb-0"><i class="bi bi-signpost-2" aria-hidden="true"></i> Vous trouverez ce module dans la carte « ' + _nvEchap(n.carte) + ' » de l’accueil.</p>' : '') +
        (!recent && !n.carte && n.lieu ? '<p class="nv-ou mb-0"><i class="bi bi-signpost-2" aria-hidden="true"></i> Vous le trouverez ' + _nvEchap(n.lieu) + '.</p>' : '') +
        (recent && n.route ? '<button type="button" class="btn btn-sm btn-outline-primary" data-nv-route="' + _nvEchap(n.route) + '">' + (n.icone ? '<i class="bi ' + _nvEchap(n.icone) + '" aria-hidden="true"></i> ' : '') + 'Essayer : ' + _nvEchap(n.module || 'ouvrir') + '</button>' : '') + '</div>';
    }).join('');
  }).join('');
  return '<p class="nv-intro">Les mises à jour, les ajouts et les améliorations importantes de l’application, du plus récent au plus ancien. Les ajouts des 7 derniers jours portent la mention « Nouveau » et un bouton pour les essayer.</p>' +
    '<div class="text-center mb-2"><button type="button" class="btn btn-sm btn-outline-secondary" data-signaler-probleme="1"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> Un problème avec une nouveauté ? Signalez-le</button></div>' +
    (corps || '<p class="text-center text-muted">Rien à signaler pour l’instant.</p>');
}

// Entrée 2 : seulement ce qui vient de changer dans les règles, lu dans « Comprendre le cadre » (même liste, mêmes cartes) ; un bouton invite à ouvrir le module.
function _nvPanneauRegles() {
  return '<p class="nv-intro">Les derniers changements dans les règles (emploi, formation, aides, droits) que nous avons répertoriés. Ici, seulement ce qui vient de changer. Pour les fiches complètes et les changements trimestre par trimestre, ouvrez « Comprendre le cadre ».</p>' +
    '<div id="nvReglesCorps"><p class="text-center text-muted">Chargement…</p></div>' +
    '<div class="nv-invitation"><p class="mb-2">Envie de voir les fiches, ou les changements des mois précédents, trimestre par trimestre ?</p>' +
    '<button type="button" class="nv-btn-ovale" data-nv-ouvrir-cadre="1"><i class="bi bi-compass" aria-hidden="true"></i> Ouvrir « Comprendre le cadre »</button></div>';
}

function _nvBrancherRegles() {
  var zone = document.getElementById('nvReglesCorps');
  if (!zone) { return; }
  var vide = '<p class="text-center text-muted">Les derniers changements ne peuvent pas s’afficher pour l’instant. Vous les retrouvez dans « Comprendre le cadre ».</p>';
  if (typeof comprendreLeCadreLireRecent !== 'function') { zone.innerHTML = vide; return; }
  comprendreLeCadreLireRecent(function (infos) {
    if (!infos) { if (document.getElementById('nvReglesCorps') === zone) { zone.innerHTML = vide; } return; }
    comprendreLeCadreRenduRecent(infos, function (html) {
      if (document.getElementById('nvReglesCorps') !== zone) { return; }   // la personne a changé d'entrée entre-temps
      zone.innerHTML = html;
      comprendreLeCadreBrancherRecent();
    });
  });
}

// Entrée 3 : les problèmes corrigés. Le remerciement n'apparaît qu'ici, en tête.
function _nvPanneauCorriges() {
  var auj = new Date();
  var groupes = nvGrouperParMois(typeof PROBLEMES_CORRIGES !== 'undefined' ? PROBLEMES_CORRIGES : [], auj);
  var corps = groupes.map(function (g) {
    return '<h2 class="nv-mois">' + _nvEchap(g.mois) + '</h2>' + g.items.map(function (p) {
      return '<div class="nv-carte-corrige"><div class="nv-tete"><span class="nv-badge-corrige"><i class="bi bi-check2" aria-hidden="true"></i> Corrigé</span>' +
        '<span class="nv-date">' + _nvEchap(nvDateFr(p.date)) + '</span>' + (nvLibelleOrigine(p) ? '<span class="nv-origine">' + _nvEchap(nvLibelleOrigine(p)) + '</span>' : '') + '</div>' +
        '<div class="nv-titre">' + _nvEchap(p.titre) + '</div>' +
        '<div class="nv-lib">' + _nvEchap(nvLibelleAvant(p)) + '</div><p>' + _nvEchap(p.signale) + '</p>' +
        '<div class="nv-lib nv-lib--ok">Ce qui a été corrigé</div><p>' + _nvEchap(p.corrige) + '</p></div>';
    }).join('');
  }).join('');
  return '<div class="nv-merci"><strong>Merci aux personnes qui ont pris la peine de nous signaler ces dysfonctionnements.</strong>' +
    'Chaque signalement est lu, et c’est grâce à vous que nous les trouvons. Voici ce qui avait été signalé et ce qui a été corrigé, ainsi que ce que nous avons repéré nous-mêmes. Vous n’avez pas besoin de laisser votre nom pour signaler un problème : il sera quand même pris en compte.</div>' +
    (corps || '<p class="text-center text-muted">Rien à signaler pour l’instant.</p>') +
    '<div class="text-center mt-3"><button type="button" class="nv-btn-ovale" data-signaler-probleme="1"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> Signaler un problème</button></div>';
}

// Dessine le panneau de l'entrée choisie et branche ses boutons (sans redessiner la page : l'écran ne bouge pas).
function _nvAfficherEntree(cle) {
  _nvEntree = cle === 'choix' ? 'choix' : nvEntreeValide(cle);
  if (_nvEntree !== 'choix') {   // la personne a choisi : le pulse s'arrête
    _nvPulseFini = true;
    var rangee = document.querySelector('.nv-entrees');
    if (rangee) { rangee.classList.remove('nv-pulse'); }
  }
  document.querySelectorAll('[data-nv-entree]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-nv-entree') === _nvEntree)); });
  var zone = document.getElementById('nvPanneau');
  if (!zone) { return; }
  if (_nvEntree === 'choix') { zone.removeAttribute('aria-labelledby'); } else { zone.setAttribute('aria-labelledby', 'nvEntree-' + _nvEntree); }
  zone.innerHTML = _nvEntree === 'choix' ? _nvPanneauChoix() : (_nvEntree === 'regles' ? _nvPanneauRegles() : (_nvEntree === 'corriges' ? _nvPanneauCorriges() : _nvPanneauAppli()));
  zone.querySelectorAll('[data-nv-route]').forEach(function (b) {
    b.addEventListener('click', function () { nvEssayer(b.getAttribute('data-nv-route')); });
  });
  var vers = zone.querySelector('[data-nv-ouvrir-cadre]');
  if (vers) { vers.addEventListener('click', function () { if (typeof comprendreLeCadreOuvrirAccueil === 'function') { comprendreLeCadreOuvrirAccueil(); } }); }
  if (_nvEntree === 'regles') { _nvBrancherRegles(); }
  if (_nvEntree !== 'choix' && typeof trackEvenement === 'function') { trackEvenement('nouveautes_entree', { entree: _nvEntree }); }
}

function pageNouveautes() {
  _nvEntree = _nvEntree === 'choix' ? 'choix' : nvEntreeValide(_nvEntree);
  app.innerHTML = '<div class="page-catalogue-contenu nv-page">' +
    '<div class="text-center"><h1><i class="bi bi-megaphone" aria-hidden="true"></i> Nouveautés</h1></div>' +
    _nvEntreesHtml() + '<div id="nvPanneau" role="tabpanel"></div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null) + '</div>';
  app.querySelectorAll('[data-nv-entree]').forEach(function (b) {
    b.addEventListener('click', function () { _nvAfficherEntree(b.getAttribute('data-nv-entree')); });
  });
  _nvAfficherEntree(_nvEntree);
  _nvLireNombreRegles();
  if (typeof trackEvenement === 'function') { trackEvenement('nouveautes_ouvert'); }
}

function _nvInitialiser() {
  var b = document.getElementById('btnNouveautes');
  if (b && !b.__nvBranche) { b.__nvBranche = true; b.addEventListener('click', nvOuvrirPage); }
  nvMajPastille();
  _nvLireNombreRegles();   // le nombre des changements des règles complète la pastille dès qu'il est connu
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _nvInitialiser); } else { _nvInitialiser(); }
}
