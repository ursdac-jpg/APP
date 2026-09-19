/* ============================================================
   modules/bilan-candidature/modeles/utilitaires.js
   ------------------------------------------------------------
   Aide transversale reutilisee par tous les objets de modeles/ :
   generation d'identifiant, calcul de hash de contenu (invalidation de
   cache), construction d'erreurs metier nommees (CONTRATS.md, section 4).
   Centralise ici une seule fois -- aucun autre fichier du module ne doit
   reimplementer sa propre generation d'id ou sa propre erreur ad hoc.

   Verifie avant creation (2026-08-08) : aucune fonction de generation
   d'id ou de hash n'existe deja ailleurs dans l'application.
   ============================================================ */

var _bilanCompteurId = 0;

// prefixe (ex. "obs", "reco") -> identifiant court, unique dans une meme
// session. Pas un UUID cryptographique : aucun besoin d'unicite au-dela
// du module, seulement de ne jamais collisionner entre deux objets crees
// pendant la meme session.
function bilanGenererId(prefixe) {
  _bilanCompteurId += 1;
  return prefixe + '-' + Date.now().toString(36) + '-' + _bilanCompteurId.toString(36);
}

// Hash simple (djb2), suffisant pour detecter un changement de contenu --
// jamais utilise a des fins de securite. Fonction pure : memes valeurs,
// meme resultat, aucun etat externe lu.
function bilanCalculerHashContenu(valeurs) {
  var texte = (valeurs || []).map(function (v) { return v === null || v === undefined ? '' : String(v); }).join('');
  var hash = 5381;
  for (var i = 0; i < texte.length; i += 1) {
    hash = ((hash * 33) ^ texte.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

// Erreur metier nommee (CONTRATS.md, section 4) : reste une vraie
// instance d'Error (instanceof Error fonctionne), avec un code stable
// pour la distinguer d'une exception JavaScript generique.
function bilanCreerErreurMetier(code, message, details) {
  var erreur = new Error(message);
  erreur.code = code;
  erreur.details = details || null;
  return erreur;
}

function bilanEstErreurMetier(erreur, code) {
  return !!erreur && erreur.code === code;
}

// TACHE (retour Denis, 2026-08-31) : filet de securite typographique sur
// TOUT texte produit par un assistant en ligne (reponses de Prompt 1 et
// Prompt 2). Regle non negociable du projet : jamais de tiret cadratin ni
// de demi-cadratin nulle part (docs/LECONS Regle transverse, memoire
// project_regle_jamais_grand_trait_cv). Les assistants en glissent
// regulierement malgre la consigne du prompt -- on ne peut pas compter
// sur le prompt seul (sature). Remplace les tirets longs par un tiret
// court entoure d'espaces (style maison de Denis), supprime le trait
// conditionnel invisible. Fonction pure.
function bilanAssainirTypographie(valeur) {
  if (typeof valeur !== 'string') { return valeur; }
  return valeur
    // Trait d'union conditionnel (U+00AD, invisible) : purement parasite.
    .replace(/­/g, '')
    // Tiret figure (U+2012), demi-cadratin (U+2013), cadratin (U+2014),
    // barre horizontale (U+2015), signe moins (U+2212) : toujours une
    // ponctuation de phrase ici -> " - " (espaces normalises ensuite).
    .replace(/\s*[‒–—―−]\s*/g, ' - ')
    // Un " - " colle a une ponctuation ou en bord de chaine : on resserre.
    .replace(/\s+-\s+([,.;:!?])/g, '$1')
    .replace(/^\s*-\s+/, '')
    .replace(/\s+-\s*$/, '')
    .trim();
}

// Applique bilanAssainirTypographie recursivement a toutes les chaines
// d'une structure JSON (objet / tableau / chaine). Ne modifie jamais la
// forme, seulement le contenu textuel. Utilisee juste apres l'extraction
// JSON dans les parsers de reponse.
function bilanAssainirTypographieProfond(valeur) {
  if (typeof valeur === 'string') { return bilanAssainirTypographie(valeur); }
  if (Array.isArray(valeur)) { return valeur.map(bilanAssainirTypographieProfond); }
  if (valeur && typeof valeur === 'object') {
    Object.keys(valeur).forEach(function (cle) {
      valeur[cle] = bilanAssainirTypographieProfond(valeur[cle]);
    });
    return valeur;
  }
  return valeur;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanGenererId: bilanGenererId,
    bilanCalculerHashContenu: bilanCalculerHashContenu,
    bilanCreerErreurMetier: bilanCreerErreurMetier,
    bilanEstErreurMetier: bilanEstErreurMetier,
    bilanAssainirTypographie: bilanAssainirTypographie,
    bilanAssainirTypographieProfond: bilanAssainirTypographieProfond
  };
}
