/* ============================================================
   modules/bilan-candidature/assistance/orchestrationAssistance.js
   ------------------------------------------------------------
   TACHE (chantier "Assistance a la finalisation du CV", brique 5,
   2026-08-11) : orchestrateur, conception validee dans
   docs/ARCHITECTURE_ORCHESTRATION_ASSISTANCE_BILAN_CANDIDATURE.md avant
   ce code. Repond a UNE SEULE question, en logique pure : pour chaque
   recommandation validee, quelle branche du parcours la concerne
   (Famille 1 remplacement, Famille 1 redactionnel, Famille 2 completude,
   ou hors modalite), et avec quelle destination deja resolue ?

   AUCUNE logique metier nouvelle : chaque decision delegue entierement
   a un resolveur deja valide (resolutionDestination.js, brique 1 du
   chantier "Diagnostic -> Correction" ; resolutionChampExperience.js,
   brique 4bis). Ce fichier ne fait que lire leurs resultats et les
   ranger dans la bonne case -- jamais interpreter, jamais deviner.

   Volontairement absent, par choix de perimetre (voir le document de
   conception, section 5) :
     - tout appel au cycle Prompt 2 (bilanDemanderAmelioration, copier/
       coller) : cablage UI, app.js, pas ce module.
     - toute construction d'ElementRelecture (assistance/etatRelecture.js) :
       l'appelant (app.js) dispose deja de cette interface publique,
       aucune raison d'en dupliquer un appel ici.
     - toute navigation reelle pour la Famille 2 (candidature) : cablage
       UI, app.js, meme raisonnement.
     - tout etat metier stocke : ce module ne conserve rien entre deux
       appels, chaque fonction est pure.

   Forme d'un element classe : { recommandation, mecanisme, destination,
   texteActuel }.
     mecanisme : 'remplacement' | 'redactionnel' | 'completude' |
       'structure' | 'hors-automatisation' | 'hors-modalite'
     destination : { liste, index, champ } pour 'remplacement'/'redactionnel',
       null sinon.
     texteActuel : texte actuellement dans `dossier` a cette destination
       (deja present dans `donnees.experiencesTexte`, jamais relu
       ailleurs), null sinon.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanResoDest_OA = require('../correction/resolutionDestination.js');
  var bilanResoudreDestinationCorrection = _bilanResoDest_OA.bilanResoudreDestinationCorrection;
  var _bilanResoExp_OA = require('./resolutionChampExperience.js');
  var bilanResoudreChampExperience = _bilanResoExp_OA.bilanResoudreChampExperience;
}

function bilanClasserRecommandationAssistance(recommandation, donnees, catalogueAxes) {
  donnees = donnees || {};
  var resolution = bilanResoudreDestinationCorrection(recommandation, donnees, catalogueAxes);

  if (resolution.type === 'extrait') {
    // TACHE (chantier experiencesPerso, 2026-08-22) : propage liste (deja
    // porte par resolution.cible, voir resolutionDestination.js) -- defaut
    // 'experiences' pour rester compatible avec un resolveur qui ne le
    // fournirait pas encore.
    var destinationExtrait = { liste: resolution.cible.liste || 'experiences', index: resolution.cible.index, champ: resolution.cible.champ };
    return {
      recommandation: recommandation, mecanisme: 'remplacement',
      destination: destinationExtrait, texteActuel: resolution.cible[resolution.cible.champ]
    };
  }

  if (resolution.type === 'axe' && resolution.cible === 'experiences') {
    var champRes = bilanResoudreChampExperience(donnees.experiencesTexte);
    if (champRes.type === 'unique') {
      // TACHE (chantier experiencesPerso, 2026-08-22) : donnees.experiencesTexte
      // est desormais une liste COMBINEE (experiences + experiencesPerso) --
      // sa position dans ce tableau n'est plus l'index d'ecriture (voir
      // hostDataAdapter.js), retrouve l'element par (liste, index) plutot
      // qu'un acces direct par position.
      var experience = (donnees.experiencesTexte || []).filter(function (e) {
        return (e.liste || 'experiences') === champRes.destination.liste && e.index === champRes.destination.index;
      })[0];
      return {
        recommandation: recommandation, mecanisme: 'redactionnel',
        destination: champRes.destination, texteActuel: (experience && experience[champRes.destination.champ]) || null
      };
    }
    // TACHE (Carte 3, ecran de preparation avant generation, 2026-08-28,
    // DECISION DE DENIS -- "zero carte grise") : quand une recommandation
    // liee au contenu d'une experience ne peut PAS etre rattachee a UNE
    // experience precise (plusieurs experiences, aucun extrait cite par le
    // 1er prompt), on ne l'eclate plus en une carte par experience (l'ancien
    // fan-out 'selection-requise' produisait 3 recos x 3 experiences = 9
    // cartes dont 6 grisees "n'apporte rien"). Le couplage se fait desormais
    // en amont, par extraitConcerne que le 1er prompt remplit pour les
    // recos impact/credibilite (prompts/bilan-v1.md, consigne renforcee) :
    // une reco bien couplee arrive en 'extrait' (branche du haut), une
    // seule experience. Le cas 'selection' restant (reco sans extrait)
    // rejoint 'hors-automatisation' comme 'indisponible' : formulation
    // proposee a placer soi-meme, jamais une carte vide.
    return { recommandation: recommandation, mecanisme: 'hors-automatisation', destination: null, texteActuel: null };
  }

  if (resolution.type === 'axe' && resolution.cible === 'candidature') {
    return { recommandation: recommandation, mecanisme: 'completude', destination: null, texteActuel: null };
  }

  // 'texte-libre' : reste exclusivement manuel, ni Famille 1 ni Famille 2.
  // TACHE (axe lisibilite -> "Lisibilite et structure", 2026-08-28, DECISION
  // DE DENIS) : si une structure editable existe, la SEULE raison d'arriver
  // ici est l'axe 'lisibilite' (seul axe -> 'texte-libre' dans
  // destinationRegistry ; tout autre axe lie a une experience passe par la
  // branche 'axe'/'experiences' plus haut). Une reco de lisibilite/structure
  // porte sur l'ORGANISATION du CV (ordre et presence des rubriques) : il n'y
  // a aucun texte a reformuler, donc jamais de generation -> mecanisme
  // 'structure' (carte de guidage vers l'atelier CV). Sans structure editable
  // (CV importe, structurationDisponible faux), n'importe quel axe peut
  // arriver ici et une reformulation reste utile -> 'hors-modalite' inchange.
  if (donnees.structurationDisponible) {
    return { recommandation: recommandation, mecanisme: 'structure', destination: null, texteActuel: null };
  }
  return { recommandation: recommandation, mecanisme: 'hors-modalite', destination: null, texteActuel: null };
}

// Repartit un lot de recommandations validees en groupes clairement
// isoles, chacun testable independamment -- jamais un seul tableau
// hetereogene que l'appelant devrait lui-meme trier.
function bilanRepartirRecommandationsAssistance(recommandations, donnees, catalogueAxes) {
  var resultat = { famille1: [], famille2: [], structure: [], horsAutomatisation: [], horsModalite: [] };
  (recommandations || []).forEach(function (recommandation) {
    var classement = bilanClasserRecommandationAssistance(recommandation, donnees, catalogueAxes);
    if (classement.mecanisme === 'remplacement' || classement.mecanisme === 'redactionnel') {
      resultat.famille1.push(classement);
    } else if (classement.mecanisme === 'completude') {
      resultat.famille2.push(classement);
    } else if (classement.mecanisme === 'structure') {
      resultat.structure.push(classement);
    } else if (classement.mecanisme === 'hors-automatisation') {
      resultat.horsAutomatisation.push(classement);
    } else {
      resultat.horsModalite.push(classement);
    }
  });
  return resultat;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanClasserRecommandationAssistance: bilanClasserRecommandationAssistance,
    bilanRepartirRecommandationsAssistance: bilanRepartirRecommandationsAssistance
  };
}
