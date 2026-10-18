/* ============================================================
   Module « Un CV, plusieurs métiers » : LOGIQUE PURE des documents à télécharger (page 7). Aucun DOM, testé par Node (tests/unCvPlusieursMetiersDocuments.test.js).
   - La LETTRE : mise en page classique française sur une page A4 (décision de Denis du 2026-10-09) : coordonnées de la personne en haut à gauche, destinataire (employeur,
     recruteur) et « lieu, le date » à droite, puis le texte de la lettre (formule d'appel, corps, formule de politesse, signature), marges de 25 mm, même police que le CV.
   - Le DOCUMENT à imprimer : un document HTML dans lequel chaque CV et chaque lettre vit dans son propre compartiment étanche (shadow root déclaratif), pour que le style d'un
     modèle ne déforme jamais celui d'un autre (prototype du 2026-10-08, docs/CHANTIER_UN_CV_PLUSIEURS_METIERS_2026-09-30.md section 19).
   ============================================================ */

var UCPM_POLICE_LETTRE_DEFAUT = '"Segoe UI", Roboto, Arial, sans-serif';

function ucpmEchapperHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _ucpmTexteSimple(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }

// Les lignes de coordonnées de la personne (en haut à gauche) : nom, adresse, code postal et ville, téléphone, courriel. Une ligne vide est omise.
function ucpmCoordonneesLettre(identite) {
  var i = identite || {};
  var nom = [_ucpmTexteSimple(i.prenom), _ucpmTexteSimple(i.nom)].filter(Boolean).join(' ');
  var villeCp = [_ucpmTexteSimple(i.codePostal), _ucpmTexteSimple(i.ville)].filter(Boolean).join(' ');
  return [nom, _ucpmTexteSimple(i.adresse), villeCp, _ucpmTexteSimple(i.telephone), _ucpmTexteSimple(i.email)].filter(Boolean);
}

// Les lignes du destinataire (à droite) : l'employeur et le recruteur seulement s'ils sont connus ; sinon rien (la lettre sert alors à plusieurs structures).
function ucpmDestinataireLettre(objectif) {
  var o = objectif || {};
  var recruteur = [_ucpmTexteSimple(o.civiliteRecruteur), _ucpmTexteSimple(o.nomRecruteur)].filter(Boolean).join(' ');
  return [_ucpmTexteSimple(o.employeur), recruteur].filter(Boolean);
}

// « Limoges, le 10 octobre 2026 » ; sans ville connue : « Le 10 octobre 2026 ». dateTexte vient de ucpmDateEnTexte (« 10 octobre 2026 », « 1er » le premier du mois).
function ucpmLieuDateLettre(identite, dateTexte) {
  var ville = _ucpmTexteSimple(identite && identite.ville);
  var d = _ucpmTexteSimple(dateTexte);
  return ville ? ville + ', le ' + d : 'Le ' + d;
}

// Les paragraphes du texte de la lettre : séparés par une ligne vide ; les lignes d'un même paragraphe restent ensemble.
function ucpmParagraphesLettre(texte) {
  var NL = String.fromCharCode(10);
  var lignes = String(texte == null ? '' : texte).split(String.fromCharCode(13)).join('').split(NL);
  var paragraphes = [];
  var courant = [];
  lignes.forEach(function (l) {
    if (!l.trim()) { if (courant.length) { paragraphes.push(courant); courant = []; } return; }
    courant.push(l.trim());
  });
  if (courant.length) { paragraphes.push(courant); }
  return paragraphes;
}

// Les règles de la feuille de lettre, dans son compartiment : A4, marges de 25 mm. La police est posée en ligne par ucpmHtmlLettre.
var UCPM_CSS_LETTRE =
  ':host{display:block;}' +
  '.ucpm-lettre{box-sizing:border-box;width:210mm;min-height:297mm;padding:25mm;background:#fff;color:#111;font-size:11pt;line-height:1.5;}' +
  '.ucpm-lettre p{margin:0 0 4.5mm 0;}' +
  '.ucpm-lettre .expediteur{margin:0 0 14mm 0;}' +
  '.ucpm-lettre .expediteur p{margin:0;}' +
  '.ucpm-lettre .expediteur p.nom{font-weight:700;}' +
  '.ucpm-lettre .destinataire{margin:0 0 12mm 95mm;}' +
  '.ucpm-lettre .destinataire p{margin:0;}' +
  '.ucpm-lettre .destinataire p.lieu-date{margin-top:4mm;}' +
  '.ucpm-lettre .corps p.signature{margin-top:6mm;}';

// La feuille de lettre en HTML. donnees = { identite, objectif, texte, dateTexte, police }.
function ucpmHtmlLettre(donnees) {
  var d = donnees || {};
  var coord = ucpmCoordonneesLettre(d.identite);
  var dest = ucpmDestinataireLettre(d.objectif);
  var paragraphes = ucpmParagraphesLettre(d.texte);
  var police = String(d.police || UCPM_POLICE_LETTRE_DEFAUT).replace(/"/g, "'");
  var h = '<div class="ucpm-lettre" style="font-family:' + ucpmEchapperHtml(police) + ';">';
  h += '<div class="expediteur">' + coord.map(function (l, k) { return '<p' + (k === 0 ? ' class="nom"' : '') + '>' + ucpmEchapperHtml(l) + '</p>'; }).join('') + '</div>';
  h += '<div class="destinataire">' + dest.map(function (l) { return '<p>' + ucpmEchapperHtml(l) + '</p>'; }).join('') + '<p class="lieu-date">' + ucpmEchapperHtml(ucpmLieuDateLettre(d.identite, d.dateTexte)) + '</p></div>';
  h += '<div class="corps">' + paragraphes.map(function (p, k) {
    var derniere = k === paragraphes.length - 1 && k > 0 && p.length === 1 && p[0].length <= 60;
    return '<p' + (derniere ? ' class="signature"' : '') + '>' + p.map(ucpmEchapperHtml).join('<br>') + '</p>';
  }).join('') + '</div></div>';
  return h;
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
    UCPM_CSS_LETTRE: UCPM_CSS_LETTRE, UCPM_CSS_IMPRESSION: UCPM_CSS_IMPRESSION, UCPM_POLICE_LETTRE_DEFAUT: UCPM_POLICE_LETTRE_DEFAUT,
    ucpmEchapperHtml: ucpmEchapperHtml, ucpmCoordonneesLettre: ucpmCoordonneesLettre, ucpmDestinataireLettre: ucpmDestinataireLettre,
    ucpmLieuDateLettre: ucpmLieuDateLettre, ucpmParagraphesLettre: ucpmParagraphesLettre, ucpmHtmlLettre: ucpmHtmlLettre,
    ucpmDocumentImpression: ucpmDocumentImpression, ucpmPagesDocument: ucpmPagesDocument, ucpmCssPourCompartiment: ucpmCssPourCompartiment,
    UCPM_MARGE_SECURITE_PX: UCPM_MARGE_SECURITE_PX, ucpmCvTresRempli: ucpmCvTresRempli, ucpmTexteAlerteCv: ucpmTexteAlerteCv
  };
}
