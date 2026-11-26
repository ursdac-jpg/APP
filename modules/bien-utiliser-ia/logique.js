/* ============================================================
   modules/bien-utiliser-ia/logique.js
   Module « Bien utiliser l'IA » : LOGIQUE PURE (aucun accès au navigateur ni au dossier de la personne).
   Commit 1 du plan : écran d'entrée seulement (les chemins viennent aux commits suivants). Testée : tests/bienUtiliserIaLogique.test.js.
   Chargé comme script classique : tous les noms commencent par buia / BUIA / _buia.
   ============================================================ */

var _buiaD = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? require('../../data/buiaEntree.js')
  : { BUIA_CHEMINS: BUIA_CHEMINS, BUIA_REASSURANCE: BUIA_REASSURANCE };

function _buiaEsc(t) { return String(t === undefined || t === null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// Les quatre chemins, dans l'ordre décidé : Comprendre, Comment il fonctionne, Mes modèles, Écrire.
function buiaChemins() { return _buiaD.BUIA_CHEMINS.slice(); }
function buiaChemin(id) { return _buiaD.BUIA_CHEMINS.filter(function (c) { return c.id === id; })[0] || null; }

function buiaReassurance() { return _buiaD.BUIA_REASSURANCE.slice(); }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { _buiaEsc: _buiaEsc, buiaChemins: buiaChemins, buiaChemin: buiaChemin,
    buiaReassurance: buiaReassurance };
}
