/* ============================================================
   modules/bilan-candidature/core/moduleOrchestrator.js
   ------------------------------------------------------------
   Orchestrateur PUR. Enchaine les appels deja ecrits dans collecte/,
   analyse/, diagnostic/, amelioration/, met a jour diagnosticStore,
   propage les erreurs metier telles quelles. AUCUNE regle metier,
   AUCUNE optimisation, AUCUNE interpretation des objets qui circulent.

   Regle de non-duplication appliquee strictement : une condition n'est
   verifiee ICI que si AUCUNE couche appelee ne la verifie deja. Exemple
   concret -- bilanDemanderAmelioration() ne teste jamais si le
   diagnostic est complet : bilanConstruireDemandeAmelioration()
   (amelioration/selectionAmeliorationManager.js) le fait deja et leve
   RecommandationInexistante. Ajouter un controle ici aurait ete une
   duplication de regle metier deja presente ailleurs -- exactement ce
   qui devait etre evite.

   SequenceInvalide n'est levee que pour des etapes dont AUCUNE couche
   ne peut avoir connaissance : "a-t-on bien genere un diagnostic avant
   d'en soumettre la reponse ?" -- ni diagnosticResponseParser.js (qui ne
   recoit meme pas l'objet Diagnostic, seulement du texte + un niveau) ni
   aucune autre couche ne peut le savoir. C'est la seule erreur qui
   appartient en propre a ce fichier.
   ============================================================ */

