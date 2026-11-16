/* ============================================================
   Question « Qui choisit les missions et les compétences de vos expériences ? » (consignes 401 et 408, maquette validée le 16/11/2026 :
   docs/MAQUETTE_QUI_CHOISIT_LES_MISSIONS_2026-11-16.html).
   Chargé après panneau.js. Le choix est posé UNE fois par CV, avant « Votre objectif », et ne se change plus (irrévocable) :
   dossier.missionsChoisiesPar = null (pas encore demandé : comportement d'avant) | 'moi' | 'assistant'.
   - 'moi' : le panneau riche d'ajout d'une expérience et la page « Vos missions et compétences ».
   - 'assistant' : l'ancien formulaire d'expérience, pas de page « Vos missions et compétences », ancien message (prompts/cv.md).
   Le test « cette fonction est-elle active pour ce CV ? » est mcActifPourCeCv() (logique.js), source unique.
   Lot 1 : parcours « Créer un nouveau CV avec l'assistant ». « À la main » ne pose jamais la question (la personne choisit forcément).
   Lot 3 : « Reprendre mon CV », voie 1 « Le garder et le compléter » (dossier.missionsChoisiesVoie = 'maj'). Voie 2 (reformuler) et voie 3 (sans assistant) : jamais.
   Lot 4 : « À partir de mon récit » (dossier.missionsChoisiesVoie = 'recit'), question posée avant la session du récit ; si la personne choisit « moi », l'assistant repère aussi un métier par expérience.
   ============================================================ */

// Faut-il poser la question maintenant ? Seulement pour « Créer un nouveau CV » AVEC l'assistant, quand elle n'a pas encore été posée
// et qu'aucune expérience n'est déjà saisie (une session commencée avant ce changement garde son fonctionnement).
function missionsChoixAPoser() {
  if (typeof MC_OUVERT === 'undefined' || MC_OUVERT !== true || typeof dossier === 'undefined' || !dossier) { return false; }
  return dossier.modeCreation === 'nouveau' && !dossier.creationSansAssistant && !_cmDejaPose('nouveau') &&
    !(dossier.experiences || []).length && !(typeof _depuisBilanVersProjet !== 'undefined' && _depuisBilanVersProjet);
}

// Lot 3 : « Reprendre mon CV », voie 1 (« Le garder et le compléter »), AVANT les cartes d'objectif et le premier passage chez l'assistant.
// Jamais pour la voie 2 (reformuler : rien n'est ajouté) ni la voie 3 (sans assistant : la personne choisit forcément). Pas si l'assistant a déjà extrait les expériences de ce parcours.
function missionsChoixAPoserReprise() {
  if (typeof MC_OUVERT === 'undefined' || MC_OUVERT !== true || typeof dossier === 'undefined' || !dossier) { return false; }
  if (typeof _prepLEMode === 'undefined' || _prepLEMode !== 'maj' || (typeof _reprendreCvActif !== 'undefined' && _reprendreCvActif)) { return false; }
  if (typeof _prepLEEcran !== 'undefined' && _prepLEEcran !== 'depot') { return false; }
  if (typeof _depuisBilanVersProjet !== 'undefined' && _depuisBilanVersProjet) { return false; }
  if (dossier._modeCreationVia === 'maj' && (dossier.experiences || []).length) { return false; }
  return !_cmDejaPose('maj');
}

// La question a-t-elle déjà reçu sa réponse POUR CE PARCOURS ? Une réponse sans parcours noté (session d'avant le lot 3) compte pour « Créer un nouveau CV ».
function _cmDejaPose(voie) {
  if (typeof dossier === 'undefined' || !dossier || !dossier.missionsChoisiesPar) { return false; }
  return (dossier.missionsChoisiesVoie || 'nouveau') === voie;
}

// Le parcours qui pose la question en ce moment : 'nouveau' (par défaut), 'maj' (Reprendre, voie 1) ou 'recit' (« À partir de mon récit »).
var _cmVoie = 'nouveau';

