/* ============================================================
   Espace « Ce qui compte pour moi » : point d'entrée (interrupteur, état de session, disquette).
   Chargé avant js/app.js ; la logique pure est dans logique.js, les descriptions de cartes dans data/cqcpm*.js.
   Plan : docs/AUDIT_ET_PLAN_CE_QUI_COMPTE_POUR_MOI_2026-11-22.md. Maquettes : docs/MAQUETTE_CE_QUI_COMPTE_POUR_MOI_*.html.
   Chantier : docs/CHANTIER_MIEUX_SE_COMPRENDRE_2026-11-22.md (nom de travail d'origine : « Mieux se comprendre »).

   Décisions de Denis, à ne pas rouvrir (consignes 530 à 559) : huit cartes indépendantes en quatre thèmes, rangées dans la carte d'accueil « Boîte à outils » ;
   aucun score, aucun type de personne (pas de MBTI, pas de « introverti »), jamais un classement de métiers ; rien n'est enregistré en route :
   la disquette ne reçoit que les cartes gardées avec « Garder mon résultat » ; aucun effet sur les métiers, le CV ni un prompt ; le prompt est testé par Denis seul.
   ============================================================ */

// INTERRUPTEUR UNIQUE de l'espace. Fermé tant que Denis n'a pas fait ses essais : visible seulement sur localhost (même patron que cmvOuvert()).
// Pour ouvrir au public : CQCPM_OUVERT à true, avec sa ligne dans data/nouveautes.js (décision de Denis).
var CQCPM_OUVERT = true;   // OUVERT AU PUBLIC le 25/11/2026 (décision de Denis). Pour refermer : repasser à false (l'espace redevient visible seulement sur localhost).
function cqcpmOuvert() {
  if (CQCPM_OUVERT) { return true; }
  try { return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|[^.]+\.localhost)$/.test(String(location.hostname || '')); } catch (e) { return false; }
}
var CQCPM_NOM = 'Ce qui compte pour moi';
var CQCPM_ICONE = 'bi-layers';
var CQCPM_ROUTE = 'ce-qui-compte';
var CQCPM_ROUTE_INTRO = 'ce-qui-compte-intro';

// État de session : les réponses de la séance (jamais enregistrées d'elles-mêmes) et les cartes gardées.
var _cqcpmEtat = null;
var _cqcpmSessionHistorique = 1;
function cqcpmEtat() {
  if (!_cqcpmEtat) { _cqcpmEtat = cqcpmEtatInitial(); }
  return _cqcpmEtat;
}
function cqcpmReinitialiser() { _cqcpmEtat = null; _cqcpmSessionHistorique++; }

// ---------------- Disquette (contrat standard, js/app.js : collecterEtatsModulesPourSauvegarde / restaurerEtatsModules) ----------------
// Seulement ce que la personne a gardé. Retourne null si rien n'est gardé : l'espace n'apparaît alors pas comme un travail à sauvegarder.
function cqcpmExporterEtatPourSauvegarde() {
  return _cqcpmEtat ? cqcpmFichierAvecPapier(_cqcpmEtat) : null;   // les cartes gardées, et le papier s'il y en a un
}
function cqcpmRestaurerEtatDepuisSauvegarde(brut) {
  cqcpmReinitialiser();   // nouvelle session : l'historique du navigateur ne rejoue pas l'ancien travail
  if (!brut) { return; }
  var etat = cqcpmEtatDepuisFichierAvecPapier(brut);
  if (cqcpmNombreGardees(etat) > 0) { _cqcpmEtat = etat; }
}

