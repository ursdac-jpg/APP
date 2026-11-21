'use strict';
// Audit « Explorer les métiers » du 21/11/2026 (consigne 503), lecture seule : ne modifie rien dans l'application. Voir docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md.
const { M, L } = require('./commun.js');
const lr = require('../../data/lettresRiasecRome.js').LETTRES_RIASEC_ROME;
const base = M.baseMetiers;
const sansLettres = base.filter((m) => !lr[m.rome]);
console.log('métiers (noms)', base.length, 'sans lettres', sansLettres.length, sansLettres.slice(0, 15).map((m) => m.nom + ' [' + m.rome + ']'));
const codes = {}; base.forEach((m) => { const c = lr[m.rome]; if (c) { (codes[c] = codes[c] || []).push(m.nom); } });
const tailles = Object.entries(codes).map(([c, n]) => [c, n.length]).sort((a, b) => b[1] - a[1]);
console.log('codes distincts', tailles.length, 'longueur des codes', [1, 2, 3].map((n) => n + ':' + Object.keys(codes).filter((c) => c.length === n).length));
console.log('plus gros codes', tailles.slice(0, 8)); console.log('codes à 1 seul métier', tailles.filter((t) => t[1] === 1).length);
// atteignabilité : pour chaque métier, le code de la personne = ses propres lettres ; rang dans cmlMetiersPourLettres, et nombre d'ex aequo à l'indice 1 avec mêmes lettres
const rangs = []; let hors20 = 0, pasPremier = 0;
const cache = {};
base.forEach((m) => {
  const c = lr[m.rome]; if (!c) { return; }
  if (!cache[c]) { cache[c] = L.cmlMetiersPourLettres(c); }
  const liste = cache[c], r = liste.findIndex((x) => x.metier.nom === m.nom);
  rangs.push({ nom: m.nom, c, r, n: liste.length, memes: liste.filter((x) => x.memesLettres && x.indice === 1).length });
});
const sorted = rangs.map((x) => x.r).sort((a, b) => a - b);
console.log('rang médian', sorted[sorted.length >> 1], 'absents', rangs.filter((x) => x.r < 0).length, 'hors 20 premiers', rangs.filter((x) => x.r >= 20).length, 'hors 50', rangs.filter((x) => x.r >= 50).length);
const gros = Object.entries(cache).map(([c, l]) => [c, l.filter((x) => x.indice === 1 && x.memesLettres).length]).sort((a, b) => b[1] - a[1]).slice(0, 6); console.log('code -> métiers à indice 1', gros);
// codes de la personne qui existent (1 à 3 lettres parmi 6, ordonnées) : combien n'ont aucun métier de mêmes lettres
const LET = 'RIASEC'.split(''); const perso = [];
LET.forEach((a) => { perso.push(a); LET.forEach((b) => { if (b !== a) { perso.push(a + b); LET.forEach((c) => { if (c !== a && c !== b) { perso.push(a + b + c); } }); } }); });
let vides = 0; const sansExact = [];
perso.forEach((p) => { const l = L.cmlMetiersPourLettres(p); const ex = l.filter((x) => x.indice === 1).length; if (!l.length) { vides++; } if (!ex) { sansExact.push(p); } });
console.log('codes de personne possibles', perso.length, 'liste vide', vides, 'sans métier à indice 1', sansExact.length, sansExact.slice(0, 20).join(' '));
