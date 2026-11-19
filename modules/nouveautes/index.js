/* ============================================================
   Module « Nouveautés » : interface (pas de test Node : test navigateur obligatoire).
   Le bouton en haut à gauche (#btnNouveautes, index.html) est visible sur toutes les pages ; la pastille dit combien de nouveautés datent de moins de 7 jours.
   La page (route 'nouveautes') a quatre entrées (consignes 201 et 440) : les nouveautés de l'application (data/nouveautes.js), les changements récents des règles (lus dans le module
   « Comprendre le cadre », jamais copiés), les chiffres clés qui bougent (lus dans « Comprendre les chiffres », jamais copiés) et les problèmes corrigés (data/problemesCorriges.js).
   Chaque entrée a sa couleur (bleu, jaune, turquoise, vert) et son nombre ; la pastille additionne les quatre. Logique pure : logique.js.
   Chantier : docs/CHANTIER_NOUVEAUTES_2026-10-26.md.
   ============================================================ */

function _nvEchap(t) {
  return String(t === undefined || t === null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Nombre de changements « de la semaine » dans les règles : connu seulement une fois les fichiers du module « Comprendre le cadre » lus (null avant).
var _nvNbRegles = null;
// Idem pour les fiches « Chiffres » (lues dans « Comprendre les chiffres » par comprendreLesChiffresLireFiches).
var _nvNbChiffres = null;
// Territoire choisi par la personne dans les fiches « Chiffres » (pastilles Dordogne, Haute-Vienne, Nouvelle-Aquitaine, France) : le même pour toutes les fiches de la page, jamais enregistré. null = pas encore choisi.
var _nvTerritoire = null;
// Entrée affichée : 'choix' (page d'explication des quatre parties, rien de présélectionné : la personne choisit), 'appli', 'regles', 'chiffres' ou 'corriges'.
// Le bouton « Nouveautés » ramène toujours au choix ; la recherche de l'accueil ouvre directement une entrée.
var _nvEntree = 'choix';
// Vrai dès que la personne a cliqué sur l'une des quatre entrées : les boutons arrêtent alors de pulser (pour le reste de la visite).
var _nvPulseFini = false;

// Mémoire du « déjà vu » (consigne 418, décision de Denis 16/11/2026) : élément par élément, gardée dans l'appareil d'une visite à l'autre (logique.js, qui l'explique).
// Elle REMPLACE l'ancienne mémoire par rubrique entière, qui ne durait que la session (consigne 332 ter). Si le stockage de l'appareil est refusé, elle vaut jusqu'à l'actualisation.
var _nvMemoire = (function () { var t = null; try { t = localStorage.getItem(NV_CLE_STOCKAGE); } catch (e) { t = null; } return nvLireMemoire(t, new Date()); })();
function _nvSauverMemoire() { try { localStorage.setItem(NV_CLE_STOCKAGE, nvEcrireMemoire(_nvMemoire)); } catch (e) { /* pas grave : valable jusqu'à l'actualisation */ } }
// Les éléments pas encore vus au moment où la personne a OUVERT l'entrée pour la première fois (pendant cette session) : ce sont eux qui portent « Nouveau » pendant toute la visite,
// même une fois marqués vus dans la mémoire (sinon le « Nouveau » disparaîtrait au moment de le lire).
var _nvInstantane = {};
// Les éléments visibles d'une liste de données (date lisible, pas dans le futur), comme la page les affiche.
function _nvVisibles(liste) { var auj = new Date(); return (liste || []).filter(function (n) { var a = nvAgeJours(n && n.date, auj); return a !== null && a >= 0; }); }
function _nvListeEntree(cle) {
  if (cle === 'appli') { return _nvVisibles(typeof NOUVEAUTES !== 'undefined' ? NOUVEAUTES : []); }
  if (cle === 'corriges') { return _nvVisibles(typeof PROBLEMES_CORRIGES !== 'undefined' ? PROBLEMES_CORRIGES : []); }
  return null;
}
// La personne vient de voir l'entrée : tout ce qu'elle contient devient « vu ». `liste` = la liste COMPLÈTE de l'entrée.
function _nvMarquerEntree(cle, liste) {
  if (!liste) { return; }
  if (!_nvInstantane[cle]) { _nvInstantane[cle] = {}; }
  nvNonVus(_nvMemoire, cle, liste).forEach(function (e) { _nvInstantane[cle][nvCleElement(cle, e)] = true; });
  _nvMemoire = nvMarquerVus(_nvMemoire, cle, liste);
  if (cle !== 'regles' && cle !== 'chiffres') { _nvMemoire = nvNettoyer(_nvMemoire, cle, liste); }   // « Droits et règles » : la liste peut être partielle (6 mois) ; « Chiffres » : une fiche peut disparaître quand son chiffre vieillit puis revenir : on n'y efface rien
  _nvSauverMemoire();
  if (cle === 'regles') { _nvNbRegles = 0; }
  if (cle === 'chiffres') { _nvNbChiffres = 0; }
  nvMajPastille();
  var c = document.querySelector('[data-nv-compte="' + cle + '"]');
  if (c) { c.outerHTML = _nvCompteHtml(cle, 0); }
}

function _nvNbAppli() { return nvNonVus(_nvMemoire, 'appli', _nvListeEntree('appli')).length; }
function _nvNbCorriges() { return nvNonVus(_nvMemoire, 'corriges', _nvListeEntree('corriges')).length; }

// Pastille du bouton : les quatre nombres additionnés (application, règles, chiffres, problèmes corrigés), cachée à zéro.
function nvMajPastille() {
  var p = document.getElementById('nvPastille'), b = document.getElementById('btnNouveautes');
  if (!p || !b) { return; }
  var n = nvTotalPastille(_nvNbAppli(), _nvNbRegles, _nvNbCorriges(), _nvNbChiffres);
  p.textContent = n ? String(n) : '';
  p.hidden = !n;
  b.setAttribute('aria-label', n ? 'Nouveautés : ' + n + ' élément' + (n > 1 ? 's' : '') + ' récent' + (n > 1 ? 's' : '') : 'Nouveautés : voir ce qui a été ajouté');
}

// Lit une fois par session les changements et les fiches de « Droits et règles » (module « Comprendre le cadre », par sa façade) pour en connaître le nombre non vu ; met à jour la pastille et l'entrée.
function _nvLireNombreRegles() {
  if (typeof comprendreLeCadreLireElements !== 'function') { return; }
  comprendreLeCadreLireElements(function (liste) {
    _nvNbRegles = liste ? nvNonVus(_nvMemoire, 'regles', liste).length : null;
    nvMajPastille();
    var c = document.querySelector('[data-nv-compte="regles"]');
    if (c) { c.outerHTML = _nvCompteHtml('regles', _nvNbRegles); }
  });
}
// Lit une fois par session les fiches « Chiffres » (module « Comprendre les chiffres », par sa façade) pour en connaître le nombre non vu ; met à jour la pastille et l'entrée.
function _nvLireNombreChiffres() {
  if (typeof comprendreLesChiffresLireFiches !== 'function') { return; }
  comprendreLesChiffresLireFiches(function (liste) {
    _nvNbChiffres = liste ? nvNonVus(_nvMemoire, 'chiffres', liste).length : null;
    nvMajPastille();
    var c = document.querySelector('[data-nv-compte="chiffres"]');
    if (c) { c.outerHTML = _nvCompteHtml('chiffres', _nvNbChiffres); }
  });
}
// À chaque ARRIVÉE dans Nouveautés, SANS EXCEPTION, les panneaux de filtres sont repliés (consignes 424 et 431) : le retour depuis une fiche lue sur place les replie aussi.
// Les choix déjà faits restent appliqués (la ligne de résumé sous le filtre replié les rappelle) ; seul le panneau se referme, pour que l'attention aille au contenu.
function _nvReplierFiltres() { _nvFiltres.appli.plie = true; _nvFiltres.regles.plie = true; _nvFiltres.chiffres.plie = true; }
function nvOuvrirPage() {
  _nvReplierFiltres();
  _nvEntree = 'choix';
  if (typeof naviguerVers === 'function') { naviguerVers('nouveautes'); }
}

// Ouvre la page directement sur une entrée (recherche de l'accueil).
function nvOuvrirEntree(cle) {
  _nvReplierFiltres();
  _nvEntree = nvEntreeValide(cle);
  if (typeof naviguerVers === 'function') { naviguerVers('nouveautes'); }
}

function nvEssayer(route) {
  if (route && typeof naviguerVers === 'function') { naviguerVers(route); }
}

var _NV_ENTREES_AFFICHAGE = {
  appli: { icone: 'bi-stars', titre: 'Nouveautés de l’application', couleur: 'bleu' },
  regles: { icone: 'bi-journal-text', titre: 'Droits et règles : ce qui change', couleur: 'jaune' },
  chiffres: { icone: 'bi-bar-chart', titre: 'Chiffres : ce qui bouge', couleur: 'turquoise' },
  corriges: { icone: 'bi-check2-circle', titre: 'Problèmes corrigés', couleur: 'vert' }
};

function _nvCompteHtml(cle, n) {
  var c = _NV_ENTREES_AFFICHAGE[cle].couleur;
  return '<span class="nv-compte nv-compte--' + c + '" data-nv-compte="' + cle + '"' + (n ? ' aria-label="' + n + ' récent' + (n > 1 ? 's' : '') + '"' : ' hidden') + '>' + (n ? n : '') + '</span>';
}

function _nvEntreesHtml() {
  var nb = { appli: _nvNbAppli(), regles: _nvNbRegles, chiffres: _nvNbChiffres, corriges: _nvNbCorriges() };
  return '<div class="nv-entrees' + (_nvEntree === 'choix' && !_nvPulseFini ? ' nv-pulse' : '') + '" role="tablist" aria-label="Que voulez-vous voir ?">' + NV_ENTREES.map(function (cle) {
    var e = _NV_ENTREES_AFFICHAGE[cle];
    return '<button type="button" class="nv-entree nv-entree--' + e.couleur + '" role="tab" id="nvEntree-' + cle + '" aria-selected="' + (cle === _nvEntree) + '" data-nv-entree="' + cle + '">' +
      '<i class="bi ' + e.icone + '" aria-hidden="true"></i> <span class="nv-entree-lib">' + e.titre + '</span> ' + _nvCompteHtml(cle, nb[cle]) + '</button>';
  }).join('') + '</div>';
}

// Page d'arrivée : à quoi correspond chacune des quatre parties, en deux phrases. Aucune n'est choisie d'avance (consigne 201).
var _NV_EXPLICATIONS = {
  appli: 'Ce qui a été ajouté ou amélioré dans l’application : un nouveau module, une nouvelle fonction, une amélioration importante. Ce que vous n’avez pas encore vu est repéré, et les ajouts des 7 derniers jours ont un bouton pour les essayer.',
  regles: 'Ce qui vient de changer dans les règles qui peuvent vous concerner : emploi, formation, aides, logement, santé. Chaque changement donne sa date et renvoie au texte officiel quand il existe. Vous pouvez filtrer par type, par date et par cadre, ou chercher un mot.',
  chiffres: 'Les chiffres clés du moment : les prix, les salaires et l’emploi, chez vous (Dordogne, Haute-Vienne), en Nouvelle-Aquitaine et en France. Chaque fiche donne ses chiffres avec leur source, et renvoie vers « Comprendre les chiffres » pour les comparer.',
  corriges: 'Les problèmes qui ont été signalés ou que nous avons trouvés, et qui sont maintenant corrigés. Pour chacun : ce qui n’allait pas, et ce qui a été corrigé.'
};
// Sur téléphone, les quatre entrées sont de simples pastilles : le nom de celle qui est choisie s'écrit au-dessus de la liste (caché sur ordinateur, où les boutons portent leur nom).
function _nvMajTitreEntree() {
  var t = document.getElementById('nvTitreEntree');
  if (!t) { return; }
  var e = _NV_ENTREES_AFFICHAGE[_nvEntree];
  if (!e) { t.hidden = true; t.innerHTML = ''; return; }
  t.hidden = false;
  t.className = 'nv-titre-entree nv-entree--' + e.couleur;
  t.innerHTML = '<i class="bi ' + e.icone + '" aria-hidden="true"></i>' + e.titre;
}

function _nvPanneauChoix() {
  return '<h2 class="nv-choix-titre">Que voulez-vous regarder ?</h2>' +
    '<p class="nv-intro">Cette page a quatre parties. Choisissez celle qui vous intéresse avec l’un des quatre boutons ci-dessus.</p>' +
    NV_ENTREES.map(function (cle) {
      var e = _NV_ENTREES_AFFICHAGE[cle];
      return '<div class="nv-explic nv-entree--' + e.couleur + '"><div class="nv-explic-titre"><i class="bi ' + e.icone + '" aria-hidden="true"></i> ' + e.titre + '</div><p class="mb-0">' + _NV_EXPLICATIONS[cle] + '</p></div>';
    }).join('') +
    '<div class="nv-neuf" id="nvNeuf"><p class="mb-2">Vous voulez retrouver les « Nouveau » comme à votre première visite ?</p>' +
    '<button type="button" class="nv-btn-ovale" id="nvRemettreNeuf"><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Tout remettre à neuf</button></div>';
}

// Entrée 1 : la liste des ajouts de l'application, avec sa barre de filtres (consigne 418, lot 2 ; maquette docs/MAQUETTE_NOUVEAUTES_FILTRES_ET_DEJA_VU_2026-11-16.html).
// Les filtres ne durent que pendant la visite (jamais mémorisés) ; la barre démarre repliée sur téléphone. Un élément « déjà vu » est masqué par défaut mais se retrouve avec « Tout l'historique ».
var _NV_AUTRE_CARTE = 'Ailleurs dans l’application';
var _NV_LIB_PERIODE = { '7': '7 derniers jours', '30': '30 derniers jours', '90': '3 derniers mois', 'tout': 'Toute la période' };
var _nvFiltres = { appli: { montrer: 'tout', periode: 'tout', carte: '*', plie: true } };   // repliés à l'arrivée, sur tous les écrans : seule la personne les déplie (consigne 424)

function _nvCarteDe(n) { return n.carte || _NV_AUTRE_CARTE; }
// Pas encore vu avant cette visite (instantané pris à l'ouverture de l'entrée).
function _nvEstNeuf(n) { return !!(_nvInstantane.appli && _nvInstantane.appli[nvCleElement('appli', n)]); }
function _nvPeriodeOk(n, periode, auj) { if (periode === 'tout') { return true; } var a = nvAgeJours(n.date, auj); return a !== null && a < Number(periode); }

function _nvBoutonFiltre(groupe, valeur, texte, actif, nombre) {
  return '<button type="button" class="nv-f-btn" aria-pressed="' + actif + '" data-nv-g="' + groupe + '" data-nv-v="' + _nvEchap(valeur) + '"' + (nombre === 0 && !actif ? ' disabled' : '') + '>' +
    _nvEchap(texte) + (nombre !== undefined && nombre !== null ? '<span class="nv-f-n">' + nombre + '</span>' : '') + '</button>';
}

// Une ligne qui dit ce que le filtre applique : visible quand la barre est repliée.
function _nvResumeFiltres(f) {
  return [f.montrer === 'nonvus' ? 'Pas encore vu' : 'Tout l’historique', _NV_LIB_PERIODE[f.periode] || _NV_LIB_PERIODE.tout, f.carte === '*' ? 'Toutes les cartes' : f.carte].join(' · ');
}

function _nvPanneauAppli() {
  var auj = new Date(), f = _nvFiltres.appli, toutes = _nvListeEntree('appli');
  var base = toutes.filter(function (n) { return (f.montrer === 'tout' || _nvEstNeuf(n)) && _nvPeriodeOk(n, f.periode, auj); });
  var cartes = {};
  base.forEach(function (n) { var k = _nvCarteDe(n); cartes[k] = (cartes[k] || 0) + 1; });
  var liste = base.filter(function (n) { return f.carte === '*' || _nvCarteDe(n) === f.carte; });
  var nbNeufs = toutes.filter(_nvEstNeuf).length;
  var parDefaut = f.montrer === 'tout' && f.periode === 'tout' && f.carte === '*';
  var tousVus = f.montrer === 'nonvus' && f.periode === 'tout' && f.carte === '*';
  var corpsFiltres =
    '<div class="nv-f-rang"><span class="nv-f-lib">Afficher</span>' + _nvBoutonFiltre('montrer', 'tout', 'Tout l’historique', f.montrer === 'tout', toutes.length) + _nvBoutonFiltre('montrer', 'nonvus', 'Ce que je n’ai pas encore vu', f.montrer === 'nonvus', nbNeufs) + '</div>' +
    '<div class="nv-f-rang"><span class="nv-f-lib">Période</span>' + ['7', '30', '90', 'tout'].map(function (p) { return _nvBoutonFiltre('periode', p, _NV_LIB_PERIODE[p], f.periode === p); }).join('') + '</div>' +
    '<div class="nv-f-rang"><span class="nv-f-lib">Où le trouver</span>' + _nvBoutonFiltre('carte', '*', 'Toutes les cartes', f.carte === '*', base.length) +
      Object.keys(cartes).sort(function (a, b) { return cartes[b] - cartes[a]; }).concat(f.carte !== '*' && !cartes[f.carte] ? [f.carte] : []).map(function (k) { return _nvBoutonFiltre('carte', k, k, f.carte === k, cartes[k] || 0); }).join('') + '</div>';
  var barre = '<div class="nv-filtres' + (f.plie ? ' nv-plie' : '') + '" role="group" aria-label="Filtrer les nouveautés">' +
    '<div class="nv-f-tete"><div class="nv-filtres-titre"><i class="bi bi-funnel" aria-hidden="true"></i> Filtrer les nouveautés</div>' +
      '<button type="button" class="nv-f-plier" id="nvPlier" aria-expanded="' + !f.plie + '" aria-controls="nvFCorps"><i class="bi ' + (f.plie ? 'bi-chevron-down' : 'bi-chevron-up') + '" aria-hidden="true"></i> ' + (f.plie ? 'Déplier' : 'Replier') + '</button></div>' +
    (f.plie ? '<p class="nv-f-resume">' + _nvEchap(_nvResumeFiltres(f)) + '</p>' : '') +
    '<div class="nv-f-corps" id="nvFCorps"' + (f.plie ? ' hidden' : '') + '>' + corpsFiltres + '</div>' +
    '<div class="nv-f-resultat"><span aria-live="polite"><strong>' + liste.length + '</strong> nouveauté' + (liste.length > 1 ? 's' : '') + ' affichée' + (liste.length > 1 ? 's' : '') + ' sur ' + toutes.length + '</span>' +
    '<button type="button" class="nv-f-reinit" id="nvReinit"' + (parDefaut ? ' hidden' : '') + '><i class="bi bi-x-circle" aria-hidden="true"></i> Tout réinitialiser</button></div></div>';
  var corps = nvGrouperParMois(liste, auj).map(function (g) {
    return '<h2 class="nv-mois">' + _nvEchap(g.mois) + '</h2>' + g.items.map(function (n) {
      var recent = nvEstNouveau(n, auj);   // moins de 7 jours : le bouton « Essayer » reste proposé
      var neuf = _nvEstNeuf(n);            // pas encore vu avant cette visite : « Nouveau »
      return '<div class="nv-carte' + (neuf ? '' : ' nv-carte--vue') + '"><div class="nv-tete"><span class="nv-date">' + _nvEchap(nvDateFr(n.date)) + '</span>' +
        (neuf ? '<span class="nv-nouveau">Nouveau</span>' : '<span class="nv-vu-badge"><i class="bi bi-check2" aria-hidden="true"></i> Déjà vu</span>') + '</div>' +
        '<div class="nv-titre">' + _nvEchap(n.titre) + '</div><p class="mb-2">' + _nvEchap(n.texte) + '</p>' +
        (!recent && n.carte ? '<p class="nv-ou mb-0"><i class="bi bi-signpost-2" aria-hidden="true"></i> Vous trouverez ce module dans la carte « ' + _nvEchap(n.carte) + ' » de l’accueil.</p>' : '') +
        (!recent && !n.carte && n.lieu ? '<p class="nv-ou mb-0"><i class="bi bi-signpost-2" aria-hidden="true"></i> Vous le trouverez ' + _nvEchap(n.lieu) + '.</p>' : '') +
        (recent && n.route ? '<button type="button" class="btn btn-sm btn-outline-primary" data-nv-route="' + _nvEchap(n.route) + '">' + (n.icone ? '<i class="bi ' + _nvEchap(n.icone) + '" aria-hidden="true"></i> ' : '') + 'Essayer : ' + _nvEchap(n.module || 'ouvrir') + '</button>' : '') + '</div>';
    }).join('');
  }).join('');
  if (!liste.length) {
    corps = '<div class="nv-vide"><p class="mb-2"><i class="bi bi-' + (tousVus ? 'check-circle' : 'funnel') + '" aria-hidden="true"></i> <strong>' +
      (tousVus ? 'Vous avez tout vu : rien de nouveau depuis votre dernière visite.' : 'Aucune nouveauté ne correspond à ce filtre.') + '</strong></p>' +
      '<button type="button" class="nv-btn-ovale" data-nv-reinit="1"><i class="bi bi-x-circle" aria-hidden="true"></i> Tout afficher</button></div>';
  }
  return '<p class="nv-intro">Les mises à jour, les ajouts et les améliorations importantes de l’application. Tout est affiché : ce que vous n’avez pas encore vu porte la mention « Nouveau », ce que vous avez déjà vu porte « Déjà vu ». Dans le filtre, vous pouvez ne garder que ce que vous n’avez pas encore vu. Les ajouts des 7 derniers jours ont un bouton pour les essayer.</p>' +
    _nvSignaler('Nouveautés de l’application (nouveautes)', 'Un problème avec une nouveauté ? Signalez-le : cela aide les autres.') +
    barre + corps;
}

// « Tout remettre à neuf » : la mémoire du vu repart de zéro (comme à la première visite : seuls les 7 derniers jours redeviennent « Nouveau »), les filtres aussi. Aucune fenêtre : la phrase se change sur place.
function _nvRemettreANeuf() {
  _nvMemoire = nvMemoireNeuve(new Date());
  _nvInstantane = {};
  _nvSauverMemoire();
  _nvFiltres.appli = { montrer: 'tout', periode: 'tout', carte: '*', plie: _nvFiltres.appli.plie };
  _nvFiltres.regles = _nvFiltresReglesNeufs(_nvFiltres.regles.plie);
  _nvFiltres.chiffres = _nvFiltresReglesNeufs(_nvFiltres.chiffres.plie);
  _nvNbRegles = null;
  _nvNbChiffres = null;
  nvMajPastille();
  var nb = { appli: _nvNbAppli(), corriges: _nvNbCorriges() };
  ['appli', 'corriges'].forEach(function (cle) { var c = document.querySelector('[data-nv-compte="' + cle + '"]'); if (c) { c.outerHTML = _nvCompteHtml(cle, nb[cle]); } });
  _nvLireNombreRegles();   // le nombre des règles et la pastille se mettent à jour dès que la lecture est faite
  _nvLireNombreChiffres();
  var z = document.getElementById('nvNeuf');
  if (z) { z.innerHTML = '<p class="mb-0" role="status"><i class="bi bi-check-circle" aria-hidden="true"></i> <strong>C’est fait.</strong> Les nouveautés des 7 derniers jours sont de nouveau signalées « Nouveau ».</p>'; }
}

// Redessine seulement la liste de l'entrée « application » (la page ne bouge pas) et rend le focus au bouton qui vient d'être pressé.
function _nvRedessinerAppli(groupe, valeur) {
  var zone = document.getElementById('nvPanneau');
  if (!zone || _nvEntree !== 'appli') { return; }
  var y = window.pageYOffset;   // on reste où l'on est : jamais renvoyé en haut de la page (consigne 424)
  zone.innerHTML = _nvPanneauAppli();
  _nvBrancherPanneau(zone);
  var b = groupe ? zone.querySelector('[data-nv-g="' + groupe + '"][data-nv-v="' + valeur + '"]') : zone.querySelector('#nvPlier');
  if (b && !b.disabled) { b.focus({ preventScroll: true }); }
  window.scrollTo(0, y);
}

// Le rectangle du filtre se plie et se déplie d'un clic n'importe où dessus (consigne 441, 17/11/2026), exactement comme le bouton « Déplier » / « Replier », qui reste. Ne comptent pas : la barre de recherche
// et tout ce qui a sa propre fonction (boutons de filtre, liens, champs). Même mécanique pour les trois entrées qui ont un filtre.
function _nvRectangleFiltre(zone, basculer) {
  var barre = zone.querySelector('.nv-filtres');
  if (!barre) { return; }
  barre.addEventListener('click', function (e) {
    if (e.target.closest('button, input, a, label, select, textarea, .nv-f-recherche')) { return; }
    basculer();
  });
}

// Boutons d'un panneau : « Essayer », « Ouvrir Comprendre le cadre » et, pour l'entrée « application », la barre de filtres.
function _nvBrancherPanneau(zone) {
  zone.querySelectorAll('[data-nv-route]').forEach(function (b) {
    b.addEventListener('click', function () { nvEssayer(b.getAttribute('data-nv-route')); });
  });
  var neuf = zone.querySelector('#nvRemettreNeuf');
  if (neuf) { neuf.addEventListener('click', _nvRemettreANeuf); }
  var vers = zone.querySelector('[data-nv-ouvrir-cadre]');
  if (vers) { vers.addEventListener('click', function () { if (typeof comprendreLeCadreOuvrirAccueil === 'function') { comprendreLeCadreOuvrirAccueil(); } }); }
  var versChiffres = zone.querySelector('[data-nv-ouvrir-chiffres]');
  if (versChiffres) { versChiffres.addEventListener('click', function () { if (typeof comprendreLesChiffresOuvrirCarte === 'function') { comprendreLesChiffresOuvrirCarte(''); } }); }
  if (_nvEntree !== 'appli') { return; }
  zone.querySelectorAll('[data-nv-g]').forEach(function (b) {
    b.addEventListener('click', function () { var g = b.getAttribute('data-nv-g'), v = b.getAttribute('data-nv-v'); _nvFiltres.appli[g] = v; _nvRedessinerAppli(g, v); });
  });
  var pl = zone.querySelector('#nvPlier');
  if (pl) { pl.addEventListener('click', function () { _nvFiltres.appli.plie = !_nvFiltres.appli.plie; _nvRedessinerAppli(null); }); }
  _nvRectangleFiltre(zone, function () { _nvFiltres.appli.plie = !_nvFiltres.appli.plie; _nvRedessinerAppli(null); });
  zone.querySelectorAll('#nvReinit, [data-nv-reinit]').forEach(function (re) {
    re.addEventListener('click', function () { var plie = _nvFiltres.appli.plie; _nvFiltres.appli = { montrer: 'tout', periode: 'tout', carte: '*', plie: plie }; _nvRedessinerAppli(null); });
  });
}

// Entrée 2 : « Droits et règles », les fiches nouvelles ou mises à jour et les changements officiels, lus dans « Comprendre le cadre » (mêmes cartes, jamais copiées) avec sa barre de filtres
// (consigne 418, lot 3 ; maquette docs/MAQUETTE_NOUVEAUTES_FILTRES_ET_DEJA_VU_2026-11-16.html). Tout est affiché au départ (consigne 420) ; ce qui est À VENIR reste en tête de la liste.
// Les 6 derniers mois sont lus d'abord ; les mois plus anciens sont lus juste après, en arrière-plan : rien ne disparaît avec le temps.
var _NV_LIB_PERIODE_REGLES = { 'avenir': 'À venir', '7': '7 derniers jours', '30': '30 derniers jours', '60': '60 derniers jours', 'anciens': 'Plus anciens', 'tout': 'Toute la période' };
var _NV_LIB_GENRE = { '*': 'Tout', nouvelle: 'Nouvelles fiches', maj: 'Fiches mises à jour', officiel: 'Changements officiels' };
var _NV_LIB_GENRE_PASTILLE = { nouvelle: 'Nouvelle fiche', maj: 'Fiche mise à jour', officiel: 'Changement officiel' };
var _NV_NB_CADRES_VISIBLES = 8;
var _NV_PAS_REGLES = 20;
function _nvFiltresReglesNeufs(plie) { return { montrer: 'tout', genre: '*', periode: 'tout', date: '', dateLib: '', cadre: '*', tousCadres: false, q: '', limite: _NV_PAS_REGLES, plie: plie }; }
_nvFiltres.regles = _nvFiltresReglesNeufs(true);
_nvFiltres.chiffres = _nvFiltresReglesNeufs(true);
// Les deux entrées « liste filtrable » (règles, chiffres) partagent UNE SEULE mécanique (barre de filtres, pastilles, « Déjà vu », « Voir les suivants ») : seuls ces textes et le dessin d'une carte diffèrent.
var _NV_LISTES = {
  regles: { filtre: 'les droits et les règles', libCadre: 'Cadre', toutCadre: 'Tous les cadres', genres: ['nouvelle', 'maj', 'officiel'], recherche: 'Chercher un mot (Smic, APL, CPF…)', ariaRecherche: 'Chercher dans les droits et les règles',
    vusTout: 'Vous avez tout vu : aucune fiche ni aucun changement nouveau depuis votre dernière visite.', nomCadre: function (c) { return _nvNomCadre(c); } },
  chiffres: { filtre: 'les chiffres', libCadre: 'Sujet', toutCadre: 'Tous les sujets', genres: ['nouvelle', 'maj'], recherche: 'Chercher un mot (chômage, Smic, prix…)', ariaRecherche: 'Chercher dans les chiffres',
    vusTout: 'Vous avez tout vu : aucune fiche nouvelle ni mise à jour depuis votre dernière visite.', nomCadre: function (c) { return (typeof COMPRENDRE_LES_CHIFFRES_SUJETS_FICHES !== 'undefined' && COMPRENDRE_LES_CHIFFRES_SUJETS_FICHES[c]) || c; } }
};
function _nvEstListe() { return _nvEntree === 'regles' || _nvEntree === 'chiffres'; }
// elements : la liste lue (null avant la lecture) ; complet : vrai quand les mois plus anciens ont aussi été lus.
var _nvRegles = { elements: null, complet: false };
// Les fiches « Chiffres » lues (null avant la lecture).
var _nvChiffres = { elements: null };

// Chaque élément reçoit son cadre : le rayon d'une fiche, ou le cadre où la table range le domaine d'un changement officiel.
function _nvPreparerRegles(liste) {
  return (liste || []).map(function (e) {
    var copie = {}; Object.keys(e).forEach(function (k) { copie[k] = e[k]; });
    copie.cadre = e.type === 'fiche' ? e.rayon : nvCadreDuDomaine(e.domaine);
    return copie;
  });
}
function _nvNomCadre(cle) {
  if (NV_CADRES_A_PART[cle]) { return NV_CADRES_A_PART[cle]; }
  var r = typeof comprendreLeCadreInfosRayon === 'function' ? comprendreLeCadreInfosRayon(cle) : null;
  return r ? r.titre : cle;
}
function _nvIconeCadre(cle) {
  var r = typeof comprendreLeCadreInfosRayon === 'function' ? comprendreLeCadreInfosRayon(cle) : null;
  return r && r.icone ? r.icone : 'bi-folder';
}
function _nvEstNeufRegles(e) { var ent = e && e.type === 'chiffres' ? 'chiffres' : 'regles'; return !!(_nvInstantane[ent] && _nvInstantane[ent][nvCleElement(ent, e)]); }

function _nvResumeFiltresRegles(f) {
  var cfg = _NV_LISTES[_nvEntree] || _NV_LISTES.regles;
  var m = [f.montrer === 'nonvus' ? 'Pas encore vu' : 'Tout l’historique', _NV_LIB_GENRE[f.genre] || _NV_LIB_GENRE['*'], f.date ? 'Le ' + f.dateLib : (_NV_LIB_PERIODE_REGLES[f.periode] || _NV_LIB_PERIODE_REGLES.tout), f.cadre === '*' ? cfg.toutCadre : cfg.nomCadre(f.cadre)];
  if (f.q) { m.push('« ' + f.q + ' »'); }
  return m.join(' · ');
}

// Le bouton « Signaler une erreur ou un changement » est celui des fiches de « Comprendre le cadre » (drapeau, ambre, à droite) : jamais une autre forme (consigne 424).
function _nvSignaler(page, phrase) {
  if (typeof comprendreLeCadreRenduBoutonSignaler === 'function') { return comprendreLeCadreRenduBoutonSignaler(page, phrase, true); }
  return '<p class="text-end"><button type="button" class="btn btn-sm" data-signaler-probleme="1" data-signaler-page="' + _nvEchap(page) + '"><i class="bi bi-flag"></i> Signaler une erreur ou un changement</button></p>';
}

function _nvPastilleVu(neuf) {
  return neuf ? '<span class="nv-nouveau" data-pastille="nouveau" data-valeur="1">Nouveau</span>' : '<span class="nv-vu-badge"><i class="bi bi-check2" aria-hidden="true"></i> Déjà vu</span>';
}

// Le corps de l'entrée : barre de filtres, compte, recherche, liste du plus proche à venir au plus ancien. Appelé à chaque changement de filtre (la page ne bouge pas).
function _nvCorpsRegles() {
  var ent = _nvEntree, cfg = _NV_LISTES[ent] || _NV_LISTES.regles, f = _nvFiltres[ent], toutes = (ent === 'chiffres' ? _nvChiffres.elements : _nvRegles.elements) || [], aujIso = comprendreLeCadreAujourdhui();
  var libelles = { cadre: {}, genre: _NV_LIB_GENRE_PASTILLE };
  toutes.forEach(function (e) { libelles.cadre[e.cadre] = cfg.nomCadre(e.cadre); });
  var ctx = { aujIso: aujIso, estNeuf: _nvEstNeufRegles, libelles: libelles };
  var liste = nvReglesFiltrer(toutes, f, ctx);
  var avantGenre = nvReglesFiltrer(toutes, f, ctx, 'genre'), avantCadre = nvReglesFiltrer(toutes, f, ctx, 'cadre'), avantPeriode = nvReglesFiltrer(toutes, f, ctx, 'periode');
  var nbGenre = { nouvelle: 0, maj: 0, officiel: 0, avenir: 0 };
  avantGenre.forEach(function (e) { nbGenre[e.genre]++; });
  var nbCadre = {};
  avantCadre.forEach(function (e) { nbCadre[e.cadre] = (nbCadre[e.cadre] || 0) + 1; });
  // Les vrais cadres d'abord (les plus fournis en tête), puis les deux cadres qui n'existent que pour ce filtre.
  var ordre = Object.keys(nbCadre).sort(function (a, b) {
    var pa = NV_CADRES_A_PART[a] ? 1 : 0, pb = NV_CADRES_A_PART[b] ? 1 : 0;
    return pa !== pb ? pa - pb : nbCadre[b] - nbCadre[a];
  });
  var visibles = f.tousCadres ? ordre : ordre.slice(0, _NV_NB_CADRES_VISIBLES);
  if (f.cadre !== '*' && visibles.indexOf(f.cadre) === -1) { visibles.push(f.cadre); }
  var nbPeriode = function (p) { return avantPeriode.filter(function (e) { return nvReglesDansPeriode(e, p, aujIso); }).length; };
  var parDefaut = f.montrer === 'tout' && f.genre === '*' && f.periode === 'tout' && !f.date && f.cadre === '*' && !f.q;
  var tousVus = f.montrer === 'nonvus' && f.genre === '*' && f.periode === 'tout' && !f.date && f.cadre === '*' && !f.q;
  var nbNeufs = toutes.filter(_nvEstNeufRegles).length;
  var filtres = '<div class="nv-filtres' + (f.plie ? ' nv-plie' : '') + '" role="group" aria-label="Filtrer ' + cfg.filtre + '">' +
    '<div class="nv-f-tete"><div class="nv-filtres-titre"><i class="bi bi-funnel" aria-hidden="true"></i> Filtrer ' + cfg.filtre + '</div>' +
      '<button type="button" class="nv-f-plier" id="nvPlier" aria-expanded="' + !f.plie + '" aria-controls="nvFCorps"><i class="bi ' + (f.plie ? 'bi-chevron-down' : 'bi-chevron-up') + '" aria-hidden="true"></i> ' + (f.plie ? 'Déplier' : 'Replier') + '</button></div>' +
    (f.plie ? '<p class="nv-f-resume">' + _nvEchap(_nvResumeFiltresRegles(f)) + '</p>' : '') +
    '<div class="nv-f-corps" id="nvFCorps"' + (f.plie ? ' hidden' : '') + '>' +
      '<div class="nv-f-rang"><span class="nv-f-lib">Afficher</span>' + _nvBoutonFiltre('montrer', 'tout', 'Tout l’historique', f.montrer === 'tout', toutes.length) + _nvBoutonFiltre('montrer', 'nonvus', 'Ce que je n’ai pas encore vu', f.montrer === 'nonvus', nbNeufs) + '</div>' +
      '<div class="nv-f-rang"><span class="nv-f-lib">Quoi</span>' + _nvBoutonFiltre('genre', '*', 'Tout', f.genre === '*', avantGenre.length) +
        cfg.genres.map(function (g) { return _nvBoutonFiltre('genre', g, _NV_LIB_GENRE[g], f.genre === g, nbGenre[g]); }).join('') + '</div>' +
      '<div class="nv-f-rang"><span class="nv-f-lib">Date</span>' + (f.date ? '<button type="button" class="nv-f-btn nv-f-btn--jour" aria-pressed="true" data-nv-g="date" data-nv-v="" title="Retirer ce jour">Le ' + _nvEchap(f.dateLib) + ' <i class="bi bi-x-lg" aria-hidden="true"></i></button>' : '') +
        ['avenir', '7', '30', '60', 'anciens', 'tout'].map(function (p) { return _nvBoutonFiltre('periode', p, _NV_LIB_PERIODE_REGLES[p], f.periode === p && !f.date, nbPeriode(p)); }).join('') + '</div>' +
      '<div class="nv-f-rang"><span class="nv-f-lib">' + cfg.libCadre + '</span>' + _nvBoutonFiltre('cadre', '*', cfg.toutCadre, f.cadre === '*', avantCadre.length) +
        visibles.map(function (k) { return _nvBoutonFiltre('cadre', k, cfg.nomCadre(k), f.cadre === k, nbCadre[k] || 0); }).join('') +
        (ordre.length > _NV_NB_CADRES_VISIBLES ? '<button type="button" class="nv-f-btn" id="nvTousCadres">' + (f.tousCadres ? 'Moins de cadres' : 'Voir les ' + (ordre.length - _NV_NB_CADRES_VISIBLES) + ' autres cadres') + '</button>' : '') + '</div>' +
    '</div>' +
    '<div class="nv-f-resultat nv-f-resultat--3"><span aria-live="polite"><strong>' + liste.length + '</strong> élément' + (liste.length > 1 ? 's' : '') + ' affiché' + (liste.length > 1 ? 's' : '') + '</span>' +
      '<span class="nv-f-recherche"><i class="bi bi-search" aria-hidden="true"></i><input type="search" id="nvQ" value="' + _nvEchap(f.q) + '" placeholder="' + _nvEchap(cfg.recherche) + '" aria-label="' + _nvEchap(cfg.ariaRecherche) + '" autocomplete="off">' +
        (f.q ? '<button type="button" class="nv-f-effacer" id="nvQEffacer" aria-label="Effacer la recherche"><i class="bi bi-x-lg" aria-hidden="true"></i></button>' : '') + '</span>' +
      '<button type="button" class="nv-f-reinit" id="nvReinit"' + (parDefaut ? ' hidden' : '') + '><i class="bi bi-x-circle" aria-hidden="true"></i> Tout réinitialiser</button></div></div>' +
    (ent === 'chiffres' || _nvRegles.complet ? '' : '<p class="small text-muted mb-2" id="nvChargeAnciens"><i class="bi bi-hourglass-split" aria-hidden="true"></i> Lecture des mois plus anciens en cours…</p>');
  var montres = liste.slice(0, f.limite), cleCourante = '', corps = '';
  montres.forEach(function (e) {
    var av = nvReglesAvenir(e, aujIso), cle = av ? 'avenir' : e.date.slice(0, 7);
    if (cle !== cleCourante) {
      cleCourante = cle;
      corps += '<h2 class="nv-mois' + (av ? ' nv-mois--avenir' : '') + '">' + (av ? '<i class="bi bi-hourglass-split" aria-hidden="true"></i>À venir' : _nvEchap(nvMoisFr(e.date))) + '</h2>';
    }
    corps += ent === 'chiffres' ? _nvRenduFicheChiffres(e, _nvPastilleVu(_nvEstNeufRegles(e))) : comprendreLeCadreRenduElement(e, aujIso, _nvPastilleVu(_nvEstNeufRegles(e)));
  });
  if (liste.length > f.limite) {
    corps += '<div class="text-center my-3"><button type="button" class="nv-btn-ovale" id="nvPlus"><i class="bi bi-plus-circle" aria-hidden="true"></i> Voir les ' + Math.min(_NV_PAS_REGLES, liste.length - f.limite) + ' suivants (' + (liste.length - f.limite) + ' restants)</button></div>';
  }
  if (!liste.length) {
    corps = '<div class="nv-vide"><p class="mb-2"><i class="bi bi-' + (f.q ? 'search' : (tousVus ? 'check-circle' : 'funnel')) + '" aria-hidden="true"></i> <strong>' +
      (f.q ? 'Rien trouvé pour « ' + _nvEchap(f.q) + ' » avec ces filtres.' : (tousVus ? cfg.vusTout : 'Rien ne correspond à ce filtre.')) + '</strong></p>' +
      '<button type="button" class="nv-btn-ovale" data-nv-reinit="1"><i class="bi bi-x-circle" aria-hidden="true"></i> Tout afficher</button></div>';
  }
  return filtres + corps;
}

function _nvPanneauRegles() {
  return '<p class="nv-intro">Les fiches nouvelles ou mises à jour et les changements officiels (emploi, formation, aides, logement, santé), rangés par date et par cadre. Ce qui est à venir est toujours en tête. Rien ne disparaît avec le temps : « Plus anciens » les garde tous.</p>' +
    _nvSignaler('Nouveautés, Droits et règles (nouveautes)', 'Un filtre ou un affichage qui ne fonctionne pas, une erreur dans une fiche ? Dites-le nous : cela aide les autres.') +
    '<div id="nvReglesCorps"><p class="text-center text-muted">Chargement…</p></div>' +
    (typeof comprendreLeCadreEncartSource === 'function' ? comprendreLeCadreEncartSource() : '') +
    '<div class="nv-invitation"><p class="mb-2">Envie de lire les fiches en entier, rayon par rayon, ou les changements trimestre par trimestre ?</p>' +
    '<button type="button" class="nv-btn-ovale" data-nv-ouvrir-cadre="1"><i class="bi bi-compass" aria-hidden="true"></i> Ouvrir « Comprendre le cadre »</button></div>';
}

function _nvPanneauChiffres() {
  return '<p class="nv-intro">Les chiffres clés du moment (prix, salaires, emploi), avec leur source, rangés par date. Ce qui est à venir est toujours en tête. Pour comprendre ce qu’ils veulent dire et les comparer, ouvrez « Comprendre les chiffres ».</p>' +
    _nvSignaler('Nouveautés, Chiffres (nouveautes)', 'Un filtre ou un affichage qui ne fonctionne pas, un chiffre qui semble faux ? Dites-le nous : cela aide les autres.') +
    '<div id="nvReglesCorps"><p class="text-center text-muted">Chargement…</p></div>' +
    '<div class="nv-invitation"><p class="mb-2">Envie de comparer ces chiffres, de voir leur évolution ou de comprendre comment les lire ?</p>' +
    '<button type="button" class="nv-btn-ovale" data-nv-ouvrir-chiffres="1"><i class="bi bi-bar-chart" aria-hidden="true"></i> Ouvrir « Comprendre les chiffres »</button></div>';
}

// Territoire affiché au départ dans une fiche : celui que la personne a choisi dans la page ; sinon son département déjà choisi ailleurs dans l'application (jamais redemandé ici) ; sinon la France.
function _nvTerritoirePour(e) {
  var terr = e.territoires || [];
  if (!terr.length) { return 'tous'; }
  var voulu = _nvTerritoire;
  if (!voulu && typeof departementRessourcesMemorise === 'function') { var dep = departementRessourcesMemorise(); voulu = dep === '24' ? 'dordogne' : (dep === '87' ? 'haute-vienne' : null); }
  if (!voulu) { voulu = 'france'; }
  return terr.indexOf(voulu) !== -1 ? voulu : terr[0];
}
// Le bouton du haut d'une fiche « Chiffres » : « Lire la fiche en entier » / « Revenir au résumé » (fiche à venir : « Lire plus d’informations » / « Replier le texte »). Celui du bas replie toute la fiche.
function _nvLibLire(lire, ouvert) { return lire.getAttribute(ouvert ? 'data-nv-lib-ouvert' : 'data-nv-lib-ferme') || (ouvert ? 'Revenir au résumé' : 'Lire la fiche en entier'); }
function _nvTableChiffres(rows) {
  return rows && rows.length ? '<table class="nv-chf-tab">' + rows.map(function (r) { return '<tr><td>' + _nvEchap(r[0]) + '</td><td class="v">' + _nvEchap(r[1]) + '</td></tr>'; }).join('') + '</table>' : '';
}
function _nvSourcesChiffres(sources) {
  return (sources || []).map(function (s) {
    return '<div class="nv-chf-src"><span>' + _nvEchap(s.texte) + '</span>' + (s.url ? '<a class="nv-chf-srcb" href="' + _nvEchap(s.url) + '" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Ouvrir la page</a>' : '') + '</div>';
  }).join('');
}
// Le texte entier d'une fiche pour un territoire : le tableau, les sources (chacune cliquable), la note, le lien vers le module, puis Signaler et Replier.
function _nvEntiereChiffres(e, p) {
  var replier = typeof comprendreLeCadreBoutonReplierHtml === 'function' ? comprendreLeCadreBoutonReplierHtml('Replier la fiche') : '';
  var plus = (p.plus || []).map(function (t) { return '<p>' + _nvEchap(t) + '</p>'; }).join('') + (p.plus && p.rows && p.rows.length && p.plusTitre ? '<h3 class="h6 mt-3 mb-2">' + _nvEchap(p.plusTitre) + '</h3>' : '');
  return plus + _nvTableChiffres(p.rows) + _nvSourcesChiffres(p.sources) + (e.note ? '<p class="small text-muted">' + _nvEchap(e.note) + '</p>' : '') +
    '<div class="comprendre-le-cadre-encart mt-3 text-center"><p class="small mb-2">' + _nvEchap(e.vers.aide) + '</p>' +
    '<button type="button" class="nv-chf-vers" data-nv-chf-vers="' + _nvEchap(e.ancre || '') + '"><i class="bi bi-bar-chart" aria-hidden="true"></i> Voir ' + _nvEchap(e.vers.libelle) + ' dans « Comprendre les chiffres »</button></div>' +
    _nvSignaler('Chiffres « ' + String(e.titre).slice(0, 80) + ' » (nouveautés)', 'Un chiffre qui semble faux, une source qui ne s’ouvre pas ? Dites-le nous : cela aide les autres.') + replier;
}
// Une fiche « Chiffres » : la carte de « Droits et règles » (mêmes classes, mêmes pastilles, même bouton « Lire la fiche en entier »), au fond turquoise.
function _nvRenduFicheChiffres(e, vuHtml) {
  var dateLib = nvDateFr(e.date), avenir = e.genre === 'avenir', coul = e.genre === 'nouvelle' ? 'v' : (e.genre === 'maj' ? 'm' : 'a');
  var datePast = '<span class="comprendre-le-cadre-pastille' + (avenir ? ' comprendre-le-cadre-pastille--a' : '') + '" data-pastille="date" data-valeur="' + _nvEchap(e.date) + '" data-libelle="' + _nvEchap(dateLib) + '">' +
    (avenir ? 'À partir du ' : (e.genre === 'nouvelle' ? 'Ajoutée le ' : 'Mise à jour le ')) + _nvEchap(dateLib) + '</span>';
  var pastilles = (avenir ? '' : '<span class="comprendre-le-cadre-pastille comprendre-le-cadre-pastille--' + coul + '" data-pastille="genre" data-valeur="' + e.genre + '">' + _NV_LIB_GENRE_PASTILLE[e.genre] + '</span>') + datePast +
    '<span class="comprendre-le-cadre-pastille" data-pastille="rayon" data-valeur="' + _nvEchap(e.cadre) + '">' + _nvEchap(e.sujetLib) + '</span>' + (vuHtml || '');
  var choisi = _nvTerritoirePour(e), terr = e.territoires || [], barre = '';
  if (terr.length > 1) {
    var lib = {}; (typeof COMPRENDRE_LES_CHIFFRES_TERR_FICHES !== 'undefined' ? COMPRENDRE_LES_CHIFFRES_TERR_FICHES : []).forEach(function (t) { lib[t.cle] = t.libelle; });
    barre = '<div class="nv-f-rang nv-chf-terr" role="group" aria-label="Choisir le territoire"><span class="nv-f-lib">Chiffres de</span>' + terr.map(function (k) {
      return '<button type="button" class="nv-f-btn" data-nv-terr="' + k + '" aria-pressed="' + (k === choisi) + '">' + _nvEchap(lib[k] || k) + '</button>';
    }).join('') + '</div>';
  }
  var blocs = Object.keys(e.par).map(function (k) {
    var p = e.par[k], resume;
    if (avenir) { resume = '<p class="comprendre-le-cadre-digest-cle mb-2"><strong>Ce qui est prévu.</strong> ' + _nvEchap(p.avenir) + '</p>'; }
    else if (e.genre === 'maj') { resume = '<p class="comprendre-le-cadre-digest-cle mb-2"><strong>Ce qui a changé.</strong> ' + _nvEchap(p.change) + '</p>'; }
    else { resume = (e.quiSert ? '<p class="text-muted mb-2">' + _nvEchap(e.quiSert) + '</p>' : '') + '<p class="comprendre-le-cadre-digest-cle comprendre-le-cadre-digest-cle--bref mb-2"><strong>En bref.</strong> ' + _nvEchap(p.bref) + '</p>'; }
    return '<div data-nv-terr-bloc="' + k + '"' + (k === choisi || k === 'tous' ? '' : ' hidden') + '><div class="comprendre-le-cadre-resume-fiche">' + resume + '</div>' +
      ((avenir && !(p.plus && p.plus.length)) ? _nvEntiereChiffres(e, p) : '<button type="button" class="comprendre-le-cadre-lire-tout" data-nv-chf-lire="1" aria-expanded="false"' + (avenir ? ' data-nv-lib-ferme="Lire plus d’informations" data-nv-lib-ouvert="Replier le texte"' : '') + '><span>' + (avenir ? 'Lire plus d’informations' : 'Lire la fiche en entier') + '</span><i class="bi bi-chevron-down" aria-hidden="true"></i></button>' +
        '<div data-nv-chf-entiere hidden>' + _nvEntiereChiffres(e, p) + '</div>') + '</div>';
  }).join('');
  return '<details class="comprendre-le-cadre-chg comprendre-le-cadre-chg--fiche comprendre-le-cadre-chg--chiffres' + (avenir ? ' comprendre-le-cadre-chg--avenir' : '') + '" data-nv-chf="' + _nvEchap(e.id) + '">' +
    '<summary class="comprendre-le-cadre-chg-resume"><span class="comprendre-le-cadre-chg-pastilles">' + pastilles + '</span><span class="comprendre-le-cadre-chg-titre">' + _nvEchap(e.titre) + '</span><i class="bi bi-chevron-down comprendre-le-cadre-chg-fleche"></i></summary>' +
    '<div class="comprendre-le-cadre-chg-corps">' + barre + blocs + '</div></details>';
}
// Branche les fiches « Chiffres » : « Lire la fiche en entier », « Replier », les pastilles de territoire (un clic change les chiffres de TOUTES les fiches de la page) et le lien vers le module.
function _nvBrancherFichesChiffres(zone) {
  zone.querySelectorAll('details[data-nv-chf]').forEach(function (d) {
    d.querySelectorAll('[data-nv-terr-bloc]').forEach(function (bloc) {
      var lire = bloc.querySelector('[data-nv-chf-lire]'), ent = bloc.querySelector('[data-nv-chf-entiere]');
      if (lire && ent) {
        lire.addEventListener('click', function () {
          var ouvrir = ent.hasAttribute('hidden');
          if (ouvrir) { ent.removeAttribute('hidden'); } else { ent.setAttribute('hidden', ''); }
          lire.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
          lire.firstChild.textContent = _nvLibLire(lire, ouvrir);
        });
        if (typeof comprendreLeCadreBrancherReplier === 'function') { comprendreLeCadreBrancherReplier(ent, lire); }
      } else if (!lire && typeof comprendreLeCadreBrancherReplier === 'function') {   // fiche « à venir » : texte déjà ouvert, un seul niveau ; Replier ferme la carte
        comprendreLeCadreBrancherReplier(bloc, null);
      }
    });
    d.querySelectorAll('[data-nv-terr]').forEach(function (b) {
      b.addEventListener('click', function () { _nvChoisirTerritoire(zone, b.getAttribute('data-nv-terr')); });
    });
    d.querySelectorAll('[data-nv-chf-vers]').forEach(function (b) {
      b.addEventListener('click', function () { if (typeof comprendreLesChiffresOuvrirCarte === 'function') { comprendreLesChiffresOuvrirCarte(b.getAttribute('data-nv-chf-vers')); } });
    });
  });
}
// Change le territoire de toutes les fiches de la page ; une fiche dont le texte entier était ouvert le reste.
function _nvChoisirTerritoire(zone, cle) {
  _nvTerritoire = cle;
  zone.querySelectorAll('details[data-nv-chf]').forEach(function (d) {
    var cible = d.querySelector('[data-nv-terr-bloc="' + cle + '"]');
    d.querySelectorAll('[data-nv-terr]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-nv-terr') === cle)); });
    if (!cible) { return; }
    var visible = d.querySelector('[data-nv-terr-bloc]:not([hidden])');
    if (!visible || visible === cible) { return; }
    var ve = visible.querySelector('[data-nv-chf-entiere]'), etaitOuverte = !!ve && !ve.hasAttribute('hidden');
    visible.setAttribute('hidden', ''); cible.removeAttribute('hidden');
    var ce = cible.querySelector('[data-nv-chf-entiere]'), cl = cible.querySelector('[data-nv-chf-lire]');
    if (ce && cl) {
      if (etaitOuverte) { ce.removeAttribute('hidden'); } else { ce.setAttribute('hidden', ''); }
      cl.setAttribute('aria-expanded', etaitOuverte ? 'true' : 'false');
      cl.firstChild.textContent = _nvLibLire(cl, etaitOuverte);
    }
  });
}