// ---------------- Lien avec « Ma synthèse » (Explorer les métiers) ----------------
// Lu depuis l'autre module (jamais l'inverse sans protection `typeof`) : sans rien créer dans l'état si la personne n'a jamais ouvert l'espace.
// Consigne 570 : seul le PAPIER « Ce qui revient dans mes cartes » peut partir vers Ma synthèse, et seulement si la personne l'a joint ; jamais les cartes une à une.
function cqcpmDonneesPourSynthese() { return _cqcpmEtat ? cqcpmPapierPourSynthese(_cqcpmEtat) : []; }
// L'état du papier pour le bloc de Ma synthèse : { gardees, papier, joint, retire }. Rien de créé si la personne n'a jamais ouvert l'espace.
function cqcpmSituationPapier() {
  if (!_cqcpmEtat) { return { gardees: 0, papier: false, joint: false, retire: false }; }
  var p = cqcpmPapier(_cqcpmEtat);
  return { gardees: cqcpmNombreGardees(_cqcpmEtat), papier: !!p, joint: !!(p && p.joint === true), retire: !p && cqcpmPapierRetire(_cqcpmEtat) };
}
function cqcpmBasculerJointPapier() {
  if (!_cqcpmEtat) { return false; }
  var vaJoindre = !cqcpmPapierJoint(_cqcpmEtat), ok = cqcpmJoindrePapier(_cqcpmEtat, vaJoindre);
  if (ok && typeof trackEvenement === 'function') { trackEvenement(vaJoindre ? 'ce_qui_compte_papier_joint' : 'ce_qui_compte_papier_retire'); }
  return !!ok;
}

// ---------------- Navigation ----------------
// Vues : 'accueil' (les huit cartes), 'carte' (une carte : écran 0 = invitation, 1 à N = saisie, N+1 = résultat), 'gardees' (« Ce que j'ai gardé »),
// et celles du papier de fin (papierEcrans.js) : 'papier-preparer', 'papier-assistant', 'papier'.
var _cqcpmUi = { vue: 'accueil', carte: null, ecran: 0, ouverts: {}, nbEntrees: {}, detour: false };
var _cqcpmVueRendue = '';

function cqcpmAUnTravailEnCours() {
  var e = _cqcpmEtat;
  if (!e) { return false; }
  return cqcpmCartes().some(function (c) { return cqcpmCarteCommencee(e, c.id) || cqcpmEstGardee(e, c.id); });
}
function cqcpmAllerVue(vue) { _cqcpmUi.vue = vue; _cqcpmUi.carte = null; _cqcpmUi.ecran = 0; cqcpmRendre(); }
function cqcpmAllerCarte(id, ecran) { _cqcpmUi.vue = 'carte'; _cqcpmUi.carte = id; _cqcpmUi.ecran = ecran; cqcpmRendre(); }
function _cqcpmDernierEcran(carte) { return carte.ecrans.length + 1; }   // le résultat

