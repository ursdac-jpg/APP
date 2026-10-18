/* ============================================================
   verifierRecruteursSas.js  --  controle automatique des pages de recrutement du sas (outils/sas/recruteurs.sas.txt)
   Usage : node scripts/verifierRecruteursSas.js [fichier.sas.txt] [fichier-rapport.md]
   Ce que le script PROUVE : l'adresse existe (ou non), a quel domaine elle appartient, et si la page parle d'emploi.
   Ce qu'il ne prouve PAS : que des offres y sont publiees aujourd'hui, ni leur date. Beaucoup de sites refusent les robots (403) :
   ces pages restent « a ouvrir a la main ». Jamais une page n'est declaree bonne par ce script seul.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SAS = path.resolve(RACINE, process.argv[2] || 'outils/sas/recruteurs.sas.txt');
const RAPPORT = path.resolve(RACINE, process.argv[3] || 'docs/VERIFICATION_RECRUTEURS_DORDOGNE_2026-10-16.md');
const COLONNES = ['id', 'famille', 'nom', 'secteur', 'territoire', 'url', 'offres', 'date', 'compte', 'source', 'dateVerif'];
const INTERDITS = /(indeed|jooble|optioncarriere|cadremploi|hellowork|welcometothejungle|meteojob|jobteaser|linkedin|glassdoor|jobijoba|staffsante|staffsocial|adzuna|randstad|manpower|samsic-emploi|francetravail\.fr\/offres|candidat\.francetravail)/i;
const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function lire() {
  return fs.readFileSync(SAS, 'utf8').split(/\r?\n/).filter(function (l) { return l.trim() && l.charAt(0) !== '#'; }).map(function (l) {
    const c = l.split('|').map(function (x) { return x.trim(); });
    const o = {}; COLONNES.forEach(function (k, i) { o[k] = c[i] || ''; }); o.nbColonnes = c.length; return o;
  });
}

async function tester(url) {
  const essai = async function () {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': AGENT, 'accept-language': 'fr-FR,fr;q=0.9', accept: 'text/html,application/xhtml+xml' } });
    const corps = (await r.text()).slice(0, 400000);
    return { statut: r.status, finale: r.url, corps: corps };
  };
  try { return await essai(); } catch (e) {
    try { return await essai(); } catch (e2) { return { erreur: (e2.cause && e2.cause.code) || e2.message }; }
  }
}

function hote(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }

function verdict(l, r) {
  const notes = [];
  if (l.nbColonnes !== 11) { notes.push('format : ' + l.nbColonnes + ' colonnes au lieu de 11'); }
  if (INTERDITS.test(l.url)) { return { v: 'ECARTER', notes: ['adresse d\'un intermédiaire ou d\'un agrégateur (interdit par les règles)'] }; }
  if (r.erreur === 'ENOTFOUND') { return { v: 'MORTE', notes: ["le nom de domaine n'existe pas : adresse inventée (ou site disparu)"] }; }
  if (r.erreur) { return { v: 'BLOQUEE', notes: ['connexion impossible depuis ici (' + r.erreur + ') : problème de certificat, de délai ou refus des robots ; le site peut exister, à ouvrir à la main'] }; }
  if (r.statut === 404 || r.statut === 410) {
    const accueil = r.accueil ? (r.accueil >= 200 && r.accueil < 400 ? 'le site existe (son accueil répond), mais cette page précise est introuvable : adresse fausse ou changée, à chercher sur le site' : "même l'accueil du site ne répond pas (" + r.accueil + ')') : 'accueil non testé';
    return { v: 'PAGE_INTROUVABLE', notes: ['page introuvable (' + r.statut + ') ; ' + accueil] };
  }
  if (r.statut >= 200 && r.statut < 300) {
    const titre = ((r.corps.match(/<title[^>]*>([^<]*)/i) || [])[1] || '');
    if (/404|introuvable|not found|page non trouv|erreur/i.test(titre)) { return { v: 'A_VOIR', notes: ['la page répond mais son titre annonce une erreur : « ' + titre.trim().slice(0, 60) + ' »'] }; }
    const mots = /offre|recrut|emploi|carri[eè]re|postul|rejoign|candidat|job/i.test(r.corps);
    if (hote(r.finale) !== hote(l.url)) { notes.push('redirigée vers un autre domaine : ' + hote(r.finale)); }
    if (!mots) { notes.push('la page ne parle pas d\'emploi (aucun mot de recrutement)'); }
    return { v: mots ? 'REPOND' : 'A_VOIR', notes: notes };
  }
  return { v: 'BLOQUEE', notes: ['le site répond ' + r.statut + ' aux robots : à ouvrir à la main'] };
}

async function main() {
  const lignes = lire();
  const resultats = new Array(lignes.length);
  let suivant = 0;
  async function ouvrier() {
    while (suivant < lignes.length) {
      const i = suivant++;
      resultats[i] = await tester(lignes[i].url);
    }
  }
  await Promise.all([1, 2, 3, 4, 5, 6].map(ouvrier));
  // Pour les pages introuvables, on teste aussi l'accueil du meme site : un site qui repond a une page de recrutement a retrouver, un site muet est a ecarter.
  for (let i = 0; i < lignes.length; i++) {
    if (resultats[i].statut === 404 || resultats[i].statut === 410) {
      const racine = (function () { try { return new URL(lignes[i].url).origin + '/'; } catch (e) { return ''; } })();
      const a = racine ? await tester(racine) : { erreur: 'x' };
      resultats[i].accueil = a.statut || 0;
    }
  }
  const lots = { REPOND: [], A_VOIR: [], BLOQUEE: [], PAGE_INTROUVABLE: [], MORTE: [], ECARTER: [] };
  const urls = {};
  lignes.forEach(function (l, i) {
    const v = verdict(l, resultats[i]);
    if (urls[l.url]) { v.notes.push('doublon de la ligne ' + urls[l.url]); } else { urls[l.url] = l.id; }
    lots[v.v].push({ l: l, r: resultats[i], v: v });
  });
  const titre = { REPOND: 'La page répond et parle d\'emploi', A_VOIR: 'La page répond mais ne parle pas d\'emploi : à regarder', BLOQUEE: 'Contrôle impossible depuis ici (refus des robots, certificat, délai) : à ouvrir à la main', PAGE_INTROUVABLE: 'Page introuvable mais le site existe : chercher la bonne adresse', MORTE: 'Nom de domaine inexistant : adresse inventée, à écarter', ECARTER: 'À écarter d\'office' };
  let md = '# Contrôle automatique des pages de recrutement du sas\n\n';
  md += '> Généré par `node scripts/verifierRecruteursSas.js` le ' + new Date().toISOString().slice(0, 10) + ' sur `outils/sas/recruteurs.sas.txt` (' + lignes.length + ' lignes).\n';
  md += '> **Ce que ce contrôle prouve** : l\'adresse existe, son domaine, et la page parle d\'emploi. **Ce qu\'il ne prouve pas** : que des offres y sont publiées aujourd\'hui, ni leur date (à voir en ouvrant la page). ' +
    'Un site qui répond ne vaut pas validation : Denis ouvre la page et tranche.\n\n';
  md += '| Verdict | Nombre |\n|---|---|\n' + Object.keys(lots).map(function (k) { return '| ' + titre[k] + ' | ' + lots[k].length + ' |'; }).join('\n') + '\n\n';
  Object.keys(lots).forEach(function (k) {
    if (!lots[k].length) { return; }
    md += '## ' + titre[k] + ' (' + lots[k].length + ')\n\n';
    lots[k].forEach(function (x) {
      md += '- **' + x.l.nom + '** (`' + x.l.id + '`) : ' + x.l.url + (x.r.statut ? ' (' + x.r.statut + ')' : '') + (x.v.notes.length ? ' . ' + x.v.notes.join(' ; ') : '') + '\n';
    });
    md += '\n';
  });
  fs.writeFileSync(RAPPORT, md.replace(/\n/g, '\r\n'), 'utf8');
  console.log(Object.keys(lots).map(function (k) { return k + ' ' + lots[k].length; }).join(' | '));
}
main();
