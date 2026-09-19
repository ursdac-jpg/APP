/* ============================================================
   reglagesTraducteurs.js  --  MODELE CANONIQUE -> MOTEURS EXISTANTS
   ------------------------------------------------------------
   Chantier "La mise en page du CV" (docs/CADRAGE_MISE_EN_PAGE_2026-09-03.md).
   Sous-etape 2 : traducteur -> Word (approche "2-B, pipeline intact").

   PRINCIPE 2-B : le traducteur REPRODUIT EXACTEMENT les entrees que le
   panneau "Projet XXL" ecrit aujourd'hui -- rien en aval ne change.
   Le rendu Word lit :
     - etatApercuInline.cv.couleur          : chaine CODEE (couleur + colonnes)
     - etatApercuInline.cv.reglagesProjetXXL : objet de cles de style
     - etatApercuInline.cv.formatPage / .modeleA5 / .police / .taillePct
     - dossier.cvOptimiseActif  (Complet/Optimise, partage avec le PDF)
     - dossier.rechercheCandidature.couleurEntreprise
   puis composeurResoudreThemeGeneration() -> composeurAppliquerReglagesProjetXXL()
   -> theme -> genererDocxComposeur(). AUCUNE de ces fonctions n'est touchee.

   Ce fichier ne branche RIEN : il fabrique les objets. Le cablage (ecrire
   dans etatApercuInline / dossier) vient a la sous-etape 4.
   ============================================================ */

// COMPOSEUR_THEME_PROJETXXL.colonnes (composeurTheme.js) -- nombre de
// colonnes par defaut du theme. idComposeurComplet() n'ajoute le suffixe
// "_1col"/"_2col" QUE si le nombre choisi differe de ce defaut. Recopie
// ici avec un garde-fou de coherence (verifie au navigateur en sous-etape 2).
var TRAD_PROJETXXL_COLONNES_DEFAUT = 2;

// Lot moteur sous-lot 4 : les 7 rubriques de la liste unique "afficher /
// masquer". Meme liste que le schema (reglagesMiseEnPage.js, champ
// `rubriques`) et que composeurTheme.js. true = visible (defaut).
var TRAD_RUBRIQUES_MASQUABLES = ['langues', 'certifications', 'logiciels', 'experiencesPersonnelles', 'loisirs', 'engagements', 'permis'];

// POLICES_PROJETXXL_DISPONIBLES (composeurTheme.js) = ['Arial', 'Calibri',
// 'Georgia', 'Garamond', 'Century Gothic']. Correspondance depuis le
// vocabulaire canonique (10 polices, vocabulaire PDF). Les polices sans
// equivalent Word -> null = police par defaut du theme (Arial), jamais un
// remplacement arbitraire silencieux ; l'UI l'explique (champ.word = "note").
var TRAD_POLICE_CANON_VERS_WORD = {
  arial: 'Arial',
  calibri: 'Calibri',
  georgia: 'Georgia',
  garamond: 'Garamond'
  // segoe, verdana, tahoma, trebuchet, times, palatino -> null
};

// canon.format -> { formatPage, modeleA5 } de etatApercuInline.cv
var TRAD_FORMAT_CANON_VERS_WORD = {
  'a4-detaille':  { formatPage: 'A4' },
  'a4-essentiel': { formatPage: 'A4-essentiel' },
  'a4-integral':  { formatPage: 'A4-integral' },
  'a5-portrait':  { formatPage: 'A5', modeleA5: 'portrait' },
  'a5-paysage':   { formatPage: 'A5', modeleA5: 'paysage' }
};

/* ------------------------------------------------------------
   _tradIdCouleurProjetXXL(hexAccent, colonnes)
   Reproduit idComposeurComplet('projetxxl', 'hex:XXXXXX', colonnes)
   (js/app.js ~28367). L'accent canonique est TOUJOURS un hex libre ->
   toujours la forme "hex:" (jamais un id de palette + nuance). Consequence
   assumee : canon.nuance n'a AUCUN effet cote Word (le hex EST la couleur
   finale ; composeurResoudreCouleur(base + '-' + nuance) n'est pas utilise
   quand couleurPersonnalisee/couleurHexLibre ecrase theme.couleurs.primaire).
   L'UI "nuances rapides" cote Word choisira donc directement un autre hex
   pour `accent`.
   ------------------------------------------------------------ */
function _tradIdCouleurProjetXXL(hexAccent, colonnes) {
  var hex = String(hexAccent || '#2f6690').replace('#', '').toUpperCase();
  var id = 'projetxxl-hex:' + hex;
  var n = (colonnes === 1 || colonnes === 2) ? colonnes : TRAD_PROJETXXL_COLONNES_DEFAUT;
  if (n !== TRAD_PROJETXXL_COLONNES_DEFAUT) { id += (n === 2 ? '_2col' : '_1col'); }
  return id;
}