if (typeof require !== 'undefined') {
  // CORRECTION (bug reel trouve a l'integration navigateur, 2026-08-09) :
  // contrairement a toutes les autres dependances de ce fichier, _bilanStore
  // n'avait jamais recu d'alias individuels par fonction -- les appels
  // utilisaient _bilanStore.bilanStoreXxx(...) directement. Sous Node
  // (tests), require() peuple _bilanStore et ca fonctionne. Dans le
  // navigateur, ce bloc entier est ignore (pas de require()) : _bilanStore
  // restait undefined, et le premier appel plantait reellement (jamais
  // detecte par les 218 tests, tous executes sous Node). Meme motif que les
  // 10 autres dependances ci-dessous desormais applique ici aussi : chaque
  // fonction du store recoit son propre alias bare-name, seul mecanisme qui
  // fonctionne aussi bien sous Node (le var local masque le nom) que dans
  // le navigateur (le var non assigne, jamais execute, ne redefinit jamais
  // la fonction globale deja chargee par diagnosticStore.js).
  var _bilanStore = require('./diagnosticStore.js');
  var bilanStoreDefinirCandidature = _bilanStore.bilanStoreDefinirCandidature;
  var bilanStoreObtenirCandidature = _bilanStore.bilanStoreObtenirCandidature;
  var bilanStoreMettreAJourCvCandidature = _bilanStore.bilanStoreMettreAJourCvCandidature;
  var bilanStoreMettreAJourPointsDejaConnusCandidature = _bilanStore.bilanStoreMettreAJourPointsDejaConnusCandidature;
  var bilanStoreDefinirDiagnostic = _bilanStore.bilanStoreDefinirDiagnostic;
  var bilanStoreObtenirDiagnostic = _bilanStore.bilanStoreObtenirDiagnostic;
  var bilanStoreAbandonnerDiagnostic = _bilanStore.bilanStoreAbandonnerDiagnostic;
  var bilanStoreAjouterDemandeAmelioration = _bilanStore.bilanStoreAjouterDemandeAmelioration;
  var bilanStoreObtenirDemandeAmelioration = _bilanStore.bilanStoreObtenirDemandeAmelioration;
  var bilanStoreAjouterPropositionAmelioration = _bilanStore.bilanStoreAjouterPropositionAmelioration;
  var bilanStoreObtenirPropositionAmelioration = _bilanStore.bilanStoreObtenirPropositionAmelioration;
  var bilanStoreReinitialiser = _bilanStore.bilanStoreReinitialiser;
  var bilanStoreExporterEtat = _bilanStore.bilanStoreExporterEtat;
  var bilanStoreRestaurerEtat = _bilanStore.bilanStoreRestaurerEtat;
  var _bilanCCC_MO = require('../collecte/contexteCandidatureCollector.js');
  var bilanCollecterCandidature = _bilanCCC_MO.bilanCollecterCandidature;
  var bilanCollecterDonneesStructureesAnalyse = _bilanCCC_MO.bilanCollecterDonneesStructureesAnalyse;
  var _bilanNAD_MO = require('../analyse/niveauAnalyseDetector.js');
  var bilanDeterminerNiveauAnalyse = _bilanNAD_MO.bilanDeterminerNiveauAnalyse;
  var _bilanFE_MO = require('../analyse/faitsExtractor.js');
  var bilanExtraireFaits = _bilanFE_MO.bilanExtraireFaits;
  var _bilanAAR_MO = require('../analyse/axeAnalyseRegistry.js');
  var bilanObtenirCatalogueAxes = _bilanAAR_MO.bilanObtenirCatalogueAxes;
  var _bilanCA_MO = require('../modeles/contexteAnalyse.js');
  var bilanCreerContexteAnalyse = _bilanCA_MO.bilanCreerContexteAnalyse;
  var _bilanDiagModele_MO = require('../modeles/diagnostic.js');
  var bilanCreerDiagnostic = _bilanDiagModele_MO.bilanCreerDiagnostic;
  var bilanMarquerDiagnosticComplet = _bilanDiagModele_MO.bilanMarquerDiagnosticComplet;
  var bilanMarquerDiagnosticEchecParsing = _bilanDiagModele_MO.bilanMarquerDiagnosticEchecParsing;
  var _bilanPTL_MO = require('../diagnostic/promptTemplateLoader.js');
  var bilanChargerTemplate = _bilanPTL_MO.bilanChargerTemplate;
  var _bilanDPB_MO = require('../diagnostic/diagnosticPromptBuilder.js');
  var bilanConstruirePromptDiagnostic = _bilanDPB_MO.bilanConstruirePromptDiagnostic;
  var _bilanDRP_MO = require('../diagnostic/diagnosticResponseParser.js');
  var bilanParserReponseDiagnostic = _bilanDRP_MO.bilanParserReponseDiagnostic;
  var _bilanSAM_MO = require('../amelioration/selectionAmeliorationManager.js');
  var bilanConstruireDemandeAmelioration = _bilanSAM_MO.bilanConstruireDemandeAmelioration;
  var _bilanAPB_MO = require('../amelioration/ameliorationPromptBuilder.js');
  var bilanConstruirePromptAmelioration = _bilanAPB_MO.bilanConstruirePromptAmelioration;
  var bilanConstruirePromptAmeliorationLot = _bilanAPB_MO.bilanConstruirePromptAmeliorationLot;
  var _bilanARP_MO = require('../amelioration/ameliorationResponseParser.js');
  var bilanParserReponseAmelioration = _bilanARP_MO.bilanParserReponseAmelioration;
  var bilanParserReponseAmeliorationLot = _bilanARP_MO.bilanParserReponseAmeliorationLot;
  var _bilanTAPB_MO = require('../amelioration/titreAccrochePromptBuilder.js');
  var bilanConstruirePromptTitreAccroche = _bilanTAPB_MO.bilanConstruirePromptTitreAccroche;
  var _bilanTARP_MO = require('../amelioration/titreAccrocheResponseParser.js');
  var bilanParserReponseTitreAccroche = _bilanTARP_MO.bilanParserReponseTitreAccroche;
  var _bilanUtil_MO = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtil_MO.bilanCreerErreurMetier;
}

// TACHE (retour au Prompt 1 seul, 2026-08-24 ; ABANDON DEFINITIF de la
// fusion, 2026-08-30, decision de Denis) : le prompt fusionne
// (prompts/bilan-v1-extraction-prototype.md) a montre en usage reel qu'il
// ne produit pas toujours le bloc d'extraction malgre la consigne de
// format (cas reel : reponse valide mais reduite au seul BLOC_DIAGNOSTIC,
// aucune trace de BLOC_EXTRACTION_CV) -- risque identifie des la
// conception (prompt combine tres long, consigne de format en toute fin),
// jamais fiable a 100%.
// 2026-08-30 : la fusion est DEFINITIVEMENT abandonnee. Le gain (supprimer
// un aller-retour IA pour le seul cas "CV en texte brut") ne vaut pas le
// risque qualite (le modele doit re-emettre tout le CV en JSON en plus de
// l'analyse). Le cas est desormais gere proprement par l'ecran "On
// organise votre CV" (htmlBilanAgirChoixContenu, Lot 4) + sa video (R8).
// Le prototype et le doc de test restent dans le depot en trace
// [ABANDONNE], jamais "prets a redeployer". Le handler ## BLOC_EXTRACTION_CV
// de js/app.js reste comme simple filet retrocompatible (dormant : le
// prompt actif ne produit jamais ce marqueur).
var BILAN_CHEMIN_PROMPT_1 = 'prompts/bilan-v1.md';
var BILAN_CHEMIN_PROMPT_2 = 'prompts/bilan-v2.md';
var BILAN_CHEMIN_PROMPT_2_LOT = 'prompts/bilan-v2-lot.md';
var BILAN_CHEMIN_PROMPT_TITRE_ACCROCHE = 'prompts/bilan-titre-accroche.md';

