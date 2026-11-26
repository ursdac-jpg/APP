/* ============================================================
   modules/bien-utiliser-ia/blocs.js
   Module « Bien utiliser l'IA » : LECTEUR DES PHRASES (fichier prompts/bien-utiliser-blocs.md) et ASSEMBLAGE DES RÉGLAGES. Logique pure, testée :
   tests/bienUtiliserIaBlocs.test.js. Aucun accès au navigateur : le chargement du fichier est dans index.js (buiaChargerBlocs).
   Source unique des phrases = le fichier .md (Denis le corrige lui-même). Aucune copie dans le code : si le fichier manque, le module le dit calmement.
   Plan : docs/AUDIT_ET_PLAN_BIEN_UTILISER_L_IA_2026-11-23.md, commit 2. Tous les noms commencent par buia / BUIA / _buia.
   ============================================================ */

var _buiaR = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? require('../../data/buiaDemande.js')
  : { BUIA_ELEMENTS: BUIA_ELEMENTS, BUIA_REGLAGES: BUIA_REGLAGES, BUIA_INTERRUPTEURS: BUIA_INTERRUPTEURS, BUIA_BLOC_FINAL: BUIA_BLOC_FINAL,
      BUIA_LIBRE_CHAMPS: BUIA_LIBRE_CHAMPS, BUIA_LIBRE_AMELIORATIONS: BUIA_LIBRE_AMELIORATIONS, BUIA_REPERE_PRECISION: BUIA_REPERE_PRECISION };

var BUIA_FICHIER_BLOCS = 'prompts/bien-utiliser-blocs.md';

