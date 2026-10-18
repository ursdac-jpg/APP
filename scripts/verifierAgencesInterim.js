/* ============================================================
   verifierAgencesInterim.js  --  contrôle automatique des agences d'intérim proposées (outils/sas/interim.sas.txt)
   Usage : node scripts/verifierAgencesInterim.js [fichier.sas.txt] [rapport.md]
   Format du sas : id | réseau | nom | commune | code postal | adresse | téléphone | page | origine | remarque | date
   Ce que le script PROUVE : la page existe, et si le TÉLÉPHONE et l'ADRESSE de la ligne figurent dans le texte de cette page (niveau A = les deux, B = un des deux,
   C = la page répond mais ne contient ni l'un ni l'autre : page générale ou ligne fausse, D = page refusée aux robots, absente ou sans réponse).
   Il repère aussi les doublons (même adresse dans deux communes, même téléphone pour deux agences).
   Ce qu'il ne prouve PAS : que l'agence est ouverte aujourd'hui. Jamais une agence n'est déclarée bonne par ce script seul : Denis ouvre la page à la main.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SAS = path.resolve(RACINE, process.argv[2] || 'outils/sas/interim.sas.txt');
const RAPPORT = path.resolve(RACINE, process.argv[3] || 'docs/VERIFICATION_AGENCES_INTERIM_2026-10-17.md');
const COLONNES = ['id', 'reseau', 'nom', 'commune', 'cp', 'adresse', 'telephone', 'page', 'origine', 'remarque', 'date'];
const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function lire() {
  return fs.readFileSync(SAS, 'utf8').split(/\r?\n/).filter(function (l) { return l.trim() && l.charAt(0) !== '#'; }).map(function (l) {
    const c = l.split('|').map(function (x) { return x.trim(); }); const o = {}; COLONNES.forEach(function (k, i) { o[k] = c[i] || ''; }); return o;
  });
}
const norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); };
const chiffres = function (t) { return String(t || '').replace(/\D+/g, ''); };

async function ouvrir(url) {
  const essai = async function () {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': AGENT, 'accept-language': 'fr-FR,fr;q=0.9', accept: 'text/html,application/xhtml+xml' } });
    const corps = (await r.text()).slice(0, 900000);
    return { statut: r.status, finale: r.url, corps: corps };
  };
  try { return await essai(); } catch (e) { try { return await essai(); } catch (e2) { return { erreur: (e2.cause && e2.cause.code) || e2.message }; } }
}

function evaluer(l, r) {
  if (!l.page) { return { niveau: 'D', note: 'aucune page indiquée' }; }
  if (r.erreur) { return { niveau: 'D', note: 'la page ne répond pas (' + r.erreur + ')' }; }
  if (r.statut === 403 || r.statut === 429) { return { niveau: 'D', note: 'page refusée aux robots (' + r.statut + ') : à ouvrir à la main' }; }
  if (r.statut >= 400) { return { niveau: 'D', note: 'page absente ou en erreur (' + r.statut + ')' }; }
  const texte = norm(r.corps.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
  const bonTel = l.telephone ? chiffres(r.corps.replace(/<[^>]+>/g, ' ')).indexOf(chiffres(l.telephone)) !== -1 : null;
  // L'adresse doit figurer d'un seul tenant (numéro, type de voie, nom de la voie : les quatre premiers mots), jamais des mots épars sur une grande page.
  const adr = norm(l.adresse).split(' ').slice(0, 4).join(' ');
  const bonAdr = adr.length >= 6 ? texte.indexOf(adr) !== -1 : null;
  const notes = [];
  if (bonTel === true) { notes.push('téléphone retrouvé sur la page'); } else if (bonTel === false) { notes.push('téléphone ABSENT de la page'); }
  if (bonAdr === true) { notes.push('adresse retrouvée sur la page'); } else if (bonAdr === false) { notes.push('adresse ABSENTE de la page'); }
  const niveau = (bonTel === true && bonAdr === true) ? 'A' : ((bonTel === true || bonAdr === true) ? 'B' : 'C');
  return { niveau: niveau, note: notes.join(' ; ') || 'page ouverte' };
}

(async function () {
  const lignes = lire();
  const sortie = [];
  let suivant = 0;
  async function travailleur() {
    while (suivant < lignes.length) {
      const i = suivant++, l = lignes[i];
      const r = l.page ? await ouvrir(l.page) : { erreur: 'sans page' };
      sortie[i] = Object.assign({ l: l }, evaluer(l, r));
      process.stdout.write('.');
    }
  }
  await Promise.all(Array.from({ length: 4 }, travailleur));
  console.log('');
  // doublons
  const parAdresse = {}, parTel = {};
  lignes.forEach(function (l) {
    const a = norm(l.adresse); if (a && a.length > 8) { (parAdresse[a] = parAdresse[a] || []).push(l); }
    const t = chiffres(l.telephone); if (t.length === 10) { (parTel[t] = parTel[t] || []).push(l); }
  });
  const doublons = [];
  Object.keys(parAdresse).forEach(function (a) { const g = parAdresse[a]; if (g.length > 1) { const villes = g.map(function (x) { return x.commune; }).filter(function (v, i, t) { return t.indexOf(v) === i; }); doublons.push((villes.length > 1 ? 'MÊME ADRESSE DANS DES COMMUNES DIFFÉRENTES' : 'même adresse') + ' : « ' + g[0].adresse + ' » : ' + g.map(function (x) { return x.nom + ' (' + x.commune + ')'; }).join(' ; ')); } });
  Object.keys(parTel).forEach(function (t) { const g = parTel[t]; if (g.length > 1) { doublons.push('même téléphone ' + g[0].telephone + ' : ' + g.map(function (x) { return x.nom; }).join(' ; ')); } });
  const nb = { A: 0, B: 0, C: 0, D: 0 }; sortie.forEach(function (s) { nb[s.niveau]++; });
  let md = '# Contrôle automatique des agences d\'intérim (Dordogne et Haute-Vienne)\n\n> Généré par `node scripts/verifierAgencesInterim.js` le ' + new Date().toISOString().slice(0, 10) + ' sur `outils/sas/interim.sas.txt` (' + lignes.length + ' lignes).\n> **Ce contrôle ne déclare jamais une agence bonne** : Denis ouvre la page à la main. Niveau A = téléphone ET adresse retrouvés dans la page de l\'agence ; B = l\'un des deux ; C = la page répond mais ne les contient pas (page générale ou ligne fausse) ; D = page refusée aux robots, absente ou non indiquée.\n\n';
  md += 'Résumé : A ' + nb.A + ', B ' + nb.B + ', C ' + nb.C + ', D ' + nb.D + '.\n\n## Doublons et anomalies\n\n' + (doublons.length ? doublons.map(function (d) { return '- ' + d; }).join('\n') : 'Aucun.') + '\n\n## Détail\n\n| Niveau | Agence | Commune | Téléphone | Origine | Constat |\n|---|---|---|---|---|---|\n';
  ['A', 'B', 'C', 'D'].forEach(function (n) {
    sortie.filter(function (s) { return s.niveau === n; }).forEach(function (s) {
      md += '| ' + n + ' | ' + s.l.nom + ' | ' + s.l.commune + ' | ' + (s.l.telephone || 'introuvable') + ' | ' + s.l.origine + ' | ' + s.note + (s.l.remarque ? ' ; remarque : ' + s.l.remarque : '') + ' |\n';
    });
  });
  fs.writeFileSync(RAPPORT, md);
  console.log('A', nb.A, 'B', nb.B, 'C', nb.C, 'D', nb.D, '| doublons :', doublons.length, '| rapport :', path.relative(RACINE, RAPPORT));
})();