/* ------------------------------------------------------------
   traduireVersReglagesProjetXXL(canon)
   -> l'objet de cles de STYLE a fusionner dans
      etatApercuInline.cv.reglagesProjetXXL (Object.assign par l'appelant,
      pour PRESERVER les cles de "bookkeeping" du Composeur : tailleBonus,
      enteteBonus, capaciteExperiencesBonus, missionsBonus, bonusCapacites,
      detailForceParCompetences, strategieForcee, optionDebordement,
      blocDroiteDeplaceGauche & co., creatifActif/creatifModele...).

   Cle par cle, d'apres la liste blanche reelle de
   composeurResoudreThemeGeneration() (js/app.js ~26243-26380).
   ------------------------------------------------------------ */
function traduireVersReglagesProjetXXL(canon) {
  canon = canon || {};
  var r = {};

  // --- icones : passe-plat booleen
  r.iconesRubriques = !!canon.icones;
  r.iconesCoordonnees = !!canon.iconesCoordonnees;

  // --- Titres de rubrique + lecture guidee.
  // Word n'a PAS de champ "styleTitres" direct : composeurAppliquerReglagesProjetXXL
  // DERIVE theme.styleTitres de coloration + lectureGuideeVariante.
  //   canon 'bandeau'                 -> coloration 'lectureGuidee' + variante 'rectangle'
  //   canon 'souligne' / 'sans-decor' -> pas de bandeau (Word rend un titre
  //                                       souligne "simple" dans les deux cas
  //                                       -- pas de "sans decor" distinct en Word)
  //   canon 'pastille'               -> NON MAPPABLE : titresPastille n'est
  //                                     jamais transmis par ce chemin (reserve
  //                                     aux recettes Creatif). L'UI l'explique.
  var titreBandeau = (canon.styleTitres === 'bandeau');
  if (titreBandeau) {
    r.coloration = 'lectureGuidee';
    r.lectureGuideeVariante = 'rectangle';
  } else if (canon.lectureGuidee) {
    r.coloration = 'lectureGuidee';
    r.lectureGuideeVariante = 'titre';
  } else {
    r.coloration = 'aucune';
    r.lectureGuideeVariante = null;
  }
  // "Texte colore" (coloration === 'texteColore') existe cote Word mais n'a
  // pas de champ canonique dedie a ce stade -- pas emis ici (l'UII pourra
  // l'ajouter en sous-etape 6 si besoin).
  r.texteColorePortee = null;

  // --- Police : liste Word ou null (= defaut theme). Jamais un remplacement
  // arbitraire silencieux.
  r.police = TRAD_POLICE_CANON_VERS_WORD[canon.police] || null;

  // --- Fond des colonnes
  r.fondColonnes = ['aucun', 'gauche', 'droite', 'lesDeux'].indexOf(canon.fondColonnes) !== -1
    ? canon.fondColonnes : 'droite';
  r.fondColonnesEffet = (canon.fondColonnesEffet === 'titres') ? 'titres' : 'fondSeul';
  r.texteFondColonnes = (canon.texteFondColonnes === 'noir') ? 'noir' : 'blanc';
  // Equivalent Word de canon.fondColonnePleineHauteur (cote PDF) :
  r.fondColonneEtendueEntete = !!canon.fondColonnePleineHauteur;

  // --- En-tete
  r.fondTete = !!canon.bandeauEnTete;
  r.bandeauDisponibilite = !!canon.bandeauDisponibilite;
  // canon.formeEnTete / degradeBandeau / dispositionEntete / anneauPhoto :
  // PDF uniquement (docx.js = rectangle, pas de degrade ni de disposition
  // libre). Non emis -- l'UII les montre + explique (champ.word = false).
  //
  // canon (pas de champ) "photo a droite/gauche" = Word `enteteInversee`.
  // INVENTAIRE_ZERO_REGRESSION sect. 8 point 1 : marque "supprime" (aligne
  // sur le PDF) -- MAIS le libelle du resolver dit "photo a droite ou a
  // gauche", distinct de l'ancien "Permuter l'en-tete" bugge. A REVERIFIER
  // en sous-etape 6 avant de trancher : ici on ne l'emet pas (le merge
  // preserve la valeur live, defaut = non inverse), on ne l'ajoute ni ne
  // le retire.

  // --- Separateur de colonnes
  r.separateurColonnes = !!canon.separateurColonnes;
  // canon.separateurCouleur est un HEX libre ; Word attend un id de palette
  // (separateurCouleurBase) + nuance -> non exprimable tel quel. null =
  // le separateur garde l'accent principal. L'UII l'explique.
  r.separateurCouleurBase = null;

  // --- Colonnes inversees (permuter gauche/droite) : passe-plat
  r.colonnesInversees = !!canon.colonnesInversees;

  // --- Missions (pro / perso)
  r.styleProfessionnel = (canon.styleProfessionnel === 'condense') ? 'condense' : 'epure';
  r.stylePersonnel = (canon.stylePersonnel === 'condense') ? 'condense' : 'epure';

  // --- Ordre dans la ligne d'experience : canon 'dates'/'poste' -> Word
  // 'dateAvant'/'posteAvant'
  r.ordreDatesPoste = (canon.ordreDatesPoste === 'poste') ? 'posteAvant' : 'dateAvant';

  // --- Accroche en italique
  r.accrocheItalique = (canon.accrocheItalique !== false);

  // --- Mettre en evidence : maps canoniques -> 6 booleens plats
  var s = canon.souligner || {};
  var it = canon.italique || {};
  r.soulignerPoste = !!s.poste;
  r.italiquePoste = !!it.poste;
  r.soulignerDates = !!s.dates;
  r.italiqueDates = !!it.dates;
  r.soulignerEntreprise = !!s.entreprise;
  r.italiqueEntreprise = !!it.entreprise;

  // --- Contenu
  r.lettreJointe = !!canon.lettreJointe;
  r.regroupementActif = !!canon.regroupement;

  // --- Densite (Aere / Normal / Compact -- lot moteur sous-lot 1). Lue par
  // composeurAppliquerReglagesProjetXXL -> theme.densiteEspacementUtilisateur
  // -> composeurComposer -> espacementExtra (Word ET PDF via composition).
  // 'normal' = defaut = neutre : on n'emet que quand ca change quelque chose.
  if (canon.densite === 'aere' || canon.densite === 'compact') {
    r.densite = canon.densite;
  }

  // --- Alignement du corps (lot moteur sous-lot 3). 'gauche' = defaut, non
  // emis ; 'justifie' -> theme.alignementCorps -> Word (composeurRender) +
  // PDF (cvPdfTemplateA4).
  if (canon.alignement === 'justifie') { r.alignement = 'justifie'; }

  // --- Veuves / orphelines (lot moteur sous-lot 6). true = defaut (auto),
  // non emis ; false explicite -> theme.veuvesUtilisateur = false ->
  // controleVeuvesOrphelines force a false.
  if (canon.veuves === false) { r.veuves = false; }

  // --- Interligne / Espacement des paragraphes / Marges de page (lot moteur
  // sous-lot 2). 'normal' / 'normales' = defaut neutre, non emis. Lus par
  // composeurAppliquerReglagesProjetXXL -> theme.interligneCorps /
  // .espacementParasMult / .margesTwips -> Word + PDF via composition.
  if (canon.interligne === 'serre' || canon.interligne === 'aere') { r.interligne = canon.interligne; }
  if (canon.espacementParas === 'serre' || canon.espacementParas === 'large') { r.espacementParas = canon.espacementParas; }
  if (canon.marges === 'etroites' || canon.marges === 'larges') { r.marges = canon.marges; }

  // --- Rubriques a afficher / masquer (lot moteur sous-lot 4). On n'emet que
  // les MASQUEES (cle: false) ; rien si tout est visible (defaut). Lu par
  // composeurAppliquerReglagesProjetXXL -> theme.rubriquesMasquees /
  // theme.permisMasque -> contenuRetenu vide (Word + PDF) + en-tete.
  if (canon.rubriques && typeof canon.rubriques === 'object') {
    var _masq = {};
    TRAD_RUBRIQUES_MASQUABLES.forEach(function (k) {
      if (canon.rubriques[k] === false) { _masq[k] = false; }
    });
    if (Object.keys(_masq).length) { r.rubriques = _masq; }
  }

  // --- Bloc mis en avant (Word uniquement, asymetrie assumee). canon ''
  // -> Word null.
  r.blocMisEnAvant = canon.blocMisEnAvant || null;
  r.blocMisEnAvantGauche = canon.blocMisEnAvantGauche || null;
  r.blocMisEnAvantDroite = canon.blocMisEnAvantDroite || null;

  // --- Allure (Sobre / Creatif). 'sobre' -> sobreActif ; 'creatif' est
  // porte par les recettes CREATIF_MODELES_XXL (creatifActif/creatifModele),
  // hors perimetre de ce traducteur -> on ne force que sobreActif.
  r.sobreActif = (canon.allure === 'sobre');

  // --- Couleur d'entreprise : bouton dedie. Le hex reel est lu au moment
  // de la resolution depuis dossier.rechercheCandidature.couleurEntreprise
  // -- ici on ne transmet QUE l'activation.
  r.couleurEntrepriseActive = !!canon.couleurEntrepriseActive;

  // --- NON EMIS ici (pas de consommateur Word aujourd'hui, a cabler quand
  // le moteur Word saura les faire) : interligne, espacementParas, marges,
  // alignement, densite, veuves, rubriques (afficher/masquer), ordreRubriques,
  // taille (Word = "via la mise en forme"). Le schema les marque, l'UII les
  // montre.
  return r;
}

