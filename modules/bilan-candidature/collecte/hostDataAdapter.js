/* ============================================================
   modules/bilan-candidature/collecte/hostDataAdapter.js
   ------------------------------------------------------------
   Seul fichier du module autorise a lire les donnees de l'application
   hote. Reutilise les points d'acces DEJA existants dans js/app.js
   plutot que de relire "dossier" directement (principe de reutilisation) :
     - texteProfilEffectif('cv')   -> texte du CV (respecte l'eventuelle
       version manuelle deja saisie par la personne, dossier.profilTexteManuel)
     - posteCibleActuel()          -> metier vise
     - entrepriseCibleActuelle()   -> entreprise ciblee

   IMPORTANT (verifie le 2026-08-08, PERIME depuis le 2026-08-25) :
   l'application ne stockait alors nulle part le TEXTE integral d'une
   offre d'emploi -- seulement un lien (dossier.rechercheCandidature.lienOffre).
   Ce n'est plus vrai : le chantier Coherence transversale memorise
   desormais ce texte (dossier.rechercheCandidature.texteOffre) -- voir
   lireOffreEmploi() plus bas, simple repli, la saisie libre au moment du
   Bilan (contexteCandidatureCollector.js) reste toujours prioritaire.

   IMPORTANT (decision du 2026-08-08, analyse/) : les dates de
   l'application sont saisies en ANNEE SEULE (menu deroulant d'annees,
   voir optionsAnneesCatalogue()/optionsAnneesPastilleEditable(),
   js/app.js -- jamais de mois). lireExperiencesDates() expose ces
   donnees structurees a l'usage EXCLUSIF de analyse/faitsExtractor.js :
   jamais envoyees au Prompt 1, jamais partie de Candidature -- une
   donnee, une seule source de verite, jamais recalculee depuis le texte
   du CV.

   TACHE (retour utilisateur : coherence anonymisation/alertes, 2026-08-10) :
   lireCoordonnees()/le champ coordonnees ont ete retires -- plus aucun
   consommateur depuis la suppression du detecteur associe
   (analyse/faitsExtractor.js). Le CV envoye au Prompt 1 n'a de toute
   facon jamais contenu ces informations (regle deja documentee
   ci-dessus, inchangee) ; voir prompts/bilan-v1.md, section 1, pour la
   consigne qui remplace desormais ce mecanisme.

   TACHE (chantier "continuite Diagnostic -> Correction", 2026-08-10 ;
   signal unifie RC-02, 2026-08-22) : lireExperiencesTexte()/
   lireStructurationDisponible() exposent respectivement le texte des
   experiences (poste + missions) et la disponibilite d'une structure
   editable (dossierAStructureExperiences(), js/app.js), a l'usage
   EXCLUSIF de correction/resolutionDestination.js et
   correction/parcoursCorrection.js -- meme regle que lireExperiencesDates
   ci-dessus, jamais envoyees au Prompt 1, jamais partie de Candidature.

   Design : les lecteurs sont injectables (parametre optionnel) pour
   rester testable sans dependre de app.js (23000 lignes, effets de bord
   au chargement) -- dans le navigateur, l'appel sans argument utilise les
   vraies fonctions globales, deja chargees avant ce fichier.
   ============================================================ */

