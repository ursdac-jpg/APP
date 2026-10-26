/* ============================================================
   Module « Mes modèles » (jusqu'à 5 modèles de CV gardés) : logique pure (aucun accès au DOM, testée par `npm test`).
   Chantier : docs/CHANTIER_CREER_CV_SANS_ASSISTANT_2026-10-25.md ; maquette : docs/MAQUETTE_CREER_CV_TROIS_PARCOURS_ET_MODELES_2026-10-25.html.

   Principe : la personne regarde nos modèles sur un CV d'exemple et en garde jusqu'à 5. Un modèle gardé = le STYLE seul (modèle, couleurs, polices, formes,
   ambiance, en-tête), JAMAIS le contenu (expériences cochées, missions retirées, textes corrigés, ordre choisi...) : c'est ce qui permet de le poser ensuite
   sur le vrai CV de la personne sans rien y mêler. Le style vit dans deux réglages du dossier : `pdfReglages` (moteur PDF) et `reglagesMiseEnPageCV`
   (modèle canonique). Le tri ci-dessous est la SEULE source de ce qui est du style et de ce qui est du contenu.
   Modèle canonique (`reglagesMiseEnPageCV`) : tout est du style SAUF la liste du contenu (les clés y apparaissent au fil des choix : une clé nouvelle est du style).
   Moteur PDF (`pdfReglages`) : la liste du style, plus toute clé « reg... » (état d'un réglage de l'écran) ; toute AUTRE clé inconnue n'est pas rapportée
   (jamais un contenu qui fuit) et `mgClesNonClassees` la signale (essai navigateur).
   ============================================================ */

var MG_MAX = 5;

// Réglages du moteur PDF (dossier.pdfReglages) qui sont du STYLE.
var MG_CLES_PDF_STYLE = [
  'regSobreActif', 'regCreatifActif', 'regFormatExperiences', 'regColonnes', 'regFormationsMisesEnAvant', 'regColonnesInversees', 'regFormeColonnes',
  'regColonneBordDroit', 'regColonneArche', 'regColonneForme', 'regBordBandeauSens', 'regColonneSens', 'regTexteHors', 'regTexteHorsPerso', 'regBandeauTeinte',
  'regColonneTeinte', 'regBordBandeau', 'regSeparateurColonnes', 'regCouleurDebut', 'regCouleurFin', 'regFondColonnes', 'regFondColonnesEffet', 'regDegradeColonnes',
  'regFondColonnePleineHauteur', 'regFondColonnesA5', 'regEnteteInverseeA5', 'regRemplirPageA5', 'regBandeauEnTete', 'regFormeEnTete', 'regDegradeBandeau',
  'regBandeauDisponibilite', 'regDispositionEntete', 'regPositionLibreEntete', 'regAnneauPhoto', 'regStyleTitres', 'regLectureGuidee', 'regStyleProfessionnel',
  'regStylePersonnel', 'regStyleFormations', 'regSeparateurMissions', 'regSoulignerPoste', 'regItaliquePoste', 'regSoulignerDates', 'regItaliqueDates',
  'regSoulignerEntreprise', 'regItaliqueEntreprise', 'regStyleBordures', 'regStyleCompetences', 'regCouleurFondCompetences', 'regCouleurTextePuces', 'regIcones',
  'regIconesCoordonnees', 'regPolice', 'regTexteFondColonnes', 'regBandeauCompetencesCles', 'regCoinsArrondis',
  'creatifVariante', 'sobreVariante', 'echellesRubriques', 'enteteBoost', 'policesRubriques', 'stylesPuceRubriques', 'positionsEntete', 'hauteurEntete',
  'stylesTexteEntete', 'modePresentation', 'afficherLieuExp', 'afficherDuree', 'lieuDansMarge', 'nomEmpattement', 'traitVertical', 'coinCouleur', 'formesDeco',
  'composition', 'compositionTrait', 'croisement', 'decor', 'enteteMin', 'styleLieuExp', 'positionDatesExp', 'positionDatesChoisie', 'datesAlignees',
  'positionDatesFormations', 'positionDatesPerso', 'espacementFormations', 'colonnesAvantModele', 'enteteLibreMq', 'enteteDecaleeAuto', 'enteteParModele',
  'cleModeleEntete', 'choixMq', 'titresAgrandis'
];