/* ------------------------------------------------------------
   traduireVersEtatWord(canon)
   -> tout ce qu'il faut ecrire dans etatApercuInline.cv pour que le rendu
      Word soit celui decrit par `canon`, SANS toucher le pipeline.
   { couleur, reglagesProjetXXL, formatPage, modeleA5 }
   Cablage (sous-etape 4) :
     etatApercuInline.cv.couleur    = res.couleur
     Object.assign(etatApercuInline.cv.reglagesProjetXXL, res.reglagesProjetXXL)
     etatApercuInline.cv.formatPage = res.formatPage
     etatApercuInline.cv.modeleA5   = res.modeleA5 (si present)
   A PART (autres stores, pas ici) :
     etatApercuInline.cv.sansAccroche = canon.sansAccroche
     dossier.cvOptimiseActif          = (canon.formations === 'optimise')
   ------------------------------------------------------------ */
function traduireVersEtatWord(canon) {
  canon = canon || {};
  var fmt = TRAD_FORMAT_CANON_VERS_WORD[canon.format] || TRAD_FORMAT_CANON_VERS_WORD['a4-detaille'];
  var colonnes = (canon.colonnes === '1' || canon.colonnes === 1) ? 1 : 2;
  var out = {
    couleur: _tradIdCouleurProjetXXL(canon.accent, colonnes),
    reglagesProjetXXL: traduireVersReglagesProjetXXL(canon),
    formatPage: fmt.formatPage
  };
  if (fmt.modeleA5) { out.modeleA5 = fmt.modeleA5; }
  return out;
}

