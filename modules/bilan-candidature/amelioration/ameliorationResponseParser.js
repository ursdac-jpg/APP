/* ============================================================
   modules/bilan-candidature/amelioration/ameliorationResponseParser.js
   ------------------------------------------------------------
   Interprete le texte colle par l'utilisateur (reponse du Prompt 2) en
   PropositionAmelioration. Reutilise extraireBlocJSONDepuisTexte()
   (js/app.js, deja exportee pour diagnosticResponseParser.js) -- meme
   fonction, pas une seconde extraction JSON a maintenir.

   PAS d'anomalies[] ici, decision deliberee (pas de complexite
   anticipee) : diagnosticResponseParser.js utilise ce systeme parce
   qu'il reconstruit INDEPENDAMMENT plusieurs entrees d'un tableau (des
   axes, des recommandations) -- chacune peut echouer sans affecter les
   autres. Ici, il n'y a qu'UN SEUL objet a construire (relation 1:1,
   voir architecture du Prompt 2) : soit il contient assez pour etre
   utile, soit non. Un systeme d'anomalies typees n'apporterait rien de
   plus qu'un code d'erreur precis -- ne pas l'introduire sans besoin
   demontre.

   demandeAmeliorationId et recommandationId ne sont JAMAIS lus depuis
   la reponse de l’assistant -- toujours depuis la DemandeAmelioration
   d'origine, deja connue avec certitude (meme principe que
   niveauAnalyse au Prompt 1).
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilARP = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilARP.bilanCreerErreurMetier;
  var bilanAssainirTypographieProfond = _bilanUtilARP.bilanAssainirTypographieProfond;
  var _bilanPAARP = require('../modeles/propositionAmelioration.js');
  var bilanCreerPropositionAmelioration = _bilanPAARP.bilanCreerPropositionAmelioration;
  var bilanPropositionAmeliorationEstValide = _bilanPAARP.bilanPropositionAmeliorationEstValide;
}

function bilanListeDeChainesARP(valeur) {
  if (!Array.isArray(valeur)) { return []; }
  return valeur.filter(function (v) { return typeof v === 'string' && v.trim().length > 0; });
}

// demandeAmelioration : la DemandeAmelioration d'origine -- source des
// identifiants, jamais la reponse collee.
// dependances : { extraireJSON } -- injectable, defaut = extraireBlocJSONDepuisTexte (js/app.js).
// Retourne une PropositionAmelioration. Leve ReponseIllisible (aucun
// JSON) ou ReponseIncomplete (proposition ou justification absente --
// rien d'exploitable). actionsConcretes manquant ou mal forme retombe
// silencieusement sur un tableau vide : ce n'est jamais un echec (voir
// prompts/bilan-v2.md, "une liste vide est un resultat normal").
function bilanParserReponseAmelioration(texteColle, demandeAmelioration, dependances) {
  dependances = dependances || {};
  var extraireJSON = dependances.extraireJSON || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null);

  if (typeof extraireJSON !== 'function') {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucune fonction d\'extraction JSON disponible (ni injectée, ni globale).');
  }
  if (!demandeAmelioration || !demandeAmelioration.id || !demandeAmelioration.recommandationSelectionnee) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'Aucune DemandeAmelioration valide fournie au parseur.');
  }

  var extraction = extraireJSON(texteColle);
  if (!extraction) {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucun bloc JSON identifiable dans le texte collé.');
  }
  // TACHE (retour Denis, 2026-08-31) : jamais de tiret cadratin dans un
  // texte affiche -- filet applicatif sur la reponse du Prompt 2 (voir
  // bilanAssainirTypographieProfond).
  extraction = bilanAssainirTypographieProfond(extraction);

  var proposition = (typeof extraction.proposition === 'string') ? extraction.proposition.trim() : '';
  var justification = (typeof extraction.justification === 'string') ? extraction.justification.trim() : '';
  if (!proposition || !justification) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'proposition ou justification absente : rien d\'exploitable à présenter.', { propositionPresente: !!proposition, justificationPresente: !!justification });
  }

  var propositionAmelioration = bilanCreerPropositionAmelioration({
    demandeAmeliorationId: demandeAmelioration.id,
    recommandationId: demandeAmelioration.recommandationSelectionnee.id,
    proposition: proposition,
    justification: justification,
    actionsConcretes: bilanListeDeChainesARP(extraction.actionsConcretes),
    // TACHE (contrat Niveau 2, 2026-08-11) : valeur hors enumeration ou
    // absente retombe sur null via bilanCreerPropositionAmelioration --
    // jamais un echec de ce seul champ, meme discipline qu'actionsConcretes
    // (voir prompts/bilan-v2.md, section 6 : sans objet si extraitConcerne
    // present).
    action: extraction.action
  });

  if (!bilanPropositionAmeliorationEstValide(propositionAmelioration)) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'PropositionAmelioration reconstruite invalide malgré les vérifications préalables.', { propositionAmelioration: propositionAmelioration });
  }

  return propositionAmelioration;
}

// TACHE (point 11, stabilisation Bilan, 2026-08-22, DECISION DE DENIS --
// evolution raisonnable, jamais une refonte) : parse UN TABLEAU JSON
// (reponse du Prompt 2 LOT) en plusieurs PropositionAmelioration --
// reutilise integralement bilanCreerPropositionAmelioration()/
// bilanPropositionAmeliorationEstValide() (memes constructeurs que la
// version 1:1, jamais dupliques). extraireBlocJSONDepuisTexte() est
// appelee avec son 2e argument (accepterTableau=true, ajoute pour ce seul
// besoin, comportement inchange pour tout autre appelant) -- jamais une
// 2e fonction d'extraction JSON a maintenir.
// demandesAmelioration : tableau des DemandeAmelioration du lot (memes
// que celles envoyees au prompt) -- sert a retrouver, pour chaque objet
// du tableau reponse, sa recommandation d'origine via son "id".
function bilanParserReponseAmeliorationLot(texteColle, demandesAmelioration, dependances) {
  dependances = dependances || {};
  var extraireJSON = dependances.extraireJSON || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null);

  if (typeof extraireJSON !== 'function') {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucune fonction d\'extraction JSON disponible (ni injectée, ni globale).');
  }
  if (!Array.isArray(demandesAmelioration) || !demandesAmelioration.length) {
    throw bilanCreerErreurMetier('RecommandationInexistante', 'Aucune DemandeAmelioration fournie au parseur du lot.');
  }

  var extraction = extraireJSON(texteColle, true);
  if (!extraction || !Array.isArray(extraction)) {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucun tableau JSON identifiable dans le texte collé.');
  }
  // TACHE (retour Denis, 2026-08-31) : cf. version 1:1 ci-dessus.
  extraction = bilanAssainirTypographieProfond(extraction);

  // TACHE (correctif "suggestion pertinente par experience", Carte 3,
  // 2026-08-25) : correspondance par demande.id (unique par construction,
  // meme pour 2 demandes issues de la MEME recommandation -- voir
  // modeles/demandeAmelioration.js), plutot que par recommandationSelectionnee.id.
  // Avant ce correctif, 2 demandes de la meme recommandation (une
  // recommandation appliquee a plusieurs experiences) collisionnaient sur
  // cette meme cle -- la derniere ecrasait silencieusement les autres.
  // ameliorationPromptBuilder.js envoie deja demande.id comme identifiant
  // de bloc (RECOMMANDATION_ID) -- symetrique cote lecture.
  var demandesParId = {};
  demandesAmelioration.forEach(function (d) {
    if (d && d.id) { demandesParId[d.id] = d; }
  });

  var propositions = [];
  extraction.forEach(function (item) {
    if (!item || typeof item !== 'object') { return; }
    var idDemande = (typeof item.id === 'string') ? item.id.trim() : '';
    var demande = demandesParId[idDemande];
    // TACHE (meme discipline tolerante que la version 1:1) : un element du
    // tableau dont l'id ne correspond a aucune demande du lot (invente,
    // deforme...) est ignore SILENCIEUSEMENT -- jamais un echec de tout le
    // lot pour UN seul element mal forme, chaque recommandation reste
    // independante des autres (voir prompts/bilan-v2-lot.md, section 2).
    if (!demande) { return; }

    var proposition = (typeof item.proposition === 'string') ? item.proposition.trim() : '';
    var justification = (typeof item.justification === 'string') ? item.justification.trim() : '';
    if (!proposition || !justification) { return; }

    var propositionAmelioration = bilanCreerPropositionAmelioration({
      demandeAmeliorationId: demande.id,
      recommandationId: demande.recommandationSelectionnee.id,
      proposition: proposition,
      justification: justification,
      actionsConcretes: bilanListeDeChainesARP(item.actionsConcretes),
      action: item.action,
      // TACHE (meme correctif) : `false` uniquement si l’assistant l'a explicitement
      // ecrit -- absent ou toute autre valeur retombe sur `true` (comportement
      // par defaut inchange, voir bilanCreerPropositionAmelioration).
      pertinent: item.pertinent !== false
    });
    if (bilanPropositionAmeliorationEstValide(propositionAmelioration)) { propositions.push(propositionAmelioration); }
  });

  if (!propositions.length) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'Aucune proposition exploitable dans le tableau collé.', { nombreElementsRecus: extraction.length });
  }

  return propositions;
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanParserReponseAmelioration: bilanParserReponseAmelioration,
    bilanParserReponseAmeliorationLot: bilanParserReponseAmeliorationLot
  };
}
