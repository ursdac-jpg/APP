/* ============================================================
   Module « Qui fait quoi » : INTERFACE (page routée, pure consultation).
   Logique pure : modules/mon-territoire/logique.js (chargé avant). Données : modules/mon-territoire/contenu/*.txt (lues à la demande).
   Plan : docs/PLAN_MON_TERRITOIRE_PREMICES_2026-10-12.md. Maquette validée : docs/MAQUETTE_MON_TERRITOIRE_DETAILLEE_2026-10-12.html.
   Famille 1 (consultation, LANGAGE_VISUEL_COMMUN.md) : bouton « Revoir la présentation », rien de plus. Aucune fenêtre : tout est sur la page.
   Composants réutilisés : barreEtapesModule, htmlBoutonRevoirModule, barreNavigation, .grille-sous-cartes-accueil, .comprendre-le-cadre-encart, .bloc-depli.
   ============================================================ */

var MT_BASE = 'modules/mon-territoire/contenu/';
var MT_URL_REGISTRE_LIENS = 'modules/comprendre-le-cadre/liens-verifies.txt';

// Domaines de l'accueil : { id, libelle, icone, sousTitre, ouvert }. « Emploi » (employeurs), « Social » et « Formation » (sous-branches de MT_SOUS_BRANCHES) ont une liste ; les autres disent « Pas encore de liste ».
var MT_DOMAINES = [
  { id: 'emploi', libelle: 'Emploi', icone: 'bi-briefcase', sousTitre: 'Les employeurs, par secteur', ouvert: true },
  { id: 'formation', libelle: 'Formation', icone: 'bi-mortarboard', sousTitre: 'Se former, se reconvertir, jeunes', ouvert: true },
  { id: 'social', libelle: 'Social', icone: 'bi-people', sousTitre: 'Logement, mobilité, accompagnement', ouvert: true },
  { id: 'vie-pratique', libelle: 'Vie pratique', icone: 'bi-basket', sousTitre: 'Garde d’enfant, santé, retraite', ouvert: true },
  { id: 'fonction-publique', libelle: 'Fonction publique', icone: 'bi-bank', sousTitre: 'Les employeurs publics et leurs offres', ouvert: true },
  { id: 'armees', libelle: 'Armées', icone: 'bi-shield', sousTitre: 'Information et recrutement' },
  { id: 'appui-employeurs', libelle: 'Appui aux employeurs', icone: 'bi-building', sousTitre: 'Aides et organismes', ouvert: true },
  { id: 'creer', libelle: 'Créer son activité', icone: 'bi-rocket-takeoff', sousTitre: 'Aide à la création', ouvert: true },
  { id: 'accueil-langue', libelle: 'Accueil et langue', icone: 'bi-globe2', sousTitre: 'Français, venir de l’étranger', ouvert: true },
  { id: 'droits-justice', libelle: 'Droits et justice', icone: 'bi-journal-text', sousTitre: 'Accès au droit, justice', ouvert: true }
];

var _mtDonnees = null;          // { employeurs, communes, secteurs } une fois chargé
var _mtChargement = 'inactif';  // 'inactif' | 'en-cours' | 'ok' | 'erreur'
function _mtEtatInitial(extra) {
  var e = { ecran: 'accueil', rayon: '', secteur: '', id: '', requete: '', nature: '', nbAffiches: 0, vide: '', choixCommunes: null, messageCommune: '', saisieCommune: '', saisieRecherche: '', secteurOffres: '', groupeOffres: '', secteurProspection: '' };
  var k;
  for (k in (extra || {})) { if (Object.prototype.hasOwnProperty.call(extra, k)) { e[k] = extra[k]; } }
  return e;
}
var _mtEtat = _mtEtatInitial();
var _mtPile = [];
var _monTerritoireDetourPresentation = false;
// Par quelle porte la personne est entrée : 'module' (tuile « Qui fait quoi », sa présentation) ou 'employeurs' (tuile « Employeurs près de chez moi », sa propre présentation).
// Le module est le même ; seuls changent la présentation à revoir, le point de retour et la « page principale ».
var _mtEntree = 'module';
function _mtRouteIntro() { return _mtEntree === 'employeurs' ? 'employeurs-intro' : 'mon-territoire-intro'; }

// ------------------------------------------------------------
// Petits outils
// ------------------------------------------------------------

function _mtEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _mtAujourdhui() { return new Date().toISOString().slice(0, 10); }

var _MT_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function _mtDateFr(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) { return ''; }
  return parseInt(m[3], 10) + (m[3] === '01' ? 'er' : '') + ' ' + _MT_MOIS[parseInt(m[2], 10) - 1] + ' ' + m[1];
}

function _mtSecteurs() {
  return (typeof SECTEURS_DETAIL !== 'undefined' ? SECTEURS_DETAIL : []).map(function (s) { return { cle: s.cle, libelle: s.libelle }; });
}
function _mtLibelleSecteur(cle) {
  var s = _mtSecteurs().filter(function (x) { return x.cle === cle; })[0];
  return s ? s.libelle : cle;
}

// Le département de la personne, s'il est connu ET ouvert dans le module ; sinon null (jamais choisi, ou un département qui n'a pas encore de liste).
function _mtDep() {
  var dep = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
  return mtDepartementOuvert(dep) ? dep : null;
}
// Les mots de ce département, tirés de la table MT_DEPARTEMENTS (jamais un nom écrit dans une phrase). Sans département connu : le territoire par défaut du module.
function _mtDepInfo() { return mtDepartement(_mtDep() || MT_DEPARTEMENT_PAR_DEFAUT); }
// Les communes et les employeurs de SON département seulement.
function _mtCommunes() { return mtCommunesDuDepartement(_mtDonnees.communes, _mtDepInfo().code); }
// Les employeurs « habituels » : jamais ceux « Via prospection » (rubrique à part, aucun mélange : décision de Denis, 2026-10-18). Toutes les listes, tous les compteurs et la recherche partent d'ici.
function _mtTousLesEmployeurs() { return mtEmployeursDuDepartement(_mtDonnees.employeurs, _mtDonnees.communes, _mtDepInfo().code); }
function _mtEmployeurs() { return mtSeparerProspection(_mtTousLesEmployeurs()).normaux; }
function _mtEmployeursProspection() { return mtSeparerProspection(_mtTousLesEmployeurs()).prospection; }

function _mtCommuneMemorisee() {
  var code = null;
  try { code = localStorage.getItem(MT_CLE_COMMUNE); } catch (e) { code = null; }
  if (!code || !_mtDonnees) { return null; }
  return _mtCommunes().filter(function (c) { return c.code === code; })[0] || null;
}
function _mtMemoriserCommune(code) {
  try {
    if (code) {
      localStorage.setItem(MT_CLE_COMMUNE, code);
      var c = _mtDonnees ? _mtDonnees.communes.filter(function (x) { return x.code === code; })[0] : null;
      if (c) { localStorage.setItem(MT_CLE_COMMUNE_INFO, JSON.stringify({ code: c.code, nom: c.nom, epci: c.epci })); }
    } else { localStorage.removeItem(MT_CLE_COMMUNE); localStorage.removeItem(MT_CLE_COMMUNE_INFO); }
  } catch (e) { /* pas grave : la commune sera redemandée */ }
}

// Les structures du répertoire que cette personne peut voir (son département, la région, la France), jamais celles d'un autre département.
function _mtLieux() { return mtLieuxVisibles(_mtDonnees.lieux, _mtDep()); }

// Territoire non couvert : la personne a choisi un département qui n'a pas (encore) de liste (« ailleurs », ou un département fermé dans la table).
function _mtHorsZone() {
  var dep = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
  return !!dep && !mtDepartementOuvert(dep);
}

// ------------------------------------------------------------
// Chargement des données (une seule fois, aucun appel en ligne : fichiers du site)
// ------------------------------------------------------------

function _mtCharger(onOk, onErreur) {
  if (_mtDonnees) { onOk(); return; }
  if (_mtChargement === 'en-cours') { return; }
  _mtChargement = 'en-cours';
  var communes = mtDepartementsOuverts().map(function (d) { return fetch(MT_BASE + d.communes).then(function (r) { if (!r.ok) { throw new Error('communes'); } return r.text(); }); });
  Promise.all([
    fetch(MT_BASE + 'employeurs.txt').then(function (r) { if (!r.ok) { throw new Error('employeurs'); } return r.text(); }),
    fetch(MT_BASE + 'lieux.txt').then(function (r) { if (!r.ok) { throw new Error('lieux'); } return r.text(); }),
    fetch(MT_BASE + 'offres.txt').then(function (r) { if (!r.ok) { throw new Error('offres'); } return r.text(); }),
    // Registre des adresses (liens de l'écran Insertion) : s'il manque, les boutons concernés n'apparaissent pas, le reste du module fonctionne.
    fetch(MT_URL_REGISTRE_LIENS).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; })
  ].concat(communes)).then(function (t) {
    var toutes = [];
    for (var i = 4; i < t.length; i++) { toutes = toutes.concat(mtParserCommunes(t[i]).lignes); }
    _mtDonnees = { employeurs: mtParserEmployeurs(t[0]).lignes, communes: toutes, lieux: mtParserLieux(t[1]).lignes, offres: mtParserOffres(t[2]).lignes, liens: mtLiensDepuisRegistre(t[3]) };
    _mtChargement = 'ok';
    onOk();
  }).catch(function () { _mtChargement = 'erreur'; onErreur(); });
}

// Préchargement discret pour la recherche de l'accueil (seulement si le module est ouvert).
function monTerritoirePrecharger() {
  if (!mtOuvert() || _mtDonnees || _mtChargement !== 'inactif') { return; }
  _mtCharger(function () {}, function () { _mtChargement = 'inactif'; });
}

// Résultats pour la barre de recherche de l'accueil (jamais plus de 5). Aucune donnée tant que le préchargement n'est pas fini.
function monTerritoireResultatsRecherche(requete) {
  if (!mtOuvert() || !_mtDonnees || _mtHorsZone() || !_mtDep()) { return []; }
  var emp = mtRechercherEmployeurs(_mtEmployeurs(), _mtSecteurs(), requete).slice(0, 5).map(function (e) {
    return { titre: 'Qui fait quoi : ' + e.nom, desc: _mtLibelleSecteur(e.secteur) + ' · ' + e.etablissementsListe.map(function (x) { return _mtCommuneCp(x.commune); }).join(', '),
      cible: 'fn:mon-territoire:' + e.id };
  });
  var pros = mtRechercherEmployeurs(_mtEmployeursProspection(), _mtSecteurs(), requete).slice(0, 3).map(function (e) {
    return { titre: MT_MARQUE_PROSPECTION + ' : ' + e.nom, desc: 'Repéré lors d’une prospection · ' + _mtLibelleSecteur(e.secteur) + ' · ' + e.etablissementsListe.map(function (x) { return _mtCommuneCp(x.commune); }).join(', '),
      cible: 'fn:mon-territoire:' + e.id };
  });
  var vus = {};
  var trouves = mtRechercherLieux(_mtLieux(), requete, (typeof FREINS_REPERTOIRE !== 'undefined') ? FREINS_REPERTOIRE : null);
  // Les mots que la personne tape vraiment (« pas de voiture ») renvoient aux structures du frein correspondant (jamais pour un frein sensible).
  var freins = (typeof FREINS_REPERTOIRE !== 'undefined') ? mtFreinsCorrespondants(FREINS_REPERTOIRE, requete) : [];
  var viaFrein = {};
  freins.forEach(function (fr) { mtLieuxPourFrein(_mtLieux(), FREINS_REPERTOIRE[fr.code]).forEach(function (l) { if (!viaFrein[l.id]) { viaFrein[l.id] = fr.titre; trouves.push(l); } }); });
  var str = trouves.filter(function (l) { if (vus[l.id]) { return false; } vus[l.id] = true; return true; }).slice(0, 5).map(function (l) {
    return { titre: 'Qui fait quoi : ' + l.nom, desc: (viaFrein[l.id] ? 'Pour : ' + viaFrein[l.id] + ' · ' : '') + (MT_TYPES[l.type] || '') + ' · ' + l.description, cible: 'fn:mon-territoire:lieu:' + l.id };
  });
  var offres = mtRechercherOffres(_mtDonnees.offres || [], _mtDepInfo().code, _mtAujourdhui(), requete);
  var pagesOffres = (offres.motCle ? [{ titre: 'Qui fait quoi : où voir les offres d’emploi', desc: 'Les pages où des employeurs publient eux-mêmes leurs offres, à consulter vous-même', cible: 'fn:mon-territoire:offres' }] : [])
    .concat(offres.pages.slice(0, 2).map(function (o) { return { titre: 'Qui fait quoi : ' + o.nom + ' (offres publiées)', desc: _mtLibelleSecteur(o.secteur) + ' · ' + _mtTerritoireOffre(o), cible: 'fn:mon-territoire:offres' }; }));
  var q = mtNormaliser(requete);
  var pageInterim = (/(^| )(interim|interimaire|travail temporaire|agence d interim)( |$)/.test(mtNormaliser(requete)) && _mtAgencesInterim().length
    ? [{ titre: 'Qui fait quoi : agences d’intérim', desc: 'Les agences d’intérim de votre département, avec leur numéro et leur page', cible: 'fn:mon-territoire:interim' }] : []);
  var pageSiae = (/(^| )(iae|siae|pass iae)( |$)|insertion par l activite|chantier d insertion|entreprise d insertion/.test(q)
    ? [{ titre: 'Qui fait quoi : insertion par l’activité économique', desc: 'Comment y entrer, le pass IAE, les liens officiels', cible: 'fn:mon-territoire:siae' }] : []);
  return pageInterim.concat(pageSiae, pagesOffres, emp, pros, str).slice(0, 6);
}