/* ============================================================
   SOUS-ETAPE 3 : traducteur -> PDF (meme approche "2-B, pipeline intact")
   ------------------------------------------------------------
   Le panneau PDF (cvPdfPanneauReglages.js) vit dans une iframe et lit ses
   reglages depuis ses PROPRES inputs DOM (`reg*`, cf. _PDF_ETAT_DEFAUT).
   traduireVersRegPdf(canon) rend un objet { <id reg*>: <valeur> } a poser
   sur ces inputs (booleen pour une case, chaine pour un select / un
   champ / une couleur). Le CABLAGE (poser sur l'iframe + rafraichir)
   vient a la sous-etape 4 -- ici on ne fabrique que l'objet.

   Le vocabulaire canonique a ete choisi (sous-etape 1) PROCHE de celui du
   PDF : la quasi-totalite des champs est une identite. Seules exceptions
   (verifiees dans le code du panneau le 2026-09-03) :
     - format         : 'a4-detaille' -> 'A4-detaille' (A4/A5 en capitales)
     - degradeColonnes / degradeBandeau : 'uni' -> 'aucun'
     - styleTitres    : 'sans-decor'  -> 'aucun'
     - styleCompetences : 'texte-seul' -> 'texte'
     - ordreExperiences : 'recentes'->'date-desc', 'anciennes'->'date-asc',
                          'poste-az'->'poste-asc'
     - nombres -> chaines (largeurs, echelles)
     - maps souligner/italique -> 6 cases plates regSoulignerX / regItaliqueX
     - allure 'sobre'/'creatif' -> regSobreActif / regCreatifActif
   NON emis (pas d'input `reg*` aujourd'hui, ou etat de l'iframe garde
   intact, cf. INVENTAIRE_ZERO_REGRESSION sect. 6) : interligne,
   espacementParas, marges, alignement, densite, veuves, rubriques,
   ordreRubriques, pages, couleurEntrepriseActive (bouton dedie, cable en
   sous-etape 4), et tous les reglages "par rubrique" / grand apercu.
   ============================================================ */

var TRAD_ORDRE_EXP_CANON_VERS_PDF = {
  pertinence: 'pertinence',
  recentes: 'date-desc',
  anciennes: 'date-asc',
  'poste-az': 'poste-asc'
};

function _tradFormatPdf(f) {
  // 'a4-detaille' -> 'A4-detaille' ; 'a5-portrait' -> 'A5-portrait'
  if (typeof f !== 'string' || f.length < 2) { return 'A4-detaille'; }
  return f.slice(0, 2).toUpperCase() + f.slice(2);
}
function _tradDegradePdf(d) {
  return (d === 'fonce-clair' || d === 'clair-fonce') ? d : 'aucun'; // 'uni' -> 'aucun'
}

