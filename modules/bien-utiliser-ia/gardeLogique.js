/* ============================================================
   modules/bien-utiliser-ia/gardeLogique.js
   « Mes demandes » : les demandes que la personne a choisi de garder sur sa DISQUETTE. Logique pure, testée : tests/bienUtiliserIaGarde.test.js.
   Décision de Denis (consigne 595) : rien n'est laissé sur l'appareil, seulement la disquette ; jamais une saisie en cours, seulement une demande ajoutée par un clic.
   Ce qui part : le nom, les champs de la personne (but, situation, exemple, réglages, corrections), jamais le texte à traiter ni le courrier (ils peuvent contenir des données personnelles).
   Deux sortes de demandes : « libre » (chemin 3) et « modèle » (chemin 2, un modèle dont le texte existe). Tout ce qui revient d'un fichier est revérifié, rien n'est cru sur parole.
   Tous les noms commencent par buia / BUIA / _buia (scripts classiques).
   ============================================================ */

var _buiaG = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('./libreLogique.js'), require('./modeleLogique.js'))
  : { buiaLibreNettoyer: buiaLibreNettoyer, buiaLibreEstVide: buiaLibreEstVide, buiaModeleDisponible: buiaModeleDisponible, buiaSaisiePourGarde: buiaSaisiePourGarde, buiaDefModele: buiaDefModele };

var BUIA_GARDE_MAX = 20;
var BUIA_GARDE_NOM_MAX = 60;
var BUIA_GARDE_NOM_PAR_DEFAUT = 'Ma demande';

function buiaGardeVide() { return { demandes: [] }; }
function buiaGardeNombre(etat) { return etat && Array.isArray(etat.demandes) ? etat.demandes.length : 0; }

// Un nom lisible : espaces simplifiés, 60 caractères au plus ; vide, il devient « Ma demande ».
function buiaGardeNom(nom) {
  var t = (typeof nom === 'string' ? nom : '').replace(/\s+/g, ' ').trim().slice(0, BUIA_GARDE_NOM_MAX).trim();
  return t || BUIA_GARDE_NOM_PAR_DEFAUT;
}
function _buiaGNomCle(nom) { return buiaGardeNom(nom).toLowerCase(); }

function _buiaGProchainId(demandes) {
  var max = 0;
  demandes.forEach(function (d) { var m = /^d(\d+)$/.exec(d.id); if (m && +m[1] > max) { max = +m[1]; } });
  return 'd' + (max + 1);
}

function _buiaGCopie(o) { return JSON.parse(JSON.stringify(o)); }

// Range une demande : le même nom (sans tenir compte des majuscules) remplace la précédente, sinon elle s'ajoute, dans la limite de 20.
// Retour : { etat, id, remplace } ou { etat, refuse: 'plein' }.
function _buiaGRanger(etat, demande) {
  var e = buiaGardeImporter(etat), cle = _buiaGNomCle(demande.nom), i = -1;
  e.demandes.forEach(function (d, k) { if (i === -1 && _buiaGNomCle(d.nom) === cle) { i = k; } });
  if (i === -1 && e.demandes.length >= BUIA_GARDE_MAX) { return { etat: e, refuse: 'plein' }; }
  if (i !== -1) { demande.id = e.demandes[i].id; e.demandes[i] = demande; return { etat: e, id: demande.id, remplace: true }; }
  demande.id = _buiaGProchainId(e.demandes);
  e.demandes.push(demande);
  return { etat: e, id: demande.id, remplace: false };
}

