/* ============================================================
   modules/comprendre-les-chiffres/index.js
   ------------------------------------------------------------
   Module « Comprendre les chiffres » (2e sous-carte de « Se tenir
   informé »). Point d'entrée unique et orchestrateur pur, même principe
   que modules/comprendre-le-cadre/index.js : jamais un module qui laisse
   son rendu dans js/app.js. Voir ARCHITECTURE_TECHNIQUE.md (ce dossier).

   RÈGLE STRICTE (FAMILLE 1) : module de pure consultation. Aucune donnée
   personnelle n'y transite, rien n'est écrit dans `dossier`, rien à
   sauvegarder ni à reprendre. L'état de navigation interne est
   volontairement perdu au rechargement, jamais persisté. Aucun assistant
   en ligne n'est appelé d'ici : un texte de recherche peut être préparé
   pour être copié ailleurs, aucun fetch() vers un assistant ne part d'ici.

   Chantier : docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md
   Maquette de référence (consigne n°1 de Denis : implémentation IDENTIQUE) :
   docs/MAQUETTE_COMPRENDRE_LES_CHIFFRES_2026-09-06.html

   Statut : BLOC 3 - couche 1 (les 5 chiffres clés) branchée sur le digest
   trimestriel modules/comprendre-les-chiffres/contenu/<mois>.md. Le
   portrait du territoire, la comparaison européenne, l'outil « croiser »,
   la vue d'ensemble et la partie B se branchent aux blocs suivants.
   ============================================================ */

// ============================================================
// ÉTAT
// ============================================================

// État de navigation interne, hors de `dossier` (voir la règle stricte).
// ecran : 'accueil' | 'porteA' | 'porteB'
// niveau : niveau de lecture des chiffres, 'dep' = mon département,
//   'na' = ma région (Nouvelle-Aquitaine), 'fr' = France, 'ue' = Union
//   européenne.
// vue : 'simple' (public) | 'ensemble' (professionnel).
var _comprendreLesChiffresEtat = { ecran: 'accueil', niveau: null, vue: 'simple', croiserPeriode: 'trimestre' };

// Détour de consultation : vrai pendant qu'on regarde la page de
// présentation APRÈS « Revoir la présentation » depuis le module.
var _comprendreLesChiffresDetourPresentation = false;

// Cache du digest trimestriel (null tant que non chargé). Rempli une fois
// par session par _comprendreLesChiffresChargerDigest().
var _comprendreLesChiffresDigest = null;
// 'inactif' | 'encours' | 'ok' | 'vide' | 'erreur'
var _comprendreLesChiffresChargement = 'inactif';

// Fil d'Ariane du module (liste FIXE, jamais le nom du module lui-même).
var COMPRENDRE_LES_CHIFFRES_ETAPES = [
  { label: 'Les chiffres', icone: '&#128202;' },
  { label: 'Une autre question', icone: '&#128269;' }
];

function _comprendreLesChiffresIndexEtape() {
  var e = _comprendreLesChiffresEtat.ecran;
  if (e === 'porteA' || e === 'porteB' || e.indexOf('resultat') === 0) { return 1; }
  return 0;
}

// ============================================================
// TERRITOIRE (composant partagé de « Comprendre le cadre »)
// ============================================================

function _comprendreLesChiffresDepartementCourant() {
  return (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
}
function _comprendreLesChiffresTerritoireConnu() {
  return typeof departementRessourcesMemorise === 'function' && !!departementRessourcesMemorise();
}
function _comprendreLesChiffresLibelleDepartement() {
  var dep = _comprendreLesChiffresDepartementCourant();
  if (dep === '24') { return 'la Dordogne (24)'; }
  if (dep === '87') { return 'la Haute-Vienne (87)'; }
  return 'hors Dordogne et Haute-Vienne';
}

var COMPRENDRE_LES_CHIFFRES_NIVEAUX = [
  { cle: 'dep', libelle: 'Mon département' },
  { cle: 'na', libelle: 'Ma région (Nouvelle-Aquitaine)' },
  { cle: 'fr', libelle: 'France entière' },
  { cle: 'ue', libelle: 'Union européenne' }
];
function _comprendreLesChiffresNiveauCourant() {
  return _comprendreLesChiffresEtat.niveau || 'dep';
}
// Code de territoire ('24' | '87' | 'na' | 'fr') du niveau de lecture,
// pour aller chercher la bonne ligne du digest.
function _comprendreLesChiffresTerritoireDuNiveau() {
  var n = _comprendreLesChiffresNiveauCourant();
  if (n === 'na') { return 'na'; }
  if (n === 'fr') { return 'fr'; }
  var dep = _comprendreLesChiffresDepartementCourant();
  return (dep === '87') ? '87' : '24';
}
function _comprendreLesChiffresLibelleNiveau() {
  var n = _comprendreLesChiffresNiveauCourant();
  if (n === 'dep') {
    var dep = _comprendreLesChiffresDepartementCourant();
    return (dep === '87') ? 'la Haute-Vienne' : 'la Dordogne';
  }
  if (n === 'na') { return 'la Nouvelle-Aquitaine'; }
  if (n === 'fr') { return 'la France entière'; }
  return 'l’Union européenne';
}
// Forme courte pour un en-tête de colonne (« Dordogne (24) », « France »...).
function _comprendreLesChiffresLibelleNiveauCourt() {
  var n = _comprendreLesChiffresNiveauCourant();
  if (n === 'dep') {
    return (_comprendreLesChiffresDepartementCourant() === '87') ? 'Haute-Vienne (87)' : 'Dordogne (24)';
  }
  if (n === 'na') { return 'Nouvelle-Aquitaine'; }
  if (n === 'fr') { return 'France'; }
  return 'Union européenne';
}

// ============================================================
// DÉTOUR « Revoir la présentation »
// ============================================================

function _comprendreLesChiffresRevoirPresentation() {
  _comprendreLesChiffresDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('comprendre-les-chiffres-intro'); }
}
function comprendreLesChiffresRevenirDeLaPresentation() {
  _comprendreLesChiffresDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('comprendre-les-chiffres'); }
}
window.comprendreLesChiffresRevenirDeLaPresentation = comprendreLesChiffresRevenirDeLaPresentation;

// « Retour » de la barre du bas depuis l'accueil du module : on ouvre la
// présentation en mode NORMAL (jamais en détour), pour que son propre
// « Retour » continue vers la vraie page précédente (la carte « Se tenir
// informé ») au lieu de revenir dans le module. En détour, la
// présentation afficherait « Revenir au module » et on bouclerait
// accueil <-> présentation sans fin (LECONS section 2, variante boucle
// infinie ; balayage 2026-09-09). À ne pas confondre avec
// _comprendreLesChiffresRevoirPresentation() (bouton « Revoir la
// présentation » de l'en-tête), qui ouvre la présentation EN DÉTOUR.
function _comprendreLesChiffresRetour() {
  _comprendreLesChiffresDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('comprendre-les-chiffres-intro'); }
}

// Un seul cran en arrière à la fois, jamais un saut par-dessus l'accueil
// du module - PARTAGÉE par le bouton contextuel en tête de chaque écran ET
// le bouton « Retour » de la barre fixe du bas (les deux se comportent
// EXACTEMENT pareil, voir ARCHITECTURE_TECHNIQUE.md, consigne Denis).
function _comprendreLesChiffresAllerVersPrecedent() {
  var e = _comprendreLesChiffresEtat;
  if (e.ecran === 'porteA' || e.ecran === 'porteB') {
    e.ecran = 'accueil';
    pageComprendreLesChiffres();
    return;
  }
  // Déjà sur l'accueil (ou l'écran-porte territoire) : on sort vers la
  // présentation en mode NORMAL, jamais en détour, sinon accueil <->
  // présentation en boucle (LECONS section 2, variante boucle infinie).
  _comprendreLesChiffresRetour();
}

// ============================================================
// EN-TÊTE ET PIED COMMUNS
// ============================================================

// Fil « Vous êtes ici » (consigne 93) : le nom du module (jamais un mot isolé), puis le lieu courant.
function _comprendreLesChiffresChaineFil() {
  var nom = 'Comprendre les chiffres';
  if (_comprendreLesChiffresIndexEtape() === 0) { return [{ label: nom, aller: null }]; }
  return [{ label: nom, aller: 0 }, { label: COMPRENDRE_LES_CHIFFRES_ETAPES[1].label, aller: null }];
}
function _comprendreLesChiffresFilAller() {
  _comprendreLesChiffresEtat.ecran = 'accueil';
  pageComprendreLesChiffres();
}

function _comprendreLesChiffresRenduEnTete() {
  return '' +
    (typeof barreRepereNavigation === 'function'
      ? barreRepereNavigation(COMPRENDRE_LES_CHIFFRES_ETAPES, _comprendreLesChiffresIndexEtape(), { chaine: _comprendreLesChiffresChaineFil(), surClic: '_comprendreLesChiffresFilAller' })
      : '') +
    (typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule('btnComprendreLesChiffresRevoirIntro', 'bi-bar-chart', 'Revoir la présentation', false)
      : '');
}

function _comprendreLesChiffresRenduPiedFixe() {
  return (typeof barreNavigation === 'function')
    ? '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_comprendreLesChiffresAllerVersPrecedent()' }) + '</div>'
    : '';
}

function _comprendreLesChiffresRenduBoutonRetour(libelle) {
  return '<button type="button" class="btn btn-primary comprendre-les-chiffres-bouton-retour" data-comprendre-les-chiffres-retour>' +
    '<i class="bi bi-arrow-left"></i> ' + libelle + '</button>';
}
function _comprendreLesChiffresBrancherRetour(onRetour) {
  var btn = document.querySelector('[data-comprendre-les-chiffres-retour]');
  if (btn) { btn.addEventListener('click', onRetour); }
}

// ============================================================
// ÉCRAN-PORTE : choix du territoire obligatoire
// ============================================================

// Aperçu verrouillé : la liste de ce que le module répond, montrée mais
// non cliquable tant que le département n'est pas choisi (décision Denis
// 2026-09-09 : "je veux qu'on voie le contenu, mais qu'il soit
// inaccessible tant que je n'ai pas choisi le territoire"). Pas les
// chiffres eux-mêmes : ils dépendent du département et n'ont pas encore
// de valeur. On montre les questions traitées, pas des nombres inventés.
function _comprendreLesChiffresRenduApercuContenu() {
  var chiffresCles = COMPRENDRE_LES_CHIFFRES_CARTES.map(function (c) {
    return '<li>' + _comprendreLesChiffresEchappe(c.q) + '</li>';
  }).join('');
  return '' +
    '<h2 class="comprendre-les-chiffres-section">Les cinq chiffres clés du territoire</h2>' +
    '<ul class="comprendre-les-chiffres-apercu-liste">' + chiffresCles + '</ul>' +
    '<h2 class="comprendre-les-chiffres-section">Pour aller plus loin</h2>' +
    '<ul class="comprendre-les-chiffres-apercu-liste">' +
      '<li>Le portrait de fond de l’économie locale, mis à jour une fois par an.</li>' +
      '<li>Ce que les employeurs prévoient d’embaucher cette année.</li>' +
      '<li>Une question chiffrée précise, traitée en direct et non enregistrée.</li>' +
    '</ul>';
}

function _comprendreLesChiffresRenduChoixTerritoire() {
  return '' +
    '<div class="text-center mb-3"><h1><i class="bi bi-bar-chart"></i> Comprendre les chiffres</h1></div>' +
    '<div class="comprendre-les-chiffres-encart">' +
      '<p class="fs-5 fw-bold mb-2"><i class="bi bi-geo-alt"></i> Avant de commencer, indiquez votre département</p>' +
      '<p class="mb-3">Les chiffres du chômage, de l’emploi et des recrutements changent d’un département à l’autre. Sans cette information, les chiffres affichés ne vous concerneraient pas.</p>' +
      '<button type="button" class="btn btn-primary btn-lg" data-comprendre-les-chiffres-choisir-territoire>' +
        '<i class="bi bi-geo-alt"></i> Choisir mon département</button>' +
    '</div>' +
    '<div class="comprendre-les-chiffres-apercu-verrou" data-comprendre-les-chiffres-apercu role="button" tabindex="0" ' +
        'aria-label="Choisir mon département pour débloquer le contenu">' +
      '<p class="comprendre-les-chiffres-apercu-mot"><i class="bi bi-lock"></i> Choisissez votre département pour débloquer ces chiffres.</p>' +
      '<div class="comprendre-les-chiffres-apercu-contenu" inert aria-hidden="true">' +
        _comprendreLesChiffresRenduApercuContenu() +
      '</div>' +
    '</div>';
}

// ============================================================
// CONTENU : le digest trimestriel <mois>.md
// ============================================================

var COMPRENDRE_LES_CHIFFRES_BASE_CONTENU = 'modules/comprendre-les-chiffres/contenu/';
// Nombre de trimestres candidats a chercher (courant + archives).
var COMPRENDRE_LES_CHIFFRES_NB_TRIMESTRES = 8;

// Mois (« AAAA-MM ») de fin des n derniers trimestres CIVILS COMPLETS, du
// plus recent au plus ancien (copie de _comprendreLeCadreMoisTrimestresRecents).
function _comprendreLesChiffresMoisTrimestres(n) {
  var out = [];
  var d = new Date();
  var mois = d.getMonth() + 1, annee = d.getFullYear();
  var finTrimestre = Math.ceil(mois / 3) * 3;
  if (mois <= finTrimestre) {
    finTrimestre -= 3;
    if (finTrimestre <= 0) { finTrimestre += 12; annee -= 1; }
  }
  for (var i = 0; i < n; i++) {
    out.push(annee + '-' + (finTrimestre < 10 ? '0' : '') + finTrimestre);
    finTrimestre -= 3;
    if (finTrimestre <= 0) { finTrimestre += 12; annee -= 1; }
  }
  return out;
}

// Normalisation d'un libellé (minuscule, sans accent) pour les
// comparaisons tolérantes de section et de territoire.
function _comprendreLesChiffresNorm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Classe un libellé de territoire en '24' / '87' / 'na' / 'fr' / 'ue' / ''.
function _comprendreLesChiffresClasserTerritoire(label) {
  var n = _comprendreLesChiffresNorm(label);
  if (n.indexOf('dordogne') > -1) { return '24'; }
  if (n.indexOf('haute-vienne') > -1 || n.indexOf('haute vienne') > -1) { return '87'; }
  if (n.indexOf('union europeenne') > -1 || /\bue[- ]?27\b/.test(n) || /\bunion eur/.test(n)) { return 'ue'; }
  if (n.indexOf('nouvelle-aquitaine') > -1 || n.indexOf('nouvelle aquitaine') > -1 || /\bregion\b/.test(n)) { return 'na'; }
  if (n.indexOf('france') > -1) { return 'fr'; }
  return '';
}

// Parse une ligne « serie: T2 2025: 7,9 % ; T3 2025: 8,0 % ; ... » en
// [{label, v}]. Tolère l'absence d'unité.
function _comprendreLesChiffresParserSerie(txt) {
  return String(txt || '').split(/\s*;\s*/).map(function (p) {
    var m = p.match(/^\s*(.+?)\s*:\s*([-\d][\d\s., ]*)/);
    if (!m) { return null; }
    var v = parseFloat(m[2].replace(/[\s ]/g, '').replace(',', '.').replace(/\.$/, ''));
    return isNaN(v) ? null : { label: m[1].trim(), v: v };
  }).filter(Boolean);
}

// Premier nombre d'une chaîne (« environ 7,8 % » -> 7.8 ; « 19 000 » -> 19000).
function _comprendreLesChiffresNombre(txt) {
  var m = String(txt || '').match(/-?\d[\d\s., ]*/);
  if (!m) { return null; }
  var v = parseFloat(m[0].replace(/[\s ]/g, '').replace(',', '.').replace(/\.$/, ''));
  return isNaN(v) ? null : v;
}

// Analyse le corps markdown du digest en { periode, publie_le,
// prochaine_maj, sections: { <slug>: [entree...] }, lecture }. Format des
// entrées : voir docs/VEILLE_PROMPTS.md § 5ter.1 et le fichier
// contenu/2026-06.md (une puce par territoire, ligne « serie: » indentée
// rattachée à la puce, « Source : nom | url » en fin de puce).
function _comprendreLesChiffresParserDigest(md) {
  var mFront = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!mFront) { return null; }
  var entete = mFront[1], corps = mFront[2] || '';
  // TACHE (retour Denis 2026-09-12 : "la lecture du territoire ne doit
  // jamais comparer un departement nomme a un autre departement nomme")
  // : lecture n'est plus une chaine unique partagee entre tous les
  // territoires, mais un objet cle par territoire (meme principe que
  // syntheseCourte), rempli via des sous-titres "### <territoire>" a
  // l'interieur de la section "## Lecture du territoire".
  var out = { periode: '', publie_le: '', prochaine_maj: '', sections: {}, lecture: {}, ouSeSituer: {}, serieAnnuelle: {}, syntheseCourte: {} };
  ['periode', 'publie_le', 'prochaine_maj'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { out[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });

  // Slugs de section reconnus (mot-clé cherché dans le titre `## ...`).
  var SECTIONS = [
    { slug: 'ou-se-situer', cle: 'ou se situer' },
    { slug: 'synthese-courte', cle: 'synthese courte' },
    { slug: 'chomage', cle: 'taux de chomage' },
    { slug: 'demandeurs', cle: "demandeurs d'emploi" },
    { slug: 'longue-duree', cle: 'longue duree' },
    { slug: 'emploi-salarie', cle: 'emploi salarie' },
    { slug: 'offres', cle: 'offres' },
    { slug: 'lecture', cle: 'lecture du territoire' }
  ];

  var sectionCourante = null, entreeCourante = null, lectureTerrCourant = null;
  corps.split('\n').forEach(function (brute) {
    var ligne = brute.replace(/\s+$/, '');
    var mH2 = ligne.match(/^##\s+(.+)$/);
    if (mH2) {
      var titre = _comprendreLesChiffresNorm(mH2[1]);
      var trouve = null;
      SECTIONS.forEach(function (s) { if (titre.indexOf(s.cle) > -1) { trouve = s.slug; } });
      sectionCourante = trouve;
      entreeCourante = null;
      lectureTerrCourant = null;
      if (trouve && trouve !== 'lecture' && !out.sections[trouve]) { out.sections[trouve] = []; }
      return;
    }
    if (!sectionCourante) { return; }
    if (sectionCourante === 'lecture') {
      var mH3 = ligne.match(/^###\s+(.+)$/);
      if (mH3) { lectureTerrCourant = _comprendreLesChiffresClasserTerritoire(mH3[1]); return; }
      if (/^\s*>/.test(ligne)) { return; }
      if (!lectureTerrCourant) { return; }
      out.lecture[lectureTerrCourant] = (out.lecture[lectureTerrCourant] ? out.lecture[lectureTerrCourant] + '\n' : '') + ligne;
      return;
    }
    // Section « Synthèse courte » : une phrase par territoire.
    if (sectionCourante === 'synthese-courte') {
      var mSy = ligne.match(/^[-*]\s+(.+?)\s*:\s*(.+)$/);
      if (mSy) {
        var codeSy = _comprendreLesChiffresClasserTerritoire(mSy[1]);
        if (codeSy) { out.syntheseCourte[codeSy] = mSy[2].trim(); }
      }
      return;
    }
    // Section « Où se situer » : bornes departement / region (le plus bas
    // / le plus haut), rangees dans out.ouSeSituer.
    if (sectionCourante === 'ou-se-situer') {
      var mBorne = ligne.match(/^[-*]\s+(.+)$/);
      if (!mBorne) { return; }
      var tBorne = mBorne[1];
      var tnBorne = _comprendreLesChiffresNorm(tBorne);
      var estRegion = /\bregion\b/.test(tnBorne);
      var cleBorne = null;
      if (/le plus bas|la plus basse/.test(tnBorne)) { cleBorne = estRegion ? 'regBas' : 'depBas'; }
      else if (/le plus haut|la plus haute/.test(tnBorne)) { cleBorne = estRegion ? 'regHaut' : 'depHaut'; }
      var mNomBorne = tBorne.match(/\*\*(.+?)\*\*/);
      var mTxBorne = tBorne.match(/(\d+[.,]\d+)\s*%/);
      if (cleBorne && mNomBorne) {
        out.ouSeSituer[cleBorne] = {
          nom: mNomBorne[1].trim(),
          valeur: mTxBorne ? mTxBorne[1].replace('.', ',') + ' %' : ''
        };
      }
      return;
    }
    var mSerie = ligne.match(/^\s+serie\s*:\s*(.+)$/i);
    if (mSerie && entreeCourante) { entreeCourante.serie = _comprendreLesChiffresParserSerie(mSerie[1]); return; }
    var mSerieAn = ligne.match(/^\s+serie_annuelle\s*:\s*(.+)$/i);
    if (mSerieAn && entreeCourante) { entreeCourante.serieAnnuelle = _comprendreLesChiffresParserSerie(mSerieAn[1]); return; }
    var mRepere = ligne.match(/^\s+repere\s*:\s*(.+)$/i);
    if (mRepere && entreeCourante) { entreeCourante.repere = mRepere[1].trim(); return; }
    var mHisto = ligne.match(/^\s+histo\s*:\s*(.+)$/i);
    if (mHisto && entreeCourante) {
      var mH = mHisto[1].match(/haut\s*:\s*([^;]+?)\s*;\s*bas\s*:\s*(.+)$/i);
      if (mH) { entreeCourante.histo = { haut: mH[1].trim(), bas: mH[2].trim() }; }
      return;
    }
    var mPuce = ligne.match(/^[-*]\s+(.+)$/);
    if (!mPuce) { return; }
    var texte = mPuce[1].trim();
    var sepIdx = texte.indexOf(' : ');
    var label = sepIdx > -1 ? texte.slice(0, sepIdx).trim() : '';
    var reste = sepIdx > -1 ? texte.slice(sepIdx + 3).trim() : texte;
    var e = {
      labelBrut: label,
      terr: _comprendreLesChiffresClasserTerritoire(label || texte),
      reste: reste,
      valeur: '',
      note: '',
      date: '',
      precedent: '',
      anPrecedent: '',
      sensAn: '',
      serie: [],
      serieAnnuelle: [],
      repere: '',
      histo: null,
      sourceNom: '',
      sourceUrl: ''
    };
    var mVal = reste.match(/\*\*(.+?)\*\*/);
    if (mVal) { e.valeur = mVal[1].trim(); }
    var mNote = reste.match(/\[([^\]]*(?:a verifier|à vérifier)[^\]]*)\]/i);
    if (mNote && !e.valeur) { e.note = mNote[1].trim(); }
    // Date : seulement une parenthèse qui ressemble à une période
    // (année, « trimestre », « provisoire », « recensement »).
    var apresVal = reste.replace(/\*\*.+?\*\*/, '');
    var mDate = apresVal.match(/\(([^)]*(?:20\d\d|trimestre|provisoire|recensement)[^)]*)\)/i);
    if (mDate) { e.date = mDate[1].trim(); }
    var mPrec = reste.match(/pr[eé]c[eé]dent\s*:\s*([^;.)]+)/i);
    if (mPrec) { e.precedent = mPrec[1].trim(); }
    var mAn = reste.match(/il y a un an\s*:\s*([^;.)]+)/i);
    if (mAn) { e.anPrecedent = mAn[1].trim(); }
    // Sens d'évolution sur un an quand il n'est donné qu'en prose
    // (« en baisse d'environ 2,1 % sur un an »).
    var mSens = reste.match(/en\s+(baisse|recul|hausse|augmentation|progression)\b[^.;]*?sur un an/i)
      || reste.match(/([-+]\s?\d[\d.,]*\s*%)\s*sur un an/i);
    if (mSens) {
      var t = _comprendreLesChiffresNorm(mSens[1] || '');
      if (/baisse|recul|^-/.test(t) || /^-/.test((mSens[1] || '').trim())) { e.sensAn = 'baisse'; }
      else if (/hausse|augmentation|progression|^\+/.test(t)) { e.sensAn = 'hausse'; }
    }
    var mSrc = reste.match(/Source\s*:\s*(.+?)\s*$/i);
    if (mSrc) {
      var src = mSrc[1].trim();
      var mUrl = src.match(/(https?:\/\/\S+)/);
      if (mUrl) { e.sourceUrl = mUrl[1].replace(/[.,;]+$/, ''); }
      e.sourceNom = src.replace(/\s*\|\s*https?:\/\/\S+/, '').replace(/\s*\|\s*$/, '').trim();
    }
    out.sections[sectionCourante].push(e);
    entreeCourante = e;
  });
  Object.keys(out.lecture).forEach(function (k) { out.lecture[k] = out.lecture[k].replace(/^\s+|\s+$/g, ''); });
  // Series pluriannuelles (moyenne annuelle) rangees par territoire, pour
  // la courbe de la carte chomage.
  (out.sections.chomage || []).forEach(function (e) {
    if (e.serieAnnuelle && e.serieAnnuelle.length && e.terr) {
      out.serieAnnuelle[e.terr] = e.serieAnnuelle;
    }
  });
  return out;
}

// Charge le digest courant (premier <mois>.md qui existe parmi les
// trimestres candidats) + repère les mois d'archive présents. Un seul
// appel par session ; puis re-rend l'écran.
function _comprendreLesChiffresChargerDigest() {
  if (_comprendreLesChiffresChargement === 'encours' || _comprendreLesChiffresChargement === 'ok') { return; }
  _comprendreLesChiffresChargement = 'encours';
  var mois = _comprendreLesChiffresMoisTrimestres(COMPRENDRE_LES_CHIFFRES_NB_TRIMESTRES);
  Promise.all(mois.map(function (m) {
    return fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + m + '.md')
      .then(function (r) { return r.ok ? r.text() : null; })
      .catch(function () { return null; });
  })).then(function (textes) {
    var courant = null, archive = [];
    textes.forEach(function (t, i) {
      if (!t) { return; }
      var d = _comprendreLesChiffresParserDigest(t);
      if (!d) { return; }
      if (!courant) { courant = d; }
      else { archive.push({ mois: mois[i], periode: d.periode }); }
    });
    if (!courant) { _comprendreLesChiffresChargement = 'vide'; }
    else { courant.archive = archive; _comprendreLesChiffresDigest = courant; _comprendreLesChiffresChargement = 'ok'; }
    if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
  }).catch(function () {
    _comprendreLesChiffresChargement = 'erreur';
    if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
  });
}

// ============================================================
// LE SMIC ET L'INFLATION (consigne 117 de Denis, 2026-11-05)
// Source unique : modules/comprendre-les-chiffres/donnees/smic-inflation.json
// (chiffres nationaux : l'écran s'ouvre sans département choisi).
// ============================================================

var COMPRENDRE_LES_CHIFFRES_SMIC_URL = 'modules/comprendre-les-chiffres/donnees/smic-inflation.json';
var COMPRENDRE_LES_CHIFFRES_SMIC_BLOC = {
  t: 'Le Smic et l’inflation',
  d: 'Le salaire minimum (Smic), sa dernière hausse, et la hausse des prix de l’Insee, avec leur source. Salaire minimum, vie chère, prix.'
};
var _comprendreLesChiffresSmicDonnees = null;
// 'inactif' | 'encours' | 'ok' | 'erreur'
var _comprendreLesChiffresSmicChargement = 'inactif';

function _comprendreLesChiffresChargerSmic() {
  if (_comprendreLesChiffresSmicChargement === 'encours' || _comprendreLesChiffresSmicChargement === 'ok') { return; }
  _comprendreLesChiffresSmicChargement = 'encours';
  fetch(COMPRENDRE_LES_CHIFFRES_SMIC_URL)
    .then(function (r) { if (!r.ok) { throw new Error('http'); } return r.json(); })
    .then(function (j) {
      _comprendreLesChiffresSmicDonnees = j;
      _comprendreLesChiffresSmicChargement = 'ok';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    })
    .catch(function () {
      _comprendreLesChiffresSmicChargement = 'erreur';
    });
}

// ============================================================
// MÉTIERS QUI RECRUTENT LE PLUS (enquête BMO de France Travail)
// Source unique : modules/comprendre-les-chiffres/donnees/bmo-metiers.json,
// produit par scripts/genereBmoMetiers.js une fois par an (voir docs/VERIFICATIONS_A_DATE_FIXE.md).
// Maquette validée : docs/maquettes/maquette-metiers-recrutent-bmo.html
// ============================================================

var COMPRENDRE_LES_CHIFFRES_BMO_URL = 'modules/comprendre-les-chiffres/donnees/bmo-metiers.json';
var COMPRENDRE_LES_CHIFFRES_BMO_BLOC = {
  t: 'Métiers qui recrutent le plus',
  d: 'Les 10 métiers les plus cités par les employeurs dans l’enquête Besoins en main-d’œuvre, par département. Qui embauche, saisonnier, BMO, projets de recrutement, emploi.'
};
var _comprendreLesChiffresBmoDonnees = null;
// 'inactif' | 'encours' | 'ok' | 'erreur'
var _comprendreLesChiffresBmoChargement = 'inactif';
// Département affiché dans la carte ('24' | '87') ; vide = celui de la personne.
var _comprendreLesChiffresBmoDep = '';

function _comprendreLesChiffresChargerBmo() {
  if (_comprendreLesChiffresBmoChargement === 'encours' || _comprendreLesChiffresBmoChargement === 'ok') { return; }
  _comprendreLesChiffresBmoChargement = 'encours';
  fetch(COMPRENDRE_LES_CHIFFRES_BMO_URL)
    .then(function (r) { if (!r.ok) { throw new Error('http'); } return r.json(); })
    .then(function (j) {
      _comprendreLesChiffresBmoDonnees = j;
      _comprendreLesChiffresBmoChargement = 'ok';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    })
    .catch(function () { _comprendreLesChiffresBmoChargement = 'erreur'; });
}

// L'enquête paraît chaque printemps : les résultats restent affichés treize mois
// après leur publication, puis la liste disparaît et laisse un message sans chiffre.
function _comprendreLesChiffresBmoEtat(donnees, aujourdhui) {
  var mm = String(donnees.publie_le || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!mm) { return { aJour: false }; }
  var limite = new Date(Date.UTC(parseInt(mm[1], 10), parseInt(mm[2], 10) - 1 + 13, parseInt(mm[3], 10))).toISOString().slice(0, 10);
  return { aJour: aujourdhui < limite };
}

// Les nombres sont des minimums : France Travail masque les petits nombres.
function _comprendreLesChiffresBmoLigne(o, maxi, source) {
  var sais = o.met > 0 && (o.s / o.met) >= 0.5;
  var part = o.met > 0 ? Math.round(o.s / o.met * 100) : 0;
  var nom = o.nom.charAt(0).toUpperCase() + o.nom.slice(1);
  var nb = function (n) { return '<span class="chiffre" data-source="' + _comprendreLesChiffresEchappe(source) + '">' + _comprendreLesChiffresFormatDecimal(n, 0) + '</span>'; };
  return '<li class="comprendre-les-chiffres-metier' + (sais ? ' est-saisonnier' : '') + '">' +
    '<div class="comprendre-les-chiffres-metier-nom">' + _comprendreLesChiffresEchappe(nom) + ' ' +
    '<span class="comprendre-les-chiffres-pastille-sais' + (sais ? ' est-saisonnier' : '') + '">' + (sais ? 'surtout saisonnier' : 'pas surtout saisonnier') + '</span></div>' +
    '<div class="comprendre-les-chiffres-barre-fond"><div class="comprendre-les-chiffres-barre-val" style="width:' + Math.max(4, Math.round(o.met / maxi * 100)) + '%"></div>' +
    '<div class="comprendre-les-chiffres-barre-sais" style="width:' + Math.round(o.s / maxi * 100) + '%"></div></div>' +
    '<div class="comprendre-les-chiffres-metier-chiffres">Au moins ' + nb(o.met) + ' projets, dont au moins ' + nb(o.s) + ' saisonniers (' + part + '\u00a0%)</div></li>';
}

function _comprendreLesChiffresRenduCarteBmo(D, etat, dep) {
  var q = '<p class="comprendre-les-chiffres-indic-q">Dans quels métiers les employeurs pensent-ils embaucher le plus ?</p>';
  if (!etat.aJour) {
    return '<div class="comprendre-les-chiffres-indic" id="carte-metiers-bmo">' + q +
      '<p class="comprendre-les-chiffres-indic-absent"><i class="bi bi-info-circle"></i> Les résultats de l’enquête ' + _comprendreLesChiffresEchappe(D.annee) +
      ' datent de plus d’un an. La nouvelle enquête paraît chaque printemps : le repère sera remis à jour dès sa parution. En attendant, un conseiller peut vous dire quels métiers recrutent près de chez vous.</p></div>';
  }
  var d = D.departements[dep] || D.departements['24'];
  var cle = D.departements[dep] ? dep : '24';
  var publie = _comprendreLesChiffresDateEnClair(String(D.publie_le).slice(0, 7)) || '';
  var source = D.source.nom + ', ' + d.nom + ', publiée en ' + publie;
  var maxi = d.metiers.length ? d.metiers[0].met : 1;
  var boutons = ['24', '87'].map(function (c) {
    return '<button type="button" class="' + (c === cle ? 'actif' : '') + '" data-comprendre-les-chiffres-bmo-dep="' + c + '">' + D.departements[c].nom + '</button>';
  }).join('');
  // Chiffre principal (nécessaire à « Ma fiche de chiffres », consigne 121) : le nombre de projets du métier le plus cité.
  var premier = d.metiers.length ? d.metiers[0] : null;
  var principal = premier ? '<p class="comprendre-les-chiffres-indic-valeur"><span class="chiffre" data-source="' + _comprendreLesChiffresEchappe(source) + '">' + _comprendreLesChiffresFormatDecimal(premier.met, 0) + '</span></p>' +
    '<p class="comprendre-les-chiffres-compare">projets de recrutement au moins, pour le métier le plus cité : <b>' + _comprendreLesChiffresEchappe(premier.nom) + '</b></p>' : '';
  return '<div class="comprendre-les-chiffres-indic" id="carte-metiers-bmo">' + q + principal +
    '<p class="comprendre-les-chiffres-compare">Les ' + d.metiers.length + ' métiers les plus cités par les employeurs, en <b>' + _comprendreLesChiffresEchappe(d.nom) + '</b>, pour ' + _comprendreLesChiffresEchappe(D.annee) + '.</p>' +
    '<div class="comprendre-les-chiffres-choix-dep" role="group" aria-label="Département">' + boutons + '</div>' +
    '<p class="comprendre-les-chiffres-fraicheur">&#128197; Enquête ' + _comprendreLesChiffresEchappe(D.annee) + ', publiée en ' + publie + '. Prochaine enquête attendue au printemps ' + (parseInt(D.annee, 10) + 1) + '.</p>' +
    '<ul class="comprendre-les-chiffres-liste-metiers">' + d.metiers.map(function (o) { return _comprendreLesChiffresBmoLigne(o, maxi, source); }).join('') + '</ul>' +
    '<p class="comprendre-les-chiffres-legende-barres"><i></i> projets saisonniers &nbsp; <i class="clair"></i> ensemble des projets du métier</p>' +
    '<div class="comprendre-les-chiffres-encart small comprendre-les-chiffres-encart-attention"><i class="bi bi-exclamation-triangle"></i> Ce sont des <b>intentions d’employeurs</b>, pas des embauches garanties, et cela ne veut pas dire qu’un employeur précis recrute. Les nombres sont des <b>minimums</b> : France Travail masque les petits nombres pour protéger les réponses. « Surtout saisonnier » veut dire que plus de la moitié des projets connus durent une saison.</div>' +
    '<p class="mt-2 mb-0"><button type="button" class="btn btn-sm btn-outline-secondary" data-comprendre-les-chiffres-fiche-lexique="besoins-en-main-d-oeuvre"><i class="bi bi-book"></i> Lire : l’enquête Besoins en main-d’œuvre</button> ' +
    '<button type="button" class="btn btn-sm btn-outline-secondary" data-signaler-probleme="1" data-signaler-page="Métiers qui recrutent le plus (Comprendre les chiffres)"><i class="bi bi-flag"></i> Signaler un problème</button></p></div>';
}

function _comprendreLesChiffresRenduBlocBmo() {
  if (_comprendreLesChiffresBmoChargement !== 'ok' || !_comprendreLesChiffresBmoDonnees) { return ''; }
  var dep = _comprendreLesChiffresBmoDep || ((_comprendreLesChiffresDepartementCourant() === '87') ? '87' : '24');
  return _comprendreLesChiffresRenduCarteBmo(_comprendreLesChiffresBmoDonnees, _comprendreLesChiffresBmoEtat(_comprendreLesChiffresBmoDonnees, _comprendreLesChiffresAujourdhuiIso()), dep);
}

function _comprendreLesChiffresBrancherBmo() {
  document.querySelectorAll('[data-comprendre-les-chiffres-bmo-dep]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLesChiffresBmoDep = this.getAttribute('data-comprendre-les-chiffres-bmo-dep');
      pageComprendreLesChiffres();
      // Le rafraîchissement remonte la page : on revient à la carte juste après.
      setTimeout(function () {
        var carte = document.getElementById('carte-metiers-bmo');
        if (carte && carte.scrollIntoView) { carte.scrollIntoView({ block: 'center' }); }
      }, 60);
    });
  });
}

// Un nombre au format français : virgule décimale, espace insécable entre les milliers.
function _comprendreLesChiffresFormatDecimal(n, decimales) {
  var s = Number(n).toFixed(decimales).replace('.', ',');
  var p = s.split(',');
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  return p.join(',');
}
function _comprendreLesChiffresFormatEuros(n) { return _comprendreLesChiffresFormatDecimal(n, 2) + '\u00a0€'; }
function _comprendreLesChiffresFormatPourcent(n, decimales) { return _comprendreLesChiffresFormatDecimal(n, decimales) + '\u00a0%'; }

// Quand un chiffre vieillit : le Smic est « à revérifier » après six mois,
// l'inflation dès la date de la prochaine publication de l'Insee. Le vieux
// chiffre disparaît, la source reste. `aujourdhui` : « AAAA-MM-JJ ».
function _comprendreLesChiffresSmicEtat(donnees, aujourdhui) {
  var verifie = String(donnees.verifie_le || '');
  var limite = '';
  var mm = verifie.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mm) {
    var d = new Date(Date.UTC(parseInt(mm[1], 10), parseInt(mm[2], 10) - 1 + 6, parseInt(mm[3], 10)));
    limite = d.toISOString().slice(0, 10);
  }
  return {
    smicAJour: !!limite && aujourdhui < limite,
    inflationAJour: aujourdhui < String(donnees.inflation.prochaine_publication || '')
  };
}

function _comprendreLesChiffresAujourdhuiIso() {
  var d = new Date();
  function z(n) { return (n < 10 ? '0' : '') + n; }
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
}

function _comprendreLesChiffresSmicMoisEnClair(iso) {
  var t = _comprendreLesChiffresDateEnClair(iso);
  return t || String(iso || '');
}

function _comprendreLesChiffresSmicChiffre(texte, source) {
  return '<span class="chiffre" data-source="' + _comprendreLesChiffresEchappe(source) + '">' + texte + '</span>';
}

function _comprendreLesChiffresSmicSourceLigne(prefixe, src, quand) {
  var lien = src && src.url
    ? ' <a class="comprendre-les-chiffres-pastille" href="' + _comprendreLesChiffresEchappe(src.url) +
      '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> Ouvrir la page</a>'
    : '';
  return '<p class="comprendre-les-chiffres-source">' + prefixe + (quand ? ', ' + quand : '') + '.' + lien + '</p>';
}

function _comprendreLesChiffresSmicLireAvec(idMot, libelle) {
  return '<p class="comprendre-les-chiffres-a-lire-avec"><i class="bi bi-link-45deg"></i> À lire avec : ' +
    '<button type="button" class="comprendre-les-chiffres-lien-interne" data-comprendre-les-chiffres-fiche-lexique="' + idMot + '">' +
    libelle + '</button></p>';
}

function _comprendreLesChiffresRenduCarteSmic(D, etat) {
  var S = D.smic, E = S.en_vigueur, P = S.precedent;
  var enClair = _comprendreLesChiffresSmicMoisEnClair;
  var corps = '<p class="comprendre-les-chiffres-indic-q">Combien vaut le Smic aujourd’hui ?</p>';
  var src0 = S.sources[0];
  if (!etat.smicAJour) {
    corps += '<p class="comprendre-les-chiffres-indic-absent"><i class="bi bi-hourglass-split"></i> Ce montant n’a pas été vérifié depuis plus de six mois. Voyez le montant en vigueur sur le site officiel.</p>' +
      _comprendreLesChiffresSmicSourceLigne('D’après Service-public.gouv.fr', src0, '');
    return '<div class="comprendre-les-chiffres-indic" id="carte-smic">' + corps + '</div>';
  }
  var verifie = enClair(D.verifie_le);
  var depuis = enClair(E.effet);
  var verifPhrase = 'vérifié le ' + verifie;
  corps += '<p class="comprendre-les-chiffres-indic-valeur">' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatEuros(E.horaire_brut), 'Service-public.gouv.fr, Smic horaire brut en vigueur depuis le ' + depuis + ' - ' + verifPhrase) + '</p>';
  corps += '<span class="comprendre-les-chiffres-tendance">&#8599; + ' + _comprendreLesChiffresFormatPourcent(E.pourcentage, 2) + ' depuis le ' + depuis + '</span>';
  corps += '<p class="comprendre-les-chiffres-compare"><b>Par mois (35 h) :</b> ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatEuros(E.mensuel_brut_35h), 'Service-public.gouv.fr, Smic mensuel brut (35 heures par semaine) - ' + verifPhrase) + ' brut &nbsp;&bull;&nbsp; ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatEuros(E.mensuel_net_indicatif), 'Service-public.gouv.fr, Smic mensuel net, donné à titre indicatif - ' + verifPhrase) + ' net, à titre indicatif</p>';
  corps += '<p class="comprendre-les-chiffres-compare"><b>Avant le ' + enClair(E.effet).replace(/ \d{4}$/, '') + ' :</b> ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatEuros(P.horaire_brut), 'Service-public.gouv.fr, Smic horaire brut du ' + enClair(P.effet) + ' - ' + verifPhrase) + ' de l’heure &nbsp;&bull;&nbsp; ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatEuros(P.mensuel_brut_35h), 'Service-public.gouv.fr, Smic mensuel brut du ' + enClair(P.effet) + ' - ' + verifPhrase) + ' par mois</p>';
  corps += '<p class="comprendre-les-chiffres-compare"><b>Décidé le :</b> ' + enClair(E.decision) + ' (arrêté publié au Journal officiel)</p>';
  corps += '<details class="comprendre-les-chiffres-depli"><summary><span class="comprendre-les-chiffres-depli-titre">Pourquoi une hausse en cours d’année ?</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span></summary>' +
    '<div class="comprendre-les-chiffres-depli-corps">' +
    '<p class="comprendre-les-chiffres-compare mb-1">' + _comprendreLesChiffresEchappe(E.declencheur) + '</p>' +
    '<p class="comprendre-les-chiffres-compare mb-0">Le cumul emploi-retraite et la réduction des cotisations patronales (RGDU) gardent le Smic du ' + enClair(P.effet) + '.</p>' +
    '</div></details>';
  corps += _comprendreLesChiffresSmicSourceLigne('D’après Service-public.gouv.fr', src0, 'vérifié le ' + verifie);
  corps += _comprendreLesChiffresSmicLireAvec('smic', 'le mot « Smic » du Lexique');
  return '<div class="comprendre-les-chiffres-indic" id="carte-smic">' + corps + '</div>';
}

function _comprendreLesChiffresRenduCarteInflation(D, etat) {
  var I = D.inflation, L = I.dernier, Pr = I.precedent;
  var enClair = _comprendreLesChiffresSmicMoisEnClair;
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function nomMois(ym) { return MOIS[parseInt(String(ym).slice(5, 7), 10) - 1] + ' ' + String(ym).slice(0, 4); }
  var corps = '<p class="comprendre-les-chiffres-indic-q">De combien les prix ont-ils augmenté en un an ?</p>';
  var src0 = I.sources[0];
  if (!etat.inflationAJour) {
    corps += '<p class="comprendre-les-chiffres-indic-absent"><i class="bi bi-hourglass-split"></i> Un nouveau chiffre est paru. Voyez le plus récent sur le site de l’Insee.</p>' +
      _comprendreLesChiffresSmicSourceLigne('D’après l’Insee', src0, '');
    return '<div class="comprendre-les-chiffres-indic" id="carte-inflation">' + corps + '</div>';
  }
  var prov = L.provisoire ? ' (estimation provisoire publiée le ' + enClair(L.publie_le) + ')' : ' (publié le ' + enClair(L.publie_le) + ')';
  corps += '<p class="comprendre-les-chiffres-indic-valeur">' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatPourcent(L.sur_un_an, 1), 'Insee, prix à la consommation sur un an, ' + nomMois(L.mois) + prov) + '</p>';
  var fleche = L.sur_un_an > Pr.sur_un_an ? '&#8599; en hausse' : (L.sur_un_an < Pr.sur_un_an ? '&#8600; en baisse' : '&#8594; stable');
  corps += '<span class="comprendre-les-chiffres-tendance">' + fleche + '</span>';
  corps += '<p class="comprendre-les-chiffres-compare"><b>Le mois d’avant (' + nomMois(Pr.mois).split(' ')[0] + ') :</b> ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatPourcent(Pr.sur_un_an, 1), 'Insee, prix à la consommation sur un an, ' + nomMois(Pr.mois)) + '</p>';
  var srcMois = 'Insee, ';
  var suffixe = ' sur un an, ' + nomMois(L.mois) + (L.provisoire ? ' (provisoire)' : '');
  var postesHtml = '<p class="comprendre-les-chiffres-compare"><b>Énergie :</b> ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatPourcent(L.energie, 1), srcMois + 'énergie' + suffixe) + ' &nbsp;&bull;&nbsp; <b>Alimentation :</b> ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatPourcent(L.alimentation, 1), srcMois + 'alimentation' + suffixe) + ' &nbsp;&bull;&nbsp; <b>Services :</b> ' +
    _comprendreLesChiffresSmicChiffre(_comprendreLesChiffresFormatPourcent(L.services, 1), srcMois + 'services' + suffixe) + '</p>';
  // Lecture en barres des postes (consigne 119) : sens et ampleur, à partir de zéro.
  var lignesPostes = [];
  [['Ensemble des prix', L.sur_un_an, 'Insee, prix à la consommation' + suffixe], ['Énergie', L.energie, srcMois + 'énergie' + suffixe], ['Alimentation', L.alimentation, srcMois + 'alimentation' + suffixe], ['Services', L.services, srcMois + 'services' + suffixe]].forEach(function (p) {
    if (typeof p[1] === 'number') { lignesPostes.push({ nom: p[0], texte: _comprendreLesChiffresFormatPourcent(p[1], 1), n: p[1], source: p[2] }); }
  });
  corps += _comprendreLesChiffresVuesAssembler('inflation-postes', postesHtml, [{ titre: 'Hausse des prix sur un an, par poste', lignes: lignesPostes, signe: true }], null, { sansLignes: true });
  if (L.provisoire) {
    corps += '<div class="comprendre-les-chiffres-encart small"><i class="bi bi-info-circle"></i> Estimation provisoire. Résultats définitifs prévus le ' + enClair(I.resultats_definitifs_prevus) + '.</div>';
  }
  corps += '<details class="comprendre-les-chiffres-depli"><summary><span class="comprendre-les-chiffres-depli-titre">Qu’est-ce qui la fait monter ou baisser ?</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span></summary>' +
    '<div class="comprendre-les-chiffres-depli-corps">' +
    '<p class="comprendre-les-chiffres-compare mb-1"><b>Elle monte :</b> pétrole ou produits frais plus chers, taxe relevée.</p>' +
    '<p class="comprendre-les-chiffres-compare mb-0"><b>Elle ralentit :</b> baisse des cours des matières premières.</p>' +
    '</div></details>';
  corps += _comprendreLesChiffresSmicSourceLigne('D’après l’Insee', src0, 'publié le ' + enClair(L.publie_le));
  corps += _comprendreLesChiffresSmicLireAvec('inflation', 'le mot « Inflation » du Lexique');
  return '<div class="comprendre-les-chiffres-indic" id="carte-inflation">' + corps + '</div>';
}

// Le bloc « Le Smic et l’inflation » : affiché directement dans l'accueil du module,
// ouvert, à tous les niveaux de lecture (chiffres nationaux). Dans la carte du
// chômage (entre les chiffres et le graphique d'évolution) ; en tête de la vue
// Union européenne, qui n'a pas de carte chômage.
function _comprendreLesChiffresRenduBlocSmic() {
  var titre = '<h3 class="comprendre-les-chiffres-smic-titre"><i class="bi bi-cash-coin"></i> Le Smic et l’inflation</h3>';
  if (_comprendreLesChiffresSmicChargement === 'erreur') {
    return '<div class="comprendre-les-chiffres-smic-bloc">' + titre +
      '<p class="comprendre-les-chiffres-indic-absent"><i class="bi bi-hourglass-split"></i> Ces chiffres ne se sont pas affichés. Ils reviendront au prochain affichage de la page.</p></div>';
  }
  if (!_comprendreLesChiffresSmicDonnees) {
    return '<div class="comprendre-les-chiffres-smic-bloc">' + titre + '<p class="comprendre-les-chiffres-note">Chargement des chiffres…</p></div>';
  }
  var D = _comprendreLesChiffresSmicDonnees;
  var etat = _comprendreLesChiffresSmicEtat(D, _comprendreLesChiffresAujourdhuiIso());
  var verifie = _comprendreLesChiffresSmicMoisEnClair(D.verifie_le);
  var prochaine = _comprendreLesChiffresSmicMoisEnClair(D.inflation.prochaine_publication);
  var signaler = '<p class="mt-2 mb-0"><button type="button" class="comprendre-le-cadre-signaler-lien" data-signaler-probleme="1" ' +
    'data-signaler-page="Le Smic et l’inflation (Comprendre les chiffres)"><i class="bi bi-flag"></i> Signaler une erreur ou un changement</button></p>';
  var docDares = _comprendreLesChiffresFicheDoc('smicDares');
  var beneficiaires = docDares ? _comprendreLesChiffresSmicCarteBeneficiaires(docDares) : '';
  var docPouvoir = _comprendreLesChiffresFicheDoc('pouvoirAchat');
  var pouvoirAchat = docPouvoir ? _comprendreLesChiffresPouvoirAchatCarte(docPouvoir) : '';
  return '<div class="comprendre-les-chiffres-smic-bloc">' + titre +
    '<p><span class="comprendre-les-chiffres-fraicheur">&#128197; Chiffres vérifiés le ' + _comprendreLesChiffresEchappe(verifie) +
    '. Prochaine mise à jour de l’inflation prévue : ' + _comprendreLesChiffresEchappe(prochaine) + '.</span></p>' +
    '<div class="comprendre-les-chiffres-smic-deux">' +
    _comprendreLesChiffresRenduCarteSmic(D, etat) +
    _comprendreLesChiffresRenduCarteInflation(D, etat) +
    '</div>' + beneficiaires + pouvoirAchat + signaler + '</div>';
}

// ============================================================
// LECTURE EN TROIS FAÇONS : Chiffres / Barres / Camembert (+ ordre)
// ============================================================
// Composant COMMUN (décision Denis 2026-11-06, consigne 119) : la personne
// choisit, carte par carte, comment elle préfère lire un chiffre. « Chiffres »
// est la lecture d'origine de la carte (rien ne disparaît) ; « Barres » aligne
// les mêmes chiffres, barres à partir de zéro (jamais d'écart grossi) ;
// « Camembert » n'est proposé que si les chiffres sont les parts d'un même
// tout. Sur une liste de cinq lignes ou plus, la personne choisit l'ordre
// (comme dans la source, du plus haut au plus bas, du plus bas au plus haut).
// Rien n'est enregistré sur l'appareil : le choix vit le temps de la page.
//
// Une ligne : { nom, texte, n, fort, source } (n = nombre signé ou non).
// Un groupe de barres : { titre, lignes, signe, note }.
// Un camembert : { titre, parts: [{ nom, texte, n }], note }.
var _comprendreLesChiffresVuesMemoire = {};
var COMPRENDRE_LES_CHIFFRES_VUES = [
  { cle: 'chiffres', libelle: 'Chiffres', icone: 'bi-123' },
  { cle: 'barres', libelle: 'Barres', icone: 'bi-bar-chart-fill' },
  { cle: 'camembert', libelle: 'Camembert', icone: 'bi-pie-chart-fill' }
];
var COMPRENDRE_LES_CHIFFRES_ORDRES = [
  { cle: 'origine', libelle: 'Comme la source' },
  { cle: 'desc', libelle: 'Plus haut d’abord' },
  { cle: 'asc', libelle: 'Plus bas d’abord' }
];

// Longueur d'une barre : toujours rapportée à la plus grande valeur du groupe,
// à partir de zéro.
function _comprendreLesChiffresVuesPct(n, max) {
  if (!(max > 0) || !n) { return 0; }
  return Math.max(3, Math.round(Math.abs(n) / max * 100));
}

function _comprendreLesChiffresVuesLigne(l, pct, signe) {
  var src = l.source ? ' data-source="' + _comprendreLesChiffresEchappe(l.source) + '"' : '';
  var sens = '';
  if (signe && l.n) { sens = l.n < 0 ? '&#8600; ' : '&#8599; '; }
  return '<div class="comprendre-les-chiffres-zone-ligne' + (l.fort ? ' fort' : '') + (signe && l.n < 0 ? ' baisse' : '') +
    '" data-n="' + (typeof l.n === 'number' ? l.n : 0) + '">' +
    '<span class="comprendre-les-chiffres-zone-nom">' + _comprendreLesChiffresEchappe(l.nom) + '</span>' +
    '<span class="comprendre-les-chiffres-zone-piste" aria-hidden="true"><span class="comprendre-les-chiffres-zone-remplissage" style="width:' + pct + '%"></span></span>' +
    '<span class="comprendre-les-chiffres-zone-valeur">' + sens + '<span class="chiffre"' + src + '>' + _comprendreLesChiffresEchappe(l.texte) + '</span></span>' +
    '</div>';
}

function _comprendreLesChiffresVuesOrdreHTML() {
  return '<div class="comprendre-les-chiffres-vues-ordre" role="group" aria-label="Ordre des lignes"><span>Ordre :</span>' +
    COMPRENDRE_LES_CHIFFRES_ORDRES.map(function (o, i) {
      return '<button type="button" class="' + (i === 0 ? 'actif' : '') + '" aria-pressed="' + (i === 0 ? 'true' : 'false') +
        '" data-comprendre-les-chiffres-ordre="' + o.cle + '">' + o.libelle + '</button>';
    }).join('') + '</div>';
}

// Titre du groupe et choix de l'ordre sur UNE seule ligne (consigne 128 : moins d'espace perdu).
function _comprendreLesChiffresVuesEnteteHTML(titre, avecOrdre) {
  var t = titre ? '<p class="comprendre-les-chiffres-vues-titre">' + _comprendreLesChiffresEchappe(titre) + '</p>' : '';
  var o = avecOrdre ? _comprendreLesChiffresVuesOrdreHTML() : '';
  return (t && o) ? '<div class="comprendre-les-chiffres-vues-entete">' + t + o + '</div>' : t + o;
}

function _comprendreLesChiffresVuesBarresHTML(groupes) {
  var noteSensDonnee = false;
  return (groupes || []).map(function (g) {
    var lignes = g.lignes || [];
    if (lignes.length < 2) { return ''; }
    var max = 0;
    lignes.forEach(function (l) { if (typeof l.n === 'number' && Math.abs(l.n) > max) { max = Math.abs(l.n); } });
    return '<div class="comprendre-les-chiffres-vues-groupe">' +
      _comprendreLesChiffresVuesEnteteHTML(g.titre, lignes.length >= 5) +
      '<div class="comprendre-les-chiffres-zones-barres comprendre-les-chiffres-vues-liste" data-comprendre-les-chiffres-liste>' +
      lignes.map(function (l) { return _comprendreLesChiffresVuesLigne(l, _comprendreLesChiffresVuesPct(l.n, max), g.signe); }).join('') +
      '</div>' +
      (g.signe && !noteSensDonnee && (noteSensDonnee = true) ? '<p class="comprendre-les-chiffres-note">La longueur de la barre montre l’ampleur, la flèche le sens (hausse ou baisse).</p>' : '') +
      (g.note ? '<p class="comprendre-les-chiffres-note">' + _comprendreLesChiffresEchappe(g.note) + '</p>' : '') +
      '</div>';
  }).join('');
}

// « Chiffres » : les mêmes lignes que les barres, en toutes lettres (nom, puis chiffre),
// sans barre. Même ordre au choix.
function _comprendreLesChiffresVuesLignesHTML(groupes) {
  return (groupes || []).map(function (g) {
    var lignes = g.lignes || [];
    if (lignes.length < 2) { return ''; }
    return '<div class="comprendre-les-chiffres-vues-groupe">' +
      _comprendreLesChiffresVuesEnteteHTML(g.titre, lignes.length >= 5) +
      '<div class="comprendre-les-chiffres-lignes" data-comprendre-les-chiffres-liste>' +
      lignes.map(function (l) {
        var src = l.source ? ' data-source="' + _comprendreLesChiffresEchappe(l.source) + '"' : '';
        var sens = g.signe && l.n ? (l.n < 0 ? '&#8600; ' : '&#8599; ') : '';
        return '<div class="comprendre-les-chiffres-ligne' + (l.fort ? ' fort' : '') + '" data-n="' + (typeof l.n === 'number' ? l.n : 0) + '">' +
          '<span class="comprendre-les-chiffres-ligne-lib">' + _comprendreLesChiffresEchappe(l.nom) + '</span>' +
          '<span class="comprendre-les-chiffres-ligne-val">' + sens + '<span class="chiffre"' + src + '>' + _comprendreLesChiffresEchappe(l.texte) + '</span></span></div>';
      }).join('') + '</div>' +
      (g.note ? '<p class="comprendre-les-chiffres-note">' + _comprendreLesChiffresEchappe(g.note) + '</p>' : '') +
      '</div>';
  }).join('');
}

// Camembert : de vraies parts d'un même tout (la somme des n sert de total).
function _comprendreLesChiffresVuesCamembertHTML(c) {
  if (!c || !c.parts || c.parts.length < 2) { return ''; }
  var total = 0;
  c.parts.forEach(function (p) { total += p.n; });
  if (!(total > 0)) { return ''; }
  var OPACITES = [1, 0.55, 0.3, 0.15];
  var decalage = 0, arcs = '', legende = '', resume = [];
  c.parts.forEach(function (p, i) {
    var pct = p.n / total * 100;
    var op = OPACITES[Math.min(i, OPACITES.length - 1)];
    // Une vraie part de gâteau tracée en chemin (a1 à a2) : plus de trou blanc dû aux tirets d'un trait épais.
    var a1 = (decalage / 100) * 2 * Math.PI - Math.PI / 2, a2 = ((decalage + pct) / 100) * 2 * Math.PI - Math.PI / 2;
    var pt = function (a) { return (16 + 16 * Math.cos(a)).toFixed(3) + ' ' + (16 + 16 * Math.sin(a)).toFixed(3); };
    arcs += pct >= 99.99
      ? '<circle class="comprendre-les-chiffres-camembert-part" data-pct="' + pct.toFixed(2) + '" cx="16" cy="16" r="16" style="fill-opacity:' + op + '"></circle>'
      : '<path class="comprendre-les-chiffres-camembert-part" data-pct="' + pct.toFixed(2) + '" d="M16 16 L' + pt(a1) + ' A16 16 0 ' + (pct > 50 ? 1 : 0) + ' 1 ' + pt(a2) + ' Z" style="fill-opacity:' + op + '"></path>';
    decalage += pct;
    legende += '<li><span class="comprendre-les-chiffres-camembert-pastille" style="opacity:' + op + '"></span>' +
      _comprendreLesChiffresEchappe(p.nom) + ' : <b>' + _comprendreLesChiffresEchappe(p.texte) + '</b></li>';
    resume.push(p.nom + ' ' + p.texte);
  });
  return '<div class="comprendre-les-chiffres-vues-groupe">' +
    (c.titre ? '<p class="comprendre-les-chiffres-vues-titre">' + _comprendreLesChiffresEchappe(c.titre) + '</p>' : '') +
    '<div class="comprendre-les-chiffres-camembert-zone">' +
    '<svg class="comprendre-les-chiffres-camembert" viewBox="0 0 32 32" role="img" aria-label="' + _comprendreLesChiffresEchappe((c.titre ? c.titre + ' : ' : '') + resume.join(', ')) + '">' +
    '<g>' + arcs + '</g>' +
    '<circle cx="16" cy="16" r="15.8" fill="none" class="comprendre-les-chiffres-camembert-contour"></circle></svg>' +
    '<ul class="comprendre-les-chiffres-camembert-legende">' + legende + '</ul></div>' +
    (c.note ? '<p class="comprendre-les-chiffres-note">' + _comprendreLesChiffresEchappe(c.note) + '</p>' : '') +
    '</div>';
}

// Assemble le commutateur et les trois panneaux autour de la lecture d'origine
// (chiffresHTML). Sans barres ni camembert à montrer, rend la lecture
// d'origine telle quelle : jamais de bouton qui ouvre une page vide.
function _comprendreLesChiffresVuesAssembler(id, chiffresHTML, groupes, camembert, options) {
  var barres = _comprendreLesChiffresVuesBarresHTML(groupes);
  var cam = _comprendreLesChiffresVuesCamembertHTML(camembert);
  if (!barres && !cam) { return chiffresHTML; }
  var dispo = ['chiffres'];
  if (barres) { dispo.push('barres'); }
  if (cam) { dispo.push('camembert'); }
  var memo = _comprendreLesChiffresVuesMemoire[id];
  // options.defaut : la lecture qui s'ouvre d'abord quand la personne n'a encore rien choisi (les blocs qui avaient déjà des barres gardent les barres).
  var depart = (options && options.defaut && dispo.indexOf(options.defaut) >= 0) ? options.defaut : 'chiffres';
  var actif = dispo.indexOf(memo) >= 0 ? memo : depart;
  // options.sansLignes : la lecture d'origine (un tableau, par exemple) dit déjà tout en chiffres ; on ne la double pas.
  var contenus = { chiffres: chiffresHTML + ((options && options.sansLignes) ? '' : _comprendreLesChiffresVuesLignesHTML(groupes)), barres: barres, camembert: cam };
  var boutons = COMPRENDRE_LES_CHIFFRES_VUES.filter(function (v) { return dispo.indexOf(v.cle) >= 0; }).map(function (v) {
    return '<button type="button" class="' + (v.cle === actif ? 'actif' : '') + '" aria-pressed="' + (v.cle === actif ? 'true' : 'false') +
      '" data-comprendre-les-chiffres-vue-lecture="' + v.cle + '"><i class="bi ' + v.icone + '" aria-hidden="true"></i> ' + v.libelle + '</button>';
  }).join('');
  var panneaux = dispo.map(function (cle) {
    return '<div data-comprendre-les-chiffres-panneau="' + cle + '"' + (cle === actif ? '' : ' hidden') + '>' + contenus[cle] + '</div>';
  }).join('');
  return '<div class="comprendre-les-chiffres-vues" data-comprendre-les-chiffres-vues="' + _comprendreLesChiffresEchappe(id) + '">' +
    '<div class="comprendre-les-chiffres-bascule-lecture" role="group" aria-label="Façon de lire ce chiffre">' + boutons + '</div>' +
    panneaux + '</div>';
}

// Branchement : change de panneau sans rien recharger, et réordonne les lignes.
function _comprendreLesChiffresBrancherVues() {
  document.querySelectorAll('[data-comprendre-les-chiffres-vues]').forEach(function (bloc) {
    var id = bloc.getAttribute('data-comprendre-les-chiffres-vues');
    bloc.querySelectorAll('[data-comprendre-les-chiffres-vue-lecture]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cle = this.getAttribute('data-comprendre-les-chiffres-vue-lecture');
        _comprendreLesChiffresVuesMemoire[id] = cle;
        bloc.querySelectorAll('[data-comprendre-les-chiffres-vue-lecture]').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('actif', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        bloc.querySelectorAll('[data-comprendre-les-chiffres-panneau]').forEach(function (p) {
          p.hidden = p.getAttribute('data-comprendre-les-chiffres-panneau') !== cle;
        });
      });
    });
    bloc.querySelectorAll('[data-comprendre-les-chiffres-ordre]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = this.getAttribute('data-comprendre-les-chiffres-ordre');
        var zone = this.closest('.comprendre-les-chiffres-vues-groupe');
        var liste = zone && zone.querySelector('[data-comprendre-les-chiffres-liste]');
        if (!liste) { return; }
        this.parentNode.querySelectorAll('button').forEach(function (b) {
          b.classList.toggle('actif', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        var lignes = [].slice.call(liste.children);
        if (!liste._origine) { liste._origine = lignes.slice(); }
        var nb = function (el) { return parseFloat(el.getAttribute('data-n')) || 0; };
        var tri = mode === 'origine' ? liste._origine.slice()
          : lignes.slice().sort(function (a, b) { return mode === 'desc' ? nb(b) - nb(a) : nb(a) - nb(b); });
        tri.forEach(function (l) { liste.appendChild(l); });
      });
    });
  });
}

// ============================================================
// COUCHE 1 : les 5 chiffres clés
// ============================================================

// Configuration FIXE des 5 cartes (libellés, questions, phrases) - la
// maquette est la cible. Les valeurs viennent du digest, section par
// section. `phrase(v, e)` : phrase en langage simple ; `graphe` : afficher
// le dépliant « voir l'évolution ».
var COMPRENDRE_LES_CHIFFRES_CARTES = [
  {
    slug: 'chomage',
    q: 'Combien de personnes sont au chômage ici ?',
    unite: '%',
    graphe: true,
    comparerTerr: true,
    phrase: function (e) {
      var v = _comprendreLesChiffresNombre(e.valeur);
      if (v === null) { return ''; }
      return 'Sur 100 personnes qui travaillent ou cherchent un travail, environ <span class="chiffre">' +
        Math.round(v) + ' sont au chômage</span>.';
    }
  },
  {
    slug: 'demandeurs',
    q: 'Combien de personnes cherchent un emploi sans en avoir ?',
    unite: 'nb',
    graphe: false,
    phrase: function (e) {
      if (!e.valeur) { return ''; }
      return '<span class="chiffre">' + _comprendreLesChiffresEchappe(e.valeur) +
        '</span> sont inscrites à France Travail sans avoir travaillé du tout ce mois-ci (on dit « catégorie A »).';
    },
    cote: function (e) {
      var m = (e.reste || '').match(/A,?\s*B\s*et\s*C[^:]*:\s*environ\s*([\d\s  ]+?)\s*personnes?\s*[;,]\s*en\s*(baisse|hausse)\s*d[’']environ\s*([\d,]+)\s*%/i);
      return '<p class="comprendre-les-chiffres-cote-titre">Comprendre les catégories</p>' +
        '<p>Les personnes inscrites à France Travail sont classées de <b>A à E</b>, selon qu’elles ont travaillé ou non dans le mois.</p>' +
        '<ul class="comprendre-les-chiffres-cote-liste">' +
        '<li><b>A</b> : aucune heure travaillée dans le mois. C’est le chiffre ci-contre.</li>' +
        '<li><b>B et C</b> : ont travaillé un peu, cherchent toujours.</li>' +
        '<li><b>D</b> : pas tenues de chercher (formation, maladie…).</li>' +
        '<li><b>E</b> : ont déjà un emploi (création d’entreprise…).</li>' +
        '</ul>' +
        (m ? '<p class="comprendre-les-chiffres-cote-sep"><b>A + B + C ensemble</b> : environ ' +
          '<b class="chiffre">' + _comprendreLesChiffresEchappe(m[1].trim()) + ' personnes</b>, en ' + m[2] + ' d’environ ' +
          '<b class="chiffre">' + _comprendreLesChiffresEchappe(m[3]) + ' %</b> sur un an. C’est la mesure la plus large de la demande d’emploi.</p>' : '');
    }
  },
  {
    slug: 'longue-duree',
    q: 'La difficulté est-elle passagère ou installée ?',
    unite: '%',
    graphe: false,
    comparerTerr: true,
    phrase: function (e) {
      if (!e.valeur) { return ''; }
      return 'Parmi les personnes qui cherchent un emploi, <span class="chiffre">' +
        _comprendreLesChiffresEchappe(e.valeur) + '</span> sont inscrites depuis plus d’un an.';
    },
    cote: function (e, entrees, choisirTerr) {
      var m2 = (e.reste || '').match(/dont\s*environ\s*([\d,]+)\s*%\s*depuis\s*deux\s*ans/i);
      var na = choisirTerr && choisirTerr('na');
      var natl = na && (na.reste || '').match(/France\s*enti[eè]re[^:]*:\s*([\d,]+)\s*%/i);
      return '<p class="comprendre-les-chiffres-cote-titre">Ce que « longue durée » veut dire</p>' +
        '<p><b>Un an et plus</b> : on parle de chômage de longue durée.' +
        (m2 ? ' <b>Deux ans et plus</b> : très longue durée, environ <b class="chiffre">' + _comprendreLesChiffresEchappe(m2[1]) + ' %</b> des demandeurs ici.' : '') + '</p>' +
        '<p class="comprendre-les-chiffres-cote-sep">Plus l’inscription dure, plus le retour à l’emploi demande du temps et un accompagnement adapté. Ce n’est pas une fatalité.</p>' +
        (natl ? '<p><b>Repère national</b> : environ <b class="chiffre">' + _comprendreLesChiffresEchappe(natl[1]) + ' %</b> des demandeurs sont inscrits depuis un an et plus.</p>' : '');
    }
  },
  {
    slug: 'emploi-salarie',
    q: 'Le territoire crée ou perd des emplois ?',
    unite: '%',
    graphe: false,
    valeurEstVariation: true,
    phrase: function (e) {
      if (!e.valeur) { return ''; }
      return 'Sur le trimestre, le nombre d’emplois salariés a évolué de <span class="chiffre">' +
        _comprendreLesChiffresEchappe(e.valeur) + '</span>.';
    },
    cote: function (e, entrees, choisirTerr) {
      var na = choisirTerr && choisirTerr('na');
      var fr = choisirTerr && choisirTerr('fr', true);
      var ctx = [];
      if (na && na.valeur) { ctx.push('Nouvelle-Aquitaine <b class="chiffre">' + _comprendreLesChiffresEchappe(na.valeur) + '</b>'); }
      if (fr && fr.valeur) { ctx.push('France <b class="chiffre">' + _comprendreLesChiffresEchappe(fr.valeur) + '</b>'); }
      var naAn = na && (na.reste || '').match(/(-?\s?[\d,]+)\s*%\s*sur un an/i);
      return '<p class="comprendre-les-chiffres-cote-titre">Ce que ce chiffre compte</p>' +
        '<p>L’<b>emploi salarié</b> : les salariés du privé et des entreprises publiques. Pas les indépendants, pas la fonction publique d’État.</p>' +
        (ctx.length ? '<p class="comprendre-les-chiffres-cote-sep"><b>Sur le dernier trimestre connu</b> : ' + ctx.join(', ') + ' sur le trimestre.' +
          (naAn ? ' Sur un an, la région évolue d’environ <b class="chiffre">' + _comprendreLesChiffresEchappe(naAn[1].replace(/\s/g, '')) + ' %</b>.' : '') + '</p>' : '') +
        '<p>Le détail départemental du trimestre sort plus tard : la tendance régionale donne le sens.</p>';
    }
  },
  {
    slug: 'offres',
    q: 'Y a-t-il des offres visibles ?',
    unite: 'nb',
    graphe: false,
    phrase: function (e) {
      if (!e.valeur) { return ''; }
      return '<span class="chiffre">' + _comprendreLesChiffresEchappe(e.valeur) +
        '</span> ont été déposées par les employeurs à France Travail sur le territoire, sur les douze derniers mois.';
    },
    cote: function (e, entrees) {
      var cible = _comprendreLesChiffresTerritoireDuNiveau();
      var dur = null;
      (entrees || []).forEach(function (x) {
        if (x.terr === cible && /durent plus d.?un mois/i.test(x.reste || '')) { dur = x; }
      });
      return '<p class="comprendre-les-chiffres-cote-titre">Lire ce chiffre</p>' +
        '<p>Une <b>offre déposée n’est pas une embauche</b>, et beaucoup d’embauches ne passent jamais par une offre publiée (candidature spontanée, réseau, intérim).</p>' +
        (dur && dur.valeur ? '<p class="comprendre-les-chiffres-cote-sep"><b>Repère</b> : <b class="chiffre">' + _comprendreLesChiffresEchappe(dur.valeur) +
          '</b> des embauches du trimestre durent plus d’un mois ici. La plupart des embauches sont donc des contrats très courts.</p>' : '');
    }
  }
];

function _comprendreLesChiffresEchappe(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

// Tendance sur un an de préférence (comme la maquette, Annexe A), sinon
// trimestre sur trimestre. Renvoie { fleche, mot } ou null.
function _comprendreLesChiffresTendance(carte, e) {
  var FL = { baisse: '&#8600;', hausse: '&#8599;', stable: '&#8594;' };
  var MOT = { baisse: 'en légère baisse', hausse: 'en légère hausse', stable: 'à peu près stable' };
  var mk = function (k) { return { fleche: FL[k], mot: MOT[k] }; };

  // Cas où la valeur EST une variation (emploi salarié : « -0,1 % »).
  if (carte && carte.valeurEstVariation) {
    var v = _comprendreLesChiffresNombre(e.valeur);
    if (v === null) { return null; }
    var s = Math.abs(v) < 0.05 ? 'stable' : (v < 0 ? 'baisse' : 'hausse');
    return mk(s);
  }
  // Sens sur un an donné en prose.
  if (e.sensAn) { return mk(e.sensAn); }

  var actuel = _comprendreLesChiffresNombre(e.valeur);
  var avant = _comprendreLesChiffresNombre(e.anPrecedent);
  if (actuel === null || avant === null) {
    if (e.serie && e.serie.length >= 2) {
      actuel = actuel === null ? e.serie[e.serie.length - 1].v : actuel;
      avant = e.serie[e.serie.length - 2].v;
    } else if (e.precedent) {
      avant = _comprendreLesChiffresNombre(e.precedent);
    }
  }
  if (actuel === null || avant === null) { return null; }
  var ecart = actuel - avant;
  var seuil = Math.max(Math.abs(actuel) * 0.02, 0.05);
  if (ecart <= -seuil) { return mk('baisse'); }
  if (ecart >= seuil) { return mk('hausse'); }
  return mk('stable');
}

// Deux valeurs sont-elles de même nature (toutes deux des pourcentages,
// ou toutes deux des nombres) ? Sert à ne pas comparer « 17 500 personnes »
// avec « +1,7 % ».
function _comprendreLesChiffresMemeNature(a, b) {
  var pa = /%/.test(a || ''), pb = /%/.test(b || '');
  return pa === pb;
}

// Graphe SVG en barres depuis une série (6 a 8 trimestres). Valeur écrite
// au-dessus de chaque barre ; data-tip pour l'infobulle au survol.
function _comprendreLesChiffresRenduGraphe(e) {
  var pts = e.serie || [];
  if (pts.length < 2) { return ''; }
  var vs = pts.map(function (p) { return p.v; });
  var mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs);
  // Base du graphe : assez basse pour que la plus petite barre reste bien
  // visible, sans exagérer un écart minime (0,2 point ne doit pas faire
  // une barre 5 fois plus courte).
  var bas = mn - Math.max((mx - mn) * 1.5, Math.abs(mn) * 0.1, 0.5);
  if (mx === mn) { bas = mn - Math.max(Math.abs(mn) * 0.15, 1); }
  var W = 320, H = 128, padG = 22, padD = 8, y0 = 104, hMax = 66;
  var n = pts.length;
  var largeur = Math.min(30, (W - padG - padD) / n - 6);
  var pas = (W - padG - padD) / n;
  var barres = '', valeurs = '', axes = '';
  pts.forEach(function (p, i) {
    var x = padG + i * pas + (pas - largeur) / 2;
    var h = Math.max(4, hMax * (p.v - bas) / ((mx - bas) || 1));
    var y = y0 - h;
    var tip = p.label + ' : ' + _comprendreLesChiffresFormatNombre(p.v) + (e.sourceNom ? ' - source ' + e.sourceNom : '');
    barres += '<rect class="barre" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + largeur.toFixed(1) +
      '" height="' + h.toFixed(1) + '" data-tip="' + _comprendreLesChiffresEchappe(tip) + '"></rect>';
    valeurs += '<text class="val" x="' + (x + largeur / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) +
      '" text-anchor="middle">' + _comprendreLesChiffresEchappe(_comprendreLesChiffresFormatNombre(p.v)) + '</text>';
    if (n <= 5 || i === 0 || i === n - 1 || i === Math.floor(n / 2)) {
      var lab = /^T[1-4]\s*20\d\d$/.test(p.label.trim())
        ? p.label.trim().replace(/\s*20(\d\d)$/, ' $1')
        : p.label.trim();
      var anc = i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle');
      axes += '<text x="' + (x + largeur / 2).toFixed(1) + '" y="117" text-anchor="' + anc + '">' +
        _comprendreLesChiffresEchappe(lab) + '</text>';
    }
  });
  return '<svg class="comprendre-les-chiffres-graphe" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
    'aria-label="Évolution sur ' + n + ' trimestres" onmousemove="_comprendreLesChiffresGrapheInfobulle(event)" ' +
    'onmouseleave="_comprendreLesChiffresGrapheInfobulleMasquer()">' +
    '<line class="axe" x1="' + padG + '" y1="' + y0 + '" x2="' + (W - padD) + '" y2="' + y0 + '"></line>' +
    barres + valeurs + axes + '</svg>';
}

function _comprendreLesChiffresFormatNombre(v) {
  if (Math.abs(v) >= 1000) { return Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' '); }
  return (Math.round(v * 10) / 10).toString().replace('.', ',');
}

// Infobulle du graphe (barres) - un seul élément réutilisé, position fixe.
function _comprendreLesChiffresInfobulleElement() {
  var el = document.getElementById('comprendreLesChiffresInfobulle');
  if (!el) {
    el = document.createElement('div');
    el.id = 'comprendreLesChiffresInfobulle';
    el.className = 'comprendre-les-chiffres-infobulle';
    document.body.appendChild(el);
  }
  return el;
}
function _comprendreLesChiffresGrapheInfobulle(evt) {
  var tip = evt.target && evt.target.getAttribute && evt.target.getAttribute('data-tip');
  var el = _comprendreLesChiffresInfobulleElement();
  if (!tip) { el.style.display = 'none'; return; }
  el.textContent = tip;
  el.style.display = 'block';
  var x = evt.clientX + 14, y = evt.clientY + 14;
  if (x + 260 > window.innerWidth) { x = evt.clientX - 260; }
  el.style.left = x + 'px';
  el.style.top = y + 'px';
}
function _comprendreLesChiffresGrapheInfobulleMasquer() {
  var el = document.getElementById('comprendreLesChiffresInfobulle');
  if (el) { el.style.display = 'none'; }
}
window._comprendreLesChiffresGrapheInfobulle = _comprendreLesChiffresGrapheInfobulle;
window._comprendreLesChiffresGrapheInfobulleMasquer = _comprendreLesChiffresGrapheInfobulleMasquer;

// Le repère « plein emploi » : un seul endroit pour le chiffre (courbe, note sous la courbe, encart « Où se situer »). C'est un objectif public, pas une donnée relevée ;
// s'il change, c'est ici et nulle part ailleurs.
var COMPRENDRE_LES_CHIFFRES_PLEIN_EMPLOI = 5;

// ============================================================
// Courbe pluriannuelle (carte chômage) : 4 territoires en bascule
// (département / région / France / Union européenne), survol partout,
// ligne pointillée « plein emploi ». Données : digest.serieAnnuelle.
// ============================================================
var COMPRENDRE_LES_CHIFFRES_COURBE_SERIES = [
  { cle: '24', slug: 'dep', nom: 'Département' },
  { cle: 'na', slug: 'na', nom: 'Région' },
  { cle: 'fr', slug: 'fr', nom: 'France' },
  { cle: 'ue', slug: 'ue', nom: 'Union européenne' }
];
var _comprendreLesChiffresCourbeData = null;

function _comprendreLesChiffresRenduCourbeAnnuelle(sa, slugDefaut) {
  var defaut = slugDefaut || 'dep';
  var W = 520, H = 152, padG = 20, padD = 14, y0 = 128, yTop = 16;
  var anneesSet = {};
  COMPRENDRE_LES_CHIFFRES_COURBE_SERIES.forEach(function (s) {
    (sa[s.cle] || []).forEach(function (p) { anneesSet[p.label] = true; });
  });
  var annees = Object.keys(anneesSet).sort();
  if (annees.length < 2) { return ''; }

  var toutesV = [5];
  COMPRENDRE_LES_CHIFFRES_COURBE_SERIES.forEach(function (s) {
    (sa[s.cle] || []).forEach(function (p) { toutesV.push(p.v); });
  });
  var vMin = Math.min.apply(null, toutesV), vMax = Math.max.apply(null, toutesV);
  var marge = Math.max((vMax - vMin) * 0.12, 0.4);
  vMin -= marge; vMax += marge;

  var xAt = function (annee) {
    var i = annees.indexOf(annee);
    return padG + (annees.length === 1 ? 0 : i / (annees.length - 1) * (W - padG - padD));
  };
  var yAt = function (v) { return y0 - (v - vMin) / ((vMax - vMin) || 1) * (y0 - yTop); };

  var data = { annees: annees, xs: annees.map(xAt), largeurVb: W, series: {} };
  var gs = '';
  COMPRENDRE_LES_CHIFFRES_COURBE_SERIES.forEach(function (s) {
    var pts = (sa[s.cle] || []).slice().sort(function (a, b) { return a.label < b.label ? -1 : 1; });
    if (!pts.length) { return; }
    var coords = pts.map(function (p) { return { annee: p.label, x: xAt(p.label), y: yAt(p.v), v: p.v }; });
    data.series[s.slug] = { nom: s.nom, valeurs: {} };
    coords.forEach(function (c) { data.series[s.slug].valeurs[c.annee] = c.v; });
    var poly = coords.map(function (c) { return c.x.toFixed(1) + ',' + c.y.toFixed(1); }).join(' ');
    var cercles = coords.map(function (c) { return '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '"></circle>'; }).join('');
    var masque = (s.slug === defaut) ? '' : ' comprendre-les-chiffres-courbe-serie--masque';
    gs += '<g class="comprendre-les-chiffres-courbe-serie comprendre-les-chiffres-courbe-serie--' + s.slug + masque + '" data-serie="' + s.slug + '">' +
      '<polyline points="' + poly + '"></polyline>' + cercles + '</g>';
  });
  _comprendreLesChiffresCourbeData = data;

  var yPlein = yAt(COMPRENDRE_LES_CHIFFRES_PLEIN_EMPLOI);
  var labs = annees.map(function (a) {
    return '<text x="' + xAt(a).toFixed(1) + '" y="146" text-anchor="middle">' + _comprendreLesChiffresEchappe(a) + '</text>';
  }).join('');

  var choix = COMPRENDRE_LES_CHIFFRES_COURBE_SERIES.filter(function (s) { return (sa[s.cle] || []).length; }).map(function (s) {
    return '<button type="button" class="comprendre-les-chiffres-courbe-choix comprendre-les-chiffres-courbe-choix--' + s.slug + '" ' +
      'aria-pressed="' + (s.slug === defaut ? 'true' : 'false') + '" data-serie="' + s.slug + '" ' +
      'onclick="_comprendreLesChiffresCourbeBascule(this)">' +
      '<span class="comprendre-les-chiffres-courbe-pastille"></span>' + _comprendreLesChiffresEchappe(s.nom) + '</button>';
  }).join('');

  return '<div class="comprendre-les-chiffres-courbe-choix-rangee">' + choix + '</div>' +
    '<div class="comprendre-les-chiffres-courbe-wrap">' +
    '<svg class="comprendre-les-chiffres-courbe" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
    'aria-label="Évolution du taux de chômage sur plusieurs années" ' +
    'onmousemove="_comprendreLesChiffresCourbeSurvol(event)" onmouseleave="_comprendreLesChiffresCourbeQuitter(event)" ' +
    'ontouchstart="_comprendreLesChiffresCourbeSurvol(event)" ontouchmove="_comprendreLesChiffresCourbeSurvol(event)">' +
    '<line class="comprendre-les-chiffres-courbe-axe" x1="' + padG + '" y1="' + y0 + '" x2="' + (W - padD) + '" y2="' + y0 + '"></line>' +
    '<line class="comprendre-les-chiffres-courbe-plein" x1="' + padG + '" y1="' + yPlein.toFixed(1) + '" x2="' + (W - padD) + '" y2="' + yPlein.toFixed(1) + '"></line>' +
    '<text class="comprendre-les-chiffres-courbe-plein-lab" x="' + (W - padD) + '" y="' + (yPlein - 3).toFixed(1) + '" text-anchor="end">plein emploi (~' + COMPRENDRE_LES_CHIFFRES_PLEIN_EMPLOI + ' %)</text>' +
    '<line class="comprendre-les-chiffres-courbe-guide" x1="0" y1="' + yTop + '" x2="0" y2="' + y0 + '"></line>' +
    gs + labs + '</svg>' +
    '<div class="comprendre-les-chiffres-courbe-infobulle" hidden></div>' +
    '</div>' +
    '<p class="comprendre-les-chiffres-note">Cliquez sur un territoire pour ajouter ou retirer sa courbe. Déplacez la souris sur le graphe : l’année la plus proche s’affiche avec la valeur de chaque territoire visible. Ligne pointillée : le plein emploi (~' + COMPRENDRE_LES_CHIFFRES_PLEIN_EMPLOI + ' %).</p>';
}

function _comprendreLesChiffresCourbeBascule(btn) {
  var actif = btn.getAttribute('aria-pressed') === 'true';
  btn.setAttribute('aria-pressed', actif ? 'false' : 'true');
  var part = btn.closest('.comprendre-les-chiffres-evolution-part') || btn.parentNode.parentNode;
  var g = part && part.querySelector('.comprendre-les-chiffres-courbe-serie--' + btn.getAttribute('data-serie'));
  if (g) { g.classList.toggle('comprendre-les-chiffres-courbe-serie--masque', actif); }
}

function _comprendreLesChiffresCourbeSurvol(evt) {
  var svg = evt.currentTarget;
  var data = _comprendreLesChiffresCourbeData;
  if (!svg || !data || typeof svg.createSVGPoint !== 'function') { return; }
  var ctm = svg.getScreenCTM();
  if (!ctm) { return; }
  var src = (evt.touches && evt.touches[0]) ? evt.touches[0] : evt;
  var pt = svg.createSVGPoint();
  pt.x = src.clientX; pt.y = 0;
  var vx = pt.matrixTransform(ctm.inverse()).x;
  var i = 0, best = Infinity;
  data.xs.forEach(function (x, idx) { var dd = Math.abs(x - vx); if (dd < best) { best = dd; i = idx; } });
  var annee = data.annees[i], xc = data.xs[i];

  var guide = svg.querySelector('.comprendre-les-chiffres-courbe-guide');
  if (guide) { guide.setAttribute('x1', xc); guide.setAttribute('x2', xc); guide.style.visibility = 'visible'; }

  var box = svg.parentNode.querySelector('.comprendre-les-chiffres-courbe-infobulle');
  if (!box) { return; }
  var lignes = '<div class="comprendre-les-chiffres-courbe-ib-annee">' + _comprendreLesChiffresEchappe(annee) + '</div>';
  var n = 0;
  ['dep', 'na', 'fr', 'ue'].forEach(function (slug) {
    var g = svg.querySelector('.comprendre-les-chiffres-courbe-serie--' + slug);
    if (!g || g.classList.contains('comprendre-les-chiffres-courbe-serie--masque')) { return; }
    var s = data.series[slug];
    if (!s || s.valeurs[annee] == null) { return; }
    n++;
    lignes += '<div class="comprendre-les-chiffres-courbe-ib-l comprendre-les-chiffres-courbe-ib-l--' + slug + '">' +
      '<span class="comprendre-les-chiffres-courbe-ib-pt"></span>' + _comprendreLesChiffresEchappe(s.nom) +
      ' : <b>' + _comprendreLesChiffresEchappe(_comprendreLesChiffresFormatNombre(s.valeurs[annee])) + ' %</b></div>';
  });
  if (!n) { lignes += '<div class="comprendre-les-chiffres-courbe-ib-l">Aucun territoire affiché.</div>'; }
  lignes += '<div class="comprendre-les-chiffres-courbe-ib-src">INSEE (taux localisés) ; Eurostat pour l’Union européenne.</div>';
  box.innerHTML = lignes;
  box.hidden = false;
  var pct = xc / data.largeurVb * 100;
  if (i >= data.annees.length - 2) { box.style.left = 'auto'; box.style.right = (100 - pct).toFixed(1) + '%'; }
  else { box.style.right = 'auto'; box.style.left = pct.toFixed(1) + '%'; }
}

function _comprendreLesChiffresCourbeQuitter(evt) {
  var svg = evt.currentTarget;
  if (!svg) { return; }
  var guide = svg.querySelector('.comprendre-les-chiffres-courbe-guide');
  if (guide) { guide.style.visibility = 'hidden'; }
  var box = svg.parentNode && svg.parentNode.querySelector('.comprendre-les-chiffres-courbe-infobulle');
  if (box) { box.hidden = true; }
}
window._comprendreLesChiffresCourbeBascule = _comprendreLesChiffresCourbeBascule;
window._comprendreLesChiffresCourbeSurvol = _comprendreLesChiffresCourbeSurvol;
window._comprendreLesChiffresCourbeQuitter = _comprendreLesChiffresCourbeQuitter;

// Infobulle de source au survol de CHAQUE .chiffre (comme la maquette) :
// data-source du chiffre, sinon la ligne .source du bloc.
// Texte de la source d'un chiffre (data-source, sinon la ligne de source du bloc).
function _comprendreLesChiffresTexteSource(el) {
  var src = el.getAttribute('data-source');
  if (!src) {
    var bloc = el.closest('.comprendre-les-chiffres-indic, .comprendre-les-chiffres-depli-corps, .comprendre-les-chiffres-encart');
    var s = bloc && bloc.querySelector('.comprendre-les-chiffres-source');
    if (s) {
      var clone = s.cloneNode(true);
      var a = clone.querySelector('a, button'); if (a) { a.parentNode.removeChild(a); }
      src = clone.textContent.replace(/\s+/g, ' ').trim().replace(/^D['’]apr[eè]s\s*/i, '');
    }
  }
  return 'Source : ' + (src || 'voir la source en bas de ce bloc');
}

// Rend chaque chiffre atteignable au clavier (Tab, puis Entree ou Espace).
function _comprendreLesChiffresRendreChiffresAccessibles(racine) {
  (racine || document).querySelectorAll('.comprendre-les-chiffres-contenu .chiffre:not([tabindex])').forEach(function (el) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-expanded', 'false');
  });
}

// Survol (souris), toucher et clavier : meme bulle partagee (js/app.js,
// bulleInfoFlottanteBasculer). Sur telephone, le toucher d'un chiffre ou
// d'une barre de graphe ouvre la source ; un 2e toucher ou un toucher
// ailleurs la referme.
function _comprendreLesChiffresBrancherInfobulleChiffres() {
  if (_comprendreLesChiffresBrancherInfobulleChiffres._fait) { return; }
  _comprendreLesChiffresBrancherInfobulleChiffres._fait = true;
  var SEL = '.comprendre-les-chiffres-contenu .chiffre';
  var SEL_BARRE = '.comprendre-les-chiffres-graphe [data-tip]';
  document.addEventListener('mouseover', function (evt) {
    var el = evt.target.closest && evt.target.closest(SEL);
    if (!el || el.contains(evt.relatedTarget)) { return; }
    if (typeof bulleInfoFlottanteMontrer === 'function') { bulleInfoFlottanteMontrer(el, _comprendreLesChiffresTexteSource(el)); }
  });
  document.addEventListener('mouseout', function (evt) {
    var el = evt.target.closest && evt.target.closest(SEL);
    if (!el || el.contains(evt.relatedTarget)) { return; }
    if (typeof bulleInfoFlottanteFermer === 'function') { bulleInfoFlottanteFermer(); }
  });
  document.addEventListener('click', function (evt) {
    var el = evt.target.closest && evt.target.closest(SEL);
    var barre = !el && evt.target.closest ? evt.target.closest(SEL_BARRE) : null;
    if (typeof bulleInfoFlottanteBasculer !== 'function') { return; }
    if (el) { bulleInfoFlottanteBasculer(el, _comprendreLesChiffresTexteSource(el)); }
    else if (barre) {
      _comprendreLesChiffresGrapheInfobulleMasquer();
      bulleInfoFlottanteBasculer(barre, barre.getAttribute('data-tip'));
    }
  });
  document.addEventListener('keydown', function (evt) {
    if (evt.key !== 'Enter' && evt.key !== ' ') { return; }
    var el = evt.target.closest && evt.target.closest(SEL);
    if (!el) { return; }
    evt.preventDefault();
    if (typeof bulleInfoFlottanteBasculer === 'function') { bulleInfoFlottanteBasculer(el, _comprendreLesChiffresTexteSource(el)); }
  });
}

// Pastille « ouvrir la source » : un vrai lien cliquable (retour Denis),
// jamais un bouton mort. Repli en texte si l'URL manque.
function _comprendreLesChiffresRenduSource(e) {
  var nom = e.sourceNom || 'la source officielle';
  var txt = 'D’après ' + _comprendreLesChiffresEchappe(nom) +
    (e.date ? ', ' + _comprendreLesChiffresEchappe(e.date) : '') + '.';
  var lien = e.sourceUrl
    ? ' <a class="comprendre-les-chiffres-pastille" href="' + _comprendreLesChiffresEchappe(e.sourceUrl) +
      '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> Ouvrir la page</a>'
    : ' <span class="comprendre-les-chiffres-pastille-absente">adresse à vérifier</span>';
  return '<p class="comprendre-les-chiffres-source">' + txt + lien + '</p>';
}

// Ce que chaque carte clé montre en « Barres » et en « Camembert ». Rien n'est
// inventé : seulement des chiffres déjà dans le digest, dans la même unité.
// - Barres : le territoire lu face aux autres niveaux (seulement pour les
//   pourcentages, jamais « 17 500 personnes » face à un total national), puis
//   les derniers trimestres. Le chômage garde sa courbe d'origine plus bas.
// - Camembert : seulement quand les chiffres sont les parts d'un même tout
//   (ancienneté d'inscription, durée des embauches).
// Phrase sous la comparaison des niveaux (chômage seulement) : les trois chiffres sont du même
// trimestre pour pouvoir se comparer ; quand la France entière a déjà un trimestre plus récent,
// on le dit et on renvoie à l'encadré (consigne 229, cohérence de lecture).
function _comprendreLesChiffresNoteNiveaux(carte, e, entrees) {
  if (!carte || carte.slug !== 'chomage' || !e || !entrees) { return ''; }
  var rangE = _comprendreLesChiffresRangTrimestre(e.date);
  var plusRecent = null;
  entrees.forEach(function (x) {
    if (!plusRecent && x.terr === 'fr' && x.valeur && !/m[eé]tropolitaine/i.test(x.labelBrut || '') &&
        _comprendreLesChiffresRangTrimestre(x.date) > rangE) { plusRecent = x; }
  });
  var periode = String(e.date || '').replace(/,.*$/, '').trim();
  if (!plusRecent || !periode) { return ''; }
  return 'Ces trois chiffres sont ceux du ' + periode + ', pour pouvoir se comparer entre eux. Le trimestre suivant n’est publié que pour la France entière : voir l’encadré plus haut.';
}

function _comprendreLesChiffresVuesDonnees(carte, e, entrees, choisirTerr) {
  var niv = _comprendreLesChiffresNiveauCourant();
  var pourcent = /%/.test(e.valeur || '');
  var signe = !!carte.valeurEstVariation;
  var fmt = function (n, pc) { return _comprendreLesChiffresFormatNombre(n) + (pc ? ' %' : ''); };
  var srcDe = function (x) { return x && x.sourceNom ? x.sourceNom + (x.date ? ' - ' + x.date : '') : ''; };
  var nomDe = function (x) {
    if (x === e) { return _comprendreLesChiffresLibelleNiveauCourt(); }
    return x.terr === 'na' ? 'Nouvelle-Aquitaine' : 'France';
  };
  var ligneDe = function (x, pc) {
    var n = _comprendreLesChiffresNombre(x && x.valeur);
    if (n === null) { return null; }
    return { nom: nomDe(x), texte: fmt(n, pc), n: n, fort: x === e, source: srcDe(x) };
  };
  var groupes = [], camembert = null;

  // 1. Le territoire lu face aux autres niveaux (pourcentages seulement).
  if (pourcent && (niv === 'dep' || niv === 'na')) {
    var lignes = [ligneDe(e, true)];
    var autres = niv === 'dep' ? [choisirTerr('na'), choisirTerr('fr', true)] : [choisirTerr('fr', true)];
    autres.forEach(function (x) {
      if (x && x.valeur && _comprendreLesChiffresMemeNature(e.valeur, x.valeur)) { lignes.push(ligneDe(x, true)); }
    });
    var noteNiveaux = _comprendreLesChiffresNoteNiveaux(carte, e, entrees);
    groupes.push({ titre: 'Le territoire et les autres niveaux', lignes: lignes.filter(Boolean), signe: signe, territoires: true, note: noteNiveaux });
  }

  // 2. Les catégories de demandeurs (A seule, puis A + B + C), quand le digest les donne.
  if (carte.slug === 'demandeurs' && niv === 'dep') {
    var mABC = (e.reste || '').match(/A,?\s*B\s*et\s*C[^:]*:\s*environ\s*([\d\s  ]+?)\s*personnes?/i);
    var nA = _comprendreLesChiffresNombre(e.valeur);
    var nABC = mABC ? _comprendreLesChiffresNombre(mABC[1]) : null;
    if (nA !== null && nABC !== null) {
      groupes.push({
        titre: 'Selon les catégories d’inscription',
        lignes: [
          { nom: 'Catégorie A (aucune activité)', texte: fmt(nA, false), n: nA, fort: true, source: srcDe(e) },
          { nom: 'A, B et C ensemble', texte: fmt(nABC, false), n: nABC, source: srcDe(e) }
        ]
      });
    }
  }

  // 3. Les derniers trimestres (le chômage a déjà sa propre courbe, plus bas).
  if (carte.slug !== 'chomage' && e.serie && e.serie.length >= 2) {
    groupes.push({
      titre: 'Trimestre par trimestre',
      lignes: e.serie.map(function (p) { return { nom: p.label, texte: fmt(p.v, pourcent), n: p.v, source: srcDe(e) }; }),
      signe: signe
    });
  }

  // 4. Les parts d'un même tout.
  if (carte.slug === 'longue-duree') {
    var nLD = _comprendreLesChiffresNombre(e.valeur);
    if (nLD !== null && nLD >= 0 && nLD <= 100) {
      camembert = {
        titre: 'Depuis combien de temps les demandeurs sont inscrits : ' + _comprendreLesChiffresLibelleNiveauCourt(),
        parts: [
          { nom: 'Depuis un an et plus', texte: fmt(nLD, true), n: nLD },
          { nom: 'Depuis moins d’un an', texte: fmt(Math.round((100 - nLD) * 10) / 10, true), n: 100 - nLD }
        ],
        note: 'Sur 100 demandeurs inscrits à France Travail (catégories A, B et C), ' + _comprendreLesChiffresFormatNombre(nLD) + ' sur 100 le sont depuis un an et plus.'
      };
    }
  }
  if (carte.slug === 'offres') {
    var duree = function (code) {
      var trouve = null;
      (entrees || []).forEach(function (x) { if (x.terr === code && /durent plus d.?un mois/i.test(x.reste || '') && !trouve) { trouve = x; } });
      return trouve;
    };
    var xd = duree(_comprendreLesChiffresTerritoireDuNiveau());
    var nd = xd ? _comprendreLesChiffresNombre(xd.valeur) : null;
    if (nd !== null && nd >= 0 && nd <= 100) {
      var periode = (xd.reste || '').match(/\((\d[^)]*)\)/);
      var notePeriode = periode ? 'Chiffre du ' + periode[1] + '.' : '';
      var lignesD = [];
      var mk = function (x, fort) {
        var n = x ? _comprendreLesChiffresNombre(x.valeur) : null;
        if (n === null) { return; }
        lignesD.push({ nom: x.terr === 'na' ? 'Nouvelle-Aquitaine' : (x.terr === 'fr' ? 'France' : _comprendreLesChiffresLibelleNiveauCourt()), texte: fmt(n, true), n: n, fort: fort, source: srcDe(x) });
      };
      if (niv === 'dep') { mk(xd, true); mk(duree('na'), false); mk(duree('fr'), false); }
      else if (niv === 'na') { mk(xd, true); mk(duree('fr'), false); }
      groupes.push({ titre: 'Part des embauches qui durent plus d’un mois', lignes: lignesD, note: notePeriode });
      camembert = {
        titre: 'Durée des embauches du trimestre : ' + _comprendreLesChiffresLibelleNiveauCourt(),
        parts: [
          { nom: 'Plus d’un mois', texte: fmt(nd, true), n: nd },
          { nom: 'Un mois ou moins', texte: fmt(Math.round((100 - nd) * 10) / 10, true), n: 100 - nd }
        ],
        note: notePeriode
      };
    }
  }
  return { groupes: groupes, camembert: camembert };
}

// Assemble la lecture d'origine de la carte et ses autres façons de la lire.
function _comprendreLesChiffresVuesCarte(carte, e, entrees, choisirTerr, chiffresHTML) {
  var d = _comprendreLesChiffresVuesDonnees(carte, e, entrees, choisirTerr);
  return _comprendreLesChiffresVuesAssembler('carte-' + carte.slug, chiffresHTML, d.groupes, d.camembert);
}

// Une carte-indicateur (maquette : .indic).
function _comprendreLesChiffresRenduCarte(carte, entrees) {
  var cible = _comprendreLesChiffresTerritoireDuNiveau();
  var choisirTerr = function (code, preferMetro, plusRecent) {
    var trouve = null;
    if (code === 'fr' && preferMetro) {
      entrees.forEach(function (x) {
        if (x.terr === 'fr' && /m[eé]tropolitaine/i.test(x.labelBrut) && !trouve) { trouve = x; }
      });
    }
    entrees.forEach(function (x) { if (x.terr === code && !trouve) { trouve = x; } });
    // Au niveau « France entière », la carte principale lit le trimestre le plus récent publié
    // (consigne 229) : la France métropolitaine du trimestre d'avant ne passe plus devant.
    if (code === 'fr' && plusRecent && trouve) {
      var rang = _comprendreLesChiffresRangTrimestre(trouve.date);
      entrees.forEach(function (x) {
        var r = x.terr === 'fr' && x.valeur ? _comprendreLesChiffresRangTrimestre(x.date) : 0;
        if (r > rang) { trouve = x; rang = r; }
      });
    }
    return trouve;
  };
  var e = choisirTerr(cible, cible === 'fr', cible === 'fr');
  var idAttr = ' id="comprendre-les-chiffres-carte-' + carte.slug + '"';
  var d = _comprendreLesChiffresDigest;

  var corps = '<p class="comprendre-les-chiffres-indic-q">' + _comprendreLesChiffresEchappe(carte.q) + '</p>';
  var smicHTML = (carte.slug === 'chomage') ? _comprendreLesChiffresRenduBlocSmic() : '';

  if (!e || !e.valeur) {
    var msg = (e && e.note)
      ? 'Ce chiffre n’est pas encore disponible pour ce territoire. Il sera ajouté au prochain trimestre.'
      : 'Ce chiffre n’est pas publié à ce niveau de lecture. Changez de niveau ci-dessus pour le voir.';
    corps += '<p class="comprendre-les-chiffres-indic-absent"><i class="bi bi-hourglass-split"></i> ' + msg + '</p>';
    if (e && e.sourceNom) { corps += _comprendreLesChiffresRenduSource(e); }
    return '<div class="comprendre-les-chiffres-indic"' + idAttr + '>' + corps + smicHTML + '</div>';
  }

  var srcAttr = e.sourceNom ? ' data-source="' + _comprendreLesChiffresEchappe(e.sourceNom + (e.date ? ' - ' + e.date : '')) + '"' : '';
  // Les deux extrêmes de la série : même source que le chiffre du moment, mais sans la date de celui-ci (elle ne les concerne pas).
  var histoAttr = e.sourceNom ? ' data-source="' + _comprendreLesChiffresEchappe(e.sourceNom + ' - plus haut et plus bas de toute la série') + '"' : '';
  var chiffres = '<p class="comprendre-les-chiffres-indic-valeur"><span class="chiffre"' + srcAttr + '>' +
    _comprendreLesChiffresEchappe(e.valeur) + '</span></p>';

  var tend = _comprendreLesChiffresTendance(carte, e);
  if (tend) {
    chiffres += '<span class="comprendre-les-chiffres-tendance">' + tend.fleche + ' ' + tend.mot + '</span>';
  }

  var phrase = carte.phrase(e);
  if (phrase) { chiffres += '<p class="comprendre-les-chiffres-indic-phrase">' + phrase + '</p>'; }

  var cmp = [];
  if (e.precedent) { cmp.push('<b>Il y a un trimestre :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(e.precedent) + '</span>'); }
  if (e.anPrecedent) { cmp.push('<b>il y a un an :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(e.anPrecedent) + '</span>'); }
  if (cmp.length) { chiffres += '<p class="comprendre-les-chiffres-compare">' + cmp.join(' &nbsp;&bull;&nbsp; ') + '</p>'; }

  // Comparaison région / France quand on lit au niveau département, et
  // seulement pour les indicateurs en pourcentage (comparer « 17 500
  // personnes » ou « 51 000 offres » d'un département à un total national
  // n'a pas de sens sans rapporter à la population - maquette : seules les
  // cartes chômage et longue durée ont cette ligne).
  var dVues = _comprendreLesChiffresVuesDonnees(carte, e, entrees, choisirTerr);
  var territoiresEnLignes = dVues.groupes.some(function (g) { return g.territoires && g.lignes.length >= 2; });
  if (carte.comparerTerr && _comprendreLesChiffresNiveauCourant() === 'dep' && !territoiresEnLignes) {
    var autres = [];
    var na = choisirTerr('na');
    if (na && na.valeur && _comprendreLesChiffresMemeNature(e.valeur, na.valeur)) {
      autres.push('<b>Nouvelle-Aquitaine :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(na.valeur) + '</span>');
    }
    var fr = choisirTerr('fr', true);
    if (fr && fr.valeur && _comprendreLesChiffresMemeNature(e.valeur, fr.valeur)) {
      autres.push('<b>France :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(fr.valeur) + '</span>');
    }
    if (autres.length) { chiffres += '<p class="comprendre-les-chiffres-compare">' + autres.join(' &nbsp;&bull;&nbsp; ') + '</p>'; }
  }

  var rep = _comprendreLesChiffresRepere(carte, e, choisirTerr);
  if (rep) {
    chiffres += '<p class="comprendre-les-chiffres-repere">' + _comprendreLesChiffresEchappe(rep) + '</p>';
  }

  chiffres += _comprendreLesChiffresBlocNationalRecent(carte, e, entrees);

  if (carte.encart) {
    chiffres += '<div class="comprendre-les-chiffres-encart small"><i class="bi bi-info-circle"></i> ' +
      _comprendreLesChiffresEchappe(carte.encart) + '</div>';
  }

  if (carte.slug === 'chomage' && _comprendreLesChiffresEstVueEnsemble()) {
    chiffres += '<p class="comprendre-les-chiffres-a-lire-avec"><i class="bi bi-link-45deg"></i> À lire avec : ' +
      '<button type="button" class="comprendre-les-chiffres-lien-interne" data-comprendre-les-chiffres-vers="comprendre-les-chiffres-carte-demandeurs">le nombre de personnes qui cherchent un emploi</button>' +
      ' (une baisse du taux qui ne s’accompagne pas d’une baisse des inscrits vient souvent de sorties de liste).</p>';
  }

  corps += _comprendreLesChiffresVuesCarte(carte, e, entrees, choisirTerr, chiffres);

  // Bloc évolution (pleine largeur de la carte quand il y a une colonne
  // « Où se situer »).
  var evoHTML = '';
  if (carte.slug === 'chomage' && d && d.serieAnnuelle && Object.keys(d.serieAnnuelle).length &&
      e.serie && e.serie.length >= 2) {
    evoHTML = '<div class="comprendre-les-chiffres-evolution">' +
      '<h4 class="comprendre-les-chiffres-evolution-titre"><i class="bi bi-graph-up"></i> L’évolution du chômage</h4>' +
      '<div class="comprendre-les-chiffres-evolution-grille">' +
      '<div class="comprendre-les-chiffres-evolution-part">' +
      '<h5>Les 4 derniers trimestres</h5>' +
      _comprendreLesChiffresRenduGraphe(e) +
      '<p class="comprendre-les-chiffres-note">Au survol (ou au toucher) d’une barre : le trimestre, la valeur et la source.</p>' +
      (e.histo && e.histo.haut && e.histo.bas && _comprendreLesChiffresPositionFourchette(e.valeur, e.histo.bas, e.histo.haut)
        ? '<p class="comprendre-les-chiffres-evolution-histo"><i class="bi bi-arrows-expand"></i> Sur toute la série de l’INSEE, le chômage y est allé de ' +
          '<span class="chiffre"' + histoAttr + '>' +
          _comprendreLesChiffresEchappe(e.histo.bas) + '</span> à ' +
          '<span class="chiffre"' + histoAttr + '>' +
          _comprendreLesChiffresEchappe(e.histo.haut) + '</span>. À <span class="chiffre"' + srcAttr + '>' +
          _comprendreLesChiffresEchappe(e.valeur) + '</span>, on est ' + _comprendreLesChiffresPositionFourchette(e.valeur, e.histo.bas, e.histo.haut) + '.</p>'
        : '') +
      '</div>' +
      '<div class="comprendre-les-chiffres-evolution-part">' +
      '<h5>L’évolution sur plusieurs années</h5>' +
      _comprendreLesChiffresRenduCourbeAnnuelle(d.serieAnnuelle, _comprendreLesChiffresNiveauCourant() === 'dep' ? 'dep' : _comprendreLesChiffresNiveauCourant()) +
      '</div>' +
      '</div></div>';
  } else if (carte.graphe && e.serie && e.serie.length >= 2) {
    evoHTML = '<details class="comprendre-les-chiffres-depli comprendre-les-chiffres-depli-evolution">' +
      '<summary><span class="comprendre-les-chiffres-depli-titre">Voir l’évolution sur ' + e.serie.length + ' trimestres</span>' +
      '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span></summary>' +
      '<div class="comprendre-les-chiffres-depli-corps">' +
      _comprendreLesChiffresRenduGraphe(e) +
      '<p class="comprendre-les-chiffres-note">Le chiffre est écrit au-dessus de chaque barre. Au survol (ou au toucher), la barre affiche le trimestre, la valeur et la source.</p>' +
      '</div></details>';
  }

  var srcHTML = _comprendreLesChiffresRenduSource(e);

  // Colonne droite (niveau département) : « Où se situer » pour la carte
  // chômage, complément explicatif pour les 4 autres.
  var cote = '';
  if (_comprendreLesChiffresNiveauCourant() === 'dep' && e && e.valeur) {
    if (carte.slug === 'chomage' && d && d.ouSeSituer && d.ouSeSituer.depBas) {
      cote = _comprendreLesChiffresRenduOuSeSituer(d.ouSeSituer, e, choisirTerr('na'));
    } else if (carte.cote) {
      var innerCote = carte.cote(e, entrees, choisirTerr);
      if (innerCote) {
        cote = '<aside class="comprendre-les-chiffres-ou-se-situer comprendre-les-chiffres-cote">' + innerCote + '</aside>';
      }
    }
  }
  if (cote) {
    var clsCote = 'comprendre-les-chiffres-indic comprendre-les-chiffres-indic--avec-cote' +
      (carte.slug !== 'chomage' ? ' comprendre-les-chiffres-indic--maigre' : '');
    return '<div class="' + clsCote + '"' + idAttr + '>' +
      '<div class="comprendre-les-chiffres-indic-grille">' +
      '<div class="comprendre-les-chiffres-indic-gauche">' + corps + '</div>' +
      cote + '</div>' +
      smicHTML + evoHTML + srcHTML + '</div>';
  }
  return '<div class="comprendre-les-chiffres-indic"' + idAttr + '>' + corps + smicHTML + evoHTML + srcHTML + '</div>';
}

// Numéro d'un trimestre cité dans un texte (« 3e trimestre 2026 », « 1er trimestre 2026 ») : année x 4 + trimestre, 0 s'il n'y en a pas. Sert à comparer deux dates.
function _comprendreLesChiffresRangTrimestre(texte) {
  var m = String(texte || '').match(/(\d)(?:er|e)\s+trimestre\s+(20\d\d)/i);
  return m ? parseInt(m[2], 10) * 4 + parseInt(m[1], 10) : 0;
}

// Chômage : le taux NATIONAL de l'INSEE paraît plus tôt (environ un trimestre) que les taux par région et département. Quand la ligne « France entière »
// du digest est plus récente que le chiffre de la carte, un encadré le montre, avec son repère, et dit quand les chiffres du territoire seront à jour
// (prochaine_maj du digest). Le texte du repère vient du digest : il change quand le chiffre change, jamais écrit ici. Rien si la ligne n'est pas plus récente.
function _comprendreLesChiffresBlocNationalRecent(carte, e, entrees) {
  if (!carte || carte.slug !== 'chomage' || !e || !entrees) { return ''; }
  var nat = null;
  entrees.forEach(function (x) { if (!nat && x.terr === 'fr' && x.valeur && !/m[eé]tropolitaine/i.test(x.labelBrut || '')) { nat = x; } });
  var rangNat = nat ? _comprendreLesChiffresRangTrimestre(nat.date) : 0;
  if (!nat || nat === e || !rangNat || rangNat <= _comprendreLesChiffresRangTrimestre(e.date)) { return ''; }
  var d = _comprendreLesChiffresDigest;
  var src = nat.sourceNom ? ' data-source="' + _comprendreLesChiffresEchappe(nat.sourceNom + (nat.date ? ' - ' + nat.date : '')) + '"' : '';
  var cmp = [];
  if (nat.precedent) { cmp.push('<b>Il y a un trimestre :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(nat.precedent) + '</span>'); }
  if (nat.anPrecedent) { cmp.push('<b>il y a un an :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(nat.anPrecedent) + '</span>'); }
  var suite = (d && d.prochaine_maj)
    ? 'Les chiffres par région et par département du même trimestre paraissent plus tard : ils seront ajoutés avec la prochaine mise à jour (' + _comprendreLesChiffresEchappe(d.prochaine_maj) + '). Ceux affichés sur cette carte sont ceux du trimestre précédent.'
    : 'Les chiffres par région et par département du même trimestre paraissent plus tard.';
  return '<div class="comprendre-les-chiffres-national-recent">' +
    '<p class="comprendre-les-chiffres-national-titre"><i class="bi bi-flag"></i> Le plus récent, pour la France entière</p>' +
    '<p class="comprendre-les-chiffres-indic-valeur"><span class="chiffre"' + src + '>' + _comprendreLesChiffresEchappe(nat.valeur) + '</span> ' +
      '<span class="comprendre-les-chiffres-national-date">' + _comprendreLesChiffresEchappe(nat.date) + '</span></p>' +
    (cmp.length ? '<p class="comprendre-les-chiffres-compare">' + cmp.join(' &nbsp;&bull;&nbsp; ') + '</p>' : '') +
    (nat.repere ? '<p class="comprendre-les-chiffres-repere">' + _comprendreLesChiffresEchappe(nat.repere) + '</p>' : '') +
    '<p class="small mb-0">' + suite + '</p>' +
  '</div>';
}

// Le repère : le « c'est élevé / en baisse / dans la moyenne » en un coup
// d'œil, sous le chiffre. Hybride : la ligne `repere:` du digest si elle
// existe, sinon un brouillon calculé (comparaison au national + sens de
// l'évolution).
function _comprendreLesChiffresRepere(carte, e, choisirTerr) {
  if (e && e.repere) { return e.repere; }
  var bouts = [];
  // Comparaison au national, seulement pour les % au niveau département.
  if (carte.comparerTerr && _comprendreLesChiffresNiveauCourant() === 'dep' && /%/.test(e.valeur || '')) {
    var fr = choisirTerr('fr', true);
    var vLoc = _comprendreLesChiffresNombre(e.valeur);
    var vFr = fr && _comprendreLesChiffresNombre(fr.valeur);
    if (vLoc !== null && vFr !== null && _comprendreLesChiffresMemeNature(e.valeur, fr.valeur)) {
      var ecart = vLoc - vFr;
      bouts.push(Math.abs(ecart) < 0.25 ? 'Dans la moyenne française'
        : (ecart > 0 ? 'Un peu au-dessus de la moyenne française' : 'Un peu en dessous de la moyenne française'));
    }
  }
  var tend = _comprendreLesChiffresTendance(carte, e);
  if (tend) {
    var mot = { 'en légère baisse': 'plutôt en baisse', 'en légère hausse': 'plutôt en hausse', 'à peu près stable': 'à peu près stable' }[tend.mot] || tend.mot;
    bouts.push((bouts.length ? '' : 'Chiffre ') + mot + ' depuis un an');
  }
  if (!bouts.length) { return ''; }
  var t = bouts.join(', ');
  return t.charAt(0).toUpperCase() + t.slice(1) + '.';
}

// Colonne droite de la carte chômage : « Où se situer » - deux barres
// (départements, régions) avec les extrêmes aux bouts, la position du
// territoire lu, puis le repère plein emploi. Données : digest.ouSeSituer.
function _comprendreLesChiffresRenduOuSeSituer(oss, eDep, eReg) {
  var libDep = _comprendreLesChiffresLibelleNiveau().replace(/^(la|le|l['’]) ?/i, '');

  // Une barre : bornes aux extremites, marque a la position du territoire
  // repere (le departement pour la barre departements, la region pour la
  // barre regions).
  var barre = function (titre, bas, haut, repere) {
    if (!bas || !haut || !repere || !repere.valeur) { return ''; }
    var vb = _comprendreLesChiffresNombre(bas.valeur);
    var vh = _comprendreLesChiffresNombre(haut.valeur);
    var vr = _comprendreLesChiffresNombre(repere.valeur);
    var marque = '';
    if (vb !== null && vh !== null && vr !== null && vh > vb) {
      var pos = Math.max(0, Math.min(100, (vr - vb) / (vh - vb) * 100));
      marque = '<span class="comprendre-les-chiffres-oss-marque" style="left:' + pos.toFixed(1) + '%" ' +
        'data-lab="' + _comprendreLesChiffresEchappe(repere.nom + ' ' + repere.valeur) + '"></span>';
    }
    return '<div class="comprendre-les-chiffres-oss-bloc">' +
      '<p class="comprendre-les-chiffres-oss-titre">' + _comprendreLesChiffresEchappe(titre) + '</p>' +
      '<p class="comprendre-les-chiffres-oss-bornes">' +
      '<span>le plus bas<br><b class="chiffre">' + _comprendreLesChiffresEchappe(bas.valeur) + '</b> ' + _comprendreLesChiffresEchappe(bas.nom) + '</span>' +
      '<span>le plus haut<br><b class="chiffre">' + _comprendreLesChiffresEchappe(haut.valeur) + '</b> ' + _comprendreLesChiffresEchappe(haut.nom) + '</span>' +
      '</p>' +
      '<div class="comprendre-les-chiffres-oss-echelle"><div class="comprendre-les-chiffres-oss-piste">' + marque + '</div></div>' +
      '</div>';
  };

  var repDep = { nom: libDep, valeur: eDep && eDep.valeur };
  var repReg = { nom: 'Nouvelle-Aquitaine', valeur: eReg && eReg.valeur };

  return '<aside class="comprendre-les-chiffres-ou-se-situer">' +
    '<p class="comprendre-les-chiffres-oss-tete">Où se situe ' + _comprendreLesChiffresEchappe(_comprendreLesChiffresLibelleNiveau()) + '</p>' +
    barre('Départements', oss.depBas, oss.depHaut, repDep) +
    barre('Régions', oss.regBas, oss.regHaut, repReg) +
    '<p class="comprendre-les-chiffres-oss-plein">Le gouvernement vise le <b>plein emploi</b> : un chômage autour de <b>' + COMPRENDRE_LES_CHIFFRES_PLEIN_EMPLOI + ' %</b>.</p>' +
    '</aside>';
}

// Encart des pièges de lecture (maquette : « Ce qu'il faut savoir avant
// de lire ces chiffres »).
function _comprendreLesChiffresRenduPieges() {
  var pieges = [
    '<b>« Personnes qui cherchent un emploi » n’est pas « chômage » au sens de l’INSEE.</b> France Travail compte des personnes inscrites ; l’INSEE mesure autre chose, par enquête. Le second nombre est plus étroit.',
    '<b>Le chômage peut baisser sans plus d’emplois.</b> Des personnes sortent des listes : formation, maladie, découragement, changement de catégorie.',
    '<b>Le dernier trimestre de l’INSEE est provisoire</b> : il peut être revu.',
    '<b>Un seul trimestre ne fait pas une tendance</b> : regardez l’évolution sur un an.',
    '<b>Effet de saison</b> : comparez toujours au même trimestre de l’année précédente.',
    '<b>Depuis la loi pour le plein emploi (2025)</b>, la façon de compter certaines personnes a changé : ça peut faire varier les chiffres sans que le marché bouge.'
  ];
  var ouvert = _comprendreLesChiffresEstVueEnsemble();
  return '<details class="comprendre-les-chiffres-depli"' + (ouvert ? ' open' : '') + '>' +
    '<summary><span class="comprendre-les-chiffres-depli-titre">Ce qu’il faut savoir avant de lire ces chiffres</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span>' +
    '<span class="comprendre-les-chiffres-depli-desc">Six pièges de lecture à connaître, et trois fiches pour bien lire un chiffre.</span></summary>' +
    '<div class="comprendre-les-chiffres-depli-corps"><ul class="comprendre-les-chiffres-liste">' +
    pieges.map(function (p) { return '<li>' + p + '</li>'; }).join('') +
    '</ul>' +
    _comprendreLesChiffresRenduFichesMethode() +
    '</div></details>';
}

// ---- Fiches méthode (« bien lire un chiffre du marché du travail ») ----

var COMPRENDRE_LES_CHIFFRES_METHODE_FICHES = [
  'comment-lire-un-taux-de-chomage',
  'taux-insee-ou-personnes-inscrites',
  'comment-lire-une-evolution'
];
var _comprendreLesChiffresMethode = null; // { <id>: {titre, pourQui, corps} }
var _comprendreLesChiffresMethodeEtat = 'inactif';

function _comprendreLesChiffresChargerMethode() {
  if (_comprendreLesChiffresMethodeEtat === 'encours' || _comprendreLesChiffresMethodeEtat === 'ok') { return; }
  _comprendreLesChiffresMethodeEtat = 'encours';
  Promise.all(COMPRENDRE_LES_CHIFFRES_METHODE_FICHES.map(function (id) {
    return fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + 'methode/' + id + '.md')
      .then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
  })).then(function (textes) {
    var out = {};
    textes.forEach(function (t, i) {
      if (!t) { return; }
      var f = _comprendreLesChiffresParserFiche(t);
      if (f) { out[COMPRENDRE_LES_CHIFFRES_METHODE_FICHES[i]] = f; }
    });
    _comprendreLesChiffresMethode = out;
    _comprendreLesChiffresMethodeEtat = Object.keys(out).length ? 'ok' : 'vide';
    if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
  }).catch(function () {
    _comprendreLesChiffresMethodeEtat = 'erreur';
  });
}

// Parseur d'une fiche méthode : front-matter (titre, pour_qui) + corps
// markdown simple (## sous-titres, **gras**, listes à puces, paragraphes).
function _comprendreLesChiffresParserFiche(md) {
  var m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) { return null; }
  var entete = m[1];
  var lire = function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    return mm ? mm[1].trim().replace(/^"|"$/g, '') : '';
  };
  return { titre: lire('titre'), pourQui: lire('pour_qui'), corps: _comprendreLesChiffresRenduCorpsFiche(m[2] || '') };
}

function _comprendreLesChiffresRenduCorpsFiche(corps) {
  var html = '', dansListe = false;
  corps.replace(/^#\s+.*$/m, '').split('\n').forEach(function (brute) {
    var ligne = brute.trim();
    if (!ligne) { if (dansListe) { html += '</ul>'; dansListe = false; } return; }
    var mH = ligne.match(/^##\s+(.+)$/);
    if (mH) {
      if (dansListe) { html += '</ul>'; dansListe = false; }
      html += '<h4 class="comprendre-les-chiffres-fiche-soustitre">' + _comprendreLesChiffresEchappe(mH[1]) + '</h4>';
      return;
    }
    var gras = function (s) { return _comprendreLesChiffresEchappe(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); };
    var mL = ligne.match(/^[-*]\s+(.+)$/);
    if (mL) {
      if (!dansListe) { html += '<ul class="comprendre-les-chiffres-liste">'; dansListe = true; }
      html += '<li>' + gras(mL[1]) + '</li>';
      return;
    }
    if (dansListe) { html += '</ul>'; dansListe = false; }
    html += '<p>' + gras(ligne) + '</p>';
  });
  if (dansListe) { html += '</ul>'; }
  return html;
}

function _comprendreLesChiffresRenduFichesMethode() {
  if (_comprendreLesChiffresMethodeEtat !== 'ok' || !_comprendreLesChiffresMethode) { return ''; }
  var fiches = COMPRENDRE_LES_CHIFFRES_METHODE_FICHES
    .map(function (id) { return _comprendreLesChiffresMethode[id]; })
    .filter(Boolean);
  if (!fiches.length) { return ''; }
  return '<p class="comprendre-les-chiffres-note" style="margin-top:.6rem"><b>Pour aller plus loin :</b></p>' +
    fiches.map(function (f) {
      return '<details class="comprendre-les-chiffres-depli">' +
        '<summary><span class="comprendre-les-chiffres-depli-titre">' + _comprendreLesChiffresEchappe(f.titre) + '</span>' +
        '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span>' +
        (f.pourQui ? '<span class="comprendre-les-chiffres-depli-desc">' + _comprendreLesChiffresEchappe(f.pourQui) + '</span>' : '') +
        '</summary>' +
        '<div class="comprendre-les-chiffres-depli-corps">' + f.corps + '</div></details>';
    }).join('');
}

// Archive des trimestres précédents.
function _comprendreLesChiffresRenduArchive(digest) {
  var arch = digest.archive || [];
  if (!arch.length) {
    return '<p class="comprendre-les-chiffres-note">Les photos plus anciennes apparaîtront ici au fil des trimestres.</p>';
  }
  return '<div class="comprendre-les-chiffres-archive">' +
    arch.map(function (a) {
      return '<button type="button" class="btn btn-outline-secondary btn-sm" disabled>' +
        _comprendreLesChiffresEchappe(a.periode || a.mois) + '</button>';
    }).join('') +
    '</div><p class="comprendre-les-chiffres-note">Les archives seront consultables dans un prochain temps du chantier.</p>';
}

// Ligne de fraîcheur : « Données du trimestre <periode>. Prochaine mise à
// jour prévue : <prochaine_maj>. »
function _comprendreLesChiffresLigneFraicheur(digest) {
  var txt = digest.periode ? ('Données du trimestre : ' + digest.periode + '.') : 'Photo datée du dernier trimestre publié.';
  if (digest.prochaine_maj) { txt += ' Prochaine mise à jour prévue : ' + digest.prochaine_maj + '.'; }
  return '<span class="comprendre-les-chiffres-fraicheur">&#128197; ' + _comprendreLesChiffresEchappe(txt) + '</span>';
}

// ============================================================
// BLOC 6 : vue d'ensemble (professionnel de l'insertion)
// ============================================================

function _comprendreLesChiffresEstVueEnsemble() {
  return _comprendreLesChiffresEtat.vue === 'ensemble';
}

// Garde-fou CIP + lecture du territoire + tableau de synthèse + imprimer.
// Affiché en tête du contenu, seulement en vue d'ensemble.
function _comprendreLesChiffresRenduVueEnsemble() {
  if (!_comprendreLesChiffresEstVueEnsemble()) { return ''; }
  var d = _comprendreLesChiffresDigest;
  var html = '<div class="comprendre-les-chiffres-encart comprendre-les-chiffres-encart-gardefou">' +
    '<i class="bi bi-shield-check"></i> <span>Ces chiffres <b>décrivent un territoire, ils ne concluent rien sur un projet</b>. ' +
    'Ils servent à repérer des difficultés et à s’y préparer avec la personne, jamais à la décourager ni à revoir son projet à la baisse.</span></div>';

  // TACHE (retour Denis 2026-09-12) : lecture est desormais un objet cle
  // par territoire (comme syntheseCourte) -- on ne montre QUE le texte du
  // territoire actuellement choisi, jamais un texte partage qui finirait
  // par nommer un autre departement que celui affiche.
  var lectureTerr = d && d.lecture && d.lecture[_comprendreLesChiffresTerritoireDuNiveau()];
  if (lectureTerr) {
    html += '<div class="comprendre-les-chiffres-carte-teinte">' +
      '<h3 class="mt-0">La lecture du territoire</h3>' +
      '<p class="comprendre-les-chiffres-note">Texte de synthèse, mis à jour chaque trimestre' +
      (d.periode ? ', daté du <b>' + _comprendreLesChiffresEchappe(d.periode) + '</b>' : '') +
      '. Il relie les chiffres entre eux avec prudence : il décrit, il ne prédit rien et ne juge aucun projet.</p>' +
      _comprendreLesChiffresRenduTexteLibre(lectureTerr) +
      '</div>';
  }

  if (_comprendreLesChiffresZonesEmploiEtat === 'inactif') { _comprendreLesChiffresChargerZonesEmploi(); }
  html += _comprendreLesChiffresRenduZonesEmploi();
  if (_comprendreLesChiffresDepartementsRegionEtat === 'inactif') { _comprendreLesChiffresChargerDepartementsRegion(); }
  html += _comprendreLesChiffresRenduDepartementsRegion();
  if (_comprendreLesChiffresRegionsFranceEtat === 'inactif') { _comprendreLesChiffresChargerRegionsFrance(); }
  html += _comprendreLesChiffresRenduRegionsFrance();
  html += _comprendreLesChiffresRenduProfessionsSante();

  if (d) {
    var lignes = _comprendreLesChiffresLignesSynthese(d);
    if (lignes.length) {
      html += '<details class="comprendre-les-chiffres-depli" open>' +
        '<summary><span class="comprendre-les-chiffres-depli-titre">Tableau de synthèse</span>' +
        '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span>' +
        '<span class="comprendre-les-chiffres-depli-desc">Toutes les valeurs sur une grille, sans rien dérouler.</span></summary>' +
        '<div class="comprendre-les-chiffres-depli-corps">' +
        '<div class="comprendre-les-chiffres-tab-scroll"><table class="comprendre-les-chiffres-synthese">' +
        '<tr><th>Indicateur</th><th>' + _comprendreLesChiffresEchappe(_comprendreLesChiffresLibelleNiveauCourt()) + '</th><th>Tendance</th><th>N.-Aquitaine</th><th>France</th></tr>' +
        lignes.join('') +
        '</table></div>' +
        '<p class="comprendre-les-chiffres-note">Les valeurs régionales et nationales manquantes le sont parce que la source ne les publie pas au même niveau.</p>' +
        '</div></details>';
    }
  }

  html += '<div class="btn-rangee"><button type="button" class="btn btn-outline-secondary" data-comprendre-les-chiffres-imprimer>' +
    '<i class="bi bi-printer"></i> Imprimer la vue d’ensemble</button></div>';
  return html;
}

function _comprendreLesChiffresLignesSynthese(d) {
  var terr = _comprendreLesChiffresTerritoireDuNiveau();
  return COMPRENDRE_LES_CHIFFRES_CARTES.map(function (carte) {
    var entrees = d.sections[carte.slug] || [];
    var get = function (code, metro) {
      var r = null;
      entrees.forEach(function (x) {
        if (x.terr === code && x.valeur && !r) {
          if (code === 'fr' && metro && !/m[eé]tropolitaine/i.test(x.labelBrut)) { return; }
          r = x;
        }
      });
      if (!r && code === 'fr') { entrees.forEach(function (x) { if (x.terr === 'fr' && x.valeur && !r) { r = x; } }); }
      return r;
    };
    var e = get(terr) || (terr === 'fr' ? get('fr', true) : null);
    if (!e || !e.valeur) { return ''; }
    var tend = _comprendreLesChiffresTendance(carte, e);
    var na = get('na'), fr = get('fr', true);
    var meme = function (x) { return x && x.valeur && _comprendreLesChiffresMemeNature(e.valeur, x.valeur) ? '<span class="chiffre">' + _comprendreLesChiffresEchappe(x.valeur) + '</span>' : '&#8212;'; };
    return '<tr><td>' + _comprendreLesChiffresEchappe(carte.q.replace(/\s*\?$/, '')) + '</td>' +
      '<td><span class="chiffre">' + _comprendreLesChiffresEchappe(e.valeur) + '</span></td>' +
      '<td>' + (tend ? tend.fleche + ' ' + tend.mot : '&#8212;') + '</td>' +
      '<td>' + (carte.comparerTerr ? meme(na) : '&#8212;') + '</td>' +
      '<td>' + (carte.comparerTerr ? meme(fr) : '&#8212;') + '</td></tr>';
  });
}

// La section « Les 5 chiffres clés du trimestre » complète.
function _comprendreLesChiffresRenduCouche1() {
  var etat = _comprendreLesChiffresChargement;
  if (etat === 'encours' || etat === 'inactif') {
    return '<h2 class="comprendre-les-chiffres-section comprendre-les-chiffres-section-1">Les 5 chiffres clés du trimestre</h2>' +
      '<p class="comprendre-les-chiffres-note"><i class="bi bi-hourglass-split"></i> Chargement des chiffres...</p>';
  }
  if (etat === 'vide') {
    return '<h2 class="comprendre-les-chiffres-section comprendre-les-chiffres-section-1">Les 5 chiffres clés du trimestre</h2>' +
      '<div class="comprendre-les-chiffres-encart"><i class="bi bi-info-circle"></i> Aucun digest trimestriel n’est encore publié. Il sera préparé avec l’outil de veille, une fois par trimestre.</div>';
  }
  if (etat === 'erreur' || !_comprendreLesChiffresDigest) {
    return '<h2 class="comprendre-les-chiffres-section comprendre-les-chiffres-section-1">Les 5 chiffres clés du trimestre</h2>' +
      '<div class="comprendre-les-chiffres-encart"><i class="bi bi-exclamation-triangle"></i> Les chiffres n’ont pas pu être chargés. Réessayez plus tard.</div>';
  }

  var digest = _comprendreLesChiffresDigest;
  var html = '<h2 class="comprendre-les-chiffres-section comprendre-les-chiffres-section-1">Les 5 chiffres clés du trimestre</h2>' +
    '<p class="comprendre-les-chiffres-section-intro"><b>Commencez par ces cinq chiffres.</b> Le reste (portrait du territoire, projets d’embauche, outil de comparaison) est plus bas, à ouvrir seulement si vous le souhaitez.<br>' +
    _comprendreLesChiffresLigneFraicheur(digest) + '</p>';

  // Phrase de synthèse en tête (vue simple ; en vue d'ensemble la lecture
  // complète est déjà affichée plus haut).
  var syn = digest.syntheseCourte && digest.syntheseCourte[_comprendreLesChiffresTerritoireDuNiveau()];
  if (syn && !_comprendreLesChiffresEstVueEnsemble()) {
    html += '<div class="comprendre-les-chiffres-synthese-courte">' +
      '<p class="comprendre-les-chiffres-synthese-courte-titre">En quelques mots</p>' +
      '<p>' + _comprendreLesChiffresEchappe(syn) + '</p>' +
      '<p class="comprendre-les-chiffres-synthese-courte-gardefou">Ces chiffres décrivent un territoire. Ils ne disent rien sur votre projet à vous : ils servent à repérer des difficultés et à s’y préparer, jamais à se décourager.</p>' +
      '</div>';
  }

  COMPRENDRE_LES_CHIFFRES_CARTES.forEach(function (carte) {
    var entrees = digest.sections[carte.slug] || [];
    html += _comprendreLesChiffresRenduCarte(carte, entrees);
  });

  html += _comprendreLesChiffresRenduBlocRepliable('archive', 'Les trimestres précédents',
    'Retrouver les mêmes cinq chiffres pour les photos plus anciennes.',
    _comprendreLesChiffresRenduArchive(digest), _comprendreLesChiffresEstVueEnsemble()) +
    _comprendreLesChiffresRenduPieges();

  // La « lecture du territoire » (texte unique qui couvre les deux
  // départements) n'est montrée qu'en vue d'ensemble. En vue par territoire,
  // « En quelques mots » plus haut donne déjà la synthèse propre au
  // territoire choisi (sinon on réaffichait du contenu Dordogne à quelqu'un
  // qui a choisi la Haute-Vienne, et inversement - bug Denis 2026-09-10).
  return html;
}

// Rendu markdown minimal (paragraphes + gras + [brouillon...] retiré) pour
// le bloc « lecture du territoire ».
function _comprendreLesChiffresRenduTexteLibre(txt) {
  return txt.replace(/\[brouillon[^\]]*\]/gi, '').split(/\n\s*\n/).map(function (p) {
    var t = _comprendreLesChiffresEchappe(p.trim().replace(/\n/g, ' '))
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return t ? '<p>' + t + '</p>' : '';
  }).join('');
}

// Enveloppe une SECTION entière (les trimestres précédents, le portrait,
// croiser, l'enquête BMO...) dans un rectangle dépliable : le titre de
// section devient le résumé cliquable, tout le contenu reste masqué tant
// qu'on n'a pas cliqué. Réduit l'impact visuel sans rien enlever ni
// réordonner (demande Denis 2026-09-06). Valable pour tous les niveaux de
// lecture (département / région / France).
function _comprendreLesChiffresRenduBlocRepliable(cle, titre, desc, corpsHTML, ouvert) {
  return '<details class="comprendre-les-chiffres-depli comprendre-les-chiffres-depli-section" data-bloc="' + cle + '"' +
    (ouvert ? ' open' : '') + '>' +
    '<summary><span class="comprendre-les-chiffres-depli-titre">' + _comprendreLesChiffresEchappe(titre) + '</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span>' +
    (desc ? '<span class="comprendre-les-chiffres-depli-desc">' + _comprendreLesChiffresEchappe(desc) + '</span>' : '') +
    '</summary>' +
    '<div class="comprendre-les-chiffres-depli-corps">' + corpsHTML + '</div></details>';
}

// ============================================================
// CONTENU : portrait annuel + comparaison européenne
// ============================================================

// Documents annuels (portrait-<annee>.md, ue-<annee>.md) : cache + état.
var _comprendreLesChiffresPortrait = null;
var _comprendreLesChiffresPortraitEtat = 'inactif';
var _comprendreLesChiffresUE = null;
var _comprendreLesChiffresUEEtat = 'inactif';

// TACHE (bloc "Les écarts à l'intérieur du département", 2026-09-12,
// maquette docs/MAQUETTE_ZONES_EMPLOI_2026-09-12.html validée par Denis) :
// contenu/zones-emploi.md, chargé une seule fois (comme le portrait), mais
// affiché dans la Vue d'ensemble elle-même (pas dans le dépliant "Portrait
// annuel") -- explicitement PAS un classement, une explication des écarts
// entre zones d'emploi d'un même département. Rempli fiche par fiche,
// seulement pour les départements ou une vraie recherche a ete faite --
// vide ailleurs, jamais devine.
var _comprendreLesChiffresZonesEmploi = null;
var _comprendreLesChiffresZonesEmploiEtat = 'inactif';

// TACHE (bloc "Les écarts entre départements de la région", 2026-09-12) :
// contenu/departements-region.md, meme principe et meme format que
// zones-emploi.md (reutilise le meme parseur), affiche au niveau région
// uniquement. Denis a choisi l'option "extrêmes + les 2 départements
// suivis" plutôt que les 12 départements en détail.
var _comprendreLesChiffresDepartementsRegion = null;
var _comprendreLesChiffresDepartementsRegionEtat = 'inactif';

// TACHE (bloc "Les écarts entre régions de France", 2026-09-12) : meme
// principe et meme format que departements-region.md, un niveau plus haut
// (regions-france.md, groupe unique "fr"), affiche au niveau France
// entiere uniquement. Meme option "extremes + le territoire suivi"
// (Pays de la Loire, Hauts-de-France, Nouvelle-Aquitaine).
var _comprendreLesChiffresRegionsFrance = null;
var _comprendreLesChiffresRegionsFranceEtat = 'inactif';

// TACHE (deserts medicaux, 2026-09-12) : registre generique des
// professions de sante suivies, meme parseur/rendu que les blocs ecarts
// existants, mais avec des extremes NATIONAUX (pas regionaux) - demande
// explicite de Denis : situer le departement/la region suivi(e) par
// rapport au departement/a la region le mieux et le moins bien loti de
// FRANCE (annuel, pas trimestriel). Une ligne ici = 2 fichiers de
// contenu (departement-dans-region, region-dans-France) ; ajouter une
// profession ne demande AUCUN nouveau code, juste les 2 fichiers et
// une ligne dans ce tableau - la duplication vue pour le premier metier
// (medecins generalistes) a ete factorisee avant d'ajouter le second.
var COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE = [
  {
    cle: 'medecins', titre: "L'accès aux médecins généralistes", icone: 'bi-heart-pulse',
    fichierDepReg: 'medecins-departements-region.md', fichierRegFr: 'medecins-regions-france.md',
    noteValeur: 'Densité de médecins généralistes, pour 100 000 habitants, année',
    introDepReg: "Le nombre de médecins généralistes pour 100 000 habitants varie fortement d'un " +
      "département à l'autre en France. Ce qui suit compare les deux départements de France les plus " +
      "extrêmes sur ce point, et resitue la Dordogne et la Haute-Vienne entre les deux - pas pour dire " +
      "lequel est « le mieux loti », mais pour comprendre ce qui explique les écarts.",
    introRegFr: "Le nombre de médecins généralistes pour 100 000 habitants varie fortement d'une région " +
      "à l'autre en France métropolitaine. Ce qui suit compare les deux régions les plus extrêmes sur ce " +
      "point, et resitue la Nouvelle-Aquitaine entre les deux - pas pour dire laquelle est « la mieux " +
      "lotie », mais pour comprendre ce qui explique les écarts."
  },
  {
    cle: 'specialistes', titre: "L'accès aux médecins spécialistes", icone: 'bi-hospital',
    fichierDepReg: 'specialistes-departements-region.md', fichierRegFr: 'specialistes-regions-france.md',
    noteValeur: 'Densité de médecins spécialistes, pour 100 000 habitants, année',
    introDepReg: "Le nombre de médecins spécialistes pour 100 000 habitants varie encore plus fortement " +
      "que celui des généralistes d'un département à l'autre en France. Ce qui suit compare les deux " +
      "départements de France les plus extrêmes sur ce point, et resitue la Dordogne et la Haute-Vienne " +
      "entre les deux - pas pour dire lequel est « le mieux loti », mais pour comprendre ce qui explique " +
      "les écarts.",
    introRegFr: "Le nombre de médecins spécialistes pour 100 000 habitants varie fortement d'une région à " +
      "l'autre en France métropolitaine. Ce qui suit compare les deux régions les plus extrêmes sur ce " +
      "point, et resitue la Nouvelle-Aquitaine entre les deux - pas pour dire laquelle est « la mieux " +
      "lotie », mais pour comprendre ce qui explique les écarts."
  },
  {
    cle: 'dentistes', titre: "L'accès aux chirurgiens-dentistes", icone: 'bi-clipboard2-pulse',
    fichierDepReg: 'dentistes-departements-region.md', fichierRegFr: 'dentistes-regions-france.md',
    noteValeur: 'Densité de chirurgiens-dentistes, pour 100 000 habitants, année',
    introDepReg: "Le nombre de chirurgiens-dentistes pour 100 000 habitants varie très fortement d'un " +
      "département à l'autre en France. Ce qui suit compare les deux départements de France les plus " +
      "extrêmes sur ce point, et resitue la Dordogne et la Haute-Vienne entre les deux - pas pour dire " +
      "lequel est « le mieux loti », mais pour comprendre ce qui explique les écarts.",
    introRegFr: "Le nombre de chirurgiens-dentistes pour 100 000 habitants varie fortement d'une région à " +
      "l'autre en France métropolitaine. Ce qui suit compare les deux régions les plus extrêmes sur ce " +
      "point, et resitue la Nouvelle-Aquitaine entre les deux - pas pour dire laquelle est « la mieux " +
      "lotie », mais pour comprendre ce qui explique les écarts."
  },
  {
    cle: 'pharmaciens', titre: 'L\'accès aux pharmaciens', icone: 'bi-capsule',
    fichierDepReg: 'pharmaciens-departements-region.md', fichierRegFr: 'pharmaciens-regions-france.md',
    noteValeur: 'Densité de pharmaciens, pour 100 000 habitants, année',
    introDepReg: "Le nombre de pharmaciens pour 100 000 habitants varie très fortement d'un département à " +
      "l'autre en France - et pas dans le même sens que les autres métiers de santé : ce sont souvent des " +
      "départements ruraux qui sont les mieux dotés. Ce qui suit compare les deux départements de France " +
      "les plus extrêmes sur ce point (la Haute-Vienne est elle-même l'un des deux), et resitue la " +
      "Dordogne entre les deux - pas pour dire lequel est « le mieux loti », mais pour comprendre ce qui " +
      "explique les écarts.",
    introRegFr: "Le nombre de pharmaciens pour 100 000 habitants varie aussi d'une région à l'autre en " +
      "France métropolitaine. Ce qui suit compare les deux régions les plus extrêmes sur ce point, et " +
      "resitue la Nouvelle-Aquitaine entre les deux - pas pour dire laquelle est « la mieux lotie », mais " +
      "pour comprendre ce qui explique les écarts."
  }
];
var _comprendreLesChiffresProfessionsSante = {};
function _comprendreLesChiffresEtatProfessionSante(cle) {
  if (!_comprendreLesChiffresProfessionsSante[cle]) {
    _comprendreLesChiffresProfessionsSante[cle] = {
      depReg: { data: null, etat: 'inactif' },
      regFr: { data: null, etat: 'inactif' }
    };
  }
  return _comprendreLesChiffresProfessionsSante[cle];
}

// Année candidate la plus récente (courant + 4 ans en arrière).
function _comprendreLesChiffresAnneesRecentes(n) {
  var out = [], a = new Date().getFullYear();
  for (var i = 0; i < n; i++) { out.push(a - i); }
  return out;
}

// Parseur générique d'un document annuel : { meta, sections: [{titre,
// slug, edito, intro:[...], lignes:[{texte, aVerifier, sourceNom,
// sourceUrl}]}] }. Format : « ## titre » + paragraphes d'intro + puces.
function _comprendreLesChiffresParserDocAnnuel(md) {
  var mFront = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!mFront) { return null; }
  var entete = mFront[1], corps = mFront[2] || '';
  var doc = { meta: {}, sections: [] };
  ['annee', 'publie_le', 'prochaine_maj', 'verifie_le'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { doc.meta[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });
  var sec = null;
  corps.split('\n').forEach(function (brute) {
    var ligne = brute.replace(/\s+$/, '');
    var mH2 = ligne.match(/^##\s+(.+)$/);
    if (mH2) {
      sec = { titre: mH2[1].trim(), slug: _comprendreLesChiffresNorm(mH2[1]), edito: false, intro: [], lignes: [], apres: [] };
      doc.sections.push(sec);
      return;
    }
    if (ligne.match(/^#\s+/)) { return; }
    if (!sec) { return; }
    if (/^\s*>\s*[ée]dito/i.test(ligne)) { sec.edito = true; return; }
    if (/^\s*>/.test(ligne)) { return; }
    var mPuce = ligne.match(/^[-*]\s+(.+)$/);
    if (mPuce) {
      var t = mPuce[1].trim();
      var l = { texte: t, aVerifier: /\[[^\]]*(?:à vérifier|a verifier|difficile à chiffrer)[^\]]*\]/i.test(t), sourceNom: '', sourceUrl: '' };
      var mSrc = t.match(/Source\s*:\s*([^[]+?)(?:\s*\(|$)/i);
      if (mSrc) {
        var src = mSrc[1].trim();
        var mUrl = src.match(/(https?:\/\/\S+)/);
        if (mUrl) { l.sourceUrl = mUrl[1].replace(/[.,;]+$/, ''); }
        l.sourceNom = src.replace(/\s*\|\s*https?:\/\/\S+.*/, '').replace(/\s*\|\s*$/, '').trim();
        l.texte = t.slice(0, mSrc.index).trim().replace(/\.\s*$/, '') + '.';
      }
      sec.lignes.push(l);
      return;
    }
    // Ligne de texte : avant la 1re puce = intro (paragraphes séparés par
    // une ligne vide) ; après = note de fin de section.
    var cible = sec.lignes.length ? sec.apres : sec.intro;
    if (!ligne.trim()) {
      if (cible.length && cible[cible.length - 1] !== '') { cible.push(''); }
      return;
    }
    if (cible.length && cible[cible.length - 1] !== '') {
      cible[cible.length - 1] += ' ' + ligne.trim();
    } else {
      cible.push(ligne.trim());
    }
  });
  return doc;
}

function _comprendreLesChiffresChargerDoc(type) {
  var etatActuel = type === 'ue' ? _comprendreLesChiffresUEEtat : _comprendreLesChiffresPortraitEtat;
  if (etatActuel === 'encours' || etatActuel === 'ok') { return; }
  var setEtat = function (v) {
    if (type === 'ue') { _comprendreLesChiffresUEEtat = v; } else { _comprendreLesChiffresPortraitEtat = v; }
  };
  setEtat('encours');
  var prefixe = type === 'ue' ? 'ue-' : 'portrait-';
  var annees = _comprendreLesChiffresAnneesRecentes(5);
  Promise.all(annees.map(function (a) {
    return fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + prefixe + a + '.md')
      .then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
  })).then(function (textes) {
    var doc = null;
    textes.forEach(function (t) { if (t && !doc) { doc = _comprendreLesChiffresParserDocAnnuel(t); } });
    if (!doc) { setEtat('vide'); }
    else { if (type === 'ue') { _comprendreLesChiffresUE = doc; } else { _comprendreLesChiffresPortrait = doc; } setEtat('ok'); }
    if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
  }).catch(function () { setEtat('erreur'); if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); } });
}

// TACHE (zones-emploi.md, 2026-09-12) : format dédié (pas le format
// "digest annuel" ci-dessus, pensé pour des bullets territoire par
// territoire -- ici chaque zone a un long texte libre, plus proche d'une
// mini-fiche). Frontmatter : periode, verifie_le, sources (liste "cle |
// titre | url | date"). Corps : "# <departement>" puis "## <zone>",
// chaque zone avec "valeur:", "sources:" (cles separees par virgule) puis
// un paragraphe de texte libre.
function _comprendreLesChiffresParserZonesEmploi(md) {
  var mFront = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!mFront) { return null; }
  var entete = mFront[1], corps = mFront[2] || '';
  var out = { periode: '', verifie_le: '', sources: {}, periodes: {}, parDep: {} };
  ['periode', 'verifie_le'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { out[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });
  (_comprendreLesChiffresExtraireListeSimple(entete, 'sources') || []).forEach(function (ligne) {
    var parts = ligne.split('|').map(function (p) { return p.trim(); });
    if (parts.length >= 3) { out.sources[parts[0]] = { titre: parts[1], url: parts[2] }; }
  });
  // Périodes des chiffres secondaires (consigne 145) : « clé du chiffre | 2023 » ; le libellé de la barre en tire son année.
  (_comprendreLesChiffresExtraireListeSimple(entete, 'periodes') || []).forEach(function (ligne) {
    var q = ligne.split('|').map(function (x) { return x.trim(); }), per = q.length === 2 ? _comprendreLesChiffresPeriodeLire(q[1]) : null;
    if (per) { out.periodes[q[0]] = per; }
  });

  var depCourant = null, zoneCourante = null;
  corps.split('\n').forEach(function (brute) {
    var ligne = brute.replace(/\s+$/, '');
    var mDep = ligne.match(/^#\s+(\S+)/);
    if (mDep) { depCourant = mDep[1].trim(); out.parDep[depCourant] = []; zoneCourante = null; return; }
    var mZone = ligne.match(/^##\s+(.+)$/);
    if (mZone && depCourant) {
      zoneCourante = { nom: mZone[1].trim(), valeur: '', sourcesCles: [], paragraphes: [] };
      out.parDep[depCourant].push(zoneCourante);
      return;
    }
    if (!zoneCourante) { return; }
    var mVal = ligne.match(/^valeur\s*:\s*(.+)$/i);
    if (mVal) { zoneCourante.valeur = mVal[1].trim(); return; }
    var mSrc = ligne.match(/^sources\s*:\s*(.+)$/i);
    if (mSrc) { zoneCourante.sourcesCles = mSrc[1].split(',').map(function (s) { return s.trim(); }).filter(Boolean); return; }
    // TACHE (retour Denis 2026-09-12 : "ne pas noyer les chiffres dans le
    // texte") : tout champ "cle_connue: valeur" (voir COMPRENDRE_LES_CHIFFRES_ZONES_STATS)
    // est une ligne chiffree a part, affichee en barre au-dessus du texte
    // libre -- jamais mentionnee une 2e fois en toutes lettres dans le
    // paragraphe qui suit (redondant, et c'est justement ce qui noyait
    // l'info avant cette correction).
    var mStat = ligne.match(/^([a-z0-9_]+)\s*:\s*(.+)$/i);
    if (mStat && COMPRENDRE_LES_CHIFFRES_ZONES_STATS_CLES.indexOf(mStat[1].toLowerCase()) > -1) {
      zoneCourante.stats = zoneCourante.stats || {};
      zoneCourante.stats[mStat[1].toLowerCase()] = mStat[2].trim();
      return;
    }
    if (!ligne.trim()) { return; }
    zoneCourante.paragraphes.push(ligne.trim());
  });
  return out;
}

// Liste fixe des chiffres secondaires reconnus par zone (au-dela du taux
// de chomage trimestriel principal, deja affiche par la barre du haut).
// "secteur_principal" est du texte libre (pas une barre) ; tous les autres
// sont numeriques, affiches en barre, mise a l'echelle par rapport au max
// des zones du MEME departement pour ce meme chiffre (comme la barre
// principale) -- jamais une echelle 0-100 fixe, qui ecraserait les ecarts.
var COMPRENDRE_LES_CHIFFRES_ZONES_STATS = [
  { cle: 'chomage_recensement', label: 'Chômage (recensement {fin})' },
  { cle: 'taux_pauvrete', label: 'Taux de pauvreté' },
  { cle: 'residences_secondaires', label: 'Résidences secondaires' },
  { cle: 'part_emploi_salarie', label: 'Emploi salarié' },
  { cle: 'gros_etablissements', label: 'Établissements de 10 salariés ou plus' },
  { cle: 'part_industrie', label: "Part de l'industrie" },
  { cle: 'niveau_vie_median', label: 'Niveau de vie médian' },
  { cle: 'population', label: 'Population' },
  { cle: 'part_65_et_plus', label: '65 ans et plus' },
  { cle: 'part_sans_diplome', label: 'Sans diplôme ou brevet seul' },
  { cle: 'part_diplome_superieur', label: 'Diplômés du supérieur (bac+2 ou plus)' },
  { cle: 'secteur_principal', label: 'Secteur qui domine', texte: true }
];
var COMPRENDRE_LES_CHIFFRES_ZONES_STATS_CLES = COMPRENDRE_LES_CHIFFRES_ZONES_STATS.map(function (s) { return s.cle; });

// Même principe que "sources:" de portrait-2026.md (liste "- ..." sous
// une clé de premier niveau), mais gardée simple et locale à ce fichier :
// pas de dépendance à _comprendreLesChiffresExtraireListeYaml (comprendre-le-cadre).
function _comprendreLesChiffresExtraireListeSimple(bloc, nom) {
  var lignes = bloc.split('\n'), dedans = false, out = [];
  for (var i = 0; i < lignes.length; i++) {
    if (new RegExp('^' + nom + '\\s*:').test(lignes[i])) { dedans = true; continue; }
    if (dedans) {
      if (/^[a-z_]+\s*:/.test(lignes[i]) && !/^\s*-/.test(lignes[i])) { break; }
      var it = lignes[i].replace(/^\s*-\s*/, '').replace(/^"|"$/g, '').trim();
      if (it) { out.push(it); }
    }
  }
  return out;
}

function _comprendreLesChiffresChargerZonesEmploi() {
  if (_comprendreLesChiffresZonesEmploiEtat === 'encours' || _comprendreLesChiffresZonesEmploiEtat === 'ok') { return; }
  _comprendreLesChiffresZonesEmploiEtat = 'encours';
  fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + 'zones-emploi.md')
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (t) {
      _comprendreLesChiffresZonesEmploi = t ? _comprendreLesChiffresParserZonesEmploi(t) : null;
      _comprendreLesChiffresZonesEmploiEtat = _comprendreLesChiffresZonesEmploi ? 'ok' : 'vide';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    })
    .catch(function () {
      _comprendreLesChiffresZonesEmploiEtat = 'erreur';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    });
}

// Meme principe que _comprendreLesChiffresChargerZonesEmploi() ci-dessus,
// pour contenu/departements-region.md (reutilise le meme parseur, deja
// generique -- "# na" au lieu de "# 24"/"# 87").
function _comprendreLesChiffresChargerDepartementsRegion() {
  if (_comprendreLesChiffresDepartementsRegionEtat === 'encours' || _comprendreLesChiffresDepartementsRegionEtat === 'ok') { return; }
  _comprendreLesChiffresDepartementsRegionEtat = 'encours';
  fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + 'departements-region.md')
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (t) {
      _comprendreLesChiffresDepartementsRegion = t ? _comprendreLesChiffresParserZonesEmploi(t) : null;
      _comprendreLesChiffresDepartementsRegionEtat = _comprendreLesChiffresDepartementsRegion ? 'ok' : 'vide';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    })
    .catch(function () {
      _comprendreLesChiffresDepartementsRegionEtat = 'erreur';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    });
}

// Meme principe que _comprendreLesChiffresChargerDepartementsRegion()
// ci-dessus, pour contenu/regions-france.md (meme parseur, "# fr" au lieu
// de "# na").
function _comprendreLesChiffresChargerRegionsFrance() {
  if (_comprendreLesChiffresRegionsFranceEtat === 'encours' || _comprendreLesChiffresRegionsFranceEtat === 'ok') { return; }
  _comprendreLesChiffresRegionsFranceEtat = 'encours';
  fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + 'regions-france.md')
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (t) {
      _comprendreLesChiffresRegionsFrance = t ? _comprendreLesChiffresParserZonesEmploi(t) : null;
      _comprendreLesChiffresRegionsFranceEtat = _comprendreLesChiffresRegionsFrance ? 'ok' : 'vide';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    })
    .catch(function () {
      _comprendreLesChiffresRegionsFranceEtat = 'erreur';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    });
}

// Chargeur generique, pour les 2 fichiers de CHAQUE profession de sante
// suivie (voir COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE). `champ` vaut
// 'depReg' ou 'regFr'.
function _comprendreLesChiffresChargerProfessionSante(prof, champ) {
  var st = _comprendreLesChiffresEtatProfessionSante(prof.cle);
  var slot = st[champ];
  if (slot.etat === 'encours' || slot.etat === 'ok') { return; }
  slot.etat = 'encours';
  var fichier = champ === 'depReg' ? prof.fichierDepReg : prof.fichierRegFr;
  fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + fichier)
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (t) {
      slot.data = t ? _comprendreLesChiffresParserZonesEmploi(t) : null;
      slot.etat = slot.data ? 'ok' : 'vide';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    })
    .catch(function () {
      slot.etat = 'erreur';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    });
}

// Une ligne "nom + barre + valeur", reutilisee pour le chomage principal
// et pour chaque chiffre secondaire (meme gabarit visuel, jamais 2 facons
// differentes de montrer une barre dans le meme bloc).
function _comprendreLesChiffresZoneBarre(nom, valeurTexte, pct) {
  return '<div class="comprendre-les-chiffres-zone-ligne">' +
    '<span class="comprendre-les-chiffres-zone-nom">' + _comprendreLesChiffresEchappe(nom) + '</span>' +
    '<span class="comprendre-les-chiffres-zone-piste"><span class="comprendre-les-chiffres-zone-remplissage" style="width:' + pct + '%"></span></span>' +
    '<span class="comprendre-les-chiffres-zone-valeur">' + _comprendreLesChiffresEchappe(valeurTexte) + '</span>' +
    '</div>';
}

// TACHE (generalise le 2026-09-12 pour le bloc departement/region, meme
// forme que zones-emploi -- "une seule source de verite", jamais 2 facons
// de construire un bloc "ecarts" dans ce module) : coeur de rendu partage,
// independant du niveau (zone d'emploi dans un departement, departement
// dans une region, demain region dans la France...). Prend directement la
// liste d'items deja resolue (chacun {nom, valeur, stats, sourcesCles,
// paragraphes}) et la map de sources, ne connait rien de la notion de
// "departement" ou "region" -- c'est l'appelant qui gate et qui choisit
// le contenu.
function _comprendreLesChiffresRenduEcartsGenerique(items, sourcesMap, opts) {
  if (!items || !items.length) { return ''; }

  var maxVal = 0;
  items.forEach(function (z) {
    var n = parseFloat((z.valeur || '').replace(',', '.'));
    if (!isNaN(n) && n > maxVal) { maxVal = n; }
  });
  var barres = items.map(function (z) {
    var n = parseFloat((z.valeur || '').replace(',', '.'));
    var pct = maxVal > 0 && !isNaN(n) ? Math.max(8, Math.round((n / maxVal) * 100)) : 0;
    return _comprendreLesChiffresZoneBarre(z.nom, z.valeur, pct);
  }).join('');
  // Lecture au choix (consigne 122) : les barres d'origine restent la lecture qui s'ouvre, « Chiffres » les met en lignes,
  // et sur cinq territoires ou plus la personne choisit l'ordre. Un seul territoire : la barre d'origine, telle quelle.
  var lignesEcarts = [];
  items.forEach(function (z) {
    var n = _comprendreLesChiffresNombre(z.valeur);
    if (n != null) { lignesEcarts.push({ nom: z.nom, texte: z.valeur, n: n }); }
  });
  if (lignesEcarts.length >= 2) {
    barres = _comprendreLesChiffresVuesAssembler('ecarts-' + _comprendreLesChiffresNorm(opts.titre || '').replace(/[^a-z0-9]+/g, '-'), '',
      [{ lignes: lignesEcarts }], null, { defaut: 'barres' });
  }

  // Chiffres secondaires (chomage recensement, pauvrete, residences
  // secondaires...) : chacun une ligne chiffree a part avec sa propre
  // barre, jamais noyes dans le texte (retour Denis 2026-09-12). Mise a
  // l'echelle par chiffre (pas par item) : le max du MEME chiffre parmi
  // les items affiches ici.
  var maxParStat = {};
  items.forEach(function (z) {
    Object.keys(z.stats || {}).forEach(function (cle) {
      if (cle === 'secteur_principal') { return; }
      var n = parseFloat((z.stats[cle] || '').replace(/\s/g, '').replace(',', '.'));
      if (!isNaN(n) && (!maxParStat[cle] || n > maxParStat[cle])) { maxParStat[cle] = n; }
    });
  });

  var sourcesUtilisees = {};
  var explications = items.map(function (z) {
    (z.sourcesCles || []).forEach(function (cle) { sourcesUtilisees[cle] = true; });
    var lignesStats = COMPRENDRE_LES_CHIFFRES_ZONES_STATS.map(function (def) {
      var val = (z.stats || {})[def.cle];
      if (!val) { return ''; }
      if (def.texte) {
        return '<p class="comprendre-les-chiffres-zone-stat-texte"><b>' + _comprendreLesChiffresEchappe(def.label) +
          '</b> : ' + _comprendreLesChiffresEchappe(val) + '</p>';
      }
      // Le libellé dit l'année lue dans le fichier (consigne 145) ; sans période, la ligne n'est pas affichée.
      var libelle = _comprendreLesChiffresPeriodeSubstituer(def.label, { periodes: opts.periodes || {} }, def.cle);
      if (libelle === null) { return ''; }
      var n = parseFloat(val.replace(/\s/g, '').replace(',', '.'));
      var max = maxParStat[def.cle] || 0;
      var pct = max > 0 && !isNaN(n) ? Math.max(8, Math.round((n / max) * 100)) : 0;
      return _comprendreLesChiffresZoneBarre(libelle, val, pct);
    }).join('');
    return '<div class="comprendre-les-chiffres-zone-explication">' +
      '<p class="comprendre-les-chiffres-zone-explication-titre">' + _comprendreLesChiffresEchappe(z.nom) + '</p>' +
      (lignesStats ? '<div class="comprendre-les-chiffres-zone-stats">' + lignesStats + '</div>' : '') +
      z.paragraphes.map(function (p) { return '<p>' + _comprendreLesChiffresEchappe(p) + '</p>'; }).join('') +
      '</div>';
  }).join('');

  var pastilles = Object.keys(sourcesUtilisees).map(function (cle) {
    var s = sourcesMap[cle];
    if (!s) { return ''; }
    return '<a class="comprendre-les-chiffres-pastille" href="' + _comprendreLesChiffresEchappe(s.url) +
      '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> ' + _comprendreLesChiffresEchappe(s.titre) + '</a>';
  }).join('');

  return '<div class="comprendre-les-chiffres-zones">' +
    '<h3><i class="bi ' + opts.icone + '"></i> ' + _comprendreLesChiffresEchappe(opts.titre) + '</h3>' +
    '<p class="comprendre-les-chiffres-zones-intro">' + opts.intro + '</p>' +
    '<div class="comprendre-les-chiffres-zones-barres">' + barres + '</div>' +
    '<p class="comprendre-les-chiffres-note">' + _comprendreLesChiffresEchappe(opts.noteValeur || 'Taux de chômage localisé, moyenne du') + ' ' +
    _comprendreLesChiffresEchappe(opts.periode || '') + '.</p>' +
    '<div class="comprendre-les-chiffres-zones-explications">' + explications + '</div>' +
    (pastilles ? '<p class="comprendre-les-chiffres-source">Sources :</p><div class="comprendre-les-chiffres-source">' + pastilles + '</div>' : '') +
    '</div>';
}

// Rendu du bloc "Les écarts à l'intérieur du département" -- seulement
// quand le niveau de lecture est le département (le concept de zone
// d'emploi n'a pas de sens en région/France/UE) ET qu'on a du contenu
// pour CE département précis (vide ailleurs : jamais un bloc à moitié
// rempli ou générique).
function _comprendreLesChiffresRenduZonesEmploi() {
  if (_comprendreLesChiffresNiveauCourant() !== 'dep') { return ''; }
  var dep = _comprendreLesChiffresDepartementCourant();
  if (!dep || !_comprendreLesChiffresZonesEmploi) { return ''; }
  var zones = _comprendreLesChiffresZonesEmploi.parDep[dep];
  if (!zones || !zones.length) { return ''; }
  return _comprendreLesChiffresRenduEcartsGenerique(zones, _comprendreLesChiffresZonesEmploi.sources, {
    titre: "Les écarts à l'intérieur du département",
    icone: 'bi-signpost-split',
    periode: _comprendreLesChiffresZonesEmploi.periode,
    periodes: _comprendreLesChiffresZonesEmploi.periodes,
    intro: "Ce territoire n'est pas uniforme : il se découpe en plusieurs zones d'emploi (voir « Zone " +
      "d'emploi ou bassin d'emploi » dans les fiches méthode), chacune avec ses propres chiffres. Ce qui " +
      "suit compare ces zones entre elles - pas pour dire laquelle est « la meilleure », mais pour " +
      "comprendre ce qui explique les écarts."
  });
}

// Rendu du bloc "Les écarts entre départements de la région" -- seulement
// au niveau région (Nouvelle-Aquitaine), même principe que le bloc
// département/zones d'emploi ci-dessus, même contenu (dossier
// departements-region.md, groupe unique "na" -- pas de decoupage par
// region puisqu'il n'y en a qu'une aujourd'hui).
function _comprendreLesChiffresRenduDepartementsRegion() {
  if (_comprendreLesChiffresNiveauCourant() !== 'na') { return ''; }
  if (!_comprendreLesChiffresDepartementsRegion) { return ''; }
  var deps = _comprendreLesChiffresDepartementsRegion.parDep.na;
  if (!deps || !deps.length) { return ''; }
  return _comprendreLesChiffresRenduEcartsGenerique(deps, _comprendreLesChiffresDepartementsRegion.sources, {
    titre: 'Les écarts entre départements de la région',
    icone: 'bi-map',
    periode: _comprendreLesChiffresDepartementsRegion.periode,
    intro: "La Nouvelle-Aquitaine n'est pas uniforme : elle compte 12 départements aux chiffres très " +
      "différents. Ce qui suit compare les deux départements aux taux les plus extrêmes de la région, et " +
      "resitue la Dordogne et la Haute-Vienne entre les deux - pas pour dire lequel est « le meilleur », " +
      "mais pour comprendre ce qui explique les écarts."
  });
}

// Rendu du bloc "Les écarts entre régions de France" -- seulement au
// niveau France entière, même principe que le bloc région/départements
// ci-dessus, un niveau plus haut (dossier regions-france.md, groupe
// unique "fr").
function _comprendreLesChiffresRenduRegionsFrance() {
  if (_comprendreLesChiffresNiveauCourant() !== 'fr') { return ''; }
  if (!_comprendreLesChiffresRegionsFrance) { return ''; }
  var regs = _comprendreLesChiffresRegionsFrance.parDep.fr;
  if (!regs || !regs.length) { return ''; }
  return _comprendreLesChiffresRenduEcartsGenerique(regs, _comprendreLesChiffresRegionsFrance.sources, {
    titre: 'Les écarts entre régions de France',
    icone: 'bi-compass',
    periode: _comprendreLesChiffresRegionsFrance.periode,
    intro: "La France métropolitaine n'est pas uniforme : elle compte 13 régions aux chiffres très " +
      "différents. Ce qui suit compare les deux régions aux taux les plus extrêmes, et resitue la " +
      "Nouvelle-Aquitaine entre les deux - pas pour dire laquelle est « la meilleure », mais pour " +
      "comprendre ce qui explique les écarts."
  });
}

// Rendu de TOUTES les professions de sante suivies (voir
// COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE) pour le niveau courant --
// région (departement-dans-region) ou France (region-dans-France), avec
// des EXTREMES NATIONAUX (pas regionaux, a la difference des blocs
// chomage ci-dessus) : Denis veut situer le departement/la region suivi
// par rapport au departement/a la region le mieux et le moins bien loti
// de FRANCE. Rien a ecrire pour ajouter une profession : juste une ligne
// dans le tableau + ses 2 fichiers de contenu.
function _comprendreLesChiffresRenduProfessionsSante() {
  var niveau = _comprendreLesChiffresNiveauCourant();
  if (niveau !== 'na' && niveau !== 'fr') { return ''; }
  var champ = niveau === 'na' ? 'depReg' : 'regFr';
  var groupe = niveau === 'na' ? 'na' : 'fr';
  var html = '';
  COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE.forEach(function (prof) {
    var st = _comprendreLesChiffresEtatProfessionSante(prof.cle);
    if (st[champ].etat === 'inactif') { _comprendreLesChiffresChargerProfessionSante(prof, champ); }
    var data = st[champ].data;
    if (!data) { return; }
    var items = data.parDep[groupe];
    if (!items || !items.length) { return; }
    html += _comprendreLesChiffresRenduEcartsGenerique(items, data.sources, {
      titre: prof.titre,
      icone: prof.icone,
      periode: data.periode,
      noteValeur: prof.noteValeur,
      intro: niveau === 'na' ? prof.introDepReg : prof.introRegFr
    });
  });
  return html;
}

// ============================================================
// BLOC « Les entreprises ici : ce qui se vend, ce qui ferme »
// (chantier docs/CHANTIER_REPERES_ENTREPRISES_TERRITOIRE_2026-10-18.md,
// maquette docs/MAQUETTE_REPERES_ENTREPRISES_2026-10-18.html, décisions de
// Denis 2026-10-18 et 2026-10-19). Fichier contenu/entreprises-departements.md,
// format « fiche de territoire » modifiable champ par champ par l'outil de
// veille. Niveau « mon département » seulement. RIEN ne s'affiche tant que
// l'en-tête n'a pas une vraie date « verifie_le » (valeur « a-valider » :
// chiffres relevés mais pas encore vérifiés à la source par Denis).
// Ce que le BODACC compte : des ANNONCES, jamais des entreprises. Seules les
// OUVERTURES de liquidation ou de redressement sont comptées (pas les clôtures,
// états des créances, plans...), voir le constat A du cahier. Aucun chiffre de
// créations ni de radiations par département (non comparables, constats B et C).
// ============================================================
var COMPRENDRE_LES_CHIFFRES_ENTREPRISES_BLOC = {
  t: 'Les entreprises ici : ce qui se vend, ce qui ferme',
  d: 'Ouvertures de procédures collectives (liquidation, redressement, sauvegarde), achats de fonds de commerce, annonces légales du département sur douze mois.'
};
var COMPRENDRE_LES_CHIFFRES_ENTREPRISES_FICHES = [
  { id: 'creations-entreprises-micro-entrepreneurs', libelle: 'Créations et micro-entrepreneurs' },
  { id: 'radiation-d-office-entreprise', libelle: 'Radiation d’office' },
  { id: 'defaillance-entreprise', libelle: 'Défaillance d’entreprise' },
  { id: 'vente-fonds-de-commerce', libelle: 'Vente d’un fonds de commerce' }
];
var _comprendreLesChiffresEntreprises = null;
var _comprendreLesChiffresEntreprisesEtat = 'inactif';

function _comprendreLesChiffresEntier(s) {
  var t = String(s == null ? '' : s).replace(/[\s  ]/g, '');
  return /^\d+$/.test(t) ? parseInt(t, 10) : null;
}

// Lit contenu/entreprises-departements.md. Rend null si le texte n'a pas d'en-tête.
function _comprendreLesChiffresParserEntreprises(md) {
  var mFront = String(md || '').replace(/\r\n/g, '\n').match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!mFront) { return null; }
  var entete = mFront[1], corps = mFront[2] || '';
  var out = { periode: '', verifie_le: '', sources: {}, parDep: {} };
  ['periode', 'verifie_le'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { out[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });
  (_comprendreLesChiffresExtraireListeSimple(entete, 'sources') || []).forEach(function (ligne) {
    var parts = ligne.split('|').map(function (p) { return p.trim(); });
    if (parts.length >= 3) { out.sources[parts[0]] = { titre: parts[1], url: parts[2] }; }
  });
  var courant = null;
  corps.split('\n').forEach(function (brute) {
    var ligne = brute.replace(/\s+$/, '');
    var mBloc = ligne.match(/^##\s+(.+)$/);
    if (mBloc) {
      var nom = mBloc[1].trim(), cle = _comprendreLesChiffresNorm(nom);
      var code = cle === 'dordogne' ? '24' : (cle.replace(/[-\s]+/g, ' ') === 'haute vienne' ? '87' : '');
      courant = code ? { nom: nom, ouvertures: null, ouverturesPrec: null, ventes: null, ventesPrec: null, periodeDu: '', periodeAu: '', sourcesCles: [] } : null;
      if (courant) { out.parDep[code] = courant; }
      return;
    }
    if (!courant) { return; }
    var m = ligne.match(/^([a-z_0-9]+)\s*:\s*(.*)$/);
    if (!m) { return; }
    if (m[1] === 'ouvertures') { courant.ouvertures = _comprendreLesChiffresEntier(m[2]); }
    else if (m[1] === 'ouvertures_an_precedent') { courant.ouverturesPrec = _comprendreLesChiffresEntier(m[2]); }
    else if (m[1] === 'ventes') { courant.ventes = _comprendreLesChiffresEntier(m[2]); }
    else if (m[1] === 'ventes_an_precedent') { courant.ventesPrec = _comprendreLesChiffresEntier(m[2]); }
    else if (m[1] === 'periode_du') { courant.periodeDu = m[2].trim(); }
    else if (m[1] === 'periode_au') { courant.periodeAu = m[2].trim(); }
    else if (m[1] === 'sources') { courant.sourcesCles = m[2].split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
  });
  return out;
}

// Phrase d'évolution entre deux nombres. Sous 3 % d'écart : « à peu près stable ».
function _comprendreLesChiffresEvolutionEntiers(actuel, precedent) {
  if (actuel == null || precedent == null || precedent <= 0) { return ''; }
  var pct = (actuel - precedent) / precedent * 100;
  if (Math.abs(pct) < 3) { return 'à peu près stable'; }
  return (pct > 0 ? 'en hausse d’environ ' : 'en baisse d’environ ') + Math.round(Math.abs(pct)) + ' %';
}

// « 2026-10-18 » ou « 18/10/2026 » -> « 18 octobre 2026 » (le 1er du mois : « 1er octobre 2026 ») ; « 2026-10 » -> « octobre 2026 » ; autre chose : null.
function _comprendreLesChiffresDateEnClair(texte) {
  var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var t = String(texte || '').trim(), annee, mo, jour = '';
  var fr = t.match(/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/);
  var iso = t.match(/^(\d{4})-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/);
  if (fr) { jour = fr[1]; mo = fr[2]; annee = fr[3]; }
  else if (iso) { annee = iso[1]; mo = iso[2]; jour = iso[3] || ''; }
  else { return null; }
  if (jour) {
    var d = new Date(Date.UTC(parseInt(annee, 10), parseInt(mo, 10) - 1, parseInt(jour, 10)));
    if (d.getUTCMonth() !== parseInt(mo, 10) - 1) { return null; }   // 31/02 : une date qui n'existe pas
    jour = parseInt(jour, 10) === 1 ? '1er ' : String(parseInt(jour, 10)) + ' ';
  }
  return jour + mois[parseInt(mo, 10) - 1] + ' ' + annee;
}
// « du 1er novembre 2025 au 18 octobre 2026 », ou '' si l'une des deux dates manque ou n'existe pas.
function _comprendreLesChiffresPeriodeEnClair(du, au) {
  var a = _comprendreLesChiffresDateEnClair(du), b = _comprendreLesChiffresDateEnClair(au);
  return (a && b) ? 'du ' + a + ' au ' + b : '';
}

function _comprendreLesChiffresChargerEntreprises() {
  if (_comprendreLesChiffresEntreprisesEtat === 'encours' || _comprendreLesChiffresEntreprisesEtat === 'ok') { return; }
  _comprendreLesChiffresEntreprisesEtat = 'encours';
  fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + 'entreprises-departements.md')
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (t) {
      _comprendreLesChiffresEntreprises = t ? _comprendreLesChiffresParserEntreprises(t) : null;
      _comprendreLesChiffresEntreprisesEtat = _comprendreLesChiffresEntreprises ? 'ok' : 'vide';
      if (_comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
    })
    .catch(function () {
      _comprendreLesChiffresEntreprisesEtat = 'erreur';
    });
}

// Deux lectures, comme les autres blocs : « Chiffres » (le grand nombre et sa phrase) et « Barres » (la période relevée face à la même période un an plus tôt).
// Il s'agit toujours du MÊME département à deux moments : jamais un autre département, et pas de camembert (ce ne sont pas les parts d'un tout).
function _comprendreLesChiffresRenduCarteEntreprises(id, question, valeur, precedent, phraseDebut, phraseFin, periode, source) {
  var evo = _comprendreLesChiffresEvolutionEntiers(valeur, precedent);
  var lien = source && source.url
    ? '<a class="comprendre-les-chiffres-pastille" href="' + _comprendreLesChiffresEchappe(source.url) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> Source : ' + _comprendreLesChiffresEchappe(source.titre) + '</a>'
    : '';
  var chiffres = '<div class="comprendre-les-chiffres-indic-valeur">' + _comprendreLesChiffresFormatNombre(valeur) + '</div>' +
    '<p class="comprendre-les-chiffres-indic-phrase">' + phraseDebut +
      (precedent != null ? ' La même période un an plus tôt : <strong>' + _comprendreLesChiffresFormatNombre(precedent) + '</strong>' + (evo ? ' (' + evo + ')' : '') + '.' : '') +
      (phraseFin ? ' ' + phraseFin : '') + '</p>';
  var groupes = precedent != null ? [{ titre: 'Nombre d’annonces', lignes: [
    { nom: 'Période relevée', texte: _comprendreLesChiffresFormatNombre(valeur), n: valeur, fort: true, source: source ? source.titre : '' },
    { nom: 'Même période un an plus tôt', texte: _comprendreLesChiffresFormatNombre(precedent), n: precedent, fort: false, source: source ? source.titre : '' }
  ] }] : [];
  return '<div class="comprendre-les-chiffres-indic" id="comprendre-les-chiffres-carte-' + id + '">' +
    '<p class="comprendre-les-chiffres-indic-q">' + _comprendreLesChiffresEchappe(question) + '</p>' +
    _comprendreLesChiffresVuesAssembler(id, chiffres, groupes, null, { sansLignes: true }) +
    '<p class="comprendre-les-chiffres-note">' + lien + (periode ? ' <span>Période : ' + _comprendreLesChiffresEchappe(periode) + '.</span>' : '') + '</p>' +
    '</div>';
}

// Rend le dépliant, ou '' quand il ne doit pas s'afficher (autre niveau que « mon département »,
// fichier absent, chiffres pas encore vérifiés, département absent du fichier).
function _comprendreLesChiffresRenduEntreprises() {
  if (_comprendreLesChiffresNiveauCourant() !== 'dep') { return ''; }
  var doc = _comprendreLesChiffresEntreprises;
  if (_comprendreLesChiffresEntreprisesEtat !== 'ok' || !doc) { return ''; }
  var verifieLe = _comprendreLesChiffresDateEnClair(doc.verifie_le);
  if (!verifieLe) { return ''; }
  var dep = _comprendreLesChiffresTerritoireDuNiveau();
  var d = doc.parDep[dep];
  if (!d || d.ouvertures == null || d.ouverturesPrec == null) { return ''; }
  var lieu = _comprendreLesChiffresLibelleNiveau();
  var source = doc.sources[d.sourcesCles[0]] || null;
  var periode = _comprendreLesChiffresPeriodeEnClair(d.periodeDu, d.periodeAu);
  var corps = '<p class="comprendre-les-chiffres-section-intro">Ces chiffres décrivent des <b>annonces publiées au registre du commerce</b>, jamais une entreprise en particulier. Ils servent à situer le territoire, pas à décider d’aller ou non vers un employeur.</p>' +
    _comprendreLesChiffresRenduCarteEntreprises('entreprises-ouvertures', 'Combien de procédures collectives (liquidation, redressement, sauvegarde) ont été ouvertes ?', d.ouvertures, d.ouverturesPrec,
      'C’est le nombre d’annonces de jugement d’ouverture publiées par les tribunaux, extensions à une autre entreprise comprises, dans ' + _comprendreLesChiffresEchappe(lieu) + '.', '', periode, source);
  if (d.ventes != null && d.ventesPrec != null) {
    corps += _comprendreLesChiffresRenduCarteEntreprises('entreprises-ventes', 'Combien d’annonces d’achat ou de cession d’un fonds de commerce ?', d.ventes, d.ventesPrec,
      'Annonces d’achat, d’apport ou d’attribution d’un fonds de commerce, dans ' + _comprendreLesChiffresEchappe(lieu) + '.',
      'Une annonce ne dit pas pourquoi le propriétaire vend, ni ce que deviennent les salariés. Une même vente peut être annoncée plus d’une fois.', periode, source);
  }
  corps += '<div class="comprendre-les-chiffres-encart small comprendre-les-chiffres-encart-attention"><i class="bi bi-exclamation-triangle"></i> ' +
    'Ce sont des <b>annonces</b>, pas des entreprises : une même procédure en produit plusieurs (ouverture, liste des créances, clôture). Seules les annonces de <b>jugement d’ouverture</b> sont comptées ici. ' +
    'Les créations d’entreprises (qui comptent les micro-entrepreneurs) et les radiations ne sont pas comparées d’un département à l’autre : elles ne sont pas publiées de la même façon partout.</div>' +
    '<p class="comprendre-les-chiffres-note"><span class="comprendre-les-chiffres-fraicheur">&#128197; Vérifié le ' + _comprendreLesChiffresEchappe(verifieLe) + '. Mise à jour tous les trimestres.</span></p>';
  var boutons = COMPRENDRE_LES_CHIFFRES_ENTREPRISES_FICHES.map(function (f) {
    return '<button type="button" class="btn btn-outline-secondary btn-sm" data-comprendre-les-chiffres-fiche-lexique="' + _comprendreLesChiffresEchappe(f.id) + '"><i class="bi bi-book"></i> ' + _comprendreLesChiffresEchappe(f.libelle) + '</button>';
  }).join('');
  corps += '<details class="comprendre-les-chiffres-depli"><summary><span class="comprendre-les-chiffres-depli-titre">Comment lire ces chiffres</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span></summary>' +
    '<div class="comprendre-les-chiffres-depli-corps"><p>Quatre fiches du Lexique expliquent les mots qui reviennent dans ces chiffres :</p><div class="d-flex flex-wrap gap-2">' + boutons + '</div></div></details>';
  return '<details class="comprendre-les-chiffres-depli" data-bloc="entreprises"' + (_comprendreLesChiffresEstVueEnsemble() ? ' open' : '') + '>' +
    '<summary><span class="comprendre-les-chiffres-depli-titre">' + _comprendreLesChiffresEchappe(COMPRENDRE_LES_CHIFFRES_ENTREPRISES_BLOC.t) + '</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span>' +
    '<span class="comprendre-les-chiffres-depli-desc">' + _comprendreLesChiffresEchappe(COMPRENDRE_LES_CHIFFRES_ENTREPRISES_BLOC.d) + '</span></summary>' +
    '<div class="comprendre-les-chiffres-depli-corps">' + corps + '</div></details>';
}

// Ouvre une fiche du Lexique depuis le bloc ; « Retour » ramène ici.
function _comprendreLesChiffresBrancherEntreprises() {
  document.querySelectorAll('[data-comprendre-les-chiffres-fiche-lexique]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = this.getAttribute('data-comprendre-les-chiffres-fiche-lexique');
      if (typeof lexiqueOuvrirFiche !== 'function') { return; }
      // Le retour ramène à la même place de la page, pas en haut (consigne 146).
      var revenirALaPlace = typeof memoriserPositionPourRetour === 'function' ? memoriserPositionPourRetour() : null;
      lexiqueOuvrirFiche(id, null, 'Comprendre les chiffres', 'comprendre-les-chiffres', function () {
        _comprendreLesChiffresEtat.ecran = 'accueil';
        naviguerVers('comprendre-les-chiffres');
        if (revenirALaPlace) { revenirALaPlace(); }
      });
    });
  });
}

// Retrouve une section d'un document annuel par titre (comparaison
// normalisée tolérante).
function _comprendreLesChiffresSection(doc, titre) {
  if (!doc) { return null; }
  var n = _comprendreLesChiffresNorm(titre);
  var exact = null, partiel = null;
  doc.sections.forEach(function (s) {
    if (s.slug === n) { exact = s; }
    else if (!partiel && (s.slug.indexOf(n) > -1 || n.indexOf(s.slug) > -1)) { partiel = s; }
  });
  return exact || partiel;
}

// Rendu d'une ligne de portrait : gras conservé, « [à vérifier ...] » en
// gris discret, pastille de source cliquable si URL.
function _comprendreLesChiffresRenduLignePortrait(l) {
  var t = _comprendreLesChiffresEchappe(l.texte)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]/g, '<span class="comprendre-les-chiffres-a-verifier">$1</span>');
  var src = '';
  if (l.sourceUrl) {
    src = ' <a class="comprendre-les-chiffres-pastille" href="' + _comprendreLesChiffresEchappe(l.sourceUrl) +
      '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> Source</a>';
  } else if (l.sourceNom) {
    src = ' <span class="comprendre-les-chiffres-note">(' + _comprendreLesChiffresEchappe(l.sourceNom) + ')</span>';
  }
  return '<li>' + t + src + '</li>';
}

function _comprendreLesChiffresRenduParas(lignes) {
  return (lignes || []).filter(function (p) { return p !== ''; }).map(function (p) {
    return '<p>' + _comprendreLesChiffresEchappe(p)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]/g, '<span class="comprendre-les-chiffres-a-verifier">$1</span>') + '</p>';
  }).join('');
}
function _comprendreLesChiffresRenduSectionPortrait(sec) {
  var corps = _comprendreLesChiffresRenduParas(sec.intro);
  if (sec.lignes.length) {
    corps += '<ul class="comprendre-les-chiffres-liste">' + sec.lignes.map(_comprendreLesChiffresRenduLignePortrait).join('') + '</ul>';
  }
  corps += _comprendreLesChiffresRenduParas(sec.apres);
  return corps;
}

// Config FIXE des blocs du portrait (ordre + description = maquette).
var COMPRENDRE_LES_CHIFFRES_PORTRAIT_BLOCS = [
  { t: "Les freins à l'emploi sur le territoire", d: "Les difficultés concrètes qui reviennent le plus souvent, avec un ordre de grandeur." },
  { t: 'Population et densité', d: "Combien d'habitants, et à quel point le territoire est peuplé." },
  { t: 'De quoi vit le territoire', d: 'Taille des entreprises, secteurs qui emploient le plus.' },
  { t: 'Comment on est embauché ici', d: 'CDI, CDD, contrats courts, intérim, temps partiel.' },
  { t: "Le marché n'est pas le même pour tout le monde", d: 'Répartition femmes / hommes par secteur, écart de salaire.' },
  { t: 'Salaires par secteur', d: 'Salaire net médian par grand secteur (ordre de grandeur).' },
  { t: 'Qui cherche un emploi ici', d: "Répartition par âge, part des bénéficiaires du RSA." },
  { t: 'Le territoire bouge-t-il', d: "Créations et défaillances d'entreprises par secteur, poids de l'emploi lié au tourisme." }
];
// Dépliants « méthode » placés juste après la couche 1 (maquette).
var COMPRENDRE_LES_CHIFFRES_METHODE_BLOCS = [
  { t: "L'âge de la population", d: 'La structure par âge aide à comprendre le reste (emploi, secteurs).' },
  { t: 'Le niveau de formation', d: "Le niveau d'études du département." },
  { t: "Zone d'emploi ou bassin d'emploi", d: "Comment l'INSEE découpe le territoire, et pourquoi ça compte." }
];
var COMPRENDRE_LES_CHIFFRES_EDITO_BLOCS = [
  'Calendrier de saisonnalité'
];
// Encarts « gros employeurs » : un par département, repliés, celui du
// département choisi affiché en premier. Corrige le bug signalé le
// 2026-09-10 (la version unique montrait la Dordogne même quand on avait
// choisi la Haute-Vienne).
var COMPRENDRE_LES_CHIFFRES_EMPLOYEURS_BLOCS = [
  { t: 'Les gros employeurs en Dordogne (24)', terr: '24' },
  { t: 'Les gros employeurs en Haute-Vienne (87)', terr: '87' }
];

function _comprendreLesChiffresRenduDepliPortrait(cfg, ouvert) {
  var sec = _comprendreLesChiffresSection(_comprendreLesChiffresPortrait, cfg.t);
  if (!sec) { return ''; }
  return '<details class="comprendre-les-chiffres-depli"' + (ouvert ? ' open' : '') + '>' +
    '<summary><span class="comprendre-les-chiffres-depli-titre">' + _comprendreLesChiffresEchappe(cfg.t) + '</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span>' +
    '<span class="comprendre-les-chiffres-depli-desc">' + _comprendreLesChiffresEchappe(cfg.d) + '</span></summary>' +
    '<div class="comprendre-les-chiffres-depli-corps">' + _comprendreLesChiffresRenduSectionPortrait(sec) + '</div></details>';
}

function _comprendreLesChiffresRenduEdito(titre) {
  var sec = _comprendreLesChiffresSection(_comprendreLesChiffresPortrait, titre);
  if (!sec) { return ''; }
  return '<div class="comprendre-les-chiffres-edito">' +
    '<span class="comprendre-les-chiffres-edito-marque">À savoir</span>' +
    '<h4>' + _comprendreLesChiffresEchappe(sec.titre) + '</h4>' +
    _comprendreLesChiffresRenduSectionPortrait(sec) + '</div>';
}

// Les encarts « gros employeurs », un par département, repliés. Le
// département choisi apparaît en premier ; l'autre reste consultable en
// dessous. Même comportement pour les deux (demande Denis 2026-09-10).
function _comprendreLesChiffresRenduEmployeurs() {
  var dep = _comprendreLesChiffresDepartementCourant();
  var blocs = COMPRENDRE_LES_CHIFFRES_EMPLOYEURS_BLOCS.slice().sort(function (a, b) {
    return (a.terr === dep ? 0 : 1) - (b.terr === dep ? 0 : 1);
  });
  return blocs.map(function (b) {
    var sec = _comprendreLesChiffresSection(_comprendreLesChiffresPortrait, b.t);
    if (!sec) { return ''; }
    return '<details class="comprendre-les-chiffres-depli comprendre-les-chiffres-edito-depli">' +
      '<summary><span class="comprendre-les-chiffres-edito-marque">À savoir</span>' +
      '<span class="comprendre-les-chiffres-depli-titre">' + _comprendreLesChiffresEchappe(sec.titre) + '</span>' +
      '<span class="comprendre-les-chiffres-depli-clic">Déplier pour en savoir plus sur le département</span></summary>' +
      '<div class="comprendre-les-chiffres-depli-corps">' + _comprendreLesChiffresRenduSectionPortrait(sec) + '</div></details>';
  }).join('');
}

// Les 3 dépliants « méthode » (âge, formation, zone d'emploi).
function _comprendreLesChiffresRenduMethode() {
  if (_comprendreLesChiffresPortraitEtat !== 'ok') { return ''; }
  var ouvert = _comprendreLesChiffresEstVueEnsemble();
  return COMPRENDRE_LES_CHIFFRES_METHODE_BLOCS.map(function (c) {
    return _comprendreLesChiffresRenduDepliPortrait(c, ouvert);
  }).join('');
}

// ---------- le portrait en chiffres : le département choisi seulement (A5) ----------
// Tout vient de portrait-chiffres.md (fiches par département) ; la prose du portrait reste en dessous.
// Un chiffre absent, ou un fichier sans vraie date, et la ligne (puis la carte) n'est pas affichée.
function _comprendreLesChiffresPortraitPourcent(n) { return String(n).replace('.', ',') + ' %'; }
function _comprendreLesChiffresPortraitNombre(n) { return String(n).replace('.', ',') + ' pour 100 000 habitants'; }
var COMPRENDRE_LES_CHIFFRES_PORTRAIT_CHIFFRES_CARTES = [
  { id: 'portrait-age', q: 'Quel âge ont les habitants ?',
    note: 'Population au 1er janvier {fin}. Le département choisi est situé face aux départements où la part est la plus haute et la plus basse, en Nouvelle-Aquitaine et en France métropolitaine.',
    groupes: [{ titre: 'Part des 65 ans et plus', champ: 'part_65_plus', comparer: 'ageInsee' }, { titre: 'Part des moins de 25 ans', champ: 'part_moins_25', comparer: 'ageInsee' }] },
  { id: 'portrait-formation', q: 'Quel est le niveau de formation des habitants ?', note: 'Personnes de 16 ans et plus qui ont terminé leurs études, recensement {fin}. Le département choisi est situé face aux départements où la part est la plus haute et la plus basse, en Nouvelle-Aquitaine et en France métropolitaine. Un repère pour adapter l’accompagnement, jamais un jugement sur une personne.',
    groupes: [{ titre: 'Sans diplôme ou brevet seul', champ: 'sans_diplome', comparer: 'formationInsee' }, { titre: 'Diplômés du supérieur', champ: 'diplomes_superieur', comparer: 'formationInsee' }] },
  { id: 'portrait-secteurs', q: 'Dans quels secteurs sont les établissements ?', note: 'Part des établissements, au 31 décembre {fin}. Le département choisi est situé face aux départements où la part est la plus haute et la plus basse, en Nouvelle-Aquitaine et en France métropolitaine.',
    groupes: [{ titre: 'Commerce, transports et services divers', champ: 'etab_commerce_services', comparer: 'secteursInsee' }, { titre: 'Administration, enseignement, santé et action sociale', champ: 'etab_administration_sante', comparer: 'secteursInsee' },
      { titre: 'Construction', champ: 'etab_construction', comparer: 'secteursInsee' }, { titre: 'Agriculture', champ: 'etab_agriculture', comparer: 'secteursInsee' }, { titre: 'Industrie', champ: 'etab_industrie', comparer: 'secteursInsee' }] },
  { id: 'portrait-temps-partiel', q: 'Combien de personnes travaillent à temps partiel ?', note: 'Part des personnes en emploi qui travaillent à temps partiel, recensement {fin} (mesure du recensement : un peu plus basse que celle de l’enquête Emploi). Le département choisi est situé face aux départements où la part est la plus haute et la plus basse, en Nouvelle-Aquitaine et en France métropolitaine.',
    groupes: [{ titre: 'Temps partiel', champ: 'temps_partiel', comparer: 'tempsPartielInsee' }] },
  { id: 'portrait-medecins', q: 'Combien y a-t-il de médecins généralistes ?', note: 'Nombre de médecins généralistes pour 100 000 habitants, en {fin}. Le département choisi est situé face aux départements où ce nombre est le plus haut et le plus bas, en Nouvelle-Aquitaine et en France métropolitaine.',
    groupes: [{ titre: 'Médecins généralistes', champ: 'densite_medecins', comparer: 'medecinsInsee', fmt: function (n) { return String(n); } }] },
  { id: 'portrait-demandeurs', q: 'Qui cherche un emploi ici ?', note: 'Part des demandeurs d’emploi inscrits à France Travail (catégories A, B et C), {fin}, effectifs arrondis. Le département choisi est situé face aux départements où la part est la plus haute et la plus basse, en Nouvelle-Aquitaine et en France métropolitaine.',
    groupes: [{ titre: 'Moins de 25 ans', champ: 'part_moins_25', comparer: 'demandeursDares' }, { titre: '50 ans et plus', champ: 'part_50_plus', comparer: 'demandeursDares' }, { titre: 'Femmes', champ: 'part_femmes', comparer: 'demandeursDares' },
      { titre: 'Bénéficiaires du RSA (France Travail, {fin})', champ: 'demandeurs_rsa' }, { titre: 'Travailleurs handicapés reconnus (France Travail, {fin})', champ: 'demandeurs_rqth' }] }
];
// La source propre au champ parmi celles de la fiche du département.
function _comprendreLesChiffresPortraitSource(doc, f, champ) {
  var debut = champ.indexOf('demandeurs_') === 0 ? 'dataemploi' : (champ === 'densite_medecins' ? 'insee-medecins' : 'insee-comparateur');
  var cle = (f.sourcesCles.filter(function (k) { return k.indexOf(debut) === 0; })[0]) || null;
  var s = cle && doc.sources[cle];
  return s ? { titre: s.titre, url: s.url, date: s.date, cle: cle } : null;
}
// Le département choisi face aux départements où la part est la plus haute et la plus basse, dans la Nouvelle-Aquitaine puis en France métropolitaine (jamais l'autre département de l'application).
// Retourne { lignes: [ligne...], sources: [src] } ou null (fichier absent, département inconnu : rien n'est montré).
function _comprendreLesChiffresPortraitComparer(cle, champ, nom, fmt) {
  var doc = _comprendreLesChiffresFicheDoc(cle);
  if (!doc) { return null; }
  var lu = _comprendreLesChiffresFicheValeur(doc, 'departements', nom, champ);
  var cl = _comprendreLesChiffresFicheClassement(doc, 'departements', champ), fr = _comprendreLesChiffresFicheFrance(doc, champ);
  if (!lu || cl.length < 20 || !fr) { return null; }
  var dansNA = cl.filter(function (v) { return COMPRENDRE_LES_CHIFFRES_DEP_NA.indexOf(v.nom) >= 0; });
  if (dansNA.length < 5) { return null; }
  var etiquettes = {};
  var noter = function (v, sens, zone) { var e = (etiquettes[v.nom] = etiquettes[v.nom] || { v: v, t: {} }); (e.t[sens] = e.t[sens] || []).push(zone); };
  noter(dansNA[0], 'haut', 'la Nouvelle-Aquitaine'); noter(cl[0], 'haut', 'la France métropolitaine');
  noter(dansNA[dansNA.length - 1], 'bas', 'la Nouvelle-Aquitaine'); noter(cl[cl.length - 1], 'bas', 'la France métropolitaine');
  var libelle = function (t) {
    return ['haut', 'bas'].filter(function (k) { return t[k]; }).map(function (k) { return 'le plus ' + (k === 'haut' ? 'haut' : 'bas') + ' de ' + t[k].join(' et de '); }).join(', ');
  };
  var lignes = [];
  Object.keys(etiquettes).forEach(function (k) {
    var e = etiquettes[k];
    if (k === lu.nom) { return; }
    lignes.push(_comprendreLesChiffresFicheLigne(k + ' (' + libelle(e.t) + ')', e.v, fmt));
  });
  var tag = etiquettes[lu.nom] ? ' (' + libelle(etiquettes[lu.nom].t) + ')' : '';
  lignes.push(_comprendreLesChiffresFicheLigne(lu.nom + tag, lu, fmt, true));
  lignes.push(_comprendreLesChiffresFicheLigne(fr.nom, fr, fmt));
  lignes.sort(function (a, b) { return b.n - a.n; });
  return { lignes: lignes, sources: [lu.src] };
}
function _comprendreLesChiffresPortraitChiffresCartes() {
  var doc = _comprendreLesChiffresFicheDoc('portraitChiffres');
  var nom = COMPRENDRE_LES_CHIFFRES_DEP_NOMS[_comprendreLesChiffresDepartementCourant()];
  // Jamais un autre département que celui choisi (consigne de Denis, 06/11/2026).
  if (!doc || !doc.groupes.departements || !nom) { return ''; }
  var fiche = doc.groupes.departements[_comprendreLesChiffresNorm(nom)];
  var fr = doc.groupes.france && doc.ordre.france && doc.ordre.france.length ? doc.groupes.france[doc.ordre.france[0]] : null;
  var ligneHtml = function (lib, texte, fort, source) {
    return '<div class="comprendre-les-chiffres-ligne' + (fort ? ' fort' : '') + '"><span class="comprendre-les-chiffres-ligne-lib">' + _comprendreLesChiffresEchappe(lib) + '</span>' +
      '<span class="comprendre-les-chiffres-ligne-val"><span class="chiffre" data-source="' + _comprendreLesChiffresEchappe(source) + '">' + _comprendreLesChiffresEchappe(texte) + '</span></span></div>';
  };
  var html = '';
  COMPRENDRE_LES_CHIFFRES_PORTRAIT_CHIFFRES_CARTES.forEach(function (c) {
    var sources = [], corps = '';
    // La note dit la période du fichier de comparaison de la carte (consigne 145) : une période absente, et la carte n'est pas affichée.
    var docCmp = _comprendreLesChiffresFicheDoc((c.groupes.filter(function (g) { return g.comparer; })[0] || {}).comparer);
    var noteCarte = docCmp ? _comprendreLesChiffresPeriodeSubstituer(c.note, docCmp, _comprendreLesChiffresPeriodeUnique(docCmp)) : null;
    if (noteCarte === null) { return; }
    c.groupes.forEach(function (g) {
      var fmt = g.fmt || (g.comparer ? function (n) { return _comprendreLesChiffresFormatPourcent(n, 1); } : _comprendreLesChiffresPortraitPourcent);
      var lu = function (f) {
        var v = f && _comprendreLesChiffresFicheValeurDe(doc, f, g.champ);
        if (v) { v.src = _comprendreLesChiffresPortraitSource(doc, f, g.champ); }
        return v;
      };
      if (g.comparer) {
        var cmp = _comprendreLesChiffresPortraitComparer(g.comparer, g.champ, nom, fmt);
        if (!cmp) { return; }
        corps += _comprendreLesChiffresVuesAssembler(c.id + '-' + g.champ, '<div class="comprendre-les-chiffres-vues-groupe"><p class="comprendre-les-chiffres-vues-titre">' + _comprendreLesChiffresEchappe(g.titre) +
          '</p><div class="comprendre-les-chiffres-lignes">' + cmp.lignes.map(function (l) { return ligneHtml(l.nom, l.texte, l.fort, l.source); }).join('') + '</div></div>', [{ titre: g.titre, lignes: cmp.lignes }], null, { sansLignes: true });
        sources = sources.concat(cmp.sources);
        return;
      }
      var v = lu(fiche), vf = g.france ? lu(fr) : null;
      if (!v) { return; }
      var titreGroupe = _comprendreLesChiffresPeriodeSubstituer(g.titre, doc, v.src && v.src.cle);
      if (titreGroupe === null) { return; }
      var lignes = ligneHtml(nom, fmt(v.n), true, v.src ? v.src.titre : '');
      if (v.src) { sources.push(v.src); }
      if (vf) { lignes += ligneHtml('France', fmt(vf.n), false, vf.src ? vf.src.titre : ''); if (vf.src) { sources.push(vf.src); } }
      corps += '<div class="comprendre-les-chiffres-vues-groupe"><p class="comprendre-les-chiffres-vues-titre">' + _comprendreLesChiffresEchappe(titreGroupe) +
        '</p><div class="comprendre-les-chiffres-lignes">' + lignes + '</div></div>';
    });
    if (!corps) { return; }
    html += '<div class="comprendre-les-chiffres-indic" id="comprendre-les-chiffres-carte-' + c.id + '"><p class="comprendre-les-chiffres-indic-q">' + _comprendreLesChiffresEchappe(c.q) + '</p>' + corps +
      _comprendreLesChiffresFicheEncart(noteCarte + ' Valeurs arrondies : ce sont des repères.') + _comprendreLesChiffresFicheSourcesHTML(sources) + '</div>';
  });
  if (!html) { return ''; }
  return '<p class="comprendre-les-chiffres-section-intro"><b>Les repères de ' + _comprendreLesChiffresEchappe(nom) + '</b> : les chiffres les plus utiles du portrait. Le détail rédigé est dans les rubriques en dessous.</p>' + html;
}

// Couche 2 : le portrait du territoire (tout est dans un rectangle
// dépliable, contenu et ordre inchangés - demande Denis 2026-09-06).
function _comprendreLesChiffresRenduCouche2() {
  var etat = _comprendreLesChiffresPortraitEtat;
  var desc = 'Des repères de fond sur l’économie locale, mis à jour une fois par an. Plutôt pour un professionnel de l’insertion.';
  if (etat === 'encours' || etat === 'inactif') {
    return _comprendreLesChiffresRenduBlocRepliable('portrait', 'Le portrait du territoire', desc,
      '<p class="comprendre-les-chiffres-note"><i class="bi bi-hourglass-split"></i> Chargement du portrait...</p>', false);
  }
  if (etat !== 'ok' || !_comprendreLesChiffresPortrait) {
    return _comprendreLesChiffresRenduBlocRepliable('portrait', 'Le portrait du territoire', desc,
      '<div class="comprendre-les-chiffres-encart"><i class="bi bi-info-circle"></i> Le portrait annuel du territoire n’est pas encore publié. Il sera préparé avec l’outil de veille, une fois par an.</div>', false);
  }
  var p = _comprendreLesChiffresPortrait;
  var intro = 'Des repères de fond sur l’économie locale, mis à jour <b>une fois par an</b>. Chaque rubrique est fermée : ouvrez celles qui vous intéressent, une par une. Plutôt pour un professionnel de l’insertion, mais accessible à tous.';
  if (p.meta.annee) {
    intro += '<br><span class="comprendre-les-chiffres-fraicheur">&#128197; Portrait arrêté en ' + _comprendreLesChiffresEchappe(p.meta.annee) +
      (p.meta.prochaine_maj ? '. Prochaine mise à jour prévue : ' + _comprendreLesChiffresEchappe(p.meta.prochaine_maj) : '') + '.</span>';
  }
  var ouvert = _comprendreLesChiffresEstVueEnsemble();
  var corps = '<p class="comprendre-les-chiffres-section-intro">' + intro + '</p>' +
    _comprendreLesChiffresPortraitChiffresCartes() +
    COMPRENDRE_LES_CHIFFRES_PORTRAIT_BLOCS.map(function (c) {
      return _comprendreLesChiffresRenduDepliPortrait(c, ouvert);
    }).join('') +
    _comprendreLesChiffresRenduEntreprises() +
    COMPRENDRE_LES_CHIFFRES_EDITO_BLOCS.map(_comprendreLesChiffresRenduEdito).join('') +
    _comprendreLesChiffresRenduEmployeurs();
  return _comprendreLesChiffresRenduBlocRepliable('portrait', 'Le portrait du territoire', desc, corps, ouvert);
}

// Couche 3 : l'enquête Besoins en Main d'Œuvre (rectangle dépliable).
function _comprendreLesChiffresRenduCouche3() {
  var titre = 'Ce que les employeurs prévoient d’embaucher cette année';
  var desc = 'Une enquête annuelle auprès des employeurs. Des intentions, pas des embauches garanties.';
  // Une fois un département choisi dans la carte, le bloc reste ouvert après le rafraîchissement.
  var ouvert = _comprendreLesChiffresEstVueEnsemble() || !!_comprendreLesChiffresBmoDep;
  var sec = _comprendreLesChiffresSection(_comprendreLesChiffresPortrait, 'Métiers en tension');
  var carteBmo = _comprendreLesChiffresRenduBlocBmo();
  if (_comprendreLesChiffresPortraitEtat !== 'ok' || !sec) {
    return _comprendreLesChiffresRenduBlocRepliable('bmo', titre, desc,
      (carteBmo || '<div class="comprendre-les-chiffres-encart"><i class="bi bi-info-circle"></i> Les résultats de l’enquête pour le territoire seront ajoutés avec le portrait annuel.</div>'), ouvert);
  }
  var corps = '<div class="comprendre-les-chiffres-indic">' + _comprendreLesChiffresRenduSectionPortrait(sec) +
    '<div class="comprendre-les-chiffres-encart small comprendre-les-chiffres-encart-attention">' +
    '<i class="bi bi-exclamation-triangle"></i> « Métier en tension » ne veut pas dire « facile d’y entrer ». La difficulté peut venir des horaires, de la pénibilité, de la mobilité ou de conditions précises, pas seulement d’un manque de candidats.</div>' +
    '</div>';
  return _comprendreLesChiffresRenduBlocRepliable('bmo', titre, desc, corps + carteBmo, ouvert);
}

// Encart de prudence, sous la couche 3 (maquette).
function _comprendreLesChiffresRenduEncartPrudence() {
  return '<div class="comprendre-les-chiffres-encart small comprendre-les-chiffres-encart-attention">' +
    '<i class="bi bi-exclamation-triangle"></i> Les <b>chiffres clés</b> sont une <b>photo trimestrielle</b>, datée et sourcée, pas un tableau de bord en temps réel. Simplifier une statistique peut la déformer : on écrit toujours « d’après [source], en [date] », jamais une vérité. Un chiffre décrit un territoire, jamais une personne.</div>';
}

// ---- Vue « Union européenne » ----

// Extrait « <libellé> : **valeur** » d'une ligne (France / UE-27).
function _comprendreLesChiffresExtraireValeurUE(sec, motsClefs) {
  var trouve = '';
  sec.lignes.forEach(function (l) {
    var n = _comprendreLesChiffresNorm(l.texte);
    var okMot = motsClefs.some(function (m) { return n.indexOf(m) === 0 || n.indexOf(' ' + m) > -1 || n.indexOf(m) > -1; });
    if (!okMot || trouve) { return; }
    var m = l.texte.match(/\*\*(.+?)\*\*/);
    if (m) { trouve = m[1].trim(); }
    else if (/\[[^\]]*(?:à vérifier|a verifier)/i.test(l.texte)) { trouve = 'à vérifier'; }
  });
  return trouve;
}

// Un indicateur européen en deux barres : la France et la moyenne de l'Union (UE-27). Rien si l'un des deux
// chiffres manque ou reste « à vérifier » : jamais une barre inventée.
function _comprendreLesChiffresUEGroupe(titre, fr, ue) {
  var a = _comprendreLesChiffresNombre(fr), c = _comprendreLesChiffresNombre(ue);
  if (a == null || c == null || /v[eé]rifier/i.test(String(fr) + String(ue))) { return null; }
  var src = 'Eurostat : ' + titre;
  return { titre: titre, lignes: [{ nom: 'France', texte: fr, n: a, fort: true, source: src }, { nom: 'Moyenne UE-27', texte: ue, n: c, source: src }] };
}
// Les repères de la section « Freins comparés » : une puce « motif : **x %** en France, **y %** dans l'Union ».
function _comprendreLesChiffresUEGroupesFreins(sec) {
  var out = [];
  ((sec && sec.lignes) || []).forEach(function (l) {
    var m = l.texte.match(/^(.+?)\s*:\s*(.*)$/);
    if (!m) { return; }
    var gras = [], re = /\*\*(.+?)\*\*/g, x;
    while ((x = re.exec(m[2]))) { gras.push(x[1].trim()); }
    var iFr = m[2].search(/France/i), iUe = m[2].search(/Union|UE/);
    if (gras.length !== 2 || iFr < 0 || iUe < 0 || iFr > iUe) { return; }
    var g = _comprendreLesChiffresUEGroupe(m[1].trim(), gras[0], gras[1]);
    if (g) { out.push(g); }
  });
  return out;
}

function _comprendreLesChiffresRenduVueUE() {
  var etat = _comprendreLesChiffresUEEtat;
  if (etat === 'encours' || etat === 'inactif') {
    return '<p class="comprendre-les-chiffres-note"><i class="bi bi-hourglass-split"></i> Chargement de la comparaison européenne...</p>';
  }
  if (etat !== 'ok' || !_comprendreLesChiffresUE) {
    return '<div class="comprendre-les-chiffres-carte-teinte"><h3 class="mt-0">La France dans l’Union européenne</h3>' +
      '<p class="comprendre-les-chiffres-note mb-0">Cette comparaison n’est pas encore publiée. Elle sera préparée avec l’outil de veille, une fois par an.</p></div>';
  }
  var doc = _comprendreLesChiffresUE;
  var lecture = _comprendreLesChiffresSection(doc, 'Lecture');
  var html0 = '';
  if (lecture && lecture.intro.length) {
    html0 = '<div class="comprendre-les-chiffres-carte-teinte">' +
      '<h3 class="mt-0">La lecture de cette comparaison</h3>' +
      '<p class="comprendre-les-chiffres-note">Texte de contexte, mis à jour une fois par an. Il explique ' +
      'comment lire l’écart avec la moyenne européenne, il ne juge ni la France ni une situation ' +
      'personnelle.</p>' +
      _comprendreLesChiffresRenduTexteLibre(lecture.intro.join('\n\n')) +
      '</div>';
  }
  var rows = '', groupesUE = [];
  doc.sections.forEach(function (sec) {
    if (/frein/i.test(sec.slug) || /lecture/i.test(sec.slug)) { return; }
    var fr = _comprendreLesChiffresExtraireValeurUE(sec, ['france']);
    var ue = _comprendreLesChiffresExtraireValeurUE(sec, ['moyenne ue', 'ue-27', 'ue 27', 'union']);
    var cell = function (v) {
      if (!v) { return '<span class="comprendre-les-chiffres-a-verifier">non trouvé</span>'; }
      if (/v[eé]rifier/i.test(v)) { return '<span class="comprendre-les-chiffres-a-verifier">à vérifier</span>'; }
      return '<span class="chiffre">' + _comprendreLesChiffresEchappe(v) + '</span>';
    };
    rows += '<tr><td>' + _comprendreLesChiffresEchappe(sec.titre) + '</td>' +
      '<td>' + cell(fr) + '</td><td>' + cell(ue) + '</td></tr>';
    var g = _comprendreLesChiffresUEGroupe(sec.titre, fr, ue);
    if (g) { groupesUE.push(g); }
  });
  var premiereSection = doc.sections.filter(function (s) { return s.lignes.length; })[0];
  var srcUE = (premiereSection && premiereSection.lignes[0] && premiereSection.lignes[0].sourceUrl) || 'https://ec.europa.eu/eurostat';
  var html = html0 + '<div class="comprendre-les-chiffres-carte-teinte">' +
    '<h3 class="mt-0">La France dans l’Union européenne</h3>' +
    '<p class="comprendre-les-chiffres-note">Une mise en perspective, pas un jugement. Données harmonisées par Eurostat (même définition pour les 27 pays).</p>' +
    _comprendreLesChiffresVuesAssembler('ue-synthese', '<div class="comprendre-les-chiffres-tab-scroll"><table class="comprendre-les-chiffres-synthese">' +
      '<tr><th>Indicateur</th><th>France</th><th>Moyenne UE-27</th></tr>' + rows + '</table></div>', groupesUE, null, { sansLignes: true }) +
    '<p class="comprendre-les-chiffres-note">Plus tard, on pourra choisir un pays précis pour le comparer à la France. Pour l’instant, on reste au niveau de l’ensemble de l’Union.</p>' +
    '<p class="comprendre-les-chiffres-source">D’après Eurostat.' +
    ' <a class="comprendre-les-chiffres-pastille" href="' + _comprendreLesChiffresEchappe(srcUE) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> Ouvrir Eurostat</a></p>' +
    '</div>';

  var freins = _comprendreLesChiffresSection(doc, 'Freins comparés');
  if (freins) {
    html += '<details class="comprendre-les-chiffres-depli">' +
      '<summary><span class="comprendre-les-chiffres-depli-titre">Les freins à l’emploi : France et Union européenne</span>' +
      '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span>' +
      '<span class="comprendre-les-chiffres-depli-desc">Les quelques freins qu’Eurostat mesure de la même façon dans les 27 pays.</span></summary>' +
      '<div class="comprendre-les-chiffres-depli-corps">' + _comprendreLesChiffresVuesAssembler('ue-freins', _comprendreLesChiffresRenduSectionPortrait(freins), _comprendreLesChiffresUEGroupesFreins(freins), null, { sansLignes: true }) + '</div></details>';
  }
  return html;
}

// ============================================================
// ÉCRAN D'ACCUEIL
// ============================================================

function _comprendreLesChiffresRenduBandeauDepartement() {
  return '' +
    '<div class="comprendre-les-chiffres-territoire d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">' +
      '<span class="fs-6"><i class="bi bi-geo-alt"></i> Votre département : <strong>' + _comprendreLesChiffresLibelleDepartement() + '</strong></span>' +
      '<button type="button" class="btn btn-outline-secondary" data-comprendre-les-chiffres-changer-departement>' +
        '<i class="bi bi-arrow-repeat"></i> Changer de département</button>' +
    '</div>';
}

function _comprendreLesChiffresRenduBasculeVue() {
  var v = _comprendreLesChiffresEtat.vue;
  return '<div class="comprendre-les-chiffres-bascule-vue" role="group" aria-label="Niveau de détail">' +
    '<button type="button" class="' + (v === 'simple' ? 'actif' : '') + '" data-comprendre-les-chiffres-vue="simple">Vue simple</button>' +
    '<button type="button" class="' + (v === 'ensemble' ? 'actif' : '') + '" data-comprendre-les-chiffres-vue="ensemble">Vue d’ensemble</button>' +
    '</div>';
}

function _comprendreLesChiffresRenduNiveaux() {
  var actif = _comprendreLesChiffresNiveauCourant();
  var boutons = COMPRENDRE_LES_CHIFFRES_NIVEAUX.map(function (n) {
    return '<button type="button" class="' + (n.cle === actif ? 'actif' : '') + '" data-comprendre-les-chiffres-niveau="' + n.cle + '">' + n.libelle + '</button>';
  }).join('');
  return '' +
    '<p class="comprendre-les-chiffres-section-intro mb-1">À quel niveau voulez-vous lire les chiffres ?</p>' +
    '<div class="comprendre-les-chiffres-niveaux">' + boutons + '</div>' +
    '<p class="comprendre-les-chiffres-section-intro">Vous lisez les chiffres pour : <strong>' + _comprendreLesChiffresLibelleNiveau() + '</strong>. Tout ce qui suit s’adapte à ce choix.</p>';
}

function _comprendreLesChiffresRenduAVenir(quoi) {
  return '<div class="comprendre-les-chiffres-encart small mb-4">' +
    '<i class="bi bi-hammer"></i> ' + quoi + ' : cette partie du module se branche dans un prochain temps du chantier.' +
    '</div>';
}

// ============================================================
// BLOC 5 : croiser plusieurs chiffres
// ============================================================

// Séries que l'on peut mettre sur le même graphique. `unite` : '%' ou
// 'nb' - on n'autorise jamais de mélanger les deux (deux échelles font
// croire à un lien qui n'existe pas). `terr` : code fixe, ou 'auto' pour
// le département courant.
var COMPRENDRE_LES_CHIFFRES_CROISABLES = [
  { cle: 'cho24', label: 'Taux de chômage, par trimestre : Dordogne', unite: '%', periode: 'trimestre', slug: 'chomage', terr: '24' },
  { cle: 'cho87', label: 'Taux de chômage, par trimestre : Haute-Vienne', unite: '%', periode: 'trimestre', slug: 'chomage', terr: '87' },
  { cle: 'chona', label: 'Taux de chômage, par trimestre : Nouvelle-Aquitaine', unite: '%', periode: 'trimestre', slug: 'chomage', terr: 'na' },
  { cle: 'chofr', label: 'Taux de chômage, par trimestre : France', unite: '%', periode: 'trimestre', slug: 'chomage', terr: 'fr' },
  { cle: 'emp24', label: 'Emploi salarié, variation par trimestre : Dordogne', unite: '%', periode: 'trimestre', slug: 'emploi-salarie', terr: '24' },
  { cle: 'emp87', label: 'Emploi salarié, variation par trimestre : Haute-Vienne', unite: '%', periode: 'trimestre', slug: 'emploi-salarie', terr: '87' },
  { cle: 'empna', label: 'Emploi salarié, variation par trimestre : Nouvelle-Aquitaine', unite: '%', periode: 'trimestre', slug: 'emploi-salarie', terr: 'na' },
  { cle: 'empfr', label: 'Emploi salarié, variation par trimestre : France', unite: '%', periode: 'trimestre', slug: 'emploi-salarie', terr: 'fr' },
  { cle: 'ld24', label: 'Part des inscrits depuis plus d’un an, par trimestre : Dordogne', unite: '%', periode: 'trimestre', slug: 'longue-duree', terr: '24', raisonVide: 'a-recuperer' },
  { cle: 'ld87', label: 'Part des inscrits depuis plus d’un an, par trimestre : Haute-Vienne', unite: '%', periode: 'trimestre', slug: 'longue-duree', terr: '87', raisonVide: 'a-recuperer' },
  { cle: 'ldna', label: 'Part des inscrits depuis plus d’un an, par trimestre : Nouvelle-Aquitaine', unite: '%', periode: 'trimestre', slug: 'longue-duree', terr: 'na', raisonVide: 'a-recuperer' },
  { cle: 'ldfr', label: 'Part des inscrits depuis plus d’un an, par trimestre : France', unite: '%', periode: 'trimestre', slug: 'longue-duree', terr: 'fr' },
  { cle: 'demA24', label: 'Demandeurs d’emploi catégorie A, par trimestre : Dordogne', unite: 'nb', periode: 'trimestre', slug: 'demandeurs', terr: '24', raisonVide: 'a-recuperer' },
  { cle: 'demA87', label: 'Demandeurs d’emploi catégorie A, par trimestre : Haute-Vienne', unite: 'nb', periode: 'trimestre', slug: 'demandeurs', terr: '87', raisonVide: 'a-recuperer' },
  { cle: 'demAna', label: 'Demandeurs d’emploi catégorie A, par trimestre : Nouvelle-Aquitaine', unite: 'nb', periode: 'trimestre', slug: 'demandeurs', terr: 'na' },
  { cle: 'demAfr', label: 'Demandeurs d’emploi catégorie A, par trimestre : France', unite: 'nb', periode: 'trimestre', slug: 'demandeurs', terr: 'fr' },
  { cle: 'choAn24', label: 'Taux de chômage, par année ({plage}) : Dordogne', unite: '%', periode: 'annee', slug: 'chomage', terr: '24' },
  { cle: 'choAnNa', label: 'Taux de chômage, par année ({plage}) : Nouvelle-Aquitaine', unite: '%', periode: 'annee', slug: 'chomage', terr: 'na' },
  { cle: 'choAnFr', label: 'Taux de chômage, par année ({plage}) : France', unite: '%', periode: 'annee', slug: 'chomage', terr: 'fr' },
  { cle: 'choAnUe', label: 'Taux de chômage, par année ({plage}) : Union européenne', unite: '%', periode: 'annee', slug: 'chomage', terr: 'ue' }
];
var COMPRENDRE_LES_CHIFFRES_COULEURS_SERIES = ['var(--accent)', 'var(--warning)', 'var(--success)', 'var(--text-muted)'];

// TACHE (retour Denis 2026-09-12) : "pas encore de série" ne disait pas
// POURQUOI - trois raisons bien différentes derrière une case grisée,
// jamais le même message générique. `raisonVide` sur chaque case
// COMPRENDRE_LES_CHIFFRES_CROISABLES ci-dessus dit laquelle ; par défaut
// (case censée avoir une série complète mais qui ne l'a pas encore),
// on suppose que le chantier qui la produirait reste à faire.
var COMPRENDRE_LES_CHIFFRES_RAISONS_VIDE = {
  'inexistante': 'cette série n’existe nulle part : aucune source connue ne publie l’historique de ce chiffre',
  'a-recuperer': 'cette série existe très probablement quelque part, mais n’a pas encore été récupérée',
  'chantier': 'ce chiffre n’est pas encore suivi par l’application, personne ne l’a encore construit'
};

function _comprendreLesChiffresSerieCroisable(c) {
  var d = _comprendreLesChiffresDigest;
  if (!d || !d.sections[c.slug]) { return []; }
  var terr = c.terr === 'auto' ? _comprendreLesChiffresTerritoireDuNiveau() : c.terr;
  var e = null;
  d.sections[c.slug].forEach(function (x) {
    if (x.terr === terr && !e) {
      if (terr === 'fr' && !/m[eé]tropolitaine/i.test(x.labelBrut)) { return; }
      e = x;
    }
  });
  if (!e) { d.sections[c.slug].forEach(function (x) { if (x.terr === terr && !e) { e = x; } }); }
  if (!e) { return []; }
  var champ = c.periode === 'annee' ? 'serieAnnuelle' : 'serie';
  return e[champ] || [];
}

// La plage d'années des séries annuelles (« 2019-2025 »), lue dans le digest chargé (consigne 145) : jamais écrite à la main. Vide si le digest n'a pas de série annuelle.
// Où se situe le chiffre du moment dans la fourchette connue depuis le début de la série (consigne 145) : la phrase est CALCULÉE
// avec les trois nombres du fichier, jamais écrite d'avance (un chiffre qui monte ne doit plus s'entendre « dans le bas »).
function _comprendreLesChiffresPositionFourchette(valeur, bas, haut) {
  var v = _comprendreLesChiffresNombre(valeur), b = _comprendreLesChiffresNombre(bas), h = _comprendreLesChiffresNombre(haut);
  if (v === null || b === null || h === null || !(h > b)) { return ''; }
  if (v > h) { return 'plus haut que le sommet de cette fourchette'; }
  if (v < b) { return 'plus bas que le creux de cette fourchette'; }
  var part = (v - b) / (h - b);
  if (part < 1 / 3) { return 'plutôt dans le bas de cette fourchette'; }
  if (part > 2 / 3) { return 'plutôt dans le haut de cette fourchette'; }
  return 'plutôt vers le milieu de cette fourchette';
}

function _comprendreLesChiffresPlageAnnees(digest) {
  var d = digest || _comprendreLesChiffresDigest, mn = null, mx = null;
  ((d && d.sections && d.sections['chomage']) || []).forEach(function (x) {
    (x.serieAnnuelle || []).forEach(function (p) {
      var a = parseInt(String(p.label).slice(-4), 10);
      if (isNaN(a)) { return; }
      if (mn === null || a < mn) { mn = a; }
      if (mx === null || a > mx) { mx = a; }
    });
  });
  return mn === null ? '' : (mn === mx ? String(mn) : mn + '-' + mx);
}
function _comprendreLesChiffresPlageEntreParentheses() { var p = _comprendreLesChiffresPlageAnnees(); return p ? ' (' + p + ')' : ''; }
function _comprendreLesChiffresLibelleCroisable(label) {
  var p = _comprendreLesChiffresPlageAnnees();
  return String(label).replace(' ({plage})', p ? ' (' + p + ')' : '').replace('{plage}', p);
}

function _comprendreLesChiffresRenduCroiser() {
  var titre = 'Croiser plusieurs chiffres';
  var desc = 'Mettre deux à quatre séries sur le même graphique pour voir comment elles évoluent ensemble. Plutôt pour les curieux et les professionnels.';
  var ouvert = _comprendreLesChiffresEstVueEnsemble();
  var intro = '<p class="comprendre-les-chiffres-section-intro">Choisissez d’abord une lecture, puis cochez deux à quatre séries de <b>même nature</b> (des pourcentages ensemble, ou des nombres ensemble). Trimestre et année ne se mélangent jamais : ce sont deux lectures séparées. « Par trimestre » suit les derniers trimestres connus, pas l’année civile en cours - une série peut ainsi commencer une année et se terminer l’année suivante.</p>';
  if (_comprendreLesChiffresChargement !== 'ok') {
    return _comprendreLesChiffresRenduBlocRepliable('croiser', titre, desc,
      intro + '<p class="comprendre-les-chiffres-note">Disponible dès qu’un digest trimestriel est chargé.</p>', ouvert);
  }
  var dept = _comprendreLesChiffresDepartementCourant() === '87' ? '87' : '24';
  var caseHtml = function (c) {
    var serie = _comprendreLesChiffresSerieCroisable(c);
    var vide = serie.length < 2;
    var coche = (c.cle === (dept === '87' ? 'cho87' : 'cho24'));
    var raisonTxt = vide ? (COMPRENDRE_LES_CHIFFRES_RAISONS_VIDE[c.raisonVide || 'chantier']) : '';
    return '<label class="' + (vide ? 'comprendre-les-chiffres-croiser-vide' : '') + '">' +
      '<input type="checkbox" data-comprendre-les-chiffres-croiser="' + c.cle + '" data-unite="' + c.unite + '" data-periode="' + c.periode + '"' +
      (vide ? ' disabled' : (coche ? ' checked' : '')) + '> ' +
      _comprendreLesChiffresEchappe(_comprendreLesChiffresLibelleCroisable(c.label)) +
      (vide ? ' <span class="comprendre-les-chiffres-note">(' + _comprendreLesChiffresEchappe(raisonTxt) + ')</span>' : '') +
      '</label>';
  };
  var pctTrim = COMPRENDRE_LES_CHIFFRES_CROISABLES.filter(function (c) { return c.unite === '%' && c.periode === 'trimestre'; });
  var pctAn = COMPRENDRE_LES_CHIFFRES_CROISABLES.filter(function (c) { return c.unite === '%' && c.periode === 'annee'; });
  var nb = COMPRENDRE_LES_CHIFFRES_CROISABLES.filter(function (c) { return c.unite === 'nb'; });
  var periode = _comprendreLesChiffresEtat.croiserPeriode === 'annee' ? 'annee' : 'trimestre';
  var bascule = '<div class="comprendre-les-chiffres-bascule-vue" role="group" aria-label="Lecture des séries" id="comprendreLesChiffresCroiserBascule">' +
    '<button type="button" class="' + (periode === 'trimestre' ? 'actif' : '') + '" data-comprendre-les-chiffres-croiser-periode="trimestre">Par trimestre (période récente)</button>' +
    '<button type="button" class="' + (periode === 'annee' ? 'actif' : '') + '" data-comprendre-les-chiffres-croiser-periode="annee">Par année' + _comprendreLesChiffresPlageEntreParentheses() + '</button>' +
    '</div>';
  var corps = intro + bascule +
    '<div class="comprendre-les-chiffres-croiser" id="comprendreLesChiffresCroiser">' +
    '<div id="comprendreLesChiffresCroiserGroupeTrimestre"' + (periode === 'annee' ? ' hidden' : '') + '>' +
    '<fieldset><legend>Des taux, trimestre par trimestre</legend>' + pctTrim.map(caseHtml).join('') + '</fieldset>' +
    '<fieldset><legend>Des nombres, trimestre par trimestre (personnes, offres)</legend>' + nb.map(caseHtml).join('') + '</fieldset>' +
    '</div>' +
    '<div id="comprendreLesChiffresCroiserGroupeAnnee"' + (periode === 'trimestre' ? ' hidden' : '') + '>' +
    '<fieldset><legend>Des taux, année par année' + _comprendreLesChiffresPlageEntreParentheses() + '</legend>' + pctAn.map(caseHtml).join('') + '</fieldset>' +
    '</div>' +
    '<p class="comprendre-les-chiffres-note comprendre-les-chiffres-croiser-alerte" id="comprendreLesChiffresCroiserAlerte" hidden>' +
    'Vous ne pouvez pas mélanger deux natures différentes sur le même graphique (un taux et un nombre). Décochez l’un des deux groupes.</p>' +
    '<div id="comprendreLesChiffresCroiserGraphe"></div>' +
    '</div>';
  return _comprendreLesChiffresRenduBlocRepliable('croiser', titre, desc, corps, ouvert);
}

// Bascule trimestre / année : décoche le groupe qu'on quitte (une série de
// l'autre lecture ne doit jamais rester cochée hors de vue), affiche le bon
// groupe, puis rafraîchit le graphique. Jamais un re-rendu de toute la
// page : on garderait le repli/dépli et le défilement de la personne.
function _comprendreLesChiffresCroiserBasculerPeriode(periode) {
  _comprendreLesChiffresEtat.croiserPeriode = periode;
  var bascule = document.getElementById('comprendreLesChiffresCroiserBascule');
  if (bascule) {
    bascule.querySelectorAll('[data-comprendre-les-chiffres-croiser-periode]').forEach(function (btn) {
      btn.classList.toggle('actif', btn.getAttribute('data-comprendre-les-chiffres-croiser-periode') === periode);
    });
  }
  var groupeTrim = document.getElementById('comprendreLesChiffresCroiserGroupeTrimestre');
  var groupeAnnee = document.getElementById('comprendreLesChiffresCroiserGroupeAnnee');
  if (groupeTrim) {
    groupeTrim.hidden = (periode !== 'trimestre');
    if (periode !== 'trimestre') { groupeTrim.querySelectorAll('input:checked').forEach(function (i) { i.checked = false; }); }
  }
  if (groupeAnnee) {
    groupeAnnee.hidden = (periode !== 'annee');
    if (periode !== 'annee') { groupeAnnee.querySelectorAll('input:checked').forEach(function (i) { i.checked = false; }); }
  }
  _comprendreLesChiffresCroiserMaj();
}
window._comprendreLesChiffresCroiserBasculerPeriode = _comprendreLesChiffresCroiserBasculerPeriode;

function _comprendreLesChiffresCroiserMaj() {
  var box = document.getElementById('comprendreLesChiffresCroiser');
  if (!box) { return; }
  var coches = Array.prototype.slice.call(box.querySelectorAll('[data-comprendre-les-chiffres-croiser]:checked'));
  var nPct = coches.filter(function (i) { return i.getAttribute('data-unite') === '%'; }).length;
  var nNb = coches.filter(function (i) { return i.getAttribute('data-unite') === 'nb'; }).length;
  var alerte = document.getElementById('comprendreLesChiffresCroiserAlerte');
  var melange = (nPct > 0 && nNb > 0);
  if (alerte) { alerte.hidden = !melange; }
  var cible = document.getElementById('comprendreLesChiffresCroiserGraphe');
  if (!cible) { return; }
  if (melange || !coches.length) { cible.innerHTML = ''; return; }
  var series = coches.map(function (i, idx) {
    var c = COMPRENDRE_LES_CHIFFRES_CROISABLES.filter(function (x) { return x.cle === i.getAttribute('data-comprendre-les-chiffres-croiser'); })[0];
    return { label: _comprendreLesChiffresLibelleCroisable(c.label), pts: _comprendreLesChiffresSerieCroisable(c), couleur: COMPRENDRE_LES_CHIFFRES_COULEURS_SERIES[idx % 4], unite: c.unite };
  }).filter(function (s) { return s.pts.length >= 2; });
  cible.innerHTML = _comprendreLesChiffresRenduGrapheCombine(series);
}
window._comprendreLesChiffresCroiserMaj = _comprendreLesChiffresCroiserMaj;

// Clé de tri chronologique d'un label de point (« T2 2025 » ou « 2025 »).
// Nécessaire quand les séries cochées n'ont pas exactement le même
// historique (l'une commence plus tôt qu'une autre) : sans ce tri, un
// label absent d'une série mais présent dans une autre se retrouvait
// ajouté en fin de liste au lieu d'être remis à sa vraie place.
function _comprendreLesChiffresCleTriLabel(label) {
  var mT = String(label).match(/^T([1-4])\s*(\d{4})$/);
  if (mT) { return parseInt(mT[2], 10) * 10 + parseInt(mT[1], 10); }
  var mA = String(label).match(/^(\d{4})$/);
  if (mA) { return parseInt(mA[1], 10) * 10; }
  return 0;
}

// Graphe combiné multi-séries (courbes, une couleur par série, légende,
// infobulle par trimestre donnant toutes les valeurs actives).
function _comprendreLesChiffresRenduGrapheCombine(series) {
  if (!series.length) { return ''; }
  var labels = [];
  series.forEach(function (s) { s.pts.forEach(function (p) { if (labels.indexOf(p.label) === -1) { labels.push(p.label); } }); });
  labels.sort(function (a, b) { return _comprendreLesChiffresCleTriLabel(a) - _comprendreLesChiffresCleTriLabel(b); });
  var toutes = [];
  series.forEach(function (s) { s.pts.forEach(function (p) { toutes.push(p.v); }); });
  var mn = Math.min.apply(null, toutes), mx = Math.max.apply(null, toutes);
  var bas = mn - Math.max((mx - mn) * 0.15, Math.abs(mn) * 0.05, mx === mn ? 1 : 0);
  var haut = mx + (mx - mn) * 0.1;
  var W = 340, H = 170, padG = 42, padD = 24, y0 = 132, yTop = 14;
  var n = labels.length;
  var x = function (i) { return padG + (n <= 1 ? 0 : i * (W - padG - padD) / (n - 1)); };
  var y = function (v) { return y0 - (y0 - yTop) * (v - bas) / ((haut - bas) || 1); };
  var suffixe = (series[0] && series[0].unite === '%') ? ' %' : '';
  var axeY = [haut, (haut + bas) / 2, bas].map(function (v) {
    var yy = y(v);
    return '<line class="grille" x1="' + padG + '" y1="' + yy.toFixed(1) + '" x2="' + (W - padD) + '" y2="' + yy.toFixed(1) + '"></line>' +
      '<text x="' + (padG - 5) + '" y="' + (yy + 3).toFixed(1) + '" text-anchor="end">' + _comprendreLesChiffresEchappe(_comprendreLesChiffresFormatNombre(v) + suffixe) + '</text>';
  }).join('');
  var courbes = '', colonnes = '', axeX = '';
  series.forEach(function (s) {
    var pts = labels.map(function (lab) {
      var p = s.pts.filter(function (q) { return q.label === lab; })[0];
      return p ? x(labels.indexOf(lab)).toFixed(1) + ',' + y(p.v).toFixed(1) : null;
    }).filter(Boolean);
    courbes += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + s.couleur + '" stroke-width="2"></polyline>';
  });
  // Point + zone de survol sur CHAQUE ligne (pas sur toute la colonne) :
  // Denis a signale que l'infobulle apparaissait n'importe ou dans la
  // colonne, meme loin des courbes. Chaque point garde le detail complet
  // du trimestre (toutes les series cochees), mais ne se declenche
  // qu'au survol proche d'un point reel d'une courbe.
  labels.forEach(function (lab, i) {
    var infos = series.map(function (s) {
      var p = s.pts.filter(function (q) { return q.label === lab; })[0];
      return p ? s.label + ' : ' + _comprendreLesChiffresFormatNombre(p.v) + (s.unite === '%' ? ' %' : '') : null;
    }).filter(Boolean).join(' | ');
    var tip = _comprendreLesChiffresEchappe(lab + ' : ' + infos);
    series.forEach(function (s) {
      var p = s.pts.filter(function (q) { return q.label === lab; })[0];
      if (!p) { return; }
      var cx = x(i).toFixed(1), cy = y(p.v).toFixed(1);
      colonnes += '<circle class="pt" cx="' + cx + '" cy="' + cy + '" r="2.4" fill="' + s.couleur + '"></circle>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="transparent" data-tip="' + tip + '"></circle>';
    });
    if (i === 0 || i === n - 1 || i === Math.floor(n / 2)) {
      var anc = i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle');
      axeX += '<text x="' + x(i).toFixed(1) + '" y="148" text-anchor="' + anc + '">' + _comprendreLesChiffresEchappe(lab) + '</text>';
    }
  });
  var legende = '<div class="comprendre-les-chiffres-graph-legende">' + series.map(function (s) {
    return '<span><i style="background:' + s.couleur + '"></i>' + _comprendreLesChiffresEchappe(s.label) + '</span>';
  }).join('') + '</div>';
  return legende +
    '<svg class="comprendre-les-chiffres-graphe" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique combiné" ' +
    'onmousemove="_comprendreLesChiffresGrapheInfobulle(event)" onmouseleave="_comprendreLesChiffresGrapheInfobulleMasquer()">' +
    axeY + '<line class="axe" x1="' + padG + '" y1="' + y0 + '" x2="' + (W - padD) + '" y2="' + y0 + '"></line>' +
    courbes + colonnes + axeX + '</svg>' +
    '<p class="comprendre-les-chiffres-note">Au survol (ou au toucher) d’un trimestre, l’infobulle donne toutes les valeurs cochées à la fois.</p>';
}

// ============================================================
// SALAIRES, NIVEAU DE VIE, EUROPE (consignes 119 à 123, 2026-11-06)
// ============================================================
// Trois fichiers de données, tous modifiables depuis l'outil de veille
// (contenu/salaires-insee.md, niveau-de-vie-insee.md, europe-eurostat.md) :
// une fiche par territoire (« ## Nom »), rangée par groupe (« # departements »,
// « # regions », « # france », « # pays »). Les plus hauts, les plus bas et la
// moyenne ne sont JAMAIS écrits à la main : l'application les calcule. Une carte
// dont le chiffre manque, ou dont le fichier n'est pas daté, ne s'affiche pas
// (jamais de rubrique vide). Aucun classement : on situe, on ne range pas.
// Titre et description du bloc : lus aussi par la recherche de l'accueil (data/baseConnaissancesERIP.js).
var COMPRENDRE_LES_CHIFFRES_SALAIRES_BLOC = {
  t: 'Les salaires et le niveau de vie',
  d: 'Salaire net moyen, médiane, écart entre femmes et hommes, niveau de vie, salaire minimum et niveau des prix : comparer son département, la région, la France et l’Union européenne.'
};
var COMPRENDRE_LES_CHIFFRES_FICHES_FICHIERS = {
  salaires: 'salaires-insee.md',
  niveauVie: 'niveau-de-vie-insee.md',
  europe: 'europe-eurostat.md',
  smicDares: 'smic-dares.md',
  pouvoirAchat: 'pouvoir-achat-insee.md',
  europeEconomie: 'europe-economie-eurostat.md',
  portraitChiffres: 'portrait-chiffres.md',
  ageInsee: 'age-insee.md',
  formationInsee: 'formation-insee.md',
  secteursInsee: 'secteurs-insee.md',
  tempsPartielInsee: 'temps-partiel-insee.md',
  medecinsInsee: 'generalistes-insee.md',
  demandeursDares: 'demandeurs-dares.md'
};
var _comprendreLesChiffresFiches = {};
var _comprendreLesChiffresFichesEtat = {};
// Les deux départements de l'application, sous le nom qu'ils portent dans les fichiers.
var COMPRENDRE_LES_CHIFFRES_DEP_NOMS = { '24': 'Dordogne', '87': 'Haute-Vienne' };
// Les douze départements de la Nouvelle-Aquitaine.
var COMPRENDRE_LES_CHIFFRES_DEP_NA = ['Charente', 'Charente-Maritime', 'Corrèze', 'Creuse', 'Dordogne', 'Gironde', 'Landes',
  'Lot-et-Garonne', 'Pyrénées-Atlantiques', 'Deux-Sèvres', 'Vienne', 'Haute-Vienne'];
// Quand un fiche cite plusieurs sources, la source propre à un champ national.
var COMPRENDRE_LES_CHIFFRES_SOURCE_DU_CHAMP = {
  salaire_mediane: 'insee-premiere-2079', salaire_decile_1: 'insee-premiere-2079', salaire_decile_9: 'insee-premiere-2079',
  salaire_industrie: 'insee-premiere-2079', salaire_services: 'insee-premiere-2079', salaire_construction: 'insee-premiere-2079',
  // Europe : chaque chiffre cite SA source (un pays en a jusqu'à quatre dans son fiche)
  salaire_minimum_mensuel: 'eurostat-salaire-minimum', remuneration_nette_annuelle: 'eurostat-remuneration-nette', niveau_des_prix: 'eurostat-niveau-des-prix', inflation_annuelle: 'eurostat-inflation',
  taux_pauvrete: 'insee-pauvrete-2023',
  // Europe, économie (europe-economie-eurostat.md)
  croissance_pib: 'eurostat-croissance', revenu_menages_spa: 'eurostat-revenu-menages', evolution_emploi: 'eurostat-evolution-emploi', taux_emploi: 'eurostat-taux-emploi',
  evolution_salaire_minimum: 'eurostat-evolution-salaire-minimum', evolution_remuneration_nette: 'eurostat-evolution-remuneration',
  taux_creation_entreprises: 'eurostat-creations', taux_cessation_entreprises: 'eurostat-cessations', evolution_faillites: 'eurostat-faillites',
  part_depenses_alimentation: 'eurostat-depenses-alimentation', part_depenses_logement: 'eurostat-depenses-logement', part_depenses_energie: 'eurostat-depenses-energie'
};

// Lit un de ces fichiers. Rend null si le texte n'a pas d'en-tête.
// ---------- Périodes structurées (consigne 145 de Denis, 07/11/2026) ----------
// Tout ce qui s'écrit « en 2025 », « au 2e trimestre 2026 », « entre 2024 et 2025 » dans une carte vient de la période déclarée dans l'en-tête du fichier de données
// (bloc « periodes: »), jamais d'une année écrite à la main dans le code : le jour où le fichier passe à 2027, les phrases suivent toutes seules.
// Une période : « 2025 », « T2 2026 » (trimestre), « S2 2025 » (semestre) ; un intervalle : « 2024 > 2025 ». Rend { debut: période ou null, fin: période } ou null.
var COMPRENDRE_LES_CHIFFRES_MOIS_NOMS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function _comprendreLesChiffresPeriodeUne(txt) {
  var t = String(txt || '').trim();
  // Un mois (« 2025-12 ») ou un jour (« 2026-01-01 ») : pour les montants qui changent à une date précise, comme le Smic.
  var mj = t.match(/^(20\d\d)-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/);
  if (mj) { return mj[3] ? { genre: 'jour', n: +mj[2], jour: +mj[3], an: +mj[1] } : { genre: 'mois', n: +mj[2], an: +mj[1] }; }
  var m = t.match(/^(?:([TS])([1-4]) )?(20\d\d)$/);
  if (!m) { return null; }
  if (m[1] === 'S' && +m[2] > 2) { return null; }
  return { genre: m[1] === 'T' ? 'trimestre' : (m[1] === 'S' ? 'semestre' : 'annee'), n: m[2] ? +m[2] : 0, an: +m[3] };
}
function _comprendreLesChiffresPeriodeLire(txt) {
  var morceaux = String(txt || '').split('>');
  if (morceaux.length > 2) { return null; }
  var fin = _comprendreLesChiffresPeriodeUne(morceaux[morceaux.length - 1]), debut = morceaux.length === 2 ? _comprendreLesChiffresPeriodeUne(morceaux[0]) : null;
  if (!fin || (morceaux.length === 2 && !debut)) { return null; }
  return { debut: debut, fin: fin };
}
// Une période en mots : « 2025 » (ou « en 2025 »), « 2e trimestre 2026 » (ou « au 2e trimestre 2026 »).
function _comprendreLesChiffresPeriodeMots(p, avecPrep) {
  if (!p) { return ''; }
  if (p.genre === 'annee') { return (avecPrep ? 'en ' : '') + p.an; }
  if (p.genre === 'mois') { return (avecPrep ? 'en ' : '') + COMPRENDRE_LES_CHIFFRES_MOIS_NOMS[p.n - 1] + ' ' + p.an; }
  if (p.genre === 'jour') { return (avecPrep ? 'au ' : '') + (p.jour === 1 ? '1er' : p.jour) + ' ' + COMPRENDRE_LES_CHIFFRES_MOIS_NOMS[p.n - 1] + ' ' + p.an; }
  return (avecPrep ? 'au ' : '') + (p.n === 1 ? '1er' : p.n + 'e') + ' ' + p.genre + ' ' + p.an;
}
// Remplace les jetons d'une phrase par la période de la source (ou de la source désignée par « @clé »). Jetons : {fin} {en_fin} {debut} {en_debut} {entre}.
// Rend null si une période manque : l'appelant n'affiche alors pas la carte plutôt qu'une phrase sans année.
function _comprendreLesChiffresPeriodeSubstituer(texte, doc, cleSource) {
  var manque = false;
  var sortie = String(texte).replace(/\{(fin|en_fin|debut|en_debut|entre)(?:@([a-z0-9-]+))?\}/g, function (m0, jeton, autre) {
    var per = doc && doc.periodes && doc.periodes[autre || cleSource];
    if (!per || (/debut|entre/.test(jeton) && !per.debut)) { manque = true; return ''; }
    if (jeton === 'fin') { return _comprendreLesChiffresPeriodeMots(per.fin, false); }
    if (jeton === 'en_fin') { return _comprendreLesChiffresPeriodeMots(per.fin, true); }
    if (jeton === 'debut') { return _comprendreLesChiffresPeriodeMots(per.debut, false); }
    if (jeton === 'en_debut') { return _comprendreLesChiffresPeriodeMots(per.debut, true); }
    var art = (per.fin.genre === 'annee' || per.fin.genre === 'mois') ? '' : 'le ';
    return 'entre ' + art + _comprendreLesChiffresPeriodeMots(per.debut, false) + ' et ' + art + _comprendreLesChiffresPeriodeMots(per.fin, false);
  });
  return manque ? null : sortie;
}

// La clé de la seule période d'un fichier de comparaison (un fichier = une source = une période) ; null s'il y en a zéro ou plusieurs.
function _comprendreLesChiffresPeriodeUnique(doc) {
  var k = Object.keys((doc && doc.periodes) || {});
  return k.length === 1 ? k[0] : null;
}

function _comprendreLesChiffresParserFiches(md) {
  var mFront = String(md || '').replace(/\r\n/g, '\n').match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!mFront) { return null; }
  var entete = mFront[1];
  var out = { verifie_le: '', sources: {}, periodes: {}, groupes: {}, ordre: {} };
  var mv = entete.match(/^verifie_le:\s*(.+)$/m);
  if (mv) { out.verifie_le = mv[1].trim().replace(/^"|"$/g, ''); }
  (_comprendreLesChiffresExtraireListeSimple(entete, 'sources') || []).forEach(function (ligne) {
    var p = ligne.split('|').map(function (x) { return x.trim(); });
    if (p.length >= 3) { out.sources[p[0]] = { titre: p[1], url: p[2], date: p[3] || '' }; }
  });
  // Périodes structurées (consigne 145) : « clé de source | 2025 », « … | T2 2026 », « … | 2024 > 2025 » ; une période illisible est ignorée (la carte qui en dépend ne s’affiche pas).
  (_comprendreLesChiffresExtraireListeSimple(entete, 'periodes') || []).forEach(function (ligne) {
    var q = ligne.split('|').map(function (x) { return x.trim(); }), per = q.length === 2 ? _comprendreLesChiffresPeriodeLire(q[1]) : null;
    if (per) { out.periodes[q[0]] = per; }
  });
  var groupe = '', courant = null;
  mFront[2].split('\n').forEach(function (brute) {
    var ligne = brute.replace(/\s+$/, '');
    var mG = ligne.match(/^#\s+(.+)$/);
    if (mG) { groupe = _comprendreLesChiffresNorm(mG[1]).trim(); courant = null; return; }
    var mB = ligne.match(/^##\s+(.+)$/);
    if (mB) {
      courant = null;
      if (!groupe) { return; }
      var nom = mB[1].trim(), cle = _comprendreLesChiffresNorm(nom);
      if (!out.groupes[groupe]) { out.groupes[groupe] = {}; out.ordre[groupe] = []; }
      courant = { nom: nom, champs: {}, sourcesCles: [] };
      out.groupes[groupe][cle] = courant;
      out.ordre[groupe].push(cle);
      return;
    }
    if (!courant) { return; }
    var m = ligne.match(/^([a-z_0-9]+)\s*:\s*(.*)$/);
    if (!m) { return; }
    if (m[1] === 'sources') { courant.sourcesCles = m[2].split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
    else { courant.champs[m[1]] = m[2].trim(); }
  });
  return out;
}

// Chargement : seulement les fichiers utiles au niveau lu. On ne redessine la page
// qu'une fois, quand plus aucun de ces fichiers n'est en cours de lecture.
function _comprendreLesChiffresChargerFiches(cle) {
  var etat = _comprendreLesChiffresFichesEtat[cle] || 'inactif';
  if (etat !== 'inactif') { return; }
  _comprendreLesChiffresFichesEtat[cle] = 'encours';
  var fini = function (doc, etatFinal) {
    _comprendreLesChiffresFiches[cle] = doc;
    _comprendreLesChiffresFichesEtat[cle] = etatFinal;
    var encore = Object.keys(_comprendreLesChiffresFichesEtat).some(function (k) { return _comprendreLesChiffresFichesEtat[k] === 'encours'; });
    if (!encore && etatFinal === 'ok' && _comprendreLesChiffresEtat.ecran === 'accueil') { pageComprendreLesChiffres(); }
  };
  fetch(COMPRENDRE_LES_CHIFFRES_BASE_CONTENU + COMPRENDRE_LES_CHIFFRES_FICHES_FICHIERS[cle])
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (t) {
      var doc = t ? _comprendreLesChiffresParserFiches(t) : null;
      fini(doc, doc ? 'ok' : 'vide');
    })
    .catch(function () { fini(null, 'erreur'); });
}
function _comprendreLesChiffresChargerFichesDuNiveau() {
  var cles = (_comprendreLesChiffresNiveauCourant() === 'ue' ? ['europe', 'europeEconomie'] : ['salaires', 'niveauVie', 'portraitChiffres', 'ageInsee', 'formationInsee', 'secteursInsee', 'tempsPartielInsee', 'medecinsInsee', 'demandeursDares']).concat(['smicDares', 'pouvoirAchat']);
  cles.forEach(_comprendreLesChiffresChargerFiches);
}

// Le document, seulement s'il est lu ET daté d'une vraie date (« a-valider » : rien n'est montré).
function _comprendreLesChiffresFicheDoc(cle) {
  var doc = _comprendreLesChiffresFichesEtat[cle] === 'ok' ? _comprendreLesChiffresFiches[cle] : null;
  return (doc && _comprendreLesChiffresDateEnClair(doc.verifie_le)) ? doc : null;
}

// Une valeur lue sur une fiche : { n, nom, src } ou null (champ absent ou illisible).
function _comprendreLesChiffresFicheValeurDe(doc, f, champ) {
  if (!f || f.champs[champ] == null) { return null; }
  var n = _comprendreLesChiffresNombre(f.champs[champ]);
  if (n == null) { return null; }
  var pref = COMPRENDRE_LES_CHIFFRES_SOURCE_DU_CHAMP[champ];
  var cle = (pref && f.sourcesCles.indexOf(pref) >= 0) ? pref : f.sourcesCles[0];
  var s = cle && doc.sources[cle];
  return { n: n, nom: f.nom, src: s ? { titre: s.titre, url: s.url, date: s.date, cle: cle } : null };
}
function _comprendreLesChiffresFicheValeur(doc, groupe, nom, champ) {
  var g = doc && doc.groupes[groupe];
  return g ? _comprendreLesChiffresFicheValeurDe(doc, g[_comprendreLesChiffresNorm(nom)], champ) : null;
}
// La seule fiche du groupe « france » (« France » ou « France métropolitaine » selon le fichier).
function _comprendreLesChiffresFicheFrance(doc, champ) {
  var g = doc && doc.groupes.france, cles = doc && doc.ordre.france;
  return (g && cles && cles.length) ? _comprendreLesChiffresFicheValeurDe(doc, g[cles[0]], champ) : null;
}
// Toutes les valeurs d'un champ dans un groupe, du plus haut au plus bas.
function _comprendreLesChiffresFicheClassement(doc, groupe, champ) {
  var out = [], g = doc && doc.groupes[groupe];
  ((doc && doc.ordre[groupe]) || []).forEach(function (cle) {
    var v = _comprendreLesChiffresFicheValeurDe(doc, g[cle], champ);
    if (v) { out.push(v); }
  });
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

function _comprendreLesChiffresFicheEuros(n) { return _comprendreLesChiffresFormatDecimal(Math.round(n), 0) + ' €'; }
function _comprendreLesChiffresFicheIndice(n) { return _comprendreLesChiffresFormatDecimal(n, 1); }

// Une ligne du composant commun à partir d'une valeur lue.
function _comprendreLesChiffresFicheLigne(nom, v, fmt, fort) {
  return { nom: nom, texte: fmt(v.n), n: v.n, fort: !!fort, source: v.src ? v.src.titre + ' : ' + v.nom : '' };
}

// « 20 % sous la moyenne de la France » / « 4 % au-dessus de ... » / « au niveau de ... ».
function _comprendreLesChiffresFicheEcart(n, ref, refLibelle) {
  var e = Math.round((n - ref) / ref * 100);
  if (e === 0) { return '&#8594; au niveau de ' + refLibelle; }
  return e < 0 ? '&#8600; ' + (-e) + ' % sous ' + refLibelle : '&#8599; ' + e + ' % au-dessus de ' + refLibelle;
}

function _comprendreLesChiffresFicheSourcesHTML(srcs) {
  var vues = {}, html = '';
  srcs.forEach(function (s) {
    if (!s || vues[s.cle]) { return; }
    vues[s.cle] = true;
    var d = _comprendreLesChiffresDateEnClair(s.date);
    html += _comprendreLesChiffresRenduSource({ sourceNom: s.titre, date: d ? (/^\d/.test(d) ? 'relevé le ' : 'relevé en ') + d : '', sourceUrl: s.url });
  });
  return html;
}

function _comprendreLesChiffresFicheDepli(titre, corpsHTML) {
  return '<details class="comprendre-les-chiffres-depli"><summary><span class="comprendre-les-chiffres-depli-titre">' + _comprendreLesChiffresEchappe(titre) + '</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span></summary>' +
    '<div class="comprendre-les-chiffres-depli-corps">' + corpsHTML + '</div></details>';
}
// Boutons « Lire dans le Lexique » d'un dépliant d'aide : un vrai bouton par mot (le clic est branché par _comprendreLesChiffresBrancherEntreprises, « Retour » ramène ici).
function _comprendreLesChiffresFicheBoutonsLexique(fiches) {
  return '<div class="d-flex flex-wrap gap-2 mt-2">' + fiches.map(function (f) {
    return '<button type="button" class="btn btn-outline-secondary btn-sm" data-comprendre-les-chiffres-fiche-lexique="' + _comprendreLesChiffresEchappe(f.id) + '"><i class="bi bi-book"></i> ' + _comprendreLesChiffresEchappe(f.libelle) + '</button>';
  }).join('') + '</div>';
}
// Les mots d'une carte expliqués dans le Lexique : une ligne d'invitation et un vrai bouton par mot (consigne 146 : remplace les dépliants d'aide).
function _comprendreLesChiffresFicheMotsLexique(fiches) {
  return '<p class="comprendre-les-chiffres-compare mb-0 mt-2"><i class="bi bi-book"></i> Pour comprendre les mots :</p>' + _comprendreLesChiffresFicheBoutonsLexique(fiches);
}
function _comprendreLesChiffresFichePara(texte, dernier) {
  return '<p class="comprendre-les-chiffres-compare ' + (dernier ? 'mb-0' : 'mb-1') + '">' + texte + '</p>';
}
function _comprendreLesChiffresFicheEncart(texte) {
  return '<div class="comprendre-les-chiffres-encart small"><i class="bi bi-info-circle"></i> ' + texte + '</div>';
}

// Une carte : question, grand chiffre, flèche, lecture au choix, explications, source.
// o : { id, q, grand: {texte, src, unite}, tendance, groupes, extra, sources }
function _comprendreLesChiffresFicheCarte(o) {
  var grand = '';
  if (o.grand) {
    grand = '<p class="comprendre-les-chiffres-indic-valeur"><span class="chiffre"' +
      (o.grand.src ? ' data-source="' + _comprendreLesChiffresEchappe(o.grand.src) + '"' : '') + '>' + _comprendreLesChiffresEchappe(o.grand.texte) + '</span>' +
      (o.grand.unite ? ' <span class="comprendre-les-chiffres-unite">' + _comprendreLesChiffresEchappe(o.grand.unite) + '</span>' : '') + '</p>';
  }
  return '<div class="comprendre-les-chiffres-indic" id="comprendre-les-chiffres-carte-' + o.id + '">' +
    '<p class="comprendre-les-chiffres-indic-q">' + _comprendreLesChiffresEchappe(o.q) + '</p>' + grand +
    (o.tendance ? '<span class="comprendre-les-chiffres-tendance">' + o.tendance + '</span>' : '') +
    _comprendreLesChiffresVuesAssembler(o.id, '', o.groupes, null) +
    (o.extra || '') + _comprendreLesChiffresFicheSourcesHTML(o.sources || []) + '</div>';
}

// ---------- les cartes de salaires (Insee) ----------
var COMPRENDRE_LES_CHIFFRES_CSP = [
  { champ: 'salaire_cadres', nom: 'Cadres' }, { champ: 'salaire_intermediaires', nom: 'Professions intermédiaires' },
  { champ: 'salaire_employes', nom: 'Employés' }, { champ: 'salaire_ouvriers', nom: 'Ouvriers' }
];

// Le territoire lu face au plus haut, au plus bas et à la France : 4 lignes au plus.
// o : { doc, groupe, champ, nom (territoire lu), libelleHaut, libelleBas, france (ligne), fmt }
function _comprendreLesChiffresFicheReperes(o) {
  var cl = _comprendreLesChiffresFicheClassement(o.doc, o.groupe, o.champ);
  var lu = _comprendreLesChiffresFicheValeur(o.doc, o.groupe, o.nom, o.champ);
  if (!lu || cl.length < 3 || !o.france) { return null; }
  var haut = cl[0], bas = cl[cl.length - 1], lignes = [_comprendreLesChiffresFicheLigne(o.libelleLu || lu.nom, lu, o.fmt, true)];
  if (haut.nom !== lu.nom) { lignes.push(_comprendreLesChiffresFicheLigne(haut.nom + ' (' + o.libelleHaut + ')', haut, o.fmt)); }
  if (bas.nom !== lu.nom) { lignes.push(_comprendreLesChiffresFicheLigne(bas.nom + ' (' + o.libelleBas + ')', bas, o.fmt)); }
  lignes.push(_comprendreLesChiffresFicheLigne(o.libelleFrance, o.france, o.fmt));
  lignes.sort(function (a, b) { return b.n - a.n; });
  return { lu: lu, haut: haut, bas: bas, lignes: lignes };
}

// Salaire moyen du territoire lu (département ou région) face aux extrêmes et à la France.
function _comprendreLesChiffresSalaireCarteMoyen(S, niveau, nom, art) {
  var groupe = niveau === 'dep' ? 'departements' : 'regions';
  var france = _comprendreLesChiffresFicheFrance(S, 'salaire_net_mensuel');
  var r = _comprendreLesChiffresFicheReperes({
    doc: S, groupe: groupe, champ: 'salaire_net_mensuel', nom: nom, france: france, fmt: _comprendreLesChiffresFicheEuros,
    libelleHaut: niveau === 'dep' ? 'le mieux payé' : 'la mieux payée', libelleBas: niveau === 'dep' ? 'le moins bien payé' : 'la moins bien payée',
    libelleFrance: 'France entière'
  });
  if (!r) { return ''; }
  var extra = _comprendreLesChiffresFicheDepli('Comment lire ce chiffre ?',
    _comprendreLesChiffresFichePara('C’est une moyenne des salaires nets mensuels, calculée comme si chaque personne avait travaillé à temps plein. Elle est plus haute que la médiane car les très hauts salaires la tirent vers le haut.') +
    _comprendreLesChiffresFichePara('Elle compte les salariés du secteur privé qui travaillent dans ' + (niveau === 'dep' ? 'le département' : 'la région') + ', pas ceux qui y habitent.', true));
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-moyen-' + niveau, q: 'Quel est le salaire net mensuel moyen dans ' + art + ' ?',
    grand: { texte: _comprendreLesChiffresFicheEuros(r.lu.n), src: r.lu.src ? r.lu.src.titre + ' : ' + r.lu.nom : '', unite: 'net par mois' },
    tendance: _comprendreLesChiffresFicheEcart(r.lu.n, france.n, 'la moyenne de la France'),
    groupes: [{ lignes: r.lignes }], extra: extra, sources: [r.lu.src]
  });
}

// Les quatre grands groupes d'emplois du territoire lu, chacun à côté de la France.
function _comprendreLesChiffresSalaireCarteMetiers(S, niveau, nom, art) {
  var groupe = niveau === 'dep' ? 'departements' : 'regions', groupes = [], srcs = [], maxi = null;
  COMPRENDRE_LES_CHIFFRES_CSP.forEach(function (c) {
    var lu = _comprendreLesChiffresFicheValeur(S, groupe, nom, c.champ), fr = _comprendreLesChiffresFicheFrance(S, c.champ);
    if (!lu || !fr) { return; }
    groupes.push({ titre: c.nom, lignes: [_comprendreLesChiffresFicheLigne(nom, lu, _comprendreLesChiffresFicheEuros, true), _comprendreLesChiffresFicheLigne('France', fr, _comprendreLesChiffresFicheEuros)] });
    srcs.push(lu.src);
    if (!maxi || lu.n > maxi.n) { maxi = { n: lu.n, nom: c.nom, v: lu }; }
  });
  if (!groupes.length) { return ''; }
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-metiers-' + niveau, q: 'Selon le métier exercé, dans ' + art,
    grand: { texte: _comprendreLesChiffresFicheEuros(maxi.n), src: maxi.v.src ? maxi.v.src.titre + ' : ' + maxi.v.nom : '', unite: 'net par mois, ' + maxi.nom.toLowerCase() },
    tendance: '&#8599; ' + _comprendreLesChiffresEchappe(maxi.nom.toLowerCase()) + ' : le groupe le mieux payé',
    groupes: groupes,
    extra: _comprendreLesChiffresFicheEncart('Moyennes par grand groupe d’emplois : à l’intérieur d’un groupe, les salaires varient beaucoup selon le métier. Le salaire métier par métier n’est pas publié par les sources consultées.'),
    sources: srcs
  });
}

// Hommes et femmes : les deux moyennes du territoire lu, chacune à côté de la France.
function _comprendreLesChiffresSalaireCarteSexes(S, niveau, nom, art) {
  var groupe = niveau === 'dep' ? 'departements' : 'regions';
  var h = _comprendreLesChiffresFicheValeur(S, groupe, nom, 'salaire_hommes'), f = _comprendreLesChiffresFicheValeur(S, groupe, nom, 'salaire_femmes');
  var hf = _comprendreLesChiffresFicheFrance(S, 'salaire_hommes'), ff = _comprendreLesChiffresFicheFrance(S, 'salaire_femmes');
  if (!h || !f || !hf || !ff || !(h.n > 0) || !(hf.n > 0)) { return ''; }
  var ecartLu = Math.round((h.n - f.n) / h.n * 100), ecartFr = Math.round((hf.n - ff.n) / hf.n * 100);
  var phrase = '<p class="comprendre-les-chiffres-indic-phrase">En France, cet écart est de <strong>' + ecartFr + ' %</strong>.</p>';
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-sexes-' + niveau, q: 'Hommes et femmes : quel écart de salaire dans ' + art + ' ?',
    grand: { texte: ecartLu + ' %', src: h.src ? h.src.titre + ' : ' + h.nom : '', unite: 'd’écart entre le salaire moyen des femmes et celui des hommes' },
    groupes: [
      { titre: 'Hommes', lignes: [_comprendreLesChiffresFicheLigne(nom, h, _comprendreLesChiffresFicheEuros, true), _comprendreLesChiffresFicheLigne('France', hf, _comprendreLesChiffresFicheEuros)] },
      { titre: 'Femmes', lignes: [_comprendreLesChiffresFicheLigne(nom, f, _comprendreLesChiffresFicheEuros, true), _comprendreLesChiffresFicheLigne('France', ff, _comprendreLesChiffresFicheEuros)] }
    ],
    extra: phrase + _comprendreLesChiffresFicheEncart('Ce sont des moyennes, tous métiers confondus, ramenées à un temps plein. Elles ne disent pas ce que gagnent une femme et un homme à poste égal, ni ce que vous pouvez espérer.'),
    sources: [h.src]
  });
}

// France : les salaires moyens par département (cinq plus hauts, cinq plus bas) et la liste complète.
function _comprendreLesChiffresSalaireCarteExtremes(S) {
  var cl = _comprendreLesChiffresFicheClassement(S, 'departements', 'salaire_net_mensuel'), france = _comprendreLesChiffresFicheFrance(S, 'salaire_net_mensuel');
  if (cl.length < 11 || !france) { return ''; }
  var fe = _comprendreLesChiffresFicheEuros, lf = _comprendreLesChiffresFicheLigne('France entière', france, fe, true);
  var ligne = function (v) { return _comprendreLesChiffresFicheLigne(v.nom, v, fe); };
  var tous = cl.map(ligne);
  tous.push(lf);
  tous.sort(function (a, b) { return b.n - a.n; });
  var extra = _comprendreLesChiffresFicheDepli('Les ' + cl.length + ' départements',
    _comprendreLesChiffresVuesAssembler('sal-tous-departements', '', [{ lignes: tous }], null));
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-extremes-fr', q: 'Où les salaires sont-ils les plus hauts et les plus bas ?',
    grand: { texte: fe(france.n), src: france.src ? france.src.titre + ' : France' : '', unite: 'net par mois, moyenne de la France' },
    groupes: [
      { titre: 'Les cinq départements les mieux payés', lignes: cl.slice(0, 5).map(ligne).concat([lf]).sort(function (a, b) { return b.n - a.n; }) },
      { titre: 'Les cinq départements les moins bien payés', lignes: cl.slice(-5).map(ligne).concat([lf]).sort(function (a, b) { return b.n - a.n; }) }
    ],
    extra: extra, sources: [france.src]
  });
}

// Nouvelle-Aquitaine : les douze départements côte à côte, et la région face aux autres.
function _comprendreLesChiffresSalaireCarteDepartementsRegion(S, nomDep) {
  var lignes = [], srcs = [], tous = _comprendreLesChiffresFicheClassement(S, 'departements', 'salaire_net_mensuel');
  var france = _comprendreLesChiffresFicheFrance(S, 'salaire_net_mensuel');
  COMPRENDRE_LES_CHIFFRES_DEP_NA.forEach(function (d) {
    var v = _comprendreLesChiffresFicheValeur(S, 'departements', d, 'salaire_net_mensuel');
    if (v) { lignes.push(_comprendreLesChiffresFicheLigne(v.nom + (v.nom === nomDep ? ' (votre département)' : ''), v, _comprendreLesChiffresFicheEuros, v.nom === nomDep)); srcs.push(v.src); }
  });
  if (lignes.length < 3 || !france) { return ''; }
  lignes.push(_comprendreLesChiffresFicheLigne('France entière', france, _comprendreLesChiffresFicheEuros));
  lignes.sort(function (a, b) { return b.n - a.n; });
  var dessus = lignes.filter(function (l) { return l.nom !== 'France entière'; }), haut = dessus[0], bas = dessus[dessus.length - 1];
  var bas101 = tous.length ? tous[tous.length - 1] : null, extra = '';
  if (bas101 && COMPRENDRE_LES_CHIFFRES_DEP_NA.indexOf(bas101.nom) >= 0) {
    extra = _comprendreLesChiffresFicheDepli('Un fait à connaître',
      _comprendreLesChiffresFichePara('Le département le moins bien payé de toute la France (' + _comprendreLesChiffresEchappe(bas101.nom) + ', ' + _comprendreLesChiffresFicheEuros(bas101.n) + ') se trouve dans la Nouvelle-Aquitaine.', true));
  }
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-douze-departements', q: 'Et dans les ' + (lignes.length - 1) + ' départements de la Nouvelle-Aquitaine ?',
    grand: { texte: haut.texte, src: haut.source, unite: 'net par mois, le plus haut : ' + haut.nom.replace(' (votre département)', '') },
    tendance: '&#8599; le plus bas : ' + _comprendreLesChiffresEchappe(bas.nom.replace(' (votre département)', '')) + ' (' + bas.texte + ')',
    groupes: [{ lignes: lignes }], extra: extra, sources: srcs.slice(0, 1)
  });
}

// France : l'écart entre les moyennes des femmes et des hommes.
function _comprendreLesChiffresSalaireCarteSexesFrance(S) {
  var fe = _comprendreLesChiffresFicheEuros;
  var h = _comprendreLesChiffresFicheFrance(S, 'salaire_hommes'), f = _comprendreLesChiffresFicheFrance(S, 'salaire_femmes');
  if (!h || !f || !(h.n > 0)) { return ''; }
  var ecart = Math.round((h.n - f.n) / h.n * 100);
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-sexes-fr', q: 'Hommes et femmes : quel écart de salaire en France ?',
    grand: { texte: ecart + ' %', src: h.src ? h.src.titre + ' : France' : '', unite: 'd’écart entre le salaire moyen des femmes et celui des hommes' },
    groupes: [{ lignes: [_comprendreLesChiffresFicheLigne('Hommes', h, fe), _comprendreLesChiffresFicheLigne('Femmes', f, fe)].sort(function (a, b) { return b.n - a.n; }) }],
    extra: _comprendreLesChiffresFicheEncart('Ce sont des moyennes, tous métiers confondus, ramenées à un temps plein. Elles ne disent pas ce que gagnent une femme et un homme à poste égal, ni ce que vous pouvez espérer.'),
    sources: [h.src]
  });
}

// France : groupes d'emplois et secteurs d'activité (chiffres nationaux).
function _comprendreLesChiffresSalaireCarteEmploisFrance(S) {
  var fe = _comprendreLesChiffresFicheEuros, groupes = [], srcs = [], maxi = null;
  var jeu = function (titre, liste) {
    var lignes = [];
    liste.forEach(function (c) {
      var v = _comprendreLesChiffresFicheFrance(S, c.champ);
      if (v) { lignes.push(_comprendreLesChiffresFicheLigne(c.nom, v, fe)); srcs.push(v.src); if (!maxi || (c.principal && v.n > maxi.n)) { maxi = { n: v.n, nom: c.nom, v: v }; } }
    });
    lignes.sort(function (a, b) { return b.n - a.n; });
    if (lignes.length >= 2) { groupes.push({ titre: titre, lignes: lignes }); }
  };
  jeu('Selon le groupe d’emplois', COMPRENDRE_LES_CHIFFRES_CSP.map(function (c) { return { champ: c.champ, nom: c.nom, principal: true }; }));
  jeu('Selon le secteur', [{ champ: 'salaire_industrie', nom: 'Industrie' }, { champ: 'salaire_services', nom: 'Services' }, { champ: 'salaire_construction', nom: 'Construction' }]);
  if (!groupes.length || !maxi) { return ''; }
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-emplois-fr', q: 'Quels emplois sont mieux payés ?',
    grand: { texte: fe(maxi.n), src: maxi.v.src ? maxi.v.src.titre + ' : France' : '', unite: 'net par mois, ' + maxi.nom.toLowerCase() },
    tendance: '&#8599; ' + _comprendreLesChiffresEchappe(maxi.nom.toLowerCase()) + ' : le groupe le mieux payé',
    groupes: groupes, sources: srcs
  });
}

// Combien gagne un salarié du privé en France : médiane, déciles, moyenne (chiffres nationaux).
function _comprendreLesChiffresSalaireCarteMediane(S) {
  var fe = _comprendreLesChiffresFicheEuros;
  var med = _comprendreLesChiffresFicheFrance(S, 'salaire_mediane'), d1 = _comprendreLesChiffresFicheFrance(S, 'salaire_decile_1');
  var d9 = _comprendreLesChiffresFicheFrance(S, 'salaire_decile_9'), moy = _comprendreLesChiffresFicheFrance(S, 'salaire_net_mensuel');
  if (!med) { return ''; }
  var lignes = [_comprendreLesChiffresFicheLigne('La moitié gagne moins de (médiane)', med, fe, true)];
  if (d1) { lignes.push(_comprendreLesChiffresFicheLigne('Un salarié sur dix gagne moins de', d1, fe)); }
  if (d9) { lignes.push(_comprendreLesChiffresFicheLigne('Un salarié sur dix gagne plus de', d9, fe)); }
  if (moy) { lignes.push(_comprendreLesChiffresFicheLigne('Salaire moyen', moy, fe)); }
  lignes.sort(function (a, b) { return a.n - b.n; });
  if (lignes.length < 2) { return ''; }
  return _comprendreLesChiffresFicheCarte({
    id: 'sal-mediane-fr', q: 'Combien gagne un salarié du privé en France ?',
    grand: { texte: fe(med.n), src: med.src ? med.src.titre + ' : médiane' : '', unite: 'net par mois, la médiane' },
    groupes: [{ lignes: lignes }],
    // La définition de la médiane vit dans le Lexique (une seule source) : la carte ne garde que ce qui lui est propre et le renvoi.
    extra: _comprendreLesChiffresFicheEncart('Montants nets par mois, comme si chaque personne avait travaillé à temps plein toute l’année.') +
      _comprendreLesChiffresFicheMotsLexique([{ id: 'mediane', libelle: 'Lire « Médiane » dans le Lexique' }]),
    sources: [med.src]
  });
}

// ---------- les cartes de niveau de vie (Insee) ----------
// Le sens de « niveau de vie » et de « médiane » est écrit dans le Lexique (une seule source, consigne 146) : la carte n'en garde que le renvoi.
var COMPRENDRE_LES_CHIFFRES_NIVEAU_VIE_AIDE =
  _comprendreLesChiffresFicheMotsLexique([{ id: 'niveau-de-vie', libelle: 'Lire « Niveau de vie » dans le Lexique' }, { id: 'mediane', libelle: 'Lire « Médiane » dans le Lexique' }]);

function _comprendreLesChiffresNiveauVieCarteTerritoire(N, niveau, nom, art) {
  var groupe = niveau === 'dep' ? 'departements' : 'regions';
  var france = _comprendreLesChiffresFicheFrance(N, 'niveau_vie_median');
  var r = _comprendreLesChiffresFicheReperes({
    doc: N, groupe: groupe, champ: 'niveau_vie_median', nom: nom, france: france, fmt: _comprendreLesChiffresFicheEuros,
    libelleHaut: niveau === 'dep' ? 'le plus haut' : 'la plus haute', libelleBas: niveau === 'dep' ? 'le plus bas' : 'la plus basse',
    libelleFrance: france ? france.nom : 'France métropolitaine'
  });
  if (!r) { return ''; }
  var fe = _comprendreLesChiffresFicheEuros, groupes = [{ lignes: r.lignes }];
  if (niveau === 'dep') {
    var d1 = _comprendreLesChiffresFicheValeur(N, groupe, nom, 'niveau_vie_decile_1'), d9 = _comprendreLesChiffresFicheValeur(N, groupe, nom, 'niveau_vie_decile_9');
    var ls = [];
    if (d1) { ls.push(_comprendreLesChiffresFicheLigne('Les 10 % les plus modestes vivent avec moins de', d1, fe)); }
    ls.push(_comprendreLesChiffresFicheLigne('La moitié vit avec moins de (médiane)', r.lu, fe, true));
    if (d9) { ls.push(_comprendreLesChiffresFicheLigne('Les 10 % les plus aisés vivent avec plus de', d9, fe)); }
    if (ls.length >= 2) { groupes.push({ titre: 'Dans ' + art, lignes: ls }); }
  }
  return _comprendreLesChiffresFicheCarte({
    id: 'nv-' + niveau, q: 'Quel est le niveau de vie dans ' + art + ' ?',
    grand: { texte: fe(r.lu.n), src: r.lu.src ? r.lu.src.titre + ' : ' + r.lu.nom : '', unite: 'par an, niveau de vie médian' },
    tendance: _comprendreLesChiffresFicheEcart(r.lu.n, france.n, 'la médiane de la France métropolitaine'),
    groupes: groupes, extra: COMPRENDRE_LES_CHIFFRES_NIVEAU_VIE_AIDE,
    sources: [r.lu.src]
  });
}

// Nouvelle-Aquitaine : le niveau de vie des douze départements.
function _comprendreLesChiffresNiveauVieCarteDepartementsRegion(N, nomDep) {
  var fe = _comprendreLesChiffresFicheEuros, lignes = [], srcs = [];
  var france = _comprendreLesChiffresFicheFrance(N, 'niveau_vie_median');
  COMPRENDRE_LES_CHIFFRES_DEP_NA.forEach(function (d) {
    var v = _comprendreLesChiffresFicheValeur(N, 'departements', d, 'niveau_vie_median');
    if (v) { lignes.push(_comprendreLesChiffresFicheLigne(v.nom + (v.nom === nomDep ? ' (votre département)' : ''), v, fe, v.nom === nomDep)); srcs.push(v.src); }
  });
  if (lignes.length < 3 || !france) { return ''; }
  var nb = lignes.length;
  lignes.push(_comprendreLesChiffresFicheLigne(france.nom, france, fe));
  lignes.sort(function (a, b) { return b.n - a.n; });
  var dessus = lignes.filter(function (l) { return l.nom !== france.nom; }), haut = dessus[0], bas = dessus[dessus.length - 1];
  return _comprendreLesChiffresFicheCarte({
    id: 'nv-douze-departements', q: 'Et dans chacun des ' + nb + ' départements de la Nouvelle-Aquitaine ?',
    grand: { texte: haut.texte, src: haut.source, unite: 'par an, le plus haut : ' + haut.nom.replace(' (votre département)', '') },
    tendance: '&#8599; le plus bas : ' + _comprendreLesChiffresEchappe(bas.nom.replace(' (votre département)', '')) + ' (' + bas.texte + ')',
    groupes: [{ lignes: lignes }], sources: srcs.slice(0, 1)
  });
}

// France : cinq départements au niveau de vie le plus haut, cinq au plus bas.
function _comprendreLesChiffresNiveauVieCarteFrance(N) {
  var fe = _comprendreLesChiffresFicheEuros, cl = _comprendreLesChiffresFicheClassement(N, 'departements', 'niveau_vie_median');
  var france = _comprendreLesChiffresFicheFrance(N, 'niveau_vie_median');
  if (cl.length < 11 || !france) { return ''; }
  var lf = _comprendreLesChiffresFicheLigne(france.nom, france, fe, true);
  var ligne = function (v) { return _comprendreLesChiffresFicheLigne(v.nom, v, fe); };
  return _comprendreLesChiffresFicheCarte({
    id: 'nv-fr', q: 'Où le niveau de vie est-il le plus haut et le plus bas ?',
    grand: { texte: fe(france.n), src: france.src ? france.src.titre + ' : ' + france.nom : '', unite: 'par an, médiane de la ' + france.nom },
    groupes: [
      { titre: 'Les cinq départements au niveau de vie le plus haut', lignes: cl.slice(0, 5).map(ligne).concat([lf]).sort(function (a, b) { return b.n - a.n; }) },
      { titre: 'Les cinq départements au niveau de vie le plus bas', lignes: cl.slice(-5).map(ligne).concat([lf]).sort(function (a, b) { return b.n - a.n; }) }
    ],
    extra: COMPRENDRE_LES_CHIFFRES_NIVEAU_VIE_AIDE,
    sources: [france.src]
  });
}

// Pouvoir d'achat des ménages (Insee, comptes de la Nation, Insee Première n° 2105) : ce que l'on peut acheter avec le revenu du foyer, une fois les prix pris en compte.
// Chiffre national, par « unité de consommation » (le revenu est partagé selon la taille du foyer). Tout vient du fichier pouvoir-achat-insee.md ;
// un chiffre absent, ou un fichier sans vraie date, et la carte n'est pas affichée. Les valeurs négatives sont une baisse : la flèche dit le sens.
function _comprendreLesChiffresPouvoirAchatCarte(D) {
  var v = function (champ) { return _comprendreLesChiffresFicheFrance(D, champ); };
  var fs = function (n) { return (n > 0 ? '+' : '') + _comprendreLesChiffresFormatPourcent(n, 1); };
  var fpt = function (n) { return (n > 0 ? '+' : '') + _comprendreLesChiffresFormatDecimal(n, 1) + ' point' + (Math.abs(n) >= 2 ? 's' : ''); };
  // Les années viennent des champs du fichier (pouvoir_achat_AAAA), jamais d'une liste écrite ici (consigne 145) : la dernière année du fichier est celle de la carte.
  var fiche = D && D.groupes.france && D.ordre.france && D.ordre.france.length && D.groupes.france[D.ordre.france[0]];
  var listeAnnees = Object.keys(fiche ? fiche.champs : {}).map(function (k) { return (k.match(/^pouvoir_achat_(20\d\d)$/) || [])[1]; }).filter(Boolean).map(Number).sort();
  var derniere = listeAnnees.length ? listeAnnees[listeAnnees.length - 1] : 0;
  var an = derniere ? v('pouvoir_achat_' + derniere) : null, prec = derniere ? v('pouvoir_achat_' + (derniere - 1)) : null;
  if (!an) { return ''; }
  var annees = [];
  listeAnnees.forEach(function (a) {
    var x = v('pouvoir_achat_' + a);
    if (x) { annees.push(_comprendreLesChiffresFicheLigne(String(a), x, fs, a === derniere)); }
  });
  var facteurs = [['activite', 'Revenus du travail'], ['patrimoine', 'Revenus du patrimoine (loyers, placements)'], ['prestations', 'Prestations sociales'],
    ['impots', 'Impôts'], ['prix', 'Hausse des prix'], ['demographie', 'Évolution de la population']];
  var causes = [];
  facteurs.forEach(function (f) {
    var x = v('pouvoir_achat_contribution_' + f[0] + '_' + derniere);
    if (x) { causes.push(_comprendreLesChiffresFicheLigne(f[1], x, fpt)); }
  });
  var groupes = [{ titre: 'Année après année', lignes: annees, signe: true }];
  if (causes.length >= 2) { groupes.push({ titre: 'Ce qui a joué en ' + derniere + ' (en points)', lignes: causes, signe: true, note: 'Les points s’additionnent : ensemble, ils donnent le pouvoir d’achat de l’année.' }); }
  var sens = an.n < 0 ? 'a baissé' : (an.n > 0 ? 'a augmenté' : 'est resté stable');
  var detail = _comprendreLesChiffresFichePara('Le pouvoir d’achat, c’est ce que les revenus d’un foyer permettent d’acheter une fois les prix pris en compte. Si les revenus montent moins vite que les prix, le pouvoir d’achat baisse, même si le salaire augmente.') +
    _comprendreLesChiffresFichePara('« Par unité de consommation » : l’Insee partage le revenu du foyer selon sa taille (1 pour la première personne adulte, 0,5 pour chaque autre adulte, 0,3 pour chaque enfant), pour comparer des foyers différents.') +
    _comprendreLesChiffresFichePara('C’est une moyenne pour toute la France : elle ne dit pas ce que vit chaque foyer, ni ce qui se passe dans votre département.', true) +
    _comprendreLesChiffresFicheBoutonsLexique([{ id: 'pouvoir-achat', libelle: 'Lire « Pouvoir d’achat » dans le Lexique' }, { id: 'inflation', libelle: 'Lire « Inflation » dans le Lexique' }]);
  return _comprendreLesChiffresFicheCarte({
    id: 'pouvoir-achat', q: 'Le pouvoir d’achat des ménages a-t-il augmenté ou baissé ?',
    grand: { texte: fs(an.n), src: an.src ? an.src.titre + ' : France' : '', unite: 'de pouvoir d’achat en ' + derniere + ' (par unité de consommation, France)' },
    tendance: (an.n < 0 ? '&#8600; ' : (an.n > 0 ? '&#8599; ' : '&#8594; ')) + 'Le pouvoir d’achat ' + sens + (prec ? ', après ' + fs(prec.n) + ' en ' + (derniere - 1) : '') + '.',
    groupes: groupes,
    extra: _comprendreLesChiffresFicheDepli('Comment lire ce chiffre ?', detail),
    sources: [an.src]
  });
}

// Smic : combien de salariés bénéficient de la revalorisation (Dares Résultats n° 44, 15 octobre 2026).
// La Dares ne compte pas « les salariés payés au Smic » : elle compte ceux dont la rémunération de base se trouvait entre l'ancien et le nouveau Smic.
// Tout vient du fichier smic-dares.md (outil de veille) ; un chiffre absent, ou un fichier sans vraie date, et la carte n'est pas affichée.
function _comprendreLesChiffresSmicCarteBeneficiaires(D) {
  var fp = function (n) { return _comprendreLesChiffresFormatPourcent(n, 1); };
  var v = function (champ) { return _comprendreLesChiffresFicheFrance(D, champ); };
  var tous = v('part_beneficiaires_smic'), prec = v('part_beneficiaires_smic_precedente'), partiel = v('part_beneficiaires_smic_temps_partiel'), complet = v('part_beneficiaires_smic_temps_complet');
  var tpe = v('part_beneficiaires_smic_tpe'), autres = v('part_beneficiaires_smic_autres'), femmes = v('part_femmes_beneficiaires_smic'), millions = v('beneficiaires_smic_millions');
  if (!tous) { return ''; }
  // Toutes les dates et tous les montants viennent du fichier (consigne 145) : le bloc periodes: pour les dates, les champs pour les montants.
  var cleSmic = (tous.src && tous.src.cle) || '';
  var quand = function (texte, cle) { return _comprendreLesChiffresPeriodeSubstituer(texte, D, cle || cleSmic); };
  var auDate = quand('{en_fin}');
  if (auDate === null) { return ''; }
  var ligne = function (nom, x, fort) { return _comprendreLesChiffresFicheLigne(nom, x, fp, fort); };
  var lignes = [ligne('Ensemble des salariés du privé', tous, true)];
  if (partiel) { lignes.push(ligne('Salariés à temps partiel', partiel)); }
  if (complet) { lignes.push(ligne('Salariés à temps complet', complet)); }
  if (tpe) { lignes.push(ligne('Entreprises de 1 à 9 salariés', tpe)); }
  if (autres) { lignes.push(ligne('Entreprises de 10 salariés ou plus', autres)); }
  lignes.sort(function (a, b) { return b.n - a.n; });
  var dateAvant = quand('le niveau de {fin}', 'smic-precedente');
  var tendance = prec && dateAvant !== null ? _comprendreLesChiffresPauvreteEcart(tous.n, prec.n, dateAvant + ' (' + fp(prec.n) + ')') : '';
  var ancien = v('smic_horaire_ancien'), nouveau = v('smic_horaire_nouveau'), femmesPrive = v('part_femmes_salaries_prive');
  var champ = v('salaries_champ_millions'), totalPrive = v('salaries_prive_millions');
  var finAvant = quand('fin {debut}');
  var montants = ancien && nouveau ? ' entre l’ancien Smic (' + _comprendreLesChiffresFormatEuros(ancien.n) + ' brut de l’heure) et le nouveau (' + _comprendreLesChiffresFormatEuros(nouveau.n) + ')' : ' entre l’ancien et le nouveau Smic';
  var detail = (finAvant !== null ? _comprendreLesChiffresFichePara('La Dares compte les salariés dont la rémunération de base, ' + finAvant + ', se trouvait' + montants + '. Certains touchent un peu plus grâce à des primes : ils sont comptés quand même.') : '') +
    (femmes ? _comprendreLesChiffresFichePara('Parmi ces salariés, <b>' + _comprendreLesChiffresEchappe(fp(femmes.n)) + '</b> sont des femmes' + (femmesPrive ? ' (elles sont ' + fp(femmesPrive.n) + ' des salariés du privé)' : '') + '.') : '') +
    _comprendreLesChiffresFichePara('Ne sont pas comptés : apprentis, stagiaires, intérimaires, agriculture, fonction publique, particuliers employeurs et Mayotte.' + (champ && totalPrive ? ' Le champ couvre ' + _comprendreLesChiffresFormatDecimal(champ.n, 1) + ' million' + (champ.n >= 2 ? 's' : '') + ' des ' + _comprendreLesChiffresFormatDecimal(totalPrive.n, 1) + ' millions de salariés.' : ''), true);
  return _comprendreLesChiffresFicheCarte({
    id: 'smic-beneficiaires', q: 'Combien de salariés sont concernés par la hausse du Smic ?',
    grand: { texte: fp(tous.n), src: tous.src ? tous.src.titre + ' : France' : '', unite: 'des salariés du privé' + (millions ? ', environ ' + _comprendreLesChiffresFormatDecimal(millions.n, 1) + ' million' + (millions.n >= 2 ? 's' : '') : '') + ', ' + auDate },
    tendance: tendance,
    groupes: [{ titre: 'Part des salariés qui bénéficient de la revalorisation', lignes: lignes }],
    extra: _comprendreLesChiffresFicheDepli('Comment lire ce chiffre ?', detail),
    sources: [tous.src]
  });
}

// Taux de pauvreté (Insee, Filosofi 2023) : part des habitants dont le niveau de vie est sous le seuil de 60 % de la médiane.
// On situe le territoire face au plus haut, au plus bas et à la France métropolitaine, sans rang ni jugement.
function _comprendreLesChiffresPauvreteAide() {
  return _comprendreLesChiffresFichePara('On parle de pauvreté monétaire quand le niveau de vie d’une personne est inférieur à 60 % du niveau de vie médian de la France métropolitaine. Le taux de pauvreté est la part des habitants dans ce cas : 17 % veut dire environ 17 personnes sur 100.') +
    _comprendreLesChiffresFichePara('C’est une mesure de revenu, pas un jugement sur les personnes : elle ne dit pas ce que coûtent le logement ou les courses, ni si une aide a été demandée.', true) +
    _comprendreLesChiffresFicheBoutonsLexique([{ id: 'niveau-de-vie', libelle: 'Lire « Niveau de vie » dans le Lexique' }, { id: 'mediane', libelle: 'Lire « Médiane » dans le Lexique' }]);
}
function _comprendreLesChiffresPauvreteEcart(n, ref, refLibelle) {
  var e = Math.round((n - ref) * 10) / 10;
  if (e === 0) { return '&#8594; au niveau de ' + refLibelle; }
  var pts = _comprendreLesChiffresFormatDecimal(Math.abs(e), 1) + ' point' + (Math.abs(e) >= 2 ? 's' : '');
  return e < 0 ? '&#8600; ' + pts + ' sous ' + refLibelle : '&#8599; ' + pts + ' au-dessus de ' + refLibelle;
}
function _comprendreLesChiffresPauvreteCarteTerritoire(N, niveau, nom, art) {
  var groupe = niveau === 'dep' ? 'departements' : 'regions';
  var france = _comprendreLesChiffresFicheFrance(N, 'taux_pauvrete');
  var fp = function (n) { return _comprendreLesChiffresFormatPourcent(n, 1); };
  var r = _comprendreLesChiffresFicheReperes({
    doc: N, groupe: groupe, champ: 'taux_pauvrete', nom: nom, france: france, fmt: fp,
    libelleHaut: 'le plus haut', libelleBas: 'le plus bas',
    libelleFrance: france ? france.nom : 'France métropolitaine'
  });
  if (!r) { return ''; }
  return _comprendreLesChiffresFicheCarte({
    id: 'pauv-' + niveau, q: 'Quelle part des habitants vit sous le seuil de pauvreté dans ' + art + ' ?',
    grand: { texte: fp(r.lu.n), src: r.lu.src ? r.lu.src.titre + ' : ' + r.lu.nom : '', unite: 'des habitants, taux de pauvreté' },
    tendance: _comprendreLesChiffresPauvreteEcart(r.lu.n, france.n, 'la France métropolitaine'),
    groupes: [{ lignes: r.lignes }], extra: _comprendreLesChiffresFicheDepli('Que veut dire « taux de pauvreté » ?', _comprendreLesChiffresPauvreteAide()),
    sources: [r.lu.src]
  });
}
function _comprendreLesChiffresPauvreteCarteFrance(N) {
  var fp = function (n) { return _comprendreLesChiffresFormatPourcent(n, 1); };
  var cl = _comprendreLesChiffresFicheClassement(N, 'departements', 'taux_pauvrete'), france = _comprendreLesChiffresFicheFrance(N, 'taux_pauvrete');
  if (cl.length < 11 || !france) { return ''; }
  var lf = _comprendreLesChiffresFicheLigne(france.nom, france, fp, true);
  var ligne = function (v) { return _comprendreLesChiffresFicheLigne(v.nom, v, fp); };
  return _comprendreLesChiffresFicheCarte({
    id: 'pauv-fr', q: 'Où le taux de pauvreté est-il le plus haut et le plus bas ?',
    grand: { texte: fp(france.n), src: france.src ? france.src.titre + ' : ' + france.nom : '', unite: 'des habitants, ' + france.nom },
    groupes: [
      { titre: 'Les cinq départements au taux le plus haut', lignes: cl.slice(0, 5).map(ligne).concat([lf]).sort(function (a, b) { return b.n - a.n; }) },
      { titre: 'Les cinq départements au taux le plus bas', lignes: cl.slice(-5).map(ligne).concat([lf]).sort(function (a, b) { return b.n - a.n; }) }
    ],
    extra: _comprendreLesChiffresFicheDepli('Que veut dire « taux de pauvreté » ?', _comprendreLesChiffresPauvreteAide()),
    sources: [france.src]
  });
}

// Nouvelle-Aquitaine et France : la région face aux autres (salaires).
function _comprendreLesChiffresSalaireCarteRegions(S) {
  return _comprendreLesChiffresSalaireCarteMoyen(S, 'na', 'Nouvelle-Aquitaine', 'la Nouvelle-Aquitaine');
}

// ---------- les cartes de l'Europe (Eurostat) ----------
// o : { id, q, champ, fmt, unite, note, pasDeLigne (texte « pays absents ») }
function _comprendreLesChiffresEuropeCarte(E, o) {
  var cl = _comprendreLesChiffresFicheClassement(E, 'pays', o.champ), fr = _comprendreLesChiffresFicheValeur(E, 'pays', 'France', o.champ);
  if (!fr || cl.length < 3) { return ''; }
  var haut = cl[0], bas = cl[cl.length - 1], lignes = [_comprendreLesChiffresFicheLigne('France', fr, o.fmt, true)];
  if (haut.nom !== 'France') { lignes.push(_comprendreLesChiffresFicheLigne(haut.nom + ' (le plus haut)', haut, o.fmt)); }
  if (bas.nom !== 'France') { lignes.push(_comprendreLesChiffresFicheLigne(bas.nom + ' (le plus bas)', bas, o.fmt)); }
  lignes.sort(function (a, b) { return b.n - a.n; });
  var tous = cl.map(function (v) { return _comprendreLesChiffresFicheLigne(v.nom, v, o.fmt, v.nom === 'France'); });
  var absents = [];
  (E.ordre.pays || []).forEach(function (cle) {
    if (!cl.some(function (v) { return _comprendreLesChiffresNorm(v.nom) === cle; })) { absents.push(E.groupes.pays[cle].nom); }
  });
  var cleSrc = fr.src && fr.src.cle, unite = _comprendreLesChiffresPeriodeSubstituer(o.unite, E, cleSrc), note = _comprendreLesChiffresPeriodeSubstituer(o.note, E, cleSrc);
  if (unite === null || note === null) { return ''; }
  if (absents.length) {
    note += (o.champ === 'salaire_minimum_mensuel' || o.champ === 'evolution_salaire_minimum')
      ? ' Les pays absents de la liste (' + _comprendreLesChiffresEchappe(absents.join(', ')) + ') n’ont pas de salaire minimum fixé pour tout le pays par la loi.'
      : ' Eurostat ne publie pas ce chiffre pour : ' + _comprendreLesChiffresEchappe(absents.join(', ')) + '.';
  }
  return _comprendreLesChiffresFicheCarte({
    id: o.id, q: o.q,
    grand: { texte: o.fmt(fr.n), src: fr.src ? fr.src.titre + ' : France' : '', unite: unite },
    tendance: '&#8594; entre ' + _comprendreLesChiffresEchappe(bas.nom) + ' (' + o.fmt(bas.n) + ') et ' + _comprendreLesChiffresEchappe(haut.nom) + ' (' + o.fmt(haut.n) + ')',
    groupes: [{ lignes: lignes, signe: !!o.signe }],
    extra: _comprendreLesChiffresFicheEncart(note) + _comprendreLesChiffresFicheDepli('Voir tous les pays (' + cl.length + ')',
      _comprendreLesChiffresVuesAssembler(o.id + '-tous', '', [{ lignes: tous, signe: !!o.signe }], null)),
    sources: [fr.src]
  });
}

function _comprendreLesChiffresCartesEurope(E) {
  return _comprendreLesChiffresEuropeCarte(E, {
    id: 'eu-salaire-minimum', q: 'Combien vaut le salaire minimum, pays par pays ?', champ: 'salaire_minimum_mensuel', fmt: _comprendreLesChiffresFicheEuros,
    unite: 'brut par mois, en France', note: 'Montants bruts par mois, en euros.'
  }) + _comprendreLesChiffresEuropeCarte(E, {
    id: 'eu-remuneration-nette', q: 'Combien gagne une personne qui touche le salaire moyen de son pays ?', champ: 'remuneration_nette_annuelle', fmt: _comprendreLesChiffresFicheEuros,
    unite: 'net par an, en France',
    note: 'Rémunération nette annuelle d’une personne seule, sans enfant, qui gagne le salaire moyen de son pays, en euros. Ce n’est pas le même calcul que les salaires de l’Insee : on ne compare pas les deux.'
  }) + _comprendreLesChiffresEuropeCarte(E, {
    id: 'eu-inflation', q: 'De combien les prix ont-ils augmenté en un an, pays par pays ?', champ: 'inflation_annuelle', fmt: function (n) { return _comprendreLesChiffresFormatPourcent(n, 1); },
    unite: 'de hausse des prix sur un an, en France',
    note: 'Hausse des prix à la consommation sur douze mois, mesurée de la même façon dans tous les pays (indice harmonisé d’Eurostat). Le chiffre de la France peut donc différer de celui de l’Insee, qui utilise un autre calcul.'
  }) + _comprendreLesChiffresEuropeCarte(E, {
    id: 'eu-niveau-des-prix', q: 'Les prix sont-ils plus hauts ou plus bas qu’ailleurs en Europe ?', champ: 'niveau_des_prix', fmt: _comprendreLesChiffresFicheIndice,
    unite: 'indice en France (100 = moyenne de l’Union européenne)',
    note: 'Indice : 100 correspond au niveau de prix moyen de l’Union européenne. Un indice de 108 veut dire des prix en moyenne 8 % plus hauts que cette moyenne. Cet indice compare les prix, pas les salaires : on ne l’oppose pas directement aux autres cartes.'
  });
}

// ---------- l'Europe : économie, emploi, entreprises et budget des ménages (Eurostat, europe-economie-eurostat.md) ----------
// Même carte que les salaires et les prix : la France, le pays le plus haut, le pays le plus bas, et tous les pays au clic.
// Chaque chiffre vient du fichier relevé par script (scripts/releveEuropeEconomieEurostat.py), jamais d'une valeur écrite à la main ;
// un chiffre absent pour la France, ou un fichier sans vraie date, et la carte n'est pas affichée.
var COMPRENDRE_LES_CHIFFRES_EUROPE_BLOCS = [
  { cle: 'ue-economie', t: 'L’économie et l’emploi en Europe',
    d: 'Croissance de l’économie, revenu des ménages (pouvoir d’achat), évolution de l’emploi et taux d’emploi : la France et les autres pays de l’Union européenne.' },
  { cle: 'ue-entreprises', t: 'Les entreprises en Europe',
    d: 'Créations d’entreprises, cessations d’activité et faillites : la France et les autres pays de l’Union européenne.' },
  { cle: 'ue-budget', t: 'Le budget des ménages en Europe',
    d: 'Part de l’alimentation, du logement et de l’énergie dans les dépenses des ménages : la France et les autres pays de l’Union européenne.' }
];
function _comprendreLesChiffresEuropeFmtSigne(n) { return (n > 0 ? '+' : '') + _comprendreLesChiffresFormatPourcent(n, 1); }
function _comprendreLesChiffresEuropeFmtPourcent(n) { return _comprendreLesChiffresFormatPourcent(n, 1); }
function _comprendreLesChiffresEuropeFmtSpa(n) { return _comprendreLesChiffresFormatDecimal(Math.round(n), 0) + ' SPA'; }

function _comprendreLesChiffresEuropeCartesDe(EE, groupe) {
  var sg = _comprendreLesChiffresEuropeFmtSigne, pc = _comprendreLesChiffresEuropeFmtPourcent, cartes = {
    salaires: [
      { id: 'eu-evolution-salaire-minimum', q: 'De combien le salaire minimum a-t-il augmenté en un an ?', champ: 'evolution_salaire_minimum', fmt: sg, signe: true,
        unite: 'd’augmentation du salaire minimum {entre}, en France',
        note: 'Calculé dans la monnaie de chaque pays, pour ne pas mêler les variations de change. Une hausse du salaire minimum n’est pas un gain de pouvoir d’achat : il faut la comparer à la hausse des prix (carte de l’inflation).' },
      { id: 'eu-evolution-remuneration', q: 'De combien a augmenté la rémunération nette d’une personne qui gagne le salaire moyen ?', champ: 'evolution_remuneration_nette', fmt: sg, signe: true,
        unite: 'd’évolution de la rémunération nette {entre}, en France',
        note: 'Rémunération nette (après impôts et cotisations) d’une personne seule, sans enfant, qui gagne le salaire moyen de son pays, en monnaie nationale. Elle dépend aussi des changements d’impôts et de cotisations, et ne dit rien de ce que gagne chaque personne.' }
    ],
    economie: [
      { id: 'eu-croissance', q: 'L’économie a-t-elle grandi, pays par pays ?', champ: 'croissance_pib', fmt: sg, signe: true,
        unite: 'de croissance de l’économie {en_fin}, en France',
        note: 'Le PIB est la richesse produite dans le pays pendant l’année, une fois la hausse des prix retirée. Ce chiffre dit comment l’économie va, pas ce que gagne chaque personne. Certains chiffres de {fin} sont encore provisoires.' },
      { id: 'eu-revenu-menages', q: 'De quel revenu les ménages disposent-ils pour vivre, pays par pays ?', champ: 'revenu_menages_spa', fmt: _comprendreLesChiffresEuropeFmtSpa,
        unite: 'par habitant {en_fin}, en France (revenu après impôts et aides)',
        note: 'Revenu disponible des ménages par habitant, après impôts et aides, exprimé en « standard de pouvoir d’achat » (SPA). Le SPA est une unité commune qui tient compte du coût de la vie dans chaque pays : elle permet de comparer ce que le revenu permet vraiment d’acheter. Ce n’est pas un montant en euros.' },
      { id: 'eu-evolution-emploi', q: 'L’emploi a-t-il progressé, pays par pays ?', champ: 'evolution_emploi', fmt: sg, signe: true,
        unite: 'd’évolution du nombre de personnes en emploi {en_fin}, en France',
        note: 'Variation du nombre de personnes qui ont un emploi, d’une année sur l’autre. Un chiffre bas ou négatif ne dit rien d’un métier ou d’une région en particulier.' },
      { id: 'eu-taux-emploi', q: 'Quelle part des 20 à 64 ans a un emploi, pays par pays ?', champ: 'taux_emploi', fmt: pc,
        unite: 'des 20 à 64 ans ont un emploi {en_fin}, en France',
        note: 'Part des personnes de 20 à 64 ans qui ont un emploi, selon l’enquête sur les forces de travail. Ce n’est pas le taux de chômage : les personnes qui étudient ou qui ne cherchent pas d’emploi comptent parmi celles qui n’en ont pas.' }
    ],
    entreprises: [
      { id: 'eu-creations', q: 'Combien d’entreprises se créent chaque année, pays par pays ?', champ: 'taux_creation_entreprises', fmt: pc,
        unite: 'des entreprises ont été créées {en_fin}, en France',
        note: 'Nombre d’entreprises créées dans l’année, divisé par le nombre d’entreprises en activité. Les règles de comptage varient d’un pays à l’autre (micro-entrepreneurs, sociétés sans activité) : lisez l’ordre de grandeur, pas la virgule.' },
      { id: 'eu-cessations', q: 'Combien d’entreprises arrêtent leur activité, pays par pays ?', champ: 'taux_cessation_entreprises', fmt: pc,
        unite: 'des entreprises ont cessé leur activité {en_fin}, en France',
        note: 'Une cessation d’activité n’est pas une faillite : l’entreprise peut s’arrêter parce que son dirigeant part à la retraite, qu’elle est reprise ou qu’elle n’avait plus d’activité. Chiffres provisoires, règles de comptage variables d’un pays à l’autre.' },
      { id: 'eu-faillites', q: 'Les faillites d’entreprises augmentent-elles ou baissent-elles ?', champ: 'evolution_faillites', fmt: sg, signe: true,
        unite: 'de déclarations de faillite en plus ou en moins {en_fin}, par rapport {en_debut}, en France',
        note: 'Variation du nombre de déclarations de faillite {entre}. Dans les petits pays, quelques dossiers suffisent à faire varier fortement le pourcentage. Une faillite est une décision de justice : ce n’est pas la même chose qu’une cessation d’activité.' }
    ],
    budget: [
      { id: 'eu-depenses-alimentation', q: 'Quelle part du budget des ménages va à l’alimentation, pays par pays ?', champ: 'part_depenses_alimentation', fmt: pc,
        unite: 'des dépenses des ménages vont aux produits alimentaires et boissons sans alcool {en_fin}, en France',
        note: 'Part des produits alimentaires et des boissons sans alcool dans l’ensemble des dépenses de consommation des ménages. Cette part dépend du niveau de vie et des prix du pays : une part plus haute ne veut pas dire qu’on mange plus.' },
      { id: 'eu-depenses-logement', q: 'Quelle part du budget des ménages va au logement, pays par pays ?', champ: 'part_depenses_logement', fmt: pc,
        unite: 'des dépenses des ménages vont au logement, à l’eau et à l’énergie du logement {en_fin}, en France',
        note: 'Part du logement, de l’eau, de l’électricité, du gaz et des autres combustibles dans l’ensemble des dépenses des ménages : l’énergie du logement est comprise dans ce chiffre. Il comprend aussi un loyer calculé pour les propriétaires qui habitent leur logement (convention de la comptabilité nationale) : il ne se lit donc pas comme un loyer réellement payé.' },
      { id: 'eu-depenses-energie', q: 'Quelle part du budget des ménages va à l’électricité et au gaz, pays par pays ?', champ: 'part_depenses_energie', fmt: pc,
        unite: 'des dépenses des ménages vont à l’électricité, au gaz et aux autres combustibles {en_fin}, en France',
        note: 'Cette part est comprise dans la carte du logement. Eurostat ne la publie à part, pour tous les pays, que jusqu’à {fin} : une année de forte hausse des prix de l’énergie, donc plus haute qu’une année ordinaire. Elle ne se compare pas directement aux deux autres cartes de ce bloc, qui datent de {fin@eurostat-depenses-logement}.' }
    ]
  };
  return (cartes[groupe] || []).map(function (o) { return _comprendreLesChiffresEuropeCarte(EE, o); }).join('');
}

// Les trois blocs repliables de l'Union européenne (économie et emploi, entreprises, budget des ménages).
function _comprendreLesChiffresRenduBlocsEurope() {
  var EE = _comprendreLesChiffresFicheDoc('europeEconomie');
  if (!EE) { return ''; }
  var verifie = _comprendreLesChiffresDateEnClair(EE.verifie_le);
  var fraicheur = '<p class="comprendre-les-chiffres-note"><span class="comprendre-les-chiffres-fraicheur">&#128197; Eurostat : relevé le ' + _comprendreLesChiffresEchappe(verifie) + '.</span></p>';
  var groupes = { 'ue-economie': 'economie', 'ue-entreprises': 'entreprises', 'ue-budget': 'budget' };
  return COMPRENDRE_LES_CHIFFRES_EUROPE_BLOCS.map(function (b) {
    var cartes = _comprendreLesChiffresEuropeCartesDe(EE, groupes[b.cle]);
    if (!cartes) { return ''; }
    var corps = '<p class="comprendre-les-chiffres-section-intro">Ces chiffres situent la France parmi les pays de l’Union européenne : ce sont des <b>repères</b>, sans classement ni jugement. ' +
      'Choisissez, carte par carte, de les lire en chiffres ou en barres.</p>' + cartes + fraicheur;
    return _comprendreLesChiffresRenduBlocRepliable(b.cle, b.t, b.d, corps, _comprendreLesChiffresEstVueEnsemble());
  }).join('');
}

// ---------- le bloc ----------
function _comprendreLesChiffresRenduSalaires() {
  var niveau = _comprendreLesChiffresNiveauCourant(), cartes = '', docs = [], titre, desc;
  if (niveau === 'ue') {
    var E = _comprendreLesChiffresFicheDoc('europe'), EE = _comprendreLesChiffresFicheDoc('europeEconomie');
    if (E) { cartes = _comprendreLesChiffresCartesEurope(E); docs.push(['Eurostat', E]); }
    if (EE) {
      cartes += _comprendreLesChiffresEuropeCartesDe(EE, 'salaires');
      if (!E) { docs.push(['Eurostat', EE]); }
    }
    titre = 'Les salaires et les prix en Europe';
    desc = 'Salaire minimum, rémunération nette d’une personne qui gagne le salaire moyen, niveau des prix : la France et les autres pays de l’Union européenne.';
  } else {
    var S = _comprendreLesChiffresFicheDoc('salaires'), N = _comprendreLesChiffresFicheDoc('niveauVie');
    var code = _comprendreLesChiffresTerritoireDuNiveau(), nomDep = COMPRENDRE_LES_CHIFFRES_DEP_NOMS[code] || '', art = _comprendreLesChiffresLibelleNiveau();
    var c = [];
    if (S) {
      if (niveau === 'dep') {
        c.push(_comprendreLesChiffresSalaireCarteMoyen(S, 'dep', nomDep, art), _comprendreLesChiffresSalaireCarteMetiers(S, 'dep', nomDep, art), _comprendreLesChiffresSalaireCarteSexes(S, 'dep', nomDep, art));
      } else if (niveau === 'na') {
        c.push(_comprendreLesChiffresSalaireCarteRegions(S),
          _comprendreLesChiffresSalaireCarteDepartementsRegion(S, COMPRENDRE_LES_CHIFFRES_DEP_NOMS[_comprendreLesChiffresDepartementCourant()] || ''), _comprendreLesChiffresSalaireCarteMetiers(S, 'na', 'Nouvelle-Aquitaine', art), _comprendreLesChiffresSalaireCarteSexes(S, 'na', 'Nouvelle-Aquitaine', art));
      } else {
        c.push(_comprendreLesChiffresSalaireCarteExtremes(S), _comprendreLesChiffresSalaireCarteEmploisFrance(S), _comprendreLesChiffresSalaireCarteSexesFrance(S));
      }
    }
    if (N) {
      if (niveau === 'dep') { c.push(_comprendreLesChiffresNiveauVieCarteTerritoire(N, 'dep', nomDep, art), _comprendreLesChiffresPauvreteCarteTerritoire(N, 'dep', nomDep, art)); }
      else if (niveau === 'na') {
        c.push(_comprendreLesChiffresNiveauVieCarteTerritoire(N, 'na', 'Nouvelle-Aquitaine', art), _comprendreLesChiffresPauvreteCarteTerritoire(N, 'na', 'Nouvelle-Aquitaine', art),
          _comprendreLesChiffresNiveauVieCarteDepartementsRegion(N, COMPRENDRE_LES_CHIFFRES_DEP_NOMS[_comprendreLesChiffresDepartementCourant()] || ''));
      } else { c.push(_comprendreLesChiffresNiveauVieCarteFrance(N), _comprendreLesChiffresPauvreteCarteFrance(N)); }
    }
    if (S) { c.push(_comprendreLesChiffresSalaireCarteMediane(S)); }
    cartes = c.join('');
    if (S) { docs.push(['Salaires', S]); }
    if (N) { docs.push(['Niveau de vie', N]); }
    titre = COMPRENDRE_LES_CHIFFRES_SALAIRES_BLOC.t;
    desc = 'Ce que gagnent les salariés du privé, le niveau de vie des habitants, et comment ' + art + ' se situe : sans classement, avec des repères.';
  }
  if (!cartes) { return ''; }
  var fraicheur = docs.map(function (d) { return d[0] + ' : vérifiés le ' + _comprendreLesChiffresEchappe(_comprendreLesChiffresDateEnClair(d[1].verifie_le)); }).join(' ; ');
  var corps = '<p class="comprendre-les-chiffres-section-intro">Ces chiffres sont des <b>moyennes et des repères</b> : ils décrivent un territoire, jamais ce que vous devriez gagner ni ce que vaut un métier. ' +
    'Choisissez, carte par carte, de les lire en chiffres ou en barres.</p>' + cartes +
    '<p class="comprendre-les-chiffres-note"><span class="comprendre-les-chiffres-fraicheur">&#128197; ' + fraicheur + '.</span></p>';
  return _comprendreLesChiffresRenduBlocRepliable('salaires', titre, desc, corps, _comprendreLesChiffresEstVueEnsemble());
}

// ============================================================
// MA FICHE DE CHIFFRES (consigne 121, 2026-11-06)
// ============================================================
// Un bouton « Ajouter à ma fiche » sur chaque carte de chiffre : la personne met de côté
// les chiffres qu'elle juge importants pour préparer son argumentaire (négocier un salaire,
// appuyer une demande d'aide ou un projet, montrer qu'elle connaît son territoire). Chaque
// chiffre garde sa source et sa date. RIEN n'est enregistré sur l'appareil (poste partagé) :
// la fiche vit le temps de la page ; pour la garder, on la copie ou on l'imprime.
// Les boutons sont posés après le rendu, sur toute carte qui a une question et un chiffre :
// aucune carte n'a besoin d'être modifiée une à une.
var COMPRENDRE_LES_CHIFFRES_FICHE_BLOC = {
  t: 'Ma fiche de chiffres',
  d: 'Mettre de côté les chiffres importants pour préparer un entretien, une demande d’aide ou un projet : copier ou imprimer, chacun avec sa source.'
};
var _comprendreLesChiffresMaFicheChoix = [];

function _comprendreLesChiffresMaFicheNet(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

// Les éléments d'une carte qui lui appartiennent vraiment (le bloc du Smic, par exemple, vit DANS la carte du chômage : il a sa propre carte).
function _comprendreLesChiffresMaFichePropres(carte, selecteur) {
  return [].filter.call(carte.querySelectorAll(selecteur), function (el) { return el.closest('.comprendre-les-chiffres-indic') === carte; });
}

// Le résumé d'une carte faite de lignes (portrait du territoire) : « Titre du groupe : ligne valeur ; ligne valeur. » ; vide si la carte n'a pas de lignes.
function _comprendreLesChiffresMaFicheResumeGroupes(carte) {
  var groupes = _comprendreLesChiffresMaFichePropres(carte, '.comprendre-les-chiffres-vues-groupe').filter(function (g) {
    var panneau = g.closest('[data-comprendre-les-chiffres-panneau]');
    return !panneau || panneau.getAttribute('data-comprendre-les-chiffres-panneau') === 'chiffres';
  });
  var morceaux = [];
  groupes.forEach(function (g) {
    var titre = g.querySelector('.comprendre-les-chiffres-vues-titre');
    var lignes = [].map.call(g.querySelectorAll('.comprendre-les-chiffres-ligne'), function (l) {
      var lib = l.querySelector('.comprendre-les-chiffres-ligne-lib'), val = l.querySelector('.comprendre-les-chiffres-ligne-val');
      return lib && val ? _comprendreLesChiffresMaFicheNet(lib.textContent) + ' ' + _comprendreLesChiffresMaFicheNet(val.textContent) : '';
    }).filter(Boolean);
    if (lignes.length) { morceaux.push((titre ? _comprendreLesChiffresMaFicheNet(titre.textContent) + ' : ' : '') + lignes.join(' ; ')); }
  });
  return morceaux.join('. ');
}

// Ce que la fiche retient d'une carte : sa question, son chiffre (avec la flèche en toutes lettres), sa source.
function _comprendreLesChiffresMaFicheDepuisCarte(carte) {
  var q = _comprendreLesChiffresMaFichePropres(carte, '.comprendre-les-chiffres-indic-q')[0];
  var v = _comprendreLesChiffresMaFichePropres(carte, '.comprendre-les-chiffres-indic-valeur')[0];
  // Une carte du portrait n'a pas de « grand chiffre » : elle compare des lignes. La fiche retient alors ses lignes, groupe par groupe (consigne 146, A4b).
  var resume = v ? '' : _comprendreLesChiffresMaFicheResumeGroupes(carte);
  if (!q || (!resume && (!v || !_comprendreLesChiffresMaFicheNet(v.textContent)))) { return null; }
  var t = _comprendreLesChiffresMaFichePropres(carte, '.comprendre-les-chiffres-tendance')[0];
  var tendance = t ? _comprendreLesChiffresMaFicheNet(t.textContent).replace(/^[^A-Za-zÀ-ÿ0-9]+/, '') : '';
  var sources = [];
  _comprendreLesChiffresMaFichePropres(carte, '.comprendre-les-chiffres-source').forEach(function (s) {
    // la ligne de source porte maintenant le lien « Ouvrir la page » ET le bouton « Ajouter à ma fiche » : on les retire tous les deux
    var clone = s.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('a, button'), function (a) { a.parentNode.removeChild(a); });
    var txt = _comprendreLesChiffresMaFicheNet(clone.textContent).replace(/^D['’]apr[eè]s\s+/i, '').replace(/\.$/, '');
    if (txt && sources.indexOf(txt) < 0) { sources.push(txt); }
  });
  if (!sources.length) {
    // cartes dont la source est un lien « Source : ... » dans la note, ou une bulle sur le chiffre
    var lien = _comprendreLesChiffresMaFichePropres(carte, 'a.comprendre-les-chiffres-pastille')[0];
    if (lien) { sources.push(_comprendreLesChiffresMaFicheNet(lien.textContent).replace(/^Source\s*:\s*/i, '')); }
  }
  if (!sources.length && v) {
    var c = v.querySelector('.chiffre');
    if (c && c.getAttribute('data-source')) { sources.push(c.getAttribute('data-source')); }
  }
  var question = _comprendreLesChiffresMaFicheNet(q.textContent), territoire = _comprendreLesChiffresLibelleNiveauCourt();
  return {
    cle: territoire + '|' + question, q: question, territoire: territoire,
    valeur: resume || (_comprendreLesChiffresMaFicheNet(v.textContent) + (tendance ? ' (' + tendance + ')' : '')),
    source: sources.slice(0, 2).join(' ; ')
  };
}

function _comprendreLesChiffresMaFicheEstChoisie(cle) {
  return _comprendreLesChiffresMaFicheChoix.some(function (x) { return x.cle === cle; });
}

function _comprendreLesChiffresMaFicheMajBoutons() {
  document.querySelectorAll('[data-comprendre-les-chiffres-fiche-ajouter]').forEach(function (btn) {
    var dedans = _comprendreLesChiffresMaFicheEstChoisie(btn.getAttribute('data-comprendre-les-chiffres-fiche-ajouter'));
    btn.classList.toggle('ajoute', dedans);
    btn.setAttribute('aria-pressed', dedans ? 'true' : 'false');
    btn.innerHTML = dedans ? '<i class="bi bi-check2"></i> Dans ma fiche' : '<i class="bi bi-plus-circle"></i> Ajouter à ma fiche';
  });
  _comprendreLesChiffresMaFicheMajAcces();
}

// Pose le bouton à la fin de chaque carte (une carte dans une autre a le sien).
function _comprendreLesChiffresInstallerBoutonsFiche() {
  document.querySelectorAll('.comprendre-les-chiffres-contenu .comprendre-les-chiffres-indic').forEach(function (carte) {
    // Le bouton de CETTE carte (une carte dans une autre a le sien) : au bout de la ligne de source, ou à défaut à la fin de la carte.
    var dejaPose = Array.prototype.some.call(carte.querySelectorAll('[data-comprendre-les-chiffres-fiche-ajouter]'), function (b) { return b.closest('.comprendre-les-chiffres-indic') === carte; });
    if (dejaPose) { return; }
    var item = _comprendreLesChiffresMaFicheDepuisCarte(carte);
    if (!item) { return; }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'comprendre-les-chiffres-fiche-bouton';
    btn.setAttribute('data-comprendre-les-chiffres-fiche-ajouter', item.cle);
    // Espace gagné (consigne 128) : le bouton se range sur la même ligne que « Ouvrir la page » quand la carte a une ligne de source qui lui appartient.
    var source = Array.prototype.filter.call(carte.children, function (e) { return e.classList && e.classList.contains('comprendre-les-chiffres-source'); }).pop();
    if (source) { btn.classList.add('dans-la-source'); source.appendChild(btn); } else { carte.appendChild(btn); }
    btn.addEventListener('click', function () {
      var maintenant = _comprendreLesChiffresMaFicheDepuisCarte(carte) || item;
      if (_comprendreLesChiffresMaFicheEstChoisie(maintenant.cle)) {
        _comprendreLesChiffresMaFicheChoix = _comprendreLesChiffresMaFicheChoix.filter(function (x) { return x.cle !== maintenant.cle; });
      } else {
        _comprendreLesChiffresMaFicheChoix.push(maintenant);
        if (typeof trackEvenement === 'function') { trackEvenement('comprendre_les_chiffres_fiche_ajout'); }
      }
      _comprendreLesChiffresMaFicheMajBoutons();
      _comprendreLesChiffresMaFicheDessiner();
    });
  });
  _comprendreLesChiffresMaFicheMajBoutons();
}

// Le texte à copier : une ligne par chiffre, avec son territoire et sa source.
function _comprendreLesChiffresMaFicheTexte(choix, dateIso) {
  var d = _comprendreLesChiffresDateEnClair(dateIso);
  var l = ['Ma fiche de chiffres' + (d ? ', au ' + d : ''), 'Chiffres officiels, avec leur source. Ils décrivent un territoire, pas une personne.', ''];
  (choix || []).forEach(function (x, i) {
    l.push((i + 1) + '. ' + x.territoire + ' : ' + x.q + ' ' + x.valeur + (x.source ? '. Source : ' + x.source + '.' : '.'));
  });
  return l.join('\n');
}

// La page imprimée (consigne 129) : un seul bloc propre, noir sur blanc, avec la date du jour, chaque chiffre suivi de sa source.
// Construite à l'impression puis retirée : le reste de l'application n'est pas imprimé (pas de pages blanches).
function _comprendreLesChiffresMaFicheImpressionHTML(choix, dateIso) {
  var e = _comprendreLesChiffresEchappe, d = _comprendreLesChiffresDateEnClair(dateIso);
  return '<h1>Ma fiche de chiffres</h1>' +
    (d ? '<p class="imp-date">Établie le ' + e(d) + '</p>' : '') +
    '<p class="imp-intro">Chiffres officiels, avec leur source. Ils décrivent un territoire, pas une personne.</p>' +
    '<ol>' + (choix || []).map(function (x) {
      return '<li><strong>' + e(x.territoire) + ' : ' + e(x.q) + '</strong> ' + e(x.valeur) + (x.source ? '<span class="imp-src">Source : ' + e(x.source) + '</span>' : '') + '</li>';
    }).join('') + '</ol>';
}

// Le bouton d'accès rapide (« Ma fiche (3) ») : visible dès qu'un chiffre est choisi, mène à la rubrique.
function _comprendreLesChiffresMaFicheAccesHTML() {
  var n = _comprendreLesChiffresMaFicheChoix.length;
  return '<div class="comprendre-les-chiffres-fiche-acces" id="comprendreLesChiffresFicheAcces"' + (n ? '' : ' hidden') + '>' +
    '<button type="button" class="comprendre-les-chiffres-fiche-bouton" data-comprendre-les-chiffres-fiche-voir="1"><i class="bi bi-card-checklist"></i> Voir ma fiche (<span id="comprendreLesChiffresFicheNombre">' + n + '</span>)</button></div>';
}
function _comprendreLesChiffresMaFicheMajAcces() {
  var zone = document.getElementById('comprendreLesChiffresFicheAcces'), n = _comprendreLesChiffresMaFicheChoix.length;
  if (!zone) { return; }
  zone.hidden = !n;
  var nb = document.getElementById('comprendreLesChiffresFicheNombre');
  if (nb) { nb.textContent = String(n); }
}

function _comprendreLesChiffresMaFicheListeHTML() {
  if (!_comprendreLesChiffresMaFicheChoix.length) {
    return '<p class="comprendre-les-chiffres-note" id="comprendreLesChiffresFicheVide">Aucun chiffre pour l’instant. Utilisez « Ajouter à ma fiche » sur une carte.</p>';
  }
  return _comprendreLesChiffresMaFicheChoix.map(function (x) {
    return '<div class="comprendre-les-chiffres-fiche-ligne"><div><strong>' + _comprendreLesChiffresEchappe(x.territoire) + ' : ' + _comprendreLesChiffresEchappe(x.q) + '</strong> ' +
      _comprendreLesChiffresEchappe(x.valeur) +
      (x.source ? '<span class="comprendre-les-chiffres-fiche-src">Source : ' + _comprendreLesChiffresEchappe(x.source) + '</span>' : '') + '</div>' +
      '<button type="button" class="comprendre-les-chiffres-fiche-retirer" data-comprendre-les-chiffres-fiche-retirer="' + _comprendreLesChiffresEchappe(x.cle) + '" aria-label="Retirer de ma fiche : ' + _comprendreLesChiffresEchappe(x.q) + '"><i class="bi bi-x-lg"></i> Retirer</button></div>';
  }).join('');
}

function _comprendreLesChiffresMaFicheActionsHTML() {
  if (!_comprendreLesChiffresMaFicheChoix.length) { return ''; }
  return '<div class="comprendre-les-chiffres-fiche-actions d-flex flex-wrap gap-2 mt-2">' +
    '<button type="button" class="comprendre-les-chiffres-fiche-bouton" data-comprendre-les-chiffres-fiche-action="copier"><i class="bi bi-clipboard"></i> Copier le texte</button>' +
    '<button type="button" class="comprendre-les-chiffres-fiche-bouton" data-comprendre-les-chiffres-fiche-action="imprimer"><i class="bi bi-printer"></i> Imprimer</button>' +
    '<button type="button" class="comprendre-les-chiffres-fiche-bouton" data-comprendre-les-chiffres-fiche-action="vider"><i class="bi bi-trash"></i> Vider la fiche</button></div>';
}

function _comprendreLesChiffresMaFicheDessiner() {
  var zone = document.getElementById('comprendreLesChiffresFicheCorps');
  if (!zone) { return; }
  zone.innerHTML = _comprendreLesChiffresMaFicheListeHTML() + _comprendreLesChiffresMaFicheActionsHTML();
  _comprendreLesChiffresMaFicheBrancherZone(zone);
}

function _comprendreLesChiffresMaFicheBrancherZone(zone) {
  zone.querySelectorAll('[data-comprendre-les-chiffres-fiche-retirer]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cle = this.getAttribute('data-comprendre-les-chiffres-fiche-retirer');
      _comprendreLesChiffresMaFicheChoix = _comprendreLesChiffresMaFicheChoix.filter(function (x) { return x.cle !== cle; });
      _comprendreLesChiffresMaFicheMajBoutons();
      _comprendreLesChiffresMaFicheDessiner();
    });
  });
  zone.querySelectorAll('[data-comprendre-les-chiffres-fiche-action]').forEach(function (b) {
    b.addEventListener('click', function () {
      var action = this.getAttribute('data-comprendre-les-chiffres-fiche-action'), btn = this;
      if (action === 'vider') {
        _comprendreLesChiffresMaFicheChoix = [];
        _comprendreLesChiffresMaFicheMajBoutons();
        _comprendreLesChiffresMaFicheDessiner();
      } else if (action === 'copier') {
        var texte = _comprendreLesChiffresMaFicheTexte(_comprendreLesChiffresMaFicheChoix, new Date().toISOString().slice(0, 10));
        if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(texte, null); }
        var avant = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check2"></i> Copié';
        setTimeout(function () { btn.innerHTML = avant; }, 2000);
        if (typeof trackEvenement === 'function') { trackEvenement('comprendre_les_chiffres_fiche_copie'); }
      } else if (action === 'imprimer') {
        // Seule la fiche sort sur le papier : un bloc d'impression dédié est posé, le reste de la page est masqué (feuille de style du module), puis tout est retiré.
        var page = document.createElement('div');
        page.id = 'impression-fiche-chiffres';
        page.innerHTML = _comprendreLesChiffresMaFicheImpressionHTML(_comprendreLesChiffresMaFicheChoix, new Date().toISOString().slice(0, 10));
        document.body.appendChild(page);
        document.body.classList.add('imprimer-fiche-chiffres');
        var fin = function () {
          document.body.classList.remove('imprimer-fiche-chiffres');
          if (page.parentNode) { page.parentNode.removeChild(page); }
          window.removeEventListener('afterprint', fin);
        };
        window.addEventListener('afterprint', fin);
        window.print();
        fin();
      }
    });
  });
}

function _comprendreLesChiffresRenduFiche() {
  return '<section class="comprendre-les-chiffres-fiche" id="comprendre-les-chiffres-ma-fiche">' +
    '<h2 class="comprendre-les-chiffres-section">' + _comprendreLesChiffresEchappe(COMPRENDRE_LES_CHIFFRES_FICHE_BLOC.t) + '</h2>' +
    '<p class="comprendre-les-chiffres-section-intro">Ces chiffres viennent de sources officielles, avec leur date. Ils décrivent un territoire, pas une personne. ' +
    'Vous pouvez les citer dans un échange, un dossier ou un entretien. <strong>Rien n’est enregistré sur cet appareil</strong> : si vous voulez garder la fiche, copiez-la ou imprimez-la avant de quitter la page.</p>' +
    '<div id="comprendreLesChiffresFicheCorps">' + _comprendreLesChiffresMaFicheListeHTML() + _comprendreLesChiffresMaFicheActionsHTML() + '</div>' +
    '<details class="comprendre-les-chiffres-depli mt-3"><summary><span class="comprendre-les-chiffres-depli-titre">Comment m’en servir ?</span>' +
    '<span class="comprendre-les-chiffres-depli-clic">Cliquez pour ouvrir</span></summary><div class="comprendre-les-chiffres-depli-corps">' +
    _comprendreLesChiffresFichePara('<strong>Pour parler de salaire.</strong> Ces chiffres situent un territoire ou un grand groupe d’emplois. Ils ne remplacent ni les offres du même métier, ni la convention collective : servez-vous-en pour montrer que vous connaissez la réalité du territoire, pas pour fixer un montant.') +
    _comprendreLesChiffresFichePara('<strong>Pour appuyer une demande d’aide ou un projet.</strong> Citez le chiffre, sa source et sa date : c’est ce qui le rend crédible. La décision revient à la personne ou à l’organisme qui examine le dossier.') +
    _comprendreLesChiffresFichePara('<strong>Pour un professionnel.</strong> Chaque chiffre est daté et sourcé : il peut être joint à un dossier ou cité pour expliquer les difficultés d’un territoire.', true) +
    '</div></details>' +
    _comprendreLesChiffresFicheEncart('Un chiffre situe, il ne décide de rien et ne classe personne.') +
    '</section>';
}

function _comprendreLesChiffresBrancherMaFiche() {
  _comprendreLesChiffresInstallerBoutonsFiche();
  document.querySelectorAll('[data-comprendre-les-chiffres-fiche-voir]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = document.getElementById('comprendre-les-chiffres-ma-fiche');
      if (s && s.scrollIntoView) { s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
  var zone = document.getElementById('comprendreLesChiffresFicheCorps');
  if (zone) { _comprendreLesChiffresMaFicheBrancherZone(zone); }
}

function _comprendreLesChiffresRenduAccueil() {
  var estUE = _comprendreLesChiffresNiveauCourant() === 'ue';
  var html = '<div class="comprendre-les-chiffres-accueil">' +
    '<div class="text-center mb-3">' +
      '<h1><i class="bi bi-bar-chart"></i> Comprendre les chiffres</h1>' +
    '</div>' + _comprendreLesChiffresMaFicheAccesHTML() +
    _comprendreLesChiffresRenduBasculeVue() +
    _comprendreLesChiffresRenduBandeauDepartement() +
    _comprendreLesChiffresRenduNiveaux() +
    '<div class="comprendre-les-chiffres-contenu">' +
    '<p class="comprendre-les-chiffres-note" id="comprendreLesChiffresAideToucher"><i class="bi bi-hand-index"></i> Touchez un chiffre en bleu pour voir d’où il vient (sa source). Touchez-le encore, ou touchez ailleurs, pour fermer.</p>';

  if (estUE) {
    html += _comprendreLesChiffresRenduBlocSmic();
    html += _comprendreLesChiffresRenduSalaires();
    html += _comprendreLesChiffresRenduBlocsEurope();
    html += _comprendreLesChiffresRenduVueUE();
  } else {
    html += _comprendreLesChiffresRenduVueEnsemble();
    html += _comprendreLesChiffresRenduCouche1();
    html += _comprendreLesChiffresRenduSalaires();
    html += _comprendreLesChiffresRenduMethode();
    html += _comprendreLesChiffresRenduCouche2();

    html += _comprendreLesChiffresRenduCroiser();
    html += _comprendreLesChiffresRenduCouche3();
    html += _comprendreLesChiffresRenduEncartPrudence();
  }

  html += _comprendreLesChiffresRenduFiche();

  html += '<h2 class="comprendre-les-chiffres-section">Une autre question sur les chiffres</h2>' +
    '<p class="comprendre-les-chiffres-section-intro">Pour un chiffre précis qui n’est pas ci-dessus. <strong>Ces réponses-là ne sont pas enregistrées</strong> : elles sont traitées en direct.</p>' +
    '<button type="button" class="comprendre-les-chiffres-porte" data-comprendre-les-chiffres-porte="A">' +
      '<span class="titre"><i class="bi bi-search"></i> J’ai une question chiffrée précise</span>' +
      '<span class="quoi">Exemple : « le salaire moyen dans la restauration ici », « le chômage des moins de 25 ans sur trois ans ». Une réponse, un graphique.</span>' +
    '</button>' +
    '<button type="button" class="comprendre-les-chiffres-porte" data-comprendre-les-chiffres-porte="B">' +
      '<span class="titre"><i class="bi bi-map"></i> Je veux comprendre mon territoire</span>' +
      '<span class="quoi">Un panorama plus large du marché du travail local, en plusieurs sujets que vous choisissez de creuser. Plutôt pour un professionnel de l’insertion.</span>' +
    '</button>' +
    '</div>';
  return html + '</div>';
}

function _comprendreLesChiffresBrancherAccueil() {
  _comprendreLesChiffresBrancherEntreprises();
  _comprendreLesChiffresBrancherMaFiche();
  _comprendreLesChiffresBrancherBmo();
  _comprendreLesChiffresBrancherVues();
  var btnDep = document.querySelector('[data-comprendre-les-chiffres-changer-departement]');
  if (btnDep) {
    btnDep.addEventListener('click', function () {
      if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); }
      if (typeof demanderDepartementSiInconnu === 'function') {
        demanderDepartementSiInconnu(function () { pageComprendreLesChiffres(); });
      }
    });
  }
  document.querySelectorAll('[data-comprendre-les-chiffres-vue]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLesChiffresEtat.vue = this.getAttribute('data-comprendre-les-chiffres-vue');
      pageComprendreLesChiffres();
    });
  });
  document.querySelectorAll('[data-comprendre-les-chiffres-niveau]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLesChiffresEtat.niveau = this.getAttribute('data-comprendre-les-chiffres-niveau');
      pageComprendreLesChiffres();
    });
  });
  document.querySelectorAll('[data-comprendre-les-chiffres-porte]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLesChiffresEtat.ecran = (this.getAttribute('data-comprendre-les-chiffres-porte') === 'B') ? 'porteB' : 'porteA';
      pageComprendreLesChiffres();
    });
  });
  document.querySelectorAll('[data-comprendre-les-chiffres-croiser]').forEach(function (input) {
    input.addEventListener('change', _comprendreLesChiffresCroiserMaj);
  });
  document.querySelectorAll('[data-comprendre-les-chiffres-croiser-periode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _comprendreLesChiffresCroiserBasculerPeriode(this.getAttribute('data-comprendre-les-chiffres-croiser-periode'));
    });
  });
  if (document.getElementById('comprendreLesChiffresCroiser')) { _comprendreLesChiffresCroiserMaj(); }
  var btnImp = document.querySelector('[data-comprendre-les-chiffres-imprimer]');
  if (btnImp) { btnImp.addEventListener('click', function () { window.print(); }); }
  document.querySelectorAll('[data-comprendre-les-chiffres-vers]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cible = document.getElementById(this.getAttribute('data-comprendre-les-chiffres-vers'));
      if (cible) { cible.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  });
  _comprendreLesChiffresBrancherInfobulleChiffres();
  _comprendreLesChiffresRendreChiffresAccessibles();
}

// ============================================================
// BLOCS 7-8 : « Une autre question sur les chiffres » (partie B)
// ============================================================

// Territoire mis en phrase pour un texte de recherche (3 couches, jamais
// mélanger les départements - même règle que « Comprendre le cadre »).
function _comprendreLesChiffresTerritoirePourPrompt() {
  var dep = _comprendreLesChiffresDepartementCourant();
  var noms = { '24': 'la Dordogne', '87': 'la Haute-Vienne' };
  if (dep && noms[dep]) {
    return 'Territoire : ' + noms[dep] + '. Distingue toujours le département, la région (Nouvelle-Aquitaine) et la France entière. Ne mélange jamais les départements.';
  }
  return 'Territoire : la France entière. Précise si un chiffre ne vaut que pour certaines régions ou certains départements.';
}

var COMPRENDRE_LES_CHIFFRES_SOCLE_PROMPT =
  'Nous sommes le ' + new Date().toISOString().slice(0, 10) + '. Recherche web obligatoire : si tu ne peux pas ' +
  'consulter le web, dis-le et ne réponds pas. N\'utilise que des pages officielles que tu as réellement ouvertes ' +
  '(INSEE, DARES, France Travail, Eurostat, CAF, Cap Métiers...). Ne fabrique jamais une adresse, un chiffre ni une ' +
  'date : si tu ne l\'as pas vu, écris « à vérifier ». Réponds en français, en phrases courtes, sans jargon. Pas ' +
  'd\'avis sur la personne : tu décris un territoire.';

// Liens vers les assistants (sans compte d'abord).
function _comprendreLesChiffresRenduAssistants() {
  if (typeof ASSISTANTS_IA === 'undefined') { return ''; }
  var sans = (typeof ASSISTANTS_SANS_COMPTE_IA !== 'undefined') ? ASSISTANTS_SANS_COMPTE_IA : [];
  var lien = function (a) {
    return '<a class="comprendre-les-chiffres-assistant" href="' + a.url + '" target="_blank" rel="noopener">' +
      _comprendreLesChiffresEchappe(a.nom) + '</a>';
  };
  var listeSans = ASSISTANTS_IA.filter(function (a) { return sans.indexOf(a.id) !== -1; });
  var listeCompte = ASSISTANTS_IA.filter(function (a) { return sans.indexOf(a.id) === -1; });
  return '<div class="comprendre-les-chiffres-assistants">' +
    (listeSans.length ? '<span class="comprendre-les-chiffres-note">Sans compte :</span> ' + listeSans.map(lien).join('') : '') +
    (listeCompte.length ? ' <span class="comprendre-les-chiffres-note">Avec un compte :</span> ' + listeCompte.map(lien).join('') : '') +
    '</div>';
}

// Encart « ne collez pas d'information personnelle ».
function _comprendreLesChiffresEncartPrive() {
  return '<div class="comprendre-les-chiffres-encart"><i class="bi bi-lock"></i> N’écrivez pas votre nom ni d’information personnelle. Décrivez seulement le chiffre ou le sujet que vous cherchez. <b>Rien n’est enregistré</b> : ces réponses sont traitées en direct.</div>';
}

// ---- Porte A : une question chiffrée précise (un temps) ----

function _comprendreLesChiffresRenduPorteA() {
  return '' +
    _comprendreLesChiffresRenduBoutonRetour('Revenir aux chiffres') +
    '<h1><i class="bi bi-search"></i> Une question chiffrée précise</h1>' +
    _comprendreLesChiffresEncartPrive() +
    '<p><b>Quel chiffre cherchez-vous ?</b></p>' +
    '<textarea id="comprendreLesChiffresPorteAQuestion" class="comprendre-les-chiffres-zone" rows="3" ' +
    'placeholder="Par exemple : le salaire net moyen dans l’aide à domicile en Dordogne, et son évolution sur trois ans."></textarea>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteAPreparer">Préparer le texte de recherche &#8594;</button></div>' +

    '<div id="comprendreLesChiffresPorteAEtape2" hidden>' +
    '<h3>Le texte de recherche</h3>' +
    '<p class="comprendre-les-chiffres-note">L’application a préparé ce texte. Vous n’avez rien à rédiger.</p>' +
    '<div class="comprendre-les-chiffres-prompt" id="comprendreLesChiffresPorteAPrompt"></div>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteACopier"><i class="bi bi-clipboard"></i> Copier le texte</button></div>' +
    _comprendreLesChiffresRenduAssistants() +
    '<h3>Coller la réponse de l’assistant</h3>' +
    '<textarea id="comprendreLesChiffresPorteAReponse" class="comprendre-les-chiffres-zone" rows="5" placeholder="Collez ici la réponse..."></textarea>' +
    '<p class="comprendre-les-chiffres-croiser-alerte" id="comprendreLesChiffresPorteAErr" hidden>Collez d’abord la réponse de l’assistant.</p>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteAAfficher">Afficher le résultat</button></div>' +
    '<div id="comprendreLesChiffresPorteAResultat" hidden></div>' +
    '</div>';
}

function _comprendreLesChiffresPromptPorteA(question) {
  return COMPRENDRE_LES_CHIFFRES_SOCLE_PROMPT + '\n\n' +
    'Une personne accompagnée en insertion cherche un chiffre précis. Sa demande : « ' + question + ' »\n\n' +
    _comprendreLesChiffresTerritoirePourPrompt() + '\n\n' +
    'Donne : la dernière valeur connue, sa date exacte, la source officielle, la série des 6 à 8 derniers trimestres ' +
    'si elle existe, et deux ou trois points d’attention pour bien lire ce chiffre.\n\n' +
    'Termine par un bloc entre [CHIFFRES] et [/CHIFFRES] : indicateur, territoire, valeur, date_donnee, serie, source ' +
    '(nom-court | titre | https://adresse | AAAA-MM-JJ).';
}

function _comprendreLesChiffresRenduResultatPorteA(brut) {
  var m = brut.match(/\[CHIFFRES[^\]]*\]([\s\S]*?)\[\/CHIFFRES\]/i);
  var html = '<div class="comprendre-les-chiffres-carte-teinte">';
  var texteAvant = m ? brut.slice(0, m.index).trim() : brut.trim();
  if (texteAvant) { html += _comprendreLesChiffresRenduTexteLibre(texteAvant); }

  if (m) {
    // Une entrée = un groupe de lignes « champ: valeur » séparé par une
    // ligne vide. On affiche la première qui a une valeur.
    var champs = {};
    m[1].split('\n').forEach(function (ln) {
      var km = ln.match(/^\s*(indicateur|territoire|valeur|date_donnee|serie|source)\s*:\s*(.+)$/i);
      if (km && !champs[km[1].toLowerCase()]) { champs[km[1].toLowerCase()] = km[2].trim(); }
    });
    if (champs.valeur) {
      html += '<p class="comprendre-les-chiffres-indic-q" style="margin-bottom:0">' +
        _comprendreLesChiffresEchappe(champs.indicateur || 'Résultat') + '</p>' +
        '<p class="comprendre-les-chiffres-indic-valeur"><span class="chiffre">' + _comprendreLesChiffresEchappe(champs.valeur) + '</span></p>';
      var meta = [];
      if (champs.territoire) { meta.push(champs.territoire); }
      if (champs.date_donnee) { meta.push(champs.date_donnee); }
      if (meta.length) { html += '<p class="comprendre-les-chiffres-note">' + _comprendreLesChiffresEchappe(meta.join(' - ')) + '</p>'; }
      var serie = _comprendreLesChiffresParserSerie(champs.serie || '');
      if (serie.length >= 2) {
        html += _comprendreLesChiffresRenduGraphe({ serie: serie, sourceNom: (champs.source || '').split('|')[0].trim() });
      }
      if (champs.source) {
        var url = (champs.source.match(/https?:\/\/\S+/) || [''])[0].replace(/[.,;]+$/, '');
        var nom = champs.source.replace(/\s*\|\s*https?:\/\/\S+.*/, '').replace(/\s*\|\s*/g, ', ').replace(/[,\s]+$/, '').trim();
        html += _comprendreLesChiffresRenduSource({ sourceNom: nom, sourceUrl: url, date: '' });
      }
    }
  }
  html += '<p class="comprendre-les-chiffres-note"><i class="bi bi-info-circle"></i> Cette recherche n’est pas enregistrée. Copiez-la si vous voulez la garder.</p></div>';
  return html;
}

function _comprendreLesChiffresBrancherPorteA() {
  _comprendreLesChiffresBrancherRetour(_comprendreLesChiffresAllerVersPrecedent);
  var q = document.getElementById('comprendreLesChiffresPorteAQuestion');
  var btnPrep = document.getElementById('comprendreLesChiffresPorteAPreparer');
  var etape2 = document.getElementById('comprendreLesChiffresPorteAEtape2');
  if (btnPrep && q && etape2) {
    var maj = function () { btnPrep.disabled = q.value.trim().length < 8; };
    q.addEventListener('input', maj); maj();
    btnPrep.addEventListener('click', function () {
      document.getElementById('comprendreLesChiffresPorteAPrompt').textContent = _comprendreLesChiffresPromptPorteA(q.value.trim());
      etape2.hidden = false;
    });
  }
  _comprendreLesChiffresBrancherCopie('comprendreLesChiffresPorteACopier', 'comprendreLesChiffresPorteAPrompt');
  var btnAff = document.getElementById('comprendreLesChiffresPorteAAfficher');
  var rep = document.getElementById('comprendreLesChiffresPorteAReponse');
  var err = document.getElementById('comprendreLesChiffresPorteAErr');
  var res = document.getElementById('comprendreLesChiffresPorteAResultat');
  if (btnAff && rep && res) {
    btnAff.addEventListener('click', function () {
      var brut = rep.value.trim();
      if (brut.length < 15) { if (err) { err.hidden = false; } return; }
      if (err) { err.hidden = true; }
      res.innerHTML = _comprendreLesChiffresRenduResultatPorteA(brut);
      res.hidden = false;
    });
  }
}

// ---- Porte B : comprendre mon territoire (deux temps) ----

function _comprendreLesChiffresRenduPorteB() {
  return '' +
    _comprendreLesChiffresRenduBoutonRetour('Revenir aux chiffres') +
    '<h1><i class="bi bi-map"></i> Comprendre mon territoire</h1>' +
    _comprendreLesChiffresEncartPrive() +
    '<p><b>Premier temps.</b> Décrivez ce que vous voulez comprendre (un bassin d’emploi, un public, un secteur...). L’application prépare un texte qui demande à l’assistant un <b>panorama en plusieurs sujets courts</b>, pas un avis.</p>' +
    '<textarea id="comprendreLesChiffresPorteBTexte" class="comprendre-les-chiffres-zone" rows="3" ' +
    'placeholder="Par exemple : je veux comprendre le marché de l’emploi autour de Bergerac pour des personnes peu qualifiées."></textarea>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteBPreparer">Préparer le texte de recherche &#8594;</button></div>' +

    '<div id="comprendreLesChiffresPorteBEtape2" hidden>' +
    '<h3>Le texte de recherche (premier temps)</h3>' +
    '<div class="comprendre-les-chiffres-prompt" id="comprendreLesChiffresPorteBPrompt1"></div>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteBCopier1"><i class="bi bi-clipboard"></i> Copier le texte</button></div>' +
    _comprendreLesChiffresRenduAssistants() +
    '<h3>Coller la réponse</h3>' +
    '<textarea id="comprendreLesChiffresPorteBReponse1" class="comprendre-les-chiffres-zone" rows="5" placeholder="Collez ici la réponse..."></textarea>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteBVoirSujets">Voir les sujets</button></div>' +
    '</div>' +

    '<div id="comprendreLesChiffresPorteBEtape3" hidden>' +
    '<h3>Deuxième temps : ce que vous voulez creuser</h3>' +
    '<p class="comprendre-les-chiffres-note">Cochez les sujets qui vous intéressent.</p>' +
    '<div id="comprendreLesChiffresPorteBSujets"></div>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteBPreparer2">Préparer le second texte &#8594;</button></div>' +
    '<div id="comprendreLesChiffresPorteBEtape4" hidden>' +
    '<div class="comprendre-les-chiffres-prompt" id="comprendreLesChiffresPorteBPrompt2"></div>' +
    '<div class="btn-rangee"><button type="button" class="btn btn-primary" id="comprendreLesChiffresPorteBCopier2"><i class="bi bi-clipboard"></i> Copier le texte</button></div>' +
    '<p class="comprendre-les-chiffres-note"><i class="bi bi-info-circle"></i> Vous collez la réponse chez l’assistant. Rien n’est enregistré ici.</p>' +
    '</div>' +
    '</div>';
}

function _comprendreLesChiffresPromptPorteB1(texte) {
  return COMPRENDRE_LES_CHIFFRES_SOCLE_PROMPT + '\n\n' +
    'Je prépare un panorama du marché du travail local pour un professionnel de l’insertion. Ce que je veux ' +
    'comprendre : « ' + texte + ' »\n\n' + _comprendreLesChiffresTerritoirePourPrompt() + '\n\n' +
    'Ne donne pas d’avis. Repère 4 à 8 SUJETS COURTS à creuser (le poids des secteurs, les contrats proposés, ' +
    'les publics déjà nombreux à chercher un emploi, les tensions de recrutement...). Pour chaque sujet, une ' +
    'phrase de résumé, sans chiffre pour l’instant.\n\n' +
    'Termine par un bloc entre [SUJETS] et [/SUJETS], un sujet par ligne, sous la forme « - titre : résumé ».';
}

function _comprendreLesChiffresPromptPorteB2(texte, sujets) {
  return COMPRENDRE_LES_CHIFFRES_SOCLE_PROMPT + '\n\n' +
    'Suite du panorama : « ' + texte +' »\n\n' + _comprendreLesChiffresTerritoirePourPrompt() + '\n\n' +
    'Creuse SEULEMENT ces sujets :\n' + sujets.map(function (s) { return '- ' + s; }).join('\n') + '\n\n' +
    'Pour chacun : les chiffres utiles avec leur date et leur source officielle, et deux ou trois points ' +
    'd’attention. Pas d’avis, pas de conclusion sur une personne.';
}

function _comprendreLesChiffresBrancherPorteB() {
  _comprendreLesChiffresBrancherRetour(_comprendreLesChiffresAllerVersPrecedent);
  var t = document.getElementById('comprendreLesChiffresPorteBTexte');
  var btnPrep = document.getElementById('comprendreLesChiffresPorteBPreparer');
  var etape2 = document.getElementById('comprendreLesChiffresPorteBEtape2');
  if (btnPrep && t && etape2) {
    var maj = function () { btnPrep.disabled = t.value.trim().length < 10; };
    t.addEventListener('input', maj); maj();
    btnPrep.addEventListener('click', function () {
      document.getElementById('comprendreLesChiffresPorteBPrompt1').textContent = _comprendreLesChiffresPromptPorteB1(t.value.trim());
      etape2.hidden = false;
    });
  }
  _comprendreLesChiffresBrancherCopie('comprendreLesChiffresPorteBCopier1', 'comprendreLesChiffresPorteBPrompt1');

  var btnSujets = document.getElementById('comprendreLesChiffresPorteBVoirSujets');
  var rep1 = document.getElementById('comprendreLesChiffresPorteBReponse1');
  var etape3 = document.getElementById('comprendreLesChiffresPorteBEtape3');
  var boiteSujets = document.getElementById('comprendreLesChiffresPorteBSujets');
  if (btnSujets && rep1 && etape3 && boiteSujets) {
    btnSujets.addEventListener('click', function () {
      var brut = rep1.value.trim();
      var m = brut.match(/\[SUJETS\]([\s\S]*?)\[\/SUJETS\]/i);
      var lignes = (m ? m[1] : brut).split('\n')
        .map(function (l) { return l.replace(/^\s*[-*]\s*/, '').trim(); })
        .filter(function (l) { return l.length > 3; }).slice(0, 10);
      if (!lignes.length) { return; }
      boiteSujets.innerHTML = lignes.map(function (l, i) {
        return '<label class="comprendre-les-chiffres-sujet"><input type="checkbox" value="' + _comprendreLesChiffresEchappe(l) + '" checked> ' + _comprendreLesChiffresEchappe(l) + '</label>';
      }).join('');
      etape3.hidden = false;
    });
  }
  var btnPrep2 = document.getElementById('comprendreLesChiffresPorteBPreparer2');
  var etape4 = document.getElementById('comprendreLesChiffresPorteBEtape4');
  if (btnPrep2 && boiteSujets && etape4) {
    btnPrep2.addEventListener('click', function () {
      var choisis = Array.prototype.slice.call(boiteSujets.querySelectorAll('input:checked')).map(function (i) { return i.value; });
      if (!choisis.length) { return; }
      document.getElementById('comprendreLesChiffresPorteBPrompt2').textContent =
        _comprendreLesChiffresPromptPorteB2((t ? t.value.trim() : ''), choisis);
      etape4.hidden = false;
    });
  }
  _comprendreLesChiffresBrancherCopie('comprendreLesChiffresPorteBCopier2', 'comprendreLesChiffresPorteBPrompt2');
}

// Bouton « Copier le texte » : copie le textContent d'un élément, retour
// visuel « Copié » 2 s.
function _comprendreLesChiffresBrancherCopie(btnId, sourceId) {
  var btn = document.getElementById(btnId);
  var src = document.getElementById(sourceId);
  if (!btn || !src) { return; }
  btn.addEventListener('click', function () {
    var txt = src.textContent;
    var ok = function () {
      var av = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check2"></i> Copié';
      setTimeout(function () { btn.innerHTML = av; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(ok, ok); }
    else { ok(); }
  });
}

// ============================================================
// ROUTEUR
// ============================================================

// ------------------------------------------------------------
// Fleche « Precedent » du navigateur (retour Denis 2026-10-16, brique B.24 de docs/BRIQUES_COMMUNES.md).
// Les ecrans du module (accueil, porte A, porte B) se deduisent de _comprendreLesChiffresEtat.ecran et sont dessines par pageComprendreLesChiffres() :
// chaque dessin appelle _comprendreLesChiffresSynchroniserHistorique(), chaque changement d'ecran devient une entree de l'historique.
// Le niveau (departement, region, France, Europe) et la vue (simple, ensemble) restent DANS l'accueil : seul l'ecran est remis.
// ------------------------------------------------------------
function _comprendreLesChiffresSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function') { return; }
  historiqueInterneSynchroniser('comprendre-les-chiffres', { cle: _comprendreLesChiffresEtat.ecran, ecran: _comprendreLesChiffresEtat.ecran });
}

function _comprendreLesChiffresRestaurerHistorique(instantane) {
  _comprendreLesChiffresEtat.ecran = instantane.ecran;
  _comprendreLesChiffresDetourPresentation = false;
}

// js/app.js est charge APRES ce fichier : le module s'inscrit au premier dessin de la page, pas au chargement.
function _comprendreLesChiffresInscrireHistorique() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher('comprendre-les-chiffres', _comprendreLesChiffresRestaurerHistorique); }
}


function pageComprendreLesChiffres() {
  _comprendreLesChiffresDetourPresentation = false;
  _comprendreLesChiffresInscrireHistorique();
  if (!_comprendreLesChiffresEtat.niveau) { _comprendreLesChiffresEtat.niveau = 'dep'; }

  var corpsHTML, brancherCorps, evenement;

  if (!_comprendreLesChiffresTerritoireConnu()) {
    corpsHTML = _comprendreLesChiffresRenduChoixTerritoire();
    brancherCorps = _comprendreLesChiffresBrancherChoixTerritoire;
    evenement = 'comprendre_les_chiffres_territoire_demande';
  } else if (_comprendreLesChiffresEtat.ecran === 'porteA') {
    corpsHTML = _comprendreLesChiffresRenduPorteA();
    brancherCorps = _comprendreLesChiffresBrancherPorteA;
    evenement = 'comprendre_les_chiffres_porte_a_affichee';
  } else if (_comprendreLesChiffresEtat.ecran === 'porteB') {
    corpsHTML = _comprendreLesChiffresRenduPorteB();
    brancherCorps = _comprendreLesChiffresBrancherPorteB;
    evenement = 'comprendre_les_chiffres_porte_b_affichee';
  } else {
    // Accueil : déclenche le chargement des contenus si pas encore fait.
    if (_comprendreLesChiffresChargement === 'inactif') { _comprendreLesChiffresChargerDigest(); }
    if (_comprendreLesChiffresMethodeEtat === 'inactif') { _comprendreLesChiffresChargerMethode(); }
    if (_comprendreLesChiffresNiveauCourant() === 'ue') {
      if (_comprendreLesChiffresUEEtat === 'inactif') { _comprendreLesChiffresChargerDoc('ue'); }
    } else if (_comprendreLesChiffresPortraitEtat === 'inactif') {
      _comprendreLesChiffresChargerDoc('portrait');
    }
    if (_comprendreLesChiffresEntreprisesEtat === 'inactif') { _comprendreLesChiffresChargerEntreprises(); }
    _comprendreLesChiffresChargerFichesDuNiveau();
    if (_comprendreLesChiffresSmicChargement === 'inactif' || _comprendreLesChiffresSmicChargement === 'erreur') { _comprendreLesChiffresChargerSmic(); }
    if (_comprendreLesChiffresBmoChargement === 'inactif' || _comprendreLesChiffresBmoChargement === 'erreur') { _comprendreLesChiffresChargerBmo(); }
    corpsHTML = _comprendreLesChiffresRenduAccueil();
    brancherCorps = _comprendreLesChiffresBrancherAccueil;
    evenement = 'comprendre_les_chiffres_accueil_affiche';
  }

  app.innerHTML = '<div class="page-catalogue-contenu">' + _comprendreLesChiffresRenduEnTete() + corpsHTML + '</div>' + _comprendreLesChiffresRenduPiedFixe();
  _comprendreLesChiffresSynchroniserHistorique();
  brancherCorps();
  var btnRevoir = document.getElementById('btnComprendreLesChiffresRevoirIntro');
  if (btnRevoir) { btnRevoir.addEventListener('click', _comprendreLesChiffresRevoirPresentation); }
  if (typeof trackEvenement === 'function') { trackEvenement(evenement); }
}

function _comprendreLesChiffresBrancherChoixTerritoire() {
  if (typeof demanderDepartementSiInconnu !== 'function') { return; }
  var declencher = function () {
    demanderDepartementSiInconnu(function () { pageComprendreLesChiffres(); });
  };
  var btn = document.querySelector('[data-comprendre-les-chiffres-choisir-territoire]');
  if (btn) { btn.addEventListener('click', declencher); }
  // Un clic (ou Entrée / Espace) n'importe où dans l'aperçu verrouillé
  // rouvre la fenêtre de choix du département. Le contenu interne est
  // `inert` : c'est bien le conteneur qui reçoit l'événement.
  var apercu = document.querySelector('[data-comprendre-les-chiffres-apercu]');
  if (apercu) {
    apercu.addEventListener('click', declencher);
    apercu.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        declencher();
      }
    });
  }
}

window.pageComprendreLesChiffres = pageComprendreLesChiffres;

// Export CommonJS protege -- tests/comprendreLesChiffresLogique.test.js
// (Node), aucun effet sur le chargement navigateur classique (balise
// <script>, ou `module` n'est jamais defini).
if (typeof module !== 'undefined') {
  module.exports = {
    _comprendreLesChiffresParserZonesEmploi: _comprendreLesChiffresParserZonesEmploi,
    _comprendreLesChiffresParserDigest: _comprendreLesChiffresParserDigest,
    _comprendreLesChiffresParserDocAnnuel: _comprendreLesChiffresParserDocAnnuel,
    _comprendreLesChiffresParserFiche: _comprendreLesChiffresParserFiche,
    _comprendreLesChiffresRenduEcartsGenerique: _comprendreLesChiffresRenduEcartsGenerique,
    _comprendreLesChiffresRenduGraphe: _comprendreLesChiffresRenduGraphe,
    _comprendreLesChiffresTendance: _comprendreLesChiffresTendance,
    _comprendreLesChiffresNombre: _comprendreLesChiffresNombre,
    _comprendreLesChiffresFormatNombre: _comprendreLesChiffresFormatNombre,
    _comprendreLesChiffresParserEntreprises: _comprendreLesChiffresParserEntreprises,
    _comprendreLesChiffresEvolutionEntiers: _comprendreLesChiffresEvolutionEntiers,
    _comprendreLesChiffresDateEnClair: _comprendreLesChiffresDateEnClair,
    _comprendreLesChiffresPeriodeEnClair: _comprendreLesChiffresPeriodeEnClair,
    _comprendreLesChiffresSmicEtat: _comprendreLesChiffresSmicEtat,
    _comprendreLesChiffresBmoEtat: _comprendreLesChiffresBmoEtat,
    _comprendreLesChiffresRenduCarteBmo: _comprendreLesChiffresRenduCarteBmo,
    _comprendreLesChiffresFormatEuros: _comprendreLesChiffresFormatEuros,
    _comprendreLesChiffresFormatPourcent: _comprendreLesChiffresFormatPourcent,
    _comprendreLesChiffresRenduCarteSmic: _comprendreLesChiffresRenduCarteSmic,
    _comprendreLesChiffresRenduCarteInflation: _comprendreLesChiffresRenduCarteInflation,
    _comprendreLesChiffresVuesAssembler: _comprendreLesChiffresVuesAssembler,
    _comprendreLesChiffresVuesBarresHTML: _comprendreLesChiffresVuesBarresHTML,
    _comprendreLesChiffresVuesCamembertHTML: _comprendreLesChiffresVuesCamembertHTML,
    _comprendreLesChiffresVuesPct: _comprendreLesChiffresVuesPct,
    _comprendreLesChiffresParserFiches: _comprendreLesChiffresParserFiches,
    _comprendreLesChiffresPeriodeLire: _comprendreLesChiffresPeriodeLire,
    _comprendreLesChiffresPeriodeMots: _comprendreLesChiffresPeriodeMots,
    _comprendreLesChiffresPeriodeSubstituer: _comprendreLesChiffresPeriodeSubstituer,
    _comprendreLesChiffresPeriodeUnique: _comprendreLesChiffresPeriodeUnique,
    _comprendreLesChiffresPlageAnnees: _comprendreLesChiffresPlageAnnees,
    _comprendreLesChiffresPositionFourchette: _comprendreLesChiffresPositionFourchette,
    COMPRENDRE_LES_CHIFFRES_CROISABLES: COMPRENDRE_LES_CHIFFRES_CROISABLES,
    COMPRENDRE_LES_CHIFFRES_PORTRAIT_CHIFFRES_CARTES: COMPRENDRE_LES_CHIFFRES_PORTRAIT_CHIFFRES_CARTES,
    COMPRENDRE_LES_CHIFFRES_FICHES_FICHIERS: COMPRENDRE_LES_CHIFFRES_FICHES_FICHIERS,
    _comprendreLesChiffresFicheValeur: _comprendreLesChiffresFicheValeur,
    _comprendreLesChiffresFicheFrance: _comprendreLesChiffresFicheFrance,
    _comprendreLesChiffresFicheClassement: _comprendreLesChiffresFicheClassement,
    _comprendreLesChiffresFicheEcart: _comprendreLesChiffresFicheEcart,
    _comprendreLesChiffresSalaireCarteMoyen: _comprendreLesChiffresSalaireCarteMoyen,
    _comprendreLesChiffresSalaireCarteExtremes: _comprendreLesChiffresSalaireCarteExtremes,
    _comprendreLesChiffresSalaireCarteMediane: _comprendreLesChiffresSalaireCarteMediane,
    _comprendreLesChiffresNiveauVieCarteTerritoire: _comprendreLesChiffresNiveauVieCarteTerritoire,
    _comprendreLesChiffresPauvreteCarteTerritoire: _comprendreLesChiffresPauvreteCarteTerritoire,
    _comprendreLesChiffresPauvreteCarteFrance: _comprendreLesChiffresPauvreteCarteFrance,
    _comprendreLesChiffresSmicCarteBeneficiaires: _comprendreLesChiffresSmicCarteBeneficiaires,
    _comprendreLesChiffresPouvoirAchatCarte: _comprendreLesChiffresPouvoirAchatCarte,
    _comprendreLesChiffresRenduCarteEntreprises: _comprendreLesChiffresRenduCarteEntreprises,
    _comprendreLesChiffresCartesEurope: _comprendreLesChiffresCartesEurope,
    _comprendreLesChiffresEuropeCartesDe: _comprendreLesChiffresEuropeCartesDe,
    _comprendreLesChiffresRenduBlocsEurope: _comprendreLesChiffresRenduBlocsEurope,
    _comprendreLesChiffresUEGroupe: _comprendreLesChiffresUEGroupe,
    _comprendreLesChiffresUEGroupesFreins: _comprendreLesChiffresUEGroupesFreins,
    _comprendreLesChiffresMaFicheTexte: _comprendreLesChiffresMaFicheTexte,
    _comprendreLesChiffresMaFicheImpressionHTML: _comprendreLesChiffresMaFicheImpressionHTML
  };
}
