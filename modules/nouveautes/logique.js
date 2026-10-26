/* ============================================================
   Module « Nouveautés » : logique pure (aucun accès au DOM, testée par `npm test`).
   Chantier : docs/CHANTIER_NOUVEAUTES_2026-10-26.md ; maquette : docs/MAQUETTE_NOUVEAUTES_2026-10-26.html.
   Les nouveautés elles-mêmes sont des DONNEES (data/nouveautes.js) : on y ajoute une ligne à chaque ajout visible par les personnes.
   ============================================================ */

// Une nouveauté porte l'étiquette « Nouveau » pendant ce nombre de jours après sa date.
var NV_JOURS_NOUVEAU = 30;
var NV_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function _nvDateDepuisIso(iso) {
  var p = String(iso || '').split('-');
  if (p.length !== 3) { return null; }
  var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return isNaN(d.getTime()) ? null : d;
}
// Nombre de jours entre la date de la nouveauté (AAAA-MM-JJ) et `auj` (un Date) ; null si la date est illisible.
function nvAgeJours(iso, auj) {
  var d = _nvDateDepuisIso(iso);
  if (!d) { return null; }
  var ref = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate());
  return Math.round((ref - d) / 86400000);
}
function nvEstNouveau(n, auj) {
  var a = nvAgeJours(n && n.date, auj);
  return a !== null && a >= 0 && a <= NV_JOURS_NOUVEAU;
}
function nvCompterNouveaux(liste, auj) { return (liste || []).filter(function (n) { return nvEstNouveau(n, auj); }).length; }
// Dates affichées en français (jamais « 2026-10-26 » à l'écran) : « 26 octobre 2026 », « 1er novembre 2026 ».
function nvDateFr(iso) {
  var d = _nvDateDepuisIso(iso);
  if (!d) { return ''; }
  return (d.getDate() === 1 ? '1er' : String(d.getDate())) + ' ' + NV_MOIS[d.getMonth()] + ' ' + d.getFullYear();
}
function nvMoisFr(iso) {
  var d = _nvDateDepuisIso(iso);
  return d ? NV_MOIS[d.getMonth()] + ' ' + d.getFullYear() : '';
}
// Les nouveautés visibles (une date lisible, pas dans le futur), du plus récent au plus ancien, rangées par mois : [{ cle: '2026-10', mois: 'octobre 2026', items: [...] }].
function nvGrouperParMois(liste, auj) {
  var valides = (liste || []).filter(function (n) { var a = nvAgeJours(n && n.date, auj); return a !== null && a >= 0; });
  valides = valides.map(function (n, i) { return { n: n, i: i }; }).sort(function (x, y) {
    return x.n.date < y.n.date ? 1 : (x.n.date > y.n.date ? -1 : x.i - y.i);   // à date égale, l'ordre du fichier est gardé
  }).map(function (x) { return x.n; });
  var groupes = [];
  valides.forEach(function (n) {
    var cle = n.date.slice(0, 7), g = groupes[groupes.length - 1];
    if (!g || g.cle !== cle) { g = { cle: cle, mois: nvMoisFr(n.date), items: [] }; groupes.push(g); }
    g.items.push(n);
  });
  return groupes;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NV_JOURS_NOUVEAU: NV_JOURS_NOUVEAU, nvAgeJours: nvAgeJours, nvEstNouveau: nvEstNouveau, nvCompterNouveaux: nvCompterNouveaux, nvDateFr: nvDateFr, nvMoisFr: nvMoisFr, nvGrouperParMois: nvGrouperParMois };
}
