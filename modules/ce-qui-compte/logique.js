/* ============================================================
   modules/ce-qui-compte/logique.js
   Espace « Ce qui compte pour moi » : LOGIQUE PURE (aucun accès au navigateur ni au dossier de la personne).
   Lit les descriptions de cartes (data/cqcpmCartes.js, cqcpmValeurs.js, cqcpmConditions.js), contrôle les réponses, construit les résultats,
   garde / efface une carte, et prépare ou relit ce qui part sur la disquette. Testée : tests/ceQuiCompteLogique.test.js.
   Chargé comme script classique : tous les noms commencent par cqcpm / CQCPM / _cqcpm.

   Règles tenues ici (décisions de Denis, consignes 554 à 559) :
   - rien n'est enregistré en route : les réponses vivent dans l'état de session ; la disquette ne reçoit QUE les cartes que la personne a gardées ;
   - tout ce qui vient d'un fichier est relu avec méfiance : identifiants connus, tailles limitées, jamais une valeur prise telle quelle ;
   - aucun score, aucun type de personne, aucun effet sur les métiers, le CV ni un prompt.
   ============================================================ */

var _cqcpmD = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('../../data/cqcpmValeurs.js'), require('../../data/cqcpmConditions.js'), require('../../data/cqcpmCartes.js'))
  : { CQCPM_VALEURS_GROUPES: CQCPM_VALEURS_GROUPES, CQCPM_VALEURS: CQCPM_VALEURS, CQCPM_PILES: CQCPM_PILES, CQCPM_REPONSES_CONDITIONS: CQCPM_REPONSES_CONDITIONS,
      CQCPM_CONDITIONS_THEMES: CQCPM_CONDITIONS_THEMES, CQCPM_ENERGIE_CHOIX: CQCPM_ENERGIE_CHOIX, CQCPM_ENERGIE_SITUATIONS: CQCPM_ENERGIE_SITUATIONS,
      CQCPM_THEMES_ACCUEIL: CQCPM_THEMES_ACCUEIL, CQCPM_CARTES: CQCPM_CARTES };

var CQCPM_VERSION_SAUVEGARDE = 1;
var CQCPM_MAX_TEXTE = 600;
var CQCPM_MAX_TEXTE_COURT = 120;
var CQCPM_MAX_PHRASE = 200;

// ---------------------------------------------------------------- Catalogues et cartes

