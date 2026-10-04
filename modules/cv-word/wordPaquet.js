/* ============================================================
   modules/cv-word/wordPaquet.js  (2026-09-27)
   Export du CV en Word : assemble le fichier .docx (archive ZIP) a partir d'un PLAN DE PAGE.
   Module PUR (Node et navigateur) : JSZip est passe en parametre ou pris dans l'environnement.

   Plan de page (contrat entre l'extracteur du navigateur et cet ecrivain) :
   {
     version: 1,
     titre, auteur, langue ('fr-FR'),
     page: { largeurPx, hauteurPx, margesPx: { haut, bas, gauche, droite } },
     policeParDefaut: 'Arial', tailleParDefautDemiPts: 20,
     decorsPage:         [ Forme ]   // repetes sur chaque page (dans l'en-tete de la section)
     decorsPremierePage: [ Forme ]   // uniquement page 1 (s'ajoutent aux decorsPage)
     decorsSuivantes:    [ Forme ]   // uniquement pages 2 et suivantes (s'ajoutent aux decorsPage)
     flux: [ Paragraphe | Tableau ]
   }
   Voir wordXml.js pour Forme, Paragraphe, Tableau. Aucun texte dans une forme (regle ATS, verifiee par validerPlan).
   ============================================================ */

var WordPaquet = (function () {
  var X = (typeof WordXml !== 'undefined') ? WordXml : require('./wordXml.js');
  var U = (typeof WordUnites !== 'undefined') ? WordUnites : require('./wordUnites.js');
  var esc = U.echapper;

  var ENTETE_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

  // ---------- validation du plan ----------
  function validerPlan(plan) {
    var erreurs = [];
    if (!plan || typeof plan !== 'object') { return ['plan absent']; }
    if (plan.version !== 1) { erreurs.push('version du plan inconnue : ' + plan.version); }
    var p = plan.page;
    if (!p || !(p.largeurPx > 0) || !(p.hauteurPx > 0)) { erreurs.push('page : dimensions absentes'); }
    else if (!p.margesPx) { erreurs.push('page : marges absentes'); }
    function verifierForme(f, ou) {
      if (!f || typeof f !== 'object') { erreurs.push(ou + ' : forme invalide'); return; }
      // seule exception : la zone de texte vertical (bande du nom), dont la copie du texte est cachee dans le corps du document
      if (f.genre !== 'texteVertical' && (f.texte !== undefined || f.runs !== undefined || f.blocs !== undefined)) { erreurs.push(ou + ' : une forme ne peut pas contenir de texte (regle ATS)'); }
      if (!(f.lPx > 0) || !(f.hPx > 0)) { erreurs.push(ou + ' : dimensions de forme invalides'); }
      if (f.genre === 'image' && (!f.donnees || !f.type)) { erreurs.push(ou + ' : image sans donnees'); }
    }
    (plan.decorsPage || []).forEach(function (f, i) { verifierForme(f, 'decorsPage[' + i + ']'); });
    (plan.decorsPremierePage || []).forEach(function (f, i) { verifierForme(f, 'decorsPremierePage[' + i + ']'); });
    (plan.decorsSuivantes || []).forEach(function (f, i) { verifierForme(f, 'decorsSuivantes[' + i + ']'); });
    function verifierBlocs(blocs, ou) {
      (blocs || []).forEach(function (b, i) {
        var ici = ou + '[' + i + ']';
        if (!b || (b.genre !== 'paragraphe' && b.genre !== 'tableau')) { erreurs.push(ici + ' : genre de bloc inconnu'); return; }
        if (b.genre === 'paragraphe') { (b.decors || []).forEach(function (f, j) { verifierForme(f, ici + '.decors[' + j + ']'); }); }
        if (b.genre === 'tableau') {
          if (!b.largeursPx || !b.largeursPx.length) { erreurs.push(ici + ' : tableau sans largeurs'); }
          (b.lignes || []).forEach(function (l, j) {
            (l.cellules || []).forEach(function (c, k) {
              if (!(c.largeurPx > 0)) { erreurs.push(ici + '.lignes[' + j + '].cellules[' + k + '] : largeur absente'); }
              verifierBlocs(c.blocs, ici + '.lignes[' + j + '].cellules[' + k + '].blocs');
            });
          });
        }
      });
    }
    verifierBlocs(plan.flux, 'flux');
    return erreurs;
  }

  // ---------- parties du document ----------
  function xmlStyles(plan) {
    var police = esc(plan.policeParDefaut || 'Arial');
    var taille = plan.tailleParDefautDemiPts || 20;
    var langue = esc(plan.langue || 'fr-FR');
    return ENTETE_XML + '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="' + police + '" w:hAnsi="' + police + '" w:eastAsia="' + police + '" w:cs="' + police + '"/>' +
      '<w:sz w:val="' + taille + '"/><w:szCs w:val="' + taille + '"/><w:lang w:val="' + langue + '" w:eastAsia="' + langue + '" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>' +
      '<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Titre1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:outlineLvl w:val="0"/></w:pPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Titre2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:outlineLvl w:val="1"/></w:pPr></w:style>' +
      '<w:style w:type="table" w:default="1" w:styleId="TableauNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>' +
      '</w:styles>';
  }

  function xmlSettings(plan) {
    return ENTETE_XML + '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/>' +
      '<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat>' +
      '<w:themeFontLang w:val="' + esc(plan.langue || 'fr-FR') + '"/></w:settings>';
  }

  function xmlEntete(decors, ctx) {
    var corps = '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr>' +
      decors.map(function (f) { return '<w:r>' + X.xmlForme(f, ctx, 'page') + '</w:r>'; }).join('') + '</w:p>';
    return ENTETE_XML + '<w:hdr ' + X.NS_RACINE + '>' + corps + '</w:hdr>';
  }

  function xmlRelations(liste) {
    return ENTETE_XML + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      liste.map(function (r) { return '<Relationship Id="' + r.id + '" Type="' + r.type + '" Target="' + r.cible + '"/>'; }).join('') + '</Relationships>';
  }

  var TYPE_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';

  // ---------- assemblage ----------
  // Renvoie une promesse de contenu binaire (Uint8Array / Buffer) du fichier .docx.
  function ecrireDocx(plan, JSZipClasse) {
    var erreurs = validerPlan(plan);
    if (erreurs.length) { return Promise.reject(new Error('Plan invalide : ' + erreurs.slice(0, 5).join(' ; '))); }
    var JSZipC = JSZipClasse || (typeof JSZip !== 'undefined' ? JSZip : require('../cv-editor/jszip.min.js'));
    var zip = new JSZipC();
    var ctx = X.creerContexte();

    // Corps du document.
    ctx.partie = 'document';
    var blocs = X.xmlBlocs(plan.flux, ctx);
    blocs += X.xmlParagrapheMinuscule();   // Word exige un paragraphe apres un tableau final

    // En-tetes (decors repetes) : 'default' pour toutes les pages, 'first' si la page 1 a des decors en plus.
    var refs = [];
    var relsDoc = [];
    var decorsPage = plan.decorsPage || [];
    var decorsPremiere = plan.decorsPremierePage || [];
    var decorsSuivantes = plan.decorsSuivantes || [];
    var entetes = [];
    if (decorsPage.length || decorsPremiere.length || decorsSuivantes.length) {
      // en-tete par defaut : pages 2 et suivantes (ou toutes les pages s'il n'y a pas de decor propre a la premiere)
      ctx.partie = 'header1';
      entetes.push({ nom: 'header1.xml', partie: 'header1', xml: xmlEntete(decorsPage.concat(decorsSuivantes), ctx) });
      refs.push({ type: 'default', id: 'rIdEnt1' });
      relsDoc.push({ id: 'rIdEnt1', type: TYPE_REL + 'header', cible: 'header1.xml' });
      if (decorsPremiere.length || decorsSuivantes.length) {
        ctx.partie = 'header2';
        entetes.push({ nom: 'header2.xml', partie: 'header2', xml: xmlEntete(decorsPage.concat(decorsPremiere), ctx) });
        refs.push({ type: 'first', id: 'rIdEnt2' });
        relsDoc.push({ id: 'rIdEnt2', type: TYPE_REL + 'header', cible: 'header2.xml' });
      }
    }
    var sectPr = X.xmlSection(plan.page, refs);
    var document = ENTETE_XML + '<w:document ' + X.NS_RACINE + '><w:body>' + blocs + sectPr + '</w:body></w:document>';

    // Relations du document.
    relsDoc.push({ id: 'rIdStyles', type: TYPE_REL + 'styles', cible: 'styles.xml' });
    relsDoc.push({ id: 'rIdParam', type: TYPE_REL + 'settings', cible: 'settings.xml' });
    (ctx.relations.document || []).forEach(function (r) { relsDoc.push({ id: r.id, type: TYPE_REL + 'image', cible: r.cible }); });

    var typesMedias = {};
    ctx.medias.forEach(function (m) { typesMedias[m.type === 'jpg' ? 'jpeg' : m.type] = true; });
    var contentTypes = ENTETE_XML + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      Object.keys(typesMedias).map(function (t) { return '<Default Extension="' + t + '" ContentType="' + (X.TYPES_IMAGE[t] || 'application/octet-stream') + '"/>'; }).join('') +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
      '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>' +
      entetes.map(function (e) { return '<Override PartName="/word/' + e.nom + '" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'; }).join('') +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>';

    var maintenant = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    var core = ENTETE_XML + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
      'xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + esc(plan.titre || 'CV') + '</dc:title><dc:creator>' + esc(plan.auteur || '') + '</dc:creator><dc:language>' + esc(plan.langue || 'fr-FR') + '</dc:language>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + maintenant + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + maintenant + '</dcterms:modified></cp:coreProperties>';
    var app = ENTETE_XML + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Microsoft Office Word</Application></Properties>';

    zip.file('[Content_Types].xml', contentTypes);
    zip.file('_rels/.rels', xmlRelations([
      { id: 'rId1', type: TYPE_REL + 'officeDocument', cible: 'word/document.xml' },
      { id: 'rId2', type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties', cible: 'docProps/core.xml' },
      { id: 'rId3', type: TYPE_REL + 'extended-properties', cible: 'docProps/app.xml' }
    ]));
    zip.file('docProps/core.xml', core);
    zip.file('docProps/app.xml', app);
    zip.file('word/document.xml', document);
    zip.file('word/_rels/document.xml.rels', xmlRelations(relsDoc));
    zip.file('word/styles.xml', xmlStyles(plan));
    zip.file('word/settings.xml', xmlSettings(plan));
    entetes.forEach(function (e) {
      zip.file('word/' + e.nom, e.xml);
      var rels = (ctx.relations[e.partie] || []).map(function (r) { return { id: r.id, type: TYPE_REL + 'image', cible: r.cible }; });
      if (rels.length) { zip.file('word/_rels/' + e.nom + '.rels', xmlRelations(rels)); }
    });
    ctx.medias.forEach(function (m) {
      var donnees = m.donnees;
      if (typeof donnees === 'string') { zip.file('word/media/' + m.nom, donnees, { base64: true }); }
      else { zip.file('word/media/' + m.nom, donnees); }
    });

    var typeSortie = (typeof Buffer !== 'undefined' && typeof window === 'undefined') ? 'nodebuffer' : 'uint8array';
    return zip.generateAsync({ type: typeSortie, compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  return { validerPlan: validerPlan, ecrireDocx: ecrireDocx, xmlStyles: xmlStyles };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = WordPaquet; }
