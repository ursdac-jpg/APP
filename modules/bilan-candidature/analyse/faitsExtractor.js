/* ============================================================
   modules/bilan-candidature/analyse/faitsExtractor.js
   ------------------------------------------------------------
   Calcule les observations factuelles (deterministes) fournies au
   Prompt 1. Recoit UNIQUEMENT des donnees structurees deja lues par
   hostDataAdapter.bilanLireDonneesStructureesAnalyse() -- ne lit jamais
   Candidature.cv, ne recalcule jamais une donnee depuis du texte libre.

   =====================  COMPOSANT EXTENSIBLE  =====================
   Lire ce bloc avant d'ajouter, modifier ou juger obsolete un detecteur
   -- ecrit pour quelqu'un qui revient sur ce fichier sans le contexte
   de sa conception initiale.

   -- Ce qui existe aujourd'hui (V1, 2026-08-10) --
   Un detecteur, retenu parce qu'il alimente directement un declencheur
   du test de non-compensation (prompts/bilan-v1.md, section 4) -- pas
   parce qu'il semblait utile en general :
     - 'coherence_dates'  : chevauchement chronologique manifeste (une
       periode entierement incluse dans une autre).

   TACHE (retour utilisateur : coherence anonymisation/alertes, 2026-08-10) :
   l'ancien detecteur 'coordonnees' (telephone/email presents ou absents,
   lus depuis dossier.identite) est retire. Le CV envoye au Prompt 1 ne
   contient JAMAIS les coordonnees (voir hostDataAdapter.js, deja
   documente ainsi des l'origine) : ce detecteur alimentait donc un test
   de non-compensation qui se declenchait pour TOUT diagnostic Bilan,
   sans rapport avec la qualite reelle du CV -- l’assistant se voyait demander
   de signaler comme un defaut une absence que l'application elle-meme
   garantit, de facon permanente. Le prompt explique desormais ce
   contexte directement (section 1) plutot que de fournir une donnee
   destinee a etre traitee comme un risque.
   Tout le reste (rubriques, longueur, fautes, mots-cles, verbes
   d'action...) est deliberement absent : le modele lit `{CV}` en
   entier et peut le deriver lui-meme sans aide -- voir l'inventaire de
   donnees valide avant l'ecriture de collecte/ pour le raisonnement
   complet. Ne pas re-ajouter ces observations "par symetrie" sans
   qu'un besoin reel, observe via le protocole de test, le justifie.

   -- Comment ajouter une observation en V2 --
   1. Ecrire une fonction detecteur : bilanDetecterXxx(donneesStructurees)
      -> Observation[] (via bilanCreerObservationFactuelle()).
   2. L'inscrire dans BILAN_DETECTEURS_FAITS, plus bas dans ce fichier.
   3. Si le detecteur a besoin d'une donnee structuree qui n'existe pas
      encore dans donneesStructurees, l'ajouter cote
      collecte/hostDataAdapter.js (bilanLireDonneesStructureesAnalyse) --
      jamais en parsant Candidature.cv depuis ce fichier.
   4. Mettre a jour prompts/bilan-v1.md pour que le modele sache
      exploiter cette nouvelle observation, ET
      tests/bilanCoherencePrompt1CatalogueAxes.test.js si l'ajout touche
      un axe existant.
   5. Ecrire les tests du detecteur, sur le meme modele que
      bilanDetecterCoherenceDates ci-dessous.
   A aucun moment bilanExtraireFaits() lui-meme ne devrait avoir besoin
   d'etre modifie -- si c'est le cas, c'est le signe que le detecteur
   ajoute ne respecte pas la regle 6 ci-dessous.

   -- Regles qu'un detecteur doit respecter pour rester deterministe --
   1. Aucun jugement de valeur dans le contenu produit (pas de "bon"/
      "mauvais", pas de "risque" qualifie) -- un detecteur constate un
      fait, il n'interprete jamais sa gravite (ca, c'est le travail du
      Prompt 1, pas du code).
   2. Fonction pure : memes donneesStructurees en entree => memes
      Observation en sortie, aucune lecture d'un etat externe (pas de
      Date.now()/Math.random() implicite -- voir bilanDetecterCoherenceDates,
      qui recoit anneeCourante en parametre plutot que de l'appeler
      elle-meme).
   3. Ne lit jamais Candidature.cv ni aucun texte libre -- uniquement
      des donnees structurees deja normalisees en amont (voir en-tete).
   4. Retourne toujours un tableau (eventuellement vide), jamais null/
      undefined -- coherent avec la regle generale du module ("liste
      vide = resultat normal").
   5. N'a de raison d'exister que si une regle precise du Prompt 1
      l'exploite reellement (voir "Ce qui existe aujourd'hui" ci-dessus)
      -- jamais ajoute par anticipation.
   6. Respecte la meme signature que les detecteurs existants
      (donneesStructurees, [parametres additionnels optionnels]) ->
      Observation[], pour que BILAN_DETECTEURS_FAITS reste une simple
      liste homogene, sans cas particulier dans bilanExtraireFaits().
   ===================================================================
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanObsModele = require('../modeles/observation.js');
  var bilanCreerObservationFactuelle = _bilanObsModele.bilanCreerObservationFactuelle;
  var _bilanUtilFaits = require('../modeles/utilitaires.js');
  var bilanGenererId = _bilanUtilFaits.bilanGenererId;
}

// ---- Detecteur : coherence des dates ----
// Alimente le test de non-compensation "incoherences chronologiques
// manifestes". Dates en ANNEE SEULE (voir hostDataAdapter.js) : un
// chevauchement n'est signale que si une periode est ENTIEREMENT incluse
// dans une autre -- deux experiences consecutives (2020-2022 puis
// 2022-2024) sont un cas normal a cette granularite, jamais signale.
function bilanDetecterCoherenceDates(donneesStructurees, anneeCourante) {
  anneeCourante = anneeCourante || new Date().getFullYear();
  var experiences = (donneesStructurees && donneesStructurees.experiencesDates) || [];
  var chevauchements = bilanTrouverChevauchements(experiences, anneeCourante);
  var contenu = chevauchements.length === 0
    ? 'Aucun chevauchement manifeste détecté entre les expériences (dates en années).'
    : chevauchements.length + ' chevauchement(s) manifeste(s) détecté(s) : une période entièrement incluse dans une autre.';
  return [bilanCreerObservationFactuelle({ id: bilanGenererId('obsf'), categorie: 'chronologie', contenu: contenu })];
}

function bilanAnneeFinEffective(experience, anneeCourante) {
  return (experience.dateFin !== null && experience.dateFin !== undefined) ? experience.dateFin : anneeCourante;
}

// Inclusion stricte (pas une simple egalite de bornes) : b contient a
// entierement, sans etre identique a a.
function bilanPeriodeIncluseDans(a, b, anneeCourante) {
  if (!a || !b || a.dateDebut === null || a.dateDebut === undefined || b.dateDebut === null || b.dateDebut === undefined) { return false; }
  var finA = bilanAnneeFinEffective(a, anneeCourante);
  var finB = bilanAnneeFinEffective(b, anneeCourante);
  var inclusionLarge = b.dateDebut <= a.dateDebut && finB >= finA;
  var identiques = (b.dateDebut === a.dateDebut && finB === finA);
  return inclusionLarge && !identiques;
}

function bilanTrouverChevauchements(experiences, anneeCourante) {
  var resultats = [];
  for (var i = 0; i < experiences.length; i += 1) {
    for (var j = 0; j < experiences.length; j += 1) {
      if (i === j) { continue; }
      if (bilanPeriodeIncluseDans(experiences[i], experiences[j], anneeCourante)) {
        resultats.push({ indexInclus: i, indexConteneur: j });
      }
    }
  }
  return resultats;
}

// ---- Registre des detecteurs -- point d'extension unique pour la V2 ----
var BILAN_DETECTEURS_FAITS = [
  { id: 'coherence_dates', calculer: bilanDetecterCoherenceDates }
];

// donneesStructurees : { experiencesDates: [{dateDebut, dateFin}] } -- fourni
// par hostDataAdapter.bilanLireDonneesStructureesAnalyse().
function bilanExtraireFaits(donneesStructurees) {
  var observations = [];
  BILAN_DETECTEURS_FAITS.forEach(function (detecteur) {
    var resultat = detecteur.calculer(donneesStructurees) || [];
    observations = observations.concat(resultat);
  });
  return observations;
}

if (typeof module !== 'undefined') {
  module.exports = {
    BILAN_DETECTEURS_FAITS: BILAN_DETECTEURS_FAITS,
    bilanExtraireFaits: bilanExtraireFaits,
    bilanDetecterCoherenceDates: bilanDetecterCoherenceDates,
    bilanTrouverChevauchements: bilanTrouverChevauchements,
    bilanPeriodeIncluseDans: bilanPeriodeIncluseDans
  };
}
