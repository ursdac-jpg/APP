/* ============================================================
   modules/un-cv-plusieurs-metiers/logiqueObjectifDossier.js
   ------------------------------------------------------------
   Adaptateur entre le « brouillon » d'objectif d'un métier (ucpmObjectifVide, logiqueMetiers.js) et la FORME DU DOSSIER que lit la brique de la lettre
   (contenuModeRecherche, js/app.js). Le panneau « Mon objectif » prête une copie du dossier à la brique le temps d'un événement (chantier F14, 24/10/2026,
   docs/CHANTIER_F14_UCPM_OBJECTIF_2026-10-24.md) : cette copie est construite par ucpmObjectifVersDossier() et relue par ucpmObjectifDepuisDossier().

   Famille « emploi » seulement (offre, spontanee, reconversion) ; les démarches « période » (stage, immersion, alternance, formation) gardent leurs champs.
   Fonctions pures, testées en Node (tests/unCvPlusieursMetiersObjectifDossier.test.js).
   ============================================================ */

var UCPM_DEMARCHES_EMPLOI = ['offre', 'spontanee', 'reconversion'];

function ucpmEstDemarcheEmploi(demarche) { return UCPM_DEMARCHES_EMPLOI.indexOf(demarche) !== -1; }

function _ucpmOdTexte(v) { return String(v == null ? '' : v).trim(); }

// Forme de candidature -> les deux champs du dossier : typeRecherche ('simple' de façon générale, 'offre' une offre ou une entreprise précise) et formeChoisie.
function ucpmFormeVersDossier(demarche, forme) {
  if (demarche === 'offre') { return { typeRecherche: 'offre', formeChoisie: 'offre' }; }
  if (forme === 'generale') { return { typeRecherche: 'simple', formeChoisie: null }; }
  if (forme === 'entreprise') { return { typeRecherche: 'offre', formeChoisie: 'entreprise' }; }
  if (forme === 'offre' && demarche === 'reconversion') { return { typeRecherche: 'offre', formeChoisie: 'offre' }; }
  return { typeRecherche: null, formeChoisie: null };
}

function ucpmFormeDepuisDossier(demarche, typeRecherche, formeChoisie, modeRecherche) {
  if (demarche === 'offre') { return 'offre'; }
  if (typeRecherche === 'simple') { return 'generale'; }
  if (typeRecherche === 'offre') {
    if (demarche === 'spontanee') { return 'entreprise'; }
    if (formeChoisie === 'offre' || formeChoisie === 'entreprise') { return formeChoisie; }
    return modeRecherche === 'domaine' ? 'entreprise' : 'offre';
  }
  return '';
}

// ctx : { nomMetier (non utilisé pour le dossier : le métier est donné), typesStructure (liste BILAN_TYPES_STRUCTURE), base (dossier d'origine, copié) }
// Renvoie une COPIE du dossier de base (copie superficielle, objets modifiés recréés) qui porte l'objectif du brouillon ; null hors famille emploi.
function ucpmObjectifVersDossier(obj, ctx) {
  ctx = ctx || {};
  if (!obj || !ucpmEstDemarcheEmploi(obj.demarche)) { return null; }
  var d = Object.assign({}, ctx.base || {});
  var type = obj.typeStructure === 'Autre' && obj.typeStructureAutre ? obj.typeStructureAutre : obj.typeStructure;
  var f = ucpmFormeVersDossier(obj.demarche, obj.forme);
  d.objectif = obj.demarche;
  d.modeRecherche = obj.cible === 'secteur' ? 'domaine' : 'metier';   // le metier est celui du CV : « un metier precis » par defaut ; un secteur seulement si la personne le choisit
  d.metierCible = '';          // le métier est celui du CV : jamais redemandé (option metierDonne de la brique)
  d.secteurCible = obj.cible === 'secteur' ? _ucpmOdTexte(obj.secteur) : '';
  d.intituleDomaine = (d.secteurCible && _ucpmOdTexte(obj.intitule)) ? { secteur: d.secteurCible, intitule: _ucpmOdTexte(obj.intitule) } : null;
  d.typeRecherche = f.typeRecherche;
  d.formeChoisie = f.formeChoisie;
  d.rechercheCandidature = Object.assign({}, (ctx.base && ctx.base.rechercheCandidature) || {}, {
    entreprise: _ucpmOdTexte(obj.employeur), site: '', lienOffre: '', texteOffre: String(obj.texteOffre || '').trim(),
    typeStructure: type || '', civiliteRecruteur: obj.civiliteRecruteur || '', nomRecruteur: _ucpmOdTexte(obj.nomRecruteur), civiliteRecruteurTouchee: true
  });
  d.contrat = (obj.contrat || []).slice();
  d.tempsTravail = (obj.tempsTravail || []).slice();
  d.horaires = (obj.horaires || []).slice();
  var detail = Object.assign({}, (ctx.base && ctx.base[obj.demarche]) || {}, {
    poste: _ucpmOdTexte(obj.posteOffre), structure: _ucpmOdTexte(obj.employeur), type: type || '', lien: '',
    dispo: obj.disponibleA ? [obj.disponibleA] : []
  });
  d[obj.demarche] = detail;
  return d;
}

