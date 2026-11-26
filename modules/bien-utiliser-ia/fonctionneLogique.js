/* ============================================================
   modules/bien-utiliser-ia/fonctionneLogique.js
   Chemin 4 « Comment fonctionne un assistant » : LOGIQUE PURE (aucun accès au navigateur). Testée : tests/bienUtiliserIaFonctionne.test.js.
   Textes : data/buiaFonctionne.js. Tous les noms commencent par buia / BUIA / _buia (scripts classiques).
   ============================================================ */

var _buiaFD = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? require('../../data/buiaFonctionne.js')
  : { BUIA_C4_ETAPES: BUIA_C4_ETAPES, BUIA_C4_E2: BUIA_C4_E2, BUIA_C4_E5: BUIA_C4_E5 };

function buiaC4Etapes() { return _buiaFD.BUIA_C4_ETAPES; }
function buiaC4NombreEtapes() { return _buiaFD.BUIA_C4_ETAPES.length; }
// Étape valide (0 à 7) : une valeur inconnue ramène au début, jamais un écran vide.
function buiaC4BorneEtape(n) { var max = _buiaFD.BUIA_C4_ETAPES.length - 1; return (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(max, Math.floor(n))) : 0; }

// Les mots vraisemblables de l'écran 2, avec ou sans le contexte ajouté par la personne. Un total de 100 % est vérifié par les tests.
function buiaC4MotsVraisemblables(avecContexte) { return (avecContexte ? _buiaFD.BUIA_C4_E2.avec : _buiaFD.BUIA_C4_E2.sans).map(function (m) { return { mot: m.mot, pct: m.pct }; }); }
function buiaC4LegendeMots(avecContexte) { return avecContexte ? _buiaFD.BUIA_C4_E2.legendeAvec : _buiaFD.BUIA_C4_E2.legendeSans; }

// Les assistants de l'écran 5, dans l'ordre. `aSourcer` ne s'affiche jamais : il sert à la revue avant l'ouverture.
function buiaC4Assistants() { return _buiaFD.BUIA_C4_E5.assistants.map(function (a) { return { id: a.id, nom: a.nom, pour: a.pour, savoir: a.savoir, aSourcer: !!a.aSourcer }; }); }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buiaC4Etapes: buiaC4Etapes, buiaC4NombreEtapes: buiaC4NombreEtapes, buiaC4BorneEtape: buiaC4BorneEtape,
    buiaC4MotsVraisemblables: buiaC4MotsVraisemblables, buiaC4LegendeMots: buiaC4LegendeMots, buiaC4Assistants: buiaC4Assistants };
}