// Garde une demande du chemin 3. Refusée si elle est vide (ni but ni situation : rien de réutilisable).
function buiaGardeAjouterLibre(etat, nom, saisie) {
  var s = _buiaG.buiaLibreNettoyer(saisie, { pourGarde: true });
  if (!s.but.trim() && !s.situation.trim()) { return { etat: buiaGardeImporter(etat), refuse: 'vide' }; }
  return _buiaGRanger(etat, { id: '', nom: buiaGardeNom(nom), type: 'libre', saisie: s });
}
// Garde une demande du chemin 2 (un modèle dont le texte existe). Le courrier n'est jamais gardé.
function buiaGardeAjouterModele(etat, nom, modeleId, saisie) {
  if (!_buiaG.buiaModeleDisponible(modeleId)) { return { etat: buiaGardeImporter(etat), refuse: 'modele' }; }
  return _buiaGRanger(etat, { id: '', nom: buiaGardeNom(nom), type: 'modele', modele: modeleId, saisie: _buiaG.buiaSaisiePourGarde(modeleId, saisie) });
}
function buiaGardeSupprimer(etat, id) {
  var e = buiaGardeImporter(etat);
  e.demandes = e.demandes.filter(function (d) { return d.id !== id; });
  return e;
}
function buiaGardeTrouver(etat, id) {
  var e = buiaGardeImporter(etat);
  return e.demandes.filter(function (d) { return d.id === id; })[0] || null;
}

// Ce qui part sur la disquette : null s'il n'y a rien (l'espace n'apparaît alors pas comme un travail à sauvegarder).
function buiaGardeExporter(etat) {
  var e = buiaGardeImporter(etat);
  return e.demandes.length ? { version: 1, demandes: _buiaGCopie(e.demandes) } : null;
}

// Relit un état (venant d'un fichier de disquette, ou de la session) : seules les demandes valides sont gardées, tout est nettoyé, rien n'est cru sur parole.
// Une demande relue : tout est nettoyé, ou null si elle n'est pas valide (partagé par la disquette et par le fichier reçu d'un collègue : une seule règle).
function _buiaGPropre(d) {
  if (!d || typeof d !== 'object') { return null; }
  if (d.type === 'libre') {
    var s = _buiaG.buiaLibreNettoyer(d.saisie, { pourGarde: true });
    if (s.but.trim() || s.situation.trim()) { return { id: '', nom: buiaGardeNom(d.nom), type: 'libre', saisie: s }; }
  } else if (d.type === 'modele' && typeof d.modele === 'number' && _buiaG.buiaModeleDisponible(d.modele)) {
    return { id: '', nom: buiaGardeNom(d.nom), type: 'modele', modele: d.modele, saisie: _buiaG.buiaSaisiePourGarde(d.modele, d.saisie) };
  }
  return null;
}

function buiaGardeImporter(brut) {
  var sortie = buiaGardeVide();
  var liste = brut && typeof brut === 'object' && Array.isArray(brut.demandes) ? brut.demandes : [];
  var ids = {};
  liste.forEach(function (d) {
    if (!d || typeof d !== 'object' || sortie.demandes.length >= BUIA_GARDE_MAX) { return; }
    var propre = _buiaGPropre(d);
    if (!propre) { return; }
    propre.id = (typeof d.id === 'string' && /^d\d+$/.test(d.id) && !ids[d.id]) ? d.id : '';
    if (propre.id) { ids[propre.id] = true; }
    sortie.demandes.push(propre);
  });
  sortie.demandes.forEach(function (d) { if (!d.id) { d.id = _buiaGProchainId(sortie.demandes); ids[d.id] = true; } });
  return sortie;
}

/* ------------------------------------------------------------
   Partager ses demandes avec un collègue (proposition P13, décision de Denis du 25/11/2026, maquette docs/maquettes/maquette-bien-utiliser-ia-partager-mes-demandes-2026-11-25.html).
   Un petit fichier à part, JAMAIS la disquette (la disquette contient toute la session et son importation remplace tout) :
   { type: 'demandes-partagees', version: 1, demandes: [ { nom, type, modele?, saisie } ] }. Le texte à traiter et le courrier n'y sont jamais (déjà vidés).
   À la réception, rien n'est écrasé : un nom déjà pris devient « Nom (reçue) », les identifiants sont renumérotés, tout est revérifié par la règle de la disquette.
   ------------------------------------------------------------ */
