/* ============================================================
   modules/mes-competences/exportDocx.js
   Word du document « Mes compétences » : un vrai .docx fabriqué avec la librairie docx, comme la fiche d'entretien
   (modules/entretien-editor/exportDocxNatifEntretien.js, même chargement de la librairie : chargerLibrairieDocxNatif).
   Le contenu vient des blocs communs (mesCompBlocsDocument, logique.js) : ce sont les mêmes lignes que l'écran et le PDF.
   Les cases « phrases de mes documents » et « phrases pour l'oral » sont respectées. Fonction de construction pure (reçoit `docx`), donc testable dans Node.
   ============================================================ */

var MESCOMP_DOCX_BLEU = '0B4FB3';

// docx : la librairie ; blocs : mesCompBlocsDocument(doc) ; options : { preuves, oral } (vrai = montrer). Renvoie un docx.Document.
function mesCompConstruireDocx(docx, blocs, options) {
  var opt = options || {};
  var Paragraph = docx.Paragraph, TextRun = docx.TextRun, BorderStyle = docx.BorderStyle;
  var TEXTE = '1B1B1B', DISCRET = '555555';
  function run(texte, o) {
    o = o || {};
    return new TextRun({ text: texte, bold: !!o.gras, italics: !!o.italique, size: o.taille || 22, color: o.couleur || TEXTE, font: o.police || 'Georgia' });
  }
  var enfants = [];
  blocs.forEach(function (b) {
    if (b.t === 'titre') {
      enfants.push(new Paragraph({ spacing: { after: 60 }, children: [run(b.texte, { gras: true, taille: 40 })] }));
    } else if (b.t === 'meta') {
      enfants.push(new Paragraph({ spacing: { after: 40 }, children: [run(b.texte, { taille: 18, couleur: DISCRET, police: 'Calibri' })] }));
    } else if (b.t === 'section') {
      enfants.push(new Paragraph({
        spacing: { before: 280, after: 120 }, keepNext: true,
        border: { bottom: { color: MESCOMP_DOCX_BLEU, space: 3, style: BorderStyle.SINGLE, size: 12 } },
        children: [run(b.texte.toUpperCase(), { gras: true, taille: 20, couleur: MESCOMP_DOCX_BLEU, police: 'Calibri' })]
      }));
    } else if (b.t === 'pied') {
      enfants.push(new Paragraph({ spacing: { before: 240 }, children: [run(b.texte, { taille: 17, couleur: DISCRET, police: 'Calibri' })] }));
    } else {
      // Une ligne (compétence) ou une envie : le libellé en gras, ses notes en discret, puis ses phrases.
      var tete = [run(b.libelle, { gras: true })];
      if (b.notes && b.notes.length) { tete.push(run(' (' + b.notes.join(', ') + ')', { italique: true, taille: 19, couleur: DISCRET })); }
      enfants.push(new Paragraph({ spacing: { before: 140, after: 30 }, keepNext: true, children: tete }));
      if (b.pourLeCV) { enfants.push(new Paragraph({ spacing: { after: 30 }, children: [run('Pour mon CV : ' + b.pourLeCV, { taille: 20 })] })); }
      if (b.preuves && opt.preuves !== false) { enfants.push(new Paragraph({ spacing: { after: 30 }, children: [run(b.preuves, { italique: true, taille: 19, couleur: DISCRET })] })); }
      if (b.oral && opt.oral !== false) { enfants.push(new Paragraph({ spacing: { after: 30 }, children: [run('À l’oral : « ' + b.oral + ' »', { taille: 20 })] })); }
    }
  });
  return new docx.Document({
    creator: 'APP',
    title: 'Mes compétences',
    sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 1100, right: 1100 } } }, children: enfants }]
  });
}

// Promesse d'un Blob .docx pour le document final (options de l'état du module : preuves, oral).
function mesCompGenererDocx(doc) {
  return chargerLibrairieDocxNatif().then(function (docx) {
    return docx.Packer.toBlob(mesCompConstruireDocx(docx, mesCompBlocsDocument(doc), { preuves: doc.preuves, oral: doc.oral }));
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mesCompConstruireDocx: mesCompConstruireDocx };
}
