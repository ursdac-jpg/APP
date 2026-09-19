/* ============================================================
   modules/bilan-candidature/correction/destinationRegistry.js
   ------------------------------------------------------------
   TACHE (chantier "continuite Diagnostic -> Correction", conception
   validee le 2026-08-10) : catalogue statique axe -> destination ERIP,
   strategie de repli de la resolution en cascade (voir
   resolutionDestination.js). Volontairement CODE UNIQUEMENT, aucun
   nouveau champ ni dans les prompts ni dans le schema d'une
   Recommandation -- decision explicite du retour utilisateur, pour ne
   jamais coupler le prompt au vocabulaire d'ecrans d'ERIP (meme
   principe deja applique a extraitConcerne, jamais de connaissance de
   l'UI cote IA).

   Table volontairement simple (un seul destinataire par axe) : verifiee
   contre la structure reelle de pageProjet()/pageResultats() (js/app.js)
   au moment de sa conception, PAS deduite d'un echantillon reel de
   recommandations (aucun corpus reel disponible dans ce depot, voir
   discussion). A confirmer/ajuster lors des premiers vrais passages du
   Prompt 1 (docs/PROTOCOLE_TEST_PROMPT1_BILAN_CANDIDATURE.md).

   6 des 10 axes partagent la meme destination (Experience
   professionnelle) : simplification assumee, pas un oubli -- credibilite,
   risques, impact, coherence, differenciation et posture se corrigent
   tous au meme endroit du CV (le texte des experiences). Verifie contre
   pageResultats() (js/app.js) : sectionExperiences n'existe QUE si
   dossier.modeCreation !== 'pret', d'ou la branche separee pour le CV
   importe dans resolutionDestination.js.

   CORRECTIF (audit Niveau 2, verifie et corrige le 2026-08-11) : `adequation`
   pointait vers 'projet-professionnel' (bloc CONFIG_BLOC_PROJET,
   js/app.js), suppose a tort contenir le metier vise. Verifie dans le
   code reel : ce bloc ne contient que type de contrat / temps de
   travail / disponibilite, rien sur le metier. dossier.metierCible est
   en realite choisi DANS le bloc Candidature (sous-section "Comment
   souhaitez-vous rechercher un emploi ?", contenuModeRecherche/
   wireModeRecherche) -- le meme bloc deja utilise par personnalisation.
   `adequation` route donc desormais vers 'candidature' ; 'projet-professionnel'
   n'a plus aucun consommateur et est retiree (jamais de cible inutilisee
   maintenue "au cas ou").

   CORRECTIF (audit Niveau 2, meme audit, 2026-08-11) : coherence_transversale
   routait aussi vers 'candidature', par le meme raisonnement errone que
   lisibilite avant sa propre correction (brique 3) -- cet axe juge la
   coherence ENTRE documents (CV, lettre, entretien), jamais un champ isole
   du dossier. Route desormais vers 'texte-libre', voir l'entree
   correspondante plus bas pour le detail.

   DECISION (brique 3, verifiee et corrigee le 2026-08-10) : `lisibilite`
   route vers 'texte-libre' (relecture du CV complet), PAS vers un ecran
   precis, pour deux raisons independantes, toutes deux confirmees :
     1. Raison fonctionnelle -- cet axe juge "structure, longueur,
        proprete" du document (prompts/bilan-v1.md, section 2), une
        question qui porte sur le CV dans son ensemble, jamais sur un
        champ isole. La destination "style" envisagee au depart (choix
        de modele/couleur, ecran "Apercu et finalisation") repondait a
        une question differente (l'esthetique, pas la structure) --
        erreur de correspondance initiale, corrigee ici.
     2. Raison technique -- meme si la correspondance avait ete juste,
        "Apercu et finalisation" fait partie du parcours SEQUENTIEL et
        VERROUILLE de pageResultats() (etapes validees une a une,
        etatAccordeon/etatAccordeonValide, voir js/app.js) : y renvoyer
        directement, sans que les etapes precedentes aient ete
        reellement validees par la personne, aurait exige soit de
        simuler une validation qu'elle n'a pas faite (fragile, jamais
        souhaite), soit de contourner ce garde-fou existant (jamais
        souhaite non plus, voir CONTRATS.md). Aucune des deux options
        n'a ete retenue -- l'architecture existante de pageResultats()
        est respectee telle quelle, sans exception.

   cible : identifiant technique, consomme par la navigation reelle
   (app.js) pour choisir l'ecran/la fenetre modale a ouvrir -- jamais
   affiche tel quel a l'utilisateur (voir libelle).
   ============================================================ */

