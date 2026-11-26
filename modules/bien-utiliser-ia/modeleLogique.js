/* ============================================================
   modules/bien-utiliser-ia/modeleLogique.js
   Chemin 2 : ASSEMBLAGE de la demande d'un modèle (logique pure, testée : tests/bienUtiliserIaModele4.test.js).
   La demande n'est pas un texte fixe : le code assemble des BLOCS lus dans le fichier du modèle (prompts/bien-utiliser-modele-N.md), dans l'ordre de data/buiaModeles.js.
   Règles de montage vérifiées par les tests : un seul bloc par groupe de choix ; aucun crochet ni accolade restés dans le texte final ; un champ obligatoire vide
   (le courrier, la situation) empêche de copier la demande ; aucune ligne vide en double ; ordre fixe ; aucun texte de secours dans le code.
   Tous les noms commencent par buia / BUIA / _buia (scripts classiques).
   ============================================================ */

var _buiaMD = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('../../data/buiaModeles.js'), require('./papierLogique.js'), require('./blocs.js'))
  : { BUIA_DEF_MODELES: BUIA_DEF_MODELES, buiaLigneDateDuJour: buiaLigneDateDuJour, buiaLigneRepriseDate: buiaLigneRepriseDate, buiaResteACompleter: buiaResteACompleter };

function buiaDefModele(id) { return _buiaMD.BUIA_DEF_MODELES[id] || null; }
// Le texte de ce modèle existe-t-il et est-il codé ? (les treize modèles.)
function buiaModeleDisponible(id) { return !!buiaDefModele(id); }

// Tous les blocs que le modèle demande dans son fichier : ceux de l'ordre, et chacun des choix de chaque groupe.
function buiaNomsBlocsModele(id) {
  var def = buiaDefModele(id), noms = [];
  if (!def) { return noms; }
  def.ordre.forEach(function (o) { if (o.bloc && noms.indexOf(o.bloc) === -1) { noms.push(o.bloc); } });
  def.groupes.forEach(function (g) { g.choix.forEach(function (c) { if (noms.indexOf(c.bloc) === -1) { noms.push(c.bloc); } }); });
  return noms;
}

// Contrôle d'un fichier lu (résultat de buiaLireBlocs). Liste de problèmes en français ; vide = utilisable.
// Seuls les repères des champs du modèle ({{situation}}, {{courrier}}...) sont permis, et seulement dans le bloc qui les porte ; jamais d'autre crochet ni accolade,
// sauf les textes que le modèle déclare dans `crochetsPermis` (consignes données à l'assistant, par exemple « [à compléter] » dans le courrier à écrire).
function buiaVerifierBlocsModele(id, lecture) {
  var def = buiaDefModele(id), p = [];
  if (!def) { return ['Modèle inconnu : ' + id]; }
  var r = lecture || { blocs: {}, doublons: [] }, b = r.blocs || {};
  buiaNomsBlocsModele(id).forEach(function (n) { if (!Object.prototype.hasOwnProperty.call(b, n) || !String(b[n]).trim()) { p.push('Bloc absent ou vide : ' + n); } });
  (r.doublons || []).forEach(function (n) { p.push('Bloc écrit deux fois : ' + n); });
  var reperes = def.champs.map(function (c) { return '{{' + c.repere + '}}'; });
  Object.keys(b).forEach(function (n) {
    var t = String(b[n]);
    if (/[–—]/.test(t)) { p.push('Tiret long dans le bloc : ' + n); }
    reperes.forEach(function (rp) { t = t.split(rp).join(''); });
    (def.crochetsPermis || []).forEach(function (cp) { t = t.split(cp).join(''); });
    if (/[\[\]{}]/.test(t)) { p.push('Crochet ou accolade dans le bloc : ' + n + ' (seuls ' + reperes.join(' et ') + (def.crochetsPermis ? ' et ' + def.crochetsPermis.join(' ') : '') + ' sont permis)'); }
  });
  // Un repère doit être envoyé exactement une fois. Quand il est dans un groupe de choix (par exemple « un rendez-vous » ou « un appel »), chaque choix du groupe le porte autant de fois.
  function occurrences(nom, rp) { return Object.prototype.hasOwnProperty.call(b, nom) ? String(b[nom]).split(rp).length - 1 : 0; }
  def.champs.forEach(function (c) {
    var rp = '{{' + c.repere + '}}', nb = 0;
    def.ordre.forEach(function (o) {
      if (o.bloc) { nb += occurrences(o.bloc, rp); }
      else if (o.groupe) {
        var g = def.groupes.filter(function (x) { return x.id === o.groupe; })[0], n = g.choix.map(function (x) { return occurrences(x.bloc, rp); });
        if (n.some(function (v) { return v !== n[0]; })) { p.push('Le repère ' + rp + ' doit être dans chaque choix du groupe ' + g.id + ', ou dans aucun'); }
        nb += n[0] || 0;
      }
    });
    if (nb !== 1) { p.push('Le repère ' + rp + ' doit apparaître exactement une fois (trouvé : ' + nb + ')'); }
  });
  return p;
}

// Saisie de la personne, complétée par les valeurs par défaut : { champs: { situation, courrier }, choix: { variante, longueur, ... } }.
function buiaSaisieParDefaut(id) {
  var def = buiaDefModele(id), s = { champs: {}, choix: {} };
  if (!def) { return s; }
  def.champs.forEach(function (c) { s.champs[c.id] = ''; });
  def.groupes.forEach(function (g) { s.choix[g.id] = g.defaut; });
  return s;
}
function buiaNettoyerSaisie(id, saisie) {
  var def = buiaDefModele(id), s = buiaSaisieParDefaut(id), x = saisie || {};
  if (!def) { return s; }
  def.champs.forEach(function (c) { if (x.champs && typeof x.champs[c.id] === 'string') { s.champs[c.id] = x.champs[c.id]; } });
  def.groupes.forEach(function (g) {
    var v = x.choix ? x.choix[g.id] : undefined;
    s.choix[g.id] = g.choix.some(function (c) { return c.v === v; }) ? v : g.defaut;
  });
  return s;
}