// Échappement du texte inséré dans du HTML (écrans, documents imprimés) : une seule définition, lue par ecrans.js, index.js et document.js.
function _cqcpmEsc(t) { return String(t === undefined || t === null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

function cqcpmCartes() { return _cqcpmD.CQCPM_CARTES; }
function cqcpmThemes() { return _cqcpmD.CQCPM_THEMES_ACCUEIL; }
function cqcpmCarte(id) { return cqcpmCartes().filter(function (c) { return c.id === id; })[0] || null; }
// Les cartes d'un thème de l'accueil, dans l'ordre de la description.
function cqcpmCartesDuTheme(themeId) { return cqcpmCartes().filter(function (c) { return c.theme === themeId; }); }

// Les groupes de lignes d'un champ « lignes » : [ { id, titre, sous?, icone?, lignes: [ { id, lib } ] } ].
function cqcpmGroupesDe(champ) {
  var nom = champ.groupes;
  if (nom === 'valeurs') { return _cqcpmD.CQCPM_VALEURS_GROUPES.map(function (g) { return { id: g.id, titre: g.titre, lignes: g.valeurs }; }); }
  if (nom === 'conditions') { return _cqcpmD.CQCPM_CONDITIONS_THEMES.map(function (t) { return { id: t.id, titre: t.titre, sous: t.sous, icone: t.icone, renvoi: t.renvoi, lignes: t.conds }; }); }
  if (nom === 'energie') { return [ { id: 'energie', titre: '', lignes: _cqcpmD.CQCPM_ENERGIE_SITUATIONS } ]; }
  return Array.isArray(nom) ? nom : [];
}
// Les réponses possibles d'un champ « lignes » : [ { id, nom, icone? } ].
function cqcpmOptionsLignes(champ) {
  var nom = champ.options;
  if (nom === 'piles') { return _cqcpmD.CQCPM_PILES; }
  if (nom === 'reponsesConditions') { return _cqcpmD.CQCPM_REPONSES_CONDITIONS; }
  if (nom === 'energieChoix') { return _cqcpmD.CQCPM_ENERGIE_CHOIX; }
  return Array.isArray(nom) ? nom : [];
}
// Tous les champs d'une carte, à plat (les champs rangés dans un groupe de lignes compris ; les sous-champs d'une liste d'entrées non).
function cqcpmChampsDeCarte(carte) {
  var l = [];
  carte.ecrans.forEach(function (e) {
    e.champs.forEach(function (c) {
      l.push(c);
      if (c.champsDuGroupe) { Object.keys(c.champsDuGroupe).forEach(function (g) { c.champsDuGroupe[g].forEach(function (x) { l.push(x); }); }); }
    });
  });
  return l;
}
function cqcpmChamp(carte, id) { return cqcpmChampsDeCarte(carte).filter(function (c) { return c.id === id; })[0] || null; }

// Les petites actions écrites dans la carte « Si rien ne m'arrêtait » : proposées par « Mon prochain petit pas ».
function cqcpmPetitesActions(etat) {
  var r = etat && etat.cartes && etat.cartes.envies ? etat.cartes.envies.reponses : null;
  var l = [];
  if (r && Array.isArray(r.fiches)) { r.fiches.forEach(function (f) { if (f && typeof f.petite === 'string' && f.petite.trim() && l.indexOf(f.petite.trim()) === -1) { l.push(f.petite.trim()); } }); }
  return l;
}
// Les choix d'un champ « choix » : [ { id, lib } ], selon les réponses déjà données (et l'état pour la carte « Mon prochain petit pas »).
function cqcpmOptionsChoix(champ, reponses, etat) {
  var o = champ.options;
  if (o === 'valeurs') { return _cqcpmD.CQCPM_VALEURS.map(function (v) { return { id: v.id, lib: v.lib }; }); }
  if (Array.isArray(o)) { return o; }
  if (o && o.depuis) { var src = reponses && Array.isArray(reponses[o.depuis]) ? reponses[o.depuis] : []; return src.map(function (s) { return { id: s, lib: s }; }); }
  if (o && o.depuisCarte === 'petitesActions') { return cqcpmPetitesActions(etat).map(function (s) { return { id: s, lib: s }; }); }
  return [];
}

// ---------------------------------------------------------------- Contrôle des réponses

function _cqcpmTexte(v, max) {
  if (typeof v !== 'string') { return ''; }
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max);
}
function _cqcpmVide(v) {
  if (v === undefined || v === null) { return true; }
  if (typeof v === 'string') { return v.trim() === ''; }
  if (Array.isArray(v)) { return v.every(_cqcpmVide); }
  if (typeof v === 'object') { return Object.keys(v).every(function (k) { return _cqcpmVide(v[k]); }); }
  return false;
}

// Une valeur de champ, contrôlée selon la description du champ. `contexte` : { reponses, etat } (réponses déjà contrôlées de la carte).
function cqcpmNettoyerChamp(champ, valeur, contexte) {
  contexte = contexte || {};
  var t = champ.type, i;
  if (t === 'texte') { return _cqcpmTexte(valeur, champ.court ? CQCPM_MAX_TEXTE_COURT : CQCPM_MAX_TEXTE); }
  if (t === 'liste') {
    if (!Array.isArray(valeur)) { return []; }
    return valeur.map(function (x) { return _cqcpmTexte(x, CQCPM_MAX_PHRASE).trim(); }).filter(function (x) { return x !== ''; }).slice(0, champ.max || 10);
  }
  if (t === 'choix') {
    if (!Array.isArray(valeur)) { return []; }
    var opts = cqcpmOptionsChoix(champ, contexte.reponses, contexte.etat), connus = {};
    opts.forEach(function (o) { connus[o.id] = true; });
    var libre = champ.options && champ.options.depuisCarte;   // propositions d'une autre carte : toute phrase courte est relue, la carte source peut être absente
    return valeur.filter(function (x, k, a) { return typeof x === 'string' && x.length <= CQCPM_MAX_PHRASE && a.indexOf(x) === k && (connus[x] === true || (libre && x.trim() !== '')); }).slice(0, champ.max || 1);
  }
  if (t === 'lignes') {
    var out = {}, lignes = {}, options = {};
    cqcpmGroupesDe(champ).forEach(function (g) { g.lignes.forEach(function (l) { lignes[l.id] = true; }); });
    cqcpmOptionsLignes(champ).forEach(function (o) { options[o.id] = true; });
    if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) { return out; }
    Object.keys(valeur).forEach(function (k) { if (lignes[k] === true && typeof valeur[k] === 'string' && options[valeur[k]] === true) { out[k] = valeur[k]; } });
    return out;
  }
  if (t === 'entrees') {
    if (!Array.isArray(valeur)) { return []; }
    var source = champ.source && contexte.reponses && Array.isArray(contexte.reponses[champ.source]) ? contexte.reponses[champ.source] : null;
    var vus = {}, res = [];
    valeur.forEach(function (e) {
      if (!e || typeof e !== 'object' || res.length >= (champ.max || 3)) { return; }
      var entree = {};
      if (champ.source) {
        var cle = _cqcpmTexte(e.cle, CQCPM_MAX_PHRASE);
        if (!source || source.indexOf(cle) === -1 || vus[cle]) { return; }
        vus[cle] = true; entree.cle = cle;
      }
      champ.champs.forEach(function (c) { entree[c.id] = cqcpmNettoyerChamp(c, e[c.id], { reponses: entree, etat: contexte.etat }); });
      res.push(entree);
    });
    return res;
  }
  return null;
}

