/* ============================================================
   modules/lettre-core/disponibilitesLettreCo.js
   ------------------------------------------------------------
   Horaires que la personne accepte de travailler (candidature spontanee et
   « changer de metier » de la page « Preparer » de la lettre, 24/10/2026,
   demande de Denis : « la plupart des metiers du commerce travaillent en
   horaires decales, tout le monde ne commence pas a 8 h, il faut que la
   personne puisse indiquer ses horaires »).

   Le type de contrat, le temps de travail et le debut possible existaient
   deja (CONTRATS, TEMPS_TRAVAIL, DISPONIBILITES dans js/app.js) ; seuls les
   horaires sont nouveaux. Fonctions pures, testees en Node
   (tests/lettreCoreDisponibilites.test.js).
   ============================================================ */

// val = ce qui est enregistre dans dossier.horaires et envoye a l'assistant ; label = ce que la personne lit.
var HORAIRES_EMPLOI = [
  { val: 'Journée', label: 'Journée' },
  { val: 'Tôt le matin', label: 'Tôt le matin' },
  { val: 'Soirée', label: 'Soirée' },
  { val: 'Week-end', label: 'Week-end' },
  { val: 'Jours fériés', label: 'Jours fériés' },
  { val: 'Nuit', label: 'Nuit' },
  { val: 'Horaires fractionnés (avec une coupure)', label: 'Horaires fractionnés (avec une coupure)' }
];

// Ligne du profil envoyee a l'assistant (meme style que « Type de contrat recherché »). Vide si rien n'est coche.
// Tout coche = « tous les horaires », que l'assistant peut presenter comme un point fort.
function texteHorairesProfil(horaires) {
  var valides = HORAIRES_EMPLOI.map(function (h) { return h.val; });
  var choisis = (Array.isArray(horaires) ? horaires : []).filter(function (h) { return valides.indexOf(h) !== -1; });
  if (!choisis.length) { return ''; }
  var liste = valides.filter(function (v) { return choisis.indexOf(v) !== -1; });
  if (liste.length === valides.length) { return '- Horaires acceptés : tous les horaires (' + liste.join(', ') + ')\n'; }
  return '- Horaires acceptés : ' + liste.join(', ') + '\n';
}

if (typeof module !== 'undefined') {
  module.exports = { HORAIRES_EMPLOI: HORAIRES_EMPLOI, texteHorairesProfil: texteHorairesProfil };
}
