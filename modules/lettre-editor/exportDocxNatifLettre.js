// ============================================================
// exportDocxNatifLettre.js
// ------------------------------------------------------------
// TACHE (traitement DOCX natif : lettre de motivation) : meme principe
// que exportDocxNatifCV.js -- genere un vrai .docx directement depuis
// l'objet lettre normalise (normaliserDonneesLettre(dossier), voir
// modules/lettre-core/normaliserDonneesLettre.js), au lieu de convertir
// le HTML deja rendu.
//
// Reutilise chargerLibrairieDocxNatif() (deja definie dans
// exportDocxNatifCV.js, charge AVANT ce fichier -- voir index.html) :
// meme protection contre le conflit de nom avec docx-preview, pas de
// duplication du chargement de la librairie docx.
//
// Un seul modele aujourd'hui ("sobre", le seul qui existe cote HTML),
// mais structure identique aux fichiers CV pour en ajouter facilement
// d'autres plus tard (voir GENERATEURS_DOCX_NATIFS_LETTRE).
// ============================================================

var MODELES_AVEC_DOCX_NATIF_LETTRE = ['sobre'];

// ---- Modele "Sobre" : en-tete expediteur classique, date, objet, corps ----
// TACHE (couleurs + formats, comme pour le CV) : opts optionnel, retro-
// compatible -- appel sans opts (ou {}) = comportement identique a avant.
// opts.primaire : accent sobre sur le nom et "Objet :" (le corps du
// texte reste toujours noir, la lettre garde son esprit formel).
// opts.formatPage : 'A5' => vraie page A5 (voir _dnTaillePageA5(),
// formatA5CV.js, deja charge). 'A4-essentiel'/'A4'/absent => page A4
// normale (taille par defaut de docx-js).
// Espacement choisi par « Mise en page » (decision de Denis, 24/10/2026) : espace entre paragraphes, avant et apres la date, apres l'objet. Partage avec les gabarits.
var ESPACES_LETTRE = {
  'large': { para: 300, objet: 360, date: 360, interligne: 276 },
  'normal': { para: 200, objet: 300, date: 300, interligne: 0 },
  'serre': { para: 120, objet: 200, date: 200, interligne: 0 },
  'tres-serre': { para: 70, objet: 130, date: 120, interligne: 0 }
};

// Paragraphes du corps de la lettre (un paragraphe Word par paragraphe separe par une ligne vide) : source unique pour le Sobre et les gabarits.
// ctx : { POLICE, TEXTE, TAILLE_CORPS, ESP }.
function _dnlParagraphesCorps(docx, objetLettre, ctx) {
  var interligne = ctx.ESP.interligne ? { line: ctx.ESP.interligne } : {};
  return (objetLettre.texte || '').split(/\n{2,}/).filter(function (p) { return p.trim(); }).map(function (p) {
    return new docx.Paragraph({
      spacing: Object.assign({ after: ctx.ESP.para }, interligne), alignment: docx.AlignmentType.JUSTIFIED,
      children: [ new docx.TextRun({ text: p.trim(), size: ctx.TAILLE_CORPS, color: ctx.TEXTE, font: ctx.POLICE }) ]
    });
  });
}

