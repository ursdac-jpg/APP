/* ============================================================
   Module « Bien utiliser l'IA » : point d'entrée (interrupteur, pages, navigation).
   Chargé avant js/app.js ; la logique pure est dans logique.js, les textes dans data/buiaEntree.js.
   Plan : docs/AUDIT_ET_PLAN_BIEN_UTILISER_L_IA_2026-11-23.md (commit 1 : écran d'entrée et présentation seulement).
   Chantier : docs/CHANTIER_BIEN_UTILISER_L_IA_2026-11-22.md. Maquette : docs/maquettes/maquette-bien-utiliser-ia-entree-2026-11-23.html.

   Décisions de Denis, à ne pas rouvrir (consignes 587 à 595, puis 596 à 599) : un seul module, quatre chemins ; rien n'est enregistré sur l'appareil ;
   la disquette ne recevra que les demandes que la personne y ajoute elle-même (commit 6) ; le mot « IA » est permis dans ce module seulement.
   ============================================================ */

// INTERRUPTEUR UNIQUE du module. Fermé tant que le plan n'est pas terminé et que Denis n'a pas fait ses essais : visible seulement sur localhost
// (même patron que cqcpmOuvert()). Pour ouvrir au public : BUIA_OUVERT à true, avec sa ligne dans data/nouveautes.js (décision de Denis, commit 9).
var BUIA_OUVERT = true;   // OUVERT AU PUBLIC le 25/11/2026 (décision de Denis). Pour refermer : repasser à false (le module redevient visible seulement sur localhost).
function buiaOuvert() {
  if (BUIA_OUVERT) { return true; }
  try { return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|[^.]+\.localhost)$/.test(String(location.hostname || '')); } catch (e) { return false; }
}
var BUIA_ROUTE = 'bien-utiliser-ia';
var BUIA_ROUTE_INTRO = 'bien-utiliser-ia-intro';
var BUIA_ROUTE_COMPRENDRE = 'bien-utiliser-ia-comprendre';
var BUIA_ROUTE_FONCTIONNE = 'bien-utiliser-ia-fonctionne';
var BUIA_ROUTE_MODELES = 'bien-utiliser-ia-modeles';
var BUIA_ROUTE_LIBRE = 'bien-utiliser-ia-ecrire';

// État de l'écran (jamais enregistré) : le chemin dont la personne a demandé l'ouverture.
// c1 : le chemin « Comprendre » (étape 0 à 7, niveau de lecture, sujet de démonstration, ligne ouverte de la pile, sujet de vérification). depuis : la page d'où la personne a demandé la présentation.
function _buiaUiVierge() { return { enConstruction: null, detour: false, depuis: null, c1: { etape: 0, niveau: 'bases', sujet: 'ambassade', rang: -1, risque: 'courrier', ex: buiaExVierge(), copiePhrase: '', copieExemple: '' },
    // c4 : le chemin « Comment fonctionne un assistant » (étape 0 à 7, niveau de lecture, contexte ajouté dans l'exemple des mots). Jamais enregistré.
    c4: { etape: 0, niveau: 'bases', contexte: false },
    // c2 : le chemin « Mes modèles » (étape 0 à 2, papier collé, mots, propositions, message du masquage, cases de l'alerte, modèle choisi, saisie du modèle, messages). Jamais enregistré.
    c2: { etape: 0, papier: '', mots: '', resultats: null, msgMasque: '', vu: false, reprise: false, modele: null, saisie: null, famille: 'Administration et démarches', msgApres: '', copie: '', nomGarde: '', msgGardeModele: '', garderOuvert: false,
      // partage : « Partager avec un collègue » (demandes cochées, étape « Ce qui va partir », case « J'ai relu », message d'envoi) et « Recevoir » (fichier lu en attente d'être ajouté, message). Jamais enregistré.
      partage: { choisies: {}, prepa: false, relu: false, msgEnvoi: '', reception: null, msgReception: null } },
    // c3 : le chemin « Écrire ma propre demande » (étape 0 à 2, saisie, corrections cochées et précisions, nom à garder, messages). Jamais enregistré : seule la disquette garde ce que la personne y ajoute.
    c3: _buiaC3Vierge() }; }