// Relit les choix faits dans la copie du dossier et les range dans une COPIE du brouillon (le reste du brouillon est conservé).
// ctx : { typesStructure }
function ucpmObjectifDepuisDossier(d, obj, ctx) {
  ctx = ctx || {};
  var o = Object.assign({}, obj);
  if (!d || !ucpmEstDemarcheEmploi(obj.demarche)) { return o; }
  var rc = d.rechercheCandidature || {};
  o.forme = ucpmFormeDepuisDossier(obj.demarche, d.typeRecherche, d.formeChoisie, d.modeRecherche);
  o.cible = d.modeRecherche === 'domaine' ? 'secteur' : (d.modeRecherche === 'metier' ? 'metier' : '');
  o.secteur = o.cible === 'secteur' ? _ucpmOdTexte(d.secteurCible) : '';
  o.intitule = (o.secteur && d.intituleDomaine && d.intituleDomaine.secteur === d.secteurCible) ? _ucpmOdTexte(d.intituleDomaine.intitule) : '';
  o.employeur = _ucpmOdTexte(rc.entreprise);
  o.texteOffre = String(rc.texteOffre || rc.lienOffre || '').trim();
  var ts = _ucpmOdTexte(rc.typeStructure);
  if (!ts) { o.typeStructure = ''; o.typeStructureAutre = ''; }
  else if ((ctx.typesStructure || []).indexOf(ts) !== -1) { o.typeStructure = ts; o.typeStructureAutre = ''; }
  else { o.typeStructure = 'Autre'; o.typeStructureAutre = ts; }
  o.civiliteRecruteur = rc.civiliteRecruteur || '';
  o.nomRecruteur = _ucpmOdTexte(rc.nomRecruteur);
  var detail = d[obj.demarche] || {};
  if (obj.demarche === 'offre') { o.posteOffre = _ucpmOdTexte(detail.poste); }
  o.contrat = (d.contrat || []).slice();
  o.tempsTravail = (d.tempsTravail || []).slice();
  o.horaires = (d.horaires || []).slice();
  o.disponibleA = Array.isArray(detail.dispo) && detail.dispo.length ? String(detail.dispo[0]) : '';
  return o;
}

// Raisons pour lesquelles « Appliquer » est grisé (mêmes règles que la lettre, sans le CV ni la situation) ; vide si tout est prêt.
// un : le panneau s'applique à un seul métier (l'entreprise précise n'est exigée que dans ce cas).
function ucpmRaisonsObjectif(obj, un, raisonsBlocageLettre) {
  if (!obj || !obj.demarche) { return ['choisir un objectif']; }
  if (!ucpmEstDemarcheEmploi(obj.demarche)) { return []; }
  var f = ucpmFormeVersDossier(obj.demarche, obj.forme);
  var raisons = raisonsBlocageLettre({
    cvPresent: true, cvRelu: true, situationActuelle: 'x',
    objectif: obj.demarche, modeRecherche: obj.cible === 'secteur' ? 'domaine' : 'metier',
    metierCible: 'x', secteurCible: obj.cible === 'secteur' ? obj.secteur : '', typeRecherche: f.typeRecherche, forme: obj.demarche === 'reconversion' ? obj.forme || null : null,
    intituleDomaine: obj.cible === 'secteur' ? obj.intitule : '',
    entreprise: un ? obj.employeur : 'x'    // pour plusieurs métiers, le nom de l'entreprise n'est jamais demandé
  });
  return raisons;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UCPM_DEMARCHES_EMPLOI: UCPM_DEMARCHES_EMPLOI, ucpmEstDemarcheEmploi: ucpmEstDemarcheEmploi, ucpmFormeVersDossier: ucpmFormeVersDossier, ucpmFormeDepuisDossier: ucpmFormeDepuisDossier,
    ucpmObjectifVersDossier: ucpmObjectifVersDossier, ucpmObjectifDepuisDossier: ucpmObjectifDepuisDossier, ucpmRaisonsObjectif: ucpmRaisonsObjectif
  };
}
