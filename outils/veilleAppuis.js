/* ============================================================
   veilleAppuis.js  --  « appuis » des textes écrits à la main de « Comprendre les chiffres » (consigne 143, option 3 de A13)
   ------------------------------------------------------------
   Problème : une phrase comme « un peu en dessous de la moyenne française » est un SENS, pas un chiffre. Quand un relevé change,
   le chiffre peut rester plausible alors que le sens s'inverse, et personne ne le voit.
   Solution (validée par Denis le 07/11/2026) : un fichier à part, propre à l'outil de veille (outils/appuis/<fichier>.appuis.txt, jamais lu
   par l'application), déclare pour chaque texte les chiffres et les sens dont il dépend. Ce module les compare aux données actuelles :
     - niveau « forte »  : un sens s'inverse (« en dessous » devient « au-dessus », « en hausse » devient « en baisse »), ou un appui n'est plus vérifiable ;
     - niveau « legere » : seul un chiffre déclaré a bougé.
   Le code ne réécrit JAMAIS le texte de l'application : il signale. Quand la personne a relu, « alignerAppuis » met à jour la DÉCLARATION
   (le fichier d'appuis), jamais le texte.
   Aucune dépendance autre que veilleChiffres.js (Node seul) ; ce module est pur : il reçoit des textes et rend des textes.

   Format du fichier d'appuis (une ligne par appui, champs séparés par « | » ; les lignes commençant par # sont des commentaires) :
     texte: Lecture du territoire | Dordogne            (début d'un bloc ; tout ce qui suit, indenté, appartient à ce texte)
       valeur: <section> | <libellé> | valeur | 7,9 %    (champ : valeur, précédent, il y a un an ; le dernier élément est le chiffre déclaré)
       sens: <section> | <libellé A> | moins que | <section> | <libellé B>      (ou « plus que » ; compare les valeurs)
       evolution: <section> | <libellé> | hausse          (ou « baisse » ; compare le dernier point de la série à celui d'il y a quatre trimestres)
     signe: <section> | <libellé> | positif             (ou « négatif » ; pour un chiffre signé comme +0,2 % ou -0,1 %)
   Pour le portrait et l'Europe (des phrases, pas des libellés) : le libellé est « début de la phrase#adresse » (voir « indexerAnnuel » plus bas).
       relu_le: 2026-11-07                                 (écrit par « J'ai relu », jamais à la main)
   ============================================================ */
'use strict';

const chiffres = require('./veilleChiffres.js');

const CHAMPS = { 'valeur': 'valeur', 'précédent': 'precedent', 'precedent': 'precedent', 'il y a un an': 'anPrecedent' };
const OPS_SENS = ['moins que', 'plus que'];
const OPS_EVOLUTION = ['hausse', 'baisse'];
const OPS_SIGNE = ['positif', 'négatif'];

function normaliser(t) { return String(t || '').replace(/\r\n/g, '\n'); }

// Lit le fichier d'appuis. Rend { textes: [{ cle, lignes: [{ brut, type, champs }] }], problemes: [...] }.
function lireAppuis(texte) {
  const textes = [], problemes = [];
  let courant = null;
  normaliser(texte).split('\n').forEach(function (brut, i) {
    const l = brut.trim();
    if (l === '' || l.charAt(0) === '#') { return; }
    let m;
    if ((m = /^texte:\s*(.+)$/.exec(l))) { courant = { cle: m[1].trim(), lignes: [] }; textes.push(courant); return; }
    if (!courant) { problemes.push('Ligne ' + (i + 1) + ' : un appui doit suivre une ligne « texte: ... ».'); return; }
    m = /^(valeur|sens|evolution|signe|relu_le):\s*(.*)$/.exec(l);
    if (!m) { problemes.push('Ligne ' + (i + 1) + ' : appui non reconnu (« ' + l.slice(0, 40) + ' »).'); return; }
    const champs = m[2].split('|').map(function (x) { return x.trim(); });
    const attendu = { valeur: 4, sens: 5, evolution: 3, signe: 3, relu_le: 1 }[m[1]];
    if (champs.length !== attendu) { problemes.push('Ligne ' + (i + 1) + ' : « ' + m[1] + ' » demande ' + attendu + ' éléments séparés par « | », il y en a ' + champs.length + '.'); return; }
    courant.lignes.push({ brut: brut, type: m[1], champs: champs });
  });
  return { textes: textes, problemes: problemes };
}

