/* ============================================================
   Module « Découvrir mes compétences » : écran 4, « Mes compétences » (le document).
   Maquette : docs/MAQUETTE_MES_COMPETENCES_2026-10-26.html (écran « Mon document »). Le contenu vient de mesCompDocumentFinal (logique.js) : seules les lignes
   que la personne a gardées y entrent. PDF par imprimerLettrePdf (même impression que la lettre et la fiche d'entretien), copie du texte par mesCompTexteDocument.
   Word : exportDocx.js (même librairie que la fiche d'entretien), mêmes blocs que l'écran et le PDF.
   ============================================================ */

// Le corps de la feuille (sans <html>), partagé par l'écran et le PDF : il dessine les blocs communs (mesCompBlocsDocument, logique.js).
// cache : { preuves, oral } à vrai pour omettre ces phrases (impression PDF) ; à l'écran, les cases les masquent sans redessiner.
function _mesCompHtmlFeuille(doc, cache) {
  var cp = (cache && cache.preuves) ? ' mc-cache' : '', co = (cache && cache.oral) ? ' mc-cache' : '';
  return mesCompBlocsDocument(doc).map(function (b) {
    if (b.t === 'titre') { return '<h2>' + _mcE(b.texte) + '</h2>'; }
    if (b.t === 'meta') { return '<div class="pied" style="margin-top:0">' + _mcE(b.texte) + '</div>'; }
    if (b.t === 'section') { return '<h3>' + _mcE(b.texte) + '</h3>'; }
    if (b.t === 'pied') { return '<div class="pied">' + _mcE(b.texte) + '</div>'; }
    var h = '<div class="ligne"><span class="lib">' + _mcE(b.libelle) + '</span>' + (b.notes && b.notes.length ? ' <span class="pr">(' + _mcE(b.notes.join(', ')) + ')</span>' : '') +
      (b.pourLeCV ? '<div class="or">Pour mon CV : ' + _mcE(b.pourLeCV) + '</div>' : '') +
      (b.preuves ? '<div class="pr mc-bp' + cp + '">' + _mcE(b.preuves) + '</div>' : '') +
      (b.oral ? '<div class="or mc-bo' + co + '">À l’oral : « ' + _mcE(b.oral) + ' »</div>' : '');
    return h + '</div>';
  }).join('');
}

// Document HTML complet pour l'impression : mêmes classes que l'écran, feuille blanche A4.
var MESCOMP_CSS_IMPRESSION =
  '@page{size:A4;margin:16mm}html,body{margin:0;padding:0;background:#fff;color:#1b1b1b}body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4}' +
  'h2{font:700 20pt/1.2 Georgia,serif;margin:0 0 .2rem}' +
  'h3{font:700 9pt/1.2 "Segoe UI",system-ui,sans-serif;text-transform:uppercase;letter-spacing:.07em;color:#0b4fb3;border-bottom:2px solid #0b4fb3;padding-bottom:2pt;margin:14pt 0 5pt;break-after:avoid}' +
  '.ligne{margin:6pt 0;break-inside:avoid}.lib{font-weight:700}.pr{color:#555;font-style:italic;font-size:9.5pt}.or{font-size:10pt}' +
  '.pied{font:8.5pt "Segoe UI",system-ui,sans-serif;color:#666;margin-top:12pt}.mc-cache{display:none}';

function _mesCompHtmlImpression() {
  var etat = mesCompOuvrir();
  var doc = mesCompDocumentFinal(etat);
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Mes compétences</title><style>' + MESCOMP_CSS_IMPRESSION + '</style></head><body>' +
    _mesCompHtmlFeuille(doc, { preuves: !doc.preuves, oral: !doc.oral }) + '</body></html>';
}

