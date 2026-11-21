'use strict';
// Audit « Explorer les métiers » du 21/11/2026 (consigne 503), lecture seule : ne modifie rien dans l'application. Voir docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md.
const { C, pmdDonnees } = require('./commun.js');
const fs = require('fs');
const D = pmdDonnees();
console.log('métiers', D.m.length, 'sf', D.sf.length, 'se', D.se.length, 'sv', D.sv.length);
const inv = D.inv; // inv[t][id] = liste de métiers
const out = [];
const KMAX = 8;
D.m.forEach((r, idx) => {
  const cand = [];
  [['sf', 3], ['se', 4], ['sv', 5]].forEach(([t, col]) => r[col].forEach((id) => cand.push({ t, i: id, n: (inv[t] && inv[t][id]) ? inv[t][id].length : 99999 })));
  const res = { nom: r[0], secteur: r[1], niveau: r[2], nComp: cand.length, nSf: r[3].length, nSe: r[4].length, nSv: r[5].length, k1: null, k5: null, k20: null, rang: {} };
  cand.sort((a, b) => a.n - b.n);
  for (let k = 1; k <= KMAX && k <= cand.length; k++) {
    const S = C.pmcEtatInitial(); S.comp = cand.slice(0, k).map((c) => ({ t: c.t, i: c.i }));
    const R = C.pmcCalculer(D, S);
    const rang = R.tous.findIndex((o) => o.i === idx);
    const retenu = R.retenus.some((o) => o.i === idx);
    res.rang[k] = { r: rang, retenu, n: R.retenus.length, pct: R.tous[rang].sc.pct, top: R.tous[0].sc.pct };
    if (retenu) { if (res.k20 === null && rang < 20) { res.k20 = k; } if (res.k5 === null && rang < 5) { res.k5 = k; } if (res.k1 === null && rang === 0) { res.k1 = k; } }
    if (res.k1 !== null && res.k5 !== null && res.k20 !== null) { break; }
  }
  out.push(res);
});
fs.writeFileSync('c1.json', JSON.stringify(out));
const sans = out.filter((x) => x.nComp === 0);
const dist = (k) => { const d = {}; out.forEach((x) => { const v = x[k] === null ? 'jamais' : x[k]; d[v] = (d[v] || 0) + 1; }); return d; };
console.log('sans aucune compétence', sans.length, sans.slice(0, 10).map((x) => x.nom));
console.log('k20', dist('k20')); console.log('k5', dist('k5')); console.log('k1', dist('k1'));