function bilanLecteursParDefaut() {
  return {
    // TACHE (chantier "titre et accroche du CV", 2026-08-25, correctif de
    // coherence) : texteProfil('cv') (js/app.js) n'inclut JAMAIS
    // dossier.ia.cv.profil pour type === 'cv' (choix delibere, distinct --
    // "le CV n'a pas a se referencer sa propre strategie avant meme
    // qu'elle existe", voir sa section STRATEGIE). Une accroche DEJA
    // ECRITE n'est pourtant pas une strategie a venir : c'est un contenu
    // existant que la dimension `personnalisation` (prompts/bilan-v1.md)
    // pretend evaluer, sans jamais le recevoir -- incoherence trouvee en
    // creusant la demande de Denis. Corrige ICI, jamais dans texteProfil()
    // lui-meme : cette derniere est PARTAGEE avec l'ancien module "Creer
    // un CV avec l’assistant" (meme type 'cv') -- la modifier changerait aussi ce
    // qu'il recoit, contraire a la regle "aucun autre parcours impacte"
    // (voir memoire de session). Simple ajout en fin de texte, jamais une
    // reecriture de texteProfil().
    lireCv: function () {
      var texteBase = typeof texteProfilEffectif === 'function' ? (texteProfilEffectif('cv') || '') : '';
      var accrocheExistante = (typeof dossier !== 'undefined' && dossier.ia && dossier.ia.cv && dossier.ia.cv.profil) || '';
      if (!accrocheExistante) { return texteBase; }
      return texteBase + '\n\nPHRASE D’ACCROCHE DÉJÀ PRÉSENTE SUR CE CV (à évaluer comme le reste, notamment pour la dimension personnalisation) :\n' + accrocheExistante;
    },
    lireMetierVise: function () {
      return typeof posteCibleActuel === 'function' ? (posteCibleActuel() || '') : '';
    },
    lireEntrepriseCiblee: function () {
      return typeof entrepriseCibleActuelle === 'function' ? (entrepriseCibleActuelle() || '') : '';
    },
    // TACHE (chantier "Coherence transversale CV/lettre/entretien",
    // 2026-08-25) : site internet de l'entreprise ciblee, deja saisi
    // SEPAREMENT du lien d'offre par un chantier anterieur (siteCibleActuel(),
    // js/app.js) -- jamais recreee ici, memes principe que lireEntrepriseCiblee.
    // Sert a consigner au prompt d'aller rechercher les valeurs/le secteur de
    // l'entreprise, meme mecanisme deja utilise par prompts/entretien.md.
    // TACHE (ciblage offre d'emploi, 2026-08-24, prolongee 2026-08-25) :
    // site internet de l'entreprise ciblee, deja saisi SEPAREMENT du lien
    // d'offre par ce chantier (siteCibleActuel(), js/app.js) -- permet de
    // pre-remplir saisieLibre.siteEntreprise sur l'ecran de ciblage
    // (contexteCandidatureCollector.js), meme principe que
    // lireEntrepriseCiblee juste au-dessus. Usage independant du chantier
    // "Coherence transversale" (deplace vers un module separe, voir
    // docs/CHANTIER_COHERENCE_TRANSVERSALE_SYNTHESE.md) -- conserve ici,
    // la V1 du Bilan en a sa propre utilite (personnalisation/adequation).
    lireSiteEntreprise: function () {
      return typeof siteCibleActuel === 'function' ? (siteCibleActuel() || '') : '';
    },
    // TACHE (transfert Coherence transversale -> Bilan, 2026-08-25,
    // DECISION DE DENIS) : dossier.rechercheCandidature.texteOffre existe
    // depuis le chantier Coherence transversale (memoire app-wide, meme
    // principe que entreprise/site juste au-dessus) -- l'ancienne regle
    // "offreEmploi ne peut jamais venir de cette couche" (voir en-tete de
    // fichier, ecrite le 2026-08-08) est desormais perimee : le texte
    // integral existe bel et bien quelque part depuis cette date. Simple
    // repli (saisieLibre reste prioritaire, voir contexteCandidatureCollector.js) --
    // jamais un remplacement de la saisie libre existante.
    lireOffreEmploi: function () {
      return (typeof dossier !== 'undefined' && dossier.rechercheCandidature && dossier.rechercheCandidature.texteOffre) || '';
    },
    // TACHE (transfert Coherence transversale -> Bilan, 2026-08-25,
    // DECISION DE DENIS) : type de structure, memorise app-wide par
    // Coherence transversale (dossier.rechercheCandidature.typeStructure,
    // meme principe que texteOffre juste au-dessus) -- inconnu de ce champ
    // avant ce chantier, jamais lu ici.
    lireTypeStructure: function () {
      return (typeof dossier !== 'undefined' && dossier.rechercheCandidature && dossier.rechercheCandidature.typeStructure) || '';
    },
    // TACHE (posture prioritaire pour profil reconversion/debutant,
    // 2026-08-24, DECISION DE DENIS) : dossier.objectif est deja rempli
    // par l'ecran "Pourquoi etes-vous ici ?" (js/app.js, pageObjectif())
    // pour toute personne venue par le parcours normal -- jamais relu
    // ailleurs, jamais recalcule.
    lireObjectifCandidature: function () {
      return (typeof dossier !== 'undefined' && dossier.objectif) || null;
    },
    // Nombre d'experiences PROFESSIONNELLES uniquement (jamais
    // experiencesPerso) -- un profil "premier emploi" peut tres bien
    // avoir des experiences personnelles/benevoles, precisement la
    // matiere sur laquelle son savoir-etre s'appuierait le plus.
    lireNombreExperiencesProfessionnelles: function () {
      return (typeof dossier !== 'undefined' && (dossier.experiences || []).length) || 0;
    },
    // Reutilise extraireDonneesCV(dossier) (modules/cv-core/extraireDonneesCV.js) --
    // meme source normalisee que normaliserDonneesCV(), jamais une
    // deuxieme lecture parallele de dossier.experiences.
    lireExperiencesDates: function () {
      if (typeof extraireDonneesCV !== 'function' || typeof dossier === 'undefined') { return []; }
      var donnees = extraireDonneesCV(dossier);
      return (donnees.experiences || [])
        .map(function (e) {
          return {
            dateDebut: e.dateDebut ? parseInt(e.dateDebut, 10) : null,
            dateFin: e.dateFin ? parseInt(e.dateFin, 10) : null
          };
        })
        .filter(function (e) { return e.dateDebut !== null && !isNaN(e.dateDebut); });
    },
    // TACHE (chantier "continuite Diagnostic -> Correction", 2026-08-10) :
    // a l'usage EXCLUSIF de correction/resolutionDestination.js -- jamais
    // envoye au Prompt 1, jamais partie de Candidature (meme regle que
    // lireExperiencesDates ci-dessus).
    // DECISION (verifiee avec l'utilisateur, brique 4 -- evolutivite) :
    // poste et missions restent SEPARES, jamais concatenes en un seul
    // "texte". Un champ concatene aurait suffi pour la recherche de
    // extraitConcerne (brique 1), mais aurait perdu l'information "dans
    // quel champ precis le trouve-t-on" -- exactement ce qu'une future
    // application automatique des propositions (evolution validee,
    // deliberement non construite maintenant) aurait besoin de retrouver
    // pour savoir OU ecrire. Cout de cette decision : nul aujourd'hui
    // (resolutionDestination.js cherche deja dans les deux champs
    // separement, voir ce fichier) -- evite un refactor de cette couche
    // le jour ou cette evolution sera construite.
    // TACHE (chantier "enrichissement CV legers via experiencesPerso",
    // 2026-08-22, DECISION DE DENIS -- verification d'architecture prealable
    // faite : destination.index n'est jamais utilise comme identifiant
    // global ailleurs dans le module, voir memoire de session) : combine
    // desormais dossier.experiences ET dossier.experiencesPerso en UNE
    // seule liste -- chaque element porte son propre `liste`/`index`
    // (position REELLE dans SON tableau d'origine, jamais une position
    // dans la liste combinee) pour que l'ecriture finale (ecritureRelecture.js)
    // sache toujours precisement ou ecrire. SEUL endroit du module qui
    // normalise poste/intitule (dossier.experiencesPerso n'a pas de champ
    // "poste", voir CONFIG_EXPERIENCES_PERSO/js/app.js) -- toute la
    // resolution en aval (resolutionDestination.js, resolutionChampExperience.js,
    // orchestrationAssistance.js) manipule ensuite un seul vocabulaire
    // "poste"/"missions", jamais experiencesPerso par son nom.
    lireExperiencesTexte: function () {
      if (typeof dossier === 'undefined') { return []; }
      var pro = (dossier.experiences || []).map(function (e, index) {
        return { liste: 'experiences', index: index, poste: e.poste || '', missions: e.missions || '' };
      });
      var perso = (dossier.experiencesPerso || []).map(function (e, index) {
        return { liste: 'experiencesPerso', index: index, poste: e.intitule || '', missions: e.missions || '' };
      });
      return pro.concat(perso);
    },
    // TACHE (RC-02, Vague 3, 2026-08-22) : remplace lireModeCreation() --
    // dossier.modeCreation === 'pret' n'etait qu'un indice indirect, pas
    // la vraie question ("y a-t-il une structure editable ?"), et ce
    // signal s'est retrouve duplique independamment dans 3 fichiers
    // (resolutionDestination.js, parcoursCorrection.js, et pageResultats()
    // pour l'affichage) avant d'etre unifie ici. dossierAStructureExperiences()
    // (js/app.js) est desormais la SEULE fonction qui repond a cette
    // question -- ce lecteur ne fait que la relayer, jamais la recalculer.
    lireStructurationDisponible: function () {
      return typeof dossierAStructureExperiences === 'function' && dossierAStructureExperiences();
    }
  };
}

