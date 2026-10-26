/* ============================================================
   modules/lettre-core/appuisLettreCo.js
   ------------------------------------------------------------
   Panneau « Vos appuis » de la page « Preparer » de « Ecrire ma lettre avec
   l'assistant » (etape (g), 24/10/2026) : lettres de recommandation de la
   personne. Decisions de Denis (24/10/2026) :
   - la personne peut en deposer PLUSIEURS (trois au plus) mais UNE SEULE part
     chez l'assistant, celle qu'elle choisit (plus le message grossit, moins
     l'assistant est efficace) ;
   - elles servent a rendre la lettre concrete et a reprendre le vocabulaire
     technique du metier ;
   - elles sont relues et masquees comme le CV : le nom du signataire, en bas
     de la lettre, est surligne pour que la personne le supprime.
   Donnees d'une tierce personne : jamais enregistrees avec la session.

   Fonctions pures, testees en Node (tests/lettreCoreAppuis.test.js).
   ============================================================ */

var MAX_RECOMMANDATIONS_LETTRE_CO = 3;

// Roles proposes (sans le nom de la personne) ; « Non precise » = champ vide.
var ROLES_RECOMMANDATION_LETTRE_CO = ['Ancien employeur', 'Tuteur de stage', 'Formateur ou enseignant', 'Association ou bénévolat', 'Autre'];

// Une recommandation : { id, texte, role }. Les fonctions ci-dessous ne modifient jamais la liste recue.
function ajouterRecommandationLettreCo(liste, texte, role) {
  var l = Array.isArray(liste) ? liste.slice() : [];
  var t = String(texte || '').trim();
  if (!t || l.length >= MAX_RECOMMANDATIONS_LETTRE_CO) { return l; }
  var maxId = l.reduce(function (m, r) { return Math.max(m, r.id); }, 0);
  l.push({ id: maxId + 1, texte: t, role: ROLES_RECOMMANDATION_LETTRE_CO.indexOf(role) !== -1 ? role : '' });
  return l;
}
function retirerRecommandationLettreCo(liste, id) {
  return (Array.isArray(liste) ? liste : []).filter(function (r) { return r.id !== id; });
}
function definirRoleRecommandationLettreCo(liste, id, role) {
  var valide = ROLES_RECOMMANDATION_LETTRE_CO.indexOf(role) !== -1 ? role : '';
  return (Array.isArray(liste) ? liste : []).map(function (r) { return r.id === id ? { id: r.id, texte: r.texte, role: valide } : r; });
}
// La lettre qui part chez l'assistant : celle choisie, sinon la premiere ; null s'il n'y en a aucune.
function recommandationEnvoyeeLettreCo(liste, idChoisi) {
  var l = Array.isArray(liste) ? liste : [];
  if (!l.length) { return null; }
  return l.filter(function (r) { return r.id === idChoisi; })[0] || l[0];
}

// Section ajoutee au message (format que prompts/lettre-co.md cite : « LETTRE DE RECOMMANDATION ... de la part de : [role] »).
function sectionRecommandationLettreCo(reco) {
  if (!reco || !String(reco.texte || '').trim()) { return ''; }
  return 'LETTRE DE RECOMMANDATION (relue et masquée par la personne), de la part de : ' + (reco.role || 'Autre') + '\n' + String(reco.texte).trim();
}

// Noms probables du signataire, a surligner pour que la personne les masque : en bas de la lettre (signature) ou apres « Je soussigné ».
// Volontairement prudent : mieux vaut surligner un mot de trop (la personne decide) que rater le nom.
function nomsSignatureLettreCo(texte) {
  var lignes = String(texte || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  var noms = [];
  var MOT = "[A-ZÀ-Ý][A-Za-zÀ-ÿ'’-]+";
  var motsDeTitre = /^(?:madame|monsieur|mme|m\.|mlle|responsable|directeur|directrice|gérant|gérante|manager|chef|agence|société|entreprise|service|association|cordialement|sincèrement|bien|respectueusement|veuillez|fait|le|à|signature|ressources|humaines|recrutement)$/i;
  function ajouter(nom) {
    var n = String(nom || '').trim().replace(/[,;.]+$/, '');
    if (n && noms.indexOf(n) === -1 && String(texte).indexOf(n) !== -1) { noms.push(n); }
  }
  function nettoyerCivilite(l) { return l.replace(/^(?:madame|monsieur|mme|mlle|m\.)\s+/i, ''); }
  // 1. « Je soussigné(e) [Monsieur] Prenom Nom »
  var reSoussigne = new RegExp('soussign[ée]e?\\s+(?:(?:monsieur|madame|mme|m\\.)\\s+)?(' + MOT + '(?:\\s+' + MOT + '){1,2})');
  var m = reSoussigne.exec(lignes.slice(0, 8).join('\n'));
  if (m) { ajouter(m[1]); }
  // 2. dernieres lignes : une ligne qui ressemble a un nom (2 a 4 mots a majuscule), avant une virgule eventuelle (« Jean Dupont, Responsable d'agence »)
  var finales = lignes.slice(-6);
  var reLigneNom = new RegExp('^' + MOT + '(?:\\s+' + MOT + '){1,3}$');
  finales.forEach(function (l) {
    var candidat = nettoyerCivilite(l.split(/[,(]/)[0].trim());
    if (!reLigneNom.test(candidat)) { return; }
    var mots = candidat.split(/\s+/);
    if (mots.some(function (mot) { return motsDeTitre.test(mot); })) { return; }
    if (/\d/.test(candidat)) { return; }
    ajouter(candidat);
  });
  return noms;
}

if (typeof module !== 'undefined') {
  module.exports = {
    MAX_RECOMMANDATIONS_LETTRE_CO: MAX_RECOMMANDATIONS_LETTRE_CO,
    ROLES_RECOMMANDATION_LETTRE_CO: ROLES_RECOMMANDATION_LETTRE_CO,
    ajouterRecommandationLettreCo: ajouterRecommandationLettreCo,
    retirerRecommandationLettreCo: retirerRecommandationLettreCo,
    definirRoleRecommandationLettreCo: definirRoleRecommandationLettreCo,
    recommandationEnvoyeeLettreCo: recommandationEnvoyeeLettreCo,
    sectionRecommandationLettreCo: sectionRecommandationLettreCo,
    nomsSignatureLettreCo: nomsSignatureLettreCo
  };
}
