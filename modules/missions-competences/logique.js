/* ============================================================
   Étape « Vos missions et compétences » : LOGIQUE PURE (aucun DOM).
   Chargée avant js/app.js. Testée par tests/missionsCompetences.test.js (Node).
   Plan de codage : docs/PLAN_DE_CODAGE_MISSIONS_COMPETENCES_2026-11-14.md (lots 0 à 9).
   Maquette de référence : docs/MAQUETTE_MISSIONS_COMPETENCES_PAR_EXPERIENCE_2026-11-14.html.
   Notes pour le futur prompt : docs/CAHIER_NOUVEAU_PROMPT_MISSIONS_COMPETENCES_2026-11-14.md.
   ============================================================ */

// Interrupteur d'ouverture de l'étape : tant qu'il est faux, l'étape n'apparaît nulle part (barre d'étapes, reprise, recherche).
// Passé à vrai le 15/11/2026 sur demande de Denis (consigne 321), dans son dépôt local pour ses essais internes :
// la mise sur GitHub ne se fait qu'une fois ces essais complets, et la ligne « Nouveautés » s'ajoute à ce moment-là.
var MC_OUVERT = true;

// Consignes 401 et 408 : les fonctions de « Vos missions et compétences » sont-elles actives pour CE CV ? Oui tant que le module est ouvert, sauf si la personne a choisi
// que ce soit l'assistant qui propose (dossier.missionsChoisiesPar === 'assistant', choix irrévocable, voir modules/missions-competences/choix.js). Source unique du test.
// Lot 3 : le choix vaut pour UN parcours (dossier.missionsChoisiesVoie : 'nouveau' = « Créer un nouveau CV », 'maj' = « Reprendre mon CV », voie 1 « Le garder et le compléter »).
// Un choix « assistant » fait dans un parcours n'éteint rien dans un autre (voie 2, voie 3, autre CV de la même session). Sans voie notée (session d'avant), il vaut pour partout.
function mcVoieDuChoix() {
  if (typeof dossier === 'undefined' || !dossier) { return null; }
  if (dossier.modeCreation === 'nouveau') { return 'nouveau'; }
  // La voie 3 (sans assistant) partage le meme depot que la voie 1 (_modeCreationVia vaut 'maj' pour les deux) : engagee, elle n'a aucun choix a faire (la personne choisit forcement).
  if (typeof csaVoieEngagee === 'function' && csaVoieEngagee()) { return null; }
  // « À partir de mon récit » : aucun mode de creation n'est pose ; une session du recit vivante (ou terminee) en est la marque.
  if (!dossier.modeCreation && (typeof _decouverteRenduEtape === 'function' || dossier.decouverteTerminee)) { return 'recit'; }
  if (dossier.modeCreation === 'maj' && dossier._modeCreationVia === 'maj') { return 'maj'; }
  return null;
}
function mcActifPourCeCv() {
  if (typeof MC_OUVERT === 'undefined' || MC_OUVERT !== true) { return false; }
  if (typeof dossier === 'undefined' || !dossier || dossier.missionsChoisiesPar !== 'assistant') { return true; }
  return !!dossier.missionsChoisiesVoie && dossier.missionsChoisiesVoie !== mcVoieDuChoix();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MC_OUVERT: MC_OUVERT,
    mcActifPourCeCv: mcActifPourCeCv,
    mcVoieDuChoix: mcVoieDuChoix
  };
}
