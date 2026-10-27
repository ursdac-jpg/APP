/* ============================================================
   Module « Découvrir mes compétences » : interface (pages routées). Chargé avant js/app.js (référencé dans l'objet `routes`) ;
   logique pure dans filet.js et logique.js (chargés avant ce fichier). Même patron que « Un CV, plusieurs métiers » (index.js du module).
   Plan : docs/AUDIT_FINAL_DECOUVRIR_MES_COMPETENCES_2026-10-26.md. Maquette : docs/MAQUETTE_MES_COMPETENCES_2026-10-26.html.

   Décisions de Denis, à ne pas rouvrir : module de la Boîte à outils ; formes, composants et fenêtres COMMUNS (rien d'inventé visuellement) ;
   le module ne remplace pas « À partir de mon récit » (identifiants decouverte* jamais réutilisés) ; barre d'étapes seulement visuelle ;
   rien n'entre dans le document que la personne n'a pas vu et gardé.
   ============================================================ */

// Ouvert au public depuis la fin de la séance C (27/10/2026) : documents, assistant, relecture, document. À repasser à false pour fermer le module.
var MESCOMP_OUVERT = true;

var MESCOMP_NAV_ETAPES = [
  { icone: '&#128196;', label: 'Documents' },
  { icone: '&#128172;', label: 'Assistant' },
  { icone: '&#9989;', label: 'Relecture' },
  { icone: '&#128216;', label: 'Mon document' }
];
var MESCOMP_ECRANS = ['documents', 'assistant', 'relecture', 'document'];
var MESCOMP_TITRES = { documents: 'Mes documents', assistant: 'L’assistant en ligne', relecture: 'Je relis mes compétences', document: 'Mes compétences' };

var _mesCompEtat = null;                  // état de session (voir logique.js, mesCompEtatInitial)
var _mesCompDetourPresentation = false;   // « Revoir la présentation » depuis une page de travail
var _mesCompReprisePendante = false;      // retour dans le module avec un travail en cours : encart « Continuer / Recommencer » + gel
var _mesCompSessionHistorique = 1;
var _mesCompEcranRendu = '';

// Rendus d'écran : nom -> { rendre(etat) -> html, cabler(etat), peutContinuer(etat), raisonBlocage(etat), continuer(etat), retour(etat) -> true si géré, libelleContinuer }.
var _mesCompPages = {};
function mesCompEnregistrerPage(ecran, definition) { _mesCompPages[ecran] = definition; }

function mesCompOuvrir() {
  if (!_mesCompEtat) { _mesCompEtat = mesCompEtatInitial(); }
  return _mesCompEtat;
}
function mesCompAUnTravailEnCours(e) {
  return !!e && ((e.documents && e.documents.length > 0) || (e.lignes && e.lignes.length > 0) || (e.envies && e.envies.length > 0));
}
function _mesCompIndexEcran(etat) { var i = MESCOMP_ECRANS.indexOf(etat.ecran); return i < 0 ? 0 : i; }

// Cible de la route 'mes-competences' : la page de travail, ou la présentation quand rien n'est engagé.
function pageMesCompetences() {
  if (!_mesCompEtat) {
    if (typeof naviguerVers === 'function') { naviguerVers('mes-competences-intro'); }
    return;
  }
  mesCompRendrePage();
}

// ---------------- Navigation entre écrans ----------------