function traduireVersRegPdf(canon) {
  canon = canon || {};
  var g = function (cle, defaut) { return (canon[cle] !== undefined) ? canon[cle] : defaut; };
  var s = canon.souligner || {};
  var it = canon.italique || {};

  var r = {
    // --- La page
    regFormatCV: _tradFormatPdf(g('format', 'a4-detaille')),
    regColonnes: String(g('colonnes', '2')),
    regColonnesInversees: !!canon.colonnesInversees,
    regSeparateurColonnes: !!canon.separateurColonnes,
    regFormeColonnes: g('formeColonnes', 'rectangle'),
    regLargeurColonneGauche: String(g('largeurColonneGauche', 35)),
    regEchelle: String(g('taille', 11)),
    regFondColonnesA5: g('fondColonnesA5', 'droite'),
    regEnteteInverseeA5: !!canon.enteteInverseeA5,
    regRemplirPageA5: !!canon.remplirPageA5,
    regEchelleA5: String(g('echelleA5', 11)),

    // --- Les couleurs (hex en minuscules, comme les <input type=color>)
    regCouleurDebut: String(g('accent', '#2f6690')).toLowerCase(),
    regCouleurFin: String(g('accentClair', '#d9e8f2')).toLowerCase(),
    regFondColonnes: g('fondColonnes', 'droite'),
    regFondColonnesEffet: g('fondColonnesEffet', 'fondSeul'),
    regFondColonnePleineHauteur: !!canon.fondColonnePleineHauteur,
    regDegradeColonnes: _tradDegradePdf(g('degradeColonnes', 'fonce-clair')),
    regTexteFondColonnes: g('texteFondColonnes', 'blanc'),
    regCouleurFondCompetences: String(g('couleurFondCompetences', '#e9e9e9')).toLowerCase(),
    regCouleurTextePuces: String(g('couleurTextePuces', '#1b1b1b')).toLowerCase(),

    // --- Le haut de la page
    regBandeauEnTete: !!g('bandeauEnTete', true),
    regFormeEnTete: g('formeEnTete', 'rectangle'),
    regDegradeBandeau: _tradDegradePdf(g('degradeBandeau', 'fonce-clair')),
    regBandeauDisponibilite: !!canon.bandeauDisponibilite,
    regDispositionEntete: g('dispositionEntete', '3colonnes'),
    regAnneauPhoto: !!canon.anneauPhoto,
    regPositionLibreEntete: !!g('positionLibreEntete', true),
    regLargeurAccrocheLibre: String(g('largeurAccrocheLibre', 30)),
    regLargeurMetierLibre: String(g('largeurMetierLibre', 32)),

    // --- Le texte
    regPolice: g('police', 'segoe'),
    regStyleTitres: (canon.styleTitres === 'sans-decor') ? 'aucun' : g('styleTitres', 'souligne'),
    regLectureGuidee: !!canon.lectureGuidee,
    regStyleCompetences: (canon.styleCompetences === 'texte-seul') ? 'texte' : g('styleCompetences', 'pastille'),
    regIcones: !!canon.icones,
    regIconesCoordonnees: !!canon.iconesCoordonnees,
    regStyleBordures: g('styleBordures', 'fine'),
    regStyleProfessionnel: g('styleProfessionnel', 'epure'),
    regStylePersonnel: g('stylePersonnel', 'epure'),
    regBandeauCompetencesCles: !!canon.bandeauCompetencesCles,
    regCoinsArrondis: !!canon.coinsArrondis,
    regSoulignerPoste: !!s.poste,
    regItaliquePoste: !!it.poste,
    regSoulignerDates: !!s.dates,
    regItaliqueDates: !!it.dates,
    regSoulignerEntreprise: !!s.entreprise,
    regItaliqueEntreprise: !!it.entreprise,

    // --- Ce qui s'affiche
    regOrdreExperiences: TRAD_ORDRE_EXP_CANON_VERS_PDF[g('ordreExperiences', 'pertinence')] || 'pertinence',
    regFormatExperiences: g('formatExperiences', 'standard'),
    regSansAccroche: !!canon.sansAccroche,
    regLettreJointe: !!canon.lettreJointe,
    regRegroupementActif: !!canon.regroupement,
    regFormationsMisesEnAvant: !!canon.formationsMisesEnAvant,

    // --- Allure (Sobre / Creatif : 2 cases exclusives cote PDF)
    regSobreActif: (canon.allure === 'sobre'),
    regCreatifActif: (canon.allure === 'creatif')
  };
  return r;
}

