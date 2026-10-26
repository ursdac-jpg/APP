/* ============================================================
   Module « Un CV, plusieurs métiers » : interface (pages routées).
   Charge avant js/app.js (référencé dans l'objet `routes`) ; logique pure dans logique.js (chargé avant ce fichier).

   Décisions de Denis (2026-10-08 et 2026-10-09), à ne pas rouvrir :
   - module INDEPENDANT, rangé dans le bloc d'accueil « Vous hésitez encore ? », ne passe jamais par « Créer un nouveau CV » ;
   - aucune nouvelle fenêtre pour les passages avec l'assistant : on reprend les fenêtres et composants existants ;
   - barre d'étapes SEULEMENT visuelle (aucune étape cliquable) ;
   - la recherche d'offres n'importe RIEN dans l'application.
   Plan : docs/PLAN_IMPLEMENTATION_UN_CV_PLUSIEURS_METIERS_2026-10-08.md. Plan de la nuit : docs/PLAN_MODE_NUIT_UN_CV_PLUSIEURS_METIERS_2026-10-09.md.
   ============================================================ */

// Barre d'étapes : la même constante sert à la page de travail (barreEtapesModule garde par tableau la page la plus avancée atteinte).
var UCPM_NAV_ETAPES = (typeof UCPM_ETAPES !== 'undefined') ? UCPM_ETAPES : [];

// Titres de page (un par étape, même ordre que UCPM_ETAPES).
var UCPM_TITRES_PAGES = [
  'Mon CV',
  'Les métiers que je vise',
  'Mon CV de référence',
  'Mes phrases d’accroche',
  'Mes CV',
  'Mes lettres de motivation',
  'Mes documents sont prêts',
  'Préparer mes entretiens'
];

var _ucpmEtat = null;                  // état de session (voir ucpmEtatInitial, logique.js)
var _ucpmDetourPresentation = false;   // « Revoir la présentation » depuis une page de travail
var _ucpmReprisePendante = false;      // retour dans le module avec un travail en cours : encart « Continuer / Recommencer » + gel

// Rendus de page enregistrés par les lots suivants : numéro -> { rendre(etat) -> html, cabler(etat), peutContinuer(etat), raisonBlocage(etat), continuer(etat) }.
var _ucpmPages = {};
function ucpmEnregistrerPage(numero, definition) { _ucpmPages[numero] = definition; }

function ouvrirUnCvPlusieursMetiers() {
  if (!_ucpmEtat) { _ucpmEtat = ucpmEtatInitial(); }
  return _ucpmEtat;
}

// Cible de la route 'un-cv-plusieurs-metiers' : la page de travail, ou la présentation quand rien n'est engagé.
function pageUnCvPlusieursMetiers() {
  if (!_ucpmEtat) {
    if (typeof naviguerVers === 'function') { naviguerVers('un-cv-plusieurs-metiers-intro'); }
    return;
  }
  ucpmRendrePage();
}

// ---------------- Navigation entre pages ----------------

function ucpmAllerPage(n) {
  var etat = ouvrirUnCvPlusieursMetiers();
  etat.page = ucpmBornerPage(n);
  etat.pageMax = Math.max(etat.pageMax || 1, etat.page);
  ucpmRendrePage();
}

// « Retour » de la barre du bas : revient à la page d'avant sans rien supprimer ; depuis la page 1, à la présentation (mode normal,
// dont le propre « Retour » ramène à la carte d'accueil). Règle des pages devenues périmées : voir le lot « cohérence de parcours ».
function ucpmBarreRetour() {
  var etat = ouvrirUnCvPlusieursMetiers();
  var def = _ucpmPages[etat.page];
  if (def && typeof def.retour === 'function' && def.retour(etat) === true) { return; }
  if (etat.page <= 1) {
    _ucpmDetourPresentation = false;
    if (typeof naviguerVers === 'function') { naviguerVers('un-cv-plusieurs-metiers-intro'); }
    return;
  }
  ucpmAllerPage(etat.page - 1);
}

function ucpmBarreContinuer() {
  var etat = ouvrirUnCvPlusieursMetiers();
  var def = _ucpmPages[etat.page];
  if (def && typeof def.peutContinuer === 'function' && !def.peutContinuer(etat)) { return; }
  if (def && typeof def.continuer === 'function') { def.continuer(etat); return; }
  if (etat.page < UCPM_NB_PAGES) { ucpmAllerPage(etat.page + 1); }
}

// « Revoir la présentation » : page de présentation en détour de consultation, l'état du travail reste intact.
function ucpmRetourVersPresentation() {
  _ucpmDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('un-cv-plusieurs-metiers-intro'); }
}
function ucpmRevenirDeLaPresentation() {
  _ucpmDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('un-cv-plusieurs-metiers'); }
}
function ucpmRepriseContinuer() {
  _ucpmReprisePendante = false;
  if (typeof naviguerVers === 'function') { naviguerVers('un-cv-plusieurs-metiers'); }
}

