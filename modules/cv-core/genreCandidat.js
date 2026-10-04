/* ============================================================
   modules/cv-core/genreCandidat.js
   ------------------------------------------------------------
   Genre grammatical du candidat (retour Denis 2026-10-01 : « le titre et l'accroche étaient au masculin alors que la personne est une femme :
   incohérence majeure »). SOURCE UNIQUE de la consigne d'accord, utilisée par tous les prompts qui écrivent du texte sur la personne
   (CV, lettre, entretien, Découverte, Reformuler, Bilan : titre, accroche et améliorations).

   - genreDuCandidat(source)      : 'feminin' (Madame) | 'masculin' (Monsieur) | 'inconnu' (civilité vide ou « Ne pas préciser »).
   - consigneGenreCandidat(source): une consigne de style, jamais une donnée d'identité (nom, prénom, téléphone ne sont jamais transmis).
                                    Quand le genre est inconnu, on ne met JAMAIS le masculin par défaut : l'assistant lit les accords déjà
                                    écrits dans le CV, sinon il écrit à la forme neutre.
   source : le dossier (objet avec identite.civilite), par défaut le dossier global du navigateur.
   ============================================================ */

function genreDuCandidat(source) {
  var d = source || ((typeof dossier !== 'undefined') ? dossier : null);
  var civilite = String((d && d.identite && d.identite.civilite) || '').trim().toLowerCase();
  if (civilite === 'madame' || civilite === 'mme') { return 'feminin'; }
  if (civilite === 'monsieur' || civilite === 'm.' || civilite === 'm') { return 'masculin'; }
  return 'inconnu';
}

function consigneGenreCandidat(source) {
  var genre = genreDuCandidat(source);
  var exemples = '(par exemple « expérimentée » ou « expérimenté », « cheffe d’équipe » ou « chef d’équipe », « assistante » ou « assistant », « habituée » ou « habitué »)';
  var portee = 'Cet accord vaut pour TOUT le texte qui décrit la personne : le titre du CV, la phrase d’accroche, les intitulés de poste, les adjectifs et les participes passés. ' +
    'Il ne concerne pas la formule d’adresse au destinataire d’une lettre (« Madame, » ou « Monsieur, »), qui dépend du recruteur.';
  if (genre === 'feminin') {
    return 'Genre du candidat : féminin (Madame). Accorde au féminin tout ce qui la décrit ' + exemples + '. ' + portee;
  }
  if (genre === 'masculin') {
    return 'Genre du candidat : masculin (Monsieur). Accorde au masculin tout ce qui le décrit ' + exemples + '. ' + portee;
  }
  return 'Genre du candidat : non précisé. Lis d’abord les accords déjà écrits dans le CV ou dans les informations de la personne ' + exemples + ' et suis-les, sans en changer. ' +
    'S’il n’y en a aucun, écris à la forme neutre : intitulés épicènes, tournures sans adjectif ni participe passé accordé. N’écris jamais au masculin par défaut. ' + portee;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { genreDuCandidat: genreDuCandidat, consigneGenreCandidat: consigneGenreCandidat };
}
