'use strict';
// Audit « Explorer les métiers » du 21/11/2026 (consigne 503), lecture seule : ne modifie rien dans l'application. Voir docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md.
const { C, pmdDonnees } = require('./commun.js');
const D = pmdDonnees();
let g = 777; const alea = () => { g = (g * 1664525 + 1013904223) % 4294967296; return g / 4294967296; };
const med = (a) => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; }; const pc = (a, p) => { a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length * p)]; };
const calc = (comp) => { const S = C.pmcEtatInitial(); S.comp = comp; const R = C.pmcCalculer(D, S); const top = R.tous[0].sc.pct; return { R, n: R.retenus.length, top, ex: R.tous.filter((o) => o.sc.pct === top).length, tous: R.tous.filter((o) => o.sc.retrouvees === comp.length && o.sc.qualite >= 40).length }; };
// (a) triples cohérents : trois compétences de la fiche d'un métier, une de chaque type quand c'est possible
const coh = []; 
D.m.forEach((r, idx) => {
  const pool = []; [['sf', 3], ['se', 4], ['sv', 5]].forEach(([t, col]) => r[col].forEach((i) => pool.push({ t, i })));
  const pris = []; while (pris.length < 3 && pool.length) { pris.push(pool.splice(Math.floor(alea() * pool.length), 1)[0]); }
  const x = calc(pris); const rang = x.R.tous.findIndex((o) => o.i === idx);
  const top5 = x.R.tous.slice(0, 5); const mem = top5.filter((o) => D.m[o.i][1] === r[1]).length;
  coh.push({ nom: r[0], rang, n: x.n, ex: x.ex, top: x.top, mem, retenu: x.R.retenus.some((o) => o.i === idx), top5: top5.map((o) => D.m[o.i][0]), pris });
});
console.log('(a) triples cohérents', coh.length, '| métier source dans la liste', (coh.filter((x) => x.retenu).length / coh.length * 100).toFixed(1) + '%', '| dans les 10 premiers', (coh.filter((x) => x.retenu && x.rang < 10).length / coh.length * 100).toFixed(1) + '%', '| premier', (coh.filter((x) => x.rang === 0).length / coh.length * 100).toFixed(1) + '%');
console.log('    liste: médiane', med(coh.map((x) => x.n)), 'p10', pc(coh.map((x) => x.n), .1), 'p90', pc(coh.map((x) => x.n), .9), '| ex aequo en tête médiane', med(coh.map((x) => x.ex)), 'p90', pc(coh.map((x) => x.ex), .9), '| secteur identique dans le top 5:', (coh.reduce((s, x) => s + x.mem, 0) / coh.length).toFixed(2), 'aucun:', (coh.filter((x) => x.mem === 0).length / coh.length * 100).toFixed(1) + '%');
console.log('    listes de moins de 3 métiers:', coh.filter((x) => x.n < 3).length);
// (b) triples aléatoires parmi les compétences proposées (savoir-faire et savoir-être)
const pool = []; D.sf.forEach((x, i) => pool.push({ t: 'sf', i })); D.se.forEach((x, i) => pool.push({ t: 'se', i }));
const al = []; for (let k = 0; k < 3000; k++) { const p = []; while (p.length < 3) { const c = pool[Math.floor(alea() * pool.length)]; if (!p.some((y) => y.t === c.t && y.i === c.i)) { p.push(c); } } const x = calc(p); al.push({ n: x.n, top: x.top, ex: x.ex, tous: x.tous, p }); }
console.log('(b) triples aléatoires', al.length, '| liste vide', al.filter((x) => x.n === 0).length, '| moins de 5 métiers', (al.filter((x) => x.n < 5).length / al.length * 100).toFixed(1) + '%', '| médiane', med(al.map((x) => x.n)), '| aucun métier ne retrouve les 3:', (al.filter((x) => x.tous === 0).length / al.length * 100).toFixed(1) + '%', '| ex aequo en tête médiane', med(al.map((x) => x.ex)));
// (c) un choix à la fois : tous les savoir-être et les savoir-faire
const un = pool.map((c) => calc([c])); console.log('(c) un seul choix:', un.length, 'combinaisons ; métiers retenus médiane', med(un.map((x) => x.n)), 'p90', pc(un.map((x) => x.n), .9), 'max', Math.max(...un.map((x) => x.n)), '; ex aequo en tête médiane', med(un.map((x) => x.ex)), 'p90', pc(un.map((x) => x.ex), .9), 'max', Math.max(...un.map((x) => x.ex)));
// compétences portées par un seul métier (donc le métier en tête dès le premier choix)
const solo = []; ['sf', 'se', 'sv'].forEach((t) => { Object.keys(D.inv[t] || {}).forEach((i) => { if (D.inv[t][i].length === 1) { solo.push(t + ':' + i); } }); });
console.log('compétences portées par UN seul métier :', solo.length, '(dont savoirs', solo.filter((s) => s.startsWith('sv')).length + ')');
const lisAll = require('fs'); lisAll.writeFileSync('c1b.json', JSON.stringify({ coh: coh.slice(0, 2000) }));
const mauvais = coh.filter((x) => x.mem === 0).slice(0, 400);
for (let i = 0; i < mauvais.length; i += Math.floor(mauvais.length / 8)) { const x = mauvais[i]; console.log('*', x.nom, '| rang', x.rang, '/', x.n, '|', x.pris.map((c) => D[c.t][c.i].lib.slice(0, 50)).join(' + '), '\n    =>', x.top5.join(' ; ')); }