// ---------------- Lecture du fichier ----------------
// Un bloc = une ligne « ## nom » puis son texte. Ce qui précède le premier « ## » est ignoré, de même qu'une ligne qui n'est qu'un commentaire <!-- ... -->.
// Retour : { blocs: { nom: texte }, doublons: [noms écrits deux fois] }. Un nom écrit deux fois garde le premier texte et est signalé.
function buiaLireBlocs(texte) {
  var blocs = {}, doublons = [], nom = null, lignes = [];
  function clore() {
    if (nom === null) { return; }
    var t = lignes.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (Object.prototype.hasOwnProperty.call(blocs, nom)) { doublons.push(nom); } else { blocs[nom] = t; }
  }
  String(texte === undefined || texte === null ? '' : texte).replace(/^﻿/, '').split(/\r\n|\r|\n/).forEach(function (l) {
    var m = /^##\s+(\S.*?)\s*$/.exec(l);
    if (m && !/^###/.test(l)) { clore(); nom = m[1]; lignes = []; return; }
    if (nom === null) { return; }
    if (/^\s*<!--.*-->\s*$/.test(l)) { return; }
    lignes.push(l.replace(/\s+$/, ''));
  });
  clore();
  return { blocs: blocs, doublons: doublons };
}

// ---------------- Blocs attendus ----------------
// Tous les blocs que les réglages et le socle demandent, dans l'ordre : longueurs, langages, interrupteurs, phrase finale.
function buiaNomsBlocsAttendus() {
  var noms = [];
  _buiaR.BUIA_REGLAGES.forEach(function (g) { g.choix.forEach(function (c) { noms.push(c.bloc); }); });
  _buiaR.BUIA_INTERRUPTEURS.forEach(function (i) { noms.push(i.bloc); });
  noms.push(_buiaR.BUIA_BLOC_FINAL);
  // Chemin « Écrire ma propre demande » : un bloc par champ libre et par correction proposée (sans doublon : certains blocs sont déjà des interrupteurs).
  _buiaR.BUIA_LIBRE_CHAMPS.forEach(function (c) { if (noms.indexOf(c.bloc) === -1) { noms.push(c.bloc); } });
  _buiaR.BUIA_LIBRE_AMELIORATIONS.forEach(function (a) { if (noms.indexOf(a.bloc) === -1) { noms.push(a.bloc); } });
  return noms;
}

// Les repères {{...}} permis dans un bloc : seulement ceux que ce bloc porte (un champ libre, ou la précision d'une correction), exactement une fois chacun.
function _buiaReperesDuBloc(nom) {
  var r = [];
  _buiaR.BUIA_LIBRE_CHAMPS.forEach(function (c) { if (c.bloc === nom) { r.push(c.repere); } });
  _buiaR.BUIA_LIBRE_AMELIORATIONS.forEach(function (a) { if (a.bloc === nom && a.champ) { r.push(_buiaR.BUIA_REPERE_PRECISION); } });
  return r;
}
function buiaBlocsManquants(blocs) {
  var b = blocs || {};
  return buiaNomsBlocsAttendus().filter(function (n) { return !Object.prototype.hasOwnProperty.call(b, n) || !String(b[n]).trim(); });
}

// Contrôle complet d'un fichier lu. Retour : liste de problèmes en français ; liste vide = fichier utilisable.
function buiaVerifierBlocs(lecture) {
  var p = [];
  var r = lecture || { blocs: {}, doublons: [] };
  buiaBlocsManquants(r.blocs).forEach(function (n) { p.push('Bloc absent ou vide : ' + n); });
  (r.doublons || []).forEach(function (n) { p.push('Bloc écrit deux fois : ' + n); });
  Object.keys(r.blocs || {}).forEach(function (n) {
    var t = r.blocs[n];
    if (/[–—]/.test(t)) { p.push('Tiret long dans le bloc : ' + n); }
    var permis = _buiaReperesDuBloc(n), reste = t;
    permis.forEach(function (rep) {
      var nb = t.split('{{' + rep + '}}').length - 1;
      if (nb !== 1) { p.push('Le repère {{' + rep + '}} doit apparaître exactement une fois dans le bloc : ' + n + ' (trouvé : ' + nb + ')'); }
      reste = reste.split('{{' + rep + '}}').join('');
    });
    if (/[\[\]{}]/.test(reste)) { p.push('Crochet ou accolade dans le bloc : ' + n + ' (une demande ne doit jamais en contenir' + (permis.length ? ', sauf ' + permis.map(function (x) { return '{{' + x + '}}'; }).join(' et ') : '') + ')'); }
  });
  return p;
}

// ---------------- Réglages ----------------
// Valeur valide d'un groupe à choix (longueur, langage) : une valeur inconnue ou absente donne la valeur par défaut, jamais un trou.
function buiaChoixValide(groupe, valeur) {
  var g = _buiaR.BUIA_REGLAGES.filter(function (x) { return x.groupe === groupe; })[0];
  if (!g) { return null; }
  return g.choix.some(function (c) { return c.v === valeur; }) ? valeur : g.defaut;
}

// Réglages d'une personne, complétés par les valeurs par défaut. niveau : 'plus' ajoute les réglages avancés (poser d'abord des questions).
function buiaReglagesParDefaut() {
  var r = { longueur: null, langage: null, interrupteurs: {} };
  _buiaR.BUIA_REGLAGES.forEach(function (g) { r[g.groupe] = g.defaut; });
  _buiaR.BUIA_INTERRUPTEURS.forEach(function (i) { r.interrupteurs[i.id] = !!i.defaut; });
  return r;
}
function buiaNettoyerReglages(choix) {
  var c = choix || {}, r = buiaReglagesParDefaut();
  _buiaR.BUIA_REGLAGES.forEach(function (g) { r[g.groupe] = buiaChoixValide(g.groupe, c[g.groupe]); });
  _buiaR.BUIA_INTERRUPTEURS.forEach(function (i) {
    if (c.interrupteurs && typeof c.interrupteurs[i.id] === 'boolean') { r.interrupteurs[i.id] = c.interrupteurs[i.id]; }
  });
  return r;
}

// Les phrases de réglages, rangées par élément de la demande : [{ element: 4 | 5, texte }]. Un seul bloc par groupe à choix.
// Un interrupteur « niveau plus » n'est pris en compte que si le niveau est 'plus'. Un bloc absent est ignoré (buiaVerifierBlocs le signale avant).
function buiaTexteReglages(blocs, choix, niveau) {
  var b = blocs || {}, r = buiaNettoyerReglages(choix), sortie = [];
  function ajouter(element, nomBloc) {
    if (Object.prototype.hasOwnProperty.call(b, nomBloc) && String(b[nomBloc]).trim()) { sortie.push({ element: element, texte: String(b[nomBloc]).trim() }); }
  }
  _buiaR.BUIA_REGLAGES.forEach(function (g) {
    var c = g.choix.filter(function (x) { return x.v === r[g.groupe]; })[0];
    if (c) { ajouter(g.element, c.bloc); }
  });
  _buiaR.BUIA_INTERRUPTEURS.forEach(function (i) {
    if (i.niveau === 'plus' && niveau !== 'plus') { return; }
    if (r.interrupteurs[i.id]) { ajouter(i.element, i.bloc); }
  });
  return sortie;
}
function buiaTexteFinal(blocs) {
  var b = blocs || {}, n = _buiaR.BUIA_BLOC_FINAL;
  return Object.prototype.hasOwnProperty.call(b, n) ? String(b[n]).trim() : '';
}

// Une demande qui contient encore un champ à compléter ou un repère de modèle ne doit jamais être copiée : le bouton « Copier » reste fermé.
function buiaResteACompleter(texte) { return /\[\s*à compléter|\{\{|\}\}/i.test(String(texte === undefined || texte === null ? '' : texte)); }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUIA_FICHIER_BLOCS: BUIA_FICHIER_BLOCS, buiaLireBlocs: buiaLireBlocs, buiaNomsBlocsAttendus: buiaNomsBlocsAttendus, buiaBlocsManquants: buiaBlocsManquants,
    buiaVerifierBlocs: buiaVerifierBlocs, _buiaReperesDuBloc: _buiaReperesDuBloc, buiaChoixValide: buiaChoixValide, buiaReglagesParDefaut: buiaReglagesParDefaut, buiaNettoyerReglages: buiaNettoyerReglages,
    buiaTexteReglages: buiaTexteReglages, buiaTexteFinal: buiaTexteFinal, buiaResteACompleter: buiaResteACompleter };
}
