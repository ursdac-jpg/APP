'use strict';
// Courbe de fiabilité du chemin 2 (consigne 504) : pour k = 1 à 10 choix pris AU HASARD dans la fiche d'un métier (comme le ferait une personne qui pense à ce métier),
// le métier est-il dans les 10 premiers, premier ? Combien de métiers dans la liste ? Combien à égalité en tête ? Lecture seule.
// Lancer : node courbe_fiabilite_chemin2.js <numéro de tranche> <nombre de tranches>   (puis courbe_fiabilite_resume.js)
const { M, L, CAT } = require('./commun.js');
const fs = require('fs');
const S = Number(process.argv[2] || 0), N = Number(process.argv[3] || 1);
const corr = M.correspond, base = M.baseMetiers, cats = ['activites', 'actions', 'environnement'];
const ids = []; cats.forEach((c) => CAT[c].forEach((g) => g.items.forEach((it) => ids.push({ cat: c, item: it.id }))));
let graine = 4242; const alea = () => { graine = (graine * 1664525 + 1013904223) % 4294967296; return graine / 4294967296; };
const sortie = [];
const KMAX = 10;
// 600 métiers pris à pas régulier dans la base
for (let idx = 3; idx < base.length; idx += 3) {
  const m = base[idx]; if (Math.floor(idx / 3) % N !== S) { continue; }
  const portes = []; [m, m.signatureRome].forEach((sig) => { if (!sig) { return; } ids.forEach((c) => { if ((sig[c.cat] || []).some((x) => corr(c.item, x)) && !portes.some((p) => p.item === c.item)) { portes.push(c); } }); });
  const pool = portes.slice(), ordre = []; while (pool.length) { ordre.push(pool.splice(Math.floor(alea() * pool.length), 1)[0]); }
  for (let k = 1; k <= KMAX && k <= ordre.length; k++) {
    const choix = { activites: [], actions: [], environnement: [] }; ordre.slice(0, k).forEach((c) => choix[c.cat].push(c.item));
    const r = L.cmlEntree2Metiers(choix, 5000), rang = r.findIndex((x) => x.nom === m.nom), top = r[0] ? r[0].score : 0;
    sortie.push({ k, rang, n: r.length, top, ex: r.filter((x) => x.score === top).length, pct: rang >= 0 ? r[rang].score : 0, secteur5: r.slice(0, 5).filter((x) => x.secteur === m.secteur).length });
  }
}
fs.writeFileSync('courbe2_' + S + '.json', JSON.stringify(sortie));
console.log('fini', S, sortie.length);