// Lot 4 : « À partir de mon récit », AVANT le récit. suite : ce qui démarre la session du récit une fois la question répondue (la session n'existe pas encore).
// Renvoie vrai si la question est affichée (l'appelant s'arrête là), faux sinon (module fermé : le récit démarre comme avant).
var _cmSuiteRecit = null;
function missionsChoixPourRecit(suite) {
  if (typeof MC_OUVERT === 'undefined' || MC_OUVERT !== true || typeof dossier === 'undefined' || !dossier) { return false; }
  // Une nouvelle session du récit est un nouveau CV : une réponse restée d'un CV d'avant ne compte plus.
  dossier.missionsChoisiesPar = null; dossier.missionsChoisiesVoie = null;
  _cmChoix = null; _cmConfirmation = false; _cmVoie = 'recit'; _cmSuiteRecit = suite;
  naviguerVers('choix-missions');
  return true;
}
function cmDemarrerRecit() {
  var suite = _cmSuiteRecit; _cmSuiteRecit = null;
  if (typeof suite === 'function') { suite(); }
}

// Première route de la voie 1 de « Reprendre mon CV » : la question, puis la page de dépôt et d'objectif.
function _reprendreCvRouteVoie1() {
  _cmChoix = null; _cmConfirmation = false;
  if (missionsChoixAPoserReprise()) { _cmVoie = 'maj'; return 'choix-missions'; }
  return 'mettre-a-jour-cv';
}

// Première route d'un nouveau CV avec l'assistant : la question, puis « Votre objectif ».
function _creerCvRouteDepart() {
  _cmChoix = null; _cmConfirmation = false;   // un nouveau CV : l'ecran repart sans carte choisie
  _cmVoie = 'nouveau';
  return missionsChoixAPoser() ? 'choix-missions' : 'objectif';
}

// Rappel discret du choix, sans bouton pour le changer (demandé dans la maquette).
function htmlRappelChoixMissions() {
  if (typeof dossier === 'undefined' || !dossier || !dossier.missionsChoisiesPar || typeof mcVoieDuChoix !== 'function' || (dossier.missionsChoisiesVoie || 'nouveau') !== mcVoieDuChoix()) { return ''; }
  return '<p class="cm-rappel" role="note"><i class="bi bi-lock" aria-hidden="true"></i> ' +
    (dossier.missionsChoisiesPar === 'moi'
      ? 'Vous choisissez vous-même les missions et les compétences de vos expériences.'
      : 'L’assistant vous propose les missions et les compétences de vos expériences.') + '</p>';
}

var _cmChoix = null;          // choix en cours sur l'écran (avant confirmation)
var _cmConfirmation = false;  // la demande de confirmation est affichée

function _cmCarte(id, icone, titre, phrase, points) {
  var verrou = _cmDejaPose(_cmVoie);
  var actif = (verrou ? dossier.missionsChoisiesPar : _cmChoix) === id;
  return '<button type="button" class="cm-carte' + (actif ? ' is-actif' : '') + '" role="radio" aria-checked="' + actif + '" data-cm-choix="' + id + '"' + (verrou ? ' disabled' : '') + '>' +
    '<span class="cm-ico"><i class="bi ' + icone + '" aria-hidden="true"></i></span>' +
    '<span class="cm-titre">' + titre + '</span><span class="cm-phrase">' + phrase + '</span>' +
    '<ul>' + points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
    '<span class="cm-coche">' + (actif ? '<i class="bi bi-check-circle-fill" aria-hidden="true"></i> Votre choix' : '') + '</span></button>';
}