// ------------------------------------------------------------
// Navigation (un cran en arrière à la fois, jamais un saut par-dessus l'accueil du module)
// ------------------------------------------------------------

// L'historique du navigateur suit les écrans du module (brique B.24, js/app.js) : une entrée par écran, qui porte une copie de l'état. La flèche « Précédent »
// du navigateur, le bouton « Retour » et « Revenir à la page principale » avancent donc dans la même pile.
function _mtCopie(x) { return JSON.parse(JSON.stringify(x)); }
function _mtInstantane() { return { etat: _mtCopie(_mtEtat), pile: _mtCopie(_mtPile), entree: _mtEntree }; }
function _mtRestaurer(instantane) {
  _mtEtat = _mtCopie(instantane.etat);
  _mtPile = _mtCopie(instantane.pile);
  _mtEntree = instantane.entree || 'module';
  _monTerritoireDetourPresentation = false;
  _mtReculEnCours = false;
  clearTimeout(_mtReculMinuteur);   // le navigateur a répondu : le repli à la main n'a plus lieu d'être (il annulerait le clic suivant)
}
// js/app.js est chargé APRÈS ce fichier : le module s'inscrit au premier dessin de la page (pageMonTerritoire), pas au chargement.
function _mtInscrireHistorique() { if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher('mon-territoire', _mtRestaurer); } }

function _mtAller(ecran, extra) {
  _mtPile.push(_mtCopie(_mtEtat));
  var k;
  for (k in (extra || {})) { if (Object.prototype.hasOwnProperty.call(extra, k)) { _mtEtat[k] = extra[k]; } }
  _mtEtat.ecran = ecran;
  if (typeof historiqueInterneEmpiler === 'function') { historiqueInterneEmpiler('mon-territoire', _mtInstantane()); }
  pageMonTerritoire();
}

// Revient d'un écran (bouton « Retour » de la barre) : un cran dans l'historique du navigateur, comme la flèche « Précédent ».
// Sur le premier écran du module : la présentation de la porte d'entrée, en mode normal (jamais en détour, sinon boucle accueil <-> présentation).
function _mtAllerVersPrecedent() {
  if (_mtPile.length) { _mtReculer(1); return; }
  _monTerritoireDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers(_mtRouteIntro()); }
}

// Recule de n écrans d'un coup. Par l'historique du navigateur (un seul mouvement, la flèche « Précédent » reste cohérente) ;
// si le navigateur n'a pas bougé (page rouverte, historique perdu), on recule à la main dans la pile du module.
// Un deuxième clic pendant que le navigateur recule encore est ignoré (sinon deux reculs s'enchaînent et la personne sort du module).
var _mtReculEnCours = false, _mtReculMinuteur = null;
function _mtReculer(n) {
  n = Math.min(n, _mtPile.length);
  if (n < 1 || _mtReculEnCours) { return; }
  var avant = _mtPile.length;
  var secours = function () {
    _mtReculEnCours = false;
    if (_mtPile.length !== avant || (typeof pageActuelle !== 'undefined' && pageActuelle !== 'mon-territoire')) { return; }
    _mtEtat = _mtPile[avant - n]; _mtPile = _mtPile.slice(0, avant - n); pageMonTerritoire();
  };
  if (typeof history !== 'undefined' && history.go) { _mtReculEnCours = true; history.go(-n); _mtReculMinuteur = setTimeout(secours, 400); } else { secours(); }
}

// Bouton « Revenir à la page principale » : le premier écran de la porte d'entrée (l'accueil du module, ou la liste des secteurs pour les employeurs).
function _mtRevenirPagePrincipale() { _mtReculer(_mtPile.length); }

// « Revoir la présentation » empile la présentation PAR-DESSUS l'écran du module ; « Revenir au module » dépile : un cran en arrière dans l'historique du navigateur,
// qui retrouve l'écran exact (et garde la flèche « Précédent » cohérente). Si le navigateur n'a pas bougé, on rouvre le module à la main.
var _mtDetourEmpile = false;
function _mtRevoirPresentation() {
  _monTerritoireDetourPresentation = true;
  _mtDetourEmpile = true;
  if (typeof naviguerVers === 'function') { naviguerVers(_mtRouteIntro()); }
}
function monTerritoireRevenirDeLaPresentation() {
  _monTerritoireDetourPresentation = false;
  var rouvrir = function () { if (typeof naviguerVers === 'function' && (typeof pageActuelle === 'undefined' || pageActuelle !== 'mon-territoire')) { naviguerVers('mon-territoire'); } };
  if (_mtDetourEmpile && typeof history !== 'undefined' && history.back) { _mtDetourEmpile = false; history.back(); setTimeout(rouvrir, 400); } else { rouvrir(); }
}
window.monTerritoireRevenirDeLaPresentation = monTerritoireRevenirDeLaPresentation;

// Ouvre le module sur des écrans déjà « empilés » : chaque écran du chemin a sa propre entrée dans l'historique du navigateur, comme si la personne y était passée.
// `chemin` : les écrans traversés avant l'écran affiché, du plus ancien au plus récent (objets partiels) ; `final` : l'écran affiché.
function _mtOuvrirSurChemin(entree, chemin, final) {
  _mtEntree = entree;
  _mtPile = [];
  var ecrans = chemin.concat([final]);
  _mtEtat = _mtEtatInitial(ecrans[0]);
  if (typeof naviguerVers === 'function') { naviguerVers('mon-territoire'); }
  for (var i = 1; i < ecrans.length; i++) {
    _mtPile.push(_mtCopie(_mtEtat));
    _mtEtat = _mtEtatInitial(ecrans[i]);
    if (typeof historiqueInterneEmpiler === 'function') { historiqueInterneEmpiler('mon-territoire', _mtInstantane()); }
  }
  if (ecrans.length > 1) { pageMonTerritoire(); }
}

// Retour dans le module par une entrée d'historique NEUVE (« Revenir à Qui fait quoi » depuis « Comprendre le cadre », par exemple) : la pile du module garde ses écrans
// mais l'historique du navigateur n'a plus derrière lui la chaîne qui leur correspond (d'autres pages sont passées entre-temps). Sans cette reconstruction, un « Retour » ou
// « Revenir à la page principale » reculerait de trop et sortirait du module. On rejoue donc la chaîne, une entrée par écran, comme `_mtOuvrirSurChemin`.
function _mtReconstruireHistorique() {
  var s = (typeof history !== 'undefined') ? history.state : null;
  if (!_mtPile.length || (s && s.route === 'mon-territoire' && s.interne)) { return; }
  if (typeof pageActuelle !== 'undefined' && pageActuelle !== 'mon-territoire') { return; }
  if (typeof historiqueInterneMarquer !== 'function' || typeof historiqueInterneEmpiler !== 'function') { return; }
  var chemin = _mtCopie(_mtPile), final = _mtEtat;
  _mtPile = [];
  _mtEtat = _mtCopie(chemin[0]);
  historiqueInterneMarquer('mon-territoire', _mtInstantane());
  for (var i = 1; i <= chemin.length; i++) {
    _mtPile.push(_mtCopie(_mtEtat));
    _mtEtat = (i < chemin.length) ? _mtCopie(chemin[i]) : final;
    historiqueInterneEmpiler('mon-territoire', _mtInstantane());
  }
}

// Point d'entrée de la présentation de « Qui fait quoi » (bouton « Ouvrir Qui fait quoi ») : l'accueil du module.
function monTerritoireOuvrirAccueil() { _mtOuvrirSurChemin('module', [], { ecran: 'accueil' }); }
window.monTerritoireOuvrirAccueil = monTerritoireOuvrirAccueil;

// Point d'entrée depuis la recherche de l'accueil : ouvre directement la fiche trouvée.
function monTerritoireOuvrirDepuisRecherche(idEmployeur) {
  if (idEmployeur && idEmployeur.indexOf('lieu:') === 0) {
    // Une structure trouvée par la recherche de l'accueil : on ouvre la liste de son premier rayon.
    var lieu = _mtDonnees ? _mtDonnees.lieux.filter(function (l) { return l.id === idEmployeur.slice(5); })[0] : null;
    if (lieu) { _mtOuvrirSurChemin('module', [{ ecran: 'accueil' }, { ecran: _mtEcranDuRayon(lieu.rayonsListe[0]) }], { ecran: 'lieux', rayon: lieu.rayonsListe[0] }); return; }
  } else if (idEmployeur === 'interim') { _mtOuvrirSurChemin('module', [{ ecran: 'accueil' }, { ecran: 'emploi' }], { ecran: 'interim' }); return; }
  else if (idEmployeur === 'siae') { _mtOuvrirSurChemin('module', [{ ecran: 'accueil' }, { ecran: 'emploi' }], { ecran: 'siae', nbAffiches: 0 }); return; }
  else if (idEmployeur === 'offres') { _mtOuvrirSurChemin('module', [{ ecran: 'accueil' }, { ecran: 'emploi' }], { ecran: 'offres', secteurOffres: '' }); return; }
  else if (idEmployeur) { _mtOuvrirSurChemin('module', [{ ecran: 'accueil' }], { ecran: 'fiche', id: idEmployeur }); return; }
  _mtOuvrirSurChemin('module', [], { ecran: 'accueil' });
}

// Raccourci « Employeurs près de chez moi » (carte « Me préparer à candidater ») : ouvre le module directement sur les employeurs par secteur.
// C'est la « page principale » de cette porte d'entrée ; le « Retour » de la barre ramène à sa présentation, puis à l'accueil d'ERIP.
function monTerritoireOuvrirEmployeurs() { _mtOuvrirSurChemin('employeurs', [], { ecran: 'emploi' }); }

// Ouvre directement la liste d'un rayon (depuis une fenêtre ou une fiche d'un autre module), sans bouton « Revenir à ... » : le « Retour » de la barre ramène à l'accueil du module.
function monTerritoireOuvrirListe(rayon) {
  _mtOuvrirSurChemin('module', [{ ecran: 'accueil' }, { ecran: _mtEcranDuRayon(rayon) }], { ecran: 'lieux', rayon: rayon });
}

// Bloc « Dans <son département>, ces structures peuvent vous aider » inséré dans une fenêtre ou une fiche d'un autre module. Rien tant que le module est fermé,
// hors des départements ouverts, ou sans structure du bon type (jamais un bloc vide, jamais pour un frein sensible).
function _mtBlocStructuresHtml(intro, lieux, rayon) {
  var liste = lieux.slice(0, 6);
  return '<div class="comprendre-le-cadre-encart mb-3" data-mt-bloc-structures><i class="bi bi-geo-alt"></i> <strong>' + _mtEsc(intro) + '</strong>' +
    '<div class="mt-2">' + liste.map(_mtCarteLieu).join('') + '</div>' +
    (lieux.length > liste.length ? '<p class="small text-muted mb-2">' + liste.length + ' sur ' + lieux.length + ' structures.</p>' : '') +
    '<button type="button" class="btn btn-primary btn-sm" data-mt-voir-liste="' + _mtEsc(rayon) + '">Voir tout dans Qui fait quoi</button></div>';
}

function _mtInsererBloc(zone, html) {
  zone.innerHTML = html;
  var b = zone.querySelector('[data-mt-voir-liste]');
  if (b) {
    b.addEventListener('click', function () {
      if (typeof fermerFenetreERIP === 'function' && document.querySelector('.fenetre-erip, .modal.show')) { try { fermerFenetreERIP(); } catch (e) { /* pas grave */ } }
      monTerritoireOuvrirListe(b.getAttribute('data-mt-voir-liste'));
    });
  }
}

function _mtConditionsOk() { return mtOuvert() && !!_mtDep(); }

// Fenêtre « Trouver une structure » (js/app.js, ouvrirRenvoiAnnuaire) ouverte depuis un frein : ajoute les structures du répertoire liées à ce frein.
function monTerritoireCompleterFenetreStructures(overlay, freinTitre) {
  if (!overlay || !freinTitre || !_mtConditionsOk() || typeof FREINS_REPERTOIRE === 'undefined') { return; }
  var zone = overlay.querySelector('[data-mt-structures-frein]');
  if (!zone) { return; }
  _mtCharger(function () {
    var f = mtFreinParTitre(FREINS_REPERTOIRE, freinTitre);
    var lieux = f ? mtLieuxPourFrein(_mtLieux(), f.frein) : [];
    if (!lieux.length) { return; }
    var rayon = ((f.frein.rayons || []).filter(function (r) { return lieux.some(function (l) { return l.rayonsListe.indexOf(r) !== -1; }); })[0]) || lieux[0].rayonsListe[0];
    _mtInsererBloc(zone, _mtBlocStructuresHtml(mtMajuscule(_mtDepInfo().dans) + ', ces structures peuvent vous aider', lieux, rayon));
  }, function () { /* silencieux : la fenêtre garde ses liens d'origine */ });
}

