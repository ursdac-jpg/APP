/* ============================================================
   modules/bilan-candidature/analyse/axeAnalyseRegistry.js
   ------------------------------------------------------------
   Catalogue statique des 9 dimensions du referentiel d'analyse --
   source unique de leur poids et niveau minimum, exactement alignee sur
   prompts/bilan-v1.md (section 2). Projection recruteur est absente
   volontairement : ce n'est pas une dimension analysee independamment,
   voir prompts/bilan-v1.md.

   Donnee ici, comportement de requete ici aussi -- mais la FORME d'une
   entree (bilanCreerDefinitionAxe) reste dans modeles/axe.js (separation
   deja actee : la donnee reelle des 10 axes n'appartient pas a modeles/).

   IMPORTANT : catalogue fige a l'execution -- aucune fonction de ce
   fichier ne le modifie, uniquement des fonctions de lecture.

   ATTENTION -- SOURCE DE VERITE PARTAGEE AVEC prompts/bilan-v1.md.
   Ce fichier (id, nom, poids, niveauMinimum) et le texte du Prompt 1
   decrivent la meme realite. Toute modification ici (ajout/retrait d'un
   axe, changement de nom ou de niveau minimum) DOIT etre repercutee
   dans prompts/bilan-v1.md (section 2) et son schema JSON -- sinon
   tests/bilanCoherencePrompt1CatalogueAxes.test.js echoue. Le prompt
   n'est pas genere depuis ce fichier (ses criteres qualitatifs sont
   ecrits a la main, non derivables d'une liste de donnees) : la
   coherence est verifiee par ce test, pas garantie automatiquement.
   Voir ce meme test avant toute modification du catalogue.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanAxeModele = require('../modeles/axe.js');
  var bilanCreerDefinitionAxe = _bilanAxeModele.bilanCreerDefinitionAxe;
}

// TACHE (consolidation Bilan, bloc 1.4, 2026-08-30) : chaque entree porte
// desormais ceQuOnRegarde -- couche 2 du rapport, texte fixe "ce qu'on
// regarde sur cet axe", affiche dans l'accordeon meme si l'axe est solide.
// Reformulation pour la personne de prompts/bilan-v1.md section 2 (memes
// reperes, phrase courte, jamais de jugement sur la mise en page).
var BILAN_CATALOGUE_AXES = [
  bilanCreerDefinitionAxe({ id: 'adequation', nom: 'Adéquation avec le poste', poids: 'determinant', niveauMinimum: 2,
    ceQuOnRegarde: 'Votre profil correspond-il aux exigences du poste ou du métier visé : compétences attendues, niveau de séniorité ?' }),
  bilanCreerDefinitionAxe({ id: 'credibilite', nom: 'Crédibilité', poids: 'determinant', niveauMinimum: 1,
    ceQuOnRegarde: 'Ce qui est écrit semble-t-il vrai et vérifiable, sans survente ni décalage avec le niveau réel des responsabilités ?' }),
  bilanCreerDefinitionAxe({ id: 'risques', nom: 'Risques et signaux d\'alerte', poids: 'determinant', niveauMinimum: 1,
    ceQuOnRegarde: 'Y a-t-il des points qui peuvent faire hésiter un recruteur : trous non expliqués, changements de cap, instabilité ? Ici, « rien à signaler » est déjà un bon résultat.' }),
  bilanCreerDefinitionAxe({ id: 'impact', nom: 'Impact / valeur démontrée', poids: 'differenciateur', niveauMinimum: 1,
    ceQuOnRegarde: 'Vos expériences sont-elles décrites par des réalisations concrètes et mesurables, ou seulement par une liste de tâches ?' }),
  bilanCreerDefinitionAxe({ id: 'coherence', nom: 'Cohérence du parcours', poids: 'differenciateur', niveauMinimum: 1,
    ceQuOnRegarde: 'Le fil de votre parcours est-il compréhensible, sans zone d’ombre : chronologie continue, ou trous expliqués ?' }),
  bilanCreerDefinitionAxe({ id: 'lisibilite', nom: 'Lisibilité et structure', poids: 'amplificateur', niveauMinimum: 1, plafonneA: 'a_renforcer',
    ceQuOnRegarde: 'L’ordre et la présence des rubriques, la clarté des phrases, l’orthographe et la grammaire dans le texte fourni. Jamais la mise en page, la police ou les couleurs, qui ne sont pas visibles ici.' }),
  bilanCreerDefinitionAxe({ id: 'differenciation', nom: 'Différenciation', poids: 'amplificateur', niveauMinimum: 1, plafonneA: 'a_renforcer',
    ceQuOnRegarde: 'Un élément rend-il votre candidature mémorable, au-delà des mots-clés attendus pour ce poste ?' }),
  bilanCreerDefinitionAxe({ id: 'posture', nom: 'Posture professionnelle perçue', poids: 'amplificateur', niveauMinimum: 1, plafonneA: 'a_renforcer',
    ceQuOnRegarde: 'Le savoir-être qui transparaît de vos formulations, et si le ton du CV correspond au type de structure visé.' }),
  // TACHE (chantier "Coherence transversale CV/lettre/entretien", 2026-08-25,
  // DECISION DE DENIS) : cet axe vivait ici (contextuel, niveau minimum 4)
  // mais n'a jamais recu de donnees reelles (le Bilan ne transmettait ni
  // lettre ni entretien) -- retire du catalogue V1, deplace vers un prompt
  // et un module dedies (voir docs/CHANTIER_COHERENCE_TRANSVERSALE_SYNTHESE.md),
  // pour eviter d'alourdir un prompt deja dense (lecon du prompt fusionne V3,
  // retire le jour meme de son test reel pour la meme raison).
  bilanCreerDefinitionAxe({ id: 'personnalisation', nom: 'Personnalisation de la candidature', poids: 'contextuel', niveauMinimum: 3, plafonneA: 'a_renforcer',
    ceQuOnRegarde: 'La candidature est-elle adaptée à cette offre précise, au-delà d’une reprise de mots-clés : titre affiché, accroche, contenu ?' })
];

function bilanObtenirAxe(id) {
  for (var i = 0; i < BILAN_CATALOGUE_AXES.length; i += 1) {
    if (BILAN_CATALOGUE_AXES[i].id === id) { return BILAN_CATALOGUE_AXES[i]; }
  }
  return undefined;
}

function bilanObtenirCatalogueAxes() {
  return BILAN_CATALOGUE_AXES.slice();
}

function bilanObtenirAxesApplicables(niveau) {
  return BILAN_CATALOGUE_AXES.filter(function (axe) { return axe.niveauMinimum <= niveau; });
}

function bilanObtenirAxesNonApplicables(niveau) {
  return BILAN_CATALOGUE_AXES.filter(function (axe) { return axe.niveauMinimum > niveau; });
}

if (typeof module !== 'undefined') {
  module.exports = {
    BILAN_CATALOGUE_AXES: BILAN_CATALOGUE_AXES,
    bilanObtenirAxe: bilanObtenirAxe,
    bilanObtenirCatalogueAxes: bilanObtenirCatalogueAxes,
    bilanObtenirAxesApplicables: bilanObtenirAxesApplicables,
    bilanObtenirAxesNonApplicables: bilanObtenirAxesNonApplicables
  };
}