// Détruit le travail du module (« Recommencer » et « Tout effacer »). Seul endroit qui remet l'état à zéro.
// « Merci bien, j'ai fini » (page 8, apres un telechargement) : meme geste de fin que les autres parcours (la session est sauvegardee, puis effacee), mais sans passer par
// terminerParcours(), qui propose ensuite une lettre ou un entretien (sans objet ici : le module les a deja traites).
function ucpmTerminerParcours() {
  if (typeof confirmerAction !== 'function') { return; }
  confirmerAction(
    'Merci, tout est en ordre',
    'Vos documents sont enregistrés sur votre ordinateur. Toutes les informations de cette session vont être effacées ; vous pourrez les restaurer depuis la page d’accueil tant que vous n’aurez pas commencé un nouveau parcours.',
    'Terminer', 'btn-success',
    function () { if (typeof ecrireSauvegarde === 'function' && typeof sauvegarderSession === 'function') { ecrireSauvegarde(sauvegarderSession()); } if (typeof recommencer === 'function') { recommencer(); } }
  );
}

function ucpmReinitialiser() {
  _ucpmSessionHistorique++;
  _ucpmEtat = null;
  _ucpmDetourPresentation = false;
  _ucpmReprisePendante = false;
  if (typeof _barreEtapesMaxAtteint !== 'undefined' && _barreEtapesMaxAtteint && typeof _barreEtapesMaxAtteint.delete === 'function') {
    _barreEtapesMaxAtteint.delete(UCPM_NAV_ETAPES);
  }
}

// ---------------- Pont disquette (voir collecterEtatsModulesPourSauvegarde / restaurerEtatsModules, js/app.js) ----------------

function ucpmExporterEtatPourSauvegarde() { return ucpmExporterEtat(_ucpmEtat); }
function ucpmRestaurerEtatDepuisSauvegarde(brut) {
  var e = ucpmNormaliserEtat(brut);
  _ucpmSessionHistorique++;
  _ucpmEtat = e;
  _ucpmDetourPresentation = false;
  _ucpmReprisePendante = !!e && ucpmAUnTravailEnCours(e);
}

// ---------------- Page de travail ----------------

// ------------------------------------------------------------
// Flèche « Précédent » du navigateur (retour Denis 2026-10-16, brique B.24 de docs/BRIQUES_COMMUNES.md).
// Les pages du module (1 à 8) se déduisent de _ucpmEtat.page et sont toutes dessinées par ucpmRendrePage() : chaque dessin appelle
// _ucpmSynchroniserHistorique(), chaque changement de page devient une entrée de l'historique. Le travail (CV, métiers, accroches, lettres) ne recule jamais :
// seul le numéro de page est remis. Les vues d'un passage avec l'assistant restent DANS une page.
// ------------------------------------------------------------
// Numéro du travail en cours : il change quand le travail est effacé (« Recommencer ») ou remplacé (restauration de la disquette).
var _ucpmSessionHistorique = 1;

function _ucpmSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function' || !_ucpmEtat) { return; }
  var page = ucpmBornerPage(_ucpmEtat.page);
  historiqueInterneSynchroniser('un-cv-plusieurs-metiers', { cle: _ucpmSessionHistorique + ':' + page, page: page, session: _ucpmSessionHistorique });
}

function _ucpmRestaurerHistorique(instantane) {
  // Le travail a été effacé ou remplacé depuis : ces pages n'ont plus de sens, « Précédent » les dépasse.
  if (!_ucpmEtat || instantane.session !== _ucpmSessionHistorique) { return 'sauter'; }
  _ucpmEtat.page = ucpmBornerPage(instantane.page);
  _ucpmDetourPresentation = false;
}

// js/app.js est chargé APRÈS ce fichier : le module s'inscrit au premier dessin de la page, pas au chargement.
function _ucpmInscrireHistorique() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher('un-cv-plusieurs-metiers', _ucpmRestaurerHistorique); }
}


var _ucpmEcranRendu = '';

