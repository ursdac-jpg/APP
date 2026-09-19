/* ============================================================
   modules/bilan-candidature/index.js
   ------------------------------------------------------------
   Facade publique du module -- seul fichier destine a etre importe
   par un consommateur externe (app.js, ou tout autre projet hote).
   Assemblage pur : aucune logique metier, aucune adaptation
   specifique a l'application actuelle -- tout ca vit deja dans
   core/moduleOrchestrator.js et collecte/hostDataAdapter.js.

   API limitee a 9 fonctions (revue d'architecture du 2026-08-09, voir
   CONTRATS.md ; bilanObtenirCatalogueAxes ajoutee le 2026-08-09,
   integration app.js increment 3 -- besoin reel et demontre : le rendu du
   rapport doit resoudre axeId -> nom lisible sans dupliquer le catalogue
   des 10 axes, deja source de verite partagee avec prompts/bilan-v1.md ;
   bilanRecommencerDiagnostic ajoutee le 2026-08-10, chantier "continuite
   Diagnostic -> Correction", brique 5 -- besoin reel et demontre : l'ecran
   de cloture du parcours de correction ("Analyser a nouveau mon CV") doit
   pouvoir reinitialiser candidature/diagnostic pour en demarrer un nouveau,
   operation qu'aucune des 6 fonctions precedentes ne couvrait ;
   bilanExporterEtatPourSauvegarde/bilanRestaurerEtatDepuisSauvegarde
   ajoutees le 2026-08-25, chantier "disquette" -- ce module garde son etat
   hors de `dossier`, invisible a la sauvegarde de session sans ce contrat
   standard, le meme pour chaque module dans ce cas) :
     - bilanDemarrerDiagnostic / bilanSoumettreReponseDiagnostic
     - bilanDemanderAmelioration / bilanSoumettreReponseAmelioration
     - bilanObtenirDiagnostic
     - bilanObtenirCatalogueAxes
     - bilanRecommencerDiagnostic
     - bilanExporterEtatPourSauvegarde / bilanRestaurerEtatDepuisSauvegarde

   Volontairement absent, et pourquoi :
     - bilanObtenirCandidature : la Candidature n'a pas de cycle de
       vie propre dans le module -- simple valeur d'entree, jamais
       referencee ailleurs que par Diagnostic.candidatureId. Ses
       champs (cv, metierVise, entrepriseCiblee) sont deja possedes
       par l'appelant avant l'appel (ils viennent de son propre etat
       ou d'une saisie qu'il a fournie) : une API publique expose ce
       qu'elle seule sait produire, jamais l'echo de ce qu'on lui a
       donne. Le Diagnostic, lui, est la seule chose que le module
       sait produire.
     - bilanObtenirDemandeAmelioration / bilanObtenirPropositionAmelioration :
       toujours retournees directement a l'appelant qui les cree
       (bilanDemanderAmelioration / bilanSoumettreReponseAmelioration).
       Stockees en dictionnaire indexe par id (relations multiples,
       independantes), jamais en slot unique -- aucun consommateur ne
       peut se retrouver avec un id sans deja avoir l'objet.
     - bilanReinitialiserPourTests : reservee aux tests du module,
       jamais une operation metier qu'un consommateur externe aurait
       une raison legitime d'appeler.
   Ces fonctions restent atteignables en important
   core/moduleOrchestrator.js directement, si un besoin reel apparait.
   ============================================================ */

if (typeof module !== 'undefined') {
  var _bilanOrchestrator = require('./core/moduleOrchestrator.js');

  module.exports = {
    bilanDemarrerDiagnostic: _bilanOrchestrator.bilanDemarrerDiagnostic,
    bilanSoumettreReponseDiagnostic: _bilanOrchestrator.bilanSoumettreReponseDiagnostic,
    bilanDemanderAmelioration: _bilanOrchestrator.bilanDemanderAmelioration,
    bilanSoumettreReponseAmelioration: _bilanOrchestrator.bilanSoumettreReponseAmelioration,
    bilanObtenirDiagnostic: _bilanOrchestrator.bilanObtenirDiagnostic,
    bilanObtenirCatalogueAxes: _bilanOrchestrator.bilanObtenirCatalogueAxes,
    bilanRecommencerDiagnostic: _bilanOrchestrator.bilanRecommencerDiagnostic,
    // TACHE (disquette -- couverture des modules isoles, 2026-08-25,
    // DECISION DE DENIS) : 2 fonctions ajoutees au contrat public (9 au
    // total desormais), meme paire "exporter/restaurer" que Cohérence
    // transversale -- js/app.js les appelle sans connaitre l'etat interne.
    bilanExporterEtatPourSauvegarde: _bilanOrchestrator.bilanExporterEtatPourSauvegarde,
    bilanRestaurerEtatDepuisSauvegarde: _bilanOrchestrator.bilanRestaurerEtatDepuisSauvegarde
  };
}