function pageChoixMissions() {
  var verrou = _cmDejaPose(_cmVoie);
  var choix = verrou ? dossier.missionsChoisiesPar : _cmChoix;
  var reprise = (_cmVoie === 'maj'), recit = (_cmVoie === 'recit');
  var html = (reprise ? barreEtapesModule(MAJ_CV_NAV_ETAPES, 0) : (recit ? '' : afficherProgression('objectif'))) +
    '<div class="page-catalogue-contenu">' +
    '<div class="text-center"><h1>Avant de commencer</h1><p class="sousTitre">Une seule question, importante pour la suite de ce CV.</p></div>' +
    '<div class="cv-section"><h2 style="font-size:1.2rem;margin-bottom:.3rem">Qui choisit les missions et les compétences de vos expériences ?</h2>' +
    '<p class="mb-1">Pour chaque métier que vous avez fait, il faut choisir ce que vous y faisiez et ce que vous savez faire. Vous décidez comment on s’y prend.</p>' +
    '<div class="cm-cartes" role="radiogroup" aria-label="Qui choisit les missions et les compétences ?">' +
    _cmCarte('moi', 'bi-hand-index-thumb', 'Je les choisis moi-même', 'Vous cochez, expérience par expérience, ce que vous avez vraiment fait.',
      ['Plus précis : chaque mot est le vôtre', 'Un peu plus long', 'Vous gardez la main sur tout']) +
    _cmCarte('assistant', 'bi-chat-left-text', 'L’assistant me les propose', 'Vous donnez vos informations, l’assistant propose, puis vous relisez.',
      ['Plus rapide', 'Vous pouvez corriger ensuite', 'Pratique si vous manquez de temps']) +
    '</div>' +
    '<p class="cm-lecon">Les deux mènent à un bon CV. Il n’y a pas de bon ou de mauvais choix : prenez celui qui vous met le plus à l’aise.</p></div>';
  if (!verrou) {
    html += '<div class="cm-verrou" role="note"><p class="mb-0"><i class="bi bi-info-circle" aria-hidden="true"></i> <strong>À savoir :</strong> une fois confirmé, ce choix ne change plus pour ce CV. Pour faire autrement, vous commencez un nouveau CV.</p></div>';
    if (_cmConfirmation && choix) {
      var mot = choix === 'moi' ? 'choisir vous-même vos missions et vos compétences' : 'laisser l’assistant vous proposer vos missions et vos compétences';
      html += '<div class="cm-confirm" id="cmConfirm" role="group" aria-live="polite"><p class="mb-0"><strong>Vous confirmez : ' + mot + ' ?</strong><br>Ce choix ne pourra plus être changé pour ce CV.</p>' +
        '<div class="cm-boutons"><button type="button" class="btn btn-primary" id="cmOui">Oui, je confirme</button>' +
        '<button type="button" class="btn btn-outline-secondary" id="cmNon">Je reviens au choix</button></div></div>';
    }
  } else {
    html += '<div class="cm-verrou"><p class="mb-1"><i class="bi bi-lock" aria-hidden="true"></i> <strong>Choix enregistré :</strong> ' +
      (choix === 'moi' ? 'vous choisissez vous-même vos missions et vos compétences.' : 'l’assistant vous propose vos missions et vos compétences.') + '</p>' +
      '<p class="mb-0 small">Ce choix ne se change plus pour ce CV. Un rappel discret apparaît en haut des pages qui suivent.</p></div>';
  }
  // « Retour » ramene a l'endroit d'ou la personne vient : les trois facons de creer un CV, ou l'ecran « Candidater » de l'accueil.
  // Piege evite : l'ANCIEN ecran « Candidater » compte une creation commencee comme « un CV deja la » (cvDisponible) et enverrait la personne
  // aux resultats ; seul le nouvel ecran (derriere l'interrupteur de la fiche) sait la reprendre. Sinon « Retour » = l'accueil, comme « Votre objectif ».
  var viensDeCreer = !reprise && ((typeof historiquePages === 'undefined') || historiquePages.lastIndexOf('creer-cv') >= historiquePages.lastIndexOf('candidater'));
  var routeRetour = reprise ? 'reprendre-cv' : viensDeCreer ? 'creer-cv' : ((typeof ficheRomeCompleteActive === 'function' && ficheRomeCompleteActive()) ? 'candidater' : 'cv');
  html += '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation(routeRetour, reprise ? 'mettre-a-jour-cv' : (recit ? 'decouverte' : 'objectif'), verrou ? (recit ? 'Continuer vers votre récit &#8594;' : 'Continuer vers Votre objectif &#8594;') : 'Continuer &#8594;',
      { onclickPrecedent: reprise ? "naviguerVers('reprendre-cv')" : viensDeCreer ? ((typeof _creerCvAllerPresentation === 'function') ? '_creerCvAllerPresentation()' : null) : (routeRetour === 'cv' ? "naviguerVers('cv')" : null),
        suivantDesactive: !verrou && !choix,
        suivantDesactiveMessage: 'Cliquez d’abord sur l’une des deux cartes.',
        onclickSuivant: verrou ? (recit ? 'cmDemarrerRecit()' : null) : 'cmContinuer()' }) + '</div>';
  app.innerHTML = html;
  document.querySelectorAll('[data-cm-choix]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (_cmDejaPose(_cmVoie)) { return; }
      _cmChoix = b.getAttribute('data-cm-choix'); _cmConfirmation = false; pageChoixMissions();
    });
  });
  var oui = document.getElementById('cmOui');
  if (oui) { oui.addEventListener('click', function () {
    dossier.missionsChoisiesPar = _cmChoix; dossier.missionsChoisiesVoie = _cmVoie; _cmConfirmation = false;
    pageChoixMissions(); window.scrollTo(0, 0);
  }); }
  var non = document.getElementById('cmNon');
  if (non) { non.addEventListener('click', function () { _cmConfirmation = false; pageChoixMissions(); }); }
}

