/* ============================================================
   modules/bilan-candidature/diagnostic/promptTemplateLoader.js
   ------------------------------------------------------------
   Deux responsabilites strictement separees, delibere le 2026-08-08 :

   1. bilanResoudrePlaceholders(texteTemplate, valeurs) -- 100%
      GENERIQUE. Ne connait AUCUN nom de placeholder specifique a
      prompts/bilan-v1.md. Remplace chaque {CLE} par valeurs.CLE,
      signale toute cle non resolue. Cette fonction ne doit jamais etre
      modifiee pour un besoin propre au Prompt 1 -- c'est
      diagnosticPromptBuilder.js qui connait les noms reels des
      placeholders, jamais ce fichier.

   2. bilanChargerTemplate(cheminFichier, lecteur) -- obtient le texte
      brut d'UN template, identifie par son chemin (ex.
      'prompts/bilan-v1.md' ou 'prompts/bilan-v2.md'). Par defaut, fetch
      (meme convention que chargerPromptsExternes(), js/app.js), mis en
      cache PAR CHEMIN apres le premier succes -- jamais un cache unique
      partage entre plusieurs prompts. Lecteur injectable pour les tests.

   CORRECTION (2026-08-08, verification avant core/) : ce fichier avait a
   l'origine un chemin fige ('prompts/bilan-v1.md') et un cache unique --
   correct tant que seul le Prompt 1 existait, mais aurait force
   core/moduleOrchestrator.js a contourner la limitation pour charger
   aussi prompts/bilan-v2.md (Prompt 2). Corrige a la source plutot que
   de laisser cette logique de contournement s'infiltrer dans core/.

   IMPORTANT : si un jour une partie du prompt est generee dynamiquement
   (voir la reflexion "source de verite des constantes",
   analyse/axeAnalyseRegistry.js), seul bilanChargerTemplate() --  ou son
   lecteur injecte -- change. bilanResoudrePlaceholders() et
   diagnosticPromptBuilder.js n'ont besoin d'aucune modification : ils
   ne travaillent que sur du texte deja obtenu, jamais sur sa source.
   ============================================================ */

function bilanResoudrePlaceholders(texteTemplate, valeurs) {
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

var _bilanTemplateCacheParChemin = {};

function bilanLecteurTemplateParDefaut(cheminFichier) {
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

// Retourne une Promise<string>. Le succes est mis en cache PAR CHEMIN
// (jamais relu deux fois par session pour un meme fichier -- mais deux
// fichiers differents ne partagent jamais leur cache). Un echec N'EST
// PAS mis en cache -- un prochain appel retente une lecture fraiche
// plutot que de figer une panne temporaire pour le reste de la session.
function bilanChargerTemplate(cheminFichier, lecteur) {
  if (_bilanTemplateCacheParChemin[cheminFichier]) { return _bilanTemplateCacheParChemin[cheminFichier]; }
  var fonctionLecture = lecteur || bilanLecteurTemplateParDefaut(cheminFichier);
  _bilanTemplateCacheParChemin[cheminFichier] = Promise.resolve().then(fonctionLecture).catch(function (erreur) {
    delete _bilanTemplateCacheParChemin[cheminFichier];
    throw erreur;
  });
  return _bilanTemplateCacheParChemin[cheminFichier];
}

// Reservee aux tests. Sans argument, vide tout ; avec un chemin, ne vide
// que ce chemin precis.
function bilanReinitialiserCacheTemplate(cheminFichier) {
  if (cheminFichier) { delete _bilanTemplateCacheParChemin[cheminFichier]; }
  else { _bilanTemplateCacheParChemin = {}; }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanResoudrePlaceholders: bilanResoudrePlaceholders,
    bilanChargerTemplate: bilanChargerTemplate,
    bilanReinitialiserCacheTemplate: bilanReinitialiserCacheTemplate
  };
}
