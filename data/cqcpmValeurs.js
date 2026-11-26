/* ============================================================
   data/cqcpmValeurs.js : espace « Ce qui compte pour moi », carte « Ce qui compte au travail ».
   Les dix-neuf repères, en cinq groupes (brouillon validé par Denis le 22/11/2026, consigne 542).
   Liste PROPRE à l'application : elle ne reprend ni la liste de 49 valeurs d'un organisme extérieur, ni un questionnaire protégé.
   Jamais un score, jamais un type de personne : ces repères sont tous « bons », la personne ne dit que ce qui compte pour elle.
   Aucun effet sur le score des métiers, sur le CV ni sur un prompt (l'ancien écran de valeurs du parcours CV a été retiré, consigne 261).
   Source unique : lue par la carte « Ce qui compte au travail » et par les choix « jusqu'à trois valeurs » des autres cartes.
   ============================================================ */

var CQCPM_VALEURS_GROUPES = [
  { id: 'faire', titre: 'Ce que je fais', valeurs: [
    { id: 'creer', lib: 'Créer ou fabriquer' },
    { id: 'apprendre', lib: 'Apprendre et comprendre' },
    { id: 'resoudre', lib: 'Résoudre des problèmes' },
    { id: 'details', lib: 'Soigner les détails' },
    { id: 'concret', lib: 'Voir un résultat concret' }
  ] },
  { id: 'autres', titre: 'Avec les autres', valeurs: [
    { id: 'aider', lib: 'Aider' },
    { id: 'equipe', lib: 'Travailler en équipe' },
    { id: 'transmettre', lib: 'Transmettre ce que je sais' },
    { id: 'reconnu', lib: 'Être reconnu(e) pour mon travail' }
  ] },
  { id: 'facon', titre: 'Ma façon de travailler', valeurs: [
    { id: 'libre', lib: 'Être libre de m’organiser' },
    { id: 'cadre', lib: 'Avoir un cadre clair' },
    { id: 'varier', lib: 'Varier les tâches' }
  ] },
  { id: 'attentes', titre: 'Ce que j’en attends', valeurs: [
    { id: 'revenu', lib: 'Un revenu confortable' },
    { id: 'stable', lib: 'Un emploi stable' },
    { id: 'evoluer', lib: 'Progresser ou évoluer' }
  ] },
  { id: 'sens', titre: 'Le sens', valeurs: [
    { id: 'utile', lib: 'Un travail utile aux autres' },
    { id: 'principes', lib: 'Respecter mes principes' },
    { id: 'passion', lib: 'Un métier qui me passionne' },
    { id: 'collectif', lib: 'Contribuer à un projet collectif' }
  ] }
];

// Liste à plat, dans l'ordre des groupes : { id, lib, groupe }.
var CQCPM_VALEURS = (function () {
  var l = [];
  CQCPM_VALEURS_GROUPES.forEach(function (g) { g.valeurs.forEach(function (v) { l.push({ id: v.id, lib: v.lib, groupe: g.id }); }); });
  return l;
})();

// Les trois piles de la carte « Ce qui compte au travail » (une valeur sans pile = sans avis).
var CQCPM_PILES = [
  { id: 'ess', nom: 'Essentielle', icone: 'bi-star-fill' },
  { id: 'imp', nom: 'Importante', icone: 'bi-star-half' },
  { id: 'moins', nom: 'Moins importante pour l’instant', court: 'Moins', icone: 'bi-star' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CQCPM_VALEURS_GROUPES: CQCPM_VALEURS_GROUPES, CQCPM_VALEURS: CQCPM_VALEURS, CQCPM_PILES: CQCPM_PILES };
}
