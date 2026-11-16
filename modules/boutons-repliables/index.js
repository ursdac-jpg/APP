/* ============================================================
   Boutons repliables : interface (pas de test Node : test navigateur obligatoire). Logique pure : logique.js.
   Trois flèches (index.html) rangent les boutons fixes : celle de gauche (roue, ampoule, disquette, nouveautés), celle d'Introduction, celle de droite (Carnet, Journal, Pistes de côté).
   - Le repli est toujours un geste de la personne ; il dure toute la session (sessionStorage), jamais enregistré plus longtemps.
   - Les boutons glissent derrière la flèche (feuille de style : classes repli-gauche, repli-intro, repli-droite sur <body>) ; rien d'autre ne bouge.
   - Quand un bouton rangé clignote, sa flèche clignote pendant la même durée (relais des animations).
   - La flèche de gauche porte aussi le chiffre des Nouveautés tant que les boutons sont rangés.
   ============================================================ */

var _brEtat = brEtatInitial();
var _brCle = 'aps_repli_boutons';
var _brMinuteurRelais = null;

function _brLireSession() {
  var texte = null;
  try { texte = sessionStorage.getItem(_brCle); } catch (e) { texte = null; }
  return brLireEtat(texte);
}
function _brEcrireSession() {
  try { sessionStorage.setItem(_brCle, brEcrireEtat(_brEtat)); } catch (e) { /* pas grave : le repli reste valable jusqu'à l'actualisation */ }
}

// Un bouton du groupe est-il en train de clignoter ? On interroge les animations réellement en cours (fiable même si un événement est manqué).
function _brGroupeClignote(nom) {
  return BR_GROUPES[nom].boutons.some(function (id) {
    var b = document.getElementById(id);
    return !!b && typeof b.getAnimations === 'function' && b.getAnimations().some(function (a) { return brEstAnimationPulse(a.animationName) && a.playState === 'running'; });
  });
}

// Met à jour le clignotement des flèches (replié + un bouton du groupe clignote = la flèche clignote). Tant qu'une flèche clignote, on revérifie chaque seconde.
function _brMajRelais() {
  var encore = false;
  BR_NOMS.forEach(function (nom) {
    var f = document.getElementById(BR_GROUPES[nom].fleche);
    var actif = !!_brEtat[nom] && _brGroupeClignote(nom);
    if (f) { f.classList.toggle('fleche-relais', actif); }
    if (actif) { encore = true; }
  });
  clearTimeout(_brMinuteurRelais); _brMinuteurRelais = null;
  if (encore) { _brMinuteurRelais = setTimeout(_brMajRelais, 1000); }
}

// Pose tout ce qui dépend de l'état : classes sur <body>, textes des flèches, clignotement relayé, panneaux fermés.
function brAppliquer() {
  BR_NOMS.forEach(function (nom) {
    var g = BR_GROUPES[nom], replie = !!_brEtat[nom];
    document.body.classList.toggle(g.classe, replie);
    var f = document.getElementById(g.fleche);
    if (f) {
      var libelle = brLibelleFleche(nom, replie);
      f.setAttribute('aria-label', libelle);
      f.setAttribute('title', libelle);
      f.setAttribute('aria-expanded', replie ? 'false' : 'true');
    }
    if (replie) {   // un panneau ouvert depuis un bouton rangé se ferme avec lui
      g.panneaux.forEach(function (id) { var p = document.getElementById(id); if (p) { p.hidden = true; } });
    }
  });
  _brMajRelais();
  if (typeof window._ajusterBoutonRetourModuleExterne === 'function') { window._ajusterBoutonRetourModuleExterne(); }
}

function brBasculerGroupe(nom) {
  _brEtat = brBasculer(_brEtat, nom);
  _brEcrireSession();
  brAppliquer();
}

// Visite guidée : les boutons visés doivent se voir ; on les sort le temps de la visite puis on remet le choix de la personne.
var _brAvantVisite = null;
function boutonsRepliablesPreparerVisite() {
  if (_brAvantVisite) { return; }
  _brAvantVisite = brLireEtat(brEcrireEtat(_brEtat));
  document.body.classList.add('repli-sans-transition');
  _brEtat = brEtatInitial();
  brAppliquer();
}
function boutonsRepliablesRestaurerApresVisite() {
  if (!_brAvantVisite) { return; }
  _brEtat = _brAvantVisite;
  _brAvantVisite = null;
  brAppliquer();
  setTimeout(function () { document.body.classList.remove('repli-sans-transition'); }, 50);
}

// Relais du clignotement : à chaque début, fin ou annulation d'une animation de pulse d'un bouton rangé, on met les flèches à jour.
function _brSuivreAnimation(ev) {
  var cible = ev.target;
  if (!cible || !cible.id || !brEstAnimationPulse(ev.animationName) || !brGroupeDe(cible.id)) { return; }
  setTimeout(_brMajRelais, 0);
}

// Le chiffre des Nouveautés se recopie sur la flèche de gauche (il ne s'affiche que lorsque les boutons sont rangés).
function _brRecopierPastille() {
  var source = document.getElementById('nvPastille'), copie = document.getElementById('flechePastille');
  if (!source || !copie) { return; }
  copie.textContent = source.textContent;
  copie.hidden = source.hidden || !source.textContent;
}

function brInitialiser() {
  BR_NOMS.forEach(function (nom) {
    var f = document.getElementById(BR_GROUPES[nom].fleche);
    if (f && !f.__brBranche) { f.__brBranche = true; f.addEventListener('click', function () { brBasculerGroupe(nom); }); }
  });
  ['animationstart', 'animationend', 'animationcancel'].forEach(function (nom) { document.addEventListener(nom, _brSuivreAnimation, true); });
  var pastille = document.getElementById('nvPastille');
  if (pastille && typeof MutationObserver !== 'undefined') {
    new MutationObserver(_brRecopierPastille).observe(pastille, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  }
  _brRecopierPastille();
  _brEtat = _brLireSession();
  brAppliquer();
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', brInitialiser); } else { brInitialiser(); }
}