// Redessine seulement le corps de l'entrée (la page ne bouge pas). `groupe`/`valeur` : le bouton pressé, qui garde le focus ; `champ` : la recherche, dont le curseur est gardé.
function _nvRedessinerRegles(groupe, valeur, champ) {
  var zone = document.getElementById('nvReglesCorps');
  if (!zone || !_nvEstListe()) { return; }
  var pos = null, q0 = document.getElementById('nvQ'), y = window.pageYOffset;   // on reste où l'on est : « Voir les 20 suivants » ne renvoie plus en haut (consigne 424)
  if (champ && q0) { pos = q0.selectionStart; }
  zone.innerHTML = _nvCorpsRegles();
  _nvBrancherCorpsRegles(zone);
  if (champ) { var q = document.getElementById('nvQ'); if (q) { q.focus({ preventScroll: true }); if (pos !== null) { q.setSelectionRange(pos, pos); } } window.scrollTo(0, y); return; }
  var b = groupe ? zone.querySelector('[data-nv-g="' + groupe + '"][data-nv-v="' + valeur + '"]') : null;
  if (!b && groupe === null) { b = zone.querySelector('#nvPlier'); }
  if (b && !b.disabled) { b.focus({ preventScroll: true }); }
  window.scrollTo(0, y);
}

