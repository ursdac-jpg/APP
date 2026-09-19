/* ============================================================
   modules/bilan-candidature/modeles/enums.js
   ------------------------------------------------------------
   Valeurs autorisees pour les champs a choix ferme du module Bilan de
   candidature. Source unique : CONTRATS.md. Aucune de ces listes ne doit
   etre recopiee en dur ailleurs dans le module -- toute verification
   d'enumeration passe par bilanEnumEstValide().
   ============================================================ */

var BILAN_AXE_POIDS = ['determinant', 'differenciateur', 'amplificateur', 'contextuel'];

var BILAN_RESTITUTION_QUALITATIVE = ['tres_convaincant', 'convaincant', 'a_renforcer', 'prioritaire'];

var BILAN_PRIORITE_RECOMMANDATION = ['critique', 'haute', 'moyenne', 'faible'];

var BILAN_STATUT_PREPARATION = ['pret', 'a_ajuster', 'a_retravailler'];

// Types d'alertesPrioritaires (referentiel des regles d'evaluation, section 4 -- test de non-compensation).
// TACHE (retour utilisateur : coherence anonymisation/alertes, 2026-08-10) :
// 'coordonnees' retire -- le CV envoye au Prompt 1 ne contient jamais les
// coordonnees (deja garanti par hostDataAdapter.js), ce type n'a donc plus
// de raison d'etre demande. Le retirer de l'enumeration fait aussi que si
// l’assistant en produit un malgre la consigne du prompt, bilanEnumEstValide()
// l'ecarte proprement (anomalie ValeurInvalide) plutot que de l'afficher.
var BILAN_TYPE_ALERTE = ['incoherence_chronologique', 'contradiction', 'credibilite'];

var BILAN_ORIGINE_OBSERVATION = ['factuelle', 'argumentee'];

var BILAN_STATUT_DIAGNOSTIC = ['genere', 'complete', 'echec_parsing'];

var BILAN_STATUT_DEMANDE_RELECTURE = ['en_attente', 'validee', 'annulee'];

// TACHE (chantier "Assistance a la finalisation du CV", contrat du
// Niveau 2 valide le 2026-08-11, voir docs/ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md) :
// PropositionAmelioration.action -- uniquement pertinent quand
// extraitConcerne est absent (prompts/bilan-v2.md, section 6). 'creer'
// et 'completer' seulement -- jamais 'remplacer', deja couvert par le
// cas extraitConcerne present (Niveau 1, hors perimetre du Prompt 2).
var BILAN_ACTION_PROPOSITION = ['completer', 'creer'];

var BILAN_NIVEAU_ANALYSE_MIN = 1;
var BILAN_NIVEAU_ANALYSE_MAX = 4;

// Ajoute pendant diagnostic/ (2026-08-08) : types d'anomalie du parser
// tolerant (diagnosticResponseParser.js). En PascalCase, deliberement
// different du style snake_case des enumerations ci-dessus -- ces
// valeurs suivent la meme convention que les codes d'erreur metier
// (bilanCreerErreurMetier, ex. 'CandidatureInvalide'), pas celle des
// enumerations orientees IA/JSON.
var BILAN_TYPES_ANOMALIE = ['ReferenceInconnue', 'ChampManquant', 'ValeurInvalide'];

function bilanEnumEstValide(liste, valeur) {
  return liste.indexOf(valeur) !== -1;
}

function bilanNiveauAnalyseEstValide(niveau) {
  return typeof niveau === 'number' && niveau >= BILAN_NIVEAU_ANALYSE_MIN && niveau <= BILAN_NIVEAU_ANALYSE_MAX;
}

// TACHE (chantier tests) : export CommonJS protege -- n'existe que sous
// Node (node:test), aucun effet sur le chargement navigateur classique
// (balise <script>, ou `module` n'est jamais defini).
if (typeof module !== 'undefined') {
  module.exports = {
    BILAN_AXE_POIDS: BILAN_AXE_POIDS,
    BILAN_RESTITUTION_QUALITATIVE: BILAN_RESTITUTION_QUALITATIVE,
    BILAN_PRIORITE_RECOMMANDATION: BILAN_PRIORITE_RECOMMANDATION,
    BILAN_STATUT_PREPARATION: BILAN_STATUT_PREPARATION,
    BILAN_TYPE_ALERTE: BILAN_TYPE_ALERTE,
    BILAN_ORIGINE_OBSERVATION: BILAN_ORIGINE_OBSERVATION,
    BILAN_STATUT_DIAGNOSTIC: BILAN_STATUT_DIAGNOSTIC,
    BILAN_STATUT_DEMANDE_RELECTURE: BILAN_STATUT_DEMANDE_RELECTURE,
    BILAN_ACTION_PROPOSITION: BILAN_ACTION_PROPOSITION,
    BILAN_NIVEAU_ANALYSE_MIN: BILAN_NIVEAU_ANALYSE_MIN,
    BILAN_NIVEAU_ANALYSE_MAX: BILAN_NIVEAU_ANALYSE_MAX,
    BILAN_TYPES_ANOMALIE: BILAN_TYPES_ANOMALIE,
    bilanEnumEstValide: bilanEnumEstValide,
    bilanNiveauAnalyseEstValide: bilanNiveauAnalyseEstValide
  };
}
