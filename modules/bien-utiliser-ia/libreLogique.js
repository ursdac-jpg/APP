/* ============================================================
   modules/bien-utiliser-ia/libreLogique.js
   Chemin 3 « Écrire ma propre demande » : ASSEMBLAGE de la demande libre (logique pure, testée : tests/bienUtiliserIaLibre.test.js).
   Même principe que le chemin 2 : le code assemble des BLOCS lus dans prompts/bien-utiliser-blocs.md (les phrases ne sont jamais écrites dans le code).
   Les champs, les réglages et les corrections viennent de data/buiaDemande.js (une seule liste, lue par les trois chemins).
   Règles vérifiées par les tests : un seul bloc par groupe de choix ; aucun crochet ni accolade dans le texte final ; but et situation vides empêchent de copier ;
   le texte à traiter n'est jamais gardé sur la disquette ; une correction déjà présente n'est jamais ajoutée deux fois ; aucun texte de secours dans le code.
   Tous les noms commencent par buia / BUIA / _buia (scripts classiques).
   ============================================================ */

var _buiaL = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('../../data/buiaDemande.js'), require('./blocs.js'), require('./papierLogique.js'))
  : { BUIA_ELEMENTS: BUIA_ELEMENTS, BUIA_LIBRE_CHAMPS: BUIA_LIBRE_CHAMPS, BUIA_LIBRE_AMELIORATIONS: BUIA_LIBRE_AMELIORATIONS, BUIA_REPERE_PRECISION: BUIA_REPERE_PRECISION,
      buiaReglagesParDefaut: buiaReglagesParDefaut, buiaNettoyerReglages: buiaNettoyerReglages, buiaTexteReglages: buiaTexteReglages, buiaTexteFinal: buiaTexteFinal,
      buiaResteACompleter: buiaResteACompleter, buiaLigneDateDuJour: buiaLigneDateDuJour };

var BUIA_LIBRE_MAX_AJOUTS = 6;
var BUIA_LIBRE_MAX_PRECISION = 300;

function buiaLibreChamps() { return _buiaL.BUIA_LIBRE_CHAMPS.slice(); }
function buiaLibreAmeliorations() { return _buiaL.BUIA_LIBRE_AMELIORATIONS.slice(); }
// Questions d'aide d'un champ (« Pour qui ? Pourquoi ? »), lues dans la liste unique des six éléments (data/buiaDemande.js) ; chaîne vide s'il n'y en a pas.
function buiaLibreAideQuestions(id) {
  var e = _buiaL.BUIA_ELEMENTS.filter(function (x) { return x.id === id; })[0];
  return (e && e.aide) ? e.aide : '';
}
function _buiaLAmelioration(id) { return _buiaL.BUIA_LIBRE_AMELIORATIONS.filter(function (a) { return a.id === id; })[0] || null; }

// Saisie vide, avec les réglages par défaut : { but, situation, texte, exemple, longueur, langage, interrupteurs, ajouts: [{ id, valeur }] }.
function buiaLibreSaisieVide() {
  var r = _buiaL.buiaReglagesParDefaut(), s = { longueur: r.longueur, langage: r.langage, interrupteurs: r.interrupteurs, ajouts: [] };
  _buiaL.BUIA_LIBRE_CHAMPS.forEach(function (c) { s[c.id] = ''; });
  return s;
}