// Fiche « type de structure » du Lexique (CAF, France Travail, Mission locale...) : ajoute les structures de ce type présentes dans le répertoire.
function monTerritoireCompleterFicheLexique(racine, idFiche) {
  if (!racine || !_mtConditionsOk()) { return; }
  var type = mtTypeDeFicheLexique(idFiche);
  var zone = racine.querySelector('[data-mt-structures-type]');
  if (!type || !zone) { return; }
  _mtCharger(function () {
    var lieux = mtLieuxDuType(_mtLieux(), type);
    if (!lieux.length) { return; }
    _mtInsererBloc(zone, _mtBlocStructuresHtml(mtMajuscule(_mtDepInfo().dans) + ', cette structure', lieux, lieux[0].rayonsListe[0]));
  }, function () { /* silencieux */ });
}

// Les structures d'un type pour le département de la personne, en HTML prêt à poser dans une fenêtre (fiches Mission locale et PLIE du Lexique, décision D15). Rend null s'il n'y en a aucune ou si
// le répertoire est illisible : l'appelant garde alors son affichage d'origine. Indépendant de l'ouverture du module : ce n'est pas une nouveauté d'interface mais la bonne source.
function monTerritoireStructuresDuType(type, rappel) {
  _mtCharger(function () {
    var commune = mtCommuneInfoMemorisee();
    var lieux = mtLieuxDuType(_mtLieux(), type).filter(function (l) { return l.portee === _mtDepInfo().code; });
    if (!lieux.length) { rappel(null); return; }
    var structures = mtOrdonnerParCommune(lieux.map(function (l) { return mtLieuEnStructure(l, _mtAujourdhui(), commune); }));
    var notes = mtNotesSelonCommune(structures).map(function (n) { return '<div class="comprendre-le-cadre-encart mb-2"><i class="bi bi-info-circle"></i> ' + _mtEsc(n) + '</div>'; }).join('');
    rappel('<p class="small mb-2"><strong>' + _mtEsc(mtMajuscule(_mtDepInfo().dans)) + '</strong></p>' + notes + structures.map(function (st) { return _mtCarteLieu(lieux.filter(function (l) { return l.id === st.id; })[0]); }).join(''));
  }, function () { rappel(null); });
}

// Point d'entrée depuis « Comprendre le cadre » (écran « Près de chez moi » d'un rayon) : ouvre la liste du même rayon, avec le bouton « Revenir à Comprendre le cadre »
// (definirRetourModuleExterne) qui ramène à l'écran quitté. Même patron que Lexique <-> Comprendre le cadre.
function monTerritoireOuvrirDepuisCadre(rayon) {
  _mtOuvrirSurChemin('module', [{ ecran: 'accueil' }, { ecran: _mtEcranDuRayon(rayon) }], { ecran: 'lieux', rayon: rayon });
  if (typeof definirRetourModuleExterne === 'function') {
    definirRetourModuleExterne('Comprendre le cadre', function () { naviguerVers('comprendre-le-cadre'); }, 'comprendre-le-cadre', 'mon-territoire');
  }
}

// ------------------------------------------------------------
// En-tête et pied communs
// ------------------------------------------------------------

function _mtIndexEtape() {
  var e = _mtEtat.ecran;
  if (e === 'fiche') { return 2; }
  if (e === 'emploi' || e === 'liste' || e === 'prospection' || e === 'offres' || e === 'siae' || e === 'interim' || e === 'lieux' || MT_SOUS_BRANCHES[e]) { return 1; }
  return 0;
}

// Deux boutons au-dessus du contenu : « Revoir la présentation » (la présentation de la porte d'entrée) et, dès qu'on a quitté la page principale,
// « Revenir à la page principale » (un seul clic au lieu de plusieurs « Retour »). Même forme de bouton, même note d'aide.
function _mtRenduEnTete() {
  var icone = _mtEntree === 'employeurs' ? 'bi-briefcase' : 'bi-geo-alt';
  var principale = _mtPile.length
    ? '<div class="bloc-revoir-module" style="margin-top:0"><button type="button" id="btnMonTerritoirePagePrincipale" class="btn-revoir-module"><i class="bi bi-arrow-up-left-circle"></i> Revenir à la page principale</button></div>'
    : '';
  var departement = (_mtDep() && !_mtHorsZone())
    ? '<div class="comprendre-le-cadre-territoire d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">' +
      '<span class="fs-6"><i class="bi bi-geo-alt"></i> Votre département : <strong>' + _mtEsc(_mtDepInfo().nom) + ' (' + _mtEsc(_mtDepInfo().code) + ')</strong></span>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-mt-changer-departement><i class="bi bi-arrow-repeat"></i> Changer de département</button></div>' : '';
  return (typeof barreEtapesModule === 'function' ? barreEtapesModule(MT_ETAPES, _mtIndexEtape()) : '') + departement +
    (typeof htmlBoutonRevoirModule === 'function' ? htmlBoutonRevoirModule('btnMonTerritoireRevoirIntro', icone, 'Revoir la présentation', false) : '') + principale;
}

function _mtRenduPiedFixe() {
  return (typeof barreNavigation === 'function')
    ? '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_mtAllerVersPrecedent()' }) + '</div>'
    : '';
}

function _mtTitre(icone, texte, sous) {
  return '<h1 class="h3 text-center mt-3"><i class="bi ' + icone + ' titre-icone-accent"></i> ' + _mtEsc(texte) + '</h1>' + (sous ? '<p class="text-center">' + sous + '</p>' : '');
}

function _mtEncart(icone, html) {
  return '<div class="comprendre-le-cadre-encart mb-3"><i class="bi ' + icone + '"></i> ' + html + '</div>';
}

function _mtBoutonLienExterne(url, libelle) {
  return '<a class="btn btn-outline-primary" href="' + _mtEsc(url) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> ' + libelle + ' (vous quittez l’application)</a>';
}

// ------------------------------------------------------------
// Commune (décision D9 : un champ sur la page, jamais une fenêtre)
// ------------------------------------------------------------

function _mtRenduBlocCommune() {
  var c = _mtCommuneMemorisee();
  var corps;
  if (c && !_mtEtat.changerCommune) {
    corps = '<span class="me-2"><i class="bi bi-geo-alt"></i> Votre territoire : <strong>' + _mtEsc(c.nom) + '</strong>, ' + _mtEsc(_mtDepInfo().nom) + ' (' + _mtEsc(_mtDepInfo().code) + ')</span>' +
      '<button type="button" class="btn btn-sm btn-outline-primary" data-mt-changer-commune>Changer</button>';
  } else {
    corps = '<label for="mtSaisieCommune" class="fw-semibold d-block mb-1"><i class="bi bi-geo-alt"></i> Votre commune (à compléter)</label>' +
      '<div class="d-flex gap-2 flex-wrap"><input id="mtSaisieCommune" class="form-control champ-bien-visible" style="max-width:18rem" autocomplete="off" placeholder="Exemple : ' + _mtEsc(_mtDepInfo().exemple) + '" value="' + _mtEsc(_mtEtat.saisieCommune) + '">' +
      '<button type="button" class="btn btn-primary" data-mt-valider-commune>Valider</button>' +
      (c ? '<button type="button" class="btn btn-outline-secondary" data-mt-annuler-commune>Garder ' + _mtEsc(c.nom) + '</button>' : '') + '</div>' +
      '<p class="small text-muted mb-0 mt-1">Cette information reste sur votre appareil. Sans commune, nous affichons tout le département.</p>';
    if (_mtEtat.messageCommune) { corps += '<p class="small mb-0 mt-2"><i class="bi bi-info-circle"></i> ' + _mtEsc(_mtEtat.messageCommune) + '</p>'; }
    if (_mtEtat.choixCommunes && _mtEtat.choixCommunes.length) {
      corps += '<div class="d-flex gap-2 flex-wrap mt-2">' + _mtEtat.choixCommunes.map(function (x) {
        return '<button type="button" class="btn btn-sm btn-outline-primary" data-mt-choisir-commune="' + _mtEsc(x.code) + '">' + _mtEsc(x.nom) + '</button>';
      }).join('') + '</div>';
    }
  }
  return '<div class="comprendre-le-cadre-encart mb-3">' + corps + '</div>';
}

function _mtBrancherBlocCommune() {
  var changer = document.querySelector('[data-mt-changer-commune]');
  if (changer) { changer.addEventListener('click', function () { _mtEtat.changerCommune = true; _mtEtat.messageCommune = ''; _mtEtat.choixCommunes = null; pageMonTerritoire(); }); }
  var annuler = document.querySelector('[data-mt-annuler-commune]');
  if (annuler) { annuler.addEventListener('click', function () { _mtEtat.changerCommune = false; _mtEtat.messageCommune = ''; _mtEtat.choixCommunes = null; pageMonTerritoire(); }); }
  var valider = document.querySelector('[data-mt-valider-commune]');
  var champ = document.getElementById('mtSaisieCommune');
  function soumettre() {
    var saisie = champ ? champ.value : '';
    _mtEtat.saisieCommune = saisie;
    var r = mtTrouverCommune(_mtCommunes(), saisie);
    if (r.statut === 'trouvee') {
      _mtMemoriserCommune(r.communes[0].code); _mtEtat.changerCommune = false; _mtEtat.messageCommune = ''; _mtEtat.choixCommunes = null; _mtEtat.saisieCommune = '';
    } else if (r.statut === 'plusieurs') {
      _mtEtat.choixCommunes = r.communes; _mtEtat.messageCommune = 'Plusieurs communes correspondent : choisissez la vôtre.';
    } else {
      _mtEtat.choixCommunes = null;
      _mtEtat.messageCommune = saisie.trim() ? 'Nous ne trouvons pas cette commune ' + _mtDepInfo().en + '. Vérifiez l’orthographe ou tapez votre code postal. Vous pouvez aussi continuer sans commune.' : 'Tapez le nom de votre commune ou votre code postal.';
    }
    pageMonTerritoire();
  }
  if (valider) { valider.addEventListener('click', soumettre); }
  if (champ) { champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); soumettre(); } }); }
  document.querySelectorAll('[data-mt-choisir-commune]').forEach(function (b) {
    b.addEventListener('click', function () {
      _mtMemoriserCommune(this.dataset.mtChoisirCommune); _mtEtat.changerCommune = false; _mtEtat.messageCommune = ''; _mtEtat.choixCommunes = null; _mtEtat.saisieCommune = '';
      pageMonTerritoire();
    });
  });
}

// ------------------------------------------------------------
// Champ de recherche (accueil et branche Emploi)
// ------------------------------------------------------------

function _mtRenduChampRecherche(placeholder) {
  return '<div class="d-flex gap-2 my-3"><input id="mtSaisieRecherche" class="form-control champ-bien-visible" aria-label="Rechercher" autocomplete="off" placeholder="' + _mtEsc(placeholder) + '" value="' + _mtEsc(_mtEtat.saisieRecherche) + '">' +
    '<button type="button" class="btn btn-primary" data-mt-rechercher>Rechercher</button></div>';
}
function _mtBrancherChampRecherche() {
  var champ = document.getElementById('mtSaisieRecherche');
  var bouton = document.querySelector('[data-mt-rechercher]');
  function lancer() {
    var q = champ ? champ.value : '';
    _mtEtat.saisieRecherche = q;
    if (mtNormaliser(q).length < 2) { return; }
    _mtAller('recherche', { requete: q });
  }
  if (bouton) { bouton.addEventListener('click', lancer); }
  if (champ) { champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); lancer(); } }); }
}

// ------------------------------------------------------------
// Écrans
// ------------------------------------------------------------

function _mtRenduAccueil() {
  if (_mtHorsZone()) { return _mtRenduHorsZone(); }
  var tuiles = MT_DOMAINES.map(function (d) {
    return '<button type="button" class="sous-carte-accueil" data-mt-domaine="' + d.id + '"><i class="bi ' + d.icone + '"></i><strong>' + _mtEsc(d.libelle) + '</strong><span>' + _mtEsc(d.sousTitre) + '</span>' +
      (d.ouvert ? '' : '<span class="badge text-bg-light mt-1">Pas encore de liste</span>') + '</button>';
  }).join('');
  return _mtTitre('bi-geo-alt', 'Qui fait quoi ' + _mtDepInfo().en + ' ?', 'À qui vous adresser, et où ? Choisissez un domaine, ou tapez ce que vous cherchez.') +
    _mtRenduBlocCommune() +
    _mtRenduChampRecherche('Un métier, un secteur, un employeur (exemple : caissier)') +
    '<div class="grille-sous-cartes-accueil">' + tuiles + '</div>' +
    '<p class="small text-muted mt-3"><i class="bi bi-info-circle"></i> Liste non exhaustive, aucun partenariat, aucune rémunération. Un domaine sans liste le dit clairement.</p>' +
    '<div class="text-center"><button type="button" class="btn btn-sm btn-outline-secondary" data-mt-criteres>Comment les fiches sont choisies</button></div>';
}

function _mtRenduHorsZone() {
  var dep = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
  return _mtTitre('bi-geo-alt', 'Qui fait quoi') +
    _mtEncart('bi-info-circle', _mtEsc(mtPhraseTerritoireNonCouvert(dep))) +
    '<p class="text-center">Ce n’est ni une erreur ni un oubli de votre part.</p>' +
    '<div class="text-center d-flex gap-2 justify-content-center flex-wrap">' + _mtBoutonRegistre('bonne-boite', 'Chercher par moi-même (La Bonne Boîte)') +
    '<button type="button" class="btn btn-outline-secondary" data-mt-autre-departement>&#8592; Choisir un autre département</button></div>';
}

