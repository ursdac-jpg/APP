// ============================================================
// Rendu « page de la maquette » du CV en PDF (A4)
//
// TACHE (Denis, 2026-09-25, tranche 2 « la feuille et les modeles » de la
// refonte de « La mise en page » du CV en PDF, plan
// docs/PLAN_TRANCHE2_FEUILLE_ET_MODELES_2026-09-25.md) : la maquette
// docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html est la SOURCE DE VERITE.
// Cette fonction reprend, sur les VRAIES donnees, le composer() de la
// maquette (une page, 1 colonne par defaut, bandeau de competences sur 2
// colonnes, experiences en pleine largeur, dates a droite, formations,
// puis Logiciels / Centres d'interet sur 2 colonnes) et le CSS de sa
// feuille (.cv ...), pour les 3 allures et leurs modeles :
//   gabarit ''              Standard (page blanche neutre)
//   'sobre-bandeau'         Sobre, bandeau pale
//   'sobre-fond'            Sobre, fond pale
//   'sobre-epure'           Sobre, epure
//   'bandeau'               Creatif, bandeau entier
//   'diagonale'             Creatif, bandeau diagonal
//   'colonne'               Creatif, colonne coloree (2 colonnes)
//   'cadre'                 Creatif, cadre de page
//   'picto'                 Creatif, titres a pictogrammes
// (« Colonne et frise » a sa propre fonction : _pdfConstruireFrise,
// cvPdfTemplateA4.js.)
//
// Meme patron que _pdfConstruireFrise : appelee EN TOUT PREMIER par
// _pdfConstruireStyleEtPage(), jamais tissee dans son corps. Reutilise les
// aides de cvPdfTemplateA4.js (chargé avant ce fichier) et la preparation
// des experiences partagee avec l'ancien rendu (_pdfPreparerContenuExperiences).
//
// Reglages lus dans `opts` (tous optionnels, valeurs par defaut = celles de
// la maquette) : colonnes (1|2), blocsCourts ('cote'|'dessous'),
// competencesEnHaut (null/undefined = oui), formationsAvantExp,
// organisationPerso + ordrePersoRubriques, titresAgrandis, iconesRubriques,
// iconesCoordonnees, petitsCarresCoordonnees, styleCompetences,
// fondColonnes, separateurColonnes, positionDates, afficherLieu, styleLieu,
// styleProfessionnel, soulignerX/italiqueX, afficherMissionsFormation,
// espacementFormations, styleTitreFormation, competences*Max, sansAccroche,
// couleurDebut, degradeColonnes, police, echelleContenu, tailleTitres,
// margePage. Ces noms sont deja produits par _pdfLireOptions
// (cvPdfPanneauReglages.js) ou seront branches par les cartes de la
// tranche 3 sans rien changer ici.
// ============================================================

// Intitules choisis par la personne (retour Denis 2026-10-03) : { 'Nom d'origine': 'Son intitule' }. La CLE d'une rubrique reste TOUJOURS son nom d'origine
// (data-rub, reglages par rubrique, retraits, deplacements, ordre) ; seul le TEXTE AFFICHE change, ici et nulle part ailleurs. Lu dans opts.intitulesPerso.
var _pdfIntitulesPerso = {};
// Texte AFFICHÉ par défaut quand il diffère de la clé (décision de Denis 2026-10-03 : « Expériences professionnelles » au pluriel). La clé reste inchangée.
var _PDF_LIBELLES_DEFAUT = { 'Expérience professionnelle': 'Expériences professionnelles' };
function _pdfLibelle(origine) {
  var v = _pdfIntitulesPerso && _pdfIntitulesPerso[origine];
  v = (typeof v === 'string') ? v.replace(/\s+/g, ' ').trim() : '';
  return v ? v.slice(0, 40) : (_PDF_LIBELLES_DEFAUT[origine] || origine);
}
// Stage (décision de Denis 2026-10-03) : une expérience est un stage quand la personne l'a coché (dossier.experiences[i].stage = true / false), sinon quand son poste le dit
// déjà (« Stage ... », « Stagiaire ... » : reconnu dans le CV d'origine). Le CV écrit alors « (stage) » après le poste, sauf si le poste le dit déjà.
function _pdfCleExperienceStage(e) { return String((e && e.poste) || '').trim().toLowerCase() + '|' + String((e && e.entreprise) || '').trim().toLowerCase() + '|' + String((e && e.dateDebut) || ''); }
function _pdfEstStage(e) {
  var ds = (typeof dossier !== 'undefined' && dossier && dossier.experiences) || [];
  for (var k = 0; k < ds.length; k++) {
    if (ds[k] && _pdfCleExperienceStage(ds[k]) === _pdfCleExperienceStage(e)) { if (typeof ds[k].stage === 'boolean') { return ds[k].stage; } break; }
  }
  return /\bstag(e|es|iaire|iaires)\b/i.test(String((e && e.poste) || ''));
}
function _pdfPosteAvecStage(e) {
  var p = (e && e.poste) || '';
  return (_pdfEstStage(e) && !/\bstag/i.test(p)) ? (p + ' (stage)') : p;
}
function _pdfMqTitreH2(texte, cle, icone) {
  return '<h2 data-rub="' + _pdfEscaperHtml(cle || texte) + '">' + (icone ? '<span class="icone-titre">' + _pdfIconeSvg(icone) + '</span>' : '') + '<span>' + _pdfEscaperHtml(_pdfLibelle(texte)) + '</span></h2>';
}
// Intitules des rubriques : UNE SEULE source, lue par tous les rendus (2026-09-26, point 17 de Denis : les noms des rubriques ne changent
// jamais d'un modele a l'autre). Ne jamais ecrire un intitule de rubrique en dur dans un rendu : le lire ici.
var _PDF_INTITULES = {
  competencesPro: 'Compétences professionnelles',
  competencesComp: 'Compétences comportementales',
  // TACHE (retour Denis 2026-09-27) : n'existe QUE dans les CV en mode "Mixte" (jamais en "Par competences" ni "Chronologique") --
  // n'enfreint pas la regle "un nom de rubrique ne change jamais selon le mode" (point 17 ci-dessus) : ce n'est pas la MEME
  // rubrique qui changerait de nom, c'est une rubrique DISTINCTE qui n'existe que dans ce mode precis, comme "Formations" n'existe
  // que si la personne a des formations.
  competencesEnAction: 'Compétences en action',
  competences: 'Compétences',
  savoirs: 'Savoirs',
  experience: 'Expérience professionnelle',
  experiencePerso: 'Expérience personnelle',
  formations: 'Formations',
  logiciels: 'Logiciels et outils',
  langues: 'Langues',
  certifications: 'Certifications',
  loisirs: 'Centres d’intérêt',
  infos: 'Informations complémentaires'
};

// Icone de chaque rubrique (titres « pastille » : pictogramme dans un rond de couleur). Memes pictogrammes que l'ancien rendu.

// ---------- Disposition PERSONNALISEE en 2 colonnes (lot 5, 2026-09-26) ----------
// Chaque colonne est une liste de LIGNES de 1 ou 2 blocs : { gauche: [['pro'], ['comp'], ['langues', 'centres']], droite: [['exp'], ['form']] }.
// Regles : « exp » (experience professionnelle) reste TOUJOURS a droite et seule sur sa ligne ; deux blocs cote a cote seulement dans la
// colonne LARGE (la colonne de gauche est etroite : deux blocs y seraient illisibles).
// TACHE (retour Denis 2026-09-28, point 14) : "langues"/"centres" retires -- ne sont plus
// personnalisables (toujours en pleine largeur en bas de page, voir langCentresBasDePage
// plus bas) ; une disposition sauvegardee avant ce correctif qui les citait encore les ignore
// desormais silencieusement ici (filtre de _pdfNormaliserDispositionColonnes).
// TACHE (retour Denis 2026-09-28, chantier "Formations regroupent tout") : "certifs" retire --
// les certifications sont fusionnees dans "form" desormais (_pdfFormationsEtCertifications,
// cvPdfTemplateA4.js), contenu.certifications toujours vide, plus rien a positionner ici.
// Denis, 2026-09-29 : « Langues » et « Centres d'intérêt » sont de nouveau des blocs personnalisables (par défaut dans la colonne de gauche).
// Denis, 2026-10-01 : « certifs » (rubrique Certifications) se place comme Langues : colonne de gauche par defaut, deplacable, empilable.
var _PDF_BLOCS_COLONNES = ['pro', 'comp', 'logi', 'langues', 'certifs', 'centres', 'infos', 'perso', 'exp', 'form'];
// TACHE (P10-bis, retour Denis 2026-09-28, maquette docs/MAQUETTE_RUBRIQUES_DEBORDANTES_2026-09-28.html,
// "Proposition B" validee) : rubriques qui ont le droit de partir en pleine largeur sous les 2 colonnes
// quand elles debordent (mesure reelle cote iframe, voir _pdfEquilibrerColonnes, cvPdfPanneauReglages.js).
// Jamais "exp" (Expérience professionnelle, reste toujours a droite, regle deja actee) ni les blocs de
// competences (pro/comp, deja regles a part par P10). "centres" n'y figure plus (retour Denis
// 2026-09-28, point 14) : Langues + Centres d'interet sont desormais TOUJOURS en pleine largeur en
// bas de page, ensemble, peu importe le debordement -- jamais une rubrique de plus a equilibrer ici.
// "certifs" retire (voir _PDF_BLOCS_COLONNES juste au-dessus).
var _PDF_RUBRIQUES_PLEINE_LARGEUR = ['perso', 'form'];
// Disposition de depart = celle que le rendu produit sans personnalisation (rien ne bouge quand la personne clique sur Personnaliser).
function _pdfDispositionDepartColonnes(compHaut, formGauche, formAvant) {
  var g = [], d = [];
  if (compHaut) { g.push('pro', 'comp'); }
  if (formGauche) { g.push('form'); }
  // TACHE (retour Denis 2026-09-28, point 14) : "langues"/"centres" retires -- toujours rendus a
  // part, en pleine largeur en bas de page (voir langCentresBasDePage), jamais personnalisables ici.
  // Denis, 2026-09-29 : l'expérience personnelle est dans la colonne de DROITE, juste après les formations (Langues et Centres d'intérêt
  // sont dans la colonne de gauche, ajoutés après les blocs personnalisables : voir _pdfConstruireMaquette).
  g.push('logi', 'langues', 'certifs', 'centres', 'infos');
  if (!compHaut) { g.push('pro', 'comp'); }
  if (formAvant && !formGauche) { d.push('form'); }
  d.push('exp');
  if (!formGauche && !formAvant) { d.push('form'); }
  d.push('perso');
  var lignes = function (l) { return l.map(function (k) { return [k]; }); };
  return { gauche: lignes(g), droite: lignes(d) };
}
function _pdfColonneLarge(largeurGauche) { return (Number(largeurGauche) >= 50) ? 'gauche' : 'droite'; }
// Rend la disposition saisie sure : blocs connus, chacun une seule fois, « exp » a droite et seul, paires seulement dans la colonne large.
function _pdfNormaliserDispositionColonnes(dispo, depart, largeurGauche) {
  var large = _pdfColonneLarge(largeurGauche);
  var vus = {};
  var propre = { gauche: [], droite: [] };
  ['gauche', 'droite'].forEach(function (col) {
    ((dispo && dispo[col]) || []).forEach(function (ligne) {
      var ks = (ligne || []).filter(function (k) { return _PDF_BLOCS_COLONNES.indexOf(k) !== -1 && !vus[k] && !(k === 'exp' && col !== 'droite'); });
      ks.forEach(function (k) { vus[k] = true; });
      if (!ks.length) { return; }
      if (ks.indexOf('exp') !== -1 || col !== large) { ks.forEach(function (k) { propre[col].push([k]); }); }
      else if (ks.length > 2) { propre[col].push(ks.slice(0, 2)); ks.slice(2).forEach(function (k) { propre[col].push([k]); }); }
      else { propre[col].push(ks); }
    });
  });
  ['gauche', 'droite'].forEach(function (col) {
    depart[col].forEach(function (ligne) { ligne.forEach(function (k) { if (!vus[k]) { vus[k] = true; propre[col].push([k]); } }); });
  });
  return propre;
}

var _PDF_MQ_ICONES_RUBRIQUES = {};
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.competencesPro] = 'competences';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.competencesComp] = 'competencesComportementales';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.experience] = 'experience';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.competencesEnAction] = 'competences';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.formations] = 'formations';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.logiciels] = 'competences';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.langues] = 'langues';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.certifications] = 'certifications';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.loisirs] = 'loisirs';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.experiencePerso] = 'engagements';
_PDF_MQ_ICONES_RUBRIQUES[_PDF_INTITULES.infos] = 'infos';

// Experience personnelle CITEE (liste d'intitules) : { titre, details } ; details = periode et lieu quand ils sont connus (retour Denis 2026-10-01 : « si on a les
// infos, il faut les afficher »). Une date de fin vide veut dire « en cours » (meme regle que partout) ; une annee seule a recu la meme annee a l'import.
function _pdfPersoCiteeLigne(item) {
  if (typeof item === 'string') { return { titre: item, details: '' }; }
  var titre = (item && (item.intitule || item.texte)) || '';
  var periode = (item && item.dateDebut) ? _pdfFormaterPeriode(item.dateDebut, item.dateFin, 'perso', true) : '';
  return { titre: titre, details: [periode, (item && item.entreprise) || '', (item && item.lieu) || ''].filter(Boolean).join(', ') };
}
// Lot N1 (2026-10-04) : structure et lieu d'une experience personnelle, une ligne sous le titre quand elles sont renseignees (jamais inventees).
function _pdfPersoEndroitHtml(item) {
  var e = (typeof item === 'string') ? '' : [item && item.entreprise, item && item.lieu].filter(Boolean).join(', ');
  return e ? '<div class="meta">' + _pdfEscaperHtml(e) + '</div>' : '';
}

function _pdfMqCoordonnees(objetCV, composition, opts, ed) {
  var identite = objetCV.identite || {};
  var permis = objetCV.permis || {};
  var villeCodePostal = [_pdfFormaterVille(identite.ville), identite.codePostal].filter(Boolean).join(', ');
  var permisTexte = (permis.possede && !(composition && composition.permisMasque))
    ? ('Permis ' + ((permis.categories || []).join(', ') || 'B') + (permis.vehicule ? ' (véhiculé)' : ''))
    : '';
  var iconesCoord = !!opts.iconesCoordonnees;
  var gras = opts.coordGras || {};   // « Telephone en gras », « E-mail en gras » (carte « En-tete de CV », retour Denis 2026-10-01)
  return [
    { texte: identite.telephone, icone: 'telephone' },
    { texte: identite.email, icone: 'email' },
    { texte: villeCodePostal, icone: 'localisation' },
    { texte: permisTexte, icone: 'permis' },
    { texte: (identite.lien && opts.afficherLien !== false) ? String(identite.lien).replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '') : '', icone: 'lien' }
  ].filter(function (l) { return l.texte; }).map(function (l) {
    var texteCoord = ed ? ed('co:' + l.icone, l.texte) : _pdfEscaperHtml(l.texte);
    if ((l.icone === 'telephone' && gras.telephone) || (l.icone === 'email' && gras.email)) { texteCoord = '<b>' + texteCoord + '</b>'; }
    return '<div>' + (iconesCoord ? _pdfIconeSvg(l.icone) : '') + texteCoord + '</div>';
  }).join('');
}

