/* ============================================================
   veilleAdresses.js  --  « Les adresses de l'application » : contrôle de toutes les adresses internet citées par l'application (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Consigne 92 (Denis, 03/11/2026), maquette validée le 05/11/2026 : une carte à part, quatre choix tranchés.
   Ce que fait ce fichier : rassembler les adresses citées (registre des adresses du Cadre, Lexique, chiffres et répertoires, liens écrits dans des modules), les ouvrir
   comme le ferait un navigateur (veilleControle.controler, qui range chaque réponse dans repond | ailleurs | refuse | absente | sans-reponse), garder le dernier résultat
   et dire OÙ chaque adresse est utilisée. Qui fait quoi n'est PAS rouvert : on reprend le bilan de son contrôle mensuel (veilleControleSas.bilanMensuel).
   Ce qu'il NE FAIT JAMAIS : écrire dans une fiche, un mot ou un registre, dater ou supprimer une adresse. Les adresses viennent TOUJOURS des fichiers du dépôt, jamais de la
   fenêtre : la fenêtre n'envoie que des noms de familles et, pour « garder », une adresse qui doit figurer dans le dernier résultat.
   Deux fichiers écrits, chemins fixes, dossier ignoré par Git (jamais envoyés sur GitHub) : outils/controles/adresses.json (dernier résultat) et
   outils/controles/adresses_gardees.json (les adresses « gardées telles quelles » avec la note de Denis, et celles « à corriger »).
   Une adresse gardée réapparaît d'elle-même si son résultat change. Aucune dépendance (Node seul). Un seul contrôle à la fois, en tâche de fond.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const controle = require('./veilleControle.js');
const liens = require('./veilleLiens.js');
const { RE_PROTECTION_ROBOTS } = require('./veilleControleSas.js');   // la même liste de pages « de protection » que le contrôle de Qui fait quoi

const DOSSIER = ['outils', 'controles'];
const JOURS_ENTRE_CONTROLES = 30;
const MAX_NOTE = 300;
const MAX_USAGES_PAR_ADRESSE = 6;
const ETATS_A_SIGNALER = ['absente', 'ailleurs', 'sans-reponse', 'refuse'];
// Le tiret long est interdit partout : le motif est écrit avec ses codes, jamais avec le caractère.
const RE_TIRET_LONG = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));
const RE_URL = /https?:\/\/[^\s|"'<>)\]`\\,;]+/g;

// Les familles : { id, libelle, fichiers }. « cadre » est lu par le registre des adresses (nom, adresse, date, portée) ; les autres, par balayage du texte.
const FAMILLES = [
  { id: 'cadre', libelle: 'Les sources des fiches de « Comprendre le cadre »', fichiers: ['modules/comprendre-le-cadre/liens-verifies.txt'] },
  { id: 'lexique', libelle: 'Les sources du Lexique', fichiers: ['data/lexique.js'] },
  { id: 'chiffres', libelle: 'Les sources de « Comprendre les chiffres » et des répertoires (freins, métiers, arnaques)', fichiers: ['modules/comprendre-les-chiffres/donnees/bmo-metiers.json', 'modules/comprendre-les-chiffres/donnees/smic-inflation.json', 'modules/comprendre-les-chiffres/index.js', 'data/freins.js', 'data/metiers.js', 'modules/comprendre-le-cadre/donnees/arnaques.txt'] },
  { id: 'modules', libelle: 'Les liens écrits directement dans certains modules (Regard extérieur, Lexique, Mon territoire)', fichiers: ['modules/regard-exterieur/index.js', 'modules/lexique/index.js', 'modules/mon-territoire/logique.js'] }
];
const NOM_FICHIER = {
  'data/lexique.js': 'Mot du Lexique',
  'modules/comprendre-les-chiffres/donnees/bmo-metiers.json': 'Comprendre les chiffres, métiers qui recrutent',
  'modules/comprendre-les-chiffres/donnees/smic-inflation.json': 'Comprendre les chiffres, Smic et inflation',
  'modules/comprendre-les-chiffres/index.js': 'Comprendre les chiffres',
  'data/freins.js': 'Répertoire des freins',
  'data/metiers.js': 'Répertoire des métiers',
  'modules/comprendre-le-cadre/donnees/arnaques.txt': 'Comprendre le cadre, arnaques',
  'modules/regard-exterieur/index.js': 'Regard extérieur',
  'modules/lexique/index.js': 'Lexique (module)',
  'modules/mon-territoire/logique.js': 'Mon territoire'
};

function nettoyer(u) { return String(u).replace(/[.,;:!?]+$/, ''); }
// Une adresse utilisable : http ou https, un nom de site avec un point, rien d'autre qu'une adresse.
function adresseLisible(u) {
  try { const x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') && x.hostname.indexOf('.') !== -1 && !/\.(test|invalid|example|local)$/i.test(x.hostname) && !/^(exemple|example)\./i.test(x.hostname); } catch (e) { return false; }
}

function lire(racine, rel) { try { return fs.readFileSync(path.join(racine, rel), 'utf8'); } catch (e) { return null; } }

// Les titres des fiches du Cadre (index généré pour la recherche de l'accueil) : { id: titre }.
function titresDesFiches(racine) {
  const t = lire(racine, 'data/indexFichesCadre.js'), titres = {};
  if (!t) { return titres; }
  t.split(/\r?\n/).forEach(function (l) {
    if (l.charAt(0) !== '{') { return; }
    try { const f = JSON.parse(l.replace(/,\s*$/, '')); if (f && f.id) { titres[f.id] = f.titre || f.id; } } catch (e) { /* ligne ignorée */ }
  });
  return titres;
}