// La personne n'a encore choisi aucun département : on ne devine pas, on le lui demande (même choix que dans le reste de l'application).
function _mtRenduChoixDepartement() {
  return _mtTitre('bi-geo-alt', 'Qui fait quoi') +
    _mtEncart('bi-info-circle', 'Pour vous montrer les bonnes adresses, dites-nous dans quel département vous cherchez.') +
    '<div class="text-center"><button type="button" class="btn btn-primary" data-mt-choisir-departement><i class="bi bi-geo-alt"></i> Choisir mon département</button></div>';
}

function _mtRenduEmploi() {
  var secteurs = _mtSecteurs();
  var n = mtCompterParSecteur(_mtEmployeurs());
  // Les secteurs qui ont une liste passent en premier, les autres suivent dans l'ordre de l'application.
  var avec = secteurs.filter(function (s) { return n[s.cle]; }), sans = secteurs.filter(function (s) { return !n[s.cle]; });
  var tuiles = avec.concat(sans).map(function (s) {
    var a = MT_SECTEURS_AFFICHAGE[s.cle] || { icone: 'bi-briefcase', exemples: '' };
    return '<button type="button" class="sous-carte-accueil" data-mt-secteur="' + s.cle + '"' + (n[s.cle] ? '' : ' style="opacity:.8"') + '><i class="bi ' + a.icone + '"></i><strong>' + _mtEsc(s.libelle) + '</strong>' +
      '<span>' + _mtEsc(a.exemples) + '</span>' + (n[s.cle] ? '<span class="badge text-bg-primary mt-1">' + n[s.cle] + (n[s.cle] > 1 ? ' enseignes ou employeurs' : ' employeur') + '</span>' : '<span class="badge text-bg-light mt-1">Pas encore de liste</span>') + '</button>';
  }).join('');
  return _mtTitre('bi-briefcase', 'Emploi : les employeurs de mon territoire', 'On montre des portes, pas des annonces : des employeurs où l’on peut se présenter, candidater ou passer un concours.') +
    _mtRenduChampRecherche('Un secteur ou un métier (exemple : caissier)') +
    _mtPortesPrincipales() +
    '<h2 class="h5 fw-bold text-uppercase text-muted mt-4">Les 21 secteurs</h2><p class="small text-muted">Les secteurs qui ont une liste passent en premier. Chaque secteur a son objet-icône et trois exemples de métiers.</p>' +
    '<div class="grille-sous-cartes-accueil">' + tuiles + '</div>' +
    '<div class="comprendre-le-cadre-encart mt-4"><i class="bi bi-search"></i> Vous ne trouvez pas ? Chercher par vous-même sur un site officiel. ' + _mtBoutonRegistre('bonne-boite', 'La Bonne Boîte') + '</div>';
}

// Une commune avec son code postal : « Bergerac (24100) » ; une commune qui a plusieurs codes les montre tous (jusqu'à trois : « Limoges (87000, 87100, 87280) »), sinon le premier ; sans code connu, le nom seul. Partout où le module parle d'une localité.
function _mtCommuneCp(nom) {
  var cle = mtNormaliser(nom), c = ((_mtDonnees && _mtDonnees.communes) || []).filter(function (x) { return x.cle === cle; })[0];
  return (c && c.codesPostaux && c.codesPostaux.length) ? nom + ' (' + (c.codesPostaux.length <= 3 ? c.codesPostaux.join(', ') : c.codesPostaux[0]) + ')' : nom;
}

// « Enseigne », « Employeur local » ou « Agence d'intérim » (une agence d'intérim n'a pas de secteur).
function _mtNatureLibelle(e) { return e.nature === 'enseigne' ? 'Enseigne' : (e.nature === 'interim' ? 'Agence d’intérim' : 'Employeur local'); }