/* ============================================================
   SOUS-ETAPE 6a : TRADUCTEURS INVERSES (moteur -> modele canonique)
   ------------------------------------------------------------
   Servent au niveau "Je veux tout regler" (sections 6b..6f) a afficher
   l'ETAT REEL du moteur, et a resynchroniser dossier.reglagesMiseEnPageCV
   apres une action de l'ancien panneau ou du de. Ce sont les inverses de
   traduireVersReglagesProjetXXL / traduireVersRegPdf. Fonctions pures ;
   renvoient un PATCH canonique partiel (a fusionner via
   fusionnerReglagesMiseEnPage).
   ============================================================ */

var TRAD_POLICE_WORD_VERS_CANON = { Arial: 'arial', Calibri: 'calibri', Georgia: 'georgia', Garamond: 'garamond' };
var TRAD_ORDRE_EXP_PDF_VERS_CANON = { pertinence: 'pertinence', 'date-desc': 'recentes', 'date-asc': 'anciennes', 'poste-asc': 'poste-az', 'poste-desc': 'poste-az' };
var TRAD_FORMAT_WORD_VERS_CANON = { A4: 'a4-detaille', 'A4-essentiel': 'a4-essentiel', 'A4-integral': 'a4-integral' };

function _num(v, defaut) { var n = parseFloat(v); return isFinite(n) ? n : defaut; }
function _degradeVersCanon(d) { return (d === 'fonce-clair' || d === 'clair-fonce') ? d : 'uni'; }

/* ---- Word : (chaine `couleur` + reglagesProjetXXL + extra) -> canon ---- */
function lireDepuisReglagesProjetXXL(couleur, r, extra) {
  r = r || {};
  extra = extra || {};
  var p = {};

  // Accent + colonnes depuis la chaine codee "projetxxl-hex:XXXXXX[_Ncol]".
  // Pas de suffixe _Ncol = nombre de colonnes PAR DEFAUT (idComposeurComplet
  // l'omet dans ce cas).
  if (typeof couleur === 'string' && couleur) {
    var m = couleur.match(/_([12])col$/);
    p.colonnes = m ? m[1] : String(TRAD_PROJETXXL_COLONNES_DEFAUT);
    var mh = couleur.match(/hex:([0-9a-fA-F]{6})/);
    if (mh) { p.accent = '#' + mh[1].toLowerCase(); }
  }

  p.icones = !!r.iconesRubriques;
  p.iconesCoordonnees = !!r.iconesCoordonnees;

  if (r.titresPastille) {
    p.styleTitres = 'pastille';
    p.lectureGuidee = false;
  } else if (r.coloration === 'lectureGuidee' && r.lectureGuideeVariante === 'rectangle') {
    p.styleTitres = 'bandeau';
    p.lectureGuidee = false;
  } else if (r.coloration === 'lectureGuidee') {
    p.styleTitres = 'souligne';
    p.lectureGuidee = true;
  } else {
    p.styleTitres = 'souligne';
    p.lectureGuidee = false;
  }

  if (TRAD_POLICE_WORD_VERS_CANON[r.police]) { p.police = TRAD_POLICE_WORD_VERS_CANON[r.police]; }

  if (['aucun', 'gauche', 'droite', 'lesDeux'].indexOf(r.fondColonnes) !== -1) { p.fondColonnes = r.fondColonnes; }
  if (r.fondColonnesEffet === 'titres' || r.fondColonnesEffet === 'fondSeul') { p.fondColonnesEffet = r.fondColonnesEffet; }
  if (r.texteFondColonnes === 'noir' || r.texteFondColonnes === 'blanc') { p.texteFondColonnes = r.texteFondColonnes; }
  p.fondColonnePleineHauteur = !!r.fondColonneEtendueEntete;
  p.bandeauEnTete = !!r.fondTete;
  p.bandeauDisponibilite = !!r.bandeauDisponibilite;
  p.separateurColonnes = !!r.separateurColonnes;
  p.colonnesInversees = !!r.colonnesInversees;
  if (r.styleProfessionnel === 'condense' || r.styleProfessionnel === 'epure') { p.styleProfessionnel = r.styleProfessionnel; }
  if (r.stylePersonnel === 'condense' || r.stylePersonnel === 'epure') { p.stylePersonnel = r.stylePersonnel; }
  if (['aere', 'normal', 'compact'].indexOf(r.densite) !== -1) { p.densite = r.densite; }
  if (r.alignement === 'justifie' || r.alignement === 'gauche') { p.alignement = r.alignement; }
  p.veuves = (r.veuves !== false);
  if (['serre', 'normal', 'aere'].indexOf(r.interligne) !== -1) { p.interligne = r.interligne; }
  if (['serre', 'normal', 'large'].indexOf(r.espacementParas) !== -1) { p.espacementParas = r.espacementParas; }
  if (['etroites', 'normales', 'larges'].indexOf(r.marges) !== -1) { p.marges = r.marges; }
  // Rubriques a afficher / masquer (sous-lot 4) : reconstitue la map complete
  // (tout visible), puis applique les masquages emis a l'aller.
  p.rubriques = {};
  TRAD_RUBRIQUES_MASQUABLES.forEach(function (k) {
    p.rubriques[k] = !(r.rubriques && r.rubriques[k] === false);
  });
  p.ordreDatesPoste = (r.ordreDatesPoste === 'posteAvant') ? 'poste' : 'dates';
  p.accrocheItalique = (r.accrocheItalique !== false && r.accrocheItalique !== null && r.accrocheItalique !== undefined) ? !!r.accrocheItalique : false;
  p.souligner = { poste: !!r.soulignerPoste, dates: !!r.soulignerDates, entreprise: !!r.soulignerEntreprise };
  p.italique = { poste: !!r.italiquePoste, dates: !!r.italiqueDates, entreprise: !!r.italiqueEntreprise };
  p.lettreJointe = !!r.lettreJointe;
  p.regroupement = !!r.regroupementActif;
  p.blocMisEnAvant = r.blocMisEnAvant || '';
  p.blocMisEnAvantGauche = r.blocMisEnAvantGauche || '';
  p.blocMisEnAvantDroite = r.blocMisEnAvantDroite || '';
  p.couleurEntrepriseActive = !!r.couleurEntrepriseActive;

  // extra
  p.allure = extra.sobreActif ? 'sobre' : (extra.creatifActif ? 'creatif' : 'defaut');
  if (extra.cvOptimiseActif !== undefined) { p.formations = extra.cvOptimiseActif ? 'optimise' : 'complet'; }
  if (extra.sansAccroche !== undefined) { p.sansAccroche = !!extra.sansAccroche; }
  if (extra.formatPage) {
    if (extra.formatPage === 'A5') { p.format = (extra.modeleA5 === 'paysage') ? 'a5-paysage' : 'a5-portrait'; }
    else if (TRAD_FORMAT_WORD_VERS_CANON[extra.formatPage]) { p.format = TRAD_FORMAT_WORD_VERS_CANON[extra.formatPage]; }
  }
  return p;
}

