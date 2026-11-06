/* ============================================================
   veilleControleSas.js  --  contrôle AUTOMATIQUE des cartes du sas et des fiches publiées (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Pour chaque carte : le site (ou la page) et la page de recrutement répondent-ils, le nom de l'employeur est-il dans la page, les numéros y figurent-ils, la commune aussi.
   Deux « espaces » : le sas (cartes à vérifier : employeurs, structures, pages d'offres) et le registre publié (fiches à REVÉRIFIER, par exemple tous les six mois).
   Ce que ce contrôle NE FAIT JAMAIS : dater une fiche, écrire dans un registre, valider une carte. Il montre des PREUVES ; la décision (« C'est bon », « Valider ») reste à Denis.
   Les adresses viennent TOUJOURS des fichiers (sas ou registre), jamais de la fenêtre ni d'une page lue : la fenêtre n'envoie que le nom du fichier et des identifiants de cartes.
   Le dernier résultat de chaque carte est gardé dans outils/controles/ (chemins fixes, jamais envoyés sur GitHub : dossier ignoré par Git), avec un résumé du contrôle PRÉCÉDENT pour dire
   « ce qui a changé depuis la dernière fois ». Aucune dépendance (Node seul). Un seul contrôle à la fois ; il tourne en tâche de fond, la page demande l'avancement.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const controle = require('./veilleControle.js');

const DOSSIER = ['outils', 'controles'];
const MAX_CARTES = 1000;
const PARALLELE = 6;
const RE_ID = /^[a-z0-9][a-z0-9-]{0,120}$/;
// Ce qui peut être contrôlé : { genre : [fichiers] } (les compléments de numéros, vides aujourd'hui, ne sont pas pris en charge).
const ORDRE_MENSUEL = ['lieux', 'employeurs', 'offres'];
const JOURS_ENTRE_TESTS = 30;
const RE_PROTECTION_ROBOTS = /^https?:\/\/[^/]*(perfdrive|radware|captcha|datadome|px-cdn|perimeterx|challenges?\.cloudflare|incapsula|imperva|sucuri)/i;
const FICHIERS_CONTROLABLES ={ sas: ['employeurs', 'lieux', 'offres'], registre: ['employeurs', 'lieux', 'offres'] };

function adresseHttps(v) { const s = String(v || '').trim(); return /^https:\/\/\S+$/.test(s) ? s : ''; }

// Les adresses et les numéros à vérifier d'une carte (ligne rendue par depot.listerSas(fichier) ou depot.listerTerritoire(fichier)).
function tachesDeCarte(l, fichier) {
  const v = l.valeurs || {}, f = fichier || 'employeurs';
  if (f === 'offres') { return { id: l.id, nom: v.employeur || v.nom || l.nom || '', commune: '', site: adresseHttps(v.page), recrutement: '', numeros: [] }; }
  if (f === 'lieux') { return { id: l.id, nom: v.nom || l.nom || '', commune: v.commune || '', site: adresseHttps(v.site), recrutement: '', numeros: String(v.telephone || '').trim() ? [String(v.telephone).trim()] : [] }; }
  const etabs = l.etabs || [], numeros = [];
  if (String(v.telephone || '').trim()) { numeros.push(String(v.telephone).trim()); }
  etabs.forEach(function (e) { if (e.telephone && numeros.indexOf(e.telephone) === -1) { numeros.push(e.telephone); } });
  return { id: l.id, nom: v.nom || l.nom || '', commune: etabs.length ? etabs[0].commune : '', site: adresseHttps(v.site), recrutement: adresseHttps(v.recrutement), numeros: numeros };
}

// Le verdict d'une carte, avec son motif. Jamais une décision : un indice pour trier.
//   complet : le site répond avec le nom de l'employeur, la page de recrutement (s'il y en a une) répond, ET chaque numéro de la carte est retrouvé sur une page lue ;
//   partiel : le site est bon mais il reste à compléter à la main (un numéro non retrouvé, ou une page de recrutement qui ne répond pas) ;
//   main    : le site ne peut pas être confirmé (sans site, introuvable, refuse les robots, sans réponse, mène ailleurs, nom non retrouvé).
// Rend { verdict, motif }.
function verdictDe(r) {
  const s = r.site;
  if (!s || !s.url) { return { verdict: 'main', motif: 'sans-site' }; }
  if (s.etat === 'absente') { return { verdict: 'main', motif: 'introuvable' }; }
  if (s.etat === 'refuse') { return { verdict: 'main', motif: 'refuse' }; }
  if (s.etat === 'sans-reponse') { return { verdict: 'main', motif: 'sans-reponse' }; }
  if (s.etat === 'ailleurs') { return { verdict: 'main', motif: 'ailleurs' }; }
  if (s.etat !== 'repond') { return { verdict: 'main', motif: 'sans-reponse' }; }
  if (!(s.nomTitre || s.nomPage)) { return { verdict: 'main', motif: 'nom' }; }
  if (r.recrutement && r.recrutement.etat !== 'repond') { return { verdict: 'partiel', motif: 'recrutement' }; }
  if ((r.numeros || []).some(function (n) { return !n.trouve; })) { return { verdict: 'partiel', motif: 'numero' }; }
  return { verdict: 'complet', motif: '' };
}

// Le résumé d'un résultat, gardé comme « avant » au contrôle suivant.
function resume(r) {
  if (!r) { return null; }
  const nums = r.numeros || [];
  return { date: r.date || '', verdict: r.verdict || '', motif: r.motif || '', site: r.site ? r.site.etat : '', recrutement: r.recrutement ? r.recrutement.etat : '', numeros: nums.filter(function (n) { return n.trouve; }).length + '/' + nums.length };
}

function creerControleSas(racine, depot, options) {
  const opt = options || {};
  let travail = { enCours: false, cle: '', fait: 0, total: 0, debut: '', erreur: '' };
  const espaces = {};

  function cleDe(genre, fichier) { return genre + ':' + fichier; }
  function cheminDe(genre, fichier) { return path.resolve(racine, ...DOSSIER, genre + '_' + fichier + '.json'); }
  function espace(genre, fichier) {
    const cle = cleDe(genre, fichier);
    if (!espaces[cle]) { espaces[cle] = { chemin: cheminDe(genre, fichier), resultats: lireFichier(cheminDe(genre, fichier)) }; }
    return espaces[cle];
  }
  function lireFichier(chemin) {
    try { const j = JSON.parse(fs.readFileSync(chemin, 'utf8')); return (j && j.version === 2 && j.cartes && typeof j.cartes === 'object') ? j.cartes : {}; } catch (e) { return {}; }
  }
  function ecrireFichier(esp) {
    try {
      fs.mkdirSync(path.dirname(esp.chemin), { recursive: true });
      const tmp = esp.chemin + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify({ version: 2, cartes: esp.resultats }), 'utf8');
      fs.renameSync(tmp, esp.chemin);
    } catch (e) { travail.erreur = 'Le résultat n\'a pas pu être gardé sur ce poste : ' + (e && e.message); }
  }

  async function lireUneFois(url, cache) {
    if (!cache.has(url)) { cache.set(url, controle.lireEtClasser(url, { fetch: opt.fetch, resoudre: opt.resoudre })); }
    return cache.get(url);
  }

  async function controlerCartes(cartes, esp) {
    const cache = new Map(), date = String(opt.maintenant ? opt.maintenant() : new Date().toISOString()).slice(0, 16).replace('T', ' ');
    let suivant = 0;
    async function travailleur() {
      while (suivant < cartes.length) {
        const c = cartes[suivant++];
        const sortie = { date: date };
        const numerosTrouves = {};
        c.numeros.forEach(function (n) { numerosTrouves[n] = false; });
        if (!c.site) { sortie.site = { url: '', etat: 'absente', detail: 'La carte n\'a pas de site : cherchez-le avec « Chercher le site sur le web ».' }; }
        else {
          const s = await lireUneFois(c.site, cache), p = controle.preuvesDePage(s.page, c);
          sortie.site = { url: c.site, etat: s.etat, detail: s.detail, finale: s.finale || '', pagesContact: s.pagesContact || [], recrutementTrouve: s.recrutementTrouve || [] };
          if (p) { Object.assign(sortie.site, { titre: p.titre, nomTitre: p.nomTitre, nomPage: p.nomPage, communeTrouvee: p.communeTrouvee }); p.numeros.forEach(function (x) { if (x.trouve) { numerosTrouves[x.numero] = true; } }); }
        }
        if (c.recrutement) {
          const s = await lireUneFois(c.recrutement, cache), p = controle.preuvesDePage(s.page, c);
          sortie.recrutement = { url: c.recrutement, etat: s.etat, detail: s.detail, finale: s.finale || '' };
          if (p) { Object.assign(sortie.recrutement, { titre: p.titre, nomTitre: p.nomTitre, nomPage: p.nomPage }); p.numeros.forEach(function (x) { if (x.trouve) { numerosTrouves[x.numero] = true; } }); }
        }
        sortie.numeros = c.numeros.map(function (n) { return { numero: n, trouve: !!numerosTrouves[n] }; });
        const vd = verdictDe(sortie); sortie.verdict = vd.verdict; sortie.motif = vd.motif;
        const avant = resume(esp.resultats[c.id]); if (avant) { sortie.avant = avant; }
        esp.resultats[c.id] = sortie;
        travail.fait++;
        if (travail.fait % 25 === 0) { ecrireFichier(esp); }
      }
    }
    await Promise.all(Array.from({ length: Math.min(opt.parallele || PARALLELE, cartes.length) }, travailleur));
  }

  // donnees : { genre: 'sas' | 'registre' (défaut 'sas'), fichier: 'employeurs' | 'lieux' | 'offres' (défaut 'employeurs'), ids: [...] ou tout: true }.
  // Rend tout de suite { ok, total } ; le travail continue en tâche de fond.
  function demarrer(donnees) {
    if (travail.enCours) { return { ok: false, erreur: 'Un contrôle est déjà en cours : attendez sa fin.' }; }
    const d = donnees || {}, genre = d.genre || 'sas', fichier = d.fichier || 'employeurs';
    if (!FICHIERS_CONTROLABLES[genre] || FICHIERS_CONTROLABLES[genre].indexOf(fichier) === -1) { return { ok: false, erreur: 'Ce contrôle ne concerne pas « ' + String(fichier).slice(0, 30) + ' ».' }; }
    const liste = genre === 'sas' ? depot.listerSas(fichier) : depot.listerTerritoire(fichier);
    if (!liste.ok) { return liste; }
    let lignes = liste.lignes;
    if (!d.tout) {
      if (!Array.isArray(d.ids) || !d.ids.length) { return { ok: false, erreur: 'Aucune carte à contrôler.' }; }
      if (d.ids.some(function (i) { return typeof i !== 'string' || !RE_ID.test(i); })) { return { ok: false, erreur: 'Identifiant de carte illisible.' }; }
      const voulus = {}; d.ids.forEach(function (i) { voulus[i] = true; });
      lignes = lignes.filter(function (l) { return voulus[l.id]; });
    }
    lignes = lignes.slice(0, MAX_CARTES);
    if (!lignes.length) { return { ok: false, erreur: 'Aucune carte ne correspond.' }; }
    const cartes = lignes.map(function (l) { return tachesDeCarte(l, fichier); }), esp = espace(genre, fichier);
    travail = { enCours: true, cle: cleDe(genre, fichier), fait: 0, total: cartes.length, debut: new Date().toISOString().slice(0, 16).replace('T', ' '), erreur: '' };
    controlerCartes(cartes, esp).then(function () { travail.enCours = false; ecrireFichier(esp); suiteMensuelle(); }, function (e) { travail.enCours = false; travail.erreur = 'Le contrôle s\'est arrêté : ' + (e && e.message); ecrireFichier(esp); mensuel.enCours = false; mensuel.erreur = travail.erreur; });
    return { ok: true, total: cartes.length };
  }

  // ---------- Le test du mois : les trois registres de « Qui fait quoi », l'un après l'autre, puis un bilan. Rien n'est daté ni modifié : ce sont des PREUVES, la décision reste à Denis. ----------
  let mensuel = { enCours: false, suite: [], erreur: '', debut: '' };
  function suiteMensuelle() {
    if (!mensuel.enCours) { return; }
    if (!mensuel.suite.length) { mensuel.enCours = false; return; }
    const r = demarrer({ genre: 'registre', fichier: mensuel.suite.shift(), tout: true });
    if (!r.ok) { mensuel.enCours = false; mensuel.erreur = r.erreur || 'Le test s\'est arrêté.'; }
  }
  function demarrerMensuel() {
    if (travail.enCours) { return { ok: false, erreur: 'Un contrôle est déjà en cours : attendez sa fin.' }; }
    mensuel = { enCours: true, suite: ORDRE_MENSUEL.slice(1), erreur: '', debut: String(opt.maintenant ? opt.maintenant() : new Date().toISOString()).slice(0, 16).replace('T', ' ') };
    const r = demarrer({ genre: 'registre', fichier: ORDRE_MENSUEL[0], tout: true });
    if (!r.ok) { mensuel.enCours = false; return r; }
    return { ok: true, registres: ORDRE_MENSUEL.length };
  }
  const MOTIFS_A_TRAITER = ['introuvable', 'ailleurs'];
  function bilanMensuel() {
    const maintenant = String(opt.maintenant ? opt.maintenant() : new Date().toISOString()).slice(0, 10);
    const registres = ORDRE_MENSUEL.map(function (fichier) {
      const liste = depot.listerTerritoire(fichier), res = espace('registre', fichier).resultats;
      const lignes = liste && liste.ok ? liste.lignes : [];
      const r = { fichier: fichier, cartes: lignes.length, controlees: 0, derniere: '', complet: 0, partiel: 0, main: 0, motifs: {}, problemes: [] };
      lignes.forEach(function (l) {
        const x = res[l.id]; if (!x) { return; }
        r.controlees++;
        if (x.date && (!r.derniere || x.date < r.derniere)) { r.derniere = x.date; }   // la plus ancienne : le registre n'est « à jour » que si toutes ses cartes l'ont été
        r[x.verdict] = (r[x.verdict] || 0) + 1;
        if (x.motif) { r.motifs[x.motif] = (r.motifs[x.motif] || 0) + 1; }
        // Une page de protection contre les robots (le site refuse d'être lu) n'est pas une adresse disparue : elle reste « à ouvrir à la main ».
        if (MOTIFS_A_TRAITER.indexOf(x.motif) !== -1 && !(x.motif === 'ailleurs' && RE_PROTECTION_ROBOTS.test((x.site && x.site.finale) || ''))) { r.problemes.push({ id: l.id, nom: (l.valeurs && l.valeurs.nom) || l.nom || l.id, motif: x.motif, url: (x.site && x.site.url) || '', finale: (x.site && x.site.finale) || '' }); }
      });
      if (r.controlees < r.cartes) { r.derniere = ''; }
      return r;
    });
    const datees = registres.map(function (r) { return r.derniere; });
    const derniere = datees.every(Boolean) ? datees.slice().sort()[0] : '';
    const jours = derniere ? Math.floor((Date.parse(maintenant) - Date.parse(derniere.slice(0, 10))) / 86400000) : null;
    const ici = travail.enCours;
    return { ok: true, enCours: mensuel.enCours, registreEnCours: ici ? travail.cle.replace(/^registre:/, '') : '', fait: ici ? travail.fait : 0, total: ici ? travail.total : 0, erreur: mensuel.erreur || (ici ? travail.erreur : ''), registres: registres, derniere: derniere, jours: jours, aFaire: jours === null || jours >= JOURS_ENTRE_TESTS, joursEntreTests: JOURS_ENTRE_TESTS };
  }

  // donnees : { genre, fichier } (mêmes valeurs par défaut). L'avancement n'est rendu que pour le contrôle en cours de CE fichier.
  function etat(donnees) {
    const d = donnees || {}, genre = d.genre || 'sas', fichier = d.fichier || 'employeurs';
    if (!FICHIERS_CONTROLABLES[genre] || FICHIERS_CONTROLABLES[genre].indexOf(fichier) === -1) { return { ok: false, erreur: 'Ce contrôle ne concerne pas « ' + String(fichier).slice(0, 30) + ' ».' }; }
    const ici = travail.cle === cleDe(genre, fichier);
    return { ok: true, enCours: travail.enCours, ailleurs: travail.enCours && !ici, fait: ici ? travail.fait : 0, total: ici ? travail.total : 0, debut: ici ? travail.debut : '', erreur: ici ? travail.erreur : '', resultats: espace(genre, fichier).resultats };
  }
  // Pour les essais : attend la fin du contrôle en cours.
  function attendre() { return new Promise(function (ok) { (function boucle() { if (!travail.enCours) { ok(); } else { setTimeout(boucle, 5); } })(); }); }

  return { demarrer: demarrer, etat: etat, attendre: attendre, demarrerMensuel: demarrerMensuel, bilanMensuel: bilanMensuel, chemin: function (genre, fichier) { return cheminDe(genre || 'sas', fichier || 'employeurs'); } };
}

module.exports = { creerControleSas: creerControleSas, tachesDeCarte: tachesDeCarte, verdictDe: verdictDe, resume: resume, FICHIERS_CONTROLABLES: FICHIERS_CONTROLABLES, RE_PROTECTION_ROBOTS: RE_PROTECTION_ROBOTS };
