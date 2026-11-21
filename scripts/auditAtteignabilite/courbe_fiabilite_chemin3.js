'use strict';
// Courbe de fiabilité du chemin 3 (consigne 508), lecture seule : une personne simulée a un code RIASEC ; elle répond à tous les énoncés selon ce code,
// puis on ne garde qu'un nombre m de réponses (les autres lignes restent vides, donc comptent zéro, comme dans l'application).
// On regarde si le code retrouvé est celui de la personne (première lettre, ensemble des trois lettres) et si le résultat est encore « peu de réponses ».
// Une personne simulée n'est pas une vraie personne : la courbe donne un ordre de grandeur, pas une mesure de la réalité.
// Lancer : node scripts/auditAtteignabilite/courbe_fiabilite_chemin3.js
const { L } = require('./commun.js');
let graine = 20261121; const alea = () => { graine = (graine * 1664525 + 1013904223) % 4294967296; return graine / 4294967296; };
const LET = L.CML_LETTRES;
const codes = ['RIA', 'SAE', 'IEC', 'ASI', 'RCE', 'CSE', 'RIC', 'SEA', 'IAS', 'ECR', 'CRI', 'ESC', 'ARI', 'SCE', 'IRA', 'EAS', 'CIR', 'RSE', 'AIE', 'SRC', 'ERC', 'IAR', 'ACS', 'RES', 'CIE', 'SIA', 'EIC', 'RAC', 'ISE', 'CAE'];
const poids = (code) => { const w = {}; LET.forEach((l) => { w[l] = 0.12; }); [0.9, 0.7, 0.5].forEach((p, i) => { w[code[i]] = p; }); return w; };
const enonces = [];
['p1', 'p2', 'p3', 'p4'].forEach((p) => L.cmqEnonces(p).forEach((e) => enonces.push({ p, e })));
function repondre(code) {
  const w = poids(code), rep = { p1: {}, p2: {}, p3: {}, p4: {} };
  enonces.forEach(({ p, e }) => {
    let q;
    if (p === 'p2') { let s = 0, t = 0; LET.forEach((l) => { s += e.profil[l] * w[l]; t += e.profil[l]; }); q = t ? s / t : 0.12; } else { q = w[e.lettre]; }
    const a = alea();
    if (p === 'p1' || p === 'p2') { rep[p][e.id] = a < q ? 'oui' : 'non'; }
    else if (p === 'p3') { rep[p][e.id] = a < q * 0.7 ? 'a_laise' : (a < q ? 'en_progres' : 'pas_encore'); }
    else { rep[p][e.id] = a < q * 0.7 ? 'ressemble' : (a < q ? 'un_peu' : 'pas_vraiment'); }
  });
  return rep;
}
function garder(rep, m) {
  const idx = enonces.map((x, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(alea() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const ok = new Set(idx.slice(0, m)), sortie = { p1: {}, p2: {}, p3: {}, p4: {} };
  enonces.forEach(({ p, e }, i) => { if (ok.has(i)) { sortie[p][e.id] = rep[p][e.id]; } });
  return sortie;
}
const GRILLE = [10, 20, 30, 45, 60, 90, 120, 150, 200, 250, 300];
const REP = 12;
console.log('énoncés', enonces.length, 'personnes simulées', codes.length * REP);
console.log('m'.padStart(4), 'normal'.padStart(7), 'peuRep'.padStart(7), '1re lettre'.padStart(11), '3 lettres (ensemble)'.padStart(21), 'même code que 300'.padStart(19), 'liste métiers (médiane)'.padStart(24));
const sortie = [];
GRILLE.forEach((m) => {
  let n = 0, normal = 0, peu = 0, prem = 0, ens = 0, memeComplet = 0; const tailles = [];
  codes.forEach((code) => { for (let r = 0; r < REP; r++) {
    const rep = repondre(code), complet = L.cmqCalculer(rep), part = L.cmqCalculer(garder(rep, m));
    n++; if (part.etat === 'peu_reponses') { peu++; } else { normal++; }
    if (part.code && part.code[0] === code[0]) { prem++; }
    if (part.code && part.code.length === 3 && part.code.slice().sort().join('') === code.split('').sort().join('')) { ens++; }
    if (part.code && complet.code && part.code.join('') === complet.code.join('')) { memeComplet++; }
    tailles.push(part.code ? L.cmlMetiersPourLettres(part.lettresPourMetiers).length : 0);
  } });
  tailles.sort((a, b) => a - b);
  const pc = (x) => Math.round(100 * x / n) + ' %';
  console.log(String(m).padStart(4), pc(normal).padStart(7), pc(peu).padStart(7), pc(prem).padStart(11), pc(ens).padStart(21), pc(memeComplet).padStart(19), String(tailles[n >> 1]).padStart(24));
  sortie.push({ m, normal: normal / n, peu: peu / n, premiere: prem / n, ensemble: ens / n, memeCode: memeComplet / n, listeMediane: tailles[n >> 1] });
});