// Où une adresse est utilisée dans un texte de code ou de données : le nom le plus proche, sur la même ligne ou plus haut.
function nomPresDe(lignes, i, rel) {
  if (rel === 'data/lexique.js') {
    // Une entrée du Lexique commence par « id: '...', titre: '...' » : c'est le MOT qu'on veut nommer, pas la ligne de source.
    for (let k = i; k >= Math.max(0, i - 120); k--) {
      const m = /^ {4}id:\s*(['"])([^'"]+)\1(?:,\s*titre:\s*(['"])(.+?)\3)?/.exec(lignes[k]);
      if (!m) { continue; }
      // Un second niveau (« En savoir plus ») a son titre sur la ligne suivante et un id « second-niveau-<mot> » : on nomme le mot.
      if (/^second-niveau-/.test(m[2])) { return 'En savoir plus : ' + m[2].replace(/^second-niveau-/, ''); }
      return m[4] || m[2];
    }
    return '';
  }
  const motif = /\b(?:libelle|titre|nom|id)\s*:\s*(['"])((?:(?!\1).){1,90})\1/;
  for (let k = i; k >= Math.max(0, i - 40); k--) {
    const m = motif.exec(lignes[k]);
    if (m) { return m[2]; }
  }
  return '';
}

// Toutes les adresses citées : { url: [{ famille, ou }] } (un même lien utilisé à plusieurs endroits garde chaque endroit).
function rassembler(racine, ids) {
  const voulues = Array.isArray(ids) && ids.length ? ids : FAMILLES.map(function (f) { return f.id; });
  const sortie = {};
  function ajouter(url, famille, ou, nom) {
    const u = nettoyer(url);
    if (!adresseLisible(u)) { return; }
    const liste = sortie[u] = sortie[u] || [];
    if (!liste.some(function (x) { return x.famille === famille && x.ou === ou; })) { liste.push({ famille: famille, ou: ou, nom: nom || '' }); }
  }
  FAMILLES.forEach(function (fam) {
    if (voulues.indexOf(fam.id) === -1) { return; }
    if (fam.id === 'cadre') {
      const brut = lire(racine, fam.fichiers[0]); if (brut === null) { return; }
      const titres = titresDesFiches(racine), usages = liens.usagesDesLiens(racine);
      liens.analyser(brut).lignes.forEach(function (l) {
        if (!l.nom || !l.adresse) { return; }
        const ids2 = usages[l.nom] || [];
        const ou = ids2.length ? 'Fiche « ' + (titres[ids2[0]] || ids2[0]) + ' »' + (ids2.length > 1 ? ' et ' + (ids2.length - 1) + ' autre' + (ids2.length > 2 ? 's' : '') : '') + ' (source « ' + l.nom + ' »)' : 'Registre des adresses, source « ' + l.nom + ' » (aucune fiche ne l’utilise pour l’instant)';
        ajouter(l.adresse, 'cadre', ou, l.nom);
      });
      return;
    }
    fam.fichiers.forEach(function (rel) {
      const brut = lire(racine, rel); if (brut === null) { return; }
      const lignes = brut.split(/\r?\n/);
      lignes.forEach(function (l, i) {
        if (/^\s*(\/\/|\*|\/\*)/.test(l)) { return; }   // les commentaires du code ne sont vus de personne
        const m = l.match(RE_URL); if (!m) { return; }
        const nom = nomPresDe(lignes, i, rel), lib = NOM_FICHIER[rel] || rel;
        m.forEach(function (u) { ajouter(u, fam.id, lib + (nom ? ', « ' + nom + ' »' : '')); });
      });
    });
  });
  return sortie;
}

function sitesDe(urls) {
  const h = {}; urls.forEach(function (u) { try { h[new URL(u).hostname.replace(/^www\./, '')] = 1; } catch (e) { /* ignorée */ } });
  return Object.keys(h).length;
}

function creerAdresses(racine, options) {
  const opt = options || {};
  let travail = { enCours: false, fait: 0, total: 0, debut: '', erreur: '' };
  const cheminResultats = path.resolve(racine, ...DOSSIER, 'adresses.json');
  const cheminGardees = path.resolve(racine, ...DOSSIER, 'adresses_gardees.json');

  function lireJson(chemin, cle) {
    try { const j = JSON.parse(fs.readFileSync(chemin, 'utf8')); return (j && j.version === 1 && j[cle] && typeof j[cle] === 'object') ? j : null; } catch (e) { return null; }
  }
  function ecrireJson(chemin, objet) {
    try {
      fs.mkdirSync(path.dirname(chemin), { recursive: true });
      const tmp = chemin + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(objet), 'utf8'); fs.renameSync(tmp, chemin);
      return true;
    } catch (e) { travail.erreur = 'Le résultat n’a pas pu être gardé sur ce poste : ' + (e && e.message); return false; }
  }
  // Une adresse qui « mène ailleurs » vers la page d'un service de protection contre les robots (Radware, Cloudflare...) n'a pas bougé : le site refuse d'être lu.
  function lireResultats() {
    const j = lireJson(cheminResultats, 'resultats');
    if (!j) { return { version: 1, date: '', resultats: {} }; }
    Object.keys(j.resultats).forEach(function (u) {
      const x = j.resultats[u];
      if (x && x.etat === 'ailleurs' && RE_PROTECTION_ROBOTS.test(x.finale || '')) { j.resultats[u] = Object.assign({}, x, { etat: 'refuse', detail: 'Le site refuse les contrôles automatiques (page de protection contre les robots) : ouvrez la page à la main.', finale: '' }); }
    });
    return j;
  }
  function lireGardees() { const j = lireJson(cheminGardees, 'gardees'); return j || { version: 1, gardees: {}, aCorriger: {} }; }
  function maintenant() { return String(opt.maintenant ? opt.maintenant() : new Date().toISOString()).slice(0, 16).replace('T', ' '); }

  function apercu() {
    const tout = rassembler(racine);
    const familles = FAMILLES.map(function (f) {
      const urls = Object.keys(tout).filter(function (u) { return tout[u].some(function (x) { return x.famille === f.id; }); });
      return { id: f.id, libelle: f.libelle, total: urls.length, sites: sitesDe(urls) };
    });
    const r = lireResultats();
    const jours = r.date ? Math.floor((Date.parse(maintenant().slice(0, 10)) - Date.parse(r.date.slice(0, 10))) / 86400000) : null;
    let qfq = null;
    try { if (opt.controleSas) { qfq = opt.controleSas.bilanMensuel(); } } catch (e) { qfq = null; }
    return { ok: true, familles: familles, derniere: r.date, jours: jours, aFaire: jours === null || jours >= JOURS_ENTRE_CONTROLES, joursEntreControles: JOURS_ENTRE_CONTROLES, qfq: qfq };
  }

  // donnees : { familles: ['cadre', ...] } (défaut : toutes). Rend tout de suite { ok, total } ; le travail continue en tâche de fond.
  function demarrer(donnees) {
    if (travail.enCours) { return { ok: false, erreur: 'Un contrôle est déjà en cours : attendez sa fin.' }; }
    const d = donnees || {};
    let ids = d.familles;
    if (ids !== undefined && (!Array.isArray(ids) || ids.some(function (i) { return !FAMILLES.some(function (f) { return f.id === i; }); }))) { return { ok: false, erreur: 'Famille d’adresses inconnue.' }; }
    if (Array.isArray(ids) && !ids.length) { return { ok: false, erreur: 'Choisissez au moins une famille d’adresses.' }; }
    const tout = rassembler(racine, ids), urls = Object.keys(tout);
    if (!urls.length) { return { ok: false, erreur: 'Aucune adresse à contrôler.' }; }
    travail = { enCours: true, fait: 0, total: urls.length, debut: maintenant(), erreur: '' };
    lancer(urls).then(function () { travail.enCours = false; }, function (e) { travail.enCours = false; travail.erreur = 'Le contrôle s’est arrêté : ' + (e && e.message); });
    return { ok: true, total: urls.length };
  }

  async function lancer(urls) {
    const avant = lireResultats(), date = maintenant(), suivants = Object.assign({}, avant.resultats);
    const https = urls.filter(function (u) { return /^https:/.test(u); });
    urls.filter(function (u) { return !/^https:/.test(u); }).forEach(function (u) {
      suivants[u] = { etat: 'non-controlee', detail: 'Adresse non sécurisée (http) : le contrôle ne l’ouvre pas.', date: date };
      travail.fait++;
    });
    const TRANCHE = controle.MAX_ADRESSES;
    for (let i = 0; i < https.length; i += TRANCHE) {
      const tranche = https.slice(i, i + TRANCHE).map(function (u) { return { id: u, url: u }; });
      // Chaque adresse est notée dès qu'elle a répondu : la barre avance doucement, et un arrêt en route ne perd que la tranche en cours.
      await controle.controler(tranche, { fetch: opt.fetch, progression: function (r) {
        const ancien = avant.resultats[r.url];
        suivants[r.url] = { etat: r.etat, detail: r.detail, finale: r.finale || '', date: date };
        if (ancien && ancien.etat) { suivants[r.url].avant = ancien.etat; }
        travail.fait++;
      } });
      ecrireJson(cheminResultats, { version: 1, date: date, resultats: suivants });
    }
    // Sans adresse https (cas d'école) : le fichier est quand même daté.
    ecrireJson(cheminResultats, { version: 1, date: date, resultats: suivants });
  }

  // Lecture : l'avancement pendant le contrôle ; sinon le dernier résultat, classé.
  function etat() {
    if (travail.enCours) { return { ok: true, enCours: true, fait: travail.fait, total: travail.total, debut: travail.debut, erreur: travail.erreur }; }
    const r = lireResultats(), g = lireGardees(), tout = rassembler(racine);
    const lignes = [], gardees = [], compte = { repond: 0, absente: 0, ailleurs: 0, 'sans-reponse': 0, refuse: 0, 'non-controlee': 0 };
    let controlees = 0;
    Object.keys(tout).forEach(function (url) {
      const x = r.resultats[url]; if (!x) { return; }
      controlees++;
      const usages = tout[url], base = { url: url, etat: x.etat, detail: x.detail, finale: x.finale || '', date: x.date || '', familles: Array.from(new Set(usages.map(function (u) { return u.famille; }))), ou: usages.slice(0, MAX_USAGES_PAR_ADRESSE).map(function (u) { return u.ou; }), registre: usages.filter(function (u) { return u.nom; }).map(function (u) { return u.nom; }), autres: Math.max(0, usages.length - MAX_USAGES_PAR_ADRESSE), aCorriger: !!g.aCorriger[url] };
      if (ETATS_A_SIGNALER.indexOf(x.etat) === -1) { compte[x.etat] = (compte[x.etat] || 0) + 1; return; }
      const garde = g.gardees[url];
      if (garde && garde.etat === x.etat) { gardees.push(Object.assign(base, { note: garde.note || '', gardeeLe: garde.date || '' })); return; }
      compte[x.etat]++;
      // Nouvelle depuis le dernier contrôle : elle répondait avant (ou n'était pas connue), et plus maintenant.
      base.nouvelle = !x.avant || x.avant === 'repond';
      if (garde) { base.ancienneGarde = { note: garde.note || '', etat: garde.etat }; }
      lignes.push(base);
    });
    return { ok: true, enCours: false, erreur: travail.erreur, derniere: r.date, controlees: controlees, compte: compte, aSignaler: lignes.length, lignes: lignes, gardees: gardees };
  }

  function garder(donnees) {
    const d = donnees || {}, url = String(d.url || ''), note = String(d.note == null ? '' : d.note).replace(/\s+/g, ' ').trim().slice(0, MAX_NOTE);
    if (RE_TIRET_LONG.test(note)) { return { ok: false, erreur: 'Évitez le tiret long dans la note : utilisez un deux-points ou une virgule.' }; }
    const x = lireResultats().resultats[url];
    if (!x || ETATS_A_SIGNALER.indexOf(x.etat) === -1) { return { ok: false, erreur: 'Cette adresse n’est pas dans le dernier résultat.' }; }
    const g = lireGardees();
    g.gardees[url] = { etat: x.etat, note: note, date: maintenant().slice(0, 10) };
    return ecrireJson(cheminGardees, g) ? { ok: true } : { ok: false, erreur: travail.erreur };
  }
  function nePlusGarder(donnees) {
    const url = String((donnees && donnees.url) || ''), g = lireGardees();
    if (!g.gardees[url]) { return { ok: false, erreur: 'Cette adresse n’est pas gardée.' }; }
    delete g.gardees[url];
    return ecrireJson(cheminGardees, g) ? { ok: true } : { ok: false, erreur: travail.erreur };
  }
  // « À corriger » : un simple repère pour la prochaine séance avec Claude (Lexique, chiffres, modules). Rien n'est modifié dans les données.
  function marquer(donnees) {
    const d = donnees || {}, url = String(d.url || '');
    if (!lireResultats().resultats[url]) { return { ok: false, erreur: 'Cette adresse n’est pas dans le dernier résultat.' }; }
    const g = lireGardees();
    if (d.valeur === false) { delete g.aCorriger[url]; } else { g.aCorriger[url] = maintenant().slice(0, 10); }
    return ecrireJson(cheminGardees, g) ? { ok: true } : { ok: false, erreur: travail.erreur };
  }
  function attendre() { return new Promise(function (ok) { (function boucle() { if (!travail.enCours) { ok(); } else { setTimeout(boucle, 5); } })(); }); }

  return { apercu: apercu, demarrer: demarrer, etat: etat, garder: garder, nePlusGarder: nePlusGarder, marquer: marquer, attendre: attendre };
}

module.exports = { creerAdresses: creerAdresses, rassembler: rassembler, FAMILLES: FAMILLES, JOURS_ENTRE_CONTROLES: JOURS_ENTRE_CONTROLES };