function cqcpmRetourBarre() {
  var ui = _cqcpmUi;
  if (ui.vue === 'accueil') { cqcpmRetourVersPresentation(false); return; }
  if (ui.vue === 'gardees' || ui.vue === 'papier-preparer' || ui.vue === 'papier') { cqcpmAllerVue('accueil'); return; }
  if (ui.vue === 'papier-assistant') { cqcpmRetourPapierAssistant(); return; }
  if (ui.ecran <= 0) { cqcpmAllerVue('accueil'); return; }
  ui.ecran--; cqcpmRendre();
}
function cqcpmContinuerBarre() {
  var ui = _cqcpmUi, carte = ui.vue === 'carte' ? cqcpmCarte(ui.carte) : null;
  if (!carte || ui.ecran >= _cqcpmDernierEcran(carte)) { return; }
  ui.ecran++;
  if (ui.ecran === _cqcpmDernierEcran(carte)) { cqcpmMarquerTerminee(cqcpmEtat(), carte.id); }
  cqcpmRendre();
}
// Page d'où la personne est arrivée quand ce n'est pas la carte « Boîte à outils » (aujourd'hui : « Ma synthèse » d'Explorer les métiers). « Retour » de la présentation y revient
// (audit du 22/11/2026, point 2). La tuile de la carte d'accueil appelle cqcpmOuvrirDepuis(null) : jamais un retour périmé.
var _cqcpmRetourVers = null;
function cqcpmOuvrirDepuis(route) {
  _cqcpmRetourVers = route || null;
  if (typeof naviguerVers === 'function') { naviguerVers(CQCPM_ROUTE_INTRO); }
}
function cqcpmRetourVersPresentation(detour) { _cqcpmUi.detour = !!detour; if (typeof naviguerVers === 'function') { naviguerVers(CQCPM_ROUTE_INTRO); } }
function cqcpmRevenirDeLaPresentation() { _cqcpmUi.detour = false; if (typeof naviguerVers === 'function') { naviguerVers(CQCPM_ROUTE); } }
function cqcpmConfirmerRecommencer() {
  var faire = function () { cqcpmReinitialiser(); _cqcpmUi = { vue: 'accueil', carte: null, ecran: 0, ouverts: {}, nbEntrees: {}, detour: false }; cqcpmRetourVersPresentation(false); };
  if (typeof confirmerAction === 'function') {
    confirmerAction('Recommencer « ' + CQCPM_NOM + ' » ?', 'Vos réponses de cet espace seront effacées, y compris les résultats que vous aviez gardés. Vos autres modules, Mes Repères et Mon Carnet ne sont pas touchés.', 'Recommencer', 'btn-danger', faire, 'Garder mon travail');
  } else { faire(); }
}
// Effacer UNE carte gardée : même confirmation que « Tout effacer » (audit du 22/11/2026, point 1 : un clic par erreur effaçait la carte sans rien demander).
function cqcpmConfirmerEffacerCarte(id) {
  var carte = cqcpmCarte(id);
  if (!carte) { return; }
  var faire = function () { cqcpmEffacerCarte(cqcpmEtat(), id); cqcpmRendre(); };
  if (typeof confirmerAction === 'function') {
    confirmerAction('Effacer cette carte ?', 'Le résultat gardé de « ' + carte.nom + ' » et vos réponses à cette carte seront effacés. Cela ne peut pas être annulé.', 'Effacer', 'btn-danger', faire, 'Garder cette carte');
  } else { faire(); }
}
function cqcpmConfirmerToutEffacer() {
  var faire = function () { cqcpmToutEffacer(cqcpmEtat()); cqcpmRendre(); };
  if (typeof confirmerAction === 'function') {
    confirmerAction('Tout effacer ?', 'Les résultats que vous avez gardés et vos réponses seront effacés de cet espace. Cela ne peut pas être annulé.', 'Tout effacer', 'btn-danger', faire, 'Garder mon travail');
  } else { faire(); }
}

// ---------------- Flèche « Précédent » du navigateur (brique B.24, docs/BRIQUES_COMMUNES.md) ----------------
function _cqcpmSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function') { return; }
  var ui = _cqcpmUi;
  historiqueInterneSynchroniser(CQCPM_ROUTE, { cle: _cqcpmSessionHistorique + ':' + ui.vue + ':' + ui.carte + ':' + ui.ecran, vue: ui.vue, carte: ui.carte, ecran: ui.ecran, session: _cqcpmSessionHistorique });
}
function _cqcpmRestaurerHistorique(instantane) {
  if (instantane.session !== _cqcpmSessionHistorique) { return 'sauter'; }
  if (instantane.vue === 'carte' && !cqcpmCarte(instantane.carte)) { return 'sauter'; }
  _cqcpmUi.vue = instantane.vue; _cqcpmUi.carte = instantane.carte; _cqcpmUi.ecran = instantane.ecran; _cqcpmUi.detour = false;
}
function _cqcpmInscrireHistorique() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher(CQCPM_ROUTE, _cqcpmRestaurerHistorique); }
}

// ---------------- Pages ----------------

