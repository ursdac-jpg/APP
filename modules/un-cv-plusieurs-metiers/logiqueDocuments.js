/* ============================================================
   Module « Un CV, plusieurs métiers » : LOGIQUE PURE des documents à télécharger (page 7). Aucun DOM, testé par Node (tests/unCvPlusieursMetiersDocuments.test.js).
   - La LETTRE : mise en page par les gabarits de la lettre seule (js/app.js, construireFeuilleLettreGabarit ; 24/10/2026, demande de Denis : tous les modèles, couleur et police du CV),
     plus bas : police et dossier prêtés à chaque lettre.
   - Le DOCUMENT à imprimer : un document HTML dans lequel chaque CV et chaque lettre vit dans son propre compartiment étanche (shadow root déclaratif), pour que le style d'un
     modèle ne déforme jamais celui d'un autre (prototype du 2026-10-08, docs/CHANTIER_UN_CV_PLUSIEURS_METIERS_2026-09-30.md section 19).
   ============================================================ */

function ucpmEchapperHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Les règles du document imprimé : pages A4 sans marge (les marges sont dans les feuilles), un saut de page après chaque pièce.
var UCPM_CSS_IMPRESSION =
  '@page{size:210mm 297mm;margin:0;}' +
  'html,body{margin:0;padding:0;background:#fff;}' +
  '.ucpm-feuille{display:block;break-after:page;page-break-after:always;}' +
  '.ucpm-feuille:last-child{break-after:auto;page-break-after:auto;}';

// Le document complet à imprimer. titre = titre du document (nom du fichier PDF proposé) ; feuilles = [{ css, html }] dans l'ordre d'impression.
// Chaque feuille est enfermée dans son compartiment (shadow root déclaratif) : ses règles ne touchent jamais les autres.
function ucpmDocumentImpression(titre, feuilles) {
  var corps = (feuilles || []).map(function (f) {
    return '<div class="ucpm-feuille"><template shadowrootmode="open"><style>:host{display:block;}' + (f.css || '') + '</style>' + (f.html || '') + '</template></div>';
  }).join('');
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>' + ucpmEchapperHtml(titre) + '</title><style>' + UCPM_CSS_IMPRESSION + '</style></head><body>' + corps + '</body></html>';
}

// Règles de style d'un CV rendu par le moteur, prêtes pour un compartiment étanche (shadow root). Le moteur définit ses couleurs et ses échelles de taille (--cv, --col, --k, --kh, --tt...)
// sur « :root » ; dans un compartiment, « :root » ne désigne rien et le CV perdrait couleurs et tailles : on le remplace par « :host ».
function ucpmCssPourCompartiment(css) {
  return String(css == null ? '' : css).replace(/:root\b/g, ':host');
}

// ---------------- Lettres mises en page par les gabarits de la lettre (24/10/2026, demande de Denis : tous les modeles, couleur du CV) ----------------

// Police de la lettre a partir de celle du CV (jeton de l'editeur de CV : segoe, georgia, times, garamond...). La lettre n'en propose que trois : Georgia, Times New Roman, Arial.
// Une police a empattements reste a empattements ; toute autre devient Arial ; rien de connu : Georgia, la police d'origine de la lettre.
function ucpmPoliceLettreDepuisCv(jeton) {
  var j = String(jeton == null ? '' : jeton).toLowerCase();
  if (!j) { return 'Georgia'; }
  if (j.indexOf('georgia') >= 0) { return 'Georgia'; }
  if (/times|garamond|palatino|serif/.test(j) && j.indexOf('sans') < 0) { return 'Times New Roman'; }
  return 'Arial';
}

// Le dossier prete a UN CV, completé pour que les gabarits de la lettre y trouvent tout : texte de la lettre, entreprise et recruteur de l'objectif, titre du CV (poste),
// modele choisi, police du CV. La couleur n'est pas posee ici : les gabarits lisent celle du CV dans ce meme dossier. Modifie et retourne la copie.
// donnees = { texte, employeur, civiliteRecruteur, nomRecruteur, titre, gabarit, jetonPolice }.
function ucpmPreparerDossierLettre(copie, donnees) {
  var d = donnees || {};
  var c = copie || {};
  c.ia = c.ia || {};
  c.ia.lettre = { lettre: { objet: '', texte: String(d.texte == null ? '' : d.texte) } };
  c.rechercheCandidature = { entreprise: String(d.employeur || '').trim(), civiliteRecruteur: d.civiliteRecruteur || '', nomRecruteur: String(d.nomRecruteur || '').trim() };
  c.objectif = '';
  c.metierCible = String(d.titre || '');
  c.titreCV = String(d.titre || c.titreCV || '');
  c.lettreDestinataire = { choix: 'recrutement', gabarit: d.gabarit || 'g0', police: ucpmPoliceLettreDepuisCv(d.jetonPolice), couleur: '', icones: true, coordLigne: false };
  return c;
}

// Marge de sécurité d'impression (décision de Denis, plan de la nuit) : sous cet espace libre en bas de page, un CV d'une page à l'écran risque de passer sur deux à l'impression
// (cas relevé le 2026-10-07 : 33 px libres, deux pages ; les CV de 63 px et plus ne débordaient pas ; essais du 2026-10-10 : de 67 à 317 px, une page partout).
var UCPM_MARGE_SECURITE_PX = 40;

function ucpmCvTresRempli(libre, nbPages) {
  return (nbPages || 1) <= 1 && typeof libre === 'number' && libre < UCPM_MARGE_SECURITE_PX;
}

// Le message sous un CV : plusieurs pages (mesuré), ou très rempli (risque), ou rien. Information seulement, jamais bloquant.
function ucpmTexteAlerteCv(nbPages, libre) {
  if ((nbPages || 1) > 1) { return 'Ce CV passe sur ' + nbPages + ' pages.'; }
  if (ucpmCvTresRempli(libre, nbPages)) { return 'Ce CV est très rempli : il risque de passer sur deux pages à l’impression. Vérifiez l’aperçu et, si besoin, raccourcissez un texte ou changez de modèle.'; }
  return '';
}

// Nombre de pages annoncé : les pages de chaque CV, plus une page par lettre.
function ucpmPagesDocument(pagesParCv, nbLettres) {
  var total = 0;
  (pagesParCv || []).forEach(function (n) { total += Math.max(1, parseInt(n, 10) || 1); });
  return total + Math.max(0, nbLettres || 0);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UCPM_CSS_IMPRESSION: UCPM_CSS_IMPRESSION, ucpmEchapperHtml: ucpmEchapperHtml,
    ucpmDocumentImpression: ucpmDocumentImpression, ucpmPagesDocument: ucpmPagesDocument, ucpmCssPourCompartiment: ucpmCssPourCompartiment,
    ucpmPoliceLettreDepuisCv: ucpmPoliceLettreDepuisCv, ucpmPreparerDossierLettre: ucpmPreparerDossierLettre,
    UCPM_MARGE_SECURITE_PX: UCPM_MARGE_SECURITE_PX, ucpmCvTresRempli: ucpmCvTresRempli, ucpmTexteAlerteCv: ucpmTexteAlerteCv
  };
}