function _mesCompHtmlDocumentEcran(etat) {
  var doc = mesCompDocumentFinal(etat);
  var opt = etat.options;
  if (doc.vide) {
    return '<div class="cv-section"><p class="mb-0">Aucune ligne n’est gardée pour l’instant. Revenez à la relecture et gardez au moins une ligne.</p></div>';
  }
  return '<div class="text-center"><p class="sousTitre">Votre document est prêt. Il ne contient que ce que vous avez gardé.</p></div>' +
    '<div class="d-flex justify-content-center flex-wrap gap-3 mb-2">' +
    '<div class="form-check"><input class="form-check-input" type="checkbox" id="oPreuvesMc"' + (opt.preuves ? ' checked' : '') + '><label class="form-check-label" for="oPreuvesMc">Montrer les phrases de mes documents</label></div>' +
    '<div class="form-check"><input class="form-check-input" type="checkbox" id="oOralMc"' + (opt.oral ? ' checked' : '') + '><label class="form-check-label" for="oOralMc">Montrer les phrases pour l’oral</label></div></div>' +
    '<div class="mc-feuille" id="mcFeuille">' + _mesCompHtmlFeuille(doc) + '</div>' +
    '<div class="d-flex justify-content-center flex-wrap gap-2 my-3">' +
    '<button type="button" class="btn btn-primary" id="btnMcPdf">Télécharger en PDF</button>' +
    '<button type="button" class="btn btn-outline-primary" id="btnMcCopierTexte">Copier le texte</button>' +
    '<button type="button" class="btn btn-outline-secondary" id="btnMcWord">Télécharger en Word</button></div>' +
    '<p class="small text-center text-muted mb-3" id="mcMessageDoc" role="status"></p>' +
    '<div class="cv-section" style="background:var(--success-bg-subtle);"><p class="mb-0"><strong>Gardé avec votre disquette.</strong> Vous pourrez le reprendre, le modifier ou recommencer. Pour l’instant, aucune autre partie de l’application ne le lit : c’est vous qui l’utilisez.</p></div>' +
    '<div class="cv-section"><h4>&#10145;&#65039; Et ensuite ?</h4><p class="mb-0 small">Pour préparer un entretien, relisez les phrases pour l’oral. Pour un CV, reprenez les lignes « Pour mon CV ».</p></div>';
}

function _mesCompAfficherOptionsFeuille() {
  var e = mesCompOuvrir();
  Array.prototype.forEach.call(document.querySelectorAll('#mcFeuille .mc-bp'), function (x) { x.hidden = !e.options.preuves; });
  Array.prototype.forEach.call(document.querySelectorAll('#mcFeuille .mc-bo'), function (x) { x.hidden = !e.options.oral; });
}

function _mesCompMessageDoc(texte) {
  var m = document.getElementById('mcMessageDoc');
  if (m) { m.textContent = texte; }
}

function mesCompTerminer() {
  var e = mesCompOuvrir();
  e.termine = true;
  if (typeof trackEvenement === 'function') { trackEvenement('mes_competences_termine'); }
  if (typeof retourVersCarteAccueil === 'function') { retourVersCarteAccueil('boiteaoutils'); }
}

mesCompEnregistrerPage('document', {
  rendre: _mesCompHtmlDocumentEcran,
  cabler: function () {
    var e = mesCompOuvrir();
    _mesCompAfficherOptionsFeuille();
    var p = document.getElementById('oPreuvesMc');
    if (p) { p.addEventListener('change', function () { e.options.preuves = p.checked; _mesCompAfficherOptionsFeuille(); }); }
    var o = document.getElementById('oOralMc');
    if (o) { o.addEventListener('change', function () { e.options.oral = o.checked; _mesCompAfficherOptionsFeuille(); }); }
    var pdf = document.getElementById('btnMcPdf');
    if (pdf) {
      pdf.addEventListener('click', function () {
        if (typeof imprimerLettrePdf !== 'function') { return; }
        imprimerLettrePdf(function () { return Promise.resolve(_mesCompHtmlImpression()); }, 'mes compétences');
        if (typeof trackEvenement === 'function') { trackEvenement('mes_competences_pdf'); }
      });
    }
    var word = document.getElementById('btnMcWord');
    if (word) {
      word.addEventListener('click', function () {
        if (typeof mesCompGenererDocx !== 'function') { return; }
        _mesCompMessageDoc('Préparation du fichier Word…');
        mesCompGenererDocx(mesCompDocumentFinal(e)).then(function (blob) {
          var nom = (typeof nomFichierCV === 'function') ? nomFichierCV({ identite: dossier.identite, titreCV: 'mes compétences' }, 'docx') : 'mes-competences.docx';
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = nom;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          _mesCompMessageDoc('Le fichier Word est téléchargé.');
          if (typeof trackEvenement === 'function') { trackEvenement('mes_competences_word'); }
        }).catch(function () { _mesCompMessageDoc('Le fichier Word n’a pas pu être préparé. Vous pouvez télécharger le PDF ou copier le texte.'); });
      });
    }
    var copie = document.getElementById('btnMcCopierTexte');
    if (copie) {
      copie.addEventListener('click', function () {
        var texte = mesCompTexteDocument(mesCompDocumentFinal(e));
        if (!navigator.clipboard || !navigator.clipboard.writeText) { _mesCompMessageDoc('La copie n’est pas possible ici. Sélectionnez le texte du document et copiez-le à la main.'); return; }
        navigator.clipboard.writeText(texte).then(function () { _mesCompMessageDoc('Texte copié. Vous pouvez le coller où vous voulez.'); })
          .catch(function () { _mesCompMessageDoc('La copie a été refusée. Sélectionnez le texte du document et copiez-le à la main.'); });
      });
    }
  },
  peutContinuer: function (etat) { return !mesCompDocumentFinal(etat).vide; },
  raisonBlocage: function () { return 'Revenez à la relecture et gardez au moins une ligne.'; }
});
