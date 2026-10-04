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

// Recherche verbatim -- un assistant qui reformule (mots differents,
// paraphrase) doit toujours echouer ce test, c'est le comportement voulu,
// voir prompts/bilan-v1.md section 5 : "copie mot pour mot... jamais
// reconstruit ni approxime". experiences : [{ index, poste, missions }]
// (jamais un champ concatene, voir hostDataAdapter.js) -- cherche dans
// poste PUIS missions, dans cet ordre, et rapporte lequel a matche
// (champ) : une future application automatique des propositions
// (evolution validee, non construite ici) aura besoin de savoir
// PRECISEMENT ou ecrire, pas seulement dans quelle experience.
// TACHE (retour Denis 2026-09-20, Carte 3 "Vos chiffres" disparue par
// intermittence) : jusqu'ici, la comparaison etait un indexOf() strict,
// meme un simple double espace, une casse differente ou une ponctuation
// legere (apostrophe courbe vs droite, espace avant un point) suffisait a
// faire echouer un extrait par ailleurs authentiquement verbatim --
// perdant alors silencieusement la recommandation (et sa phraseAChiffrer)
// vers "hors-automatisation". _bilanNormaliserExtrait() ne tolere QUE la
// mise en forme (espaces/casse/ponctuation legere) -- les MOTS doivent
// toujours etre identiques et dans le meme ordre (indexOf reste un test
// de sous-chaine strict sur le texte normalise), jamais une comparaison
// approximative/floue qui risquerait de rattacher a la mauvaise
// experience. Le test "extrait reformule (non verbatim)" (voir
// tests/bilanResolutionDestination.test.js) continue d'echouer comme
// avant : les mots y sont reellement differents, la normalisation n'y
// change rien.
// TACHE (retour Denis 2026-09-20, bug reel confirme avec un vrai JSON de
// diagnostic) : un extrait qui cite PLUSIEURS missions a la suite (ex.
// "Gestion des agendas\n\nOrganisation de reunions") echouait a matcher
// dossier.experiences[].missions, meme normalise -- l'assistant les
// separe par des retours a la ligne (double saut, tel qu'il percoit la
// liste), alors que joindreMissionsImport() (js/app.js) les joint par
// ". " (point + espace) cote code. Deux points, deux virgules ne sont
// jamais des MOTS differents : traites ici comme de simples separateurs
// interchangeables, au meme titre que les espaces. Consequence reelle du
// bug avant ce correctif : la recommandation tombait dans le repli sur
// l'axe (faute d'extrait retrouve), ouvrant un ecran totalement etranger
// a la correction demandee (ex. la fenetre "Candidature" pour une reco
// d'adequation, au lieu du bon panneau d'experience).
// TACHE (retour Denis 2026-09-20, bug reel confirme avec un vrai JSON de
// diagnostic) : un extrait qui cite une liste de missions commence parfois
// par une etiquette de rubrique ("Missions :", "Missions\n\n...") avant la
// liste elle-meme -- l'assistant introduit la citation avant de la
// recopier verbatim. Cette etiquette ne fait jamais partie du champ
// `missions` du dossier (qui ne contient QUE les missions), donc la
// recherche de sous-chaine echouait TOUJOURS des qu'elle etait presente --
// meme consequence que le bug des separateurs ci-dessus (repli silencieux
// sur l'axe, ouverture d'un ecran etranger a la recommandation, ex. la
// fenetre "Candidature" pour une reco de contenu d'experience). Une seule
// etiquette courte (2-30 caracteres) suivie de ':' est retiree en tete,
// jamais au milieu du texte (une vraie mission ne commence jamais par
// "quelque chose :" suivi du reste de la liste).
function _bilanNormaliserExtrait(texte) {
  return String(texte || '')
    .toLowerCase()
    .replace(/[‘’]/g, '\'')
    .replace(/[“”]/g, '"')
    .replace(/[.;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([.,;:!?])/g, '$1')
    .trim()
    .replace(/^[a-zàâäéèêëîïôöùûüç' -]{2,30}:\s*/, '');
}
function bilanTrouverExperienceParExtrait(extrait, experiences) {
  if (!extrait || !experiences || !experiences.length) { return null; }
  var extraitNormalise = _bilanNormaliserExtrait(extrait);
  if (!extraitNormalise) { return null; }
  for (var i = 0; i < experiences.length; i += 1) {
    var e = experiences[i];
    // TACHE (chantier "enrichissement CV legers via experiencesPerso",
    // 2026-08-22) : `experiences` peut desormais contenir des elements
    // provenant de dossier.experiencesPerso (voir hostDataAdapter.js) --
    // `liste` (deja porte par chaque element) est simplement propage,
    // jamais reinterprete ici (ce module ignore toujours d'ou vient e).
    if (e.poste && _bilanNormaliserExtrait(e.poste).indexOf(extraitNormalise) !== -1) { return { index: e.index, liste: e.liste || 'experiences', poste: e.poste, missions: e.missions, champ: 'poste' }; }
    if (e.missions && _bilanNormaliserExtrait(e.missions).indexOf(extraitNormalise) !== -1) { return { index: e.index, liste: e.liste || 'experiences', poste: e.poste, missions: e.missions, champ: 'missions' }; }
  }
  // TACHE (retour Denis 2026-09-20, bug reel confirme avec une vraie
  // capture d'ecran) : un extrait peut citer le poste PUIS enchainer,
  // colle, l'entreprise/les dates/toutes les missions ("Assistante
  // administrative Entreprise : ABC Services - BergeracPeriode : Mars
  // 2023 - Aujourd'hui Missions : ...") -- jamais une simple citation
  // d'UN champ, donc jamais trouve par les 2 tests ci-dessus (qui
  // cherchent l'extrait ENTIER dans le champ). 2e passe, UNIQUEMENT si la
  // 1ere n'a rien trouve : l'extrait commence-t-il par le poste d'une
  // experience (sens inverse -- le champ est contenu DANS l'extrait,
  // jamais l'inverse) ? Seuil de longueur (8 caracteres) pour eviter
  // qu'un intitule tres court et generique ("Agent", "Vendeur") ne
  // matche par coincidence un extrait sans rapport -- un rattachement a
  // la mauvaise experience serait pire que le repli sur l'axe qu'on
  // cherche justement a eviter ici.
  for (var j = 0; j < experiences.length; j += 1) {
    var e2 = experiences[j];
    if (!e2.poste) { continue; }
    var posteNormalise = _bilanNormaliserExtrait(e2.poste);
    if (posteNormalise.length >= 8 && extraitNormalise.indexOf(posteNormalise) === 0) {
      return { index: e2.index, liste: e2.liste || 'experiences', poste: e2.poste, missions: e2.missions, champ: 'poste' };
    }
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
