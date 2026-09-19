/* ============================================================
   modules/bilan-candidature/correction/resolutionDestination.js
   ------------------------------------------------------------
   TACHE (chantier "continuite Diagnostic -> Correction", conception
   validee le 2026-08-10) : pour une Recommandation donnee, determine
   VERS OU renvoyer la personne dans ERIP pour la corriger.

   Cascade validee avec l'utilisateur, jamais l'inverse, jamais les
   deux a la fois :
     1. extraitConcerne, s'il est retrouve MOT POUR MOT (verbatim) dans
        une experience du dossier -> ciblage precis de cette experience.
     2. sinon (extrait absent, ou fourni mais introuvable tel quel) ->
        repli sur dimensionsLiees, via destinationRegistry.js.

   Absence de structure editable (structurationDisponible === false,
   voir dossierAStructureExperiences(), js/app.js -- couvre la population
   'pret' ET tout CV jamais structure, ex. le parcours "Bilan seul" de
   RC-02) : court-circuite la cascade entierement. Aucun editeur
   structure par champ n'est disponible dans ce cas, donc aucune
   resolution precise n'a de sens : la destination est toujours
   'texte-libre'.

   Fonction pure, aucune dependance DOM -- toutes les donnees necessaires
   sont injectees (jamais une lecture directe de `dossier`, reservee a
   collecte/hostDataAdapter.js).

   EVOLUTIVITE (verifiee avec l'utilisateur, brique 4) : ce module ne
   construit aucune application automatique de correction -- seulement
   une navigation manuelle, la personne garde systematiquement la main.
   Une evolution future (choix explicite "j'ai besoin d'aide" -> ERIP
   applique les propositions deja validees du Prompt 2, genere une
   nouvelle version, la personne relit/accepte/modifie/refuse avant tout
   export) resterait compatible SANS refactor de cette couche : le
   resultat 'extrait' porte deja { index, champ } -- assez pour ecrire
   PRECISEMENT dossier.experiences[index][champ] plus tard, jamais
   construit ici. Voir bilanTrouverExperienceParExtrait() ci-dessous.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanDestReg = require('./destinationRegistry.js');
  var bilanChoisirAxePrincipal = _bilanDestReg.bilanChoisirAxePrincipal;
  var bilanDestinationPourAxe = _bilanDestReg.bilanDestinationPourAxe;
}

// Recherche verbatim, insensible a une casse/accentuation identique
// (aucune normalisation -- un assistant qui reformule meme legerement doit
// echouer ce test, c'est le comportement voulu, voir prompts/bilan-v1.md
// section 5 : "copie mot pour mot... jamais reconstruit ni approxime").
// experiences : [{ index, poste, missions }] (jamais un champ concatene,
// voir hostDataAdapter.js) -- cherche dans poste PUIS missions, dans cet
// ordre, et rapporte lequel a matche (champ) : une future application
// automatique des propositions (evolution validee, non construite ici)
// aura besoin de savoir PRECISEMENT ou ecrire, pas seulement dans quelle
// experience.
function bilanTrouverExperienceParExtrait(extrait, experiences) {
  if (!extrait || !experiences || !experiences.length) { return null; }
  for (var i = 0; i < experiences.length; i += 1) {
    var e = experiences[i];
    // TACHE (chantier "enrichissement CV legers via experiencesPerso",
    // 2026-08-22) : `experiences` peut desormais contenir des elements
    // provenant de dossier.experiencesPerso (voir hostDataAdapter.js) --
    // `liste` (deja porte par chaque element) est simplement propage,
    // jamais reinterprete ici (ce module ignore toujours d'ou vient e).
    if (e.poste && e.poste.indexOf(extrait) !== -1) { return { index: e.index, liste: e.liste || 'experiences', poste: e.poste, missions: e.missions, champ: 'poste' }; }
    if (e.missions && e.missions.indexOf(extrait) !== -1) { return { index: e.index, liste: e.liste || 'experiences', poste: e.poste, missions: e.missions, champ: 'missions' }; }
  }
  return null;
}

// recommandation : { extraitConcerne, dimensionsLiees, ... } (voir
// modeles/recommandation.js). donnees : { experiencesTexte, structurationDisponible }
// (voir hostDataAdapter.bilanLireDonneesStructureesCorrection). catalogueAxes :
// BILAN_CATALOGUE_AXES (injecte, jamais relu globalement).
// Retourne toujours une forme, jamais null : { type, cible, libelle }.
//   type: 'extrait' | 'axe' | 'texte-libre'
//   cible: pour 'extrait', l'experience trouvee { index, poste, missions, champ } ;
//          pour 'axe', l'identifiant technique (destinationRegistry.js) ;
//          pour 'texte-libre', null.
function bilanResoudreDestinationCorrection(recommandation, donnees, catalogueAxes) {
  donnees = donnees || {};
  var experiencesTexte = donnees.experiencesTexte || [];

  // TACHE (RC-02, Vague 3, 2026-08-22) : anciennement "donnees.modeCreation
  // === 'pret'" -- ce n'etait qu'un indice indirect (une population), pas
  // la vraie question (une structure editable existe-t-elle reellement ?).
  // Signal desormais unifie avec pageResultats()/parcoursCorrection.js via
  // dossierAStructureExperiences() (js/app.js), relaye ici par hostDataAdapter.js.
  if (!donnees.structurationDisponible) {
    return { type: 'texte-libre', cible: null, libelle: 'Le texte complet de votre CV' };
  }

  if (recommandation && recommandation.extraitConcerne) {
    var experience = bilanTrouverExperienceParExtrait(recommandation.extraitConcerne, experiencesTexte);
    if (experience) {
      return { type: 'extrait', cible: experience, libelle: experience.poste || 'Expérience concernée' };
    }
  }

  var axePrincipal = bilanChoisirAxePrincipal((recommandation && recommandation.dimensionsLiees) || [], catalogueAxes || []);
  var destination = axePrincipal ? bilanDestinationPourAxe(axePrincipal) : null;
  if (destination) {
    // 'texte-libre' est une cible comme une autre dans le catalogue
    // (voir destinationRegistry.js, axe lisibilite) -- jamais un ecran
    // ni un surlignage precis, meme type que la branche
    // structurationDisponible ci-dessus. Un seul type de resultat pour
    // "aucune navigation ciblee, relecture du CV complet", quelle qu'en
    // soit la raison.
    if (destination.cible === 'texte-libre') {
      return { type: 'texte-libre', cible: null, libelle: destination.libelle };
    }
    return { type: 'axe', cible: destination.cible, libelle: destination.libelle };
  }

  // Defense en profondeur : ne devrait jamais arriver (dimensionsLiees
  // deja valide par diagnosticResponseParser.js, tous les axes connus
  // ont une entree dans destinationRegistry.js) -- mais jamais de throw
  // ici, ce module ne doit jamais faire echouer l'affichage d'une
  // recommandation par ailleurs valide.
  return { type: 'texte-libre', cible: null, libelle: 'Le texte complet de votre CV' };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanTrouverExperienceParExtrait: bilanTrouverExperienceParExtrait,
    bilanResoudreDestinationCorrection: bilanResoudreDestinationCorrection
  };
}
