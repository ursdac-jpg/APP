/* ============================================================
   modules/bien-utiliser-ia/modelesLogique.js
   Chemin 2 « J'ai un papier ou une situation » : REPÉRAGE DU MODÈLE par les mots. Logique pure, testée : tests/bienUtiliserIaPapier.test.js.
   L'application COMPARE DES MOTS : elle ne comprend pas le texte. Elle propose un à trois modèles avec les mots repérés ; la personne choisit toujours (consigne 589).
   Algorithme repris de la maquette validée le 23/11/2026. Tous les noms commencent par buia / BUIA / _buia (scripts classiques).
   ============================================================ */

var _buiaM = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? require('../../data/buiaModeles.js')
  : { BUIA_FAMILLES: BUIA_FAMILLES, BUIA_MODELES: BUIA_MODELES, BUIA_COURRIERS_FICTIFS: BUIA_COURRIERS_FICTIFS };

// Sans accent, en minuscules : « Trop-perçu » devient « trop-percu ».
function _buiaNorm(s) { return String(s === undefined || s === null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

function buiaFamilles() { return _buiaM.BUIA_FAMILLES.slice(); }
function buiaModeles(options) {
  var seul = options && options.redigesSeulement;
  return _buiaM.BUIA_MODELES.filter(function (m) { return !seul || m.redige; });
}
function buiaModele(id) { return _buiaM.BUIA_MODELES.filter(function (m) { return m.id === id; })[0] || null; }
function buiaModelesParFamille(famille, options) { return buiaModeles(options).filter(function (m) { return m.famille === famille; }); }

// Trouve les mots d'un modèle dans un texte.
//  - papier (texte collé) : le mot doit apparaître entier (avec un pluriel s ou x), « trop-percu » accepte aussi « trop percu » ;
//  - mots (phrase écrite par la personne) : comparaison par début de mot, pour suivre la frappe (« conv » trouve « convocation »).
function _buiaMotsTrouves(modele, t, estPapier) {
  var trouves = [];
  if (estPapier) {
    modele.mots.forEach(function (k) {
      if (k.length >= 2 && new RegExp('(^|[^a-z])' + k.replace(/-/g, '[- ]?') + '(s|x)?([^a-z]|$)').test(t)) { trouves.push(k); }
    });
  } else {
    var jetons = t.split(/[^a-z0-9-]+/).filter(function (x) { return x.length >= 2; });
    jetons.forEach(function (j) {
      modele.mots.forEach(function (k) {
        // Un mot de deux lettres (« cv ») doit être écrit en entier ; au-delà, le début d'un mot suffit (suivre la frappe).
        var pareil = (j.length === 2 ? k === j : k.indexOf(j) === 0) || (j.length >= 4 && j.indexOf(k) === 0 && k.length >= 4);
        if (pareil && trouves.indexOf(k) === -1) { trouves.push(k); }
      });
    });
  }
  return trouves;
}

// Retour : au plus trois propositions { id, nom, famille, score, mots, redige }, la plus probable en premier. Liste vide si aucun mot ne ressort.
// options.redigesSeulement : ne proposer que les modèles dont le texte existe.
function buiaReperer(texte, estPapier, options) {
  var t = _buiaNorm(texte), res = [], seul = options && options.redigesSeulement;
  if (!t.trim()) { return []; }
  _buiaM.BUIA_MODELES.forEach(function (m) {
    if (seul && !m.redige) { return; }
    var trouves = _buiaMotsTrouves(m, t, !!estPapier);
    var score = trouves.length;
    // Une lettre administrative commence presque toujours ainsi : un indice en plus pour « Comprendre un courrier reçu ».
    if (estPapier && m.id === 4 && /(madame, monsieur|objet ?:|reference du dossier|votre dossier)/.test(t)) { score += 2; }
    if (score > 0) { res.push({ id: m.id, nom: m.nom, famille: m.famille, score: score, mots: trouves, redige: !!m.redige }); }
  });
  res.sort(function (a, b) { return b.score - a.score || a.id - b.id; });
  // Pour un papier, les suivants ne sont gardés que s’ils ressortent nettement (au moins deux mots ou indices).
  if (estPapier && res.length > 1) { res = res.filter(function (r, i) { return i === 0 || r.score >= 2; }); }
  return res.slice(0, 3);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { _buiaNorm: _buiaNorm, buiaFamilles: buiaFamilles, buiaModeles: buiaModeles, buiaModele: buiaModele, buiaModelesParFamille: buiaModelesParFamille, buiaReperer: buiaReperer };
}
