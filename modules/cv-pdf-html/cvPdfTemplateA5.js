/* ============================================================
   cvPdfTemplateA5.js
   ------------------------------------------------------------
   Moteur "CV design (PDF)" -- rendu HTML/CSS du Mini CV A5
   (Portrait et Paysage), miroir de cvPdfTemplateA4.js pour ce
   format. Isolation : ne depend QUE de la composition retournee
   par composeurComposerA5Portrait() (modules/cv-composeur/
   composeurComposition.js, routee automatiquement par
   composeurComposer() quand formatPage='A5-portrait'/'A5-paysage',
   voir cvPdfDonnees.js) -- AUCUNE re-decision de contenu ici,
   uniquement la mise en forme HTML/CSS.

   Forme de `compositionA5` : PLATE, differente de la composition
   A4 (pas de contenuRetenu/strategieCV) --
   { competences, experiences, formations, loisirs, langues,
     engagements, certifications, competencesPersonnelles,
     colonneGauche, colonneDroite, formatPage }. colonneGauche/
   colonneDroite = tableaux de CLES de rubrique deja reparties par
   composeurComposerA5Portrait (budget de hauteur estime), jamais
   recalculees ici.

   Reutilise (meme fichier HTML, meme scope global -- charge APRES
   cvPdfTemplateA4.js dans index.html) : _pdfEscaperHtml,
   _pdfTitreH2, _pdfLignesMissions, _pdfDecouperMissions,
   _PDF_POLICES -- jamais une 2e copie de ces petits utilitaires.
   ============================================================ */

var _PDF_A5_TITRES_RUBRIQUES = {
  experiences: 'Expérience professionnelle', competences: 'Compétences', formations: 'Formations et diplômes',
  loisirs: 'Centres d’intérêt', langues: 'Langues', engagements: 'Engagements',
  certifications: 'Certifications', competencesPersonnelles: 'Compétences personnelles',
  // TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28).
  logiciels: 'Logiciels et outils'
};
// TACHE (memes pictogrammes "trait fin" que l'A4 -- _PDF_ICONES_SVG,
// cvPdfTemplateA4.js, meme scope global) : cles au lieu d'emoji, meme
// principe. competencesPersonnelles ('✨' avant -- aussi vague que l'etoile
// deja rejetee pour les competences cles) reprend l'icone "bulle" deja
// utilisee cote A4 pour les competences comportementales (meme famille de
// sens -- savoir-etre/qualites personnelles), jamais un pictogramme dedie
// invente en double pour un champ qui n'existe qu'ici.
var _PDF_A5_ICONES_RUBRIQUES = {
  experiences: 'experience', competences: 'competences', formations: 'formations', loisirs: 'loisirs',
  langues: 'langues', engagements: 'engagements', certifications: 'certifications', competencesPersonnelles: 'competencesComportementales',
  // TACHE (rubrique « Logiciels et outils » dédiée) : icône réutilisée
  // ('competences', liste), jamais un pictogramme dessiné en double.
  logiciels: 'competences'
};

// Port de texteEngagementA5/texteCompetencePersoA5 (composeurRender.js:706-707) :
// ces listes contiennent parfois des chaines brutes, parfois des objets
// {texte:...}/{competence:...} selon la rubrique -- jamais une 2e forme de
// donnees inventee ici, juste la meme tolerance que le Word.
function _pdfA5TexteItem(item) {
  return (typeof item === 'string') ? item : ((item && (item.texte || item.competence)) || '');
}