// Toutes les réponses d'une carte, contrôlées champ par champ dans l'ordre de la description (un champ peut dépendre d'un champ précédent).
function cqcpmNettoyerReponses(carte, brut, etat) {
  var sortie = {};
  brut = brut && typeof brut === 'object' && !Array.isArray(brut) ? brut : {};
  cqcpmChampsDeCarte(carte).forEach(function (c) {
    var v = cqcpmNettoyerChamp(c, brut[c.id], { reponses: sortie, etat: etat });
    if (!_cqcpmVide(v)) { sortie[c.id] = v; }
  });
  return sortie;
}

// ---------------------------------------------------------------- État de session

function cqcpmEtatInitial() { return { cartes: {}, gardees: {} }; }
function _cqcpmEntree(etat, id) {
  if (!etat.cartes[id]) { etat.cartes[id] = { reponses: {}, termine: false }; }
  return etat.cartes[id];
}
function cqcpmReponsesDe(etat, id) { return etat.cartes[id] ? etat.cartes[id].reponses : {}; }
function cqcpmCarteCommencee(etat, id) { return !!etat.cartes[id] && !_cqcpmVide(etat.cartes[id].reponses); }
function cqcpmEstTerminee(etat, id) { return !!etat.cartes[id] && etat.cartes[id].termine === true; }
function cqcpmMarquerTerminee(etat, id) {
  if (!cqcpmCarte(id) || !cqcpmCarteCommencee(etat, id)) { return false; }
  etat.cartes[id].termine = true;
  return true;
}

// Pose la réponse d'un champ (la valeur est contrôlée), puis recontrôle toute la carte : retirer une envie retire sa fiche, etc.
function cqcpmPoserReponse(etat, carteId, champId, valeur) {
  var carte = cqcpmCarte(carteId);
  if (!carte) { return false; }
  var champ = cqcpmChamp(carte, champId);
  if (!champ) { return false; }
  var e = _cqcpmEntree(etat, carteId), nouveau = {};
  Object.keys(e.reponses).forEach(function (k) { nouveau[k] = e.reponses[k]; });
  nouveau[champId] = valeur;
  e.reponses = cqcpmNettoyerReponses(carte, nouveau, etat);
  return true;
}

// ---------------------------------------------------------------- Garder, effacer