// Réglages du moteur PDF liés au CONTENU de la personne ou à son format de page : jamais rapportés d'un modèle gardé (restent ceux du vrai CV).
var MG_CLES_PDF_CONTENU = [
  'echelle', 'regFormatCV', 'regSansAccroche', 'regLettreJointe', 'regRegroupementActif', 'regOrdreExperiences', 'ordrePersonnalise', 'rubriquesForceesColonne',
  'textesEdites', 'experiencesTout', 'experiencesChoisies', 'missionsParExperience', 'missionsChoisies', 'missionsGlobal', 'ordreExperiencesMien',
  'ordreFormationsMien', 'ordreFormations', 'ordreExpPersoMien', 'ordreExpPerso', 'certifsRubrique', 'ordreMissions', 'reglagesRubriquesMq',
  'qualitesMetierActives', 'afficherCompPro', 'afficherCompComp', 'afficherMissionsFormation', 'competencesProMax', 'competencesComportementalesMax',
  'competencesEnHaut', 'competencesRetirees', 'rubriquesRetirees', 'missionsRetirees', 'historiqueRetraits', 'avantA5', 'formatPrecedent', 'textesEditesMq',
  'formationsAvantExp', 'organisationPerso', 'ordrePersoRubriques', 'experiencePersoTout', 'experiencePersoChoisies', 'missionsParExpPerso',
  'missionsChoisiesExpPerso', 'texteParExpPerso', 'expPersoModeAffichage', 'formationsTout', 'formationsChoisies', 'missionsParFormation',
  'missionsChoisiesFormation', 'texteParFormation', 'certifsUneParUne'
];

// Modèle canonique (dossier.reglagesMiseEnPageCV) : STYLE.
var MG_CLES_MEP_STYLE = [
  'colonnes', 'taille', 'densite', 'interligne', 'espacementParas', 'marges', 'alignement', 'colonnesInversees', 'largeurColonneGauche', 'formeColonnes',
  'separateurColonnes', 'separateurCouleur', 'fondColonnesA5', 'enteteInverseeA5', 'remplirPageA5', 'echelleA5', 'accent', 'accentClair', 'nuance',
  'fondColonnes', 'fondColonnesEffet', 'fondColonnePleineHauteur', 'degradeColonnes', 'texteFondColonnes', 'couleurFondCompetences', 'couleurTextePuces',
  'bandeauEnTete', 'formeEnTete', 'degradeBandeau', 'bandeauDisponibilite', 'dispositionEntete', 'anneauPhoto', 'positionLibreEntete', 'largeurAccrocheLibre',
  'largeurMetierLibre', 'police', 'styleTitres', 'lectureGuidee', 'styleCompetences', 'icones', 'iconesCoordonnees', 'styleBordures', 'styleProfessionnel',
  'stylePersonnel', 'styleFormations', 'separateurMissions', 'bandeauCompetencesCles', 'coinsArrondis', 'souligner', 'italique', 'ordreDatesPoste',
  'accrocheItalique', 'formatExperiences', 'formationsMisesEnAvant', 'veuves', 'allure',
  // apparus après un choix de couleur ou de forme (Style rapide, bandeau) : le même style, écrit dans le modèle canonique
  'baseCouleur', '_couleurChoisie', 'dernieresCouleurs', 'bordBandeau', 'bordBandeauSens'
];

// Modèle canonique : CONTENU, format de page ou état interne.
var MG_CLES_MEP_CONTENU = [
  'format', 'pages', 'couleurEntrepriseActive', 'ordreExperiences', 'sansAccroche', 'lettreJointe', 'regroupement', 'rubriques', 'ordreRubriques',
  'blocMisEnAvant', 'blocMisEnAvantGauche', 'blocMisEnAvantDroite', 'formations', '_baseApplique', '_pillAvant'
];

function mgCloner(x) { return (x === undefined) ? undefined : JSON.parse(JSON.stringify(x)); }

function mgEstStylePdf(k) {
  if (MG_CLES_PDF_CONTENU.indexOf(k) >= 0) { return false; }
  return MG_CLES_PDF_STYLE.indexOf(k) >= 0 || /^reg[A-Z]/.test(k);
}
function mgEstStyleMep(k) {
  if (MG_CLES_MEP_CONTENU.indexOf(k) >= 0) { return false; }
  if (k.charAt(0) === '_') { return k === '_couleurChoisie'; }   // les autres états internes (« _pillAvant »...) ne sont pas du style
  return true;
}
function _mgCopierCles(source, estStyle, cible) {
  if (!source || typeof source !== 'object') { return; }
  Object.keys(source).forEach(function (k) { if (estStyle(k) && source[k] !== undefined) { cible[k] = mgCloner(source[k]); } });
}