// « Continuer » avant confirmation : on demande de confirmer, dans la page (pas de fenêtre).
function cmContinuer() {
  if (!_cmChoix) { return; }
  _cmConfirmation = true;
  pageChoixMissions();
  var z = document.getElementById('cmConfirm');
  if (z && typeof revenirALaRubrique === 'function') { revenirALaRubrique(z, 200); }
}

// ---------- Lot 4 : le récit, quand la personne choisit elle-même ----------
// Le premier échange demande aussi, à l'assistant, des intitulés de métier usuels par expérience (prompts/decouverte-metiers.md). À l'étape « Vos expériences », on les rapproche
// du répertoire et les expériences arrivent déjà reliées à une fiche : la personne les confirme, les change ou les complète dans le panneau, jamais à sa place.
function mcRecitDemandeLesMetiers() {
  return typeof MC_OUVERT !== 'undefined' && MC_OUVERT === true && typeof dossier !== 'undefined' && !!dossier && dossier.missionsChoisiesPar === 'moi' && dossier.missionsChoisiesVoie === 'recit';
}
function _mcRecitTrouverCode(intitule) {
  if (typeof REPERTOIRE_ROME === 'undefined' || !REPERTOIRE_ROME || typeof mcChercherFiche !== 'function') { return null; }
  var r = mcChercherFiche(intitule, REPERTOIRE_ROME, {});
  return (r && r.niveau === 'A' && r.preselection) ? r.preselection.code : null;   // jamais de devinette : seulement une fiche reconnue sans hésitation
}
// Pré-relie les expériences du récit. Renvoie vrai si le rapprochement est fait tout de suite, faux s'il attend le chargement du répertoire (aucun blocage : rien ne s'affiche en moins).
// apresChargement : appelée si le rapprochement a dû attendre le répertoire (pour redessiner l'étape).
function mcRecitRattacherMetiers(apresChargement) {
  if (!mcRecitDemandeLesMetiers()) { return false; }
  var avecMetiers = (dossier.experiences || []).some(function (e) { return e && Array.isArray(e.metiersProches) && e.metiersProches.length; });
  if (!avecMetiers) { return false; }
  var faire = function () {
    var n = 0;
    try { dossier.etapeMC = mcEtatNormalise(dossier.etapeMC); n = mcRattacherMetiersProposes(dossier.etapeMC, dossier.experiences, _mcRecitTrouverCode); } catch (e) { /* jamais un blocage : la personne choisit son métier dans le panneau */ }
    return n;
  };
  if (typeof _repertoireRomeEtat !== 'undefined' && _repertoireRomeEtat === 'pret') { faire(); return true; }
  if (typeof chargerRepertoireElargi === 'function') {
    chargerRepertoireElargi(function () { if (faire() > 0 && typeof apresChargement === 'function') { apresChargement(); } });
  }
  return false;
}
// Combien d'expériences du récit sont déjà reliées à une fiche (pour la phrase d'aide de l'étape « Vos expériences »).
function mcRecitNbReliees() {
  if (typeof dossier === 'undefined' || !dossier || !dossier.etapeMC) { return 0; }
  return (dossier.experiences || []).filter(function (e) { return e && e.idEtape && dossier.etapeMC.fiches && dossier.etapeMC.fiches[e.idEtape]; }).length;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mcRecitDemandeLesMetiers: mcRecitDemandeLesMetiers, missionsChoixAPoser: missionsChoixAPoser, missionsChoixAPoserReprise: missionsChoixAPoserReprise, missionsChoixPourRecit: missionsChoixPourRecit };
}
