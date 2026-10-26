// ============================================================
// gabaritsLettre.js
// ------------------------------------------------------------
// Gabarits Word de la lettre (lot D du chantier lettre, maquette docs/MAQUETTE_LETTRE_GABARITS_2026-10-24.html) : g1 « En-tete et filet »,
// g2 « Colonne coloree », g3 « Bandeau colore », g4 « Titre et informations ». Le gabarit g0 (« Sobre ») reste dans exportDocxNatifLettre.js.
// Decisions de Denis (24/10/2026) : destinataire a droite ; petites icones = petits carres de couleur avec une lettre (A, T, @) ; en g1, avec ou
// sans icones, coordonnees en colonne ou en ligne sous le filet. Le Word s'aligne sur le PDF ; la colonne coloree (g2) ne couvre que la premiere
// page d'une lettre de plusieurs pages : message « PDF conseille » (voir GABARITS_LETTRE_CO.wordFidele).
// Appele par _dnlConstruireSobre() quand objetLettre.gabarit n'est pas g0 ; ne decide jamais de la taille ni de l'espacement (opts, comme le Sobre).
// ============================================================

function _dnlAssombrir(hex, ratio) {
  var h = String(hex || '1A1A1A');
  function c(i) { var v = Math.round(parseInt(h.substr(i, 2), 16) * (1 - ratio)); var s = v.toString(16).toUpperCase(); return s.length < 2 ? '0' + s : s; }
  return c(0) + c(2) + c(4);
}

