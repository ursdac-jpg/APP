/* ============================================================
   data/urgences.js
   ------------------------------------------------------------
   Chantier "Ressources - 2e moitie", etape 2 (2026-08-29).

   Filet de securite compact : les numeros nationaux + les
   "portes" a pousser pour un besoin vital. National, stable,
   zero maintenance ("comme un extincteur"). PAS un catalogue
   (c'est le role de PCGI 87), PAS d'adresse locale inventee :
   on nomme le TYPE de porte (votre CCAS, la MDS de votre
   secteur, l'ADIL), jamais une structure precise.

   Consomme par le module Lexique : projete en 2 fiches
   generees dans l'univers "urgences" (voir l'IIFE en bas,
   meme mecanique que data/freins.js). data/urgences.js reste
   la source unique.

   Le 3114 vit aussi dans le bloc "signal de detresse" du
   rapport Regard exterieur (proposition bienveillante). Ici
   c'est la version consultable a froid : meme numero, meme ton
   calme, jamais rouge.
   ============================================================ */

var URGENCES_NUMEROS = [
  { numero: '15', libelle: 'SAMU', detail: 'Urgence médicale : malaise, blessure grave, difficulté à respirer, une personne qui perd connaissance.', dispo: '24h/24, gratuit' },
  { numero: '17', libelle: 'Police / Gendarmerie', detail: 'Danger immédiat, agression, violence en cours, quelqu\'un qui vous menace.', dispo: '24h/24, gratuit' },
  { numero: '18', libelle: 'Pompiers', detail: 'Incendie, accident, fuite de gaz, inondation, une personne en danger chez elle.', dispo: '24h/24, gratuit' },
  { numero: '112', libelle: 'Numéro d\'urgence européen', detail: 'Fonctionne partout en Europe, depuis n\'importe quel portable, même sans carte SIM ni forfait. À utiliser si vous ne savez pas lequel appeler.', dispo: '24h/24, gratuit' },
  { numero: '115', libelle: 'SAMU social', detail: 'Vous n\'avez pas de solution pour dormir ce soir. Appelez tôt le matin, et insistez si vous êtes en famille ou avec des enfants.', dispo: '24h/24, gratuit' },
  { numero: '119', libelle: 'Enfance en danger', detail: 'Un enfant est en danger, ou risque de l\'être : le vôtre, ou un enfant de votre entourage.', dispo: '24h/24, gratuit, confidentiel' },
  { numero: '3114', libelle: 'Prévention du suicide', detail: 'Vous traversez un moment très difficile, ou vous vous inquiétez pour quelqu\'un. Des professionnels formés sont là pour vous écouter.', dispo: '24h/24, gratuit, confidentiel' },
  { numero: '3919', libelle: 'Violences faites aux femmes', detail: 'Violences dans le couple, dans la famille, violences sexuelles. Écoute et orientation, sans obligation de porter plainte.', dispo: '24h/24, gratuit, anonyme' }
];

var URGENCES_PORTES = [
  {
    situation: 'Vous n\'avez plus rien pour manger',
    versQui: 'Le CCAS de votre mairie, ou la Maison Départementale des Solidarités (MDS) de votre secteur.',
    commentFaire: 'Se présenter ou téléphoner : une aide alimentaire d\'urgence peut être mise en place rapidement. Les Restos du Cœur, le Secours Populaire et la Croix-Rouge distribuent aussi des colis.'
  },
  {
    situation: 'Vous n\'avez pas de solution pour dormir',
    versQui: 'Le 115 (voir plus haut).',
    commentFaire: 'Appelez tôt le matin. En journée, les accueils de jour (Secours Catholique, Croix-Rouge) permettent de se poser, se laver, recharger un téléphone et être orienté.'
  },
  {
    situation: 'On va vous couper l\'électricité ou le gaz',
    versQui: 'La MDS ou le CCAS, pour demander le FSL Maintien (Fonds de Solidarité pour le Logement).',
    commentFaire: 'À faire AVANT la coupure si possible. Pendant la trêve hivernale (1er novembre au 31 mars), le fournisseur ne peut pas couper l\'électricité.'
  },
  {
    situation: 'Vous êtes menacé d\'expulsion de votre logement',
    versQui: 'L\'ADIL (Agence Départementale d\'Information sur le Logement) et le CCAS.',
    commentFaire: 'Ne restez jamais seul avec un courrier d\'expulsion : l\'ADIL informe gratuitement sur vos droits et les délais réels. Plus vous agissez tôt, plus il y a de solutions.'
  },
  {
    situation: 'Vous n\'avez aucune ressource (en attente du RSA, d\'un salaire, d\'une allocation)',
    versQui: 'Le CCAS de votre mairie.',
    commentFaire: 'Demandez un rendez-vous avec une assistante sociale : un secours d\'urgence (aide financière ponctuelle) peut être accordé le temps que vos droits s\'ouvrent.'
  }
];

