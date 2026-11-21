'use strict';
// Audit « Explorer les métiers » du 21/11/2026 (consigne 503), lecture seule : ne modifie rien dans l'application. Voir docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md.
const { M, L, CAT } = require('./commun.js');
const fs = require('fs');
const [,, shard, nshards] = process.argv; const S = Number(shard), N = Number(nshards);
const corr = M.correspond, base = M.baseMetiers, cats = ['activites', 'actions', 'environnement'];
const ids = []; cats.forEach((c) => CAT[c].forEach((g) => g.items.forEach((it) => ids.push({ cat: c, item: it.id, label: it.label }))));
let graine = 12345; const alea = () => { graine = (graine * 1664525 + 1013904223) % 4294967296; return graine / 4294967296; };
const aChoix = (liste) => { const c = { activites: [], actions: [], environnement: [] }; liste.forEach((x) => c[x.cat].push(x.item)); return c; };
const evaluer = (liste, source) => {
  const r = L.cmlEntree2Metiers(aChoix(liste), 5000);
  const top = r[0] ? r[0].score : 0;
  const ex = r.filter((m) => m.score === top).length;
  const tous = r.filter((m) => m.choixRetrouves === liste.length).length;
  const res = { n: r.length, top, ex, tous, top5: r.slice(0, 5).map((m) => [m.nom, m.secteur, m.score, m.choixRetrouves]) };
  if (source) { res.rang = r.findIndex((m) => m.nom === source.nom); res.memeSecteur5 = r.slice(0, 5).filter((m) => m.secteur === source.secteur).length; }
  return res;
};
const out = { paires: [], triples: [], coherents: [] };
// A. toutes les paires
let k = 0;
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { if (k++ % N === S) { const e = evaluer([ids[i], ids[j]]); e.choix = [ids[i].item, ids[j].item]; out.paires.push(e); } }
// B. 3000 triples « naturels » : un choix de chaque catégorie (graine fixe, identique pour tous les processus)
const par = {}; cats.forEach((c) => { par[c] = ids.filter((x) => x.cat === c); });
const triples = []; for (let t = 0; t < 3000; t++) { triples.push(cats.map((c) => par[c][Math.floor(alea() * par[c].length)])); }
triples.forEach((t, i) => { if (i % N === S) { const e = evaluer(t); e.choix = t.map((x) => x.item); out.triples.push(e); } });
// C. un triple « cohérent » par métier : trois choix pris au hasard parmi ceux que le métier porte
base.forEach((m, idx) => {
  if (idx % N !== S) { return; }
  const portes = []; [m, m.signatureRome].forEach((sig) => { if (!sig) { return; } ids.forEach((c) => { if ((sig[c.cat] || []).some((x) => corr(c.item, x)) && !portes.some((p) => p.item === c.item)) { portes.push(c); } }); });
  const pris = []; const pool = portes.slice(); while (pris.length < 3 && pool.length) { pris.push(pool.splice(Math.floor(alea() * pool.length), 1)[0]); }
  const e = evaluer(pris, m); e.nom = m.nom; e.secteur = m.secteur; e.choix = pris.map((x) => x.item); out.coherents.push(e);
});
fs.writeFileSync('combos_' + shard + '.json', JSON.stringify(out));
console.log('fini', shard);