// TACHE (RC-02, architecture finale -- "une seule candidature, source de
// verite des l'entree", 2026-08-22) : separee de bilanDemarrerDiagnostic()
// ci-dessous -- deposer une candidature et lancer un diagnostic sont deux
// operations distinctes, jamais couplees. Le Bilan devient proprietaire
// de sa candidature des que le texte est obtenu (aligne sur l'ordre deja
// utilise par CV/Lettre/Entretien : relecture avant tout choix d'assistant,
// jamais apres). saisieLibre : { offreEmploi, entrepriseCiblee,
// siteEntreprise, typeStructure, typeStructureAutre } -- voir
// contexteCandidatureCollector.js. dependances : { collecte } (transmise
// telle quelle, voir bilanCollecterCandidature -- inclut notamment
// cvDejaRelu pour sauter une relecture deja faite ailleurs, ex. RC-02
// depot leger).
// Retourne une Promise<Candidature>.
function bilanDeposerCandidature(saisieLibre, dependances) {
  dependances = dependances || {};
  return bilanCollecterCandidature(saisieLibre, dependances.collecte).then(function (candidature) {
    bilanStoreDefinirCandidature(candidature);
    return candidature;
  });
}

// TACHE (meme chantier) : ne collecte plus rien -- opere UNIQUEMENT sur la
// candidature deja deposee (bilanDeposerCandidature() ci-dessus, appelee
// avant meme d'atteindre l'ecran du Bilan). dependances (toutes
// optionnelles) : { lecteursAnalyse, lecteurTemplate1, horodatage } --
// chacune transmise telle quelle a la couche concernee, jamais inspectee
// ici. Leve SequenceInvalide si aucune candidature n'est active -- ne
// devrait jamais arriver via le parcours normal (defense en profondeur).
// Retourne une Promise<Diagnostic> (statut 'genere').
function bilanDemarrerDiagnostic(dependances) {
  dependances = dependances || {};
  var candidature = bilanStoreObtenirCandidature();
  if (!candidature) {
    return Promise.reject(bilanCreerErreurMetier('SequenceInvalide', 'Aucune candidature deposee avant de lancer le diagnostic.'));
  }

  return Promise.resolve().then(function () {
    var niveauInfo = bilanDeterminerNiveauAnalyse(candidature);
    var donneesStructurees = bilanCollecterDonneesStructureesAnalyse(dependances.lecteursAnalyse);
    var observations = bilanExtraireFaits(donneesStructurees);
    var contexteAnalyse = bilanCreerContexteAnalyse({
      candidatureId: candidature.id,
      niveau: niveauInfo.niveau,
      donneesManquantes: niveauInfo.donneesManquantes,
      observations: observations
    });

    return bilanChargerTemplate(BILAN_CHEMIN_PROMPT_1, dependances.lecteurTemplate1).then(function (texteTemplate) {
      var promptDiagnostic = bilanConstruirePromptDiagnostic(texteTemplate, candidature, contexteAnalyse, dependances.horodatage);
      var diagnostic = bilanCreerDiagnostic({
        candidatureId: candidature.id,
        contexteAnalyse: contexteAnalyse,
        promptTexte: promptDiagnostic.texte,
        dateGeneration: promptDiagnostic.dateGeneration
      });
      bilanStoreDefinirDiagnostic(diagnostic);
      return diagnostic;
    });
  });
}