// Port de construireRubriqueA5 (composeurRender.js:708-744), en HTML.
// TACHE (retour utilisateur : "souligner le poste, les dates,
// l'entreprise... et pareil pour l'italique") : `styleParties` (optionnel,
// { poste, dates, entreprise }, meme forme que l'A4 -- cvPdfTemplateA4.js/
// _pdfSpanStylePartie) applique aux experiences et formations, memes 3
// reglages GLOBAUX partages avec l'A4 (jamais un 2e systeme invente pour
// ce format).
// TACHE (retour utilisateur : "le mode Sobre doit s'appliquer aussi au
// Mini CV A5 -- je vois encore des pastilles") : `styleCompetences`
// (optionnel, meme convention que l'A4 -- 'texte' = pas de pastille du
// tout) ajoute ICI -- jusque-la, .puce-competence-a5 etait un style de
// pastille EN DUR, jamais controle par le reglage "Style des competences"
// ni par le filtre Sobre (qui force ce reglage a 'texte' -- voir
// _pdfLireOptions()/cvPdfPanneauReglages.js -- mais que ce fichier
// ignorait completement, un 2e systeme de rendu jamais branche sur le 1er).
function _pdfA5ConstruireRubrique(cle, compositionA5, iconesActives, styleParties, styleCompetences) {
  var titre = _PDF_A5_TITRES_RUBRIQUES[cle];
  var icone = _PDF_A5_ICONES_RUBRIQUES[cle] || '';
  var stylePoste = styleParties && styleParties.poste;
  var styleDates = styleParties && styleParties.dates;
  var styleEntreprise = styleParties && styleParties.entreprise;
  var corpsHtml = '';
  if (cle === 'experiences') {
    corpsHtml = (compositionA5.experiences || []).map(function (e) {
      var periode = _pdfFormaterPeriode(e.dateDebut, e.dateFin);
      // TACHE (retour utilisateur : "Carrelage : 2017-2022", pas de
      // parentheses) : meme convention deux-points que l'A4.
      var titreHtml = [_pdfSpanStylePartie(e.poste, stylePoste), _pdfSpanStylePartie(e.entreprise, styleEntreprise)].filter(Boolean).join(' - ');
      return '<div class="item-a5"><strong>' + titreHtml + (periode ? ' : ' + _pdfSpanStylePartie(periode, styleDates) : '') + '</strong>' + _pdfLignesMissions(e.missions) + '</div>';
    }).join('');
  } else if (cle === 'competences') {
    corpsHtml = (styleCompetences === 'texte')
      ? '<p class="texte-competences-a5">' + (compositionA5.competences || []).map(function (c) { return _pdfEscaperHtml(_pdfA5TexteItem(c)); }).join(' • ') + '</p>'
      : (compositionA5.competences || []).map(function (c) {
        return '<span class="puce-competence-a5">' + _pdfEscaperHtml(_pdfA5TexteItem(c)) + '</span>';
      }).join('');
  } else if (cle === 'formations') {
    corpsHtml = (compositionA5.formations || []).map(function (f) {
      // TACHE (retour utilisateur : "jamais BTS (2015) mais plutot
      // BTS - 2015") : tiret simple au lieu de parentheses.
      var diplomeTexte = [f.niveau, f.intitule].filter(Boolean).join(' - ');
      var ligne = _pdfSpanStylePartie(diplomeTexte, stylePoste) + (f.annee ? ' - ' + _pdfSpanStylePartie(f.annee, styleDates) : '');
      var premiereMission = _pdfDecouperMissions(f.missions)[0];
      return '<div class="item-a5">' + (diplomeTexte || f.annee ? ligne : '') +
        (premiereMission ? '<div class="item-a5-secondaire">' + _pdfEscaperHtml(premiereMission) + '</div>' : '') + '</div>';
    }).join('');
  } else if (cle === 'loisirs') {
    corpsHtml = (compositionA5.loisirs || []).map(function (l) {
      var texte = String(l || '');
      return '<div class="item-a5">' + _pdfEscaperHtml(texte.charAt(0).toUpperCase() + texte.slice(1)) + '</div>';
    }).join('');
  } else if (cle === 'langues') {
    corpsHtml = (compositionA5.langues || []).map(function (l) {
      return '<div class="item-a5">' + _pdfEscaperHtml(l.langue + ' - ' + l.niveau) + '</div>';
    }).join('');
  } else if (cle === 'logiciels') {
    // TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28) :
    // une ligne par logiciel, même rendu que 'langues'. corpsHtml vide si la
    // liste est vide -> _pdfA5ConstruireRubrique retourne '' (rien affiché).
    corpsHtml = (compositionA5.logiciels || []).map(function (l) {
      return '<div class="item-a5">' + _pdfEscaperHtml(String(l || '')) + '</div>';
    }).join('');
  } else if (cle === 'engagements') {
    corpsHtml = (compositionA5.engagements || []).map(function (e) {
      if (typeof e === 'string' || !e || (!e.intitule && !e.texte)) { return '<div class="item-a5">' + _pdfEscaperHtml(_pdfA5TexteItem(e)) + '</div>'; }
      var periodeEng = _pdfFormaterPeriode(e.dateDebut, e.dateFin);
      var titreEng = _pdfSpanStylePartie(e.intitule || e.texte, stylePoste);
      return '<div class="item-a5">' + titreEng + (periodeEng ? ' : ' + _pdfSpanStylePartie(periodeEng, styleDates) : '') + '</div>';
    }).join('');
  } else if (cle === 'certifications') {
    var certifsTexte = (compositionA5.certifications || []).join(', ');
    corpsHtml = certifsTexte ? '<div class="item-a5">' + _pdfEscaperHtml(certifsTexte) + '</div>' : '';
  } else if (cle === 'competencesPersonnelles') {
    corpsHtml = (compositionA5.competencesPersonnelles || []).map(function (c) {
      return '<div class="item-a5">' + _pdfEscaperHtml(_pdfA5TexteItem(c)) + '</div>';
    }).join('');
  }
  if (!corpsHtml) { return ''; }
  // TACHE (retour utilisateur : "les mêmes options que l'A4 -- déplacer
  // les rubriques, les redimensionner, éditer le texte à la main") :
  // _pdfEnvelopperRubriqueDrag (cvPdfTemplateA4.js, meme scope global --
  // charge avant ce fichier) ajoute data-rubrique/draggable, la SEULE
  // chose qui manquait pour que TOUT le reste marche gratuitement --
  // glisser-deposer, mini-barre flottante (agrandir/police/style de
  // puce) ET edition de texte directe (_pdfAssignerIdentifiantsEdition,
  // cvPdfPanneauReglages.js) ciblent tous generiquement [data-rubrique],
  // jamais un attribut different pour l'A5.
  return _pdfEnvelopperRubriqueDrag('<div class="rubrique-a5">' + _pdfTitreH2(icone, titre, iconesActives) + corpsHtml + '</div>', cle);
}