function ucpmRendrePage() {
  _ucpmInscrireHistorique();
  var etat = ouvrirUnCvPlusieursMetiers();
  var n = ucpmBornerPage(etat.page);
  var def = _ucpmPages[n] || null;
  var titre = UCPM_TITRES_PAGES[n - 1] || '';
  var scrollPrecedent = window.scrollY || 0;

  var noteHtml = (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue() && !_ucpmReprisePendante)
    ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
      '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
      '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
    : '';
  var boutonRevoir = '<div><button type="button" id="btnUcpmRevoirPresentation" class="btn-revoir-module"' +
    (_ucpmReprisePendante ? ' disabled' : '') + '>' +
    '<i class="bi bi-files"></i> Revoir la présentation</button></div>' + noteHtml;
  var encart = _ucpmReprisePendante
    ? htmlEncartRepriseModule({
        texte: 'Vous avez un travail en cours dans ce module.',
        idContinuer: 'btnUcpmRepriseContinuer', idRecommencer: 'btnUcpmRepriseRecommencer', pulse: true
      })
    : '';

  var corps = def
    ? def.rendre(etat)
    : '<div class="cv-section"><p class="mb-0">Cette page est en cours de construction.</p></div>';
  var peutContinuer = def && typeof def.peutContinuer === 'function' ? !!def.peutContinuer(etat) : !!def;
  var raison = (!peutContinuer && def && typeof def.raisonBlocage === 'function') ? def.raisonBlocage(etat) : '';

  app.innerHTML =
    '<div class="page-catalogue-contenu un-cv-plusieurs-metiers-parcours">' +
    barreEtapesModule(UCPM_NAV_ETAPES, n - 1) +
    htmlBandeRepriseModule(boutonRevoir, encart) +
    '<div class="text-center"><h1><i class="bi bi-files"></i> ' + titre + '</h1></div>' +
    '<div id="contenuPageUcpm">' + corps + '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', n >= UCPM_NB_PAGES ? null : 'ucpm-suite', (def && (typeof def.libelleContinuer === 'function' ? def.libelleContinuer(etat) : def.libelleContinuer)) || null, {
      onclickPrecedent: 'ucpmBarreRetour()',
      onclickSuivant: 'ucpmBarreContinuer()',
      suivantDesactive: !peutContinuer,
      suivantDesactiveMessage: raison || 'Complétez cette page pour continuer.',
      // Page 8 : une fois une préparation téléchargée, le bouton vert de fin remplace l'emplacement de « Continuer » (qui n'existe pas à la dernière page).
      terminerParcours: n >= UCPM_NB_PAGES && !!etat.p8Telecharge,
      onclickTerminer: 'ucpmTerminerParcours()'
    }) +
    '</div>';

  // La fleche « Precedent » du navigateur retrouve cette page (brique B.24).
  _ucpmSynchroniserHistorique();

  var arrivee = (typeof consommerArriveeDepuisPresentation === 'function') && consommerArriveeDepuisPresentation();
  // Tout NOUVEL écran (autre page, ou autre vue d'un passage avec l'assistant) s'ouvre en haut : sur les pages 4 et 6, on arrive donc toujours sur « Réglez le style d'écriture »
  // (retour 50 de Denis, 2026-10-10). Un simple réaffichage du même écran (un réglage coché) garde la position.
  var vueEl = document.querySelector('[data-ucpm-vue]');
  var cleEcran = n + ':' + (vueEl ? vueEl.getAttribute('data-ucpm-vue') : (n === 3 && etat.p3Vue ? etat.p3Vue : ''));   // page 3 : chaque vue (choix, assistant, complément, éditeur) s'ouvre en haut
  var nouvelEcran = cleEcran !== _ucpmEcranRendu;
  _ucpmEcranRendu = cleEcran;
  window.scrollTo(0, (arrivee || nouvelEcran) ? 0 : scrollPrecedent);
  if (typeof appliquerGelModule === 'function') { appliquerGelModule(_ucpmReprisePendante); }

  var btnRevoir = document.getElementById('btnUcpmRevoirPresentation');
  if (btnRevoir) { btnRevoir.addEventListener('click', ucpmRetourVersPresentation); }
  var btnContinuer = document.getElementById('btnUcpmRepriseContinuer');
  if (btnContinuer) { btnContinuer.addEventListener('click', ucpmRepriseContinuer); }
  var btnRecommencer = document.getElementById('btnUcpmRepriseRecommencer');
  if (btnRecommencer) {
    btnRecommencer.addEventListener('click', function () {
      if (typeof confirmerAction !== 'function') { return; }
      confirmerAction(
        'Recommencer « Un CV, plusieurs métiers » ?',
        'Votre travail dans ce module sera effacé : votre CV déposé, vos métiers, vos accroches et vos lettres. Vos autres modules, Mes Repères et Mon Carnet ne sont pas touchés.',
        'Recommencer ce module', 'btn-danger',
        function () { ucpmReinitialiser(); ouvrirUnCvPlusieursMetiers(); if (typeof naviguerVers === 'function') { naviguerVers('un-cv-plusieurs-metiers'); } }
      );
    });
  }
  if (typeof armerFinPulseEncartReprise === 'function') { armerFinPulseEncartReprise(); }
  if (def && typeof def.cabler === 'function') { def.cabler(etat); }
  if (typeof trackEvenement === 'function') { trackEvenement('un_cv_plusieurs_metiers_page', { page: n }); }
}

