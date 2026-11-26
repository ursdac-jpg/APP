/* ============================================================
   modules/bien-utiliser-ia/comprendreLogique.js
   Chemin 1 « Comprendre comment demander » : LOGIQUE PURE (aucun accès au navigateur). Testée : tests/bienUtiliserIaComprendre.test.js.
   Les six éléments viennent de data/buiaDemande.js (liste unique), les textes de data/buiaComprendre.js.
   Tous les noms commencent par buia / BUIA / _buia (scripts classiques).
   ============================================================ */

var _buiaCD = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('../../data/buiaDemande.js'), require('../../data/buiaComprendre.js'))
  : { BUIA_ELEMENTS: BUIA_ELEMENTS, BUIA_C1_SUJETS: BUIA_C1_SUJETS, BUIA_C1_ORDRE_ASSEMBLEE: BUIA_C1_ORDRE_ASSEMBLEE, BUIA_C1_E6: BUIA_C1_E6, BUIA_C1_ETAPES: BUIA_C1_ETAPES, BUIA_C1_FICHE: BUIA_C1_FICHE };

var BUIA_JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
var BUIA_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// « 3 décembre », « jeudi 3 décembre », « 1er janvier », « 23 novembre 2026 ». Une date invalide donne une chaîne vide, jamais « NaN ».
function buiaDateFrancaise(date, options) {
  var o = options || {};
  if (!(date instanceof Date) || isNaN(date.getTime())) { return ''; }
  var j = date.getDate();
  return (o.jourSemaine ? BUIA_JOURS[date.getDay()] + ' ' : '') + (j === 1 ? '1er' : String(j)) + ' ' + BUIA_MOIS[date.getMonth()] + (o.annee ? ' ' + date.getFullYear() : '');
}
// Ajoute des jours calendaires (le changement d'heure ne décale jamais la date).
function buiaAjouterJours(date, jours) { return new Date(date.getFullYear(), date.getMonth(), date.getDate() + jours); }

function buiaC1Etapes() { return _buiaCD.BUIA_C1_ETAPES; }
function buiaC1NombreEtapes() { return _buiaCD.BUIA_C1_ETAPES.length; }
// Étape valide (0 à 8) : une valeur inconnue ramène au début, jamais un écran vide.
function buiaC1BorneEtape(n) { var max = _buiaCD.BUIA_C1_ETAPES.length - 1; return (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(max, Math.floor(n))) : 0; }

function buiaC1Sujets() { return _buiaCD.BUIA_C1_SUJETS.map(function (s) { return { id: s.id, nom: s.nom }; }); }
function buiaC1Sujet(id) { return _buiaCD.BUIA_C1_SUJETS.filter(function (s) { return s.id === id; })[0] || _buiaCD.BUIA_C1_SUJETS[0]; }

// Le sixième élément, calculé à partir de la date du jour fournie (par défaut : maintenant).
function buiaC1PhraseDate(sujetId, aujourdhui) {
  var s = buiaC1Sujet(sujetId), d = s.date, a = (aujourdhui instanceof Date && !isNaN(aujourdhui.getTime())) ? aujourdhui : new Date();
  return d.avant + buiaDateFrancaise(a, { annee: true }) + d.milieu + buiaDateFrancaise(buiaAjouterJours(a, d.jours), { jourSemaine: d.jourSemaine }) + '.';
}

// Les six éléments d'un sujet, dans l'ordre 1 à 6 : { n, id, nom, raison, phrase (complète), ligne (première ligne, pour la pile) }.
function buiaC1Elements(sujetId, aujourdhui) {
  var s = buiaC1Sujet(sujetId);
  return _buiaCD.BUIA_ELEMENTS.map(function (e, i) {
    var phrase = i < 5 ? s.e[i] : buiaC1PhraseDate(s.id, aujourdhui);
    return { n: e.n, id: e.id, nom: e.nom, raison: e.raison, aide: e.aide || '', phrase: phrase, ligne: phrase.split('\n')[0] };
  });
}
// La demande assemblée, dans l'ordre décidé : [{ n, texte }].
function buiaC1Assemblee(sujetId, aujourdhui) {
  var el = buiaC1Elements(sujetId, aujourdhui);
  return _buiaCD.BUIA_C1_ORDRE_ASSEMBLEE.map(function (i) { return { n: el[i].n, texte: el[i].phrase }; });
}
// Une demande courte, et le même sujet en demande complète (but, situation, attente).
function buiaC1AvantApres(sujetId, aujourdhui) {
  var s = buiaC1Sujet(sujetId), el = buiaC1Elements(sujetId, aujourdhui);
  return { avant: s.avant, apres: el[0].phrase + ' ' + el[1].phrase + ' ' + el[3].phrase };
}

function buiaC1Risques() { return _buiaCD.BUIA_C1_E6.risques.map(function (r) { return { id: r.id, nom: r.nom }; }); }
function buiaC1Risque(id) { return _buiaCD.BUIA_C1_E6.risques.filter(function (r) { return r.id === id; })[0] || _buiaCD.BUIA_C1_E6.risques[0]; }

// La fiche « Ce qu'il faut retenir » : « 1. Le but : ce que l'assistant doit faire », etc.
function buiaC1LignesFiche() {
  return _buiaCD.BUIA_ELEMENTS.map(function (e, i) { return { n: e.n, texte: e.n + '. ' + e.nom + ' : ' + _buiaCD.BUIA_C1_FICHE.rappels[i] }; });
}

// Écran 8 : le texte de l'exemple, lu dans le fichier prompts/bien-utiliser-exemple-questions-d-abord.md (bloc `## exemple`).
// Rend une chaîne vide si le bloc manque, est vide, ou contient une accolade ou un tiret long : l'écran affiche alors un message calme, jamais un texte abîmé.
function buiaC1TexteExemple(texteFichier) {
  var lire = (typeof buiaLireBlocs === 'function') ? buiaLireBlocs : require('./blocs.js').buiaLireBlocs;
  var t = lire(texteFichier).blocs.exemple;
  if (typeof t !== 'string' || !t.trim() || /[{}–—]/.test(t)) { return ''; }
  return t;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buiaC1TexteExemple: buiaC1TexteExemple, buiaDateFrancaise: buiaDateFrancaise, buiaAjouterJours: buiaAjouterJours, buiaC1Etapes: buiaC1Etapes, buiaC1NombreEtapes: buiaC1NombreEtapes, buiaC1BorneEtape: buiaC1BorneEtape,
    buiaC1Sujets: buiaC1Sujets, buiaC1Sujet: buiaC1Sujet, buiaC1PhraseDate: buiaC1PhraseDate, buiaC1Elements: buiaC1Elements, buiaC1Assemblee: buiaC1Assemblee,
    buiaC1AvantApres: buiaC1AvantApres, buiaC1Risques: buiaC1Risques, buiaC1Risque: buiaC1Risque, buiaC1LignesFiche: buiaC1LignesFiche };
}
