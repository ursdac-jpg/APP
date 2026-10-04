/* ============================================================
   modules/cv-word/wordExport.js  (2026-09-27)
   Export du CV en Word depuis le rendu du PDF : ORCHESTRATION (navigateur seulement).

   exporterCvWord(dossierSource, options) : Promise<{ blob, nomFichier, plan, mots, avertissements }>
     1. cree une iframe cachee (794 px) et y ecrit la MEME page que l'apercu du CV en PDF (construirePageInteractivePdfA4), avec les reglages
        enregistres dans le dossier (dossier.pdfReglages) : le rendu est celui que la personne voit ;
     2. attend que la page soit stable (polices, images, premier rafraichissement) ;
     3. extrait le plan de page du DOM final (wordExtracteur.js) ;
     4. ecrit le .docx (wordPaquet.js) et le renvoie sous forme de Blob.
   Ne modifie aucun etat de l'application (l'iframe est retiree a la fin, meme en cas d'erreur).
   Voir docs/CHANTIER_WORD_DEPUIS_PDF_2026-09-26.md.
   ============================================================ */

// JSZip est charge a la demande (comme dans apercuDocxIntegre.js) s'il n'est pas deja present.
function _cvWordChargerJsZip() {
  if (typeof JSZip !== 'undefined') { return Promise.resolve(JSZip); }
  return new Promise(function (resolve, reject) {
    var balise = document.createElement('script');
    balise.src = 'modules/cv-editor/jszip.min.js';
    balise.onload = function () { if (typeof JSZip !== 'undefined') { resolve(JSZip); } else { reject(new Error('JSZip indisponible')); } };
    balise.onerror = function () { reject(new Error('JSZip introuvable')); };
    document.head.appendChild(balise);
  });
}

function exporterCvWord(dossierSource, options) {
  var opts = options || {};
  if (typeof construirePageInteractivePdfA4 !== 'function' || typeof WordExtracteur === 'undefined' || typeof WordPaquet === 'undefined') {
    return Promise.reject(new Error('Export Word indisponible : modules non charges'));
  }
  var identite = (dossierSource && dossierSource.identite) || {};
  var nomComplet = [identite.prenom, identite.nom].filter(Boolean).join(' ');
  var iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(iframe);
  function retirer() { try { if (iframe.parentNode) { iframe.parentNode.removeChild(iframe); } } catch (e) { /* deja retiree */ } }

  return new Promise(function (resolve, reject) {
    try {
      iframe.contentWindow.__cvPdfDossierSource = dossierSource;
      iframe.contentWindow.__cvPdfModeGrandApercu = false;
      iframe.contentDocument.open();
      iframe.contentDocument.write(construirePageInteractivePdfA4(nomComplet, dossierSource));
      iframe.contentDocument.close();
    } catch (e) { reject(e); return; }
    var essais = 0;
    // page stable : la feuille du CV existe, les polices sont chargees, les images sont decodees, la hauteur ne bouge plus entre deux mesures
    var derniereHauteur = -1;
    (function attendre() {
      essais += 1;
      var doc = iframe.contentDocument;
      // Mini CV A5 (cvPdfTemplateA5.js) : page racine .page-a5 (ou .feuille-a4-remplie si "Remplir la page" est actif, 2 exemplaires),
      // jamais la classe .cv -- repli identique a celui de wordExtracteur.js.
      var cv = doc && (doc.querySelector('#conteneurPage .cv') || doc.querySelector('#conteneurPage .feuille-a4-remplie') || doc.querySelector('#conteneurPage .page-a5'));
      if (!cv) {
        if (essais > 100) { reject(new Error('Page du CV introuvable')); return; }
        setTimeout(attendre, 100); return;
      }
      var pretes = (doc.fonts && doc.fonts.status ? doc.fonts.status === 'loaded' : true) && Array.prototype.every.call(doc.images || [], function (im) { return im.complete; });
      var hauteur = cv.getBoundingClientRect().height;
      if (pretes && hauteur === derniereHauteur) { resolve(doc); return; }
      derniereHauteur = hauteur;
      if (essais > 100) { resolve(doc); return; }
      setTimeout(attendre, 120);
    })();
  }).then(function (doc) {
    return WordExtracteur.extraireAsync(doc, { titre: 'CV ' + nomComplet, auteur: nomComplet });
  }).then(function (resultat) {
    return _cvWordChargerJsZip().then(function (JSZipClasse) { return WordPaquet.ecrireDocx(resultat.plan, JSZipClasse); }).then(function (octets) {
      var propre = function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };
      // « NOM_poste.docx » (retour Denis 2026-10-01, cv-core/identiteFormat.js) ; module absent : ancien nom « cv-prenom-nom.docx »
      var nom = (typeof nomFichierCV === 'function') ? nomFichierCV(dossierSource, 'docx') : (['cv', propre(identite.prenom), propre(identite.nom)].filter(Boolean).join('-') + '.docx');
      retirer();
      return {
        blob: new Blob([octets], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        nomFichier: nom, plan: resultat.plan, mots: resultat.mots, avertissements: resultat.avertissements
      };
    });
  }).catch(function (erreur) { retirer(); throw erreur; });
}

if (typeof module !== 'undefined' && module.exports) { module.exports = { exporterCvWord: exporterCvWord }; }
