/* ============================================================
   modules/coherence-transversale/modeles/utilitaires.js
   ------------------------------------------------------------
   Aide transversale reutilisee par tous les objets de modeles/ :
   generation d'identifiant, calcul de hash de contenu, construction
   d'erreurs metier nommees (CONTRATS.md, section 4). Copie volontaire du
   meme motif que modules/bilan-candidature/modeles/utilitaires.js --
   jamais un import de ce fichier (objectif de portabilite : ce module ne
   doit dependre d'aucun autre module de ce depot, voir CONTRATS.md, en-tete).
   ============================================================ */

var _ctCompteurId = 0;

// prefixe (ex. "constat", "reco") -> identifiant court, unique dans une
// meme session. Pas un UUID cryptographique : aucun besoin d'unicite
// au-dela du module.
function ctGenererId(prefixe) {
  _ctCompteurId += 1;
  return prefixe + '-' + Date.now().toString(36) + '-' + _ctCompteurId.toString(36);
}

// Hash simple (djb2), suffisant pour detecter un changement de contenu --
// jamais utilise a des fins de securite.
function ctCalculerHashContenu(valeurs) {
  var texte = (valeurs || []).map(function (v) { return v === null || v === undefined ? '' : String(v); }).join('');
  var hash = 5381;
  for (var i = 0; i < texte.length; i += 1) {
    hash = ((hash * 33) ^ texte.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function ctCreerErreurMetier(code, message, details) {
  var erreur = new Error(message);
  erreur.code = code;
  erreur.details = details || null;
  return erreur;
}

function ctEstErreurMetier(erreur, code) {
  return !!erreur && erreur.code === code;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctGenererId: ctGenererId,
    ctCalculerHashContenu: ctCalculerHashContenu,
    ctCreerErreurMetier: ctCreerErreurMetier,
    ctEstErreurMetier: ctEstErreurMetier
  };
}
