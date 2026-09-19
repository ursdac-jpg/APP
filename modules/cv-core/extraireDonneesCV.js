/* ============================================================
   modules/cv-core/extraireDonneesCV.js
   ------------------------------------------------------------
   Fonction UNIQUE et PARTAGEE d'extraction des donnees brutes du
   CV depuis "dossier" (etat global de l'application, declare dans
   js/app.js). "dossier" reste l'unique source de verite : cette
   fonction ne fait que le LIRE, jamais le modifier.

   Reutilisee par :
   - genererCSVCanva() (js/app.js) : export CSV pour Canva ;
   - normaliserDonneesCV() (modules/cv-core/normaliserDonneesCV.js) :
     objet CV standardise pour les futurs modules (editeur, templates,
     export PDF/DOCX...).

   Avant cette fonction, chaque consommateur relisait "dossier" a sa
   maniere : un seul endroit desormais, pour eviter deux logiques
   d'extraction paralleles a maintenir en cas d'evolution de "dossier".

   IMPORTANT (regle du projet) : AUCUNE mise en forme, AUCUNE
   concatenation de texte, AUCUNE decision de presentation ici --
   uniquement une lecture organisee et complete de "dossier". La mise
   en forme (ex. jointure de tableaux en texte pour un CSV, majuscules,
   troncature...) reste de la responsabilite de chaque consommateur.

   Depend, au moment de l'appel (pas au chargement du fichier), de
   quelques fonctions/variables globales declarees dans js/app.js
   (deduireCompetences, obtenirSavoirs, categorieCompetence) : comme
   cette fonction n'est jamais appelee avant une interaction de la
   personne (bouton export, ouverture de l'editeur...), l'ordre de
   chargement des <script> n'a pas d'impact.
   ============================================================ */

function extraireDonneesCV(dossierSource) {
  var d = dossierSource || {};
  var id = d.identite || {};
  var permis = d.permis || {};

  // TACHE (dette technique, chantier 2) : utilise desormais les fonctions
  // canoniques savoirFaireActuels()/savoirEtreActuels() (app.js) au lieu de
  // reimplementer localement le meme filtre -- meme garde defensive
  // typeof que pour deduireCompetences()/obtenirSavoirs() ci-dessous
  // (ce fichier peut en principe etre charge/appele independamment).
  var savoirFaire = (typeof savoirFaireActuels === 'function') ? savoirFaireActuels() : [];
  var savoirEtre = (typeof savoirEtreActuels === 'function') ? savoirEtreActuels() : [];
  var savoirs = (typeof obtenirSavoirs === 'function') ? obtenirSavoirs() : [];

  return {
    identite: {
      civilite: id.civilite || null,
      nom: id.nom || '',
      prenom: id.prenom || '',
      telephone: id.telephone || '',
      email: id.email || '',
      adresse: id.adresse || '',
      codePostal: id.codePostal || '',
      ville: id.ville || ''
    },
    // TACHE (retour utilisateur : "j'ai choisi 'Ouvrier polyvalent du
    // bâtiment' mais le CV affiche 'BTP'") : dossier.titreCV (choisi/
    // verrouille via l'ecran "Choisissez ce que l'IA propose", voir
    // dossier.titreCVVerrouille dans js/app.js) doit toujours primer --
    // repli sur metierCible/secteurCible (page Potentiel) uniquement si
    // aucun titre explicite n'a encore ete choisi.
    titreCV: d.titreCV || d.metierCible || d.secteurCible || '',
    competences: {
      savoirFaire: savoirFaire.slice(),
      savoirEtre: savoirEtre.slice(),
      savoirs: savoirs.slice()
    },
    experiences: (d.experiences || []).map(function (e) {
      return {
        poste: e.poste || '',
        entreprise: e.entreprise || '',
        lieu: e.lieu || '',
        dateDebut: e.dateDebut || '',
        dateFin: e.dateFin || '',
        missions: e.missions || '',
        // TACHE (extension schema, groupe A) : intitule de contrat propre a
        // CETTE experience passee (ex. "CDI", "Stage", "Alternance") --
        // distinct de dossier.contrat (types de contrat RECHERCHES,
        // deja existant, tableau global). Facultatif : chaine vide si non
        // renseigne, la rubrique disparait alors normalement cote template
        // (meme convention generique {{#if}} que tous les autres champs).
        contrat: e.contrat || ''
      };
    }),
    // TACHE (retour utilisateur : "expérience personnelle... désactivé,
    // je ne peux pas le mettre en avant" -- bug réel trouvé) : ce mapping
    // ne recopiait que intitule/detail, perdant silencieusement
    // dateDebut/dateFin (chantier "exp perso") et missions (chantier
    // "missions dans expérience personnelle") -- ces champs existent
    // pourtant bien sur dossier.experiencesPerso[] depuis. Corrigé pour
    // ne plus jamais perdre cette information entre le dossier et le CV
    // final.
    experiencesPersonnelles: (d.experiencesPerso || []).map(function (e) {
      return { intitule: e.intitule || '', detail: e.detail || '', dateDebut: e.dateDebut || '', dateFin: e.dateFin || '', missions: e.missions || '' };
    }),
    // TACHE (Tache 1 : formations en tableau) : dossier.formations est
    // desormais un veritable tableau (plusieurs formations possibles),
    // remplace l'ancien dossier.niveauFormation (valeur unique).
    formations: (d.formations || []).map(function (f) {
      // TACHE (extension schema, groupe A) : etablissement facultatif
      // (ecole/centre de formation) -- chaine vide si non renseigne.
      // TACHE (retour utilisateur : incoherence engagements/formations --
      // bug reel trouve) : "missions" (texte saisi via le palier "niveau
      // d'etudes" du parcours Decouverte, voir contenuMissionsFormationBrouillon)
      // etait silencieusement perdu ici -- composeurRender.js (f.missions)
      // ne recevait donc jamais rien, quelle que soit la formation.
      // Corrige a l'identique du fix deja applique a experiencesPersonnelles
      // ci-dessus : jamais perdre un champ deja saisi entre le dossier et
      // le CV final.
      return { niveau: f.niveau || '', intitule: f.intitule || '', annee: f.annee || '', etablissement: f.etablissement || '', missions: f.missions || '' };
    }),
    certifications: (d.certifications || []).slice(),
    langues: (d.langues || []).map(function (l) { return { langue: l.langue, niveau: l.niveau }; }),
    permis: {
      possede: (permis.possede === true || permis.possede === false) ? permis.possede : null,
      categories: (permis.categories || []).slice(),
      vehicule: (permis.vehicule === true || permis.vehicule === false) ? permis.vehicule : null
    },
    contrat: (d.contrat || []).slice(),
    tempsTravail: (d.tempsTravail || []).slice(),
    loisirs: (d.loisirs || []).slice(),
    engagements: (d.engagements || []).slice(),
    // TACHE (Bilan, "Modifier mon CV", 2026-08-24) : dossier.logiciels
    // existait deja comme champ saisi ailleurs dans l'app, mais n'avait
    // jamais ete lu ici -- aucun logiciel ajoute par une personne
    // n'atteignait donc jamais le CV final. Corrige en meme temps que
    // l'editeur qui a revele le bug (bilanOuvrirEditionCV()).
    logiciels: (d.logiciels || []).slice(),
    // CV entier deja retape par l'IA et colle par la personne (page Action,
    // export Canva) -- PAS une simple accroche/profil, voir docs/SCHEMA_CV.md.
    texteAmelioreCanva: d.texteAmelioreCanva || ''
  };
}
