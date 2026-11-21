'use strict';
// Courbe de fiabilité du chemin 1 (consigne 504) : k = 1 à 10 compétences prises au hasard dans la fiche d'un métier. Lecture seule.
const { C, pmdDonnees } = require('./commun.js');
const fs = require('fs');
const D = pmdDonnees();
let g = 99; const alea = () => { g = (g * 1664525 + 1013904223) % 4294967296; return g / 4294967296; };
const sortie = [];
D.m.forEach((r, idx) => {
  const pool = []; [['sf', 3], ['se', 4], ['sv', 5]].forEach(([t, col]) => r[col].forEach((i) => pool.push({ t, i })));
  const ordre = []; while (pool.length) { ordre.push(pool.splice(Math.floor(alea() * pool.length), 1)[0]); }
  for (let k = 1; k <= 10 && k <= ordre.length; k++) {
    const S = C.pmcEtatInitial(); S.comp = ordre.slice(0, k); const R = C.pmcCalculer(D, S), top = R.tous[0].sc.pct;
    const rang = R.tous.findIndex((o) => o.i === idx), retenu = R.retenus.some((o) => o.i === idx);
    sortie.push({ k, rang: retenu ? rang : -1, n: R.retenus.length, top, ex: R.tous.filter((o) => o.sc.pct === top).length, pct: R.tous[rang].sc.pct });
  }
});
fs.writeFileSync('courbe1.json', JSON.stringify(sortie)); console.log('fini', sortie.length);