function mesCompAllerEcran(ecran) {
  var etat = mesCompOuvrir();
  etat.ecran = MESCOMP_ECRANS.indexOf(ecran) >= 0 ? ecran : 'documents';
  mesCompRendrePage();
}
function mesCompBarreRetour() {
  var etat = mesCompOuvrir();
  var def = _mesCompPages[etat.ecran];
  if (def && typeof def.retour === 'function' && def.retour(etat) === true) { return; }
  var i = _mesCompIndexEcran(etat);
  if (i <= 0) {
    _mesCompDetourPresentation = false;
    if (typeof naviguerVers === 'function') { naviguerVers('mes-competences-intro'); }
    return;
  }
  mesCompAllerEcran(MESCOMP_ECRANS[i - 1]);
}
function mesCompBarreContinuer() {
  var etat = mesCompOuvrir();
  var def = _mesCompPages[etat.ecran];
  if (def && typeof def.peutContinuer === 'function' && !def.peutContinuer(etat)) { return; }
  if (def && typeof def.continuer === 'function') { def.continuer(etat); return; }
  var i = _mesCompIndexEcran(etat);
  if (i < MESCOMP_ECRANS.length - 1) { mesCompAllerEcran(MESCOMP_ECRANS[i + 1]); }
}
function mesCompRetourVersPresentation() {
  _mesCompDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('mes-competences-intro'); }
}
function mesCompRevenirDeLaPresentation() {
  _mesCompDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('mes-competences'); }
}
function mesCompRepriseContinuer() {
  _mesCompReprisePendante = false;
  if (typeof naviguerVers === 'function') { naviguerVers('mes-competences'); }
}

// Détruit le travail du module (« Recommencer » et « Tout effacer »). Seul endroit qui remet l'état à zéro.
function mesCompReinitialiser() {
  _mesCompSessionHistorique++;
  _mesCompEtat = null;
  _mesCompDetourPresentation = false;
  _mesCompReprisePendante = false;
  _mesCompSecondEnCours = false;
  _mesCompNoteRetour = '';
  _mesCompSousOuverts = {};
  if (typeof clearInterval === 'function' && typeof _ucpmIntervalleDecompte !== 'undefined') { clearInterval(_ucpmIntervalleDecompte); }
  if (typeof _barreEtapesMaxAtteint !== 'undefined' && _barreEtapesMaxAtteint && typeof _barreEtapesMaxAtteint.delete === 'function') {
    _barreEtapesMaxAtteint.delete(MESCOMP_NAV_ETAPES);
  }
}

// ---------------- Pont disquette (voir collecterEtatsModulesPourSauvegarde / restaurerEtatsModules, js/app.js) ----------------

// null tant que rien n'est engagé. Les vues d'un passage avec l'assistant (« chez l'assistant ») ne se restaurent pas : on repart du choix.
function mesCompExporterEtatPourSauvegarde() {
  if (!mesCompAUnTravailEnCours(_mesCompEtat)) { return null; }
  var copie = JSON.parse(JSON.stringify(_mesCompEtat));
  copie.passages = {};
  return copie;
}
function mesCompRestaurerEtatDepuisSauvegarde(brut) {
  _mesCompSessionHistorique++;
  _mesCompDetourPresentation = false;
  _mesCompSecondEnCours = false;
  if (!brut) { _mesCompEtat = null; _mesCompReprisePendante = false; return; }
  _mesCompEtat = mesCompNormaliserEtat(brut);
  _mesCompReprisePendante = mesCompAUnTravailEnCours(_mesCompEtat);
}

// ---------------- Flèche « Précédent » du navigateur (brique B.24, docs/BRIQUES_COMMUNES.md) ----------------
// Chaque écran est une entrée de l'historique ; le travail ne recule jamais, seul le nom de l'écran est remis. js/app.js est chargé APRÈS ce fichier :
// le module s'inscrit au premier dessin de la page, pas au chargement.

function _mesCompSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function' || !_mesCompEtat) { return; }
  historiqueInterneSynchroniser('mes-competences', { cle: _mesCompSessionHistorique + ':' + _mesCompEtat.ecran, ecran: _mesCompEtat.ecran, session: _mesCompSessionHistorique });
}
function _mesCompRestaurerHistorique(instantane) {
  if (!_mesCompEtat || instantane.session !== _mesCompSessionHistorique) { return 'sauter'; }
  _mesCompEtat.ecran = MESCOMP_ECRANS.indexOf(instantane.ecran) >= 0 ? instantane.ecran : 'documents';
  _mesCompDetourPresentation = false;
}
function _mesCompInscrireHistorique() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher('mes-competences', _mesCompRestaurerHistorique); }
}

// ---------------- Page de travail ----------------