function _pdfA5ConstruireColonne(cles, compositionA5, iconesActives, styleParties, styleCompetences) {
  return (cles || []).map(function (cle) { return _pdfA5ConstruireRubrique(cle, compositionA5, iconesActives, styleParties, styleCompetences); }).join('');
}

// ---- Bloc identite : 3 primitives partagees, composees differemment en
// Portrait (2 zones permutables, SANS objectif dans la zone identite --
// port de construireZoneIdentiteA5Portrait/construireZoneObjectifA5Portrait,
// composeurRender.js:659-692) et en Paysage (1 seul bloc regroupant tout
// dans l'ordre photo -> objectif -> nom -> coordonnees -> permis, port de
// construireBlocIdentiteA5, composeurRender.js:617-650).
function _pdfA5Photo(objetCV, anneauPhoto) {
  var photoUrl = (objetCV.photo && objetCV.photo.url) || null;
  return photoUrl
    ? '<div class="photo-conteneur-a5' + (anneauPhoto ? ' avec-anneau' : '') + '"><img class="photo-a5" src="' + _pdfEscaperHtml(photoUrl) + '" alt="Photo"></div>'
    : '';
}
function _pdfA5NomCoordPermis(objetCV, iconesCoordonnees) {
  var identite = objetCV.identite || {};
  var permis = objetCV.permis || {};
  // TACHE (retour utilisateur : "pour la ville, que la 1ere lettre en
  // majuscule, les autres en minuscule") : _pdfFormaterVille, deja
  // definie dans cvPdfTemplateA4.js -- toujours charge avec ce fichier
  // (meme scope global), jamais une 2e copie de cette fonction.
  var villeCp = [_pdfFormaterVille(identite.ville), identite.codePostal ? '(' + identite.codePostal + ')' : ''].filter(Boolean).join(' ');
  // TACHE (retour utilisateur : "le nom de famille toujours en
  // majuscules") : meme convention que l'A4 (cvPdfTemplateA4.js).
  var nomComplet = [identite.prenom, (identite.nom || '').toUpperCase()].filter(Boolean).join(' ');
  var nomHtml = nomComplet ? '<p class="nom-a5">' + _pdfEscaperHtml(nomComplet) + '</p>' : '';
  var coordHtml = [
    { texte: identite.email, icone: 'email' },
    { texte: identite.telephone, icone: 'telephone' },
    { texte: villeCp, icone: 'localisation' }
  ].filter(function (l) { return l.texte; })
    .map(function (l) { return '<p class="coord-a5">' + (iconesCoordonnees ? _pdfIconeSvg(l.icone) : '') + _pdfEscaperHtml(l.texte) + '</p>'; }).join('');
  var permisHtml = permis.possede
    ? '<p class="coord-a5">' + (iconesCoordonnees ? _pdfIconeSvg('permis') : '') + 'Permis ' + _pdfEscaperHtml((permis.categories || []).join('/') || 'B') + (permis.vehicule ? ' + véhicule' : '') + '</p>'
    : '';
  return nomHtml + coordHtml + permisHtml;
}
function _pdfA5Objectif(objetCV) {
  return objetCV.objectifProfessionnel
    ? '<p class="objectif-a5">' + _pdfEscaperHtml(objetCV.objectifProfessionnel.toUpperCase()) + '</p>'
    : '';
}
function _pdfA5ZoneIdentitePortrait(objetCV, anneauPhoto, iconesCoordonnees) {
  return '<div class="zone-a5">' + _pdfA5Photo(objetCV, anneauPhoto) + _pdfA5NomCoordPermis(objetCV, iconesCoordonnees) + '</div>';
}
function _pdfA5ZoneObjectifPortrait(objetCV) {
  return '<div class="zone-a5">' + _pdfA5Objectif(objetCV) + '</div>';
}
function _pdfA5BlocIdentitePaysage(objetCV, anneauPhoto, iconesCoordonnees) {
  return '<div class="bloc-identite-a5">' + _pdfA5Photo(objetCV, anneauPhoto) + _pdfA5Objectif(objetCV) + _pdfA5NomCoordPermis(objetCV, iconesCoordonnees) + '</div>';
}