function _buiaC3Vierge() { return { etape: 0, saisie: buiaLibreSaisieVide(), coches: {}, precisions: {}, msgTests: {}, msgCopie: '', nom: '', msgGarde: '' }; }
var _buiaUi = _buiaUiVierge();
function buiaReinitialiser() { _buiaUi = _buiaUiVierge(); }

// « Mes demandes » : les demandes que la personne a ajoutées à sa disquette (gardeLogique.js). C'est la seule chose qui sort du module, et seulement par le fichier de la disquette.
// Vide à l'ouverture de l'application ; remplie par la restauration d'une disquette ou par « Ajouter à ma disquette ».
var _buiaGarde = buiaGardeVide();
function buiaExporterEtatPourSauvegarde() { return buiaGardeExporter(_buiaGarde); }
function buiaRestaurerEtatDepuisSauvegarde(brut) {
  _buiaGarde = buiaGardeImporter(brut);
  var p = _buiaUi.c2.partage; p.choisies = {}; p.prepa = false; p.relu = false; p.msgEnvoi = ''; p.reception = null; p.msgReception = null;   // les demandes ont changé : plus rien n'est coché
}

// ---------------- Phrases communes (prompts/bien-utiliser-blocs.md) ----------------
// Chargées à la demande, une seule fois par ouverture de l'application (le fichier est lu avec cache 'no-cache' : une correction de Denis se voit au rechargement).
// Source unique : aucune copie dans le code. Si le fichier manque ou est incomplet, état 'erreur' et le module affiche BUIA_MESSAGE_BLOCS_INDISPONIBLES
// à la place d'une demande, jamais une demande à trous. Retour : une promesse qui donne toujours l'état (elle ne rejette jamais).
var _buiaBlocs = { etat: 'attente', blocs: null, problemes: [] };
var _buiaBlocsPromesse = null;
var BUIA_MESSAGE_BLOCS_INDISPONIBLES = 'Les phrases de ce module ne sont pas disponibles pour le moment. Vérifiez votre connexion, puis réessayez. Rien n’est perdu.';
function buiaChargerBlocs(forcer) {
  if (_buiaBlocsPromesse && !forcer) { return _buiaBlocsPromesse; }
  _buiaBlocs = { etat: 'chargement', blocs: null, problemes: [] };
  _buiaBlocsPromesse = fetch(BUIA_FICHIER_BLOCS, { cache: 'no-cache' })
    .then(function (rep) { if (!rep.ok) { throw new Error('http ' + rep.status); } return rep.text(); })
    .then(function (texte) {
      var lecture = buiaLireBlocs(texte), problemes = buiaVerifierBlocs(lecture);
      _buiaBlocs = problemes.length ? { etat: 'erreur', blocs: null, problemes: problemes } : { etat: 'ok', blocs: lecture.blocs, problemes: [] };
      return _buiaBlocs;
    })
    .catch(function (e) {
      _buiaBlocs = { etat: 'erreur', blocs: null, problemes: ['Fichier illisible : ' + (e && e.message ? e.message : 'inconnu')] };
      return _buiaBlocs;
    });
  return _buiaBlocsPromesse;
}
function buiaEtatBlocs() { return _buiaBlocs; }