// dependances : { parser } -- transmise a bilanParserReponseDiagnostic.
// Retourne { diagnostic, anomalies }. Leve SequenceInvalide si aucun
// diagnostic n'attend de reponse ; propage sinon toute erreur levee par
// le parser (ReponseIllisible/ReponseIncomplete), apres avoir consigne
// l'echec dans le store -- jamais une erreur avalee ou retraduite.
function bilanSoumettreReponseDiagnostic(texteColle, dependances) {
  dependances = dependances || {};

  var diagnostic = bilanStoreObtenirDiagnostic();
  // TACHE (retour Denis, 2026-08-31, bug reel) : un NOUVEL essai apres un
  // echec de parsing est legitime. Le 1er echec fait passer le diagnostic a
  // 'echec_parsing', mais l'ecran "Collez la reponse" reste affiche et
  // invite explicitement a reessayer. Sans 'echec_parsing' accepte ici,
  // tout essai suivant (meme avec un JSON parfaitement valide) etait rejete
  // en SequenceInvalide -> la personne devait recommencer TOUT l'aller-retour
  // avec l'assistant. Le contexte necessaire (contexteAnalyse) est conserve
  // par bilanMarquerDiagnosticEchecParsing, la reprise est donc sans risque.
  if (!diagnostic || (diagnostic.statut !== 'genere' && diagnostic.statut !== 'echec_parsing')) {
    throw bilanCreerErreurMetier('SequenceInvalide', 'Aucun diagnostic en attente de réponse.', { statutActuel: diagnostic && diagnostic.statut });
  }

  var contexteParsing = {
    catalogueAxes: bilanObtenirCatalogueAxes(),
    niveauEnvoye: diagnostic.contexteAnalyse.niveau,
    observationsFactuelles: diagnostic.contexteAnalyse.observations
  };

  try {
    var sortie = bilanParserReponseDiagnostic(texteColle, contexteParsing, dependances.parser);
    var diagnosticComplet = bilanMarquerDiagnosticComplet(diagnostic, sortie.resultat, texteColle);
    bilanStoreDefinirDiagnostic(diagnosticComplet);
    return { diagnostic: diagnosticComplet, anomalies: sortie.anomalies };
  } catch (erreur) {
    var diagnosticEchec = bilanMarquerDiagnosticEchecParsing(diagnostic, texteColle);
    bilanStoreDefinirDiagnostic(diagnosticEchec);
    throw erreur;
  }
}

// idRecommandation, objectifs : voir selectionAmeliorationManager.js.
// dependances : { selection, lecteurTemplate2, horodatage }.
// Retourne TOUJOURS une Promise<{ demande, promptTexte }> -- y compris
// pour RecommandationInexistante/EtatIncoherent, jamais un throw
// synchrone melange a un retour asynchrone (meme bug deja corrige une
// fois sur contexteCandidatureCollector.js : un appelant qui ne fait que
// .catch() manquerait sinon ces erreurs). Aucune verification de
// sequence propre a cette fonction par ailleurs (voir en-tete du
// fichier) -- RecommandationInexistante vient entierement de
// bilanConstruireDemandeAmelioration.
function bilanDemanderAmelioration(idRecommandation, objectifs, dependances) {
  dependances = dependances || {};

  return Promise.resolve().then(function () {
    var diagnostic = bilanStoreObtenirDiagnostic();
    var demande = bilanConstruireDemandeAmelioration(diagnostic, idRecommandation, objectifs, dependances.selection);
    bilanStoreAjouterDemandeAmelioration(demande);

    return bilanChargerTemplate(BILAN_CHEMIN_PROMPT_2, dependances.lecteurTemplate2).then(function (texteTemplate) {
      // TACHE (ciblage offre d'emploi, 2026-08-24) : candidature deja
      // disponible dans le store de ce module -- meme donnee que
      // bilanObtenirCandidature() (passe-plat public), lue directement
      // ici pour eviter un aller-retour par l'appelant.
      var promptAmelioration = bilanConstruirePromptAmelioration(texteTemplate, demande, dependances.horodatage, bilanStoreObtenirCandidature());
      return { demande: demande, promptTexte: promptAmelioration.texte };
    });
  });
}

