// Compare les positions des mots du navigateur (px, repere de la page du CV) et celles de Word (points, repere de la page).
// Usage : node scripts/word/comparer.js <dossier> <nom> [--detail]
// Entrees : <nom>.mots.json (navigateur : [{t,x,y,l,h}]) et <nom>.word.json (Word : {pages, mots:[{t,p,x,y}]}).
// Sortie : nombre de pages, mots apparies, ecarts en millimetres (mediane et 95e centile, horizontal et vertical), ecarts systematiques.
const fs = require('fs'), path = require('path');
const [, , dossier, nom, ...drapeaux] = process.argv;
const lire = (f) => JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8').replace(/^﻿/, ''));
const nav = lire(nom + '.mots.json');
const word = lire(nom + '.word.json');
const PX_MM = 25.4 / 96, PT_MM = 25.4 / 72;
const HAUTEUR_PAGE_PX = 1122.52;
const norm = (t) => String(t).replace(/[\s  ]/g, '').toLowerCase();

const motsWord = word.mots.map((m) => ({ t: norm(m.t), p: m.p, x: m.x, y: m.y })).filter((m) => m.t);
// Navigateur : le mot est un tableau [t, x, y] ou un objet {t, x, y}
const motsNav = nav.map((m) => Array.isArray(m) ? { t: m[0], x: m[1], y: m[2] } : m);

let i = 0, apparies = [], manquants = [];
for (const d of motsNav) {
  const cible = norm(d.t);
  if (!cible) { continue; }
  // cherche, a partir du pointeur, la suite de mots Word dont la concatenation vaut le mot du navigateur
  let trouve = false;
  for (let debut = i; debut < Math.min(i + 12, motsWord.length) && !trouve; debut++) {
    let cumul = '';
    for (let k = debut; k < Math.min(debut + 8, motsWord.length); k++) {
      cumul += motsWord[k].t;
      if (cumul === cible) { apparies.push({ d, w: motsWord[debut] }); i = k + 1; trouve = true; break; }
      if (!cible.startsWith(cumul)) { break; }
    }
  }
  if (!trouve) { manquants.push(d.t); }
}
const stats = (v) => { const t = v.slice().sort((a, b) => a - b); const q = (p) => t.length ? t[Math.min(t.length - 1, Math.floor(p * t.length))] : NaN; return { med: q(0.5), p95: q(0.95), min: t[0], max: t[t.length - 1] }; };
const dx = [], dy = [], lignes = [];
for (const a of apparies) {
  const pageNav = Math.floor(a.d.y / HAUTEUR_PAGE_PX) + 1;
  if (pageNav !== 1 || a.w.p !== 1) { continue; }   // seule la page 1 est comparee (la pagination du navigateur est continue)
  const ex = a.w.x * PT_MM - a.d.x * PX_MM;
  const ey = a.w.y * PT_MM - a.d.y * PX_MM;
  dx.push(ex); dy.push(ey); lignes.push({ t: a.d.t, ex: +ex.toFixed(1), ey: +ey.toFixed(1), yNav: Math.round(a.d.y) });
}
// Rapport de largeur du texte (Word / navigateur) : sur une meme ligne, distance au premier mot de la ligne (lignes d'au moins 150 px).
const parLigne = {};
for (const a of apparies) { const c = Math.round(a.d.y / 6); (parLigne[c] = parLigne[c] || []).push(a); }
const rapports = [];
for (const k of Object.keys(parLigne)) {
  const l = parLigne[k].sort((p, q) => p.d.x - q.d.x);
  const d0 = l[0].d.x, w0 = l[0].w.x / 0.75;
  for (const a of l.slice(1)) { const dd = a.d.x - d0; if (dd >= 150 && a.w.p === 1 && Math.abs(a.w.y * 4 / 3 - a.d.y) < 40) { rapports.push((a.w.x / 0.75 - w0) / dd); } }
}
const ratioLargeur = rapports.length ? +(stats(rapports).med).toFixed(4) : null;
const med = (v) => stats(v).med;
const dyMed = med(dy), dxMed = med(dx);
const dxRes = dx.map((v) => Math.abs(v - dxMed)), dyRes = dy.map((v) => Math.abs(v - dyMed));
console.log(JSON.stringify({
  nom, pagesWord: word.pages, motsNavigateur: motsNav.length, motsWord: motsWord.length, apparies: apparies.length, manquants: manquants.length,
  page1: dx.length,
  horizontal_mm: { mediane: +dxMed.toFixed(2), residuMed: +med(dxRes).toFixed(2), residuP95: +stats(dxRes).p95.toFixed(2), max: +stats(dxRes).max.toFixed(2) },
  vertical_mm: { mediane: +dyMed.toFixed(2), residuMed: +med(dyRes).toFixed(2), residuP95: +stats(dyRes).p95.toFixed(2), max: +stats(dyRes).max.toFixed(2) },
  ratioLargeurWordSurNavigateur: ratioLargeur, mesuresRatio: rapports.length,
  exemplesManquants: manquants.slice(0, 8)
}, null, 1));
if (drapeaux.includes('--detail')) { lignes.filter((l, k) => k % 4 === 0).forEach((l) => console.log(l.yNav, l.t, 'dx', l.ex, 'dy', l.ey)); }