// Le style seul d'un CV : { pdf, mep }. Les intitulés de rubriques choisis par la personne (mots, pas aspect) n'en font pas partie.
function mgExtraireStyle(pdfReglages, reglagesMep) {
  var style = { pdf: {}, mep: {} };
  _mgCopierCles(pdfReglages, mgEstStylePdf, style.pdf);
  _mgCopierCles(reglagesMep, mgEstStyleMep, style.mep);
  if (style.pdf.choixMq && typeof style.pdf.choixMq === 'object') { delete style.pdf.choixMq.intitulesPerso; }
  return style;
}

// Pose un style sur les réglages d'un vrai CV : le contenu choisi par la personne reste (clés hors liste), seul le style est remplacé.
// Rend de NOUVEAUX objets (rien n'est modifié). `_baseApplique` est remis à faux : le Word et le modèle canonique se recalculent à l'ouverture.
function mgAppliquerStyle(pdfReel, mepReel, style) {
  var pdf = mgCloner(pdfReel) || {};
  var mep = mgCloner(mepReel) || {};
  var s = style || {};
  _mgCopierCles(s.pdf, mgEstStylePdf, pdf);
  _mgCopierCles(s.mep, mgEstStyleMep, mep);
  mep._baseApplique = false;
  return { pdf: pdf, mep: mep };
}

function _mgTrier(x) {
  if (Array.isArray(x)) { return x.map(_mgTrier); }
  if (x && typeof x === 'object') { var o = {}; Object.keys(x).sort().forEach(function (k) { o[k] = _mgTrier(x[k]); }); return o; }
  return x;
}
// Empreinte stable d'un style (même style = même texte, quel que soit l'ordre des clés).
function mgSignature(style) {
  var s = style || {};
  return JSON.stringify(_mgTrier({ pdf: s.pdf || {}, mep: s.mep || {} }));
}
function mgMemeStyle(a, b) { return mgSignature(a) === mgSignature(b); }

// Les clés qui demandent un regard : pour le moteur PDF, une clé qui n'est ni du style ni du contenu connu ; pour le modèle canonique, un état interne « _... » inconnu.
function mgClesNonClassees(pdfReglages, reglagesMep) {
  var inconnues = { pdf: [], mep: [] };
  Object.keys(pdfReglages || {}).forEach(function (k) { if (!mgEstStylePdf(k) && MG_CLES_PDF_CONTENU.indexOf(k) < 0) { inconnues.pdf.push(k); } });
  Object.keys(reglagesMep || {}).forEach(function (k) { if (k.charAt(0) === '_' && !mgEstStyleMep(k) && MG_CLES_MEP_CONTENU.indexOf(k) < 0) { inconnues.mep.push(k); } });
  return inconnues;
}

/* ---------- La liste des modèles gardés ---------- */
// Un modèle gardé : { id, nom, style: { pdf, mep } }. La liste ne contient aucune information personnelle.

function mgNormaliserListe(brut) {
  if (!Array.isArray(brut)) { return []; }
  var vus = {}, liste = [];
  brut.forEach(function (m) {
    if (!m || typeof m !== 'object' || typeof m.id !== 'string' || !m.id || vus[m.id] || !m.style || typeof m.style !== 'object') { return; }
    vus[m.id] = true;
    liste.push({ id: m.id, nom: String(m.nom || 'Modèle'), style: { pdf: mgCloner(m.style.pdf) || {}, mep: mgCloner(m.style.mep) || {} } });
  });
  return liste.slice(0, MG_MAX);
}

function mgTrouverParStyle(liste, style) {
  var sig = mgSignature(style);
  for (var i = 0; i < (liste || []).length; i++) { if (mgSignature(liste[i].style) === sig) { return liste[i]; } }
  return null;
}
function mgListePleine(liste) { return (liste || []).length >= MG_MAX; }

function mgNouvelId(liste) {
  var n = 1, pris = {};
  (liste || []).forEach(function (m) { pris[m.id] = true; });
  while (pris['mg' + n]) { n++; }
  return 'mg' + n;
}

// Ajoute un modèle. { ok, raison ('plein' | 'deja' | ''), liste (nouvelle), modele }.
function mgAjouter(liste, nom, style) {
  var l = mgNormaliserListe(liste);
  var existant = mgTrouverParStyle(l, style);
  if (existant) { return { ok: false, raison: 'deja', liste: l, modele: existant }; }
  if (mgListePleine(l)) { return { ok: false, raison: 'plein', liste: l, modele: null }; }
  var modele = { id: mgNouvelId(l), nom: String(nom || 'Modèle'), style: { pdf: mgCloner(style && style.pdf) || {}, mep: mgCloner(style && style.mep) || {} } };
  return { ok: true, raison: '', liste: l.concat([modele]), modele: modele };
}
function mgRetirer(liste, id) { return mgNormaliserListe(liste).filter(function (m) { return m.id !== id; }); }