// idDemandeAmelioration : identifie la DemandeAmelioration concernee
// (retourne par bilanDemanderAmelioration). dependances : { parser }.
// Retourne une PropositionAmelioration. Aucune verification de sequence
// propre ici non plus : bilanParserReponseAmelioration gere deja le cas
// d'une demande absente via RecommandationInexistante.
function bilanSoumettreReponseAmelioration(idDemandeAmelioration, texteColle, dependances) {
  dependances = dependances || {};

  var demande = bilanStoreObtenirDemandeAmelioration(idDemandeAmelioration);
  var proposition = bilanParserReponseAmelioration(texteColle, demande, dependances.parser);
  bilanStoreAjouterPropositionAmelioration(proposition);
  return proposition;
}

// TACHE (point 11, stabilisation Bilan, 2026-08-22, DECISION DE DENIS --
// evolution raisonnable du mecanisme 1:1 existant, jamais une refonte) :
// idsRecommandations : tableau d'id de recommandations SELECTIONNEES
// (cases cochees par la personne). Construit UNE DemandeAmelioration par
// id EN BOUCLE ICI, exactement comme l'anticipait deja le commentaire de
// bilanConstruireDemandeAmelioration() (selectionAmeliorationManager.js :
// "pour plusieurs recommandations, l'appelant... appelle cette fonction
// plusieurs fois -- jamais une boucle interne ici") -- cette fonction EST
// cet appelant, ecrit maintenant. objectifsParId (optionnel) : { idReco:
// [objectifs] } -- un objectif eventuel reste propre a CHAQUE
// recommandation, jamais partage entre elles.
// TACHE (correctif "suggestion pertinente par experience", Carte 3,
// 2026-08-25) : chaque element de idsRecommandations accepte desormais
// SOIT une chaine (id de recommandation -- comportement inchange, utilise
// tel quel par la Carte 2), SOIT un objet { id, contexteDestination }
// (Carte 3, une recommandation appliquee a plusieurs experiences : une
// occurrence par experience, meme id de recommandation repete plusieurs
// fois, contexteDestination distingue chaque occurrence pour le prompt --
// voir ameliorationPromptBuilder.js). contexteDestination est attache
// APRES construction (jamais un champ du modele DemandeAmelioration
// lui-meme, voir modeles/demandeAmelioration.js -- reste une extension
// facultative propre a ce seul appelant).
// Retourne une Promise<{ demandes, promptTexte }>.
function bilanDemanderAmeliorationLot(idsRecommandations, objectifsParId, dependances) {
  dependances = dependances || {};
  objectifsParId = objectifsParId || {};

  return Promise.resolve().then(function () {
    var diagnostic = bilanStoreObtenirDiagnostic();
    var demandes = (idsRecommandations || []).map(function (item) {
      var id = (typeof item === 'string') ? item : item.id;
      var demande = bilanConstruireDemandeAmelioration(diagnostic, id, objectifsParId[id] || [], dependances.selection);
      bilanStoreAjouterDemandeAmelioration(demande);
      if (item && typeof item === 'object' && item.contexteDestination) { demande.contexteDestination = item.contexteDestination; }
      return demande;
    });

    return bilanChargerTemplate(BILAN_CHEMIN_PROMPT_2_LOT, dependances.lecteurTemplate2Lot).then(function (texteTemplate) {
      var promptLot = bilanConstruirePromptAmeliorationLot(texteTemplate, demandes, dependances.horodatage, bilanStoreObtenirCandidature());
      return { demandes: demandes, promptTexte: promptLot.texte };
    });
  });
}

// demandes : tableau des DemandeAmelioration retournees par
// bilanDemanderAmeliorationLot() ci-dessus (memes objets, jamais relus
// depuis le store par id -- eviterait une recherche redondante, l'appelant
// les a deja sous la main). dependances : { parser }.
// Retourne un tableau de PropositionAmelioration.
function bilanSoumettreReponseAmeliorationLot(demandes, texteColle, dependances) {
  dependances = dependances || {};
  var propositions = bilanParserReponseAmeliorationLot(texteColle, demandes, dependances.parser);
  propositions.forEach(function (p) { bilanStoreAjouterPropositionAmelioration(p); });
  return propositions;
}