/* ---- PDF : { regXxx: valeur } -> canon (inverse de traduireVersRegPdf) ---- */
function lireDepuisRegPdf(g) {
  g = g || {};
  function b(k) { return g[k] === true || g[k] === 'true'; }
  var p = {};

  if (typeof g.regFormatCV === 'string' && g.regFormatCV.length > 2) {
    p.format = g.regFormatCV.slice(0, 2).toLowerCase() + g.regFormatCV.slice(2);
  }
  if (g.regColonnes !== undefined) { p.colonnes = String(g.regColonnes); }
  p.colonnesInversees = b('regColonnesInversees');
  p.separateurColonnes = b('regSeparateurColonnes');
  if (g.regFormeColonnes) { p.formeColonnes = g.regFormeColonnes; }
  if (g.regLargeurColonneGauche !== undefined) { p.largeurColonneGauche = _num(g.regLargeurColonneGauche, 35); }
  if (g.regEchelle !== undefined) { p.taille = _num(g.regEchelle, 11); }
  if (g.regFondColonnesA5) { p.fondColonnesA5 = g.regFondColonnesA5; }
  p.enteteInverseeA5 = b('regEnteteInverseeA5');
  p.remplirPageA5 = b('regRemplirPageA5');
  if (g.regEchelleA5 !== undefined) { p.echelleA5 = _num(g.regEchelleA5, 11); }

  if (g.regCouleurDebut) { p.accent = String(g.regCouleurDebut).toLowerCase(); }
  if (g.regCouleurFin) { p.accentClair = String(g.regCouleurFin).toLowerCase(); }
  if (['aucun', 'gauche', 'droite', 'lesDeux'].indexOf(g.regFondColonnes) !== -1) { p.fondColonnes = g.regFondColonnes; }
  if (g.regFondColonnesEffet) { p.fondColonnesEffet = g.regFondColonnesEffet; }
  p.fondColonnePleineHauteur = b('regFondColonnePleineHauteur');
  if (g.regDegradeColonnes) { p.degradeColonnes = _degradeVersCanon(g.regDegradeColonnes); }
  if (g.regTexteFondColonnes) { p.texteFondColonnes = g.regTexteFondColonnes; }
  if (g.regCouleurFondCompetences) { p.couleurFondCompetences = String(g.regCouleurFondCompetences).toLowerCase(); }
  if (g.regCouleurTextePuces) { p.couleurTextePuces = String(g.regCouleurTextePuces).toLowerCase(); }

  p.bandeauEnTete = b('regBandeauEnTete');
  if (g.regFormeEnTete) { p.formeEnTete = g.regFormeEnTete; }
  if (g.regDegradeBandeau) { p.degradeBandeau = _degradeVersCanon(g.regDegradeBandeau); }
  p.bandeauDisponibilite = b('regBandeauDisponibilite');
  if (g.regDispositionEntete) { p.dispositionEntete = g.regDispositionEntete; }
  p.anneauPhoto = b('regAnneauPhoto');
  p.positionLibreEntete = b('regPositionLibreEntete');
  if (g.regLargeurAccrocheLibre !== undefined) { p.largeurAccrocheLibre = _num(g.regLargeurAccrocheLibre, 30); }
  if (g.regLargeurMetierLibre !== undefined) { p.largeurMetierLibre = _num(g.regLargeurMetierLibre, 32); }

  if (g.regPolice) { p.police = g.regPolice; }
  p.styleTitres = (g.regStyleTitres === 'aucun') ? 'sans-decor' : (g.regStyleTitres || 'souligne');
  p.lectureGuidee = b('regLectureGuidee');
  p.styleCompetences = (g.regStyleCompetences === 'texte') ? 'texte-seul' : (g.regStyleCompetences || 'pastille');
  p.icones = b('regIcones');
  p.iconesCoordonnees = b('regIconesCoordonnees');
  if (g.regStyleBordures) { p.styleBordures = g.regStyleBordures; }
  if (g.regStyleProfessionnel) { p.styleProfessionnel = g.regStyleProfessionnel; }
  if (g.regStylePersonnel) { p.stylePersonnel = g.regStylePersonnel; }
  p.bandeauCompetencesCles = b('regBandeauCompetencesCles');
  p.coinsArrondis = b('regCoinsArrondis');
  p.souligner = { poste: b('regSoulignerPoste'), dates: b('regSoulignerDates'), entreprise: b('regSoulignerEntreprise') };
  p.italique = { poste: b('regItaliquePoste'), dates: b('regItaliqueDates'), entreprise: b('regItaliqueEntreprise') };

  if (g.regOrdreExperiences && TRAD_ORDRE_EXP_PDF_VERS_CANON[g.regOrdreExperiences]) { p.ordreExperiences = TRAD_ORDRE_EXP_PDF_VERS_CANON[g.regOrdreExperiences]; }
  if (g.regFormatExperiences) { p.formatExperiences = g.regFormatExperiences; }
  p.sansAccroche = b('regSansAccroche');
  p.lettreJointe = b('regLettreJointe');
  p.regroupement = b('regRegroupementActif');
  p.formationsMisesEnAvant = b('regFormationsMisesEnAvant');
  p.allure = b('regSobreActif') ? 'sobre' : (b('regCreatifActif') ? 'creatif' : 'defaut');
  return p;
}