// Phrases d'un modèle (prompts/bien-utiliser-modele-N.md) : même principe, un fichier par modèle, lu à la demande. États : chargement, ok, erreur.
var _buiaBlocsModeles = {};
function buiaChargerBlocsModele(id, forcer) {
  var def = buiaDefModele(id);
  if (!def) { return Promise.resolve({ etat: 'erreur', blocs: null, problemes: ['Modèle inconnu'] }); }
  var cache = _buiaBlocsModeles[id];
  if (cache && cache.promesse && !forcer) { return cache.promesse; }
  var entree = { etat: 'chargement', blocs: null, problemes: [], promesse: null };
  _buiaBlocsModeles[id] = entree;
  entree.promesse = fetch(def.fichier, { cache: 'no-cache' })
    .then(function (rep) { if (!rep.ok) { throw new Error('http ' + rep.status); } return rep.text(); })
    .then(function (texte) {
      var lecture = buiaLireBlocs(texte), problemes = buiaVerifierBlocsModele(id, lecture);
      entree.etat = problemes.length ? 'erreur' : 'ok'; entree.blocs = problemes.length ? null : lecture.blocs; entree.problemes = problemes;
      return entree;
    })
    .catch(function (e) { entree.etat = 'erreur'; entree.blocs = null; entree.problemes = ['Fichier illisible : ' + (e && e.message ? e.message : 'inconnu')]; return entree; });
  return entree.promesse;
}
// Exemple de l'écran 8 du chemin « Comprendre » (prompts/bien-utiliser-exemple-questions-d-abord.md) : même principe, lu une fois, à la demande.
// États : attente, chargement, ok (texte), erreur. La promesse ne rejette jamais.
var _buiaExempleC1 = { etat: 'attente', texte: '' };
var _buiaExempleC1Promesse = null;
function buiaChargerExempleC1(forcer) {
  if (_buiaExempleC1Promesse && !forcer) { return _buiaExempleC1Promesse; }
  _buiaExempleC1 = { etat: 'chargement', texte: '' };
  _buiaExempleC1Promesse = fetch(BUIA_C1_FICHIER_EXEMPLE, { cache: 'no-cache' })
    .then(function (rep) { if (!rep.ok) { throw new Error('http ' + rep.status); } return rep.text(); })
    .then(function (texte) { var t = buiaC1TexteExemple(texte); _buiaExempleC1 = t ? { etat: 'ok', texte: t } : { etat: 'erreur', texte: '' }; return _buiaExempleC1; })
    .catch(function () { _buiaExempleC1 = { etat: 'erreur', texte: '' }; _buiaExempleC1Promesse = null; return _buiaExempleC1; });
  return _buiaExempleC1Promesse;
}
function buiaEtatExempleC1() { return _buiaExempleC1; }

function buiaEtatBlocsModele(id) { return _buiaBlocsModeles[id] || { etat: 'attente', blocs: null, problemes: [] }; }

// ---------------- Navigation ----------------
// depuis : la route à retrouver au retour de la présentation (l'écran d'entrée par défaut, ou le chemin que la personne était en train de suivre).
function buiaRetourVersPresentation(detour, depuis) { _buiaUi.detour = !!detour; _buiaUi.depuis = depuis || BUIA_ROUTE; if (typeof naviguerVers === 'function') { naviguerVers(BUIA_ROUTE_INTRO); } }
function buiaRevenirDeLaPresentation() { var vers = _buiaUi.depuis || BUIA_ROUTE; _buiaUi.detour = false; _buiaUi.depuis = null; if (typeof naviguerVers === 'function') { naviguerVers(vers); } }
function buiaRetourBarre() { buiaRetourVersPresentation(false); }

