/* ============================================================
   modules/regard-recruteur/promptBuilder.js
   ------------------------------------------------------------
   Seule couche du module qui connait les noms reels des placeholders de
   prompts/regard-recruteur.md (section « Donnees a lire ») :
   {MODE_ANALYSE}, {CV_TEXTE}, {POSTE_VISE}, {ENTREPRISE}, {OFFRE},
   {TYPE_STRUCTURE}, {SITE_ENTREPRISE_FOURNI}, {COULEURS_ENTREPRISE}.

   Pur, sans DOM. Node-testable (tests/regardRecruteurPromptBuilder.test.js).

   MODULE AUTONOME : aucune dependance dure a js/app.js ni au module Bilan.
   - Le texte du template arrive en argument (`template`), jamais lu ici
     depuis un global. En production, index.js passe
     promptsExternesCharges['regard-recruteur'] (js/app.js) ou le repli.
   - La resolution des {CLE} est injectable (dependances.resoudrePlaceholders,
     meme signature que bilanResoudrePlaceholders) ; sinon un remplaceur
     minimal embarque fait l'affaire.
   ============================================================ */

// Repli integral si le fichier prompts/regard-recruteur.md n'a pas pu
// etre charge (ouverture locale sans serveur). Volontairement compact :
// il porte les regles non negociables, pas tout le detail des six axes.
var REGARD_RECRUTEUR_PROMPT_DEFAUT = [
  "Ce message est une consigne a executer, pas un document a commenter.",
  "",
  "Tu simules le regard qu'un recruteur peut porter sur un CV a la premiere lecture, pour aider la personne a reperer AVANT le recruteur ce qui ressort, ce qui pourrait faire hesiter, et les questions probables en entretien.",
  "",
  "REGLES ABSOLUES :",
  "1. Aucun verdict, aucune note, aucun score, aucun pourcentage. Jamais « bon / mauvais / faible / retenu / rejete ».",
  "2. Chaque doute est une question ou un point a verifier, jamais un constat sur la personne. Le sujet d'une remarque est toujours le document.",
  "3. Ta reponse est UNIQUEMENT le bloc JSON ci-dessous, rempli. Rien avant, rien apres.",
  "4. Ne signale jamais l'absence du nom, de la photo ou des coordonnees : elles ont ete masquees volontairement.",
  "5. Les rectangles de couleur unie qui cachent une zone sont un masquage volontaire : ignore-les, ne les compte jamais comme un defaut.",
  "6. Reponds en francais. N'utilise jamais de tiret long.",
  "",
  "Tu remplis six axes fixes, dans cet ordre : positif, coherence, message, premiere-lecture, presentation, couleurs.",
  "Chaque point : constat (toujours rempli, avec un extrait court cite si pertinent), lecture (comment un recruteur le lit), piste (une proposition concrete, facultative, jamais un ordre).",
  "positif : 2 a 5 points, constat seul, commence toujours par ce qui va, n'invente rien.",
  "coherence : 0 a 3 points (objectif emploi/stage, titre et accroche, dates et chevauchements).",
  "message : 0 a 5 points (registre de langage, logiciels nommes, ordre des experiences, loisirs, generaliste ou cible). Rappelle qu'aucune experience ne vaut moins qu'une autre.",
  "premiere-lecture : exactement 1 point, titre vide.",
  "presentation : afficher:false en mode texte ; sinon 3 a 6 points (mise en page, densite, hierarchie, longueur, police et taille). Jamais de jugement esthetique.",
  "couleurs : afficher:false en mode texte ; sinon 1 a 2 points (combien de couleurs ; codes de l'entreprise seulement si le site est fourni).",
  "",
  "questionsLieesAuCv : vise 5 questions (jusqu'a 8), classees par importance. Chacune { question, origine, ceQueLeRecruteurCherche, commentYRepondre }. origine obligatoire : l'element precis du CV qui motive la question ; une question sans origine claire ne doit pas etre proposee.",
  "",
  "CV inexploitable : reponds uniquement { \"analyseImpossible\": true, \"messageAnalyseImpossible\": \"...\" }.",
  "CV reel mais tres court : cvCourt:true, messageCvCourt encourageant, tu fais quand meme la lecture sur ce qui est la.",
  "",
  "Format (ta reponse entiere = ce bloc, rempli, JSON strictement valide) :",
  "```json",
  "{",
  "  \"modeAnalyse\": \"image\",",
  "  \"analyseImpossible\": false, \"messageAnalyseImpossible\": \"\",",
  "  \"cvCourt\": false, \"messageCvCourt\": \"\",",
  "  \"syntheseOuverture\": \"...\",",
  "  \"axes\": [",
  "    { \"id\": \"positif\", \"afficher\": true, \"points\": [ { \"titre\": \"\", \"constat\": \"...\", \"lecture\": \"\", \"piste\": \"\" } ] },",
  "    { \"id\": \"coherence\", \"afficher\": true, \"points\": [] },",
  "    { \"id\": \"message\", \"afficher\": true, \"points\": [] },",
  "    { \"id\": \"premiere-lecture\", \"afficher\": true, \"points\": [ { \"titre\": \"\", \"constat\": \"...\", \"lecture\": \"...\", \"piste\": \"...\" } ] },",
  "    { \"id\": \"presentation\", \"afficher\": true, \"points\": [] },",
  "    { \"id\": \"couleurs\", \"afficher\": true, \"points\": [] }",
  "  ],",
  "  \"questionsLieesAuCv\": [ { \"question\": \"...\", \"origine\": \"...\", \"ceQueLeRecruteurCherche\": \"...\", \"commentYRepondre\": \"...\" } ]",
  "}",
  "```",
  "",
  "## Donnees a lire",
  "",
  "**Mode d'analyse :** {MODE_ANALYSE}",
  "",
  "**CV en texte (mode texte uniquement) :**",
  "{CV_TEXTE}",
  "",
  "**Poste ou metier vise :** {POSTE_VISE}",
  "",
  "**Entreprise ciblee :** {ENTREPRISE}",
  "",
  "**Offre d'emploi :** {OFFRE}",
  "",
  "**Type de structure :** {TYPE_STRUCTURE}",
  "",
  "**Site internet de l'entreprise fourni :** {SITE_ENTREPRISE_FOURNI}",
  "",
  "**Couleurs dominantes du site de l'entreprise (si connues) :** {COULEURS_ENTREPRISE}"
].join('\n');