// Ce que filtre chaque pastille d'une carte (consigne 422) : un jour précis, « Nouveau », un cadre, le genre (nouvelle fiche / mise à jour).
// Un deuxième clic sur la même pastille retire le filtre. `neutre` = la valeur « pas de filtre » de ce champ.
function _nvCibleFiltre(type, valeur) {
  if (type === 'date') { return { champ: 'date', valeur: valeur, neutre: '' }; }
  if (type === 'genre') { return { champ: 'genre', valeur: valeur, neutre: '*' }; }
  if (type === 'rayon') { return { champ: 'cadre', valeur: valeur, neutre: '*' }; }
  if (type === 'domaine') { return { champ: 'cadre', valeur: nvCadreDuDomaine(valeur), neutre: '*' }; }
  if (type === 'nouveau') { return { champ: 'montrer', valeur: 'nonvus', neutre: 'tout' }; }
  return null;
}
function _nvBrancherPastilles(zone) {
  var f = _nvFiltres[_nvEntree];
  zone.querySelectorAll('[data-pastille]').forEach(function (p) {
    var cible = _nvCibleFiltre(p.getAttribute('data-pastille'), p.getAttribute('data-valeur'));
    if (!cible) { return; }
    var actif = f[cible.champ] === cible.valeur;
    p.classList.add('nv-pastille-filtre');
    if (actif) { p.classList.add('nv-pastille-actif'); }
    p.setAttribute('role', 'button');
    p.setAttribute('tabindex', '0');
    p.setAttribute('aria-pressed', actif ? 'true' : 'false');
    p.setAttribute('title', actif ? 'Retirer ce filtre' : 'Ne montrer que ceci');
    var agir = function (e) {
      e.preventDefault(); e.stopPropagation();   // la pastille est dans l'en-tête d'une carte repliable : elle ne doit pas la plier ni la déplier
      f[cible.champ] = actif ? cible.neutre : cible.valeur;
      if (cible.champ === 'date') { f.dateLib = actif ? '' : (p.getAttribute('data-libelle') || ''); }
      f.limite = _NV_PAS_REGLES;
      _nvRedessinerRegles(null);
      var barre = document.querySelector('.nv-filtres');   // on voit aussitôt le filtre appliqué et le début de la liste
      if (barre) { barre.scrollIntoView({ behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
    };
    p.addEventListener('click', agir);
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { agir(e); } });
  });
}

function _nvBrancherCorpsRegles(zone) {
  var f = _nvFiltres[_nvEntree];
  zone.querySelectorAll('[data-nv-g]').forEach(function (b) {
    b.addEventListener('click', function () { var g = b.getAttribute('data-nv-g'), v = b.getAttribute('data-nv-v'); f[g] = v; if (g === 'periode') { f.date = ''; f.dateLib = ''; } if (g === 'date') { f.dateLib = ''; } f.limite = _NV_PAS_REGLES; _nvRedessinerRegles(g, v); });
  });
  var pl = zone.querySelector('#nvPlier');
  if (pl) { pl.addEventListener('click', function () { f.plie = !f.plie; _nvRedessinerRegles(null); }); }
  _nvRectangleFiltre(zone, function () { f.plie = !f.plie; _nvRedessinerRegles(null); });
  zone.querySelectorAll('#nvReinit, [data-nv-reinit]').forEach(function (re) {
    re.addEventListener('click', function () { _nvFiltres[_nvEntree] = _nvFiltresReglesNeufs(f.plie); _nvRedessinerRegles(null); });
  });
  var q = zone.querySelector('#nvQ');
  if (q) { q.addEventListener('input', function () { f.q = q.value; f.limite = _NV_PAS_REGLES; _nvRedessinerRegles(null, null, true); }); }
  var ef = zone.querySelector('#nvQEffacer');
  if (ef) { ef.addEventListener('click', function () { f.q = ''; f.limite = _NV_PAS_REGLES; _nvRedessinerRegles(null, null, true); }); }
  var tc = zone.querySelector('#nvTousCadres');
  if (tc) { tc.addEventListener('click', function () { f.tousCadres = !f.tousCadres; _nvRedessinerRegles(null); var b2 = document.getElementById('nvTousCadres'); if (b2) { b2.focus({ preventScroll: true }); } }); }
  var plus = zone.querySelector('#nvPlus');
  if (plus) { plus.addEventListener('click', function () { f.limite += _NV_PAS_REGLES; _nvRedessinerRegles(null); }); }
  _nvBrancherPastilles(zone);
  // Une fiche s'ouvre SUR PLACE (son contenu complet, comme dans le module) ; seuls deux boutons, choisis par la personne, mènent ensuite au module, avec « Revenir aux Nouveautés » (consigne 422).
  if (_nvEntree === 'chiffres') { _nvBrancherFichesChiffres(zone); return; }
  if (typeof comprendreLeCadreBrancherElements === 'function') { comprendreLeCadreBrancherElements(zone, { label: 'Nouveautés', route: 'nouveautes', retour: function () { nvOuvrirEntree('regles'); } }); }
}

// Lit les 6 derniers mois et les fiches, marque tout cela « vu » (le « Nouveau » de la visite est gardé dans _nvInstantane), affiche ; puis lit les mois plus anciens et recommence.
function _nvBrancherRegles() {
  var zone = document.getElementById('nvReglesCorps');
  if (!zone) { return; }
  var vide = '<p class="text-center text-muted">Les droits et les règles ne peuvent pas s’afficher pour l’instant. Vous les retrouvez dans « Comprendre le cadre ».</p>';
  if (typeof comprendreLeCadreLireElements !== 'function' || typeof comprendreLeCadreRenduElement !== 'function') { zone.innerHTML = vide; return; }
  var present = function () { return document.getElementById('nvReglesCorps') === zone; };   // la personne a pu changer d'entrée entre-temps
  comprendreLeCadreLireElements(function (liste) {
    if (!present()) { return; }
    if (!liste) { zone.innerHTML = vide; return; }
    _nvRegles.elements = _nvPreparerRegles(liste);
    _nvMarquerEntree('regles', liste);
    _nvRedessinerRegles(undefined);
    if (_nvRegles.complet) { return; }
    comprendreLeCadreLireElements(function (toute) {
      _nvRegles.complet = true;   // un échec de lecture des mois anciens ne bloque rien : on garde les 6 mois
      if (toute) { _nvRegles.elements = _nvPreparerRegles(toute); _nvMarquerEntree('regles', toute); }
      if (present()) { _nvRedessinerRegles(undefined, undefined, document.activeElement && document.activeElement.id === 'nvQ'); }
    }, true);
  });
}

// Lit les fiches « Chiffres » (module « Comprendre les chiffres »), les marque « vues » (le « Nouveau » de la visite est gardé dans _nvInstantane) et les affiche.
function _nvBrancherChiffres() {
  var zone = document.getElementById('nvReglesCorps');
  if (!zone) { return; }
  var vide = '<p class="text-center text-muted">Les chiffres ne peuvent pas s’afficher pour l’instant. Vous les retrouvez dans « Comprendre les chiffres ».</p>';
  if (typeof comprendreLesChiffresLireFiches !== 'function') { zone.innerHTML = vide; return; }
  comprendreLesChiffresLireFiches(function (liste) {
    if (document.getElementById('nvReglesCorps') !== zone) { return; }   // la personne a pu changer d'entrée entre-temps
    if (!liste) { zone.innerHTML = vide; return; }
    _nvChiffres.elements = liste;
    _nvMarquerEntree('chiffres', liste);
    _nvRedessinerRegles(undefined);
  });
}

// Entrée 3 : les problèmes corrigés. Le remerciement n'apparaît qu'ici, en tête.
function _nvPanneauCorriges() {
  var auj = new Date();
  var groupes = nvGrouperParMois(typeof PROBLEMES_CORRIGES !== 'undefined' ? PROBLEMES_CORRIGES : [], auj);
  var corps = groupes.map(function (g) {
    return '<h2 class="nv-mois">' + _nvEchap(g.mois) + '</h2>' + g.items.map(function (p) {
      return '<div class="nv-carte-corrige"><div class="nv-tete"><span class="nv-badge-corrige"><i class="bi bi-check2" aria-hidden="true"></i> Corrigé</span>' +
        '<span class="nv-date">' + _nvEchap(nvDateFr(p.date)) + '</span>' + (_nvInstantane.corriges && _nvInstantane.corriges[nvCleElement('corriges', p)] ? '<span class="nv-nouveau">Nouveau</span>' : '') + (nvLibelleOrigine(p) ? '<span class="nv-origine">' + _nvEchap(nvLibelleOrigine(p)) + '</span>' : '') + '</div>' +
        '<div class="nv-titre">' + _nvEchap(p.titre) + '</div>' +
        '<div class="nv-lib">' + _nvEchap(nvLibelleAvant(p)) + '</div><p>' + _nvEchap(p.signale) + '</p>' +
        '<div class="nv-lib nv-lib--ok">Ce qui a été corrigé</div><p>' + _nvEchap(p.corrige) + '</p></div>';
    }).join('');
  }).join('');
  return '<div class="nv-merci"><strong>Merci aux personnes qui ont pris la peine de nous signaler ces dysfonctionnements.</strong>' +
    'Chaque signalement est lu, et c’est grâce à vous que nous les trouvons. Voici ce qui avait été signalé et ce qui a été corrigé, ainsi que ce que nous avons repéré nous-mêmes. Vous n’avez pas besoin de laisser votre nom pour signaler un problème : il sera quand même pris en compte.</div>' +
    _nvSignaler('Nouveautés, Problèmes corrigés (nouveautes)', 'Un autre problème à nous signaler ? Vous pouvez le faire sans laisser votre nom.') +
    (corps || '<p class="text-center text-muted">Rien à signaler pour l’instant.</p>');
}

// Dessine le panneau de l'entrée choisie et branche ses boutons (sans redessiner la page : l'écran ne bouge pas).
function _nvAfficherEntree(cle) {
  _nvEntree = cle === 'choix' ? 'choix' : nvEntreeValide(cle);
  if (_nvEntree !== 'choix') {   // la personne a choisi : le pulse s'arrête
    _nvPulseFini = true;
    var liste = _nvListeEntree(_nvEntree);   // entrée regardée : ce qu'elle contient devient « vu » et son nombre quitte le total (« Droits et règles » : une fois lue, plus bas)
    if (liste) { _nvMarquerEntree(_nvEntree, liste); }
    var rangee = document.querySelector('.nv-entrees');
    if (rangee) { rangee.classList.remove('nv-pulse'); }
  }
  document.querySelectorAll('[data-nv-entree]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-nv-entree') === _nvEntree)); });
  _nvMajTitreEntree();
  var zone = document.getElementById('nvPanneau');
  if (!zone) { return; }
  if (_nvEntree === 'choix') { zone.removeAttribute('aria-labelledby'); } else { zone.setAttribute('aria-labelledby', 'nvEntree-' + _nvEntree); }
  zone.innerHTML = _nvEntree === 'choix' ? _nvPanneauChoix() : (_nvEntree === 'regles' ? _nvPanneauRegles() : (_nvEntree === 'chiffres' ? _nvPanneauChiffres() : (_nvEntree === 'corriges' ? _nvPanneauCorriges() : _nvPanneauAppli())));
  _nvBrancherPanneau(zone);
  if (_nvEntree === 'regles') { _nvBrancherRegles(); }
  if (_nvEntree === 'chiffres') { _nvBrancherChiffres(); }
  if (_nvEntree !== 'choix' && typeof trackEvenement === 'function') { trackEvenement('nouveautes_entree', { entree: _nvEntree }); }
}

