/* ============================================================
   « Citer ou développer » : LOGIQUE PURE (aucun DOM). Testée par tests/citerDevelopper.test.js (Node).
   Maquette validée par Denis le 15/11/2026 : docs/MAQUETTE_CITER_OU_DEVELOPPER_2026-11-15.html (consignes 354 à 357).

   Principe : pour un élément du CV (certification, engagement, ce que la personne a appris ailleurs qu'au travail, diplôme), la personne
   dit si elle veut seulement le CITER ou le DÉVELOPPER (des missions qu'elle a réellement faites, cochées ou écrites par elle).
   - Élément développé : l'assistant reçoit les missions de la personne, les reformule et les accorde, sans rien inventer.
   - Élément cité : il figure sur le CV tel quel ; l'assistant reçoit « À CITER SEULEMENT » et n'écrit AUCUNE mission pour lui.
   - Sans réponse : cité (décision de Denis, consigne 357), SAUF si la personne a déjà écrit des missions (alors c'est développé, rien n'est perdu).
   - Là où aucune mission n'a de sens (loisirs, certifications de langue ou de bureautique) : aucune question, l'élément apparaît tel quel.
   Le CODE garantit la règle : une proposition de l'assistant pour un élément qui n'est pas développé est retirée à l'import.

   Source unique de ces règles : ce fichier. js/app.js, modules/cv-core/normaliserDonneesCV.js et le prompt (prompts/cv.md) s'y réfèrent.
   ============================================================ */

// Rubriques concernées par la question (les clés sont celles de dossier.*). Les loisirs n'y sont pas : jamais de mission (consigne 355).
var CD_RUBRIQUES_AVEC_QUESTION = ['certifications', 'experiencesPerso', 'engagements'];

// Certifications dont aucune mission n'a de sens : un niveau ou un score, pas une activité. Aucune question, l'élément apparaît tel quel.
var CD_CERTIFS_SANS_MISSIONS = ['PIX', 'ICDL', 'TOSA', 'TOEIC', 'TOEFL', 'Linguaskill', 'DELF', 'DALF'];

// Nom complet des certifications écrites en sigle (à titre informatif dans l'application, jamais envoyé à l'assistant, jamais sur le CV : le CV garde le sigle).
// Source : les organismes officiels de chaque certification. À relire par Denis.
var CD_NOMS_COMPLETS_CERTIFS = {
  'SST': 'Sauveteur Secouriste du Travail',
  'PSC1': 'Prévention et Secours Civiques de niveau 1',
  'AFGSU': 'Attestation de Formation aux Gestes et Soins d’Urgence',
  'SSIAP': 'Service de Sécurité Incendie et d’Assistance à Personnes',
  'H0B0': 'Habilitation électrique pour le personnel non électricien',
  'BS': 'Habilitation électrique : interventions élémentaires en basse tension',
  'BE Manœuvre': 'Habilitation électrique : exécution de manœuvres sur une installation électrique',
  'R482': 'CACES R482 : conduite d’engins de chantier',
  'R485': 'CACES R485 : conduite de chariots de manutention à conducteur accompagnant',
  'R486': 'CACES R486 : conduite de plateformes élévatrices mobiles de personnes',
  'R489': 'CACES R489 : conduite de chariots de manutention à conducteur porté',
  'R490': 'CACES R490 : conduite de grues de chargement',
  'AIPR': 'Autorisation d’Intervention à Proximité des Réseaux',
  'FIMO': 'Formation Initiale Minimale Obligatoire du conducteur routier',
  'FCO': 'Formation Continue Obligatoire du conducteur routier',
  'ADR': 'Transport de marchandises dangereuses par route',
  'PIX': 'Certification des compétences numériques',
  'ICDL': 'International Computer Driving Licence : passeport de compétences informatiques',
  'TOSA': 'Test On Software Applications : certification de compétences bureautiques',
  'TOEIC': 'Test of English for International Communication : test d’anglais professionnel',
  'TOEFL': 'Test of English as a Foreign Language : test d’anglais',
  'Linguaskill': 'Test d’anglais de l’université de Cambridge',
  'DELF': 'Diplôme d’Études en Langue Française',
  'DALF': 'Diplôme Approfondi de Langue Française'
};

// Textes transmis à l'assistant. Le marqueur est court (un par élément) ; la règle complète n'est écrite qu'une fois dans le profil.
var CD_MARQUEUR_CITE = 'À CITER SEULEMENT';
var CD_MARQUEUR_DEVELOPPE = 'Missions de la personne';
var CD_REGLE_CITE = 'Règle : un élément marqué « À CITER SEULEMENT » figure sur le CV tel quel, la personne ne souhaite pas le développer : n’écris aucune mission pour lui et ne le choisis pas comme expérience à mettre en avant. ' +
  'Pour un élément dont le profil donne « Missions de la personne », reformule et accorde ces missions seulement, sans en ajouter ni en inventer.';