// Construit { css, pageHtml } -- reutilise a la fois par
// construireHtmlPdfA5() (export/impression statique) et par le panneau de
// reglages interactif (cvPdfPanneauReglages.js), meme convention que
// _pdfConstruireStyleEtPage (cvPdfTemplateA4.js). `options` :
//   couleurDebut: couleur d'accent unique (defaut bleu du prototype A4)
//   police: 'segoe' | 'georgia' | 'verdana' | 'garamond' (defaut 'segoe')
//   iconesRubriques: bool (defaut false)
//   iconesCoordonnees: bool (defaut false)
//   texteFondColonnes: 'blanc' | 'noir' (defaut 'blanc')
//   fondColonnesA5: 'aucun' | 'gauche' | 'droite' | 'lesDeux' | 'milieu'
//     (defaut 'droite') -- 'milieu' ignore hors Paysage (pas de colonne
//     centrale en Portrait, port de theme.fondColonnes==='milieu',
//     composeurRender.js:778, EXCLUSIF au Paysage cote Word).
//   separateurColonnes: bool (defaut false)
//   enteteInverseeA5: bool (defaut false) -- permute les 2 zones de l'en-
//     tete Portrait (identite / objectif), port de theme.enteteInversee.
//     Ignore en Paysage (bloc identite toujours au centre, jamais permute
//     cote Word non plus).
//   anneauPhoto: bool (defaut false) -- meme mecanisme que l'A4.
// L'orientation (Portrait/Paysage) est lue sur compositionA5.formatPage
// (deja pose par composeurComposerA5Portrait/composeurComposer, jamais
// redecidee ici).
function _pdfConstruireStyleEtPageA5(objetCV, compositionA5, options) {
  var opts = options || {};
  var composition = compositionA5 || {};
  // TACHE (retour utilisateur : "je veux pouvoir choisir l'ordre
  // d'affichage, par date ou par poste") : meme reglage/logique que l'A4
  // (cvPdfTemplateA4.js) -- "pertinence" (defaut) ne trie pas. Copie de
  // `composition` (jamais de mutation de compositionA5, reutilise tel
  // quel par l'appelant).
  var ordreExperiencesA5 = opts.ordreExperiences || 'pertinence';
  if (composition.experiences && composition.experiences.length && ordreExperiencesA5 !== 'pertinence') {
    var experiencesA5Triees = composition.experiences.slice();
    var _pdfA5CleDateExperience = function (e) { return (e && (e.dateDebut || e.dateFin)) || ''; };
    if (ordreExperiencesA5 === 'date-desc') { experiencesA5Triees.sort(function (a, b) { return _pdfA5CleDateExperience(b).localeCompare(_pdfA5CleDateExperience(a)); }); }
    else if (ordreExperiencesA5 === 'date-asc') { experiencesA5Triees.sort(function (a, b) { return _pdfA5CleDateExperience(a).localeCompare(_pdfA5CleDateExperience(b)); }); }
    else if (ordreExperiencesA5 === 'poste-asc') { experiencesA5Triees.sort(function (a, b) { return (a.poste || '').localeCompare(b.poste || '', 'fr', { sensitivity: 'base' }); }); }
    else if (ordreExperiencesA5 === 'poste-desc') { experiencesA5Triees.sort(function (a, b) { return (b.poste || '').localeCompare(a.poste || '', 'fr', { sensitivity: 'base' }); }); }
    var compositionA5Triee = {};
    Object.keys(composition).forEach(function (cle) { compositionA5Triee[cle] = composition[cle]; });
    compositionA5Triee.experiences = experiencesA5Triees;
    composition = compositionA5Triee;
  }
  var orientation = (composition.formatPage === 'A5-paysage') ? 'paysage' : 'portrait';
  var largeurPage = orientation === 'paysage' ? '210mm' : '148mm';
  var hauteurPage = orientation === 'paysage' ? '148mm' : '210mm';
  var couleurDebut = opts.couleurDebut || '#2f6690';
  var police = _PDF_POLICES[opts.police] || _PDF_POLICES.segoe;
  var icones = !!opts.iconesRubriques;
  var iconesCoordonnees = !!opts.iconesCoordonnees;
  // TACHE (retour utilisateur : "cette limite s'applique aussi à tous les
  // autres CV... il va falloir corriger ça pour que le modèle A5 puisse
  // profiter de la variété et de la richesse de tous les autres modèles") :
  // le panneau masquait TOUT le bloc "Style" en A5 (_PDF_SECTIONS_A4_SEULEMENT,
  // cvPdfPanneauReglages.js) alors que styleCompetences/styleParties
  // (soulignerPoste etc., juste plus bas) etaient DEJA lus par ce fichier --
  // seuls styleTitres/styleBordures/lectureGuidee et les couleurs de
  // pastille (couleurFondCompetences/couleurTextePuces) manquaient
  // reellement d'un equivalent A5. Les 4 ajoutes ici, meme convention que
  // l'A4 (memes noms d'options, jamais un 2e jeu invente) -- le panneau
  // devient donc bien "riche" en A5, plus seulement en A4.
  var styleTitresA5 = opts.styleTitres || 'souligne';
  var styleBorduresA5 = opts.styleBordures || 'fine';
  var lectureGuideeA5 = !!opts.lectureGuidee;
  var couleurFondCompetencesA5 = opts.couleurFondCompetences || '#e9e9e9';
  var couleurTextePucesA5 = opts.couleurTextePuces || '#1b1b1b';
  var texteFondNoir = opts.texteFondColonnes === 'noir';
  var texteFond = texteFondNoir ? '#1b1b1b' : '#fff';
  var fondColonnesA5 = opts.fondColonnesA5 || 'droite';
  // TACHE (retour utilisateur : "le bouton Mise en page doit aussi
  // fonctionner pour le Mini CV A5") : jusque-la, opts.echelleContenu
  // (curseur manuel + ajustement automatique, deja utilises par l'A4 --
  // cvPdfTemplateA4.js) n'etait jamais lu ici -- aucun des 2 n'avait le
  // moindre effet sur le rendu A5, quelle que soit leur valeur. Applique
  // ci-dessous a chaque taille de police (voir le bloc CSS plus bas,
  // jamais aux marges/paddings -- meme choix que le "tailleBonus" cote
  // Word, une police plus grande suffit a mieux remplir la page sans
  // bouleverser toute la mise en page).
  var echelleA5 = opts.echelleContenu || 1;
  var separateurColonnes = !!opts.separateurColonnes;
  var enteteInverseeA5 = !!opts.enteteInverseeA5;
  var anneauPhoto = !!opts.anneauPhoto;
  // TACHE (retour utilisateur : "gaspillage des feuilles" -- 2 Mini CV A5
  // sur une seule feuille A4, a decouper) : A5 tient EXACTEMENT 2 fois dans
  // une feuille A4 (dans les 2 orientations, mais pas de la meme facon --
  // 148 x 2 = 296mm) :
  //   - Paysage (page-a5 210x148mm) : empilees (296mm de haut) -> feuille
  //     A4 PORTRAIT (210x297mm).
  //   - Portrait (page-a5 148x210mm) : cote a cote (296mm de large) ->
  //     feuille A4 PAYSAGE (297x210mm).
  // Empiler 2 portraits (ou juxtaposer 2 paysages) depasserait largement
  // du format A4 -- jamais propose, voir le panneau de reglages
  // (regRemplirPageA5, sectionA5Seulement).
  var remplirPageA5 = !!opts.remplirPageA5;
  // TACHE (retour utilisateur : "souligner le poste, les dates,
  // l'entreprise... et pareil pour l'italique") : memes 3 reglages
  // GLOBAUX que l'A4 (cvPdfTemplateA4.js), partages via les memes IDs
  // d'options -- jamais un 2e jeu de reglages A5 duplique.
  var styleParties = {
    poste: { souligne: !!opts.soulignerPoste, italique: !!opts.italiquePoste },
    dates: { souligne: !!opts.soulignerDates, italique: !!opts.italiqueDates },
    entreprise: { souligne: !!opts.soulignerEntreprise, italique: !!opts.italiqueEntreprise }
  };
  // TACHE (retour utilisateur : mode Sobre doit s'appliquer au Mini CV A5
  // aussi) : meme reglage/meme convention que l'A4 (defaut 'pastille',
  // jamais un 2e defaut invente) -- voir _pdfA5ConstruireRubrique plus
  // haut pour le rendu 'texte' qui en decoule.
  var styleCompetencesA5 = opts.styleCompetences || 'pastille';

  // TACHE (retour utilisateur : "les mêmes options que l'A4 -- pouvoir
  // déplacer les rubriques") : opts.ordrePersonnalise (glisser-deposer,
  // pose par _pdfActiverGlisserDeposer -- cvPdfPanneauReglages.js, MEME
  // mecanisme que l'A4) REMPLACE entierement la repartition gauche/droite
  // par defaut de composeurComposerA5Portrait (composition.colonneGauche/
  // colonneDroite, un budget de hauteur ESTIME, jamais un choix manuel)
  // des qu'il est present -- exactement le meme principe que l'A4
  // (cvPdfTemplateA4.js, ~L1085), jamais une 2e logique de repartition
  // ecrite a la main pour ce format. Construit chaque bloc de rubrique
  // UNE SEULE FOIS (blocsA5ParCle), reutilise dans les 2 branches --
  // jamais un rendu different entre "ordre par defaut" et "ordre
  // personnalise" pour une meme rubrique.
  var TOUTES_CLES_A5 = ['experiences', 'competences', 'formations', 'loisirs', 'langues', 'logiciels', 'engagements', 'certifications', 'competencesPersonnelles'];
  var blocsA5ParCle = {};
  TOUTES_CLES_A5.forEach(function (cle) { blocsA5ParCle[cle] = _pdfA5ConstruireRubrique(cle, composition, icones, styleParties, styleCompetencesA5); });
  var ordrePersonnaliseA5 = opts.ordrePersonnalise;
  var colonneGaucheHtml, colonneDroiteHtml;
  if (ordrePersonnaliseA5 && (ordrePersonnaliseA5.gauche || ordrePersonnaliseA5.droite)) {
    colonneGaucheHtml = (ordrePersonnaliseA5.gauche || []).map(function (cle) { return blocsA5ParCle[cle]; }).filter(Boolean).join('');
    colonneDroiteHtml = (ordrePersonnaliseA5.droite || []).map(function (cle) { return blocsA5ParCle[cle]; }).filter(Boolean).join('');
  } else {
    colonneGaucheHtml = (composition.colonneGauche || []).map(function (cle) { return blocsA5ParCle[cle]; }).filter(Boolean).join('');
    colonneDroiteHtml = (composition.colonneDroite || []).map(function (cle) { return blocsA5ParCle[cle]; }).filter(Boolean).join('');
  }

  var appliqueFondGauche = fondColonnesA5 === 'gauche' || fondColonnesA5 === 'lesDeux';
  var appliqueFondDroite = fondColonnesA5 === 'droite' || fondColonnesA5 === 'lesDeux';
  var appliqueFondMilieu = fondColonnesA5 === 'milieu' && orientation === 'paysage';
  var classesGaucheA5 = 'colonne-a5' + (appliqueFondGauche ? ' fond-actif-a5' : '');
  var classesDroiteA5 = 'colonne-a5' + (appliqueFondDroite ? ' fond-actif-a5' : '');
  var classesIdentiteA5 = 'bloc-identite-a5-colonne' + (appliqueFondMilieu ? ' fond-actif-a5' : '');
  // TACHE (richesse A5, meme convention que corpsRubriquesClasse cote A4)
  var classeStyleTitresA5 = (styleTitresA5 === 'bandeau') ? ' style-titres-bandeau'
    : (styleTitresA5 === 'aucun') ? ' style-titres-aucun'
    : (styleTitresA5 === 'pastille') ? ' style-titres-pastille' : '';
  var classePageA5 = classeStyleTitresA5 + (lectureGuideeA5 ? ' lecture-guidee-a5' : '');

  var identite = objetCV.identite || {};
  var nomCompletTitre = [identite.prenom, identite.nom].filter(Boolean).join(' ');

  // Tailles calibrees plus petites que l'A4 (reference Word, demi-points
  // 26/19/17 pour nom/titre/corps -- traduites ici en px, ajustees a l'oeil
  // sur la page A5 reelle, jamais une conversion mecanique demi-point->px).
  var css =
    ':root { --a5-accent: ' + couleurDebut + '; --a5-texte-fond: ' + texteFond + '; }' +
    '* { box-sizing: border-box; }' +
    // TACHE (meme bug reel que cvPdfTemplateA4.js -- couleurs de fond
    // disparues a l'impression sans ce reglage, voir commentaire la-bas).
    '* { print-color-adjust: exact; -webkit-print-color-adjust: exact; }' +
    '.page-a5 { width: ' + largeurPage + '; min-height: ' + hauteurPage + '; margin: 24px auto; background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,0.25); font-family: ' + police + '; color: #1b1b1b; overflow: hidden; }' +
    '.rubrique-a5 { margin-bottom: 9px; }' +
    '.rubrique-a5 h2 { font-size: ' + (10.5 * echelleA5).toFixed(2) + 'px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--a5-accent); border-bottom: ' + (styleBorduresA5 === 'epaisse' ? '4px' : '2px') + ' solid #e0e0e0; padding-bottom: 3px; margin: 0 0 5px 0; }' +
    '.item-a5 { font-size: ' + (9 * echelleA5).toFixed(2) + 'px; line-height: 1.35; margin-bottom: 4px; }' +
    '.item-a5 strong { display: block; font-size: ' + (9.5 * echelleA5).toFixed(2) + 'px; }' +
    '.item-a5-secondaire { font-style: italic; opacity: 0.85; }' +
    // TACHE (retour utilisateur : "souligner le poste, les dates,
    // l'entreprise... et pareil pour l'italique") : memes noms de classe
    // que l'A4 (cvPdfTemplateA4.js), jamais un 2e nom invente pour ce
    // format.
    '.style-partie-souligne { text-decoration: underline; }' +
    '.style-partie-italique { font-style: italic; }' +
    '.ligne-mission { font-size: ' + (9 * echelleA5).toFixed(2) + 'px; line-height: 1.35; }' +
    '.puce-competence-a5 { display: inline-block; background: ' + couleurFondCompetencesA5 + '; color: ' + couleurTextePucesA5 + '; border-radius: 8px; padding: 2px 7px; font-size: ' + (8.5 * echelleA5).toFixed(2) + 'px; margin: 0 3px 3px 0; }' +
    // TACHE (retour utilisateur : mode Sobre sur Mini CV A5) : equivalent
    // A5 de .texte-competences (cvPdfTemplateA4.js) -- aucun fond, jamais
    // un cas particulier de .puce-competence-a5 avec un rayon a 0.
    '.texte-competences-a5 { font-size: ' + (8.5 * echelleA5).toFixed(2) + 'px; line-height: 1.4; margin: 0; }' +
    // TACHE (retour utilisateur : "le modèle A5 doit profiter de la
    // richesse des autres modèles") : memes 3 styles de titre que l'A4
    // (cvPdfTemplateA4.js), memes noms de classe portes par .page-a5 --
    // jamais un 2e vocabulaire invente pour ce format.
    '.style-titres-bandeau .rubrique-a5 h2 { background: var(--a5-accent); color: var(--a5-texte-fond); border-bottom: none; padding: 2px 8px; border-radius: 4px; display: inline-block; }' +
    '.style-titres-aucun .rubrique-a5 h2 { border-bottom: none; padding-bottom: 0; }' +
    '.icone-titre { display: contents; }' +
    '.style-titres-pastille .rubrique-a5 h2 { display: flex; align-items: center; border-bottom: none; padding-bottom: 0; color: #1b1b1b; }' +
    '.style-titres-pastille .icone-titre { display: inline-flex; align-items: center; justify-content: center; width: 1.5em; height: 1.5em; border-radius: 50%; background: var(--a5-accent); margin-right: 0.4em; flex: none; }' +
    '.style-titres-pastille .icone-titre .icone-ligne { width: 0.5em; height: 0.5em; margin: 0; stroke: var(--a5-texte-fond); }' +
    // TACHE (meme retour) : "Lecture guidée" (nom assorti au métier visé)
    // -- .objectif-a5 porte déjà l'accent par défaut, seul .nom-a5 (noir
    // par défaut) manquait de son pendant A5.
    '.lecture-guidee-a5 .nom-a5 { color: var(--a5-accent); }' +
    '.fond-actif-a5 { background: var(--a5-accent); color: var(--a5-texte-fond); }' +
    '.fond-actif-a5 .rubrique-a5 h2 { color: var(--a5-texte-fond); border-bottom-color: rgba(255,255,255,0.4); }' +
    '.fond-actif-a5 .puce-competence-a5 { background: rgba(255,255,255,0.25); color: var(--a5-texte-fond); }' +
    '.fond-actif-a5 .texte-competences-a5 { color: var(--a5-texte-fond); }' +
    // TACHE (bug trouve en testant, "Milieu" fond de colonne A5) :
    // .objectif-a5/.nom-a5/.coord-a5 portent chacun leur PROPRE couleur
    // (accent/texte/gris) -- sans cette regle, le `color` herite de
    // .fond-actif-a5 est systematiquement ecrase par ces couleurs
    // specifiques, rendant le texte illisible sur fond colore.
    '.fond-actif-a5 .objectif-a5, .fond-actif-a5 .nom-a5, .fond-actif-a5 .coord-a5 { color: var(--a5-texte-fond); }' +
    '.photo-conteneur-a5 { position: relative; width: 42px; height: 42px; margin: 0 auto 6px auto; }' +
    '.photo-a5 { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--a5-accent); position: relative; z-index: 1; }' +
    '.photo-conteneur-a5.avec-anneau::before { content: ""; position: absolute; top: 6px; left: 6px; width: 50px; height: 50px; border-radius: 50%; background: var(--a5-accent); opacity: 0.3; z-index: 0; }' +
    '.objectif-a5 { font-weight: bold; font-size: ' + (12 * echelleA5).toFixed(2) + 'px; letter-spacing: 0.06em; color: var(--a5-accent); margin: 0 0 4px 0; }' +
    '.nom-a5 { font-weight: bold; font-size: ' + (11.5 * echelleA5).toFixed(2) + 'px; margin: 0 0 4px 0; }' +
    '.coord-a5 { font-size: ' + (9 * echelleA5).toFixed(2) + 'px; color: #555; margin: 0 0 2px 0; }' +
    // TACHE (memes icones "trait fin" que l'A4, _pdfIconeSvg -- meme nom de
    // classe, mais feuille de style INDEPENDANTE : ce fichier construit son
    // propre `css` complet, jamais un import de celui de l'A4) : taille
    // relative (em), suit la police reduite de ce format.
    '.icone-ligne { width: 0.85em; height: 0.85em; vertical-align: -0.1em; margin-right: 0.3em; flex-shrink: 0; }' +
    // TACHE (2 Mini CV A5 par feuille A4) : .page-a5 garde EXACTEMENT les
    // memes dimensions/CSS qu'un exemplaire seul (jamais retaillee) --
    // seul son cadre (marge/ombre) est neutralise ici pour les 2 copies
    // collees dans .feuille-a4-remplie, qui porte desormais la marge/ombre
    // exterieure a sa place. `* { box-sizing: border-box }` (tout en haut)
    // garantit que la bordure pointillee posee sur la 2e copie ne fait pas
    // deborder la feuille d'1px.
    '.feuille-a4-remplie { display: flex; margin: 24px auto; background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,0.25); position: relative; }' +
    '.feuille-a4-remplie .page-a5 { margin: 0; box-shadow: none; flex: none; }' +
    '.feuille-a4-remplie.pile { flex-direction: column; width: 210mm; }' +
    '.feuille-a4-remplie.rangee { flex-direction: row; width: 297mm; }' +
    '.feuille-a4-remplie.pile .page-a5:last-child { border-top: 1px dashed #9ca3af; }' +
    '.feuille-a4-remplie.rangee .page-a5:last-child { border-left: 1px dashed #9ca3af; }' +
    // Repere de decoupe (ciseaux), pose au milieu de la ligne pointillee --
    // fond blanc pour "casser" le trait, jamais un simple ::after sur le
    // trait lui-meme (invisible, superpose au pointille).
    '.feuille-a4-remplie.pile::after { content: "✂️"; position: absolute; top: 50%; left: 6mm; transform: translateY(-50%); background: #fff; padding: 0 4px; font-size: 11px; line-height: 1; }' +
    '.feuille-a4-remplie.rangee::after { content: "✂️"; position: absolute; left: 50%; top: 6mm; transform: translateX(-50%); background: #fff; padding: 4px 0; font-size: 11px; line-height: 1; }' +
    '@media print { .page-a5, .feuille-a4-remplie { margin: 0 auto; box-shadow: none; } .rubrique-a5, .item-a5 { break-inside: avoid; } }';

  var pageHtml;
  if (orientation === 'paysage') {
    css +=
      '.zone-a5, .bloc-identite-a5 { text-align: center; }' +
      '.corps-a5-paysage { display: flex; min-height: ' + hauteurPage + '; }' +
      '.colonne-a5 { flex: 1; min-width: 0; padding: 8mm 6mm; }' +
      '.bloc-identite-a5-colonne { flex: 0 0 32mm; display: flex; align-items: center; justify-content: center; padding: 8mm 4mm; }' +
      (separateurColonnes
        ? '.corps-a5-paysage > .colonne-a5:first-child, .corps-a5-paysage > .bloc-identite-a5-colonne { border-right: 1px solid rgba(0,0,0,0.15); }'
        : '');
    var blocIdentitePaysage = _pdfA5BlocIdentitePaysage(objetCV, anneauPhoto, iconesCoordonnees);
    pageHtml = '<div class="page-a5' + classePageA5 + '"><div class="corps-a5-paysage">' +
      '<div class="' + classesGaucheA5 + '">' + colonneGaucheHtml + '</div>' +
      '<div class="' + classesIdentiteA5 + '">' + blocIdentitePaysage + '</div>' +
      '<div class="' + classesDroiteA5 + '">' + colonneDroiteHtml + '</div>' +
      '</div></div>';
  } else {
    css +=
      '.zone-a5 { text-align: center; }' +
      '.entete-a5-portrait { display: flex; padding: 8mm 6mm 6px 6mm; gap: 8px; align-items: center; }' +
      '.entete-a5-portrait > .zone-a5 { flex: 1; min-width: 0; }' +
      '.corps-a5-portrait { display: flex; gap: 8px; padding: 0 6mm 8mm 6mm; }' +
      '.colonne-a5 { flex: 1; min-width: 0; padding: 6px 8px; border-radius: 4px; }' +
      (separateurColonnes ? '.corps-a5-portrait > .colonne-a5:first-child { border-right: 1px solid rgba(0,0,0,0.15); }' : '');
    var zoneIdentitePortrait = _pdfA5ZoneIdentitePortrait(objetCV, anneauPhoto, iconesCoordonnees);
    var zoneObjectifPortrait = _pdfA5ZoneObjectifPortrait(objetCV);
    var zoneGauche = enteteInverseeA5 ? zoneObjectifPortrait : zoneIdentitePortrait;
    var zoneDroite = enteteInverseeA5 ? zoneIdentitePortrait : zoneObjectifPortrait;
    pageHtml = '<div class="page-a5' + classePageA5 + '">' +
      '<div class="entete-a5-portrait">' + zoneGauche + zoneDroite + '</div>' +
      '<div class="corps-a5-portrait">' +
      '<div class="' + classesGaucheA5 + '">' + colonneGaucheHtml + '</div>' +
      '<div class="' + classesDroiteA5 + '">' + colonneDroiteHtml + '</div>' +
      '</div></div>';
  }

  // TACHE (2 Mini CV A5 par feuille A4) : 2 exemplaires STRICTEMENT
  // identiques (memes reglages, meme contenu) cote a cote/empiles -- jamais
  // un 2e CV different, juste une mise en page d'impression econome en
  // papier (voir regRemplirPageA5, sectionA5Seulement du panneau). La page
  // resultante devient la feuille A4 entiere : largeurPage/hauteurPage
  // (lus par #stylePage/@page, cvPdfPanneauReglages.js) doivent donc
  // refleter la feuille, pas le Mini CV seul, sous peine d'imprimer une
  // feuille A5 alors que le contenu visuel occupe une A4 complete.
  if (remplirPageA5) {
    var modeRemplissage = orientation === 'paysage' ? 'pile' : 'rangee';
    pageHtml = '<div class="feuille-a4-remplie ' + modeRemplissage + '">' + pageHtml + pageHtml + '</div>';
    largeurPage = orientation === 'paysage' ? '210mm' : '297mm';
    hauteurPage = orientation === 'paysage' ? '297mm' : '210mm';
  }

  return { css: css, pageHtml: pageHtml, nomComplet: nomCompletTitre, largeurPage: largeurPage, hauteurPage: hauteurPage };
}