var BUIA_PARTAGE_TYPE = 'demandes-partagees';
var BUIA_PARTAGE_VERSION = 1;
var BUIA_PARTAGE_LUES_MAX = 100;           // au-delà, les demandes lues en trop sont écartées
var BUIA_PARTAGE_TEXTE_MAX = 2000000;      // un fichier plus gros n'est pas un fichier de demandes

// Nom du fichier : la date en français, jour-mois-année (« 25-11-2026 », fournie par dateFichierFr, modules/cv-core/dates.js). Sans date valable, pas de date.
function buiaPartageNomFichier(dateFr) {
  return 'demandes-partagees' + (typeof dateFr === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateFr) ? '-' + dateFr : '') + '.json';
}

// Le fichier à envoyer, pour les demandes dont l'identifiant est dans `ids` (dans l'ordre de la disquette). null s'il n'y en a aucune.
function buiaPartageExporter(etat, ids) {
  var choix = {}; (Array.isArray(ids) ? ids : []).forEach(function (i) { choix[i] = true; });
  var liste = buiaGardeImporter(etat).demandes.filter(function (d) { return choix[d.id]; }).map(function (d) {
    var o = { nom: d.nom, type: d.type };
    if (d.type === 'modele') { o.modele = d.modele; }
    o.saisie = _buiaGCopie(d.saisie);
    return o;
  });
  return liste.length ? { type: BUIA_PARTAGE_TYPE, version: BUIA_PARTAGE_VERSION, demandes: liste } : null;
}

// Tout ce qui est écrit par la personne dans une demande, ligne par ligne, tel que cela partira dans le fichier (pour le lui montrer avant l'enregistrement).
// Retour : [{ cle: 'but' | 'situation' | 'exemple' | 'precision' | 'champ', lib: l'intitulé du champ d'un modèle ou '', texte }], les champs vides sont omis.
function buiaPartageLignes(demande) {
  var d = _buiaGPropre(demande), lignes = [];
  if (!d) { return lignes; }
  if (d.type === 'libre') {
    ['but', 'situation', 'exemple'].forEach(function (c) { if (d.saisie[c] && d.saisie[c].trim()) { lignes.push({ cle: c, lib: '', texte: d.saisie[c] }); } });
    (d.saisie.ajouts || []).forEach(function (a) { if (a.valeur) { lignes.push({ cle: 'precision', lib: '', texte: a.valeur }); } });
  } else {
    var def = _buiaG.buiaDefModele(d.modele);
    (def ? def.champs : []).forEach(function (c) {
      var v = d.saisie.champs ? d.saisie.champs[c.id] : '';
      if (typeof v === 'string' && v.trim()) { lignes.push({ cle: 'champ', lib: c.lib || c.court || '', texte: v }); }
    });
  }
  return lignes;
}

// Un nom libre : si le nom (sans tenir compte des majuscules) est déjà pris, « Nom (reçue) », puis « Nom (reçue 2) »... Jamais plus de 60 caractères.
function _buiaGNomUnique(nom, pris) {
  var base = buiaGardeNom(nom);
  function cle(t) { return t.toLowerCase(); }
  if (!pris[cle(base)]) { return base; }
  var n = 1, essai;
  do {
    var suffixe = ' (reçue' + (n > 1 ? ' ' + n : '') + ')';
    essai = base.slice(0, BUIA_GARDE_NOM_MAX - suffixe.length).trim() + suffixe;
    n++;
  } while (pris[cle(essai)]);
  return essai;
}