function cqcpmDateDuJour() {
  var d = new Date();
  function deux(n) { return (n < 10 ? '0' : '') + n; }
  return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate());
}
var _CQCPM_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
// « 2026-11-22 » -> « 22 novembre 2026 » (les dates s'affichent toujours en français).
function cqcpmDateFr(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m || +m[2] < 1 || +m[2] > 12) { return ''; }
  return (+m[3]) + (+m[3] === 1 ? 'er ' : ' ') + _CQCPM_MOIS[+m[2] - 1] + ' ' + m[1];
}
function cqcpmEstGardee(etat, id) { return !!etat.gardees[id]; }
// « Garder mon résultat » : une carte vide ne se garde pas. Le texte gardé est une copie : modifier la carte ensuite ne change pas ce qui est gardé tant que la personne ne garde pas à nouveau.
function cqcpmGarder(etat, id, dateIso) {
  var carte = cqcpmCarte(id);
  if (!carte || !cqcpmCarteCommencee(etat, id)) { return false; }
  var r = cqcpmNettoyerReponses(carte, JSON.parse(JSON.stringify(etat.cartes[id].reponses)), etat);
  if (_cqcpmVide(r)) { return false; }
  etat.gardees[id] = { date: /^\d{4}-\d{2}-\d{2}$/.test(String(dateIso || '')) ? dateIso : cqcpmDateDuJour(), reponses: r };
  etat.cartes[id].termine = true;
  return true;
}
function cqcpmNePlusGarder(etat, id) { if (!etat.gardees[id]) { return false; } delete etat.gardees[id]; if (etat.envoi) { delete etat.envoi[id]; } return true; }
// « Effacer » dans « Ce que j'ai gardé » : la carte gardée et ses réponses de la séance.
function cqcpmEffacerCarte(etat, id) { delete etat.gardees[id]; delete etat.cartes[id]; if (etat.envoi) { delete etat.envoi[id]; } return true; }
function cqcpmToutEffacer(etat) { etat.gardees = {}; etat.cartes = {}; delete etat.envoi; delete etat.papier; delete etat.papierRetire; return true; }
// Les cartes gardées dans l'ordre de l'espace : [ { id, nom, date } ] (point d'entrée futur vers « Ma synthèse »).
function cqcpmCartesGardees(etat) {
  return cqcpmCartes().filter(function (c) { return !!etat.gardees[c.id]; }).map(function (c) { return { id: c.id, nom: c.nom, date: etat.gardees[c.id].date }; });
}
function cqcpmNombreGardees(etat) { return cqcpmCartesGardees(etat).length; }

// ---------------------------------------------------------------- Résultat d'une carte

