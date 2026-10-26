/* ============================================================
   modules/cv-core/disponibiliteCv.js
   ------------------------------------------------------------
   Lignes de disponibilite et d'horaires proposees au CV (E6, 24/10/2026,
   demande de Denis : « disponibilite immediate, horaires decales, pret a
   accepter tout type d'horaire : une force, et ca remplit les espaces
   vides »). Cote code : le prompt du CV n'est pas touche.

   Les lignes sont deduites de ce que la personne a deja indique dans son
   projet (debut possible, horaires acceptes) et PROPOSEES dans
   « Informations complementaires » : un clic les ajoute et les coche, rien
   ne s'affiche sans ce choix. Fonction pure, testee en Node
   (tests/disponibiliteCv.test.js).
   ============================================================ */

var _DISPO_CV_PHRASES = {
  'Immédiatement': 'Disponible immédiatement',
  'Sous 15 jours': 'Disponible sous 15 jours',
  'Dans un mois': 'Disponible dans un mois'
};
// Horaires « de journee » exclus : seuls les horaires decales comptent comme une souplesse a mettre en avant.
var _HORAIRES_DECALES_CV = ['Tôt le matin', 'Soirée', 'Week-end', 'Jours fériés', 'Nuit', 'Horaires fractionnés (avec une coupure)'];
var _HORAIRES_DECALES_CV_LIBELLES = {
  'Tôt le matin': 'tôt le matin', 'Soirée': 'en soirée', 'Week-end': 'le week-end', 'Jours fériés': 'les jours fériés',
  'Nuit': 'de nuit', 'Horaires fractionnés (avec une coupure)': 'avec une coupure'
};

// source : le dossier (dispo de l'objectif choisi, horaires). Retourne la liste des lignes proposees, sans doublon.
function lignesDisponibiliteCv(source) {
  var d = source || {};
  var lignes = [];
  var of = d.objectif && d[d.objectif];
  var dispo = (of && Array.isArray(of.dispo)) ? of.dispo : [];
  Object.keys(_DISPO_CV_PHRASES).forEach(function (cle) {
    if (dispo.indexOf(cle) !== -1) { lignes.push(_DISPO_CV_PHRASES[cle]); }
  });
  var horaires = Array.isArray(d.horaires) ? d.horaires : [];
  var decales = _HORAIRES_DECALES_CV.filter(function (h) { return horaires.indexOf(h) !== -1; });
  if (decales.length === _HORAIRES_DECALES_CV.length && horaires.indexOf('Journée') !== -1) {
    lignes.push('Prêt à accepter tout type d’horaire');
  } else if (decales.length) {
    lignes.push('Horaires adaptables : ' + decales.map(function (h) { return _HORAIRES_DECALES_CV_LIBELLES[h]; }).join(', '));
  }
  return lignes;
}

if (typeof module !== 'undefined' && module.exports) { module.exports = { lignesDisponibiliteCv: lignesDisponibiliteCv }; }