// Les chiffres d'un document annuel (portrait, Europe) sont dans des phrases : un appui y est adressé par « début de la phrase#adresse » où l'adresse est
//   un numéro de chiffre en gras (« #3 » = le 3e passage en gras ; « #3.2 » = le 2e nombre dans ce passage en gras)
//   ou un texte repère (« #>niveau national, environ » = le premier nombre qui suit ce texte, pour un chiffre qui n'est pas en gras).
// Le début de la phrase (ou du paragraphe) est lu comme un préfixe : il doit désigner une seule phrase de la rubrique, sinon l'appui est « introuvable ».
const RE_NOMBRE = /-?\d(?:[\d\s  .,]*\d)?(?:[\s  ]?%)?/g;
function nombresDe(texte) { return (String(texte).match(RE_NOMBRE) || []).map(function (x) { return x.trim(); }); }

function indexerAnnuel(texteAnnuel) {
  const lu = chiffres.lireAnnuel(texteAnnuel);
  if (!lu.ok) { return { ok: false, erreur: lu.erreur || 'Fichier de chiffres illisible.' }; }
  const items = lu.puces.map(function (p) { return { section: p.section, texte: p.avant }; })
    .concat((lu.paragraphes || []).map(function (p) { return { section: p.section, texte: p.avant }; }));
  const chercher = function (section, label) {
    const i = String(label).lastIndexOf('#');
    if (i < 1) { return null; }
    const debut = label.slice(0, i), sel = label.slice(i + 1);
    const cands = items.filter(function (it) { return it.section === section && it.texte.indexOf(debut) === 0; });
    if (cands.length !== 1) { return null; }
    const t = cands[0].texte;
    let v = null;
    if (sel.charAt(0) === '>') {
      const ancre = sel.slice(1), k = t.indexOf(ancre);
      if (!ancre || k < 0) { return null; }
      v = nombresDe(t.slice(k + ancre.length))[0] || null;
    } else {
      const m = /^(\d+)(?:\.(\d+))?$/.exec(sel);
      if (!m) { return null; }
      const g = chiffres.gras(t)[+m[1] - 1];
      v = g ? (nombresDe(g)[(m[2] ? +m[2] : 1) - 1] || null) : null;
    }
    return v ? { valeur: v } : null;
  };
  return { ok: true, chercher: chercher };
}

// Les entrées du digest trimestriel, par référence « section | libellé ». 'forme' : 'digest' (par défaut) ou 'annuel'.
function indexerDigest(texteDigest, forme) {
  if (forme === 'annuel') { return indexerAnnuel(texteDigest); }
  const lu = chiffres.lireDigest(texteDigest), index = {};
  if (!lu.ok) { return { ok: false, erreur: lu.erreur || 'Fichier de chiffres illisible.' }; }
  lu.entrees.forEach(function (e) { if (e.entree && e.n === 1) { index[e.section + ' | ' + e.label] = e.entree; } });
  return { ok: true, chercher: function (section, label) { return index[section + ' | ' + label] || null; } };
}

// Le nom d'un appui dans un message : « Santé : la densité (3e chiffre en gras) » pour un document annuel, le libellé tel quel pour un digest.
function nomAppui(label) {
  const i = String(label).lastIndexOf('#');
  if (i < 1) { return label; }
  const debut = label.slice(0, i).replace(/\*/g, '').trim(), sel = label.slice(i + 1);
  if (sel.charAt(0) === '>') { return debut.slice(0, 40) + ' (le chiffre qui suit « ' + sel.slice(1) + ' »)'; }
  const m = /^(\d+)(?:\.(\d+))?$/.exec(sel);
  return debut.slice(0, 40) + (m ? ' (' + m[1] + (m[1] === '1' ? 'er' : 'e') + ' chiffre en gras' + (m[2] ? ', nombre ' + m[2] : '') + ')' : '');
}

function point(entree, quand) { // quand : 'dernier' ou 'il y a un an' (quatre points avant)
  const s = entree.serie || [], n = s.length;
  if (quand === 'dernier') { return n ? chiffres.nombre(s[n - 1].v) : chiffres.nombre(entree.valeur); }
  if (n > 4) { return chiffres.nombre(s[n - 5].v); }
  return chiffres.nombre(entree.anPrecedent);
}

const EN_MOTS = { 'moins que': 'en dessous de', 'plus que': 'au-dessus de', 'égal à': 'au même niveau que' };
function relationActuelle(a, b) { return a < b ? 'moins que' : (a > b ? 'plus que' : 'égal à'); }
function signeActuel(v) { return v > 0 ? 'positif' : (v < 0 ? 'négatif' : 'nul'); }
function evolutionActuelle(e) { const d = point(e, 'dernier'), a = point(e, 'an'); return (d === null || a === null) ? null : (d > a ? 'hausse' : (d < a ? 'baisse' : 'stable')); }

