/* ============================================================
   cvPdfDonnees.js
   ------------------------------------------------------------
   Moteur "CV design (PDF)" -- module ISOLE, jamais utilise par le
   Composeur Word (modules/cv-composeur/, docx.js) et jamais modifie
   par lui (voir modules/cv-pdf-html/README -- architecture voulue :
   toucher a l'un ne doit jamais impacter l'autre).

   Reutilise EN LECTURE SEULE le pipeline de donnees et de decision de
   contenu deja existant : normaliserDonneesCV(), appliquerMoteurDecisionCV()
   (js/app.js), composeurAnalyserProfil()/composeurAppliquerRegles()/
   composeurComposer() (modules/cv-composeur/).

   TACHE (retour utilisateur : "le contenu doit etre identique entre Word
   et PDF, seule la partie graphique change") : theme resolu via
   composeurResoudreThemeGeneration() (js/app.js), le MEME point d'entree
   unique deja partage entre le telechargement Word et l'apercu inline --
   theme.id='projetxxl' avec les VRAIS reglagesProjetXXL de la personne
   (etatApercuInline.cv.reglagesProjetXXL), jamais le theme 'sobre' force
   comme avant. Les DECISIONS de contenu (quelles rubriques, combien
   d'items, missions tronquees, strategie forcee, bonus de capacite...)
   sont donc desormais EXACTEMENT les memes que le Word Projet XXL par
   defaut -- seul le rendu (fichiers cv-pdf-html/cvPdfTemplate*.js) differe,
   jamais la logique de contenu dupliquee ici.
   ============================================================ */