function mesCompRendrePage() {
  _mesCompInscrireHistorique();
  var etat = mesCompOuvrir();
  var i = _mesCompIndexEcran(etat);
  var def = _mesCompPages[etat.ecran] || null;
  var titre = MESCOMP_TITRES[etat.ecran] || '';
  var scrollPrecedent = window.scrollY || 0;

  var noteHtml = (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue() && !_mesCompReprisePendante)
    ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
      '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
      '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
    : '';
  var boutonRevoir = '<div><button type="button" id="btnMesCompRevoirPresentation" class="btn-revoir-module"' +
    (_mesCompReprisePendante ? ' disabled' : '') + '>' +
    '<i class="bi bi-compass"></i> Revoir la présentation</button></div>' + noteHtml;
  var encart = _mesCompReprisePendante
    ? htmlEncartRepriseModule({
        texte: 'Vous avez un travail en cours dans ce module.',
        idContinuer: 'btnMesCompRepriseContinuer', idRecommencer: 'btnMesCompRepriseRecommencer', pulse: true
      })
    : '';

  var corps = def ? def.rendre(etat) : '<div class="cv-section"><p class="mb-0">Cette page est en cours de construction.</p></div>';
  var peutContinuer = def && typeof def.peutContinuer === 'function' ? !!def.peutContinuer(etat) : !!def;
  var raison = (!peutContinuer && def && typeof def.raisonBlocage === 'function') ? def.raisonBlocage(etat) : '';
  var dernier = i >= MESCOMP_ECRANS.length - 1;

  app.innerHTML =
    '<div class="page-catalogue-contenu un-cv-plusieurs-metiers-parcours mes-competences-parcours">' +
    barreEtapesModule(MESCOMP_NAV_ETAPES, i) +
    htmlBandeRepriseModule(boutonRevoir, encart) +
    '<div class="text-center"><h1><i class="bi bi-compass"></i> ' + titre + '</h1></div>' +
    '<div id="contenuPageMesComp">' + corps + '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', dernier ? null : 'mes-competences-suite', (def && (typeof def.libelleContinuer === 'function' ? def.libelleContinuer(etat) : def.libelleContinuer)) || null, {
      onclickPrecedent: 'mesCompBarreRetour()',
      onclickSuivant: 'mesCompBarreContinuer()',
      suivantDesactive: !peutContinuer,
      suivantDesactiveMessage: raison || 'Complétez cette page pour continuer.',
      // Dernier écran : le bouton vert de fin prend la place de « Continuer ».
      terminerParcours: dernier && peutContinuer,
      onclickTerminer: 'mesCompTerminer()'
    }) +
    '</div>';

  _mesCompSynchroniserHistorique();

  var arrivee = (typeof consommerArriveeDepuisPresentation === 'function') && consommerArriveeDepuisPresentation();
  var vueEl = document.querySelector('[data-ucpm-vue]');
  var cleEcran = etat.ecran + ':' + (vueEl ? vueEl.getAttribute('data-ucpm-vue') : '');
  var nouvelEcran = cleEcran !== _mesCompEcranRendu;
  _mesCompEcranRendu = cleEcran;
  window.scrollTo(0, (arrivee || nouvelEcran) ? 0 : scrollPrecedent);
  if (typeof appliquerGelModule === 'function') { appliquerGelModule(_mesCompReprisePendante); }

  var btnRevoir = document.getElementById('btnMesCompRevoirPresentation');
  if (btnRevoir) { btnRevoir.addEventListener('click', mesCompRetourVersPresentation); }
  var btnContinuer = document.getElementById('btnMesCompRepriseContinuer');
  if (btnContinuer) { btnContinuer.addEventListener('click', mesCompRepriseContinuer); }
  var btnRecommencer = document.getElementById('btnMesCompRepriseRecommencer');
  if (btnRecommencer) {
    btnRecommencer.addEventListener('click', function () {
      if (typeof confirmerAction !== 'function') { return; }
      confirmerAction(
        'Recommencer « Découvrir mes compétences » ?',
        'Votre travail dans ce module sera effacé : vos documents déposés, les lignes relevées et vos choix. Vos autres modules, Mes Repères et Mon Carnet ne sont pas touchés.',
        'Recommencer ce module', 'btn-danger',
        function () { mesCompReinitialiser(); mesCompOuvrir(); if (typeof naviguerVers === 'function') { naviguerVers('mes-competences'); } }
      );
    });
  }
  if (typeof armerFinPulseEncartReprise === 'function') { armerFinPulseEncartReprise(); }
  if (def && typeof def.cabler === 'function') { def.cabler(etat); }
  if (typeof trackEvenement === 'function') { trackEvenement('mes_competences_ecran', { ecran: etat.ecran }); }
}