function _mtLigneEmployeur(e, communePersonne, communeVue) {
  var proche = mtDansMonIntercommunalite(e, _mtCommunes(), communePersonne);
  var lieux = e.etablissementsListe.filter(function (x) { return !communeVue || _mtToutVoir(communeVue) || _mtDansChoix(x.commune, communeVue); }).map(function (x) { return x.commune; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(_mtCommuneCp).join(', ');
  // Une carte par employeur : le bouton est juste sous le nom ; les cartes se rangent en grille (voir .mt-grille-employeurs).
  return '<div class="comprendre-le-cadre-encart mt-carte-employeur">' +
    '<span class="d-block fw-semibold">' + _mtEsc(e.nom) + '</span>' +
    '<span class="d-block small">' + _mtNatureLibelle(e) + ' · ' + _mtEsc(lieux) + '</span>' +
    (mtViaProspection(e) ? '<span class="d-block small">' + _mtEsc(_mtLibelleSecteur(e.secteur)) + '</span>' + _mtPastilleProspection() : '') +
    (proche ? '<span class="badge text-bg-light mt-1"><i class="bi bi-geo-alt"></i> Dans votre intercommunalité</span>' : '') +
    '<button type="button" class="btn btn-sm btn-primary mt-2" data-mt-fiche="' + _mtEsc(e.id) + '">Voir la fiche</button></div>';
}

// ------------------------------------------------------------
// Choix de la commune en bandeau (demande de Denis, 2026-10-18) : le MÊME sur toutes les listes (agences d'intérim, employeurs d'un secteur, structures d'un domaine,
// structures d'insertion). On ne montre pas Bergerac à quelqu'un qui cherche à Périgueux. Si la personne a déjà indiqué sa commune et qu'elle figure dans le bandeau,
// elle est pré-sélectionnée ; sinon rien n'est choisi. « Voir toute la liste » montre tout. Un second clic sur la commune choisie la désélectionne.
// ------------------------------------------------------------
// Noms de communes sans doublon (Saint-Yrieix la Perche = Saint-Yrieix-la-Perche), écrits comme dans la table officielle, rangés par ordre alphabétique.
function _mtNomsCommunes(noms) {
  var officiel = {}, vus = {}, sortie = [];
  _mtCommunes().forEach(function (c) { officiel[c.cle] = c.nom; });
  // La commune déjà indiquée par la personne figure toujours dans le bandeau (donc pré-sélectionnée partout, même quand cette liste n'y a encore rien).
  var cm = _mtCommuneMemorisee();
  (cm ? noms.concat([cm.nom]) : noms).forEach(function (nom) { var k = mtNormaliser(nom); if (!k || vus[k]) { return; } vus[k] = true; sortie.push(officiel[k] || nom); });
  return sortie.sort(function (a, b) { return a.localeCompare(b, 'fr', { sensitivity: 'base' }); });
}
// Plusieurs communes peuvent être choisies à la fois (une personne prête à élargir sa zone de recherche) : chaque clic ajoute la commune, un second clic la retire.
// « Voir toute la liste » remplace le choix (et un clic sur une commune le remplace à son tour).
// Le choix en cours pour un écran : une liste de noms de communes du bandeau, ['*'] pour toute la liste, [] si rien n'est choisi.
function _mtChoixCommune(ecran, noms) {
  var m = _mtEtat.communeChoix;
  if (m && m.ecran === ecran) { return m.v; }
  var c = _mtCommuneMemorisee();
  if (c) { var k = mtNormaliser(c.nom), trouve = noms.filter(function (x) { return mtNormaliser(x) === k; })[0]; if (trouve) { return [trouve]; } }
  return [];
}
function _mtMemeCommune(a, b) { return mtNormaliser(a) === mtNormaliser(b); }
function _mtToutVoir(choix) { return choix.indexOf('*') !== -1; }
// Vrai si cette commune est l'une de celles choisies.
function _mtDansChoix(nom, choix) { return choix.some(function (x) { return x !== '*' && _mtMemeCommune(x, nom); }); }
function _mtBandeauCommunes(ecran, noms, choix) {
  var bouton = function (v, libelle) {
    var actif = v === '*' ? _mtToutVoir(choix) : _mtDansChoix(v, choix);
    return '<button type="button" class="btn btn-sm ' + (actif ? 'btn-primary' : 'btn-outline-primary') + '" aria-pressed="' + actif + '" data-mt-commune="' + _mtEsc(ecran) + '" data-mt-commune-v="' + _mtEsc(v) + '">' + _mtEsc(libelle) + '</button>';
  };
  return '<p class="text-center mb-1"><strong>Choisissez une ou plusieurs communes</strong> pour voir ce qui les concerne, ou affichez toute la liste.</p>' +
    '<div class="d-flex flex-wrap gap-2 justify-content-center my-3" role="group" aria-label="Communes">' + noms.map(function (v) { return bouton(v, _mtCommuneCp(v)); }).join('') + bouton('*', 'Voir toute la liste') + '</div>';
}
function _mtAucuneCommune() { return '<p class="small text-muted text-center border rounded p-3">Aucune commune choisie pour l’instant. Cliquez sur une ou plusieurs communes ci-dessus.</p>'; }

function _mtRenduListe() {
  var cle = _mtEtat.secteur;
  var tous = mtEmployeursDuSecteur(_mtEmployeurs(), cle, '');
  var natures = tous.map(function (e) { return e.nature; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
  var base = _mtEtat.nature ? tous.filter(function (e) { return e.nature === _mtEtat.nature; }) : tous;
  var noms = _mtNomsCommunes([].concat.apply([], tous.map(function (e) { return e.etablissementsListe.map(function (x) { return x.commune; }); })));
  var choix = _mtChoixCommune('secteur', noms);
  var liste = _mtToutVoir(choix) ? base : (choix.length ? base.filter(function (e) { return e.etablissementsListe.some(function (x) { return _mtDansChoix(x.commune, choix); }); }) : []);
  var p = mtPaginer(liste, _mtEtat.nbAffiches);
  var c = _mtCommuneMemorisee();
  var a = MT_SECTEURS_AFFICHAGE[cle] || { icone: 'bi-briefcase' };
  var filtres = natures.length > 1
    ? '<div class="d-flex flex-wrap gap-2 justify-content-center my-2">' + [['', 'Tous'], ['enseigne', 'Enseignes'], ['local', 'Employeurs locaux']].map(function (f) {
        return '<button type="button" class="btn btn-sm ' + (_mtEtat.nature === f[0] ? 'btn-primary' : 'btn-outline-primary') + '" data-mt-nature="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>'
    : '';
  var suite = p.restants > 0
    ? '<div class="text-center my-2"><button type="button" class="btn btn-outline-secondary" data-mt-suivants>Afficher les ' + Math.min(MT_PAGE_TAILLE, p.restants) + ' suivants (' + p.restants + ' restants)</button></div>'
    : '';
  return _mtTitre(a.icone, _mtLibelleSecteur(cle) + (c ? ', autour de ' + c.nom : ', ' + _mtDepInfo().en)) + filtres +
    (noms.length ? _mtBandeauCommunes('secteur', noms, choix) : '') +
    (!noms.length || choix.length
      ? (liste.length ? '<p class="small text-muted text-center">Par ordre alphabétique : ce n’est pas un classement. ' + p.nbAffiches + ' sur ' + p.total + ' affichés.</p>' +
        '<div class="mt-grille-employeurs">' + p.page.map(function (e) { return _mtLigneEmployeur(e, c, choix); }).join('') + '</div>' + suite
        : '<p class="small text-muted text-center border rounded p-3">Aucun employeur saisi pour ce choix. Essayez une autre commune, ou « Voir toute la liste ».</p>')
      : _mtAucuneCommune()) +
    '<div class="text-center mt-3">' + _mtBoutonRegistre('bonne-boite', 'Autres employeurs du même secteur (La Bonne Boîte)') + '</div>';
}

// ------------------------------------------------------------
// Rubrique « Via prospection » (chantier docs/CHANTIER_VIA_PROSPECTION_QUI_FAIT_QUOI_2026-10-18.md) : les employeurs repérés par l'outil de prospection, à part des listes habituelles.
// Mêmes briques que le reste du module : puces de secteur avec compteur (comme « Où voir les offres »), bandeau des communes (B.32), cartes d'employeur.
// ------------------------------------------------------------
function _mtPastilleProspection() { return '<span class="badge text-bg-primary mt-1"><i class="bi bi-binoculars"></i> ' + MT_MARQUE_PROSPECTION + '</span>'; }
function _mtPhraseProspection() {
  return 'Cet employeur a été repéré lors d’une démarche de prospection, pas parce qu’il a publié une offre. Nous ne savons pas s’il recrute en ce moment : une candidature spontanée est possible, et il vaut mieux téléphoner d’abord.';
}

function _mtRenduProspection() {
  var toutes = _mtEmployeursProspection();
  var noms = _mtNomsCommunes([].concat.apply([], toutes.map(function (e) { return e.etablissementsListe.map(function (x) { return x.commune; }); })));
  var choix = _mtChoixCommune('prospection', noms);
  var c = _mtCommuneMemorisee();
  var dansChoix = function (e) { return _mtToutVoir(choix) || e.etablissementsListe.some(function (x) { return _mtDansChoix(x.commune, choix); }); };
  // Les compteurs des puces suivent les communes choisies (jamais un nombre qui promet plus que la liste montrée).
  var visibles = noms.length && !choix.length ? toutes : toutes.filter(dansChoix);
  var n = {};
  visibles.forEach(function (e) { n[e.secteur] = (n[e.secteur] || 0) + 1; });
  var cles = Object.keys(n).sort(function (a, b) { return _mtLibelleSecteur(a).localeCompare(_mtLibelleSecteur(b), 'fr', { sensitivity: 'base' }); });
  var cle = _mtEtat.secteurProspection;
  if (cle && !n[cle]) { cle = ''; }
  var puces = '<p class="text-center mb-1"><strong>Choisissez un secteur</strong> pour réduire la liste.</p>' +
    '<div class="d-flex flex-wrap gap-2 justify-content-center my-2" role="group" aria-label="Choisir un secteur">' +
    [['', 'Tous les secteurs (' + visibles.length + ')']].concat(cles.map(function (k) { return [k, _mtLibelleSecteur(k) + ' (' + n[k] + ')']; })).map(function (f) {
      return '<button type="button" class="btn btn-sm ' + (cle === f[0] ? 'btn-primary' : 'btn-outline-primary') + '" aria-pressed="' + (cle === f[0]) + '" data-mt-secteur-prospection="' + _mtEsc(f[0]) + '">' + _mtEsc(f[1]) + '</button>'; }).join('') + '</div>';
  var liste = mtTrierAlphabetique(visibles.filter(function (e) { return !cle || e.secteur === cle; }));
  var p = mtPaginer(liste, _mtEtat.nbAffiches);
  var suite = p.restants > 0
    ? '<div class="text-center my-2"><button type="button" class="btn btn-outline-secondary" data-mt-suivants>Afficher les ' + Math.min(MT_PAGE_TAILLE, p.restants) + ' suivants (' + p.restants + ' restants)</button></div>'
    : '';
  var corps;
  if (!toutes.length) { corps = _mtEncart('bi-info-circle', 'Cette rubrique n’a pas encore de liste pour votre département.'); }
  else {
    corps = puces + (noms.length ? _mtBandeauCommunes('prospection', noms, choix) : '') +
      (!noms.length || choix.length
        ? (liste.length ? '<p class="small text-muted text-center">Par ordre alphabétique : ce n’est pas un classement. ' + p.nbAffiches + ' sur ' + p.total + ' affichés.</p>' +
          '<div class="mt-grille-employeurs">' + p.page.map(function (e) { return _mtLigneEmployeur(e, c, choix); }).join('') + '</div>' + suite
          : '<p class="small text-muted text-center border rounded p-3">Aucun employeur pour ce choix. Essayez un autre secteur, une autre commune, ou « Voir toute la liste ».</p>')
        : _mtAucuneCommune());
  }
  return _mtTitre('bi-binoculars', MT_MARQUE_PROSPECTION + ' ' + _mtDepInfo().en) +
    _mtEncart('bi-info-circle', 'Ces employeurs ont été <strong>repérés lors de démarches de prospection</strong>, pas parce qu’ils ont publié une offre. Rien ne dit qu’ils recrutent en ce moment : une candidature spontanée est possible, et il vaut mieux téléphoner d’abord. Ils sont rangés ici, à part des autres listes.') +
    corps +
    '<p class="small text-muted mt-3">Liste non exhaustive. Aucun partenariat, aucune rémunération, aucun classement.</p>';
}

// ------------------------------------------------------------
// Rubrique « Employeurs qui publient leurs offres » (contenu/offres.txt) : on donne l'adresse de la page, jamais les offres.
// Textes validés par Denis : docs/TEXTES_RUBRIQUE_OFFRES_PUBLIEES_A_VALIDER_2026-10-17.md. Plan : docs/PLAN_RUBRIQUE_OFFRES_PUBLIEES_2026-10-17.md.
// ------------------------------------------------------------

function _mtToutesOffres() { return mtOffresVisibles(_mtDonnees.offres || [], _mtDepInfo().code, _mtAujourdhui()); }

var MT_GROUPES_OFFRES_TEXTES = {
  pres: { titre: 'Près de chez vous', phrase: function () { return 'Ces employeurs sont installés ' + _mtDepInfo().dans + '.'; } },
  grands: { titre: 'Grands employeurs', phrase: function () { return 'Ces entreprises ont une page de recrutement nationale. Regardez si une offre se trouve près de chez vous.'; } },
  public: { titre: 'Fonction publique', phrase: function () { return 'Mairies, département, hôpitaux publics, éducation, sécurité... Il existe des postes à plusieurs niveaux : regardez ce qui est indiqué dans chaque offre.'; } },
  groupements: { titre: 'Groupements d’employeurs et chambres', phrase: function () { return 'Ces structures publient les offres de plusieurs entreprises à la fois.'; } }
};

function _mtTerritoireOffre(o) {
  // Jamais « Toute la France » : l'application ne repère que les départements de sa table ; une page nationale est seulement la page de l'employeur.
  if (o.territoire === 'national') { return 'Page nationale de l’employeur'; }
  if (o.territoire === 'region') { return 'Nouvelle-Aquitaine'; }
  var d = mtDepartement(o.territoire);
  return d ? d.nom : '';
}

// Bouton d'une page d'offres : le texte dit où l'on va, la phrase dessous dit qu'on quitte l'application.
function _mtBoutonOffres(url, libelle, classe) {
  return '<a class="' + classe + '" href="' + _mtEsc(url) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> ' + _mtEsc(libelle) + '</a>';
}

// Les trois portes d'entrée, en haut de l'écran des secteurs (demande de Denis, 2026-10-17) : un peu plus grandes que les 21 secteurs, qui suivent juste dessous.
function _mtPortesPrincipales() {
  var offres = '<button type="button" class="sous-carte-accueil mt-porte" data-mt-offres><i class="bi bi-box-arrow-up-right"></i>' +
    '<strong>Employeurs qui publient leurs offres</strong><span>Les pages où les employeurs publient eux-mêmes leurs offres : vous les consultez directement sur leurs sites</span></button>';
  var nbInterim = _mtAgencesInterim().length;
  var interim = '<button type="button" class="sous-carte-accueil mt-porte" ' + (nbInterim ? 'data-mt-interim' : 'data-mt-vide="Agences d’intérim"') + '><i class="bi bi-arrow-repeat"></i><strong>Agences d’intérim</strong>' +
    '<span>Inscription possible dans tous les secteurs</span>' + (nbInterim ? '' : '<span class="badge text-bg-light mt-1">Pas encore de liste</span>') + '</button>';
  var siae = '<button type="button" class="sous-carte-accueil mt-porte" data-mt-siae><i class="bi bi-signpost-split"></i><strong>Insertion par l’activité économique</strong>' +
    '<span>Un emploi avec un accompagnement : on y entre par un conseiller</span></button>';
  var nbPros = _mtEmployeursProspection().length;
  var prospection = nbPros
    ? '<button type="button" class="sous-carte-accueil mt-porte" data-mt-prospection><i class="bi bi-binoculars"></i><strong>' + MT_MARQUE_PROSPECTION + '</strong>' +
      '<span>Des employeurs repérés lors de démarches de prospection : une porte pour une candidature spontanée</span><span class="badge text-bg-primary mt-1">' + nbPros + (nbPros > 1 ? ' employeurs' : ' employeur') + '</span></button>'
    : '';
  return '<div class="grille-sous-cartes-accueil mt-3">' + offres + interim + siae + prospection + '</div>';
}

// Écran « Insertion par l'activité économique » : ce qu'il faut savoir avant de chercher (prescription, pass IAE). Textes à valider par Denis.
// Les deux lignes « annuaire » du répertoire (INAÉ, annuaire général d'un département) renvoient vers un annuaire : elles ne sont pas des structures à lister.
var MT_IDS_ANNUAIRES_SIAE = ['inae-nouvelle-aquitaine', 'structures-iae-dordogne'];
function _mtStructuresSiae() {
  var dep = _mtDepInfo().code;
  return _mtLieux().filter(function (l) { return l.type === 'siae' && l.portee === dep && MT_IDS_ANNUAIRES_SIAE.indexOf(l.id) === -1; })
    .sort(function (x, y) { return x.nom.localeCompare(y.nom, 'fr', { sensitivity: 'base' }); });
}

// Les agences d'intérim du département (nature « interim »), une fiche par agence, rangées par commune puis par nom.
function _mtAgencesInterim() {
  return _mtEmployeurs().filter(function (e) { return e.nature === 'interim'; }).sort(function (a, b) {
    var ca = a.etablissementsListe[0] ? a.etablissementsListe[0].commune : '', cb = b.etablissementsListe[0] ? b.etablissementsListe[0].commune : '';
    return ca.localeCompare(cb, 'fr', { sensitivity: 'base' }) || a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
  });
}

function _mtRenduInterim() {
  var agences = _mtAgencesInterim(), c = _mtCommuneMemorisee();
  var parCommune = {}, ordre = [];
  agences.forEach(function (e) { var v = e.etablissementsListe[0] ? e.etablissementsListe[0].commune : ''; if (!parCommune[v]) { parCommune[v] = []; ordre.push(v); } parCommune[v].push(e); });
  var noms = _mtNomsCommunes(ordre), choix = _mtChoixCommune('interim', noms);
  var montrees = _mtToutVoir(choix) ? ordre : ordre.filter(function (v) { return _mtDansChoix(v, choix); });
  var corps = montrees.length ? montrees.map(function (v) {
    return '<h2 class="h5 fw-bold text-uppercase text-muted mt-4 mb-2">' + _mtEsc(_mtCommuneCp(v)) + '</h2><div class="mt-grille-employeurs">' + parCommune[v].map(function (e) { return _mtLigneEmployeur(e, c); }).join('') + '</div>';
  }).join('') : (choix.length ? '<p class="small text-muted text-center border rounded p-3">Aucune agence saisie pour ce choix. Essayez une autre commune, ou « Voir toute la liste ».</p>' : _mtAucuneCommune());
  return _mtTitre('bi-arrow-repeat', 'Agences d’intérim ' + _mtDepInfo().en, 'Une agence d’intérim vous propose des missions temporaires dans tous les secteurs. Vous vous inscrivez auprès d’elle ; elle vous contacte quand une mission correspond à votre profil.') +
    _mtBandeauCommunes('interim', noms, choix) + (montrees.length ? '<p class="small text-muted text-center">Rangées par commune puis par ordre alphabétique : ce n’est pas un classement. Chaque fiche donne le numéro de l’agence et sa page.</p>' : '') + corps +
    '<div class="comprendre-le-cadre-encart mt-4"><i class="bi bi-search"></i> Une agence ne figure pas dans la liste ? Chercher par vous-même. ' + _mtBoutonRegistre('bonne-boite', 'La Bonne Boîte') + '</div>' +
    '<p class="small text-muted mt-3">Liste non exhaustive. Aucun partenariat, aucune rémunération.</p>';
}

// Un bouton vers une adresse du registre, seulement si elle est datée de moins de 12 mois (sinon rien : jamais un lien non vérifié).
function _mtBoutonRegistre(nom, libelle) {
  var url = mtLienAffichable(_mtDonnees.liens, nom, _mtAujourdhui());
  return url ? _mtBoutonLienExterne(url, libelle) : '';
}

function _mtRenduSiae() {
  var toutes = _mtStructuresSiae();
  var noms = _mtNomsCommunes(toutes.map(function (l) { return l.commune; }).filter(Boolean)), choix = _mtChoixCommune('siae', noms);
  var tous = (_mtToutVoir(choix) || !noms.length) ? toutes : (choix.length ? toutes.filter(function (l) { return _mtDansChoix(l.commune, choix); }) : []);
  var p = mtPaginer(tous, _mtEtat.nbAffiches);
  var suite = p.restants > 0
    ? '<div class="text-center my-2"><button type="button" class="btn btn-outline-secondary" data-mt-suivants>Afficher les ' + Math.min(MT_PAGE_TAILLE, p.restants) + ' suivantes (' + p.restants + ' restantes)</button></div>' : '';
  var liste = toutes.length
    ? '<h2 class="h5 fw-bold text-uppercase text-muted mt-4">Les structures d’insertion ' + _mtEsc(_mtDepInfo().en) + '</h2>' + (noms.length ? _mtBandeauCommunes('siae', noms, choix) : '') +
      (!noms.length || choix.length
        ? (tous.length ? '<p class="small text-muted">' + p.nbAffiches + ' sur ' + p.total + ', par ordre alphabétique : ce n’est pas un classement. Chaque fiche donne ce que la structure propose et renvoie vers sa page.</p>' +
          '<div class="mt-grille-employeurs">' + p.page.map(_mtCarteLieu).join('') + '</div>' + suite
          : '<p class="small text-muted text-center border rounded p-3">Aucune structure saisie pour cette commune. Essayez une autre commune, ou « Voir toute la liste ».</p>')
        : _mtAucuneCommune())
    : '';
  return _mtTitre('bi-signpost-split', 'Insertion par l’activité économique', 'Des entreprises et des associations qui embauchent pour vous aider à retrouver un emploi, avec un accompagnement.') +
    '<details class="bloc-depli bd-ok" open><summary>Comment y entrer</summary><div class="bloc-depli-corps"><ol class="mb-0">' +
      '<li><strong>Voyez un conseiller.</strong> Il regarde votre situation avec vous et confirme que ce parcours peut vous convenir. On appelle cela une « prescription ». Elle est faite par un conseiller en insertion d’une structure d’accompagnement (par exemple France Travail, une mission locale, Cap emploi ou un service social).</li>' +
      '<li><strong>Regardez les offres</strong> sur le site officiel « La plateforme de l’inclusion » (on peut chercher sans créer de compte), ou contactez directement une structure.</li>' +
      '<li><strong>Si votre candidature est retenue</strong>, la structure fait établir votre pass IAE au moment de l’embauche. Vous n’avez pas à le demander vous-même.</li></ol></div></details>' +
    '<details class="bloc-depli bd-ok" open><summary>Le pass IAE</summary><div class="bloc-depli-corps">' +
      '<p class="mb-1">C’est le document qui vous permet de travailler dans les structures d’insertion. Il est valable <strong>2 ans au plus</strong>. Votre conseiller peut vous aider à faire cette démarche.</p>' +
      '<p class="small text-muted mb-0">Les règles peuvent évoluer : votre conseiller vous confirme la démarche à suivre.</p></div></details>' +
    liste +
    '<h2 class="h5 fw-bold text-uppercase text-muted mt-4">Pour aller plus loin</h2>' +
    '<div class="d-flex flex-wrap gap-2">' + _mtBoutonRegistre('siae-annuaire-inae', 'Annuaire INAÉ : toutes les structures de Nouvelle-Aquitaine, avec filtres') + _mtBoutonRegistre('siae-plateforme-inclusion', 'Les offres des structures d’insertion (plateforme de l’inclusion)') + _mtBoutonRegistre('siae-aide-pass-iae', 'Le pass IAE : comment ça marche') + _mtBoutonRegistre('siae-francetravail-iae', 'Comprendre l’insertion par l’activité économique (France Travail)') + '</div>' +
    '<p class="small text-muted mt-3">Liste non exhaustive. Aucun partenariat, aucune rémunération.</p>';
}

function _mtLigneOffre(o) {
  var fraicheur = mtFraicheurOffre(o.date, _mtAujourdhui());
  var verifie = fraicheur === 'recente'
    ? '<span class="d-block small fw-semibold" style="color:var(--success-strong)"><i class="bi bi-check-circle"></i> Vérifié le ' + _mtEsc(_mtDateFr(o.date)) + '</span>'
    : '<span class="d-block small text-muted"><i class="bi bi-clock-history"></i> Vérifié le ' + _mtEsc(_mtDateFr(o.date)) + ' : à revérifier, la page a peut-être changé</span>';
  // Une carte par page d'offres (grille de 1 à 4 colonnes) : nom, secteur et territoire, pastille de vérification, puis le bouton.
  return '<div class="comprendre-le-cadre-encart mt-carte-employeur">' +
    '<span class="d-block fw-semibold">' + _mtEsc(o.nom) + '</span>' +
    '<span class="d-block small">' + _mtEsc(_mtLibelleSecteur(o.secteur)) + ' · ' + _mtEsc(_mtTerritoireOffre(o)) + '</span>' + verifie +
    '<span class="mt-2 d-block">' + _mtBoutonOffres(o.page, 'Ouvrir la page des offres', 'btn btn-sm btn-primary') + '<span class="d-block small text-muted">Vous quittez l’application.</span></span></div>';
}

function _mtRenduOffres() {
  var toutes = _mtToutesOffres();
  var cle = _mtEtat.secteurOffres;
  var n = {};
  toutes.forEach(function (o) { n[o.secteur] = (n[o.secteur] || 0) + 1; });
  var cles = Object.keys(n).sort(function (a, b) { return _mtLibelleSecteur(a).localeCompare(_mtLibelleSecteur(b), 'fr', { sensitivity: 'base' }); });
  if (cle && !n[cle]) { cle = ''; }
  var puces = '<div class="d-flex flex-wrap gap-2 justify-content-center my-2" role="group" aria-label="Choisir un secteur">' +
    [['', 'Tous les secteurs (' + toutes.length + ')']].concat(cles.map(function (k) { return [k, _mtLibelleSecteur(k) + ' (' + n[k] + ')']; })).map(function (f) {
      return '<button type="button" class="btn btn-sm ' + (cle === f[0] ? 'btn-primary' : 'btn-outline-primary') + '" aria-pressed="' + (cle === f[0]) + '" data-mt-secteur-offres="' + _mtEsc(f[0]) + '">' + _mtEsc(f[1]) + '</button>'; }).join('') + '</div>';
  var g = mtOffresParGroupe(_mtDonnees.offres || [], _mtDepInfo().code, _mtAujourdhui(), cle);
  var groupes = MT_GROUPES_OFFRES.filter(function (k) { return g[k].length; }).map(function (k) {
    return '<h2 class="h5 fw-bold text-uppercase text-muted mt-4" id="mt-groupe-' + k + '">' + _mtEsc(MT_GROUPES_OFFRES_TEXTES[k].titre) + '</h2><p class="small text-muted">' + _mtEsc(MT_GROUPES_OFFRES_TEXTES[k].phrase()) + '</p>' +
      '<div class="mt-grille-employeurs">' + g[k].map(_mtLigneOffre).join('') + '</div>';
  }).join('');
  var vide = '';
  if (!toutes.length) { vide = _mtEncart('bi-info-circle', 'Cette rubrique n’a pas encore de liste pour votre département.'); }
  else if (!groupes) { vide = _mtEncart('bi-info-circle', 'Pas encore de page pour ce secteur. Ce n’est ni une erreur ni un oubli de votre part : la liste grandit petit à petit.'); }
  return _mtTitre('bi-box-arrow-up-right', 'Où voir les offres d’emploi ' + _mtDepInfo().en, 'Des employeurs publient eux-mêmes leurs offres sur leur propre site. Voici où les trouver.') +
    _mtEncart('bi-info-circle', 'Nous ne recopions pas les offres : elles changent tous les jours. Ouvrez la page de l’employeur et regardez ce qui est publié aujourd’hui. Si rien ne vous convient, vous pouvez aussi lui écrire en candidature spontanée.') +
    (toutes.length ? puces : '') + vide + groupes +
    '<div class="comprendre-le-cadre-encart mt-4"><i class="bi bi-search"></i> Vous ne trouvez pas ? Chercher par vous-même. ' + _mtBoutonRegistre('bonne-boite', 'La Bonne Boîte') + '</div>' +
    '<p class="small text-muted mt-3">Liste non exhaustive. Aucun partenariat, aucune rémunération, aucun classement : les employeurs sont rangés par ordre alphabétique dans chaque groupe.</p>' +
    '<div class="text-center"><button type="button" class="btn btn-sm btn-outline-secondary" data-mt-criteres-offres>Comment les pages sont choisies</button></div>';
}

function _mtRenduCriteresOffres() {
  return _mtTitre('bi-clipboard-check', 'Comment les pages sont choisies') +
    '<details class="bloc-depli bd-ok" open><summary>Ce que nous vérifions</summary><div class="bloc-depli-corps"><ul class="mb-0">' +
      '<li>La page appartient à l’employeur lui-même (ou au logiciel de recrutement officiel vers lequel son site renvoie).</li>' +
      '<li>Elle a été ouverte à la main, et on y a vu une liste d’offres. La date de cette vérification est affichée.</li></ul></div></details>' +
    '<details class="bloc-depli bd-warn" open><summary>Ce que nous ne faisons pas</summary><div class="bloc-depli-corps"><ul class="mb-0">' +
      '<li>Pas d’intermédiaire ni de site qui recopie des offres venues d’ailleurs, pas d’agence d’intérim.</li>' +
      '<li>Pas de classement, pas de recommandation, pas de garantie qu’un employeur recrute près de chez vous.</li>' +
      '<li>Aucun partenariat, aucune rémunération des employeurs.</li></ul></div></details>' +
    '<details class="bloc-depli bd-ok" open><summary>Mise à jour</summary><div class="bloc-depli-corps">Une page est revérifiée régulièrement. Si elle ne répond plus, elle est retirée de la liste.</div></details>';
}

function _mtRenduRecherche() {
  var q = _mtEtat.requete;
  var emp = mtRechercherEmployeurs(_mtEmployeurs(), _mtSecteurs(), q);
  var pros = mtRechercherEmployeurs(_mtEmployeursProspection(), _mtSecteurs(), q);
  var sec = mtRechercherSecteurs(_mtSecteurs(), q);
  var c = _mtCommuneMemorisee();
  var str = mtRechercherLieux(_mtLieux(), q, (typeof FREINS_REPERTOIRE !== 'undefined') ? FREINS_REPERTOIRE : null);
  var freinsTrouves = (typeof FREINS_REPERTOIRE !== 'undefined') ? mtFreinsCorrespondants(FREINS_REPERTOIRE, q) : [];
  var pourFrein = {};
  freinsTrouves.forEach(function (fr) { mtLieuxPourFrein(_mtLieux(), FREINS_REPERTOIRE[fr.code]).forEach(function (l) { if (!pourFrein[l.id]) { pourFrein[l.id] = fr.titre; if (!str.some(function (x) { return x.id === l.id; })) { str.push(l); } } }); });
  var html = _mtTitre('bi-search', 'Résultats pour « ' + q + ' »') + _mtRenduChampRecherche('Un métier, un secteur, un employeur, une structure');
  if (sec.length) {
    html += '<h2 class="h5 fw-bold text-uppercase text-muted mt-3">Secteurs</h2><div class="grille-sous-cartes-accueil">' + sec.map(function (s) {
      var a = MT_SECTEURS_AFFICHAGE[s.cle] || { icone: 'bi-briefcase', exemples: '' };
      return '<button type="button" class="sous-carte-accueil" data-mt-secteur="' + s.cle + '"><i class="bi ' + a.icone + '"></i><strong>' + _mtEsc(s.libelle) + '</strong><span>' + _mtEsc(a.exemples) + '</span></button>'; }).join('') + '</div>';
  }
  if (emp.length) { html += '<h2 class="h5 fw-bold text-uppercase text-muted mt-3">Employeurs</h2>' + '<div class="mt-grille-employeurs">' + emp.map(function (e) { return _mtLigneEmployeur(e, c); }).join('') + '</div>'; }
  if (pros.length) { html += '<h2 class="h5 fw-bold text-uppercase text-muted mt-3">' + MT_MARQUE_PROSPECTION + '</h2>' + '<div class="mt-grille-employeurs">' + pros.map(function (e) { return _mtLigneEmployeur(e, c); }).join('') + '</div>'; }
  if (str.length) {
    html += '<h2 class="h5 fw-bold text-uppercase text-muted mt-3">Structures</h2>' + str.map(function (l) {
      return (pourFrein[l.id] ? '<p class="small text-muted mb-1 mt-2">Pour : ' + _mtEsc(pourFrein[l.id]) + '</p>' : '') + _mtCarteLieu(l) + '<div class="mb-3"><button type="button" class="btn btn-sm btn-outline-primary" data-mt-lieux-rayon="' + _mtEsc(l.rayonsListe[0]) + '">Voir toute la liste du domaine</button></div>'; }).join('');
  }
  if (!sec.length && !emp.length && !pros.length && !str.length) {
    html += _mtEncart('bi-info-circle', 'Aucun résultat pour « ' + _mtEsc(q) + ' ». Essayez un métier (caissier), un secteur (commerce) ou le nom d’un employeur.') +
      '<div class="text-center">' + _mtBoutonRegistre('bonne-boite', 'Chercher par moi-même (La Bonne Boîte)') + '</div>';
  }
  return html;
}

function _mtNbLieux(rayon) { return mtLieuxDuRayon(_mtLieux(), rayon).length; }

// L'écran de domaine (« social » ou « formation ») qui contient la sous-branche d'un rayon ; « social » par défaut.
function _mtSousBrancheDuRayon(rayon) {
  var out = null;
  Object.keys(MT_SOUS_BRANCHES).forEach(function (d) { MT_SOUS_BRANCHES[d].forEach(function (b) { if (b.rayon === rayon) { out = b; } }); });
  return out;
}

function _mtEcranDuRayon(rayon) { return (typeof mtDomaineDuRayon === 'function' && mtDomaineDuRayon(rayon)) || 'social'; }

var _MT_TITRES_DOMAINES = {
  social: { icone: 'bi-people', titre: 'Social : logement, mobilité, accompagnement, budget' },
  formation: { icone: 'bi-mortarboard', titre: 'Formation : se former, se reconvertir, jeunes' },
  'vie-pratique': { icone: 'bi-basket', titre: 'Vie pratique : garde d’enfant, santé, retraite' },
  'droits-justice': { icone: 'bi-journal-text', titre: 'Droits et justice : accès au droit, sortie de détention' },
  creer: { icone: 'bi-rocket-takeoff', titre: 'Créer son activité : conseil, financement, coopératives' },
  'accueil-langue': { icone: 'bi-globe2', titre: 'Accueil et langue : apprendre le français, démarches des étrangers' },
  'appui-employeurs': { icone: 'bi-building', titre: 'Appui aux employeurs : cotisations, santé au travail, aides à l’embauche' }
};

function _mtRenduDomaine(domaine) {
  var tuiles = MT_SOUS_BRANCHES[domaine].map(function (b) {
    var n = _mtNbLieux(b.rayon);
    return '<button type="button" class="sous-carte-accueil" data-mt-sousbranche="' + b.id + '"' + (n ? '' : ' style="opacity:.8"') + '><i class="bi ' + b.icone + '"></i><strong>' + _mtEsc(b.libelle) + '</strong><span>' + _mtEsc(b.sousTitre) + '</span>' +
      (n ? '<span class="badge text-bg-primary mt-1">' + n + ' structures</span>' : '<span class="badge text-bg-light mt-1">Pas encore de liste</span>') + '</button>';
  }).join('');
  return _mtTitre(_MT_TITRES_DOMAINES[domaine].icone, _MT_TITRES_DOMAINES[domaine].titre, 'Les structures à qui vous adresser, avec ce qu\u2019elles font.') +
    '<div class="grille-sous-cartes-accueil">' + tuiles + '</div>' +
    '<p class="small text-muted mt-3"><i class="bi bi-info-circle"></i> Les structures viennent de « Comprendre le cadre » : une seule liste, vérifiée à la main, avec sa date.</p>';
}

// Une structure : même carte que l'écran « Près de chez moi » de Comprendre le cadre (nom, description, téléphone, mail et lien seulement s'ils sont vérifiés et datés : UNE carte partagée, mtCarteStructureHtml dans logique.js).
function _mtCarteLieu(l) {
  return mtCarteStructureHtml(mtLieuEnStructure(l, _mtAujourdhui(), mtCommuneInfoMemorisee()), { dateFr: _mtDateFr, communeAffichee: l.commune ? _mtCommuneCp(l.commune) : '' });
}

function _mtRenduLieux() {
  var b = _mtSousBrancheDuRayon(_mtEtat.rayon) || { libelle: _mtEtat.rayon, icone: 'bi-geo-alt' };
  var liste = mtLieuxDuRayon(_mtLieux(), _mtEtat.rayon);
  // Accompagnement : les structures d'insertion (qui accompagnent ET font travailler) ont leur écran ; ici, une case qui y renvoie au lieu de les mélanger aux autres.
  var carteInsertion = '';
  if (_mtEtat.rayon === 'accompagnement') {
    liste = liste.filter(function (l) { return l.type !== 'siae'; });
    carteInsertion = '<div class="comprendre-le-cadre-encart mb-3"><i class="bi bi-signpost-split"></i> <strong>Insertion par l’activité économique</strong>' +
      '<p class="mb-2 mt-1">Des entreprises et des associations qui vous <strong>font travailler et vous accompagnent en même temps</strong>, pendant vos heures de travail. On y entre par un conseiller.</p>' +
      '<button type="button" class="btn btn-primary btn-sm" data-mt-siae>Voir les structures d’insertion ' + _mtEsc(_mtDepInfo().en) + ' (' + _mtStructuresSiae().length + ')</button></div>';
  }
  function section(titre, l, notesHtml) { return l.length ? '<h2 class="h5 fw-bold text-uppercase text-muted mt-4 mb-2">' + titre + '</h2>' + (notesHtml || '') + l.map(_mtCarteLieu).join('') : ''; }
  // Plusieurs guichets possibles selon la commune (Missions locales, PLIE) : la structure qui couvre la commune choisie passe en premier ; sinon une phrase honnête (D12).
  var commune = mtCommuneInfoMemorisee();
  var dep = _mtDepInfo();
  var duDepartement = liste.filter(function (l) { return l.portee === dep.code; });
  var structuresDuDep = mtOrdonnerParCommune(duDepartement.map(function (l) { return mtLieuEnStructure(l, _mtAujourdhui(), commune); }));
  var duDepOrdonne = structuresDuDep.map(function (st) { return duDepartement.filter(function (l) { return l.id === st.id; })[0]; });
  var notes = mtNotesSelonCommune(structuresDuDep).map(function (n) { return '<div class="comprendre-le-cadre-encart mb-2"><i class="bi bi-info-circle"></i> ' + _mtEsc(n) + '</div>'; }).join('');
  // Choix de la commune : les communes du bandeau sont celles où une structure est installée, plus la commune déjà indiquée par la personne (une structure installée ailleurs peut la couvrir).
  var cm = _mtCommuneMemorisee();
  var noms = _mtNomsCommunes(duDepartement.map(function (l) { return l.commune; }).filter(Boolean).concat(cm ? [cm.nom] : []));
  var choix = _mtChoixCommune('lieux-' + _mtEtat.rayon, noms);
  var corps;
  if (noms.length && !choix.length) { corps = _mtAucuneCommune(); }
  else if (noms.length && !_mtToutVoir(choix)) {
    // Pour les communes choisies : ce qui est installé là, ce dont la zone les couvre, et ce qui vaut pour tout le département (zone et commune non précisées : jamais devinées, jamais cachées).
    var infosChoix = choix.map(function (nom) { var ci = _mtCommunes().filter(function (x) { return x.cle === mtNormaliser(nom); })[0]; return ci ? { code: ci.code, nom: ci.nom, cle: ci.cle, epci: ci.epci } : null; });
    var concerne = function (l) { return (l.commune && _mtDansChoix(l.commune, choix)) || infosChoix.some(function (i) { return mtZoneCouvre(l.zone, i) === true; }); };
    var stChoix = mtOrdonnerParCommune(duDepartement.map(function (l) { var st = mtLieuEnStructure(l, _mtAujourdhui(), null); st.couvre = concerne(l) ? true : null; return st; }));
    var lieuDe = function (st) { return duDepartement.filter(function (l) { return l.id === st.id; })[0]; };
    var toutLeDep = stChoix.map(lieuDe).filter(function (l) { return !l.commune && !String(l.zone || '').trim(); });
    var pourCommune = stChoix.map(lieuDe).filter(function (l) { return toutLeDep.indexOf(l) === -1 && concerne(l); });
    var notesChoix = mtNotesSelonCommune(stChoix).map(function (x) { return '<div class="comprendre-le-cadre-encart mb-2"><i class="bi bi-info-circle"></i> ' + _mtEsc(x) + '</div>'; }).join('');
    corps = section('Partout en France', liste.filter(function (l) { return l.portee === 'national'; })) +
      section('En Nouvelle-Aquitaine', liste.filter(function (l) { return l.portee === 'region'; })) +
      section('Pour tout le département', toutLeDep) +
      section('Pour ' + _mtEsc(choix.join(', ')), pourCommune, notesChoix);
    if (!pourCommune.length && !toutLeDep.length && !liste.some(function (l) { return l.portee === 'national' || l.portee === 'region'; })) { corps += _mtEncart('bi-info-circle', 'Pas encore de structure saisie pour cette commune. Essayez « Voir toute la liste ».'); }
  } else {
    corps = section('Partout en France', liste.filter(function (l) { return l.portee === 'national'; })) +
      section('En Nouvelle-Aquitaine', liste.filter(function (l) { return l.portee === 'region'; })) +
      section(_mtEsc(mtMajuscule(dep.en)), duDepOrdonne, notes);
    if (!corps) { corps = _mtEncart('bi-info-circle', 'Pas encore de liste pour ce domaine.'); }
  }
  return _mtTitre(b.icone, b.libelle + ', ' + dep.en) +
    carteInsertion + (noms.length ? _mtBandeauCommunes('lieux-' + _mtEtat.rayon, noms, choix) : '') + (corps && !(noms.length && !choix.length) ? '<p class="small text-muted text-center">Par ordre alphabétique dans chaque partie : ce n\u2019est pas un classement.</p>' : '') + corps +
    '<div class="comprendre-le-cadre-encart mt-4"><i class="bi bi-newspaper"></i> Pour comprendre les aides et les démarches de ce domaine : ' +
    '<button type="button" class="btn btn-outline-primary btn-sm ms-1" data-mt-vers-cadre="' + _mtEsc(_mtEtat.rayon) + '">Comprendre : ' + _mtEsc(b.libelle) + ' (Comprendre le cadre)</button></div>';
}

function _mtRenduVide() {
  var quoi = _mtEtat.vide ? ' pour « ' + _mtEsc(_mtEtat.vide) + ' »' : '';
  return _mtTitre('bi-hourglass-split', 'Pas encore de liste ici') +
    _mtEncart('bi-info-circle', 'Nous n’avons pas encore de liste vérifiée' + quoi + '. Ce n’est ni une erreur ni un oubli de votre part : les listes se construisent petit à petit.') +
    '<p>En attendant, vous pouvez :</p><div class="d-flex flex-wrap gap-2">' + _mtBoutonRegistre('bonne-boite', 'Chercher par vous-même (La Bonne Boîte)') +
    '<button type="button" class="btn btn-outline-primary" data-mt-retour-accueil>Voir un domaine qui a une liste</button></div>';
}

function _mtRenduCriteres() {
  return _mtTitre('bi-clipboard-check', 'Comment les fiches sont choisies') +
    '<details class="bloc-depli bd-ok" open><summary>Ce que nous vérifions</summary><div class="bloc-depli-corps"><ul class="mb-0">' +
      '<li>L’établissement existe légalement (registre officiel des entreprises).</li><li>Il se trouve sur le territoire indiqué.</li>' +
      '<li>Ses coordonnées publiques viennent de son site officiel, avec la date de la dernière vérification affichée sur chaque fiche.</li></ul></div></details>' +
    '<details class="bloc-depli bd-warn" open><summary>Ce que nous ne faisons pas</summary><div class="bloc-depli-corps"><ul class="mb-0">' +
      '<li>Pas de classement (les listes sont par ordre alphabétique), pas de recommandation, pas de garantie de recrutement.</li>' +
      '<li>Pas d’offres d’emploi recopiées : elles changent trop vite. La rubrique « Employeurs qui publient leurs offres » indique seulement les pages où les employeurs les publient eux-mêmes.</li>' +
      '<li>Aucun partenariat, aucune rémunération des employeurs ou des structures.</li>' +
      '<li>Jamais le nom d’une personne : seulement les coordonnées d’un organisme.</li></ul></div></details>' +
    '<details class="bloc-depli bd-ok"><summary>Vérification et mise à jour</summary><div class="bloc-depli-corps">Une fiche vérifiée depuis plus d’un an est marquée « à revérifier ».</div></details>';
}

// Adresse d'un établissement : un lien qui ouvre la carte (nouvel onglet ; sur un téléphone, l'application de cartes). Seule l'adresse publique de l'employeur est transmise.
function _mtUrlCarte(adresse) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(adresse); }
// Téléphone : cliquable (il compose le numéro) seulement sur un appareil tactile ; sur ordinateur, un simple texte, car un clic n'y ouvrirait rien d'utile.
function _mtEstTactile() { try { return !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches); } catch (e) { return false; } }
function _mtTelephoneAffiche(tel) {
  // Le numéro tient toujours sur UNE seule ligne (espaces insécables), lien ou simple texte.
  var _num = _mtEsc(tel).replace(/ /g, '&nbsp;');
  return '<span style="white-space:nowrap">' + (_mtEstTactile() ? '<a href="tel:' + _mtEsc(String(tel).replace(/\s+/g, '')) + '">' + _num + '</a>' : _num) + '</span>';
}

function _mtRenduFiche() {
  var e = _mtTousLesEmployeurs().filter(function (x) { return x.id === _mtEtat.id; })[0];
  if (!e) { return _mtEncart('bi-exclamation-circle', 'Cette fiche n’existe plus.') + '<div class="text-center"><button type="button" class="btn btn-outline-primary" data-mt-retour-accueil>Retour à l’accueil du module</button></div>'; }
  var aujourdhui = _mtAujourdhui();
  var fraicheur = mtFraicheur(e.date, aujourdhui);
  var aff = mtContactAffichable(e, aujourdhui);
  var telsMagasins = e.etablissementsListe.some(function (x) { return x.telephone; });
  var lieux = e.etablissementsListe.map(function (x, i) {
    return '<span class="d-block"><i class="bi bi-geo-alt"></i> <strong>' + _mtEsc(_mtCommuneCp(x.commune)) + '</strong>' + (x.adresse ? ' : ' + _mtEsc(x.adresse) : '') +
      (x.telephone && fraicheur === 'recente' ? ' · <i class="bi bi-telephone"></i> ' + _mtTelephoneAffiche(x.telephone) : (telsMagasins && !x.telephone && !e.telephone ? ' · <span class="text-muted">numéro en cours de vérification</span>' : '')) +
      (x.adresse && fraicheur === 'recente' ? ' <a class="btn btn-sm btn-outline-primary ms-1" href="' + _mtEsc(_mtUrlCarte(e.nom + ', ' + x.adresse + ', ' + x.commune)) + '" target="_blank" rel="noopener"><i class="bi bi-map"></i> Voir sur la carte</a>' : '') + '</span>'; }).join('');
  var verifie = fraicheur === 'recente' ? 'Vérifié le ' + _mtDateFr(e.date)
    : fraicheur === 'a-reverifier' ? 'Vérifié le ' + _mtDateFr(e.date) + ' : à revérifier, appelez avant de vous déplacer' : 'Pas encore vérifié';
  var pastilles = e.nature === 'interim' ? '<span class="badge rounded-pill text-bg-light me-1">Inscription à l’agence</span>' : e.modesListe.map(function (m) { return '<span class="badge rounded-pill text-bg-light me-1">' + _mtEsc(MT_MODES[m] || m) + '</span>'; }).join('');
  var infos = '<span class="d-block"><i class="bi bi-building"></i> ' + _mtNatureLibelle(e) + (e.nature === 'interim' ? '' : ' · ' + _mtEsc(_mtLibelleSecteur(e.secteur))) + '</span>' + lieux +
    ((e.telephone || !telsMagasins) ? '<span class="d-block"><i class="bi bi-telephone"></i> <strong>' + (e.nature === 'interim' ? 'Téléphone de l’agence' : (telsMagasins ? 'Numéro général de l’enseigne' : 'Téléphone du standard')) + '</strong> : ' + (aff.telephone ? _mtTelephoneAffiche(e.telephone) : 'numéro en cours de vérification') + '</span>' : '') +
    '<span class="d-block"><i class="bi bi-clock-history"></i> ' + _mtEsc(verifie) + '</span>';
  var actions = '';
  if (aff.site) { actions += _mtBoutonLienExterne(e.site, 'Voir le site') + ' '; }
  var offre = mtOffreDeLEmployeur(_mtDonnees.offres, e.id, aujourdhui);
  if (offre) { actions += '<span class="d-inline-block">' + _mtBoutonOffres(offre.page, 'Ses offres publiées', 'btn btn-primary') + '<span class="d-block small text-muted">L’employeur publie lui-même ses offres sur cette page. Vous quittez l’application.</span></span> '; }
  else if (aff.recrutement) { actions += _mtBoutonLienExterne(e.recrutement, 'Page de recrutement') + ' '; }   // repli : l'adresse notée sur la fiche elle-même quand la page n'est pas (encore) dans offres.txt
  var noteSite = (!aff.site && e.nom) ? '<p class="small text-muted mb-0">Le site de l’organisme n’est pas encore vérifié : il sera indiqué ici dès que ce sera fait.</p>' : '';
  var viaProspection = mtViaProspection(e);
  return _mtTitre('bi-building', e.nom) +
    (viaProspection ? '<p class="text-center">' + _mtPastilleProspection() + '</p>' : '') +
    '<div class="comprendre-le-cadre-encart mb-3">' + infos + '</div>' +
    (viaProspection ? _mtEncart('bi-binoculars', '<strong>Pourquoi cet employeur est ici ?</strong> ' + _mtEsc(_mtPhraseProspection())) : '') +
    '<details class="bloc-depli bd-ok" open><summary>Comment candidater ici ?</summary><div class="bloc-depli-corps">' + pastilles +
      (e.nature === 'interim' ? '<p class="small mt-2 mb-0">Une agence d’intérim propose des missions temporaires dans plusieurs secteurs. Vous vous inscrivez auprès d’elle (sur place, par téléphone ou sur son site) ; elle vous contacte quand une mission correspond à votre profil.</p>' : '<p class="small text-muted mt-2 mb-0">Ces repères informent, ils ne sont pas à cocher. Nous ne savons pas à quelle fréquence cet employeur recrute et ne l’affirmons jamais.</p>') + '</div></details>' +
    '<details class="bloc-depli bd-warn" open><summary>Avant d’y aller</summary><div class="bloc-depli-corps"><ul class="mb-0">' +
      '<li>Téléphonez d’abord pour demander à qui remettre votre candidature.</li><li>Ayez votre CV à jour sur vous, ou envoyez-le avant.</li>' +
      '<li>Préparez une phrase simple : qui vous êtes et le poste qui vous intéresse.</li></ul></div></details>' +
    (actions ? '<div class="d-flex flex-wrap gap-2 mt-3">' + actions + '</div>' : '') + noteSite +
    '<p class="small text-muted mt-3">Ni recommandation ni garantie de recrutement. Liste non exhaustive.</p>' +
    '<div class="text-center"><button type="button" class="btn btn-sm btn-outline-secondary" data-mt-criteres>Comment les fiches sont choisies</button></div>';
}

function _mtRenduErreurChargement() {
  return _mtEncart('bi-exclamation-circle', 'Impossible de charger les listes pour le moment. Vérifiez votre connexion puis réessayez.') +
    '<div class="text-center"><button type="button" class="btn btn-primary" data-mt-reessayer>Réessayer</button></div>';
}

// ------------------------------------------------------------
// Page routée
// ------------------------------------------------------------

function pageMonTerritoire() {
  _monTerritoireDetourPresentation = false;
  _mtDetourEmpile = false;
  _mtInscrireHistorique();
  _mtReconstruireHistorique();
  var corps, evenement = 'mon_territoire_' + _mtEtat.ecran + '_affiche';
  if (!_mtDonnees) {
    if (_mtChargement === 'erreur') { corps = _mtRenduErreurChargement(); }
    else {
      corps = '<p class="text-muted text-center mt-4">Chargement...</p>';
      _mtCharger(function () { pageMonTerritoire(); }, function () { pageMonTerritoire(); });
    }
  } else {
    var e = _mtEtat.ecran;
    // Territoire non couvert (« ailleurs », un département fermé) : jamais les listes d'un autre département ; département jamais choisi : on le demande. Quel que soit l'écran d'arrivée (fiche, recherche...).
    corps = _mtHorsZone() ? _mtRenduHorsZone() : !_mtDep() ? _mtRenduChoixDepartement() : e === 'emploi' ? _mtRenduEmploi() : MT_SOUS_BRANCHES[e] ? _mtRenduDomaine(e) : e === 'lieux' ? _mtRenduLieux() : e === 'liste' ? _mtRenduListe() : e === 'fiche' ? _mtRenduFiche()
      : e === 'recherche' ? _mtRenduRecherche() : e === 'vide' ? _mtRenduVide() : e === 'criteres' ? _mtRenduCriteres() : e === 'criteres-offres' ? _mtRenduCriteresOffres() : e === 'offres' ? _mtRenduOffres() : e === 'prospection' ? _mtRenduProspection() : e === 'siae' ? _mtRenduSiae() : e === 'interim' ? _mtRenduInterim() : _mtRenduAccueil();
  }
  app.innerHTML = '<div class="page-catalogue-contenu">' + _mtRenduEnTete() + corps + '</div>' + _mtRenduPiedFixe();
  // L'entrée courante de l'historique du navigateur porte l'état à jour (brique B.24) : « Précédent » la retrouvera telle quelle.
  if (typeof historiqueInterneMarquer === 'function') { historiqueInterneMarquer('mon-territoire', _mtInstantane()); }
  _mtBrancherPage();
  if (typeof trackEvenement === 'function') { trackEvenement(evenement); }
}

function _mtBrancherPage() {
  var revoir = document.getElementById('btnMonTerritoireRevoirIntro');
  if (revoir) { revoir.addEventListener('click', _mtRevoirPresentation); }
  var principale = document.getElementById('btnMonTerritoirePagePrincipale');
  if (principale) { principale.addEventListener('click', _mtRevenirPagePrincipale); }
  // Arrivée par la case « Fonction publique » : l'écran des offres s'ouvre directement sur son groupe.
  if (_mtEtat.ecran === 'offres' && _mtEtat.groupeOffres) { var cible = document.getElementById('mt-groupe-' + _mtEtat.groupeOffres); if (cible && cible.scrollIntoView) { cible.scrollIntoView(); } _mtEtat.groupeOffres = ''; }
  var changerDep = document.querySelector('[data-mt-changer-departement]');
  if (changerDep) {
    changerDep.addEventListener('click', function () {
      if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); }
      if (typeof demanderDepartementSiInconnu === 'function') { demanderDepartementSiInconnu(function () { _mtEtat.nbAffiches = 0; pageMonTerritoire(); }); }
    });
  }
  var reessayer = document.querySelector('[data-mt-reessayer]');
  if (reessayer) { reessayer.addEventListener('click', function () { _mtChargement = 'inactif'; pageMonTerritoire(); }); }
  if (!_mtDonnees) { return; }
  _mtBrancherBlocCommune();
  _mtBrancherChampRecherche();
  document.querySelectorAll('[data-mt-domaine]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = MT_DOMAINES.filter(function (x) { return x.id === b.dataset.mtDomaine; })[0];
      if (d && d.id === 'emploi') { _mtAller('emploi'); }
      else if (d && d.id === 'fonction-publique') { _mtAller('offres', { secteurOffres: '', groupeOffres: 'public' }); }
      else if (d && MT_SOUS_BRANCHES[d.id]) { _mtAller(d.id); }
      else { _mtAller('vide', { vide: d ? d.libelle : '' }); }
    });
  });
  document.querySelectorAll('[data-mt-secteur]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cle = b.dataset.mtSecteur;
      if (mtCompterParSecteur(_mtEmployeurs())[cle]) { _mtAller('liste', { secteur: cle, nature: '', nbAffiches: 0 }); }
      else { _mtAller('vide', { vide: _mtLibelleSecteur(cle) }); }
    });
  });
  document.querySelectorAll('[data-mt-sousbranche]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sb = (MT_SOUS_BRANCHES[_mtEtat.ecran] || []).filter(function (x) { return x.id === b.dataset.mtSousbranche; })[0];
      if (sb && _mtNbLieux(sb.rayon)) { _mtAller('lieux', { rayon: sb.rayon }); } else { _mtAller('vide', { vide: sb ? sb.libelle : '' }); }
    });
  });
  document.querySelectorAll('[data-mt-lieux-rayon]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('lieux', { rayon: b.dataset.mtLieuxRayon }); }); });
  document.querySelectorAll('[data-mt-vers-cadre]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (typeof comprendreLeCadreOuvrirRayonDepuis !== 'function') { return; }
      comprendreLeCadreOuvrirRayonDepuis(b.dataset.mtVersCadre, 'Qui fait quoi', 'mon-territoire', function () { naviguerVers('mon-territoire'); });
    });
  });
  document.querySelectorAll('[data-mt-vide]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('vide', { vide: b.dataset.mtVide }); }); });
  document.querySelectorAll('[data-mt-fiche]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('fiche', { id: b.dataset.mtFiche }); }); });
  document.querySelectorAll('[data-mt-nature]').forEach(function (b) { b.addEventListener('click', function () { _mtEtat.nature = b.dataset.mtNature; _mtEtat.nbAffiches = 0; pageMonTerritoire(); }); });
  var suivants = document.querySelector('[data-mt-suivants]');
  if (suivants) { suivants.addEventListener('click', function () { _mtEtat.nbAffiches = (_mtEtat.nbAffiches || MT_PAGE_TAILLE) + MT_PAGE_TAILLE; pageMonTerritoire(); }); }
  document.querySelectorAll('[data-mt-criteres]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('criteres'); }); });
  document.querySelectorAll('[data-mt-criteres-offres]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('criteres-offres'); }); });
  document.querySelectorAll('[data-mt-commune]').forEach(function (b) { b.addEventListener('click', function () {
    var v = b.dataset.mtCommuneV, ecran = b.dataset.mtCommune, actif = b.getAttribute('aria-pressed') === 'true', nouveau;
    if (v === '*') { nouveau = actif ? [] : ['*']; }
    else {
      var courant = [].filter.call(document.querySelectorAll('[data-mt-commune="' + ecran + '"][aria-pressed="true"]'), function (x) { return x.dataset.mtCommuneV !== '*'; }).map(function (x) { return x.dataset.mtCommuneV; });
      nouveau = actif ? courant.filter(function (x) { return x !== v; }) : courant.concat([v]);
    }
    _mtEtat.communeChoix = { ecran: ecran, v: nouveau }; _mtEtat.nbAffiches = 0; pageMonTerritoire();
  }); });
  document.querySelectorAll('[data-mt-interim]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('interim'); }); });
  document.querySelectorAll('[data-mt-siae]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('siae', { nbAffiches: 0 }); }); });
  document.querySelectorAll('[data-mt-prospection]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('prospection', { secteurProspection: '', nbAffiches: 0 }); }); });
  document.querySelectorAll('[data-mt-secteur-prospection]').forEach(function (b) { b.addEventListener('click', function () { _mtEtat.secteurProspection = b.dataset.mtSecteurProspection; _mtEtat.nbAffiches = 0; pageMonTerritoire(); }); });
  document.querySelectorAll('[data-mt-offres]').forEach(function (b) { b.addEventListener('click', function () { _mtAller('offres', { secteurOffres: '' }); }); });
  document.querySelectorAll('[data-mt-secteur-offres]').forEach(function (b) { b.addEventListener('click', function () { _mtEtat.secteurOffres = b.dataset.mtSecteurOffres; pageMonTerritoire(); }); });
  var retourAccueil = document.querySelector('[data-mt-retour-accueil]');
  if (retourAccueil) { retourAccueil.addEventListener('click', function () { _mtAller('accueil'); }); }
  var choisirDep = document.querySelector('[data-mt-choisir-departement]');
  if (choisirDep) { choisirDep.addEventListener('click', function () { if (typeof demanderDepartementSiInconnu === 'function') { demanderDepartementSiInconnu(function () { pageMonTerritoire(); }); } }); }
  var autreDep = document.querySelector('[data-mt-autre-departement]');
  if (autreDep) {
    autreDep.addEventListener('click', function () {
      if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); }
      if (typeof demanderDepartementSiInconnu === 'function') { demanderDepartementSiInconnu(function () { pageMonTerritoire(); }); }
    });
  }
}

if (typeof module !== 'undefined') {
  module.exports = { _mtDateFr: _mtDateFr, _mtEsc: _mtEsc, MT_DOMAINES: MT_DOMAINES };
}