// Cible de la route 'ce-qui-compte' : l'espace. Fermé au public : retour à l'accueil (sauf sur le poste de Denis).
function pageCeQuiCompte() {
  if (!cqcpmOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  cqcpmRendre();
}

function _cqcpmHtmlAccueil() {
  var etat = cqcpmEtat(), n = cqcpmNombreGardees(etat);
  var h = '<p class="text-center" style="font-size:1.05rem">Un espace pour mettre des mots sur ce que vous aimeriez, sur ce qui compte pour vous et sur ce que vous avez vécu. Ni test, ni note : seulement vos propres mots. Chaque carte est indépendante : vous commencez par celle que vous voulez.</p>';
  cqcpmThemes().forEach(function (t) {
    var cartes = cqcpmCartesDuTheme(t.id), nbGardees = cartes.filter(function (c) { return cqcpmEstGardee(etat, c.id); }).length;
    h += '<div class="cqcpm-theme-bloc"><div class="tete"><span class="cqcpm-ico"><i class="bi ' + t.icone + '" aria-hidden="true"></i></span><div><h2>' + _cqcpmEsc(t.titre) + '</h2><p>' + _cqcpmEsc(t.sous) + '</p></div>' +
      '<span class="cqcpm-compte' + (nbGardees ? ' plein' : '') + '">' + nbGardees + ' sur ' + cartes.length + ' gardée' + (cartes.length > 1 ? 's' : '') + '</span></div>' +
      // Le film de la rubrique, sous sa phrase et avant ses cartes (décision de Denis du 25/11/2026 : le film est sur la carte de chaque chemin, partout pareil). Rien si la rubrique n'a pas de film (« La suite »).
      (typeof htmlVideoPresentation === 'function' ? htmlVideoPresentation('ce-qui-compte-' + t.id) : '') +
      '<div class="cqcpm-cartes n' + cartes.length + '">';
    cartes.forEach(function (c) {
      var fait = cqcpmEstTerminee(etat, c.id), gardee = cqcpmEstGardee(etat, c.id), commencee = cqcpmCarteCommencee(etat, c.id);
      h += '<div class="cqcpm-carte">' +
        (fait ? '<span class="cqcpm-etat"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> ' + (gardee ? 'Gardé' : 'Terminé') + '</span>' : '') +
        '<span class="cqcpm-ico"><i class="bi ' + c.icone + '" aria-hidden="true"></i></span>' +
        (typeof htmlRepereTempsChemin === 'function' ? htmlRepereTempsChemin('compte', c.id) : '') +
        '<h3>' + _cqcpmEsc(c.nom) + '</h3><p class="pour">' + _cqcpmEsc(c.pour) + '</p><p class="dit">' + _cqcpmEsc(c.dit) + '</p>' +
        '<button type="button" class="btn ' + (commencee ? 'btn-outline-primary' : 'btn-primary') + '" data-cqcpm-act="commencer-carte" data-v="' + c.id + '">' + (commencee ? 'Reprendre cette carte' : 'Commencer') + '</button></div>';
    });
    h += '</div>' + cqcpmHtmlFinTheme(t, cartes) + '</div>';
  });
  h += cqcpmHtmlBlocPapier();
  h += typeof mplHtmlBloc === 'function' ? mplHtmlBloc('ce-qui-compte') : '';   // « Mon plan » : le même bloc que dans « Ma synthèse » (modules/mon-plan/index.js)
  h += '<div class="cqcpm-bas"><button type="button" class="btn btn-outline-primary" data-cqcpm-act="voir-gardees"><i class="bi bi-floppy" aria-hidden="true"></i> Ce que j’ai gardé' + (n ? ' (' + n + ')' : '') + '</button></div>';
  return h;
}
// Avertissement au-dessus de « Tout imprimer » : la feuille reprend TOUTES les cartes gardées, y compris la plus personnelle (celle dont la case de lecture n'est pas cochée d'avance). Écrit en ligne, sans fenêtre.
function _cqcpmHtmlAvertImpression(gardees) {
  var perso = gardees.filter(function (g) { var c = cqcpmCarte(g.id); return c && c.envoiParDefaut === false; }).map(function (g) { return '« ' + _cqcpmEsc(cqcpmCarte(g.id).nom) + ' »'; });
  var txt = 'Attention : « Tout imprimer » met toutes les cartes gardées sur la même feuille' + (perso.length ? ', y compris ' + perso.join(' et ') + ', qui est très personnelle' : '') + '. Relisez la feuille avant de la montrer ou de la remettre à quelqu’un. Pour ne donner qu’une carte, imprimez-la depuis son résultat.';
  return '<p class="cqcpm-note cqcpm-avert-impression"><i class="bi bi-exclamation-circle" aria-hidden="true"></i> ' + txt + '</p>';
}
function _cqcpmHtmlGardees() {
  var etat = cqcpmEtat(), l = cqcpmCartesGardees(etat);
  var h = '<p class="text-center" style="font-size:1.05rem">Les résultats que vous avez choisi de garder. Vous pouvez les relire, les modifier en reprenant la carte, les imprimer ou les effacer.</p>';
  if (!l.length) {
    return h + '<div class="cqcpm-vide"><p>Vous n’avez encore rien gardé. À la fin d’une carte, le bouton « Garder mon résultat » le range ici.</p><button type="button" class="btn btn-primary" data-cqcpm-act="retour-espace">Retour aux cartes</button></div>';
  }
  h += '<div class="cqcpm-garde">' + l.map(function (g) {
    var c = cqcpmCarte(g.id), date = cqcpmDateFr(g.date);
    return '<div class="cqcpm-ligne"><span class="cqcpm-ico"><i class="bi ' + c.icone + '" aria-hidden="true"></i></span><div class="txt"><h3>' + _cqcpmEsc(c.nom) + '</h3>' + (date ? '<p class="cqcpm-note">Gardé le ' + date + '</p>' : '') +
      '<p>' + _cqcpmEsc(cqcpmApercu(g.id, etat.gardees[g.id].reponses, etat)) + '</p></div>' +
      '<button type="button" class="btn btn-outline-primary btn-sm" data-cqcpm-act="relire" data-v="' + g.id + '">Relire</button>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="effacer" data-v="' + g.id + '"><i class="bi bi-trash" aria-hidden="true"></i> Effacer</button></div>';
  }).join('') + '</div>' + (typeof htmlRappelSauvegarde === 'function' ? htmlRappelSauvegarde() : '') + _cqcpmHtmlAvertImpression(l) + '<div class="cqcpm-actions"><button type="button" class="btn btn-outline-primary" data-cqcpm-act="imprimer-tout"><i class="bi bi-printer" aria-hidden="true"></i> Tout imprimer ou enregistrer en PDF</button>' +
      '<button type="button" class="btn btn-outline-danger" data-cqcpm-act="tout-effacer"><i class="bi bi-trash" aria-hidden="true"></i> Tout effacer</button></div>';
  return h;
}

function cqcpmRendre() {
  _cqcpmInscrireHistorique();
  var ui = _cqcpmUi, etat = cqcpmEtat(), carte = ui.vue === 'carte' ? cqcpmCarte(ui.carte) : null;
  if (ui.vue === 'carte' && !carte) { ui.vue = 'accueil'; }
  var corps, sousTitre = 'Par où voulez-vous commencer ?', suivant = null;
  if (ui.vue === 'gardees') { corps = _cqcpmHtmlGardees(); sousTitre = 'Ce que j’ai gardé'; }
  else if (ui.vue === 'papier-preparer') { corps = cqcpmHtmlPapierPreparer(); sousTitre = 'Préparer mon papier'; }
  else if (ui.vue === 'papier-assistant') { corps = cqcpmHtmlPapierAssistant(); sousTitre = 'Mon papier : avec l’assistant en ligne'; }
  else if (ui.vue === 'papier') {
    if (!cqcpmPapier(etat)) { ui.vue = 'accueil'; corps = _cqcpmHtmlAccueil(); }   // plus de papier (effacé ou retiré) : retour à l'accueil, qui le dit
    else { corps = cqcpmHtmlPapier(); sousTitre = 'Mon papier'; }
  }
  else if (ui.vue === 'carte') {
    sousTitre = carte.nom;
    var dernier = _cqcpmDernierEcran(carte);
    if (ui.ecran <= 0) { corps = cqcpmHtmlInvitation(carte); suivant = { libelle: 'Commencer' }; }
    else if (ui.ecran >= dernier) { corps = cqcpmHtmlResultat(carte); }
    else { corps = cqcpmHtmlSaisie(carte, ui.ecran - 1); suivant = { libelle: ui.ecran + 1 === dernier ? 'Voir mon résultat' : 'Continuer' }; }
  } else { corps = _cqcpmHtmlAccueil(); }
  var scrollPrecedent = window.scrollY || 0;
  app.innerHTML =
    '<div class="page-catalogue-contenu cqcpm-page" id="cqcpmRacine">' +
    htmlBandeRepriseModule(htmlBoutonRevoirModule('btnCqcpmRevoir', CQCPM_ICONE, 'Revoir la présentation', false), '') +
    htmlTitreEtapeModule(CQCPM_ICONE, CQCPM_NOM, sousTitre) +
    ((ui.vue === 'carte' || ui.vue === 'papier-preparer' || ui.vue === 'papier') ? '<div class="mb-2"><button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="retour-espace"><i class="bi bi-arrow-left" aria-hidden="true"></i> Retour à « ' + CQCPM_NOM + ' »</button></div>' : '') +
    '<div id="cqcpmCorps">' + corps + '</div></div>' +
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', suivant ? 'cv' : null, suivant ? suivant.libelle : null, suivant
      ? { onclickPrecedent: 'cqcpmRetourBarre()', onclickSuivant: 'cqcpmContinuerBarre()', libelleExact: true }
      : { onclickPrecedent: 'cqcpmRetourBarre()' }) +
    '</div>';
  _cqcpmSynchroniserHistorique();
  var arrivee = (typeof consommerArriveeDepuisPresentation === 'function') && consommerArriveeDepuisPresentation();
  var cle = ui.vue + ':' + ui.carte + ':' + ui.ecran, nouvelle = cle !== _cqcpmVueRendue;
  _cqcpmVueRendue = cle;
  window.scrollTo(0, (arrivee || nouvelle) ? 0 : scrollPrecedent);
  if (ui.vue === 'papier-assistant' && typeof cqcpmCablerPapierAssistant === 'function') { cqcpmCablerPapierAssistant(); }
  var btnRevoir = document.getElementById('btnCqcpmRevoir');
  if (btnRevoir) { btnRevoir.addEventListener('click', function () { cqcpmRetourVersPresentation(true); }); }
  var racine = document.getElementById('cqcpmRacine');
  if (racine) { racine.addEventListener('click', cqcpmClic); racine.addEventListener('input', cqcpmSaisie); racine.addEventListener('keydown', cqcpmTouche); }
  if (typeof trackEvenement === 'function') { trackEvenement('ce_qui_compte_vue', { vue: ui.vue, carte: ui.carte || '', ecran: ui.ecran }); }
}