function _rrpTexte(v) {
  return (typeof v === 'string') ? v.trim() : '';
}

function _rrpOptionnel(v) {
  var t = _rrpTexte(v);
  return t || 'Non fourni.';
}

// Remplaceur minimal (repli si aucune fonction injectee) : meme forme de
// retour que bilanResoudrePlaceholders.
function _rrpResoudrePlaceholdersFallback(template, valeurs) {
  valeurs = valeurs || {};
  var nonResolus = [];
  var texte = String(template || '').replace(/\{([A-Z_]+)\}/g, function (tout, cle) {
    if (Object.prototype.hasOwnProperty.call(valeurs, cle) && valeurs[cle] != null) {
      return String(valeurs[cle]);
    }
    nonResolus.push(cle);
    return tout;
  });
  return { texte: texte, placeholdersNonResolus: nonResolus };
}

// entree : {
//   modeAnalyse: 'image' | 'texte',
//   cvTexte: string,               // mode texte uniquement
//   posteVise, entreprise, offre, typeStructure: string,
//   siteEntreprise: string,        // URL ; sa presence -> {SITE_ENTREPRISE_FOURNI}='oui'
//   couleursEntreprise: string
// }
// Renvoie { CLE: valeur } pret pour resoudrePlaceholders.
function regardRecruteurConstruireValeursPlaceholders(entree) {
  entree = entree || {};
  var modeAnalyse = (entree.modeAnalyse === 'texte') ? 'texte' : 'image';
  var siteFourni = _rrpTexte(entree.siteEntreprise).length > 0;

  var cvTexte;
  if (modeAnalyse === 'texte') {
    cvTexte = _rrpTexte(entree.cvTexte) || '(Aucun texte de CV colle.)';
  } else {
    cvTexte = '(Mode image : une a trois images du CV sont jointes a ce message. Aucun texte de CV n\'est fourni ici.)';
  }

  return {
    MODE_ANALYSE: modeAnalyse,
    CV_TEXTE: cvTexte,
    POSTE_VISE: _rrpOptionnel(entree.posteVise),
    ENTREPRISE: _rrpOptionnel(entree.entreprise),
    OFFRE: _rrpOptionnel(entree.offre),
    TYPE_STRUCTURE: _rrpOptionnel(entree.typeStructure),
    SITE_ENTREPRISE_FOURNI: siteFourni ? 'oui' : 'non',
    COULEURS_ENTREPRISE: siteFourni ? (_rrpTexte(entree.couleursEntreprise) || 'Non fournies (a observer sur le site si accessible).') : 'Sans objet (site non fourni).'
  };
}

// Construit le texte final a coller. template : le contenu de
// prompts/regard-recruteur.md (ou le repli REGARD_RECRUTEUR_PROMPT_DEFAUT
// si null / vide). Renvoie { texte, placeholdersNonResolus, modeAnalyse }.
function regardRecruteurConstruirePrompt(entree, dependances) {
  dependances = dependances || {};
  var template = _rrpTexte(dependances.template) || REGARD_RECRUTEUR_PROMPT_DEFAUT;
  var resoudre = dependances.resoudrePlaceholders
    || (typeof bilanResoudrePlaceholders === 'function' ? bilanResoudrePlaceholders : _rrpResoudrePlaceholdersFallback);

  var valeurs = regardRecruteurConstruireValeursPlaceholders(entree);
  var resultat = resoudre(template, valeurs);
  return {
    texte: resultat.texte,
    placeholdersNonResolus: resultat.placeholdersNonResolus || [],
    modeAnalyse: valeurs.MODE_ANALYSE
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    regardRecruteurConstruirePrompt: regardRecruteurConstruirePrompt,
    regardRecruteurConstruireValeursPlaceholders: regardRecruteurConstruireValeursPlaceholders,
    REGARD_RECRUTEUR_PROMPT_DEFAUT: REGARD_RECRUTEUR_PROMPT_DEFAUT
  };
}