// Saisie nettoyée (ce qui vient d'un fichier de disquette, d'un clic ou d'une frappe) : types vérifiés, longueurs limitées, choix inconnus remis par défaut.
// options.pourGarde : les champs marqués `gardee: false` (le texte à traiter) sont vidés.
function buiaLibreNettoyer(brut, options) {
  var x = (brut && typeof brut === 'object') ? brut : {}, s = buiaLibreSaisieVide(), seul = options && options.pourGarde;
  _buiaL.BUIA_LIBRE_CHAMPS.forEach(function (c) {
    if (typeof x[c.id] === 'string' && !(seul && c.gardee === false)) { s[c.id] = x[c.id].slice(0, c.max); }
  });
  var r = _buiaL.buiaNettoyerReglages({ longueur: x.longueur, langage: x.langage, interrupteurs: x.interrupteurs });
  s.longueur = r.longueur; s.langage = r.langage; s.interrupteurs = r.interrupteurs;
  var vus = {}, ordre = [];
  (Array.isArray(x.ajouts) ? x.ajouts : []).forEach(function (a) {
    var def = a && typeof a.id === 'string' ? _buiaLAmelioration(a.id) : null;
    if (!def) { return; }
    var valeur = '';
    if (def.champ) {
      valeur = (typeof a.valeur === 'string' ? a.valeur : '').replace(/\s+/g, ' ').trim().slice(0, BUIA_LIBRE_MAX_PRECISION);
      if (!valeur) { return; }
    }
    if (!vus[def.id]) { ordre.push(def.id); }
    vus[def.id] = { id: def.id, valeur: valeur };
  });
  s.ajouts = ordre.slice(0, BUIA_LIBRE_MAX_AJOUTS).map(function (k) { return vus[k]; });
  return s;
}

// Ajoute (ou remplace) une correction. Retour : nouvelle saisie, ou null si la correction est inconnue ou sa précision vide.
function buiaLibreAjouter(saisie, id, valeur) {
  var def = _buiaLAmelioration(id);
  if (!def) { return null; }
  var s = buiaLibreNettoyer(saisie);
  var v = def.champ ? String(valeur === undefined || valeur === null ? '' : valeur).replace(/\s+/g, ' ').trim().slice(0, BUIA_LIBRE_MAX_PRECISION) : '';
  if (def.champ && !v) { return null; }
  s.ajouts = s.ajouts.filter(function (a) { return a.id !== id; });
  s.ajouts.push({ id: id, valeur: v });
  return buiaLibreNettoyer(s);
}
function buiaLibreRetirer(saisie, id) {
  var s = buiaLibreNettoyer(saisie);
  s.ajouts = s.ajouts.filter(function (a) { return a.id !== id; });
  return s;
}

// Rien d'écrit ni de corrigé ? (les réglages à eux seuls ne comptent pas)
function buiaLibreEstVide(saisie) {
  var s = buiaLibreNettoyer(saisie);
  return !_buiaL.BUIA_LIBRE_CHAMPS.some(function (c) { return s[c.id].trim() !== ''; }) && s.ajouts.length === 0;
}

function _buiaLVal(c, v) {
  var t = String(v || '').trim();
  return (c.id === 'but' || c.id === 'situation') ? t.replace(/[.\s]+$/, '') : t;
}