// TACHE (chantier "titre et accroche du CV", 2026-08-25, conception
// validee avec Denis) : delibrement HORS du mecanisme
// DemandeAmelioration/PropositionAmelioration (bilanDemanderAmelioration/
// bilanDemanderAmeliorationLot ci-dessus) -- l'absence de titre/accroche
// n'est pas une recommandation du diagnostic, elle n'a donc pas d'id de
// recommandation a construire (voir titreAccrochePromptBuilder.js).
// N'ecrit rien dans bilanStoreAjouterDemandeAmelioration : rien a suivre
// entre l'appel et sa reponse, contrairement au mecanisme des
// recommandations (voir bilanSoumettreReponseTitreEtAccroche ci-dessous,
// qui ne lit rien du store non plus).
// contexte : { cv, metierVise, offreEmploi } -- transmis tel quel par
// l'appelant (app.js), jamais relu depuis le store ici (l'appelant peut
// vouloir surcharger metierVise avec une saisie facultative de la
// personne, voir cascade de contexte, memoire de session).
// dependances : { lecteurTemplate, horodatage }.
// Retourne une Promise<{ promptTexte }>.
function bilanDemanderTitreEtAccroche(contexte, dependances) {
  dependances = dependances || {};
  return bilanChargerTemplate(BILAN_CHEMIN_PROMPT_TITRE_ACCROCHE, dependances.lecteurTemplate).then(function (texteTemplate) {
    var prompt = bilanConstruirePromptTitreAccroche(texteTemplate, contexte || {}, dependances.horodatage);
    return { promptTexte: prompt.texte };
  });
}

// dependances : { parser }. Retourne { titre, accroches } (voir
// titreAccrocheResponseParser.js) -- jamais ecrit dans `dossier` ici,
// meme principe que bilanSoumettreReponseAmelioration ci-dessus :
// l'ecriture reste la responsabilite de l'appelant (app.js, via
// destination.liste = 'dossier', voir assistance/ecritureRelecture.js).
function bilanSoumettreReponseTitreEtAccroche(texteColle, dependances) {
  dependances = dependances || {};
  return bilanParserReponseTitreAccroche(texteColle, dependances.parser);
}

// Lectures -- seul point d'acces au store depuis l'exterieur du module
// (voir invariant 10, CONTRATS.md). Passe-plats stricts, aucune
// transformation.
function bilanObtenirCandidature() { return bilanStoreObtenirCandidature(); }
// TACHE (RC-02, architecture finale) : seul point d'ecriture d'une
// correction du texte de la candidature depuis l'exterieur du module --
// jamais un acces direct a diagnosticStore.js (invariant 10, CONTRATS.md).
// Distinct de deposer une nouvelle candidature : ne touche jamais au
// diagnostic ni a la progression de correction en cours.
function bilanMettreAJourCvCandidature(nouveauCv) { return bilanStoreMettreAJourCvCandidature(nouveauCv); }
// TACHE (chantier "ignorer un point du rapport", 2026-08-25) : appelee
// depuis app.js juste avant bilanRecommencerDiagnostic(), avec le texte
// des recommandations que la personne a choisi de garder ignorees (voir
// bilanFormaterPointsDejaConnus(), app.js) -- jamais calcule ici, ce
// module ne connait ni les recommandations ni dossier.bilanAlertesIgnorees.
function bilanMettreAJourPointsDejaConnusCandidature(pointsDejaConnus) { return bilanStoreMettreAJourPointsDejaConnusCandidature(pointsDejaConnus); }
function bilanObtenirDiagnostic() { return bilanStoreObtenirDiagnostic(); }
// TACHE (RC-03, « Retour un cran a la fois », 2026-09-10) : passe-plat --
// « Retour » depuis « Coller la reponse » abandonne le diagnostic en
// attente, garde la candidature. Jamais un acces direct a diagnosticStore
// depuis app.js (invariant 10, CONTRATS.md).
function bilanAbandonnerDiagnostic() { return bilanStoreAbandonnerDiagnostic(); }
function bilanObtenirDemandeAmelioration(id) { return bilanStoreObtenirDemandeAmelioration(id); }
function bilanObtenirPropositionAmelioration(idDemandeAmelioration) { return bilanStoreObtenirPropositionAmelioration(idDemandeAmelioration); }

// TACHE (integration app.js, increment 3 -- rendu du rapport) : lecture
// pure et sans effet de bord du catalogue statique des 10 axes (deja
// requis plus haut pour l'usage interne de bilanSoumettreReponseDiagnostic).
// Exposee publiquement pour que app.js resolve axeId -> nom lisible SANS
// dupliquer ce catalogue -- CONTRATS.md le documente deja comme source de
// verite partagee avec prompts/bilan-v1.md, une 3e copie serait un vrai
// risque de desynchronisation.