// TACHE (bandeau de disponibilite, port depuis le Word) : bandeauDisponibilite
// est le SEUL reglage du theme neutre qu'on autorise a faire varier ici --
// explicite et borde (jamais un passthrough generique d'options de theme),
// pour ne jamais risquer d'activer par erreur une branche Projet XXL. Ce
// reglage influence une vraie DECISION de contenu prise par composeurComposer()
// (contenuRetenu.langues devient vide quand actif, voir composeurComposition.js) :
// on le lit donc a la source plutot que de re-decider nous-memes cote PDF.
// TACHE (bouton "Mettre en avant + regrouper", port depuis le Word,
// point 14 cv.md) : `regroupementActif` (defaut false) -- 5e parametre,
// jamais un passthrough generique d'options de theme (meme principe que
// `bandeauDisponibilite` juste au-dessus). A4 uniquement (formatPage ne
// commence jamais par "A5" dans ce cas -- meme scope que le Word, ou ce
// reglage est deja masque en A5, voir js/app.js:16493) : verifie ici pour
// ne jamais l'appliquer par erreur au pipeline A5 (composeurComposerA5Portrait
// gere ses experiences tout autrement, jamais teste avec ces
// pseudo-experiences regroupees).
function construireDonneesPdfCV(dossierSource, formatPage, bandeauDisponibilite, regroupementActif) {
  var objetCVBrut = normaliserDonneesCV(dossierSource);
  var recommandationsIACV = (dossierSource.ia && dossierSource.ia.cv && dossierSource.ia.cv.recommandations) || {};
  var objetCV = (typeof appliquerMoteurDecisionCV === 'function')
    ? appliquerMoteurDecisionCV(objetCVBrut, recommandationsIACV, {})
    : objetCVBrut;

  // TACHE (bouton "Mettre en avant + regrouper") : reutilise EN LECTURE
  // SEULE composeurAppliquerRegroupementExperiences (composeurMoteur.js,
  // deja charge -- module Word, mais fonction pure sans dependance a
  // docx.js) -- applique APRES appliquerMoteurDecisionCV (qui a deja
  // selectionne/ordonne/complete objetCV.experiences), EXACTEMENT comme
  // le fait genererDocxComposeur() cote Word. Repli silencieux sur objetCV
  // inchange si l'IA n'a rien propose d'exploitable (deja gere par la
  // fonction elle-meme) ou si le format est A5.
  if (regroupementActif && String(formatPage || '').indexOf('A5') !== 0 && typeof composeurAppliquerRegroupementExperiences === 'function') {
    objetCV = composeurAppliquerRegroupementExperiences(objetCV, recommandationsIACV.regroupementExperiences);
  }

  // 'projetxxl-bleu-7_2col' : id neutre fixe -- seul theme.id==='projetxxl'
  // + reglagesProjetXXL comptent pour le CONTENU decide par
  // composeurComposition.js ; couleur/nuance/colonnes de cet id sont
  // ignores par le rendu PDF (son propre panneau de style les pilote
  // independamment, voir cvPdfPanneauReglages.js), jamais lus ici.
  var reglagesProjetXXLActuels = (typeof etatApercuInline !== 'undefined' && etatApercuInline.cv && etatApercuInline.cv.reglagesProjetXXL) || {};
  var themeResolu = (typeof composeurResoudreThemeGeneration === 'function')
    ? composeurResoudreThemeGeneration('projetxxl-bleu-7_2col', reglagesProjetXXLActuels)
    : null;
  var theme = (themeResolu && typeof themeResolu === 'object') ? themeResolu : composeurObtenirTheme('projetxxl');
  theme.bandeauDisponibilite = !!bandeauDisponibilite;

  var profil = composeurAnalyserProfil(objetCV, dossierSource.objectif);
  var decisions = composeurAppliquerRegles(profil);
  var composition = composeurComposer(objetCV, profil, decisions, {}, formatPage || 'A4-detaille', theme, dossierSource, recommandationsIACV);

  // TACHE (retour utilisateur : "ne pas perdre le contenu Projet XXL") :
  // 2 trous de contenu trouves en activant reellement ce theme cote PDF --
  // aucun des 2 n'existait avant (theme 'sobre' ne peuplait jamais ces
  // champs) :
  // 1) contenuRetenu.experiencesPersonnelles ({intitule, detail, dates,
  //    missions}, exclusif Projet XXL) n'est lu par aucun fabricant du
  //    template PDF -- fusionne ici dans la meme liste que "engagements"
  //    (meme bloc "Experience personnelle" que le Word Projet XXL,
  //    composeurRender.js), _pdfBlocExperiencePersonnelle (cvPdfTemplateA4.js)
  //    sait deja rendre ce genre de forme (titre + detail + missions).
  // 2) quand une recommandation IA "mise en avant" existe,
  //    composeurComposition.js deplace les elements NON retenus vers
  //    contenuRetenu.savoirFairePersonnelNonRetenu/engagementNonRetenu --
  //    2 cles que le template PDF ne connait pas du tout : reconcatenees
  //    ici pour ne jamais les perdre (le PDF n'a pas la distinction
  //    visuelle "mis en avant" que fait le Word, tout s'affiche ensemble).
  if (composition && composition.contenuRetenu) {
    var contenuRetenuPDF = composition.contenuRetenu;
    contenuRetenuPDF.engagements = (contenuRetenuPDF.engagements || []).concat(contenuRetenuPDF.engagementNonRetenu || []);
    contenuRetenuPDF.experiencesPersonnelles = (contenuRetenuPDF.experiencesPersonnelles || []).concat(contenuRetenuPDF.savoirFairePersonnelNonRetenu || []);
  }

  // TACHE (bandeau de competences cles, port depuis le Word) : COMPOSEUR_REGLE_R006
  // (composeurStrategies.js) est une VRAIE selection editoriale deja ecrite
  // et testee (equilibre technique/savoir-etre, priorisee par pertinence
  // avec le metier vise) -- jamais invoquee par composeurComposer() a ce
  // jour (cohabitation explicite, voir en-tete du fichier), mais appelable
  // isolement sans aucune modification. Reutilisee ici EN LECTURE SEULE,
  // sur les competences BRUTES (objetCV.competences, categorisees --
  // jamais composition.contenuRetenu.competences, deja fusionnee/aplatie,
  // que R006 ne saurait pas re-categoriser). Repli sur tableau vide si le
  // fichier n'est pas charge (garde defensive, meme principe que le reste
  // de ce fichier).
  var competencesCles = (typeof COMPOSEUR_REGLE_R006 !== 'undefined')
    ? COMPOSEUR_REGLE_R006.appliquer(objetCV.competences, dossierSource.metierCible).valeur
    : [];

  // TACHE (retour utilisateur : "compétences professionnelles et
  // comportementales séparées, comme le Word Projet XXL") : desormais que
  // le theme reel 'projetxxl' est actif (plus haut), composeurComposition.js
  // separe DEJA correctement composition.contenuRetenu.competences
  // (professionnelles, savoirFaire+savoirs) et .competencesPersonnelles
  // (comportementales, savoirEtre+Decouverte, forme {competence: texte}) --
  // memes plafonds que le Word, memes constantes globales, EXACTEMENT
  // equivalent a l'ancien calcul manuel fait ici du temps du theme 'sobre'
  // force (verifie en test : sorties identiques) -- lecture directe
  // desormais, jamais une 2e logique de separation dupliquee.
  var competencesProfessionnelles = (composition && composition.contenuRetenu && composition.contenuRetenu.competences) || [];
  var competencesComportementales = (composition && composition.contenuRetenu && composition.contenuRetenu.competencesPersonnelles) || [];

  return {
    objetCV: objetCV,
    composition: composition,
    competencesCles: competencesCles,
    competencesProfessionnelles: competencesProfessionnelles,
    competencesComportementales: competencesComportementales
  };
}