// ---------------- Page de présentation ----------------

function pageIntroMesCompetences() {
  var enCours = mesCompAUnTravailEnCours(_mesCompEtat);
  var config = {
    carteRetour: 'boiteaoutils',
    detour: _mesCompDetourPresentation,
    detourLogo: 'bi-compass',
    detourBoutonId: 'btnMesCompRevenirModuleHaut',
    detourCtaId: 'btnMesCompRevenirModuleBas',
    onRevenir: mesCompRevenirDeLaPresentation,
    onRevenirExpr: 'mesCompRevenirDeLaPresentation()',
    titre: '<i class="bi bi-compass"></i> Découvrir mes compétences',
    sousTitre: 'Vous avez déjà des compétences. Cet outil les repère dans vos documents, une par une, avec la phrase qui le prouve, et vous aide à les dire.',
    ctaId: 'btnMesCompCommencer',
    ctaLabel: 'Commencer &#8594;',
    etapes: MESCOMP_NAV_ETAPES,
    onCta: function () {
      // Un travail déjà engagé est repris (l'effacement volontaire vit sur l'encart de reprise), jamais remis à zéro ici.
      if (!enCours) { mesCompReinitialiser(); mesCompOuvrir(); }
      else { _mesCompReprisePendante = true; }
      if (typeof naviguerVers === 'function') { naviguerVers('mes-competences'); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Rien n’est ajouté à ce que vos documents disent.</strong> Si une ligne n’a pas de preuve, elle n’existe pas. C’est vous qui décidez de ce que vous gardez.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-0">À voir ce que vos documents montrent déjà : ce que vous savez faire, ce que vous connaissez, votre façon de travailler. Pour chaque ligne, vous voyez la phrase de vos documents qui la prouve, comment la dire sur un CV et comment la dire à l’oral. Vous repartez avec un document « Mes compétences », qui vous aide à vous présenter et à vous défendre en entretien.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous déposez un ou plusieurs documents : CV, lettre de motivation, lettre de recommandation. Un seul suffit, plus il y en a, plus les lignes sont sûres.</li>' +
        '<li>Vous masquez ce qui est personnel (nom, adresse, téléphone) avant tout envoi à l’assistant en ligne.</li>' +
        '<li>Un assistant en ligne lit vos documents : vous copiez un message, puis vous collez sa réponse dans cette page.</li>' +
        '<li>Vous relisez chaque ligne et vous gardez ce qui vous ressemble. Une ligne peut aussi vous poser une question pour être complétée.</li>' +
        '<li>Vous téléchargez votre document « Mes compétences ».</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que cet outil ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Il ne vous note pas, ne vous compare pas et ne pose aucun diagnostic sur vous.</li>' +
        '<li>Il ne vous propose pas de métier et n’écrit pas votre CV.</li>' +
        '<li>Il n’invente rien : aucune compétence sans une phrase de vos documents qui la montre.</li>' +
        '<li>Il ne remplace pas « À partir de mon récit », qui part de ce que vous racontez : ici, on part de documents que vous avez déjà.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Relire les phrases « pour l’oral » avant un entretien.</li>' +
        '<li>Reprendre les lignes « pour mon CV » dans votre CV.</li>' +
        '</ul>') +
      _introBlocEncart('&#128190;', 'Ce que vous gardez est enregistré avec votre disquette. Vous pourrez le reprendre ou recommencer.')
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('mes_competences_intro_affichee'); }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MESCOMP_ECRANS: MESCOMP_ECRANS, MESCOMP_TITRES: MESCOMP_TITRES };
}