function _dnlConstruireGabarit(docx, objetLettre, opts) {
  opts = opts || {};
  var Paragraph = docx.Paragraph, TextRun = docx.TextRun, AlignmentType = docx.AlignmentType, Table = docx.Table, TableRow = docx.TableRow, TableCell = docx.TableCell;
  var BorderStyle = docx.BorderStyle, WidthType = docx.WidthType, ShadingType = docx.ShadingType;
  var gabarit = objetLettre.gabarit;
  var identite = objetLettre.identite || {};
  var POLICE = (typeof policeLettreCo === 'function') ? policeLettreCo(objetLettre.police) : 'Georgia';
  var ACCENT = opts.primaire || '1A1A1A';
  var TEXTE = '1A1A1A', BLANC = 'FFFFFF', GRIS = '555555', GRIS_PLACEHOLDER = 'A0A0A0';
  var TAILLE_ENTETE = opts.tailleEnTete || 20;
  var TAILLE_CORPS = opts.tailleCorps || 21;
  var ESP = ESPACES_LETTRE[opts.espacement] || ESPACES_LETTRE['normal'];
  var AUCUNE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  var SANS_BORDURES = { top: AUCUNE, bottom: AUCUNE, left: AUCUNE, right: AUCUNE, insideHorizontal: AUCUNE, insideVertical: AUCUNE };
  var optionsGabarit = objetLettre.optionsGabarit || {};

  function run(texte, o) {
    o = o || {};
    return new TextRun({ text: texte, bold: !!o.gras, italics: !!o.italique, size: o.taille || TAILLE_ENTETE, color: o.couleur || TEXTE, font: o.police || POLICE, shading: o.fond ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fond } : undefined });
  }
  function para(runs, o) {
    o = o || {};
    return new Paragraph({ alignment: o.alignement, spacing: { before: o.avant || 0, after: o.apres !== undefined ? o.apres : 20 }, shading: o.fondParagraphe ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fondParagraphe } : undefined, children: runs });
  }
  function cellule(contenu, largeur, o) {
    o = o || {};
    var b = o.bordures || {};
    return new TableCell({
      width: { size: largeur, type: WidthType.DXA }, margins: o.marges || { top: 0, bottom: 0, left: 0, right: 0 },
      shading: o.fond ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fond } : undefined,
      borders: { top: b.top || AUCUNE, bottom: b.bottom || AUCUNE, left: b.left || AUCUNE, right: b.right || AUCUNE },
      children: contenu
    });
  }

  // ---- Donnees d'en-tete ----
  var prenom = identite.prenom || '', nom = identite.nom || '';
  var nomComplet = (prenom || nom) ? (prenom + ' ' + nom).trim() : '[Votre nom]';
  var nomAbsent = !(prenom || nom);
  var poste = objetLettre.poste || '';
  var rue = ligneRueLettreCo(identite, objetLettre.inclureRue);
  var villeLigne = ligneCodePostalVilleLettreCo(identite);
  var adresse = [rue, villeLigne].filter(Boolean).join(', ');
  var contacts = [];
  if (adresse) { contacts.push({ lib: 'Adresse', val: adresse, ico: 'A' }); }
  contacts.push({ lib: 'Téléphone', val: identite.telephone || '[Votre téléphone]', ico: 'T', manque: !identite.telephone });
  contacts.push({ lib: 'E-mail', val: identite.email || '[Votre e-mail]', ico: '@', manque: !identite.email });
  var destinataire = objetLettre.destinataire || {};
  var lignesDest = (opts.masquerAdresseDestinataire ? destinataire.lignesSansAdresse : destinataire.lignes) || [];
  var nomEntreprise = destinataire.entreprise || '';
  function lignesDestinataire(alignement, couleurEntreprise) {
    return lignesDest.map(function (l, i) {
      var entreprise = !!nomEntreprise && i === 0;
      return para([run(l, { gras: entreprise, couleur: entreprise ? (couleurEntreprise || TEXTE) : TEXTE })], { alignement: alignement });
    });
  }
  function paraDate(alignement) {
    return para([run(objetLettre.date || '')], { alignement: alignement, avant: ESP.date, apres: ESP.date });
  }
  function paraObjetEtCorps() {
    var interligne = ESP.interligne ? { line: ESP.interligne } : {};
    var enfants = [];
    if (objetLettre.objet) {
      enfants.push(new Paragraph({ spacing: Object.assign({ after: ESP.objet }, interligne), children: [ run('Objet : ', { gras: true, taille: TAILLE_CORPS, couleur: ACCENT }), run(objetLettre.objet, { taille: TAILLE_CORPS }) ] }));
    }
    return enfants.concat(_dnlParagraphesCorps(docx, objetLettre, { POLICE: POLICE, TEXTE: TEXTE, TAILLE_CORPS: TAILLE_CORPS, ESP: ESP }));
  }
  // Petit carre de couleur avec une lettre (decision de Denis : pas de vraie icone, qui s'imprimerait mal en Word).
  function icone(lettre, fond) { return run(' ' + lettre + ' ', { gras: true, taille: 14, couleur: BLANC, fond: fond || ACCENT, police: 'Arial' }); }
  function pageMarges(haut, bas, gauche, droite) { return { top: haut, bottom: bas, left: gauche, right: droite }; }
  var corps = [];
  var marges = pageMarges(900, 900, 1100, 1100);

  if (gabarit === 'g1') {
    // En-tete : identite a gauche, filet vertical, destinataire a droite, filet horizontal dessous ; coordonnees en colonne ou en ligne.
    var gauche1 = [ para([run(nomComplet, { gras: true, taille: 40, couleur: nomAbsent ? GRIS_PLACEHOLDER : ACCENT })], { apres: 40 }) ];
    if (poste) { gauche1.push(para([run(poste, { taille: 28, couleur: GRIS })], { apres: 0 })); }
    corps.push(new Table({
      width: { size: 9706, type: WidthType.DXA }, columnWidths: [4700, 5006],
      borders: Object.assign({}, SANS_BORDURES, { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT } }),
      rows: [ new TableRow({ children: [
        cellule(gauche1, 4700, { marges: { top: 0, bottom: 160, left: 0, right: 300 }, bordures: { right: { style: BorderStyle.SINGLE, size: 12, color: ACCENT } } }),
        cellule(lignesDestinataire(AlignmentType.RIGHT, ACCENT), 5006, { marges: { top: 0, bottom: 160, left: 300, right: 0 } })
      ] }) ]
    }));
    var avecIcones = optionsGabarit.icones !== false;
    if (optionsGabarit.coordLigne) {
      var runsLigne = [];
      contacts.forEach(function (c, i) {
        if (i) { runsLigne.push(run('     ')); }
        if (avecIcones) { runsLigne.push(icone(c.ico)); runsLigne.push(run('  ')); }
        runsLigne.push(run(c.val, { italique: !!c.manque, couleur: c.manque ? GRIS_PLACEHOLDER : TEXTE }));
      });
      corps.push(para(runsLigne, { avant: 160, apres: 0 }));
    } else {
      contacts.forEach(function (c, i) {
        var runs = [];
        if (avecIcones) { runs.push(icone(c.ico)); runs.push(run('   ')); }
        runs.push(run(c.val, { italique: !!c.manque, couleur: c.manque ? GRIS_PLACEHOLDER : TEXTE }));
        corps.push(para(runs, { avant: i === 0 ? 160 : 0, apres: 40 }));
      });
    }
    corps.push(paraDate(AlignmentType.RIGHT));
    paraObjetEtCorps().forEach(function (p) { corps.push(p); });
  } else if (gabarit === 'g2') {
    // Colonne coloree pleine hauteur a gauche, lettre a droite. Marges de page a zero (la colonne va jusqu'au bord) ; ligne de tableau au moins aussi haute que la page.
    marges = pageMarges(0, 0, 0, 0);
    var fondBarre = _dnlAssombrir(ACCENT, 0.3);
    var colonne = [
      para([run(nomComplet, { gras: true, taille: 44, couleur: BLANC })], { apres: 80 })
    ];
    if (poste) { colonne.push(para([run(poste, { taille: 24, couleur: BLANC })], { apres: 360 })); } else { colonne.push(para([run('')], { apres: 240 })); }
    colonne.push(para([run('Informations de contact', { gras: true, taille: 22, couleur: BLANC })], { fondParagraphe: fondBarre, apres: 160 }));
    contacts.forEach(function (c) {
      colonne.push(para([run(c.lib.toUpperCase(), { gras: true, taille: 16, couleur: BLANC })], { apres: 0 }));
      colonne.push(para([run(c.val, { taille: 20, couleur: BLANC, italique: !!c.manque })], { apres: 160 }));
    });
    var droite2 = lignesDestinataire(AlignmentType.LEFT, ACCENT).concat([ paraDate(AlignmentType.LEFT) ], paraObjetEtCorps());
    corps.push(new Table({
      width: { size: 11906, type: WidthType.DXA }, columnWidths: [3300, 8606],
      borders: SANS_BORDURES,
      rows: [ new TableRow({ height: { value: 16500, rule: docx.HeightRule.ATLEAST }, children: [
        cellule(colonne, 3300, { fond: ACCENT, marges: { top: 700, bottom: 300, left: 360, right: 300 } }),
        cellule(droite2, 8606, { marges: { top: 900, bottom: 600, left: 700, right: 900 } })
      ] }) ]
    }));
    corps.push(new Paragraph({ spacing: { before: 0, after: 0, line: 20 }, children: [ new TextRun({ text: '', size: 2 }) ] }));
  } else if (gabarit === 'g3') {
    // Bandeau colore pleine largeur en haut (nom et coordonnees en blanc), lettre dessous ; destinataire a droite.
    marges = pageMarges(0, 900, 0, 0);
    var bandeau = [ para([run(nomComplet, { gras: true, taille: 56, couleur: BLANC })], { apres: 160 }) ];
    contacts.forEach(function (c) {
      bandeau.push(para([run(c.lib + '   ', { gras: true, taille: 20, couleur: BLANC }), run(c.val, { taille: 20, couleur: BLANC, italique: !!c.manque })], { apres: 40 }));
    });
    corps.push(new Table({
      width: { size: 11906, type: WidthType.DXA }, columnWidths: [11906], borders: SANS_BORDURES,
      rows: [ new TableRow({ children: [ cellule(bandeau, 11906, { fond: ACCENT, marges: { top: 700, bottom: 500, left: 1100, right: 1100 } }) ] }) ]
    }));
    var sousBandeau = lignesDestinataire(AlignmentType.RIGHT, ACCENT).concat([ paraDate(AlignmentType.RIGHT) ], paraObjetEtCorps());
    corps.push(new Table({
      width: { size: 11906, type: WidthType.DXA }, columnWidths: [11906], borders: SANS_BORDURES,
      rows: [ new TableRow({ children: [ cellule(sousBandeau, 11906, { marges: { top: 500, bottom: 0, left: 1100, right: 1100 } }) ] }) ]
    }));
  } else {
    // g4 : grand titre (nom et poste) puis colonne « Informations personnelles » a gauche, lettre a droite.
    corps.push(para([run(nomComplet, { gras: true, taille: 68, couleur: nomAbsent ? GRIS_PLACEHOLDER : ACCENT })], { apres: 40 }));
    corps.push(para([run(poste || ' ', { taille: 32, couleur: ACCENT })], { apres: 300 }));
    var info = [ para([run('Informations personnelles', { gras: true, taille: 26, couleur: ACCENT })], { apres: 160 }) ];
    contacts.forEach(function (c) {
      info.push(para([run(c.lib, { gras: true, taille: 20, couleur: ACCENT })], { apres: 0 }));
      info.push(para([run(c.val, { taille: 20, italique: !!c.manque, couleur: c.manque ? GRIS_PLACEHOLDER : TEXTE })], { apres: 140 }));
    });
    var droite4 = lignesDestinataire(AlignmentType.RIGHT, ACCENT).concat([ paraDate(AlignmentType.RIGHT) ], paraObjetEtCorps());
    corps.push(new Table({
      width: { size: 9706, type: WidthType.DXA }, columnWidths: [2800, 6906], borders: SANS_BORDURES,
      rows: [ new TableRow({ children: [
        cellule(info, 2800, { marges: { top: 120, bottom: 0, left: 0, right: 300 }, bordures: { top: { style: BorderStyle.SINGLE, size: 12, color: ACCENT } } }),
        cellule(droite4, 6906, { marges: { top: 0, bottom: 0, left: 300, right: 0 } })
      ] }) ]
    }));
  }

  return new docx.Document({
    sections: [ { properties: { page: { margin: marges, size: opts.formatPage === 'A5' ? _dnTaillePageA5() : undefined } }, children: corps } ]
  });
}