// La saisie telle qu'elle peut partir sur la disquette : les champs marqués `gardee: false` (le courrier) sont vidés, jamais gardés.
function buiaSaisiePourGarde(id, saisie) {
  var def = buiaDefModele(id), s = buiaNettoyerSaisie(id, saisie);
  if (!def) { return s; }
  def.champs.forEach(function (c) { if (c.gardee === false) { s.champs[c.id] = ''; } });
  return s;
}

// Assemble la demande. contexte : { aujourdhui: Date, alerte: résultat de buiaAlerteDates, reprise: true si la personne a coché « Ajouter cette date » }.
// Retour : { lignes: [{ element, texte, saut }], texte, manque: [noms courts des champs vides], aCompleter: true s'il reste quelque chose à compléter }.
// Un bloc absent du fichier est ignoré (buiaVerifierBlocsModele le signale avant : le module n'affiche alors aucune demande).
function buiaAssemblerModele(id, blocs, saisie, contexte) {
  var def = buiaDefModele(id);
  if (!def) { return { lignes: [], texte: '', manque: [], aCompleter: true }; }
  var b = blocs || {}, s = buiaNettoyerSaisie(id, saisie), ctx = contexte || {}, lignes = [], manque = [];
  var valeurs = {}, remplis = {};
  // Les modèles pour les professionnels (`confirmation`) demandent une case cochée : « J'ai retiré les noms ». Elle se lit dans la saisie d'origine (jamais gardée ni nettoyée : une demande rouverte la redemande).
  if (def.confirmation && !(saisie && saisie.confirme === true)) { manque.push(def.confirmation.court); }
  def.champs.forEach(function (c) {
    var v = String(s.champs[c.id] || '');
    v = (c.sansPointFinal || c.id === 'situation') ? v.trim().replace(/[.\s]+$/, '') : v.trim();
    // Un champ peut rester vide : toujours (`facultatif`, par exemple le courrier de convocation) ou selon un choix (`facultatifSi`).
    var facultatif = !!c.facultatif || !!(c.facultatifSi && s.choix[c.facultatifSi.groupe] === c.facultatifSi.v);
    if (!v && !facultatif) { manque.push(c.court); }
    valeurs[c.repere] = v || c.vide;
    remplis[c.id] = !!v;
  });
  function remplir(t) { return t.replace(/\{\{(\w+)\}\}/g, function (m, nom) { return Object.prototype.hasOwnProperty.call(valeurs, nom) ? valeurs[nom] : m; }); }
  function bloc(nom) { return Object.prototype.hasOwnProperty.call(b, nom) && String(b[nom]).trim() ? remplir(String(b[nom]).trim()) : ''; }
  def.ordre.forEach(function (o) {
    var texte = '', element = o.element;
    if (o.sauf && Object.keys(o.sauf).some(function (k) { return s.choix[k] === o.sauf[k]; })) { return; }
    if (o.siChamp && !remplis[o.siChamp]) { return; }
    if (o.sansChamp && remplis[o.sansChamp]) { return; }
    if (o.bloc) { texte = bloc(o.bloc); }
    else if (o.groupe) {
      var g = def.groupes.filter(function (x) { return x.id === o.groupe; })[0], c = g.choix.filter(function (x) { return x.v === s.choix[g.id]; })[0];
      element = g.element; texte = c ? bloc(c.bloc) : '';
    } else if (o.code === 'dateDuJour') { texte = _buiaMD.buiaLigneDateDuJour(ctx.aujourdhui); }
    else if (o.code === 'repriseDate') { texte = ctx.reprise ? _buiaMD.buiaLigneRepriseDate(ctx.alerte) : ''; }
    if (texte) { lignes.push({ element: element, texte: texte, saut: !!o.saut }); }
  });
  var out = '';
  lignes.forEach(function (l, i) { out += (i === 0 ? '' : (l.saut ? '\n\n' : '\n')) + l.texte; });
  // Les textes que le modèle donne en consigne à l'assistant (`crochetsPermis`) ne sont pas des trous à remplir : ils sont écartés avant de chercher ce qui reste à compléter.
  var pourControle = out;
  (def.crochetsPermis || []).forEach(function (cp) { pourControle = pourControle.split(cp).join(''); });
  return { lignes: lignes, texte: out, manque: manque, aCompleter: manque.length > 0 || _buiaMD.buiaResteACompleter(pourControle) };
}

// « Pour copier votre demande, complétez : votre situation, le courrier. »
function buiaMessageACompleter(manque) {
  return (manque && manque.length) ? 'Pour copier votre demande, complétez : ' + manque.join(', ') + '.' : '';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buiaDefModele: buiaDefModele, buiaModeleDisponible: buiaModeleDisponible, buiaNomsBlocsModele: buiaNomsBlocsModele, buiaVerifierBlocsModele: buiaVerifierBlocsModele,
    buiaSaisieParDefaut: buiaSaisieParDefaut, buiaNettoyerSaisie: buiaNettoyerSaisie, buiaSaisiePourGarde: buiaSaisiePourGarde, buiaAssemblerModele: buiaAssemblerModele, buiaMessageACompleter: buiaMessageACompleter };
}