function _dnlConstruireSobre(docx, objetLettre, opts) {
  opts = opts || {};
  // Gabarits g1 a g4 (lot D) : gabaritsLettre.js ; g0 (Sobre) est dessine ci-dessous.
  if (objetLettre.gabarit && objetLettre.gabarit !== 'g0' && typeof _dnlConstruireGabarit === 'function') { return _dnlConstruireGabarit(docx, objetLettre, opts); }
  var Paragraph = docx.Paragraph, TextRun = docx.TextRun, AlignmentType = docx.AlignmentType;
  var TEXTE = '1A1A1A';
  var ACCENT = opts.primaire || '1A1A1A';
  var identite = objetLettre.identite || {};
  // TACHE (retour utilisateur : "la lettre ne doit pas dépasser une page,
  // à la limite on joue sur la police") : tailles paramétrables (repli
  // sur les valeurs d'origine si absentes, comportement inchangé pour
  // tout appelant qui ne les précise pas) -- décidées par le seul appelant
  // public (genererDocxNatifLettre(), plus bas) selon la longueur réelle
  // du texte, jamais ici (cette fonction dessine, elle ne décide jamais).
  // Police choisie par la personne (POLICES_LETTRE_CO, destinataireLettreCo.js) ; Georgia par defaut.
  var POLICE = (typeof policeLettreCo === 'function') ? policeLettreCo(objetLettre.police) : 'Georgia';
  var TAILLE_ENTETE = opts.tailleEnTete || 20;
  var TAILLE_CORPS = opts.tailleCorps || 21;
  // Espacement choisi par « Mise en page » (decision de Denis, 24/10/2026) : espace entre paragraphes, avant et apres la date, apres l'objet.
  var ESP = ESPACES_LETTRE[opts.espacement] || ESPACES_LETTRE['normal'];
  function interligne() { return ESP.interligne ? { line: ESP.interligne } : {}; }
  // TACHE (retour utilisateur : lettre modifiable, champs grises pour
  // l'identite) : quand une information (prenom/nom/telephone/e-mail)
  // manque -- cas frequent pour le parcours "Co-construire votre lettre
  // de motivation", qui court-circuite volontairement la saisie
  // structuree habituelle -- affiche un texte-repere en gris a la place,
  // exactement a l'endroit ou l'information doit figurer. La personne n'a
  // plus qu'a cliquer dessus dans Word et taper par-dessus. Jamais de
  // champ vide ni de ligne manquante silencieusement.
  var GRIS_PLACEHOLDER = 'A0A0A0';
  function champOuPlaceholder(valeur, libellePlaceholder) {
    return valeur ? { texte: valeur, placeholder: false } : { texte: libellePlaceholder, placeholder: true };
  }

  function ligneExpediteur(texte) {
    return new Paragraph({ spacing: { after: 20 }, children: [ new TextRun({ text: texte, size: TAILLE_ENTETE, color: TEXTE, font: POLICE }) ] });
  }
  // Meme principe que ligneExpediteur(), mais pour un champ pouvant etre
  // un placeholder gris (telephone, e-mail).
  function ligneExpediteurOuPlaceholder(valeur, libellePlaceholder) {
    var champ = champOuPlaceholder(valeur, libellePlaceholder);
    return new Paragraph({ spacing: { after: 20 }, children: [
      new TextRun({ text: champ.texte, italics: champ.placeholder, size: TAILLE_ENTETE, color: champ.placeholder ? GRIS_PLACEHOLDER : TEXTE, font: POLICE })
    ] });
  }

  var enfants = [];
  var expediteur = [];   // coordonnees de la personne (en haut a gauche), posees plus bas selon la place du bloc du destinataire

  // En-tete expediteur (aligne a gauche, comme le modele HTML "sobre") --
  // le nom seul recoit la couleur d'accent, reste de l'adresse neutre.
  // TACHE (champs grises) : prenom et nom traites separement (2 TextRun),
  // chacun grise independamment si manquant -- un seul des deux peut
  // manquer sans griser l'autre inutilement.
  var champPrenom = champOuPlaceholder(identite.prenom, '[Votre prénom]');
  var champNom = champOuPlaceholder(identite.nom, '[Votre nom]');
  expediteur.push(new Paragraph({ spacing: { after: 20 }, children: [
    new TextRun({ text: champPrenom.texte, bold: true, italics: champPrenom.placeholder, color: champPrenom.placeholder ? GRIS_PLACEHOLDER : ACCENT, size: TAILLE_ENTETE, font: POLICE }),
    new TextRun({ text: ' ', bold: true, size: TAILLE_ENTETE, font: POLICE }),
    new TextRun({ text: champNom.texte, bold: true, italics: champNom.placeholder, color: champNom.placeholder ? GRIS_PLACEHOLDER : ACCENT, size: TAILLE_ENTETE, font: POLICE })
  ] }));
  // Decision de Denis (24/10/2026) : nom, code postal et ville, telephone, e-mail toujours ; la rue seulement si la personne l'a choisie.
  var ligneRue = ligneRueLettreCo(identite, objetLettre.inclureRue);
  if (ligneRue) { expediteur.push(ligneExpediteur(ligneRue)); }
  var ligneVille = ligneCodePostalVilleLettreCo(identite);
  if (ligneVille) { expediteur.push(ligneExpediteur(ligneVille)); }
  // TACHE (champs grises) : telephone et e-mail toujours affiches
  // (placeholder gris si manquants) -- contrairement a adresse/ville
  // (facultatives, discretes si absentes), un recruteur a besoin d'un
  // moyen direct de recontacter la personne.
  expediteur.push(ligneExpediteurOuPlaceholder(identite.telephone, '[Votre téléphone]'));
  expediteur.push(ligneExpediteurOuPlaceholder(identite.email, '[Votre e-mail]'));

  // Bloc du destinataire (temps 3, decisions 22 a 28 et 68 du cahier lettre), aligne a droite. Par defaut une ligne plus bas, sous les coordonnees ;
  // opts.destinataireCote : au MEME NIVEAU que les coordonnees, a leur droite, pour gagner de la place quand la lettre est longue (decision de Denis,
  // 24/10/2026). opts.masquerAdresseDestinataire : l'adresse de l'entreprise est la premiere a disparaitre quand la lettre est pleine.
  var destinataire = objetLettre.destinataire || {};
  var lignesDestinataire = (opts.masquerAdresseDestinataire ? destinataire.lignesSansAdresse : destinataire.lignes) || [];
  var nomEntreprise = destinataire.entreprise || '';
  var cote = !!(opts.destinataireCote && lignesDestinataire.length);
  var blocDestinataire = lignesDestinataire.map(function (ligne, i) {
    return new Paragraph({
      alignment: AlignmentType.RIGHT, spacing: { before: (!cote && i === 0) ? ESP.date : 0, after: 20 },
      children: [ new TextRun({ text: ligne, bold: !!nomEntreprise && i === 0, size: TAILLE_ENTETE, color: TEXTE, font: POLICE }) ]
    });
  });
  if (cote) {
    var SANS_BORDURE = { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    var cellule = function (contenu, largeur) {
      return new docx.TableCell({ width: { size: largeur, type: docx.WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 0 },
        borders: { top: SANS_BORDURE, bottom: SANS_BORDURE, left: SANS_BORDURE, right: SANS_BORDURE }, children: contenu });
    };
    // Largeur utile de la page A4 : 11906 - 2 x 1100 de marges = 9706 (dxa). Coordonnees a gauche, destinataire a droite.
    enfants.push(new docx.Table({
      width: { size: 9706, type: docx.WidthType.DXA }, columnWidths: [4600, 5106],
      borders: { top: SANS_BORDURE, bottom: SANS_BORDURE, left: SANS_BORDURE, right: SANS_BORDURE, insideHorizontal: SANS_BORDURE, insideVertical: SANS_BORDURE },
      rows: [ new docx.TableRow({ children: [ cellule(expediteur, 4600), cellule(blocDestinataire, 5106) ] }) ]
    }));
  } else {
    expediteur.forEach(function (p) { enfants.push(p); });
    blocDestinataire.forEach(function (p) { enfants.push(p); });
  }

  // Date (alignee a droite, convention courrier)
  enfants.push(new Paragraph({
    alignment: AlignmentType.RIGHT, spacing: { before: (lignesDestinataire.length && !cote) ? Math.round(ESP.date * 0.65) : ESP.date, after: ESP.date },
    children: [ new TextRun({ text: objetLettre.date || '', size: TAILLE_ENTETE, color: TEXTE, font: POLICE }) ]
  }));

  // Objet
  if (objetLettre.objet) {
    enfants.push(new Paragraph({
      spacing: Object.assign({ after: ESP.objet }, interligne()),
      children: [
        new TextRun({ text: 'Objet : ', bold: true, size: TAILLE_CORPS, color: ACCENT, font: POLICE }),
        new TextRun({ text: objetLettre.objet, size: TAILLE_CORPS, color: TEXTE, font: POLICE })
      ]
    }));
  }

  // Corps -- un paragraphe Word par paragraphe separe par une ligne vide
  // dans le texte (normaliserDonneesLettre garantit deja au plus 2 sauts
  // de ligne consecutifs, voir son propre commentaire).
  _dnlParagraphesCorps(docx, objetLettre, { POLICE: POLICE, TEXTE: TEXTE, TAILLE_CORPS: TAILLE_CORPS, ESP: ESP }).forEach(function (p) { enfants.push(p); });

  return new docx.Document({
    sections: [ { properties: { page: { margin: { top: 900, bottom: 900, left: 1100, right: 1100 }, size: opts.formatPage === 'A5' ? _dnTaillePageA5() : undefined } }, children: enfants } ]
  });
}

var GENERATEURS_DOCX_NATIFS_LETTRE = {
  'sobre': function (docx, objetLettre, opts) { return _dnlConstruireSobre(docx, objetLettre, opts); }
};

// TACHE (retour utilisateur : "la lettre dépasse une page, au milieu je
// n'ai plus le texte mais un mot qui n'est pas fini, des points, puis
// plus rien -- je veux imposer une seule page, à la limite jouer sur la
// police plutôt que couper le texte") : seuils vérifiés par test réel
// (génération + conversion PDF + comptage de pages, pas des valeurs
// devinées) -- avec l'en-tête réel de la lettre (identité, date, objet)
// et un texte de remplissage réaliste :
//   - jusqu'à ~4200 caractères : taille normale (10.5pt corps / 10pt
//     en-tête, TAILLE_CORPS=21/TAILLE_ENTETE=20) tient sur une page.
//   - jusqu'à ~5000 caractères : 9.5pt/9pt (19/18) suffit.
//   - jusqu'à ~5500 caractères : 9pt/8.5pt (18/17) suffit.
//   - au-delà (rare, un texte anormalement long) : même à la plus petite
//     taille lisible, la coupe reste nécessaire -- _dnTronquerTexte()
//     (formatA5CV.js) coupe alors proprement au dernier espace, jamais
//     en plein mot, en tout dernier recours seulement, jamais en premier.
// Ne s'applique qu'au format par défaut ('A4'/absent) : 'A4-essentiel'
// et 'A5' ont déjà leur propre troncature dédiée, volontairement plus
// courte (voir LONGUEURS_TEXTE_LETTRE plus haut) -- jamais les deux
// mécanismes en même temps.
var PALIERS_TAILLE_LETTRE = [
  { longueurMax: 4200, tailleCorps: 21, tailleEnTete: 20 },
  { longueurMax: 5000, tailleCorps: 19, tailleEnTete: 18 },
  { longueurMax: 5500, tailleCorps: 18, tailleEnTete: 17 }
];
var LONGUEUR_MAX_ABSOLUE_LETTRE = 5500;

// TACHE (retour utilisateur 2026-09-15, generalisation) : extrait de
// genererDocxNatifLettre() (ci-dessous) pour etre reutilisee AUSSI par
// genererDocxNatifLettreFormat() (formatsLettreEntretien.js, le generateur
// utilise par "Vos documents" -- tous les parcours qui y arrivent,
// guide/pret/maj ET Co-construire ma lettre une fois "Termine" clique).
// Avant cette extraction, seul le bouton d'export DIRECT de Co-construire
// ma lettre (qui appelle genererDocxNatifLettre() sans passer par "Vos
// documents") beneficiait de cet ajustement -- "Vos documents" risquait
// de deborder sur une 2e page pour un texte long, ce que le prompt promet
// pourtant ("la lettre finale tient sur une seule page A4"). Un seul
// calcul desormais, jamais deux versions qui peuvent diverger. Ne
// s'applique qu'au format long par defaut ('A4'/absent) : "A4-essentiel"
// a deja sa propre troncature dediee (LONGUEURS_TEXTE_LETTRE,
// formatsLettreEntretien.js), jamais les deux mecanismes en meme temps.
function _dnAjusterLettrePourUnePage(objetLettre, opts) {
  opts = opts || {};
  if (opts.formatPage && opts.formatPage !== 'A4') { return { objetLettre: objetLettre, opts: opts }; }
  // Essai de mise en page MESURE sur l'apercu (CANDIDATS_MISE_EN_PAGE_LETTRE_CO) : prioritaire sur l'estimation ci-dessous.
  if (opts.miseEnPageMesuree) {
    var essai = opts.miseEnPageMesuree;
    return { objetLettre: objetLettre, opts: { primaire: opts.primaire, formatPage: opts.formatPage, tailleCorps: essai.tailleCorps, tailleEnTete: essai.tailleEnTete, destinataireCote: essai.cote, espacement: essai.espacement } };
  }
  // Le bloc du destinataire prend de la place (environ 60 caracteres de texte par ligne) : il compte dans la longueur. Mesure reelle de la page : temps 3, etape « Mise en page ».
  var lignesDest = (objetLettre.destinataire && objetLettre.destinataire.lignes) ? objetLettre.destinataire.lignes.length : 0;
  // Decision de Denis (24/10/2026) : quand la lettre est longue, le destinataire monte au niveau des coordonnees (a leur droite) avant de rapetisser la police.
  var cote = (typeof destinataireCoteLettreCo === 'function') && destinataireCoteLettreCo((objetLettre.texte || '').length, lignesDest, PALIERS_TAILLE_LETTRE[0].longueurMax);
  var longueur = (objetLettre.texte || '').length + (cote ? 0 : lignesDest * 90);
  var palier = PALIERS_TAILLE_LETTRE.filter(function (p) { return longueur <= p.longueurMax; })[0];
  if (palier) {
    return { objetLettre: objetLettre, opts: { primaire: opts.primaire, formatPage: opts.formatPage, tailleCorps: palier.tailleCorps, tailleEnTete: palier.tailleEnTete, destinataireCote: cote } };
  }
  // Dernier recours seulement : meme a la plus petite taille lisible, le
  // texte depasserait encore une page -- coupe propre (jamais en plein
  // mot), pas de reduction de police supplementaire au-dela (une police
  // plus petite que 8.5pt nuirait a la lisibilite).
  var dernierPalier = PALIERS_TAILLE_LETTRE[PALIERS_TAILLE_LETTRE.length - 1];
  var objetTronque = {};
  Object.keys(objetLettre).forEach(function (cle) { objetTronque[cle] = objetLettre[cle]; });
  objetTronque.texte = (typeof _dnTronquerTexte === 'function')
    ? _dnTronquerTexte(objetLettre.texte, LONGUEUR_MAX_ABSOLUE_LETTRE)
    : objetLettre.texte;
  return { objetLettre: objetTronque, opts: { primaire: opts.primaire, formatPage: opts.formatPage, tailleCorps: dernierPalier.tailleCorps, tailleEnTete: dernierPalier.tailleEnTete, destinataireCote: cote } };
}

function genererDocxNatifLettre(modeleId, objetLettre, opts) {
  var generateur = GENERATEURS_DOCX_NATIFS_LETTRE[modeleId];
  if (!generateur) { return Promise.reject(new Error('Pas de generateur Word natif pour ce modele de lettre.')); }
  var ajuste = _dnAjusterLettrePourUnePage(objetLettre, opts);
  return chargerLibrairieDocxNatif().then(function (docx) {
    var document = generateur(docx, ajuste.objetLettre, ajuste.opts);
    return docx.Packer.toBlob(document);
  });
}