// Retourne toujours la meme forme, champs a null si absents -- jamais
// undefined, jamais une cle manquante (CONTRATS.md, garantie de hostDataAdapter).
function bilanLireDonneesBrutesCandidat(lecteurs) {
  lecteurs = lecteurs || bilanLecteursParDefaut();
  return {
    cv: lecteurs.lireCv() || '',
    metierVise: lecteurs.lireMetierVise() || null,
    entrepriseCiblee: lecteurs.lireEntrepriseCiblee() || null,
    // TACHE (ciblage offre d'emploi, 2026-08-24, prolongee 2026-08-25) :
    // siteEntreprise (contrat additif, voir CONTRATS.md).
    siteEntreprise: (lecteurs.lireSiteEntreprise && lecteurs.lireSiteEntreprise()) || null,
    offreEmploi: (lecteurs.lireOffreEmploi && lecteurs.lireOffreEmploi()) || null,
    typeStructure: (lecteurs.lireTypeStructure && lecteurs.lireTypeStructure()) || null,
    objectif: (lecteurs.lireObjectifCandidature && lecteurs.lireObjectifCandidature()) || null,
    nombreExperiencesProfessionnelles: (lecteurs.lireNombreExperiencesProfessionnelles && lecteurs.lireNombreExperiencesProfessionnelles()) || 0
  };
}

