/* ============================================================
   data/cqcpmConditions.js : espace « Ce qui compte pour moi », carte « Comment je veux travailler ».
   Sept thèmes de conditions (texte validé sur maquette le 22/11/2026, consignes 539 et 556), trois réponses par condition, et la question d'énergie.
   Les libellés sont à la première personne : ils ne reprennent pas ceux du ROME (« Travail de nuit possible »), qui décrivent le métier.
   Le champ `rome` relie une condition à l'identifiant correspondant de data/conditionsRome.js (la liste de correspondance est dans docs/BRIQUES_COMMUNES.md) ;
   les réponses n'ont AUCUN effet sur les métiers proposés (décision de Denis, consigne 549).
   Une condition sans réponse veut dire « sans avis ».
   ============================================================ */

var CQCPM_REPONSES_CONDITIONS = [
  { id: 'veux', nom: 'Je le veux', icone: 'bi-check-lg' },
  { id: 'adapte', nom: 'Je peux m’adapter', icone: 'bi-arrow-left-right' },
  { id: 'evite', nom: 'Je préfère l’éviter', icone: 'bi-slash-circle' }
];

var CQCPM_CONDITIONS_THEMES = [
  { id: 'lieu', icone: 'bi-geo-alt', titre: 'Où je travaille', sous: 'Dehors, dedans, chez moi, chez les autres.', conds: [
    { id: 'l_ext', lib: 'Travailler à l’extérieur', rome: 'exterieur' },
    { id: 'l_int', lib: 'Travailler à l’intérieur' },
    { id: 'l_chez_gens', lib: 'Travailler chez les gens, à leur domicile', rome: 'domicile' },
    { id: 'l_chez_moi', lib: 'Travailler à mon domicile' },
    { id: 'l_distance', lib: 'Travailler à distance (télétravail)', rome: 'teletravail' },
    { id: 'l_changer', lib: 'Changer de lieu au cours de la journée' },
    { id: 'l_bruyant', lib: 'Travailler dans un endroit bruyant', rome: 'bruit' },
    { id: 'l_calme', lib: 'Travailler dans un endroit calme' }
  ] },
  { id: 'rythme', icone: 'bi-speedometer2', titre: 'Mon rythme', sous: 'La cadence, le corps, la précision.', conds: [
    { id: 'r_memes_gestes', lib: 'Faire souvent les mêmes gestes', rome: 'repetitif' },
    { id: 'r_varier', lib: 'Avoir une tâche différente d’un jour à l’autre' },
    { id: 'r_soutenu', lib: 'Tenir un rythme soutenu, avec des pointes de travail' },
    { id: 'r_tranquille', lib: 'Travailler à un rythme tranquille' },
    { id: 'r_debout', lib: 'Rester debout longtemps', rome: 'debout' },
    { id: 'r_assis', lib: 'Rester assis longtemps', rome: 'assis' },
    { id: 'r_charges', lib: 'Porter des charges', rome: 'charges' },
    { id: 'r_minutie', lib: 'Faire un travail minutieux, qui demande de la précision', rome: 'precision' }
  ] },
  { id: 'horaires', icone: 'bi-clock', titre: 'Mes horaires', sous: 'Quand je travaille.', conds: [
    { id: 'h_fixes', lib: 'Avoir toujours les mêmes horaires' },
    { id: 'h_changent', lib: 'Avoir des horaires qui changent d’une semaine à l’autre', rome: 'horaires' },
    { id: 'h_soiree', lib: 'Travailler en soirée' },
    { id: 'h_nuit', lib: 'Travailler de nuit', rome: 'nuit' },
    { id: 'h_weekend', lib: 'Travailler le week-end', rome: 'weekend' },
    { id: 'h_feries', lib: 'Travailler les jours fériés', rome: 'weekend' },
    { id: 'h_saison', lib: 'Faire un travail saisonnier', rome: 'saisonnier' },
    { id: 'h_amenager', lib: 'Pouvoir aménager mes horaires' }
  ] },
  { id: 'contact', icone: 'bi-people', titre: 'Le contact avec les autres', sous: 'Seul(e), en équipe, avec le public.', conds: [
    { id: 'c_public', lib: 'Être en contact avec le public', rome: 'public' },
    { id: 'c_equipe', lib: 'Travailler en équipe' },
    { id: 'c_seul', lib: 'Travailler seul(e)', rome: 'isole' },
    { id: 'c_guider', lib: 'Guider ou encadrer d’autres personnes' },
    { id: 'c_consignes', lib: 'Recevoir des consignes d’un responsable' },
    { id: 'c_difficulte', lib: 'Accueillir des personnes en difficulté ou mécontentes' },
    { id: 'c_telephone', lib: 'Répondre au téléphone ou aux messages toute la journée' }
  ] },
  { id: 'cadre', icone: 'bi-building', titre: 'Le cadre de travail', sous: 'La structure, les règles, la tenue.', conds: [
    { id: 'k_tenue', lib: 'Porter une tenue de travail', rome: 'tenue' },
    { id: 'k_securite', lib: 'Respecter des règles de sécurité strictes', rome: 'securite' },
    { id: 'k_public', lib: 'Travailler dans le secteur public', rome: 's_public' },
    { id: 'k_petite', lib: 'Travailler dans une petite structure' },
    { id: 'k_grande', lib: 'Travailler dans une grande entreprise' },
    { id: 'k_responsable', lib: 'Avoir un responsable présent près de moi' },
    { id: 'k_autonome', lib: 'Être autonome, sans personne derrière moi' },
    { id: 'k_objectifs', lib: 'Avoir des objectifs chiffrés à atteindre' }
  ] },
  { id: 'deplacements', icone: 'bi-truck', titre: 'Les déplacements', sous: 'Rouler, se déplacer, changer de ville.', conds: [
    { id: 'd_conduire', lib: 'Conduire pour travailler', rome: 'deplacements' },
    { id: 'd_sites', lib: 'Passer d’un site à un autre dans la journée', rome: 'deplacements' },
    { id: 'd_voyager', lib: 'Partir plusieurs jours de temps en temps', rome: 'deplacements' },
    { id: 'd_trajet', lib: 'Avoir un long trajet pour aller travailler' },
    { id: 'd_demenager', lib: 'Déménager pour un emploi' },
    { id: 'd_vehicule', lib: 'Utiliser un véhicule fourni par l’employeur' }
  ] },
  { id: 'vie', icone: 'bi-house-heart', titre: 'Mon cadre de vie', sous: 'Ce que mon travail doit laisser de place dans ma vie.', renvoi: 'territoire', conds: [
    { id: 'v_pres', lib: 'Rester près de chez moi' },
    { id: 'v_sans_voiture', lib: 'Pouvoir me rendre au travail sans voiture' },
    { id: 'v_famille', lib: 'Garder du temps pour ma vie de famille ou mes proches' },
    { id: 'v_ceder', lib: 'Accepter de céder sur certains horaires pour un emploi qui me plaît' },
    { id: 'v_ville', lib: 'Pouvoir changer de ville' }
  ] }
];

// La question d'énergie : une situation, trois choix. Elle ne mesure rien et ne classe pas la personne (jamais « introverti » ni « extraverti »).
var CQCPM_ENERGIE_CHOIX = [
  { id: 'seul', nom: 'seul(e)' },
  { id: 'ensemble', nom: 'avec d’autres' },
  { id: 'depend', nom: 'ça dépend' }
];
var CQCPM_ENERGIE_SITUATIONS = [
  { id: 'reflechir', lib: 'Quand j’ai besoin de réfléchir à un problème, je me sens mieux…' },
  { id: 'apprendre', lib: 'Quand j’apprends quelque chose de nouveau, je me sens mieux…' },
  { id: 'decider', lib: 'Quand je dois prendre une décision, je me sens mieux…' },
  { id: 'difficile', lib: 'Après une journée difficile, je retrouve de l’énergie…' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CQCPM_REPONSES_CONDITIONS: CQCPM_REPONSES_CONDITIONS, CQCPM_CONDITIONS_THEMES: CQCPM_CONDITIONS_THEMES,
    CQCPM_ENERGIE_CHOIX: CQCPM_ENERGIE_CHOIX, CQCPM_ENERGIE_SITUATIONS: CQCPM_ENERGIE_SITUATIONS
  };
}