// Construit le document HTML COMPLET et autonome (export/impression
// statique, sans panneau de reglages) -- reutilise _pdfConstruireStyleEtPageA5
// pour ne jamais dupliquer la logique de rendu, meme convention que
// construireHtmlPdfA4 (cvPdfTemplateA4.js).
function construireHtmlPdfA5(objetCV, compositionA5, options) {
  var resultat = _pdfConstruireStyleEtPageA5(objetCV, compositionA5, options);
  return '<!DOCTYPE html>' +
'<html lang="fr"><head><meta charset="UTF-8"><title>CV -- ' + _pdfEscaperHtml(resultat.nomComplet) + '</title><style>' +
'  body { margin: 0; background: #e9e9e9; }' +
'  .barre-outils { padding: 12px 16px; background: #222; color: #fff; display: flex; gap: 12px; align-items: center; font-size: 14px; }' +
'  .barre-outils button { padding: 8px 14px; border: none; border-radius: 6px; background: #2f6690; color: #fff; cursor: pointer; font-size: 14px; }' +
resultat.css +
'  @media print { @page { size: ' + resultat.largeurPage + ' ' + resultat.hauteurPage + '; margin: 0; } body { background: #fff; } .barre-outils { display: none; } }' +
'</style></head><body>' +
'<div class="barre-outils"><strong>Aperçu Mini CV A5 (PDF -- nouveau, bêta)</strong><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>' +
resultat.pageHtml +
'</body></html>';
}