// Reservee a analyse/faitsExtractor.js -- ne fait jamais partie de
// Candidature ni du texte envoye au Prompt 1 (voir en-tete de fichier).
function bilanLireDonneesStructureesAnalyse(lecteurs) {
  lecteurs = lecteurs || bilanLecteursParDefaut();
  return {
    experiencesDates: lecteurs.lireExperiencesDates ? lecteurs.lireExperiencesDates() : []
  };
}

// Reservee a correction/resolutionDestination.js (chantier "continuite
// Diagnostic -> Correction", 2026-08-10) -- meme principe que
// bilanLireDonneesStructureesAnalyse ci-dessus : une fonction dediee par
// consommateur, jamais un fourre-tout partage.
function bilanLireDonneesStructureesCorrection(lecteurs) {
  lecteurs = lecteurs || bilanLecteursParDefaut();
  return {
    experiencesTexte: (lecteurs.lireExperiencesTexte && lecteurs.lireExperiencesTexte()) || [],
    structurationDisponible: !!(lecteurs.lireStructurationDisponible && lecteurs.lireStructurationDisponible())
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanLecteursParDefaut: bilanLecteursParDefaut,
    bilanLireDonneesBrutesCandidat: bilanLireDonneesBrutesCandidat,
    bilanLireDonneesStructureesAnalyse: bilanLireDonneesStructureesAnalyse,
    bilanLireDonneesStructureesCorrection: bilanLireDonneesStructureesCorrection
  };
}
