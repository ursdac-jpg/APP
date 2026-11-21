'use strict';
// Audit « Explorer les métiers » du 21/11/2026 (consigne 503), lecture seule : ne modifie rien dans l'application. Voir docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md.
const { M, CAT } = require('./commun.js');
const corr = M.correspond, base = M.baseMetiers, cats = ['activites', 'actions', 'environnement'];
const ids = []; cats.forEach((c) => CAT[c].forEach((g) => g.items.forEach((it) => ids.push({ cat: c, item: it.id, label: it.label }))));
const portes = (sig) => sig ? ids.filter((c) => (sig[c.cat] || []).some((x) => corr(c.item, x))) : [];
const P = base.map((m) => ({ m, a: portes(m), b: portes(m.signatureRome) }));
console.log('métiers sans AUCUN choix du catalogue (ni fiche ni signature ROME):', P.filter((p) => !p.a.length && !p.b.length).map((p) => p.m.nom));
console.log('une seule signature vide: fiche', P.filter((p) => !p.a.length).length, ' ROME', P.filter((p) => !p.b.length).length);
// signature utilisée = la plus riche ; distribution du nombre de choix portés
const nb = P.map((p) => Math.max(p.a.length, p.b.length)).sort((x, y) => x - y);
console.log('choix portés par métier: min', nb[0], 'p5', nb[Math.floor(nb.length * .05)], 'médiane', nb[nb.length >> 1], 'p95', nb[Math.floor(nb.length * .95)], 'max', nb[nb.length - 1]);
const petits = P.map((p) => ({ nom: p.m.nom, secteur: p.m.secteur, n: Math.max(p.a.length, p.b.length), a: p.a.length, b: p.b.length })).sort((x, y) => x.n - y.n).slice(0, 15);
console.log('métiers qui portent le moins de choix:', petits.map((x) => x.nom + ' : ' + x.n + ' (fiche ' + x.a + ', ROME ' + x.b + ')'));
// nombre de métiers par choix
const parChoix = {}; ids.forEach((c) => { parChoix[c.item] = 0; });
P.forEach((p) => { const u = new Set(); p.a.concat(p.b).forEach((c) => u.add(c.item)); u.forEach((i) => { parChoix[i]++; }); });
console.log('choix portés par aucun métier:', ids.filter((c) => !parChoix[c.item]).map((c) => c.label));
console.log('choix les plus rares:', Object.entries(parChoix).sort((x, y) => x[1] - y[1]).slice(0, 8));
// étiquettes douteuses : portée par moins de 3 % des métiers de son secteur (secteur >= 20 métiers) alors que le choix existe ailleurs
const parSect = {}; P.forEach((p) => { (parSect[p.m.secteur] = parSect[p.m.secteur] || []).push(p); });
const partSect = {}; Object.keys(parSect).forEach((s) => { partSect[s] = {}; parSect[s].forEach((p) => { const u = new Set(); p.a.concat(p.b).forEach((c) => u.add(c.item)); u.forEach((i) => { partSect[s][i] = (partSect[s][i] || 0) + 1; }); }); });
const dout = P.map((p) => { const u = new Map(); p.b.concat(p.a).forEach((c) => u.set(c.item, c)); const s = p.m.secteur, n = parSect[s].length; const dt = []; if (n >= 20) { u.forEach((c) => { const part = (partSect[s][c.item] || 0) / n; if (part < 0.03 && parChoix[c.item] / base.length < 0.2) { dt.push(c.label); } }); } return { nom: p.m.nom, secteur: s, nb: u.size, dt }; });
const sus = dout.filter((d) => d.dt.length >= 2).sort((a, b) => b.dt.length - a.dt.length);
console.log('métiers avec au moins 2 choix étrangers à leur secteur:', sus.length, ' avec 1+:', dout.filter((d) => d.dt.length >= 1).length);
sus.slice(0, 25).forEach((d) => console.log(' -', d.nom, '[' + d.secteur + ']', d.dt.join(' ; ')));
require('fs').writeFileSync('etiq.json', JSON.stringify({ dout }));
