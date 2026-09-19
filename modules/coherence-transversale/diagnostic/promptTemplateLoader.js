/* ============================================================
   modules/coherence-transversale/diagnostic/promptTemplateLoader.js
   ------------------------------------------------------------
   Copie du meme motif que modules/bilan-candidature/diagnostic/
   promptTemplateLoader.js (jamais un import -- objectif de portabilite,
   voir CONTRATS.md). Deux responsabilites separees :
   ctResoudrePlaceholders() 100% generique, ctChargerTemplate() charge et
   met en cache un template par chemin.
   ============================================================ */

function ctResoudrePlaceholders(texteTemplate, valeurs) {
  valeurs = valeurs || {};
  var placeholdersNonResolus = [];
  var texteResolu = (texteTemplate || '').replace(/\{([A-Z_]+)\}/g, function (correspondance, nom) {
    var estFourni = Object.prototype.hasOwnProperty.call(valeurs, nom) && valeurs[nom] !== null && valeurs[nom] !== undefined;
    if (estFourni) { return String(valeurs[nom]); }
    placeholdersNonResolus.push(nom);
    return correspondance;
  });
  return { texte: texteResolu, placeholdersNonResolus: placeholdersNonResolus };
}

var _ctTemplateCacheParChemin = {};

function ctLecteurTemplateParDefaut(cheminFichier) {
  return function () {
    if (typeof fetch !== 'function') {
      return Promise.reject(new Error('fetch indisponible : aucun lecteur de template injecte et pas de navigateur.'));
    }
    return fetch(cheminFichier, { cache: 'no-cache' }).then(function (reponse) {
      if (!reponse.ok) { throw new Error('Template introuvable (' + cheminFichier + ').'); }
      return reponse.text();
    });
  };
}

function ctChargerTemplate(cheminFichier, lecteur) {
  if (_ctTemplateCacheParChemin[cheminFichier]) { return _ctTemplateCacheParChemin[cheminFichier]; }
  var fonctionLecture = lecteur || ctLecteurTemplateParDefaut(cheminFichier);
  _ctTemplateCacheParChemin[cheminFichier] = Promise.resolve().then(fonctionLecture).catch(function (erreur) {
    delete _ctTemplateCacheParChemin[cheminFichier];
    throw erreur;
  });
  return _ctTemplateCacheParChemin[cheminFichier];
}

function ctReinitialiserCacheTemplate(cheminFichier) {
  if (cheminFichier) { delete _ctTemplateCacheParChemin[cheminFichier]; }
  else { _ctTemplateCacheParChemin = {}; }
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctResoudrePlaceholders: ctResoudrePlaceholders,
    ctChargerTemplate: ctChargerTemplate,
    ctReinitialiserCacheTemplate: ctReinitialiserCacheTemplate
  };
}