var BILAN_DESTINATION_PAR_AXE = {
  adequation: { cible: 'candidature', libelle: 'Candidature (métier visé)' },
  credibilite: { cible: 'experiences', libelle: 'Expérience professionnelle' },
  risques: { cible: 'experiences', libelle: 'Expérience professionnelle' },
  impact: { cible: 'experiences', libelle: 'Expérience professionnelle' },
  coherence: { cible: 'experiences', libelle: 'Expérience professionnelle' },
  differenciation: { cible: 'experiences', libelle: 'Expérience professionnelle' },
  posture: { cible: 'experiences', libelle: 'Expérience professionnelle' },
  // Voir "DECISION (brique 3)" ci-dessus : jamais 'style', par choix
  // fonctionnel autant que technique.
  lisibilite: { cible: 'texte-libre', libelle: 'Le texte complet de votre CV' },
  personnalisation: { cible: 'candidature', libelle: 'Candidature (offre ciblée)' }
  // TACHE (chantier "Coherence transversale CV/lettre/entretien", 2026-08-25,
  // DECISION DE DENIS) : coherence_transversale retire du catalogue d'axes
  // du Bilan V1 (voir axeAnalyseRegistry.js) -- deplace vers un module et un
  // prompt dedies, donc plus aucune entree ici.
};

// Ordre de preseance pour departager une recommandation liee a
// PLUSIEURS axes (dimensionsLiees est un tableau) : reutilise le poids
// deja attribue a chaque axe dans analyse/axeAnalyseRegistry.js plutot
// que d'inventer un second systeme de priorite. Le plus determinant
// l'emporte -- coherent avec le reste du referentiel (une dimension
// determinante prime deja sur les autres partout ailleurs).
var BILAN_ORDRE_POIDS_DESTINATION = ['determinant', 'differenciateur', 'amplificateur', 'contextuel'];

// dimensionsLiees : tableau d'id d'axes (jamais vide, invariant deja
// garanti par modeles/recommandation.js). catalogueAxes : BILAN_CATALOGUE_AXES
// (ou equivalent de test), injecte plutot que relu globalement, meme
// discipline que le reste du module.
function bilanChoisirAxePrincipal(dimensionsLiees, catalogueAxes) {
  var axesConnus = dimensionsLiees
    .map(function (id) { return catalogueAxes.filter(function (a) { return a.id === id; })[0]; })
    .filter(function (a) { return !!a; });
  if (axesConnus.length === 0) { return null; }

  axesConnus.sort(function (a, b) {
    return BILAN_ORDRE_POIDS_DESTINATION.indexOf(a.poids) - BILAN_ORDRE_POIDS_DESTINATION.indexOf(b.poids);
  });
  return axesConnus[0].id;
}

// Retourne { cible, libelle } ou null si l'axe est inconnu du catalogue
// (defense en profondeur -- ne devrait jamais arriver si dimensionsLiees
// a deja ete valide en amont par diagnosticResponseParser.js).
function bilanDestinationPourAxe(axeId) {
  return BILAN_DESTINATION_PAR_AXE[axeId] || null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    BILAN_DESTINATION_PAR_AXE: BILAN_DESTINATION_PAR_AXE,
    BILAN_ORDRE_POIDS_DESTINATION: BILAN_ORDRE_POIDS_DESTINATION,
    bilanChoisirAxePrincipal: bilanChoisirAxePrincipal,
    bilanDestinationPourAxe: bilanDestinationPourAxe
  };
}