/* ---------- Le CV d'exemple ---------- */
// Silhouette neutre, sans traits de visage (règle du projet) : une tête et des épaules grises.
var MG_PHOTO_EXEMPLE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#dfe4ec"/><circle cx="50" cy="38" r="17" fill="#9aa5b8"/><path d="M14 100c0-24 16-38 36-38s36 14 36 38z" fill="#9aa5b8"/></svg>');

// Les informations du CV d'exemple (fictives, génériques, jamais celles de la personne). Un nouvel objet à chaque appel.
function mgContenuExemple() {
  return {
    identite: { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', adresse: '3 rue des Lilas', codePostal: '87000', telephone: '0600000000', email: 'camille@exemple.fr', ville: 'Limoges' },
    titreCV: 'Agent polyvalent',
    metierCible: 'Agent polyvalent',
    accroche: 'Exemple de phrase d’accroche : une personne sérieuse, à l’écoute et organisée.',
    experiences: [
      { poste: 'Agent polyvalent', entreprise: 'Entreprise exemple', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Accueillir le public\nTenir la caisse\nRanger les rayons\nRédiger des comptes rendus' },
      { poste: 'Employée de restauration', entreprise: 'Restaurant exemple', lieu: 'Limoges', dateDebut: '2019-01', dateFin: '2021-12', missions: 'Servir en salle\nPréparer les commandes\nNettoyer la salle' },
      { poste: 'Aide à domicile', entreprise: 'Association exemple', lieu: 'Limoges', dateDebut: '2017-05', dateFin: '2018-12', missions: 'Aider aux courses\nAccompagner les sorties' }
    ],
    formations: [
      { niveau: 'CAP', intitule: 'Employé polyvalent', etablissement: 'Centre de formation exemple', annee: '2021', missions: 'Accueil\nVente' },
      { niveau: 'Brevet', intitule: 'Brevet des collèges', etablissement: 'Collège exemple', annee: '2016', missions: '' }
    ],
    competencesCV: ['Sens du contact', 'Rigueur', 'Travail en équipe', 'Ponctualité'],
    langues: [{ langue: 'Anglais', niveau: 'B1' }],
    loisirs: ['Course à pied', 'Cuisine'],
    photo: { url: MG_PHOTO_EXEMPLE, inclure: true, souhaitee: 'oui' }
  };
}

// Remplit un dossier VIERGE avec le CV d'exemple (le dossier est modifié et rendu).
function mgRemplirDossierExemple(d) {
  var c = mgContenuExemple();
  d.modeCreation = 'nouveau';
  d.creationSansAssistant = true;
  d.formatCV = 'pdf';
  d.dernierDocumentPrepare = 'cv';
  d.identiteEnregistree = true;
  d.identite = c.identite;
  d.titreCV = c.titreCV;
  d.metierCible = c.metierCible;
  d.experiences = c.experiences;
  d.formations = c.formations;
  d.competencesCV = c.competencesCV;
  d.langues = c.langues;
  d.loisirs = c.loisirs;
  d.photo = c.photo;
  d.ia = d.ia || {};
  d.ia.cv = Object.assign({}, d.ia.cv, { profil: c.accroche });
  return d;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MG_MAX: MG_MAX, MG_CLES_PDF_STYLE: MG_CLES_PDF_STYLE, MG_CLES_PDF_CONTENU: MG_CLES_PDF_CONTENU, MG_CLES_MEP_STYLE: MG_CLES_MEP_STYLE, MG_CLES_MEP_CONTENU: MG_CLES_MEP_CONTENU,
    mgEstStylePdf: mgEstStylePdf, mgEstStyleMep: mgEstStyleMep, mgExtraireStyle: mgExtraireStyle, mgAppliquerStyle: mgAppliquerStyle, mgSignature: mgSignature, mgMemeStyle: mgMemeStyle, mgClesNonClassees: mgClesNonClassees,
    mgNormaliserListe: mgNormaliserListe, mgTrouverParStyle: mgTrouverParStyle, mgListePleine: mgListePleine, mgNouvelId: mgNouvelId, mgAjouter: mgAjouter, mgRetirer: mgRetirer,
    mgContenuExemple: mgContenuExemple, mgRemplirDossierExemple: mgRemplirDossierExemple, MG_PHOTO_EXEMPLE: MG_PHOTO_EXEMPLE
  };
}