// La flèche « Remonter » est le composant commun (modules/remonter/index.js) : ici on lui donne seulement sa cible, la barre de filtres (sans barre : retour en haut).
function pageNouveautes() {
  _nvReplierFiltres();   // quelle que soit la façon d'arriver (accueil, recherche, retour d'une fiche, page précédente) : consigne 431
  _nvEntree = _nvEntree === 'choix' ? 'choix' : nvEntreeValide(_nvEntree);
  app.innerHTML = '<div class="page-catalogue-contenu nv-page">' +
    '<div class="text-center"><h1><i class="bi bi-megaphone" aria-hidden="true"></i> Nouveautés</h1></div>' +
    _nvEntreesHtml() + '<h2 class="nv-titre-entree" id="nvTitreEntree" hidden></h2><div id="nvPanneau" role="tabpanel"></div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null) + '</div>';
  if (typeof remonterDefinirCible === 'function') { remonterDefinirCible('.nv-filtres', '#nvPlier'); }
  app.querySelectorAll('[data-nv-entree]').forEach(function (b) {
    b.addEventListener('click', function () { _nvAfficherEntree(b.getAttribute('data-nv-entree')); });
  });
  _nvAfficherEntree(_nvEntree);
  _nvLireNombreRegles();
  _nvLireNombreChiffres();
  if (typeof trackEvenement === 'function') { trackEvenement('nouveautes_ouvert'); }
}

function _nvInitialiser() {
  var b = document.getElementById('btnNouveautes');
  if (b && !b.__nvBranche) { b.__nvBranche = true; b.addEventListener('click', nvOuvrirPage); }
  nvMajPastille();
  _nvLireNombreRegles();   // le nombre des changements des règles complète la pastille dès qu'il est connu
  _nvLireNombreChiffres();   // idem pour les fiches « Chiffres »
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _nvInitialiser); } else { _nvInitialiser(); }
}