// Lit un fichier reçu. Retour : { erreur: 'illisible' | 'disquette' | 'autre' } ou { lues, bonnes: [demandes propres, nom déjà rendu libre], ecartees: [{ nom, raison: 'modele' | 'vide' | 'inconnue' | 'trop' }] }.
function buiaPartageAnalyser(texte, etat) {
  if (typeof texte !== 'string' || texte.length > BUIA_PARTAGE_TEXTE_MAX) { return { erreur: 'illisible' }; }
  var brut;
  try { brut = JSON.parse(texte); } catch (e) { return { erreur: 'illisible' }; }
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) { return { erreur: 'illisible' }; }
  if (brut.dossier || brut.modulesEtat) { return { erreur: 'disquette' }; }
  if (brut.type !== BUIA_PARTAGE_TYPE || !Array.isArray(brut.demandes)) { return { erreur: 'autre' }; }
  var pris = {};
  buiaGardeImporter(etat).demandes.forEach(function (d) { pris[d.nom.toLowerCase()] = true; });
  var bonnes = [], ecartees = [];
  brut.demandes.forEach(function (d, i) {
    var nomLu = d && typeof d === 'object' ? buiaGardeNom(d.nom) : BUIA_GARDE_NOM_PAR_DEFAUT;
    if (i >= BUIA_PARTAGE_LUES_MAX) { ecartees.push({ nom: nomLu, raison: 'trop' }); return; }
    var propre = _buiaGPropre(d);
    if (!propre) {
      ecartees.push({ nom: nomLu, raison: !d || typeof d !== 'object' || (d.type !== 'libre' && d.type !== 'modele') ? 'inconnue' : (d.type === 'modele' ? 'modele' : 'vide') });
      return;
    }
    propre.nom = _buiaGNomUnique(propre.nom, pris);
    pris[propre.nom.toLowerCase()] = true;
    bonnes.push(propre);
  });
  return { lues: brut.demandes.length, bonnes: bonnes, ecartees: ecartees };
}

// Ajoute les demandes reçues à la disquette, dans la limite de 20. Les noms sont revérifiés (la liste a pu changer depuis la lecture). Retour : { etat, ajoutees, restantes }.
function buiaPartageAjouter(etat, bonnes) {
  var e = buiaGardeImporter(etat), pris = {}, ajoutees = 0, liste = Array.isArray(bonnes) ? bonnes : [];
  e.demandes.forEach(function (d) { pris[d.nom.toLowerCase()] = true; });
  liste.forEach(function (d) {
    if (e.demandes.length >= BUIA_GARDE_MAX) { return; }
    var propre = _buiaGPropre(d);
    if (!propre) { return; }
    propre.nom = _buiaGNomUnique(propre.nom, pris);
    pris[propre.nom.toLowerCase()] = true;
    propre.id = _buiaGProchainId(e.demandes);
    e.demandes.push(propre);
    ajoutees++;
  });
  return { etat: e, ajoutees: ajoutees, restantes: liste.length - ajoutees };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buiaPartageLignes: buiaPartageLignes, buiaPartageNomFichier: buiaPartageNomFichier, buiaPartageExporter: buiaPartageExporter, buiaPartageAnalyser: buiaPartageAnalyser, buiaPartageAjouter: buiaPartageAjouter,
    BUIA_PARTAGE_TYPE: BUIA_PARTAGE_TYPE, BUIA_PARTAGE_LUES_MAX: BUIA_PARTAGE_LUES_MAX,
    buiaGardeVide: buiaGardeVide, buiaGardeNombre: buiaGardeNombre, buiaGardeNom: buiaGardeNom, buiaGardeAjouterLibre: buiaGardeAjouterLibre,
    buiaGardeAjouterModele: buiaGardeAjouterModele, buiaGardeSupprimer: buiaGardeSupprimer, buiaGardeTrouver: buiaGardeTrouver, buiaGardeExporter: buiaGardeExporter,
    buiaGardeImporter: buiaGardeImporter, BUIA_GARDE_MAX: BUIA_GARDE_MAX, BUIA_GARDE_NOM_MAX: BUIA_GARDE_NOM_MAX, BUIA_GARDE_NOM_PAR_DEFAUT: BUIA_GARDE_NOM_PAR_DEFAUT };
}