function _pdfConstruireMaquette(objetCV, composition, opts, gabarit) {
  _pdfMoisAffiches = !!opts.moisAffiches;
  _pdfDatesParRub = (opts && opts.datesParRubrique) || {};
  gabarit = gabarit || '';
  opts = opts || {};
  _pdfIntitulesPerso = (opts.intitulesPerso && typeof opts.intitulesPerso === 'object') ? opts.intitulesPerso : {};
  var identite = objetCV.identite || {};
  var contenu = _pdfPreparerContenuExperiences((composition && composition.contenuRetenu) || {}, objetCV, opts);
  // TACHE (chantier "Experience personnelle", 2026-09-27) : meme principe que
  // la ligne juste au-dessus, pour experiencesPersonnelles/engagements.
  contenu = _pdfPreparerContenuExperiencePerso(contenu, objetCV, opts);
  // TACHE (chantier "Formations", 2026-09-28) : meme principe, pour formations.
  contenu = _pdfPreparerContenuFormations(contenu, objetCV, opts);
  // Certifications structurees (2026-09-26) : « Intitule (organisme, lieu, date) » devient une ligne comme celles des formations, date en
  // tete pour les modeles a date en tete. Sans information captee, seul l'intitule est affiche ; rien n'est invente.
  if ((contenu.certifications || []).length && typeof afficherCertification === 'function') {
    var certifsDateEnTete = ['rectangles', 'sobre-rectangles', 'frise', 'photo', 'sobre-photo'].indexOf(gabarit) !== -1;
    var contenuAvecCertifs = {};
    Object.keys(contenu).forEach(function (cle) { contenuAvecCertifs[cle] = contenu[cle]; });
    contenuAvecCertifs.certificationsBrutes = contenu.certifications.slice();
    contenuAvecCertifs.certifications = contenu.certifications.map(function (c) { return afficherCertification(c, certifsDateEnTete); });
    contenu = contenuAvecCertifs;
  }
  // TACHE (J4, 2026-09-28, apercu plein ecran "Retirer une rubrique ou une mission") : une rubrique
  // entiere retiree a la main devient juste une liste vide ICI, avant la repartition par modele --
  // chaque modele de la galerie sait deja ne rien afficher pour une rubrique vide (meme mecanisme
  // que les rubriques masquees par l'assistant), un seul point de filtre pour tous les modeles.
  // Limite volontaire (voir docs) : couvre les rubriques a liste simple (Experience/Formation/
  // Certifications/Langues/Logiciels/Loisirs/Experience perso) -- pas les competences pro/
  // comportementales (deja retirables une par une, forme de donnees differente).
  var rubriquesRetireesMain = opts.rubriquesRetirees || [];
  if (rubriquesRetireesMain.length) {
    var _PDF_RUBRIQUE_VERS_CONTENU = {};
    _PDF_RUBRIQUE_VERS_CONTENU[_PDF_INTITULES.experience] = ['experiences'];
    _PDF_RUBRIQUE_VERS_CONTENU[_PDF_INTITULES.experiencePerso] = ['experiencesPersonnelles', 'engagements'];
    _PDF_RUBRIQUE_VERS_CONTENU[_PDF_INTITULES.formations] = ['formations'];
    _PDF_RUBRIQUE_VERS_CONTENU[_PDF_INTITULES.logiciels] = ['logiciels'];
    _PDF_RUBRIQUE_VERS_CONTENU[_PDF_INTITULES.langues] = ['langues'];
    _PDF_RUBRIQUE_VERS_CONTENU[_PDF_INTITULES.certifications] = ['certifications'];
    _PDF_RUBRIQUE_VERS_CONTENU[_PDF_INTITULES.loisirs] = ['loisirs'];
    var contenuSansRubriques = {};
    Object.keys(contenu).forEach(function (cle) { contenuSansRubriques[cle] = contenu[cle]; });
    rubriquesRetireesMain.forEach(function (rub) {
      (_PDF_RUBRIQUE_VERS_CONTENU[rub] || []).forEach(function (cle) { contenuSansRubriques[cle] = []; });
    });
    contenu = contenuSansRubriques;
  }
  var esp = (composition && composition.espacementExtra) || 1;
  var espItems = esp;   // (l'espacement des paragraphes du reglage supplementaire s'y ajoute plus bas)

  // ---------- reglages (valeurs par defaut = maquette) ----------
  var allure = /^sobre-/.test(gabarit) ? 'sobre' : (gabarit ? 'creatif' : 'standard');
  var deux = (gabarit === 'colonne') ? true : (Number(opts.colonnes) === 2);
  var cote = opts.blocsCourts === 'dessous' ? 'dessous' : 'cote';
  var compHaut = !(opts.competencesEnHaut === false);
  var formAvant = !!opts.formationsAvantExp;
  // Retour Denis 2026-10-02 : « Standard » ne change plus la disposition affichée. Dès qu'une disposition a été choisie (Personnaliser, ou geste à la souris),
  // elle reste appliquée au retour sur « Standard », qui masque seulement les réglages manuels ; « Disposition automatique » la supprime.
  var perso = !!opts.ordrePersoRubriques;
  var pill = opts.styleCompetences === 'rectangle' ? 'rect' : (opts.styleCompetences === 'texte' ? 'texte' : 'pastille');
  // Modeles de la maquette (Créatif) : petits carres devant les titres ; modeles de l'application : ils suivent leur propre reglage « icones ».
  var modeleApplication = !!(opts.creatifVariante && !/^mq/.test(opts.creatifVariante) && opts.creatifVariante !== 'frise');
  var icones = (opts.iconesRubriques === undefined || opts.iconesRubriques === null) ? (allure === 'creatif' && !modeleApplication) : !!opts.iconesRubriques;
  var iconesCoord = !!opts.iconesCoordonnees;
  var petitsCarres = opts.petitsCarresCoordonnees !== false;
  var degr = (opts.degradeColonnes !== 'aucun') && allure !== 'sobre';
  var fond = opts.fondColonnes || 'aucun';
  // TACHE (Denis, 2026-09-25, « les Reglages supplementaires agissent aussi sur les modeles de la maquette ») :
  // marges (etroites / normales / larges : composition.margesTwips, 560 = 10 mm), espacement des paragraphes
  // (composition.espacementParasMult), largeur de la colonne de gauche, colonnes inversees, forme des colonnes,
  // effet du fond (fond seul / titres seuls), texte noir ou blanc sur fond colore, degrades, bandeau d'en-tete,
  // disposition de l'en-tete, coordonnees a part, anneau de la photo, style des titres, lecture guidee,
  // bordures, coins arrondis, bandeau « Competences cles ».
  var marge = (typeof opts.margePage === 'number') ? opts.margePage
    : ((composition && composition.margesTwips) ? Math.max(6, Math.min(16, Math.round(composition.margesTwips / 56))) : 10);
  var multParas = (composition && composition.espacementParasMult) || 1;
  var largeurGauche = (opts.largeurColonneGauche === undefined || opts.largeurColonneGauche === null || Number(opts.largeurColonneGauche) === 35) ? 36 : Number(opts.largeurColonneGauche);
  var inversees = !!opts.colonnesInversees;
  var colonnesDiagonales = opts.formeColonnes === 'diagonale';
  var effetTitres = opts.fondColonnesEffet === 'titres';
  var texteSurFond = opts.texteFondColonnes === 'noir' ? '#1b1b1b' : '#ffffff';
  var degradeInverse = opts.degradeColonnes === 'clair-fonce';
  var degradeBandeau = opts.degradeBandeau || 'fonce-clair';
  var bandeauCouleur = !!opts.bandeauEnTete;
  var entete2Colonnes = false;   // (la disposition de l'en-tete est un reglage du plein ecran, en-tete libre : « Disposition de depart »)
  var coordonneesAPart = !!opts.bandeauDisponibilite;
  var anneauPhoto = !!opts.anneauPhoto;
  var styleTitres = opts.styleTitres || 'souligne';
  var lectureGuidee = !!opts.lectureGuidee;
  var bordureEpaisse = opts.styleBordures === 'epaisse';
  var coinsArrondis = !!opts.coinsArrondis;
  // Options de style des modeles de l'application, rendues ici sur la page de la maquette (lot 1) : titres en pastille
  // (pictogramme dans un rond), experiences en « pilule », filet en haut de page, cadre de page, en-tete centre.
  var titresPastille = opts.styleTitres === 'pastille';
  var pilluleExp = !!opts.pilluleExperiences && opts.formatExperiences === 'ameliore';
  var filetHaut = !!opts.filetHaut;
  var cadrePage = !!opts.cadrePage;
  var enteteCentree = !!opts.enteteCentree;
  // Lot 3 : en-tete a bord ondule (Vague marine), colonne coloree pleine hauteur a bord ondule (Colonne a vague),
  // bande verticale du nom (Bandeau vertical).
  var enteteVague = !!opts.enteteVague;
  var nomVert = !!opts.nomVertical;
  var colVague = !!opts.colonneVague && deux && (fond === 'gauche' || fond === 'droite');
  var colVagueDroite = colVague && (fond === 'gauche' ? inversees : !inversees);
  var colVagueMm = 0;
  if (colVague) {
    var largInterieure = 210 - 2 * marge, partGauche = largeurGauche / 100;
    colVagueMm = Math.round((marge + ((fond === 'gauche') ? partGauche * largInterieure : largInterieure * (1 - partGauche) - 4.2) + 4) * 10) / 10;
  }
  var r2 = function (v) { return Math.round(v * 100) / 100; };
  var polyHaut = '', polyColG = '', polyColD = '';
  if (enteteVague) {
    var pv = ['0 0', '100% 0'];
    for (var iv = 36; iv >= 0; iv--) { pv.push(r2(iv / 36 * 100) + '% ' + r2(90 + 10 * Math.sin(iv / 36 * Math.PI * 6)) + '%'); }
    polyHaut = 'polygon(' + pv.join(', ') + ')';
  }
  if (colVague) {
    var pg = ['0 0'], pd = ['100% 0'];
    for (var ic = 0; ic <= 60; ic++) {
      var dx = r2(1.5 - 1.5 * Math.sin(ic / 60 * Math.PI * 6));
      pg.push('calc(100% - ' + dx + 'mm) ' + r2(ic / 60 * 100) + '%');
      pd.push(dx + 'mm ' + r2(ic / 60 * 100) + '%');
    }
    pg.push('0 100%'); pd.push('100% 100%');
    polyColG = 'polygon(' + pg.join(', ') + ')'; polyColD = 'polygon(' + pd.join(', ') + ')';
  }
  var competencesEncadrees = !!opts.blocsCompetencesEncadres;
  function encadre(html) { return (competencesEncadrees && html) ? '<div class="bloc-encadre">' + html + '</div>' : html; }
  function titreH2(texte, cle) { return _pdfMqTitreH2(texte, cle, titresPastille ? (_PDF_MQ_ICONES_RUBRIQUES[texte] || '') : ''); }
  var competencesCles = (opts.competencesCles || []).map(function (c) { return (typeof c === 'string') ? c : ((c && c.competence) || ''); }).filter(Boolean);
  var bandeauCles = !!opts.bandeauCompetencesCles && competencesCles.length > 0;
  // TACHE (Denis, 2026-09-25, tranche 4 « plein ecran de la maquette ») : competences retirees, reglages d'une
  // rubrique, en-tete libre, textes corriges. Voir cvPdfPleinEcranMaquette.js (cote parent) et _pdfMq* (panneau).
  var retirees = opts.competencesRetirees || [];
  var stylesRub = opts.reglagesRubriques || {};
  var ent = opts.enteteLibre || {};
  var enteteLibre = !!(ent.libre || ent.modif);
  var textesEdites = opts.textesEdites || {};
  var pleineHauteur = !!opts.fondColonnePleineHauteur;
  var eviterTitreSeul = !(composition && composition.controleVeuvesOrphelines === false);
  var experiencesAmeliorees = opts.formatExperiences === 'ameliore';
  var fondPuces = opts.couleurFondCompetences && opts.couleurFondCompetences !== '#e9e9e9' ? opts.couleurFondCompetences : '';
  var textePuces = opts.couleurTextePuces && opts.couleurTextePuces !== '#1b1b1b' ? opts.couleurTextePuces : '';
  var couleur = opts.couleurDebut || '#2f6690';
  var couleurFinModele = (opts.creatifVariante && !/^mq/.test(opts.creatifVariante) && opts.creatifVariante !== 'frise' && /^#[0-9a-fA-F]{6}$/.test(opts.couleurFin || '')) ? opts.couleurFin : '';
  var police = _PDF_POLICES[opts.police] || _PDF_POLICES.arial || _PDF_POLICES.segoe;
  var echelleAuto = (composition && composition.taillePoliceCorps) ? (composition.taillePoliceCorps / 11) : 1;
  var tailleTexte = 12.5 * (opts.echelleContenu || 1) * echelleAuto;
  // Echelle automatique du moteur, exposee pour que le curseur de taille du panneau affiche la taille REELLE du texte.
  if (typeof window !== 'undefined') { window._pdfMqEchelleAuto = echelleAuto; }
  // L'en-tete (nom, metier, coordonnees, accroche) suit la taille du texte choisie par la personne, dans la meme proportion, sauf
  // si elle demande de le garder a taille fixe (opts.enteteTailleFixe).
  var kh = opts.enteteTailleFixe ? 1 : (opts.echelleContenu || 1);
  var tailleTitres = (typeof opts.tailleTitres === 'number') ? opts.tailleTitres : 13;
  var interligne = 1.38 * ((composition && composition.interligneCorps) || 1);
  var serre = esp < 0.95;
  var justifie = !!(composition && composition.alignementCorps === 'justifie');
  var lieuStyle = opts.styleLieu || 'italique';
  var afficherLieu = opts.afficherLieu !== false;
  // Position des dates des experiences : le choix de la personne, sinon le placement d'origine du modele (colonne de dates : « avant » ;
  // frise de la maquette : « sous »). Meme regle pour tous les modeles (decision de Denis, 2026-09-26).
  var positionDates = opts.positionDatesChoisie ? (opts.positionDates || 'droite')
    : ((gabarit === 'photo' || gabarit === 'sobre-photo' || gabarit === 'rectangles' || gabarit === 'sobre-rectangles') ? 'avant' : (gabarit === 'frise' ? 'sous' : 'droite'));
  // Retour Denis 2026-09-30 : position des dates des formations et de l'experience personnelle (par defaut, celle des experiences).
  // Par defaut (case « dates a la meme place dans toutes les rubriques » cochee), les formations et l'experience personnelle prennent la position EFFECTIVE
  // des experiences, y compris celle d'origine du modele (retour Denis 2026-09-30 : les dates des formations n'etaient pas du tout placees comme
  // celles des experiences tant que la personne n'avait rien choisi). Decochee sans position propre : placement d'origine du modele.
  // « Juste apres le titre » (reglage Dates) n'existe pas dans les modeles a disposition propre (photo, rectangles, frise) : ils gardent leur placement.
  var gabaritDatesPropre = ['photo', 'sobre-photo', 'rectangles', 'sobre-rectangles', 'frise'].indexOf(gabarit) !== -1;
  if (positionDates === 'apres' && gabaritDatesPropre) { positionDates = 'droite'; }
  // Adaptation des dates (decision de Denis, 2026-10-04) : une rubrique placee avec une autre sur la MEME ligne (Formations et Certifications cote a cote, Logiciels a droite des
  // Formations, lignes composees dans l'ordre personnalise) ecrit sa date juste apres le titre, entre parentheses, pour tenir sur sa moitie de ligne. Un choix fait a la main
  // dans la boite « Dates » de la rubrique (suit = faux) reste prioritaire ; case « Adapter les dates... » decochee = rien n'est adapte.
  if (opts.adapterDatesCote !== false && !gabaritDatesPropre) {
    var surLigne = {};
    if (opts.formCertifsCoteACote) { surLigne.form = true; surLigne.cert = true; }
    if (opts.logicielsAcoteFormations === true) { surLigne.form = true; }
    if (perso && Array.isArray(opts.lignesUneColonne)) {
      var cleDate = { exp: 'exp', form: 'form', certifs: 'cert', perso: 'perso' };
      opts.lignesUneColonne.forEach(function (l) {
        var ks = (l || []).slice(0, 3);
        if (ks.length > 1) { ks.forEach(function (k) { if (cleDate[k]) { surLigne[cleDate[k]] = true; } }); }
      });
    }
    var copieDates = Object.assign({}, _pdfDatesParRub);
    Object.keys(surLigne).forEach(function (r) {
      var cur = copieDates[r];
      if (cur && cur.suit === false) { return; }
      // la suggestion « dates juste apres le titre » (datesApresTitre) garde son ecriture d'origine (« ..., 2026 ») : pas d'adaptation par-dessus
      if ((r === 'form' && (opts.datesApresTitre || []).indexOf(_PDF_INTITULES.formations) !== -1) || (r === 'cert' && (opts.datesApresTitre || []).indexOf(_PDF_INTITULES.certifications) !== -1)) { return; }
      if (r === 'exp') { if (!opts.positionDatesChoisie) { positionDates = 'apres'; copieDates.exp = { suit: false, pos: '', forme: 'parentheses', mois: !!opts.moisAffiches }; } return; }
      copieDates[r] = { suit: false, pos: 'apres', forme: 'parentheses', mois: !!opts.moisAffiches };
    });
    _pdfDatesParRub = copieDates;
  }
  var posChoisieRub = function (rub) {
    var r = _pdfReglageDatesRub(rub);
    return (r && ['droite', 'sous', 'avant', 'apres'].indexOf(r.pos) !== -1 && !(r.pos === 'apres' && gabaritDatesPropre)) ? r.pos : '';
  };
  var posDefautRubriques = (opts.datesAlignees === false) ? '' : positionDates;
  // Suggestion de mise en page « dates juste après le titre » (retour Denis 2026-10-03) : choix PAR RUBRIQUE (opts.datesApresTitre = ['Formations', 'Certifications']),
  // qui l'emporte sur « Dates alignées » pour ces rubriques seulement ; les autres gardent leur place.
  var datesApres = function (titre) { return (opts.datesApresTitre || []).indexOf(titre) !== -1; };
  var posDatesForm = posChoisieRub('form') || (datesApres(_PDF_INTITULES.formations) ? 'apres' : (['droite', 'sous', 'avant'].indexOf(opts.positionDatesFormations) !== -1) ? opts.positionDatesFormations : posDefautRubriques);
  var posDatesPerso = posChoisieRub('perso') || ((['droite', 'sous', 'avant'].indexOf(opts.positionDatesPerso) !== -1) ? opts.positionDatesPerso : posDefautRubriques);
  var styleParties = {
    poste: { souligne: !!opts.soulignerPoste, italique: !!opts.italiquePoste },
    dates: { souligne: !!opts.soulignerDates, italique: !!opts.italiqueDates },
    entreprise: { souligne: !!opts.soulignerEntreprise, italique: !!opts.italiqueEntreprise }
  };
  var styleMissions = opts.styleProfessionnel === 'condense' ? 'condense' : 'epure';
  // TACHE (chantier "style des missions etendu", 2026-09-29, DECISION DE DENIS) : chaque rubrique a missions a SON propre
  // reglage epure / condense (experiences, experience personnelle, formations) -- avant, l'experience personnelle suivait
  // en silence celui des experiences et les formations n'avaient que la liste, sans choix.
  var styleMissionsPerso = opts.stylePersonnel === 'condense' ? 'condense' : 'epure';
  var styleMissionsFormations = opts.styleFormations === 'condense' ? 'condense' : 'epure';
  // Signe entre les missions condensees (DECISION DE DENIS 2026-09-29 : 6 signes, un seul choix pour les 3 rubriques). Seul le
  // point-virgule garde un point final ; les autres signes terminent la liste sans point.
  var _SIGNES_MISSIONS = { pointvirgule: ' ; ', pointmedian: ' \u00b7 ', rond: ' \u25cf ', carre: ' \u25a0 ', losange: ' \u25c6 ', barre: ' | ' };
  var signeMissions = _SIGNES_MISSIONS[opts.separateurMissions] ? opts.separateurMissions : 'pointvirgule';
  // Forme des puces (retour Denis 2026-10-02) : UN seul choix pour toutes les listes a puces du CV (missions epurees des experiences, des formations, de l'experience
  // personnelle, listes de competences). Valeurs natives (rond = disque, carre = carre) ou signe ecrit ; le Word lit la meme valeur (wordExtracteur.js). Les modeles qui
  // dessinent leurs propres puces (Rectangles, Photo) gardent les leurs.
  var _FORMES_PUCES = { carre: 'square', triangle: '"\u25B8 "', losange: '"\u25C6 "', tiret: '"\u2013 "' };
  // Forme de puce rubrique par rubrique (retour Denis 2026-10-03, case « Mêmes puces partout » décochée) : opts.formesPuces = { exp, form, perso, comp } ; sans lui, UNE forme pour tout le CV (opts.formePuce).
  // Le Word lit le list-style-type de chaque ligne : il reprend donc ces formes sans rien de plus.
  var _formesRub = (opts.formesPuces && typeof opts.formesPuces === 'object') ? opts.formesPuces : null;
  var _SELECTEURS_PUCES = { exp: [_PDF_INTITULES.experience], form: [_PDF_INTITULES.formations], perso: [_PDF_INTITULES.experiencePerso], comp: [_PDF_INTITULES.competencesPro, _PDF_INTITULES.competencesComp, _PDF_INTITULES.competencesEnAction] };
  function _formePuceRub(k) { return (_formesRub && _formesRub[k]) ? _formesRub[k] : opts.formePuce; }
  var cssPuces = '';
  if (_formesRub) {
    var _CSS_PUCE_RUB = { rond: 'disc', carre: _FORMES_PUCES.carre, triangle: _FORMES_PUCES.triangle, losange: _FORMES_PUCES.losange, tiret: _FORMES_PUCES.tiret };
    Object.keys(_SELECTEURS_PUCES).forEach(function (k) {
      var v = _CSS_PUCE_RUB[_formesRub[k]];
      if (!v) { return; }
      cssPuces += '  ' + _SELECTEURS_PUCES[k].map(function (n) { return '.cv .rub-sec[data-rub="' + n + '"] ul'; }).join(', ') + ' { list-style-type: ' + v + '; }';
      if (k === 'comp') { cssPuces += '  .cv .themes-2col ul { list-style-type: ' + v + '; }'; }
    });
  } else if (_FORMES_PUCES[opts.formePuce]) {
    cssPuces = '  .cv ul { list-style-type: ' + _FORMES_PUCES[opts.formePuce] + '; }  .cv .themes-2col ul { list-style-type: ' + _FORMES_PUCES[opts.formePuce] + '; }';
  }
  function missionsALaSuite(segments) { return segments.map(function (s) { return s.texte; }).join(_SIGNES_MISSIONS[signeMissions]) + (signeMissions === 'pointvirgule' ? '.' : ''); }
  // Style d'ecriture COMMUN (retour Denis 2026-10-02, option « Meme style d'ecriture dans toutes les rubriques », Organisation du CV) : coche, les formations et l'experience personnelle
  // s'ecrivent comme les experiences professionnelles (la reference) : style des missions, titre (gras / italique / souligne du poste) et style du lieu. Seul un choix EXPLICITE
  // (opts.styleCommun === true) change le rendu : sans choix, ou decoche, chaque rubrique garde ses propres reglages (rendu d'avant).
  var styleCommun = opts.styleCommun === true;
  if (styleCommun) { styleMissionsPerso = styleMissions; styleMissionsFormations = styleMissions; }
  var titreFormation = styleCommun ? { italique: !!opts.italiquePoste, souligne: !!opts.soulignerPoste } : (opts.styleTitreFormation || {});
  var espForm = (typeof opts.espacementFormations === 'number') ? opts.espacementFormations : 4;
  if (serre) { espForm = Math.min(espForm, 3); }
  // Style commun des blocs « formation » : espace du reglage ; a 0 le texte est aussi resserre (interligne) pour que la difference se voie.
  var espFormStyle = 'margin-bottom:' + espForm + 'px' + (espForm <= 0 ? ';line-height:1.15' : '');
  // Choix de la personne : informations d'une formation (annee, diplome, centre, lieu) sur UNE ligne ou en dessous ; sinon celui du modele.
  var formLigne = (opts.formationsLigne === 'ligne' || opts.formationsLigne === 'dessous') ? opts.formationsLigne : '';

  // ---------- contenu ----------
  var nomComplet = [identite.prenom, (identite.nom || '').toUpperCase()].filter(Boolean).join(' ');
  var metier = objetCV.objectifProfessionnel || '';
  var accroche = opts.sansAccroche ? '' : ((objetCV.profil && (objetCV.profil.profilIA || objetCV.profil.profilUtilisateur)) || '');
  // Listes de competences : par defaut celles decidees par l'assistant (ordre de pertinence). « − n + » garde les n premieres
  // (ou en ajoute, prises dans le reservoir complet du dossier) ; « Choisir » = la personne coche elle-meme (choix personnel).
  function versTextes(liste) { return (liste || []).map(function (c) { return (typeof c === 'string') ? c : ((c && c.competence) || ''); }).filter(Boolean); }
  function cleTexte(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  // Ordre choisi par la personne (retour Denis 2026-10-03, fleches « monter / descendre » des listes de competences) : opts.ordreMotsCles = { pro: [textes], comp: [textes] }.
  // Une competence absente de cette liste garde sa place d'origine, apres celles qui y figurent.
  function appliquerOrdreCompetences(l, ordre) {
    if (!ordre || !ordre.length) { return l; }
    return l.map(function (x, k) { var r = ordre.indexOf(x); return { x: x, r: r === -1 ? 100000 + k : r }; }).sort(function (a, b) { return a.r - b.r; }).map(function (o) { return o.x; });
  }
  // Competences ajoutees a la main (carte Competences, « Editer les competences », 2026-10-04) : opts.competencesAjoutees = { pro: [...], comp: [...] }, pour CE CV seulement ;
  // elles s'ajoutent toujours a la suite de la liste (choisie ou automatique), sans doublon, et se retirent comme les autres.
  function avecAjoutees(liste, ajoutees) {
    var l = liste.slice(), deja = l.map(cleTexte);
    (ajoutees || []).forEach(function (x) { if (x && deja.indexOf(cleTexte(x)) === -1) { l.push(x); deja.push(cleTexte(x)); } });
    return l;
  }
  function listeCompetences(auto, reservoir, max, choisies, ordre, ajoutees) {
    if (choisies) {
      var base = reservoir.slice();
      auto.forEach(function (x) { if (base.indexOf(x) === -1) { base.push(x); } });
      return appliquerOrdreCompetences(avecAjoutees(base.filter(function (x) { return choisies.indexOf(x) !== -1; }), ajoutees), ordre);
    }
    var l = auto.slice();
    if (typeof max === 'number') {
      if (max <= l.length) { l = l.slice(0, max); }
      else {
        var deja = l.map(cleTexte);
        reservoir.forEach(function (x) { if (l.length < max && deja.indexOf(cleTexte(x)) === -1) { l.push(x); deja.push(cleTexte(x)); } });
      }
    }
    return appliquerOrdreCompetences(avecAjoutees(l, ajoutees), ordre);
  }
  var reservoir = opts.reservoirCompetences || {};
  var competencesPro = listeCompetences(versTextes(opts.competencesProfessionnelles || contenu.competences), versTextes(reservoir.pro), opts.competencesProfessionnellesMax, opts.competencesProChoisies, (opts.ordreMotsCles || {}).pro, (opts.competencesAjoutees || {}).pro);
  // LOT 3.4 : qualites attendues pour le poste visé, AJOUTEES apres les comportementales connues (dans la limite des places du format),
  // sauf si la personne a decoche l'option (opts.qualitesMetierActives === false, 3.5) : elles disparaissent alors aussi du reservoir.
  var qualitesMetier = versTextes(opts.qualitesAttenduesMetier);
  var qualitesMetierActives = opts.qualitesMetierActives !== false;
  var autoComp = versTextes(opts.competencesComportementales);
  var reservoirComp = versTextes(reservoir.comportementales);
  if (qualitesMetierActives) {
    var dejaComp = autoComp.map(cleTexte);
    qualitesMetier.slice(0, Math.max(0, opts.placesQualitesMetier || 0)).forEach(function (q) { if (dejaComp.indexOf(cleTexte(q)) === -1) { autoComp.push(q); dejaComp.push(cleTexte(q)); } });
  } else {
    var clesQualites = qualitesMetier.map(cleTexte);
    reservoirComp = reservoirComp.filter(function (x) { return clesQualites.indexOf(cleTexte(x)) === -1; });
  }
  var competencesComp = listeCompetences(autoComp, reservoirComp, opts.competencesComportementalesMax, opts.competencesCompChoisies, (opts.ordreMotsCles || {}).comp, (opts.competencesAjoutees || {}).comp);
  // Ce qui est reellement affiche + le reservoir complet : lus par la carte « Elements supplementaires » (js/app.js,
  // _mepMajCompetencesMq) pour les compteurs et les listes « Choisir ». (Ecrit seulement dans un navigateur.)
  if (typeof window !== 'undefined' && !opts.__sansEtatPanneau) {
    var reunir = function (auto, res) {
      var pool = res.slice(); var deja = pool.map(cleTexte);
      auto.forEach(function (x) { if (deja.indexOf(cleTexte(x)) === -1) { pool.push(x); deja.push(cleTexte(x)); } });
      return pool;
    };
    window._mepCompetencesAffichees = {
      pro: competencesPro.filter(function (x) { return retirees.indexOf(x) === -1; }),
      comp: competencesComp.filter(function (x) { return retirees.indexOf(x) === -1; }),
      poolPro: avecAjoutees(reunir(versTextes(opts.competencesProfessionnelles || contenu.competences), versTextes(reservoir.pro)), (opts.competencesAjoutees || {}).pro),
      poolComp: avecAjoutees(reunir(versTextes(opts.competencesComportementales), versTextes(reservoir.comportementales)), (opts.competencesAjoutees || {}).comp)
    };
  }
  var photoUrl = (objetCV.photo && objetCV.photo.url) || null;

  // ---------- briques ----------
  // ed(id, texte, rendu) : un texte que la personne peut corriger dans le plein ecran (« Modifier le texte »). Identifiant
  // STABLE (semantique, jamais un compteur) ; la correction n'est reappliquee que si le texte d'origine n'a pas change.
  function ed(id, texte, rendu) {
    var t = (texte === null || texte === undefined) ? '' : String(texte);
    if (!t) { return rendu ? rendu('') : ''; }
    var e = textesEdites[id];
    var affiche = (e && e.t === t) ? e.x : t;
    return '<span data-ed="' + _pdfEscaperHtml(id) + '" data-t="' + _pdfEscaperHtml(t) + '">' + (rendu ? rendu(affiche) : _pdfEscaperHtml(affiche)) + '</span>';
  }
  // Une date ou une periode modifiable sur le CV (« Modifier le texte ») : texte libre pour CE CV, le dossier n'est pas modifie.
  function edDate(id, texte) {
    return texte ? ed(id, texte, function (x) { return _pdfSpanStylePartie(x, styleParties.dates); }) : '';
  }
  // sec(cle, html) : une rubrique (titre + contenu) dont la personne peut regler la taille et l'interligne seule.
  function sec(cle, html) {
    if (!html) { return ''; }
    var st = stylesRub[cle];
    var style = st ? ((st.t && st.t !== 1 ? 'zoom:' + st.t + ';' : '') + (st.il ? 'line-height:' + st.il + ';' : '')) : '';
    // Espace AU-DESSUS de la rubrique (px, retour Denis 2026-10-01) : « Espacer les rubriques » (automatique) et crans a la main. Padding (pas margin) : il s'ajoute
    // au retrait du titre au lieu de fusionner avec lui ; divise par le zoom pour que 12 px restent 12 px sur la page.
    if (st && st.esp > 0) { style += 'padding-top:' + (Math.round(st.esp / (st.t && st.t !== 1 ? st.t : 1) * 10) / 10) + 'px;'; }
    return '<div class="rub-sec" data-rub="' + _pdfEscaperHtml(cle) + '"' + (style ? ' style="' + style + '"' : '') + '>' + html + '</div>';
  }
  // Style propre a une famille de competences (retour Denis 2026-10-02, carte « Competences ») : opts.styleCompetencesFamille.pro / .comp = 'pastille' | 'rect' | 'texte' ;
  // sans choix (« Comme le style general »), le style general de « Mise en page et texte » (variable pill) s'applique, comme avant.
  function pillDe(famille) {
    var f = (opts.styleCompetencesFamille || {})[famille];
    return (f === 'pastille' || f === 'rect' || f === 'texte') ? f : pill;
  }
  function pills(liste, famille) {
    var pillCourant = famille ? pillDe(famille) : pill;
    return liste.filter(function (x) { return retirees.indexOf(x) === -1; }).map(function (x) {
      return '<span class="pill ' + pillCourant + '">' + ed('k:' + x, x) + '<button type="button" class="x" data-ret="' + _pdfEscaperHtml(x) + '" title="Retirer">×</button></span>';
    }).join('');
  }
  // TACHE (P10, retour Denis 2026-09-28) : meme forcage qu'au-dessus (blocThemes)
  // pour "Competences professionnelles" en Mixte -- toujours 2 colonnes, jamais
  // un choix de la personne, en plus du reglage listesDeuxColonnes (qui reste
  // disponible pour les autres modes/rubriques).
  // Deux colonnes qui se remplissent de haut en bas (retour Denis 2026-09-30) : DEUX blocs explicites dans une grille. Des colonnes CSS
  // (column-count) sortaient le texte de sa place dans le Word (l'extracteur ne sait pas lire les fragments de colonnes).
  function pillsEnDeuxColonnes(liste, famille) {
    var vraies = liste.filter(function (x) { return retirees.indexOf(x) === -1; });
    var moitie = Math.ceil(vraies.length / 2);
    return '<div>' + pills(vraies.slice(0, moitie), famille) + '</div><div>' + pills(vraies.slice(moitie), famille) + '</div>';
  }
  // Disposition des competences (retour Denis 2026-10-02, carte « Competences ») : « suite » (en continu, comme avant), « une » colonne, « deux » colonnes. Le choix explicite de la
  // personne (opts.dispositionCompetences.pro / .comp) prime ; sans choix, rien ne change : les professionnelles gardent leur regle d'avant (2 colonnes si la case 2 colonnes
  // d'un ancien CV est cochee, en Mixte et en style « Texte »), les comportementales restent a la suite.
  var dispoCompChoisie = opts.dispositionCompetences || {};
  function dispositionComp(famille) {
    var d = dispoCompChoisie[famille];
    if (d === 'suite' || d === 'une' || d === 'deux') { return d; }
    if (famille === 'pro') { return (modeMixteB || (opts.listesDeuxColonnes || []).indexOf(_PDF_INTITULES.competencesPro) !== -1 || pillDe('pro') === 'texte') ? 'deux' : 'suite'; }
    return ((opts.listesDeuxColonnes || []).indexOf(_PDF_INTITULES.competencesComp) !== -1) ? 'deux' : 'suite';
  }
  // Signe entre les competences en style « Texte » a la suite (opts.separateurCompetences.pro / .comp) et forme des puces en colonnes (opts.formePuce, un seul choix pour toutes les
  // listes). Variables CSS posees sur le conteneur : sans choix, aucune variable, le rendu d'avant (rond) est inchange.
  var _SIGNES_COMP = { median: ' \u00b7 ', carre: ' \u25a0 ', losange: ' \u25c6 ', barre: ' | ' };
  var _PUCES_TXT = { carre: '\u25aa ', triangle: '\u25b8 ', losange: '\u25c6 ', tiret: '\u2013 ' };
  function pillsSelonDisposition(liste, dispo, nom) {
    var texte = pillDe(nom) === 'texte', explicite = !!dispoCompChoisie[nom];
    var puce = (texte && explicite && _PUCES_TXT[_formePuceRub('comp')]) ? ' style="--puce:\'' + _PUCES_TXT[_formePuceRub('comp')] + '\'"' : '';
    var classePuces = (texte && explicite) ? ' pills-puces' : '';
    if (dispo === 'deux') {
      // 2 colonnes imposees par le style « Texte » seul (aucun choix, ni Mixte, ni ancienne case) : meme balisage qu'avant (classe pills-auto), pour que rien ne change sans choix.
      var imposeeParTexte = nom === 'pro' && texte && !dispoCompChoisie.pro && !modeMixteB && (opts.listesDeuxColonnes || []).indexOf(_PDF_INTITULES.competencesPro) === -1;
      return '<div class="' + (imposeeParTexte ? 'pills-auto' : 'pills-2col') + classePuces + '"' + puce + '>' + pillsEnDeuxColonnes(liste, nom) + '</div>';
    }
    if (dispo === 'une') { return '<div class="pills-1col' + classePuces + '"' + puce + '>' + pills(liste, nom) + '</div>'; }
    var sep = (texte && _SIGNES_COMP[(opts.separateurCompetences || {})[nom]]) ? ' style="--sep:\'' + _SIGNES_COMP[opts.separateurCompetences[nom]] + '\'"' : '';
    return '<div' + (nom === 'pro' && texte && !dispoCompChoisie.pro ? ' class="pills-auto"' : '') + sep + '>' + pills(liste, nom) + '</div>';
  }
  function blocPro() { return (!bandeauCles && !modeParCompC && competencesPro.length) ? encadre(sec(_PDF_INTITULES.competencesPro, titreH2(_PDF_INTITULES.competencesPro) + pillsSelonDisposition(competencesPro, dispositionComp('pro'), 'pro'))) : ''; }
  function blocComp() { return (!bandeauCles && competencesComp.length) ? encadre(sec(_PDF_INTITULES.competencesComp, titreH2(_PDF_INTITULES.competencesComp) + pillsSelonDisposition(competencesComp, dispositionComp('comp'), 'comp'))) : ''; }
  function blocListe(titre, items) {
    if (!items || !items.length) { return ''; }
    var deuxCol = (opts.listesDeuxColonnes || []).indexOf(titre) !== -1;
    var lignes = items.map(function (x, i) { return '<div>' + ed('li:' + titre + ':' + i, x) + '</div>'; });
    // Deux colonnes qui se remplissent de haut en bas (retour Denis 2026-09-30) : DEUX blocs explicites dans une grille, comme pour les competences.
    // Des colonnes CSS (column-count) decalaient la 2e colonne dans le Word (l'extracteur ne sait pas lire les fragments de colonnes).
    var moitieListe = Math.ceil(lignes.length / 2);
    return sec(titre, titreH2(titre) + '<div' + (deuxCol ? ' class="liste-2col"' : '') + '>' +
      (deuxCol ? '<div>' + lignes.slice(0, moitieListe).join('') + '</div><div>' + lignes.slice(moitieListe).join('') + '</div>' : lignes.join('')) + '</div>');
  }
  function blocLogi() { return blocListe(_PDF_INTITULES.logiciels, contenu.logiciels); }
  function libellesLangues() {
    return (contenu.langues || []).map(function (l) { return (l && l.langue) ? (l.langue + (l.niveau ? ' - niveau ' + l.niveau : '')) : String(l); });
  }
  function blocLangues() { return blocListe(_PDF_INTITULES.langues, libellesLangues()); }
  // Certifications (retour Denis 2026-10-03) : quand « Dates alignées » est cochée (par défaut), chaque certification est une vraie ligne datée, placée comme celles des
  // formations et des expériences (à droite, sous le titre ou avant). Décochée, ou sans date, ou sans position : le texte d'avant, inchangé.
  function ligneCertifDatee(brut, i) {
    var titreRub = _PDF_INTITULES.certifications;
    var c = (typeof separerCertification === 'function') ? separerCertification(brut) : { intitule: String(brut), organisme: '', lieu: '', date: '' };
    var corps = [c.intitule, [c.organisme, c.lieu].filter(Boolean).join(', ')].filter(Boolean).join(' - ');
    var tEd = ed('li:' + titreRub + ':' + i, corps);
    var rgCert = _pdfReglageDatesRub('cert');
    var dEd = c.date ? ed('lc:' + i, _pdfFormeDate(rgCert ? _pdfAnneeFormationMois(c.date, 'cert') : c.date, 'cert')) : '';
    var missionsC = missionsCertifHtml(brut, i);
    if (!dEd) { return '<div class="item" style="margin-bottom:4px">' + tEd + missionsC + '</div>'; }
    var posCert = posChoisieRub('cert') || (datesApres(titreRub) ? 'apres' : posDefautRubriques) || 'droite';
    var corpsHtml = (posCert === 'apres')
      ? '<div>' + tEd + ', ' + dEd + '</div>'
      : (posCert === 'droite')
      ? '<div class="ligne"><span>' + tEd + '</span><span class="dates">' + dEd + '</span></div>'
      : (posCert === 'sous')
        ? '<div>' + tEd + '</div><div class="meta">' + dEd + '</div>'
        : '<div><span class="dates" style="display:inline-block;min-width:74px">' + dEd + '</span>' + tEd + '</div>';
    return '<div class="item" style="margin-bottom:4px">' + corpsHtml + missionsC + '</div>';
  }
  // Missions d'une certification (lot 2026-10-04) : seulement si la personne ou l'assistant en a ecrit ; une certification sans mission reste une ligne simple.
  function missionsCertifHtml(brut, i) {
    var entree = (objetCV.certificationsAvecMissions || []).filter(function (e) { return e && e.certification === brut; })[0];
    return (entree && entree.missions) ? missionsHtml(entree.missions, 'cm:' + i) : '';
  }
  function certifsAvecMissions() {
    return (contenu.certificationsBrutes || []).some(function (b, i) { return !!missionsCertifHtml(b, i); });
  }
  function blocCertifs() {
    var brutes = contenu.certificationsBrutes || [];
    var titreRub = _PDF_INTITULES.certifications;
    if (!brutes.length || !(posDefautRubriques || datesApres(titreRub) || posChoisieRub('cert') || certifsAvecMissions()) || (contenu.certifications || []).length !== brutes.length) { return blocListe(titreRub, contenu.certifications); }
    var deuxCol = (opts.listesDeuxColonnes || []).indexOf(titreRub) !== -1;
    var lignes = brutes.map(ligneCertifDatee);
    var moitie = Math.ceil(lignes.length / 2);
    return sec(titreRub, titreH2(titreRub) + '<div' + (deuxCol ? ' class="liste-2col"' : '') + '>' +
      (deuxCol ? '<div>' + lignes.slice(0, moitie).join('') + '</div><div>' + lignes.slice(moitie).join('') + '</div>' : lignes.join('')) + '</div>');
  }
  function blocCentres() { return blocListe(_PDF_INTITULES.loisirs, (contenu.loisirs || []).map(_pdfPremiereMajuscule)); }
  // Informations complementaires : seulement les lignes que la personne a cochees (jamais affichees d'office).
  var infosCompAff = (opts.infosCompAffichees || []).filter(function (x) { return (objetCV.informationsComplementaires || []).indexOf(x) !== -1; });
  function blocInfos() { return blocListe(_PDF_INTITULES.infos, infosCompAff); }
  function lieuHtml(e) {
    var lieu = afficherLieu ? e.lieu : '';
    return lieu ? ', <span class="lieu lieu-' + lieuStyle + '">' + _pdfEscaperHtml(lieu) + '</span>' : '';
  }
  // TACHE (J4, 2026-09-28, apercu plein ecran "Retirer une rubrique ou une mission") : filtre UNIQUE,
  // fonction PARTAGEE par toutes les sources de missions (experiences, formations, engagements/exp
  // perso -- voir ses appelants plus bas) et par tous les modeles de la galerie (aucune copie
  // separee de cette fonction ailleurs). La cle (prefixe + index D'ORIGINE, jamais renumerotee
  // apres un retrait) est la MEME que celle deja utilisee par "Modifier le texte" (data-ed) --
  // aucune nouvelle convention, juste une nouvelle lecture de cette cle existante.
  // R13 : `dejaAffichees` (facultatif) = phrases deja montrees ailleurs (bloc « Competences en action » du mode Mixte) ; une mission
  // identique ou quasi identique n'est pas repetee. Le filtre passe APRES la numerotation : les cles « retirer une mission »
  // gardent leur index d'origine.
  function missionsHtml(texteMissions, prefixe, dejaAffichees) {
    var missionsRetireesMain = opts.missionsRetirees || [];
    var segments = _pdfDecouperMissions(texteMissions).map(_pdfSansPonctuationFinale).filter(Boolean)
      .map(function (m, k) { return { texte: m, cle: prefixe + ':' + k }; })
      .filter(function (s) { return missionsRetireesMain.indexOf(s.cle) === -1; })
      .filter(function (s) {
        return !(dejaAffichees && dejaAffichees.length && typeof _cvMissionsSimilaires === 'function' &&
          dejaAffichees.some(function (t) { return _cvMissionsSimilaires(s.texte, t); }));
      });
    if (!segments.length) { return ''; }
    segments = _pdfOrdonnerMissionsMien(segments, prefixe, opts);
    var styleRubrique = /^em:/.test(prefixe) ? styleMissionsPerso : styleMissions;
    if (styleRubrique === 'condense') { return '<div class="meta" style="margin-top:2px">' + ed(prefixe + ':c', missionsALaSuite(segments)) + '</div>'; }
    return '<ul>' + segments.map(function (s) { return '<li>' + ed(s.cle, s.texte + '.') + '</li>'; }).join('') + '</ul>';
  }
  // TACHE (J4, 2026-09-28) : les missions d'une formation avaient leur PROPRE implementation (4 copies
  // identiques dans ce fichier, une par modele de galerie) plutot que de passer par missionsHtml() --
  // regroupees ici en une seule fonction PARTAGEE (une seule source de verite, filtre "retirer une
  // mission" applique une seule fois pour tous les modeles au lieu de 4 fois separement).
  function missionsFormationHtml(f, fi) {
    if (!opts.afficherMissionsFormation || !f.missions) { return ''; }
    var missionsRetireesMain = opts.missionsRetirees || [];
    var segments = _pdfDecouperMissions(f.missions).map(_pdfSansPonctuationFinale).filter(Boolean)
      .map(function (m, k) { return { texte: m, cle: 'fm:' + fi + ':' + k }; })
      .filter(function (s) { return missionsRetireesMain.indexOf(s.cle) === -1; });
    if (!segments.length) { return ''; }
    segments = _pdfOrdonnerMissionsMien(segments, 'fm:' + fi, opts);
    if (styleMissionsFormations === 'condense') { return '<div class="meta" style="margin-top:2px">' + ed('fm:' + fi + ':c', missionsALaSuite(segments)) + '</div>'; }
    return '<ul>' + segments.map(function (s) { return '<li>' + ed(s.cle, s.texte + '.') + '</li>'; }).join('') + '</ul>';
  }
  var ctl = '<span class="ctl-exp"><button type="button" data-mv="-1" title="Monter">▲</button><button type="button" data-mv="1" title="Descendre">▼</button></span>';
  // Retour Denis 2026-09-30 : fleches ▲ ▼ des formations (visibles seulement en mode « Deplacer » du plein ecran), avec la cle de la formation.
  function attrFormation(f) { return ' data-form="' + _pdfEscaperHtml(String((f && f.__cleForm !== undefined) ? f.__cleForm : _pdfCleFormation(f))) + '"'; }
  function enteteExp(e, index) {
    var periode = _pdfFormaterPeriode(e.dateDebut, e.dateFin, 'exp');
    var dates = edDate('da:' + index, periode);
    var entreprise = ed('en:' + index, e.entreprise || '', function (x) { return _pdfSpanStylePartie(x, styleParties.entreprise); });
    var poste = ed('po:' + index, _pdfPosteAvecStage(e), function (x) { return _pdfSpanStylePartie(x, styleParties.poste); });
    var entLieu = entreprise + lieuHtml(e);
    // Sans entreprise (ex. experience personnelle remontee en professionnel, R8-3) : pas de virgule orpheline devant le lieu.
    if (!entreprise) { entLieu = entLieu.replace(/^, /, ''); }
    if (positionDates === 'apres') {
      if (experiencesAmeliorees) {
        return '<div class="ligne"><span><b class="gras">' + poste + '</b>' + (dates ? ' <span class="dates">' + dates + '</span>' : '') + '</span></div>' +
          (entLieu ? '<div class="ent-ameliore">' + entLieu.replace(/^, /, '') + '</div>' : '');
      }
      return '<div><b class="gras">' + poste + '</b>' + (dates ? ' <span class="dates">' + dates + '</span>' : '') + (entLieu ? ' - ' + entLieu : '') + '</div>';
    }
    if (experiencesAmeliorees) {
      if (positionDates === 'avant') {
        return '<div class="ligne"><span>' + (dates ? '<span class="dates" style="margin-right:10px">' + dates + '</span>' : '') + '<b class="gras">' + poste + '</b></span></div>' +
          (entLieu ? '<div class="ent-ameliore">' + entLieu.replace(/^, /, '') + '</div>' : '');
      }
      if (positionDates === 'sous') {
        var lieuEnt = entLieu ? entLieu.replace(/^, /, '') : '';
        return '<div class="ligne"><span><b class="gras">' + poste + '</b></span></div>' +
          ((lieuEnt || dates) ? '<div class="ent-ameliore">' + lieuEnt + (dates ? ((lieuEnt ? ' : ' : '') + '<span class="dates-sous">' + dates + '</span>') : '') + '</div>' : '');
      }
      return '<div class="ligne"><span><b class="gras">' + poste + '</b></span>' + (dates ? '<span class="dates">' + dates + '</span>' : '') + '</div>' +
        (entLieu ? '<div class="ent-ameliore">' + entLieu.replace(/^, /, '') + '</div>' : '');
    }
    if (positionDates === 'droite') {
      return '<div class="ligne"><span><b class="gras">' + poste + '</b>' + (entLieu ? ' - ' + entLieu : '') + '</span>' + (dates ? '<span class="dates">' + dates + '</span>' : '') + '</div>';
    }
    if (positionDates === 'sous') {
      return '<div><b class="gras">' + poste + '</b></div>' + ((entLieu || dates) ? '<div class="meta">' + entLieu + (dates ? ' : ' + dates : '') + '</div>' : '');
    }
    return '<div>' + (dates ? '<span class="dates" style="display:inline-block;min-width:74px">' + dates + '</span>' : '') + '<b class="gras">' + poste + '</b>' + (entLieu ? ' - ' + entLieu : '') + '</div>';
  }
  // « Par competences » (C) / « Mixte » (B) : un bloc « Competences en action » (competences regroupees par theme, avec, si la
  // personne le demande, l'experience qui les illustre) puis « Parcours professionnel » (historique : poste, entreprise, lieu,
  // dates ; sur une seule ligne en « Par competences »). Les themes viennent du Composeur (contenuRetenu.competencesGroupees) :
  // rien n'est invente ici.
  var groupesCompetences = (composition && composition.contenuRetenu && composition.contenuRetenu.competencesGroupees) || [];
  if (typeof window !== 'undefined' && !opts.__sansEtatPanneau) {
    // Competences professionnelles proposees a l'outil « Relier mes competences a mes experiences » : celles du CV (liste ou themes).
    window._mepCompetencesPourLiens = competencesPro.filter(function (x) { return retirees.indexOf(x) === -1; }).slice();
  }
  if (typeof window !== 'undefined' && !opts.__sansEtatPanneau) {
    window._mepRubriquesTronquees = (composition && composition.rubriquesTronquees) || [];
    window._mepRubriquesMasquees = (objetCV && objetCV.rubriquesMasqueesParAssistant) || [];
    window._mepGroupesCompetences = groupesCompetences.length;
    window._mepLiensCompetences = groupesCompetences.reduce(function (t, g) {
      return t + (g.items || []).filter(function (it) { return it.illustrePar && it.illustrePar.length; }).length;
    }, 0);
  }
  // « Competences professionnelles » et « Competences en action » ne faisaient plus qu'UN bloc (2026-09-26, point 4 de Denis) :
  // en modes « Par competences » et « Mixte », le bloc regroupe par theme remplacait la liste de gauche. TACHE (retour Denis
  // 2026-09-27, precision suite au chantier "Mode de presentation") : DISTINCTION reintroduite pour Mixte -- "Par competences"
  // (C) reste un remplacement complet (une seule rubrique "Competences professionnelles", jamais de rubrique "Competences en
  // action"), mais "Mixte" (B) garde desormais les 2 : les competences les plus importantes, developpees en missions, sous
  // "Competences en action" (voir blocThemes()), ET les autres (secondaires) en simples pastilles sous "Competences
  // professionnelles" (blocPro(), plus jamais supprime en mode B). Jamais de rubrique qui change de nom selon le mode : ce sont
  // 2 rubriques FIXES qui coexistent en Mixte, "Competences en action" n'existant JAMAIS dans les 2 autres modes.
  // Cases « Afficher les competences professionnelles / comportementales » (decision Denis 2026-09-29) : cochees par defaut ; decochee, la
  // rubrique disparait du CV, recochee elle revient. Sans les professionnelles, les modes « Par competences » et « Mixte » retombent sur
  // l'affichage chronologique : les missions restent dans les experiences, jamais retirees avec la rubrique.
  var proVisible = opts.afficherCompetencesPro !== false;
  var compVisible = opts.afficherCompetencesComportementales !== false;
  var parComp = (opts.modePresentation === 'B' || opts.modePresentation === 'C') && groupesCompetences.length && proVisible;
  var modeParCompC = opts.modePresentation === 'C' && groupesCompetences.length && proVisible;
  var modeMixteB = opts.modePresentation === 'B' && groupesCompetences.length && proVisible;
  // Bouton « Competences en pastilles » (Organisation du CV, Denis 2026-10-01) : coche, en « Par competences » sur une colonne, les competences professionnelles
  // (le texte des themes, sur deux lignes si besoin) passent EN PASTILLES, en haut, et partagent la place avec les comportementales : les deux ont la meme forme.
  // Decoche : chaque rubrique garde son comportement (themes en texte au-dessus des experiences, comportementales seules).
  // Un choix explicite de disposition (opts.actionCote vrai ou faux) l'emporte sur le placement automatique en pastilles (retour Denis 2026-10-03).
  var themesEnHaut = !!(modeParCompC && pill !== 'texte' && !deux && typeof opts.actionCote !== 'boolean');
  if (!proVisible) { competencesPro = []; }
  if (!compVisible) { competencesComp = []; }
  function groupesAffiches() {
    var autorisees = competencesPro.filter(function (x) { return retirees.indexOf(x) === -1; }).map(cleTexte);
    var recoupe = groupesCompetences.some(function (g) { return (g.items || []).some(function (it) { return autorisees.indexOf(cleTexte(it.texte)) !== -1; }); });
    var vues = [];
    // Cles d'edition STABLES (retour Denis 2026-10-02, chantier carte Experiences P3) : fondees sur le TEXTE de la mission, plus sur sa position (« gi:0:1 »).
    // Avec une position, monter ou descendre une mission, ou en retirer une avant elle, decalait ses corrections : elles n'etaient plus reappliquees
    // (ed() ne rend une correction que si le texte d'origine correspond). Une cle d'avant (positionnelle) reste lue si son texte d'origine correspond,
    // sans toucher aux reglages enregistres.
    var clesVues = {};
    function cleStable(prefixe, texte) {
      var base = prefixe + ':' + cleTexte(texte).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
      clesVues[base] = (clesVues[base] || 0) + 1;
      return clesVues[base] > 1 ? base + '~' + clesVues[base] : base;
    }
    // TOUS les groupes et toutes les missions (meme retirees ou ecartees) : la liste de la carte « Experiences » du panneau les montre toutes, cochees ou non.
    var tous = groupesCompetences.map(function (g, gi) {
      var items = (g.items || []).map(function (it, ii) {
        var cle = cleStable('gi', it.texte), ancienne = textesEdites['gi:' + gi + ':' + ii];
        if (!textesEdites[cle] && ancienne && ancienne.t === it.texte) { textesEdites = Object.assign({}, textesEdites); textesEdites[cle] = ancienne; }
        return { texte: it.texte, illustrePar: it.illustrePar, cle: cle, reserve: !!it.reserve, proposition: !!it.proposition, etiquette: it.etiquette || '',
          retiree: retirees.indexOf(it.texte) !== -1 || (!!it.reserve && (opts.reservesChoisies || []).indexOf(it.texte) === -1),
          ecartee: !!(recoupe && autorisees.indexOf(cleTexte(it.texte)) === -1) };
      });
      var cleTheme = g.theme ? cleStable('th', g.theme) : 'th:' + gi, ancienneTheme = textesEdites['th:' + gi];
      if (g.theme && !textesEdites[cleTheme] && ancienneTheme && ancienneTheme.t === g.theme) { textesEdites = Object.assign({}, textesEdites); textesEdites[cleTheme] = ancienneTheme; }
      return { theme: g.theme, gi: gi, cleTheme: cleTheme, items: items };
    });
    // Ordre choisi par la personne (carte « Experiences », monter / descendre) : opts.ordreCompetences = { themes: [cleTheme...], items: { cleTheme: [cle...] } }.
    // Une mission ou un theme qui n'y figure pas (nouveau) garde sa place d'origine, apres ceux qui y figurent.
    var ordreC = opts.ordreCompetences || {};
    function trier(liste, ordre, cleDe) {
      if (!ordre || !ordre.length) { return liste; }
      return liste.map(function (x, k) { var r = ordre.indexOf(cleDe(x)); return { x: x, r: r === -1 ? 100000 + k : r }; })
        .sort(function (a, b) { return a.r - b.r; }).map(function (o) { return o.x; });
    }
    tous = trier(tous, ordreC.themes, function (g) { return g.cleTheme; });
    tous.forEach(function (g) { g.items = trier(g.items, (ordreC.items || {})[g.cleTheme], function (it) { return it.cle; }); });
    var groupes = tous.map(function (g) {
      var items = g.items.filter(function (it) { return !it.retiree && !it.ecartee; });
      items.forEach(function (it) { vues.push(cleTexte(it.texte)); });
      return { theme: g.theme, gi: g.gi, cleTheme: g.cleTheme, items: items };
    }).filter(function (g) { return g.items.length; });
    // Niveau de detail (retour Denis 2026-10-02), Par competences et Mixte : « Resume » ne garde que les 3 premieres missions de la liste ; en « Automatique » et Par competences,
    // opts.compCoupe missions sont retirees EN BAS de la liste (calcule par le panneau pour que le CV tienne sur une page). « Complet » garde tout ce qui est propose.
    function plafonner(liste, limite, raison) {
      var reste = limite;
      liste.forEach(function (g) { g.items = g.items.filter(function (it) { if (reste > 0) { reste--; return true; } it.coupe = raison; return false; }); });
      return liste.filter(function (g) { return g.items.length; });
    }
    if (opts.niveauDetail === 'resume' && (modeParCompC || modeMixteB)) { groupes = plafonner(groupes, 3, 'resume'); }
    if (modeParCompC && opts.niveauDetail !== 'complet' && opts.compCoupe > 0) {
      var totalAvantCoupe = groupes.reduce(function (t, g) { return t + g.items.length; }, 0);
      groupes = plafonner(groupes, Math.max(1, totalAvantCoupe - opts.compCoupe), 'auto');
    }
    // R13 : en Mixte, sans regroupement de l'assistant (un seul groupe sans nom = les missions elles-memes, repli du Composeur),
    // le bloc « Competences en action » ne garde que les plus utiles (la moitie des missions par defaut, sans maximum depuis le 2026-10-02 ; deja classees par pertinence) ; les autres
    // restent dans les experiences. Sinon le bloc reprendrait toutes les missions et les experiences se videraient.
    if (modeMixteB && groupes.length === 1 && !groupes[0].theme) {
      var missionsDuBloc = groupes[0].items.filter(function (it) { return it.cle.indexOf('gi:') === 0; });
      // Par defaut : la moitie des missions (au moins 2, sans maximum : retour Denis 2026-10-02), pour que les experiences gardent aussi leur contenu.
      var maxAction = (typeof opts.nbCompetencesEnAction === 'number' && opts.nbCompetencesEnAction > 0)
        ? opts.nbCompetencesEnAction : Math.max(2, Math.ceil(missionsDuBloc.length / 2));
      groupes[0].items = missionsDuBloc.slice(0, maxAction)
        .concat(groupes[0].items.filter(function (it) { return it.cle.indexOf('gi:') !== 0; }));
    }
    if (recoupe) {
      // Competences ajoutees par « + » ou « Choisir » qui ne figurent dans aucun theme : rangees a la suite, jamais perdues.
      var extras = competencesPro.filter(function (x) { return retirees.indexOf(x) === -1 && vues.indexOf(cleTexte(x)) === -1; })
        .map(function (x, k) { return { texte: x, illustrePar: [], cle: 'ex:' + k }; });
      if (extras.length) {
        if (groupes.length) { groupes[groupes.length - 1].items = groupes[groupes.length - 1].items.concat(extras); }
        else { groupes.push({ theme: '', gi: 0, items: extras }); }
      }
    }
    // Etat lu par la carte « Experiences » du panneau (zone « Modifier mes competences et leurs missions ») : ce qui est reellement affiche et ce qui ne l'est pas.
    if (typeof window !== 'undefined' && !opts.__sansEtatPanneau) {
      var affichees = {}; groupes.forEach(function (g) { g.items.forEach(function (it) { affichees[it.cle] = true; }); });
      window._mepGroupesCompTous = tous.map(function (g) {
        return { theme: g.theme || '', cleTheme: g.cleTheme, items: g.items.map(function (it) {
          var e = textesEdites[it.cle];
          return { cle: it.cle, texte: it.texte, texteAffiche: (e && e.t === it.texte) ? e.x : it.texte, source: (it.illustrePar || []).join(', '),
            affichee: !!affichees[it.cle], retiree: it.retiree, ecartee: it.ecartee, reserve: !!it.reserve, proposition: !!it.proposition, etiquette: it.etiquette || '', coupe: it.coupe || '' };
        }) };
      });
    }
    return groupes;
  }
  // Missions de « Competences en action » (retour Denis 2026-10-03) : une par ligne ou a la suite avec un signe. Choix propre au bloc (opts.styleMissionsAction), sinon le style des
  // missions des experiences ; le signe est celui des experiences (un seul reglage).
  var styleAction = (opts.styleMissionsAction === 'condense' || opts.styleMissionsAction === 'epure') ? opts.styleMissionsAction : styleMissions;
  function themesHtml() {
    var groupes = groupesAffiches();
    return groupes.map(function (g) {
      // Un seul theme : son nom ferait doublon avec le titre « Competences professionnelles », il n'est pas affiche.
      var etiquette = (groupes.length > 1 && g.theme) ? '<div class="theme">' + ed(g.cleTheme || ('th:' + g.gi), g.theme) + '</div>' : '';
      // « Condensees » (retour Denis 2026-10-02) : le style des missions choisi pour les experiences vaut aussi pour les listes de competences ; les missions
      // se suivent, separees par le signe choisi (comme dans les experiences). Chaque mission reste corrigeable ; on les retire dans la carte Experiences.
      if (styleAction === 'condense') {
        var textes = g.items.map(function (it) {
          var src = (opts.sourceExperience && it.illustrePar && it.illustrePar.length) ? ' <span class="src">(' + it.illustrePar.map(_pdfEscaperHtml).join(', ') + ')</span>' : '';
          return ed(it.cle, it.texte) + src;
        });
        return etiquette + '<div class="meta" style="margin-top:2px">' + textes.join(_pdfEscaperHtml(_SIGNES_MISSIONS[signeMissions])) + (signeMissions === 'pointvirgule' ? '.' : '') + '</div>';
      }
      return etiquette + '<ul>' + g.items.map(function (it) {
        var src = (opts.sourceExperience && it.illustrePar && it.illustrePar.length)
          ? ' <span class="src">(' + it.illustrePar.map(_pdfEscaperHtml).join(', ') + ')</span>' : '';
        return '<li>' + ed(it.cle, it.texte) + src + '<button type="button" class="x" data-ret="' + _pdfEscaperHtml(it.texte) + '" title="Retirer">×</button></li>';
      }).join('') + '</ul>';
    }).join('');
  }
  // TACHE (retour Denis 2026-09-27) : titre distinct selon le mode -- "Competences en action" en Mixte (coexiste avec
  // blocPro(), voir plus haut), "Competences professionnelles" en Par competences (remplace entierement blocPro(), supprime).
  // TACHE (P10, retour Denis 2026-09-28 : "les experiences en mode mixte ont
  // un enorme espace vide... je veux que les competences soient identifiees
  // mais seront toujours sur deux colonnes" -- confirme ensuite : "non c'est
  // pas modifiable, toujours sur 2 colonnes") : en Mixte, "Competences en
  // action" passe TOUJOURS sur 2 colonnes -- jamais un reglage de
  // listesDeuxColonnes (qui reste, lui, un choix de la personne pour les
  // autres rubriques). Classe dediee (themes-2col) plutot que liste-2col,
  // qui attend des <div> (blocListe) et non des <ul>/<li> par theme.
  function blocThemes() {
    // Retour Denis 2026-10-03 : la rubrique des missions rangees par competence s'appelle « Competences en action » en « Par competences » comme en Mixte ;
    // « Competences professionnelles » ne designe plus que les mots-cles (pastilles), qui existent en Chronologique et en Mixte.
    var intitule = (modeMixteB || modeParCompC) ? _PDF_INTITULES.competencesEnAction : _PDF_INTITULES.competencesPro;
    var html = themesHtml();
    // Deux colonnes seulement quand la liste est assez longue pour les remplir (5 lignes ou plus) ; sinon pleine largeur, une ligne
    // par competence (retour Denis 2026-09-29 : le bloc n'occupait que la moitie gauche alors que la place existait).
    var nbLignes = groupesAffiches().reduce(function (t, g) { return t + g.items.length; }, 0);
    return sec(intitule, titreH2(intitule) + ((modeMixteB && nbLignes >= 5) ? '<div class="themes-2col">' + html + '</div>' : html));
  }
  // Les competences professionnelles de « Par competences » en PASTILLES (une par competence, toutes themes confondus), pour le haut du CV.
  function blocProMissionsEnPastilles() {
    var items = [];
    groupesAffiches().forEach(function (g) { g.items.forEach(function (it) { items.push(it); }); });
    if (!items.length) { return ''; }
    return encadre(sec(_PDF_INTITULES.competencesEnAction, titreH2(_PDF_INTITULES.competencesEnAction) + '<div>' + items.map(function (it) {
      return '<span class="pill ' + pill + '">' + ed(it.cle, it.texte) + '<button type="button" class="x" data-ret="' + _pdfEscaperHtml(it.texte) + '" title="Retirer">×</button></span>';
    }).join('') + '</div>'));
  }
  var actionCoteC = !!(modeParCompC && opts.actionCote === true && !themesEnHaut);
  function blocParCompetences(exps, ligneUnique) {
    // « A cote des comportementales » (retour Denis 2026-10-03) : le bloc est alors place sur la ligne des competences comportementales (voir blocs.comp), pas au-dessus des experiences.
    var themes = ((themesEnHaut && blocProMissionsEnPastilles()) || actionCoteC) ? '' : blocThemes();
    var histo = sec(_PDF_INTITULES.experience, titreH2(_PDF_INTITULES.experience) + exps.map(function (e) {
      var i = (e.__idxBrut !== undefined) ? e.__idxBrut : (objetCV.experiences || []).indexOf(e);
      if (ligneUnique) {
        var per = _pdfFormaterPeriode(e.dateDebut, e.dateFin, 'exp');
        return '<div class="item" data-exp="' + i + '"><b>' + ed('po:' + i, _pdfPosteAvecStage(e), function (x) { return _pdfSpanStylePartie(x, styleParties.poste); }) + '</b>' + ((e.entreprise || (afficherLieu && e.lieu)) ? ' - ' : '') + ed('en:' + i, e.entreprise || '', function (x) { return _pdfSpanStylePartie(x, styleParties.entreprise); }) + (e.entreprise ? lieuHtml(e) : lieuHtml(e).replace(/^, /, '')) + (per ? ' : ' + edDate('da:' + i, per) : '') + '</div>';
      }
      return '<div class="item" data-exp="' + i + '">' + ctl + enteteExp(e, i) + '</div>';
    }).join(''));
    return themes + histo;
  }
  function blocExperiences() {
    var exps = contenu.experiences || [];
    if (!exps.length) { return ''; }
    if (parComp && opts.modePresentation === 'C') { return blocParCompetences(exps, true); }
    var compact = !!(composition && composition.formatEssentiel);
    // Mixte (B) : le bloc des competences regroupees, puis les experiences chronologiques COMPLETES (missions comprises), sauf les
    // phrases deja montrees dans « Competences en action » : jamais deux fois la meme phrase (R13).
    var dejaEnAction = modeMixteB ? groupesAffiches().reduce(function (tous, g) { return tous.concat(g.items.map(function (it) { return it.texte; })); }, []) : null;
    return (parComp ? blocThemes() : '') + sec(_PDF_INTITULES.experience, titreH2(_PDF_INTITULES.experience, _PDF_INTITULES.experience) + exps.map(function (e) {
      var i = (e.__idxBrut !== undefined) ? e.__idxBrut : (objetCV.experiences || []).indexOf(e);
      if (compact) {
        var per = _pdfFormaterPeriode(e.dateDebut, e.dateFin, 'exp');
        return '<div class="item" data-exp="' + i + '"><b>' + ed('po:' + i, _pdfPosteAvecStage(e), function (x) { return _pdfSpanStylePartie(x, styleParties.poste); }) + '</b>' + ((e.entreprise || (afficherLieu && e.lieu)) ? ' - ' : '') + ed('en:' + i, e.entreprise || '', function (x) { return _pdfSpanStylePartie(x, styleParties.entreprise); }) + (e.entreprise ? lieuHtml(e) : lieuHtml(e).replace(/^, /, '')) + (per ? ' : ' + edDate('da:' + i, per) : '') + '</div>';
      }
      return '<div class="item" data-exp="' + i + '">' + ctl + enteteExp(e, i) + missionsHtml(e.missions, 'mi:' + i, dejaEnAction) + '</div>';
    }).join(''));
  }
  function styleTitreFormation(item) {
    // Titre des formations en gras par defaut, comme le poste des experiences et le titre de l'experience personnelle (retour Denis 2026-09-30 :
    // meme affichage dans les trois rubriques) ; la personne peut toujours le retirer (G). Une CERTIFICATION (une seule ligne, sans diplome ni
    // detail) reste en poids normal : quatre lignes entierement en gras faisaient un bloc lourd (retour Denis 2026-09-30) ; en gras seulement si la
    // personne l'a demande expressement.
    var estCertif = !!(item && item.__certifOriginale);
    var gras = estCertif ? (titreFormation.gras === true) : (titreFormation.gras !== false);
    return 'font-weight:' + (gras ? '700' : '400') + ';font-style:' + (titreFormation.italique ? 'italic' : 'normal') + ';text-decoration:' + (titreFormation.souligne ? 'underline' : 'none') + ';';
  }
  function blocForm() {
    var lst = contenu.formations || [];
    if (!lst.length) { return ''; }
    return blocFormSeules(lst);
  }
  // Style du lieu des formations (style commun seulement) : le lieu d'une formation suit « Style du lieu » des experiences (normal / italique / gris). Le texte reste modifiable d'un bloc
  // (« Modifier le texte ») : seul l'affichage entoure la partie « lieu » de sa mise en forme.
  function renduLieuFormation(f) {
    var aff = opts.formationAffiche || {};
    var lieu = (aff.lieu !== false) ? String(f.lieu || '') : '';
    if (!styleCommun || !lieu || lieuStyle === 'normal') { return undefined; }
    var lieuEchappe = _pdfEscaperHtml(lieu);
    return function (x) {
      var h = _pdfEscaperHtml(x), i = h.lastIndexOf(lieuEchappe);
      return (i === -1) ? h : h.slice(0, i) + '<span class="lieu lieu-' + lieuStyle + '">' + lieuEchappe + '</span>' + h.slice(i + lieuEchappe.length);
    };
  }
  function blocFormSeules(lst) {
    return sec(_PDF_INTITULES.formations, titreH2(_PDF_INTITULES.formations) + lst.map(function (f, fiPos) {
      var fi = _pdfIdxFormation(f, fiPos);
      var diplome = _pdfTexteDiplome(f);
      var detailsFormation = _pdfFormationDetails(f, opts.formationAffiche);
      var resteTexte = [detailsFormation.endroit, detailsFormation.annee].filter(Boolean).join(' - ');
      var missions = missionsFormationHtml(f, fi);
      if (posDatesForm) {
        var dAnnee = detailsFormation.annee ? ed('fa:' + fi, detailsFormation.annee) : '';
        var endroitF = detailsFormation.endroit ? ed('fr:' + fi, detailsFormation.endroit, renduLieuFormation(f)) : '';
        var titreF = '<span style="' + styleTitreFormation(f) + '">' + ed('fd:' + fi, diplome) + '</span>';
        var enLigneF = (endroitF && formLigne !== 'dessous') ? ' - ' + endroitF : '';
        var dessousF = (endroitF && formLigne === 'dessous');
        var corpsF = (posDatesForm === 'apres')
          ? '<div>' + titreF + enLigneF + (dAnnee ? ', ' + dAnnee : '') + '</div>' + (dessousF ? '<div class="meta">' + endroitF + '</div>' : '')
          : (posDatesForm === 'droite')
          ? '<div class="ligne"><span>' + titreF + enLigneF + '</span>' + (dAnnee ? '<span class="dates">' + dAnnee + '</span>' : '') + '</div>' + (dessousF ? '<div class="meta">' + endroitF + '</div>' : '')
          : (posDatesForm === 'sous')
            ? '<div>' + titreF + enLigneF + '</div>' + ((dAnnee || dessousF) ? '<div class="meta">' + (dessousF ? endroitF + (dAnnee ? ' : ' : '') : '') + dAnnee + '</div>' : '')
            : '<div>' + (dAnnee ? '<span class="dates" style="display:inline-block;min-width:74px">' + dAnnee + '</span>' : '') + titreF + enLigneF + '</div>' + (dessousF ? '<div class="meta">' + endroitF + '</div>' : '');
        return '<div class="item"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + corpsF + missions + '</div>';
      }
      return '<div class="item"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + '<div><span style="' + styleTitreFormation(f) + '">' + ed('fd:' + fi, diplome) + '</span>' + ((resteTexte && formLigne !== 'dessous') ? ' - ' + ed('fr:' + fi, resteTexte, renduLieuFormation(f)) : '') + '</div>' + ((resteTexte && formLigne === 'dessous') ? '<div class="meta">' + ed('fr:' + fi, resteTexte, renduLieuFormation(f)) + '</div>' : '') + missions + '</div>';
    }).join(''));
  }
  // TACHE (retour Denis 2026-09-28, point 12, chantier "Citer / Developper") : "Citer seulement"
  // -- une simple enumeration des titres, sur une ligne, jamais les missions -- au lieu du bloc
  // habituel titre+missions par entree. Meme rubrique, meme titre de section, seul le contenu
  // change. "Developper" (par defaut, zero regression) garde le comportement exact d'avant.
  // Reglages propres a l'experience personnelle (retour Denis 2026-10-02, carte « Experience personnelle ») : titre en gras / italique / souligne (opts.styleTitrePerso) et espace
  // entre les entrees (opts.espacementPerso). Sans choix, aucun style n'est ecrit : le rendu d'avant (titre suivant le style du poste des experiences) est inchange.
  var stPerso = styleCommun ? null : (opts.styleTitrePerso || null);
  var stylePersoTitre = stPerso ? ('font-weight:' + (stPerso.gras !== false ? '700' : '400') + ';font-style:' + (stPerso.italique ? 'italic' : 'normal') + ';text-decoration:' + (stPerso.souligne ? 'underline' : 'none') + ';') : '';
  var espPerso = (typeof opts.espacementPerso === 'number') ? (serre ? Math.min(opts.espacementPerso, 3) : opts.espacementPerso) : null;
  var attrItemPerso = (espPerso !== null) ? ' style="margin-bottom:' + espPerso + 'px' + (espPerso <= 0 ? ';line-height:1.15' : '') + '"' : '';
  function titrePersoHtml(cle, titre) {
    if (stylePersoTitre) { return '<span style="' + stylePersoTitre + '">' + ed(cle, titre) + '</span>'; }
    return '<b class="gras">' + ed(cle, titre, function (x) { return _pdfSpanStylePartie(x, styleParties.poste); }) + '</b>';
  }
  function blocEngagements() {
    var items = (contenu.experiencesPersonnelles || []).concat(contenu.engagements || []);
    if (!items.length) { return ''; }
    if (opts.expPersoModeAffichage !== 'developper') {   // defaut « Citer seulement » (decision Denis 2026-09-29)
      var titres = items.map(function (item) { return (typeof item === 'string') ? item : ((item && (item.intitule || item.texte)) || ''); }).filter(Boolean);
      if (!titres.length) { return ''; }
      // Retour Denis 2026-10-01 : « si on a les infos, il faut les afficher ». Une experience citee garde ses dates et son lieu quand ils sont connus
      // (une ligne par experience, « Bricolage (2019 - 2021, Limoges) ») ; sans aucune de ces informations, la liste reste sur une seule ligne, comme avant.
      var lignesCitees = items.map(function (item) { return _pdfPersoCiteeLigne(item); }).filter(function (l) { return l.titre; });
      if (lignesCitees.some(function (l) { return l.details; })) {
        return sec(_PDF_INTITULES.experiencePerso, titreH2(_PDF_INTITULES.experiencePerso) + lignesCitees.map(function (l, i) {
          return '<div class="item">' + ed('epc:' + i, l.titre + (l.details ? ' (' + l.details + ')' : '')) + '</div>';
        }).join(''));
      }
      return sec(_PDF_INTITULES.experiencePerso, titreH2(_PDF_INTITULES.experiencePerso) +
        '<div class="item">' + ed('ep:citer', titres.join(', ')) + '</div>');
    }
    return sec(_PDF_INTITULES.experiencePerso, titreH2(_PDF_INTITULES.experiencePerso) + items.map(function (item, pi) {
      if (typeof item === 'string') { return '<div class="item">' + ed('ep:' + pi, item) + '</div>'; }
      var titre = (item && (item.intitule || item.texte)) || '';
      var periode = _pdfFormaterPeriode(item && item.dateDebut, item && item.dateFin, 'perso');
      var detail = (item && item.detail) || '';
      if (posDatesPerso) {
        var dPe = periode ? edDate('dp:' + pi, periode) : '';
        var tPe = titrePersoHtml('ep:' + pi, titre);
        var cPe = (posDatesPerso === 'apres')
          ? '<div>' + tPe + (dPe ? ' ' + dPe : '') + '</div>'
          : (posDatesPerso === 'droite')
          ? '<div class="ligne"><span>' + tPe + '</span>' + (dPe ? '<span class="dates">' + dPe + '</span>' : '') + '</div>'
          : (posDatesPerso === 'sous')
            ? '<div>' + tPe + '</div>' + (dPe ? '<div class="meta">' + dPe + '</div>' : '')
            : '<div>' + (dPe ? '<span class="dates" style="display:inline-block;min-width:74px">' + dPe + '</span>' : '') + tPe + '</div>';
        return '<div class="item"' + attrItemPerso + '>' + cPe + _pdfPersoEndroitHtml(item) + (detail ? '<div class="meta">' + ed('ed:' + pi, detail) + '</div>' : '') + missionsHtml(item && item.missions, 'em:' + pi) + '</div>';
      }
      return '<div class="item"' + attrItemPerso + '><div>' + titrePersoHtml('ep:' + pi, titre) + (periode ? ' : ' + edDate('dp:' + pi, periode) : '') + '</div>' +
        _pdfPersoEndroitHtml(item) + (detail ? '<div class="meta">' + ed('ed:' + pi, detail) + '</div>' : '') + missionsHtml(item && item.missions, 'em:' + pi) + '</div>';
    }).join(''));
  }
  // Professionnelles a gauche, comportementales a droite (retour Denis 2026-10-03) : choix explicite (opts.proCompDispo = 'ligne' | 'sous'), sinon « Blocs courts ».
  function paireCompetences(a, b) {
    if (!a && !b) { return ''; }
    if (opts.proCompDispo === 'ligne') { return '<div class="paire"><div>' + a + '</div><div>' + b + '</div></div>'; }
    if (opts.proCompDispo === 'sous') { return '<div>' + a + '</div><div>' + b + '</div>'; }
    return paire(a, b);
  }
  function paire(a, b) {
    if (!a && !b) { return ''; }
    if (cote === 'cote') { return '<div class="paire"><div>' + a + '</div><div>' + b + '</div></div>'; }
    return '<div>' + a + '</div><div>' + b + '</div>';
  }

  // ---------- assemblage (composer() de la maquette) ----------
  var g = gabarit;
  var entetePale = (g === 'sobre-bandeau');
  var enteteFond = (g !== 'frise') && ((g === 'bandeau' || g === 'diagonale') || (bandeauCouleur && !entetePale));
  var pad = marge + 'mm';
  var classes = ['page-a4', 'cv'];
  if (allure === 'sobre') { classes.push('sobre'); }
  if (opts.titresAgrandis) { classes.push('agrandir'); }
  if (icones) { classes.push('ico'); }
  if (serre) { classes.push('serre'); }
  if (degr) { classes.push('degr'); }
  if (g === 'cadre') { classes.push('cadre'); }
  if (g === 'picto') { classes.push('picto'); }
  if (justifie) { classes.push('justif'); }
  if (titresPastille) { classes.push('titres-pastille'); }
  if (modeleApplication) { classes.push('modele-app'); }
  if (pilluleExp) { classes.push('pille'); }
  if (filetHaut) { classes.push('filet'); }
  if (cadrePage) { classes.push('cadre-page'); }
  if (colVague) { classes.push(colVagueDroite ? 'col-vague-d' : 'col-vague-g'); }
  if (nomVert) { classes.push('nom-vert'); }
  if (pleineHauteur && deux && !colVague) { classes.push('pleine'); }
  if (opts.separateurColonnes && deux) { classes.push('sepcol'); }
  if (!(petitsCarres && !iconesCoord)) { classes.push('sans-icoc'); }
  // Lot 4 : photo « medaillon » (ronde, a cheval sur le bord bas du bandeau) et photo en losange.
  var photoMed = !!(opts.photoMedaillon && photoUrl && enteteFond);
  var teteCls = 'tete' + (enteteFond ? ' tete-fond' : '') + (g === 'diagonale' ? ' tete-diag' : '') + ((enteteFond && enteteVague) ? ' tete-vague' : '') + (entetePale ? ' tete-pale' : '') + ((g === 'cadre' || enteteCentree) ? ' tete-centree' : '') +
    (entete2Colonnes ? ' tete-2c' : '') + ((enteteFond && (degradeBandeau === 'aucun' || degradeBandeau === 'uni')) ? ' tete-plat' : '') + ((enteteFond && degradeBandeau === 'clair-fonce') ? ' tete-inv' : '') + (photoMed ? ' tete-med' : '');
  var trait = (enteteFond || entetePale) ? '' : '<div class="trait" style="margin:0 ' + pad + ' 4px' + (allure === 'sobre' ? ';height:2px;background:var(--cv)' : '') + '"></div>';
  var photo = photoUrl ? '<img class="photo-mq' + (anneauPhoto ? ' anneau' : '') + (opts.photoForme === 'losange' ? ' photo-losange' : '') + (photoMed ? ' medaillon' : '') + '" src="' + _pdfEscaperHtml(photoUrl) + '" alt="Photo">' : '';
  var coordHtml = _pdfMqCoordonnees(objetCV, composition, opts, ed);
  var blocMetierAccroche = '<div class="metier">' + ed('metier', metier) + '</div>' + (accroche ? '<div class="accroche">' + ed('accroche', accroche) + '</div>' : '');
  var tete;
  var posE = ent.pos || {}, largE = ent.larg || {}, echE = ent.ech || {}, styE = ent.sty || {};
  var styBl = function (bl) {
    var st = styE[bl] || {}, o = '';
    if (st.c) { o += 'color:' + st.c + ';'; }
    if (st.g !== undefined) { o += 'font-weight:' + (st.g ? 700 : 400) + ';'; }
    if (st.i !== undefined) { o += 'font-style:' + (st.i ? 'italic' : 'normal') + ';'; }
    if (st.il) { o += 'line-height:' + st.il + ';'; }   // interligne du bloc (retour Denis 2026-10-01 : taille ET interligne partout)
    return o;
  };
  var attrBl = function (bl) { return ' data-bl="' + bl + '" style="--k:' + (echE[bl] || 1) + ';' + styBl(bl) + '"'; };
  if (enteteLibre) {
    // En-tete LIBRE (plein ecran, « Regler l'en-tete ») : quatre blocs (nom, coordonnees, titre du CV, accroche) que la
    // personne deplace, elargit et stylise un par un. Port de teteLibreHtml() de la maquette ; positions en % de la
    // largeur (x, largeur) et en px (y).
    var disp = ent.disp || (String(metier).length > 42 ? '2' : '3');
    var d2 = (disp === '2');
    var mpx = Math.round(marge * 3.78), mx = Math.round(mpx / 794 * 1000) / 10;
    var r1 = function (v) { return Math.round(v * 10) / 10; };
    var xt = photoMed ? r1(32 / 210 * 100) : mx;
    var xm3 = (colVague && !colVagueDroite) ? r1(colVagueMm / 210 * 100 + 1.5) : 35.5;
    var defs = (g === 'frise') ? { nom: { x: 31, y: 0, w: 48 }, coord: { x: 31, y: 34, w: 41 }, metier: { x: 31, y: 122, w: 55 }, accroche: { x: 31, y: 154, w: 59 } } : {
      nom: { x: xt, y: mpx, w: r1(Math.min(30, 35 - xt)) },
      coord: { x: xt, y: mpx + 30, w: r1(Math.min(30, 35 - xt)) },
      metier: d2 ? { x: 55, y: mpx, w: r1(Math.min(40, 100 - mx - 55)) } : { x: xm3, y: mpx + 6, w: r1(Math.min(25, 61.5 - xm3)) },
      accroche: d2 ? { x: 55, y: mpx + 52, w: r1(Math.min(40, 100 - mx - 55)) } : { x: 62, y: mpx, w: r1(Math.min(33, 100 - mx - 62)) }
    };
    var blc = function (bl, inner) {
      var d = defs[bl], pp = posE[bl] || d, w = largE[bl] || d.w;
      return '<div class="blc" data-bl="' + bl + '" style="left:' + pp.x + '%;top:' + pp.y + 'px;width:' + w + '%;--k:' + (echE[bl] || 1) + '">' + inner +
        '<span class="poi-l" title="Tirer pour élargir ou rétrécir : la phrase passe sur plus ou moins de lignes"></span></div>';
    };
    var haut = ent.haut || ((g === 'frise') ? (235 + (accroche ? 0 : -80)) : ((g === 'diagonale' ? 225 : 172) + (d2 ? 32 : 0)));
    tete = '<div class="' + teteCls + ' libre' + (g === 'frise' ? ' large' : '') + '" style="height:' + haut + 'px" data-h0="' + haut + '" data-disp="' + disp + '" data-posc="' + (posE.coord ? 1 : 0) + '" data-posa="' + (posE.accroche ? 1 : 0) + '" data-hfixe="' + (ent.haut ? 1 : 0) + '">' +
      (photoMed ? photo : '') + blc('nom', ((g === 'frise' || photoMed) ? '' : photo) + '<div class="nom" style="' + styBl('nom') + '">' + (nomVert ? '' : ed('nom', nomComplet)) + '</div>') +
      blc('coord', '<div class="coord" style="' + styBl('coord') + '">' + coordHtml + '</div>') +
      blc('metier', '<div class="metier" style="' + styBl('metier') + '">' + ed('metier', metier) + '</div>') +
      (accroche ? blc('accroche', '<div class="accroche" style="' + styBl('accroche') + '">' + ed('accroche', accroche) + '</div>') : '') +
      '<span class="poi-h" title="Tirer pour changer la hauteur de l’en-tête"></span></div>' + (g === 'frise' ? '' : trait +
      (bandeauCles ? '<div class="bande-cles" style="margin:6px ' + pad + ' 0">' + pills(competencesCles) + '</div>' : ''));
  } else {
    tete = '<div class="' + teteCls + '" style="padding:' + pad + ' ' + pad + ' 9px' + (colVague ? ';grid-template-columns:' + (colVagueDroite ? '1.15fr 1fr ' + r2(colVagueMm - marge - 3.5) + 'mm' : r2(colVagueMm - marge - 3.5) + 'mm 1fr 1.3fr') : '') + '">' +
    (photoMed ? photo : '') + '<div>' + (photoMed ? '' : photo) + '<div class="nom">' + (nomVert ? '' : ed('nom', nomComplet)) + '</div>' + (coordonneesAPart ? '' : '<div class="coord">' + coordHtml + '</div>') + '</div>' +
    blocMetierAccroche + '</div>' + trait +
    (coordonneesAPart ? '<div class="bande-coord" style="margin:0 ' + pad + '">' + coordHtml.replace(/<div>/g, '<span>').replace(/<\/div>/g, '</span>') + '</div>' : '') +
    (bandeauCles ? '<div class="bande-cles" style="margin:6px ' + pad + ' 0">' + pills(competencesCles) + '</div>' : '');
  }

  // ---------- « Colonne et frise » (composerFrise() de la maquette) ----------
  // Colonne laterale (coordonnees, atouts, informatique, langues, certifications, centres d'interet) + colonne principale (en-tete,
  // competences, experiences et formations sur une frise). En-tete libre et plein ecran = ceux des autres modeles de la maquette.
  var parCompR = parComp;
  var languesTxtR = function (l) { return (l || []).map(function (x) { return (x && x.langue) ? (x.langue + (x.niveau ? ' (' + x.niveau + ')' : '')) : String(x); }); };
  // ---------- « Rectangles arrondis » (modele du CV de stage de Denis, 2026-09-25) : nom et titre dans des rectangles pleins, coordonnees et
  // accroche dans des rectangles a contour, barres de rubrique pleines, competences en trois rectangles qui se chevauchent
  // (savoir-faire, savoir-etre, savoirs), experiences et formations en lignes datees, centres d'interet en losanges.
  if (g === 'rectangles' || g === 'sobre-rectangles') {
    var sobreR = (g === 'sobre-rectangles');
    var srR = function (l) { return l.filter(function (x) { return retirees.indexOf(x) === -1; }); };
    var escR = _pdfEscaperHtml;
    var savoirsR = srR(versTextes((objetCV.competences && objetCV.competences.savoirs) || []));
    // Denis, 2026-09-29 (« Rectangles arrondis ») : style des PUCES et nombre de COLONNES choisis rectangle par rectangle (styE[bl].pu / .co, panneau du rectangle) ;
    // sans choix, on garde le reglage global « sur 2 colonnes » de la carte des rubriques.
    var listeR = function (liste, prefixe, titre, bl) {
      var stR = (bl && styE[bl]) || {};
      var deuxR = stR.co === 2 || (stR.co !== 1 && (opts.listesDeuxColonnes || []).indexOf(titre) !== -1);
      return '<ul class="rc-fl' + (deuxR ? ' rc-2col' : '') + (stR.pu ? ' rc-pu-' + stR.pu : '') + '">' + liste.map(function (x) { return '<li>' + ed(prefixe + x, x) + '</li>'; }).join('') + '</ul>'; };
    // TACHE (J4, 2026-09-28) : data-rub ajoute ici (pur additif, ne change rien au rendu visuel) --
    // seul moyen d'identifier UNE rubrique cliquee pour le retrait, meme mecanisme que h2[data-rub]
    // ailleurs dans ce fichier (_pdfMqTitreH2) : jamais un intitule ecrit en dur, jamais 2 conventions.
    var barreR = function (t, ico) { return '<div class="rc-barre" data-rub="' + escR(t) + '">' + ((ico && icones) ? '<span class="rc-ico">' + _pdfIconeSvg(ico) + '</span>' : '') + escR(_pdfLibelle(t)) + '</div>'; };
    var faireR = srR(competencesPro), etreR = srR(competencesComp);
    // Chaque rectangle porte son petit titre (les memes intitules que partout) ; la barre s'appelle « Competences ».
    var titreBoite = function (t) { return '<div class="rc-boxt">' + escR(_pdfLibelle(t)) + '</div>'; };
    var blocsCompR = ((faireR.length && !parCompR) ? '<div class="rc-box rc-b1" data-rub="' + escR(_PDF_INTITULES.competencesPro) + '">' + titreBoite(_PDF_INTITULES.competencesPro) + listeR(faireR, 'k:', _PDF_INTITULES.competencesPro, 'b1') + '</div>' : '') +
      (etreR.length ? '<div class="rc-box rc-b2" data-rub="' + escR(_PDF_INTITULES.competencesComp) + '">' + titreBoite(_PDF_INTITULES.competencesComp) + listeR(etreR, 'k:', _PDF_INTITULES.competencesComp, 'b2') + '</div>' : '') +
      (savoirsR.length ? '<div class="rc-box rc-b3" data-rub="' + escR(_PDF_INTITULES.savoirs) + '">' + titreBoite(_PDF_INTITULES.savoirs) + listeR(savoirsR, 'sv:', _PDF_INTITULES.savoirs, 'b3') + '</div>' : '');
    // ----- Disposition LIBRE (plein ecran, « Regler l'en-tete et les rectangles ») : les quatre blocs de l'en-tete et les trois rectangles de competences se
    // deplacent, s'elargissent et se stylisent un par un, comme l'en-tete libre des autres modeles (memes gestes, memes cadres rouges).
    // Positions en % de la largeur (x, largeur) et en px (y).
    var defsR = { nom: { x: 0, y: 0, w: 40 }, coord: { x: 0, y: 44, w: 40 }, metier: { x: 46, y: 0, w: 54 }, accroche: { x: 46, y: 46, w: 54 } };
    var poiL = '<span class="poi-l" title="Tirer pour élargir ou rétrécir"></span>';
    var blcR = function (bl, inner, z, extra) {
      var dd = defsR[bl] || defsB[bl], pp = posE[bl] || dd, w = largE[bl] || dd.w;
      return '<div class="blc" data-bl="' + bl + '" style="left:' + pp.x + '%;top:' + pp.y + 'px;width:' + w + '%;--k:' + (echE[bl] || 1) + (z ? ';z-index:' + z : '') + '">' + inner + poiL + (extra || '') + '</div>';
    };
    var poiB = '<span class="poi-b" title="Tirer pour changer la hauteur de ce rectangle"></span>';
    var hautBlE = ent.hautBl || {};
    var defsB = { b1: { x: 0, y: 0, w: 62 }, b2: { x: 48, y: 28, w: 52 }, b3: { x: 12, y: 0, w: 66 } };
    var hautR = ent.haut || (accroche ? 150 : 110);
    var teteR = '<div class="tete libre rc-tete" style="height:' + hautR + 'px" data-h0="' + hautR + '" data-disp="2" data-posc="' + (posE.coord ? 1 : 0) + '" data-posa="' + (posE.accroche ? 1 : 0) + '" data-hfixe="' + (ent.haut ? 1 : 0) + '">' +
      blcR('nom', '<div class="rc-plein rc-nom" style="width:100%;' + styBl('nom') + '">' + ed('nom', nomComplet) + '</div>') +
      blcR('coord', '<div class="rc-contour rc-coord" style="margin-top:0"><div class="coord" style="' + styBl('coord') + '">' + coordHtml + '</div></div>') +
      blcR('metier', '<div class="rc-plein rc-metier" style="width:100%;' + styBl('metier') + '">' + ed('metier', metier) + '</div>') +
      (accroche ? blcR('accroche', '<div class="rc-contour rc-accroche" style="margin:0;' + styBl('accroche') + '">' + ed('accroche', accroche) + '</div>') : '') +
      '<span class="poi-h" title="Tirer pour changer la hauteur de l’en-tête"></span></div>';
    var boiteLibre = function (bl, cls, titre, liste, prefixe, z) {
      // Hauteur choisie par la personne = hauteur MINIMALE : le rectangle grandit tout seul si son texte en a besoin (jamais de texte coupe).
      return blcR(bl, '<div class="rc-box ' + cls + '" data-rub="' + escR(titre) + '" style="' + (hautBlE[bl] ? 'min-height:' + hautBlE[bl] + 'px;' : '') + styBl(bl) + '">' + titreBoite(titre) + listeR(liste, prefixe, titre, bl) + '</div>', z, poiB);
    };
    // TACHE (P11, audit "La mise en page" 2026-09-28, retour Denis : "pouvoir poser
    // rectangle sur rectangle mais sans cacher le texte -- il faut rajouter quel
    // est le plan, 1er, 2e ou 3e") : z-index choisi par la personne (ent.plan[bl],
    // plein ecran de la maquette) -- reprend le rang naturel (b1=1, b2=2, b3=3) tant
    // qu'elle n'a jamais touche ce reglage, zero regression.
    var planE = ent.plan || {};
    var boxesLibre = ((faireR.length && !parCompR) ? boiteLibre('b1', 'rc-b1', _PDF_INTITULES.competencesPro, faireR, 'k:', planE.b1 || 1) : '') +
      (etreR.length ? boiteLibre('b2', 'rc-b2', _PDF_INTITULES.competencesComp, etreR, 'k:', planE.b2 || 2) : '') +
      (savoirsR.length ? boiteLibre('b3', 'rc-b3', _PDF_INTITULES.savoirs, savoirsR, 'sv:', planE.b3 || 3) : '');
    var hautB = ent.hautB || 200;
    var zoneBoxesLibre = boxesLibre ? '<div class="rc-boxes libre" style="height:' + hautB + 'px" data-h0="' + hautB + '" data-posb3="' + (posE.b3 ? 1 : 0) + '" data-posb2="' + ((posE.b2 || largE.b2) ? 1 : 0) + '" data-hfixe="' + (ent.hautB ? 1 : 0) + '">' + boxesLibre +
      '<span class="poi-h" title="Tirer pour changer la hauteur de la zone des rectangles"></span></div>' : '';
    var expR = (contenu.experiences || []).map(function (e) {
      var i = (e.__idxBrut !== undefined) ? e.__idxBrut : (objetCV.experiences || []).indexOf(e);
      var per = _pdfFormaterPeriode(e.dateDebut, e.dateFin, 'exp');
      var lieuR = (afficherLieu && e.lieu) ? ' - <span class="lieu lieu-' + lieuStyle + '">' + escR(e.lieu) + '</span>' : '';
      var dR = per ? edDate('da:' + i, per) : '';
      var pR = '<b>' + ed('po:' + i, _pdfPosteAvecStage(e), function (x) { return _pdfSpanStylePartie(x, styleParties.poste); }) + '</b>' +
        (e.entreprise ? ' - ' + ed('en:' + i, e.entreprise, function (x) { return _pdfSpanStylePartie(x, styleParties.entreprise); }) : '') + lieuR;
      var ligneR = (positionDates === 'droite') ? '<div class="rc-ligne rc-flex"><span>' + pR + '</span>' + (dR ? '<span class="rc-date">' + dR + '</span>' : '') + '</div>'
        : (positionDates === 'sous') ? '<div class="rc-ligne">' + pR + '</div>' + (dR ? '<div class="rc-ligne rc-sous"><span class="rc-date">' + dR + '</span></div>' : '')
        : '<div class="rc-ligne"><span class="rc-date">' + dR + ' :</span> ' + pR + '</div>';
      return '<div class="fr-item rc-item" data-exp="' + i + '">' + ctl + ligneR +
        (sansMissionsFr ? '' : missionsHtml(e.missions, 'mi:' + i)) + '</div>';
    }).join('');
    var formR = (contenu.formations || []).map(function (f, fiPos) {
      var fi = _pdfIdxFormation(f, fiPos);
      var diplome = _pdfTexteDiplome(f);
      var det = _pdfFormationDetails(f, opts.formationAffiche);
      var missionsF = missionsFormationHtml(f, fi);
      if (posDatesForm === 'droite' || posDatesForm === 'sous') {
        var dRF = det.annee ? ed('fa:' + fi, det.annee) : '';
        var tRF = '<span style="' + styleTitreFormation(f) + '">' + ed('fd:' + fi, diplome) + '</span>';
        var eRF = det.endroit ? ed('fr:' + fi, det.endroit) : '';
        var enLigneRF = (eRF && formLigne !== 'dessous') ? ' - ' + eRF : '';
        var dessousRF = (eRF && formLigne === 'dessous');
        var ligneRF = (posDatesForm === 'droite')
          ? '<div class="rc-ligne rc-flex"><span>' + tRF + enLigneRF + '</span>' + (dRF ? '<span class="rc-date">' + dRF + '</span>' : '') + '</div>' + (dessousRF ? '<div class="rc-ligne rc-sous">' + eRF + '</div>' : '')
          : '<div class="rc-ligne">' + tRF + enLigneRF + '</div>' + ((dRF || dessousRF) ? '<div class="rc-ligne rc-sous">' + (dessousRF ? eRF + (dRF ? ' : ' : '') : '') + '<span class="rc-date">' + dRF + '</span></div>' : '');
        return '<div class="rc-item"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + ligneRF + missionsF + '</div>';
      }
      return '<div class="rc-item"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + '<div class="rc-ligne">' + (det.annee ? '<span class="rc-date">' + ed('fa:' + fi, det.annee) + ' :</span> ' : '') +
        '<span style="' + styleTitreFormation(f) + '">' + ed('fd:' + fi, diplome) + '</span>' + ((det.endroit && formLigne !== 'dessous') ? ' - ' + ed('fr:' + fi, det.endroit) : '') + '</div>' + ((det.endroit && formLigne === 'dessous') ? '<div class="rc-ligne rc-sous">' + ed('fr:' + fi, det.endroit) + '</div>' : '') + missionsF + '</div>';
    }).join('');
    var lgR = languesTxtR(contenu.langues);
    // Chaque rubrique a sa propre barre (elles n'etaient plus melangees sous « Centres d'interet »).
    var loisirsR = (contenu.loisirs || []).map(_pdfPremiereMajuscule);
    // Listes courtes (logiciels, langues, certifications, centres d'interet, informations) : sur DEUX colonnes quand la personne le demande (ou
    // que le bouton « Mise en page » le propose) pour gagner de la place ; chaque rubrique porte son data-rub (mesure des suggestions).
    var deuxColR = function (titre) { return (opts.listesDeuxColonnes || []).indexOf(titre) !== -1 ? ' rc-2col' : ''; };
    // sec() : chaque rubrique est une « rubrique reglable » (.rub-sec) : taille, interligne, espace et DEPLACEMENT a la souris dans le grand apercu (retour Denis 2026-10-01).
    var listeLosanges = function (titre, items) {
      return (items && items.length) ? sec(titre, barreR(titre, ({ 'Logiciels et outils': 'competences', 'Langues': 'langues', 'Certifications': 'certifications', 'Informations complémentaires': 'infos' })[titre] || null) +
        '<ul class="rc-lo' + deuxColR(titre) + '">' + items.map(function (x, k) { return '<li>' + ed('li:' + titre + ':' + k, x) + '</li>'; }).join('') + '</ul>') : '';
    };
    var persoR = (contenu.experiencesPersonnelles || []).concat(contenu.engagements || []).map(function (item) { var l = _pdfPersoCiteeLigne(item); return l.titre ? (l.titre + (l.details ? ' (' + l.details + ')' : '')) : ''; }).filter(Boolean);
    var secExpR = expR ? barreR(_PDF_INTITULES.experience, 'experience') + '<div class="rc-lignes">' + expR + '</div>' : '';
    var secFormR = formR ? barreR(_PDF_INTITULES.formations, 'formations') + '<div class="rc-lignes">' + formR + '</div>' : '';
    // Le bas du CV (experiences, formations, rubriques courtes) est compose en LIGNES de 1 a 3 rubriques, comme les autres modeles a une colonne : la personne peut
    // deplacer toutes ces rubriques a la souris et en mettre deux ou trois sur la meme ligne (retour Denis 2026-10-01 : « je ne dois pas etre limite »).
    // L'ordre de depart est celui d'avant (experiences, formations, certifications, experience personnelle, logiciels, langues, centres d'interet, informations).
    var rubR = {
      exp: function () { return secExpR ? sec(_PDF_INTITULES.experience, secExpR) : ''; },
      form: function () { return secFormR ? sec(_PDF_INTITULES.formations, secFormR) : ''; },
      certifs: function () { return listeLosanges(_PDF_INTITULES.certifications, contenu.certifications); },
      perso: function () { return persoR.length ? sec(_PDF_INTITULES.experiencePerso, barreR(_PDF_INTITULES.experiencePerso, 'engagements') + '<ul class="rc-lo">' + persoR.map(function (x, k) { return '<li>' + ed('ep:' + k, x) + '</li>'; }).join('') + '</ul>') : ''; },
      logi: function () { return listeLosanges(_PDF_INTITULES.logiciels, contenu.logiciels); },
      langues: function () { return listeLosanges(_PDF_INTITULES.langues, lgR); },
      centres: function () { return loisirsR.length ? sec(_PDF_INTITULES.loisirs, barreR(_PDF_INTITULES.loisirs, 'loisirs') + '<ul class="rc-lo' + deuxColR(_PDF_INTITULES.loisirs) + '">' + loisirsR.map(function (x, k) { return '<li>' + ed('li:Centres d’intérêt:' + k, x) + '</li>'; }).join('') + '</ul>') : ''; },
      infos: function () { return listeLosanges(_PDF_INTITULES.infos, infosCompAff); }
    };
    var corpsLignesR = function () {
      var lignesR = (formAvant ? ['form', 'exp'] : ['exp', 'form']).concat(['certifs', 'perso', 'logi', 'langues', 'centres', 'infos']).map(function (k) { return [k]; });
      if (perso && Array.isArray(opts.lignesUneColonne) && opts.lignesUneColonne.length) {
        var vusR = {}; lignesR = [];
        opts.lignesUneColonne.forEach(function (l) {
          var ks = (l || []).filter(function (k) { return rubR[k] && !vusR[k]; });
          ks.forEach(function (k) { vusR[k] = true; });
          if (ks.length) { lignesR.push(ks.slice(0, 3)); }
        });
        ['exp', 'form', 'certifs', 'perso', 'logi', 'langues', 'centres', 'infos'].forEach(function (k) { if (!vusR[k]) { vusR[k] = true; lignesR.push([k]); } });
      }
      return '<div class="corps">' + lignesR.map(function (ks) {
        var ksExp = (ks.length === 2 && ks.indexOf('exp') !== -1);
        if (ksExp) { ks = ['exp', ks[0] === 'exp' ? ks[1] : ks[0]]; }   // l'experience a gauche, sur 60 % de la ligne
        var htmls = ks.map(function (k) { return rubR[k](); }).filter(Boolean);
        if (!htmls.length) { return ''; }
        var contenuLigne = htmls.length === 1 ? htmls[0] : '<div class="paire' + (htmls.length === 3 ? ' trois' : '') + '"' + ((ksExp && htmls.length === 2) ? ' style="grid-template-columns:3fr 2fr"' : '') + '>' + htmls.map(function (h) { return '<div>' + h + '</div>'; }).join('') + '</div>';
        return '<div class="rub-l rub-' + ks[0] + '">' + contenuLigne + '</div>';
      }).join('') + '</div>';
    };
    var corpsR =
      (enteteLibre ? teteR : (      '<div class="rc-haut">' +
        '<div class="rc-col"><div class="rc-plein rc-nom"' + attrBl('nom') + '>' + ed('nom', nomComplet) + '</div>' +
        '<div class="rc-contour rc-coord"><div class="coord"' + attrBl('coord') + '>' + coordHtml + '</div></div></div>' +
        '<div class="rc-col rc-col-d"><div class="rc-plein rc-metier"' + attrBl('metier') + '>' + ed('metier', metier) + '</div>' +
        (accroche ? '<div class="rc-contour rc-accroche"' + attrBl('accroche') + '>' + ed('accroche', accroche) + '</div>' : '') + '</div>' +
      '</div>')) +
      (blocsCompR ? barreR(_PDF_INTITULES.competences, 'competences') + (enteteLibre ? zoneBoxesLibre : '<div class="rc-boxes">' + blocsCompR + '</div>') : '') +
      (parCompR ? barreR(_PDF_INTITULES.competencesEnAction, 'competences') + themesHtml() : '') +
      corpsLignesR();
    var cssR =
'  :root { --kh: ' + kh + '; --cv: ' + (sobreR ? 'color-mix(in srgb, ' + couleur + ' 40%, #20262e)' : couleur) + '; --tt: ' + tailleTitres + 'px; }' +
'  * { box-sizing: border-box; }' +
'  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }' +
'  .page-a4.cv { position: relative; width: 210mm; min-height: 297mm; margin: 24px auto; background: #fff; color: #1c2430; box-shadow: 0 2px 10px rgba(0,0,0,.18); font-family: ' + police + '; font-size: ' + tailleTexte.toFixed(2) + 'px; line-height: ' + interligne.toFixed(3) + '; padding: ' + pad + '; }' +
'  .cv-rect .rc-haut { display: grid; grid-template-columns: 1fr 1.25fr; gap: 14px 24px; align-items: start; margin-bottom: 14px; }' +
'  .cv-rect .rc-plein { background: var(--cv); color: #fff; font-weight: 700; text-align: center; border-radius: 12px; padding: 6px 12px; }' +
'  .cv-rect .rc-contour { border: 1.5px solid var(--cv); border-radius: 16px; padding: 10px 14px; margin-top: 12px; }' +
'  .cv-rect .rc-nom { font-size: calc(17px * var(--k, 1) * var(--kh, 1)); width: 78%; }' +
'  .cv-rect .rc-metier { font-size: calc(15px * var(--k, 1) * var(--kh, 1)); }' +
'  .cv-rect .rc-col-d .rc-contour { margin-left: 4%; margin-right: 4%; text-align: center; }' +
'  .cv-rect .rc-accroche { font-size: calc(12.5px * var(--k, 1) * var(--kh, 1)); }' +
'  .cv-rect .coord { font-size: calc(12px * var(--k, 1) * var(--kh, 1)); line-height: 1.55; word-break: break-word; }' +
'  .cv .coord div::before { content: ""; display: inline-block; width: 9px; height: 9px; margin-right: 6px; border-radius: 2px; background: var(--cv); opacity: .8; }' +
'  .cv.sans-icoc .coord div::before { display: none; }' +
'  .cv .icone-ligne { width: 0.85em; height: 0.85em; vertical-align: -0.1em; margin-right: 0.32em; flex-shrink: 0; }' +
'  .cv-rect .rc-ico .icone-ligne { width: 1.1em; height: 1.1em; margin: 0 8px 0 0; vertical-align: -0.2em; }' +
'  .cv-rect.agrandir .rc-barre { font-size: calc(var(--tt, 13px) * 1.27 * 1.2); }' +
'  .cv-rect.justif .rc-item li, .cv-rect.justif .rc-accroche { text-align: justify; }' +
'  .cv-rect .rc-barre { background: var(--cv); color: #fff; font-weight: 700; text-align: center; font-size: calc(var(--tt, 13px) * 1.2); border-radius: 12px; padding: 5px 12px; margin: ' + Math.max(8, Math.round(16 * esp * multParas)) + 'px 0 ' + Math.max(6, Math.round(12 * esp)) + 'px; }' +
'  .cv-rect .rc-boxes { display: grid; grid-template-columns: 100%; padding: 4px 0 6px; }' +
'  .cv-rect .paire { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }' +
'  .cv-rect .paire.trois { grid-template-columns: 1fr 1fr 1fr; gap: 14px; }' +
'  .cv-rect .paire > div, .cv-rect .rub-sec { min-width: 0; }' +
'  .cv-rect .rc-box { background: #fff; border: 1.5px solid var(--cv); border-radius: 18px; padding: 10px 16px 10px 14px; position: relative; }' +
'  .cv-rect .rc-b1 { grid-column: 1; grid-row: 1; width: 62%; justify-self: start; align-self: start; z-index: 1; }' +
'  .cv-rect .rc-b2 { grid-column: 1; grid-row: 1; width: 52%; justify-self: end; align-self: start; margin-top: 28px; z-index: 2; }' +
'  .cv-rect .rc-b3 { grid-column: 1; grid-row: 2; width: 66%; justify-self: start; margin-left: 12%; margin-top: -16px; z-index: 3; }' +
'  .cv-rect .rc-b1:only-child, .cv-rect .rc-b2:only-child, .cv-rect .rc-b3:only-child { grid-row: auto; margin: 0; }' +
'  .cv-rect .rc-boxt { font-weight: 700; font-size: .92em; color: var(--cv); margin-bottom: 3px; }' +
'  .cv-rect .rc-fl { list-style: none; margin: 0; padding: 0; }' +
'  .cv-rect .rc-fl li { padding-left: 22px; text-indent: -22px; margin-bottom: 1px; }' +
'  .cv-rect .rc-fl li::before { content: "\\27A2"; display: inline-block; width: 22px; text-indent: 0; padding-left: 4px; }' +
'  .cv-rect .rc-lignes { padding: 0 4px; }' +
'  .cv-rect .rc-item { margin-bottom: ' + Math.max(2, Math.round(5 * esp * multParas)) + 'px; position: relative; }' +
'  .cv-rect .rc-date { font-weight: 400; }' +
'  .cv-rect .rc-flex { display: flex; justify-content: space-between; gap: 12px; }' +
'  .cv-rect .rc-flex .rc-date { white-space: nowrap; }' +
'  .cv-rect .rc-sous { font-size: .92em; }' +
'  .cv-rect .rc-item ul { margin: 2px 0 0 0; padding-left: 28px; font-size: .92em; }' +
'  .cv-rect .rc-lo { list-style: none; margin: 0; padding: 0 4px; }' +
'  .cv-rect .rc-lo li { padding-left: 24px; text-indent: -24px; margin-bottom: 3px; }' +
'  .cv-rect .rc-lo li::before { content: "\\2756"; display: inline-block; width: 24px; text-indent: 0; padding-left: 6px; }' +
'  .cv-rect .rc-lo.rc-2col, .cv-rect .rc-fl.rc-2col { column-count: 2; column-gap: 14px; }' +
'  .cv-rect .rc-fl.rc-2col li { break-inside: avoid; }' +
'  .cv-rect .rc-fl.rc-pu-rond li::before { content: "\\25CF"; }' +
'  .cv-rect .rc-fl.rc-pu-carre li::before { content: "\\25A0"; }' +
'  .cv-rect .rc-fl.rc-pu-coche li::before { content: "\\2713"; }' +
'  .cv-rect .rc-fl.rc-pu-losange li::before { content: "\\25C6"; }' +
'  .cv-rect .rc-fl.rc-pu-aucune li { padding-left: 0; text-indent: 0; }' +
'  .cv-rect .rc-fl.rc-pu-aucune li::before { content: none; display: none; }' +
'  .cv-rect .rc-lo.rc-2col li { break-inside: avoid; }' +
'  .cv .theme { font-weight: 700; margin: 6px 0 1px; }' +
'  .cv .src { color: #4b5866; font-size: .88em; }' +
'  .cv .meta { color: #4b5866; }' +
'  .cv b, .cv .gras { font-weight: 700; }' +
'  .cv .lieu-italique { font-style: italic; }' +
'  .cv .lieu-gris { color: #6b7684; }' +
'  .cv .ctl-exp { position: absolute; right: -2px; top: -3px; display: none; gap: 2px; z-index: 4; }' +
'  .cv .pill .x, .cv li .x { display: none; }' +
(enteteLibre ? '  .cv .tete.libre { display: block; position: relative; padding: 0 !important; }' +
'  .cv-rect .tete.libre { margin-bottom: 14px; }' +
'  .cv .tete.libre > .blc, .cv-rect .rc-boxes.libre > .blc { position: absolute; }' +
'  .cv-rect .rc-boxes.libre { display: block; position: relative; padding: 0; margin-bottom: 8px; }' +
'  .cv-rect .rc-boxes.libre .rc-box { width: 100%; margin: 0; }' +
'  .cv-rect .tete.libre .rc-nom, .cv-rect .tete.libre .rc-metier { width: 100%; }' +
'  .cv .poi-l, .cv .poi-h { display: none; position: absolute; z-index: 6; touch-action: none; }' +
'  .cv .poi-l { top: 0; right: -16px; bottom: 0; width: 32px; cursor: ew-resize; border-radius: 8px; }' +
'  .cv .poi-l::after { content: ""; position: absolute; top: 50%; right: 11px; transform: translateY(-50%); width: 7px; height: 44px; border-radius: 4px; background: #5d6875; box-shadow: 0 0 0 2px #fff; }' +
'  .cv .poi-h { left: 0; right: 0; bottom: -16px; height: 32px; cursor: ns-resize; border-radius: 8px; }' +
'  .cv .poi-h::after { content: ""; position: absolute; left: 50%; bottom: 11px; transform: translateX(-50%); height: 7px; width: 56px; border-radius: 4px; background: #5d6875; box-shadow: 0 0 0 2px #fff; }' +
'  .cv .poi-l:hover, .cv .poi-h:hover { background: rgba(31,90,168,.12); }' +
'  .cv .poi-l:hover::after, .cv .poi-h:hover::after, .cv .poi-l:active::after, .cv .poi-h:active::after { background: #1f5aa8; }' +
'  .cv .poi-b { display: none; position: absolute; left: 0; right: 0; bottom: -14px; height: 28px; z-index: 6; cursor: ns-resize; border-radius: 8px; touch-action: none; }' +
'  .cv .poi-b::after { content: ""; position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); height: 7px; width: 44px; border-radius: 4px; background: #5d6875; box-shadow: 0 0 0 2px #fff; }' +
'  .cv .poi-b:hover::after, .cv .poi-b:active::after { background: #1f5aa8; }' +
'  @media print { .cv .poi-l, .cv .poi-h, .cv .poi-b { display: none !important; } .cv [data-bl] { outline: none !important; background: none !important; } }' : '') +
(sobreR ? '  .cv-rect.sobre .rc-plein { background: transparent; color: var(--cv); border: 1.5px solid var(--cv); }' +
'  .cv-rect.sobre .rc-barre { background: transparent; color: var(--cv); text-align: left; border-radius: 0; padding: 2px 2px 3px; border-bottom: 1.5px solid var(--cv); }' +
'  .cv-rect.sobre .rc-contour, .cv-rect.sobre .rc-box { border-width: 1px; }' +
'  .cv-rect.sobre .rc-boxt { color: #20262e; }' +
'  .cv-rect.sobre .rc-lo li::before, .cv-rect.sobre .rc-fl li::before { color: var(--cv); }' : '') +
(eviterTitreSeul ? '  .cv-rect .rc-barre { break-after: avoid; }' : '') +
'  @media print { .page-a4.cv { margin: 0 auto; box-shadow: none; } .cv .rc-item, .cv .rc-box { break-inside: avoid; } }' +
'';
    var classesR = ['page-a4', 'cv', 'cv-rect'];
    if (sobreR) { classesR.push('sobre'); }
    if (opts.titresAgrandis) { classesR.push('agrandir'); }
    if (justifie) { classesR.push('justif'); }
    if (!(petitsCarres && !iconesCoord)) { classesR.push('sans-icoc'); }
    return { css: cssR + _pdfCssCouleursZones(opts.couleursZones, opts.zonesLiees), pageHtml: '<div class="' + classesR.join(' ') + '">' + corpsR + '</div>', nomComplet: nomComplet, largeurPage: '210mm', hauteurPage: '297mm' };
  }

  if (g === 'frise' || g === 'photo' || g === 'sobre-photo') {
    var sansRetiree = function (l) { return l.filter(function (x) { return retirees.indexOf(x) === -1; }); };
    var ligneFr = function (id, t) { return '<div class="fr-b">' + ed(id, t) + '</div>'; };
    var lignesFr = function (prefixe, liste) { return liste.map(function (x, i) { return ligneFr(prefixe + i, x); }).join(''); };
    var lignesComp = function (liste) { return liste.map(function (x) { return ligneFr('k:' + x, x); }).join(''); };
    var languesTxt = (contenu.langues || []).map(function (l) { return (l && l.langue) ? (l.langue + (l.niveau ? ' - ' + l.niveau : '')) : String(l); });
    var latFr = (photoUrl ? '<img class="fr-photo" src="' + _pdfEscaperHtml(photoUrl) + '" alt="Photo">' : '') + (enteteLibre ? '' : '<div class="coord"' + attrBl('coord') + '>' + coordHtml + '</div>') +
      // TACHE (J4, 2026-09-28) : data-rub ajoute a chaque <h3>, meme raison que barreR()/phH() plus haut.
      (sansRetiree(competencesComp).length ? '<h3 data-rub="' + _pdfEscaperHtml(_PDF_INTITULES.competencesComp) + '">' + _pdfEscaperHtml(_pdfLibelle(_PDF_INTITULES.competencesComp)) + '</h3>' + lignesComp(sansRetiree(competencesComp)) : '') +
      ((contenu.logiciels || []).length ? '<h3 data-rub="' + _pdfEscaperHtml(_PDF_INTITULES.logiciels) + '">' + _pdfEscaperHtml(_pdfLibelle(_PDF_INTITULES.logiciels)) + '</h3>' + lignesFr('li:Logiciels et outils:', contenu.logiciels) : '') +
      (languesTxt.length ? '<h3 data-rub="' + _pdfEscaperHtml(_PDF_INTITULES.langues) + '">' + _pdfEscaperHtml(_pdfLibelle(_PDF_INTITULES.langues)) + '</h3>' + lignesFr('li:Langues:', languesTxt) : '') +
      ((contenu.certifications || []).length ? '<h3 data-rub="' + _pdfEscaperHtml(_PDF_INTITULES.certifications) + '">' + _pdfEscaperHtml(_pdfLibelle(_PDF_INTITULES.certifications)) + '</h3>' + lignesFr('li:Certifications:', contenu.certifications) : '') +
      ((contenu.loisirs || []).length ? '<h3 data-rub="' + _pdfEscaperHtml(_PDF_INTITULES.loisirs) + '">' + _pdfEscaperHtml(_pdfLibelle(_PDF_INTITULES.loisirs)) + '</h3>' + lignesFr('li:Centres d’intérêt:', (contenu.loisirs || []).map(_pdfPremiereMajuscule)) : '') +
      (infosCompAff.length ? '<h3 data-rub="' + _pdfEscaperHtml(_PDF_INTITULES.infos) + '">' + _pdfEscaperHtml(_pdfLibelle(_PDF_INTITULES.infos)) + '</h3>' + lignesFr('li:Informations complémentaires:', infosCompAff) : '');
    var enteteFr = enteteLibre ? tete : ('<div class="fr-nom"' + attrBl('nom') + '>' + ed('nom', nomComplet) + '</div><div class="fr-metier"' + attrBl('metier') + '>' + ed('metier', metier) + '</div>' +
      (accroche ? '<p class="fr-accroche"' + attrBl('accroche') + '>' + ed('accroche', accroche) + '</p>' : ''));
    var parCompFr = parComp;
    var sansMissionsFr = parComp && opts.modePresentation === 'C';
    var lieuFr = function (e) { var l = afficherLieu ? e.lieu : ''; return l ? ' <span class="lieu lieu-' + lieuStyle + '">' + _pdfEscaperHtml(l) + '</span>' : ''; };
    var itemsExpFr = (contenu.experiences || []).map(function (e) {
      var i = (e.__idxBrut !== undefined) ? e.__idxBrut : (objetCV.experiences || []).indexOf(e);
      var per = _pdfFormaterPeriode(e.dateDebut, e.dateFin, 'exp');
      var dFr = per ? edDate('da:' + i, per) : '';
      var pFr = ed('po:' + i, _pdfPosteAvecStage(e), function (x) { return _pdfSpanStylePartie(x, styleParties.poste); });
      var eFr = '<span class="fr-ent">' + ed('en:' + i, e.entreprise || '', function (x) { return _pdfSpanStylePartie(x, styleParties.entreprise); }) + '</span>' + lieuFr(e);
      var teteFr = (positionDates === 'avant') ? '<div class="fr-poste">' + (dFr ? '<span class="fr-d">' + dFr + '</span> ' : '') + pFr + '</div><div class="fr-meta">' + eFr + '</div>'
        : (positionDates === 'droite') ? '<div class="fr-poste fr-flex"><span>' + pFr + '</span>' + (dFr ? '<span class="fr-d">' + dFr + '</span>' : '') + '</div><div class="fr-meta">' + eFr + '</div>'
        : '<div class="fr-poste">' + pFr + '</div><div class="fr-meta">' + dFr + ' ' + eFr + '</div>';
      return '<div class="fr-item" data-exp="' + i + '">' + ctl + teteFr +
        (sansMissionsFr ? '' : missionsHtml(e.missions, 'mi:' + i)) + '</div>';
    }).join('');
    var itemsFormFr = (contenu.formations || []).map(function (f, fiPos) {
      var fi = _pdfIdxFormation(f, fiPos);
      var diplome = _pdfTexteDiplome(f);
      var det = _pdfFormationDetails(f, opts.formationAffiche);
      var missionsF = missionsFormationHtml(f, fi);
      if (posDatesForm === 'avant' || posDatesForm === 'droite') {
        var dFF = det.annee ? ed('fa:' + fi, det.annee) : '';
        var eFF = det.endroit ? '<span class="fr-ent">' + ed('fr:' + fi, det.endroit) + '</span>' : '';
        var tFF = ed('fd:' + fi, diplome);
        var teteFF = (posDatesForm === 'avant')
          ? '<div class="fr-poste" style="' + styleTitreFormation(f) + '">' + (dFF ? '<span class="fr-d">' + dFF + '</span> ' : '') + tFF + '</div>' + (eFF ? '<div class="fr-meta">' + eFF + '</div>' : '')
          : '<div class="fr-poste fr-flex" style="' + styleTitreFormation(f) + '"><span>' + tFF + '</span>' + (dFF ? '<span class="fr-d">' + dFF + '</span>' : '') + '</div>' + (eFF ? '<div class="fr-meta">' + eFF + '</div>' : '');
        return '<div class="fr-item"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + teteFF + missionsF + '</div>';
      }
      return '<div class="fr-item"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + '<div class="fr-poste" style="' + styleTitreFormation(f) + '">' + ed('fd:' + fi, diplome) + (formLigne === 'ligne' ? ' <span style="font-weight:400">- ' + ed('fa:' + fi, det.annee) + (det.endroit ? ', ' + ed('fr:' + fi, det.endroit) : '') + '</span>' : '') + '</div>' +
        (formLigne === 'ligne' ? '' : '<div class="fr-meta"><span>' + ed('fa:' + fi, det.annee) + '</span> <span class="fr-ent">' + (det.endroit ? ed('fr:' + fi, det.endroit) : '') + '</span></div>') + missionsF + '</div>';
    }).join('');
    var persoItems = (contenu.experiencesPersonnelles || []).concat(contenu.engagements || []);
    var itemsPersoFr = persoItems.map(function (item, pi) {
      if (typeof item === 'string') { return '<div class="fr-item"><div class="fr-poste">' + ed('ep:' + pi, item) + '</div></div>'; }
      var titrePerso = (item && (item.intitule || item.texte)) || '';
      var periodePerso = _pdfFormaterPeriode(item && item.dateDebut, item && item.dateFin, 'perso');
      if (posDatesPerso === 'avant' || posDatesPerso === 'droite') {
        var dPF2 = periodePerso ? edDate('dp:' + pi, periodePerso) : '';
        var tPF2 = ed('ep:' + pi, titrePerso, function (x) { return _pdfSpanStylePartie(x, styleParties.poste); });
        var tetePF = (posDatesPerso === 'avant')
          ? '<div class="fr-poste">' + (dPF2 ? '<span class="fr-d">' + dPF2 + '</span> ' : '') + tPF2 + '</div>'
          : '<div class="fr-poste fr-flex"><span>' + tPF2 + '</span>' + (dPF2 ? '<span class="fr-d">' + dPF2 + '</span>' : '') + '</div>';
        return '<div class="fr-item">' + tetePF + _pdfPersoEndroitHtml(item) + ((item && item.detail) ? '<div class="meta">' + ed('ed:' + pi, item.detail) + '</div>' : '') + missionsHtml(item && item.missions, 'em:' + pi) + '</div>';
      }
      return '<div class="fr-item"><div class="fr-poste">' + ed('ep:' + pi, titrePerso, function (x) { return _pdfSpanStylePartie(x, styleParties.poste); }) + '</div>' +
        (periodePerso ? '<div class="fr-meta">' + edDate('dp:' + pi, periodePerso) + '</div>' : '') + _pdfPersoEndroitHtml(item) +
        ((item && item.detail) ? '<div class="meta">' + ed('ed:' + pi, item.detail) + '</div>' : '') + missionsHtml(item && item.missions, 'em:' + pi) + '</div>';
    }).join('');
    // ---------- « Photo et frise » (modele du CV de Denis, 2026-09-25) : colonne de gauche avec la photo et, juste dessous, le nom ;
    // colonne de droite : titre du CV centre, rubriques a pictogramme, experiences sur une frise (dates a gauche du trait).
    // Existe en Créatif (gabarit « photo ») et en Sobre (« sobre-photo », teinte assombrie). Meme contenu que « Colonne et frise ».
    if (g !== 'frise') {
      var escPh = _pdfEscaperHtml;
      // TACHE (J4, 2026-09-28) : data-rub ajoute ici, meme raison que barreR() plus haut.
      var phLh = function (cle) { return '<div class="ph-lh" data-rub="' + escPh(cle) + '">' + escPh(_pdfLibelle(cle)) + '</div>'; };
      var phH = function (cle, ico) { return '<div class="ph-h" data-rub="' + escPh(cle) + '">' + ((ico && icones) ? '<span class="ph-ico">' + _pdfIconeSvg(ico) + '</span>' : '') + '<span>' + escPh(_pdfLibelle(cle)) + '</span></div>'; };
      var phListe = function (prefixe, liste) { return liste.map(function (x, i) { return '<div class="ph-li">' + ed(prefixe + i, x) + '</div>'; }).join(''); };
      var phDates = function (per, id) {
        if (!per) { return ''; }
        return ed(id, per, function (x) {
          var p = String(x).split(' - '), sd = function (y) { return _pdfSpanStylePartie(y, styleParties.dates); };
          return p.length === 2 ? sd(p[0]) + '<br>' + sd('à ' + p[1]) : sd(x);
        });
      };
      var phPhoto = photoUrl ? '<img class="ph-photo" src="' + escPh(photoUrl) + '" alt="Photo">' : '';
      var phComp = sansRetiree(competencesPro), phAtouts = sansRetiree(competencesComp);
      var latPh = phPhoto + '<div class="ph-nom"' + attrBl('nom') + '>' + ed('nom', nomComplet) + '</div>' +
        '<div class="ph-lat-corps">' +
        phLh('Contact') + '<div class="coord"' + attrBl('coord') + '>' + coordHtml + '</div>' +
        ((phComp.length && !parCompFr) ? phLh(_PDF_INTITULES.competencesPro) + phComp.map(function (x) { return '<div class="ph-li">' + ed('k:' + x, x) + '</div>'; }).join('') : '') +
        (phAtouts.length ? phLh(_PDF_INTITULES.competencesComp) + phAtouts.map(function (x) { return '<div class="ph-li">' + ed('k:' + x, x) + '</div>'; }).join('') : '') +
        ((contenu.logiciels || []).length ? phLh(_PDF_INTITULES.logiciels) + '<div class="ph-li">' + ed('li:Logiciels et outils:tous', contenu.logiciels.join(', ')) + '</div>' : '') +
        (languesTxt.length ? phLh(_PDF_INTITULES.langues) + phListe('li:Langues:', languesTxt) : '') +
        ((contenu.certifications || []).length ? phLh(_PDF_INTITULES.certifications) + phListe('li:Certifications:', contenu.certifications) : '') +
        ((contenu.loisirs || []).length ? phLh(_PDF_INTITULES.loisirs) + phListe('li:Centres d’intérêt:', (contenu.loisirs || []).map(_pdfPremiereMajuscule)) : '') +
        (infosCompAff.length ? phLh(_PDF_INTITULES.infos) + phListe('li:Informations complémentaires:', infosCompAff) : '') +
        '</div>';
      var itemsExpPh = (contenu.experiences || []).map(function (e) {
        var i = (e.__idxBrut !== undefined) ? e.__idxBrut : (objetCV.experiences || []).indexOf(e);
        var per = _pdfFormaterPeriode(e.dateDebut, e.dateFin, 'exp');
        var pPh = ed('po:' + i, _pdfPosteAvecStage(e), function (x) { return _pdfSpanStylePartie(x, styleParties.poste); });
        var ePh = ed('en:' + i, e.entreprise || '', function (x) { return _pdfSpanStylePartie(x, styleParties.entreprise); }) + lieuFr(e);
        var dUne = per ? edDate('da:' + i, per) : '';
        if (positionDates === 'avant') {
          return '<div class="fr-item ph-item" data-exp="' + i + '">' + ctl +
            '<div class="ph-dates">' + phDates(per, 'da:' + i) + '</div>' +
            '<div class="ph-corps"><div class="ph-poste">' + pPh + '</div><div class="ph-ent">' + ePh + '</div>' +
            (sansMissionsFr ? '' : missionsHtml(e.missions, 'mi:' + i)) + '</div></div>';
        }
        return '<div class="fr-item ph-item ph-plat" data-exp="' + i + '">' + ctl +
          '<div class="ph-corps">' +
          ((positionDates === 'droite')
            ? '<div class="ph-ligne"><div class="ph-poste">' + pPh + '</div>' + (dUne ? '<span class="ph-dd">' + dUne + '</span>' : '') + '</div><div class="ph-ent">' + ePh + '</div>'
            : '<div class="ph-poste">' + pPh + '</div><div class="ph-ent">' + ePh + '</div>' + (dUne ? '<div class="ph-dd ph-dd-sous">' + dUne + '</div>' : '')) +
          (sansMissionsFr ? '' : missionsHtml(e.missions, 'mi:' + i)) + '</div></div>';
      }).join('');
      var itemsFormPh = (contenu.formations || []).map(function (f, fiPos) {
        var fi = _pdfIdxFormation(f, fiPos);
        var diplome = _pdfTexteDiplome(f);
        var det = _pdfFormationDetails(f, opts.formationAffiche);
        var missionsF = missionsFormationHtml(f, fi);
        if (posDatesForm === 'droite' || posDatesForm === 'sous') {
          var dPF = det.annee ? ed('fa:' + fi, det.annee) : '';
          var ePF = det.endroit ? ed('fr:' + fi, det.endroit) : '';
          var tPF = '<div class="ph-poste" style="' + styleTitreFormation(f) + '">' + ed('fd:' + fi, diplome) + '</div>';
          var cPF = (posDatesForm === 'droite')
            ? '<div class="ph-ligne">' + tPF + (dPF ? '<span class="ph-dd">' + dPF + '</span>' : '') + '</div>' + (ePF ? '<div class="ph-ent">' + ePF + '</div>' : '')
            : tPF + (ePF ? '<div class="ph-ent">' + ePF + '</div>' : '') + (dPF ? '<div class="ph-dd ph-dd-sous">' + dPF + '</div>' : '');
          return '<div class="ph-item ph-form ph-plat"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + '<div class="ph-corps">' + cPF + missionsF + '</div></div>';
        }
        return '<div class="ph-item ph-form"' + attrFormation(f) + ' style="' + espFormStyle + '">' + ctl + '<div class="ph-dates">' + ed('fa:' + fi, det.annee) + '</div>' +
          '<div class="ph-corps ph-sans-ligne"><div class="ph-poste" style="' + styleTitreFormation(f) + '">' + ed('fd:' + fi, diplome) + ((det.endroit && formLigne === 'ligne') ? ' <span style="font-weight:400">- ' + ed('fr:' + fi, det.endroit) + '</span>' : '') + '</div>' +
          ((det.endroit && formLigne !== 'ligne') ? '<div class="ph-ent">' + ed('fr:' + fi, det.endroit) + '</div>' : '') + missionsF + '</div></div>';
      }).join('');
      var secExpPh = itemsExpPh ? phH(_PDF_INTITULES.experience, 'experience') + '<div class="ph-frise">' + itemsExpPh + '</div>' : '';
      var secFormPh = itemsFormPh ? phH(_PDF_INTITULES.formations, 'formations') + '<div class="ph-frise">' + itemsFormPh + '</div>' : '';
      var mainPh = '<div class="ph-metier"' + attrBl('metier') + '>' + ed('metier', metier) + '</div>' +
        (accroche ? '<p class="ph-accroche"' + attrBl('accroche') + '>' + ed('accroche', accroche) + '</p>' : '') +
        (parCompFr ? phH(_PDF_INTITULES.competencesEnAction, 'competences') + themesHtml() : '') +
        (formAvant ? secFormPh + secExpPh : secExpPh + secFormPh) +
        (itemsPersoFr ? phH(_PDF_INTITULES.experiencePerso, 'engagements') + '<div class="ph-perso">' + itemsPersoFr + '</div>' : '');
      var accentPh = (g === 'sobre-photo') ? 'color-mix(in srgb, var(--cv) 40%, #20262e)' : 'var(--cv)';
      var cssPh =
'  :root { --kh: ' + kh + '; --cv: ' + couleur + '; --tt: ' + tailleTitres + 'px; }' +
'  * { box-sizing: border-box; }' +
'  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }' +
'  .page-a4.cv { position: relative; width: 210mm; min-height: 297mm; margin: 24px auto; background: #fff; color: #1c2430; box-shadow: 0 2px 10px rgba(0,0,0,.18); font-family: ' + police + '; font-size: ' + tailleTexte.toFixed(2) + 'px; line-height: ' + interligne.toFixed(3) + '; padding-bottom: 0; }' +
'  .cv-photo { --ph-a: ' + accentPh + '; --ph-a2: color-mix(in srgb, var(--ph-a) 78%, #000); }' +
'  .cv-photo .ph-grille { display: grid; grid-template-columns: 32% 1fr; min-height: 296.5mm; }' +
'  .cv-photo .ph-lat, .cv-photo .ph-main { min-width: 0; }' +
'  .cv-photo .ph-lat { ' + (g === 'sobre-photo' ? 'background: #f1f2f4; ' : '') + 'border-right: 2px solid var(--ph-a); padding-bottom: 20px; }' +
'  .cv-photo .ph-photo { display: block; width: 68%; height: 136px; object-fit: cover; object-position: center 20%; margin: 0 auto; }' +
'  .cv-photo .ph-nom { text-align: center; font-weight: 700; font-size: calc(16px * var(--k, 1) * var(--kh, 1)); color: var(--ph-a); padding: 8px 10px 4px; }' +
'  .cv-photo .ph-lat { font-size: .86em; line-height: 1.28; }' +
'  .cv-photo .ph-lat-corps { padding: 4px 8px 0 12px; }' +
'  .cv-photo .ph-lh { display: flex; align-items: center; gap: 6px; text-transform: uppercase; font-weight: 700; letter-spacing: .04em; font-size: calc(var(--tt, 13px) * 1.12); color: var(--ph-a); margin: 12px 0 4px; }' +
'  .cv-photo .ph-lh::before { content: ""; width: 16px; height: 2px; background: var(--ph-a); flex: none; }' +
'  .cv-photo .ph-li { padding-left: 10px; text-indent: -10px; margin-bottom: 2px; overflow-wrap: break-word; }' +
'  .cv-photo .ph-li::before { content: "• "; }' +
'  .cv-photo .coord { margin: 0; font-size: calc(11.5px * var(--k, 1) * var(--kh, 1)); line-height: 1.7; word-break: break-word; }' +
'  .cv .coord div::before { content: ""; display: inline-block; width: 9px; height: 9px; margin-right: 6px; border-radius: 2px; background: var(--ph-a, var(--cv)); opacity: .8; }' +
'  .cv.sans-icoc .coord div::before { display: none; }' +
'  .cv .icone-ligne { width: 0.85em; height: 0.85em; vertical-align: -0.1em; margin-right: 0.32em; flex-shrink: 0; }' +
'  .cv-photo .ph-main { padding: 26px 24px 22px 22px; }' +
'  .cv-photo .ph-metier { text-align: center; font-weight: 700; font-size: calc(19px * var(--k, 1) * var(--kh, 1)); color: #4a4f57; margin: 0 0 6px; }' +
'  .cv-photo .ph-accroche { text-align: center; font-style: italic; font-size: calc(11.5px * var(--k, 1) * var(--kh, 1)); margin: 0 0 4px; }' +
'  .cv-photo .ph-h { display: flex; align-items: center; gap: 8px; text-transform: uppercase; font-weight: 700; letter-spacing: .03em; font-size: calc(var(--tt, 13px) * 1.08); color: var(--ph-a); margin: 18px 0 10px; }' +
'  .cv-photo.agrandir .ph-h, .cv-photo.agrandir .ph-lh { font-size: calc(var(--tt, 13px) * 1.27 * 1.1); }' +
'  .cv-photo.justif .ph-corps li, .cv-photo.justif .ph-accroche { text-align: justify; }' +
'  .cv-photo .ph-ico .icone-ligne { width: 1.25em; height: 1.25em; margin: 0; stroke: var(--ph-a); vertical-align: middle; }' +
'  .cv-photo .ph-item { display: grid; grid-template-columns: 22mm 1fr; column-gap: 14px; position: relative; }' +
'  .cv-photo .ph-dates { font-weight: 700; font-size: .93em; line-height: 1.3; color: #3a3f47; padding-top: 1px; }' +
'  .cv-photo .ph-plat { grid-template-columns: 1fr; }' +
'  .cv-photo .ph-ligne { display: flex; justify-content: space-between; gap: 10px; }' +
'  .cv-photo .ph-dd { white-space: nowrap; font-weight: 700; font-size: .93em; color: #3a3f47; }' +
'  .cv-photo .ph-dd-sous { white-space: normal; }' +
'  .cv-photo .ph-corps { min-width: 0; border-left: 2px solid var(--ph-a); padding: 0 0 12px 12px; position: relative; }' +
'  .cv-photo .ph-corps::before { content: ""; position: absolute; left: -6px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: var(--ph-a); }' +
'  .cv-photo .ph-item:last-child .ph-corps { padding-bottom: 0; }' +
'  .cv-photo .ph-sans-ligne { border-left: 0; padding-left: 0; }' +
'  .cv-photo .ph-sans-ligne::before { display: none; }' +
'  .cv-photo .ph-form { margin-bottom: 6px; }' +
'  .cv-photo .ph-poste { font-weight: 700; color: var(--ph-a); }' +
'  .cv-photo .ph-form .ph-poste { color: #1c2430; }' +
'  .cv-photo .ph-ent { font-weight: 700; color: var(--ph-a2); }' +
'  .cv-photo .ph-form .ph-ent { font-weight: 400; color: #4b5866; }' +
'  .cv-photo .ph-ent .lieu::before { content: "– "; }' +
'  .cv-photo .ph-corps ul { list-style: none; margin: 2px 0 0 0; padding-left: 8px; }' +
'  .cv-photo .ph-corps li { margin-bottom: 1px; }' +
'  .cv-photo .ph-perso .fr-poste { font-weight: 700; color: var(--ph-a); }' +
'  .cv-photo .ph-perso .fr-meta { color: #4b5866; }' +
'  .cv-photo .theme { font-weight: 700; margin: 6px 0 1px; }' +
'  .cv .src { color: #4b5866; font-size: .88em; }' +
'  .cv .meta { color: #4b5866; }' +
'  .cv b, .cv .gras { font-weight: 700; }' +
'  .cv .lieu-italique { font-style: italic; }' +
'  .cv .lieu-gris { color: #6b7684; }' +
'  .cv .ctl-exp { position: absolute; right: -2px; top: -3px; display: none; gap: 2px; z-index: 4; }' +
'  .cv .pill .x, .cv li .x { display: none; }' +
(eviterTitreSeul ? '  .cv-photo .ph-h { break-after: avoid; }' : '') +
'  @media print { .page-a4.cv { margin: 0 auto; box-shadow: none; } .cv .ph-item { break-inside: avoid; } }' +
'';
      var classesPh = ['page-a4', 'cv', 'cv-photo'];
      if (opts.titresAgrandis) { classesPh.push('agrandir'); }
      if (justifie) { classesPh.push('justif'); }
      if (g === 'sobre-photo') { classesPh.push('sobre'); }
      if (!(petitsCarres && !iconesCoord)) { classesPh.push('sans-icoc'); }
      return {
        css: cssPh + _pdfCssCouleursZones(opts.couleursZones, opts.zonesLiees),
        pageHtml: '<div class="' + classesPh.join(' ') + '"><div class="ph-grille"><aside class="ph-lat">' + latPh + '</aside><main class="ph-main">' + mainPh + '</main></div></div>',
        nomComplet: nomComplet, largeurPage: '210mm', hauteurPage: '297mm'
      };
    }
    var frHt = function (t, ico) { return '<div class="fr-h">' + ((icones && ico) ? '<span class="fr-ico">' + _pdfIconeSvg(ico) + '</span>' : '') + t + '</div>'; };
    var secExpFr = itemsExpFr ? frHt(_PDF_INTITULES.experience, 'experience') + '<div class="fr-frise">' + itemsExpFr + '</div>' : '';
    var secFormFr = itemsFormFr ? frHt(_PDF_INTITULES.formations, 'formations') + '<div class="fr-frise">' + itemsFormFr + '</div>' : '';
    var mainFr = enteteFr +
      ((sansRetiree(competencesPro).length && !parCompFr) ? frHt(_PDF_INTITULES.competencesPro, 'competences') + lignesComp(sansRetiree(competencesPro)) : '') +
      (parCompFr ? frHt(_PDF_INTITULES.competencesEnAction, 'competences') + themesHtml() : '') +
      (formAvant ? secFormFr + secExpFr : secExpFr + secFormFr) +
      (itemsPersoFr ? frHt(_PDF_INTITULES.experiencePerso, 'engagements') + '<div class="fr-frise">' + itemsPersoFr + '</div>' : '');
    var cssFr =
'  :root { --kh: ' + kh + '; --cv: ' + couleur + '; --tt: ' + tailleTitres + 'px; }' +
'  * { box-sizing: border-box; }' +
'  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }' +
'  .page-a4.cv { position: relative; width: 210mm; min-height: 297mm; margin: 24px auto; background: #fff; color: #1c2430; box-shadow: 0 2px 10px rgba(0,0,0,.18); font-family: ' + police + '; font-size: ' + tailleTexte.toFixed(2) + 'px; line-height: ' + interligne.toFixed(3) + '; }' +
'  .page-a4.cv.cv-frise { padding-bottom: 0; overflow: hidden; }' +
'  .cv-frise .fr-coin { position: absolute; top: 0; right: 0; width: 76%; height: 118px; background: var(--cv); clip-path: polygon(34% 0, 100% 0, 100% 86%); z-index: 0; }' +
'  .cv-frise.degr .fr-coin { background: linear-gradient(120deg, var(--cv), color-mix(in srgb, var(--cv) 45%, #ffffff)); }' +
'  .cv-frise .fr-coin2 { position: absolute; top: 0; left: 0; width: 31%; height: 58px; background: #5f7288; clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 3; }' +
'  .cv-frise .fr-grille { display: grid; grid-template-columns: 31% 1fr; min-height: 296.5mm; position: relative; z-index: 1; }' +
'  .cv-frise .fr-lat, .cv-frise .fr-main { min-width: 0; }' +
'  .cv-frise .fr-lat { background: #93aac6; padding: 96px 16px 22px 22px; }' +
'  .cv-frise .fr-photo { display: block; width: 92px; height: 92px; border-radius: 50%; object-fit: cover; margin: -8px 0 14px 0; border: 3px solid #fff; }' +
'  .cv-frise .fr-lat .coord { margin: 0 0 6px; font-size: calc(11.5px * var(--k, 1) * var(--kh, 1)); line-height: 1.7; color: #14202e; word-break: break-word; }' +
'  .cv .coord div::before { content: ""; display: inline-block; width: 9px; height: 9px; margin-right: 6px; border-radius: 2px; background: var(--cv); opacity: .8; }' +
'  .cv.sans-icoc .coord div::before { display: none; }' +
'  .cv .icone-ligne { width: 0.85em; height: 0.85em; vertical-align: -0.1em; margin-right: 0.32em; flex-shrink: 0; }' +
'  .cv-frise .fr-lat h3 { font-size: calc(var(--tt, 13px) * 1.15); color: #5f7288; margin: 18px 0 6px; font-weight: 700; overflow-wrap: break-word; }' +
'  .cv-frise .fr-lat .fr-b { font-weight: 700; margin-bottom: 5px; color: #0f1720; }' +
'  .cv-frise .fr-main { padding: 30px 26px 22px 26px; }' +
'  .cv-frise .fr-nom { font-size: calc(20px * var(--k, 1) * var(--kh, 1)); font-weight: 400; color: #222; }' +
'  .cv-frise .fr-metier { font-size: calc(21px * var(--k, 1) * var(--kh, 1)); color: var(--cv); font-weight: 600; margin: 2px 0 8px; }' +
'  .cv-frise .fr-accroche { font-size: calc(12px * var(--k, 1) * var(--kh, 1)); margin: 0 0 6px; }' +
'  .cv-frise .fr-h { font-size: calc(var(--tt, 13px) * 1.3); color: var(--cv); margin: 16px 0 6px; font-weight: 600; overflow-wrap: break-word; }' +
'  .cv-frise .fr-b { font-weight: 700; margin-bottom: 4px; }' +
'  .cv-frise .fr-flex { display: flex; justify-content: space-between; gap: 10px; }' +
'  .cv-frise .fr-d { white-space: nowrap; font-weight: 400; color: #555; }' +
'  .cv-frise .fr-ico .icone-ligne { width: 1.05em; height: 1.05em; margin: 0 6px 0 0; vertical-align: -0.15em; stroke: var(--cv); }' +
'  .cv-frise.agrandir .fr-h { font-size: calc(var(--tt, 13px) * 1.3 * 1.27); }' +
'  .cv-frise.agrandir .fr-lat h3 { font-size: calc(var(--tt, 13px) * 1.15 * 1.27); }' +
'  .cv-frise.justif .fr-item li, .cv-frise.justif .fr-accroche { text-align: justify; }' +
'  .cv-frise .fr-frise { border-left: 2px solid #2c3038; margin-left: 5px; padding-left: 16px; }' +
'  .cv-frise .fr-item { position: relative; margin-bottom: 9px; }' +
'  .cv-frise .fr-item::before { content: ""; position: absolute; left: -23px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #111; }' +
'  .cv-frise .fr-poste { font-weight: 700; }' +
'  .cv-frise .fr-meta { color: #555; }' +
'  .cv-frise .fr-ent { color: var(--cv); }' +
'  .cv-frise .fr-item ul { margin: 3px 0 0 0; padding-left: 16px; }' +
'  .cv-frise .theme { font-weight: 700; margin: 6px 0 1px; }' +
'  .cv .src { color: #4b5866; font-size: .88em; }' +
'  .cv .meta { color: #4b5866; }' +
'  .cv b, .cv .gras { font-weight: 700; }' +
'  .cv ul { margin: 2px 0 0 0; padding-left: 16px; }' +
'  .cv .liste-2col { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14px; align-items: start; }  .cv .liste-2col > div { break-inside: avoid; }' +
'  .cv .pills-2col, .cv .pills-auto { display: grid; grid-template-columns: 1fr 1fr; gap: 0 6px; }  .cv .pills-2col .pill, .cv .pills-auto .pill { display: block; margin: 0 0 4px 0; }' +
'  .cv .pills-1col .pill { display: block; width: max-content; max-width: 100%; margin: 0 0 4px 0; }  .cv .pills-1col .pill.texte::after { content: ""; }' +
'  .cv .pills-puces .pill.texte::after { content: ""; }  .cv .pills-puces .pill.texte::before { content: var(--puce, "\\2022 "); }' +
// TACHE (P10, retour Denis 2026-09-28) : "Competences en action" force 2 colonnes en Mixte (voir blocThemes) -- classe
// dediee, differente de liste-2col qui attend des <div> (blocListe) et non des <ul>/<li> groupes par theme.
'  .cv .themes-2col { column-count: 2; column-gap: 14px; }  .cv .themes-2col ul { break-inside: auto; margin: 2px 0 6px; }  .cv .themes-2col li { break-inside: avoid; }  .cv .themes-2col .theme { break-after: avoid; }' +
'  .cv li { margin-bottom: 1px; }' +
cssPuces +
'  .cv .lieu-italique { font-style: italic; }' +
'  .cv .lieu-gris { color: #6b7684; }' +
'  .cv .tete.libre { display: block; position: relative; padding: 0 !important; }' +
'  .cv-frise .tete.libre.large { width: 144.93%; margin-left: -44.93%; }' +
'  .cv .tete.libre > .blc { position: absolute; }' +
'  .cv .blc .nom { font-size: calc(20px * var(--k, 1) * var(--kh, 1)); font-weight: 400; color: #222; }' +
'  .cv .blc .coord { margin-top: 0; font-size: calc(11.5px * var(--k, 1) * var(--kh, 1)); color: #14202e; line-height: 1.7; }' +
'  .cv .blc .metier { font-size: calc(21px * var(--k, 1) * var(--kh, 1)); color: var(--cv); font-weight: 600; text-transform: none; text-align: left; padding-top: 0; line-height: 1.15; }' +
'  .cv .blc .accroche { font-size: calc(12px * var(--k, 1) * var(--kh, 1)); font-style: normal; border-left: 0; padding-left: 0; color: #1c2430; }' +
'  .cv .poi-l, .cv .poi-h { display: none; position: absolute; z-index: 6; touch-action: none; }' +
'  .cv .poi-l { top: 0; right: -16px; bottom: 0; width: 32px; cursor: ew-resize; border-radius: 8px; }' +
'  .cv .poi-l::after { content: ""; position: absolute; top: 50%; right: 11px; transform: translateY(-50%); width: 7px; height: 44px; border-radius: 4px; background: #5d6875; box-shadow: 0 0 0 2px rgba(255,255,255,.85); }' +
'  .cv .poi-h { left: 0; right: 0; bottom: -16px; height: 32px; cursor: ns-resize; border-radius: 8px; }' +
'  .cv .poi-h::after { content: ""; position: absolute; left: 50%; bottom: 11px; transform: translateX(-50%); height: 7px; width: 56px; border-radius: 4px; background: #5d6875; box-shadow: 0 0 0 2px rgba(255,255,255,.85); }' +
'  .cv .poi-l:hover, .cv .poi-h:hover { background: rgba(31,90,168,.12); }' +
'  .cv .poi-l:hover::after, .cv .poi-h:hover::after, .cv .poi-l:active::after, .cv .poi-h:active::after { background: #1f5aa8; }' +
'  .cv .ctl-exp { position: absolute; right: -2px; top: -3px; display: none; gap: 2px; z-index: 4; }' +
'  .cv .pill .x, .cv li .x { display: none; }' +
(eviterTitreSeul ? '  .cv-frise .fr-h { break-after: avoid; }' : '') +
'  @media print { .page-a4.cv { margin: 0 auto; box-shadow: none; } .cv .fr-item { break-inside: avoid; } .cv .poi-l, .cv .poi-h { display: none !important; } .cv [data-bl] { outline: none !important; background: none !important; } }' +
'';
    var classesFr = ['page-a4', 'cv', 'cv-frise'];
    if (opts.titresAgrandis) { classesFr.push('agrandir'); }
    if (justifie) { classesFr.push('justif'); }
    if (degr) { classesFr.push('degr'); }
    if (!(petitsCarres && !iconesCoord)) { classesFr.push('sans-icoc'); }
    return {
      css: cssFr + _pdfCssCouleursZones(opts.couleursZones, opts.zonesLiees),
      pageHtml: '<div class="' + classesFr.join(' ') + '"><div class="fr-coin"></div><div class="fr-coin2"></div><div class="fr-grille"><aside class="fr-lat">' + latFr + '</aside><main class="fr-main">' + mainFr + '</main></div></div>',
      nomComplet: nomComplet, largeurPage: '210mm', hauteurPage: '297mm'
    };
  }

  var corps;
  var bloEngagements = blocEngagements();
  if (deux) {
    var gauche = '', droite = '';
    // Les formations sont TOUJOURS dans la colonne de droite (avec les experiences) ; elles ne passent a gauche que si la personne le demande
    // (decision de Denis, 2026-09-26 : plus de deplacement automatique quand la colonne de droite est chargee).
    var formGauche = !!opts.formationsAGauche;
    var blocsComp = blocPro() + blocComp();
    // TACHE (P10-bis, retour Denis 2026-09-28, maquette docs/MAQUETTE_RUBRIQUES_DEBORDANTES_2026-09-28.html,
    // "Proposition B" validee) : blocsParCle deplace ICI (hoiste hors du bloc "Personnaliser" juste en dessous)
    // pour servir aux DEUX branches (Personnaliser ET disposition par defaut) -- une rubrique choisie par
    // opts.rubriquePleineLargeur (mesuree cote iframe, voir _pdfEquilibrerColonnes) est retiree de sa colonne
    // normale, quelle que soit la branche qui l'y aurait placee, et rendue a part en pleine largeur sous les
    // 2 colonnes (jamais un reglage pour la personne : recalcule a chaque rafraichissement).
    var blocsParCle = { pro: blocPro, comp: blocComp, logi: blocLogi, langues: blocLangues, certifs: blocCertifs, centres: blocCentres, infos: blocInfos,
      perso: function () { return bloEngagements; }, exp: blocExperiences, form: blocForm };
    var rubriquePL = opts.rubriquePleineLargeur;
    var candidatPL = (rubriquePL && _PDF_RUBRIQUES_PLEINE_LARGEUR.indexOf(rubriquePL) !== -1) ? rubriquePL : null;
    var contenuPleineLargeur = candidatPL ? blocsParCle[candidatPL]() : '';
    function blocOuPleineLargeur(cle, html) { return (candidatPL === cle) ? '' : html; }
    if (opts.ordreColonnes) {
      // Disposition choisie par la personne (Organisation du CV > Personnaliser, 2 colonnes).
      var depart = _pdfDispositionDepartColonnes(compHaut, formGauche, formAvant);
      var dispo = _pdfNormaliserDispositionColonnes(opts.ordreColonnes, depart, largeurGauche);
      var appelerBloc = function (cle) { return blocOuPleineLargeur(cle, blocsParCle[cle]()); };
      var rendreLignes = function (lignes) {
        return lignes.map(function (ligne) {
          if (ligne.length === 2) {
            var a = appelerBloc(ligne[0]), b = appelerBloc(ligne[1]);
            if (a && b) { return '<div class="paire"><div>' + a + '</div><div>' + b + '</div></div>'; }
            return a + b;
          }
          return appelerBloc(ligne[0]);
        }).join('');
      };
      gauche += rendreLignes(dispo.gauche);
      droite += rendreLignes(dispo.droite);
    } else {
      // TACHE (retour Denis 2026-09-28, point 14 : "Langues et Centres d'interet toujours en bas
      // de page, sur la meme ligne") : retires d'ici, rendus a part plus bas (langCentresBasDePage).
      // Denis, 2026-09-29 : Langues et Centres d'intérêt dans la colonne de GAUCHE (avec Logiciels) ; l'expérience personnelle dans la colonne
      // de DROITE, juste après les formations. (Avant : Langues + Centres en pleine largeur en bas, expérience personnelle à gauche.)
      // Denis, 2026-09-29 : s'il y a de la place (mesure du rendu, voir _pdfEssayerCompProDroite), les compétences PROFESSIONNELLES passent
      // en tête de la colonne de droite, avant les expériences ; sinon elles restent en tête de la colonne de gauche.
      var proDroite = compHaut && !!blocPro() && (opts.compProDroite === true || (opts.compProDroite !== false && opts.compProDroiteAuto === true));
      // Faute de place apres les formations (mesure, _pdfEquilibrerColonnes), l'experience personnelle (citee ou developpee) passe ENTIEREMENT dans la colonne
      // de gauche, AVANT Logiciels, Langues et Centres d'interet (Denis, 2026-09-29).
      var persoGauche = opts.persoGaucheAuto === true && !!bloEngagements;
      gauche += (compHaut ? (proDroite ? blocComp() : blocsComp) : '') + (formGauche ? blocOuPleineLargeur('form', blocForm()) : '') + (persoGauche ? bloEngagements : '') + blocLogi() + blocLangues() + blocCertifs() + blocCentres() + blocInfos() + (compHaut ? '' : blocsComp);
      droite += (proDroite ? blocPro() : '') + ((formAvant && !formGauche) ? blocOuPleineLargeur('form', blocForm()) : '') + blocExperiences() + ((!formGauche && !formAvant) ? blocOuPleineLargeur('form', blocForm()) : '') + (persoGauche ? '' : blocOuPleineLargeur('perso', bloEngagements));
    }
    // TACHE (retour Denis 2026-09-28, point 14 : "Langues et Centres d'interet toujours en bas de
    // page, sur la meme ligne, peu importe le debordement") : rendus ENSEMBLE, en pleine largeur,
    // sous les 2 colonnes -- jamais dans "Personnaliser" (retires de _pdfDispositionDepartColonnes/
    // _PDF_BLOCS_COLONNES plus haut) ni dans le mecanisme de debordement (retires de
    // _PDF_RUBRIQUES_PLEINE_LARGEUR) : une regle fixe, pas un reglage de plus.
    // Denis, 2026-09-29 : plus de ligne « Langues + Centres » en bas de page à deux colonnes : ils sont dans la colonne de gauche (ci-dessus).
    var langCentresBasDePage = '';
    var colFondDroite = (fond === 'droite' || fond === 'lesDeux' || g === 'colonne');
    var colFondGauche = ((fond === 'gauche' || fond === 'lesDeux') && g !== 'colonne');
    var classeFond = function (actif, cotePropre) {
      if (!actif) { return ''; }
      return 'col-fond' + (effetTitres ? ' col-titres' : '') + (colonnesDiagonales ? (cotePropre === 'gauche' ? ' col-diag-g' : ' col-diag-d') : '');
    };
    var htmlG = '<div class="' + classeFond(colFondGauche, 'gauche') + '">' + gauche + '</div>';
    var htmlD = '<div class="' + (colFondDroite ? classeFond(true, 'droite') : (g === 'sobre-fond' ? 'col-pale' : '')) + '">' + droite + '</div>';
    corps = '<div class="corps deux" style="padding:0 ' + pad + ';grid-template-columns:' + (inversees ? '1fr ' + largeurGauche + '%' : largeurGauche + '% 1fr') + '">' +
      (inversees ? htmlD + htmlG : htmlG + htmlD) + '</div>' +
      (contenuPleineLargeur ? '<div class="corps-pleine-largeur" style="padding:0 ' + pad + '">' + contenuPleineLargeur + '</div>' : '') +
      (langCentresBasDePage ? '<div class="corps-pleine-largeur" style="padding:0 ' + pad + '">' + langCentresBasDePage + '</div>' : '');
  } else {
    var blocs = {
      // Retour Denis 2026-10-01 : en « Par competences », les competences professionnelles sont deja dans le bloc des experiences (blocThemes) ;
      // les competences comportementales prennent alors TOUTE la largeur (plus de demi-colonne vide a gauche).
      comp: (themesEnHaut && blocProMissionsEnPastilles()) ? paireCompetences(blocProMissionsEnPastilles(), blocComp())
        : (actionCoteC ? ((blocComp() && blocThemes()) ? '<div class="paire"><div>' + blocThemes() + '</div><div>' + blocComp() + '</div></div>' : blocThemes() + blocComp())
          : (blocPro() ? paireCompetences(blocPro(), blocComp()) : blocComp())),
      exp: blocExperiences(),
      // Decision Denis 2026-10-01 : sur une colonne, Certifications vient TOUJOURS juste apres les Formations (« ce point est important »).
      form: (opts.formCertifsCoteACote && blocForm() && blocCertifs()) ? '<div class="paire"><div>' + blocForm() + '</div><div>' + blocCertifs() + '</div></div>' : blocForm() + blocCertifs(),
      // TACHE (retour Denis 2026-09-28, point 20 : "pourquoi c'est aussi bordelique") : meme
      // correctif que le point 14 (modele 2 colonnes), applique ici au modele 1 colonne --
      // Centres d'interet n'est plus couple a Logiciels (souvent vide) ni Langues a
      // Certifications (TOUJOURS vide depuis la fusion Certifications->Formations,
      // contenu.certifications neutralise) : Langues + Centres d'interet vont TOUJOURS
      // ensemble desormais, Logiciels sur sa propre ligne. paire() renvoie deja '' si les
      // 2 cotes sont vides, jamais besoin d'un test en plus ici.
      bas: blocLogi() + paire(blocLangues(), blocCentres()) + blocInfos() + bloEngagements
    };
    // DISPOSITION PAR DEFAUT (Denis, 2026-09-29, cahier docs/CHANTIER_DISPOSITION_PAR_DEFAUT_2026-09-29.md) : Standard sur une colonne
    // seulement (premiere tranche). Jamais appliquee par-dessus un ordre choisi par la personne (perso).
    //  - Experience personnelle DEVELOPPEE (avec missions) : juste apres les formations. CITEE (liste d'intitules) : avant Logiciels, Langues, Centres.
    //  - Logiciels + Langues + Centres d'interet sur UNE ligne quand chacun tient dans un tiers de la largeur ; sinon disposition d'avant.
    // Tous les modèles qui passent par ce gabarit commun sur une colonne (Standard, Sobre, créatifs de la maquette) ; « Colonne et frise »,
    // « Rectangles » et « Photo » ont leur propre construction, plus haut.
    var dispoDefaut = !perso;
    var persoDeveloppee = dispoDefaut && opts.expPersoModeAffichage === 'developper' && !!bloEngagements;
    if (dispoDefaut) {
      var plusLong = function (l) { return (l || []).reduce(function (m, x) { return Math.max(m, String(x && x.langue ? x.langue : x).length); }, 0); };
      var enDeuxCol = opts.listesDeuxColonnes || [];
      var tientDansUnTiers = function (titre, libelles) {
        return plusLong(libelles) <= 30 && enDeuxCol.indexOf(titre) === -1;
      };
      var logiH = blocLogi(), langH = blocLangues(), centH = blocCentres();
      // opts.petitesUneLigne (propose par « Mise en page » apres mesure) force la ligne de trois meme si un libelle depasse le seuil.
      var troisSurUneLigne = cote === 'cote' && logiH && langH && centH &&
        (opts.petitesUneLigne === true || (tientDansUnTiers(_PDF_INTITULES.logiciels, contenu.logiciels) && tientDansUnTiers(_PDF_INTITULES.langues, libellesLangues()) &&
        tientDansUnTiers(_PDF_INTITULES.loisirs, contenu.loisirs)));
      // opts.logicielsAcoteFormations (propose par « Mise en page » apres mesure) : Logiciels a droite des Formations, quand la ligne de trois n'est pas retenue.
      var logiAcoteForm = opts.logicielsAcoteFormations === true && !troisSurUneLigne && !!logiH && !!blocForm();
      var petites = troisSurUneLigne
        ? '<div class="paire trois"><div>' + logiH + '</div><div>' + langH + '</div><div>' + centH + '</div></div>'
        : (logiAcoteForm ? '' : logiH) + paire(langH, centH);
      if (logiAcoteForm) { blocs.form = '<div class="paire"><div>' + blocForm() + '</div><div>' + logiH + '</div></div>' + blocCertifs(); }
      blocs.bas = (persoDeveloppee ? '' : bloEngagements) + petites + blocInfos();
      blocs.perso = bloEngagements;
    }
    // Retour Denis 2026-10-01 : sur une colonne, le bloc des competences vient par defaut juste apres les formations (« Competences en haut » reste cochable ;
    // le defaut est calcule par _pdfCompetencesEnHautParDefaut, cvPdfTemplateA4.js).
    var ordre = perso ? opts.ordrePersoRubriques.slice() : (compHaut ? ['comp', 'exp', 'form', 'bas'] : ['exp', 'form', 'comp', 'bas']);
    if (!perso && formAvant) { ordre = ordre.filter(function (k) { return k !== 'form'; }); ordre.splice(ordre.indexOf('exp'), 0, 'form'); }
    if (persoDeveloppee) {
      var apresCle = Math.max(ordre.indexOf('form'), ordre.indexOf('exp'));
      ordre.splice(apresCle + 1, 0, 'perso');
    }
    corps = '<div class="corps" style="padding:0 ' + pad + '">' + ordre.map(function (k) {
      return '<div class="rub-' + k + ((g === 'sobre-fond' && (k === 'comp' || k === 'bas')) ? ' bloc-pale' : '') + '">' + (blocs[k] || '') + '</div>';
    }).join('') + '</div>';
    // DEUXIEME VERSION du deplacement a la souris (Denis, 2026-09-29) : a UNE colonne, la personne compose ses LIGNES dans le grand apercu ; une ligne porte
    // de 1 a 3 rubriques cote a cote (opts.lignesUneColonne = [['pro','comp'], ['exp'], ['logi','langues','centres'], ...]). Les rubriques oubliees sont ajoutees
    // a la fin, dans l'ordre de depart. Ne s'applique que dans l'ordre PERSONNALISE (jamais par-dessus le rendu automatique).
    if (perso && Array.isArray(opts.lignesUneColonne) && opts.lignesUneColonne.length) {
      var parCle1 = { pro: blocPro, comp: blocComp, exp: blocExperiences, form: blocForm, perso: function () { return bloEngagements; }, logi: blocLogi, langues: blocLangues, certifs: blocCertifs, centres: blocCentres, infos: blocInfos };
      var vus1 = {}, lignes1 = [];
      opts.lignesUneColonne.forEach(function (l) {
        var ks = (l || []).filter(function (k) { return parCle1[k] && !vus1[k]; });
        ks.forEach(function (k) { vus1[k] = true; });
        if (ks.length) { lignes1.push(ks.slice(0, 3)); }
      });
      ['pro', 'comp', 'exp', 'form', 'perso', 'logi', 'langues', 'certifs', 'centres', 'infos'].forEach(function (k) { if (!vus1[k]) { vus1[k] = true; lignes1.push([k]); } });
      corps = '<div class="corps" style="padding:0 ' + pad + '">' + lignes1.map(function (ks) {
        // Experience + une rubrique courte sur la meme ligne (retour Denis 2026-10-01) : l'experience a gauche, sur 60 % ; la rubrique courte a droite, sur 40 %.
        var ksExp = (ks.length === 2 && ks.indexOf('exp') !== -1);
        if (ksExp) { ks = ['exp', ks[0] === 'exp' ? ks[1] : ks[0]]; }
        var htmls = ks.map(function (k) { return parCle1[k](); }).filter(Boolean);
        if (!htmls.length) { return ''; }
        var pale = (g === 'sobre-fond' && ks.some(function (k) { return ['pro', 'comp', 'logi', 'langues', 'certifs', 'centres', 'infos'].indexOf(k) !== -1; })) ? ' bloc-pale' : '';
        var contenu = htmls.length === 1 ? htmls[0] : '<div class="paire' + (htmls.length === 3 ? ' trois' : '') + '"' + ((ksExp && htmls.length === 2) ? ' style="grid-template-columns:3fr 2fr"' : '') + '>' + htmls.map(function (h) { return '<div>' + h + '</div>'; }).join('') + '</div>';
        return '<div class="rub-l rub-' + ks[0] + pale + '">' + contenu + '</div>';
      }).join('') + '</div>';
    }
  }

  // ---------- feuille de style (port de la feuille .cv de la maquette) ----------
  var largeurPage = '210mm';
  var hauteurPage = '297mm';
  var css =
'  :root { --kh: ' + kh + '; --cv: ' + couleur + '; --cv2: ' + (/^#[0-9a-fA-F]{6}$/.test(opts.couleurSecondaire || '') ? opts.couleurSecondaire : (couleurFinModele || 'color-mix(in srgb, var(--cv) 45%, #ffffff)')) + '; --tt: ' + tailleTitres + 'px; }' +
'  * { box-sizing: border-box; }' +
'  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }' +
'  .page-a4.cv { position: relative; width: ' + largeurPage + '; min-height: ' + hauteurPage + '; margin: 24px auto; background: #fff; color: #1c2430; box-shadow: 0 2px 10px rgba(0,0,0,.18); padding-bottom: 8mm; font-family: ' + police + '; font-size: ' + tailleTexte.toFixed(2) + 'px; line-height: ' + interligne.toFixed(3) + '; }' +
'  .cv .tete { display: grid; grid-template-columns: 1.15fr 1fr 1.5fr; gap: 14px; padding: 10mm 10mm 9px; align-items: start; }' +
'  .cv .nom { font-size: calc(21px * var(--kh, 1)); font-weight: 700; color: var(--cv); }' +
'  .cv .coord { margin-top: 8px; font-size: calc(11.5px * var(--kh, 1)); line-height: 1.7; }' +
'  .cv .coord div::before { content: ""; display: inline-block; width: 9px; height: 9px; margin-right: 6px; border-radius: 2px; background: var(--cv); opacity: .8; }' +
'  .cv .metier { font-size: calc(19px * var(--kh, 1)); text-transform: uppercase; color: var(--cv); text-align: center; padding-top: 6px; line-height: 1.15; letter-spacing: .01em; }' +
'  .cv .accroche { font-style: italic; font-size: calc(11px * var(--kh, 1)); line-height: 1.4; border-left: 2px solid #cbd3dc; padding-left: 12px; }' +
'  .cv .photo-mq { display: block; width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin: 0 0 6px 0; }' +
'  .cv .trait { height: 4px; background: var(--cv); margin: 0 10mm 4px; border-radius: 2px; }' +
'  .cv .corps { padding: 0 10mm; }' +
'  .cv .corps.deux { display: grid; grid-template-columns: 36% 1fr; gap: 16px; align-items: start; }' +
'  .cv .corps.deux > div { min-width: 0; }' +
// TACHE (P10-bis, retour Denis 2026-09-28) : rubrique qui deborde une colonne -- rendue sous les 2 colonnes,
// pleine largeur (Proposition B de la maquette, validee). L'espacement vient deja du h2 de la rubrique (margin-top).
'  .cv .corps-pleine-largeur { min-width: 0; }' +
'  .cv h2 { font-size: var(--tt, 13px); text-transform: uppercase; letter-spacing: .03em; color: var(--cv); margin: ' + Math.max(12, Math.round(13 * esp)) + 'px 0 ' + Math.max(5, Math.round(5 * esp)) + 'px; padding-bottom: 3px; border-bottom: 1px solid #b9c4d2; display: flex; align-items: center; gap: 6px; }' +
'  .cv h2 span { min-width: 0; overflow-wrap: break-word; }' +
'  .cv.agrandir h2 { font-size: calc(var(--tt, 13px) * 1.27); }' +
'  .cv.ico h2::before { content: ""; width: 11px; height: 11px; border-radius: 3px; background: var(--cv); flex: 0 0 auto; }' +
'  .cv.ico.sobre h2::before { border-radius: 0; background: #20262e; }' +
'  .cv.serre .item { margin-bottom: 3px; }' +
'  .cv.serre li { margin-bottom: 0; }' +
'  .cv.serre h2 { margin: 12px 0 5px; }' +
'  .cv.serre .theme { margin: 3px 0 0; }' +
'  .cv.serre .tete { padding-bottom: 4px !important; }' +
'  .cv .item { margin-bottom: ' + Math.round(8 * esp * multParas) + 'px; position: relative; }' +
'  .cv .ligne { display: flex; justify-content: space-between; gap: 10px; }' +
'  .cv .ligne .dates { white-space: nowrap; font-weight: 400; }' +
'  .cv b, .cv .gras { font-weight: 700; }' +
'  .cv .meta { color: #4b5866; }' +
'  .cv ul { margin: 2px 0 0 0; padding-left: 16px; }' +
'  .cv .liste-2col { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14px; align-items: start; }  .cv .liste-2col > div { break-inside: avoid; }' +
'  .cv .pills-2col, .cv .pills-auto { display: grid; grid-template-columns: 1fr 1fr; gap: 0 6px; }  .cv .pills-2col .pill, .cv .pills-auto .pill { display: block; margin: 0 0 4px 0; }' +
'  .cv .pills-1col .pill { display: block; width: max-content; max-width: 100%; margin: 0 0 4px 0; }  .cv .pills-1col .pill.texte::after { content: ""; }' +
'  .cv .pills-puces .pill.texte::after { content: ""; }  .cv .pills-puces .pill.texte::before { content: var(--puce, "\\2022 "); }' +
// TACHE (P10, retour Denis 2026-09-28) : "Competences en action" force 2 colonnes en Mixte (voir blocThemes) -- classe
// dediee, differente de liste-2col qui attend des <div> (blocListe) et non des <ul>/<li> groupes par theme.
'  .cv .themes-2col { column-count: 2; column-gap: 14px; }  .cv .themes-2col ul { break-inside: auto; margin: 2px 0 6px; }  .cv .themes-2col li { break-inside: avoid; }  .cv .themes-2col .theme { break-after: avoid; }' +
'  .cv li { margin-bottom: 1px; }' +
cssPuces +
'  .cv .pill { display: inline-block; background: #e9ecf0; border-radius: 12px; padding: 2px 9px; margin: 0 4px 4px 0; font-size: .92em; position: relative; }' +
'  .cv .pill.rect { border-radius: 4px; }' +
'  .cv .pill.texte { background: none; padding: 0; margin: 0 .3em 0 0; }' +
'  .cv .pill.texte::after { content: var(--sep, " • "); }' +
'  .cv .pill.texte:last-child::after { content: ""; }' +
'  .cv .paire { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }' +
'  .cv .paire.trois { grid-template-columns: 1fr 1fr 1fr; gap: 14px; }' +
'  .cv .bloc-fond { background: var(--cv); color: #fff; border-radius: 6px; padding: 2px 12px 10px; margin-top: 13px; }' +
'  .cv.degr .bloc-fond { background: linear-gradient(135deg, var(--cv), var(--cv2)); }' +
'  .cv .bloc-fond h2 { color: #fff; border-bottom-color: rgba(255,255,255,.4); margin-top: 8px; }' +
'  .cv .bloc-fond .meta { color: rgba(255,255,255,.85); }' +
'  .cv .bloc-fond .dates { color: #fff; }' +
'  .cv .col-fond { background: var(--cv); color: #fff; padding: 2px 10px 12px; border-radius: 6px; }' +
'  .cv.degr .col-fond { background: linear-gradient(165deg, var(--cv), var(--cv2)); }' +
'  .cv .col-fond h2 { color: #fff; border-bottom-color: rgba(255,255,255,.4); }' +
'  .cv .col-fond .pill { background: rgba(255,255,255,.2); color: #fff; }' +
'  .cv .col-fond .meta { color: rgba(255,255,255,.85); }' +
'  .cv .tete-fond { background: var(--cv); color: #fff; }' +
'  .cv.degr .tete-fond { background: linear-gradient(135deg, var(--cv), var(--cv2)); }' +
'  .cv .tete-fond .nom, .cv .tete-fond .metier { color: #fff; }' +
'  .cv .tete-fond .accroche { border-left-color: rgba(255,255,255,.5); }' +
'  .cv .tete-fond.tete-diag { background: none; position: relative; padding-bottom: 40px !important; }' +
'  .cv .tete-diag::before { content: ""; position: absolute; inset: 0; background: var(--cv); clip-path: polygon(0 0, 100% 0, 100% 74%, 0 100%); z-index: 0; }' +
'  .cv.degr .tete-diag::before { background: linear-gradient(160deg, var(--cv), var(--cv2)); }' +
'  .cv .tete-diag > div { position: relative; z-index: 1; }' +
'  .cv .tete-fond .coord div::before { background: #fff; }' +
'  .cv .theme { font-weight: 700; margin: 6px 0 1px; }' +
'  .cv .src { color: #4b5866; font-size: .88em; }' +
'  .cv.sobre { --pale: color-mix(in srgb, var(--cv) 14%, #ffffff); }' +
'  .cv.sobre h2 { color: #20262e; border-bottom: 2px solid var(--cv); letter-spacing: .04em; }' +
'  .cv.sobre .nom, .cv.sobre .metier { color: #20262e; }' +
'  .cv.sobre .coord div::before { display: none; }' +
'  .cv.sobre .trait { height: 1px; background: #20262e; }' +
'  .cv .tete-pale { background: var(--pale); border-bottom: 1px solid var(--cv); margin-bottom: 4px; }' +
'  .cv .col-pale { background: var(--pale); padding: 2px 12px 12px; }' +
'  .cv .bloc-pale { background: var(--pale); padding: 4px 12px 8px; margin-top: 8px; }' +
'  .cv.cadre { box-shadow: inset 0 0 0 3px var(--cv), 0 2px 10px rgba(0,0,0,.18); }' +
'  .cv.cadre .tete-centree { justify-items: center; text-align: center; }' +
'  .cv.cadre .tete-centree .coord { align-items: center; }' +
'  .cv.cadre .corps.deux > div:first-child { border-right: 1px solid var(--cv); padding-right: 10px; }' +
'  .cv.picto { border-top: 5px solid var(--cv); }' +
'  .cv.picto.ico h2::before { border-radius: 50%; width: 13px; height: 13px; }' +
// TACHE (Denis, 2026-09-25) : reglages supplementaires sur les modeles de la maquette (voir cvPdfTemplateMaquette.js, tete de fichier).
'  .cv .rub-sec { min-width: 0; }' +
'  .cv .tete.libre { display: block; position: relative; padding: 0 !important; }' +
'  .cv .tete.libre > .blc { position: absolute; }' +
'  .cv .blc .nom { font-size: calc(21px * var(--k, 1) * var(--kh, 1)); }' +
'  .cv .blc .coord { margin-top: 0; font-size: calc(11.5px * var(--k, 1) * var(--kh, 1)); }' +
'  .cv .blc .metier { font-size: calc(19px * var(--k, 1) * var(--kh, 1)); padding-top: 0; }' +
'  .cv .blc .accroche { font-size: calc(11px * var(--k, 1) * var(--kh, 1)); }' +
'  .cv .poi-l, .cv .poi-h { display: none; position: absolute; z-index: 6; touch-action: none; }' +
'  .cv .poi-l { top: 0; right: -16px; bottom: 0; width: 32px; cursor: ew-resize; border-radius: 8px; }' +
'  .cv .poi-l::after { content: ""; position: absolute; top: 50%; right: 11px; transform: translateY(-50%); width: 7px; height: 44px; border-radius: 4px; background: #5d6875; box-shadow: 0 0 0 2px rgba(255,255,255,.85); }' +
'  .cv .poi-h { left: 0; right: 0; bottom: -16px; height: 32px; cursor: ns-resize; border-radius: 8px; }' +
'  .cv .poi-h::after { content: ""; position: absolute; left: 50%; bottom: 11px; transform: translateX(-50%); height: 7px; width: 56px; border-radius: 4px; background: #5d6875; box-shadow: 0 0 0 2px rgba(255,255,255,.85); }' +
'  .cv .poi-l:hover, .cv .poi-h:hover { background: rgba(31,90,168,.12); }' +
'  .cv .poi-l:hover::after, .cv .poi-h:hover::after, .cv .poi-l:active::after, .cv .poi-h:active::after { background: #1f5aa8; }' +
'  @media print { .cv .poi-l, .cv .poi-h { display: none !important; } .cv [data-bl] { outline: none !important; background: none !important; } }' +
'  .cv .tete-plat, .cv.degr .tete-plat { background: var(--cv); }' +
'  .cv.degr .tete-inv:not(.tete-diag) { background: linear-gradient(135deg, var(--cv2), var(--cv)); }' +
'  .cv .tete-2c { grid-template-columns: 1fr 1.7fr; }' +
'  .cv .tete-fond .nom, .cv .tete-fond .metier, .cv .tete-fond { color: ' + texteSurFond + '; }' +
'  .cv .col-fond, .cv .bloc-fond { color: ' + texteSurFond + '; }' +
'  .cv .col-fond h2, .cv .bloc-fond h2 { color: ' + texteSurFond + '; }' +
'  .cv .col-fond .pill { color: ' + texteSurFond + '; }' +
'  .cv .tete-fond .coord div::before { background: ' + texteSurFond + '; }' +
(degradeInverse ? '  .cv.degr .col-fond { background: linear-gradient(165deg, var(--cv2), var(--cv)); }' : '') +
'  .cv .col-titres { background: none !important; color: inherit; padding: 0; }' +
'  .cv .col-titres h2 { background: var(--cv); color: ' + texteSurFond + '; border-bottom: 0; padding: 3px 8px; border-radius: 4px; }' +
'  .cv .col-diag-d { clip-path: polygon(0 0, 100% 0, 100% 100%, 12% 100%); padding-left: 22px; }' +
'  .cv .col-diag-g { clip-path: polygon(0 0, 88% 0, 100% 100%, 0 100%); padding-right: 22px; }' +
'  .cv .bande-coord { display: flex; flex-wrap: wrap; gap: 4px 14px; padding: 5px 12px; background: var(--cv); color: ' + texteSurFond + '; border-radius: ' + (coinsArrondis ? '14px' : '6px') + '; font-size: calc(11.5px * var(--kh, 1)); margin-top: 4px; }' +
'  .cv .bande-coord .icone-ligne { margin-right: 4px; }' +
'  .cv .bande-cles { padding-top: 2px; }' +
'  .cv .photo-mq.anneau { box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--cv); }' +
(lectureGuidee ? '  .cv:not(.sobre) .tete:not(.tete-fond) .nom { text-transform: uppercase; letter-spacing: .04em; }' : '') +
((styleTitres === 'sans-decor' || styleTitres === 'aucun') ? '  .cv h2 { border-bottom: 0; }' : '') +
(styleTitres === 'bandeau' ? '  .cv h2 { background: var(--cv); color: #fff; border-bottom: 0; padding: 3px 10px; border-radius: ' + (coinsArrondis ? '10px' : '4px') + '; display: inline-flex; max-width: 100%; }  .cv .col-fond h2, .cv .bloc-fond h2 { background: rgba(255,255,255,.22); }  .cv.ico h2::before { background: #fff; }' : '') +
'  .cv .icone-titre { display: inline-flex; align-items: center; justify-content: center; width: 1.7em; height: 1.7em; border-radius: 50%; background: var(--cv); flex: none; }' +
'  .cv .icone-titre .icone-ligne { width: 0.55em; height: 0.55em; margin: 0; stroke: #fff; }' +
'  .cv.titres-pastille h2 { border-bottom: 0; padding-bottom: 0; color: #1b1b1b; }' +
'  .cv.titres-pastille h2::before { display: none; }' +
'  .cv.pille .item > .ligne { background: var(--cv); border-radius: 999px; padding: 4px 12px; align-items: center; color: #fff; }' +
'  .cv.pille .item > .ligne .dates { color: rgba(255,255,255,.85); }' +
'  .cv.pille .col-fond .item > .ligne { background: rgba(255,255,255,.22); }' +
'  .cv .ent-ameliore { font-weight: 600; }' +
'  .cv.modele-app .pill.texte { display: inline; }' +
'  .cv .bloc-encadre { border: 1px solid var(--cv); border-radius: 16px; padding: 2px 10px 8px; margin-top: 10px; }' +
'  .cv .bloc-encadre h2 { margin-top: 8px; }' +
(coinsArrondis ? '  .cv .tete-fond:not(.tete-diag):not(.tete-vague) { border-radius: 0 0 26px 26px; }' : '') +
'  .page-a4.cv.filet { border-top: 6px solid var(--cv); }' +
'  .page-a4.cv.cadre-page { border: 5px solid var(--cv); }' +
'  .cv .tete-fond.tete-vague { background: none; position: relative; padding-bottom: 34px !important; }' +
'  .cv .tete-plat.tete-vague, .cv.degr .tete-plat.tete-vague { background: none; }' +
'  .cv .tete-vague::before { content: ""; position: absolute; inset: 0; background: var(--cv); clip-path: ' + polyHaut + '; z-index: 0; }' +
'  .cv.degr .tete-vague:not(.tete-plat)::before { background: linear-gradient(160deg, var(--cv), var(--cv2)); }' +
'  .cv .tete-vague > div { position: relative; z-index: 1; }' +
'  .cv.col-vague-g, .cv.col-vague-d { isolation: isolate; }' +
'  .cv.col-vague-g::before, .cv.col-vague-d::before { content: ""; position: absolute; top: 0; bottom: 0; width: ' + colVagueMm + 'mm; background: var(--cv); z-index: -1; }' +
'  .cv.degr.col-vague-g::before, .cv.degr.col-vague-d::before { background: linear-gradient(' + (degradeInverse ? '0deg' : '180deg') + ', var(--cv), var(--cv2)); }' +
'  .cv.col-vague-g::before { left: 0; clip-path: ' + polyColG + '; }' +
'  .cv.col-vague-d::before { right: 0; clip-path: ' + polyColD + '; }' +
'  .cv.col-vague-g .col-fond, .cv.col-vague-d .col-fond { background: none !important; border-radius: 0; padding-left: 0; padding-right: 0; }' +
'  .cv.col-vague-g .tete:not(.libre) > div:first-child .nom, .cv.col-vague-g .tete:not(.libre) > div:first-child .coord, .cv.col-vague-g .blc[data-bl="nom"] .nom, .cv.col-vague-g .blc[data-bl="coord"] .coord, .cv.col-vague-d .tete:not(.libre) > .accroche, .cv.col-vague-d .blc[data-bl="accroche"] .accroche { color: ' + texteSurFond + '; }' +
'  .cv.col-vague-g .tete .coord div::before { background: ' + texteSurFond + '; }' +
'  .cv.col-vague-d .tete .accroche { border-left-color: rgba(255,255,255,.5); }' +
'  .cv.nom-vert { padding-left: 12mm; }' +
'  .cv .bande-nom-vert { position: absolute; top: 0; left: 0; width: 12mm; height: 100%; background: var(--cv); display: flex; align-items: center; justify-content: center; z-index: 3; }' +
'  .cv .bande-nom-vert > span { writing-mode: vertical-rl; transform: rotate(180deg); color: ' + texteSurFond + '; font-weight: 700; font-size: calc(14px * var(--kh, 1)); letter-spacing: .05em; white-space: nowrap; }' +
'  .cv .photo-mq.photo-losange { width: 84px; height: 84px; border-radius: 0; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); box-shadow: none; }' +
'  .cv .tete-med { position: relative; margin-bottom: 38px; }' +
'  .cv .tete-med:not(.libre) { grid-template-columns: 1.6fr 1fr 1.5fr; }' +
'  .cv .tete-med:not(.libre) > div:first-of-type { padding-left: 22mm; }' +
'  .cv .photo-mq.medaillon { position: absolute; left: ' + pad + '; bottom: 0; transform: translateY(50%); width: 72px; height: 72px; margin: 0; z-index: 4; box-shadow: 0 0 0 4px #fff; }' +
'  .cv .tete-centree { justify-items: center; text-align: center; }' +
'  .cv .tete-centree .coord { align-items: center; }' +
(styleTitres === 'pastille' ? '  .cv.ico h2::before { border-radius: 50%; width: 13px; height: 13px; }' : '') +
(bordureEpaisse ? '  .cv h2 { border-bottom-width: 2px; }  .cv .trait { height: 6px; }  .cv .accroche { border-left-width: 3px; }' : '') +
(coinsArrondis ? '  .cv .pill { border-radius: 14px; }  .cv .pill.rect { border-radius: 8px; }  .cv .col-fond, .cv .bloc-fond { border-radius: 14px; }' : '') +
(eviterTitreSeul ? '  .cv h2 { break-after: avoid; }' : '') +
'  .cv .ent-ameliore { color: var(--cv); }' +
'  .cv.pleine { display: flex; flex-direction: column; padding-bottom: 0; }' +
'  .cv.pleine .corps { flex: 1; display: grid; align-items: stretch; }' +
'  .cv.pleine .col-fond { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }' +
(fondPuces ? '  .cv .pill { background: ' + fondPuces + '; }' : '') +
(textePuces ? '  .cv .pill { color: ' + textePuces + '; }' : '') +
'  .cv .lieu-italique { font-style: italic; }' +
'  .cv .lieu-gris { color: #6b7684; }' +
'  .cv .col-fond .lieu-gris, .cv .bloc-fond .lieu-gris { color: rgba(255,255,255,.78); }' +
'  .cv .ctl-exp { position: absolute; right: -2px; top: -3px; display: none; gap: 2px; z-index: 4; }' +
'  .cv .pill .x, .cv li .x { display: none; }' +
'  .cv.justif .item li, .cv.justif .accroche { text-align: justify; }' +
'  .cv.sepcol .corps.deux > div:first-child { border-right: 1px solid #d5dbe4; padding-right: 8px; }' +
'  .cv.sans-icoc .coord div::before { display: none; }' +
'  .cv .icone-ligne { width: 0.85em; height: 0.85em; vertical-align: -0.1em; margin-right: 0.32em; flex-shrink: 0; }' +
'  @media print { .page-a4.cv { margin: 0 auto; box-shadow: none; } .cv .item { break-inside: avoid; } }' +
'';

  var bandeNom = nomVert ? '<div class="bande-nom-vert"><span>' + ed('nom', nomComplet) + '</span></div>' : '';
  var pageHtml = '<div class="' + classes.join(' ') + '">' + bandeNom + tete + corps + '</div>';
  return { css: css + _pdfCssCouleursZones(opts.couleursZones, opts.zonesLiees), pageHtml: pageHtml, nomComplet: nomComplet, largeurPage: largeurPage, hauteurPage: hauteurPage };
}

// TACHE (Denis, 2026-09-25, tranche 4) : port de ajusterHauteurTete() de la maquette. Appelee apres CHAQUE rendu (petit
// apercu dans le panneau, plein ecran) sur l'element de la feuille : place « coordonnees » juste sous le nom, « accroche »
// sous le titre en disposition 2 colonnes, et, tant que la personne n'a pas fixe la hauteur, adapte la hauteur de
// l'en-tete libre a son contenu.
// Zone libre des trois rectangles de competences (Rectangles arrondis) : le rectangle « Savoirs » se place, tant que la personne ne l'a pas deplace, juste
// sous les deux autres (avec le leger chevauchement du modele), et la zone prend la hauteur de son contenu tant que la personne ne l'a pas fixee.
function _pdfMqApresRenduRectangles(feuille) {
  var zb = feuille.querySelector('.rc-boxes.libre');
  if (!zb) { return; }
  var qz = function (k) { return zb.querySelector('.blc[data-bl="' + k + '"]'); };
  // Disposition de depart : le rectangle des competences comportementales (a droite) ne doit jamais cacher le texte du premier. S'il le
  // ferait, il commence juste apres la fin de ce texte (et se rétrécit d'autant) ; tant que la personne ne l'a pas place ou elargi elle-meme.
  if (zb.getAttribute('data-posb2') !== '1' && qz('b1') && qz('b2')) {
    var zr = zb.getBoundingClientRect(), finTexte = 0;
    Array.prototype.forEach.call(qz('b1').querySelectorAll('.rc-boxt, li'), function (t) {
      var plage = t.ownerDocument.createRange();
      plage.selectNodeContents(t);
      Array.prototype.forEach.call(plage.getClientRects(), function (q) { if (q.width > 0) { finTexte = Math.max(finTexte, q.right - zr.left); } });
    });
    var gauche = qz('b2').offsetLeft;
    if (finTexte + 14 > gauche && zb.offsetWidth - (finTexte + 14) >= 150) {
      qz('b2').style.left = (Math.round((finTexte + 14) / zb.offsetWidth * 1000) / 10) + '%';
      qz('b2').style.width = (Math.round((zb.offsetWidth - (finTexte + 14)) / zb.offsetWidth * 1000) / 10) + '%';
    }
  }
  if (zb.getAttribute('data-posb3') !== '1' && qz('b3')) {
    var bas = 0;
    ['b1', 'b2'].forEach(function (k) { var e = qz(k); if (e) { bas = Math.max(bas, e.offsetTop + e.offsetHeight); } });
    qz('b3').style.top = Math.max(0, bas - 8) + 'px';
  }
  if (zb.getAttribute('data-hfixe') === '1') { return; }
  var maxB = 0;
  Array.prototype.forEach.call(zb.querySelectorAll('.blc'), function (b) { maxB = Math.max(maxB, b.offsetTop + b.offsetHeight); });
  zb.style.height = (maxB + 8) + 'px';
}
function _pdfMqApresRendu(feuille) {
  if (!feuille) { return; }
  _pdfMqApresRenduRectangles(feuille);
  var t = feuille.querySelector('.tete.libre');
  if (!t) { return; }
  var qb = function (k) { return t.querySelector('.blc[data-bl="' + k + '"]'); };
  if (t.getAttribute('data-posc') !== '1' && qb('nom') && qb('coord')) { qb('coord').style.top = (qb('nom').offsetTop + qb('nom').offsetHeight + 4) + 'px'; }
  if (t.getAttribute('data-disp') === '2' && t.getAttribute('data-posa') !== '1' && qb('metier') && qb('accroche')) { qb('accroche').style.top = (qb('metier').offsetTop + qb('metier').offsetHeight + 8) + 'px'; }
  if (t.getAttribute('data-hfixe') === '1') { return; }
  var maxB = 0;
  Array.prototype.forEach.call(t.querySelectorAll('.blc'), function (b) { maxB = Math.max(maxB, b.offsetTop + b.offsetHeight); });
  var besoin = maxB + 12;
  if (t.classList.contains('tete-diag')) { besoin = Math.max(besoin, Math.ceil(maxB / 0.74) + 4); }
  if (t.classList.contains('tete-vague')) { besoin = Math.max(besoin, Math.ceil(maxB / 0.8) + 4); }
  t.style.height = Math.max(parseInt(t.getAttribute('data-h0'), 10) || 172, besoin) + 'px';
}