// ---------------- Écran d'entrée ----------------
// Cible de la route 'bien-utiliser-ia'. Fermé au public : retour à l'accueil (sauf sur le poste de Denis).
function pageBienUtiliserIa() {
  if (!buiaOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  buiaRendre();
}

function _buiaHtmlIntention(c) {
  return '<div class="buia-intention" id="buiaInt-' + c.id + '">' +
    '<span class="buia-rond"><i class="bi ' + c.icone + '" aria-hidden="true"></i></span>' +
    (typeof htmlRepereTempsChemin === 'function' ? htmlRepereTempsChemin('buia', c.id) : '') +
    '<h3>' + _buiaEsc(c.titre) + '</h3>' +
    '<p class="buia-quand"><strong>Choisissez ce chemin si</strong>' + _buiaEsc(c.quand) + '</p>' +
    '<p>' + _buiaEsc(c.texte) + '</p>' +
    (typeof htmlVideoPresentation === 'function' ? htmlVideoPresentation('bien-utiliser-ia-' + c.id) : '') +
    '<p class="buia-detail">' + _buiaEsc(c.detail) + '</p>' +
    '<button type="button" class="btn btn-primary" data-buia-act="chemin" data-v="' + c.id + '">' + _buiaEsc(c.bouton) + '</button></div>';
}

function _buiaHtmlEntree() {
  var h = '<div class="buia-panneau"><h2>Que voulez-vous faire aujourd’hui ?</h2>' +
    '<p class="mb-0">Quatre chemins, un seul module. Vous pouvez changer de chemin à tout moment.</p>' +
    '<div class="buia-intentions">' + buiaChemins().map(_buiaHtmlIntention).join('') + '</div>' +
    '<div class="buia-encart buia-construction" id="buiaConstruction" role="status"' + (_buiaUi.enConstruction ? '' : ' hidden') + '>' + _buiaEsc(typeof BUIA_EN_CONSTRUCTION !== 'undefined' ? BUIA_EN_CONSTRUCTION : '') + '</div></div>';
  h += '<div class="buia-panneau"><h2>Avant de commencer</h2><div class="buia-rassurance">' +
    buiaReassurance().map(function (r) { return '<div><strong>' + _buiaEsc(r.titre) + '</strong>' + _buiaEsc(r.texte) + '</div>'; }).join('') + '</div></div>';
  return h;
}

function buiaRendre() {
  app.innerHTML =
    '<div class="page-catalogue-contenu buia-page" id="buiaRacine">' +
    htmlBandeRepriseModule(htmlBoutonRevoirModule('btnBuiaRevoir', BUIA_ICONE, 'Revoir la présentation', false), '') +
    htmlTitreEtapeModule(BUIA_ICONE, BUIA_NOM, BUIA_SOUS_TITRE) +
    '<div id="buiaCorps">' + _buiaHtmlEntree() + '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'buiaRetourBarre()' }) + '</div>';
  var arrivee = (typeof consommerArriveeDepuisPresentation === 'function') && consommerArriveeDepuisPresentation();
  if (arrivee) { window.scrollTo(0, 0); }
  var btnRevoir = document.getElementById('btnBuiaRevoir');
  if (btnRevoir) { btnRevoir.addEventListener('click', function () { buiaRetourVersPresentation(true); }); }
  var racine = document.getElementById('buiaRacine');
  if (racine) { racine.addEventListener('click', buiaClic); }
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_vue', { vue: 'entree' }); }
}

// Mise à jour sur place (sans redessiner la page) : le message de construction s'affiche.
function _buiaMajEntree() {
  var k = document.getElementById('buiaConstruction');
  if (k) { k.hidden = !_buiaUi.enConstruction; }
}

// Saisie dans un champ du chemin 2 (papier, mots, situation, courrier) : mise à jour sur place, le champ garde le curseur.
function buiaSaisie(e) {
  var el = e.target && e.target.closest ? e.target.closest('[data-buia-champ]') : null;
  if (!el) { return; }
  var champ = el.getAttribute('data-buia-champ');
  if (champ.indexOf('l-') === 0) { if (typeof buiaC3Saisie === 'function') { buiaC3Saisie(champ, el.value); } return; }
  if (champ === 'c2-nom') { _buiaUi.c2.nomGarde = el.value; return; }
  if (typeof buiaC2Saisie === 'function') { buiaC2Saisie(champ, el.value); }
}

function buiaClic(e) {
  var el = e.target && e.target.closest ? e.target.closest('[data-buia-act]') : null;
  if (!el) { return; }
  var act = el.getAttribute('data-buia-act'), v = el.getAttribute('data-v');
  if (typeof buiaExClic === 'function' && buiaExClic(act, v)) { return; }
  if (typeof buiaC1Clic === 'function' && buiaC1Clic(act, v)) { return; }
  if (typeof buiaC4Clic === 'function' && buiaC4Clic(act, v)) { return; }
  if (typeof buiaC3Clic === 'function' && buiaC3Clic(act, v, el)) { return; }
  if (typeof buiaC2Clic === 'function' && buiaC2Clic(act, v, el)) { return; }
  if (act === 'chemin' && v === 'comprendre') {
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_chemin', { chemin: v }); }
    if (typeof naviguerVers === 'function') { naviguerVers(BUIA_ROUTE_COMPRENDRE); }
    return;
  }
  if (act === 'chemin' && v === 'fonctionne') {
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_chemin', { chemin: v }); }
    if (typeof naviguerVers === 'function') { naviguerVers(BUIA_ROUTE_FONCTIONNE); }
    return;
  }
  if (act === 'chemin' && v === 'modeles') {
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_chemin', { chemin: v }); }
    if (typeof naviguerVers === 'function') { naviguerVers(BUIA_ROUTE_MODELES); }
    return;
  }
  if (act === 'chemin' && v === 'ecrire') {
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_chemin', { chemin: v }); }
    if (typeof naviguerVers === 'function') { naviguerVers(BUIA_ROUTE_LIBRE); }
    return;
  }
  if (act === 'chemin') {
    // Un chemin inconnu : un message honnête, jamais un bouton mort.
    _buiaUi.enConstruction = v;
    _buiaMajEntree();
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_chemin', { chemin: v }); }
  }
}

// ---------------- Présentation (composant partagé htmlPageIntroModuleParcours) ----------------
function _buiaIntroBloc(icone, titre, corpsHTML) {
  return '<div class="buia-panneau"><h2><i class="bi ' + icone + '" aria-hidden="true"></i> ' + titre + '</h2>' + corpsHTML + '</div>';
}
// Les sept rubriques de la présentation. Tous les textes viennent de BUIA_PRESENTATION (data/buiaEntree.js) ;
// les chemins, les familles de modèles et le plafond de « Mes demandes » sont lus dans leurs sources, jamais recopiés.
function _buiaIntroBlocs() {
  var P = BUIA_PRESENTATION;
  var paragraphes = function (tab, arg) {
    return tab.map(function (t, k) {
      var texte = typeof t === 'function' ? t(arg) : t;
      return '<p' + (k === tab.length - 1 ? ' class="mb-0"' : '') + '>' + texte + '</p>';
    }).join('');
  };
  var familles = buiaFamilles().map(function (f) { return f.charAt(0).toLowerCase() + f.slice(1); });
  var trouve = '<ul class="buia-intro-liste buia-liste-icones mb-0">' + P.trouve.items.map(function (it) {
    var texte = typeof it.texte === 'function' ? it.texte(familles) : it.texte;
    return '<li><i class="bi ' + it.icone + '" aria-hidden="true"></i><span><strong>' + it.titre + '</strong> ' + texte + '</span></li>';
  }).join('') + '</ul>';
  var chemins = '<ul class="buia-intro-liste">' + buiaChemins().map(function (c) { return '<li><strong>' + _buiaEsc(c.titre) + '.</strong> ' + _buiaEsc(c.texte) + '</li>'; }).join('') + '</ul>' +
    '<p class="mt-2 mb-0"><strong>' + P.chemins.niveaux.titre + '</strong> ' + P.chemins.niveaux.texte + '</p>';
  var pro = '<p>' + P.pro.intro + '</p><ul class="buia-intro-liste mb-0">' + P.pro.items.map(function (it) {
    return '<li><strong>' + it.titre + '</strong>' + it.texte + '</li>';
  }).join('') + '</ul>';
  return _introBlocAccroche(P.accroche) +
    _buiaIntroBloc('bi-compass', P.ceSert.titre, paragraphes(P.ceSert.paragraphes)) +
    _buiaIntroBloc('bi-signpost-split', P.chemins.titre, chemins) +
    _buiaIntroBloc('bi-collection', P.trouve.titre, trouve) +
    _buiaIntroBloc('bi-floppy', P.garde.titre, paragraphes(P.garde.paragraphes, BUIA_GARDE_MAX)) +
    _buiaIntroBloc('bi-people', P.pro.titre, pro) +
    _buiaIntroBloc('bi-patch-question', P.sources.titre, paragraphes(P.sources.paragraphes)) +
    _buiaIntroBloc('bi-slash-circle', P.nePasFaire.titre, '<ul class="buia-intro-liste mb-0">' + P.nePasFaire.items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>');
}
function pageIntroBienUtiliserIa() {
  if (!buiaOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  var config = {
    temps: 'buia',   // repère de temps (data/tempsModules.js, consigne 606)
    carteRetour: 'boiteaoutils',
    routeRetour: undefined,
    detour: _buiaUi.detour,
    syntheseHTML: '',
    actionsSynthese: [],
    ctaMasque: false,
    detourLogo: BUIA_ICONE,
    detourBoutonId: 'btnBuiaRevenirModuleHaut',
    detourCtaId: 'btnBuiaRevenirModuleBas',
    onRevenir: buiaRevenirDeLaPresentation,
    onRevenirExpr: 'buiaRevenirDeLaPresentation()',
    titre: '<i class="bi ' + BUIA_ICONE + '"></i> ' + BUIA_NOM,
    sousTitre: BUIA_SOUS_TITRE,
    video: 'bien-utiliser-ia',
    ctaId: 'btnBuiaCommencer',
    ctaLabel: BUIA_PRESENTATION.cta,
    multilingueCourte: true,
    onCta: function () { _buiaUi.detour = false; if (typeof naviguerVers === 'function') { naviguerVers(BUIA_ROUTE); } },
    blocsHTML: _buiaIntroBlocs()
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_intro_affichee'); }
}
