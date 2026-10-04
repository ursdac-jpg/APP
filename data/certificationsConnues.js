/* ============================================================
   data/certificationsConnues.js  (2026-09-30, demande de Denis)
   ------------------------------------------------------------
   Liste de REFERENCE de certifications, habilitations et attestations courantes (secourisme, sécurité, conduite, hygiène,
   langues, numérique...). Elle sert UNIQUEMENT à poser une question à la personne quand un intitulé importé d'un CV ressemble
   à l'un d'eux sans être écrit pareil (ex. « sSsT » proche de « SST » : « Vouliez-vous dire SST ? »).
   Jamais une correction automatique : la personne valide (ou corrige) toujours. Liste à compléter au fil des CV réels :
   il suffit d'ajouter l'intitulé, écrit comme il doit apparaître, dans CERTIFICATIONS_CONNUES.
   Fonction pure, testée en Node (tests/panneauCandidaturePartage.test.js). Chargé par index.html avant data/metiers.js.
   ============================================================ */

var CERTIFICATIONS_CONNUES = [
  // Secourisme et sécurité
  'SST', 'PSC1', 'PSE1', 'PSE2', 'AFPS', 'BNSSA', 'SSIAP 1', 'SSIAP 2', 'SSIAP 3', 'Gestes et postures', 'PRAP',
  'Habilitation électrique', 'H0B0', 'B1V', 'BS', 'BR', 'Certiphyto', 'HACCP',
  // Conduite et transport
  'CACES', 'CACES R482', 'CACES R483', 'CACES R485', 'CACES R486', 'CACES R489', 'CACES R490', 'FIMO', 'FCO', 'ADR',
  'Permis B', 'Permis C', 'Permis D', 'Permis E', 'Permis BE',
  // Animation, éducation, santé, social
  'BAFA', 'BAFD', 'BPJEPS', 'DEAES', 'DEAVS', 'DEAS', 'DEAP', 'AGFS', 'CQP',
  // Langues et numérique
  'TOEIC', 'TOEFL', 'DELF', 'DALF', 'DILF', 'Bulats', 'Linguaskill', 'Certificat Voltaire', 'PIX', 'TOSA', 'ICDL', 'CléA'
];

// Attestations courtes qui vont dans « Certifications » et jamais dans « Formations » (ni dans « Loisirs »). Les diplômes et
// titres (BAFA, DEAES, BPJEPS, permis...) n'en font pas partie : leur place dépend du CV, on ne les déplace jamais.
var ATTESTATIONS_COURTES = [
  'SST', 'PSC1', 'PSE1', 'PSE2', 'AFPS', 'HACCP', 'Certiphyto', 'Habilitation électrique', 'H0B0', 'B1V', 'Gestes et postures', 'PRAP',
  'CACES', 'CACES R482', 'CACES R483', 'CACES R485', 'CACES R486', 'CACES R489', 'CACES R490', 'SSIAP 1', 'SSIAP 2', 'SSIAP 3',
  'TOEIC', 'TOEFL', 'TOSA', 'ICDL', 'PIX', 'CléA', 'Bulats', 'Linguaskill', 'FIMO', 'FCO', 'ADR'
];
function _certifCle(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

// Distance d'édition (insertion, suppression, remplacement, échange de deux lettres voisines).
function _distanceCertif(a, b) {
  var m = a.length, n = b.length, d = [], i, j;
  for (i = 0; i <= m; i++) { d[i] = [i]; }
  for (j = 1; j <= n; j++) { d[0][j] = j; }
  for (i = 1; i <= m; i++) {
    for (j = 1; j <= n; j++) {
      var cout = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cout);
      if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

// L'intitulé seul, sans la parenthèse « (organisme, lieu, date) » que l'import peut ajouter.
function _intituleCertifSeul(texte) {
  var m = /^(.*?)\s*\([^()]*\)\s*$/.exec(String(texte || '').trim());
  return (m && m[1].trim()) ? m[1].trim() : String(texte || '').trim();
}

// Renvoie l'intitulé connu le plus proche (écrit comme il doit l'être), ou null si l'intitulé est déjà exact,
// s'il ne ressemble à aucun intitulé connu, ou s'il est trop court pour comparer sans risque.
function suggestionCertificationConnue(texte) {
  var cle = _certifCle(_intituleCertifSeul(texte));
  if (cle.length < 3 || cle.length > 14) { return null; }
  // Diplômes courants qui ressemblent à une certification de la liste (CAP / CQP) : jamais une faute.
  if (['cap', 'bep', 'bac', 'bts', 'dut', 'but', 'cfg', 'dnb', 'deug'].indexOf(cle) !== -1) { return null; }
  var meilleur = null, meilleureDistance = 99;
  for (var i = 0; i < CERTIFICATIONS_CONNUES.length; i++) {
    var cleConnue = _certifCle(CERTIFICATIONS_CONNUES[i]);
    if (cleConnue === cle) { return null; }
    // « CACES 3 », « PSC » : variante ou suite d'un intitulé connu (une catégorie, un numéro), pas une faute de frappe.
    if (cle.indexOf(cleConnue) === 0 || cleConnue.indexOf(cle) === 0) { continue; }
    var seuil = cleConnue.length >= 7 ? 2 : 1;
    var dist = _distanceCertif(cle, cleConnue);
    if (dist <= seuil && dist < meilleureDistance) { meilleur = CERTIFICATIONS_CONNUES[i]; meilleureDistance = dist; }
  }
  return meilleur;
}

// Vrai si l'intitulé (sans parenthèse) est EXACTEMENT une attestation courte de la liste ci-dessus.
function estAttestationCourte(texte) {
  var cle = _certifCle(_intituleCertifSeul(texte));
  return !!cle && ATTESTATIONS_COURTES.some(function (x) { return _certifCle(x) === cle; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CERTIFICATIONS_CONNUES: CERTIFICATIONS_CONNUES, suggestionCertificationConnue: suggestionCertificationConnue, estAttestationCourte: estAttestationCourte };
}