// Blocs de la présentation (maquette du 22/11/2026, consigne 566) : un titre avec une pastille d'icône, des textes en couleur pleine.
function _cqcpmIntroBloc(icone, titre, corpsHTML) {
  return '<div class="cqcpm-bloc"><h2><span class="cqcpm-ico"><i class="bi ' + icone + '" aria-hidden="true"></i></span> ' + titre + '</h2>' + corpsHTML + '</div>';
}
// Les huit cartes, par thème, lues dans data/cqcpmCartes.js (source unique : le texte suit les cartes sans être recopié).
function _cqcpmIntroThemes() {
  return cqcpmThemes().map(function (t) {
    var cartes = cqcpmCartesDuTheme(t.id);
    return '<div class="cqcpm-bloc"><h2><span class="cqcpm-ico"><i class="bi ' + t.icone + '" aria-hidden="true"></i></span> ' + _cqcpmEsc(t.titre) + '</h2><p class="cqcpm-note mb-1">' + _cqcpmEsc(t.sous) + '</p>' +
      cartes.map(function (c, k) {
        return '<div class="cqcpm-intro-carte' + (k === 0 ? ' premiere' : '') + '"><span class="cqcpm-ico petit"><i class="bi ' + c.icone + '" aria-hidden="true"></i></span><div><h4>' + _cqcpmEsc(c.nom) + '</h4><p class="q">' + _cqcpmEsc(c.pour) + '</p><p><b>Vous obtenez :</b> ' + _cqcpmEsc(c.invitation.obtenez) + '</p></div></div>';
      }).join('') + '</div>';
  }).join('');
}