// Contrôle un fichier d'appuis contre un digest. Rend { ok, textes: [{ cle, alertes: [{ niveau, message }], nbAppuis }], problemes, nbAppuis }.
function controlerAppuis(texteDigest, texteAppuis, forme) {
  const dig = indexerDigest(texteDigest, forme);
  if (!dig.ok) { return { ok: false, erreur: dig.erreur }; }
  const lu = lireAppuis(texteAppuis);
  let nbAppuis = 0;
  const textes = lu.textes.map(function (t) {
    const alertes = [];
    let n = 0;
    t.lignes.forEach(function (l) {
      if (l.type === 'relu_le') { return; }
      n++;
      const c = l.champs;
      if (l.type === 'valeur') {
        const e = dig.chercher(c[0], c[1]), champ = CHAMPS[c[2].toLowerCase()];
        if (!e || !champ) { alertes.push({ niveau: 'forte', message: 'Appui « ' + nomAppui(c[1]) + ' » (' + c[2] + ') : introuvable dans le fichier de chiffres, il ne peut plus être vérifié.' }); return; }
        const actuel = e[champ], a = chiffres.nombre(actuel), d = chiffres.nombre(c[3]);
        if (a === null || d === null || a !== d) { alertes.push({ niveau: 'legere', message: nomAppui(c[1]) + ' : le chiffre ' + (champ === 'valeur' ? 'principal' : '« ' + c[2] + ' »') + ' était ' + c[3] + ', il est maintenant ' + actuel + '.' }); }
      } else if (l.type === 'sens') {
        const ea = dig.chercher(c[0], c[1]), eb = dig.chercher(c[3], c[4]);
        if (!ea || !eb || OPS_SENS.indexOf(c[2]) === -1) { alertes.push({ niveau: 'forte', message: 'Appui « ' + nomAppui(c[1]) + ' ' + c[2] + ' ' + nomAppui(c[4]) + ' » : introuvable dans le fichier de chiffres, il ne peut plus être vérifié.' }); return; }
        const va = chiffres.nombre(ea.valeur), vb = chiffres.nombre(eb.valeur);
        if (va === null || vb === null) { alertes.push({ niveau: 'forte', message: 'Appui « ' + nomAppui(c[1]) + ' ' + c[2] + ' ' + nomAppui(c[4]) + ' » : un des deux chiffres n\'est plus lisible.' }); return; }
        const rel = relationActuelle(va, vb);
        if (rel !== c[2]) { alertes.push({ niveau: 'forte', message: 'Le sens change : ' + nomAppui(c[1]) + ' (' + ea.valeur + ') était ' + EN_MOTS[c[2]] + ' ' + nomAppui(c[4]) + ', il est maintenant ' + EN_MOTS[rel] + ' (' + eb.valeur + ').' }); }
      } else if (l.type === 'signe') {
        const e = dig.chercher(c[0], c[1]), v = e ? chiffres.nombre(e.valeur) : null;
        if (!e || v === null || OPS_SIGNE.indexOf(c[2]) === -1) { alertes.push({ niveau: 'forte', message: 'Appui « ' + nomAppui(c[1]) + ' : ' + c[2] + ' » : introuvable dans le fichier de chiffres, il ne peut plus être vérifié.' }); return; }
        const sg = signeActuel(v);
        if (sg !== c[2]) { alertes.push({ niveau: 'forte', message: 'Le signe change : ' + nomAppui(c[1]) + ' était ' + c[2] + ', il est maintenant ' + sg + ' (' + e.valeur + ').' }); }
      } else if (l.type === 'evolution') {
        const e = dig.chercher(c[0], c[1]);
        if (!e || OPS_EVOLUTION.indexOf(c[2]) === -1) { alertes.push({ niveau: 'forte', message: 'Appui « ' + nomAppui(c[1]) + ' : ' + c[2] + ' sur un an » : introuvable dans le fichier de chiffres, il ne peut plus être vérifié.' }); return; }
        const ev = evolutionActuelle(e);
        if (ev === null) { alertes.push({ niveau: 'forte', message: 'Appui « ' + nomAppui(c[1]) + ' : ' + c[2] + ' sur un an » : la série n\'est plus assez longue pour comparer.' }); return; }
        if (ev !== c[2]) { alertes.push({ niveau: 'forte', message: 'Le sens change : ' + nomAppui(c[1]) + ' était en ' + c[2] + ' sur un an, il est maintenant en ' + ev + '.' }); }
      }
    });
    nbAppuis += n;
    return { cle: t.cle, alertes: alertes, nbAppuis: n };
  });
  return { ok: true, textes: textes, problemes: lu.problemes, nbAppuis: nbAppuis };
}