function _cqcpmLibChoix(champ, ids, reponses, etat) {
  var opts = cqcpmOptionsChoix(champ, reponses, etat), l = {};
  opts.forEach(function (o) { l[o.id] = o.lib; });
  return (ids || []).map(function (id) { return l[id] || id; });
}
function _cqcpmMinuscule(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
// Les lignes d'une entrée : [ { lib, texte } ], sans les champs vides ni le champ déjà placé dans le titre.
function _cqcpmLignesEntree(champEntrees, entree, etat) {
  var lignes = [];
  champEntrees.champs.forEach(function (c) {
    if (c.id === champEntrees.titreChamp || c.dansTitre) { return; }
    var v = entree[c.id];
    if (_cqcpmVide(v)) { return; }
    var texte = c.type === 'choix' ? _cqcpmLibChoix(c, v, entree, etat).join(', ') : String(v);
    lignes.push({ lib: c.libResultat || c.lib, texte: texte });
  });
  return lignes;
}
function _cqcpmTitreEntree(champEntrees, entree, etat, rang) {
  var t = String(entree[champEntrees.titreChamp] || '').trim();
  var suite = '';
  champEntrees.champs.forEach(function (c) {
    if (c.dansTitre && Array.isArray(entree[c.id]) && entree[c.id].length) { suite = ' (' + _cqcpmMinuscule(_cqcpmLibChoix(c, entree[c.id], entree, etat)[0]) + ')'; }
  });
  return (t || 'Entrée ' + (rang + 1)) + suite;
}

// Le résultat : { carte, titre, sections: [ { type, titre, icone, vide, ... } ] }. `vide` : rien n'a été répondu pour cette section (l'écran affiche « À compléter »).
function cqcpmResultat(carteId, reponses, etat) {
  var carte = cqcpmCarte(carteId);
  if (!carte) { return null; }
  reponses = reponses || {};
  var sections = carte.resultat.map(function (s) {
    var champ = s.champ ? cqcpmChamp(carte, s.champ) : null;
    var v = s.champ ? reponses[s.champ] : null;
    var base = { type: s.mode, titre: s.titre, icone: s.icone, vide: false, masquerSiVide: !!s.masquerSiVide };
    if (s.mode === 'texte') { base.texte = typeof v === 'string' ? v.trim() : ''; base.vide = base.texte === ''; return base; }
    if (s.mode === 'liste') { base.items = Array.isArray(v) ? v.slice() : []; base.vide = base.items.length === 0; return base; }
    if (s.mode === 'option') {
      base.items = [];
      if (champ && v) { cqcpmGroupesDe(champ).forEach(function (g) { g.lignes.forEach(function (l) { if (v[l.id] === s.option) { base.items.push(l.lib); } }); }); }
      base.vide = base.items.length === 0; return base;
    }
    if (s.mode === 'colonnes') {
      base.colonnes = champ ? cqcpmOptionsLignes(champ).map(function (o) {
        var items = [];
        cqcpmGroupesDe(champ).forEach(function (g) { g.lignes.forEach(function (l) { if (v && v[l.id] === o.id) { items.push(l.lib); } }); });
        return { id: o.id, nom: o.nom, icone: o.icone || '', items: items };
      }) : [];
      base.vide = base.colonnes.every(function (c) { return c.items.length === 0; }); return base;
    }
    if (s.mode === 'phrases') {
      base.items = [];
      var noms = {};
      if (champ) { cqcpmOptionsLignes(champ).forEach(function (o) { noms[o.id] = o.nom; }); }
      if (champ && v) { cqcpmGroupesDe(champ).forEach(function (g) { g.lignes.forEach(function (l) { if (v[l.id]) { base.items.push({ lib: l.lib.replace(/…$/, '').trim(), reponse: noms[v[l.id]] || v[l.id] }); } }); }); }
      base.vide = base.items.length === 0; return base;
    }
    if (s.mode === 'entrees') {
      base.items = (Array.isArray(v) ? v : []).filter(function (e) { return !_cqcpmVide(e); }).map(function (e, k) {
        return { titre: _cqcpmTitreEntree(champ, e, etat, k), lignes: _cqcpmLignesEntree(champ, e, etat) };
      });
      base.vide = base.items.length === 0; return base;
    }
    if (s.mode === 'textes') {
      base.lignes = [];
      s.champs.forEach(function (id) {
        var c = cqcpmChamp(carte, id), x = reponses[id];
        if (!c || _cqcpmVide(x)) { return; }
        base.lignes.push({ lib: c.libResultat || c.lib, texte: c.type === 'choix' ? _cqcpmLibChoix(c, x, reponses, etat).join(', ') : String(x).trim() });
      });
      base.vide = base.lignes.length === 0; return base;
    }
    base.vide = true;
    return base;
  });
  return { carte: carte.id, titre: carte.nom, sections: sections, vide: sections.every(function (s) { return s.vide; }) };
}

// Une courte ligne qui rappelle ce qui est gardé (page « Ce que j'ai gardé ») : le début du premier résultat qui contient quelque chose.
function cqcpmApercu(carteId, reponses, etat) {
  var r = cqcpmResultat(carteId, reponses, etat), phrase = '';
  if (!r) { return ''; }
  r.sections.some(function (s) {
    if (s.vide) { return false; }
    var l = [];
    if (s.type === 'texte') { l = [s.texte]; }
    else if (s.type === 'liste' || s.type === 'option') { l = s.items; }
    else if (s.type === 'phrases') { l = s.items.map(function (x) { return x.lib + ' : ' + x.reponse; }); }
    else if (s.type === 'entrees') { l = s.items.map(function (x) { return x.titre; }); }
    else if (s.type === 'textes') { l = s.lignes.map(function (x) { return x.texte; }); }
    else if (s.type === 'colonnes') { s.colonnes.some(function (c) { if (c.items.length) { l = [c.nom + ' : ' + c.items.join(', ')]; return true; } return false; }); }
    phrase = l.slice(0, 3).join(' ; ');
    return phrase !== '';
  });
  return phrase.length > 160 ? phrase.slice(0, 157).replace(/\s+\S*$/, '') + '…' : phrase;
}

// ---------------------------------------------------------------- Lien avec « Ma synthèse » (docs/CHANTIER_LIEN_CE_QUI_COMPTE_ET_MA_SYNTHESE_2026-11-22.md, consigne 565)

// Garder une carte vaut accord pour la disquette de la personne, PAS pour un envoi à un assistant en ligne : c'est un second geste, une case par carte gardée.
// Cochée d'avance, sauf pour une carte très personnelle (`envoiParDefaut: false`). Le choix vit dans l'état de session (`etat.envoi`), jamais dans la disquette.
function cqcpmEnvoiCoche(etat, id) {
  var carte = cqcpmCarte(id);
  if (!carte || !etat || !etat.gardees || !etat.gardees[id]) { return false; }
  var choix = etat.envoi && etat.envoi[id];
  return typeof choix === 'boolean' ? choix : carte.envoiParDefaut !== false;
}
function cqcpmChoisirEnvoi(etat, id, oui) {
  if (!cqcpmCarte(id) || !etat) { return false; }
  if (!etat.envoi || typeof etat.envoi !== 'object') { etat.envoi = {}; }
  etat.envoi[id] = !!oui;
  return true;
}
// Les cartes gardées avec leur case : [ { id, nom, coche } ], dans l'ordre de l'espace.
function cqcpmCartesPourEnvoi(etat) {
  return cqcpmCartesGardees(etat).map(function (c) { return { id: c.id, nom: c.nom, coche: cqcpmEnvoiCoche(etat, c.id) }; });
}

var CQCPM_SYN_MAX_TEXTE = 300;    // signes d'un texte libre dans la demande
var CQCPM_SYN_MAX_CARTE = 900;    // signes d'une carte dans la demande
function _cqcpmCourt(t, max) {
  var s = String(t === undefined || t === null ? '' : t).replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s;
}
// Une section du résultat, écrite en une ligne : « titre : contenu ». Chaque texte de la personne est raccourci ; aucune section vide.
function _cqcpmLigneSection(s, nomCarte) {
  if (s.vide) { return ''; }
  var c = function (t) { return _cqcpmCourt(t, CQCPM_SYN_MAX_TEXTE); }, corps = '';
  if (s.type === 'texte') { corps = c(s.texte); }
  else if (s.type === 'liste' || s.type === 'option') { corps = s.items.map(c).join(' ; '); }
  else if (s.type === 'phrases') { corps = s.items.map(function (x) { return c(x.lib) + ' ' + c(x.reponse); }).join(' ; '); }
  else if (s.type === 'colonnes') { corps = s.colonnes.filter(function (k) { return k.items.length; }).map(function (k) { return c(k.nom) + ' : ' + k.items.map(c).join(', '); }).join(' ; '); }
  else if (s.type === 'entrees') { corps = s.items.map(function (e) { return c(e.titre) + (e.lignes.length ? ' (' + e.lignes.map(function (l) { return c(l.lib) + ' : ' + c(l.texte); }).join(' ; ') + ')' : ''); }).join(' ; '); }
  else if (s.type === 'textes') { corps = s.lignes.map(function (l) { return c(l.lib) + ' : ' + c(l.texte); }).join(' ; '); }
  return corps ? (s.titre === nomCarte ? '' : s.titre + ' : ') + corps : '';   // une section qui porte le nom de la carte ne répète pas son titre
}
// Ce qui part vers la demande de « Ma lecture » : UNE chaîne par carte gardée ET cochée, jamais le brouillon de la séance, aucun nom. Tableau vide si rien ne part.
function cqcpmPourSynthese(etat) {
  if (!etat || !etat.gardees) { return []; }
  var lignes = [];
  cqcpmCartes().forEach(function (carte) {
    if (!cqcpmEnvoiCoche(etat, carte.id)) { return; }
    var g = etat.gardees[carte.id];
    var r = cqcpmResultat(carte.id, cqcpmNettoyerReponses(carte, JSON.parse(JSON.stringify(g.reponses)), etat), etat);
    if (!r || r.vide) { return; }
    var corps = r.sections.map(function (sec) { return _cqcpmLigneSection(sec, carte.nom); }).filter(Boolean).join(' / ');
    if (corps) { lignes.push(_cqcpmCourt(carte.nom + ' : ' + corps, CQCPM_SYN_MAX_CARTE)); }
  });
  return lignes;
}

// ---------------------------------------------------------------- Disquette

// Ce qui part dans le fichier : SEULEMENT les cartes gardées (réponses de la carte, jamais le brouillon de la séance). null si rien n'est gardé.
function cqcpmPourFichier(etat) {
  if (!etat || !etat.gardees) { return null; }
  var cartes = {}, n = 0;
  cqcpmCartes().forEach(function (c) {
    var g = etat.gardees[c.id];
    if (!g) { return; }
    var r = cqcpmNettoyerReponses(c, JSON.parse(JSON.stringify(g.reponses)), etat);
    if (_cqcpmVide(r)) { return; }
    cartes[c.id] = { date: g.date, reponses: r }; n++;
  });
  return n ? { version: CQCPM_VERSION_SAUVEGARDE, cartes: cartes } : null;
}
// Relit un fichier avec méfiance : seules les cartes connues, des réponses contrôlées, une date valide. Retourne toujours un état utilisable.
function cqcpmDepuisFichier(brut) {
  var etat = cqcpmEtatInitial();
  if (!brut || typeof brut !== 'object' || !brut.cartes || typeof brut.cartes !== 'object' || Array.isArray(brut.cartes)) { return etat; }
  cqcpmCartes().forEach(function (c) {
    var g = brut.cartes[c.id];
    if (!g || typeof g !== 'object') { return; }
    var r = cqcpmNettoyerReponses(c, g.reponses, etat);
    if (_cqcpmVide(r)) { return; }
    var date = typeof g.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(g.date) && cqcpmDateFr(g.date) !== '' ? g.date : '';
    etat.gardees[c.id] = { date: date, reponses: JSON.parse(JSON.stringify(r)) };
    etat.cartes[c.id] = { reponses: r, termine: true };
  });
  return etat;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CQCPM_VERSION_SAUVEGARDE: CQCPM_VERSION_SAUVEGARDE, CQCPM_MAX_TEXTE: CQCPM_MAX_TEXTE, CQCPM_MAX_TEXTE_COURT: CQCPM_MAX_TEXTE_COURT, CQCPM_MAX_PHRASE: CQCPM_MAX_PHRASE,
    _cqcpmEsc: _cqcpmEsc, cqcpmCartes: cqcpmCartes, cqcpmThemes: cqcpmThemes, cqcpmCarte: cqcpmCarte, cqcpmCartesDuTheme: cqcpmCartesDuTheme, cqcpmGroupesDe: cqcpmGroupesDe,
    cqcpmOptionsLignes: cqcpmOptionsLignes, cqcpmChampsDeCarte: cqcpmChampsDeCarte, cqcpmChamp: cqcpmChamp, cqcpmPetitesActions: cqcpmPetitesActions,
    cqcpmOptionsChoix: cqcpmOptionsChoix, cqcpmNettoyerChamp: cqcpmNettoyerChamp, cqcpmNettoyerReponses: cqcpmNettoyerReponses,
    cqcpmEtatInitial: cqcpmEtatInitial, cqcpmReponsesDe: cqcpmReponsesDe, cqcpmCarteCommencee: cqcpmCarteCommencee, cqcpmEstTerminee: cqcpmEstTerminee,
    cqcpmMarquerTerminee: cqcpmMarquerTerminee, cqcpmPoserReponse: cqcpmPoserReponse, cqcpmDateDuJour: cqcpmDateDuJour, cqcpmDateFr: cqcpmDateFr,
    cqcpmEstGardee: cqcpmEstGardee, cqcpmGarder: cqcpmGarder, cqcpmNePlusGarder: cqcpmNePlusGarder, cqcpmEffacerCarte: cqcpmEffacerCarte, cqcpmToutEffacer: cqcpmToutEffacer,
    cqcpmCartesGardees: cqcpmCartesGardees, cqcpmNombreGardees: cqcpmNombreGardees, cqcpmResultat: cqcpmResultat, cqcpmApercu: cqcpmApercu,
    cqcpmEnvoiCoche: cqcpmEnvoiCoche, cqcpmChoisirEnvoi: cqcpmChoisirEnvoi, cqcpmCartesPourEnvoi: cqcpmCartesPourEnvoi, cqcpmPourSynthese: cqcpmPourSynthese,
    cqcpmPourFichier: cqcpmPourFichier, cqcpmDepuisFichier: cqcpmDepuisFichier
  };
}
