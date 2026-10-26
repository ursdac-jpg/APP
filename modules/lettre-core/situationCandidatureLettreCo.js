/* ============================================================
   modules/lettre-core/situationCandidatureLettreCo.js
   ------------------------------------------------------------
   Situation REELLE d'une candidature, pour « Ecrire ma lettre avec
   l'assistant » (page « Preparer ») : c'est la presence d'une offre qui
   decide, pas la carte cliquee. Une carte « Repondre a une offre » sans
   offre saisie devient une candidature spontanee (decision de Denis,
   23/10/2026, cahier de la lettre decision 10) ; la carte reste telle que
   la personne l'a choisie, seule la situation calculee change.

   Fonctions pures, testees en Node (tests/lettreCoreSituationCandidature.test.js).
   Aucune lecture de « dossier » : l'appelant (data/metiers.js, js/app.js)
   passe les valeurs.
   ============================================================ */

// Une offre « compte » quand son texte OU son lien est renseigne (decision Q2 du chantier objectif).
function aUneOffreLettreCo(rechercheCandidature) {
  var rc = rechercheCandidature || {};
  return !!(String(rc.texteOffre || '').trim() || String(rc.lienOffre || '').trim());
}

// etat = { objectif, typeRecherche, rechercheCandidature }
// Renvoie 'offre' | 'spontanee_entreprise' | 'spontanee_generale' | l'objectif lui-meme pour les autres cartes.
function situationReelleLettreCo(etat) {
  var e = etat || {};
  var rc = e.rechercheCandidature || {};
  var avecEntreprise = !!String(rc.entreprise || '').trim();
  if (e.objectif === 'offre') {
    if (aUneOffreLettreCo(rc)) { return 'offre'; }
    return avecEntreprise ? 'spontanee_entreprise' : 'spontanee_generale';
  }
  if (e.objectif === 'spontanee') {
    // Pour la spontanee, typeRecherche 'offre' veut dire « une entreprise precise » (voir le cahier, decision 54).
    return e.typeRecherche === 'offre' ? 'spontanee_entreprise' : 'spontanee_generale';
  }
  return e.objectif || null;
}

// Message affiche sous « L'offre et l'entreprise » quand aucune offre n'est saisie (texte propose a Denis le 24/10/2026).
function messageSansOffreLettreCo(entreprise) {
  var nom = String(entreprise || '').trim();
  return 'Comme vous n’avez pas saisi d’offre d’emploi, votre candidature sera traitée comme une candidature spontanée' +
    (nom ? ' auprès de : ' + nom : '') + '.';
}

// Candidature spontanee « de facon generale » (typeRecherche 'simple') dont le metier ou le domaine est choisi : plus aucune question
// a poser (la personne que l'on connait n'est demandee que pour une entreprise precise). Sert a ouvrir « Adaptation au metier ».
// etat = { objectif, modeRecherche, metierCible, secteurCible, intituleDomaine, typeRecherche }
function candidatureGeneraleCompleteLettreCo(etat) {
  var e = etat || {};
  if ((e.objectif !== 'spontanee' && e.objectif !== 'reconversion') || e.typeRecherche !== 'simple' || !e.modeRecherche) { return false; }
  var cible = e.modeRecherche === 'domaine' ? e.secteurCible : e.metierCible;
  if (e.modeRecherche === 'domaine' && !String(e.intituleDomaine || '').trim()) { return false; }   // etape c5 : l'intitule est exige
  return !!String(cible || '').trim();
}

// Forme de la candidature pour « Changer de metier » (trois choix) : 'generale' | 'offre' | 'entreprise' | null.
// typeRecherche ne connait que 'simple' et 'offre' : « une offre » et « une entreprise precise sans offre » sont donc deux
// aspects d'un meme 'offre', departages par l'offre saisie, puis par le choix fait a l'ecran (formeChoisie), puis par l'entreprise.
// Avec « plusieurs metiers d'un domaine » il n'y a jamais d'offre (elle vise un poste precis) : 'entreprise' ou 'generale'.
// etat = { modeRecherche, typeRecherche, rechercheCandidature, formeChoisie }
function formeCandidatureLettreCo(etat) {
  var e = etat || {};
  var rc = e.rechercheCandidature || {};
  if (e.typeRecherche === 'simple') { return 'generale'; }
  if (e.typeRecherche !== 'offre') { return null; }
  if (e.modeRecherche === 'domaine') { return 'entreprise'; }
  if (aUneOffreLettreCo(rc)) { return 'offre'; }
  if (e.formeChoisie === 'offre' || e.formeChoisie === 'entreprise') { return e.formeChoisie; }
  return String(rc.entreprise || '').trim() ? 'entreprise' : 'offre';
}

// Remise a zero au changement de carte entre offre, spontanee et changer de metier (decision de Denis, 23/10/2026) : renvoie
// vrai quand il faut effacer tout ce qui a ete saisi pour l'objectif precedent.
function changementCarteEffaceLettreCo(objectifAvant, objectifApres) {
  var cartes = ['offre', 'spontanee', 'reconversion'];
  return !!objectifAvant && objectifAvant !== objectifApres && cartes.indexOf(objectifAvant) !== -1 && cartes.indexOf(objectifApres) !== -1;
}

// F6 (25/10/2026) : le drapeau _origineCoLettre (pose a l'import d'une lettre ecrite avec l'assistant) ne dit rien d'un CV. Il durait toute la session : un CV ouvert ensuite
// (« Reformuler et presenter mon CV »...) etait traite comme une lettre deja faite (plus d'« Adaptation au metier », barre d'etapes de la lettre). Il ne vaut que pour une lettre
// ou un entretien, jamais pour le CV.
function coLettreEnCoursLettreCo(dossier, docActif) {
  return !!(dossier && dossier._origineCoLettre) && docActif !== 'cv';
}

if (typeof module !== 'undefined') {
  module.exports = {
    coLettreEnCoursLettreCo: coLettreEnCoursLettreCo,
    aUneOffreLettreCo: aUneOffreLettreCo,
    situationReelleLettreCo: situationReelleLettreCo,
    messageSansOffreLettreCo: messageSansOffreLettreCo,
    candidatureGeneraleCompleteLettreCo: candidatureGeneraleCompleteLettreCo,
    formeCandidatureLettreCo: formeCandidatureLettreCo,
    changementCarteEffaceLettreCo: changementCarteEffaceLettreCo
  };
}