// « J'ai relu, le texte reste juste » : aligne la DÉCLARATION d'un texte sur les données actuelles (jamais le texte de l'application).
// Rend { ok, texte, modifies } ; « texte » est le nouveau contenu du fichier d'appuis.
function alignerAppuis(texteDigest, texteAppuis, cleTexte, aujourdhui, forme) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(aujourdhui || ''))) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const dig = indexerDigest(texteDigest, forme);
  if (!dig.ok) { return { ok: false, erreur: dig.erreur }; }
  const lignes = normaliser(texteAppuis).split('\n'), sortie = [];
  let dedans = false, trouve = false, modifies = 0, releDejaEcrit = false, dernierDuBloc = -1;
  const sortieDe = function (brut) { sortie.push(brut); };
  for (let i = 0; i < lignes.length; i++) {
    const brut = lignes[i], l = brut.trim(), mt = /^texte:\s*(.+)$/.exec(l);
    if (mt) {
      if (dedans && !releDejaEcrit) { sortie.splice(dernierDuBloc + 1, 0, '  relu_le: ' + aujourdhui); }
      dedans = mt[1].trim() === cleTexte; if (dedans) { trouve = true; releDejaEcrit = false; }
      sortieDe(brut); continue;
    }
    if (!dedans || l === '' || l.charAt(0) === '#') { sortieDe(brut); if (dedans && l !== '') { dernierDuBloc = sortie.length - 1; } continue; }
    const m = /^(valeur|sens|evolution|signe|relu_le):\s*(.*)$/.exec(l);
    if (!m) { sortieDe(brut); dernierDuBloc = sortie.length - 1; continue; }
    const c = m[2].split('|').map(function (x) { return x.trim(); });
    let nouvelle = brut;
    if (m[1] === 'relu_le') { nouvelle = '  relu_le: ' + aujourdhui; releDejaEcrit = true; }
    else if (m[1] === 'valeur' && c.length === 4) {
      const e = dig.chercher(c[0], c[1]), champ = CHAMPS[c[2].toLowerCase()];
      if (e && champ && e[champ] && chiffres.nombre(e[champ]) !== chiffres.nombre(c[3])) { c[3] = e[champ]; nouvelle = '  valeur: ' + c.join(' | '); modifies++; }
    } else if (m[1] === 'sens' && c.length === 5) {
      const ea = dig.chercher(c[0], c[1]), eb = dig.chercher(c[3], c[4]);
      if (ea && eb) {
        const va = chiffres.nombre(ea.valeur), vb = chiffres.nombre(eb.valeur);
        if (va !== null && vb !== null && va !== vb) { const rel = relationActuelle(va, vb); if (rel !== c[2]) { c[2] = rel; nouvelle = '  sens: ' + c.join(' | '); modifies++; } }
      }
    } else if (m[1] === 'signe' && c.length === 3) {
      const e = dig.chercher(c[0], c[1]), v = e ? chiffres.nombre(e.valeur) : null;
      if (v !== null && v !== 0 && signeActuel(v) !== c[2]) { c[2] = signeActuel(v); nouvelle = '  signe: ' + c.join(' | '); modifies++; }
    } else if (m[1] === 'evolution' && c.length === 3) {
      const e = dig.chercher(c[0], c[1]), ev = e ? evolutionActuelle(e) : null;
      if (ev && ev !== 'stable' && ev !== c[2]) { c[2] = ev; nouvelle = '  evolution: ' + c.join(' | '); modifies++; }
    }
    sortieDe(nouvelle); dernierDuBloc = sortie.length - 1;
  }
  if (dedans && !releDejaEcrit) { sortie.splice(dernierDuBloc + 1, 0, '  relu_le: ' + aujourdhui); }
  if (!trouve) { return { ok: false, erreur: 'Texte introuvable dans le fichier d\'appuis : « ' + String(cleTexte).slice(0, 60) + ' ».' }; }
  return { ok: true, texte: sortie.join('\n'), modifies: modifies };
}

module.exports = { lireAppuis: lireAppuis, controlerAppuis: controlerAppuis, alignerAppuis: alignerAppuis };
