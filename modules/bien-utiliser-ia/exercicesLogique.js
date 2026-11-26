/* ============================================================
   modules/bien-utiliser-ia/exercicesLogique.js
   Chemin 1 : LOGIQUE PURE des trois exercices « Réparer une demande », « Voir la différence » et « Repérer ce qui se vérifie » (aucun accès au navigateur).
   Testée : tests/bienUtiliserIaExercices.test.js. Textes : data/buiaExercices.js. Éléments (nom, numéro) : data/buiaDemande.js (liste unique).
   Aucun score, aucune note : le retour porte sur la demande ou sur la réponse, jamais sur la personne. Rien n'est enregistré.
   Tous les noms commencent par buia / BUIA / _buia (scripts classiques).
   ============================================================ */

var _buiaXD = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('../../data/buiaExercices.js'), require('../../data/buiaDemande.js'))
  : { BUIA_EX1: BUIA_EX1, BUIA_EX2: BUIA_EX2, BUIA_EX3: BUIA_EX3, BUIA_ELEMENTS: BUIA_ELEMENTS };

// État vierge des trois exercices (vit en mémoire le temps de la session, jamais enregistré).
function buiaExVierge() {
  return { ex1: { cas: 0, coches: {}, corrige: false, repare: false }, ex2: { cas: 0, sel: {}, corrige: false }, ex3: { cas: 0, vue: 'vague' } };
}

function _buiaExBorne(n, total) { return (typeof n === 'number' && isFinite(n) && total > 0) ? ((Math.floor(n) % total) + total) % total : 0; }

// ---------- Exercice 1 ----------
function buiaEx1NombreCas() { return _buiaXD.BUIA_EX1.cas.length; }
function buiaEx1Cas(i) { return _buiaXD.BUIA_EX1.cas[_buiaExBorne(i, _buiaXD.BUIA_EX1.cas.length)]; }
function buiaEx1CasSuivant(i) { return _buiaExBorne((typeof i === 'number' ? i : 0) + 1, _buiaXD.BUIA_EX1.cas.length); }

// Les six lignes de l'exercice, dans l'ordre des six éléments. `etat` : « neutre » avant la correction ; ensuite « vu » (utile et coché),
// « ajouter » (utile, non coché) ou « inutile » (pas nécessaire ici, coché ou non : aucun reproche).
function buiaEx1Lignes(casIdx, coches, corrige) {
  var cas = buiaEx1Cas(casIdx), qs = _buiaXD.BUIA_EX1.questions, c = coches || {};
  return _buiaXD.BUIA_ELEMENTS.map(function (e) {
    var d = cas.elements[e.id], cochee = !!c[e.id], etat = 'neutre';
    if (corrige) { etat = d.utile ? (cochee ? 'vu' : 'ajouter') : 'inutile'; }
    return { id: e.id, n: e.n, nom: e.nom, question: qs[e.id] || '', cochee: cochee, utile: d.utile, etat: etat, raison: corrige ? d.raison : '' };
  });
}

// La demande réparée : un bloc par élément utile, avec sa phrase d'illustration.
function buiaEx1Reparee(casIdx) {
  var cas = buiaEx1Cas(casIdx);
  return _buiaXD.BUIA_ELEMENTS.filter(function (e) { return cas.elements[e.id].utile; }).map(function (e) { return { n: e.n, nom: e.nom, phrase: cas.elements[e.id].phrase }; });
}

// ---------- Exercice 2 ----------
function buiaEx2NombreCas() { return _buiaXD.BUIA_EX2.cas.length; }
function buiaEx2Cas(i) { return _buiaXD.BUIA_EX2.cas[_buiaExBorne(i, _buiaXD.BUIA_EX2.cas.length)]; }
function buiaEx2CasSuivant(i) { return _buiaExBorne((typeof i === 'number' ? i : 0) + 1, _buiaXD.BUIA_EX2.cas.length); }

// Les phrases de la réponse. `etat` : « neutre » avant la correction ; ensuite « verif » (contient un fait à vérifier) ou « rien ».
// `choisie` n'entre jamais dans un calcul de réussite : elle sert seulement à garder l'affichage de ce que la personne a touché.
function buiaEx2Phrases(casIdx, sel, corrige) {
  var cas = buiaEx2Cas(casIdx), s = sel || {};
  return cas.phrases.map(function (p, i) {
    return { i: i, texte: p.texte, choisie: !!s[i], etat: corrige ? (p.verif ? 'verif' : 'rien') : 'neutre', tag: corrige ? p.tag : '' };
  });
}

// ---------- Exercice 3 : avant et après ----------
function buiaEx3NombreCas() { return _buiaXD.BUIA_EX3.cas.length; }
function buiaEx3Cas(i) { return _buiaXD.BUIA_EX3.cas[_buiaExBorne(i, _buiaXD.BUIA_EX3.cas.length)]; }
function buiaEx3CasSuivant(i) { return _buiaExBorne((typeof i === 'number' ? i : 0) + 1, _buiaXD.BUIA_EX3.cas.length); }
// Une valeur inconnue ramène à la demande rapide, jamais un écran vide.
function buiaEx3Vue(v) { return v === 'precise' ? 'precise' : 'vague'; }
// Ce qui s'affiche : la demande en morceaux (chaque morceau d'une demande précisée porte le nom et le numéro de son élément), la réponse ligne par ligne, la note.
function buiaEx3Affichage(casIdx, vue) {
  var cas = buiaEx3Cas(casIdx), v = buiaEx3Vue(vue), d = cas[v];
  var morceaux = d.demande.map(function (m) {
    var e = null;
    if (m.id) { _buiaXD.BUIA_ELEMENTS.forEach(function (x) { if (x.id === m.id) { e = x; } }); }
    return { texte: m.texte, n: e ? e.n : 0, nom: e ? e.nom : '' };
  });
  return { vue: v, histoire: cas.histoire, demande: morceaux, reponse: d.reponse.slice(), note: d.note };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buiaExVierge: buiaExVierge, buiaEx1NombreCas: buiaEx1NombreCas, buiaEx1Cas: buiaEx1Cas, buiaEx1CasSuivant: buiaEx1CasSuivant, buiaEx1Lignes: buiaEx1Lignes, buiaEx1Reparee: buiaEx1Reparee,
    buiaEx2NombreCas: buiaEx2NombreCas, buiaEx2Cas: buiaEx2Cas, buiaEx2CasSuivant: buiaEx2CasSuivant, buiaEx2Phrases: buiaEx2Phrases,
    buiaEx3NombreCas: buiaEx3NombreCas, buiaEx3Cas: buiaEx3Cas, buiaEx3CasSuivant: buiaEx3CasSuivant, buiaEx3Vue: buiaEx3Vue, buiaEx3Affichage: buiaEx3Affichage };
}