// Présentation de l'espace (composant partagé htmlPageIntroModuleParcours) : « Revoir la présentation » y revient à tout moment.
function pageIntroCeQuiCompte() {
  if (!cqcpmOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  var enCours = !_cqcpmUi.detour && cqcpmAUnTravailEnCours();
  var explorerOuvert = typeof cmvOuvert === 'function' && cmvOuvert();   // jamais de renvoi vers un module encore fermé au public
  var config = {
    temps: 'compte',   // repère de temps (data/tempsModules.js, consigne 606)
    carteRetour: 'boiteaoutils',
    routeRetour: _cqcpmRetourVers || undefined,
    detour: _cqcpmUi.detour,
    syntheseHTML: enCours ? _introBlocReprise('Vous avez déjà des réponses dans cet espace.', 'btnCqcpmRepriseContinuer', 'btnCqcpmRepriseRecommencer', 'Reprendre') : '',
    actionsSynthese: enCours ? [{ id: 'btnCqcpmRepriseContinuer', action: cqcpmRevenirDeLaPresentation }, { id: 'btnCqcpmRepriseRecommencer', action: cqcpmConfirmerRecommencer }] : [],
    ctaMasque: enCours,
    detourLogo: CQCPM_ICONE,
    detourBoutonId: 'btnCqcpmRevenirModuleHaut',
    detourCtaId: 'btnCqcpmRevenirModuleBas',
    onRevenir: cqcpmRevenirDeLaPresentation,
    onRevenirExpr: 'cqcpmRevenirDeLaPresentation()',
    titre: '<i class="bi ' + CQCPM_ICONE + '"></i> ' + CQCPM_NOM,
    sousTitre: 'Un espace pour mettre des mots sur ce que vous aimeriez, sur ce qui compte pour vous dans un travail et sur ce que vous avez vécu.',
    video: 'ce-qui-compte',
    ctaId: 'btnCqcpmCommencer',
    ctaLabel: 'Ouvrir l’espace &#8594;',
    multilingueCourte: true,
    onCta: function () { _cqcpmUi.vue = 'accueil'; _cqcpmUi.carte = null; _cqcpmUi.ecran = 0; if (typeof naviguerVers === 'function') { naviguerVers(CQCPM_ROUTE); } },
    blocsHTML:
      _introBlocAccroche('<strong>Ni test, ni note, ni profil.</strong> Seulement vos propres mots, à votre rythme.') +
      _cqcpmIntroBloc('bi-compass', 'À quoi ça sert',
        '<p>Les questions sur un parcours portent souvent sur ce que vous savez faire. Cet espace pose les autres : ce que vous aimeriez, ce qui compte pour vous, et dans quelles conditions vous vous sentez bien pour travailler.</p>' +
        '<p class="mb-1">Vos mots peuvent ensuite vous servir à :</p><ul class="mb-0"><li>parler de vous à un conseiller, avec vos propres mots ;</li><li>préparer un entretien ;</li><li>choisir une direction' + (explorerOuvert ? ', avec « Explorer les métiers » et sa synthèse' : '') + '.</li></ul>') +
      _cqcpmIntroBloc('bi-grid', 'Huit cartes, en quatre thèmes',
        '<p class="mb-0">Chaque carte est indépendante : vous commencez par celle que vous voulez, dans l’ordre que vous voulez, ou vous n’en faites qu’une. Voici ce que contient chacune.</p>') +
      _cqcpmIntroThemes() +
      _cqcpmIntroBloc('bi-list-ol', 'Comment se passe une carte',
        '<ol class="cqcpm-etapes">' +
        '<li><span class="num">1</span><span><b>Une page d’invitation</b> dit ce que vous allez faire et ce que vous obtenez.</span></li>' +
        '<li><span class="num">2</span><span><b>Vous écrivez ou vous choisissez</b>, à votre rythme. Vous pouvez passer une question ou répondre « je ne sais pas ».</span></li>' +
        '<li><span class="num">3</span><span><b>Vous voyez votre résultat</b>, avec vos mots, sans note ni jugement.</span></li>' +
        '<li><span class="num">4</span><span><b>Vous choisissez de le garder ou non.</b> Prévoyez le temps qu’il faut.</span></li></ol>') +
      _cqcpmIntroBloc('bi-floppy', 'Ce que vous gardez, et ce que vous en faites',
        '<ul class="mb-0"><li>Les résultats gardés sont rangés dans « Ce que j’ai gardé ». Vous pouvez les relire, les modifier ou les effacer.</li>' +
        '<li>Ils partent avec votre sauvegarde personnelle (la disquette), sur votre appareil.</li>' +
        '<li>Vous pouvez les imprimer ou les enregistrer en PDF, pour les apporter à un conseiller.</li>' +
        '</ul>') +
      _cqcpmIntroBloc('bi-file-earmark-text', 'Un papier à la fin',
        '<p>Quand vous avez gardé au moins deux cartes, vous pouvez recevoir <b>un papier</b>, « Ce qui revient dans mes cartes » : une lecture de ce que vous avez écrit, avec ce qui revient d’une carte à l’autre, ce qui compte beaucoup pour vous et ce que vous pourriez préciser.</p>' +
        '<ul class="mb-0"><li>Il est écrit par l’assistant en ligne, à partir des cartes que vous cochez. Vous relisez la demande avant de la copier : rien n’est envoyé par l’application.</li>' +
        '<li>Il n’est jamais obligatoire, et ce n’est ni une note, ni un profil.</li>' +
        (explorerOuvert ? '<li>Il peut servir dans « Explorer les métiers » : c’est là, dans « Ma synthèse », que vous seul choisissez de le joindre. Sans lui, rien ne change.</li>' : '') + '</ul>') +
      _cqcpmIntroBloc('bi-slash-circle', 'Ce que cet espace ne fait pas',
        '<ul class="mb-0"><li>Il ne vous donne ni note, ni type, ni profil.</li><li>Il ne vous dit pas quel métier choisir.</li><li>Il ne juge aucune de vos réponses : il n’y a pas de bonne ou de mauvaise réponse.</li>' +
        '<li>Il ne remplace pas une aide. Si c’est difficile en ce moment, les fiches d’aide de l’application vous disent qui contacter.</li></ul>') +
      '<div class="cqcpm-ok"><i class="bi bi-shield-check" aria-hidden="true"></i><span><b>Rien n’est enregistré pendant que vous écrivez.</b> À la fin de chaque carte, vous choisissez de garder le résultat ou non. Rien n’est envoyé ailleurs.</span></div>'
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('ce_qui_compte_intro_affichee'); }
}