// Assemble la demande. ctx : { aujourdhui: Date, niveau: 'bases' | 'plus' }.
// Retour : { lignes: [{ element, texte, saut }], texte, manque: [noms courts], aCompleter }.
// Au niveau « bases » le champ d'exemple et la phrase « poser d'abord des questions » ne sont pas pris en compte (comme leurs champs, ils n'existent qu'au niveau « Pour aller plus loin »).
function buiaLibreAssembler(blocs, saisie, ctx) {
  var b = blocs || {}, s = buiaLibreNettoyer(saisie), c0 = ctx || {}, plus = c0.niveau === 'plus', lignes = [], manque = [], valeurs = {};
  _buiaL.BUIA_LIBRE_CHAMPS.forEach(function (c) {
    var v = _buiaLVal(c, s[c.id]);
    if (c.requis && !v) { manque.push(c.court); v = c.vide; }
    valeurs[c.repere] = v;
  });
  function remplir(t, map) { return t.replace(/\{\{(\w+)\}\}/g, function (m, nom) { return Object.prototype.hasOwnProperty.call(map, nom) ? map[nom] : m; }); }
  function bloc(nom, map) { return Object.prototype.hasOwnProperty.call(b, nom) && String(b[nom]).trim() ? remplir(String(b[nom]).trim(), map || valeurs) : ''; }
  function champ(id) { return _buiaL.BUIA_LIBRE_CHAMPS.filter(function (c) { return c.id === id; })[0]; }
  function pousser(element, texte, saut) { if (texte) { lignes.push({ element: element, texte: texte, saut: !!saut }); } }

  pousser(1, bloc(champ('but').bloc));
  pousser(6, _buiaL.buiaLigneDateDuJour(c0.aujourdhui), true);
  pousser(2, bloc(champ('situation').bloc));
  if (valeurs.texte) { pousser(3, bloc(champ('texte').bloc), true); }
  var reglages = _buiaL.buiaTexteReglages(b, { longueur: s.longueur, langage: s.langage, interrupteurs: s.interrupteurs }, plus ? 'plus' : 'bases');
  var exemple = (plus && valeurs.exemple) ? bloc(champ('exemple').bloc) : '';
  var exempleFait = false;
  reglages.forEach(function (r, i) {
    if (exemple && !exempleFait && r.element === 5) { pousser(4, exemple); exempleFait = true; }
    pousser(r.element, r.texte, i === 0);
  });
  if (exemple && !exempleFait) { pousser(4, exemple); }
  s.ajouts.forEach(function (a) {
    var def = _buiaLAmelioration(a.id);
    if (!def) { return; }
    var map = {}; map[_buiaL.BUIA_REPERE_PRECISION] = String(a.valeur || '').replace(/[.\s]+$/, '');
    var texte = bloc(def.bloc, map);
    if (texte && !lignes.some(function (l) { return l.texte === texte; })) { pousser(def.element, texte); }
  });
  pousser(5, _buiaL.buiaTexteFinal(b), true);

  var out = '';
  lignes.forEach(function (l, i) { out += (i === 0 ? '' : (l.saut ? '\n\n' : '\n')) + l.texte; });
  return { lignes: lignes, texte: out, manque: manque, aCompleter: manque.length > 0 || _buiaL.buiaResteACompleter(out) };
}

// La correction « id » est-elle déjà dans la demande, sans elle ? (« Cette phrase est déjà dans votre demande : vérifiez plutôt la réponse vous-même. »)
// Une correction qui porte une précision n'est jamais « déjà là » : elle s'ajoute, ou remplace la précédente.
function buiaLibreAjoutDejaPresent(blocs, saisie, id, ctx) {
  var def = _buiaLAmelioration(id);
  if (!def || def.champ) { return false; }
  var sans = buiaLibreRetirer(saisie, id), texte = (blocs && Object.prototype.hasOwnProperty.call(blocs, def.bloc)) ? String(blocs[def.bloc]).trim() : '';
  if (!texte) { return false; }
  return buiaLibreAssembler(blocs, sans, ctx).lignes.some(function (l) { return l.texte === texte; });
}

function buiaLibreMessageACompleter(manque) {
  return (manque && manque.length) ? 'Pour copier votre demande, complétez : ' + manque.join(', ') + '.' : '';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buiaLibreChamps: buiaLibreChamps, buiaLibreAmeliorations: buiaLibreAmeliorations, buiaLibreAideQuestions: buiaLibreAideQuestions, buiaLibreSaisieVide: buiaLibreSaisieVide, buiaLibreNettoyer: buiaLibreNettoyer,
    buiaLibreAjouter: buiaLibreAjouter, buiaLibreRetirer: buiaLibreRetirer, buiaLibreEstVide: buiaLibreEstVide, buiaLibreAssembler: buiaLibreAssembler,
    buiaLibreAjoutDejaPresent: buiaLibreAjoutDejaPresent, buiaLibreMessageACompleter: buiaLibreMessageACompleter,
    BUIA_LIBRE_MAX_AJOUTS: BUIA_LIBRE_MAX_AJOUTS, BUIA_LIBRE_MAX_PRECISION: BUIA_LIBRE_MAX_PRECISION };
}
