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

function _comprendreLesChiffresRenduEnTete() {
  return '' +
    (typeof barreEtapesModule === 'function'
      ? barreEtapesModule(COMPRENDRE_LES_CHIFFRES_ETAPES, _comprendreLesChiffresIndexEtape())
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
      var m = (e.reste || '').match(/A,?\s*B\s*et\s*C\s*:\s*environ\s*([\d\s ]+?)\s*personnes?\s*;\s*en\s*(baisse|hausse)\s*d[’']environ\s*([\d,]+)\s*%/i);
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

  var yPlein = yAt(5);
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
    '<text class="comprendre-les-chiffres-courbe-plein-lab" x="' + (W - padD) + '" y="' + (yPlein - 3).toFixed(1) + '" text-anchor="end">plein emploi (~5 %)</text>' +
    '<line class="comprendre-les-chiffres-courbe-guide" x1="0" y1="' + yTop + '" x2="0" y2="' + y0 + '"></line>' +
    gs + labs + '</svg>' +
    '<div class="comprendre-les-chiffres-courbe-infobulle" hidden></div>' +
    '</div>' +
    '<p class="comprendre-les-chiffres-note">Cliquez sur un territoire pour ajouter ou retirer sa courbe. Déplacez la souris sur le graphe : l’année la plus proche s’affiche avec la valeur de chaque territoire visible. Ligne pointillée : le plein emploi (~5 %).</p>';
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
function _comprendreLesChiffresBrancherInfobulleChiffres() {
  if (_comprendreLesChiffresBrancherInfobulleChiffres._fait) { return; }
  _comprendreLesChiffresBrancherInfobulleChiffres._fait = true;
  document.addEventListener('mouseover', function (evt) {
    var el = evt.target.closest && evt.target.closest('.comprendre-les-chiffres-contenu .chiffre');
    if (!el) { return; }
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
    var box = _comprendreLesChiffresInfobulleElement();
    box.textContent = 'Source : ' + (src || 'voir la source en bas de ce bloc');
    box.style.display = 'block';
    var x = evt.clientX + 14, y = evt.clientY + 14;
    if (x + 280 > window.innerWidth) { x = evt.clientX - 280; }
    box.style.left = x + 'px';
    box.style.top = y + 'px';
  });
  document.addEventListener('mouseout', function (evt) {
    if (evt.target.closest && evt.target.closest('.comprendre-les-chiffres-contenu .chiffre')) {
      _comprendreLesChiffresGrapheInfobulleMasquer();
    }
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

// Une carte-indicateur (maquette : .indic).
function _comprendreLesChiffresRenduCarte(carte, entrees) {
  var cible = _comprendreLesChiffresTerritoireDuNiveau();
  var choisirTerr = function (code, preferMetro) {
    var trouve = null;
    if (code === 'fr' && preferMetro) {
      entrees.forEach(function (x) {
        if (x.terr === 'fr' && /m[eé]tropolitaine/i.test(x.labelBrut) && !trouve) { trouve = x; }
      });
    }
    entrees.forEach(function (x) { if (x.terr === code && !trouve) { trouve = x; } });
    return trouve;
  };
  var e = choisirTerr(cible, cible === 'fr');
  var idAttr = ' id="comprendre-les-chiffres-carte-' + carte.slug + '"';
  var d = _comprendreLesChiffresDigest;

  var corps = '<p class="comprendre-les-chiffres-indic-q">' + _comprendreLesChiffresEchappe(carte.q) + '</p>';

  if (!e || !e.valeur) {
    var msg = (e && e.note)
      ? 'Ce chiffre n’est pas encore disponible pour ce territoire. Il sera ajouté au prochain trimestre.'
      : 'Ce chiffre n’est pas publié à ce niveau de lecture. Changez de niveau ci-dessus pour le voir.';
    corps += '<p class="comprendre-les-chiffres-indic-absent"><i class="bi bi-hourglass-split"></i> ' + msg + '</p>';
    if (e && e.sourceNom) { corps += _comprendreLesChiffresRenduSource(e); }
    return '<div class="comprendre-les-chiffres-indic"' + idAttr + '>' + corps + '</div>';
  }

  var srcAttr = e.sourceNom ? ' data-source="' + _comprendreLesChiffresEchappe(e.sourceNom + (e.date ? ' - ' + e.date : '')) + '"' : '';
  corps += '<p class="comprendre-les-chiffres-indic-valeur"><span class="chiffre"' + srcAttr + '>' +
    _comprendreLesChiffresEchappe(e.valeur) + '</span></p>';

  var tend = _comprendreLesChiffresTendance(carte, e);
  if (tend) {
    corps += '<span class="comprendre-les-chiffres-tendance">' + tend.fleche + ' ' + tend.mot + '</span>';
  }

  var phrase = carte.phrase(e);
  if (phrase) { corps += '<p class="comprendre-les-chiffres-indic-phrase">' + phrase + '</p>'; }

  var cmp = [];
  if (e.precedent) { cmp.push('<b>Il y a un trimestre :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(e.precedent) + '</span>'); }
  if (e.anPrecedent) { cmp.push('<b>il y a un an :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(e.anPrecedent) + '</span>'); }
  if (cmp.length) { corps += '<p class="comprendre-les-chiffres-compare">' + cmp.join(' &nbsp;&bull;&nbsp; ') + '</p>'; }

  // Comparaison région / France quand on lit au niveau département, et
  // seulement pour les indicateurs en pourcentage (comparer « 17 500
  // personnes » ou « 51 000 offres » d'un département à un total national
  // n'a pas de sens sans rapporter à la population - maquette : seules les
  // cartes chômage et longue durée ont cette ligne).
  if (carte.comparerTerr && _comprendreLesChiffresNiveauCourant() === 'dep') {
    var autres = [];
    var na = choisirTerr('na');
    if (na && na.valeur && _comprendreLesChiffresMemeNature(e.valeur, na.valeur)) {
      autres.push('<b>Nouvelle-Aquitaine :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(na.valeur) + '</span>');
    }
    var fr = choisirTerr('fr', true);
    if (fr && fr.valeur && _comprendreLesChiffresMemeNature(e.valeur, fr.valeur)) {
      autres.push('<b>France :</b> <span class="chiffre">' + _comprendreLesChiffresEchappe(fr.valeur) + '</span>');
    }
    if (autres.length) { corps += '<p class="comprendre-les-chiffres-compare">' + autres.join(' &nbsp;&bull;&nbsp; ') + '</p>'; }
  }

  var rep = _comprendreLesChiffresRepere(carte, e, choisirTerr);
  if (rep) {
    corps += '<p class="comprendre-les-chiffres-repere">' + _comprendreLesChiffresEchappe(rep) + '</p>';
  }

  if (carte.encart) {
    corps += '<div class="comprendre-les-chiffres-encart small"><i class="bi bi-info-circle"></i> ' +
      _comprendreLesChiffresEchappe(carte.encart) + '</div>';
  }

  if (carte.slug === 'chomage' && _comprendreLesChiffresEstVueEnsemble()) {
    corps += '<p class="comprendre-les-chiffres-a-lire-avec"><i class="bi bi-link-45deg"></i> À lire avec : ' +
      '<button type="button" class="comprendre-les-chiffres-lien-interne" data-comprendre-les-chiffres-vers="comprendre-les-chiffres-carte-demandeurs">le nombre de personnes qui cherchent un emploi</button>' +
      ' (une baisse du taux qui ne s’accompagne pas d’une baisse des inscrits vient souvent de sorties de liste).</p>';
  }

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
      (e.histo && e.histo.haut && e.histo.bas
        ? '<p class="comprendre-les-chiffres-evolution-histo"><i class="bi bi-arrows-expand"></i> Depuis 1982, le chômage y est allé de ' +
          '<span class="chiffre" data-source="INSEE, taux de chômage localisé par région et département (série trimestrielle depuis 1982) - relevé le 2026-09-09">' +
          _comprendreLesChiffresEchappe(e.histo.bas) + '</span> à ' +
          '<span class="chiffre" data-source="INSEE, taux de chômage localisé par région et département (série trimestrielle depuis 1982) - relevé le 2026-09-09">' +
          _comprendreLesChiffresEchappe(e.histo.haut) + '</span>. À <span class="chiffre"' + srcAttr + '>' +
          _comprendreLesChiffresEchappe(e.valeur) + '</span>, on est plutôt dans le bas de cette fourchette.</p>'
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
      evoHTML + srcHTML + '</div>';
  }
  return '<div class="comprendre-les-chiffres-indic"' + idAttr + '>' + corps + evoHTML + srcHTML + '</div>';
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
    '<p class="comprendre-les-chiffres-oss-plein">Le gouvernement vise le <b>plein emploi</b> : un chômage autour de <b>5 %</b>.</p>' +
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
  var out = { periode: '', verifie_le: '', sources: {}, parDep: {} };
  ['periode', 'verifie_le'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { out[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });
  (_comprendreLesChiffresExtraireListeSimple(entete, 'sources') || []).forEach(function (ligne) {
    var parts = ligne.split('|').map(function (p) { return p.trim(); });
    if (parts.length >= 3) { out.sources[parts[0]] = { titre: parts[1], url: parts[2] }; }
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
  { cle: 'chomage_recensement', label: 'Chômage (recensement 2023)' },
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
      var n = parseFloat(val.replace(/\s/g, '').replace(',', '.'));
      var max = maxParStat[def.cle] || 0;
      var pct = max > 0 && !isNaN(n) ? Math.max(8, Math.round((n / max) * 100)) : 0;
      return _comprendreLesChiffresZoneBarre(def.label, val, pct);
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
    COMPRENDRE_LES_CHIFFRES_PORTRAIT_BLOCS.map(function (c) {
      return _comprendreLesChiffresRenduDepliPortrait(c, ouvert);
    }).join('') +
    COMPRENDRE_LES_CHIFFRES_EDITO_BLOCS.map(_comprendreLesChiffresRenduEdito).join('') +
    _comprendreLesChiffresRenduEmployeurs();
  return _comprendreLesChiffresRenduBlocRepliable('portrait', 'Le portrait du territoire', desc, corps, ouvert);
}

// Couche 3 : l'enquête Besoins en Main d'Œuvre (rectangle dépliable).
function _comprendreLesChiffresRenduCouche3() {
  var titre = 'Ce que les employeurs prévoient d’embaucher cette année';
  var desc = 'Une enquête annuelle auprès des employeurs. Des intentions, pas des embauches garanties.';
  var ouvert = _comprendreLesChiffresEstVueEnsemble();
  var sec = _comprendreLesChiffresSection(_comprendreLesChiffresPortrait, 'Métiers en tension');
  if (_comprendreLesChiffresPortraitEtat !== 'ok' || !sec) {
    return _comprendreLesChiffresRenduBlocRepliable('bmo', titre, desc,
      '<div class="comprendre-les-chiffres-encart"><i class="bi bi-info-circle"></i> Les résultats de l’enquête pour le territoire seront ajoutés avec le portrait annuel.</div>', ouvert);
  }
  var corps = '<div class="comprendre-les-chiffres-indic">' + _comprendreLesChiffresRenduSectionPortrait(sec) +
    '<div class="comprendre-les-chiffres-encart small comprendre-les-chiffres-encart-attention">' +
    '<i class="bi bi-exclamation-triangle"></i> « Métier en tension » ne veut pas dire « facile d’y entrer ». La difficulté peut venir des horaires, de la pénibilité, de la mobilité ou de conditions précises, pas seulement d’un manque de candidats.</div>' +
    '</div>';
  return _comprendreLesChiffresRenduBlocRepliable('bmo', titre, desc, corps, ouvert);
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
  var rows = '';
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
  });
  var premiereSection = doc.sections.filter(function (s) { return s.lignes.length; })[0];
  var srcUE = (premiereSection && premiereSection.lignes[0] && premiereSection.lignes[0].sourceUrl) || 'https://ec.europa.eu/eurostat';
  var html = html0 + '<div class="comprendre-les-chiffres-carte-teinte">' +
    '<h3 class="mt-0">La France dans l’Union européenne</h3>' +
    '<p class="comprendre-les-chiffres-note">Une mise en perspective, pas un jugement. Données harmonisées par Eurostat (même définition pour les 27 pays).</p>' +
    '<div class="comprendre-les-chiffres-tab-scroll"><table class="comprendre-les-chiffres-synthese">' +
    '<tr><th>Indicateur</th><th>France</th><th>Moyenne UE-27</th></tr>' + rows + '</table></div>' +
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
      '<div class="comprendre-les-chiffres-depli-corps">' + _comprendreLesChiffresRenduSectionPortrait(freins) + '</div></details>';
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
  { cle: 'choAn24', label: 'Taux de chômage, par année (2019-2025) : Dordogne', unite: '%', periode: 'annee', slug: 'chomage', terr: '24' },
  { cle: 'choAnNa', label: 'Taux de chômage, par année (2019-2025) : Nouvelle-Aquitaine', unite: '%', periode: 'annee', slug: 'chomage', terr: 'na' },
  { cle: 'choAnFr', label: 'Taux de chômage, par année (2019-2025) : France', unite: '%', periode: 'annee', slug: 'chomage', terr: 'fr' },
  { cle: 'choAnUe', label: 'Taux de chômage, par année (2019-2025) : Union européenne', unite: '%', periode: 'annee', slug: 'chomage', terr: 'ue' }
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
      _comprendreLesChiffresEchappe(c.label) +
      (vide ? ' <span class="comprendre-les-chiffres-note">(' + _comprendreLesChiffresEchappe(raisonTxt) + ')</span>' : '') +
      '</label>';
  };
  var pctTrim = COMPRENDRE_LES_CHIFFRES_CROISABLES.filter(function (c) { return c.unite === '%' && c.periode === 'trimestre'; });
  var pctAn = COMPRENDRE_LES_CHIFFRES_CROISABLES.filter(function (c) { return c.unite === '%' && c.periode === 'annee'; });
  var nb = COMPRENDRE_LES_CHIFFRES_CROISABLES.filter(function (c) { return c.unite === 'nb'; });
  var periode = _comprendreLesChiffresEtat.croiserPeriode === 'annee' ? 'annee' : 'trimestre';
  var bascule = '<div class="comprendre-les-chiffres-bascule-vue" role="group" aria-label="Lecture des séries" id="comprendreLesChiffresCroiserBascule">' +
    '<button type="button" class="' + (periode === 'trimestre' ? 'actif' : '') + '" data-comprendre-les-chiffres-croiser-periode="trimestre">Par trimestre (période récente)</button>' +
    '<button type="button" class="' + (periode === 'annee' ? 'actif' : '') + '" data-comprendre-les-chiffres-croiser-periode="annee">Par année (2019-2025)</button>' +
    '</div>';
  var corps = intro + bascule +
    '<div class="comprendre-les-chiffres-croiser" id="comprendreLesChiffresCroiser">' +
    '<div id="comprendreLesChiffresCroiserGroupeTrimestre"' + (periode === 'annee' ? ' hidden' : '') + '>' +
    '<fieldset><legend>Des taux, trimestre par trimestre</legend>' + pctTrim.map(caseHtml).join('') + '</fieldset>' +
    '<fieldset><legend>Des nombres, trimestre par trimestre (personnes, offres)</legend>' + nb.map(caseHtml).join('') + '</fieldset>' +
    '</div>' +
    '<div id="comprendreLesChiffresCroiserGroupeAnnee"' + (periode === 'trimestre' ? ' hidden' : '') + '>' +
    '<fieldset><legend>Des taux, année par année (2019-2025)</legend>' + pctAn.map(caseHtml).join('') + '</fieldset>' +
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
    return { label: c.label, pts: _comprendreLesChiffresSerieCroisable(c), couleur: COMPRENDRE_LES_CHIFFRES_COULEURS_SERIES[idx % 4], unite: c.unite };
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

function _comprendreLesChiffresRenduAccueil() {
  var estUE = _comprendreLesChiffresNiveauCourant() === 'ue';
  var html = '<div class="comprendre-les-chiffres-accueil">' +
    '<div class="text-center mb-3">' +
      '<h1><i class="bi bi-bar-chart"></i> Comprendre les chiffres</h1>' +
    '</div>' +
    _comprendreLesChiffresRenduBasculeVue() +
    _comprendreLesChiffresRenduBandeauDepartement() +
    _comprendreLesChiffresRenduNiveaux() +
    '<div class="comprendre-les-chiffres-contenu">';

  if (estUE) {
    html += _comprendreLesChiffresRenduVueUE();
  } else {
    html += _comprendreLesChiffresRenduVueEnsemble();
    html += _comprendreLesChiffresRenduCouche1();
    html += _comprendreLesChiffresRenduMethode();
    html += _comprendreLesChiffresRenduCouche2();

    html += _comprendreLesChiffresRenduCroiser();
    html += _comprendreLesChiffresRenduCouche3();
    html += _comprendreLesChiffresRenduEncartPrudence();
  }

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

function pageComprendreLesChiffres() {
  _comprendreLesChiffresDetourPresentation = false;
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
    corpsHTML = _comprendreLesChiffresRenduAccueil();
    brancherCorps = _comprendreLesChiffresBrancherAccueil;
    evenement = 'comprendre_les_chiffres_accueil_affiche';
  }

  app.innerHTML = '<div class="page-catalogue-contenu">' + _comprendreLesChiffresRenduEnTete() + corpsHTML + '</div>' + _comprendreLesChiffresRenduPiedFixe();
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
    _comprendreLesChiffresRenduEcartsGenerique: _comprendreLesChiffresRenduEcartsGenerique,
    _comprendreLesChiffresRenduGraphe: _comprendreLesChiffresRenduGraphe,
    _comprendreLesChiffresTendance: _comprendreLesChiffresTendance,
    _comprendreLesChiffresNombre: _comprendreLesChiffresNombre,
    _comprendreLesChiffresFormatNombre: _comprendreLesChiffresFormatNombre
  };
}
