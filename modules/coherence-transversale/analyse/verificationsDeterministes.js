/* ============================================================
   modules/coherence-transversale/analyse/verificationsDeterministes.js
   ------------------------------------------------------------
   Constats calcules par l'application, SANS appel IA -- l'application
   tranche seule ce qu'elle peut trancher, meme discipline que le reste
   d'ERIP (voir docs/LECONS_A_NE_PAS_REPRODUIRE.md, section "verifications
   deterministes avant tout appel IA").

   Perimetre V1 : duplication exacte de texte (CV <-> lettre, accroche du
   CV <-> lettre) -- le cas concret explicitement demande par Denis
   ("la phrase d'accroche du CV ne doit jamais se retrouver mot pour mot
   dans la lettre"). Les incoherences de dates ne sont PAS traitees ici :
   contrairement au Bilan (qui dispose de dates structurees via
   analyse/faitsExtractor.js), ce module ne recoit que du texte libre --
   extraire des dates fiables depuis du texte brut par heuristique serait
   fragile (faux positifs/negatifs), garde en reserve pour une version
   future si un besoin reel et un moyen fiable se confirment (jamais par
   anticipation, invariant 4 de CONTRATS.md).
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilVerif = require('../modeles/utilitaires.js');
  var ctGenererId = _ctUtilVerif.ctGenererId;
}

// Longueur minimale (caracteres) pour qu'une phrase dupliquee soit
// signalee -- evite les faux positifs sur des formules courtes et
// generiques ("Cordialement.", "Bonjour Madame, Monsieur.").
var CT_SEUIL_LONGUEUR_DUPLICATION = 30;

function ctDecouperPhrases(texte) {
  if (!texte) { return []; }
  return texte
    .split(/[\n\r]+/)
    .reduce(function (acc, ligne) { return acc.concat(ligne.split(/(?<=[.!?])\s+/)); }, [])
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s.length > 0; });
}

function ctNormaliserPourComparaison(phrase) {
  return phrase.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Compare les phrases du CV et de la lettre, signale toute phrase
// identique (une fois normalisee : casse et espaces ignores, jamais le
// sens) au-dela du seuil de longueur. index de depart transmis pour que
// les ids restent stables si combine avec d'autres verifications.
function ctDetecterDuplicationCvLettre(dossier, indexDepart) {
  var constats = [];
  var index = indexDepart || 0;
  var phrasesCv = ctDecouperPhrases(dossier.cv);
  var phrasesLettre = ctDecouperPhrases(dossier.lettre);

  phrasesCv.forEach(function (phraseCv) {
    if (phraseCv.length < CT_SEUIL_LONGUEUR_DUPLICATION) { return; }
    var normaliseeCv = ctNormaliserPourComparaison(phraseCv);
    phrasesLettre.forEach(function (phraseLettre) {
      if (ctNormaliserPourComparaison(phraseLettre) !== normaliseeCv) { return; }
      constats.push({
        id: 'constat-' + index,
        ancrage: ['cv', 'lettre'],
        nature: 'duplication',
        dimension: 'formulation',
        preuve: [phraseCv, phraseLettre],
        message: 'Cette phrase du CV est reprise mot pour mot dans la lettre de motivation : « ' + phraseCv + ' ». L\'idée peut être reprise, mais gagnerait à être formulée différemment.',
        confiance: 'certaine'
      });
      index += 1;
    });
  });

  return constats;
}

// Cas particulier explicitement demande par Denis : la phrase d'accroche
// du CV (dossier.ia.cv.profil, distincte du texte du CV lui-meme -- voir
// hostDataAdapter.js) ne doit jamais se retrouver mot pour mot dans la
// lettre. Recherche de sous-chaine (pas phrase par phrase : l'accroche
// est deja une unite complete).
function ctDetecterDuplicationAccroche(dossier, indexDepart) {
  var index = indexDepart || 0;
  if (!dossier.accrocheCv || dossier.accrocheCv.length < CT_SEUIL_LONGUEUR_DUPLICATION || !dossier.lettre) { return []; }
  var accrocheNormalisee = ctNormaliserPourComparaison(dossier.accrocheCv);
  var lettreNormalisee = ctNormaliserPourComparaison(dossier.lettre);
  if (lettreNormalisee.indexOf(accrocheNormalisee) === -1) { return []; }
  return [{
    id: 'constat-' + index,
    ancrage: ['cv.accroche', 'lettre'],
    nature: 'duplication',
    dimension: 'formulation',
    preuve: [dossier.accrocheCv],
    message: 'La phrase d\'accroche du CV est recopiée mot pour mot dans la lettre de motivation. L\'idée peut être reprise, mais la formulation doit être différente.',
    confiance: 'certaine'
  }];
}

// Point d'entree : toutes les verifications deterministes, ids uniques
// et stables sur l'ensemble du resultat combine.
function ctExecuterVerificationsDeterministes(dossier) {
  dossier = dossier || {};
  var constatsCvLettre = ctDetecterDuplicationCvLettre(dossier, 0);
  var constatsAccroche = ctDetecterDuplicationAccroche(dossier, constatsCvLettre.length);
  return constatsCvLettre.concat(constatsAccroche);
}

if (typeof module !== 'undefined') {
  module.exports = {
    CT_SEUIL_LONGUEUR_DUPLICATION: CT_SEUIL_LONGUEUR_DUPLICATION,
    ctDecouperPhrases: ctDecouperPhrases,
    ctNormaliserPourComparaison: ctNormaliserPourComparaison,
    ctDetecterDuplicationCvLettre: ctDetecterDuplicationCvLettre,
    ctDetecterDuplicationAccroche: ctDetecterDuplicationAccroche,
    ctExecuterVerificationsDeterministes: ctExecuterVerificationsDeterministes
  };
}