/* ------------------------------------------------------------ */
if (typeof window !== 'undefined') {
  window.traduireVersReglagesProjetXXL = traduireVersReglagesProjetXXL;
  window.traduireVersEtatWord = traduireVersEtatWord;
  window.traduireVersRegPdf = traduireVersRegPdf;
  window.lireDepuisReglagesProjetXXL = lireDepuisReglagesProjetXXL;
  window.lireDepuisRegPdf = lireDepuisRegPdf;
  window.TRAD_PROJETXXL_COLONNES_DEFAUT = TRAD_PROJETXXL_COLONNES_DEFAUT;
  window.TRAD_RUBRIQUES_MASQUABLES = TRAD_RUBRIQUES_MASQUABLES;
}
if (typeof module !== 'undefined') {
  module.exports = {
    traduireVersReglagesProjetXXL: traduireVersReglagesProjetXXL,
    traduireVersEtatWord: traduireVersEtatWord,
    traduireVersRegPdf: traduireVersRegPdf,
    lireDepuisReglagesProjetXXL: lireDepuisReglagesProjetXXL,
    lireDepuisRegPdf: lireDepuisRegPdf,
    TRAD_PROJETXXL_COLONNES_DEFAUT: TRAD_PROJETXXL_COLONNES_DEFAUT,
    TRAD_RUBRIQUES_MASQUABLES: TRAD_RUBRIQUES_MASQUABLES,
    TRAD_POLICE_CANON_VERS_WORD: TRAD_POLICE_CANON_VERS_WORD,
    TRAD_FORMAT_CANON_VERS_WORD: TRAD_FORMAT_CANON_VERS_WORD,
    TRAD_ORDRE_EXP_CANON_VERS_PDF: TRAD_ORDRE_EXP_CANON_VERS_PDF,
    TRAD_POLICE_WORD_VERS_CANON: TRAD_POLICE_WORD_VERS_CANON,
    TRAD_ORDRE_EXP_PDF_VERS_CANON: TRAD_ORDRE_EXP_PDF_VERS_CANON
  };
}