// Reservee aux tests : permet aux tests de moduleOrchestrator de
// reinitialiser l'etat partage entre deux cas, SANS jamais avoir besoin
// d'importer diagnosticStore.js directement -- garde l'invariant "seul
// moduleOrchestrator importe diagnosticStore" vrai y compris cote tests.
function bilanReinitialiserPourTests() { bilanStoreReinitialiser(); }

// TACHE (chantier "continuite Diagnostic -> Correction", brique 5,
// 2026-08-10 ; revu RC-02, 2026-08-22) : l'ecran de cloture ("Analyser a
// nouveau mon CV") a besoin d'un vrai "recommencer", operation metier
// legitime, jamais une reutilisation d'une fonction de test depuis app.js.
// CHANGEMENT (RC-02, "une seule candidature du debut a la fin") : ne
// reinitialise plus TOUT l'etat -- la candidature active (donc son cv,
// potentiellement deja corrige via bilanMettreAJourCvCandidature())
// est re-deposee telle quelle. bilanStoreDefinirCandidature() fait deja
// exactement ce qu'une reanalyse demande (nouveau cycle diagnostic/
// demandes/propositions, jamais deux fois le meme diagnostic pour une
// candidature) -- SANS perdre le texte, contrairement a
// bilanStoreReinitialiser() qui effacait tout, y compris la candidature
// elle-meme. bilanStoreReinitialiser() reste reservee aux tests et a un
// vrai nouveau depart (bilanReinitialiserPourTests ci-dessus) -- jamais
// appelee ici.
function bilanRecommencerDiagnostic() {
  var candidatureActuelle = bilanStoreObtenirCandidature();
  if (candidatureActuelle) { bilanStoreDefinirCandidature(candidatureActuelle); }
}

// TACHE (disquette -- couverture des modules isoles, 2026-08-25, DECISION
// DE DENIS) : contrat standard, meme nom de fonction dans chaque module
// concerne ("Xxx ExporterEtatPourSauvegarde"/"Xxx RestaurerEtatDepuisSauvegarde") --
// js/app.js les appelle sans jamais connaitre la forme interne de l'etat.
function bilanExporterEtatPourSauvegarde() { return bilanStoreExporterEtat(); }
function bilanRestaurerEtatDepuisSauvegarde(etat) { bilanStoreRestaurerEtat(etat); }

if (typeof module !== 'undefined') {
  module.exports = {
    bilanDeposerCandidature: bilanDeposerCandidature,
    bilanDemarrerDiagnostic: bilanDemarrerDiagnostic,
    bilanSoumettreReponseDiagnostic: bilanSoumettreReponseDiagnostic,
    bilanDemanderAmelioration: bilanDemanderAmelioration,
    bilanSoumettreReponseAmelioration: bilanSoumettreReponseAmelioration,
    bilanDemanderAmeliorationLot: bilanDemanderAmeliorationLot,
    bilanSoumettreReponseAmeliorationLot: bilanSoumettreReponseAmeliorationLot,
    bilanDemanderTitreEtAccroche: bilanDemanderTitreEtAccroche,
    bilanSoumettreReponseTitreEtAccroche: bilanSoumettreReponseTitreEtAccroche,
    bilanObtenirCandidature: bilanObtenirCandidature,
    bilanMettreAJourCvCandidature: bilanMettreAJourCvCandidature,
    bilanMettreAJourPointsDejaConnusCandidature: bilanMettreAJourPointsDejaConnusCandidature,
    bilanObtenirDiagnostic: bilanObtenirDiagnostic,
    bilanAbandonnerDiagnostic: bilanAbandonnerDiagnostic,
    bilanObtenirDemandeAmelioration: bilanObtenirDemandeAmelioration,
    bilanObtenirPropositionAmelioration: bilanObtenirPropositionAmelioration,
    bilanObtenirCatalogueAxes: bilanObtenirCatalogueAxes,
    bilanReinitialiserPourTests: bilanReinitialiserPourTests,
    bilanRecommencerDiagnostic: bilanRecommencerDiagnostic,
    bilanExporterEtatPourSauvegarde: bilanExporterEtatPourSauvegarde,
    bilanRestaurerEtatDepuisSauvegarde: bilanRestaurerEtatDepuisSauvegarde
  };
}