// ============================================================
// Projection dans le Lexique : 2 fiches generees, univers "urgences"
// ------------------------------------------------------------
// Meme principe que data/freins.js : rien n'est recopie dans
// data/lexique.js. `_urgence` marque la fiche pour le hook de rendu
// (_lexiqueRenduFiche). Prefixe d'id "urgence-" : aucun id existant ne
// commence par la (verifie -- LECONS 9.25). Inerte cote Node.
// ============================================================
(function _urgencesProjeterDansLexique() {
  if (typeof LEXIQUE_FICHES === 'undefined' || !Array.isArray(LEXIQUE_FICHES)) { return; }
  var fiches = [
    {
      id: 'urgence-numeros',
      titre: 'Numéros d\'urgence nationaux',
      titreDeTri: 'Numéros d\'urgence nationaux',
      type: 'terme',
      univers: 'urgences',
      registres: ['langage-cip'],
      variantesRecherche: [
        'urgence', 'numéro d\'urgence', 'appeler', 'qui appeler',
        '15', '17', '18', '112', '115', '119', '3114', '3919',
        'samu', 'pompiers', 'police', 'gendarmerie', 'samu social',
        'sans abri', 'dormir dehors', 'prévention suicide', 'suicide',
        'violences conjugales', 'violences femmes', 'enfance en danger'
      ],
      corps: 'À garder sous la main : les numéros à composer en cas d\'urgence. Ils sont gratuits, joignables à toute heure, et fonctionnent depuis n\'importe quel téléphone.',
      relations: [],
      _urgence: 'numeros'
    },
    {
      id: 'urgence-besoins-vitaux',
      titre: 'Besoins vitaux : à qui s\'adresser',
      titreDeTri: 'Besoins vitaux : à qui s\'adresser',
      type: 'terme',
      univers: 'urgences',
      registres: ['langage-cip'],
      variantesRecherche: [
        'expulsion', 'expulsé', 'coupure électricité', 'coupure gaz',
        'plus rien à manger', 'aide alimentaire urgence', 'aucune ressource',
        'zéro ressource', 'en attente du rsa', 'ccas', 'mds',
        'maison départementale des solidarités', 'fsl', 'fonds de solidarité logement',
        'adil', 'assistante sociale', 'secours d\'urgence', 'trêve hivernale'
      ],
      corps: 'Quand un besoin de base n\'est plus assuré (manger, se loger, garder l\'électricité), il existe des portes à pousser sans attendre. Voici lesquelles, selon la situation.',
      relations: [],
      _urgence: 'portes'
    }
  ];
  fiches.forEach(function (f) {
    if (!LEXIQUE_FICHES.some(function (x) { return x.id === f.id; })) { LEXIQUE_FICHES.push(f); }
  });
})();

// Compat Node (aucun test dédié pour l'instant, mais cohérent avec
// data/freins.js -- inerte dans le navigateur).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { URGENCES_NUMEROS: URGENCES_NUMEROS, URGENCES_PORTES: URGENCES_PORTES };
}
