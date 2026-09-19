// Stub DOM minimal permettant de charger js/app.js sous Node (node:test).
// app.js est un script navigateur classique (pas un module) : il execute
// une poignee d'instructions au chargement (var app = document.getElementById(...),
// deux document.addEventListener(...) qui ne font qu'enregistrer un callback
// sans jamais l'invoquer). Ce stub couvre exactement ces appels -- rien de
// plus -- pour permettre le require() sans faire tourner un vrai DOM (jsdom
// serait une phase 2 separee, plus lourde, pour tester l'UI elle-meme).
function installerStubDom() {
  if (typeof global.document === 'undefined') {
    global.document = {
      getElementById: function () { return null; },
      addEventListener: function () {}
    };
  }
  // app.js expose une dizaine de fonctions sur `window` a la toute fin
  // (ex. window.dossier = dossier -- lignes ~16744+) : simples affectations,
  // jamais des appels, mais `window` lui-meme doit exister sous Node.
  // app.js enregistre aussi un listener 'popstate' sur `window` au chargement
  // (derriere un garde-fou `typeof window !== 'undefined'` deja present dans
  // le code source) -- meme principe que document.addEventListener ci-dessus.
  if (typeof global.window === 'undefined') {
    global.window = global;
    global.window.addEventListener = function () {};
  }
  // BASE_CONNAISSANCES_ERIP vient de data/baseConnaissancesERIP.js, charge
  // AVANT app.js dans index.html (global implicite navigateur). app.js lui
  // affecte 2 champs au chargement (lignes ~498 et ~16758) -- stub vide
  // suffisant, ces champs ne sont pas lus par les fonctions pures testees ici.
  if (typeof global.BASE_CONNAISSANCES_ERIP === 'undefined') {
    global.BASE_CONNAISSANCES_ERIP = {};
  }
  // rienEteChoisi vient de data/metiers.js, charge AVANT app.js dans
  // index.html -- app.js l'exporte sur window a la fin (window.rienEteChoisi
  // = rienEteChoisi) mais ne l'appelle jamais au chargement, seulement dans
  // des fonctions. Stub suffisant pour les fonctions pures testees ici.
  if (typeof global.rienEteChoisi === 'undefined') {
    global.rienEteChoisi = function () { return true; };
  }
  // categorieCompetence/DESCRIPTIFS_COMPETENCES vivent dans
  // data/competences.js (chantier 2026-09-16), charge AVANT app.js dans
  // index.html -- app.js lit categorieCompetence AU CHARGEMENT (ligne
  // ~757, BASE_CONNAISSANCES_ERIP.competences = categorieCompetence).
  // Les vraies donnees (pas un stub vide) : plusieurs fonctions pures
  // testees ailleurs (ex. decouverteStrategie.js) les lisent reellement.
  if (typeof global.categorieCompetence === 'undefined') {
    var _competences = require('../data/competences.js');
    global.categorieCompetence = _competences.categorieCompetence;
    global.DESCRIPTIFS_COMPETENCES = _competences.DESCRIPTIFS_COMPETENCES;
  }
  // pageReperes/pageCarnet/pageLexique/pageCoherenceTransversale vivent
  // dans modules/reperes|carnet|lexique|coherence-transversale/
  // index.js|ui.js (chacun son propre fichier <script>, charge AVANT
  // app.js dans index.html) -- app.js les reference directement dans
  // l'objet litteral `routes` (evalue au chargement, jamais derriere un
  // appel de fonction). Sous Node, require() ne fait jamais fuiter les
  // declarations de haut niveau d'un module vers le scope global
  // (contrairement a un <script> navigateur classique) : ces identifiants
  // resteraient undefined sans stub, meme apres avoir require() les
  // fichiers reels. Jamais appeles par les fonctions pures testees ici --
  // meme principe que rienEteChoisi ci-dessus, un stub vide suffit.
  // TACHE (retour Denis, 2026-08-31) : pageCoLettre/pagePrepaEntretien/
  // pageDecouverteIntro vivent dans data/metiers.js, memes contraintes que
  // ci-dessus (referencees dans l'objet litteral `routes` de app.js).
  ['pageReperes', 'pageCarnet', 'pageLexique', 'pageCoherenceTransversale',
    'pageCoLettre', 'pagePrepaEntretien', 'pageDecouverteIntro', 'pageDecouverte',
    'pageIntroAts', 'pageIntroRegardRecruteur', 'pageIntroSeTenirInforme',
    'pageIntroAideDecision', 'pageComparerPistes', 'pageComprendreLeCadre',
    'pageIntroComprendreLesChiffres', 'pageComprendreLesChiffres',
    'pagePreparerLettreEntretien', 'pageMettreAJourCv', 'pageCreerCv',
    'pageReformulerCv'].forEach(function (nom) {
    if (typeof global[nom] === 'undefined') {
      global[nom] = function () { return ''; };
    }
  });
}

module.exports = { installerStubDom: installerStubDom };
