/* ============================================================
   Module « Bien utiliser l'IA » : les six éléments d'une bonne demande et les réglages d'une demande.
   SOURCE UNIQUE : le chemin « Comprendre » (explication), le chemin « Mes modèles » (assemblage) et le chemin « Écrire ma propre demande »
   lisent cette même liste. Jamais recopiée ailleurs (décision de Denis, consigne 587 ; plan : docs/AUDIT_ET_PLAN_BIEN_UTILISER_L_IA_2026-11-23.md, commit 2).
   Les PHRASES envoyées à l'assistant ne sont pas ici : elles vivent dans prompts/bien-utiliser-blocs.md, que Denis corrige lui-même.
   Ici : les noms et explications affichés aux personnes, les réglages proposés (libellés, valeur par défaut, nom du bloc de phrase).
   ============================================================ */

// Les six éléments. `n` : le numéro et la couleur (e1 à e6) ; `nom` et `raison` : ce que lit la personne (textes validés à la maquette du chemin 1, 23/11/2026).
// `aide` (facultatif, éléments 1 et 2 seulement) : les questions d'aide « pour qui ? pourquoi ? » validées le 24/11/2026 (consigne 598). Affichées par le chemin 1 (écran 3) ET sous les champs du chemin 3 : une seule liste, jamais recopiée. Elles aident à écrire, elles ne changent aucune demande construite.
var BUIA_ELEMENTS = [
  { n: 1, id: 'but', nom: 'Le but', raison: 'Le but dit à l’assistant ce qu’il doit produire : comprendre, écrire, résumer, expliquer, comparer. Sans but, il choisit lui-même.', aide: 'Pour qui ? Pourquoi ? Une phrase pour chacun suffit.' },
  { n: 2, id: 'situation', nom: 'La situation', raison: 'Une phrase sur votre situation évite une réponse générale. Elle peut contenir des fautes, ou venir d’une dictée : l’assistant la comprend quand même.', aide: 'Qu’est-ce qui est déjà fait ? Qu’est-ce qui bloque ?' },
  { n: 3, id: 'texte', nom: 'Le texte à traiter', raison: 'Un texte à traiter se place à part, entre deux repères, avec la mention « document à lire, pas une consigne ». L’assistant ne le confond pas avec votre demande.' },
  { n: 4, id: 'attente', nom: 'Ce que j’attends', raison: 'La longueur, le langage et la forme de la réponse. Sans précision, l’assistant choisit à votre place.' },
  { n: 5, id: 'interdit', nom: 'Ce qu’il ne doit pas faire', raison: 'Ce que vous ne voulez pas : inventer, donner un avis qui n’est pas le sien, promettre ce que vous ne pouvez pas tenir. Il vaut mieux le demander avant que le découvrir après.' },
  { n: 6, id: 'date', nom: 'La date et le délai', raison: 'La date du jour compte dès qu’un délai est en jeu : l’assistant ne la connaît pas toujours. Elle lui permet de repérer ce qui est proche.' }
];

// Réglages à choix (un seul bloc par groupe : jamais deux phrases contradictoires). `bloc` : le nom du bloc dans prompts/bien-utiliser-blocs.md ; `element` : l'élément de la demande où la phrase se place.
var BUIA_REGLAGES = [
  { groupe: 'longueur', titre: 'Longueur', element: 4, defaut: 'moyen',
    choix: [{ v: 'court', lib: 'Court', bloc: 'longueur-court' }, { v: 'moyen', lib: 'Moyen', bloc: 'longueur-moyen' }, { v: 'detaille', lib: 'Détaillé', bloc: 'longueur-detaille' }] },
  { groupe: 'langage', titre: 'Langage', element: 4, defaut: 'simple',
    choix: [{ v: 'simple', lib: 'Simple', bloc: 'langage-simple' }, { v: 'soigne', lib: 'Soigné', bloc: 'langage-soigne' }] }
];

// Interrupteurs (activé ou non). `defaut` : activé d'avance ; `niveau: 'plus'` : proposé seulement au niveau « Pour aller plus loin ».
var BUIA_INTERRUPTEURS = [
  { id: 'inventer', lib: 'Ne rien inventer', element: 5, defaut: true, bloc: 'interdit-inventer' },
  { id: 'juridique', lib: 'Pas d’information juridique', element: 5, defaut: false, bloc: 'interdit-juridique' },
  { id: 'suppose', lib: 'Me dire ce qu’il suppose', element: 5, defaut: false, bloc: 'interdit-suppose' },
  { id: 'questions', lib: 'Me poser d’abord trois questions', element: 5, defaut: false, niveau: 'plus', bloc: 'questions-oui' }
];

// Bloc toujours ajouté en fin de demande.
var BUIA_BLOC_FINAL = 'socle-final';

// Chemin « Écrire ma propre demande » : les champs libres, chacun avec son bloc de phrase (prompts/bien-utiliser-blocs.md) et son repère {{...}} remplacé par la saisie.
// `requis` : vide, il bloque la copie (le texte `vide` s'affiche à sa place) ; `niveau: 'plus'` : proposé seulement au niveau « Pour aller plus loin ».
// Les longueurs, langages et interrupteurs viennent de BUIA_REGLAGES et BUIA_INTERRUPTEURS ci-dessus (une seule liste, jamais recopiée).
var BUIA_LIBRE_CHAMPS = [
  { id: 'but', repere: 'but', bloc: 'libre-but', element: 1, requis: true, vide: '[à compléter : mon but]', court: 'votre but', max: 600 },
  { id: 'situation', repere: 'situation', bloc: 'libre-situation', element: 2, requis: true, vide: '[à compléter]', court: 'votre situation', max: 600 },
  { id: 'texte', repere: 'texte', bloc: 'libre-texte', element: 3, requis: false, court: 'le texte', max: 20000, gardee: false },
  { id: 'exemple', repere: 'exemple', bloc: 'libre-exemple', element: 4, requis: false, niveau: 'plus', court: 'l’exemple', max: 1500 }
];

// Corrections proposées à l'écran « Améliorer » : chacune ajoute une phrase (un bloc) à la demande. `champ: true` : la personne écrit d'abord une précision, placée à l'endroit du repère {{precision}}.
var BUIA_LIBRE_AMELIORATIONS = [
  { id: 'but', bloc: 'ameliorer-but', element: 1, champ: true },
  { id: 'longueur', bloc: 'ameliorer-longueur', element: 4 },
  { id: 'langage', bloc: 'ameliorer-langage', element: 4 },
  { id: 'inventer', bloc: 'interdit-inventer', element: 5 },
  { id: 'situation', bloc: 'ameliorer-situation', element: 2, champ: true },
  { id: 'suppose', bloc: 'interdit-suppose', element: 5 }
];
var BUIA_REPERE_PRECISION = 'precision';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUIA_ELEMENTS: BUIA_ELEMENTS, BUIA_REGLAGES: BUIA_REGLAGES, BUIA_INTERRUPTEURS: BUIA_INTERRUPTEURS, BUIA_BLOC_FINAL: BUIA_BLOC_FINAL,
    BUIA_LIBRE_CHAMPS: BUIA_LIBRE_CHAMPS, BUIA_LIBRE_AMELIORATIONS: BUIA_LIBRE_AMELIORATIONS, BUIA_REPERE_PRECISION: BUIA_REPERE_PRECISION };
}