// Texte comparable : sans accents, en minuscules, espaces simples (même principe que fmNormaliser du bloc « Vos diplômes »).
function cdNormaliser(t) {
  return String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘]/g, '\'').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Nom complet d'un sigle de certification, ou '' (une certification qui n'est pas un sigle, ou saisie librement, n'en a pas).
function cdNomCompletCertification(valeur) {
  var v = cdNormaliser(valeur);
  var trouve = '';
  Object.keys(CD_NOMS_COMPLETS_CERTIFS).forEach(function (sigle) { if (cdNormaliser(sigle) === v) { trouve = CD_NOMS_COMPLETS_CERTIFS[sigle]; } });
  return trouve;
}

// La question « seulement le citer ou le développer » a-t-elle un sens pour cet élément ?
// Loisirs : jamais. Certifications : sauf celles de la liste ci-dessus. Engagements et expériences personnelles : toujours, y compris un élément écrit par la personne.
function cdQuestionPossible(rubrique, valeur) {
  if (CD_RUBRIQUES_AVEC_QUESTION.indexOf(rubrique) === -1) { return false; }
  if (rubrique !== 'certifications') { return true; }
  var v = cdNormaliser(valeur);
  return !CD_CERTIFS_SANS_MISSIONS.some(function (s) { return cdNormaliser(s) === v; });
}

// Mode réel d'un élément : 'dev' ou 'cite'. reponse : 'dev' | 'cite' | 'oui' | 'non' | null ; missions : le texte déjà écrit pour cet élément.
// Une réponse explicite l'emporte ; sans réponse, des missions déjà écrites veulent dire « développé » (rien n'est perdu), sinon « cité ».
function cdModeEffectif(reponse, missionsTexte) {
  if (reponse === 'dev' || reponse === 'oui') { return 'dev'; }
  if (reponse === 'cite' || reponse === 'non') { return 'cite'; }
  return String(missionsTexte == null ? '' : missionsTexte).trim() ? 'dev' : 'cite';
}

// L'élément doit-il être écrit « à citer seulement » dans le profil de l'assistant ? Oui si la personne l'a choisi, ou si elle veut le développer
// mais n'a écrit aucune mission (rien à reformuler : l'assistant n'invente pas).
function cdEstCite(reponse, missionsTexte) {
  return cdModeEffectif(reponse, missionsTexte) === 'cite' || cdMissionsEnListe(missionsTexte).length === 0;
}

// Missions d'un texte « une par ligne » (ou déjà en liste) : tableau de lignes non vides.
function cdMissionsEnListe(missions) {
  if (Array.isArray(missions)) { return missions.map(function (m) { return String(m).trim(); }).filter(Boolean); }
  return String(missions == null ? '' : missions).split(/\r?\n/).map(function (m) { return m.trim(); }).filter(Boolean);
}

// Nom de l'élément tel que le profil l'écrit pour les formes objet ou texte : { texte | intitule | valeur } ou chaîne.
function cdNomElement(item, champ) {
  if (typeof item === 'string') { return item; }
  return String((item && (item[champ] || item.texte || item.intitule || item.valeur)) || '');
}

// Ne garde, parmi des propositions de l'assistant ({ [champId]: nom, missions }), que celles qui portent sur un élément DÉVELOPPÉ.
// Une proposition dont le nom ne correspond à aucun élément développé est retirée : le code garantit, l'assistant propose.
// nomsDeveloppes : noms des éléments développés. Correspondance sans accents ni casse, par égalité, ou par inclusion d'un nom d'au moins 4 caractères (« BS » ne doit pas se retrouver dans un autre nom).
function cdGarderSeulementDeveloppes(propositions, champId, nomsDeveloppes) {
  var noms = (nomsDeveloppes || []).map(cdNormaliser).filter(Boolean);
  return (propositions || []).filter(function (p) {
    var n = cdNormaliser(p && p[champId]);
    if (!n) { return false; }
    return noms.some(function (d) { return d === n || (d.length >= 4 && n.indexOf(d) !== -1) || (n.length >= 4 && d.indexOf(n) !== -1); });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CD_RUBRIQUES_AVEC_QUESTION: CD_RUBRIQUES_AVEC_QUESTION, CD_CERTIFS_SANS_MISSIONS: CD_CERTIFS_SANS_MISSIONS, CD_NOMS_COMPLETS_CERTIFS: CD_NOMS_COMPLETS_CERTIFS,
    CD_MARQUEUR_CITE: CD_MARQUEUR_CITE, CD_MARQUEUR_DEVELOPPE: CD_MARQUEUR_DEVELOPPE, CD_REGLE_CITE: CD_REGLE_CITE, cdEstCite: cdEstCite,
    cdNormaliser: cdNormaliser, cdNomCompletCertification: cdNomCompletCertification, cdQuestionPossible: cdQuestionPossible,
    cdModeEffectif: cdModeEffectif, cdMissionsEnListe: cdMissionsEnListe, cdNomElement: cdNomElement, cdGarderSeulementDeveloppes: cdGarderSeulementDeveloppes
  };
}