// ---------------- Page de présentation ----------------

function pageIntroUnCvPlusieursMetiers() {
  var enCours = ucpmAUnTravailEnCours(_ucpmEtat);
  var config = {
    carteRetour: 'orientation',
    detour: _ucpmDetourPresentation,
    detourLogo: 'bi-files',
    detourBoutonId: 'btnUcpmRevenirModuleHaut',
    detourCtaId: 'btnUcpmRevenirModuleBas',
    onRevenir: ucpmRevenirDeLaPresentation,
    onRevenirExpr: 'ucpmRevenirDeLaPresentation()',
    titre: '<i class="bi bi-files"></i> Un CV, plusieurs métiers',
    sousTitre: 'Vous pouvez viser plusieurs métiers ? Partez d’un seul CV : l’application vous aide à préparer un CV et une lettre de motivation pour chaque métier, sans rien inventer.',
    ctaId: 'btnUcpmCommencer',
    ctaLabel: 'Commencer &#8594;',
    etapes: UCPM_NAV_ETAPES,
    onCta: function () {
      // Un travail déjà engagé est repris (l'effacement volontaire vit sur l'encart de reprise), jamais remis à zéro ici.
      if (!enCours) { ucpmReinitialiser(); ouvrirUnCvPlusieursMetiers(); }
      else { _ucpmReprisePendante = true; }
      if (typeof naviguerVers === 'function') { naviguerVers('un-cv-plusieurs-metiers'); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Ces propositions ne rajoutent aucune expérience à votre CV.</strong> Vos expériences, vos formations et vos compétences restent exactement les mêmes : seuls le titre, la phrase d’accroche et la lettre changent d’un métier à l’autre.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-0">Quand plusieurs métiers vous intéressent, un seul CV ne montre pas toujours le meilleur de ce que vous savez faire pour chacun. Ce module vous aide à préparer un CV par métier (dix au plus), tous construits sur votre vrai parcours, avec pour chacun un titre, une phrase d’accroche et une lettre de motivation adaptée à ce que vous cherchez.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous déposez votre CV et vous masquez ce qui est personnel (nom, adresse, téléphone…) avant tout envoi à l’assistant en ligne.</li>' +
        '<li>Vous voyez d’autres intitulés pour votre métier, et d’autres métiers qui utilisent les mêmes compétences. Vous cochez ceux qui vous intéressent et vous indiquez ce que vous cherchez pour chacun (emploi, stage, alternance, formation…).</li>' +
        '<li>Vous finalisez un premier CV, votre CV de référence, avec l’éditeur de CV de l’application.</li>' +
        '<li>L’assistant en ligne vous propose deux phrases d’accroche courtes par métier. Vous choisissez ou vous écrivez la vôtre.</li>' +
        '<li>Vous voyez tous vos CV côte à côte, et vous pouvez changer l’aspect d’un CV en particulier.</li>' +
        '<li>Vous obtenez une lettre de motivation par CV, que vous pouvez relire et modifier.</li>' +
        '<li>À la fin, vous téléchargez tous vos CV dans un seul fichier, toutes vos lettres dans un autre, ou un CV avec sa lettre.</li>' +
        '<li>Si vous le souhaitez, vous préparez aussi vos entretiens d’embauche : une feuille par métier avec les questions probables, ce que le recruteur cherche et des pistes pour répondre. Cette feuille est pour vous, vous ne l’envoyez pas.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Il ne choisit pas un métier à votre place : il n’y a ni note ni classement, vous décidez.</li>' +
        '<li>Il n’invente rien : aucune expérience, aucune compétence, aucun diplôme qui ne soit pas dans votre CV.</li>' +
        '<li>Il ne lit pas, ne garde pas et ne vérifie pas les offres d’emploi : si vous choisissez de chercher des offres, votre demande part vers l’assistant en ligne que vous aurez choisi, et sa réponse reste dans sa propre fenêtre.</li>' +
        '<li>Il ne produit pas de fichier Word qui réunirait tous les CV : les CV sont réunis dans un seul PDF, un CV par métier.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Envoyer le CV et la lettre qui correspondent au métier visé.</li>' +
        '<li>Si vous le souhaitez, ouvrir l’assistant en ligne de votre choix pour chercher des offres liées à vos métiers (c’est un simple repère, l’application n’en reprend rien).</li>' +
        '</ul>') +
      _introBlocEncart('&#128196;', 'Chaque CV tient sur une seule page. Si l’un d’eux est très rempli, l’application vous le signale.')
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('un_cv_plusieurs_metiers_intro_affichee'); }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UCPM_TITRES_PAGES: UCPM_TITRES_PAGES };
}
